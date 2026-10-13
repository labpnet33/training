var e={id:`errors-timeouts`,h:{en:`Errors and timeouts inside a pool`,hi:`Pool ke andar errors aur timeouts`},body:{en:`
<p><b>The idea of this chapter:</b> in a fleet of devices something is always broken. A good threaded script treats a dead router as one more result, not as a disaster. You will learn where an exception goes when it happens inside a thread, three ways to deal with it, and how to stop waiting ten seconds for a router that is not there.</p>

<h3>Analogy: the dropped plate</h3>
<p>One waiter drops a plate. A good restaurant does not close the kitchen. The waiter reports "table 3: plate dropped", the others carry on, and the manager reads the list of problems at closing time. A bad restaurant lets the crash echo through the hall and nobody knows what was served.</p>

<h3>Where does the exception go?</h3>
<p>When a job submitted to a pool raises an exception, the pool does not crash. The exception is <b>stored inside the Future</b> and raised again when you call <code>fut.result()</code>. You can also look at it quietly with <code>fut.exception()</code>, which returns the exception object or <code>None</code>.</p>
<pre class="code">with ThreadPoolExecutor(max_workers=2) as pool:
    bad = pool.submit(check, "10.99.0.3")
    good = pool.submit(check, "10.99.0.1")
    print(type(bad.exception()).__name__, bad.done())
    print(good.exception(), good.result())</pre>
<pre class="out">AUTO01$ python3 peek.py
<span class="hl">NetmikoTimeoutException True</span>
None PUN-CORE-R1#</pre>
<p>If nobody ever calls <code>result()</code> or <code>exception()</code>, a failure disappears without a trace. That silence is the number one pool mistake.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="An exception in a worker is stored in the Future and raised at result">
<rect x="20" y="30" width="160" height="60" rx="10" fill="#bae6fd"/><text x="100" y="56" text-anchor="middle" class="svg-ink" font-size="13">worker thread</text><text x="100" y="76" text-anchor="middle" class="svg-muted" font-size="11">check("10.99.0.3") raises</text>
<rect x="250" y="30" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">Future</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">stores the exception</text>
<rect x="460" y="30" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="56" text-anchor="middle" class="svg-ink" font-size="13">main thread</text><text x="540" y="76" text-anchor="middle" class="svg-muted" font-size="11">fut.result() re-raises</text>
<line x1="180" y1="60" x2="250" y2="60" stroke="#64748b" stroke-width="2"/><line x1="390" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">put try/except around fut.result(), or catch inside the worker</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="11">not calling result() hides the failure completely</text>
</svg><p class="cap">The exception waits in the Future until someone asks.</p></div>

<h3>Pattern A: catch around result()</h3>
<pre class="code">failed = []
with ThreadPoolExecutor(max_workers=5) as pool:
    futs = {pool.submit(check, ip): ip for ip in IPS}
    for fut in as_completed(futs):
        ip = futs[fut]
        try:
            _, name = fut.result()
            print(ip, "ok", name)
        except NetmikoTimeoutException as err:
            failed.append(ip)
            print(ip, "FAILED", type(err).__name__)
print(len(failed), "failed:", failed)</pre>
<p>Here <code>check</code> has no <code>try</code> of its own. The dictionary <code>futs</code> maps each future to its address, so when a future fails we still know which router it was. Only the named exception is caught; a typing mistake in your code would still show up.</p>
<pre class="out">AUTO01$ python3 errors.py
10.99.0.1 ok PUN-CORE-R1
10.99.0.2 ok BLR-EDGE-R2
10.99.0.4 ok DEL-EDGE-R4
10.99.0.5 ok MUM-EDGE-R5
<span class="hl">10.99.0.3 FAILED NetmikoTimeoutException</span>
<span class="hl">1 failed: ['10.99.0.3']</span></pre>

<h3>Pattern B: catch inside the worker</h3>
<p>The lab's <code>poll.py</code> does this: the worker catches the two expected network errors and <b>returns</b> a status instead of raising. Every job then produces a normal result, and <code>pool.map</code> is safe to use. Choose pattern B when failure is an ordinary answer, as with a dead router, and pattern A when you want a stack trace for the unexpected. In both, catch <b>named</b> exceptions, never a bare <code>except</code>.</p>

<h3>The silent death of a plain Thread</h3>
<p>Exceptions in a hand-made <code>Thread</code> do not reach the main thread at all. Python prints a traceback and the thread simply ends:</p>
<pre class="out">AUTO01$ python3 threadfail.py
ok 10.99.0.1
Exception in thread Thread-2 (worker):
Traceback (most recent call last):
  File "threadfail.py", line 6, in worker
    raise ValueError("cannot reach " + ip)
ValueError: cannot reach 10.99.0.3
ok 10.99.0.4
<span class="hl">main finished normally</span></pre>
<p>"main finished normally" is a lie: one device failed. Plain threads need their own <code>try/except</code> that records the failure in a shared structure. This is one reason pools are preferred.</p>

<h3>Timeouts: three different things</h3>
<ol>
<li><b>The connect timeout</b> says how long a single login may wait. In <code>nkmiko</code> it is <code>conn_timeout</code>, and the default in <code>poll.py</code> is 10 s. This is the fix for Lab 1, task 5:</li>
</ol>
<pre class="code">sed -i 's/password="NK@2026")/password="NK@2026", conn_timeout=3)/' poll.py</pre>
<pre class="out">AUTO01$ python3 parallel.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
10.99.0.3 NetmikoTimeoutException
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5
<span class="hl">elapsed: 3.0s</span></pre>
<p>The whole job now takes the length of one connect timeout. Pick a value a healthy device will never exceed, such as 3 to 5 s on a campus LAN, and longer for slow WAN links.</p>
<ol start="2">
<li><b>The result timeout</b>, <code>fut.result(timeout=2)</code>, says how long <i>you</i> are willing to wait for an answer. When it expires you get <code>TimeoutError</code>, but <b>the worker keeps running</b>. Python cannot kill a thread.</li>
<li><b>The pool shutdown.</b> Leaving the <code>with</code> block waits for every worker, so a long job still holds up the end of the script.</li>
</ol>
<p>This script (run with the original ten-second <code>poll.py</code>) shows items 2 and 3 together:</p>
<pre class="code">t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=5) as pool:
    fut = pool.submit(poll, "10.99.0.3")
    try:
        fut.result(timeout=2)
    except TimeoutError:
        print(f"gave up waiting after {time.perf_counter() - t0:.1f}s, done={fut.done()}")
print(f"with block left after {time.perf_counter() - t0:.1f}s")
print(fut.result())</pre>
<pre class="out">AUTO01$ python3 giveup.py
<span class="hl">gave up waiting after 2.0s, done=False</span>
<span class="hl">with block left after 10.0s</span>
('10.99.0.3', 'NetmikoTimeoutException')</pre>
<p>We gave up after 2 s, yet the script ended at 10 s, because the poll was still running and the <code>with</code> block waited for it. A result timeout controls your patience, not the worker. To really bound the work, set the timeout where the work happens: <code>conn_timeout</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Never calling <code>result()</code> so failures vanish. Catching <code>Exception</code> and printing nothing. Believing <code>result(timeout=...)</code> cancels the job. Setting a connect timeout so short that healthy but slow devices are reported as down. Forgetting that <code>cancel()</code> only works on jobs that have not started yet.</p></div>
<div class="exam"><p><b>Exam trap.</b> With <code>pool.map</code>, a worker's exception is raised in the loop when the loop reaches that result, and the loop stops there; later results are never printed. Catch inside the worker, or use <code>submit</code> and handle each future. (Lab 2 shows this live.)</p></div>

<div class="scn"><h4>The nightly run that "succeeded"</h4><p>A script used plain threads to collect <code>show version</code> from 80 devices and always exited with code 0. For weeks nobody noticed that three branch routers were missing from the report: their threads died with a traceback at the top of a log nobody read. The fix was a worker-level <code>try/except</code> that recorded failures, a summary line "77 ok, 3 failed: [...]" and a non-zero exit code when anything failed.</p><p><b>Lesson:</b> a thread that dies quietly looks exactly like success.</p></div>

<div class="iv"><p class="q">"What happens to an exception raised inside a ThreadPoolExecutor job?"</p><p>It is stored in the Future and re-raised when I call <code>result()</code>, or I can read it with <code>exception()</code>. If I never ask, it is silently lost. I either catch named exceptions inside the worker and return a status, or wrap <code>fut.result()</code> in <code>try/except</code>, and I report the failed devices at the end.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pool exceptions live in the Future and surface at <code>result()</code>; unread failures are invisible.</li>
<li>Catch named exceptions in the worker (return a status) or around <code>fut.result()</code>.</li>
<li>A raw thread that raises prints a traceback and dies while the main program carries on.</li>
<li><code>conn_timeout</code> bounds the work; <code>result(timeout=)</code> only bounds your wait, and the pool still waits at the end.</li>
<li>Report failures in a summary and in the exit code.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> devices ke bade fleet mein hamesha kuch na kuch toota rehta hai. Achhi threaded script band router ko aur ek result ki tarah leti hai, museebat ki tarah nahi. Aap seekhoge ki thread ke andar exception hone par woh kahan jaata hai, usse nipatne ke teen tareeke, aur aise router ke liye dus second intezaar kaise band karein jo hai hi nahi.</p>

<h3>Analogy: gira hua plate</h3>
<p>Ek waiter se plate gir gayi. Achha restaurant kitchen band nahi karta. Waiter report karta hai "table 3: plate gir gayi", baaki kaam karte rehte hain, aur manager closing par samasyaon ki list padhta hai. Bura restaurant crash ko hall mein goonjne deta hai aur kisi ko pata nahi ki kya serve hua.</p>

<h3>Exception kahan jaata hai?</h3>
<p>Pool ko di hui job exception raise kare to pool crash nahi hota. Exception <b>Future ke andar store</b> hota hai aur <code>fut.result()</code> call karne par dobara raise hota hai. Aap use chupchaap <code>fut.exception()</code> se bhi dekh sakte ho, jo exception object ya <code>None</code> return karta hai.</p>
<pre class="code">with ThreadPoolExecutor(max_workers=2) as pool:
    bad = pool.submit(check, "10.99.0.3")
    good = pool.submit(check, "10.99.0.1")
    print(type(bad.exception()).__name__, bad.done())
    print(good.exception(), good.result())</pre>
<pre class="out">AUTO01$ python3 peek.py
<span class="hl">NetmikoTimeoutException True</span>
None PUN-CORE-R1#</pre>
<p>Agar koi kabhi <code>result()</code> ya <code>exception()</code> call nahi karta, to failure bina nishaan ke gayab ho jaata hai. Yeh chuppi pool ki number ek galti hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Worker ka exception Future mein store hota hai aur result par raise hota hai">
<rect x="20" y="30" width="160" height="60" rx="10" fill="#bae6fd"/><text x="100" y="56" text-anchor="middle" class="svg-ink" font-size="13">worker thread</text><text x="100" y="76" text-anchor="middle" class="svg-muted" font-size="11">check("10.99.0.3") raise karta hai</text>
<rect x="250" y="30" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">Future</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">exception store karta hai</text>
<rect x="460" y="30" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="56" text-anchor="middle" class="svg-ink" font-size="13">main thread</text><text x="540" y="76" text-anchor="middle" class="svg-muted" font-size="11">fut.result() dobara raise karta hai</text>
<line x1="180" y1="60" x2="250" y2="60" stroke="#64748b" stroke-width="2"/><line x1="390" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">fut.result() ke aaspaas try/except lagao, ya worker ke andar pakdo</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="11">result() call na karna failure ko poori tarah chhupa deta hai</text>
</svg><p class="cap">Exception Future mein tab tak rukta hai jab tak koi poochhe.</p></div>

<h3>Pattern A: result() ke aaspaas pakdo</h3>
<pre class="code">failed = []
with ThreadPoolExecutor(max_workers=5) as pool:
    futs = {pool.submit(check, ip): ip for ip in IPS}
    for fut in as_completed(futs):
        ip = futs[fut]
        try:
            _, name = fut.result()
            print(ip, "ok", name)
        except NetmikoTimeoutException as err:
            failed.append(ip)
            print(ip, "FAILED", type(err).__name__)
print(len(failed), "failed:", failed)</pre>
<p>Yahan <code>check</code> ka apna koi <code>try</code> nahi hai. Dictionary <code>futs</code> har future ko uske address se jodti hai, isliye future fail hone par bhi pata rehta hai ki kaunsa router tha. Sirf naam wala exception pakda jaata hai; aapke code ki typing galti phir bhi dikhegi.</p>
<pre class="out">AUTO01$ python3 errors.py
10.99.0.1 ok PUN-CORE-R1
10.99.0.2 ok BLR-EDGE-R2
10.99.0.4 ok DEL-EDGE-R4
10.99.0.5 ok MUM-EDGE-R5
<span class="hl">10.99.0.3 FAILED NetmikoTimeoutException</span>
<span class="hl">1 failed: ['10.99.0.3']</span></pre>

<h3>Pattern B: worker ke andar pakdo</h3>
<p>Lab ka <code>poll.py</code> yahi karta hai: worker do expected network errors pakadta hai aur raise karne ki jagah status <b>return</b> karta hai. Tab har job normal result deti hai, aur <code>pool.map</code> use karna safe ho jaata hai. Pattern B tab chuno jab failure ek aam jawab ho, jaise band router, aur pattern A tab jab unexpected ke liye stack trace chahiye. Dono mein <b>naam wale</b> exceptions pakdo, kabhi bare <code>except</code> nahi.</p>

<h3>Plain Thread ki chupchaap maut</h3>
<p>Haath se bane <code>Thread</code> ke exceptions main thread tak pahunchte hi nahi. Python traceback print karta hai aur thread bas khatam ho jaata hai:</p>
<pre class="out">AUTO01$ python3 threadfail.py
ok 10.99.0.1
Exception in thread Thread-2 (worker):
Traceback (most recent call last):
  File "threadfail.py", line 6, in worker
    raise ValueError("cannot reach " + ip)
ValueError: cannot reach 10.99.0.3
ok 10.99.0.4
<span class="hl">main finished normally</span></pre>
<p>"main finished normally" jhooth hai: ek device fail hua. Plain threads ko apna <code>try/except</code> chahiye jo failure ko shared structure mein record kare. Pools ke pasandida hone ki yeh ek wajah hai.</p>

<h3>Timeouts: teen alag cheezein</h3>
<ol>
<li><b>Connect timeout</b> batata hai ki ek login kitni der intezaar kar sakta hai. <code>nkmiko</code> mein yeh <code>conn_timeout</code> hai, aur <code>poll.py</code> mein default 10 s hai. Lab 1, task 5 ka fix yahi hai:</li>
</ol>
<pre class="code">sed -i 's/password="NK@2026")/password="NK@2026", conn_timeout=3)/' poll.py</pre>
<pre class="out">AUTO01$ python3 parallel.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
10.99.0.3 NetmikoTimeoutException
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5
<span class="hl">elapsed: 3.0s</span></pre>
<p>Poora job ab ek connect timeout jitna leta hai. Aisi value chuno jo healthy device kabhi paar na kare, jaise campus LAN par 3 se 5 s, aur dheemi WAN links ke liye zyada.</p>
<ol start="2">
<li><b>Result timeout</b>, <code>fut.result(timeout=2)</code>, batata hai ki <i>aap</i> jawab ke liye kitna intezaar karna chahte ho. Khatam hone par <code>TimeoutError</code> milta hai, par <b>worker chalta rehta hai</b>. Python thread ko maar nahi sakta.</li>
<li><b>Pool shutdown.</b> <code>with</code> block chhodna har worker ka intezaar karta hai, isliye lambi job phir bhi script ka ant rok leti hai.</li>
</ol>
<p>Yeh script (original dus-second wale <code>poll.py</code> ke saath) item 2 aur 3 ek saath dikhati hai:</p>
<pre class="code">t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=5) as pool:
    fut = pool.submit(poll, "10.99.0.3")
    try:
        fut.result(timeout=2)
    except TimeoutError:
        print(f"gave up waiting after {time.perf_counter() - t0:.1f}s, done={fut.done()}")
print(f"with block left after {time.perf_counter() - t0:.1f}s")
print(fut.result())</pre>
<pre class="out">AUTO01$ python3 giveup.py
<span class="hl">gave up waiting after 2.0s, done=False</span>
<span class="hl">with block left after 10.0s</span>
('10.99.0.3', 'NetmikoTimeoutException')</pre>
<p>Hum 2 s baad haar maan gaye, phir bhi script 10 s par khatam hui, kyunki poll chal hi raha tha aur <code>with</code> block ne uska intezaar kiya. Result timeout aapke sabr ko control karta hai, worker ko nahi. Kaam ko sach mein bound karna hai to timeout wahan lagao jahan kaam hota hai: <code>conn_timeout</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>result()</code> kabhi call na karna, isliye failures gayab. <code>Exception</code> pakadkar kuch print na karna. Yeh maanna ki <code>result(timeout=...)</code> job cancel kar deta hai. Connect timeout itna chhota rakhna ki healthy par dheemi devices down report hon. Yeh bhoolna ki <code>cancel()</code> sirf un jobs par kaam karta hai jo abhi shuru nahi hui.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pool.map</code> ke saath worker ka exception tab loop mein raise hota hai jab loop us result tak pahunche, aur loop wahin ruk jaata hai; baad ke results kabhi print nahi hote. Worker ke andar pakdo, ya <code>submit</code> use karke har future sambhalo. (Lab 2 yeh live dikhata hai.)</p></div>

<div class="scn"><h4>Nightly run jo "kamyab" rahi</h4><p>Ek script plain threads se 80 devices se <code>show version</code> jama karti thi aur hamesha exit code 0 deti thi. Hafton tak kisi ne notice nahi kiya ki teen branch routers report se gayab the: unke threads ek log ke upar traceback ke saath mar jaate the jise koi padhta nahi tha. Fix tha worker-level <code>try/except</code> jo failures record kare, "77 ok, 3 failed: [...]" wali summary line, aur kuch fail hone par non-zero exit code.</p><p><b>Lesson:</b> jo thread chupchaap mar jaata hai woh bilkul success jaisa dikhta hai.</p></div>

<div class="iv"><p class="q">"ThreadPoolExecutor ki job ke andar raise hue exception ka kya hota hai?"</p><p>Woh Future mein store hota hai aur <code>result()</code> call karne par dobara raise hota hai, ya main use <code>exception()</code> se padh sakta hoon. Main poochhu hi na, to woh chupchaap kho jaata hai. Main ya to worker ke andar naam wale exceptions pakadkar status return karta hoon, ya <code>fut.result()</code> ko <code>try/except</code> mein lapetta hoon, aur aakhir mein fail hui devices report karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pool exceptions Future mein rehte hain aur <code>result()</code> par saamne aate hain; na padhe gaye failures dikhte nahi.</li>
<li>Naam wale exceptions worker mein pakdo (status return karo) ya <code>fut.result()</code> ke aaspaas.</li>
<li>Raw thread jo raise kare traceback print karke mar jaata hai aur main program chalta rehta hai.</li>
<li><code>conn_timeout</code> kaam ko bound karta hai; <code>result(timeout=)</code> sirf aapke intezaar ko, aur pool ant mein phir bhi intezaar karta hai.</li>
<li>Failures ko summary aur exit code dono mein report karo.</li>
</ul></div>
`}};export{e as default};