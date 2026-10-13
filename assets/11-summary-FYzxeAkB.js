var e={id:`summary`,h:{en:`Summary, checklist and cheat-sheet`,hi:`Summary, checklist aur cheat-sheet`},body:{en:`<p>You can now do with NAPALM what used to take three scripts and three parsers: read the same facts from IOS XE, Junos and EOS, change them with a diff you read before every commit, undo a bad change, and prove that a device matches its design. This last chapter is the checklist, the glossary and the cheat-sheet to take into an exam or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Module recap">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">Connect</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="10">get_network_driver + open</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">Read</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="10">get_* getters</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">Change</text><text x="400" y="63" text-anchor="middle" class="svg-muted" font-size="10">load, compare, commit</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">Check</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="10">compliance_report</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="100" width="300" height="32" rx="8" fill="#fecaca"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">discard, revert_in, rollback: the way back</text>
<line x1="400" y1="80" x2="400" y2="100" stroke="#dc2626" stroke-width="2"/>
</svg><p class="cap">The whole module in four verbs and a way back.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Pick <code>ios</code>, <code>junos</code>, <code>eos</code> or <code>nxos_ssh</code> with <code>get_network_driver</code> and connect with the right <code>optional_args</code>.</li>
<li>Name what must be switched on: SSH and enable secret (IOS), NETCONF 830 (Junos), eAPI over HTTPS (EOS).</li>
<li>Call the core getters and handle <code>NotImplementedError</code>.</li>
<li>Build a fleet report where a dead device is a row, not a crash.</li>
<li>Load a merge candidate, read <code>compare_config()</code>, commit or discard in <code>finally</code>.</li>
<li>Explain merge versus replace and guard a replace by the size of its diff.</li>
<li>Use <code>commit_config(revert_in=...)</code>, <code>confirm_commit()</code> and <code>rollback()</code>, and say where they do not exist.</li>
<li>Write a validation file with <code>_mode: strict</code> and read <code>missing</code>, <code>extra</code> and <code>skipped</code>.</li>
<li>Decide whether a FAIL is a file problem or a device problem.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Driver</dt><dd>The NAPALM class for one platform: <code>ios</code>, <code>junos</code>, <code>eos</code>, <code>nxos_ssh</code>.</dd>
<dt>Getter</dt><dd>A <code>get_*</code> method that returns normalised data.</dd>
<dt>Candidate</dt><dd>Configuration staged on the device or in the driver, not yet live.</dd>
<dt>Merge / replace</dt><dd>Add to the configuration / make the configuration equal the candidate.</dd>
<dt>Diff</dt><dd>The text returned by <code>compare_config()</code>; empty means no change.</dd>
<dt>Confirmed commit</dt><dd>A commit that reverts by itself unless confirmed (<code>revert_in</code> on Junos).</dd>
<dt>Rollback</dt><dd>Return to the configuration before the last commit.</dd>
<dt>Compliance report</dt><dd>The comparison of getter output with a YAML validation file.</dd>
<dt>Strict mode</dt><dd><code>_mode: strict</code>: members not listed are failures.</dd>
<dt>Skipped</dt><dd>A rule whose getter the driver lacks; it does not fail the report.</dd>
<dt>Idempotent</dt><dd>A second run finds an empty diff and changes nothing.</dd></dl>

<h3>Most-tested facts</h3>
<ul>
<li>The constructor is <code>driver(hostname, username, password, timeout=60, optional_args=None)</code>; the connection starts at <code>open()</code>.</li>
<li>Transports: <code>ios</code> and <code>nxos_ssh</code> use SSH (netmiko), <code>eos</code> eAPI (HTTPS default), <code>junos</code> NETCONF 830 (PyEZ).</li>
<li><code>is_alive()</code> returns a dictionary; <code>get_config()</code> returns running, startup and candidate.</li>
<li>The default BGP instance is called <code>global</code>.</li>
<li><code>compare_config()</code> returns a string; empty means nothing to do.</li>
<li>Merge never removes; replace removes what is not in the candidate.</li>
<li>IOS raises <code>NotImplementedError</code> for <code>revert_in</code> and <code>message</code>; Junos supports both.</li>
<li><code>CommitConfirmException</code>: "No pending commit-confirm found!" and "Pending commit confirm already in process!".</li>
<li>Missing or bad validation file: <code>ValidationException</code>.</li></ul>

<h3>Cheat-sheet</h3>
<pre class="code">from napalm import get_network_driver
driver = get_network_driver("ios")          # ios junos eos nxos_ssh nxos
dev = driver(host, user, password, timeout=60, optional_args={"secret": "..."})
dev.open();  dev.is_alive();  dev.cli(["show clock"]);  dev.close()

dev.get_facts()  get_interfaces()  get_interfaces_ip()  get_ntp_servers()
dev.get_bgp_neighbors()  get_arp_table()  get_config(retrieve="running")

dev.load_merge_candidate(config=text)       # or filename=
dev.load_replace_candidate(config=full_text)
diff = dev.compare_config()                 # '' = nothing to do
dev.commit_config(revert_in=120, message="ticket")   # Junos only options
dev.confirm_commit();  dev.has_pending_commit()
dev.discard_config();  dev.rollback()

report = dev.compliance_report(validation_file="validate/R1.yml")
report["complies"]  report["skipped"]</pre>

<h3>The files from the labs</h3>
<table class="cmp"><tr><th>File</th><th>Job</th></tr>
<tr><td><code>nkdev.py</code></td><td>Inventory and <code>open_device()</code></td></tr>
<tr><td><code>facts.py</code>, <code>getters.py</code></td><td>Facts and getters on three vendors</td></tr>
<tr><td><code>ntpsync.py</code></td><td>Merge, diff, commit, verify, exit code</td></tr>
<tr><td><code>replace_preview.py</code>, <code>oops.py</code></td><td>Replace preview and rollback</td></tr>
<tr><td><code>check.py</code> and <code>validate/*.yml</code></td><td>Compliance report with <code>explain()</code></td></tr></table>

<div class="note"><p><b>What comes next.</b> <code>adv-nornir</code> runs this module's tasks across a whole fleet in parallel: <code>nornir_napalm</code> has a getter task and a configure task with a built-in dry run. <code>adv-netbox</code> will supply the inventory, and <code>adv-verify</code> checks a change before you ever touch a device. The code you wrote here is the unit those modules call.</p></div>

<div class="warn"><p><b>Last reminders.</b> NAPALM normalises reading, not configuration syntax. A replace needs a diff-size guard. A skipped rule is a rule that did not run. Never put real passwords in a file in Git.</p></div>

<div class="exam"><p><b>Exam trap.</b> The same method name can mean different things per driver: <code>commit_config(revert_in=...)</code> works on Junos and raises <code>NotImplementedError</code> on the lab IOS driver. Always say which driver you mean.</p></div>

<div class="scn"><h4>The change window that ended early</h4><p>A team changed NTP on 120 devices in one window with this module's pattern: dry run attached to the ticket, apply with confirmed commits on Junos, a second run to show nothing left to change, and a compliance run with strict mode at the end. The window closed 40 minutes early because the second run and the report were the sign-off.</p><p><b>Lesson:</b> the diff before, the report after and the exit codes make the change auditable.</p></div>

<div class="iv"><p class="q">"Summarise how you would roll out a configuration change safely with NAPALM."</p><p>Dry run on every device and attach the diffs, review them, apply with a device-side timer where the platform has one, verify with getters from a fresh session, roll back on failure, run the tool again to prove an empty diff, and finish with a compliance report in strict mode whose exit code gates the sign-off.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connect, read, change, check; and always a way back.</li>
<li>Reading is normalised; configuration text and features are per driver.</li>
<li>The diff is your review; the empty diff is your proof.</li>
<li>Compliance finds what a merge can never see.</li>
<li>Next: run it across a fleet in <code>adv-nornir</code>.</li></ul></div>`,hi:`<p>Ab aap NAPALM se woh kar sakte ho jiske liye pehle teen scripts aur teen parsers lagte the: IOS XE, Junos aur EOS se wahi facts padhna, har commit se pehle padhe hue diff ke saath unhe badalna, galat change ko undo karna, aur saabit karna ki device apne design se match karta hai. Yeh aakhri chapter exam ya interview mein le jaane ke liye checklist, glossary aur cheat-sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Module recap">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">Connect</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="10">get_network_driver + open</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">Read</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="10">get_* getters</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">Change</text><text x="400" y="63" text-anchor="middle" class="svg-muted" font-size="10">load, compare, commit</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">Check</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="10">compliance_report</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="100" width="300" height="32" rx="8" fill="#fecaca"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">discard, revert_in, rollback: wapas ka raasta</text>
<line x1="400" y1="80" x2="400" y2="100" stroke="#dc2626" stroke-width="2"/>
</svg><p class="cap">Poora module chaar kriyaon aur wapas ke raaste mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li><code>get_network_driver</code> se <code>ios</code>, <code>junos</code>, <code>eos</code> ya <code>nxos_ssh</code> chuno aur sahi <code>optional_args</code> ke saath connect karo.</li>
<li>Batao kya on hona chahiye: SSH aur enable secret (IOS), NETCONF 830 (Junos), HTTPS par eAPI (EOS).</li>
<li>Core getters bulao aur <code>NotImplementedError</code> sambhalo.</li>
<li>Aisi fleet report banao jisme dead device ek row ho, crash nahi.</li>
<li>Merge candidate load karo, <code>compare_config()</code> padho, <code>finally</code> mein commit ya discard karo.</li>
<li>Merge versus replace samjhao aur replace ko diff ke size se guard karo.</li>
<li><code>commit_config(revert_in=...)</code>, <code>confirm_commit()</code> aur <code>rollback()</code> use karo, aur batao ye kahan nahi hote.</li>
<li><code>_mode: strict</code> ke saath validation file likho aur <code>missing</code>, <code>extra</code> aur <code>skipped</code> padho.</li>
<li>Tay karo ki FAIL file ki problem hai ya device ki.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Driver</dt><dd>Ek platform ki NAPALM class: <code>ios</code>, <code>junos</code>, <code>eos</code>, <code>nxos_ssh</code>.</dd>
<dt>Getter</dt><dd>Normalised data lautane wala <code>get_*</code> method.</dd>
<dt>Candidate</dt><dd>Device par ya driver mein stage ki hui configuration, abhi live nahi.</dd>
<dt>Merge / replace</dt><dd>Configuration mein jodna / configuration ko candidate ke barabar banana.</dd>
<dt>Diff</dt><dd><code>compare_config()</code> ka lautaya text; khaali ka matlab koi change nahi.</dd>
<dt>Confirmed commit</dt><dd>Aisa commit jo confirm na ho to khud revert ho jaata hai (Junos par <code>revert_in</code>).</dd>
<dt>Rollback</dt><dd>Aakhri commit se pehle ki configuration par wapas jaana.</dd>
<dt>Compliance report</dt><dd>Getter output ka YAML validation file se comparison.</dd>
<dt>Strict mode</dt><dd><code>_mode: strict</code>: jo members list nahi hain woh failures hain.</dd>
<dt>Skipped</dt><dd>Aisa rule jiska getter driver ke paas nahi; woh report fail nahi karta.</dd>
<dt>Idempotent</dt><dd>Doosra run khaali diff paata hai aur kuch nahi badalta.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Constructor <code>driver(hostname, username, password, timeout=60, optional_args=None)</code> hai; connection <code>open()</code> par shuru hota hai.</li>
<li>Transports: <code>ios</code> aur <code>nxos_ssh</code> SSH (netmiko), <code>eos</code> eAPI (default HTTPS), <code>junos</code> NETCONF 830 (PyEZ).</li>
<li><code>is_alive()</code> dictionary lautata hai; <code>get_config()</code> running, startup aur candidate lautata hai.</li>
<li>Default BGP instance ka naam <code>global</code> hai.</li>
<li><code>compare_config()</code> string lautata hai; khaali ka matlab karne ko kuch nahi.</li>
<li>Merge kabhi nahi hatata; replace woh hatata hai jo candidate mein nahi.</li>
<li>IOS <code>revert_in</code> aur <code>message</code> par <code>NotImplementedError</code> uthata hai; Junos dono support karta hai.</li>
<li><code>CommitConfirmException</code>: "No pending commit-confirm found!" aur "Pending commit confirm already in process!".</li>
<li>Validation file missing ya galat ho: <code>ValidationException</code>.</li></ul>

<h3>Cheat-sheet</h3>
<pre class="code">from napalm import get_network_driver
driver = get_network_driver("ios")          # ios junos eos nxos_ssh nxos
dev = driver(host, user, password, timeout=60, optional_args={"secret": "..."})
dev.open();  dev.is_alive();  dev.cli(["show clock"]);  dev.close()

dev.get_facts()  get_interfaces()  get_interfaces_ip()  get_ntp_servers()
dev.get_bgp_neighbors()  get_arp_table()  get_config(retrieve="running")

dev.load_merge_candidate(config=text)       # ya filename=
dev.load_replace_candidate(config=full_text)
diff = dev.compare_config()                 # '' = karne ko kuch nahi
dev.commit_config(revert_in=120, message="ticket")   # sirf Junos ke options
dev.confirm_commit();  dev.has_pending_commit()
dev.discard_config();  dev.rollback()

report = dev.compliance_report(validation_file="validate/R1.yml")
report["complies"]  report["skipped"]</pre>

<h3>Labs ki files</h3>
<table class="cmp"><tr><th>File</th><th>Kaam</th></tr>
<tr><td><code>nkdev.py</code></td><td>Inventory aur <code>open_device()</code></td></tr>
<tr><td><code>facts.py</code>, <code>getters.py</code></td><td>Teen vendors par facts aur getters</td></tr>
<tr><td><code>ntpsync.py</code></td><td>Merge, diff, commit, verify, exit code</td></tr>
<tr><td><code>replace_preview.py</code>, <code>oops.py</code></td><td>Replace preview aur rollback</td></tr>
<tr><td><code>check.py</code> aur <code>validate/*.yml</code></td><td><code>explain()</code> ke saath compliance report</td></tr></table>

<div class="note"><p><b>Aage kya.</b> <code>adv-nornir</code> is module ke tasks ko poore fleet par parallel chalata hai: <code>nornir_napalm</code> mein getter task aur built-in dry run wala configure task hai. <code>adv-netbox</code> inventory dega, aur <code>adv-verify</code> device ko chhoone se pehle change check karta hai. Jo code aapne yahan likha woh wahi unit hai jise ye modules bulate hain.</p></div>

<div class="warn"><p><b>Aakhri yaad-dehaaniyan.</b> NAPALM padhna normalise karta hai, configuration syntax nahi. Replace ko diff-size guard chahiye. Skipped rule woh rule hai jo chala hi nahi. Asli passwords kabhi Git ki file mein mat rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek hi method naam alag drivers par alag matlab rakh sakta hai: <code>commit_config(revert_in=...)</code> Junos par chalta hai aur lab IOS driver par <code>NotImplementedError</code> uthata hai. Hamesha batao kaunsa driver.</p></div>

<div class="scn"><h4>Change window jo jaldi khatam hua</h4><p>Ek team ne is module ke pattern se 120 devices par ek window mein NTP badla: ticket ke saath dry run, Junos par confirmed commits ke saath apply, kuch bacha nahi dikhane ke liye doosra run, aur ant mein strict mode ke saath compliance run. Window 40 minute jaldi band hui kyunki doosra run aur report hi sign-off the.</p><p><b>Lesson:</b> pehle ka diff, baad ki report aur exit codes change ko auditable banate hain.</p></div>

<div class="iv"><p class="q">"NAPALM se configuration change safely roll out karne ka summary do."</p><p>Har device par dry run aur diffs ticket mein lagana, review, jahan platform mein ho wahan device-side timer ke saath apply, naye session se getters se verify, fail par roll back, khaali diff saabit karne ke liye tool dobara chalana, aur ant mein strict mode ki compliance report jiska exit code sign-off ko gate kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connect, read, change, check; aur hamesha wapas ka raasta.</li>
<li>Reading normalised hai; configuration text aur features driver ke hisaab se hain.</li>
<li>Diff aapka review hai; khaali diff aapka saboot.</li>
<li>Compliance woh dhoondhta hai jo merge kabhi nahi dekh sakta.</li>
<li>Aage: <code>adv-nornir</code> mein ise fleet par chalao.</li></ul></div>`}};export{e as default};