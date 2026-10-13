var e={id:`goals`,h:{en:`Why EVPN: goals, prerequisites and the control-plane idea`,hi:`EVPN kyun: goals, prerequisites aur control-plane ka idea`},body:{en:`
<p>In the previous module every leaf learned about remote hosts by shouting and listening. That is like a town where nobody has a phone book: you find a neighbour by knocking on every door. <b>BGP EVPN</b> gives the town a phone book. Each leaf, the moment it learns a local host, writes the entry into BGP and tells everyone: "MAC 0050.56aa.0001 and IP 10.10.10.11 live behind VTEP 10.255.1.11, segment 10010". The VXLAN packet format does not change. Only the way addresses are learned changes: from data-plane guessing to control-plane announcement.</p>

<div class="note"><p><b>What you will learn.</b> What EVPN adds to VXLAN, the BGP design with spines as route reflectors, route types 2, 3 and 5, route distinguishers and route targets, symmetric IRB with L2VNI and L3VNI, the anycast gateway, MAC mobility and a complete troubleshooting playbook. It is the second of three modules (after <code>sre-vxlan</code>, before <code>sre-esi</code>).</p></div>

<div class="note"><p><b>Prerequisites.</b> You should have finished <code>sre-vxlan</code> (VNIs, VTEPs, nve1, underlay) and have BGP basics from <code>dc-evpn</code> and the BGP modules (iBGP, route reflectors, address families, extended communities). This module does not repeat the NX-OS-flavoured theory of <code>dc-evpn</code>; it applies it with IOS XE-style commands on the same fabric and extends it with symmetric IRB details and a full playbook.</p></div>

<h3>The fabric, now with BGP</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EVPN BGP design">
<rect x="150" y="12" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="225" y="32" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 (RR)</text><text x="225" y="48" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.101</text>
<rect x="340" y="12" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="415" y="32" text-anchor="middle" class="svg-ink" font-size="12">SPINE2 (RR)</text><text x="415" y="48" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.102</text>
<rect x="20" y="150" width="150" height="46" rx="8" fill="#bae6fd"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="95" y="186" text-anchor="middle" class="svg-muted" font-size="12">Lo0 .0.11 / Lo1 .1.11</text>
<rect x="245" y="150" width="150" height="46" rx="8" fill="#bae6fd"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Lo0 .0.12 / Lo1 .1.12</text>
<rect x="470" y="150" width="150" height="46" rx="8" fill="#bae6fd"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="545" y="186" text-anchor="middle" class="svg-muted" font-size="12">Lo0 .0.13 / Lo1 .1.13</text>
<g stroke="#64748b" stroke-dasharray="5 4" stroke-width="1.6"><line x1="225" y1="58" x2="95" y2="150"/><line x1="225" y1="58" x2="320" y2="150"/><line x1="225" y1="58" x2="545" y2="150"/><line x1="415" y1="58" x2="95" y2="150"/><line x1="415" y1="58" x2="320" y2="150"/><line x1="415" y1="58" x2="545" y2="150"/></g>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">iBGP AS 65001, l2vpn evpn, session Lo0 to Lo0</text>
</svg><p class="cap">Dashed lines are BGP sessions between loopbacks, riding on the OSPF underlay.</p></div>

<h3>What EVPN gives you that flood-and-learn did not</h3>
<table class="cmp"><tr><th>Problem before</th><th>EVPN answer</th></tr>
<tr><td>Typed peer lists</td><td>VTEPs discovered via type-3 routes</td></tr>
<tr><td>Remote MACs learned only from traffic</td><td>Type-2 routes carry MAC (and IP) from the first sighting</td></tr>
<tr><td>ARP flooded everywhere</td><td>Leaf answers ARP from the type-2 MAC/IP entries (ARP suppression)</td></tr>
<tr><td>No routing between VNIs</td><td>Symmetric IRB with L3VNI and type-5 prefixes</td></tr>
<tr><td>Hosts move and old entries linger</td><td>MAC mobility sequence numbers</td></tr>
<tr><td>Single-homed hosts only</td><td>Ethernet segments (next module)</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> H1 (10.10.10.11) boots on LEAF1 and sends a gratuitous ARP. LEAF1 learns the MAC locally, creates an EVPN type-2 route "MAC 0050.56aa.0001, IP 10.10.10.11, L2VNI 10010, next hop 10.255.1.11" and sends it to both spines. The spines reflect it to LEAF2 and LEAF3. LEAF2 installs the MAC in its table as pointing at VTEP 10.255.1.11. Nobody flooded anything.</p></div>

<h3>The five ideas of the module</h3>
<ol>
<li>BGP session design: leaves are RR clients, spines are route reflectors.</li>
<li>Type 3 builds the flood list; type 2 advertises hosts; type 5 advertises prefixes.</li>
<li>RD keeps routes unique; RT decides who imports.</li>
<li>L2VNI bridges one VLAN; L3VNI routes between VNIs inside a VRF.</li>
<li>One fault, one command: the playbook tells you which show command proves each fault.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Believing EVPN replaces VXLAN. EVPN is the control plane; VXLAN is still the data plane, with the same 50-byte header and the same underlay.</p></div>

<div class="exam"><p><b>Exam trap.</b> The address family is <code>l2vpn evpn</code>, not <code>ipv4 unicast</code>. A BGP session can be Established and still carry no EVPN routes if the family is not activated for that neighbor.</p></div>

<div class="scn"><h4>The migration weekend</h4><p>A hosting firm moved a 30-leaf fabric from flood-and-learn to EVPN over one weekend. Monday morning, support tickets about "slow first ping" dropped to zero, because ARP was answered locally, and the routers' CPU graphs stopped showing spikes from BUM storms. The only surprise was a leaf with BGP Established but nothing in the EVPN table: the neighbor was not activated under address-family l2vpn evpn.</p><p><b>Lesson:</b> check session state and address-family activation separately.</p></div>

<div class="iv"><p class="q">"What does EVPN change compared to flood-and-learn VXLAN?"</p><p>Strong answer: the data plane is the same VXLAN, but MAC and IP reachability and VTEP membership are advertised by MP-BGP instead of learned from traffic. That removes manual peer lists, reduces flooding, enables ARP suppression, supports integrated routing with type-5 and L3VNI, and adds MAC mobility and multi-homing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN = BGP control plane on top of the same VXLAN data plane.</li>
<li>Spines are iBGP route reflectors; leaves peer with both.</li>
<li>Type 3 = VTEP/flood list, type 2 = MAC/IP, type 5 = prefix.</li>
<li>Check BGP session and EVPN family activation separately.</li>
</ul></div>
`,hi:`
<p>Pichhle module mein har leaf remote hosts ke baare mein chillakar aur sunkar seekhta tha. Yeh aise shehar jaisa hai jahan kisi ke paas phone book nahi: padosi ko dhoondhne ke liye har darwaze par dastak do. <b>BGP EVPN</b> shehar ko phone book deta hai. Har leaf, jaise hi koi local host seekhta hai, entry BGP mein likh deta hai aur sabko batata hai: "MAC 0050.56aa.0001 aur IP 10.10.10.11 VTEP 10.255.1.11 ke peeche hai, segment 10010". VXLAN packet format nahi badalta. Sirf addresses seekhne ka tareeka badalta hai: data-plane andaaze se control-plane announcement tak.</p>

<div class="note"><p><b>Aap kya seekhoge.</b> EVPN VXLAN mein kya jodta hai, spines ko route reflector bana wala BGP design, route types 2, 3 aur 5, route distinguishers aur route targets, L2VNI aur L3VNI ke saath symmetric IRB, anycast gateway, MAC mobility aur poora troubleshooting playbook. Yeh teen modules mein doosra hai (<code>sre-vxlan</code> ke baad, <code>sre-esi</code> se pehle).</p></div>

<div class="note"><p><b>Prerequisites.</b> <code>sre-vxlan</code> (VNIs, VTEPs, nve1, underlay) khatam hona chahiye aur <code>dc-evpn</code> tatha BGP modules se BGP basics (iBGP, route reflectors, address families, extended communities) aane chahiye. Yeh module <code>dc-evpn</code> ki NX-OS-flavour theory dobara nahi padhata; use IOS XE-style commands ke saath same fabric par apply karta hai aur symmetric IRB details aur poora playbook jodta hai.</p></div>

<h3>Fabric, ab BGP ke saath</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EVPN BGP design">
<rect x="150" y="12" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="225" y="32" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 (RR)</text><text x="225" y="48" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.101</text>
<rect x="340" y="12" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="415" y="32" text-anchor="middle" class="svg-ink" font-size="12">SPINE2 (RR)</text><text x="415" y="48" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.102</text>
<rect x="20" y="150" width="150" height="46" rx="8" fill="#bae6fd"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="95" y="186" text-anchor="middle" class="svg-muted" font-size="12">Lo0 .0.11 / Lo1 .1.11</text>
<rect x="245" y="150" width="150" height="46" rx="8" fill="#bae6fd"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Lo0 .0.12 / Lo1 .1.12</text>
<rect x="470" y="150" width="150" height="46" rx="8" fill="#bae6fd"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="545" y="186" text-anchor="middle" class="svg-muted" font-size="12">Lo0 .0.13 / Lo1 .1.13</text>
<g stroke="#64748b" stroke-dasharray="5 4" stroke-width="1.6"><line x1="225" y1="58" x2="95" y2="150"/><line x1="225" y1="58" x2="320" y2="150"/><line x1="225" y1="58" x2="545" y2="150"/><line x1="415" y1="58" x2="95" y2="150"/><line x1="415" y1="58" x2="320" y2="150"/><line x1="415" y1="58" x2="545" y2="150"/></g>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">iBGP AS 65001, l2vpn evpn, session Lo0 se Lo0</text>
</svg><p class="cap">Dashed lines loopbacks ke beech BGP sessions hain, OSPF underlay par chalti hain.</p></div>

<h3>EVPN woh deta hai jo flood-and-learn nahi deta tha</h3>
<table class="cmp"><tr><th>Pehle ki problem</th><th>EVPN ka jawab</th></tr>
<tr><td>Typed peer lists</td><td>VTEPs type-3 routes se discover</td></tr>
<tr><td>Remote MACs sirf traffic se</td><td>Type-2 routes pehli sighting se MAC (aur IP) carry karte hain</td></tr>
<tr><td>ARP har jagah flood</td><td>Leaf type-2 MAC/IP entries se ARP khud answer karta hai (ARP suppression)</td></tr>
<tr><td>VNIs ke beech routing nahi</td><td>L3VNI aur type-5 prefixes ke saath symmetric IRB</td></tr>
<tr><td>Hosts move karte hain aur purani entries rehti hain</td><td>MAC mobility sequence numbers</td></tr>
<tr><td>Sirf single-homed hosts</td><td>Ethernet segments (agla module)</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> H1 (10.10.10.11) LEAF1 par boot hota hai aur gratuitous ARP bhejta hai. LEAF1 MAC locally learn karta hai, EVPN type-2 route "MAC 0050.56aa.0001, IP 10.10.10.11, L2VNI 10010, next hop 10.255.1.11" banata hai aur dono spines ko bhejta hai. Spines use LEAF2 aur LEAF3 ko reflect karte hain. LEAF2 MAC ko apni table mein VTEP 10.255.1.11 ko point karta hua install karta hai. Kisi ne kuch flood nahi kiya.</p></div>

<h3>Module ke paanch ideas</h3>
<ol>
<li>BGP session design: leaves RR clients, spines route reflectors.</li>
<li>Type 3 flood list banata hai; type 2 hosts advertise karta hai; type 5 prefixes.</li>
<li>RD routes ko unique rakhta hai; RT decide karta hai kaun import kare.</li>
<li>L2VNI ek VLAN bridge karta hai; L3VNI VRF ke andar VNIs ke beech route karta hai.</li>
<li>Ek fault, ek command: playbook batata hai ki har fault ko kaunsa show command prove karta hai.</li>
</ol>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki EVPN VXLAN ko replace karta hai. EVPN control plane hai; VXLAN ab bhi data plane hai, same 50-byte header aur same underlay ke saath.</p></div>

<div class="exam"><p><b>Exam trap.</b> Address family <code>l2vpn evpn</code> hai, <code>ipv4 unicast</code> nahi. BGP session Established ho sakta hai aur phir bhi koi EVPN route carry nahi karta agar us neighbor ke liye family activate nahi hai.</p></div>

<div class="scn"><h4>Migration weekend</h4><p>Ek hosting firm ne 30-leaf fabric ko ek weekend mein flood-and-learn se EVPN par move kiya. Monday subah "slow first ping" ke support tickets zero ho gaye, kyunki ARP locally answer hone laga, aur routers ke CPU graphs ne BUM storms ke spikes dikhana band kar diya. Ek hi surprise tha: ek leaf jahan BGP Established tha lekin EVPN table khaali: neighbor address-family l2vpn evpn ke neeche activate nahi tha.</p><p><b>Seekh:</b> session state aur address-family activation ko alag-alag check karo.</p></div>

<div class="iv"><p class="q">"Flood-and-learn VXLAN ke mukable EVPN kya badalta hai?"</p><p>Strong answer: data plane wahi VXLAN hai, lekin MAC aur IP reachability tatha VTEP membership traffic se seekhne ki jagah MP-BGP se advertise hoti hai. Isse manual peer lists khatam, flooding kam, ARP suppression, type-5 aur L3VNI ke saath integrated routing, aur MAC mobility tatha multi-homing milte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN = same VXLAN data plane par BGP control plane.</li>
<li>Spines iBGP route reflectors; leaves dono se peer karte hain.</li>
<li>Type 3 = VTEP/flood list, type 2 = MAC/IP, type 5 = prefix.</li>
<li>BGP session aur EVPN family activation alag check karo.</li>
</ul></div>
`}};export{e as default};