var e={id:`big-picture`,h:{en:`From the castle-and-moat perimeter to the cloud security edge`,hi:`Castle-and-moat perimeter se cloud security edge tak`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why security moved from the office firewall to the cloud, compare SASE and SSE, and name every building block of Cisco Secure Access: DNS-layer security, the secure web gateway (SWG), CASB, the cloud firewall, data loss prevention (DLP), AI guardrails and zero trust network access (ZTNA). You will then build it hands-on: connect a branch router with an IPsec IKEv2 tunnel, protect a roaming laptop with Cisco Secure Client, write internet and private access rules by identity, group, category and application, stop sensitive data leaving in uploads and GenAI prompts, publish a private ERP without a VPN, and investigate a suspicious domain from Activity Search to a block.</p>

<h3>Prerequisites</h3>
<ul>
<li><b>Zero trust ideas</b> (sec-concepts): never trust by network location, verify identity and device, least privilege.</li>
<li><b>IPsec and IKEv2</b> (sec-crypto): IKE_SA_INIT, pre-shared keys, NAT traversal on UDP 4500.</li>
<li><b>Remote access VPN and Secure Client</b> (sec-ftd-vpn), and <b>URL filtering, Security Intelligence and DNS sinkholing</b> on a firewall (sec-ftd-ips). We refer back to them instead of re-teaching them.</li>
</ul>

<h3>An analogy: the housing society that hired a travelling guard</h3>
<p>Picture a gated housing society. For years one guard at the main gate checked everybody, and it worked because all residents lived, worked and shopped inside the gate. Then residents started working from cafes, from other cities and from home offices outside the society, and the shops they use moved to a big mall across town. Asking every resident to first walk back to the main gate, get checked, and then go to the mall would be slow and silly. So the society hires a security company with booths in every city. Wherever a resident is, the nearest booth checks them against the same society rules, knows exactly who they are, and keeps one logbook for everybody.</p>
<p>That is <b>Secure Service Edge (SSE)</b>: the inspection point moves from one box at head office to a cloud service with points of presence close to every user, every branch and every application.</p>

<h3>Three changes that broke the perimeter</h3>
<ul>
<li><b>Applications moved to SaaS and public cloud.</b> Mail, CRM, file sharing and now generative-AI tools live on the internet, not in your data center.</li>
<li><b>Users moved out.</b> Hybrid work means laptops spend most of their time at home, in hotels and on mobile networks, where the office firewall never sees their traffic.</li>
<li><b>Backhaul hurts.</b> Sending a branch's or a home user's traffic to the head-office firewall just to reach a SaaS app (<b>hairpinning</b>) adds latency, costs MPLS bandwidth and makes the head office a single point of failure.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Backhaul versus cloud security edge">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">Before: backhaul to HQ</text>
<rect x="20" y="40" width="90" height="36" rx="8" fill="#bae6fd"/><text x="65" y="63" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="20" y="100" width="90" height="36" rx="8" fill="#bae6fd"/><text x="65" y="123" text-anchor="middle" class="svg-ink" font-size="12">Home user</text>
<rect x="170" y="70" width="110" height="40" rx="8" fill="#fed7aa"/><text x="225" y="95" text-anchor="middle" class="svg-ink" font-size="12">HQ firewall</text>
<rect x="190" y="170" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="235" y="193" text-anchor="middle" class="svg-ink" font-size="12">SaaS</text>
<line x1="110" y1="58" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="110" y1="118" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="225" y1="110" x2="235" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="325" y="235" text-anchor="middle" class="svg-muted" font-size="12">extra hops, MPLS cost, one choke point</text>
<line x1="320" y1="30" x2="320" y2="215" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">After: inspect at the cloud edge</text>
<rect x="345" y="40" width="80" height="36" rx="8" fill="#bae6fd"/><text x="385" y="63" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="345" y="100" width="80" height="36" rx="8" fill="#bae6fd"/><text x="385" y="123" text-anchor="middle" class="svg-ink" font-size="12">Home user</text>
<rect x="455" y="65" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="87" text-anchor="middle" class="svg-ink" font-size="12">Secure</text><text x="500" y="104" text-anchor="middle" class="svg-ink" font-size="12">Access PoP</text>
<rect x="565" y="40" width="65" height="36" rx="8" fill="#bbf7d0"/><text x="597" y="63" text-anchor="middle" class="svg-ink" font-size="12">SaaS</text>
<rect x="565" y="100" width="65" height="36" rx="8" fill="#fde68a"/><text x="597" y="123" text-anchor="middle" class="svg-ink" font-size="12">DC app</text>
<line x1="425" y1="58" x2="455" y2="80" stroke="#64748b" stroke-width="2"/><line x1="425" y1="118" x2="455" y2="100" stroke="#64748b" stroke-width="2"/><line x1="545" y1="80" x2="565" y2="60" stroke="#64748b" stroke-width="2"/><line x1="545" y1="100" x2="565" y2="118" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Left: every flow detours through head office. Right: every flow is inspected at the nearest Secure Access point of presence, then goes straight to the internet, SaaS or a private app.</p></div>

<h3>The answer: identity-based security delivered from the cloud</h3>
<p>The modern answer is to move inspection to where users and apps meet. A cloud-delivered security edge sits close to the user, and every connection passes through it wherever the user is. Three ideas change at the same time:</p>
<ol>
<li><b>Identity replaces the IP address</b> as the main policy input. A rule says "Finance may reach the ERP", not "10.10.1.0/24 may reach 10.20.1.50".</li>
<li><b>Every request is evaluated</b> (zero trust: never trust, always verify), including device posture for access to private apps.</li>
<li><b>One policy, one client, one log</b>. DNS, web, cloud apps, data protection and private access share the same rules engine, the same Cisco Secure Client on the laptop and the same Activity Search.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A sales engineer works from Bengaluru. With backhaul, her request to the CRM goes Bengaluru to the Delhi head office (about 35 ms), through the firewall, and out to the CRM in Mumbai (about 25 ms): roughly 60 ms one way plus the head-office queue, and it eats 20 Mbit/s of the 100 Mbit/s MPLS link during the day. With Secure Access she reaches the Mumbai point of presence in about 8 ms and the CRM a few milliseconds later. The head-office link is freed for real head-office traffic, and the policy is exactly the same.</p></div>

<h3>The labs in this module</h3>
<table class="cmp"><tr><th>Lab</th><th>What you build</th><th>Taught in</th></tr>
<tr><td>Onboard a branch tunnel and a roaming laptop</td><td>Network tunnel group BRANCH-DEL, IKEv2 tunnel on BRANCH, Secure Client on ROAM1</td><td>Chapters 3, 4 and 5</td></tr>
<tr><td>Secure Internet Access</td><td>Block Gambling, Warn Social, Allow Sales CRM above a legacy block</td><td>Chapters 6 and 7</td></tr>
<tr><td>DLP and AI guardrails</td><td>Block PII to Cloud Storage, decryption, ChatAI Guardrails</td><td>Chapter 8</td></tr>
<tr><td>Zero trust access to the finance ERP</td><td>Connector group, RC1, Finance-ERP, Finance to ERP, browser access for a tablet</td><td>Chapters 9 and 10</td></tr>
<tr><td>NOC: a laptop talks to a strange domain</td><td>Activity Search, Investigate, destination list, Block IR List</td><td>Chapters 11 and 12</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Thinking SSE removes the need for any on-premises firewall. Data centers still need segmentation and an edge for inbound published services, and campuses still need access control. SSE replaces the <b>outbound inspection stack</b> (proxy, DNS filter, CASB, remote access VPN for private apps) and moves it to the cloud.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which statement best describes the security edge for a hybrid workforce?" The answer always mentions <b>cloud-delivered</b>, <b>identity-based</b> and <b>consistent policy regardless of user location</b>. An answer that says "route all remote users through the head-office firewall" describes the problem, not the solution.</p></div>

<div class="scn"><h4>The VPN that melted on Monday morning</h4><p>A training company sent all 600 remote staff through a full-tunnel VPN to its Delhi firewall. Every Monday at 10:00, when live video classes started, the VPN concentrator hit 100% CPU and the internet link saturated, because video, SaaS and updates all hairpinned through head office. The engineer checked the firewall dashboards and found that more than 80% of VPN traffic was going straight back out to the internet. The fix was to keep a small VPN for two legacy apps, protect internet traffic with the Secure Client roaming module and Secure Access policies, and publish the ERP with ZTNA. Monday CPU dropped below 30%.</p><p><b>Lesson:</b> when users and apps are outside, the inspection point must be outside too.</p></div>

<div class="iv"><p class="q">"Why are companies moving from on-premises proxies and VPNs to SSE?"</p><p>Strong answer: apps moved to SaaS and cloud, users moved out of the office, and backhauling traffic to a central firewall adds latency, bandwidth cost and a single point of failure. SSE delivers the same controls (DNS security, SWG, CASB, DLP, ZTNA, cloud firewall) from points of presence near the user, with identity-based policy that follows the user anywhere and one log for investigation. Mention a concrete number, such as latency saved or VPN load removed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SaaS, hybrid work and backhaul cost broke the castle-and-moat perimeter.</li>
<li>SSE moves inspection to cloud points of presence close to users and apps.</li>
<li>Identity, not IP address, is the main policy input; every request is evaluated.</li>
<li>Cisco Secure Access gives one policy, one client (Secure Client) and one log.</li>
<li>On-premises firewalls do not disappear; SSE replaces the outbound and remote-access stack.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki security office firewall se cloud mein kyun gayi, SASE aur SSE compare kar paoge, aur Cisco Secure Access ke har building block ka naam le paoge: DNS-layer security, secure web gateway (SWG), CASB, cloud firewall, data loss prevention (DLP), AI guardrails aur zero trust network access (ZTNA). Phir aap ise hands-on banaoge: branch router ko IPsec IKEv2 tunnel se jodoge, roaming laptop ko Cisco Secure Client se protect karoge, identity, group, category aur application ke hisaab se internet aur private access rules likhoge, uploads aur GenAI prompts mein sensitive data bahar jaane se rokoge, bina VPN ke ek private ERP publish karoge, aur ek suspicious domain ko Activity Search se lekar block tak investigate karoge.</p>

<h3>Prerequisites</h3>
<ul>
<li><b>Zero trust ideas</b> (sec-concepts): network location ki wajah se trust nahi, identity aur device verify karo, least privilege.</li>
<li><b>IPsec aur IKEv2</b> (sec-crypto): IKE_SA_INIT, pre-shared keys, UDP 4500 par NAT traversal.</li>
<li><b>Remote access VPN aur Secure Client</b> (sec-ftd-vpn), aur firewall par <b>URL filtering, Security Intelligence aur DNS sinkholing</b> (sec-ftd-ips). Hum unhe dobara padhane ki jagah unka reference denge.</li>
</ul>

<h3>Ek analogy: housing society jisne travelling guard rakha</h3>
<p>Ek gated housing society socho. Saalon tak main gate par ek guard sabko check karta tha, aur yeh chalta tha kyunki saare residents gate ke andar hi rehte, kaam karte aur shopping karte the. Phir residents cafes se, dusre shehron se aur society ke bahar home offices se kaam karne lage, aur jin shops ko woh use karte hain woh shehar ke dusre kone ke bade mall mein chali gayi. Har resident ko pehle main gate tak wapas chalke check karwana aur phir mall jaana slow aur bewakoofi hogi. Isliye society ek security company hire karti hai jiske booths har shehar mein hain. Resident jahan bhi ho, sabse paas wala booth unhe society ke same rules par check karta hai, jaanta hai ki woh kaun hain, aur sabke liye ek hi logbook rakhta hai.</p>
<p>Yahi hai <b>Secure Service Edge (SSE)</b>: inspection point head office ke ek box se hatkar ek cloud service mein chala jaata hai jiske points of presence har user, har branch aur har application ke paas hote hain.</p>

<h3>Teen badlav jinhone perimeter tod diya</h3>
<ul>
<li><b>Applications SaaS aur public cloud mein chali gayi.</b> Mail, CRM, file sharing aur ab generative-AI tools internet par rehte hain, aapke data center mein nahi.</li>
<li><b>Users bahar chale gaye.</b> Hybrid work ka matlab laptops zyada time ghar, hotels aur mobile networks par rehte hain, jahan office firewall unka traffic kabhi dekhta hi nahi.</li>
<li><b>Backhaul dukhta hai.</b> Branch ya ghar ke user ka traffic sirf SaaS app tak pahunchne ke liye head-office firewall tak bhejna (<b>hairpinning</b>) latency badhata hai, MPLS bandwidth khata hai aur head office ko single point of failure bana deta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Backhaul versus cloud security edge">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">Pehle: HQ tak backhaul</text>
<rect x="20" y="40" width="90" height="36" rx="8" fill="#bae6fd"/><text x="65" y="63" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="20" y="100" width="90" height="36" rx="8" fill="#bae6fd"/><text x="65" y="123" text-anchor="middle" class="svg-ink" font-size="12">Ghar ka user</text>
<rect x="170" y="70" width="110" height="40" rx="8" fill="#fed7aa"/><text x="225" y="95" text-anchor="middle" class="svg-ink" font-size="12">HQ firewall</text>
<rect x="190" y="170" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="235" y="193" text-anchor="middle" class="svg-ink" font-size="12">SaaS</text>
<line x1="110" y1="58" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="110" y1="118" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="225" y1="110" x2="235" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="325" y="235" text-anchor="middle" class="svg-muted" font-size="12">extra hops, MPLS kharcha, ek choke point</text>
<line x1="320" y1="30" x2="320" y2="215" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">Baad mein: cloud edge par inspect</text>
<rect x="345" y="40" width="80" height="36" rx="8" fill="#bae6fd"/><text x="385" y="63" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="345" y="100" width="80" height="36" rx="8" fill="#bae6fd"/><text x="385" y="123" text-anchor="middle" class="svg-ink" font-size="12">Ghar ka user</text>
<rect x="455" y="65" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="87" text-anchor="middle" class="svg-ink" font-size="12">Secure</text><text x="500" y="104" text-anchor="middle" class="svg-ink" font-size="12">Access PoP</text>
<rect x="565" y="40" width="65" height="36" rx="8" fill="#bbf7d0"/><text x="597" y="63" text-anchor="middle" class="svg-ink" font-size="12">SaaS</text>
<rect x="565" y="100" width="65" height="36" rx="8" fill="#fde68a"/><text x="597" y="123" text-anchor="middle" class="svg-ink" font-size="12">DC app</text>
<line x1="425" y1="58" x2="455" y2="80" stroke="#64748b" stroke-width="2"/><line x1="425" y1="118" x2="455" y2="100" stroke="#64748b" stroke-width="2"/><line x1="545" y1="80" x2="565" y2="60" stroke="#64748b" stroke-width="2"/><line x1="545" y1="100" x2="565" y2="118" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Left: har flow head office se ghoom kar jaata hai. Right: har flow sabse paas ke Secure Access point of presence par inspect hota hai, phir seedha internet, SaaS ya private app tak jaata hai.</p></div>

<h3>Jawab: cloud se deliver hone wali identity-based security</h3>
<p>Modern jawab hai inspection ko wahan le jaana jahan users aur apps milte hain. Cloud-delivered security edge user ke paas baithta hai, aur har connection usmein se guzarta hai chahe user kahin bhi ho. Teen ideas ek saath badalte hain:</p>
<ol>
<li><b>Identity IP address ki jagah leti hai</b> main policy input ke roop mein. Rule kehta hai "Finance ERP tak pahunch sakta hai", na ki "10.10.1.0/24 10.20.1.50 tak pahunch sakta hai".</li>
<li><b>Har request evaluate hoti hai</b> (zero trust: never trust, always verify), private apps ke access ke liye device posture ke saath.</li>
<li><b>Ek policy, ek client, ek log</b>. DNS, web, cloud apps, data protection aur private access same rules engine, laptop par same Cisco Secure Client aur same Activity Search share karte hain.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek sales engineer Bengaluru se kaam karti hai. Backhaul ke saath, CRM ki uski request Bengaluru se Delhi head office (lagbhag 35 ms), firewall se hokar, Mumbai ke CRM tak (lagbhag 25 ms) jaati hai: ek taraf lagbhag 60 ms plus head-office queue, aur din mein 100 Mbit/s MPLS link ka 20 Mbit/s kha jaati hai. Secure Access ke saath woh Mumbai point of presence tak lagbhag 8 ms mein aur CRM tak kuch milliseconds baad pahunchti hai. Head-office link asli head-office traffic ke liye free ho jaata hai, aur policy bilkul same rehti hai.</p></div>

<h3>Is module ki labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya banaoge</th><th>Kahan padhaya gaya</th></tr>
<tr><td>Branch tunnel aur roaming laptop onboard karo</td><td>Network tunnel group BRANCH-DEL, BRANCH par IKEv2 tunnel, ROAM1 par Secure Client</td><td>Chapters 3, 4 aur 5</td></tr>
<tr><td>Secure Internet Access</td><td>Block Gambling, Warn Social, legacy block ke upar Allow Sales CRM</td><td>Chapters 6 aur 7</td></tr>
<tr><td>DLP aur AI guardrails</td><td>Block PII to Cloud Storage, decryption, ChatAI Guardrails</td><td>Chapter 8</td></tr>
<tr><td>Finance ERP tak zero trust access</td><td>Connector group, RC1, Finance-ERP, Finance to ERP, tablet ke liye browser access</td><td>Chapters 9 aur 10</td></tr>
<tr><td>NOC: laptop ek ajeeb domain se baat karta hai</td><td>Activity Search, Investigate, destination list, Block IR List</td><td>Chapters 11 aur 12</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki SSE ke baad koi on-premises firewall nahi chahiye. Data centers ko ab bhi segmentation aur inbound published services ke liye edge chahiye, aur campuses ko ab bhi access control chahiye. SSE <b>outbound inspection stack</b> (proxy, DNS filter, CASB, private apps ke liye remote access VPN) ko replace karta hai aur use cloud mein le jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Hybrid workforce ke liye security edge ko kaunsa statement sabse achha describe karta hai?" Answer mein hamesha <b>cloud-delivered</b>, <b>identity-based</b> aur <b>user location se independent consistent policy</b> hota hai. Jo answer kehta hai "saare remote users ko head-office firewall se route karo" woh problem describe karta hai, solution nahi.</p></div>

<div class="scn"><h4>Woh VPN jo Monday subah pighal gaya</h4><p>Ek training company apne saare 600 remote staff ko full-tunnel VPN se Delhi firewall tak bhejti thi. Har Monday 10:00 baje, jab live video classes shuru hoti, VPN concentrator 100% CPU par pahunch jaata aur internet link saturate ho jaata, kyunki video, SaaS aur updates sab head office se hairpin hote the. Engineer ne firewall dashboards check kiye aur paaya ki 80% se zyada VPN traffic seedha wapas internet par ja raha tha. Fix: do legacy apps ke liye chhota VPN rakha, internet traffic ko Secure Client roaming module aur Secure Access policies se protect kiya, aur ERP ko ZTNA se publish kiya. Monday ka CPU 30% se neeche aa gaya.</p><p><b>Seekh:</b> jab users aur apps bahar hain, to inspection point bhi bahar hona chahiye.</p></div>

<div class="iv"><p class="q">"Companies on-premises proxies aur VPNs se SSE par kyun ja rahi hain?"</p><p>Strong answer: apps SaaS aur cloud mein chali gayi, users office se bahar chale gaye, aur traffic ko central firewall tak backhaul karna latency, bandwidth cost aur single point of failure laata hai. SSE wahi controls (DNS security, SWG, CASB, DLP, ZTNA, cloud firewall) user ke paas wale points of presence se deliver karta hai, identity-based policy ke saath jo user ke saath kahin bhi chalti hai, aur investigation ke liye ek log. Ek concrete number batao, jaise kitni latency bachi ya kitna VPN load hata.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SaaS, hybrid work aur backhaul cost ne castle-and-moat perimeter tod diya.</li>
<li>SSE inspection ko users aur apps ke paas cloud points of presence par le jaata hai.</li>
<li>Identity, IP address nahi, main policy input hai; har request evaluate hoti hai.</li>
<li>Cisco Secure Access ek policy, ek client (Secure Client) aur ek log deta hai.</li>
<li>On-premises firewalls gayab nahi hote; SSE outbound aur remote-access stack replace karta hai.</li>
</ul></div>
`}};export{e as default};