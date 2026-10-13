var e={id:`testing`,h:{en:`Testing templates and handling empty or odd output`,hi:`Templates ko test karna aur khaali ya ajeeb output sambhalna`},body:{en:`
<p><b>The idea of this chapter:</b> a parser that cannot be wrong loudly will be wrong quietly. TextFSM skips lines that match nothing and returns an empty list for empty text. Both behaviours are convenient and both can hide a broken template. You will learn a small testing habit that catches problems before the report does.</p>

<h3>Analogy: counting the forms before and after the scanner</h3>
<p>A careful office counts the forms that go into the scanner and the records that come out. If 500 go in and 480 come out, somebody looks for the missing 20. A template test does the same: it feeds a saved sample, counts the rows, and compares with the number a person counted.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="A folder of samples and expected counts feeds a test script, which prints PASS or FAIL and sets the exit code">
<rect x="10" y="30" width="160" height="70" rx="10" fill="#bae6fd"/><text x="90" y="56" text-anchor="middle" class="svg-ink" font-size="13">Sample files</text><text x="90" y="76" text-anchor="middle" class="svg-muted" font-size="11">good, odd, empty</text>
<rect x="200" y="30" width="170" height="70" rx="10" fill="#fde68a"/><text x="285" y="56" text-anchor="middle" class="svg-ink" font-size="13">test_templates.py</text><text x="285" y="76" text-anchor="middle" class="svg-muted" font-size="11">rows = expected?</text>
<rect x="400" y="15" width="110" height="45" rx="10" fill="#bbf7d0"/><text x="455" y="43" text-anchor="middle" class="svg-ink" font-size="13">PASS: rc 0</text>
<rect x="400" y="75" width="110" height="45" rx="10" fill="#fecaca"/><text x="455" y="103" text-anchor="middle" class="svg-ink" font-size="13">FAIL: rc 1</text>
<line x1="170" y1="65" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="370" y1="55" x2="400" y2="38" stroke="#64748b" stroke-width="2"/><line x1="370" y1="75" x2="400" y2="97" stroke="#64748b" stroke-width="2"/>
<text x="575" y="68" text-anchor="middle" class="svg-muted" font-size="11">cron or CI</text><line x1="510" y1="97" x2="540" y2="75" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Samples in, PASS or FAIL out, and an exit code that other tools can read.</p></div>

<h3>The basic test: count the rows</h3>
<p>Keep real outputs in files and write down how many rows each must produce. The script <code>test_templates.py</code> uses a list of cases, each one a template, a sample and the expected count:</p>
<pre class="code">import sys
import textfsm

CASES = [
    ("ipbrief.textfsm", "r1_ipbrief.txt", 5),
    ("arp.textfsm", "show_arp.txt", 4),
    ("ipbrief.textfsm", "empty.txt", 0),
]

failed = 0
for tpl, sample, expected in CASES:
    with open(tpl) as t:
        fsm = textfsm.TextFSM(t)
    with open(sample) as s:
        got = len(fsm.ParseText(s.read()))
    ok = got == expected
    print(f"{'PASS' if ok else 'FAIL'} {tpl} on {sample}: {got} rows (expected {expected})")
    failed += 0 if ok else 1
sys.exit(1 if failed else 0)</pre>
<ul>
<li>The tuple unpacking in <code>for tpl, sample, expected in CASES</code> gives each case readable names.</li>
<li>A new <code>TextFSM</code> object is built for every case, so nothing is carried over.</li>
<li><code>sys.exit(1 if failed else 0)</code> returns the verdict as an exit code, the habit from <code>py-tools</code>, so cron or a pipeline can notice.</li>
</ul>
<pre class="out">AUTO01$ python3 test_templates.py; echo "rc=$?"
PASS ipbrief.textfsm on r1_ipbrief.txt: 5 rows (expected 5)
PASS arp.textfsm on show_arp.txt: 4 rows (expected 4)
PASS ipbrief.textfsm on empty.txt: 0 rows (expected 0)
<span class="hl">rc=0</span></pre>
<p>Lab 2's <code>check_templates.py</code> is exactly this idea. In module <code>py-pytest</code> you will turn such cases into real pytest tests.</p>

<h3>Odd and empty output</h3>
<p>What does the same template do with bad input? The script <code>edgecases.py</code> tries four texts on <code>ipbrief.textfsm</code>:</p>
<pre class="out">AUTO01$ python3 edgecases.py
normal           5 rows
empty            0 rows
invalid command  0 rows
header only      0 rows</pre>
<p>None of the three bad inputs raised an error. They simply produced zero rows. For a report this is dangerous: "0 interfaces down" looks like good news but may mean "the command failed". So a caller should treat <b>zero rows from a device that should have rows</b> as a problem:</p>
<pre class="code">if not rows:
    raise RuntimeError("no interfaces parsed from R1: command failed or layout changed?")</pre>

<h3>The shortcut returns text when it cannot parse</h3>
<p>With <code>use_textfsm=True</code> the return type depends on the result. The script <code>guard.py</code> shows the three cases:</p>
<pre class="code">for cmd in ("show ip interface brief", "show ip route", "show bogus"):
    rows = conn.send_command(cmd, use_textfsm=True)
    if isinstance(rows, list):
        print(cmd, "-&gt; parsed,", len(rows), "rows")
    else:
        print(cmd, "-&gt; NOT parsed, got", type(rows).__name__)</pre>
<pre class="out">AUTO01$ python3 guard.py
show ip interface brief -&gt; parsed, 5 rows
<span class="hl">show ip route -&gt; NOT parsed, got str</span>
<span class="hl">show bogus -&gt; NOT parsed, got str</span></pre>
<p><code>isinstance(rows, list)</code> asks "is this a list?". If you skip this check and loop over a string, Python walks through single characters and your code fails far from the cause. An error message from the device (<code>% Invalid input detected</code>) also arrives as a string.</p>

<h3>Three kinds of failure, three exception types</h3>
<table class="cmp"><tr><th>When</th><th>Exception</th><th>Typical cause</th></tr>
<tr><td>Loading the template</td><td><code>textfsm.TextFSMTemplateError</code></td><td>Undefined Value, state or option; a bad regex; a missing <code>Start</code></td></tr>
<tr><td>Parsing, with an Error rule</td><td><code>textfsm.TextFSMError</code></td><td>A line reached <code>^. -&gt; Error</code></td></tr>
<tr><td>Library lookup</td><td><code>ntc_templates.parse.ParsingException</code></td><td>Unknown platform or command</td></tr></table>
<p><code>TextFSMTemplateError</code> is a kind of <code>TextFSMError</code>, so catch the specific one first.</p>

<h3>What a good sample set contains</h3>
<ul>
<li>A normal output with every kind of row (for interfaces: up, down, administratively down, a loopback).</li>
<li>The oddities: long names that wrap, an empty table, an incomplete entry.</li>
<li>An empty file, and a file with only an error message.</li>
<li>One sample per software version you run, when the layout differs.</li>
</ul>
<p>Use the strict rule <code>^. -&gt; Error</code> in <i>tests</i>, where samples are clean, so that an unknown line fails the test. In production, prompts and banners make that rule too noisy.</p>

<div class="eg"><p><b>Worked example.</b> A new IOS release prints "Interface IP-Address OK? Method Status Protocol" with one more column, <code>VRF</code>. Your count test on the stored old sample passes, but the test on a new sample from a lab router fails: 0 rows instead of 5. You found the break before any production report did.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing only with the clean sample. Treating an empty result as success. Looping over the result of <code>use_textfsm=True</code> without checking its type. Comparing exception message text, which changes between library versions. Keeping samples only in your head.</p></div>
<div class="exam"><p><b>Exam trap.</b> Empty or unmatched text gives <code>[]</code> without an exception. A bad template raises when you create the <code>TextFSM</code> object, not when you parse. A line that matches no rule is skipped silently unless you add an Error rule.</p></div>

<div class="scn"><h4>"No interfaces down" for three weeks</h4><p>A compliance report said zero interfaces were down on a branch router for three weeks. The router's login had changed and every <code>show</code> command returned an authorisation error. The parser returned zero rows, the report summed zero, and nobody noticed. A rule "zero rows from a router is an error" and a PASS/FAIL sample test were added the same day.</p><p><b>Lesson:</b> an empty result is not good news until you know the command worked.</p></div>

<div class="iv"><p class="q">"How do you test a TextFSM template?"</p><p>I keep saved real outputs, including odd and empty ones, with the expected number of rows, and run them from a small script that prints PASS or FAIL and sets the exit code. I check key fields on one or two rows too. In code I treat zero rows from a live device as an error and check isinstance for list when I use use_textfsm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test every template against saved samples and an expected row count.</li>
<li>Empty text and unmatched lines give zero rows, not errors: do not read zero as success.</li>
<li><code>use_textfsm=True</code> returns a list or a string; check with <code>isinstance</code>.</li>
<li>Template errors appear at load time; <code>^. -&gt; Error</code> gives strict parsing for tests.</li>
<li>Return an exit code so cron and pipelines can see failures.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo parser zor se galat nahi ho sakta woh chupchaap galat hoga. TextFSM jo lines kisi se match nahi hoti unhe skip karta hai aur khaali text par khaali list deta hai. Dono behaviour suvidhajanak hain aur dono toote template ko chhupa sakte hain. Aap ek chhoti testing aadat seekhoge jo report se pehle problems pakad leti hai.</p>

<h3>Analogy: scanner se pehle aur baad forms gina</h3>
<p>Dhyan se kaam karne wala office scanner mein jaane wale forms aur nikalne wale records ginta hai. Agar 500 gaye aur 480 nikle, to koi gayab 20 dhoondhta hai. Template test bhi yahi karta hai: saved sample deta hai, rows ginta hai, aur insaan ki ginti se milata hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Samples aur expected counts ka folder test script ko deta hai, jo PASS ya FAIL print karti hai aur exit code set karti hai">
<rect x="10" y="30" width="160" height="70" rx="10" fill="#bae6fd"/><text x="90" y="56" text-anchor="middle" class="svg-ink" font-size="13">Sample files</text><text x="90" y="76" text-anchor="middle" class="svg-muted" font-size="11">achhi, ajeeb, khaali</text>
<rect x="200" y="30" width="170" height="70" rx="10" fill="#fde68a"/><text x="285" y="56" text-anchor="middle" class="svg-ink" font-size="13">test_templates.py</text><text x="285" y="76" text-anchor="middle" class="svg-muted" font-size="11">rows = expected?</text>
<rect x="400" y="15" width="110" height="45" rx="10" fill="#bbf7d0"/><text x="455" y="43" text-anchor="middle" class="svg-ink" font-size="13">PASS: rc 0</text>
<rect x="400" y="75" width="110" height="45" rx="10" fill="#fecaca"/><text x="455" y="103" text-anchor="middle" class="svg-ink" font-size="13">FAIL: rc 1</text>
<line x1="170" y1="65" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="370" y1="55" x2="400" y2="38" stroke="#64748b" stroke-width="2"/><line x1="370" y1="75" x2="400" y2="97" stroke="#64748b" stroke-width="2"/>
<text x="575" y="68" text-anchor="middle" class="svg-muted" font-size="11">cron ya CI</text><line x1="510" y1="97" x2="540" y2="75" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Samples andar, PASS ya FAIL bahar, aur exit code jo doosre tools padh sakte hain.</p></div>

<h3>Basic test: rows gino</h3>
<p>Asli outputs files mein rakho aur likho ki har ek se kitni rows nikalni chahiye. Script <code>test_templates.py</code> cases ki list use karti hai, har case ek template, ek sample aur expected count:</p>
<pre class="code">import sys
import textfsm

CASES = [
    ("ipbrief.textfsm", "r1_ipbrief.txt", 5),
    ("arp.textfsm", "show_arp.txt", 4),
    ("ipbrief.textfsm", "empty.txt", 0),
]

failed = 0
for tpl, sample, expected in CASES:
    with open(tpl) as t:
        fsm = textfsm.TextFSM(t)
    with open(sample) as s:
        got = len(fsm.ParseText(s.read()))
    ok = got == expected
    print(f"{'PASS' if ok else 'FAIL'} {tpl} on {sample}: {got} rows (expected {expected})")
    failed += 0 if ok else 1
sys.exit(1 if failed else 0)</pre>
<ul>
<li><code>for tpl, sample, expected in CASES</code> mein tuple unpacking har case ko padhne layak naam deta hai.</li>
<li>Har case ke liye naya <code>TextFSM</code> object banta hai, isliye kuch aage nahi jaata.</li>
<li><code>sys.exit(1 if failed else 0)</code> faisla exit code ki tarah lautata hai, <code>py-tools</code> wali aadat, taaki cron ya pipeline dekh sake.</li>
</ul>
<pre class="out">AUTO01$ python3 test_templates.py; echo "rc=$?"
PASS ipbrief.textfsm on r1_ipbrief.txt: 5 rows (expected 5)
PASS arp.textfsm on show_arp.txt: 4 rows (expected 4)
PASS ipbrief.textfsm on empty.txt: 0 rows (expected 0)
<span class="hl">rc=0</span></pre>
<p>Lab 2 ki <code>check_templates.py</code> bilkul yahi idea hai. Module <code>py-pytest</code> mein aap aise cases ko asli pytest tests mein badloge.</p>

<h3>Ajeeb aur khaali output</h3>
<p>Wahi template bure input ke saath kya karta hai? Script <code>edgecases.py</code> <code>ipbrief.textfsm</code> par chaar texts try karti hai:</p>
<pre class="out">AUTO01$ python3 edgecases.py
normal           5 rows
empty            0 rows
invalid command  0 rows
header only      0 rows</pre>
<p>Teen bure inputs mein se kisi ne error nahi uthaya. Unhone bas zero rows di. Report ke liye yeh khatarnak hai: "0 interfaces down" achhi khabar lagti hai par ho sakta hai iska matlab "command fail hui" ho. Isliye caller ko <b>jis device se rows aani chahiye wahan se zero rows</b> ko problem maanna chahiye:</p>
<pre class="code">if not rows:
    raise RuntimeError("no interfaces parsed from R1: command failed or layout changed?")</pre>

<h3>Shortcut parse na ho paaye to text lautata hai</h3>
<p><code>use_textfsm=True</code> ke saath return type result par nirbhar karta hai. Script <code>guard.py</code> teen cases dikhati hai:</p>
<pre class="code">for cmd in ("show ip interface brief", "show ip route", "show bogus"):
    rows = conn.send_command(cmd, use_textfsm=True)
    if isinstance(rows, list):
        print(cmd, "-&gt; parsed,", len(rows), "rows")
    else:
        print(cmd, "-&gt; NOT parsed, got", type(rows).__name__)</pre>
<pre class="out">AUTO01$ python3 guard.py
show ip interface brief -&gt; parsed, 5 rows
<span class="hl">show ip route -&gt; NOT parsed, got str</span>
<span class="hl">show bogus -&gt; NOT parsed, got str</span></pre>
<p><code>isinstance(rows, list)</code> poochta hai "kya yeh list hai?". Yeh check chhod do aur string par loop karo to Python single characters par chalta hai aur aapka code wajah se door fail hota hai. Device ka error message (<code>% Invalid input detected</code>) bhi string ki tarah aata hai.</p>

<h3>Teen tarah ki failure, teen exception types</h3>
<table class="cmp"><tr><th>Kab</th><th>Exception</th><th>Aam wajah</th></tr>
<tr><td>Template load karte waqt</td><td><code>textfsm.TextFSMTemplateError</code></td><td>Undefined Value, state ya option; bad regex; <code>Start</code> missing</td></tr>
<tr><td>Parsing, Error rule ke saath</td><td><code>textfsm.TextFSMError</code></td><td>Koi line <code>^. -&gt; Error</code> tak pahunchi</td></tr>
<tr><td>Library lookup</td><td><code>ntc_templates.parse.ParsingException</code></td><td>Anjaan platform ya command</td></tr></table>
<p><code>TextFSMTemplateError</code>, <code>TextFSMError</code> ki ek kism hai, isliye pehle specific wala pakdo.</p>

<h3>Achhe sample set mein kya hota hai</h3>
<ul>
<li>Har tarah ki row wala normal output (interfaces ke liye: up, down, administratively down, ek loopback).</li>
<li>Ajeeb cheezein: wrap hone wale lambe naam, khaali table, incomplete entry.</li>
<li>Ek khaali file, aur ek file jisme sirf error message ho.</li>
<li>Jitne software versions chalte hain har ek ka ek sample, jab layout alag ho.</li>
</ul>
<p>Strict rule <code>^. -&gt; Error</code> <i>tests</i> mein use karo, jahan samples saaf hain, taaki anjaan line test fail kare. Production mein prompts aur banners us rule ko bahut noisy bana dete hain.</p>

<div class="eg"><p><b>Worked example.</b> Nayi IOS release "Interface IP-Address OK? Method Status Protocol" ko ek aur column, <code>VRF</code>, ke saath print karti hai. Aapka purane stored sample par count test pass hota hai, par lab router ke naye sample par fail: 5 ki jagah 0 rows. Aapne break kisi production report se pehle pakad liya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf saaf sample se test karna. Khaali result ko safalta maanna. <code>use_textfsm=True</code> ke result par type check kiye bina loop karna. Exception ka message text compare karna, jo library versions ke beech badalta hai. Samples sirf dimaag mein rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Khaali ya unmatched text exception ke bina <code>[]</code> deta hai. Bad template <code>TextFSM</code> object banate waqt raise karta hai, parse karte waqt nahi. Jo line kisi rule se match nahi hoti woh chupchaap skip hoti hai jab tak aap Error rule na jodo.</p></div>

<div class="scn"><h4>Teen hafte tak "koi interface down nahi"</h4><p>Ek compliance report ne teen hafte tak kaha ki branch router par zero interfaces down hain. Router ka login badal gaya tha aur har <code>show</code> command authorisation error deti thi. Parser ne zero rows di, report ne zero jodha, aur kisi ne dhyan nahi diya. Usi din rule joda gaya "router se zero rows error hai" aur PASS/FAIL sample test.</p><p><b>Lesson:</b> khaali result achhi khabar tab tak nahi jab tak pata na ho ki command chali.</p></div>

<div class="iv"><p class="q">"TextFSM template ko test kaise karte ho?"</p><p>Saved asli outputs rakhta hoon, ajeeb aur khaali wale bhi, expected rows ke saath, aur ek chhoti script se chalata hoon jo PASS ya FAIL print karti hai aur exit code set karti hai. Ek-do rows ke key fields bhi check karta hoon. Code mein live device se zero rows ko error maanta hoon aur use_textfsm ke saath isinstance se list check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har template ko saved samples aur expected row count se test karo.</li>
<li>Khaali text aur unmatched lines zero rows deti hain, error nahi: zero ko safalta mat samjho.</li>
<li><code>use_textfsm=True</code> list ya string lautata hai; <code>isinstance</code> se check karo.</li>
<li>Template errors load time par aate hain; <code>^. -&gt; Error</code> tests ke liye strict parsing deta hai.</li>
<li>Exit code lautao taaki cron aur pipelines failures dekh sakein.</li>
</ul></div>
`}};export{e as default};