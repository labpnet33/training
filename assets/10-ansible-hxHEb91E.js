var e={id:`ansible`,h:{en:`Ansible in practice: inventory, playbooks, modules and PLAY RECAP`,hi:`Ansible practically: inventory, playbooks, modules aur PLAY RECAP`},body:{en:`
<p>A football coach has a <b>squad list</b> (who is available and in which position), a <b>playbook</b> of plays, and inside each play a list of <b>moves</b> that players perform using their <b>skills</b>. Ansible uses the same shape: the <b>inventory</b> is the squad list, the <b>playbook</b> holds <b>plays</b>, each play is a list of <b>tasks</b>, and each task uses a <b>module</b>, a ready-made skill such as "create VLANs" or "push these configuration lines".</p>

<h3>The pieces</h3>
<dl class="terms">
<dt>Control node</dt><dd>The Linux machine where Ansible is installed and where you run commands. In Lab 2 it is <b>CTRL</b> (10.30.0.100).</dd>
<dt>Managed nodes</dt><dd>The devices being configured: SW1 (10.30.0.11) and SW2 (10.30.0.12). Nothing is installed on them.</dd>
<dt>Inventory</dt><dd>A file listing the devices, grouped, with variables such as address, user and connection type.</dd>
<dt>Playbook</dt><dd>A YAML file containing a list of plays. A <b>play</b> maps a group of hosts to a list of <b>tasks</b>.</dd>
<dt>Module</dt><dd>The code a task runs, for example <code>ios_vlans</code>, <code>ios_config</code>, <code>ios_command</code>. Cisco IOS modules come from the <code>cisco.ios</code> collection (full name <code>cisco.ios.ios_vlans</code>).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ansible components">
<rect x="20" y="30" width="150" height="130" rx="8" fill="#bbf7d0"/>
<text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="14">CTRL</text>
<text x="95" y="82" text-anchor="middle" class="svg-muted" font-size="12">hosts (inventory)</text>
<text x="95" y="106" text-anchor="middle" class="svg-muted" font-size="12">site.yml (playbook)</text>
<text x="95" y="130" text-anchor="middle" class="svg-muted" font-size="12">cisco.ios modules</text>
<rect x="450" y="30" width="170" height="55" rx="8" fill="#bae6fd"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">SW1 10.30.0.11</text>
<rect x="450" y="105" width="170" height="55" rx="8" fill="#bae6fd"/><text x="535" y="137" text-anchor="middle" class="svg-ink" font-size="13">SW2 10.30.0.12</text>
<line x1="170" y1="80" x2="450" y2="57" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="110" x2="450" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="310" y="95" text-anchor="middle" class="svg-accent" font-size="12">SSH (network_cli), user ansible</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">nothing installed on the switches: agentless</text>
</svg><p class="cap">Lab 2: the control node pushes the playbook to both access switches over SSH.</p></div>

<h3>The inventory</h3>
<pre class="code"><span class="c"># Access switches managed by the NetOps team</span>
[access]
SW1 ansible_host=10.30.0.11
SW2 ansible_host=10.30.0.12

[access:vars]
ansible_user=ansible
ansible_password=NkAuto26
ansible_network_os=ios
ansible_connection=network_cli</pre>
<p><code>[access]</code> creates a group. <code>ansible_host</code> is the address to connect to. <code>[access:vars]</code> sets variables for every host in the group: the login, the platform (<code>ios</code>) and the connection plugin (<code>network_cli</code> = SSH to a CLI). In production, passwords live in an encrypted <b>Ansible Vault</b> file, not in plain text.</p>

<h3>The playbook</h3>
<pre class="code">---
- name: Standardise the access switches      <span class="c"># the play</span>
  hosts: access                              <span class="c"># inventory group</span>
  gather_facts: no

  tasks:
    - name: Create the user VLANs
      ios_vlans:                             <span class="c"># module</span>
        config:                              <span class="c"># its parameters, indented below it</span>
          - vlan_id: 10
            name: SALES
          - vlan_id: 20
            name: ENGINEERING
        state: merged

    - name: Use the lab NTP server
      ios_config:
        lines:
          - ntp server 10.30.0.100

    - name: Set the login banner
      ios_config:
        lines:
          - banner motd ^Authorised NK staff only^

    - name: Save the configuration if anything changed
      ios_config:
        save_when: modified</pre>
<p>Read it from the outside in: the file is a <b>list</b> of plays (the <code>-</code> before <code>name</code>); the play targets the <code>access</code> group; <code>tasks</code> is a list; every task has a name and one module; the module's parameters are indented under it. <code>ios_vlans</code> with <code>state: merged</code> adds the VLANs without removing others. <code>ios_config</code> with <code>lines</code> sends configuration lines only if they are missing. <code>save_when: modified</code> copies running-config to startup-config only when they differ.</p>

<h3>Useful commands</h3>
<pre class="code">ansible-playbook -i hosts site.yml --syntax-check    <span class="c"># YAML and structure only</span>
ansible-inventory -i hosts --host SW1                <span class="c"># variables SW1 really gets</span>
ansible access -i hosts -m ping                      <span class="c"># ad-hoc: can we log in?</span>
ansible-doc ios_config                               <span class="c"># a module's valid parameters</span>
ansible-playbook -i hosts site.yml --check           <span class="c"># dry run, changes nothing</span>
ansible-playbook -i hosts site.yml -v                <span class="c"># real run, more detail</span></pre>
<pre class="out">CTRL$ ansible access -i hosts -m ping
SW1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
SW2 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p>For network devices, <code>ping</code> here is not ICMP: it proves Ansible can open the SSH session and log in.</p>

<h3>Reading a run and the PLAY RECAP</h3>
<pre class="out">PLAY [Standardise the access switches] ****************************************

TASK [Create the user VLANs] **************************************************
changed: [SW1]
changed: [SW2]
...
PLAY RECAP ********************************************************************
<span class="hl">SW1                        : ok=4    changed=4    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
SW2                        : ok=4    changed=4    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</span></pre>
<p>Each task prints one line per host: <code>ok</code> (already correct, nothing done), <code>changed</code> (Ansible changed the device), <code>fatal: ... FAILED!</code> or <code>UNREACHABLE!</code>. The <b>PLAY RECAP</b> totals them per host. A healthy run has <code>unreachable=0</code> and <code>failed=0</code>.</p>

<div class="eg"><p><b>Worked example: proving idempotency.</b> Run the same playbook a second time. Every module compares the wanted state with the switch first, finds nothing to do and reports <code>ok</code>. The recap becomes <code>ok=4 changed=0 unreachable=0 failed=0</code> for both switches. That second run is the proof the lab asks for.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using tabs in YAML; putting a module's parameters at the same indentation as the module name; misspelling a parameter (<code>line</code> instead of <code>lines</code>); a <code>hosts:</code> value that matches no inventory group, which makes Ansible skip the play with a warning instead of failing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Playbooks are YAML; inventories are often INI (or YAML). <code>changed</code> means Ansible modified the device; <code>ok</code> means it was already correct. <code>--check</code> is a dry run. Ansible is agentless and pushes over SSH. A second run with <code>changed=0</code> shows idempotency.</p></div>

<div class="scn"><h4>The playbook that "worked" but did nothing</h4><p>A new engineer ran a banner playbook against the branch routers and proudly reported "no errors". An audit a week later found no new banners anywhere. The output had started with <code>[WARNING]: Could not match supplied host pattern, ignoring: branch</code> and "skipping: no hosts matched": the play said <code>hosts: branch</code> but the inventory group was <code>[branches]</code>. No host, no task, no failure.</p><p><b>Lesson:</b> read the whole output, and check that the PLAY RECAP lists every host you expected.</p></div>

<div class="iv"><p class="q">"Walk me through the parts of an Ansible playbook and how you know it worked."</p><p>Strong answer: the inventory defines hosts, groups and connection variables; a playbook is a YAML list of plays; each play targets hosts and runs tasks; each task calls a module with parameters. For network devices use <code>ansible_network_os</code> and <code>network_cli</code>. Verify with the PLAY RECAP: failed=0 and unreachable=0 for every host, then a second run with changed=0 to show idempotency, and a spot check on a device such as <code>show vlan brief</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory (hosts, groups, variables) + playbook (plays, tasks) + modules = an Ansible run.</li>
<li>Network connection variables: <code>ansible_network_os=ios</code>, <code>ansible_connection=network_cli</code>.</li>
<li>Useful tools: <code>--syntax-check</code>, <code>ansible-inventory --host</code>, <code>-m ping</code>, <code>ansible-doc</code>, <code>--check</code>, <code>-v</code>.</li>
<li>Per task: ok, changed, FAILED, UNREACHABLE; the PLAY RECAP totals them per host.</li>
<li>Second run with changed=0 proves idempotency.</li>
</ul></div>
`,hi:`
<p>Football coach ke paas ek <b>squad list</b> hoti hai (kaun available hai aur kis position par), plays ka ek <b>playbook</b>, aur har play ke andar <b>moves</b> ki list jo players apni <b>skills</b> se karte hain. Ansible bhi yahi shape use karta hai: <b>inventory</b> squad list hai, <b>playbook</b> mein <b>plays</b> hote hain, har play <b>tasks</b> ki list hai, aur har task ek <b>module</b> use karta hai, ek ready-made skill jaise "VLANs banao" ya "yeh configuration lines push karo".</p>

<h3>Hisse</h3>
<dl class="terms">
<dt>Control node</dt><dd>Woh Linux machine jahan Ansible install hai aur jahan aap commands chalate ho. Lab 2 mein yeh <b>CTRL</b> (10.30.0.100) hai.</dd>
<dt>Managed nodes</dt><dd>Jo devices configure ho rahe hain: SW1 (10.30.0.11) aur SW2 (10.30.0.12). Unpar kuch install nahi hota.</dd>
<dt>Inventory</dt><dd>Ek file jo devices ki list deti hai, groups mein, address, user aur connection type jaise variables ke saath.</dd>
<dt>Playbook</dt><dd>Ek YAML file jismein plays ki list hai. Ek <b>play</b> hosts ke group ko <b>tasks</b> ki list se jodta hai.</dd>
<dt>Module</dt><dd>Woh code jo task chalata hai, jaise <code>ios_vlans</code>, <code>ios_config</code>, <code>ios_command</code>. Cisco IOS modules <code>cisco.ios</code> collection se aate hain (poora naam <code>cisco.ios.ios_vlans</code>).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ansible components">
<rect x="20" y="30" width="150" height="130" rx="8" fill="#bbf7d0"/>
<text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="14">CTRL</text>
<text x="95" y="82" text-anchor="middle" class="svg-muted" font-size="12">hosts (inventory)</text>
<text x="95" y="106" text-anchor="middle" class="svg-muted" font-size="12">site.yml (playbook)</text>
<text x="95" y="130" text-anchor="middle" class="svg-muted" font-size="12">cisco.ios modules</text>
<rect x="450" y="30" width="170" height="55" rx="8" fill="#bae6fd"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">SW1 10.30.0.11</text>
<rect x="450" y="105" width="170" height="55" rx="8" fill="#bae6fd"/><text x="535" y="137" text-anchor="middle" class="svg-ink" font-size="13">SW2 10.30.0.12</text>
<line x1="170" y1="80" x2="450" y2="57" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="110" x2="450" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="310" y="95" text-anchor="middle" class="svg-accent" font-size="12">SSH (network_cli), user ansible</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">switches par kuch install nahi: agentless</text>
</svg><p class="cap">Lab 2: control node playbook ko SSH par dono access switches tak push karta hai.</p></div>

<h3>Inventory</h3>
<pre class="code"><span class="c"># Access switches managed by the NetOps team</span>
[access]
SW1 ansible_host=10.30.0.11
SW2 ansible_host=10.30.0.12

[access:vars]
ansible_user=ansible
ansible_password=NkAuto26
ansible_network_os=ios
ansible_connection=network_cli</pre>
<p><code>[access]</code> ek group banata hai. <code>ansible_host</code> woh address hai jis par connect karna hai. <code>[access:vars]</code> group ke har host ke liye variables set karta hai: login, platform (<code>ios</code>) aur connection plugin (<code>network_cli</code> = CLI par SSH). Production mein passwords plain text mein nahi, encrypted <b>Ansible Vault</b> file mein rehte hain.</p>

<h3>Playbook</h3>
<pre class="code">---
- name: Standardise the access switches      <span class="c"># play</span>
  hosts: access                              <span class="c"># inventory group</span>
  gather_facts: no

  tasks:
    - name: Create the user VLANs
      ios_vlans:                             <span class="c"># module</span>
        config:                              <span class="c"># iske parameters, iske neeche indent</span>
          - vlan_id: 10
            name: SALES
          - vlan_id: 20
            name: ENGINEERING
        state: merged

    - name: Use the lab NTP server
      ios_config:
        lines:
          - ntp server 10.30.0.100

    - name: Set the login banner
      ios_config:
        lines:
          - banner motd ^Authorised NK staff only^

    - name: Save the configuration if anything changed
      ios_config:
        save_when: modified</pre>
<p>Ise bahar se andar padho: file plays ki ek <b>list</b> hai (<code>name</code> se pehle ka <code>-</code>); play <code>access</code> group ko target karta hai; <code>tasks</code> ek list hai; har task ka ek naam aur ek module hai; module ke parameters uske neeche indent hain. <code>state: merged</code> ke saath <code>ios_vlans</code> doosre VLANs hataye bina VLANs jodta hai. <code>lines</code> ke saath <code>ios_config</code> configuration lines tabhi bhejta hai jab woh missing hon. <code>save_when: modified</code> running-config ko startup-config mein tabhi copy karta hai jab dono alag hon.</p>

<h3>Kaam ke commands</h3>
<pre class="code">ansible-playbook -i hosts site.yml --syntax-check    <span class="c"># sirf YAML aur structure</span>
ansible-inventory -i hosts --host SW1                <span class="c"># SW1 ko asal mein kaunse variables milte hain</span>
ansible access -i hosts -m ping                      <span class="c"># ad-hoc: kya login ho sakta hai?</span>
ansible-doc ios_config                               <span class="c"># module ke valid parameters</span>
ansible-playbook -i hosts site.yml --check           <span class="c"># dry run, kuch nahi badalta</span>
ansible-playbook -i hosts site.yml -v                <span class="c"># real run, zyada detail</span></pre>
<pre class="out">CTRL$ ansible access -i hosts -m ping
SW1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
SW2 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p>Network devices ke liye yahan <code>ping</code> ICMP nahi hai: yeh saabit karta hai ki Ansible SSH session khol kar login kar sakta hai.</p>

<h3>Run aur PLAY RECAP padhna</h3>
<pre class="out">PLAY [Standardise the access switches] ****************************************

TASK [Create the user VLANs] **************************************************
changed: [SW1]
changed: [SW2]
...
PLAY RECAP ********************************************************************
<span class="hl">SW1                        : ok=4    changed=4    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
SW2                        : ok=4    changed=4    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</span></pre>
<p>Har task har host ke liye ek line print karta hai: <code>ok</code> (pehle se sahi, kuch nahi kiya), <code>changed</code> (Ansible ne device badla), <code>fatal: ... FAILED!</code> ya <code>UNREACHABLE!</code>. <b>PLAY RECAP</b> har host ka total dikhata hai. Healthy run mein <code>unreachable=0</code> aur <code>failed=0</code> hota hai.</p>

<div class="eg"><p><b>Worked example: idempotency saabit karna.</b> Same playbook doosri baar chalao. Har module pehle wanted state ko switch se compare karta hai, karne ko kuch nahi paata aur <code>ok</code> report karta hai. Dono switches ke liye recap <code>ok=4 changed=0 unreachable=0 failed=0</code> ho jaata hai. Yahi doosra run woh saboot hai jo lab maangta hai.</p></div>

<div class="warn"><p><b>Common galtiyaan.</b> YAML mein tabs use karna; module ke parameters ko module name ke same indentation par rakhna; parameter ki spelling galat (<code>lines</code> ki jagah <code>line</code>); aisa <code>hosts:</code> value jo kisi inventory group se match na kare, jisse Ansible fail hone ki jagah warning ke saath play skip kar deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Playbooks YAML hain; inventories aksar INI (ya YAML) hoti hain. <code>changed</code> ka matlab Ansible ne device badla; <code>ok</code> ka matlab pehle se sahi tha. <code>--check</code> dry run hai. Ansible agentless hai aur SSH par push karta hai. <code>changed=0</code> wala doosra run idempotency dikhata hai.</p></div>

<div class="scn"><h4>Woh playbook jo "chal gaya" par kuch nahi kiya</h4><p>Ek naye engineer ne branch routers par banner playbook chalaya aur garv se report kiya "koi error nahi". Ek hafte baad audit mein kahin bhi naye banners nahi mile. Output <code>[WARNING]: Could not match supplied host pattern, ignoring: branch</code> aur "skipping: no hosts matched" se shuru hua tha: play mein <code>hosts: branch</code> tha par inventory group <code>[branches]</code> tha. Na host, na task, na failure.</p><p><b>Seekh:</b> poora output padho, aur check karo ki PLAY RECAP mein har woh host hai jo aap expect kar rahe the.</p></div>

<div class="iv"><p class="q">"Ansible playbook ke hisse samjhao aur batao ki aapko kaise pata chalega ki woh kaam kar gaya."</p><p>Strong answer: inventory hosts, groups aur connection variables define karti hai; playbook plays ki YAML list hai; har play hosts ko target karke tasks chalata hai; har task parameters ke saath ek module call karta hai. Network devices ke liye <code>ansible_network_os</code> aur <code>network_cli</code> use karo. PLAY RECAP se verify karo: har host ke liye failed=0 aur unreachable=0, phir idempotency dikhane ke liye changed=0 wala doosra run, aur device par <code>show vlan brief</code> jaisa spot check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory (hosts, groups, variables) + playbook (plays, tasks) + modules = ek Ansible run.</li>
<li>Network connection variables: <code>ansible_network_os=ios</code>, <code>ansible_connection=network_cli</code>.</li>
<li>Kaam ke tools: <code>--syntax-check</code>, <code>ansible-inventory --host</code>, <code>-m ping</code>, <code>ansible-doc</code>, <code>--check</code>, <code>-v</code>.</li>
<li>Har task: ok, changed, FAILED, UNREACHABLE; PLAY RECAP har host ka total deta hai.</li>
<li>changed=0 wala doosra run idempotency saabit karta hai.</li>
</ul></div>
`}};export{e as default};