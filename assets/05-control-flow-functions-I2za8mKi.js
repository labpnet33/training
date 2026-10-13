var e={id:`control-flow-functions`,h:{en:`Decisions, loops and functions`,hi:`Decisions, loops aur functions`},body:{en:`
<p>Picture the check-in desk at an airport. For <b>each</b> passenger in the queue, the agent checks: <b>if</b> the passport is valid and the name matches the ticket, print a boarding pass; <b>else</b> send them to the help desk. The agent does not reinvent the check for each passenger; the airline wrote it once as a standard procedure. Those three ideas are the heart of every script: <b>conditions</b> (if), <b>loops</b> (for each) and <b>functions</b> (named, reusable procedures).</p>

<h3>Conditions: if, elif, else</h3>
<p>An <code>if</code> statement runs its indented block only when the condition is <b>True</b>. <code>elif</code> ("else if") adds more checks, and <code>else</code> catches everything left. Python checks from the top and runs <b>only the first</b> block whose condition is True.</p>
<pre class="code">status = "administratively down"
if status == "up":
    print("OK")
elif status == "administratively down":
    print("shut by an engineer")       <span class="c"># this one runs</span>
else:
    print("check the cable")</pre>
<p>Comparison operators: <code>==</code> equal, <code>!=</code> not equal, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. Combine them with <code>and</code>, <code>or</code> and <code>not</code>. Python also treats some values as false on their own: <code>0</code>, an empty string <code>""</code>, an empty list <code>[]</code>, an empty dict and <code>None</code>. So <code>if rows:</code> means "if the list is not empty".</p>

<h3>Loops: for and while</h3>
<p>A <code>for</code> loop runs its block once for every item in a collection, putting the current item into the loop variable. <code>range()</code> produces numbers: <code>range(3)</code> gives 0, 1, 2 and <code>range(1, 4)</code> gives 1, 2, 3 (the end is excluded, like a slice). <code>enumerate()</code> gives a counter and the item together.</p>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
for n, ip in enumerate(ROUTERS, start=1):
    loop_ip = "100.100.100.{}".format(n)
    print("{} gets Loopback100 {}".format(ip, loop_ip))

ports = {"GigabitEthernet0/2": 10, "GigabitEthernet0/3": 20}
for port, vid in ports.items():
    print("interface {} -&gt; vlan {}".format(port, vid))</pre>
<pre class="out">10.99.0.1 gets Loopback100 100.100.100.1
10.99.0.2 gets Loopback100 100.100.100.2
<span class="hl">10.99.0.3 gets Loopback100 100.100.100.3</span>
interface GigabitEthernet0/2 -&gt; vlan 10
interface GigabitEthernet0/3 -&gt; vlan 20</pre>
<p>Inside a loop, <code>continue</code> skips to the next item and <code>break</code> leaves the loop completely. A <code>while</code> loop repeats as long as a condition stays True, which suits retries: <code>while attempts &lt; 3 and not connected:</code>. Always make sure something inside changes the condition, or the loop never ends.</p>

<h3>List comprehensions: a loop in one line</h3>
<p>Building a new list from an old one is so common that Python has a short form. These two pieces of code produce the same list:</p>
<pre class="code">up = []
for r in rows:
    if r["status"] == "up":
        up.append(r["intf"])

up = [r["intf"] for r in rows if r["status"] == "up"]</pre>
<p>Read a comprehension as "give me <code>r["intf"]</code> for every <code>r</code> in rows, if the status is up". Line 27 of the lab script <code>collect.py</code> is exactly this.</p>

<h3>Functions: name a procedure once, use it everywhere</h3>
<p>A <b>function</b> is a named block of code. You define it with <code>def</code>, a name, a list of <b>parameters</b> in brackets and a colon. You <b>call</b> it with its name and <b>arguments</b>. <code>return</code> sends a value back to the caller and ends the function immediately. A function with no <code>return</code> gives back <code>None</code>.</p>
<pre class="code">def mask_to_prefix(mask):
    """Turn 255.255.255.0 into 24."""
    bits = 0
    for octet in mask.split("."):
        bits = bits + bin(int(octet)).count("1")
    return bits

def loopback_config(n, desc="Managed by Python"):
    return ["interface Loopback100",
            "description " + desc,
            "ip address 100.100.100.{} 255.255.255.255".format(n)]

print(mask_to_prefix("255.255.255.252"))   <span class="c"># 30</span>
print(loopback_config(2))                  <span class="c"># list of 3 config lines for R2</span></pre>
<p><code>desc="Managed by Python"</code> is a <b>default value</b>: if the caller does not pass it, the default is used. Arguments can also be passed by name, <code>loopback_config(n=2, desc="lab")</code>. Variables created inside a function are <b>local</b>: they disappear when the function returns. Why bother? A function such as <code>parse_brief(text)</code> can be tested once with sample output and then used for every device, and the main loop stays short enough to read.</p>
<p>Functions attached to a value are called <b>methods</b> and use a dot: <code>line.split()</code>, <code>vlans.append(40)</code>, <code>conn.send_command(...)</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Loop with a condition">
<rect x="20" y="85" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">for ip in ROUTERS</text>
<rect x="190" y="85" width="120" height="44" rx="8" fill="#bae6fd"/><text x="250" y="105" text-anchor="middle" class="svg-ink" font-size="13">connect</text><text x="250" y="121" text-anchor="middle" class="svg-muted" font-size="12">get rows</text>
<polygon points="410,70 480,107 410,144 340,107" fill="#fde68a"/><text x="410" y="111" text-anchor="middle" class="svg-ink" font-size="12">rows empty?</text>
<rect x="520" y="20" width="110" height="40" rx="8" fill="#fed7aa"/><text x="575" y="45" text-anchor="middle" class="svg-ink" font-size="12">continue</text>
<rect x="520" y="150" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="175" text-anchor="middle" class="svg-ink" font-size="12">print report</text>
<line x1="140" y1="107" x2="190" y2="107" stroke="#64748b" stroke-width="2"/><line x1="310" y1="107" x2="340" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="90" x2="520" y2="40" stroke="#64748b" stroke-width="2"/><text x="492" y="58" class="svg-accent" font-size="12">yes</text>
<line x1="450" y1="124" x2="520" y2="170" stroke="#64748b" stroke-width="2"/><text x="492" y="164" class="svg-accent" font-size="12">no</text>
<text x="80" y="205" text-anchor="middle" class="svg-muted" font-size="12">next ip, until the list ends</text>
</svg><p class="cap">The typical shape of a network script: loop over devices, collect, decide, report.</p></div>

<div class="eg"><p><b>Worked example.</b> What does this print? <code>total = 0</code>, then <code>for v in [10, 20, 1002, 30]:</code> with the body <code>if v &gt;= 1000: continue</code> and <code>total = total + 1</code>, then <code>print(total)</code> after the loop. Walk it: 10 counts (1), 20 counts (2), 1002 hits <code>continue</code> and is skipped, 30 counts (3). Output: <b>3</b>. If the word were <code>break</code> instead of <code>continue</code>, the loop would stop at 1002 and print <b>2</b>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting <code>return</code> inside the loop instead of after it, so the function returns after the first item; forgetting <code>return</code> entirely, so the caller receives <code>None</code>; and expecting <code>range(1, 3)</code> to include 3.</p></div>

<div class="exam"><p><b>Exam trap.</b> In an if/elif chain, only the first True branch runs, even if later ones are also True. <code>range(5)</code> is 0 to 4. A function called without <code>print</code> in the REPL shows its return value, but in a script nothing appears unless you print it.</p></div>

<div class="scn"><h4>Only one interface in the report</h4><p>A new parsing function returned only the first interface of every router, and the capacity report showed each router with a single port. The code looked correct at a glance. The engineer ran it in the <code>&gt;&gt;&gt;</code> shell with a saved sample of <code>show ip interface brief</code> and saw the problem: <code>return rows</code> was indented one level too deep, inside the <code>for</code> loop, so the function returned after the first row. Moving it back to the function's own indentation level fixed every router at once.</p><p><b>Lesson:</b> indentation decides when <code>return</code> runs; test parse functions with saved output before pointing them at devices.</p></div>

<div class="iv"><p class="q">"What is the difference between break and continue, and where would you use each in a network script?"</p><p>Strong answer: <code>continue</code> skips the rest of the current iteration and moves to the next item, for example skipping a device that is unreachable or a header line in output; <code>break</code> leaves the loop entirely, for example stopping the rollout the moment a verification fails so the error does not spread to the remaining devices. A good answer ties <code>break</code> to change safety.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>if</code>/<code>elif</code>/<code>else</code>: the first True branch wins; empty values and 0 and None count as False.</li>
<li><code>for</code> walks a collection; <code>range(a, b)</code> excludes b; <code>enumerate(..., start=1)</code> numbers items.</li>
<li><code>continue</code> skips one item, <code>break</code> leaves the loop, <code>while</code> repeats while a condition holds.</li>
<li>List comprehension: <code>[expr for x in items if condition]</code>.</li>
<li><code>def</code> defines a function; <code>return</code> ends it and hands back a value; no return means None.</li>
</ul></div>
`,hi:`
<p>Airport ka check-in desk socho. Queue mein <b>har</b> passenger ke liye agent check karta hai: <b>agar</b> passport valid hai aur naam ticket se match karta hai, to boarding pass print karo; <b>warna</b> unhe help desk bhejo. Agent har passenger ke liye check naye sire se nahi banata; airline ne use ek baar standard procedure ki tarah likh diya. Yeh teen ideas har script ka dil hain: <b>conditions</b> (if), <b>loops</b> (har ek ke liye) aur <b>functions</b> (naam wale, dobara use hone wale procedures).</p>

<h3>Conditions: if, elif, else</h3>
<p><code>if</code> statement apna indented block sirf tab chalata hai jab condition <b>True</b> ho. <code>elif</code> ("else if") aur checks jodta hai, aur <code>else</code> baaki sab pakadta hai. Python upar se check karta hai aur <b>sirf pehla</b> block chalata hai jiski condition True ho.</p>
<pre class="code">status = "administratively down"
if status == "up":
    print("OK")
elif status == "administratively down":
    print("shut by an engineer")       <span class="c"># yeh chalega</span>
else:
    print("check the cable")</pre>
<p>Comparison operators: <code>==</code> barabar, <code>!=</code> barabar nahi, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. Inhe <code>and</code>, <code>or</code> aur <code>not</code> se jodo. Python kuch values ko khud hi false maanta hai: <code>0</code>, khaali string <code>""</code>, khaali list <code>[]</code>, khaali dict aur <code>None</code>. To <code>if rows:</code> ka matlab hai "agar list khaali nahi hai".</p>

<h3>Loops: for aur while</h3>
<p><code>for</code> loop collection ke har item ke liye apna block ek baar chalata hai, aur current item ko loop variable mein rakhta hai. <code>range()</code> numbers banata hai: <code>range(3)</code> 0, 1, 2 deta hai aur <code>range(1, 4)</code> 1, 2, 3 deta hai (end shaamil nahi, slice ki tarah). <code>enumerate()</code> counter aur item saath mein deta hai.</p>
<pre class="code">ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
for n, ip in enumerate(ROUTERS, start=1):
    loop_ip = "100.100.100.{}".format(n)
    print("{} gets Loopback100 {}".format(ip, loop_ip))

ports = {"GigabitEthernet0/2": 10, "GigabitEthernet0/3": 20}
for port, vid in ports.items():
    print("interface {} -&gt; vlan {}".format(port, vid))</pre>
<pre class="out">10.99.0.1 gets Loopback100 100.100.100.1
10.99.0.2 gets Loopback100 100.100.100.2
<span class="hl">10.99.0.3 gets Loopback100 100.100.100.3</span>
interface GigabitEthernet0/2 -&gt; vlan 10
interface GigabitEthernet0/3 -&gt; vlan 20</pre>
<p>Loop ke andar <code>continue</code> agle item par kood jaata hai aur <code>break</code> loop se poori tarah bahar nikal jaata hai. <code>while</code> loop tab tak dohrata hai jab tak condition True rahe, jo retries ke liye theek hai: <code>while attempts &lt; 3 and not connected:</code>. Hamesha pakka karo ki andar kuch condition ko badle, warna loop kabhi khatam nahi hoga.</p>

<h3>List comprehensions: ek line mein loop</h3>
<p>Purani list se nayi list banana itna common hai ki Python mein iska chhota form hai. Yeh dono code same list banate hain:</p>
<pre class="code">up = []
for r in rows:
    if r["status"] == "up":
        up.append(r["intf"])

up = [r["intf"] for r in rows if r["status"] == "up"]</pre>
<p>Comprehension ko aise padho "rows ke har <code>r</code> ke liye mujhe <code>r["intf"]</code> do, agar status up hai". Lab script <code>collect.py</code> ki line 27 bilkul yahi hai.</p>

<h3>Functions: procedure ko ek baar naam do, har jagah use karo</h3>
<p><b>Function</b> code ka naam wala block hai. Aap ise <code>def</code>, ek naam, brackets mein <b>parameters</b> ki list aur colon se define karte ho. Aap ise naam aur <b>arguments</b> ke saath <b>call</b> karte ho. <code>return</code> caller ko value wapas bhejta hai aur function ko turant khatam karta hai. Bina <code>return</code> wala function <code>None</code> wapas deta hai.</p>
<pre class="code">def mask_to_prefix(mask):
    """Turn 255.255.255.0 into 24."""
    bits = 0
    for octet in mask.split("."):
        bits = bits + bin(int(octet)).count("1")
    return bits

def loopback_config(n, desc="Managed by Python"):
    return ["interface Loopback100",
            "description " + desc,
            "ip address 100.100.100.{} 255.255.255.255".format(n)]

print(mask_to_prefix("255.255.255.252"))   <span class="c"># 30</span>
print(loopback_config(2))                  <span class="c"># R2 ke liye 3 config lines ki list</span></pre>
<p><code>desc="Managed by Python"</code> ek <b>default value</b> hai: agar caller use pass nahi karta, to default use hota hai. Arguments naam se bhi pass ho sakte hain, <code>loopback_config(n=2, desc="lab")</code>. Function ke andar bane variables <b>local</b> hote hain: function return hote hi gayab ho jaate hain. Yeh sab kyun? <code>parse_brief(text)</code> jaisa function sample output se ek baar test ho sakta hai aur phir har device ke liye use ho sakta hai, aur main loop itna chhota rehta hai ki padha ja sake.</p>
<p>Kisi value se jude functions ko <b>methods</b> kehte hain aur woh dot use karte hain: <code>line.split()</code>, <code>vlans.append(40)</code>, <code>conn.send_command(...)</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Condition ke saath loop">
<rect x="20" y="85" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">for ip in ROUTERS</text>
<rect x="190" y="85" width="120" height="44" rx="8" fill="#bae6fd"/><text x="250" y="105" text-anchor="middle" class="svg-ink" font-size="13">connect</text><text x="250" y="121" text-anchor="middle" class="svg-muted" font-size="12">rows lo</text>
<polygon points="410,70 480,107 410,144 340,107" fill="#fde68a"/><text x="410" y="111" text-anchor="middle" class="svg-ink" font-size="12">rows khaali?</text>
<rect x="520" y="20" width="110" height="40" rx="8" fill="#fed7aa"/><text x="575" y="45" text-anchor="middle" class="svg-ink" font-size="12">continue</text>
<rect x="520" y="150" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="175" text-anchor="middle" class="svg-ink" font-size="12">report print</text>
<line x1="140" y1="107" x2="190" y2="107" stroke="#64748b" stroke-width="2"/><line x1="310" y1="107" x2="340" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="90" x2="520" y2="40" stroke="#64748b" stroke-width="2"/><text x="492" y="58" class="svg-accent" font-size="12">haan</text>
<line x1="450" y1="124" x2="520" y2="170" stroke="#64748b" stroke-width="2"/><text x="492" y="164" class="svg-accent" font-size="12">nahi</text>
<text x="80" y="205" text-anchor="middle" class="svg-muted" font-size="12">agla ip, list khatam hone tak</text>
</svg><p class="cap">Network script ka typical shape: devices par loop, collect, decide, report.</p></div>

<div class="eg"><p><b>Worked example.</b> Yeh kya print karega? <code>total = 0</code>, phir <code>for v in [10, 20, 1002, 30]:</code> jiski body <code>if v &gt;= 1000: continue</code> aur <code>total = total + 1</code> hai, phir loop ke baad <code>print(total)</code>. Chal ke dekho: 10 gina (1), 20 gina (2), 1002 <code>continue</code> se takrata hai aur skip hota hai, 30 gina (3). Output: <b>3</b>. Agar <code>continue</code> ki jagah <code>break</code> hota, to loop 1002 par ruk jaata aur <b>2</b> print hota.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>return</code> ko loop ke baad ki jagah loop ke andar rakhna, jisse function pehle item ke baad hi return ho jaata hai; <code>return</code> bilkul bhool jaana, jisse caller ko <code>None</code> milta hai; aur <code>range(1, 3)</code> mein 3 shaamil hone ki ummeed karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> If/elif chain mein sirf pehla True branch chalta hai, chahe baad wale bhi True hon. <code>range(5)</code> 0 se 4 hai. REPL mein <code>print</code> ke bina call kiya function apni return value dikhata hai, par script mein kuch nahi dikhta jab tak aap print na karo.</p></div>

<div class="scn"><h4>Report mein sirf ek interface</h4><p>Ek naya parsing function har router ka sirf pehla interface return karta tha, aur capacity report mein har router ek hi port ke saath dikhta tha. Code pehli nazar mein sahi lagta tha. Engineer ne ise <code>&gt;&gt;&gt;</code> shell mein <code>show ip interface brief</code> ke saved sample ke saath chalaya aur problem dekhi: <code>return rows</code> ek level zyada gehra indented tha, <code>for</code> loop ke andar, isliye function pehli row ke baad return ho jaata tha. Use function ke apne indentation level par wapas laane se har router ek saath theek ho gaya.</p><p><b>Seekh:</b> indentation decide karta hai ki <code>return</code> kab chalega; parse functions ko devices par lagane se pehle saved output se test karo.</p></div>

<div class="iv"><p class="q">"break aur continue mein kya fark hai, aur network script mein har ek kahan use karoge?"</p><p>Strong answer: <code>continue</code> current iteration ka baaki hissa skip karke agle item par jaata hai, jaise unreachable device ya output ki header line skip karna; <code>break</code> loop se poori tarah bahar nikalta hai, jaise verification fail hote hi rollout rok dena taaki error baaki devices tak na phaile. Achha answer <code>break</code> ko change safety se jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>if</code>/<code>elif</code>/<code>else</code>: pehla True branch jeetta hai; khaali values, 0 aur None False gine jaate hain.</li>
<li><code>for</code> collection par chalta hai; <code>range(a, b)</code> mein b shaamil nahi; <code>enumerate(..., start=1)</code> items ko number deta hai.</li>
<li><code>continue</code> ek item skip karta hai, <code>break</code> loop chhodta hai, <code>while</code> condition rehne tak dohrata hai.</li>
<li>List comprehension: <code>[expr for x in items if condition]</code>.</li>
<li><code>def</code> function define karta hai; <code>return</code> use khatam karke value wapas deta hai; return nahi to None.</li>
</ul></div>
`}};export{e as default};