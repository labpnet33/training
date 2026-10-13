var e={id:`group-vars-host-vars`,h:{en:`group_vars and host_vars: values live next to the inventory`,hi:`group_vars aur host_vars: values inventory ke saath rehti hain`},body:{en:`
<p>So far the inventory only says <i>who</i> your devices are. The values that make a device different, such as its site name, SNMP location or NTP server, should not be typed into playbooks. Ansible has a standard place for them: two folders called <code>group_vars</code> and <code>host_vars</code>, kept beside the inventory file. Ansible loads them automatically. There is nothing to import and no setting to switch on.</p>

<h3>The layout</h3>
<pre class="out">AUTO01$ ls -R group_vars host_vars
group_vars:
all.yml  bengaluru.yml  pune.yml
host_vars:
pun-core-r1.yml</pre>
<p>The rule is simple: <b>the file name is the group or host name</b>, plus <code>.yml</code>. A file called <code>pune.yml</code> in <code>group_vars</code> applies to every host in the group <code>pune</code>. A file called <code>pun-core-r1.yml</code> in <code>host_vars</code> applies to that one host. The special group <code>all</code> reaches every host.</p>

<h3>What goes inside</h3>
<p>Each file is plain YAML: one variable per line, written as <code>name: value</code>. There is no <code>---</code> needed and no <code>vars:</code> heading. Here are the three files that matter, shown without the lab login password line, which chapter 5 handles properly.</p>
<pre class="code">AUTO01$ cat group_vars/all.yml
ansible_connection: ansible.netcommon.network_cli
ansible_network_os: cisco.ios.ios
ansible_user: netops
snmp_contact: noc@nk.lab

AUTO01$ cat group_vars/pune.yml
site: Pune
snmp_location: Pune DC rack A2

AUTO01$ cat group_vars/bengaluru.yml
site: Bengaluru
snmp_location: Bengaluru DC rack B1

AUTO01$ cat host_vars/pun-core-r1.yml
snmp_location: Pune core room</pre>
<ul>
<li><code>ansible_connection</code>, <code>ansible_network_os</code> and <code>ansible_user</code> are <b>connection variables</b>: they tell Ansible how to log in. Putting them in <code>all.yml</code> means every device gets them without repetition.</li>
<li><code>snmp_contact</code> is a value the whole company shares, so it also lives in <code>all.yml</code>.</li>
<li><code>site</code> and <code>snmp_location</code> differ per place, so each site group file sets its own.</li>
<li>The one exception, the Pune core room, is a <b>host variable</b>: it affects only <code>pun-core-r1</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Variable files feeding a host">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">group_vars/all.yml</text>
<rect x="20" y="85" width="180" height="40" rx="8" fill="#fde68a"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">group_vars/pune.yml</text>
<rect x="20" y="150" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">host_vars/pun-core-r1.yml</text>
<line x1="200" y1="40" x2="400" y2="105" stroke="#64748b" stroke-width="1.5"/><line x1="200" y1="105" x2="400" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="200" y1="170" x2="400" y2="120" stroke="#64748b" stroke-width="1.5"/>
<rect x="400" y="75" width="200" height="75" rx="10" fill="#bae6fd"/><text x="500" y="105" text-anchor="middle" class="svg-ink" font-size="13">pun-core-r1</text><text x="500" y="128" text-anchor="middle" class="svg-muted" font-size="12">all three merged</text>
</svg><p class="cap">Ansible merges every file that matches the host's name or groups.</p></div>

<h3>See the effect</h3>
<p>This tiny playbook prints which contact each router uses. Both values come from <code>group_vars/all.yml</code>, because no other level sets one yet.</p>
<pre class="code">---
- name: Which contact wins
  hosts: routers
  gather_facts: false
  tasks:
    - name: Show the contact
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} uses {{ snmp_contact }}"</pre>
<p>Line by line: <code>hosts: routers</code> picks the role group; <code>gather_facts: false</code> skips fact collection because a debug needs none; the debug <code>msg</code> contains two variables in double curly braces, and the whole string is quoted.</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
PLAY [Which contact wins] *****************************************************
TASK [Show the contact] *******************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses noc@nk.lab"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<h3>Use them in a real task</h3>
<p>The lab playbook <code>snmp.yml</code> pushes each device's own location and contact. The device-specific words never appear in the playbook.</p>
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
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is in Bengaluru"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The task uses <code>cisco.ios.ios_config</code> with two lines, <code>snmp-server location</code> and <code>snmp-server contact</code>, each ending in a variable in double curly braces. The same task configured three devices three ways, and adding a fourth device means adding a file, not editing the playbook.</p>

<div class="warn"><p><b>Common beginner mistake.</b> A wrong file name. <code>group_vars/Bengaluru.yml</code> does not match the group <code>bengaluru</code>, because names are case sensitive. Ansible does not complain; it quietly loads nothing. Chapter 8 shows the symptom.</p></div>
<div class="exam"><p><b>Exam trap.</b> The folders must sit next to the inventory file or next to the playbook. A <code>group_vars</code> folder somewhere else is ignored. A host can also have a <i>directory</i> <code>host_vars/pun-core-r1/</code> holding several files; all are read.</p></div>

<div class="scn"><h4>The new Bengaluru switch</h4><p>A Bengaluru switch was added to the inventory under the <code>bengaluru</code> and <code>switches</code> groups. Nobody wrote a variable file for it. The next playbook run still configured the right location and site, because the host inherited both from <code>group_vars/bengaluru.yml</code>.</p></div>

<div class="iv"><p class="q">"Where do you keep device-specific values in Ansible?"</p><p>In <code>group_vars</code> for values shared by a group, and <code>host_vars</code> for exceptions. The file name must match the group or host name. Playbooks stay generic and read variables by name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>group_vars/NAME.yml</code> applies to a group; <code>host_vars/NAME.yml</code> applies to one host.</li>
<li><code>group_vars/all.yml</code> reaches every host.</li>
<li>Files are plain YAML, one variable per line, loaded automatically.</li>
<li>File names are case sensitive, and a wrong name is ignored silently.</li>
<li>Keep playbooks generic; keep values in these files.</li>
</ul></div>
`,hi:`
<p>Ab tak inventory sirf batati thi ki aapke devices <i>kaun</i> hain. Jin values se device alag banta hai, jaise site name, SNMP location ya NTP server, unhe playbooks mein type nahi karna chahiye. Ansible ke paas iske liye standard jagah hai: <code>group_vars</code> aur <code>host_vars</code> naam ke do folders, jo inventory file ke bagal mein rakhte hain. Ansible inhe apne aap load karta hai. Import karne ya koi setting on karne ki zaroorat nahi.</p>

<h3>Layout</h3>
<pre class="out">AUTO01$ ls -R group_vars host_vars
group_vars:
all.yml  bengaluru.yml  pune.yml
host_vars:
pun-core-r1.yml</pre>
<p>Rule simple hai: <b>file ka naam group ya host ka naam</b> hota hai, saath mein <code>.yml</code>. <code>group_vars</code> mein <code>pune.yml</code> naam ki file group <code>pune</code> ke har host par lagti hai. <code>host_vars</code> mein <code>pun-core-r1.yml</code> sirf us ek host par. Special group <code>all</code> har host tak pahunchta hai.</p>

<h3>Andar kya jaata hai</h3>
<p>Har file plain YAML hai: ek line mein ek variable, <code>name: value</code> ke roop mein. <code>---</code> ki zaroorat nahi aur <code>vars:</code> heading bhi nahi. Neeche teen zaroori files hain, lab ke login password wali line ke bina, jise chapter 5 theek se sambhalta hai.</p>
<pre class="code">AUTO01$ cat group_vars/all.yml
ansible_connection: ansible.netcommon.network_cli
ansible_network_os: cisco.ios.ios
ansible_user: netops
snmp_contact: noc@nk.lab

AUTO01$ cat group_vars/pune.yml
site: Pune
snmp_location: Pune DC rack A2

AUTO01$ cat group_vars/bengaluru.yml
site: Bengaluru
snmp_location: Bengaluru DC rack B1

AUTO01$ cat host_vars/pun-core-r1.yml
snmp_location: Pune core room</pre>
<ul>
<li><code>ansible_connection</code>, <code>ansible_network_os</code> aur <code>ansible_user</code> <b>connection variables</b> hain: Ansible ko batate hain login kaise karna hai. <code>all.yml</code> mein rakhne se har device ko bina repeat kiye mil jaate hain.</li>
<li><code>snmp_contact</code> aisi value hai jo poori company share karti hai, isliye woh bhi <code>all.yml</code> mein.</li>
<li><code>site</code> aur <code>snmp_location</code> har jagah ke liye alag hain, isliye har site group file apni set karti hai.</li>
<li>Ek exception, Pune ka core room, <b>host variable</b> hai: sirf <code>pun-core-r1</code> par asar karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Variable files ek host ko feed karti hain">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">group_vars/all.yml</text>
<rect x="20" y="85" width="180" height="40" rx="8" fill="#fde68a"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="13">group_vars/pune.yml</text>
<rect x="20" y="150" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">host_vars/pun-core-r1.yml</text>
<line x1="200" y1="40" x2="400" y2="105" stroke="#64748b" stroke-width="1.5"/><line x1="200" y1="105" x2="400" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="200" y1="170" x2="400" y2="120" stroke="#64748b" stroke-width="1.5"/>
<rect x="400" y="75" width="200" height="75" rx="10" fill="#bae6fd"/><text x="500" y="105" text-anchor="middle" class="svg-ink" font-size="13">pun-core-r1</text><text x="500" y="128" text-anchor="middle" class="svg-muted" font-size="12">teeno merge hote hain</text>
</svg><p class="cap">Host ke naam ya groups se match karne wali har file Ansible merge karta hai.</p></div>

<h3>Asar dekho</h3>
<p>Yeh chhota playbook print karta hai ki har router kaunsa contact use karta hai. Dono values <code>group_vars/all.yml</code> se aati hain, kyunki abhi koi aur level set nahi karta.</p>
<pre class="code">---
- name: Which contact wins
  hosts: routers
  gather_facts: false
  tasks:
    - name: Show the contact
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} uses {{ snmp_contact }}"</pre>
<p>Line by line: <code>hosts: routers</code> role group chunta hai; <code>gather_facts: false</code> fact collection chhodta hai kyunki debug ko woh nahi chahiye; debug <code>msg</code> mein double curly braces ke andar do variables hain, aur poori string quoted hai.</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
PLAY [Which contact wins] *****************************************************
TASK [Show the contact] *******************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses noc@nk.lab"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<h3>Asli task mein use karo</h3>
<p>Lab playbook <code>snmp.yml</code> har device ki apni location aur contact push karta hai. Device-specific shabd playbook mein kabhi nahi aate.</p>
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
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is in Bengaluru"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Task <code>cisco.ios.ios_config</code> use karta hai, do lines ke saath, <code>snmp-server location</code> aur <code>snmp-server contact</code>, jinke end mein double curly braces mein variable hai. Ek hi task ne teen devices ko teen tarah configure kiya, aur chautha device jodna matlab file jodna, playbook edit karna nahi.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Galat file name. <code>group_vars/Bengaluru.yml</code> group <code>bengaluru</code> se match nahi karti, kyunki naam case sensitive hain. Ansible shikayat nahi karta; chup-chaap kuch load nahi karta. Chapter 8 mein iska symptom dikhega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Folders inventory file ke bagal mein ya playbook ke bagal mein hone chahiye. Kahin aur rakha <code>group_vars</code> folder ignore hota hai. Host ke liye <i>directory</i> <code>host_vars/pun-core-r1/</code> bhi ho sakti hai jisme kai files hon; sab padhi jaati hain.</p></div>

<div class="scn"><h4>Naya Bengaluru switch</h4><p>Bengaluru ka ek switch inventory mein <code>bengaluru</code> aur <code>switches</code> groups ke neeche joda gaya. Uske liye kisi ne variable file nahi likhi. Agla playbook run phir bhi sahi location aur site configure kar gaya, kyunki host ne dono <code>group_vars/bengaluru.yml</code> se inherit kar liye.</p></div>

<div class="iv"><p class="q">"Ansible mein device-specific values kahan rakhte ho?"</p><p>Group ke shared values <code>group_vars</code> mein, exceptions <code>host_vars</code> mein. File ka naam group ya host naam se match hona chahiye. Playbooks generic rehte hain aur variables naam se padhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>group_vars/NAME.yml</code> group par lagti hai; <code>host_vars/NAME.yml</code> ek host par.</li>
<li><code>group_vars/all.yml</code> har host tak pahunchti hai.</li>
<li>Files plain YAML hain, ek line mein ek variable, apne aap load hoti hain.</li>
<li>File names case sensitive hain, aur galat naam chup-chaap ignore hota hai.</li>
<li>Playbooks generic rakho; values in files mein.</li>
</ul></div>
`}};export{e as default};