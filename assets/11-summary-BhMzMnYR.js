var e={id:`summary`,h:{en:`Summary, can-do checklist, glossary and cheat-sheet`,hi:`Summary, can-do checklist, glossary aur cheat-sheet`},body:{en:`
<p><b>The idea of this chapter:</b> one page to check yourself against before the labs, an interview or the next module. If you can do everything in the checklist without looking back, you own this topic.</p>

<h3>The big picture in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Summary map: comprehensions for small transformations, generators for streams, itertools for combining, Counter and sorted for answers">
<rect x="10" y="14" width="300" height="70" rx="10" fill="#bae6fd"/><text x="160" y="40" text-anchor="middle" class="svg-ink" font-size="13">Comprehensions</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="11">list, dict, set, one clear job</text>
<rect x="330" y="14" width="300" height="70" rx="10" fill="#ddd6fe"/><text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="13">Generators and yield</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="11">one record at a time, one pass</text>
<rect x="10" y="110" width="300" height="70" rx="10" fill="#fde68a"/><text x="160" y="136" text-anchor="middle" class="svg-ink" font-size="13">itertools</text><text x="160" y="158" text-anchor="middle" class="svg-muted" font-size="11">chain, islice, product, groupby ...</text>
<rect x="330" y="110" width="300" height="70" rx="10" fill="#bbf7d0"/><text x="480" y="136" text-anchor="middle" class="svg-ink" font-size="13">Counter, defaultdict, sorted</text><text x="480" y="158" text-anchor="middle" class="svg-muted" font-size="11">turn the stream into answers</text>
</svg><p class="cap">Shape the data, stream it, combine it, then count it.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can turn a loop that builds a list into a list, dictionary or set comprehension, and say which brackets give which type.</li>
<li>I can tell a trailing <code>if</code> (filter) from a leading <code>x if c else y</code> (label), and I know when to write a plain loop.</li>
<li>I can explain <code>iter()</code>, <code>next()</code> and <code>StopIteration</code>, and what a <code>for</code> loop does with them.</li>
<li>I can write a generator with <code>yield</code>, and check its type with <code>type(x).__name__</code>.</li>
<li>I can chain generators into a pipeline: read, filter, parse, then count with <code>Counter</code>.</li>
<li>I can stop early with <code>next(gen, None)</code> or <code>islice</code>, and count without a list using <code>sum(1 for _ in gen)</code>.</li>
<li>I can use <code>chain</code>, <code>product</code>, <code>combinations</code>, <code>zip_longest</code>, <code>groupby</code> (on sorted input) and <code>pairwise</code>.</li>
<li>I can sort with a <code>key</code>, and get the top N with <code>most_common</code>.</li>
<li>I can spot the three Lab 2 bugs and fix each with one <code>sed</code> command, then cross-check with <code>grep -c</code>.</li>
<li>I can explain how the lab's eager generators differ from lazy generators in real Python.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Comprehension</dt><dd>One-line expression that builds a list, dictionary or set from an iterable, with an optional filter.</dd>
<dt>Iterable</dt><dd>Anything you can loop over; <code>iter()</code> turns it into an iterator.</dd>
<dt>Iterator</dt><dd>An object whose <code>next()</code> gives one item at a time and remembers its place.</dd>
<dt>StopIteration</dt><dd>The signal that an iterator has nothing left; a <code>for</code> loop handles it for you.</dd>
<dt>Generator</dt><dd>An iterator made by a function containing <code>yield</code>, or by a parenthesised comprehension.</dd>
<dt>Generator expression</dt><dd><code>(x for x in items)</code>: a comprehension that streams instead of building a list.</dd>
<dt>Lazy</dt><dd>Doing work only when the next value is asked for. Real Python generators are lazy; the lab's run eagerly.</dd>
<dt>Pipeline</dt><dd>Generators connected so that each takes the stream of the previous one.</dd>
<dt>Exhausted</dt><dd>A one-shot iterator that has delivered everything and now stays empty.</dd>
<dt>Counter</dt><dd>A dictionary subclass that counts values; <code>most_common(n)</code> ranks them.</dd>
<dt>defaultdict</dt><dd>A dictionary that creates a default value (empty list, zero) on first use of a key.</dd>
<dt>Key function</dt><dd>A function given to <code>sorted</code>, <code>min</code> or <code>max</code> that says what to compare.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li><code>[x for x in a]</code> list, <code>{k: v for ...}</code> dictionary, <code>{x for ...}</code> set, <code>(x for ...)</code> generator.</li>
<li>A generator has no <code>len()</code>, is always truthy, and can be read once.</li>
<li><code>return</code> inside a loop gives one value; <code>yield</code> gives a stream.</li>
<li><code>zip</code>, <code>map</code>, <code>enumerate</code>, <code>reversed</code> and files are one-shot; lists and ranges are not.</li>
<li><code>groupby</code> groups only neighbours, so sort first with the same key.</li>
<li><code>sorted()</code> returns a new list; <code>.sort()</code> returns <code>None</code>.</li>
<li>A <code>Counter</code> returns 0 for a missing key; a <code>defaultdict</code> creates the key on read.</li>
<li>Lambdas in loops capture the variable, not the value; use <code>n=n</code>.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code"># comprehensions
names = [d["name"] for d in devices if d["up"]]
ips   = {d["name"]: d["ip"] for d in devices}
roles = {d["role"] for d in devices}

# generator pipeline
def link_events(path):
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                yield line.rstrip()

first  = next(gen, None)                  # first match or None
count  = sum(1 for _ in gen)              # count without a list
top    = Counter(r["iface"] for r in recs).most_common(3)
byhost = sorted(recs, key=lambda r: (r["host"], r["time"]))</pre>

<div class="eg"><p><b>Where this module leads.</b> The next modules in the data group (<code>auto-formats</code>, <code>auto-parse</code>, <code>py-textfsm</code>) turn device output into records. Everything you learned here is how you process those records at any size: stream them, filter them, group them and count them.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> Reading a generator twice. Using <code>len()</code> on it. Writing <code>return</code> where you meant <code>yield</code>. Running <code>groupby</code> on unsorted data. Claiming memory savings from lab output.</p></div>
<div class="exam"><p><b>Exam trap.</b> Generator and iterator are not synonyms. Every generator is an iterator, but a list iterator or a file object is an iterator that is not a generator.</p></div>

<div class="scn"><h4>From a 3 GB script to a 3 MB script</h4><p>A team inherited a flap-report script that needed 3 GB of memory on weekly exports. A generator pipeline with a Counter at the end produced the same report using a few megabytes, and a unit test with a ten-line sample log proved it. They kept the old output next to the new one for two weeks before switching.</p><p><b>Lesson:</b> stream big data, test small data, and compare old and new before you switch.</p></div>

<div class="iv"><p class="q">"Summarise comprehensions, generators and itertools in a minute."</p><p>Comprehensions build a list, dictionary or set in one line from a loop and a filter. Generators produce values one at a time with <code>yield</code>, so they stream and stay memory-friendly but can only be read once. <code>itertools</code> adds ready-made pieces such as <code>chain</code>, <code>islice</code> and <code>groupby</code> that work on streams. I finish with <code>Counter</code> or <code>sorted</code> to turn the stream into an answer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Comprehension for a result, generator for a stream, loop for an action.</li>
<li>Streams are one-shot: fresh generator per pass, or a list if you need it twice.</li>
<li>Pipelines of small generators are easy to test and reuse.</li>
<li>Count and rank with <code>Counter</code>, <code>sorted</code> and <code>key</code>.</li>
<li>Always cross-check a surprising number with an independent method.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> labs, interview ya agle module se pehle khud ko check karne ke liye ek page. Agar aap checklist ka sab kuch peeche dekhe bina kar sakte ho, to yeh topic aapka hai.</p>

<h3>Poori tasveer ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Summary map: chhote transformations ke liye comprehensions, streams ke liye generators, jodne ke liye itertools, jawab ke liye Counter aur sorted">
<rect x="10" y="14" width="300" height="70" rx="10" fill="#bae6fd"/><text x="160" y="40" text-anchor="middle" class="svg-ink" font-size="13">Comprehensions</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="11">list, dict, set, ek saaf kaam</text>
<rect x="330" y="14" width="300" height="70" rx="10" fill="#ddd6fe"/><text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="13">Generators aur yield</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="11">ek record ek baar mein, ek pass</text>
<rect x="10" y="110" width="300" height="70" rx="10" fill="#fde68a"/><text x="160" y="136" text-anchor="middle" class="svg-ink" font-size="13">itertools</text><text x="160" y="158" text-anchor="middle" class="svg-muted" font-size="11">chain, islice, product, groupby ...</text>
<rect x="330" y="110" width="300" height="70" rx="10" fill="#bbf7d0"/><text x="480" y="136" text-anchor="middle" class="svg-ink" font-size="13">Counter, defaultdict, sorted</text><text x="480" y="158" text-anchor="middle" class="svg-muted" font-size="11">stream ko jawab mein badlo</text>
</svg><p class="cap">Data ko shape do, stream karo, jodo, phir gino.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main list banane wale loop ko list, dictionary ya set comprehension mein badal sakta hoon, aur bata sakta hoon kaunse brackets kaunsa type dete hain.</li>
<li>Main aakhir ke <code>if</code> (filter) aur aage ke <code>x if c else y</code> (label) ka farq jaanta hoon, aur yeh bhi ki kab seedha loop likhna hai.</li>
<li>Main <code>iter()</code>, <code>next()</code> aur <code>StopIteration</code> samjha sakta hoon, aur <code>for</code> loop unke saath kya karta hai.</li>
<li>Main <code>yield</code> se generator likh sakta hoon, aur uska type <code>type(x).__name__</code> se check kar sakta hoon.</li>
<li>Main generators ko pipeline mein jod sakta hoon: read, filter, parse, phir <code>Counter</code> se ginti.</li>
<li>Main <code>next(gen, None)</code> ya <code>islice</code> se jaldi ruk sakta hoon, aur <code>sum(1 for _ in gen)</code> se bina list ke gin sakta hoon.</li>
<li>Main <code>chain</code>, <code>product</code>, <code>combinations</code>, <code>zip_longest</code>, <code>groupby</code> (sorted input par) aur <code>pairwise</code> use kar sakta hoon.</li>
<li>Main <code>key</code> se sort kar sakta hoon, aur <code>most_common</code> se top N nikal sakta hoon.</li>
<li>Main Lab 2 ke teeno bugs pehchan sakta hoon aur har ek ko ek <code>sed</code> command se theek karke <code>grep -c</code> se cross-check kar sakta hoon.</li>
<li>Main samjha sakta hoon ki lab ke eager generators asli Python ke lazy generators se kaise alag hain.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Comprehension</dt><dd>Ek-line expression jo kisi iterable se list, dictionary ya set banata hai, optional filter ke saath.</dd>
<dt>Iterable</dt><dd>Jis par loop chala sako; <code>iter()</code> use iterator banata hai.</dd>
<dt>Iterator</dt><dd>Aisa object jiska <code>next()</code> ek item ek baar mein deta hai aur apni jagah yaad rakhta hai.</dd>
<dt>StopIteration</dt><dd>Signal ki iterator ke paas kuch nahi bacha; <code>for</code> loop ise aapke liye sambhalta hai.</dd>
<dt>Generator</dt><dd><code>yield</code> wale function se, ya bracket wali comprehension se bana iterator.</dd>
<dt>Generator expression</dt><dd><code>(x for x in items)</code>: aisi comprehension jo list banane ki jagah stream karti hai.</dd>
<dt>Lazy</dt><dd>Kaam tabhi karna jab agli value maangi jaye. Asli Python ke generators lazy hain; lab ke eagerly chalte hain.</dd>
<dt>Pipeline</dt><dd>Jude hue generators jisme har ek pichhle ka stream leta hai.</dd>
<dt>Exhausted</dt><dd>One-shot iterator jo sab de chuka hai aur ab khaali rehta hai.</dd>
<dt>Counter</dt><dd>Dictionary ka subclass jo values ginta hai; <code>most_common(n)</code> unhe rank karta hai.</dd>
<dt>defaultdict</dt><dd>Dictionary jo key ke pehle use par default value (khaali list, zero) bana deti hai.</dd>
<dt>Key function</dt><dd><code>sorted</code>, <code>min</code> ya <code>max</code> ko diya function jo batata hai kya compare karna hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li><code>[x for x in a]</code> list, <code>{k: v for ...}</code> dictionary, <code>{x for ...}</code> set, <code>(x for ...)</code> generator.</li>
<li>Generator ka <code>len()</code> nahi hota, woh hamesha truthy hai, aur ek baar padha ja sakta hai.</li>
<li>Loop ke andar <code>return</code> ek value deta hai; <code>yield</code> stream deta hai.</li>
<li><code>zip</code>, <code>map</code>, <code>enumerate</code>, <code>reversed</code> aur files one-shot hain; lists aur ranges nahi.</li>
<li><code>groupby</code> sirf padosiyon ko group karta hai, isliye pehle usi key se sort karo.</li>
<li><code>sorted()</code> nayi list deta hai; <code>.sort()</code> <code>None</code> deta hai.</li>
<li><code>Counter</code> missing key par 0 deta hai; <code>defaultdict</code> padhne par key bana deta hai.</li>
<li>Loop ke lambdas value nahi, variable pakadte hain; <code>n=n</code> use karo.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code"># comprehensions
names = [d["name"] for d in devices if d["up"]]
ips   = {d["name"]: d["ip"] for d in devices}
roles = {d["role"] for d in devices}

# generator pipeline
def link_events(path):
    with open(path) as f:
        for line in f:
            if "%LINK-3-UPDOWN" in line:
                yield line.rstrip()

first  = next(gen, None)                  # first match or None
count  = sum(1 for _ in gen)              # count without a list
top    = Counter(r["iface"] for r in recs).most_common(3)
byhost = sorted(recs, key=lambda r: (r["host"], r["time"]))</pre>

<div class="eg"><p><b>Yeh module kahan le jaata hai.</b> Data group ke agle modules (<code>auto-formats</code>, <code>auto-parse</code>, <code>py-textfsm</code>) device output ko records mein badalte hain. Yahan jo seekha woh un records ko kisi bhi size par process karne ka tareeka hai: unhe stream karo, filter karo, group karo aur gino.</p></div>

<div class="warn"><p><b>Bachne wali aam galtiyan.</b> Generator ko do baar padhna. Us par <code>len()</code> lagana. <code>yield</code> ki jagah <code>return</code> likhna. Unsorted data par <code>groupby</code> chalana. Lab output se memory bachat ka daava karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Generator aur iterator ek jaise shabd nahi hain. Har generator iterator hai, par list iterator ya file object aisa iterator hai jo generator nahi hai.</p></div>

<div class="scn"><h4>3 GB ki script se 3 MB ki script tak</h4><p>Ek team ko virasat mein flap-report script mili jo weekly exports par 3 GB memory leti thi. Aakhir mein Counter wali generator pipeline ne wahi report kuch megabytes mein de di, aur dus lines ke sample log wale unit test ne saabit kiya. Switch karne se pehle unhone do hafte purana aur naya output saath rakha.</p><p><b>Lesson:</b> bade data ko stream karo, chhote data par test karo, aur switch se pehle purane aur naye ko compare karo.</p></div>

<div class="iv"><p class="q">"Comprehensions, generators aur itertools ka ek minute mein saar batao."</p><p>Comprehensions loop aur filter se list, dictionary ya set ek line mein banati hain. Generators <code>yield</code> se ek-ek value dete hain, isliye stream karte hain aur memory-friendly rehte hain, par sirf ek baar padhe ja sakte hain. <code>itertools</code> tayyar tukde deta hai jaise <code>chain</code>, <code>islice</code> aur <code>groupby</code> jo streams par chalte hain. Aakhir mein main <code>Counter</code> ya <code>sorted</code> se stream ko jawab mein badalta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Result ke liye comprehension, stream ke liye generator, action ke liye loop.</li>
<li>Streams one-shot hain: har pass ke liye naya generator, ya do baar chahiye to list.</li>
<li>Chhote generators ki pipelines test aur reuse karne mein aasaan hain.</li>
<li><code>Counter</code>, <code>sorted</code> aur <code>key</code> se gino aur rank karo.</li>
<li>Hairaan karne wale number ko hamesha independent tareeke se cross-check karo.</li>
</ul></div>
`}};export{e as default};