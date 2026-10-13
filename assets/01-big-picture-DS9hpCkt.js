var e={id:`big-picture`,h:{en:`What you will learn: from ASA to a managed NGFW`,hi:`Aap kya seekhoge: ASA se managed NGFW tak`},body:{en:`
<p>Picture a chain of shopping malls. Every mall has guards at the doors who check tickets and bags, and a scanner room behind them that looks inside parcels. The guards do not invent their own rules. A <b>central security office</b> writes one rulebook for the whole chain, and a courier carries each new edition to the malls. If the head office edits the rulebook but the courier never leaves, the guards keep working from yesterday's edition. That is exactly how <b>Cisco Secure Firewall Threat Defense</b> (FTD) works: the firewall enforces, the <b>Management Center</b> writes the rules, and <b>Deploy</b> is the courier.</p>

<h3>What you will learn</h3>
<ul>
<li>What Threat Defense is made of: the <b>LINA</b> engine (the ASA data plane you already know) and the <b>Snort 3</b> inspection engine, and which one does what.</li>
<li>The three ways to manage it: on-premises <b>Management Center</b> (FMC), cloud-delivered Management Center (<b>cdFMC</b> in Security Cloud Control) and the on-box <b>Device Manager</b> (FDM).</li>
<li>How a device is registered: <code>configure manager add</code>, the <b>registration key</b>, the <b>NAT ID</b>, and the sftunnel on TCP 8305.</li>
<li>Device management: interfaces, logical names, <b>security zones</b>, static and default routes.</li>
<li>Objects, the <b>access control policy</b> and its order of operations (prefilter, decryption, Security Intelligence, identity, rules, default action).</li>
<li>Every rule action: Allow, Trust, Monitor, Block, Block with reset, Interactive Block.</li>
<li>The <b>NAT policy</b> (auto and manual NAT, exactly like the ASA), platform settings, <b>Deploy</b> with change preview and rollback, and health monitoring.</li>
<li>A troubleshooting workflow that always starts with one question: "is the device running the policy I think it is?"</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with the ASA modules earlier in this track: nameif and interfaces, the connection and translation tables, auto NAT and the <b>real-IP rule</b>, and <code>packet-tracer</code>. You do not need any previous Firepower experience. Everything new is built from zero here. Intrusion policies, Security Intelligence feeds, URL filtering and file policies get their full depth in the later NGFW policies module; here you learn where they sit in the order of operations so the rest of the course has a map.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">writes policy</text>
<line x1="320" y1="54" x2="320" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="330" y="88" class="svg-accent" font-size="12">sftunnel TCP 8305</text>
<rect x="250" y="110" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD (FTD1)</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">enforces policy</text>
<rect x="20" y="110" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="95" y="132" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.1.10</text><text x="95" y="150" text-anchor="middle" class="svg-ink" font-size="13">ADMIN 10.0.1.50</text>
<line x1="170" y1="138" x2="250" y2="138" stroke="#64748b" stroke-width="2"/><text x="210" y="128" text-anchor="middle" class="svg-muted" font-size="12">INSIDE</text><text x="210" y="158" text-anchor="middle" class="svg-muted" font-size="12">.1 Gi0/1</text>
<rect x="470" y="110" width="150" height="56" rx="8" fill="#bae6fd"/><text x="545" y="132" text-anchor="middle" class="svg-ink" font-size="13">ISP 203.0.113.1</text><text x="545" y="150" text-anchor="middle" class="svg-muted" font-size="12">INET 8.8.8.8</text>
<line x1="390" y1="138" x2="470" y2="138" stroke="#64748b" stroke-width="2"/><text x="430" y="128" text-anchor="middle" class="svg-muted" font-size="12">OUTSIDE</text><text x="430" y="158" text-anchor="middle" class="svg-muted" font-size="12">.2/29 Gi0/0</text>
<line x1="320" y1="166" x2="320" y2="226" stroke="#64748b" stroke-width="2"/><text x="330" y="192" class="svg-muted" font-size="12">DMZ Gi0/2 10.0.2.1</text>
<rect x="230" y="226" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="247" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text><text x="320" y="265" text-anchor="middle" class="svg-muted" font-size="12">public 203.0.113.3</text>
</svg><p class="cap">The lab network used in this whole module: three zones on NK-FTD, managed by the Management Center.</p></div>

<h3>The big picture in one paragraph</h3>
<p>On the ASA you typed a rule and it worked the moment you pressed Enter. On Threat Defense you never configure policy on the device. You open the Management Center, edit a <b>candidate</b> policy (interfaces, zones, routes, objects, access control rules, NAT), and click <b>Deploy</b>. The Management Center compiles your rules into LINA configuration (you will see it as the <code>CSM_FW_ACL_</code> access list) and into Snort configuration, then pushes both to the device over an encrypted tunnel. The device CLI, the <code>&gt;</code> prompt, is for <b>verification and troubleshooting</b>: <code>show access-control-config</code>, <code>packet-tracer</code>, <code>show nat</code>, <code>show conn</code>, <code>capture</code>.</p>

<table class="cmp"><tr><th>Question</th><th>ASA</th><th>Threat Defense</th></tr>
<tr><td>Where do I configure?</td><td>CLI or ASDM, on the box</td><td>Management Center (or FDM / cdFMC), then Deploy</td></tr>
<tr><td>What separates networks?</td><td>security levels + interface ACLs</td><td>security zones + one access control policy</td></tr>
<tr><td>What can a rule match?</td><td>addresses, ports</td><td>zones, networks, ports, applications, users, URLs</td></tr>
<tr><td>How do I save?</td><td><code>write memory</code></td><td>Save, then Deploy</td></tr></table>

<h3>The three labs you will solve</h3>
<ol>
<li><b>First access control policy and deploy.</b> NK-FTD blocks everything. You add <b>Inside-Out</b> (INSIDE to OUTSIDE, HTTP, HTTPS, DNS, ICMP, Allow), prove that it does nothing before Deploy, deploy, read its rule-id in <code>packet-tracer</code>, and see SSH hit the <b>Default Action</b> in Connection Events.</li>
<li><b>Publish the DMZ web server.</b> A static NAT rule maps WEB 10.0.2.10 to 203.0.113.3, and an access control rule <b>Web-In</b> allows HTTP and HTTPS to the <b>real</b> address. You verify with <code>show nat</code> untranslate_hits.</li>
<li><b>Ticket INC-8120.</b> Admin-SSH was "added yesterday" but SSH still fails. Two faults hide in one ticket: it was never deployed, and it sits below Block-SSH.</li>
</ol>

<div class="note"><p>In the lab GUI the Management Center has five tabs: <b>Overview</b>, <b>Analysis</b> (Connection Events), <b>Policies</b> (Access Control, NAT), <b>Devices</b> (Interfaces, Routing) and <b>Objects</b> (Network Objects), plus the orange <b>Deploy</b> button at the top right that lights up when you have undeployed changes. A real Management Center has more menus; each chapter tells you both paths.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating FTD like an ASA with a new logo and looking for <code>configure terminal</code>. On a managed device the CLI answers that the device is managed by a Management Center. Your change belongs in the manager.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions describe "a rule that was added but has no effect". Before thinking about rule order or NAT, check whether the policy was deployed. The device runs the last deployed policy, not the one you see in the editor.</p></div>

<div class="scn"><h4>The firewall that ignored a week of work</h4><p>A new engineer at a retail company spent a week cleaning up an access control policy: 40 rules renamed, objects created, shadowed rules removed. On Friday the auditors still saw the old rule names in the device output. The Devices page showed NK-FTD as <b>out of date</b>. Every change had been saved, none had been deployed, and on Monday a colleague found the deploy button still orange.</p><p><b>Lesson:</b> Save stores the policy in the manager; only Deploy changes the firewall.</p></div>

<div class="iv"><p class="q">"What is the biggest operational difference between an ASA and Threat Defense?"</p><p>Say that policy is centrally managed: you edit in the Management Center, Device Manager or cdFMC and deploy, while the device CLI is for verification. Mention the two engines (LINA for routing, NAT and the connection table; Snort for application, intrusion and file inspection) and that rules can match zones, applications, users and URLs, not only addresses and ports.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threat Defense enforces; the Management Center writes the policy; Deploy delivers it.</li>
<li>The device keeps running the last deployed policy until you deploy again.</li>
<li>Zones and one access control policy replace security levels and interface ACLs.</li>
<li>The <code>&gt;</code> CLI is for show, packet-tracer and capture, not for configuring policy.</li>
<li>The labs use NK-FTD with INSIDE 10.0.1.0/24, DMZ 10.0.2.0/24 and OUTSIDE 203.0.113.2/29.</li>
</ul></div>
`,hi:`
<p>Shopping malls ki ek chain socho. Har mall ke darwaze par guards hain jo tickets aur bags check karte hain, aur unke peeche ek scanner room hai jo parcels ke andar dekhta hai. Guards apne rules khud nahi banaate. Ek <b>central security office</b> poori chain ke liye ek rulebook likhta hai, aur ek courier har naya edition malls tak le jaata hai. Agar head office rulebook edit kare lekin courier kabhi nikle hi nahi, to guards kal wale edition se kaam karte rehte hain. <b>Cisco Secure Firewall Threat Defense</b> (FTD) bilkul aise hi kaam karta hai: firewall enforce karta hai, <b>Management Center</b> rules likhta hai, aur <b>Deploy</b> courier hai.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Threat Defense kis cheez se bana hai: <b>LINA</b> engine (ASA data plane jo aap jaante ho) aur <b>Snort 3</b> inspection engine, aur kaun kya karta hai.</li>
<li>Ise manage karne ke teen tarike: on-premises <b>Management Center</b> (FMC), Security Cloud Control mein cloud-delivered Management Center (<b>cdFMC</b>) aur on-box <b>Device Manager</b> (FDM).</li>
<li>Device register kaise hota hai: <code>configure manager add</code>, <b>registration key</b>, <b>NAT ID</b>, aur TCP 8305 par sftunnel.</li>
<li>Device management: interfaces, logical names, <b>security zones</b>, static aur default routes.</li>
<li>Objects, <b>access control policy</b> aur uska order of operations (prefilter, decryption, Security Intelligence, identity, rules, default action).</li>
<li>Har rule action: Allow, Trust, Monitor, Block, Block with reset, Interactive Block.</li>
<li><b>NAT policy</b> (auto aur manual NAT, bilkul ASA jaisa), platform settings, change preview aur rollback ke saath <b>Deploy</b>, aur health monitoring.</li>
<li>Ek troubleshooting workflow jo hamesha ek sawaal se shuru hota hai: "kya device wahi policy chala raha hai jo main soch raha hoon?"</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko is track ke pehle wale ASA modules mein comfortable hona chahiye: nameif aur interfaces, connection aur translation tables, auto NAT aur <b>real-IP rule</b>, aur <code>packet-tracer</code>. Pehle ka koi Firepower experience zaroori nahi. Har nayi cheez yahan zero se banayi gayi hai. Intrusion policies, Security Intelligence feeds, URL filtering aur file policies ko poori depth baad ke NGFW policies module mein milti hai; yahan aap seekhte ho ki woh order of operations mein kahan baithti hain, taaki baaki course ke liye aapke paas ek map ho.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">policy likhta hai</text>
<line x1="320" y1="54" x2="320" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="330" y="88" class="svg-accent" font-size="12">sftunnel TCP 8305</text>
<rect x="250" y="110" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD (FTD1)</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">policy enforce karta hai</text>
<rect x="20" y="110" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="95" y="132" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.1.10</text><text x="95" y="150" text-anchor="middle" class="svg-ink" font-size="13">ADMIN 10.0.1.50</text>
<line x1="170" y1="138" x2="250" y2="138" stroke="#64748b" stroke-width="2"/><text x="210" y="128" text-anchor="middle" class="svg-muted" font-size="12">INSIDE</text><text x="210" y="158" text-anchor="middle" class="svg-muted" font-size="12">.1 Gi0/1</text>
<rect x="470" y="110" width="150" height="56" rx="8" fill="#bae6fd"/><text x="545" y="132" text-anchor="middle" class="svg-ink" font-size="13">ISP 203.0.113.1</text><text x="545" y="150" text-anchor="middle" class="svg-muted" font-size="12">INET 8.8.8.8</text>
<line x1="390" y1="138" x2="470" y2="138" stroke="#64748b" stroke-width="2"/><text x="430" y="128" text-anchor="middle" class="svg-muted" font-size="12">OUTSIDE</text><text x="430" y="158" text-anchor="middle" class="svg-muted" font-size="12">.2/29 Gi0/0</text>
<line x1="320" y1="166" x2="320" y2="226" stroke="#64748b" stroke-width="2"/><text x="330" y="192" class="svg-muted" font-size="12">DMZ Gi0/2 10.0.2.1</text>
<rect x="230" y="226" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="247" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text><text x="320" y="265" text-anchor="middle" class="svg-muted" font-size="12">public 203.0.113.3</text>
</svg><p class="cap">Poore module mein use hone wala lab network: NK-FTD par teen zones, Management Center se managed.</p></div>

<h3>Big picture ek paragraph mein</h3>
<p>ASA par aap rule type karte the aur Enter dabate hi woh kaam karne lagta tha. Threat Defense par aap device par kabhi policy configure nahi karte. Aap Management Center kholte ho, ek <b>candidate</b> policy edit karte ho (interfaces, zones, routes, objects, access control rules, NAT), aur <b>Deploy</b> click karte ho. Management Center aapki rules ko LINA configuration mein (jo aapko <code>CSM_FW_ACL_</code> access list ke roop mein dikhegi) aur Snort configuration mein compile karta hai, phir dono ko encrypted tunnel ke upar device par push karta hai. Device CLI, yaani <code>&gt;</code> prompt, <b>verification aur troubleshooting</b> ke liye hai: <code>show access-control-config</code>, <code>packet-tracer</code>, <code>show nat</code>, <code>show conn</code>, <code>capture</code>.</p>

<table class="cmp"><tr><th>Sawaal</th><th>ASA</th><th>Threat Defense</th></tr>
<tr><td>Configure kahan karun?</td><td>CLI ya ASDM, box par</td><td>Management Center (ya FDM / cdFMC), phir Deploy</td></tr>
<tr><td>Networks ko kya alag karta hai?</td><td>security levels + interface ACLs</td><td>security zones + ek access control policy</td></tr>
<tr><td>Rule kya match kar sakti hai?</td><td>addresses, ports</td><td>zones, networks, ports, applications, users, URLs</td></tr>
<tr><td>Save kaise karun?</td><td><code>write memory</code></td><td>Save, phir Deploy</td></tr></table>

<h3>Teen labs jo aap solve karoge</h3>
<ol>
<li><b>Pehli access control policy aur deploy.</b> NK-FTD sab kuch block karta hai. Aap <b>Inside-Out</b> jodte ho (INSIDE se OUTSIDE, HTTP, HTTPS, DNS, ICMP, Allow), saabit karte ho ki Deploy se pehle yeh kuch nahi karti, deploy karte ho, <code>packet-tracer</code> mein iska rule-id padhte ho, aur Connection Events mein SSH ko <b>Default Action</b> se takraate dekhte ho.</li>
<li><b>DMZ web server publish karo.</b> Ek static NAT rule WEB 10.0.2.10 ko 203.0.113.3 par map karti hai, aur access control rule <b>Web-In</b> HTTP aur HTTPS ko <b>real</b> address par allow karti hai. Aap <code>show nat</code> ke untranslate_hits se verify karte ho.</li>
<li><b>Ticket INC-8120.</b> Admin-SSH "kal jodi gayi" thi lekin SSH ab bhi fail hota hai. Ek ticket mein do faults chhupe hain: yeh kabhi deploy nahi hui, aur yeh Block-SSH ke neeche baithi hai.</li>
</ol>

<div class="note"><p>Lab GUI mein Management Center ke paanch tabs hain: <b>Overview</b>, <b>Analysis</b> (Connection Events), <b>Policies</b> (Access Control, NAT), <b>Devices</b> (Interfaces, Routing) aur <b>Objects</b> (Network Objects), plus upar right mein orange <b>Deploy</b> button jo undeployed changes hone par chamakta hai. Real Management Center mein aur menus hote hain; har chapter aapko dono paths batata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> FTD ko naye logo wala ASA samajhna aur <code>configure terminal</code> dhoondhna. Managed device par CLI jawab deta hai ki device Management Center se managed hai. Aapka change manager mein jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions "aisi rule jo jodi gayi par koi asar nahi" describe karte hain. Rule order ya NAT ke baare mein sochne se pehle check karo ki policy deploy hui ya nahi. Device aakhri deployed policy chalata hai, woh nahi jo aapko editor mein dikhti hai.</p></div>

<div class="scn"><h4>Woh firewall jisne ek hafte ka kaam ignore kiya</h4><p>Ek retail company ke naye engineer ne ek hafta access control policy saaf karne mein lagaya: 40 rules rename hui, objects bane, shadowed rules hataayi gayi. Friday ko auditors ko device output mein ab bhi purane rule names dikhe. Devices page NK-FTD ko <b>out of date</b> dikha raha tha. Har change save hua tha, koi deploy nahi hua tha, aur Monday ko ek colleague ne deploy button ko ab bhi orange paaya.</p><p><b>Seekh:</b> Save policy ko manager mein store karta hai; sirf Deploy firewall ko badalta hai.</p></div>

<div class="iv"><p class="q">"ASA aur Threat Defense ke beech sabse bada operational fark kya hai?"</p><p>Batao ki policy centrally managed hai: aap Management Center, Device Manager ya cdFMC mein edit karke deploy karte ho, jabki device CLI verification ke liye hai. Do engines mention karo (LINA routing, NAT aur connection table ke liye; Snort application, intrusion aur file inspection ke liye) aur yeh ki rules sirf addresses aur ports nahi, balki zones, applications, users aur URLs bhi match kar sakti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threat Defense enforce karta hai; Management Center policy likhta hai; Deploy use pahunchata hai.</li>
<li>Jab tak aap dobara deploy nahi karte, device aakhri deployed policy chalata rehta hai.</li>
<li>Zones aur ek access control policy, security levels aur interface ACLs ki jagah lete hain.</li>
<li><code>&gt;</code> CLI show, packet-tracer aur capture ke liye hai, policy configure karne ke liye nahi.</li>
<li>Labs NK-FTD use karti hain jismein INSIDE 10.0.1.0/24, DMZ 10.0.2.0/24 aur OUTSIDE 203.0.113.2/29 hain.</li>
</ul></div>
`}};export{e as default};