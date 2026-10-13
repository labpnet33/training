var e={id:`report`,h:{en:`The report: one table, status from the recorded run`,hi:`Report: ek table, status recorded run se`},body:{en:`
<p><b>The idea of this chapter:</b> a manager does not read logs, and a night-shift engineer does not want to open fifty files. Both want <i>one table</i>: every router, did its backup work, has it drifted. The table is easy to print and very easy to get wrong. The rule that keeps it honest is short: <b>take the status from the recorded run, not from files that happen to be lying around.</b></p>

<h3>Analogy: the school attendance sheet</h3>
<p>A teacher marks attendance by calling names today. She does not look into the bags and decide that a child is present because a notebook is lying on the desk from last week. The notebook is old evidence; the roll call is today's record. The report must work like the roll call.</p>

<h3>The three sources of the table</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The inventory gives the rows, status.json gives the backup state of the last run, golden and backups give the drift count; all feed one table">
<rect x="10" y="12" width="190" height="46" rx="8" fill="#bae6fd"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="12">inventory.db</text><text x="105" y="48" text-anchor="middle" class="svg-muted" font-size="10">which routers: name, ip</text>
<rect x="10" y="62" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">status.json</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="10">last backup run: ok / unreachable</text>
<rect x="10" y="112" width="190" height="46" rx="8" fill="#ddd6fe"/><text x="105" y="132" text-anchor="middle" class="svg-ink" font-size="12">golden/ and backups/</text><text x="105" y="148" text-anchor="middle" class="svg-muted" font-size="10">changed lines, or a dash</text>
<rect x="400" y="50" width="230" height="70" rx="10" fill="#fde68a"/><text x="515" y="76" text-anchor="middle" class="svg-ink" font-size="13">report.table(rows)</text><text x="515" y="96" text-anchor="middle" class="svg-muted" font-size="11">router · ip · backup · drift</text>
<line x1="200" y1="35" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><line x1="200" y1="85" x2="400" y2="85" stroke="#64748b" stroke-width="2"/><line x1="200" y1="135" x2="400" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three sources, one table. The backup column comes only from status.json.</p></div>

<h3>report.py and cmd_report</h3>
<pre class="code">"""report.py - one table for the whole estate."""
from tabulate import tabulate


def table(rows):
    return tabulate(rows, headers=["router", "ip", "backup", "drift"])</pre>
<p>This module only <b>presents</b>. It takes a list of rows and returns text, using the <code>tabulate</code> library from the lab. It decides nothing, so it never needs a router or a file. The decisions are made by the front desk, which builds the rows:</p>
<pre class="code">def cmd_report(args):
    status = json.load(open("status.json")) if os.path.exists("status.json") else {}
    rows = []
    for name, ip in devices():
        old = drift.read(f"golden/{name}.cfg")
        new = drift.read(f"backups/{name}.cfg")
        state = status.get(name, "never backed up")
        changed = "-" if old is None or new is None else len(drift.changes(old, new))
        rows.append([name, ip, state, changed])
    print(report.table(rows))</pre>
<ul>
<li><code>devices()</code> gives the rows, so a router that exists in the inventory always appears, even if nothing ever worked for it.</li>
<li><code>status</code> is the dictionary that the last <code>backup</code> run saved in <code>status.json</code>. If the file does not exist yet, it is an empty dictionary.</li>
<li><code>status.get(name, "never backed up")</code> reads the router's state from that record and falls back to <code>never backed up</code>. Three honest states exist: <code>ok</code>, <code>unreachable</code>, <code>never backed up</code>.</li>
<li>The drift column is the number of changed lines, or <code>-</code> when there is no golden copy or no backup to compare.</li>
</ul>

<h3>What the table looks like</h3>
<pre class="out">AUTO01$ python3 nettool.py report
router    ip         backup           drift
--------  ---------  ---------------  -------
R1        10.99.0.1  never backed up  -
R2        10.99.0.2  never backed up  -
R3        10.99.0.3  never backed up  -</pre>
<p>This is the very first run: no backup has happened, so every router says so. After a backup, a golden copy and the push of chapter 6 the same command prints:</p>
<pre class="out">AUTO01$ python3 nettool.py report
router    ip         backup       drift
--------  ---------  -----------  -------
R1        10.99.0.1  ok           0
R2        10.99.0.2  ok           <span class="hl">2</span>
R3        10.99.0.3  <span class="hl">unreachable</span>  -</pre>
<p>Read it like a triage list. <code>R1</code> is healthy and unchanged. <code>R2</code> was backed up and has two changed lines: check that they were approved. <code>R3</code> could not be reached tonight, so nothing is known about it; that is the first one to chase.</p>

<h3>Why not just look for the backup file?</h3>
<p>It is tempting to write <code>state = "ok" if the file backups/R3.cfg exists</code>. It looks logical and it is wrong. A dead router does not erase its old file. Last week's <code>R3.cfg</code> is still in the folder, so the table would say <code>ok</code> for a router that has been down for days. The file proves that a backup <i>once</i> worked. Only the record written by <i>tonight's run</i> says what happened tonight. Lab 2 contains exactly this bug and you will fix it in chapter 10.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Foods has 12 routers. After the 02:00 job the engineer runs <code>report</code>. Ten rows say <code>ok 0</code>, one says <code>ok 3</code> and one says <code>unreachable -</code>. In two minutes she knows: one device to investigate for reachability and one to check for three unexpected lines. Nothing was opened except one table.</p></div>

<div class="note"><p><b>Reference code.</b> <code>status.json</code> holds states but not a time. If cron silently stops, the report keeps showing last week's <code>ok</code>. A stronger record stores the time of the run next to each state, and the report warns when the record is older than a day. Also, <code>backup</code> exits with code 0 even when a router is unreachable; adding <code>sys.exit(1)</code> in that case lets cron mail or monitoring react (py-tools).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Deciding a router is healthy because a file exists. Leaving unreachable routers out of the table so it looks tidy. Mixing formatting and logic in one function, which makes both untestable. Reading a status record that is days old without checking its age.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>json.dump(obj, f)</code> writes a dictionary to a file and <code>json.load(f)</code> reads it back; the <code>s</code> versions (<code>dumps</code>, <code>loads</code>) work with strings. A router missing from the record needs a default, which is what <code>dict.get(key, default)</code> is for.</p></div>

<div class="scn"><h4>The report that said all green</h4><p>For a week the Monday report listed every branch router as healthy. One branch had lost power on Tuesday. The report only checked that a backup file existed, and Tuesday's file sat there until the next audit. After the report read the saved run record, the dead branch showed <code>unreachable</code> on the first morning.</p><p><b>Lesson:</b> a report must be built from facts recorded by the last run, never from leftovers.</p></div>

<div class="iv"><p class="q">"How do you make sure a status report can be trusted?"</p><p>Every run writes a small record of what it did for each device, and the report reads only that record, with a clear default for devices that were never processed. I show unreachable devices as rows, I test the logic separately from the formatting, and I check how old the record is.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The report is one table built from the inventory, the run record and the golden/backup comparison.</li>
<li><code>report.py</code> only formats; the front desk decides what goes in each row.</li>
<li>Backup state comes from <code>status.json</code>, with <code>never backed up</code> as the default.</li>
<li>An old backup file is not proof that tonight's backup worked.</li>
<li>Show unreachable routers and record when the run happened.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> manager logs nahi padhta, aur night-shift engineer pachaas files nahi kholna chahta. Dono ko <i>ek table</i> chahiye: har router, backup chala ya nahi, drift hua ya nahi. Table print karna aasaan hai aur galat karna bahut aasaan. Ise imaandar rakhne wala rule chhota hai: <b>status recorded run se lo, un files se nahi jo yunhi padi hain.</b></p>

<h3>Analogy: school ki attendance sheet</h3>
<p>Teacher aaj naam bulakar attendance lagati hai. Woh bag mein jhaank kar yeh nahi tay karti ki bachcha present hai kyunki desk par pichhle hafte ki copy padi hai. Copy purana saboot hai; roll call aaj ka record hai. Report ko roll call ki tarah kaam karna chahiye.</p>

<h3>Table ke teen sources</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Inventory rows deti hai, status.json pichhle run ka backup state deta hai, golden aur backups drift count dete hain; sab ek table mein jaate hain">
<rect x="10" y="12" width="190" height="46" rx="8" fill="#bae6fd"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="12">inventory.db</text><text x="105" y="48" text-anchor="middle" class="svg-muted" font-size="10">kaun se routers: name, ip</text>
<rect x="10" y="62" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">status.json</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="10">pichhla run: ok / unreachable</text>
<rect x="10" y="112" width="190" height="46" rx="8" fill="#ddd6fe"/><text x="105" y="132" text-anchor="middle" class="svg-ink" font-size="12">golden/ aur backups/</text><text x="105" y="148" text-anchor="middle" class="svg-muted" font-size="10">badli lines, ya dash</text>
<rect x="400" y="50" width="230" height="70" rx="10" fill="#fde68a"/><text x="515" y="76" text-anchor="middle" class="svg-ink" font-size="13">report.table(rows)</text><text x="515" y="96" text-anchor="middle" class="svg-muted" font-size="11">router · ip · backup · drift</text>
<line x1="200" y1="35" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><line x1="200" y1="85" x2="400" y2="85" stroke="#64748b" stroke-width="2"/><line x1="200" y1="135" x2="400" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen sources, ek table. Backup column sirf status.json se aata hai.</p></div>

<h3>report.py aur cmd_report</h3>
<pre class="code">"""report.py - one table for the whole estate."""
from tabulate import tabulate


def table(rows):
    return tabulate(rows, headers=["router", "ip", "backup", "drift"])</pre>
<p>Yeh module sirf <b>present</b> karta hai. Yeh rows ki list leta hai aur lab ki <code>tabulate</code> library se text return karta hai. Yeh kuch decide nahi karta, isliye ise router ya file ki zaroorat nahi. Decisions front desk leta hai, jo rows banata hai:</p>
<pre class="code">def cmd_report(args):
    status = json.load(open("status.json")) if os.path.exists("status.json") else {}
    rows = []
    for name, ip in devices():
        old = drift.read(f"golden/{name}.cfg")
        new = drift.read(f"backups/{name}.cfg")
        state = status.get(name, "never backed up")
        changed = "-" if old is None or new is None else len(drift.changes(old, new))
        rows.append([name, ip, state, changed])
    print(report.table(rows))</pre>
<ul>
<li><code>devices()</code> rows deta hai, isliye inventory ka har router table mein aata hai, chahe uske liye kabhi kuch chala hi na ho.</li>
<li><code>status</code> woh dictionary hai jo pichhle <code>backup</code> run ne <code>status.json</code> mein save ki. File abhi na ho to yeh khaali dictionary hai.</li>
<li><code>status.get(name, "never backed up")</code> router ka state us record se padhta hai aur na mile to <code>never backed up</code> deta hai. Teen imaandar states hain: <code>ok</code>, <code>unreachable</code>, <code>never backed up</code>.</li>
<li>Drift column badli hui lines ki ginti hai, ya <code>-</code> jab compare karne ke liye golden copy ya backup nahi hai.</li>
</ul>

<h3>Table kaisi dikhti hai</h3>
<pre class="out">AUTO01$ python3 nettool.py report
router    ip         backup           drift
--------  ---------  ---------------  -------
R1        10.99.0.1  never backed up  -
R2        10.99.0.2  never backed up  -
R3        10.99.0.3  never backed up  -</pre>
<p>Yeh bilkul pehla run hai: koi backup hua nahi, isliye har router yahi kehta hai. Backup, golden copy aur chapter 6 ke push ke baad wahi command yeh print karti hai:</p>
<pre class="out">AUTO01$ python3 nettool.py report
router    ip         backup       drift
--------  ---------  -----------  -------
R1        10.99.0.1  ok           0
R2        10.99.0.2  ok           <span class="hl">2</span>
R3        10.99.0.3  <span class="hl">unreachable</span>  -</pre>
<p>Ise triage list ki tarah padho. <code>R1</code> healthy aur unchanged hai. <code>R2</code> ka backup hua aur do lines badli hain: check karo ki approved thi ya nahi. <code>R3</code> aaj raat reach nahi hua, isliye uske baare mein kuch pata nahi; sabse pehle wahi dekho.</p>

<h3>Backup file kyon na dekhein?</h3>
<p>Yeh likhna lubhawna hai: <code>state = "ok" agar backups/R3.cfg file maujood hai</code>. Yeh logical lagta hai aur galat hai. Dead router apni purani file nahi mitata. Pichhle hafte ki <code>R3.cfg</code> folder mein abhi bhi hai, isliye table kai dinon se band router ke liye <code>ok</code> kehti. File yeh saabit karti hai ki backup <i>kabhi</i> chala tha. Aaj raat kya hua, yeh sirf <i>aaj raat ke run</i> ka likha record batata hai. Lab 2 mein yahi bug hai aur aap ise chapter 10 mein theek karoge.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Foods ke 12 routers hain. 02:00 ke job ke baad engineer <code>report</code> chalati hai. Dus rows <code>ok 0</code> kehti hain, ek <code>ok 3</code> aur ek <code>unreachable -</code>. Do minute mein use pata hai: ek device reachability ke liye dekhna hai aur ek device mein teen anjaani lines check karni hain. Sirf ek table khuli.</p></div>

<div class="note"><p><b>Reference code.</b> <code>status.json</code> mein states hain par time nahi. Cron chupchaap ruk jaye to report pichhle hafte ka <code>ok</code> dikhati rahegi. Mazboot record har state ke saath run ka time rakhta hai, aur record ek din se purana ho to report warning deti hai. Saath hi, <code>backup</code> router unreachable hone par bhi exit code 0 deta hai; us case mein <code>sys.exit(1)</code> jodne se cron mail ya monitoring react kar sakta hai (py-tools).</p></div>

<div class="warn"><p><b>Common mistakes.</b> File maujood hai isliye router ko healthy maan lena. Table sundar dikhane ke liye unreachable routers hata dena. Formatting aur logic ek function mein mila dena, jisse dono untestable ho jaate hain. Kai din purana status record uski umar dekhe bina padhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>json.dump(obj, f)</code> dictionary ko file mein likhta hai aur <code>json.load(f)</code> wapas padhta hai; <code>s</code> wale versions (<code>dumps</code>, <code>loads</code>) strings ke saath chalte hain. Record mein na milne wale router ko default chahiye, jiske liye <code>dict.get(key, default)</code> hai.</p></div>

<div class="scn"><h4>Woh report jisne sab green bataya</h4><p>Ek hafte tak Somvaar ki report ne har branch router ko healthy likha. Ek branch ki bijli Mangalvaar ko gayi thi. Report sirf check karti thi ki backup file maujood hai, aur Mangalvaar ki file agle audit tak wahin padi rahi. Report ne saved run record padhna shuru kiya to dead branch pehli subah hi <code>unreachable</code> dikha.</p><p><b>Lesson:</b> report un facts se banni chahiye jo pichhle run ne record kiye, bache-khuche se nahi.</p></div>

<div class="iv"><p class="q">"Status report par bharosa kaise pakka karte ho?"</p><p>Har run har device ke liye apne kaam ka chhota record likhta hai, aur report sirf wahi record padhti hai, un devices ke liye saaf default ke saath jo kabhi process hi nahi hue. Main unreachable devices ko rows ki tarah dikhata hoon, logic ko formatting se alag test karta hoon, aur record ki umar check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Report inventory, run record aur golden/backup compare se bani ek table hai.</li>
<li><code>report.py</code> sirf format karta hai; har row mein kya jaye yeh front desk tay karta hai.</li>
<li>Backup state <code>status.json</code> se aata hai, default <code>never backed up</code> ke saath.</li>
<li>Purani backup file saabit nahi karti ki aaj raat ka backup chala.</li>
<li>Unreachable routers dikhao aur run ka time record karo.</li>
</ul></div>
`}};export{e as default};