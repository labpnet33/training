var e={id:`thread-basics`,h:{en:`threading.Thread: start, join, args and daemon`,hi:`threading.Thread: start, join, args aur daemon`},body:{en:`
<p><b>The idea of this chapter:</b> a <b>thread</b> is one more line of execution inside your program. You hand it a function, start it, and later wait for it to finish. Four words cover almost everything: <code>target</code>, <code>start</code>, <code>join</code> and <code>args</code>.</p>

<h3>Analogy: handing out job cards</h3>
<p>You are the shift manager. A job card says "go and check router 10.99.0.1". You give a card to a waiter (<code>target</code> and <code>args</code>), tell him to go (<code>start</code>), and carry on with your own work. Before you write the end-of-shift report you wait at the door until every waiter is back (<code>join</code>). Writing the report before they return gives you an empty report. That one picture explains the most common thread bug.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Main thread starts three threads then joins them">
<rect x="20" y="20" width="600" height="34" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">main thread: create threads, start them all, then join them all</text>
<line x1="150" y1="54" x2="150" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="54" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="490" y1="54" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="80" width="180" height="30" rx="8" fill="#bbf7d0"/><text x="150" y="100" text-anchor="middle" class="svg-ink" font-size="12">thread poll-10.99.0.1</text>
<rect x="230" y="80" width="180" height="30" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">thread poll-10.99.0.2</text>
<rect x="400" y="80" width="180" height="30" rx="8" fill="#bbf7d0"/><text x="490" y="100" text-anchor="middle" class="svg-ink" font-size="12">thread poll-10.99.0.4</text>
<line x1="150" y1="110" x2="150" y2="136" stroke="#64748b" stroke-width="2"/><line x1="320" y1="110" x2="320" y2="136" stroke="#64748b" stroke-width="2"/><line x1="490" y1="110" x2="490" y2="136" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="136" width="600" height="34" rx="8" fill="#fde68a"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">join() returns when the thread has finished; now it is safe to read results</text>
</svg><p class="cap">Start every thread first, then join every thread.</p></div>

<h3>The smallest useful example</h3>
<pre class="code">import threading
import time

IPS = ["10.99.0.1", "10.99.0.2", "10.99.0.4"]
results = []


def poll(ip):
    time.sleep(1)               # stands in for a slow login
    results.append(ip)


t0 = time.perf_counter()
threads = [threading.Thread(target=poll, args=(ip,), name="poll-" + ip) for ip in IPS]
for t in threads:
    t.start()
print("before join:", len(results), "results")
for t in threads:
    t.join()
print("after join: ", len(results), "results")
print(sorted(results))
print([t.name for t in threads], [t.is_alive() for t in threads])
print(f"{time.perf_counter() - t0:.1f}s")</pre>
<ul>
<li><code>target=poll</code> is the function itself. There are <b>no brackets</b>, because we are handing over the card, not doing the job.</li>
<li><code>args=(ip,)</code> is a tuple of arguments. With one argument the trailing comma is required: <code>(ip,)</code> is a tuple, <code>(ip)</code> is just <code>ip</code>.</li>
<li><code>name=</code> labels the thread, which makes logs and tracebacks readable.</li>
<li><code>t.start()</code> begins the thread. <code>t.join()</code> blocks until it ends. <code>t.is_alive()</code> asks whether it is still running.</li>
</ul>
<pre class="out">AUTO01$ python3 basics.py
<span class="hl">before join: 0 results</span>
<span class="hl">after join:  3 results</span>
['10.99.0.1', '10.99.0.2', '10.99.0.4']
['poll-10.99.0.1', 'poll-10.99.0.2', 'poll-10.99.0.4'] [False, False, False]
<span class="hl">1.0s</span></pre>
<p>Before <code>join</code> nothing has finished yet, so the list is empty. After <code>join</code> all three results are in. Three one-second waits took one second because they overlapped. We print <code>sorted(results)</code> because threads finish in whatever order the network decides; on a real server the order of <code>results</code> is the finishing order, which changes between runs.</p>

<h3>The bug everyone writes first</h3>
<pre class="code">import threading
import time


def slow(ip):
    time.sleep(1)
    print("polled", ip)


t = threading.Thread(target=slow("10.99.0.1"))
t.start()
t.join()
print("done")</pre>
<p><code>slow("10.99.0.1")</code> with brackets <i>calls</i> the function right now, in the main thread, and hands its return value, <code>None</code>, to <code>Thread</code>. The new thread has nothing to do. Nothing ran in parallel and the program paid the full wait:</p>
<pre class="out">AUTO01$ python3 wrongcall.py
polled 10.99.0.1
done</pre>
<p>Nothing looks wrong, which is why it is dangerous. The cure is <code>Thread(target=slow, args=("10.99.0.1",))</code>. Lab 2 hides exactly this bug in <code>threaded.py</code>.</p>

<h3>A thread as a class</h3>
<p>If a poller carries its own state, subclass <code>Thread</code>, override <code>run</code> and keep the answer on the object. This builds on <b>py-oop</b>.</p>
<pre class="code">import threading
import time


class Poller(threading.Thread):
    def __init__(self, ip):
        super().__init__()
        self.ip = ip
        self.state = None

    def run(self):
        time.sleep(1)
        self.state = "up"


pollers = [Poller(f"10.99.0.{n}") for n in (1, 2, 4)]
for p in pollers:
    p.start()
for p in pollers:
    p.join()
print([(p.ip, p.state) for p in pollers])
p = pollers[0]
try:
    p.start()
except RuntimeError as err:
    print("RuntimeError:", err)</pre>
<pre class="out">AUTO01$ python3 poller.py
[('10.99.0.1', 'up'), ('10.99.0.2', 'up'), ('10.99.0.4', 'up')]
<span class="hl">RuntimeError: threads can only be started once</span></pre>
<p>A thread object runs once. To poll again, create a new one.</p>

<h3>Return values and daemon threads</h3>
<p>A thread cannot <code>return</code> a value to you. Use a list, a dictionary, a queue (chapter 7) or, best of all, a pool's <code>Future</code> (chapter 5). A <b>daemon</b> thread (<code>daemon=True</code>) is a background helper that does not keep the program alive: when the main thread ends, daemon threads are dropped. A normal thread is waited for. Use daemons for endless helpers, never for work whose result you need.</p>

<div class="warn"><p><b>Common mistakes.</b> Brackets after <code>target=worker</code>. A single argument written as <code>(ip)</code> instead of <code>(ip,)</code>. Calling <code>join</code> inside the same loop as <code>start</code>, which waits for each thread before starting the next and throws away the speed-up. Starting a thread twice. Printing from many threads and expecting ordered lines.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>start()</code> runs the function in a new thread; calling <code>run()</code> directly runs it in the current thread. And <code>join()</code> waits; it does not stop a thread.</p></div>

<div class="scn"><h4>The report with zero devices</h4><p>An engineer started ten polling threads and immediately printed "polled 0 devices, 0 failures" in the summary. The threads were fine; the summary line ran before they finished. Adding a second loop with <code>t.join()</code> before the summary fixed it.</p><p><b>Lesson:</b> never read results until every thread has been joined.</p></div>

<div class="iv"><p class="q">"What is the difference between start and join?"</p><p><code>start</code> launches the thread and returns at once. <code>join</code> blocks the caller until that thread finishes. I start all threads first, then join them all, so the work overlaps, and only then read the results.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Thread(target=func, args=(x,))</code>: pass the function, not its result.</li>
<li>Start all threads, then join all threads, then read results.</li>
<li>A one-item args tuple needs a trailing comma.</li>
<li>A thread cannot return a value; store the answer somewhere safe.</li>
<li>A thread object can be started only once; daemon threads do not keep the program alive.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <b>thread</b> aapke program ke andar execution ki ek aur line hai. Aap use ek function dete ho, start karte ho, aur baad mein uske khatam hone ka intezaar karte ho. Chaar shabd lagbhag sab kuch cover karte hain: <code>target</code>, <code>start</code>, <code>join</code> aur <code>args</code>.</p>

<h3>Analogy: job cards baantna</h3>
<p>Aap shift manager ho. Job card par likha hai "router 10.99.0.1 check karke aao". Aap card waiter ko dete ho (<code>target</code> aur <code>args</code>), use jaane ko kehte ho (<code>start</code>), aur apna kaam karte rehte ho. End-of-shift report likhne se pehle aap darwaaze par khade rehte ho jab tak har waiter laut na aaye (<code>join</code>). Unke laut ne se pehle report likhoge to khaali report milegi. Yeh ek tasveer sabse aam thread bug samjha deti hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Main thread teen threads start karta hai phir join karta hai">
<rect x="20" y="20" width="600" height="34" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">main thread: threads banao, sabko start karo, phir sabko join karo</text>
<line x1="150" y1="54" x2="150" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="54" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="490" y1="54" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="80" width="180" height="30" rx="8" fill="#bbf7d0"/><text x="150" y="100" text-anchor="middle" class="svg-ink" font-size="12">thread poll-10.99.0.1</text>
<rect x="230" y="80" width="180" height="30" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">thread poll-10.99.0.2</text>
<rect x="400" y="80" width="180" height="30" rx="8" fill="#bbf7d0"/><text x="490" y="100" text-anchor="middle" class="svg-ink" font-size="12">thread poll-10.99.0.4</text>
<line x1="150" y1="110" x2="150" y2="136" stroke="#64748b" stroke-width="2"/><line x1="320" y1="110" x2="320" y2="136" stroke="#64748b" stroke-width="2"/><line x1="490" y1="110" x2="490" y2="136" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="136" width="600" height="34" rx="8" fill="#fde68a"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">join() tab lautta hai jab thread khatam ho; ab results padhna safe hai</text>
</svg><p class="cap">Pehle har thread start karo, phir har thread join karo.</p></div>

<h3>Sabse chhota kaam ka example</h3>
<pre class="code">import threading
import time

IPS = ["10.99.0.1", "10.99.0.2", "10.99.0.4"]
results = []


def poll(ip):
    time.sleep(1)               # stands in for a slow login
    results.append(ip)


t0 = time.perf_counter()
threads = [threading.Thread(target=poll, args=(ip,), name="poll-" + ip) for ip in IPS]
for t in threads:
    t.start()
print("before join:", len(results), "results")
for t in threads:
    t.join()
print("after join: ", len(results), "results")
print(sorted(results))
print([t.name for t in threads], [t.is_alive() for t in threads])
print(f"{time.perf_counter() - t0:.1f}s")</pre>
<ul>
<li><code>target=poll</code> function khud hai. <b>Brackets nahi</b>, kyunki hum card de rahe hain, kaam nahi kar rahe.</li>
<li><code>args=(ip,)</code> arguments ka tuple hai. Ek argument ho to trailing comma zaroori hai: <code>(ip,)</code> tuple hai, <code>(ip)</code> sirf <code>ip</code> hai.</li>
<li><code>name=</code> thread ko label deta hai, jisse logs aur tracebacks padhne layak bante hain.</li>
<li><code>t.start()</code> thread shuru karta hai. <code>t.join()</code> uske khatam hone tak rokta hai. <code>t.is_alive()</code> poochta hai ki abhi chal raha hai ya nahi.</li>
</ul>
<pre class="out">AUTO01$ python3 basics.py
<span class="hl">before join: 0 results</span>
<span class="hl">after join:  3 results</span>
['10.99.0.1', '10.99.0.2', '10.99.0.4']
['poll-10.99.0.1', 'poll-10.99.0.2', 'poll-10.99.0.4'] [False, False, False]
<span class="hl">1.0s</span></pre>
<p><code>join</code> se pehle kuch khatam nahi hua, isliye list khaali hai. <code>join</code> ke baad teeno results aa gaye. Teen ek-second ke intezaar ek second mein hue kyunki woh overlap hue. Hum <code>sorted(results)</code> print karte hain kyunki threads us order mein khatam hote hain jo network tay kare; asli server par <code>results</code> ka order khatam hone ka order hota hai, jo har run mein badalta hai.</p>

<h3>Woh bug jo sab sabse pehle likhte hain</h3>
<pre class="code">import threading
import time


def slow(ip):
    time.sleep(1)
    print("polled", ip)


t = threading.Thread(target=slow("10.99.0.1"))
t.start()
t.join()
print("done")</pre>
<p>Brackets ke saath <code>slow("10.99.0.1")</code> function ko abhi, main thread mein, <i>call</i> kar deta hai, aur uski return value <code>None</code> ko <code>Thread</code> ko de deta hai. Naye thread ke paas karne ko kuch nahi. Kuch parallel nahi chala aur program ne poora intezaar bhara:</p>
<pre class="out">AUTO01$ python3 wrongcall.py
polled 10.99.0.1
done</pre>
<p>Kuch galat nahi dikhta, isliye yeh khatarnak hai. Ilaj hai <code>Thread(target=slow, args=("10.99.0.1",))</code>. Lab 2 mein <code>threaded.py</code> mein theek yahi bug chhupa hai.</p>

<h3>Class ke roop mein thread</h3>
<p>Agar poller apni state khud rakhta hai, to <code>Thread</code> ka subclass banao, <code>run</code> override karo aur jawab object par rakho. Yeh <b>py-oop</b> par bana hai.</p>
<pre class="code">import threading
import time


class Poller(threading.Thread):
    def __init__(self, ip):
        super().__init__()
        self.ip = ip
        self.state = None

    def run(self):
        time.sleep(1)
        self.state = "up"


pollers = [Poller(f"10.99.0.{n}") for n in (1, 2, 4)]
for p in pollers:
    p.start()
for p in pollers:
    p.join()
print([(p.ip, p.state) for p in pollers])
p = pollers[0]
try:
    p.start()
except RuntimeError as err:
    print("RuntimeError:", err)</pre>
<pre class="out">AUTO01$ python3 poller.py
[('10.99.0.1', 'up'), ('10.99.0.2', 'up'), ('10.99.0.4', 'up')]
<span class="hl">RuntimeError: threads can only be started once</span></pre>
<p>Thread object sirf ek baar chalta hai. Dobara poll karna ho to naya banao.</p>

<h3>Return values aur daemon threads</h3>
<p>Thread aapko value <code>return</code> nahi kar sakta. List, dictionary, queue (chapter 7) ya, sabse achha, pool ka <code>Future</code> (chapter 5) use karo. <b>Daemon</b> thread (<code>daemon=True</code>) background helper hai jo program ko zinda nahi rakhta: main thread khatam ho to daemon threads chhod diye jaate hain. Normal thread ka intezaar hota hai. Daemons ko khatam na hone wale helpers ke liye use karo, aise kaam ke liye kabhi nahi jiska result chahiye.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>target=worker</code> ke baad brackets. Ek argument ko <code>(ip,)</code> ki jagah <code>(ip)</code> likhna. <code>join</code> ko <code>start</code> wale hi loop mein call karna, jo har thread ka intezaar agle ko start karne se pehle karta hai aur speed-up ganwa deta hai. Thread ko do baar start karna. Bahut threads se print karke ordered lines ki ummeed karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>start()</code> function ko naye thread mein chalata hai; <code>run()</code> seedha call karo to woh current thread mein chalta hai. Aur <code>join()</code> intezaar karta hai; thread ko rokta nahi.</p></div>

<div class="scn"><h4>Zero devices wali report</h4><p>Ek engineer ne dus polling threads start kiye aur turant summary mein "polled 0 devices, 0 failures" print kar diya. Threads theek the; summary line unke khatam hone se pehle chal gayi. Summary se pehle <code>t.join()</code> wala doosra loop jodne se theek ho gaya.</p><p><b>Lesson:</b> jab tak har thread join na ho jaye, results mat padho.</p></div>

<div class="iv"><p class="q">"start aur join mein kya fark hai?"</p><p><code>start</code> thread launch karta hai aur turant lautta hai. <code>join</code> caller ko tab tak rokta hai jab tak woh thread khatam na ho. Main pehle saare threads start karta hoon, phir sabko join karta hoon, taaki kaam overlap ho, aur tabhi results padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Thread(target=func, args=(x,))</code>: function do, uska result nahi.</li>
<li>Saare threads start karo, saare join karo, phir results padho.</li>
<li>Ek item ke args tuple mein trailing comma chahiye.</li>
<li>Thread value return nahi kar sakta; jawab kisi safe jagah rakho.</li>
<li>Thread object sirf ek baar start hota hai; daemon threads program ko zinda nahi rakhte.</li>
</ul></div>
`}};export{e as default};