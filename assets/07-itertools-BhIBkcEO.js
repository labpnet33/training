var e={id:`itertools`,h:{en:`itertools: chain, islice, product, zip_longest, groupby and pairwise`,hi:`itertools: chain, islice, product, zip_longest, groupby aur pairwise`},body:{en:`
<p><b>The idea of this chapter:</b> the <code>itertools</code> module is a box of ready-made belt parts. It joins belts, takes the first few items, builds every combination, pairs up lists of different length and groups neighbours. Every part takes iterables and returns an iterator, so they snap onto your generator pipelines.</p>

<h3>Analogy: parts for the conveyor belt</h3>
<p>If the generator is a belt, <code>itertools</code> sells the connectors: a splice that joins two belts end to end (<code>chain</code>), a gate that lets only the first N parcels through (<code>islice</code>), a crossing that pairs every item of one belt with every item of another (<code>product</code>), and a sorter that bundles neighbouring parcels with the same label (<code>groupby</code>).</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Six itertools parts and what each does">
<rect x="10" y="14" width="200" height="70" rx="10" fill="#bae6fd"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="14">chain</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="11">join belts end to end</text>
<rect x="220" y="14" width="200" height="70" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">islice</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">take only a slice</text>
<rect x="430" y="14" width="200" height="70" rx="10" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="14">product</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="11">every item with every item</text>
<rect x="10" y="104" width="200" height="70" rx="10" fill="#fde68a"/><text x="110" y="132" text-anchor="middle" class="svg-ink" font-size="14">zip_longest</text><text x="110" y="154" text-anchor="middle" class="svg-muted" font-size="11">pair up, pad the short one</text>
<rect x="220" y="104" width="200" height="70" rx="10" fill="#fde68a"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="14">groupby</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="11">bundle equal neighbours</text>
<rect x="430" y="104" width="200" height="70" rx="10" fill="#bbf7d0"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="14">pairwise</text><text x="530" y="154" text-anchor="middle" class="svg-muted" font-size="11">each item with the next</text>
</svg><p class="cap">Six parts cover most log and inventory jobs.</p></div>

<h3>chain and islice</h3>
<p><code>chain</code> walks several iterables as if they were one. <code>islice(iterable, stop)</code> or <code>islice(iterable, start, stop, step)</code> slices any iterable, even a generator, which ordinary <code>[a:b]</code> slicing cannot do.</p>
<pre class="code">from itertools import chain, islice

core = ["PUN-CORE-R1"]
edge = ["BLR-EDGE-R2", "HYD-EDGE-R3"]
print(list(chain(core, edge, ["SW1"])))
print(list(islice(range(100), 3)))
print(list(islice("ABCDEFG", 2, 5)))
print(list(islice(range(10), 0, 10, 4)))</pre>
<pre class="out">AUTO01$ python3 i1b.py
['PUN-CORE-R1', 'BLR-EDGE-R2', 'HYD-EDGE-R3', 'SW1']
[0, 1, 2]
['C', 'D', 'E']
<span class="hl">[0, 4, 8]</span></pre>
<p>In Lab 1 you used <code>islice(parse(...), 3)</code> to peek at the first three records. Calling <code>islice</code> on a generator also uses up the items it hands out, so the next slice continues where the last one ended.</p>

<h3>product and combinations: build the list of everything</h3>
<p><code>product</code> makes every pair from two lists, the way a nested loop would. <code>combinations(items, 2)</code> makes each unordered pair once, which is exactly the list of links in a full mesh of routers.</p>
<pre class="code">from itertools import product, combinations, permutations

print([f"{sw}:{p}" for sw, p in product(["SW1", "SW2"], ["Gi0/1", "Gi0/2"])])
print(len(list(product(range(1, 4), repeat=2))))
print(list(combinations(["R1", "R2", "R3"], 2)))
print(len(list(permutations(["R1", "R2", "R3"], 2))))</pre>
<pre class="out">AUTO01$ python3 i1b.py
['SW1:Gi0/1', 'SW1:Gi0/2', 'SW2:Gi0/1', 'SW2:Gi0/2']
9
<span class="hl">[('R1', 'R2'), ('R1', 'R3'), ('R2', 'R3')]</span>
6</pre>
<p>Two switches times two ports gives four interface names. Three routers have three links in a full mesh, but six ordered pairs if direction matters (<code>permutations</code>). That is the difference between a link and a directed flow.</p>

<h3>zip_longest: pairing lists of different length</h3>
<p>Plain <code>zip</code> stops at the shortest list and silently drops the rest. <code>zip_longest</code> carries on and pads the short side with <code>None</code> or with the <code>fillvalue</code> you choose. For an inventory check, the dropped item is exactly what you want to see.</p>
<pre class="code">from itertools import zip_longest

names = ["SW1", "SW2", "SW3"]
print(list(zip(names, ["10.0.0.1", "10.0.0.2"])))
print(list(zip_longest(names, ["10.0.0.1", "10.0.0.2"])))
print(list(zip_longest(names, ["10.0.0.1"], fillvalue="-")))</pre>
<pre class="out">AUTO01$ python3 i1b.py
[('SW1', '10.0.0.1'), ('SW2', '10.0.0.2')]
<span class="hl">[('SW1', '10.0.0.1'), ('SW2', '10.0.0.2'), ('SW3', None)]</span>
[('SW1', '10.0.0.1'), ('SW2', '-'), ('SW3', '-')]</pre>
<p>Three switch names but only two addresses: <code>zip</code> hid <code>SW3</code>, <code>zip_longest</code> shows that it has no address.</p>

<h3>groupby: bundle neighbours, and sort first</h3>
<p><code>groupby(iterable, key)</code> yields a pair for each run of <i>neighbouring</i> items with the same key: the key and a mini-iterator of the group. It does not look for matches further down the stream. So the input must already be sorted by the same key.</p>
<pre class="code">from itertools import groupby

unsorted = [{"host": "R1"}, {"host": "R2"}, {"host": "R1"}]
key = lambda r: r["host"]
print([(h, len(list(g))) for h, g in groupby(unsorted, key=key)])
print([(h, len(list(g))) for h, g in groupby(sorted(unsorted, key=key), key=key)])</pre>
<pre class="out">AUTO01$ python3 i1b.py
[('R1', 1), ('R2', 1), ('R1', 1)]
<span class="hl">[('R1', 2), ('R2', 1)]</span></pre>
<p>Without sorting, <code>R1</code> appears as two separate groups of one. After <code>sorted</code> with the same key, there is one group of two. On the real log, grouping by router gives each router's event count and its number of down events:</p>
<pre class="code">recs = list(parse(link_events("router.log")))
by_host = sorted(recs, key=lambda r: r["host"])
for host, grp in groupby(by_host, key=lambda r: r["host"]):
    rows = list(grp)
    print(host, len(rows), sum(1 for r in rows if r["state"] == "down"))</pre>
<pre class="out">AUTO01$ python3 v7.py
BLR-EDGE-R2 20 10
HYD-EDGE-R3 20 10
<span class="hl">PUN-CORE-R1 20 10</span></pre>
<p>Each router has 20 link events and 10 of them are downs. Note the <code>list(grp)</code>: the group is a one-shot mini-iterator that is invalidated when <code>groupby</code> moves to the next key, so use it or copy it inside the loop.</p>

<h3>pairwise, count, cycle and repeat</h3>
<p><code>pairwise</code> yields each item with the one after it, handy for gaps between timestamps. <code>count(start, step)</code>, <code>cycle</code> and <code>repeat</code> make endless or repeating streams that you cut with <code>islice</code>.</p>
<pre class="code">from itertools import pairwise, count, cycle, repeat

print(list(pairwise(["09:00:00", "09:00:28", "09:00:56"])))
print(list(islice(count(100, 100), 3)))
print(list(islice(cycle(["A", "B"]), 5)))
print(list(repeat("Gi0/0", 3)))</pre>
<pre class="out">AUTO01$ python3 i1b.py
[('09:00:00', '09:00:28'), ('09:00:28', '09:00:56')]
[100, 200, 300]
['A', 'B', 'A', 'B', 'A']
['Gi0/0', 'Gi0/0', 'Gi0/0']</pre>

<div class="note"><p><b>Lab note.</b> The lab's <code>itertools</code> has <code>chain</code>, <code>islice</code>, <code>product</code>, <code>combinations</code>, <code>permutations</code>, <code>zip_longest</code>, <code>groupby</code>, <code>pairwise</code>, <code>count</code>, <code>cycle</code> and <code>repeat</code>. Real Python also has <code>accumulate</code>, <code>takewhile</code>, <code>dropwhile</code>, <code>starmap</code>, <code>filterfalse</code>, <code>compress</code> and <code>tee</code>, and <code>chain.from_iterable</code>; these are not in the lab library, so do not use them in the labs. A running total is easy with a loop: for the list 3, 1, 4, 1, 5 it builds the totals 3, 4, 8, 9, 14. To join a list of lists, write <code>chain(*lists)</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running <code>groupby</code> on unsorted data. Keeping a group after the loop has moved on. Using <code>zip</code> when lengths can differ. Calling <code>list()</code> on an endless <code>count</code> or <code>cycle</code>, which never ends; always cut it with <code>islice</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>groupby</code> is not SQL <code>GROUP BY</code>. It groups only adjacent equal keys. Sort first, with the same key function.</p></div>

<div class="scn"><h4>The inventory with a missing address</h4><p>A switch list and an address list were exported separately and zipped to build a monitoring file. Two weeks later one switch was not being monitored. The address list was one line shorter, and <code>zip</code> had quietly dropped the last switch. Switching to <code>zip_longest</code> with a visible fill value exposed the gap on the first run.</p><p><b>Lesson:</b> prefer tools that show a mismatch over tools that hide it.</p></div>

<div class="iv"><p class="q">"Why does groupby give wrong results sometimes?"</p><p>Because it groups only consecutive items that share a key. If the data is not sorted by that key, the same key shows up as several separate groups. I sort first with the same key function, or use a dictionary or <code>Counter</code> when order does not matter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>chain</code> joins streams; <code>islice</code> slices any iterable, even a generator.</li>
<li><code>product</code>, <code>combinations</code> and <code>permutations</code> build every pair or link.</li>
<li><code>zip_longest</code> shows the mismatch that <code>zip</code> hides.</li>
<li><code>groupby</code> needs input sorted by the same key and works on neighbours only.</li>
<li>The lab library has no <code>accumulate</code> or <code>takewhile</code>; use a loop there.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>itertools</code> module tayyar belt parts ka dibba hai. Yeh belts jodta hai, pehle kuch items leta hai, har combination banata hai, alag length ki lists ko jodi mein baandhta hai aur padosi items ko group karta hai. Har part iterables leta hai aur iterator return karta hai, isliye woh aapki generator pipelines par fit ho jaate hain.</p>

<h3>Analogy: conveyor belt ke parts</h3>
<p>Agar generator belt hai, to <code>itertools</code> connectors bechta hai: ek splice jo do belts ko sire se jodta hai (<code>chain</code>), ek gate jo sirf pehle N parcels ko jaane deta hai (<code>islice</code>), ek crossing jo ek belt ke har item ko doosri belt ke har item se jodti hai (<code>product</code>), aur ek sorter jo ek hi label wale padosi parcels ka bundle banata hai (<code>groupby</code>).</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Chhe itertools parts aur har ek ka kaam">
<rect x="10" y="14" width="200" height="70" rx="10" fill="#bae6fd"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="14">chain</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="11">belts ko sire se jodo</text>
<rect x="220" y="14" width="200" height="70" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">islice</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">sirf ek slice lo</text>
<rect x="430" y="14" width="200" height="70" rx="10" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="14">product</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="11">har item har item ke saath</text>
<rect x="10" y="104" width="200" height="70" rx="10" fill="#fde68a"/><text x="110" y="132" text-anchor="middle" class="svg-ink" font-size="14">zip_longest</text><text x="110" y="154" text-anchor="middle" class="svg-muted" font-size="11">jodi banao, chhoti ko bharo</text>
<rect x="220" y="104" width="200" height="70" rx="10" fill="#fde68a"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="14">groupby</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="11">barabar padosiyon ka bundle</text>
<rect x="430" y="104" width="200" height="70" rx="10" fill="#bbf7d0"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="14">pairwise</text><text x="530" y="154" text-anchor="middle" class="svg-muted" font-size="11">har item apne agle ke saath</text>
</svg><p class="cap">Chhe parts zyada tar log aur inventory ke kaam nipta dete hain.</p></div>

<h3>chain aur islice</h3>
<p><code>chain</code> kai iterables ko aise chalata hai jaise woh ek ho. <code>islice(iterable, stop)</code> ya <code>islice(iterable, start, stop, step)</code> kisi bhi iterable ko, generator ko bhi, slice karta hai, jo aam <code>[a:b]</code> slicing nahi kar sakti.</p>
<pre class="code">from itertools import chain, islice

core = ["PUN-CORE-R1"]
edge = ["BLR-EDGE-R2", "HYD-EDGE-R3"]
print(list(chain(core, edge, ["SW1"])))
print(list(islice(range(100), 3)))
print(list(islice("ABCDEFG", 2, 5)))
print(list(islice(range(10), 0, 10, 4)))</pre>
<pre class="out">AUTO01$ python3 i1b.py
['PUN-CORE-R1', 'BLR-EDGE-R2', 'HYD-EDGE-R3', 'SW1']
[0, 1, 2]
['C', 'D', 'E']
<span class="hl">[0, 4, 8]</span></pre>
<p>Lab 1 mein aapne pehle teen records dekhne ke liye <code>islice(parse(...), 3)</code> use kiya tha. Generator par <code>islice</code> call karne se jo items woh deta hai woh bhi khatam ho jaate hain, isliye agla slice wahin se chalta hai jahan pichhla khatam hua.</p>

<h3>product aur combinations: sab kuch ki list banao</h3>
<p><code>product</code> do lists se har jodi banata hai, nested loop ki tarah. <code>combinations(items, 2)</code> har unordered jodi sirf ek baar banata hai, jo routers ke full mesh mein links ki list hoti hai.</p>
<pre class="code">from itertools import product, combinations, permutations

print([f"{sw}:{p}" for sw, p in product(["SW1", "SW2"], ["Gi0/1", "Gi0/2"])])
print(len(list(product(range(1, 4), repeat=2))))
print(list(combinations(["R1", "R2", "R3"], 2)))
print(len(list(permutations(["R1", "R2", "R3"], 2))))</pre>
<pre class="out">AUTO01$ python3 i1b.py
['SW1:Gi0/1', 'SW1:Gi0/2', 'SW2:Gi0/1', 'SW2:Gi0/2']
9
<span class="hl">[('R1', 'R2'), ('R1', 'R3'), ('R2', 'R3')]</span>
6</pre>
<p>Do switches ganda do ports se chaar interface names bante hain. Teen routers ke full mesh mein teen links hote hain, par agar direction mayne rakhti hai to chhe ordered jodiyan (<code>permutations</code>). Link aur directed flow ka farq yahi hai.</p>

<h3>zip_longest: alag length ki lists ko jodna</h3>
<p>Seedha <code>zip</code> sabse chhoti list par ruk jaata hai aur baaki chupchaap girata hai. <code>zip_longest</code> aage badhta hai aur chhoti taraf ko <code>None</code> ya aapke chune <code>fillvalue</code> se bharta hai. Inventory check mein girne wala item hi woh hai jo aap dekhna chahte ho.</p>
<pre class="code">from itertools import zip_longest

names = ["SW1", "SW2", "SW3"]
print(list(zip(names, ["10.0.0.1", "10.0.0.2"])))
print(list(zip_longest(names, ["10.0.0.1", "10.0.0.2"])))
print(list(zip_longest(names, ["10.0.0.1"], fillvalue="-")))</pre>
<pre class="out">AUTO01$ python3 i1b.py
[('SW1', '10.0.0.1'), ('SW2', '10.0.0.2')]
<span class="hl">[('SW1', '10.0.0.1'), ('SW2', '10.0.0.2'), ('SW3', None)]</span>
[('SW1', '10.0.0.1'), ('SW2', '-'), ('SW3', '-')]</pre>
<p>Teen switch names par sirf do addresses: <code>zip</code> ne <code>SW3</code> chhupa diya, <code>zip_longest</code> dikhata hai ki uska koi address nahi.</p>

<h3>groupby: padosiyon ka bundle, aur pehle sort</h3>
<p><code>groupby(iterable, key)</code> har <i>padosi</i> items ke run ke liye, jinki key same ho, ek jodi deta hai: key aur group ka mini-iterator. Woh stream mein aage kahin aur match nahi dhoondhta. Isliye input pehle se usi key se sorted hona chahiye.</p>
<pre class="code">from itertools import groupby

unsorted = [{"host": "R1"}, {"host": "R2"}, {"host": "R1"}]
key = lambda r: r["host"]
print([(h, len(list(g))) for h, g in groupby(unsorted, key=key)])
print([(h, len(list(g))) for h, g in groupby(sorted(unsorted, key=key), key=key)])</pre>
<pre class="out">AUTO01$ python3 i1b.py
[('R1', 1), ('R2', 1), ('R1', 1)]
<span class="hl">[('R1', 2), ('R2', 1)]</span></pre>
<p>Sort kiye bina <code>R1</code> ek-ek ke do alag groups mein aata hai. Usi key ke saath <code>sorted</code> ke baad do ka ek hi group milta hai. Asli log par router ke hisaab se group karne se har router ke events aur uske down events ka count milta hai:</p>
<pre class="code">recs = list(parse(link_events("router.log")))
by_host = sorted(recs, key=lambda r: r["host"])
for host, grp in groupby(by_host, key=lambda r: r["host"]):
    rows = list(grp)
    print(host, len(rows), sum(1 for r in rows if r["state"] == "down"))</pre>
<pre class="out">AUTO01$ python3 v7.py
BLR-EDGE-R2 20 10
HYD-EDGE-R3 20 10
<span class="hl">PUN-CORE-R1 20 10</span></pre>
<p>Har router ke 20 link events hain aur unmein 10 down hain. <code>list(grp)</code> par dhyan do: group ek one-shot mini-iterator hai jo <code>groupby</code> ke agli key par jaate hi invalid ho jaata hai, isliye use loop ke andar hi use karo ya copy karo.</p>

<h3>pairwise, count, cycle aur repeat</h3>
<p><code>pairwise</code> har item ko uske baad wale ke saath deta hai, timestamps ke beech gap ke liye kaam ka. <code>count(start, step)</code>, <code>cycle</code> aur <code>repeat</code> endless ya doharaane wali streams banate hain jinhe aap <code>islice</code> se kaat dete ho.</p>
<pre class="code">from itertools import pairwise, count, cycle, repeat

print(list(pairwise(["09:00:00", "09:00:28", "09:00:56"])))
print(list(islice(count(100, 100), 3)))
print(list(islice(cycle(["A", "B"]), 5)))
print(list(repeat("Gi0/0", 3)))</pre>
<pre class="out">AUTO01$ python3 i1b.py
[('09:00:00', '09:00:28'), ('09:00:28', '09:00:56')]
[100, 200, 300]
['A', 'B', 'A', 'B', 'A']
['Gi0/0', 'Gi0/0', 'Gi0/0']</pre>

<div class="note"><p><b>Lab note.</b> Lab ke <code>itertools</code> mein <code>chain</code>, <code>islice</code>, <code>product</code>, <code>combinations</code>, <code>permutations</code>, <code>zip_longest</code>, <code>groupby</code>, <code>pairwise</code>, <code>count</code>, <code>cycle</code> aur <code>repeat</code> hain. Asli Python mein <code>accumulate</code>, <code>takewhile</code>, <code>dropwhile</code>, <code>starmap</code>, <code>filterfalse</code>, <code>compress</code> aur <code>tee</code> bhi hain, aur <code>chain.from_iterable</code> bhi; yeh lab library mein nahi hain, isliye labs mein inhe use mat karo. Running total loop se aasaan hai: list 3, 1, 4, 1, 5 ke liye woh totals 3, 4, 8, 9, 14 banata hai. Lists ki list jodne ke liye <code>chain(*lists)</code> likho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Unsorted data par <code>groupby</code> chalana. Loop aage badh jaane ke baad group ko pakde rakhna. Jab lengths alag ho sakti hain tab <code>zip</code> use karna. Endless <code>count</code> ya <code>cycle</code> par <code>list()</code> lagana, jo kabhi khatam nahi hota; hamesha <code>islice</code> se kaato.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>groupby</code> SQL ka <code>GROUP BY</code> nahi hai. Woh sirf adjacent barabar keys ko group karta hai. Pehle usi key function se sort karo.</p></div>

<div class="scn"><h4>Missing address wali inventory</h4><p>Switch list aur address list alag-alag export hui aur monitoring file banane ke liye zip ki gayi. Do hafte baad ek switch monitor nahi ho raha tha. Address list ek line chhoti thi, aur <code>zip</code> ne aakhri switch chupchaap gira diya tha. Dikhne wali fill value ke saath <code>zip_longest</code> par jaane se gap pehle hi run mein saamne aa gaya.</p><p><b>Lesson:</b> jo tool mismatch dikhaye use us tool par tarjeeh do jo use chhupaye.</p></div>

<div class="iv"><p class="q">"groupby kabhi-kabhi galat result kyon deta hai?"</p><p>Kyunki woh sirf lagataar items ko group karta hai jinki key same ho. Agar data us key se sorted nahi hai, to ek hi key kai alag groups mein dikhti hai. Main pehle usi key function se sort karta hoon, ya order mayne na rakhe to dictionary ya <code>Counter</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>chain</code> streams jodta hai; <code>islice</code> kisi bhi iterable, generator ko bhi, slice karta hai.</li>
<li><code>product</code>, <code>combinations</code> aur <code>permutations</code> har jodi ya link banate hain.</li>
<li><code>zip_longest</code> woh mismatch dikhata hai jo <code>zip</code> chhupata hai.</li>
<li><code>groupby</code> ko usi key se sorted input chahiye aur woh sirf padosiyon par chalta hai.</li>
<li>Lab library mein <code>accumulate</code> ya <code>takewhile</code> nahi; wahan loop use karo.</li>
</ul></div>
`}};export{e as default};