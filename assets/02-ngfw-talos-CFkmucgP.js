var e={id:`ngfw-talos`,h:{en:`Threat intelligence and the next-generation firewall`,hi:`Threat intelligence aur next-generation firewall`},body:{en:`
<p>Think of a building's security guard. A classic guard checks one thing: "Is your name on the list for this door?" A modern guard also recognises faces, looks inside bags, knows which visitors were caught stealing in other buildings last week (because the guards share notes), and can call you back later if something you brought in turns out to be dangerous. That second guard is a <b>next-generation firewall</b>, and the shared notebook is <b>threat intelligence</b>.</p>

<h3>Talos: the intelligence behind every Cisco product</h3>
<p><b>Cisco Talos</b> is Cisco's threat intelligence and research organisation. It collects telemetry from millions of devices, email messages, DNS queries and malware samples every day, analyses it, and publishes the results as <b>reputation data and detection content</b>: bad IP addresses, domains and URLs, file hash verdicts, Snort intrusion rules and ClamAV signatures. Firewalls, Umbrella, Secure Email, Secure Web and Secure Endpoint all download these updates. For the exam, remember one sentence: <b>Talos is the intelligence feed; the products are where it is enforced.</b></p>

<h3>From stateful firewall to NGFW</h3>
<p>A <b>stateful firewall</b> filters on the 5-tuple (source and destination IP, protocol, source and destination port) and tracks connections, so return traffic is allowed automatically. That was enough when applications used fixed ports. Today almost everything runs over TCP 443, so "permit tcp any any eq 443" allows web browsing, file sharing, remote-access tools and malware command-and-control alike.</p>
<p>A <b>next-generation firewall (NGFW)</b> keeps stateful filtering and adds context. In Cisco's portfolio this is <b>Cisco Secure Firewall</b> running <b>Firewall Threat Defense (FTD)</b> software, on hardware appliances or as a virtual/cloud firewall. It is managed centrally by the <b>Secure Firewall Management Center (FMC)</b>, on-premises or cloud-delivered, or locally by the Firewall Device Manager for small sites. The older Cisco ASA remains a classic stateful firewall and VPN head end.</p>

<table class="cmp"><tr><th>NGFW capability</th><th>What it adds</th></tr>
<tr><td><b>Application visibility and control (AVC)</b></td><td>Identifies thousands of applications by behaviour (OpenAppID), whatever the port, so you can allow Webex but block a file-sharing app on the same port 443</td></tr>
<tr><td><b>User identity</b></td><td>Rules written with users and groups, learned from ISE (pxGrid) or directory logins, and with SGTs from TrustSec</td></tr>
<tr><td><b>Security Intelligence</b></td><td>Early block of traffic to or from IPs, URLs and domains that Talos marks as malicious</td></tr>
<tr><td><b>URL filtering</b></td><td>Allow or block web traffic by category (gambling, malware sites) and reputation score</td></tr>
<tr><td><b>Intrusion prevention (IPS)</b></td><td>Snort 3 engine compares traffic to rules for known exploits and blocks them inline</td></tr>
<tr><td><b>File and malware policy</b></td><td>Secure Malware Defense checks file hashes against the cloud, can send unknown files to <b>Secure Malware Analytics</b> (sandbox) and raises <b>retrospective</b> alerts if a file is later found malicious</td></tr>
<tr><td><b>TLS decryption</b></td><td>Decrypts selected flows so IPS and file inspection can see inside</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NGFW inspection order">
<rect x="10" y="70" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="92" text-anchor="middle" class="svg-ink" font-size="12">Packet</text><text x="55" y="108" text-anchor="middle" class="svg-ink" font-size="12">arrives</text>
<rect x="115" y="70" width="95" height="50" rx="8" fill="#fde68a"/><text x="162" y="92" text-anchor="middle" class="svg-ink" font-size="12">Prefilter</text><text x="162" y="108" text-anchor="middle" class="svg-muted" font-size="12">fast-path</text>
<rect x="225" y="70" width="95" height="50" rx="8" fill="#fed7aa"/><text x="272" y="92" text-anchor="middle" class="svg-ink" font-size="12">Security</text><text x="272" y="108" text-anchor="middle" class="svg-ink" font-size="12">Intelligence</text>
<rect x="335" y="70" width="95" height="50" rx="8" fill="#bae6fd"/><text x="382" y="92" text-anchor="middle" class="svg-ink" font-size="12">Access rules</text><text x="382" y="108" text-anchor="middle" class="svg-muted" font-size="12">app, URL, user</text>
<rect x="445" y="70" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="492" y="92" text-anchor="middle" class="svg-ink" font-size="12">IPS + file</text><text x="492" y="108" text-anchor="middle" class="svg-muted" font-size="12">Snort 3</text>
<rect x="555" y="70" width="75" height="50" rx="8" fill="#bbf7d0"/><text x="592" y="100" text-anchor="middle" class="svg-ink" font-size="12">Forward</text>
<line x1="100" y1="95" x2="115" y2="95" stroke="#64748b" stroke-width="2"/><line x1="210" y1="95" x2="225" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="335" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="95" x2="445" y2="95" stroke="#64748b" stroke-width="2"/><line x1="540" y1="95" x2="555" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">Talos updates: reputation lists, Snort rules, file verdicts</text>
<line x1="272" y1="48" x2="272" y2="70" stroke="#64748b" stroke-dasharray="4 3"/><line x1="492" y1="48" x2="492" y2="70" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Cheap checks first; deep inspection only for traffic that is allowed</text>
</svg><p class="cap">Simplified order of inspection in Secure Firewall (FTD).</p></div>

<h3>IDS versus IPS, inline versus passive</h3>
<p>An <b>IDS</b> (intrusion detection system) receives a copy of traffic, for example from a SPAN port, and only alerts. It adds no latency and cannot break traffic, but it also cannot stop an attack. An <b>IPS</b> sits <b>inline</b>, so every packet passes through it and it can drop the malicious ones. FTD interfaces can run <b>routed</b> or <b>transparent</b> (a layer-2 "bump in the wire"), and IPS-only interface pairs can be <b>inline</b>, <b>inline tap</b> (inline cabling but alert only, useful while tuning) or <b>passive</b>.</p>

<div class="eg"><p><b>Worked example: a retrospective alert.</b> 09:00 a user downloads <code>invoice.pdf.exe</code>. Its SHA-256 hash is unknown to the cloud, so the file is allowed and sent to the sandbox. 09:40 the sandbox sees it encrypt test files and the verdict changes to malicious. Talos publishes the new verdict. 09:41 the FMC raises a <b>retrospective</b> event: "file previously seen on 10.20.20.11 is now malicious". Secure Endpoint on that laptop quarantines the file, and the SOC asks ISE to quarantine the host. That is the "after" phase working.</p></div>

<h3>Integration: the firewall and ISE talk to each other</h3>
<p>The FMC can subscribe to ISE over <b>pxGrid</b> to learn "10.20.20.11 is alice, in group Employees, SGT 10", so access rules can use names instead of addresses. In the other direction, when the firewall sees an attack from a host, the FMC can ask ISE to apply an <b>Adaptive Network Control (ANC)</b> quarantine policy; ISE then sends a RADIUS <b>CoA</b> to the access switch, and the host is moved to a restricted VLAN or tag. This is often called <b>rapid threat containment</b>, and you will meet CoA again in chapter 9.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling every IPS rule "to be safe". Thousands of irrelevant rules add latency and false positives, and teams then put the IPS in alert-only mode and forget it. Start from a Cisco base policy (for example "Balanced Security and Connectivity") and tune it for the assets you actually have.</p></div>

<div class="exam"><p><b>Exam trap.</b> An IDS cannot block traffic because it only sees a copy. If a question says "prevent" or "drop", the answer needs an inline IPS or NGFW. Also, retrospective security means re-evaluating a file <i>after</i> it was allowed, not scanning faster.</p></div>

<div class="scn"><h4>Port 443 is not "web"</h4><p>A hospital's firewall allowed TCP 443 outbound for everybody. Flow analytics showed a server sending 30 GB per night to an unknown address on port 443. The traffic was a remote-access tool installed by a vendor without approval. After migrating to Secure Firewall, the team wrote rules by application: allow the approved web and collaboration apps, block remote-access tools except for the IT group learned from ISE, and enable Security Intelligence. The next attempt was blocked and logged with the user name.</p><p><b>Lesson:</b> port-based rules cannot tell applications apart. An NGFW writes policy with applications, users and reputation.</p></div>

<div class="iv"><p class="q">"What makes a next-generation firewall different from a stateful firewall?"</p><p>Strong answer: both track state, but an NGFW identifies applications independent of port (AVC), uses user and group identity (from ISE via pxGrid or directory), blocks by reputation using Talos feeds, filters URLs by category, runs an inline IPS (Snort 3) and file/malware inspection with sandboxing and retrospective alerts, and can decrypt TLS. Name Cisco Secure Firewall with FTD, managed by FMC, and mention that it can trigger ISE quarantine via ANC and CoA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Talos produces the intelligence (reputation, Snort rules, file verdicts) that Cisco products enforce.</li>
<li>NGFW = stateful + application, user, URL, reputation, IPS, malware and TLS inspection.</li>
<li>Secure Firewall runs FTD and is managed by FMC (on-premises or cloud-delivered) or FDM.</li>
<li>IDS = copy of traffic, alert only; IPS = inline, can drop.</li>
<li>pxGrid gives the firewall user context; ANC plus CoA lets it quarantine a host through ISE.</li>
</ul></div>
`,hi:`
<p>Ek building ke security guard ke baare mein socho. Classic guard ek hi cheez check karta hai: "Kya is darwaze ke liye tumhara naam list mein hai?" Modern guard chehre bhi pehchanta hai, bag ke andar dekhta hai, jaanta hai ki pichhle hafte doosri buildings mein kaunse visitors chori karte pakde gaye (kyunki guards notes share karte hain), aur agar aapki laayi hui cheez baad mein khatarnak nikle to aapko wapas bula sakta hai. Woh doosra guard <b>next-generation firewall</b> hai, aur shared notebook <b>threat intelligence</b> hai.</p>

<h3>Talos: har Cisco product ke peeche ki intelligence</h3>
<p><b>Cisco Talos</b> Cisco ka threat intelligence aur research organisation hai. Yeh har din laakhon devices, email messages, DNS queries aur malware samples se telemetry collect karta hai, use analyse karta hai, aur results ko <b>reputation data aur detection content</b> ki tarah publish karta hai: bure IP addresses, domains aur URLs, file hash verdicts, Snort intrusion rules aur ClamAV signatures. Firewalls, Umbrella, Secure Email, Secure Web aur Secure Endpoint sab yeh updates download karte hain. Exam ke liye ek sentence yaad rakho: <b>Talos intelligence feed hai; products woh jagah hain jahan use enforce kiya jaata hai.</b></p>

<h3>Stateful firewall se NGFW tak</h3>
<p><b>Stateful firewall</b> 5-tuple (source aur destination IP, protocol, source aur destination port) par filter karta hai aur connections track karta hai, isliye return traffic automatically allow hota hai. Yeh tab kaafi tha jab applications fixed ports use karti thi. Aaj lagbhag sab kuch TCP 443 par chalta hai, isliye "permit tcp any any eq 443" web browsing, file sharing, remote-access tools aur malware command-and-control sabko ek jaisa allow kar deta hai.</p>
<p><b>Next-generation firewall (NGFW)</b> stateful filtering rakhta hai aur context jodta hai. Cisco portfolio mein yeh <b>Cisco Secure Firewall</b> hai jo <b>Firewall Threat Defense (FTD)</b> software chalata hai, hardware appliances par ya virtual/cloud firewall ki tarah. Ise centrally <b>Secure Firewall Management Center (FMC)</b> manage karta hai, on-premises ya cloud-delivered, ya chhoti sites ke liye locally Firewall Device Manager. Purana Cisco ASA classic stateful firewall aur VPN head end bana rehta hai.</p>

<table class="cmp"><tr><th>NGFW capability</th><th>Kya jodta hai</th></tr>
<tr><td><b>Application visibility and control (AVC)</b></td><td>Hazaaron applications ko behaviour se pehchanta hai (OpenAppID), port chahe jo ho, taaki aap Webex allow karo lekin usi port 443 par file-sharing app block karo</td></tr>
<tr><td><b>User identity</b></td><td>Users aur groups ke saath likhe rules, ISE (pxGrid) ya directory logins se seekhe hue, aur TrustSec ke SGTs ke saath</td></tr>
<tr><td><b>Security Intelligence</b></td><td>Talos jin IPs, URLs aur domains ko malicious mark karta hai unse aane-jaane wale traffic ka early block</td></tr>
<tr><td><b>URL filtering</b></td><td>Web traffic ko category (gambling, malware sites) aur reputation score se allow ya block karna</td></tr>
<tr><td><b>Intrusion prevention (IPS)</b></td><td>Snort 3 engine traffic ko known exploits ke rules se compare karke inline block karta hai</td></tr>
<tr><td><b>File aur malware policy</b></td><td>Secure Malware Defense file hashes ko cloud se check karta hai, unknown files ko <b>Secure Malware Analytics</b> (sandbox) bhej sakta hai aur agar file baad mein malicious nikle to <b>retrospective</b> alert deta hai</td></tr>
<tr><td><b>TLS decryption</b></td><td>Chune hue flows decrypt karta hai taaki IPS aur file inspection andar dekh sakein</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NGFW inspection ka order">
<rect x="10" y="70" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="92" text-anchor="middle" class="svg-ink" font-size="12">Packet</text><text x="55" y="108" text-anchor="middle" class="svg-ink" font-size="12">aata hai</text>
<rect x="115" y="70" width="95" height="50" rx="8" fill="#fde68a"/><text x="162" y="92" text-anchor="middle" class="svg-ink" font-size="12">Prefilter</text><text x="162" y="108" text-anchor="middle" class="svg-muted" font-size="12">fast-path</text>
<rect x="225" y="70" width="95" height="50" rx="8" fill="#fed7aa"/><text x="272" y="92" text-anchor="middle" class="svg-ink" font-size="12">Security</text><text x="272" y="108" text-anchor="middle" class="svg-ink" font-size="12">Intelligence</text>
<rect x="335" y="70" width="95" height="50" rx="8" fill="#bae6fd"/><text x="382" y="92" text-anchor="middle" class="svg-ink" font-size="12">Access rules</text><text x="382" y="108" text-anchor="middle" class="svg-muted" font-size="12">app, URL, user</text>
<rect x="445" y="70" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="492" y="92" text-anchor="middle" class="svg-ink" font-size="12">IPS + file</text><text x="492" y="108" text-anchor="middle" class="svg-muted" font-size="12">Snort 3</text>
<rect x="555" y="70" width="75" height="50" rx="8" fill="#bbf7d0"/><text x="592" y="100" text-anchor="middle" class="svg-ink" font-size="12">Forward</text>
<line x1="100" y1="95" x2="115" y2="95" stroke="#64748b" stroke-width="2"/><line x1="210" y1="95" x2="225" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="335" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="95" x2="445" y2="95" stroke="#64748b" stroke-width="2"/><line x1="540" y1="95" x2="555" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">Talos updates: reputation lists, Snort rules, file verdicts</text>
<line x1="272" y1="48" x2="272" y2="70" stroke="#64748b" stroke-dasharray="4 3"/><line x1="492" y1="48" x2="492" y2="70" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Saste checks pehle; deep inspection sirf allowed traffic ke liye</text>
</svg><p class="cap">Secure Firewall (FTD) mein inspection ka simplified order.</p></div>

<h3>IDS versus IPS, inline versus passive</h3>
<p><b>IDS</b> (intrusion detection system) traffic ki copy leta hai, jaise SPAN port se, aur sirf alert karta hai. Yeh latency nahi jodta aur traffic tod nahi sakta, lekin attack rok bhi nahi sakta. <b>IPS</b> <b>inline</b> baithta hai, isliye har packet usse guzarta hai aur woh malicious packets drop kar sakta hai. FTD interfaces <b>routed</b> ya <b>transparent</b> (layer-2 "bump in the wire") chal sakte hain, aur IPS-only interface pairs <b>inline</b>, <b>inline tap</b> (inline cabling lekin sirf alert, tuning ke dauraan kaam ka) ya <b>passive</b> ho sakte hain.</p>

<div class="eg"><p><b>Worked example: retrospective alert.</b> 09:00 ek user <code>invoice.pdf.exe</code> download karta hai. Uska SHA-256 hash cloud ko pata nahi hai, isliye file allow hoti hai aur sandbox mein bheji jaati hai. 09:40 sandbox dekhta hai ki woh test files encrypt karti hai aur verdict malicious ho jaata hai. Talos naya verdict publish karta hai. 09:41 FMC ek <b>retrospective</b> event deta hai: "10.20.20.11 par pehle dekhi gayi file ab malicious hai". Us laptop par Secure Endpoint file quarantine karta hai, aur SOC ISE se host quarantine karne ko kehta hai. Yeh "after" phase kaam karta hua hai.</p></div>

<h3>Integration: firewall aur ISE aapas mein baat karte hain</h3>
<p>FMC ISE ko <b>pxGrid</b> par subscribe karke seekh sakta hai ki "10.20.20.11 alice hai, group Employees mein, SGT 10", taaki access rules addresses ki jagah naam use kar sakein. Doosri direction mein, jab firewall kisi host se attack dekhta hai, FMC ISE se <b>Adaptive Network Control (ANC)</b> quarantine policy apply karne ko keh sakta hai; ISE phir access switch ko RADIUS <b>CoA</b> bhejta hai, aur host restricted VLAN ya tag mein chala jaata hai. Ise aksar <b>rapid threat containment</b> kehte hain, aur CoA aapko chapter 9 mein phir milega.</p>

<div class="warn"><p><b>Common galti.</b> "Safe rehne ke liye" har IPS rule enable kar dena. Hazaaron irrelevant rules latency aur false positives badhate hain, aur teams phir IPS ko alert-only mode mein daal ke bhool jaati hain. Cisco base policy (jaise "Balanced Security and Connectivity") se shuru karo aur use un assets ke liye tune karo jo aapke paas sach mein hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> IDS traffic block nahi kar sakta kyunki woh sirf copy dekhta hai. Agar question mein "prevent" ya "drop" likha hai, to answer mein inline IPS ya NGFW chahiye. Aur retrospective security ka matlab hai file ko allow hone ke <i>baad</i> dobara evaluate karna, tez scan karna nahi.</p></div>

<div class="scn"><h4>Port 443 "web" nahi hai</h4><p>Ek hospital ka firewall sabke liye TCP 443 outbound allow karta tha. Flow analytics ne dikhaya ki ek server har raat port 443 par ek unknown address ko 30 GB bhej raha tha. Traffic ek remote-access tool tha jo vendor ne bina approval install kiya tha. Secure Firewall par migrate karne ke baad team ne application ke hisaab se rules likhe: approved web aur collaboration apps allow, ISE se seekhe IT group ke alawa remote-access tools block, aur Security Intelligence enable. Agli koshish user name ke saath block aur log hui.</p><p><b>Seekh:</b> port-based rules applications mein farak nahi kar sakte. NGFW applications, users aur reputation ke saath policy likhta hai.</p></div>

<div class="iv"><p class="q">"Next-generation firewall stateful firewall se kaise alag hai?"</p><p>Strong answer: dono state track karte hain, lekin NGFW port se independent applications pehchanta hai (AVC), user aur group identity use karta hai (ISE se pxGrid ya directory), Talos feeds se reputation par block karta hai, URLs ko category se filter karta hai, inline IPS (Snort 3) aur sandboxing aur retrospective alerts ke saath file/malware inspection chalata hai, aur TLS decrypt kar sakta hai. Cisco Secure Firewall with FTD, FMC se managed, ka naam lo, aur mention karo ki yeh ANC aur CoA se ISE quarantine trigger kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Talos intelligence banata hai (reputation, Snort rules, file verdicts) jise Cisco products enforce karte hain.</li>
<li>NGFW = stateful + application, user, URL, reputation, IPS, malware aur TLS inspection.</li>
<li>Secure Firewall FTD chalata hai aur FMC (on-premises ya cloud-delivered) ya FDM se manage hota hai.</li>
<li>IDS = traffic ki copy, sirf alert; IPS = inline, drop kar sakta hai.</li>
<li>pxGrid firewall ko user context deta hai; ANC plus CoA use ISE ke through host quarantine karne deta hai.</li>
</ul></div>
`}};export{e as default};