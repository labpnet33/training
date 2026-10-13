var e={id:`rates-flapping`,h:{en:`Counter rates and the flapping port`,hi:`Counter rates aur flapping port`},body:{en:`
<p>A counter is an odometer, not a speedometer. It only goes up. To know how fast the car is moving you read the odometer twice and divide by the time between the readings. This chapter turns streamed octet counters into bits per second and then catches the port whose status keeps changing. It is Lab 1, tasks 4 and 5.</p>

<h3>The rate formula</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Two samples: octets and device time. Rate equals new minus old, times 8, divided by new time minus old time">
<rect x="20" y="20" width="180" height="60" rx="10" fill="#bae6fd"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="12">old sample</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="11">t0 = 100.0 s, 1000 octets</text>
<rect x="230" y="20" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="12">new sample</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">t1 = 110.0 s, 2250 octets</text>
<rect x="440" y="20" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="530" y="46" text-anchor="middle" class="svg-ink" font-size="12">(2250-1000) x 8 / 10</text><text x="530" y="64" text-anchor="middle" class="svg-accent" font-size="11">= 1000 bit/s</text>
</svg><p class="cap">bits per second = (new - old) x 8 / (t1 - t0)</p></div>
<p>Three rules make the calculator trustworthy:</p>
<ul>
<li><b>Use the timestamp from the device</b> (<code>msg["update"]["timestamp"]</code>, nanoseconds), not your local clock. Network delay moves the arrival time, not the sample time.</li>
<li><b>Multiply octets by 8.</b> Interface speeds are in bits.</li>
<li><b>Guard the edges.</b> A reboot or <code>clear counters</code> makes the new value smaller than the old one, and two samples with the same timestamp give a division by zero.</li>
</ul>
<pre class="code">def rate_bps(old, new):
    (t0, v0), (t1, v1) = old, new
    if t1 &lt;= t0 or v1 &lt; v0:
        return None
    return (v1 - v0) * 8 / (t1 - t0)


print(rate_bps((100.0, 1000), (110.0, 2250)))
print(rate_bps((100.0, 1000), (110.0, 400)))
print(rate_bps((100.0, 1000), (100.0, 1500)))</pre>
<pre class="out">AUTO01$ python3 d_rate.py
1000.0
None
None</pre>
<p>The three answers are a real rate, a skipped reset and a skipped zero interval.</p>

<h3>rates.py: the streaming calculator (Lab 1, task 4)</h3>
<p>One subscription per port, each with sample mode and a 10-second interval. The dictionary <code>last</code> remembers the previous sample of every port.</p>
<pre class="code">import re
import time
from pygnmi.client import gNMIclient

PORTS = ["Ethernet1", "Ethernet2", "Ethernet3"]
INTERVAL = 10
SECONDS = 30

subscribe = {
    "subscription": [
        {"path": f"/interfaces/interface[name={p}]/state/counters/in-octets", "mode": "sample", "sample_interval": INTERVAL * 1000000000}
        for p in PORTS
    ],
    "mode": "stream",
    "encoding": "json",
}

last = {}
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    t0 = time.time()
    for msg in gc.subscribe2(subscribe=subscribe):
        if time.time() - t0 &gt; SECONDS:
            break
        if "update" not in msg:
            continue
        ts = msg["update"]["timestamp"] / 1e9
        for u in msg["update"]["update"]:
            name = re.search(r"name=([^\\]]+)", u["path"]).group(1)
            if name in last:
                old_ts, old_val = last[name]
                rate = (u["val"] - old_val) * 8 / (ts - old_ts)
                print(f"{time.time() - t0:5.1f}s  {name:&lt;10} {rate:8.0f} bit/s")
            last[name] = (ts, u["val"])</pre>
<pre class="out">AUTO01$ python3 rates.py
<span class="hl"> 10.1s  Ethernet1       752 bit/s</span>
 10.2s  Ethernet2       752 bit/s
 10.2s  Ethernet3       752 bit/s
<span class="hl"> 20.2s  Ethernet1       752 bit/s</span>
 20.2s  Ethernet2       752 bit/s
 20.3s  Ethernet3       752 bit/s</pre>
<p>Every port shows 752 bit/s. That is the lab's background management traffic, about one packet a second each way. Lab 1, task 4 asks for the Ethernet1 value.</p>
<div class="eg"><p><b>Worked example.</b> From the stream: Ethernet1 in-octets was 376 at one sample and 564 two seconds later. (564 - 376) x 8 / 2 = 752 bit/s, the same figure at a 10-second interval. A 1 Gbit/s port at 5 percent load would show 50,000,000 bit/s.</p></div>

<h3>ifmon.py: add events and find the flapper (Lab 1, task 5)</h3>
<p>Counters tell you how busy a port is. They do not tell you it blinked. For that, subscribe to oper-status with <code>on_change</code>. The device then sends a message only when the value changes. ifmon.py is rates.py with two additions. First, the subscription list grows by one entry per port:</p>
<pre class="code">    ] + [
        {"path": f"/interfaces/interface[name={p}]/state/oper-status", "mode": "on_change"}
        for p in PORTS
    ],</pre>
<p>Second, the loop separates the two kinds of data by the path and counts changes:</p>
<pre class="code">            if u["path"].endswith("oper-status"):
                if name in status and status[name] != u["val"]:
                    changes[name] = changes.get(name, 0) + 1
                    print(f"{time.time() - t0:5.1f}s  {name:&lt;10} oper-status {status[name]} -&gt; {u['val']}")
                status[name] = u["val"]</pre>
<p>The first value of a port is the starting state, so only a different later value counts as a change. At the end the script prints a verdict: three or more changes in the window means FLAPPING. The file <code>labfault.py</code> plays the part of a loose cable on LEAF2 by shutting and re-enabling its Ethernet3 with gNMI Set; on real gear the cable does that by itself. Wait about a minute after rates.py, then run ifmon.py.</p>
<pre class="out">AUTO01$ python3 ifmon.py
 10.2s  Ethernet1       752 bit/s
 10.2s  Ethernet2       752 bit/s
 10.3s  Ethernet3       752 bit/s
 20.4s  Ethernet1       752 bit/s
 20.4s  Ethernet2       752 bit/s
 20.4s  Ethernet3       752 bit/s
<span class="hl"> 21.4s  Ethernet3  oper-status UP -&gt; DOWN</span>
 30.5s  Ethernet1       803 bit/s
 30.6s  Ethernet2       752 bit/s
 30.6s  Ethernet3         0 bit/s
<span class="hl"> 31.6s  Ethernet3  oper-status DOWN -&gt; UP</span>
 40.7s  Ethernet1       752 bit/s
 40.7s  Ethernet2       752 bit/s
 40.7s  Ethernet3       752 bit/s
<span class="hl"> 41.8s  Ethernet3  oper-status UP -&gt; DOWN</span>
 50.9s  Ethernet1       752 bit/s
 50.9s  Ethernet2       752 bit/s
 50.9s  Ethernet3         0 bit/s
<span class="hl"> 51.9s  Ethernet3  oper-status DOWN -&gt; UP</span>

<span class="hl">Ethernet1  UP    changes=0  stable</span>
<span class="hl">Ethernet2  UP    changes=0  stable</span>
<span class="hl">Ethernet3  UP    changes=4  FLAPPING</span></pre>
<p>Read it from the top. Ethernet3 reports at the first event at 21 s, two seconds after the cable is "pulled", and the rate for that port falls to 0 bit/s while it is down. It comes back at 31 s. After 60 seconds the table shows <code>changes=4</code> for Ethernet3 and 0 for the others. The answer to task 5 is Ethernet3.</p>

<h3>Keeping the stream quiet: suppress_redundant and heartbeat</h3>
<p>A sample subscription repeats a value that never changes. Two keys fix that:</p>
<pre class="code">    "subscription": [{
        "path": f"/interfaces/interface[name={PORT}]/state/oper-status",
        "mode": "sample",
        "sample_interval": 5000000000,
        "suppress_redundant": True,
        "heartbeat_interval": 20000000000,
    }],</pre>
<p><code>suppress_redundant</code> skips a sample if the value equals the last one sent. <code>heartbeat_interval</code> sends the value anyway after that long, so the collector knows the stream is alive:</p>
<pre class="out">AUTO01$ python3 d_sup.py
  0.1s  oper-status = UP
<span class="hl">  0.1s  sync_response</span>
 20.1s  oper-status = UP
 40.1s  oper-status = UP
 60.2s  oper-status = UP</pre>
<p>The status was UP the whole time. It was sent once, then only as a heartbeat every 20 seconds.</p>

<div class="warn"><p><b>Common mistake.</b> Computing the rate from <code>time.time()</code> on the collector. A late message makes the rate look low and the next one look high.</p></div>
<div class="exam"><p><b>Exam trap.</b> Counters cannot be subscribed with on_change; use sample. Status leaves like oper-status are the right on_change targets.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab detects on_change changes on a 1-second granularity and runs on virtual time. If you start a second stream right after a long one, the first rates may read 0; wait a minute and run it again. <code>labfault.py</code> exists only in this lab.</p></div>

<div class="scn"><h4>The 3 a.m. blink</h4><p>A storage uplink showed 12 percent average load and no alarms, yet the database team saw retransmits. A streamed oper-status showed six down and up pairs between 03:00 and 03:10. A dirty fibre connector was cleaned.</p><p><b>Lesson:</b> averages hide blinks; events do not.</p></div>
<div class="iv"><p class="q">"How do you compute interface utilisation from streamed counters?"</p><p>Take two consecutive samples, subtract, multiply by 8, divide by the device timestamp difference, then divide by the interface speed. Guard against resets and zero intervals, and use sample mode because counters do not support on_change.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rate = (new - old) x 8 / (t1 - t0) using device timestamps.</li>
<li>Guard counter resets and zero intervals.</li>
<li>Use on_change for status leaves and count the changes.</li>
<li>Three or more changes in a short window is a flap.</li>
<li>suppress_redundant plus heartbeat keeps streams quiet but alive.</li></ul></div>
`,hi:`
<p>Counter odometer hai, speedometer nahi. Woh sirf badhta hai. Gaadi kitni tez chal rahi hai yeh jaanne ke liye aap odometer do baar padhte ho aur readings ke beech ke time se divide karte ho. Yeh chapter streamed octet counters ko bits per second mein badalta hai aur phir us port ko pakadta hai jiska status baar-baar badalta hai. Yeh Lab 1 ke tasks 4 aur 5 hain.</p>

<h3>Rate ka formula</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Do samples: octets aur device time. Rate barabar naya minus purana, guna 8, bhaga naya time minus purana time">
<rect x="20" y="20" width="180" height="60" rx="10" fill="#bae6fd"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="12">purana sample</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="11">t0 = 100.0 s, 1000 octets</text>
<rect x="230" y="20" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="12">naya sample</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">t1 = 110.0 s, 2250 octets</text>
<rect x="440" y="20" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="530" y="46" text-anchor="middle" class="svg-ink" font-size="12">(2250-1000) x 8 / 10</text><text x="530" y="64" text-anchor="middle" class="svg-accent" font-size="11">= 1000 bit/s</text>
</svg><p class="cap">bits per second = (naya - purana) x 8 / (t1 - t0)</p></div>
<p>Teen niyam calculator ko bharosemand banate hain:</p>
<ul>
<li><b>Device ka timestamp use karo</b> (<code>msg["update"]["timestamp"]</code>, nanoseconds), apni local clock nahi. Network delay arrival time hilata hai, sample time nahi.</li>
<li><b>Octets ko 8 se guna karo.</b> Interface speeds bits mein hoti hain.</li>
<li><b>Kinaron ko guard karo.</b> Reboot ya <code>clear counters</code> se naya value purane se chhota ho jaata hai, aur same timestamp wale do samples zero se division dete hain.</li>
</ul>
<pre class="code">def rate_bps(old, new):
    (t0, v0), (t1, v1) = old, new
    if t1 &lt;= t0 or v1 &lt; v0:
        return None
    return (v1 - v0) * 8 / (t1 - t0)


print(rate_bps((100.0, 1000), (110.0, 2250)))
print(rate_bps((100.0, 1000), (110.0, 400)))
print(rate_bps((100.0, 1000), (100.0, 1500)))</pre>
<pre class="out">AUTO01$ python3 d_rate.py
1000.0
None
None</pre>
<p>Teen jawab hain: asli rate, skip kiya hua reset aur skip kiya hua zero interval.</p>

<h3>rates.py: streaming calculator (Lab 1, task 4)</h3>
<p>Har port ke liye ek subscription, sample mode aur 10 second interval ke saath. Dictionary <code>last</code> har port ka pichhla sample yaad rakhti hai.</p>
<pre class="code">import re
import time
from pygnmi.client import gNMIclient

PORTS = ["Ethernet1", "Ethernet2", "Ethernet3"]
INTERVAL = 10
SECONDS = 30

subscribe = {
    "subscription": [
        {"path": f"/interfaces/interface[name={p}]/state/counters/in-octets", "mode": "sample", "sample_interval": INTERVAL * 1000000000}
        for p in PORTS
    ],
    "mode": "stream",
    "encoding": "json",
}

last = {}
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    t0 = time.time()
    for msg in gc.subscribe2(subscribe=subscribe):
        if time.time() - t0 &gt; SECONDS:
            break
        if "update" not in msg:
            continue
        ts = msg["update"]["timestamp"] / 1e9
        for u in msg["update"]["update"]:
            name = re.search(r"name=([^\\]]+)", u["path"]).group(1)
            if name in last:
                old_ts, old_val = last[name]
                rate = (u["val"] - old_val) * 8 / (ts - old_ts)
                print(f"{time.time() - t0:5.1f}s  {name:&lt;10} {rate:8.0f} bit/s")
            last[name] = (ts, u["val"])</pre>
<pre class="out">AUTO01$ python3 rates.py
<span class="hl"> 10.1s  Ethernet1       752 bit/s</span>
 10.2s  Ethernet2       752 bit/s
 10.2s  Ethernet3       752 bit/s
<span class="hl"> 20.2s  Ethernet1       752 bit/s</span>
 20.2s  Ethernet2       752 bit/s
 20.3s  Ethernet3       752 bit/s</pre>
<p>Har port 752 bit/s dikhata hai. Yeh lab ka background management traffic hai, lagbhag har taraf ek packet per second. Lab 1 ka task 4 Ethernet1 ki value poochhta hai.</p>
<div class="eg"><p><b>Worked example.</b> Stream se: Ethernet1 in-octets ek sample par 376 tha aur do second baad 564. (564 - 376) x 8 / 2 = 752 bit/s, 10 second ke interval par bhi wahi figure. 1 Gbit/s port 5 percent load par 50,000,000 bit/s dikhata.</p></div>

<h3>ifmon.py: events jodo aur flapper dhoondho (Lab 1, task 5)</h3>
<p>Counters batate hain ki port kitna busy hai. Woh yeh nahi batate ki woh jhapka. Uske liye oper-status ko <code>on_change</code> se subscribe karo. Tab device sirf value badalne par message bhejta hai. ifmon.py rates.py hi hai, do additions ke saath. Pehla, subscription list mein har port ke liye ek entry badhti hai:</p>
<pre class="code">    ] + [
        {"path": f"/interfaces/interface[name={p}]/state/oper-status", "mode": "on_change"}
        for p in PORTS
    ],</pre>
<p>Doosra, loop path dekhkar do tarah ka data alag karta hai aur changes gintata hai:</p>
<pre class="code">            if u["path"].endswith("oper-status"):
                if name in status and status[name] != u["val"]:
                    changes[name] = changes.get(name, 0) + 1
                    print(f"{time.time() - t0:5.1f}s  {name:&lt;10} oper-status {status[name]} -&gt; {u['val']}")
                status[name] = u["val"]</pre>
<p>Port ki pehli value starting state hai, isliye sirf baad ki alag value change gini jaati hai. Aakhir mein script verdict print karti hai: window mein teen ya zyada changes matlab FLAPPING. File <code>labfault.py</code> LEAF2 par loose cable ka role nibhati hai: uska Ethernet3 gNMI Set se shut aur re-enable karti hai; asli gear par cable yeh khud karta hai. rates.py ke baad lagbhag ek minute ruko, phir ifmon.py chalao.</p>
<pre class="out">AUTO01$ python3 ifmon.py
 10.2s  Ethernet1       752 bit/s
 10.2s  Ethernet2       752 bit/s
 10.3s  Ethernet3       752 bit/s
 20.4s  Ethernet1       752 bit/s
 20.4s  Ethernet2       752 bit/s
 20.4s  Ethernet3       752 bit/s
<span class="hl"> 21.4s  Ethernet3  oper-status UP -&gt; DOWN</span>
 30.5s  Ethernet1       803 bit/s
 30.6s  Ethernet2       752 bit/s
 30.6s  Ethernet3         0 bit/s
<span class="hl"> 31.6s  Ethernet3  oper-status DOWN -&gt; UP</span>
 40.7s  Ethernet1       752 bit/s
 40.7s  Ethernet2       752 bit/s
 40.7s  Ethernet3       752 bit/s
<span class="hl"> 41.8s  Ethernet3  oper-status UP -&gt; DOWN</span>
 50.9s  Ethernet1       752 bit/s
 50.9s  Ethernet2       752 bit/s
 50.9s  Ethernet3         0 bit/s
<span class="hl"> 51.9s  Ethernet3  oper-status DOWN -&gt; UP</span>

<span class="hl">Ethernet1  UP    changes=0  stable</span>
<span class="hl">Ethernet2  UP    changes=0  stable</span>
<span class="hl">Ethernet3  UP    changes=4  FLAPPING</span></pre>
<p>Upar se padho. Ethernet3 ka pehla event 21 s par aata hai, cable "kheenche" jaane ke do second baad, aur down rehte hue us port ka rate 0 bit/s ho jaata hai. Woh 31 s par wapas aata hai. 60 second baad table Ethernet3 ke liye <code>changes=4</code> aur baakiyon ke liye 0 dikhati hai. Task 5 ka jawab Ethernet3 hai.</p>

<h3>Stream ko shaant rakhna: suppress_redundant aur heartbeat</h3>
<p>Sample subscription woh value bhi dohrati hai jo kabhi nahi badalti. Do keys isse theek karti hain:</p>
<pre class="code">    "subscription": [{
        "path": f"/interfaces/interface[name={PORT}]/state/oper-status",
        "mode": "sample",
        "sample_interval": 5000000000,
        "suppress_redundant": True,
        "heartbeat_interval": 20000000000,
    }],</pre>
<p><code>suppress_redundant</code> sample chhod deta hai agar value pichhli bheji hui ke barabar ho. <code>heartbeat_interval</code> utne waqt baad value phir bhi bhej deta hai, taaki collector ko pata rahe ki stream zinda hai:</p>
<pre class="out">AUTO01$ python3 d_sup.py
  0.1s  oper-status = UP
<span class="hl">  0.1s  sync_response</span>
 20.1s  oper-status = UP
 40.1s  oper-status = UP
 60.2s  oper-status = UP</pre>
<p>Status poore waqt UP tha. Woh ek baar bheja gaya, phir sirf har 20 second mein heartbeat ki tarah.</p>

<div class="warn"><p><b>Aam galti.</b> Rate collector par <code>time.time()</code> se nikalna. Der se aaya message rate ko kam aur agle ko zyada dikha deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Counters ko on_change se subscribe nahi kar sakte; sample use karo. oper-status jaise status leaves on_change ke sahi targets hain.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Lab on_change badlav ko 1 second ki granularity par pakadta hai aur virtual time par chalta hai. Lambi stream ke turant baad doosri stream shuru karo to shuruaati rates 0 dikh sakte hain; ek minute ruko aur dobara chalao. <code>labfault.py</code> sirf is lab mein hai.</p></div>

<div class="scn"><h4>Raat 3 baje ka jhapka</h4><p>Ek storage uplink ka average load 12 percent tha aur koi alarm nahi, phir bhi database team ko retransmits dikh rahe the. Streamed oper-status ne 03:00 se 03:10 ke beech chhe down-up jodi dikhayi. Ganda fibre connector saaf kiya gaya.</p><p><b>Lesson:</b> averages jhapke chhupate hain; events nahi.</p></div>
<div class="iv"><p class="q">"Streamed counters se interface utilisation kaise nikaloge?"</p><p>Do lagataar samples lo, ghatao, 8 se guna karo, device timestamp ke antar se bhaag do, phir interface speed se bhaag do. Reset aur zero interval se bachao, aur sample mode use karo kyunki counters on_change support nahi karte.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rate = (naya - purana) x 8 / (t1 - t0), device timestamps se.</li>
<li>Counter reset aur zero interval ko guard karo.</li>
<li>Status leaves ke liye on_change use karo aur changes gino.</li>
<li>Chhoti window mein teen ya zyada changes flap hai.</li>
<li>suppress_redundant aur heartbeat stream ko shaant par zinda rakhte hain.</li></ul></div>
`}};export{e as default};