var e={id:`loops`,h:{en:`loop: one task, many items`,hi:`loop: ek task, kai items`},body:{en:`
<p>A <b>loop</b> repeats one task once for every element of a list. It replaces the habit of copying a task ten times. You will use it for VLANs, NTP servers, interfaces and anything else that comes as "a list of things".</p>

<h3>The simplest loop</h3>
<pre class="code">---
- name: Loop over a list
  hosts: pun-core-r1
  gather_facts: false
  tasks:
    - name: Print each site
      ansible.builtin.debug:
        msg: "Site {{ item }}"
      loop:
        - Pune
        - Bengaluru
        - Chennai</pre>
<ul>
<li><code>loop:</code> sits at the same level as the module name (<code>ansible.builtin.debug:</code>), not inside it.</li>
<li>Below it is a list: each line starts with a dash and is one item.</li>
<li>Inside the task the current element is always called <code>item</code>. That is why the message says <code>{{ item }}</code>.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook loop1.yml
PLAY [Loop over a list] *******************************************************
TASK [Print each site] ********************************************************
ok: [pun-core-r1] => (item=Pune) => {
    "item": "Pune",
    "msg": "Site Pune"
}
ok: [pun-core-r1] => (item=Bengaluru) => {
    "item": "Bengaluru",
    "msg": "Site Bengaluru"
}
ok: [pun-core-r1] => (item=Chennai) => {
    "item": "Chennai",
    "msg": "Site Chennai"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>One task in the file, three results on screen. In the recap it still counts as <code>ok=1</code>, because the count is per task, not per item.</p>

<h3>Loop over a list from variables: the VLAN rollout</h3>
<p>The real use is a list kept in variables. The task below configures every VLAN in <code>vlans</code> on every switch:</p>
<pre class="code">---
- name: VLAN rollout
  hosts: switches
  gather_facts: false
  tasks:
    - name: Standard VLANs
      cisco.ios.ios_vlans:
        config:
          - vlan_id: "{{ item.id }}"
            name: "{{ item.name }}"
        state: merged
      loop: "{{ vlans }}"
      loop_control:
        label: "{{ item.id }} {{ item.name }}"</pre>
<ul>
<li><code>cisco.ios.ios_vlans</code> manages VLANs. <code>config:</code> is a list of VLANs to describe; we give a list of exactly one, built from the current item.</li>
<li><code>item.id</code> and <code>item.name</code> read the two keys of the current dictionary.</li>
<li><code>state: merged</code> means "add or update these VLANs and leave the other VLANs alone". It never deletes anything.</li>
<li><code>loop: "{{ vlans }}"</code> says "walk through the list called vlans". The value starts with braces, so it is quoted.</li>
<li><code>loop_control: label:</code> chooses what is printed for each item, which is explained next.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook vlans.yml
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
changed: [pun-acc-sw1] => (item=10 USERS)
changed: [pun-acc-sw1] => (item=20 VOICE)
changed: [pun-acc-sw1] => (item=99 MGMT)
changed: [blr-acc-sw2] => (item=10 USERS)
changed: [blr-acc-sw2] => (item=20 VOICE)
changed: [blr-acc-sw2] => (item=99 MGMT)
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Run it again and the output is the same but with <code>ok</code> instead of <code>changed</code> for every item: the module checked the switch, found the VLANs already there and changed nothing. That is idempotency, per item.</p>

<h3>Why the label matters</h3>
<p>Without <code>loop_control</code>, Ansible prints the whole item. With a long dictionary this floods the screen and may even leak a secret:</p>
<pre class="out">AUTO01$ ansible-playbook vlans-nolabel.yml
PLAY [VLAN rollout without a label] *******************************************
TASK [Standard VLANs] *********************************************************
ok: [pun-acc-sw1] => (item={'id': 10, 'name': 'USERS'})
ok: [pun-acc-sw1] => (item={'id': 20, 'name': 'VOICE'})
ok: [pun-acc-sw1] => (item={'id': 99, 'name': 'MGMT'})
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>With the label you saw <code>item=10 USERS</code>, short and readable. It changes only the display, not the behaviour.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="List feeding a looped task">
<rect x="20" y="40" width="170" height="130" rx="10" fill="#fde68a"/><text x="105" y="65" text-anchor="middle" class="svg-ink" font-size="13">vlans (list)</text><text x="105" y="95" text-anchor="middle" class="svg-muted" font-size="12">10 USERS</text><text x="105" y="118" text-anchor="middle" class="svg-muted" font-size="12">20 VOICE</text><text x="105" y="141" text-anchor="middle" class="svg-muted" font-size="12">99 MGMT</text>
<rect x="260" y="75" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="335" y="110" text-anchor="middle" class="svg-ink" font-size="13">one task</text>
<rect x="470" y="40" width="150" height="130" rx="10" fill="#bae6fd"/><text x="545" y="65" text-anchor="middle" class="svg-ink" font-size="13">three results</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">item 10</text><text x="545" y="123" text-anchor="middle" class="svg-muted" font-size="12">item 20</text><text x="545" y="146" text-anchor="middle" class="svg-muted" font-size="12">item 99</text>
<line x1="190" y1="105" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The task body is written once; Ansible runs it for each element.</p></div>

<h3>A variable that some hosts do not have</h3>
<p>Only <code>blr-acc-sw2</code> has <code>extra_vlans</code>. Looping over it directly on all switches fails on the host that lacks it:</p>
<pre class="out">AUTO01$ ansible-playbook loop-undef.yml
PLAY [Loop over a variable some hosts lack] ***********************************
TASK [Site VLANs] *************************************************************
fatal: [pun-acc-sw1]: FAILED! => {"msg": "'extra_vlans' is undefined. 'extra_vlans' is undefined"}
ok: [blr-acc-sw2] => (item={'id': 30, 'name': 'CCTV'}) => {
    "item": {
        "id": 30,
        "name": "CCTV"
    },
    "msg": "30 CCTV"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The cure is the <code>default</code> filter. Writing <code>loop: "{{ extra_vlans | default([]) }}"</code> means "use extra_vlans, or an empty list if it does not exist". Looping over an empty list simply skips the task:</p>
<pre class="out">AUTO01$ ansible-playbook loop-default.yml
PLAY [Loop with a default] ****************************************************
TASK [Site VLANs] *************************************************************
skipping: [pun-acc-sw1]
ok: [blr-acc-sw2] => (item={'id': 30, 'name': 'CCTV'}) => {
    "item": {
        "id": 30,
        "name": "CCTV"
    },
    "msg": "30 CCTV"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=0    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<h3>Loop over a dictionary</h3>
<p>If your data is a dictionary, such as <code>primary: 10.99.0.60</code> and <code>backup: 10.99.0.61</code>, convert it with <code>dict2items</code>. The key and the value then appear as <code>item.key</code> and <code>item.value</code>:</p>
<pre class="out">AUTO01$ ansible-playbook loop-dict.yml
PLAY [Loop over a dictionary] *************************************************
TASK [Print each server] ******************************************************
ok: [pun-core-r1] => (item={'key': 'primary', 'value': '10.99.0.60'}) => {
    "item": {
        "key": "primary",
        "value": "10.99.0.60"
    },
    "msg": "primary server is 10.99.0.60"
}
ok: [pun-core-r1] => (item={'key': 'backup', 'value': '10.99.0.61'}) => {
    "item": {
        "key": "backup",
        "value": "10.99.0.61"
    },
    "msg": "backup server is 10.99.0.61"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<div class="warn"><p><b>Common beginner mistake.</b> Putting <code>loop</code> inside the module arguments, or writing <code>loop: vlans</code> without braces and quotes. A bare name is read as the literal text "vlans" and not as the variable. Use <code>loop: "{{ vlans }}"</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The loop variable is <code>item</code> unless you rename it with <code>loop_control: loop_var:</code>, which you need in nested situations. Also, <code>loop</code> is the modern form; older material uses <code>with_items</code>.</p></div>

<div class="scn"><h4>Eleven VLANs, one typo</h4><p>A team had pasted the VLAN task eleven times. VLAN 47 had its name misspelt and nobody saw it for weeks. After moving the list to group_vars and looping, a single review of the list found the typo, and every switch was corrected in one run.</p></div>

<div class="iv"><p class="q">"How do you apply the same configuration for a list of VLANs?"</p><p>I keep the VLANs as a list of dictionaries in group_vars and loop over it with a single task using a resource module such as <code>ios_vlans</code> with state merged. I add a loop label for readable output and use <code>default([])</code> for lists that only some hosts have.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>loop</code> repeats a task for each element; the element is <code>item</code>.</li>
<li>Write <code>loop: "{{ listname }}"</code> to loop over a variable.</li>
<li><code>loop_control: label:</code> shortens the output without changing behaviour.</li>
<li>Use <code>| default([])</code> when a host may not have the list.</li>
<li><code>dict2items</code> turns a dictionary into key and value items.</li>
</ul></div>
`,hi:`
<p><b>Loop</b> ek task ko list ke har element ke liye ek baar repeat karta hai. Yeh task ko das baar copy karne ki aadat ki jagah leta hai. Aap ise VLANs, NTP servers, interfaces aur "cheezon ki list" wali har cheez ke liye use karoge.</p>

<h3>Sabse simple loop</h3>
<pre class="code">---
- name: Loop over a list
  hosts: pun-core-r1
  gather_facts: false
  tasks:
    - name: Print each site
      ansible.builtin.debug:
        msg: "Site {{ item }}"
      loop:
        - Pune
        - Bengaluru
        - Chennai</pre>
<ul>
<li><code>loop:</code> module naam (<code>ansible.builtin.debug:</code>) ke same level par baithta hai, uske andar nahi.</li>
<li>Uske neeche list hai: har line dash se shuru hoti hai aur ek item hai.</li>
<li>Task ke andar current element ka naam hamesha <code>item</code> hota hai. Isliye message mein <code>{{ item }}</code> hai.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook loop1.yml
PLAY [Loop over a list] *******************************************************
TASK [Print each site] ********************************************************
ok: [pun-core-r1] => (item=Pune) => {
    "item": "Pune",
    "msg": "Site Pune"
}
ok: [pun-core-r1] => (item=Bengaluru) => {
    "item": "Bengaluru",
    "msg": "Site Bengaluru"
}
ok: [pun-core-r1] => (item=Chennai) => {
    "item": "Chennai",
    "msg": "Site Chennai"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>File mein ek task, screen par teen results. Recap mein phir bhi <code>ok=1</code> ginta hai, kyunki count task ke hisaab se hai, item ke hisaab se nahi.</p>

<h3>Variables ki list par loop: VLAN rollout</h3>
<p>Asli use variables mein rakhi list hai. Neeche ka task <code>vlans</code> ke har VLAN ko har switch par configure karta hai:</p>
<pre class="code">---
- name: VLAN rollout
  hosts: switches
  gather_facts: false
  tasks:
    - name: Standard VLANs
      cisco.ios.ios_vlans:
        config:
          - vlan_id: "{{ item.id }}"
            name: "{{ item.name }}"
        state: merged
      loop: "{{ vlans }}"
      loop_control:
        label: "{{ item.id }} {{ item.name }}"</pre>
<ul>
<li><code>cisco.ios.ios_vlans</code> VLANs manage karta hai. <code>config:</code> describe karne wale VLANs ki list hai; hum current item se bani exactly ek VLAN ki list dete hain.</li>
<li><code>item.id</code> aur <code>item.name</code> current dictionary ki do keys padhte hain.</li>
<li><code>state: merged</code> ka matlab "yeh VLANs add ya update karo aur baaki VLANs ko chhodo". Yeh kuch delete nahi karta.</li>
<li><code>loop: "{{ vlans }}"</code> kehta hai "vlans naam ki list par chalo". Value braces se shuru hoti hai, isliye quoted hai.</li>
<li><code>loop_control: label:</code> chunta hai har item ke liye kya print ho, jo aage samjhaya hai.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook vlans.yml
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
changed: [pun-acc-sw1] => (item=10 USERS)
changed: [pun-acc-sw1] => (item=20 VOICE)
changed: [pun-acc-sw1] => (item=99 MGMT)
changed: [blr-acc-sw2] => (item=10 USERS)
changed: [blr-acc-sw2] => (item=20 VOICE)
changed: [blr-acc-sw2] => (item=99 MGMT)
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Dobara chalao to output wahi hota hai par har item ke liye <code>changed</code> ki jagah <code>ok</code>: module ne switch check kiya, VLANs pehle se mile aur kuch change nahi kiya. Yeh idempotency hai, item ke hisaab se.</p>

<h3>Label kyun zaroori hai</h3>
<p><code>loop_control</code> ke bina Ansible poora item print karta hai. Lambe dictionary mein yeh screen bhar deta hai aur secret bhi leak kar sakta hai:</p>
<pre class="out">AUTO01$ ansible-playbook vlans-nolabel.yml
PLAY [VLAN rollout without a label] *******************************************
TASK [Standard VLANs] *********************************************************
ok: [pun-acc-sw1] => (item={'id': 10, 'name': 'USERS'})
ok: [pun-acc-sw1] => (item={'id': 20, 'name': 'VOICE'})
ok: [pun-acc-sw1] => (item={'id': 99, 'name': 'MGMT'})
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Label ke saath aapne <code>item=10 USERS</code> dekha, chhota aur readable. Yeh sirf display badalta hai, behaviour nahi.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="List looped task ko feed karti hai">
<rect x="20" y="40" width="170" height="130" rx="10" fill="#fde68a"/><text x="105" y="65" text-anchor="middle" class="svg-ink" font-size="13">vlans (list)</text><text x="105" y="95" text-anchor="middle" class="svg-muted" font-size="12">10 USERS</text><text x="105" y="118" text-anchor="middle" class="svg-muted" font-size="12">20 VOICE</text><text x="105" y="141" text-anchor="middle" class="svg-muted" font-size="12">99 MGMT</text>
<rect x="260" y="75" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="335" y="110" text-anchor="middle" class="svg-ink" font-size="13">ek task</text>
<rect x="470" y="40" width="150" height="130" rx="10" fill="#bae6fd"/><text x="545" y="65" text-anchor="middle" class="svg-ink" font-size="13">teen results</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">item 10</text><text x="545" y="123" text-anchor="middle" class="svg-muted" font-size="12">item 20</text><text x="545" y="146" text-anchor="middle" class="svg-muted" font-size="12">item 99</text>
<line x1="190" y1="105" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Task body ek baar likhi jaati hai; Ansible har element ke liye chalata hai.</p></div>

<h3>Variable jo kuch hosts ke paas nahi</h3>
<p><code>extra_vlans</code> sirf <code>blr-acc-sw2</code> ke paas hai. Ise saare switches par seedha loop karne par jis host ke paas nahi woh fail hota hai:</p>
<pre class="out">AUTO01$ ansible-playbook loop-undef.yml
PLAY [Loop over a variable some hosts lack] ***********************************
TASK [Site VLANs] *************************************************************
fatal: [pun-acc-sw1]: FAILED! => {"msg": "'extra_vlans' is undefined. 'extra_vlans' is undefined"}
ok: [blr-acc-sw2] => (item={'id': 30, 'name': 'CCTV'}) => {
    "item": {
        "id": 30,
        "name": "CCTV"
    },
    "msg": "30 CCTV"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Ilaaj <code>default</code> filter hai. <code>loop: "{{ extra_vlans | default([]) }}"</code> likhne ka matlab "extra_vlans use karo, ya agar na ho to khaali list". Khaali list par loop task ko bas skip kar deta hai:</p>
<pre class="out">AUTO01$ ansible-playbook loop-default.yml
PLAY [Loop with a default] ****************************************************
TASK [Site VLANs] *************************************************************
skipping: [pun-acc-sw1]
ok: [blr-acc-sw2] => (item={'id': 30, 'name': 'CCTV'}) => {
    "item": {
        "id": 30,
        "name": "CCTV"
    },
    "msg": "30 CCTV"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=0    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<h3>Dictionary par loop</h3>
<p>Agar aapka data dictionary hai, jaise <code>primary: 10.99.0.60</code> aur <code>backup: 10.99.0.61</code>, to ise <code>dict2items</code> se convert karo. Key aur value tab <code>item.key</code> aur <code>item.value</code> ke roop mein aate hain:</p>
<pre class="out">AUTO01$ ansible-playbook loop-dict.yml
PLAY [Loop over a dictionary] *************************************************
TASK [Print each server] ******************************************************
ok: [pun-core-r1] => (item={'key': 'primary', 'value': '10.99.0.60'}) => {
    "item": {
        "key": "primary",
        "value": "10.99.0.60"
    },
    "msg": "primary server is 10.99.0.60"
}
ok: [pun-core-r1] => (item={'key': 'backup', 'value': '10.99.0.61'}) => {
    "item": {
        "key": "backup",
        "value": "10.99.0.61"
    },
    "msg": "backup server is 10.99.0.61"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<div class="warn"><p><b>Common beginner mistake.</b> <code>loop</code> ko module arguments ke andar rakhna, ya braces aur quotes ke bina <code>loop: vlans</code> likhna. Bare naam literal text "vlans" padha jaata hai, variable nahi. <code>loop: "{{ vlans }}"</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Loop variable <code>item</code> hota hai jab tak aap use <code>loop_control: loop_var:</code> se rename na karo, jo nested situations mein chahiye. Aur <code>loop</code> modern form hai; purane material mein <code>with_items</code> milta hai.</p></div>

<div class="scn"><h4>Gyarah VLANs, ek typo</h4><p>Ek team ne VLAN task gyarah baar paste kiya tha. VLAN 47 ke naam mein spelling galat thi aur hafton tak kisi ne nahi dekha. List ko group_vars mein le jaakar loop karne ke baad list ke ek review mein typo mil gayi, aur har switch ek run mein theek ho gaya.</p></div>

<div class="iv"><p class="q">"VLANs ki list ke liye same configuration kaise apply karte ho?"</p><p>Main VLANs ko dictionaries ki list ke roop mein group_vars mein rakhta hoon aur ek task se loop karta hoon jo <code>ios_vlans</code> jaisa resource module state merged ke saath use karta hai. Readable output ke liye loop label lagata hoon aur jo lists sirf kuch hosts ke paas hain unke liye <code>default([])</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>loop</code> task ko har element ke liye repeat karta hai; element <code>item</code> hai.</li>
<li>Variable par loop ke liye <code>loop: "{{ listname }}"</code> likho.</li>
<li><code>loop_control: label:</code> behaviour badle bina output chhota karta hai.</li>
<li>Jab host ke paas list na ho to <code>| default([])</code> use karo.</li>
<li><code>dict2items</code> dictionary ko key aur value items mein badalta hai.</li>
</ul></div>
`}};export{e as default};