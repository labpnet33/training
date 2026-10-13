var e={id:`queues`,h:{en:`queue.Queue: producers, consumers and safe hand-over`,hi:`queue.Queue: producers, consumers aur safe hand-over`},body:{en:`
<p><b>The idea of this chapter:</b> a <code>queue.Queue</code> is a thread-safe line of work. One side puts jobs in, the other side takes them out, and Python takes care of the locking. Underneath, <code>ThreadPoolExecutor</code> already uses one. Learning the queue directly shows you what a pool does and gives you a tool for jobs that arrive over time.</p>

<h3>Analogy: the order rail in a kitchen</h3>
<p>Waiters clip order tickets on a rail (the <b>producers</b>). Cooks take the oldest ticket from the other end (the <b>consumers</b>). Nobody hands paper to a cook mid-chop and nobody argues over a ticket; the rail makes each ticket go to exactly one cook. If the rail is full the waiters slow down; if it is empty the cooks wait. That rail is a queue.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Main thread puts jobs on a queue, workers take them and put results on a second queue">
<rect x="10" y="70" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="96" text-anchor="middle" class="svg-ink" font-size="12">producer</text><text x="70" y="114" text-anchor="middle" class="svg-muted" font-size="11">jobs.put(ip)</text>
<rect x="170" y="80" width="130" height="40" rx="6" fill="#fde68a"/><text x="235" y="104" text-anchor="middle" class="svg-ink" font-size="12">jobs queue</text>
<rect x="350" y="30" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="405" y="52" text-anchor="middle" class="svg-ink" font-size="12">worker 1</text>
<rect x="350" y="83" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="405" y="105" text-anchor="middle" class="svg-ink" font-size="12">worker 2</text>
<rect x="350" y="136" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="405" y="158" text-anchor="middle" class="svg-ink" font-size="12">worker 3</text>
<rect x="510" y="80" width="120" height="40" rx="6" fill="#fde68a"/><text x="570" y="104" text-anchor="middle" class="svg-ink" font-size="12">results queue</text>
<line x1="130" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="47" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="153" stroke="#64748b" stroke-width="2"/>
<line x1="460" y1="47" x2="510" y2="100" stroke="#64748b" stroke-width="2"/><line x1="460" y1="100" x2="510" y2="100" stroke="#64748b" stroke-width="2"/><line x1="460" y1="153" x2="510" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">each job goes to exactly one worker; the queue does the locking</text>
</svg><p class="cap">A producer, a job queue, a team of workers and a results queue.</p></div>

<h3>The queue methods you need</h3>
<table class="cmp"><tr><th>Method</th><th>What it does</th></tr>
<tr><td><code>q.put(item)</code></td><td>Add an item; waits if the queue has a <code>maxsize</code> and is full</td></tr>
<tr><td><code>q.get()</code></td><td>Remove the oldest item; waits if the queue is empty</td></tr>
<tr><td><code>q.get_nowait()</code></td><td>Remove an item or raise <code>queue.Empty</code> at once</td></tr>
<tr><td><code>q.task_done()</code></td><td>Tell the queue that the item you took is fully processed</td></tr>
<tr><td><code>q.join()</code></td><td>Block until every item that was put has been marked done</td></tr>
<tr><td><code>q.qsize()</code>, <code>q.empty()</code>, <code>q.full()</code></td><td>Current state; only a snapshot, since another thread may change it a moment later</td></tr></table>
<pre class="out">AUTO01$ python3 qapi.py
True 2
Full
Empty after timeout
10.99.0.1 10.99.0.2 True
(1, 'core R1')</pre>
<p>The script behind it made a queue with <code>maxsize=2</code>, filled it, showed that <code>put(..., block=False)</code> raises <code>queue.Full</code>, that <code>get(timeout=1)</code> on an empty queue raises <code>queue.Empty</code>, and that items leave in the order they went in (first in, first out). The last line uses <code>queue.PriorityQueue</code>, which hands out the smallest item first: the pair <code>(1, "core R1")</code> leaves before <code>(2, "edge R2")</code>, a way to poll important devices first.</p>

<h3>A worker team fed by a queue</h3>
<pre class="code">import queue
import threading
import time

jobs = queue.Queue()
results = queue.Queue()


def worker():
    while True:
        ip = jobs.get()
        time.sleep(1)                     # stands in for the poll
        results.put((ip, "up"))
        jobs.task_done()


t0 = time.perf_counter()
for _ in range(3):
    threading.Thread(target=worker, daemon=True).start()
for n in range(1, 7):
    jobs.put(f"10.99.0.{n}")
jobs.join()
print("queue empty:", jobs.empty(), "results waiting:", results.qsize())
rows = []
while not results.empty():
    rows.append(results.get())
print(sorted(rows))
print(f"{time.perf_counter() - t0:.1f}s for 6 jobs with 3 workers")</pre>
<ul>
<li>Three workers loop forever: take a job, do it, put the answer on a <b>second</b> queue and call <code>task_done()</code>.</li>
<li>They are <b>daemon</b> threads, so the program may end while they are still waiting for work.</li>
<li>The main thread is the producer: it puts six addresses on the queue.</li>
<li><code>jobs.join()</code> waits until every job has had its <code>task_done()</code>. Forget <code>task_done()</code> and <code>join()</code> waits forever.</li>
<li>Results travel on a queue too, so no lock is needed; the main thread drains it after the work is done.</li>
</ul>
<pre class="out">AUTO01$ python3 jobs.py
<span class="hl">queue empty: True results waiting: 6</span>
[('10.99.0.1', 'up'), ('10.99.0.2', 'up'), ('10.99.0.3', 'up'), ('10.99.0.4', 'up'), ('10.99.0.5', 'up'), ('10.99.0.6', 'up')]
<span class="hl">2.0s for 6 jobs with 3 workers</span></pre>
<p>Six one-second jobs and three workers: two waves, two seconds. We print <code>sorted(rows)</code> because which worker handles which job, and in what order answers reach the results queue, is not guaranteed.</p>

<h3>Stopping workers: the sentinel</h3>
<p>Daemon workers are fine for scripts that end. When workers must finish cleanly, put one <b>sentinel</b> (here <code>None</code>) on the queue for each worker. A worker that gets it leaves its loop:</p>
<pre class="code">def worker():
    while True:
        ip = jobs.get()
        if ip is None:                    # sentinel: no more work
            break
        time.sleep(1)
        done.append(ip)

workers = [threading.Thread(target=worker) for _ in range(3)]
for w in workers:
    w.start()
for n in range(1, 7):
    jobs.put(f"10.99.0.{n}")
for _ in workers:
    jobs.put(None)
for w in workers:
    w.join()
print(sorted(done))</pre>
<pre class="out">AUTO01$ python3 sentinel.py
['10.99.0.1', '10.99.0.2', '10.99.0.3', '10.99.0.4', '10.99.0.5', '10.99.0.6']</pre>
<p>The sentinels go in <i>behind</i> the real jobs, so every worker finishes real work before it meets one.</p>

<div class="note"><p><b>Lab note.</b> In the simulator a thread that has already found the queue empty and gone to sleep is not woken by a later <code>put</code> from another thread. Real Python wakes it. So in the lab, put the jobs on the queue before the workers first run (as above, where the workers start but the main thread keeps going without pausing), or start the producer before the consumer. Do not rely on a <code>time.sleep</code> in the main thread between starting workers and putting jobs. On a real server both orders work.</p></div>

<h3>Queue or pool?</h3>
<p>For a fixed list of devices, <code>ThreadPoolExecutor</code> is shorter and handles exceptions better. Use an explicit queue when jobs <i>arrive over time</i> (a listener that adds a device whenever a syslog message reports a link flap), when you want <b>stages</b> (collectors feed a parser feed a database writer), or when you want <b>back-pressure</b>: a <code>maxsize</code> makes a fast producer wait for slow consumers.</p>

<div class="eg"><p><b>Worked example.</b> A change window has 24 branch switches to check and the CAB asks for the core pair first. Put the pairs <code>(0, "core1")</code>, <code>(0, "core2")</code> and <code>(1, "branch01")</code> and so on on a <code>PriorityQueue</code>. Workers always take the lowest number, so the core devices are polled before any branch.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>task_done()</code>, so <code>join()</code> hangs. Using <code>q.empty()</code> to decide whether to call <code>get()</code> (another thread may take the last item in between; use <code>get_nowait()</code> and catch <code>queue.Empty</code>). Putting a sentinel in front of real jobs. Sharing one results list and updating it with <code>+=</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get()</code> blocks forever on an empty queue unless you pass <code>timeout</code> or use <code>get_nowait()</code>. <code>qsize()</code> and <code>empty()</code> are only approximate in a threaded program. The <code>queue</code> module is thread-safe; <code>collections.deque</code> and plain lists are not designed for hand-over between workers.</p></div>

<div class="scn"><h4>The collector that hung at 99 percent</h4><p>A team built a worker-and-queue poller. It always printed 119 of 120 results and then sat there until someone pressed Ctrl+C. One branch of the worker loop, the <code>except</code> clause for a failed login, returned before calling <code>task_done()</code>, so <code>jobs.join()</code> was always one short. Moving <code>task_done()</code> into a <code>finally</code> block fixed it.</p><p><b>Lesson:</b> every <code>get()</code> needs exactly one <code>task_done()</code>, even on failure.</p></div>

<div class="iv"><p class="q">"Explain the producer-consumer pattern and where you would use it for network automation."</p><p>Producers put work on a thread-safe queue and consumers take it off, so the two sides run at their own pace without manual locking. I would use it when devices arrive over time, such as syslog-triggered checks, or when collection, parsing and storing are separate stages. For a fixed device list I would normally use a thread pool.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>queue.Queue</code> is thread-safe: <code>put</code>, <code>get</code>, <code>task_done</code> and <code>join</code> need no extra lock.</li>
<li>Pair every <code>get()</code> with one <code>task_done()</code>, in a <code>finally</code> if errors are possible.</li>
<li>Send results back on a second queue; sort them if order matters.</li>
<li>Stop workers with one sentinel per worker, queued behind the real jobs.</li>
<li>Use a queue for jobs that arrive over time, stages or back-pressure; use a pool for a fixed list.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>queue.Queue</code> kaam ki thread-safe line hai. Ek taraf jobs andar daalte hain, doosri taraf nikalte hain, aur locking Python sambhalta hai. Andar se <code>ThreadPoolExecutor</code> pehle se ek use karta hai. Queue seedhe seekhne se dikhta hai ki pool kya karta hai aur un jobs ke liye tool milta hai jo waqt ke saath aati hain.</p>

<h3>Analogy: kitchen ka order rail</h3>
<p>Waiters order tickets rail par clip karte hain (<b>producers</b>). Cooks doosre sire se sabse purana ticket lete hain (<b>consumers</b>). Koi kaagaz cook ko kaatte waqt thamata nahi aur ticket par koi behas nahi karta; rail har ticket ko theek ek cook tak pahunchati hai. Rail bhari ho to waiters dheemne ho jaate hain; khaali ho to cooks intezaar karte hain. Wahi rail queue hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Main thread queue par jobs daalta hai, workers lete hain aur results doosri queue par daalte hain">
<rect x="10" y="70" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="96" text-anchor="middle" class="svg-ink" font-size="12">producer</text><text x="70" y="114" text-anchor="middle" class="svg-muted" font-size="11">jobs.put(ip)</text>
<rect x="170" y="80" width="130" height="40" rx="6" fill="#fde68a"/><text x="235" y="104" text-anchor="middle" class="svg-ink" font-size="12">jobs queue</text>
<rect x="350" y="30" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="405" y="52" text-anchor="middle" class="svg-ink" font-size="12">worker 1</text>
<rect x="350" y="83" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="405" y="105" text-anchor="middle" class="svg-ink" font-size="12">worker 2</text>
<rect x="350" y="136" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="405" y="158" text-anchor="middle" class="svg-ink" font-size="12">worker 3</text>
<rect x="510" y="80" width="120" height="40" rx="6" fill="#fde68a"/><text x="570" y="104" text-anchor="middle" class="svg-ink" font-size="12">results queue</text>
<line x1="130" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="47" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="153" stroke="#64748b" stroke-width="2"/>
<line x1="460" y1="47" x2="510" y2="100" stroke="#64748b" stroke-width="2"/><line x1="460" y1="100" x2="510" y2="100" stroke="#64748b" stroke-width="2"/><line x1="460" y1="153" x2="510" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">har job theek ek worker ko jaati hai; locking queue karti hai</text>
</svg><p class="cap">Producer, job queue, workers ki team aur results queue.</p></div>

<h3>Queue ke methods jo chahiye</h3>
<table class="cmp"><tr><th>Method</th><th>Kya karta hai</th></tr>
<tr><td><code>q.put(item)</code></td><td>Item jodta hai; queue ka <code>maxsize</code> ho aur bhari ho to intezaar karta hai</td></tr>
<tr><td><code>q.get()</code></td><td>Sabse purana item nikalta hai; queue khaali ho to intezaar karta hai</td></tr>
<tr><td><code>q.get_nowait()</code></td><td>Item nikalta hai ya turant <code>queue.Empty</code> raise karta hai</td></tr>
<tr><td><code>q.task_done()</code></td><td>Queue ko batata hai ki jo item aapne liya woh poori tarah process ho gaya</td></tr>
<tr><td><code>q.join()</code></td><td>Tab tak rokta hai jab tak put kiya har item done mark na ho jaye</td></tr>
<tr><td><code>q.qsize()</code>, <code>q.empty()</code>, <code>q.full()</code></td><td>Maujooda state; sirf ek snapshot, kyunki doosra thread ek pal baad badal sakta hai</td></tr></table>
<pre class="out">AUTO01$ python3 qapi.py
True 2
Full
Empty after timeout
10.99.0.1 10.99.0.2 True
(1, 'core R1')</pre>
<p>Iske peeche ki script ne <code>maxsize=2</code> wali queue banai, bhari, dikhaya ki <code>put(..., block=False)</code> <code>queue.Full</code> raise karta hai, khaali queue par <code>get(timeout=1)</code> <code>queue.Empty</code> raise karta hai, aur items usi order mein nikalte hain jisme gaye (first in, first out). Aakhri line <code>queue.PriorityQueue</code> use karti hai, jo sabse chhota item pehle deti hai: jodi <code>(1, "core R1")</code> <code>(2, "edge R2")</code> se pehle nikalti hai, yaani zaroori devices ko pehle poll karne ka tareeka.</p>

<h3>Queue se khilayi gayi worker team</h3>
<pre class="code">import queue
import threading
import time

jobs = queue.Queue()
results = queue.Queue()


def worker():
    while True:
        ip = jobs.get()
        time.sleep(1)                     # stands in for the poll
        results.put((ip, "up"))
        jobs.task_done()


t0 = time.perf_counter()
for _ in range(3):
    threading.Thread(target=worker, daemon=True).start()
for n in range(1, 7):
    jobs.put(f"10.99.0.{n}")
jobs.join()
print("queue empty:", jobs.empty(), "results waiting:", results.qsize())
rows = []
while not results.empty():
    rows.append(results.get())
print(sorted(rows))
print(f"{time.perf_counter() - t0:.1f}s for 6 jobs with 3 workers")</pre>
<ul>
<li>Teen workers hamesha loop karte hain: job lo, karo, jawab <b>doosri</b> queue par daalo aur <code>task_done()</code> call karo.</li>
<li>Woh <b>daemon</b> threads hain, isliye program tab bhi khatam ho sakta hai jab woh kaam ka intezaar kar rahe hon.</li>
<li>Main thread producer hai: woh chhe addresses queue par daalta hai.</li>
<li><code>jobs.join()</code> tab tak rukta hai jab tak har job ka <code>task_done()</code> na ho jaye. <code>task_done()</code> bhoole to <code>join()</code> hamesha ruka rahega.</li>
<li>Results bhi queue par jaate hain, isliye lock ki zaroorat nahi; kaam ke baad main thread use khaali karta hai.</li>
</ul>
<pre class="out">AUTO01$ python3 jobs.py
<span class="hl">queue empty: True results waiting: 6</span>
[('10.99.0.1', 'up'), ('10.99.0.2', 'up'), ('10.99.0.3', 'up'), ('10.99.0.4', 'up'), ('10.99.0.5', 'up'), ('10.99.0.6', 'up')]
<span class="hl">2.0s for 6 jobs with 3 workers</span></pre>
<p>Chhe ek-second ki jobs aur teen workers: do waves, do second. Hum <code>sorted(rows)</code> print karte hain kyunki kaunsa worker kaunsi job karega, aur jawab results queue tak kis order mein pahunchenge, iski guarantee nahi.</p>

<h3>Workers ko rokna: sentinel</h3>
<p>Daemon workers un scripts ke liye theek hain jo khatam ho jaati hain. Jab workers ko saaf tareeke se khatam karna ho, har worker ke liye queue par ek <b>sentinel</b> (yahan <code>None</code>) daalo. Jo worker use paata hai woh apna loop chhod deta hai:</p>
<pre class="code">def worker():
    while True:
        ip = jobs.get()
        if ip is None:                    # sentinel: no more work
            break
        time.sleep(1)
        done.append(ip)

workers = [threading.Thread(target=worker) for _ in range(3)]
for w in workers:
    w.start()
for n in range(1, 7):
    jobs.put(f"10.99.0.{n}")
for _ in workers:
    jobs.put(None)
for w in workers:
    w.join()
print(sorted(done))</pre>
<pre class="out">AUTO01$ python3 sentinel.py
['10.99.0.1', '10.99.0.2', '10.99.0.3', '10.99.0.4', '10.99.0.5', '10.99.0.6']</pre>
<p>Sentinels asli jobs ke <i>peeche</i> jaate hain, isliye har worker use milne se pehle asli kaam khatam karta hai.</p>

<div class="note"><p><b>Lab note.</b> Simulator mein jo thread queue ko khaali paakar so chuka ho use doosre thread ka baad ka <code>put</code> jagata nahi. Asli Python jagata hai. Isliye lab mein jobs ko queue par workers ke pehli baar chalne se pehle daalo (jaise upar, jahan workers start hote hain par main thread bina ruke aage badhta hai), ya producer ko consumer se pehle start karo. Workers start karne aur jobs daalne ke beech main thread mein <code>time.sleep</code> par bharosa mat karo. Asli server par dono order chalte hain.</p></div>

<h3>Queue ya pool?</h3>
<p>Devices ki fixed list ke liye <code>ThreadPoolExecutor</code> chhota hai aur exceptions behtar sambhalta hai. Explicit queue tab use karo jab jobs <i>waqt ke saath aati</i> hon (listener jo syslog link flap batane par device jodta hai), jab <b>stages</b> chahiye (collectors parser ko, parser database writer ko khilayein), ya jab <b>back-pressure</b> chahiye: <code>maxsize</code> tez producer ko dheeme consumers ka intezaar karwata hai.</p>

<div class="eg"><p><b>Worked example.</b> Change window mein 24 branch switches check karne hain aur CAB core pair pehle maangta hai. <code>PriorityQueue</code> par <code>(0, "core1")</code>, <code>(0, "core2")</code> aur <code>(1, "branch01")</code> waghera daalo. Workers hamesha sabse chhota number lete hain, isliye core devices kisi bhi branch se pehle poll hote hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>task_done()</code> bhool jana, jisse <code>join()</code> hang ho jaata hai. <code>get()</code> call karna hai ya nahi yeh <code>q.empty()</code> se tay karna (beech mein doosra thread aakhri item le sakta hai; <code>get_nowait()</code> use karo aur <code>queue.Empty</code> pakdo). Sentinel ko asli jobs ke aage daalna. Ek results list share karke use <code>+=</code> se badalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Khaali queue par <code>get()</code> hamesha block karta hai jab tak <code>timeout</code> na do ya <code>get_nowait()</code> use na karo. Threaded program mein <code>qsize()</code> aur <code>empty()</code> sirf andaaza hain. <code>queue</code> module thread-safe hai; <code>collections.deque</code> aur plain lists workers ke beech hand-over ke liye design nahi hui.</p></div>

<div class="scn"><h4>Collector jo 99 percent par atak gaya</h4><p>Ek team ne worker-aur-queue wala poller banaya. Woh hamesha 120 mein se 119 results print karta aur phir tab tak baitha rehta jab tak koi Ctrl+C na dabaye. Worker loop ki ek branch, failed login ka <code>except</code> clause, <code>task_done()</code> call kiye bina return ho jaati thi, isliye <code>jobs.join()</code> hamesha ek kam rehta tha. <code>task_done()</code> ko <code>finally</code> block mein le jaane se theek ho gaya.</p><p><b>Lesson:</b> har <code>get()</code> ko theek ek <code>task_done()</code> chahiye, failure par bhi.</p></div>

<div class="iv"><p class="q">"Producer-consumer pattern samjhao aur network automation mein kahan use karoge."</p><p>Producers thread-safe queue par kaam daalte hain aur consumers nikalte hain, isliye dono taraf apni raftaar se chalti hain bina manual locking ke. Main ise tab use karunga jab devices waqt ke saath aayein, jaise syslog-triggered checks, ya jab collection, parsing aur storing alag stages hon. Fixed device list ke liye main aam taur par thread pool use karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>queue.Queue</code> thread-safe hai: <code>put</code>, <code>get</code>, <code>task_done</code> aur <code>join</code> ko extra lock nahi chahiye.</li>
<li>Har <code>get()</code> ke saath ek <code>task_done()</code> jodo, errors possible hon to <code>finally</code> mein.</li>
<li>Results doosri queue par wapas bhejo; order matter kare to sort karo.</li>
<li>Workers ko rokne ke liye har worker ke liye ek sentinel, asli jobs ke peeche queue karke.</li>
<li>Waqt ke saath aati jobs, stages ya back-pressure ke liye queue; fixed list ke liye pool.</li>
</ul></div>
`}};export{e as default};