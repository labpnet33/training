var e={id:`golden-drift`,h:{en:`Golden configuration and drift detection with difflib`,hi:`Golden configuration aur difflib se drift detection`},body:{en:`
<p><b>The idea of this chapter:</b> a backup tells you what a router <i>is</i>. A <b>golden configuration</b> says what it <i>should be</i>: the last state that a person approved. <b>Drift</b> is the gap between the two. Finding drift is how you notice the colleague who removed a line at 2 a.m., the emergency fix nobody wrote down, and the change that was approved but never recorded.</p>

<h3>Analogy: the signed floor plan</h3>
<p>A building has an approved floor plan. Over the years people add a partition here and knock out a door there. Walking through the building every night and comparing it with the plan, line by line, shows exactly what changed. The plan is the golden copy and the walk is the nightly backup.</p>

<h3>Promoting the golden configuration</h3>
<pre class="code">def cmd_golden(args):
    shutil.rmtree("golden", ignore_errors=True)
    shutil.copytree("backups", "golden")
    print(f"golden: saved {len(os.listdir('golden'))} config(s)")</pre>
<p>Golden is a <b>snapshot of backups/ taken at an approved moment</b>. <code>rmtree</code> clears the previous snapshot and <code>copytree</code> copies the current backups over. The command never decides anything by itself; a person runs it after checking that today's state is the one they approve.</p>

<h3>drift.py: read() and changes()</h3>
<p>In Lab 1 the file has only <code>read()</code>. You add <code>changes()</code> with <code>cat &gt;&gt;</code>, which appends to the file:</p>
<pre class="code">"""drift.py - what changed since the approved (golden) configuration?"""
import difflib
import os


def read(path):
    """The lines of a saved config, or None when the file does not exist."""
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return [ln.rstrip() for ln in f]


def changes(old, new):
    """Lines added (+) and removed (-) between two configs, without the diff headers."""
    diff = difflib.unified_diff(old, new, "golden", "today", lineterm="")
    return [ln for ln in diff if ln.startswith(("+", "-")) and not ln.startswith(("+++", "---"))]</pre>
<p><code>read()</code> returns <code>None</code> instead of crashing when a file is missing, so the caller can say "no golden config" and carry on. <code>difflib.unified_diff</code> compares two lists of lines and yields the classic diff text. To see what it produces, compare two tiny configs:</p>
<pre class="code">import difflib

old = ["hostname R2", "ntp server 10.99.0.50"]
new = ["hostname R2", "logging host 10.99.0.51"]
for ln in difflib.unified_diff(old, new, "golden", "today", lineterm=""):
    print(repr(ln))</pre>
<pre class="out">AUTO01$ python3 t3.py
'--- golden'
'+++ today'
'@@ -1,2 +1,2 @@'
' hostname R2'
<span class="hl">'-ntp server 10.99.0.50'</span>
<span class="hl">'+logging host 10.99.0.51'</span></pre>
<ul>
<li>The first three lines are <b>headers</b>: the two names we passed ("golden", "today") and a position marker.</li>
<li>A line that starts with a space is unchanged context.</li>
<li><code>-</code> means the line is in the <b>first</b> list (golden) but gone from the second.</li>
<li><code>+</code> means the line is in the <b>second</b> list (today) but not in golden.</li>
</ul>
<p>The filter in <code>changes()</code> keeps lines that start with <code>+</code> <i>or</i> <code>-</code> and throws away the <code>+++</code> and <code>---</code> headers. <code>startswith</code> accepts a tuple, so one call tests several prefixes. A line that was <i>edited</i> shows as a pair: the old text with <code>-</code> and the new text with <code>+</code>.</p>

<div class="warn"><p><b>Both directions matter.</b> A filter that keeps only <code>+</code> finds new lines and misses deleted ones. The deleted line is often the dangerous one: a removed <code>logging host</code>, a removed ACL entry, a removed <code>ntp server</code>. Chapter 10 shows this bug in a real incident, and chapter 8 shows the test that catches it.</p></div>

<h3>cmd_drift: three possible answers per router</h3>
<pre class="code">def cmd_drift(args):
    for name, ip in devices():
        old = drift.read(f"golden/{name}.cfg")
        new = drift.read(f"backups/{name}.cfg")
        if old is None or new is None:
            print(f"{name}: no golden config" if old is None else f"{name}: no backup")
            continue
        diff = drift.changes(old, new)
        if not diff:
            print(f"{name}: no drift")
            continue
        print(f"{name}: DRIFT ({len(diff)} lines)")
        for ln in diff:
            print("  " + ln)</pre>
<p>Each router ends in one of four lines: <code>no golden config</code>, <code>no backup</code>, <code>no drift</code> or <code>DRIFT (N lines)</code> followed by the lines. Using one function for the comparison and a plain loop for the printing keeps the logic testable.</p>
<pre class="out">AUTO01$ python3 nettool.py golden
golden: saved 2 config(s)
AUTO01$ python3 nettool.py drift
R1: no drift
R2: no drift
<span class="hl">R3: no golden config</span></pre>
<p>R3 was down at backup time, so it has no backup and therefore no golden copy. That is honest: the toolkit cannot compare what it never saw. In chapter 6 you push two lines to R2. After a fresh backup, drift reports:</p>
<pre class="out">AUTO01$ python3 nettool.py drift
R1: no drift
<span class="hl">R2: DRIFT (2 lines)
  +logging host 10.99.0.51
  +ntp server 10.99.0.50</span>
R3: no golden config</pre>

<div class="eg"><p><b>Worked example.</b> Golden for R2 has 35 lines. Tonight's backup has 37: the lines <code>logging host 10.99.0.51</code> and <code>ntp server 10.99.0.50</code> were added. <code>changes()</code> returns exactly those two, each with a <code>+</code>, so the report column says 2. If the change was approved, the engineer runs <code>backup</code> and then <code>golden</code> again, and the next drift check is quiet.</p></div>

<div class="note"><p><b>Reference code.</b> Drift is a question, not a verdict. The same output can mean an attack, a forgotten emergency fix or an approved change that was never promoted. Many teams keep golden configs in a separate, access-controlled repository (auto-git) so that history shows who approved what. For one-off checks the shell command <code>diff golden/R1.cfg backups/R1.cfg</code> does the same comparison by hand.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Comparing raw running configs without <code>clean()</code>, so byte counts cause false drift. Running <code>golden</code> while a router is down or misbehaving. Promoting golden without anyone approving the state. Swapping the two arguments of <code>unified_diff</code>, which turns every <code>+</code> into <code>-</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a unified diff, <code>-</code> belongs to the <i>first</i> argument (old) and <code>+</code> to the <i>second</i> (new). The lines starting with <code>+++</code> and <code>---</code> are file headers, not changes.</p></div>

<div class="scn"><h4>The NTP line nobody removed</h4><p>Logs on three routers drifted by two minutes. Drift showed nothing, and the engineer assumed the clocks were simply bad. A second look at the tool found it only reported added lines. Once removed lines were reported too, the output showed <code>-ntp server 10.99.0.50</code> on one router: someone had deleted it during a maintenance window.</p><p><b>Lesson:</b> test drift in both directions, or it only finds half the problems.</p></div>

<div class="iv"><p class="q">"How would you detect configuration drift on a hundred routers?"</p><p>Back up all running configs, clean out the lines that change by themselves, and compare each one with an approved golden copy using <code>difflib</code>, reporting both added and removed lines per router. A person promotes a new golden copy only after approving the change, and routers with no backup are reported as such, not skipped.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Golden is a snapshot of backups taken when a person approves the state.</li>
<li><code>difflib.unified_diff(old, new)</code> marks removed lines with <code>-</code> and added lines with <code>+</code>.</li>
<li><code>changes()</code> must keep both and drop only the <code>+++</code> and <code>---</code> headers.</li>
<li><code>read()</code> returns <code>None</code> for a missing file, so one missing file never crashes the loop.</li>
<li>After an approved change, run backup and golden again.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> backup batata hai router <i>kya hai</i>. <b>Golden configuration</b> batati hai woh <i>kya hona chahiye</i>: aakhri state jise kisi insaan ne approve kiya. <b>Drift</b> dono ke beech ka gap hai. Drift dhoondhna isi tarah hota hai ki aap us colleague ko notice karte ho jisne raat 2 baje ek line hata di, us emergency fix ko jo kisi ne likha nahi, aur us change ko jo approve hua par record nahi hua.</p>

<h3>Analogy: signed floor plan</h3>
<p>Ek building ka approved floor plan hota hai. Saalon mein koi yahan partition jodta hai, koi wahan darwaza tod deta hai. Har raat building mein ghoomkar use plan se line by line compare karne se saaf dikhta hai ki kya badla. Plan golden copy hai aur ghoomna raat ka backup.</p>

<h3>Golden configuration promote karna</h3>
<pre class="code">def cmd_golden(args):
    shutil.rmtree("golden", ignore_errors=True)
    shutil.copytree("backups", "golden")
    print(f"golden: saved {len(os.listdir('golden'))} config(s)")</pre>
<p>Golden <b>approved moment par li gayi backups/ ki snapshot</b> hai. <code>rmtree</code> pichhli snapshot saaf karta hai aur <code>copytree</code> abhi ke backups copy karta hai. Command khud kuch decide nahi karti; insaan ise tab chalata hai jab check kar le ki aaj ki state wahi hai jise woh approve karta hai.</p>

<h3>drift.py: read() aur changes()</h3>
<p>Lab 1 mein file mein sirf <code>read()</code> hai. Aap <code>changes()</code> ko <code>cat &gt;&gt;</code> se jodte ho, jo file mein append karta hai:</p>
<pre class="code">"""drift.py - what changed since the approved (golden) configuration?"""
import difflib
import os


def read(path):
    """The lines of a saved config, or None when the file does not exist."""
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return [ln.rstrip() for ln in f]


def changes(old, new):
    """Lines added (+) and removed (-) between two configs, without the diff headers."""
    diff = difflib.unified_diff(old, new, "golden", "today", lineterm="")
    return [ln for ln in diff if ln.startswith(("+", "-")) and not ln.startswith(("+++", "---"))]</pre>
<p>File missing ho to <code>read()</code> crash karne ki jagah <code>None</code> return karta hai, taaki caller "no golden config" keh sake aur aage badhe. <code>difflib.unified_diff</code> lines ki do lists compare karta hai aur classic diff text deta hai. Dekhne ke liye do chhote configs compare karo:</p>
<pre class="code">import difflib

old = ["hostname R2", "ntp server 10.99.0.50"]
new = ["hostname R2", "logging host 10.99.0.51"]
for ln in difflib.unified_diff(old, new, "golden", "today", lineterm=""):
    print(repr(ln))</pre>
<pre class="out">AUTO01$ python3 t3.py
'--- golden'
'+++ today'
'@@ -1,2 +1,2 @@'
' hostname R2'
<span class="hl">'-ntp server 10.99.0.50'</span>
<span class="hl">'+logging host 10.99.0.51'</span></pre>
<ul>
<li>Pehli teen lines <b>headers</b> hain: humne jo do naam diye ("golden", "today") aur ek position marker.</li>
<li>Space se shuru hone wali line badli nahi hai, sirf context hai.</li>
<li><code>-</code> matlab line <b>pehli</b> list (golden) mein hai par doosri se gayab hai.</li>
<li><code>+</code> matlab line <b>doosri</b> list (today) mein hai par golden mein nahi.</li>
</ul>
<p><code>changes()</code> ka filter woh lines rakhta hai jo <code>+</code> <i>ya</i> <code>-</code> se shuru hoti hain aur <code>+++</code> aur <code>---</code> headers phenk deta hai. <code>startswith</code> tuple leta hai, isliye ek call kai prefixes check karti hai. <i>Edit</i> hui line ek jodi ki tarah dikhti hai: purana text <code>-</code> ke saath aur naya text <code>+</code> ke saath.</p>

<div class="warn"><p><b>Dono directions zaroori hain.</b> Jo filter sirf <code>+</code> rakhta hai woh nayi lines pakadta hai aur hatayi gayi lines chhod deta hai. Hatayi gayi line aksar khatarnak hoti hai: hata hua <code>logging host</code>, hata hua ACL entry, hata hua <code>ntp server</code>. Chapter 10 mein yeh bug asli incident mein dikhega, aur chapter 8 mein woh test jo ise pakadta hai.</p></div>

<h3>cmd_drift: har router ke liye teen-chaar jawab</h3>
<pre class="code">def cmd_drift(args):
    for name, ip in devices():
        old = drift.read(f"golden/{name}.cfg")
        new = drift.read(f"backups/{name}.cfg")
        if old is None or new is None:
            print(f"{name}: no golden config" if old is None else f"{name}: no backup")
            continue
        diff = drift.changes(old, new)
        if not diff:
            print(f"{name}: no drift")
            continue
        print(f"{name}: DRIFT ({len(diff)} lines)")
        for ln in diff:
            print("  " + ln)</pre>
<p>Har router in mein se ek line par khatam hota hai: <code>no golden config</code>, <code>no backup</code>, <code>no drift</code> ya <code>DRIFT (N lines)</code> aur uske neeche lines. Compare ke liye ek function aur printing ke liye seedha loop rakhne se logic testable rehta hai.</p>
<pre class="out">AUTO01$ python3 nettool.py golden
golden: saved 2 config(s)
AUTO01$ python3 nettool.py drift
R1: no drift
R2: no drift
<span class="hl">R3: no golden config</span></pre>
<p>R3 backup ke waqt down tha, isliye uska backup nahi hai aur golden copy bhi nahi. Yeh imaandar hai: toolkit woh compare nahi kar sakta jo usne dekha hi nahi. Chapter 6 mein aap R2 par do lines push karoge. Naye backup ke baad drift yeh report karta hai:</p>
<pre class="out">AUTO01$ python3 nettool.py drift
R1: no drift
<span class="hl">R2: DRIFT (2 lines)
  +logging host 10.99.0.51
  +ntp server 10.99.0.50</span>
R3: no golden config</pre>

<div class="eg"><p><b>Worked example.</b> R2 ke golden mein 35 lines hain. Aaj raat ke backup mein 37 hain: <code>logging host 10.99.0.51</code> aur <code>ntp server 10.99.0.50</code> jodi gayi. <code>changes()</code> bilkul yahi do lines return karta hai, har ek <code>+</code> ke saath, isliye report column 2 dikhata hai. Change approved tha to engineer <code>backup</code> aur phir <code>golden</code> dobara chalata hai, aur agla drift check shaant rehta hai.</p></div>

<div class="note"><p><b>Reference code.</b> Drift sawal hai, faisla nahi. Wahi output attack, bhooli hui emergency fix ya approve hue par promote na hue change ka matlab ho sakta hai. Kai teams golden configs ko alag, access-controlled repository mein rakhti hain (auto-git), taaki history dikhaye ki kisne kya approve kiya. Ek-baar ke check ke liye shell command <code>diff golden/R1.cfg backups/R1.cfg</code> wahi compare haath se kar deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>clean()</code> ke bina raw running configs compare karna, jisse byte count se false drift aata hai. Router down ya ajeeb behave kar raha ho tab <code>golden</code> chalana. Kisi ke approve kiye bina golden promote karna. <code>unified_diff</code> ke do arguments ulte kar dena, jisse har <code>+</code> <code>-</code> ban jata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Unified diff mein <code>-</code> <i>pehle</i> argument (old) ka hai aur <code>+</code> <i>doosre</i> (new) ka. <code>+++</code> aur <code>---</code> se shuru hone wali lines file headers hain, changes nahi.</p></div>

<div class="scn"><h4>NTP line jo kisi ne hatayi nahi</h4><p>Teen routers ke logs mein do minute ka fark aa gaya. Drift ne kuch nahi dikhaya, aur engineer ne maan liya ki clocks bas kharab hain. Doosri nazar mein pata chala ki tool sirf jodi gayi lines report karta tha. Hatayi gayi lines bhi report hone lagi to output ne ek router par <code>-ntp server 10.99.0.50</code> dikhaya: kisi ne maintenance window mein use delete kar diya tha.</p><p><b>Lesson:</b> drift ko dono directions mein test karo, warna woh aadhi problems hi dhoondhta hai.</p></div>

<div class="iv"><p class="q">"Sau routers par configuration drift kaise detect karoge?"</p><p>Saare running configs ka backup lunga, jo lines khud badalti hain unhe clean karunga, aur har ek ko approved golden copy se <code>difflib</code> se compare karunga, har router ke liye jodi aur hatayi dono lines report karunga. Naya golden copy tabhi promote hoga jab insaan change approve kare, aur jin routers ka backup nahi hai unhe skip nahi balki waisa hi report karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Golden woh backups ki snapshot hai jo insaan ke state approve karne par li jaati hai.</li>
<li><code>difflib.unified_diff(old, new)</code> hatayi lines ko <code>-</code> aur jodi lines ko <code>+</code> se mark karta hai.</li>
<li><code>changes()</code> ko dono rakhne hain aur sirf <code>+++</code> aur <code>---</code> headers girane hain.</li>
<li>Missing file par <code>read()</code> <code>None</code> deta hai, isliye ek missing file loop ko crash nahi karti.</li>
<li>Approved change ke baad backup aur golden dobara chalao.</li>
</ul></div>
`}};export{e as default};