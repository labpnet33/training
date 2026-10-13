var e={id:`variables`,h:{en:`Variables: named boxes for values`,hi:`Variables: values ke liye naam wale dabbe`},body:{en:`
<p>Imagine you are configuring ten ports for VLAN 10 and your manager changes the VLAN to 20. If you typed "10" in ten places you must find and change all ten. If you typed it once, in a labelled place, you change one thing. A <b>variable</b> is that labelled place: a <b>name</b> that points to a <b>value</b>. Variables are how scripts remember things.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Variables as boxes">
<rect x="20" y="25" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="61" text-anchor="middle" class="svg-ink" font-size="14">hostname</text><text x="105" y="79" text-anchor="middle" class="svg-muted" font-size="12">"R1"</text>
<rect x="235" y="25" width="170" height="80" rx="10" fill="#bae6fd"/><text x="320" y="61" text-anchor="middle" class="svg-ink" font-size="14">vlan</text><text x="320" y="79" text-anchor="middle" class="svg-muted" font-size="12">10</text>
<rect x="450" y="25" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="535" y="61" text-anchor="middle" class="svg-ink" font-size="14">site</text><text x="535" y="79" text-anchor="middle" class="svg-muted" font-size="12">"PUNE"</text>
</svg><p class="cap">Three variables: the name is the label on the box, the value is what is inside.</p></div>
<h3>Creating a variable</h3>
<p>You create a variable with a single equals sign. Read <code>=</code> as "gets" or "is set to", not as "equals": the name on the left receives the value on the right.</p>
<pre class="code">hostname = "R1"
vlan = 10
site = "PUNE"
print(hostname, vlan, site)</pre>
<pre class="out">AUTO&gt; python3 v1.py
R1 10 PUNE</pre>
<p>You can <b>change</b> what is in a box at any time by assigning again. Python always works out the right side first, then stores it. So <code>vlan = vlan + 1</code> means "take the value in vlan, add 1, put the answer back in vlan".</p>
<pre class="code">vlan = 10
print("before:", vlan)
vlan = 20
print("after:", vlan)
vlan = vlan + 1
print("plus one:", vlan)
backup = vlan
vlan = 99
print(vlan, backup)</pre>
<pre class="out">AUTO&gt; python3 v2.py
before: 10
after: 20
plus one: 21
99 21</pre>
<p>The last two lines show that <code>backup = vlan</code> copies the value at that moment. Changing <code>vlan</code> later does not change <code>backup</code>.</p>
<h3>Rules for names</h3>
<ul>
<li>Use letters, digits and underscores. The name cannot start with a digit.</li>
<li>Names are <b>case-sensitive</b>: <code>hostname</code> and <code>Hostname</code> are different boxes.</li>
<li>No spaces. Programmers write <code>mgmt_ip</code> (words joined by underscores, called snake_case).</li>
<li>Choose meaningful names: <code>mgmt_ip</code> beats <code>x</code>. Names written in CAPITALS, such as <code>ROUTERS</code>, are a habit for settings that you do not intend to change while the script runs.</li>
</ul>
<p>Two mistakes that beginners meet within the first hour. A name starting with a digit, and a change of case:</p>
<pre class="code">1ip = "10.99.0.1"</pre>
<pre class="out">AUTO&gt; python3 v3.py
  File "v3.py", line 1
    1ip = "10.99.0.1"
    ^
<span class="hl">SyntaxError: invalid decimal literal</span></pre>
<pre class="code">hostname = "R1"
print(Hostname)</pre>
<pre class="out">AUTO&gt; python3 v4.py
Traceback (most recent call last):
  File "v4.py", line 2, in &lt;module&gt;
    print(Hostname)
<span class="hl">NameError: name 'Hostname' is not defined. Did you mean: 'hostname'?</span></pre>
<p><b>NameError</b> means Python was asked for a name that does not exist yet. Notice that Python even suggests the name you probably meant: <code>Did you mean: 'hostname'?</code>.</p>
<div class="eg"><p><b>Worked example.</b> In the Lab 1 script, <code>interface = "GigabitEthernet0/1"</code> and <code>vlan = 10</code> sit at the top. To build the config for port Gi0/2 in VLAN 20 you edit only those two lines. The rest of the script, which uses the names, does not change.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing <code>vlan == 10</code> when you mean to store a value. One equals sign stores; two equals signs compare (you will meet them in chapter 7). Also, a variable must exist before you use it: print it before the line that creates it and you get a NameError.</p></div>
<div class="exam"><p><b>Exam trap.</b> Be ready to trace a short sequence of assignments by hand. For <code>a = 5</code>, <code>b = a</code>, <code>a = 7</code>, the value of <code>b</code> is still 5.</p></div>
<div class="scn"><h4>One variable, forty ports</h4><p>A script printed a config for 40 ports using a variable <code>vlan</code>. When the design changed from VLAN 10 to VLAN 30, the engineer edited one line at the top and re-ran the script. All 40 port configs were updated and reviewed in minutes, with no search-and-replace risk.</p><p><b>Lesson:</b> put every value that may change in a variable near the top.</p></div>
<div class="iv"><p class="q">"What is a variable in Python?"</p><p>A variable is a name bound to a value, created by assignment with <code>=</code>. It lets a script store, reuse and change values. Names are case-sensitive, cannot start with a digit and should be meaningful, for example <code>mgmt_ip</code>. Assigning again replaces what the name refers to.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A variable is a name pointing to a value; create it with =.</li>
<li>Assigning again replaces the value; vlan = vlan + 1 adds one.</li>
<li>Names are case-sensitive, have no spaces and cannot start with a digit.</li>
<li>NameError means the name does not exist yet or is misspelt.</li>
</ul></div>
`,hi:`
<p>Socho aap das ports VLAN 10 ke liye configure kar rahe ho aur manager VLAN 20 kar deta hai. Agar aapne "10" das jagah type kiya tha to das jagah dhoondh kar badalna padega. Agar ek hi label wali jagah type kiya tha, to ek cheez badalni hai. <b>Variable</b> wahi label wali jagah hai: ek <b>naam</b> jo ek <b>value</b> ko point karta hai. Variables se scripts cheezein yaad rakhte hain.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Variables as boxes">
<rect x="20" y="25" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="61" text-anchor="middle" class="svg-ink" font-size="14">hostname</text><text x="105" y="79" text-anchor="middle" class="svg-muted" font-size="12">"R1"</text>
<rect x="235" y="25" width="170" height="80" rx="10" fill="#bae6fd"/><text x="320" y="61" text-anchor="middle" class="svg-ink" font-size="14">vlan</text><text x="320" y="79" text-anchor="middle" class="svg-muted" font-size="12">10</text>
<rect x="450" y="25" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="535" y="61" text-anchor="middle" class="svg-ink" font-size="14">site</text><text x="535" y="79" text-anchor="middle" class="svg-muted" font-size="12">"PUNE"</text>
</svg><p class="cap">Teen variables: naam box ka label hai, value andar ki cheez.</p></div>
<h3>Variable banana</h3>
<p>Variable ek equals sign se banta hai. <code>=</code> ko "ko milta hai" ya "set hota hai" padho, "barabar" nahi: left ka naam right ki value paata hai.</p>
<pre class="code">hostname = "R1"
vlan = 10
site = "PUNE"
print(hostname, vlan, site)</pre>
<pre class="out">AUTO&gt; python3 v1.py
R1 10 PUNE</pre>
<p>Aap kisi bhi waqt dabbe ki cheez dobara assign karke <b>badal</b> sakte ho. Python hamesha pehle right side nikalta hai, phir store karta hai. Isliye <code>vlan = vlan + 1</code> ka matlab "vlan ki value lo, 1 jodo, jawab wapas vlan mein rakho".</p>
<pre class="code">vlan = 10
print("before:", vlan)
vlan = 20
print("after:", vlan)
vlan = vlan + 1
print("plus one:", vlan)
backup = vlan
vlan = 99
print(vlan, backup)</pre>
<pre class="out">AUTO&gt; python3 v2.py
before: 10
after: 20
plus one: 21
99 21</pre>
<p>Aakhri do lines dikhati hain ki <code>backup = vlan</code> us waqt ki value copy karta hai. Baad mein <code>vlan</code> badalne se <code>backup</code> nahi badalta.</p>
<h3>Naam ke rules</h3>
<ul>
<li>Letters, digits aur underscores use karo. Naam digit se shuru nahi ho sakta.</li>
<li>Naam <b>case-sensitive</b> hain: <code>hostname</code> aur <code>Hostname</code> alag dabbe hain.</li>
<li>Spaces nahi. Programmers <code>mgmt_ip</code> likhte hain (words underscore se jude, snake_case kehlata hai).</li>
<li>Matlab wale naam chuno: <code>mgmt_ip</code> <code>x</code> se behtar hai. CAPITALS mein likhe naam, jaise <code>ROUTERS</code>, un settings ki aadat hai jinhe script chalte waqt badalne ka irada nahi.</li>
</ul>
<p>Do galtiyan jo beginners ko pehle ghante mein milti hain. Digit se shuru hota naam, aur case ka badlav:</p>
<pre class="code">1ip = "10.99.0.1"</pre>
<pre class="out">AUTO&gt; python3 v3.py
  File "v3.py", line 1
    1ip = "10.99.0.1"
    ^
<span class="hl">SyntaxError: invalid decimal literal</span></pre>
<pre class="code">hostname = "R1"
print(Hostname)</pre>
<pre class="out">AUTO&gt; python3 v4.py
Traceback (most recent call last):
  File "v4.py", line 2, in &lt;module&gt;
    print(Hostname)
<span class="hl">NameError: name 'Hostname' is not defined. Did you mean: 'hostname'?</span></pre>
<p><b>NameError</b> ka matlab Python se aisa naam maanga gaya jo abhi bana hi nahi. Dhyan do ki Python woh naam bhi suggest karta hai jo aapka matlab shayad tha: <code>Did you mean: 'hostname'?</code>.</p>
<div class="eg"><p><b>Worked example.</b> Lab 1 script mein <code>interface = "GigabitEthernet0/1"</code> aur <code>vlan = 10</code> top par hain. Port Gi0/2 VLAN 20 ki config banane ke liye aap sirf wahi do lines badalte ho. Script ka baaki hissa, jo naam use karta hai, nahi badalta.</p></div>
<div class="warn"><p><b>Common galti.</b> Value store karni ho aur <code>vlan == 10</code> likh dena. Ek equals sign store karta hai; do equals signs compare karte hain (chapter 7 mein milenge). Aur variable use se pehle exist karna chahiye: use banane wali line se pehle print karoge to NameError aayega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Assignments ke chhote sequence ko haath se trace karne ke liye taiyaar raho. <code>a = 5</code>, <code>b = a</code>, <code>a = 7</code> ke baad <code>b</code> ki value abhi bhi 5 hai.</p></div>
<div class="scn"><h4>Ek variable, chalis ports</h4><p>Ek script ne <code>vlan</code> variable se 40 ports ki config print ki. Design VLAN 10 se VLAN 30 hua to engineer ne top ki ek line edit ki aur script dobara chalayi. Saare 40 port configs update aur review ho gaye, bina search-and-replace ke risk ke.</p><p><b>Lesson:</b> jo bhi value badal sakti hai use top ke paas variable mein rakho.</p></div>
<div class="iv"><p class="q">"Python mein variable kya hota hai?"</p><p>Variable ek naam hai jo value se bandha hota hai, <code>=</code> se assignment karke banta hai. Isse script values store, reuse aur change kar pata hai. Naam case-sensitive hain, digit se shuru nahi ho sakte aur meaningful hone chahiye, jaise <code>mgmt_ip</code>. Dobara assign karne par naam jis cheez ko refer karta hai woh badal jaati hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variable ek naam hai jo value ko point karta hai; = se banao.</li>
<li>Dobara assign karne se value badalti hai; vlan = vlan + 1 ek jodta hai.</li>
<li>Naam case-sensitive hain, spaces nahi aur digit se shuru nahi.</li>
<li>NameError matlab naam abhi bana nahi ya spelling galat hai.</li>
</ul></div>
`}};export{e as default};