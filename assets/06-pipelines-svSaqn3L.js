var e={id:`pipelines`,h:{en:`Generator pipelines for big log files: Lab 1 steps 3 to 5`,hi:`Bade log files ke liye generator pipelines: Lab 1 ke step 3 se 5`},body:{en:`
<p><b>The idea of this chapter:</b> one generator is useful; several generators connected end to end are powerful. Each stage does one small job and passes records to the next, exactly like the Linux pipes you used in <code>lx-text</code>. You will finish Lab 1 here: parse the events, find the worst interface and stop at the first late failure.</p>

<h3>Analogy: the shell pipeline you already know</h3>
<p>On the server you can summarise the log with <code>cut</code>, <code>sort</code> and <code>uniq</code> joined by pipes. Each command knows nothing about the others; it reads lines from the left and writes lines to the right.</p>
<pre class="out">AUTO01$ cut -d" " -f5 router.log | sort | uniq -c | sort -rn | head -5
     60 %SYS-5-CONFIG_I:
     60 %OSPF-5-ADJCHG:
     60 <span class="hl">%LINK-3-UPDOWN:</span>
     60 %LINEPROTO-5-UPDOWN:</pre>
<p>A generator pipeline is the same idea inside Python. Each function takes an iterable and <code>yield</code>s a transformed or filtered stream.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Pipeline: read_lines, containing, parse, then a consumer such as Counter or next">
<rect x="10" y="40" width="120" height="56" rx="10" fill="#bae6fd"/><text x="70" y="64" text-anchor="middle" class="svg-ink" font-size="12">read_lines</text><text x="70" y="82" text-anchor="middle" class="svg-muted" font-size="10">str per line</text>
<rect x="160" y="40" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="220" y="64" text-anchor="middle" class="svg-ink" font-size="12">containing</text><text x="220" y="82" text-anchor="middle" class="svg-muted" font-size="10">keep link lines</text>
<rect x="310" y="40" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="370" y="64" text-anchor="middle" class="svg-ink" font-size="12">parse</text><text x="370" y="82" text-anchor="middle" class="svg-muted" font-size="10">dict per event</text>
<rect x="470" y="40" width="160" height="56" rx="10" fill="#bbf7d0"/><text x="550" y="64" text-anchor="middle" class="svg-ink" font-size="12">consumer</text><text x="550" y="82" text-anchor="middle" class="svg-muted" font-size="10">Counter, next, sum</text>
<line x1="130" y1="68" x2="160" y2="68" stroke="#64748b" stroke-width="2"/><line x1="280" y1="68" x2="310" y2="68" stroke="#64748b" stroke-width="2"/><line x1="430" y1="68" x2="470" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">in real Python nothing runs until the consumer asks for a record</text>
</svg><p class="cap">The consumer at the right end pulls records through the whole chain.</p></div>

<h3>Lab 1, task 3: add a parse stage</h3>
<p>A line of text is awkward to work with. The <code>parse</code> generator turns each link line into a dictionary with <code>time</code>, <code>host</code>, <code>iface</code> and <code>state</code>, using a regular expression with four capture groups (the pieces in round brackets). Lines that do not match are skipped. <code>islice</code> from <code>itertools</code> takes just the first three records, so you can check the stage without printing 60 lines.</p>
<pre class="code">AUTO01$ cat &gt; pipeline.py &lt;&lt;'EOF'
def link_events(path):
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                yield line.rstrip()


import re
from itertools import islice

RX = re.compile(r"^\\w{3} +\\d+ (\\d\\d:\\d\\d:\\d\\d) (\\S+) %LINK-3-UPDOWN: Interface (\\S+), changed state to (\\w+)")


def parse(lines):
    for line in lines:
        m = RX.match(line)
        if m:
            yield {"time": m.group(1), "host": m.group(2), "iface": m.group(3), "state": m.group(4)}


for rec in islice(parse(link_events("router.log")), 3):
    print(rec)
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
{'time': '09:00:00', 'host': 'PUN-CORE-R1', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
{'time': '09:00:28', 'host': 'BLR-EDGE-R2', 'iface': 'GigabitEthernet0/1', 'state': 'up'}
<span class="hl">{'time': '09:00:56', 'host': 'HYD-EDGE-R3', 'iface': 'GigabitEthernet0/1', 'state': 'down'}</span></pre>
<p>Read the last line of the script from the inside out: <code>link_events("router.log")</code> is the source, <code>parse(...)</code> wraps it, <code>islice(..., 3)</code> wraps that, and the <code>for</code> loop is the consumer. In real Python, once <code>islice</code> has given three records it stops asking, so the rest of the file is never read.</p>

<h3>Lab 1, task 4: the worst interface</h3>
<p><code>collections.Counter</code> counts how often each value appears. Feed it a generator expression that keeps only the interface of the "down" records, then ask for the single most common one.</p>
<pre class="code">AUTO01$ cat &gt;&gt; pipeline.py &lt;&lt;'EOF'

from collections import Counter
downs = Counter(r["iface"] for r in parse(link_events("router.log")) if r["state"] == "down")
print(downs.most_common(1))
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
{'time': '09:00:00', 'host': 'PUN-CORE-R1', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
{'time': '09:00:28', 'host': 'BLR-EDGE-R2', 'iface': 'GigabitEthernet0/1', 'state': 'up'}
{'time': '09:00:56', 'host': 'HYD-EDGE-R3', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
<span class="hl">[('GigabitEthernet0/1', 18)]</span></pre>
<p>The answer is <b>GigabitEthernet0/1</b>, with 18 down events. <code>most_common(1)</code> returns a list holding one pair: the value and its count. The whole file went through the chain once and only the counts were kept.</p>

<h3>Lab 1, task 5: stop early, count without a list</h3>
<p>Which was the <i>first</i> failure after 09:10:00? Use <code>next()</code> on a generator expression and give it <code>None</code> as the default, so you get a clean "nothing found" instead of an exception. Then count every link event without building a list, using <code>sum(1 for _ in ...)</code>. The underscore is the usual name for a value you do not need.</p>
<pre class="code">AUTO01$ cat &gt;&gt; pipeline.py &lt;&lt;'EOF'

late = next((r for r in parse(link_events("router.log")) if r["state"] == "down" and r["time"] &gt; "09:10:00"), None)
print(late["time"], late["host"])
print("total link events:", sum(1 for _ in parse(link_events("router.log"))))
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
{'time': '09:00:00', 'host': 'PUN-CORE-R1', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
{'time': '09:00:28', 'host': 'BLR-EDGE-R2', 'iface': 'GigabitEthernet0/1', 'state': 'up'}
{'time': '09:00:56', 'host': 'HYD-EDGE-R3', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
[('GigabitEthernet0/1', 18)]
<span class="hl">09:10:16 BLR-EDGE-R2</span>
total link events: 60</pre>
<p>The first late failure was at <b>09:10:16</b> on <code>BLR-EDGE-R2</code>. The time strings compare correctly with <code>&gt;</code> because they are zero-padded <code>hh:mm:ss</code>. If nothing had matched, <code>late</code> would be <code>None</code> and <code>late["time"]</code> would crash, so a real tool checks <code>if late:</code> first. The total is 60, the same as <code>grep -c</code> gave in chapter 1.</p>

<div class="eg"><p><b>Worked example: reuse a stage.</b> The same chain can answer a different question by swapping one stage. This <code>containing</code> filter keeps any lines with a given text, and a second parser picks OSPF neighbours that dropped from FULL.</p></div>
<pre class="code">def read_lines(path):
    with open(path) as f:
        for line in f:
            yield line.rstrip()

def containing(lines, text):
    for line in lines:
        if text in line:
            yield line

OSPF = re.compile(r"^\\w{3} +\\d+ \\S+ (\\S+) %OSPF-5-ADJCHG: Process 1, Nbr (\\S+) on (\\S+) from FULL to DOWN")
def ospf_drops(lines):
    for line in lines:
        m = OSPF.match(line)
        if m:
            yield (m.group(1), m.group(2))

drops = Counter(ospf_drops(containing(read_lines("router.log"), "OSPF-5-ADJCHG")))
print(len(drops), sum(drops.values()))
print(drops.most_common(3))</pre>
<pre class="out">AUTO01$ python3 st.py
<span class="hl">3 60</span>
[(('HYD-EDGE-R3', '10.0.0.3'), 20), (('PUN-CORE-R1', '10.0.0.1'), 20), (('BLR-EDGE-R2', '10.0.0.2'), 20)]</pre>
<p>Three distinct (router, neighbour) pairs, 60 drops in total, 20 each. When counts tie, <code>most_common</code> keeps the order in which the keys were first seen.</p>

<div class="warn"><p><b>Common mistakes.</b> Passing a list where a stage expects lines and getting characters. Forgetting the default in <code>next(gen, None)</code> and letting <code>StopIteration</code> escape. Calling <code>parse(...)</code> once and trying to use the same generator for two different counts: build a fresh chain for each question, or collect once into a list if the data is small.</p></div>
<div class="exam"><p><b>Exam trap.</b> In real Python the generators in a chain run in lock step: nothing is read until the consumer asks, and one record travels the whole chain before the next is fetched. In the lab the answers are the same, but it does not demonstrate that timing.</p></div>

<div class="scn"><h4>Two reports, one pass over 8 GB</h4><p>A team needed link-flap counts per interface and OSPF drops per neighbour from weekly exports. The old script read the file twice into two lists. The new one used one <code>read_lines</code> stage feeding a small function per report and ran in a fraction of the memory, and adding a third report meant adding one more small stage, not rewriting the script.</p><p><b>Lesson:</b> small stages are easy to test and easy to reuse.</p></div>

<div class="iv"><p class="q">"How would you process a 10 GB syslog file in Python?"</p><p>I would not load it. I would write small generator stages, read lines, filter, parse into dictionaries, and feed them to a consumer such as <code>Counter</code>, so memory stays flat. For a first match I would use <code>next()</code> or <code>islice</code> to stop early.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A pipeline is generators wrapped inside each other; the consumer at the end pulls the records.</li>
<li><code>Counter(...).most_common(1)</code> answers "which is the worst?" in one line.</li>
<li><code>next(gen_expr, None)</code> finds the first match and stops; guard against <code>None</code>.</li>
<li><code>sum(1 for _ in gen)</code> counts without building a list.</li>
<li>Build a fresh chain for each question; a used-up generator stays empty.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ek generator kaam ka hai; kai generators sire se sire jodne par bahut taaqatwar ho jaate hain. Har stage ek chhota kaam karta hai aur records agle ko deta hai, bilkul un Linux pipes ki tarah jo aapne <code>lx-text</code> mein use kiye. Yahan aap Lab 1 khatam karoge: events parse karo, sabse kharab interface dhoondho aur pehli late failure par ruk jao.</p>

<h3>Analogy: shell pipeline jo aap pehle se jaante ho</h3>
<p>Server par aap log ka saransh <code>cut</code>, <code>sort</code> aur <code>uniq</code> ko pipes se jodkar nikaal sakte ho. Har command ko doosron ke baare mein kuch nahi pata; woh baayein se lines padhta hai aur daayein ko likhta hai.</p>
<pre class="out">AUTO01$ cut -d" " -f5 router.log | sort | uniq -c | sort -rn | head -5
     60 %SYS-5-CONFIG_I:
     60 %OSPF-5-ADJCHG:
     60 <span class="hl">%LINK-3-UPDOWN:</span>
     60 %LINEPROTO-5-UPDOWN:</pre>
<p>Generator pipeline Python ke andar wahi idea hai. Har function ek iterable leta hai aur transform ya filter kiya hua stream <code>yield</code> karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Pipeline: read_lines, containing, parse, phir Counter ya next jaisa consumer">
<rect x="10" y="40" width="120" height="56" rx="10" fill="#bae6fd"/><text x="70" y="64" text-anchor="middle" class="svg-ink" font-size="12">read_lines</text><text x="70" y="82" text-anchor="middle" class="svg-muted" font-size="10">har line str</text>
<rect x="160" y="40" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="220" y="64" text-anchor="middle" class="svg-ink" font-size="12">containing</text><text x="220" y="82" text-anchor="middle" class="svg-muted" font-size="10">link lines rakho</text>
<rect x="310" y="40" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="370" y="64" text-anchor="middle" class="svg-ink" font-size="12">parse</text><text x="370" y="82" text-anchor="middle" class="svg-muted" font-size="10">har event dict</text>
<rect x="470" y="40" width="160" height="56" rx="10" fill="#bbf7d0"/><text x="550" y="64" text-anchor="middle" class="svg-ink" font-size="12">consumer</text><text x="550" y="82" text-anchor="middle" class="svg-muted" font-size="10">Counter, next, sum</text>
<line x1="130" y1="68" x2="160" y2="68" stroke="#64748b" stroke-width="2"/><line x1="280" y1="68" x2="310" y2="68" stroke="#64748b" stroke-width="2"/><line x1="430" y1="68" x2="470" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">asli Python mein consumer ke record maangne tak kuch nahi chalta</text>
</svg><p class="cap">Daayein sire ka consumer poori chain se records kheenchta hai.</p></div>

<h3>Lab 1, task 3: parse stage jodo</h3>
<p>Text ki line ke saath kaam karna mushkil hai. <code>parse</code> generator har link line ko <code>time</code>, <code>host</code>, <code>iface</code> aur <code>state</code> wali dictionary mein badalta hai, chaar capture groups (round brackets ke tukde) wale regular expression se. Jo lines match nahi hoti woh skip hoti hain. <code>itertools</code> ka <code>islice</code> sirf pehle teen records leta hai, taaki 60 lines print kiye bina stage check ho jaye.</p>
<pre class="code">AUTO01$ cat &gt; pipeline.py &lt;&lt;'EOF'
def link_events(path):
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                yield line.rstrip()


import re
from itertools import islice

RX = re.compile(r"^\\w{3} +\\d+ (\\d\\d:\\d\\d:\\d\\d) (\\S+) %LINK-3-UPDOWN: Interface (\\S+), changed state to (\\w+)")


def parse(lines):
    for line in lines:
        m = RX.match(line)
        if m:
            yield {"time": m.group(1), "host": m.group(2), "iface": m.group(3), "state": m.group(4)}


for rec in islice(parse(link_events("router.log")), 3):
    print(rec)
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
{'time': '09:00:00', 'host': 'PUN-CORE-R1', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
{'time': '09:00:28', 'host': 'BLR-EDGE-R2', 'iface': 'GigabitEthernet0/1', 'state': 'up'}
<span class="hl">{'time': '09:00:56', 'host': 'HYD-EDGE-R3', 'iface': 'GigabitEthernet0/1', 'state': 'down'}</span></pre>
<p>Script ki aakhri line ko andar se bahar padho: <code>link_events("router.log")</code> source hai, <code>parse(...)</code> use lapetta hai, <code>islice(..., 3)</code> use lapetta hai, aur <code>for</code> loop consumer hai. Asli Python mein <code>islice</code> teen records de dene ke baad maangna band kar deta hai, isliye file ka baaki hissa kabhi padha nahi jaata.</p>

<h3>Lab 1, task 4: sabse kharab interface</h3>
<p><code>collections.Counter</code> ginta hai ki har value kitni baar aayi. Use aisa generator expression do jo sirf "down" records ka interface rakhta hai, phir sabse common ek maango.</p>
<pre class="code">AUTO01$ cat &gt;&gt; pipeline.py &lt;&lt;'EOF'

from collections import Counter
downs = Counter(r["iface"] for r in parse(link_events("router.log")) if r["state"] == "down")
print(downs.most_common(1))
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
{'time': '09:00:00', 'host': 'PUN-CORE-R1', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
{'time': '09:00:28', 'host': 'BLR-EDGE-R2', 'iface': 'GigabitEthernet0/1', 'state': 'up'}
{'time': '09:00:56', 'host': 'HYD-EDGE-R3', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
<span class="hl">[('GigabitEthernet0/1', 18)]</span></pre>
<p>Jawab <b>GigabitEthernet0/1</b> hai, 18 down events ke saath. <code>most_common(1)</code> ek jodi wali list deta hai: value aur uska count. Poori file chain se ek baar guzri aur sirf counts rakhe gaye.</p>

<h3>Lab 1, task 5: jaldi ruko, bina list ke gino</h3>
<p>09:10:00 ke baad ki <i>pehli</i> failure kaunsi thi? Generator expression par <code>next()</code> use karo aur default mein <code>None</code> do, taaki exception ki jagah saaf "kuch nahi mila" mile. Phir har link event bina list banaye <code>sum(1 for _ in ...)</code> se gino. Underscore us value ka aam naam hai jiski aapko zaroorat nahi.</p>
<pre class="code">AUTO01$ cat &gt;&gt; pipeline.py &lt;&lt;'EOF'

late = next((r for r in parse(link_events("router.log")) if r["state"] == "down" and r["time"] &gt; "09:10:00"), None)
print(late["time"], late["host"])
print("total link events:", sum(1 for _ in parse(link_events("router.log"))))
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
{'time': '09:00:00', 'host': 'PUN-CORE-R1', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
{'time': '09:00:28', 'host': 'BLR-EDGE-R2', 'iface': 'GigabitEthernet0/1', 'state': 'up'}
{'time': '09:00:56', 'host': 'HYD-EDGE-R3', 'iface': 'GigabitEthernet0/1', 'state': 'down'}
[('GigabitEthernet0/1', 18)]
<span class="hl">09:10:16 BLR-EDGE-R2</span>
total link events: 60</pre>
<p>Pehli late failure <b>09:10:16</b> par <code>BLR-EDGE-R2</code> par thi. Time strings <code>&gt;</code> se sahi compare hoti hain kyunki woh zero-padded <code>hh:mm:ss</code> hain. Agar kuch match na hota to <code>late</code> <code>None</code> hota aur <code>late["time"]</code> crash karta, isliye asli tool pehle <code>if late:</code> check karta hai. Total 60 hai, jo chapter 1 mein <code>grep -c</code> ne diya tha.</p>

<div class="eg"><p><b>Worked example: stage dobara use karo.</b> Ek stage badalkar wahi chain doosre sawal ka jawab de sakti hai. Yeh <code>containing</code> filter kisi bhi diye text wali lines rakhta hai, aur doosra parser un OSPF neighbours ko chunta hai jo FULL se gire.</p></div>
<pre class="code">def read_lines(path):
    with open(path) as f:
        for line in f:
            yield line.rstrip()

def containing(lines, text):
    for line in lines:
        if text in line:
            yield line

OSPF = re.compile(r"^\\w{3} +\\d+ \\S+ (\\S+) %OSPF-5-ADJCHG: Process 1, Nbr (\\S+) on (\\S+) from FULL to DOWN")
def ospf_drops(lines):
    for line in lines:
        m = OSPF.match(line)
        if m:
            yield (m.group(1), m.group(2))

drops = Counter(ospf_drops(containing(read_lines("router.log"), "OSPF-5-ADJCHG")))
print(len(drops), sum(drops.values()))
print(drops.most_common(3))</pre>
<pre class="out">AUTO01$ python3 st.py
<span class="hl">3 60</span>
[(('HYD-EDGE-R3', '10.0.0.3'), 20), (('PUN-CORE-R1', '10.0.0.1'), 20), (('BLR-EDGE-R2', '10.0.0.2'), 20)]</pre>
<p>Teen alag (router, neighbour) jodiyan, kul 60 drops, har ek ke 20. Jab counts barabar hon, <code>most_common</code> keys ko usi order mein rakhta hai jis order mein woh pehli baar dikhi.</p>

<div class="warn"><p><b>Common mistakes.</b> Jahan stage lines maangta hai wahan list dena aur characters milna. <code>next(gen, None)</code> mein default bhool jaana aur <code>StopIteration</code> ko bahar nikalne dena. <code>parse(...)</code> ek baar call karke wahi generator do alag counts ke liye use karna: har sawal ke liye nayi chain banao, ya data chhota ho to ek baar list mein jama karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Asli Python mein chain ke generators lock step mein chalte hain: consumer ke maange bina kuch nahi padha jaata, aur agla record aane se pehle ek record poori chain se guzarta hai. Lab mein jawab same hain, par yeh timing woh nahi dikhata.</p></div>

<div class="scn"><h4>8 GB par ek pass, do reports</h4><p>Ek team ko weekly exports se per interface link-flap counts aur per neighbour OSPF drops chahiye the. Purani script file ko do baar do lists mein padhti thi. Nayi script ne ek <code>read_lines</code> stage se har report ke liye chhota function chalaya aur memory ka ek hissa hi use kiya, aur teesri report jodna matlab ek aur chhota stage jodna tha, script dobara likhna nahi.</p><p><b>Lesson:</b> chhote stages test karna aur dobara use karna aasaan hai.</p></div>

<div class="iv"><p class="q">"10 GB syslog file ko Python mein kaise process karoge?"</p><p>Main use load nahi karunga. Chhote generator stages likhunga, lines padhna, filter, dictionaries mein parse, aur <code>Counter</code> jaise consumer ko dena, taaki memory flat rahe. Pehla match chahiye to <code>next()</code> ya <code>islice</code> se jaldi rukunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pipeline ek doosre ke andar lapete generators hain; aakhir ka consumer records kheenchta hai.</li>
<li><code>Counter(...).most_common(1)</code> "sabse kharab kaun?" ka jawab ek line mein deta hai.</li>
<li><code>next(gen_expr, None)</code> pehla match dhoondhkar rukta hai; <code>None</code> se bachao rakho.</li>
<li><code>sum(1 for _ in gen)</code> list banaye bina ginta hai.</li>
<li>Har sawal ke liye nayi chain banao; khatam hua generator khaali rehta hai.</li>
</ul></div>
`}};export{e as default};