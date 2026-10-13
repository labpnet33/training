var e={id:`big-picture`,h:{en:`The firewall detective: what you will learn`,hi:`Firewall detective: aap kya seekhoge`},body:{en:`
<p>Picture the security checkpoint at a busy airport. A passenger calls and says: "I never reached my gate." A good security supervisor does not start moving barriers around. She asks four calm questions. <b>Did the passenger even reach the checkpoint?</b> She checks the CCTV at the entrance. <b>What would our rulebook do with this passenger?</b> She runs the passenger's details through the rulebook. <b>Who is inside right now?</b> She reads the live list of passengers already airside. <b>What did the officers write down?</b> She reads the logbook. Only then does she change anything. A Cisco ASA gives you exactly these four instruments: <b>capture</b> (CCTV), <b>packet-tracer</b> (the rulebook simulator), <b>show conn</b> and <b>show xlate</b> (the live list), and <b>syslog</b> (the logbook).</p>

<h3>What you will learn</h3>
<ul>
<li>The ASA <b>packet flow</b>: the exact order in which a packet meets the connection table, NAT, routing, access lists and inspection, and why that order explains most tickets.</li>
<li><b>packet-tracer</b> in depth: syntax, every phase, the detailed output and the drop reasons.</li>
<li><b>Captures</b>: match filters, interfaces, real-time mode, <code>type asp-drop</code>, captures on both sides of NAT and exporting a pcap for Wireshark.</li>
<li><b>show conn</b> with its flags decoded, <b>show xlate</b>, <b>show nat</b> hit counters and <b>show asp drop</b>.</li>
<li>The <b>syslog message IDs</b> every firewall engineer should recognise on sight, plus logging levels, buffers and timestamps.</li>
<li><b>show service-policy</b> for inspections, and basic CPU and memory health checks.</li>
<li>A <b>structured troubleshooting method</b>, applied to both labs: the partner portal ticket and proving NAT with captures.</li>
</ul>

<h3>Prerequisites</h3>
<p>This module assumes the three ASA modules before it. From <b>ASA basics</b> you need interfaces, <code>nameif</code>, security levels, static routes and interface PAT. From <b>ASA access control</b> you need interface ACLs, <code>access-group</code> and the rule that ACLs match <b>real</b> (untranslated) addresses. From <b>ASA NAT</b> you need object NAT, static publishing and <code>show nat</code>. You should also know the TCP three-way handshake (SYN, SYN-ACK, ACK). We refer back to these topics; we do not re-teach them.</p>

<h3>The lab network</h3>
<p>Both labs use the same topology, and every example in this module uses its names and addresses so you can type along.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="20" y="40" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="60" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="76" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="20" y="130" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="150" text-anchor="middle" class="svg-ink" font-size="13">ADMIN</text><text x="75" y="166" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.50</text>
<rect x="165" y="85" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="205" y="112" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="130" y1="62" x2="165" y2="100" stroke="#64748b" stroke-width="2"/><line x1="130" y1="152" x2="165" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="75" width="120" height="64" rx="8" fill="#fed7aa"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="14">ASA1</text><text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="12">hostname NK-ASA</text>
<line x1="245" y1="107" x2="270" y2="107" stroke="#64748b" stroke-width="2"/>
<text x="258" y="160" text-anchor="middle" class="svg-muted" font-size="12">inside 100</text>
<rect x="430" y="85" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="470" y="112" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="390" y1="107" x2="430" y2="107" stroke="#64748b" stroke-width="2"/><text x="410" y="70" text-anchor="middle" class="svg-muted" font-size="12">outside 0</text>
<rect x="530" y="30" width="100" height="44" rx="8" fill="#bae6fd"/><text x="580" y="50" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="580" y="66" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="530" y="140" width="100" height="44" rx="8" fill="#bae6fd"/><text x="580" y="160" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="580" y="176" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<line x1="510" y1="100" x2="530" y2="55" stroke="#64748b" stroke-width="2"/><line x1="510" y1="115" x2="530" y2="160" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="215" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="235" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="330" y="251" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="330" y1="139" x2="330" y2="215" stroke="#64748b" stroke-width="2"/><text x="385" y="185" class="svg-muted" font-size="12">dmz 50</text>
<text x="320" y="290" text-anchor="middle" class="svg-accent" font-size="12">Portal DNS name points to 203.0.113.3 (public address of WEB)</text>
</svg><p class="cap">The lab: inside users, a DMZ web server and the internet side with a partner PC. ASA1 runs hostname NK-ASA.</p></div>

<table class="cmp"><tr><th>Interface</th><th>nameif / level</th><th>Address</th><th>Behind it</th></tr>
<tr><td>GigabitEthernet0/0</td><td>outside / 0</td><td>203.0.113.2/29, default route to 203.0.113.1</td><td>ISP, INET 8.8.8.8, PARTNER 198.51.100.10</td></tr>
<tr><td>GigabitEthernet0/1</td><td>inside / 100</td><td>10.0.1.1/24</td><td>PC1 10.0.1.10, ADMIN 10.0.1.50</td></tr>
<tr><td>GigabitEthernet0/2</td><td>dmz / 50</td><td>10.0.2.1/24</td><td>WEB 10.0.2.10</td></tr></table>
<p>The base configuration has interface PAT for INSIDE-NET and DMZ-NET, <code>inspect icmp</code> added to the global policy, and <code>logging enable</code> with <code>logging buffered informational</code>.</p>

<h3>The four questions</h3>
<p>Every ticket in this module is solved with the same four questions. Learn them now; chapter 11 turns them into a full method.</p>
<table class="cmp"><tr><th>Question</th><th>Tool</th><th>What the answer tells you</th></tr>
<tr><td>1. Does the traffic reach the firewall?</td><td><code>capture</code></td><td>Nothing arrives: the problem is before the ASA (DNS, client, ISP, ARP, routing).</td></tr>
<tr><td>2. What would the firewall do with it?</td><td><code>packet-tracer</code></td><td>Every processing phase and the exact drop reason.</td></tr>
<tr><td>3. What is it doing right now?</td><td><code>show conn</code>, <code>show xlate</code>, <code>show nat</code>, <code>show access-list</code></td><td>Live connections, translations and hit counters.</td></tr>
<tr><td>4. What did it record?</td><td><code>show logging</code>, <code>show asp drop</code></td><td>Syslog messages and drop counters with reasons.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A user on PC1 says "8.8.8.8 does not answer". You ask question 1 with a capture on <code>inside</code>: echo requests from 10.0.1.10 arrive. Question 2: packet-tracer from inside shows ROUTE-LOOKUP, ACCESS-LIST, NAT and INSPECT all ALLOW. Question 3: <code>show xlate</code> shows 10.0.1.10 translated to 203.0.113.2. Question 4: syslog shows 305011 (translation built) and 302020 (ICMP connection built). The ASA did its job, so the next place to look is upstream. Four commands, two minutes, and you have evidence instead of opinions.</p></div>

<h3>Why this matters</h3>
<p>The firewall is blamed first in almost every outage because it is the device that says "no". Your job is not to defend it, it is to <b>prove</b> quickly whether it is involved. The same commands also work on Cisco Secure Firewall Threat Defense, whose data plane (often called LINA) accepts packet-tracer, capture and show conn from its CLI. That module comes later; the skills start here.</p>

<div class="warn"><p><b>Common mistake.</b> Changing ACLs or NAT "to see if it helps" before collecting evidence. You may fix the symptom, create a new hole, and never learn the real cause. Evidence first, change second, verification third.</p></div>

<div class="exam"><p><b>Exam trap.</b> packet-tracer <b>simulates</b> a packet through the configuration; it does not send real traffic and it never proves the server answered. A capture shows <b>real</b> packets on an interface, and it sees them before the access list decides. Questions often swap these two.</p></div>

<div class="scn"><h4>"It is always the firewall"</h4><p>After a data-center move, the service desk escalated a P1: customers could not reach the order portal, and the application team was sure the new ASA was blocking it. The firewall engineer started a capture on the outside interface for the portal's public address and asked a customer to retry. The capture stayed at 0 packets. A DNS lookup from outside still returned the old data-center address. The TTL on the record had been set to one day.</p><p><b>Lesson:</b> a capture that stays empty ends the argument in minutes. If packets never reach the firewall, no firewall change can fix the problem.</p></div>

<div class="iv"><p class="q">"A user cannot reach a server through the ASA. How do you troubleshoot it?"</p><p>A strong answer gives a method, not a list of guesses: confirm the exact flow (source, destination, port), then capture on the ingress interface to prove arrival, run packet-tracer with the same five-tuple to see each phase and the drop reason, check <code>show conn</code> and <code>show xlate</code> for live state, and read syslog (106023, 302013/302014, 305011). Mention capturing on the egress interface too, to see whether the server replies, and removing captures afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four instruments: capture (did it arrive), packet-tracer (what would happen), show conn and show xlate (what is happening), syslog and asp drop (what was recorded).</li>
<li>Collect evidence before you change anything.</li>
<li>packet-tracer simulates; capture shows real packets before the ACL decides.</li>
<li>The lab: outside 203.0.113.2/29, inside 10.0.1.1/24, dmz 10.0.2.1/24, WEB 10.0.2.10, PARTNER 198.51.100.10.</li>
<li>The same commands carry over to Threat Defense later in the track.</li>
</ul></div>
`,hi:`
<p>Ek busy airport ke security checkpoint ki kalpana karo. Ek passenger call karke kehta hai: "Main apne gate tak kabhi pahuncha hi nahi." Ek achhi security supervisor barriers idhar udhar nahi karti. Woh chaar shaant sawaal poochti hai. <b>Kya passenger checkpoint tak pahuncha bhi?</b> Woh entrance ka CCTV check karti hai. <b>Hamari rulebook is passenger ke saath kya karti?</b> Woh passenger ki details rulebook se guzarti hai. <b>Abhi andar kaun hai?</b> Woh airside pahunch chuke passengers ki live list padhti hai. <b>Officers ne kya likha?</b> Woh logbook padhti hai. Uske baad hi woh kuch badalti hai. Cisco ASA aapko bilkul yahi chaar instruments deta hai: <b>capture</b> (CCTV), <b>packet-tracer</b> (rulebook simulator), <b>show conn</b> aur <b>show xlate</b> (live list), aur <b>syslog</b> (logbook).</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>ASA ka <b>packet flow</b>: woh exact order jismein packet connection table, NAT, routing, access lists aur inspection se milta hai, aur kyun yeh order zyada tar tickets ko samjha deta hai.</li>
<li><b>packet-tracer</b> gehraai se: syntax, har phase, detailed output aur drop reasons.</li>
<li><b>Captures</b>: match filters, interfaces, real-time mode, <code>type asp-drop</code>, NAT ke dono taraf captures aur Wireshark ke liye pcap export karna.</li>
<li><b>show conn</b> ke flags decode karke, <b>show xlate</b>, <b>show nat</b> hit counters aur <b>show asp drop</b>.</li>
<li>Woh <b>syslog message IDs</b> jo har firewall engineer ko dekhte hi pehchaanne chahiye, saath mein logging levels, buffers aur timestamps.</li>
<li>Inspections ke liye <b>show service-policy</b>, aur basic CPU aur memory health checks.</li>
<li>Ek <b>structured troubleshooting method</b>, dono labs par lagaya hua: partner portal ticket aur captures se NAT saabit karna.</li>
</ul>

<h3>Prerequisites</h3>
<p>Yeh module isse pehle ke teen ASA modules maan kar chalta hai. <b>ASA basics</b> se aapko interfaces, <code>nameif</code>, security levels, static routes aur interface PAT chahiye. <b>ASA access control</b> se interface ACLs, <code>access-group</code> aur yeh rule chahiye ki ACLs <b>real</b> (untranslated) addresses match karti hain. <b>ASA NAT</b> se object NAT, static publishing aur <code>show nat</code> chahiye. Aapko TCP three-way handshake (SYN, SYN-ACK, ACK) bhi pata hona chahiye. Hum in topics ka reference denge; inhe dobara nahi padhayenge.</p>

<h3>Lab network</h3>
<p>Dono labs same topology use karti hain, aur is module ka har example uske naam aur addresses use karta hai taaki aap saath saath type kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="20" y="40" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="60" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="76" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="20" y="130" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="75" y="150" text-anchor="middle" class="svg-ink" font-size="13">ADMIN</text><text x="75" y="166" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.50</text>
<rect x="165" y="85" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="205" y="112" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="130" y1="62" x2="165" y2="100" stroke="#64748b" stroke-width="2"/><line x1="130" y1="152" x2="165" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="75" width="120" height="64" rx="8" fill="#fed7aa"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="14">ASA1</text><text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="12">hostname NK-ASA</text>
<line x1="245" y1="107" x2="270" y2="107" stroke="#64748b" stroke-width="2"/>
<text x="258" y="160" text-anchor="middle" class="svg-muted" font-size="12">inside 100</text>
<rect x="430" y="85" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="470" y="112" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="390" y1="107" x2="430" y2="107" stroke="#64748b" stroke-width="2"/><text x="410" y="70" text-anchor="middle" class="svg-muted" font-size="12">outside 0</text>
<rect x="530" y="30" width="100" height="44" rx="8" fill="#bae6fd"/><text x="580" y="50" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="580" y="66" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="530" y="140" width="100" height="44" rx="8" fill="#bae6fd"/><text x="580" y="160" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="580" y="176" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<line x1="510" y1="100" x2="530" y2="55" stroke="#64748b" stroke-width="2"/><line x1="510" y1="115" x2="530" y2="160" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="215" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="235" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="330" y="251" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="330" y1="139" x2="330" y2="215" stroke="#64748b" stroke-width="2"/><text x="385" y="185" class="svg-muted" font-size="12">dmz 50</text>
<text x="320" y="290" text-anchor="middle" class="svg-accent" font-size="12">Portal ka DNS naam 203.0.113.3 batata hai (WEB ka public address)</text>
</svg><p class="cap">Lab: inside users, ek DMZ web server aur internet side par ek partner PC. ASA1 ka hostname NK-ASA hai.</p></div>

<table class="cmp"><tr><th>Interface</th><th>nameif / level</th><th>Address</th><th>Iske peeche</th></tr>
<tr><td>GigabitEthernet0/0</td><td>outside / 0</td><td>203.0.113.2/29, default route 203.0.113.1 ki taraf</td><td>ISP, INET 8.8.8.8, PARTNER 198.51.100.10</td></tr>
<tr><td>GigabitEthernet0/1</td><td>inside / 100</td><td>10.0.1.1/24</td><td>PC1 10.0.1.10, ADMIN 10.0.1.50</td></tr>
<tr><td>GigabitEthernet0/2</td><td>dmz / 50</td><td>10.0.2.1/24</td><td>WEB 10.0.2.10</td></tr></table>
<p>Base configuration mein INSIDE-NET aur DMZ-NET ke liye interface PAT hai, global policy mein <code>inspect icmp</code> joda gaya hai, aur <code>logging enable</code> ke saath <code>logging buffered informational</code> hai.</p>

<h3>Chaar sawaal</h3>
<p>Is module ka har ticket inhi chaar sawaalon se solve hota hai. Inhe abhi yaad kar lo; chapter 11 inhe ek poora method bana deta hai.</p>
<table class="cmp"><tr><th>Sawaal</th><th>Tool</th><th>Jawab kya batata hai</th></tr>
<tr><td>1. Kya traffic firewall tak pahunchta hai?</td><td><code>capture</code></td><td>Kuch nahi aata: problem ASA se pehle hai (DNS, client, ISP, ARP, routing).</td></tr>
<tr><td>2. Firewall iske saath kya karega?</td><td><code>packet-tracer</code></td><td>Har processing phase aur exact drop reason.</td></tr>
<tr><td>3. Abhi woh kya kar raha hai?</td><td><code>show conn</code>, <code>show xlate</code>, <code>show nat</code>, <code>show access-list</code></td><td>Live connections, translations aur hit counters.</td></tr>
<tr><td>4. Usne kya record kiya?</td><td><code>show logging</code>, <code>show asp drop</code></td><td>Syslog messages aur reasons ke saath drop counters.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> PC1 ka ek user kehta hai "8.8.8.8 jawab nahi deta". Aap <code>inside</code> par capture ke saath sawaal 1 poochte ho: 10.0.1.10 se echo requests aate hain. Sawaal 2: inside se packet-tracer ROUTE-LOOKUP, ACCESS-LIST, NAT aur INSPECT sab ALLOW dikhata hai. Sawaal 3: <code>show xlate</code> dikhata hai ki 10.0.1.10 203.0.113.2 mein translate hua. Sawaal 4: syslog 305011 (translation bana) aur 302020 (ICMP connection bana) dikhata hai. ASA ne apna kaam kiya, isliye agli jagah dekhne ki upstream hai. Chaar commands, do minute, aur aapke paas opinions ki jagah evidence hai.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Lagbhag har outage mein sabse pehle firewall ko blame kiya jaata hai kyunki wahi device "nahi" kehta hai. Aapka kaam use defend karna nahi, balki jaldi se <b>saabit</b> karna hai ki woh involved hai ya nahi. Yahi commands Cisco Secure Firewall Threat Defense par bhi kaam karti hain, jiska data plane (aksar LINA kehlata hai) apne CLI se packet-tracer, capture aur show conn accept karta hai. Woh module baad mein aata hai; skills yahan se shuru hoti hain.</p>

<div class="warn"><p><b>Common galti.</b> Evidence collect karne se pehle ACLs ya NAT ko "dekhte hain madad karta hai kya" soch kar badalna. Aap symptom theek kar sakte ho, ek naya hole bana sakte ho, aur asli wajah kabhi nahi jaan paoge. Pehle evidence, doosra change, teesra verification.</p></div>

<div class="exam"><p><b>Exam trap.</b> packet-tracer configuration ke through ek packet <b>simulate</b> karta hai; yeh real traffic nahi bhejta aur kabhi saabit nahi karta ki server ne jawab diya. Capture interface par <b>real</b> packets dikhata hai, aur unhe access list ke decide karne se pehle dekhta hai. Questions aksar in dono ko ulat dete hain.</p></div>

<div class="scn"><h4>"Hamesha firewall hi hota hai"</h4><p>Data-center move ke baad service desk ne ek P1 escalate kiya: customers order portal tak nahi pahunch pa rahe the, aur application team ko pakka yakeen tha ki naya ASA use block kar raha hai. Firewall engineer ne portal ke public address ke liye outside interface par capture shuru kiya aur ek customer se retry karwaya. Capture 0 packets par hi raha. Bahar se DNS lookup ab bhi purane data-center ka address de raha tha. Record ka TTL ek din set tha.</p><p><b>Seekh:</b> khaali rehne wala capture bahas ko minutes mein khatam kar deta hai. Agar packets firewall tak kabhi pahunchte hi nahi, to koi firewall change problem theek nahi kar sakta.</p></div>

<div class="iv"><p class="q">"Ek user ASA ke through server tak nahi pahunch pa raha. Aap troubleshoot kaise karoge?"</p><p>Strong answer guesses ki list nahi, ek method deta hai: exact flow confirm karo (source, destination, port), phir arrival saabit karne ke liye ingress interface par capture karo, har phase aur drop reason dekhne ke liye same five-tuple ke saath packet-tracer chalao, live state ke liye <code>show conn</code> aur <code>show xlate</code> check karo, aur syslog padho (106023, 302013/302014, 305011). Egress interface par bhi capture karna mention karo, yeh dekhne ke liye ki server reply karta hai ya nahi, aur baad mein captures hatana.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar instruments: capture (kya pahuncha), packet-tracer (kya hoga), show conn aur show xlate (kya ho raha hai), syslog aur asp drop (kya record hua).</li>
<li>Kuch bhi badalne se pehle evidence collect karo.</li>
<li>packet-tracer simulate karta hai; capture ACL ke decide karne se pehle real packets dikhata hai.</li>
<li>Lab: outside 203.0.113.2/29, inside 10.0.1.1/24, dmz 10.0.2.1/24, WEB 10.0.2.10, PARTNER 198.51.100.10.</li>
<li>Yahi commands track mein aage Threat Defense par bhi kaam aati hain.</li>
</ul></div>
`}};export{e as default};