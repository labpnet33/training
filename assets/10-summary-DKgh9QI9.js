var e={id:`summary`,h:{en:`Summary, glossary and exam checklist`,hi:`Summary, glossary aur exam checklist`},body:{en:`
<p><b>The idea of this chapter:</b> one page to revise the whole module. You started with Ansible that worked on one IOS router. You now run one project across <b>IOS XE, Junos and EOS</b>, choose the platform and the transport for each group, preview and prove changes, and diagnose connection failures from the message alone.</p>

<h3>Analogy: one conductor, three sections</h3>
<p>A conductor gives one score to the strings, the brass and the percussion. Each section reads it in its own way. Your playbook is the score; <code>ansible_network_os</code> picks the section, and the connection plugin is how the sound reaches the hall.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="One playbook, three platforms, three transports">
<rect x="10" y="50" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="70" y="72" text-anchor="middle" class="svg-ink" font-size="12">site.yml</text><text x="70" y="88" text-anchor="middle" class="svg-muted" font-size="10">one playbook</text>
<rect x="250" y="12" width="170" height="38" rx="8" fill="#bae6fd"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="12">ios: network_cli, 22</text>
<rect x="250" y="56" width="170" height="38" rx="8" fill="#ddd6fe"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="12">junos: netconf, 830</text>
<rect x="250" y="100" width="170" height="38" rx="8" fill="#fde68a"/><text x="335" y="124" text-anchor="middle" class="svg-ink" font-size="12">eos: httpapi, 443</text>
<rect x="500" y="50" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="72" text-anchor="middle" class="svg-ink" font-size="12">R1  J1  E1</text><text x="565" y="88" text-anchor="middle" class="svg-muted" font-size="10">same intent</text>
<line x1="130" y1="75" x2="250" y2="31" stroke="#64748b" stroke-width="2"/><line x1="130" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="130" y1="75" x2="250" y2="119" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="31" x2="500" y2="75" stroke="#64748b" stroke-width="2"/><line x1="420" y1="75" x2="500" y2="75" stroke="#64748b" stroke-width="2"/><line x1="420" y1="119" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The playbook is shared; platform and transport are per group.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Big picture.</b> Platform (<code>ansible_network_os</code>) and transport (<code>ansible_connection</code>) are two separate choices.</li>
<li><b>2 Connections.</b> <code>network_cli</code> on 22, <code>netconf</code> on 830, <code>httpapi</code> on 443 with <code>ansible_httpapi_use_ssl: true</code>.</li>
<li><b>3 Inventory.</b> One group per platform, shared variables in <code>group_vars</code>, a parent group <code>network</code>.</li>
<li><b>4 Facts and commands.</b> <code>*_facts</code> with <code>gather_facts: false</code>, <code>*_command</code>, FQCN names.</li>
<li><b>5 Config modules.</b> <code>ios_config</code>, <code>junos_config</code>, <code>eos_config</code>; <code>lines</code>, <code>parents</code>, <code>save_when</code>.</li>
<li><b>6 Check and diff.</b> <code>--check --diff</code> first; the second real run must show <code>changed=0</code>.</li>
<li><b>7 Junos NETCONF.</b> <code>netconf_get</code>, <code>junos_config</code>, <code>confirm</code> and the commit history comment.</li>
<li><b>8 EOS eAPI.</b> <code>httpapi</code> and the resource module <code>eos_vlans</code> with before, commands and after.</li>
<li><b>9 Troubleshooting.</b> Read the message, change one variable, run again on one host.</li>
</ul>

<h3>Command and syntax cheat sheet</h3>
<pre class="code">ansible-inventory --graph                     groups and hosts
ansible-inventory --host J1                   merged variables of one host
ansible-playbook site.yml --syntax-check      parse only
ansible-playbook site.yml --list-hosts        who would be targeted
ansible-playbook baseline.yml --check --diff  preview, no change
ansible-playbook baseline.yml -l R1           one host first (canary)
ansible-doc -t connection -l                  list connection plugins
ansible_network_os: arista.eos.eos            in group_vars/eos.yml
ansible_connection: ansible.netcommon.netconf in group_vars/junos.yml
ansible_httpapi_use_ssl: true                 in group_vars/eosapi.yml</pre>
<p>The first six lines are typed in the terminal. The last three are lines of YAML inside a variables file, not commands.</p>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>FQCN</td><td>Full collection name, for example <code>arista.eos.eos_config</code></td></tr>
<tr><td>Connection plugin</td><td>How the control node talks to the device</td></tr>
<tr><td>Network OS</td><td>Platform name that selects the module family</td></tr>
<tr><td>Idempotent</td><td>A second run changes nothing</td></tr>
<tr><td>Resource module</td><td>Module with a state (merged, replaced, overridden, deleted, gathered, rendered, parsed)</td></tr>
<tr><td>eAPI</td><td>Arista JSON API reached through <code>httpapi</code></td></tr>
<tr><td>Commit confirmed</td><td>Junos commit that rolls back unless confirmed</td></tr></table>

<h3>Which tool when</h3>
<p>No tool wins everywhere. A one-off script on a few devices: <b>netmiko</b> or <b>scrapli</b> (scrapli when speed or async matters). A Python-heavy fleet job with your own logic: <b>Nornir</b>. Vendor-neutral reads and config diffs from Python: <b>NAPALM</b>. Declarative, reviewable, repeatable change with many people reading it: <b>Ansible</b>. They combine well, for instance Nornir calling NAPALM.</p>

<h3>Exam checklist</h3>
<ul>
<li>I can name the three connection plugins, their ports and their platforms.</li>
<li>I know <code>ansible_network_os</code> and <code>ansible_connection</code> are two variables.</li>
<li>I always run <code>--check --diff</code> and then confirm <code>changed=0</code> on the second run.</li>
<li>I can read FAILED against UNREACHABLE.</li>
<li>I know httpapi needs SSL turned on explicitly and a trusted certificate.</li>
<li>I can name the resource module states and the three result keys.</li>
<li>I fix one variable per run.</li>
</ul>

<div class="eg"><p><b>Worked example for revision.</b> A new Arista leaf fails with <i>Connection refused</i> on port 80. Platform and transport are fine; httpapi is simply speaking without encryption. Add <code>ansible_httpapi_use_ssl: true</code>. If the next error says <i>self-signed certificate</i>, trust the authority (or in the lab only, <code>validate_certs: false</code>).</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Resource modules implement a subset of options; <code>-vvv</code> prints only a header; wrong passwords on <code>network_cli</code> show as FAILED, where real ansible-core often says UNREACHABLE; NX-OS (<code>cisco.nxos.nxos</code>) is covered only in the tables. The lab uses the example credentials netops and NK@2026; on real systems keep passwords in Ansible Vault.</p></div>
<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Using <code>ansible_connection: ssh</code> for a router. Putting the login password where the enable password belongs. Expecting httpapi to default to port 443. Calling a run idempotent after one run.</p></div>
<div class="exam"><p><b>Exam trap.</b> The word in the message names the layer: <i>network os</i> is inventory, <i>elevate privilege</i> is become, <i>Connection refused</i> is port or SSL, <i>CERTIFICATE_VERIFY_FAILED</i> is trust.</p></div>

<div class="scn"><h4>Handing the playbook to the night shift</h4><p>A senior engineer hands over a multivendor baseline. It has one group per platform, <code>ansible_network_os</code> in each group file, a README line to run <code>--check --diff</code> first, and a list of the eight classic error messages with their fixes. The night team runs it on a canary with <code>-l</code> and never has to call her.</p><p><b>Lesson:</b> a good playbook ships with its preview step and its error table.</p></div>
<div class="iv"><p class="q">"How do you make one Ansible project work across Cisco, Juniper and Arista?"</p><p>One inventory with a group per platform. Each group file sets <code>ansible_network_os</code> and the connection plugin. The playbook uses the vendor modules per play, I preview with <code>--check --diff</code>, test on one host with <code>-l</code> and confirm the second run changes nothing.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Platform and transport are set per group, not per task.</li>
<li>Preview with <code>--check --diff</code>; prove idempotency with a second run.</li>
<li>Junos uses NETCONF and EOS can use eAPI; both have their own typical failures.</li>
<li>The error message names the layer; change one variable per run.</li>
<li>Pick the tool that fits the job: Ansible for declarative shared change.</li></ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> poore module ko revise karne ke liye ek page. Aapne ek IOS router par chalne wale Ansible se shuru kiya tha. Ab aap ek project <b>IOS XE, Junos aur EOS</b> par chalate ho, har group ke liye platform aur transport chunte ho, changes preview karke saabit karte ho, aur sirf message dekhkar connection failures diagnose karte ho.</p>

<h3>Analogy: ek conductor, teen sections</h3>
<p>Conductor strings, brass aur percussion ko ek hi score deta hai. Har section use apne tareeke se padhta hai. Aapki playbook score hai; <code>ansible_network_os</code> section chunta hai, aur connection plugin batata hai ki awaaz hall tak kaise pahunchti hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ek playbook, teen platforms, teen transports">
<rect x="10" y="50" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="70" y="72" text-anchor="middle" class="svg-ink" font-size="12">site.yml</text><text x="70" y="88" text-anchor="middle" class="svg-muted" font-size="10">ek playbook</text>
<rect x="250" y="12" width="170" height="38" rx="8" fill="#bae6fd"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="12">ios: network_cli, 22</text>
<rect x="250" y="56" width="170" height="38" rx="8" fill="#ddd6fe"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="12">junos: netconf, 830</text>
<rect x="250" y="100" width="170" height="38" rx="8" fill="#fde68a"/><text x="335" y="124" text-anchor="middle" class="svg-ink" font-size="12">eos: httpapi, 443</text>
<rect x="500" y="50" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="72" text-anchor="middle" class="svg-ink" font-size="12">R1  J1  E1</text><text x="565" y="88" text-anchor="middle" class="svg-muted" font-size="10">wahi intent</text>
<line x1="130" y1="75" x2="250" y2="31" stroke="#64748b" stroke-width="2"/><line x1="130" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="130" y1="75" x2="250" y2="119" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="31" x2="500" y2="75" stroke="#64748b" stroke-width="2"/><line x1="420" y1="75" x2="500" y2="75" stroke="#64748b" stroke-width="2"/><line x1="420" y1="119" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Playbook shared hai; platform aur transport har group ke hain.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Big picture.</b> Platform (<code>ansible_network_os</code>) aur transport (<code>ansible_connection</code>) do alag choices hain.</li>
<li><b>2 Connections.</b> <code>network_cli</code> 22 par, <code>netconf</code> 830 par, <code>httpapi</code> 443 par <code>ansible_httpapi_use_ssl: true</code> ke saath.</li>
<li><b>3 Inventory.</b> Har platform ka ek group, shared variables <code>group_vars</code> mein, parent group <code>network</code>.</li>
<li><b>4 Facts aur commands.</b> <code>gather_facts: false</code> ke saath <code>*_facts</code>, <code>*_command</code>, FQCN naam.</li>
<li><b>5 Config modules.</b> <code>ios_config</code>, <code>junos_config</code>, <code>eos_config</code>; <code>lines</code>, <code>parents</code>, <code>save_when</code>.</li>
<li><b>6 Check aur diff.</b> Pehle <code>--check --diff</code>; doosre real run mein <code>changed=0</code> dikhna chahiye.</li>
<li><b>7 Junos NETCONF.</b> <code>netconf_get</code>, <code>junos_config</code>, <code>confirm</code> aur commit history comment.</li>
<li><b>8 EOS eAPI.</b> <code>httpapi</code> aur resource module <code>eos_vlans</code> before, commands, after ke saath.</li>
<li><b>9 Troubleshooting.</b> Message padho, ek variable badlo, ek host par dobara chalao.</li>
</ul>

<h3>Command aur syntax cheat sheet</h3>
<pre class="code">ansible-inventory --graph                     groups aur hosts
ansible-inventory --host J1                   ek host ke merged variables
ansible-playbook site.yml --syntax-check      sirf parse
ansible-playbook site.yml --list-hosts        kaun target hoga
ansible-playbook baseline.yml --check --diff  preview, koi change nahi
ansible-playbook baseline.yml -l R1           pehle ek host (canary)
ansible-doc -t connection -l                  connection plugins ki list
ansible_network_os: arista.eos.eos            group_vars/eos.yml mein
ansible_connection: ansible.netcommon.netconf group_vars/junos.yml mein
ansible_httpapi_use_ssl: true                 group_vars/eosapi.yml mein</pre>
<p>Pehli chhe lines terminal mein type hoti hain. Aakhri teen lines variables file ke andar YAML ki lines hain, commands nahi.</p>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>FQCN</td><td>Poora collection naam, jaise <code>arista.eos.eos_config</code></td></tr>
<tr><td>Connection plugin</td><td>Control node device se kaise baat karta hai</td></tr>
<tr><td>Network OS</td><td>Platform ka naam jo module family chunta hai</td></tr>
<tr><td>Idempotent</td><td>Doosra run kuch nahi badalta</td></tr>
<tr><td>Resource module</td><td>State wala module (merged, replaced, overridden, deleted, gathered, rendered, parsed)</td></tr>
<tr><td>eAPI</td><td>Arista ka JSON API jo <code>httpapi</code> se pahunchte hain</td></tr>
<tr><td>Commit confirmed</td><td>Junos commit jo confirm na karne par rollback ho jaata hai</td></tr></table>

<h3>Kaunsa tool kab</h3>
<p>Koi tool har jagah nahi jeetta. Kuch devices par one-off script: <b>netmiko</b> ya <b>scrapli</b> (speed ya async ho to scrapli). Apni logic wala Python-heavy fleet job: <b>Nornir</b>. Python se vendor-neutral reads aur config diffs: <b>NAPALM</b>. Declarative, reviewable, repeatable change jise bahut log padhen: <b>Ansible</b>. Yeh milkar bhi chalte hain, jaise Nornir se NAPALM bulana.</p>

<h3>Exam checklist</h3>
<ul>
<li>Main teen connection plugins, unke ports aur platforms bata sakta hoon.</li>
<li>Mujhe pata hai <code>ansible_network_os</code> aur <code>ansible_connection</code> do variables hain.</li>
<li>Main hamesha <code>--check --diff</code> chalata hoon aur doosre run mein <code>changed=0</code> confirm karta hoon.</li>
<li>Main FAILED aur UNREACHABLE mein fark padh sakta hoon.</li>
<li>Mujhe pata hai httpapi mein SSL alag se on karna padta hai aur certificate trusted hona chahiye.</li>
<li>Main resource module ke states aur teen result keys bata sakta hoon.</li>
<li>Main har run mein ek variable theek karta hoon.</li>
</ul>

<div class="eg"><p><b>Worked example for revision.</b> Naya Arista leaf port 80 par <i>Connection refused</i> deta hai. Platform aur transport theek hain; httpapi bas bina encryption ke baat kar raha hai. <code>ansible_httpapi_use_ssl: true</code> jodo. Agla error <i>self-signed certificate</i> ho to authority par bharosa karo (ya sirf lab mein <code>validate_certs: false</code>).</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Resource modules options ka subset implement karte hain; <code>-vvv</code> sirf header print karta hai; <code>network_cli</code> par galat password FAILED dikhta hai, jahan real ansible-core aksar UNREACHABLE kehta hai; NX-OS (<code>cisco.nxos.nxos</code>) sirf tables mein hai. Lab example credentials netops aur NK@2026 use karta hai; real systems mein passwords Ansible Vault mein rakho.</p></div>
<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Router ke liye <code>ansible_connection: ssh</code> use karna. Enable password ki jagah login password daalna. Maan lena ki httpapi default mein port 443 use karta hai. Ek run ke baad hi run ko idempotent keh dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Message ka shabd layer ka naam batata hai: <i>network os</i> inventory hai, <i>elevate privilege</i> become hai, <i>Connection refused</i> port ya SSL hai, <i>CERTIFICATE_VERIFY_FAILED</i> trust hai.</p></div>

<div class="scn"><h4>Playbook night shift ko saunpna</h4><p>Ek senior engineer multivendor baseline hand over karti hai. Usme har platform ka ek group hai, har group file mein <code>ansible_network_os</code>, README mein pehle <code>--check --diff</code> chalane ki line, aur aathon classic error messages ki list unke fixes ke saath. Night team use <code>-l</code> se canary par chalati hai aur use kabhi call nahi karna padta.</p><p><b>Lesson:</b> achhi playbook apne preview step aur error table ke saath aati hai.</p></div>
<div class="iv"><p class="q">"Ek Ansible project ko Cisco, Juniper aur Arista par kaise chalaoge?"</p><p>Ek inventory jisme har platform ka group ho. Har group file <code>ansible_network_os</code> aur connection plugin set karti hai. Playbook har play mein vendor modules use karti hai, main <code>--check --diff</code> se preview karta hoon, <code>-l</code> se ek host par test karta hoon aur confirm karta hoon ki doosra run kuch nahi badalta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Platform aur transport group ke hisaab se set hote hain, task ke nahi.</li>
<li><code>--check --diff</code> se preview karo; doosre run se idempotency saabit karo.</li>
<li>Junos NETCONF use karta hai aur EOS eAPI; dono ke apne typical failures hain.</li>
<li>Error message layer ka naam batata hai; har run mein ek variable badlo.</li>
<li>Kaam ke hisaab se tool chuno: declarative shared change ke liye Ansible.</li></ul></div>
`}};export{e as default};