var e={id:`architecture-smc-and-engines`,h:{en:`The architecture: SMC, engines and the Management Client`,hi:`Architecture: SMC, engines aur Management Client`},body:{en:`
<p>Think of a big hospital. The administration office keeps the files, the rules and the schedules. The wards are where patients are actually treated. Nobody treats a patient in the administration office, and nobody writes hospital policy in the ward. A Forcepoint deployment has the same split: the <b>Security Management Center (SMC)</b> is the administration office, and the <b>engines</b> are the wards where traffic is handled.</p>

<h3>The SMC: three server roles</h3>
<p>The SMC is a set of server components. In a small lab they can run on one machine, in a large company on several. The main roles are:</p>
<dl class="terms">
<dt>Management Server</dt><dd>The brain. It stores the configuration database: every engine, element and policy. It compiles policies and sends them to engines. It also tracks the status of engines.</dd>
<dt>Log Server</dt><dd>Receives logs and alerts from engines, stores them and lets you browse them. Engines send events to it as traffic is processed.</dd>
<dt>Web Portal Server</dt><dd>Gives selected users a browser-based, read-oriented view of logs and policies without the full Management Client. In the CONFIG simulator it is only mentioned, not modelled.</dd>
</dl>
<p>You, the administrator, use the <b>Management Client</b>, a graphical application, to talk to the Management Server. In the CONFIG simulator the Management Client is the console with the pages Engines, Elements, Policies, Inspection, VPN, Logs, Monitoring and alerts and Tools.</p>

<h3>The engines: where traffic is processed</h3>
<p>An <b>engine</b> is the software that sits in the network path and decides what happens to each packet. The same engine software can be given different roles, and the role decides how it behaves:</p>
<table class="cmp"><tr><th>Engine role</th><th>What it does</th><th>In this track</th></tr>
<tr><td><b>Firewall/VPN</b></td><td>Routes between networks, filters traffic by rules, does NAT and VPN</td><td>Main role, used in every lab</td></tr>
<tr><td><b>IPS</b></td><td>Inspects traffic for attacks, usually without routing</td><td>Mentioned only</td></tr>
<tr><td><b>Layer 2 Firewall</b></td><td>Filters traffic like a firewall but is placed in the network without changing IP addressing</td><td>Mentioned only</td></tr>
</table>
<p>Engines can run on appliances, on virtual machines, or in the cloud, and several nodes can form a cluster. Check the documentation for your NGFW version for supported platforms. In the lab, the engine <code>NK-PUNE-FW</code> runs on a device called FW1.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SMC components and engines">
<rect x="10" y="10" width="330" height="200" rx="12" fill="#ddd6fe"/><text x="175" y="34" text-anchor="middle" class="svg-ink" font-size="14">SMC (control and management)</text>
<rect x="25" y="48" width="140" height="44" rx="8" fill="#fff"/><text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="12">Management Server</text>
<rect x="180" y="48" width="140" height="44" rx="8" fill="#fff"/><text x="250" y="75" text-anchor="middle" class="svg-ink" font-size="12">Log Server</text>
<rect x="25" y="104" width="140" height="44" rx="8" fill="#fff"/><text x="95" y="131" text-anchor="middle" class="svg-ink" font-size="12">Web Portal Server</text>
<rect x="180" y="104" width="140" height="44" rx="8" fill="#fde68a"/><text x="250" y="131" text-anchor="middle" class="svg-ink" font-size="12">Management Client</text>
<text x="175" y="180" text-anchor="middle" class="svg-muted" font-size="12">Policy and configuration live here</text>
<text x="175" y="198" text-anchor="middle" class="svg-muted" font-size="12">Lab: NK-SMC 10.0.0.10</text>
<rect x="400" y="10" width="230" height="200" rx="12" fill="#bbf7d0"/><text x="515" y="34" text-anchor="middle" class="svg-ink" font-size="14">Engines (data plane)</text>
<rect x="415" y="48" width="200" height="40" rx="8" fill="#fff"/><text x="515" y="73" text-anchor="middle" class="svg-ink" font-size="12">Firewall/VPN: NK-PUNE-FW</text>
<rect x="415" y="98" width="200" height="40" rx="8" fill="#fff"/><text x="515" y="123" text-anchor="middle" class="svg-muted" font-size="12">IPS role (mention)</text>
<rect x="415" y="148" width="200" height="40" rx="8" fill="#fff"/><text x="515" y="173" text-anchor="middle" class="svg-muted" font-size="12">Layer 2 Firewall (mention)</text>
<line x1="340" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="370" y="100" text-anchor="middle" class="svg-accent" font-size="12">tcp 8902</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Traffic is processed on the right side only</text>
</svg><p class="cap">Policy lives in the SMC. Packets are processed in the engine. The two sides talk over a trusted management connection.</p></div>

<h3>Where policy lives and where traffic is processed</h3>
<p>This is the most important sentence of the chapter: <b>policy lives in the SMC, traffic is processed in the engine.</b> When you edit a rule you change a record in the SMC database. When you install the policy, the Management Server compiles that record into a form the engine can run and sends it over. From then on the engine uses its own installed copy to decide on every packet, even if the SMC disappears.</p>
<p>So there are two different questions you must learn to ask during every fault: "What does the SMC say?" and "What is the engine actually running?" They are often different, and the gap between them is called <b>pending changes</b>.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings has NK-SMC at 10.0.0.10 and one engine NK-PUNE-FW with control IP 10.0.0.1. The engine opens a management connection to the SMC on TCP 8902 when it starts. The SMC also needs to reach the engine's control address 10.0.0.1. You edit a rule on NK-SMC at 10:00 but do not install. At 10:05 STAFF-PC tries the new service and it fails. Nothing is broken: the engine still runs the 09:30 install. At 10:06 you install, and at 10:07 it works.</p></div>

<h3>Two kinds of traffic on the engine</h3>
<p><b>Management traffic</b> is the engine talking to the SMC (status, logs, policy download) and the SMC talking to the engine. <b>User traffic</b> is everything that passes through the engine between networks. The engine's control interface is the interface used for management traffic; in the lab it is eth0 with 10.0.0.1/24. A policy must always allow the management traffic, otherwise you lock yourself out. That is why a special starting policy exists, which you meet in chapter 4.</p>

<h3>What the lab does not model</h3>
<p>The simulator has one SMC, one or two engines, and a simple log view. It does not model the real database size, Log Server scaling, the Web Portal Server, the IPS and Layer 2 Firewall roles, or hardware appliances. Real products have more. Read the documentation for your NGFW version to learn what applies to your deployment.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting the SMC behind the engine it manages without allowing the management traffic. Treating the SMC as part of the traffic path. Forgetting that the Log Server is a separate role: if logs are missing, the engine may be fine and the log path broken.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which component processes user traffic?" The engine, never the Management Server. "Where do you create a rule?" In the Management Client, stored in the SMC. "Which role gives read-oriented browser access?" The Web Portal Server.</p></div>

<div class="scn"><h4>The SMC was down for a day</h4><p>A Pune engineer panicked when the SMC server lost power overnight. Staff, DMZ and internet access all worked. Only the Management Client could not connect and logs stopped arriving. In the morning the SMC was powered on, the engine reported again, and the engine had buffered nothing critical. The team realised the firewall decisions never depended on the SMC at that moment. They then added a backup schedule and a restore plan for the SMC database, because without it a lost SMC means rebuilding every policy.</p><p><b>Lesson:</b> SMC down is a management problem, not a traffic problem, but you still must protect it.</p></div>

<div class="iv"><p class="q">"Explain the architecture of a Forcepoint-style NGFW deployment."</p><p>Strong answer: the SMC has a Management Server (configuration database, policy compile, engine status), a Log Server (logs and alerts) and optionally a Web Portal Server. Administrators use the Management Client. Engines (Firewall/VPN, IPS, Layer 2 Firewall roles) process traffic using the installed policy and talk to the SMC for status, logs and policy. Mention that policy lives in the SMC and traffic is processed in the engine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SMC roles: Management Server, Log Server, Web Portal Server; you work through the Management Client.</li>
<li>Engines process traffic; the roles are Firewall/VPN, IPS and Layer 2 Firewall.</li>
<li>Policy lives in the SMC; traffic is processed in the engine from its installed copy.</li>
<li>Engine to SMC management uses TCP 8902 in the lab; the policy must always allow it.</li>
<li>Pending changes are the gap between what the SMC says and what the engine runs.</li>
</ul></div>
`,hi:`
<p>Ek bade hospital ko socho. Administration office files, rules aur schedules rakhta hai. Wards mein asli mein patients ka treatment hota hai. Administration office mein koi patient treat nahi karta, aur ward mein koi hospital policy nahi likhta. Forcepoint deployment mein bhi yahi split hai: <b>Security Management Center (SMC)</b> administration office hai, aur <b>engines</b> woh wards hain jahan traffic handle hota hai.</p>

<h3>SMC: teen server roles</h3>
<p>SMC server components ka ek set hai. Chhote lab mein sab ek machine par chal sakte hain, badi company mein kai machines par. Main roles:</p>
<dl class="terms">
<dt>Management Server</dt><dd>Dimaag. Yeh configuration database store karta hai: har engine, element aur policy. Yeh policies compile karke engines ko bhejta hai. Yeh engines ka status bhi track karta hai.</dd>
<dt>Log Server</dt><dd>Engines se logs aur alerts receive karta hai, store karta hai aur browse karne deta hai. Traffic process hote hi engines events isko bhejte hain.</dd>
<dt>Web Portal Server</dt><dd>Chune hue users ko full Management Client ke bina browser-based, read-oriented view deta hai logs aur policies ka. CONFIG simulator mein sirf mention hai, model nahi hai.</dd>
</dl>
<p>Aap, administrator, <b>Management Client</b> (graphical application) se Management Server se baat karte ho. CONFIG simulator mein Management Client woh console hai jisme pages hain Engines, Elements, Policies, Inspection, VPN, Logs, Monitoring and alerts aur Tools.</p>

<h3>Engines: jahan traffic process hota hai</h3>
<p><b>Engine</b> woh software hai jo network path mein baitha hai aur har packet ka decision leta hai. Same engine software ko alag roles diye ja sakte hain, aur role behaviour decide karta hai:</p>
<table class="cmp"><tr><th>Engine role</th><th>Kya karta hai</th><th>Is track mein</th></tr>
<tr><td><b>Firewall/VPN</b></td><td>Networks ke beech route karta hai, rules se traffic filter karta hai, NAT aur VPN karta hai</td><td>Main role, har lab mein</td></tr>
<tr><td><b>IPS</b></td><td>Attacks ke liye traffic inspect karta hai, aam taur par routing ke bina</td><td>Sirf mention</td></tr>
<tr><td><b>Layer 2 Firewall</b></td><td>Firewall ki tarah filter karta hai lekin network mein IP addressing badle bina lagta hai</td><td>Sirf mention</td></tr>
</table>
<p>Engines appliances par, virtual machines par ya cloud mein chal sakte hain, aur kai nodes cluster bana sakte hain. Supported platforms ke liye apne NGFW version ki documentation check karo. Lab mein engine <code>NK-PUNE-FW</code> device FW1 par chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SMC components aur engines">
<rect x="10" y="10" width="330" height="200" rx="12" fill="#ddd6fe"/><text x="175" y="34" text-anchor="middle" class="svg-ink" font-size="14">SMC (control aur management)</text>
<rect x="25" y="48" width="140" height="44" rx="8" fill="#fff"/><text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="12">Management Server</text>
<rect x="180" y="48" width="140" height="44" rx="8" fill="#fff"/><text x="250" y="75" text-anchor="middle" class="svg-ink" font-size="12">Log Server</text>
<rect x="25" y="104" width="140" height="44" rx="8" fill="#fff"/><text x="95" y="131" text-anchor="middle" class="svg-ink" font-size="12">Web Portal Server</text>
<rect x="180" y="104" width="140" height="44" rx="8" fill="#fde68a"/><text x="250" y="131" text-anchor="middle" class="svg-ink" font-size="12">Management Client</text>
<text x="175" y="180" text-anchor="middle" class="svg-muted" font-size="12">Policy aur configuration yahan rehti hai</text>
<text x="175" y="198" text-anchor="middle" class="svg-muted" font-size="12">Lab: NK-SMC 10.0.0.10</text>
<rect x="400" y="10" width="230" height="200" rx="12" fill="#bbf7d0"/><text x="515" y="34" text-anchor="middle" class="svg-ink" font-size="14">Engines (data plane)</text>
<rect x="415" y="48" width="200" height="40" rx="8" fill="#fff"/><text x="515" y="73" text-anchor="middle" class="svg-ink" font-size="12">Firewall/VPN: NK-PUNE-FW</text>
<rect x="415" y="98" width="200" height="40" rx="8" fill="#fff"/><text x="515" y="123" text-anchor="middle" class="svg-muted" font-size="12">IPS role (mention)</text>
<rect x="415" y="148" width="200" height="40" rx="8" fill="#fff"/><text x="515" y="173" text-anchor="middle" class="svg-muted" font-size="12">Layer 2 Firewall (mention)</text>
<line x1="340" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="370" y="100" text-anchor="middle" class="svg-accent" font-size="12">tcp 8902</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Traffic sirf right side par process hota hai</text>
</svg><p class="cap">Policy SMC mein rehti hai. Packets engine mein process hote hain. Dono sides trusted management connection par baat karte hain.</p></div>

<h3>Policy kahan rehti hai aur traffic kahan process hota hai</h3>
<p>Is chapter ka sabse zaroori vakya: <b>policy SMC mein rehti hai, traffic engine mein process hota hai.</b> Jab aap rule edit karte ho to SMC database ka ek record badalta hai. Jab policy install karte ho to Management Server us record ko aise form mein compile karta hai jo engine chala sake, aur bhej deta hai. Uske baad engine apni installed copy se har packet ka decision leta hai, chahe SMC gayab ho jaye.</p>
<p>Isliye har fault mein do alag sawaal puchna seekho: "SMC kya keh raha hai?" aur "Engine asal mein kya chala raha hai?" Yeh aksar alag hote hain, aur is gap ko <b>pending changes</b> kehte hain.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings ke paas NK-SMC 10.0.0.10 hai aur ek engine NK-PUNE-FW control IP 10.0.0.1 ke saath. Engine start hote hi SMC par TCP 8902 par management connection kholta hai. SMC ko bhi engine ka control address 10.0.0.1 reach karna hota hai. Aap 10:00 baje NK-SMC par rule edit karte ho lekin install nahi karte. 10:05 par STAFF-PC naya service try karta hai aur fail hota hai. Kuch toota nahi: engine abhi bhi 09:30 ka install chala raha hai. 10:06 par aap install karte ho, aur 10:07 par kaam karta hai.</p></div>

<h3>Engine par do tarah ka traffic</h3>
<p><b>Management traffic</b> matlab engine SMC se baat kar raha hai (status, logs, policy download) aur SMC engine se. <b>User traffic</b> woh sab hai jo engine se networks ke beech guzarta hai. Engine ka control interface woh interface hai jo management traffic ke liye use hota hai; lab mein yeh eth0 hai, 10.0.0.1/24. Policy mein management traffic hamesha allow hona chahiye, warna aap khud lock out ho jaoge. Isiliye ek special starting policy hoti hai, jo chapter 4 mein milegi.</p>

<h3>Lab kya model nahi karta</h3>
<p>Simulator mein ek SMC, ek ya do engines, aur simple log view hai. Yeh real database size, Log Server scaling, Web Portal Server, IPS aur Layer 2 Firewall roles, ya hardware appliances model nahi karta. Real products mein zyada hota hai. Apni deployment par kya lagu hota hai, uske liye apne NGFW version ki documentation padho.</p>

<div class="warn"><p><b>Common mistakes.</b> Jis engine ko manage karna hai uske peeche SMC rakh dena aur management traffic allow na karna. SMC ko traffic path ka hissa samajhna. Yeh bhoolna ki Log Server alag role hai: logs missing hain to engine theek ho sakta hai aur log path toota ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "User traffic kaun si component process karti hai?" Engine, Management Server kabhi nahi. "Rule kahan banate hain?" Management Client mein, SMC mein store hota hai. "Kaun sa role browser access deta hai jo read-oriented hai?" Web Portal Server.</p></div>

<div class="scn"><h4>SMC ek din ke liye down tha</h4><p>Pune ke engineer ghabra gaye jab raat ko SMC server ki power chali gayi. Staff, DMZ aur internet access sab chal raha tha. Sirf Management Client connect nahi ho raha tha aur logs aana band ho gaye the. Subah SMC on hua, engine ne dobara report kiya. Team ko samajh aaya ki us waqt firewall decisions SMC par depend hi nahi karte the. Phir unhone SMC database ka backup schedule aur restore plan banaya, kyunki SMC kho jaye to har policy dobara banani padegi.</p><p><b>Lesson:</b> SMC down ek management problem hai, traffic problem nahi, lekin phir bhi use protect karna zaroori hai.</p></div>

<div class="iv"><p class="q">"Forcepoint-style NGFW deployment ka architecture samjhao."</p><p>Strong answer: SMC mein Management Server (configuration database, policy compile, engine status), Log Server (logs aur alerts) aur optional Web Portal Server hota hai. Administrators Management Client use karte hain. Engines (Firewall/VPN, IPS, Layer 2 Firewall roles) installed policy se traffic process karte hain aur status, logs aur policy ke liye SMC se baat karte hain. Bolo ki policy SMC mein rehti hai aur traffic engine mein process hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SMC roles: Management Server, Log Server, Web Portal Server; kaam Management Client se hota hai.</li>
<li>Engines traffic process karte hain; roles hain Firewall/VPN, IPS aur Layer 2 Firewall.</li>
<li>Policy SMC mein rehti hai; traffic engine mein apni installed copy se process hota hai.</li>
<li>Lab mein engine se SMC management TCP 8902 par; policy mein yeh hamesha allow hona chahiye.</li>
<li>Pending changes woh gap hai jo SMC kehta hai aur engine chalata hai ke beech hai.</li>
</ul></div>
`}};export{e as default};