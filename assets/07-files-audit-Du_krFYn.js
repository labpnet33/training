var e={id:`files-audit`,h:{en:`CSV in, audit out, and an exit code`,hi:`CSV andar, audit bahar, aur exit code`},body:{en:`
<p><b>One idea:</b> real address data lives in files, usually spreadsheets saved as CSV (comma-separated values: one row per line, columns split by commas). A script reads the file, checks every row with the tools you already know, prints the problems and tells the computer whether it passed. That is a complete, useful audit tool.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="inventory.csv from the field team to audit.py check each row to Report problems printed to Exit code 0 pass, 1 fail"><rect x="20" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">inventory.csv</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">from the field team</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">audit.py</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">check each row</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">Report</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">problems printed</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Exit code</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">0 pass, 1 fail</text></svg><p class="cap">The audit reads a file, checks rows, prints a report and ends with an exit code other programs can read.</p></div>
<h3>Reading a CSV file</h3>
<p>The first line of <code>inventory.csv</code> is the header: <code>hostname,ip,prefix</code>. Every other line is a device. The lab file has 9 devices, for example <code>PUN-ACC-SW2,10.60.7.12,26</code>.</p>
<pre class="code">import csv

with open("inventory.csv") as f:
    for row in csv.DictReader(f):
        print(row["hostname"], row["ip"])
        break</pre>
<pre class="out">PUN-CORE-SW1 10.60.7.2</pre>
<ul><li><code>import csv</code> opens the toolbox for CSV files.</li><li><code>with open("inventory.csv") as f:</code> opens the file, calls it <code>f</code>, and closes it automatically when the indented block ends. The <code>with</code> keyword is the safe way to handle files.</li><li><code>csv.DictReader(f)</code> reads each line and gives you a <b>dictionary</b> keyed by the header names. A dictionary is a set of label-and-value pairs written with curly braces, so <code>row["ip"]</code> means "the value under the label ip". The <code>break</code> stops after the first row so the output is short.</li></ul>
<p>A dictionary is also the right tool for "have I seen this before?":</p>
<pre class="code">seen = {}
seen["10.60.7.12"] = "PUN-ACC-SW2"
print("10.60.7.12" in seen)
print(seen["10.60.7.12"])
print("10.60.7.99" in seen)</pre>
<pre class="out">True
PUN-ACC-SW2
False</pre>
<p><code>"10.60.7.12" in seen</code> asks whether the label exists. Storing each address as a label and the hostname as its value lets you detect a duplicate and also say <i>who</i> had it first.</p>
<h3>The finished audit script</h3>
<p>This is <code>audit.py</code> from Lab 2 with both TODOs completed. Read <code>check()</code> first: for one row it returns a <b>list of problems</b> (an empty list means the row is clean).</p>
<pre class="code">import csv
import ipaddress
import sys

SITE = ipaddress.ip_network("10.60.4.0/22")      # Pune campus block


def check(row, seen):
    """return a list of problems for one inventory row"""
    problems = []
    try:
        iface = ipaddress.ip_interface(row["ip"] + "/" + row["prefix"])
    except ValueError:
        return ["not a valid address"]
    ip = iface.ip
    if ip not in SITE:
        problems.append(f"outside the site block {SITE}")
    if ip == iface.network.network_address:
        problems.append("network address of " + str(iface.network))
    if ip in seen:
        problems.append("duplicate of " + seen[ip])
    seen[ip] = row["hostname"]
    return problems


name = sys.argv[1] if len(sys.argv) &gt; 1 else "inventory.csv"
bad = 0
seen = {}
with open(name) as f:
    for row in csv.DictReader(f):
        for p in check(row, seen):
            print(f"{row['hostname']:&lt;14} {row['ip']:&lt;15} {p}")
            bad += 1
print(f"{bad} problem(s) in {name}")
sys.exit(1 if bad else 0)</pre>
<ul><li><b>Invalid address.</b> The <code>try/except</code> from chapter 4 turns a bad value such as 10.60.7.300 into the problem "not a valid address". <code>return [...]</code> exits early because nothing else can be checked.</li><li><b>Outside the block.</b> <code>ip not in SITE</code> uses chapter 5. The UPS at 10.60.8.5 sits just beyond the /22.</li><li><b>Network address.</b> A host must not use the first address of its own subnet. 10.60.4.0 is the network address of the /23.</li><li><b>Duplicate.</b> The <code>seen</code> dictionary remembers the first owner of each address.</li><li><code>sys.argv</code> is the list of words typed after the program name, so <code>python3 audit.py other.csv</code> audits a different file. If you type no file name, it uses inventory.csv.</li></ul>
<h3>Running it and the exit code</h3>
<pre class="out">PUN-ACC-SW3    10.60.7.12      duplicate of PUN-ACC-SW2
PUN-AP-01      10.60.7.64      network address of 10.60.7.64/26
PUN-UPS-01     10.60.8.5       outside the site block 10.60.4.0/22
PUN-CAM-NVR    10.60.7.300     not a valid address
PUN-PRN-01     10.60.4.0       network address of 10.60.4.0/23
5 problem(s) in inventory.csv

<span class="hl">exit code: 1</span></pre>
<p>Five problems: one invalid address, one outside the block, one network address, one duplicate and the network-address problem for the AP at 10.60.7.64, which is the network address of 10.60.7.64/26 (the highlighted exit code line was added by the shell command <code>echo "exit code: $?"</code>). The last line of the script, <code>sys.exit(1 if bad else 0)</code>, makes the program finish with code 1 when anything was found, and 0 when the file is clean. Exit code 0 means success in every operating system. A shell script, cron job or CI pipeline can check <code>$?</code> and block a change when the audit fails.</p>
<div class="warn"><p><b>Common mistake.</b> Forgetting <code>newline=""</code> when writing CSV with <code>open("plan.csv", "w", newline="")</code>. On some systems you then get blank lines between rows. Also never edit the CSV by hand while the script has it open.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know that a dictionary uses labels (keys), that <code>csv.DictReader</code> gives one dictionary per row, and that exit code 0 means success while any non-zero code means failure.</p></div>
<div class="eg"><p><b>Worked example.</b> Lab 2 asks you to give PUN-PRN-02 the free address 10.60.7.14 in <code>inventory-v2.csv</code>, then re-run until the audit reports 0 problems and exit code 0.</p></div>
<div class="scn"><h4>The audit that blocked the Friday change</h4><p>A change pipeline ran <code>python3 audit.py new-addresses.csv</code> before pushing configurations. The script found a duplicate address and exited with 1, so the pipeline stopped and posted the report. Without the exit code, the pipeline would have continued and a duplicate IP would have gone live on two switches.</p><p><b>Lesson:</b> Exit codes let automation obey your checks.</p></div>
<div class="iv"><p class="q">"Why should an audit script exit with a non-zero code on failure?"</p><p>Because other tools only see the exit code, not the printed text. A pipeline or cron job treats 0 as success and anything else as failure, so a non-zero exit lets it stop the change automatically. I print the readable report for humans and return the code for machines.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>csv.DictReader</code> gives one dictionary per row; read values with <code>row["ip"]</code>.</li><li><code>with open(...)</code> closes the file for you.</li><li>A dictionary of seen addresses detects duplicates and names the first owner.</li><li>Combine four checks: valid, in the block, not the network address, not a duplicate.</li><li><code>sys.exit(1 if bad else 0)</code> lets pipelines act on the result.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> asli address data files mein hota hai, aam taur par spreadsheet jo CSV (comma-separated values: ek line mein ek row, columns commas se alag) ki tarah save hui ho. Script file padhti hai, har row ko aapke jaane-pehchane tools se check karti hai, problems print karti hai aur computer ko batati hai ki pass hua ya nahi. Yeh poora, kaam ka audit tool hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="inventory.csv field team se to audit.py har row check karo to Report problems print hui to Exit code 0 pass, 1 fail"><rect x="20" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">inventory.csv</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">field team se</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">audit.py</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">har row check karo</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">Report</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">problems print hui</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Exit code</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">0 pass, 1 fail</text></svg><p class="cap">Audit file padhta hai, rows check karta hai, report print karta hai aur aise exit code par khatam hota hai jise doosre programs padh sakte hain.</p></div>
<h3>CSV file padhna</h3>
<p><code>inventory.csv</code> ki pehli line header hai: <code>hostname,ip,prefix</code>. Baaki har line ek device hai. Lab file mein 9 devices hain, jaise <code>PUN-ACC-SW2,10.60.7.12,26</code>.</p>
<pre class="code">import csv

with open("inventory.csv") as f:
    for row in csv.DictReader(f):
        print(row["hostname"], row["ip"])
        break</pre>
<pre class="out">PUN-CORE-SW1 10.60.7.2</pre>
<ul><li><code>import csv</code> CSV files ka toolbox kholta hai.</li><li><code>with open("inventory.csv") as f:</code> file kholta hai, use <code>f</code> naam deta hai, aur indented block khatam hone par apne aap band kar deta hai. <code>with</code> keyword files handle karne ka surakshit tareeka hai.</li><li><code>csv.DictReader(f)</code> har line padhta hai aur header ke naamon se bana <b>dictionary</b> deta hai. Dictionary label-aur-value pairs ka set hai jo curly braces se likha jaata hai, isliye <code>row["ip"]</code> ka matlab "ip label ke neeche ki value". <code>break</code> pehli row ke baad ruk jaata hai taaki output chhota rahe.</li></ul>
<p>Dictionary "kya yeh pehle dekha hai?" ke liye bhi sahi tool hai:</p>
<pre class="code">seen = {}
seen["10.60.7.12"] = "PUN-ACC-SW2"
print("10.60.7.12" in seen)
print(seen["10.60.7.12"])
print("10.60.7.99" in seen)</pre>
<pre class="out">True
PUN-ACC-SW2
False</pre>
<p><code>"10.60.7.12" in seen</code> poochhta hai ki label maujood hai ya nahi. Har address ko label aur hostname ko value ki tarah store karne se duplicate pakda jaata hai aur yeh bhi bataya ja sakta hai ki pehle <i>kiske</i> paas tha.</p>
<h3>Poori audit script</h3>
<p>Yeh Lab 2 ki <code>audit.py</code> hai, dono TODOs poore karke. Pehle <code>check()</code> padho: ek row ke liye yeh <b>problems ki list</b> lautata hai (khaali list ka matlab row saaf hai).</p>
<pre class="code">import csv
import ipaddress
import sys

SITE = ipaddress.ip_network("10.60.4.0/22")      # Pune campus block


def check(row, seen):
    """return a list of problems for one inventory row"""
    problems = []
    try:
        iface = ipaddress.ip_interface(row["ip"] + "/" + row["prefix"])
    except ValueError:
        return ["not a valid address"]
    ip = iface.ip
    if ip not in SITE:
        problems.append(f"outside the site block {SITE}")
    if ip == iface.network.network_address:
        problems.append("network address of " + str(iface.network))
    if ip in seen:
        problems.append("duplicate of " + seen[ip])
    seen[ip] = row["hostname"]
    return problems


name = sys.argv[1] if len(sys.argv) &gt; 1 else "inventory.csv"
bad = 0
seen = {}
with open(name) as f:
    for row in csv.DictReader(f):
        for p in check(row, seen):
            print(f"{row['hostname']:&lt;14} {row['ip']:&lt;15} {p}")
            bad += 1
print(f"{bad} problem(s) in {name}")
sys.exit(1 if bad else 0)</pre>
<ul><li><b>Invalid address.</b> Chapter 4 ka <code>try/except</code> 10.60.7.300 jaisi galat value ko "not a valid address" problem mein badalta hai. <code>return [...]</code> jaldi nikal jaata hai kyunki aur kuch check nahi ho sakta.</li><li><b>Block ke bahar.</b> <code>ip not in SITE</code> chapter 5 use karta hai. 10.60.8.5 par UPS /22 ke thik bahar hai.</li><li><b>Network address.</b> Host ko apne subnet ka pehla address use nahi karna chahiye. 10.60.4.0 /23 ka network address hai.</li><li><b>Duplicate.</b> <code>seen</code> dictionary har address ka pehla owner yaad rakhta hai.</li><li><code>sys.argv</code> program ke naam ke baad type kiye words ki list hai, isliye <code>python3 audit.py other.csv</code> doosri file audit karta hai. File naam nahi doge to inventory.csv use hoti hai.</li></ul>
<h3>Chalana aur exit code</h3>
<pre class="out">PUN-ACC-SW3    10.60.7.12      duplicate of PUN-ACC-SW2
PUN-AP-01      10.60.7.64      network address of 10.60.7.64/26
PUN-UPS-01     10.60.8.5       outside the site block 10.60.4.0/22
PUN-CAM-NVR    10.60.7.300     not a valid address
PUN-PRN-01     10.60.4.0       network address of 10.60.4.0/23
5 problem(s) in inventory.csv

<span class="hl">exit code: 1</span></pre>
<p>Paanch problems: ek invalid address, ek block ke bahar, ek network address, ek duplicate, aur 10.60.7.64 par AP ki network-address problem, jo 10.60.7.64/26 ka network address hai (highlighted exit code line shell command <code>echo "exit code: $?"</code> se jodi gayi hai). Script ki aakhri line, <code>sys.exit(1 if bad else 0)</code>, kuch milne par program ko code 1 ke saath khatam karti hai, aur file saaf ho to 0 ke saath. Exit code 0 har operating system mein success hai. Shell script, cron job ya CI pipeline <code>$?</code> check karke audit fail hone par change rok sakti hai.</p>
<div class="warn"><p><b>Aam galti.</b> CSV likhte waqt <code>open("plan.csv", "w", newline="")</code> mein <code>newline=""</code> bhool jaana. Kuch systems par rows ke beech khaali lines aa jaati hain. Script ke file kholne ke dauran CSV ko haath se edit bhi mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho ki dictionary labels (keys) use karti hai, <code>csv.DictReader</code> har row ke liye ek dictionary deta hai, aur exit code 0 ka matlab success aur koi bhi non-zero code ka matlab failure.</p></div>
<div class="eg"><p><b>Worked example.</b> Lab 2 mein aapko <code>inventory-v2.csv</code> mein PUN-PRN-02 ko free address 10.60.7.14 dena hai, phir tab tak dobara chalana hai jab tak audit 0 problems aur exit code 0 na de.</p></div>
<div class="scn"><h4>Audit jisne Friday ka change roka</h4><p>Ek change pipeline configurations push karne se pehle <code>python3 audit.py new-addresses.csv</code> chalati thi. Script ko duplicate address mila aur exit 1 hua, isliye pipeline ruk gayi aur report post ki. Exit code ke bina pipeline aage badhti aur duplicate IP do switches par live ho jaata.</p><p><b>Lesson:</b> Exit codes automation ko aapke checks maanne dete hain.</p></div>
<div class="iv"><p class="q">"Audit script failure par non-zero code ke saath kyun exit kare?"</p><p>Kyunki doosre tools sirf exit code dekhte hain, printed text nahi. Pipeline ya cron job 0 ko success aur baaki sab ko failure maanti hai, isliye non-zero exit use change automatically rokne deta hai. Main insaanon ke liye padhne layak report print karta hoon aur machines ke liye code lautata hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>csv.DictReader</code> har row ka ek dictionary deta hai; values <code>row["ip"]</code> se padho.</li><li><code>with open(...)</code> file apne aap band karta hai.</li><li>Dekhe hue addresses ki dictionary duplicates pakadti hai aur pehle owner ka naam batati hai.</li><li>Chaar checks jodo: valid, block ke andar, network address nahi, duplicate nahi.</li><li><code>sys.exit(1 if bad else 0)</code> pipelines ko result par action lene deta hai.</li></ul></div>
`}};export{e as default};