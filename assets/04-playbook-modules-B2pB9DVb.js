var e={id:`playbook-modules`,h:{en:`The playbook: plays, tasks and modules (WHAT to do)`,hi:`Playbook: plays, tasks aur modules (KYA karna hai)`},body:{en:`

<p><b>One idea in this chapter:</b> a playbook is a list of jobs written in YAML. Each job calls a <b>module</b>, a ready-made tool, so you describe what you want and Ansible knows how to do it.</p>
<div class="dia"><svg viewBox="0 0 640 225" role="img" aria-label="A playbook holds plays; a play picks a group and runs its tasks in order; each task calls one module."><rect x="20" y="10" width="600" height="200" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="38" y="34" class="svg-ink" font-size="13">PLAYBOOK (a list of plays)</text><rect x="45" y="46" width="550" height="150" rx="10" fill="#e0f2fe" stroke="#7dd3fc"/><text x="62" y="68" class="svg-ink" font-size="13">PLAY: name + hosts (which group)</text><rect x="70" y="80" width="240" height="100" rx="8" fill="#fde68a"/><text x="190" y="102" text-anchor="middle" class="svg-ink" font-size="13">TASK 1</text><text x="190" y="124" text-anchor="middle" class="svg-muted" font-size="12">module: ios_command</text><text x="190" y="144" text-anchor="middle" class="svg-muted" font-size="12">commands: show version</text><rect x="330" y="80" width="240" height="100" rx="8" fill="#bbf7d0"/><text x="450" y="102" text-anchor="middle" class="svg-ink" font-size="13">TASK 2</text><text x="450" y="124" text-anchor="middle" class="svg-muted" font-size="12">module: debug</text><text x="450" y="144" text-anchor="middle" class="svg-muted" font-size="12">prints the saved result</text></svg><p class="cap">A playbook holds plays; a play picks a group and runs its tasks in order; each task calls one module.</p></div>

<h3>Reading a real playbook line by line</h3>
<p>This is <code>show.yml</code> from Lab 1. It only <i>reads</i> information, so it is safe to run anywhere.</p>
<pre class="code">---
<span class="c"># show.yml - a READ-ONLY playbook: runs "show version" on every router</span>
- name: Collect the software version
  hosts: routers
  gather_facts: no
  tasks:
    - name: Run show version
      ios_command:
        commands:
          - show version
      register: ver          <span class="c"># keep the result in a variable called ver</span>

    - name: Print the first line of the output
      debug:
        var: ver.stdout_lines[0][0]</pre>
<ul>
<li><b><code>- name: Collect the software version</code></b> starts a <b>play</b>. The dash makes it the first item of the playbook's list. The name is a label for people.</li>
<li><b><code>hosts: routers</code></b> says which inventory group the play runs against. Spelling matters; it must match the group name from chapter 2.</li>
<li><b><code>gather_facts: no</code></b> skips the automatic fact-collection step, which is meant for servers, so network playbooks are faster without it.</li>
<li><b><code>tasks:</code></b> starts the list of tasks. They run in order, top to bottom, on every host of the play.</li>
<li>Each task has a <b>name</b> (printed while it runs), then the <b>module</b> (<code>ios_command</code>), then the module's <b>parameters</b> indented under it (<code>commands:</code>).</li>
<li><b><code>register: ver</code></b> saves the task's result into a variable called <code>ver</code>, so the next task can use it. The <b>debug</b> module prints a value so you can see it.</li>
</ul>

<h3>Running it</h3>
<pre class="code">ansible-playbook -i inventory.ini show.yml</pre>
<pre class="out">PLAY [Collect the software version] *******************************************

TASK [Run show version] *******************************************************
ok: [R1]
ok: [R2]

TASK [Print the first line of the output] *************************************
ok: [R1] =&gt; {
    "ver.stdout_lines[0][0]": "Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
}
ok: [R2] =&gt; {
    "ver.stdout_lines[0][0]": "Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
}

PLAY RECAP ********************************************************************
R1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The output follows the file: a <code>PLAY</code> banner, one <code>TASK</code> banner per task, and one line per host showing the result. Both tasks say <b>ok</b>, and the recap shows <code>changed=0</code>. A show command only reads, so Ansible never calls it changed. That answers the Lab 1 question about changed= for R1: zero.</p>

<h3>The modules you need to know</h3>
<table class="cmp"><tr><th>Module</th><th>What it does</th><th>Changes the device?</th></tr><tr><td>ios_command</td><td>runs show or exec commands and returns the output</td><td>no</td></tr><tr><td>ios_config</td><td>pushes configuration lines (use parents: for lines under an interface)</td><td>yes</td></tr><tr><td>ios_vlans</td><td>manages the VLAN database from a list of vlan_id and name</td><td>yes</td></tr><tr><td>ios_facts</td><td>collects device information</td><td>no</td></tr><tr><td>ping</td><td>tests that Ansible can log in</td><td>no</td></tr><tr><td>debug</td><td>prints a message or variable on the control node</td><td>no</td></tr></table>
<p>Module names start with the device family: <code>ios_</code> for Cisco IOS. Other platforms use their own prefix (for example <code>nxos_</code>, <code>junos_</code>, <code>eos_</code>). The Ansible track covers more of them. For a quick reference to any module's parameters, ask <code>ansible-doc</code>:</p>
<pre class="code">ansible-doc ios_config</pre>
<pre class="out">&gt; IOS_CONFIG

  Push configuration lines (optionally under parents such as an interface) and report changed only when the running-config really changes.

OPTIONS (lines, commands, parents, before, after, match, replace, save_when, backup, defaults, running_config, diff_against, intended_config, multiline_delimiter):
  lines (or commands): list of configuration lines, written exactly as in the running-config
  parents: the section the lines belong to, e.g. [interface GigabitEthernet0/1]
  save_when: always | never | modified | changed  (copy running to startup)
  backup: yes = save the running-config to backup/ on the controller first</pre>
<p>The doc page for the simulator is shortened compared with real Ansible, but it shows the important parameters: <code>lines</code> (what to push), <code>parents</code> (where it belongs), and <code>save_when</code> (copy running to startup).</p>

<h3>A config playbook: ntp.yml</h3>
<pre class="code">---
<span class="c"># ntp.yml - a CONFIG playbook: every router uses the NOC server for time and logs</span>
- name: Standard time and logging
  hosts: routers
  gather_facts: no
  vars:
    noc_server: 10.99.0.100      <span class="c"># one variable, used twice below</span>
  tasks:
    - name: Point NTP and syslog at the NOC server
      ios_config:
        lines:
          - ntp server {{ noc_server }}
          - logging host {{ noc_server }}</pre>
<p>The structure is the same as show.yml, but the module is <code>ios_config</code> and it pushes two lines. The <code>{{ noc_server }}</code> pieces are placeholders that Ansible replaces with the variable value 10.99.0.100; chapter 7 explains variables. The lines are written exactly as you would type them on the router in configuration mode.</p>

<h3>One-off commands without a playbook</h3>
<p>For a quick question you do not need a file. The <code>ansible</code> command (without the -playbook) runs a single module against a group. <code>-a</code> gives the module's arguments:</p>
<pre class="code">ansible routers -i inventory.ini -m ios_command -a "commands='show clock'"</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "stdout": [
        "*01:16:07.410 UTC Fri Oct 2 2026"
    ],
    "stdout_lines": [
        [
            "*01:16:07.410 UTC Fri Oct 2 2026"
        ]
    ]
}
R2 | SUCCESS =&gt; {
    "changed": false,
    "stdout": [
        "*01:16:07.410 UTC Fri Oct 2 2026"
    ],
    "stdout_lines": [
        [
            "*01:16:07.410 UTC Fri Oct 2 2026"
        ]
    ]
}</pre>
<p>These "ad-hoc" commands are perfect for checking the same show command on many devices. The time shown here comes from the lab clock, so yours will differ.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1, task 3. You run show.yml. Both routers answer ok for both tasks, the debug task prints the first line of show version for each, and the PLAY RECAP says changed=0. You now have proof, in one command, that both routers run the same software version.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Writing parameters at the same indentation as the module name instead of under it. Typing a module name wrongly, which gives an error before anything runs. Forgetting that ios_config lines must look like real configuration (no leading "configure terminal").</p></div>
<div class="exam"><p><b>Exam trap.</b> A play maps a group of hosts to tasks. Tasks run in order. A module is a task. ios_command reads; ios_config changes. register stores a result and debug prints it.</p></div>

<div class="scn"><h4>The version audit</h4><p>Before an upgrade window an operations team needed the software version of 120 routers. A senior engineer wrote a ten-line show.yml, ran it, and saved the output into the change ticket. What used to take two engineers a day took four minutes, and the report was the playbook output itself, so there was no copy-and-paste error.</p><p><b>Lesson:</b> read-only playbooks are the safest first automation: they build trust in the tool.</p></div>
<div class="iv"><p class="q">"What are the main parts of a playbook?"</p><p>A playbook is a YAML list of plays. Each play names a hosts group from the inventory and a list of tasks. Each task calls a module with parameters, for example ios_command to run show commands or ios_config to push configuration lines. register saves a task result, debug prints it, and tasks run in order on every host.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Playbook, then play (name, hosts, tasks), then tasks, then modules with parameters.</li><li>hosts must match a group in the inventory; tasks run top to bottom.</li><li>ios_command reads; ios_config and ios_vlans change; ping tests login; debug prints.</li><li>register saves a result so a later task can use it.</li><li>ansible-doc MODULE lists the parameters; the ansible command runs a single module without a playbook.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> playbook YAML mein likhi jobs ki list hai. Har job ek <b>module</b> bulata hai, jo ready-made tool hai, isliye aap batate ho ki kya chahiye aur Ansible jaanta hai kaise karna hai.</p>
<div class="dia"><svg viewBox="0 0 640 225" role="img" aria-label="Playbook mein plays hote hain; play ek group chunta hai aur tasks order se chalata hai; har task ek module bulata hai."><rect x="20" y="10" width="600" height="200" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="38" y="34" class="svg-ink" font-size="13">PLAYBOOK (plays ki list)</text><rect x="45" y="46" width="550" height="150" rx="10" fill="#e0f2fe" stroke="#7dd3fc"/><text x="62" y="68" class="svg-ink" font-size="13">PLAY: name + hosts (kaun sa group)</text><rect x="70" y="80" width="240" height="100" rx="8" fill="#fde68a"/><text x="190" y="102" text-anchor="middle" class="svg-ink" font-size="13">TASK 1</text><text x="190" y="124" text-anchor="middle" class="svg-muted" font-size="12">module: ios_command</text><text x="190" y="144" text-anchor="middle" class="svg-muted" font-size="12">commands: show version</text><rect x="330" y="80" width="240" height="100" rx="8" fill="#bbf7d0"/><text x="450" y="102" text-anchor="middle" class="svg-ink" font-size="13">TASK 2</text><text x="450" y="124" text-anchor="middle" class="svg-muted" font-size="12">module: debug</text><text x="450" y="144" text-anchor="middle" class="svg-muted" font-size="12">saved result print karta hai</text></svg><p class="cap">A playbook holds plays; a play picks a group and runs its tasks in order; each task calls one module.</p></div>

<h3>Asli playbook ko line by line padhna</h3>
<p>Yeh Lab 1 ka <code>show.yml</code> hai. Yeh sirf jaankari <i>padhta</i> hai, isliye kahin bhi chalana safe hai.</p>
<pre class="code">---
<span class="c"># show.yml - a READ-ONLY playbook: runs "show version" on every router</span>
- name: Collect the software version
  hosts: routers
  gather_facts: no
  tasks:
    - name: Run show version
      ios_command:
        commands:
          - show version
      register: ver          <span class="c"># keep the result in a variable called ver</span>

    - name: Print the first line of the output
      debug:
        var: ver.stdout_lines[0][0]</pre>
<ul>
<li><b><code>- name: Collect the software version</code></b> ek <b>play</b> shuru karta hai. Dash ise playbook ki list ka pehla item banata hai. Name insaanon ke liye label hai.</li>
<li><b><code>hosts: routers</code></b> batata hai ki play kaun se inventory group par chalega. Spelling matter karti hai; chapter 2 ke group naam se match honi chahiye.</li>
<li><b><code>gather_facts: no</code></b> automatic fact-collection step skip karta hai, jo servers ke liye hai, isliye network playbooks iske bina tez chalte hain.</li>
<li><b><code>tasks:</code></b> tasks ki list shuru karta hai. Woh play ke har host par order se, upar se neeche chalte hain.</li>
<li>Har task mein ek <b>name</b> (chalte waqt print hota hai), phir <b>module</b> (<code>ios_command</code>), phir module ke <b>parameters</b> uske neeche indent mein (<code>commands:</code>).</li>
<li><b><code>register: ver</code></b> task ka result <code>ver</code> naam ke variable mein save karta hai, taaki agla task use use kar sake. <b>debug</b> module value print karta hai taaki aap dekh sako.</li>
</ul>

<h3>Chalana</h3>
<pre class="code">ansible-playbook -i inventory.ini show.yml</pre>
<pre class="out">PLAY [Collect the software version] *******************************************

TASK [Run show version] *******************************************************
ok: [R1]
ok: [R2]

TASK [Print the first line of the output] *************************************
ok: [R1] =&gt; {
    "ver.stdout_lines[0][0]": "Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
}
ok: [R2] =&gt; {
    "ver.stdout_lines[0][0]": "Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
}

PLAY RECAP ********************************************************************
R1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Output file ko follow karta hai: ek <code>PLAY</code> banner, har task ka ek <code>TASK</code> banner, aur har host ki ek line result ke saath. Dono tasks <b>ok</b> kehte hain, aur recap <code>changed=0</code> dikhata hai. Show command sirf padhta hai, isliye Ansible use kabhi changed nahi kehta. Yeh R1 ke changed= wale Lab 1 sawaal ka jawab hai: zero.</p>

<h3>Jo modules aapko aane chahiye</h3>
<table class="cmp"><tr><th>Module</th><th>Kya karta hai</th><th>Device badalta hai?</th></tr><tr><td>ios_command</td><td>show ya exec commands chalata hai aur output deta hai</td><td>nahi</td></tr><tr><td>ios_config</td><td>configuration lines push karta hai (interface ke andar ki lines ke liye parents: use karo)</td><td>haan</td></tr><tr><td>ios_vlans</td><td>vlan_id aur name ki list se VLAN database manage karta hai</td><td>haan</td></tr><tr><td>ios_facts</td><td>device ki jaankari collect karta hai</td><td>nahi</td></tr><tr><td>ping</td><td>test karta hai ki Ansible login kar sakta hai</td><td>nahi</td></tr><tr><td>debug</td><td>control node par message ya variable print karta hai</td><td>nahi</td></tr></table>
<p>Module ke naam device family se shuru hote hain: Cisco IOS ke liye <code>ios_</code>. Doosre platforms apna prefix use karte hain (jaise <code>nxos_</code>, <code>junos_</code>, <code>eos_</code>). Ansible track unme se aur cover karta hai. Kisi bhi module ke parameters ka quick reference <code>ansible-doc</code> se milta hai:</p>
<pre class="code">ansible-doc ios_config</pre>
<pre class="out">&gt; IOS_CONFIG

  Push configuration lines (optionally under parents such as an interface) and report changed only when the running-config really changes.

OPTIONS (lines, commands, parents, before, after, match, replace, save_when, backup, defaults, running_config, diff_against, intended_config, multiline_delimiter):
  lines (or commands): list of configuration lines, written exactly as in the running-config
  parents: the section the lines belong to, e.g. [interface GigabitEthernet0/1]
  save_when: always | never | modified | changed  (copy running to startup)
  backup: yes = save the running-config to backup/ on the controller first</pre>
<p>Simulator ka doc page asli Ansible se chhota hai, par zaroori parameters dikhata hai: <code>lines</code> (kya push karna hai), <code>parents</code> (kahan ka hai), aur <code>save_when</code> (running ko startup mein copy karna).</p>

<h3>Config playbook: ntp.yml</h3>
<pre class="code">---
<span class="c"># ntp.yml - a CONFIG playbook: every router uses the NOC server for time and logs</span>
- name: Standard time and logging
  hosts: routers
  gather_facts: no
  vars:
    noc_server: 10.99.0.100      <span class="c"># one variable, used twice below</span>
  tasks:
    - name: Point NTP and syslog at the NOC server
      ios_config:
        lines:
          - ntp server {{ noc_server }}
          - logging host {{ noc_server }}</pre>
<p>Structure show.yml jaisa hi hai, par module <code>ios_config</code> hai aur woh do lines push karta hai. <code>{{ noc_server }}</code> wale hisse placeholders hain jinhe Ansible variable value 10.99.0.100 se badal deta hai; chapter 7 variables samjhata hai. Lines bilkul waisi likhi hain jaise aap router par configuration mode mein type karte.</p>

<h3>Playbook ke bina ek-do commands</h3>
<p>Quick sawaal ke liye file ki zaroorat nahi. <code>ansible</code> command (-playbook ke bina) ek group par ek module chalata hai. <code>-a</code> module ke arguments deta hai:</p>
<pre class="code">ansible routers -i inventory.ini -m ios_command -a "commands='show clock'"</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "stdout": [
        "*01:16:07.410 UTC Fri Oct 2 2026"
    ],
    "stdout_lines": [
        [
            "*01:16:07.410 UTC Fri Oct 2 2026"
        ]
    ]
}
R2 | SUCCESS =&gt; {
    "changed": false,
    "stdout": [
        "*01:16:07.410 UTC Fri Oct 2 2026"
    ],
    "stdout_lines": [
        [
            "*01:16:07.410 UTC Fri Oct 2 2026"
        ]
    ]
}</pre>
<p>Yeh "ad-hoc" commands bahut saare devices par wahi show command check karne ke liye perfect hain. Yahan dikha time lab clock se aata hai, isliye aapka alag hoga.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1, task 3. Aap show.yml chalate ho. Dono routers dono tasks ke liye ok kehte hain, debug task har ek ke liye show version ki pehli line print karta hai, aur PLAY RECAP changed=0 kehta hai. Ab aapke paas ek command mein saboot hai ki dono routers wahi software version chalate hain.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Parameters ko module ke naam ke same indentation par likhna, uske neeche nahi. Module ka naam galat type karna, jisse kuch chalne se pehle hi error aata hai. Yeh bhoolna ki ios_config lines asli configuration jaisi dikhni chahiye (shuru mein "configure terminal" nahi).</p></div>
<div class="exam"><p><b>Exam trap.</b> Play hosts ke group ko tasks se map karta hai. Tasks order se chalte hain. Module ek task hai. ios_command padhta hai; ios_config badalta hai. register result store karta hai aur debug print karta hai.</p></div>

<div class="scn"><h4>Version audit</h4><p>Upgrade window se pehle ek operations team ko 120 routers ka software version chahiye tha. Ek senior engineer ne das line ka show.yml likha, chalaya, aur output change ticket mein save kar diya. Jo kaam do engineers ka ek din leta tha woh chaar minute mein hua, aur report khud playbook output thi, isliye copy-paste ki galti nahi hui.</p><p><b>Lesson:</b> read-only playbooks sabse safe pehla automation hain: woh tool par bharosa banate hain.</p></div>
<div class="iv"><p class="q">"Playbook ke main parts kaun se hain?"</p><p>Playbook plays ki YAML list hai. Har play inventory se hosts group ka naam aur tasks ki list deta hai. Har task parameters ke saath ek module bulata hai, jaise show commands ke liye ios_command ya configuration lines push karne ke liye ios_config. register task result save karta hai, debug use print karta hai, aur tasks har host par order se chalte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Playbook, phir play (name, hosts, tasks), phir tasks, phir parameters ke saath modules.</li><li>hosts inventory ke group se match hona chahiye; tasks upar se neeche chalte hain.</li><li>ios_command padhta hai; ios_config aur ios_vlans badalte hain; ping login test karta hai; debug print karta hai.</li><li>register result save karta hai taaki baad ka task use kar sake.</li><li>ansible-doc MODULE parameters list karta hai; ansible command playbook ke bina ek module chalata hai.</li></ul></div>

`}};export{e as default};