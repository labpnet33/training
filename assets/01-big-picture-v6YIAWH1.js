var e={id:`big-picture`,h:{en:`Why Nornir: the big picture`,hi:`Nornir kyon: big picture`},body:{en:`
<p><b>What you will learn.</b> In <code>py-tools</code> you wrote <code>netbackup.py</code>: a device list, a thread pool and a loop that saved one file per router. This module rebuilds that tool on top of <b>Nornir 3</b>, a Python framework for running tasks on many devices. By the end you can describe a fleet in YAML (hosts, groups, defaults), write a task and read its results, use <code>nornir_netmiko</code>, <code>nornir_utils</code> and <code>nornir_jinja2</code>, choose hosts with filters, understand the threaded and serial runners, handle failed hosts, and say when Nornir is the right tool and when it is not.</p>
<p><b>Prerequisites.</b> <code>py-tools</code> (the original <code>netbackup.py</code>), <code>py-concurrency</code> (threads), <code>py-secrets</code> (no passwords in code), <code>py-templates</code> and <code>py-textfsm</code> (Jinja2 and parsed output) and <code>adv-nkmiko</code> (Netmiko on four vendors). <code>adv-scrapli</code> shows a second SSH library that Nornir can also use. <code>adv-napalm</code> comes later and gets only a short preview here.</p>

<h3>An analogy: the dispatcher of a courier office</h3>
<p>A dispatcher has a <b>roster board</b> (who works where, which van, which route), a <b>job card</b> (what to do at each stop) and a team of <b>riders</b> who go out at the same time. When a rider cannot deliver, the dispatcher does not stop the whole day: the card comes back marked "failed" and the others carry on. At night the dispatcher has one report with a line per rider. Nornir is that dispatcher. The roster is the <b>inventory</b>, the job card is a <b>task</b>, the riders are the <b>runner</b>, and the report is the <b>result</b> object.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="The parts of a Nornir run">
<rect x="8" y="14" width="118" height="64" rx="10" fill="#bae6fd"/><text x="67" y="42" text-anchor="middle" class="svg-ink" font-size="13">your script</text><text x="67" y="60" text-anchor="middle" class="svg-muted" font-size="11">nrbackup.py</text>
<rect x="150" y="6" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="225" y="31" text-anchor="middle" class="svg-ink" font-size="12">Inventory: hosts, groups</text>
<rect x="150" y="52" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="225" y="77" text-anchor="middle" class="svg-ink" font-size="12">Runner: threads</text>
<rect x="326" y="14" width="130" height="64" rx="10" fill="#fde68a"/><text x="391" y="42" text-anchor="middle" class="svg-ink" font-size="13">task function</text><text x="391" y="60" text-anchor="middle" class="svg-muted" font-size="11">plugin sub-tasks</text>
<rect x="482" y="6" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="557" y="31" text-anchor="middle" class="svg-ink" font-size="12">R1  J1  E1  N1</text>
<rect x="482" y="52" width="150" height="40" rx="8" fill="#fed7aa"/><text x="557" y="77" text-anchor="middle" class="svg-ink" font-size="12">AggregatedResult</text>
<line x1="126" y1="40" x2="150" y2="26" stroke="#64748b" stroke-width="2"/><line x1="126" y1="52" x2="150" y2="72" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="26" x2="326" y2="40" stroke="#64748b" stroke-width="2"/><line x1="300" y1="72" x2="326" y2="52" stroke="#64748b" stroke-width="2"/>
<line x1="456" y1="36" x2="482" y2="26" stroke="#64748b" stroke-width="2"/><line x1="456" y1="56" x2="482" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">InitNornir() reads the config and builds the inventory and the runner.</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">nr.run(task=...) starts the task once per host, in the runner's threads.</text>
<text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">Plugins (nornir_netmiko, nornir_jinja2, nornir_utils) supply ready-made tasks.</text>
<text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Every host answers with a Result; the runner collects them into one object.</text>
</svg><p class="cap">The parts of a Nornir run. You write the script and the task; everything else is a building block.</p></div>

<h3>Netbackup, one piece at a time</h3>
<table class="cmp"><tr><th>In netbackup.py (py-tools)</th><th>In Nornir</th></tr>
<tr><td>A dictionary of devices</td><td><b>Inventory</b>: hosts, groups and defaults in YAML files</td></tr>
<tr><td>A thread pool you managed</td><td><b>Runner</b>: <code>threaded</code> or <code>serial</code>, set in <code>config.yaml</code></td></tr>
<tr><td>A function that backs up one device</td><td>A <b>task</b>, a function that takes <code>task</code> and returns a <code>Result</code></td></tr>
<tr><td><code>try/except</code> around each device</td><td>Failed hosts are tracked for you: <code>result.failed_hosts</code></td></tr>
<tr><td>Prints and a results list</td><td><code>AggregatedResult</code>, one <code>MultiResult</code> per host</td></tr></table>
<p>Nothing here is magic. It is the code you already wrote, cut into reusable parts. The gain is that the parts are standard: the next person reads your inventory and your task and knows where to look.</p>

<h3>Your first Nornir run</h3>
<p>Lab 1 starts by writing <code>config.yaml</code> and the <code>inventory/</code> folder (chapter 2 explains them). Then <code>first.py</code> asks every device for <code>show version</code>. Read the code first.</p>
<pre class="code">"""first.py - the first Nornir run: show version on every host"""
<span class="hl">from nornir import InitNornir</span>
from nornir_netmiko.tasks import netmiko_send_command

<span class="hl">nr = InitNornir(config_file="config.yaml")</span>
<span class="hl">result = nr.run(task=netmiko_send_command, command_string="show version")</span>
for name, multi in result.items():
    if multi.failed:
        print("%-3s FAILED %s" % (name, type(multi[0].exception).__name__))
    else:
        print("%-3s %s" % (name, multi[0].result.splitlines()[0]))
<span class="hl">print("failed hosts:", sorted(result.failed_hosts))</span>
nr.close_connections()</pre>
<p><code>InitNornir</code> builds the inventory and the runner from the config file. <code>nr.run()</code> starts <code>netmiko_send_command</code> once per host. What comes back is a dictionary-like object: the key is the host name and the value holds that host's results. <code>multi.failed</code> tells you whether the host failed, and <code>multi[0].result</code> is the text the device returned. The last line closes the SSH sessions that Nornir kept open.</p>
<pre class="out">AUTO01$ python3 first.py
r1  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
j1  Hostname: J1
e1  Arista vEOS-lab
n1  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
<span class="hl">r3  FAILED NetmikoTimeoutException</span>
<span class="hl">failed hosts: ['r3']</span></pre>
<p>Four hosts answer and <code>r3</code> does not. The inventory lists a router that is not switched on yet, which is a normal situation: inventories are always ahead of reality. Look at what did <b>not</b> happen: one dead host did not stop the run and did not print a traceback. This is the first thing to get used to.</p>

<div class="eg"><p><b>Worked example: the daily backup.</b> The team wants the configs of all routers every night, in a folder per day, and a non-zero exit code when any device fails so that cron mails someone. Over the next chapters you build exactly that, in about 50 lines of your own code, and it works the same on Cisco, Juniper and Arista.</p></div>

<h3>The road map</h3>
<ul>
<li>Chapters 2 to 5: inventory, tasks, the Netmiko plugin and the backup run (Lab 1, steps 1 to 4).</li>
<li>Chapters 6 to 8: filters and the command line, failures, templates and a safe push (Lab 1, steps 5 to 7).</li>
<li>Chapter 9: other plugins and the rule of thumb. Chapter 10: Lab 2, the audit that says nothing is wrong. Chapter 11: summary.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Thinking Nornir replaces Netmiko. It does not: <code>nornir_netmiko</code> calls Netmiko underneath. Nornir decides <i>which</i> devices and <i>when</i>, Netmiko talks to one device.</p></div>
<div class="exam"><p><b>Exam trap.</b> Nornir is a Python library, not a language. There is no playbook syntax: your tasks are plain Python functions, and you debug them with the normal tools.</p></div>

<div class="scn"><h4>Forty routers, one cron job</h4><p>A team ran a backup script that looped over 40 routers one by one and took 25 minutes. Whenever the first router timed out, the loop stopped, so the other 39 were never saved. Rebuilt on Nornir with a threaded runner, the same job takes a few minutes and the dead router is reported at the end, while all the other backups are on disk.</p><p><b>Lesson:</b> run in parallel and treat a failed host as a result, not as a crash.</p></div>

<div class="iv"><p class="q">"What is Nornir and why would you use it instead of a for loop?"</p><p>It is a Python automation framework with an inventory, a threaded runner and result objects. A for loop gives me no groups, no parallel work and no per-host failure tracking unless I write them. With Nornir I describe devices in YAML, write a task as a normal function, and get one result per host. It is still plain Python, so I can test and debug it normally.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nornir = inventory + runner + tasks + results, all in plain Python.</li>
<li>It runs a task on every selected host in parallel and collects one result per host.</li>
<li>A failed host is recorded in the result and does not stop the others.</li>
<li>Plugins such as <code>nornir_netmiko</code> provide ready-made tasks; Netmiko still does the SSH.</li>
<li>Lab 1 rebuilds <code>netbackup.py</code> as <code>nrbackup.py</code>; Lab 2 is a troubleshooting story.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> <code>py-tools</code> mein aapne <code>netbackup.py</code> likhi thi: device list, thread pool aur ek loop jo har router ki ek file save karta tha. Yeh module us tool ko <b>Nornir 3</b> par dobara banata hai. Nornir ek Python framework hai jo bahut saare devices par tasks chalata hai. Ant mein aap fleet ko YAML mein describe kar sakoge (hosts, groups, defaults), task likh kar uske results padh sakoge, <code>nornir_netmiko</code>, <code>nornir_utils</code> aur <code>nornir_jinja2</code> use kar sakoge, filters se hosts chun sakoge, threaded aur serial runner samjhoge, failed hosts handle karoge, aur bata sakoge ki Nornir kab sahi tool hai aur kab nahi.</p>
<p><b>Prerequisites.</b> <code>py-tools</code> (original <code>netbackup.py</code>), <code>py-concurrency</code> (threads), <code>py-secrets</code> (code mein password nahi), <code>py-templates</code> aur <code>py-textfsm</code> (Jinja2 aur parsed output) aur <code>adv-nkmiko</code> (chaar vendors par Netmiko). <code>adv-scrapli</code> dusri SSH library dikhata hai jo Nornir bhi use kar sakta hai. <code>adv-napalm</code> baad mein aata hai, yahan uska sirf chhota preview hai.</p>

<h3>Ek analogy: courier office ka dispatcher</h3>
<p>Dispatcher ke paas ek <b>roster board</b> hota hai (kaun kahan kaam karta hai, kaunsi van, kaunsa route), ek <b>job card</b> (har stop par kya karna hai) aur <b>riders</b> ki team jo ek saath nikalti hai. Jab ek rider deliver nahi kar paata, dispatcher poora din nahi rokta: card "failed" mark hokar wapas aata hai aur baaki log chalte rehte hain. Raat ko dispatcher ke paas ek report hoti hai jisme har rider ki ek line hai. Nornir yahi dispatcher hai. Roster <b>inventory</b> hai, job card <b>task</b> hai, riders <b>runner</b> hain, aur report <b>result</b> object hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="The parts of a Nornir run">
<rect x="8" y="14" width="118" height="64" rx="10" fill="#bae6fd"/><text x="67" y="42" text-anchor="middle" class="svg-ink" font-size="13">your script</text><text x="67" y="60" text-anchor="middle" class="svg-muted" font-size="11">nrbackup.py</text>
<rect x="150" y="6" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="225" y="31" text-anchor="middle" class="svg-ink" font-size="12">Inventory: hosts, groups</text>
<rect x="150" y="52" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="225" y="77" text-anchor="middle" class="svg-ink" font-size="12">Runner: threads</text>
<rect x="326" y="14" width="130" height="64" rx="10" fill="#fde68a"/><text x="391" y="42" text-anchor="middle" class="svg-ink" font-size="13">task function</text><text x="391" y="60" text-anchor="middle" class="svg-muted" font-size="11">plugin sub-tasks</text>
<rect x="482" y="6" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="557" y="31" text-anchor="middle" class="svg-ink" font-size="12">R1  J1  E1  N1</text>
<rect x="482" y="52" width="150" height="40" rx="8" fill="#fed7aa"/><text x="557" y="77" text-anchor="middle" class="svg-ink" font-size="12">AggregatedResult</text>
<line x1="126" y1="40" x2="150" y2="26" stroke="#64748b" stroke-width="2"/><line x1="126" y1="52" x2="150" y2="72" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="26" x2="326" y2="40" stroke="#64748b" stroke-width="2"/><line x1="300" y1="72" x2="326" y2="52" stroke="#64748b" stroke-width="2"/>
<line x1="456" y1="36" x2="482" y2="26" stroke="#64748b" stroke-width="2"/><line x1="456" y1="56" x2="482" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">InitNornir() reads the config and builds the inventory and the runner.</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">nr.run(task=...) starts the task once per host, in the runner's threads.</text>
<text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">Plugins (nornir_netmiko, nornir_jinja2, nornir_utils) supply ready-made tasks.</text>
<text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Every host answers with a Result; the runner collects them into one object.</text>
</svg><p class="cap">The parts of a Nornir run. You write the script and the task; everything else is a building block.</p></div>

<h3>Netbackup, ek-ek hisse mein</h3>
<table class="cmp"><tr><th>netbackup.py mein (py-tools)</th><th>Nornir mein</th></tr>
<tr><td>Devices ki dictionary</td><td><b>Inventory</b>: YAML files mein hosts, groups aur defaults</td></tr>
<tr><td>Thread pool jo aap khud sambhalte the</td><td><b>Runner</b>: <code>threaded</code> ya <code>serial</code>, <code>config.yaml</code> mein set</td></tr>
<tr><td>Ek device ka backup lene wala function</td><td>Ek <b>task</b>, jo <code>task</code> leta hai aur <code>Result</code> return karta hai</td></tr>
<tr><td>Har device ke gird <code>try/except</code></td><td>Failed hosts apne aap track hote hain: <code>result.failed_hosts</code></td></tr>
<tr><td>Prints aur results list</td><td><code>AggregatedResult</code>, har host ka ek <code>MultiResult</code></td></tr></table>
<p>Isme koi jaadu nahi hai. Yeh wahi code hai jo aap pehle likh chuke ho, reusable hisson mein kata hua. Fayda yeh hai ki hisse standard hain: agla engineer aapki inventory aur task padh kar jaan leta hai ki kahan dekhna hai.</p>

<h3>Aapki pehli Nornir run</h3>
<p>Lab 1 <code>config.yaml</code> aur <code>inventory/</code> folder likhne se shuru hota hai (chapter 2 unhe samjhata hai). Phir <code>first.py</code> har device se <code>show version</code> maangti hai. Pehle code padho.</p>
<pre class="code">"""first.py - the first Nornir run: show version on every host"""
<span class="hl">from nornir import InitNornir</span>
from nornir_netmiko.tasks import netmiko_send_command

<span class="hl">nr = InitNornir(config_file="config.yaml")</span>
<span class="hl">result = nr.run(task=netmiko_send_command, command_string="show version")</span>
for name, multi in result.items():
    if multi.failed:
        print("%-3s FAILED %s" % (name, type(multi[0].exception).__name__))
    else:
        print("%-3s %s" % (name, multi[0].result.splitlines()[0]))
<span class="hl">print("failed hosts:", sorted(result.failed_hosts))</span>
nr.close_connections()</pre>
<p><code>InitNornir</code> config file se inventory aur runner banata hai. <code>nr.run()</code> har host par ek baar <code>netmiko_send_command</code> chalata hai. Wapas ek dictionary jaisa object aata hai: key host ka naam hai aur value us host ke results hain. <code>multi.failed</code> batata hai ki host fail hua ya nahi, aur <code>multi[0].result</code> device ka lautaya hua text hai. Aakhri line Nornir ke khule rakhe SSH sessions band karti hai.</p>
<pre class="out">AUTO01$ python3 first.py
r1  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
j1  Hostname: J1
e1  Arista vEOS-lab
n1  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
<span class="hl">r3  FAILED NetmikoTimeoutException</span>
<span class="hl">failed hosts: ['r3']</span></pre>
<p>Chaar hosts jawab dete hain aur <code>r3</code> nahi deta. Inventory mein ek aisa router hai jo abhi on nahi hua, aur yeh aam baat hai: inventory hamesha haqeeqat se aage chalti hai. Yeh dekho ki kya <b>nahi</b> hua: ek dead host ne run ko nahi roka aur traceback print nahi hua. Isse sabse pehle aadat banao.</p>

<div class="eg"><p><b>Worked example: daily backup.</b> Team chahti hai ki har raat saare routers ki configs din ke folder mein aayein, aur koi device fail ho to exit code non-zero ho taaki cron kisi ko mail kare. Agle chapters mein aap yahi banate ho, apne code ki lagbhag 50 lines mein, aur yeh Cisco, Juniper aur Arista par ek jaisa chalta hai.</p></div>

<h3>Road map</h3>
<ul>
<li>Chapters 2 se 5: inventory, tasks, Netmiko plugin aur backup run (Lab 1, steps 1 se 4).</li>
<li>Chapters 6 se 8: filters aur command line, failures, templates aur safe push (Lab 1, steps 5 se 7).</li>
<li>Chapter 9: dusre plugins aur rule of thumb. Chapter 10: Lab 2, woh audit jo kehta hai sab theek hai. Chapter 11: summary.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki Nornir Netmiko ki jagah leta hai. Nahi leta: <code>nornir_netmiko</code> andar Netmiko ko hi bulata hai. Nornir tay karta hai <i>kaun se</i> devices aur <i>kab</i>, Netmiko ek device se baat karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Nornir ek Python library hai, koi language nahi. Playbook syntax nahi hai: aapke tasks normal Python functions hain, aur unhe normal tools se debug karte ho.</p></div>

<div class="scn"><h4>Chalis routers, ek cron job</h4><p>Ek team ki backup script 40 routers par ek-ek karke loop chalati thi aur 25 minute leti thi. Jab pehla router timeout hota, loop ruk jaata aur baaki 39 kabhi save nahi hote. Threaded runner ke saath Nornir par dobara banane ke baad wahi kaam kuch minute mein hota hai, aur dead router ant mein report hota hai, jabki baaki sab backups disk par hote hain.</p><p><b>Lesson:</b> parallel chalao aur failed host ko crash nahi, result samjho.</p></div>

<div class="iv"><p class="q">"Nornir kya hai aur for loop ki jagah use kyon karoge?"</p><p>Yeh Python automation framework hai jisme inventory, threaded runner aur result objects hain. For loop mein groups, parallel kaam aur per-host failure tracking tab tak nahi milte jab tak main khud na likhun. Nornir mein devices YAML mein describe karta hoon, task normal function ki tarah likhta hoon, aur har host ka ek result milta hai. Yeh phir bhi plain Python hai, isliye test aur debug normal tarike se hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nornir = inventory + runner + tasks + results, sab plain Python mein.</li>
<li>Yeh selected har host par task parallel chalata hai aur har host ka ek result jama karta hai.</li>
<li>Failed host result mein record hota hai aur baaki ko nahi rokta.</li>
<li><code>nornir_netmiko</code> jaise plugins ready-made tasks dete hain; SSH phir bhi Netmiko karta hai.</li>
<li>Lab 1 <code>netbackup.py</code> ko <code>nrbackup.py</code> ki tarah rebuild karta hai; Lab 2 troubleshooting story hai.</li>
</ul></div>
`}};export{e as default};