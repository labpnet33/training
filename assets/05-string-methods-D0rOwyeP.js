var e={id:`string-methods`,h:{en:`String methods: cleaning and checking text`,hi:`String methods: text saaf karna aur check karna`},body:{en:`
<p>Text from the real world is messy. A site name arrives as <code>"  pune  "</code> with extra spaces and small letters, an interface as <code>"GigabitEthernet0/1"</code> when a report wants <code>"Gi0/1"</code>. Python strings come with built-in actions called <b>methods</b> for exactly these jobs. A method is called with a dot after the value: <code>value.method()</code>.</p>
<h3>Cleaning methods</h3>
<pre class="code">site = "  pune  "
print("[" + site + "]")
print("[" + site.strip() + "]")
print(site.strip().upper())
print("R1-CORE".lower())
print("pune".title())</pre>
<pre class="out">AUTO&gt; python3 m1.py
[  pune  ]
[pune]
PUNE
r1-core
Pune</pre>
<ul>
<li><code>strip()</code> removes spaces (and new lines) from both ends.</li>
<li><code>upper()</code>, <code>lower()</code>, <code>title()</code> change the case.</li>
<li>You can <b>chain</b> methods: <code>site.strip().upper()</code> strips first, then capitalises.</li>
</ul>
<p>Important: a method never changes the original. It returns a <b>new</b> string. If you want to keep the result, store it in a variable:</p>
<pre class="code">site = "  pune  "
site.strip()
print("[" + site + "]")
site = site.strip()
print("[" + site + "]")</pre>
<pre class="out">AUTO&gt; python3 m2.py
[  pune  ]
[pune]</pre>
<p>The first <code>strip()</code> threw its answer away, so <code>site</code> still has spaces. The assignment <code>site = site.strip()</code> keeps it.</p>
<h3>Replacing and checking</h3>
<pre class="code">intf = "GigabitEthernet0/1"
print(intf.replace("GigabitEthernet", "Gi"))
print(intf.startswith("Gig"))
print(intf.startswith("Fast"))
print("0/1" in intf)
print(intf.endswith("1"))
print("a-b-c".count("-"))</pre>
<pre class="out">AUTO&gt; python3 m3.py
Gi0/1
True
False
True
True
2</pre>
<p><code>replace(old, new)</code> swaps every copy of <code>old</code> for <code>new</code>. <code>startswith</code>, <code>endswith</code> and the word <code>in</code> answer yes/no questions with <code>True</code> or <code>False</code>. They are the building blocks of the decisions you will write in the next module.</p>
<h3>Cutting and joining: split and join</h3>
<p><code>split()</code> cuts a string into a <b>list</b> of pieces. With no argument it cuts at any run of spaces; with an argument it cuts at that character. <code>join()</code> does the opposite: the separator comes first, then the list.</p>
<pre class="code">line = "Gi0/0 10.99.0.1 up up"
parts = line.split()
print(parts)
print(parts[1])
print("10.99.0.1".split("."))
print("PUN-CORE-01".split("-")[0])
print(",".join(["Gi0/1", "Gi0/2", "Gi0/3"]))</pre>
<pre class="out">AUTO&gt; python3 m4.py
['Gi0/0', '10.99.0.1', 'up', 'up']
10.99.0.1
['10', '99', '0', '1']
PUN
Gi0/1,Gi0/2,Gi0/3</pre>
<p>The line above looks like a row from <code>show ip interface brief</code>. After <code>split()</code> each column is one item of the list, and <code>parts[1]</code> is the IP address. This is exactly how scripts read device output.</p>
<table class="cmp"><thead><tr><th>Method</th><th>Result for "  Gi0/1 "</th></tr></thead><tbody>
<tr><td><code>strip()</code></td><td><code>"Gi0/1"</code></td></tr>
<tr><td><code>strip().upper()</code></td><td><code>"GI0/1"</code></td></tr>
<tr><td><code>strip().replace("Gi", "Fa")</code></td><td><code>"Fa0/1"</code></td></tr>
<tr><td><code>split("/")</code></td><td><code>['  Gi0', '1 ']</code></td></tr>
</tbody></table>
<div class="warn"><p><b>Common mistake.</b> Writing <code>site.strip</code> without brackets. That gives the method itself, not the cleaned text. Always put <code>()</code> after a method name. And remember that methods return new strings: store the result.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the return values: <code>"a,b".split(",")</code> is a list <code>['a', 'b']</code>; <code>"a" in "cat"</code> is <code>True</code>; <code>"cat".replace("c", "b")</code> is <code>"bat"</code>. <code>strip()</code> removes only the ends, not spaces in the middle.</p></div>
<div class="scn"><h4>Reports that did not match</h4><p>Two reports listed the same site as "Pune", "pune " and "PUNE". A comparison script counted three different sites. Adding <code>.strip().upper()</code> to every site name before comparing made the data agree and the count dropped to one.</p><p><b>Lesson:</b> clean and normalise text before you compare it.</p></div>
<div class="iv"><p class="q">"How would you turn a line of show output into separate fields?"</p><p>Use <code>split()</code>: it cuts the line at whitespace and returns a list, so each column becomes an item you can pick by index. For other separators pass the character, for example <code>split(",")</code>. For complex output you would later use a parsing library, but <code>split</code> is the foundation.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A method is an action called with a dot: value.method().</li>
<li>strip, upper, lower, replace clean text; they return a new string.</li>
<li>startswith, endswith and in give True or False.</li>
<li>split cuts a string into a list; join glues a list into a string.</li>
</ul></div>
`,hi:`
<p>Asli duniya ka text ganda hota hai. Site name <code>"  pune  "</code> extra spaces aur chhote letters ke saath aata hai, interface <code>"GigabitEthernet0/1"</code> aata hai jabki report ko <code>"Gi0/1"</code> chahiye. Python strings mein inhi kaamon ke liye <b>methods</b> naam ke built-in actions hote hain. Method value ke baad dot lagakar call hota hai: <code>value.method()</code>.</p>
<h3>Saaf karne wale methods</h3>
<pre class="code">site = "  pune  "
print("[" + site + "]")
print("[" + site.strip() + "]")
print(site.strip().upper())
print("R1-CORE".lower())
print("pune".title())</pre>
<pre class="out">AUTO&gt; python3 m1.py
[  pune  ]
[pune]
PUNE
r1-core
Pune</pre>
<ul>
<li><code>strip()</code> dono ends ke spaces (aur new lines) hataata hai.</li>
<li><code>upper()</code>, <code>lower()</code>, <code>title()</code> case badalte hain.</li>
<li>Aap methods <b>chain</b> kar sakte ho: <code>site.strip().upper()</code> pehle strip karta hai, phir capital.</li>
</ul>
<p>Zaroori: method original ko kabhi nahi badalta. Woh <b>nayi</b> string return karta hai. Result rakhna ho to use variable mein store karo:</p>
<pre class="code">site = "  pune  "
site.strip()
print("[" + site + "]")
site = site.strip()
print("[" + site + "]")</pre>
<pre class="out">AUTO&gt; python3 m2.py
[  pune  ]
[pune]</pre>
<p>Pehle <code>strip()</code> ne apna jawab phenk diya, isliye <code>site</code> mein abhi bhi spaces hain. <code>site = site.strip()</code> assignment use rakhta hai.</p>
<h3>Replace aur check karna</h3>
<pre class="code">intf = "GigabitEthernet0/1"
print(intf.replace("GigabitEthernet", "Gi"))
print(intf.startswith("Gig"))
print(intf.startswith("Fast"))
print("0/1" in intf)
print(intf.endswith("1"))
print("a-b-c".count("-"))</pre>
<pre class="out">AUTO&gt; python3 m3.py
Gi0/1
True
False
True
True
2</pre>
<p><code>replace(old, new)</code> <code>old</code> ki har copy ko <code>new</code> se badalta hai. <code>startswith</code>, <code>endswith</code> aur word <code>in</code> haan/na sawaalon ka jawab <code>True</code> ya <code>False</code> mein dete hain. Yeh un decisions ke building blocks hain jo aap agle module mein likhoge.</p>
<h3>Kaatna aur jodna: split aur join</h3>
<p><code>split()</code> string ko pieces ki <b>list</b> mein kaat deta hai. Bina argument ke woh spaces par kaatta hai; argument ke saath us character par. <code>join()</code> ulta karta hai: pehle separator, phir list.</p>
<pre class="code">line = "Gi0/0 10.99.0.1 up up"
parts = line.split()
print(parts)
print(parts[1])
print("10.99.0.1".split("."))
print("PUN-CORE-01".split("-")[0])
print(",".join(["Gi0/1", "Gi0/2", "Gi0/3"]))</pre>
<pre class="out">AUTO&gt; python3 m4.py
['Gi0/0', '10.99.0.1', 'up', 'up']
10.99.0.1
['10', '99', '0', '1']
PUN
Gi0/1,Gi0/2,Gi0/3</pre>
<p>Upar ki line <code>show ip interface brief</code> ki ek row jaisi dikhti hai. <code>split()</code> ke baad har column list ka ek item hai, aur <code>parts[1]</code> IP address hai. Scripts device output isi tarah padhte hain.</p>
<table class="cmp"><thead><tr><th>Method</th><th>"  Gi0/1 " ka result</th></tr></thead><tbody>
<tr><td><code>strip()</code></td><td><code>"Gi0/1"</code></td></tr>
<tr><td><code>strip().upper()</code></td><td><code>"GI0/1"</code></td></tr>
<tr><td><code>strip().replace("Gi", "Fa")</code></td><td><code>"Fa0/1"</code></td></tr>
<tr><td><code>split("/")</code></td><td><code>['  Gi0', '1 ']</code></td></tr>
</tbody></table>
<div class="warn"><p><b>Common galti.</b> <code>site.strip</code> bina brackets ke likhna. Isse method khud milta hai, saaf hua text nahi. Method naam ke baad hamesha <code>()</code> lagao. Aur yaad rakho methods nayi strings return karte hain: result store karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Return values yaad rakho: <code>"a,b".split(",")</code> list <code>['a', 'b']</code> hai; <code>"a" in "cat"</code> <code>True</code> hai; <code>"cat".replace("c", "b")</code> <code>"bat"</code> hai. <code>strip()</code> sirf ends hataata hai, beech ke spaces nahi.</p></div>
<div class="scn"><h4>Reports jo match nahi hui</h4><p>Do reports ne ek hi site ko "Pune", "pune " aur "PUNE" likha. Comparison script ne teen alag sites gine. Compare karne se pehle har site name par <code>.strip().upper()</code> lagane se data match hua aur count ek ho gaya.</p><p><b>Lesson:</b> compare karne se pehle text saaf aur normalise karo.</p></div>
<div class="iv"><p class="q">"Show output ki ek line ko alag fields mein kaise todoge?"</p><p><code>split()</code> use karo: yeh line ko whitespace par kaatkar list return karta hai, isliye har column ek item ban jaata hai jise index se utha sakte ho. Doosre separators ke liye character pass karo, jaise <code>split(",")</code>. Complex output ke liye baad mein parsing library use karoge, lekin <code>split</code> neev hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method ek action hai jo dot se call hota hai: value.method().</li>
<li>strip, upper, lower, replace text saaf karte hain; yeh nayi string return karte hain.</li>
<li>startswith, endswith aur in True ya False dete hain.</li>
<li>split string ko list mein kaatta hai; join list ko string mein jodta hai.</li>
</ul></div>
`}};export{e as default};