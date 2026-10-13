var e={id:`enterprise-networks`,h:{en:`How enterprise networks are built: the reference design`,hi:`Enterprise networks kaise bante hain: reference design`},body:{en:`
<p>Think of a large company as a city. The <b>campus</b> is the residential area where people live and work. The <b>data center</b> is the power station and water works: few people, but everything depends on it. The <b>WAN</b> is the highway network to other cities (branches). The <b>internet edge</b> is the airport to the outside world, with customs (firewalls). The <b>cloud edge</b> is a new satellite town the company rents rather than builds. An enterprise network engineer must know how every part connects, because tickets never respect boundaries.</p>

<h3>The five building blocks</h3>
<dl class="terms">
<dt>Campus</dt><dd>The LAN in one or more buildings that connects users, phones, printers and access points. Built in <b>tiers</b>: <b>access</b> (where endpoints plug in, PoE, port security, 802.1X), <b>distribution</b> (aggregates access switches, default gateways, policy, summarisation) and <b>core</b> (fast, simple transport between distribution blocks, data center and WAN edge).</dd>
<dt>Data center</dt><dd>Where the servers live. Modern data centers use a <b>spine-leaf</b> fabric, often with VXLAN; ENCOR only needs the concepts (the CCNP Data Center track covers the rest).</dd>
<dt>WAN</dt><dd>Connects branches to headquarters. Options: an <b>MPLS L3VPN</b> from a provider, <b>internet broadband</b> with IPsec or DMVPN overlays, <b>Catalyst SD-WAN</b> which builds a controller-managed overlay over any transport, and LTE or 5G as backup.</dd>
<dt>Internet edge</dt><dd>Routers and firewalls that connect to one or more ISPs, usually with eBGP, NAT and security services.</dd>
<dt>Cloud edge</dt><dd>Virtual routers (for example a Catalyst 8000V) or SD-WAN cloud gateways inside a public cloud, connected back over IPsec or the SD-WAN fabric.</dd>
</dl>

<h3>Two-tier or three-tier campus?</h3>
<p>In a small or medium campus, distribution and core are merged into one pair of switches: the <b>collapsed core</b> or two-tier design. It saves money and is easy to run. When you have many buildings, each with its own distribution pair, connecting every distribution pair to every other becomes a full mesh that does not scale; you add a dedicated <b>core</b> layer so each distribution block only connects to the core. That is the three-tier design. The ENCOR design module compares these in depth, along with Layer 2 access versus <b>routed access</b> (Layer 3 all the way to the access switch) and SD-Access.</p>

<h3>The reference design used throughout this track</h3>
<p>Every example in this module, and many in later modules, uses one fictional company, <b>NK Corp</b> (domain <code>nkcorp.example</code>). Learn it once and every output will make sense.</p>
<div class="dia"><svg viewBox="0 0 640 360" role="img" aria-label="NK Corp reference design">
<rect x="20" y="10" width="150" height="40" rx="8" fill="#fed7aa"/><text x="95" y="35" text-anchor="middle" class="svg-ink" font-size="13">Internet, ISP AS 64496</text>
<rect x="245" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN / MPLS</text>
<rect x="470" y="10" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="545" y="35" text-anchor="middle" class="svg-ink" font-size="13">Cloud: CLOUD-GW</text>
<rect x="120" y="85" width="110" height="40" rx="8" fill="#bae6fd"/><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">WAN1</text>
<rect x="260" y="85" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="110" text-anchor="middle" class="svg-ink" font-size="13">WAN2</text>
<rect x="470" y="85" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="110" text-anchor="middle" class="svg-ink" font-size="13">Branch BR1</text>
<rect x="120" y="160" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="175" y="185" text-anchor="middle" class="svg-ink" font-size="13">CORE1</text>
<rect x="260" y="160" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="315" y="185" text-anchor="middle" class="svg-ink" font-size="13">CORE2</text>
<rect x="20" y="235" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="260" text-anchor="middle" class="svg-ink" font-size="13">DIST1</text>
<rect x="150" y="235" width="110" height="40" rx="8" fill="#bae6fd"/><text x="205" y="260" text-anchor="middle" class="svg-ink" font-size="13">DIST2</text>
<rect x="330" y="235" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="395" y="260" text-anchor="middle" class="svg-ink" font-size="13">DC-SW1</text>
<rect x="20" y="310" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="75" y="335" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text>
<rect x="150" y="310" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="205" y="335" text-anchor="middle" class="svg-ink" font-size="13">ACC2</text>
<rect x="330" y="310" width="130" height="40" rx="8" fill="#fde68a"/><text x="395" y="335" text-anchor="middle" class="svg-ink" font-size="13">ERP 10.10.20.10</text>
<line x1="95" y1="50" x2="175" y2="85" stroke="#64748b" stroke-width="2"/><line x1="95" y1="50" x2="315" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="50" x2="175" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="315" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="395" y1="30" x2="470" y2="30" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="395" y1="45" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="175" y1="125" x2="175" y2="160" stroke="#64748b" stroke-width="2"/><line x1="315" y1="125" x2="315" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="180" x2="260" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="160" y1="200" x2="75" y2="235" stroke="#64748b" stroke-width="2"/><line x1="185" y1="200" x2="205" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="200" x2="95" y2="235" stroke="#64748b" stroke-width="2"/><line x1="300" y1="200" x2="225" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="210" y1="200" x2="370" y2="235" stroke="#64748b" stroke-width="2"/><line x1="330" y1="200" x2="410" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="60" y1="275" x2="60" y2="310" stroke="#64748b" stroke-width="2"/><line x1="100" y1="275" x2="190" y2="310" stroke="#64748b" stroke-width="2"/>
<line x1="180" y1="275" x2="90" y2="310" stroke="#64748b" stroke-width="2"/><line x1="220" y1="275" x2="220" y2="310" stroke="#64748b" stroke-width="2"/>
<line x1="395" y1="275" x2="395" y2="310" stroke="#64748b" stroke-width="2"/>
<text x="490" y="185" class="svg-accent" font-size="12">Core: OSPF area 0</text>
<text x="490" y="260" class="svg-muted" font-size="12">DC 10.10.0.0/16</text>
<text x="490" y="335" class="svg-muted" font-size="12">HQ users 10.1.0.0/16</text>
</svg><p class="cap">NK Corp: a three-tier HQ campus, a small data center, dual WAN edge routers, one branch and a cloud gateway.</p></div>
<table class="cmp"><tr><th>Device</th><th>Role</th><th>Key facts</th></tr>
<tr><td>ACC1, ACC2</td><td>Access switches (Catalyst 9300)</td><td>VLAN 10 users 10.1.10.0/24, VLAN 20 voice 10.1.20.0/24, VLAN 30 wireless 10.1.30.0/24, VLAN 99 management 10.1.99.0/24</td></tr>
<tr><td>DIST1, DIST2</td><td>Distribution (Catalyst 9500)</td><td>SVIs .2 and .3 in each VLAN, HSRP virtual gateway .1, STP root for the user VLANs</td></tr>
<tr><td>CORE1, CORE2</td><td>Core (Catalyst 9500)</td><td>Routed links only, OSPF area 0, loopbacks 10.255.0.1 and 10.255.0.2</td></tr>
<tr><td>DC-SW1</td><td>Data center switch</td><td>Servers 10.10.20.0/24, ERP server 10.10.20.10</td></tr>
<tr><td>WAN1, WAN2</td><td>WAN and internet edge (Catalyst 8300)</td><td>eBGP to ISP AS 64496 from NK Corp AS 65001, public range 203.0.113.0/24, NAT for users</td></tr>
<tr><td>BR1</td><td>Branch router (Catalyst 8200)</td><td>Branch users 10.2.10.0/24, reached over the SD-WAN/MPLS WAN</td></tr>
<tr><td>CLOUD-GW</td><td>Catalyst 8000V in a public cloud</td><td>Cloud workloads 10.50.0.0/16</td></tr>
</table>
<p>IPv6 follows the same pattern: HQ uses <code>2001:db8:1::/48</code> (VLAN 10 is <code>2001:db8:1:10::/64</code>), the branch uses <code>2001:db8:2::/48</code>. All addresses are private or documentation ranges.</p>

<h3>Why the design matters when you troubleshoot</h3>
<p>Each tier has a job, and faults usually show up where a job is done. A user cannot get an IP address: think access and distribution (DHCP relay on the SVI). One building is slow: think distribution uplinks or STP. The whole company loses one application: think data center or core. Branches fail but HQ works: think WAN edge. Knowing the reference design lets you guess the right layer first, which is half of fast troubleshooting.</p>

<div class="eg"><p><b>Worked example: walking a flow.</b> A phone in VLAN 20 on ACC1 calls a branch phone. The frame goes ACC1 to DIST1 (the HSRP active gateway 10.1.20.1), is routed to CORE1, then to WAN1, across the SD-WAN fabric to BR1, and down to the branch switch. Five devices, three routing hops inside NK Corp, and one overlay. If voice quality is poor, every one of those hops needs matching QoS.</p></div>

<p>You can confirm the physical picture from the CLI with CDP (or LLDP on multi-vendor networks):</p>
<pre class="code">DIST1# show cdp neighbors
<span class="c">! lists directly connected Cisco devices, the local port and the remote port</span></pre>
<pre class="out">Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
<span class="hl">CORE1.nkcorp.example
                 Ten 1/0/1         151             R S I  C9500-24Y Ten 1/0/3</span>
CORE2.nkcorp.example
                 Ten 1/0/2         163             R S I  C9500-24Y Ten 1/0/3
ACC1.nkcorp.example
                 Ten 1/0/5         140              S I   C9300-48P Ten 1/1/1
ACC2.nkcorp.example
                 Ten 1/0/6         138              S I   C9300-48P Ten 1/1/1

Total cdp entries displayed : 4</pre>

<div class="warn"><p><b>Common mistake.</b> Stretching VLANs across the core "because it is easy". A VLAN that spans buildings makes one STP domain and one broadcast domain for the whole campus, so a loop in one building takes down all of them. Keep Layer 2 inside the distribution block and route between blocks.</p></div>

<div class="exam"><p><b>Exam trap.</b> The core layer should be fast and simple: no access policies, no endpoints, no complex filtering. Questions that put QoS classification, 802.1X or port security in the core are describing the wrong layer; those belong at the access layer.</p></div>

<div class="scn"><h4>The campus that grew by accident</h4><p>A hospital started with a collapsed core in one building. Over eight years it added five buildings, each connected to the same core pair with trunks carrying every VLAN. One night a technician patched a small unmanaged switch into two wall ports in a ward. The broadcast storm spread through every building because all VLANs were stretched. The redesign added a routed core, kept each building's VLANs inside its own distribution pair, and enabled BPDU guard on access ports.</p><p><b>Lesson:</b> tiers are failure-domain boundaries. Route between blocks so one mistake stays in one building.</p></div>

<div class="iv"><p class="q">"Describe the enterprise network you have worked on."</p><p>Interviewers ask this to test whether you see the whole picture. Walk top to bottom: internet edge and WAN (how many ISPs, BGP or static, SD-WAN or MPLS), core (routed, which IGP), distribution (gateways, FHRP, STP root), access (VLANs, PoE, 802.1X), data center and cloud connectivity. Mention redundancy at each layer and one incident you handled. If you are a fresher, describe your lab topology the same way.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enterprise = campus + data center + WAN + internet edge + cloud edge; tickets cross all of them.</li>
<li>Campus tiers: access (endpoints, policy), distribution (gateways, aggregation), core (fast transport). Two-tier merges core and distribution.</li>
<li>A dedicated core appears when many distribution blocks would otherwise need a full mesh.</li>
<li>Tiers are failure-domain boundaries: keep VLANs inside a distribution block, route between blocks.</li>
<li>NK Corp reference: users 10.1.x.0/24, DC 10.10.0.0/16, branch 10.2.0.0/16, cloud 10.50.0.0/16, AS 65001 to ISP AS 64496.</li>
</ul></div>
`,hi:`
<p>Ek badi company ko ek sheher ki tarah socho. <b>Campus</b> residential area hai jahan log rehte aur kaam karte hain. <b>Data center</b> power station aur water works hai: kam log, par sab kuch uspar depend karta hai. <b>WAN</b> doosre shehron (branches) tak highway network hai. <b>Internet edge</b> bahar ki duniya tak airport hai, customs (firewalls) ke saath. <b>Cloud edge</b> ek naya satellite town hai jo company banati nahi, kiraye par leti hai. Enterprise network engineer ko pata hona chahiye ki har hissa kaise judta hai, kyunki tickets kabhi boundaries ki izzat nahi karte.</p>

<h3>Paanch building blocks</h3>
<dl class="terms">
<dt>Campus</dt><dd>Ek ya zyada buildings ka LAN jo users, phones, printers aur access points ko jodta hai. <b>Tiers</b> mein banta hai: <b>access</b> (jahan endpoints plug hote hain, PoE, port security, 802.1X), <b>distribution</b> (access switches ko aggregate karta hai, default gateways, policy, summarisation) aur <b>core</b> (distribution blocks, data center aur WAN edge ke beech fast, simple transport).</dd>
<dt>Data center</dt><dd>Jahan servers rehte hain. Modern data centers <b>spine-leaf</b> fabric use karte hain, aksar VXLAN ke saath; ENCOR ko sirf concepts chahiye (baaki CCNP Data Center track cover karta hai).</dd>
<dt>WAN</dt><dd>Branches ko headquarters se jodta hai. Options: provider se <b>MPLS L3VPN</b>, IPsec ya DMVPN overlays ke saath <b>internet broadband</b>, <b>Catalyst SD-WAN</b> jo kisi bhi transport par controller-managed overlay banata hai, aur backup ke liye LTE ya 5G.</dd>
<dt>Internet edge</dt><dd>Routers aur firewalls jo ek ya zyada ISPs se judte hain, aam taur par eBGP, NAT aur security services ke saath.</dd>
<dt>Cloud edge</dt><dd>Public cloud ke andar virtual routers (jaise Catalyst 8000V) ya SD-WAN cloud gateways, jo IPsec ya SD-WAN fabric par wapas jude hote hain.</dd>
</dl>

<h3>Two-tier ya three-tier campus?</h3>
<p>Chhote ya medium campus mein distribution aur core switches ke ek pair mein merge ho jaate hain: <b>collapsed core</b> ya two-tier design. Yeh paisa bachata hai aur chalana aasaan hai. Jab bahut saari buildings hon, har ek ka apna distribution pair ho, to har distribution pair ko har doosre se jodna ek full mesh ban jaata hai jo scale nahi karta; aap ek dedicated <b>core</b> layer jodte ho taaki har distribution block sirf core se jude. Yahi three-tier design hai. ENCOR design module inhe depth mein compare karta hai, saath mein Layer 2 access versus <b>routed access</b> (access switch tak Layer 3) aur SD-Access.</p>

<h3>Is track mein use hone wala reference design</h3>
<p>Is module ka har example, aur aage ke kai modules ke examples, ek fictional company use karte hain, <b>NK Corp</b> (domain <code>nkcorp.example</code>). Ise ek baar seekh lo aur har output samajh aayega.</p>
<div class="dia"><svg viewBox="0 0 640 360" role="img" aria-label="NK Corp reference design">
<rect x="20" y="10" width="150" height="40" rx="8" fill="#fed7aa"/><text x="95" y="35" text-anchor="middle" class="svg-ink" font-size="13">Internet, ISP AS 64496</text>
<rect x="245" y="10" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN / MPLS</text>
<rect x="470" y="10" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="545" y="35" text-anchor="middle" class="svg-ink" font-size="13">Cloud: CLOUD-GW</text>
<rect x="120" y="85" width="110" height="40" rx="8" fill="#bae6fd"/><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">WAN1</text>
<rect x="260" y="85" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="110" text-anchor="middle" class="svg-ink" font-size="13">WAN2</text>
<rect x="470" y="85" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="110" text-anchor="middle" class="svg-ink" font-size="13">Branch BR1</text>
<rect x="120" y="160" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="175" y="185" text-anchor="middle" class="svg-ink" font-size="13">CORE1</text>
<rect x="260" y="160" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="315" y="185" text-anchor="middle" class="svg-ink" font-size="13">CORE2</text>
<rect x="20" y="235" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="260" text-anchor="middle" class="svg-ink" font-size="13">DIST1</text>
<rect x="150" y="235" width="110" height="40" rx="8" fill="#bae6fd"/><text x="205" y="260" text-anchor="middle" class="svg-ink" font-size="13">DIST2</text>
<rect x="330" y="235" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="395" y="260" text-anchor="middle" class="svg-ink" font-size="13">DC-SW1</text>
<rect x="20" y="310" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="75" y="335" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text>
<rect x="150" y="310" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="205" y="335" text-anchor="middle" class="svg-ink" font-size="13">ACC2</text>
<rect x="330" y="310" width="130" height="40" rx="8" fill="#fde68a"/><text x="395" y="335" text-anchor="middle" class="svg-ink" font-size="13">ERP 10.10.20.10</text>
<line x1="95" y1="50" x2="175" y2="85" stroke="#64748b" stroke-width="2"/><line x1="95" y1="50" x2="315" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="50" x2="175" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="315" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="395" y1="30" x2="470" y2="30" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="395" y1="45" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="175" y1="125" x2="175" y2="160" stroke="#64748b" stroke-width="2"/><line x1="315" y1="125" x2="315" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="230" y1="180" x2="260" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="160" y1="200" x2="75" y2="235" stroke="#64748b" stroke-width="2"/><line x1="185" y1="200" x2="205" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="200" x2="95" y2="235" stroke="#64748b" stroke-width="2"/><line x1="300" y1="200" x2="225" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="210" y1="200" x2="370" y2="235" stroke="#64748b" stroke-width="2"/><line x1="330" y1="200" x2="410" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="60" y1="275" x2="60" y2="310" stroke="#64748b" stroke-width="2"/><line x1="100" y1="275" x2="190" y2="310" stroke="#64748b" stroke-width="2"/>
<line x1="180" y1="275" x2="90" y2="310" stroke="#64748b" stroke-width="2"/><line x1="220" y1="275" x2="220" y2="310" stroke="#64748b" stroke-width="2"/>
<line x1="395" y1="275" x2="395" y2="310" stroke="#64748b" stroke-width="2"/>
<text x="490" y="185" class="svg-accent" font-size="12">Core: OSPF area 0</text>
<text x="490" y="260" class="svg-muted" font-size="12">DC 10.10.0.0/16</text>
<text x="490" y="335" class="svg-muted" font-size="12">HQ users 10.1.0.0/16</text>
</svg><p class="cap">NK Corp: three-tier HQ campus, chhota data center, dual WAN edge routers, ek branch aur ek cloud gateway.</p></div>
<table class="cmp"><tr><th>Device</th><th>Role</th><th>Key facts</th></tr>
<tr><td>ACC1, ACC2</td><td>Access switches (Catalyst 9300)</td><td>VLAN 10 users 10.1.10.0/24, VLAN 20 voice 10.1.20.0/24, VLAN 30 wireless 10.1.30.0/24, VLAN 99 management 10.1.99.0/24</td></tr>
<tr><td>DIST1, DIST2</td><td>Distribution (Catalyst 9500)</td><td>Har VLAN mein SVIs .2 aur .3, HSRP virtual gateway .1, user VLANs ke liye STP root</td></tr>
<tr><td>CORE1, CORE2</td><td>Core (Catalyst 9500)</td><td>Sirf routed links, OSPF area 0, loopbacks 10.255.0.1 aur 10.255.0.2</td></tr>
<tr><td>DC-SW1</td><td>Data center switch</td><td>Servers 10.10.20.0/24, ERP server 10.10.20.10</td></tr>
<tr><td>WAN1, WAN2</td><td>WAN aur internet edge (Catalyst 8300)</td><td>NK Corp AS 65001 se ISP AS 64496 tak eBGP, public range 203.0.113.0/24, users ke liye NAT</td></tr>
<tr><td>BR1</td><td>Branch router (Catalyst 8200)</td><td>Branch users 10.2.10.0/24, SD-WAN/MPLS WAN ke through pahuncha jaata hai</td></tr>
<tr><td>CLOUD-GW</td><td>Public cloud mein Catalyst 8000V</td><td>Cloud workloads 10.50.0.0/16</td></tr>
</table>
<p>IPv6 bhi same pattern follow karta hai: HQ <code>2001:db8:1::/48</code> use karta hai (VLAN 10 <code>2001:db8:1:10::/64</code> hai), branch <code>2001:db8:2::/48</code> use karti hai. Saare addresses private ya documentation ranges hain.</p>

<h3>Troubleshoot karte waqt design kyun matter karta hai</h3>
<p>Har tier ka ek kaam hai, aur faults aam taur par wahin dikhte hain jahan woh kaam hota hai. User ko IP address nahi mil raha: access aur distribution socho (SVI par DHCP relay). Ek building slow hai: distribution uplinks ya STP socho. Poori company ek application kho deti hai: data center ya core socho. Branches fail hain par HQ chal raha hai: WAN edge socho. Reference design jaanne se aap pehle sahi layer guess kar paate ho, jo fast troubleshooting ka aadha hissa hai.</p>

<div class="eg"><p><b>Worked example: ek flow par chalna.</b> ACC1 par VLAN 20 ka ek phone branch phone ko call karta hai. Frame ACC1 se DIST1 (HSRP active gateway 10.1.20.1) jaata hai, CORE1 tak route hota hai, phir WAN1, SD-WAN fabric ke across BR1, aur neeche branch switch tak. Paanch devices, NK Corp ke andar teen routing hops, aur ek overlay. Agar voice quality kharab hai, to in sab hops par matching QoS chahiye.</p></div>

<p>Aap CLI se physical picture CDP (ya multi-vendor networks par LLDP) se confirm kar sakte ho:</p>
<pre class="code">DIST1# show cdp neighbors
<span class="c">! directly connected Cisco devices, local port aur remote port list karta hai</span></pre>
<pre class="out">Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
<span class="hl">CORE1.nkcorp.example
                 Ten 1/0/1         151             R S I  C9500-24Y Ten 1/0/3</span>
CORE2.nkcorp.example
                 Ten 1/0/2         163             R S I  C9500-24Y Ten 1/0/3
ACC1.nkcorp.example
                 Ten 1/0/5         140              S I   C9300-48P Ten 1/1/1
ACC2.nkcorp.example
                 Ten 1/0/6         138              S I   C9300-48P Ten 1/1/1

Total cdp entries displayed : 4</pre>

<div class="warn"><p><b>Common galti.</b> VLANs ko core ke across "kyunki aasaan hai" stretch karna. Buildings ke across phaila VLAN poore campus ke liye ek STP domain aur ek broadcast domain bana deta hai, isliye ek building ka loop sabko gira deta hai. Layer 2 ko distribution block ke andar rakho aur blocks ke beech route karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Core layer fast aur simple honi chahiye: koi access policies nahi, koi endpoints nahi, koi complex filtering nahi. Jo questions QoS classification, 802.1X ya port security ko core mein rakhte hain, woh galat layer describe kar rahe hain; yeh access layer ke kaam hain.</p></div>

<div class="scn"><h4>Campus jo galti se bada ho gaya</h4><p>Ek hospital ne ek building mein collapsed core se shuru kiya. Aath saal mein usne paanch buildings jodi, har ek same core pair se trunks ke saath judi jo har VLAN le jaate the. Ek raat ek technician ne ek chhota unmanaged switch ward ke do wall ports mein patch kar diya. Broadcast storm har building mein phail gaya kyunki saare VLANs stretched the. Redesign mein routed core joda gaya, har building ke VLANs uske apne distribution pair ke andar rakhe gaye, aur access ports par BPDU guard enable kiya gaya.</p><p><b>Seekh:</b> tiers failure-domain boundaries hain. Blocks ke beech route karo taaki ek galti ek hi building mein rahe.</p></div>

<div class="iv"><p class="q">"Jis enterprise network par aapne kaam kiya hai use describe karo."</p><p>Interviewers yeh dekhne ke liye poochte hain ki aap poori picture dekhte ho ya nahi. Upar se neeche chalo: internet edge aur WAN (kitne ISPs, BGP ya static, SD-WAN ya MPLS), core (routed, kaunsa IGP), distribution (gateways, FHRP, STP root), access (VLANs, PoE, 802.1X), data center aur cloud connectivity. Har layer par redundancy aur ek incident jo aapne handle kiya, mention karo. Agar aap fresher ho, to apni lab topology isi tarah describe karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enterprise = campus + data center + WAN + internet edge + cloud edge; tickets in sab ko cross karte hain.</li>
<li>Campus tiers: access (endpoints, policy), distribution (gateways, aggregation), core (fast transport). Two-tier core aur distribution ko merge karta hai.</li>
<li>Dedicated core tab aata hai jab bahut saare distribution blocks ko warna full mesh chahiye hota.</li>
<li>Tiers failure-domain boundaries hain: VLANs ko distribution block ke andar rakho, blocks ke beech route karo.</li>
<li>NK Corp reference: users 10.1.x.0/24, DC 10.10.0.0/16, branch 10.2.0.0/16, cloud 10.50.0.0/16, AS 65001 se ISP AS 64496.</li>
</ul></div>
`}};export{e as default};