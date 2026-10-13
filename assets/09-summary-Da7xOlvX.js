var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>The whole module in one picture.</b> Data lives in group_vars and host_vars. A Jinja2 template turns data into text. The template module writes that text on the control node. ios_config pushes it. <code>--check --diff</code> previews it. Backups and a check run against the standard find drift.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Pipeline summary">
<rect x="8" y="30" width="96" height="50" rx="8" fill="#bae6fd"/><text x="56" y="60" text-anchor="middle" class="svg-ink" font-size="12">vars</text>
<rect x="124" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="172" y="60" text-anchor="middle" class="svg-ink" font-size="12">.j2</text>
<rect x="240" y="30" width="96" height="50" rx="8" fill="#ddd6fe"/><text x="288" y="60" text-anchor="middle" class="svg-ink" font-size="12">template</text>
<rect x="356" y="30" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="404" y="60" text-anchor="middle" class="svg-ink" font-size="12">ios_config</text>
<rect x="472" y="30" width="80" height="50" rx="8" fill="#fed7aa"/><text x="512" y="60" text-anchor="middle" class="svg-ink" font-size="12">verify</text>
<rect x="566" y="30" width="66" height="50" rx="8" fill="#e2e8f0"/><text x="599" y="60" text-anchor="middle" class="svg-ink" font-size="12">drift</text>
<line x1="104" y1="55" x2="124" y2="55" stroke="#64748b" stroke-width="2"/><line x1="220" y1="55" x2="240" y2="55" stroke="#64748b" stroke-width="2"/><line x1="336" y1="55" x2="356" y2="55" stroke="#64748b" stroke-width="2"/><line x1="452" y1="55" x2="472" y2="55" stroke="#64748b" stroke-width="2"/><line x1="552" y1="55" x2="566" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">From data to a verified device, and back to drift checks.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain the three Jinja2 markers and what each prints or does.</li>
<li>I can write a template that uses variables, a for loop over a list of dictionaries, and an if / elif / else block.</li>
<li>I can make optional data safe with <code>is defined</code> and <code>default()</code>.</li>
<li>I can chain filters: <code>map</code>, <code>join</code>, <code>sort</code>, <code>selectattr</code>, <code>difference</code>, <code>ipaddr</code>.</li>
<li>I can render files on the control node with <code>template</code> and <code>delegate_to: localhost</code>, creating the folder first.</li>
<li>I can push a template with <code>ios_config src</code> and save with <code>save_when: modified</code>.</li>
<li>I can read a <code>--check --diff</code> output and say which lines will change.</li>
<li>I can take dated backups and find a drifted device.</li>
<li>I can remove old lines idempotently with read, filter and loop.</li>
<li>I can troubleshoot a failed render from its message alone.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>A text file with Jinja2 markers; one pattern for many devices.</dd>
<dt>Jinja2</dt><dd>The template language used by Ansible.</dd>
<dt>Render</dt><dd>Fill a template with variables to produce plain text.</dd>
<dt>group_vars / host_vars</dt><dd>Folders of variable files for a group of hosts or a single host.</dd>
<dt>Filter</dt><dd>A function applied with the pipe sign to change a value.</dd>
<dt>delegate_to</dt><dd>Run a task on another machine (here the control node) using this host's variables.</dd>
<dt>Check mode</dt><dd>A dry run that sends no changes. <code>--diff</code> shows the lines.</dd>
<dt>Drift</dt><dd>A device configuration that no longer matches the standard.</dd>
<dt>Idempotent</dt><dd>Running again changes nothing once the goal state is reached.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li><code>{{ }}</code> prints, <code>{% %}</code> runs statements, <code>{# #}</code> is a comment.</li>
<li>Templates are rendered on the control node, never on the router.</li>
<li>Undefined variables raise an error in Ansible; default() gives a fallback.</li>
<li>loop.index starts at 1; loop.index0 at 0; loop.last is true on the final pass.</li>
<li>ios_config only adds lines. A "no" line in <code>lines</code> is always reported as changed.</li>
<li>--syntax-check does not catch Jinja2 errors in templates; rendering does.</li>
<li>difference keeps what is in the first list and not in the second.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code">ansible-playbook preview.yml -e tpl=cond.j2 --limit pun-core-r1   <span class="c"># render one template, one host</span>
ansible-inventory --host pun-core-r1                              <span class="c"># variables the template sees</span>
ansible-playbook render.yml --check --diff                        <span class="c"># preview, change nothing</span>
ansible-playbook render.yml                                       <span class="c"># apply</span>
ansible-playbook backup.yml                                       <span class="c"># dated backups</span>
ansible-playbook baseline.yml --check --diff                      <span class="c"># drift report</span></pre>

<div class="warn"><p><b>Last reminders.</b> Never edit generated files by hand. Never run a mass change without a backup and a diff. Never put secrets in a template or a plain host file; module 5 shows Ansible Vault.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question says "which module copies a file with variables replaced", the answer is template. If it says "which flag shows the lines that would change", the answer is --diff (with --check to avoid applying).</p></div>

<div class="scn"><h4>Day one at a new company</h4><p>A new engineer was asked to add a second syslog server to every device before lunch. They edited one variable, rendered the files, read three of them, ran <code>--check --diff</code>, pasted the output into the ticket, and applied after approval. A second run showed no changes. The whole job was short, and the rollback plan was the dated backup taken before the run.</p><p><b>Lesson:</b> the workflow is the skill: data, template, preview, apply, verify, back up.</p></div>

<div class="iv"><p class="q">"Walk me through generating device configs with Ansible."</p><p>Variables in group_vars and host_vars describe each device. A Jinja2 template with loops, conditions and filters turns them into text. The template module renders it on the controller, I review the files, preview with --check --diff, push with ios_config src and save_when: modified, then verify and re-run to confirm no changes. Backups give me a rollback and a drift check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data, template, render, preview, push, verify: always in that order.</li>
<li>Loops handle lists; conditions handle differences between devices.</li>
<li>Filters reshape data so the template stays short.</li>
<li>Check mode against the standard is your drift detector.</li>
<li>Next: module 5 packages all this into roles and protects passwords with Vault.</li>
</ul></div>
`,hi:`
<p><b>Poora module ek picture mein.</b> Data group_vars aur host_vars mein rehta hai. Jinja2 template data ko text mein badalta hai. template module us text ko control node par likhta hai. ios_config use push karta hai. <code>--check --diff</code> use preview karta hai. Backups aur standard ke against check run drift dhoondhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Pipeline summary">
<rect x="8" y="30" width="96" height="50" rx="8" fill="#bae6fd"/><text x="56" y="60" text-anchor="middle" class="svg-ink" font-size="12">vars</text>
<rect x="124" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="172" y="60" text-anchor="middle" class="svg-ink" font-size="12">.j2</text>
<rect x="240" y="30" width="96" height="50" rx="8" fill="#ddd6fe"/><text x="288" y="60" text-anchor="middle" class="svg-ink" font-size="12">template</text>
<rect x="356" y="30" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="404" y="60" text-anchor="middle" class="svg-ink" font-size="12">ios_config</text>
<rect x="472" y="30" width="80" height="50" rx="8" fill="#fed7aa"/><text x="512" y="60" text-anchor="middle" class="svg-ink" font-size="12">verify</text>
<rect x="566" y="30" width="66" height="50" rx="8" fill="#e2e8f0"/><text x="599" y="60" text-anchor="middle" class="svg-ink" font-size="12">drift</text>
<line x1="104" y1="55" x2="124" y2="55" stroke="#64748b" stroke-width="2"/><line x1="220" y1="55" x2="240" y2="55" stroke="#64748b" stroke-width="2"/><line x1="336" y1="55" x2="356" y2="55" stroke="#64748b" stroke-width="2"/><line x1="452" y1="55" x2="472" y2="55" stroke="#64748b" stroke-width="2"/><line x1="552" y1="55" x2="566" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Data se verified device tak, aur wapas drift checks tak.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main teen Jinja2 markers samjha sakta hoon ki har ek kya print karta hai ya karta hai.</li>
<li>Main aisa template likh sakta hoon jo variables, dictionaries ki list par for loop, aur if / elif / else block use kare.</li>
<li>Main optional data ko <code>is defined</code> aur <code>default()</code> se surakshit bana sakta hoon.</li>
<li>Main filters chain kar sakta hoon: <code>map</code>, <code>join</code>, <code>sort</code>, <code>selectattr</code>, <code>difference</code>, <code>ipaddr</code>.</li>
<li>Main <code>template</code> aur <code>delegate_to: localhost</code> se control node par files render kar sakta hoon, folder pehle banakar.</li>
<li>Main <code>ios_config src</code> se template push aur <code>save_when: modified</code> se save kar sakta hoon.</li>
<li>Main <code>--check --diff</code> output padh kar bata sakta hoon ki kaunsi lines badlengi.</li>
<li>Main date wale backups le sakta hoon aur drifted device dhoondh sakta hoon.</li>
<li>Main purani lines idempotent tareeke se hata sakta hoon: padho, filter karo, loop karo.</li>
<li>Main fail hue render ko sirf uske message se troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>Jinja2 markers wali text file; kai devices ke liye ek pattern.</dd>
<dt>Jinja2</dt><dd>Ansible ki template language.</dd>
<dt>Render</dt><dd>Template ko variables se bharkar plain text banana.</dd>
<dt>group_vars / host_vars</dt><dd>Hosts ke group ya ek host ke variable files ke folders.</dd>
<dt>Filter</dt><dd>Pipe sign se lagne wala function jo value badalta hai.</dd>
<dt>delegate_to</dt><dd>Task ko doosri machine (yahan control node) par is host ke variables se chalana.</dd>
<dt>Check mode</dt><dd>Dry run jo koi change nahi bhejta. <code>--diff</code> lines dikhata hai.</dd>
<dt>Drift</dt><dd>Aisa device configuration jo ab standard se match nahi karta.</dd>
<dt>Idempotent</dt><dd>Goal state pahunchne ke baad dobara chalane par kuch nahi badalta.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li><code>{{ }}</code> print karta hai, <code>{% %}</code> statements chalata hai, <code>{# #}</code> comment hai.</li>
<li>Templates control node par render hote hain, router par kabhi nahi.</li>
<li>Ansible mein undefined variable error deta hai; default() fallback deta hai.</li>
<li>loop.index 1 se shuru hota hai; loop.index0 0 se; loop.last aakhri pass par true hota hai.</li>
<li>ios_config sirf lines jodta hai. <code>lines</code> mein "no" line hamesha changed report hoti hai.</li>
<li>--syntax-check template ke Jinja2 errors nahi pakadta; rendering pakadti hai.</li>
<li>difference woh rakhta hai jo pehli list mein hai aur doosri mein nahi.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code">ansible-playbook preview.yml -e tpl=cond.j2 --limit pun-core-r1   <span class="c"># ek template, ek host render</span>
ansible-inventory --host pun-core-r1                              <span class="c"># jo variables template dekhta hai</span>
ansible-playbook render.yml --check --diff                        <span class="c"># preview, kuch nahi badalta</span>
ansible-playbook render.yml                                       <span class="c"># apply</span>
ansible-playbook backup.yml                                       <span class="c"># date wale backups</span>
ansible-playbook baseline.yml --check --diff                      <span class="c"># drift report</span></pre>

<div class="warn"><p><b>Aakhri reminders.</b> Generated files kabhi haath se edit mat karo. Backup aur diff ke bina mass change kabhi mat chalao. Secrets ko template ya plain host file mein kabhi mat daalo; module 5 Ansible Vault dikhata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal kahe "kaunsa module variables replace karke file copy karta hai", jawab template hai. Kahe "kaunsa flag woh lines dikhata hai jo badlengi", jawab --diff hai (--check ke saath taaki apply na ho).</p></div>

<div class="scn"><h4>Naye company mein pehla din</h4><p>Naye engineer ko lunch se pehle har device par doosra syslog server jodne ko kaha gaya. Usne ek variable badla, files render ki, teen padhi, <code>--check --diff</code> chalaya, output ticket mein paste kiya, aur approval ke baad apply kiya. Doosre run ne koi change nahi dikhaya. Poora kaam chhota raha, aur rollback plan run se pehle liya hua date wala backup tha.</p><p><b>Lesson:</b> workflow hi skill hai: data, template, preview, apply, verify, backup.</p></div>

<div class="iv"><p class="q">"Ansible se device configs banane ka tareeka samjhao."</p><p>group_vars aur host_vars mein variables har device ko describe karte hain. Loops, conditions aur filters wala Jinja2 template unhe text mein badalta hai. template module use controller par render karta hai, main files review karta hoon, --check --diff se preview, ios_config src aur save_when: modified se push, phir verify aur re-run se confirm ki koi change nahi. Backups rollback aur drift check dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data, template, render, preview, push, verify: hamesha isi order mein.</li>
<li>Loops lists sambhalte hain; conditions devices ke antar sambhalti hain.</li>
<li>Filters data ka roop badalte hain taaki template chhota rahe.</li>
<li>Standard ke against check mode aapka drift detector hai.</li>
<li>Aage: module 5 yeh sab roles mein package karta hai aur passwords ko Vault se surakshit karta hai.</li>
</ul></div>
`}};export{e as default};