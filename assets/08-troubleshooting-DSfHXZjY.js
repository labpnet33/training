var e={id:`troubleshooting`,h:{en:`Troubleshooting and debugging: tracebacks, try/except and exit codes`,hi:`Troubleshooting aur debugging: tracebacks, try/except aur exit codes`},body:{en:`
<p><b>The idea of this chapter:</b> scripts fail. What separates a beginner from a professional is a calm routine for reading the failure, finding the cause and making the tool survive it. You will debug two small scripts, then fix a real problem in the backup tool: one router is down and the whole run crashes.</p>

<h3>Analogy: a doctor's routine</h3>
<p>A doctor does not guess. She reads the symptom, asks where it hurts, tests one idea at a time. A traceback is the symptom list. The last line is the diagnosis, the line above it is where it hurts.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Debugging loop: read, locate, test, fix, rerun">
<rect x="10" y="30" width="110" height="60" rx="10" fill="#fecaca"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Read</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="10">last line first</text>
<rect x="135" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Locate</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="10">file and line</text>
<rect x="260" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Look</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="10">print the values</text>
<rect x="385" y="30" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="10">only one change</text>
<rect x="510" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Rerun</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="10">and check the code</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The same five steps for every error.</p></div>

<h3>Case 1: KeyError, the wrong column name</h3>
<pre class="code">import csv

with open("devices.csv") as f:
    rows = list(csv.DictReader(f))
for row in rows:
    print(row["hostname"])</pre>
<ul>
<li><code>open("devices.csv")</code> opens the file; <code>with ... as f</code> closes it automatically afterwards.</li>
<li><code>csv.DictReader(f)</code> turns each row into a dictionary whose keys come from the header line.</li>
<li><code>row["hostname"]</code> asks for the value under the key <code>hostname</code>.</li>
</ul>
<pre class="out">AUTO01$ python3 bug.py
Traceback (most recent call last):
  File "bug.py", line 6, in &lt;module&gt;
    print(row["hostname"])
<span class="hl">KeyError: 'hostname'</span></pre>
<p>Read it: line 6, the key <code>hostname</code> does not exist. The header of the lab's <code>devices.csv</code> is <code>name,ip</code>, so the right key is <code>name</code>. One word fixes it.</p>

<h3>Case 2: IndexError, and "print what you think you know"</h3>
<pre class="code">ports = ["Gi0/1", "Gi0/2"]
for i in range(3):
    print(f"port {i}: {ports[i]}")</pre>
<ul>
<li><code>range(3)</code> counts 0, 1, 2. Python counts from zero.</li>
<li><code>ports[i]</code> takes the item at position <code>i</code>. The list has only two items, positions 0 and 1.</li>
</ul>
<pre class="out">AUTO01$ python3 dbg.py
port 0: Gi0/1
port 1: Gi0/2
Traceback (most recent call last):
  File "dbg.py", line 3, in &lt;module&gt;
    print(f"port {i}: {ports[i]}")
<span class="hl">IndexError: list index out of range</span></pre>
<p>The two printed lines are the debugging gift: the loop worked for 0 and 1 and broke at 2. The fix is to loop over the real length, <code>range(len(ports))</code>, or better <code>for port in ports</code>. Adding a <code>print</code> to show a value is the oldest debugging tool and still the best first step.</p>

<h3>Case 3: one router down kills the whole run</h3>
<p>The first version of <code>netbackup.py</code> only expected a login failure. R3 is down, so it times out:</p>
<pre class="out">AUTO01$ python3 netbackup.py; echo "rc=$?"
Traceback (most recent call last):
  File "netbackup.py", line 40, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host=dev["ip"], username=USER, password=PASS)
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios 10.99.0.3:22
(connection timed out)

rc=1</pre>
<p>The script died at the third device, so even the reachable ones may not be reported. Now look at the lines that handle errors:</p>
<pre class="out">AUTO01$ grep -n except netbackup.py
11:from nkmiko.exceptions import NetmikoAuthenticationException, NetmikoTimeoutException
43:    except NetmikoAuthenticationException as err:</pre>
<p>The tool imports both error types (line 11) but catches only one (line 43). A <code>try</code> block runs risky code; the <code>except</code> block says what to do for a named error. Add the second type, as a pair in parentheses:</p>
<pre class="out">AUTO01$ sed -i 's/except NetmikoAuthenticationException as err/except (NetmikoAuthenticationException, NetmikoTimeoutException) as err/' netbackup.py
AUTO01$ python3 netbackup.py; echo "exit code: $?"
2 saved, 1 failed
<span class="hl">exit code: 1</span></pre>
<p>Now the run completes: two routers saved, one failed, no traceback. Inside the <code>except</code> the script logs the problem, adds one to <code>failed</code> and uses <code>continue</code> to move on to the next device. At the end, <code>sys.exit(1 if failed else 0)</code> reports exit code 1 when anything failed, so cron or a monitoring tool can notice. "Keep going, but report the truth" is the pattern.</p>

<div class="eg"><p><b>Worked example.</b> Order of causes for a failed backup: 1) the traceback names the device and the error; 2) timeout means check reachability, with a ping and the interface state on that router; 3) authentication means check the account; 4) a file error means check paths, and, under cron, the absolute paths; 5) after fixing, confirm with the log and <code>echo $?</code>.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Two real Python tools help in bigger scripts: <code>python3 -m pdb script.py</code> starts the built-in step-by-step debugger, and <code>python3 -X dev script.py</code> turns on extra checks. Catching <code>Exception</code> or using a bare <code>except:</code> hides real bugs; always name the errors you expect. The lab tool keeps a password in its code only as a placeholder; real tools read it from the environment or a vault.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading the top of the traceback instead of the bottom. Changing three things at once. Catching every error silently with a bare <code>except</code>. Swallowing an error and still exiting with code 0. Debugging on production devices instead of a lab copy.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>KeyError</code> is a missing dictionary key; <code>IndexError</code> is a list position that does not exist; <code>FileNotFoundError</code> is a bad path; <code>ModuleNotFoundError</code> is a missing package. Know the four by name.</p></div>

<div class="scn"><h4>Fifty devices, one dead</h4><p>A configuration collector crashed on device 17 of 50 and never touched the remaining 33. Wrapping the device call in try/except, logging the failure and continuing gave a complete run with a short list of failed devices to investigate.</p><p><b>Lesson:</b> one failure should never hide forty-nine successes.</p></div>

<div class="iv"><p class="q">"Walk me through how you debug a failing Python script."</p><p>I read the last line of the traceback for the error type and message, go to the file and line above it, print the values involved, change one thing, and rerun. For expected failures such as a device timeout I use a named <code>except</code>, log it, continue, and return a non-zero exit code at the end.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Last line is the diagnosis; the line number above shows where.</li>
<li>Print the values to see what is really there; fix one thing at a time.</li>
<li><code>try</code> and <code>except</code> with named errors keep the run going.</li>
<li>Exit with 1 when anything failed, 0 when everything worked.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> scripts fail hoti hain. Beginner aur professional mein fark failure ko padhne, wajah dhoondhne aur tool ko uska saamna karwane ke shaant routine mein hai. Aap do chhoti scripts debug karoge, phir backup tool ki ek asli problem theek karoge: ek router down hai aur poora run crash ho jaata hai.</p>

<h3>Analogy: doctor ka routine</h3>
<p>Doctor andaza nahi lagati. Woh symptom padhti hai, poochti hai kahan dard hai, ek-ek idea test karti hai. Traceback symptom list hai. Aakhri line diagnosis hai, uske upar ki line batati hai kahan dard hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Debugging loop: padho, jagah dhoondho, dekho, fix, dobara chalao">
<rect x="10" y="30" width="110" height="60" rx="10" fill="#fecaca"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Padho</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="10">aakhri line pehle</text>
<rect x="135" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Jagah</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="10">file aur line</text>
<rect x="260" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Dekho</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="10">values print karo</text>
<rect x="385" y="30" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Ek fix</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="10">sirf ek change</text>
<rect x="510" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Dobara</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="10">aur code check</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har error ke liye wahi paanch steps.</p></div>

<h3>Case 1: KeyError, galat column naam</h3>
<pre class="code">import csv

with open("devices.csv") as f:
    rows = list(csv.DictReader(f))
for row in rows:
    print(row["hostname"])</pre>
<ul>
<li><code>open("devices.csv")</code> file kholta hai; <code>with ... as f</code> baad mein use apne aap band kar deta hai.</li>
<li><code>csv.DictReader(f)</code> har row ko dictionary banata hai jiski keys header line se aati hain.</li>
<li><code>row["hostname"]</code> key <code>hostname</code> ke neeche ki value maangta hai.</li>
</ul>
<pre class="out">AUTO01$ python3 bug.py
Traceback (most recent call last):
  File "bug.py", line 6, in &lt;module&gt;
    print(row["hostname"])
<span class="hl">KeyError: 'hostname'</span></pre>
<p>Padho: line 6, key <code>hostname</code> maujood nahi. Lab ki <code>devices.csv</code> ka header <code>name,ip</code> hai, isliye sahi key <code>name</code> hai. Ek shabd se fix.</p>

<h3>Case 2: IndexError, aur "jo maante ho woh print karo"</h3>
<pre class="code">ports = ["Gi0/1", "Gi0/2"]
for i in range(3):
    print(f"port {i}: {ports[i]}")</pre>
<ul>
<li><code>range(3)</code> 0, 1, 2 ginta hai. Python zero se ginta hai.</li>
<li><code>ports[i]</code> position <code>i</code> ka item leta hai. List mein sirf do items hain, position 0 aur 1.</li>
</ul>
<pre class="out">AUTO01$ python3 dbg.py
port 0: Gi0/1
port 1: Gi0/2
Traceback (most recent call last):
  File "dbg.py", line 3, in &lt;module&gt;
    print(f"port {i}: {ports[i]}")
<span class="hl">IndexError: list index out of range</span></pre>
<p>Do printed lines debugging ka tohfa hain: loop 0 aur 1 par chala aur 2 par toota. Fix hai asli length par loop karna, <code>range(len(ports))</code>, ya behtar <code>for port in ports</code>. Value dikhane ke liye <code>print</code> jodna sabse purana debugging tool hai aur ab bhi sabse achha pehla kadam.</p>

<h3>Case 3: ek router down aur poora run khatam</h3>
<p><code>netbackup.py</code> ka pehla version sirf login failure ki umeed rakhta tha. R3 down hai, isliye woh timeout deta hai:</p>
<pre class="out">AUTO01$ python3 netbackup.py; echo "rc=$?"
Traceback (most recent call last):
  File "netbackup.py", line 40, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host=dev["ip"], username=USER, password=PASS)
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios 10.99.0.3:22
(connection timed out)

rc=1</pre>
<p>Script teesre device par mar gayi, isliye reachable devices bhi report nahi ho sakte. Ab error handle karne wali lines dekho:</p>
<pre class="out">AUTO01$ grep -n except netbackup.py
11:from nkmiko.exceptions import NetmikoAuthenticationException, NetmikoTimeoutException
43:    except NetmikoAuthenticationException as err:</pre>
<p>Tool dono error types import karta hai (line 11) par pakadta sirf ek hai (line 43). <code>try</code> block risky code chalata hai; <code>except</code> block batata hai ki naam wale error par kya karna hai. Doosra type bhi jodo, parentheses mein jode ki tarah:</p>
<pre class="out">AUTO01$ sed -i 's/except NetmikoAuthenticationException as err/except (NetmikoAuthenticationException, NetmikoTimeoutException) as err/' netbackup.py
AUTO01$ python3 netbackup.py; echo "exit code: $?"
2 saved, 1 failed
<span class="hl">exit code: 1</span></pre>
<p>Ab run poora hota hai: do routers save, ek fail, koi traceback nahi. <code>except</code> ke andar script problem log karti hai, <code>failed</code> mein ek jodti hai aur <code>continue</code> se agle device par jaati hai. Aakhir mein <code>sys.exit(1 if failed else 0)</code> kuch fail hone par exit code 1 deta hai, taaki cron ya monitoring tool dekh sake. "Aage badho, par sach batao" yahi pattern hai.</p>

<div class="eg"><p><b>Worked example.</b> Fail hue backup ke liye kaaranon ka order: 1) traceback device aur error ka naam batata hai; 2) timeout ka matlab reachability check karo, ping aur us router par interface state se; 3) authentication ka matlab account check karo; 4) file error ka matlab paths check karo, aur cron mein absolute paths; 5) fix ke baad log aur <code>echo $?</code> se confirm karo.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Bade scripts mein do asli Python tools madad karte hain: <code>python3 -m pdb script.py</code> built-in step-by-step debugger shuru karta hai, aur <code>python3 -X dev script.py</code> extra checks on karta hai. <code>Exception</code> pakadna ya akela <code>except:</code> asli bugs chhupa deta hai; hamesha woh errors naam se pakdo jinki umeed ho. Lab tool password sirf placeholder ki tarah code mein rakhta hai; asli tools use environment ya vault se padhte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Traceback ka neeche ki jagah upar ka hissa padhna. Teen cheezein ek saath badalna. Akele <code>except</code> se har error chupchaap pakadna. Error nigalkar bhi exit code 0 dena. Lab copy ki jagah production devices par debug karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>KeyError</code> missing dictionary key hai; <code>IndexError</code> aisi list position hai jo exist nahi karti; <code>FileNotFoundError</code> galat path hai; <code>ModuleNotFoundError</code> missing package hai. Chaaron naam se yaad rakho.</p></div>

<div class="scn"><h4>Pachaas devices, ek mara hua</h4><p>Ek configuration collector 50 mein se 17ve device par crash hui aur baaki 33 ko kabhi chhua nahi. Device call ko try/except mein lapetne, failure log karne aur aage badhne se poora run mila aur jaanch ke liye failed devices ki chhoti list.</p><p><b>Lesson:</b> ek failure ko unchaas safaltaayein kabhi nahi chhupani chahiye.</p></div>

<div class="iv"><p class="q">"Fail hoti Python script ko debug kaise karte ho?"</p><p>Traceback ki aakhri line se error type aur message padhta hoon, uske upar ki file aur line par jaata hoon, shaamil values print karta hoon, ek cheez badalta hoon aur dobara chalata hoon. Device timeout jaise expected failures ke liye naam wala <code>except</code> use karta hoon, log karta hoon, aage badhta hoon, aur aakhir mein non-zero exit code deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aakhri line diagnosis hai; upar ka line number batata hai kahan.</li>
<li>Values print karo ki asal mein kya hai; ek-ek cheez fix karo.</li>
<li>Naam wale errors ke saath <code>try</code> aur <code>except</code> run ko chalta rakhte hain.</li>
<li>Kuch fail ho to 1 se exit karo, sab theek ho to 0.</li>
</ul></div>
`}};export{e as default};