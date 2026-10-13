var e={id:`troubleshooting`,h:{en:`Troubleshooting inventory and variable problems`,hi:`Inventory aur variable problems ki troubleshooting`},body:{en:`
<p>Inventory problems are quiet. Ansible rarely crashes; it just uses a different value than you expected. This chapter gives you a method, and then walks one full fault-finding session with three separate causes hidden in one project. The method has three questions, in this order: <b>what does Ansible think the host is, where did the value come from, and what will it touch?</b></p>

<h3>The three-tool method</h3>
<table class="cmp"><tr><th>Question</th><th>Tool</th></tr>
<tr><td>Which groups and hosts exist?</td><td><code>ansible-inventory --graph</code></td></tr>
<tr><td>What are this host's final variables?</td><td><code>ansible-inventory --host NAME</code></td></tr>
<tr><td>Which file sets this variable?</td><td><code>grep -rn VARIABLE group_vars host_vars</code> and then the playbook</td></tr></table>

<h3>The case file</h3>
<p>A colleague extended the project. Since then <code>snmp.yml</code> fails on <code>blr-edge-r2</code>, Bengaluru shows a Pune location and the NOC contact is wrong everywhere. Start by running it:</p>
<pre class="out">AUTO01$ ansible-playbook snmp.yml
PLAY [SNMP identity] **********************************************************
TASK [Location and contact] ***************************************************
changed: [pun-core-r1]
changed: [pun-acc-sw1]
changed: [blr-edge-r2]
TASK [Where am I] *************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "The task includes an option with an undefined variable. The error was: 'site' is undefined. 'site' is undefined\\n\\nThe error appears to be in '/home/netadmin/netauto/snmp.yml': line 14, column 7, but may\\nbe elsewhere in the file depending on the exact syntax problem.\\n\\nThe offending line appears to be:\\n\\n\\n    - name: Where am I\\n      ^ here"}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>The error names the variable: <code>site</code> is undefined, but only for <code>blr-edge-r2</code>. Pune hosts have it, so the Bengaluru group file is not being read.</p>

<h3>Cause 1: a file name in the wrong case</h3>
<pre class="out">AUTO01$ ls group_vars
all.yml  Bengaluru.yml  pune.yml
AUTO01$ mv group_vars/Bengaluru.yml group_vars/bengaluru.yml</pre>
<p>The group is <code>bengaluru</code> with a lowercase b. The file had a capital B, so Ansible found no match and loaded nothing, with no warning. Renaming fixes it. Check the host again:</p>
<pre class="out">AUTO01$ ansible-inventory --host blr-edge-r2
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.2",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "site": "Bengaluru",
    "snmp_contact": "noc@nk.lab",
    "snmp_location": "Pune DC rack A2"
}</pre>
<p><code>site</code> is back, but <code>snmp_location</code> is the Pune value. Something stronger than the group file is setting it.</p>

<h3>Cause 2: a host_vars file copied from a template</h3>
<pre class="out">AUTO01$ grep -rn snmp_location group_vars host_vars
group_vars/bengaluru.yml:2:snmp_location: Bengaluru DC rack B1
group_vars/pune.yml:2:snmp_location: Pune DC rack A2
host_vars/blr-edge-r2.yml:2:snmp_location: Pune DC rack A2
host_vars/pun-core-r1.yml:1:snmp_location: Pune core room</pre>
<p>The third line is the culprit: <code>host_vars/blr-edge-r2.yml</code> was copied from the Pune template. Host beats group, so the stale value wins. Delete the wrong line and check again:</p>
<pre class="out">AUTO01$ sed -i '/snmp_location/d' host_vars/blr-edge-r2.yml
AUTO01$ ansible-inventory --host blr-edge-r2
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.2",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "site": "Bengaluru",
    "snmp_contact": "noc@nk.lab",
    "snmp_location": "Bengaluru DC rack B1"
}</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three-step diagnosis flow">
<rect x="20" y="50" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="13">1. Group file</text><text x="105" y="102" text-anchor="middle" class="svg-muted" font-size="11">wrong case, not loaded</text>
<rect x="235" y="50" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2. Host file</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="11">stale value wins</text>
<rect x="450" y="50" width="170" height="80" rx="10" fill="#bae6fd"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">3. Play vars</text><text x="535" y="102" text-anchor="middle" class="svg-muted" font-size="11">override everything</text>
<line x1="190" y1="90" x2="235" y2="90" stroke="#64748b" stroke-width="2"/><line x1="405" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three different layers broke one project; each needed its own check.</p></div>

<h3>Cause 3: vars in the playbook</h3>
<p>Run again. It succeeds, but the contact is still not the NOC address from <code>group_vars/all.yml</code>. The play-level <code>vars:</code> block, lines 5 and 6 of <code>snmp.yml</code>, sets <code>snmp_contact: noc@example.com</code>, and play vars beat group_vars. Delete those two lines, then run twice:</p>
<pre class="out">AUTO01$ sed -i '5,6d' snmp.yml
AUTO01$ ansible-playbook snmp.yml
PLAY [SNMP identity] **********************************************************
TASK [Location and contact] ***************************************************
changed: [pun-core-r1]
changed: [pun-acc-sw1]
changed: [blr-edge-r2]
TASK [Where am I] *************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is in Bengaluru"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
AUTO01$ ansible-playbook snmp.yml
PLAY [SNMP identity] **********************************************************
TASK [Location and contact] ***************************************************
ok: [pun-core-r1]
ok: [pun-acc-sw1]
ok: [blr-edge-r2]
TASK [Where am I] *************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is in Bengaluru"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The first run changed all three devices, because the correct NOC contact replaced the wrong one. The second run shows changed=0 everywhere: the project is idempotent and the three faults are fixed at their proper level.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Fixing a symptom at the wrong level, for example adding <code>-e snmp_location=...</code> to every run. That hides the bad file instead of repairing it, and the next engineer falls into the same hole. Fix the file that is wrong.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible-inventory --host</code> shows inventory variables only. It will not show play <code>vars:</code> or <code>-e</code>. If the inventory output is right but the run still differs, look in the playbook and the command line.</p></div>

<div class="scn"><h4>Three bugs, one ticket</h4><p>One ticket said "Bengaluru router has wrong SNMP data". It had three causes in three layers. The engineer who fixed only the first one closed the ticket; two days later it returned. The team now follows the three-tool method and finishes with a second run that shows changed=0.</p></div>

<div class="iv"><p class="q">"A variable has the wrong value on one host. How do you find out why?"</p><p>I run <code>ansible-inventory --host</code> to see the final inventory values, grep the group_vars and host_vars folders for the name, and then check the playbook's <code>vars:</code> and the command line for overrides. I fix the file at the right level and prove it with a second run that changes nothing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: graph, host view, grep, then the playbook.</li>
<li>A wrong-case file name is loaded by nobody and warns nobody.</li>
<li>Host variables beat group variables; play vars beat both.</li>
<li><code>ansible-inventory</code> shows inventory values only, not play vars.</li>
<li>Finish every fix with a second run that reports changed=0.</li>
</ul></div>
`,hi:`
<p>Inventory problems chup-chaap hoti hain. Ansible shayad hi crash hota hai; woh bas aapki ummeed se alag value use karta hai. Yeh chapter aapko ek method deta hai, phir ek poora fault-finding session dikhata hai jisme ek project mein teen alag wajah chhupi hain. Method ke teen sawaal is order mein hain: <b>Ansible host ko kya samajhta hai, value kahan se aayi, aur woh kise chhuega?</b></p>

<h3>Teen-tool method</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Tool</th></tr>
<tr><td>Kaun se groups aur hosts hain?</td><td><code>ansible-inventory --graph</code></td></tr>
<tr><td>Is host ke final variables kya hain?</td><td><code>ansible-inventory --host NAME</code></td></tr>
<tr><td>Yeh variable kaunsi file set karti hai?</td><td><code>grep -rn VARIABLE group_vars host_vars</code> aur phir playbook</td></tr></table>

<h3>Case file</h3>
<p>Ek colleague ne project badhaya. Tab se <code>snmp.yml</code> <code>blr-edge-r2</code> par fail hota hai, Bengaluru Pune ki location dikhata hai aur NOC contact har jagah galat hai. Pehle chalao:</p>
<pre class="out">AUTO01$ ansible-playbook snmp.yml
PLAY [SNMP identity] **********************************************************
TASK [Location and contact] ***************************************************
changed: [pun-core-r1]
changed: [pun-acc-sw1]
changed: [blr-edge-r2]
TASK [Where am I] *************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "The task includes an option with an undefined variable. The error was: 'site' is undefined. 'site' is undefined\\n\\nThe error appears to be in '/home/netadmin/netauto/snmp.yml': line 14, column 7, but may\\nbe elsewhere in the file depending on the exact syntax problem.\\n\\nThe offending line appears to be:\\n\\n\\n    - name: Where am I\\n      ^ here"}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Error variable ka naam batata hai: <code>site</code> undefined hai, par sirf <code>blr-edge-r2</code> ke liye. Pune hosts ke paas hai, matlab Bengaluru group file padhi nahi ja rahi.</p>

<h3>Wajah 1: galat case wala file name</h3>
<pre class="out">AUTO01$ ls group_vars
all.yml  Bengaluru.yml  pune.yml
AUTO01$ mv group_vars/Bengaluru.yml group_vars/bengaluru.yml</pre>
<p>Group <code>bengaluru</code> hai, chhote b ke saath. File mein capital B tha, isliye Ansible ko match nahi mila aur bina warning ke kuch load nahi hua. Rename se theek hota hai. Host ko dobara dekho:</p>
<pre class="out">AUTO01$ ansible-inventory --host blr-edge-r2
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.2",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "site": "Bengaluru",
    "snmp_contact": "noc@nk.lab",
    "snmp_location": "Pune DC rack A2"
}</pre>
<p><code>site</code> wapas aa gaya, par <code>snmp_location</code> Pune wali value hai. Group file se kuch taakatwar ise set kar raha hai.</p>

<h3>Wajah 2: template se copy hui host_vars file</h3>
<pre class="out">AUTO01$ grep -rn snmp_location group_vars host_vars
group_vars/bengaluru.yml:2:snmp_location: Bengaluru DC rack B1
group_vars/pune.yml:2:snmp_location: Pune DC rack A2
host_vars/blr-edge-r2.yml:2:snmp_location: Pune DC rack A2
host_vars/pun-core-r1.yml:1:snmp_location: Pune core room</pre>
<p>Teesri line doshi hai: <code>host_vars/blr-edge-r2.yml</code> Pune template se copy hui thi. Host group ko harata hai, isliye purani value jeet rahi hai. Galat line hatao aur dobara check karo:</p>
<pre class="out">AUTO01$ sed -i '/snmp_location/d' host_vars/blr-edge-r2.yml
AUTO01$ ansible-inventory --host blr-edge-r2
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.2",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "site": "Bengaluru",
    "snmp_contact": "noc@nk.lab",
    "snmp_location": "Bengaluru DC rack B1"
}</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Teen-step diagnosis flow">
<rect x="20" y="50" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="13">1. Group file</text><text x="105" y="102" text-anchor="middle" class="svg-muted" font-size="11">galat case, load nahi hui</text>
<rect x="235" y="50" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2. Host file</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="11">purani value jeetti hai</text>
<rect x="450" y="50" width="170" height="80" rx="10" fill="#bae6fd"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">3. Play vars</text><text x="535" y="102" text-anchor="middle" class="svg-muted" font-size="11">sab ko override</text>
<line x1="190" y1="90" x2="235" y2="90" stroke="#64748b" stroke-width="2"/><line x1="405" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen alag layers ne ek project tod diya; har ek ko apna check chahiye tha.</p></div>

<h3>Wajah 3: playbook mein vars</h3>
<p>Phir chalao. Chal jaata hai, par contact abhi bhi <code>group_vars/all.yml</code> wala NOC address nahi hai. Play-level <code>vars:</code> block, <code>snmp.yml</code> ki line 5 aur 6, <code>snmp_contact: noc@example.com</code> set karta hai, aur play vars group_vars ko harate hain. Woh do lines hatao, phir do baar chalao:</p>
<pre class="out">AUTO01$ sed -i '5,6d' snmp.yml
AUTO01$ ansible-playbook snmp.yml
PLAY [SNMP identity] **********************************************************
TASK [Location and contact] ***************************************************
changed: [pun-core-r1]
changed: [pun-acc-sw1]
changed: [blr-edge-r2]
TASK [Where am I] *************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is in Bengaluru"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
AUTO01$ ansible-playbook snmp.yml
PLAY [SNMP identity] **********************************************************
TASK [Location and contact] ***************************************************
ok: [pun-core-r1]
ok: [pun-acc-sw1]
ok: [blr-edge-r2]
TASK [Where am I] *************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is in Bengaluru"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Pehle run ne teeno devices ko change kiya, kyunki sahi NOC contact ne galat wale ki jagah li. Doosre run mein har jagah changed=0 hai: project idempotent hai aur teeno faults apne sahi level par theek ho gaye.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Symptom ko galat level par theek karna, jaise har run mein <code>-e snmp_location=...</code> jodna. Isse kharab file chhup jaati hai, theek nahi hoti, aur agla engineer usi gaddhe mein girta hai. Jo file galat hai use theek karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible-inventory --host</code> sirf inventory variables dikhata hai. Woh play <code>vars:</code> ya <code>-e</code> nahi dikhayega. Inventory output sahi ho par run phir bhi alag ho, to playbook aur command line mein dekho.</p></div>

<div class="scn"><h4>Ek ticket, teen bugs</h4><p>Ek ticket mein likha tha "Bengaluru router ka SNMP data galat hai". Teen layers mein teen wajah thi. Jis engineer ne sirf pehli theek ki usne ticket close kar diya; do din baad wapas aaya. Ab team teen-tool method follow karti hai aur aise doosre run par khatam karti hai jo changed=0 dikhata hai.</p></div>

<div class="iv"><p class="q">"Ek host par variable ki value galat hai. Wajah kaise dhoondhoge?"</p><p>Main <code>ansible-inventory --host</code> se final inventory values dekhta hoon, group_vars aur host_vars folders mein naam grep karta hoon, phir playbook ke <code>vars:</code> aur command line mein overrides check karta hoon. Sahi level par file theek karta hoon aur doosre run se sabit karta hoon jo kuch change nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: graph, host view, grep, phir playbook.</li>
<li>Galat-case file name ko koi load nahi karta aur koi warn nahi karta.</li>
<li>Host variables group variables ko harate hain; play vars dono ko.</li>
<li><code>ansible-inventory</code> sirf inventory values dikhata hai, play vars nahi.</li>
<li>Har fix doosre run se khatam karo jo changed=0 report kare.</li>
</ul></div>
`}};export{e as default};