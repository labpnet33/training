var e={id:`vtep-nve`,h:{en:`VTEPs, the NVE interface and VLAN-to-VNI mapping`,hi:`VTEPs, NVE interface aur VLAN-to-VNI mapping`},body:{en:`
<p>Every airport has an international terminal. Passengers from domestic flights walk in with a local boarding pass; the terminal checks them, puts them on an international flight with a new ticket number, and at the far end another terminal does the reverse. Passengers never deal with the airline's route network. In VXLAN, that terminal is the <b>VTEP</b>, and on a Nexus switch the terminal building has a name: <b>interface nve1</b>.</p>

<h3>What a VTEP is</h3>
<p>A <b>VTEP (VXLAN Tunnel End Point)</b> is the device that encapsulates frames into VXLAN on the way into the overlay and decapsulates them on the way out. It has two faces:</p>
<ul>
<li>A <b>local face</b> towards servers: ordinary access or trunk ports in VLANs, with normal MAC learning.</li>
<li>A <b>fabric face</b> towards the underlay: one IP address, the VTEP address, which is the source of every VXLAN packet it sends and the destination of every VXLAN packet sent to it.</li>
</ul>
<p>In a spine-leaf fabric the VTEPs are the <b>leaves</b>. The spines are not VTEPs; they simply route the outer IP packets between leaf loopbacks and never look inside.</p>

<h3>The NVE interface on NX-OS</h3>
<p>Cisco calls the logical VTEP interface the <b>NVE (Network Virtualization Edge)</b> interface. On Nexus 9000 you create exactly one: <code>interface nve1</code>. Under it you configure:</p>
<ul>
<li><code>source-interface loopback1</code>: which loopback supplies the VTEP IP address.</li>
<li><code>member vni 10010</code>: which VNIs this VTEP participates in, and under each member how BUM traffic is replicated (<code>ingress-replication protocol static</code> with <code>peer-ip</code> entries, or <code>mcast-group</code>).</li>
<li><code>no shutdown</code>: like any interface, nve1 must be enabled.</li>
</ul>
<p>Two features must be enabled first: <code>feature nv overlay</code> (the VXLAN/NVE machinery) and <code>feature vn-segment-vlan-based</code> (allows <code>vn-segment</code> under a VLAN).</p>

<h3>Why a loopback, and why loopback1?</h3>
<p>A physical uplink can fail; a loopback never goes down while the switch is alive. The underlay advertises the loopback, so it stays reachable through <b>any</b> remaining uplink, and ECMP uses all of them. Many designs use a <b>separate loopback1</b> for the VTEP and keep loopback0 as the routing protocol router-id. This separation matters later: with vPC, both switches of a pair share a secondary (anycast) VTEP address on the NVE loopback, which must not disturb the router-id. The lab follows this best practice: loopback0 = 10.255.0.x, loopback1 = 10.254.0.x.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Inside a VTEP">
<rect x="20" y="20" width="600" height="150" rx="10" fill="#e2e8f0"/><text x="40" y="42" class="svg-ink" font-size="13">LEAF1 (VTEP)</text>
<rect x="40" y="60" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="115" y="85" text-anchor="middle" class="svg-ink" font-size="12">Eth1/5 access VLAN 10</text>
<rect x="240" y="60" width="150" height="40" rx="6" fill="#fde68a"/><text x="315" y="80" text-anchor="middle" class="svg-ink" font-size="12">vlan 10</text><text x="315" y="95" text-anchor="middle" class="svg-muted" font-size="12">vn-segment 10010</text>
<rect x="440" y="60" width="160" height="40" rx="6" fill="#bae6fd"/><text x="520" y="80" text-anchor="middle" class="svg-ink" font-size="12">nve1</text><text x="520" y="95" text-anchor="middle" class="svg-muted" font-size="12">member vni 10010</text>
<rect x="440" y="115" width="160" height="40" rx="6" fill="#ddd6fe"/><text x="520" y="140" text-anchor="middle" class="svg-ink" font-size="12">loopback1 10.254.0.1</text>
<line x1="190" y1="80" x2="240" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/><line x1="520" y1="100" x2="520" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="100" y="120" width="120" height="36" rx="6" fill="#fed7aa"/><text x="160" y="143" text-anchor="middle" class="svg-ink" font-size="12">SRV1</text><line x1="115" y1="100" x2="150" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="520" y1="170" x2="520" y2="205" stroke="#64748b" stroke-width="3"/><text x="520" y="225" text-anchor="middle" class="svg-accent" font-size="12">VXLAN to underlay (Eth1/1, Eth1/2)</text>
</svg><p class="cap">Access port → local VLAN → VNI → nve1 → loopback1 address → routed uplinks.</p></div>

<h3>VLAN-to-VNI mapping with vn-segment</h3>
<p>On a Nexus leaf the server still connects to an access port in a VLAN. The line <code>vn-segment 10010</code> under <code>vlan 10</code> tells the switch "frames in local VLAN 10 belong to VNI 10010". Rules to remember:</p>
<ul>
<li>One VLAN maps to one VNI on a given switch, and one VNI to one VLAN.</li>
<li>The VNI is <b>global</b> across the fabric; the VLAN is <b>local</b> to the leaf. LEAF1 could use VLAN 10 and LEAF2 VLAN 110 for the same VNI 10010, and the servers would still be in one segment.</li>
<li>Both the mapping (<code>vn-segment</code>) and the membership (<code>member vni</code> under nve1) are needed. A mapped VLAN without a member VNI goes nowhere; a member VNI without a mapped VLAN shows as unconfigured.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Tenant ACME has web (VNI 10010), app (VNI 10020) and db (VNI 10030). LEAF1 hosts web and app servers: VLAN 10 → 10010, VLAN 20 → 10020. LEAF2 hosts web and db: VLAN 10 → 10010, VLAN 30 → 10030. LEAF1's nve1 has members 10010 and 10020; LEAF2's has 10010 and 10030. Only VNI 10010 is shared, so only web traffic flows between these two leaves.</p></div>

<h3>Checking the VTEP</h3>
<pre class="out">LEAF1# show nve interface nve1 detail
Interface: nve1, State: Up, encapsulation: VXLAN
 VPC Capability: VPC-VIP-Only [not-notified]
 Local Router MAC: 5254.0012.a001
 Host Learning Mode: Data-Plane
 <span class="hl">Source-Interface: loopback1 (primary: 10.254.0.1, secondary: 0.0.0.0)</span>
 Source Interface State: Up
 NVE Flags:
 Interface Handle: 0x49000001</pre>
<p>Look for State Up, Host Learning Mode Data-Plane (flood and learn) and the primary address of the source interface. A primary of 0.0.0.0 means the loopback has no address.</p>

<h3>Hardware and software VTEPs</h3>
<table class="cmp"><tr><th></th><th>Hardware VTEP</th><th>Software VTEP</th></tr>
<tr><td>Where</td><td>Leaf switch ASIC (Nexus 9000 and similar)</td><td>Hypervisor or host kernel (Linux bridge, Open vSwitch, virtual switch in NSX-style platforms)</td></tr>
<tr><td>Performance</td><td>Line rate, no CPU cost</td><td>Uses host CPU; offload NICs help</td></tr>
<tr><td>Typical use</td><td>Bare-metal servers, storage, appliances, whole-rack VLANs</td><td>VM-to-VM overlays inside a virtualisation platform</td></tr>
</table>
<p>They can interoperate because the encapsulation is standard, but they must agree on UDP port, VNI and replication method.</p>

<h3>Layer 2 gateway and Layer 3 gateway</h3>
<p>A <b>VXLAN Layer 2 gateway</b> bridges between a VLAN and a VNI: that is what every leaf in this module does. A <b>VXLAN Layer 3 gateway</b> also <b>routes</b> between VNIs, or from a VNI to the outside world, using an SVI for the VLAN. In flood-and-learn designs the Layer 3 gateway is usually <b>centralised</b> on one pair of switches (often with HSRP), so traffic between subnets hairpins through that pair. BGP EVPN adds the <b>distributed anycast gateway</b>, where every leaf routes locally; you will build it in the next module.</p>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>no shutdown</code> on nve1, or using a loopback that exists but is not advertised into the underlay. The first shows nve1 Down; the second shows nve1 Up locally but no remote VTEP can reach you, so traffic only leaves and never returns.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>member vni</code> goes under <b>interface nve1</b>; <code>vn-segment</code> goes under <b>vlan</b>. Answers like "member vni under vlan 10" or "vn-segment under nve1" are wrong.</p></div>

<div class="scn"><h4>The loopback that shared the router-id</h4><p>An engineer built nve1 with <code>source-interface loopback0</code>, the OSPF router-id loopback. It worked, until the team converted two leaves into a vPC pair and configured a shared secondary address for the VTEP. Changing the loopback triggered OSPF churn during a maintenance window and briefly disturbed the fabric. The redesign moved the VTEP to a dedicated loopback1 on every leaf, leaving loopback0 untouched for routing.</p><p><b>Lesson:</b> give the VTEP its own loopback. It keeps overlay changes away from underlay routing identity.</p></div>

<div class="iv"><p class="q">"What is a VTEP and how do you configure one on a Nexus?"</p><p>Strong answer: a VTEP encapsulates and decapsulates VXLAN; on Nexus it is interface nve1. Enable feature nv overlay and feature vn-segment-vlan-based, map each VLAN to a VNI with vn-segment, create nve1 with a dedicated loopback as source-interface, add member vni for each VNI with a BUM replication method, and no shutdown. Mention that the loopback must be advertised in the underlay and that the VNI, not the VLAN, must match across leaves.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VTEP encapsulates/decapsulates VXLAN; in spine-leaf the leaves are VTEPs, spines are not.</li>
<li>On Nexus the VTEP is interface nve1 with a loopback as source-interface.</li>
<li>vlan X / vn-segment Y maps local VLAN to global VNI; member vni under nve1 activates it.</li>
<li>Hardware VTEPs live in switch ASICs; software VTEPs live in hypervisors.</li>
<li>L2 gateway bridges VLAN and VNI; L3 gateway routes between VNIs.</li>
</ul></div>
`,hi:`
<p>Har airport par ek international terminal hota hai. Domestic flights ke passengers local boarding pass ke saath andar aate hain; terminal unhe check karta hai, naye ticket number ke saath international flight par bitha deta hai, aur doosre end par doosra terminal ulta kaam karta hai. Passengers ko airline ke route network se kabhi deal nahi karna padta. VXLAN mein woh terminal <b>VTEP</b> hai, aur Nexus switch par us terminal building ka ek naam hai: <b>interface nve1</b>.</p>

<h3>VTEP kya hai</h3>
<p><b>VTEP (VXLAN Tunnel End Point)</b> woh device hai jo overlay mein jaate waqt frames ko VXLAN mein encapsulate karta hai aur bahar aate waqt decapsulate karta hai. Iske do chehre hote hain:</p>
<ul>
<li>Servers ki taraf ek <b>local face</b>: VLANs mein normal access ya trunk ports, normal MAC learning ke saath.</li>
<li>Underlay ki taraf ek <b>fabric face</b>: ek IP address, VTEP address, jo uske bheje har VXLAN packet ka source hai aur use bheje gaye har VXLAN packet ka destination.</li>
</ul>
<p>Spine-leaf fabric mein VTEPs <b>leaves</b> hote hain. Spines VTEPs nahi hote; woh bas leaf loopbacks ke beech outer IP packets route karte hain aur kabhi andar nahi dekhte.</p>

<h3>NX-OS par NVE interface</h3>
<p>Cisco logical VTEP interface ko <b>NVE (Network Virtualization Edge)</b> interface kehta hai. Nexus 9000 par aap exactly ek banate ho: <code>interface nve1</code>. Iske neeche aap configure karte ho:</p>
<ul>
<li><code>source-interface loopback1</code>: kaunsa loopback VTEP IP address dega.</li>
<li><code>member vni 10010</code>: yeh VTEP kin VNIs mein participate karta hai, aur har member ke neeche BUM traffic kaise replicate hoga (<code>peer-ip</code> entries ke saath <code>ingress-replication protocol static</code>, ya <code>mcast-group</code>).</li>
<li><code>no shutdown</code>: kisi bhi interface ki tarah nve1 ko enable karna padta hai.</li>
</ul>
<p>Pehle do features enable karne padte hain: <code>feature nv overlay</code> (VXLAN/NVE machinery) aur <code>feature vn-segment-vlan-based</code> (VLAN ke neeche <code>vn-segment</code> allow karta hai).</p>

<h3>Loopback kyun, aur loopback1 kyun?</h3>
<p>Physical uplink fail ho sakta hai; switch zinda rehte loopback kabhi down nahi hota. Underlay loopback ko advertise karta hai, isliye woh bache hue <b>kisi bhi</b> uplink se reachable rehta hai, aur ECMP sab use karta hai. Kai designs VTEP ke liye <b>alag loopback1</b> use karte hain aur loopback0 ko routing protocol router-id ke liye rakhte hain. Yeh separation baad mein matter karta hai: vPC mein pair ke dono switches NVE loopback par ek shared secondary (anycast) VTEP address rakhte hain, jo router-id ko disturb nahi karna chahiye. Lab isi best practice ko follow karta hai: loopback0 = 10.255.0.x, loopback1 = 10.254.0.x.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="VTEP ke andar">
<rect x="20" y="20" width="600" height="150" rx="10" fill="#e2e8f0"/><text x="40" y="42" class="svg-ink" font-size="13">LEAF1 (VTEP)</text>
<rect x="40" y="60" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="115" y="85" text-anchor="middle" class="svg-ink" font-size="12">Eth1/5 access VLAN 10</text>
<rect x="240" y="60" width="150" height="40" rx="6" fill="#fde68a"/><text x="315" y="80" text-anchor="middle" class="svg-ink" font-size="12">vlan 10</text><text x="315" y="95" text-anchor="middle" class="svg-muted" font-size="12">vn-segment 10010</text>
<rect x="440" y="60" width="160" height="40" rx="6" fill="#bae6fd"/><text x="520" y="80" text-anchor="middle" class="svg-ink" font-size="12">nve1</text><text x="520" y="95" text-anchor="middle" class="svg-muted" font-size="12">member vni 10010</text>
<rect x="440" y="115" width="160" height="40" rx="6" fill="#ddd6fe"/><text x="520" y="140" text-anchor="middle" class="svg-ink" font-size="12">loopback1 10.254.0.1</text>
<line x1="190" y1="80" x2="240" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/><line x1="520" y1="100" x2="520" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="100" y="120" width="120" height="36" rx="6" fill="#fed7aa"/><text x="160" y="143" text-anchor="middle" class="svg-ink" font-size="12">SRV1</text><line x1="115" y1="100" x2="150" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="520" y1="170" x2="520" y2="205" stroke="#64748b" stroke-width="3"/><text x="520" y="225" text-anchor="middle" class="svg-accent" font-size="12">Underlay ki taraf VXLAN (Eth1/1, Eth1/2)</text>
</svg><p class="cap">Access port → local VLAN → VNI → nve1 → loopback1 address → routed uplinks.</p></div>

<h3>vn-segment se VLAN-to-VNI mapping</h3>
<p>Nexus leaf par server ab bhi ek VLAN ke access port se judta hai. <code>vlan 10</code> ke neeche <code>vn-segment 10010</code> line switch ko batati hai "local VLAN 10 ke frames VNI 10010 ke hain". Yaad rakhne wale rules:</p>
<ul>
<li>Ek switch par ek VLAN ek VNI se map hota hai, aur ek VNI ek VLAN se.</li>
<li>VNI poore fabric mein <b>global</b> hai; VLAN leaf par <b>local</b> hai. LEAF1 same VNI 10010 ke liye VLAN 10 aur LEAF2 VLAN 110 use kar sakta hai, aur servers phir bhi ek segment mein honge.</li>
<li>Mapping (<code>vn-segment</code>) aur membership (nve1 ke neeche <code>member vni</code>) dono chahiye. Member VNI ke bina mapped VLAN kahin nahi jaata; mapped VLAN ke bina member VNI unconfigured dikhta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Tenant ACME ke paas web (VNI 10010), app (VNI 10020) aur db (VNI 10030) hain. LEAF1 web aur app servers host karta hai: VLAN 10 → 10010, VLAN 20 → 10020. LEAF2 web aur db host karta hai: VLAN 10 → 10010, VLAN 30 → 10030. LEAF1 ke nve1 ke members 10010 aur 10020 hain; LEAF2 ke 10010 aur 10030. Sirf VNI 10010 shared hai, isliye in do leaves ke beech sirf web traffic flow karta hai.</p></div>

<h3>VTEP check karna</h3>
<pre class="out">LEAF1# show nve interface nve1 detail
Interface: nve1, State: Up, encapsulation: VXLAN
 VPC Capability: VPC-VIP-Only [not-notified]
 Local Router MAC: 5254.0012.a001
 Host Learning Mode: Data-Plane
 <span class="hl">Source-Interface: loopback1 (primary: 10.254.0.1, secondary: 0.0.0.0)</span>
 Source Interface State: Up
 NVE Flags:
 Interface Handle: 0x49000001</pre>
<p>State Up, Host Learning Mode Data-Plane (flood and learn) aur source interface ka primary address dekho. Primary 0.0.0.0 ka matlab hai loopback par koi address nahi hai.</p>

<h3>Hardware aur software VTEPs</h3>
<table class="cmp"><tr><th></th><th>Hardware VTEP</th><th>Software VTEP</th></tr>
<tr><td>Kahan</td><td>Leaf switch ASIC (Nexus 9000 aur similar)</td><td>Hypervisor ya host kernel (Linux bridge, Open vSwitch, NSX jaise platforms ka virtual switch)</td></tr>
<tr><td>Performance</td><td>Line rate, CPU cost nahi</td><td>Host CPU use karta hai; offload NICs help karte hain</td></tr>
<tr><td>Typical use</td><td>Bare-metal servers, storage, appliances, poore rack ke VLANs</td><td>Virtualisation platform ke andar VM-to-VM overlays</td></tr>
</table>
<p>Encapsulation standard hone ki wajah se yeh interoperate kar sakte hain, lekin UDP port, VNI aur replication method par sehmat hona zaroori hai.</p>

<h3>Layer 2 gateway aur Layer 3 gateway</h3>
<p><b>VXLAN Layer 2 gateway</b> VLAN aur VNI ke beech bridge karta hai: is module mein har leaf yahi karta hai. <b>VXLAN Layer 3 gateway</b> VLAN ke SVI ka use karke VNIs ke beech, ya VNI se bahar ki duniya tak, <b>route</b> bhi karta hai. Flood-and-learn designs mein Layer 3 gateway aam taur par switches ke ek pair par <b>centralised</b> hota hai (aksar HSRP ke saath), isliye subnets ke beech ka traffic us pair se hairpin hota hai. BGP EVPN <b>distributed anycast gateway</b> laata hai, jahan har leaf locally route karta hai; yeh aap agle module mein banaoge.</p>

<div class="warn"><p><b>Common galti.</b> nve1 par <code>no shutdown</code> bhool jaana, ya aisa loopback use karna jo exist karta hai lekin underlay mein advertise nahi hua. Pehle case mein nve1 Down dikhta hai; doosre mein nve1 locally Up dikhta hai lekin koi remote VTEP aap tak nahi pahunch sakta, isliye traffic sirf jaata hai aur kabhi wapas nahi aata.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>member vni</code> <b>interface nve1</b> ke neeche jaata hai; <code>vn-segment</code> <b>vlan</b> ke neeche jaata hai. "vlan 10 ke neeche member vni" ya "nve1 ke neeche vn-segment" jaise answers galat hain.</p></div>

<div class="scn"><h4>Woh loopback jo router-id share karta tha</h4><p>Ek engineer ne nve1 ko <code>source-interface loopback0</code> ke saath banaya, jo OSPF router-id wala loopback tha. Kaam chal gaya, jab tak team ne do leaves ko vPC pair mein convert karke VTEP ke liye shared secondary address configure nahi kiya. Loopback badalne se maintenance window mein OSPF churn hua aur fabric thodi der disturb hua. Redesign mein har leaf par VTEP ko dedicated loopback1 par le jaaya gaya, aur loopback0 ko routing ke liye untouched chhoda gaya.</p><p><b>Seekh:</b> VTEP ko apna loopback do. Isse overlay changes underlay ki routing identity se door rehte hain.</p></div>

<div class="iv"><p class="q">"VTEP kya hai aur Nexus par ise kaise configure karte ho?"</p><p>Strong answer: VTEP VXLAN encapsulate aur decapsulate karta hai; Nexus par yeh interface nve1 hai. feature nv overlay aur feature vn-segment-vlan-based enable karo, har VLAN ko vn-segment se VNI par map karo, dedicated loopback ko source-interface bana kar nve1 banao, har VNI ke liye BUM replication method ke saath member vni add karo, aur no shutdown. Bataao ki loopback underlay mein advertised hona chahiye aur leaves ke beech VLAN nahi, VNI match hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VTEP VXLAN encapsulate/decapsulate karta hai; spine-leaf mein leaves VTEPs hain, spines nahi.</li>
<li>Nexus par VTEP interface nve1 hai jiska source-interface ek loopback hai.</li>
<li>vlan X / vn-segment Y local VLAN ko global VNI se map karta hai; nve1 ke neeche member vni use activate karta hai.</li>
<li>Hardware VTEPs switch ASICs mein rehte hain; software VTEPs hypervisors mein.</li>
<li>L2 gateway VLAN aur VNI ko bridge karta hai; L3 gateway VNIs ke beech route karta hai.</li>
</ul></div>
`}};export{e as default};