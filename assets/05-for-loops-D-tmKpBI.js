var e={id:`for-loops`,h:{en:`for loops and range(): do it for every item`,hi:`for loops aur range(): har item ke liye karo`},body:{en:`
<p>On a switch you type <code>interface range gigabitEthernet 0/1 - 4</code> and the next commands apply to four ports. You do not repeat them four times. A <b>for loop</b> is that idea in Python: "for every item in this group, run these lines". It is the single most important tool in automation, because it turns a script for one router into a script for a thousand.</p>
<h3>Anatomy of a for loop</h3>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
for ip in ROUTERS:
    print("Connecting to", ip)
print("All done")</pre>
<pre class="out">AUTO&gt; python3 o1.py
Connecting to 10.99.0.1
Connecting to 10.99.0.2
Connecting to 10.99.0.3
All done</pre>
<ol>
<li><code>for ip in ROUTERS:</code> reads "for each item in ROUTERS, call it ip". The variable <code>ip</code> is created by the loop and takes each value in turn.</li>
<li>The line ends with a <b>colon</b>.</li>
<li>The lines <b>indented by 4 spaces</b> form the body. They run once per item.</li>
<li>The first line that is <b>not</b> indented (<code>print("All done")</code>) is outside the loop and runs once, after the loop ends.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Loop cycle">
<rect x="20" y="30" width="130" height="50" rx="10" fill="#fde68a"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="14">next item</text>
<line x1="150" y1="55" x2="190" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="30" width="150" height="50" rx="10" fill="#bae6fd"/><text x="265" y="60" text-anchor="middle" class="svg-ink" font-size="14">run the body</text>
<line x1="340" y1="55" x2="380" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="380" y="30" width="130" height="50" rx="10" fill="#ddd6fe"/><text x="445" y="60" text-anchor="middle" class="svg-ink" font-size="14">more items?</text>
<path d="M445 80 Q445 100 85 100 Q85 100 85 80" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="270" y="97" text-anchor="middle" class="svg-accent" font-size="12">yes: repeat</text>
<text x="580" y="60" text-anchor="middle" class="svg-muted" font-size="12">no: done</text>
<line x1="510" y1="55" x2="545" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The loop picks the next item, runs the body, and asks whether more items remain.</p></div>
<h3>Looping over numbers with range()</h3>
<p><code>range(1, 4)</code> produces 1, 2, 3: it starts at the first number and stops <b>before</b> the second. <code>range(3)</code> gives 0, 1, 2. It is perfect for repeated configuration lines.</p>
<pre class="code">for n in range(1, 4):
    print(f"interface Loopback{n}")
for n in range(3):
    print(n)</pre>
<pre class="out">AUTO&gt; python3 o2.py
interface Loopback1
interface Loopback2
interface Loopback3
0
1
2</pre>
<h3>Looping over a dictionary</h3>
<p>A plain loop over a dictionary gives the <b>keys</b>. The method <code>items()</code> gives the key <b>and</b> the value together, so you can unpack them into two variables:</p>
<pre class="code">inventory = {
    "PUN-CORE-01": {"ip": "10.10.0.1", "role": "core"},
    "PUN-ACC-01": {"ip": "10.10.0.11", "role": "access"},
}
for name, info in inventory.items():
    print(name, info["ip"])
for name in inventory:
    print(name)</pre>
<pre class="out">AUTO&gt; python3 o3.py
PUN-CORE-01 10.10.0.1
PUN-ACC-01 10.10.0.11
PUN-CORE-01
PUN-ACC-01</pre>
<h3>Counters and enumerate</h3>
<p>A <b>counter</b> starts at 0 and adds 1 inside the loop. <code>enumerate()</code> hands you a running number along with each item; <code>start=1</code> makes it count from 1 for human-friendly numbering.</p>
<pre class="code">up = 0
for status in ["up", "down", "up"]:
    up = up + 1
print(up)
for i, ip in enumerate(["10.99.0.1", "10.99.0.2"], start=1):
    print(i, ip)</pre>
<pre class="out">AUTO&gt; python3 o4.py
3
1 10.99.0.1
2 10.99.0.2</pre>
<h3>The indentation error</h3>
<pre class="code">for ip in ["10.99.0.1"]:
print(ip)</pre>
<pre class="out">AUTO&gt; python3 o5.py
  File "o5.py", line 2
    print(ip)
    ^
<span class="hl">IndentationError: expected an indented block after 'for' statement on line 1</span></pre>
<p>Python demands at least one indented line after the colon. Put 4 spaces in front of the <code>print</code> and the loop works.</p>
<div class="eg"><p><b>Worked example.</b> In the Lab 2 script the outer loop visits each router and an inner loop, indented 4 more spaces, visits each interface of that router. The inner body is at 8 spaces, and a line inside an <code>if</code> within it is at 12 spaces.</p></div>
<div class="warn"><p><b>Common mistake.</b> Mixing tabs and spaces, or indenting by different amounts. Use exactly 4 spaces per level everywhere. Also do not change the list while looping over it; build a new list instead.</p></div>
<div class="exam"><p><b>Exam trap.</b> Expect questions like "How many times does the body run?" Count the items. Remember <code>range(1, 4)</code> runs 3 times and does not include 4, and that the dictionary loop <code>for k in d</code> gives keys.</p></div>
<div class="scn"><h4>The loop that ran once</h4><p>A script was meant to print "checked" for each of ten switches but printed it once. The <code>print</code> had been placed in the outer, un-indented position by mistake, after the loop. Indenting that line by 4 spaces brought it inside the loop and it printed ten times.</p><p><b>Lesson:</b> indentation decides what is inside the loop.</p></div>
<div class="iv"><p class="q">"How do you loop over a dictionary and get both keys and values?"</p><p>Use <code>for key, value in d.items():</code>. Each pass unpacks one pair into the two variables. A plain <code>for key in d:</code> gives only keys, and <code>d.values()</code> gives only values.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A for loop runs its indented body once per item.</li>
<li>The for line ends with a colon; the body is indented 4 spaces.</li>
<li>range(1, 4) gives 1, 2, 3; items() gives key and value.</li>
<li>A counter starts at 0 and adds 1; enumerate numbers the items.</li>
</ul></div>
`,hi:`
<p>Switch par aap <code>interface range gigabitEthernet 0/1 - 4</code> type karte ho aur agle commands chaar ports par lagte hain. Aap unhe chaar baar repeat nahi karte. <b>for loop</b> Python mein wahi idea hai: "is group ke har item ke liye yeh lines chalao". Automation ka yeh sabse zaroori tool hai, kyunki yeh ek router ke script ko hazaar routers ka script bana deta hai.</p>
<h3>for loop ki anatomy</h3>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
for ip in ROUTERS:
    print("Connecting to", ip)
print("All done")</pre>
<pre class="out">AUTO&gt; python3 o1.py
Connecting to 10.99.0.1
Connecting to 10.99.0.2
Connecting to 10.99.0.3
All done</pre>
<ol>
<li><code>for ip in ROUTERS:</code> ka matlab "ROUTERS ke har item ko ip kaho". Variable <code>ip</code> loop khud banata hai aur baari-baari har value leta hai.</li>
<li>Line <b>colon</b> par khatam hoti hai.</li>
<li><b>4 spaces indent</b> wali lines body banati hain. Yeh har item ke liye ek baar chalti hain.</li>
<li>Pehli line jo indented <b>nahi</b> hai (<code>print("All done")</code>) loop ke bahar hai aur loop khatam hone ke baad ek baar chalti hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Loop cycle">
<rect x="20" y="30" width="130" height="50" rx="10" fill="#fde68a"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="14">agla item</text>
<line x1="150" y1="55" x2="190" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="30" width="150" height="50" rx="10" fill="#bae6fd"/><text x="265" y="60" text-anchor="middle" class="svg-ink" font-size="14">body chalao</text>
<line x1="340" y1="55" x2="380" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="380" y="30" width="130" height="50" rx="10" fill="#ddd6fe"/><text x="445" y="60" text-anchor="middle" class="svg-ink" font-size="14">aur items?</text>
<path d="M445 80 Q445 100 85 100 Q85 100 85 80" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="270" y="97" text-anchor="middle" class="svg-accent" font-size="12">haan: repeat</text>
<text x="580" y="60" text-anchor="middle" class="svg-muted" font-size="12">nahi: khatam</text>
<line x1="510" y1="55" x2="545" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Loop agla item uthata hai, body chalata hai, aur poochta hai kya aur items bache hain.</p></div>
<h3>range() se numbers par loop</h3>
<p><code>range(1, 4)</code> 1, 2, 3 banata hai: pehle number se shuru hota hai aur doosre se <b>pehle</b> ruk jaata hai. <code>range(3)</code> 0, 1, 2 deta hai. Repeated configuration lines ke liye perfect.</p>
<pre class="code">for n in range(1, 4):
    print(f"interface Loopback{n}")
for n in range(3):
    print(n)</pre>
<pre class="out">AUTO&gt; python3 o2.py
interface Loopback1
interface Loopback2
interface Loopback3
0
1
2</pre>
<h3>Dictionary par loop</h3>
<p>Dictionary par seedha loop <b>keys</b> deta hai. Method <code>items()</code> key <b>aur</b> value ek saath deta hai, taaki aap unhe do variables mein unpack kar sako:</p>
<pre class="code">inventory = {
    "PUN-CORE-01": {"ip": "10.10.0.1", "role": "core"},
    "PUN-ACC-01": {"ip": "10.10.0.11", "role": "access"},
}
for name, info in inventory.items():
    print(name, info["ip"])
for name in inventory:
    print(name)</pre>
<pre class="out">AUTO&gt; python3 o3.py
PUN-CORE-01 10.10.0.1
PUN-ACC-01 10.10.0.11
PUN-CORE-01
PUN-ACC-01</pre>
<h3>Counters aur enumerate</h3>
<p><b>Counter</b> 0 se shuru hota hai aur loop ke andar 1 jodta hai. <code>enumerate()</code> har item ke saath ek chalta number deta hai; <code>start=1</code> use insaani ginti ke liye 1 se shuru karta hai.</p>
<pre class="code">up = 0
for status in ["up", "down", "up"]:
    up = up + 1
print(up)
for i, ip in enumerate(["10.99.0.1", "10.99.0.2"], start=1):
    print(i, ip)</pre>
<pre class="out">AUTO&gt; python3 o4.py
3
1 10.99.0.1
2 10.99.0.2</pre>
<h3>Indentation error</h3>
<pre class="code">for ip in ["10.99.0.1"]:
print(ip)</pre>
<pre class="out">AUTO&gt; python3 o5.py
  File "o5.py", line 2
    print(ip)
    ^
<span class="hl">IndentationError: expected an indented block after 'for' statement on line 1</span></pre>
<p>Python colon ke baad kam se kam ek indented line maangta hai. <code>print</code> ke aage 4 spaces lagao aur loop chalta hai.</p>
<div class="eg"><p><b>Worked example.</b> Lab 2 script mein bahar ka loop har router visit karta hai aur andar ka loop, 4 spaces aur indent, us router ka har interface visit karta hai. Andar ki body 8 spaces par hai, aur usme ek <code>if</code> ke andar ki line 12 spaces par.</p></div>
<div class="warn"><p><b>Common galti.</b> Tabs aur spaces mix karna, ya alag-alag amount indent karna. Har jagah har level ke liye exactly 4 spaces use karo. Aur list par loop chalate waqt use mat badlo; nayi list banao.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Body kitni baar chalegi?" jaise sawaal aate hain. Items gino. Yaad rakho <code>range(1, 4)</code> 3 baar chalta hai aur 4 shaamil nahi, aur dictionary loop <code>for k in d</code> keys deta hai.</p></div>
<div class="scn"><h4>Loop jo ek hi baar chala</h4><p>Ek script ko das switches mein se har ek ke liye "checked" print karna tha lekin usne ek hi baar print kiya. <code>print</code> galti se bahar wali, bina indent ki position par, loop ke baad, tha. Us line ko 4 spaces indent karne se woh loop ke andar aayi aur das baar print hui.</p><p><b>Lesson:</b> indentation decide karta hai ki kya loop ke andar hai.</p></div>
<div class="iv"><p class="q">"Dictionary par loop karke keys aur values dono kaise paate ho?"</p><p><code>for key, value in d.items():</code> use karo. Har pass ek pair ko do variables mein unpack karta hai. Seedha <code>for key in d:</code> sirf keys deta hai, aur <code>d.values()</code> sirf values.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>for loop apni indented body har item ke liye ek baar chalata hai.</li>
<li>for line colon par khatam hoti hai; body 4 spaces indent hoti hai.</li>
<li>range(1, 4) 1, 2, 3 deta hai; items() key aur value deta hai.</li>
<li>Counter 0 se shuru hota hai aur 1 jodta hai; enumerate items ko number deta hai.</li>
</ul></div>
`}};export{e as default};