var e={id:`summary`,h:{en:`Summary, can-do checklist, glossary and cheat-sheet`,hi:`Summary, can-do checklist, glossary aur cheat-sheet`},body:{en:`
<p><b>The idea of this chapter:</b> one page to check yourself against before an interview, a change window or the quiz. If you can do every item in the checklist without looking, you have the skill, not just the vocabulary.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Decision flow: is the job waiting, use a pool, return results, be polite">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="46" text-anchor="middle" class="svg-ink" font-size="12">Is it waiting</text><text x="75" y="64" text-anchor="middle" class="svg-ink" font-size="12">on the network?</text>
<rect x="170" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="235" y="46" text-anchor="middle" class="svg-ink" font-size="12">ThreadPool</text><text x="235" y="64" text-anchor="middle" class="svg-ink" font-size="12">Executor</text>
<rect x="330" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="395" y="46" text-anchor="middle" class="svg-ink" font-size="12">Workers return</text><text x="395" y="64" text-anchor="middle" class="svg-ink" font-size="12">a status row</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="12">Main thread</text><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="12">builds the report</text>
<line x1="140" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="460" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="11">yes: threads</text><text x="75" y="122" text-anchor="middle" class="svg-muted" font-size="11">no: processes</text>
<text x="235" y="106" text-anchor="middle" class="svg-muted" font-size="11">max_workers set</text><text x="235" y="122" text-anchor="middle" class="svg-muted" font-size="11">on purpose</text>
<text x="395" y="106" text-anchor="middle" class="svg-muted" font-size="11">no shared writes,</text><text x="395" y="122" text-anchor="middle" class="svg-muted" font-size="11">named exceptions</text>
<text x="560" y="106" text-anchor="middle" class="svg-muted" font-size="11">sorted, with</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="11">failures listed</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">polite: one session per device, spaced starts, retries with a pause</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">count, clock, last line, one change when it goes wrong</text>
</svg><p class="cap">The flow you will use for almost every device job.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why a sequential poll of many devices is slow and estimate a threaded time as waves times job time.</li>
<li>I can tell I/O-bound from CPU-bound work and describe in one sentence what the GIL does.</li>
<li>I can start, name and join threads, and I know why <code>target=f(x)</code> is a bug.</li>
<li>I can show how <code>counts[x] += 1</code> loses updates and protect it with <code>with lock:</code>, or remove the sharing.</li>
<li>I can write a <code>ThreadPoolExecutor</code> job with <code>map</code>, and one with <code>submit</code> and <code>as_completed</code>, and say when to use each.</li>
<li>I can catch failures inside the worker or around <code>fut.result()</code> and report which devices failed.</li>
<li>I can set <code>conn_timeout</code> and explain why <code>result(timeout=)</code> does not stop the worker.</li>
<li>I can use <code>queue.Queue</code> with <code>put</code>, <code>get</code>, <code>task_done</code> and <code>join</code>.</li>
<li>I can sweep a subnet with <code>subprocess.run</code> and ping inside a pool.</li>
<li>I can choose a worker limit, add a semaphore or a pause, and justify one session per device.</li>
<li>I can fix the four Lab 2 bugs one at a time using count, clock and the last traceback line.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Thread</dt><dd>A line of execution inside a program; threads of one program share memory.</dd>
<dt>I/O-bound</dt><dd>Limited by waiting for the network, disk or another program.</dd>
<dt>CPU-bound</dt><dd>Limited by the processor's calculating speed.</dd>
<dt>GIL</dt><dd>Global Interpreter Lock: lets one thread at a time run Python code in CPython; released while waiting for I/O.</dd>
<dt>join</dt><dd>Wait until a thread has finished.</dd>
<dt>Daemon thread</dt><dd>A background thread that does not keep the program alive.</dd>
<dt>Race condition</dt><dd>A wrong result that depends on the timing of threads touching shared data.</dd>
<dt>Lock</dt><dd>Lets one thread at a time into a section of code; use <code>with lock:</code>.</dd>
<dt>Deadlock</dt><dd>Threads waiting for each other's locks forever.</dd>
<dt>Future</dt><dd>A promise of a result from a pool job; holds the value or the exception.</dd>
<dt>Pool</dt><dd>A fixed team of worker threads that takes jobs from a queue.</dd>
<dt>Queue</dt><dd>A thread-safe first-in-first-out line of work.</dd>
<dt>Sentinel</dt><dd>A special item (such as <code>None</code>) that tells a worker to stop.</dd>
<dt>Semaphore</dt><dd>A lock that admits a set number of threads at once.</dd>
<dt>Rate limit</dt><dd>A control on how fast new work starts.</dd>
<dt>Wave</dt><dd>One round of jobs filling all workers; total time is about waves times job time.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Threads help I/O-bound work; CPU-bound work needs processes.</li>
<li>Pass the function, not its result: <code>target=worker, args=(ip,)</code>. A one-item tuple needs the comma.</li>
<li>Start all threads, then join all threads, then read results.</li>
<li><code>pool.map</code> keeps input order; <code>as_completed</code> gives finishing order.</li>
<li>A worker exception is stored in the Future and raised at <code>result()</code>; with <code>map</code> it ends the loop.</li>
<li><code>max_workers</code> must be greater than 0; the <code>with</code> block waits for all jobs.</li>
<li><code>result(timeout=)</code> limits your wait, not the work; <code>conn_timeout</code> bounds the connection.</li>
<li><code>+=</code> on shared data is not atomic; a lone <code>append</code> is.</li>
<li>Each <code>get()</code> needs one <code>task_done()</code>, or <code>join()</code> hangs.</li>
<li>In this lab threads use virtual time; locks, queues, pools and result order follow the real rules.</li>
</ul>

<h3>Command and code cheat-sheet</h3>
<pre class="code">import threading, time, queue
from concurrent.futures import ThreadPoolExecutor, as_completed

t = threading.Thread(target=work, args=(ip,), name="poll-" + ip)
t.start(); t.join()

lock = threading.Lock()
with lock:
    counts[state] += 1

with ThreadPoolExecutor(max_workers=10) as pool:
    for ip, state in pool.map(poll, IPS):          # input order
        print(ip, state)

with ThreadPoolExecutor(max_workers=10) as pool:
    futs = {pool.submit(poll, ip): ip for ip in IPS}
    for fut in as_completed(futs):                  # finishing order
        try:
            print(futs[fut], fut.result())
        except NetmikoTimeoutException:
            print(futs[fut], "FAILED")

q = queue.Queue()
q.put(item); item = q.get(); q.task_done(); q.join()

sem = threading.Semaphore(3)
with sem:
    do_one_login()</pre>
<pre class="code">sed -i 's/password="NK@2026")/password="NK@2026", conn_timeout=3)/' poll.py
python3 parallel.py
python3 first.py
python3 sweep.py</pre>

<div class="eg"><p><b>Worked example.</b> Exam-style question: "Ten routers each take 4 s; the dead one times out at 10 s; 5 workers; no retries." The dead router holds one worker for 10 s. The other four workers share the nine good routers: 4 + 4 + 1 jobs, three rounds of 4 s, so the job ends after about 12 s. With <code>conn_timeout=3</code> the dead router frees its worker after 3 s, which then picks up a good router, and the job ends after about 8 s. Free workers always take the next waiting job.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on test day.</b> Calling the function inside <code>Thread</code> or <code>submit</code>; reading results before <code>join</code>; setting zero workers; letting a <code>pool.map</code> loop die on one device; sharing a counter without a lock; holding a lock during network I/O; running a threaded push without limits or verification.</p></div>
<div class="exam"><p><b>Exam trap.</b> Many questions mix two ideas: "threads make each poll faster" is false, "threads make the whole job faster when polls wait" is true. "The GIL means threads are useless" is false for network scripts.</p></div>

<div class="scn"><h4>Handing the toolkit to a colleague</h4><p>Before going on leave an engineer wrote a short note beside the polling script: "Pool of 10, one session per device, <code>conn_timeout=3</code>, workers return status rows, failures listed at the end, exit code non-zero if any failed. If it looks wrong: count, clock, last line." The colleague ran it during an incident and trusted the output without reading the code.</p><p><b>Lesson:</b> a script is finished when someone else can run and trust it.</p></div>

<div class="iv"><p class="q">"Walk me through how you would poll 500 devices quickly and safely."</p><p>I would confirm the job is I/O-bound, then use a <code>ThreadPoolExecutor</code> with a measured worker count such as 20, one session per device and a short <code>conn_timeout</code>. Workers return a status row and never print or share state; the main thread collects results by IP, shows progress, sorts, prints a summary with the failed devices, and exits non-zero on failures. For changes I would add a dry run, backup, verification and rollback, with a smaller pool.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overlap waits with threads; use processes for computing.</li>
<li>Workers return results; the main thread collects, sorts and reports.</li>
<li>Catch named exceptions, set connect timeouts, list the failures.</li>
<li>Limit workers, sessions and start rate; never harm the network you manage.</li>
<li>When it breaks: count, clock, last line, one change at a time.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ek page jisse interview, change window ya quiz se pehle apne aap ko check kar sako. Checklist ka har item bina dekhe kar sako to aapke paas skill hai, sirf shabdavali nahi.</p>

<h3>Poora module ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Decision flow: kya kaam intezaar hai, pool use karo, results return karo, tameez rakho">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="46" text-anchor="middle" class="svg-ink" font-size="12">Kya network ka</text><text x="75" y="64" text-anchor="middle" class="svg-ink" font-size="12">intezaar hai?</text>
<rect x="170" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="235" y="46" text-anchor="middle" class="svg-ink" font-size="12">ThreadPool</text><text x="235" y="64" text-anchor="middle" class="svg-ink" font-size="12">Executor</text>
<rect x="330" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="395" y="46" text-anchor="middle" class="svg-ink" font-size="12">Workers status</text><text x="395" y="64" text-anchor="middle" class="svg-ink" font-size="12">row return karein</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="12">Main thread</text><text x="560" y="64" text-anchor="middle" class="svg-ink" font-size="12">report banata hai</text>
<line x1="140" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="460" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="11">haan: threads</text><text x="75" y="122" text-anchor="middle" class="svg-muted" font-size="11">nahi: processes</text>
<text x="235" y="106" text-anchor="middle" class="svg-muted" font-size="11">max_workers soch</text><text x="235" y="122" text-anchor="middle" class="svg-muted" font-size="11">samajhkar</text>
<text x="395" y="106" text-anchor="middle" class="svg-muted" font-size="11">shared write nahi,</text><text x="395" y="122" text-anchor="middle" class="svg-muted" font-size="11">naam wale exceptions</text>
<text x="560" y="106" text-anchor="middle" class="svg-muted" font-size="11">sorted, failures</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="11">ki list ke saath</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">tameez: ek device par ek session, spaced starts, pause ke saath retries</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">kuch bigde to: ginti, clock, aakhri line, ek badlav</text>
</svg><p class="cap">Lagbhag har device job ke liye yahi flow.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki bahut devices ka sequential poll dheema kyon hai aur threaded time ko waves guna job time se andaaza laga sakta hoon.</li>
<li>Main I/O-bound aur CPU-bound kaam mein fark bata sakta hoon aur GIL kya karta hai ek vaakya mein bata sakta hoon.</li>
<li>Main threads start, naam aur join kar sakta hoon, aur jaanta hoon ki <code>target=f(x)</code> bug kyon hai.</li>
<li>Main dikha sakta hoon ki <code>counts[x] += 1</code> updates kaise khota hai aur use <code>with lock:</code> se bacha sakta hoon, ya sharing hata sakta hoon.</li>
<li>Main <code>map</code> wali aur <code>submit</code> ke saath <code>as_completed</code> wali <code>ThreadPoolExecutor</code> job likh sakta hoon, aur bata sakta hoon ki kab kaunsi.</li>
<li>Main failures ko worker ke andar ya <code>fut.result()</code> ke aaspaas pakad sakta hoon aur report kar sakta hoon ki kaunse devices fail hue.</li>
<li>Main <code>conn_timeout</code> set kar sakta hoon aur samjha sakta hoon ki <code>result(timeout=)</code> worker ko kyon nahi rokta.</li>
<li>Main <code>queue.Queue</code> ko <code>put</code>, <code>get</code>, <code>task_done</code> aur <code>join</code> ke saath use kar sakta hoon.</li>
<li>Main pool ke andar <code>subprocess.run</code> aur ping se subnet sweep kar sakta hoon.</li>
<li>Main worker limit chun sakta hoon, semaphore ya pause jod sakta hoon, aur ek device par ek session ka karan bata sakta hoon.</li>
<li>Main ginti, clock aur aakhri traceback line se Lab 2 ke chaar bugs ek-ek karke theek kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Thread</dt><dd>Program ke andar execution ki ek line; ek program ke threads memory share karte hain.</dd>
<dt>I/O-bound</dt><dd>Network, disk ya doosre program ke intezaar se limited.</dd>
<dt>CPU-bound</dt><dd>Processor ki calculating speed se limited.</dd>
<dt>GIL</dt><dd>Global Interpreter Lock: CPython mein ek waqt mein ek thread ko Python code chalane deta hai; I/O ke intezaar ke dauraan release hota hai.</dd>
<dt>join</dt><dd>Thread ke khatam hone tak intezaar karna.</dd>
<dt>Daemon thread</dt><dd>Background thread jo program ko zinda nahi rakhta.</dd>
<dt>Race condition</dt><dd>Shared data chhune wale threads ki timing par depend karne wala galat result.</dd>
<dt>Lock</dt><dd>Code ke section mein ek waqt mein ek thread ko jaane deta hai; <code>with lock:</code> use karo.</dd>
<dt>Deadlock</dt><dd>Threads ek doosre ke locks ke intezaar mein hamesha ke liye ruk jaate hain.</dd>
<dt>Future</dt><dd>Pool job ke result ka vaada; value ya exception rakhta hai.</dd>
<dt>Pool</dt><dd>Worker threads ki fixed team jo queue se jobs leti hai.</dd>
<dt>Queue</dt><dd>Kaam ki thread-safe first-in-first-out line.</dd>
<dt>Sentinel</dt><dd>Khaas item (jaise <code>None</code>) jo worker ko rukne ko kehta hai.</dd>
<dt>Semaphore</dt><dd>Aisa lock jo tay ginti ke threads ko ek saath andar aane deta hai.</dd>
<dt>Rate limit</dt><dd>Naya kaam kitni tezi se shuru ho, uska control.</dd>
<dt>Wave</dt><dd>Jobs ka ek round jo saare workers bhar de; total time lagbhag waves guna job time.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Threads I/O-bound kaam mein madad karte hain; CPU-bound kaam ko processes chahiye.</li>
<li>Function do, uska result nahi: <code>target=worker, args=(ip,)</code>. Ek item ke tuple ko comma chahiye.</li>
<li>Saare threads start karo, saare join karo, phir results padho.</li>
<li><code>pool.map</code> input order rakhta hai; <code>as_completed</code> khatam hone ka order deta hai.</li>
<li>Worker ka exception Future mein store hota hai aur <code>result()</code> par raise hota hai; <code>map</code> ke saath woh loop khatam kar deta hai.</li>
<li><code>max_workers</code> 0 se bada hona chahiye; <code>with</code> block saari jobs ka intezaar karta hai.</li>
<li><code>result(timeout=)</code> aapke intezaar ko limit karta hai, kaam ko nahi; <code>conn_timeout</code> connection ko bound karta hai.</li>
<li>Shared data par <code>+=</code> atomic nahi hai; akela <code>append</code> hai.</li>
<li>Har <code>get()</code> ko ek <code>task_done()</code> chahiye, warna <code>join()</code> hang hota hai.</li>
<li>Is lab mein threads virtual time use karte hain; locks, queues, pools aur result order asli rules follow karte hain.</li>
</ul>

<h3>Command aur code cheat-sheet</h3>
<pre class="code">import threading, time, queue
from concurrent.futures import ThreadPoolExecutor, as_completed

t = threading.Thread(target=work, args=(ip,), name="poll-" + ip)
t.start(); t.join()

lock = threading.Lock()
with lock:
    counts[state] += 1

with ThreadPoolExecutor(max_workers=10) as pool:
    for ip, state in pool.map(poll, IPS):          # input order
        print(ip, state)

with ThreadPoolExecutor(max_workers=10) as pool:
    futs = {pool.submit(poll, ip): ip for ip in IPS}
    for fut in as_completed(futs):                  # finishing order
        try:
            print(futs[fut], fut.result())
        except NetmikoTimeoutException:
            print(futs[fut], "FAILED")

q = queue.Queue()
q.put(item); item = q.get(); q.task_done(); q.join()

sem = threading.Semaphore(3)
with sem:
    do_one_login()</pre>
<pre class="code">sed -i 's/password="NK@2026")/password="NK@2026", conn_timeout=3)/' poll.py
python3 parallel.py
python3 first.py
python3 sweep.py</pre>

<div class="eg"><p><b>Worked example.</b> Exam-style sawaal: "Dus routers har ek 4 s leta hai; band router 10 s par timeout hota hai; 5 workers; koi retry nahi." Band router ek worker ko 10 s rokta hai. Baaki chaar workers nau achhe routers baant lete hain: 4 + 4 + 1 jobs, 4 s ke teen round, isliye job lagbhag 12 s mein khatam hoti hai. <code>conn_timeout=3</code> ke saath band router 3 s baad apna worker chhod deta hai, jo ek achha router utha leta hai, aur job lagbhag 8 s mein khatam hoti hai. Khaali worker hamesha agli intezaar karti job le leta hai.</p></div>

<div class="warn"><p><b>Test ke din bachne wali galtiyan.</b> <code>Thread</code> ya <code>submit</code> ke andar function call karna; <code>join</code> se pehle results padhna; zero workers rakhna; ek device par <code>pool.map</code> loop ko marne dena; bina lock ke counter share karna; network I/O ke dauraan lock pakadna; bina limits ya verification ke threaded push chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bahut sawaal do ideas milate hain: "threads har poll ko tez karte hain" galat hai, "polls intezaar karte hon to threads poore job ko tez karte hain" sahi hai. "GIL ka matlab threads bekaar" network scripts ke liye galat hai.</p></div>

<div class="scn"><h4>Toolkit colleague ko saunpna</h4><p>Chhutti par jaane se pehle ek engineer ne polling script ke bagal mein chhota note likha: "Pool of 10, ek device par ek session, <code>conn_timeout=3</code>, workers status rows return karte hain, ant mein failures ki list, kuch fail ho to exit code non-zero. Galat lage to: ginti, clock, aakhri line." Colleague ne ise ek incident mein chalaya aur code padhe bina output par bharosa kiya.</p><p><b>Lesson:</b> script tab poori hoti hai jab koi aur use chala sake aur us par bharosa kar sake.</p></div>

<div class="iv"><p class="q">"500 devices ko tezi se aur safely poll karne ka tareeka samjhao."</p><p>Main pehle pakka karunga ki job I/O-bound hai, phir <code>ThreadPoolExecutor</code> naape hue worker count jaise 20, ek device par ek session aur chhote <code>conn_timeout</code> ke saath use karunga. Workers status row return karte hain aur kabhi print ya shared state nahi chhute; main thread results ko IP se jama karta hai, progress dikhata hai, sort karta hai, failed devices ke saath summary print karta hai, aur failures par non-zero exit karta hai. Changes ke liye chhote pool ke saath dry run, backup, verification aur rollback jodunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intezaar ko threads se overlap karo; computing ke liye processes.</li>
<li>Workers results return karte hain; main thread jama, sort aur report karta hai.</li>
<li>Naam wale exceptions pakdo, connect timeouts set karo, failures list karo.</li>
<li>Workers, sessions aur start rate limit karo; jis network ko sambhalte ho use kabhi nuksaan mat pahunchao.</li>
<li>Toote to: ginti, clock, aakhri line, ek waqt mein ek badlav.</li>
</ul></div>
`}};export{e as default};