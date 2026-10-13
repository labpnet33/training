var e={id:`when`,h:{en:`when: run a task only where it makes sense`,hi:`when: task sirf wahin chalao jahan sahi ho`},body:{en:`
<p>A playbook that targets <code>hosts: all</code> still meets devices of different kinds. Some are routers, some are switches, some are in Pune, some in Bengaluru. The <code>when</code> keyword attaches a <b>condition</b> to a task. Ansible tests the condition for each host separately: if it is true the task runs, if false the task shows <code>skipping</code>. A skipped task changes nothing and is not an error.</p>

<h3>Conditions from group membership</h3>
<p>The magic variable <code>group_names</code> lists the groups of the current host, so it is the most natural test in network work. Here is a play with three conditions:</p>
<pre class="code">---
- name: Conditions
  hosts: all
  gather_facts: false
  tasks:
    - name: Pune only
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} is in Pune"
      when: "'pune' in group_names"

    - name: Routers in Bengaluru
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} is a Bengaluru router"
      when:
        - "'bengaluru' in group_names"
        - "'routers' in group_names"

    - name: Only where extra_vlans exists
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} has {{ extra_vlans | length }} site VLAN"
      when: extra_vlans is defined</pre>
<ul>
<li><code>when: "'pune' in group_names"</code> reads as "the text pune is in the list of my groups". The whole condition is wrapped in double quotes so the single quotes inside are safe.</li>
<li>Giving <code>when</code> a <b>list</b> of conditions means all of them must be true (AND). The second task runs only on a Bengaluru router.</li>
<li><code>extra_vlans is defined</code> is true only on hosts that have that variable. <code>| length</code> counts the items in the list.</li>
<li>Notice that a condition is already an expression. You do not put braces around it.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook when1.yml
PLAY [Conditions] *************************************************************
TASK [Pune only] **************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
skipping: [blr-edge-r2]
skipping: [blr-acc-sw2]
TASK [Routers in Bengaluru] ***************************************************
skipping: [pun-core-r1]
skipping: [pun-acc-sw1]
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is a Bengaluru router"
}
skipping: [blr-acc-sw2]
TASK [Only where extra_vlans exists] ******************************************
skipping: [pun-core-r1]
skipping: [pun-acc-sw1]
skipping: [blr-edge-r2]
ok: [blr-acc-sw2] => {
    "msg": "blr-acc-sw2 has 1 site VLAN"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   
pun-acc-sw1                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   </pre>
<p>Check the pattern yourself: each task has exactly the hosts you expect. The recap counts how many tasks each host skipped.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Condition decides run or skip per host">
<rect x="20" y="85" width="150" height="50" rx="10" fill="#e2e8f0"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="13">one task + when</text>
<rect x="260" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="50" text-anchor="middle" class="svg-ink" font-size="12">pun-core-r1: true, runs</text>
<rect x="260" y="85" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="115" text-anchor="middle" class="svg-ink" font-size="12">pun-acc-sw1: true, runs</text>
<rect x="260" y="150" width="170" height="50" rx="10" fill="#fde68a"/><text x="345" y="180" text-anchor="middle" class="svg-ink" font-size="12">blr-edge-r2: false, skip</text>
<line x1="170" y1="110" x2="260" y2="45" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="110" x2="260" y2="175" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">The condition is tested separately for every host.</p></div>

<h3>Conditions from device facts</h3>
<p>The module <code>cisco.ios.ios_facts</code> asks the device about itself and creates variables such as <code>ansible_net_model</code> and <code>ansible_net_version</code>. We can use them for decisions:</p>
<pre class="code">    - name: Collect facts
      cisco.ios.ios_facts:
        gather_subset: min

    - name: Only on newer software
      ansible.builtin.debug:
        msg: "new enough"
      when: ansible_net_version is version('1.0', '&gt;=')</pre>
<p><code>gather_subset: min</code> collects only the minimum facts, which is quick. The test <code>is version('1.0', '&gt;=')</code> compares version numbers the way a human does, so 10.0 is bigger than 9.0 (a plain text comparison would get that wrong).</p>
<pre class="out">AUTO01$ ansible-playbook when2.yml
PLAY [Fact based condition] ***************************************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Model and version] ******************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1: ISR4331 running 2.0"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2: ISR4331 running 2.0"
}
TASK [Only on newer software] *************************************************
ok: [pun-core-r1] => {
    "msg": "new enough"
}
ok: [blr-edge-r2] => {
    "msg": "new enough"
}
TASK [Only on very new software] **********************************************
skipping: [pun-core-r1]
skipping: [blr-edge-r2]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   </pre>
<p>The numbers shown (model and version) are what the lab simulator reports; a real device returns its own values.</p>

<h3>Do not put braces in when</h3>
<p>A condition is already evaluated as an expression. If you add double curly braces, Ansible still tries to cope but warns you:</p>
<pre class="out">AUTO01$ ansible-playbook when3.yml
PLAY [Braces in when] *********************************************************
TASK [Braces by mistake] ******************************************************
[WARNING]: conditional statements should not include jinja2 templating delimiters such as {{ }} or {% %}. Found: {{ 'pune' in group_names }}
ok: [pun-core-r1] => {
    "msg": "ok"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>It worked here, but treat every such warning as a bug to fix. Write <code>when: "'pune' in group_names"</code> with no braces.</p>

<h3>The Pune-only BPDU guard</h3>
<p>This is the pattern behind the module lab: one task for all switches that only applies in Pune.</p>
<pre class="code">    - name: BPDU guard in Pune only
      cisco.ios.ios_config:
        lines:
          - spanning-tree portfast bpduguard default
      when: "'pune' in group_names"</pre>
<p>In the VLAN run you saw this as <code>changed</code> on <code>pun-acc-sw1</code> and <code>skipping</code> on <code>blr-acc-sw2</code>.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Using <code>when</code> with a variable that may not exist and forgetting <code>is defined</code>. Also: <code>when</code> on a looped task is evaluated for <i>each item</i>, not once for the whole loop.</p></div>
<div class="exam"><p><b>Exam trap.</b> A list under <code>when</code> is AND. For OR, write one line with <code>or</code>, for example <code>when: "'routers' in group_names or 'switches' in group_names"</code>. A skipped task is not a failure.</p></div>

<div class="scn"><h4>The knob that only applied to one site</h4><p>A security setting was required on Pune access switches only. Instead of a second playbook, the engineer added <code>when: "'pune' in group_names"</code> to a single task. Bengaluru switches showed <code>skipping</code>, and the audit trail was a single playbook file.</p></div>

<div class="iv"><p class="q">"How do you make a task run only on some devices?"</p><p>I use <code>when</code> with a condition on group membership (<code>group_names</code>), on a variable (<code>is defined</code>), or on a fact such as the software version. A list of conditions means AND. I do not wrap conditions in braces.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>when</code> is tested per host; false means <code>skipping</code>, not failure.</li>
<li>Test group membership with <code>'name' in group_names</code>.</li>
<li>A list of conditions means all must be true.</li>
<li>Use <code>is defined</code> for variables some hosts lack and <code>is version()</code> for versions.</li>
<li>Do not write double curly braces inside <code>when</code>.</li>
</ul></div>
`,hi:`
<p><code>hosts: all</code> wala playbook phir bhi alag-alag kisam ke devices se milta hai. Kuch routers hain, kuch switches, kuch Pune mein, kuch Bengaluru mein. <code>when</code> keyword task ke saath ek <b>condition</b> jodta hai. Ansible condition ko har host ke liye alag test karta hai: true ho to task chalta hai, false ho to task <code>skipping</code> dikhata hai. Skipped task kuch change nahi karta aur error nahi hota.</p>

<h3>Group membership se conditions</h3>
<p>Magic variable <code>group_names</code> current host ke groups list karta hai, isliye network ke kaam mein yeh sabse natural test hai. Neeche teen conditions wala play hai:</p>
<pre class="code">---
- name: Conditions
  hosts: all
  gather_facts: false
  tasks:
    - name: Pune only
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} is in Pune"
      when: "'pune' in group_names"

    - name: Routers in Bengaluru
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} is a Bengaluru router"
      when:
        - "'bengaluru' in group_names"
        - "'routers' in group_names"

    - name: Only where extra_vlans exists
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} has {{ extra_vlans | length }} site VLAN"
      when: extra_vlans is defined</pre>
<ul>
<li><code>when: "'pune' in group_names"</code> ka matlab "text pune mere groups ki list mein hai". Poori condition double quotes mein hai taaki andar ke single quotes safe rahein.</li>
<li><code>when</code> ko conditions ki <b>list</b> dene ka matlab sab true hon (AND). Doosra task sirf Bengaluru router par chalta hai.</li>
<li><code>extra_vlans is defined</code> sirf un hosts par true hai jinke paas woh variable hai. <code>| length</code> list ke items ginta hai.</li>
<li>Dhyan do ki condition pehle se expression hai. Uske aas-paas braces nahi lagate.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook when1.yml
PLAY [Conditions] *************************************************************
TASK [Pune only] **************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 is in Pune"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 is in Pune"
}
skipping: [blr-edge-r2]
skipping: [blr-acc-sw2]
TASK [Routers in Bengaluru] ***************************************************
skipping: [pun-core-r1]
skipping: [pun-acc-sw1]
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 is a Bengaluru router"
}
skipping: [blr-acc-sw2]
TASK [Only where extra_vlans exists] ******************************************
skipping: [pun-core-r1]
skipping: [pun-acc-sw1]
skipping: [blr-edge-r2]
ok: [blr-acc-sw2] => {
    "msg": "blr-acc-sw2 has 1 site VLAN"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   
pun-acc-sw1                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   </pre>
<p>Pattern khud check karo: har task par wahi hosts hain jo aap expect karte ho. Recap ginta hai har host ne kitne tasks skip kiye.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Condition har host ke liye run ya skip tay karti hai">
<rect x="20" y="85" width="150" height="50" rx="10" fill="#e2e8f0"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="13">ek task + when</text>
<rect x="260" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="50" text-anchor="middle" class="svg-ink" font-size="12">pun-core-r1: true, chalta</text>
<rect x="260" y="85" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="115" text-anchor="middle" class="svg-ink" font-size="12">pun-acc-sw1: true, chalta</text>
<rect x="260" y="150" width="170" height="50" rx="10" fill="#fde68a"/><text x="345" y="180" text-anchor="middle" class="svg-ink" font-size="12">blr-edge-r2: false, skip</text>
<line x1="170" y1="110" x2="260" y2="45" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="170" y1="110" x2="260" y2="175" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Condition har host ke liye alag test hoti hai.</p></div>

<h3>Device facts se conditions</h3>
<p>Module <code>cisco.ios.ios_facts</code> device se uske baare mein poochta hai aur <code>ansible_net_model</code> aur <code>ansible_net_version</code> jaise variables banata hai. Inhe faisle ke liye use kar sakte hain:</p>
<pre class="code">    - name: Collect facts
      cisco.ios.ios_facts:
        gather_subset: min

    - name: Only on newer software
      ansible.builtin.debug:
        msg: "new enough"
      when: ansible_net_version is version('1.0', '&gt;=')</pre>
<p><code>gather_subset: min</code> sirf minimum facts collect karta hai, jo tez hai. Test <code>is version('1.0', '&gt;=')</code> version numbers ko insaan ki tarah compare karta hai, isliye 10.0, 9.0 se bada hai (plain text comparison ise galat karta).</p>
<pre class="out">AUTO01$ ansible-playbook when2.yml
PLAY [Fact based condition] ***************************************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Model and version] ******************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1: ISR4331 running 2.0"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2: ISR4331 running 2.0"
}
TASK [Only on newer software] *************************************************
ok: [pun-core-r1] => {
    "msg": "new enough"
}
ok: [blr-edge-r2] => {
    "msg": "new enough"
}
TASK [Only on very new software] **********************************************
skipping: [pun-core-r1]
skipping: [blr-edge-r2]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   </pre>
<p>Dikhaye gaye numbers (model aur version) lab simulator ke report kiye hue hain; asli device apni values return karta hai.</p>

<h3>when mein braces mat lagao</h3>
<p>Condition pehle se expression ki tarah evaluate hoti hai. Agar aap double curly braces jodte ho, Ansible phir bhi sambhal leta hai par warning deta hai:</p>
<pre class="out">AUTO01$ ansible-playbook when3.yml
PLAY [Braces in when] *********************************************************
TASK [Braces by mistake] ******************************************************
[WARNING]: conditional statements should not include jinja2 templating delimiters such as {{ }} or {% %}. Found: {{ 'pune' in group_names }}
ok: [pun-core-r1] => {
    "msg": "ok"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Yahan chal gaya, par aisi har warning ko theek karne wala bug samjho. <code>when: "'pune' in group_names"</code> bina braces ke likho.</p>

<h3>Pune-only BPDU guard</h3>
<p>Module lab ke peeche yahi pattern hai: saare switches ke liye ek task jo sirf Pune mein lagta hai.</p>
<pre class="code">    - name: BPDU guard in Pune only
      cisco.ios.ios_config:
        lines:
          - spanning-tree portfast bpduguard default
      when: "'pune' in group_names"</pre>
<p>VLAN run mein aapne ise <code>pun-acc-sw1</code> par <code>changed</code> aur <code>blr-acc-sw2</code> par <code>skipping</code> ke roop mein dekha.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Aisa variable <code>when</code> mein use karna jo exist na kare aur <code>is defined</code> bhool jaana. Aur: looped task par <code>when</code> <i>har item</i> ke liye evaluate hota hai, poore loop ke liye ek baar nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>when</code> ke neeche list AND hai. OR ke liye ek line mein <code>or</code> likho, jaise <code>when: "'routers' in group_names or 'switches' in group_names"</code>. Skipped task failure nahi hai.</p></div>

<div class="scn"><h4>Knob jo sirf ek site par lagna tha</h4><p>Ek security setting sirf Pune access switches par chahiye thi. Doosra playbook banane ki jagah engineer ne ek task mein <code>when: "'pune' in group_names"</code> jod diya. Bengaluru switches ne <code>skipping</code> dikhaya, aur audit trail ek hi playbook file thi.</p></div>

<div class="iv"><p class="q">"Task sirf kuch devices par kaise chalate ho?"</p><p>Main <code>when</code> use karta hoon, group membership (<code>group_names</code>), variable (<code>is defined</code>), ya software version jaise fact par condition ke saath. Conditions ki list ka matlab AND. Conditions ko braces mein nahi lapetta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>when</code> har host ke liye test hota hai; false ka matlab <code>skipping</code>, failure nahi.</li>
<li>Group membership <code>'name' in group_names</code> se test karo.</li>
<li>Conditions ki list ka matlab sab true hon.</li>
<li>Jin variables kuch hosts ke paas nahi unke liye <code>is defined</code>, versions ke liye <code>is version()</code>.</li>
<li><code>when</code> ke andar double curly braces mat likho.</li>
</ul></div>
`}};export{e as default};