var e={id:`assert-failed-changed`,h:{en:`assert, failed_when and changed_when: teaching Ansible what "wrong" means`,hi:`assert, failed_when aur changed_when: Ansible ko sikhana "galat" kya hai`},body:{en:`
<p>Ansible decides on its own what counts as success. A command that returns text without an error is "ok", even if the text says the link is down. For network work that is not enough. You need to say: <i>this result is wrong, stop here</i>. Three tools do that. <b>assert</b> is a task that checks facts. <b>failed_when</b> redefines failure for a task. <b>changed_when</b> redefines what counts as a change.</p>

<h3>assert: a pre-change check</h3>
<p><code>ansible.builtin.assert</code> takes a list of conditions under <code>that:</code>. If every one is true the task passes; if any is false the task fails with your message. Combined with <code>register</code>, it turns a playbook into a checklist:</p>
<pre class="code">---
- name: Pre-change checks
  hosts: routers
  gather_facts: false
  tasks:
    - name: Read the interfaces
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: ifaces

    - name: WAN link must be up and up
      ansible.builtin.assert:
        that:
          - ifaces.stdout[0] is search('GigabitEthernet0/1 +10[.]255[.]0[.][12] +YES manual up +up')
        fail_msg: "{{ inventory_hostname }}: WAN link Gi0/1 is not up/up"
        success_msg: "{{ inventory_hostname }}: WAN link is up"

    - name: Spare port must be shut
      ansible.builtin.assert:
        that:
          - ifaces.stdout[0] is search('GigabitEthernet0/3 +unassigned +YES unset +administratively down down')
          - ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')
        fail_msg: "{{ inventory_hostname }}: Gi0/2 should be up"</pre>
<ul>
<li>The first task reads the interface table into <code>ifaces</code>.</li>
<li>In the first assert, <code>that:</code> holds one condition: the WAN row must show <code>up</code> and <code>up</code>. The <code>[12]</code> accepts either WAN address, 10.255.0.1 or 10.255.0.2.</li>
<li><code>success_msg</code> and <code>fail_msg</code> are what the engineer reads. Always write a fail message that says which device and what is wrong.</li>
<li>The second assert has two conditions, and both must be true. The second one is deliberately untrue in this lab, because Gi0/2 is down, to show you a failure.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook assert1.yml
PLAY [Pre-change checks] ******************************************************
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up and up] *********************************************
ok: [pun-core-r1] => {
    "changed": false,
    "msg": "pun-core-r1: WAN link is up"
}
ok: [blr-edge-r2] => {
    "changed": false,
    "msg": "blr-edge-r2: WAN link is up"
}
TASK [Spare port must be shut] ************************************************
fatal: [pun-core-r1]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')", "changed": false, "evaluated_to": false, "msg": "pun-core-r1: Gi0/2 should be up"}
fatal: [blr-edge-r2]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')", "changed": false, "evaluated_to": false, "msg": "blr-edge-r2: Gi0/2 should be up"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>A passing assert shows your success message; a failing one names the exact condition that was false (<code>assertion</code>), the value it evaluated to, and your own message. When every host fails, Ansible prints <code>NO MORE HOSTS LEFT</code> and the play ends, which is exactly what you want in a pre-check.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Pre-check gate before a change">
<rect x="15" y="70" width="130" height="70" rx="10" fill="#fde68a"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">read state</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="11">register</text>
<rect x="190" y="70" width="130" height="70" rx="10" fill="#fca5a5"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="13">assert</text><text x="255" y="122" text-anchor="middle" class="svg-muted" font-size="11">gate</text>
<rect x="365" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="430" y="55" text-anchor="middle" class="svg-ink" font-size="13">change tasks</text>
<rect x="365" y="130" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="430" y="165" text-anchor="middle" class="svg-ink" font-size="13">stop, no change</text>
<line x1="145" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="365" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="365" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="345" y="70" class="svg-muted" font-size="11">true</text><text x="345" y="148" class="svg-muted" font-size="11">false</text>
</svg><p class="cap">An assert gate lets the change run only when the device state is what you expect.</p></div>

<h3>failed_when: you decide what failure is</h3>
<p><code>failed_when</code> attaches your own condition to a task. The task fails when the condition is true, whatever the module thought. Here a check fails if the WAN interface is already configured on Pune core:</p>
<pre class="code">    - name: WAN must not be configured on this router
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: brief
      failed_when: brief.stdout[0] is search('GigabitEthernet0/1 +10[.]255[.]0[.]1 +YES manual up')</pre>
<pre class="out">AUTO01$ ansible-playbook fw1.yml
PLAY [failed_when true] *******************************************************
TASK [WAN must not be configured on this router] ******************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "failed_when_result": true, "msg": "The failed_when condition was true", "stdout": ["Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.1      YES manual up                    up\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"], "stdout_lines": [["Interface              IP-Address      OK? Method Status                Protocol", "GigabitEthernet0/0     10.99.0.1       YES manual up                    up", "GigabitEthernet0/1     10.255.0.1      YES manual up                    up", "GigabitEthernet0/2     unassigned      YES unset  administratively down down", "GigabitEthernet0/3     unassigned      YES unset  administratively down down"]]}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>The message "The failed_when condition was true" is your clue that the failure came from your own rule, not from the device. A typical real-life use is a command that always exits normally but prints the word "error" or "invalid" somewhere in its text.</p>

<h3>changed_when: honest change reporting</h3>
<p>Command-style modules cannot know whether they changed something, so Ansible assumes <code>changed</code>. That makes the recap noisy and ruins the "second run shows changed=0" test. If a command only reads or runs a helper, tell Ansible so with <code>changed_when: false</code>:</p>
<pre class="code">    - name: Show command that is not a change
      ansible.builtin.command: echo hello
      delegate_to: localhost

    - name: Same with changed_when false
      ansible.builtin.command: echo hello
      delegate_to: localhost
      changed_when: false</pre>
<pre class="out">AUTO01$ ansible-playbook cw1.yml
PLAY [changed_when] ***********************************************************
TASK [Show command that is not a change] **************************************
changed: [pun-core-r1 -> localhost]
TASK [Same with changed_when false] *******************************************
ok: [pun-core-r1 -> localhost]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p><code>delegate_to: localhost</code> runs the command on the control node instead of the router, which is why the label reads <code>pun-core-r1 -> localhost</code>. The first task reports <code>changed</code> even though it only echoes text; the second correctly reports <code>ok</code>. Running the playbook again gave the same two results, so the first task would never let you reach changed=0.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Writing an assert without a <code>fail_msg</code>. When it fails at 2 a.m. the output shows a raw expression and nobody knows what to fix. Always say which device and which expectation.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>assert</code> conditions are not wrapped in braces, just like <code>when</code>. And <code>changed_when: false</code> never hides a failure; only <code>failed_when</code> and <code>ignore_errors</code> change failure handling.</p></div>

<div class="scn"><h4>The green check that was lying</h4><p>A pre-check task ran <code>show interfaces</code> and always passed because the command itself succeeded, even when the uplink was down. Adding an assert on the registered text stopped the migration for the one site whose uplink was actually down.</p></div>

<div class="iv"><p class="q">"How do you turn a playbook into a pre-change check?"</p><p>I read the state with a show command and register it, then use assert with clear messages. If any check fails, the play stops before the change tasks. I use <code>failed_when</code> when a command succeeds technically but its output means failure, and <code>changed_when: false</code> for read-only commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>assert</code> with <code>that:</code> checks conditions and fails with your <code>fail_msg</code>.</li>
<li>Pair <code>register</code> with <code>assert</code> to build pre-change checks.</li>
<li><code>failed_when</code> makes a task fail on your rule; the message says so.</li>
<li><code>changed_when: false</code> stops read-only commands from counting as changes.</li>
<li>Conditions are written without double curly braces.</li>
</ul></div>
`,hi:`
<p>Ansible khud tay karta hai ki success kya hai. Jo command error ke bina text return kare woh "ok" hai, chahe text kahe ki link down hai. Network ke kaam ke liye yeh kaafi nahi. Aapko kehna padta hai: <i>yeh result galat hai, yahin ruko</i>. Teen tools yeh karte hain. <b>assert</b> ek task hai jo facts check karta hai. <b>failed_when</b> task ke liye failure ki definition badalta hai. <b>changed_when</b> badalta hai ki change kya maana jaaye.</p>

<h3>assert: pre-change check</h3>
<p><code>ansible.builtin.assert</code> <code>that:</code> ke neeche conditions ki list leta hai. Sab true hon to task pass; koi false ho to task aapke message ke saath fail. <code>register</code> ke saath milkar yeh playbook ko checklist bana deta hai:</p>
<pre class="code">---
- name: Pre-change checks
  hosts: routers
  gather_facts: false
  tasks:
    - name: Read the interfaces
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: ifaces

    - name: WAN link must be up and up
      ansible.builtin.assert:
        that:
          - ifaces.stdout[0] is search('GigabitEthernet0/1 +10[.]255[.]0[.][12] +YES manual up +up')
        fail_msg: "{{ inventory_hostname }}: WAN link Gi0/1 is not up/up"
        success_msg: "{{ inventory_hostname }}: WAN link is up"

    - name: Spare port must be shut
      ansible.builtin.assert:
        that:
          - ifaces.stdout[0] is search('GigabitEthernet0/3 +unassigned +YES unset +administratively down down')
          - ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')
        fail_msg: "{{ inventory_hostname }}: Gi0/2 should be up"</pre>
<ul>
<li>Pehla task interface table ko <code>ifaces</code> mein padhta hai.</li>
<li>Pehle assert mein <code>that:</code> mein ek condition hai: WAN row <code>up</code> aur <code>up</code> dikhaye. <code>[12]</code> dono WAN addresses, 10.255.0.1 ya 10.255.0.2, accept karta hai.</li>
<li><code>success_msg</code> aur <code>fail_msg</code> woh hain jo engineer padhta hai. Fail message hamesha likho jo bataye kaunsa device aur kya galat hai.</li>
<li>Doosre assert mein do conditions hain, aur dono true honi chahiye. Doosri jaan-boojhkar is lab mein untrue hai, kyunki Gi0/2 down hai, taaki aapko failure dikhe.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook assert1.yml
PLAY [Pre-change checks] ******************************************************
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up and up] *********************************************
ok: [pun-core-r1] => {
    "changed": false,
    "msg": "pun-core-r1: WAN link is up"
}
ok: [blr-edge-r2] => {
    "changed": false,
    "msg": "blr-edge-r2: WAN link is up"
}
TASK [Spare port must be shut] ************************************************
fatal: [pun-core-r1]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')", "changed": false, "evaluated_to": false, "msg": "pun-core-r1: Gi0/2 should be up"}
fatal: [blr-edge-r2]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')", "changed": false, "evaluated_to": false, "msg": "blr-edge-r2: Gi0/2 should be up"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Passing assert aapka success message dikhata hai; failing assert exact woh condition batata hai jo false thi (<code>assertion</code>), jis value par evaluate hui, aur aapka apna message. Jab har host fail ho, Ansible <code>NO MORE HOSTS LEFT</code> print karta hai aur play khatam; pre-check mein yahi chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Change se pehle pre-check gate">
<rect x="15" y="70" width="130" height="70" rx="10" fill="#fde68a"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">state padho</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="11">register</text>
<rect x="190" y="70" width="130" height="70" rx="10" fill="#fca5a5"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="13">assert</text><text x="255" y="122" text-anchor="middle" class="svg-muted" font-size="11">gate</text>
<rect x="365" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="430" y="55" text-anchor="middle" class="svg-ink" font-size="13">change tasks</text>
<rect x="365" y="130" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="430" y="165" text-anchor="middle" class="svg-ink" font-size="13">ruko, change nahi</text>
<line x1="145" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="365" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="365" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="345" y="70" class="svg-muted" font-size="11">true</text><text x="345" y="148" class="svg-muted" font-size="11">false</text>
</svg><p class="cap">Assert gate change ko tabhi chalne deta hai jab device state ummeed jaisi ho.</p></div>

<h3>failed_when: failure aap tay karte ho</h3>
<p><code>failed_when</code> task ke saath aapki apni condition jodta hai. Condition true ho to task fail hota hai, module ne kuch bhi socha ho. Yahan check fail hota hai agar Pune core par WAN interface pehle se configured hai:</p>
<pre class="code">    - name: WAN must not be configured on this router
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: brief
      failed_when: brief.stdout[0] is search('GigabitEthernet0/1 +10[.]255[.]0[.]1 +YES manual up')</pre>
<pre class="out">AUTO01$ ansible-playbook fw1.yml
PLAY [failed_when true] *******************************************************
TASK [WAN must not be configured on this router] ******************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "failed_when_result": true, "msg": "The failed_when condition was true", "stdout": ["Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.1      YES manual up                    up\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"], "stdout_lines": [["Interface              IP-Address      OK? Method Status                Protocol", "GigabitEthernet0/0     10.99.0.1       YES manual up                    up", "GigabitEthernet0/1     10.255.0.1      YES manual up                    up", "GigabitEthernet0/2     unassigned      YES unset  administratively down down", "GigabitEthernet0/3     unassigned      YES unset  administratively down down"]]}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Message "The failed_when condition was true" aapko batata hai ki failure aapke apne rule se aayi, device se nahi. Real life ka typical use: aisa command jo hamesha normal exit karta hai par text mein kahin "error" ya "invalid" print karta hai.</p>

<h3>changed_when: change ki sahi reporting</h3>
<p>Command-style modules ko pata nahi hota ki unhone kuch badla ya nahi, isliye Ansible <code>changed</code> maan leta hai. Isse recap shor-bhara ho jaata hai aur "doosre run mein changed=0" test bigad jaata hai. Agar command sirf padhta hai ya helper chalata hai, to <code>changed_when: false</code> se batao:</p>
<pre class="code">    - name: Show command that is not a change
      ansible.builtin.command: echo hello
      delegate_to: localhost

    - name: Same with changed_when false
      ansible.builtin.command: echo hello
      delegate_to: localhost
      changed_when: false</pre>
<pre class="out">AUTO01$ ansible-playbook cw1.yml
PLAY [changed_when] ***********************************************************
TASK [Show command that is not a change] **************************************
changed: [pun-core-r1 -> localhost]
TASK [Same with changed_when false] *******************************************
ok: [pun-core-r1 -> localhost]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p><code>delegate_to: localhost</code> command ko router ki jagah control node par chalata hai, isliye label <code>pun-core-r1 -> localhost</code> hai. Pehla task sirf text echo karta hai phir bhi <code>changed</code> report karta hai; doosra sahi <code>ok</code> report karta hai. Playbook dobara chalane par wahi do results aaye, isliye pehla task aapko changed=0 tak kabhi pahunchne nahi deta.</p>

<div class="warn"><p><b>Common beginner mistake.</b> <code>fail_msg</code> ke bina assert likhna. Raat 2 baje jab fail hota hai, output mein kaccha expression dikhta hai aur kisi ko pata nahi kya theek karna hai. Hamesha likho kaunsa device aur kaunsi ummeed.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>assert</code> ki conditions <code>when</code> ki tarah braces mein nahi likhte. Aur <code>changed_when: false</code> kabhi failure nahi chhupata; failure handling sirf <code>failed_when</code> aur <code>ignore_errors</code> badalte hain.</p></div>

<div class="scn"><h4>Hara check jo jhoot bol raha tha</h4><p>Ek pre-check task <code>show interfaces</code> chalata tha aur hamesha pass hota tha kyunki command khud succeed hota tha, uplink down ho tab bhi. Registered text par assert jodne se us ek site ke liye migration ruk gaya jiska uplink sach mein down tha.</p></div>

<div class="iv"><p class="q">"Playbook ko pre-change check kaise banate ho?"</p><p>Main show command se state padhta hoon aur register karta hoon, phir clear messages ke saath assert use karta hoon. Koi check fail ho to play change tasks se pehle ruk jaata hai. Jab command technically succeed ho par output ka matlab failure ho tab <code>failed_when</code>, aur read-only commands ke liye <code>changed_when: false</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>assert</code> <code>that:</code> se conditions check karta hai aur aapke <code>fail_msg</code> ke saath fail hota hai.</li>
<li>Pre-change checks ke liye <code>register</code> aur <code>assert</code> ko jodo.</li>
<li><code>failed_when</code> task ko aapke rule par fail karata hai; message yeh batata hai.</li>
<li><code>changed_when: false</code> read-only commands ko change ginne se rokta hai.</li>
<li>Conditions double curly braces ke bina likhi jaati hain.</li>
</ul></div>
`}};export{e as default};