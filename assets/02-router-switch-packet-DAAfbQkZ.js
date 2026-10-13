var e={id:`router-switch-packet`,h:{en:`Routers, switches and packets in plain words`,hi:`Router, switch aur packet simple shabdon mein`},body:{en:`
<p>Before any command, you need a clear picture of three words: <b>packet</b>, <b>switch</b> and <b>router</b>. Everything in JNCIA-Junos is built on them.</p>

<h3>What is a packet?</h3>
<p>Sending a 2 GB video as one giant block would be slow and fragile. A network instead cuts data into small pieces. Each piece is wrapped in a <b>header</b> (like an envelope) that carries the source address, the destination address and some control information, followed by the <b>payload</b> (the actual data). At layer 3 this unit is called a <b>packet</b>. At layer 2 the same thing, wrapped again for one hop of the journey, is called a <b>frame</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Frame wrapping a packet wrapping data">
<rect x="20" y="30" width="600" height="80" rx="8" fill="#e2e8f0"/>
<text x="80" y="25" class="svg-muted" font-size="12">Frame (Ethernet header + trailer)</text>
<rect x="40" y="48" width="100" height="44" rx="6" fill="#bae6fd"/><text x="90" y="75" text-anchor="middle" class="svg-ink" font-size="12">MAC header</text>
<rect x="150" y="48" width="330" height="44" rx="6" fill="#ddd6fe"/>
<rect x="160" y="56" width="110" height="28" rx="4" fill="#bbf7d0"/><text x="215" y="75" text-anchor="middle" class="svg-ink" font-size="12">IP header</text>
<rect x="280" y="56" width="190" height="28" rx="4" fill="#fde68a"/><text x="375" y="75" text-anchor="middle" class="svg-ink" font-size="12">Payload (your data)</text>
<rect x="490" y="48" width="110" height="44" rx="6" fill="#bae6fd"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="12">FCS (check)</text>
<text x="315" y="135" text-anchor="middle" class="svg-muted" font-size="12">The IP packet stays the same end to end; the frame is rebuilt at every hop</text>
</svg><p class="cap">An IP packet rides inside an Ethernet frame. The frame changes at every hop; the packet does not.</p></div>

<h3>What is a switch?</h3>
<p>A <b>switch</b> connects devices that belong to the <i>same</i> network, such as all the PCs on one office floor. It works at layer 2 and looks only at the <b>MAC address</b> in the frame. It learns which MAC address lives behind which port and keeps this in a <b>MAC table</b>. When a frame arrives, the switch sends it out of the one port where the destination lives. If it does not know yet, it floods the frame to all other ports in the same VLAN. A <b>VLAN</b> is a virtual split of a switch into separate networks.</p>

<h3>What is a router?</h3>
<p>A <b>router</b> connects <i>different</i> networks. It works at layer 3 and looks at the <b>IP address</b> in the packet. It keeps a <b>routing table</b>: a list of destination networks and, for each, the <b>next hop</b> (the neighbour router to hand the packet to) and the exit interface. For each packet it finds the best matching entry and forwards. Routers do not forward broadcasts, so every router interface is a separate network.</p>

<table class="cmp"><tr><th></th><th>Switch</th><th>Router</th></tr>
<tr><td>Connects</td><td>devices in one network</td><td>different networks</td></tr>
<tr><td>Looks at</td><td>destination MAC address</td><td>destination IP address</td></tr>
<tr><td>Table</td><td>MAC table</td><td>routing table</td></tr>
<tr><td>Layer</td><td>2 (data link)</td><td>3 (network)</td></tr>
<tr><td>Junos command</td><td><code>show ethernet-switching table</code></td><td><code>show route</code></td></tr></table>

<p>Real Juniper boxes often do both. An EX switch can have an <b>IRB</b> (integrated routing and bridging) interface, so it switches inside a VLAN and routes between VLANs.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (192.0.2.10) sends to PC2 (192.0.2.20) in the same network: PC1 builds a frame with PC2's MAC address, the switch looks up its MAC table and sends it out one port. No router is involved. Now PC1 sends to a server at 203.0.113.50 in another network: PC1 builds a frame with the <i>router's</i> MAC address (the gateway), the router receives it, strips the frame, looks up 203.0.113.50 in its routing table, and builds a new frame for the next hop.</p></div>

<div class="note"><p>Every device has two kinds of address: a <b>MAC address</b> (burned into the network card, used for one hop) and an <b>IP address</b> (assigned by an engineer, used end to end).</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking the source and destination IP addresses change when a packet passes through a router. They do not (apart from NAT, covered later). What changes at each hop are the MAC addresses of the frame.</p></div>

<div class="scn"><h4>Two PCs, one cable, no ping</h4><p>In a classroom lab two PCs were connected through a switch. PC1 was 192.0.2.10 and PC2 was 198.51.100.20. They could not ping each other even though cabling was perfect. The instructor asked: "Same network or different?" They were in different networks, so PC1 sent its traffic to its default gateway, but no router existed. Adding a router (or giving both PCs addresses from the same subnet) fixed it immediately.</p><p><b>Lesson:</b> a switch alone only joins devices of one network. To cross to another network you need a router and a gateway.</p></div>

<div class="iv"><p class="q">"What is the difference between a switch and a router?"</p><p>Say: a switch forwards frames within a network using the MAC table at layer 2; a router forwards packets between networks using the routing table at layer 3 and does not pass broadcasts. Add that modern Juniper EX and QFX switches can route too, through IRB interfaces. Mentioning both tables and both commands shows hands-on knowledge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data is cut into packets; each hop wraps the packet in a new Ethernet frame.</li>
<li>A switch uses MAC addresses and a MAC table within one network or VLAN.</li>
<li>A router uses IP addresses and a routing table between networks and picks a next hop.</li>
<li>IP addresses stay the same end to end; MAC addresses change at every hop.</li>
<li>Many Juniper switches also route using IRB interfaces.</li>
</ul></div>
`,hi:`
<p>Kisi bhi command se pehle teen shabdon ki saaf tasveer chahiye: <b>packet</b>, <b>switch</b> aur <b>router</b>. JNCIA-Junos ki har cheez inhi par bani hai.</p>

<h3>Packet kya hai?</h3>
<p>2 GB ki video ko ek bade block mein bhejna dheema aur kamzor hota. Network data ko chhote tukdon mein kaat deta hai. Har tukde ko ek <b>header</b> (envelope ki tarah) mein lapeta jaata hai jisme source address, destination address aur kuch control information hoti hai, uske baad <b>payload</b> (asli data). Layer 3 par is unit ko <b>packet</b> kehte hain. Layer 2 par wahi cheez, safar ke ek hop ke liye dobara lapet kar, <b>frame</b> kehlaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Frame ke andar packet, packet ke andar data">
<rect x="20" y="30" width="600" height="80" rx="8" fill="#e2e8f0"/>
<text x="80" y="25" class="svg-muted" font-size="12">Frame (Ethernet header + trailer)</text>
<rect x="40" y="48" width="100" height="44" rx="6" fill="#bae6fd"/><text x="90" y="75" text-anchor="middle" class="svg-ink" font-size="12">MAC header</text>
<rect x="150" y="48" width="330" height="44" rx="6" fill="#ddd6fe"/>
<rect x="160" y="56" width="110" height="28" rx="4" fill="#bbf7d0"/><text x="215" y="75" text-anchor="middle" class="svg-ink" font-size="12">IP header</text>
<rect x="280" y="56" width="190" height="28" rx="4" fill="#fde68a"/><text x="375" y="75" text-anchor="middle" class="svg-ink" font-size="12">Payload (aapka data)</text>
<rect x="490" y="48" width="110" height="44" rx="6" fill="#bae6fd"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="12">FCS (check)</text>
<text x="315" y="135" text-anchor="middle" class="svg-muted" font-size="12">IP packet end to end same rehta hai; frame har hop par dobara banta hai</text>
</svg><p class="cap">IP packet Ethernet frame ke andar chalta hai. Frame har hop par badalta hai; packet nahi badalta.</p></div>

<h3>Switch kya hai?</h3>
<p><b>Switch</b> un devices ko jodta hai jo <i>ek hi</i> network ke hain, jaise ek office floor ke saare PCs. Yeh layer 2 par kaam karta hai aur frame mein sirf <b>MAC address</b> dekhta hai. Yeh seekhta hai ki kaunsa MAC address kis port ke peeche hai aur yeh <b>MAC table</b> mein rakhta hai. Frame aane par switch use us ek port se bahar bhejta hai jahan destination hai. Abhi pata nahi ho to frame ko usi VLAN ke baaki sab ports par flood kar deta hai. <b>VLAN</b> ek switch ka virtual batwaara hai jo use alag networks mein baant deta hai.</p>

<h3>Router kya hai?</h3>
<p><b>Router</b> <i>alag-alag</i> networks ko jodta hai. Yeh layer 3 par kaam karta hai aur packet mein <b>IP address</b> dekhta hai. Iske paas <b>routing table</b> hoti hai: destination networks ki list, aur har ek ke liye <b>next hop</b> (padosi router jise packet dena hai) aur exit interface. Har packet ke liye yeh best matching entry dhoondh kar forward karta hai. Router broadcasts aage nahi bhejta, isliye router ka har interface alag network hai.</p>

<table class="cmp"><tr><th></th><th>Switch</th><th>Router</th></tr>
<tr><td>Jodta hai</td><td>ek network ke devices</td><td>alag networks</td></tr>
<tr><td>Dekhta hai</td><td>destination MAC address</td><td>destination IP address</td></tr>
<tr><td>Table</td><td>MAC table</td><td>routing table</td></tr>
<tr><td>Layer</td><td>2 (data link)</td><td>3 (network)</td></tr>
<tr><td>Junos command</td><td><code>show ethernet-switching table</code></td><td><code>show route</code></td></tr></table>

<p>Asli Juniper boxes aksar dono kaam karte hain. EX switch par <b>IRB</b> (integrated routing and bridging) interface ho sakta hai, to woh VLAN ke andar switch karta hai aur VLANs ke beech route karta hai.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (192.0.2.10) usi network ke PC2 (192.0.2.20) ko bhejta hai: PC1 PC2 ke MAC address ka frame banata hai, switch apni MAC table dekhta hai aur ek port se bhej deta hai. Router ka koi role nahi. Ab PC1 dusre network ke server 203.0.113.50 ko bhejta hai: PC1 <i>router ke</i> MAC address (gateway) ka frame banata hai, router frame receive karke hata deta hai, routing table mein 203.0.113.50 dekhta hai, aur next hop ke liye naya frame banata hai.</p></div>

<div class="note"><p>Har device ke do tarah ke address hote hain: <b>MAC address</b> (network card mein pehle se likha, ek hop ke liye) aur <b>IP address</b> (engineer dwara diya gaya, end to end ke liye).</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh sochna ki router se guzarte hue source aur destination IP address badal jaate hain. Nahi badalte (NAT ko chhod kar, jo aage aayega). Har hop par frame ke MAC addresses badalte hain.</p></div>

<div class="scn"><h4>Do PCs, ek cable, ping nahi</h4><p>Classroom lab mein do PCs switch se jude the. PC1 192.0.2.10 tha aur PC2 198.51.100.20. Cabling bilkul theek thi phir bhi ping nahi ho raha tha. Instructor ne poocha: "Same network ya alag?" Dono alag networks mein the, to PC1 ne traffic apne default gateway ko bheja, lekin koi router tha hi nahi. Router jodne se (ya dono PCs ko ek hi subnet ke address dene se) turant theek ho gaya.</p><p><b>Lesson:</b> akela switch sirf ek network ke devices jodta hai. Doosre network mein jaane ke liye router aur gateway chahiye.</p></div>

<div class="iv"><p class="q">"Switch aur router mein kya fark hai?"</p><p>Kaho: switch layer 2 par MAC table se ek network ke andar frames forward karta hai; router layer 3 par routing table se networks ke beech packets forward karta hai aur broadcasts nahi bhejta. Jodo ki modern Juniper EX aur QFX switches IRB interfaces se route bhi kar sakte hain. Dono tables aur dono commands ka zikr hands-on knowledge dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data packets mein kata jaata hai; har hop par packet naye Ethernet frame mein lapeta jaata hai.</li>
<li>Switch ek network ya VLAN ke andar MAC addresses aur MAC table use karta hai.</li>
<li>Router networks ke beech IP addresses aur routing table use karke next hop chunta hai.</li>
<li>IP addresses end to end same rehte hain; MAC addresses har hop par badalte hain.</li>
<li>Kai Juniper switches IRB interfaces se route bhi karte hain.</li>
</ul></div>
`}};export{e as default};