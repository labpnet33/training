var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: four templates, four different bugs (Lab 2)`,hi:`Troubleshooting workflow: chaar templates, chaar alag bugs (Lab 2)`},body:{en:`
<p><b>The idea of this chapter:</b> in Lab 2 the team keeps four templates on AUTO01, each with a saved sample, and the checker script says all four are wrong. Each template fails in a different way. You will follow one routine that works for any broken template, and see the exact commands and output of every fix.</p>

<h3>Analogy: the quality inspector's tag</h3>
<p>An inspector does not repaint the whole car when a door will not close. She reads the tag (the symptom), finds the part that matches, makes one repair and tests the door again. The symptom of a template is the number of rows, and each symptom points to a different part of the file.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Workflow: run the check, read the symptom, print the rows, compare with the sample, make one fix, rerun">
<rect x="8" y="30" width="96" height="70" rx="10" fill="#fecaca"/><text x="56" y="58" text-anchor="middle" class="svg-ink" font-size="12">1 Run check</text><text x="56" y="78" text-anchor="middle" class="svg-muted" font-size="10">which template?</text>
<rect x="112" y="30" width="96" height="70" rx="10" fill="#fde68a"/><text x="160" y="58" text-anchor="middle" class="svg-ink" font-size="12">2 Symptom</text><text x="160" y="78" text-anchor="middle" class="svg-muted" font-size="10">few, one, odd</text>
<rect x="216" y="30" width="96" height="70" rx="10" fill="#bae6fd"/><text x="264" y="58" text-anchor="middle" class="svg-ink" font-size="12">3 Print rows</text><text x="264" y="78" text-anchor="middle" class="svg-muted" font-size="10">what survived?</text>
<rect x="320" y="30" width="96" height="70" rx="10" fill="#ddd6fe"/><text x="368" y="58" text-anchor="middle" class="svg-ink" font-size="12">4 Compare</text><text x="368" y="78" text-anchor="middle" class="svg-muted" font-size="10">sample vs rule</text>
<rect x="424" y="30" width="96" height="70" rx="10" fill="#fed7aa"/><text x="472" y="58" text-anchor="middle" class="svg-ink" font-size="12">5 One fix</text><text x="472" y="78" text-anchor="middle" class="svg-muted" font-size="10">one change only</text>
<rect x="528" y="30" width="104" height="70" rx="10" fill="#bbf7d0"/><text x="580" y="58" text-anchor="middle" class="svg-ink" font-size="12">6 Rerun</text><text x="580" y="78" text-anchor="middle" class="svg-muted" font-size="10">all four again</text>
<line x1="104" y1="65" x2="112" y2="65" stroke="#64748b" stroke-width="2"/><line x1="208" y1="65" x2="216" y2="65" stroke="#64748b" stroke-width="2"/><line x1="312" y1="65" x2="320" y2="65" stroke="#64748b" stroke-width="2"/><line x1="416" y1="65" x2="424" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="528" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The same six steps for every template.</p></div>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Most likely cause</th><th>Where to look</th></tr>
<tr><td>Fewer rows than lines</td><td>A Value regex too narrow</td><td>The Value lines</td></tr>
<tr><td>Exactly one row</td><td>No <code>Record</code> action</td><td>The end of the rule</td></tr>
<tr><td>One item missing, no error</td><td>A line shape that no rule knows (a wrapped line)</td><td>The sample, around the missing item</td></tr>
<tr><td>TEMPLATE ERROR on loading</td><td>A name used but not defined, or bad syntax</td><td>The line number in the message</td></tr></table>

<h3>The checker</h3>
<p>The lab script <code>check_templates.py</code> runs each template over its sample and compares the number of rows with what a person counted:</p>
<pre class="code">import textfsm

CASES = [
    ("ipbrief.textfsm", "show_ip_int_br.txt", 5),
    ("vlan.textfsm", "show_vlan.txt", 4),
    ("cdp.textfsm", "show_cdp.txt", 3),
    ("version.textfsm", "show_version.txt", 1),
]

bad = 0
for tpl, raw, expected in CASES:
    try:
        with open(tpl) as t:
            fsm = textfsm.TextFSM(t)
    except textfsm.TextFSMTemplateError as err:
        print(f"{tpl:17} TEMPLATE ERROR: {err}")
        bad += 1
        continue
    with open(raw) as r:
        rows = fsm.ParseText(r.read())
    ok = len(rows) == expected
    print(f"{tpl:17} {len(rows)} rows (expected {expected})  {'ok' if ok else 'FAIL'}")
    bad += 0 if ok else 1

print("all templates ok" if bad == 0 else f"{bad} template(s) need fixing")</pre>
<pre class="out">AUTO01$ python3 check_templates.py
ipbrief.textfsm   3 rows (expected 5)  FAIL
vlan.textfsm      1 rows (expected 4)  FAIL
cdp.textfsm       2 rows (expected 3)  FAIL
<span class="hl">version.textfsm   TEMPLATE ERROR: Line 8 : Value IMAGE not defined</span>
<span class="hl">4 template(s) need fixing</span></pre>
<p>Task 1 answer: four. To look inside a template, use a tiny helper of your own, <code>show_rows.py</code>, that prints the rows (create it with a quoted heredoc, as in chapter 2). It is not one of the lab files:</p>
<pre class="code">import sys
import textfsm

with open(sys.argv[1]) as t:
    fsm = textfsm.TextFSM(t)
with open(sys.argv[2]) as r:
    for row in fsm.ParseText(r.read()):
        print(row)</pre>

<h3>Bug 1: ipbrief.textfsm returns 3 rows, not 5</h3>
<p>Print the survivors and compare them with the sample:</p>
<pre class="out">AUTO01$ python3 show_rows.py ipbrief.textfsm show_ip_int_br.txt
['GigabitEthernet0/0', '10.99.0.1', 'up', 'up']
['GigabitEthernet0/2', '192.0.2.1', 'up', 'up']
['Loopback0', '1.1.1.1', 'up', 'up']
AUTO01$ grep -n STATUS ipbrief.textfsm
<span class="hl">3:Value STATUS (up|down)</span>
7:  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record</pre>
<p>Only the interfaces with status <code>up</code> survived. The two missing ones, Gi0/1 and Gi0/3, are shut down, and their status is the two words "administratively down". <code>(up|down)</code> cannot match two words, so those lines matched no rule and were skipped silently. <b>Cause: a Value regex too narrow.</b> Allow the third form:</p>
<pre class="out">AUTO01$ sed -i 's/^Value STATUS (up|down)$/Value STATUS (up|down|administratively down)/' ipbrief.textfsm
AUTO01$ python3 check_templates.py
<span class="hl">ipbrief.textfsm   5 rows (expected 5)  ok</span>
vlan.textfsm      1 rows (expected 4)  FAIL
cdp.textfsm       2 rows (expected 3)  FAIL
version.textfsm   TEMPLATE ERROR: Line 8 : Value IMAGE not defined
3 template(s) need fixing</pre>

<h3>Bug 2: vlan.textfsm returns 1 row, not 4</h3>
<pre class="out">AUTO01$ python3 show_rows.py vlan.textfsm show_vlan.txt
<span class="hl">['99', 'MGMT', 'active']</span>
AUTO01$ cat vlan.textfsm
Value Required VLAN_ID (\\d+)
Value VLAN_NAME (\\S+)
Value STATUS (active|act/unsup)

Start
  ^&#36;{VLAN_ID}\\s+&#36;{VLAN_NAME}\\s+&#36;{STATUS}</pre>
<p>The rule matches all four VLAN lines, but it has no action. Every match overwrites the last, and only the final VLAN, <b>99</b>, survives through the implicit Record at the end (chapter 4). <b>Cause: a missing Record.</b> Append the action to the end of the rule:</p>
<pre class="out">AUTO01$ sed -i 's/STATUS}$/STATUS} -&gt; Record/' vlan.textfsm
AUTO01$ python3 show_rows.py vlan.textfsm show_vlan.txt
['1', 'default', 'active']
['10', 'USERS', 'active']
['20', 'VOICE', 'active']
['99', 'MGMT', 'active']</pre>

<h3>Bug 3: cdp.textfsm finds 2 neighbours, not 3, with no error</h3>
<pre class="out">AUTO01$ cat show_cdp.txt
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
BLR-EDGE-R2      Gig 0/1           150        R B         ISR4331   Gig 0/0
<span class="hl">HYD-EDGE-R3.nk.lab</span>
<span class="hl">                 Gig 0/2           143        R B         ISR4331   Gig 0/0</span>
PUN-ACC-SW1      Gig 0/3           170        S I         WS-C3850  Gig 1/0/24

Total cdp entries displayed : 3
AUTO01$ python3 show_rows.py cdp.textfsm show_cdp.txt
['BLR-EDGE-R2', 'Gig 0/1', 'ISR4331', 'Gig 0/0']
['PUN-ACC-SW1', 'Gig 0/3', 'WS-C3850', 'Gig 1/0/24']</pre>
<p>The header says 3 entries, the template found 2. No Value is too narrow here. The long name <code>HYD-EDGE-R3.nk.lab</code> does not fit in the Device ID column, so CDP prints it <b>alone on one line</b> and moves all the other data to the <b>next line</b>, starting with spaces. The single rule expects name and data on the same line, so neither line matches. <b>Cause: a line shape that no rule knows.</b> The fix is two new rules in the <code>Neighbors</code> state, the same technique as in chapter 8:</p>
<pre class="code">cat &gt;&gt; cdp.textfsm &lt;&lt;'EOF'
  ^&#36;{NEIGHBOR}\\s*$$
  ^\\s+&#36;{LOCAL_INTF}\\s+\\d+\\s+[A-Za-z]( [A-Za-z])*\\s+&#36;{PLATFORM}\\s+&#36;{PORT_ID}\\s*$$ -&gt; Record
EOF</pre>
<ul>
<li>The first rule stores a name that is alone on its line. It has no action, so nothing is saved yet.</li>
<li>The second rule starts with <code>\\s+</code>, so it matches only the indented continuation line. It stores the interface, platform and port and records the row. NEIGHBOR still holds the name from the line above.</li>
<li>The first, original rule keeps working for the normal one-line entries, because rules in a state are tried from top to bottom.</li>
</ul>
<pre class="out">AUTO01$ python3 show_rows.py cdp.textfsm show_cdp.txt
['BLR-EDGE-R2', 'Gig 0/1', 'ISR4331', 'Gig 0/0']
<span class="hl">['HYD-EDGE-R3.nk.lab', 'Gig 0/2', 'ISR4331', 'Gig 0/0']</span>
['PUN-ACC-SW1', 'Gig 0/3', 'WS-C3850', 'Gig 1/0/24']</pre>

<h3>Bug 4: version.textfsm will not load</h3>
<p>The checker already told us: <code>TEMPLATE ERROR: Line 8 : Value IMAGE not defined</code>. The message names the line and the missing name. Line 8 is the rule <code>^System image file is &#36;{IMAGE}</code>; it uses a Value that has no <code>Value</code> line at the top. <b>Cause: an undeclared Value.</b> That is Task 5's answer, <code>IMAGE</code>. Declare it above the <code>Start</code> state. The sed command <code>1i</code> inserts a line before line 1 (the lab also has its own <code>insert</code> helper, which is not a standard Linux command):</p>
<pre class="out">AUTO01$ sed -i '1i Value IMAGE ([^ ]+)' version.textfsm
AUTO01$ python3 show_rows.py version.textfsm show_version.txt
['"flash:/isr4300-universalk9.bin"', '15.9(3)M4', 'PUN-CORE-R1', '2 weeks, 3 days, 4 hours, 12 minutes']
AUTO01$ python3 check_templates.py
ipbrief.textfsm   5 rows (expected 5)  ok
vlan.textfsm      4 rows (expected 4)  ok
cdp.textfsm       3 rows (expected 3)  ok
version.textfsm   1 rows (expected 1)  ok
<span class="hl">all templates ok</span></pre>
<p>The new Value went on the first line, so it is the first column of the row. A template for a command that prints one thing (one version, one uptime) needs no <code>Record</code> at all: the implicit Record at the end of the text saves the single row.</p>

<div class="eg"><p><b>Worked example.</b> After bug 3 you wonder whether the fix could break the other neighbours. It cannot, and the proof is the checker: rerun all four. Always rerun everything after a fix. One run shows every template at once.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing two things at once, so you do not know which one worked. Editing the template to make the count match without understanding the cause (for example loosening a Value until junk is accepted). Trusting an exit code: <code>check_templates.py</code> prints a verdict but exits with 0 even when it fails, so read the last line, or add <code>sys.exit(1)</code> for cron.</p></div>
<div class="exam"><p><b>Exam trap.</b> A template with a wrapped line does not raise an error; it loses the entry quietly. A missing Record gives one row, the last one. "Value X not defined" is a load-time error with a line number.</p></div>

<div class="scn"><h4>The router with the long name</h4><p>An inventory of CDP neighbours always lacked one branch router. All the others were there. The router's hostname with the domain was longer than the Device ID column, so CDP wrapped its entry onto two lines. The two-rule fix added the router, and the sample with the long name was added to the test folder so it could never be forgotten again.</p><p><b>Lesson:</b> when one item is always missing, look at the lines around it in the raw text, not at the regex.</p></div>

<div class="iv"><p class="q">"A TextFSM template returns one row instead of many. What happened?"</p><p>The rule has no Record action. Every match overwrites the previous values and only the last survives through the implicit Record at the end. I add -&gt; Record to the rule. If rows are missing instead, I check regex width; if one entry is missing, I look for a wrapped line in the raw text.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Few rows: Value regex too narrow. One row: missing <code>Record</code>. One missing item: unknown line shape. Load error: undefined name.</li>
<li>Print the rows that survive and compare them with the sample.</li>
<li>Make one fix at a time and rerun all templates.</li>
<li>A TEMPLATE ERROR message gives the line number and the name.</li>
<li>Add the odd sample to your test folder after you fix it.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> Lab 2 mein team ke paas AUTO01 par chaar templates hain, har ek ke saath saved sample, aur checker script kehti hai ki chaaron galat hain. Har template alag tarah se fail hota hai. Aap ek aisa routine follow karoge jo kisi bhi toote template par chalta hai, aur har fix ke exact commands aur output dekhoge.</p>

<h3>Analogy: quality inspector ka tag</h3>
<p>Inspector poori gaadi dobara paint nahi karti jab ek darwaza band nahi hota. Woh tag (symptom) padhti hai, matching part dhoondhti hai, ek repair karti hai aur darwaza dobara test karti hai. Template ka symptom rows ki ginti hai, aur har symptom file ke alag hisse ki taraf ishara karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Workflow: check chalao, symptom padho, rows print karo, sample se compare karo, ek fix karo, dobara chalao">
<rect x="8" y="30" width="96" height="70" rx="10" fill="#fecaca"/><text x="56" y="58" text-anchor="middle" class="svg-ink" font-size="12">1 Check chalao</text><text x="56" y="78" text-anchor="middle" class="svg-muted" font-size="10">kaunsa template?</text>
<rect x="112" y="30" width="96" height="70" rx="10" fill="#fde68a"/><text x="160" y="58" text-anchor="middle" class="svg-ink" font-size="12">2 Symptom</text><text x="160" y="78" text-anchor="middle" class="svg-muted" font-size="10">kam, ek, ajeeb</text>
<rect x="216" y="30" width="96" height="70" rx="10" fill="#bae6fd"/><text x="264" y="58" text-anchor="middle" class="svg-ink" font-size="12">3 Rows dekho</text><text x="264" y="78" text-anchor="middle" class="svg-muted" font-size="10">kaunsi bachi?</text>
<rect x="320" y="30" width="96" height="70" rx="10" fill="#ddd6fe"/><text x="368" y="58" text-anchor="middle" class="svg-ink" font-size="12">4 Compare</text><text x="368" y="78" text-anchor="middle" class="svg-muted" font-size="10">sample vs rule</text>
<rect x="424" y="30" width="96" height="70" rx="10" fill="#fed7aa"/><text x="472" y="58" text-anchor="middle" class="svg-ink" font-size="12">5 Ek fix</text><text x="472" y="78" text-anchor="middle" class="svg-muted" font-size="10">sirf ek badlav</text>
<rect x="528" y="30" width="104" height="70" rx="10" fill="#bbf7d0"/><text x="580" y="58" text-anchor="middle" class="svg-ink" font-size="12">6 Dobara</text><text x="580" y="78" text-anchor="middle" class="svg-muted" font-size="10">chaaron phir se</text>
<line x1="104" y1="65" x2="112" y2="65" stroke="#64748b" stroke-width="2"/><line x1="208" y1="65" x2="216" y2="65" stroke="#64748b" stroke-width="2"/><line x1="312" y1="65" x2="320" y2="65" stroke="#64748b" stroke-width="2"/><line x1="416" y1="65" x2="424" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="528" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har template ke liye wahi chhe steps.</p></div>

<h3>Symptom se wajah tak</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sabse sambhavit wajah</th><th>Kahan dekho</th></tr>
<tr><td>Lines se kam rows</td><td>Value regex bahut narrow</td><td>Value lines</td></tr>
<tr><td>Theek ek row</td><td><code>Record</code> action nahi</td><td>Rule ka ant</td></tr>
<tr><td>Ek item gayab, koi error nahi</td><td>Aisi line shape jo kisi rule ko nahi pata (wrapped line)</td><td>Sample, gayab item ke aas-paas</td></tr>
<tr><td>Loading par TEMPLATE ERROR</td><td>Naam use hua par define nahi, ya galat syntax</td><td>Message ka line number</td></tr></table>

<h3>Checker</h3>
<p>Lab script <code>check_templates.py</code> har template ko uske sample par chalati hai aur rows ki ginti ko insaan ki ginti se milati hai:</p>
<pre class="code">import textfsm

CASES = [
    ("ipbrief.textfsm", "show_ip_int_br.txt", 5),
    ("vlan.textfsm", "show_vlan.txt", 4),
    ("cdp.textfsm", "show_cdp.txt", 3),
    ("version.textfsm", "show_version.txt", 1),
]

bad = 0
for tpl, raw, expected in CASES:
    try:
        with open(tpl) as t:
            fsm = textfsm.TextFSM(t)
    except textfsm.TextFSMTemplateError as err:
        print(f"{tpl:17} TEMPLATE ERROR: {err}")
        bad += 1
        continue
    with open(raw) as r:
        rows = fsm.ParseText(r.read())
    ok = len(rows) == expected
    print(f"{tpl:17} {len(rows)} rows (expected {expected})  {'ok' if ok else 'FAIL'}")
    bad += 0 if ok else 1

print("all templates ok" if bad == 0 else f"{bad} template(s) need fixing")</pre>
<pre class="out">AUTO01$ python3 check_templates.py
ipbrief.textfsm   3 rows (expected 5)  FAIL
vlan.textfsm      1 rows (expected 4)  FAIL
cdp.textfsm       2 rows (expected 3)  FAIL
<span class="hl">version.textfsm   TEMPLATE ERROR: Line 8 : Value IMAGE not defined</span>
<span class="hl">4 template(s) need fixing</span></pre>
<p>Task 1 ka jawab: chaar. Template ke andar dekhne ke liye apna chhota helper <code>show_rows.py</code> use karo jo rows print karta hai (ise chapter 2 ki tarah quoted heredoc se banao). Yeh lab ki files mein nahi hai:</p>
<pre class="code">import sys
import textfsm

with open(sys.argv[1]) as t:
    fsm = textfsm.TextFSM(t)
with open(sys.argv[2]) as r:
    for row in fsm.ParseText(r.read()):
        print(row)</pre>

<h3>Bug 1: ipbrief.textfsm 5 ki jagah 3 rows deta hai</h3>
<p>Bachi hui rows print karo aur sample se compare karo:</p>
<pre class="out">AUTO01$ python3 show_rows.py ipbrief.textfsm show_ip_int_br.txt
['GigabitEthernet0/0', '10.99.0.1', 'up', 'up']
['GigabitEthernet0/2', '192.0.2.1', 'up', 'up']
['Loopback0', '1.1.1.1', 'up', 'up']
AUTO01$ grep -n STATUS ipbrief.textfsm
<span class="hl">3:Value STATUS (up|down)</span>
7:  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record</pre>
<p>Sirf wohi interfaces bache jinka status <code>up</code> hai. Gayab do, Gi0/1 aur Gi0/3, shut down hain, aur unka status do shabd "administratively down" hai. <code>(up|down)</code> do shabd match nahi kar sakta, isliye woh lines kisi rule se match nahi hui aur chupchaap skip ho gayi. <b>Wajah: Value regex bahut narrow.</b> Teesra roop allow karo:</p>
<pre class="out">AUTO01$ sed -i 's/^Value STATUS (up|down)$/Value STATUS (up|down|administratively down)/' ipbrief.textfsm
AUTO01$ python3 check_templates.py
<span class="hl">ipbrief.textfsm   5 rows (expected 5)  ok</span>
vlan.textfsm      1 rows (expected 4)  FAIL
cdp.textfsm       2 rows (expected 3)  FAIL
version.textfsm   TEMPLATE ERROR: Line 8 : Value IMAGE not defined
3 template(s) need fixing</pre>

<h3>Bug 2: vlan.textfsm 4 ki jagah 1 row deta hai</h3>
<pre class="out">AUTO01$ python3 show_rows.py vlan.textfsm show_vlan.txt
<span class="hl">['99', 'MGMT', 'active']</span>
AUTO01$ cat vlan.textfsm
Value Required VLAN_ID (\\d+)
Value VLAN_NAME (\\S+)
Value STATUS (active|act/unsup)

Start
  ^&#36;{VLAN_ID}\\s+&#36;{VLAN_NAME}\\s+&#36;{STATUS}</pre>
<p>Rule chaaron VLAN lines ko match karta hai, par uska koi action nahi. Har match pichhle ko overwrite karta hai, aur sirf aakhri VLAN, <b>99</b>, ant ke implicit Record se bachti hai (chapter 4). <b>Wajah: Record missing.</b> Rule ke ant mein action jodo:</p>
<pre class="out">AUTO01$ sed -i 's/STATUS}$/STATUS} -&gt; Record/' vlan.textfsm
AUTO01$ python3 show_rows.py vlan.textfsm show_vlan.txt
['1', 'default', 'active']
['10', 'USERS', 'active']
['20', 'VOICE', 'active']
['99', 'MGMT', 'active']</pre>

<h3>Bug 3: cdp.textfsm 3 ki jagah 2 neighbours dhoondta hai, bina error ke</h3>
<pre class="out">AUTO01$ cat show_cdp.txt
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
BLR-EDGE-R2      Gig 0/1           150        R B         ISR4331   Gig 0/0
<span class="hl">HYD-EDGE-R3.nk.lab</span>
<span class="hl">                 Gig 0/2           143        R B         ISR4331   Gig 0/0</span>
PUN-ACC-SW1      Gig 0/3           170        S I         WS-C3850  Gig 1/0/24

Total cdp entries displayed : 3
AUTO01$ python3 show_rows.py cdp.textfsm show_cdp.txt
['BLR-EDGE-R2', 'Gig 0/1', 'ISR4331', 'Gig 0/0']
['PUN-ACC-SW1', 'Gig 0/3', 'WS-C3850', 'Gig 1/0/24']</pre>
<p>Header kehta hai 3 entries, template ko 2 mili. Yahan koi Value narrow nahi hai. Lamba naam <code>HYD-EDGE-R3.nk.lab</code> Device ID column mein nahi aata, isliye CDP use <b>akela ek line par</b> print karta hai aur baaki saara data <b>agli line par</b> le jaata hai, jo spaces se shuru hoti hai. Ek akela rule naam aur data ek hi line par maangta hai, isliye dono lines match nahi hoti. <b>Wajah: aisi line shape jo kisi rule ko nahi pata.</b> Fix <code>Neighbors</code> state mein do naye rules hain, wahi technique jo chapter 8 mein thi:</p>
<pre class="code">cat &gt;&gt; cdp.textfsm &lt;&lt;'EOF'
  ^&#36;{NEIGHBOR}\\s*$$
  ^\\s+&#36;{LOCAL_INTF}\\s+\\d+\\s+[A-Za-z]( [A-Za-z])*\\s+&#36;{PLATFORM}\\s+&#36;{PORT_ID}\\s*$$ -&gt; Record
EOF</pre>
<ul>
<li>Pehla rule woh naam store karta hai jo line par akela hai. Isme koi action nahi, isliye abhi kuch save nahi hota.</li>
<li>Doosra rule <code>\\s+</code> se shuru hota hai, isliye sirf indented continuation line match karta hai. Woh interface, platform aur port store karta hai aur row record karta hai. NEIGHBOR mein upar ki line ka naam abhi bhi hai.</li>
<li>Pehla, original rule normal ek-line entries ke liye chalta rehta hai, kyunki state ke rules upar se neeche try hote hain.</li>
</ul>
<pre class="out">AUTO01$ python3 show_rows.py cdp.textfsm show_cdp.txt
['BLR-EDGE-R2', 'Gig 0/1', 'ISR4331', 'Gig 0/0']
<span class="hl">['HYD-EDGE-R3.nk.lab', 'Gig 0/2', 'ISR4331', 'Gig 0/0']</span>
['PUN-ACC-SW1', 'Gig 0/3', 'WS-C3850', 'Gig 1/0/24']</pre>

<h3>Bug 4: version.textfsm load hi nahi hota</h3>
<p>Checker pehle hi bata chuka hai: <code>TEMPLATE ERROR: Line 8 : Value IMAGE not defined</code>. Message line aur gayab naam batata hai. Line 8 rule <code>^System image file is &#36;{IMAGE}</code> hai; woh aisi Value use karta hai jiski upar <code>Value</code> line nahi hai. <b>Wajah: undeclared Value.</b> Yahi Task 5 ka jawab hai, <code>IMAGE</code>. Use <code>Start</code> state ke upar declare karo. sed ka <code>1i</code> line 1 se pehle ek line daalta hai (lab ka apna <code>insert</code> helper bhi hai, jo standard Linux command nahi hai):</p>
<pre class="out">AUTO01$ sed -i '1i Value IMAGE ([^ ]+)' version.textfsm
AUTO01$ python3 show_rows.py version.textfsm show_version.txt
['"flash:/isr4300-universalk9.bin"', '15.9(3)M4', 'PUN-CORE-R1', '2 weeks, 3 days, 4 hours, 12 minutes']
AUTO01$ python3 check_templates.py
ipbrief.textfsm   5 rows (expected 5)  ok
vlan.textfsm      4 rows (expected 4)  ok
cdp.textfsm       3 rows (expected 3)  ok
version.textfsm   1 rows (expected 1)  ok
<span class="hl">all templates ok</span></pre>
<p>Nayi Value pehli line par gayi, isliye woh row ka pehla column hai. Jo command ek hi cheez print karti hai (ek version, ek uptime) uske template ko <code>Record</code> ki zaroorat hi nahi: text ke ant ka implicit Record ek row save kar deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Bug 3 ke baad aap sochte ho ki kya fix baaki neighbours ko tod sakta hai. Nahi, aur saboot checker hai: chaaron dobara chalao. Fix ke baad hamesha sab kuch dobara chalao. Ek run har template ek saath dikha deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Do cheezein ek saath badalna, isliye pata nahi chalta kaunsi kaam aayi. Wajah samjhe bina count milane ke liye template badalna (jaise Value ko itna loose karna ki junk bhi accept ho). Exit code par bharosa karna: <code>check_templates.py</code> verdict print karti hai par fail hone par bhi 0 se nikalti hai, isliye aakhri line padho, ya cron ke liye <code>sys.exit(1)</code> jodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Wrapped line wala template error nahi uthata; woh entry chupchaap kho deta hai. Missing Record ek row deta hai, aakhri wali. "Value X not defined" line number ke saath load-time error hai.</p></div>

<div class="scn"><h4>Lambe naam wala router</h4><p>CDP neighbours ki inventory mein hamesha ek branch router kam rehta tha. Baaki sab the. Router ka domain ke saath hostname Device ID column se lamba tha, isliye CDP ne uski entry do lines mein wrap kar di. Do-rule fix ne router jod diya, aur lambe naam wala sample test folder mein daala gaya taaki use kabhi bhulaya na ja sake.</p><p><b>Lesson:</b> jab ek item hamesha gayab ho, raw text mein uske aas-paas ki lines dekho, regex nahi.</p></div>

<div class="iv"><p class="q">"TextFSM template bahut rows ki jagah ek row deta hai. Kya hua?"</p><p>Rule mein Record action nahi hai. Har match pichhli values ko overwrite karta hai aur sirf aakhri ant ke implicit Record se bachti hai. Main rule mein -&gt; Record jodta hoon. Agar rows kam hon to regex ki width check karta hoon; agar ek entry gayab ho to raw text mein wrapped line dhoondta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kam rows: Value regex narrow. Ek row: <code>Record</code> missing. Ek item gayab: anjaan line shape. Load error: undefined naam.</li>
<li>Jo rows bachti hain unhe print karo aur sample se compare karo.</li>
<li>Ek-ek fix karo aur saare templates dobara chalao.</li>
<li>TEMPLATE ERROR message line number aur naam deta hai.</li>
<li>Fix karne ke baad ajeeb sample ko apne test folder mein jodo.</li>
</ul></div>
`}};export{e as default};