var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the incident drill on a handed-over toolkit`,hi:`Troubleshooting workflow: handover hue toolkit par incident drill`},body:{en:`
<p><b>The idea of this chapter:</b> a colleague left and handed over the toolkit in <code>~/netkit</code> on <code>AUTO01</code>. It looks fine. In real operations it fails in four different ways: it <i>crashes loudly</i>, it <i>misses quietly</i>, it <i>reports the wrong status</i>, and it <i>does nothing without any error</i>. You will use one routine for all four. This is Lab 2.</p>

<h3>The routine</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Five steps: reproduce, read the evidence, find the line, fix one thing, prove it">
<rect x="8" y="25" width="116" height="60" rx="10" fill="#fecaca"/><text x="66" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Reproduce</text><text x="66" y="68" text-anchor="middle" class="svg-muted" font-size="10">same command</text>
<rect x="136" y="25" width="116" height="60" rx="10" fill="#fde68a"/><text x="194" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Evidence</text><text x="194" y="68" text-anchor="middle" class="svg-muted" font-size="10">compare two facts</text>
<rect x="264" y="25" width="116" height="60" rx="10" fill="#bae6fd"/><text x="322" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Find the line</text><text x="322" y="68" text-anchor="middle" class="svg-muted" font-size="10">grep -n</text>
<rect x="392" y="25" width="116" height="60" rx="10" fill="#ddd6fe"/><text x="450" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one thing</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="10">one change</text>
<rect x="520" y="25" width="112" height="60" rx="10" fill="#bbf7d0"/><text x="576" y="50" text-anchor="middle" class="svg-ink" font-size="12">5 Prove it</text><text x="576" y="68" text-anchor="middle" class="svg-muted" font-size="10">rerun + test</text>
<line x1="124" y1="55" x2="136" y2="55" stroke="#64748b" stroke-width="2"/><line x1="252" y1="55" x2="264" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="392" y2="55" stroke="#64748b" stroke-width="2"/><line x1="508" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Never skip step 5: a fix is proven by the same command that failed.</p></div>
<p>The folder holds <code>nettool.py</code>, <code>toolkit/</code>, <code>devices.csv</code> (R1, R2, R3), <code>breakit.py</code> (plays a colleague who removes the NTP server from one router) and <code>backups/R3.cfg</code>, a <b>leftover from last week</b> of only four lines. R3 is down on purpose.</p>

<h3>Problem 1: a dead router crashes the backup</h3>
<pre class="out">AUTO01$ cd netkit
AUTO01$ python3 nettool.py load devices.csv
loaded 3 routers
AUTO01$ python3 nettool.py backup
Traceback (most recent call last):
  File "nettool.py", line 125, in &lt;module&gt;
    main()
  File "nettool.py", line 122, in main
    ACTIONS[args.action](args)
  File "nettool.py", line 59, in cmd_backup
    status = collect.backup_all(found)
  File "toolkit/collect.py", line 33, in backup_all
    lines = fetch(ip)
  File "toolkit/collect.py", line 20, in fetch
    conn = connect(ip)
  File "toolkit/collect.py", line 16, in connect
    return ConnectHandler(device_type="nk_ios", host=ip, username=os.environ["NK_USER"], password=os.environ["NK_PASS"])
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span></pre>
<p>Read the last line first: a netmiko timeout. The text below it (not shown here) names <code>10.99.0.3</code>, which is R3. The frame <code>backup_all</code>, line 33, shows that the error flew straight through the loop. So look at the loop's handler:</p>
<pre class="out">AUTO01$ grep -n except toolkit/collect.py
<span class="hl">34:        except ValueError as err:</span>
AUTO01$ sed -i 's/except ValueError as err:/except Exception as err:/' toolkit/collect.py
AUTO01$ python3 nettool.py backup
R1: ok
R2: ok
R3: unreachable
ok: 2, unreachable: 1</pre>
<p><b>Cause:</b> the handler catches <code>ValueError</code>, but a dead router raises a timeout. <b>Fix:</b> catch <code>Exception</code> at the device boundary (chapter 4). <b>Proof:</b> the same command now finishes and names the failed router.</p>

<h3>Problem 2: drift misses a removed line</h3>
<pre class="out">AUTO01$ python3 nettool.py golden
golden: saved 3 config(s)
AUTO01$ python3 breakit.py 10.99.0.1
someone removed the NTP server on 10.99.0.1
AUTO01$ python3 nettool.py backup
R1: ok
R2: ok
R3: unreachable
ok: 2, unreachable: 1
AUTO01$ python3 nettool.py drift
<span class="hl">R1: no drift</span>
R2: no drift
R3: no drift</pre>
<p>The tool says nothing changed, but <code>breakit.py</code> just removed a line. Get a <b>second opinion</b> from an independent tool, the shell:</p>
<pre class="out">AUTO01$ diff golden/R1.cfg backups/R1.cfg
29d28
<span class="hl">&lt; ntp server 10.99.0.50</span>
AUTO01$ grep -n startswith toolkit/drift.py
17:    return [ln for ln in diff if ln.startswith("+") and not ln.startswith("+++")]</pre>
<p>The line is in the golden copy and gone from today's backup, so drift is real and the toolkit is blind to it. The filter keeps only <code>+</code> lines. The three-line test of chapter 8 fails on this code (<code>1 failed, 2 passed</code>). Change the filter so that it keeps both signs, rerun the test and drift:</p>
<pre class="out">AUTO01$ sed -i 's/ln.startswith("+") and not ln.startswith("+++")/ln.startswith(("+", "-")) and not ln.startswith(("+++", "---"))/' toolkit/drift.py
AUTO01$ python3 nettool.py drift
<span class="hl">R1: DRIFT (1 lines)
  -ntp server 10.99.0.50</span>
R2: no drift
R3: no drift</pre>

<h3>Problem 3: the report calls a dead router healthy</h3>
<pre class="out">AUTO01$ python3 nettool.py report
router    ip         backup      drift
--------  ---------  --------  -------
R1        10.99.0.1  ok              1
R2        10.99.0.2  ok              0
R3        10.99.0.3  <span class="hl">ok</span>              0
AUTO01$ cat status.json
{"R1": "ok", "R2": "ok", "R3": "unreachable"}
AUTO01$ cat backups/R3.cfg
hostname HYD-EDGE-R3
ip domain name nk.lab
ntp server 10.99.0.50
logging host 10.99.0.51</pre>
<p>Two records of the same fact disagree. Which one is true? <code>status.json</code> was written by tonight's run; <code>R3.cfg</code> is four lines from last week (a real config has about 35). Find where the report decides:</p>
<pre class="out">AUTO01$ grep -n 'state =' nettool.py
94:    todo, state = push.push(ip, wanted, apply=args.apply)
<span class="hl">106:        state = "ok" if new is not None else status.get(name, "never backed up")</span>
AUTO01$ sed -i 's/state = "ok" if new is not None else status.get(name, "never backed up")/state = status.get(name, "never backed up")/' nettool.py
AUTO01$ python3 nettool.py report
router    ip         backup         drift
--------  ---------  -----------  -------
R1        10.99.0.1  ok                 1
R2        10.99.0.2  ok                 0
R3        10.99.0.3  <span class="hl">unreachable</span>        0</pre>
<p><b>Cause:</b> "a backup file exists" was treated as "backup ok". <b>Fix:</b> read the state from the recorded run (chapter 7). The <code>0</code> in the drift column for R3 is still only a comparison of two stale files; a stricter version would show a dash for unreachable routers.</p>

<h3>Problem 4: the cron job that quietly does nothing</h3>
<p>Install the job the way a hurried colleague would: an absolute path to the script and no <code>cd</code>. An every-minute schedule is used for testing only.</p>
<pre class="out">AUTO01$ echo "* * * * * python3 /home/netadmin/netkit/nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1" | crontab -
AUTO01$ crontab -l
* * * * * python3 /home/netadmin/netkit/nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1
(wait one minute)
AUTO01$ cat ~/netkit.log
<span class="hl">inventory is empty - nothing to back up</span>
inventory is empty - nothing to back up
AUTO01$ ls ~
<span class="hl">inventory.db  netkit  netkit.log</span></pre>
<p>Cron ran the job, so cron is fine. The tool found <i>no routers</i>, because a brand new <code>inventory.db</code> appeared in the home folder. Cron starts in the home folder and the database path is relative (chapter 2, rule 2). The guard message from chapter 4 made the cause visible. Fix the line and remove the stray database:</p>
<pre class="out">AUTO01$ echo "* * * * * cd /home/netadmin/netkit &amp;&amp; python3 nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1" | crontab -
AUTO01$ rm ~/inventory.db
(wait one minute)
AUTO01$ tail -4 ~/netkit.log
R1: ok
R2: ok
R3: unreachable
<span class="hl">ok: 2, unreachable: 1</span></pre>
<p>Finish by putting the real schedule back (<code>0 2 * * *</code>), because the every-minute line was only a test.</p>

<table class="cmp"><tr><th>Symptom</th><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Backup crashes</td><td>Timeout traceback, handler is <code>ValueError</code></td><td>Handler too narrow</td><td><code>except Exception</code></td></tr>
<tr><td>Drift silent</td><td><code>diff</code> shows a removed line</td><td>Filter keeps only <code>+</code></td><td>Keep <code>+</code> and <code>-</code></td></tr>
<tr><td>Report green</td><td><code>status.json</code> disagrees</td><td>State taken from a file</td><td>Use the run record</td></tr>
<tr><td>Cron idle</td><td>Log says empty, stray DB in home</td><td>No <code>cd</code>, relative path</td><td><code>cd</code> first</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Fixing two things at once so you cannot tell which worked. Trusting the tool's own output as the only evidence. Leaving the every-minute test job installed. Deleting the stale <code>R3.cfg</code> and calling it solved.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The cron job runs but nothing is backed up": check the working directory and relative paths before blaming cron, the network or the script.</p></div>

<div class="scn"><h4>Four green dashboards, one blind spot</h4><p>After a hand-over, the new owner ran the toolkit, saw clean output and relaxed. A review that cross-checked the tool against <code>diff</code> and <code>status.json</code> found two of the four problems in ten minutes. The team added the removed-line test and a status check, and wrote the cron line with <code>cd</code> into the hand-over notes.</p><p><b>Lesson:</b> trust a tool only after you have tried to prove it wrong.</p></div>

<div class="iv"><p class="q">"You inherit a tool and it seems to work. What do you do?"</p><p>I run it against a failure I can cause: a dead device, a removed line, a missing file. I compare its answers with an independent check such as <code>diff</code>, read its log, fix one thing at a time, add a test for each logic bug, and rerun the exact command that failed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One routine for every incident: reproduce, read the evidence, find the line, fix one thing, prove it.</li>
<li>Crash: handler too narrow. Silent miss: one-way filter. Wrong status: state from a file. Idle cron: no <code>cd</code>.</li>
<li>Get a second opinion from an independent tool such as <code>diff</code>.</li>
<li>A stale file is not today's record.</li>
<li>Remove test jobs and stray files when you are done.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ek colleague chala gaya aur <code>AUTO01</code> par <code>~/netkit</code> mein toolkit handover kar gaya. Sab theek dikhta hai. Real operations mein yeh chaar alag tareeqon se fail hota hai: <i>zor se crash</i>, <i>chupchaap miss</i>, <i>galat status report</i>, aur <i>bina error ke kuch nahi karna</i>. Chaaron ke liye aap ek hi routine use karoge. Yahi Lab 2 hai.</p>

<h3>Routine</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Paanch steps: reproduce, evidence padho, line dhoondho, ek cheez theek karo, saabit karo">
<rect x="8" y="25" width="116" height="60" rx="10" fill="#fecaca"/><text x="66" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Reproduce</text><text x="66" y="68" text-anchor="middle" class="svg-muted" font-size="10">wahi command</text>
<rect x="136" y="25" width="116" height="60" rx="10" fill="#fde68a"/><text x="194" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Evidence</text><text x="194" y="68" text-anchor="middle" class="svg-muted" font-size="10">do facts compare</text>
<rect x="264" y="25" width="116" height="60" rx="10" fill="#bae6fd"/><text x="322" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Line dhoondho</text><text x="322" y="68" text-anchor="middle" class="svg-muted" font-size="10">grep -n</text>
<rect x="392" y="25" width="116" height="60" rx="10" fill="#ddd6fe"/><text x="450" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Ek fix</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="10">ek hi change</text>
<rect x="520" y="25" width="112" height="60" rx="10" fill="#bbf7d0"/><text x="576" y="50" text-anchor="middle" class="svg-ink" font-size="12">5 Saabit karo</text><text x="576" y="68" text-anchor="middle" class="svg-muted" font-size="10">rerun + test</text>
<line x1="124" y1="55" x2="136" y2="55" stroke="#64748b" stroke-width="2"/><line x1="252" y1="55" x2="264" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="392" y2="55" stroke="#64748b" stroke-width="2"/><line x1="508" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Step 5 kabhi skip mat karo: fix usi command se saabit hota hai jo fail hui thi.</p></div>
<p>Folder mein hain <code>nettool.py</code>, <code>toolkit/</code>, <code>devices.csv</code> (R1, R2, R3), <code>breakit.py</code> (ek aise colleague ka role jo ek router se NTP server hata deta hai) aur <code>backups/R3.cfg</code>, jo pichhle hafte ka <b>bacha hua</b> sirf chaar lines ka file hai. R3 jaan-boojhkar down hai.</p>

<h3>Problem 1: dead router backup ko crash kar deta hai</h3>
<pre class="out">AUTO01$ cd netkit
AUTO01$ python3 nettool.py load devices.csv
loaded 3 routers
AUTO01$ python3 nettool.py backup
Traceback (most recent call last):
  File "nettool.py", line 125, in &lt;module&gt;
    main()
  File "nettool.py", line 122, in main
    ACTIONS[args.action](args)
  File "nettool.py", line 59, in cmd_backup
    status = collect.backup_all(found)
  File "toolkit/collect.py", line 33, in backup_all
    lines = fetch(ip)
  File "toolkit/collect.py", line 20, in fetch
    conn = connect(ip)
  File "toolkit/collect.py", line 16, in connect
    return ConnectHandler(device_type="nk_ios", host=ip, username=os.environ["NK_USER"], password=os.environ["NK_PASS"])
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span></pre>
<p>Pehle aakhri line padho: netmiko timeout. Uske neeche ka text (yahan nahi dikhaya) <code>10.99.0.3</code> batata hai, jo R3 hai. Frame <code>backup_all</code>, line 33, dikhata hai ki error loop se seedha nikal gaya. Isliye loop ka handler dekho:</p>
<pre class="out">AUTO01$ grep -n except toolkit/collect.py
<span class="hl">34:        except ValueError as err:</span>
AUTO01$ sed -i 's/except ValueError as err:/except Exception as err:/' toolkit/collect.py
AUTO01$ python3 nettool.py backup
R1: ok
R2: ok
R3: unreachable
ok: 2, unreachable: 1</pre>
<p><b>Cause:</b> handler <code>ValueError</code> pakadta hai, par dead router timeout raise karta hai. <b>Fix:</b> device ki seema par <code>Exception</code> pakdo (chapter 4). <b>Proof:</b> wahi command ab poori hoti hai aur failed router ka naam batati hai.</p>

<h3>Problem 2: drift hatayi gayi line miss karta hai</h3>
<pre class="out">AUTO01$ python3 nettool.py golden
golden: saved 3 config(s)
AUTO01$ python3 breakit.py 10.99.0.1
someone removed the NTP server on 10.99.0.1
AUTO01$ python3 nettool.py backup
R1: ok
R2: ok
R3: unreachable
ok: 2, unreachable: 1
AUTO01$ python3 nettool.py drift
<span class="hl">R1: no drift</span>
R2: no drift
R3: no drift</pre>
<p>Tool kehta hai kuch nahi badla, par <code>breakit.py</code> ne abhi ek line hataayi. Ek swatantra tool, shell, se <b>second opinion</b> lo:</p>
<pre class="out">AUTO01$ diff golden/R1.cfg backups/R1.cfg
29d28
<span class="hl">&lt; ntp server 10.99.0.50</span>
AUTO01$ grep -n startswith toolkit/drift.py
17:    return [ln for ln in diff if ln.startswith("+") and not ln.startswith("+++")]</pre>
<p>Line golden copy mein hai aur aaj ke backup se gayab hai, yaani drift asli hai aur toolkit uske liye andha hai. Filter sirf <code>+</code> lines rakhta hai. Chapter 8 ka teen-line ka test is code par fail hota hai (<code>1 failed, 2 passed</code>). Filter ko dono sign rakhne wala banao, test aur drift dobara chalao:</p>
<pre class="out">AUTO01$ sed -i 's/ln.startswith("+") and not ln.startswith("+++")/ln.startswith(("+", "-")) and not ln.startswith(("+++", "---"))/' toolkit/drift.py
AUTO01$ python3 nettool.py drift
<span class="hl">R1: DRIFT (1 lines)
  -ntp server 10.99.0.50</span>
R2: no drift
R3: no drift</pre>

<h3>Problem 3: report dead router ko healthy kehti hai</h3>
<pre class="out">AUTO01$ python3 nettool.py report
router    ip         backup      drift
--------  ---------  --------  -------
R1        10.99.0.1  ok              1
R2        10.99.0.2  ok              0
R3        10.99.0.3  <span class="hl">ok</span>              0
AUTO01$ cat status.json
{"R1": "ok", "R2": "ok", "R3": "unreachable"}
AUTO01$ cat backups/R3.cfg
hostname HYD-EDGE-R3
ip domain name nk.lab
ntp server 10.99.0.50
logging host 10.99.0.51</pre>
<p>Ek hi fact ke do record asahmat hain. Kaunsa sach hai? <code>status.json</code> aaj raat ke run ne likha; <code>R3.cfg</code> pichhle hafte ki chaar lines hain (asli config mein lagbhag 35 hoti hain). Dhoondho report kahan decide karti hai:</p>
<pre class="out">AUTO01$ grep -n 'state =' nettool.py
94:    todo, state = push.push(ip, wanted, apply=args.apply)
<span class="hl">106:        state = "ok" if new is not None else status.get(name, "never backed up")</span>
AUTO01$ sed -i 's/state = "ok" if new is not None else status.get(name, "never backed up")/state = status.get(name, "never backed up")/' nettool.py
AUTO01$ python3 nettool.py report
router    ip         backup         drift
--------  ---------  -----------  -------
R1        10.99.0.1  ok                 1
R2        10.99.0.2  ok                 0
R3        10.99.0.3  <span class="hl">unreachable</span>        0</pre>
<p><b>Cause:</b> "backup file maujood hai" ko "backup ok" maana gaya. <b>Fix:</b> state recorded run se padho (chapter 7). R3 ke drift column ka <code>0</code> ab bhi do purani files ka compare hai; sakht version unreachable routers ke liye dash dikhata.</p>

<h3>Problem 4: cron job jo chupchaap kuch nahi karta</h3>
<p>Job waise install karo jaise jaldi mein colleague karta hai: script ka absolute path aur <code>cd</code> ke bina. Har-minute schedule sirf testing ke liye hai.</p>
<pre class="out">AUTO01$ echo "* * * * * python3 /home/netadmin/netkit/nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1" | crontab -
AUTO01$ crontab -l
* * * * * python3 /home/netadmin/netkit/nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1
(ek minute ruko)
AUTO01$ cat ~/netkit.log
<span class="hl">inventory is empty - nothing to back up</span>
inventory is empty - nothing to back up
AUTO01$ ls ~
<span class="hl">inventory.db  netkit  netkit.log</span></pre>
<p>Cron ne job chalayi, isliye cron theek hai. Tool ko <i>koi router nahi mila</i>, kyunki home folder mein bilkul nayi <code>inventory.db</code> ban gayi. Cron home folder mein start hota hai aur database path relative hai (chapter 2, rule 2). Chapter 4 ke guard message ne wajah dikha di. Line theek karo aur bhatki hui database hatao:</p>
<pre class="out">AUTO01$ echo "* * * * * cd /home/netadmin/netkit &amp;&amp; python3 nettool.py backup &gt;&gt; /home/netadmin/netkit.log 2&gt;&amp;1" | crontab -
AUTO01$ rm ~/inventory.db
(ek minute ruko)
AUTO01$ tail -4 ~/netkit.log
R1: ok
R2: ok
R3: unreachable
<span class="hl">ok: 2, unreachable: 1</span></pre>
<p>Ant mein asli schedule (<code>0 2 * * *</code>) wapas lagao, kyunki har-minute line sirf test thi.</p>

<table class="cmp"><tr><th>Symptom</th><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Backup crash</td><td>Timeout traceback, handler <code>ValueError</code></td><td>Handler bahut narrow</td><td><code>except Exception</code></td></tr>
<tr><td>Drift chup</td><td><code>diff</code> hatayi line dikhata hai</td><td>Filter sirf <code>+</code> rakhta hai</td><td><code>+</code> aur <code>-</code> dono rakho</td></tr>
<tr><td>Report green</td><td><code>status.json</code> asahmat</td><td>State file se liya</td><td>Run record use karo</td></tr>
<tr><td>Cron idle</td><td>Log khaali kehta hai, home mein bhatki DB</td><td><code>cd</code> nahi, relative path</td><td>Pehle <code>cd</code></td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Do cheezein ek saath theek karna, jisse pata nahi chalta kaunsi chali. Sirf tool ke apne output ko evidence maanna. Har-minute test job install chhod dena. Purani <code>R3.cfg</code> delete karke use solved kehna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Cron job chalti hai par kuch backup nahi hota": cron, network ya script ko dosh dene se pehle working directory aur relative paths check karo.</p></div>

<div class="scn"><h4>Chaar green dashboards, ek blind spot</h4><p>Handover ke baad naye owner ne toolkit chalaya, saaf output dekha aur befikr ho gaya. Tool ko <code>diff</code> aur <code>status.json</code> se cross-check karne wale review ne dus minute mein chaar mein se do problems pakad li. Team ne removed-line test aur status check jode, aur handover notes mein <code>cd</code> wali cron line likhi.</p><p><b>Lesson:</b> tool par bharosa tab karo jab use galat saabit karne ki koshish kar lo.</p></div>

<div class="iv"><p class="q">"Aapko ek tool mila hai jo kaam karta dikhta hai. Kya karoge?"</p><p>Use aise failure ke against chalaunga jo main khud bana sakta hoon: dead device, hatayi gayi line, missing file. Uske jawab ko <code>diff</code> jaise swatantra check se compare karunga, uska log padhunga, ek-ek cheez theek karunga, har logic bug ke liye test jodunga, aur wahi exact command dobara chalaunga jo fail hui thi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har incident ke liye ek routine: reproduce, evidence padho, line dhoondho, ek cheez theek karo, saabit karo.</li>
<li>Crash: handler narrow. Chupchaap miss: ek-tarfa filter. Galat status: state file se. Idle cron: <code>cd</code> nahi.</li>
<li><code>diff</code> jaise swatantra tool se second opinion lo.</li>
<li>Purani file aaj ka record nahi hai.</li>
<li>Kaam khatam hone par test jobs aur bhatki files hata do.</li>
</ul></div>
`}};export{e as default};