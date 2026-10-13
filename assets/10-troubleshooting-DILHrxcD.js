var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: four thread bugs in threaded.py (Lab 2)`,hi:`Troubleshooting workflow: threaded.py ke chaar thread bugs (Lab 2)`},body:{en:`
<p><b>The idea of this chapter:</b> threaded scripts fail in quiet ways. They often do not crash; they report too few results, take too long or finish "successfully" with devices missing. The cure is a routine: look at the <b>count</b>, look at the <b>clock</b>, read the <b>last line</b> of any traceback, and change <b>one thing at a time</b>. You will apply it to Lab 2, the file <code>threaded.py</code>.</p>

<h3>Analogy: a triage nurse</h3>
<p>A nurse does not guess a diagnosis from across the room. She checks pulse, temperature and breathing, in the same order every time. For thread bugs the three vital signs are: <b>how many results came back</b>, <b>how long it took</b>, and <b>what the last error line says</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Five-step workflow: run, count, time, read error, fix one thing">
<rect x="10" y="30" width="112" height="70" rx="10" fill="#bae6fd"/><text x="66" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Run it</text><text x="66" y="76" text-anchor="middle" class="svg-muted" font-size="10">read all output</text>
<rect x="136" y="30" width="112" height="70" rx="10" fill="#fde68a"/><text x="192" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Count</text><text x="192" y="76" text-anchor="middle" class="svg-muted" font-size="10">every device?</text>
<rect x="262" y="30" width="112" height="70" rx="10" fill="#ddd6fe"/><text x="318" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Clock</text><text x="318" y="76" text-anchor="middle" class="svg-muted" font-size="10">did waits overlap?</text>
<rect x="388" y="30" width="112" height="70" rx="10" fill="#fecaca"/><text x="444" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Last line</text><text x="444" y="76" text-anchor="middle" class="svg-muted" font-size="10">of the traceback</text>
<rect x="514" y="30" width="116" height="70" rx="10" fill="#bbf7d0"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Fix one</text><text x="572" y="76" text-anchor="middle" class="svg-muted" font-size="10">then rerun</text>
<line x1="122" y1="65" x2="136" y2="65" stroke="#64748b" stroke-width="2"/><line x1="248" y1="65" x2="262" y2="65" stroke="#64748b" stroke-width="2"/><line x1="374" y1="65" x2="388" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="514" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">the same routine for every thread problem</text>
</svg><p class="cap">Count, clock, last line, one change.</p></div>

<h3>Symptom to likely cause</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th></tr>
<tr><td>Total time equals the sum of the waits</td><td>Nothing ran in parallel: the function was called instead of passed, or each thread is joined right after it starts</td></tr>
<tr><td>"0 results" or too few results</td><td>The main thread read the results before the threads finished: missing <code>join</code></td></tr>
<tr><td><code>ValueError: max_workers must be greater than 0</code></td><td>Pool created with zero (or a negative) number of workers</td></tr>
<tr><td>Output stops after a few devices with a worker's exception</td><td><code>pool.map</code> re-raised the exception and ended the loop</td></tr>
<tr><td>Script "succeeds" but a device is missing</td><td>A plain thread died; its traceback scrolled by</td></tr>
<tr><td>Hangs at the end</td><td>Missing <code>task_done()</code>, or a worker waiting on an empty queue</td></tr>
<tr><td>Totals wrong only sometimes</td><td>A race on shared data; add a lock or stop sharing</td></tr></table>

<h3>Lab 2: meet threaded.py</h3>
<p>On AUTO01, <code>threaded.py</code> polls the five routers twice: first with hand-made threads, then with a pool. Print the middle of it with line numbers. The command <code>grep -n "" file</code> numbers every line, blank ones too, which matches the numbers in tracebacks and in the lab's <code>insert</code> helper. (The shorter <code>nl</code> skips blank lines, so its numbers drift.)</p>
<pre class="out">AUTO01$ grep -n "" threaded.py | sed -n 20,36p
20:start = time.time()
<span class="hl">21:threads = [Thread(target=worker(ip)) for ip in IPS]</span>
22:for t in threads:
23:    t.start()
24:print(len(results), "results from manual threads")
25:print(f"manual threads: {time.time() - start:.0f}s")
26:
27:
28:def check(ip):
29:    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026", conn_timeout=3)
30:    name = conn.find_prompt().rstrip("#&gt;")
31:    conn.disconnect()
32:    return ip, name
33:
34:
<span class="hl">35:with ThreadPoolExecutor(max_workers=0) as pool:</span>
36:    for ip, name in pool.map(check, IPS):</pre>
<p>Lines 21 and 35 are already suspicious, but do not fix by reading alone. Run first and let the symptoms lead.</p>

<h3>Step 1: run it, then count and time (task 1)</h3>
<pre class="out">AUTO01$ python3 threaded.py
<span class="hl">5 results from manual threads</span>
<span class="hl">manual threads: 6s</span>
Traceback (most recent call last):
  File "threaded.py", line 35, in &lt;module&gt;
    with ThreadPoolExecutor(max_workers=0) as pool:
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 120, in __init__
    raise ValueError("max_workers must be greater than 0")
ValueError: max_workers must be greater than 0</pre>
<p>Count: 5 of 5, fine. Clock: <b>6 s</b>. Five polls in parallel with <code>conn_timeout=3</code> should take about 3 s, the length of the dead router's timeout. Six seconds means the polls ran one after another. That is the answer to task 1.</p>

<h3>Bug 1: the function was called, not passed (task 2)</h3>
<p><code>Thread(target=worker(ip))</code> runs <code>worker(ip)</code> right now in the main thread, which is why the time is a sequence of waits. The thread receives <code>None</code> and does nothing. Pass the function and the arguments separately:</p>
<pre class="code">sed -i 's/Thread(target=worker(ip))/Thread(target=worker, args=(ip,))/' threaded.py
python3 threaded.py</pre>
<pre class="out">AUTO01$ python3 threaded.py
<span class="hl">0 results from manual threads</span>
manual threads: 0s
Traceback (most recent call last):
  File "threaded.py", line 35, in &lt;module&gt;
    with ThreadPoolExecutor(max_workers=0) as pool:
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 120, in __init__
    raise ValueError("max_workers must be greater than 0")
ValueError: max_workers must be greater than 0</pre>
<p>The threads now start, but the count is <b>0</b> and the time <b>0 s</b>. The main thread did not wait. A fix that makes the output look worse is normal: the first bug was hiding the second.</p>

<h3>Bug 2: no join (task 3)</h3>
<p>Between the start loop and the print, add a second loop that joins every thread. The lab's <code>insert</code> helper puts a line before the given line number:</p>
<pre class="code">insert threaded.py 24 for t in threads:
insert threaded.py 25     t.join()
python3 threaded.py</pre>
<p>Note the second insert starts with four spaces for the indent. The block now reads:</p>
<pre class="out">20:start = time.time()
21:threads = [Thread(target=worker, args=(ip,)) for ip in IPS]
22:for t in threads:
23:    t.start()
<span class="hl">24:for t in threads:</span>
<span class="hl">25:    t.join()</span>
26:print(len(results), "results from manual threads")
27:print(f"manual threads: {time.time() - start:.0f}s")</pre>
<pre class="out">AUTO01$ python3 threaded.py
<span class="hl">5 results from manual threads</span>
<span class="hl">manual threads: 3s</span>
Traceback (most recent call last):
  File "threaded.py", line 37, in &lt;module&gt;
    with ThreadPoolExecutor(max_workers=0) as pool:
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 120, in __init__
    raise ValueError("max_workers must be greater than 0")
ValueError: max_workers must be greater than 0</pre>
<p>Five results and 3 s: the manual-threads half is correct. Remember the two loops: <b>start all, then join all</b>.</p>

<h3>Bug 3: a pool with no workers (task 4)</h3>
<p>The last line of the traceback names the problem: <code>max_workers must be greater than 0</code>. A pool must have at least one worker. The line number moved from 35 to 37 because we inserted two lines. Fix and run:</p>
<pre class="code">sed -i 's/max_workers=0/max_workers=5/' threaded.py
python3 threaded.py</pre>
<pre class="out">AUTO01$ python3 threaded.py
5 results from manual threads
manual threads: 3s
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
Traceback (most recent call last):
  File "threaded.py", line 39, in &lt;module&gt;
    print(ip, name)
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 55, in __next__
    return f.result()
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 29, in result
    raise self._value
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios 10.99.0.3:22
(connection timed out)</pre>

<h3>Bug 4: the exception escapes the loop (tasks 5 and 6)</h3>
<p>Routers 1 and 2 print, then the loop meets the dead router 3 and <code>pool.map</code> re-raises its <b>NetmikoTimeoutException</b>. Routers 4 and 5 are never printed, though their threads finished fine. This is the exam trap from chapter 6. Catch the failure <b>inside the worker</b> and return a result. Replace <code>check</code> and the pool block, keeping the first 29 lines:</p>
<pre class="code">head -29 threaded.py &gt; new.py
cat &gt;&gt; new.py &lt;&lt;'EOF'
def check(ip):
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026", conn_timeout=3)
        name = conn.find_prompt().rstrip("#&gt;")
        conn.disconnect()
        return ip, name
    except (NetmikoTimeoutException, NetmikoAuthenticationException) as err:
        return ip, type(err).__name__


with ThreadPoolExecutor(max_workers=5) as pool:
    for ip, name in pool.map(check, IPS):
        print(ip, name)
EOF
mv new.py threaded.py
python3 threaded.py</pre>
<pre class="out">AUTO01$ python3 threaded.py
5 results from manual threads
manual threads: 3s
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
<span class="hl">10.99.0.3 NetmikoTimeoutException</span>
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5</pre>
<p>All five routers print, the dead one with the exception name, and the manual part still finishes in 3 s. Check the three vital signs: count 5 and 5, clock 3 s, no traceback.</p>

<div class="eg"><p><b>Worked example.</b> Summary of Lab 2: (1) <code>target=worker(ip)</code> became <code>target=worker, args=(ip,)</code>; (2) a <code>join</code> loop was added; (3) <code>max_workers=0</code> became 5; (4) <code>check</code> now catches the two expected exceptions and returns a status. Four bugs, six tasks, one change each time.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once, so you cannot tell which fixed what. Trusting "it did not crash" as success without counting results. Fixing the symptom (printing a message) instead of the cause. Forgetting that the line numbers shift after an insert.</p></div>
<div class="exam"><p><b>Exam trap.</b> The time is evidence. If a threaded run takes as long as a sequential one, something forced the work to run in one thread. If the count is low, suspect a missing <code>join</code>. If a pool loop stops early with a device exception, suspect <code>pool.map</code> and catch inside the worker.</p></div>

<div class="scn"><h4>Friday's report with four missing branches</h4><p>A report script printed "collected 46 of 50" and nobody knew why. The engineer applied the routine: count (46), clock (fine), last error line in the log (<code>NetmikoAuthenticationException</code> four times). A password rotation had missed four branch routers. The threads were innocent; the worker had caught the exception, returned a status row, and the summary listed the four failed IPs so the fix took minutes.</p><p><b>Lesson:</b> a good thread design turns a mystery into a list.</p></div>

<div class="iv"><p class="q">"A threaded script that used to work now prints fewer results than devices. How do you debug it?"</p><p>I count the results against the device list, check the elapsed time to see whether the work really overlapped, and read the last line of any traceback. Fewer results usually mean a missing <code>join</code>, an exception that ended a <code>pool.map</code> loop, or a thread that died quietly. I change one thing at a time and rerun, and I make workers return a status for every device so the summary shows which ones failed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check count, clock and the last traceback line before touching code.</li>
<li>Fix one bug at a time; one bug can hide the next.</li>
<li>Lab 2 bugs: called instead of passed, missing join, <code>max_workers=0</code>, exception escaping <code>pool.map</code>.</li>
<li>Total time equal to the sum of the waits means no real parallelism.</li>
<li>Catch expected exceptions inside the worker and return a status.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> threaded scripts chupchaap fail hoti hain. Woh aksar crash nahi hoti; kam results report karti hain, zyada time leti hain ya devices gayab hone ke baad bhi "kamyab" khatam hoti hain. Ilaj ek routine hai: <b>ginti</b> dekho, <b>clock</b> dekho, kisi bhi traceback ki <b>aakhri line</b> padho, aur <b>ek waqt mein ek cheez</b> badlo. Aap ise Lab 2 par lagaoge, file <code>threaded.py</code>.</p>

<h3>Analogy: triage nurse</h3>
<p>Nurse door se hi diagnosis ka andaaza nahi lagati. Woh nabz, temperature aur saans har baar ek hi order mein dekhti hai. Thread bugs ke liye teen vital signs hain: <b>kitne results wapas aaye</b>, <b>kitna time laga</b>, aur <b>aakhri error line kya kehti hai</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Paanch step workflow: run, ginti, time, error padho, ek cheez theek karo">
<rect x="10" y="30" width="112" height="70" rx="10" fill="#bae6fd"/><text x="66" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 Chalao</text><text x="66" y="76" text-anchor="middle" class="svg-muted" font-size="10">poora output padho</text>
<rect x="136" y="30" width="112" height="70" rx="10" fill="#fde68a"/><text x="192" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 Ginti</text><text x="192" y="76" text-anchor="middle" class="svg-muted" font-size="10">har device?</text>
<rect x="262" y="30" width="112" height="70" rx="10" fill="#ddd6fe"/><text x="318" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 Clock</text><text x="318" y="76" text-anchor="middle" class="svg-muted" font-size="10">intezaar overlap hue?</text>
<rect x="388" y="30" width="112" height="70" rx="10" fill="#fecaca"/><text x="444" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 Aakhri line</text><text x="444" y="76" text-anchor="middle" class="svg-muted" font-size="10">traceback ki</text>
<rect x="514" y="30" width="116" height="70" rx="10" fill="#bbf7d0"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="12">5 Ek theek karo</text><text x="572" y="76" text-anchor="middle" class="svg-muted" font-size="10">phir dobara chalao</text>
<line x1="122" y1="65" x2="136" y2="65" stroke="#64748b" stroke-width="2"/><line x1="248" y1="65" x2="262" y2="65" stroke="#64748b" stroke-width="2"/><line x1="374" y1="65" x2="388" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="514" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">har thread samasya ke liye wahi routine</text>
</svg><p class="cap">Ginti, clock, aakhri line, ek badlav.</p></div>

<h3>Symptom se sambhavit wajah tak</h3>
<table class="cmp"><tr><th>Aap kya dekhte ho</th><th>Sambhavit wajah</th></tr>
<tr><td>Total time intezaaron ke jod ke barabar</td><td>Kuch parallel nahi chala: function pass karne ki jagah call hua, ya har thread start ke turant baad join hua</td></tr>
<tr><td>"0 results" ya kam results</td><td>Main thread ne threads ke khatam hone se pehle results padhe: <code>join</code> missing</td></tr>
<tr><td><code>ValueError: max_workers must be greater than 0</code></td><td>Pool zero (ya negative) workers ke saath bana</td></tr>
<tr><td>Kuch devices ke baad worker ke exception ke saath output ruk jaata hai</td><td><code>pool.map</code> ne exception dobara raise kiya aur loop khatam kar diya</td></tr>
<tr><td>Script "kamyab" par ek device gayab</td><td>Plain thread mar gaya; uska traceback scroll ho gaya</td></tr>
<tr><td>Ant mein hang</td><td><code>task_done()</code> missing, ya worker khaali queue par ruka hai</td></tr>
<tr><td>Totals kabhi-kabhi galat</td><td>Shared data par race; lock lagao ya share karna band karo</td></tr></table>

<h3>Lab 2: threaded.py se milo</h3>
<p>AUTO01 par <code>threaded.py</code> paanchon routers ko do baar poll karti hai: pehle haath se bane threads se, phir pool se. Uska beech ka hissa line numbers ke saath print karo. Command <code>grep -n "" file</code> har line ko number deta hai, khaali lines ko bhi, jo tracebacks aur lab ke <code>insert</code> helper ke numbers se match karta hai. (Chhota <code>nl</code> khaali lines chhod deta hai, isliye uske numbers khisak jaate hain.)</p>
<pre class="out">AUTO01$ grep -n "" threaded.py | sed -n 20,36p
20:start = time.time()
<span class="hl">21:threads = [Thread(target=worker(ip)) for ip in IPS]</span>
22:for t in threads:
23:    t.start()
24:print(len(results), "results from manual threads")
25:print(f"manual threads: {time.time() - start:.0f}s")
26:
27:
28:def check(ip):
29:    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026", conn_timeout=3)
30:    name = conn.find_prompt().rstrip("#&gt;")
31:    conn.disconnect()
32:    return ip, name
33:
34:
<span class="hl">35:with ThreadPoolExecutor(max_workers=0) as pool:</span>
36:    for ip, name in pool.map(check, IPS):</pre>
<p>Line 21 aur 35 pehle se shaky dikhti hain, par sirf padhkar fix mat karo. Pehle chalao aur symptoms ko raasta dikhane do.</p>

<h3>Step 1: chalao, phir ginti aur time (task 1)</h3>
<pre class="out">AUTO01$ python3 threaded.py
<span class="hl">5 results from manual threads</span>
<span class="hl">manual threads: 6s</span>
Traceback (most recent call last):
  File "threaded.py", line 35, in &lt;module&gt;
    with ThreadPoolExecutor(max_workers=0) as pool:
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 120, in __init__
    raise ValueError("max_workers must be greater than 0")
ValueError: max_workers must be greater than 0</pre>
<p>Ginti: 5 mein se 5, theek. Clock: <b>6 s</b>. <code>conn_timeout=3</code> ke saath paanch parallel polls lagbhag 3 s lene chahiye, band router ke timeout jitna. Chhe second ka matlab polls ek ke baad ek chale. Task 1 ka jawab yahi hai.</p>

<h3>Bug 1: function call hua, pass nahi (task 2)</h3>
<p><code>Thread(target=worker(ip))</code> <code>worker(ip)</code> ko abhi main thread mein chalata hai, isliye time intezaaron ka silsila hai. Thread ko <code>None</code> milta hai aur woh kuch nahi karta. Function aur arguments alag do:</p>
<pre class="code">sed -i 's/Thread(target=worker(ip))/Thread(target=worker, args=(ip,))/' threaded.py
python3 threaded.py</pre>
<pre class="out">AUTO01$ python3 threaded.py
<span class="hl">0 results from manual threads</span>
manual threads: 0s
Traceback (most recent call last):
  File "threaded.py", line 35, in &lt;module&gt;
    with ThreadPoolExecutor(max_workers=0) as pool:
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 120, in __init__
    raise ValueError("max_workers must be greater than 0")
ValueError: max_workers must be greater than 0</pre>
<p>Threads ab start hote hain, par ginti <b>0</b> aur time <b>0 s</b> hai. Main thread ne intezaar nahi kiya. Aisa fix jo output ko bura dikhaye, normal hai: pehla bug doosre ko chhupa raha tha.</p>

<h3>Bug 2: join nahi (task 3)</h3>
<p>Start loop aur print ke beech ek doosra loop jodo jo har thread ko join kare. Lab ka <code>insert</code> helper diye gaye line number se pehle line daalta hai:</p>
<pre class="code">insert threaded.py 24 for t in threads:
insert threaded.py 25     t.join()
python3 threaded.py</pre>
<p>Dhyan do ki doosra insert indent ke liye chaar spaces se shuru hota hai. Block ab aisa padhta hai:</p>
<pre class="out">20:start = time.time()
21:threads = [Thread(target=worker, args=(ip,)) for ip in IPS]
22:for t in threads:
23:    t.start()
<span class="hl">24:for t in threads:</span>
<span class="hl">25:    t.join()</span>
26:print(len(results), "results from manual threads")
27:print(f"manual threads: {time.time() - start:.0f}s")</pre>
<pre class="out">AUTO01$ python3 threaded.py
<span class="hl">5 results from manual threads</span>
<span class="hl">manual threads: 3s</span>
Traceback (most recent call last):
  File "threaded.py", line 37, in &lt;module&gt;
    with ThreadPoolExecutor(max_workers=0) as pool:
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 120, in __init__
    raise ValueError("max_workers must be greater than 0")
ValueError: max_workers must be greater than 0</pre>
<p>Paanch results aur 3 s: manual-threads wala aadha hissa ab sahi hai. Do loops yaad rakho: <b>sab start karo, phir sab join karo</b>.</p>

<h3>Bug 3: bina workers ka pool (task 4)</h3>
<p>Traceback ki aakhri line samasya ka naam batati hai: <code>max_workers must be greater than 0</code>. Pool mein kam se kam ek worker chahiye. Line number 35 se 37 ho gaya kyunki humne do lines daali. Fix karo aur chalao:</p>
<pre class="code">sed -i 's/max_workers=0/max_workers=5/' threaded.py
python3 threaded.py</pre>
<pre class="out">AUTO01$ python3 threaded.py
5 results from manual threads
manual threads: 3s
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
Traceback (most recent call last):
  File "threaded.py", line 39, in &lt;module&gt;
    print(ip, name)
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 55, in __next__
    return f.result()
  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 29, in result
    raise self._value
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios 10.99.0.3:22
(connection timed out)</pre>

<h3>Bug 4: exception loop se bahar nikal gaya (tasks 5 aur 6)</h3>
<p>Routers 1 aur 2 print hote hain, phir loop band router 3 se milta hai aur <code>pool.map</code> uska <b>NetmikoTimeoutException</b> dobara raise karta hai. Routers 4 aur 5 kabhi print nahi hote, jabki unke threads theek khatam hue the. Yeh chapter 6 ka exam trap hai. Failure ko <b>worker ke andar</b> pakdo aur result return karo. Pehli 29 lines rakhkar <code>check</code> aur pool block badlo:</p>
<pre class="code">head -29 threaded.py &gt; new.py
cat &gt;&gt; new.py &lt;&lt;'EOF'
def check(ip):
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026", conn_timeout=3)
        name = conn.find_prompt().rstrip("#&gt;")
        conn.disconnect()
        return ip, name
    except (NetmikoTimeoutException, NetmikoAuthenticationException) as err:
        return ip, type(err).__name__


with ThreadPoolExecutor(max_workers=5) as pool:
    for ip, name in pool.map(check, IPS):
        print(ip, name)
EOF
mv new.py threaded.py
python3 threaded.py</pre>
<pre class="out">AUTO01$ python3 threaded.py
5 results from manual threads
manual threads: 3s
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
<span class="hl">10.99.0.3 NetmikoTimeoutException</span>
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5</pre>
<p>Paanchon routers print hote hain, band wala exception ke naam ke saath, aur manual hissa phir bhi 3 s mein khatam hota hai. Teen vital signs check karo: ginti 5 aur 5, clock 3 s, koi traceback nahi.</p>

<div class="eg"><p><b>Worked example.</b> Lab 2 ka saar: (1) <code>target=worker(ip)</code> <code>target=worker, args=(ip,)</code> bana; (2) <code>join</code> loop joda gaya; (3) <code>max_workers=0</code> se 5 hua; (4) <code>check</code> ab do expected exceptions pakadta hai aur status return karta hai. Chaar bugs, chhe tasks, har baar ek badlav.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath teen cheezein badalna, jisse pata nahi chalta kisne kya theek kiya. "Crash nahi hua" ko success maan lena bina results ginne ke. Karan ki jagah symptom theek karna (message print kar dena). Yeh bhoolna ki insert ke baad line numbers khisak jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Time saboot hai. Threaded run sequential jitna time le to kisi cheez ne kaam ko ek thread mein chalne par majboor kiya. Ginti kam ho to missing <code>join</code> par shak karo. Pool loop device exception ke saath jaldi ruk jaye to <code>pool.map</code> par shak karo aur worker ke andar pakdo.</p></div>

<div class="scn"><h4>Shukrawar ki report jisme chaar branch gayab the</h4><p>Ek report script ne "collected 46 of 50" print kiya aur kisi ko wajah nahi pata thi. Engineer ne routine lagayi: ginti (46), clock (theek), log ki aakhri error line (<code>NetmikoAuthenticationException</code> chaar baar). Password rotation chaar branch routers ko chhod gayi thi. Threads begunah the; worker ne exception pakda tha, status row return ki thi, aur summary ne chaar failed IPs list kiye, isliye fix minutes mein ho gaya.</p><p><b>Lesson:</b> achha thread design rahasya ko list bana deta hai.</p></div>

<div class="iv"><p class="q">"Ek threaded script jo pehle chalti thi ab devices se kam results print karti hai. Kaise debug karoge?"</p><p>Main results ko device list se ginta hoon, elapsed time dekhta hoon ki kaam sach mein overlap hua ya nahi, aur kisi bhi traceback ki aakhri line padhta hoon. Kam results aam taur par missing <code>join</code>, <code>pool.map</code> loop ko khatam karne wala exception, ya chupchaap mara thread hote hain. Main ek waqt mein ek cheez badalta hoon aur dobara chalata hoon, aur workers se har device ka status return karwata hoon taaki summary dikhaye kaun fail hue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Code chhune se pehle ginti, clock aur aakhri traceback line dekho.</li>
<li>Ek waqt mein ek bug theek karo; ek bug agle ko chhupa sakta hai.</li>
<li>Lab 2 bugs: call hua pass nahi, join missing, <code>max_workers=0</code>, <code>pool.map</code> se bahar nikalta exception.</li>
<li>Total time intezaaron ke jod ke barabar ho to asli parallelism nahi hai.</li>
<li>Expected exceptions worker ke andar pakdo aur status return karo.</li>
</ul></div>
`}};export{e as default};