var e={id:`run-check-idempotency`,h:{en:`Dry run, apply, run again: reading the recap, idempotency and saving`,hi:`Dry run, apply, dobara run: recap padhna, idempotency aur save karna`},body:{en:`
<p>A good engineer never pushes a change blind. The safe rhythm for every playbook is <b>look, rehearse, apply, repeat</b>. First you look at the plan (last chapter). Now you rehearse with a dry run, apply for real, and run it again to prove that the devices match the playbook. At the end you will also learn why a router can lose your change on reload and how to prevent it.</p>

<h3>Step 1: rehearse with --check and --diff</h3>
<p><code>--check</code> asks every module "what <i>would</i> you change?" without changing anything. <code>--diff</code> adds the configuration lines that would appear. Reading it is like proofreading before pressing send.</p>
<pre class="out">AUTO01$ ansible-playbook ntp.yml --check --diff

PLAY [NTP and syslog baseline] ************************************************

TASK [NTP server] *************************************************************
--- before: running-config
+++ after: running-config
@@ -47,4 +47,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.60</span>
 end
changed: [pun-core-r1]
... (the same diff for blr-edge-r2 and pun-acc-sw1)

TASK [Syslog server] **********************************************************
...
<span class="hl">+logging host 10.99.0.60
+logging trap informational</span>
 end
changed: [pun-core-r1]
...

PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
pun-acc-sw1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>(Output shortened with dots.) In check mode <code>changed</code> means "would change". The <code>+</code> lines are exactly what will be added. Nothing was sent: the next section proves it by running for real.</p>

<h3>Step 2: apply for real</h3>
<pre class="out">AUTO01$ ansible-playbook ntp.yml

PLAY [NTP and syslog baseline] ************************************************

TASK [NTP server] *************************************************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]</span>

TASK [Syslog server] **********************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
pun-acc-sw1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Output is grouped by <b>task</b>, one line per host, in the order tasks run. Every task changed every device, which is what we expected on a first run.</p>

<h3>Reading the PLAY RECAP</h3>
<dl class="terms">
<dt>ok</dt><dd>Tasks that completed without error. It <b>includes</b> the changed ones, so ok=2 changed=2 means two tasks ran and both changed something.</dd>
<dt>changed</dt><dd>Tasks that modified the device.</dd>
<dt>unreachable</dt><dd>Hosts Ansible could not connect to.</dd>
<dt>failed</dt><dd>Tasks that failed.</dd>
<dt>skipped</dt><dd>Tasks not run because a condition was false.</dd>
<dt>rescued / ignored</dt><dd>Failures handled by a <code>rescue</code> block or by <code>ignore_errors</code>. You will use them in the Ansible logic module.</dd>
</dl>

<h3>Step 3: run again, the idempotency test</h3>
<pre class="out">AUTO01$ ansible-playbook ntp.yml

PLAY [NTP and syslog baseline] ************************************************

TASK [NTP server] *************************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

TASK [Syslog server] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=<span class="hl">0</span>    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=<span class="hl">0</span>    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
pun-acc-sw1                : ok=2    changed=<span class="hl">0</span>    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Every line says <code>ok</code> and the recap shows <code>changed=0</code>. This is <b>idempotency</b>: the playbook describes a desired state, the devices already match, so nothing is sent. A clean second run is also your <b>proof</b> that the devices match the playbook. A playbook that keeps reporting <code>changed</code> on every run is a warning sign.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Look, rehearse, apply, repeat cycle">
<rect x="15" y="40" width="130" height="70" rx="10" fill="#e2e8f0"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Look</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">--list-hosts</text>
<rect x="175" y="40" width="130" height="70" rx="10" fill="#fde68a"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Rehearse</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">--check --diff</text>
<rect x="335" y="40" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Apply</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="12">changed=n</text>
<rect x="495" y="40" width="130" height="70" rx="10" fill="#bae6fd"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Repeat</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">changed=0</text>
<line x1="145" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2"/><line x1="305" y1="75" x2="335" y2="75" stroke="#64748b" stroke-width="2"/><line x1="465" y1="75" x2="495" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">a clean fourth step is your proof of success</text>
</svg><p class="cap">The safe rhythm for every change.</p></div>

<h3>Running config is not startup config</h3>
<p>Changes made through the CLI go to the <b>running-config</b> in RAM. If the router reloads before someone saves, they are lost. Ask the startup-config what it knows:</p>
<pre class="out">AUTO01$ ansible all -m cisco.ios.ios_command -a "commands='show startup-config | include ntp server|logging host'" -o
pun-core-r1 | SUCCESS =&gt; { "changed": false, "stdout": [ <span class="hl">""</span> ], "stdout_lines": [ [ "" ] ] }
... (blr-edge-r2 and pun-acc-sw1 are also empty)</pre>
<p>Empty: the changes exist only in RAM. The fix is <code>save_when: modified</code> on a task: Ansible compares running and startup configuration and saves (the equivalent of <code>copy running-config startup-config</code>) when they differ. Edit the Syslog task so it ends like this, then run again:</p>
<pre class="code">    - name: Syslog server
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
          - logging trap informational
        <span class="hl">save_when: modified</span>      <span class="c"># same indent as lines:</span></pre>
<pre class="out">AUTO01$ ansible-playbook ntp.yml
TASK [NTP server] *************************************************************
ok: [pun-core-r1]
...
TASK [Syslog server] **********************************************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]</span>
...
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

AUTO01$ ansible-playbook ntp.yml     <span class="c"># third run: everything is saved now</span>
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
AUTO01$ ansible all -m cisco.ios.ios_command -a "commands='show startup-config | include ntp server|logging host'" -o
pun-core-r1 | SUCCESS =&gt; { "changed": false, "stdout": [ <span class="hl">"logging host 10.99.0.60\\nntp server 10.99.0.60"</span> ], ... }</pre>
<p>(Output shortened.) The task reported <code>changed</code> because the save itself is a change. After that, running and startup match and the run is clean again.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Treating <code>--check</code> as a guarantee. It is a best-effort rehearsal: modules that cannot predict an outcome may report differently in a real run. Also, a first <code>--check</code> after a partial run can show <code>changed</code> for lines that depend on earlier tasks. Use it to catch obvious mistakes, then roll out to one device first with <code>-l pun-core-r1</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> In the recap, <code>ok</code> counts changed tasks too. Also, <code>changed=0</code> on a second run is the definition of idempotent, and <code>save_when</code> belongs to <code>ios_config</code> with values such as <code>modified</code> or <code>always</code>.</p></div>

<div class="scn"><h4>The change that vanished after a power cut</h4><p>A branch lost power an hour after an automated NTP rollout. When the router came back, it had no NTP server, and clocks drifted again. The playbook had worked perfectly, but nobody had asked it to save. The team added <code>save_when: modified</code>, re-ran, and used a startup-config check as part of the standard verification.</p><p><b>Lesson:</b> "changed" in the recap describes the running-config. Decide deliberately whether and when to save.</p></div>

<div class="iv"><p class="q">"What does idempotent mean and how do you prove a playbook is idempotent?"</p><p>Running it repeatedly leaves the same state; the second run makes no changes. I prove it by running the playbook twice and checking that the second recap shows <code>changed=0</code> for every host. For network modules this works because they compare the existing configuration and only send missing lines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Safe rhythm: look (<code>--list-hosts</code>), rehearse (<code>--check --diff</code>), apply, repeat.</li>
<li>The PLAY RECAP counts ok, changed, unreachable, failed, skipped, rescued, ignored per host.</li>
<li>A clean second run with <code>changed=0</code> proves idempotency and that devices match the playbook.</li>
<li>Running-config changes are lost on reload; use <code>save_when: modified</code> to save.</li>
<li>Check mode is a best-effort rehearsal, not a guarantee.</li>
</ul></div>
`,hi:`
<p>Achha engineer kabhi change ko andhe mein push nahi karta. Har playbook ke liye safe rhythm hai <b>dekho, rehearse karo, apply karo, repeat karo</b>. Pehle aap plan dekhte ho (pichhla chapter). Ab aap dry run se rehearse karoge, asli mein apply karoge, aur dobara chalakar sabit karoge ki devices playbook se match karte hain. Aakhir mein yeh bhi seekhoge ki router reload par aapka change kyun kho sakta hai aur use kaise roka jaaye.</p>

<h3>Step 1: --check aur --diff se rehearse</h3>
<p><code>--check</code> har module se poochta hai "tum kya badloge?" bina kuch badle. <code>--diff</code> woh configuration lines jodta hai jo aayengi. Ise padhna send dabane se pehle proofreading jaisa hai.</p>
<pre class="out">AUTO01$ ansible-playbook ntp.yml --check --diff

PLAY [NTP and syslog baseline] ************************************************

TASK [NTP server] *************************************************************
--- before: running-config
+++ after: running-config
@@ -47,4 +47,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.60</span>
 end
changed: [pun-core-r1]
... (blr-edge-r2 aur pun-acc-sw1 ke liye wahi diff)

TASK [Syslog server] **********************************************************
...
<span class="hl">+logging host 10.99.0.60
+logging trap informational</span>
 end
changed: [pun-core-r1]
...

PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
pun-acc-sw1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>(Output dots se chhota kiya gaya.) Check mode mein <code>changed</code> ka matlab "badlega". <code>+</code> lines bilkul wahi hain jo add hongi. Kuch bheja nahi gaya: agla section asli run karke ise sabit karta hai.</p>

<h3>Step 2: asli mein apply karo</h3>
<pre class="out">AUTO01$ ansible-playbook ntp.yml

PLAY [NTP and syslog baseline] ************************************************

TASK [NTP server] *************************************************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]</span>

TASK [Syslog server] **********************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
pun-acc-sw1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Output <b>task</b> ke hisaab se group hota hai, har host ki ek line, usi order mein jisme tasks chalte hain. Har task ne har device badla, jo pehle run par expected tha.</p>

<h3>PLAY RECAP padhna</h3>
<dl class="terms">
<dt>ok</dt><dd>Jo tasks bina error ke poore hue. Isme changed wale <b>bhi</b> shamil hain, to ok=2 changed=2 matlab do tasks chale aur dono ne kuch badla.</dd>
<dt>changed</dt><dd>Jin tasks ne device badla.</dd>
<dt>unreachable</dt><dd>Jin hosts se Ansible connect nahi ho paya.</dd>
<dt>failed</dt><dd>Jo tasks fail hue.</dd>
<dt>skipped</dt><dd>Jo tasks condition false hone se nahi chale.</dd>
<dt>rescued / ignored</dt><dd>Jin failures ko <code>rescue</code> block ya <code>ignore_errors</code> ne sambhala. Inhe aap Ansible logic module mein use karoge.</dd>
</dl>

<h3>Step 3: dobara chalao, idempotency test</h3>
<pre class="out">AUTO01$ ansible-playbook ntp.yml

PLAY [NTP and syslog baseline] ************************************************

TASK [NTP server] *************************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

TASK [Syslog server] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
ok: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=<span class="hl">0</span>    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=<span class="hl">0</span>    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
pun-acc-sw1                : ok=2    changed=<span class="hl">0</span>    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Har line <code>ok</code> kehti hai aur recap <code>changed=0</code> dikhata hai. Yeh <b>idempotency</b> hai: playbook desired state describe karta hai, devices pehle se match karte hain, isliye kuch nahi bheja jaata. Saaf doosra run aapka <b>sabut</b> bhi hai ki devices playbook se match karte hain. Jo playbook har run par <code>changed</code> batata rahe woh warning sign hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Dekho, rehearse, apply, repeat cycle">
<rect x="15" y="40" width="130" height="70" rx="10" fill="#e2e8f0"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Dekho</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">--list-hosts</text>
<rect x="175" y="40" width="130" height="70" rx="10" fill="#fde68a"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Rehearse</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">--check --diff</text>
<rect x="335" y="40" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Apply</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="12">changed=n</text>
<rect x="495" y="40" width="130" height="70" rx="10" fill="#bae6fd"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Repeat</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">changed=0</text>
<line x1="145" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2"/><line x1="305" y1="75" x2="335" y2="75" stroke="#64748b" stroke-width="2"/><line x1="465" y1="75" x2="495" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">saaf chautha step aapki success ka sabut hai</text>
</svg><p class="cap">Har change ke liye safe rhythm.</p></div>

<h3>Running config startup config nahi hai</h3>
<p>CLI se kiye changes RAM mein <b>running-config</b> mein jaate hain. Kisi ke save karne se pehle router reload ho jaye to woh kho jaate hain. Startup-config se poocho usse kya pata hai:</p>
<pre class="out">AUTO01$ ansible all -m cisco.ios.ios_command -a "commands='show startup-config | include ntp server|logging host'" -o
pun-core-r1 | SUCCESS =&gt; { "changed": false, "stdout": [ <span class="hl">""</span> ], "stdout_lines": [ [ "" ] ] }
... (blr-edge-r2 aur pun-acc-sw1 bhi khaali hain)</pre>
<p>Khaali: changes sirf RAM mein hain. Fix hai task par <code>save_when: modified</code>: Ansible running aur startup configuration compare karta hai aur alag hone par save karta hai (<code>copy running-config startup-config</code> ke barabar). Syslog task ko is tarah edit karo, phir dobara chalao:</p>
<pre class="code">    - name: Syslog server
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
          - logging trap informational
        <span class="hl">save_when: modified</span>      <span class="c"># lines: ke same indent par</span></pre>
<pre class="out">AUTO01$ ansible-playbook ntp.yml
TASK [NTP server] *************************************************************
ok: [pun-core-r1]
...
TASK [Syslog server] **********************************************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]</span>
...
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

AUTO01$ ansible-playbook ntp.yml     <span class="c"># teesra run: ab sab save ho chuka hai</span>
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
AUTO01$ ansible all -m cisco.ios.ios_command -a "commands='show startup-config | include ntp server|logging host'" -o
pun-core-r1 | SUCCESS =&gt; { "changed": false, "stdout": [ <span class="hl">"logging host 10.99.0.60\\nntp server 10.99.0.60"</span> ], ... }</pre>
<p>(Output chhota kiya gaya.) Task ne <code>changed</code> report kiya kyunki save khud ek change hai. Uske baad running aur startup match karte hain aur run dobara saaf hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> <code>--check</code> ko guarantee samajhna. Yeh best-effort rehearsal hai: jo modules outcome predict nahi kar sakte woh asli run mein alag report kar sakte hain. Aur partial run ke baad pehla <code>--check</code> un lines ke liye <code>changed</code> dikha sakta hai jo pichhle tasks par depend karti hain. Ise bade mistakes pakadne ke liye use karo, phir pehle ek device par <code>-l pun-core-r1</code> se roll out karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Recap mein <code>ok</code> changed tasks ko bhi ginta hai. Aur doosre run par <code>changed=0</code> idempotent ki definition hai, aur <code>save_when</code> <code>ios_config</code> ka option hai jiski values <code>modified</code> ya <code>always</code> hain.</p></div>

<div class="scn"><h4>Power cut ke baad gayab hua change</h4><p>Ek branch ki bijli automated NTP rollout ke ek ghante baad gayi. Router wapas aaya to uske paas NTP server nahi tha, aur clocks phir drift hone lage. Playbook bilkul theek chala tha, par kisi ne use save karne ko nahi kaha tha. Team ne <code>save_when: modified</code> joda, dobara chalaya, aur startup-config check ko standard verification ka hissa bana liya.</p><p><b>Lesson:</b> recap ka "changed" running-config ke baare mein hai. Soch samajh kar tay karo ki save kab aur kaise karna hai.</p></div>

<div class="iv"><p class="q">"Idempotent ka kya matlab hai aur playbook idempotent hai yeh kaise sabit karoge?"</p><p>Baar-baar chalane par same state rehti hai; doosra run kuch nahi badalta. Main playbook do baar chalakar sabit karta hoon aur check karta hoon ki doosre recap mein har host ke liye <code>changed=0</code> hai. Network modules ke liye yeh isliye chalta hai kyunki woh maujooda configuration compare karte hain aur sirf missing lines bhejte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Safe rhythm: dekho (<code>--list-hosts</code>), rehearse (<code>--check --diff</code>), apply, repeat.</li>
<li>PLAY RECAP har host ke ok, changed, unreachable, failed, skipped, rescued, ignored ginta hai.</li>
<li><code>changed=0</code> wala saaf doosra run idempotency aur devices ke playbook se match karne ka sabut hai.</li>
<li>Running-config ke changes reload par kho jaate hain; save ke liye <code>save_when: modified</code>.</li>
<li>Check mode best-effort rehearsal hai, guarantee nahi.</li>
</ul></div>
`}};export{e as default};