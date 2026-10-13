var e={id:`why-threads`,h:{en:`What you will learn, and why fifty devices one by one is slow`,hi:`Aap kya seekhoge, aur pachaas devices ek-ek karke kyon dheeme hain`},body:{en:`
<p><b>The idea of this chapter:</b> a script that logs in to devices one after another spends almost all of its life waiting. Threads let the waiting happen for many devices at the same time. By the end of the module a job that took minutes will take seconds, and you will know how to do it without losing results or hammering your routers.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>Explain why a sequential poll of fifty devices is slow, and measure it.</li>
<li>Tell I/O-bound work from CPU-bound work, and say in plain words what the GIL does.</li>
<li>Start, wait for and name threads with <code>threading.Thread</code>.</li>
<li>Protect shared data with <code>threading.Lock</code>, or better, avoid sharing it.</li>
<li>Run a job on many devices with <code>ThreadPoolExecutor</code> using <code>map</code>, <code>submit</code> and <code>as_completed</code>.</li>
<li>Handle errors and timeouts inside a pool, use <code>queue.Queue</code>, sweep a subnet with ping and be polite to devices.</li>
<li>Find and fix the four classic thread bugs in Lab 2.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished <b>auto-py-func</b> (functions and <code>try/except</code>), <b>auto-ssh</b> (<code>ConnectHandler</code> from <code>nkmiko</code>), <b>py-safepush</b> (why changes need care) and <b>auto-requests</b> (waiting for a network answer). <b>py-oop</b> helps for the <code>Thread</code> subclass and <b>py-iter</b> for comprehensions. After this module, <b>py-tools</b> adds options, logging and cron to the same ideas.</p>

<h3>Analogy: one waiter or five</h3>
<p>A restaurant has one waiter and five tables. He takes an order at table 1, walks to the kitchen, <i>waits</i> for the food, serves it, and only then visits table 2. Table 3 ordered a dish the kitchen cannot make, so he waits there for ten minutes while tables 4 and 5 stay hungry. Now hire five waiters, one per table. Each still waits for the kitchen, but the waits overlap, and the slow table delays only itself. The waiters are <b>threads</b>. The kitchen is the router. The waiting is network time.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Five polls one by one compared with five polls at once">
<text x="10" y="22" class="svg-ink" font-size="13">One by one: 12.8 s</text>
<rect x="110" y="30" width="28" height="22" fill="#bbf7d0"/><rect x="138" y="30" width="28" height="22" fill="#bbf7d0"/><rect x="166" y="30" width="400" height="22" fill="#fecaca"/><rect x="566" y="30" width="28" height="22" fill="#bbf7d0"/><rect x="594" y="30" width="28" height="22" fill="#bbf7d0"/>
<text x="366" y="46" text-anchor="middle" class="svg-muted" font-size="11">R3 times out (10 s)</text>
<text x="10" y="92" class="svg-ink" font-size="13">All at once: 10 s</text>
<text x="40" y="118" class="svg-muted" font-size="11">R1</text><rect x="110" y="104" width="28" height="18" fill="#bbf7d0"/>
<text x="40" y="142" class="svg-muted" font-size="11">R2</text><rect x="110" y="128" width="28" height="18" fill="#bbf7d0"/>
<text x="40" y="166" class="svg-muted" font-size="11">R3</text><rect x="110" y="152" width="400" height="18" fill="#fecaca"/>
<text x="40" y="190" class="svg-muted" font-size="11">R4</text><rect x="110" y="176" width="28" height="18" fill="#bbf7d0"/>
<text x="40" y="214" class="svg-muted" font-size="11">R5</text><rect x="110" y="200" width="28" height="18" fill="#bbf7d0"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">the slowest device now sets the total, not the sum</text>
</svg><p class="cap">Same five polls. One by one the waits add up; at once they overlap.</p></div>

<h3>See the problem on the lab network</h3>
<p>The lab host <b>AUTO01</b> (user <code>netadmin</code>) is wired through <b>SW1</b> to five routers, R1 to R5, addresses 10.99.0.1 to 10.99.0.5. R3 is switched off. The file <code>poll.py</code> is the Lab 1 starting point: it logs in to each router in turn and prints its hostname.</p>
<pre class="code">import time
from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

IPS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.4", "10.99.0.5"]


def poll(ip):
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
        name = conn.find_prompt().rstrip("#&gt;")
        conn.disconnect()
        return ip, name
    except (NetmikoTimeoutException, NetmikoAuthenticationException) as err:
        return ip, type(err).__name__


if __name__ == "__main__":
    start = time.time()
    for ip in IPS:
        print(*poll(ip))
    print(f"elapsed: {time.time() - start:.1f}s")</pre>
<p><code>poll(ip)</code> connects, reads the prompt (for example <code>PUN-CORE-R1#</code>), strips the trailing <code>#</code>, disconnects and returns a pair. If the router does not answer, it returns the name of the exception instead of crashing. <code>print(*poll(ip))</code> unpacks the pair into two printed words. Run it:</p>
<pre class="out">AUTO01$ python3 poll.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
<span class="hl">10.99.0.3 NetmikoTimeoutException</span>
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5
<span class="hl">elapsed: 12.8s</span></pre>
<p>Four healthy routers cost about 0.7 s each. The dead one costs the full connect timeout, 10 s. The CPU did almost nothing in those 12.8 s; it sat waiting for packets. That idle time is what threads reclaim.</p>

<div class="note"><p><b>Lab note.</b> In this simulator threads run on <b>virtual time</b>. A <code>time.sleep</code> inside a thread costs no real waiting, and <code>time.time()</code> and <code>time.perf_counter()</code> show the virtual elapsed time, so the numbers in this module behave like a real network without making you wait. Locks, queues, pools and the order in which results come back follow the real rules. Where the lab cannot show something, the text says so.</p></div>

<div class="eg"><p><b>Worked example.</b> A bank has 50 branch routers and each poll takes 4 s. One by one: 50 x 4 = 200 s, over three minutes. With 10 workers the polls run in 5 waves of 4 s, about 20 s. Add three dead routers with a 10 s timeout each. One by one that is 30 s more; with a pool the dead ones fall into the waves and add roughly one extra wave.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing the script is slow because Python is slow (it is waiting, not computing). Starting fifty threads for fifty devices without thinking about what the devices can take (chapter 9). Printing from threads and expecting tidy order.</p></div>
<div class="exam"><p><b>Exam trap.</b> Threads do not make one poll faster. They make many polls overlap. The total time of a threaded job is roughly the longest wait multiplied by the number of waves, not the sum of the waits.</p></div>

<div class="scn"><h4>The inventory job that missed its window</h4><p>A nightly job polled 120 routers sequentially at 6 s each: 12 minutes in a good week. When two branches lost power, each dead router added a 10 s timeout and the job ran past the maintenance window. An engineer moved the same function into a pool of 15 workers. Run time fell to about 1 minute, and the two dead routers no longer held anyone up.</p><p><b>Lesson:</b> when the work is waiting, overlap the waits.</p></div>

<div class="iv"><p class="q">"Why is polling many devices slow, and how do you speed it up?"</p><p>Each poll spends nearly all its time waiting on the network, and a sequential loop adds those waits together. Threads let the waits overlap, so total time drops to roughly the slowest device times the number of waves. I would use a thread pool with a sensible worker limit and handle failures per device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A sequential poll adds up every wait, including each dead device's timeout.</li>
<li>Network scripts are I/O-bound: the CPU idles while packets travel.</li>
<li>Threads overlap the waits; the slowest device sets the total.</li>
<li>In the lab, threads use virtual time, but locks, queues, pools and result order are real.</li>
<li>Lab 1 builds the pool version of <code>poll.py</code>; Lab 2 fixes four thread bugs.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo script devices mein ek ke baad ek login karti hai, woh apni lagbhag poori zindagi intezaar mein bitati hai. Threads bahut devices ka intezaar ek hi waqt mein hone dete hain. Module ke ant tak jo kaam minutes leta tha woh seconds lega, aur aap seekhoge ki results khoye bina aur routers par bojh daale bina yeh kaise karna hai.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Samjhao ki pachaas devices ka sequential poll dheema kyon hai, aur use naapo.</li>
<li>I/O-bound kaam aur CPU-bound kaam mein fark karo, aur saadi bhasha mein batao ki GIL kya karta hai.</li>
<li><code>threading.Thread</code> se threads start karo, unka intezaar karo aur naam do.</li>
<li>Shared data ko <code>threading.Lock</code> se bachao, ya behtar, use share hi mat karo.</li>
<li><code>ThreadPoolExecutor</code> se <code>map</code>, <code>submit</code> aur <code>as_completed</code> ke saath kaam bahut devices par chalao.</li>
<li>Pool ke andar errors aur timeouts sambhalo, <code>queue.Queue</code> use karo, ping se subnet sweep karo aur devices ke saath tameez se pesh aao.</li>
<li>Lab 2 mein chaar classic thread bugs dhoondho aur theek karo.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko <b>auto-py-func</b> (functions aur <code>try/except</code>), <b>auto-ssh</b> (<code>nkmiko</code> ka <code>ConnectHandler</code>), <b>py-safepush</b> (changes mein savdhani kyon) aur <b>auto-requests</b> (network ke jawab ka intezaar) khatam kar lene chahiye. <b>py-oop</b> <code>Thread</code> subclass ke liye aur <b>py-iter</b> comprehensions ke liye madad karta hai. Is module ke baad <b>py-tools</b> wahi ideas mein options, logging aur cron jodta hai.</p>

<h3>Analogy: ek waiter ya paanch</h3>
<p>Restaurant mein ek waiter hai aur paanch tables. Woh table 1 ka order leta hai, kitchen jaata hai, khaane ka <i>intezaar</i> karta hai, serve karta hai, aur tabhi table 2 par jaata hai. Table 3 ne aisi dish mangi jo kitchen bana nahi sakta, to woh wahan dus minute intezaar karta hai jabki table 4 aur 5 bhookhe baithe hain. Ab paanch waiters rakho, har table par ek. Har ek ab bhi kitchen ka intezaar karta hai, par intezaar overlap hote hain, aur dheema table sirf apne aap ko rokta hai. Waiters hain <b>threads</b>. Kitchen hai router. Intezaar hai network time.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Paanch polls ek-ek karke aur ek saath">
<text x="10" y="22" class="svg-ink" font-size="13">Ek-ek karke: 12.8 s</text>
<rect x="110" y="30" width="28" height="22" fill="#bbf7d0"/><rect x="138" y="30" width="28" height="22" fill="#bbf7d0"/><rect x="166" y="30" width="400" height="22" fill="#fecaca"/><rect x="566" y="30" width="28" height="22" fill="#bbf7d0"/><rect x="594" y="30" width="28" height="22" fill="#bbf7d0"/>
<text x="366" y="46" text-anchor="middle" class="svg-muted" font-size="11">R3 timeout (10 s)</text>
<text x="10" y="92" class="svg-ink" font-size="13">Sab ek saath: 10 s</text>
<text x="40" y="118" class="svg-muted" font-size="11">R1</text><rect x="110" y="104" width="28" height="18" fill="#bbf7d0"/>
<text x="40" y="142" class="svg-muted" font-size="11">R2</text><rect x="110" y="128" width="28" height="18" fill="#bbf7d0"/>
<text x="40" y="166" class="svg-muted" font-size="11">R3</text><rect x="110" y="152" width="400" height="18" fill="#fecaca"/>
<text x="40" y="190" class="svg-muted" font-size="11">R4</text><rect x="110" y="176" width="28" height="18" fill="#bbf7d0"/>
<text x="40" y="214" class="svg-muted" font-size="11">R5</text><rect x="110" y="200" width="28" height="18" fill="#bbf7d0"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">ab sabse dheema device total tay karta hai, jod nahi</text>
</svg><p class="cap">Wahi paanch polls. Ek-ek karke intezaar jud jaate hain; ek saath overlap hote hain.</p></div>

<h3>Lab network par samasya dekho</h3>
<p>Lab host <b>AUTO01</b> (user <code>netadmin</code>) <b>SW1</b> ke through paanch routers, R1 se R5, se juda hai, addresses 10.99.0.1 se 10.99.0.5. R3 band hai. File <code>poll.py</code> Lab 1 ka starting point hai: yeh har router mein baari-baari login karti hai aur uska hostname print karti hai.</p>
<pre class="code">import time
from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

IPS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.4", "10.99.0.5"]


def poll(ip):
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
        name = conn.find_prompt().rstrip("#&gt;")
        conn.disconnect()
        return ip, name
    except (NetmikoTimeoutException, NetmikoAuthenticationException) as err:
        return ip, type(err).__name__


if __name__ == "__main__":
    start = time.time()
    for ip in IPS:
        print(*poll(ip))
    print(f"elapsed: {time.time() - start:.1f}s")</pre>
<p><code>poll(ip)</code> connect karta hai, prompt padhta hai (jaise <code>PUN-CORE-R1#</code>), aakhri <code>#</code> hatata hai, disconnect karta hai aur ek jodi return karta hai. Router jawab na de to crash hone ki jagah exception ka naam return karta hai. <code>print(*poll(ip))</code> jodi ko do shabdon mein kholkar print karta hai. Chalao:</p>
<pre class="out">AUTO01$ python3 poll.py
10.99.0.1 PUN-CORE-R1
10.99.0.2 BLR-EDGE-R2
<span class="hl">10.99.0.3 NetmikoTimeoutException</span>
10.99.0.4 DEL-EDGE-R4
10.99.0.5 MUM-EDGE-R5
<span class="hl">elapsed: 12.8s</span></pre>
<p>Chaar healthy routers har ek lagbhag 0.7 s lete hain. Band router poora connect timeout, 10 s, leta hai. In 12.8 s mein CPU ne lagbhag kuch nahi kiya; woh packets ka intezaar karta raha. Yahi khaali waqt threads wapas lete hain.</p>

<div class="note"><p><b>Lab note.</b> Is simulator mein threads <b>virtual time</b> par chalte hain. Thread ke andar <code>time.sleep</code> asli intezaar nahi karwata, aur <code>time.time()</code> aur <code>time.perf_counter()</code> virtual beeta hua time dikhate hain, isliye is module ke numbers asli network jaise behave karte hain bina aapko rukwaye. Locks, queues, pools aur results ke aane ka order asli rules follow karte hain. Jahan lab kuch dikha nahi sakta, text bata deta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek bank ke 50 branch routers hain aur har poll 4 s leta hai. Ek-ek karke: 50 x 4 = 200 s, teen minute se zyada. 10 workers ke saath polls 4 s ki 5 waves mein chalte hain, lagbhag 20 s. Ab teen band routers jodo jinka 10 s timeout hai. Ek-ek karke 30 s aur lagte hain; pool mein band routers waves mein gir jaate hain aur lagbhag ek extra wave jodte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh maan lena ki script isliye dheemi hai kyunki Python dheema hai (woh intezaar kar rahi hai, compute nahi). Pachaas devices ke liye pachaas threads start kar dena bina soche ki devices kitna sah sakte hain (chapter 9). Threads se print karke tidy order ki ummeed karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Threads ek poll ko tez nahi karte. Woh bahut polls ko overlap karte hain. Threaded job ka total time lagbhag sabse lamba intezaar guna waves ki ginti hai, intezaaron ka jod nahi.</p></div>

<div class="scn"><h4>Inventory job jo window chhod gayi</h4><p>Ek nightly job 120 routers ko sequential poll karti thi, har ek 6 s: achhe hafte mein 12 minute. Do branches ki bijli gayi to har band router ne 10 s timeout jodha aur job maintenance window ke baad tak chali. Ek engineer ne wahi function 15 workers ke pool mein daal diya. Run time lagbhag 1 minute reh gaya, aur do band routers ne kisi ko nahi roka.</p><p><b>Lesson:</b> jab kaam intezaar hai, intezaar overlap karo.</p></div>

<div class="iv"><p class="q">"Bahut devices poll karna dheema kyon hai, aur use tez kaise karte ho?"</p><p>Har poll apna lagbhag saara time network ka intezaar karne mein lagata hai, aur sequential loop in intezaaron ko jod deta hai. Threads intezaar overlap karte hain, isliye total time lagbhag sabse dheema device guna waves rah jaata hai. Main sensible worker limit ke saath thread pool use karunga aur failures har device ke hisaab se sambhalunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sequential poll har intezaar jodta hai, har dead device ka timeout bhi.</li>
<li>Network scripts I/O-bound hain: packets travel karte waqt CPU khaali rehta hai.</li>
<li>Threads intezaar overlap karte hain; sabse dheema device total tay karta hai.</li>
<li>Lab mein threads virtual time use karte hain, par locks, queues, pools aur result order asli hain.</li>
<li>Lab 1 <code>poll.py</code> ka pool version banata hai; Lab 2 chaar thread bugs theek karta hai.</li>
</ul></div>
`}};export{e as default};