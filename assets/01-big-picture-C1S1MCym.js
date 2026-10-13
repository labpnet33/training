var e={id:`big-picture`,h:{en:`What you will learn: the conveyor belt for big logs`,hi:`Aap kya seekhoge: bade logs ke liye conveyor belt`},body:{en:`
<p><b>The idea of this chapter:</b> a router log can be a few hundred lines today and twenty million lines after a bad night. A script that loads the whole log into memory works on the first and falls over on the second. This module teaches the Python way of working through data <i>one record at a time</i>: comprehensions for short transformations, generators for streams, and itertools for the tricks in between.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>Build lists, dictionaries and sets in one readable line with <b>comprehensions</b>, and know when a plain loop is the better choice.</li>
<li>Explain the <b>iterator protocol</b>: what <code>for</code> really does, what <code>iter()</code>, <code>next()</code> and <code>StopIteration</code> mean.</li>
<li>Write <b>generators</b> with <code>yield</code> and chain them into a <b>pipeline</b>: read, parse, filter, count.</li>
<li>Stop early with <code>next()</code> and <code>islice</code>, and combine data with <code>chain</code>, <code>product</code>, <code>zip_longest</code>, <code>groupby</code> and <code>pairwise</code>.</li>
<li>Sort with a <code>key</code> function, and count with <code>Counter</code> and <code>defaultdict</code>.</li>
<li>Recognise the classic traps: <code>len()</code> on a generator, a generator read twice, <code>groupby</code> on unsorted data, and <code>return</code> where you meant <code>yield</code>.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished <code>auto-py-basics</code> (strings and f-strings), <code>auto-py-data</code> (lists, dictionaries, loops) and <code>auto-py-func</code> (functions and files), and preferably <code>py-oop</code> just before this module. From the Linux track, <code>lx-text</code> helps: if you have used <code>grep</code> and pipes, a generator pipeline will feel familiar. Regular expressions appear in two listings and are explained again in <code>auto-parse</code>; here you only need to read them.</p>

<h3>Analogy: carrying boxes versus a conveyor belt</h3>
<p>Imagine a warehouse with a million parcels to check. One way is to load every parcel onto a truck, drive the truck into the checking room, and only then start. You need a huge truck and a huge room, and nothing is checked until everything has arrived. The other way is a <b>conveyor belt</b>: one parcel at a time passes the stations <i>read, parse, filter, count</i>. The room only ever holds one parcel. A list is the truck. A generator is the belt.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="A list holds all lines at once; a generator pipeline passes one line at a time">
<text x="20" y="22" class="svg-accent" font-size="13">List: carry everything first</text>
<rect x="20" y="34" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="61" text-anchor="middle" class="svg-ink" font-size="12">router.log</text>
<rect x="190" y="30" width="250" height="52" rx="8" fill="#fed7aa"/><text x="315" y="62" text-anchor="middle" class="svg-ink" font-size="12">list in memory: every line</text>
<rect x="500" y="34" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="61" text-anchor="middle" class="svg-ink" font-size="12">count</text>
<line x1="130" y1="56" x2="190" y2="56" stroke="#64748b" stroke-width="2"/><line x1="440" y1="56" x2="500" y2="56" stroke="#64748b" stroke-width="2"/>
<text x="20" y="124" class="svg-accent" font-size="13">Generator: one line at a time</text>
<rect x="20" y="136" width="100" height="44" rx="8" fill="#bae6fd"/><text x="70" y="163" text-anchor="middle" class="svg-ink" font-size="12">router.log</text>
<rect x="160" y="136" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="205" y="163" text-anchor="middle" class="svg-ink" font-size="12">read</text>
<rect x="285" y="136" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="163" text-anchor="middle" class="svg-ink" font-size="12">parse</text>
<rect x="410" y="136" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="455" y="163" text-anchor="middle" class="svg-ink" font-size="12">filter</text>
<rect x="535" y="136" width="85" height="44" rx="8" fill="#bbf7d0"/><text x="577" y="163" text-anchor="middle" class="svg-ink" font-size="12">count</text>
<line x1="120" y1="158" x2="160" y2="158" stroke="#64748b" stroke-width="2"/><line x1="250" y1="158" x2="285" y2="158" stroke="#64748b" stroke-width="2"/><line x1="375" y1="158" x2="410" y2="158" stroke="#64748b" stroke-width="2"/><line x1="500" y1="158" x2="535" y2="158" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">only the record on the belt is in hand</text>
</svg><p class="cap">The list is the truck; the generator pipeline is the belt.</p></div>

<h3>The data you will work with</h3>
<p>Both labs use the same file on the server <code>AUTO01</code> (login <code>netadmin</code>): <code>router.log</code>, a 240-line syslog export from three routers, <code>PUN-CORE-R1</code>, <code>BLR-EDGE-R2</code> and <code>HYD-EDGE-R3</code>. Four kinds of message repeat in it. Only one of them, <code>%LINK-3-UPDOWN</code>, is a link going up or down, and that is the one we care about.</p>
<pre class="out">AUTO01$ wc -l router.log
240 router.log
AUTO01$ grep -c "%LINK-3-UPDOWN" router.log
<span class="hl">60</span>
AUTO01$ head -4 router.log
Sep 29 09:00:00 PUN-CORE-R1 <span class="hl">%LINK-3-UPDOWN</span>: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:07 BLR-EDGE-R2 %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up
Sep 29 09:00:14 HYD-EDGE-R3 %OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.3 on GigabitEthernet0/2 from FULL to DOWN, Neighbor Down: Interface down or detached
Sep 29 09:00:21 PUN-CORE-R1 %SYS-5-CONFIG_I: Configured from console by netops</pre>
<p>Sixty of the 240 lines are link events. The server already holds <code>logtool.py</code>, the "truck" version of the job. It reads the file, keeps every link line in a list, and prints the count and the first line:</p>
<pre class="code">def read_events(path):
    events = []
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                events.append(line.rstrip())
    return events


if __name__ == "__main__":
    ev = read_events("router.log")
    print(len(ev), "link events")
    print(ev[0])</pre>
<pre class="out">AUTO01$ python3 logtool.py
<span class="hl">60 link events</span>
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down</pre>
<p>This works perfectly for 240 lines. Now do the arithmetic for a real export.</p>

<div class="eg"><p><b>Worked example.</b> A busy campus collector writes 24 million syslog lines in a month. At about 110 characters a line that is roughly 2.6 GB of text. <code>read_events</code> keeps every <i>matching</i> line, and if one line in four matches you still hold about 6 million strings. A generator pipeline holds one line at a time, whether the file has 240 lines or 24 million. Same answer, a very different bill.</p></div>

<h3>Your two labs</h3>
<ul>
<li><b>Lab 1, Stream a syslog export with a generator pipeline.</b> You rebuild <code>logtool.py</code> as a chain of generators in <code>pipeline.py</code>, count the worst interface with <code>Counter</code>, and stop early with <code>next()</code>.</li>
<li><b>Lab 2, Three generator bugs in the flap report.</b> <code>flaps.py</code> crashes, then reports zero, then prints nonsense. You fix each bug with <code>sed</code>.</li>
</ul>

<div class="note"><p><b>Lab note.</b> The lab interpreter gives exactly the same answers as real Python, but its generators run eagerly. Chapter 5 explains this difference and what it means for how you read lab output.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking comprehensions and generators are "advanced extras" you can skip. Reading a whole log with <code>readlines()</code> because it was easy on the test file. Testing only on a 240-line sample and never asking what happens on 24 million.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Generator" and "iterator" are not the same word. Every generator is an iterator, but not every iterator is a generator. Chapter 4 untangles this.</p></div>

<div class="scn"><h4>The collector that ate the RAM</h4><p>A weekly report script read the whole syslog export with <code>readlines()</code>. It ran fine on the lab sample, then the production server killed it with an out-of-memory error on the first real file. Rewriting the read, parse and filter steps as generators let the same script finish with a flat memory use and an identical report.</p><p><b>Lesson:</b> a script that works on the sample is not yet a script that works on the real file.</p></div>

<div class="iv"><p class="q">"Why would you use a generator instead of building a list?"</p><p>A generator produces one item at a time on demand, so memory stays flat however big the input is, and I can stop early without reading the rest. I use a list when I need the data more than once, need its length, or need random access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A list holds everything at once; a generator hands over one item at a time.</li>
<li>A pipeline of small generators reads like a Linux pipe: read, parse, filter, count.</li>
<li>Both labs use <code>router.log</code>: 240 lines, 60 of them link events.</li>
<li>Prerequisites: <code>auto-py-basics</code>, <code>auto-py-data</code>, <code>auto-py-func</code>, <code>py-oop</code>.</li>
<li>Test on a sample, but design for the real file.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> router log aaj kuch sau lines ka ho sakta hai aur kharab raat ke baad do crore lines ka. Jo script poora log memory mein load karti hai woh pehle par chalti hai aur doosre par gir jaati hai. Yeh module Python ka woh tareeka sikhata hai jisme data ko <i>ek record ek baar mein</i> process karte hain: chhote transformations ke liye comprehensions, streams ke liye generators, aur beech ki chaalon ke liye itertools.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li><b>Comprehensions</b> se lists, dictionaries aur sets ek padhne-layak line mein banana, aur yeh jaanna ki kab seedha loop behtar hai.</li>
<li><b>Iterator protocol</b> samjhana: <code>for</code> asal mein kya karta hai, <code>iter()</code>, <code>next()</code> aur <code>StopIteration</code> ka kya matlab hai.</li>
<li><code>yield</code> se <b>generators</b> likhna aur unhe <b>pipeline</b> mein jodna: read, parse, filter, count.</li>
<li><code>next()</code> aur <code>islice</code> se jaldi rukna, aur <code>chain</code>, <code>product</code>, <code>zip_longest</code>, <code>groupby</code> aur <code>pairwise</code> se data jodna.</li>
<li><code>key</code> function se sort karna, aur <code>Counter</code> aur <code>defaultdict</code> se ginti karna.</li>
<li>Classic jaal pehchanna: generator par <code>len()</code>, do baar padha gaya generator, unsorted data par <code>groupby</code>, aur <code>yield</code> ki jagah <code>return</code>.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapne <code>auto-py-basics</code> (strings aur f-strings), <code>auto-py-data</code> (lists, dictionaries, loops) aur <code>auto-py-func</code> (functions aur files) khatam kiye hone chahiye, aur behtar hai is module se theek pehle <code>py-oop</code> bhi. Linux track se <code>lx-text</code> madad karta hai: agar aapne <code>grep</code> aur pipes use kiye hain to generator pipeline jaani-pehchani lagegi. Regular expressions do listings mein aate hain aur <code>auto-parse</code> mein dobara samjhaye jaate hain; yahan aapko sirf unhe padhna hai.</p>

<h3>Analogy: dabbe uthana versus conveyor belt</h3>
<p>Ek warehouse socho jisme dus lakh parcels check karne hain. Ek tareeka: har parcel truck mein lado, truck ko checking room mein le jao, aur tabhi shuru karo. Aapko bada truck aur bada room chahiye, aur jab tak sab pahunch na jaye kuch check nahi hota. Doosra tareeka <b>conveyor belt</b>: ek parcel ek baar mein stations se guzarta hai: <i>read, parse, filter, count</i>. Room mein hamesha sirf ek parcel hota hai. List truck hai. Generator belt hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="List saari lines ek saath rakhti hai; generator pipeline ek line ek baar mein deti hai">
<text x="20" y="22" class="svg-accent" font-size="13">List: pehle sab uthao</text>
<rect x="20" y="34" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="61" text-anchor="middle" class="svg-ink" font-size="12">router.log</text>
<rect x="190" y="30" width="250" height="52" rx="8" fill="#fed7aa"/><text x="315" y="62" text-anchor="middle" class="svg-ink" font-size="12">memory mein list: har line</text>
<rect x="500" y="34" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="61" text-anchor="middle" class="svg-ink" font-size="12">count</text>
<line x1="130" y1="56" x2="190" y2="56" stroke="#64748b" stroke-width="2"/><line x1="440" y1="56" x2="500" y2="56" stroke="#64748b" stroke-width="2"/>
<text x="20" y="124" class="svg-accent" font-size="13">Generator: ek line ek baar mein</text>
<rect x="20" y="136" width="100" height="44" rx="8" fill="#bae6fd"/><text x="70" y="163" text-anchor="middle" class="svg-ink" font-size="12">router.log</text>
<rect x="160" y="136" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="205" y="163" text-anchor="middle" class="svg-ink" font-size="12">read</text>
<rect x="285" y="136" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="330" y="163" text-anchor="middle" class="svg-ink" font-size="12">parse</text>
<rect x="410" y="136" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="455" y="163" text-anchor="middle" class="svg-ink" font-size="12">filter</text>
<rect x="535" y="136" width="85" height="44" rx="8" fill="#bbf7d0"/><text x="577" y="163" text-anchor="middle" class="svg-ink" font-size="12">count</text>
<line x1="120" y1="158" x2="160" y2="158" stroke="#64748b" stroke-width="2"/><line x1="250" y1="158" x2="285" y2="158" stroke="#64748b" stroke-width="2"/><line x1="375" y1="158" x2="410" y2="158" stroke="#64748b" stroke-width="2"/><line x1="500" y1="158" x2="535" y2="158" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">hath mein sirf belt wala record hai</text>
</svg><p class="cap">List truck hai; generator pipeline belt hai.</p></div>

<h3>Jis data par aap kaam karoge</h3>
<p>Dono labs server <code>AUTO01</code> (login <code>netadmin</code>) par ek hi file use karte hain: <code>router.log</code>, teen routers, <code>PUN-CORE-R1</code>, <code>BLR-EDGE-R2</code> aur <code>HYD-EDGE-R3</code>, ka 240 lines ka syslog export. Isme chaar tarah ke message baar-baar aate hain. Unmein se sirf ek, <code>%LINK-3-UPDOWN</code>, link ke up ya down hone ka hai, aur hum usi ki parwah karte hain.</p>
<pre class="out">AUTO01$ wc -l router.log
240 router.log
AUTO01$ grep -c "%LINK-3-UPDOWN" router.log
<span class="hl">60</span>
AUTO01$ head -4 router.log
Sep 29 09:00:00 PUN-CORE-R1 <span class="hl">%LINK-3-UPDOWN</span>: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:07 BLR-EDGE-R2 %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up
Sep 29 09:00:14 HYD-EDGE-R3 %OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.3 on GigabitEthernet0/2 from FULL to DOWN, Neighbor Down: Interface down or detached
Sep 29 09:00:21 PUN-CORE-R1 %SYS-5-CONFIG_I: Configured from console by netops</pre>
<p>240 mein se saath lines link events hain. Server par pehle se <code>logtool.py</code> maujood hai, kaam ka "truck" version. Woh file padhta hai, har link line ko list mein rakhta hai, aur count aur pehli line print karta hai:</p>
<pre class="code">def read_events(path):
    events = []
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                events.append(line.rstrip())
    return events


if __name__ == "__main__":
    ev = read_events("router.log")
    print(len(ev), "link events")
    print(ev[0])</pre>
<pre class="out">AUTO01$ python3 logtool.py
<span class="hl">60 link events</span>
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down</pre>
<p>240 lines ke liye yeh bilkul theek chalta hai. Ab asli export ka hisaab lagao.</p>

<div class="eg"><p><b>Worked example.</b> Ek busy campus collector mahine mein 24 million syslog lines likhta hai. Lagbhag 110 characters per line ke hisaab se yeh takriban 2.6 GB text hai. <code>read_events</code> har <i>matching</i> line rakhta hai, aur agar chaar mein se ek line match kare to bhi aap lagbhag 6 million strings pakde hue ho. Generator pipeline ek baar mein ek line rakhti hai, chahe file mein 240 lines ho ya 24 million. Jawab wahi, bill bilkul alag.</p></div>

<h3>Aapke do labs</h3>
<ul>
<li><b>Lab 1, Generator pipeline se syslog export stream karo.</b> Aap <code>logtool.py</code> ko <code>pipeline.py</code> mein generators ki chain ki tarah dobara banate ho, <code>Counter</code> se sabse kharab interface gintte ho, aur <code>next()</code> se jaldi rukte ho.</li>
<li><b>Lab 2, Flap report mein teen generator bugs.</b> <code>flaps.py</code> crash hota hai, phir zero batata hai, phir bakwaas print karta hai. Aap har bug <code>sed</code> se theek karte ho.</li>
</ul>

<div class="note"><p><b>Lab note.</b> Lab interpreter bilkul asli Python jaise jawab deta hai, par uske generators eagerly chalte hain. Chapter 5 is farq ko aur yeh batata hai ki lab output kaise padhna chahiye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Comprehensions aur generators ko "advanced extras" samajhna jo chhod sakte ho. Poora log <code>readlines()</code> se padhna kyunki test file par aasaan tha. Sirf 240 lines ke sample par test karna aur kabhi na poochna ki 24 million par kya hoga.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Generator" aur "iterator" ek hi shabd nahi hain. Har generator iterator hota hai, par har iterator generator nahi hota. Chapter 4 ise suljhata hai.</p></div>

<div class="scn"><h4>Jis collector ne RAM kha li</h4><p>Ek weekly report script poora syslog export <code>readlines()</code> se padhti thi. Lab sample par theek chali, phir production server ne pehli asli file par out-of-memory error se use maar diya. Read, parse aur filter steps ko generators mein likhne se wahi script flat memory use ke saath khatam hui aur report bilkul wahi aayi.</p><p><b>Lesson:</b> jo script sample par chalti hai woh abhi asli file par chalne wali script nahi hai.</p></div>

<div class="iv"><p class="q">"List banane ki jagah generator kyon use karoge?"</p><p>Generator maang par ek item ek baar mein deta hai, isliye input kitna bhi bada ho memory flat rehti hai, aur main baaki padhe bina jaldi ruk sakta hoon. List tab use karta hoon jab data ek se zyada baar chahiye, length chahiye, ya random access chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List sab kuch ek saath rakhti hai; generator ek item ek baar mein deta hai.</li>
<li>Chhote generators ki pipeline Linux pipe jaisi padhti hai: read, parse, filter, count.</li>
<li>Dono labs <code>router.log</code> use karte hain: 240 lines, unmein 60 link events.</li>
<li>Prerequisites: <code>auto-py-basics</code>, <code>auto-py-data</code>, <code>auto-py-func</code>, <code>py-oop</code>.</li>
<li>Sample par test karo, par design asli file ke liye karo.</li>
</ul></div>
`}};export{e as default};