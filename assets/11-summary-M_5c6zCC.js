var e={id:`summary`,h:{en:`Summary: checklist, cheat-sheet and glossary`,hi:`Summary: checklist, cheat-sheet aur glossary`},body:{en:`
<p>You started this module with a loop and a thread pool. You now have a fleet tool: an inventory with inheritance, tasks that return results, a Netmiko plugin that works on four vendors, filters, a dry run, failure tracking and a log. This chapter is the one to read again before an exam, an interview or a change window.</p>

<h3>An analogy: the dispatcher's morning checklist</h3>
<p>A good dispatcher starts the day with the same questions: who is on the roster, what is the job, who is absent, and what did yesterday's report say? Your script asks the same: which hosts, which task, which failed, what changed.</p>

<h3>What you can now do</h3>
<ul>
<li>Describe a fleet in <code>config.yaml</code>, <code>hosts.yaml</code>, <code>groups.yaml</code> and <code>defaults.yaml</code>, and explain that values come from the host, then its groups, then the defaults.</li>
<li>Write a task as a function of one host, call sub-tasks with <code>task.run()</code>, and return a <code>Result</code> with <code>changed</code>.</li>
<li>Read the result tree: <code>AggregatedResult</code> to <code>MultiResult</code> to <code>Result</code>, with the parent task at index 0.</li>
<li>Use <code>netmiko_send_command</code>, <code>netmiko_send_config</code> and <code>netmiko_commit</code>, and know that a refused command is not a failed host.</li>
<li>Write backups with <code>write_file</code>, strip noise lines, and exit non-zero when hosts failed.</li>
<li>Choose hosts with keyword filters, <code>F</code> objects and <code>filter_func</code>; run threaded or serial.</li>
<li>Handle failures: <code>failed_hosts</code>, the sub-task exception, <code>on_failed</code>, <code>reset_failed_hosts()</code>, processors and a log file.</li>
<li>Render one template per platform with <code>nornir_jinja2</code> and push with a real dry run.</li>
<li>Say when to use Netmiko, Nornir, Ansible, NAPALM or scrapli.</li>
</ul>

<h3>The skeleton to remember</h3>
<p>The final <code>nrbackup.py</code> in five moves: build, filter, run, report, exit.</p>
<pre class="code"><span class="hl">nr = InitNornir(config_file=args.config, dry_run=args.dry_run)</span>
if args.group:
<span class="hl">    nr = nr.filter(F(groups__contains=args.group))</span>
if args.site:
<span class="hl">    nr = nr.filter(site=args.site)</span>
<span class="hl">result = nr.run(task=backup, folder=folder)</span>
nr.close_connections()

<span class="hl">failed = sorted(result.failed_hosts)</span>
print("%d saved, %d failed" % (len(result) - len(failed), len(failed)))
<span class="hl">sys.exit(1 if failed else 0)</span></pre>

<h3>Cheat-sheet</h3>
<table class="cmp"><tr><th>You want to</th><th>Write</th></tr>
<tr><td>Build from a config file</td><td><code>InitNornir(config_file="config.yaml", dry_run=False)</code></td></tr>
<tr><td>Run a task on all hosts</td><td><code>result = nr.run(task=fn, name="x", **kwargs)</code></td></tr>
<tr><td>Run a sub-task</td><td><code>task.run(task=fn, **kwargs).result</code></td></tr>
<tr><td>Read data of a host</td><td><code>host["key"]</code>, <code>host.get("key", default)</code>, <code>host.keys()</code></td></tr>
<tr><td>Select hosts</td><td><code>nr.filter(site="pune")</code>, <code>nr.filter(F(groups__contains="ios") &amp; ~F(site="pune"))</code>, <code>nr.filter(filter_func=f)</code></td></tr>
<tr><td>Failed hosts</td><td><code>result.failed_hosts</code>, <code>multi.failed</code>, <code>nr.data.reset_failed_hosts()</code></td></tr>
<tr><td>Run on failed hosts only</td><td><code>nr.run(task=fn, on_good=False, on_failed=True)</code></td></tr>
<tr><td>Print everything</td><td><code>print_result(result, vars=["diff"])</code></td></tr>
<tr><td>Write a file</td><td><code>write_file(filename=, content=)</code> returns <code>changed</code> and <code>diff</code></td></tr>
<tr><td>Render a template</td><td><code>template_file(template="x.j2", path="templates")</code></td></tr>
<tr><td>Send config safely</td><td>Check <code>task.is_dry_run()</code> first, then <code>netmiko_send_config</code></td></tr>
<tr><td>Close connections</td><td><code>nr.close_connections()</code></td></tr></table>

<h3>In the lab vs on real gear</h3>
<ul>
<li>The lab runs the threaded runner one host after the other, so you see no speed-up and the result order is the inventory order.</li>
<li>The Python date in the lab and the device clocks differ, so folder names and device headers show different days.</li>
<li>In the lab, pass <code>transform_function</code> as the function itself. If you write it as a string in <code>config.yaml</code> on real gear, check how your Nornir version resolves it.</li>
<li>The text of <code>NornirExecutionError</code> lists all hosts in the lab, and only the failed ones in real Nornir.</li>
<li>The NetBox example needs a NetBox server that these labs do not have.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Inventory</dt><dd>The hosts, groups and defaults Nornir knows about.</dd>
<dt>Task</dt><dd>A function of one host that Nornir calls once per host.</dd>
<dt>Result</dt><dd>The outcome of one task: <code>result</code>, <code>changed</code>, <code>failed</code>, <code>diff</code>, <code>exception</code>.</dd>
<dt>Runner</dt><dd>The part that decides how hosts are run: threaded or serial.</dd>
<dt>Filter</dt><dd>A rule that returns a new Nornir object with fewer hosts.</dd>
<dt>Processor</dt><dd>An object called at fixed moments of a run, to report or log.</dd>
<dt>Dry run</dt><dd>A run that shows what would change and changes nothing, if the tasks honour it.</dd>
</dl>

<h3>Checklist before a change window</h3>
<ul>
<li>Did I print how many hosts the filter selected?</li>
<li>Does every task that sends configuration check <code>is_dry_run()</code>?</li>
<li>Do I read the device back after the push?</li>
<li>Does the script exit non-zero when a host fails?</li>
<li>Are backups and logs protected, with no passwords in code?</li>
</ul>

<div class="scn"><h4>The new engineer's first week</h4><p>A new engineer joined a team that used Nornir. In week one she added a new site to the inventory, ran the audit with a filter for that site, saw "0 hosts", and found a typo in the site name before she touched a device. The checklist above is what she learned from the team.</p><p><b>Lesson:</b> boring checks protect the fleet.</p></div>

<div class="iv"><p class="q">"Summarise how you would automate nightly backups of a mixed-vendor network."</p><p>Nornir with a SimpleInventory or NetBox, one task that reads the vendor's own command from the inventory and writes with <code>write_file</code>, noise lines removed, a threaded run, a failed-host summary with a non-zero exit code, and a log. The backup folder is protected because it holds secrets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory, task, runner, result: four ideas run the whole framework.</li>
<li>Failures are data; quiet failures need your own checks.</li>
<li>Dry run only works when the task honours it.</li>
<li>Choose Nornir for Python-heavy fleets, and use plugins for Netmiko, NAPALM and scrapli.</li>
<li>Next: <code>adv-napalm</code> for vendor-neutral getters and config diffs.</li>
</ul></div>
`,hi:`
<p>Is module ki shuruaat aapne loop aur thread pool se ki thi. Ab aapke paas fleet tool hai: inheritance wali inventory, results lautane wale tasks, chaar vendors par chalne wala Netmiko plugin, filters, dry run, failure tracking aur log. Exam, interview ya change window se pehle yahi chapter dobara padho.</p>

<h3>Ek analogy: dispatcher ki subah ki checklist</h3>
<p>Achha dispatcher din ki shuruaat wahi sawaalon se karta hai: roster mein kaun hai, kaam kya hai, kaun absent hai, aur kal ki report kya kehti thi? Aapki script wahi poochti hai: kaunse hosts, kaunsa task, kaun fail hua, kya badla.</p>

<h3>Ab aap kya kar sakte ho</h3>
<ul>
<li>Fleet ko <code>config.yaml</code>, <code>hosts.yaml</code>, <code>groups.yaml</code> aur <code>defaults.yaml</code> mein describe karna, aur samjhana ki values host, phir uske groups, phir defaults se aati hain.</li>
<li>Task ko ek host ke function ki tarah likhna, <code>task.run()</code> se sub-tasks bulana, aur <code>changed</code> ke saath <code>Result</code> lautana.</li>
<li>Result tree padhna: <code>AggregatedResult</code> se <code>MultiResult</code> se <code>Result</code>, parent task index 0 par.</li>
<li><code>netmiko_send_command</code>, <code>netmiko_send_config</code> aur <code>netmiko_commit</code> use karna, aur jaanna ki refused command failed host nahi hai.</li>
<li><code>write_file</code> se backups likhna, noise lines hatana, aur hosts fail hon to non-zero exit karna.</li>
<li>Keyword filters, <code>F</code> objects aur <code>filter_func</code> se hosts chunna; threaded ya serial chalana.</li>
<li>Failures sambhalna: <code>failed_hosts</code>, sub-task exception, <code>on_failed</code>, <code>reset_failed_hosts()</code>, processors aur log file.</li>
<li><code>nornir_jinja2</code> se har platform ka ek template render karna aur asli dry run ke saath push karna.</li>
<li>Batana ki Netmiko, Nornir, Ansible, NAPALM ya scrapli kab use karna hai.</li>
</ul>

<h3>Yaad rakhne wala skeleton</h3>
<p>Final <code>nrbackup.py</code> paanch moves mein: build, filter, run, report, exit.</p>
<pre class="code"><span class="hl">nr = InitNornir(config_file=args.config, dry_run=args.dry_run)</span>
if args.group:
<span class="hl">    nr = nr.filter(F(groups__contains=args.group))</span>
if args.site:
<span class="hl">    nr = nr.filter(site=args.site)</span>
<span class="hl">result = nr.run(task=backup, folder=folder)</span>
nr.close_connections()

<span class="hl">failed = sorted(result.failed_hosts)</span>
print("%d saved, %d failed" % (len(result) - len(failed), len(failed)))
<span class="hl">sys.exit(1 if failed else 0)</span></pre>

<h3>Cheat-sheet</h3>
<table class="cmp"><tr><th>Aap chahte ho</th><th>Likho</th></tr>
<tr><td>Config file se build karna</td><td><code>InitNornir(config_file="config.yaml", dry_run=False)</code></td></tr>
<tr><td>Sab hosts par task chalana</td><td><code>result = nr.run(task=fn, name="x", **kwargs)</code></td></tr>
<tr><td>Sub-task chalana</td><td><code>task.run(task=fn, **kwargs).result</code></td></tr>
<tr><td>Host ka data padhna</td><td><code>host["key"]</code>, <code>host.get("key", default)</code>, <code>host.keys()</code></td></tr>
<tr><td>Hosts chunna</td><td><code>nr.filter(site="pune")</code>, <code>nr.filter(F(groups__contains="ios") &amp; ~F(site="pune"))</code>, <code>nr.filter(filter_func=f)</code></td></tr>
<tr><td>Failed hosts</td><td><code>result.failed_hosts</code>, <code>multi.failed</code>, <code>nr.data.reset_failed_hosts()</code></td></tr>
<tr><td>Sirf failed hosts par chalana</td><td><code>nr.run(task=fn, on_good=False, on_failed=True)</code></td></tr>
<tr><td>Sab print karna</td><td><code>print_result(result, vars=["diff"])</code></td></tr>
<tr><td>File likhna</td><td><code>write_file(filename=, content=)</code> <code>changed</code> aur <code>diff</code> lautata hai</td></tr>
<tr><td>Template render karna</td><td><code>template_file(template="x.j2", path="templates")</code></td></tr>
<tr><td>Config safely bhejna</td><td>Pehle <code>task.is_dry_run()</code> check karo, phir <code>netmiko_send_config</code></td></tr>
<tr><td>Connections band karna</td><td><code>nr.close_connections()</code></td></tr></table>

<h3>Lab mein vs real gear par</h3>
<ul>
<li>Lab threaded runner ko ek host ke baad doosra chalata hai, isliye speed-up nahi dikhta aur result ka order inventory ka order hota hai.</li>
<li>Lab ki Python date aur devices ki clocks alag hain, isliye folder names aur device headers alag din dikhate hain.</li>
<li>Lab mein <code>transform_function</code> ko function object ki tarah do. Real gear par <code>config.yaml</code> mein string likho to check karo ki aapka Nornir version use kaise resolve karta hai.</li>
<li><code>NornirExecutionError</code> ka text lab mein saare hosts list karta hai, real Nornir mein sirf failed hosts.</li>
<li>NetBox example ko NetBox server chahiye jo in labs mein nahi hai.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Inventory</dt><dd>Hosts, groups aur defaults jo Nornir jaanta hai.</dd>
<dt>Task</dt><dd>Ek host ka function jise Nornir har host ke liye ek baar bulata hai.</dd>
<dt>Result</dt><dd>Ek task ka nateeja: <code>result</code>, <code>changed</code>, <code>failed</code>, <code>diff</code>, <code>exception</code>.</dd>
<dt>Runner</dt><dd>Woh hissa jo tay karta hai hosts kaise chalein: threaded ya serial.</dd>
<dt>Filter</dt><dd>Rule jo kam hosts wala naya Nornir object deta hai.</dd>
<dt>Processor</dt><dd>Run ke tay moments par bulaya jaane wala object, report ya log ke liye.</dd>
<dt>Dry run</dt><dd>Aisi run jo dikhati hai kya badlega aur kuch badalti nahi, agar tasks use maanein.</dd>
</dl>

<h3>Change window se pehle checklist</h3>
<ul>
<li>Kya maine print kiya ki filter ne kitne hosts select kiye?</li>
<li>Configuration bhejne wala har task <code>is_dry_run()</code> check karta hai?</li>
<li>Push ke baad device se read-back karta hoon?</li>
<li>Host fail ho to script non-zero exit karti hai?</li>
<li>Backups aur logs protected hain, code mein koi password nahi?</li>
</ul>

<div class="scn"><h4>Naye engineer ka pehla hafta</h4><p>Ek naya engineer aisi team mein aayi jo Nornir use karti thi. Pehle hafte usne inventory mein naya site joda, us site ke filter ke saath audit chalayi, "0 hosts" dekha, aur kisi device ko chhoone se pehle site ke naam mein typo pakda. Upar ki checklist wahi hai jo usne team se seekhi.</p><p><b>Lesson:</b> boring checks fleet ko bachate hain.</p></div>

<div class="iv"><p class="q">"Mixed-vendor network ke nightly backups automate karne ka tareeka summarise karo."</p><p>Nornir SimpleInventory ya NetBox ke saath, ek task jo vendor ki apni command inventory se padhe aur <code>write_file</code> se likhe, noise lines hata kar, threaded run, failed-host summary non-zero exit code ke saath, aur ek log. Backup folder protected rakhta hoon kyunki usme secrets hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory, task, runner, result: chaar ideas poora framework chalate hain.</li>
<li>Failures data hain; shant failures ke liye apni checks chahiye.</li>
<li>Dry run tabhi kaam karta hai jab task use maane.</li>
<li>Python-heavy fleets ke liye Nornir chuno, aur Netmiko, NAPALM, scrapli ke liye plugins use karo.</li>
<li>Agla: vendor-neutral getters aur config diffs ke liye <code>adv-napalm</code>.</li>
</ul></div>
`}};export{e as default};