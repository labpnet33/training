var e={id:`shared-data-locks`,h:{en:`Shared data, race conditions and threading.Lock`,hi:`Shared data, race conditions aur threading.Lock`},body:{en:`
<p><b>The idea of this chapter:</b> threads share the memory of one program. That is what makes them easy, and it is also what makes them risky. When two threads change the same variable at the same moment, one change can silently vanish. This is a <b>race condition</b>, and a <b>lock</b> is the standard cure. The best cure of all is to share nothing.</p>

<h3>Analogy: the whiteboard at the pass</h3>
<p>Five waiters tick the number of finished tables on one whiteboard. Waiter A reads "5", walks to the board with the marker, and at the same moment waiter B also reads "5". A writes "6". B writes "6". Two tables were finished but the board says 6, not 7. Nobody did anything wrong individually; the trouble is that <i>read, add, write</i> is three steps and they interleaved. A lock is a rule: only the waiter holding the marker may read and write, everyone else waits their turn.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Two threads read the same value then both write it, losing one update">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">counts["up"] += 1 is really three steps</text>
<rect x="20" y="36" width="190" height="110" rx="8" fill="#bae6fd"/><text x="115" y="56" text-anchor="middle" class="svg-ink" font-size="12">Thread A</text>
<text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="11">1 read 5</text><text x="115" y="104" text-anchor="middle" class="svg-muted" font-size="11">2 add 1 = 6</text><text x="115" y="126" text-anchor="middle" class="svg-muted" font-size="11">3 write 6</text>
<rect x="430" y="36" width="190" height="110" rx="8" fill="#ddd6fe"/><text x="525" y="56" text-anchor="middle" class="svg-ink" font-size="12">Thread B</text>
<text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="11">1 read 5 (A has not written yet)</text><text x="525" y="104" text-anchor="middle" class="svg-muted" font-size="11">2 add 1 = 6</text><text x="525" y="126" text-anchor="middle" class="svg-muted" font-size="11">3 write 6</text>
<rect x="250" y="66" width="140" height="52" rx="8" fill="#fecaca"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">shared count</text><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">ends at 6, not 7</text>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">with a lock, B waits until A has finished all three steps</text>
<text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="11">one update was lost, and nothing printed an error</text>
</svg><p class="cap">A race condition loses updates quietly.</p></div>

<h3>What is safe and what is not</h3>
<table class="cmp"><tr><th>Operation on shared data</th><th>Safe without a lock?</th></tr>
<tr><td><code>results.append(x)</code> (one call)</td><td>Yes, a single operation in CPython</td></tr>
<tr><td><code>report[ip] = state</code> (different key per thread)</td><td>Yes</td></tr>
<tr><td><code>counts["up"] += 1</code></td><td>No: read, add, write</td></tr>
<tr><td><code>if ip not in seen: seen.add(ip)</code></td><td>No: check, then act</td></tr>
<tr><td><code>queue.Queue</code> methods</td><td>Yes, built to be shared</td></tr></table>
<p>Do not memorise the "yes" rows as law. Treat them as a convenience, and reach for a lock the moment two steps must happen together.</p>

<h3>Using a Lock</h3>
<p>This program checks fifty addresses in a pool and counts how many are up and down. The counting is shared, so it sits inside <code>with lock</code>.</p>
<pre class="code">import threading
import time
from concurrent.futures import ThreadPoolExecutor

counts = {"up": 0, "down": 0}
lock = threading.Lock()


def check(n):
    time.sleep(1)                       # stands in for the real check
    state = "down" if n % 7 == 0 else "up"
    with lock:
        counts[state] += 1
    return n


with ThreadPoolExecutor(max_workers=10) as pool:
    list(pool.map(check, range(1, 51)))
print(counts, sum(counts.values()))</pre>
<ul>
<li><code>threading.Lock()</code> makes one lock. Create it once, outside the function, so every thread shares the same one.</li>
<li><code>with lock:</code> takes the lock, runs the indented lines, and always releases it, even if an error happens inside.</li>
<li>Only one thread can be inside the <code>with</code> block at a time. The others wait at the door.</li>
<li>Addresses 7, 14, 21, 28, 35, 42 and 49 are multiples of 7, so seven are "down" and 43 are "up".</li>
</ul>
<pre class="out">AUTO01$ python3 counter.py
<span class="hl">{'up': 43, 'down': 7} 50</span></pre>
<p>The two counts add up to 50, as they must. Compare with the same counting done without any lock, in fifty threads started by hand (<code>counts[state] += 1</code> straight after the sleep). In the lab it prints the same line:</p>
<pre class="out">AUTO01$ python3 unsafe.py
{'up': 43, 'down': 7} 50</pre>
<div class="note"><p><b>Lab note.</b> The lab runs one thread at a time, so it can never interleave the three steps and never loses an update. That makes it a good place to learn the pattern but a poor place to prove the bug. On a real server with many threads the unlocked version can end below 50, and not every run. The absence of a failure in testing is not evidence that the code is safe.</p></div>

<h3>Rules for locks</h3>
<ul>
<li><b>Keep the locked section tiny.</b> Take the lock, update the number, leave. Never hold a lock while you log in to a router or sleep; every other thread would queue behind you and the job becomes sequential again. A real server would show that clearly; the lab clock does not, so follow the rule rather than the stopwatch.</li>
<li><b>Deadlock.</b> If thread A holds lock 1 and waits for lock 2 while thread B holds lock 2 and waits for lock 1, both wait forever. Avoid it by using one lock where you can, and by always taking several locks in the same order.</li>
<li><b>A thread must not take a plain Lock it already holds.</b> Use <code>threading.RLock</code> if code that holds the lock calls code that needs it again.</li>
<li><b>Best of all, share nothing.</b> If each worker returns its answer and the main thread builds the report, no lock is needed. This is the design the next chapters use.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Instead of a shared counter, let <code>check</code> return <code>(n, state)</code>. After the pool finishes, the main thread counts: <code>sum(1 for n, state in rows if state == "down")</code>. One thread does all the counting, so there is no race and no lock.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating the lock inside the function, so every call gets its own lock and protects nothing. Forgetting that <code>+=</code> on a shared number needs protection. Holding a lock during network I/O. Taking two locks in different orders in different functions.</p></div>
<div class="exam"><p><b>Exam trap.</b> A lock protects only code that actually uses it. If one function updates the shared counter under the lock and another updates it without, there is still a race. Also, <code>with lock</code> is preferred over manual <code>acquire()</code> and <code>release()</code> because it releases on errors.</p></div>

<div class="scn"><h4>The dashboard that was always a few short</h4><p>A monitoring script polled 200 switches with 20 threads and kept a shared <code>polled += 1</code> counter for a progress bar. Some mornings the bar stopped at 197 even though all reports were written. Two threads were updating the counter at once. Wrapping the increment in a lock fixed the display; moving the counting into the main thread, which received each result, removed the shared variable entirely.</p><p><b>Lesson:</b> an intermittent wrong number is the signature of a race.</p></div>

<div class="iv"><p class="q">"What is a race condition and how do you prevent it?"</p><p>It is when the outcome depends on the timing of threads touching shared data, for example two threads doing <code>count += 1</code> and losing one update. I prevent it by not sharing, by returning results to one collector thread, or by guarding the shared update with a <code>threading.Lock</code> in a short <code>with</code> block.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threads share memory, so unsynchronised updates can be lost without any error.</li>
<li><code>counts[x] += 1</code> is read-add-write and needs a lock; a single <code>append</code> does not.</li>
<li>Create one lock, share it, and use <code>with lock:</code> around the shortest possible section.</li>
<li>Never hold a lock during network I/O; avoid deadlock by taking locks in a fixed order.</li>
<li>Preferred design: workers return results, the main thread collects them.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> threads ek program ki memory share karte hain. Yahi unhe aasaan banata hai, aur yahi risky bhi. Jab do threads ek hi waqt mein ek hi variable badalte hain, to ek change chupchaap gayab ho sakta hai. Yeh <b>race condition</b> hai, aur <b>lock</b> iska standard ilaj hai. Sabse achha ilaj hai kuch share hi na karna.</p>

<h3>Analogy: pass par whiteboard</h3>
<p>Paanch waiters ek whiteboard par khatam hui tables ki ginti likhte hain. Waiter A "5" padhta hai, marker lekar board tak jaata hai, aur usi waqt waiter B bhi "5" padhta hai. A "6" likhta hai. B "6" likhta hai. Do tables khatam hui par board par 6 hai, 7 nahi. Kisi ne akele galti nahi ki; dikkat yeh hai ki <i>padho, jodo, likho</i> teen steps hain aur woh aapas mein mil gaye. Lock ek rule hai: sirf marker pakadne wala waiter padh aur likh sakta hai, baaki apni baari ka intezaar karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Do threads ek hi value padhte hain phir dono likhte hain, ek update kho jaata hai">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">counts["up"] += 1 asal mein teen steps hai</text>
<rect x="20" y="36" width="190" height="110" rx="8" fill="#bae6fd"/><text x="115" y="56" text-anchor="middle" class="svg-ink" font-size="12">Thread A</text>
<text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="11">1 5 padha</text><text x="115" y="104" text-anchor="middle" class="svg-muted" font-size="11">2 1 joda = 6</text><text x="115" y="126" text-anchor="middle" class="svg-muted" font-size="11">3 6 likha</text>
<rect x="430" y="36" width="190" height="110" rx="8" fill="#ddd6fe"/><text x="525" y="56" text-anchor="middle" class="svg-ink" font-size="12">Thread B</text>
<text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="11">1 5 padha (A ne abhi likha nahi)</text><text x="525" y="104" text-anchor="middle" class="svg-muted" font-size="11">2 1 joda = 6</text><text x="525" y="126" text-anchor="middle" class="svg-muted" font-size="11">3 6 likha</text>
<rect x="250" y="66" width="140" height="52" rx="8" fill="#fecaca"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">shared count</text><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">6 par rukta, 7 nahi</text>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">lock ke saath B tab tak rukta hai jab tak A teeno steps khatam na kare</text>
<text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="11">ek update kho gaya, aur kisi ne error print nahi kiya</text>
</svg><p class="cap">Race condition chupchaap updates kho deti hai.</p></div>

<h3>Kya safe hai aur kya nahi</h3>
<table class="cmp"><tr><th>Shared data par operation</th><th>Lock ke bina safe?</th></tr>
<tr><td><code>results.append(x)</code> (ek call)</td><td>Haan, CPython mein single operation</td></tr>
<tr><td><code>report[ip] = state</code> (har thread ki alag key)</td><td>Haan</td></tr>
<tr><td><code>counts["up"] += 1</code></td><td>Nahi: padho, jodo, likho</td></tr>
<tr><td><code>if ip not in seen: seen.add(ip)</code></td><td>Nahi: pehle check, phir action</td></tr>
<tr><td><code>queue.Queue</code> methods</td><td>Haan, share karne ke liye hi bane hain</td></tr></table>
<p>"Haan" wali rows ko kanoon ki tarah ratna mat. Unhe suvidha samjho, aur jaise hi do steps saath hone zaroori hon, lock uthao.</p>

<h3>Lock use karna</h3>
<p>Yeh program pool mein pachaas addresses check karta hai aur ginta hai kitne up aur down hain. Ginti shared hai, isliye <code>with lock</code> ke andar hai.</p>
<pre class="code">import threading
import time
from concurrent.futures import ThreadPoolExecutor

counts = {"up": 0, "down": 0}
lock = threading.Lock()


def check(n):
    time.sleep(1)                       # stands in for the real check
    state = "down" if n % 7 == 0 else "up"
    with lock:
        counts[state] += 1
    return n


with ThreadPoolExecutor(max_workers=10) as pool:
    list(pool.map(check, range(1, 51)))
print(counts, sum(counts.values()))</pre>
<ul>
<li><code>threading.Lock()</code> ek lock banata hai. Use ek baar, function ke bahar banao, taaki har thread wahi ek lock share kare.</li>
<li><code>with lock:</code> lock leta hai, indented lines chalata hai, aur hamesha release karta hai, andar error aaye tab bhi.</li>
<li><code>with</code> block ke andar ek waqt mein sirf ek thread ho sakta hai. Baaki darwaaze par intezaar karte hain.</li>
<li>7, 14, 21, 28, 35, 42 aur 49 saat ke multiples hain, isliye saat "down" aur 43 "up" hain.</li>
</ul>
<pre class="out">AUTO01$ python3 counter.py
<span class="hl">{'up': 43, 'down': 7} 50</span></pre>
<p>Dono counts ka jod 50 hai, jaisa hona chahiye. Ab wahi ginti bina kisi lock ke dekho, haath se start kiye pachaas threads mein (sleep ke turant baad <code>counts[state] += 1</code>). Lab mein yeh wahi line print karta hai:</p>
<pre class="out">AUTO01$ python3 unsafe.py
{'up': 43, 'down': 7} 50</pre>
<div class="note"><p><b>Lab note.</b> Lab ek waqt mein ek thread chalati hai, isliye teen steps kabhi mix nahi hote aur koi update kabhi nahi khota. Isse pattern seekhne ke liye achhi jagah banti hai par bug saabit karne ke liye buri. Asli server par bahut threads ke saath bina lock wala version 50 se neeche khatam ho sakta hai, aur har run mein nahi. Testing mein failure na dikhna code safe hone ka saboot nahi hai.</p></div>

<h3>Locks ke rules</h3>
<ul>
<li><b>Locked hissa bahut chhota rakho.</b> Lock lo, number badlo, nikal jao. Router mein login karte ya sleep karte waqt lock kabhi mat pakdo; baaki sab threads aapke peeche line mein lag jaayenge aur job phir sequential ho jaati hai. Asli server yeh saaf dikhata hai; lab ki clock nahi dikhati, isliye stopwatch ki jagah rule follow karo.</li>
<li><b>Deadlock.</b> Thread A lock 1 pakde hue lock 2 ka intezaar kare aur thread B lock 2 pakde hue lock 1 ka, to dono hamesha ruke rehte hain. Isse bachne ke liye jahan ho sake ek lock use karo, aur kai locks hamesha ek hi order mein lo.</li>
<li><b>Thread apna hi pakda hua plain Lock dobara na le.</b> Jo code lock pakde hue aisa code call kare jise wahi lock chahiye, to <code>threading.RLock</code> use karo.</li>
<li><b>Sabse achha, kuch share mat karo.</b> Har worker apna jawab return kare aur main thread report banaye, to lock ki zaroorat hi nahi. Agle chapters yahi design use karte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Shared counter ki jagah <code>check</code> se <code>(n, state)</code> return karwao. Pool khatam hone ke baad main thread ginta hai: <code>sum(1 for n, state in rows if state == "down")</code>. Ginti ek hi thread karta hai, isliye na race hai na lock.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Lock function ke andar banana, jisse har call ka apna lock banta hai aur kuch protect nahi hota. Yeh bhool jana ki shared number par <code>+=</code> ko protection chahiye. Network I/O ke dauraan lock pakadna. Alag functions mein do locks alag order mein lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lock sirf us code ko bachata hai jo use sach mein use karta hai. Ek function shared counter ko lock ke andar badle aur doosra bina lock ke, to race phir bhi hai. Aur manual <code>acquire()</code> aur <code>release()</code> ki jagah <code>with lock</code> behtar hai kyunki woh errors par bhi release karta hai.</p></div>

<div class="scn"><h4>Dashboard jo hamesha kuch kam dikhata tha</h4><p>Ek monitoring script 20 threads se 200 switches poll karti thi aur progress bar ke liye shared <code>polled += 1</code> counter rakhti thi. Kuch subah bar 197 par ruk jaata tha jabki saari reports likhi ja chuki thi. Do threads ek saath counter badal rahe the. Increment ko lock mein lapetne se display theek hua; ginti ko main thread mein le jaane se, jo har result receive karta tha, shared variable hi hat gaya.</p><p><b>Lesson:</b> kabhi-kabhi galat number race ki pehchaan hai.</p></div>

<div class="iv"><p class="q">"Race condition kya hai aur use kaise rokte ho?"</p><p>Yeh tab hota hai jab natija shared data ko chhune wale threads ki timing par depend kare, jaise do threads <code>count += 1</code> karein aur ek update kho jaye. Main share na karke, results ko ek collector thread tak return karwa kar, ya shared update ko chhote <code>with</code> block mein <code>threading.Lock</code> se bachakar ise rokta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threads memory share karte hain, isliye unsynchronised updates bina error ke kho sakte hain.</li>
<li><code>counts[x] += 1</code> padho-jodo-likho hai aur lock chahta hai; ek <code>append</code> ko nahi.</li>
<li>Ek lock banao, share karo, aur sabse chhote section ke aaspaas <code>with lock:</code> use karo.</li>
<li>Network I/O ke dauraan lock mat pakdo; deadlock se bachne ke liye locks ek tay order mein lo.</li>
<li>Pasandida design: workers results return karein, main thread unhe jama kare.</li>
</ul></div>
`}};export{e as default};