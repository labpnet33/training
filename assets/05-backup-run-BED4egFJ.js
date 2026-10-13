var e={id:`backup-run`,h:{en:`The backup task: write_file, changed and the exit code`,hi:`Backup task: write_file, changed aur exit code`},body:{en:`
<p>Now we build the real thing: <code>nrbackup.py</code>, the Nornir version of the <code>netbackup.py</code> from <code>py-tools</code>. This chapter is Lab 1, steps 3 and 4. It has two files: <code>nrtasks.py</code> with the task that backs up one device, and <code>nrbackup.py</code> with the run, the report and the exit code. Keeping the task in its own module is a habit worth forming: you can import it from tests and from other scripts.</p>

<h3>An analogy: the archive clerk</h3>
<p>An archive clerk takes each department's file, compares it with the copy on the shelf and says "new", "changed" or "same as before". Nobody wants a clerk who files a new copy of an unchanged page every night. The <code>changed</code> flag of a Nornir <code>Result</code> is that remark.</p>

<h3>The task</h3>
[[CODE lab/c/nrtasks.py | hl=task.host["backup_cmd"];write_file;changed=]]
<p>One function, one device. It reads the host's own command from the inventory, runs it with <code>enable=True</code>, and passes the text to <code>write_file</code> from <code>nornir_utils</code>. <code>write_file</code> compares the new content with the file on disk and sets <code>changed</code> to true only when they differ; it also builds a <code>diff</code>. The task then returns its own <code>Result</code> with the line count as the result and the same <code>changed</code> flag, so the report can tell new content from old.</p>

<h3>The run</h3>
<pre class="code">nr = InitNornir(config_file="config.yaml")
folder = "backups/%s" % datetime.now().strftime("%Y-%m-%d")
os.makedirs(folder, exist_ok=True)

<span class="hl">result = nr.run(task=backup, folder=folder)</span>
for name, multi in result.items():
<span class="hl">    if multi.failed:</span>
        print("%-3s FAILED" % name)
    else:
        print("%-3s %-9s %s -&gt; %s/%s.cfg" % (name, "changed" if multi.changed else "unchanged", multi[0].result, folder, name))
<span class="hl">nr.close_connections()</span></pre>
<pre class="out">AUTO01$ python3 nrbackup.py
r1  changed   57 lines -&gt; backups/2026-09-29/r1.cfg
j1  changed   30 lines -&gt; backups/2026-09-29/j1.cfg
e1  changed   20 lines -&gt; backups/2026-09-29/e1.cfg
n1  changed   49 lines -&gt; backups/2026-09-29/n1.cfg
<span class="hl">r3  FAILED</span>
AUTO01$ ls -R backups
backups:
2026-09-29

backups/2026-09-29:
e1.cfg  j1.cfg  n1.cfg  r1.cfg</pre>
<p>The script makes a folder per day, runs the task on every host, and prints one line per host. A failed host gets <code>FAILED</code> and the loop goes on. Four files are on disk; <code>r3</code> is simply not reachable. Run it again and the same files are rewritten, so what should the report say?</p>

<h3>Second run: changed or not?</h3>
<p>Exit codes matter to cron: a job that always ends with 0 is a job nobody reads. The lab adds three lines at the end of the script: count the failed hosts, print a summary and exit with 1 when there are any.</p>
<pre class="code">
failed = sorted(result.failed_hosts)
print("%d saved, %d failed" % (len(result) - len(failed), len(failed)))
<span class="hl">sys.exit(1 if failed else 0)</span></pre>
<pre class="out"><span class="hl">AUTO01$ python3 nrbackup.py; echo "exit code: $?"</span>
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
j1  unchanged 30 lines -&gt; backups/2026-09-29/j1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
<span class="hl">n1  changed   49 lines -&gt; backups/2026-09-29/n1.cfg</span>
r3  FAILED
4 saved, 1 failed
<span class="hl">exit code: 1</span></pre>
<p>Three hosts say <code>unchanged</code>, which is what you want. But <code>n1</code> says <code>changed</code> on every run. The reason is inside the file.</p>
<pre class="out">AUTO01$ head -4 backups/*/n1.cfg

!Command: show running-config
<span class="hl">!Running configuration last done at: Sun, 11 Oct 2026 15:22:30 GMT</span></pre>
<p>NX-OS writes the time of the last "running configuration" into the first lines. The text changes every minute even if no setting changed. A backup that always differs is useless for change tracking, because the real change hides in the noise.</p>

<h3>Remove what changes by itself</h3>
<p>Add a small <code>clean()</code> to <code>nrtasks.py</code> and call it before writing.</p>
<pre class="code"><span class="hl">NOISE = ("!Running configuration last done at", "!Time:", "## Last changed:")</span>


def clean(text: str) -&gt; str:
    """Drop the lines a device rewrites on every run, so a diff only shows real changes."""
<span class="hl">    return "\\n".join(line for line in text.splitlines() if not line.startswith(NOISE)) + "\\n"</span></pre>
<pre class="out">AUTO01$ python3 nrbackup.py
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
j1  changed   29 lines -&gt; backups/2026-09-29/j1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
n1  changed   48 lines -&gt; backups/2026-09-29/n1.cfg
r3  FAILED
4 saved, 1 failed
AUTO01$ python3 nrbackup.py
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
j1  unchanged 29 lines -&gt; backups/2026-09-29/j1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
<span class="hl">n1  unchanged 48 lines -&gt; backups/2026-09-29/n1.cfg</span>
r3  FAILED
4 saved, 1 failed</pre>
<p>The first run after the change shows <code>changed</code> for <code>j1</code> and <code>n1</code>, because the files on disk still hold the old header lines. The second run is quiet everywhere. Now a <code>changed</code> in the report means a real change.</p>

<div class="eg"><p><b>Worked example: what did change on Tuesday?</b> With clean backups in one folder per day, <code>diff -r backups/2026-09-28 backups/2026-09-29</code> lists only real differences. A ticket that says "OSPF broke on Tuesday" can start from the file that changed.</p></div>

<div class="warn"><p><b>Backups contain secrets.</b> Look at the Junos file: it has <code>encrypted-password</code> lines for the root and netops users. Treat the backup folder like a password file: owner-only permissions, never in a public repository, never mailed around. The lab prints them for learning; <code>py-secrets</code> rules apply to the files you create as well.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>changed</code> is set by the task, not by Nornir. A task that returns no explicit <code>Result</code> reports <code>changed=False</code>. In your own tasks, copy <code>changed</code> from <code>write_file</code> or compute it yourself.</p></div>
<p><i>In the lab vs on real gear.</i> The folder name uses the lab computer's date, and the NX-OS header shows the device's own clock, so the two dates differ here. On real systems they agree.</p>

<div class="scn"><h4>A change nobody saw</h4><p>A team kept daily backups but saw "changed" for the NX-OS leaf every day, so they stopped reading the report. In March an engineer added a static route by hand and the report said "changed" as usual. After the header lines were removed, the next report showed one real change on one leaf and the route was found in minutes.</p><p><b>Lesson:</b> remove the noise, or real signals are lost in it.</p></div>

<div class="iv"><p class="q">"How do you make a Nornir backup script usable from cron?"</p><p>The task writes only when the content changed and returns <code>changed</code>. The script prints one line per host, a summary of saved and failed hosts, and exits non-zero when any host failed. Lines that change by themselves, like timestamps, are removed before writing so that <code>changed</code> is trustworthy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Put the one-device task in its own module and the run in the script.</li>
<li><code>write_file</code> returns <code>changed</code> and a <code>diff</code>; copy <code>changed</code> into your own <code>Result</code>.</li>
<li>Exit non-zero when <code>result.failed_hosts</code> is not empty.</li>
<li>Strip timestamps and similar lines so that <code>changed</code> means a real change.</li>
<li>Backups hold secrets: protect the folder.</li>
</ul></div>
`,hi:`
<p>Ab asli cheez banate hain: <code>nrbackup.py</code>, <code>py-tools</code> ki <code>netbackup.py</code> ka Nornir version. Yeh chapter Lab 1 ke steps 3 aur 4 hain. Do files hain: <code>nrtasks.py</code>, jisme ek device ka backup lene wala task hai, aur <code>nrbackup.py</code>, jisme run, report aur exit code hai. Task ko apne module mein rakhna achhi aadat hai: use tests aur dusri scripts se import kar sakte ho.</p>

<h3>Ek analogy: archive clerk</h3>
<p>Archive clerk har department ki file leta hai, shelf par rakhi copy se milata hai aur kehta hai "naya", "badla hua" ya "pehle jaisa". Koi aisa clerk nahi chahta jo unchanged page ki nayi copy roz raat ko file kare. Nornir <code>Result</code> ka <code>changed</code> flag wahi remark hai.</p>

<h3>Task</h3>
[[CODE lab/c/nrtasks.py | hl=task.host["backup_cmd"];write_file;changed=]]
<p>Ek function, ek device. Yeh host ki apni command inventory se padhta hai, <code>enable=True</code> ke saath chalata hai, aur text ko <code>nornir_utils</code> ke <code>write_file</code> ko deta hai. <code>write_file</code> naye content ko disk ki file se milata hai aur <code>changed</code> tabhi true karta hai jab dono alag hon; woh <code>diff</code> bhi banata hai. Phir task apna <code>Result</code> return karta hai, result mein line count aur wahi <code>changed</code> flag ke saath, taaki report naye content aur purane content mein farq bata sake.</p>

<h3>Run</h3>
<pre class="code">nr = InitNornir(config_file="config.yaml")
folder = "backups/%s" % datetime.now().strftime("%Y-%m-%d")
os.makedirs(folder, exist_ok=True)

<span class="hl">result = nr.run(task=backup, folder=folder)</span>
for name, multi in result.items():
<span class="hl">    if multi.failed:</span>
        print("%-3s FAILED" % name)
    else:
        print("%-3s %-9s %s -&gt; %s/%s.cfg" % (name, "changed" if multi.changed else "unchanged", multi[0].result, folder, name))
<span class="hl">nr.close_connections()</span></pre>
<pre class="out">AUTO01$ python3 nrbackup.py
r1  changed   57 lines -&gt; backups/2026-09-29/r1.cfg
j1  changed   30 lines -&gt; backups/2026-09-29/j1.cfg
e1  changed   20 lines -&gt; backups/2026-09-29/e1.cfg
n1  changed   49 lines -&gt; backups/2026-09-29/n1.cfg
<span class="hl">r3  FAILED</span>
AUTO01$ ls -R backups
backups:
2026-09-29

backups/2026-09-29:
e1.cfg  j1.cfg  n1.cfg  r1.cfg</pre>
<p>Script har din ka folder banati hai, har host par task chalati hai, aur har host ki ek line print karti hai. Failed host ko <code>FAILED</code> milta hai aur loop chalta rehta hai. Chaar files disk par hain; <code>r3</code> bas reachable nahi hai. Dobara chalao to wahi files phir likhi jaati hain, to report kya kahe?</p>

<h3>Doosri run: changed ya nahi?</h3>
<p>Exit codes cron ke liye matter karte hain: jo job hamesha 0 par khatam ho use koi nahi padhta. Lab script ke ant mein teen lines jodta hai: failed hosts gino, summary print karo aur koi bhi ho to 1 se exit karo.</p>
<pre class="code">
failed = sorted(result.failed_hosts)
print("%d saved, %d failed" % (len(result) - len(failed), len(failed)))
<span class="hl">sys.exit(1 if failed else 0)</span></pre>
<pre class="out"><span class="hl">AUTO01$ python3 nrbackup.py; echo "exit code: $?"</span>
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
j1  unchanged 30 lines -&gt; backups/2026-09-29/j1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
<span class="hl">n1  changed   49 lines -&gt; backups/2026-09-29/n1.cfg</span>
r3  FAILED
4 saved, 1 failed
<span class="hl">exit code: 1</span></pre>
<p>Teen hosts <code>unchanged</code> kehte hain, jo aap chahte ho. Par <code>n1</code> har run mein <code>changed</code> kehta hai. Wajah file ke andar hai.</p>
<pre class="out">AUTO01$ head -4 backups/*/n1.cfg

!Command: show running-config
<span class="hl">!Running configuration last done at: Sun, 11 Oct 2026 15:22:30 GMT</span></pre>
<p>NX-OS pehli lines mein "running configuration" ka last time likhta hai. Koi setting na badle tab bhi text har minute badalta hai. Jo backup hamesha alag dikhe woh change tracking ke liye bekaar hai, kyunki asli change shor mein chhup jaata hai.</p>

<h3>Jo khud badalta hai use hatao</h3>
<p><code>nrtasks.py</code> mein chhota <code>clean()</code> jodo aur likhne se pehle use bulao.</p>
<pre class="code"><span class="hl">NOISE = ("!Running configuration last done at", "!Time:", "## Last changed:")</span>


def clean(text: str) -&gt; str:
    """Drop the lines a device rewrites on every run, so a diff only shows real changes."""
<span class="hl">    return "\\n".join(line for line in text.splitlines() if not line.startswith(NOISE)) + "\\n"</span></pre>
<pre class="out">AUTO01$ python3 nrbackup.py
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
j1  changed   29 lines -&gt; backups/2026-09-29/j1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
n1  changed   48 lines -&gt; backups/2026-09-29/n1.cfg
r3  FAILED
4 saved, 1 failed
AUTO01$ python3 nrbackup.py
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
j1  unchanged 29 lines -&gt; backups/2026-09-29/j1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
<span class="hl">n1  unchanged 48 lines -&gt; backups/2026-09-29/n1.cfg</span>
r3  FAILED
4 saved, 1 failed</pre>
<p>Badlav ke baad pehli run mein <code>j1</code> aur <code>n1</code> <code>changed</code> dikhate hain, kyunki disk par purani files mein abhi purani header lines hain. Doosri run har jagah shant hai. Ab report ka <code>changed</code> asli change hai.</p>

<div class="eg"><p><b>Worked example: Mangalvaar ko kya badla?</b> Din ke hisaab se saaf backups ek folder mein hon to <code>diff -r backups/2026-09-28 backups/2026-09-29</code> sirf asli farq dikhata hai. "OSPF Tuesday ko toota" wala ticket us file se shuru ho sakta hai jo badli.</p></div>

<div class="warn"><p><b>Backups mein secrets hote hain.</b> Junos file dekho: usme root aur netops users ke <code>encrypted-password</code> lines hain. Backup folder ko password file jaisa maano: sirf owner ki permissions, public repository mein kabhi nahi, mail mein kabhi nahi. Lab sikhane ke liye unhe print karta hai; <code>py-secrets</code> ke rules aapki banayi files par bhi lagte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>changed</code> task set karta hai, Nornir nahi. Jo task explicit <code>Result</code> return nahi karta woh <code>changed=False</code> report karta hai. Apne tasks mein <code>changed</code> ko <code>write_file</code> se copy karo ya khud compute karo.</p></div>
<p><i>Lab mein vs real gear par.</i> Folder ka naam lab computer ki date se banta hai, aur NX-OS header device ki apni clock dikhata hai, isliye yahan dono dates alag hain. Real systems par dono milti hain.</p>

<div class="scn"><h4>Woh change jo kisi ne nahi dekha</h4><p>Ek team daily backups rakhti thi par NX-OS leaf ke liye roz "changed" dikhta tha, isliye unhone report padhna chhod diya. March mein ek engineer ne haath se static route jodi aur report ne hamesha ki tarah "changed" kaha. Header lines hatane ke baad agli report mein ek leaf par ek asli change dikha aur route minutes mein mil gayi.</p><p><b>Lesson:</b> shor hatao, warna asli signal kho jaate hain.</p></div>

<div class="iv"><p class="q">"Nornir backup script ko cron ke layak kaise banate ho?"</p><p>Task tabhi likhta hai jab content badla ho aur <code>changed</code> return karta hai. Script har host ki ek line, saved aur failed hosts ki summary print karti hai, aur koi host fail ho to non-zero exit karti hai. Jo lines khud badalti hain, jaise timestamps, likhne se pehle hata deta hoon taaki <code>changed</code> bharosemand rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek-device task ko apne module mein rakho aur run ko script mein.</li>
<li><code>write_file</code> <code>changed</code> aur <code>diff</code> deta hai; <code>changed</code> ko apne <code>Result</code> mein copy karo.</li>
<li><code>result.failed_hosts</code> khaali na ho to non-zero exit karo.</li>
<li>Timestamps jaisi lines hatao taaki <code>changed</code> ka matlab asli change ho.</li>
<li>Backups mein secrets hote hain: folder ko protect karo.</li>
</ul></div>
`}};export{e as default};