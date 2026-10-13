var e={id:`big-picture`,h:{en:`The big picture: one script, every platform`,hi:`Badi tasveer: ek script, har platform`},body:{en:`
<p><b>What you will learn.</b> In Program 1 you used netmiko against Cisco routers with the lab name <code>nk_ios</code>. A real network is rarely all Cisco. This module teaches you to write <b>one</b> collector that logs in to an IOS XE router, a Junos router, an Arista EOS switch and an NX-OS switch (and, in the reference sections, ASA, FortiOS and PAN-OS firewalls) with the <b>real</b> netmiko names, and to run it safely every night.</p>

<h3>Analogy: a travel adapter and a good interpreter</h3>
<p>Imagine you travel to five countries with one laptop. The laptop is your script. The wall sockets are the vendors: each has a different shape, voltage and rule (some switch off the pager, some need a commit, some ask for a second password). netmiko is the travel adapter kit plus an interpreter: you tell it the <b>device_type</b> ("this wall is Junos") and it knows the shape of the plug, how to say "stop paging", how to enter config mode and how to leave it. Your job is to pick the right adapter, to know what each wall expects, and to notice when the lights go out.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Inventory driven collector talking to four vendors">
<rect x="10" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="75" y="46" text-anchor="middle" class="svg-ink" font-size="13">inventory.csv</text><text x="75" y="64" text-anchor="middle" class="svg-muted" font-size="11">name, host, device_type</text>
<rect x="10" y="120" width="130" height="60" rx="8" fill="#fde68a"/><text x="75" y="146" text-anchor="middle" class="svg-ink" font-size="13">.env</text><text x="75" y="164" text-anchor="middle" class="svg-muted" font-size="11">passwords, not in code</text>
<rect x="215" y="60" width="150" height="100" rx="10" fill="#bae6fd"/><text x="290" y="92" text-anchor="middle" class="svg-ink" font-size="14">collector on AUTO01</text><text x="290" y="112" text-anchor="middle" class="svg-muted" font-size="11">ConnectHandler(**dev)</text><text x="290" y="130" text-anchor="middle" class="svg-muted" font-size="11">threads, retries, logs</text>
<line x1="140" y1="50" x2="215" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="150" x2="215" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="10" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="35" text-anchor="middle" class="svg-ink" font-size="12">R1 IOS XE · cisco_ios</text>
<rect x="450" y="62" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="87" text-anchor="middle" class="svg-ink" font-size="12">J1 Junos · juniper_junos</text>
<rect x="450" y="114" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="139" text-anchor="middle" class="svg-ink" font-size="12">E1 EOS · arista_eos</text>
<rect x="450" y="166" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="191" text-anchor="middle" class="svg-ink" font-size="12">N1 NX-OS · cisco_nxos</text>
<line x1="365" y1="95" x2="450" y2="30" stroke="#64748b" stroke-width="2"/><line x1="365" y1="105" x2="450" y2="82" stroke="#64748b" stroke-width="2"/><line x1="365" y1="115" x2="450" y2="134" stroke="#64748b" stroke-width="2"/><line x1="365" y1="125" x2="450" y2="186" stroke="#64748b" stroke-width="2"/>
<text x="290" y="205" text-anchor="middle" class="svg-accent" font-size="12">one loop, four dialects</text>
</svg><p class="cap">The collector reads who to talk to from a file, takes passwords from the environment and speaks each vendor's dialect through its device_type.</p></div>

<h3>The five questions every vendor answers differently</h3>
<p>Almost every surprise in this module is one of five questions. Keep them in your head; each later chapter answers them for one more platform.</p>
<table class="cmp"><tr><th>Question</th><th>What can differ</th></tr>
<tr><td>1. How do I log in?</td><td>user and password, enable secret, a different password per device</td></tr>
<tr><td>2. How is paging switched off?</td><td><code>terminal length 0</code>, <code>set cli screen-length 0</code>, <code>terminal pager 0</code></td></tr>
<tr><td>3. Where is config mode?</td><td><code>configure terminal</code>, <code>configure</code>, <code>configure session NAME</code>, none at all (FortiOS)</td></tr>
<tr><td>4. How does config become live?</td><td>immediately (IOS, NX-OS), on <code>commit</code> (Junos, PAN-OS, EOS sessions)</td></tr>
<tr><td>5. How is it saved?</td><td><code>write memory</code>, <code>copy running-config startup-config</code>, or nothing to do (Junos)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> The same job, "show me the interfaces that have an IP address", is <code>show ip interface brief</code> on IOS XE, NX-OS and EOS, but <code>show interfaces terse</code> on Junos. The IOS answer comes back with the column <code>proto</code>, the EOS answer with <code>protocol</code>. Your collector must hide those differences so that the final table looks the same for all four. That is what you build in Lab 1.</p></div>

<h3>Prerequisites</h3>
<ul>
<li><b>auto-ssh</b> and <b>py-textfsm</b>: you already connected with netmiko (<code>nk_ios</code>) and parsed output with TextFSM. Here they come back only as short refreshers.</li>
<li><b>py-concurrency</b>: threads and <code>ThreadPoolExecutor</code>.</li>
<li><b>py-secrets</b> and <b>py-tools</b>: environment variables, <code>.env</code> files, logging, exit codes.</li>
<li>Linux shell basics, and the ability to read a Python traceback.</li>
</ul>

<h3>The lab network and the two labs</h3>
<table class="cmp"><tr><th>Device</th><th>Platform</th><th>IP</th><th>Login</th></tr>
<tr><td>AUTO01</td><td>Ubuntu server</td><td>10.99.0.60</td><td>netadmin / Deccan@123</td></tr>
<tr><td>R1</td><td>IOS XE (PUN-CORE-R1)</td><td>10.99.0.1</td><td>netops / NK@2026, enable NK@2026</td></tr>
<tr><td>J1</td><td>Junos</td><td>10.99.0.11</td><td>netops / NK@2026</td></tr>
<tr><td>E1</td><td>Arista EOS</td><td>10.99.0.21</td><td>netops / NK@2026, enable NK@2026</td></tr>
<tr><td>N1</td><td>NX-OS</td><td>10.99.0.31</td><td>netops / NKlab@123</td></tr></table>
<p><b>Lab 1, "One script, four vendors"</b>, builds an inventory-driven collector step by step: an inventory file, a probe, an interface table, config backups, threads with retries and an alert, and a diff against yesterday. <b>Lab 2, "Four collectors that work on Cisco and fail everywhere else"</b>, hands you four broken scripts to fix. Chapter 9 walks through it.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab speaks no real SSH: the "SSH server" is the simulated device. Waits run on a virtual clock, so a 30-second timeout does not cost you 30 real seconds. Your scripts use <code>from netmiko import ConnectHandler</code> exactly as on real gear; <code>import nkmiko</code> is the lab's own name for the same library. When the lab differs from a real device, a note like this one says so.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing that a script tested on one Cisco router is tested. Copying the Cisco <code>device_type</code> to every row of the inventory. Putting passwords in the code. Reading "no exception" as "it worked".</p></div>
<div class="exam"><p><b>Exam trap.</b> The lab names <code>nk_ios</code>, <code>nk_junos</code> and so on exist only in the lab. On real gear and in interviews you say <code>cisco_ios</code>, <code>juniper_junos</code>, <code>arista_eos</code>, <code>cisco_nxos</code>.</p></div>

<div class="scn"><h4>The nightly backup that silently skipped Junos</h4><p>A team ran a backup script written on Cisco routers. It looped over fifty devices, and every device that was not Cisco got the same <code>cisco_ios</code> type. The Cisco backups worked; the Juniper boxes timed out and were skipped by a bare <code>except</code>. Nobody noticed for a month, until a Junos router died and there was no config to restore.</p><p><b>Lesson:</b> the device type belongs in the inventory, per device, and every failure must be counted and reported.</p></div>

<div class="iv"><p class="q">"How would you automate backups across Cisco, Juniper and Arista with Python?"</p><p>I would keep an inventory file with host and netmiko <code>device_type</code> per device, take credentials from the environment, loop with <code>ConnectHandler</code>, choose the show command from a per-platform map, save one dated file per device, run devices in a thread pool with one connection per thread, retry only timeouts, write failures to a log and exit non-zero so monitoring notices.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One collector can serve many vendors if the vendor differences live in data (inventory, command maps), not in copy-pasted scripts.</li>
<li>Five questions separate the vendors: login, paging, config mode, commit, save.</li>
<li>Use the real netmiko names; <code>nk_*</code> names are lab aliases.</li>
<li>Count and report failures; an exit code of 0 only means "no exception".</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Program 1 mein aapne Cisco routers par netmiko lab ke naam <code>nk_ios</code> se use kiya tha. Asli network mein sab kuch Cisco shayad hi hota hai. Yeh module aapko <b>ek</b> collector likhna sikhata hai jo IOS XE router, Junos router, Arista EOS switch aur NX-OS switch mein (aur reference sections mein ASA, FortiOS aur PAN-OS firewalls mein) <b>asli</b> netmiko naamon ke saath login kare, aur ise har raat safely chalaye.</p>

<h3>Analogy: travel adapter aur ek achha interpreter</h3>
<p>Socho aap ek laptop leke paanch deshon ki yatra par ho. Laptop aapki script hai. Wall sockets vendors hain: har ek ka shape, voltage aur niyam alag (kuch pager band karte hain, kuch ko commit chahiye, kuch doosra password maangte hain). netmiko travel adapter kit aur interpreter dono hai: aap use <b>device_type</b> batate ho ("yeh deewar Junos hai") aur use pata hota hai plug ka shape, "paging band karo" kaise bolna hai, config mode mein kaise jaana aur kaise nikalna hai. Aapka kaam hai sahi adapter chunna, jaanna ki har deewar kya expect karti hai, aur dhyan dena jab batti gul ho jaye.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Inventory driven collector talking to four vendors">
<rect x="10" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="75" y="46" text-anchor="middle" class="svg-ink" font-size="13">inventory.csv</text><text x="75" y="64" text-anchor="middle" class="svg-muted" font-size="11">name, host, device_type</text>
<rect x="10" y="120" width="130" height="60" rx="8" fill="#fde68a"/><text x="75" y="146" text-anchor="middle" class="svg-ink" font-size="13">.env</text><text x="75" y="164" text-anchor="middle" class="svg-muted" font-size="11">passwords, code mein nahi</text>
<rect x="215" y="60" width="150" height="100" rx="10" fill="#bae6fd"/><text x="290" y="92" text-anchor="middle" class="svg-ink" font-size="14">AUTO01 par collector</text><text x="290" y="112" text-anchor="middle" class="svg-muted" font-size="11">ConnectHandler(**dev)</text><text x="290" y="130" text-anchor="middle" class="svg-muted" font-size="11">threads, retries, logs</text>
<line x1="140" y1="50" x2="215" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="150" x2="215" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="10" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="35" text-anchor="middle" class="svg-ink" font-size="12">R1 IOS XE · cisco_ios</text>
<rect x="450" y="62" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="87" text-anchor="middle" class="svg-ink" font-size="12">J1 Junos · juniper_junos</text>
<rect x="450" y="114" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="139" text-anchor="middle" class="svg-ink" font-size="12">E1 EOS · arista_eos</text>
<rect x="450" y="166" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="191" text-anchor="middle" class="svg-ink" font-size="12">N1 NX-OS · cisco_nxos</text>
<line x1="365" y1="95" x2="450" y2="30" stroke="#64748b" stroke-width="2"/><line x1="365" y1="105" x2="450" y2="82" stroke="#64748b" stroke-width="2"/><line x1="365" y1="115" x2="450" y2="134" stroke="#64748b" stroke-width="2"/><line x1="365" y1="125" x2="450" y2="186" stroke="#64748b" stroke-width="2"/>
<text x="290" y="205" text-anchor="middle" class="svg-accent" font-size="12">ek loop, chaar dialects</text>
</svg><p class="cap">Collector file se padhta hai kisse baat karni hai, passwords environment se leta hai aur har vendor ka dialect uske device_type se bolta hai.</p></div>

<h3>Paanch sawaal jinke jawab har vendor mein alag hain</h3>
<p>Is module ki lagbhag har surprise inhi paanch sawaalon mein se ek hai. Inhe yaad rakho; har agla chapter ek aur platform ke liye inka jawab deta hai.</p>
<table class="cmp"><tr><th>Sawaal</th><th>Kya alag ho sakta hai</th></tr>
<tr><td>1. Login kaise?</td><td>user aur password, enable secret, har device ka alag password</td></tr>
<tr><td>2. Paging kaise band hoti hai?</td><td><code>terminal length 0</code>, <code>set cli screen-length 0</code>, <code>terminal pager 0</code></td></tr>
<tr><td>3. Config mode kahan hai?</td><td><code>configure terminal</code>, <code>configure</code>, <code>configure session NAME</code>, ya bilkul nahi (FortiOS)</td></tr>
<tr><td>4. Config live kaise hota hai?</td><td>turant (IOS, NX-OS), <code>commit</code> par (Junos, PAN-OS, EOS sessions)</td></tr>
<tr><td>5. Save kaise hota hai?</td><td><code>write memory</code>, <code>copy running-config startup-config</code>, ya kuch karna nahi (Junos)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Wahi kaam, "mujhe woh interfaces dikhao jinke paas IP address hai", IOS XE, NX-OS aur EOS par <code>show ip interface brief</code> hai, par Junos par <code>show interfaces terse</code>. IOS ka jawab column <code>proto</code> ke saath aata hai, EOS ka <code>protocol</code> ke saath. Aapke collector ko yeh farq chhupana hai taaki final table chaaron ke liye ek jaisi dikhe. Yahi aap Lab 1 mein banate ho.</p></div>

<h3>Prerequisites</h3>
<ul>
<li><b>auto-ssh</b> aur <b>py-textfsm</b>: aap netmiko (<code>nk_ios</code>) se connect kar chuke ho aur TextFSM se output parse kar chuke ho. Yahan woh sirf chhote refresher ki tarah wapas aate hain.</li>
<li><b>py-concurrency</b>: threads aur <code>ThreadPoolExecutor</code>.</li>
<li><b>py-secrets</b> aur <b>py-tools</b>: environment variables, <code>.env</code> files, logging, exit codes.</li>
<li>Linux shell basics, aur Python traceback padhne ki kshamta.</li>
</ul>

<h3>Lab network aur do labs</h3>
<table class="cmp"><tr><th>Device</th><th>Platform</th><th>IP</th><th>Login</th></tr>
<tr><td>AUTO01</td><td>Ubuntu server</td><td>10.99.0.60</td><td>netadmin / Deccan@123</td></tr>
<tr><td>R1</td><td>IOS XE (PUN-CORE-R1)</td><td>10.99.0.1</td><td>netops / NK@2026, enable NK@2026</td></tr>
<tr><td>J1</td><td>Junos</td><td>10.99.0.11</td><td>netops / NK@2026</td></tr>
<tr><td>E1</td><td>Arista EOS</td><td>10.99.0.21</td><td>netops / NK@2026, enable NK@2026</td></tr>
<tr><td>N1</td><td>NX-OS</td><td>10.99.0.31</td><td>netops / NKlab@123</td></tr></table>
<p><b>Lab 1, "One script, four vendors"</b>, step by step ek inventory-driven collector banata hai: inventory file, probe, interface table, config backups, retries wale threads aur alert, aur kal ke saath diff. <b>Lab 2, "Four collectors that work on Cisco and fail everywhere else"</b>, aapko theek karne ke liye chaar toote scripts deta hai. Chapter 9 uska walkthrough hai.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> Lab mein asli SSH nahi chalta: "SSH server" simulated device hai. Waits virtual clock par chalte hain, isliye 30 second ka timeout aapke 30 asli second nahi khata. Aapki scripts <code>from netmiko import ConnectHandler</code> bilkul asli gear ki tarah use karti hain; <code>import nkmiko</code> usi library ka lab ka apna naam hai. Jahan lab asli device se alag hai, aisa note bata dega.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Maan lena ki ek Cisco router par test hui script tested hai. Inventory ki har row mein Cisco wala <code>device_type</code> copy kar dena. Passwords code mein rakhna. "Exception nahi aaya" ko "chal gaya" padhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lab ke naam <code>nk_ios</code>, <code>nk_junos</code> waghera sirf lab mein hain. Asli gear par aur interviews mein aap <code>cisco_ios</code>, <code>juniper_junos</code>, <code>arista_eos</code>, <code>cisco_nxos</code> bolte ho.</p></div>

<div class="scn"><h4>Nightly backup jo chupchaap Junos skip karta raha</h4><p>Ek team ne Cisco routers par likhi backup script chalayi. Woh pachaas devices par loop karti thi, aur har non-Cisco device ko wahi <code>cisco_ios</code> type mila. Cisco backups chale; Juniper boxes timeout hue aur bare <code>except</code> ne unhe skip kar diya. Ek mahine tak kisi ne dhyan nahi diya, jab tak ek Junos router mar nahi gaya aur restore karne ke liye config nahi thi.</p><p><b>Lesson:</b> device type inventory mein har device ke liye hota hai, aur har failure gini aur report ki jaani chahiye.</p></div>

<div class="iv"><p class="q">"Cisco, Juniper aur Arista par backups Python se kaise automate karoge?"</p><p>Main ek inventory file rakhunga jisme har device ka host aur netmiko <code>device_type</code> ho, credentials environment se lunga, <code>ConnectHandler</code> se loop chalaunga, show command per-platform map se chunuga, har device ki ek dated file save karunga, devices ko thread pool mein chalaunga (har thread mein ek connection), sirf timeouts retry karunga, failures log mein likhunga aur non-zero exit karunga taaki monitoring ko pata chale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek collector kai vendors ko tabhi serve karta hai jab vendor ke farq data mein ho (inventory, command maps), copy-paste scripts mein nahi.</li>
<li>Paanch sawaal vendors ko alag karte hain: login, paging, config mode, commit, save.</li>
<li>Asli netmiko naam use karo; <code>nk_*</code> naam lab ke aliases hain.</li>
<li>Failures gino aur report karo; exit code 0 ka matlab sirf "exception nahi aaya".</li>
</ul></div>
`}};export{e as default};