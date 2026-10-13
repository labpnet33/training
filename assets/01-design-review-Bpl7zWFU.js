var e={id:`design-review`,h:{en:`Design review: one toolkit, the right tool for each job`,hi:`Design review: ek toolkit, har kaam ke liye sahi tool`},body:{en:`
<p><b>What you will learn.</b> This is the capstone of the Advanced Python track. Eighteen modules taught you single tools: NetBox, Nornir, NAPALM, Jinja2, schema checks, Batfish, Vault, firewalls, AWS and more. This module joins them into one <b>toolkit</b> that a colleague can run when you are asleep. First comes a design review (which tool does which job, and why), then you build the Zero-touch branch toolkit in the first lab, and in the second lab you take over a toolkit that someone else left behind, with four problems hidden in it. After this chapter you can draw the data flow of a multivendor change tool, apply a tool-for-the-job rule of thumb, and name the six builds this module covers.</p>
<p><b>Prerequisites.</b> The track modules, above all <code>adv-netbox</code>, <code>adv-nornir</code>, <code>adv-napalm</code>, <code>adv-verify</code> and <code>adv-vault</code>, and the Program 1 capstone <code>py-capstone</code>, the single-vendor toolkit that this one grows from. Nothing new is taught here: every line of code in this module already worked in one of those labs.</p>

<h3>An analogy: a restaurant kitchen, not a shopping list</h3>
<p>Eighteen modules are like eighteen kitchen appliances. A shopping list of appliances does not make a restaurant. A kitchen has <b>stations</b> and a <b>ticket</b> that moves between them: the order is read (NetBox says what must exist), prepared (templates turn data into text), checked at the pass (the gate), cooked (the change), tasted (verify) and written up (the report). Each station has one owner and one tool. If two stations do the same job, one of them is wasted, and when a dish goes wrong nobody knows which station spoiled it.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Data flow of the Zero-touch branch toolkit">
<rect x="6" y="14" width="86" height="54" rx="9" fill="#bae6fd"/><text x="49" y="38" text-anchor="middle" class="svg-ink" font-size="12">NetBox</text><text x="49" y="55" text-anchor="middle" class="svg-muted" font-size="10">source of truth</text>
<rect x="104" y="14" width="86" height="54" rx="9" fill="#ddd6fe"/><text x="147" y="38" text-anchor="middle" class="svg-ink" font-size="12">intent</text><text x="147" y="55" text-anchor="middle" class="svg-muted" font-size="10">JSON + schema</text>
<rect x="202" y="14" width="86" height="54" rx="9" fill="#ddd6fe"/><text x="245" y="38" text-anchor="middle" class="svg-ink" font-size="12">templates</text><text x="245" y="55" text-anchor="middle" class="svg-muted" font-size="10">one per vendor</text>
<rect x="300" y="14" width="86" height="54" rx="9" fill="#fde68a"/><text x="343" y="38" text-anchor="middle" class="svg-ink" font-size="12">gate</text><text x="343" y="55" text-anchor="middle" class="svg-muted" font-size="10">may we go?</text>
<rect x="398" y="14" width="86" height="54" rx="9" fill="#fed7aa"/><text x="441" y="38" text-anchor="middle" class="svg-ink" font-size="12">plan / apply</text><text x="441" y="55" text-anchor="middle" class="svg-muted" font-size="10">diff, commit</text>
<rect x="496" y="14" width="86" height="54" rx="9" fill="#bbf7d0"/><text x="539" y="38" text-anchor="middle" class="svg-ink" font-size="12">verify</text><text x="539" y="55" text-anchor="middle" class="svg-muted" font-size="10">read back</text>
<line x1="92" y1="41" x2="104" y2="41" stroke="#64748b" stroke-width="2"/><line x1="190" y1="41" x2="202" y2="41" stroke="#64748b" stroke-width="2"/><line x1="288" y1="41" x2="300" y2="41" stroke="#64748b" stroke-width="2"/><line x1="386" y1="41" x2="398" y2="41" stroke="#64748b" stroke-width="2"/><line x1="484" y1="41" x2="496" y2="41" stroke="#64748b" stroke-width="2"/>
<text x="49" y="100" text-anchor="middle" class="svg-muted" font-size="10">pynetbox</text><text x="147" y="100" text-anchor="middle" class="svg-muted" font-size="10">jsonschema</text><text x="245" y="100" text-anchor="middle" class="svg-muted" font-size="10">Jinja2</text><text x="343" y="100" text-anchor="middle" class="svg-muted" font-size="10">pybatfish</text><text x="441" y="100" text-anchor="middle" class="svg-muted" font-size="10">NAPALM</text><text x="539" y="100" text-anchor="middle" class="svg-muted" font-size="10">NAPALM getters</text>
<rect x="6" y="122" width="576" height="26" rx="8" fill="#e2e8f0"/><text x="294" y="140" text-anchor="middle" class="svg-ink" font-size="12">Nornir: which devices, in parallel, one result per host</text>
<rect x="6" y="156" width="576" height="26" rx="8" fill="#e2e8f0"/><text x="294" y="174" text-anchor="middle" class="svg-ink" font-size="12">settings, logging, tests, cron: the frame around the chain</text>
</svg></div>

<h3>The six builds</h3>
<p>The module describes six projects. Only one is a full lab, because a lab must fit in an hour; the others are still real designs you can build in your own time.</p>
<table class="cmp">
<tr><th>Build</th><th>What it does</th><th>Where</th></tr>
<tr><td>A Zero-touch branch</td><td>NetBox intent to rendered configs, Nornir push to IOS XE and Junos, NAPALM compare and commit, schema and Batfish gate</td><td>Lab 1</td></tr>
<tr><td>B Compliance and drift</td><td>Nightly read-back of every device against NetBox, a report, tickets for drift</td><td>Chapter 9</td></tr>
<tr><td>C Firewall change pipeline</td><td>One YAML request, schema-checked, pushed to FortiGate and PAN-OS, read back</td><td>Chapter 8</td></tr>
<tr><td>D Self-service API</td><td>FastAPI front door that takes a request and queues the toolkit</td><td>Chapter 9</td></tr>
<tr><td>E Data-centre fabric</td><td>EOS leaf and spine from intent, model-driven read-back</td><td>Chapter 9</td></tr>
<tr><td>F AWS connectivity</td><td>VPC and route intent checked before boto3 touches the cloud</td><td>Chapter 9</td></tr>
</table>

<h3>The tool-for-the-job rule of thumb</h3>
<p>A design review has one main question per tool: <i>what job does it do that no other tool in this design does?</i> If you cannot answer in one sentence, remove the tool. This is the table the review uses.</p>
<table class="cmp">
<tr><th>Job</th><th>Tool in this toolkit</th><th>Why not another</th></tr>
<tr><td>What should exist</td><td>NetBox with pynetbox</td><td>A spreadsheet has no API and no history</td></tr>
<tr><td>Which devices, in parallel</td><td>Nornir with the NetBox inventory</td><td>A for loop has no groups, no failed-host list</td></tr>
<tr><td>Text from data</td><td>Jinja2, one template per platform</td><td>String formatting in Python hides the config shape</td></tr>
<tr><td>Is the data well formed</td><td>jsonschema with FormatChecker</td><td>Hand-written if statements are never complete</td></tr>
<tr><td>Is the text plausible</td><td>pybatfish</td><td>The device itself is a poor place to find typos</td></tr>
<tr><td>Diff, commit, roll back, read back</td><td>NAPALM</td><td>One API for IOS XE and Junos instead of two code paths</td></tr>
<tr><td>Safe logic that needs no router</td><td>pytest</td><td>A lab is slow; a unit test takes a tenth of a second</td></tr>
</table>
<p>Three rules follow. <b>First</b>, use the highest-level tool that covers the need, and drop one level down (Netmiko, PyEZ, a REST call) only for the feature the upper tool lacks. <b>Second</b>, one tool per job: never two libraries that both load configuration. <b>Third</b>, one source of truth: if NetBox and a YAML file both say what an interface looks like, one of them is wrong and you will find out at night.</p>

<div class="warn"><p><b>The Swiss-army trap.</b> The toolkit you build uses nine libraries and deliberately leaves out Netmiko, Scrapli, PyEZ, ncclient, gNMI and Ansible, although you know them all. A good review removes tools. If every module of the course appears in your design, you are showing off, not designing.</p></div>

<div class="scn"><h4>Seven ways to log in</h4><p>A team's branch tool used Netmiko for IOS, PyEZ for Junos and pyeapi for EOS, each with its own retry loop and its own place for the password. When the login policy changed, three files needed edits and one was missed: the EOS switches kept an old account for a month. A review that asked "what job does each library do?" would have found that NAPALM already gives one connection, one diff and one rollback for all three, and that only a feature missing from NAPALM deserves a second library.</p><p><b>Lesson:</b> the number of ways to reach a device is the number of places a policy change can be forgotten.</p></div>

<div class="iv"><p class="q">"You must automate a new branch design. How do you choose the libraries?"</p><p>I write the chain first: source of truth, intent, rendering, check, change, read-back. For every step I name the one job and pick the highest-level tool that does it, usually from tools the team already runs. I drop to a lower level only for a missing feature, and I say why in the design note. Then I remove any tool that I cannot justify in one sentence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A toolkit is a chain of stations with one owner and one tool each.</li>
<li>The chain is: NetBox, intent, templates, gate, plan and apply, verify, with Nornir and the settings frame around it.</li>
<li>Pick the highest-level tool that covers the need; use a lower one only for a missing feature.</li>
<li>One tool per job, one source of truth.</li>
<li>A design review removes tools. Build A is the lab; build C is the next chapters' design.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Yeh Advanced Python track ka capstone hai. Atharah modules ne aapko alag alag tools sikhaye: NetBox, Nornir, NAPALM, Jinja2, schema checks, Batfish, Vault, firewalls, AWS aur bhi. Yeh module unhe ek <b>toolkit</b> mein jodta hai jo aapka colleague tab bhi chala sake jab aap so rahe ho. Pehle design review (kaunsa tool kaunsa kaam karta hai aur kyon), phir pehle lab mein Zero-touch branch toolkit banate ho, aur doosre lab mein aisi toolkit sambhalte ho jo koi aur chhod gaya hai aur jisme chaar problems chhupi hain. Is chapter ke baad aap multivendor change tool ka data flow draw kar sakte ho, tool-for-the-job rule of thumb laga sakte ho, aur is module ke chhe builds ke naam bata sakte ho.</p>
<p><b>Prerequisites.</b> Track ke modules, khaas kar <code>adv-netbox</code>, <code>adv-nornir</code>, <code>adv-napalm</code>, <code>adv-verify</code> aur <code>adv-vault</code>, aur Program 1 ka capstone <code>py-capstone</code>, jo single-vendor toolkit hai aur jisse yeh toolkit aage badhti hai. Yahan kuch naya nahi sikhaya jaata: is module ki har code line un labs mein pehle kaam kar chuki hai.</p>

<h3>Ek analogy: restaurant kitchen, shopping list nahi</h3>
<p>Atharah modules atharah kitchen appliances jaise hain. Appliances ki shopping list se restaurant nahi banta. Kitchen mein <b>stations</b> hote hain aur ek <b>ticket</b> jo unke beech ghoomta hai: order padha jata hai (NetBox batata hai kya hona chahiye), taiyari hoti hai (templates data ko text banate hain), pass par check hota hai (gate), pakta hai (change), chakha jata hai (verify) aur likha jata hai (report). Har station ka ek owner aur ek tool hota hai. Do stations ek hi kaam karein to ek bekaar hai, aur dish bigde to koi nahi jaanta kaunse station ne bigaadi.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Zero-touch branch toolkit ka data flow">
<rect x="6" y="14" width="86" height="54" rx="9" fill="#bae6fd"/><text x="49" y="38" text-anchor="middle" class="svg-ink" font-size="12">NetBox</text><text x="49" y="55" text-anchor="middle" class="svg-muted" font-size="10">source of truth</text>
<rect x="104" y="14" width="86" height="54" rx="9" fill="#ddd6fe"/><text x="147" y="38" text-anchor="middle" class="svg-ink" font-size="12">intent</text><text x="147" y="55" text-anchor="middle" class="svg-muted" font-size="10">JSON + schema</text>
<rect x="202" y="14" width="86" height="54" rx="9" fill="#ddd6fe"/><text x="245" y="38" text-anchor="middle" class="svg-ink" font-size="12">templates</text><text x="245" y="55" text-anchor="middle" class="svg-muted" font-size="10">har vendor ka ek</text>
<rect x="300" y="14" width="86" height="54" rx="9" fill="#fde68a"/><text x="343" y="38" text-anchor="middle" class="svg-ink" font-size="12">gate</text><text x="343" y="55" text-anchor="middle" class="svg-muted" font-size="10">jaayein?</text>
<rect x="398" y="14" width="86" height="54" rx="9" fill="#fed7aa"/><text x="441" y="38" text-anchor="middle" class="svg-ink" font-size="12">plan / apply</text><text x="441" y="55" text-anchor="middle" class="svg-muted" font-size="10">diff, commit</text>
<rect x="496" y="14" width="86" height="54" rx="9" fill="#bbf7d0"/><text x="539" y="38" text-anchor="middle" class="svg-ink" font-size="12">verify</text><text x="539" y="55" text-anchor="middle" class="svg-muted" font-size="10">wapas padho</text>
<line x1="92" y1="41" x2="104" y2="41" stroke="#64748b" stroke-width="2"/><line x1="190" y1="41" x2="202" y2="41" stroke="#64748b" stroke-width="2"/><line x1="288" y1="41" x2="300" y2="41" stroke="#64748b" stroke-width="2"/><line x1="386" y1="41" x2="398" y2="41" stroke="#64748b" stroke-width="2"/><line x1="484" y1="41" x2="496" y2="41" stroke="#64748b" stroke-width="2"/>
<text x="49" y="100" text-anchor="middle" class="svg-muted" font-size="10">pynetbox</text><text x="147" y="100" text-anchor="middle" class="svg-muted" font-size="10">jsonschema</text><text x="245" y="100" text-anchor="middle" class="svg-muted" font-size="10">Jinja2</text><text x="343" y="100" text-anchor="middle" class="svg-muted" font-size="10">pybatfish</text><text x="441" y="100" text-anchor="middle" class="svg-muted" font-size="10">NAPALM</text><text x="539" y="100" text-anchor="middle" class="svg-muted" font-size="10">NAPALM getters</text>
<rect x="6" y="122" width="576" height="26" rx="8" fill="#e2e8f0"/><text x="294" y="140" text-anchor="middle" class="svg-ink" font-size="12">Nornir: kaunse devices, parallel, har host ka ek result</text>
<rect x="6" y="156" width="576" height="26" rx="8" fill="#e2e8f0"/><text x="294" y="174" text-anchor="middle" class="svg-ink" font-size="12">settings, logging, tests, cron: chain ke aas paas ka frame</text>
</svg></div>

<h3>Chhe builds</h3>
<p>Module chhe projects batata hai. Sirf ek poora lab hai, kyunki lab ek ghante mein fit hona chahiye; baaki bhi asli designs hain jo aap apne time mein bana sakte ho.</p>
<table class="cmp">
<tr><th>Build</th><th>Kya karta hai</th><th>Kahan</th></tr>
<tr><td>A Zero-touch branch</td><td>NetBox intent se rendered configs, Nornir se IOS XE aur Junos par push, NAPALM compare aur commit, schema aur Batfish gate</td><td>Lab 1</td></tr>
<tr><td>B Compliance aur drift</td><td>Har raat har device ko NetBox se compare karke wapas padhna, report, drift ke tickets</td><td>Chapter 9</td></tr>
<tr><td>C Firewall change pipeline</td><td>Ek YAML request, schema-checked, FortiGate aur PAN-OS par push, wapas padhi</td><td>Chapter 8</td></tr>
<tr><td>D Self-service API</td><td>FastAPI front door jo request leta hai aur toolkit ko queue karta hai</td><td>Chapter 9</td></tr>
<tr><td>E Data-centre fabric</td><td>Intent se EOS leaf aur spine, model-driven read-back</td><td>Chapter 9</td></tr>
<tr><td>F AWS connectivity</td><td>VPC aur route intent, boto3 cloud ko chhune se pehle check</td><td>Chapter 9</td></tr>
</table>

<h3>Tool-for-the-job rule of thumb</h3>
<p>Design review mein har tool ke liye ek mukhya sawal hota hai: <i>yeh kaunsa kaam karta hai jo is design ka koi aur tool nahi karta?</i> Ek vaakya mein jawab na de sako to tool hata do. Review isi table se chalta hai.</p>
<table class="cmp">
<tr><th>Kaam</th><th>Is toolkit ka tool</th><th>Doosra kyon nahi</th></tr>
<tr><td>Kya hona chahiye</td><td>NetBox, pynetbox ke saath</td><td>Spreadsheet ka na API hai na history</td></tr>
<tr><td>Kaunse devices, parallel</td><td>Nornir, NetBox inventory ke saath</td><td>For loop mein na groups, na failed-host list</td></tr>
<tr><td>Data se text</td><td>Jinja2, har platform ka ek template</td><td>Python string formatting config ka shape chhupa deta hai</td></tr>
<tr><td>Data theek shape ka hai</td><td>jsonschema, FormatChecker ke saath</td><td>Haath se likhe if kabhi poore nahi hote</td></tr>
<tr><td>Text samajhdaar hai</td><td>pybatfish</td><td>Typo dhoondhne ke liye device buri jagah hai</td></tr>
<tr><td>Diff, commit, rollback, read-back</td><td>NAPALM</td><td>IOS XE aur Junos ke liye do code paths ki jagah ek API</td></tr>
<tr><td>Wohi logic jise router nahi chahiye</td><td>pytest</td><td>Lab dheema hai; unit test ek second ka dasvaan hissa leta hai</td></tr>
</table>
<p>Teen rules nikalte hain. <b>Pehla</b>, sabse ooncha tool jo zaroorat poori kare, aur ek level neeche (Netmiko, PyEZ, REST call) sirf us feature ke liye jo upar wale tool mein nahi. <b>Doosra</b>, ek kaam ke liye ek tool: do libraries jo dono configuration load karein, kabhi nahi. <b>Teesra</b>, ek source of truth: NetBox aur ek YAML file dono batayein ki interface kaisa hai, to ek galat hai aur raat ko pata chalega.</p>

<div class="warn"><p><b>Swiss-army trap.</b> Jo toolkit aap banate ho woh nau libraries use karti hai aur Netmiko, Scrapli, PyEZ, ncclient, gNMI aur Ansible ko jaan boojhkar chhodti hai, jabki aap sabko jaante ho. Achha review tools hatata hai. Course ka har module aapke design mein dikhe to aap dikhawa kar rahe ho, design nahi.</p></div>

<div class="scn"><h4>Login ke saat tareeke</h4><p>Ek team ke branch tool mein IOS ke liye Netmiko, Junos ke liye PyEZ aur EOS ke liye pyeapi tha, har ek ka apna retry loop aur password ki apni jagah. Login policy badli to teen files edit karni thin aur ek chhoot gayi: EOS switches ek mahine tak purana account rakhte rahe. Jo review poochta "har library kaunsa kaam karti hai?" use pata chalta ki NAPALM teeno ke liye ek connection, ek diff aur ek rollback deta hai, aur sirf NAPALM mein na milne wale feature ko doosri library milti.</p><p><b>Lesson:</b> device tak pahunchne ke jitne tareeke, policy badalte waqt bhool jaane ki utni jagahen.</p></div>

<div class="iv"><p class="q">"Naye branch design ko automate karna hai. Libraries kaise chunoge?"</p><p>Pehle chain likhta hoon: source of truth, intent, rendering, check, change, read-back. Har step ka ek kaam naam karta hoon aur sabse ooncha tool chunta hoon jo woh kaam kare, aksar wahi jo team pehle se chalati hai. Neeche tabhi jaata hoon jab koi feature na ho, aur design note mein wajah likhta hoon. Phir jis tool ko ek vaakya mein justify na kar sakun use hata deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Toolkit stations ki chain hai, har station ka ek owner aur ek tool.</li>
<li>Chain: NetBox, intent, templates, gate, plan aur apply, verify; Nornir aur settings uske aas paas ka frame.</li>
<li>Sabse ooncha tool chuno jo zaroorat poori kare; neeche wala sirf missing feature ke liye.</li>
<li>Ek kaam ke liye ek tool, ek source of truth.</li>
<li>Design review tools hatata hai. Build A lab hai; build C agle chapters ka design hai.</li>
</ul></div>
`}};export{e as default};