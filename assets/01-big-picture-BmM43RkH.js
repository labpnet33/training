var e={id:`big-picture`,h:{en:`The big picture: how routers move packets between networks`,hi:`Big picture: routers networks ke beech packets kaise le jaate hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to read a routing table line by line, predict which route a router will use for any destination, configure static, default and floating routes, explain how distance-vector, link-state and path-vector protocols differ, bring up OSPF and watch it reroute around a failed link, and describe EIGRP, BGP, NAT/PAT, first hop redundancy (FHRP), virtual IPs and subinterfaces at the level the CompTIA Network+ N10-009 exam expects (objective 2.1, routing technologies). You will also practise a repeatable troubleshooting workflow for "it does not ping" tickets.</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 addresses, subnet masks and prefix lengths (the addressing module), and know that a switch forwards frames inside one VLAN while a router connects different networks (the switching module, where you already met router-on-a-stick). Nothing about routing protocols is assumed.</p>

<h3>An analogy: the postal sorting office</h3>
<p>Imagine a letter posted in Pune for someone in Delhi. The local post office does not know every street in India. It knows three things: the letters for its own area it can deliver itself, letters for a few known cities go to specific sorting hubs, and everything else goes to the big national hub. Each hub repeats the same decision with its own list. The letter hops from office to office until it reaches the office that can deliver it by hand.</p>
<p>A <b>router</b> is that post office. The letter is an IP <b>packet</b>. The list of "which hub for which city" is the <b>routing table</b>. The "everything else goes to the national hub" rule is the <b>default route</b>. Each office making its own decision, one hop at a time, is called <b>hop-by-hop forwarding</b>. No single router knows the full path; each only knows the <b>next hop</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab 1 topology: HQ, branch and internet">
<rect x="10" y="30" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">PC-HQ .10</text>
<rect x="200" y="30" width="110" height="40" rx="8" fill="#bae6fd"/><text x="255" y="55" text-anchor="middle" class="svg-ink" font-size="13">HQ router</text>
<rect x="400" y="30" width="100" height="40" rx="8" fill="#fde68a"/><text x="450" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="540" y="30" width="95" height="40" rx="8" fill="#bbf7d0"/><text x="587" y="55" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text>
<rect x="200" y="160" width="110" height="40" rx="8" fill="#bae6fd"/><text x="255" y="185" text-anchor="middle" class="svg-ink" font-size="13">BR router</text>
<rect x="10" y="160" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="185" text-anchor="middle" class="svg-ink" font-size="13">PC-BR .10</text>
<line x1="120" y1="50" x2="200" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="400" y2="50" stroke="#64748b" stroke-width="2"/><line x1="500" y1="50" x2="540" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="255" y1="70" x2="255" y2="160" stroke="#64748b" stroke-width="2"/><line x1="120" y1="180" x2="200" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="160" y="22" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<text x="355" y="22" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.0/30</text>
<text x="330" y="120" class="svg-muted" font-size="12">10.0.12.0/30</text>
<text x="160" y="215" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24</text>
<text x="450" y="110" text-anchor="middle" class="svg-accent" font-size="13">Lab 1: static + default</text>
</svg><p class="cap">Lab 1 topology. HQ joins the branch router BR and the ISP. You will add the routes that let all three networks reach each other.</p></div>

<h3>Why routing exists at all</h3>
<p>Every host can reach its own subnet directly: it ARPs for the destination and sends the frame. The moment the destination is on a different subnet, the host sends the packet to its <b>default gateway</b>, which is a router interface. From then on, routers decide. A router automatically knows the subnets on its own interfaces (called <b>connected</b> networks). Everything else must be taught to it, either by a human typing <b>static routes</b> or by routers talking to each other with a <b>dynamic routing protocol</b> such as OSPF.</p>
<p>That gives this module its shape:</p>
<ul>
<li><b>Reading and choosing:</b> the routing table, longest prefix match, administrative distance and metric.</li>
<li><b>Static routing:</b> static, default, floating and summary routes. You do this in Lab 1 (HQ, branch and internet).</li>
<li><b>Dynamic routing:</b> protocol families, then OSPF in depth. You do this in Lab 2 (a triangle of three routers, then a link failure).</li>
<li><b>Concepts around routing:</b> EIGRP and BGP, NAT and PAT, FHRP and virtual IPs, subinterfaces.</li>
<li><b>Troubleshooting:</b> a step-by-step method, then a summary and exam checklist.</li>
</ul>

<div class="eg"><p><b>Worked example: one packet, three decisions.</b> PC-BR (10.2.2.10) pings 8.8.8.8. Decision 1: PC-BR sees 8.8.8.8 is not in 10.2.2.0/24, so it sends the packet to its gateway 10.2.2.1 (BR). Decision 2: BR has no specific route for 8.8.8.8, so it uses its default route to HQ, 10.0.12.1. Decision 3: HQ also has no specific route, so it uses its default route to the ISP, 203.0.113.1. The ISP has 8.8.8.0/24 connected and delivers it. The reply makes the same kind of decisions in the opposite direction, which is why every router on the path needs a route back.</p></div>

<h3>Where this module sits in the course</h3>
<p>Before this module you subnetted networks and built VLANs with inter-VLAN routing. After it, the services module goes deep on DHCP, DNS and NAT with a PAT lab, and the troubleshooting module reuses the routing checks you learn here. So in this module NAT and FHRP stay at concept level; routing tables, static routes and OSPF get the full hands-on treatment.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that once a packet reaches the far network, the job is done. Communication is two-way. A ping succeeds only if the echo request reaches the target <b>and</b> the echo reply finds its way back. Most broken labs have a perfect route in one direction and nothing in the other.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network+ questions often describe a host that can reach its own subnet but nothing else. Before blaming the router, check the host's default gateway. A missing or wrong gateway looks exactly like a routing failure, but no router ever sees the packet.</p></div>

<div class="scn"><h4>The branch that could email but not print</h4><p>A new branch office opened with a router that had a single default route to HQ. Staff could reach email and the internet, but the HQ helpdesk could not reach the branch printer for remote management. The engineer traced from HQ: the packets reached the branch router and the printer, but the printer's replies never came back. The printer had been configured with a static IP and no default gateway, so it could only talk to its own subnet. Adding the gateway 10.2.2.1 fixed it instantly.</p><p><b>Lesson:</b> routing is end to end. Hosts, routers and the return path all have to agree.</p></div>

<div class="iv"><p class="q">"What does a router actually do with a packet?"</p><p>Strong answer: it receives the frame, strips the Layer 2 header, reads the destination IP, looks it up in the routing table using longest prefix match, decrements TTL, and forwards the packet out the chosen interface toward the next hop inside a new Layer 2 frame. Mention that the IP addresses stay the same end to end (unless NAT is involved) while the MAC addresses change at every hop. That one sentence shows you understand both layers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers forward packets between networks one hop at a time, using the routing table.</li>
<li>Connected networks are known automatically; everything else comes from static routes or routing protocols.</li>
<li>The default route is the "send everything else here" rule, like a national sorting hub.</li>
<li>Routing must work in both directions for any conversation to succeed.</li>
<li>Lab 1 builds static and default routing; Lab 2 builds OSPF and survives a link failure.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap routing table ko line by line padh paoge, kisi bhi destination ke liye predict kar paoge ki router kaunsa route use karega, static, default aur floating routes configure kar paoge, samjha paoge ki distance-vector, link-state aur path-vector protocols mein kya farak hai, OSPF chala kar dekh paoge ki woh failed link ke aas-paas kaise reroute karta hai, aur EIGRP, BGP, NAT/PAT, first hop redundancy (FHRP), virtual IPs aur subinterfaces ko us level par explain kar paoge jo CompTIA Network+ N10-009 exam expect karta hai (objective 2.1, routing technologies). Aap "ping nahi ho raha" wale tickets ke liye ek repeatable troubleshooting workflow bhi practise karoge.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addresses, subnet masks aur prefix lengths ke saath comfortable hona chahiye (addressing module), aur pata hona chahiye ki switch ek VLAN ke andar frames forward karta hai jabki router alag networks ko jodta hai (switching module, jahan aap router-on-a-stick se mil chuke ho). Routing protocols ke baare mein kuch bhi pehle se assume nahi kiya gaya.</p>

<h3>Ek analogy: postal sorting office</h3>
<p>Socho Pune mein ek letter post hua jo Delhi mein kisi ke liye hai. Local post office ko India ki har gali nahi pata. Use teen cheezein pata hain: apne area ke letters woh khud deliver kar sakta hai, kuch jaane-pehchaane shehron ke letters specific sorting hubs ko jaate hain, aur baaki sab bade national hub ko jaata hai. Har hub apni list se yahi decision dohraata hai. Letter ek office se doosre office hop karta rehta hai jab tak us office tak na pahunch jaaye jo use haath se deliver kar sake.</p>
<p><b>Router</b> wahi post office hai. Letter ek IP <b>packet</b> hai. "Kis shehar ke liye kaunsa hub" wali list <b>routing table</b> hai. "Baaki sab national hub ko" wala rule <b>default route</b> hai. Har office ka apna decision khud lena, ek hop ek baar mein, <b>hop-by-hop forwarding</b> kehlaata hai. Kisi ek router ko poora path nahi pata; har router ko sirf <b>next hop</b> pata hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab 1 topology: HQ, branch aur internet">
<rect x="10" y="30" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">PC-HQ .10</text>
<rect x="200" y="30" width="110" height="40" rx="8" fill="#bae6fd"/><text x="255" y="55" text-anchor="middle" class="svg-ink" font-size="13">HQ router</text>
<rect x="400" y="30" width="100" height="40" rx="8" fill="#fde68a"/><text x="450" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="540" y="30" width="95" height="40" rx="8" fill="#bbf7d0"/><text x="587" y="55" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text>
<rect x="200" y="160" width="110" height="40" rx="8" fill="#bae6fd"/><text x="255" y="185" text-anchor="middle" class="svg-ink" font-size="13">BR router</text>
<rect x="10" y="160" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="185" text-anchor="middle" class="svg-ink" font-size="13">PC-BR .10</text>
<line x1="120" y1="50" x2="200" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="400" y2="50" stroke="#64748b" stroke-width="2"/><line x1="500" y1="50" x2="540" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="255" y1="70" x2="255" y2="160" stroke="#64748b" stroke-width="2"/><line x1="120" y1="180" x2="200" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="160" y="22" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<text x="355" y="22" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.0/30</text>
<text x="330" y="120" class="svg-muted" font-size="12">10.0.12.0/30</text>
<text x="160" y="215" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24</text>
<text x="450" y="110" text-anchor="middle" class="svg-accent" font-size="13">Lab 1: static + default</text>
</svg><p class="cap">Lab 1 topology. HQ branch router BR aur ISP ko jodta hai. Aap woh routes add karoge jinse teeno networks ek doosre tak pahunch sakein.</p></div>

<h3>Routing ki zaroorat hi kyun hai</h3>
<p>Har host apne subnet tak seedhe pahunch sakta hai: woh destination ke liye ARP karta hai aur frame bhej deta hai. Jaise hi destination alag subnet par hota hai, host packet apne <b>default gateway</b> ko bhejta hai, jo ek router interface hai. Uske baad decision routers lete hain. Router ko apne interfaces ke subnets apne aap pata hote hain (inhe <b>connected</b> networks kehte hain). Baaki sab use sikhaana padta hai, ya to insaan <b>static routes</b> type kare ya routers ek doosre se <b>dynamic routing protocol</b> jaise OSPF se baat karein.</p>
<p>Isi se is module ka structure banta hai:</p>
<ul>
<li><b>Padhna aur chunna:</b> routing table, longest prefix match, administrative distance aur metric.</li>
<li><b>Static routing:</b> static, default, floating aur summary routes. Yeh aap Lab 1 mein karoge (HQ, branch aur internet).</li>
<li><b>Dynamic routing:</b> protocol families, phir OSPF detail mein. Yeh aap Lab 2 mein karoge (teen routers ka triangle, phir ek link failure).</li>
<li><b>Routing ke aas-paas ke concepts:</b> EIGRP aur BGP, NAT aur PAT, FHRP aur virtual IPs, subinterfaces.</li>
<li><b>Troubleshooting:</b> step-by-step method, phir summary aur exam checklist.</li>
</ul>

<div class="eg"><p><b>Worked example: ek packet, teen decisions.</b> PC-BR (10.2.2.10) 8.8.8.8 ko ping karta hai. Decision 1: PC-BR dekhta hai ki 8.8.8.8 10.2.2.0/24 mein nahi hai, isliye packet apne gateway 10.2.2.1 (BR) ko bhejta hai. Decision 2: BR ke paas 8.8.8.8 ka koi specific route nahi, isliye woh HQ, 10.0.12.1 ki taraf apna default route use karta hai. Decision 3: HQ ke paas bhi specific route nahi, isliye woh ISP, 203.0.113.1 ki taraf apna default route use karta hai. ISP par 8.8.8.0/24 connected hai aur woh use deliver kar deta hai. Reply ulti direction mein isi tarah ke decisions leta hai, isiliye path ke har router ko wapas ka route chahiye.</p></div>

<h3>Course mein yeh module kahan aata hai</h3>
<p>Is module se pehle aapne networks subnet kiye aur inter-VLAN routing ke saath VLANs banaye. Iske baad services module DHCP, DNS aur NAT ko PAT lab ke saath detail mein padhata hai, aur troubleshooting module yahan seekhe routing checks dobara use karta hai. Isliye is module mein NAT aur FHRP concept level par rehte hain; routing tables, static routes aur OSPF ko poora hands-on treatment milta hai.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki packet door wale network tak pahunch gaya to kaam ho gaya. Communication do-tarfa hota hai. Ping tabhi succeed hoti hai jab echo request target tak pahunche <b>aur</b> echo reply wapas apna raasta dhoondh le. Zyada tar tooti hui labs mein ek direction mein perfect route hota hai aur doosri mein kuch nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network+ questions aksar aisa host describe karte hain jo apne subnet tak pahunch jaata hai lekin aur kahin nahi. Router ko blame karne se pehle host ka default gateway check karo. Missing ya galat gateway bilkul routing failure jaisa dikhta hai, lekin koi router packet ko dekhta hi nahi.</p></div>

<div class="scn"><h4>Branch jo email kar sakti thi lekin print nahi</h4><p>Ek naya branch office ek router ke saath khula jismein HQ ki taraf sirf ek default route tha. Staff email aur internet tak pahunch paa raha tha, lekin HQ helpdesk remote management ke liye branch printer tak nahi pahunch paa raha tha. Engineer ne HQ se trace kiya: packets branch router aur printer tak pahunche, lekin printer ke replies kabhi wapas nahi aaye. Printer par static IP configure tha aur koi default gateway nahi tha, isliye woh sirf apne subnet se baat kar sakta tha. Gateway 10.2.2.1 add karte hi turant theek ho gaya.</p><p><b>Seekh:</b> routing end to end hoti hai. Hosts, routers aur return path, sabko agree karna padta hai.</p></div>

<div class="iv"><p class="q">"Router packet ke saath asal mein karta kya hai?"</p><p>Strong answer: woh frame receive karta hai, Layer 2 header hataata hai, destination IP padhta hai, longest prefix match se routing table mein lookup karta hai, TTL kam karta hai, aur packet ko chune hue interface se next hop ki taraf ek naye Layer 2 frame mein forward karta hai. Yeh bhi bolo ki IP addresses end to end same rehte hain (jab tak NAT na ho) jabki MAC addresses har hop par badalte hain. Yeh ek sentence dikhata hai ki aap dono layers samajhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers routing table ki madad se packets ko networks ke beech ek hop ek baar mein forward karte hain.</li>
<li>Connected networks apne aap pata hote hain; baaki sab static routes ya routing protocols se aata hai.</li>
<li>Default route "baaki sab yahan bhejo" wala rule hai, national sorting hub ki tarah.</li>
<li>Kisi bhi baatcheet ke succeed hone ke liye routing dono directions mein kaam karni chahiye.</li>
<li>Lab 1 static aur default routing banata hai; Lab 2 OSPF banata hai aur link failure jhel leta hai.</li>
</ul></div>
`}};export{e as default};