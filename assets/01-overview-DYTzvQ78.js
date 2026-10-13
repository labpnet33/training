var e={id:`overview`,h:{en:`Why parse? From CLI text to data you can use`,hi:`Parse kyun? CLI text se data jo aap use kar sako`},body:{en:`
<p><b>What you will learn in this module.</b> Network devices answer <code>show</code> commands with <b>text for humans</b>. A script needs <b>data</b>: lists, dictionaries, numbers. Turning the first into the second is called <b>parsing</b>. You will learn three ways to parse, from the simplest to the most robust: cutting text with <code>split()</code>, finding patterns with <b>regular expressions</b> (the <code>re</code> module), and using a <b>parser</b> that returns ready-made dictionaries. In the labs you build an "interfaces that are up" list and a CSV inventory of routers. This is part of the CCNP Automation (350-901 AUTOCOR) track.</p>
<p><b>Prerequisites.</b> Python 1 to 3 of this track: strings and f-strings, lists and dictionaries, loops and <code>if</code>, functions, files and <code>try/except</code>. The previous module showed how data is stored in JSON and YAML; this module is about getting data <b>out of</b> screen text.</p>
<h3>Analogy: reading a parcel label</h3>
<p>A courier label says "Mr Rao, Flat 12, Tower B, Pune 411001, Ph 98xxxxxx". A person reads it at a glance. A sorting machine needs <b>fields</b>: name, flat, city, pincode. To get fields out of the label, you can (1) cut it at the commas, (2) search it for a pattern such as "six digits is a pincode", or (3) use a barcode that already carries the fields. These are exactly the three methods of this module: <code>split</code>, regex and a parser.</p>
<h3>What the raw output looks like</h3>
<p>This is <code>show ip interface brief</code> from router MUM-R1 of the first lab, captured from the simulator.</p>
<pre class="out">MUM-R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p>A human sees a table. A program sees <b>one long string</b> with new-line characters. Column 1 is the interface name, column 2 the IP, and the last two columns the <b>Status</b> and <b>Protocol</b>. The question for the NOC: which interfaces are really up (status up <b>and</b> protocol up)?</p>
<h3>The screen-scraping idea</h3>
<p>Treating output as text and picking pieces out of it is called <b>screen scraping</b>. It is how automation started, and it is still needed because many devices and commands have no API. Its weakness is that it depends on the exact shape of the text:</p>
<ul>
<li>a different software version may add a column,</li>
<li>an interface that is administratively down prints <code>administratively down</code> (two words) in one column,</li>
<li>an empty line, a banner or a warning can appear in the middle.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Three ways to parse"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">split()</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">cut text at spaces</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Regex</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">find patterns</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parser</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">ready dictionaries</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Data</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">lists, dicts, numbers</text></svg><p class="cap">Three ways to parse</p></div>
<p>So the rule of this module is: <b>start with the simplest method that is safe, and move up when the output gets harder</b>.</p>
<h3>The pipeline of every collection script</h3>
<ol>
<li>Connect (SSH) and run the command: you get <b>a string</b>.</li>
<li>Parse the string into <b>data</b> (list or dictionary).</li>
<li>Use the data: filter, count, compare, save as JSON or CSV, build a report.</li>
</ol>
<p>The labs use <code>nkmiko</code> for step 1 and focus on steps 2 and 3. Here is the whole idea in a few lines of plain Python, using a short piece of the output:</p>
<pre class="code">text = """GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down"""

for line in text.splitlines():
    parts = line.split()
    print(parts[0], "is", parts[-1])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">GigabitEthernet0/0 is up
GigabitEthernet0/2 is down</pre>
<p><code>splitlines()</code> cuts the text into lines, <code>split()</code> cuts a line into words, and <code>parts[0]</code> and <code>parts[-1]</code> pick the first and last word. You will practice every piece in the coming chapters.</p>
<h3>What the labs ask you to do</h3>
<p>Lab 1 (<code>up.py</code>, <code>up2.py</code>) collects <code>show ip interface brief</code> from MUM-R1 and MUM-R2 and lists only the interfaces that are up/up, first with <code>split()</code>, then with a parser. Lab 2 (<code>inv.py</code>) reads <code>show version</code> from three Bengaluru routers with regular expressions, fixes one broken pattern, and writes <code>inventory.csv</code> with hostname, version, uptime and serial.</p>
<div class="warn"><p><b>Common beginner mistake.</b> Believing parsing is a one-time job. Output changes with software versions, so a good script <b>checks</b> what it found (for example, that a pattern matched) and reports clearly when it did not.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam contrasts unstructured CLI text with structured data from APIs, and asks which approach is more reliable. Structured data (RESTCONF, NETCONF) is more reliable than screen scraping; parsers such as TextFSM and Genie sit in between.</p></div>
<div class="scn"><h4>The report that broke after an upgrade</h4><p>A team wrote a script that read the fifth word of every line of <code>show ip interface brief</code>. It worked for two years. After a software upgrade, one device printed an extra column and the script began reporting interfaces as "up" when they were down. Nobody noticed for a week because the script never failed; it just returned wrong answers. The team rewrote it with a parser keyed by field names and added a check that the number of interfaces matched the device's own count.</p>
<p><b>Lesson:</b> a parser that silently returns wrong data is worse than one that crashes. Verify what you parse.</p></div>
<div class="iv"><p class="q">"Why is parsing CLI output fragile, and how do you reduce the risk?"</p><p>CLI output is meant for humans, so its columns, spacing and wording can change between versions and platforms. I reduce the risk by preferring structured sources (RESTCONF or NETCONF) when available, otherwise using a tested parser keyed by field names, anchoring regular expressions to labels instead of positions, and always checking that the parse found what I expected.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parsing turns CLI text for humans into lists and dictionaries for programs.</li>
<li>Three methods: <code>split()</code>, regular expressions, and ready-made parsers.</li>
<li>Screen scraping depends on the exact shape of the text and can break after upgrades.</li>
<li>Pipeline: run the command, parse the string, use the data, verify.</li>
<li>Always check that the parse succeeded; silent wrong data is worse than a crash.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Network devices <code>show</code> commands ka jawab <b>insaanon ke liye text</b> mein dete hain. Script ko <b>data</b> chahiye: lists, dictionaries, numbers. Pehle ko doosre mein badalna <b>parsing</b> kehlata hai. Aap parse karne ke teen tareeke seekhoge, sabse simple se sabse mazboot tak: <code>split()</code> se text kaatna, <b>regular expressions</b> (<code>re</code> module) se patterns dhoondhna, aur aise <b>parser</b> ka use jo ready-made dictionaries deta hai. Labs mein aap "up interfaces" ki list aur routers ki CSV inventory banate ho. Yeh CCNP Automation (350-901 AUTOCOR) track ka hissa hai.</p>
<p><b>Prerequisites.</b> Is track ke Python 1 se 3: strings aur f-strings, lists aur dictionaries, loops aur <code>if</code>, functions, files aur <code>try/except</code>. Pichhle module ne dikhaya ki data JSON aur YAML mein kaise store hota hai; yeh module screen text se data <b>bahar nikalne</b> ke baare mein hai.</p>
<h3>Analogy: parcel ka label padhna</h3>
<p>Courier label kehta hai "Mr Rao, Flat 12, Tower B, Pune 411001, Ph 98xxxxxx". Insaan ek nazar mein padh leta hai. Sorting machine ko <b>fields</b> chahiye: name, flat, city, pincode. Label se fields nikalne ke teen tareeke hain: (1) commas par kaato, (2) pattern dhoondho jaise "chhe digits pincode hota hai", ya (3) barcode use karo jisme fields pehle se hon. Yahi is module ke teen methods hain: <code>split</code>, regex aur parser.</p>
<h3>Raw output kaisa dikhta hai</h3>
<p>Yeh pehle lab ke router MUM-R1 ka <code>show ip interface brief</code> hai, simulator se liya hua.</p>
<pre class="out">MUM-R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p>Insaan ko table dikhti hai. Program ko <b>ek lambi string</b> dikhti hai jisme new-line characters hain. Column 1 interface ka naam hai, column 2 IP, aur aakhri do columns <b>Status</b> aur <b>Protocol</b>. NOC ka sawaal: kaun se interfaces sach mein up hain (status up <b>aur</b> protocol up)?</p>
<h3>Screen-scraping ka idea</h3>
<p>Output ko text maan kar usme se tukde nikalna <b>screen scraping</b> kehlata hai. Automation isi se shuru hui, aur ab bhi zaroori hai kyunki kai devices aur commands ke paas API nahi hoti. Iski kamzori yeh hai ki yeh text ke exact shape par nirbhar hai:</p>
<ul>
<li>alag software version ek column jod sakta hai,</li>
<li>administratively down interface ek column mein <code>administratively down</code> (do shabd) print karta hai,</li>
<li>beech mein khaali line, banner ya warning aa sakti hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Parse karne ke teen tareeke"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">split()</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">text ko spaces par kaato</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Regex</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">patterns dhoondho</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parser</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">ready dictionaries</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Data</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">lists, dicts, numbers</text></svg><p class="cap">Parse karne ke teen tareeke</p></div>
<p>Isliye is module ka niyam hai: <b>sabse simple safe method se shuru karo, aur output mushkil hone par upar jao</b>.</p>
<h3>Har collection script ki pipeline</h3>
<ol>
<li>Connect (SSH) karo aur command chalao: aapko <b>ek string</b> milti hai.</li>
<li>String ko <b>data</b> (list ya dictionary) mein parse karo.</li>
<li>Data use karo: filter, count, compare, JSON ya CSV mein save, report banao.</li>
</ol>
<p>Labs step 1 ke liye <code>nkmiko</code> use karte hain aur steps 2 aur 3 par dhyaan dete hain. Poora idea kuch lines ke plain Python mein, output ke chhote hisse ke saath:</p>
<pre class="code">text = """GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down"""

for line in text.splitlines():
    parts = line.split()
    print(parts[0], "is", parts[-1])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">GigabitEthernet0/0 is up
GigabitEthernet0/2 is down</pre>
<p><code>splitlines()</code> text ko lines mein kaatta hai, <code>split()</code> line ko shabdon mein, aur <code>parts[0]</code> aur <code>parts[-1]</code> pehla aur aakhri shabd chunte hain. Har hissa aane waale chapters mein practice karoge.</p>
<h3>Labs aapse kya karwate hain</h3>
<p>Lab 1 (<code>up.py</code>, <code>up2.py</code>) MUM-R1 aur MUM-R2 se <code>show ip interface brief</code> collect karta hai aur sirf up/up interfaces list karta hai, pehle <code>split()</code> se, phir parser se. Lab 2 (<code>inv.py</code>) teen Bengaluru routers se regular expressions se <code>show version</code> padhta hai, ek toota pattern fix karta hai, aur hostname, version, uptime aur serial ke saath <code>inventory.csv</code> likhta hai.</p>
<div class="warn"><p><b>Common beginner mistake.</b> Parsing ko ek baar ka kaam maanna. Output software versions ke saath badalta hai, isliye achhi script <b>check</b> karti hai ki usne kya paaya (jaise pattern match hua) aur na milne par saaf report karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam unstructured CLI text aur APIs ke structured data mein tulna karta hai, aur poochta hai kaun sa approach zyada reliable hai. Structured data (RESTCONF, NETCONF) screen scraping se zyada reliable hai; TextFSM aur Genie jaise parsers beech mein aate hain.</p></div>
<div class="scn"><h4>Upgrade ke baad toota report</h4><p>Ek team ne script likhi jo <code>show ip interface brief</code> ki har line ka paanchva shabd padhti thi. Do saal chali. Software upgrade ke baad ek device ne extra column print kiya aur script down interfaces ko "up" report karne lagi. Ek hafte tak kisi ko pata nahi chala kyunki script kabhi fail nahi hui; bas galat jawab deti rahi. Team ne use field naamon wale parser se dobara likha aur ek check jodi ki interfaces ki ginti device ki apni ginti se match kare.</p>
<p><b>Lesson:</b> jo parser chupchaap galat data deta hai woh crash hone wale se bura hai. Jo parse karo use verify karo.</p></div>
<div class="iv"><p class="q">"CLI output parse karna fragile kyun hai, aur risk kaise kam karte ho?"</p><p>CLI output insaanon ke liye hota hai, isliye uske columns, spacing aur wording versions aur platforms ke beech badal sakte hain. Risk kam karne ke liye main available ho to structured sources (RESTCONF ya NETCONF) pasand karta hoon, warna field naamon wala tested parser use karta hoon, regular expressions ko positions ki jagah labels se anchor karta hoon, aur hamesha check karta hoon ki parse ne wahi paaya jo umeed thi.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parsing insaanon ke CLI text ko programs ke liye lists aur dictionaries mein badalta hai.</li>
<li>Teen methods: <code>split()</code>, regular expressions, aur ready-made parsers.</li>
<li>Screen scraping text ke exact shape par nirbhar hai aur upgrades ke baad toot sakti hai.</li>
<li>Pipeline: command chalao, string parse karo, data use karo, verify karo.</li>
<li>Hamesha check karo ki parse safal hua; chupchaap galat data crash se bura hai.</li>
</ul></div>
`}};export{e as default};