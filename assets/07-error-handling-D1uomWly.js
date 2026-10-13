var e={id:`error-handling`,h:{en:`Error handling: ignore, stop everyone, retry, or roll back`,hi:`Error handling: ignore, sabko roko, retry ya rollback`},body:{en:`
<p>Real networks fail in small ways: a command is not supported on one platform, a link takes a few seconds to come up, one router in ten is unreachable. By default Ansible stops a failing <b>host</b> and carries on with the others. This chapter shows how to change that behaviour deliberately: ignore an error, stop everyone, retry, or undo a half-finished change.</p>

<h3>Default: one host fails, the others continue</h3>
<pre class="out">AUTO01$ ansible-playbook err6.yml
PLAY [Default behaviour, one host fails] **************************************
TASK [Fails only on blr-edge-r2] **********************************************
skipping: [pun-core-r1]
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "only this host fails"}
TASK [Other host continues] ***************************************************
ok: [pun-core-r1] => {
    "msg": "still running on pun-core-r1"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-edge-r2                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>The play used <code>ansible.builtin.fail</code> with a <code>when</code> to fail one host on purpose. <code>blr-edge-r2</code> is out of the play, while <code>pun-core-r1</code> finishes the next task. In a rollout this is usually good: one broken device does not block the rest. It can also be dangerous, as a half-applied change leaves the network in two states.</p>

<h3>ignore_errors: carry on regardless</h3>
<p>For a task whose failure does not matter, such as an optional command that older software does not understand, add <code>ignore_errors: true</code>:</p>
<pre class="code">    - name: Optional command that fails on purpose
      cisco.ios.ios_command:
        commands: show ip bogus
      ignore_errors: true

    - name: Next task still runs
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} carried on"</pre>
<pre class="out">AUTO01$ ansible-playbook err1.yml
PLAY [ignore_errors] **********************************************************
TASK [Optional command that fails on purpose] *********************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
...ignoring
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
...ignoring
TASK [Next task still runs] ***************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 carried on"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 carried on"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=1   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=1   </pre>
<p>The error is still printed, followed by <code>...ignoring</code>, and the recap counts it under <code>ignored=1</code>. The failure is not hidden; it is just no longer fatal.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Four error behaviours">
<rect x="15" y="20" width="145" height="80" rx="10" fill="#e2e8f0"/><text x="87" y="52" text-anchor="middle" class="svg-ink" font-size="12">default</text><text x="87" y="74" text-anchor="middle" class="svg-muted" font-size="11">host drops out</text>
<rect x="175" y="20" width="145" height="80" rx="10" fill="#fde68a"/><text x="247" y="52" text-anchor="middle" class="svg-ink" font-size="12">ignore_errors</text><text x="247" y="74" text-anchor="middle" class="svg-muted" font-size="11">carry on</text>
<rect x="335" y="20" width="145" height="80" rx="10" fill="#fca5a5"/><text x="407" y="52" text-anchor="middle" class="svg-ink" font-size="12">any_errors_fatal</text><text x="407" y="74" text-anchor="middle" class="svg-muted" font-size="11">stop everyone</text>
<rect x="495" y="20" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="12">block / rescue</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="11">roll back</text>
<rect x="175" y="130" width="305" height="60" rx="10" fill="#bae6fd"/><text x="327" y="156" text-anchor="middle" class="svg-ink" font-size="12">until / retries: wait and try again</text><text x="327" y="176" text-anchor="middle" class="svg-muted" font-size="11">for things that take time</text>
</svg><p class="cap">Choose the behaviour that matches the risk of the change.</p></div>

<h3>any_errors_fatal: one failure stops the whole play</h3>
<p>When devices must change together, such as both ends of a link, set <code>any_errors_fatal: true</code> on the play. A failure on any host then ends the run for everybody:</p>
<pre class="out">AUTO01$ ansible-playbook err5.yml
PLAY [any_errors_fatal] *******************************************************
TASK [Fails only on blr-edge-r2] **********************************************
skipping: [pun-core-r1]
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "stop the whole play"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=0    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-edge-r2                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Compare with the default run: the task "Never reached by pun-core-r1" was not run for the healthy router.</p>

<h3>block, rescue, always: a rollback pattern</h3>
<p>A <b>block</b> groups tasks. If any task in the block fails, the tasks in <b>rescue</b> run instead. Tasks in <b>always</b> run in every case. This is how you write "try the change, undo it if the check fails":</p>
<pre class="code">    - name: Try the change
      block:
        - name: Add a test ACL line
          cisco.ios.ios_config:
            lines:
              - ip access-list standard NK-TEST-ACL
              - permit 192.0.2.0 0.0.0.255

        - name: Post-check that fails on purpose
          ansible.builtin.assert:
            that:
              - false
            fail_msg: "post-check failed on {{ inventory_hostname }}"
      rescue:
        - name: Undo the change
          cisco.ios.ios_config:
            lines:
              - no ip access-list standard NK-TEST-ACL
        - name: Say what failed
          ansible.builtin.debug:
            msg: "rolled back after: {{ ansible_failed_task.name }}"
      always:
        - name: Always runs
          ansible.builtin.debug:
            msg: "finished on {{ inventory_hostname }}"</pre>
<ul>
<li>The ACL uses 192.0.2.0, a documentation address range, so it is safe as a test.</li>
<li>The post-check is an assert that is always false, to force the failure path for this demonstration.</li>
<li><code>ansible_failed_task</code> is a variable Ansible fills in inside <code>rescue</code>; its <code>name</code> tells you which task failed.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook err4.yml
PLAY [block rescue always] ****************************************************
TASK [Add a test ACL line] ****************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Post-check that fails on purpose] ***************************************
fatal: [pun-core-r1]: FAILED! => {"assertion": "false", "changed": false, "evaluated_to": false, "msg": "post-check failed on pun-core-r1"}
fatal: [blr-edge-r2]: FAILED! => {"assertion": "false", "changed": false, "evaluated_to": false, "msg": "post-check failed on blr-edge-r2"}
TASK [Undo the change] ********************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Say what failed] ********************************************************
ok: [pun-core-r1] => {
    "msg": "rolled back after: Post-check that fails on purpose"
}
ok: [blr-edge-r2] => {
    "msg": "rolled back after: Post-check that fails on purpose"
}
TASK [Always runs] ************************************************************
ok: [pun-core-r1] => {
    "msg": "finished on pun-core-r1"
}
ok: [blr-edge-r2] => {
    "msg": "finished on blr-edge-r2"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=1    ignored=0   
blr-edge-r2                : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=1    ignored=0   </pre>
<p>The recap shows <code>failed=0</code> and <code>rescued=1</code>: the failure was handled. Afterwards the router CLI confirms the ACL is gone; the command <code>show running-config | include access-list</code> returned no lines on R1.</p>

<h3>until and retries: wait for a slow thing</h3>
<p>Interfaces and routing neighbours take time. Instead of failing at once, ask Ansible to retry:</p>
<pre class="code">    - name: Wait for Gi0/0 up/up
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: out
      until: out.stdout[0] is search('GigabitEthernet0/0 +10[.]99[.]0[.]1 +YES manual up +up')
      retries: 3
      delay: 2</pre>
<pre class="out">AUTO01$ ansible-playbook err7.yml
PLAY [Retry until up] *********************************************************
TASK [Wait for Gi0/0 up/up] ***************************************************
ok: [pun-core-r1]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p><code>until</code> is the success condition, <code>retries</code> the maximum number of attempts and <code>delay</code> the pause in seconds. The link was already up, so the first attempt passed. This lesson does not show a retry in action; you will see the full retry text in a real run when the condition is false.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Using <code>ignore_errors: true</code> on a configuration task to "make the red go away". The device may be left half configured and the recap looks green. Ignore only read-only or truly optional tasks.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>rescue</code> runs only if something in the block failed; <code>always</code> runs either way. A rescued host is not counted as failed. <code>any_errors_fatal</code> is set at play level, not on a task.</p></div>

<div class="scn"><h4>The ACL that did not stay</h4><p>A rollout added an ACL line, then verified reachability. The verification failed on one site. Because the change was inside a block with a rescue that removed the line, the site returned to its previous state and the recap showed rescued=1. Nobody had to log in to clean up.</p></div>

<div class="iv"><p class="q">"How do you make an Ansible change safe to roll back?"</p><p>I put the change and its post-check inside a block, and the undo commands in rescue. The recap then shows rescued instead of failed. For linked devices I use <code>any_errors_fatal</code>, and for slow convergence I use <code>until</code> with retries and a delay.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>By default a failing host drops out while others continue.</li>
<li><code>ignore_errors</code> prints the error, then carries on; use it for optional read-only tasks.</li>
<li><code>any_errors_fatal: true</code> stops all hosts after one failure.</li>
<li><code>block</code>, <code>rescue</code>, <code>always</code> give you try, undo and cleanup.</li>
<li><code>until</code>, <code>retries</code> and <code>delay</code> wait for slow state.</li>
</ul></div>
`,hi:`
<p>Asli networks chhote tareeke se fail hote hain: ek platform par command supported nahi, link ko up hone mein kuch second lagte hain, das mein se ek router unreachable. Default mein Ansible fail hone wale <b>host</b> ko rok deta hai aur baaki ke saath aage badhta hai. Yeh chapter dikhata hai is behaviour ko jaan-boojhkar kaise badlein: error ignore karo, sabko roko, retry karo, ya adhura change undo karo.</p>

<h3>Default: ek host fail, baaki chalte hain</h3>
<pre class="out">AUTO01$ ansible-playbook err6.yml
PLAY [Default behaviour, one host fails] **************************************
TASK [Fails only on blr-edge-r2] **********************************************
skipping: [pun-core-r1]
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "only this host fails"}
TASK [Other host continues] ***************************************************
ok: [pun-core-r1] => {
    "msg": "still running on pun-core-r1"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-edge-r2                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Play ne <code>when</code> ke saath <code>ansible.builtin.fail</code> use karke jaan-boojhkar ek host fail kiya. <code>blr-edge-r2</code> play se bahar hai, jabki <code>pun-core-r1</code> agla task poora karta hai. Rollout mein yeh aam taur par accha hai: ek kharab device baaki ko nahi rokta. Yeh khatarnak bhi ho sakta hai, kyunki adhura apply hua change network ko do states mein chhod deta hai.</p>

<h3>ignore_errors: kuch bhi ho, aage badho</h3>
<p>Aise task ke liye jiska fail hona matter nahi karta, jaise optional command jo purana software nahi samajhta, <code>ignore_errors: true</code> jodo:</p>
<pre class="code">    - name: Optional command that fails on purpose
      cisco.ios.ios_command:
        commands: show ip bogus
      ignore_errors: true

    - name: Next task still runs
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} carried on"</pre>
<pre class="out">AUTO01$ ansible-playbook err1.yml
PLAY [ignore_errors] **********************************************************
TASK [Optional command that fails on purpose] *********************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
...ignoring
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
...ignoring
TASK [Next task still runs] ***************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 carried on"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 carried on"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=1   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=1   </pre>
<p>Error phir bhi print hota hai, uske baad <code>...ignoring</code>, aur recap use <code>ignored=1</code> mein ginta hai. Failure chhupta nahi; bas ab fatal nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Error ke chaar behaviours">
<rect x="15" y="20" width="145" height="80" rx="10" fill="#e2e8f0"/><text x="87" y="52" text-anchor="middle" class="svg-ink" font-size="12">default</text><text x="87" y="74" text-anchor="middle" class="svg-muted" font-size="11">host bahar</text>
<rect x="175" y="20" width="145" height="80" rx="10" fill="#fde68a"/><text x="247" y="52" text-anchor="middle" class="svg-ink" font-size="12">ignore_errors</text><text x="247" y="74" text-anchor="middle" class="svg-muted" font-size="11">aage badho</text>
<rect x="335" y="20" width="145" height="80" rx="10" fill="#fca5a5"/><text x="407" y="52" text-anchor="middle" class="svg-ink" font-size="12">any_errors_fatal</text><text x="407" y="74" text-anchor="middle" class="svg-muted" font-size="11">sabko roko</text>
<rect x="495" y="20" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="12">block / rescue</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="11">rollback</text>
<rect x="175" y="130" width="305" height="60" rx="10" fill="#bae6fd"/><text x="327" y="156" text-anchor="middle" class="svg-ink" font-size="12">until / retries: ruko aur dobara try karo</text><text x="327" y="176" text-anchor="middle" class="svg-muted" font-size="11">der lagne wali cheezon ke liye</text>
</svg><p class="cap">Woh behaviour chuno jo change ke risk se match kare.</p></div>

<h3>any_errors_fatal: ek failure poora play rokta hai</h3>
<p>Jab devices saath badalne ho, jaise link ke dono sire, play par <code>any_errors_fatal: true</code> set karo. Kisi bhi host par failure se sabke liye run khatam:</p>
<pre class="out">AUTO01$ ansible-playbook err5.yml
PLAY [any_errors_fatal] *******************************************************
TASK [Fails only on blr-edge-r2] **********************************************
skipping: [pun-core-r1]
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "stop the whole play"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=0    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-edge-r2                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Default run se tulna karo: task "Never reached by pun-core-r1" healthy router ke liye chala hi nahi.</p>

<h3>block, rescue, always: rollback pattern</h3>
<p><b>Block</b> tasks ko group karta hai. Block ka koi task fail ho to uski jagah <b>rescue</b> ke tasks chalte hain. <b>always</b> ke tasks har haal mein chalte hain. Aise likhte hain "change try karo, check fail ho to undo karo":</p>
<pre class="code">    - name: Try the change
      block:
        - name: Add a test ACL line
          cisco.ios.ios_config:
            lines:
              - ip access-list standard NK-TEST-ACL
              - permit 192.0.2.0 0.0.0.255

        - name: Post-check that fails on purpose
          ansible.builtin.assert:
            that:
              - false
            fail_msg: "post-check failed on {{ inventory_hostname }}"
      rescue:
        - name: Undo the change
          cisco.ios.ios_config:
            lines:
              - no ip access-list standard NK-TEST-ACL
        - name: Say what failed
          ansible.builtin.debug:
            msg: "rolled back after: {{ ansible_failed_task.name }}"
      always:
        - name: Always runs
          ansible.builtin.debug:
            msg: "finished on {{ inventory_hostname }}"</pre>
<ul>
<li>ACL 192.0.2.0 use karta hai, jo documentation address range hai, isliye test ke liye safe hai.</li>
<li>Post-check ek assert hai jo hamesha false hai, is demonstration mein failure path force karne ke liye.</li>
<li><code>ansible_failed_task</code> woh variable hai jo Ansible <code>rescue</code> ke andar bharta hai; uska <code>name</code> batata hai kaunsa task fail hua.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook err4.yml
PLAY [block rescue always] ****************************************************
TASK [Add a test ACL line] ****************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Post-check that fails on purpose] ***************************************
fatal: [pun-core-r1]: FAILED! => {"assertion": "false", "changed": false, "evaluated_to": false, "msg": "post-check failed on pun-core-r1"}
fatal: [blr-edge-r2]: FAILED! => {"assertion": "false", "changed": false, "evaluated_to": false, "msg": "post-check failed on blr-edge-r2"}
TASK [Undo the change] ********************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Say what failed] ********************************************************
ok: [pun-core-r1] => {
    "msg": "rolled back after: Post-check that fails on purpose"
}
ok: [blr-edge-r2] => {
    "msg": "rolled back after: Post-check that fails on purpose"
}
TASK [Always runs] ************************************************************
ok: [pun-core-r1] => {
    "msg": "finished on pun-core-r1"
}
ok: [blr-edge-r2] => {
    "msg": "finished on blr-edge-r2"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=1    ignored=0   
blr-edge-r2                : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=1    ignored=0   </pre>
<p>Recap <code>failed=0</code> aur <code>rescued=1</code> dikhata hai: failure handle ho gaya. Baad mein router CLI confirm karta hai ki ACL gayab hai; R1 par <code>show running-config | include access-list</code> ne koi line return nahi ki.</p>

<h3>until aur retries: dheemi cheez ka intezaar</h3>
<p>Interfaces aur routing neighbours ko time lagta hai. Turant fail hone ki jagah Ansible se retry karne ko kaho:</p>
<pre class="code">    - name: Wait for Gi0/0 up/up
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: out
      until: out.stdout[0] is search('GigabitEthernet0/0 +10[.]99[.]0[.]1 +YES manual up +up')
      retries: 3
      delay: 2</pre>
<pre class="out">AUTO01$ ansible-playbook err7.yml
PLAY [Retry until up] *********************************************************
TASK [Wait for Gi0/0 up/up] ***************************************************
ok: [pun-core-r1]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p><code>until</code> success condition hai, <code>retries</code> adhiktam attempts, aur <code>delay</code> seconds mein pause. Link pehle se up tha, isliye pehli koshish pass hui. Yeh lesson retry ko action mein nahi dikhata; condition false hone par asli run mein aapko poora retry text dikhega.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Configuration task par "laal hatane ke liye" <code>ignore_errors: true</code> lagana. Device adhura configured reh sakta hai aur recap hara dikhta hai. Sirf read-only ya sach mein optional tasks ignore karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>rescue</code> tabhi chalta hai jab block mein kuch fail ho; <code>always</code> dono haal mein chalta hai. Rescued host failed nahi ginta. <code>any_errors_fatal</code> play level par set hota hai, task par nahi.</p></div>

<div class="scn"><h4>ACL jo tika nahi</h4><p>Ek rollout ne ACL line jodi, phir reachability verify ki. Ek site par verification fail hui. Kyunki change ek block mein tha jiska rescue line hata deta tha, site pichhli state par laut gaya aur recap ne rescued=1 dikhaya. Safai ke liye kisi ko login nahi karna pada.</p></div>

<div class="iv"><p class="q">"Ansible change ko rollback-safe kaise banate ho?"</p><p>Main change aur uska post-check block mein rakhta hoon, aur undo commands rescue mein. Recap tab failed ki jagah rescued dikhata hai. Linked devices ke liye <code>any_errors_fatal</code>, aur dheemi convergence ke liye <code>until</code> retries aur delay ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default mein fail hone wala host bahar hota hai jabki baaki chalte hain.</li>
<li><code>ignore_errors</code> error print karke aage badhta hai; optional read-only tasks ke liye use karo.</li>
<li><code>any_errors_fatal: true</code> ek failure ke baad sab hosts ko rokta hai.</li>
<li><code>block</code>, <code>rescue</code>, <code>always</code> try, undo aur cleanup dete hain.</li>
<li><code>until</code>, <code>retries</code> aur <code>delay</code> dheemi state ka intezaar karte hain.</li>
</ul></div>
`}};export{e as default};