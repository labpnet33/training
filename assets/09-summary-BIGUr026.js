var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>One idea in this chapter:</b> a role is a reusable, named unit of network standard. Everything else in this module is about keeping that unit small, parameterised, safe and findable.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module recap">
<rect x="15" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Role = recipe</text>
<rect x="165" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="230" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Fixed layout</text>
<rect x="315" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="390" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Templates inside</text>
<rect x="485" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Defaults vs vars</text>
<rect x="15" y="110" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="140" text-anchor="middle" class="svg-ink" font-size="12">5 Handlers, tags</text>
<rect x="165" y="110" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="230" y="140" text-anchor="middle" class="svg-ink" font-size="12">6 Reuse roles</text>
<rect x="315" y="110" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="390" y="140" text-anchor="middle" class="svg-ink" font-size="12">7 Repo layout</text>
<rect x="485" y="110" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="12">8 Vault, debug</text>
</svg><p class="cap">Eight ideas, one habit: small reusable roles with the data kept outside.</p></div>

<h3>What you can now do</h3>
<ul>
<li>Create a role with <code>ansible-galaxy role init --init-path roles nk_base</code> and explain each folder.</li>
<li>Move a baseline playbook into <code>tasks/main.yml</code>, <code>defaults/main.yml</code> and <code>handlers/main.yml</code>.</li>
<li>Render a Jinja2 template from <code>templates/</code> inside a role with per-device data.</li>
<li>Predict which value wins when the same variable is set in defaults, group_vars, host_vars and <code>-e</code>.</li>
<li>Trigger a handler with <code>notify</code>, and use <code>--list-tags</code>, <code>--tags</code> and <code>--skip-tags</code>.</li>
<li>List roles in a play, pass variables, add <code>when</code>, and declare a dependency in <code>meta/main.yml</code>.</li>
<li>Structure a repository with inventories per environment, playbooks and roles, and set <code>roles_path</code>.</li>
<li>Encrypt, view and rekey secrets with <code>ansible-vault</code>, and read the two vault errors.</li>
</ul>

<h3>The commands in one place</h3>
<pre class="code">ansible-galaxy role init --init-path roles nk_base   <span class="c"># create a role skeleton</span>
ansible-galaxy role list                              <span class="c"># roles Ansible can find</span>
ansible-playbook site.yml --list-tasks                <span class="c"># what would run</span>
ansible-playbook site.yml --list-tags                 <span class="c"># tags available</span>
ansible-playbook site.yml --tags ntp                  <span class="c"># only tagged tasks</span>
ansible-playbook site.yml --skip-tags logging         <span class="c"># everything except</span>
ansible-playbook site.yml --check --diff              <span class="c"># preview changes</span>
ansible-inventory --host pun-core-r1                  <span class="c"># variables a host really gets</span>
ansible-inventory --graph                             <span class="c"># groups and hosts</span>
ansible-vault encrypt group_vars/all/vault.yml        <span class="c"># protect a secret</span>
ansible-vault rekey host_vars/blr-edge-r2.yml         <span class="c"># change its password</span></pre>

<h3>Variable precedence, the short version</h3>
<p>From weakest to strongest for the places used in this module: role <code>defaults</code>, then inventory <code>group_vars</code>, then <code>host_vars</code>, then role <code>vars</code>, then <code>-e</code> on the command line. Put things you expect people to change in <code>defaults</code>; put fixed internals in <code>vars</code>; give role variables a prefix such as <code>nk_base_</code> so they do not collide.</p>

<h3>A pre-merge checklist for a role change</h3>
<ol>
<li>The role has one clear purpose and a README listing its variables.</li>
<li>Variables have safe defaults, or the role fails early with a clear message.</li>
<li>Tasks are idempotent: a second run shows no changes.</li>
<li>Handlers are named exactly as in <code>notify</code>.</li>
<li>No secret is in plain text, and the vault password file is git-ignored.</li>
<li>You ran it in the lab with <code>--check --diff</code> and read the diff.</li>
</ol>

<div class="warn"><p><b>Final reminders.</b> Do not edit a role per device; give it data instead. Do not store secrets in plain text. Do not run against production before a backup and a small <code>--limit</code> batch.</p></div>
<div class="exam"><p><b>Exam trap.</b> role defaults are the lowest precedence and are meant to be overridden; role vars are high and are not. A handler runs once at the end of the play, only if a task notified it by its exact name and reported changed.</p></div>

<div class="scn"><h4>First week on a shared repository</h4><p>A new engineer needed to change the syslog server for switches only. They did not edit the role: they added a value in the switches group_vars, ran <code>--check --diff</code> against the lab, read that only the switch showed a change, and opened a pull request with the output.</p><p><b>Lesson:</b> the role stayed generic and the change was one reviewable line of data.</p></div>

<div class="iv"><p class="q">"Why use roles instead of one long playbook?"</p><p>Roles give small, named, reusable units with a fixed layout, so the same standard can be applied to many groups and environments, tested in the lab and reviewed in pull requests. Variables stay outside, so changing a value never means editing tasks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Role = tasks, templates, defaults, vars, handlers in a fixed layout.</li>
<li>Data lives in inventories; logic lives in roles.</li>
<li>Know the precedence order and check with ansible-inventory --host.</li>
<li>Handlers run once, at the end, when notified and changed.</li>
<li>Vault protects secrets; read the first error line when troubleshooting.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> role network standard ki reusable, named unit hai. Is module ki baaki sab baatein us unit ko chhota, parameterised, surakshit aur dhoondhne layak rakhne ke baare mein hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module recap">
<rect x="15" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Role = recipe</text>
<rect x="165" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="230" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Fixed layout</text>
<rect x="315" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="390" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Andar templates</text>
<rect x="485" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Defaults vs vars</text>
<rect x="15" y="110" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="140" text-anchor="middle" class="svg-ink" font-size="12">5 Handlers, tags</text>
<rect x="165" y="110" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="230" y="140" text-anchor="middle" class="svg-ink" font-size="12">6 Roles reuse</text>
<rect x="315" y="110" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="390" y="140" text-anchor="middle" class="svg-ink" font-size="12">7 Repo layout</text>
<rect x="485" y="110" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="12">8 Vault, debug</text>
</svg><p class="cap">Aath ideas, ek aadat: chhote reusable roles aur data bahar.</p></div>

<h3>Ab aap kya kar sakte ho</h3>
<ul>
<li><code>ansible-galaxy role init --init-path roles nk_base</code> se role banao aur har folder samjhao.</li>
<li>Baseline playbook ko <code>tasks/main.yml</code>, <code>defaults/main.yml</code> aur <code>handlers/main.yml</code> mein move karo.</li>
<li>Role ke <code>templates/</code> se Jinja2 template per-device data ke saath render karo.</li>
<li>Bata do ki defaults, group_vars, host_vars aur <code>-e</code> mein ek hi variable ho to kaunsi value jeetegi.</li>
<li><code>notify</code> se handler chalao, aur <code>--list-tags</code>, <code>--tags</code>, <code>--skip-tags</code> use karo.</li>
<li>Play mein roles list karo, variables pass karo, <code>when</code> jodo, aur <code>meta/main.yml</code> mein dependency declare karo.</li>
<li>Har environment ke inventories, playbooks aur roles ke saath repository structure karo, aur <code>roles_path</code> set karo.</li>
<li><code>ansible-vault</code> se secrets encrypt, view aur rekey karo, aur do vault errors padho.</li>
</ul>

<h3>Commands ek jagah</h3>
<pre class="code">ansible-galaxy role init --init-path roles nk_base   <span class="c"># role skeleton banao</span>
ansible-galaxy role list                              <span class="c"># Ansible ko milne wale roles</span>
ansible-playbook site.yml --list-tasks                <span class="c"># kya chalega</span>
ansible-playbook site.yml --list-tags                 <span class="c"># available tags</span>
ansible-playbook site.yml --tags ntp                  <span class="c"># sirf tagged tasks</span>
ansible-playbook site.yml --skip-tags logging         <span class="c"># baaki sab</span>
ansible-playbook site.yml --check --diff              <span class="c"># changes ka preview</span>
ansible-inventory --host pun-core-r1                  <span class="c"># host ko asli mein milne wale variables</span>
ansible-inventory --graph                             <span class="c"># groups aur hosts</span>
ansible-vault encrypt group_vars/all/vault.yml        <span class="c"># secret surakshit karo</span>
ansible-vault rekey host_vars/blr-edge-r2.yml         <span class="c"># uska password badlo</span></pre>

<h3>Variable precedence, chhota version</h3>
<p>Is module mein aaye hue jagahon ke liye kamzor se taakatwar: role <code>defaults</code>, phir inventory <code>group_vars</code>, phir <code>host_vars</code>, phir role <code>vars</code>, phir command line ka <code>-e</code>. Jo cheezein log badlenge woh <code>defaults</code> mein; fixed internals <code>vars</code> mein; role variables ko <code>nk_base_</code> jaisa prefix do taaki takrayen nahi.</p>

<h3>Role change merge karne se pehle checklist</h3>
<ol>
<li>Role ka ek saaf purpose hai aur README mein variables listed hain.</li>
<li>Variables ke safe defaults hain, ya role saaf message ke saath jaldi fail hota hai.</li>
<li>Tasks idempotent hain: doosre run mein koi change nahi.</li>
<li>Handlers ke naam bilkul <code>notify</code> jaise hain.</li>
<li>Koi secret plain text mein nahi, aur vault password file git-ignored hai.</li>
<li>Lab mein <code>--check --diff</code> se chalaya aur diff padha.</li>
</ol>

<div class="warn"><p><b>Aakhri reminders.</b> Role ko device ke hisaab se edit mat karo; use data do. Secrets plain text mein mat rakho. Backup aur chhote <code>--limit</code> batch ke bina production par mat chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> role defaults sabse kam precedence ke hain aur override hone ke liye hi hain; role vars ooncha precedence rakhte hain aur override nahi hote. Handler play ke ant mein ek baar chalta hai, sirf tab jab kisi task ne use exact naam se notify kiya aur woh changed report hua.</p></div>

<div class="scn"><h4>Shared repository mein pehla hafta</h4><p>Naye engineer ko sirf switches ka syslog server badalna tha. Usne role edit nahi kiya: switches group_vars mein ek value jodi, lab par <code>--check --diff</code> chalaya, padha ki sirf switch par change dikha, aur output ke saath pull request kholi.</p><p><b>Lesson:</b> role generic raha aur change data ki ek reviewable line tha.</p></div>

<div class="iv"><p class="q">"Ek lambe playbook ke bajaye roles kyun?"</p><p>Roles fixed layout wali chhoti, named, reusable units dete hain, isliye wahi standard kai groups aur environments par lagaya, lab mein test kiya aur pull requests mein review kiya ja sakta hai. Variables bahar rehte hain, to value badalne ka matlab tasks edit karna nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Role = tasks, templates, defaults, vars, handlers fixed layout mein.</li>
<li>Data inventories mein, logic roles mein.</li>
<li>Precedence order jaano aur ansible-inventory --host se check karo.</li>
<li>Handler ek baar, ant mein chalta hai, jab notify aur changed ho.</li>
<li>Vault secrets bachata hai; troubleshooting mein pehli error line padho.</li>
</ul></div>
`}};export{e as default};