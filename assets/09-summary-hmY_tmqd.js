var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a blank prompt. You can now open a Junos device, change it safely, undo mistakes and prove that the change worked. This chapter is your revision sheet for the JNCIA-Junos (JN0-106) User Interfaces objectives.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module summary flow">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="13">configure</text><text x="65" y="86" text-anchor="middle" class="svg-muted" font-size="11">mode</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="195" y="68" text-anchor="middle" class="svg-ink" font-size="13">set / delete</text><text x="195" y="86" text-anchor="middle" class="svg-muted" font-size="11">candidate</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="13">| compare</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="11">review</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="455" y="68" text-anchor="middle" class="svg-ink" font-size="13">commit</text><text x="455" y="86" text-anchor="middle" class="svg-muted" font-size="11">confirmed</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="68" text-anchor="middle" class="svg-ink" font-size="13">rollback</text><text x="580" y="86" text-anchor="middle" class="svg-muted" font-size="11">undo</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="70" x2="140" y2="70"/><line x1="250" y1="70" x2="270" y2="70"/><line x1="380" y1="70" x2="400" y2="70"/><line x1="510" y1="70" x2="530" y2="70"/></g>
</svg><p class="cap">The whole module in one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain candidate versus active configuration and the roles of the RE and PFE.</li>
<li>Tell operational mode (<code>&gt;</code>) from configuration mode (<code>#</code>) and use <code>configure</code>, <code>exit</code>, <code>run</code>.</li>
<li>Navigate with <code>edit</code>, <code>up</code>, <code>top</code>, <code>?</code>, Tab and read the <code>[edit]</code> line.</li>
<li>Edit with <code>set</code>, <code>delete</code>, <code>rename</code>, <code>deactivate</code>, <code>activate</code>, <code>annotate</code>.</li>
<li>Review with <code>show | compare</code>, validate with <code>commit check</code>, commit with a comment.</li>
<li>Protect remote access with <code>commit confirmed N</code> and undo with <code>rollback</code>.</li>
<li>Filter output with <code>match</code>, <code>except</code>, <code>count</code>, <code>last</code>, <code>no-more</code>, <code>display set</code>.</li>
<li>Save, load and compare configuration with <code>save</code>, <code>load merge/override/set</code>.</li>
<li>Use the commit history to find who changed what and recover.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Candidate configuration</dt><dd>Editable draft changed by set and delete.</dd>
<dt>Active configuration</dt><dd>The configuration the device is running (rollback 0).</dd>
<dt>Commit</dt><dd>Validate the candidate and make it active; the old one becomes rollback 1.</dd>
<dt>Rollback</dt><dd>Load a saved configuration (0 to 49) into the candidate.</dd>
<dt>RE / PFE</dt><dd>Routing Engine (control plane) and Packet Forwarding Engine (forwarding plane).</dd>
<dt>Hierarchy</dt><dd>The tree of configuration statements; [edit] shows the position.</dd>
<dt>Pipe</dt><dd>The | character that filters or reformats command output.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Running configuration</td><td>Active, never the candidate</td></tr>
<tr><td>Rollback files kept</td><td>50 (rollback 0 to 49)</td></tr>
<tr><td>What stops commit confirmed rollback</td><td>Another commit within the timer</td></tr>
<tr><td>Does rollback 1 change the device?</td><td>No, only the candidate until commit</td></tr>
<tr><td>Run an operational command in configuration mode</td><td><code>run</code></td></tr>
<tr><td>Show differences before commit</td><td><code>show | compare</code></td></tr>
<tr><td>Set-format display</td><td><code>show | display set</code></td></tr>
<tr><td>Replace whole candidate with a file</td><td><code>load override</code></td></tr>
<tr><td>Commit history</td><td><code>show system commit</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">configure | configure private | exit | top | up | edit &lt;level&gt;
set / delete / rename / deactivate / activate / annotate
show | compare        commit check        commit comment "text"
commit confirmed 5    commit and-quit     rollback 0 | 1
show system commit    show system rollback 1 compare 0
show interfaces terse show route          show log messages | last 20
show configuration | display set | save /var/tmp/file
load merge | load override | load set terminal</pre>

<div class="warn"><p><b>Last reminders.</b> Always compare before commit; use <code>commit confirmed</code> when your own path may be cut; remember that rollback needs a commit.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> Candidate versus active; rollback loads into candidate only; <code>deactivate</code> is not <code>delete</code>; a second <code>set</code> on an address adds a second address.</p></div>

<div class="scn"><h4>A calm Monday</h4><p>A new engineer joined the NOC. On day one he renumbered a branch uplink with <code>commit confirmed</code>, confirmed after a ping, wrote a commit comment and saved a copy of the configuration. On day two a colleague broke OSPF; he found the change in <code>show system commit</code> in two minutes. None of the actions needed senior help.</p><p><b>Lesson:</b> the Junos commit model rewards discipline: edit, compare, confirm, comment.</p></div>

<div class="iv"><p class="q">"Describe your normal workflow for a configuration change on Junos."</p><p>I enter configuration mode, make the change, review it with <code>show | compare</code>, run <code>commit check</code>, then <code>commit confirmed</code> with a comment if the path could be affected. I verify with show commands and ping, confirm with a second commit, and keep a rollback or rescue configuration as a safety net.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edit candidate, compare, commit; the active configuration is what runs.</li>
<li>commit confirmed and rollback are the safety nets; rollback needs a commit.</li>
<li>Pipes, display formats and the commit history speed up daily work.</li>
<li>Think layers and "what changed" when troubleshooting.</li>
<li>Next: the Initial setup module covers first commit, users, interfaces and groups.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module khaali prompt se shuru kiya tha. Ab aap Junos device khol sakte ho, use safely badal sakte ho, galtiyan undo kar sakte ho aur saabit kar sakte ho ki change chala. Yeh chapter JNCIA-Junos (JN0-106) ke User Interfaces objectives ki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module summary flow">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="13">configure</text><text x="65" y="86" text-anchor="middle" class="svg-muted" font-size="11">mode</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="195" y="68" text-anchor="middle" class="svg-ink" font-size="13">set / delete</text><text x="195" y="86" text-anchor="middle" class="svg-muted" font-size="11">candidate</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="13">| compare</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="11">review</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="455" y="68" text-anchor="middle" class="svg-ink" font-size="13">commit</text><text x="455" y="86" text-anchor="middle" class="svg-muted" font-size="11">confirmed</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="68" text-anchor="middle" class="svg-ink" font-size="13">rollback</text><text x="580" y="86" text-anchor="middle" class="svg-muted" font-size="11">undo</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="70" x2="140" y2="70"/><line x1="250" y1="70" x2="270" y2="70"/><line x1="380" y1="70" x2="400" y2="70"/><line x1="510" y1="70" x2="530" y2="70"/></g>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Candidate versus active configuration aur RE aur PFE ke roles samjhao.</li>
<li>Operational mode (<code>&gt;</code>) aur configuration mode (<code>#</code>) alag pehchano aur <code>configure</code>, <code>exit</code>, <code>run</code> use karo.</li>
<li><code>edit</code>, <code>up</code>, <code>top</code>, <code>?</code>, Tab se navigate karo aur <code>[edit]</code> line padho.</li>
<li><code>set</code>, <code>delete</code>, <code>rename</code>, <code>deactivate</code>, <code>activate</code>, <code>annotate</code> se edit karo.</li>
<li><code>show | compare</code> se review, <code>commit check</code> se validate, comment ke saath commit karo.</li>
<li>Remote access ko <code>commit confirmed N</code> se bachao aur <code>rollback</code> se undo karo.</li>
<li>Output ko <code>match</code>, <code>except</code>, <code>count</code>, <code>last</code>, <code>no-more</code>, <code>display set</code> se filter karo.</li>
<li>Configuration ko <code>save</code>, <code>load merge/override/set</code> se save, load aur compare karo.</li>
<li>Commit history se pata karo kisne kya badla aur recover karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Candidate configuration</dt><dd>Editable draft jo set aur delete se badalta hai.</dd>
<dt>Active configuration</dt><dd>Jo configuration device chala raha hai (rollback 0).</dd>
<dt>Commit</dt><dd>Candidate ko validate karke active banana; purana rollback 1 ban jaata hai.</dd>
<dt>Rollback</dt><dd>Saved configuration (0 se 49) ko candidate mein load karna.</dd>
<dt>RE / PFE</dt><dd>Routing Engine (control plane) aur Packet Forwarding Engine (forwarding plane).</dd>
<dt>Hierarchy</dt><dd>Configuration statements ka tree; [edit] position batata hai.</dd>
<dt>Pipe</dt><dd>| character jo command output ko filter ya reformat karta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Running configuration</td><td>Active, kabhi candidate nahi</td></tr>
<tr><td>Rollback files kitni</td><td>50 (rollback 0 se 49)</td></tr>
<tr><td>commit confirmed rollback ko kya rokta hai</td><td>Timer ke andar dusra commit</td></tr>
<tr><td>Kya rollback 1 device badalta hai?</td><td>Nahi, commit tak sirf candidate</td></tr>
<tr><td>Configuration mode mein operational command</td><td><code>run</code></td></tr>
<tr><td>Commit se pehle differences</td><td><code>show | compare</code></td></tr>
<tr><td>Set-format display</td><td><code>show | display set</code></td></tr>
<tr><td>Poora candidate file se replace</td><td><code>load override</code></td></tr>
<tr><td>Commit history</td><td><code>show system commit</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">configure | configure private | exit | top | up | edit &lt;level&gt;
set / delete / rename / deactivate / activate / annotate
show | compare        commit check        commit comment "text"
commit confirmed 5    commit and-quit     rollback 0 | 1
show system commit    show system rollback 1 compare 0
show interfaces terse show route          show log messages | last 20
show configuration | display set | save /var/tmp/file
load merge | load override | load set terminal</pre>

<div class="warn"><p><b>Aakhri reminders.</b> Commit se pehle hamesha compare karo; apna raasta katne ka khatra ho to <code>commit confirmed</code> use karo; yaad rakho rollback ke liye commit chahiye.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> Candidate versus active; rollback sirf candidate mein load karta hai; <code>deactivate</code> aur <code>delete</code> alag hain; address par doosra <code>set</code> doosra address add karta hai.</p></div>

<div class="scn"><h4>Ek shaant Monday</h4><p>NOC mein ek naya engineer aaya. Pehle din usne <code>commit confirmed</code> se branch uplink renumber kiya, ping ke baad confirm kiya, commit comment likha aur configuration ki copy save ki. Doosre din colleague ne OSPF tod diya; usne <code>show system commit</code> mein change do minute mein dhoondh liya. Kisi bhi kaam ke liye senior ki madad nahi chahiye thi.</p><p><b>Lesson:</b> Junos commit model discipline ko reward karta hai: edit, compare, confirm, comment.</p></div>

<div class="iv"><p class="q">"Junos par configuration change ka aapka normal workflow batao."</p><p>Main configuration mode mein jaata hoon, change karta hoon, <code>show | compare</code> se review karta hoon, <code>commit check</code> chalata hoon, phir raasta prabhavit ho sakta ho to comment ke saath <code>commit confirmed</code>. Show commands aur ping se verify karta hoon, doosre commit se confirm karta hoon, aur safety net ke roop mein rollback ya rescue configuration rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Candidate edit karo, compare karo, commit karo; active configuration hi chalti hai.</li>
<li>commit confirmed aur rollback safety nets hain; rollback ke liye commit chahiye.</li>
<li>Pipes, display formats aur commit history roz ka kaam tez karte hain.</li>
<li>Troubleshooting mein layers aur "kya badla" socho.</li>
<li>Aage: Initial setup module first commit, users, interfaces aur groups sikhata hai.</li>
</ul></div>
`}};export{e as default};