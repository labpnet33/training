var e=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(t,n,r,i)=>`<rect x="`+t+`" y="20" width="118" height="56" rx="10" fill="`+n+`"/>`+e(t+59,44,r,`svg-ink`,13)+e(t+59,63,i,`svg-muted`,10),n=(e,n)=>`<div class="dia"><svg viewBox="0 0 640 100" role="img" aria-label="Troubleshooting loop">`+t(6,`#bae6fd`,e[0],e[1])+t(132,`#ddd6fe`,e[2],e[3])+t(258,`#fde68a`,e[4],e[5])+t(384,`#bbf7d0`,e[6],e[7])+t(510,`#e2e8f0`,e[8],e[9])+`<line x1="124" y1="48" x2="132" y2="48" stroke="#64748b" stroke-width="2"/><line x1="250" y1="48" x2="258" y2="48" stroke="#64748b" stroke-width="2"/><line x1="376" y1="48" x2="384" y2="48" stroke="#64748b" stroke-width="2"/><line x1="502" y1="48" x2="510" y2="48" stroke="#64748b" stroke-width="2"/></svg><p class="cap">`+n+`</p></div>`,r=(e,t)=>`<table class="cmp"><tr>`+e.map(e=>`<th>`+e+`</th>`).join(``)+`</tr>`+t.map(e=>`<tr>`+e.map(e=>`<td>`+e+`</td>`).join(``)+`</tr>`).join(``)+`</table>`,i=`<pre class="out"><span class="hl">AUTO01$ python3 pushtool.py --help</span>
usage: pushtool.py [-h] [--baseline BASELINE] action host

Plan, push or diff a baseline on one router.

positional arguments:
  action                plan, push or diff
  host                  router name from devices.csv

options:
  -h, --help            show this help message and exit
  --baseline BASELINE   
<span class="hl">AUTO01$ grep -n "def " pushtool.py</span>
17:def clean(text):
22:def inverse(line):
26:def lookup(name):
34:def connect(host):
38:def running(conn):
42:def save(path, lines):
48:def wanted_lines(path):
52:def missing_from(conn, wanted):
57:def audit(host, status, count):
63:def show_plan(host, todo, wanted):
69:def cmd_plan(args):
76:def cmd_push(args):
103:def cmd_diff(args):
112:def main():</pre>`,a=`<pre class="out"><span class="hl">AUTO01$ cat baseline.cfg</span>
logging host 10.99.0.5
ntp server 10.99.0.50
ip ssh time-out 60
<span class="hl">AUTO01$ python3 pushtool.py plan R1</span>
<span class="hl">R1: 2 of 3 baseline lines to add</span>
  + ntp server 10.99.0.50
  + ip ssh time-out 60
<span class="hl">AUTO01$ grep -n "have" pushtool.py</span>
53:    have = " ".join(running(conn))
54:    return [ln for ln in wanted if ln not in have]
<span class="hl">AUTO01$ sed -i 's/^    have = .*/    have = running(conn)/' pushtool.py</span>
<span class="hl">AUTO01$ python3 pushtool.py plan R1</span>
<span class="hl">R1: 3 of 3 baseline lines to add</span>
  + logging host 10.99.0.5
  + ntp server 10.99.0.50
  + ip ssh time-out 60</pre>`,o=`<pre class="out"><span class="hl">AUTO01$ python3 pushtool.py push R5</span>
R5: 3 of 3 baseline lines to add
  + logging host 10.99.0.5
  + ntp server 10.99.0.50
  + ip ssh time-out 60
applied 3 lines and verified them
<span class="hl">AUTO01$ python3 pushtool.py diff R5</span>
<span class="hl">no differences</span>
<span class="hl">AUTO01$ grep -n "unified_diff" pushtool.py</span>
107:    diff = list(difflib.unified_diff(old, old, "backup", "live", lineterm=""))
<span class="hl">AUTO01$ sed -i 's/unified_diff(old, old,/unified_diff(old, now,/' pushtool.py</span>
<span class="hl">AUTO01$ python3 pushtool.py diff R5</span>
--- backup
+++ live
@@ -23,9 +23,12 @@
  no ip address
  shutdown
  negotiation auto
<span class="hl">+ip ssh time-out 60</span>
 ip ssh version 2
<span class="hl">+logging host 10.99.0.5</span>
 ip forward-protocol nd
 no ip h&#116;tp server
<span class="hl">+ntp server 10.99.0.50</span>
 control-plane
 line con 0
  logging synchronous</pre>`,s=`<pre class="out"><span class="hl">AUTO01$ python3 pushtool.py push R2 --baseline typo.cfg</span>
R2: 3 of 3 baseline lines to add
  + ntp server 10.99.0.50
  + snmp-server communty NKRO RO
  + logging host 10.99.0.51
<span class="hl">applied 3 lines and verified them</span>
<span class="hl">AUTO01$ python3 pushtool.py diff R2</span>
--- backup
+++ live
@@ -24,8 +24,10 @@
  shutdown
  negotiation auto
 ip ssh version 2
<span class="hl">+logging host 10.99.0.51</span>
 ip forward-protocol nd
 no ip h&#116;tp server
<span class="hl">+ntp server 10.99.0.50</span>
 control-plane
 line con 0
  logging synchronous
<span class="hl">AUTO01$ grep -n "if ln not in" pushtool.py</span>
54:    return [ln for ln in wanted if ln not in have]
88:    missing = [ln for ln in todo if ln not in wanted]
<span class="hl">AUTO01$ sed -i 's/if ln not in wanted\\]/if ln not in after]/' pushtool.py</span>
<span class="hl">AUTO01$ python3 pushtool.py push R2 --baseline typo.cfg</span>
R2: 1 of 3 baseline lines to add
  + snmp-server communty NKRO RO
<span class="hl">FAILED - rolling back
  missing after the push: snmp-server communty NKRO RO
config is identical to the backup</span></pre>`,c=`<pre class="out"><span class="hl">AUTO01$ cat nolookup.cfg</span>
no ip domain lookup
snmp-server communty NKRO RO
<span class="hl">AUTO01$ python3 pushtool.py push R3 --baseline nolookup.cfg</span>
R3: 2 of 2 baseline lines to add
  + no ip domain lookup
  + snmp-server communty NKRO RO
FAILED - rolling back
  missing after the push: snmp-server communty NKRO RO
<span class="hl">config differs from the backup!</span>
<span class="hl">AUTO01$ tail -1 changes.log</span>
{"time": "2026-09-29 09:01:06", "host": "R3", "status": "<span class="hl">ROLLBACK_INCOMPLETE</span>", "lines": 2}
<span class="hl">AUTO01$ grep -n 'return "no "' pushtool.py</span>
23:    return "no " + line
<span class="hl">AUTO01$ sed -i 's/^    return "no " + line$/    return line[3:] if line.startswith("no ") else "no " + line/' pushtool.py</span>
<span class="hl">AUTO01$ python3 pushtool.py push R4 --baseline nolookup.cfg</span>
R4: 2 of 2 baseline lines to add
  + no ip domain lookup
  + snmp-server communty NKRO RO
FAILED - rolling back
  missing after the push: snmp-server communty NKRO RO
<span class="hl">config is identical to the backup</span></pre>`,l={id:`troubleshooting-pushtool`,h:{en:`Troubleshooting workflow: four quiet bugs in pushtool.py (Lab 2)`,hi:`Troubleshooting workflow: pushtool.py ke chaar chhupe bugs (Lab 2)`},body:{en:`
<p><b>The idea of this chapter:</b> the worst bugs in a push tool do not crash. The script runs, prints tidy sentences and is wrong. In Lab 2 the tool <code>pushtool.py</code> on AUTO01 has four such bugs. You find each one from what it <b>does</b>, not from an error message.</p>

<h3>Analogy: the dead smoke alarm</h3>
<p>A smoke alarm with a flat battery looks perfect on the ceiling: clean, white, a green light. It only fails on the night it is needed. The checks of a push tool are smoke alarms. You test them by making them fire on purpose, with a typo you plant, not by looking at them.</p>

<h3>The workflow</h3>
`+n([`1 Reproduce`,`safe router first`,`2 Locate`,`grep -n`,`3 Smallest fix`,`one sed edit`,`4 Prove`,`run it again`,`5 Next bug`,`bugs hide bugs`],`Reproduce, locate, fix, prove, repeat. Prove means the symptom is gone, not that the code looks right.`)+`
<ol>
<li><b>Reproduce</b> with the read-only commands first (<code>plan</code>, <code>diff</code>), on a router that is meant for that bug.</li>
<li><b>Locate</b> the suspect line with <code>grep -n</code>. Match the symptom to a step of the pattern from Chapter 2.</li>
<li><b>Fix</b> with the smallest change, here one <code>sed</code> edit, and check the line with <code>grep -n</code> again.</li>
<li><b>Prove</b> by repeating the command that showed the symptom.</li>
<li><b>Repeat.</b> Bugs hide each other: a broken verify makes a broken rollback look fine.</li>
</ol>
<p>Lab 2 has five routers (R1 to R5), <code>baseline.cfg</code> (three lines), <code>typo.cfg</code> and <code>nolookup.cfg</code> (both contain the typo <code>communty</code>). The tool has three actions:</p>
`+i+`

<h3>Bug 1: the plan misses a line (router R1)</h3>
<p><b>Symptom.</b> The baseline wants <code>logging host 10.99.0.5</code>. R1 only has the longer address <code>10.99.0.51</code>, a different server. The plan should list three lines and lists two. <b>Locate.</b> The plan comes from <code>missing_from</code>; the <code>grep</code> shows it joins all lines into one string. This is the substring trap of Chapter 3. <b>Fix.</b> keep the list.</p>
`+a+`

<h3>Bug 2: the diff always says "no differences" (router R5)</h3>
<p><b>Symptom.</b> Three lines were just added to R5 and the diff says none. <b>Locate.</b> The diff command reads the live config into <code>now</code> but passes <code>old</code> twice, so it compares the backup with itself (Chapter 4: an empty diff). <b>Fix.</b> compare <code>old</code> with <code>now</code>.</p>
`+o+`

<h3>Bug 3: "verified" without verification (router R2)</h3>
<p><b>Symptom.</b> The tool reports <code>applied 3 lines and verified them</code> for <code>typo.cfg</code>, but the diff (now working) shows only two lines arrived. The typo line was rejected. <b>Locate.</b> The check in <code>cmd_push</code> asks whether each pushed line is in <code>wanted</code>. Every pushed line came from <code>wanted</code>, so the list is always empty and the rollback can never run. The question must be about <code>after</code>, the config read back (Chapter 7). <b>Fix and prove.</b> The first buggy push left two good lines behind, so the plan now lists only the typo line; the failure is reported and the rollback is clean.</p>
`+s+`

<h3>Bug 4: the rollback fails (routers R3 and R4)</h3>
<p><b>Symptom.</b> Pushing <code>nolookup.cfg</code> to R3 correctly fails, but the tool says <code>config differs from the backup!</code> and logs <code>ROLLBACK_INCOMPLETE</code>. <b>Locate.</b> The undo sends <code>no no ip domain lookup</code>, which the router rejects (Chapter 8): <code>inverse()</code> always adds <code>no</code>. <b>Fix and prove</b> on R4, which has the same start state. Fix 3 first; with the verify bug still in place the rollback would never even start and you would not see this bug.</p>
`+c+`
<p>R3 keeps the leftover line from the incomplete rollback. Run <code>python3 pushtool.py diff R3</code> and the diff shows <code>+no ip domain lookup</code>, so you know the exact line to remove by hand. That is the audit log and the backup paying for themselves.</p>

`+r([`Bug`,`Pattern step`,`Symptom`,`Cause`,`One-line fix`],[[`1`,`Plan`,`Plan lists 2 of 3`,`<code>" ".join(...)</code> substring test`,`<code>have = running(conn)</code>`],[`2`,`Evidence`,`Diff says "no differences"`,`<code>unified_diff(old, old, ...)</code>`,`<code>unified_diff(old, now, ...)</code>`],[`3`,`Verify`,`"verified" but a line missing`,`<code>if ln not in wanted</code>`,`<code>if ln not in after</code>`],[`4`,`Undo`,`<code>ROLLBACK_INCOMPLETE</code>`,`inverse always adds <code>no</code>`,`strip a leading <code>no </code>`]])+`

<div class="warn"><p><b>Common mistakes.</b> Fixing by reading code instead of reproducing the symptom. Testing a check only with good input: a safety check is proved when it fires on bad input. Fixing all four bugs at once and not knowing which one changed the result.</p></div>
<div class="exam"><p><b>Exam trap.</b> "It runs without errors" is not "it works". For a push tool, test the failure paths on purpose with a planted typo.</p></div>

<div class="scn"><h4>The compliance report that was always green</h4><p>A team had a nightly script that compared routers with a baseline and reported "0 missing" every day. Months later an audit found a router without the syslog server. The script used a substring test against one joined string, and the routers had a similar, longer address that hid the missing line.</p><p><b>Lesson:</b> test the checker with a case that must fail. The bug in the checker is more dangerous than a bug in the change.</p></div>

<div class="iv"><p class="q">"A push script reports success but the change is not there. How do you debug it?"</p><p>I reproduce with read-only commands first: a plan and a diff. I compare the script's claim with the router's real configuration, find which pattern step makes the claim (verify, diff, plan), then read that code. Typical causes are a substring test, comparing a list with itself, or a check that tests the wrong list. I fix one thing at a time and prove each fix by planting a failing input.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Quiet bugs have no traceback; find them from symptoms, with <code>grep -n</code> and read-only commands.</li>
<li>Four bugs, four steps: plan (substring), evidence (diff of the same list), verify (tests <code>wanted</code>), undo (<code>no no</code>).</li>
<li>Prove a safety check by making it fire on a planted typo.</li>
<li>Bugs hide each other; fix verify before judging the rollback.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> push tool ke sabse bure bugs crash nahi karte. Script chalti hai, saaf vakya print karti hai aur galat hoti hai. Lab 2 mein AUTO01 ke <code>pushtool.py</code> mein aise chaar bugs hain. Aap har ek ko error message se nahi, uske <b>kaam</b> se dhoondhte ho.</p>

<h3>Analogy: mara hua smoke alarm</h3>
<p>Khaali battery wala smoke alarm chhat par perfect dikhta hai: saaf, safed, hari light. Woh sirf us raat fail hota hai jab uski zaroorat ho. Push tool ke checks smoke alarm hain. Unhe dekhkar nahi, jaanbujhkar bajwakar test karte ho, apni lagayi typo se.</p>

<h3>Workflow</h3>
`+n([`1 Reproduce`,`pehle safe router`,`2 Locate`,`grep -n`,`3 Chhota fix`,`ek sed edit`,`4 Prove`,`phir chalao`,`5 Agla bug`,`bug bug ko chhupate`],`Reproduce, locate, fix, prove, repeat. Prove matlab symptom gaya, yeh nahi ki code sahi dikhta hai.`)+`
<ol>
<li>Pehle read-only commands (<code>plan</code>, <code>diff</code>) se <b>reproduce</b> karo, us router par jo us bug ke liye hai.</li>
<li>Shak wali line <code>grep -n</code> se <b>locate</b> karo. Symptom ko Chapter 2 ke pattern ke step se milao.</li>
<li>Sabse chhote badlaav se <b>fix</b> karo, yahan ek <code>sed</code> edit, aur line ko dobara <code>grep -n</code> se dekho.</li>
<li>Jis command ne symptom dikhaya use dohrakar <b>prove</b> karo.</li>
<li><b>Dohrao.</b> Bugs ek-doosre ko chhupate hain: toota hua verify toote rollback ko theek dikhata hai.</li>
</ol>
<p>Lab 2 mein paanch routers (R1 se R5), <code>baseline.cfg</code> (teen lines), <code>typo.cfg</code> aur <code>nolookup.cfg</code> (dono mein typo <code>communty</code> hai) hain. Tool ke teen actions hain:</p>
`+i+`

<h3>Bug 1: plan ek line chhod deta hai (router R1)</h3>
<p><b>Symptom.</b> Baseline <code>logging host 10.99.0.5</code> maangti hai. R1 ke paas sirf lamba address <code>10.99.0.51</code> hai, jo alag server hai. Plan ko teen lines list karni chahiye aur woh do karta hai. <b>Locate.</b> Plan <code>missing_from</code> se aata hai; <code>grep</code> dikhata hai ki woh saari lines ko ek string mein jodta hai. Yeh Chapter 3 ka substring jaal hai. <b>Fix.</b> list rakho.</p>
`+a+`

<h3>Bug 2: diff hamesha "no differences" kehta hai (router R5)</h3>
<p><b>Symptom.</b> R5 mein abhi teen lines judi aur diff kehta hai kuch nahi. <b>Locate.</b> Diff command live config <code>now</code> mein padhta hai par <code>old</code> do baar deta hai, isliye backup ko khud se compare karta hai (Chapter 4: khaali diff). <b>Fix.</b> <code>old</code> ko <code>now</code> se compare karo.</p>
`+o+`

<h3>Bug 3: verification ke bina "verified" (router R2)</h3>
<p><b>Symptom.</b> Tool <code>typo.cfg</code> ke liye <code>applied 3 lines and verified them</code> kehta hai, par diff (ab chalta hua) dikhata hai ki sirf do lines pahunchi. Typo wali line reject hui. <b>Locate.</b> <code>cmd_push</code> ka check puchta hai ki har pushed line <code>wanted</code> mein hai ya nahi. Har pushed line <code>wanted</code> se hi aayi, to list hamesha khaali hai aur rollback kabhi chal nahi sakta. Sawaal <code>after</code> ke baare mein hona chahiye, wapas padhi config (Chapter 7). <b>Fix aur prove.</b> Pehle buggy push ne do achhi lines peeche chhodi, isliye plan ab sirf typo wali line list karta hai; failure report hota hai aur rollback saaf hai.</p>
`+s+`

<h3>Bug 4: rollback fail ho jaata hai (routers R3 aur R4)</h3>
<p><b>Symptom.</b> <code>nolookup.cfg</code> R3 par push karna sahi fail hota hai, par tool <code>config differs from the backup!</code> kehta hai aur <code>ROLLBACK_INCOMPLETE</code> log karta hai. <b>Locate.</b> Undo <code>no no ip domain lookup</code> bhejta hai, jise router reject karta hai (Chapter 8): <code>inverse()</code> hamesha <code>no</code> jodta hai. R4 par <b>fix aur prove</b> karo, jiski shuruaati state wahi hai. Pehle fix 3 karo; verify bug rehte rollback shuru hi nahi hota aur aap yeh bug dekhte hi nahi.</p>
`+c+`
<p>R3 incomplete rollback ki bachi hui line rakhta hai. <code>python3 pushtool.py diff R3</code> chalao aur diff <code>+no ip domain lookup</code> dikhata hai, to aapko exact line pata hai jo haath se hatani hai. Audit log aur backup ka yahi faayda hai.</p>

`+r([`Bug`,`Pattern step`,`Symptom`,`Wajah`,`Ek-line fix`],[[`1`,`Plan`,`Plan 3 mein se 2 list karta hai`,`<code>" ".join(...)</code> substring test`,`<code>have = running(conn)</code>`],[`2`,`Evidence`,`Diff "no differences" kehta hai`,`<code>unified_diff(old, old, ...)</code>`,`<code>unified_diff(old, now, ...)</code>`],[`3`,`Verify`,`"verified" par line missing`,`<code>if ln not in wanted</code>`,`<code>if ln not in after</code>`],[`4`,`Undo`,`<code>ROLLBACK_INCOMPLETE</code>`,`inverse hamesha <code>no</code> jodta hai`,`shuru ka <code>no </code> hatao`]])+`

<div class="warn"><p><b>Common mistakes.</b> Symptom reproduce karne ki jagah code padhkar fix karna. Check ko sirf achhe input se test karna: safety check tab saabit hota hai jab woh bure input par fire kare. Chaaron bugs ek saath theek karna aur na jaanna ki kisne result badla.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Bina error ke chalta hai" matlab "kaam karta hai" nahi. Push tool ke liye failure paths ko jaanbujhkar planted typo se test karo.</p></div>

<div class="scn"><h4>Compliance report jo hamesha hari thi</h4><p>Ek team ki nightly script routers ko baseline se compare karti thi aur har din "0 missing" batati thi. Mahino baad audit mein ek router mila jisme syslog server nahi tha. Script ek joined string par substring test use karti thi, aur routers ke paas milta-julta lamba address tha jisne missing line chhupa di.</p><p><b>Lesson:</b> checker ko aise case se test karo jo fail hona hi chahiye. Checker ka bug change ke bug se zyada khatarnak hai.</p></div>

<div class="iv"><p class="q">"Push script success batati hai par change wahan nahi hai. Debug kaise karte ho?"</p><p>Main pehle read-only commands se reproduce karta hoon: ek plan aur ek diff. Script ke daave ko router ki asli configuration se milata hoon, dhoondhta hoon ki pattern ka kaun sa step (verify, diff, plan) yeh daava karta hai, phir wahi code padhta hoon. Aam wajahen: substring test, list ko khud se compare karna, ya check ka galat list test karna. Ek ek cheez theek karta hoon aur har fix ko planted failing input se saabit karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhupe bugs mein traceback nahi hota; unhe symptoms se, <code>grep -n</code> aur read-only commands se dhoondho.</li>
<li>Chaar bugs, chaar steps: plan (substring), evidence (same list ka diff), verify (<code>wanted</code> test karta hai), undo (<code>no no</code>).</li>
<li>Safety check ko planted typo par fire karwakar saabit karo.</li>
<li>Bugs ek-doosre ko chhupate hain; rollback judge karne se pehle verify theek karo.</li>
</ul></div>
`}};export{l as default};