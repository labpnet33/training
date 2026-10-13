var e={id:`get`,h:{en:`Get: reading state and configuration with get()`,hi:`Get: get() se state aur configuration padhna`},body:{en:`
<p>A Get is a photograph. You name one or more paths, the device takes a picture of that part of its data tree at this moment, and returns it. Nothing keeps running afterwards. This chapter is Lab 1, task 2.</p>

<h3>The call and the shape of the reply</h3>
<p>The signature is <code>gc.get(path=[...], datatype="all", encoding="json", prefix="")</code>. The reply is always the same nest: a <code>notification</code> list, each notification has a <code>timestamp</code> and an <code>update</code> list, and each update has a <code>path</code> and a <code>val</code>.</p>
<pre class="code">from pygnmi.client import gNMIclient

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    res = gc.get(path=["/interfaces/interface[name=Ethernet1]/state/oper-status"])
    print(res)
    leaf = res["notification"][0]["update"][0]
    print(leaf["path"], "=", leaf["val"])
    res = gc.get(path=["/system/state/hostname", "/interfaces/interface[name=Ethernet2]/config/description"])
    for n in res["notification"]:
        for u in n["update"]:
            print(u["path"], "=", u["val"])</pre>
<pre class="out">AUTO01$ python3 d_get1.py
{'notification': [{'timestamp': 1791705279930000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/oper-status', 'val': 'UP'}]}]}
<span class="hl">interfaces/interface[name=Ethernet1]/state/oper-status = UP</span>
system/state/hostname = LEAF1
interfaces/interface[name=Ethernet2]/config/description = to-LEAF2-a</pre>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Reply nesting: notification list holds timestamp and update list; update holds path and val">
<rect x="10" y="14" width="620" height="92" rx="10" fill="#e2e8f0"/><text x="22" y="34" class="svg-ink" font-size="12">notification  [ list ]</text>
<rect x="30" y="44" width="150" height="48" rx="8" fill="#bae6fd"/><text x="105" y="73" text-anchor="middle" class="svg-ink" font-size="12">timestamp (ns)</text>
<rect x="200" y="44" width="420" height="52" rx="8" fill="#ddd6fe"/><text x="212" y="62" class="svg-ink" font-size="12">update  [ list ]</text>
<rect x="330" y="68" width="130" height="22" rx="6" fill="#fde68a"/><text x="395" y="84" text-anchor="middle" class="svg-ink" font-size="11">path</text>
<rect x="472" y="68" width="140" height="22" rx="6" fill="#bbf7d0"/><text x="542" y="84" text-anchor="middle" class="svg-ink" font-size="11">val</text>
</svg><p class="cap">Every Get reply has this nesting. Read it with two loops.</p></div>
<p>Two paths in one call come back as two updates. A wildcard comes back as one update per match. Because the nesting is stable, one small helper flattens any reply into a dictionary:</p>
<pre class="code">from pygnmi.client import gNMIclient


def flatten(reply):
    """Turn a Get reply into {path: value}."""
    out = {}
    for notification in reply["notification"]:
        for update in notification["update"]:
            out[update["path"]] = update["val"]
    return out


with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    reply = gc.get(path=["/interfaces/interface[name=*]/state/oper-status"], datatype="state")
    flat = flatten(reply)
    up = [p.split("name=")[1].split("]")[0] for p, v in flat.items() if v == "UP"]
    print(len(flat), "interfaces,", len(up), "up:", ", ".join(up))</pre>
<pre class="out">AUTO01$ python3 d_flat.py
9 interfaces, 4 up: Ethernet1, Ethernet2, Ethernet3, Loopback0</pre>

<h3>datatype: config, state or both</h3>
<p>OpenConfig keeps intent under <code>config</code> and reality under <code>state</code>. The <code>datatype</code> argument filters a container:</p>
<ul>
<li><code>all</code> (default): config and state.</li>
<li><code>config</code>: only the writable intent.</li>
<li><code>state</code>: state data, which includes read-only copies of config values.</li>
<li><code>operational</code>: only values derived by the device, without config copies.</li>
</ul>
<pre class="code">from pygnmi.client import gNMIclient

PATH = "/interfaces/interface[name=Ethernet2]"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    for dt in ("config", "state", "operational", "all"):
        res = gc.get(path=[PATH], datatype=dt)
        val = res["notification"][0]["update"][0]["val"]
        print(f"{dt:&lt;12}", sorted(val.keys()))</pre>
<pre class="out">AUTO01$ python3 d_dt.py
<span class="hl">config       ['config', 'ethernet', 'name', 'subinterfaces']</span>
<span class="hl">state        ['ethernet', 'name', 'state', 'subinterfaces']</span>
operational  ['ethernet', 'name', 'state', 'subinterfaces']
all          ['config', 'ethernet', 'name', 'state', 'subinterfaces']</pre>
<p>The <code>config</code> reply has a <code>config</code> branch and no <code>state</code>; the <code>state</code> reply is the opposite; <code>all</code> has both.</p>

<h3>The wildcard snapshot (Lab 1, task 2)</h3>
<p>The question "which interfaces are up?" needs one call, not one per port. Put this in <code>snap.py</code> (heredoc, as in chapter 3):</p>
<pre class="code">from pygnmi.client import gNMIclient

PATH = "/interfaces/interface[name=*]/state/oper-status"

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    result = gc.get(path=[PATH], datatype="state", encoding="json")
    for notification in result["notification"]:
        for update in notification["update"]:
            print(update["path"], update["val"])</pre>
<pre class="out">AUTO01$ python3 snap.py
interfaces/interface[name=Ethernet1]/state/oper-status UP
interfaces/interface[name=Ethernet2]/state/oper-status UP
interfaces/interface[name=Ethernet3]/state/oper-status UP
interfaces/interface[name=Ethernet4]/state/oper-status DOWN
interfaces/interface[name=Ethernet5]/state/oper-status DOWN
interfaces/interface[name=Ethernet6]/state/oper-status DOWN
interfaces/interface[name=Ethernet7]/state/oper-status DOWN
interfaces/interface[name=Ethernet8]/state/oper-status DOWN
<span class="hl">interfaces/interface[name=Loopback0]/state/oper-status UP</span></pre>
<p>Count the UP lines for the task: Ethernet1 to Ethernet3 and Loopback0. Ethernet4 is administratively shut down, and Ethernet5 to Ethernet8 have nothing connected, so they report DOWN.</p>
<div class="eg"><p><b>Worked example.</b> One call returned 9 leaves. An SNMP walk of the same table needs one request per column per row, so 9 interfaces and 3 columns is 27 requests. One Get carries the whole answer in one round trip.</p></div>

<div class="warn"><p><b>Common mistake.</b> Asking for <code>/interfaces</code> and printing everything. On a big switch that is megabytes of JSON. Ask for the leaves you need, or use <code>[name=*]</code> with a leaf path.</p></div>
<div class="exam"><p><b>Exam trap.</b> Get is a one-time snapshot. If a question says "continuously", the answer is Subscribe, not a Get in a loop. Also, a path with no data raises NOT_FOUND; it does not return an empty list.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The timestamp inside each notification is the lab's virtual clock in nanoseconds, which is why it looks like 1791... in the output. On a real device it is the device clock.</p></div>

<div class="scn"><h4>The inventory that found two strangers</h4><p>A fleet inventory ran <code>get(path=["/system/state/hostname"])</code> against every leaf. Two answers were the factory default name. They had been installed during an emergency and never renamed. The report went to the team the same afternoon.</p><p><b>Lesson:</b> a cheap Get across the fleet finds drift that no ticket mentions.</p></div>
<div class="iv"><p class="q">"How do you read the operational status of every interface with one gNMI call?"</p><p>One Get with a wildcard key, <code>/interfaces/interface[name=*]/state/oper-status</code>, datatype state. Mention that the reply is a list of updates, one per interface, and that you flatten it into a dictionary by path.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Get returns notification, then update, then path and val.</li>
<li>Wildcards return many updates in one call.</li>
<li>datatype picks config, state, operational or all.</li>
<li>A missing path is an error, not an empty answer.</li>
<li>For continuous data use Subscribe.</li></ul></div>
`,hi:`
<p>Get ek photograph hai. Aap ek ya zyada paths ka naam lete ho, device is pal apne data tree ke us hisse ki tasveer leta hai aur wapas deta hai. Uske baad kuch chalta nahi rehta. Yeh chapter Lab 1 ka task 2 hai.</p>

<h3>Call aur reply ki shape</h3>
<p>Signature hai <code>gc.get(path=[...], datatype="all", encoding="json", prefix="")</code>. Reply hamesha ek hi nest hota hai: <code>notification</code> list, har notification mein <code>timestamp</code> aur <code>update</code> list, aur har update mein <code>path</code> aur <code>val</code>.</p>
<pre class="code">from pygnmi.client import gNMIclient

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    res = gc.get(path=["/interfaces/interface[name=Ethernet1]/state/oper-status"])
    print(res)
    leaf = res["notification"][0]["update"][0]
    print(leaf["path"], "=", leaf["val"])
    res = gc.get(path=["/system/state/hostname", "/interfaces/interface[name=Ethernet2]/config/description"])
    for n in res["notification"]:
        for u in n["update"]:
            print(u["path"], "=", u["val"])</pre>
<pre class="out">AUTO01$ python3 d_get1.py
{'notification': [{'timestamp': 1791705279930000000, 'update': [{'path': 'interfaces/interface[name=Ethernet1]/state/oper-status', 'val': 'UP'}]}]}
<span class="hl">interfaces/interface[name=Ethernet1]/state/oper-status = UP</span>
system/state/hostname = LEAF1
interfaces/interface[name=Ethernet2]/config/description = to-LEAF2-a</pre>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Reply nesting: notification list mein timestamp aur update list; update mein path aur val">
<rect x="10" y="14" width="620" height="92" rx="10" fill="#e2e8f0"/><text x="22" y="34" class="svg-ink" font-size="12">notification  [ list ]</text>
<rect x="30" y="44" width="150" height="48" rx="8" fill="#bae6fd"/><text x="105" y="73" text-anchor="middle" class="svg-ink" font-size="12">timestamp (ns)</text>
<rect x="200" y="44" width="420" height="52" rx="8" fill="#ddd6fe"/><text x="212" y="62" class="svg-ink" font-size="12">update  [ list ]</text>
<rect x="330" y="68" width="130" height="22" rx="6" fill="#fde68a"/><text x="395" y="84" text-anchor="middle" class="svg-ink" font-size="11">path</text>
<rect x="472" y="68" width="140" height="22" rx="6" fill="#bbf7d0"/><text x="542" y="84" text-anchor="middle" class="svg-ink" font-size="11">val</text>
</svg><p class="cap">Har Get reply ki yahi nesting hai. Do loops se padho.</p></div>
<p>Ek call mein do paths do updates ki tarah wapas aate hain. Wildcard har match ke liye ek update deta hai. Nesting stable hai, isliye ek chhota helper kisi bhi reply ko dictionary mein flatten kar deta hai:</p>
<pre class="code">from pygnmi.client import gNMIclient


def flatten(reply):
    """Turn a Get reply into {path: value}."""
    out = {}
    for notification in reply["notification"]:
        for update in notification["update"]:
            out[update["path"]] = update["val"]
    return out


with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    reply = gc.get(path=["/interfaces/interface[name=*]/state/oper-status"], datatype="state")
    flat = flatten(reply)
    up = [p.split("name=")[1].split("]")[0] for p, v in flat.items() if v == "UP"]
    print(len(flat), "interfaces,", len(up), "up:", ", ".join(up))</pre>
<pre class="out">AUTO01$ python3 d_flat.py
9 interfaces, 4 up: Ethernet1, Ethernet2, Ethernet3, Loopback0</pre>

<h3>datatype: config, state ya dono</h3>
<p>OpenConfig intent ko <code>config</code> ke neeche aur reality ko <code>state</code> ke neeche rakhta hai. <code>datatype</code> argument container ko filter karta hai:</p>
<ul>
<li><code>all</code> (default): config aur state.</li>
<li><code>config</code>: sirf likhne layak intent.</li>
<li><code>state</code>: state data, jisme config values ki read-only copies bhi hoti hain.</li>
<li><code>operational</code>: sirf device ki nikali hui values, config copies ke bina.</li>
</ul>
<pre class="code">from pygnmi.client import gNMIclient

PATH = "/interfaces/interface[name=Ethernet2]"
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    for dt in ("config", "state", "operational", "all"):
        res = gc.get(path=[PATH], datatype=dt)
        val = res["notification"][0]["update"][0]["val"]
        print(f"{dt:&lt;12}", sorted(val.keys()))</pre>
<pre class="out">AUTO01$ python3 d_dt.py
<span class="hl">config       ['config', 'ethernet', 'name', 'subinterfaces']</span>
<span class="hl">state        ['ethernet', 'name', 'state', 'subinterfaces']</span>
operational  ['ethernet', 'name', 'state', 'subinterfaces']
all          ['config', 'ethernet', 'name', 'state', 'subinterfaces']</pre>
<p><code>config</code> reply mein <code>config</code> branch hai aur <code>state</code> nahi; <code>state</code> reply ulta hai; <code>all</code> mein dono hain.</p>

<h3>Wildcard snapshot (Lab 1, task 2)</h3>
<p>"Kaunse interfaces up hain?" ke liye ek call chahiye, har port ke liye ek nahi. Yeh <code>snap.py</code> mein daalo (heredoc, chapter 3 jaisa):</p>
<pre class="code">from pygnmi.client import gNMIclient

PATH = "/interfaces/interface[name=*]/state/oper-status"

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    result = gc.get(path=[PATH], datatype="state", encoding="json")
    for notification in result["notification"]:
        for update in notification["update"]:
            print(update["path"], update["val"])</pre>
<pre class="out">AUTO01$ python3 snap.py
interfaces/interface[name=Ethernet1]/state/oper-status UP
interfaces/interface[name=Ethernet2]/state/oper-status UP
interfaces/interface[name=Ethernet3]/state/oper-status UP
interfaces/interface[name=Ethernet4]/state/oper-status DOWN
interfaces/interface[name=Ethernet5]/state/oper-status DOWN
interfaces/interface[name=Ethernet6]/state/oper-status DOWN
interfaces/interface[name=Ethernet7]/state/oper-status DOWN
interfaces/interface[name=Ethernet8]/state/oper-status DOWN
<span class="hl">interfaces/interface[name=Loopback0]/state/oper-status UP</span></pre>
<p>Task ke liye UP lines gino: Ethernet1 se Ethernet3 aur Loopback0. Ethernet4 administratively shut hai, aur Ethernet5 se Ethernet8 par kuch connected nahi, isliye woh DOWN batate hain.</p>
<div class="eg"><p><b>Worked example.</b> Ek call ne 9 leaves diye. Wahi table SNMP walk se lene mein har row ke har column ke liye ek request lagti hai, yaani 9 interfaces aur 3 columns par 27 requests. Ek Get poora jawab ek round trip mein laata hai.</p></div>

<div class="warn"><p><b>Aam galti.</b> <code>/interfaces</code> maangna aur sab print karna. Bade switch par yeh megabytes ka JSON hai. Sirf zaroori leaves maango, ya leaf path ke saath <code>[name=*]</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Get one-time snapshot hai. Agar sawaal "continuously" kehta hai, jawab Subscribe hai, loop mein Get nahi. Aur jis path par data nahi, woh NOT_FOUND raise karta hai; khaali list wapas nahi aati.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Har notification ka timestamp lab ki virtual clock hai nanoseconds mein, isliye output mein 1791... jaisa dikhta hai. Asli device par yeh device ki clock hoti hai.</p></div>

<div class="scn"><h4>Inventory jisne do ajnabi pakde</h4><p>Ek fleet inventory ne har leaf par <code>get(path=["/system/state/hostname"])</code> chalaya. Do jawab factory default naam the. Woh emergency mein lage the aur kabhi rename nahi hue. Report usi dopahar team ko gayi.</p><p><b>Lesson:</b> poore fleet par sasta Get woh drift pakadta hai jo kisi ticket mein nahi hota.</p></div>
<div class="iv"><p class="q">"Ek gNMI call se har interface ka operational status kaise padhoge?"</p><p>Wildcard key ke saath ek Get, <code>/interfaces/interface[name=*]/state/oper-status</code>, datatype state. Batao ki reply updates ki list hai, har interface ka ek, aur use path ke hisaab se dictionary mein flatten karte ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Get reply: notification, phir update, phir path aur val.</li>
<li>Wildcards ek call mein kai updates dete hain.</li>
<li>datatype config, state, operational ya all chunta hai.</li>
<li>Missing path error hai, khaali jawab nahi.</li>
<li>Continuous data ke liye Subscribe.</li></ul></div>
`}};export{e as default};