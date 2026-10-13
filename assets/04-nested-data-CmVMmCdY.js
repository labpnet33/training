var e={id:`nested-data`,h:{en:`Nested data: an inventory in a dictionary`,hi:`Nested data: dictionary mein inventory`},body:{en:`
<p>A real inventory has many devices and each device has several facts. You get that by putting one container inside another, called <b>nesting</b>. Think of a filing cabinet: the drawer label is the key, and inside the drawer is a folder with its own labelled pages. The shape <b>dictionary of dictionaries</b> is how most inventories look, and it is also the shape of JSON that APIs return, so learning it now pays off in every later module.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Nested dictionary">
<rect x="20" y="15" width="200" height="120" rx="10" fill="#fde68a"/><text x="120" y="40" text-anchor="middle" class="svg-ink" font-size="14">inventory</text>
<rect x="250" y="15" width="370" height="50" rx="10" fill="#bae6fd"/><text x="435" y="45" text-anchor="middle" class="svg-ink" font-size="14">"PUN-CORE-01"</text>
<rect x="250" y="85" width="370" height="50" rx="10" fill="#bae6fd"/><text x="435" y="115" text-anchor="middle" class="svg-ink" font-size="14">"PUN-ACC-01"</text>
<text x="435" y="55" text-anchor="middle" class="svg-muted" font-size="12">{"ip": "10.10.0.1", "role": "core", "site": "Pune"}</text>
<text x="435" y="125" text-anchor="middle" class="svg-muted" font-size="12">{"ip": "10.10.0.11", "role": "access", "site": "Pune"}</text>
</svg><p class="cap">The outer dictionary is keyed by device name; each value is a small dictionary of facts.</p></div>
<p>This is the first part of the inventory in Lab 1. Read the shape from the outside in. The outer curly brackets open the inventory. Each line is <code>"device name": { ...facts... }</code>. Here it is in action:</p>
<pre class="code">inventory = {
    "PUN-CORE-01": {"ip": "10.10.0.1", "role": "core", "site": "Pune"},
    "PUN-ACC-01": {"ip": "10.10.0.11", "role": "access", "site": "Pune"},
    "BLR-CORE-01": {"ip": "10.20.0.1", "role": "core", "site": "Bengaluru"},
    "BLR-ACC-01": {"ip": "10.20.0.11", "role": "access", "site": "Bengaluru"},
}
print(inventory["PUN-CORE-01"])
print(inventory["PUN-CORE-01"]["ip"])
print(len(inventory))
inventory["HYD-ACC-01"] = {"ip": "10.30.0.11", "role": "access", "site": "Hyderabad"}
print(len(inventory))
print(inventory["HYD-ACC-01"]["site"])
print("BLR-CORE-01" in inventory)</pre>
<pre class="out">AUTO&gt; python3 n1.py
{'ip': '10.10.0.1', 'role': 'core', 'site': 'Pune'}
10.10.0.1
4
5
Hyderabad
True</pre>
<ul>
<li><code>inventory["PUN-CORE-01"]</code> returns the inner dictionary for that device.</li>
<li><code>inventory["PUN-CORE-01"]["ip"]</code> chains two lookups: first the device, then its <code>ip</code> field.</li>
<li><code>len(inventory)</code> counts devices (outer keys), not facts.</li>
<li>Adding a device is one new line: assign a new outer key to a new small dictionary. The count went from 4 to 5.</li>
</ul>
<h3>Another shape: a list of dictionaries</h3>
<p>When the order matters or names can repeat, people use a <b>list of dictionaries</b>: each device is a dictionary and the list holds them. Reading uses an index first, then a key. JSON from APIs often has this shape.</p>
<pre class="code">devices = [
    {"name": "R1", "ip": "10.99.0.1", "role": "core"},
    {"name": "R2", "ip": "10.99.0.2", "role": "edge"},
]
print(devices[0])
print(devices[1]["ip"])
print(len(devices))
devices.append({"name": "R3", "ip": "10.99.0.3", "role": "edge"})
print(devices[-1]["name"])</pre>
<pre class="out">AUTO&gt; python3 n2.py
{'name': 'R1', 'ip': '10.99.0.1', 'role': 'core'}
10.99.0.2
2
R3</pre>
<p>Both shapes work. The key skill is to <b>read the brackets</b>: a number or a name inside <code>[ ]</code> tells you whether the thing in front of it is a list or a dictionary.</p>
<h3>Missing facts</h3>
<p>Nested data makes missing-key errors more likely, because a key may be absent in one device and present in another. The error names the missing key:</p>
<pre class="code">inventory = {"R1": {"ip": "10.99.0.1"}}
print(inventory["R1"]["os"])</pre>
<pre class="out">AUTO&gt; python3 n3.py
Traceback (most recent call last):
  File "n3.py", line 2, in &lt;module&gt;
    print(inventory["R1"]["os"])
<span class="hl">KeyError: 'os'</span></pre>
<div class="eg"><p><b>Worked example.</b> Lab 1 asks you to add <code>HYD-ACC-01</code> to the inventory. It is one line inside the outer braces: the key <code>"HYD-ACC-01"</code>, a colon, then a small dictionary with <code>ip</code>, <code>role</code> and <code>site</code>, and a comma at the end because more items may follow.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting a comma between two entries, or an extra opening bracket without its closing partner. Python reports a SyntaxError and points near the problem. Count your opening and closing brackets for each level.</p></div>
<div class="exam"><p><b>Exam trap.</b> Be able to evaluate chained lookups by hand: for <code>d = {"R1": {"ip": "10.1.1.1"}}</code>, <code>d["R1"]["ip"]</code> is <code>"10.1.1.1"</code>. For a list of dictionaries, <code>devices[0]["name"]</code> reads index first, then key.</p></div>
<div class="scn"><h4>Inventory as the single source</h4><p>A team kept the device list in three scripts, each slightly different. After they moved it into one dictionary in one file and imported it everywhere, adding a router meant editing one entry. The audit finding "inconsistent device lists" disappeared.</p><p><b>Lesson:</b> keep data in one structured place and let every script read it.</p></div>
<div class="iv"><p class="q">"What does data[0]["ip"] tell you about the shape of data?"</p><p>It is a list (index 0) whose items are dictionaries (key "ip"). Reading the brackets from left to right tells you the structure: a number picks an item of a list, a key picks a value of a dictionary.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nesting puts a container inside another: a dictionary of dictionaries is an inventory.</li>
<li>Chain lookups: inventory["R1"]["ip"].</li>
<li>A list of dictionaries is the other common shape (JSON from APIs).</li>
<li>Read brackets to know what is a list and what is a dictionary.</li>
</ul></div>
`,hi:`
<p>Asli inventory mein kai devices hote hain aur har device ke kai facts. Yeh ek container ko doosre ke andar rakhne se milta hai, jise <b>nesting</b> kehte hain. Filing cabinet socho: drawer ka label key hai, aur drawer ke andar ek folder hai jiske apne labelled pages hain. <b>Dictionary of dictionaries</b> ki shape zyada tar inventories ki hoti hai, aur yahi shape JSON ki hai jo APIs return karti hain, isliye ise abhi seekhna har agle module mein kaam aayega.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Nested dictionary">
<rect x="20" y="15" width="200" height="120" rx="10" fill="#fde68a"/><text x="120" y="40" text-anchor="middle" class="svg-ink" font-size="14">inventory</text>
<rect x="250" y="15" width="370" height="50" rx="10" fill="#bae6fd"/><text x="435" y="45" text-anchor="middle" class="svg-ink" font-size="14">"PUN-CORE-01"</text>
<rect x="250" y="85" width="370" height="50" rx="10" fill="#bae6fd"/><text x="435" y="115" text-anchor="middle" class="svg-ink" font-size="14">"PUN-ACC-01"</text>
<text x="435" y="55" text-anchor="middle" class="svg-muted" font-size="12">{"ip": "10.10.0.1", "role": "core", "site": "Pune"}</text>
<text x="435" y="125" text-anchor="middle" class="svg-muted" font-size="12">{"ip": "10.10.0.11", "role": "access", "site": "Pune"}</text>
</svg><p class="cap">Bahar ki dictionary device name se key hoti hai; har value facts ki chhoti dictionary hai.</p></div>
<p>Yeh Lab 1 ke inventory ka pehla hissa hai. Shape ko bahar se andar padho. Bahar ke curly brackets inventory kholte hain. Har line <code>"device name": { ...facts... }</code> hai. Yeh action mein:</p>
<pre class="code">inventory = {
    "PUN-CORE-01": {"ip": "10.10.0.1", "role": "core", "site": "Pune"},
    "PUN-ACC-01": {"ip": "10.10.0.11", "role": "access", "site": "Pune"},
    "BLR-CORE-01": {"ip": "10.20.0.1", "role": "core", "site": "Bengaluru"},
    "BLR-ACC-01": {"ip": "10.20.0.11", "role": "access", "site": "Bengaluru"},
}
print(inventory["PUN-CORE-01"])
print(inventory["PUN-CORE-01"]["ip"])
print(len(inventory))
inventory["HYD-ACC-01"] = {"ip": "10.30.0.11", "role": "access", "site": "Hyderabad"}
print(len(inventory))
print(inventory["HYD-ACC-01"]["site"])
print("BLR-CORE-01" in inventory)</pre>
<pre class="out">AUTO&gt; python3 n1.py
{'ip': '10.10.0.1', 'role': 'core', 'site': 'Pune'}
10.10.0.1
4
5
Hyderabad
True</pre>
<ul>
<li><code>inventory["PUN-CORE-01"]</code> us device ki inner dictionary return karta hai.</li>
<li><code>inventory["PUN-CORE-01"]["ip"]</code> do lookups chain karta hai: pehle device, phir uska <code>ip</code> field.</li>
<li><code>len(inventory)</code> devices (bahar ki keys) ginta hai, facts nahi.</li>
<li>Device jodna ek nayi line hai: nayi bahar ki key ko nayi chhoti dictionary assign karo. Count 4 se 5 ho gaya.</li>
</ul>
<h3>Doosri shape: dictionaries ki list</h3>
<p>Jab order matter karta hai ya naam repeat ho sakte hain, log <b>dictionaries ki list</b> use karte hain: har device ek dictionary hai aur list unhe rakhti hai. Padhne mein pehle index, phir key lagti hai. APIs ka JSON aksar isi shape ka hota hai.</p>
<pre class="code">devices = [
    {"name": "R1", "ip": "10.99.0.1", "role": "core"},
    {"name": "R2", "ip": "10.99.0.2", "role": "edge"},
]
print(devices[0])
print(devices[1]["ip"])
print(len(devices))
devices.append({"name": "R3", "ip": "10.99.0.3", "role": "edge"})
print(devices[-1]["name"])</pre>
<pre class="out">AUTO&gt; python3 n2.py
{'name': 'R1', 'ip': '10.99.0.1', 'role': 'core'}
10.99.0.2
2
R3</pre>
<p>Dono shapes chalti hain. Asli skill hai <b>brackets padhna</b>: <code>[ ]</code> ke andar number ya naam batata hai ki uske aage ki cheez list hai ya dictionary.</p>
<h3>Missing facts</h3>
<p>Nested data mein missing-key errors zyada hote hain, kyunki ek device mein key na ho aur doosre mein ho sakti hai. Error missing key ka naam batata hai:</p>
<pre class="code">inventory = {"R1": {"ip": "10.99.0.1"}}
print(inventory["R1"]["os"])</pre>
<pre class="out">AUTO&gt; python3 n3.py
Traceback (most recent call last):
  File "n3.py", line 2, in &lt;module&gt;
    print(inventory["R1"]["os"])
<span class="hl">KeyError: 'os'</span></pre>
<div class="eg"><p><b>Worked example.</b> Lab 1 aapse inventory mein <code>HYD-ACC-01</code> jodne ko kehta hai. Yeh bahar ke braces ke andar ek line hai: key <code>"HYD-ACC-01"</code>, colon, phir <code>ip</code>, <code>role</code> aur <code>site</code> wali chhoti dictionary, aur end mein comma kyunki aur items aa sakte hain.</p></div>
<div class="warn"><p><b>Common galti.</b> Do entries ke beech comma bhool jaana, ya extra opening bracket jiska closing partner na ho. Python SyntaxError deta hai aur problem ke paas ishara karta hai. Har level ke opening aur closing brackets gino.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chained lookups haath se evaluate karna aana chahiye: <code>d = {"R1": {"ip": "10.1.1.1"}}</code> ke liye <code>d["R1"]["ip"]</code> <code>"10.1.1.1"</code> hai. Dictionaries ki list ke liye <code>devices[0]["name"]</code> pehle index, phir key padhta hai.</p></div>
<div class="scn"><h4>Inventory ek hi source ke roop mein</h4><p>Ek team device list teen scripts mein rakhti thi, har ek thodi alag. Unhone use ek file ki ek dictionary mein daal diya aur sab jagah import kiya, to router jodna ek entry edit karna ho gaya. Audit ki finding "inconsistent device lists" khatam ho gayi.</p><p><b>Lesson:</b> data ek structured jagah rakho aur har script ko use padhne do.</p></div>
<div class="iv"><p class="q">"data[0]["ip"] data ki shape ke baare mein kya batata hai?"</p><p>Yeh ek list hai (index 0) jiske items dictionaries hain (key "ip"). Brackets ko left se right padhne par structure pata chalta hai: number list ka item chunta hai, key dictionary ki value.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nesting ek container ko doosre ke andar rakhta hai: dictionary of dictionaries inventory hai.</li>
<li>Lookups chain karo: inventory["R1"]["ip"].</li>
<li>Dictionaries ki list doosri common shape hai (APIs ka JSON).</li>
<li>Brackets padhkar jaano kaunsi list hai aur kaunsi dictionary.</li>
</ul></div>
`}};export{e as default};