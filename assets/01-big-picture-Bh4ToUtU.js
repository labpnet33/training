var e={id:`big-picture`,h:{en:`Python 2: what you will learn and the big picture`,hi:`Python 2: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn.</b> In "Python 1" you stored one value in one variable. Real networks have many devices, so now you will store <b>many</b> values and let the script <b>repeat</b> work and <b>decide</b>. You will learn lists (many values in order), dictionaries (a value looked up by name), for loops (do it for every item), and if / elif / else (do it only when a condition is true). In the labs you build a small device inventory and then loop over three live routers, count their up interfaces and flag one that has a down interface.</p>
<p><b>Prerequisites.</b> The module "Python 1": variables, strings, f-strings, comparisons and reading an error message. If the word f-string worries you, revisit that module first.</p>
<h3>Analogy: a spreadsheet</h3>
<p>Think of the inventory spreadsheet your team already keeps. A <b>list</b> is one column: every router IP, in order. A <b>dictionary</b> is one row with headers: <i>name, IP, role, site</i> and the values next to them. A <b>for loop</b> is "go down the rows, one by one". An <b>if</b> is a conditional rule: "if role is core, colour the row red". With only those four ideas you can read almost any structured data a network script meets.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Four ideas">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">List</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">a column of IPs</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Dictionary</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">a row: key to value</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">for loop</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">every row in turn</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">if / else</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">choose what to do</text>
</svg><p class="cap">The four ideas of this module: store, label, repeat, decide.</p></div>
<h3>What the finished labs produce</h3>
<p>Lab 1 turns a dictionary of four devices (plus one you add) into three small reports. This is the real output of the finished <code>inventory.py</code>:</p>
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
<p>Lab 2 logs in to three routers, reads the interface table of each, counts the up interfaces and warns about any interface that is down (but not about a port that was shut on purpose):</p>
<pre class="out">AUTO&gt; python3 check_up.py
MUM-R1: 2 interfaces up
MUM-R2: 3 interfaces up
MUM-R3: 2 interfaces up
<span class="hl">  WARNING MUM-R3: down -&gt; ['GigabitEthernet0/2']</span>
Check finished</pre>
<p>By the end of the module you will have written the lines that make this output appear.</p>
<h3>The nine chapters</h3>
<ol>
<li>Big picture (this chapter)</li>
<li>Lists</li>
<li>Dictionaries</li>
<li>Nested data: an inventory</li>
<li>for loops and range()</li>
<li>Decisions: if / elif / else</li>
<li>Counting and collecting (Lab 1)</li>
<li>Loop over routers (Lab 2)</li>
<li>Summary and checklist</li>
</ol>
<div class="warn"><p><b>Common mistake.</b> Skipping straight to the labs. The labs ask you to edit specific line numbers with exact indentation; a quick read of chapters 2 to 6 saves a lot of frustration.</p></div>
<div class="exam"><p><b>Exam trap.</b> The 350-901 exam is full of lists and dictionaries, because API answers (JSON) are exactly nested lists and dictionaries. If you can read a loop over a dictionary, you can read most API-handling code on the exam.</p></div>
<div class="scn"><h4>The spreadsheet that became code</h4><p>A team kept 300 devices in a spreadsheet and copied rows into scripts by hand. They moved the same columns into a Python dictionary, one entry per device. Now one loop can answer "which core devices are in Pune?" and the data is checked into version control instead of living on one laptop.</p><p><b>Lesson:</b> data in lists and dictionaries is something a program can search and count.</p></div>
<div class="iv"><p class="q">"Why are lists and dictionaries so important for network automation?"</p><p>Device inventories, parsed show output and API responses (JSON) are all made of nested lists and dictionaries. Lists hold ordered collections such as device IPs; dictionaries hold labelled fields such as an interface's IP and status. Loops and conditions then process them.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A list is many values in order; a dictionary looks a value up by its key.</li>
<li>A for loop repeats work for every item; if / elif / else chooses what to do.</li>
<li>Labs: build an inventory, then loop over three routers and flag a down interface.</li>
<li>These shapes are exactly what API data (JSON) looks like.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> "Python 1" mein aapne ek variable mein ek value rakhi thi. Asli networks mein kai devices hote hain, isliye ab aap <b>kai</b> values store karoge aur script ko kaam <b>repeat</b> karne aur <b>decide</b> karne dogoge. Aap lists (order mein kai values), dictionaries (naam se dhoondhi jaane wali value), for loops (har item ke liye karo) aur if / elif / else (sirf tab karo jab condition true ho) seekhoge. Labs mein aap chhota device inventory banate ho aur phir teen live routers par loop chalate ho, unke up interfaces ginte ho aur down interface wale router ko flag karte ho.</p>
<p><b>Prerequisites.</b> Module "Python 1": variables, strings, f-strings, comparisons aur error message padhna. Agar f-string word se ghabrahat ho to pehle woh module dekho.</p>
<h3>Analogy: ek spreadsheet</h3>
<p>Apni team ki inventory spreadsheet socho. <b>List</b> ek column hai: har router IP, order mein. <b>Dictionary</b> headers wali ek row hai: <i>name, IP, role, site</i> aur unke saamne values. <b>for loop</b> "rows mein ek-ek karke neeche jao" hai. <b>if</b> ek conditional rule hai: "agar role core hai to row laal kar do". Sirf in chaar ideas se aap lagbhag har structured data padh sakte ho jo network script ko milta hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Four ideas">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">List</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">IPs ka column</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Dictionary</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">row: key se value</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">for loop</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">har row baari-baari</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">if / else</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">kya karna chuno</text>
</svg><p class="cap">Is module ke chaar ideas: store, label, repeat, decide.</p></div>
<h3>Finished labs kya produce karte hain</h3>
<p>Lab 1 char devices (aur ek jo aap jodte ho) ki dictionary ko teen chhoti reports mein badalta hai. Yeh poore hue <code>inventory.py</code> ka asli output hai:</p>
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
<p>Lab 2 teen routers par login karta hai, har ek ka interface table padhta hai, up interfaces ginta hai aur kisi bhi down interface par warning deta hai (lekin jaan-boojh kar shut kiye port par nahi):</p>
<pre class="out">AUTO&gt; python3 check_up.py
MUM-R1: 2 interfaces up
MUM-R2: 3 interfaces up
MUM-R3: 2 interfaces up
<span class="hl">  WARNING MUM-R3: down -&gt; ['GigabitEthernet0/2']</span>
Check finished</pre>
<p>Module ke end tak aap woh lines likh chuke hoge jinse yeh output aata hai.</p>
<h3>Nau chapters</h3>
<ol>
<li>Big picture (yeh chapter)</li>
<li>Lists</li>
<li>Dictionaries</li>
<li>Nested data: ek inventory</li>
<li>for loops aur range()</li>
<li>Decisions: if / elif / else</li>
<li>Counting aur collecting (Lab 1)</li>
<li>Routers par loop (Lab 2)</li>
<li>Summary aur checklist</li>
</ol>
<div class="warn"><p><b>Common galti.</b> Seedha labs par chale jaana. Labs mein specific line numbers exact indentation ke saath edit karne padte hain; chapters 2 se 6 ki ek jhalak bahut jhunjhalahat bachati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> 350-901 exam lists aur dictionaries se bhara hai, kyunki API ke jawab (JSON) bilkul nested lists aur dictionaries hote hain. Dictionary par loop padh sakte ho to exam ka zyada tar API-handling code padh sakte ho.</p></div>
<div class="scn"><h4>Spreadsheet jo code ban gayi</h4><p>Ek team 300 devices spreadsheet mein rakhti thi aur rows haath se scripts mein copy karti thi. Unhone wahi columns Python dictionary mein daal diye, har device ki ek entry. Ab ek loop jawab de deta hai "Pune ke core devices kaunse hain?" aur data version control mein hai, ek laptop par nahi.</p><p><b>Lesson:</b> lists aur dictionaries mein data aisa hai jise program search aur count kar sakta hai.</p></div>
<div class="iv"><p class="q">"Network automation ke liye lists aur dictionaries itni zaroori kyun hain?"</p><p>Device inventories, parsed show output aur API responses (JSON) sab nested lists aur dictionaries se bane hote hain. Lists ordered collections (jaise device IPs) rakhti hain; dictionaries labelled fields (jaise interface ka IP aur status). Loops aur conditions phir unhe process karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List order mein kai values hai; dictionary value ko uski key se dhoondhti hai.</li>
<li>for loop har item ke liye kaam repeat karta hai; if / elif / else chunta hai kya karna hai.</li>
<li>Labs: inventory banao, phir teen routers par loop chalao aur down interface flag karo.</li>
<li>Yahi shapes API data (JSON) ki hoti hain.</li>
</ul></div>
`}};export{e as default};