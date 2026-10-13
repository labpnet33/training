var e={id:`generators`,h:{en:`Generators and yield: Lab 1 steps 1 and 2`,hi:`Generators aur yield: Lab 1 ke step 1 aur 2`},body:{en:`
<p><b>The idea of this chapter:</b> a <b>generator</b> is a function that can hand back a value, pause, and later carry on from where it stopped. Replace <code>return</code> with <code>yield</code> and your function becomes a stream you can pull from. This chapter builds the first generator of Lab 1 and explains one important difference between the lab and real Python.</p>

<h3>Analogy: a bookmark</h3>
<p>A normal function is a book you read from cover to cover in one sitting and then close for good. A generator is a book with a bookmark. Each time the caller asks for the next item, you read until the next <code>yield</code>, hand over that item, and put the bookmark in. On the next request you open the book at the bookmark and carry on.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="The caller calls next(); the generator runs to yield, hands back one value and pauses">
<rect x="20" y="20" width="260" height="140" rx="10" fill="#ddd6fe"/>
<text x="150" y="42" text-anchor="middle" class="svg-accent" font-size="13">generator: link_events()</text>
<text x="40" y="70" class="svg-ink" font-size="12">open the file</text>
<text x="40" y="94" class="svg-ink" font-size="12">for line in f:</text>
<text x="56" y="118" class="svg-ink" font-size="12">if link line: yield line</text>
<rect x="30" y="104" width="240" height="22" rx="4" fill="none" stroke="#2563eb" stroke-width="2"/>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="11">paused here, bookmark kept</text>
<rect x="400" y="50" width="220" height="80" rx="10" fill="#bae6fd"/>
<text x="510" y="80" text-anchor="middle" class="svg-ink" font-size="13">caller</text>
<text x="510" y="102" text-anchor="middle" class="svg-muted" font-size="11">for loop, next(), list()</text>
<line x1="400" y1="70" x2="280" y2="70" stroke="#64748b" stroke-width="2"/><text x="340" y="62" text-anchor="middle" class="svg-accent" font-size="12">next()</text>
<line x1="280" y1="112" x2="400" y2="112" stroke="#64748b" stroke-width="2"/><text x="340" y="132" text-anchor="middle" class="svg-accent" font-size="12">one value</text>
</svg><p class="cap">The caller asks, the generator answers with one value and waits.</p></div>

<h3>Your first generator: Lab 1, task 2</h3>
<p>Task 1 of the lab is to run the list version, <code>python3 logtool.py</code>, which printed <code>60 link events</code> (chapter 1). Task 2 asks for <code>pipeline.py</code> with a generator function <code>link_events(path)</code>. Compare it with <code>read_events</code>: the file handling is the same, but there is no list, no <code>append</code> and no <code>return</code> of a list; each matching line is handed out with <code>yield</code>.</p>
<pre class="code">AUTO01$ cat &gt; pipeline.py &lt;&lt;'EOF'
def link_events(path):
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                yield line.rstrip()


events = link_events("router.log")
print(type(events).__name__)
print(next(events))
print(next(events))
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
<span class="hl">generator</span>
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:28 BLR-EDGE-R2 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up</pre>
<p>The answer to the task is <b>generator</b>. Calling <code>link_events(...)</code> did not return a list or a line; it returned a generator object. Each <code>next()</code> gave the next link event, and the other 180 lines of the file (the OSPF, protocol and config messages) were skipped by the <code>if</code>.</p>

<h3>List versus generator, side by side</h3>
<pre class="code">as_list = read_events("router.log")
as_gen = link_events("router.log")
print(type(as_list).__name__, len(as_list))
print(type(as_gen).__name__)
print(next(as_gen))
print(next(as_gen))
print(sum(1 for _ in as_gen))
print(next(as_gen, "empty"))
print(list(as_gen))</pre>
<pre class="out">AUTO01$ python3 c5b.py
list 60
generator
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:28 BLR-EDGE-R2 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up
<span class="hl">58</span>
empty
[]</pre>
<p>Two items were taken with <code>next</code>, so <code>sum</code> counted the remaining <b>58</b>. After that the generator is empty: <code>next</code> with a default returns <code>"empty"</code> and <code>list</code> gives <code>[]</code>. A generator is read once, like the token machine in chapter 4.</p>

<h3>Generator expressions and yield from</h3>
<p>A comprehension with round brackets is a <b>generator expression</b>: the same syntax, but it produces a stream instead of a list. When it is the only argument of a function, the extra brackets can be dropped. <code>yield from</code> hands out everything from another iterable, so one generator can be built from others.</p>
<pre class="code">def ports(prefix, count):
    for n in range(1, count + 1):
        yield prefix + str(n)

def all_events(*paths):
    for p in paths:
        yield from link_events(p)

print(list(ports("Gi0/", 4)))
gen = (n * 2 for n in range(5))
print(type(gen).__name__)
print(list(gen))
print(sum(n for n in range(5)))
print(any(r for r in [0, 0, 1]), all(r for r in [1, 1, 0]))
print(sum(1 for _ in all_events("router.log", "router.log")))</pre>
<pre class="out">AUTO01$ python3 c5b.py
['Gi0/1', 'Gi0/2', 'Gi0/3', 'Gi0/4']
generator
[0, 2, 4, 6, 8]
10
True False
<span class="hl">120</span></pre>
<p>The last line reads the same file twice through one stream and counts <b>120</b> link events, twice 60. This is how you would stream the exports of several collectors as if they were one file. Functions such as <code>sum</code>, <code>any</code>, <code>all</code>, <code>min</code>, <code>max</code> and <code>sorted</code> accept a generator directly.</p>

<h3>What real Python does, and what the lab does</h3>
<p>In real Python (CPython) a generator is <b>lazy</b>. Calling <code>link_events("router.log")</code> runs none of its body. The first <code>next()</code> opens the file and runs until the first <code>yield</code>, then freezes. The next <code>next()</code> resumes right after that <code>yield</code>. At any moment only one line is in memory, and if you stop after ten items the rest of the file is never read. That is where the memory saving comes from.</p>
<div class="warn"><p><b>Lab difference.</b> The lab interpreter runs a generator <b>eagerly</b>: the whole body runs the first time you call <code>next()</code> or start a loop, and the results wait in the background. Every value, every order and every final answer is identical to real Python, but you must not use lab output as evidence of memory or time savings. Two practical rules follow. First, do not put <code>print</code> calls inside a generator to watch the order of work; the interleaving you would see in real Python does not appear in the lab. Second, a generator that never ends, such as <code>while True: yield</code>, cannot be used in the lab: the safety guard stops the script with a <code>RuntimeError</code> after 400000 steps. Real Python handles endless generators perfectly well.</p></div>

<div class="exam"><p><b>Exam trap.</b> A function with <code>yield</code> anywhere in its body is a generator function, even if the <code>yield</code> sits in a branch that never runs. Calling it never returns the yielded values directly; it returns a generator object.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Printing the generator and expecting its contents (you get an object description, not lines). Calling <code>len()</code> on it. Reading it twice. Writing <code>return value</code> in the loop when you meant <code>yield value</code>; Lab 2 has exactly that bug.</p></div>

<div class="scn"><h4>The first match, not the whole file</h4><p>On-call at 3 a.m., an engineer needed the time of the first link-down after a maintenance window in a 4 GB export. The old script built a list of all link events first and took minutes. A generator with <code>next(...)</code> stopped at the first match and answered at once.</p><p><b>Lesson:</b> when you only need the first match, never read the rest.</p></div>

<div class="iv"><p class="q">"What does the yield keyword do?"</p><p>It turns the function into a generator. When the generator is asked for the next value, execution runs up to <code>yield</code>, hands that value to the caller and pauses with all local variables kept. The next request resumes right after the <code>yield</code>. When the function ends, the caller gets <code>StopIteration</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A function with <code>yield</code> returns a generator; <code>type(...).__name__</code> says <code>generator</code>.</li>
<li>Pull values with <code>for</code>, <code>next()</code>, <code>list()</code>, <code>sum()</code> and friends.</li>
<li>A generator is used up after one pass; <code>next(g, default)</code> gives a safe end.</li>
<li><code>(x for x in ...)</code> is a generator expression; <code>yield from</code> chains generators.</li>
<li>Real Python is lazy; the lab runs eagerly with identical results, so claim no memory savings from lab output.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <b>generator</b> aisa function hai jo value wapas de sakta hai, ruk sakta hai, aur baad mein wahin se aage chal sakta hai jahan ruka tha. <code>return</code> ki jagah <code>yield</code> likho aur aapka function ek stream ban jaata hai jisse aap kheench sakte ho. Yeh chapter Lab 1 ka pehla generator banata hai aur lab aur asli Python ke beech ek zaroori farq samjhata hai.</p>

<h3>Analogy: bookmark</h3>
<p>Normal function ek kitab hai jise aap ek baithak mein cover se cover tak padhkar hamesha ke liye band kar dete ho. Generator bookmark wali kitab hai. Caller jab bhi agla item maangta hai, aap agle <code>yield</code> tak padhte ho, woh item de dete ho aur bookmark laga dete ho. Agli maang par kitab bookmark par kholte ho aur aage chalte ho.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Caller next() bulata hai; generator yield tak chalta hai, ek value deta hai aur ruk jaata hai">
<rect x="20" y="20" width="260" height="140" rx="10" fill="#ddd6fe"/>
<text x="150" y="42" text-anchor="middle" class="svg-accent" font-size="13">generator: link_events()</text>
<text x="40" y="70" class="svg-ink" font-size="12">file kholo</text>
<text x="40" y="94" class="svg-ink" font-size="12">for line in f:</text>
<text x="56" y="118" class="svg-ink" font-size="12">if link line: yield line</text>
<rect x="30" y="104" width="240" height="22" rx="4" fill="none" stroke="#2563eb" stroke-width="2"/>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="11">yahan ruka, bookmark laga hai</text>
<rect x="400" y="50" width="220" height="80" rx="10" fill="#bae6fd"/>
<text x="510" y="80" text-anchor="middle" class="svg-ink" font-size="13">caller</text>
<text x="510" y="102" text-anchor="middle" class="svg-muted" font-size="11">for loop, next(), list()</text>
<line x1="400" y1="70" x2="280" y2="70" stroke="#64748b" stroke-width="2"/><text x="340" y="62" text-anchor="middle" class="svg-accent" font-size="12">next()</text>
<line x1="280" y1="112" x2="400" y2="112" stroke="#64748b" stroke-width="2"/><text x="340" y="132" text-anchor="middle" class="svg-accent" font-size="12">ek value</text>
</svg><p class="cap">Caller maangta hai, generator ek value deta hai aur intezaar karta hai.</p></div>

<h3>Aapka pehla generator: Lab 1, task 2</h3>
<p>Lab ka task 1 list version chalana hai, <code>python3 logtool.py</code>, jisne <code>60 link events</code> print kiya (chapter 1). Task 2 mein <code>pipeline.py</code> chahiye jisme generator function <code>link_events(path)</code> ho. Use <code>read_events</code> se compare karo: file handling wahi hai, par list nahi, <code>append</code> nahi aur list ka <code>return</code> nahi; har matching line <code>yield</code> se di jaati hai.</p>
<pre class="code">AUTO01$ cat &gt; pipeline.py &lt;&lt;'EOF'
def link_events(path):
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                yield line.rstrip()


events = link_events("router.log")
print(type(events).__name__)
print(next(events))
print(next(events))
EOF
AUTO01$ python3 pipeline.py</pre>
<pre class="out">AUTO01$ python3 pipeline.py
<span class="hl">generator</span>
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:28 BLR-EDGE-R2 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up</pre>
<p>Task ka jawab <b>generator</b> hai. <code>link_events(...)</code> call karne par list ya line nahi mili; generator object mila. Har <code>next()</code> ne agla link event diya, aur file ki baaki 180 lines (OSPF, protocol aur config messages) <code>if</code> ne skip kar di.</p>

<h3>List versus generator, saath-saath</h3>
<pre class="code">as_list = read_events("router.log")
as_gen = link_events("router.log")
print(type(as_list).__name__, len(as_list))
print(type(as_gen).__name__)
print(next(as_gen))
print(next(as_gen))
print(sum(1 for _ in as_gen))
print(next(as_gen, "empty"))
print(list(as_gen))</pre>
<pre class="out">AUTO01$ python3 c5b.py
list 60
generator
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:28 BLR-EDGE-R2 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up
<span class="hl">58</span>
empty
[]</pre>
<p><code>next</code> se do items liye gaye, isliye <code>sum</code> ne baaki <b>58</b> ginte. Uske baad generator khaali hai: default ke saath <code>next</code> <code>"empty"</code> deta hai aur <code>list</code> <code>[]</code> deti hai. Generator ek hi baar padha jaata hai, chapter 4 ki token machine ki tarah.</p>

<h3>Generator expressions aur yield from</h3>
<p>Round brackets wali comprehension <b>generator expression</b> hai: syntax wahi, par list ki jagah stream banati hai. Jab woh function ka akela argument ho, to extra brackets hata sakte ho. <code>yield from</code> kisi doosre iterable ka sab kuch de deta hai, isliye ek generator doosron se banaya ja sakta hai.</p>
<pre class="code">def ports(prefix, count):
    for n in range(1, count + 1):
        yield prefix + str(n)

def all_events(*paths):
    for p in paths:
        yield from link_events(p)

print(list(ports("Gi0/", 4)))
gen = (n * 2 for n in range(5))
print(type(gen).__name__)
print(list(gen))
print(sum(n for n in range(5)))
print(any(r for r in [0, 0, 1]), all(r for r in [1, 1, 0]))
print(sum(1 for _ in all_events("router.log", "router.log")))</pre>
<pre class="out">AUTO01$ python3 c5b.py
['Gi0/1', 'Gi0/2', 'Gi0/3', 'Gi0/4']
generator
[0, 2, 4, 6, 8]
10
True False
<span class="hl">120</span></pre>
<p>Aakhri line wahi file ek stream se do baar padhti hai aur <b>120</b> link events ginti hai, 60 ka do guna. Isi tarah aap kai collectors ke exports ko ek file ki tarah stream karoge. <code>sum</code>, <code>any</code>, <code>all</code>, <code>min</code>, <code>max</code> aur <code>sorted</code> jaise functions generator ko seedha le lete hain.</p>

<h3>Asli Python kya karta hai, aur lab kya karta hai</h3>
<p>Asli Python (CPython) mein generator <b>lazy</b> hota hai. <code>link_events("router.log")</code> call karne par uski body ka kuch nahi chalta. Pehla <code>next()</code> file kholta hai aur pehle <code>yield</code> tak chalta hai, phir jam jaata hai. Agla <code>next()</code> us <code>yield</code> ke theek baad se aage badhta hai. Kisi bhi pal sirf ek line memory mein hoti hai, aur dus items ke baad ruk gaye to file ka baaki hissa kabhi padha hi nahi jaata. Memory ki bachat yahin se aati hai.</p>
<div class="warn"><p><b>Lab difference.</b> Lab interpreter generator ko <b>eagerly</b> chalata hai: <code>next()</code> pehli baar call karte hi ya loop shuru karte hi poori body chal jaati hai, aur results peeche intezaar karte hain. Har value, har order aur har final jawab asli Python jaisa hi hota hai, par lab output ko memory ya time bachat ka saboot nahi maan sakte. Do vyavaharik niyam nikalte hain. Pehla, kaam ka order dekhne ke liye generator ke andar <code>print</code> mat lagao; asli Python mein jo interleaving dikhti hai woh lab mein nahi dikhegi. Doosra, kabhi khatam na hone wala generator, jaise <code>while True: yield</code>, lab mein use nahi ho sakta: safety guard 400000 steps ke baad script ko <code>RuntimeError</code> ke saath rok deta hai. Asli Python endless generators ko bilkul theek sambhalta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jis function ki body mein kahin bhi <code>yield</code> ho woh generator function hai, chahe <code>yield</code> aisi branch mein ho jo kabhi na chale. Use call karne par yielded values seedhe nahi milti; generator object milta hai.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Generator print karke uska content expect karna (object ka description milta hai, lines nahi). Us par <code>len()</code> lagana. Use do baar padhna. Loop mein <code>yield value</code> ki jagah <code>return value</code> likhna; Lab 2 mein bilkul yahi bug hai.</p></div>

<div class="scn"><h4>Poori file nahi, pehla match</h4><p>Raat ke 3 baje on-call engineer ko 4 GB export mein maintenance window ke baad ka pehla link-down time chahiye tha. Purani script pehle saare link events ki list banati thi aur minutes leti thi. <code>next(...)</code> wale generator ne pehle match par ruk kar turant jawab de diya.</p><p><b>Lesson:</b> sirf pehla match chahiye to baaki kabhi mat padho.</p></div>

<div class="iv"><p class="q">"yield keyword kya karta hai?"</p><p>Woh function ko generator bana deta hai. Jab generator se agli value maangi jaati hai, execution <code>yield</code> tak chalti hai, woh value caller ko deti hai aur saare local variables ke saath ruk jaati hai. Agli maang <code>yield</code> ke theek baad se aage badhati hai. Function khatam hone par caller ko <code>StopIteration</code> milta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>yield</code> wala function generator return karta hai; <code>type(...).__name__</code> <code>generator</code> batata hai.</li>
<li>Values <code>for</code>, <code>next()</code>, <code>list()</code>, <code>sum()</code> jaise tools se kheencho.</li>
<li>Generator ek pass ke baad khatam; <code>next(g, default)</code> safe ant deta hai.</li>
<li><code>(x for x in ...)</code> generator expression hai; <code>yield from</code> generators ko jodta hai.</li>
<li>Asli Python lazy hai; lab eagerly chalta hai, results same, isliye lab output se memory bachat ka daava mat karo.</li>
</ul></div>
`}};export{e as default};