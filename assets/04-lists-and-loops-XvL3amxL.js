var e={id:`lists-loops`,h:{en:`Many routers, one loop: lists and for`,hi:`Bahut routers, ek loop: lists aur for`},body:{en:`

<p>One router is a demo. Real networks have dozens. The idea of this chapter is a single sentence: <b>a loop repeats the same steps for every device in a list</b>.</p>

<h3>A list holds many values</h3>
<p>A <b>list</b> is an ordered collection written inside square brackets, separated by commas. Each value is called an <b>item</b>.</p>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
print(len(ROUTERS))      # 3 : len() counts the items
print(ROUTERS[0])        # 10.99.0.1 : counting starts at 0, not 1</pre>
<p>Python counts positions from <b>zero</b>, so the first item is <code>ROUTERS[0]</code>. Names written in CAPITAL LETTERS are a habit for values that do not change while the script runs.</p>

<h3>The for loop</h3>
<p>Typing <code>show</code> on 300 routers by hand is a loop in your head: "next router, log in, type, log out". Python writes the loop like this:</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    print(ip, "-&gt;", conn.find_prompt())
    conn.disconnect()
print("finished")</pre>
<p>Read <code>for ip in ROUTERS:</code> as "for each item in the list, call it <code>ip</code> and run the indented lines". The colon at the end is required. The four lines <b>indented by four spaces</b> are the loop body; they run once per router. The last line, <code>print("finished")</code>, is not indented, so it runs once after the loop is over.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="A for loop takes the items of a list one at a time and runs the indented block once for each."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="14">ROUTERS</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">[ip1, ip2, ip3]</text><rect x="230" y="20" width="170" height="46" rx="10" fill="#bae6fd"/><text x="315" y="40" text-anchor="middle" class="svg-ink" font-size="14">ip = 10.99.0.1</text><text x="315" y="58" text-anchor="middle" class="svg-muted" font-size="12">round 1</text><rect x="230" y="72" width="170" height="46" rx="10" fill="#bae6fd"/><text x="315" y="92" text-anchor="middle" class="svg-ink" font-size="14">ip = 10.99.0.2</text><text x="315" y="110" text-anchor="middle" class="svg-muted" font-size="12">round 2</text><rect x="230" y="124" width="170" height="46" rx="10" fill="#bae6fd"/><text x="315" y="144" text-anchor="middle" class="svg-ink" font-size="14">ip = 10.99.0.3</text><text x="315" y="162" text-anchor="middle" class="svg-muted" font-size="12">round 3</text><line x1="160" y1="85" x2="230" y2="43" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="105" x2="230" y2="147" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="470" y="50" width="160" height="90" rx="10" fill="#bbf7d0"/><text x="550" y="92" text-anchor="middle" class="svg-ink" font-size="14">same indented</text><text x="550" y="110" text-anchor="middle" class="svg-muted" font-size="12">block runs</text><line x1="400" y1="95" x2="470" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">A for loop takes the items of a list one at a time and runs the indented block once for each.</p></div>

<h3>Indentation is the grammar</h3>
<p>In most languages, curly brackets mark a block. In Python the <b>indentation</b> (the spaces at the start of the line) does that job. Use exactly four spaces per level and never mix tabs and spaces. If you forget to indent after the colon, Python refuses to start the script. This is the message for a loop whose body is not indented:</p>
<pre class="code">for ip in ["10.99.0.1"]:
print(ip)</pre>
<pre class="out">AUTO&gt; python3 indent.py
  File "indent.py", line 2
    print(ip)
    ^
<span class="hl">IndentationError: expected an indented block after 'for' statement on line 1</span></pre>
<p>The error is not a network problem. It means the script was never run. Errors that appear before any output are about the <i>shape</i> of the code.</p>

<h3>Run it on three routers</h3>
<p>When all three routers accept SSH (after the Chapter 2 setup on R3), the loop prints one line per router:</p>
<pre class="out">AUTO&gt; python3 loop.py
10.99.0.1 -&gt; R1#
10.99.0.2 -&gt; R2#
<span class="hl">10.99.0.3 -&gt; R3#</span>
finished</pre>
<p>Now extend the loop to collect something useful. <code>send_command("show version | include uptime")</code> asks the router to show only the line that contains the word uptime, and <code>.rstrip("#&gt;")</code> cuts the prompt character off the end of <code>R1#</code> so we get the clean name <code>R1</code>:</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().rstrip("#&gt;")
    line = conn.send_command("show version | include uptime")
    print(name, "|", line)
    conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 uptime.py
R1 | R1 uptime is 0 minutes
R2 | R2 uptime is 0 minutes
<span class="hl">R3 | R3 uptime is 0 minutes</span></pre>
<p>The three lab routers have just booted, so the uptime is "0 minutes". The point is the pattern: one block of code, three results, no extra typing. Adding a fourth router means adding one item to the list.</p>

<h3>What if one router is not ready?</h3>
<p>Before R3 was prepared for SSH, the same loop printed two good lines and then stopped with a traceback:</p>
<pre class="out">AUTO&gt; python3 loop.py
10.99.0.1 -&gt; R1#
10.99.0.2 -&gt; R2#
Traceback (most recent call last):
  File "loop.py", line 6, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
... (rest of the message shortened)</pre>
<p>The script stopped at the first failure, so a healthy router later in the list would never be visited. Chapter 8 teaches <code>try</code> and <code>except</code>, which let the loop report the problem and carry on.</p>

<div class="eg"><p><b>Worked example.</b> A company has branch routers 10.99.0.1 to 10.99.0.3. The list grows to 40 addresses. The loop does not change at all: the engineer only adds addresses to <code>ROUTERS</code>. The nightly job still needs about a second per router, so 40 routers take under a minute.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Forgetting the colon after the <code>for</code> line. (2) Indenting the body with a different number of spaces on different lines. (3) Putting <code>conn.disconnect()</code> outside the loop, so only the last session gets closed. (4) Expecting <code>ROUTERS[3]</code> to be the third item; position 3 is the <i>fourth</i> item, and in a three-item list it does not exist.</p></div>
<div class="exam"><p><b>Exam trap.</b> Python lists are zero-indexed, and indentation (not brackets) defines the loop body. A line indented under <code>for</code> runs once per item; the same line without indentation runs once.</p></div>

<div class="scn"><h4>Half the switches were never audited</h4><p>An engineer pasted 12 login blocks one after another, one per switch, to collect a version report. When two more switches arrived, she forgot to paste them, and the audit quietly missed them for a quarter. A rewrite with one loop over a list put every switch in one place: the list. A new device had to be added to that one list, and the list could be checked against the asset register.</p><p><b>Lesson:</b> a loop plus a list turns "copy and paste" into "add one line", and makes the inventory visible.</p></div>

<div class="iv"><p class="q">"How do you run the same command on 50 devices from Python?"</p><p>Keep the device addresses in a list or dictionary, loop over it, and inside the loop connect, run the command, store or print the result and disconnect. Mention error handling for unreachable devices, and that for very large estates you would use threads or a framework such as Nornir, but the logic is still a loop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A list holds many items in square brackets; counting starts at 0 and <code>len()</code> counts them.</li>
<li><code>for item in list:</code> runs the indented block once per item.</li>
<li>Indentation (four spaces) is part of Python's grammar; a missing indent is an IndentationError.</li>
<li><code>.rstrip("#&gt;")</code> cuts prompt characters, so <code>R1#</code> becomes <code>R1</code>.</li>
<li>An unprepared router stops the loop with an exception; Chapter 8 shows how to carry on.</li>
</ul></div>

`,hi:`

<p>Ek router sirf demo hai. Asli networks mein darjano hote hain. Is chapter ka idea ek hi vaakya mein hai: <b>loop list ke har device ke liye wahi steps repeat karta hai</b>.</p>

<h3>List kai values rakhti hai</h3>
<p><b>List</b> ek ordered collection hai jo square brackets ke andar likhi jaati hai, commas se alag. Har value ek <b>item</b> kehlati hai.</p>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
print(len(ROUTERS))      # 3 : len() items ginta hai
print(ROUTERS[0])        # 10.99.0.1 : ginti 0 se shuru hoti hai, 1 se nahi</pre>
<p>Python positions <b>zero</b> se ginta hai, isliye pehla item <code>ROUTERS[0]</code> hai. CAPITAL LETTERS mein likhe naam ek aadat hain un values ke liye jo script chalte waqt badalti nahi.</p>

<h3>for loop</h3>
<p>300 routers par haath se <code>show</code> type karna aapke dimaag mein ek loop hai: "agla router, login, type, logout". Python loop aise likhta hai:</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    print(ip, "-&gt;", conn.find_prompt())
    conn.disconnect()
print("finished")</pre>
<p><code>for ip in ROUTERS:</code> ko aise padho: "list ke har item ke liye, use <code>ip</code> kaho aur indented lines chalao". Aakhir ka colon zaroori hai. <b>Chaar spaces se indented</b> chaar lines loop body hain; woh har router ke liye ek baar chalti hain. Aakhri line, <code>print("finished")</code>, indented nahi hai, isliye woh loop khatam hone ke baad ek hi baar chalti hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="for loop list ke items ek-ek karke leta hai aur indented block har item ke liye ek baar chalata hai."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="14">ROUTERS</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">[ip1, ip2, ip3]</text><rect x="230" y="20" width="170" height="46" rx="10" fill="#bae6fd"/><text x="315" y="40" text-anchor="middle" class="svg-ink" font-size="14">ip = 10.99.0.1</text><text x="315" y="58" text-anchor="middle" class="svg-muted" font-size="12">round 1</text><rect x="230" y="72" width="170" height="46" rx="10" fill="#bae6fd"/><text x="315" y="92" text-anchor="middle" class="svg-ink" font-size="14">ip = 10.99.0.2</text><text x="315" y="110" text-anchor="middle" class="svg-muted" font-size="12">round 2</text><rect x="230" y="124" width="170" height="46" rx="10" fill="#bae6fd"/><text x="315" y="144" text-anchor="middle" class="svg-ink" font-size="14">ip = 10.99.0.3</text><text x="315" y="162" text-anchor="middle" class="svg-muted" font-size="12">round 3</text><line x1="160" y1="85" x2="230" y2="43" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="105" x2="230" y2="147" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="470" y="50" width="160" height="90" rx="10" fill="#bbf7d0"/><text x="550" y="92" text-anchor="middle" class="svg-ink" font-size="14">wahi indented</text><text x="550" y="110" text-anchor="middle" class="svg-muted" font-size="12">block chalta hai</text><line x1="400" y1="95" x2="470" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">for loop list ke items ek-ek karke leta hai aur indented block har item ke liye ek baar chalata hai.</p></div>

<h3>Indentation hi grammar hai</h3>
<p>Zyadatar languages mein curly brackets block batate hain. Python mein yeh kaam <b>indentation</b> (line ke shuru ke spaces) karta hai. Har level par theek chaar spaces use karo aur tabs aur spaces kabhi mix mat karo. Colon ke baad indent bhool gaye to Python script start karne se mana kar deta hai. Jis loop ki body indented nahi hai uska message yeh hai:</p>
<pre class="code">for ip in ["10.99.0.1"]:
print(ip)</pre>
<pre class="out">AUTO&gt; python3 indent.py
  File "indent.py", line 2
    print(ip)
    ^
<span class="hl">IndentationError: expected an indented block after 'for' statement on line 1</span></pre>
<p>Yeh network ki problem nahi hai. Matlab script kabhi chali hi nahi. Jo errors kisi output se pehle aate hain woh code ki <i>shakal</i> ke baare mein hote hain.</p>

<h3>Teen routers par chalao</h3>
<p>Jab teeno routers SSH accept karte hain (R3 par Chapter 2 ka setup karne ke baad), loop har router ke liye ek line print karta hai:</p>
<pre class="out">AUTO&gt; python3 loop.py
10.99.0.1 -&gt; R1#
10.99.0.2 -&gt; R2#
<span class="hl">10.99.0.3 -&gt; R3#</span>
finished</pre>
<p>Ab loop ko kuch kaam ka collect karne ke liye badhao. <code>send_command("show version | include uptime")</code> router se sirf woh line dikhane ko kehta hai jisme uptime shabd hai, aur <code>.rstrip("#&gt;")</code> <code>R1#</code> ke end se prompt character kaat deta hai taaki saaf naam <code>R1</code> mile:</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().rstrip("#&gt;")
    line = conn.send_command("show version | include uptime")
    print(name, "|", line)
    conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 uptime.py
R1 | R1 uptime is 0 minutes
R2 | R2 uptime is 0 minutes
<span class="hl">R3 | R3 uptime is 0 minutes</span></pre>
<p>Teeno lab routers abhi boot hue hain, isliye uptime "0 minutes" hai. Asli baat pattern hai: code ka ek block, teen results, extra typing nahi. Chautha router jodna matlab list mein ek item jodna.</p>

<h3>Agar ek router ready na ho?</h3>
<p>R3 ko SSH ke liye ready karne se pehle wahi loop do achhi lines print karke traceback ke saath ruk gaya:</p>
<pre class="out">AUTO&gt; python3 loop.py
10.99.0.1 -&gt; R1#
10.99.0.2 -&gt; R2#
Traceback (most recent call last):
  File "loop.py", line 6, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
... (baaki message chhota kiya gaya)</pre>
<p>Script pehli failure par ruk gayi, isliye list mein baad ka koi healthy router kabhi visit nahi hota. Chapter 8 <code>try</code> aur <code>except</code> sikhata hai, jo loop ko problem report karke aage badhne dete hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke branch routers 10.99.0.1 se 10.99.0.3 tak hain. List 40 addresses tak badh jaati hai. Loop bilkul nahi badalta: engineer sirf <code>ROUTERS</code> mein addresses jodta hai. Nightly job ko ab bhi ek router ke liye lagbhag ek second chahiye, isliye 40 routers ek minute se kam lete hain.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) <code>for</code> line ke baad colon bhool jaana. (2) Alag lines par alag number ke spaces se body indent karna. (3) <code>conn.disconnect()</code> ko loop ke bahar rakhna, isliye sirf aakhri session band hota hai. (4) <code>ROUTERS[3]</code> se teesra item expect karna; position 3 <i>chautha</i> item hai, aur teen item wali list mein woh exist hi nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Python lists zero-indexed hote hain, aur loop body indentation (brackets nahi) tay karti hai. <code>for</code> ke neeche indented line har item ke liye ek baar chalti hai; wahi line bina indentation ke ek baar chalti hai.</p></div>

<div class="scn"><h4>Aadhe switches ka audit kabhi hua hi nahi</h4><p>Ek engineer ne version report ke liye har switch ka ek login block, 12 blocks ek ke baad ek paste kiye. Do aur switches aaye to woh unhe paste karna bhool gayi, aur audit ek quarter tak chupchaap unhe chhodta raha. Ek list par ek loop wale rewrite ne har switch ko ek jagah, list mein, rakh diya. Naya device usi ek list mein jodna padta tha, aur list ko asset register se match kiya ja sakta tha.</p><p><b>Lesson:</b> loop aur list "copy and paste" ko "ek line jodo" bana dete hain, aur inventory ko dikhne layak banate hain.</p></div>

<div class="iv"><p class="q">"Python se 50 devices par wahi command kaise chalaoge?"</p><p>Device addresses ek list ya dictionary mein rakho, us par loop chalao, aur loop ke andar connect karo, command chalao, result store ya print karo aur disconnect karo. Unreachable devices ke liye error handling ka zikr karo, aur yeh ki bahut bade estates ke liye threads ya Nornir jaisa framework use karoge, par logic phir bhi ek loop hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List square brackets mein kai items rakhti hai; ginti 0 se shuru hoti hai aur <code>len()</code> unhe ginta hai.</li>
<li><code>for item in list:</code> indented block ko har item ke liye ek baar chalata hai.</li>
<li>Indentation (chaar spaces) Python ki grammar ka hissa hai; indent na ho to IndentationError.</li>
<li><code>.rstrip("#&gt;")</code> prompt characters kaat deta hai, isliye <code>R1#</code> se <code>R1</code> ban jaata hai.</li>
<li>Unprepared router loop ko exception se rok deta hai; Chapter 8 aage badhna sikhata hai.</li>
</ul></div>

`}};export{e as default};