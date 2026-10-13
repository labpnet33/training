var e={id:`counting-and-collecting`,h:{en:`Counting and collecting: Lab 1, the inventory`,hi:`Counting aur collecting: Lab 1, inventory`},body:{en:`
<p>Almost every report is built from two moves inside a loop: <b>count</b> things, and <b>collect</b> things into a list. "How many core devices?" is counting. "Which devices are down?" is collecting. A third move, counting <b>per group</b>, uses a dictionary: "how many devices at each site?". This chapter teaches the three patterns and then walks through Lab 1 line by line.</p>
<h3>Pattern 1 and 2: a counter and a collector</h3>
<pre class="code">roles = ["core", "access", "core", "access", "access"]
core_count = 0
access_names = []
for i, role in enumerate(roles):
    if role == "core":
        core_count = core_count + 1
    else:
        access_names.append("device-" + str(i))
print(core_count)
print(access_names)</pre>
<pre class="out">AUTO&gt; python3 k1.py
2
['device-1', 'device-3', 'device-4']</pre>
<ul>
<li><b>Counter:</b> start at 0 <i>before</i> the loop, add 1 inside the <code>if</code>. If you put <code>core_count = 0</code> inside the loop, it resets every time.</li>
<li><b>Collector:</b> start with an empty list <code>[]</code> before the loop and <code>append</code> inside.</li>
</ul>
<h3>Pattern 3: a dictionary as a counter</h3>
<p>To count per group, use the group name as the key and the count as the value. The first time you meet a group it is not in the dictionary yet, so you create it with 0; then you add 1.</p>
<pre class="code">sites = ["Pune", "Pune", "Bengaluru", "Pune"]
counts = {}
for site in sites:
    if site not in counts:
        counts[site] = 0
    counts[site] = counts[site] + 1
print(counts)</pre>
<pre class="out">AUTO&gt; python3 k2.py
{'Pune': 3, 'Bengaluru': 1}</pre>
<p>Read the three lines in the loop as a story: "If this site is new, start its count at 0. Then add one to its count." Without the first <code>if</code> you would get a <code>KeyError</code> on the first Pune.</p>
<h3>Lab 1 walk-through</h3>
<p>The file starts with a four-device dictionary and three report sections. Here are the lines you will touch, with their numbers, and what the script prints before you change anything. Section 2 prints <b>every</b> device under "Core devices", and the site counts are all zero: those are the two TODOs.</p>
<pre class="out">     8  }
    19      # TODO: print only when info["role"] is "core"
    20      print(f"  {name}")
    21  
    28      counts[site] = counts[site]  # TODO: add 1 here
    29  print("Per site:", counts)</pre>
<pre class="out">AUTO&gt; python3 inventory.py
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
Total: 4
Core devices:
  PUN-CORE-01
  PUN-ACC-01
  BLR-CORE-01
  BLR-ACC-01
<span class="hl">Per site: {'Pune': 0, 'Bengaluru': 0}</span></pre>
<h3>Step 1: add the Hyderabad switch</h3>
<p>Insert one dictionary entry before the closing brace on line 8. Keep the four leading spaces so it lines up, and the comma at the end:</p>
<pre class="out">AUTO&gt; insert inventory.py 8     "HYD-ACC-01": {"ip": "10.30.0.11", "role": "access", "site": "Hyderabad"},</pre>
<pre class="out">AUTO&gt; python3 inventory.py   (first 7 lines)
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
<span class="hl">  HYD-ACC-01 -&gt; 10.30.0.11</span>
<span class="hl">Total: 5</span></pre>
<h3>Step 2: only core devices (TODO 1)</h3>
<p>After the insert the TODO comment moved to line 20 and the print to line 21. Replace the comment with an <code>if</code> and indent the print one more level, so it only runs for core devices:</p>
<pre class="out">    19  for name, info in inventory.items():
    20      # TODO: print only when info["role"] is "core"
    21      print(f"  {name}")
    22  
    29      counts[site] = counts[site]  # TODO: add 1 here
    30  print("Per site:", counts)</pre>
<pre class="out">AUTO&gt; edit inventory.py 20     if info["role"] == "core":
AUTO&gt; edit inventory.py 21         print(f"  {name}")</pre>
<pre class="out">AUTO&gt; python3 inventory.py
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
  HYD-ACC-01 -&gt; 10.30.0.11
Total: 5
<span class="hl">Core devices:</span>
  PUN-CORE-01
  BLR-CORE-01
Per site: {'Pune': 0, 'Bengaluru': 0, 'Hyderabad': 0}</pre>
<h3>Step 3: count per site (TODO 2)</h3>
<p>The line <code>counts[site] = counts[site]</code> stores the old value back, which adds nothing. Make it add one, which is exactly pattern 3:</p>
<pre class="out">AUTO&gt; edit inventory.py 29     counts[site] = counts[site] + 1</pre>
<pre class="out">AUTO&gt; python3 inventory.py
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
  HYD-ACC-01 -&gt; 10.30.0.11
<span class="hl">Total: 5</span>
Core devices:
  PUN-CORE-01
  BLR-CORE-01
<span class="hl">Per site: {'Pune': 2, 'Bengaluru': 2, 'Hyderabad': 1}</span></pre>
<p>The last line shows <code>Hyderabad: 1</code>: Hyderabad is the only site with a single device. Section 1 still lists every device because it has no filter, and that is correct.</p>
<div class="warn"><p><b>Common mistake.</b> Resetting the counter inside the loop, forgetting to create the dictionary key before adding to it, or mis-indenting the line you edit with <code>edit</code> (the leading spaces are part of the line). If the output looks wrong, run <code>nl inventory.py</code> and check the line numbers first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the counting-in-a-dictionary pattern (<code>if key not in d: d[key] = 0</code> then <code>d[key] += 1</code>) and the difference between putting <code>x = 0</code> before and inside a loop.</p></div>
<div class="scn"><h4>Inventory by site for the budget</h4><p>Finance asked how many devices each site runs, to plan support contracts. Instead of counting a spreadsheet by hand, an engineer added the per-site counting loop to the inventory script and sent the printed dictionary the same day. When a site opened, one new entry updated all the totals.</p><p><b>Lesson:</b> counting patterns turn raw data into answers.</p></div>
<div class="iv"><p class="q">"How would you count devices per site from an inventory dictionary?"</p><p>Start with an empty dictionary, loop over the devices, and for each device read its site. If the site is not yet a key, set it to 0; then add 1. At the end the dictionary maps each site to its count. <code>dict.get(site, 0) + 1</code> is a compact alternative.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A counter starts at 0 before the loop and adds 1 inside it.</li>
<li>A collector starts as [] and uses append.</li>
<li>Per-group counts use a dictionary: create the key at 0, then add 1.</li>
<li>In Lab 1: add the device, filter the core devices, count per site.</li>
</ul></div>
`,hi:`
<p>Lagbhag har report loop ke andar do moves se bani hoti hai: cheezein <b>count</b> karna, aur unhe list mein <b>collect</b> karna. "Kitne core devices?" counting hai. "Kaunse devices down hain?" collecting hai. Teesra move, <b>group ke hisaab se</b> counting, dictionary use karta hai: "har site par kitne devices?". Yeh chapter teeno patterns sikhata hai aur phir Lab 1 ko line by line chalata hai.</p>
<h3>Pattern 1 aur 2: counter aur collector</h3>
<pre class="code">roles = ["core", "access", "core", "access", "access"]
core_count = 0
access_names = []
for i, role in enumerate(roles):
    if role == "core":
        core_count = core_count + 1
    else:
        access_names.append("device-" + str(i))
print(core_count)
print(access_names)</pre>
<pre class="out">AUTO&gt; python3 k1.py
2
['device-1', 'device-3', 'device-4']</pre>
<ul>
<li><b>Counter:</b> loop se <i>pehle</i> 0 se shuru karo, <code>if</code> ke andar 1 jodo. <code>core_count = 0</code> loop ke andar rakhoge to har baar reset hoga.</li>
<li><b>Collector:</b> loop se pehle khaali list <code>[]</code> se shuru karo aur andar <code>append</code> karo.</li>
</ul>
<h3>Pattern 3: counter ki tarah dictionary</h3>
<p>Group ke hisaab se gintne ke liye group ka naam key aur count value rakho. Group pehli baar milta hai to dictionary mein abhi nahi hota, isliye use 0 se banate ho; phir 1 jodte ho.</p>
<pre class="code">sites = ["Pune", "Pune", "Bengaluru", "Pune"]
counts = {}
for site in sites:
    if site not in counts:
        counts[site] = 0
    counts[site] = counts[site] + 1
print(counts)</pre>
<pre class="out">AUTO&gt; python3 k2.py
{'Pune': 3, 'Bengaluru': 1}</pre>
<p>Loop ki teen lines ko kahani ki tarah padho: "Agar yeh site nayi hai to uska count 0 se shuru karo. Phir uske count mein ek jodo." Pehle <code>if</code> ke bina pehle Pune par <code>KeyError</code> aata.</p>
<h3>Lab 1 walk-through</h3>
<p>File char-device dictionary aur teen report sections se shuru hoti hai. Yeh woh lines hain jinhe aap chhuoge, unke numbers ke saath, aur badlav se pehle script kya print karta hai. Section 2 "Core devices" ke neeche <b>har</b> device print karta hai, aur site counts sab zero hain: yahi do TODOs hain.</p>
<pre class="out">     8  }
    19      # TODO: print only when info["role"] is "core"
    20      print(f"  {name}")
    21  
    28      counts[site] = counts[site]  # TODO: add 1 here
    29  print("Per site:", counts)</pre>
<pre class="out">AUTO&gt; python3 inventory.py
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
Total: 4
Core devices:
  PUN-CORE-01
  PUN-ACC-01
  BLR-CORE-01
  BLR-ACC-01
<span class="hl">Per site: {'Pune': 0, 'Bengaluru': 0}</span></pre>
<h3>Step 1: Hyderabad switch jodo</h3>
<p>Line 8 ke closing brace se pehle ek dictionary entry insert karo. Shuru ke chaar spaces rakho taaki line barabar rahe, aur end mein comma:</p>
<pre class="out">AUTO&gt; insert inventory.py 8     "HYD-ACC-01": {"ip": "10.30.0.11", "role": "access", "site": "Hyderabad"},</pre>
<pre class="out">AUTO&gt; python3 inventory.py   (first 7 lines)
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
<span class="hl">  HYD-ACC-01 -&gt; 10.30.0.11</span>
<span class="hl">Total: 5</span></pre>
<h3>Step 2: sirf core devices (TODO 1)</h3>
<p>Insert ke baad TODO comment line 20 par aur print line 21 par aa gaya. Comment ko <code>if</code> se badlo aur print ko ek level aur indent karo, taaki woh sirf core devices ke liye chale:</p>
<pre class="out">    19  for name, info in inventory.items():
    20      # TODO: print only when info["role"] is "core"
    21      print(f"  {name}")
    22  
    29      counts[site] = counts[site]  # TODO: add 1 here
    30  print("Per site:", counts)</pre>
<pre class="out">AUTO&gt; edit inventory.py 20     if info["role"] == "core":
AUTO&gt; edit inventory.py 21         print(f"  {name}")</pre>
<pre class="out">AUTO&gt; python3 inventory.py
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
  HYD-ACC-01 -&gt; 10.30.0.11
Total: 5
<span class="hl">Core devices:</span>
  PUN-CORE-01
  BLR-CORE-01
Per site: {'Pune': 0, 'Bengaluru': 0, 'Hyderabad': 0}</pre>
<h3>Step 3: site ke hisaab se count (TODO 2)</h3>
<p>Line <code>counts[site] = counts[site]</code> purani value wapas store karti hai, jisse kuch nahi judta. Ise ek jodne wala banao, yahi pattern 3 hai:</p>
<pre class="out">AUTO&gt; edit inventory.py 29     counts[site] = counts[site] + 1</pre>
<pre class="out">AUTO&gt; python3 inventory.py
All devices:
  PUN-CORE-01 -&gt; 10.10.0.1
  PUN-ACC-01 -&gt; 10.10.0.11
  BLR-CORE-01 -&gt; 10.20.0.1
  BLR-ACC-01 -&gt; 10.20.0.11
  HYD-ACC-01 -&gt; 10.30.0.11
<span class="hl">Total: 5</span>
Core devices:
  PUN-CORE-01
  BLR-CORE-01
<span class="hl">Per site: {'Pune': 2, 'Bengaluru': 2, 'Hyderabad': 1}</span></pre>
<p>Aakhri line <code>Hyderabad: 1</code> dikhati hai: Hyderabad akeli site hai jahan sirf ek device hai. Section 1 abhi bhi har device list karta hai kyunki usme filter nahi hai, aur yeh sahi hai.</p>
<div class="warn"><p><b>Common galti.</b> Counter ko loop ke andar reset karna, add karne se pehle dictionary key banana bhool jaana, ya <code>edit</code> se badli line ki indentation galat karna (shuru ke spaces line ka hissa hain). Output galat dikhe to pehle <code>nl inventory.py</code> chalakar line numbers check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dictionary mein counting ka pattern (<code>if key not in d: d[key] = 0</code> phir <code>d[key] += 1</code>) aur <code>x = 0</code> ko loop se pehle aur andar rakhne ka fark yaad rakho.</p></div>
<div class="scn"><h4>Budget ke liye site-wise inventory</h4><p>Finance ne poocha ki har site par kitne devices hain, support contracts plan karne ke liye. Spreadsheet haath se gintne ki jagah engineer ne inventory script mein site-wise counting loop jodi aur printed dictionary usi din bhej di. Nayi site khulne par ek nayi entry se saare totals update ho gaye.</p><p><b>Lesson:</b> counting patterns raw data ko answers mein badalte hain.</p></div>
<div class="iv"><p class="q">"Inventory dictionary se site ke hisaab se devices kaise ginoge?"</p><p>Khaali dictionary se shuru karo, devices par loop chalao, aur har device ki site padho. Site abhi key nahi hai to use 0 karo; phir 1 jodo. End mein dictionary har site ko uske count se map karti hai. <code>dict.get(site, 0) + 1</code> ek compact alternative hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Counter loop se pehle 0 se shuru hota hai aur andar 1 jodta hai.</li>
<li>Collector [] se shuru hota hai aur append use karta hai.</li>
<li>Group-wise counts dictionary use karte hain: key 0 se banao, phir 1 jodo.</li>
<li>Lab 1 mein: device jodo, core devices filter karo, site ke hisaab se count karo.</li>
</ul></div>
`}};export{e as default};