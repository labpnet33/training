var e={id:`split-basics`,h:{en:`Cutting text: splitlines, split, strip and indexes`,hi:`Text kaatna: splitlines, split, strip aur indexes`},body:{en:`
<p>The simplest parsing tools are string methods you may already know. This chapter uses them on the real output of <code>show ip interface brief</code> from lab 1. One small idea per section.</p>
<h3>Step 1: the output is one string</h3>
<p>When a script receives a command's output, it is a single string with <code>\\n</code> (new-line) characters inside. To make it easy to practice, we keep a copy of the output of router MUM-R1 in a variable. The triple quotes <code>"""</code> let a string span many lines.</p>
<h3>Step 2: splitlines cuts text into lines</h3>
<p><code>text.splitlines()</code> returns a <b>list</b> with one item per line, without the new-line characters.</p>
<pre class="code">output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up"""

lines = output.splitlines()
print(len(lines))
print(lines[0])
print(lines[1])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">6
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up</pre>
<p>Six lines: one heading and five interfaces. <code>lines[0]</code> is the heading, because counting starts at 0. We do not want the heading in our data, so we <b>skip it</b> with a slice: <code>lines[1:]</code> means "from item 1 to the end".</p>
<h3>Step 3: split cuts a line into words</h3>
<p><code>line.split()</code> with no argument cuts at any run of spaces and returns a list of words. The spaces, however many, vanish. That is the magic: columns lined up with many spaces become tidy list items.</p>
<pre class="code">line = "GigabitEthernet0/1     10.12.0.1       YES manual up                    up"
parts = line.split()
print(parts)
print(len(parts))
print(parts[0])
print(parts[1])
print(parts[-1])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">['GigabitEthernet0/1', '10.12.0.1', 'YES', 'manual', 'up', 'up']
6
GigabitEthernet0/1
10.12.0.1
up</pre>
<p>The line became six words. Each can be reached by its position: <code>parts[0]</code> is the interface name, <code>parts[1]</code> the IP address, and <code>parts[-1]</code> the <b>last</b> word, the protocol. A negative index counts from the end, so <code>-1</code> is the last item and <code>-2</code> the one before it. Using the last word is handy because it stays at the end even if columns are added in the middle.</p>
<p>[[flow From string to fields | output/one long string | splitlines()/list of lines | split()/list of words | parts[0], parts[-1]/pick fields]]</p>
<h3>Step 4: loop and decide</h3>
<p>Combine the pieces with the loop and <code>if</code> you know. This is the exact TODO of lab 1: print the interface name only when the last word is <code>up</code>.</p>
<pre class="code">output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up"""

for line in output.splitlines()[1:]:
    parts = line.split()
    if parts[-1] == "up":
        print(parts[0])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">GigabitEthernet0/0
GigabitEthernet0/1
Loopback0</pre>
<p>Three interfaces are up/up. <code>GigabitEthernet0/2</code> is down/down and <code>GigabitEthernet0/3</code> is administratively down, so neither is printed.</p>
<h3>What the lab script prints before you finish it</h3>
<p>In the lab, <code>up.py</code> logs in to both routers and prints each row as a list of words, before the TODO is solved. This is the real output from the lab terminal. Notice the two lists that are longer than the others.</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = {"MUM-R1": "10.99.0.1", "MUM-R2": "10.99.0.2"}

for name, ip in ROUTERS.items():
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    output = conn.send_command("show ip interface brief")
    conn.disconnect()
    print(f"=== {name} ===")
    for line in output.splitlines()[1:]:
        parts = line.split()
        print(parts)</pre><p><i>Run in the lab terminal (it uses the lab routers). Output captured from the simulator.</i></p><pre class="out">=== MUM-R1 ===
['GigabitEthernet0/0', '10.99.0.1', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/1', '10.12.0.1', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/2', '10.50.0.1', 'YES', 'manual', 'down', 'down']
['GigabitEthernet0/3', 'unassigned', 'YES', 'unset', 'administratively', 'down', 'down']
['Loopback0', '1.1.1.1', 'YES', 'manual', 'up', 'up']
=== MUM-R2 ===
['GigabitEthernet0/0', '10.99.0.2', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/1', '10.12.0.2', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/2', '10.60.0.1', 'YES', 'manual', 'administratively', 'down', 'down']
['GigabitEthernet0/3', 'unassigned', 'YES', 'unset', 'administratively', 'down', 'down']
['Loopback0', '2.2.2.2', 'YES', 'manual', 'up', 'up']
['Loopback1', '22.22.22.22', 'YES', 'manual', 'up', 'up']</pre>
<p>The rows for the administratively down interfaces have <b>seven</b> words, not six, because <code>administratively down</code> is two words. The next chapter explains why that matters.</p>
<h3>Useful companions</h3>
<table class="cmp"><tr><th>Method</th><th>What it does</th><th>Example result</th></tr><tr><td><code>s.strip()</code></td><td>removes spaces and new-lines at both ends</td><td><code>"  up "</code> becomes <code>"up"</code></td></tr><tr><td><code>s.lower()</code></td><td>lowercase</td><td><code>"UP"</code> becomes <code>"up"</code></td></tr><tr><td><code>s.startswith("Gig")</code></td><td>True if the text starts with that</td><td>for choosing rows</td></tr><tr><td><code>"up" in s</code></td><td>True if the text is inside</td><td>a quick filter</td></tr><tr><td><code>s.replace("a", "b")</code></td><td>replaces text</td><td>clean-up</td></tr><tr><td><code>", ".join(list)</code></td><td>glues a list into text</td><td>for reports</td></tr></table>
<pre class="code">line = "  GigabitEthernet0/1  "
print(repr(line.strip()))
print(line.strip().startswith("Gig"))
print("Loopback" in "Loopback0 1.1.1.1")
print(", ".join(["R1", "R2", "R3"]))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">'GigabitEthernet0/1'
True
True
R1, R2, R3</pre>
<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>[1:]</code> and treating the heading line as an interface, which gives wrong rows or an index error. (2) Using <code>split(" ")</code> with one space: it creates empty items when there are many spaces. Use <code>split()</code> with no argument. (3) Using a fixed index such as <code>parts[4]</code> for the status. (4) Calling <code>split</code> on an empty line: <code>"".split()</code> gives an empty list, and <code>parts[0]</code> then raises <code>IndexError</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>"a  b".split()</code> gives <code>['a', 'b']</code> but <code>"a  b".split(" ")</code> gives <code>['a', '', 'b']</code>. Negative index <code>-1</code> is the last item. <code>splitlines()</code> returns a list.</p></div>
<div class="scn"><h4>The empty line that crashed the report</h4><p>A script looped over every line of a command output and read <code>parts[0]</code>. It ran fine on lab devices, then crashed in production with IndexError. A trailing blank line in the output produced an empty list, and index 0 of an empty list does not exist. Adding <code>if not parts: continue</code> (skip blank lines) fixed it.</p>
<p><b>Lesson:</b> real output contains blank lines; always guard against empty rows.</p></div>
<div class="iv"><p class="q">"How do you split a multi-line command output into fields in Python?"</p><p>I call <code>splitlines()</code> to get the lines, skip the header with a slice such as <code>[1:]</code>, and call <code>split()</code> with no argument on each line to get the words. I use negative indexes for fields near the end and I skip empty lines. For anything less regular than a simple table I switch to regular expressions.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>splitlines()</code> makes a list of lines; <code>[1:]</code> skips the heading.</li>
<li><code>split()</code> with no argument cuts at any run of spaces into words.</li>
<li><code>parts[0]</code> is the first word, <code>parts[-1]</code> the last; counting starts at 0.</li>
<li>Combine with <code>for</code> and <code>if</code> to filter rows, for example last word equal to <code>up</code>.</li>
<li>Guard against blank lines and always use <code>split()</code> without an argument.</li>
</ul></div>
`,hi:`
<p>Parsing ke sabse simple tools string methods hain jo aap shayad pehle se jaante ho. Yeh chapter unhe lab 1 ke asli <code>show ip interface brief</code> output par use karta hai. Har section mein ek chhota idea.</p>
<h3>Step 1: output ek string hai</h3>
<p>Script ko jab command ka output milta hai, woh ek string hoti hai jisme <code>\\n</code> (new-line) characters hote hain. Practice aasaan banane ke liye hum router MUM-R1 ke output ki ek copy variable mein rakhte hain. Triple quotes <code>"""</code> string ko kai lines mein failne dete hain.</p>
<h3>Step 2: splitlines text ko lines mein kaatta hai</h3>
<p><code>text.splitlines()</code> ek <b>list</b> deta hai jisme har line ek item hai, new-line characters ke bina.</p>
<pre class="code">output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up"""

lines = output.splitlines()
print(len(lines))
print(lines[0])
print(lines[1])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">6
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up</pre>
<p>Chhe lines: ek heading aur paanch interfaces. <code>lines[0]</code> heading hai, kyunki ginti 0 se shuru hoti hai. Hume heading data mein nahi chahiye, isliye use slice se <b>skip</b> karte hain: <code>lines[1:]</code> ka matlab "item 1 se end tak".</p>
<h3>Step 3: split line ko shabdon mein kaatta hai</h3>
<p>Bina argument ke <code>line.split()</code> kisi bhi spaces ke samooh par kaatta hai aur shabdon ki list deta hai. Spaces, chahe kitne bhi ho, gayab ho jaate hain. Yahi jaadu hai: bahut spaces se line up columns saaf list items ban jaate hain.</p>
<pre class="code">line = "GigabitEthernet0/1     10.12.0.1       YES manual up                    up"
parts = line.split()
print(parts)
print(len(parts))
print(parts[0])
print(parts[1])
print(parts[-1])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">['GigabitEthernet0/1', '10.12.0.1', 'YES', 'manual', 'up', 'up']
6
GigabitEthernet0/1
10.12.0.1
up</pre>
<p>Line chhe shabd ban gayi. Har ek ko uski position se pahunch sakte hain: <code>parts[0]</code> interface ka naam, <code>parts[1]</code> IP address, aur <code>parts[-1]</code> <b>aakhri</b> shabd, protocol. Negative index end se ginta hai, isliye <code>-1</code> aakhri item aur <code>-2</code> uske pehle wala. Aakhri shabd kaam ka hai kyunki beech mein columns jud jaayein tab bhi woh end mein rehta hai.</p>
<p>[[flow String se fields tak | output/ek lambi string | splitlines()/lines ki list | split()/shabdon ki list | parts[0], parts[-1]/fields chuno]]</p>
<h3>Step 4: loop aur decide</h3>
<p>Jo loop aur <code>if</code> aap jaante ho unke saath jodo. Yeh lab 1 ka exact TODO hai: interface ka naam tabhi print karo jab aakhri shabd <code>up</code> ho.</p>
<pre class="code">output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up"""

for line in output.splitlines()[1:]:
    parts = line.split()
    if parts[-1] == "up":
        print(parts[0])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">GigabitEthernet0/0
GigabitEthernet0/1
Loopback0</pre>
<p>Teen interfaces up/up hain. <code>GigabitEthernet0/2</code> down/down hai aur <code>GigabitEthernet0/3</code> administratively down, isliye dono print nahi hote.</p>
<h3>TODO solve karne se pehle lab script kya print karti hai</h3>
<p>Lab mein <code>up.py</code> dono routers par login karke har row ko shabdon ki list ke roop mein print karti hai, TODO solve hone se pehle. Yeh lab terminal ka asli output hai. Dhyaan do ki do lists baaki se lambi hain.</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = {"MUM-R1": "10.99.0.1", "MUM-R2": "10.99.0.2"}

for name, ip in ROUTERS.items():
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    output = conn.send_command("show ip interface brief")
    conn.disconnect()
    print(f"=== {name} ===")
    for line in output.splitlines()[1:]:
        parts = line.split()
        print(parts)</pre><p><i>Lab terminal mein chalaya (lab routers use hote hain). Output simulator se liya gaya.</i></p><pre class="out">=== MUM-R1 ===
['GigabitEthernet0/0', '10.99.0.1', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/1', '10.12.0.1', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/2', '10.50.0.1', 'YES', 'manual', 'down', 'down']
['GigabitEthernet0/3', 'unassigned', 'YES', 'unset', 'administratively', 'down', 'down']
['Loopback0', '1.1.1.1', 'YES', 'manual', 'up', 'up']
=== MUM-R2 ===
['GigabitEthernet0/0', '10.99.0.2', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/1', '10.12.0.2', 'YES', 'manual', 'up', 'up']
['GigabitEthernet0/2', '10.60.0.1', 'YES', 'manual', 'administratively', 'down', 'down']
['GigabitEthernet0/3', 'unassigned', 'YES', 'unset', 'administratively', 'down', 'down']
['Loopback0', '2.2.2.2', 'YES', 'manual', 'up', 'up']
['Loopback1', '22.22.22.22', 'YES', 'manual', 'up', 'up']</pre>
<p>Administratively down interfaces ki rows mein <b>saat</b> shabd hain, chhe nahi, kyunki <code>administratively down</code> do shabd hain. Agla chapter samjhata hai ki yeh kyun matter karta hai.</p>
<h3>Kaam ke saathi</h3>
<table class="cmp"><tr><th>Method</th><th>Kya karta hai</th><th>Example result</th></tr><tr><td><code>s.strip()</code></td><td>dono taraf ke spaces aur new-lines hatata hai</td><td><code>"  up "</code> se <code>"up"</code></td></tr><tr><td><code>s.lower()</code></td><td>lowercase</td><td><code>"UP"</code> se <code>"up"</code></td></tr><tr><td><code>s.startswith("Gig")</code></td><td>us se shuru ho to True</td><td>rows chunne ke liye</td></tr><tr><td><code>"up" in s</code></td><td>text andar ho to True</td><td>jaldi filter</td></tr><tr><td><code>s.replace("a", "b")</code></td><td>text badalta hai</td><td>saaf-safai</td></tr><tr><td><code>", ".join(list)</code></td><td>list ko text mein jodta hai</td><td>reports ke liye</td></tr></table>
<pre class="code">line = "  GigabitEthernet0/1  "
print(repr(line.strip()))
print(line.strip().startswith("Gig"))
print("Loopback" in "Loopback0 1.1.1.1")
print(", ".join(["R1", "R2", "R3"]))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">'GigabitEthernet0/1'
True
True
R1, R2, R3</pre>
<div class="warn"><p><b>Common mistakes.</b> (1) <code>[1:]</code> bhoolna aur heading line ko interface maan lena, jisse galat rows ya index error aata hai. (2) Ek space wala <code>split(" ")</code> use karna: bahut spaces hon to khaali items banata hai. Bina argument wala <code>split()</code> use karo. (3) Status ke liye <code>parts[4]</code> jaisa fixed index use karna. (4) Khaali line par <code>split</code> chalana: <code>"".split()</code> khaali list deta hai, aur tab <code>parts[0]</code> <code>IndexError</code> deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>"a  b".split()</code> <code>['a', 'b']</code> deta hai lekin <code>"a  b".split(" ")</code> <code>['a', '', 'b']</code>. Negative index <code>-1</code> aakhri item hai. <code>splitlines()</code> list return karta hai.</p></div>
<div class="scn"><h4>Khaali line jisne report tod di</h4><p>Ek script command output ki har line par loop chalakar <code>parts[0]</code> padhti thi. Lab devices par theek chali, phir production mein IndexError se crash hui. Output ki aakhri khaali line ne khaali list banayi, aur khaali list ka index 0 exist nahi karta. <code>if not parts: continue</code> (khaali lines skip) jodne se fix hua.</p>
<p><b>Lesson:</b> asli output mein khaali lines hoti hain; hamesha khaali rows se bacho.</p></div>
<div class="iv"><p class="q">"Multi-line command output ko Python mein fields mein kaise todte ho?"</p><p>Main <code>splitlines()</code> se lines leta hoon, <code>[1:]</code> jaise slice se header skip karta hoon, aur har line par bina argument ke <code>split()</code> chalakar shabd leta hoon. End ke paas ke fields ke liye negative indexes use karta hoon aur khaali lines skip karta hoon. Simple table se kam regular cheez ke liye regular expressions par jaata hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>splitlines()</code> lines ki list banata hai; <code>[1:]</code> heading skip karta hai.</li>
<li>Bina argument ka <code>split()</code> kisi bhi spaces par kaatkar shabd deta hai.</li>
<li><code>parts[0]</code> pehla shabd, <code>parts[-1]</code> aakhri; ginti 0 se shuru.</li>
<li><code>for</code> aur <code>if</code> ke saath rows filter karo, jaise aakhri shabd <code>up</code> ke barabar.</li>
<li>Khaali lines se bacho aur hamesha bina argument ka <code>split()</code> use karo.</li>
</ul></div>
`}};export{e as default};