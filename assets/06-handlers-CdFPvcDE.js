var e={id:`handlers`,h:{en:`Handlers: do the follow-up only when something changed`,hi:`Handlers: follow-up tabhi karo jab kuch badla ho`},body:{en:`
<p>Some actions should happen <i>because</i> a change happened, and not otherwise: save the configuration, reload a service, clear an adjacency. If you add them as ordinary tasks they run every time, even when nothing changed. A <b>handler</b> is a task that waits on the side. It runs only if some other task <b>notifies</b> it, and only if that task actually reported <code>changed</code>.</p>

<h3>Notify and handlers</h3>
<pre class="code">---
- name: Baseline with a handler
  hosts: routers
  gather_facts: false
  tasks:
    - name: NTP server
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60
      notify: Save configuration

    - name: Syslog server
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
      notify: Save configuration

    - name: Banner check (read only)
      cisco.ios.ios_command:
        commands: show clock

  handlers:
    - name: Save configuration
      cisco.ios.ios_config:
        save_when: always</pre>
<ul>
<li>The <code>tasks:</code> list is the normal sequence. The <code>handlers:</code> list below it holds tasks that run only on request.</li>
<li><code>notify: Save configuration</code> on a task means "if I changed something, ask the handler with this exact name to run". The name must match the handler's name letter for letter.</li>
<li>Two tasks notify the same handler. The handler still runs <b>once</b>, at the end of the play, even if both tasks changed something.</li>
<li><code>save_when: always</code> in <code>ios_config</code> copies the running configuration to the startup configuration.</li>
<li>The read-only <code>show clock</code> task does not notify anything.</li>
</ul>
<p>First check what the startup configuration looks like before the playbook. The router CLI needs <code>enable</code> first:</p>
<pre class="out">PUN-CORE-R1# show startup-config | include ntp|logging
 logging synchronous</pre>
<p>Now run the playbook for real:</p>
<pre class="out">AUTO01$ ansible-playbook hand1.yml
PLAY [Baseline with a handler] ************************************************
TASK [NTP server] *************************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Syslog server] **********************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Banner check (read only)] ***********************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
RUNNING HANDLER [Save configuration] ******************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=4    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The line <code>RUNNING HANDLER</code> appears only after the normal tasks finish. The startup configuration now has the new lines:</p>
<pre class="out">PUN-CORE-R1# show startup-config | include ntp|logging
logging host 10.99.0.60
ntp server 10.99.0.60
 logging synchronous</pre>
<p>Run the same playbook again. Nothing changed, so nothing notified the handler, and it did not even appear:</p>
<pre class="out">AUTO01$ ansible-playbook hand1.yml
PLAY [Baseline with a handler] ************************************************
TASK [NTP server] *************************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Syslog server] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Banner check (read only)] ***********************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>That is the whole point: a clean second run does no saving, no reloading, no noise.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Tasks notify a handler that runs once at the end">
<rect x="20" y="30" width="170" height="45" rx="8" fill="#fde68a"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="12">task A changed: notify</text>
<rect x="20" y="95" width="170" height="45" rx="8" fill="#fde68a"/><text x="105" y="123" text-anchor="middle" class="svg-ink" font-size="12">task B changed: notify</text>
<rect x="20" y="160" width="170" height="45" rx="8" fill="#e2e8f0"/><text x="105" y="188" text-anchor="middle" class="svg-ink" font-size="12">task C ok: no notify</text>
<rect x="400" y="85" width="200" height="60" rx="10" fill="#bbf7d0"/><text x="500" y="112" text-anchor="middle" class="svg-ink" font-size="13">handler: save</text><text x="500" y="132" text-anchor="middle" class="svg-muted" font-size="11">runs once, at the end</text>
<line x1="190" y1="52" x2="400" y2="105" stroke="#64748b" stroke-width="1.5"/><line x1="190" y1="117" x2="400" y2="115" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Many notifications, one run of the handler, and only when something changed.</p></div>

<h3>Run the handler early with flush_handlers</h3>
<p>Sometimes the next task needs the handler's work done first. <code>meta: flush_handlers</code> forces pending handlers to run at that point, not at the end:</p>
<pre class="code">    - name: Change NTP
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.62
      notify: Announce save

    - name: Flush now
      ansible.builtin.meta: flush_handlers

    - name: Runs after the handler
      ansible.builtin.debug:
        msg: "handler already ran"</pre>
<pre class="out">AUTO01$ ansible-playbook hand2.yml
PLAY [Handler before the next task] *******************************************
TASK [Change NTP] *************************************************************
changed: [pun-core-r1]
TASK [Flush now] **************************************************************
ok: [pun-core-r1]
TASK [Runs after the handler] *************************************************
ok: [pun-core-r1] => {
    "msg": "handler already ran"
}
RUNNING HANDLER [Announce save] ***********************************************
ok: [pun-core-r1] => {
    "msg": "saving because NTP changed"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Look carefully: in this simulator run the handler line printed after the "Runs after the handler" task, so the flush did not move it earlier here. A real Ansible would run the handler at the flush point. Treat the placement of <code>flush_handlers</code> as intent, and always verify the order in your own output.</p>

<h3>The gotcha: a failure can skip the handler</h3>
<p>If a later task fails, the play stops for that host and pending handlers do not run. Worse, the change is already on the device, so the next run sees nothing to change and never notifies the handler again:</p>
<pre class="out">AUTO01$ ansible-playbook hand3.yml
PLAY [Handler is skipped when the play fails] *********************************
TASK [Change NTP] *************************************************************
changed: [pun-core-r1]
TASK [Bad command] ************************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
AUTO01$ ansible-playbook hand3.yml
PLAY [Handler is skipped when the play fails] *********************************
TASK [Change NTP] *************************************************************
ok: [pun-core-r1]
TASK [Bad command] ************************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Neither run printed <code>RUNNING HANDLER</code>. The NTP change was made and never followed up. Real Ansible has a <code>--force-handlers</code> option for this (reference, not run in the simulator), but the better habit is to make the save step independent, for example a final task with <code>save_when: modified</code>, and to fix the failing task.</p>

<div class="warn"><p><b>Common beginner mistake.</b> A handler name that is spelt differently from the <code>notify</code> text. The names will not match, so the follow-up does not happen as you expect (newer Ansible versions report an error). Copy the name exactly.</p></div>
<div class="exam"><p><b>Exam trap.</b> Handlers run once per play, after all tasks, in the order they are <i>defined</i> in the handlers list, not in the order they were notified. They run only if the notifying task reported <code>changed</code>.</p></div>

<div class="scn"><h4>The router that forgot its changes</h4><p>A playbook configured NTP on twelve routers but saved the configuration with an ordinary task that was marked <code>changed_when: false</code>. After a power cycle the NTP lines were gone. Moving the save into a handler notified by the change tasks fixed it, and the second-run output stayed clean.</p></div>

<div class="iv"><p class="q">"What is a handler and when does it run?"</p><p>A handler is a task that runs only when another task notifies it and reports changed. It runs once at the end of the play, even if several tasks notified it. I use handlers to save configuration or restart something after a real change, and I know a failed play can leave a handler unrun.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>notify</code> asks a handler to run, but only if the task changed something.</li>
<li>A handler runs once, at the end of the play, however many tasks notified it.</li>
<li>A clean second run shows no handler at all.</li>
<li><code>meta: flush_handlers</code> is meant to run pending handlers early; check the order in your output.</li>
<li>A failure can leave a handler unrun while the change stays on the device.</li>
</ul></div>
`,hi:`
<p>Kuch actions tabhi hone chahiye <i>kyunki</i> change hua, warna nahi: configuration save karna, service reload karna, adjacency clear karna. Inhe ordinary tasks ki tarah jodoge to yeh har baar chalenge, chahe kuch na badla ho. <b>Handler</b> ek task hai jo side mein intezaar karta hai. Woh tabhi chalta hai jab koi doosra task use <b>notify</b> kare, aur sirf tab jab us task ne sach mein <code>changed</code> report kiya ho.</p>

<h3>Notify aur handlers</h3>
<pre class="code">---
- name: Baseline with a handler
  hosts: routers
  gather_facts: false
  tasks:
    - name: NTP server
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60
      notify: Save configuration

    - name: Syslog server
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
      notify: Save configuration

    - name: Banner check (read only)
      cisco.ios.ios_command:
        commands: show clock

  handlers:
    - name: Save configuration
      cisco.ios.ios_config:
        save_when: always</pre>
<ul>
<li><code>tasks:</code> list normal sequence hai. Uske neeche <code>handlers:</code> list mein woh tasks hain jo sirf request par chalte hain.</li>
<li>Task par <code>notify: Save configuration</code> ka matlab "agar maine kuch badla, to is exact naam wale handler ko chalne ko kaho". Naam handler ke naam se akshar-ba-akshar match hona chahiye.</li>
<li>Do tasks ek hi handler ko notify karte hain. Handler phir bhi play ke end mein <b>ek baar</b> chalta hai, chahe dono ne kuch badla ho.</li>
<li><code>ios_config</code> mein <code>save_when: always</code> running configuration ko startup configuration mein copy karta hai.</li>
<li>Read-only <code>show clock</code> task kuch notify nahi karta.</li>
</ul>
<p>Pehle dekho playbook se pehle startup configuration kaisi hai. Router CLI mein pehle <code>enable</code> chahiye:</p>
<pre class="out">PUN-CORE-R1# show startup-config | include ntp|logging
 logging synchronous</pre>
<p>Ab playbook asli mein chalao:</p>
<pre class="out">AUTO01$ ansible-playbook hand1.yml
PLAY [Baseline with a handler] ************************************************
TASK [NTP server] *************************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Syslog server] **********************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
TASK [Banner check (read only)] ***********************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
RUNNING HANDLER [Save configuration] ******************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=4    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p><code>RUNNING HANDLER</code> line normal tasks khatam hone ke baad hi aati hai. Startup configuration mein ab nayi lines hain:</p>
<pre class="out">PUN-CORE-R1# show startup-config | include ntp|logging
logging host 10.99.0.60
ntp server 10.99.0.60
 logging synchronous</pre>
<p>Wahi playbook dobara chalao. Kuch nahi badla, isliye kisi ne handler ko notify nahi kiya, aur woh dikha bhi nahi:</p>
<pre class="out">AUTO01$ ansible-playbook hand1.yml
PLAY [Baseline with a handler] ************************************************
TASK [NTP server] *************************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Syslog server] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Banner check (read only)] ***********************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Yahi poora point hai: saaf doosra run na save karta hai, na reload, na shor.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Tasks handler ko notify karte hain jo end mein ek baar chalta hai">
<rect x="20" y="30" width="170" height="45" rx="8" fill="#fde68a"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="12">task A changed: notify</text>
<rect x="20" y="95" width="170" height="45" rx="8" fill="#fde68a"/><text x="105" y="123" text-anchor="middle" class="svg-ink" font-size="12">task B changed: notify</text>
<rect x="20" y="160" width="170" height="45" rx="8" fill="#e2e8f0"/><text x="105" y="188" text-anchor="middle" class="svg-ink" font-size="12">task C ok: notify nahi</text>
<rect x="400" y="85" width="200" height="60" rx="10" fill="#bbf7d0"/><text x="500" y="112" text-anchor="middle" class="svg-ink" font-size="13">handler: save</text><text x="500" y="132" text-anchor="middle" class="svg-muted" font-size="11">end mein ek baar</text>
<line x1="190" y1="52" x2="400" y2="105" stroke="#64748b" stroke-width="1.5"/><line x1="190" y1="117" x2="400" y2="115" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Kai notifications, handler ka ek run, aur sirf tab jab kuch badla.</p></div>

<h3>flush_handlers se handler jaldi chalao</h3>
<p>Kabhi agle task ko handler ka kaam pehle chahiye hota hai. <code>meta: flush_handlers</code> pending handlers ko us point par chalne par majboor karta hai, end mein nahi:</p>
<pre class="code">    - name: Change NTP
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.62
      notify: Announce save

    - name: Flush now
      ansible.builtin.meta: flush_handlers

    - name: Runs after the handler
      ansible.builtin.debug:
        msg: "handler already ran"</pre>
<pre class="out">AUTO01$ ansible-playbook hand2.yml
PLAY [Handler before the next task] *******************************************
TASK [Change NTP] *************************************************************
changed: [pun-core-r1]
TASK [Flush now] **************************************************************
ok: [pun-core-r1]
TASK [Runs after the handler] *************************************************
ok: [pun-core-r1] => {
    "msg": "handler already ran"
}
RUNNING HANDLER [Announce save] ***********************************************
ok: [pun-core-r1] => {
    "msg": "saving because NTP changed"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Dhyan se dekho: is simulator run mein handler line "Runs after the handler" task ke baad print hui, yaani flush ne ise yahan pehle nahi chalaya. Asli Ansible handler ko flush point par chalata. <code>flush_handlers</code> ki jagah ko iraada samjho, aur order hamesha apne output mein verify karo.</p>

<h3>Gotcha: failure handler ko skip kara sakta hai</h3>
<p>Agar baad ka koi task fail ho, to us host ke liye play ruk jaata hai aur pending handlers nahi chalte. Aur bura: change device par pehle se ho chuka hai, isliye agla run kuch badalne ko nahi paata aur handler ko dobara notify nahi karta:</p>
<pre class="out">AUTO01$ ansible-playbook hand3.yml
PLAY [Handler is skipped when the play fails] *********************************
TASK [Change NTP] *************************************************************
changed: [pun-core-r1]
TASK [Bad command] ************************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
AUTO01$ ansible-playbook hand3.yml
PLAY [Handler is skipped when the play fails] *********************************
TASK [Change NTP] *************************************************************
ok: [pun-core-r1]
TASK [Bad command] ************************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Kisi run ne <code>RUNNING HANDLER</code> print nahi kiya. NTP change ho gaya aur uska follow-up kabhi nahi hua. Asli Ansible mein iske liye <code>--force-handlers</code> option hai (reference, simulator mein nahi chalaya), par behtar aadat hai save step ko independent banana, jaise aakhir mein <code>save_when: modified</code> wala task, aur failing task ko theek karna.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Handler ka naam <code>notify</code> text se alag spelling mein likhna. Naam match nahi honge, isliye follow-up ummeed jaisa nahi hota (naye Ansible versions error report karte hain). Naam exactly copy karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Handlers play mein ek baar, saare tasks ke baad chalte hain, us order mein jis mein woh handlers list mein <i>define</i> hain, notify hone ke order mein nahi. Woh tabhi chalte hain jab notify karne wale task ne <code>changed</code> report kiya ho.</p></div>

<div class="scn"><h4>Router jo apne changes bhool gaya</h4><p>Ek playbook ne barah routers par NTP configure kiya par configuration ko aise ordinary task se save kiya jo <code>changed_when: false</code> mark tha. Power cycle ke baad NTP lines gayab thi. Save ko handler mein le jaakar, jise change tasks notify karte hain, theek hua, aur doosre run ka output saaf raha.</p></div>

<div class="iv"><p class="q">"Handler kya hai aur kab chalta hai?"</p><p>Handler ek task hai jo tabhi chalta hai jab koi doosra task use notify kare aur changed report kare. Woh play ke end mein ek baar chalta hai, chahe kai tasks ne notify kiya ho. Main handlers ko real change ke baad configuration save ya kuch restart karne ke liye use karta hoon, aur jaanta hoon ki failed play handler ko unrun chhod sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>notify</code> handler ko chalne ko kehta hai, par sirf tab jab task ne kuch badla.</li>
<li>Handler play ke end mein ek baar chalta hai, chahe kitne bhi tasks ne notify kiya.</li>
<li>Saaf doosre run mein handler dikhta hi nahi.</li>
<li><code>meta: flush_handlers</code> pending handlers jaldi chalane ke liye hai; order apne output mein check karo.</li>
<li>Failure handler ko unrun chhod sakta hai jabki change device par rehta hai.</li>
</ul></div>
`}};export{e as default};