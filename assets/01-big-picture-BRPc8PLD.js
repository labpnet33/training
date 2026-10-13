var e={id:`big-picture`,h:{en:`The big picture: thinking like a troubleshooter`,hi:`Big picture: troubleshooter ki tarah sochna`},body:{en:`
<p><b>What you will learn in this module.</b> This module covers the whole of CompTIA Network+ N10-009 domain 5.0, Network Troubleshooting. It is the heaviest domain on the exam at <b>24%</b>, and it is also the part of the job you will do every single day. By the end you will be able to run the seven-step troubleshooting methodology from memory, recognise cabling, interface, switching, routing, addressing, performance and wireless faults from their symptoms, pick the right software or hardware tool for each, read the most important device commands, and write a ticket that a senior engineer would be happy to sign off.</p>
<p><b>Prerequisites.</b> This is the last module of the Network+ track, so it leans on everything before it. You should be comfortable with the OSI model (np-concepts), IPv4 subnetting (np-addressing), VLANs and trunks (np-switching), static and default routes (np-routing), Wi-Fi channels (np-wireless), DHCP and DNS (np-services), logs and SNMP (np-monitoring), and ACLs and port security (np-security). We will not re-teach those topics. We will teach you how they <b>break</b> and how to prove it.</p>

<h3>Start with an analogy: the network engineer as a doctor</h3>
<p>A patient walks into a clinic and says "I feel bad". A good doctor does not guess and start prescribing. The doctor asks questions (when did it start, what changed, where does it hurt), takes measurements (temperature, blood pressure), forms a few possible diagnoses, orders a test to confirm the most likely one, plans treatment while thinking about side effects, treats, checks the patient again a week later, and writes everything in the patient file.</p>
<p>Troubleshooting a network is the same job. A user says "the network is slow" or "I cannot reach the server". That is a symptom, not a diagnosis. Your task is to turn a vague complaint into a proven root cause, fix it without breaking anything else, and leave a record so the next engineer is faster than you were.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Doctor steps mapped to troubleshooting steps">
<rect x="10" y="10" width="300" height="30" rx="6" fill="#fde68a"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">Doctor</text>
<rect x="330" y="10" width="300" height="30" rx="6" fill="#bae6fd"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">Network engineer</text>
<text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">Ask questions, measure</text><text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="12">1 Identify the problem</text>
<text x="160" y="86" text-anchor="middle" class="svg-muted" font-size="12">Possible diagnoses</text><text x="480" y="86" text-anchor="middle" class="svg-ink" font-size="12">2 Establish a theory</text>
<text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">Order a test</text><text x="480" y="110" text-anchor="middle" class="svg-ink" font-size="12">3 Test the theory</text>
<text x="160" y="134" text-anchor="middle" class="svg-muted" font-size="12">Treatment plan, side effects</text><text x="480" y="134" text-anchor="middle" class="svg-ink" font-size="12">4 Plan of action</text>
<text x="160" y="158" text-anchor="middle" class="svg-muted" font-size="12">Treat or refer</text><text x="480" y="158" text-anchor="middle" class="svg-ink" font-size="12">5 Implement or escalate</text>
<text x="160" y="182" text-anchor="middle" class="svg-muted" font-size="12">Follow-up check</text><text x="480" y="182" text-anchor="middle" class="svg-ink" font-size="12">6 Verify, prevent</text>
<text x="160" y="206" text-anchor="middle" class="svg-muted" font-size="12">Patient file</text><text x="480" y="206" text-anchor="middle" class="svg-ink" font-size="12">7 Document</text>
<line x1="310" y1="58" x2="330" y2="58" stroke="#64748b"/><line x1="310" y1="202" x2="330" y2="202" stroke="#64748b"/>
</svg><p class="cap">The seven CompTIA steps are simply good diagnosis written down in a fixed order.</p></div>

<h3>The five objectives of domain 5.0</h3>
<table class="cmp"><tr><th>Objective</th><th>What it asks you to do</th><th>Chapters</th></tr>
<tr><td><b>5.1</b></td><td>Explain the troubleshooting methodology (the seven steps, in order)</td><td>2, 3</td></tr>
<tr><td><b>5.2</b></td><td>Troubleshoot cabling and physical interface issues</td><td>4, 5</td></tr>
<tr><td><b>5.3</b></td><td>Troubleshoot network services: switching, routing, addressing</td><td>6, 7</td></tr>
<tr><td><b>5.4</b></td><td>Troubleshoot performance issues, wired and wireless</td><td>8, 9</td></tr>
<tr><td><b>5.5</b></td><td>Use the right tools and protocols</td><td>10, 11</td></tr>
</table>
<p>Chapter 12 then walks through the three hands-on tickets in the labs step by step, and chapter 13 is your exam checklist.</p>

<h3>The OSI model is your map</h3>
<p>When you do not know where a fault is, the OSI model tells you where to look. Every fault lives at a layer, and every layer has its own symptoms and tools. If the link light is off, there is no point checking DNS. If ping by IP works but the name fails, there is no point replacing the cable.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Faults by OSI layer">
<rect x="10" y="10" width="620" height="36" rx="6" fill="#ddd6fe"/><text x="20" y="33" class="svg-ink" font-size="13">L7 to L4: DNS record, service down, ACL blocks a port, firewall</text>
<rect x="10" y="54" width="620" height="36" rx="6" fill="#bae6fd"/><text x="20" y="77" class="svg-ink" font-size="13">L3: wrong IP, mask or gateway, missing route, DHCP pool empty</text>
<rect x="10" y="98" width="620" height="36" rx="6" fill="#bbf7d0"/><text x="20" y="121" class="svg-ink" font-size="13">L2: wrong VLAN, STP loop, duplex mismatch, err-disabled port</text>
<rect x="10" y="142" width="620" height="36" rx="6" fill="#fed7aa"/><text x="20" y="165" class="svg-ink" font-size="13">L1: cable, optic, PoE budget, crosstalk, attenuation, RF interference</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Most real faults are at L1 to L3</text>
</svg><p class="cap">Place the symptom on a layer first, then choose the tool that tests that layer.</p></div>

<div class="eg"><p><b>Worked example: placing the three lab tickets on the map.</b></p>
<ul>
<li><b>INC-3302, sales cannot reach the file server 10.0.20.10.</b> PC1 pings its gateway 10.0.10.1 but not the server. That places the fault at layer 3, at R1 or beyond. It turns out to be two faults: a shut-down router interface and a wrong gateway on the server.</li>
<li><b>INC-3319, the intranet works by IP only.</b> The IP path is fine, so layers 1 to 3 are cleared at once. The fault is name resolution: a wrong DNS server on PC1 and a wrong host record on R1.</li>
<li><b>INC-3340, the slow link.</b> Pings mostly work, but the application freezes. Errors on the interface counters point to layer 1 and 2: a duplex mismatch between R1 and SW1.</li>
</ul></div>

<h3>Why a method beats talent</h3>
<p>Beginners often think great troubleshooters have a magic instinct. In reality they follow a method so often that it looks like instinct. A method gives you three things. It stops you <b>skipping evidence</b> (you do not change a config before you know what is wrong). It stops you <b>making things worse</b> (you plan for side effects before touching production). And it makes you <b>repeatable</b>: your ticket notes let anybody understand what happened at 03:00 when you are asleep.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Changing several things at once. If you reboot the switch, swap the cable and change the VLAN together, and the problem goes away, you have learnt nothing and cannot write a root cause. Change one thing, test, then decide the next move.</p></div>

<div class="exam"><p><b>Exam trap.</b> Many Network+ questions describe a situation and ask what the technician should do <b>NEXT</b> or <b>FIRST</b>. The answer is almost always the next step of the methodology, not the cleverest technical fix. If the scenario has not yet asked users what changed, "question users" beats "replace the switch".</p></div>

<div class="scn"><h4>The printer that was not the problem</h4><p>A help desk technician got a call: "the network is down on floor 2". He rebooted the floor switch, which dropped 48 users for three minutes. Nothing changed. A senior engineer then asked one question: "what exactly does not work?" The answer was a single shared printer. Its address had been taken by a laptop someone configured with a static IP. One <code>arp -a</code> on a PC showed the printer IP with a laptop MAC address. The fix was a DHCP reservation for the printer and a correct address on the laptop.</p><p><b>Lesson:</b> identify the real scope of the problem before you touch anything. "The network is down" is almost never true.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a network problem."</p><p>Do not answer with a list of commands. Name the CompTIA seven steps in order: identify the problem, establish a theory, test it, plan, implement or escalate, verify and add preventive measures, document. Then add one short real example and mention an approach such as bottom-up, top-down or divide and conquer. Interviewers want structure first, tools second.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 5.0 is 24% of N10-009, the largest domain, and the core of daily network work.</li>
<li>A user complaint is a symptom; your job is to prove a root cause before changing anything.</li>
<li>The seven steps are a doctor's diagnosis in a fixed order: identify, theorise, test, plan, implement, verify, document.</li>
<li>Use the OSI model as a map: place the symptom on a layer, then pick the tool for that layer.</li>
<li>Exam "what next" questions test the order of the method, not your favourite fix.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh module CompTIA Network+ N10-009 ka poora domain 5.0, Network Troubleshooting, cover karta hai. Yeh exam ka sabse bhaari domain hai, <b>24%</b>, aur yahi job ka woh hissa hai jo aap roz karoge. End tak aap seven-step troubleshooting methodology yaad se chala paoge, cabling, interface, switching, routing, addressing, performance aur wireless faults ko unke symptoms se pehchan paoge, har ek ke liye sahi software ya hardware tool chun paoge, sabse zaroori device commands padh paoge, aur aisa ticket likh paoge jis par senior engineer khushi se sign kare.</p>
<p><b>Prerequisites.</b> Yeh Network+ track ka aakhri module hai, isliye yeh pehle ki har cheez par tika hai. Aapko OSI model (np-concepts), IPv4 subnetting (np-addressing), VLANs aur trunks (np-switching), static aur default routes (np-routing), Wi-Fi channels (np-wireless), DHCP aur DNS (np-services), logs aur SNMP (np-monitoring), aur ACLs aur port security (np-security) mein comfortable hona chahiye. Hum yeh topics dobara nahi padhayenge. Hum sikhayenge ki yeh <b>tootte kaise hain</b> aur use saabit kaise karein.</p>

<h3>Ek analogy se shuru karo: network engineer ek doctor hai</h3>
<p>Ek patient clinic mein aata hai aur kehta hai "tabiyat theek nahi hai". Achha doctor andaaza laga kar dawai likhna shuru nahi karta. Doctor sawaal poochhta hai (kab shuru hua, kya badla, dard kahan hai), measurements leta hai (temperature, blood pressure), kuch possible diagnoses banata hai, sabse likely wale ko confirm karne ke liye test karwata hai, side effects soch kar treatment plan karta hai, ilaaj karta hai, ek hafte baad patient ko dobara check karta hai, aur sab kuch patient file mein likhta hai.</p>
<p>Network troubleshoot karna bhi yahi kaam hai. User kehta hai "network slow hai" ya "main server tak nahi pahunch pa raha". Yeh symptom hai, diagnosis nahi. Aapka kaam hai ek dhundhli shikayat ko saabit root cause mein badalna, bina kuch aur tode use fix karna, aur record chhodna taaki agla engineer aapse tez ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Doctor ke steps troubleshooting steps se mapped">
<rect x="10" y="10" width="300" height="30" rx="6" fill="#fde68a"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">Doctor</text>
<rect x="330" y="10" width="300" height="30" rx="6" fill="#bae6fd"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">Network engineer</text>
<text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">Sawaal, measurement</text><text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="12">1 Problem identify karo</text>
<text x="160" y="86" text-anchor="middle" class="svg-muted" font-size="12">Possible diagnoses</text><text x="480" y="86" text-anchor="middle" class="svg-ink" font-size="12">2 Theory banao</text>
<text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">Test karwao</text><text x="480" y="110" text-anchor="middle" class="svg-ink" font-size="12">3 Theory test karo</text>
<text x="160" y="134" text-anchor="middle" class="svg-muted" font-size="12">Treatment plan, side effects</text><text x="480" y="134" text-anchor="middle" class="svg-ink" font-size="12">4 Plan of action</text>
<text x="160" y="158" text-anchor="middle" class="svg-muted" font-size="12">Ilaaj ya refer</text><text x="480" y="158" text-anchor="middle" class="svg-ink" font-size="12">5 Implement ya escalate</text>
<text x="160" y="182" text-anchor="middle" class="svg-muted" font-size="12">Follow-up check</text><text x="480" y="182" text-anchor="middle" class="svg-ink" font-size="12">6 Verify, prevent</text>
<text x="160" y="206" text-anchor="middle" class="svg-muted" font-size="12">Patient file</text><text x="480" y="206" text-anchor="middle" class="svg-ink" font-size="12">7 Document</text>
<line x1="310" y1="58" x2="330" y2="58" stroke="#64748b"/><line x1="310" y1="202" x2="330" y2="202" stroke="#64748b"/>
</svg><p class="cap">CompTIA ke saat steps bas achha diagnosis hain jo ek fixed order mein likha gaya hai.</p></div>

<h3>Domain 5.0 ke paanch objectives</h3>
<table class="cmp"><tr><th>Objective</th><th>Kya karne ko kehta hai</th><th>Chapters</th></tr>
<tr><td><b>5.1</b></td><td>Troubleshooting methodology samjhao (saat steps, order mein)</td><td>2, 3</td></tr>
<tr><td><b>5.2</b></td><td>Cabling aur physical interface issues troubleshoot karo</td><td>4, 5</td></tr>
<tr><td><b>5.3</b></td><td>Network services troubleshoot karo: switching, routing, addressing</td><td>6, 7</td></tr>
<tr><td><b>5.4</b></td><td>Performance issues troubleshoot karo, wired aur wireless</td><td>8, 9</td></tr>
<tr><td><b>5.5</b></td><td>Sahi tools aur protocols use karo</td><td>10, 11</td></tr>
</table>
<p>Phir chapter 12 labs ke teen hands-on tickets ko step by step walk karta hai, aur chapter 13 aapki exam checklist hai.</p>

<h3>OSI model aapka naksha hai</h3>
<p>Jab aapko pata nahi ki fault kahan hai, OSI model batata hai kahan dekhna hai. Har fault kisi layer par rehta hai, aur har layer ke apne symptoms aur tools hote hain. Agar link light off hai, to DNS check karne ka koi fayda nahi. Agar IP se ping chalti hai lekin naam fail hota hai, to cable badalne ka koi fayda nahi.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OSI layer ke hisaab se faults">
<rect x="10" y="10" width="620" height="36" rx="6" fill="#ddd6fe"/><text x="20" y="33" class="svg-ink" font-size="13">L7 se L4: DNS record, service down, ACL port block, firewall</text>
<rect x="10" y="54" width="620" height="36" rx="6" fill="#bae6fd"/><text x="20" y="77" class="svg-ink" font-size="13">L3: galat IP, mask ya gateway, route missing, DHCP pool khaali</text>
<rect x="10" y="98" width="620" height="36" rx="6" fill="#bbf7d0"/><text x="20" y="121" class="svg-ink" font-size="13">L2: galat VLAN, STP loop, duplex mismatch, err-disabled port</text>
<rect x="10" y="142" width="620" height="36" rx="6" fill="#fed7aa"/><text x="20" y="165" class="svg-ink" font-size="13">L1: cable, optic, PoE budget, crosstalk, attenuation, RF interference</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Zyada tar real faults L1 se L3 par hote hain</text>
</svg><p class="cap">Pehle symptom ko ek layer par rakho, phir woh tool chuno jo us layer ko test karta hai.</p></div>

<div class="eg"><p><b>Worked example: teen lab tickets ko naksha par rakhna.</b></p>
<ul>
<li><b>INC-3302, sales file server 10.0.20.10 tak nahi pahunch pa raha.</b> PC1 apne gateway 10.0.10.1 ko ping karta hai lekin server ko nahi. Isse fault layer 3 par, R1 par ya uske aage aata hai. Nikalte hain do faults: ek shut kiya hua router interface aur server par galat gateway.</li>
<li><b>INC-3319, intranet sirf IP se chalta hai.</b> IP path theek hai, isliye layers 1 se 3 turant clear. Fault name resolution mein hai: PC1 par galat DNS server aur R1 par galat host record.</li>
<li><b>INC-3340, slow link.</b> Pings zyada tar chalti hain, lekin application atakti hai. Interface counters par errors layer 1 aur 2 ki taraf ishara karte hain: R1 aur SW1 ke beech duplex mismatch.</li>
</ul></div>

<h3>Method talent se kyun jeet-ta hai</h3>
<p>Beginners aksar sochte hain ki great troubleshooters ke paas koi jaadui instinct hota hai. Asal mein woh method itni baar follow karte hain ki woh instinct jaisa dikhta hai. Method aapko teen cheezein deta hai. Yeh aapko <b>evidence skip karne</b> se rokta hai (aap config tab tak nahi badalte jab tak pata na ho ki kya galat hai). Yeh aapko <b>cheezein aur bigaadne</b> se rokta hai (production chhoone se pehle aap side effects plan karte ho). Aur yeh aapko <b>repeatable</b> banata hai: aapke ticket notes se koi bhi samajh sakta hai ki raat 03:00 baje kya hua jab aap so rahe the.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Ek saath kai cheezein badalna. Agar aap switch reboot karte ho, cable badalte ho aur VLAN change karte ho sab ek saath, aur problem chali jaati hai, to aapne kuch nahi seekha aur root cause likh nahi sakte. Ek cheez badlo, test karo, phir agla kadam decide karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network+ ke kai sawaal ek situation batate hain aur poochhte hain ki technician ko <b>NEXT</b> ya <b>FIRST</b> kya karna chahiye. Jawab lagbhag hamesha methodology ka agla step hota hai, sabse smart technical fix nahi. Agar scenario mein abhi tak users se nahi poochha gaya ki kya badla, to "question users" "switch replace karo" ko hara deta hai.</p></div>

<div class="scn"><h4>Printer jo problem tha hi nahi</h4><p>Help desk technician ko call aaya: "floor 2 par network down hai". Usne floor switch reboot kar diya, jisse 48 users teen minute ke liye gir gaye. Kuch nahi badla. Phir ek senior engineer ne ek sawaal poochha: "exactly kya kaam nahi kar raha?" Jawab tha ek shared printer. Uska address ek laptop ne le liya tha jise kisi ne static IP ke saath configure kiya tha. PC par ek <code>arp -a</code> ne printer IP ke saath laptop ka MAC address dikhaya. Fix tha printer ke liye DHCP reservation aur laptop par sahi address.</p><p><b>Seekh:</b> kuch bhi chhoone se pehle problem ka asli scope identify karo. "Network down hai" lagbhag kabhi sach nahi hota.</p></div>

<div class="iv"><p class="q">"Mujhe batao aap network problem kaise troubleshoot karte ho."</p><p>Commands ki list se jawab mat do. CompTIA ke saat steps order mein bolo: problem identify karo, theory banao, test karo, plan karo, implement ya escalate karo, verify karo aur preventive measures lagao, document karo. Phir ek chhota real example do aur bottom-up, top-down ya divide and conquer jaisa koi approach mention karo. Interviewers ko pehle structure chahiye, tools baad mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 5.0 N10-009 ka 24% hai, sabse bada domain, aur daily network kaam ka core.</li>
<li>User ki shikayat ek symptom hai; aapka kaam kuch bhi badalne se pehle root cause saabit karna hai.</li>
<li>Saat steps doctor ka diagnosis hain fixed order mein: identify, theory, test, plan, implement, verify, document.</li>
<li>OSI model ko naksha ki tarah use karo: symptom ko layer par rakho, phir us layer ka tool chuno.</li>
<li>Exam ke "what next" sawaal method ka order test karte hain, aapka favourite fix nahi.</li>
</ul></div>
`}};export{e as default};