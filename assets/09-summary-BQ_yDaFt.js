var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`

<p>You started with "what is Ansible?" and can now describe the whole flow: an inventory says which devices, a playbook says what to do, modules do it over SSH, the PLAY RECAP reports it, and a second run proves it. This chapter collects everything for revision and for the CCNP Automation 350-901 exam.</p>

<h3>Can-do checklist</h3>
<ul><li>Explain control node, managed node, agentless and push, and contrast them with agent-based, pull-based tools.</li><li>Read and write a simple INI inventory with groups, <code>ansible_host</code> and group variables; inspect it with <code>ansible-inventory --graph</code> and <code>--host</code>.</li><li>Test connectivity with the <code>ping</code> module and tell UNREACHABLE from FAILED.</li><li>Read YAML: key: value, dash lists, spaces-only indentation, quotes for values starting with {{.</li><li>Name the parts of a playbook (play, hosts, tasks, module, parameters) and use register and debug.</li><li>Run a playbook and read the PLAY RECAP: ok, changed, failed, unreachable.</li><li>Use <code>--syntax-check</code>, <code>--list-hosts</code>, <code>--list-tasks</code>, <code>-l</code>, <code>-v</code> and <code>--check</code>.</li><li>Define idempotency and prove it with a second run showing changed=0.</li><li>Keep data in variables and loops, and explain why a vault is needed for secrets.</li><li>Troubleshoot by layer: file, target list, connection, task.</li></ul>

<h3>Command cheat-sheet (run in the simulator)</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr><tr><td>Show inventory tree</td><td>ansible-inventory -i inventory.ini --graph</td></tr><tr><td>Show one host variables</td><td>ansible-inventory -i inventory.ini --host R1</td></tr><tr><td>Test login</td><td>ansible routers -i inventory.ini -m ping</td></tr><tr><td>One-off show command</td><td>ansible routers -i inventory.ini -m ios_command -a "commands='show clock'"</td></tr><tr><td>Check the YAML and modules</td><td>ansible-playbook -i inventory.ini ntp.yml --syntax-check</td></tr><tr><td>Targets and tasks</td><td>--list-hosts  /  --list-tasks</td></tr><tr><td>Dry run</td><td>ansible-playbook -i inventory.ini ntp.yml --check</td></tr><tr><td>Real run</td><td>ansible-playbook -i inventory.ini ntp.yml</td></tr><tr><td>One host only</td><td>ansible-playbook -i inventory.ini ntp.yml -l R1</td></tr><tr><td>More detail</td><td>ansible-playbook -i inventory.ini ntp.yml -v</td></tr><tr><td>Module help</td><td>ansible-doc ios_config</td></tr><tr><td>Validate YAML (lab host)</td><td>yaml validate vlans.yml</td></tr></table>
<p>Reference configuration (not run in the simulator): <code>ansible-vault</code>, <code>group_vars</code> and <code>host_vars</code> folders, roles and templates (Ansible track), dynamic inventory, and Ansible Automation Platform. Know what they are for.</p>

<h3>Ansible compared with other tools</h3>
<table class="cmp"><tr><th>Tool</th><th>Model</th><th>Typical use</th></tr><tr><td>Ansible</td><td>agentless push, YAML playbooks, SSH or API</td><td>configuration and orchestration of devices</td></tr><tr><td>Puppet / Chef</td><td>agent-based pull, own languages</td><td>servers, continuous enforcement</td></tr><tr><td>Terraform</td><td>declarative infrastructure as code with state</td><td>building cloud and network infrastructure</td></tr><tr><td>Python scripts (Netmiko etc.)</td><td>imperative, you write every step</td><td>custom logic, small jobs</td></tr></table>
<p>The exam likes this comparison. Say Ansible for agentless, push-based configuration management; Terraform for provisioning with a state file; Puppet and Chef for agent-based, pull-based management. On network gear, Ansible modules talk SSH/CLI, NETCONF or REST APIs depending on the collection.</p>

<h3>Most tested facts</h3>
<ul><li>Ansible is agentless: it uses SSH (or an API), and nothing is installed on the device.</li><li>The inventory defines hosts and groups; a play targets a group with <code>hosts:</code>.</li><li>A playbook is YAML: a list of plays, each with tasks; tasks call modules.</li><li>YAML uses spaces, never tabs; lists use a dash; key: value needs a space after the colon.</li><li>ok means no change was needed; changed means the device was (or would be) modified; failed and unreachable need attention.</li><li><code>--check</code> is a dry run; in it, changed means "would change".</li><li>Idempotent: a second run gives changed=0.</li><li><code>register</code> stores a task result; <code>debug</code> prints it.</li><li><code>loop</code> repeats a task for each item and provides <code>item</code>.</li><li>Secrets belong in Ansible Vault or masked CI variables, not in Git.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>Control node</dt><dd>machine where Ansible runs</dd><dt>Managed node</dt><dd>device Ansible configures</dd><dt>Inventory</dt><dd>file listing hosts and groups</dd><dt>Playbook</dt><dd>YAML file with plays</dd><dt>Play</dt><dd>maps a host group to a list of tasks</dd><dt>Task</dt><dd>one call to a module</dd><dt>Module</dt><dd>ready-made tool such as ios_config</dd><dt>Idempotent</dt><dd>running again changes nothing already correct</dd><dt>Check mode</dt><dd>dry run that changes nothing</dd><dt>Variable</dt><dd>named value used as {{ name }}</dd><dt>Vault</dt><dd>Ansible encryption for secrets</dd><dt>PLAY RECAP</dt><dd>per-host summary of results</dd></dl>

<h3>Lab command recap</h3>
<p><b>Lab 1 (first playbook):</b></p>
<pre class="code">cat inventory.ini
ansible-inventory -i inventory.ini --graph
ansible routers -i inventory.ini -m ping
sed -i 's/10.99.0.21/10.99.0.2/' inventory.ini
ansible routers -i inventory.ini -m ping
ansible-playbook -i inventory.ini show.yml
ansible-playbook -i inventory.ini ntp.yml --check
ansible-playbook -i inventory.ini ntp.yml
ansible-playbook -i inventory.ini ntp.yml</pre>
<p>Answers: two hosts in routers, changed=0 for the show playbook. <b>Lab 2 (variables):</b></p>
<pre class="code">cat -n vlans.yml
ansible-playbook -i inventory.ini vlans.yml --check
ansible-playbook -i inventory.ini vlans.yml
insert vlans.yml 14 '      - vlan_id: 30'
insert vlans.yml 15 '        name: VOICE'
yaml validate vlans.yml
ansible-playbook -i inventory.ini vlans.yml --check
ansible-playbook -i inventory.ini vlans.yml
ansible-playbook -i inventory.ini vlans.yml</pre>
<p>Answers: <code>loop</code>, and no (the dry run created nothing).</p>

<h3>Where this leads</h3>
<p>Your playbooks and data files belong in Git (previous module), and a CI/CD pipeline (next module) can validate them on every push. For roles, templates, handlers and conditionals, continue with the Ansible track.</p>

<div class="eg"><p><b>Worked example.</b> Exam question: "After running a playbook, the engineer runs it again and the recap shows changed=0 for all hosts. What does this prove?" Answer: the tasks are idempotent and the devices already match the desired state. Wrong answers: the playbook failed, the devices are unreachable, or --check was used.</p></div>
<div class="exam"><p><b>Final exam trap.</b> Read the verb and the flag. "Without changing the device" is --check or --syntax-check. "Which devices" is the inventory. "What to do" is the playbook. "UNREACHABLE" is connection; "FAILED" is login or task.</p></div>
<div class="scn"><h4>A team that stopped logging in to routers</h4><p>A network team set a rule: no one types configuration on a production router. Changes go to a data file, a pull request, a check-mode run, and an Ansible run, in that order. After six months the quarterly audit used the playbook outputs and Git history as evidence, and the team found drift in only two devices, both caused by emergency manual fixes that the next run corrected automatically.</p><p><b>Lesson:</b> automation is a discipline as much as a tool: the files, not the CLI, are the record.</p></div>
<div class="iv"><p class="q">"Describe an end-to-end Ansible workflow for a VLAN change."</p><p>Edit the VLAN list in the data file on a Git branch, open a pull request, and let a pipeline lint the YAML. Run the playbook with --check to see which switches would change, review, then run it for real, ideally pilot first with -l. Confirm with a second run that shows changed=0, and keep the output with the change record. Secrets come from a vault or masked variables.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Inventory = which, playbook = what, module = how; Ansible is agentless and push-based.</li><li>Read the PLAY RECAP: failed and unreachable must be zero.</li><li>Use check mode and a second run (changed=0) as proof.</li><li>Data in variables and loops is the source of truth; secrets in a vault.</li><li>Troubleshoot by layer: file, target list, connection, task.</li></ul></div>

`,hi:`

<p>Aapne "Ansible kya hai?" se shuru kiya tha aur ab poora flow bata sakte ho: inventory batati hai kaun se devices, playbook batata hai kya karna hai, modules SSH par karte hain, PLAY RECAP report deta hai, aur doosra run saabit karta hai. Yeh chapter revision aur CCNP Automation 350-901 exam ke liye sab kuch ek jagah jodta hai.</p>

<h3>Can-do checklist</h3>
<ul><li>Control node, managed node, agentless aur push samjhana, aur agent-based, pull-based tools se contrast karna.</li><li>Groups, <code>ansible_host</code> aur group variables ke saath simple INI inventory padhna aur likhna; <code>ansible-inventory --graph</code> aur <code>--host</code> se dekhna.</li><li><code>ping</code> module se connectivity test karna aur UNREACHABLE ko FAILED se alag karna.</li><li>YAML padhna: key: value, dash lists, sirf spaces ki indentation, {{ se shuru values ke liye quotes.</li><li>Playbook ke parts batana (play, hosts, tasks, module, parameters) aur register aur debug use karna.</li><li>Playbook chalana aur PLAY RECAP padhna: ok, changed, failed, unreachable.</li><li><code>--syntax-check</code>, <code>--list-hosts</code>, <code>--list-tasks</code>, <code>-l</code>, <code>-v</code> aur <code>--check</code> use karna.</li><li>Idempotency define karna aur changed=0 wale doosre run se saabit karna.</li><li>Data ko variables aur loops mein rakhna, aur samjhana ki secrets ke liye vault kyun chahiye.</li><li>Layer se troubleshoot karna: file, target list, connection, task.</li></ul>

<h3>Command cheat-sheet (simulator mein chalte hain)</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr><tr><td>Inventory tree dikhana</td><td>ansible-inventory -i inventory.ini --graph</td></tr><tr><td>Ek host ke variables</td><td>ansible-inventory -i inventory.ini --host R1</td></tr><tr><td>Login test</td><td>ansible routers -i inventory.ini -m ping</td></tr><tr><td>Ek baar ka show command</td><td>ansible routers -i inventory.ini -m ios_command -a "commands='show clock'"</td></tr><tr><td>YAML aur modules check</td><td>ansible-playbook -i inventory.ini ntp.yml --syntax-check</td></tr><tr><td>Targets aur tasks</td><td>--list-hosts  /  --list-tasks</td></tr><tr><td>Dry run</td><td>ansible-playbook -i inventory.ini ntp.yml --check</td></tr><tr><td>Asli run</td><td>ansible-playbook -i inventory.ini ntp.yml</td></tr><tr><td>Sirf ek host</td><td>ansible-playbook -i inventory.ini ntp.yml -l R1</td></tr><tr><td>Zyada detail</td><td>ansible-playbook -i inventory.ini ntp.yml -v</td></tr><tr><td>Module help</td><td>ansible-doc ios_config</td></tr><tr><td>YAML validate (lab host)</td><td>yaml validate vlans.yml</td></tr></table>
<p>Reference configuration (not run in the simulator): <code>ansible-vault</code>, <code>group_vars</code> aur <code>host_vars</code> folders, roles aur templates (Ansible track), dynamic inventory, aur Ansible Automation Platform. Jaano ki yeh kis kaam ke hain.</p>

<h3>Ansible ki doosre tools se tulna</h3>
<table class="cmp"><tr><th>Tool</th><th>Model</th><th>Typical use</th></tr><tr><td>Ansible</td><td>agentless push, YAML playbooks, SSH ya API</td><td>devices ki configuration aur orchestration</td></tr><tr><td>Puppet / Chef</td><td>agent-based pull, apni languages</td><td>servers, continuous enforcement</td></tr><tr><td>Terraform</td><td>state ke saath declarative infrastructure as code</td><td>cloud aur network infrastructure banana</td></tr><tr><td>Python scripts (Netmiko etc.)</td><td>imperative, har step aap likhte ho</td><td>custom logic, chhote jobs</td></tr></table>
<p>Exam ko yeh comparison pasand hai. Agentless, push-based configuration management ke liye Ansible bolo; state file ke saath provisioning ke liye Terraform; agent-based, pull-based management ke liye Puppet aur Chef. Network gear par Ansible modules collection ke hisaab se SSH/CLI, NETCONF ya REST APIs se baat karte hain.</p>

<h3>Sabse zyada test hone wale facts</h3>
<ul><li>Ansible agentless hai: SSH (ya API) use karta hai, device par kuch install nahi hota.</li><li>Inventory hosts aur groups define karti hai; play <code>hosts:</code> se group ko target karta hai.</li><li>Playbook YAML hai: plays ki list, har ek mein tasks; tasks modules bulate hain.</li><li>YAML spaces use karta hai, tabs kabhi nahi; lists dash se; key: value mein colon ke baad space.</li><li>ok matlab change ki zaroorat nahi thi; changed matlab device badla (ya badalta); failed aur unreachable ko dhyan chahiye.</li><li><code>--check</code> dry run hai; usme changed ka matlab "badlega".</li><li>Idempotent: doosra run changed=0 deta hai.</li><li><code>register</code> task result store karta hai; <code>debug</code> use print karta hai.</li><li><code>loop</code> har item ke liye task repeat karta hai aur <code>item</code> deta hai.</li><li>Secrets Ansible Vault ya masked CI variables mein, Git mein nahi.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>Control node</dt><dd>machine jahan Ansible chalta hai</dd><dt>Managed node</dt><dd>device jise Ansible configure karta hai</dd><dt>Inventory</dt><dd>hosts aur groups ki list wali file</dd><dt>Playbook</dt><dd>plays wali YAML file</dd><dt>Play</dt><dd>host group ko tasks ki list se map karta hai</dd><dt>Task</dt><dd>module ko ek call</dd><dt>Module</dt><dd>ready-made tool jaise ios_config</dd><dt>Idempotent</dt><dd>dobara chalane par jo sahi hai use nahi badalta</dd><dt>Check mode</dt><dd>dry run jo kuch nahi badalta</dd><dt>Variable</dt><dd>{{ name }} ki tarah use hone wali named value</dd><dt>Vault</dt><dd>secrets ke liye Ansible encryption</dd><dt>PLAY RECAP</dt><dd>results ka per-host summary</dd></dl>

<h3>Lab command recap</h3>
<p><b>Lab 1 (pehla playbook):</b></p>
<pre class="code">cat inventory.ini
ansible-inventory -i inventory.ini --graph
ansible routers -i inventory.ini -m ping
sed -i 's/10.99.0.21/10.99.0.2/' inventory.ini
ansible routers -i inventory.ini -m ping
ansible-playbook -i inventory.ini show.yml
ansible-playbook -i inventory.ini ntp.yml --check
ansible-playbook -i inventory.ini ntp.yml
ansible-playbook -i inventory.ini ntp.yml</pre>
<p>Jawab: routers mein do hosts, show playbook ke liye changed=0. <b>Lab 2 (variables):</b></p>
<pre class="code">cat -n vlans.yml
ansible-playbook -i inventory.ini vlans.yml --check
ansible-playbook -i inventory.ini vlans.yml
insert vlans.yml 14 '      - vlan_id: 30'
insert vlans.yml 15 '        name: VOICE'
yaml validate vlans.yml
ansible-playbook -i inventory.ini vlans.yml --check
ansible-playbook -i inventory.ini vlans.yml
ansible-playbook -i inventory.ini vlans.yml</pre>
<p>Jawab: <code>loop</code>, aur no (dry run ne kuch nahi banaya).</p>

<h3>Yeh kahan le jaata hai</h3>
<p>Aapke playbooks aur data files Git mein rehni chahiye (pichhla module), aur CI/CD pipeline (agla module) har push par unhe validate kar sakti hai. Roles, templates, handlers aur conditionals ke liye Ansible track continue karo.</p>

<div class="eg"><p><b>Worked example.</b> Exam question: "Playbook chalane ke baad engineer use dobara chalata hai aur recap saare hosts ke liye changed=0 dikhata hai. Yeh kya saabit karta hai?" Jawab: tasks idempotent hain aur devices pehle se desired state se match karte hain. Galat jawab: playbook fail hua, devices unreachable hain, ya --check use hua.</p></div>
<div class="exam"><p><b>Final exam trap.</b> Verb aur flag padho. "Device badle bina" matlab --check ya --syntax-check. "Kaun se devices" matlab inventory. "Kya karna hai" matlab playbook. "UNREACHABLE" connection hai; "FAILED" login ya task hai.</p></div>
<div class="scn"><h4>Jis team ne routers mein login karna band kiya</h4><p>Ek network team ne rule banaya: production router par koi configuration type nahi karega. Changes data file, pull request, check-mode run aur Ansible run mein jaate hain, isi order mein. Chhe mahine baad quarterly audit ne playbook outputs aur Git history ko saboot ki tarah use kiya, aur team ko sirf do devices mein drift mila, dono emergency manual fixes se jinhe agle run ne apne aap theek kar diya.</p><p><b>Lesson:</b> automation tool jitna hi discipline bhi hai: record files hain, CLI nahi.</p></div>
<div class="iv"><p class="q">"VLAN change ke liye end-to-end Ansible workflow batao."</p><p>Git branch par data file mein VLAN list edit karo, pull request kholo, aur pipeline se YAML lint karwao. Playbook ko --check se chalao ki kaun se switches badlenge, review karo, phir asli chalao, behtar hai pehle -l se pilot. Doosre run se confirm karo jo changed=0 dikhaye, aur output change record ke saath rakho. Secrets vault ya masked variables se aate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Inventory = kaun, playbook = kya, module = kaise; Ansible agentless aur push-based hai.</li><li>PLAY RECAP padho: failed aur unreachable zero hone chahiye.</li><li>Check mode aur doosra run (changed=0) saboot ke taur par use karo.</li><li>Variables aur loops mein data source of truth hai; secrets vault mein.</li><li>Layer se troubleshoot karo: file, target list, connection, task.</li></ul></div>

`}};export{e as default};