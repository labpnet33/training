var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the three generator bugs in flaps.py (Lab 2)`,hi:`Troubleshooting workflow: flaps.py ke teen generator bugs (Lab 2)`},body:{en:`
<p><b>The idea of this chapter:</b> you will walk through Lab 2 from the first crash to a correct report. <code>flaps.py</code> on <code>AUTO01</code> should print how many link events <code>router.log</code> holds, how many went down and up, and which interfaces went down. It crashes, then reports zero, then prints nonsense. Three separate bugs hide behind each other, and fixing them in order is the skill.</p>

<h3>Analogy: a plumber with three leaks</h3>
<p>A plumber does not replace the whole house. She turns the water on, finds where it stops, fixes that one joint, turns the water on again, and only then sees the next leak. Bugs in a script work the same way: the first crash hides the second problem, because the code never gets that far.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Workflow: run, read the last line, name the object type, fix one thing, re-run and cross-check">
<rect x="8" y="30" width="116" height="62" rx="10" fill="#fecaca"/><text x="66" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Run</text><text x="66" y="74" text-anchor="middle" class="svg-muted" font-size="10">see the symptom</text>
<rect x="136" y="30" width="116" height="62" rx="10" fill="#fde68a"/><text x="194" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Read</text><text x="194" y="74" text-anchor="middle" class="svg-muted" font-size="10">last line first</text>
<rect x="264" y="30" width="116" height="62" rx="10" fill="#bae6fd"/><text x="322" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Name the type</text><text x="322" y="74" text-anchor="middle" class="svg-muted" font-size="10">list? generator? str?</text>
<rect x="392" y="30" width="116" height="62" rx="10" fill="#ddd6fe"/><text x="450" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one</text><text x="450" y="74" text-anchor="middle" class="svg-muted" font-size="10">a single change</text>
<rect x="520" y="30" width="112" height="62" rx="10" fill="#bbf7d0"/><text x="576" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Cross-check</text><text x="576" y="74" text-anchor="middle" class="svg-muted" font-size="10">grep -c agrees?</text>
<line x1="124" y1="61" x2="136" y2="61" stroke="#64748b" stroke-width="2"/><line x1="252" y1="61" x2="264" y2="61" stroke="#64748b" stroke-width="2"/><line x1="380" y1="61" x2="392" y2="61" stroke="#64748b" stroke-width="2"/><line x1="508" y1="61" x2="520" y2="61" stroke="#64748b" stroke-width="2"/>
<text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">repeat until the numbers match an independent count</text>
</svg><p class="cap">Fix one bug, re-run, and prove the number with a second tool.</p></div>

<h3>The tool under test</h3>
<p>The suspect lines are highlighted. Read them before running anything.</p>
<pre class="out">AUTO01$ cat flaps.py
import re

RX = re.compile(r"^\\w{3} +\\d+ (\\d\\d:\\d\\d:\\d\\d) (\\S+) %LINK-3-UPDOWN: Interface (\\S+), changed state to (\\w+)")


def parse(lines):
    for line in lines:
        m = RX.match(line)
        if m:
            yield {"time": m.group(1), "host": m.group(2), "iface": m.group(3), "state": m.group(4)}


def summary(path):
    <span class="hl">f = open(path)</span>
    downs = sum(1 for l in f if "%LINK-3-UPDOWN" in l and l.rstrip().endswith("down"))
    ups = sum(1 for l in f if "%LINK-3-UPDOWN" in l and l.rstrip().endswith("up"))
    return downs, ups


def down_ifaces(records):
    for r in records:
        if r["state"] == "down":
            <span class="hl">return r["iface"]</span>


<span class="hl">records = parse(open("router.log"))</span>
print("events:", len(records))
downs, ups = summary("router.log")
print("down:", downs, "up:", ups)
print(sorted(set(down_ifaces(records))))</pre>

<h3>Bug 1: TypeError, len() of a generator (tasks 1 and 2)</h3>
<pre class="out">AUTO01$ python3 flaps.py
Traceback (most recent call last):
  File "flaps.py", line 27, in &lt;module&gt;
    print("events:", len(records))
<span class="hl">TypeError: object of type 'generator' has no len()</span>
AUTO01$ echo rc=$?
rc=1</pre>
<p>Read the last line first: the object is a <b>generator</b> and it has no <code>len()</code>. Line 26 shows why: <code>parse(...)</code> returns a stream. The lab asks for a list at assignment time, so the data can be counted and read more than once. The <code>sed</code> command replaces the whole line; <code>^</code> and <code>$</code> anchor it to the start and end of the line so nothing else matches.</p>
<pre class="code">AUTO01$ sed -i 's/^records = parse(open("router.log"))$/records = list(parse(open("router.log")))/' flaps.py
AUTO01$ python3 flaps.py</pre>
<pre class="out">events: <span class="hl">60</span>
down: 30 up: 0
['/', '0', '1', 'E', 'G', 'a', 'b', 'e', 'g', 'h', 'i', 'n', 'r', 't']</pre>
<p>The crash is gone and the first line is right: 60 events, the same as <code>grep -c</code>. But the next two lines are wrong, and they were invisible until now.</p>

<h3>Bug 2: "up: 0", a file read twice (tasks 3 and 4)</h3>
<p>Thirty downs and zero ups cannot be true: every flap comes back up. Look at <code>summary</code>. It opens the file once and runs two <code>sum(...)</code> loops over the same <code>f</code>. A file object is a one-shot stream (chapter 4), so the first loop reads to the end and the second has nothing left.</p>
<pre class="code">AUTO01$ grep -n "f = open" flaps.py
AUTO01$ sed -i 's/^    f = open(path)$/    f = open(path).readlines()/' flaps.py
AUTO01$ python3 flaps.py</pre>
<pre class="out">14:    f = open(path)
events: 60
down: 30 up: <span class="hl">30</span>
['/', '0', '1', 'E', 'G', 'a', 'b', 'e', 'g', 'h', 'i', 'n', 'r', 't']</pre>
<p><code>readlines()</code> reads the file once into a list, and a list can be walked as often as you like. Both counts are now 30. Since the file is small, a list is the right tool here; for a huge file you would count both states in a single loop instead.</p>

<h3>Bug 3: single characters, return instead of yield (task 5)</h3>
<p>The last line should be interface names, but it shows letters and digits. <code>down_ifaces</code> uses <code>return</code> inside the loop: it stops at the first down record and hands back <i>one string</i>. <code>set("GigabitEthernet0/1")</code> then splits that string into its characters. Changing <code>return</code> to <code>yield</code> turns the function into a generator that delivers every down interface.</p>
<pre class="code">AUTO01$ sed -i 's/            return r\\["iface"\\]/            yield r["iface"]/' flaps.py
AUTO01$ python3 flaps.py</pre>
<pre class="out">events: 60
down: 30 up: 30
<span class="hl">['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2']</span></pre>
<p>Three distinct interfaces, matching the Counter result of Lab 1, where GigabitEthernet0/1 was the worst. In the <code>sed</code> pattern the square brackets are escaped with a backslash because brackets mean something special in a pattern.</p>

<h3>Finish with a count that builds no list (task 6), then cross-check</h3>
<pre class="code">AUTO01$ cat &gt;&gt; flaps.py &lt;&lt;'EOF'
print("down records:", sum(1 for r in records if r["state"] == "down"))
EOF
AUTO01$ python3 flaps.py</pre>
<pre class="out">events: 60
down: 30 up: 30
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2']
<span class="hl">down records: 30</span>
AUTO01$ echo rc=$?
rc=0
AUTO01$ grep -c '%LINK-3-UPDOWN.*down$' router.log
30
AUTO01$ grep -c '%LINK-3-UPDOWN.*up$' router.log
30</pre>
<p>The report now agrees with an independent count made by a different tool: 30 downs and 30 ups. That last step is the real proof. A script that prints plausible numbers is not yet a script that prints correct numbers.</p>

<table class="cmp">
<tr><th>What you saw</th><th>Concept behind it</th><th>The fix</th></tr>
<tr><td>TypeError: no len()</td><td>a generator has no length</td><td>list(...) when assigned</td></tr>
<tr><td>up: 0</td><td>a file is a one-shot stream</td><td>readlines() once</td></tr>
<tr><td>single characters</td><td>return gives one string, set() splits it</td><td>yield</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Fixing all three bugs in one edit, so you cannot tell which change did what. Trusting "down: 30 up: 0" because the script did not crash. Editing with a pattern that is not anchored and changing more lines than you meant; check with <code>grep -n</code> afterwards.</p></div>
<div class="exam"><p><b>Exam trap.</b> Making <code>records</code> a list fixes the length error, but a list is also what lets <code>down_ifaces</code> and the final count both read it. Had <code>records</code> stayed a generator, the second use would have found it empty.</p></div>

<div class="scn"><h4>The flap report that nobody questioned</h4><p>A weekly flap report had said "ups: 0" for months. People assumed the network had many one-way failures. A new engineer noticed that downs and ups should match, read the code, saw the same file consumed by two loops, and fixed it with one line. The cross-check with <code>grep -c</code> became part of the script's test routine.</p><p><b>Lesson:</b> when numbers look impossible, test the tool before you blame the network.</p></div>

<div class="iv"><p class="q">"A script prints a wrong number but does not crash. How do you debug it?"</p><p>I check the types at each step, looking for a generator or file that was consumed twice, then fix one thing at a time and re-run. I always cross-check the final number with an independent method, such as <code>grep -c</code> on the raw file.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the last line, name the object type, change one thing, re-run.</li>
<li>Bugs hide behind each other: fix the crash first, then check every number.</li>
<li>Three classic generator bugs: <code>len()</code> on a generator, a stream read twice, <code>return</code> instead of <code>yield</code>.</li>
<li>Prove the final result with an independent count, not with the script itself.</li>
<li>Anchor <code>sed</code> patterns with <code>^</code> and <code>$</code> and confirm with <code>grep -n</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> aap Lab 2 ko pehle crash se sahi report tak chalkar dekhoge. <code>AUTO01</code> par <code>flaps.py</code> ko print karna chahiye ki <code>router.log</code> mein kitne link events hain, kitne down aur up hue, aur kaunse interfaces down hue. Woh crash hota hai, phir zero batata hai, phir bakwaas print karta hai. Teen alag bugs ek doosre ke peeche chhupe hain, aur unhe kram se theek karna hi asli hunar hai.</p>

<h3>Analogy: teen leak wala plumber</h3>
<p>Plumber poora ghar nahi badalta. Woh paani chalata hai, dekhta hai kahan ruka, wahi ek joint theek karta hai, paani dobara chalata hai, aur tabhi agla leak dikhta hai. Script ke bugs bhi aise hi hote hain: pehla crash doosri problem chhupa deta hai, kyunki code wahan tak pahunchta hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Workflow: chalao, aakhri line padho, object ka type batao, ek cheez theek karo, dobara chalao aur cross-check">
<rect x="8" y="30" width="116" height="62" rx="10" fill="#fecaca"/><text x="66" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Chalao</text><text x="66" y="74" text-anchor="middle" class="svg-muted" font-size="10">lakshan dekho</text>
<rect x="136" y="30" width="116" height="62" rx="10" fill="#fde68a"/><text x="194" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Padho</text><text x="194" y="74" text-anchor="middle" class="svg-muted" font-size="10">aakhri line pehle</text>
<rect x="264" y="30" width="116" height="62" rx="10" fill="#bae6fd"/><text x="322" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Type batao</text><text x="322" y="74" text-anchor="middle" class="svg-muted" font-size="10">list? generator? str?</text>
<rect x="392" y="30" width="116" height="62" rx="10" fill="#ddd6fe"/><text x="450" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Ek fix</text><text x="450" y="74" text-anchor="middle" class="svg-muted" font-size="10">sirf ek badlav</text>
<rect x="520" y="30" width="112" height="62" rx="10" fill="#bbf7d0"/><text x="576" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Cross-check</text><text x="576" y="74" text-anchor="middle" class="svg-muted" font-size="10">grep -c match?</text>
<line x1="124" y1="61" x2="136" y2="61" stroke="#64748b" stroke-width="2"/><line x1="252" y1="61" x2="264" y2="61" stroke="#64748b" stroke-width="2"/><line x1="380" y1="61" x2="392" y2="61" stroke="#64748b" stroke-width="2"/><line x1="508" y1="61" x2="520" y2="61" stroke="#64748b" stroke-width="2"/>
<text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">tab tak dohrao jab tak numbers independent count se na milein</text>
</svg><p class="cap">Ek bug theek karo, dobara chalao, aur number ko doosre tool se saabit karo.</p></div>

<h3>Jis tool ki jaanch ho rahi hai</h3>
<p>Shak wali lines highlight hain. Kuch chalane se pehle unhe padho.</p>
<pre class="out">AUTO01$ cat flaps.py
import re

RX = re.compile(r"^\\w{3} +\\d+ (\\d\\d:\\d\\d:\\d\\d) (\\S+) %LINK-3-UPDOWN: Interface (\\S+), changed state to (\\w+)")


def parse(lines):
    for line in lines:
        m = RX.match(line)
        if m:
            yield {"time": m.group(1), "host": m.group(2), "iface": m.group(3), "state": m.group(4)}


def summary(path):
    <span class="hl">f = open(path)</span>
    downs = sum(1 for l in f if "%LINK-3-UPDOWN" in l and l.rstrip().endswith("down"))
    ups = sum(1 for l in f if "%LINK-3-UPDOWN" in l and l.rstrip().endswith("up"))
    return downs, ups


def down_ifaces(records):
    for r in records:
        if r["state"] == "down":
            <span class="hl">return r["iface"]</span>


<span class="hl">records = parse(open("router.log"))</span>
print("events:", len(records))
downs, ups = summary("router.log")
print("down:", downs, "up:", ups)
print(sorted(set(down_ifaces(records))))</pre>

<h3>Bug 1: TypeError, generator ka len() (tasks 1 aur 2)</h3>
<pre class="out">AUTO01$ python3 flaps.py
Traceback (most recent call last):
  File "flaps.py", line 27, in &lt;module&gt;
    print("events:", len(records))
<span class="hl">TypeError: object of type 'generator' has no len()</span>
AUTO01$ echo rc=$?
rc=1</pre>
<p>Aakhri line pehle padho: object <b>generator</b> hai aur uska <code>len()</code> nahi hota. Line 26 batati hai kyon: <code>parse(...)</code> stream return karta hai. Lab kehta hai ki assignment ke samay list banao, taaki data gina bhi ja sake aur ek se zyada baar padha bhi. <code>sed</code> command poori line badalta hai; <code>^</code> aur <code>$</code> use line ki shuruaat aur ant se bandhte hain taaki aur kuch match na ho.</p>
<pre class="code">AUTO01$ sed -i 's/^records = parse(open("router.log"))$/records = list(parse(open("router.log")))/' flaps.py
AUTO01$ python3 flaps.py</pre>
<pre class="out">events: <span class="hl">60</span>
down: 30 up: 0
['/', '0', '1', 'E', 'G', 'a', 'b', 'e', 'g', 'h', 'i', 'n', 'r', 't']</pre>
<p>Crash chala gaya aur pehli line sahi hai: 60 events, <code>grep -c</code> jitne. Par agli do lines galat hain, aur ab tak dikhai nahi deti thi.</p>

<h3>Bug 2: "up: 0", file do baar padhi gayi (tasks 3 aur 4)</h3>
<p>Tees down aur zero up sach nahi ho sakte: har flap wapas up hota hai. <code>summary</code> dekho. Woh file ek baar kholta hai aur usi <code>f</code> par do <code>sum(...)</code> loops chalata hai. File object one-shot stream hai (chapter 4), isliye pehla loop ant tak padh leta hai aur doosre ke liye kuch nahi bachta.</p>
<pre class="code">AUTO01$ grep -n "f = open" flaps.py
AUTO01$ sed -i 's/^    f = open(path)$/    f = open(path).readlines()/' flaps.py
AUTO01$ python3 flaps.py</pre>
<pre class="out">14:    f = open(path)
events: 60
down: 30 up: <span class="hl">30</span>
['/', '0', '1', 'E', 'G', 'a', 'b', 'e', 'g', 'h', 'i', 'n', 'r', 't']</pre>
<p><code>readlines()</code> file ko ek baar list mein padhta hai, aur list ko jitni baar chaho chala sakte ho. Dono counts ab 30 hain. File chhoti hai isliye yahan list sahi tool hai; bahut badi file ke liye aap dono states ko ek hi loop mein ginte.</p>

<h3>Bug 3: akele characters, yield ki jagah return (task 5)</h3>
<p>Aakhri line mein interface names hone chahiye, par woh akshar aur ank dikhati hai. <code>down_ifaces</code> loop ke andar <code>return</code> use karta hai: pehle down record par ruk jaata hai aur <i>ek string</i> wapas deta hai. <code>set("GigabitEthernet0/1")</code> phir us string ko characters mein tod deta hai. <code>return</code> ko <code>yield</code> karne se function aisa generator ban jaata hai jo har down interface deta hai.</p>
<pre class="code">AUTO01$ sed -i 's/            return r\\["iface"\\]/            yield r["iface"]/' flaps.py
AUTO01$ python3 flaps.py</pre>
<pre class="out">events: 60
down: 30 up: 30
<span class="hl">['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2']</span></pre>
<p>Teen alag interfaces, Lab 1 ke Counter result se match karte hue, jahan GigabitEthernet0/1 sabse kharab tha. <code>sed</code> pattern mein square brackets ko backslash se escape kiya gaya hai kyunki pattern mein brackets ka khaas matlab hota hai.</p>

<h3>Bina list wali ginti se khatam karo (task 6), phir cross-check</h3>
<pre class="code">AUTO01$ cat &gt;&gt; flaps.py &lt;&lt;'EOF'
print("down records:", sum(1 for r in records if r["state"] == "down"))
EOF
AUTO01$ python3 flaps.py</pre>
<pre class="out">events: 60
down: 30 up: 30
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2']
<span class="hl">down records: 30</span>
AUTO01$ echo rc=$?
rc=0
AUTO01$ grep -c '%LINK-3-UPDOWN.*down$' router.log
30
AUTO01$ grep -c '%LINK-3-UPDOWN.*up$' router.log
30</pre>
<p>Report ab doosre tool ki independent ginti se match karti hai: 30 downs aur 30 ups. Aakhri step hi asli saboot hai. Jo script sahi dikhne wale numbers print karti hai woh abhi sahi numbers print karne wali script nahi hai.</p>

<table class="cmp">
<tr><th>Kya dikha</th><th>Peeche ka concept</th><th>Fix</th></tr>
<tr><td>TypeError: no len()</td><td>generator ki length nahi hoti</td><td>assign karte samay list(...)</td></tr>
<tr><td>up: 0</td><td>file one-shot stream hai</td><td>ek baar readlines()</td></tr>
<tr><td>akele characters</td><td>return ek string deta hai, set() use todta hai</td><td>yield</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Teeno bugs ek hi edit mein theek karna, taaki pata na chale kis badlav ne kya kiya. "down: 30 up: 0" par bharosa karna kyunki script crash nahi hui. Aise pattern se edit karna jo anchored nahi hai aur jitni socha utni se zyada lines badal dena; baad mein <code>grep -n</code> se check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>records</code> ko list banane se length error theek hota hai, par list hi woh cheez hai jo <code>down_ifaces</code> aur aakhri count dono ko use padhne deti hai. Agar <code>records</code> generator rehta, to doosre use ko woh khaali milta.</p></div>

<div class="scn"><h4>Flap report jis par kisi ne sawal nahi uthaya</h4><p>Ek weekly flap report mahino se "ups: 0" kehti rahi. Logon ne maan liya ki network mein bahut one-way failures hain. Naye engineer ne dekha ki downs aur ups match hone chahiye, code padha, dekha ki ek hi file do loops ne consume ki, aur ek line se theek kar diya. <code>grep -c</code> wala cross-check script ki test routine ka hissa ban gaya.</p><p><b>Lesson:</b> jab numbers namumkin lagein, network ko doshi thehrane se pehle tool ko test karo.</p></div>

<div class="iv"><p class="q">"Script galat number print karti hai par crash nahi hoti. Debug kaise karoge?"</p><p>Main har step par types check karta hoon, aisa generator ya file dhoondhta hoon jo do baar consume hui ho, phir ek cheez theek karke dobara chalata hoon. Final number ko hamesha independent tareeke se cross-check karta hoon, jaise raw file par <code>grep -c</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aakhri line padho, object ka type batao, ek cheez badlo, dobara chalao.</li>
<li>Bugs ek doosre ke peeche chhupte hain: pehle crash theek karo, phir har number check karo.</li>
<li>Teen classic generator bugs: generator par <code>len()</code>, do baar padhi stream, <code>yield</code> ki jagah <code>return</code>.</li>
<li>Final result ko independent count se saabit karo, script se nahi.</li>
<li><code>sed</code> patterns ko <code>^</code> aur <code>$</code> se anchor karo aur <code>grep -n</code> se confirm karo.</li>
</ul></div>
`}};export{e as default};