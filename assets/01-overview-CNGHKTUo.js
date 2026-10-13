var e={id:`overview`,h:{en:`Why playbooks need logic: repeat, skip, read, decide`,hi:`Playbooks ko logic kyun chahiye: repeat, skip, read, decide`},body:{en:`
<p>In the first modules you ran tasks that did the same thing on every device. Real networks are not like that. You need ten VLANs, not one. A Pune switch needs BPDU guard but the Bengaluru switch does not. Before a WAN migration you want to <i>read</i> what the router says and stop if the link is down. This module teaches the four tools that make a playbook behave like an engineer: <b>loop</b> (repeat), <b>when</b> (skip), <b>register</b> (read) and <b>assert</b> (decide).</p>

<h3>The lab for this module</h3>
<p>The topology has two routers and two switches: <code>pun-core-r1</code> (10.99.0.1), <code>blr-edge-r2</code> (10.99.0.2), <code>pun-acc-sw1</code> (10.99.0.10) and <code>blr-acc-sw2</code> (10.99.0.11). The inventory has the groups <code>pune</code>, <code>bengaluru</code>, <code>routers</code> and <code>switches</code>. The file <code>group_vars/switches.yml</code> holds a list of three VLANs, and <code>host_vars/blr-acc-sw2.yml</code> adds one extra VLAN for Bengaluru only:</p>
<pre class="out">AUTO01$ cat group_vars/switches.yml
vlans:
  - id: 10
    name: USERS
  - id: 20
    name: VOICE
  - id: 99
    name: MGMT
AUTO01$ cat host_vars/blr-acc-sw2.yml
extra_vlans:
  - id: 30
    name: CCTV</pre>
<p>A list in YAML is a series of lines that begin with a dash. Each dash is one item; here every item is a small dictionary with an <code>id</code> and a <code>name</code>. Keep this shape in mind, because loops walk through exactly such lists.</p>

<h3>The finished playbook, in one look</h3>
<p>By the end of the module you will write this playbook yourself. For now, just see what the tasks are:</p>
<pre class="out">AUTO01$ ansible-playbook vlans.yml --list-tasks
playbook: vlans.yml
  play #1 (switches): VLAN rollout	TAGS: []
    tasks:
      Standard VLANs	TAGS: []
      Site VLANs	TAGS: []
      BPDU guard in Pune only	TAGS: []
      Read the VLAN table	TAGS: []
      Every standard VLAN is there	TAGS: []</pre>
<p>And its first real run. Read the markers: <code>changed</code> means the device was modified, <code>skipping</code> means a condition said no, and the text in brackets after <code>item=</code> is the loop item being processed.</p>
<pre class="out">AUTO01$ ansible-playbook vlans.yml
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
changed: [pun-acc-sw1] => (item=10 USERS)
changed: [pun-acc-sw1] => (item=20 VOICE)
changed: [pun-acc-sw1] => (item=99 MGMT)
changed: [blr-acc-sw2] => (item=10 USERS)
changed: [blr-acc-sw2] => (item=20 VOICE)
changed: [blr-acc-sw2] => (item=99 MGMT)
TASK [Site VLANs] *************************************************************
skipping: [pun-acc-sw1]
changed: [blr-acc-sw2] => (item=30 CCTV)
TASK [BPDU guard in Pune only] ************************************************
changed: [pun-acc-sw1]
skipping: [blr-acc-sw2]
TASK [Read the VLAN table] ****************************************************
ok: [pun-acc-sw1]
ok: [blr-acc-sw2]
TASK [Every standard VLAN is there] *******************************************
ok: [pun-acc-sw1] => (item=USERS)
ok: [pun-acc-sw1] => (item=VOICE)
ok: [pun-acc-sw1] => (item=MGMT)
ok: [blr-acc-sw2] => (item=USERS)
ok: [blr-acc-sw2] => (item=VOICE)
ok: [blr-acc-sw2] => (item=MGMT)
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=4    changed=2    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=4    changed=2    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   </pre>
<p>One playbook, two different switches, two different results. The Bengaluru switch received the extra VLAN 30 and skipped BPDU guard; the Pune switch did the opposite. Nothing in the file mentions a device name.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four logic tools in a playbook">
<rect x="15" y="60" width="140" height="80" rx="10" fill="#fde68a"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="14">loop</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="11">repeat per item</text>
<rect x="175" y="60" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="245" y="90" text-anchor="middle" class="svg-ink" font-size="14">when</text><text x="245" y="112" text-anchor="middle" class="svg-muted" font-size="11">skip or run</text>
<rect x="335" y="60" width="140" height="80" rx="10" fill="#bae6fd"/><text x="405" y="90" text-anchor="middle" class="svg-ink" font-size="14">register</text><text x="405" y="112" text-anchor="middle" class="svg-muted" font-size="11">keep the answer</text>
<rect x="495" y="60" width="130" height="80" rx="10" fill="#fca5a5"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="14">assert</text><text x="560" y="112" text-anchor="middle" class="svg-muted" font-size="11">stop if wrong</text>
<line x1="155" y1="100" x2="175" y2="100" stroke="#64748b" stroke-width="2"/><line x1="315" y1="100" x2="335" y2="100" stroke="#64748b" stroke-width="2"/><line x1="475" y1="100" x2="495" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The four tools of this module, in the order a network engineer needs them.</p></div>

<h3>Roadmap of the chapters</h3>
<ul>
<li>Chapter 2: <code>loop</code> and <code>loop_control</code>.</li>
<li>Chapter 3: <code>when</code> with <code>group_names</code>.</li>
<li>Chapter 4: <code>register</code> to capture show output.</li>
<li>Chapter 5: <code>assert</code>, <code>failed_when</code> and <code>changed_when</code>.</li>
<li>Chapter 6: handlers.</li>
<li>Chapter 7: <code>ignore_errors</code>, <code>block</code> and <code>rescue</code>.</li>
<li>Chapter 8: check mode and a troubleshooting walk-through.</li>
</ul>

<div class="warn"><p><b>Common beginner mistake.</b> Copying a task ten times instead of looping. The playbook grows, one pasted line gets a typo, and nobody notices. A list in variables plus one looped task is shorter and easier to audit.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>loop</code>, <code>when</code> and <code>register</code> are task keywords, not modules. They sit at the same indentation as the module name, not inside its arguments.</p></div>

<div class="scn"><h4>One standard, two sites</h4><p>The standard says every access switch has VLANs 10, 20 and 99, and Bengaluru also needs 30 for cameras. Instead of two playbooks, the team kept the common list in group_vars and the extra one in host_vars, and used one looped task. Both sites follow the same file.</p></div>

<div class="iv"><p class="q">"Why use loops and conditions instead of separate playbooks per site?"</p><p>One playbook is one source of truth. Differences live in variables and are expressed with <code>when</code>, so a change to the standard happens in one place and reaches every site.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four tools: loop, when, register, assert.</li>
<li>One generic playbook gives different results per device through variables and conditions.</li>
<li><code>changed</code>, <code>ok</code> and <code>skipping</code> tell you what each device did.</li>
<li>The module lab uses two routers and two switches with a VLAN list in group_vars.</li>
<li>Prefer one looped task to many pasted tasks.</li>
</ul></div>
`,hi:`
<p>Pehle modules mein aapne aise tasks chalaye jo har device par ek jaisa kaam karte the. Asli networks aise nahi hote. Aapko ek nahi, das VLANs chahiye. Pune switch ko BPDU guard chahiye par Bengaluru switch ko nahi. WAN migration se pehle aap router ka jawab <i>padhna</i> chahte ho aur link down ho to rukna chahte ho. Yeh module chaar tools sikhata hai jo playbook ko engineer ki tarah behave karate hain: <b>loop</b> (repeat), <b>when</b> (skip), <b>register</b> (padhna) aur <b>assert</b> (faisla).</p>

<h3>Is module ka lab</h3>
<p>Topology mein do routers aur do switches hain: <code>pun-core-r1</code> (10.99.0.1), <code>blr-edge-r2</code> (10.99.0.2), <code>pun-acc-sw1</code> (10.99.0.10) aur <code>blr-acc-sw2</code> (10.99.0.11). Inventory mein groups <code>pune</code>, <code>bengaluru</code>, <code>routers</code> aur <code>switches</code> hain. <code>group_vars/switches.yml</code> mein teen VLANs ki list hai, aur <code>host_vars/blr-acc-sw2.yml</code> sirf Bengaluru ke liye ek extra VLAN jodti hai:</p>
<pre class="out">AUTO01$ cat group_vars/switches.yml
vlans:
  - id: 10
    name: USERS
  - id: 20
    name: VOICE
  - id: 99
    name: MGMT
AUTO01$ cat host_vars/blr-acc-sw2.yml
extra_vlans:
  - id: 30
    name: CCTV</pre>
<p>YAML mein list un lines ki series hai jo dash se shuru hoti hain. Har dash ek item hai; yahan har item ek chhota dictionary hai jisme <code>id</code> aur <code>name</code> hain. Yeh shape yaad rakho, kyunki loops bilkul aisi hi lists par chalte hain.</p>

<h3>Poora playbook ek nazar mein</h3>
<p>Module ke end tak aap yeh playbook khud likhoge. Abhi bas dekho ki tasks kya hain:</p>
<pre class="out">AUTO01$ ansible-playbook vlans.yml --list-tasks
playbook: vlans.yml
  play #1 (switches): VLAN rollout	TAGS: []
    tasks:
      Standard VLANs	TAGS: []
      Site VLANs	TAGS: []
      BPDU guard in Pune only	TAGS: []
      Read the VLAN table	TAGS: []
      Every standard VLAN is there	TAGS: []</pre>
<p>Aur iska pehla asli run. Markers padho: <code>changed</code> matlab device modify hua, <code>skipping</code> matlab condition ne mana kiya, aur <code>item=</code> ke baad brackets ka text woh loop item hai jo process ho raha hai.</p>
<pre class="out">AUTO01$ ansible-playbook vlans.yml
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
changed: [pun-acc-sw1] => (item=10 USERS)
changed: [pun-acc-sw1] => (item=20 VOICE)
changed: [pun-acc-sw1] => (item=99 MGMT)
changed: [blr-acc-sw2] => (item=10 USERS)
changed: [blr-acc-sw2] => (item=20 VOICE)
changed: [blr-acc-sw2] => (item=99 MGMT)
TASK [Site VLANs] *************************************************************
skipping: [pun-acc-sw1]
changed: [blr-acc-sw2] => (item=30 CCTV)
TASK [BPDU guard in Pune only] ************************************************
changed: [pun-acc-sw1]
skipping: [blr-acc-sw2]
TASK [Read the VLAN table] ****************************************************
ok: [pun-acc-sw1]
ok: [blr-acc-sw2]
TASK [Every standard VLAN is there] *******************************************
ok: [pun-acc-sw1] => (item=USERS)
ok: [pun-acc-sw1] => (item=VOICE)
ok: [pun-acc-sw1] => (item=MGMT)
ok: [blr-acc-sw2] => (item=USERS)
ok: [blr-acc-sw2] => (item=VOICE)
ok: [blr-acc-sw2] => (item=MGMT)
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=4    changed=2    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=4    changed=2    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   </pre>
<p>Ek playbook, do alag switches, do alag results. Bengaluru switch ko extra VLAN 30 mila aur BPDU guard skip hua; Pune switch ne ulta kiya. File mein kahin device ka naam nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Playbook mein chaar logic tools">
<rect x="15" y="60" width="140" height="80" rx="10" fill="#fde68a"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="14">loop</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="11">har item par repeat</text>
<rect x="175" y="60" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="245" y="90" text-anchor="middle" class="svg-ink" font-size="14">when</text><text x="245" y="112" text-anchor="middle" class="svg-muted" font-size="11">skip ya run</text>
<rect x="335" y="60" width="140" height="80" rx="10" fill="#bae6fd"/><text x="405" y="90" text-anchor="middle" class="svg-ink" font-size="14">register</text><text x="405" y="112" text-anchor="middle" class="svg-muted" font-size="11">jawab rakho</text>
<rect x="495" y="60" width="130" height="80" rx="10" fill="#fca5a5"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="14">assert</text><text x="560" y="112" text-anchor="middle" class="svg-muted" font-size="11">galat ho to ruko</text>
<line x1="155" y1="100" x2="175" y2="100" stroke="#64748b" stroke-width="2"/><line x1="315" y1="100" x2="335" y2="100" stroke="#64748b" stroke-width="2"/><line x1="475" y1="100" x2="495" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Is module ke chaar tools, us order mein jis mein network engineer ko chahiye.</p></div>

<h3>Chapters ka roadmap</h3>
<ul>
<li>Chapter 2: <code>loop</code> aur <code>loop_control</code>.</li>
<li>Chapter 3: <code>group_names</code> ke saath <code>when</code>.</li>
<li>Chapter 4: show output pakadne ke liye <code>register</code>.</li>
<li>Chapter 5: <code>assert</code>, <code>failed_when</code> aur <code>changed_when</code>.</li>
<li>Chapter 6: handlers.</li>
<li>Chapter 7: <code>ignore_errors</code>, <code>block</code> aur <code>rescue</code>.</li>
<li>Chapter 8: check mode aur troubleshooting walk-through.</li>
</ul>

<div class="warn"><p><b>Common beginner mistake.</b> Loop ki jagah task ko das baar copy karna. Playbook bada hota hai, ek pasted line mein typo aa jaata hai aur kisi ko pata nahi chalta. Variables mein list aur ek looped task chhota hai aur audit karna aasaan.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>loop</code>, <code>when</code> aur <code>register</code> task keywords hain, modules nahi. Yeh module naam ke same indentation par baithte hain, uske arguments ke andar nahi.</p></div>

<div class="scn"><h4>Ek standard, do sites</h4><p>Standard kehta hai har access switch par VLANs 10, 20 aur 99 hon, aur Bengaluru ko cameras ke liye 30 bhi chahiye. Do playbooks ki jagah team ne common list group_vars mein aur extra wali host_vars mein rakhi, aur ek looped task use kiya. Dono sites ek hi file follow karte hain.</p></div>

<div class="iv"><p class="q">"Har site ke liye alag playbook ki jagah loops aur conditions kyun?"</p><p>Ek playbook ek source of truth hai. Differences variables mein rehte hain aur <code>when</code> se express hote hain, isliye standard ka change ek jagah hota hai aur har site tak pahunchta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar tools: loop, when, register, assert.</li>
<li>Ek generic playbook variables aur conditions se har device par alag result deta hai.</li>
<li><code>changed</code>, <code>ok</code> aur <code>skipping</code> batate hain har device ne kya kiya.</li>
<li>Module lab mein do routers aur do switches hain, group_vars mein VLAN list ke saath.</li>
<li>Bahut copied tasks ki jagah ek looped task prefer karo.</li>
</ul></div>
`}};export{e as default};