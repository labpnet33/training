var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the script that met a dead router`,hi:`Troubleshooting workflow: woh script jo dead router se mili`},body:{en:`
<p>This chapter walks through lab 2 the way a working engineer would. The ticket reads: "check.py logs in to the three Kaveri Foods branch routers and saves each one's uptime to results.txt. Today it crashes halfway and results.txt is never written." There are two jobs: make the <b>script</b> robust, and fix the <b>network</b> problem behind the crash. Doing only the first one is the classic mistake.</p>
<h3>The workflow in five steps</h3>
<ol>
<li><b>Reproduce.</b> Run the script and keep the full output.</li>
<li><b>Read the traceback from the bottom.</b> Class, message, then the deepest File line.</li>
<li><b>Decide the layer.</b> Script bug, bad data, file problem, credentials, or network?</li>
<li><b>Protect the script.</b> Add try/except for the expected failure so one bad device cannot stop the rest.</li>
<li><b>Fix the cause and verify.</b> Repair the device, run again, and read the result file.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting loop"><rect x="20" y="30" width="97" height="70" rx="10" fill="#bae6fd"/><text x="68" y="60" text-anchor="middle" class="svg-ink" font-size="14">Reproduce</text><text x="68" y="82" text-anchor="middle" class="svg-muted" font-size="12">run the script</text><line x1="119" y1="65" x2="139" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="139,60 145,65 139,70" fill="#64748b"/><rect x="145" y="30" width="97" height="70" rx="10" fill="#bbf7d0"/><text x="193" y="60" text-anchor="middle" class="svg-ink" font-size="14">Read</text><text x="193" y="82" text-anchor="middle" class="svg-muted" font-size="12">bottom of traceback</text><line x1="244" y1="65" x2="264" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="264,60 270,65 264,70" fill="#64748b"/><rect x="270" y="30" width="97" height="70" rx="10" fill="#fde68a"/><text x="318" y="60" text-anchor="middle" class="svg-ink" font-size="14">Layer</text><text x="318" y="82" text-anchor="middle" class="svg-muted" font-size="12">script or network</text><line x1="369" y1="65" x2="389" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="389,60 395,65 389,70" fill="#64748b"/><rect x="395" y="30" width="97" height="70" rx="10" fill="#ddd6fe"/><text x="443" y="60" text-anchor="middle" class="svg-ink" font-size="14">Protect</text><text x="443" y="82" text-anchor="middle" class="svg-muted" font-size="12">try / except</text><line x1="494" y1="65" x2="514" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="514,60 520,65 514,70" fill="#64748b"/><rect x="520" y="30" width="97" height="70" rx="10" fill="#fed7aa"/><text x="568" y="60" text-anchor="middle" class="svg-ink" font-size="14">Fix + verify</text><text x="568" y="82" text-anchor="middle" class="svg-muted" font-size="12">results.txt</text></svg><p class="cap">Troubleshooting loop</p></div>
<h3>Step 1 and 2: reproduce and read</h3>
<p>The script (lab file <code>check.py</code>) defines <code>get_uptime(ip)</code>, which opens an SSH session, runs <code>show version | include uptime</code>, and returns the line. The loop calls it for 10.99.0.1, 10.99.0.2 and 10.99.0.3. Running it produces the traceback you met in the tracebacks chapter. These are the lines that matter:</p>
<pre class="out">AUTO&gt; python3 check.py
Traceback (most recent call last):
  File "check.py", line 19, in &lt;module&gt;
    up = get_uptime(ip)
  File "check.py", line 10, in get_uptime
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
nkmiko.exceptions.<span class="hl">NetmikoTimeoutException</span>: TCP connection to device failed.
...
Device settings: nk_ios <span class="hl">10.99.0.2</span>:22
(connection timed out)</pre>
<p>Two answers are already visible: the exception class is <code>NetmikoTimeoutException</code> and the router it was reaching when it crashed is 10.99.0.2. The script never reached 10.99.0.3 and never wrote <code>results.txt</code>, because the crash happened before the <code>with open("results.txt", "w")</code> block.</p>
<h3>Step 3: which layer?</h3>
<p>A timeout means "no SSH session". The script's logic is fine for router 1 (it got past it). So test the network path from the automation host with <code>ping</code>:</p>
<pre class="out">AUTO&gt; ping 10.99.0.2
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable</pre>
<p>Not even a ping works, so this is a <b>network problem on or near R2</b>, not a coding problem.</p>
<h3>Step 4: protect the script</h3>
<p>Lines 18 to 20 of <code>check.py</code> are the risky ones. The lab hint wraps them like this (use <code>nl check.py</code> to see line numbers, then <code>edit</code> and <code>insert</code> to change lines):</p>
<p><i>Reference code (not run in the simulator).</i></p><pre class="code">for ip in ROUTERS:
    try:
        up = get_uptime(ip)
        results.append(f"{ip} OK {up}")
    except NetmikoTimeoutException:
        results.append(f"{ip} FAILED unreachable")</pre>
<p>Running it again now finishes, writes the file, and shows exactly which device is the problem:</p>
<pre class="out">AUTO&gt; python3 check.py
10.99.0.1 OK KF-PUNE uptime is 0 minutes
10.99.0.2 <span class="hl">FAILED unreachable</span>
10.99.0.3 OK KF-NASHIK uptime is 0 minutes
Saved 3 rows to results.txt</pre>
<p>Note the hostname of the router at 10.99.0.3: it is <b>KF-NASHIK</b>, taken from the <code>uptime is</code> line. This is a good sign that the script now collects what it should from the working routers.</p>
<p>The same logic works on any machine. Here is the pattern with a stand-in login function, so you can see the report logic on its own:</p>
<pre class="code">def get_uptime(ip):
    if ip == "10.99.0.2":
        raise TimeoutError("no SSH session")
    return "uptime is 0 minutes"

results = []
for ip in ["10.99.0.1", "10.99.0.2", "10.99.0.3"]:
    try:
        results.append(f"{ip} OK {get_uptime(ip)}")
    except TimeoutError:
        results.append(f"{ip} FAILED unreachable")

ok = sum(1 for r in results if " OK " in r)
print("\\n".join(results))
print("OK:", ok, "FAILED:", len(results) - ok)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">10.99.0.1 OK uptime is 0 minutes
10.99.0.2 FAILED unreachable
10.99.0.3 OK uptime is 0 minutes
OK: 2 FAILED: 1</pre>
<h3>Step 5: fix the real cause and verify</h3>
<p>The ticket is not finished. try/except only hid the problem. Look at the router:</p>
<pre class="out">R2# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.2       YES manual <span class="hl">administratively down</span> down
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down</pre>
<p>The management interface <code>GigabitEthernet0/0</code> is <b>administratively down</b>: somebody ran <code>shutdown</code> on it. Bring it back:</p>
<pre class="out">R2# configure terminal
R2(config)# interface GigabitEthernet0/0
R2(config-if)# no shutdown
R2(config-if)# end</pre>
<p>Wait a few seconds for the link to come up, run the script again, and read the file with <code>cat results.txt</code>:</p>
<pre class="out">AUTO&gt; python3 check.py
10.99.0.1 OK KF-PUNE uptime is 0 minutes
10.99.0.2 OK <span class="hl">KF-NAGPUR</span> uptime is 0 minutes
10.99.0.3 OK KF-NASHIK uptime is 0 minutes
Saved 3 rows to results.txt</pre>
<p>Three OK lines and no FAILED means the fix worked. The <code>try/except</code> stays in the script, so the next outage will be reported instead of crashing it.</p>
<h3>Which exception, which first move</h3>
<table class="cmp"><tr><th>Exception in the traceback</th><th>First move</th></tr><tr><td><code>NetmikoTimeoutException</code></td><td><code>ping</code> the IP, check the interface status, ACLs, SSH enabled</td></tr><tr><td><code>NetmikoAuthenticationException</code></td><td>Check username, password, AAA, and whether the account is locked</td></tr><tr><td><code>TypeError ... NoneType</code></td><td>Look for a missing <code>return</code></td></tr><tr><td><code>KeyError</code></td><td>Compare the key you asked for with the keys that exist</td></tr><tr><td><code>FileNotFoundError</code></td><td><code>ls</code> the folder; check the name and the current directory</td></tr></table>
<div class="warn"><p><b>Common mistakes.</b> (1) Declaring victory after adding try/except while the router is still down. (2) Catching the wrong exception class, so the crash continues. (3) Putting the <code>with open("results.txt", "w")</code> block <b>inside</b> the loop, which erases earlier rows each time. (4) Not re-running the script after the fix and trusting that it works.</p></div>
<div class="exam"><p><b>Exam trap.</b> The correct order is: find the cause from the traceback, protect the script, fix the network, then verify. If an answer says "wrap everything in try/except and close the ticket", it is wrong.</p></div>
<div class="scn"><h4>Eleven routers OK, one silent</h4><p>A weekly compliance script reported 11 routers OK and one FAILED unreachable. A less careful engineer might have ignored the single line. The on-call engineer pinged the router, saw it was down, and found the management interface shut by a failed change window the night before. Without the FAILED row nobody would have noticed for weeks, because the router still forwarded user traffic.</p>
<p><b>Lesson:</b> good error handling turns a hidden fault into a visible line in a report.</p></div>
<div class="iv"><p class="q">"A script crashes on the third of twenty devices. How do you handle it?"</p><p>I read the traceback to see the exception class and the device. I check the network path to that device with ping and the interface status. In the script I wrap the per-device work in try/except for the specific exceptions, record FAILED with the reason, and let the loop continue. Then I fix the real fault and re-run to verify.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce, read the traceback, decide the layer, protect, fix, verify.</li>
<li>A timeout points to the network; try ping and the interface status.</li>
<li>try/except keeps the script alive; it never repairs the device.</li>
<li>Keep the file-writing block outside the loop so earlier rows are not erased.</li>
<li>Always re-run after the fix and read the result file.</li>
</ul></div>
`,hi:`
<p>Yeh chapter lab 2 ko waise chalata hai jaise ek working engineer karta hai. Ticket kehta hai: "check.py Kaveri Foods ke teen branch routers par login karke har ek ka uptime results.txt mein save karta hai. Aaj yeh beech mein crash ho jaata hai aur results.txt kabhi nahi banta." Do kaam hain: <b>script</b> ko mazboot banana, aur crash ke peeche ki <b>network problem</b> fix karna. Sirf pehla karna classic galti hai.</p>
<h3>Paanch steps ka workflow</h3>
<ol>
<li><b>Reproduce.</b> Script chalao aur poora output rakho.</li>
<li><b>Traceback neeche se padho.</b> Class, message, phir sabse gehri File line.</li>
<li><b>Layer tay karo.</b> Script bug, kharab data, file problem, credentials ya network?</li>
<li><b>Script ko protect karo.</b> Expected failure ke liye try/except lagao taaki ek kharab device baaki ko na roke.</li>
<li><b>Wajah fix karo aur verify karo.</b> Device repair karo, dobara chalao, aur result file padho.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting loop"><rect x="20" y="30" width="97" height="70" rx="10" fill="#bae6fd"/><text x="68" y="60" text-anchor="middle" class="svg-ink" font-size="14">Reproduce</text><text x="68" y="82" text-anchor="middle" class="svg-muted" font-size="12">script chalao</text><line x1="119" y1="65" x2="139" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="139,60 145,65 139,70" fill="#64748b"/><rect x="145" y="30" width="97" height="70" rx="10" fill="#bbf7d0"/><text x="193" y="60" text-anchor="middle" class="svg-ink" font-size="14">Padho</text><text x="193" y="82" text-anchor="middle" class="svg-muted" font-size="12">traceback ka neeche</text><line x1="244" y1="65" x2="264" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="264,60 270,65 264,70" fill="#64748b"/><rect x="270" y="30" width="97" height="70" rx="10" fill="#fde68a"/><text x="318" y="60" text-anchor="middle" class="svg-ink" font-size="14">Layer</text><text x="318" y="82" text-anchor="middle" class="svg-muted" font-size="12">script ya network</text><line x1="369" y1="65" x2="389" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="389,60 395,65 389,70" fill="#64748b"/><rect x="395" y="30" width="97" height="70" rx="10" fill="#ddd6fe"/><text x="443" y="60" text-anchor="middle" class="svg-ink" font-size="14">Protect</text><text x="443" y="82" text-anchor="middle" class="svg-muted" font-size="12">try / except</text><line x1="494" y1="65" x2="514" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="514,60 520,65 514,70" fill="#64748b"/><rect x="520" y="30" width="97" height="70" rx="10" fill="#fed7aa"/><text x="568" y="60" text-anchor="middle" class="svg-ink" font-size="14">Fix + verify</text><text x="568" y="82" text-anchor="middle" class="svg-muted" font-size="12">results.txt</text></svg><p class="cap">Troubleshooting loop</p></div>
<h3>Step 1 aur 2: reproduce aur padho</h3>
<p>Script (lab file <code>check.py</code>) <code>get_uptime(ip)</code> define karti hai, jo SSH session kholti hai, <code>show version | include uptime</code> chalati hai aur woh line return karti hai. Loop use 10.99.0.1, 10.99.0.2 aur 10.99.0.3 ke liye call karta hai. Chalane par wahi traceback aata hai jo aapne tracebacks chapter mein dekha. Kaam ki lines yeh hain:</p>
<pre class="out">AUTO&gt; python3 check.py
Traceback (most recent call last):
  File "check.py", line 19, in &lt;module&gt;
    up = get_uptime(ip)
  File "check.py", line 10, in get_uptime
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
nkmiko.exceptions.<span class="hl">NetmikoTimeoutException</span>: TCP connection to device failed.
...
Device settings: nk_ios <span class="hl">10.99.0.2</span>:22
(connection timed out)</pre>
<p>Do jawab pehle se dikh rahe hain: exception class <code>NetmikoTimeoutException</code> hai aur crash ke waqt script jis router tak pahunchne ki koshish kar rahi thi woh 10.99.0.2 hai. Script 10.99.0.3 tak kabhi nahi pahunchi aur <code>results.txt</code> kabhi nahi likhi, kyunki crash <code>with open("results.txt", "w")</code> block se pehle hua.</p>
<h3>Step 3: kaun si layer?</h3>
<p>Timeout ka matlab "SSH session nahi". Router 1 ke liye script ka logic theek hai (woh uske paar gayi). Isliye automation host se network path <code>ping</code> se test karo:</p>
<pre class="out">AUTO&gt; ping 10.99.0.2
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable
host (10.99.0.2) not reachable</pre>
<p>Ping bhi nahi chalta, isliye yeh <b>R2 par ya uske paas ki network problem</b> hai, coding problem nahi.</p>
<h3>Step 4: script ko protect karo</h3>
<p><code>check.py</code> ki lines 18 se 20 risky hain. Lab hint unhe aise lapetta hai (line numbers dekhne ke liye <code>nl check.py</code>, phir lines badalne ke liye <code>edit</code> aur <code>insert</code>):</p>
<p><i>Reference code (simulator mein nahi chalta).</i></p><pre class="code">for ip in ROUTERS:
    try:
        up = get_uptime(ip)
        results.append(f"{ip} OK {up}")
    except NetmikoTimeoutException:
        results.append(f"{ip} FAILED unreachable")</pre>
<p>Ab dobara chalane par script poori hoti hai, file likhti hai, aur bilkul dikhati hai ki kaun sa device problem hai:</p>
<pre class="out">AUTO&gt; python3 check.py
10.99.0.1 OK KF-PUNE uptime is 0 minutes
10.99.0.2 <span class="hl">FAILED unreachable</span>
10.99.0.3 OK KF-NASHIK uptime is 0 minutes
Saved 3 rows to results.txt</pre>
<p>10.99.0.3 wale router ka hostname dekho: <b>KF-NASHIK</b>, jo <code>uptime is</code> line se aaya. Yeh achha sanket hai ki script ab working routers se wahi collect kar rahi hai jo chahiye.</p>
<p>Wahi logic kisi bhi machine par chalta hai. Yahan stand-in login function ke saath pattern hai, taaki report logic akela dikhe:</p>
<pre class="code">def get_uptime(ip):
    if ip == "10.99.0.2":
        raise TimeoutError("no SSH session")
    return "uptime is 0 minutes"

results = []
for ip in ["10.99.0.1", "10.99.0.2", "10.99.0.3"]:
    try:
        results.append(f"{ip} OK {get_uptime(ip)}")
    except TimeoutError:
        results.append(f"{ip} FAILED unreachable")

ok = sum(1 for r in results if " OK " in r)
print("\\n".join(results))
print("OK:", ok, "FAILED:", len(results) - ok)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">10.99.0.1 OK uptime is 0 minutes
10.99.0.2 FAILED unreachable
10.99.0.3 OK uptime is 0 minutes
OK: 2 FAILED: 1</pre>
<h3>Step 5: asli wajah fix karo aur verify karo</h3>
<p>Ticket abhi khatam nahi hua. try/except ne sirf problem chhupayi. Router dekho:</p>
<pre class="out">R2# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.2       YES manual <span class="hl">administratively down</span> down
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down</pre>
<p>Management interface <code>GigabitEthernet0/0</code> <b>administratively down</b> hai: kisi ne uspar <code>shutdown</code> chalaya tha. Use wapas lao:</p>
<pre class="out">R2# configure terminal
R2(config)# interface GigabitEthernet0/0
R2(config-if)# no shutdown
R2(config-if)# end</pre>
<p>Link up hone ke liye kuch second ruko, script dobara chalao, aur <code>cat results.txt</code> se file padho:</p>
<pre class="out">AUTO&gt; python3 check.py
10.99.0.1 OK KF-PUNE uptime is 0 minutes
10.99.0.2 OK <span class="hl">KF-NAGPUR</span> uptime is 0 minutes
10.99.0.3 OK KF-NASHIK uptime is 0 minutes
Saved 3 rows to results.txt</pre>
<p>Teen OK lines aur koi FAILED nahi matlab fix kaam kar gaya. <code>try/except</code> script mein rehta hai, isliye agla outage crash ki jagah report hoga.</p>
<h3>Kaun si exception, pehla kadam kya</h3>
<table class="cmp"><tr><th>Traceback ki exception</th><th>Pehla kadam</th></tr><tr><td><code>NetmikoTimeoutException</code></td><td>IP <code>ping</code> karo, interface status, ACLs, SSH enabled check karo</td></tr><tr><td><code>NetmikoAuthenticationException</code></td><td>Username, password, AAA aur account locked to nahi check karo</td></tr><tr><td><code>TypeError ... NoneType</code></td><td>Missing <code>return</code> dhoondho</td></tr><tr><td><code>KeyError</code></td><td>Jo key maangi use maujooda keys se compare karo</td></tr><tr><td><code>FileNotFoundError</code></td><td>Folder mein <code>ls</code> karo; naam aur current directory check karo</td></tr></table>
<div class="warn"><p><b>Common mistakes.</b> (1) try/except lagakar jeet maan lena jabki router abhi bhi down hai. (2) Galat exception class pakadna, isliye crash jaari rehta hai. (3) <code>with open("results.txt", "w")</code> block ko loop ke <b>andar</b> rakhna, jo har baar pehli rows mita deta hai. (4) Fix ke baad script dobara na chalana aur maan lena ki kaam karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sahi order hai: traceback se wajah dhoondho, script protect karo, network fix karo, phir verify karo. Agar koi jawab kehta hai "sab kuch try/except mein lapeto aur ticket band karo", to woh galat hai.</p></div>
<div class="scn"><h4>Gyarah router OK, ek chupchaap</h4><p>Ek weekly compliance script ne 11 routers OK aur ek FAILED unreachable report kiya. Kam careful engineer ek line ko ignore kar sakta tha. On-call engineer ne router ko ping kiya, dekha down hai, aur paaya ki pichhli raat ki failed change window mein management interface shut ho gaya tha. FAILED row ke bina hafton tak kisi ko pata nahi chalta, kyunki router user traffic abhi bhi forward kar raha tha.</p>
<p><b>Lesson:</b> achhi error handling chhupe hue fault ko report ki ek dikhne wali line bana deti hai.</p></div>
<div class="iv"><p class="q">"Script bees mein se teesre device par crash hoti hai. Kaise handle karoge?"</p><p>Main traceback padhkar exception class aur device dekhta hoon. Us device tak network path ping aur interface status se check karta hoon. Script mein per-device kaam ko specific exceptions ke liye try/except mein lapeta hoon, reason ke saath FAILED record karta hoon, aur loop ko chalne deta hoon. Phir asli fault fix karke dobara chalakar verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce, traceback padho, layer tay karo, protect karo, fix karo, verify karo.</li>
<li>Timeout network ki taraf ishara karta hai; ping aur interface status try karo.</li>
<li>try/except script ko zinda rakhta hai; woh device repair nahi karta.</li>
<li>File likhne wala block loop ke bahar rakho taaki pehli rows na mitein.</li>
<li>Fix ke baad hamesha dobara chalao aur result file padho.</li>
</ul></div>
`}};export{e as default};