var e={id:`compare-choose-migrate`,h:{en:`PAN-OS SD-WAN versus Prisma SD-WAN: architecture, choice and migration thinking`,hi:`PAN-OS SD-WAN versus Prisma SD-WAN: architecture, choice aur migration soch`},body:{en:`
<p>The exam, and real customers, ask the same question in different words: "we have branches; which Palo Alto SD-WAN should we use?" There is no single answer, and the honest way to give one is to compare architecture, management, vocabulary and operations, then match them to the customer. This chapter does that, and then discusses migration. Where I could not verify a point in the documentation, I say so.</p>
<h3>Analogy: a family car or a bus fleet</h3>
<p>A family with one car can add a roof box (PAN-OS SD-WAN on the firewall you already own). A city transport company that runs hundreds of routes buys purpose-built buses and a control room (Prisma SD-WAN). Neither is wrong; the right choice depends on the size of the journey and on what you already have in the garage.</p>
<h3>Architecture and management</h3>
<table class="cmp"><tr><th>Dimension</th><th>PAN-OS SD-WAN</th><th>Prisma SD-WAN</th></tr>
<tr><td>Edge device</td><td>NGFW running PAN-OS, with the Advanced SD-WAN licence</td><td>ION device, physical or virtual</td></tr>
<tr><td>Management plane</td><td>Panorama with the SD-WAN plugin; newer releases also Strata Cloud Manager</td><td>Cloud-delivered management plane and portal</td></tr>
<tr><td>Link grouping</td><td>Link tag in an SD-WAN interface profile</td><td>Circuit category and circuit label</td></tr>
<tr><td>Path logic</td><td>Path quality profile plus traffic distribution profile inside an SD-WAN policy rule</td><td>Path policy plus performance policy, grouped in sets and stacks</td></tr>
<tr><td>Overlay build</td><td>VPN cluster with Auto VPN (hub-spoke or mesh)</td><td>Secure fabric built by the controller between sites</td></tr>
<tr><td>Quality protection</td><td>Error correction profile (FEC, packet duplication)</td><td>Performance policy actions, FEC and packet duplication</td></tr>
<tr><td>Security at the branch</td><td>The full NGFW on the same box</td><td>Zone-based firewall policy on the ION; cloud security through Prisma Access integration</td></tr>
<tr><td>Hub roles</td><td>Hub firewalls in the cluster, up to four hubs per cluster</td><td>Data center ION devices</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Decision tree">
<rect x="220" y="10" width="200" height="45" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Start: requirements and estate</text>
<rect x="20" y="95" width="260" height="50" rx="10" fill="#bae6fd"/><text x="150" y="118" text-anchor="middle" class="svg-ink" font-size="12">Estate already on PAN-OS firewalls,</text><text x="150" y="134" text-anchor="middle" class="svg-ink" font-size="12">modest SD-WAN needs</text>
<rect x="360" y="95" width="260" height="50" rx="10" fill="#bbf7d0"/><text x="490" y="118" text-anchor="middle" class="svg-ink" font-size="12">New or large branch estate, wants</text><text x="490" y="134" text-anchor="middle" class="svg-ink" font-size="12">a purpose-built SD-WAN operating model</text>
<rect x="20" y="185" width="260" height="50" rx="10" fill="#e0f2fe"/><text x="150" y="214" text-anchor="middle" class="svg-ink" font-size="13">Consider PAN-OS SD-WAN</text>
<rect x="360" y="185" width="260" height="50" rx="10" fill="#dcfce7"/><text x="490" y="214" text-anchor="middle" class="svg-ink" font-size="13">Consider Prisma SD-WAN</text>
<line x1="270" y1="55" x2="150" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="55" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="145" x2="150" y2="185" stroke="#64748b" stroke-width="2"/><line x1="490" y1="145" x2="490" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A starting heuristic, not a rule. Validate against scale, features, skills and cost.</p></div>
<h3>Questions that decide it</h3>
<ol>
<li><b>What is already installed?</b> PAN-OS firewalls under Panorama favour PAN-OS SD-WAN; reusing them avoids a second device at each branch.</li>
<li><b>What scale and operations model?</b> Hundreds or thousands of uniform branches with zero-touch operations and application-centric dashboards point to Prisma SD-WAN. Confirm current scale limits in the documentation for both products rather than relying on memory.</li>
<li><b>Which skills does the team have?</b> PAN-OS and Panorama administrators learn PAN-OS SD-WAN faster; teams with Prisma Access or Strata Cloud Manager experience adapt to Prisma SD-WAN faster.</li>
<li><b>Which security features are needed at the branch?</b> If full NGFW inspection at every branch is the requirement, a PAN-OS firewall already does it. With ION, the plan often combines the zone-based firewall at the branch with cloud security through Prisma Access.</li>
<li><b>Which licences and hardware lifecycle apply?</b> Compare current licence bundles and hardware lists; they change.</li>
</ol>
<h3>Migration thinking</h3>
<p>I did not find a documented automatic conversion from PAN-OS SD-WAN configuration to Prisma SD-WAN, or the reverse, so treat any move as a rebuild with a plan, not a conversion. A careful approach:</p>
<ul>
<li><b>Inventory.</b> List sites, links, applications and the intent behind each policy (not the objects).</li>
<li><b>Translate intent, not objects.</b> A link tag becomes a circuit label or category, a path quality profile becomes performance policy thresholds, a traffic distribution profile becomes path policy order, an error correction profile becomes a performance policy action. The mapping is conceptual and must be verified in the target product.</li>
<li><b>Pilot.</b> Move two or three sites, keep the others unchanged, and compare application experience.</li>
<li><b>Coexist.</b> Plan routing and security between old and new islands during the migration window.</li>
<li><b>Roll back.</b> Define the criteria that stop the migration, before it starts.</li>
</ul>
<div class="eg"><p><b>Worked example: Harbor Foods decides.</b> 40 stores run PAN-OS firewalls under Panorama, with two data centers. Requirements: two ISPs per store, voice and payments protected, SaaS direct. Requirements are modest and the estate is PAN-OS, so PAN-OS SD-WAN is the first candidate. A second business unit with 600 kiosks wants a fully cloud-managed fabric with no firewall skills on site; for those, Prisma SD-WAN is the first candidate. Two products can coexist in one company when the requirements differ, and the exam rewards that nuance.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Choosing by product preference instead of requirements. Treating the two products as interchangeable in a design review. Promising a one-click migration. Quoting scale or throughput numbers from memory without checking the current documentation.</p></div>
<div class="exam"><p><b>Exam trap.</b> The terms identify the product. Link tag, SD-WAN interface profile, traffic distribution profile, VPN cluster and Panorama plugin are PAN-OS SD-WAN. Circuit label, ION, policy stack, application fabric are Prisma SD-WAN. A distractor will swap one.</p></div>
<div class="scn"><h4>Customer with both needs</h4><p>A retailer has 40 stores on PAN-OS firewalls and 600 kiosks that will be new. The consultant proposes PAN-OS SD-WAN for the stores and Prisma SD-WAN for the kiosks, with a common security policy goal and separate management planes. The risk to state clearly is two operating models; the benefit is avoiding a forced replacement of working firewalls.</p></div>
<div class="iv"><p class="q">"When would you recommend PAN-OS SD-WAN over Prisma SD-WAN?"</p><p>When the branches already run PAN-OS firewalls under Panorama, the SD-WAN needs are moderate (two or more links, application steering, VPN to hubs, error correction), and the team has PAN-OS skills. I confirm the plugin and PAN-OS versions, the licence and the documented limits first. When the customer wants a large, uniform, cloud-managed fabric, I evaluate Prisma SD-WAN.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose by requirements, installed base, skills and operations model.</li>
<li>Keep the vocabularies separate: tags and profiles versus labels and stacks.</li>
<li>No documented conversion found; plan migrations as a rebuild from intent, with pilots.</li>
<li>Check scale, licence and feature limits in the current documentation.</li>
</ul></div>
`,hi:`
<p>Exam, aur asli customers, wahi sawal alag shabdon mein poochte hain: "humare paas branches hain; kaunsa Palo Alto SD-WAN use karein?" Koi ek jawab nahi, aur imaandaar tareeka architecture, management, vocabulary aur operations ki tulna karke use customer se milana hai. Yeh chapter wahi karta hai, phir migration par baat karta hai. Jahan documentation mein koi baat verify nahi kar paya wahan bata deta hoon.</p>
<h3>Analogy: family car ya bus fleet</h3>
<p>Ek car wala parivar roof box laga sakta hai (jo firewall pehle se hai uspar PAN-OS SD-WAN). Sainkdon routes chalane wali city transport company purpose-built buses aur control room khareedti hai (Prisma SD-WAN). Dono galat nahi; sahi choice safar ke size aur garage mein pehle se kya hai us par depend karti hai.</p>
<h3>Architecture aur management</h3>
<table class="cmp"><tr><th>Dimension</th><th>PAN-OS SD-WAN</th><th>Prisma SD-WAN</th></tr>
<tr><td>Edge device</td><td>Advanced SD-WAN licence ke saath PAN-OS chalane wala NGFW</td><td>ION device, physical ya virtual</td></tr>
<tr><td>Management plane</td><td>SD-WAN plugin ke saath Panorama; naye releases mein Strata Cloud Manager bhi</td><td>Cloud-delivered management plane aur portal</td></tr>
<tr><td>Link grouping</td><td>SD-WAN interface profile mein link tag</td><td>Circuit category aur circuit label</td></tr>
<tr><td>Path logic</td><td>SD-WAN policy rule ke andar path quality profile plus traffic distribution profile</td><td>Sets aur stacks mein grouped path policy plus performance policy</td></tr>
<tr><td>Overlay build</td><td>Auto VPN ke saath VPN cluster (hub-spoke ya mesh)</td><td>Controller dwara sites ke beech banaya secure fabric</td></tr>
<tr><td>Quality protection</td><td>Error correction profile (FEC, packet duplication)</td><td>Performance policy actions, FEC aur packet duplication</td></tr>
<tr><td>Branch par security</td><td>Wahi box par poora NGFW</td><td>ION par zone-based firewall policy; Prisma Access integration se cloud security</td></tr>
<tr><td>Hub roles</td><td>Cluster mein hub firewalls, ek cluster mein chaar hubs tak</td><td>Data center ION devices</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Decision tree">
<rect x="220" y="10" width="200" height="45" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Start: requirements and estate</text>
<rect x="20" y="95" width="260" height="50" rx="10" fill="#bae6fd"/><text x="150" y="118" text-anchor="middle" class="svg-ink" font-size="12">Estate already on PAN-OS firewalls,</text><text x="150" y="134" text-anchor="middle" class="svg-ink" font-size="12">modest SD-WAN needs</text>
<rect x="360" y="95" width="260" height="50" rx="10" fill="#bbf7d0"/><text x="490" y="118" text-anchor="middle" class="svg-ink" font-size="12">New or large branch estate, wants</text><text x="490" y="134" text-anchor="middle" class="svg-ink" font-size="12">a purpose-built SD-WAN operating model</text>
<rect x="20" y="185" width="260" height="50" rx="10" fill="#e0f2fe"/><text x="150" y="214" text-anchor="middle" class="svg-ink" font-size="13">Consider PAN-OS SD-WAN</text>
<rect x="360" y="185" width="260" height="50" rx="10" fill="#dcfce7"/><text x="490" y="214" text-anchor="middle" class="svg-ink" font-size="13">Consider Prisma SD-WAN</text>
<line x1="270" y1="55" x2="150" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="55" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="145" x2="150" y2="185" stroke="#64748b" stroke-width="2"/><line x1="490" y1="145" x2="490" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Shuruaati heuristic, rule nahi. Scale, features, skills aur cost se validate karo.</p></div>
<h3>Jo sawal decide karte hain</h3>
<ol>
<li><b>Pehle se kya installed hai?</b> Panorama ke neeche PAN-OS firewalls PAN-OS SD-WAN ke paksh mein hain; unhe reuse karne se har branch par doosra device nahi lagta.</li>
<li><b>Kitna scale aur operations model?</b> Sainkdon ya hazaron uniform branches, zero-touch operations aur application-centric dashboards Prisma SD-WAN ki taraf ishara karte hain. Memory par nahi, dono products ke liye documentation mein current scale limits confirm karo.</li>
<li><b>Team ke paas kaunsi skills hain?</b> PAN-OS aur Panorama administrators PAN-OS SD-WAN jaldi seekhte hain; Prisma Access ya Strata Cloud Manager experience wali teams Prisma SD-WAN mein jaldi dhalti hain.</li>
<li><b>Branch par kaunse security features chahiye?</b> Agar har branch par poora NGFW inspection requirement hai to PAN-OS firewall pehle se karta hai. ION ke saath plan aksar branch par zone-based firewall ko Prisma Access se cloud security ke saath milata hai.</li>
<li><b>Kaunse licences aur hardware lifecycle lagu hain?</b> Current licence bundles aur hardware lists compare karo; woh badalte hain.</li>
</ol>
<h3>Migration soch</h3>
<p>Mujhe PAN-OS SD-WAN configuration se Prisma SD-WAN tak, ya ulta, koi documented automatic conversion nahi mila, isliye har move ko conversion nahi, plan ke saath rebuild maano. Ek saavdhan approach:</p>
<ul>
<li><b>Inventory.</b> Sites, links, applications aur har policy ke peeche ka intent (objects nahi) list karo.</li>
<li><b>Objects nahi, intent translate karo.</b> Link tag circuit label ya category banta hai, path quality profile performance policy thresholds, traffic distribution profile path policy order, error correction profile performance policy action. Mapping conceptual hai aur target product mein verify karni hogi.</li>
<li><b>Pilot.</b> Do ya teen sites move karo, baaki jaise hain rakho, aur application experience compare karo.</li>
<li><b>Coexist.</b> Migration window mein purane aur naye islands ke beech routing aur security plan karo.</li>
<li><b>Roll back.</b> Migration shuru hone se pehle wo criteria tay karo jo use rokte hain.</li>
</ul>
<div class="eg"><p><b>Worked example: Harbor Foods decide karta hai.</b> 40 stores Panorama ke neeche PAN-OS firewalls chalate hain, do data centers ke saath. Requirements: har store par do ISPs, voice aur payments protected, SaaS direct. Requirements modest hain aur estate PAN-OS hai, isliye PAN-OS SD-WAN pehla candidate hai. 600 kiosks wali doosri business unit fully cloud-managed fabric chahti hai bina site par firewall skills ke; unke liye Prisma SD-WAN pehla candidate hai. Requirements alag hon to ek company mein do products saath reh sakte hain, aur exam is nuance ko inaam deta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Requirements ke bajay product pasand se chunna. Design review mein dono products ko interchangeable maanna. One-click migration ka vaada karna. Current documentation check kiye bina memory se scale ya throughput numbers quote karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Terms product pehchan dete hain. Link tag, SD-WAN interface profile, traffic distribution profile, VPN cluster aur Panorama plugin PAN-OS SD-WAN hain. Circuit label, ION, policy stack, application fabric Prisma SD-WAN hain. Distractor ek ko swap kar dega.</p></div>
<div class="scn"><h4>Dono zarooraton wala customer</h4><p>Ek retailer ke 40 stores PAN-OS firewalls par hain aur 600 kiosks naye honge. Consultant stores ke liye PAN-OS SD-WAN aur kiosks ke liye Prisma SD-WAN propose karta hai, common security policy goal aur alag management planes ke saath. Jo risk saaf batana hai woh do operating models hain; fayda chalte firewalls ke zabardasti replacement se bachna hai.</p></div>
<div class="iv"><p class="q">"Prisma SD-WAN ke bajay PAN-OS SD-WAN kab recommend karoge?"</p><p>Jab branches Panorama ke neeche pehle se PAN-OS firewalls chalate hon, SD-WAN zarooratein moderate hon (do ya zyada links, application steering, hubs tak VPN, error correction), aur team ke paas PAN-OS skills hon. Main pehle plugin aur PAN-OS versions, licence aur documented limits confirm karta hoon. Jab customer bada, uniform, cloud-managed fabric chahe to Prisma SD-WAN evaluate karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requirements, installed base, skills aur operations model se chuno.</li>
<li>Vocabularies alag rakho: tags aur profiles versus labels aur stacks.</li>
<li>Koi documented conversion nahi mila; migration ko intent se rebuild maano, pilots ke saath.</li>
<li>Scale, licence aur feature limits current documentation mein check karo.</li>
</ul></div>
`}};export{e as default};