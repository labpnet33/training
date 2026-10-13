var e={id:`l2-l3-refresher`,h:{en:`Layer 2 and Layer 3 refresher: frames, packets, ARP and gateways`,hi:`Layer 2 aur Layer 3 refresher: frames, packets, ARP aur gateways`},body:{en:`
<p>Every JNCIS-ENT topic sits on one simple idea: a switch and a router look at different parts of the same data. A switch reads the <b>Layer 2 label</b> (the MAC address) and only moves things around inside one network. A router reads the <b>Layer 3 label</b> (the IP address) and moves things between networks. Think of a courier parcel. The street number on the parcel is the MAC address, useful only inside one neighbourhood. The city and PIN code is the IP address, useful across the country. At the edge of each neighbourhood a depot rewrites the street label for the next neighbourhood, but never touches the PIN code. This chapter refreshes how that works so that the next modules feel natural.</p>

<h3>Frames and packets</h3>
<table class="cmp"><tr><th></th><th>Layer 2 frame</th><th>Layer 3 packet</th></tr>
<tr><td>Address</td><td>MAC (48 bits, e.g. 00:50:7f:06:6d:01)</td><td>IP (32 bits, e.g. 10.10.20.12)</td></tr>
<tr><td>Scope</td><td>One broadcast domain (VLAN)</td><td>End to end across networks</td></tr>
<tr><td>Device</td><td>Switch (bridge)</td><td>Router, Layer 3 switch</td></tr>
<tr><td>Rewritten at each hop?</td><td>Yes, new MACs per link</td><td>No, except TTL minus one</td></tr>
<tr><td>Loop protection</td><td>None (so spanning tree)</td><td>TTL</td></tr></table>
<p>A frame carries a packet inside it, like an envelope inside a bag. When a router forwards the packet, it opens the old frame, decreases the TTL by one, and puts the same packet into a new frame for the next link.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Frame rewritten at the router">
<rect x="20" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.10.10.11</text>
<rect x="260" y="40" width="120" height="84" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">irb.10 / irb.20</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">TTL minus 1</text>
<rect x="520" y="60" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="12">PC2 10.10.20.12</text>
<line x1="120" y1="82" x2="260" y2="82" stroke="#64748b" stroke-width="2"/><line x1="380" y1="82" x2="520" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="190" y="72" text-anchor="middle" class="svg-accent" font-size="11">dst MAC = gateway</text><text x="450" y="72" text-anchor="middle" class="svg-accent" font-size="11">dst MAC = PC2</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">IP source and destination stay the same; the MACs change on each link</text>
</svg><p class="cap">The router rewrites the Layer 2 header and keeps the IP packet.</p></div>

<h3>Broadcast domains, VLANs and subnets</h3>
<p>A <b>broadcast domain</b> is the group of devices that hear each other's broadcasts. One VLAN equals one broadcast domain. One <b>subnet</b> is one IP range, and by convention one VLAN carries one subnet. Two hosts in the same subnet talk directly: the sender knows the target is local and sends the frame straight to its MAC. Hosts in different subnets must use the <b>default gateway</b>, the router interface in their own VLAN. On a Layer 3 switch that interface is an IRB.</p>

<h3>ARP: the glue between the two layers</h3>
<p>A host knows the IP address of its target but needs the MAC address to build a frame. It broadcasts an <b>ARP request</b> ("who has 10.10.10.1?"), and the owner answers with its MAC address. The host keeps the answer in an ARP table for a while. To reach a remote subnet, the host ARPs for its <b>gateway</b>, not for the far-away host. That is why a wrong gateway silently breaks inter-VLAN traffic while same-VLAN traffic keeps working.</p>

<h3>Seeing it with TTL</h3>
<p>Hosts in the lab send with an initial TTL of 64. A ping inside one VLAN answers with TTL 64, because a switch does not touch IP. A ping that crosses the IRB comes back with TTL 63. This is real simulator output from Lab 2, where PC1 (10.10.10.11) pings PC2 (10.10.20.12) in a different VLAN through CORE:</p>
<pre class="out">PC1&gt; ping 10.10.20.12
84 bytes from 10.10.20.12 icmp_seq=1 <span class="hl">ttl=63</span> time=0.500 ms
84 bytes from 10.10.20.12 icmp_seq=2 ttl=63 time=0.600 ms</pre>
<p>And Lab 1 shows the failing case. After the VLAN split, PC1 (in DESIGN) pings PC3 (in FINANCE) in the same subnet but a different VLAN. The switch will not bridge between VLANs, and no router is present, so there is no answer:</p>
<pre class="out">PC1&gt; ping 192.168.50.13
host (192.168.50.13) not reachable
host (192.168.50.13) not reachable</pre>

<div class="eg"><p><b>Worked example: three pings, three lessons.</b> (1) PC1 to PC2, same VLAN, TTL 64: switching only. (2) PC1 to PC2 in another VLAN through the IRB, TTL 63: one routed hop. (3) PC1 to a host in another VLAN with no gateway configured: no reply. The TTL value alone tells you whether a packet was routed.</p></div>

<h3>Four facts you will use in every module</h3>
<ul>
<li>A switch decides by <b>destination MAC</b> and VLAN. A router decides by <b>destination IP</b> and the routing table.</li>
<li>VLANs split broadcast domains; routers join them.</li>
<li>A host uses its default gateway for any address outside its own subnet.</li>
<li>Ethernet frames have no TTL; IP packets have. That is why Layer 2 needs spanning tree and Layer 3 does not.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Believing a switch can route between VLANs without an IRB or router. Entering a wrong gateway on a host and blaming the switch. Mixing up MAC and IP when reading output: the Ethernet switching table has MACs only, the routing table has IP prefixes only.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know that the source and destination IP stay the same end to end, while MACs change at every router hop. A question may ask what changed in a packet captured on both sides of a router: the answer is the Layer 2 header and the TTL.</p></div>

<div class="scn"><h4>"The internet works but the file server does not"</h4><p>A user could browse the internet but not reach the file server in another VLAN. Both services were behind the gateway, which made the engineer suspect the server. A ping from the PC showed TTL 63 for the internet address but nothing for the server. A trace at the gateway showed the server's VLAN had no IRB. Binding the IRB solved it in one line.</p><p><b>Lesson:</b> compare what works with what does not before blaming the far end.</p></div>

<div class="iv"><p class="q">"What changes in a packet when a router forwards it?"</p><p>The IP source and destination stay the same. The router removes the old Layer 2 header, decreases the TTL by one, recalculates the IP header checksum and builds a new frame with the next hop's MAC. Mention ARP, which finds that MAC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switches forward frames by MAC inside a VLAN; routers forward packets by IP between networks.</li>
<li>One VLAN is one broadcast domain, usually with one subnet.</li>
<li>ARP maps IP to MAC; hosts ARP for their gateway when the target is remote.</li>
<li>A routed hop decreases TTL by one (64 becomes 63).</li>
<li>Frames have no TTL, so Layer 2 loops need spanning tree.</li>
</ul></div>
`,hi:`
<p>JNCIS-ENT ka har topic ek simple idea par tika hai: switch aur router ek hi data ke alag hisse dekhte hain. Switch <b>Layer 2 label</b> (MAC address) padhta hai aur cheezein sirf ek network ke andar ghumata hai. Router <b>Layer 3 label</b> (IP address) padhta hai aur networks ke beech cheezein bhejta hai. Courier parcel socho. Parcel par gali ka number MAC address hai, jo sirf ek mohalle mein kaam aata hai. Shehar aur PIN code IP address hai, jo poore desh mein kaam aata hai. Har mohalle ki seema par depot agle mohalle ke liye gali wala label dobara likhta hai, lekin PIN code ko kabhi nahi chhuta. Yeh chapter refresh karta hai ki yeh kaise kaam karta hai taaki agle modules natural lagein.</p>

<h3>Frames aur packets</h3>
<table class="cmp"><tr><th></th><th>Layer 2 frame</th><th>Layer 3 packet</th></tr>
<tr><td>Address</td><td>MAC (48 bits, jaise 00:50:7f:06:6d:01)</td><td>IP (32 bits, jaise 10.10.20.12)</td></tr>
<tr><td>Scope</td><td>Ek broadcast domain (VLAN)</td><td>Networks ke paar end to end</td></tr>
<tr><td>Device</td><td>Switch (bridge)</td><td>Router, Layer 3 switch</td></tr>
<tr><td>Har hop par rewrite?</td><td>Haan, har link par naye MACs</td><td>Nahi, sirf TTL ek kam</td></tr>
<tr><td>Loop protection</td><td>Koi nahi (isliye spanning tree)</td><td>TTL</td></tr></table>
<p>Frame ke andar packet hota hai, jaise bag ke andar envelope. Router packet forward karta hai to purana frame kholta hai, TTL ek kam karta hai, aur wahi packet agle link ke liye naye frame mein daal deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Router par frame rewrite hota hai">
<rect x="20" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.10.10.11</text>
<rect x="260" y="40" width="120" height="84" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">irb.10 / irb.20</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">TTL minus 1</text>
<rect x="520" y="60" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="12">PC2 10.10.20.12</text>
<line x1="120" y1="82" x2="260" y2="82" stroke="#64748b" stroke-width="2"/><line x1="380" y1="82" x2="520" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="190" y="72" text-anchor="middle" class="svg-accent" font-size="11">dst MAC = gateway</text><text x="450" y="72" text-anchor="middle" class="svg-accent" font-size="11">dst MAC = PC2</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">IP source aur destination wahi rehte hain; har link par MACs badalte hain</text>
</svg><p class="cap">Router Layer 2 header rewrite karta hai aur IP packet rakhta hai.</p></div>

<h3>Broadcast domains, VLANs aur subnets</h3>
<p><b>Broadcast domain</b> un devices ka group hai jo ek doosre ke broadcasts sunte hain. Ek VLAN barabar ek broadcast domain. Ek <b>subnet</b> ek IP range hai, aur convention se ek VLAN mein ek subnet hota hai. Same subnet ke do hosts seedhe baat karte hain: sender jaanta hai ki target local hai aur frame seedha uske MAC par bhejta hai. Alag subnets ke hosts ko <b>default gateway</b> use karna padta hai, jo unke apne VLAN ka router interface hai. Layer 3 switch par woh interface IRB hota hai.</p>

<h3>ARP: dono layers ke beech ka gond</h3>
<p>Host ko target ka IP address pata hota hai lekin frame banane ke liye MAC address chahiye. Woh <b>ARP request</b> broadcast karta hai ("10.10.10.1 kiske paas hai?"), aur owner apne MAC address se jawab deta hai. Host jawab ko kuch der ARP table mein rakhta hai. Remote subnet tak pahunchne ke liye host apne <b>gateway</b> ke liye ARP karta hai, door ke host ke liye nahi. Isi liye galat gateway chupchaap inter-VLAN traffic todta hai jabki same-VLAN traffic chalta rehta hai.</p>

<h3>TTL se dekhna</h3>
<p>Lab ke hosts initial TTL 64 se bhejte hain. Ek VLAN ke andar ping TTL 64 ke saath jawab deta hai, kyunki switch IP ko chhuta nahi. IRB paar karne wala ping TTL 63 ke saath wapas aata hai. Yeh Lab 2 ka real simulator output hai, jahan PC1 (10.10.10.11) CORE ke through alag VLAN ke PC2 (10.10.20.12) ko ping karta hai:</p>
<pre class="out">PC1&gt; ping 10.10.20.12
84 bytes from 10.10.20.12 icmp_seq=1 <span class="hl">ttl=63</span> time=0.500 ms
84 bytes from 10.10.20.12 icmp_seq=2 ttl=63 time=0.600 ms</pre>
<p>Aur Lab 1 fail hone ka case dikhata hai. VLAN split ke baad PC1 (DESIGN mein) same subnet lekin alag VLAN ke PC3 (FINANCE mein) ko ping karta hai. Switch VLANs ke beech bridge nahi karega, aur koi router hai nahi, isliye jawab nahi aata:</p>
<pre class="out">PC1&gt; ping 192.168.50.13
host (192.168.50.13) not reachable
host (192.168.50.13) not reachable</pre>

<div class="eg"><p><b>Worked example: teen pings, teen seekh.</b> (1) PC1 se PC2, same VLAN, TTL 64: sirf switching. (2) PC1 se alag VLAN ke PC2 tak IRB ke through, TTL 63: ek routed hop. (3) PC1 se alag VLAN ke host tak jab gateway configured nahi: koi reply nahi. Sirf TTL value batati hai ki packet route hua ya nahi.</p></div>

<h3>Chaar facts jo har module mein kaam aayenge</h3>
<ul>
<li>Switch <b>destination MAC</b> aur VLAN se decide karta hai. Router <b>destination IP</b> aur routing table se decide karta hai.</li>
<li>VLANs broadcast domains baantte hain; routers unhe jodte hain.</li>
<li>Host apne subnet ke bahar ke har address ke liye default gateway use karta hai.</li>
<li>Ethernet frames mein TTL nahi hota; IP packets mein hota hai. Isi liye Layer 2 ko spanning tree chahiye aur Layer 3 ko nahi.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Maanna ki switch IRB ya router ke bina VLANs ke beech route kar sakta hai. Host par galat gateway daal kar switch ko dosh dena. Output padhte waqt MAC aur IP mix karna: Ethernet switching table mein sirf MACs hote hain, routing table mein sirf IP prefixes.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho ki source aur destination IP end to end same rehte hain, jabki MACs har router hop par badalte hain. Question poochh sakta hai ki router ke dono taraf capture kiye packet mein kya badla: jawab Layer 2 header aur TTL.</p></div>

<div class="scn"><h4>"Internet chalta hai lekin file server nahi"</h4><p>Ek user internet browse kar pa raha tha lekin doosre VLAN ke file server tak nahi pahunch pa raha tha. Dono services gateway ke peeche thin, isliye engineer ko server par shak hua. PC se ping ne internet address ke liye TTL 63 dikhaya lekin server ke liye kuch nahi. Gateway par check karne par pata chala ki server ke VLAN mein IRB tha hi nahi. IRB bind karne se ek line mein theek ho gaya.</p><p><b>Lesson:</b> doshi thehrane se pehle jo chal raha hai uski jo nahi chal raha usse tulna karo.</p></div>

<div class="iv"><p class="q">"Router packet forward kare to uska kya badalta hai?"</p><p>IP source aur destination wahi rehte hain. Router purana Layer 2 header hata deta hai, TTL ek kam karta hai, IP header checksum dobara calculate karta hai aur agle hop ke MAC ke saath naya frame banata hai. ARP ka zikr karo, jo wo MAC dhoondhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch VLAN ke andar MAC se frames forward karta hai; router networks ke beech IP se packets.</li>
<li>Ek VLAN ek broadcast domain hai, aam taur par ek subnet ke saath.</li>
<li>ARP IP ko MAC se map karta hai; target remote ho to hosts gateway ke liye ARP karte hain.</li>
<li>Routed hop TTL ek kam karta hai (64 se 63).</li>
<li>Frames mein TTL nahi hota, isliye Layer 2 loops ko spanning tree chahiye.</li>
</ul></div>
`}};export{e as default};