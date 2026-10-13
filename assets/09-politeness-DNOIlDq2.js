var e={id:`politeness`,h:{en:`Being polite: worker limits, rate limiting, session caps and retries`,hi:`Tameez se pesh aana: worker limits, rate limiting, session caps aur retries`},body:{en:`
<p><b>The idea of this chapter:</b> a thread pool makes it easy to do in two seconds what used to take two minutes, and just as easy to knock over the very network you are trying to look after. A fast script that locks out a router, overloads the AAA server or trips a security alarm is a bad script. Politeness is part of the design.</p>

<h3>Analogy: fifty waiters, one kitchen door</h3>
<p>Fifty waiters arriving at the kitchen door at the same moment do not get food faster. They jam the door, the chef gets flustered and orders are dropped. A good restaurant lets a few waiters through at a time and spaces out the rest. Your devices, your login servers and your jump host are that door.</p>

<h3>What can be overloaded</h3>
<table class="cmp"><tr><th>Resource</th><th>What happens when you push too hard</th></tr>
<tr><td>VTY lines on a device</td><td>An IOS router configured with <code>line vty 0 4</code> has five management sessions. A sixth login is refused, and so is the engineer who needs to fix an outage while your script holds them. (The lab routers are built this way, but the lab does not enforce the limit; real devices do.)</td></tr>
<tr><td>Device CPU</td><td>Heavy <code>show</code> commands on every device in a region at once can slow the control plane.</td></tr>
<tr><td>AAA (RADIUS or TACACS+) server</td><td>Fifty logins in one second look like an attack and may be rate-limited or fail with authentication errors.</td></tr>
<tr><td>Jump host or firewall</td><td>Connection-rate limits and session tables are finite.</td></tr>
<tr><td>Your own server</td><td>Each thread uses memory and a socket; hundreds of idle threads are wasteful.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three controls in front of devices: worker limit, session cap and rate limit">
<rect x="10" y="60" width="120" height="70" rx="10" fill="#bae6fd"/><text x="70" y="90" text-anchor="middle" class="svg-ink" font-size="12">script with</text><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="12">many workers</text>
<rect x="170" y="20" width="150" height="40" rx="8" fill="#fde68a"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="12">max_workers</text>
<rect x="170" y="75" width="150" height="40" rx="8" fill="#fde68a"/><text x="245" y="100" text-anchor="middle" class="svg-ink" font-size="12">Semaphore cap</text>
<rect x="170" y="130" width="150" height="40" rx="8" fill="#fde68a"/><text x="245" y="155" text-anchor="middle" class="svg-ink" font-size="12">pause between starts</text>
<line x1="130" y1="95" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="130" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="130" y1="95" x2="170" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="40" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="420" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="50" width="210" height="90" rx="10" fill="#bbf7d0"/><text x="525" y="80" text-anchor="middle" class="svg-ink" font-size="12">devices, AAA server,</text><text x="525" y="98" text-anchor="middle" class="svg-ink" font-size="12">jump host</text><text x="525" y="120" text-anchor="middle" class="svg-muted" font-size="11">protected from a stampede</text>
<text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="12">limit how many at once, how many per resource, and how fast they start</text>
</svg><p class="cap">Three simple controls between your script and the network.</p></div>

<h3>Control 1: choose max_workers on purpose</h3>
<p>The pool size is the first and simplest limit. A practical way to choose: start small (5 to 10), check that devices and servers stay healthy, then raise it. Many teams settle somewhere between 10 and 30 for SSH jobs. More workers than devices buys nothing, as chapter 5 showed. One session per device is the usual rule, which the pool gives you automatically when each device appears once in the list.</p>

<h3>Control 2: a semaphore caps a shared resource</h3>
<p>A <code>threading.Semaphore(3)</code> is a lock that admits three threads at a time instead of one. It is the right tool when the thing being protected is not a device but something many jobs share, such as a jump host that accepts only three simultaneous sessions. A dictionary of locks gives each device its own lock, so two jobs can never work on the same device at once even if it appears twice in the list.</p>
<pre class="code">import threading
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from poll import poll, IPS

session_cap = threading.Semaphore(3)
device_locks = defaultdict(threading.Lock)


def polite_poll(ip):
    with session_cap:
        with device_locks[ip]:
            return poll(ip)


with ThreadPoolExecutor(max_workers=10) as pool:
    for ip, state in pool.map(polite_poll, IPS):
        print(ip, state)</pre>
<ul>
<li><code>defaultdict(threading.Lock)</code> creates a new lock the first time a key is used, so <code>device_locks[ip]</code> is always that device's own lock.</li>
<li>The cap is taken first, then the device lock, and both are released when the <code>with</code> blocks end. Every function takes them in the same order, which avoids deadlock.</li>
<li>Ten workers are allowed, but never more than three polls run at the same time.</li>
</ul>
<pre class="out">AUTO01$ python3 polite.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
10.99.0.3 NetmikoTimeoutException
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5</pre>
<div class="note"><p><b>Lab note.</b> The results are identical because the lab runs jobs one at a time and its virtual clock does not model waiting for a semaphore, so you cannot see the cap working on the stopwatch. On a real server the same code would make the polls queue behind the three permits. Judge the code by its structure, not by the lab timing.</p></div>

<h3>Control 3: rate limiting, a pause between starts</h3>
<p>A cap limits how many run together; a rate limit spaces out how fast they begin. The simplest version sleeps in the loop that submits jobs. Each job records when it started:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor

starts = []


def job(ip):
    starts.append((ip, round(time.perf_counter() - t0, 1)))
    time.sleep(1)
    return ip


t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    futures = []
    for n in range(1, 7):
        futures.append(pool.submit(job, f"10.99.0.{n}"))
        time.sleep(0.5)
print(starts)
print(f"{time.perf_counter() - t0:.1f}s")</pre>
<pre class="out">AUTO01$ python3 stagger.py
[('10.99.0.1', 0.0), ('10.99.0.2', 0.5), ('10.99.0.3', 1.0), ('10.99.0.4', 1.5), ('10.99.0.5', 2.0), ('10.99.0.6', 2.5)]
<span class="hl">3.5s</span></pre>
<p>Logins start half a second apart instead of all in the same instant, a gentle ramp of two per second. The whole job still finishes in 3.5 s, because the last job starts at 2.5 s and runs for 1 s. Spreading starts costs little and avoids bursts that look like an attack to the AAA server.</p>

<h3>Retries with a pause</h3>
<p>Some failures are momentary: a busy device, a lost packet. One or two retries with a pause are polite and effective; endless instant retries are a denial-of-service attack on your own network. Put the retry inside the worker, so one stubborn device only delays itself. This version uses <code>poll.py</code> after the Lab 1 fix, with <code>conn_timeout=3</code>:</p>
<pre class="code">def poll_with_retry(ip, tries=3, pause=2):
    for attempt in range(1, tries + 1):
        host, state = poll(ip)
        if state != "NetmikoTimeoutException":
            return host, state, attempt
        if attempt &lt; tries:
            time.sleep(pause)
    return host, state, tries


t0 = time.perf_counter()
print(poll_with_retry("10.99.0.1"))
print(poll_with_retry("10.99.0.3", tries=2))
print(f"{time.perf_counter() - t0:.1f}s")</pre>
<pre class="out">AUTO01$ python3 retry.py
('10.99.0.1', 'PUN-CORE-R1', 1)
<span class="hl">('10.99.0.3', 'NetmikoTimeoutException', 2)</span>
8.7s</pre>
<p>R1 answered on the first attempt. R3 was tried twice, with a 2 s pause between the attempts, and then reported as failed: 0.7 s + 3 s + 2 s + 3 s = 8.7 s. Retry only what is likely to be temporary. A timeout may be temporary; an authentication failure is not, and retrying it is how accounts get locked out.</p>

<h3>Reads are easy, writes need more care</h3>
<p>Everything in this module so far <i>reads</i> from devices. Polling fifty routers in parallel is low risk. <b>Changing</b> fifty routers in parallel is a different matter. Reuse the habits from <b>py-safepush</b>: a dry run first, a backup, a diff, verification afterwards and a way to roll back. Keep the pool small for changes, never let two jobs touch the same device, and stop issuing new jobs after the first unexpected failure. Your password is a lab value here; <b>py-secrets</b> shows how to take it out of the script.</p>

<div class="eg"><p><b>Worked example.</b> Your campus has 200 access switches and the AAA server is known to handle about 20 logins per second comfortably. Choose 15 workers and a 0.1 s pause between submissions: at most 10 new logins per second, at most 15 open sessions, and each switch is visited once. The poll of 200 switches at 3 s each takes about 200 / 15 x 3 = 40 s plus a 20 s ramp, roughly a minute.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting <code>max_workers=100</code> because "more is faster". Retrying authentication failures. Running a threaded push with no limit on a Friday afternoon. Letting two jobs hit the same device. Forgetting that engineers need VTY lines too.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <code>Semaphore(n)</code> allows up to n holders; a <code>Lock</code> is a Semaphore of 1. <code>max_workers</code> limits how many jobs run at once in a pool; a rate limit controls how quickly they start. They solve different problems and are often used together.</p></div>

<div class="scn"><h4>The script that locked out the on-call engineer</h4><p>A team's health check opened one SSH session per interface on each router, 12 threads per device, to "speed things up". During an outage the on-call engineer could not log in to the core router: all five VTY lines were held by the script. The fix was one session per device, a pool of 10 devices at a time, and a rule that automation never uses the last two VTY lines.</p><p><b>Lesson:</b> parallel across devices, serial within a device.</p></div>

<div class="iv"><p class="q">"How do you make sure a threaded automation script does not harm the network?"</p><p>I cap workers to a measured number, allow one session per device, space out login starts, and retry only transient errors with a pause. For changes I add a dry run, backups and verification, keep the pool small, and stop on unexpected failures. I also watch the AAA server and the VTY usage when I first raise the limits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fast is not the goal; fast and safe is. Start with 5 to 10 workers and raise carefully.</li>
<li>One session per device; a per-device lock prevents two jobs on the same device.</li>
<li>A <code>Semaphore</code> caps a shared resource; a sleep in the submit loop rate-limits starts.</li>
<li>Retry transient errors with a pause; never retry authentication failures blindly.</li>
<li>Threaded changes need the py-safepush habits: dry run, backup, diff, verify, roll back.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> thread pool se woh kaam do second mein ho jaata hai jo pehle do minute leta tha, aur utni hi aasaani se aap usi network ko gira sakte ho jiski dekhbhal kar rahe ho. Tez script jo router ko lock kar de, AAA server par bojh daale ya security alarm bajaye, buri script hai. Tameez design ka hissa hai.</p>

<h3>Analogy: pachaas waiters, ek kitchen ka darwaaza</h3>
<p>Pachaas waiters ek hi pal kitchen ke darwaaze par aayein to khaana jaldi nahi milta. Darwaaza jam hota hai, chef ghabra jaata hai aur orders gir jaate hain. Achha restaurant kuch waiters ko ek baar mein jaane deta hai aur baaki ko spaced rakhta hai. Aapke devices, login servers aur jump host wahi darwaaza hain.</p>

<h3>Kya overload ho sakta hai</h3>
<table class="cmp"><tr><th>Resource</th><th>Zyada dabav dene par kya hota hai</th></tr>
<tr><td>Device ki VTY lines</td><td><code>line vty 0 4</code> wale IOS router mein paanch management sessions hote hain. Chhatha login refuse hota hai, aur woh engineer bhi jo outage theek karne ke liye login chahta hai jabki aapki script unhe pakde hai. (Lab routers aise hi bane hain, par lab limit enforce nahi karti; asli devices karte hain.)</td></tr>
<tr><td>Device CPU</td><td>Ek region ke har device par ek saath bhaari <code>show</code> commands control plane ko dheema kar sakte hain.</td></tr>
<tr><td>AAA (RADIUS ya TACACS+) server</td><td>Ek second mein pachaas logins attack jaise dikhte hain aur rate-limit ho sakte hain ya authentication errors se fail.</td></tr>
<tr><td>Jump host ya firewall</td><td>Connection-rate limits aur session tables seemit hain.</td></tr>
<tr><td>Aapka apna server</td><td>Har thread memory aur socket use karta hai; sainkdon idle threads bekaar hain.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Devices ke saamne teen controls: worker limit, session cap aur rate limit">
<rect x="10" y="60" width="120" height="70" rx="10" fill="#bae6fd"/><text x="70" y="90" text-anchor="middle" class="svg-ink" font-size="12">bahut workers</text><text x="70" y="108" text-anchor="middle" class="svg-ink" font-size="12">wali script</text>
<rect x="170" y="20" width="150" height="40" rx="8" fill="#fde68a"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="12">max_workers</text>
<rect x="170" y="75" width="150" height="40" rx="8" fill="#fde68a"/><text x="245" y="100" text-anchor="middle" class="svg-ink" font-size="12">Semaphore cap</text>
<rect x="170" y="130" width="150" height="40" rx="8" fill="#fde68a"/><text x="245" y="155" text-anchor="middle" class="svg-ink" font-size="12">starts ke beech pause</text>
<line x1="130" y1="95" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="130" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="130" y1="95" x2="170" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="40" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="95" x2="420" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="420" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="50" width="210" height="90" rx="10" fill="#bbf7d0"/><text x="525" y="80" text-anchor="middle" class="svg-ink" font-size="12">devices, AAA server,</text><text x="525" y="98" text-anchor="middle" class="svg-ink" font-size="12">jump host</text><text x="525" y="120" text-anchor="middle" class="svg-muted" font-size="11">bhagdad se bache hue</text>
<text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="12">kitne ek saath, kitne har resource par, aur kitni tezi se shuru hon, limit karo</text>
</svg><p class="cap">Aapki script aur network ke beech teen saral controls.</p></div>

<h3>Control 1: max_workers soch samajhkar chuno</h3>
<p>Pool size pehli aur sabse saral limit hai. Chunne ka vyavahaarik tareeka: chhote se shuru karo (5 se 10), dekho ki devices aur servers healthy rehte hain, phir badhao. Bahut teams SSH jobs ke liye 10 se 30 ke beech tikti hain. Devices se zyada workers se kuch nahi milta, jaisa chapter 5 ne dikhaya. Aam rule ek device par ek session hai, jo pool apne aap deta hai jab har device list mein ek hi baar ho.</p>

<h3>Control 2: semaphore shared resource ko cap karta hai</h3>
<p><code>threading.Semaphore(3)</code> aisa lock hai jo ek ki jagah ek saath teen threads ko andar aane deta hai. Yeh tab sahi tool hai jab bachayi jaane wali cheez device nahi balki woh hai jo bahut jobs share karti hain, jaise jump host jo sirf teen ek saath sessions leta hai. Locks ki dictionary har device ko apna lock deti hai, isliye do jobs kabhi ek hi device par ek saath kaam nahi kar sakti, chahe woh list mein do baar ho.</p>
<pre class="code">import threading
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from poll import poll, IPS

session_cap = threading.Semaphore(3)
device_locks = defaultdict(threading.Lock)


def polite_poll(ip):
    with session_cap:
        with device_locks[ip]:
            return poll(ip)


with ThreadPoolExecutor(max_workers=10) as pool:
    for ip, state in pool.map(polite_poll, IPS):
        print(ip, state)</pre>
<ul>
<li><code>defaultdict(threading.Lock)</code> key pehli baar use hone par naya lock banata hai, isliye <code>device_locks[ip]</code> hamesha usi device ka apna lock hai.</li>
<li>Pehle cap liya jaata hai, phir device lock, aur dono <code>with</code> blocks khatam hone par chhut jaate hain. Har function unhe ek hi order mein leta hai, jo deadlock se bachata hai.</li>
<li>Das workers ki ijazat hai, par teen se zyada polls kabhi ek saath nahi chalte.</li>
</ul>
<pre class="out">AUTO01$ python3 polite.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
10.99.0.3 NetmikoTimeoutException
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5</pre>
<div class="note"><p><b>Lab note.</b> Results ek jaise hain kyunki lab jobs ko ek-ek karke chalati hai aur uski virtual clock semaphore ke intezaar ko model nahi karti, isliye aap stopwatch par cap ko kaam karte nahi dekh sakte. Asli server par wahi code polls ko teen permits ke peeche line mein laga deta. Code ko uske structure se parkho, lab timing se nahi.</p></div>

<h3>Control 3: rate limiting, starts ke beech pause</h3>
<p>Cap limit karta hai ki kitne ek saath chalein; rate limit spaced karta hai ki woh kitni tezi se shuru hon. Sabse saral version jobs submit karne wale loop mein sleep karta hai. Har job likhti hai ki woh kab shuru hui:</p>
<pre class="code">import time
from concurrent.futures import ThreadPoolExecutor

starts = []


def job(ip):
    starts.append((ip, round(time.perf_counter() - t0, 1)))
    time.sleep(1)
    return ip


t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    futures = []
    for n in range(1, 7):
        futures.append(pool.submit(job, f"10.99.0.{n}"))
        time.sleep(0.5)
print(starts)
print(f"{time.perf_counter() - t0:.1f}s")</pre>
<pre class="out">AUTO01$ python3 stagger.py
[('10.99.0.1', 0.0), ('10.99.0.2', 0.5), ('10.99.0.3', 1.0), ('10.99.0.4', 1.5), ('10.99.0.5', 2.0), ('10.99.0.6', 2.5)]
<span class="hl">3.5s</span></pre>
<p>Logins ek hi pal mein shuru hone ki jagah aadhe-aadhe second ke antar par shuru hote hain, do per second ka narm ramp. Poora job phir bhi 3.5 s mein khatam hota hai, kyunki aakhri job 2.5 s par shuru hoti hai aur 1 s chalti hai. Starts ko failana kam kharch karta hai aur un bursts se bachata hai jo AAA server ko attack jaise lagte hain.</p>

<h3>Pause ke saath retries</h3>
<p>Kuch failures kshanik hote hain: busy device, khoya hua packet. Ek ya do retries pause ke saath tameez wale aur asardaar hain; anant turant retries apne hi network par denial-of-service attack hain. Retry worker ke andar rakho, taaki ek ziddi device sirf apne aap ko der kare. Yeh version Lab 1 fix ke baad ka <code>poll.py</code> use karta hai, <code>conn_timeout=3</code> ke saath:</p>
<pre class="code">def poll_with_retry(ip, tries=3, pause=2):
    for attempt in range(1, tries + 1):
        host, state = poll(ip)
        if state != "NetmikoTimeoutException":
            return host, state, attempt
        if attempt &lt; tries:
            time.sleep(pause)
    return host, state, tries


t0 = time.perf_counter()
print(poll_with_retry("10.99.0.1"))
print(poll_with_retry("10.99.0.3", tries=2))
print(f"{time.perf_counter() - t0:.1f}s")</pre>
<pre class="out">AUTO01$ python3 retry.py
('10.99.0.1', 'PUN-CORE-R1', 1)
<span class="hl">('10.99.0.3', 'NetmikoTimeoutException', 2)</span>
8.7s</pre>
<p>R1 ne pehli koshish mein jawab diya. R3 ko do baar try kiya gaya, koshishon ke beech 2 s pause ke saath, phir failed report kiya: 0.7 s + 3 s + 2 s + 3 s = 8.7 s. Sirf unhi ko retry karo jo asthayi hone ki sambhavna rakhte hain. Timeout asthayi ho sakta hai; authentication failure nahi, aur use retry karna hi accounts lock hone ka tareeka hai.</p>

<h3>Reads aasaan hain, writes mein zyada savdhani</h3>
<p>Is module mein ab tak sab kuch devices se <i>padhta</i> hai. Pachaas routers ko parallel poll karna kam risk hai. Pachaas routers ko parallel <b>badalna</b> alag baat hai. <b>py-safepush</b> ki aadatein dobara use karo: pehle dry run, backup, diff, baad mein verification aur rollback ka tareeka. Changes ke liye pool chhota rakho, do jobs ko kabhi ek device na chhune do, aur pehle unexpected failure ke baad nayi jobs dena band karo. Yahan password lab value hai; <b>py-secrets</b> dikhata hai ki use script se kaise hataya jaye.</p>

<div class="eg"><p><b>Worked example.</b> Aapke campus mein 200 access switches hain aur AAA server lagbhag 20 logins per second aaram se sambhalta hai. 15 workers aur submissions ke beech 0.1 s pause chuno: zyada se zyada 10 naye logins per second, zyada se zyada 15 open sessions, aur har switch ek baar visit hota hai. 200 switches ka poll, har ek 3 s, lagbhag 200 / 15 x 3 = 40 s plus 20 s ramp, yaani lagbhag ek minute leta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Zyada tez hota hai" soch kar <code>max_workers=100</code> rakhna. Authentication failures ko retry karna. Shukrawar sham ko bina limit ke threaded push chalana. Do jobs ko ek hi device par maarne dena. Yeh bhoolna ki engineers ko bhi VTY lines chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Semaphore(n)</code> zyada se zyada n holders deta hai; <code>Lock</code> 1 ka Semaphore hai. <code>max_workers</code> pool mein ek saath chalti jobs ko limit karta hai; rate limit control karta hai ki woh kitni jaldi shuru hon. Yeh alag samasyaon ko hal karte hain aur aksar saath use hote hain.</p></div>

<div class="scn"><h4>Script jisne on-call engineer ko lock out kar diya</h4><p>Ek team ka health check har router par har interface ke liye ek SSH session kholta tha, "tez karne ke liye" har device par 12 threads. Ek outage ke dauraan on-call engineer core router mein login nahi kar paya: paanchon VTY lines script ne pakdi hui thi. Fix tha ek device par ek session, ek baar mein 10 devices ka pool, aur rule ki automation kabhi aakhri do VTY lines use nahi karegi.</p><p><b>Lesson:</b> devices ke beech parallel, ek device ke andar serial.</p></div>

<div class="iv"><p class="q">"Kaise pakka karte ho ki threaded automation script network ko nuksaan na pahunchaye?"</p><p>Main workers ko naape hue number tak cap karta hoon, ek device par ek session deta hoon, login starts ko spaced karta hoon, aur sirf transient errors ko pause ke saath retry karta hoon. Changes ke liye dry run, backups aur verification jodta hoon, pool chhota rakhta hoon, aur unexpected failures par ruk jaata hoon. Limits pehli baar badhate waqt AAA server aur VTY usage par nazar bhi rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tez hona lakshya nahi; tez aur safe lakshya hai. 5 se 10 workers se shuru karo aur dhyan se badhao.</li>
<li>Ek device par ek session; per-device lock ek hi device par do jobs rokta hai.</li>
<li><code>Semaphore</code> shared resource ko cap karta hai; submit loop mein sleep starts ko rate-limit karta hai.</li>
<li>Transient errors ko pause ke saath retry karo; authentication failures ko andhadhundh retry mat karo.</li>
<li>Threaded changes ko py-safepush ki aadatein chahiye: dry run, backup, diff, verify, rollback.</li>
</ul></div>
`}};export{e as default};