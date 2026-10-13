var e={id:`conditions-nested`,h:{en:`Conditions, nested comprehensions and when NOT to use them`,hi:`Conditions, nested comprehensions aur inhe kab use NAHI karna`},body:{en:`
<p><b>The idea of this chapter:</b> the real power of a comprehension is in its <i>if</i>. This chapter shows the two places an <code>if</code> can go, how to read a comprehension with two <code>for</code> parts, and, just as important, how to recognise the moment when a plain loop is kinder to the next person who reads your script.</p>

<h3>Analogy: a security gate</h3>
<p>Think of a gate at the data-center door. A <b>filter</b> decides who comes in at all: only edge routers pass. A <b>label</b> changes what is written about everyone who does come in: each router gets "up" or "DOWN" on its badge. Both use the word <code>if</code>, but they sit in different places and do different jobs.</p>

<h3>Position 1: <code>if</code> at the end filters</h3>
<p>An <code>if</code> after the <code>for</code> part keeps or drops items. Items that fail the test are not in the result at all, so the result can be shorter than the input.</p>
<pre class="code">print([d["name"] for d in devices if d["role"] == "edge"])
print({d["name"]: d["ip"] for d in devices if not d["up"]})
print([d["name"] for d in devices if d["up"] and d["role"] != "access"])</pre>
<pre class="out">AUTO01$ python3 c3.py
['BLR-EDGE-R2', 'HYD-EDGE-R3']
{'HYD-EDGE-R3': '10.99.0.3'}
<span class="hl">['PUN-CORE-R1', 'BLR-EDGE-R2']</span></pre>
<p>The first line keeps edge routers. The second is a dictionary comprehension that keeps only the device that is not up, a ready-made "down list". The third combines two tests with <code>and</code>: the device must be up <i>and</i> not an access switch.</p>

<h3>Position 2: <code>if ... else</code> at the front labels</h3>
<p>When you want every item to appear but with a different value, put a <b>conditional expression</b> at the front: <code>value_if_true if test else value_if_false</code>. There is no filter here, so the output has exactly as many items as the input.</p>
<pre class="code">print(["up" if d["up"] else "DOWN" for d in devices])</pre>
<pre class="out">AUTO01$ python3 c3.py
<span class="hl">['up', 'up', 'DOWN', 'up']</span></pre>
<div class="note"><p><b>Memory aid.</b> A bare <code>if</code> goes at the <i>end</i> and filters. An <code>if</code> with an <code>else</code> goes at the <i>front</i> and labels. Putting <code>else</code> at the end is a syntax error.</p></div>

<h3>Two <code>for</code> parts: a nested comprehension</h3>
<p>You can put a second <code>for</code> after the first. Read them in the same order you would write the nested loops: the first <code>for</code> is the outer loop, the second is the inner loop. Here is a dictionary of VLAN lists per switch, flattened into pairs and into one list.</p>
<pre class="code">vlans = {"SW1": [10, 20, 30], "SW2": [10, 40]}
print([(sw, v) for sw, lst in vlans.items() for v in lst])
flat = [v for lst in vlans.values() for v in lst]
print(flat)
print(sorted(set(flat)))
print([[f"Gi0/{p}" for p in range(1, 4)] for sw in ("SW1", "SW2")])</pre>
<pre class="out">AUTO01$ python3 c3.py
[('SW1', 10), ('SW1', 20), ('SW1', 30), ('SW2', 10), ('SW2', 40)]
<span class="hl">[10, 20, 30, 10, 40]</span>
[10, 20, 30, 40]
[['Gi0/1', 'Gi0/2', 'Gi0/3'], ['Gi0/1', 'Gi0/2', 'Gi0/3']]</pre>
<p>The first two lines have two <code>for</code> parts in <i>one</i> pair of brackets, so the result is flat. The last line is different: a comprehension <i>inside</i> a comprehension, written in separate brackets, so the result is a list of lists, one inner list per switch. Flat versus list of lists is decided by where the brackets are.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Decision guide: comprehension or loop">
<rect x="20" y="20" width="200" height="50" rx="8" fill="#bae6fd"/><text x="120" y="50" text-anchor="middle" class="svg-ink" font-size="12">One clear result wanted?</text>
<rect x="250" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="335" y="50" text-anchor="middle" class="svg-ink" font-size="12">Fits one short line?</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="12">No print or append?</text>
<line x1="220" y1="45" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><line x1="420" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="235" y="38" text-anchor="middle" class="svg-muted" font-size="10">yes</text><text x="435" y="38" text-anchor="middle" class="svg-muted" font-size="10">yes</text>
<line x1="535" y1="70" x2="535" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="105" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="535" y="133" text-anchor="middle" class="svg-ink" font-size="12">Use a comprehension</text>
<line x1="120" y1="70" x2="120" y2="105" stroke="#64748b" stroke-width="2"/><line x1="335" y1="70" x2="335" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="105" width="400" height="46" rx="8" fill="#fed7aa"/><text x="220" y="133" text-anchor="middle" class="svg-ink" font-size="12">Any "no" on the way: write a for loop</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="11">Readable beats clever</text>
</svg><p class="cap">Any "no" sends you to a plain loop.</p></div>

<h3>When NOT to use a comprehension</h3>
<p>The line below is legal and gives the right answer, but ask yourself how long a colleague needs to read it at 2 a.m. during an outage.</p>
<pre class="code">print([(sw, v) for sw, lst in vlans.items() if sw != "SW9" for v in lst if v &gt; 10 and v % 20 == 0])

out = []
for sw, lst in vlans.items():
    if sw != "SW9":
        for v in lst:
            if v &gt; 10 and v % 20 == 0:
                out.append((sw, v))
print(out)</pre>
<pre class="out">AUTO01$ python3 c5.py
[('SW1', 20), ('SW2', 40)]
<span class="hl">[('SW1', 20), ('SW2', 40)]</span></pre>
<p>Both produce the same two pairs. The loop is longer, but every condition has its own line and you can add a <code>print</code> inside to see what is happening. Use a plain loop when there are more than two <code>for</code> parts, more than one or two conditions, when you need several statements, or when you are calling something only for its side effect. A comprehension that was written to run <code>print</code> or <code>append</code> is a loop in disguise:</p>
<pre class="code">result = [print(n) for n in ["PUN-CORE-R1", "BLR-EDGE-R2"]]
print(result)</pre>
<pre class="out">AUTO01$ python3 c3.py
PUN-CORE-R1
BLR-EDGE-R2
<span class="hl">[None, None]</span></pre>
<p>The names printed, but the comprehension also built a list of <code>None</code> values, one for each call to <code>print</code>. It is wasted work and a puzzle for the reader.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting <code>else</code> at the end of a filter comprehension (a syntax error). Mixing up the order of two <code>for</code> parts and getting the pairs the wrong way round. Adding so many conditions that the line wraps three times. Keeping a long comprehension "because it is Pythonic".</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>[x for x in a if c]</code> can return fewer items than <code>a</code>. <code>[x if c else y for x in a]</code> always returns exactly as many. Questions love to ask for the length of each.</p></div>

<div class="scn"><h4>The one-liner nobody dared touch</h4><p>A report script had a four-line comprehension with three conditions that picked out ports to shut down. When a new port type was added, nobody was sure how to change it safely, and a wrong edit could have disabled uplinks. The team rewrote it as a short loop with one condition per line and a comment, added the new port type in one line, and printed what it would shut down before doing anything.</p><p><b>Lesson:</b> cleverness that nobody can safely change is a liability.</p></div>

<div class="iv"><p class="q">"What is the difference between a filter and a conditional expression in a comprehension?"</p><p>A trailing <code>if</code> filters, so items that fail the test are dropped and the output can be shorter. An <code>if ... else</code> at the front is a conditional expression that transforms every item, so the output keeps the same length. I choose by asking whether I want to drop items or relabel them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A trailing <code>if</code> filters; a leading <code>x if c else y</code> labels every item.</li>
<li>Several <code>for</code> parts read like nested loops, outer first.</li>
<li>Brackets decide the shape: one pair gives a flat list, nested pairs give a list of lists.</li>
<li>Use a plain loop for side effects, many conditions or anything hard to read.</li>
<li>A comprehension used for <code>print</code> builds a pointless list of <code>None</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> comprehension ki asli taaqat uske <i>if</i> mein hai. Yeh chapter dikhata hai ki <code>if</code> do jagah ja sakta hai, do <code>for</code> hisson wali comprehension kaise padhte hain, aur utna hi zaroori, woh pal kaise pehchanein jab seedha loop aapki script padhne wale ke liye zyada meherbaan hai.</p>

<h3>Analogy: security gate</h3>
<p>Data-center ke darwaze par gate socho. <b>Filter</b> tay karta hai ki andar kaun aayega: sirf edge routers pass hote hain. <b>Label</b> badal deta hai ki andar aane wale har kisi ke baare mein kya likha jaye: har router ke badge par "up" ya "DOWN" aata hai. Dono mein <code>if</code> shabd hai, par woh alag jagah baithte hain aur alag kaam karte hain.</p>

<h3>Position 1: aakhir ka <code>if</code> filter karta hai</h3>
<p><code>for</code> hisse ke baad ka <code>if</code> items ko rakhta ya girata hai. Jo items test mein fail hote hain woh result mein hote hi nahi, isliye result input se chhota ho sakta hai.</p>
<pre class="code">print([d["name"] for d in devices if d["role"] == "edge"])
print({d["name"]: d["ip"] for d in devices if not d["up"]})
print([d["name"] for d in devices if d["up"] and d["role"] != "access"])</pre>
<pre class="out">AUTO01$ python3 c3.py
['BLR-EDGE-R2', 'HYD-EDGE-R3']
{'HYD-EDGE-R3': '10.99.0.3'}
<span class="hl">['PUN-CORE-R1', 'BLR-EDGE-R2']</span></pre>
<p>Pehli line edge routers rakhti hai. Doosri dictionary comprehension hai jo sirf woh device rakhti hai jo up nahi hai, yaani tayyar "down list". Teesri <code>and</code> se do tests jodti hai: device up hona chahiye <i>aur</i> access switch nahi.</p>

<h3>Position 2: aage ka <code>if ... else</code> label lagata hai</h3>
<p>Jab har item dikhana ho par alag value ke saath, tab aage <b>conditional expression</b> lagao: <code>value_if_true if test else value_if_false</code>. Yahan koi filter nahi hai, isliye output mein utne hi items hote hain jitne input mein.</p>
<pre class="code">print(["up" if d["up"] else "DOWN" for d in devices])</pre>
<pre class="out">AUTO01$ python3 c3.py
<span class="hl">['up', 'up', 'DOWN', 'up']</span></pre>
<div class="note"><p><b>Yaad rakhne ka tareeka.</b> Akela <code>if</code> <i>aakhir</i> mein jaata hai aur filter karta hai. <code>else</code> wala <code>if</code> <i>aage</i> jaata hai aur label lagata hai. <code>else</code> ko aakhir mein rakhna syntax error hai.</p></div>

<h3>Do <code>for</code> hisse: nested comprehension</h3>
<p>Pehle <code>for</code> ke baad doosra <code>for</code> laga sakte ho. Unhe usi order mein padho jis order mein nested loops likhte: pehla <code>for</code> bahar wala loop hai, doosra andar wala. Yahan switch ke hisaab se VLAN lists ki dictionary hai, jise pairs mein aur ek list mein flatten kiya gaya hai.</p>
<pre class="code">vlans = {"SW1": [10, 20, 30], "SW2": [10, 40]}
print([(sw, v) for sw, lst in vlans.items() for v in lst])
flat = [v for lst in vlans.values() for v in lst]
print(flat)
print(sorted(set(flat)))
print([[f"Gi0/{p}" for p in range(1, 4)] for sw in ("SW1", "SW2")])</pre>
<pre class="out">AUTO01$ python3 c3.py
[('SW1', 10), ('SW1', 20), ('SW1', 30), ('SW2', 10), ('SW2', 40)]
<span class="hl">[10, 20, 30, 10, 40]</span>
[10, 20, 30, 40]
[['Gi0/1', 'Gi0/2', 'Gi0/3'], ['Gi0/1', 'Gi0/2', 'Gi0/3']]</pre>
<p>Pehli do lines mein do <code>for</code> hisse <i>ek</i> bracket jodi mein hain, isliye result flat hai. Aakhri line alag hai: comprehension ke <i>andar</i> comprehension, alag brackets mein, isliye result lists ki list hai, har switch ke liye ek andar ki list. Flat ya lists ki list brackets ki jagah se tay hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Faisla guide: comprehension ya loop">
<rect x="20" y="20" width="200" height="50" rx="8" fill="#bae6fd"/><text x="120" y="50" text-anchor="middle" class="svg-ink" font-size="12">Ek saaf result chahiye?</text>
<rect x="250" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="335" y="50" text-anchor="middle" class="svg-ink" font-size="12">Ek chhoti line mein aata hai?</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="12">print/append nahi?</text>
<line x1="220" y1="45" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><line x1="420" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="235" y="38" text-anchor="middle" class="svg-muted" font-size="10">haan</text><text x="435" y="38" text-anchor="middle" class="svg-muted" font-size="10">haan</text>
<line x1="535" y1="70" x2="535" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="105" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="535" y="133" text-anchor="middle" class="svg-ink" font-size="12">Comprehension use karo</text>
<line x1="120" y1="70" x2="120" y2="105" stroke="#64748b" stroke-width="2"/><line x1="335" y1="70" x2="335" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="105" width="400" height="46" rx="8" fill="#fed7aa"/><text x="220" y="133" text-anchor="middle" class="svg-ink" font-size="12">Raste mein koi "nahi": for loop likho</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="11">Clever se zyada readable</text>
</svg><p class="cap">Koi bhi "nahi" aapko seedhe loop par bhejta hai.</p></div>

<h3>Comprehension kab use NAHI karni</h3>
<p>Neeche ki line legal hai aur jawab sahi deti hai, par socho ki outage ke dauran raat ke 2 baje colleague ko use padhne mein kitna time lagega.</p>
<pre class="code">print([(sw, v) for sw, lst in vlans.items() if sw != "SW9" for v in lst if v &gt; 10 and v % 20 == 0])

out = []
for sw, lst in vlans.items():
    if sw != "SW9":
        for v in lst:
            if v &gt; 10 and v % 20 == 0:
                out.append((sw, v))
print(out)</pre>
<pre class="out">AUTO01$ python3 c5.py
[('SW1', 20), ('SW2', 40)]
<span class="hl">[('SW1', 20), ('SW2', 40)]</span></pre>
<p>Dono wahi do pairs dete hain. Loop lamba hai, par har condition ki apni line hai aur aap andar <code>print</code> laga kar dekh sakte ho kya ho raha hai. Plain loop tab use karo jab do se zyada <code>for</code> hisse hon, ek-do se zyada conditions hon, kai statements chahiye hon, ya aap kuch sirf uske side effect ke liye call kar rahe ho. Jo comprehension <code>print</code> ya <code>append</code> chalane ke liye likhi gayi hai woh bhes badla hua loop hai:</p>
<pre class="code">result = [print(n) for n in ["PUN-CORE-R1", "BLR-EDGE-R2"]]
print(result)</pre>
<pre class="out">AUTO01$ python3 c3.py
PUN-CORE-R1
BLR-EDGE-R2
<span class="hl">[None, None]</span></pre>
<p>Names print ho gaye, par comprehension ne <code>None</code> values ki list bhi bana di, <code>print</code> ke har call ke liye ek. Yeh bekaar kaam hai aur padhne wale ke liye paheli.</p>

<div class="warn"><p><b>Common mistakes.</b> Filter comprehension ke aakhir mein <code>else</code> lagana (syntax error). Do <code>for</code> hisson ka order ulta kar dena aur pairs ulte aana. Itni conditions jodna ki line teen baar wrap ho. Lambi comprehension ko "Pythonic hai" kehkar rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>[x for x in a if c]</code> <code>a</code> se kam items de sakta hai. <code>[x if c else y for x in a]</code> hamesha utne hi items deta hai. Sawal dono ki length poochna pasand karte hain.</p></div>

<div class="scn"><h4>Woh one-liner jise koi chhune ki himmat nahi karta tha</h4><p>Ek report script mein chaar lines ki comprehension thi jisme teen conditions the aur woh shut down karne wale ports chunti thi. Jab naya port type juda, kisi ko pakka nahi tha ki ise safely kaise badlein, aur galat edit uplinks disable kar sakta tha. Team ne ise chhote loop mein likha, har line mein ek condition aur comment ke saath, naya port type ek line mein joda, aur kuch karne se pehle print kiya ki kya shut hoga.</p><p><b>Lesson:</b> jis hoshiyari ko koi safely badal na sake woh liability hai.</p></div>

<div class="iv"><p class="q">"Comprehension mein filter aur conditional expression ka kya farq hai?"</p><p>Aakhir ka <code>if</code> filter karta hai, isliye test fail karne wale items gir jaate hain aur output chhota ho sakta hai. Aage ka <code>if ... else</code> conditional expression hai jo har item ko transform karta hai, isliye output ki length same rehti hai. Main yeh poochkar chunta hoon ki items girane hain ya relabel karne hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aakhir ka <code>if</code> filter karta hai; aage ka <code>x if c else y</code> har item par label lagata hai.</li>
<li>Kai <code>for</code> hisse nested loops jaise padhte hain, bahar wala pehle.</li>
<li>Brackets shape tay karte hain: ek jodi flat list deti hai, nested jodiyan lists ki list.</li>
<li>Side effects, bahut conditions ya mushkil padhne wali cheez ke liye plain loop use karo.</li>
<li><code>print</code> ke liye comprehension <code>None</code> ki bekaar list banati hai.</li>
</ul></div>
`}};export{e as default};