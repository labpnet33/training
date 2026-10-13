var e={id:`handlers-tags`,h:{en:`Handlers and tags: save only when needed, run only what you choose`,hi:`Handlers aur tags: zaroorat par hi save, jo chaho wahi chalao`},body:{en:`
<p><b>One idea in this chapter:</b> a <b>handler</b> is a task that waits to be called and runs once at the end, only if something changed. A <b>tag</b> is a label that lets you run just part of a role. Together they give you "save only when needed" and "change only this part".</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Tasks notify a handler that runs once at the end">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">NTP: changed</text>
<rect x="20" y="68" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="93" text-anchor="middle" class="svg-ink" font-size="12">Syslog: changed</text>
<rect x="20" y="116" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="95" y="141" text-anchor="middle" class="svg-ink" font-size="12">Banner: ok</text>
<rect x="260" y="55" width="160" height="60" rx="10" fill="#fde68a"/><text x="340" y="82" text-anchor="middle" class="svg-ink" font-size="13">notify: save config</text><text x="340" y="100" text-anchor="middle" class="svg-muted" font-size="12">remembered</text>
<rect x="490" y="55" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="13">save config</text><text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">runs once, last</text>
<line x1="170" y1="40" x2="260" y2="75" stroke="#64748b" stroke-width="2"/><line x1="170" y1="88" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="420" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Two changed tasks, one save. If nothing had changed, no save.</p></div>

<h3>Why not simply save at the end of the task list?</h3>
<p>The old playbook ended with a <code>Save</code> task that ran on <i>every</i> run, even when nothing changed. That writes flash needlessly and makes every run look like a change. A handler fixes both problems.</p>

<h3>How a handler works</h3>
<pre class="code"><span class="c"># in tasks/main.yml: the task that may change something</span>
- name: Syslog host
  cisco.ios.ios_config:
    lines: ["logging host {{ syslog_host }}"]
  notify: save config            <span class="c"># "call the handler named save config, if I changed"</span>
  tags: logging

<span class="c"># in handlers/main.yml: the action that waits</span>
- name: save config
  cisco.ios.ios_config:
    save_when: always</pre>
<ul>
<li><code>notify</code> only fires when the task reports <b>changed</b>. A task that reports ok does not call the handler.</li>
<li>Handlers run <b>once per host</b> at the end of the play, however many tasks notified them. Three changes on one router still produce one save.</li>
<li>The handler is a normal task. Here <code>save_when: always</code> means "save now", because the handler only runs when saving is wanted.</li>
</ul>
<p>The first full run, where everything changed, ended with the handler (seen in chapter 2). Now run it a second time, when the devices already match:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml

TASK [nk_base : NTP servers] **************************************************
ok: [pun-core-r1] =&gt; (item=10.99.0.60)
ok: [blr-edge-r2] =&gt; (item=10.99.0.60)
ok: [pun-acc-sw1] =&gt; (item=10.99.0.60)

TASK [nk_base : Syslog host] **************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

TASK [nk_base : Login banner] *************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0 ...
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0 ...
pun-acc-sw1                : ok=3    changed=0    unreachable=0    failed=0 ...</pre>
<p>There is <b>no handler line at all</b>. Nothing changed, so nothing saved. A clean second run is also proof that the role is idempotent.</p>

<h3>Handler names must match exactly</h3>
<p>The text after <code>notify:</code> must equal the handler's <code>name:</code> character for character, including capital letters. A typo is not noticed until a task actually changes something and tries to call it:</p>
<pre class="out">TASK [nk_loopback : Render and push Loopback0] ********************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
<span class="hl">ERROR! The requested handler 'Save Config' was not found in either the main handlers list nor in the listening handlers list</span></pre>
<p>The tricky part: on a run where nothing changes, a wrong name hides, because nothing notifies it. Test a role with a run that really changes something. Alternatively, handlers can listen to a topic with <code>listen:</code>, so several handlers react to one notification.</p>

<h3>Tags: run part of a role</h3>
<p>A <code>tags:</code> line on a task gives it a label. Then you can select by label at run time:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --list-tags

playbook: site.yml

  play #1 (routers): Routers	TAGS: []
      TASK TAGS: [logging, loopback, ntp]

netadmin@auto01:~/netauto$ ansible-playbook site.yml --list-tasks

  play #1 (routers): Routers	TAGS: []
    tasks:
      nk_base : NTP servers	TAGS: [ntp]
      nk_base : Syslog host	TAGS: [logging]
      nk_loopback : Render and push Loopback0	TAGS: [loopback]</pre>
<p><code>--list-tags</code> and <code>--list-tasks</code> show what exists without running anything. Now run only logging, with the switches already given their own collector (chapter 4):</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --tags logging

TASK [nk_base : Syslog host] **************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
<span class="hl">changed: [pun-acc-sw1]</span>

<span class="hl">RUNNING HANDLER [nk_base : save config]</span> ***************************************
changed: [pun-acc-sw1]</pre>
<p>Only the one tagged task ran, and the handler ran only on the one host that changed. To run everything <i>except</i> some tasks use <code>--skip-tags</code>:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --skip-tags ntp,logging

TASK [nk_loopback : Render and push Loopback0] ********************************
ok: [pun-core-r1]
ok: [blr-edge-r2]</pre>

<h3>Good tag habits</h3>
<ul>
<li>One tag per feature (<code>ntp</code>, <code>logging</code>, <code>banner</code>), not per task.</li>
<li>Tags are for operators: "just redo the banner at three sites".</li>
<li>Do not rely on tags for safety. A forgotten <code>--tags</code> runs everything. Use <code>--limit</code> and <code>--check</code> for caution.</li>
</ul>
<p><b>Reference configuration (not run in the simulator):</b> to force the handlers to run in the middle of a play instead of the end, add a task <code>- ansible.builtin.meta: flush_handlers</code>. Use it when a later task needs the saved state.</p>

<div class="warn"><p><b>Common mistakes.</b> A handler name that differs by one capital letter; expecting handlers to run immediately after the notifying task (they run at the end); forgetting that a failed host skips its handlers; using tags as the only protection against a big run.</p></div>
<div class="exam"><p><b>Exam trap.</b> Handlers run once per host at the end of the play, and only if notified by a task that reported <i>changed</i>. A task that reports ok never notifies.</p></div>

<div class="scn"><h4>Eight saves per router, every night</h4><p>A nightly job ended each device play with a save task. The syslog showed eight "Configuration saved" messages per router per night, and the audit tool recorded a change every run even when nothing had changed. Switching to a notify and a handler cut it to zero saves on quiet nights and exactly one on nights when something moved.</p><p><b>Lesson:</b> make the save conditional on a change, so the audit trail reflects reality.</p></div>

<div class="iv"><p class="q">"What is a handler and when does it run?"</p><p>A handler is a task triggered by notify from another task. It runs once per host, at the end of the play, and only if a notifying task reported changed. The classic use is saving the config only when it changed. The name in notify must match the handler's name exactly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>notify calls a handler only when a task changed something.</li>
<li>Handlers run once per host at the end, so many changes mean one save.</li>
<li>A clean run has no handler lines; a wrong handler name shows up only when something changes.</li>
<li>Tags select tasks: --tags to include, --skip-tags to exclude, --list-tags to see them.</li>
<li>Tags are convenience, not a safety control.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> <b>handler</b> aisa task hai jo bulaye jaane ka intezaar karta hai aur end mein ek baar chalta hai, sirf tab jab kuch badla ho. <b>Tag</b> label hai jisse aap role ka sirf ek hissa chala sakte ho. Dono milkar "sirf zaroorat par save" aur "sirf yeh hissa badlo" dete hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Tasks handler ko notify karte hain jo end mein ek baar chalta hai">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">NTP: changed</text>
<rect x="20" y="68" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="93" text-anchor="middle" class="svg-ink" font-size="12">Syslog: changed</text>
<rect x="20" y="116" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="95" y="141" text-anchor="middle" class="svg-ink" font-size="12">Banner: ok</text>
<rect x="260" y="55" width="160" height="60" rx="10" fill="#fde68a"/><text x="340" y="82" text-anchor="middle" class="svg-ink" font-size="13">notify: save config</text><text x="340" y="100" text-anchor="middle" class="svg-muted" font-size="12">yaad rakha gaya</text>
<rect x="490" y="55" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="13">save config</text><text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">ek baar, aakhir mein</text>
<line x1="170" y1="40" x2="260" y2="75" stroke="#64748b" stroke-width="2"/><line x1="170" y1="88" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="420" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Do changed tasks, ek save. Kuch na badla hota to save nahi.</p></div>

<h3>Task list ke end mein seedha save kyun nahi?</h3>
<p>Purane playbook ka aakhri <code>Save</code> task <i>har</i> run mein chalta tha, chahe kuch na badla ho. Isse flash par bekaar write hota hai aur har run change jaisa dikhta hai. Handler dono problems theek karta hai.</p>

<h3>Handler kaise kaam karta hai</h3>
<pre class="code"><span class="c"># tasks/main.yml mein: woh task jo kuch badal sakta hai</span>
- name: Syslog host
  cisco.ios.ios_config:
    lines: ["logging host {{ syslog_host }}"]
  notify: save config            <span class="c"># "agar maine kuch badla to save config naam ka handler bulao"</span>
  tags: logging

<span class="c"># handlers/main.yml mein: woh action jo intezaar karta hai</span>
- name: save config
  cisco.ios.ios_config:
    save_when: always</pre>
<ul>
<li><code>notify</code> tabhi chalta hai jab task <b>changed</b> report kare. ok report karne wala task handler ko nahi bulata.</li>
<li>Handlers play ke end mein <b>har host par ek baar</b> chalte hain, chahe kitne bhi tasks ne notify kiya ho. Ek router par teen changes ke baad bhi ek hi save.</li>
<li>Handler normal task hai. Yahan <code>save_when: always</code> ka matlab "abhi save karo", kyunki handler tabhi chalta hai jab save chahiye.</li>
</ul>
<p>Pehla poora run, jisme sab badla, handler par khatam hua (chapter 2 mein dekha). Ab doosri baar chalao, jab devices pehle se match karte hain:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml

TASK [nk_base : NTP servers] **************************************************
ok: [pun-core-r1] =&gt; (item=10.99.0.60)
ok: [blr-edge-r2] =&gt; (item=10.99.0.60)
ok: [pun-acc-sw1] =&gt; (item=10.99.0.60)

TASK [nk_base : Syslog host] **************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

TASK [nk_base : Login banner] *************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0 ...
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0 ...
pun-acc-sw1                : ok=3    changed=0    unreachable=0    failed=0 ...</pre>
<p><b>Koi handler line hai hi nahi.</b> Kuch nahi badla, isliye kuch save nahi hua. Saaf doosra run is baat ka saboot bhi hai ki role idempotent hai.</p>

<h3>Handler ke naam bilkul match hone chahiye</h3>
<p><code>notify:</code> ke baad ka text handler ke <code>name:</code> se akshar-ba-akshar barabar hona chahiye, capital letters samet. Typo tab tak nahi pakda jaata jab tak koi task sach mein kuch badalkar use bulaye:</p>
<pre class="out">TASK [nk_loopback : Render and push Loopback0] ********************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
<span class="hl">ERROR! The requested handler 'Save Config' was not found in either the main handlers list nor in the listening handlers list</span></pre>
<p>Dikkat wali baat: jis run mein kuch nahi badalta, galat naam chhupa rehta hai, kyunki koi use notify nahi karta. Role ko aise run se test karo jisme sach mein kuch badle. Handlers <code>listen:</code> se topic par bhi sun sakte hain, taaki kai handlers ek notification par react karein.</p>

<h3>Tags: role ka hissa chalao</h3>
<p>Task par <code>tags:</code> line use label deti hai. Phir run time par label se chun sakte ho:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --list-tags

playbook: site.yml

  play #1 (routers): Routers	TAGS: []
      TASK TAGS: [logging, loopback, ntp]

netadmin@auto01:~/netauto$ ansible-playbook site.yml --list-tasks

  play #1 (routers): Routers	TAGS: []
    tasks:
      nk_base : NTP servers	TAGS: [ntp]
      nk_base : Syslog host	TAGS: [logging]
      nk_loopback : Render and push Loopback0	TAGS: [loopback]</pre>
<p><code>--list-tags</code> aur <code>--list-tasks</code> bina chalaye dikhate hain ki kya maujood hai. Ab sirf logging chalao, jab switches ko apna collector mil chuka hai (chapter 4):</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --tags logging

TASK [nk_base : Syslog host] **************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
<span class="hl">changed: [pun-acc-sw1]</span>

<span class="hl">RUNNING HANDLER [nk_base : save config]</span> ***************************************
changed: [pun-acc-sw1]</pre>
<p>Sirf ek tagged task chala, aur handler sirf us ek host par chala jisne badla. Kuch tasks ko <i>chhodkar</i> baaki sab chalane ke liye <code>--skip-tags</code>:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --skip-tags ntp,logging

TASK [nk_loopback : Render and push Loopback0] ********************************
ok: [pun-core-r1]
ok: [blr-edge-r2]</pre>

<h3>Achhi tag aadatein</h3>
<ul>
<li>Har feature ke liye ek tag (<code>ntp</code>, <code>logging</code>, <code>banner</code>), har task ke liye nahi.</li>
<li>Tags operators ke liye hain: "teen sites par sirf banner dobara karo".</li>
<li>Safety ke liye tags par nirbhar mat raho. Bhoola hua <code>--tags</code> sab chala deta hai. Savdhani ke liye <code>--limit</code> aur <code>--check</code> use karo.</li>
</ul>
<p><b>Reference configuration (not run in the simulator):</b> handlers ko play ke end ke bajaye beech mein chalane ke liye task <code>- ansible.builtin.meta: flush_handlers</code> jodo. Tab use karo jab agle task ko saved state chahiye.</p>

<div class="warn"><p><b>Common mistakes.</b> Handler ka naam ek capital letter se alag hona; umeed karna ki handlers notify karne wale task ke turant baad chalenge (woh end mein chalte hain); yeh bhoolna ki failed host apne handlers skip karta hai; bade run se bachne ke liye sirf tags par bharosa karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Handlers play ke end mein har host par ek baar chalte hain, aur sirf tab jab <i>changed</i> report karne wale task ne notify kiya ho. ok report karne wala task kabhi notify nahi karta.</p></div>

<div class="scn"><h4>Har raat router par aath saves</h4><p>Ek nightly job har device play ke end mein save task chalata tha. Syslog mein har router par har raat aath "Configuration saved" messages dikhe, aur audit tool ne har run mein change record kiya, chahe kuch na badla ho. notify aur handler par jaane se shaant raaton mein zero saves aur jis raat kuch badla us raat theek ek save ho gaya.</p><p><b>Lesson:</b> save ko change par conditional banao, taaki audit trail sach dikhaye.</p></div>

<div class="iv"><p class="q">"Handler kya hai aur kab chalta hai?"</p><p>Handler aisa task hai jo doosre task ke notify se trigger hota hai. Yeh har host par play ke end mein ek baar chalta hai, aur sirf tab jab notify karne wale task ne changed report kiya ho. Classic use: config tabhi save karna jab badla ho. notify ka naam handler ke naam se bilkul match hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>notify handler ko tabhi bulata hai jab task ne kuch badla.</li>
<li>Handlers har host par end mein ek baar chalte hain, isliye kai changes ka ek save.</li>
<li>Saaf run mein handler lines nahi hoti; galat handler naam tabhi dikhta hai jab kuch badle.</li>
<li>Tags tasks chunte hain: --tags include, --skip-tags exclude, --list-tags unhe dikhata hai.</li>
<li>Tags suvidha hain, safety control nahi.</li>
</ul></div>
`}};export{e as default};