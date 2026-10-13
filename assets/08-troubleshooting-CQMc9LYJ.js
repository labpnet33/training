var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: when parsing returns nothing or the wrong thing`,hi:`Troubleshooting workflow: jab parsing kuch nahi ya galat deti hai`},body:{en:`
<p>Parsing failures come in two kinds. The loud kind stops the script with a traceback. The quiet kind is worse: the script finishes, but the data is wrong or incomplete. This chapter gives one workflow for both kinds, using the lab mistakes as examples. It works for <code>split()</code>, regular expressions and parsers.</p>
<h3>The five-step workflow</h3>
<ol>
<li><b>Read the last line</b> of the traceback. The exception class tells you what kind of mismatch happened.</li>
<li><b>Look at the raw text</b> exactly as the script sees it, not as the terminal shows it.</li>
<li><b>Test one line and one pattern</b> on their own, in a few lines of code.</li>
<li><b>Fix one thing</b> and run again on <b>all</b> devices, because the second router may differ from the first.</li>
<li><b>Add a check</b> so that the next failure is loud and names the device.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="From traceback to fix"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Exception</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">last line</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Raw text</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">print repr</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">One line</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">test alone</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Fix and re-run</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">all devices</text></svg><p class="cap">From traceback to fix</p></div>
<h3>Step 1: what each exception is telling you</h3>
<table class="cmp"><tr><th>Exception</th><th>Typical cause in parsing</th><th>Where to look</th></tr><tr><td><code>AttributeError: 'NoneType' ... 'group'</code></td><td><code>re.search</code> found nothing, so <code>.group</code> was called on None</td><td>The pattern against the real text; case</td></tr><tr><td><code>KeyError: 'interface'</code></td><td>The dictionary has no such key; it is empty or has another shape</td><td>What <code>parse</code> returned; was it assigned?</td></tr><tr><td><code>IndexError: list index out of range</code></td><td>A line has fewer words than the position you asked for</td><td>Blank lines, headings, short rows</td></tr><tr><td><code>ValueError</code></td><td>Text where a number or a fixed count of words was expected</td><td>The row that carries a two-word value</td></tr></table>
<p>Here is each one, produced on purpose, with the real message:</p>
<pre class="code">import re

line = "GigabitEthernet0/3 unassigned YES unset administratively down down"
parts = line.split()

try:
    re.search(r"version (\\S+),", "Version 2.0, RELEASE SOFTWARE").group(1)
except AttributeError as e:
    print("AttributeError:", e)

try:
    print(parts[9])
except IndexError as e:
    print("IndexError:", e)

try:
    data = {"interface": {}}
    print(data["interfaces"])
except KeyError as e:
    print("KeyError:", e)

try:
    int(parts[1])
except ValueError as e:
    print("ValueError:", e)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">AttributeError: 'NoneType' object has no attribute 'group'
IndexError: list index out of range
KeyError: 'interfaces'
ValueError: invalid literal for int() with base 10: 'unassigned'</pre>
<h3>Step 2: see the real characters</h3>
<p>The terminal hides what a script sees: trailing spaces, tabs and a stray carriage return (<code>\\r</code>) at the end of a line. <code>repr()</code> prints a value with all of them visible. Notice the trailing spaces and the <code>\\r</code> in the first line, and how <code>split()</code> and <code>strip()</code> remove them:</p>
<pre class="code">line = "Loopback0   1.1.1.1   YES manual up   up   \\r"
print(repr(line))
print(line.split())
print(repr(line.strip()))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">'Loopback0   1.1.1.1   YES manual up   up   \\r'
['Loopback0', '1.1.1.1', 'YES', 'manual', 'up', 'up']
'Loopback0   1.1.1.1   YES manual up   up'</pre>
<p><code>split()</code> with no argument ignores the extra spaces and the <code>\\r</code>, which is another reason to never write <code>split(" ")</code>. Whenever a pattern "should match but does not", <code>print(repr(text))</code> is the first debugging step.</p>
<h3>Step 3: test in isolation</h3>
<p>Do not debug a pattern inside a loop over three routers. Copy <b>one</b> line of real output into a variable and try the pattern on it. Print what each group gives. Change one thing at a time.</p>
<p>In lab 1, the fault was not in the loop at all. <code>up2.py</code> started with <code>data = {}</code>, so the dictionary was empty and the first access stopped with this real traceback:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
output = conn.send_command("show ip interface brief")
conn.disconnect()

data = {}
for intf, info in data["interface"].items():
    print(intf)</pre><p><i>Run in the lab terminal (it uses the lab routers). Output captured from the simulator.</i></p><pre class="out">Traceback (most recent call last):
  File "keyerr.py", line 8, in &lt;module&gt;
    for intf, info in data["interface"].items():
KeyError: 'interface'</pre>
<p>The last line, <code>KeyError: 'interface'</code>, says: the key is missing. The fix was one line: <code>data = parse("show ip interface brief", output)</code>. In lab 2 the last line was <code>AttributeError</code>, and one letter, <code>v</code> against <code>V</code>, was the cause.</p>
<h3>Step 4: quiet failures need checks</h3>
<p>A script that prints a report with an empty column does not crash, and nobody knows. Make the script <b>check its own result</b>. This helper reports empty values and placeholders instead of hiding them:</p>
<pre class="code">def check_rows(rows, expected_min):
    problems = []
    if len(rows) &lt; expected_min:
        problems.append(f"only {len(rows)} rows, expected at least {expected_min}")
    for r in rows:
        for key, value in r.items():
            if value == "" or value == "TODO":
                problems.append(f"{r['hostname']}: empty or TODO in {key}")
    return problems

rows = [
    {"hostname": "BLR-CORE", "version": "2.0", "serial": "NK3C15U4X00"},
    {"hostname": "BLR-WAN", "version": "", "serial": "TODO"},
]
for p in check_rows(rows, 3):
    print(p)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">only 2 rows, expected at least 3
BLR-WAN: empty or TODO in version
BLR-WAN: empty or TODO in serial</pre>
<p>Notice that the message names the <b>device</b> and the <b>column</b>, so the engineer who reads it knows where to look. The same idea applies to parser output: check that <code>data["interface"]</code> is not empty before you trust a report that says "no interfaces are up".</p>
<h3>A safe helper, used carefully</h3>
<p>You can wrap <code>re.search</code> so that a missing match returns a default instead of crashing. This is convenient, but it <b>hides</b> bugs, because a wrong pattern now produces a quiet <code>not found</code>. Count the defaults and report them.</p>
<pre class="code">import re

def grab(pattern, text, default="not found"):
    m = re.search(pattern, text)
    return m.group(1) if m else default

text = "BLR-CORE uptime is 0 minutes\\nProcessor board ID NK3C15U4X00"
found = [grab(r"Version (\\S+),", text), grab(r"Processor board ID (\\S+)", text)]
print(found)
print("Missing values:", found.count("not found"))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">['not found', 'NK3C15U4X00']
Missing values: 1</pre>
<div class="warn"><p><b>Common mistakes.</b> (1) Debugging by changing three things at once. (2) Testing on one router and assuming all are the same. (3) Wrapping everything in <code>try</code> with <code>pass</code>, which turns a loud failure into silent wrong data. (4) Trusting the terminal view instead of <code>repr()</code>. (5) Ending the fix without re-running the whole script.</p></div>
<div class="exam"><p><b>Exam trap.</b> A script that exits without an error is not proof that the result is correct. Questions often ask for the <b>first</b> check: read the exception, then look at the raw input.</p></div>
<div class="scn"><h4>The report that said nothing was wrong</h4><p>A nightly script listed interfaces that were down and mailed the list. For a month the mail was empty, which everybody read as good news. After a software upgrade the heading text had changed, the pattern matched nothing, and the loop quietly ran zero times. A new check made the script fail if it parsed fewer than one interface per router.</p>
<p><b>Lesson:</b> an empty result needs a reason; check that the parse produced data before you trust a negative.</p></div>
<div class="iv"><p class="q">"A parsing script crashes with an AttributeError on NoneType. How do you troubleshoot it?"</p><p>That means re.search returned None, so the pattern did not match the real text. I print repr of the raw output, copy one line into a small test, and compare it with the pattern, checking case, spaces and labels. After fixing it I run the script against every device, and I add a check so that a missing match reports the device name instead of crashing or going quiet.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The exception class shows the mismatch: None, missing key, short row, wrong type.</li>
<li><code>repr()</code> shows the characters a script really receives.</li>
<li>Test one line and one pattern alone, then re-run on every device.</li>
<li>Quiet failures are worse than crashes; add checks for empty and placeholder values.</li>
<li>A default value hides bugs unless you count and report it.</li>
</ul></div>
`,hi:`
<p>Parsing failures do tarah ke hote hain. Loud wala script ko traceback ke saath rok deta hai. Quiet wala zyada bura hai: script khatam ho jaati hai, par data galat ya adhoora hota hai. Yeh chapter dono ke liye ek workflow deta hai, lab ki galtiyon ko examples bana kar. Yeh <code>split()</code>, regular expressions aur parsers sab ke liye kaam karta hai.</p>
<h3>Paanch step ka workflow</h3>
<ol>
<li>Traceback ki <b>aakhri line</b> padho. Exception class batati hai ki kis tarah ka mismatch hua.</li>
<li><b>Raw text</b> waisa dekho jaisa script dekhti hai, jaisa terminal dikhata hai waisa nahi.</li>
<li><b>Ek line aur ek pattern</b> ko akele, kuch lines ke code mein test karo.</li>
<li><b>Ek cheez fix karo</b> aur <b>sab</b> devices par dobara chalao, kyunki doosra router pehle se alag ho sakta hai.</li>
<li><b>Check jodo</b> taaki agli failure loud ho aur device ka naam bataye.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Traceback se fix tak"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Exception</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">aakhri line</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Raw text</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">print repr</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Ek line</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">akele test</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Fix aur re-run</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">sab devices</text></svg><p class="cap">Traceback se fix tak</p></div>
<h3>Step 1: har exception kya keh rahi hai</h3>
<table class="cmp"><tr><th>Exception</th><th>Parsing mein aam wajah</th><th>Kahan dekhein</th></tr><tr><td><code>AttributeError: 'NoneType' ... 'group'</code></td><td><code>re.search</code> ko kuch nahi mila, isliye None par <code>.group</code> bula li</td><td>Asli text ke saamne pattern; case</td></tr><tr><td><code>KeyError: 'interface'</code></td><td>Dictionary mein woh key nahi; woh khaali hai ya shape alag hai</td><td><code>parse</code> ne kya return kiya; assign hua?</td></tr><tr><td><code>IndexError: list index out of range</code></td><td>Line mein utne words nahi jitni position maangi</td><td>Blank lines, headings, chhoti rows</td></tr><tr><td><code>ValueError</code></td><td>Jahan number ya fixed words chahiye the wahan text</td><td>Woh row jisme do-shabd value hai</td></tr></table>
<p>Yeh rahi har ek, jaanbujh kar banayi hui, asli message ke saath:</p>
<pre class="code">import re

line = "GigabitEthernet0/3 unassigned YES unset administratively down down"
parts = line.split()

try:
    re.search(r"version (\\S+),", "Version 2.0, RELEASE SOFTWARE").group(1)
except AttributeError as e:
    print("AttributeError:", e)

try:
    print(parts[9])
except IndexError as e:
    print("IndexError:", e)

try:
    data = {"interface": {}}
    print(data["interfaces"])
except KeyError as e:
    print("KeyError:", e)

try:
    int(parts[1])
except ValueError as e:
    print("ValueError:", e)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">AttributeError: 'NoneType' object has no attribute 'group'
IndexError: list index out of range
KeyError: 'interfaces'
ValueError: invalid literal for int() with base 10: 'unassigned'</pre>
<h3>Step 2: asli characters dekho</h3>
<p>Terminal woh chhupa leta hai jo script dekhti hai: trailing spaces, tabs aur line ke end ka stray carriage return (<code>\\r</code>). <code>repr()</code> value ko un sab ke saath dikhata hai. Pehli line mein trailing spaces aur <code>\\r</code> dekho, aur dekho ki <code>split()</code> aur <code>strip()</code> unhe kaise hata dete hain:</p>
<pre class="code">line = "Loopback0   1.1.1.1   YES manual up   up   \\r"
print(repr(line))
print(line.split())
print(repr(line.strip()))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">'Loopback0   1.1.1.1   YES manual up   up   \\r'
['Loopback0', '1.1.1.1', 'YES', 'manual', 'up', 'up']
'Loopback0   1.1.1.1   YES manual up   up'</pre>
<p>Bina argument ka <code>split()</code> extra spaces aur <code>\\r</code> ko ignore karta hai, jo <code>split(" ")</code> kabhi na likhne ki ek aur wajah hai. Jab bhi pattern "match hona chahiye par nahi hota", <code>print(repr(text))</code> pehla debugging step hai.</p>
<h3>Step 3: akele mein test karo</h3>
<p>Teen routers ke loop ke andar pattern debug mat karo. Asli output ki <b>ek</b> line variable mein copy karo aur us par pattern try karo. Har group kya deta hai print karo. Ek baar mein ek cheez badlo.</p>
<p>Lab 1 mein galti loop mein thi hi nahi. <code>up2.py</code> <code>data = {}</code> se shuru hoti thi, isliye dictionary khaali thi aur pehla access is asli traceback ke saath ruka:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
output = conn.send_command("show ip interface brief")
conn.disconnect()

data = {}
for intf, info in data["interface"].items():
    print(intf)</pre><p><i>Lab terminal mein chalaya (lab routers use hote hain). Output simulator se liya gaya.</i></p><pre class="out">Traceback (most recent call last):
  File "keyerr.py", line 8, in &lt;module&gt;
    for intf, info in data["interface"].items():
KeyError: 'interface'</pre>
<p>Aakhri line, <code>KeyError: 'interface'</code>, kehti hai: key missing hai. Fix ek line ka tha: <code>data = parse("show ip interface brief", output)</code>. Lab 2 mein aakhri line <code>AttributeError</code> thi, aur wajah ek akshar tha, <code>v</code> ki jagah <code>V</code>.</p>
<h3>Step 4: quiet failures ko checks chahiye</h3>
<p>Jo script khaali column wali report print kare woh crash nahi hoti, aur kisi ko pata nahi chalta. Script se <b>apna result khud check</b> karwao. Yeh helper khaali values aur placeholders ko chhupane ki jagah report karta hai:</p>
<pre class="code">def check_rows(rows, expected_min):
    problems = []
    if len(rows) &lt; expected_min:
        problems.append(f"only {len(rows)} rows, expected at least {expected_min}")
    for r in rows:
        for key, value in r.items():
            if value == "" or value == "TODO":
                problems.append(f"{r['hostname']}: empty or TODO in {key}")
    return problems

rows = [
    {"hostname": "BLR-CORE", "version": "2.0", "serial": "NK3C15U4X00"},
    {"hostname": "BLR-WAN", "version": "", "serial": "TODO"},
]
for p in check_rows(rows, 3):
    print(p)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">only 2 rows, expected at least 3
BLR-WAN: empty or TODO in version
BLR-WAN: empty or TODO in serial</pre>
<p>Dhyaan do ki message <b>device</b> aur <b>column</b> ka naam batata hai, taaki padhne wala engineer jaane kahan dekhna hai. Wahi idea parser output par lagta hai: "koi interface up nahi" wali report par bharosa karne se pehle check karo ki <code>data["interface"]</code> khaali nahi hai.</p>
<h3>Safe helper, dhyaan se</h3>
<p><code>re.search</code> ko aise wrap kar sakte ho ki match na mile to crash ki jagah default mile. Yeh suvidha wala hai, par bugs ko <b>chhupa</b> deta hai, kyunki galat pattern ab chupchaap <code>not found</code> deta hai. Defaults ginte raho aur report karo.</p>
<pre class="code">import re

def grab(pattern, text, default="not found"):
    m = re.search(pattern, text)
    return m.group(1) if m else default

text = "BLR-CORE uptime is 0 minutes\\nProcessor board ID NK3C15U4X00"
found = [grab(r"Version (\\S+),", text), grab(r"Processor board ID (\\S+)", text)]
print(found)
print("Missing values:", found.count("not found"))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">['not found', 'NK3C15U4X00']
Missing values: 1</pre>
<div class="warn"><p><b>Common mistakes.</b> (1) Ek saath teen cheezein badal kar debug karna. (2) Ek router par test karke maan lena ki sab same hain. (3) Sab kuch <code>try</code> aur <code>pass</code> mein lapet dena, jo loud failure ko chupchaap galat data bana deta hai. (4) <code>repr()</code> ki jagah terminal view par bharosa. (5) Poori script dobara chalaye bina fix khatam maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bina error ke khatam hui script is baat ka saboot nahi ki result sahi hai. Sawaal aksar <b>pehla</b> check poochte hain: exception padho, phir raw input dekho.</p></div>
<div class="scn"><h4>Woh report jisne kaha sab theek hai</h4><p>Ek raat ki script down interfaces ki list banakar mail karti thi. Ek mahine tak mail khaali aayi, jise sab ne achhi khabar samjha. Software upgrade ke baad heading text badal gaya tha, pattern ko kuch nahi mila, aur loop chupchaap zero baar chala. Ek naye check ne script ko fail karwaya agar woh har router par ek se kam interface parse kare.</p>
<p><b>Lesson:</b> khaali result ki wajah honi chahiye; negative par bharosa karne se pehle check karo ki parse ne data diya.</p></div>
<div class="iv"><p class="q">"Parsing script NoneType par AttributeError se crash hoti hai. Aap troubleshoot kaise karoge?"</p><p>Iska matlab re.search ne None return kiya, yaani pattern asli text se match nahi hua. Main raw output ka repr print karta hoon, ek line chhote test mein copy karta hoon aur pattern se compare karta hoon: case, spaces aur labels dekhta hoon. Fix ke baad script ko har device par chalata hoon, aur check jodta hoon taaki missing match crash ya chuppi ki jagah device ka naam report kare.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exception class mismatch batati hai: None, missing key, chhoti row, galat type.</li>
<li><code>repr()</code> woh characters dikhata hai jo script ko sach mein milte hain.</li>
<li>Ek line aur ek pattern akele test karo, phir har device par dobara chalao.</li>
<li>Quiet failures crash se bure hain; khaali aur placeholder values ke checks jodo.</li>
<li>Default value bugs chhupata hai jab tak use ginke report na karo.</li>
</ul></div>
`}};export{e as default};