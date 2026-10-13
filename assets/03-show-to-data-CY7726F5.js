var e={id:`show-to-data`,h:{en:`From show output to data: the show() helper`,hi:`Show output se data tak: show() helper`},body:{en:`
<p>A test needs to ask exact questions: "what is the BGP state of neighbour 203.0.113.2?" A router answers in <b>text for humans</b>, with columns, spaces and headings. Asking exact questions of free text is fragile. So the first job of every network test is to turn text into <b>data</b>. This chapter shows how, using the same helper that opens both labs.</p>

<h3>Analogy: a printed timetable versus a database</h3>
<p>A railway timetable on paper is easy for you to read but hard for a program. The same timetable in a database lets a program ask "which train leaves at 6:10?" and get one answer. <code>show</code> output is the paper timetable. A Python <b>dictionary</b> is the database.</p>

<h3>What is a dictionary?</h3>
<p>A dictionary stores pairs of <b>key</b> and <b>value</b>, written with curly braces. You find a value by asking for its key, like looking up a name in a phone book. Dictionaries can hold other dictionaries, which is how a whole show command fits in one variable.</p>
<pre class="code"><span class="c"># Reference code: a tiny dictionary, not run in the simulator</span>
peer = {"state": "Established", "remote_as": 65001, "prefixes_received": 1}
print(peer["state"])             <span class="c"># prints Established</span>
print(peer["prefixes_received"]) <span class="c"># prints 1</span></pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Router text becomes a dictionary">
<rect x="15" y="40" width="150" height="80" rx="10" fill="#e2e8f0"/><text x="90" y="70" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="90" y="92" text-anchor="middle" class="svg-muted" font-size="12">show output (text)</text>
<rect x="245" y="40" width="150" height="80" rx="10" fill="#fde68a"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="14">parse()</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">nkparse</text>
<rect x="475" y="40" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="550" y="70" text-anchor="middle" class="svg-ink" font-size="14">Dictionary</text><text x="550" y="92" text-anchor="middle" class="svg-muted" font-size="12">keys and values</text>
<line x1="165" y1="80" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><line x1="395" y1="80" x2="475" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="152" text-anchor="middle" class="svg-accent" font-size="12">code can now ask: data["neighbors"]["203.0.113.2"]["state"]</text>
</svg><p class="cap">Text in, data out.</p></div>

<h3>The show() helper, line by line</h3>
<p>Both labs start with the same small function. Here it is with every line explained.</p>
<pre class="code"><span class="c"># Reference code: this is the head of snapshot.py and tests.py in the labs</span>
from nkmiko import ConnectHandler   <span class="c"># tool that logs in over SSH</span>
from nkparse import parse           <span class="c"># tool that turns show text into a dictionary</span>

ROUTERS = {"R1": "10.99.0.1", "R2": "10.99.0.2", "R3": "10.99.0.3"}

def show(ip, cmd):
    """Log in, run ONE show command, return it as parsed data."""
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    out = conn.send_command(cmd)
    conn.disconnect()
    return parse(cmd, out)</pre>
<ul>
<li><code>from ... import ...</code> brings a ready-made tool into your script.</li>
<li><code>ROUTERS</code> is a dictionary: router name as key, management address as value.</li>
<li><code>def show(ip, cmd):</code> defines a <b>function</b>, a named block of code you can call again. It takes two inputs: the address and the command.</li>
<li>The text between triple quotes is a <b>docstring</b>, a description for humans.</li>
<li><code>ConnectHandler(...)</code> opens the SSH session. The <b>lab</b> password NK@2026 is written in plain text only because the lab is a classroom. In real life never hard-code a password; read it from an environment variable or a secret store.</li>
<li><code>send_command(cmd)</code> runs the command and returns the text.</li>
<li><code>parse(cmd, out)</code> converts that text. The first input tells the parser which command it was.</li>
<li><code>return</code> hands the dictionary back to whoever called <code>show</code>.</li>
</ul>

<h3>The shapes you need</h3>
<table class="cmp"><tr><th>Command</th><th>How to reach the facts</th></tr>
<tr><td>show ip ospf neighbor</td><td>data["interfaces"][interface]["neighbors"][router-id]["state"]</td></tr>
<tr><td>show ip bgp summary</td><td>data["neighbors"][peer-ip]["state"], also "remote_as" and "prefixes_received"</td></tr>
<tr><td>show ip route</td><td>data["routes"] is a dictionary keyed by prefix such as "10.0.12.0/30"</td></tr>
<tr><td>show ip interface brief</td><td>interface name, then "ip_address", "status", "protocol"</td></tr></table>
<p>Each square-bracket pair opens one more level, like opening a folder inside a folder. If you do not know the shape, run <code>print(data)</code> once and read it.</p>

<div class="eg"><p><b>Worked example.</b> To count FULL OSPF neighbours on a router, loop through <code>data["interfaces"].values()</code>, then through each interface's <code>["neighbors"].items()</code>, and add one whenever the state text starts with "FULL". A state such as FULL/BDR or FULL/DR both count. The lab test does exactly this; you will read it in chapter 6.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Asking for a key that is not there, for example data["routes"]["2.2.2.2/32"] when the parser stored the route as "2.2.2.2". Python stops with a <b>KeyError</b>. Print the dictionary, look at the real keys, then write your code. A KeyError in a test is a bug in the test, not a network fault.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know why parsing matters: screen-scraping raw text with string splits breaks when a vendor changes spacing. Parsers (pyATS Genie, TextFSM, nkparse) give the same keys every time. Structured APIs (RESTCONF, NETCONF) return data directly and need no parsing at all.</p></div>

<div class="scn"><h4>The test that broke on a software upgrade</h4><p>A team checked OSPF by searching the raw text for the word "FULL" at a fixed column. After a software upgrade the header gained an extra column and every test failed in the same minute, although the network was fine. They switched to a parser that returned a dictionary and checked <code>state</code> by key. The next upgrade passed without a code change.</p><p><b>Lesson:</b> test the data, not the layout.</p></div>

<div class="iv"><p class="q">"How do you turn CLI output into something a test can check?"</p><p>Use a parser (pyATS Genie, TextFSM or similar) to convert the show output into a dictionary, then assert on keys such as neighbour state. Better still, use a model-driven API like RESTCONF or NETCONF where the device returns structured data already. Mention that regex on raw text is a last resort because it is fragile.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tests need data; show output is text, so parse it into a dictionary.</li>
<li>A dictionary is key-value pairs; nested keys reach nested facts.</li>
<li>The show() helper logs in, runs one command, parses and returns data.</li>
<li>Never hard-code real passwords; use environment variables or a secret store.</li>
<li>A KeyError means your assumption about the shape was wrong; print the data first.</li>
</ul></div>
`,hi:`
<p>Test ko exact sawaal poochne hote hain: "neighbour 203.0.113.2 ka BGP state kya hai?" Router <b>insaano ke liye text</b> mein jawab deta hai, columns, spaces aur headings ke saath. Free text se exact sawaal poochna nazuk hai. Isliye har network test ka pehla kaam text ko <b>data</b> mein badalna hai. Yeh chapter dikhata hai kaise, usi helper se jo dono labs ke shuru mein hai.</p>

<h3>Analogy: kaagaz ka timetable aur database</h3>
<p>Railway ka kaagaz wala timetable aap padh lete ho par program ke liye mushkil hai. Wahi timetable database mein ho to program poochta hai "6:10 par kaunsi train jaati hai?" aur ek jawab milta hai. <code>show</code> output kaagaz ka timetable hai. Python <b>dictionary</b> database hai.</p>

<h3>Dictionary kya hoti hai?</h3>
<p>Dictionary <b>key</b> aur <b>value</b> ki jodiyan store karti hai, curly braces mein likhi jaati hai. Aap key puchkar value dhoondte ho, jaise phone book mein naam dhoondna. Dictionary ke andar dusri dictionaries bhi ho sakti hain, isi tarah poori show command ek variable mein aa jaati hai.</p>
<pre class="code"><span class="c"># Reference code: ek chhoti dictionary, simulator mein run nahi hua</span>
peer = {"state": "Established", "remote_as": 65001, "prefixes_received": 1}
print(peer["state"])             <span class="c"># Established print hota hai</span>
print(peer["prefixes_received"]) <span class="c"># 1 print hota hai</span></pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Router ka text dictionary banta hai">
<rect x="15" y="40" width="150" height="80" rx="10" fill="#e2e8f0"/><text x="90" y="70" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="90" y="92" text-anchor="middle" class="svg-muted" font-size="12">show output (text)</text>
<rect x="245" y="40" width="150" height="80" rx="10" fill="#fde68a"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="14">parse()</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">nkparse</text>
<rect x="475" y="40" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="550" y="70" text-anchor="middle" class="svg-ink" font-size="14">Dictionary</text><text x="550" y="92" text-anchor="middle" class="svg-muted" font-size="12">keys aur values</text>
<line x1="165" y1="80" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><line x1="395" y1="80" x2="475" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="152" text-anchor="middle" class="svg-accent" font-size="12">code ab pooch sakta hai: data["neighbors"]["203.0.113.2"]["state"]</text>
</svg><p class="cap">Text andar, data bahar.</p></div>

<h3>show() helper, line by line</h3>
<p>Dono labs ek hi chhote function se shuru hote hain. Yahan har line explain hai.</p>
<pre class="code"><span class="c"># Reference code: labs mein snapshot.py aur tests.py ka shuruati hissa</span>
from nkmiko import ConnectHandler   <span class="c"># SSH se login karne wala tool</span>
from nkparse import parse           <span class="c"># show text ko dictionary banane wala tool</span>

ROUTERS = {"R1": "10.99.0.1", "R2": "10.99.0.2", "R3": "10.99.0.3"}

def show(ip, cmd):
    """Log in, run ONE show command, return it as parsed data."""
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    out = conn.send_command(cmd)
    conn.disconnect()
    return parse(cmd, out)</pre>
<ul>
<li><code>from ... import ...</code> ek ready-made tool ko aapki script mein laata hai.</li>
<li><code>ROUTERS</code> ek dictionary hai: router ka naam key, management address value.</li>
<li><code>def show(ip, cmd):</code> ek <b>function</b> define karta hai, naam wala code block jise baar-baar bula sakte ho. Do inputs leta hai: address aur command.</li>
<li>Triple quotes ke beech ka text <b>docstring</b> hai, insaano ke liye description.</li>
<li><code>ConnectHandler(...)</code> SSH session kholta hai. <b>Lab</b> password NK@2026 plain text mein sirf isliye hai ki lab classroom hai. Real life mein password kabhi hard-code mat karo; environment variable ya secret store se padho.</li>
<li><code>send_command(cmd)</code> command chalata hai aur text lautata hai.</li>
<li><code>parse(cmd, out)</code> us text ko convert karta hai. Pehla input parser ko batata hai ki command kaunsi thi.</li>
<li><code>return</code> dictionary ko wapas us jagah deta hai jisne <code>show</code> bulaya.</li>
</ul>

<h3>Jo shapes aapko chahiye</h3>
<table class="cmp"><tr><th>Command</th><th>Facts tak kaise pahunchein</th></tr>
<tr><td>show ip ospf neighbor</td><td>data["interfaces"][interface]["neighbors"][router-id]["state"]</td></tr>
<tr><td>show ip bgp summary</td><td>data["neighbors"][peer-ip]["state"], saath mein "remote_as" aur "prefixes_received"</td></tr>
<tr><td>show ip route</td><td>data["routes"] prefix se key ki hui dictionary hai, jaise "10.0.12.0/30"</td></tr>
<tr><td>show ip interface brief</td><td>interface ka naam, phir "ip_address", "status", "protocol"</td></tr></table>
<p>Har square-bracket jodi ek aur level kholti hai, jaise folder ke andar folder. Shape pata na ho to ek baar <code>print(data)</code> chalao aur padho.</p>

<div class="eg"><p><b>Worked example.</b> Router par FULL OSPF neighbours gine ke liye <code>data["interfaces"].values()</code> par loop karo, phir har interface ke <code>["neighbors"].items()</code> par, aur state text "FULL" se shuru ho to ek jodo. FULL/BDR aur FULL/DR dono count hote hain. Lab test yahi karta hai; aap chapter 6 mein padhoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Aisi key maangna jo hai hi nahi, jaise data["routes"]["2.2.2.2/32"] jabki parser ne route "2.2.2.2" ke roop mein store kiya. Python <b>KeyError</b> ke saath ruk jaata hai. Dictionary print karo, asli keys dekho, phir code likho. Test mein KeyError test ka bug hai, network fault nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Parsing kyun zaroori hai yeh jaano: raw text par string split se screen-scraping tab toot jaati hai jab vendor spacing badalta hai. Parsers (pyATS Genie, TextFSM, nkparse) har baar wahi keys dete hain. Structured APIs (RESTCONF, NETCONF) seedha data lautate hain aur parsing ki zaroorat hi nahi.</p></div>

<div class="scn"><h4>Software upgrade par toota test</h4><p>Ek team ne raw text mein ek fixed column par "FULL" shabd dhoondkar OSPF check kiya. Software upgrade ke baad header mein extra column aa gaya aur har test ek hi minute mein fail ho gaya, jabki network theek tha. Unhone parser par switch kiya jo dictionary deta tha aur <code>state</code> ko key se check kiya. Agla upgrade bina code badle pass ho gaya.</p><p><b>Lesson:</b> data ko test karo, layout ko nahi.</p></div>

<div class="iv"><p class="q">"CLI output ko aisi cheez kaise banate ho jise test check kar sake?"</p><p>Parser (pyATS Genie, TextFSM ya similar) se show output ko dictionary mein convert karo, phir neighbour state jaisi keys par assert karo. Behtar, RESTCONF ya NETCONF jaisi model-driven API use karo jahan device pehle se structured data deta hai. Bolo ki raw text par regex aakhri raasta hai kyunki nazuk hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tests ko data chahiye; show output text hai, isliye use dictionary mein parse karo.</li>
<li>Dictionary key-value jodiyan hai; nested keys nested facts tak pahunchati hain.</li>
<li>show() helper login karta hai, ek command chalata hai, parse karke data lautata hai.</li>
<li>Real password kabhi hard-code mat karo; environment variable ya secret store use karo.</li>
<li>KeyError matlab shape ka andaaza galat tha; pehle data print karo.</li>
</ul></div>
`}};export{e as default};