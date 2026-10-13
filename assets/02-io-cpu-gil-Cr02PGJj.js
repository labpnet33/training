var e={id:`io-cpu-gil`,h:{en:`I/O-bound or CPU-bound work, and the GIL in plain words`,hi:`I/O-bound ya CPU-bound kaam, aur GIL saadi bhasha mein`},body:{en:`
<p><b>The idea of this chapter:</b> before you reach for threads, ask one question: while my script runs, is it <i>waiting</i> or is it <i>computing</i>? The answer decides whether threads help at all.</p>

<h3>Analogy: the chef and the oven</h3>
<p>A chef chopping vegetables is busy every second; a second chef next to him chopping at the same board would only get in the way. That is <b>CPU-bound</b> work: the processor is the bottleneck. A chef who puts a tray in the oven and then stands for forty minutes is <b>I/O-bound</b>: the bottleneck is something outside him. While the oven works, he could prepare five other trays. Network scripts are almost always the second kind. The "oven" is the router, the cable, the SSH handshake or the API server.</p>

<table class="cmp"><tr><th>Job</th><th>What limits it</th><th>Type</th><th>Good tool</th></tr>
<tr><td>Log in to 50 routers and run <code>show version</code></td><td>Network and device response</td><td>I/O-bound</td><td>Threads</td></tr>
<tr><td>Ping sweep of a /24</td><td>Waiting for replies</td><td>I/O-bound</td><td>Threads</td></tr>
<tr><td>Fetch interface data from 30 REST APIs</td><td>Waiting for servers</td><td>I/O-bound</td><td>Threads</td></tr>
<tr><td>Parse a 2 GB syslog export with regexes</td><td>Processor speed</td><td>CPU-bound</td><td>Separate processes</td></tr>
<tr><td>Hash thousands of config files</td><td>Processor speed</td><td>CPU-bound</td><td>Separate processes</td></tr>
<tr><td>Subnet maths for 200 000 prefixes</td><td>Processor speed</td><td>CPU-bound</td><td>Separate processes</td></tr></table>

<h3>The GIL in plain words</h3>
<p>The standard Python interpreter, CPython, has one big lock called the <b>Global Interpreter Lock</b>, or <b>GIL</b>. It lets only one thread execute Python instructions at a time, even on a server with many cores. That sounds like the end of threads, but there is a rule that saves them: a thread <b>lets go of the GIL whenever it waits</b> for the network, a file, a sleep or a subprocess. While thread A is blocked waiting for R1, thread B can run Python code or send a packet to R2.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Threads take turns holding the GIL but waits overlap">
<text x="10" y="24" class="svg-ink" font-size="13">GIL: one thread runs Python at a time</text>
<text x="40" y="62" class="svg-muted" font-size="11">Thread A</text>
<rect x="110" y="48" width="40" height="20" fill="#bae6fd"/><rect x="150" y="48" width="260" height="20" fill="#e2e8f0"/><rect x="410" y="48" width="40" height="20" fill="#bae6fd"/>
<text x="280" y="62" text-anchor="middle" class="svg-muted" font-size="11">waiting for R1 (GIL released)</text>
<text x="40" y="102" class="svg-muted" font-size="11">Thread B</text>
<rect x="110" y="88" width="40" height="20" fill="#e2e8f0"/><rect x="150" y="88" width="40" height="20" fill="#bbf7d0"/><rect x="190" y="88" width="260" height="20" fill="#e2e8f0"/>
<text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="11">waiting for R2</text>
<text x="40" y="142" class="svg-muted" font-size="11">Thread C</text>
<rect x="110" y="128" width="80" height="20" fill="#e2e8f0"/><rect x="190" y="128" width="40" height="20" fill="#ddd6fe"/><rect x="230" y="128" width="220" height="20" fill="#e2e8f0"/>
<text x="340" y="142" text-anchor="middle" class="svg-muted" font-size="11">waiting for R3</text>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">coloured = running Python, grey = waiting; the waits overlap</text>
</svg><p class="cap">Only the coloured slices need the GIL. The long grey waits do not.</p></div>

<p>For CPU-bound code there is nothing to release. Four threads crunching numbers on a four-core server still take turns and finish no sooner than one thread would. For that kind of job you use separate <b>processes</b> (the <code>multiprocessing</code> module, not available in the lab), each with its own interpreter and its own GIL. Recent Python versions also offer an experimental build without the GIL, but this track teaches the standard behaviour you will meet on real servers.</p>

<h3>Measuring it in the lab</h3>
<p>Here a function that only waits stands in for one router. It runs ten times one by one, then ten times in a pool of ten threads:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor


def wait_for_router(ip):
    time.sleep(1)           # stands in for the time a router takes to answer
    return ip


ips = [f"10.99.0.{n}" for n in range(1, 11)]

t0 = time.perf_counter()
for ip in ips:
    wait_for_router(ip)
print(f"one by one:  {time.perf_counter() - t0:.1f}s")

t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    list(pool.map(wait_for_router, ips))
print(f"ten threads: {time.perf_counter() - t0:.1f}s")</pre>
<ul>
<li><code>time.sleep(1)</code> is a pure wait, exactly like waiting for a reply. It releases the GIL.</li>
<li><code>time.perf_counter()</code> is a stopwatch. Subtracting two readings gives the elapsed seconds.</li>
<li><code>list(pool.map(...))</code> runs every call and collects the results; here we ignore them.</li>
</ul>
<pre class="out">AUTO01$ python3 waits.py
one by one:  <span class="hl">10.0s</span>
ten threads: <span class="hl">1.0s</span></pre>
<p>Ten waits of one second: ten seconds in a row, one second when they overlap. If the function had been busy computing for one second instead, real Python threads would still take about ten seconds in total. The lab cannot show that, because its clock is virtual and counts waits, so remember the rule instead: <b>threads help waiting, not computing</b>.</p>

<h3>How to tell which kind you have</h3>
<p>Run the script and watch the server with <code>top</code>. If the process sits near 100 percent of one core, it is CPU-bound. If it sits near 0 to 5 percent while the clock runs, it is waiting, and threads will help. A quick mental test works too: does the slow line talk to something outside the server? SSH, ping, REST and DNS all do.</p>

<div class="eg"><p><b>Worked example.</b> A report script logs in to 40 switches (3 s each of waiting) and then builds a summary with a few string operations (milliseconds). Threads cut the 120 s of waiting to about 12 s with 10 workers. The summary step is so small that the GIL does not matter. If the same script also had to hash 5 GB of backups, that part would not speed up with threads.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding threads to a CPU-heavy parser and wondering why nothing improved. Assuming "more workers is always faster": beyond the number of devices there is nothing left to overlap. Measuring only on one run; network time varies.</p></div>
<div class="exam"><p><b>Exam trap.</b> The GIL does not stop threads from helping network scripts. It stops them from running Python bytecode in parallel. The GIL is released during blocking I/O, so I/O-bound threads overlap well.</p></div>

<div class="scn"><h4>Threads that changed nothing</h4><p>A team wrapped a log analyser in a thread pool of 8. The nightly run still took 40 minutes. <code>top</code> showed one core at 100 percent and the rest idle: the job was parsing text, not waiting. Splitting the file into chunks handled by separate processes brought it down to 7 minutes. The device collection step, which genuinely waited on SSH, was already threaded and fast.</p><p><b>Lesson:</b> diagnose waiting versus computing before choosing the tool.</p></div>

<div class="iv"><p class="q">"What is the GIL and does it make threads useless in Python?"</p><p>The GIL is a lock in CPython that lets one thread run Python bytecode at a time. Threads are not useless: the lock is released during blocking I/O such as network calls, so I/O-bound jobs like polling routers overlap well. For CPU-bound work I would use multiple processes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>I/O-bound work waits on something outside the program; CPU-bound work is limited by the processor.</li>
<li>SSH, ping, REST and DNS are I/O-bound, so threads suit them.</li>
<li>The GIL allows one thread to run Python at a time but is released while waiting.</li>
<li>CPU-bound jobs need separate processes, not threads.</li>
<li>Check with <code>top</code>: near 100 percent means computing, near zero means waiting.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> threads uthane se pehle ek sawaal poochho: jab meri script chalti hai, woh <i>intezaar</i> kar rahi hai ya <i>compute</i>? Jawab tay karta hai ki threads kaam aayenge ya nahi.</p>

<h3>Analogy: chef aur oven</h3>
<p>Sabzi kaatne wala chef har second busy hai; uske bagal mein doosra chef usi board par kaatega to sirf raasta rokega. Yeh <b>CPU-bound</b> kaam hai: processor bottleneck hai. Jo chef tray oven mein rakhkar chaalis minute khada rehta hai woh <b>I/O-bound</b> hai: bottleneck uske bahar ki cheez hai. Oven kaam kar raha hai to woh paanch aur trays taiyaar kar sakta tha. Network scripts lagbhag hamesha doosre type ki hoti hain. "Oven" router hai, cable hai, SSH handshake hai ya API server.</p>

<table class="cmp"><tr><th>Kaam</th><th>Kya rokta hai</th><th>Type</th><th>Achha tool</th></tr>
<tr><td>50 routers mein login karke <code>show version</code></td><td>Network aur device ka jawab</td><td>I/O-bound</td><td>Threads</td></tr>
<tr><td>/24 ka ping sweep</td><td>Replies ka intezaar</td><td>I/O-bound</td><td>Threads</td></tr>
<tr><td>30 REST APIs se interface data</td><td>Servers ka intezaar</td><td>I/O-bound</td><td>Threads</td></tr>
<tr><td>2 GB syslog export regex se parse karna</td><td>Processor speed</td><td>CPU-bound</td><td>Alag processes</td></tr>
<tr><td>Hazaaron config files ka hash</td><td>Processor speed</td><td>CPU-bound</td><td>Alag processes</td></tr>
<tr><td>2 lakh prefixes ka subnet maths</td><td>Processor speed</td><td>CPU-bound</td><td>Alag processes</td></tr></table>

<h3>GIL saadi bhasha mein</h3>
<p>Standard Python interpreter, CPython, mein ek bada lock hai jise <b>Global Interpreter Lock</b> yaani <b>GIL</b> kehte hain. Yeh ek waqt mein sirf ek thread ko Python instructions chalane deta hai, chahe server mein bahut cores hon. Yeh threads ka ant lagta hai, par ek rule unhe bachata hai: thread <b>jab bhi intezaar karta hai to GIL chhod deta hai</b>, chahe network ka ho, file ka, sleep ka ya subprocess ka. Thread A R1 ka intezaar karte hue ruka hai, to thread B Python code chala sakta hai ya R2 ko packet bhej sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Threads GIL baari-baari pakadte hain par intezaar overlap hote hain">
<text x="10" y="24" class="svg-ink" font-size="13">GIL: ek waqt mein ek thread Python chalata hai</text>
<text x="40" y="62" class="svg-muted" font-size="11">Thread A</text>
<rect x="110" y="48" width="40" height="20" fill="#bae6fd"/><rect x="150" y="48" width="260" height="20" fill="#e2e8f0"/><rect x="410" y="48" width="40" height="20" fill="#bae6fd"/>
<text x="280" y="62" text-anchor="middle" class="svg-muted" font-size="11">R1 ka intezaar (GIL chhoda)</text>
<text x="40" y="102" class="svg-muted" font-size="11">Thread B</text>
<rect x="110" y="88" width="40" height="20" fill="#e2e8f0"/><rect x="150" y="88" width="40" height="20" fill="#bbf7d0"/><rect x="190" y="88" width="260" height="20" fill="#e2e8f0"/>
<text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="11">R2 ka intezaar</text>
<text x="40" y="142" class="svg-muted" font-size="11">Thread C</text>
<rect x="110" y="128" width="80" height="20" fill="#e2e8f0"/><rect x="190" y="128" width="40" height="20" fill="#ddd6fe"/><rect x="230" y="128" width="220" height="20" fill="#e2e8f0"/>
<text x="340" y="142" text-anchor="middle" class="svg-muted" font-size="11">R3 ka intezaar</text>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">rangeen = Python chal raha hai, grey = intezaar; intezaar overlap hote hain</text>
</svg><p class="cap">GIL sirf rangeen tukdon ko chahiye. Lambe grey intezaaron ko nahi.</p></div>

<p>CPU-bound code mein chhodne ko kuch hota hi nahi. Chaar-core server par number crunch karte chaar threads bhi baari-baari chalte hain aur ek thread se jaldi khatam nahi hote. Aise kaam ke liye alag <b>processes</b> use karte hain (<code>multiprocessing</code> module, lab mein available nahi), jinme har ek ka apna interpreter aur apna GIL hota hai. Naye Python versions GIL ke bina ek experimental build bhi dete hain, par yeh track woh standard behaviour sikhata hai jo aapko asli servers par milega.</p>

<h3>Lab mein naapna</h3>
<p>Yahan sirf intezaar karne wala function ek router ki jagah khada hai. Woh dus baar ek-ek karke chalta hai, phir dus threads ke pool mein dus baar:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor


def wait_for_router(ip):
    time.sleep(1)           # stands in for the time a router takes to answer
    return ip


ips = [f"10.99.0.{n}" for n in range(1, 11)]

t0 = time.perf_counter()
for ip in ips:
    wait_for_router(ip)
print(f"one by one:  {time.perf_counter() - t0:.1f}s")

t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    list(pool.map(wait_for_router, ips))
print(f"ten threads: {time.perf_counter() - t0:.1f}s")</pre>
<ul>
<li><code>time.sleep(1)</code> pure intezaar hai, bilkul reply ke intezaar jaisa. Yeh GIL chhodta hai.</li>
<li><code>time.perf_counter()</code> stopwatch hai. Do readings ka antar beeta hua second deta hai.</li>
<li><code>list(pool.map(...))</code> har call chalata hai aur results jama karta hai; yahan hum unhe ignore karte hain.</li>
</ul>
<pre class="out">AUTO01$ python3 waits.py
one by one:  <span class="hl">10.0s</span>
ten threads: <span class="hl">1.0s</span></pre>
<p>Ek-ek second ke dus intezaar: lagaataar dus second, overlap hon to ek second. Agar function ek second intezaar ki jagah compute karta hota, to asli Python threads mein bhi total lagbhag dus second lagte. Lab yeh dikha nahi sakta kyunki uski clock virtual hai aur intezaar ginti hai, isliye rule yaad rakho: <b>threads intezaar ko tez karte hain, computing ko nahi</b>.</p>

<h3>Kaise pata chale ki kaunsa type hai</h3>
<p>Script chalao aur server ko <code>top</code> se dekho. Process ek core ke 100 percent ke aaspaas ho to CPU-bound hai. Clock chalte hue 0 se 5 percent ke aaspaas ho to woh intezaar kar rahi hai, aur threads madad karenge. Ek mental test bhi chalta hai: kya dheemi line server ke bahar kisi se baat karti hai? SSH, ping, REST aur DNS sab karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek report script 40 switches mein login karti hai (har ek 3 s intezaar) aur phir kuch string operations se summary banati hai (milliseconds). Threads 120 s ke intezaar ko 10 workers ke saath lagbhag 12 s kar dete hain. Summary step itna chhota hai ki GIL matter nahi karta. Agar wahi script 5 GB backups ka hash bhi nikalti, to woh hissa threads se tez nahi hota.</p></div>

<div class="warn"><p><b>Common mistakes.</b> CPU-heavy parser mein threads jodkar hairan hona ki kuch behtar kyon nahi hua. Yeh maanna ki "zyada workers hamesha tez": devices ki ginti ke baad overlap karne ko kuch bachta hi nahi. Sirf ek run par naapna; network time badalta rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> GIL threads ko network scripts mein madad karne se nahi rokta. Woh sirf Python bytecode ko parallel chalne se rokta hai. Blocking I/O ke dauraan GIL release hota hai, isliye I/O-bound threads achhe se overlap karte hain.</p></div>

<div class="scn"><h4>Threads jisse kuch nahi badla</h4><p>Ek team ne log analyser ko 8 ke thread pool mein lapeta. Nightly run phir bhi 40 minute leta raha. <code>top</code> ne ek core 100 percent dikhaya aur baaki khaali: job text parse kar rahi thi, intezaar nahi. File ko chunks mein baantkar alag processes se chalaya to 7 minute reh gaya. Device collection step, jo sach mein SSH par intezaar karta tha, pehle se threaded aur tez tha.</p><p><b>Lesson:</b> tool chunne se pehle diagnose karo ki intezaar hai ya computing.</p></div>

<div class="iv"><p class="q">"GIL kya hai aur kya isse Python mein threads bekaar ho jaate hain?"</p><p>GIL CPython ka lock hai jo ek waqt mein ek thread ko Python bytecode chalane deta hai. Threads bekaar nahi hote: blocking I/O jaise network calls ke dauraan lock release hota hai, isliye routers poll karne jaise I/O-bound jobs achhe se overlap karte hain. CPU-bound kaam ke liye main multiple processes use karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>I/O-bound kaam program ke bahar kisi cheez ka intezaar karta hai; CPU-bound kaam processor se limited hota hai.</li>
<li>SSH, ping, REST aur DNS I/O-bound hain, isliye threads unke liye theek hain.</li>
<li>GIL ek waqt mein ek thread ko Python chalane deta hai par intezaar ke dauraan release hota hai.</li>
<li>CPU-bound jobs ko threads nahi, alag processes chahiye.</li>
<li><code>top</code> se check karo: 100 percent ke paas matlab compute, zero ke paas matlab intezaar.</li>
</ul></div>
`}};export{e as default};