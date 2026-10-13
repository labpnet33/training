var e={id:`common-mistakes`,h:{en:`Common mistakes: used-up generators, len(), return vs yield and late binding`,hi:`Aam galtiyan: khatam hue generators, len(), return vs yield aur late binding`},body:{en:`
<p><b>The idea of this chapter:</b> generators and iterators fail in a very particular way: quietly. The script does not crash, it just reports zero, or one wrong string, or the same number three times. Learn the six classic traps now and you will recognise each one in seconds, in Lab 2 and in real code.</p>

<h3>Analogy: the tap that has run dry</h3>
<p>A generator is a tap, not a bucket. Fill a glass and the water is gone; turn the tap again and nothing comes out. You did not break anything, the water simply ran past. Most bugs in this chapter are people expecting a bucket.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="First pass over a generator gives 60 items; second pass gives 0">
<rect x="20" y="30" width="190" height="70" rx="10" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">generator</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">fresh</text>
<rect x="250" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="335" y="58" text-anchor="middle" class="svg-ink" font-size="13">pass 1: 60 items</text><text x="335" y="80" text-anchor="middle" class="svg-muted" font-size="11">belt runs</text>
<rect x="460" y="30" width="170" height="70" rx="10" fill="#fecaca"/><text x="545" y="58" text-anchor="middle" class="svg-ink" font-size="13">pass 2: 0 items</text><text x="545" y="80" text-anchor="middle" class="svg-muted" font-size="11">belt is empty</text>
<line x1="210" y1="65" x2="250" y2="65" stroke="#64748b" stroke-width="2"/><line x1="420" y1="65" x2="460" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">no error, no warning: the second loop simply has nothing to do</text>
</svg><p class="cap">A generator is read once.</p></div>

<h3>Trap 1: reading a generator twice</h3>
<pre class="code">events = link_events("router.log")
print("first pass :", sum(1 for _ in events))
print("second pass:", sum(1 for _ in events))
print(list(events))</pre>
<pre class="out">AUTO01$ python3 m1.py
first pass : 60
<span class="hl">second pass: 0</span>
[]</pre>
<p>The second pass counts nothing, and no error is raised. The same happens with an open file: after one full read, the file position is at the end. The cure is to build a fresh generator for each pass, or to collect the data once with <code>list()</code> when it is small and needed twice. This is the "up: 0" bug in Lab 2.</p>

<h3>Trap 2: len() and truth tests on a generator</h3>
<pre class="code">events = link_events("router.log")
try:
    print(len(events))
except TypeError as e:
    print("TypeError:", e)
print(bool(events))
print(len(list(events)))</pre>
<pre class="out">AUTO01$ python3 m1.py
<span class="hl">TypeError: object of type 'generator' has no len()</span>
True
60</pre>
<p>A generator does not know how many items it will produce, so it has no length. It is also <b>always true</b>, even if it would yield nothing: <code>if events:</code> tells you nothing. To count, use <code>sum(1 for _ in events)</code>; to test for "any", use <code>next(events, None)</code> or <code>any(...)</code>. This is the TypeError that starts Lab 2.</p>

<h3>Trap 3: return where you meant yield</h3>
<pre class="code">def first_down(path):
    for line in link_events(path):
        if line.endswith("down"):
            return line

def downs(path):
    for line in link_events(path):
        if line.endswith("down"):
            yield line

print(first_down("router.log")[7:15])
print(type(first_down("router.log")).__name__)
print(type(downs("router.log")).__name__)
print(next(downs("router.log"))[7:15])</pre>
<pre class="out">AUTO01$ python3 m1.py
09:00:00
<span class="hl">str</span>
generator
09:00:00</pre>
<p>With <code>return</code> the loop ends at the first match and you receive one <b>string</b>. With <code>yield</code> the function becomes a generator and delivers every match. Wrap the string in <code>set()</code> or <code>sorted()</code> and Python happily splits it into single characters, which is the third bug of Lab 2. Always check <code>type(x).__name__</code> when a result looks odd.</p>

<h3>Trap 4: late binding in lambdas</h3>
<p>A lambda looks up a variable when it is <i>called</i>, not when it is written. Build checks in a loop and they all see the last value.</p>
<pre class="code">funcs = [lambda: n for n in range(3)]
print([fn() for fn in funcs])
funcs = [lambda n=n: n for n in range(3)]
print([fn() for fn in funcs])</pre>
<pre class="out">AUTO01$ python3 m1.py
<span class="hl">[2, 2, 2]</span>
[0, 1, 2]</pre>
<p>All three functions share one <code>n</code>, which is 2 by the time they run. The default argument <code>n=n</code> freezes the value at definition time. This bites when you build one check function per port or per VLAN in a loop.</p>

<h3>Trap 5: one-shot built-ins and sorted()</h3>
<pre class="code">r = reversed([1, 2, 3])
print(list(r), list(r))
m = map(str.upper, ["gi0/1", "gi0/2"])
print(list(m), list(m))
print(type(sorted(link_events("router.log"))).__name__)</pre>
<pre class="out">AUTO01$ python3 m1.py
[3, 2, 1] []
['GI0/1', 'GI0/2'] []
<span class="hl">list</span></pre>
<p><code>reversed</code>, <code>map</code> and <code>filter</code> are one-shot like generators. And <code>sorted()</code> always returns a <b>list</b> built from the whole stream, so a sort in the middle of a pipeline ends the streaming: everything must be read first.</p>

<h3>Trap 6: matching too loosely, and the groupby reminder</h3>
<p>Counting lines that contain the word <code>down</code> returned 90 on <code>router.log</code>, not 30, because the OSPF lines also contain the lower-case word "down" in their text. Match the <i>whole</i> pattern, such as the message code and the end of the line, as the parser does. The sixth classic, <code>groupby</code> on unsorted input, was shown in chapter 7.</p>

<table class="cmp">
<tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>TypeError: no len()</td><td>len() on a generator</td><td>list() it once, or count with sum</td></tr>
<tr><td>Second loop prints nothing</td><td>generator or file already consumed</td><td>build a fresh one, or keep a list</td></tr>
<tr><td>Result is single letters</td><td>return gave a string, not a stream</td><td>change return to yield</td></tr>
<tr><td>All lambdas give the same value</td><td>late binding</td><td>n=n default argument</td></tr>
<tr><td>Groups split in two</td><td>groupby on unsorted data</td><td>sort with the same key first</td></tr>
</table>

<div class="warn"><p><b>Debugging tip.</b> Peeking at a generator with <code>next()</code> or <code>islice</code> <i>uses up</i> the items you looked at. Peek on a throw-away copy, or print <code>type(x).__name__</code> instead.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Is a generator always truthy?" Yes. "Does <code>len()</code> work on it?" No. "What does <code>sorted(gen)</code> return?" A list.</p></div>

<div class="scn"><h4>The report that always said zero</h4><p>A nightly script opened the syslog once, counted downs in one loop and ups in a second loop. Downs were right and ups were always zero, so management believed links never recovered. The file object had been consumed by the first loop. Reading the lines into a list once, then counting twice, gave correct numbers and a very different conversation.</p><p><b>Lesson:</b> a result of zero from a stream deserves suspicion before it deserves a meeting.</p></div>

<div class="iv"><p class="q">"Why does my second loop over the same generator do nothing?"</p><p>Because a generator is an iterator: it is exhausted after one pass and does not rewind. I either create a new generator for the second pass or store the results in a list if the data is small and I need it twice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A used-up generator stays empty and raises no error; build a fresh one for each pass.</li>
<li>No <code>len()</code> on a generator, and it is always truthy; use <code>sum(1 for _ in g)</code> or <code>next(g, None)</code>.</li>
<li><code>return</code> inside the loop gives one value; <code>yield</code> gives the stream.</li>
<li>Lambdas in loops need <code>n=n</code> to freeze the value.</li>
<li><code>sorted()</code> returns a list and reads everything; peeking consumes items.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> generators aur iterators ek khaas tareeke se fail hote hain: chupchaap. Script crash nahi hoti, bas zero batati hai, ya ek galat string, ya teen baar wahi number. Chhe classic jaal abhi seekh lo aur har ek ko Lab 2 mein aur asli code mein seconds mein pehchaan loge.</p>

<h3>Analogy: sookha hua nal</h3>
<p>Generator nal hai, balti nahi. Glass bharo to paani chala gaya; nal dobara kholo to kuch nahi nikalta. Aapne kuch toda nahi, paani bas guzar gaya. Is chapter ke zyada tar bugs balti expect karne wale logon ke hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Generator par pehle pass mein 60 items, doosre mein 0">
<rect x="20" y="30" width="190" height="70" rx="10" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">generator</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">taaza</text>
<rect x="250" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="335" y="58" text-anchor="middle" class="svg-ink" font-size="13">pass 1: 60 items</text><text x="335" y="80" text-anchor="middle" class="svg-muted" font-size="11">belt chalti hai</text>
<rect x="460" y="30" width="170" height="70" rx="10" fill="#fecaca"/><text x="545" y="58" text-anchor="middle" class="svg-ink" font-size="13">pass 2: 0 items</text><text x="545" y="80" text-anchor="middle" class="svg-muted" font-size="11">belt khaali hai</text>
<line x1="210" y1="65" x2="250" y2="65" stroke="#64748b" stroke-width="2"/><line x1="420" y1="65" x2="460" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">na error, na warning: doosre loop ke paas bas karne ko kuch nahi</text>
</svg><p class="cap">Generator sirf ek baar padha jaata hai.</p></div>

<h3>Trap 1: generator ko do baar padhna</h3>
<pre class="code">events = link_events("router.log")
print("first pass :", sum(1 for _ in events))
print("second pass:", sum(1 for _ in events))
print(list(events))</pre>
<pre class="out">AUTO01$ python3 m1.py
first pass : 60
<span class="hl">second pass: 0</span>
[]</pre>
<p>Doosra pass kuch nahi ginta, aur koi error nahi aata. Khuli file ke saath bhi yahi hota hai: ek poore read ke baad file position end par hoti hai. Ilaaj: har pass ke liye naya generator banao, ya data chhota ho aur do baar chahiye to ek baar <code>list()</code> se jama karo. Lab 2 ka "up: 0" bug yahi hai.</p>

<h3>Trap 2: generator par len() aur truth test</h3>
<pre class="code">events = link_events("router.log")
try:
    print(len(events))
except TypeError as e:
    print("TypeError:", e)
print(bool(events))
print(len(list(events)))</pre>
<pre class="out">AUTO01$ python3 m1.py
<span class="hl">TypeError: object of type 'generator' has no len()</span>
True
60</pre>
<p>Generator ko nahi pata ki woh kitne items dega, isliye uski length nahi hoti. Woh hamesha <b>true</b> bhi hota hai, chahe kuch yield na kare: <code>if events:</code> kuch nahi batata. Ginne ke liye <code>sum(1 for _ in events)</code> use karo; "koi hai?" ke liye <code>next(events, None)</code> ya <code>any(...)</code>. Lab 2 isi TypeError se shuru hota hai.</p>

<h3>Trap 3: yield ki jagah return</h3>
<pre class="code">def first_down(path):
    for line in link_events(path):
        if line.endswith("down"):
            return line

def downs(path):
    for line in link_events(path):
        if line.endswith("down"):
            yield line

print(first_down("router.log")[7:15])
print(type(first_down("router.log")).__name__)
print(type(downs("router.log")).__name__)
print(next(downs("router.log"))[7:15])</pre>
<pre class="out">AUTO01$ python3 m1.py
09:00:00
<span class="hl">str</span>
generator
09:00:00</pre>
<p><code>return</code> ke saath loop pehle match par khatam ho jaata hai aur aapko ek <b>string</b> milti hai. <code>yield</code> ke saath function generator ban jaata hai aur har match deta hai. String ko <code>set()</code> ya <code>sorted()</code> mein lapeto aur Python khushi se use akele akshar mein tod deta hai, jo Lab 2 ka teesra bug hai. Result ajeeb lage to hamesha <code>type(x).__name__</code> dekho.</p>

<h3>Trap 4: lambdas mein late binding</h3>
<p>Lambda variable ko tab dekhta hai jab use <i>call</i> kiya jaaye, tab nahi jab likha gaya. Loop mein checks banao to sab aakhri value dekhte hain.</p>
<pre class="code">funcs = [lambda: n for n in range(3)]
print([fn() for fn in funcs])
funcs = [lambda n=n: n for n in range(3)]
print([fn() for fn in funcs])</pre>
<pre class="out">AUTO01$ python3 m1.py
<span class="hl">[2, 2, 2]</span>
[0, 1, 2]</pre>
<p>Teeno functions ek hi <code>n</code> share karte hain, jo chalne tak 2 ho chuka hota hai. Default argument <code>n=n</code> value ko definition ke samay jamaa deta hai. Yeh tab kaatta hai jab aap loop mein har port ya VLAN ke liye ek check function banate ho.</p>

<h3>Trap 5: one-shot built-ins aur sorted()</h3>
<pre class="code">r = reversed([1, 2, 3])
print(list(r), list(r))
m = map(str.upper, ["gi0/1", "gi0/2"])
print(list(m), list(m))
print(type(sorted(link_events("router.log"))).__name__)</pre>
<pre class="out">AUTO01$ python3 m1.py
[3, 2, 1] []
['GI0/1', 'GI0/2'] []
<span class="hl">list</span></pre>
<p><code>reversed</code>, <code>map</code> aur <code>filter</code> generators ki tarah one-shot hain. Aur <code>sorted()</code> hamesha poore stream se bani <b>list</b> deta hai, isliye pipeline ke beech mein sort streaming khatam kar deta hai: pehle sab padhna padta hai.</p>

<h3>Trap 6: bahut dheela matching, aur groupby ki yaad</h3>
<p>Jin lines mein <code>down</code> shabd hai unhe ginne par <code>router.log</code> par 90 aaya, 30 nahi, kyunki OSPF lines ke text mein bhi lower-case "down" hai. <i>Poora</i> pattern match karo, jaise message code aur line ka ant, jaise parser karta hai. Chhatha classic, unsorted input par <code>groupby</code>, chapter 7 mein dikhaya tha.</p>

<table class="cmp">
<tr><th>Lakshan</th><th>Sambhavit wajah</th><th>Fix</th></tr>
<tr><td>TypeError: no len()</td><td>generator par len()</td><td>ek baar list() karo, ya sum se gino</td></tr>
<tr><td>Doosra loop kuch print nahi karta</td><td>generator ya file pehle hi consume ho chuki</td><td>naya banao, ya list rakho</td></tr>
<tr><td>Result akele akshar hai</td><td>return ne stream nahi, string di</td><td>return ko yield karo</td></tr>
<tr><td>Saare lambdas same value dete hain</td><td>late binding</td><td>n=n default argument</td></tr>
<tr><td>Groups do mein tut gaye</td><td>unsorted data par groupby</td><td>pehle usi key se sort karo</td></tr>
</table>

<div class="warn"><p><b>Debugging tip.</b> <code>next()</code> ya <code>islice</code> se generator mein jhaankne par jo items dekhe woh <i>khatam ho jaate hain</i>. Kisi bekaar copy par jhaanko, ya uski jagah <code>type(x).__name__</code> print karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kya generator hamesha truthy hota hai?" Haan. "Kya us par <code>len()</code> chalta hai?" Nahi. "<code>sorted(gen)</code> kya return karta hai?" List.</p></div>

<div class="scn"><h4>Woh report jo hamesha zero batati thi</h4><p>Ek raat ki script syslog ek baar kholti thi, ek loop mein downs ginti thi aur doosre loop mein ups. Downs sahi the aur ups hamesha zero, isliye management ko laga links kabhi recover nahi hote. File object pehle loop ne khatam kar diya tha. Lines ko ek baar list mein padhne, phir do baar ginne se sahi numbers aaye aur baatcheet bilkul alag ho gayi.</p><p><b>Lesson:</b> stream se zero result meeting se pehle shak ka haqdaar hai.</p></div>

<div class="iv"><p class="q">"Wahi generator doosre loop mein kuch kyon nahi karta?"</p><p>Kyunki generator iterator hai: ek pass ke baad khatam ho jaata hai aur rewind nahi hota. Main ya to doosre pass ke liye naya generator banata hoon, ya data chhota ho aur do baar chahiye to results list mein rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Khatam hua generator khaali rehta hai aur error nahi deta; har pass ke liye naya banao.</li>
<li>Generator par <code>len()</code> nahi, aur woh hamesha truthy hai; <code>sum(1 for _ in g)</code> ya <code>next(g, None)</code> use karo.</li>
<li>Loop mein <code>return</code> ek value deta hai; <code>yield</code> stream deta hai.</li>
<li>Loop ke lambdas ko value jamaane ke liye <code>n=n</code> chahiye.</li>
<li><code>sorted()</code> list deta hai aur sab padhta hai; jhaankne se items consume hote hain.</li>
</ul></div>
`}};export{e as default};