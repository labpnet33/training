var e={id:`overview`,h:{en:`Welcome to Ansible: what you will learn and the big picture`,hi:`Ansible mein swagat: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> This is your first step into network automation with Ansible, and you do not need any earlier experience. By the end you will have built a working control node, described three real devices in an inventory, talked to them with ad-hoc commands, written a playbook, dry-run it, applied it, and proved that running it again changes nothing. You will also learn the short list of errors every beginner meets and how to read them.</p>
<ul>
<li>What Ansible is, what "agentless" means, and why network engineers use it.</li>
<li>The control node, <code>ansible-core</code>, collections and fully qualified module names.</li>
<li>An inventory with groups and the variables that tell Ansible how to log in.</li>
<li><code>ansible.cfg</code> and the SSH host key question.</li>
<li>Ad-hoc commands: <code>ping</code>, <code>ios_command</code>, <code>ios_facts</code>, <code>ios_config</code>.</li>
<li>YAML and your first playbook, line by line, with <code>--check</code>, <code>--diff</code> and idempotency.</li>
</ul>
<p><b>Prerequisites.</b> You should be able to type basic Linux commands (<code>cd</code>, <code>ls</code>, <code>cat</code>) and know what an SSH login and an <code>ntp server</code> line on a router are. You do not need Python, YAML or any Ansible knowledge. Everything is explained from zero.</p>

<h3>Analogy: a tireless assistant with a checklist</h3>
<p>Imagine you must add the same NTP server to fifty routers tonight. By hand you would open fifty SSH sessions, type the same line fifty times and hope you never mistype. Now imagine a tireless assistant who reads your checklist, logs in to each router exactly as you would, types the commands, and reports "done" or "already there" for every device. That assistant is <b>Ansible</b>. You write the checklist (a <b>playbook</b>) and the list of devices (an <b>inventory</b>); Ansible does the typing.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control node reaching three devices over SSH">
<rect x="20" y="75" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="14">AUTO01</text><text x="105" y="125" text-anchor="middle" class="svg-muted" font-size="12">control node (Linux)</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.60</text>
<rect x="430" y="15" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="525" y="38" text-anchor="middle" class="svg-ink" font-size="13">R1 PUN-CORE-R1</text><text x="525" y="56" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="430" y="88" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="525" y="111" text-anchor="middle" class="svg-ink" font-size="13">R2 BLR-EDGE-R2</text><text x="525" y="129" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.2</text>
<rect x="430" y="161" width="190" height="55" rx="10" fill="#bae6fd"/><text x="525" y="184" text-anchor="middle" class="svg-ink" font-size="13">SW1 PUN-ACC-SW1</text><text x="525" y="202" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.10</text>
<line x1="190" y1="105" x2="430" y2="43" stroke="#64748b" stroke-width="2"/><line x1="190" y1="115" x2="430" y2="115" stroke="#64748b" stroke-width="2"/><line x1="190" y1="125" x2="430" y2="188" stroke="#64748b" stroke-width="2"/>
<text x="310" y="108" text-anchor="middle" class="svg-accent" font-size="12">SSH (port 22), nothing installed on devices</text>
</svg><p class="cap">Ansible runs on one Linux box and logs in to every device over SSH, the same way you do.</p></div>

<h3>The words you will meet</h3>
<dl class="terms">
<dt>Control node</dt><dd>The Linux machine where Ansible is installed and where you run commands. In our lab it is AUTO01.</dd>
<dt>Managed node</dt><dd>Any device Ansible manages: here two routers and a switch.</dd>
<dt>Agentless</dt><dd>Nothing is installed on the managed node. Ansible only needs the SSH login that you already use.</dd>
<dt>Inventory</dt><dd>A file that lists the devices and how to reach them.</dd>
<dt>Module</dt><dd>A ready-made worker for one job, for example <code>cisco.ios.ios_config</code> sends configuration lines.</dd>
<dt>Task, play, playbook</dt><dd>A task calls one module. A play says which hosts run a list of tasks. A playbook is a file holding one or more plays.</dd>
<dt>Idempotent</dt><dd>Running the same playbook twice gives the same end state, and the second run changes nothing.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> The MyPnetLab lab has R1 in Pune (10.99.0.1), R2 in Bengaluru (10.99.0.2) and the access switch SW1 (10.99.0.10). Adding <code>ntp server 10.99.0.60</code> by hand means three logins. With Ansible it is one command: <code>ansible-playbook ntp.yml</code>. With three devices the saving is small; with three hundred it is the difference between a night and a minute.</p></div>

<h3>Why network engineers like Ansible</h3>
<ul>
<li><b>No agent, no daemon:</b> routers and switches cannot run agents anyway. Ansible uses SSH and the normal CLI.</li>
<li><b>Readable:</b> a playbook is plain YAML text that a colleague can review like a change ticket.</li>
<li><b>Safe by design:</b> you can dry-run, you can limit a run to one device, and good modules only send what is missing.</li>
<li><b>One tool, many vendors:</b> the same ideas work for Cisco IOS, Junos, NX-OS and Linux servers.</li>
</ul>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking Ansible must be installed on the routers, or that it "pushes a program" to them. It does not. If you can SSH to a device from the control node, Ansible can manage it. Another trap: running a playbook against all devices on day one. You will learn to limit and dry-run first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interviewers ask "is Ansible agent-based?" The answer is no: it is agentless and push-based over SSH (or an API). The control node must be Linux or macOS; Windows is not supported as a control node.</p></div>

<div class="scn"><h4>The 2 AM NTP change</h4><p>A bank branch network of forty routers had a retired NTP server. The engineer on call logged in to each router by hand. By router 28 he mistyped an IP address, and logs on that router were stamped with the wrong time for a week. The team later wrote a playbook with one NTP variable. The next time the server changed, one edit and one run updated all forty devices and the recap showed which ones were already correct.</p><p><b>Lesson:</b> automation is not about speed alone; it removes typing mistakes and gives you a record of what changed.</p></div>

<div class="iv"><p class="q">"What is Ansible and why is it agentless?"</p><p>Ansible is an open-source automation tool. You describe the desired state in YAML playbooks and an inventory; the control node connects over SSH (or an API), runs modules, and reports ok, changed or failed per device. It is agentless because network devices cannot host an agent, so it reuses the management access you already have. Mention idempotency and the inventory/playbook split to show you understand the model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ansible runs on a Linux control node and manages devices over SSH with nothing installed on them.</li>
<li>The inventory says which devices; the playbook says what to do.</li>
<li>A module does one job; a task calls a module; a play targets hosts; a playbook holds plays.</li>
<li>Idempotent means a second run changes nothing.</li>
<li>Our lab: AUTO01 manages R1, R2 and SW1 on 10.99.0.0/24.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh Ansible ke saath network automation mein aapka pehla kadam hai, aur kisi pehle experience ki zaroorat nahi. Module khatam hone tak aap ek working control node bana loge, teen asli devices ko inventory mein describe karoge, ad-hoc commands se unse baat karoge, ek playbook likhoge, uska dry-run karoge, use apply karoge, aur sabit karoge ki dobara chalane par kuch nahi badalta. Saath hi woh chhoti si list bhi seekhoge jo errors har beginner ko milte hain aur unhe kaise padhna hai.</p>
<ul>
<li>Ansible kya hai, "agentless" ka matlab kya hai, aur network engineers ise kyun use karte hain.</li>
<li>Control node, <code>ansible-core</code>, collections aur fully qualified module names.</li>
<li>Groups wali inventory aur woh variables jo Ansible ko login karna batate hain.</li>
<li><code>ansible.cfg</code> aur SSH host key ka sawaal.</li>
<li>Ad-hoc commands: <code>ping</code>, <code>ios_command</code>, <code>ios_facts</code>, <code>ios_config</code>.</li>
<li>YAML aur aapka pehla playbook, line by line, <code>--check</code>, <code>--diff</code> aur idempotency ke saath.</li>
</ul>
<p><b>Prerequisites.</b> Aapko basic Linux commands (<code>cd</code>, <code>ls</code>, <code>cat</code>) type karna aana chahiye aur pata hona chahiye ki SSH login aur router par <code>ntp server</code> line kya hoti hai. Python, YAML ya Ansible ka koi knowledge zaroori nahi. Sab kuch zero se samjhaya jaata hai.</p>

<h3>Analogy: checklist wala thakna-na-jaanne wala assistant</h3>
<p>Socho aaj raat aapko pachaas routers mein ek hi NTP server add karna hai. Haath se aap pachaas SSH sessions khologe, ek hi line pachaas baar type karoge aur dua karoge ki kabhi galti na ho. Ab socho ek aisa assistant jo thakta nahi: woh aapki checklist padhta hai, har router mein bilkul waise login karta hai jaise aap karte, commands type karta hai, aur har device ke liye "done" ya "already there" batata hai. Yeh assistant hi <b>Ansible</b> hai. Checklist (<b>playbook</b>) aur devices ki list (<b>inventory</b>) aap likhte ho; typing Ansible karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control node SSH se teen devices tak">
<rect x="20" y="75" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="14">AUTO01</text><text x="105" y="125" text-anchor="middle" class="svg-muted" font-size="12">control node (Linux)</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.60</text>
<rect x="430" y="15" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="525" y="38" text-anchor="middle" class="svg-ink" font-size="13">R1 PUN-CORE-R1</text><text x="525" y="56" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="430" y="88" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="525" y="111" text-anchor="middle" class="svg-ink" font-size="13">R2 BLR-EDGE-R2</text><text x="525" y="129" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.2</text>
<rect x="430" y="161" width="190" height="55" rx="10" fill="#bae6fd"/><text x="525" y="184" text-anchor="middle" class="svg-ink" font-size="13">SW1 PUN-ACC-SW1</text><text x="525" y="202" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.10</text>
<line x1="190" y1="105" x2="430" y2="43" stroke="#64748b" stroke-width="2"/><line x1="190" y1="115" x2="430" y2="115" stroke="#64748b" stroke-width="2"/><line x1="190" y1="125" x2="430" y2="188" stroke="#64748b" stroke-width="2"/>
<text x="310" y="108" text-anchor="middle" class="svg-accent" font-size="12">SSH (port 22), devices par kuch install nahi</text>
</svg><p class="cap">Ansible ek Linux box par chalta hai aur har device mein SSH se login karta hai, bilkul aapki tarah.</p></div>

<h3>Woh shabd jo aap milenge</h3>
<dl class="terms">
<dt>Control node</dt><dd>Woh Linux machine jahan Ansible installed hai aur jahan se aap commands chalate ho. Hamari lab mein yeh AUTO01 hai.</dd>
<dt>Managed node</dt><dd>Koi bhi device jise Ansible manage karta hai: yahan do routers aur ek switch.</dd>
<dt>Agentless</dt><dd>Managed node par kuch install nahi hota. Ansible ko sirf wahi SSH login chahiye jo aap pehle se use karte ho.</dd>
<dt>Inventory</dt><dd>Ek file jo devices aur unhe reach karne ka tareeka list karti hai.</dd>
<dt>Module</dt><dd>Ek kaam ke liye taiyaar worker, jaise <code>cisco.ios.ios_config</code> configuration lines bhejta hai.</dd>
<dt>Task, play, playbook</dt><dd>Task ek module bulata hai. Play batata hai kaunse hosts tasks ki list chalayenge. Playbook woh file hai jisme ek ya zyada plays hote hain.</dd>
<dt>Idempotent</dt><dd>Wahi playbook do baar chalane par end state wahi rehti hai, aur doosra run kuch nahi badalta.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> MyPnetLab lab mein R1 Pune mein (10.99.0.1), R2 Bengaluru mein (10.99.0.2) aur access switch SW1 (10.99.0.10) hai. <code>ntp server 10.99.0.60</code> haath se add karna matlab teen logins. Ansible se ek command: <code>ansible-playbook ntp.yml</code>. Teen devices mein bachat chhoti hai; teen sau mein yeh ek raat aur ek minute ka farq hai.</p></div>

<h3>Network engineers ko Ansible kyun pasand hai</h3>
<ul>
<li><b>Na agent, na daemon:</b> routers aur switches agent chala hi nahi sakte. Ansible SSH aur normal CLI use karta hai.</li>
<li><b>Padhne mein aasaan:</b> playbook plain YAML text hai jise colleague change ticket ki tarah review kar sakta hai.</li>
<li><b>Design se safe:</b> dry-run kar sakte ho, run ko ek device tak limit kar sakte ho, aur achhe modules sirf woh bhejte hain jo missing hai.</li>
<li><b>Ek tool, kai vendors:</b> wahi ideas Cisco IOS, Junos, NX-OS aur Linux servers par chalte hain.</li>
</ul>

<div class="warn"><p><b>Common beginner mistake.</b> Sochna ki Ansible routers par install hona chahiye, ya woh unpar koi program "push" karta hai. Aisa nahi hai. Control node se agar device mein SSH kar sakte ho to Ansible use manage kar sakta hai. Doosri galti: pehle din hi saare devices par playbook chalana. Aap limit aur dry-run pehle karna seekhoge.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interviewer poochte hain "kya Ansible agent-based hai?" Jawab: nahi, yeh agentless aur push-based hai, SSH (ya API) par. Control node Linux ya macOS hona chahiye; Windows control node ke roop mein supported nahi hai.</p></div>

<div class="scn"><h4>Raat 2 baje ka NTP change</h4><p>Ek bank ke branch network ke chalis routers mein ek purana NTP server retire hua. On-call engineer ne har router mein haath se login kiya. Router number 28 par usne IP address galat type kar diya, aur us router ke logs ek hafte tak galat time ke saath bane. Baad mein team ne ek NTP variable wala playbook likha. Agli baar server badla to ek edit aur ek run se chalis devices update ho gaye aur recap ne dikha ki kaun pehle se sahi tha.</p><p><b>Lesson:</b> automation sirf speed ke liye nahi hai; yeh typing galtiyan hataata hai aur aapko record deta hai ki kya badla.</p></div>

<div class="iv"><p class="q">"Ansible kya hai aur yeh agentless kyun hai?"</p><p>Ansible ek open-source automation tool hai. Aap desired state ko YAML playbooks aur inventory mein describe karte ho; control node SSH (ya API) se connect hota hai, modules chalata hai, aur har device ke liye ok, changed ya failed batata hai. Yeh agentless hai kyunki network devices agent host nahi kar sakte, isliye woh wahi management access use karta hai jo aapke paas pehle se hai. Idempotency aur inventory/playbook ke split ka zikr karo taaki dikhe ki aap model samajhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ansible Linux control node par chalta hai aur devices ko SSH se manage karta hai, devices par kuch install nahi hota.</li>
<li>Inventory batati hai kaunse devices; playbook batata hai kya karna hai.</li>
<li>Module ek kaam karta hai; task module bulata hai; play hosts ko target karta hai; playbook mein plays hote hain.</li>
<li>Idempotent matlab doosra run kuch nahi badalta.</li>
<li>Hamari lab: AUTO01 R1, R2 aur SW1 ko 10.99.0.0/24 par manage karta hai.</li>
</ul></div>
`}};export{e as default};