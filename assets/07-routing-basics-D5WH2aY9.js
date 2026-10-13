var e={id:`routing`,h:{en:`Routing basics: the routing table, ECMP and VRFs`,hi:`Routing basics: routing table, ECMP aur VRFs`},body:{en:`
<p>Think of a railway enquiry desk. For every destination it has a card saying "take platform 3, next stop Junction B". It does not know the whole journey, only the next step, and when two trains go the same way equally fast it lets passengers use both. A <b>router</b> works the same way: for each destination prefix it keeps the <b>next hop</b> and <b>outgoing interface</b>, and it can split traffic across equal paths. In a spine-leaf fabric every switch is a router, so reading a routing table is a daily skill.</p>

<h3>Where routes come from</h3>
<ul>
<li><b>Connected (direct)</b>: every up interface with an IP address adds its subnet. NX-OS also adds a <b>local</b> /32 for the interface address itself.</li>
<li><b>Static</b>: typed by an engineer, for example a default route on a border device or a route in the management VRF.</li>
<li><b>Dynamic</b>: learned from a routing protocol such as OSPF, IS-IS or BGP, which adapts automatically to failures (chapter 8).</li>
</ul>

<h3>How a router chooses: three rules in order</h3>
<ol>
<li><b>Longest prefix match.</b> The most specific matching prefix wins, whatever protocol it came from. A /32 beats a /24, which beats a /0 default.</li>
<li><b>Administrative distance (AD)</b>, called <b>preference</b> on NX-OS. If the same prefix is offered by different sources, the lowest AD is installed.</li>
<li><b>Metric.</b> Within one protocol, the lowest metric (cost) wins; equal metrics give <b>ECMP</b>.</li>
</ol>
<table class="cmp"><tr><th>Source</th><th>Default AD on NX-OS</th></tr>
<tr><td>Connected / local</td><td>0</td></tr><tr><td>Static</td><td>1</td></tr><tr><td>eBGP</td><td>20</td></tr><tr><td>EIGRP internal</td><td>90</td></tr><tr><td>OSPF</td><td>110</td></tr><tr><td>IS-IS</td><td>115</td></tr><tr><td>iBGP</td><td>200</td></tr></table>

<div class="eg"><p><b>Worked example: longest prefix match.</b> A leaf has 0.0.0.0/0 via the border, 10.10.0.0/16 via SPINE1 (OSPF) and 10.10.20.0/24 via a static route. A packet to 10.10.20.21 matches all three; the /24 is longest, so the static route wins. A packet to 10.10.99.5 matches /16 and /0; the /16 wins. A packet to 8.8.4.4 matches only the default. AD is only compared when the <b>prefix and length are identical</b>, for example a static 10.10.0.0/16 (AD 1) and OSPF 10.10.0.0/16 (AD 110): the static is installed.</p></div>

<h3>Reading show ip route on NX-OS</h3>
<pre class="out">LEAF1# show ip route
IP Route Table for VRF "default"
'*' denotes best ucast next-hop
'[x/y]' denotes [preference/metric]

10.10.10.0/24, ubest/mbest: 1/0, attached
    *via 10.10.10.1, Vlan10, [0/0], 3d02h, direct
10.10.10.1/32, ubest/mbest: 1/0, attached
    *via 10.10.10.1, Vlan10, [0/0], 3d02h, local
<span class="hl">10.255.0.2/32, ubest/mbest: 2/0
    *via 10.1.0.0, Eth1/49, [110/81], 3d01h, ospf-UNDERLAY, intra
    *via 10.1.1.0, Eth1/50, [110/81], 3d01h, ospf-UNDERLAY, intra</span></pre>
<p>Read the highlighted entry: prefix 10.255.0.2/32 (LEAF2's loopback), <b>ubest 2</b> means two best unicast next hops, both OSPF with preference 110 and metric 81, through the two spines. That is ECMP in action. <code>attached</code> marks connected subnets, <code>direct</code> and <code>local</code> are the NX-OS names for connected and interface-address routes.</p>

<h3>ECMP and hashing</h3>
<p>With ECMP the switch does not send packet 1 left and packet 2 right; that would reorder packets inside a TCP flow. Instead it computes a <b>hash</b> over header fields (source and destination IP, and usually protocol and L4 ports, the <b>5-tuple</b>) and maps each <b>flow</b> to one path. Many flows spread evenly; a single huge flow (an "elephant", such as one backup stream) stays on one link. If every switch uses the same hash input it can pick the same link at every tier (<b>polarisation</b>); vendors add a per-switch seed to avoid this. On NX-OS OSPF installs up to 8 equal paths by default (<code>maximum-paths</code> changes it); BGP installs 1 unless you configure <code>maximum-paths</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ECMP across spines">
<rect x="250" y="20" width="140" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="250" y="150" width="140" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="30" y="85" width="130" height="38" rx="6" fill="#bae6fd"/><text x="95" y="109" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="480" y="85" width="130" height="38" rx="6" fill="#bae6fd"/><text x="545" y="109" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<line x1="160" y1="95" x2="250" y2="45" stroke="#64748b" stroke-width="3"/><line x1="160" y1="113" x2="250" y2="165" stroke="#64748b" stroke-width="3"/>
<line x1="390" y1="45" x2="480" y2="95" stroke="#64748b" stroke-width="3"/><line x1="390" y1="165" x2="480" y2="113" stroke="#64748b" stroke-width="3"/>
<text x="175" y="60" class="svg-accent" font-size="12">flow A</text><text x="175" y="158" class="svg-accent" font-size="12">flow B</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">hash per flow</text>
</svg><p class="cap">Two equal-cost paths; each flow is hashed onto one of them, so packets of a flow stay in order.</p></div>

<h3>VRFs: many routing tables in one box</h3>
<p>A <b>VRF</b> (virtual routing and forwarding instance) is a separate routing table on the same switch. Interfaces belong to exactly one VRF, and traffic in one VRF cannot reach another unless you deliberately leak routes. VRFs separate tenants (who may even reuse the same IP ranges), production from test, and the management plane from the data plane.</p>
<pre class="code"><span class="c">! a tenant VRF and an SVI inside it</span>
LEAF1(config)# vrf context TENANT-A
LEAF1(config)# interface vlan 100
LEAF1(config-if)# vrf member TENANT-A
LEAF1(config-if)# ip address 10.100.0.1/24
LEAF1(config-if)# no shutdown
<span class="c">! the management VRF exists by default and holds mgmt0</span>
LEAF1(config)# vrf context management
LEAF1(config-vrf)# ip route 0.0.0.0/0 192.0.2.1
LEAF1# show ip route vrf TENANT-A
LEAF1# ping 192.0.2.50 vrf management</pre>
<p>On NX-OS, <b>mgmt0 always lives in VRF management</b>, and every command that uses the management network needs <code>vrf management</code> (ping, traceroute, copy, NTP and syslog servers). Assigning <code>vrf member</code> to an interface deletes its existing IP configuration, so configure the VRF first and the address second.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking AD beats prefix length (it never does). Pinging the management gateway without <code>vrf management</code> and concluding it is down. Adding <code>vrf member</code> after the IP address and losing the address. Expecting ECMP to split a single large flow.</p></div>
<div class="exam"><p><b>Exam tip.</b> Order: longest match, then AD, then metric. NX-OS preferences: direct/local 0, static 1, eBGP 20, OSPF 110, iBGP 200. ECMP is per flow (hash), not per packet. mgmt0 is in VRF management.</p></div>

<div class="scn"><h4>"NTP is broken on all the new leaves"</h4><p>Ten new leaves showed clocks drifting and no NTP peers. The NTP server 192.0.2.123 was reachable from the management network. <code>show ntp peer-status</code> listed the server as unreachable; <code>ping 192.0.2.123</code> failed, but <code>ping 192.0.2.123 vrf management</code> worked. The template had <code>ntp server 192.0.2.123</code> without <code>use-vrf management</code>, so the leaves tried to reach it through the default VRF, which had no route to the management subnet. Adding <code>ntp server 192.0.2.123 use-vrf management</code> fixed all ten.</p><p><b>Lesson:</b> on NX-OS, anything that talks through mgmt0 must name the management VRF.</p></div>

<div class="iv"><p class="q">"A router has three routes that match a destination. How does it choose?"</p><p>Strong answer: longest prefix match first, regardless of source; if two sources offer the identical prefix, lowest administrative distance; within one protocol, lowest metric, and equal metrics become ECMP, which hashes flows across paths. Give an example with /32, /24 and /0, quote NX-OS preferences, and mention VRFs as separate routing tables including the management VRF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routes come from connected (direct/local), static and dynamic sources.</li>
<li>Selection: longest prefix, then AD (preference), then metric.</li>
<li>ECMP hashes each flow onto one of several equal paths; spine-leaf depends on it.</li>
<li>VRFs are separate routing tables; <code>vrf member</code> first, then the IP address.</li>
<li>mgmt0 lives in VRF management: use <code>vrf management</code> or <code>use-vrf management</code>.</li>
</ul></div>
`,hi:`
<p>Railway enquiry desk socho. Har destination ke liye uske paas ek card hai jo kehta hai "platform 3 lo, agla stop Junction B". Use poori journey nahi pata, sirf agla kadam, aur jab do trains ek hi taraf barabar tezi se jaati hain to woh passengers ko dono use karne deta hai. <b>Router</b> bhi aise hi kaam karta hai: har destination prefix ke liye woh <b>next hop</b> aur <b>outgoing interface</b> rakhta hai, aur equal paths par traffic baant sakta hai. Spine-leaf fabric mein har switch ek router hai, isliye routing table padhna roz ki skill hai.</p>

<h3>Routes kahan se aate hain</h3>
<ul>
<li><b>Connected (direct)</b>: IP address wala har up interface apna subnet jodta hai. NX-OS interface address ke liye ek <b>local</b> /32 bhi jodta hai.</li>
<li><b>Static</b>: engineer ne type kiya, jaise border device par default route ya management VRF mein ek route.</li>
<li><b>Dynamic</b>: OSPF, IS-IS ya BGP jaise routing protocol se seekha, jo failures ke hisaab se automatically adapt karta hai (chapter 8).</li>
</ul>

<h3>Router kaise chunta hai: order mein teen rules</h3>
<ol>
<li><b>Longest prefix match.</b> Sabse specific matching prefix jeet-ta hai, chahe kisi bhi protocol se aaya ho. /32, /24 ko harata hai, jo /0 default ko harata hai.</li>
<li><b>Administrative distance (AD)</b>, NX-OS par <b>preference</b> kehte hain. Agar same prefix alag sources se aaye, to sabse kam AD install hota hai.</li>
<li><b>Metric.</b> Ek protocol ke andar sabse kam metric (cost) jeet-ta hai; equal metrics se <b>ECMP</b> milta hai.</li>
</ol>
<table class="cmp"><tr><th>Source</th><th>NX-OS par default AD</th></tr>
<tr><td>Connected / local</td><td>0</td></tr><tr><td>Static</td><td>1</td></tr><tr><td>eBGP</td><td>20</td></tr><tr><td>EIGRP internal</td><td>90</td></tr><tr><td>OSPF</td><td>110</td></tr><tr><td>IS-IS</td><td>115</td></tr><tr><td>iBGP</td><td>200</td></tr></table>

<div class="eg"><p><b>Worked example: longest prefix match.</b> Ek leaf ke paas 0.0.0.0/0 border ke through, 10.10.0.0/16 SPINE1 ke through (OSPF) aur 10.10.20.0/24 ek static route ke through hai. 10.10.20.21 ka packet teeno se match karta hai; /24 sabse lamba hai, isliye static route jeet-ta hai. 10.10.99.5 ka packet /16 aur /0 se match karta hai; /16 jeet-ta hai. 8.8.4.4 ka packet sirf default se match karta hai. AD tabhi compare hota hai jab <b>prefix aur length bilkul same</b> ho, jaise static 10.10.0.0/16 (AD 1) aur OSPF 10.10.0.0/16 (AD 110): static install hota hai.</p></div>

<h3>NX-OS par show ip route padhna</h3>
<pre class="out">LEAF1# show ip route
IP Route Table for VRF "default"
'*' denotes best ucast next-hop
'[x/y]' denotes [preference/metric]

10.10.10.0/24, ubest/mbest: 1/0, attached
    *via 10.10.10.1, Vlan10, [0/0], 3d02h, direct
10.10.10.1/32, ubest/mbest: 1/0, attached
    *via 10.10.10.1, Vlan10, [0/0], 3d02h, local
<span class="hl">10.255.0.2/32, ubest/mbest: 2/0
    *via 10.1.0.0, Eth1/49, [110/81], 3d01h, ospf-UNDERLAY, intra
    *via 10.1.1.0, Eth1/50, [110/81], 3d01h, ospf-UNDERLAY, intra</span></pre>
<p>Highlighted entry padho: prefix 10.255.0.2/32 (LEAF2 ka loopback), <b>ubest 2</b> matlab do best unicast next hops, dono OSPF, preference 110 aur metric 81, dono spines ke through. Yahi ECMP action mein hai. <code>attached</code> connected subnets ko mark karta hai, <code>direct</code> aur <code>local</code> connected aur interface-address routes ke NX-OS naam hain.</p>

<h3>ECMP aur hashing</h3>
<p>ECMP mein switch packet 1 ko left aur packet 2 ko right nahi bhejta; isse TCP flow ke andar packets ka order bigad jaata. Iski jagah woh header fields par ek <b>hash</b> calculate karta hai (source aur destination IP, aur aam taur par protocol aur L4 ports, yaani <b>5-tuple</b>) aur har <b>flow</b> ko ek path par map karta hai. Kai flows barabar fail jaate hain; ek bahut bada flow ("elephant", jaise ek backup stream) ek hi link par rehta hai. Agar har switch same hash input use kare to woh har tier par same link chun sakta hai (<b>polarisation</b>); vendors ise avoid karne ke liye har switch ka seed jodte hain. NX-OS par OSPF default mein 8 tak equal paths install karta hai (<code>maximum-paths</code> ise badalta hai); BGP 1 install karta hai jab tak aap <code>maximum-paths</code> configure na karo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Spines par ECMP">
<rect x="250" y="20" width="140" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="250" y="150" width="140" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="30" y="85" width="130" height="38" rx="6" fill="#bae6fd"/><text x="95" y="109" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="480" y="85" width="130" height="38" rx="6" fill="#bae6fd"/><text x="545" y="109" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<line x1="160" y1="95" x2="250" y2="45" stroke="#64748b" stroke-width="3"/><line x1="160" y1="113" x2="250" y2="165" stroke="#64748b" stroke-width="3"/>
<line x1="390" y1="45" x2="480" y2="95" stroke="#64748b" stroke-width="3"/><line x1="390" y1="165" x2="480" y2="113" stroke="#64748b" stroke-width="3"/>
<text x="175" y="60" class="svg-accent" font-size="12">flow A</text><text x="175" y="158" class="svg-accent" font-size="12">flow B</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">har flow ka hash</text>
</svg><p class="cap">Do equal-cost paths; har flow unme se ek par hash hota hai, isliye flow ke packets order mein rehte hain.</p></div>

<h3>VRFs: ek box mein kai routing tables</h3>
<p><b>VRF</b> (virtual routing and forwarding instance) same switch par ek alag routing table hai. Interfaces exactly ek VRF ke hote hain, aur ek VRF ka traffic dusre tak nahi pahunch sakta jab tak aap jaan-boojh kar routes leak na karo. VRFs tenants ko alag karte hain (jo same IP ranges bhi reuse kar sakte hain), production ko test se, aur management plane ko data plane se.</p>
<pre class="code"><span class="c">! ek tenant VRF aur uske andar ek SVI</span>
LEAF1(config)# vrf context TENANT-A
LEAF1(config)# interface vlan 100
LEAF1(config-if)# vrf member TENANT-A
LEAF1(config-if)# ip address 10.100.0.1/24
LEAF1(config-if)# no shutdown
<span class="c">! management VRF default mein exist karta hai aur mgmt0 rakhta hai</span>
LEAF1(config)# vrf context management
LEAF1(config-vrf)# ip route 0.0.0.0/0 192.0.2.1
LEAF1# show ip route vrf TENANT-A
LEAF1# ping 192.0.2.50 vrf management</pre>
<p>NX-OS par <b>mgmt0 hamesha VRF management mein rehta hai</b>, aur management network use karne wale har command ko <code>vrf management</code> chahiye (ping, traceroute, copy, NTP aur syslog servers). Interface par <code>vrf member</code> assign karne se uski existing IP configuration delete ho jaati hai, isliye pehle VRF configure karo aur baad mein address.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sochna ki AD prefix length ko harata hai (kabhi nahi). Bina <code>vrf management</code> ke management gateway ping karke maan lena ki woh down hai. IP address ke baad <code>vrf member</code> jodna aur address kho dena. Ek bade single flow ko ECMP se baantne ki umeed karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Order: longest match, phir AD, phir metric. NX-OS preferences: direct/local 0, static 1, eBGP 20, OSPF 110, iBGP 200. ECMP per flow (hash) hai, per packet nahi. mgmt0 VRF management mein hai.</p></div>

<div class="scn"><h4>"Saare naye leaves par NTP toota hai"</h4><p>Das naye leaves ki clocks drift ho rahi thi aur koi NTP peer nahi tha. NTP server 192.0.2.123 management network se reachable tha. <code>show ntp peer-status</code> ne server ko unreachable dikhaya; <code>ping 192.0.2.123</code> fail hua, lekin <code>ping 192.0.2.123 vrf management</code> chal gaya. Template mein <code>use-vrf management</code> ke bina <code>ntp server 192.0.2.123</code> tha, isliye leaves use default VRF se reach karne ki koshish kar rahe the, jiske paas management subnet ka route nahi tha. <code>ntp server 192.0.2.123 use-vrf management</code> jodne se dason theek ho gaye.</p><p><b>Seekh:</b> NX-OS par jo bhi mgmt0 ke through baat karta hai use management VRF ka naam lena padta hai.</p></div>

<div class="iv"><p class="q">"Router ke paas teen routes hain jo destination se match karte hain. Woh kaise chunta hai?"</p><p>Strong answer: pehle longest prefix match, source ki parwah kiye bina; agar do sources identical prefix dein, to sabse kam administrative distance; ek protocol ke andar sabse kam metric, aur equal metrics ECMP ban jaate hain, jo flows ko paths par hash karta hai. /32, /24 aur /0 ke saath example do, NX-OS preferences quote karo, aur VRFs ko alag routing tables ki tarah batao, management VRF ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routes connected (direct/local), static aur dynamic sources se aate hain.</li>
<li>Selection: longest prefix, phir AD (preference), phir metric.</li>
<li>ECMP har flow ko kai equal paths mein se ek par hash karta hai; spine-leaf is par tika hai.</li>
<li>VRFs alag routing tables hain; pehle <code>vrf member</code>, phir IP address.</li>
<li>mgmt0 VRF management mein rehta hai: <code>vrf management</code> ya <code>use-vrf management</code> use karo.</li>
</ul></div>
`}};export{e as default};