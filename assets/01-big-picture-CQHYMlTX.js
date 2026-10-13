var e={id:`big-picture`,h:{en:`Why automate: the big picture`,hi:`Automate kyun karein: badi picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain how automation changes the daily work of a network team, name the three planes of a network device, compare traditional box-by-box networking with controller-based and software-defined networking, and describe Cisco Catalyst Center, SD-Access and SD-WAN at a concept level. You will read and send REST API calls, map CRUD actions to HTTP verbs, decode status codes, read and write JSON by hand, spot broken JSON and YAML, compare Ansible, Puppet, Chef and Terraform, and run and repair a real Ansible playbook.</p>
<p><b>Prerequisites.</b> You should be comfortable on the Cisco IOS CLI (modes, <code>show</code> commands, saving the configuration), know IPv4 addressing, VLANs and interface basics, and know that SSH is how we log in to devices securely. No programming experience is needed. Every line of JSON and YAML in this module is explained from zero.</p>

<h3>Start with an analogy: fifty restaurant kitchens and one new menu</h3>
<p>Imagine a restaurant chain with fifty kitchens. Head office changes the price of one dish. In the old way, a manager phones every kitchen, one by one, and a cook writes the new price on each menu board by hand. By the fortieth call the manager is tired, one kitchen writes 250 instead of 205, and two kitchens were closed when he phoned. Nobody knows exactly which boards are right.</p>
<p>In the new way, head office changes the price once in a central system, and every kitchen's digital menu board pulls the change automatically. Head office can also ask the system "show me every board that does not match" and get an answer in seconds. That is exactly the jump from <b>manual CLI</b> to <b>network automation</b>: the change is described once, pushed everywhere the same way, and checked by software instead of by tired eyes.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Four ways to manage a network">
<rect x="10" y="20" width="145" height="120" rx="8" fill="#e2e8f0"/>
<text x="82" y="50" text-anchor="middle" class="svg-ink" font-size="14">Box by box</text>
<text x="82" y="78" text-anchor="middle" class="svg-muted" font-size="12">SSH + CLI</text>
<text x="82" y="102" text-anchor="middle" class="svg-muted" font-size="12">one device</text>
<text x="82" y="120" text-anchor="middle" class="svg-muted" font-size="12">at a time</text>
<rect x="170" y="20" width="145" height="120" rx="8" fill="#bae6fd"/>
<text x="242" y="50" text-anchor="middle" class="svg-ink" font-size="14">Scripts + APIs</text>
<text x="242" y="78" text-anchor="middle" class="svg-muted" font-size="12">REST, JSON</text>
<text x="242" y="102" text-anchor="middle" class="svg-muted" font-size="12">data, not</text>
<text x="242" y="120" text-anchor="middle" class="svg-muted" font-size="12">screen text</text>
<rect x="330" y="20" width="145" height="120" rx="8" fill="#bbf7d0"/>
<text x="402" y="50" text-anchor="middle" class="svg-ink" font-size="14">Config tools</text>
<text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">Ansible</text>
<text x="402" y="102" text-anchor="middle" class="svg-muted" font-size="12">Terraform</text>
<text x="402" y="120" text-anchor="middle" class="svg-muted" font-size="12">desired state</text>
<rect x="490" y="20" width="140" height="120" rx="8" fill="#ddd6fe"/>
<text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="14">Controller</text>
<text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center</text>
<text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">intent, fabric,</text>
<text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">assurance</text>
<line x1="20" y1="175" x2="620" y2="175" stroke="#64748b" stroke-width="2"/>
<polygon points="620,169 632,175 620,181" fill="#64748b"/>
<text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="13">more scale, more consistency, less typing</text>
</svg><p class="cap">The four management styles you will meet in this module. Real networks mix all four.</p></div>

<h3>How automation changes network management</h3>
<p>The CCNA blueprint asks you to <b>explain how automation impacts network management</b>. Learn these effects as a list, because exam questions are built from them:</p>
<ul>
<li><b>Speed and scale.</b> A change that takes four minutes per device by hand takes the same few minutes for 500 devices when a tool pushes it in parallel.</li>
<li><b>Consistency, fewer human errors.</b> The same template produces the same configuration every time. No typos, no forgotten step on device 37.</li>
<li><b>Configuration drift is detected.</b> Drift means a device slowly moving away from the standard because of quick manual fixes. Tools compare the real state with the wanted state and report the difference.</li>
<li><b>Data instead of screen scraping.</b> APIs return structured data (JSON) that software can read reliably, so monitoring, reporting and troubleshooting become faster.</li>
<li><b>Audit and version control.</b> Configuration lives in text files stored in Git. You can see who changed what, when, and roll back.</li>
<li><b>Engineers change role.</b> Less typing of the same commands, more designing templates, reviewing changes and handling exceptions. Understanding the protocols matters <i>more</i>, not less.</li>
</ul>
<p>There is one honest downside: automation also spreads a mistake faster. A wrong line in a template reaches every device in seconds. That is why you will learn dry runs (<code>--check</code>), syntax checks, idempotency and reading results carefully.</p>

<div class="eg"><p><b>Worked example.</b> A company must add <code>ntp server 10.30.0.100</code> and a login banner to 200 access switches. By hand: log in, enter configuration mode, type two lines, verify, save, log out, about 4 minutes each, so 200 &times; 4 = 800 minutes, more than 13 hours, with a real chance of typos. With Ansible: one playbook of about 20 lines, a dry run, then a real run that finishes in a few minutes, and a second run that proves nothing is left to change. That is exactly what you will do in the <b>Fix the playbook</b> lab.</p></div>

<h3>The map of this module</h3>
<p>We go from the planes of a device, to controllers and fabrics, to REST and RESTCONF, to JSON and YAML, to Ansible and Terraform, and finish with a troubleshooting workflow and an exam checklist.</p>
<p>Two labs go with the text. <b>Lab 1</b> has you enable the HTTPS API on router R1, read interface data as JSON from the NMS workstation, fix two broken JSON files and use PATCH to rename and enable the WAN link GigabitEthernet0/1. <b>Lab 2</b> is a ticket: a playbook for switches SW1 and SW2 has a YAML error, wrong inventory credentials and a wrong module parameter; you fix it, push it and prove it is idempotent.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking automation means you no longer need to understand VLANs, routing or the CLI. Every playbook and API call is just a different way to express the same configuration. If you cannot say what the right configuration is, no tool can push it for you, and you will not recognise a wrong result.</p></div>

<div class="exam"><p><b>Exam trap.</b> Answers such as "automation removes the need for network engineers" or "automation guarantees a network without errors" are wrong. The correct benefits are speed, scale, consistency, fewer manual errors, easier compliance and better use of data. The Automation and Programmability domain is about 10% of the CCNA 200-301 exam. The AI and machine learning item of that domain is covered in the next module.</p></div>

<div class="scn"><h4>The banner that went to 300 branches</h4><p>A retail bank had 300 branch routers. Every quarter the security team asked for a new login banner, and two engineers spent two days pasting it by hand. An audit found 41 routers with the old banner, 6 with a typo and 3 with no banner at all. The team wrote a short Ansible playbook with the banner in one variable, stored it in Git, ran it with <code>--check</code> first, then for real. The next quarter the change took 20 minutes, and a second run reported <code>changed=0</code> on all 300 routers, which proved every router matched.</p><p><b>Lesson:</b> automation is not only faster; it gives you proof that every device is in the state you wanted.</p></div>

<div class="iv"><p class="q">"How does automation affect network management? Give me concrete benefits and one risk."</p><p>Strong answer: it makes changes faster and repeatable at scale, removes typing errors because the same template is used everywhere, detects configuration drift, uses structured data from APIs for monitoring and troubleshooting, and keeps a history in version control. Mention the risk: a bad change spreads just as fast, so you use dry runs, peer review, small batches and verification. End with the point that engineers move from typing commands to designing and reviewing the automation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manual CLI works for a few devices; automation is needed for scale, speed and consistency.</li>
<li>Automation benefits: fewer human errors, drift detection, structured data, audit trail, faster changes.</li>
<li>Automation also spreads mistakes faster, so dry runs and verification are part of the job.</li>
<li>Management styles: box by box, scripts and APIs, configuration tools, controllers.</li>
<li>Lab 1 is REST and JSON on R1; Lab 2 is the Ansible "Fix the playbook" ticket on SW1 and SW2.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki automation network team ke rozana ke kaam ko kaise badalta hai, network device ke teen planes ke naam le paoge, traditional box-by-box networking ko controller-based aur software-defined networking se compare kar paoge, aur Cisco Catalyst Center, SD-Access aur SD-WAN ko concept level par describe kar paoge. Aap REST API calls padhoge aur bhejoge, CRUD actions ko HTTP verbs se map karoge, status codes decode karoge, JSON haath se padhoge aur likhoge, tooti hui JSON aur YAML pakdoge, Ansible, Puppet, Chef aur Terraform compare karoge, aur ek asli Ansible playbook chalaoge aur theek karoge.</p>
<p><b>Prerequisites.</b> Aapko Cisco IOS CLI par comfortable hona chahiye (modes, <code>show</code> commands, configuration save karna), IPv4 addressing, VLANs aur interface basics pata hone chahiye, aur yeh pata hona chahiye ki SSH se hum devices mein securely login karte hain. Programming ka koi experience nahi chahiye. Is module mein JSON aur YAML ki har line zero se samjhayi gayi hai.</p>

<h3>Ek analogy se shuru karo: pachaas restaurant kitchens aur ek naya menu</h3>
<p>Socho ek restaurant chain hai jiske pachaas kitchens hain. Head office ek dish ka price badalta hai. Purane tareeke mein ek manager har kitchen ko ek-ek karke phone karta hai, aur ek cook har menu board par naya price haath se likhta hai. Chaaliswe call tak manager thak jaata hai, ek kitchen 205 ki jagah 250 likh deta hai, aur do kitchens phone ke waqt band the. Kisi ko exactly pata nahi ki kaunse boards sahi hain.</p>
<p>Naye tareeke mein head office central system mein price ek baar badalta hai, aur har kitchen ka digital menu board change apne aap kheench leta hai. Head office system se yeh bhi pooch sakta hai "mujhe har woh board dikhao jo match nahi karta" aur seconds mein jawab milta hai. <b>Manual CLI</b> se <b>network automation</b> ki chhalaang bilkul yahi hai: change ek baar describe hota hai, har jagah same tareeke se push hota hai, aur thaki hui aankhon ki jagah software se check hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Network manage karne ke chaar tareeke">
<rect x="10" y="20" width="145" height="120" rx="8" fill="#e2e8f0"/>
<text x="82" y="50" text-anchor="middle" class="svg-ink" font-size="14">Box by box</text>
<text x="82" y="78" text-anchor="middle" class="svg-muted" font-size="12">SSH + CLI</text>
<text x="82" y="102" text-anchor="middle" class="svg-muted" font-size="12">ek time par</text>
<text x="82" y="120" text-anchor="middle" class="svg-muted" font-size="12">ek device</text>
<rect x="170" y="20" width="145" height="120" rx="8" fill="#bae6fd"/>
<text x="242" y="50" text-anchor="middle" class="svg-ink" font-size="14">Scripts + APIs</text>
<text x="242" y="78" text-anchor="middle" class="svg-muted" font-size="12">REST, JSON</text>
<text x="242" y="102" text-anchor="middle" class="svg-muted" font-size="12">data, screen</text>
<text x="242" y="120" text-anchor="middle" class="svg-muted" font-size="12">text nahi</text>
<rect x="330" y="20" width="145" height="120" rx="8" fill="#bbf7d0"/>
<text x="402" y="50" text-anchor="middle" class="svg-ink" font-size="14">Config tools</text>
<text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">Ansible</text>
<text x="402" y="102" text-anchor="middle" class="svg-muted" font-size="12">Terraform</text>
<text x="402" y="120" text-anchor="middle" class="svg-muted" font-size="12">desired state</text>
<rect x="490" y="20" width="140" height="120" rx="8" fill="#ddd6fe"/>
<text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="14">Controller</text>
<text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center</text>
<text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">intent, fabric,</text>
<text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">assurance</text>
<line x1="20" y1="175" x2="620" y2="175" stroke="#64748b" stroke-width="2"/>
<polygon points="620,169 632,175 620,181" fill="#64748b"/>
<text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="13">zyada scale, zyada consistency, kam typing</text>
</svg><p class="cap">Management ke chaar styles jo aap is module mein dekhoge. Real networks chaaron ko mix karte hain.</p></div>

<h3>Automation network management ko kaise badalta hai</h3>
<p>CCNA blueprint kehta hai ki aap <b>explain karo ki automation network management par kya asar daalta hai</b>. In effects ko list ki tarah yaad karo, kyunki exam questions inhi se bante hain:</p>
<ul>
<li><b>Speed aur scale.</b> Jo change haath se har device par chaar minute leta hai, woh 500 devices par bhi utne hi kuch minute leta hai jab tool use parallel mein push karta hai.</li>
<li><b>Consistency, kam human errors.</b> Same template har baar same configuration banata hai. Na typos, na device 37 par koi step bhoolna.</li>
<li><b>Configuration drift pakda jaata hai.</b> Drift ka matlab hai jaldi wale manual fixes ki wajah se device ka dheere-dheere standard se door hona. Tools real state ko wanted state se compare karke farak report karte hain.</li>
<li><b>Screen scraping ki jagah data.</b> APIs structured data (JSON) lautati hain jise software reliably padh sakta hai, isliye monitoring, reporting aur troubleshooting fast ho jaate hain.</li>
<li><b>Audit aur version control.</b> Configuration Git mein rakhi text files mein rehti hai. Aap dekh sakte ho kisne kya kab badla, aur rollback kar sakte ho.</li>
<li><b>Engineers ka role badalta hai.</b> Same commands kam type karne padte hain, templates design karna, changes review karna aur exceptions handle karna zyada hota hai. Protocols samajhna <i>zyada</i> zaroori ho jaata hai, kam nahi.</li>
</ul>
<p>Ek imaandaar nuksaan bhi hai: automation galti ko bhi tezi se failata hai. Template ki ek galat line seconds mein har device tak pahunch jaati hai. Isiliye aap dry runs (<code>--check</code>), syntax checks, idempotency aur results dhyaan se padhna seekhoge.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ko 200 access switches par <code>ntp server 10.30.0.100</code> aur ek login banner add karna hai. Haath se: login, configuration mode, do lines type, verify, save, logout, har ek par lagbhag 4 minute, yaani 200 &times; 4 = 800 minute, 13 ghante se zyada, aur typos ka asli chance. Ansible ke saath: lagbhag 20 lines ka ek playbook, ek dry run, phir ek real run jo kuch minute mein khatam hota hai, aur ek doosra run jo saabit karta hai ki ab kuch badalna baaki nahi. Aap <b>Fix the playbook</b> lab mein bilkul yahi karoge.</p></div>

<h3>Is module ka map</h3>
<p>Hum device ke planes se controllers aur fabrics tak, phir REST aur RESTCONF, JSON aur YAML, Ansible aur Terraform tak jaate hain, aur ek troubleshooting workflow aur exam checklist ke saath khatam karte hain.</p>
<p>Text ke saath do labs hain. <b>Lab 1</b> mein aap router R1 par HTTPS API enable karte ho, NMS workstation se interface data JSON mein padhte ho, do tooti JSON files theek karte ho aur PATCH se WAN link GigabitEthernet0/1 ka naam badalte ho aur use enable karte ho. <b>Lab 2</b> ek ticket hai: switches SW1 aur SW2 ke playbook mein ek YAML error, galat inventory credentials aur ek galat module parameter hai; aap use theek karte ho, push karte ho aur saabit karte ho ki woh idempotent hai.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki automation ke baad VLANs, routing ya CLI samajhne ki zaroorat nahi. Har playbook aur API call same configuration ko express karne ka bas ek alag tareeka hai. Agar aap nahi bata sakte ki sahi configuration kya hai, to koi tool use aapke liye push nahi kar sakta, aur galat result ko aap pehchaan bhi nahi paoge.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Automation network engineers ki zaroorat khatam kar deta hai" ya "automation bina errors wale network ki guarantee deta hai" jaise answers galat hain. Sahi fayde hain speed, scale, consistency, kam manual errors, aasaan compliance aur data ka behtar use. Automation and Programmability domain CCNA 200-301 exam ka lagbhag 10% hai. Us domain ka AI aur machine learning wala item agle module mein cover hota hai.</p></div>

<div class="scn"><h4>Woh banner jo 300 branches tak gaya</h4><p>Ek retail bank ke 300 branch routers the. Har quarter security team naya login banner maangti thi, aur do engineers do din tak use haath se paste karte the. Audit mein 41 routers par purana banner mila, 6 par typo aur 3 par koi banner hi nahi. Team ne ek chhota Ansible playbook likha jismein banner ek variable mein tha, use Git mein rakha, pehle <code>--check</code> ke saath chalaya, phir asli mein. Agle quarter change mein 20 minute lage, aur doosre run ne saare 300 routers par <code>changed=0</code> report kiya, jisse saabit hua ki har router match karta hai.</p><p><b>Seekh:</b> automation sirf fast nahi hai; yeh aapko saboot deta hai ki har device usi state mein hai jo aap chahte the.</p></div>

<div class="iv"><p class="q">"Automation network management ko kaise affect karta hai? Concrete fayde aur ek risk batao."</p><p>Strong answer: yeh changes ko scale par fast aur repeatable banata hai, typing errors hata deta hai kyunki har jagah same template use hota hai, configuration drift pakadta hai, monitoring aur troubleshooting ke liye APIs ka structured data use karta hai, aur version control mein history rakhta hai. Risk bhi batao: kharab change bhi utni hi tezi se failta hai, isliye aap dry runs, peer review, chhote batches aur verification use karte ho. End mein yeh point do ki engineers commands type karne se automation design aur review karne ki taraf shift hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manual CLI kuch devices ke liye chalta hai; scale, speed aur consistency ke liye automation chahiye.</li>
<li>Automation ke fayde: kam human errors, drift detection, structured data, audit trail, fast changes.</li>
<li>Automation galtiyaan bhi tezi se failata hai, isliye dry runs aur verification kaam ka hissa hain.</li>
<li>Management styles: box by box, scripts aur APIs, configuration tools, controllers.</li>
<li>Lab 1 R1 par REST aur JSON hai; Lab 2 SW1 aur SW2 par Ansible "Fix the playbook" ticket hai.</li>
</ul></div>
`}};export{e as default};