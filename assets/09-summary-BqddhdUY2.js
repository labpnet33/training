var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module never having used Ansible. You now own the whole beginner loop: set up a control node, describe devices, talk to them, write a playbook, rehearse it, apply it and prove it is repeatable. This chapter gathers everything you need before the labs, an interview or a certification-style question.</p>

<h3>Can-do checklist</h3>
<p>Tick each item only if you can do it without looking at the chapters.</p>
<ul>
<li>I can explain agentless, push-based automation and name the control node and managed nodes.</li>
<li>I can read <code>ansible --version</code> and tell which configuration file is active.</li>
<li>I can write an INI inventory with groups, a group of groups and <code>[all:vars]</code> for network_cli login.</li>
<li>I can verify an inventory with <code>ansible-inventory --graph</code> and <code>--list</code>.</li>
<li>I can create <code>ansible.cfg</code> and explain the known_hosts error and its two fixes.</li>
<li>I can run <code>ping</code>, <code>ios_command</code>, <code>ios_facts</code> and <code>ios_config</code> ad hoc and read SUCCESS, CHANGED, FAILED and UNREACHABLE.</li>
<li>I can write a two-task playbook and explain every line.</li>
<li>I can use <code>--syntax-check</code>, <code>--list-hosts</code>, <code>--check --diff</code> and <code>-l</code>.</li>
<li>I can read the PLAY RECAP and prove idempotency with a second run.</li>
<li>I can save the configuration with <code>save_when: modified</code>.</li>
<li>I can follow the troubleshooting ladder from syntax to device.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr>
<tr><td>Version and active config file</td><td><code>ansible --version</code></td></tr>
<tr><td>Installed collections</td><td><code>ansible-galaxy collection list</code></td></tr>
<tr><td>Module help</td><td><code>ansible-doc cisco.ios.ios_config</code> or <code>ansible-doc -s MODULE</code></td></tr>
<tr><td>Show the inventory tree</td><td><code>ansible-inventory --graph</code></td></tr>
<tr><td>Show every host variable</td><td><code>ansible-inventory --list</code></td></tr>
<tr><td>Login test</td><td><code>ansible all -m ping</code></td></tr>
<tr><td>Show command on a group</td><td><code>ansible routers -m cisco.ios.ios_command -a "commands='show ip interface brief'"</code></td></tr>
<tr><td>Facts from one device</td><td><code>ansible pun-core-r1 -m cisco.ios.ios_facts</code></td></tr>
<tr><td>Validate a playbook</td><td><code>ansible-playbook ntp.yml --syntax-check</code></td></tr>
<tr><td>Which hosts / tasks</td><td><code>--list-hosts</code>, <code>--list-tasks</code></td></tr>
<tr><td>Dry run with lines</td><td><code>ansible-playbook ntp.yml --check --diff</code></td></tr>
<tr><td>One device only</td><td><code>ansible-playbook ntp.yml -l pun-core-r1</code></td></tr>
<tr><td>Show module results</td><td><code>ansible-playbook ntp.yml -v</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Control node</dt><dd>Linux host where Ansible runs (AUTO01).</dd>
<dt>Managed node</dt><dd>A device Ansible configures; no agent on it.</dd>
<dt>Inventory</dt><dd>File of hosts, groups and variables.</dd>
<dt>Group / children</dt><dd>A named set of hosts; <code>:children</code> builds a group from groups.</dd>
<dt>FQCN</dt><dd>Fully qualified collection name, such as <code>cisco.ios.ios_config</code>.</dd>
<dt>Module</dt><dd>A unit of work called by a task.</dd>
<dt>Play / playbook</dt><dd>Hosts plus tasks / a file of plays.</dd>
<dt>network_cli</dt><dd>Connection type: SSH and the device CLI.</dd>
<dt>Idempotent</dt><dd>Repeating a run does not change the result.</dd>
<dt>Check mode</dt><dd>Dry run reporting what would change.</dd>
<dt>Facts</dt><dd>Device data gathered by <code>ios_facts</code>, named <code>ansible_net_*</code>.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Ansible is <b>agentless</b> and push-based; the control node must be Linux or macOS.</li>
<li>Configuration file order: <code>ANSIBLE_CONFIG</code>, <code>./ansible.cfg</code>, <code>~/.ansible.cfg</code>, <code>/etc/ansible/ansible.cfg</code>; only the first found is used.</li>
<li>Network devices need <code>ansible_connection=ansible.netcommon.network_cli</code>, <code>ansible_network_os</code>, user and password.</li>
<li><code>gather_facts: false</code> for network devices; collect facts with <code>ios_facts</code>.</li>
<li><code>ping</code> on a network device is a login test, not ICMP.</li>
<li>In the PLAY RECAP, <code>ok</code> includes <code>changed</code>.</li>
<li>Second run <code>changed=0</code> equals idempotent.</li>
<li>YAML: spaces not tabs, <code>- </code> for lists, colon followed by a space.</li>
<li>UNREACHABLE: no connection; FAILED: connected, task failed.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module roadmap">
<rect x="10" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">Ansible 1</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">you are here</text>
<rect x="170" y="40" width="140" height="70" rx="10" fill="#fde68a"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="13">Ansible 2</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">inventory, variables</text>
<rect x="330" y="40" width="140" height="70" rx="10" fill="#bae6fd"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="13">Ansible 3</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="12">loops, when, handlers</text>
<rect x="490" y="40" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">Next</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">templates, roles</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">What comes next on the Ansible for Network Engineers track.</p></div>

<div class="warn"><p><b>Last reminders.</b> Never trust a playbook you have not listed (<code>--list-hosts</code>) and rehearsed (<code>--check --diff</code>). Never keep real passwords in plain files. Always run the playbook a second time and look for <code>changed=0</code>.</p></div>
<div class="exam"><p><b>Exam trap round-up.</b> Inventory name is not the device hostname; <code>[x:children]</code> lists groups; <code>ansible --version</code> shows the <i>active</i> config; check mode is best effort; saving is a separate decision from changing.</p></div>

<div class="scn"><h4>Your first production-style change, end to end</h4><p>A team needs a new syslog server on 60 devices tonight. The engineer lists hosts, runs the playbook with <code>--check --diff</code> against one canary router, applies to that router, runs it a second time to see <code>changed=0</code>, then runs the full group with <code>save_when: modified</code>. The ticket carries the dry-run output and the clean recap as proof.</p><p><b>Lesson:</b> the habits you built in this module (look, rehearse, apply, repeat) scale from three lab devices to sixty production ones.</p></div>

<div class="iv"><p class="q">"Walk me through running your first Ansible change safely."</p><p>I confirm the inventory with <code>ansible-inventory --graph</code>, test login with <code>ping</code>, list the target hosts, rehearse with <code>--check --diff</code>, apply to one canary device with <code>-l</code>, then to the group, and repeat the run to confirm <code>changed=0</code>. I decide explicitly about saving the configuration and keep secrets out of plain text.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control node plus inventory plus playbook is the whole model; devices need only SSH.</li>
<li>Use FQCN module names and the network_cli connection variables.</li>
<li>Look, rehearse, apply, repeat; a clean second run is proof.</li>
<li>Troubleshoot from syntax to inventory to connection to module.</li>
<li>Next: scale with YAML inventories, group_vars and host_vars in Ansible 2.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module kabhi Ansible use kiye bina shuru kiya tha. Ab aapke paas poora beginner loop hai: control node set up karna, devices describe karna, unse baat karna, playbook likhna, use rehearse karna, apply karna aur sabit karna ki woh repeatable hai. Yeh chapter woh sab jama karta hai jo labs, interview ya certification-style sawaal se pehle chahiye.</p>

<h3>Can-do checklist</h3>
<p>Har item tabhi tick karo jab chapters dekhe bina kar sako.</p>
<ul>
<li>Main agentless, push-based automation samjha sakta hoon aur control node aur managed nodes ke naam bata sakta hoon.</li>
<li>Main <code>ansible --version</code> padh kar bata sakta hoon ki kaunsi configuration file active hai.</li>
<li>Main groups, group of groups aur network_cli login ke liye <code>[all:vars]</code> wali INI inventory likh sakta hoon.</li>
<li>Main inventory ko <code>ansible-inventory --graph</code> aur <code>--list</code> se verify kar sakta hoon.</li>
<li>Main <code>ansible.cfg</code> bana sakta hoon aur known_hosts error aur uske do fix samjha sakta hoon.</li>
<li>Main <code>ping</code>, <code>ios_command</code>, <code>ios_facts</code> aur <code>ios_config</code> ad hoc chala sakta hoon aur SUCCESS, CHANGED, FAILED, UNREACHABLE padh sakta hoon.</li>
<li>Main do-task playbook likh sakta hoon aur har line samjha sakta hoon.</li>
<li>Main <code>--syntax-check</code>, <code>--list-hosts</code>, <code>--check --diff</code> aur <code>-l</code> use kar sakta hoon.</li>
<li>Main PLAY RECAP padh sakta hoon aur doosre run se idempotency sabit kar sakta hoon.</li>
<li>Main <code>save_when: modified</code> se configuration save kar sakta hoon.</li>
<li>Main syntax se device tak troubleshooting seedhi follow kar sakta hoon.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr>
<tr><td>Version aur active config file</td><td><code>ansible --version</code></td></tr>
<tr><td>Installed collections</td><td><code>ansible-galaxy collection list</code></td></tr>
<tr><td>Module help</td><td><code>ansible-doc cisco.ios.ios_config</code> ya <code>ansible-doc -s MODULE</code></td></tr>
<tr><td>Inventory tree dikhao</td><td><code>ansible-inventory --graph</code></td></tr>
<tr><td>Har host variable dikhao</td><td><code>ansible-inventory --list</code></td></tr>
<tr><td>Login test</td><td><code>ansible all -m ping</code></td></tr>
<tr><td>Group par show command</td><td><code>ansible routers -m cisco.ios.ios_command -a "commands='show ip interface brief'"</code></td></tr>
<tr><td>Ek device ke facts</td><td><code>ansible pun-core-r1 -m cisco.ios.ios_facts</code></td></tr>
<tr><td>Playbook validate</td><td><code>ansible-playbook ntp.yml --syntax-check</code></td></tr>
<tr><td>Kaunse hosts / tasks</td><td><code>--list-hosts</code>, <code>--list-tasks</code></td></tr>
<tr><td>Lines ke saath dry run</td><td><code>ansible-playbook ntp.yml --check --diff</code></td></tr>
<tr><td>Sirf ek device</td><td><code>ansible-playbook ntp.yml -l pun-core-r1</code></td></tr>
<tr><td>Module results dikhao</td><td><code>ansible-playbook ntp.yml -v</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Control node</dt><dd>Linux host jahan Ansible chalta hai (AUTO01).</dd>
<dt>Managed node</dt><dd>Device jise Ansible configure karta hai; us par koi agent nahi.</dd>
<dt>Inventory</dt><dd>Hosts, groups aur variables ki file.</dd>
<dt>Group / children</dt><dd>Hosts ka named set; <code>:children</code> groups se group banata hai.</dd>
<dt>FQCN</dt><dd>Fully qualified collection name, jaise <code>cisco.ios.ios_config</code>.</dd>
<dt>Module</dt><dd>Kaam ki ek unit jise task bulata hai.</dd>
<dt>Play / playbook</dt><dd>Hosts plus tasks / plays ki file.</dd>
<dt>network_cli</dt><dd>Connection type: SSH aur device CLI.</dd>
<dt>Idempotent</dt><dd>Run repeat karne se result nahi badalta.</dd>
<dt>Check mode</dt><dd>Dry run jo batata hai kya badlega.</dd>
<dt>Facts</dt><dd><code>ios_facts</code> se jama device data, naam <code>ansible_net_*</code>.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Ansible <b>agentless</b> aur push-based hai; control node Linux ya macOS hona chahiye.</li>
<li>Configuration file order: <code>ANSIBLE_CONFIG</code>, <code>./ansible.cfg</code>, <code>~/.ansible.cfg</code>, <code>/etc/ansible/ansible.cfg</code>; sirf pehli mili use hoti hai.</li>
<li>Network devices ko <code>ansible_connection=ansible.netcommon.network_cli</code>, <code>ansible_network_os</code>, user aur password chahiye.</li>
<li>Network devices ke liye <code>gather_facts: false</code>; facts <code>ios_facts</code> se.</li>
<li>Network device par <code>ping</code> login test hai, ICMP nahi.</li>
<li>PLAY RECAP mein <code>ok</code> mein <code>changed</code> shamil hai.</li>
<li>Doosre run par <code>changed=0</code> matlab idempotent.</li>
<li>YAML: tabs nahi spaces, lists ke liye <code>- </code>, colon ke baad space.</li>
<li>UNREACHABLE: connection nahi; FAILED: connect hua, task fail.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module roadmap">
<rect x="10" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">Ansible 1</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">aap yahan ho</text>
<rect x="170" y="40" width="140" height="70" rx="10" fill="#fde68a"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="13">Ansible 2</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">inventory, variables</text>
<rect x="330" y="40" width="140" height="70" rx="10" fill="#bae6fd"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="13">Ansible 3</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="12">loops, when, handlers</text>
<rect x="490" y="40" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">Aage</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">templates, roles</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ansible for Network Engineers track mein aage kya aata hai.</p></div>

<div class="warn"><p><b>Aakhri reminders.</b> Jis playbook ko list (<code>--list-hosts</code>) aur rehearse (<code>--check --diff</code>) nahi kiya us par bharosa mat karo. Asli passwords plain files mein mat rakho. Playbook hamesha doosri baar chalao aur <code>changed=0</code> dhoondho.</p></div>
<div class="exam"><p><b>Exam trap round-up.</b> Inventory name device hostname nahi hai; <code>[x:children]</code> groups list karta hai; <code>ansible --version</code> <i>active</i> config dikhata hai; check mode best effort hai; save karna change karne se alag faisla hai.</p></div>

<div class="scn"><h4>Aapka pehla production-style change, shuru se aakhir tak</h4><p>Ek team ko aaj raat 60 devices par naya syslog server chahiye. Engineer hosts list karta hai, ek canary router par <code>--check --diff</code> ke saath playbook chalata hai, us router par apply karta hai, doosri baar chalakar <code>changed=0</code> dekhta hai, phir poora group <code>save_when: modified</code> ke saath chalata hai. Ticket mein dry-run output aur saaf recap sabut ke roop mein lagte hain.</p><p><b>Lesson:</b> is module mein banai aadatein (dekho, rehearse, apply, repeat) teen lab devices se saath production devices tak scale hoti hain.</p></div>

<div class="iv"><p class="q">"Apna pehla Ansible change safely kaise chalaoge, batao."</p><p>Main <code>ansible-inventory --graph</code> se inventory confirm karta hoon, <code>ping</code> se login test karta hoon, target hosts list karta hoon, <code>--check --diff</code> se rehearse karta hoon, <code>-l</code> se ek canary device par apply karta hoon, phir group par, aur run repeat karke <code>changed=0</code> confirm karta hoon. Configuration save karne ka faisla khud karta hoon aur secrets plain text mein nahi rakhta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control node plus inventory plus playbook poora model hai; devices ko sirf SSH chahiye.</li>
<li>FQCN module names aur network_cli connection variables use karo.</li>
<li>Dekho, rehearse karo, apply karo, repeat karo; saaf doosra run sabut hai.</li>
<li>Syntax se inventory, connection, phir module tak troubleshoot karo.</li>
<li>Aage: Ansible 2 mein YAML inventories, group_vars aur host_vars se scale karo.</li>
</ul></div>
`}};export{e as default};