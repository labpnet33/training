var e={id:`summary`,h:{en:`Summary: logic patterns and a playbook checklist`,hi:`Summary: logic patterns aur playbook checklist`},body:{en:`
<p>You began this module with a playbook that did the same thing everywhere. You now know how to repeat work over a list, skip devices that should not change, keep what a device said, check it before a change, react to what changed, and handle failure on purpose. This chapter puts the pieces on one page: a decision table, a template for a safe change playbook and a short checklist.</p>

<h3>Which tool for which job</h3>
<table class="cmp"><tr><th>I want to...</th><th>Use</th><th>Chapter</th></tr>
<tr><td>Do the same task for a list of VLANs or servers</td><td><code>loop</code> with <code>loop_control: label</code></td><td>2</td></tr>
<tr><td>Handle a list that only some hosts have</td><td><code>| default([])</code></td><td>2</td></tr>
<tr><td>Run a task only in one site or on one device type</td><td><code>when: "'pune' in group_names"</code></td><td>3</td></tr>
<tr><td>Keep the output of a show command</td><td><code>register</code></td><td>4</td></tr>
<tr><td>Stop the play if a state is wrong</td><td><code>assert</code> with <code>fail_msg</code></td><td>5</td></tr>
<tr><td>Fail on my own rule or stop false changes</td><td><code>failed_when</code>, <code>changed_when</code></td><td>5</td></tr>
<tr><td>Save only if something changed</td><td><code>notify</code> and a handler</td><td>6</td></tr>
<tr><td>Undo a half-finished change</td><td><code>block</code>, <code>rescue</code>, <code>always</code></td><td>7</td></tr>
<tr><td>Wait for a slow state</td><td><code>until</code>, <code>retries</code>, <code>delay</code></td><td>7</td></tr>
<tr><td>Rehearse a change</td><td><code>--check --diff</code></td><td>8</td></tr></table>

<h3>A skeleton for a safe change playbook</h3>
<p>Many change playbooks have the same four-part shape. This is the structure only, written as comments around the tasks you already know:</p>
<pre class="code">---
- name: Safe change skeleton
  hosts: switches
  gather_facts: false
  tasks:
    # 1. Read and register the current state
    # 2. assert that the state is what you expect
    # 3. block: apply the change with loop and when,
    #    verify it, and rescue by undoing it
    # 4. handler: save only if something changed</pre>
<p>Each numbered comment maps to chapters 4 and 5, then 2, 3 and 7, then 6. Fill the skeleton, rehearse with <code>--check --diff</code>, run it, run it again, and expect <code>changed=0</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Safe change flow">
<rect x="10" y="65" width="115" height="80" rx="10" fill="#fde68a"/><text x="67" y="95" text-anchor="middle" class="svg-ink" font-size="12">read</text><text x="67" y="117" text-anchor="middle" class="svg-muted" font-size="11">register</text>
<rect x="140" y="65" width="115" height="80" rx="10" fill="#fca5a5"/><text x="197" y="95" text-anchor="middle" class="svg-ink" font-size="12">assert</text><text x="197" y="117" text-anchor="middle" class="svg-muted" font-size="11">gate</text>
<rect x="270" y="65" width="115" height="80" rx="10" fill="#bbf7d0"/><text x="327" y="95" text-anchor="middle" class="svg-ink" font-size="12">change</text><text x="327" y="117" text-anchor="middle" class="svg-muted" font-size="11">loop, when</text>
<rect x="400" y="65" width="115" height="80" rx="10" fill="#bae6fd"/><text x="457" y="95" text-anchor="middle" class="svg-ink" font-size="12">verify</text><text x="457" y="117" text-anchor="middle" class="svg-muted" font-size="11">rescue on fail</text>
<rect x="530" y="65" width="100" height="80" rx="10" fill="#e2e8f0"/><text x="580" y="95" text-anchor="middle" class="svg-ink" font-size="12">save</text><text x="580" y="117" text-anchor="middle" class="svg-muted" font-size="11">handler</text>
<line x1="125" y1="105" x2="140" y2="105" stroke="#64748b" stroke-width="2"/><line x1="255" y1="105" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="385" y1="105" x2="400" y2="105" stroke="#64748b" stroke-width="2"/><line x1="515" y1="105" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Read, gate, change, verify, save: every safe change follows this order.</p></div>

<h3>Reading the recap like an engineer</h3>
<ul>
<li><code>ok</code> and <code>changed=0</code> on the second run: idempotent.</li>
<li><code>skipped</code>: a <code>when</code> said no. Check it is intentional.</li>
<li><code>failed</code>: the host dropped out. Read the message before anything else.</li>
<li><code>rescued</code>: a failure was handled and rolled back.</li>
<li><code>ignored</code>: a failure was knowingly tolerated. Make sure it was a read-only task.</li>
</ul>

<h3>Checklist before a change window</h3>
<ol>
<li>Is the list in variables and the playbook looped, with a readable label?</li>
<li>Are site and device-type differences written as <code>when</code> conditions, without braces?</li>
<li>Does a pre-check register state and assert with clear fail messages?</li>
<li>Do read-only commands use <code>changed_when: false</code>?</li>
<li>Is the save step in a handler?</li>
<li>Does risky work sit in a block with a rescue?</li>
<li>Did <code>--check --diff</code> on one device show only the expected changes?</li>
<li>Does the second real run show changed=0?</li>
</ol>

<div class="warn"><p><b>Common beginner mistake.</b> Adding every tool at once. Start with a loop and a pre-check assert. Add handlers, blocks and retries only when a real need appears; more logic is more to debug.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the pairs: <code>register</code> with <code>stdout[0]</code>; <code>assert</code> with <code>that</code>; handler runs once at the end if notified; <code>rescued</code> is not <code>failed</code>; check mode skips plain <code>command</code>.</p></div>

<div class="scn"><h4>Rolling out to the third site</h4><p>The team added a Chennai office. They added one host group and one VLAN list. The playbook already looped over VLANs, skipped Pune-only settings by group, and checked uplinks before changing anything, so the new site worked on the first rehearsal.</p></div>

<div class="iv"><p class="q">"Walk me through how you would make a network change safely with Ansible."</p><p>I register the current state and assert my assumptions, rehearse with <code>--check --diff</code> on one device, then apply with loops and conditions. Risky steps sit in a block with a rescue, and the save runs in a handler. A second run must show changed=0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop for lists, when for differences, register for state, assert for gates.</li>
<li>failed_when and changed_when make Ansible report the truth.</li>
<li>Handlers save once, only after a real change.</li>
<li>Block and rescue give you a rollback; check mode gives you a rehearsal.</li>
<li>A safe change is read, gate, change, verify, save, repeat clean.</li>
</ul></div>
`,hi:`
<p>Aapne is module ko aise playbook se shuru kiya jo har jagah ek jaisa kaam karta tha. Ab aap jaante ho list par kaam repeat karna, jin devices ko nahi badalna unhe skip karna, device ne jo kaha use rakhna, change se pehle check karna, jo badla uspar react karna, aur failure ko jaan-boojhkar handle karna. Yeh chapter pieces ko ek page par rakhta hai: ek decision table, safe change playbook ka template aur chhoti checklist.</p>

<h3>Kaunsa tool kis kaam ke liye</h3>
<table class="cmp"><tr><th>Mujhe chahiye...</th><th>Use</th><th>Chapter</th></tr>
<tr><td>VLANs ya servers ki list ke liye wahi task</td><td><code>loop</code> aur <code>loop_control: label</code></td><td>2</td></tr>
<tr><td>Aisi list jo sirf kuch hosts ke paas ho</td><td><code>| default([])</code></td><td>2</td></tr>
<tr><td>Task sirf ek site ya ek device type par</td><td><code>when: "'pune' in group_names"</code></td><td>3</td></tr>
<tr><td>Show command ka output rakhna</td><td><code>register</code></td><td>4</td></tr>
<tr><td>State galat ho to play rokna</td><td><code>assert</code> aur <code>fail_msg</code></td><td>5</td></tr>
<tr><td>Apne rule par fail, ya jhoote changes rokna</td><td><code>failed_when</code>, <code>changed_when</code></td><td>5</td></tr>
<tr><td>Save sirf tab jab kuch badla</td><td><code>notify</code> aur handler</td><td>6</td></tr>
<tr><td>Adhura change undo karna</td><td><code>block</code>, <code>rescue</code>, <code>always</code></td><td>7</td></tr>
<tr><td>Dheemi state ka intezaar</td><td><code>until</code>, <code>retries</code>, <code>delay</code></td><td>7</td></tr>
<tr><td>Change ki rehearsal</td><td><code>--check --diff</code></td><td>8</td></tr></table>

<h3>Safe change playbook ka skeleton</h3>
<p>Kai change playbooks ka shape ek jaisa chaar hisson ka hota hai. Yeh sirf structure hai, jin tasks ko aap jaante ho unke aas-paas comments ke roop mein:</p>
<pre class="code">---
- name: Safe change skeleton
  hosts: switches
  gather_facts: false
  tasks:
    # 1. Read and register the current state
    # 2. assert that the state is what you expect
    # 3. block: apply the change with loop and when,
    #    verify it, and rescue by undoing it
    # 4. handler: save only if something changed</pre>
<p>Har numbered comment chapters 4 aur 5, phir 2, 3 aur 7, phir 6 se map hota hai. Skeleton bharo, <code>--check --diff</code> se rehearse karo, chalao, dobara chalao, aur <code>changed=0</code> expect karo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Safe change flow">
<rect x="10" y="65" width="115" height="80" rx="10" fill="#fde68a"/><text x="67" y="95" text-anchor="middle" class="svg-ink" font-size="12">padho</text><text x="67" y="117" text-anchor="middle" class="svg-muted" font-size="11">register</text>
<rect x="140" y="65" width="115" height="80" rx="10" fill="#fca5a5"/><text x="197" y="95" text-anchor="middle" class="svg-ink" font-size="12">assert</text><text x="197" y="117" text-anchor="middle" class="svg-muted" font-size="11">gate</text>
<rect x="270" y="65" width="115" height="80" rx="10" fill="#bbf7d0"/><text x="327" y="95" text-anchor="middle" class="svg-ink" font-size="12">change</text><text x="327" y="117" text-anchor="middle" class="svg-muted" font-size="11">loop, when</text>
<rect x="400" y="65" width="115" height="80" rx="10" fill="#bae6fd"/><text x="457" y="95" text-anchor="middle" class="svg-ink" font-size="12">verify</text><text x="457" y="117" text-anchor="middle" class="svg-muted" font-size="11">fail par rescue</text>
<rect x="530" y="65" width="100" height="80" rx="10" fill="#e2e8f0"/><text x="580" y="95" text-anchor="middle" class="svg-ink" font-size="12">save</text><text x="580" y="117" text-anchor="middle" class="svg-muted" font-size="11">handler</text>
<line x1="125" y1="105" x2="140" y2="105" stroke="#64748b" stroke-width="2"/><line x1="255" y1="105" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="385" y1="105" x2="400" y2="105" stroke="#64748b" stroke-width="2"/><line x1="515" y1="105" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Padho, gate, change, verify, save: har safe change isi order mein hota hai.</p></div>

<h3>Recap ko engineer ki tarah padhna</h3>
<ul>
<li>Doosre run mein <code>ok</code> aur <code>changed=0</code>: idempotent.</li>
<li><code>skipped</code>: <code>when</code> ne mana kiya. Check karo ki iraada tha.</li>
<li><code>failed</code>: host bahar gaya. Kuch bhi karne se pehle message padho.</li>
<li><code>rescued</code>: failure handle hua aur rollback hua.</li>
<li><code>ignored</code>: failure jaan-boojhkar sahi gaya. Pakka karo ki woh read-only task tha.</li>
</ul>

<h3>Change window se pehle checklist</h3>
<ol>
<li>List variables mein hai aur playbook looped hai, readable label ke saath?</li>
<li>Site aur device-type ke differences braces ke bina <code>when</code> conditions mein hain?</li>
<li>Pre-check state register karta hai aur clear fail messages ke saath assert karta hai?</li>
<li>Read-only commands <code>changed_when: false</code> use karte hain?</li>
<li>Save step handler mein hai?</li>
<li>Risky kaam block mein hai jiska rescue hai?</li>
<li>Ek device par <code>--check --diff</code> ne sirf ummeed wale changes dikhaye?</li>
<li>Doosre asli run mein changed=0 hai?</li>
</ol>

<div class="warn"><p><b>Common beginner mistake.</b> Saare tools ek saath jod dena. Loop aur pre-check assert se shuru karo. Handlers, blocks aur retries tabhi jodo jab asli zaroorat aaye; zyada logic matlab zyada debug.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jodi yaad rakho: <code>register</code> ke saath <code>stdout[0]</code>; <code>assert</code> ke saath <code>that</code>; handler notify hone par end mein ek baar chalta hai; <code>rescued</code> <code>failed</code> nahi hai; check mode plain <code>command</code> ko skip karta hai.</p></div>

<div class="scn"><h4>Teesre site par rollout</h4><p>Team ne Chennai office joda. Unhone ek host group aur ek VLAN list jodi. Playbook pehle se VLANs par loop karta tha, Pune-only settings group se skip karta tha, aur kuch badalne se pehle uplinks check karta tha, isliye naya site pehli rehearsal mein hi chal gaya.</p></div>

<div class="iv"><p class="q">"Ansible se network change safely kaise karte ho, samjhao."</p><p>Main current state register karta hoon aur apni assumptions assert karta hoon, ek device par <code>--check --diff</code> se rehearse karta hoon, phir loops aur conditions se apply karta hoon. Risky steps rescue wale block mein, aur save handler mein. Doosre run mein changed=0 aana chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lists ke liye loop, differences ke liye when, state ke liye register, gates ke liye assert.</li>
<li>failed_when aur changed_when Ansible se sach report karwate hain.</li>
<li>Handlers sirf asli change ke baad ek baar save karte hain.</li>
<li>Block aur rescue rollback dete hain; check mode rehearsal deta hai.</li>
<li>Safe change: padho, gate, change, verify, save, saaf repeat.</li>
</ul></div>
`}};export{e as default};