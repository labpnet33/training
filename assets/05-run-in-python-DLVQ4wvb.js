var e={id:`run-in-python`,h:{en:`Running a template from Python: rows, dictionaries and reusable code`,hi:`Python se template chalana: rows, dictionaries aur reusable code`},body:{en:`
<p><b>The idea of this chapter:</b> a template does nothing on its own. Python has to load it, feed it text and collect the rows. You will read the two scripts that Lab 1 gives you, write your own <code>notup.py</code>, and turn the pattern into a function you can reuse in every later module.</p>

<h3>Analogy: the scanner operator</h3>
<p>The scanner needs an operator with three jobs: put the layout card in (load the template), put the stack of forms in (give the text), and take the results out (read the rows). Python is the operator. The three jobs are three lines of code.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Three steps: collect text from the router, parse with a template, use the rows">
<rect x="10" y="25" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">1 Collect</text><text x="105" y="72" text-anchor="middle" class="svg-muted" font-size="11">collect.py -&gt; r1_ipbrief.txt</text>
<rect x="225" y="25" width="190" height="70" rx="10" fill="#fde68a"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Parse</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="11">TextFSM + ipbrief.textfsm</text>
<rect x="440" y="25" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">3 Use</text><text x="535" y="72" text-anchor="middle" class="svg-muted" font-size="11">filter, table, JSON, database</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="2"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Collect, parse, use. TextFSM owns only the middle step.</p></div>

<h3>Step 1: collect the text</h3>
<p>The lab file <code>collect.py</code> logs in to R1 and saves the output of one command into a file. Parsing a saved file is easier to test than parsing a live session.</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
raw = conn.send_command("show ip interface brief")
conn.disconnect()

with open("r1_ipbrief.txt", "w") as f:
    f.write(raw)
print("saved", len(raw.splitlines()), "lines")</pre>
<ul>
<li><code>ConnectHandler(...)</code> opens an SSH session. <code>nk_ios</code> is the lab's device type for a Cisco IOS router.</li>
<li><code>send_command</code> runs one show command and returns its output as one string.</li>
<li>The password is written in the file only because this is a lab. Real tools read it from the environment (module <code>py-secrets</code>). The full story of SSH is in <code>auto-ssh</code>.</li>
</ul>
<pre class="out">AUTO01$ python3 collect.py
saved 6 lines</pre>

<h3>Step 2: parse with parse_one.py</h3>
<pre class="code">import sys
import textfsm

with open(sys.argv[1]) as t:
    fsm = textfsm.TextFSM(t)
with open(sys.argv[2]) as r:
    rows = fsm.ParseText(r.read())
print(fsm.header)
for row in rows:
    print(row)</pre>
<ul>
<li><code>sys.argv[1]</code> and <code>sys.argv[2]</code> are the template file and the text file you type after the script name.</li>
<li><code>textfsm.TextFSM(t)</code> reads and checks the template. A broken template fails <b>here</b>, with <code>TextFSMTemplateError</code>.</li>
<li><code>fsm.ParseText(text)</code> runs the engine over a string and returns the rows.</li>
<li><code>fsm.header</code> is the list of Value names, one per column.</li>
</ul>
<p>You already saw its output in chapter 2: a header list, then one list per row. A row is a <b>list</b> in the same order as the header, so <code>row[2]</code> is the status. Positions are fragile; names are clearer.</p>

<h3>Step 3: dictionaries and a real answer</h3>
<p><code>ParseTextToDicts</code> returns every row as a dictionary whose keys are the header names. Your script <code>notup.py</code> answers the ticket "which interfaces are not up".</p>
<pre class="code">import textfsm

with open("ipbrief.textfsm") as t:
    fsm = textfsm.TextFSM(t)
with open("r1_ipbrief.txt") as r:
    rows = fsm.ParseTextToDicts(r.read())
notup = [r["INTF"] for r in rows if r["STATUS"] != "up"]
print(len(notup), "interfaces not up:", notup)</pre>
<pre class="out">AUTO01$ python3 notup.py
<span class="hl">3 interfaces not up: ['GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3']</span></pre>
<p>The list comprehension keeps the interface name of every row whose status is not exactly <code>up</code>. The keys are in capitals because the template named them that way. If you mistype a key you get a <code>KeyError</code>, which tells you at once.</p>

<h3>A reusable function</h3>
<p>Every later module will parse files, so put the three jobs in one function in a file <code>parsers.py</code>:</p>
<pre class="code">import textfsm


def parse_file(template_path, text_path):
    with open(template_path) as t:
        fsm = textfsm.TextFSM(t)
    with open(text_path) as r:
        return fsm.ParseTextToDicts(r.read())</pre>
<p>Now a report script is only a few lines, and <code>json.dumps</code> turns the rows into JSON, the format from <code>auto-formats</code>:</p>
<pre class="code">import json
from parsers import parse_file

rows = parse_file("ipbrief.textfsm", "r1_ipbrief.txt")
print(type(rows).__name__, len(rows))
print(json.dumps(rows[:2], indent=2))</pre>
<pre class="out">AUTO01$ python3 report.py
list 5
[
  {
    "INTF": "GigabitEthernet0/0",
    "IP": "10.99.0.1",
    "STATUS": "up",
    "PROTO": "up"
  },
  {
    "INTF": "GigabitEthernet0/1",
    "IP": "unassigned",
    "STATUS": "administratively down",
    "PROTO": "down"
  }
]</pre>
<p>For a quick table in a ticket, <code>tabulate</code> accepts the list of lists and the header together:</p>
<pre class="code">from tabulate import tabulate
print(tabulate(rows, headers=fsm.header))</pre>
<pre class="out">AUTO01$ python3 table.py
INTF                IP          STATUS                 PROTO
------------------  ----------  ---------------------  -------
GigabitEthernet0/0  10.99.0.1   up                     up
GigabitEthernet0/1  unassigned  administratively down  down
GigabitEthernet0/2  unassigned  administratively down  down
GigabitEthernet0/3  unassigned  administratively down  down
Loopback0           1.1.1.1     up                     up
</pre>
<p>Here <code>rows</code> came from <code>ParseText</code> in <code>table.py</code>, so each row is a list.</p>

<h3>Re-using one parser object, and failing politely</h3>
<p>If you parse several texts with the same <code>fsm</code> object, call <code>fsm.Reset()</code> before each one, so no state is carried over. The simplest rule: build a new <code>TextFSM</code> for every text, or call <code>Reset()</code>. Also catch template problems, as <code>safe.py</code> does with <code>textfsm.TextFSMTemplateError</code>:</p>
<pre class="out">AUTO01$ python3 safe.py ipbrief.textfsm
template ok, columns: ['INTF', 'IP', 'STATUS', 'PROTO']
AUTO01$ python3 safe.py broken.textfsm; echo "rc=$?"
<span class="hl">bad template: Line 4 : Value B not defined</span>
rc=2
AUTO01$ python3 safe.py nothere.textfsm; echo "rc=$?"
no such template: nothere.textfsm
rc=2</pre>

<div class="eg"><p><b>Worked example.</b> Ticket: "R1 must have no interface in the state administratively down on the uplinks". You collect, call <code>parse_file</code>, and test <code>any(r["STATUS"] == "administratively down" for r in rows)</code>. The work is three lines because the parsing is solved.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Passing a filename instead of an open file to <code>TextFSM</code> (it needs the opened file object). Passing the file object instead of the text to <code>ParseText</code> (it needs a string: use <code>.read()</code>). Using the wrong case for dictionary keys. Parsing a live session without saving the raw text, so a bug cannot be reproduced.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ParseText</code> returns a list of <b>lists</b>; <code>ParseTextToDicts</code> returns a list of <b>dictionaries</b>. The keys and the header are exactly the Value names, not lowercase versions. An empty result is an empty list, not an error.</p></div>

<div class="scn"><h4>The parser nobody could reproduce</h4><p>A nightly job parsed live output and the report was wrong one night. Nobody could repeat it because the raw output was never saved. The team changed the job to save every raw output next to the parsed result. The next wrong report was fixed in ten minutes: the saved text showed a new line type the template had never seen.</p><p><b>Lesson:</b> keep the raw text. It turns an unrepeatable mystery into a test case.</p></div>

<div class="iv"><p class="q">"How do you use a TextFSM template in Python?"</p><p>Open the template, create textfsm.TextFSM with the file object, and call ParseText on the output string. It returns a list of rows in the order of fsm.header. ParseTextToDicts gives dictionaries keyed by the Value names, which I prefer in scripts. I save the raw output so I can re-run the parse.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three steps: collect text, parse with a template, use the rows.</li>
<li><code>textfsm.TextFSM(file)</code> loads a template; <code>ParseText(string)</code> returns lists; <code>ParseTextToDicts</code> returns dictionaries.</li>
<li><code>fsm.header</code> lists the Value names in order.</li>
<li>Wrap the three steps in a function such as <code>parse_file</code> and reuse it.</li>
<li>Catch <code>TextFSMTemplateError</code> for bad templates and keep the raw text.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> template apne aap kuch nahi karta. Python ko use load karna hota hai, text dena hota hai aur rows collect karni hoti hain. Aap Lab 1 ki di hui do scripts padhoge, apni <code>notup.py</code> likhoge, aur is pattern ko aise function mein badloge jo aage har module mein reuse ho.</p>

<h3>Analogy: scanner operator</h3>
<p>Scanner ko ek operator chahiye jiske teen kaam hain: layout card daalna (template load karna), forms ka stack daalna (text dena), aur results nikalna (rows padhna). Python operator hai. Teen kaam code ki teen lines hain.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Teen steps: router se text collect, template se parse, rows use">
<rect x="10" y="25" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">1 Collect</text><text x="105" y="72" text-anchor="middle" class="svg-muted" font-size="11">collect.py -&gt; r1_ipbrief.txt</text>
<rect x="225" y="25" width="190" height="70" rx="10" fill="#fde68a"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Parse</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="11">TextFSM + ipbrief.textfsm</text>
<rect x="440" y="25" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">3 Use</text><text x="535" y="72" text-anchor="middle" class="svg-muted" font-size="11">filter, table, JSON, database</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="2"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Collect, parse, use. TextFSM sirf beech ka step sambhalta hai.</p></div>

<h3>Step 1: text collect karo</h3>
<p>Lab file <code>collect.py</code> R1 mein login karti hai aur ek command ka output file mein save karti hai. Saved file parse karna live session parse karne se zyada aasaan test hota hai.</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
raw = conn.send_command("show ip interface brief")
conn.disconnect()

with open("r1_ipbrief.txt", "w") as f:
    f.write(raw)
print("saved", len(raw.splitlines()), "lines")</pre>
<ul>
<li><code>ConnectHandler(...)</code> SSH session kholta hai. <code>nk_ios</code> lab ka Cisco IOS router ke liye device type hai.</li>
<li><code>send_command</code> ek show command chalata hai aur output ek string ki tarah lautata hai.</li>
<li>Password file mein sirf isliye likha hai kyunki yeh lab hai. Asli tools use environment se padhte hain (module <code>py-secrets</code>). SSH ki poori kahani <code>auto-ssh</code> mein hai.</li>
</ul>
<pre class="out">AUTO01$ python3 collect.py
saved 6 lines</pre>

<h3>Step 2: parse_one.py se parse karo</h3>
<pre class="code">import sys
import textfsm

with open(sys.argv[1]) as t:
    fsm = textfsm.TextFSM(t)
with open(sys.argv[2]) as r:
    rows = fsm.ParseText(r.read())
print(fsm.header)
for row in rows:
    print(row)</pre>
<ul>
<li><code>sys.argv[1]</code> aur <code>sys.argv[2]</code> woh template file aur text file hain jo aap script ke naam ke baad type karte ho.</li>
<li><code>textfsm.TextFSM(t)</code> template padhta aur check karta hai. Toota hua template <b>yahin</b> fail hota hai, <code>TextFSMTemplateError</code> ke saath.</li>
<li><code>fsm.ParseText(text)</code> engine ko string par chalata hai aur rows lautata hai.</li>
<li><code>fsm.header</code> Value names ki list hai, har column ke liye ek.</li>
</ul>
<p>Iska output aap chapter 2 mein dekh chuke ho: ek header list, phir har row ki ek list. Row header ke order mein ek <b>list</b> hai, isliye <code>row[2]</code> status hai. Positions nazuk hoti hain; naam zyada saaf hote hain.</p>

<h3>Step 3: dictionaries aur asli jawab</h3>
<p><code>ParseTextToDicts</code> har row ko dictionary banata hai jiski keys header ke naam hain. Aapki script <code>notup.py</code> ticket "kaunse interfaces up nahi hain" ka jawab deti hai.</p>
<pre class="code">import textfsm

with open("ipbrief.textfsm") as t:
    fsm = textfsm.TextFSM(t)
with open("r1_ipbrief.txt") as r:
    rows = fsm.ParseTextToDicts(r.read())
notup = [r["INTF"] for r in rows if r["STATUS"] != "up"]
print(len(notup), "interfaces not up:", notup)</pre>
<pre class="out">AUTO01$ python3 notup.py
<span class="hl">3 interfaces not up: ['GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3']</span></pre>
<p>List comprehension har us row ka interface naam rakhti hai jiska status bilkul <code>up</code> nahi hai. Keys capitals mein hain kyunki template ne unhe wahi naam diya. Key galat type karoge to <code>KeyError</code> aata hai, jo turant bata deta hai.</p>

<h3>Reusable function</h3>
<p>Aage har module files parse karega, isliye teeno kaam ek function mein <code>parsers.py</code> file mein rakho:</p>
<pre class="code">import textfsm


def parse_file(template_path, text_path):
    with open(template_path) as t:
        fsm = textfsm.TextFSM(t)
    with open(text_path) as r:
        return fsm.ParseTextToDicts(r.read())</pre>
<p>Ab report script sirf kuch lines ki hai, aur <code>json.dumps</code> rows ko JSON bana deta hai, jo format <code>auto-formats</code> se aata hai:</p>
<pre class="code">import json
from parsers import parse_file

rows = parse_file("ipbrief.textfsm", "r1_ipbrief.txt")
print(type(rows).__name__, len(rows))
print(json.dumps(rows[:2], indent=2))</pre>
<pre class="out">AUTO01$ python3 report.py
list 5
[
  {
    "INTF": "GigabitEthernet0/0",
    "IP": "10.99.0.1",
    "STATUS": "up",
    "PROTO": "up"
  },
  {
    "INTF": "GigabitEthernet0/1",
    "IP": "unassigned",
    "STATUS": "administratively down",
    "PROTO": "down"
  }
]</pre>
<p>Ticket ke liye jaldi table chahiye to <code>tabulate</code> lists ki list aur header ek saath leta hai:</p>
<pre class="code">from tabulate import tabulate
print(tabulate(rows, headers=fsm.header))</pre>
<pre class="out">AUTO01$ python3 table.py
INTF                IP          STATUS                 PROTO
------------------  ----------  ---------------------  -------
GigabitEthernet0/0  10.99.0.1   up                     up
GigabitEthernet0/1  unassigned  administratively down  down
GigabitEthernet0/2  unassigned  administratively down  down
GigabitEthernet0/3  unassigned  administratively down  down
Loopback0           1.1.1.1     up                     up
</pre>
<p>Yahan <code>rows</code> <code>table.py</code> mein <code>ParseText</code> se aayi, isliye har row ek list hai.</p>

<h3>Ek parser object reuse karna, aur tameez se fail hona</h3>
<p>Agar aap ek hi <code>fsm</code> object se kai texts parse karte ho, to har ek se pehle <code>fsm.Reset()</code> call karo, taaki koi state aage na jaye. Sabse aasaan niyam: har text ke liye naya <code>TextFSM</code> banao, ya <code>Reset()</code> call karo. Template ki problems bhi pakdo, jaise <code>safe.py</code> <code>textfsm.TextFSMTemplateError</code> se karti hai:</p>
<pre class="out">AUTO01$ python3 safe.py ipbrief.textfsm
template ok, columns: ['INTF', 'IP', 'STATUS', 'PROTO']
AUTO01$ python3 safe.py broken.textfsm; echo "rc=$?"
<span class="hl">bad template: Line 4 : Value B not defined</span>
rc=2
AUTO01$ python3 safe.py nothere.textfsm; echo "rc=$?"
no such template: nothere.textfsm
rc=2</pre>

<div class="eg"><p><b>Worked example.</b> Ticket: "R1 ke uplinks par koi interface administratively down state mein nahi hona chahiye". Aap collect karte ho, <code>parse_file</code> call karte ho, aur <code>any(r["STATUS"] == "administratively down" for r in rows)</code> test karte ho. Kaam teen lines ka hai kyunki parsing solve ho chuki hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>TextFSM</code> ko open file ki jagah filename dena (use khuli hui file object chahiye). <code>ParseText</code> ko text ki jagah file object dena (use string chahiye: <code>.read()</code> use karo). Dictionary keys ka case galat likhna. Live session parse karna bina raw text save kiye, isliye bug reproduce nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ParseText</code> <b>lists</b> ki list deta hai; <code>ParseTextToDicts</code> <b>dictionaries</b> ki list deta hai. Keys aur header bilkul Value names hain, lowercase versions nahi. Khaali result khaali list hai, error nahi.</p></div>

<div class="scn"><h4>Parser jo koi reproduce nahi kar saka</h4><p>Ek raat ki job live output parse karti thi aur ek raat report galat aayi. Koi use dohra nahi saka kyunki raw output kabhi save nahi hua tha. Team ne job badli ki har raw output parsed result ke saath save ho. Agli galat report das minute mein theek hui: saved text mein ek nayi line type thi jo template ne pehle kabhi nahi dekhi.</p><p><b>Lesson:</b> raw text rakho. Woh anreproducible mystery ko test case bana deta hai.</p></div>

<div class="iv"><p class="q">"Python mein TextFSM template kaise use karte ho?"</p><p>Template kholta hoon, file object ke saath textfsm.TextFSM banata hoon, aur output string par ParseText call karta hoon. Woh fsm.header ke order mein rows ki list deta hai. ParseTextToDicts Value names ki keys wali dictionaries deta hai, jo main scripts mein pasand karta hoon. Raw output save karta hoon taaki parse dobara chala sakoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen steps: text collect karo, template se parse karo, rows use karo.</li>
<li><code>textfsm.TextFSM(file)</code> template load karta hai; <code>ParseText(string)</code> lists deta hai; <code>ParseTextToDicts</code> dictionaries.</li>
<li><code>fsm.header</code> Value names ko order mein deta hai.</li>
<li>Teeno steps ko <code>parse_file</code> jaise function mein lapeto aur reuse karo.</li>
<li>Bad templates ke liye <code>TextFSMTemplateError</code> pakdo aur raw text rakho.</li>
</ul></div>
`}};export{e as default};