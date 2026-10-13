var e={id:`big-picture`,h:{en:`The big picture: steering, separating and watching paths`,hi:`Big picture: paths ko steer karna, alag karna aur nazar rakhna`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to override the routing table for selected traffic with <b>policy-based routing (PBR)</b>, split one router into several independent routers with <b>VRF-lite</b>, and detect a dead neighbour in well under a second with <b>Bidirectional Forwarding Detection (BFD)</b>. For each one you will configure it, verify it, break it, fix it, and explain it in an interview. The hands-on lab sends a guest Wi-Fi subnet out through a second internet provider, and the troubleshooting chapter walks that lab step by step and adds VRF and BFD tickets.</p>

<p><b>Prerequisites.</b> You should already be comfortable with static routes, OSPF and EIGRP neighbours, basic BGP, access control lists and route maps. Route maps and prefix lists are taught in depth in the <i>AD, route maps, prefix lists &amp; redistribution</i> module, and IP SLA with object tracking is covered in the <i>Syslog, debug, SNMP, DHCP, IP SLA &amp; NetFlow</i> module. Here we reuse those tools; we do not re-teach them from zero. If you studied the ENCOR <i>VRF and tunnels</i> module, VRF-lite will feel familiar; this module adds the per-protocol configuration and the troubleshooting depth that ENARSI expects.</p>

<h3>An analogy: the airport</h3>
<p>Think of a big airport. The departure board tells every passenger which gate to use based only on the <b>destination city</b>. That is normal routing: destination address, longest match wins, no questions asked.</p>
<ul>
<li><b>PBR</b> is the special lane an airport staff member opens: "Everyone holding a guest pass, go to gate B, no matter where you fly." The decision uses something other than the destination, such as who you are (the source address), what you carry (the protocol or port), or how big your bag is (the packet length).</li>
<li><b>VRF-lite</b> is building two separate terminals inside the same airport. Domestic and international passengers never meet, each terminal has its own departure board, and two passengers in different terminals can even carry the same ticket number without confusion. On a router, each VRF has its own routing table, so overlapping IP addresses are fine.</li>
<li><b>BFD</b> is the radio check between the tower and every aircraft every few milliseconds. If three checks in a row get no answer, the tower immediately reroutes, instead of waiting 40 seconds for someone to notice the plane is gone.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Lab topology">
<rect x="20" y="40" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="13">PC-STAFF</text><text x="85" y="76" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10</text>
<rect x="20" y="186" width="130" height="44" rx="8" fill="#fde68a"/><text x="85" y="206" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text><text x="85" y="222" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.10</text>
<rect x="215" y="110" width="110" height="50" rx="8" fill="#bae6fd"/><text x="270" y="132" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="270" y="150" text-anchor="middle" class="svg-muted" font-size="12">PBR here</text>
<rect x="385" y="30" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="435" y="57" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="385" y="196" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="435" y="223" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="530" y="110" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="577" y="132" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="577" y="150" text-anchor="middle" class="svg-muted" font-size="12">SRV .10</text>
<line x1="150" y1="62" x2="215" y2="125" stroke="#64748b" stroke-width="2"/><text x="170" y="110" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="150" y1="208" x2="215" y2="148" stroke="#64748b" stroke-width="2"/><text x="170" y="165" class="svg-accent" font-size="12">Gi0/3</text>
<line x1="325" y1="120" x2="385" y2="55" stroke="#64748b" stroke-width="2"/><text x="330" y="80" class="svg-muted" font-size="12">Gi0/0 10.0.1.2</text>
<line x1="325" y1="150" x2="385" y2="215" stroke="#64748b" stroke-width="2"/><text x="330" y="200" class="svg-muted" font-size="12">Gi0/1 10.0.2.2</text>
<line x1="485" y1="52" x2="540" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="485" y1="218" x2="540" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="320" y="262" text-anchor="middle" class="svg-ink" font-size="12">Default route via ISP1; guest traffic must use ISP2; SRV = 198.51.100.10</text>
</svg><p class="cap">The lab topology used throughout the module: EDGE has two providers, a staff LAN and a guest Wi-Fi LAN.</p></div>

<h3>Why these three topics live together</h3>
<p>They look unrelated, but all three answer the same business question: <b>which path should this traffic take, and how fast do we notice when that path breaks?</b> PBR chooses a path per packet. VRF-lite chooses a path per routing table, which is often a cleaner way to meet the same need. BFD tells the routing protocols, static routes and even tracked PBR next hops that a path is gone, in milliseconds instead of tens of seconds.</p>

<table class="cmp"><tr><th>Blueprint item (300-410 v1.1)</th><th>What it means for you</th><th>Chapters</th></tr>
<tr><td>1.6 Troubleshoot policy-based routing</td><td>Route maps with match and set, where the policy is applied, failure behaviour, tracking, local policy, verification</td><td>2 to 5, 11</td></tr>
<tr><td>1.7 Troubleshoot VRF-Lite</td><td>VRF definition, interface assignment, per-VRF OSPF, EIGRP, BGP and static routes, route leaking, VRF-aware tools</td><td>6 to 8, 11</td></tr>
<tr><td>1.11 Describe BFD</td><td>Async and echo modes, timers and detection time, client registration, verification, design cautions</td><td>9, 10, 11</td></tr>
<tr><td>1.5 Summarisation (cross-reference)</td><td>How a summary route changes PBR default next-hop decisions, and summarising inside a VRF</td><td>4, 7</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> The Noida office has two internet links. ISP1 is a 500 Mbps business line; ISP2 is a cheaper 200 Mbps broadband line. The staff subnet 192.168.10.0/24 (about 80 laptops) must stay on ISP1. The guest Wi-Fi subnet 192.168.20.0/24 (up to 150 phones on a busy day) must use ISP2 so visitors never eat the business bandwidth. The routing table has one default route: <code>0.0.0.0/0 via 10.0.1.1</code> (ISP1). You cannot add a second default route with equal cost, because then both subnets would share both links. PBR solves it with three lines of logic: select the guest source, set the next hop 10.0.2.1, apply it where guest packets enter (Gi0/3).</p></div>

<div class="note"><p><b>Three ways to meet the same goal.</b> In this lab you could also solve the guest problem by putting Gi0/3 and Gi0/1 into a VRF named GUEST with its own default route to ISP2. Knowing both answers, and when to choose each, is exactly what senior interviewers probe. Chapter 8 compares them.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking PBR changes the routing table. It does not. <code>show ip route</code> looks identical before and after; the decision happens per packet on the ingress interface. Engineers who only check the routing table conclude "PBR is not working" when it is working perfectly.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint verbs matter. PBR and VRF-lite are "troubleshoot" items, so expect show output and broken configs. BFD is a "describe" item, so expect questions on modes, timers, detection time and which protocols can use it, not long debugging sessions.</p></div>

<div class="scn"><h4>The guest network that ate the business link</h4><p>A training institute gave visitors free Wi-Fi on the same router as the staff network. During an open day, 200 visitors started streaming videos and the staff video classes began to freeze. The router already had a second, idle broadband link. The engineer checked <code>show interfaces</code> and saw ISP1 at 98% output load while ISP2 carried almost nothing. She wrote a PBR policy on the guest LAN interface that set the next hop to the broadband router, verified with a traceroute from a guest phone that hop 2 was now the broadband gateway, and watched the ISP1 load fall to 40% within a minute.</p><p><b>Lesson:</b> PBR lets you choose a path by who is sending, which destination-based routing can never do.</p></div>

<div class="iv"><p class="q">"How is policy-based routing different from normal routing?"</p><p>Strong answer: normal routing forwards on the destination address alone, using the longest match in the routing table. PBR is applied inbound on an interface and can forward on the source address, protocol, port or packet length, using a route map with match and set clauses. It is evaluated before the routing table, and packets that do not match are routed normally. Give a concrete use: guest traffic over a second ISP, or voice over the low-latency link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR overrides the routing table per packet, based on source, protocol, port or length.</li>
<li>VRF-lite gives one router several independent routing tables, without MPLS.</li>
<li>BFD detects a failed forwarding path in milliseconds and tells routing protocols and static routes.</li>
<li>Blueprint: 1.6 PBR and 1.7 VRF-lite are troubleshoot items; 1.11 BFD is a describe item.</li>
<li>The module lab: EDGE sends guest 192.168.20.0/24 via ISP2 (10.0.2.1) while staff keep ISP1.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap <b>policy-based routing (PBR)</b> se chune hue traffic ke liye routing table ko override kar paoge, <b>VRF-lite</b> se ek router ko kai independent routers mein baant paoge, aur <b>Bidirectional Forwarding Detection (BFD)</b> se ek second se bhi kam mein dead neighbour pakad paoge. Har ek ko aap configure karoge, verify karoge, todoge, fix karoge, aur interview mein samjha paoge. Hands-on lab ek guest Wi-Fi subnet ko doosre internet provider se bahar bhejti hai, aur troubleshooting chapter us lab ko step by step walk karta hai aur VRF aur BFD tickets bhi jodta hai.</p>

<p><b>Prerequisites.</b> Aapko static routes, OSPF aur EIGRP neighbours, basic BGP, access control lists aur route maps mein pehle se comfortable hona chahiye. Route maps aur prefix lists <i>AD, route maps, prefix lists &amp; redistribution</i> module mein detail mein padhaye gaye hain, aur IP SLA with object tracking <i>Syslog, debug, SNMP, DHCP, IP SLA &amp; NetFlow</i> module mein cover hai. Yahan hum in tools ko reuse karte hain; zero se dobara nahi padhate. Agar aapne ENCOR ka <i>VRF and tunnels</i> module padha hai, to VRF-lite familiar lagega; yeh module per-protocol configuration aur troubleshooting ki woh gehraai jodta hai jo ENARSI expect karta hai.</p>

<h3>Ek analogy: airport</h3>
<p>Ek bade airport ke baare mein socho. Departure board har passenger ko sirf <b>destination city</b> ke hisaab se gate batata hai. Yahi normal routing hai: destination address, longest match jeet-ta hai, koi sawaal nahi.</p>
<ul>
<li><b>PBR</b> woh special lane hai jo airport staff kholta hai: "Jiske paas guest pass hai, gate B par jao, chahe kahin bhi ud rahe ho." Decision destination ke alawa kisi aur cheez par hota hai, jaise aap kaun ho (source address), kya le ja rahe ho (protocol ya port), ya aapka bag kitna bada hai (packet length).</li>
<li><b>VRF-lite</b> ek hi airport ke andar do alag terminals banana hai. Domestic aur international passengers kabhi nahi milte, har terminal ka apna departure board hai, aur alag terminals ke do passengers same ticket number bhi rakh sakte hain bina confusion ke. Router par har VRF ki apni routing table hoti hai, isliye overlapping IP addresses chal jaate hain.</li>
<li><b>BFD</b> tower aur har aircraft ke beech har kuch milliseconds mein hone wala radio check hai. Agar lagatar teen checks ka jawab nahi aata, tower turant reroute kar deta hai, 40 second wait karne ke bajaye ki koi notice kare ki plane gayab hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Lab topology">
<rect x="20" y="40" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="13">PC-STAFF</text><text x="85" y="76" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10</text>
<rect x="20" y="186" width="130" height="44" rx="8" fill="#fde68a"/><text x="85" y="206" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text><text x="85" y="222" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.10</text>
<rect x="215" y="110" width="110" height="50" rx="8" fill="#bae6fd"/><text x="270" y="132" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="270" y="150" text-anchor="middle" class="svg-muted" font-size="12">PBR yahan</text>
<rect x="385" y="30" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="435" y="57" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="385" y="196" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="435" y="223" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="530" y="110" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="577" y="132" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="577" y="150" text-anchor="middle" class="svg-muted" font-size="12">SRV .10</text>
<line x1="150" y1="62" x2="215" y2="125" stroke="#64748b" stroke-width="2"/><text x="170" y="110" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="150" y1="208" x2="215" y2="148" stroke="#64748b" stroke-width="2"/><text x="170" y="165" class="svg-accent" font-size="12">Gi0/3</text>
<line x1="325" y1="120" x2="385" y2="55" stroke="#64748b" stroke-width="2"/><text x="330" y="80" class="svg-muted" font-size="12">Gi0/0 10.0.1.2</text>
<line x1="325" y1="150" x2="385" y2="215" stroke="#64748b" stroke-width="2"/><text x="330" y="200" class="svg-muted" font-size="12">Gi0/1 10.0.2.2</text>
<line x1="485" y1="52" x2="540" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="485" y1="218" x2="540" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="320" y="262" text-anchor="middle" class="svg-ink" font-size="12">Default route ISP1 se; guest traffic ISP2 se jaaye; SRV = 198.51.100.10</text>
</svg><p class="cap">Poore module mein use hone wali lab topology: EDGE ke paas do providers, ek staff LAN aur ek guest Wi-Fi LAN hai.</p></div>

<h3>Yeh teen topics saath kyun hain</h3>
<p>Yeh alag alag lagte hain, lekin teeno ek hi business sawaal ka jawab dete hain: <b>is traffic ko kaunsa path lena chahiye, aur woh path tootne par hume kitni jaldi pata chalta hai?</b> PBR har packet ke liye path chunta hai. VRF-lite har routing table ke liye path chunta hai, jo aksar wahi zaroorat poori karne ka zyada saaf tareeka hai. BFD routing protocols, static routes aur tracked PBR next hops ko bhi batata hai ki path chala gaya, das-das second ke bajaye milliseconds mein.</p>

<table class="cmp"><tr><th>Blueprint item (300-410 v1.1)</th><th>Aapke liye iska matlab</th><th>Chapters</th></tr>
<tr><td>1.6 Troubleshoot policy-based routing</td><td>Match aur set wale route maps, policy kahan lagti hai, failure behaviour, tracking, local policy, verification</td><td>2 se 5, 11</td></tr>
<tr><td>1.7 Troubleshoot VRF-Lite</td><td>VRF definition, interface assignment, per-VRF OSPF, EIGRP, BGP aur static routes, route leaking, VRF-aware tools</td><td>6 se 8, 11</td></tr>
<tr><td>1.11 Describe BFD</td><td>Async aur echo modes, timers aur detection time, client registration, verification, design cautions</td><td>9, 10, 11</td></tr>
<tr><td>1.5 Summarisation (cross-reference)</td><td>Summary route PBR ke default next-hop decisions ko kaise badalta hai, aur VRF ke andar summarise karna</td><td>4, 7</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Noida office mein do internet links hain. ISP1 ek 500 Mbps business line hai; ISP2 ek sasti 200 Mbps broadband line hai. Staff subnet 192.168.10.0/24 (lagbhag 80 laptops) ISP1 par hi rehna chahiye. Guest Wi-Fi subnet 192.168.20.0/24 (busy din par 150 tak phones) ISP2 use kare taaki visitors business bandwidth na kha jaayein. Routing table mein ek default route hai: <code>0.0.0.0/0 via 10.0.1.1</code> (ISP1). Aap equal cost wala doosra default route nahi jod sakte, kyunki tab dono subnets dono links share karenge. PBR ise logic ki teen lines se solve karta hai: guest source chuno, next hop 10.0.2.1 set karo, use wahan lagao jahan guest packets aate hain (Gi0/3).</p></div>

<div class="note"><p><b>Ek hi goal ke teen raaste.</b> Is lab mein aap guest problem ko Gi0/3 aur Gi0/1 ko GUEST naam ke VRF mein daal kar bhi solve kar sakte ho, jiska ISP2 ki taraf apna default route ho. Dono jawab jaanna, aur kab kaunsa chunna hai, yahi senior interviewers check karte hain. Chapter 8 inki tulna karta hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki PBR routing table badalta hai. Aisa nahi hai. <code>show ip route</code> pehle aur baad mein bilkul same dikhta hai; decision ingress interface par har packet ke liye hota hai. Jo engineers sirf routing table check karte hain, woh keh dete hain "PBR kaam nahi kar raha" jabki woh bilkul sahi kaam kar raha hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint ke verbs matter karte hain. PBR aur VRF-lite "troubleshoot" items hain, isliye show output aur toote configs expect karo. BFD "describe" item hai, isliye modes, timers, detection time aur kaunse protocols ise use kar sakte hain, in par sawaal expect karo, lambe debugging sessions nahi.</p></div>

<div class="scn"><h4>Guest network jo business link kha gaya</h4><p>Ek training institute ne visitors ko staff network wale router par hi free Wi-Fi diya. Open day par 200 visitors ne videos stream karna shuru kiya aur staff ki video classes atakne lagi. Router par pehle se ek doosra, khaali broadband link tha. Engineer ne <code>show interfaces</code> check kiya aur dekha ki ISP1 98% output load par tha jabki ISP2 lagbhag kuch nahi le ja raha tha. Usne guest LAN interface par PBR policy likhi jo next hop ko broadband router par set karti thi, ek guest phone se traceroute karke verify kiya ki hop 2 ab broadband gateway hai, aur ek minute mein ISP1 ka load 40% par girte dekha.</p><p><b>Seekh:</b> PBR aapko bhejne wale ke hisaab se path chunne deta hai, jo destination-based routing kabhi nahi kar sakti.</p></div>

<div class="iv"><p class="q">"Policy-based routing normal routing se kaise alag hai?"</p><p>Strong answer: normal routing sirf destination address par forward karti hai, routing table ke longest match se. PBR interface par inbound lagta hai aur source address, protocol, port ya packet length par forward kar sakta hai, match aur set clauses wale route map se. Yeh routing table se pehle evaluate hota hai, aur jo packets match nahi karte woh normal route hote hain. Ek concrete use do: guest traffic doosre ISP se, ya voice kam-latency link se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR har packet ke liye routing table ko override karta hai, source, protocol, port ya length ke basis par.</li>
<li>VRF-lite ek router ko kai independent routing tables deta hai, bina MPLS ke.</li>
<li>BFD failed forwarding path ko milliseconds mein pakadta hai aur routing protocols aur static routes ko batata hai.</li>
<li>Blueprint: 1.6 PBR aur 1.7 VRF-lite troubleshoot items hain; 1.11 BFD describe item hai.</li>
<li>Module lab: EDGE guest 192.168.20.0/24 ko ISP2 (10.0.2.1) se bhejta hai jabki staff ISP1 par rehta hai.</li>
</ul></div>
`}};export{e as default};