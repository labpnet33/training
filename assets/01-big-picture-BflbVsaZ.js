var e={id:`big-picture`,h:{en:`The big picture: what a router does with every packet`,hi:`Big picture: router har packet ke saath kya karta hai`},body:{en:`
<p>Think of a big railway junction. Trains arrive from many directions, and at the junction a signal operator looks at one thing only: the <b>destination</b> painted on the front of the train. He checks his big board of routes, finds the line that leads there, switches the points and sends the train on. He does not care who is on board or where the train started. If his board has no line for that destination, the train stops at the junction. A router is that signal operator, and its board is the <b>routing table</b>.</p>

<h3>What you will learn</h3>
<ul>
<li>Exactly what a router does to each packet, step by step.</li>
<li>How to read every field of <code>show ip route</code>: codes, prefix, [AD/metric], next hop, outgoing interface and the gateway of last resort.</li>
<li>Connected and local routes, and why local routes are /32.</li>
<li>Longest prefix match, administrative distance and metric, and the order in which a router uses them.</li>
<li>Static routes in all three forms (next-hop, exit interface, fully specified), plus default, floating, host and summary static routes.</li>
<li>Recursive lookup, return-path thinking, an IPv6 static route recap, and a troubleshooting workflow you will use on a real NOC ticket.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with the <b>CCNA IPv4 addressing and subnetting</b> module (network address, mask, prefix length, block size), the <b>inter-VLAN routing</b> module (default gateway, ARP, MAC rewrite at each hop) and basic IOS navigation. We refer back to them instead of re-teaching them. The next module, <b>OSPFv2</b>, lets routers learn routes automatically; this module teaches you to read and control the table that OSPF will later fill.</p>

<h3>Routing versus forwarding</h3>
<p>Two words are often mixed up, so let us define them now.</p>
<dl class="terms">
<dt>Routing</dt><dd>Building the table: learning which networks exist and which neighbour leads to each one. Sources are connected interfaces, static routes you type, and dynamic protocols such as OSPF.</dd>
<dt>Forwarding</dt><dd>Using the table: for each packet, looking up the destination and pushing the packet out of the right interface. On Cisco routers this is done by <b>CEF</b> (Cisco Express Forwarding), which pre-builds a fast copy of the table called the <b>FIB</b> plus an <b>adjacency table</b> of ready-made Layer 2 headers.</dd>
</dl>

<h3>The per-packet walk</h3>
<p>When a frame arrives on a router interface, the router does the same steps every time:</p>
<ol>
<li><b>Accept the frame.</b> The destination MAC must be the router's own interface MAC (or a broadcast or multicast it listens to). The router checks the FCS and strips the Ethernet header.</li>
<li><b>Read the destination IP.</b> If it is one of the router's own addresses, the packet is for the router itself (a ping, SSH, a routing protocol message).</li>
<li><b>Look up the routing table.</b> The router finds the <b>most specific</b> matching route, the longest prefix match. No match and no default route means the packet is dropped and an ICMP destination unreachable is sent back to the source.</li>
<li><b>Decrement TTL.</b> If TTL reaches 0, the packet is dropped and an ICMP time exceeded goes back to the sender. This is what traceroute uses.</li>
<li><b>Resolve the next hop to a MAC.</b> The route gives a next-hop IP and an outgoing interface; ARP (or the ready-made adjacency) gives the next hop's MAC.</li>
<li><b>Build a new frame and send it.</b> New source MAC (the router's exit interface), new destination MAC (the next hop), same source and destination IP.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology PC1 R1 R2 R3 PC2">
<rect x="10" y="150" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="65" y="190" text-anchor="middle" class="svg-muted" font-size="12">172.16.1.10</text>
<rect x="130" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="185" y="62" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="185" y="80" text-anchor="middle" class="svg-muted" font-size="12">Studio-A gw .1</text>
<rect x="265" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="400" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="455" y="62" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="455" y="80" text-anchor="middle" class="svg-muted" font-size="12">Studio-B gw .1</text>
<rect x="520" y="150" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="575" y="190" text-anchor="middle" class="svg-muted" font-size="12">172.16.3.10</text>
<line x1="65" y1="150" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="265" y2="65" stroke="#64748b" stroke-width="2"/><line x1="375" y1="65" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="575" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="253" y="115" text-anchor="middle" class="svg-accent" font-size="12">10.12.12.0/30</text>
<text x="388" y="115" text-anchor="middle" class="svg-accent" font-size="12">10.23.23.0/30</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Every router hop: new MACs, same IPs, TTL minus 1</text>
</svg><p class="cap">The first lab topology: two studio LANs joined through a transit router. Out of the box each router only knows its own links.</p></div>

<h3>Where routes come from</h3>
<p>A router's table can be filled in three ways. <b>Connected and local routes</b> appear automatically when an interface with an IP address is up/up. <b>Static routes</b> are typed by you with <code>ip route</code>. <b>Dynamic routes</b> are learned from neighbours by protocols such as OSPF, EIGRP or BGP. In the lab above, R1 knows 172.16.1.0/24 and 10.12.12.0/30 because they are connected, but it has no idea that 172.16.3.0/24 exists behind R3. Until you add a route, a ping from PC1 to PC2 dies at R1.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (172.16.1.10) pings PC2 (172.16.3.10). PC1 sees that 172.16.3.10 is not in its /24, so it sends the frame to its gateway R1 (172.16.1.1). R1 strips the frame, reads destination 172.16.3.10 and searches its table. It finds only 172.16.1.0/24 and 10.12.12.0/30. No match, no default: R1 drops the packet and returns ICMP unreachable. PC1 prints "Destination host unreachable" with R1 as the source. After you add <code>ip route 172.16.3.0 255.255.255.0 10.12.12.2</code>, R1 forwards to R2 with TTL 63, and the story repeats on R2 and R3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing a router "knows the way" because the cable is plugged in. A router knows only its connected subnets. Every remote subnet needs a route, and the reply needs a route too, on every router along the way back.</p></div>

<div class="exam"><p><b>Exam trap.</b> The source and destination <b>IP</b> addresses stay the same end to end (without NAT); the source and destination <b>MAC</b> addresses change at every router. A question that asks for the destination MAC of a frame leaving PC1 wants R1's interface MAC, not PC2's.</p></div>

<div class="scn"><h4>The new branch that could only ping itself</h4><p>A retail chain opened a store with a new router. The installer configured both interfaces, the LAN and the WAN, and both showed up/up. Store staff could ping the router's LAN address but nothing at head office. The engineer ran <code>show ip route</code> and saw only C and L entries: no static route, no default route, no routing protocol. The router was dropping everything not directly connected. One line, <code>ip route 0.0.0.0 0.0.0.0</code> toward the WAN next hop, plus a return route at head office fixed it.</p><p><b>Lesson:</b> up/up interfaces are only the start; forwarding needs a route to the destination and a route back.</p></div>

<div class="iv"><p class="q">"Walk me through what a router does when a packet arrives."</p><p>Strong answer: check the destination MAC and FCS, strip Layer 2, read the destination IP, do a longest prefix match in the routing table (or CEF FIB), drop and send ICMP unreachable if nothing matches, decrement TTL and drop with ICMP time exceeded if it reaches zero, resolve the next hop MAC with ARP or the adjacency table, then rewrite the frame with new MACs and send it out the exit interface. Mention that the IPs do not change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A router forwards on the destination IP only, using its routing table.</li>
<li>Routing builds the table; forwarding uses it (CEF FIB and adjacency table on Cisco).</li>
<li>Per packet: accept frame, look up, TTL minus 1, resolve next-hop MAC, rewrite and send.</li>
<li>Routes come from connected interfaces, static configuration or dynamic protocols.</li>
<li>No matching route and no default route means drop plus ICMP unreachable.</li>
</ul></div>
`,hi:`
<p>Ek bada railway junction socho. Trains kai directions se aati hain, aur junction par signal operator sirf ek cheez dekhta hai: train ke aage likha <b>destination</b>. Woh apna routes ka bada board check karta hai, us line ko dhoondhta hai jo wahan jaati hai, points switch karta hai aur train aage bhej deta hai. Use farak nahi padta ki train mein kaun hai ya train kahan se chali. Agar board par us destination ki koi line nahi hai, to train junction par hi ruk jaati hai. Router wahi signal operator hai, aur uska board hai <b>routing table</b>.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Router har packet ke saath exactly kya karta hai, step by step.</li>
<li><code>show ip route</code> ka har field kaise padhein: codes, prefix, [AD/metric], next hop, outgoing interface aur gateway of last resort.</li>
<li>Connected aur local routes, aur local routes /32 kyun hote hain.</li>
<li>Longest prefix match, administrative distance aur metric, aur router inhe kis order mein use karta hai.</li>
<li>Static routes ke teeno forms (next-hop, exit interface, fully specified), plus default, floating, host aur summary static routes.</li>
<li>Recursive lookup, return-path thinking, IPv6 static route recap, aur ek troubleshooting workflow jo aap ek real NOC ticket par use karoge.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko <b>CCNA IPv4 addressing aur subnetting</b> module (network address, mask, prefix length, block size), <b>inter-VLAN routing</b> module (default gateway, ARP, har hop par MAC rewrite) aur basic IOS navigation mein comfortable hona chahiye. Hum unhe dobara padhane ki jagah unka reference denge. Agla module, <b>OSPFv2</b>, routers ko routes apne aap seekhne deta hai; yeh module aapko woh table padhna aur control karna sikhata hai jise baad mein OSPF bharega.</p>

<h3>Routing aur forwarding mein fark</h3>
<p>Do words aksar mix ho jaate hain, isliye abhi define kar lete hain.</p>
<dl class="terms">
<dt>Routing</dt><dd>Table banana: seekhna ki kaunse networks exist karte hain aur har ek tak kaunsa neighbour le jaata hai. Sources hain connected interfaces, aapke type kiye static routes, aur OSPF jaise dynamic protocols.</dd>
<dt>Forwarding</dt><dd>Table use karna: har packet ke liye destination lookup karna aur packet ko sahi interface se bahar dhakelna. Cisco routers par yeh <b>CEF</b> (Cisco Express Forwarding) karta hai, jo table ki ek fast copy pehle se bana ke rakhta hai jise <b>FIB</b> kehte hain, plus ready-made Layer 2 headers ki <b>adjacency table</b>.</dd>
</dl>

<h3>Per-packet walk</h3>
<p>Jab router interface par frame aata hai, router har baar same steps karta hai:</p>
<ol>
<li><b>Frame accept karo.</b> Destination MAC router ke apne interface ka MAC hona chahiye (ya koi broadcast ya multicast jo woh sunta hai). Router FCS check karta hai aur Ethernet header hata deta hai.</li>
<li><b>Destination IP padho.</b> Agar yeh router ka apna address hai, to packet router ke liye hi hai (ping, SSH, routing protocol message).</li>
<li><b>Routing table lookup karo.</b> Router <b>sabse specific</b> matching route dhoondhta hai, yaani longest prefix match. Koi match nahi aur default route bhi nahi, to packet drop hota hai aur source ko ICMP destination unreachable wapas jaata hai.</li>
<li><b>TTL ghatao.</b> Agar TTL 0 ho jaaye, packet drop hota hai aur sender ko ICMP time exceeded jaata hai. Traceroute isi ka use karta hai.</li>
<li><b>Next hop ko MAC mein resolve karo.</b> Route ek next-hop IP aur outgoing interface deta hai; ARP (ya ready-made adjacency) next hop ka MAC deta hai.</li>
<li><b>Naya frame banao aur bhejo.</b> Naya source MAC (router ka exit interface), naya destination MAC (next hop), source aur destination IP wahi.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology PC1 R1 R2 R3 PC2">
<rect x="10" y="150" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="65" y="190" text-anchor="middle" class="svg-muted" font-size="12">172.16.1.10</text>
<rect x="130" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="185" y="62" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="185" y="80" text-anchor="middle" class="svg-muted" font-size="12">Studio-A gw .1</text>
<rect x="265" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="400" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="455" y="62" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="455" y="80" text-anchor="middle" class="svg-muted" font-size="12">Studio-B gw .1</text>
<rect x="520" y="150" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="575" y="190" text-anchor="middle" class="svg-muted" font-size="12">172.16.3.10</text>
<line x1="65" y1="150" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="265" y2="65" stroke="#64748b" stroke-width="2"/><line x1="375" y1="65" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="575" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="253" y="115" text-anchor="middle" class="svg-accent" font-size="12">10.12.12.0/30</text>
<text x="388" y="115" text-anchor="middle" class="svg-accent" font-size="12">10.23.23.0/30</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Har router hop: naye MACs, same IPs, TTL minus 1</text>
</svg><p class="cap">Pehla lab topology: do studio LANs ek transit router se jude. Shuru mein har router ko sirf apne links pata hote hain.</p></div>

<h3>Routes kahan se aate hain</h3>
<p>Router ki table teen tarike se bharti hai. <b>Connected aur local routes</b> apne aap aate hain jab IP address wala interface up/up hota hai. <b>Static routes</b> aap <code>ip route</code> se type karte ho. <b>Dynamic routes</b> OSPF, EIGRP ya BGP jaise protocols neighbours se seekhte hain. Upar ke lab mein R1 ko 172.16.1.0/24 aur 10.12.12.0/30 pata hain kyunki woh connected hain, lekin use bilkul nahi pata ki R3 ke peeche 172.16.3.0/24 exist karta hai. Jab tak aap route add nahi karte, PC1 se PC2 ka ping R1 par hi mar jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (172.16.1.10) PC2 (172.16.3.10) ko ping karta hai. PC1 dekhta hai ki 172.16.3.10 uske /24 mein nahi hai, isliye woh frame apne gateway R1 (172.16.1.1) ko bhejta hai. R1 frame hataata hai, destination 172.16.3.10 padhta hai aur apni table search karta hai. Use sirf 172.16.1.0/24 aur 10.12.12.0/30 milte hain. Koi match nahi, koi default nahi: R1 packet drop karta hai aur ICMP unreachable lautata hai. PC1 R1 ko source dikhate hue "Destination host unreachable" print karta hai. <code>ip route 172.16.3.0 255.255.255.0 10.12.12.2</code> add karne ke baad R1 packet TTL 63 ke saath R2 ko forward karta hai, aur yahi kahani R2 aur R3 par repeat hoti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki cable lagi hai isliye router ko "raasta pata hai". Router ko sirf apne connected subnets pata hote hain. Har remote subnet ko ek route chahiye, aur reply ko bhi route chahiye, wapas aane wale raaste ke har router par.</p></div>

<div class="exam"><p><b>Exam trap.</b> Source aur destination <b>IP</b> addresses end to end same rehte hain (bina NAT ke); source aur destination <b>MAC</b> addresses har router par badalte hain. Agar question PC1 se nikalne wale frame ka destination MAC pooche, to jawab R1 ke interface ka MAC hai, PC2 ka nahi.</p></div>

<div class="scn"><h4>Nayi branch jo sirf khud ko ping kar paati thi</h4><p>Ek retail chain ne naye router ke saath ek store khola. Installer ne dono interfaces, LAN aur WAN, configure kiye aur dono up/up dikhe. Store staff router ka LAN address ping kar paata tha lekin head office ka kuch nahi. Engineer ne <code>show ip route</code> chalaya aur sirf C aur L entries dikhi: na static route, na default route, na routing protocol. Router har woh cheez drop kar raha tha jo directly connected nahi thi. Ek line, WAN next hop ki taraf <code>ip route 0.0.0.0 0.0.0.0</code>, plus head office par ek return route ne ise fix kiya.</p><p><b>Seekh:</b> up/up interfaces sirf shuruaat hain; forwarding ko destination tak route aur wapas aane ka route dono chahiye.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki packet aane par router kya karta hai."</p><p>Strong answer: destination MAC aur FCS check karo, Layer 2 hatao, destination IP padho, routing table (ya CEF FIB) mein longest prefix match karo, kuch match na ho to drop karke ICMP unreachable bhejo, TTL ghatao aur zero ho jaaye to ICMP time exceeded ke saath drop karo, ARP ya adjacency table se next hop MAC resolve karo, phir naye MACs ke saath frame rewrite karke exit interface se bhejo. Yeh zaroor bolo ki IPs nahi badalte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router sirf destination IP par forward karta hai, apni routing table use karke.</li>
<li>Routing table banata hai; forwarding use karta hai (Cisco par CEF FIB aur adjacency table).</li>
<li>Har packet: frame accept, lookup, TTL minus 1, next-hop MAC resolve, rewrite aur send.</li>
<li>Routes connected interfaces, static configuration ya dynamic protocols se aate hain.</li>
<li>Koi matching route nahi aur default route bhi nahi, matlab drop plus ICMP unreachable.</li>
</ul></div>
`}};export{e as default};