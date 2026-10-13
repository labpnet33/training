var e={id:`subscribe`,h:{en:`Subscribe: stream, once and poll`,hi:`Subscribe: stream, once aur poll`},body:{en:`
<p>A subscription is a standing order, like a newspaper delivered every morning. You say what you want, how often, and in which form. The device keeps sending until you stop reading. Concepts such as dial-in were covered in <code>auto-telemetry</code>; here you write the code. This chapter is Lab 1, task 3.</p>

<h3>The subscribe dictionary</h3>
<p>pygnmi takes one dictionary. The outer keys describe the whole list; each entry in <code>subscription</code> describes one path.</p>
<table class="cmp"><tr><th>Where</th><th>Key</th><th>Values and meaning</th></tr>
<tr><td>outer</td><td><code>mode</code></td><td><b>stream</b> (keeps going), <b>once</b> (one snapshot, then stops), <b>poll</b> (nothing until you ask)</td></tr>
<tr><td>outer</td><td><code>encoding</code>, <code>updates_only</code>, <code>prefix</code></td><td>wire format; skip the initial values; common path start</td></tr>
<tr><td>per path</td><td><code>path</code></td><td>the model path, wildcards allowed</td></tr>
<tr><td>per path</td><td><code>mode</code></td><td><b>sample</b> (every interval), <b>on_change</b> (only when it changes), <b>target_defined</b> (the device chooses)</td></tr>
<tr><td>per path</td><td><code>sample_interval</code></td><td><b>nanoseconds</b>. 10 seconds is <code>10 * 1000000000</code></td></tr>
<tr><td>per path</td><td><code>suppress_redundant</code>, <code>heartbeat_interval</code></td><td>chapter 6</td></tr></table>
<p>Two kinds of message come back: <code>{'update': {...}}</code>, with a timestamp and a list of path and val, and <code>{'sync_response': True}</code>, which means "the initial values are all delivered; from now on only fresh data".</p>
<pre class="code">import time
from pygnmi.client import gNMIclient

subscribe = {
    "subscription": [{"path": "/interfaces/interface[name=Ethernet1]/state/counters/in-octets", "mode": "sample", "sample_interval": 2000000000}],
    "mode": "stream",
    "encoding": "json",
}
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    t0 = time.time()
    for i, msg in enumerate(gc.subscribe2(subscribe=subscribe)):
        print(f"{time.time() - t0:4.1f}s", msg)
        if i == 3:
            break</pre>
<pre class="out">AUTO01$ python3 d_stream.py
 0.0s {'update': {'timestamp': 1791705294730000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/in-octets', 'val': 5044}]}}
<span class="hl"> 0.1s {'sync_response': True}</span>
 2.1s {'update': {'timestamp': 1791705296730000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/in-octets', 'val': 5232}]}}
 4.1s {'update': {'timestamp': 1791705298730000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/in-octets', 'val': 5420}]}}</pre>
<p>The first update is the current value. Then <code>sync_response</code>. Then one reading every 2 seconds, with a timestamp from the device. The in-octets value grows by 188 each time: that is the device's own traffic.</p>

<h3>once: one snapshot, then it ends (Lab 1, task 3)</h3>
<p>Mode <code>once</code> gives a Get-like snapshot through the Subscribe RPC. The stream closes itself after the <code>sync_response</code>. Write <code>once.py</code>:</p>
<pre class="code">from pygnmi.client import gNMIclient

subscribe = {
    "subscription": [
        {"path": "/system/state/hostname"},
        {"path": "/interfaces/interface[name=Ethernet1]/state/oper-status"},
    ],
    "mode": "once",
    "encoding": "json",
}

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    for msg in gc.subscribe2(subscribe=subscribe):
        print(msg)</pre>
<pre class="out">AUTO01$ python3 once.py
{'update': {'timestamp': 1791705283530000000, 'update': [{'path': 'system/state/hostname', 'val': 'LEAF1'}]}}
{'update': {'timestamp': 1791705283530000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/oper-status', 'val': 'UP'}]}}
<span class="hl">{'sync_response': True}</span></pre>
<p>The last message, <code>sync_response</code>, is how you know the snapshot is complete. The task asks for its name.</p>

<h3>poll: you decide when</h3>
<p>With mode <code>poll</code> the device sends nothing until you call <code>poll()</code>. It then sends the current values and a sync_response. Use it when a script wants data at its own pace over one long session.</p>
<pre class="code">import time
from pygnmi.client import gNMIclient

PATH = "/interfaces/interface[name=Ethernet1]/state/counters/out-pkts"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    poll = gc.subscribe2(subscribe={"subscription": [{"path": PATH}], "mode": "poll"})
    print("before poll:", poll.get_update())
    poll.poll()
    print(poll.get_update())
    print(poll.get_update())
    time.sleep(10)
    poll.poll()
    print(poll.get_update())
    poll.close()</pre>
<pre class="out">AUTO01$ python3 d_poll.py
<span class="hl">before poll: None</span>
{'update': {'timestamp': 1791705284130000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/out-pkts', 'val': 18}]}}
{'sync_response': True}
{'update': {'timestamp': 1791705294130000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/out-pkts', 'val': 28}]}}</pre>
<p>The first <code>get_update()</code> returned <code>None</code> because nothing had been requested. After the second poll, 10 seconds later, the packet counter had moved from 18 to 28.</p>

<h3>target_defined and the limits</h3>
<p>With <code>"mode": "target_defined"</code> on a whole interface state container, the device picks the best mode per leaf: events for status, periodic samples for counters. Here the first update carried 28 leaves and then 18 counter leaves arrived every 10 s, the lab default sample interval.</p>
<pre class="out">AUTO01$ python3 d_tgt.py
  0.0s 28
  0.1s sync_response
 10.1s 18
 20.1s 18
 30.2s 18</pre>
<p>Devices also refuse requests they cannot honour, and they refuse them with INVALID_ARGUMENT or NOT_FOUND before any data flows:</p>
<pre class="out">AUTO01$ python3 d_bad.py
<span class="hl">too fast -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Sample interval 100000000 ns is below the minimum supported by this device (1000000000 ns) for /interfaces/interface[name=Ethernet1]/state/counters</span>
<span class="hl">on_change on counters -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; ON_CHANGE subscriptions are not supported for /interfaces/interface[name=Ethernet1]/state/counters (use SAMPLE)</span>
no such path -&gt; gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /nope</pre>

<div class="warn"><p><b>Common mistake.</b> Writing <code>sample_interval: 10</code>. That is 10 nanoseconds, far below the minimum. The error shows the nanosecond value, which is your clue. Use <code>10 * 1000000000</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stream, once and poll are modes of the whole list; sample, on_change and target_defined are modes of one path. Do not mix them up.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Streams run on the lab's virtual clock: asking for the next message moves the clock forward instead of sleeping, so a 60-second stream finishes in a moment. A lab stream that has nothing new for 600 virtual seconds ends by itself; real streams do not. Minimum sample interval in the lab is 1 second on EOS, 5 seconds on IOS XE and 2 on Junos.</p></div>

<div class="scn"><h4>One second is not always allowed</h4><p>A collector asked a router for counters every second and got INVALID_ARGUMENT on half the fleet. Those models had a 5-second floor. The team set 10 seconds everywhere and wrote the number into the inventory.</p><p><b>Lesson:</b> the minimum interval is per device and per platform.</p></div>
<div class="iv"><p class="q">"Explain stream, once and poll."</p><p>Stream is a long-lived subscription that continues until closed. Once sends a single snapshot and ends. Poll sends data only when the client asks. Add that inside a stream each path is sample, on_change or target_defined.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List modes: stream, once, poll. Path modes: sample, on_change, target_defined.</li>
<li>sample_interval is in nanoseconds.</li>
<li>Messages are update and sync_response.</li>
<li>Devices enforce a minimum interval and refuse on_change on counters.</li>
<li>Close the stream when you are done.</li></ul></div>
`,hi:`
<p>Subscription ek standing order hai, jaise roz subah aane wala akhbaar. Aap batate ho kya chahiye, kitni baar, aur kis form mein. Jab tak aap padhna band nahi karte, device bhejta rehta hai. Dial-in jaise concepts <code>auto-telemetry</code> mein the; yahan aap code likhte ho. Yeh chapter Lab 1 ka task 3 hai.</p>

<h3>Subscribe dictionary</h3>
<p>pygnmi ek dictionary leta hai. Bahar ki keys poori list describe karti hain; <code>subscription</code> ki har entry ek path describe karti hai.</p>
<table class="cmp"><tr><th>Kahan</th><th>Key</th><th>Values aur matlab</th></tr>
<tr><td>bahar</td><td><code>mode</code></td><td><b>stream</b> (chalta rehta hai), <b>once</b> (ek snapshot, phir ruk jaata hai), <b>poll</b> (aap maango tab tak kuch nahi)</td></tr>
<tr><td>bahar</td><td><code>encoding</code>, <code>updates_only</code>, <code>prefix</code></td><td>wire format; shuruaati values chhod do; common path shuruaat</td></tr>
<tr><td>har path</td><td><code>path</code></td><td>model path, wildcards allowed</td></tr>
<tr><td>har path</td><td><code>mode</code></td><td><b>sample</b> (har interval par), <b>on_change</b> (sirf badalne par), <b>target_defined</b> (device chunta hai)</td></tr>
<tr><td>har path</td><td><code>sample_interval</code></td><td><b>nanoseconds</b>. 10 second matlab <code>10 * 1000000000</code></td></tr>
<tr><td>har path</td><td><code>suppress_redundant</code>, <code>heartbeat_interval</code></td><td>chapter 6</td></tr></table>
<p>Do tarah ke message wapas aate hain: <code>{'update': {...}}</code>, jisme timestamp aur path-val ki list hoti hai, aur <code>{'sync_response': True}</code>, jiska matlab hai "shuruaati values sab pahunch gayi; ab se sirf taaza data".</p>
<pre class="code">import time
from pygnmi.client import gNMIclient

subscribe = {
    "subscription": [{"path": "/interfaces/interface[name=Ethernet1]/state/counters/in-octets", "mode": "sample", "sample_interval": 2000000000}],
    "mode": "stream",
    "encoding": "json",
}
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    t0 = time.time()
    for i, msg in enumerate(gc.subscribe2(subscribe=subscribe)):
        print(f"{time.time() - t0:4.1f}s", msg)
        if i == 3:
            break</pre>
<pre class="out">AUTO01$ python3 d_stream.py
 0.0s {'update': {'timestamp': 1791705294730000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/in-octets', 'val': 5044}]}}
<span class="hl"> 0.1s {'sync_response': True}</span>
 2.1s {'update': {'timestamp': 1791705296730000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/in-octets', 'val': 5232}]}}
 4.1s {'update': {'timestamp': 1791705298730000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/in-octets', 'val': 5420}]}}</pre>
<p>Pehla update current value hai. Phir <code>sync_response</code>. Phir har 2 second mein ek reading, device ke timestamp ke saath. In-octets har baar 188 se badhta hai: yeh device ka apna traffic hai.</p>

<h3>once: ek snapshot, phir khatam (Lab 1, task 3)</h3>
<p>Mode <code>once</code> Subscribe RPC ke zariye Get jaisa snapshot deta hai. <code>sync_response</code> ke baad stream khud band ho jaati hai. <code>once.py</code> likho:</p>
<pre class="code">from pygnmi.client import gNMIclient

subscribe = {
    "subscription": [
        {"path": "/system/state/hostname"},
        {"path": "/interfaces/interface[name=Ethernet1]/state/oper-status"},
    ],
    "mode": "once",
    "encoding": "json",
}

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    for msg in gc.subscribe2(subscribe=subscribe):
        print(msg)</pre>
<pre class="out">AUTO01$ python3 once.py
{'update': {'timestamp': 1791705283530000000, 'update': [{'path': 'system/state/hostname', 'val': 'LEAF1'}]}}
{'update': {'timestamp': 1791705283530000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/oper-status', 'val': 'UP'}]}}
<span class="hl">{'sync_response': True}</span></pre>
<p>Aakhri message <code>sync_response</code> hi batata hai ki snapshot poora hai. Task isi ka naam poochhta hai.</p>

<h3>poll: aap tay karo kab</h3>
<p>Mode <code>poll</code> mein device <code>poll()</code> call hone tak kuch nahi bhejta. Phir woh current values aur sync_response bhejta hai. Tab use karo jab script ek lambi session mein apni raftaar se data chahti hai.</p>
<pre class="code">import time
from pygnmi.client import gNMIclient

PATH = "/interfaces/interface[name=Ethernet1]/state/counters/out-pkts"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    poll = gc.subscribe2(subscribe={"subscription": [{"path": PATH}], "mode": "poll"})
    print("before poll:", poll.get_update())
    poll.poll()
    print(poll.get_update())
    print(poll.get_update())
    time.sleep(10)
    poll.poll()
    print(poll.get_update())
    poll.close()</pre>
<pre class="out">AUTO01$ python3 d_poll.py
<span class="hl">before poll: None</span>
{'update': {'timestamp': 1791705284130000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/out-pkts', 'val': 18}]}}
{'sync_response': True}
{'update': {'timestamp': 1791705294130000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/counters/out-pkts', 'val': 28}]}}</pre>
<p>Pehla <code>get_update()</code> <code>None</code> laya kyunki kuch maanga nahi gaya tha. 10 second baad doosre poll ke baad packet counter 18 se 28 ho gaya.</p>

<h3>target_defined aur limits</h3>
<p>Poore interface state container par <code>"mode": "target_defined"</code> dene se device har leaf ke liye behtar mode chunta hai: status ke liye events, counters ke liye periodic samples. Yahan pehle update mein 28 leaves aaye aur phir har 10 s mein 18 counter leaves, jo lab ka default sample interval hai.</p>
<pre class="out">AUTO01$ python3 d_tgt.py
  0.0s 28
  0.1s sync_response
 10.1s 18
 20.1s 18
 30.2s 18</pre>
<p>Device woh requests bhi refuse karte hain jo woh nibha nahi sakte, aur data bahne se pehle INVALID_ARGUMENT ya NOT_FOUND ke saath:</p>
<pre class="out">AUTO01$ python3 d_bad.py
<span class="hl">too fast -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Sample interval 100000000 ns is below the minimum supported by this device (1000000000 ns) for /interfaces/interface[name=Ethernet1]/state/counters</span>
<span class="hl">on_change on counters -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; ON_CHANGE subscriptions are not supported for /interfaces/interface[name=Ethernet1]/state/counters (use SAMPLE)</span>
no such path -&gt; gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /nope</pre>

<div class="warn"><p><b>Aam galti.</b> <code>sample_interval: 10</code> likhna. Yeh 10 nanoseconds hai, minimum se bahut neeche. Error nanosecond value dikhata hai, wahi aapka clue hai. <code>10 * 1000000000</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stream, once aur poll poori list ke modes hain; sample, on_change aur target_defined ek path ke modes hain. Inhe mix mat karo.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Streams lab ki virtual clock par chalti hain: agla message maangne se clock aage badhti hai, sleep nahi hota, isliye 60 second ki stream pal bhar mein khatam. Jis lab stream mein 600 virtual second kuch naya na aaye woh khud khatam ho jaati hai; asli streams nahi hoti. Lab mein minimum sample interval EOS par 1 second, IOS XE par 5 second aur Junos par 2 second hai.</p></div>

<div class="scn"><h4>Ek second hamesha allowed nahi</h4><p>Ek collector ne router se har second counters maange aur aadhe fleet par INVALID_ARGUMENT mila. Un models ka floor 5 second tha. Team ne har jagah 10 second rakha aur number inventory mein likh diya.</p><p><b>Lesson:</b> minimum interval device aur platform ke hisaab se hota hai.</p></div>
<div class="iv"><p class="q">"Stream, once aur poll samjhao."</p><p>Stream lambi subscription hai jo band hone tak chalti hai. Once ek snapshot bhejkar khatam hota hai. Poll tabhi data bhejta hai jab client maange. Jodo ki stream ke andar har path sample, on_change ya target_defined hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List modes: stream, once, poll. Path modes: sample, on_change, target_defined.</li>
<li>sample_interval nanoseconds mein hai.</li>
<li>Messages: update aur sync_response.</li>
<li>Device minimum interval lagate hain aur counters par on_change refuse karte hain.</li>
<li>Kaam khatam hone par stream band karo.</li></ul></div>
`}};export{e as default};