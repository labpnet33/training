var e={id:`big-picture`,h:{en:`The big picture: threats meet the firewall`,hi:`Big picture: threats aur firewall ka aamna-saamna`},body:{en:`
<p><b>What you will learn in this module.</b> In Start here you met the defender mindset and the security stack at a high level. Now we go one level deeper, into the first two SCOR 350-701 domains: <b>1.0 Security Concepts</b> (the threats and vulnerabilities you must recognise in on-premises, hybrid and cloud environments) and the basics of <b>2.0 Network Security</b> (how a firewall actually decides what to allow). By the end you will be able to explain how firewalls evolved from packet filters to NGFWs, describe exactly what a stateful firewall keeps in its connection table for TCP, UDP and ICMP, explain why FTP, DNS and SIP need inspection engines, place interfaces into zones and security levels, choose between routed and transparent mode, read a PAT translation, tell IDS from IPS, place firewalls at the perimeter, DMZ, internal segments and data center, compare ASA with Threat Defense, explain why logging matters, and troubleshoot a firewall with <code>show conn</code>, <code>show xlate</code> and <code>show logging</code>.</p>
<p><b>Prerequisites.</b> IPv4 addressing and subnetting, the TCP three-way handshake, what a port number is, and basic Cisco CLI (enable, show commands). If the words SYN, ACK and "port 443" make sense to you, you are ready.</p>

<h3>An analogy: the security desk of an office tower</h3>
<p>Picture a tall office tower. Employees on the inside can walk out to the street whenever they like. When an employee orders lunch, the security desk writes in a register: "Ravi, floor 12, expecting a delivery from Pizza Palace". When the delivery rider arrives and says "for Ravi, floor 12", the guard checks the register, finds the matching line, and lets him up. A stranger who walks in and says "I want to go to floor 12" finds no line in the register and is turned away. When the delivery is done, the guard strikes the line out.</p>
<p>That register is the <b>connection table</b> of a <b>stateful firewall</b>. The guard does not need a rule that says "let pizza riders in"; he lets in only the people who are answers to a request someone inside made. A modern <b>next-generation firewall</b> is a guard who also opens the box and checks that it really is pizza, not something dangerous with a pizza label.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="10" y="30" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="53" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="10" y="150" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="173" text-anchor="middle" class="svg-ink" font-size="13">ADMIN .50</text>
<rect x="130" y="90" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="170" y="113" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="100" y1="48" x2="130" y2="100" stroke="#64748b"/><line x1="100" y1="168" x2="130" y2="118" stroke="#64748b"/>
<rect x="260" y="80" width="110" height="56" rx="8" fill="#fed7aa"/><text x="315" y="104" text-anchor="middle" class="svg-ink" font-size="13">ASA1</text><text x="315" y="122" text-anchor="middle" class="svg-muted" font-size="12">NK-ASA</text>
<line x1="210" y1="108" x2="260" y2="108" stroke="#64748b"/>
<text x="235" y="80" text-anchor="middle" class="svg-accent" font-size="12">inside 100</text>
<rect x="430" y="90" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="465" y="113" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="370" y1="108" x2="430" y2="108" stroke="#64748b"/>
<text x="400" y="80" text-anchor="middle" class="svg-accent" font-size="12">outside 0</text>
<rect x="540" y="30" width="95" height="36" rx="8" fill="#bae6fd"/><text x="587" y="53" text-anchor="middle" class="svg-ink" font-size="13">INET 8.8.8.8</text>
<rect x="540" y="150" width="95" height="36" rx="8" fill="#ddd6fe"/><text x="587" y="173" text-anchor="middle" class="svg-ink" font-size="12">PARTNER .10</text>
<line x1="500" y1="100" x2="540" y2="50" stroke="#64748b"/><line x1="500" y1="118" x2="540" y2="166" stroke="#64748b"/>
<rect x="265" y="195" width="100" height="36" rx="8" fill="#fde68a"/><text x="315" y="218" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<line x1="315" y1="136" x2="315" y2="195" stroke="#64748b"/>
<text x="360" y="170" class="svg-accent" font-size="12">dmz 50</text>
<text x="10" y="18" class="svg-muted" font-size="12">inside 10.0.1.0/24</text><text x="400" y="18" class="svg-muted" font-size="12">outside 203.0.113.0/29</text>
</svg><p class="cap">The lab you will use in this module: inside users, a DMZ web server and a simulated internet (INET at 8.8.8.8 and PARTNER at 198.51.100.10), all separated by the ASA NK-ASA.</p></div>

<h3>Where the threats come from today</h3>
<p>Ten years ago most company data lived in one building behind one firewall. Today it lives in three places at once:</p>
<ul>
<li><b>On-premises:</b> your own offices and data centers. Classic threats: malware on a laptop, phishing emails, an attacker on the LAN doing man-in-the-middle, DoS against your internet edge.</li>
<li><b>Cloud:</b> workloads and SaaS applications run by a provider. Classic threats: stolen cloud credentials, insecure APIs, misconfigured storage buckets, data breaches, DDoS against public services.</li>
<li><b>Hybrid:</b> both joined by VPNs and direct links. The link itself becomes a path an attacker can use to move from a weak cloud workload into the data center, or the other way round.</li>
</ul>
<p>A firewall is not the only control, but it is the one that decides <b>who may talk to whom</b>. Every other control in this track (IPS, Secure Endpoint, Secure Access, ISE) either sits in the firewall, sits beside it, or feeds it information.</p>

<h3>The road map of this module</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>SCOR link</th></tr>
<tr><td>2–3</td><td>Threats and vulnerabilities, at defender level</td><td>1.1, 1.2</td></tr>
<tr><td>4–6</td><td>Firewall evolution and stateful inspection for TCP, UDP, ICMP and applications</td><td>2.0</td></tr>
<tr><td>7–8</td><td>Zones, security levels, routed vs transparent mode, NAT basics</td><td>2.0</td></tr>
<tr><td>9–10</td><td>IDS vs IPS; firewall placement designs (perimeter, DMZ, internal segmentation, data center)</td><td>2.0</td></tr>
<tr><td>11</td><td>ASA and Threat Defense at a high level, and why logging matters</td><td>2.0</td></tr>
<tr><td>12–13</td><td>Troubleshooting the lab, then the exam checklist</td><td>all</td></tr>
</table>
<p>The modules that follow go deeper into each tool: the ASA CLI and ACLs, NAT in detail, Threat Defense with Management Center, IPS policies and VPNs. Here you build the mental model that makes all of them easy.</p>

<div class="eg"><p><b>Worked example: one web visit through the lab.</b> PC1 (10.0.1.10) opens the web page on 8.8.8.8, TCP port 80. The ASA sees the SYN arrive on <b>inside</b> (security level 100) heading to <b>outside</b> (level 0). High to low is allowed by default, so it builds a connection, translates the source to its outside address 203.0.113.2 with PAT, and forwards the SYN. The reply returns to 203.0.113.2, matches the connection and the translation, and is sent back to 10.0.1.10. Later PARTNER (198.51.100.10) tries TCP port 80 on 203.0.113.2 with no matching connection: the ASA drops it and logs <b>%ASA-2-106001</b>.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking "we have a firewall, so we are secure". A firewall that allows TCP 443 to everywhere will happily carry malware, stolen data and command-and-control traffic inside that port. The firewall is one layer of defence in depth, not the whole answer.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCOR separates on-premises threats (viruses, trojans, rootkits, DoS/DDoS, phishing, MITM, SQL injection, XSS, malware) from cloud threats (data breaches, insecure APIs, DoS/DDoS, compromised credentials). Read the question for the environment it names before picking an answer.</p></div>

<div class="scn"><h4>The firewall that was "wide open"</h4><p>A mid-size company replaced a router ACL with an ASA. The migration engineer copied the old rule set, including "permit tcp any any" inbound on the internet interface, which had been added years earlier because replies were being dropped. Within a week an external scan found an internal RDP server reachable from the internet. The review showed the old rule existed only because the router was stateless. On the ASA the rule was unnecessary: the connection table already allowed replies. Removing it closed the hole with zero impact on users.</p><p><b>Lesson:</b> understand what state gives you before you copy rules from a stateless device.</p></div>

<div class="iv"><p class="q">"In one minute, what does a stateful firewall do that a router ACL does not?"</p><p>Strong answer: it tracks each connection in a connection table (addresses, ports, protocol, interfaces, TCP state, NAT), so return traffic is allowed automatically and anything unsolicited from the outside is dropped. A plain ACL judges every packet alone, so you must open the return direction by hand, which usually ends up far too open. Mention that you verify it on an ASA with <code>show conn</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers SCOR 1.1 and 1.2 threats and vulnerabilities plus the firewall basics of domain 2.0.</li>
<li>Threats now target on-premises, cloud and the hybrid links between them.</li>
<li>A stateful firewall is a guard with a register: replies to inside requests pass, strangers do not.</li>
<li>The lab: PC1 and ADMIN inside, WEB in the DMZ, INET 8.8.8.8 and PARTNER outside, ASA NK-ASA in the middle.</li>
<li>A firewall is one layer of defence in depth, never the whole defence.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Start here mein aapne defender mindset aur security stack ko high level par dekha. Ab hum ek level aur gehrai mein jaate hain, SCOR 350-701 ke pehle do domains mein: <b>1.0 Security Concepts</b> (woh threats aur vulnerabilities jo aapko on-premises, hybrid aur cloud environments mein pehchaanni hain) aur <b>2.0 Network Security</b> ke basics (firewall asal mein kaise decide karta hai ki kya allow karna hai). End tak aap samjha paoge ki firewalls packet filters se NGFW tak kaise bane, TCP, UDP aur ICMP ke liye stateful firewall apni connection table mein exactly kya rakhta hai, FTP, DNS aur SIP ko inspection engines kyun chahiye, interfaces ko zones aur security levels mein kaise rakhein, routed aur transparent mode mein kaise chunein, PAT translation kaise padhein, IDS aur IPS mein farak, firewalls ko perimeter, DMZ, internal segments aur data center mein kahan rakhein, ASA aur Threat Defense ka comparison, logging kyun zaroori hai, aur <code>show conn</code>, <code>show xlate</code> aur <code>show logging</code> se firewall troubleshoot kaise karein.</p>
<p><b>Prerequisites.</b> IPv4 addressing aur subnetting, TCP three-way handshake, port number kya hota hai, aur basic Cisco CLI (enable, show commands). Agar SYN, ACK aur "port 443" jaise words aapko samajh aate hain, to aap ready ho.</p>

<h3>Ek analogy: office tower ka security desk</h3>
<p>Ek oonche office tower ko socho. Andar ke employees jab chahe bahar sadak par ja sakte hain. Jab koi employee lunch order karta hai, security desk ek register mein likhta hai: "Ravi, floor 12, Pizza Palace se delivery aane wali hai". Jab delivery rider aata hai aur kehta hai "Ravi, floor 12 ke liye", guard register check karta hai, matching line milti hai, aur use upar jaane deta hai. Koi anjaan aadmi andar aa kar kahe "mujhe floor 12 jaana hai" to register mein koi line nahi milti aur use lauta diya jaata hai. Delivery ho jaane par guard line kaat deta hai.</p>
<p>Woh register hi <b>stateful firewall</b> ki <b>connection table</b> hai. Guard ko aisa rule nahi chahiye jo kahe "pizza riders ko andar aane do"; woh sirf unhe andar aane deta hai jo andar kisi ki request ka jawab hain. Modern <b>next-generation firewall</b> aisa guard hai jo dabba khol kar yeh bhi check karta hai ki andar sach mein pizza hai, pizza label wali koi khatarnaak cheez nahi.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="10" y="30" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="53" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="10" y="150" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="173" text-anchor="middle" class="svg-ink" font-size="13">ADMIN .50</text>
<rect x="130" y="90" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="170" y="113" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="100" y1="48" x2="130" y2="100" stroke="#64748b"/><line x1="100" y1="168" x2="130" y2="118" stroke="#64748b"/>
<rect x="260" y="80" width="110" height="56" rx="8" fill="#fed7aa"/><text x="315" y="104" text-anchor="middle" class="svg-ink" font-size="13">ASA1</text><text x="315" y="122" text-anchor="middle" class="svg-muted" font-size="12">NK-ASA</text>
<line x1="210" y1="108" x2="260" y2="108" stroke="#64748b"/>
<text x="235" y="80" text-anchor="middle" class="svg-accent" font-size="12">inside 100</text>
<rect x="430" y="90" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="465" y="113" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="370" y1="108" x2="430" y2="108" stroke="#64748b"/>
<text x="400" y="80" text-anchor="middle" class="svg-accent" font-size="12">outside 0</text>
<rect x="540" y="30" width="95" height="36" rx="8" fill="#bae6fd"/><text x="587" y="53" text-anchor="middle" class="svg-ink" font-size="13">INET 8.8.8.8</text>
<rect x="540" y="150" width="95" height="36" rx="8" fill="#ddd6fe"/><text x="587" y="173" text-anchor="middle" class="svg-ink" font-size="12">PARTNER .10</text>
<line x1="500" y1="100" x2="540" y2="50" stroke="#64748b"/><line x1="500" y1="118" x2="540" y2="166" stroke="#64748b"/>
<rect x="265" y="195" width="100" height="36" rx="8" fill="#fde68a"/><text x="315" y="218" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<line x1="315" y1="136" x2="315" y2="195" stroke="#64748b"/>
<text x="360" y="170" class="svg-accent" font-size="12">dmz 50</text>
<text x="10" y="18" class="svg-muted" font-size="12">inside 10.0.1.0/24</text><text x="400" y="18" class="svg-muted" font-size="12">outside 203.0.113.0/29</text>
</svg><p class="cap">Is module ka lab: inside users, DMZ web server aur simulated internet (INET 8.8.8.8 par aur PARTNER 198.51.100.10 par), sab ASA NK-ASA se alag kiye hue.</p></div>

<h3>Aaj threats kahan se aate hain</h3>
<p>Das saal pehle zyada tar company data ek building mein ek firewall ke peeche rehta tha. Aaj woh ek saath teen jagah rehta hai:</p>
<ul>
<li><b>On-premises:</b> aapke apne offices aur data centers. Classic threats: laptop par malware, phishing emails, LAN par man-in-the-middle karta attacker, aapke internet edge par DoS.</li>
<li><b>Cloud:</b> provider ke chalaye workloads aur SaaS applications. Classic threats: chori hue cloud credentials, insecure APIs, misconfigured storage buckets, data breaches, public services par DDoS.</li>
<li><b>Hybrid:</b> dono VPNs aur direct links se jude hue. Link khud ek raasta ban jaata hai jisse attacker kamzor cloud workload se data center mein, ya ulta, move kar sakta hai.</li>
</ul>
<p>Firewall akela control nahi hai, lekin yahi decide karta hai ki <b>kaun kisse baat kar sakta hai</b>. Is track ka har doosra control (IPS, Secure Endpoint, Secure Access, ISE) ya to firewall ke andar baithta hai, uske bagal mein, ya use information deta hai.</p>

<h3>Is module ka road map</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>SCOR link</th></tr>
<tr><td>2–3</td><td>Threats aur vulnerabilities, defender level par</td><td>1.1, 1.2</td></tr>
<tr><td>4–6</td><td>Firewall evolution aur TCP, UDP, ICMP aur applications ke liye stateful inspection</td><td>2.0</td></tr>
<tr><td>7–8</td><td>Zones, security levels, routed vs transparent mode, NAT basics</td><td>2.0</td></tr>
<tr><td>9–10</td><td>IDS vs IPS; firewall placement designs (perimeter, DMZ, internal segmentation, data center)</td><td>2.0</td></tr>
<tr><td>11</td><td>ASA aur Threat Defense high level par, aur logging kyun zaroori hai</td><td>2.0</td></tr>
<tr><td>12–13</td><td>Lab ka troubleshooting, phir exam checklist</td><td>sab</td></tr>
</table>
<p>Aage ke modules har tool mein aur gehrai tak jaate hain: ASA CLI aur ACLs, NAT detail mein, Management Center ke saath Threat Defense, IPS policies aur VPNs. Yahan aap woh mental model banate ho jo in sabko aasaan bana deta hai.</p>

<div class="eg"><p><b>Worked example: lab mein ek web visit.</b> PC1 (10.0.1.10) 8.8.8.8 ka web page kholta hai, TCP port 80. ASA dekhta hai ki SYN <b>inside</b> (security level 100) par aaya aur <b>outside</b> (level 0) ki taraf ja raha hai. High se low default mein allowed hai, isliye woh connection banata hai, PAT se source ko apne outside address 203.0.113.2 mein translate karta hai, aur SYN aage bhejta hai. Reply 203.0.113.2 par wapas aata hai, connection aur translation se match hota hai, aur 10.0.1.10 ko bhej diya jaata hai. Baad mein PARTNER (198.51.100.10) bina kisi matching connection ke 203.0.113.2 par TCP port 80 try karta hai: ASA use drop karta hai aur <b>%ASA-2-106001</b> log karta hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki "hamare paas firewall hai, to hum secure hain". Jo firewall har jagah TCP 443 allow karta hai, woh usi port ke andar malware, chori hua data aur command-and-control traffic khushi se le jaayega. Firewall defence in depth ki ek layer hai, poora jawab nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCOR on-premises threats (viruses, trojans, rootkits, DoS/DDoS, phishing, MITM, SQL injection, XSS, malware) ko cloud threats (data breaches, insecure APIs, DoS/DDoS, compromised credentials) se alag rakhta hai. Answer chunne se pehle question mein kaunsa environment likha hai woh padho.</p></div>

<div class="scn"><h4>Woh firewall jo "poora khula" tha</h4><p>Ek mid-size company ne router ACL ko ASA se replace kiya. Migration engineer ne purana rule set copy kar diya, jismein internet interface par inbound "permit tcp any any" bhi tha, jo saalon pehle isliye joda gaya tha kyunki replies drop ho rahe the. Ek hafte mein ek external scan ne internet se pahunchne layak ek internal RDP server dhoondh liya. Review mein pata chala ki purana rule sirf isliye tha kyunki router stateless tha. ASA par us rule ki zaroorat hi nahi thi: connection table pehle se replies allow kar rahi thi. Use hataane se hole band ho gaya aur users par zero asar pada.</p><p><b>Seekh:</b> stateless device se rules copy karne se pehle samjho ki state aapko kya deti hai.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao, stateful firewall kya karta hai jo router ACL nahi karta?"</p><p>Strong answer: woh har connection ko connection table mein track karta hai (addresses, ports, protocol, interfaces, TCP state, NAT), isliye return traffic apne aap allow hota hai aur outside se aaya koi bhi bina bulaya traffic drop hota hai. Plain ACL har packet ko akele judge karta hai, isliye return direction haath se kholni padti hai, jo aksar bahut zyada khuli reh jaati hai. Batao ki ASA par aap ise <code>show conn</code> se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module SCOR 1.1 aur 1.2 ke threats aur vulnerabilities aur domain 2.0 ke firewall basics cover karta hai.</li>
<li>Threats ab on-premises, cloud aur unke beech ke hybrid links ko target karte hain.</li>
<li>Stateful firewall register wala guard hai: inside requests ke replies jaate hain, anjaan log nahi.</li>
<li>Lab: PC1 aur ADMIN inside, WEB DMZ mein, INET 8.8.8.8 aur PARTNER outside, beech mein ASA NK-ASA.</li>
<li>Firewall defence in depth ki ek layer hai, kabhi poori defence nahi.</li>
</ul></div>
`}};export{e as default};