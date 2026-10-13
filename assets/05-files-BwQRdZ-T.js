var e={id:`files`,h:{en:`Files: save results and read data with "with open"`,hi:`Files: "with open" se results save karo aur data padho`},body:{en:`
<p>A script forgets everything when it ends. If you want to keep a backup, produce a report for your manager, or read a list of routers that somebody else prepared, you need <b>files</b>. This chapter shows the three things you do with a file: write, append and read.</p>
<h3>Why files matter in automation</h3>
<p>Think of the script as a worker with no memory. A file is the notebook the worker writes in. In lab 1 the script writes <code>branch.cfg</code>, and a second script, <code>push.py</code>, reads that same file and sends it to router R1. The two scripts never talk to each other directly; the file is the hand-over point. This idea, keeping <b>data in files and logic in code</b>, appears again in the YAML and JSON modules.</p>
<h3>Writing a file</h3>
<p><code>open(name, mode)</code> opens a file. The mode <code>"w"</code> means write. The safe way to open a file is <code>with open(...) as f:</code> followed by an indented block.</p>
<pre class="code">cfg = [
    "interface GigabitEthernet0/1",
    " description LAN-USERS",
    " ip address 10.10.1.1 255.255.255.0",
    " no shutdown",
]

with open("branch.cfg", "w") as f:
    f.write("\\n".join(cfg) + "\\n")

print("Saved", len(cfg), "lines")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Saved 4 lines</pre>
<p>What happened, in plain words: <code>open("branch.cfg", "w")</code> created a file called <code>branch.cfg</code> in the current folder (or <b>emptied it</b> if it already existed). <code>as f</code> gives the open file the short name <code>f</code>. <code>f.write(text)</code> puts text into it. When the indented block ends, <code>with</code> <b>closes the file for you</b>, even if an error happened inside. Always use <code>with</code>; forgetting to close a file can lose data.</p>
<p>Notice <code>+ "\\n"</code>. The two characters backslash and n mean "new line". <code>f.write()</code> does <b>not</b> add a new line by itself, so you add it. Without it, all lines would stick together into one long line.</p>
<h3>Reading a file back</h3>
<p>Without a mode, <code>open</code> reads. <code>f.read()</code> returns the whole file as one string. <code>.splitlines()</code> cuts that string into a list with one item per line, with the new-line characters already removed.</p>
<pre class="code">with open("branch.cfg", "w") as f:
    f.write("interface GigabitEthernet0/1\\n description LAN-USERS\\n no shutdown\\n")

with open("branch.cfg") as f:
    lines = f.read().splitlines()

print(lines)
print("Read", len(lines), "lines")
for line in lines:
    print("-&gt;", line)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">['interface GigabitEthernet0/1', ' description LAN-USERS', ' no shutdown']
Read 3 lines
-&gt; interface GigabitEthernet0/1
-&gt;  description LAN-USERS
-&gt;  no shutdown</pre>
<p>You can also loop over the file directly, one line at a time. Each line still ends with a new-line character, so <code>strip()</code> removes it:</p>
<pre class="code">with open("routers.txt", "w") as f:
    f.write("10.99.0.1\\n10.99.0.2\\n10.99.0.3\\n")

with open("routers.txt") as f:
    for line in f:
        print("router:", line.strip())</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">router: 10.99.0.1
router: 10.99.0.2
router: 10.99.0.3</pre>
<h3>Modes at a glance</h3>
<table class="cmp"><tr><th>Mode</th><th>Meaning</th><th>Existing content</th></tr><tr><td><code>"r"</code> (default)</td><td>read</td><td>untouched; error if the file does not exist</td></tr><tr><td><code>"w"</code></td><td>write</td><td><b>erased first</b></td></tr><tr><td><code>"a"</code></td><td>append</td><td>kept; new text goes at the end</td></tr></table>
<h3>Appending: a growing log</h3>
<p>Use <code>"a"</code> when you want to add to the end without deleting what is already there, such as an audit log that grows with every run.</p>
<pre class="code">for router in ["R1", "R2"]:
    with open("audit.log", "a") as f:
        f.write(router + " checked\\n")

with open("audit.log") as f:
    print(f.read())</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">R1 checked
R2 checked</pre>
<h3>Reading a file that does not exist</h3>
<pre class="code">with open("missing.txt") as f:
    data = f.read()</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "nofile.py", line 1, in &lt;module&gt;
    with open("missing.txt") as f:
FileNotFoundError: [Errno 2] No such file or directory: 'missing.txt'</pre>
<p><code>FileNotFoundError</code> means the name or the folder is wrong. In the lab terminal, <code>ls</code> shows the files in the current folder and <code>cat file</code> prints one. Check the spelling and the folder first.</p>
<h3>Sending the file to a router</h3>
<p>In lab 1, <code>push.py</code> reads <code>branch.cfg</code> and sends the lines to R1 over SSH. This code uses the lab library <code>nkmiko</code> (a lab version of the well-known Netmiko library), so the lab terminal runs it against R1 but a plain Python install would not.</p>
<p><i>Reference code (not run in the simulator).</i></p><pre class="code">from nkmiko import ConnectHandler

with open("branch.cfg") as f:
    lines = f.read().splitlines()
print("Read", len(lines), "lines from branch.cfg")

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
conn.send_config_set(lines)
conn.save_config()
conn.disconnect()
print("Done - R1 configured")</pre>
<p>This is what the lab terminal printed for it, and what you should see too after <code>python3 push.py</code>:</p>
<pre class="out">Read <span class="hl">12</span> lines from branch.cfg
Done - R1 configured</pre>
<p>Twelve lines is three interfaces times four lines. If the number is not 12, your <code>branch.cfg</code> is wrong; fix the script that writes it, not push.py.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Opening with <code>"w"</code> when you meant <code>"a"</code>, which erases the old log. (2) Forgetting <code>"\\n"</code>, so every line is glued together. (3) Not using <code>with</code>. (4) Reading a file in the wrong folder and getting FileNotFoundError.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>"w"</code> truncates an existing file; <code>"a"</code> appends. <code>read()</code> gives one string; <code>readlines()</code> and <code>splitlines()</code> give lists. <code>f.write()</code> needs a string, not a list.</p></div>
<div class="scn"><h4>The log that kept disappearing</h4><p>A team wrote an audit script that saved the daily results with <code>open("audit.log", "w")</code>. Every morning the manager complained that only the last router was in the log. The cause was mode <code>"w"</code>: each run erased the file and wrote it fresh. Changing one letter to <code>"a"</code> kept the history.</p>
<p><b>Lesson:</b> know your mode before you run a script on a file that matters.</p></div>
<div class="iv"><p class="q">"How do you read a text file safely in Python?"</p><p>Use <code>with open("file") as f:</code> so the file closes automatically, then <code>f.read().splitlines()</code> for a list of lines or loop over <code>f</code>. Mention that mode <code>"w"</code> erases the file and <code>"a"</code> appends, and that a missing file raises <code>FileNotFoundError</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>with open(name, mode) as f:</code> opens a file and closes it automatically.</li>
<li><code>"w"</code> erases and writes, <code>"a"</code> appends, no mode (or <code>"r"</code>) reads.</li>
<li><code>f.write()</code> adds no new line; add <code>"\\n"</code> yourself.</li>
<li><code>f.read().splitlines()</code> turns a file into a list of lines.</li>
<li>A missing file raises <code>FileNotFoundError</code>.</li>
</ul></div>
`,hi:`
<p>Script khatam hote hi sab bhool jaata hai. Agar aapko backup rakhna hai, manager ke liye report banani hai, ya kisi aur ki banayi routers ki list padhni hai, to <b>files</b> chahiye. Yeh chapter file ke saath teen kaam dikhata hai: write, append aur read.</p>
<h3>Automation mein files kyun zaroori hain</h3>
<p>Script ko aise worker ki tarah socho jise yaad nahi rehta. File woh notebook hai jisme worker likhta hai. Lab 1 mein script <code>branch.cfg</code> likhti hai, aur doosri script <code>push.py</code> wahi file padhkar R1 ko bhejti hai. Dono scripts seedhe baat nahi karti; file hand-over point hai. <b>Data files mein aur logic code mein</b> rakhne ka yeh idea YAML aur JSON modules mein phir aata hai.</p>
<h3>File likhna</h3>
<p><code>open(name, mode)</code> file kholta hai. Mode <code>"w"</code> ka matlab write. File kholne ka safe tareeka <code>with open(...) as f:</code> aur uske baad indented block hai.</p>
<pre class="code">cfg = [
    "interface GigabitEthernet0/1",
    " description LAN-USERS",
    " ip address 10.10.1.1 255.255.255.0",
    " no shutdown",
]

with open("branch.cfg", "w") as f:
    f.write("\\n".join(cfg) + "\\n")

print("Saved", len(cfg), "lines")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Saved 4 lines</pre>
<p>Seedhe shabdon mein kya hua: <code>open("branch.cfg", "w")</code> ne current folder mein <code>branch.cfg</code> naam ki file banayi (ya agar pehle se thi to use <b>khaali kar diya</b>). <code>as f</code> khuli file ko chhota naam <code>f</code> deta hai. <code>f.write(text)</code> usme text daalta hai. Indented block khatam hote hi <code>with</code> <b>file ko khud band kar deta hai</b>, andar error aaye tab bhi. Hamesha <code>with</code> use karo; file band karna bhoolne se data kho sakta hai.</p>
<p><code>+ "\\n"</code> dekho. Backslash aur n ka matlab "nayi line". <code>f.write()</code> khud nayi line <b>nahi</b> jodta, isliye aap jodte ho. Uske bina saari lines chipak kar ek lambi line ban jaati.</p>
<h3>File wapas padhna</h3>
<p>Mode ke bina <code>open</code> padhta hai. <code>f.read()</code> poori file ek string mein deta hai. <code>.splitlines()</code> us string ko list mein kaat deta hai, har line ek item, aur new-line characters pehle se hat chuke hote hain.</p>
<pre class="code">with open("branch.cfg", "w") as f:
    f.write("interface GigabitEthernet0/1\\n description LAN-USERS\\n no shutdown\\n")

with open("branch.cfg") as f:
    lines = f.read().splitlines()

print(lines)
print("Read", len(lines), "lines")
for line in lines:
    print("-&gt;", line)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">['interface GigabitEthernet0/1', ' description LAN-USERS', ' no shutdown']
Read 3 lines
-&gt; interface GigabitEthernet0/1
-&gt;  description LAN-USERS
-&gt;  no shutdown</pre>
<p>File par seedha loop bhi chala sakte ho, ek ek line. Har line ke end mein abhi bhi new-line character hota hai, isliye <code>strip()</code> use hatata hai:</p>
<pre class="code">with open("routers.txt", "w") as f:
    f.write("10.99.0.1\\n10.99.0.2\\n10.99.0.3\\n")

with open("routers.txt") as f:
    for line in f:
        print("router:", line.strip())</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">router: 10.99.0.1
router: 10.99.0.2
router: 10.99.0.3</pre>
<h3>Modes ek nazar mein</h3>
<table class="cmp"><tr><th>Mode</th><th>Matlab</th><th>Maujooda content</th></tr><tr><td><code>"r"</code> (default)</td><td>read</td><td>chhua nahi jaata; file na ho to error</td></tr><tr><td><code>"w"</code></td><td>write</td><td><b>pehle mita diya jaata hai</b></td></tr><tr><td><code>"a"</code></td><td>append</td><td>rehta hai; naya text end mein jaata hai</td></tr></table>
<h3>Append: badhta hua log</h3>
<p>Jab maujooda content mitaye bina end mein jodna ho, <code>"a"</code> use karo, jaise audit log jo har run ke saath badhta hai.</p>
<pre class="code">for router in ["R1", "R2"]:
    with open("audit.log", "a") as f:
        f.write(router + " checked\\n")

with open("audit.log") as f:
    print(f.read())</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">R1 checked
R2 checked</pre>
<h3>Jo file exist nahi karti use padhna</h3>
<pre class="code">with open("missing.txt") as f:
    data = f.read()</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "nofile.py", line 1, in &lt;module&gt;
    with open("missing.txt") as f:
FileNotFoundError: [Errno 2] No such file or directory: 'missing.txt'</pre>
<p><code>FileNotFoundError</code> ka matlab naam ya folder galat hai. Lab terminal mein <code>ls</code> current folder ki files dikhata hai aur <code>cat file</code> ek file print karta hai. Pehle spelling aur folder check karo.</p>
<h3>File router ko bhejna</h3>
<p>Lab 1 mein <code>push.py</code> <code>branch.cfg</code> padhti hai aur lines SSH se R1 ko bhejti hai. Yeh code lab library <code>nkmiko</code> use karta hai (mashhoor Netmiko library ka lab version), isliye lab terminal ise R1 ke saath chalata hai lekin plain Python install nahi chalayega.</p>
<p><i>Reference code (simulator mein nahi chalta).</i></p><pre class="code">from nkmiko import ConnectHandler

with open("branch.cfg") as f:
    lines = f.read().splitlines()
print("Read", len(lines), "lines from branch.cfg")

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
conn.send_config_set(lines)
conn.save_config()
conn.disconnect()
print("Done - R1 configured")</pre>
<p>Lab terminal ne iske liye yeh print kiya, aur <code>python3 push.py</code> ke baad aapko bhi yahi dikhna chahiye:</p>
<pre class="out">Read <span class="hl">12</span> lines from branch.cfg
Done - R1 configured</pre>
<p>Barah lines matlab teen interfaces ganya chaar lines. Number 12 na ho to aapki <code>branch.cfg</code> galat hai; use likhne wali script fix karo, push.py nahi.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) <code>"a"</code> chahiye tha par <code>"w"</code> se kholna, jo purana log mita deta hai. (2) <code>"\\n"</code> bhoolna, jisse saari lines chipak jaati hain. (3) <code>with</code> use na karna. (4) Galat folder mein file padhna aur FileNotFoundError paana.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>"w"</code> maujooda file ko truncate karta hai; <code>"a"</code> append karta hai. <code>read()</code> ek string deta hai; <code>readlines()</code> aur <code>splitlines()</code> lists dete hain. <code>f.write()</code> ko string chahiye, list nahi.</p></div>
<div class="scn"><h4>Jo log baar baar gayab ho jaata tha</h4><p>Ek team ne audit script likhi jo rozana results <code>open("audit.log", "w")</code> se save karti thi. Har subah manager shikayat karta ki log mein sirf aakhri router hai. Wajah mode <code>"w"</code> thi: har run file mita kar nayi likhti thi. Ek akshar <code>"a"</code> karne se history bachi rahi.</p>
<p><b>Lesson:</b> jis file par kaam ka data ho, script chalane se pehle mode jaan lo.</p></div>
<div class="iv"><p class="q">"Python mein text file safely kaise padhte ho?"</p><p><code>with open("file") as f:</code> use karo taaki file apne aap band ho, phir lines ki list ke liye <code>f.read().splitlines()</code> ya <code>f</code> par loop. Batao ki mode <code>"w"</code> file mita deta hai aur <code>"a"</code> append karta hai, aur missing file <code>FileNotFoundError</code> deti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>with open(name, mode) as f:</code> file kholta hai aur apne aap band karta hai.</li>
<li><code>"w"</code> mita kar likhta hai, <code>"a"</code> append karta hai, mode na ho (ya <code>"r"</code>) to padhta hai.</li>
<li><code>f.write()</code> nayi line nahi jodta; <code>"\\n"</code> khud lagao.</li>
<li><code>f.read().splitlines()</code> file ko lines ki list banata hai.</li>
<li>Missing file <code>FileNotFoundError</code> deti hai.</li>
</ul></div>
`}};export{e as default};