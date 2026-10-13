var e={id:`thread-pool`,h:{en:`ThreadPoolExecutor: map, submit, as_completed and max_workers`,hi:`ThreadPoolExecutor: map, submit, as_completed aur max_workers`},body:{en:`
<p><b>The idea of this chapter:</b> creating and joining threads by hand gets tiresome and error-prone. <code>ThreadPoolExecutor</code> hires a fixed team of worker threads, hands them jobs, brings the answers back and cleans up. This is the tool you will use for almost every real network script, and it is the heart of Lab 1.</p>

<h3>Analogy: a team hired for the shift</h3>
<p>Instead of recruiting a new waiter for every table, the manager hires five waiters for the evening. Customers (jobs) queue at the door, and whichever waiter is free takes the next one. The number of waiters is <code>max_workers</code>. When the shift ends, the manager waits for everyone to finish: that is the <code>with</code> block.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Jobs wait in a line and a pool of workers takes them">
<text x="10" y="22" class="svg-ink" font-size="13">jobs waiting</text>
<rect x="10" y="34" width="46" height="26" rx="5" fill="#fde68a"/><text x="33" y="52" text-anchor="middle" class="svg-ink" font-size="11">R6</text>
<rect x="60" y="34" width="46" height="26" rx="5" fill="#fde68a"/><text x="83" y="52" text-anchor="middle" class="svg-ink" font-size="11">R7</text>
<rect x="110" y="34" width="46" height="26" rx="5" fill="#fde68a"/><text x="133" y="52" text-anchor="middle" class="svg-ink" font-size="11">R8</text>
<line x1="160" y1="47" x2="230" y2="47" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="20" width="200" height="150" rx="10" fill="#e2e8f0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="12">ThreadPoolExecutor(max_workers=3)</text>
<rect x="250" y="54" width="160" height="26" rx="6" fill="#bae6fd"/><text x="330" y="72" text-anchor="middle" class="svg-ink" font-size="11">worker 1: poll R1</text>
<rect x="250" y="88" width="160" height="26" rx="6" fill="#bae6fd"/><text x="330" y="106" text-anchor="middle" class="svg-ink" font-size="11">worker 2: poll R2</text>
<rect x="250" y="122" width="160" height="26" rx="6" fill="#bae6fd"/><text x="330" y="140" text-anchor="middle" class="svg-ink" font-size="11">worker 3: poll R3</text>
<line x1="430" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="96" text-anchor="middle" class="svg-ink" font-size="12">Future objects</text><text x="565" y="114" text-anchor="middle" class="svg-muted" font-size="11">hold the answers</text>
<text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="12">a free worker takes the next waiting job</text>
</svg><p class="cap">A pool: a fixed team, a queue of jobs, answers coming back as Futures.</p></div>

<h3>Style 1: pool.map keeps the input order</h3>
<p>This is Lab 1, task 2. Save it as <code>parallel.py</code> next to <code>poll.py</code>:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor
from poll import poll, IPS

start = time.time()
with ThreadPoolExecutor(max_workers=5) as pool:
    for ip, state in pool.map(poll, IPS):
        print(ip, state)
print(f"elapsed: {time.time() - start:.1f}s")</pre>
<ul>
<li><code>from poll import poll, IPS</code> reuses the function and the address list from <code>poll.py</code>. The <code>if __name__ == "__main__"</code> guard in that file stops its sequential loop from running on import.</li>
<li><code>with ThreadPoolExecutor(max_workers=5) as pool:</code> creates the pool and, on leaving the block, waits for all work and shuts the pool down.</li>
<li><code>pool.map(poll, IPS)</code> runs <code>poll(ip)</code> for every address and yields the returned pairs <b>in the order of IPS</b>.</li>
</ul>
<pre class="out">AUTO01$ python3 parallel.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
<span class="hl">10.99.0.3 NetmikoTimeoutException</span>
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5
<span class="hl">elapsed: 10.0s</span></pre>
<p>The total fell from 12.8 s to 10.0 s: the four good routers now overlap with the dead one, so the dead router's 10 s timeout is all that remains. Notice that lines 4 and 5 appear only after line 3. R4 and R5 finished early but <code>map</code> hands results out in input order, so they wait behind R3. Chapter 6 fixes the cost of the timeout itself.</p>

<h3>Style 2: submit and as_completed deliver the fastest first</h3>
<p>This is Lab 1, task 4. Save it as <code>first.py</code>:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from poll import poll, IPS

start = time.time()
with ThreadPoolExecutor(max_workers=5) as pool:
    futures = [pool.submit(poll, ip) for ip in IPS]
    for fut in as_completed(futures):
        ip, state = fut.result()
        print(f"{time.time() - start:5.1f}s  {ip}  {state}")</pre>
<ul>
<li><code>pool.submit(poll, ip)</code> schedules one job and returns a <b>Future</b> immediately: a promise of a result.</li>
<li><code>as_completed(futures)</code> yields each future <b>as it finishes</b>, fastest first.</li>
<li><code>fut.result()</code> returns the value, waiting if needed. <code>{...:5.1f}</code> prints the time in a column five characters wide with one decimal.</li>
</ul>
<pre class="out">AUTO01$ python3 first.py
  0.7s  10.99.0.1  PUN-CORE-R1
  0.7s  10.99.0.2  BLR-EDGE-R2
  0.7s  10.99.0.4  DEL-EDGE-R4
  0.7s  10.99.0.5  MUM-EDGE-R5
<span class="hl"> 10.0s  10.99.0.3  NetmikoTimeoutException</span></pre>
<p>Now four answers appear after 0.7 s and the dead router reports last. The answer to "which IP finishes last?" in Lab 1 is 10.99.0.3. You see good news at once and the slow case at the end.</p>

<table class="cmp"><tr><th></th><th><code>pool.map</code></th><th><code>submit</code> + <code>as_completed</code></th></tr>
<tr><td>Result order</td><td>Same as the input</td><td>Order of finishing</td></tr>
<tr><td>Knowing which input a result belongs to</td><td>Automatic (position)</td><td>Return the key with the result, or keep a dict of future to key</td></tr>
<tr><td>A failed job</td><td>Raises when the loop reaches it, ending the loop</td><td>Raises at <code>fut.result()</code>; you can catch it per future</td></tr>
<tr><td>Best for</td><td>Short, uniform jobs; ordered reports</td><td>Progress display, slow or failing devices</td></tr></table>

<h3>Choosing max_workers</h3>
<p>The pool never runs more jobs at once than <code>max_workers</code>. Ten one-second jobs with different team sizes:</p>
<pre class="out">AUTO01$ python3 sizes.py
max_workers=1   <span class="hl">10.0s</span>
max_workers=2    5.0s
max_workers=5    2.0s
max_workers=10   <span class="hl">1.0s</span></pre>
<p>The pattern is jobs divided by workers, rounded up, times the job time: ten jobs and three workers need four waves. Beyond ten workers for ten jobs nothing improves. If you leave <code>max_workers</code> out, real Python picks a default based on the processor count (at most 32); in scripts that talk to devices, always choose the number yourself, as chapter 9 explains.</p>

<div class="eg"><p><b>Worked example.</b> 50 switches, 4 s each, 10 workers: 5 waves of 4 s = 20 s. With 25 workers: 2 waves = 8 s. With 50 workers: 4 s, but 50 simultaneous logins may be more than your AAA server or the jump host likes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a pool without the <code>with</code> statement and never shutting it down. Calling <code>pool.map</code> and not iterating over it, which hides every error. Writing <code>pool.map(poll(IPS))</code> or <code>pool.submit(poll(ip))</code> with brackets: the same call-instead-of-pass bug as chapter 3. Expecting <code>as_completed</code> results in input order.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>map</code> is ordered by input; <code>as_completed</code> is ordered by finishing time. <code>submit</code> returns immediately with a <code>Future</code>, not the answer. And leaving the <code>with</code> block waits for all submitted jobs.</p></div>

<div class="scn"><h4>The progress bar that froze on router three</h4><p>A health check used <code>pool.map</code> and printed a line per router. Every night the output stalled after the second line for ten seconds and the on-call engineer thought the script had hung. The third router was down and <code>map</code> held back every later result. Switching to <code>submit</code> and <code>as_completed</code> printed healthy routers immediately and the dead one at the end.</p><p><b>Lesson:</b> choose the result order that matches how people watch the job.</p></div>

<div class="iv"><p class="q">"When do you use pool.map and when submit with as_completed?"</p><p>I use <code>map</code> when I want results in input order and the jobs are simple. I use <code>submit</code> with <code>as_completed</code> when I want results as they finish, per-job error handling, or a progress display, because one slow device should not hide the others.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ThreadPoolExecutor</code> manages a fixed team of threads; the <code>with</code> block waits and cleans up.</li>
<li><code>pool.map(func, items)</code> returns results in input order.</li>
<li><code>pool.submit(func, arg)</code> returns a <code>Future</code>; <code>as_completed</code> yields futures as they finish.</li>
<li>Total time is roughly waves times job time, where waves = jobs divided by workers rounded up.</li>
<li>Pass the function and its arguments separately; never call it inside <code>map</code> or <code>submit</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> threads haath se banana aur join karna thaka dene wala aur galti-prone hai. <code>ThreadPoolExecutor</code> worker threads ki ek fixed team hire karta hai, unhe jobs deta hai, jawab wapas laata hai aur safai karta hai. Yeh woh tool hai jo aap lagbhag har asli network script mein use karoge, aur yahi Lab 1 ka dil hai.</p>

<h3>Analogy: shift ke liye hire ki hui team</h3>
<p>Har table ke liye naya waiter bharti karne ki jagah manager shaam ke liye paanch waiters hire karta hai. Customers (jobs) darwaaze par line mein lagte hain, aur jo waiter khaali ho woh agla le leta hai. Waiters ki ginti <code>max_workers</code> hai. Shift khatam hone par manager sabke khatam hone ka intezaar karta hai: yahi <code>with</code> block hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Jobs line mein ruke hain aur workers ka pool unhe uthata hai">
<text x="10" y="22" class="svg-ink" font-size="13">intezaar karti jobs</text>
<rect x="10" y="34" width="46" height="26" rx="5" fill="#fde68a"/><text x="33" y="52" text-anchor="middle" class="svg-ink" font-size="11">R6</text>
<rect x="60" y="34" width="46" height="26" rx="5" fill="#fde68a"/><text x="83" y="52" text-anchor="middle" class="svg-ink" font-size="11">R7</text>
<rect x="110" y="34" width="46" height="26" rx="5" fill="#fde68a"/><text x="133" y="52" text-anchor="middle" class="svg-ink" font-size="11">R8</text>
<line x1="160" y1="47" x2="230" y2="47" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="20" width="200" height="150" rx="10" fill="#e2e8f0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="12">ThreadPoolExecutor(max_workers=3)</text>
<rect x="250" y="54" width="160" height="26" rx="6" fill="#bae6fd"/><text x="330" y="72" text-anchor="middle" class="svg-ink" font-size="11">worker 1: poll R1</text>
<rect x="250" y="88" width="160" height="26" rx="6" fill="#bae6fd"/><text x="330" y="106" text-anchor="middle" class="svg-ink" font-size="11">worker 2: poll R2</text>
<rect x="250" y="122" width="160" height="26" rx="6" fill="#bae6fd"/><text x="330" y="140" text-anchor="middle" class="svg-ink" font-size="11">worker 3: poll R3</text>
<line x1="430" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="96" text-anchor="middle" class="svg-ink" font-size="12">Future objects</text><text x="565" y="114" text-anchor="middle" class="svg-muted" font-size="11">jawab rakhte hain</text>
<text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="12">khaali worker agli intezaar karti job le leta hai</text>
</svg><p class="cap">Pool: fixed team, jobs ki queue, jawab Futures ke roop mein wapas.</p></div>

<h3>Style 1: pool.map input ka order rakhta hai</h3>
<p>Yeh Lab 1, task 2 hai. Ise <code>poll.py</code> ke bagal mein <code>parallel.py</code> naam se save karo:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor
from poll import poll, IPS

start = time.time()
with ThreadPoolExecutor(max_workers=5) as pool:
    for ip, state in pool.map(poll, IPS):
        print(ip, state)
print(f"elapsed: {time.time() - start:.1f}s")</pre>
<ul>
<li><code>from poll import poll, IPS</code> <code>poll.py</code> ka function aur address list reuse karta hai. Us file ka <code>if __name__ == "__main__"</code> guard uske sequential loop ko import par chalne se rokta hai.</li>
<li><code>with ThreadPoolExecutor(max_workers=5) as pool:</code> pool banata hai aur block chhodte waqt saare kaam ka intezaar karke pool band kar deta hai.</li>
<li><code>pool.map(poll, IPS)</code> har address ke liye <code>poll(ip)</code> chalata hai aur return hui jodiyan <b>IPS ke order mein</b> deta hai.</li>
</ul>
<pre class="out">AUTO01$ python3 parallel.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
<span class="hl">10.99.0.3 NetmikoTimeoutException</span>
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5
<span class="hl">elapsed: 10.0s</span></pre>
<p>Total 12.8 s se 10.0 s par aa gaya: chaar achhe routers ab band router ke saath overlap hote hain, isliye sirf band router ka 10 s timeout bacha. Dhyan do ki line 4 aur 5 line 3 ke baad hi aati hain. R4 aur R5 jaldi khatam hue par <code>map</code> results input order mein deta hai, isliye woh R3 ke peeche ruke. Chapter 6 timeout ki lagat ko hi theek karta hai.</p>

<h3>Style 2: submit aur as_completed sabse tez ko pehle dete hain</h3>
<p>Yeh Lab 1, task 4 hai. Ise <code>first.py</code> naam se save karo:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from poll import poll, IPS

start = time.time()
with ThreadPoolExecutor(max_workers=5) as pool:
    futures = [pool.submit(poll, ip) for ip in IPS]
    for fut in as_completed(futures):
        ip, state = fut.result()
        print(f"{time.time() - start:5.1f}s  {ip}  {state}")</pre>
<ul>
<li><code>pool.submit(poll, ip)</code> ek job schedule karta hai aur turant ek <b>Future</b> return karta hai: result ka vaada.</li>
<li><code>as_completed(futures)</code> har future ko <b>khatam hote hi</b> deta hai, sabse tez pehle.</li>
<li><code>fut.result()</code> value return karta hai, zaroorat ho to intezaar karke. <code>{...:5.1f}</code> time ko paanch character chaude column mein ek decimal ke saath print karta hai.</li>
</ul>
<pre class="out">AUTO01$ python3 first.py
  0.7s  10.99.0.1  PUN-CORE-R1
  0.7s  10.99.0.2  BLR-EDGE-R2
  0.7s  10.99.0.4  DEL-EDGE-R4
  0.7s  10.99.0.5  MUM-EDGE-R5
<span class="hl"> 10.0s  10.99.0.3  NetmikoTimeoutException</span></pre>
<p>Ab chaar jawab 0.7 s baad dikhte hain aur band router aakhir mein report karta hai. Lab 1 ke "kaunsa IP sabse aakhir mein khatam hota hai?" ka jawab 10.99.0.3 hai. Achhi khabar turant dikhti hai aur dheema case aakhir mein.</p>

<table class="cmp"><tr><th></th><th><code>pool.map</code></th><th><code>submit</code> + <code>as_completed</code></th></tr>
<tr><td>Result order</td><td>Input jaisa</td><td>Khatam hone ka order</td></tr>
<tr><td>Result kis input ka hai yeh jaanna</td><td>Apne aap (position se)</td><td>Result ke saath key return karo, ya future se key ka dict rakho</td></tr>
<tr><td>Fail hui job</td><td>Loop us tak pahunche to raise hota hai, loop khatam</td><td><code>fut.result()</code> par raise hota hai; har future par pakad sakte ho</td></tr>
<tr><td>Kiske liye best</td><td>Chhoti, ek jaisi jobs; ordered reports</td><td>Progress display, dheemi ya fail hoti devices</td></tr></table>

<h3>max_workers chunna</h3>
<p>Pool kabhi bhi <code>max_workers</code> se zyada jobs ek saath nahi chalata. Dus ek-second ki jobs alag team sizes ke saath:</p>
<pre class="out">AUTO01$ python3 sizes.py
max_workers=1   <span class="hl">10.0s</span>
max_workers=2    5.0s
max_workers=5    2.0s
max_workers=10   <span class="hl">1.0s</span></pre>
<p>Pattern hai jobs bhaag workers, upar round, guna job time: dus jobs aur teen workers ko chaar waves chahiye. Dus jobs ke liye dus workers ke baad kuch behtar nahi hota. <code>max_workers</code> chhod do to asli Python processor count ke hisaab se default chunta hai (zyada se zyada 32); devices se baat karne wali scripts mein number hamesha khud chuno, jaisa chapter 9 samjhata hai.</p>

<div class="eg"><p><b>Worked example.</b> 50 switches, har ek 4 s, 10 workers: 5 waves of 4 s = 20 s. 25 workers ke saath: 2 waves = 8 s. 50 workers ke saath: 4 s, par 50 ek saath logins aapke AAA server ya jump host ko zyada ho sakte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Pool ko <code>with</code> statement ke bina use karna aur kabhi band na karna. <code>pool.map</code> call karke uspar iterate na karna, jisse har error chhup jaata hai. <code>pool.map(poll(IPS))</code> ya <code>pool.submit(poll(ip))</code> brackets ke saath likhna: chapter 3 wala call-instead-of-pass bug. <code>as_completed</code> ke results input order mein ummeed karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>map</code> input ke order mein hai; <code>as_completed</code> khatam hone ke order mein. <code>submit</code> turant <code>Future</code> return karta hai, jawab nahi. Aur <code>with</code> block chhodna saari submit ki hui jobs ka intezaar karta hai.</p></div>

<div class="scn"><h4>Progress bar jo router teen par atak gaya</h4><p>Ek health check <code>pool.map</code> use karta tha aur har router ki ek line print karta tha. Har raat output dusri line ke baad dus second ruk jaata tha aur on-call engineer ko lagta tha script hang ho gayi. Teesra router band tha aur <code>map</code> baad ke har result ko rok leta tha. <code>submit</code> aur <code>as_completed</code> par jaane se healthy routers turant print hue aur band wala aakhir mein.</p><p><b>Lesson:</b> aisa result order chuno jo log job ko dekhne ke tareeke se match kare.</p></div>

<div class="iv"><p class="q">"pool.map kab use karte ho aur submit ke saath as_completed kab?"</p><p>Jab results input order mein chahiye aur jobs saadi hain, tab <code>map</code>. Jab results khatam hote hi chahiye, har job ka alag error handling ya progress display chahiye, tab <code>submit</code> ke saath <code>as_completed</code>, kyunki ek dheema device baakiyon ko chhupana nahi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ThreadPoolExecutor</code> threads ki fixed team chalata hai; <code>with</code> block intezaar aur safai karta hai.</li>
<li><code>pool.map(func, items)</code> results input order mein deta hai.</li>
<li><code>pool.submit(func, arg)</code> <code>Future</code> return karta hai; <code>as_completed</code> futures ko khatam hote hi deta hai.</li>
<li>Total time lagbhag waves guna job time hai, jahan waves = jobs bhaag workers upar round.</li>
<li>Function aur uske arguments alag do; <code>map</code> ya <code>submit</code> ke andar kabhi call mat karo.</li>
</ul></div>
`}};export{e as default};