var e={id:`logs-diff-alerts`,h:{en:`Session logs, diff against yesterday and alerting`,hi:`Session logs, kal ke saath diff aur alerting`},body:{en:`
<p><b>The idea of this chapter:</b> a collector that runs at 01:30 while you sleep must leave evidence. There are three kinds: <b>what the session said</b> (session_log), <b>what the collector decided</b> (a logger) and <b>what the network looks like today compared with yesterday</b> (backups plus diff). Together they answer the morning question: "did anything change, and did anything fail?"</p>

<h3>Analogy: flight recorder, captain's log and daily photo</h3>
<p>The <b>session log</b> is the flight recorder: every word between script and device. The <b>logger</b> is the captain's log: "retrying DEAD1". The <b>dated backup folder</b> is a daily photograph of the harbour. Put today's photo beside yesterday's and the differences jump out.</p>

<table class="cmp"><tr><th>Record</th><th>Written by</th><th>Answers</th></tr>
<tr><td><code>logs/J1.log</code></td><td>netmiko (<code>session_log</code>)</td><td>What exactly did the device say?</td></tr>
<tr><td><code>collector.log</code></td><td>your <code>logging</code> calls</td><td>What did the script decide and why?</td></tr>
<tr><td><code>backups/DATE/NAME.cfg</code></td><td>backup function</td><td>What is the configuration today?</td></tr>
<tr><td><code>alerts.txt</code> / exit code</td><td>end of the run</td><td>Does a human need to look?</td></tr></table>

<h3>session_log in detail</h3>
<pre class="code">with ConnectHandler(**R1, session_log="w.log", session_log_record_writes=True) as conn:
    conn.send_command("show clock")
print(open("w.log").read())</pre>
<pre class="out">terminal width 511
PUN-CORE-R1#
PUN-CORE-R1#terminal width 511
PUN-CORE-R1#terminal length 0
terminal length 0
PUN-CORE-R1#

PUN-CORE-R1#

PUN-CORE-R1#show clock
show clock
<span class="hl">*07:53:52.313 UTC Sun Oct 11 2026</span>
PUN-CORE-R1#

PUN-CORE-R1#exit</pre>
<p>By default the log holds what the device <i>sent back</i>. With <code>session_log_record_writes=True</code> netmiko also records what it <i>wrote</i>, which is why every command appears twice (typed, then echoed). The file mode is <code>write</code> (overwrite at every connect) unless you pass <code>session_log_file_mode="append"</code>. For a nightly job, one file per device that is overwritten each run keeps only the latest session; use append or put the date in the file name to keep history.</p>
<div class="warn"><p><b>Treat logs and backups as secrets.</b> The J1 backup in the lab contains the line <code>encrypted-password "NK@2026"; ## SECRET-DATA</code>. Real configs carry hashes, SNMP communities and keys. Keep the folder readable only by the automation user (<code>chmod 700 backups logs</code>), never commit it to git, and never mail it around.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> In the lab only <code>session_log</code> and your own loggers write records. On a real install, <code>logging.getLogger("netmiko")</code> at DEBUG level also writes netmiko's internal records, a second tool for hard problems.</p></div>

<h3>A logger for decisions</h3>
<pre class="code">import logging
logging.basicConfig(filename="collector.log", level=logging.INFO,
                    format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("collector")
log.info("connected to %s", conn.find_prompt())</pre>
<pre class="out">2026-09-29 09:00:04,600 collector INFO connected to PUN-CORE-R1#</pre>
<p>Use <code>info</code> for normal steps, <code>warning</code> for a retry, <code>error</code> for a failed device. Levels were covered in py-tools; the point here is one line per decision, with the device name in it.</p>

<h3>Diff against yesterday</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Today's backup compared with the newest older folder">
<rect x="10" y="20" width="150" height="90" rx="8" fill="#e2e8f0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">backups/2026-09-28</text><text x="85" y="62" text-anchor="middle" class="svg-muted" font-size="10">J1.cfg  E1.cfg</text><text x="85" y="80" text-anchor="middle" class="svg-muted" font-size="10">(yesterday, seeded)</text>
<rect x="240" y="20" width="150" height="90" rx="8" fill="#bae6fd"/><text x="315" y="42" text-anchor="middle" class="svg-ink" font-size="12">backups/2026-09-29</text><text x="315" y="62" text-anchor="middle" class="svg-muted" font-size="10">R1 J1 E1 N1</text><text x="315" y="80" text-anchor="middle" class="svg-muted" font-size="10">(today)</text>
<rect x="470" y="20" width="160" height="90" rx="8" fill="#bbf7d0"/><text x="550" y="42" text-anchor="middle" class="svg-ink" font-size="12">changes.py</text><text x="550" y="62" text-anchor="middle" class="svg-muted" font-size="10">strip volatile lines</text><text x="550" y="80" text-anchor="middle" class="svg-muted" font-size="10">difflib.unified_diff</text>
<line x1="160" y1="65" x2="240" y2="65" stroke="#64748b" stroke-width="2"/><line x1="390" y1="65" x2="470" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Find the newest folder older than today, compare per device, report only real differences.</p></div>
<p>Lab 1 task 7 gives you yesterday's folder with old copies of J1 and E1. The core of <code>changes.py</code>:</p>
<pre class="code">VOLATILE = re.compile(r"^(## Last changed|!Running configuration last done|Current configuration :|! Last configuration change)")


def clean(path):
    return [l for l in open(path).read().splitlines() if not VOLATILE.match(l)]


today = date.today().isoformat()
older = sorted(d for d in os.listdir("backups") if d &lt; today)
before = older[-1]                                   <span class="c"># the newest folder before today</span>
...
    diff = [d for d in difflib.unified_diff(clean(old_path), clean(new_path), lineterm="", n=0)
            if d[:1] in "+-" and d[:3] not in ("+++", "---")]</pre>
<pre class="out">AUTO01$ python3 changes.py
comparing backups/2026-09-29 with backups/2026-09-28
R1     new device, no earlier backup
<span class="hl">J1     CHANGED (3 lines)</span>
<span class="hl">       -    ntp {</span>
<span class="hl">       -        server 10.99.0.1;</span>
<span class="hl">       -    }</span>
E1     unchanged
N1     new device, no earlier backup
DEAD1  no backup today</pre>
<p>Read the report like a morning briefing. J1 lost its NTP server since yesterday (a change someone made, or the commit that did not happen in chapter 6). E1 is unchanged. R1 and N1 have no baseline yet, so there is nothing to compare, and DEAD1 has no backup today at all because collection failed. That last line is the join with chapter 7: a missing file is a failure, not "unchanged".</p>

<h3>Why strip volatile lines</h3>
<table class="cmp"><tr><th>Platform</th><th>Line that changes every run</th></tr>
<tr><td>Junos</td><td><code>## Last changed: 2026-... UTC</code> at the top</td></tr>
<tr><td>NX-OS</td><td><code>!Running configuration last done at: ...</code></td></tr>
<tr><td>IOS</td><td><code>Current configuration : 920 bytes</code>, <code>! Last configuration change at ...</code></td></tr></table>
<p>Without the filter every device is "CHANGED" every night, people stop reading the report, and the one real change hides in the noise. The filter is a small data structure you extend whenever a new noisy line appears.</p>

<h3>Alerting: who needs to know what</h3>
<ul>
<li><b>Collection failed</b> (DEAD1): alert always; include device, reason, attempts.</li>
<li><b>Unexpected change</b> (J1): alert with the diff attached; a change ticket should explain it.</li>
<li><b>New device, no baseline</b>: informational, once.</li>
</ul>
<p>In the lab the alert is the file <code>alerts.txt</code> and the exit code. In production the same hook posts to syslog, e-mail or a chat channel; the decision logic stays the same. Keep the alert short and put the details in the log.</p>
<div class="note"><p><b>Reference code (not run in the simulator).</b> To run the collector every night, a cron line such as <code>30 1 * * * cd /home/netadmin &amp;&amp; /usr/bin/python3 run_all.py &gt;&gt; run.log 2&gt;&amp;1</code> uses full paths and captures output, exactly the rules of py-tools. Prune old folders (for example keep 30 days) so the disk does not fill.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Alerting on volatile lines. Overwriting session logs so the failing night is lost. Reporting "unchanged" when the device was never collected. Keeping backups world-readable. Comparing against "any" older folder instead of the newest one.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>difflib.unified_diff</code> yields header lines starting with <code>+++</code> and <code>---</code>; filter them or you will count them as changes. <code>session_log_file_mode</code> defaults to <code>write</code>.</p></div>

<div class="scn"><h4>The change nobody ticketed</h4><p>The morning report listed one CHANGED device out of sixty: a core Junos router had lost a firewall filter on an interface. No change request existed. The session log of the previous night's push showed an engineer's script run with the default config exit, and the collector's diff caught the result within a day.</p><p><b>Lesson:</b> backup plus diff is a cheap change-detection system; it only works when noise is filtered and a missing backup counts as a failure.</p></div>

<div class="iv"><p class="q">"How do you detect unauthorised config changes with Python?"</p><p>Nightly, per device, I save the configuration to a dated folder, remove volatile lines, diff against the newest earlier copy with <code>difflib</code>, and alert with the diff when something differs. Devices that could not be collected are reported separately, and the backup folder is permission-restricted because it contains secrets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three records: <code>session_log</code> (device words), a logger (script decisions), dated backups (state).</li>
<li><code>session_log_file_mode</code> is <code>write</code> by default; use append or dated names to keep history.</li>
<li>Strip volatile lines before diffing; skip the <code>+++</code> and <code>---</code> headers.</li>
<li>"No backup today" is a failure; "no earlier backup" is informational.</li>
<li>Logs and backups contain secrets: restrict permissions and keep them out of git.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo collector 01:30 baje chalta hai jab aap soye hote ho, use saboot chhodna chahiye. Teen tarah ke hote hain: <b>session ne kya kaha</b> (session_log), <b>collector ne kya tay kiya</b> (logger) aur <b>network aaj kal ke muqable kaisa dikhta hai</b> (backups aur diff). Teeno milkar subah ka sawaal hal karte hain: "kuch badla? kuch fail hua?"</p>

<h3>Analogy: flight recorder, captain's log aur roz ki photo</h3>
<p><b>Session log</b> flight recorder hai: script aur device ke beech har shabd. <b>Logger</b> captain's log hai: "DEAD1 retry kar raha hoon". <b>Date wala backup folder</b> bandargah ki roz ki photograph hai. Aaj ki photo kal ki ke bagal mein rakho to farq ubhar aate hain.</p>

<table class="cmp"><tr><th>Record</th><th>Kaun likhta hai</th><th>Kya batata hai</th></tr>
<tr><td><code>logs/J1.log</code></td><td>netmiko (<code>session_log</code>)</td><td>Device ne theek-theek kya kaha?</td></tr>
<tr><td><code>collector.log</code></td><td>aapke <code>logging</code> calls</td><td>Script ne kya tay kiya aur kyun?</td></tr>
<tr><td><code>backups/DATE/NAME.cfg</code></td><td>backup function</td><td>Aaj configuration kya hai?</td></tr>
<tr><td><code>alerts.txt</code> / exit code</td><td>run ka ant</td><td>Kya kisi insaan ko dekhna padega?</td></tr></table>

<h3>session_log vistaar se</h3>
<pre class="code">with ConnectHandler(**R1, session_log="w.log", session_log_record_writes=True) as conn:
    conn.send_command("show clock")
print(open("w.log").read())</pre>
<pre class="out">terminal width 511
PUN-CORE-R1#
PUN-CORE-R1#terminal width 511
PUN-CORE-R1#terminal length 0
terminal length 0
PUN-CORE-R1#

PUN-CORE-R1#

PUN-CORE-R1#show clock
show clock
<span class="hl">*07:53:52.313 UTC Sun Oct 11 2026</span>
PUN-CORE-R1#

PUN-CORE-R1#exit</pre>
<p>Default mein log mein woh hota hai jo device ne <i>wapas bheja</i>. <code>session_log_record_writes=True</code> ke saath netmiko jo usne <i>likha</i> woh bhi record karta hai, isliye har command do baar dikhti hai (type hui, phir echo). File mode <code>write</code> hai (har connect par overwrite) jab tak <code>session_log_file_mode="append"</code> na do. Raat ke job ke liye har device ki ek file jo har run overwrite hoti hai sirf aakhri session rakhti hai; history rakhni ho to append ya file naam mein date use karo.</p>
<div class="warn"><p><b>Logs aur backups ko secrets samjho.</b> Lab mein J1 ke backup mein line hai <code>encrypted-password "NK@2026"; ## SECRET-DATA</code>. Asli configs mein hashes, SNMP communities aur keys hoti hain. Folder sirf automation user ke liye readable rakho (<code>chmod 700 backups logs</code>), git mein kabhi commit mat karo, aur mail mat karo.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab mein sirf <code>session_log</code> aur aapke apne loggers records likhte hain. Asli install par <code>logging.getLogger("netmiko")</code> DEBUG level par netmiko ke internal records bhi likhta hai, mushkil problems ke liye doosra tool.</p></div>

<h3>Faislon ke liye logger</h3>
<pre class="code">import logging
logging.basicConfig(filename="collector.log", level=logging.INFO,
                    format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("collector")
log.info("connected to %s", conn.find_prompt())</pre>
<pre class="out">2026-09-29 09:00:04,600 collector INFO connected to PUN-CORE-R1#</pre>
<p>Normal steps ke liye <code>info</code>, retry ke liye <code>warning</code>, failed device ke liye <code>error</code>. Levels py-tools mein the; yahan baat yeh hai ki har faisle ki ek line, aur usme device ka naam.</p>

<h3>Kal ke saath diff</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Today's backup compared with the newest older folder">
<rect x="10" y="20" width="150" height="90" rx="8" fill="#e2e8f0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">backups/2026-09-28</text><text x="85" y="62" text-anchor="middle" class="svg-muted" font-size="10">J1.cfg  E1.cfg</text><text x="85" y="80" text-anchor="middle" class="svg-muted" font-size="10">(kal, seeded)</text>
<rect x="240" y="20" width="150" height="90" rx="8" fill="#bae6fd"/><text x="315" y="42" text-anchor="middle" class="svg-ink" font-size="12">backups/2026-09-29</text><text x="315" y="62" text-anchor="middle" class="svg-muted" font-size="10">R1 J1 E1 N1</text><text x="315" y="80" text-anchor="middle" class="svg-muted" font-size="10">(aaj)</text>
<rect x="470" y="20" width="160" height="90" rx="8" fill="#bbf7d0"/><text x="550" y="42" text-anchor="middle" class="svg-ink" font-size="12">changes.py</text><text x="550" y="62" text-anchor="middle" class="svg-muted" font-size="10">volatile lines hatao</text><text x="550" y="80" text-anchor="middle" class="svg-muted" font-size="10">difflib.unified_diff</text>
<line x1="160" y1="65" x2="240" y2="65" stroke="#64748b" stroke-width="2"/><line x1="390" y1="65" x2="470" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Aaj se pehle ka sabse naya folder dhoondho, har device ke liye compare karo, sirf asli farq report karo.</p></div>
<p>Lab 1 task 7 aapko kal ka folder deta hai jisme J1 aur E1 ki purani copies hain. <code>changes.py</code> ka core:</p>
<pre class="code">VOLATILE = re.compile(r"^(## Last changed|!Running configuration last done|Current configuration :|! Last configuration change)")


def clean(path):
    return [l for l in open(path).read().splitlines() if not VOLATILE.match(l)]


today = date.today().isoformat()
older = sorted(d for d in os.listdir("backups") if d &lt; today)
before = older[-1]                                   <span class="c"># aaj se pehle ka sabse naya folder</span>
...
    diff = [d for d in difflib.unified_diff(clean(old_path), clean(new_path), lineterm="", n=0)
            if d[:1] in "+-" and d[:3] not in ("+++", "---")]</pre>
<pre class="out">AUTO01$ python3 changes.py
comparing backups/2026-09-29 with backups/2026-09-28
R1     new device, no earlier backup
<span class="hl">J1     CHANGED (3 lines)</span>
<span class="hl">       -    ntp {</span>
<span class="hl">       -        server 10.99.0.1;</span>
<span class="hl">       -    }</span>
E1     unchanged
N1     new device, no earlier backup
DEAD1  no backup today</pre>
<p>Report ko subah ki briefing ki tarah padho. J1 se kal ke baad NTP server gaya (kisi ka kiya badlaav, ya chapter 6 ka woh commit jo hua hi nahi). E1 unchanged hai. R1 aur N1 ka abhi koi baseline nahi, isliye compare karne ko kuch nahi, aur DEAD1 ka aaj ka backup hi nahi kyunki collection fail hua. Woh aakhri line chapter 7 se jodti hai: missing file failure hai, "unchanged" nahi.</p>

<h3>Volatile lines kyun hatate hain</h3>
<table class="cmp"><tr><th>Platform</th><th>Woh line jo har run badalti hai</th></tr>
<tr><td>Junos</td><td>sabse upar <code>## Last changed: 2026-... UTC</code></td></tr>
<tr><td>NX-OS</td><td><code>!Running configuration last done at: ...</code></td></tr>
<tr><td>IOS</td><td><code>Current configuration : 920 bytes</code>, <code>! Last configuration change at ...</code></td></tr></table>
<p>Filter ke bina har device har raat "CHANGED" dikhta hai, log report padhna chhod dete hain, aur ek asli badlaav shor mein chhup jaata hai. Filter chhota data structure hai jise aap tab badhate ho jab nayi shor wali line dikhe.</p>

<h3>Alerting: kisko kya pata hona chahiye</h3>
<ul>
<li><b>Collection failed</b> (DEAD1): hamesha alert; device, wajah, koshishein shamil karo.</li>
<li><b>Unexpected change</b> (J1): diff ke saath alert; change ticket usse samjhaye.</li>
<li><b>Naya device, baseline nahi</b>: informational, ek baar.</li>
</ul>
<p>Lab mein alert file <code>alerts.txt</code> aur exit code hai. Production mein wahi hook syslog, e-mail ya chat channel mein post karta hai; faisle ka logic wahi rehta hai. Alert chhota rakho aur tafseel log mein.</p>
<div class="note"><p><b>Reference code (not run in the simulator).</b> Collector ko har raat chalane ke liye cron line jaise <code>30 1 * * * cd /home/netadmin &amp;&amp; /usr/bin/python3 run_all.py &gt;&gt; run.log 2&gt;&amp;1</code> full paths use karti hai aur output pakadti hai, bilkul py-tools ke niyam. Purane folders hatao (jaise 30 din rakho) taaki disk na bhare.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Volatile lines par alert karna. Session logs overwrite karna taaki fail wali raat kho jaye. Device collect hi nahi hua tab "unchanged" report karna. Backups ko world-readable rakhna. Sabse naye folder ki jagah "koi bhi" purane folder se compare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>difflib.unified_diff</code> aise header lines deta hai jo <code>+++</code> aur <code>---</code> se shuru hoti hain; unhe filter karo warna unhe badlaav ginoge. <code>session_log_file_mode</code> ka default <code>write</code> hai.</p></div>

<div class="scn"><h4>Woh badlaav jiska ticket nahi tha</h4><p>Subah ki report mein saath mein se ek CHANGED device tha: ek core Junos router ke interface se firewall filter gayab. Koi change request nahi thi. Pichhli raat ke push ke session log mein ek engineer ki script default config exit ke saath chali dikhi, aur collector ke diff ne nateeja ek din mein pakad liya.</p><p><b>Lesson:</b> backup plus diff sasta change-detection system hai; yeh tabhi chalta hai jab shor filter ho aur missing backup failure gina jaye.</p></div>

<div class="iv"><p class="q">"Python se unauthorised config changes kaise detect karte ho?"</p><p>Roz raat, har device ke liye, configuration date wale folder mein save karta hoon, volatile lines hatata hoon, <code>difflib</code> se sabse naye purane copy ke saath diff karta hoon, aur kuch alag ho to diff ke saath alert deta hoon. Jo devices collect nahi ho paye unhe alag report karta hoon, aur backup folder permission-restricted hai kyunki usme secrets hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen records: <code>session_log</code> (device ke shabd), logger (script ke faisle), date wale backups (state).</li>
<li><code>session_log_file_mode</code> default <code>write</code> hai; history ke liye append ya date wale naam use karo.</li>
<li>Diff se pehle volatile lines hatao; <code>+++</code> aur <code>---</code> headers chhodo.</li>
<li>"No backup today" failure hai; "no earlier backup" informational hai.</li>
<li>Logs aur backups mein secrets hote hain: permissions restrict karo aur git se bahar rakho.</li>
</ul></div>
`}};export{e as default};