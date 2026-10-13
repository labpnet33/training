var e={id:`big-picture`,h:{en:`Why NAPALM: one Python API for many vendors`,hi:`NAPALM kyon: kai vendors ke liye ek Python API`},body:{en:`<h3>What you will learn</h3>
<p>By the end of this module you can open a Cisco IOS XE router, a Juniper Junos router and an Arista EOS switch with the same short loop of Python, read their state as identical dictionaries, push a configuration change with a diff you read before every commit, undo it, and prove with a YAML file that the network still matches its design. The module ends with a compliance report that says PASS or FAIL, and you will learn to read a FAIL.</p>
<ul>
<li>Choose a driver with <code>get_network_driver</code> and connect with the right arguments.</li>
<li>Use getters such as <code>get_facts</code>, <code>get_interfaces</code>, <code>get_ntp_servers</code> and <code>get_bgp_neighbors</code>, and know which driver lacks which getter.</li>
<li>Load a merge or replace candidate, read <code>compare_config()</code>, then <code>commit_config()</code> or <code>discard_config()</code>.</li>
<li>Use a confirmed commit and <code>rollback()</code> where a platform offers them, and know where it does not.</li>
<li>Run <code>compliance_report()</code> and fix a failing report on the right side: the file or the device.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> <code>adv-nkmiko</code> (sessions on four vendors), <code>adv-netconf</code> and <code>adv-pyez-config</code> (the candidate datastore, confirmed commit, Junos Config object), and Program 1 <code>py-safepush</code> (dry run, diff, verify, roll back). NAPALM is those ideas wrapped in one API. <code>adv-nornir</code> comes next in the track and runs the code of this module across a whole fleet.</p></div>

<h3>An analogy: the universal travel adapter</h3>
<p>Every country has a different wall socket, but your laptop charger is the same. A universal adapter sits between them. NAPALM is that adapter for network devices: your script plugs into one shape, and a <b>driver</b> for each vendor plugs into the wall. NAPALM stands for Network Automation and Programmability Abstraction Layer with Multivendor support.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="NAPALM layers">
<rect x="170" y="8" width="300" height="34" rx="8" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Your script: one loop</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="60" width="520" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">NAPALM base API</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="10">get_* getters · load_*_candidate · compare_config · commit_config · compliance_report</text>
<line x1="80" y1="102" x2="80" y2="122" stroke="#64748b" stroke-width="2"/><line x1="240" y1="102" x2="240" y2="122" stroke="#64748b" stroke-width="2"/><line x1="400" y1="102" x2="400" y2="122" stroke="#64748b" stroke-width="2"/><line x1="560" y1="102" x2="560" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="80" y="145" text-anchor="middle" class="svg-ink" font-size="13">ios</text><rect x="170" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="240" y="145" text-anchor="middle" class="svg-ink" font-size="13">junos</text><rect x="330" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="400" y="145" text-anchor="middle" class="svg-ink" font-size="13">eos</text><rect x="490" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="560" y="145" text-anchor="middle" class="svg-ink" font-size="13">nxos_ssh</text>
<line x1="80" y1="158" x2="80" y2="178" stroke="#64748b" stroke-width="2"/><line x1="240" y1="158" x2="240" y2="178" stroke="#64748b" stroke-width="2"/><line x1="400" y1="158" x2="400" y2="178" stroke="#64748b" stroke-width="2"/><line x1="560" y1="158" x2="560" y2="178" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="80" y="195" text-anchor="middle" class="svg-ink" font-size="13">SSH</text><text x="80" y="211" text-anchor="middle" class="svg-muted" font-size="10">netmiko</text><rect x="170" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="240" y="195" text-anchor="middle" class="svg-ink" font-size="13">NETCONF 830</text><text x="240" y="211" text-anchor="middle" class="svg-muted" font-size="10">PyEZ</text><rect x="330" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="400" y="195" text-anchor="middle" class="svg-ink" font-size="13">eAPI over HTTPS</text><text x="400" y="211" text-anchor="middle" class="svg-muted" font-size="10">pyeapi</text><rect x="490" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="560" y="195" text-anchor="middle" class="svg-ink" font-size="13">SSH</text><text x="560" y="211" text-anchor="middle" class="svg-muted" font-size="10">netmiko</text>
<line x1="80" y1="218" x2="80" y2="238" stroke="#64748b" stroke-width="2"/><line x1="240" y1="218" x2="240" y2="238" stroke="#64748b" stroke-width="2"/><line x1="400" y1="218" x2="400" y2="238" stroke="#64748b" stroke-width="2"/><line x1="560" y1="218" x2="560" y2="238" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="80" y="261" text-anchor="middle" class="svg-ink" font-size="13">R1 IOS XE</text><rect x="170" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="240" y="261" text-anchor="middle" class="svg-ink" font-size="13">J1 Junos</text><rect x="330" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="400" y="261" text-anchor="middle" class="svg-ink" font-size="13">E1 EOS</text><rect x="490" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="560" y="261" text-anchor="middle" class="svg-ink" font-size="13">N1 NX-OS</text>
</svg><p class="cap">One API on top, a driver per platform, and the transport you already know underneath.</p></div>

<h3>Two halves and a checker</h3>
<p>NAPALM does three jobs. <b>Read</b>: getters such as <code>get_facts()</code> return the same dictionary keys whatever the vendor. <b>Write</b>: you load a candidate configuration, ask for the difference, and commit or throw it away. <b>Check</b>: <code>compliance_report()</code> compares getter output with a YAML file that describes the design.</p>
<p>The drivers do not invent a new transport. The <code>ios</code> and <code>nxos_ssh</code> drivers use netmiko over SSH, <code>eos</code> uses pyeapi over eAPI, and <code>junos</code> uses PyEZ over NETCONF on port 830. That is why Junos and EOS must have their API switched on first, exactly as in <code>adv-netconf</code>.</p>

<h3>The same short loop on three vendors</h3>
<p>This is <code>hello.py</code>. Only the driver name and the optional arguments change between the devices; the loop body is identical.</p>
<pre class="code">from napalm import get_network_driver

PLAN = [("ios", "10.99.0.1", {"secret": "NK@2026"}), ("junos", "10.99.0.11", {}), ("eos", "10.99.0.21", {})]
for name, host, args in PLAN:
    driver = get_network_driver(name)
    with driver(host, "netops", "NK@2026", optional_args=args) as dev:
        facts = dev.get_facts()
        print("%-5s %-12s %-8s %d interfaces" % (name, facts["hostname"], facts["vendor"], len(dev.get_interfaces())))</pre>
<pre class="out">AUTO01$ python3 hello.py
ios   PUN-CORE-R1  Cisco    5 interfaces
junos J1           Juniper  6 interfaces
eos   E1           Arista   9 interfaces</pre>
<p>R1 is IOS XE, J1 is Junos and E1 is EOS, yet <code>get_facts()</code> and <code>get_interfaces()</code> were called the same way and returned the same kinds of values. The <code>with</code> block opens the session and always closes it.</p>

<div class="warn"><p><b>Common mistake.</b> NAPALM makes <em>reading</em> vendor-neutral. It does <em>not</em> translate your intent into configuration. The candidate you load is still the vendor's own syntax: <code>ntp server 10.99.0.61</code> on IOS and EOS, <code>set system ntp server 10.99.0.61</code> on Junos. Chapter 5 shows how to keep that tidy with one small function per platform.</p></div>

<h3>Where NAPALM fits among your tools</h3>
<table class="cmp"><tr><th>Need</th><th>Best tool</th></tr>
<tr><td>Run one show command and parse the text</td><td>netmiko or nkmiko</td></tr>
<tr><td>Exact control of a NETCONF datastore</td><td>ncclient</td></tr>
<tr><td>Junos only, rich RPCs and tables</td><td>PyEZ</td></tr>
<tr><td>Same getter, same diff, same rollback on every vendor</td><td><b>NAPALM</b></td></tr></table>
<p>The cost is coverage. A getter exists only if the driver authors wrote it, and some platform features, such as a confirmed commit, exist on one driver and not on another. Chapter 3 gives you the table, and the lab raises the real <code>NotImplementedError</code> so you recognise it.</p>

<div class="exam"><p><b>Exam trap.</b> "Which transport does the <code>junos</code> driver use?" NETCONF through PyEZ, port 830. "Which does <code>eos</code> use?" eAPI, HTTPS by default. Not SSH screen scraping.</p></div>

<div class="scn"><h4>The audit that needed three scripts</h4><p>A Pune team had one netmiko script per vendor to check NTP and BGP before a change window. Each script parsed text differently, and the Junos one broke after an upgrade changed a column. They moved to NAPALM getters: one loop, one dictionary shape, and a table at the end. The next upgrade changed nothing in the code, because the driver, not the team, owns the parsing.</p><p><b>Lesson:</b> use NAPALM where you want the same question asked of every vendor, and let the driver absorb the output differences.</p></div>

<div class="iv"><p class="q">"Why would you use NAPALM instead of netmiko?"</p><p>Netmiko gives me a text pipe; I write and maintain the parsing per vendor. NAPALM gives me normalised getters and a candidate, diff, commit and rollback workflow that works the same way on IOS, Junos and EOS. I still write vendor syntax for configuration, and I accept that some getters are missing on some drivers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAPALM is one API with a driver per platform: <code>ios</code>, <code>junos</code>, <code>eos</code>, <code>nxos_ssh</code>.</li>
<li>Drivers sit on netmiko (SSH), PyEZ (NETCONF 830) and pyeapi (eAPI).</li>
<li>Reading is normalised; configuration text is still per vendor.</li>
<li>Three jobs: getters, the candidate workflow, compliance reports.</li>
<li>Coverage differs by driver, so always check before you rely on a getter.</li></ul></div>`,hi:`<h3>Is chapter mein aap kya seekhoge</h3>
<p>Is module ke ant tak aap ek Cisco IOS XE router, ek Juniper Junos router aur ek Arista EOS switch ko Python ke ek hi chhote loop se khol sakte ho, unki state ko ek jaisi dictionaries mein padh sakte ho, har commit se pehle diff padhkar configuration change push kar sakte ho, use undo kar sakte ho, aur YAML file se saabit kar sakte ho ki network ab bhi apne design se match karta hai. Module ek compliance report par khatam hota hai jo PASS ya FAIL kehti hai, aur aap FAIL ko padhna seekhoge.</p>
<ul>
<li><code>get_network_driver</code> se driver chuno aur sahi arguments ke saath connect karo.</li>
<li><code>get_facts</code>, <code>get_interfaces</code>, <code>get_ntp_servers</code> aur <code>get_bgp_neighbors</code> jaise getters use karo, aur jaano kis driver mein kaunsa getter nahi hai.</li>
<li>Merge ya replace candidate load karo, <code>compare_config()</code> padho, phir <code>commit_config()</code> ya <code>discard_config()</code> karo.</li>
<li>Jahan platform deta hai wahan confirmed commit aur <code>rollback()</code> use karo, aur jaano jahan nahi deta.</li>
<li><code>compliance_report()</code> chalao aur failing report ko sahi taraf theek karo: file ya device.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> <code>adv-nkmiko</code> (chaar vendors par sessions), <code>adv-netconf</code> aur <code>adv-pyez-config</code> (candidate datastore, confirmed commit, Junos Config object), aur Program 1 ka <code>py-safepush</code> (dry run, diff, verify, roll back). NAPALM yahi ideas ek API mein lapetta hua hai. <code>adv-nornir</code> track mein agla hai aur is module ka code poore fleet par chalata hai.</p></div>

<h3>Ek analogy: universal travel adapter</h3>
<p>Har desh ka wall socket alag hota hai, par aapke laptop ka charger wahi rehta hai. Dono ke beech ek universal adapter baithta hai. NAPALM network devices ke liye wahi adapter hai: aapki script ek shape mein plug hoti hai, aur har vendor ka ek <b>driver</b> deewar mein plug hota hai. NAPALM ka matlab hai Network Automation and Programmability Abstraction Layer with Multivendor support.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="NAPALM layers">
<rect x="170" y="8" width="300" height="34" rx="8" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Aapki script: ek loop</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="60" width="520" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">NAPALM base API</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="10">get_* getters · load_*_candidate · compare_config · commit_config · compliance_report</text>
<line x1="80" y1="102" x2="80" y2="122" stroke="#64748b" stroke-width="2"/><line x1="240" y1="102" x2="240" y2="122" stroke="#64748b" stroke-width="2"/><line x1="400" y1="102" x2="400" y2="122" stroke="#64748b" stroke-width="2"/><line x1="560" y1="102" x2="560" y2="122" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="80" y="145" text-anchor="middle" class="svg-ink" font-size="13">ios</text><rect x="170" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="240" y="145" text-anchor="middle" class="svg-ink" font-size="13">junos</text><rect x="330" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="400" y="145" text-anchor="middle" class="svg-ink" font-size="13">eos</text><rect x="490" y="122" width="140" height="36" rx="8" fill="#fde68a"/><text x="560" y="145" text-anchor="middle" class="svg-ink" font-size="13">nxos_ssh</text>
<line x1="80" y1="158" x2="80" y2="178" stroke="#64748b" stroke-width="2"/><line x1="240" y1="158" x2="240" y2="178" stroke="#64748b" stroke-width="2"/><line x1="400" y1="158" x2="400" y2="178" stroke="#64748b" stroke-width="2"/><line x1="560" y1="158" x2="560" y2="178" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="80" y="195" text-anchor="middle" class="svg-ink" font-size="13">SSH</text><text x="80" y="211" text-anchor="middle" class="svg-muted" font-size="10">netmiko</text><rect x="170" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="240" y="195" text-anchor="middle" class="svg-ink" font-size="13">NETCONF 830</text><text x="240" y="211" text-anchor="middle" class="svg-muted" font-size="10">PyEZ</text><rect x="330" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="400" y="195" text-anchor="middle" class="svg-ink" font-size="13">eAPI over HTTPS</text><text x="400" y="211" text-anchor="middle" class="svg-muted" font-size="10">pyeapi</text><rect x="490" y="178" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="560" y="195" text-anchor="middle" class="svg-ink" font-size="13">SSH</text><text x="560" y="211" text-anchor="middle" class="svg-muted" font-size="10">netmiko</text>
<line x1="80" y1="218" x2="80" y2="238" stroke="#64748b" stroke-width="2"/><line x1="240" y1="218" x2="240" y2="238" stroke="#64748b" stroke-width="2"/><line x1="400" y1="218" x2="400" y2="238" stroke="#64748b" stroke-width="2"/><line x1="560" y1="218" x2="560" y2="238" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="80" y="261" text-anchor="middle" class="svg-ink" font-size="13">R1 IOS XE</text><rect x="170" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="240" y="261" text-anchor="middle" class="svg-ink" font-size="13">J1 Junos</text><rect x="330" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="400" y="261" text-anchor="middle" class="svg-ink" font-size="13">E1 EOS</text><rect x="490" y="238" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="560" y="261" text-anchor="middle" class="svg-ink" font-size="13">N1 NX-OS</text>
</svg><p class="cap">Upar ek API, har platform ka ek driver, aur neeche wahi transport jo aap pehle se jaante ho.</p></div>

<h3>Do halves aur ek checker</h3>
<p>NAPALM teen kaam karta hai. <b>Read</b>: <code>get_facts()</code> jaise getters vendor kuch bhi ho, wahi dictionary keys lautate hain. <b>Write</b>: aap candidate configuration load karte ho, difference maangte ho, aur commit karte ho ya fenk dete ho. <b>Check</b>: <code>compliance_report()</code> getter output ko design batane wali YAML file se compare karta hai.</p>
<p>Drivers koi naya transport nahi banate. <code>ios</code> aur <code>nxos_ssh</code> drivers SSH par netmiko use karte hain, <code>eos</code> eAPI par pyeapi use karta hai, aur <code>junos</code> port 830 par NETCONF ke upar PyEZ use karta hai. Isiliye Junos aur EOS par pehle API on karni padti hai, bilkul <code>adv-netconf</code> ki tarah.</p>

<h3>Teen vendors par wahi chhota loop</h3>
<p>Yeh <code>hello.py</code> hai. Devices ke beech sirf driver ka naam aur optional arguments badalte hain; loop ka body ek jaisa hai.</p>
<pre class="code">from napalm import get_network_driver

PLAN = [("ios", "10.99.0.1", {"secret": "NK@2026"}), ("junos", "10.99.0.11", {}), ("eos", "10.99.0.21", {})]
for name, host, args in PLAN:
    driver = get_network_driver(name)
    with driver(host, "netops", "NK@2026", optional_args=args) as dev:
        facts = dev.get_facts()
        print("%-5s %-12s %-8s %d interfaces" % (name, facts["hostname"], facts["vendor"], len(dev.get_interfaces())))</pre>
<pre class="out">AUTO01$ python3 hello.py
ios   PUN-CORE-R1  Cisco    5 interfaces
junos J1           Juniper  6 interfaces
eos   E1           Arista   9 interfaces</pre>
<p>R1 IOS XE hai, J1 Junos hai aur E1 EOS hai, phir bhi <code>get_facts()</code> aur <code>get_interfaces()</code> ek hi tarah bulaye gaye aur ek jaise kisam ki values mili. <code>with</code> block session kholta hai aur hamesha band karta hai.</p>

<div class="warn"><p><b>Common mistake.</b> NAPALM <em>padhna</em> vendor-neutral banata hai. Yeh aapke intent ko configuration mein translate <em>nahi</em> karta. Jo candidate aap load karte ho woh ab bhi vendor ki apni syntax hai: IOS aur EOS par <code>ntp server 10.99.0.61</code>, Junos par <code>set system ntp server 10.99.0.61</code>. Chapter 5 dikhata hai ki har platform ke liye ek chhote function se ise saaf kaise rakhein.</p></div>

<h3>Aapke tools mein NAPALM kahan baithta hai</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Best tool</th></tr>
<tr><td>Ek show command chalana aur text parse karna</td><td>netmiko ya nkmiko</td></tr>
<tr><td>NETCONF datastore par poora control</td><td>ncclient</td></tr>
<tr><td>Sirf Junos, rich RPCs aur tables</td><td>PyEZ</td></tr>
<tr><td>Har vendor par wahi getter, wahi diff, wahi rollback</td><td><b>NAPALM</b></td></tr></table>
<p>Keemat coverage hai. Getter tabhi hota hai jab driver ke authors ne use likha ho, aur kuch platform features, jaise confirmed commit, ek driver par hote hain aur doosre par nahi. Chapter 3 aapko table deta hai, aur lab asli <code>NotImplementedError</code> uthata hai taaki aap use pehchano.</p>

<div class="exam"><p><b>Exam trap.</b> "<code>junos</code> driver kaunsa transport use karta hai?" PyEZ ke through NETCONF, port 830. "<code>eos</code> kaunsa use karta hai?" eAPI, default mein HTTPS. SSH screen scraping nahi.</p></div>

<div class="scn"><h4>Woh audit jisme teen scripts lagi</h4><p>Pune ki ek team ke paas change window se pehle NTP aur BGP check karne ke liye har vendor ki ek netmiko script thi. Har script text alag tarah parse karti thi, aur Junos wali upgrade ke baad toot gayi kyunki ek column badal gaya. Unhone NAPALM getters par move kiya: ek loop, ek dictionary shape, aur ant mein ek table. Agli upgrade ne code mein kuch nahi badla, kyunki parsing team ki nahi, driver ki zimmedari hai.</p><p><b>Lesson:</b> NAPALM wahan use karo jahan har vendor se wahi sawaal poochna ho, aur output ke farq driver ko sambhalne do.</p></div>

<div class="iv"><p class="q">"Netmiko ki jagah NAPALM kyon use karoge?"</p><p>Netmiko mujhe text pipe deta hai; parsing main har vendor ke liye likhta aur maintain karta hoon. NAPALM mujhe normalised getters aur candidate, diff, commit aur rollback workflow deta hai jo IOS, Junos aur EOS par ek jaisa chalta hai. Configuration ke liye main ab bhi vendor syntax likhta hoon, aur maanta hoon ki kuch drivers mein kuch getters nahi hote.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAPALM ek API hai jisme har platform ka driver hai: <code>ios</code>, <code>junos</code>, <code>eos</code>, <code>nxos_ssh</code>.</li>
<li>Drivers netmiko (SSH), PyEZ (NETCONF 830) aur pyeapi (eAPI) par baithte hain.</li>
<li>Reading normalised hai; configuration text ab bhi vendor ka hai.</li>
<li>Teen kaam: getters, candidate workflow, compliance reports.</li>
<li>Coverage driver ke hisaab se alag hai, isliye getter par bharosa karne se pehle check karo.</li></ul></div>`}};export{e as default};