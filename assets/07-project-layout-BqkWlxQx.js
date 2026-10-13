var e={id:`project-layout`,h:{en:`Structuring a network automation repository`,hi:`Network automation repository ko structure karna`},body:{en:`
<p><b>One idea in this chapter:</b> as your automation grows, where files live matters as much as what is in them. A predictable layout lets a new engineer find the standard, the data and the playbooks in a minute, and lets lab and production share the same roles with different data.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Repository layout">
<rect x="20" y="15" width="190" height="200" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="38" class="svg-ink" font-size="13">netauto/ (the repository)</text>
<text x="40" y="65" class="svg-ink" font-size="12">ansible.cfg</text><text x="40" y="88" class="svg-ink" font-size="12">inventories/  lab, prod</text><text x="40" y="111" class="svg-ink" font-size="12">playbooks/    site.yml ...</text><text x="40" y="134" class="svg-ink" font-size="12">roles/        nk_base ...</text><text x="40" y="157" class="svg-ink" font-size="12">README.md</text><text x="40" y="180" class="svg-ink" font-size="12">.gitignore</text>
<rect x="260" y="30" width="170" height="40" rx="8" fill="#bae6fd"/><text x="345" y="55" text-anchor="middle" class="svg-ink" font-size="12">DATA: who and what values</text>
<rect x="260" y="85" width="170" height="40" rx="8" fill="#fde68a"/><text x="345" y="110" text-anchor="middle" class="svg-ink" font-size="12">ENTRY POINTS: what to run</text>
<rect x="260" y="140" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="345" y="165" text-anchor="middle" class="svg-ink" font-size="12">LOGIC: how to do it</text>
<line x1="205" y1="88" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="205" y1="111" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><line x1="205" y1="134" x2="260" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="450" y="55" class="svg-muted" font-size="12">inventories/</text><text x="450" y="110" class="svg-muted" font-size="12">playbooks/</text><text x="450" y="165" class="svg-muted" font-size="12">roles/</text>
</svg><p class="cap">Separate data, entry points and logic.</p></div>

<h3>Three questions every file answers</h3>
<ul>
<li><b>Data:</b> which devices exist and what values do they have? (inventory, group_vars, host_vars)</li>
<li><b>Entry points:</b> what do I run? (playbooks such as <code>site.yml</code>)</li>
<li><b>Logic:</b> how is each thing done? (roles)</li>
</ul>
<p>If you keep these three apart, the same logic can serve the lab and the production network, and a change to a value never means editing a task.</p>

<h3>From a flat folder to a structured one</h3>
<p>Our project started flat: <code>inventory.yml</code>, <code>group_vars/</code>, <code>host_vars/</code> and <code>site.yml</code> sat in the project root next to the roles:</p>
<pre class="out">netadmin@auto01:~/netauto$ ls -R . | head -8
.:
ansible.cfg  baseline.yml  group_vars  host_vars  inventory.yml  roles  site.yml

./group_vars:
all.yml

./host_vars:
blr-edge-r2.yml  pun-core-r1.yml</pre>
<p>A second environment would need a second copy of all of that. Instead we move the data of the lab into an <b>environment folder</b> and tell Ansible where things are:</p>
<pre class="code">mkdir -p inventories/lab inventories/prod playbooks
mv inventory.yml inventories/lab/hosts.yml
mv group_vars inventories/lab/group_vars
mv host_vars  inventories/lab/host_vars
mv site.yml   playbooks/site.yml</pre>
<pre class="code"><span class="c"># ansible.cfg  (now points at the lab environment and the shared roles)</span>
[defaults]
inventory = inventories/lab
roles_path = roles
host_key_checking = False</pre>
<ul>
<li><code>inventory = inventories/lab</code> makes a whole folder the inventory. Ansible reads the hosts file and the <code>group_vars/</code> and <code>host_vars/</code> that sit beside it.</li>
<li><code>roles_path = roles</code> matters now: the playbook lives in <code>playbooks/</code>, so the roles are no longer next to it. Without this line Ansible would not find <code>nk_base</code>.</li>
<li>To work on production later you pass <code>-i inventories/prod</code>, and nothing else changes.</li>
</ul>
<p>Prove that nothing broke:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-inventory --graph
@all:
  |--@routers:
  |  |--pun-core-r1
  |  |--blr-edge-r2
  |--@switches:
  |  |--pun-acc-sw1

netadmin@auto01:~/netauto$ ansible-playbook playbooks/site.yml --list-tasks
playbook: playbooks/site.yml

  play #1 (routers): Routers	TAGS: []
    tasks:
      nk_base : NTP servers	TAGS: [ntp]
      nk_base : Syslog host	TAGS: [logging]
      nk_loopback : Render and push Loopback0	TAGS: [loopback]

netadmin@auto01:~/netauto$ ls -R . | head -12
.:
ansible.cfg  baseline.yml  inventories  playbooks  roles

./inventories:
lab  prod

./inventories/lab:
group_vars  host_vars  hosts.yml</pre>
<p>The graph is the same, the tasks are found, and the real run behaves as before. The structure changed; the behaviour did not. That is how a refactor should look.</p>

<h3>Rules that keep a repository healthy</h3>
<ol>
<li><b>One entry point per goal.</b> <code>site.yml</code> for the whole standard, small playbooks for jobs such as backup or a one-off rollout.</li>
<li><b>Small roles with one purpose</b> and a README that lists variables.</li>
<li><b>Group files named after groups</b> (<code>routers.yml</code>, <code>switches.yml</code>); host files named exactly like the inventory host.</li>
<li><b>Secrets are never in plain text.</b> Use Ansible Vault (next chapter) and keep the password file out of Git.</li>
<li><b>Generated and private files stay out of Git:</b> rendered <code>configs/</code>, <code>backup/</code> output and <code>.vault_pass</code> belong in <code>.gitignore</code>.</li>
<li><b>Review by pull request.</b> Every change to a role or a variable is a diff somebody else reads.</li>
</ol>
<p><b>Reference configuration (not run in the simulator):</b> a typical larger layout, with a collections file so everyone installs the same versions.</p>
<pre class="code">netauto/
  ansible.cfg
  requirements.yml          <span class="c"># collections to install, with versions</span>
  .gitignore                <span class="c"># .vault_pass, configs/, backup/</span>
  README.md
  inventories/
    lab/   hosts.yml  group_vars/  host_vars/
    prod/  hosts.yml  group_vars/  host_vars/
  playbooks/
    site.yml  backup.yml  baseline.yml
  roles/
    nk_base/  nk_loopback/  nk_snmp/</pre>

<h3>A safe change process on top of the layout</h3>
<p>Branch in Git, change a role or a variable, run against <code>inventories/lab</code> with <code>--check --diff</code>, open a pull request with that output attached, merge after review, then run against production in a small batch with <code>--limit</code> and a dated backup first. Notice how many of the steps are the ones you already know from module 4.</p>

<div class="warn"><p><b>Common mistakes.</b> Copying the whole repository for each environment; leaving roles outside <code>roles_path</code> after moving playbooks; putting production data in the lab inventory (or the reverse); committing <code>.vault_pass</code> or rendered configs that contain secrets.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible.cfg</code> in the project folder is picked up automatically when you run from that folder. <code>-i</code> on the command line overrides its <code>inventory</code> setting.</p></div>

<div class="scn"><h4>Lab data pushed to production</h4><p>A team kept one inventory with both lab and production hosts, distinguished only by a group name. An engineer ran the playbook with the wrong limit and the lab NTP address reached a live router. After splitting the data into <code>inventories/lab</code> and <code>inventories/prod</code>, each run had to name its environment, and the prompt in the change procedure said which one.</p><p><b>Lesson:</b> separate environments by folder so a mistake needs two deliberate errors.</p></div>

<div class="iv"><p class="q">"How do you structure an Ansible repository for a network team?"</p><p>I separate data (inventories per environment with group_vars and host_vars), entry points (playbooks) and logic (roles). ansible.cfg sets the default inventory and roles_path. Secrets are vaulted and the vault password file is git-ignored. Changes go through pull requests with check-mode output.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keep data, entry points and logic in separate folders.</li>
<li>One inventories/ folder per environment; roles are shared.</li>
<li>Set inventory and roles_path in ansible.cfg after moving files.</li>
<li>Name group_vars files after groups and host_vars files after hosts.</li>
<li>Keep secrets, rendered configs and backups out of Git.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> automation badhne par files kahan rehti hain, yeh utna hi matter karta hai jitna unke andar kya hai. Predictable layout se naya engineer ek minute mein standard, data aur playbooks dhoondh leta hai, aur lab aur production alag data ke saath wahi roles share kar sakte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Repository layout">
<rect x="20" y="15" width="190" height="200" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="38" class="svg-ink" font-size="13">netauto/ (repository)</text>
<text x="40" y="65" class="svg-ink" font-size="12">ansible.cfg</text><text x="40" y="88" class="svg-ink" font-size="12">inventories/  lab, prod</text><text x="40" y="111" class="svg-ink" font-size="12">playbooks/    site.yml ...</text><text x="40" y="134" class="svg-ink" font-size="12">roles/        nk_base ...</text><text x="40" y="157" class="svg-ink" font-size="12">README.md</text><text x="40" y="180" class="svg-ink" font-size="12">.gitignore</text>
<rect x="260" y="30" width="170" height="40" rx="8" fill="#bae6fd"/><text x="345" y="55" text-anchor="middle" class="svg-ink" font-size="12">DATA: kaun aur kya values</text>
<rect x="260" y="85" width="170" height="40" rx="8" fill="#fde68a"/><text x="345" y="110" text-anchor="middle" class="svg-ink" font-size="12">ENTRY POINTS: kya chalana hai</text>
<rect x="260" y="140" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="345" y="165" text-anchor="middle" class="svg-ink" font-size="12">LOGIC: kaise karna hai</text>
<line x1="205" y1="88" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="205" y1="111" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><line x1="205" y1="134" x2="260" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="450" y="55" class="svg-muted" font-size="12">inventories/</text><text x="450" y="110" class="svg-muted" font-size="12">playbooks/</text><text x="450" y="165" class="svg-muted" font-size="12">roles/</text>
</svg><p class="cap">Data, entry points aur logic ko alag rakho.</p></div>

<h3>Har file teen sawalon ka jawab deti hai</h3>
<ul>
<li><b>Data:</b> kaun se devices hain aur unki values kya hain? (inventory, group_vars, host_vars)</li>
<li><b>Entry points:</b> main kya chalaun? (playbooks jaise <code>site.yml</code>)</li>
<li><b>Logic:</b> har cheez kaise hoti hai? (roles)</li>
</ul>
<p>In teeno ko alag rakho to wahi logic lab aur production network dono ko serve kar sakta hai, aur value badalne ka matlab kabhi task edit karna nahi hota.</p>

<h3>Flat folder se structured folder tak</h3>
<p>Hamara project flat shuru hua: <code>inventory.yml</code>, <code>group_vars/</code>, <code>host_vars/</code> aur <code>site.yml</code> project root mein roles ke saath the:</p>
<pre class="out">netadmin@auto01:~/netauto$ ls -R . | head -8
.:
ansible.cfg  baseline.yml  group_vars  host_vars  inventory.yml  roles  site.yml

./group_vars:
all.yml

./host_vars:
blr-edge-r2.yml  pun-core-r1.yml</pre>
<p>Doosre environment ke liye is sab ki doosri copy chahiye hoti. Uske bajaye hum lab ka data <b>environment folder</b> mein le jaate hain aur Ansible ko batate hain ki cheezein kahan hain:</p>
<pre class="code">mkdir -p inventories/lab inventories/prod playbooks
mv inventory.yml inventories/lab/hosts.yml
mv group_vars inventories/lab/group_vars
mv host_vars  inventories/lab/host_vars
mv site.yml   playbooks/site.yml</pre>
<pre class="code"><span class="c"># ansible.cfg  (ab lab environment aur shared roles ko point karta hai)</span>
[defaults]
inventory = inventories/lab
roles_path = roles
host_key_checking = False</pre>
<ul>
<li><code>inventory = inventories/lab</code> poore folder ko inventory bana deta hai. Ansible hosts file aur uske bagal ke <code>group_vars/</code> aur <code>host_vars/</code> padhta hai.</li>
<li><code>roles_path = roles</code> ab matter karta hai: playbook <code>playbooks/</code> mein hai, isliye roles ab uske bagal mein nahi. Is line ke bina Ansible <code>nk_base</code> nahi dhoondh paata.</li>
<li>Baad mein production par kaam ke liye <code>-i inventories/prod</code> do, aur kuch nahi badalta.</li>
</ul>
<p>Sabit karo ki kuch toota nahi:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-inventory --graph
@all:
  |--@routers:
  |  |--pun-core-r1
  |  |--blr-edge-r2
  |--@switches:
  |  |--pun-acc-sw1

netadmin@auto01:~/netauto$ ansible-playbook playbooks/site.yml --list-tasks
playbook: playbooks/site.yml

  play #1 (routers): Routers	TAGS: []
    tasks:
      nk_base : NTP servers	TAGS: [ntp]
      nk_base : Syslog host	TAGS: [logging]
      nk_loopback : Render and push Loopback0	TAGS: [loopback]

netadmin@auto01:~/netauto$ ls -R . | head -12
.:
ansible.cfg  baseline.yml  inventories  playbooks  roles

./inventories:
lab  prod

./inventories/lab:
group_vars  host_vars  hosts.yml</pre>
<p>Graph wahi hai, tasks mil rahe hain, aur asli run pehle jaisa chalta hai. Structure badla; behaviour nahi. Refactor aisa hi dikhna chahiye.</p>

<h3>Repository ko swasth rakhne ke rules</h3>
<ol>
<li><b>Har goal ke liye ek entry point.</b> Poore standard ke liye <code>site.yml</code>, backup ya one-off rollout jaise jobs ke liye chhote playbooks.</li>
<li><b>Ek purpose wale chhote roles</b> aur variables ki list wali README.</li>
<li><b>Group files group ke naam par</b> (<code>routers.yml</code>, <code>switches.yml</code>); host files bilkul inventory host ke naam par.</li>
<li><b>Secrets kabhi plain text mein nahi.</b> Ansible Vault use karo (agla chapter) aur password file ko Git se bahar rakho.</li>
<li><b>Generated aur private files Git se bahar:</b> rendered <code>configs/</code>, <code>backup/</code> output aur <code>.vault_pass</code> <code>.gitignore</code> mein jaate hain.</li>
<li><b>Pull request se review.</b> Role ya variable ka har change ek diff hai jo koi aur padhta hai.</li>
</ol>
<p><b>Reference configuration (not run in the simulator):</b> typical bada layout, collections file ke saath taaki sab same versions install karein.</p>
<pre class="code">netauto/
  ansible.cfg
  requirements.yml          <span class="c"># install hone wale collections, versions ke saath</span>
  .gitignore                <span class="c"># .vault_pass, configs/, backup/</span>
  README.md
  inventories/
    lab/   hosts.yml  group_vars/  host_vars/
    prod/  hosts.yml  group_vars/  host_vars/
  playbooks/
    site.yml  backup.yml  baseline.yml
  roles/
    nk_base/  nk_loopback/  nk_snmp/</pre>

<h3>Layout ke upar surakshit change process</h3>
<p>Git mein branch banao, role ya variable badlo, <code>inventories/lab</code> par <code>--check --diff</code> se chalao, us output ke saath pull request kholo, review ke baad merge karo, phir production par <code>--limit</code> se chhote batch mein aur pehle date wale backup ke saath chalao. Dekho kitne steps woh hain jo aap module 4 se jaante ho.</p>

<div class="warn"><p><b>Common mistakes.</b> Har environment ke liye poori repository copy karna; playbooks move karne ke baad roles ko <code>roles_path</code> ke bahar chhodna; production data lab inventory mein rakhna (ya ulta); <code>.vault_pass</code> ya secrets wali rendered configs commit karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Project folder ki <code>ansible.cfg</code> us folder se chalane par apne aap uthti hai. Command line ka <code>-i</code> uski <code>inventory</code> setting ko override karta hai.</p></div>

<div class="scn"><h4>Lab data production tak pahunch gaya</h4><p>Ek team ek hi inventory mein lab aur production hosts rakhti thi, sirf group naam se alag. Ek engineer ne galat limit ke saath playbook chalaya aur lab NTP address live router tak pahunch gaya. Data ko <code>inventories/lab</code> aur <code>inventories/prod</code> mein baantne ke baad har run ko apna environment naam dena padta tha, aur change procedure ka prompt batata tha kaunsa.</p><p><b>Lesson:</b> environments ko folder se alag karo taaki galti ke liye do jaan-boojhkar errors chahiye.</p></div>

<div class="iv"><p class="q">"Network team ke liye Ansible repository kaise structure karte ho?"</p><p>Main data (har environment ke inventories, group_vars aur host_vars ke saath), entry points (playbooks) aur logic (roles) ko alag karta hoon. ansible.cfg default inventory aur roles_path set karti hai. Secrets vault mein hain aur vault password file git-ignored hai. Changes check-mode output ke saath pull requests se jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data, entry points aur logic ko alag folders mein rakho.</li>
<li>Har environment ke liye ek inventories/ folder; roles shared.</li>
<li>Files move karne ke baad ansible.cfg mein inventory aur roles_path set karo.</li>
<li>group_vars files group ke naam par, host_vars files host ke naam par.</li>
<li>Secrets, rendered configs aur backups ko Git se bahar rakho.</li>
</ul></div>
`}};export{e as default};