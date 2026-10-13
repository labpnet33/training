var e={id:`troubleshooting-labs`,h:{en:`Troubleshooting workflow: walking both labs`,hi:`Troubleshooting workflow: dono labs step by step`},body:{en:`
<p>A good doctor does not prescribe five medicines at once. She reads the report, forms one hypothesis, changes one thing, and checks again. Fixing a broken script is the same discipline. Scripts fail in only five ways, and each way tells you where to look. This chapter gives you the workflow and then walks through both labs of the module, <b>Automate show commands with Python</b> and <b>Parse JSON and act on it</b>, exactly as you will do them.</p>

<h3>The workflow</h3>
<ol>
<li><b>Run and capture.</b> <code>python3 script.py</code>. Copy the last line of any traceback.</li>
<li><b>Classify</b> the failure using the last line (table below).</li>
<li><b>Locate.</b> <code>nl file</code> shows line numbers; go to the line in the traceback, or just before it.</li>
<li><b>Change one thing.</b> <code>edit</code>, <code>insert</code> or <code>sed -i</code>.</li>
<li><b>Re-run</b> and repeat until there is no traceback.</li>
<li><b>Verify on the device</b>, not only in the script's own output, and confirm the change was saved.</li>
</ol>
<table class="cmp"><tr><th>Class</th><th>You see</th><th>Look at</th></tr>
<tr><td>Syntax</td><td>SyntaxError, IndentationError; nothing ran</td><td>The line shown and the one above it</td></tr>
<tr><td>Data</td><td>JSONDecodeError, KeyError, IndexError, TypeError</td><td>The input file or the structure you index</td></tr>
<tr><td>Network</td><td>NetmikoTimeoutException</td><td>Ping, routing, ACLs, <code>ip ssh</code>, <code>transport input</code></td></tr>
<tr><td>Authentication</td><td>NetmikoAuthenticationException, HTTP 401</td><td>Username, password (case!), privilege, token</td></tr>
<tr><td>Logic</td><td>No traceback, wrong result</td><td>Conditions, loops, missing steps: trace it</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="60" width="100" height="40" rx="8" fill="#bae6fd"/><text x="60" y="85" text-anchor="middle" class="svg-ink" font-size="13">run</text>
<rect x="135" y="60" width="110" height="40" rx="8" fill="#fde68a"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="13">read last line</text>
<rect x="270" y="60" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">classify</text>
<rect x="395" y="60" width="100" height="40" rx="8" fill="#fed7aa"/><text x="445" y="85" text-anchor="middle" class="svg-ink" font-size="13">fix one thing</text>
<rect x="520" y="60" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="85" text-anchor="middle" class="svg-ink" font-size="13">verify on device</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="270" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<path d="M445 100 L445 135 L60 135 L60 100" fill="none" stroke="#64748b" stroke-width="2"/><text x="250" y="152" text-anchor="middle" class="svg-accent" font-size="12">re-run until there is no traceback</text>
</svg><p class="cap">One change per loop, so you always know which change fixed or broke something.</p></div>

<h3>Lab 1: Automate show commands with Python</h3>
<p>On AUTO, <code>collect.py</code> should log in to R1, R2 and R3, list the interfaces that are up, and add a managed Loopback100 on each router.</p>
<p><b>Failure 1: syntax.</b></p>
<pre class="out">AUTO&gt; python3 collect.py
  File "collect.py", line 12
    def parse_brief(text)
                         ^
<span class="hl">SyntaxError: expected ':'</span></pre>
<p>Class: syntax, so no router was contacted. Fix: <code>edit collect.py 12 def parse_brief(text):</code></p>
<p><b>Failure 2: authentication.</b> The next run raises <code>NetmikoAuthenticationException: Authentication to device failed.</code> for 10.99.0.1. It is not a timeout, so TCP port 22 was reachable and SSH answered; the credentials were refused. <code>nl collect.py</code> shows the <code>CREDS</code> dict with <code>"password": "Nk@2026"</code>, but the routers use <code>NK@2026</code>, and passwords are case-sensitive. Fix: <code>sed -i 's/Nk@2026/NK@2026/' collect.py</code>. This exception class is the answer to the lab's last question.</p>
<pre class="out">AUTO&gt; python3 collect.py
R1       1 up: GigabitEthernet0/0
R2       2 up: GigabitEthernet0/0, GigabitEthernet0/1
<span class="hl">R3       2 up: GigabitEthernet0/0, GigabitEthernet0/1</span></pre>
<p><b>Finishing the TODOs.</b> Line 32 is <code>conn.disconnect()</code>, so insert three lines before it. The loop variable <code>n</code> from <code>enumerate(ROUTERS, start=1)</code> gives 1, 2, 3. Type the four leading spaces:</p>
<pre class="code">AUTO&gt; insert collect.py 32     cfg = ["interface Loopback100", "description Managed by Python", "ip address 100.100.100.{} 255.255.255.255".format(n)]
AUTO&gt; insert collect.py 33     conn.send_config_set(cfg)
AUTO&gt; insert collect.py 34     conn.save_config()
AUTO&gt; python3 collect.py</pre>
<p>An f-string version (the letter f before the quote and <code>n</code> in braces inside the address) works identically. The run must end without a traceback. Run it once more and each router lists Loopback100 among its up interfaces, so R2 shows 3 up.</p>
<p><b>Verify on the router.</b></p>
<pre class="out">R3# show ip interface brief | include Loopback
<span class="hl">Loopback100            100.100.100.3   YES manual up                    up</span></pre>

<h3>Lab 2: Parse JSON and act on it</h3>
<p><code>vlans.py</code> reads <code>vlans.json</code>, creates VLANs and access ports on ACC-SW1 (10.99.0.11) and ACC-SW2 (10.99.0.12), and should save <code>report.json</code>.</p>
<p><b>Failure: data.</b></p>
<pre class="out">AUTO&gt; python3 vlans.py
Traceback (most recent call last):
  File "vlans.py", line 6, in &lt;module&gt;
    data = json.load(f)
<span class="hl">json.decoder.JSONDecodeError: Expecting value: line 19 column 7 (char 436)</span></pre>
<p>The error is in the <b>JSON file</b>, not in vlans.py line 6, which only reads it. <code>nl vlans.json</code>: line 18 is the last VLAN of ACC-SW2 with a trailing comma, and line 19 is the closing <code>]</code>. Fix: <code>edit vlans.json 18         {"id": 30, "name": "VOICE"}</code>. Re-run: the script prints <code>Site: Pune-Campus</code>, creates VLANs 10 and 20 on ACC-SW1 and 10 and 30 on ACC-SW2, and prints the report.</p>
<p><b>First TODO: access ports.</b> Insert before <code>conn.send_config_set(cfg)</code> on line 17, with 4 and 8 spaces of indentation:</p>
<pre class="code">AUTO&gt; insert vlans.py 17     for port, vid in sw["access_ports"].items():
AUTO&gt; insert vlans.py 18         cfg += ["interface " + port, "switchport mode access", "switchport access vlan {}".format(vid)]</pre>
<p><b>Second TODO: save the report.</b> After the two inserts, the TODO comment has moved to line 24:</p>
<pre class="code">AUTO&gt; insert vlans.py 24 with open("report.json", "w") as f:
AUTO&gt; insert vlans.py 25     json.dump(report, f, indent=2)
AUTO&gt; python3 vlans.py
AUTO&gt; cat report.json</pre>
<pre class="out">{
  "ACC-SW1": [1, 10, 20],
  <span class="hl">"ACC-SW2": [1, 10, 30]</span>
}</pre>
<p>ACC-SW2 now has <b>3</b> VLANs below 1000: 1, 10 and 30. VLAN 1 counts, and 1002 to 1005 are filtered out by <code>&lt; 1000</code>. Verify on a switch with <code>show vlan brief</code>: VLAN 10 SALES should list Gi0/2 on ACC-SW1 and VLAN 20 HR should list Gi0/3.</p>

<div class="eg"><p><b>Worked example: why the lines moved.</b> vlans.py originally had the save TODO on line 22. Inserting two lines at 17 and 18 pushes every later line down by two, so it becomes line 24. Always run <code>nl</code> again after an insert rather than trusting the old numbers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing several things before re-running, so you cannot tell which change mattered; editing the Python line named in a JSONDecodeError instead of the JSON file; inserting lines without leading spaces, which causes an IndentationError or puts the code outside the loop; and trusting the script's success message without checking the device.</p></div>

<div class="exam"><p><b>Exam trap.</b> Classify by the last traceback line: timeout = reachability or SSH service; authentication = credentials; JSONDecodeError = input data; SyntaxError = nothing ran. A 401 from an API is the same class as an authentication exception.</p></div>

<div class="scn"><h4>The fix that broke the next site</h4><p>An engineer's VLAN script failed with a KeyError on one site. In a hurry he changed the JSON file, the key name in the script, and a loop condition at once. The site worked, but the next site's run silently skipped all access ports, because the loop change was wrong and the key change had hidden it. Rolling back and repeating one change at a time found the real cause in two runs: one site's file used <code>ports</code> instead of <code>access_ports</code>.</p><p><b>Lesson:</b> one change, one re-run; then verify on the device.</p></div>

<div class="iv"><p class="q">"Your automation script fails in production. How do you troubleshoot it?"</p><p>Strong answer: reproduce it, read the traceback from the bottom, and classify the failure: syntax, data, network, authentication or logic. For network failures test reachability and SSH from the automation host; for authentication check credentials and privilege; for data validate the input file (for JSON, <code>python3 -m json.tool</code>); for logic, trace with sample data in the REPL. Change one thing at a time, re-run against a lab or single device, and verify on the device itself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Run, read the last line, classify, locate with <code>nl</code>, fix one thing, re-run, verify on the device.</li>
<li>Lab 1: missing colon on line 12; password case Nk vs NK (NetmikoAuthenticationException); insert Loopback100 config, push, save.</li>
<li>Lab 2: trailing comma on vlans.json line 18; add the access-port loop; <code>json.dump(report, f, indent=2)</code>.</li>
<li>A JSONDecodeError points into the data file, not the Python line that loaded it.</li>
<li>Line numbers shift after every insert; check with <code>nl</code> again.</li>
</ul></div>
`,hi:`
<p>Achhi doctor ek saath paanch dawaiyan nahi likhti. Woh report padhti hai, ek hypothesis banati hai, ek cheez badalti hai, aur phir check karti hai. Toota script fix karna bhi yahi discipline hai. Scripts sirf paanch tarike se fail hote hain, aur har tarika batata hai kahan dekhna hai. Yeh chapter workflow deta hai aur phir module ke dono labs, <b>Automate show commands with Python</b> aur <b>Parse JSON and act on it</b>, bilkul waise karke dikhata hai jaise aap karoge.</p>

<h3>Workflow</h3>
<ol>
<li><b>Chalao aur capture karo.</b> <code>python3 script.py</code>. Kisi bhi traceback ki aakhri line copy karo.</li>
<li>Aakhri line se failure ko <b>classify</b> karo (neeche table).</li>
<li><b>Locate karo.</b> <code>nl file</code> line numbers dikhata hai; traceback wali line par jao, ya usse theek pehle.</li>
<li><b>Ek cheez badlo.</b> <code>edit</code>, <code>insert</code> ya <code>sed -i</code>.</li>
<li><b>Dobara chalao</b> aur tab tak dohrao jab tak traceback na aaye.</li>
<li><b>Device par verify karo</b>, sirf script ke apne output par nahi, aur confirm karo ki change save hua.</li>
</ol>
<table class="cmp"><tr><th>Class</th><th>Aapko dikhta hai</th><th>Kahan dekho</th></tr>
<tr><td>Syntax</td><td>SyntaxError, IndentationError; kuch nahi chala</td><td>Dikhayi gayi line aur usse upar wali</td></tr>
<tr><td>Data</td><td>JSONDecodeError, KeyError, IndexError, TypeError</td><td>Input file ya woh structure jise aap index karte ho</td></tr>
<tr><td>Network</td><td>NetmikoTimeoutException</td><td>Ping, routing, ACLs, <code>ip ssh</code>, <code>transport input</code></td></tr>
<tr><td>Authentication</td><td>NetmikoAuthenticationException, HTTP 401</td><td>Username, password (case!), privilege, token</td></tr>
<tr><td>Logic</td><td>Traceback nahi, result galat</td><td>Conditions, loops, missing steps: trace karo</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="60" width="100" height="40" rx="8" fill="#bae6fd"/><text x="60" y="85" text-anchor="middle" class="svg-ink" font-size="13">chalao</text>
<rect x="135" y="60" width="110" height="40" rx="8" fill="#fde68a"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="13">aakhri line padho</text>
<rect x="270" y="60" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">classify</text>
<rect x="395" y="60" width="100" height="40" rx="8" fill="#fed7aa"/><text x="445" y="85" text-anchor="middle" class="svg-ink" font-size="13">ek cheez fix</text>
<rect x="520" y="60" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="85" text-anchor="middle" class="svg-ink" font-size="13">device par verify</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="270" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<path d="M445 100 L445 135 L60 135 L60 100" fill="none" stroke="#64748b" stroke-width="2"/><text x="250" y="152" text-anchor="middle" class="svg-accent" font-size="12">traceback khatam hone tak dobara chalao</text>
</svg><p class="cap">Har loop mein ek change, taaki hamesha pata rahe kaunse change ne kuch theek kiya ya toda.</p></div>

<h3>Lab 1: Automate show commands with Python</h3>
<p>AUTO par <code>collect.py</code> ko R1, R2 aur R3 par login karna chahiye, up interfaces list karne chahiye, aur har router par managed Loopback100 jodna chahiye.</p>
<p><b>Failure 1: syntax.</b></p>
<pre class="out">AUTO&gt; python3 collect.py
  File "collect.py", line 12
    def parse_brief(text)
                         ^
<span class="hl">SyntaxError: expected ':'</span></pre>
<p>Class: syntax, isliye kisi router se contact nahi hua. Fix: <code>edit collect.py 12 def parse_brief(text):</code></p>
<p><b>Failure 2: authentication.</b> Agla run 10.99.0.1 ke liye <code>NetmikoAuthenticationException: Authentication to device failed.</code> raise karta hai. Yeh timeout nahi hai, isliye TCP port 22 reachable tha aur SSH ne jawab diya; credentials mana hue. <code>nl collect.py</code> <code>CREDS</code> dict mein <code>"password": "Nk@2026"</code> dikhata hai, par routers <code>NK@2026</code> use karte hain, aur passwords case-sensitive hain. Fix: <code>sed -i 's/Nk@2026/NK@2026/' collect.py</code>. Yahi exception class lab ke aakhri sawaal ka jawab hai.</p>
<pre class="out">AUTO&gt; python3 collect.py
R1       1 up: GigabitEthernet0/0
R2       2 up: GigabitEthernet0/0, GigabitEthernet0/1
<span class="hl">R3       2 up: GigabitEthernet0/0, GigabitEthernet0/1</span></pre>
<p><b>TODOs poore karna.</b> Line 32 <code>conn.disconnect()</code> hai, isliye usse pehle teen lines insert karo. <code>enumerate(ROUTERS, start=1)</code> ka loop variable <code>n</code> 1, 2, 3 deta hai. Chaar leading spaces type karo:</p>
<pre class="code">AUTO&gt; insert collect.py 32     cfg = ["interface Loopback100", "description Managed by Python", "ip address 100.100.100.{} 255.255.255.255".format(n)]
AUTO&gt; insert collect.py 33     conn.send_config_set(cfg)
AUTO&gt; insert collect.py 34     conn.save_config()
AUTO&gt; python3 collect.py</pre>
<p>f-string version (quote se pehle letter f aur address ke andar braces mein <code>n</code>) bilkul same kaam karta hai. Run bina traceback ke khatam hona chahiye. Ek baar aur chalao aur har router apne up interfaces mein Loopback100 dikhata hai, isliye R2 3 up dikhata hai.</p>
<p><b>Router par verify karo.</b></p>
<pre class="out">R3# show ip interface brief | include Loopback
<span class="hl">Loopback100            100.100.100.3   YES manual up                    up</span></pre>

<h3>Lab 2: Parse JSON and act on it</h3>
<p><code>vlans.py</code> <code>vlans.json</code> padhta hai, ACC-SW1 (10.99.0.11) aur ACC-SW2 (10.99.0.12) par VLANs aur access ports banata hai, aur use <code>report.json</code> save karna chahiye.</p>
<p><b>Failure: data.</b></p>
<pre class="out">AUTO&gt; python3 vlans.py
Traceback (most recent call last):
  File "vlans.py", line 6, in &lt;module&gt;
    data = json.load(f)
<span class="hl">json.decoder.JSONDecodeError: Expecting value: line 19 column 7 (char 436)</span></pre>
<p>Error <b>JSON file</b> mein hai, vlans.py ki line 6 mein nahi, jo sirf use padhti hai. <code>nl vlans.json</code>: line 18 ACC-SW2 ka aakhri VLAN hai trailing comma ke saath, aur line 19 closing <code>]</code> hai. Fix: <code>edit vlans.json 18         {"id": 30, "name": "VOICE"}</code>. Dobara chalao: script <code>Site: Pune-Campus</code> print karta hai, ACC-SW1 par VLANs 10 aur 20 aur ACC-SW2 par 10 aur 30 banata hai, aur report print karta hai.</p>
<p><b>Pehla TODO: access ports.</b> Line 17 par <code>conn.send_config_set(cfg)</code> se pehle, 4 aur 8 spaces indentation ke saath insert karo:</p>
<pre class="code">AUTO&gt; insert vlans.py 17     for port, vid in sw["access_ports"].items():
AUTO&gt; insert vlans.py 18         cfg += ["interface " + port, "switchport mode access", "switchport access vlan {}".format(vid)]</pre>
<p><b>Doosra TODO: report save karo.</b> Do inserts ke baad TODO comment line 24 par chala gaya hai:</p>
<pre class="code">AUTO&gt; insert vlans.py 24 with open("report.json", "w") as f:
AUTO&gt; insert vlans.py 25     json.dump(report, f, indent=2)
AUTO&gt; python3 vlans.py
AUTO&gt; cat report.json</pre>
<pre class="out">{
  "ACC-SW1": [1, 10, 20],
  <span class="hl">"ACC-SW2": [1, 10, 30]</span>
}</pre>
<p>ACC-SW2 par ab 1000 se kam <b>3</b> VLANs hain: 1, 10 aur 30. VLAN 1 ginti mein hai, aur 1002 se 1005 <code>&lt; 1000</code> se filter ho jaate hain. Switch par <code>show vlan brief</code> se verify karo: ACC-SW1 par VLAN 10 SALES mein Gi0/2 aur VLAN 20 HR mein Gi0/3 dikhna chahiye.</p>

<div class="eg"><p><b>Worked example: lines kyun khiski.</b> vlans.py mein save wala TODO shuru mein line 22 par tha. Line 17 aur 18 par do lines insert karne se baad ki har line do neeche khisak jaati hai, isliye woh line 24 ban jaati hai. Insert ke baad purane numbers par bharosa karne ki jagah hamesha <code>nl</code> dobara chalao.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Dobara chalane se pehle kai cheezein fix karna, jisse pata nahi chalta kaunse change ne kaam kiya; JSON file ki jagah JSONDecodeError mein bataayi Python line edit karna; bina leading spaces ke lines insert karna, jisse IndentationError aata hai ya code loop ke bahar chala jaata hai; aur device check kiye bina script ke success message par bharosa karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aakhri traceback line se classify karo: timeout = reachability ya SSH service; authentication = credentials; JSONDecodeError = input data; SyntaxError = kuch nahi chala. API ka 401 authentication exception wali class ka hi hai.</p></div>

<div class="scn"><h4>Fix jisne agli site tod di</h4><p>Ek engineer ka VLAN script ek site par KeyError ke saath fail hua. Jaldi mein usne ek saath JSON file, script mein key ka naam, aur ek loop condition badal di. Woh site chal gayi, par agli site ke run ne chupchaap saare access ports skip kar diye, kyunki loop change galat tha aur key change ne use chhupa diya tha. Rollback karke ek ek change dohraane se do runs mein asli wajah mili: ek site ki file <code>access_ports</code> ki jagah <code>ports</code> use kar rahi thi.</p><p><b>Seekh:</b> ek change, ek re-run; phir device par verify.</p></div>

<div class="iv"><p class="q">"Aapka automation script production mein fail hota hai. Aap troubleshoot kaise karoge?"</p><p>Strong answer: reproduce karo, traceback neeche se padho, aur failure classify karo: syntax, data, network, authentication ya logic. Network failures ke liye automation host se reachability aur SSH test karo; authentication ke liye credentials aur privilege check karo; data ke liye input file validate karo (JSON ke liye <code>python3 -m json.tool</code>); logic ke liye REPL mein sample data se trace karo. Ek baar mein ek cheez badlo, lab ya ek device par dobara chalao, aur device par hi verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chalao, aakhri line padho, classify karo, <code>nl</code> se locate karo, ek cheez fix karo, dobara chalao, device par verify karo.</li>
<li>Lab 1: line 12 par missing colon; password case Nk vs NK (NetmikoAuthenticationException); Loopback100 config insert, push, save.</li>
<li>Lab 2: vlans.json line 18 par trailing comma; access-port loop jodo; <code>json.dump(report, f, indent=2)</code>.</li>
<li>JSONDecodeError data file ke andar point karta hai, us Python line par nahi jisne use load kiya.</li>
<li>Har insert ke baad line numbers khisakte hain; <code>nl</code> se dobara check karo.</li>
</ul></div>
`}};export{e as default};