var e={id:`compare`,h:{en:`Comparing snapshots: sets, NEW and LOST`,hi:`Snapshots compare karna: sets, NEW aur LOST`},body:{en:`
<p>You now have pre.json. You make the change, take post.json, and the interesting question is: <b>what is different?</b> This chapter teaches the Python idea that answers it in one line, the <b>set</b>, and walks through <code>compare.py</code> from lab 1.</p>

<h3>Analogy: two guest lists</h3>
<p>You have the guest list from Friday and the guest list from Saturday. Who is new on Saturday? Names on Saturday that were not on Friday. Who left? Names on Friday that are not on Saturday. A <b>set</b> is a collection that works exactly like a guest list: no duplicates, no order, and Python can subtract one set from another.</p>
<pre class="code"><span class="c"># Reference code: not run in the simulator</span>
before = {"10.0.12.0/30", "10.0.23.0/30"}
after  = {"10.0.12.0/30", "10.0.23.0/30", "192.168.33.0/24"}
print(after - before)    <span class="c"># {'192.168.33.0/24'}   what is NEW</span>
print(before - after)    <span class="c"># set()                what is LOST (nothing)</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Set difference gives new and lost">
<ellipse cx="240" cy="95" rx="120" ry="70" fill="#bae6fd" fill-opacity="0.7"/><ellipse cx="400" cy="95" rx="120" ry="70" fill="#bbf7d0" fill-opacity="0.7"/>
<text x="175" y="90" text-anchor="middle" class="svg-ink" font-size="13">LOST</text><text x="175" y="108" text-anchor="middle" class="svg-muted" font-size="12">before - after</text>
<text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">same</text>
<text x="465" y="90" text-anchor="middle" class="svg-ink" font-size="13">NEW</text><text x="465" y="108" text-anchor="middle" class="svg-muted" font-size="12">after - before</text>
<text x="240" y="178" text-anchor="middle" class="svg-muted" font-size="12">pre snapshot</text><text x="400" y="178" text-anchor="middle" class="svg-muted" font-size="12">post snapshot</text>
</svg><p class="cap">Subtract one set from the other to get NEW and LOST.</p></div>

<h3>The change we are testing</h3>
<p>Deccan Net adds LAN 192.168.33.0/24 on R3 as Loopback33 and advertises it in OSPF area 0. The point-to-point network type makes OSPF advertise the real /24 instead of a /32 host route.</p>
<pre class="code">R3&gt; enable
R3# configure terminal
R3(config)# interface Loopback33
R3(config-if)# ip address 192.168.33.1 255.255.255.0
R3(config-if)# ip ospf network point-to-point
R3(config-if)# router ospf 1
R3(config-router)# network 192.168.33.0 0.0.0.255 area 0
R3(config-router)# end</pre>

<h3>Walking through compare.py</h3>
<pre class="code"><span class="c"># Reference code: the core of compare.py</span>
import json
with open("pre.json") as f:
    pre = json.load(f)         <span class="c"># read the file back into a dictionary</span>
with open("post.json") as f:
    post = json.load(f)

lost = 0                       <span class="c"># a counter of problems</span>
for router in pre:
    before = set(pre[router]["routes"])
    after = set(post[router]["routes"])
    for r in sorted(after - before):
        print(f"{router}: NEW route {r}")
    for r in sorted(before - after):
        print(f"{router}: LOST route {r}")
        lost = lost + 1
    if pre[router]["ospf"] != post[router]["ospf"]:
        print(f"{router}: OSPF neighbours changed")
        lost = lost + 1

if lost == 0:
    print("RESULT: OK - nothing was lost")
else:
    print(f"RESULT: CHECK - {lost} problem(s)")</pre>
<ul>
<li><code>json.load</code> is the opposite of <code>json.dump</code>: file to dictionary.</li>
<li><code>set(list)</code> converts the route list into a set so we can subtract.</li>
<li>NEW routes are printed but not counted as a problem: a new route is expected after adding a LAN. LOST routes and changed OSPF neighbours <b>are</b> counted, because losing something is the danger.</li>
<li>The final <code>if</code> prints a one-line verdict anyone can read in a ticket.</li>
</ul>

<h3>The real result</h3>
<pre class="out">AUTO&gt; python3 snapshot.py post
R1: 1 OSPF neighbours, 13 routes
R2: 2 OSPF neighbours, 11 routes
R3: 1 OSPF neighbours, 11 routes
saved post.json

AUTO&gt; python3 compare.py
R1: NEW route 192.168.33.0/24
R2: NEW route 192.168.33.0/24
R3: NEW route 192.168.33.0/24
<span class="hl">R3: NEW route 192.168.33.1/32</span>
RESULT: OK - nothing was lost</pre>
<p>Read it: R1 and R2 each learned the new /24 through OSPF (their route count rose from 12 to 13 and from 10 to 11). R3 shows <b>two</b> new entries: the connected /24 and the local /32 address of its own interface. Route counts on R3 went from 9 to 11. No neighbour changed and nothing was lost, so the verdict is OK.</p>

<div class="eg"><p><b>Worked example.</b> Suppose you had mistyped the OSPF network statement. R3 would show its connected route, but R1 and R2 would print nothing new. The report would still say "OK - nothing was lost", because nothing was lost; it just did not do what you wanted. That is why a diff alone is not enough and why the next chapter adds tests with explicit expectations.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running the post snapshot too early. OSPF needs a few seconds to flood the new route to the other routers. If post.json is taken instantly, R1 and R2 will not have the route yet and you may wrongly blame the change. Wait, or write the script to retry.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the direction of subtraction: <b>after minus before</b> is NEW, <b>before minus after</b> is LOST. Also remember a diff finds change, not correctness. It cannot tell you that an expected route is missing from both snapshots.</p></div>

<div class="scn"><h4>The route that arrived, and the one that vanished</h4><p>After a core change an engineer's diff printed NEW for the planned prefix on every router. A second line read LOST route 10.0.23.0/30 on R2. A cable had been moved while the change was in progress. Without the LOST line the team would have signed off a change that had silently cut a link.</p><p><b>Lesson:</b> always look at LOST first; NEW is usually what you wanted.</p></div>

<div class="iv"><p class="q">"How do you detect unintended side effects of a change?"</p><p>Take a pre and post snapshot of stable state and diff them. Anything NEW should match the plan; anything LOST or changed that is not in the plan is a side effect. In Python, convert the lists to sets and subtract in both directions. Pair it with explicit tests so you also catch things that never appeared.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sets make "what is new" and "what is lost" a one-line subtraction.</li>
<li>after - before is NEW; before - after is LOST.</li>
<li>LOST items and changed neighbours are the danger; count them for the verdict.</li>
<li>Wait for convergence before the post snapshot.</li>
<li>A diff shows change, not correctness; add tests for expectations.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas pre.json hai. Aap change karte ho, post.json lete ho, aur dilchasp sawaal hai: <b>kya alag hai?</b> Yeh chapter woh Python idea sikhata hai jo ise ek line mein hal karta hai, <b>set</b>, aur lab 1 ki <code>compare.py</code> ko samjhata hai.</p>

<h3>Analogy: do guest lists</h3>
<p>Aapke paas Friday ki guest list hai aur Saturday ki. Saturday ko naya kaun hai? Saturday ke naam jo Friday mein nahi the. Kaun gaya? Friday ke naam jo Saturday mein nahi hain. <b>Set</b> aisa collection hai jo bilkul guest list jaisa kaam karta hai: koi duplicate nahi, koi order nahi, aur Python ek set ko doosre se ghata sakta hai.</p>
<pre class="code"><span class="c"># Reference code: simulator mein run nahi hua</span>
before = {"10.0.12.0/30", "10.0.23.0/30"}
after  = {"10.0.12.0/30", "10.0.23.0/30", "192.168.33.0/24"}
print(after - before)    <span class="c"># {'192.168.33.0/24'}   kya NEW hai</span>
print(before - after)    <span class="c"># set()                kya LOST hua (kuch nahi)</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Set difference NEW aur LOST deta hai">
<ellipse cx="240" cy="95" rx="120" ry="70" fill="#bae6fd" fill-opacity="0.7"/><ellipse cx="400" cy="95" rx="120" ry="70" fill="#bbf7d0" fill-opacity="0.7"/>
<text x="175" y="90" text-anchor="middle" class="svg-ink" font-size="13">LOST</text><text x="175" y="108" text-anchor="middle" class="svg-muted" font-size="12">before - after</text>
<text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">same</text>
<text x="465" y="90" text-anchor="middle" class="svg-ink" font-size="13">NEW</text><text x="465" y="108" text-anchor="middle" class="svg-muted" font-size="12">after - before</text>
<text x="240" y="178" text-anchor="middle" class="svg-muted" font-size="12">pre snapshot</text><text x="400" y="178" text-anchor="middle" class="svg-muted" font-size="12">post snapshot</text>
</svg><p class="cap">Ek set ko doosre se ghatao, NEW aur LOST mil jaata hai.</p></div>

<h3>Jis change ko hum test kar rahe hain</h3>
<p>Deccan Net R3 par Loopback33 ke roop mein LAN 192.168.33.0/24 jodta hai aur OSPF area 0 mein advertise karta hai. Point-to-point network type OSPF ko /32 host route ki jagah asli /24 advertise karwata hai.</p>
<pre class="code">R3&gt; enable
R3# configure terminal
R3(config)# interface Loopback33
R3(config-if)# ip address 192.168.33.1 255.255.255.0
R3(config-if)# ip ospf network point-to-point
R3(config-if)# router ospf 1
R3(config-router)# network 192.168.33.0 0.0.0.255 area 0
R3(config-router)# end</pre>

<h3>compare.py ko samajhna</h3>
<pre class="code"><span class="c"># Reference code: compare.py ka core</span>
import json
with open("pre.json") as f:
    pre = json.load(f)         <span class="c"># file ko wapas dictionary mein padho</span>
with open("post.json") as f:
    post = json.load(f)

lost = 0                       <span class="c"># problems ka counter</span>
for router in pre:
    before = set(pre[router]["routes"])
    after = set(post[router]["routes"])
    for r in sorted(after - before):
        print(f"{router}: NEW route {r}")
    for r in sorted(before - after):
        print(f"{router}: LOST route {r}")
        lost = lost + 1
    if pre[router]["ospf"] != post[router]["ospf"]:
        print(f"{router}: OSPF neighbours changed")
        lost = lost + 1

if lost == 0:
    print("RESULT: OK - nothing was lost")
else:
    print(f"RESULT: CHECK - {lost} problem(s)")</pre>
<ul>
<li><code>json.load</code>, <code>json.dump</code> ka ulta hai: file se dictionary.</li>
<li><code>set(list)</code> route list ko set mein badalta hai taaki ghata sakein.</li>
<li>NEW routes print hote hain par problem nahi gine jaate: LAN jodne ke baad naya route expected hai. LOST routes aur badle hue OSPF neighbours <b>gine jaate hain</b>, kyunki kuch kho dena hi khatra hai.</li>
<li>Aakhri <code>if</code> ek line ka verdict print karta hai jo ticket mein koi bhi padh sake.</li>
</ul>

<h3>Asli result</h3>
<pre class="out">AUTO&gt; python3 snapshot.py post
R1: 1 OSPF neighbours, 13 routes
R2: 2 OSPF neighbours, 11 routes
R3: 1 OSPF neighbours, 11 routes
saved post.json

AUTO&gt; python3 compare.py
R1: NEW route 192.168.33.0/24
R2: NEW route 192.168.33.0/24
R3: NEW route 192.168.33.0/24
<span class="hl">R3: NEW route 192.168.33.1/32</span>
RESULT: OK - nothing was lost</pre>
<p>Padho: R1 aur R2 ne OSPF se naya /24 seekha (unke route count 12 se 13 aur 10 se 11 hue). R3 par <b>do</b> naye entries hain: connected /24 aur apne interface ka local /32 address. R3 ke route count 9 se 11 hue. Koi neighbour nahi badla aur kuch nahi khoya, isliye verdict OK hai.</p>

<div class="eg"><p><b>Worked example.</b> Maan lo aapne OSPF network statement galat type ki. R3 apna connected route dikhata, par R1 aur R2 kuch naya print nahi karte. Report phir bhi "OK - nothing was lost" kehti, kyunki kuch khoya nahi; bas woh kaam nahi hua jo chahiye tha. Isiliye sirf diff kaafi nahi hai aur agla chapter explicit expectations wale tests jodta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Post snapshot bahut jaldi lena. OSPF ko naya route doosre routers tak flood karne mein kuch seconds lagte hain. Post.json turant le liya to R1 aur R2 ke paas route abhi nahi hoga aur aap change ko galat dosh doge. Ruko, ya script mein retry likho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ghatane ki direction jaano: <b>after minus before</b> NEW hai, <b>before minus after</b> LOST hai. Yeh bhi yaad rakho ki diff change dhoondhta hai, correctness nahi. Woh yeh nahi bata sakta ki expected route dono snapshots se missing hai.</p></div>

<div class="scn"><h4>Route jo aaya, aur woh jo gayab hua</h4><p>Core change ke baad ek engineer ke diff ne har router par planned prefix ke liye NEW print kiya. Doosri line thi R2 par LOST route 10.0.23.0/30. Change ke dauraan ek cable shift ho gaya tha. LOST line ke bina team aisa change sign-off kar deti jisne chupke se ek link kaat diya tha.</p><p><b>Lesson:</b> hamesha pehle LOST dekho; NEW to aam taur par wahi hota hai jo chahiye tha.</p></div>

<div class="iv"><p class="q">"Change ke unintended side effects kaise pakadte ho?"</p><p>Stable state ke pre aur post snapshot lo aur diff karo. Jo NEW hai woh plan se match hona chahiye; jo LOST ya badla hai aur plan mein nahi, woh side effect hai. Python mein lists ko sets mein badlo aur dono directions mein ghatao. Explicit tests ke saath jodo taaki woh cheezein bhi pakdi jaayein jo kabhi aayi hi nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sets "kya naya hai" aur "kya gaya" ko ek line ka ghatav bana dete hain.</li>
<li>after - before NEW hai; before - after LOST hai.</li>
<li>LOST items aur badle neighbours khatra hain; verdict ke liye unhe gino.</li>
<li>Post snapshot se pehle convergence ka intezaar karo.</li>
<li>Diff change dikhata hai, correctness nahi; expectations ke liye tests jodo.</li>
</ul></div>
`}};export{e as default};