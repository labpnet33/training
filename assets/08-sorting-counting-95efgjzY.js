var e={id:`sorting-counting`,h:{en:`Sorting with key, min and max, Counter and defaultdict for log statistics`,hi:`key se sorting, min aur max, log statistics ke liye Counter aur defaultdict`},body:{en:`
<p><b>The idea of this chapter:</b> a stream of records is only useful when you can answer questions about it: which interface is worst, which router is noisiest, when did the last failure happen? Four tools answer almost every such question: <code>sorted</code> with a <code>key</code>, <code>min</code> and <code>max</code>, <code>Counter</code> and <code>defaultdict</code>.</p>

<h3>Analogy: the tally sheet and the pigeonholes</h3>
<p>A <b>Counter</b> is the tally sheet on the wall: every time an interface goes down you add a stroke next to its name. A <b>defaultdict</b> is a wall of pigeonholes: each router has a hole, and the first time you put something in a hole that does not exist yet, the hole appears by itself. <b>sorted</b> is the clerk who puts the cards in order, using whichever field you point at.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Counter counts values; defaultdict list groups records; sorted orders them">
<rect x="10" y="20" width="200" height="120" rx="10" fill="#bbf7d0"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Counter</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 : 18</text><text x="110" y="90" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 : 8</text><text x="110" y="110" text-anchor="middle" class="svg-muted" font-size="11">Gi0/2 : 4</text>
<rect x="220" y="20" width="200" height="120" rx="10" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">defaultdict(list)</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">R1 : [ev, ev, ev]</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">R2 : [ev, ev]</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">R3 : [ev]</text>
<rect x="430" y="20" width="200" height="120" rx="10" fill="#fde68a"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">sorted(key=...)</text>
<text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">order by time</text><text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="11">or by (host, time)</text><text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="11">reverse=True for newest</text>
</svg><p class="cap">Count it, group it, or put it in order.</p></div>

<h3>Counter: how many of each</h3>
<p>The records below come from the <code>parse(link_events(...))</code> chain of chapter 6, collected into a list once because we ask several questions of the same data.</p>
<pre class="code">from collections import Counter

recs = list(parse(link_events("router.log")))
downs = [r for r in recs if r["state"] == "down"]
print(len(recs), len(downs))

by_iface = Counter(r["iface"] for r in downs)
print(by_iface)
print(by_iface.most_common(2))
print(by_iface["GigabitEthernet0/1"], by_iface["GigabitEthernet0/9"])
print(sum(by_iface.values()))</pre>
<pre class="out">AUTO01$ python3 s8b.py
60 30
Counter({'GigabitEthernet0/1': 18, 'GigabitEthernet0/0': 8, 'GigabitEthernet0/2': 4})
[('GigabitEthernet0/1', 18), ('GigabitEthernet0/0', 8)]
<span class="hl">18 0</span>
30</pre>
<p>A Counter prints with the biggest count first. A key that was never seen returns <code>0</code> instead of raising <code>KeyError</code>, which makes "how many times did Gi0/9 fail?" safe to ask. The counts add up to the 30 down events. You can feed a Counter with <code>update</code> and turn it into a plain dictionary with <code>dict()</code>.</p>

<h3>defaultdict: group records by key</h3>
<p>An ordinary dictionary needs "if the key is missing, create an empty list" before every append. <code>defaultdict(list)</code> does that for you; <code>defaultdict(int)</code> starts every new key at <code>0</code>.</p>
<pre class="code">from collections import defaultdict

groups = defaultdict(list)
for r in downs:
    groups[r["host"]].append(r["iface"][-3:])
print(sorted(groups))
print(groups["PUN-CORE-R1"])

n = defaultdict(int)
for r in recs:
    n[r["state"]] += 1
print(dict(n))
print(n["missing"])
print(len(n))</pre>
<pre class="out">AUTO01$ python3 s8b.py
['BLR-EDGE-R2', 'HYD-EDGE-R3', 'PUN-CORE-R1']
['0/1', '0/2', '0/0', '0/0', '0/1', '0/1', '0/1', '0/1', '0/2', '0/0']
{'down': 30, 'up': 30}
0
<span class="hl">3</span></pre>
<p>Each router gets its own list of the interfaces that went down. Notice the last two lines: just <i>reading</i> <code>n["missing"]</code> created that key, so the dictionary now has three keys, not two. A defaultdict inserts on read. If you only want to look, use <code>n.get("missing")</code>.</p>

<h3>sorted with a key function</h3>
<p><code>sorted(iterable, key=function, reverse=False)</code> returns a new list. The <code>key</code> function is called once per item and its result is what gets compared. A tuple key sorts by the first field, then the second. <code>operator.itemgetter</code> is a faster, tidier way to say "this field".</p>
<pre class="code">from operator import itemgetter

by_time = sorted(downs, key=lambda r: (r["iface"], r["time"]), reverse=True)
print([(r["iface"][-3:], r["time"]) for r in by_time[:3]])
print([r["host"] for r in sorted(downs, key=itemgetter("host", "time"))[:2]])
print(sorted(["Gi0/10", "Gi0/2", "Gi0/1"]))
print(sorted(["Gi0/10", "Gi0/2", "Gi0/1"], key=lambda s: int(s.split("/")[1])))
print(sorted(["SW1", "r1", "R2"]), sorted(["SW1", "r1", "R2"], key=str.lower))</pre>
<pre class="out">AUTO01$ python3 s8b.py
[('0/2', '09:22:24'), ('0/2', '09:15:52'), ('0/2', '09:09:20')]
['BLR-EDGE-R2', 'BLR-EDGE-R2']
['Gi0/1', 'Gi0/10', 'Gi0/2']
<span class="hl">['Gi0/1', 'Gi0/2', 'Gi0/10']</span>
['R2', 'SW1', 'r1'] ['r1', 'R2', 'SW1']</pre>
<p>Plain string sorting puts <code>Gi0/10</code> before <code>Gi0/2</code> because it compares character by character. A key that converts the port number to an integer gives the order an engineer expects. Capital letters sort before lowercase, so <code>key=str.lower</code> is the fix for mixed-case hostnames.</p>

<h3>min, max and a "last write wins" report</h3>
<p><code>min</code> and <code>max</code> accept a <code>key</code> as well, and a dictionary comprehension keeps the <i>last</i> value for each key, which is exactly "the latest state of each interface".</p>
<pre class="code">print(min(downs, key=lambda r: r["time"])["time"], max(downs, key=lambda r: r["time"])["time"])
print(max(by_iface, key=by_iface.get))

latest = {(r["host"], r["iface"][-3:]): r["state"] for r in recs}
print(len(latest))
print(sorted(k for k, v in latest.items() if v == "down"))

for iface, cnt in by_iface.most_common(3):
    print(f"{iface:&lt;22}{cnt:&gt;3}")</pre>
<pre class="out">AUTO01$ python3 s8b.py
09:00:00 09:27:04
GigabitEthernet0/1
9
[('BLR-EDGE-R2', '0/0'), ('BLR-EDGE-R2', '0/1'), ('PUN-CORE-R1', '0/0'), ('PUN-CORE-R1', '0/2')]
GigabitEthernet0/1     18
GigabitEthernet0/0      8
<span class="hl">GigabitEthernet0/2      4</span></pre>
<p>The first down was at 09:00:00 and the last at 09:27:04. Nine router-and-interface pairs appear in the log, and four of them ended on "down". That short list is what an engineer would open a ticket for.</p>

<div class="warn"><p><b>Common mistakes.</b> Sorting strings that hold numbers and getting <code>Gi0/10</code> before <code>Gi0/2</code>. Calling <code>.sort()</code> and expecting a return value (it returns <code>None</code>; <code>sorted()</code> returns the list). Passing a generator to <code>sorted</code> and forgetting that it reads the whole stream into memory. Treating reads of a <code>defaultdict</code> as harmless lookups.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sorted(x)</code> returns a new list and leaves <code>x</code> alone; <code>x.sort()</code> changes <code>x</code> in place and returns <code>None</code>. The sort is stable: items with equal keys keep their original order, which is why tied <code>most_common</code> results keep first-seen order.</p></div>

<div class="scn"><h4>Which port do we replace?</h4><p>A site had random link flaps and three suspects: an uplink, an SFP and a patch cable. The engineer streamed a week of syslog through a parse stage into a Counter keyed by router and interface. One interface had 18 of the 30 downs. Replacing that single cable stopped the flapping, and the tally sheet was attached to the ticket as evidence.</p><p><b>Lesson:</b> count first, then decide what to replace.</p></div>

<div class="iv"><p class="q">"How would you find the top three noisiest interfaces in a log?"</p><p>I parse the log into records with a generator, feed the interface names into a <code>Counter</code>, and call <code>most_common(3)</code>. For a ranking by time or by several fields I use <code>sorted</code> with a tuple key.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Counter(...)</code> counts; <code>most_common(n)</code> ranks; a missing key reads as 0.</li>
<li><code>defaultdict(list)</code> groups, <code>defaultdict(int)</code> counts; reading a missing key creates it.</li>
<li><code>sorted(..., key=..., reverse=...)</code> returns a new list; use a tuple key for several fields.</li>
<li>Convert text numbers with <code>int</code> in the key; use <code>str.lower</code> for case-insensitive order.</li>
<li><code>min</code> and <code>max</code> accept <code>key</code> too.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> records ka stream tabhi kaam ka hai jab aap uske baare mein sawalon ke jawab de sako: kaunsa interface sabse kharab hai, kaunsa router sabse noisy hai, aakhri failure kab hui? Chaar tools lagbhag har aise sawal ka jawab dete hain: <code>key</code> ke saath <code>sorted</code>, <code>min</code> aur <code>max</code>, <code>Counter</code> aur <code>defaultdict</code>.</p>

<h3>Analogy: tally sheet aur pigeonholes</h3>
<p><b>Counter</b> deewar par tangi tally sheet hai: jab bhi koi interface down hota hai uske naam ke saamne ek line lagti hai. <b>defaultdict</b> pigeonholes ki deewar hai: har router ka ek khana hai, aur jo khana abhi exist nahi karta usme pehli baar kuch daalo to khana apne aap ban jaata hai. <b>sorted</b> woh clerk hai jo cards ko us field ke hisaab se order mein lagata hai jis par aap ungli rakho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Counter values ginta hai; defaultdict list records group karta hai; sorted order mein lagata hai">
<rect x="10" y="20" width="200" height="120" rx="10" fill="#bbf7d0"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Counter</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 : 18</text><text x="110" y="90" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 : 8</text><text x="110" y="110" text-anchor="middle" class="svg-muted" font-size="11">Gi0/2 : 4</text>
<rect x="220" y="20" width="200" height="120" rx="10" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">defaultdict(list)</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">R1 : [ev, ev, ev]</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">R2 : [ev, ev]</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">R3 : [ev]</text>
<rect x="430" y="20" width="200" height="120" rx="10" fill="#fde68a"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">sorted(key=...)</text>
<text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">time ke hisaab se</text><text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="11">ya (host, time) se</text><text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="11">naya pehle: reverse=True</text>
</svg><p class="cap">Gino, group karo, ya order mein lagao.</p></div>

<h3>Counter: har ek kitna</h3>
<p>Neeche ke records chapter 6 ki <code>parse(link_events(...))</code> chain se aaye hain, jinhe ek baar list mein jama kiya gaya hai kyunki hum ek hi data se kai sawal poochte hain.</p>
<pre class="code">from collections import Counter

recs = list(parse(link_events("router.log")))
downs = [r for r in recs if r["state"] == "down"]
print(len(recs), len(downs))

by_iface = Counter(r["iface"] for r in downs)
print(by_iface)
print(by_iface.most_common(2))
print(by_iface["GigabitEthernet0/1"], by_iface["GigabitEthernet0/9"])
print(sum(by_iface.values()))</pre>
<pre class="out">AUTO01$ python3 s8b.py
60 30
Counter({'GigabitEthernet0/1': 18, 'GigabitEthernet0/0': 8, 'GigabitEthernet0/2': 4})
[('GigabitEthernet0/1', 18), ('GigabitEthernet0/0', 8)]
<span class="hl">18 0</span>
30</pre>
<p>Counter sabse bada count pehle print karta hai. Jo key kabhi dikhi nahi woh <code>KeyError</code> ki jagah <code>0</code> deti hai, isliye "Gi0/9 kitni baar fail hua?" poochna safe hai. Counts milkar 30 down events banate hain. Counter ko <code>update</code> se bhar sakte ho aur <code>dict()</code> se plain dictionary bana sakte ho.</p>

<h3>defaultdict: key se records group karo</h3>
<p>Aam dictionary mein har append se pehle "agar key nahi hai to khaali list banao" likhna padta hai. <code>defaultdict(list)</code> yeh aapke liye karta hai; <code>defaultdict(int)</code> har nayi key ko <code>0</code> se shuru karta hai.</p>
<pre class="code">from collections import defaultdict

groups = defaultdict(list)
for r in downs:
    groups[r["host"]].append(r["iface"][-3:])
print(sorted(groups))
print(groups["PUN-CORE-R1"])

n = defaultdict(int)
for r in recs:
    n[r["state"]] += 1
print(dict(n))
print(n["missing"])
print(len(n))</pre>
<pre class="out">AUTO01$ python3 s8b.py
['BLR-EDGE-R2', 'HYD-EDGE-R3', 'PUN-CORE-R1']
['0/1', '0/2', '0/0', '0/0', '0/1', '0/1', '0/1', '0/1', '0/2', '0/0']
{'down': 30, 'up': 30}
0
<span class="hl">3</span></pre>
<p>Har router ko un interfaces ki apni list milti hai jo down hue. Aakhri do lines dekho: sirf <code>n["missing"]</code> <i>padhne</i> se woh key ban gayi, isliye dictionary mein ab do nahi teen keys hain. defaultdict padhne par bhi insert karta hai. Sirf dekhna ho to <code>n.get("missing")</code> use karo.</p>

<h3>key function ke saath sorted</h3>
<p><code>sorted(iterable, key=function, reverse=False)</code> nayi list deta hai. <code>key</code> function har item par ek baar call hota hai aur uska result compare hota hai. Tuple key pehle field se, phir doosre se sort karti hai. <code>operator.itemgetter</code> "yeh field" kehne ka tez aur saaf tareeka hai.</p>
<pre class="code">from operator import itemgetter

by_time = sorted(downs, key=lambda r: (r["iface"], r["time"]), reverse=True)
print([(r["iface"][-3:], r["time"]) for r in by_time[:3]])
print([r["host"] for r in sorted(downs, key=itemgetter("host", "time"))[:2]])
print(sorted(["Gi0/10", "Gi0/2", "Gi0/1"]))
print(sorted(["Gi0/10", "Gi0/2", "Gi0/1"], key=lambda s: int(s.split("/")[1])))
print(sorted(["SW1", "r1", "R2"]), sorted(["SW1", "r1", "R2"], key=str.lower))</pre>
<pre class="out">AUTO01$ python3 s8b.py
[('0/2', '09:22:24'), ('0/2', '09:15:52'), ('0/2', '09:09:20')]
['BLR-EDGE-R2', 'BLR-EDGE-R2']
['Gi0/1', 'Gi0/10', 'Gi0/2']
<span class="hl">['Gi0/1', 'Gi0/2', 'Gi0/10']</span>
['R2', 'SW1', 'r1'] ['r1', 'R2', 'SW1']</pre>
<p>Plain string sorting <code>Gi0/10</code> ko <code>Gi0/2</code> se pehle rakhti hai kyunki woh character-by-character compare karti hai. Port number ko integer banane wali key woh order deti hai jo engineer expect karta hai. Capital letters lowercase se pehle aate hain, isliye mixed-case hostnames ke liye <code>key=str.lower</code> fix hai.</p>

<h3>min, max aur "last write wins" report</h3>
<p><code>min</code> aur <code>max</code> bhi <code>key</code> lete hain, aur dictionary comprehension har key ki <i>aakhri</i> value rakhti hai, jo bilkul "har interface ki taaza state" hai.</p>
<pre class="code">print(min(downs, key=lambda r: r["time"])["time"], max(downs, key=lambda r: r["time"])["time"])
print(max(by_iface, key=by_iface.get))

latest = {(r["host"], r["iface"][-3:]): r["state"] for r in recs}
print(len(latest))
print(sorted(k for k, v in latest.items() if v == "down"))

for iface, cnt in by_iface.most_common(3):
    print(f"{iface:&lt;22}{cnt:&gt;3}")</pre>
<pre class="out">AUTO01$ python3 s8b.py
09:00:00 09:27:04
GigabitEthernet0/1
9
[('BLR-EDGE-R2', '0/0'), ('BLR-EDGE-R2', '0/1'), ('PUN-CORE-R1', '0/0'), ('PUN-CORE-R1', '0/2')]
GigabitEthernet0/1     18
GigabitEthernet0/0      8
<span class="hl">GigabitEthernet0/2      4</span></pre>
<p>Pehla down 09:00:00 par tha aur aakhri 09:27:04 par. Log mein nau router-aur-interface jodiyan dikhti hain, aur unmein se chaar "down" par khatam hui. Yahi chhoti list hai jiske liye engineer ticket kholega.</p>

<div class="warn"><p><b>Common mistakes.</b> Numbers wali strings sort karna aur <code>Gi0/10</code> ko <code>Gi0/2</code> se pehle paana. <code>.sort()</code> call karke return value expect karna (woh <code>None</code> deta hai; <code>sorted()</code> list deta hai). <code>sorted</code> ko generator dena aur bhoolna ki woh poora stream memory mein padh leta hai. <code>defaultdict</code> ke reads ko bina nuksaan ka lookup samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sorted(x)</code> nayi list deta hai aur <code>x</code> ko chhodta hai; <code>x.sort()</code> <code>x</code> ko jagah par badalta hai aur <code>None</code> deta hai. Sort stable hai: barabar keys wale items apna original order rakhte hain, isliye tied <code>most_common</code> results first-seen order mein rehte hain.</p></div>

<div class="scn"><h4>Kaunsa port badlein?</h4><p>Ek site par random link flaps the aur teen shak the: ek uplink, ek SFP aur ek patch cable. Engineer ne hafte bhar ka syslog parse stage se router aur interface ki key wale Counter mein stream kiya. Ek interface par 30 mein se 18 downs the. Sirf woh ek cable badalne se flapping ruk gayi, aur tally sheet ticket mein saboot ki tarah laga di gayi.</p><p><b>Lesson:</b> pehle gino, phir tay karo kya badalna hai.</p></div>

<div class="iv"><p class="q">"Log mein sabse noisy teen interfaces kaise dhoondhoge?"</p><p>Main log ko generator se records mein parse karta hoon, interface names ko <code>Counter</code> mein deta hoon, aur <code>most_common(3)</code> call karta hoon. Time ya kai fields ke hisaab se ranking ke liye tuple key ke saath <code>sorted</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Counter(...)</code> ginta hai; <code>most_common(n)</code> rank karta hai; missing key 0 padhi jaati hai.</li>
<li><code>defaultdict(list)</code> group karta hai, <code>defaultdict(int)</code> ginta hai; missing key padhne se ban jaati hai.</li>
<li><code>sorted(..., key=..., reverse=...)</code> nayi list deta hai; kai fields ke liye tuple key use karo.</li>
<li>Key mein text numbers ko <code>int</code> se badlo; case-insensitive order ke liye <code>str.lower</code>.</li>
<li><code>min</code> aur <code>max</code> bhi <code>key</code> lete hain.</li>
</ul></div>
`}};export{e as default};