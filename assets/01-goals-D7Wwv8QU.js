var e={id:`goals`,h:{en:`From firewall to NGFW: what you will learn and the big picture`,hi:`Firewall se NGFW tak: aap kya seekhoge aur big picture`},body:{en:`
<p>Think of an international airport. The first check is the <b>passport desk</b>: it looks only at who you are and where you are going. A stateful firewall is that desk. It checks addresses, ports and connection state, and once you are through, it does not care what is inside your bag. A modern airport adds more layers. A <b>watch list</b> stops known criminals before they reach any counter. A <b>boarding rule</b> says which passengers may board which flight. An <b>X-ray machine</b> looks inside every bag for weapons, and a <b>lab</b> swabs suspicious items. Some bags are <b>sealed diplomatic pouches</b>: nobody may open them, by law. Secure Firewall Threat Defense works the same way. This module turns the plain firewall you built in sec-ftd into a <b>next-generation firewall (NGFW)</b> that knows applications, websites, attacks and malware.</p>

<h3>What you will learn</h3>
<ul>
<li>How the <b>Snort 3</b> engine sits next to the LINA firewall engine, and the exact order in which a new connection meets prefilter, Security Intelligence, decryption, access control rules and deep inspection.</li>
<li><b>Security Intelligence</b> (SI): Talos IP, URL and DNS feeds, custom block and do-not-block lists, monitor-only, and the <b>DNS policy</b> with a <b>sinkhole</b> that reveals infected hosts.</li>
<li><b>Application control</b> with AppID (application protocol, client, web application, risk and business relevance) and <b>URL filtering</b> with Talos categories and reputation, block pages and interactive block.</li>
<li><b>Intrusion policies</b>: rules and GID:SID, base policies, rule actions, overrides, Talos rule updates (LSP), the <b>network analysis policy</b> and <b>variable sets</b> such as HOME_NET.</li>
<li><b>File and malware policies</b>: file type detection, Malware Cloud Lookup by SHA-256, dynamic analysis, custom detection and clean lists.</li>
<li>The <b>decryption policy</b>: Decrypt - Resign versus Decrypt - Known Key, do-not-decrypt categories, privacy and performance.</li>
<li>How to read <b>events</b>, tell a false positive from a real attack, <b>tune</b> safely, and troubleshoot with <code>system support trace</code> and <code>system support firewall-engine-debug</code>.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already be able to build and deploy an access control policy from the Management Center, use security zones (INSIDE, DMZ, OUTSIDE), objects and NAT, and publish the DMZ web server: that was sec-ftd. You should know the device CLI checks from sec-ftd-tshoot (<code>packet-tracer</code>, <code>show conn</code>, captures). Inline sets, tap mode and passive IPS interfaces were covered in sec-fw-deploy; here we only refer back to them. The next module, sec-ftd-integration, takes the events you learn to read here and feeds them into Threat Intelligence Director, pxGrid Rapid Threat Containment, XDR and Splunk.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology for this module">
<rect x="20" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="66" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="20" y="100" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="13">ADMIN</text><text x="75" y="136" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.50</text>
<rect x="200" y="62" width="130" height="56" rx="10" fill="#fed7aa"/><text x="265" y="84" text-anchor="middle" class="svg-ink" font-size="13">FTD1 (NK-FTD)</text><text x="265" y="102" text-anchor="middle" class="svg-muted" font-size="12">Snort 3 + LINA</text>
<rect x="200" y="200" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="265" y="220" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text><text x="265" y="238" text-anchor="middle" class="svg-muted" font-size="12">pub 203.0.113.3</text>
<rect x="390" y="62" width="90" height="56" rx="10" fill="#e2e8f0"/><text x="435" y="94" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="520" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="575" y="40" text-anchor="middle" class="svg-ink" font-size="13">INET DNS</text><text x="575" y="56" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="520" y="90" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="575" y="110" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="575" y="126" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="520" y="160" width="110" height="44" rx="8" fill="#fde68a"/><text x="575" y="180" text-anchor="middle" class="svg-ink" font-size="13">BADHOST (C2)</text><text x="575" y="196" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.66</text>
<line x1="130" y1="52" x2="200" y2="82" stroke="#64748b" stroke-width="2"/><line x1="130" y1="122" x2="200" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="265" y1="118" x2="265" y2="200" stroke="#64748b" stroke-width="2"/><line x1="330" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="80" x2="520" y2="42" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="520" y2="112" stroke="#64748b" stroke-width="2"/><line x1="470" y1="118" x2="520" y2="182" stroke="#64748b" stroke-width="2"/>
<text x="165" y="160" class="svg-muted" font-size="12">INSIDE 10.0.1.1</text><text x="275" y="160" class="svg-muted" font-size="12">DMZ 10.0.2.1</text><text x="300" y="135" class="svg-muted" font-size="12">OUTSIDE 203.0.113.2</text>
<text x="320" y="285" text-anchor="middle" class="svg-accent" font-size="12">All threats are simulated: nk-sim markers, .example names, documentation IPs</text>
</svg><p class="cap">The lab network used in every chapter: one Threat Defense, three zones, a partner, a DNS server and a simulated command-and-control host.</p></div>

<h3>Why an NGFW matters</h3>
<p>Almost every business allows TCP 80 and 443 outbound. Attackers know this, so malware calls home over HTTPS, phishing pages live on ordinary hosting, and exploits ride inside allowed web requests. A port-based rule cannot tell Facebook from the ERP portal, a news site from a casino, or a normal product search from an SQL injection. The NGFW layers answer those questions. Each layer needs a feature license on the device: <b>IPS</b> (older name Threat) for intrusion, file control and Security Intelligence, <b>Malware Defense</b> (older name Malware) for cloud lookups, and <b>URL</b> (older name URL Filtering) for categories and reputation. AppID needs no extra license.</p>

<div class="eg"><p><b>Worked example: one request, five decisions.</b> PC1 (10.0.1.10) opens web.nwk.example. (1) Prefilter: not a tunnel, so it goes to Snort. (2) Security Intelligence: 203.0.113.3 and the domain are not on any block list. (3) Decryption: the session is plain HTTP, nothing to decrypt. (4) Access control: rule Inside-Out matches zone INSIDE to OUTSIDE, port 80, action Allow. (5) Deep inspection: the intrusion policy finds no signature and the file policy sees an HTML page, not a file. Verdict: pass. If any step had said block, the later steps would never run.</p></div>

<h3>The five labs in this module</h3>
<table class="cmp"><tr><th>Lab</th><th>What you build</th><th>Chapters</th></tr>
<tr><td>Security Intelligence and a DNS sinkhole against a C2 server</td><td>Block Talos-Malware and Talos-CnC by IP, sinkhole the C2 domain to 192.0.2.254, find the infected host</td><td>3, 4</td></tr>
<tr><td>Application control and URL filtering for the office</td><td>Block-Gambling (categories) and Block-Social (Facebook, YouTube) above Inside-Out</td><td>5, 6</td></tr>
<tr><td>Intrusion policy in front of the published web server</td><td>NK-WEB-IPS (Balanced, Prevention) on Web-In, drop SID 58001</td><td>7, 8</td></tr>
<tr><td>File &amp; malware policy: stop malicious downloads</td><td>NK-FILES: MSEXE download, Block Malware, custom detection list</td><td>9</td></tr>
<tr><td>Ticket: payroll login broken by the IPS, and a beacon nobody saw</td><td>Tune SID 58004, add Decrypt-Uncategorized (Decrypt - Resign)</td><td>10, 11, 12</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Treating NGFW features as switches you turn on everywhere at once. Turning every layer to the strictest setting on day one causes outages, and teams then remove protection in a panic. Enable one layer, watch the events, tune, then enforce.</p></div>

<div class="exam"><p><b>Exam trap.</b> The rule action <b>Trust</b> means "allow without Snort deep inspection", not "trusted and inspected". Only <b>Allow</b> sends traffic to the intrusion and file policies. Every NGFW change is part of the policy and needs a <b>Deploy</b>.</p></div>

<div class="scn"><h4>The firewall that saw nothing</h4><p>A retail company bought a new Threat Defense pair but migrated its old ASA rules one to one, all with action Trust "to avoid performance problems". Months later, a point-of-sale malware outbreak was found by the bank, not by the firewall. The connection events showed thousands of flows to a known command-and-control address, all trusted. The fix was to change the outbound rules to Allow with an intrusion and file policy and to enable Security Intelligence.</p><p><b>Lesson:</b> an NGFW only protects what you let Snort see.</p></div>

<div class="iv"><p class="q">"What makes a next-generation firewall different from a stateful firewall?"</p><p>A strong answer: a stateful firewall decides on addresses, ports and state. An NGFW adds identity of the application (AppID), the website category and reputation, reputation feeds for IPs and domains, intrusion prevention, file and malware inspection, and optional TLS decryption so those checks also work on HTTPS. Mention that on Threat Defense this is the Snort 3 engine working alongside LINA, and that the access control rule action decides whether traffic reaches deep inspection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An NGFW adds reputation, application, URL, intrusion, file and decryption layers on top of stateful filtering.</li>
<li>On Threat Defense, Snort 3 provides those layers next to the LINA firewall engine.</li>
<li>Licenses: IPS for intrusion, files and SI; Malware Defense for cloud lookups; URL for categories and reputation.</li>
<li>Allow inspects, Trust skips deep inspection, Block stops; every change needs Deploy.</li>
<li>Roll out layer by layer: visibility first, then tuning, then enforcement.</li>
</ul></div>
`,hi:`
<p>Ek international airport socho. Pehla check <b>passport desk</b> hai: woh sirf dekhta hai ki aap kaun ho aur kahan ja rahe ho. Stateful firewall wahi desk hai. Woh addresses, ports aur connection state check karta hai, aur ek baar aap nikal gaye to use parwah nahi ki aapke bag mein kya hai. Modern airport aur layers jodta hai. Ek <b>watch list</b> known criminals ko kisi counter tak pahunchne se pehle rok deti hai. Ek <b>boarding rule</b> batata hai ki kaunsa passenger kaunsi flight mein baith sakta hai. <b>X-ray machine</b> har bag ke andar weapons dhoondhti hai, aur <b>lab</b> suspicious cheezon ka swab leti hai. Kuch bags <b>sealed diplomatic pouches</b> hote hain: kanoon ke hisaab se unhe koi khol nahi sakta. Secure Firewall Threat Defense bilkul aise hi kaam karta hai. Yeh module sec-ftd mein banaye plain firewall ko ek <b>next-generation firewall (NGFW)</b> mein badalta hai jo applications, websites, attacks aur malware ko pehchanta hai.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li><b>Snort 3</b> engine LINA firewall engine ke saath kaise baithta hai, aur naya connection prefilter, Security Intelligence, decryption, access control rules aur deep inspection se kis exact order mein milta hai.</li>
<li><b>Security Intelligence</b> (SI): Talos IP, URL aur DNS feeds, custom block aur do-not-block lists, monitor-only, aur <b>sinkhole</b> wali <b>DNS policy</b> jo infected hosts ko pakad leti hai.</li>
<li>AppID ke saath <b>application control</b> (application protocol, client, web application, risk aur business relevance) aur Talos categories aur reputation, block pages aur interactive block ke saath <b>URL filtering</b>.</li>
<li><b>Intrusion policies</b>: rules aur GID:SID, base policies, rule actions, overrides, Talos rule updates (LSP), <b>network analysis policy</b> aur HOME_NET jaise <b>variable sets</b>.</li>
<li><b>File aur malware policies</b>: file type detection, SHA-256 se Malware Cloud Lookup, dynamic analysis, custom detection aur clean lists.</li>
<li><b>Decryption policy</b>: Decrypt - Resign vs Decrypt - Known Key, do-not-decrypt categories, privacy aur performance.</li>
<li><b>Events</b> kaise padhein, false positive ko asli attack se kaise alag karein, safely <b>tune</b> kaise karein, aur <code>system support trace</code> aur <code>system support firewall-engine-debug</code> se troubleshoot kaise karein.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko Management Center se access control policy banana aur deploy karna aana chahiye, security zones (INSIDE, DMZ, OUTSIDE), objects aur NAT use karna aur DMZ web server publish karna aana chahiye: yeh sec-ftd tha. sec-ftd-tshoot ke device CLI checks (<code>packet-tracer</code>, <code>show conn</code>, captures) aane chahiye. Inline sets, tap mode aur passive IPS interfaces sec-fw-deploy mein cover hue the; yahan hum sirf unka reference dete hain. Agla module, sec-ftd-integration, yahan padhna seekhe events ko Threat Intelligence Director, pxGrid Rapid Threat Containment, XDR aur Splunk mein le jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Is module ka lab topology">
<rect x="20" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="66" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="20" y="100" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="13">ADMIN</text><text x="75" y="136" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.50</text>
<rect x="200" y="62" width="130" height="56" rx="10" fill="#fed7aa"/><text x="265" y="84" text-anchor="middle" class="svg-ink" font-size="13">FTD1 (NK-FTD)</text><text x="265" y="102" text-anchor="middle" class="svg-muted" font-size="12">Snort 3 + LINA</text>
<rect x="200" y="200" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="265" y="220" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text><text x="265" y="238" text-anchor="middle" class="svg-muted" font-size="12">pub 203.0.113.3</text>
<rect x="390" y="62" width="90" height="56" rx="10" fill="#e2e8f0"/><text x="435" y="94" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="520" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="575" y="40" text-anchor="middle" class="svg-ink" font-size="13">INET DNS</text><text x="575" y="56" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="520" y="90" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="575" y="110" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="575" y="126" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="520" y="160" width="110" height="44" rx="8" fill="#fde68a"/><text x="575" y="180" text-anchor="middle" class="svg-ink" font-size="13">BADHOST (C2)</text><text x="575" y="196" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.66</text>
<line x1="130" y1="52" x2="200" y2="82" stroke="#64748b" stroke-width="2"/><line x1="130" y1="122" x2="200" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="265" y1="118" x2="265" y2="200" stroke="#64748b" stroke-width="2"/><line x1="330" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="80" x2="520" y2="42" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="520" y2="112" stroke="#64748b" stroke-width="2"/><line x1="470" y1="118" x2="520" y2="182" stroke="#64748b" stroke-width="2"/>
<text x="165" y="160" class="svg-muted" font-size="12">INSIDE 10.0.1.1</text><text x="275" y="160" class="svg-muted" font-size="12">DMZ 10.0.2.1</text><text x="300" y="135" class="svg-muted" font-size="12">OUTSIDE 203.0.113.2</text>
<text x="320" y="285" text-anchor="middle" class="svg-accent" font-size="12">Saare threats simulated hain: nk-sim markers, .example names, documentation IPs</text>
</svg><p class="cap">Har chapter mein use hone wala lab network: ek Threat Defense, teen zones, ek partner, ek DNS server aur ek simulated command-and-control host.</p></div>

<h3>NGFW kyun zaroori hai</h3>
<p>Lagbhag har business outbound TCP 80 aur 443 allow karta hai. Attackers yeh jaante hain, isliye malware HTTPS par ghar call karta hai, phishing pages aam hosting par rehte hain, aur exploits allowed web requests ke andar chalte hain. Port-based rule Facebook aur ERP portal mein, news site aur casino mein, ya normal product search aur SQL injection mein fark nahi kar sakti. NGFW layers in sawaalon ka jawab deti hain. Har layer ke liye device par feature license chahiye: intrusion, file control aur Security Intelligence ke liye <b>IPS</b> (purana naam Threat), cloud lookups ke liye <b>Malware Defense</b> (purana naam Malware), aur categories aur reputation ke liye <b>URL</b> (purana naam URL Filtering). AppID ke liye extra license nahi chahiye.</p>

<div class="eg"><p><b>Worked example: ek request, paanch faisle.</b> PC1 (10.0.1.10) web.nwk.example kholta hai. (1) Prefilter: tunnel nahi hai, isliye Snort ke paas jaata hai. (2) Security Intelligence: 203.0.113.3 aur domain kisi block list par nahi hain. (3) Decryption: session plain HTTP hai, decrypt karne ko kuch nahi. (4) Access control: rule Inside-Out zone INSIDE se OUTSIDE, port 80, action Allow match karti hai. (5) Deep inspection: intrusion policy ko koi signature nahi milta aur file policy ko HTML page dikhta hai, file nahi. Verdict: pass. Agar kisi bhi step ne block kaha hota, to baad ke steps kabhi chalte hi nahi.</p></div>

<h3>Is module ke paanch labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya banaoge</th><th>Chapters</th></tr>
<tr><td>C2 server ke khilaf Security Intelligence aur DNS sinkhole</td><td>Talos-Malware aur Talos-CnC ko IP se block karo, C2 domain ko 192.0.2.254 par sinkhole karo, infected host dhoondho</td><td>3, 4</td></tr>
<tr><td>Office ke liye application control aur URL filtering</td><td>Inside-Out ke upar Block-Gambling (categories) aur Block-Social (Facebook, YouTube)</td><td>5, 6</td></tr>
<tr><td>Published web server ke aage intrusion policy</td><td>Web-In par NK-WEB-IPS (Balanced, Prevention), SID 58001 drop</td><td>7, 8</td></tr>
<tr><td>File &amp; malware policy: malicious downloads roko</td><td>NK-FILES: MSEXE download, Block Malware, custom detection list</td><td>9</td></tr>
<tr><td>Ticket: IPS ne payroll login toda, aur ek beacon jo kisi ne nahi dekha</td><td>SID 58004 tune karo, Decrypt-Uncategorized (Decrypt - Resign) jodo</td><td>10, 11, 12</td></tr></table>

<div class="warn"><p><b>Common galti.</b> NGFW features ko aise switches samajhna jo ek saath har jagah on kar do. Pehle din har layer ko sabse strict setting par lagane se outages hote hain, aur phir teams ghabra kar protection hata deti hain. Ek layer enable karo, events dekho, tune karo, phir enforce karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Rule action <b>Trust</b> ka matlab hai "Snort deep inspection ke bina allow", "trusted aur inspected" nahi. Sirf <b>Allow</b> traffic ko intrusion aur file policies tak bhejta hai. Har NGFW change policy ka hissa hai aur use <b>Deploy</b> chahiye.</p></div>

<div class="scn"><h4>Woh firewall jisne kuch nahi dekha</h4><p>Ek retail company ne naya Threat Defense pair khareeda lekin purane ASA rules ek-ek karke migrate kar diye, sab action Trust ke saath "performance problems se bachne ke liye". Mahino baad, point-of-sale malware outbreak bank ne pakda, firewall ne nahi. Connection events mein ek known command-and-control address ki taraf hazaron flows the, sab trusted. Fix tha outbound rules ko intrusion aur file policy ke saath Allow karna aur Security Intelligence enable karna.</p><p><b>Lesson:</b> NGFW sirf wahi protect karta hai jo aap Snort ko dekhne dete ho.</p></div>

<div class="iv"><p class="q">"Next-generation firewall stateful firewall se kaise alag hai?"</p><p>Strong jawab: stateful firewall addresses, ports aur state par decide karta hai. NGFW application ki pehchan (AppID), website ki category aur reputation, IPs aur domains ke reputation feeds, intrusion prevention, file aur malware inspection, aur optional TLS decryption jodta hai taaki yeh checks HTTPS par bhi kaam karein. Batao ki Threat Defense par yeh Snort 3 engine hai jo LINA ke saath kaam karta hai, aur access control rule ka action decide karta hai ki traffic deep inspection tak pahunchega ya nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NGFW stateful filtering ke upar reputation, application, URL, intrusion, file aur decryption layers jodta hai.</li>
<li>Threat Defense par Snort 3 yeh layers LINA firewall engine ke saath deta hai.</li>
<li>Licenses: intrusion, files aur SI ke liye IPS; cloud lookups ke liye Malware Defense; categories aur reputation ke liye URL.</li>
<li>Allow inspect karta hai, Trust deep inspection chhod deta hai, Block rokta hai; har change ko Deploy chahiye.</li>
<li>Layer by layer roll out karo: pehle visibility, phir tuning, phir enforcement.</li>
</ul></div>
`}};export{e as default};