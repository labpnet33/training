var e={id:`sweep-collect`,h:{en:`Sweeping a subnet and collecting results safely`,hi:`Subnet sweep karna aur results safely jama karna`},body:{en:`
<p><b>The idea of this chapter:</b> two jobs that network teams run every day, and one habit that makes them reliable. The jobs are a <b>ping sweep</b> (who answers on this subnet?) and a <b>fleet poll</b> (what does each router say?). The habit is to <b>collect results in one place, in the main thread</b>, and print the report after the work is done.</p>

<h3>Analogy: the sign-in sheet</h3>
<p>Five surveyors walk a street, each knocking on different doors. If all five shout their findings at once, nobody can write them down. Instead each hands a slip to the supervisor at the end of their round, and the supervisor writes one tidy sheet in house-number order. Workers gather facts; one person assembles the report.</p>

<h3>Ping sweep with subprocess (Lab 1, task 3)</h3>
<p>A ping waits for a reply, so it is pure I/O. The lab host has the standard <code>ping</code> program. Python starts it with <code>subprocess.run</code> and reads the exit code: 0 means a reply came back, anything else means silence. Save this as <code>sweep.py</code>:</p>
<pre class="code">import subprocess
from concurrent.futures import ThreadPoolExecutor


def ping(ip):
    r = subprocess.run(["ping", "-c", "1", "-W", "1", ip], capture_output=True, text=True)
    return ip, r.returncode == 0


ips = [f"10.99.0.{n}" for n in range(1, 9)]
with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(ping, ips))
print("answering:", [ip for ip, ok in results if ok])
print(len([1 for ip, ok in results if not ok]), "silent")</pre>
<ul>
<li>The command list is <code>["ping", "-c", "1", "-W", "1", ip]</code>: <code>-c 1</code> sends one packet, <code>-W 1</code> waits at most one second. A list of words, not one long string, avoids shell tricks with odd input.</li>
<li><code>capture_output=True, text=True</code> keeps the program's output as text in <code>r.stdout</code> rather than printing it.</li>
<li>The function returns <code>(ip, True or False)</code>. Eight workers cover eight addresses in one wave.</li>
<li>The last two lines are the main thread building the report from finished results.</li>
</ul>
<pre class="out">AUTO01$ python3 sweep.py
<span class="hl">answering: ['10.99.0.1', '10.99.0.2', '10.99.0.4', '10.99.0.5']</span>
<span class="hl">4 silent</span></pre>
<p>Four routers answer. The four silent addresses are R3, which is shut down, and .6, .7 and .8, where nothing is connected. The answer to Lab 1's "how many addresses answer?" is 4. A sweep says "alive or silent", not why. Silent could be a dead device, a firewall that drops ICMP, or an empty address.</p>

<h3>Poll the fleet and keep the results</h3>
<p>Now a richer router poll. Each worker returns one small dictionary and touches nothing shared.</p>
<pre class="code">def inventory(ip):
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026", conn_timeout=3)
    except NetmikoTimeoutException:
        return ip, {"hostname": None, "up": 0, "error": "timeout"}
    name = conn.find_prompt().rstrip("#&gt;")
    brief = conn.send_command("show ip interface brief")
    conn.disconnect()
    up = sum(1 for line in brief.splitlines()[1:] if " up " in line + " ")
    return ip, {"hostname": name, "up": up, "error": None}


report = {}
with ThreadPoolExecutor(max_workers=5) as pool:
    futures = [pool.submit(inventory, ip) for ip in IPS]
    for fut in as_completed(futures):
        ip, row = fut.result()
        report[ip] = row
for ip in IPS:
    print(ip, report[ip])</pre>
<pre class="out">AUTO01$ python3 inventory.py
10.99.0.1 {'hostname': 'PUN-CORE-R1', 'up': 1, 'error': None}
10.99.0.2 {'hostname': 'BLR-EDGE-R2', 'up': 1, 'error': None}
<span class="hl">10.99.0.3 {'hostname': None, 'up': 0, 'error': 'timeout'}</span>
10.99.0.4 {'hostname': 'DEL-EDGE-R4', 'up': 1, 'error': None}
10.99.0.5 {'hostname': 'MUM-EDGE-R5', 'up': 1, 'error': None}</pre>
<p>Three design choices matter here:</p>
<ul>
<li><b>The worker returns a record, it does not print or append to a global.</b> Every row has the same keys, including the failure row, so later code never meets a missing field.</li>
<li><b>The main thread stores each row in a dictionary keyed by IP.</b> Only one thread writes to <code>report</code>, so no lock is needed.</li>
<li><b>The report is printed in the order of <code>IPS</code>,</b> not in finishing order. <code>as_completed</code> gives the fastest first, but a report people compare day to day should have a stable order.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Workers return records, the main thread stores them by IP and prints a sorted report">
<rect x="10" y="20" width="150" height="120" rx="10" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">workers (threads)</text>
<text x="85" y="68" text-anchor="middle" class="svg-muted" font-size="11">poll one device</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">return a record</text><text x="85" y="108" text-anchor="middle" class="svg-muted" font-size="11">print nothing</text>
<rect x="250" y="20" width="150" height="120" rx="10" fill="#fde68a"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="12">main thread</text>
<text x="325" y="68" text-anchor="middle" class="svg-muted" font-size="11">as_completed loop</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="11">report[ip] = row</text><text x="325" y="108" text-anchor="middle" class="svg-muted" font-size="11">count progress</text>
<rect x="490" y="20" width="140" height="120" rx="10" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">report</text>
<text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">sorted by IP</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="11">failures listed</text><text x="560" y="108" text-anchor="middle" class="svg-muted" font-size="11">printed once</text>
<line x1="160" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="162" text-anchor="middle" class="svg-accent" font-size="12">only the main thread writes the shared report</text>
</svg><p class="cap">Workers gather, the main thread assembles.</p></div>

<h3>Order, sorting and progress for fifty devices</h3>
<p>The lab has five routers, so this stand-in uses a function that waits one second per address, as an SSH login would, over fifty made-up addresses. It shows two things people need on big runs: a progress line and a correctly sorted result.</p>
<pre class="code">import ipaddress
import time
from concurrent.futures import ThreadPoolExecutor, as_completed


def check(ip):
    n = int(ip.split(".")[-1])
    time.sleep(1)
    return ip, ("down" if n % 7 == 0 else "up")


ips = [f"10.99.1.{n}" for n in range(1, 51)]
status = {}
t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    futures = [pool.submit(check, ip) for ip in ips]
    for done, fut in enumerate(as_completed(futures), start=1):
        ip, state = fut.result()
        status[ip] = state
        if done % 10 == 0:
            print(f"{done:2d}/{len(ips)} done after {time.perf_counter() - t0:.0f}s")
down = sorted((ip for ip, s in status.items() if s == "down"), key=ipaddress.ip_address)
print("down:", down)
print(f"{len(status)} results in {time.perf_counter() - t0:.0f}s")</pre>
<ul>
<li><code>enumerate(..., start=1)</code> counts finished futures; this counter lives in the main thread, so it is race-free.</li>
<li><code>sorted(..., key=ipaddress.ip_address)</code> sorts addresses numerically. Sorting the plain strings would put 10.99.1.7 after 10.99.1.49. (This uses the <b>py-ipaddr</b> module.)</li>
</ul>
<pre class="out">AUTO01$ python3 progress.py
10/50 done after 1s
20/50 done after 2s
30/50 done after 3s
40/50 done after 4s
<span class="hl">50/50 done after 5s</span>
<span class="hl">down: ['10.99.1.7', '10.99.1.14', '10.99.1.21', '10.99.1.28', '10.99.1.35', '10.99.1.42', '10.99.1.49']</span>
50 results in 5s</pre>
<p>Fifty one-second jobs ran in five waves of ten: five seconds instead of fifty. Progress lines tell the operator the script is alive. The seven down addresses are listed in true numeric order.</p>

<div class="eg"><p><b>Worked example.</b> A morning check covers 300 switches. Workers return <code>(ip, "up")</code> or <code>(ip, "down")</code>. The main thread builds <code>status</code>, prints "287 up, 13 down" and the list of 13 sorted addresses. A manager reads those two lines; the operator reads the progress lines while waiting.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Printing from workers, so lines from different devices interleave. Appending to a global list from many places and then forgetting that finishing order is random. Reporting only successes, so a missing device is invisible. Sorting IP strings alphabetically. Using a bare <code>except</code> in the worker so a real bug looks like "device down".</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pool.map</code> returns results in input order, <code>as_completed</code> in finishing order; a dictionary keyed by IP makes either safe. A ping exit code of 0 means a reply arrived; non-zero means no reply, not necessarily a dead device.</p></div>

<div class="scn"><h4>Two reports, two different orders</h4><p>Two engineers compared yesterday's and today's device reports with <code>diff</code> and saw hundreds of changes, though only one switch had changed. The script printed rows in finishing order, which differs on every run. Storing rows in a dictionary and printing in sorted IP order made the reports comparable, and the single real change stood out.</p><p><b>Lesson:</b> collect first, then sort, then print.</p></div>

<div class="iv"><p class="q">"How do you collect results from many threads safely?"</p><p>I make workers pure: they take an input and return a record, with no printing and no shared writes. The main thread stores records by key as futures finish, then sorts and prints once. Because only one thread touches the collection, no lock is needed, and failures are recorded as rows rather than lost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A ping sweep is I/O-bound: <code>subprocess.run</code> in a pool; exit code 0 means a reply.</li>
<li>Workers return records; the main thread stores them by key and builds the report.</li>
<li>Failure rows have the same keys as success rows so later code is simple.</li>
<li>Print in a stable order; sort IPs with <code>key=ipaddress.ip_address</code>.</li>
<li>Count progress in the main thread's <code>as_completed</code> loop.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> do jobs jo network teams roz chalati hain, aur ek aadat jo unhe bharosemand banati hai. Jobs hain <b>ping sweep</b> (is subnet par kaun jawab deta hai?) aur <b>fleet poll</b> (har router kya kehta hai?). Aadat yeh hai ki <b>results ek hi jagah, main thread mein, jama karo</b> aur report kaam khatam hone ke baad print karo.</p>

<h3>Analogy: sign-in sheet</h3>
<p>Paanch surveyors ek gali mein chalte hain, har ek alag darwaaze khatkhatata hai. Paanchon ek saath apni khoj chillayein to koi likh nahi sakta. Iski jagah har ek apne round ke ant mein supervisor ko parchi deta hai, aur supervisor ghar ke number ke order mein ek saaf sheet likhta hai. Workers tathya jama karte hain; ek vyakti report jodta hai.</p>

<h3>subprocess ke saath ping sweep (Lab 1, task 3)</h3>
<p>Ping reply ka intezaar karta hai, isliye yeh pura I/O hai. Lab host par standard <code>ping</code> program hai. Python use <code>subprocess.run</code> se chalata hai aur exit code padhta hai: 0 ka matlab reply aaya, kuch aur ka matlab chuppi. Ise <code>sweep.py</code> naam se save karo:</p>
<pre class="code">import subprocess
from concurrent.futures import ThreadPoolExecutor


def ping(ip):
    r = subprocess.run(["ping", "-c", "1", "-W", "1", ip], capture_output=True, text=True)
    return ip, r.returncode == 0


ips = [f"10.99.0.{n}" for n in range(1, 9)]
with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(ping, ips))
print("answering:", [ip for ip, ok in results if ok])
print(len([1 for ip, ok in results if not ok]), "silent")</pre>
<ul>
<li>Command list <code>["ping", "-c", "1", "-W", "1", ip]</code> hai: <code>-c 1</code> ek packet bhejta hai, <code>-W 1</code> zyada se zyada ek second intezaar karta hai. Ek lambi string ki jagah shabdon ki list, ajeeb input ke saath shell tricks se bachati hai.</li>
<li><code>capture_output=True, text=True</code> program ka output print karne ki jagah text ke roop mein <code>r.stdout</code> mein rakhta hai.</li>
<li>Function <code>(ip, True ya False)</code> return karta hai. Aath workers aath addresses ko ek wave mein cover karte hain.</li>
<li>Aakhri do lines main thread hain jo finished results se report banati hain.</li>
</ul>
<pre class="out">AUTO01$ python3 sweep.py
<span class="hl">answering: ['10.99.0.1', '10.99.0.2', '10.99.0.4', '10.99.0.5']</span>
<span class="hl">4 silent</span></pre>
<p>Chaar routers jawab dete hain. Chaar chup addresses hain R3, jo band hai, aur .6, .7 aur .8, jahan kuch juda nahi. Lab 1 ke "kitne addresses jawab dete hain?" ka jawab 4 hai. Sweep "zinda ya chup" batata hai, kyon nahi. Chup ka matlab dead device, ICMP drop karne wala firewall, ya khaali address ho sakta hai.</p>

<h3>Fleet poll karo aur results rakho</h3>
<p>Ab ek richer router poll. Har worker ek chhoti dictionary return karta hai aur kuch shared nahi chhuta.</p>
<pre class="code">def inventory(ip):
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026", conn_timeout=3)
    except NetmikoTimeoutException:
        return ip, {"hostname": None, "up": 0, "error": "timeout"}
    name = conn.find_prompt().rstrip("#&gt;")
    brief = conn.send_command("show ip interface brief")
    conn.disconnect()
    up = sum(1 for line in brief.splitlines()[1:] if " up " in line + " ")
    return ip, {"hostname": name, "up": up, "error": None}


report = {}
with ThreadPoolExecutor(max_workers=5) as pool:
    futures = [pool.submit(inventory, ip) for ip in IPS]
    for fut in as_completed(futures):
        ip, row = fut.result()
        report[ip] = row
for ip in IPS:
    print(ip, report[ip])</pre>
<pre class="out">AUTO01$ python3 inventory.py
10.99.0.1 {'hostname': 'PUN-CORE-R1', 'up': 1, 'error': None}
10.99.0.2 {'hostname': 'BLR-EDGE-R2', 'up': 1, 'error': None}
<span class="hl">10.99.0.3 {'hostname': None, 'up': 0, 'error': 'timeout'}</span>
10.99.0.4 {'hostname': 'DEL-EDGE-R4', 'up': 1, 'error': None}
10.99.0.5 {'hostname': 'MUM-EDGE-R5', 'up': 1, 'error': None}</pre>
<p>Yahan teen design choices matter karte hain:</p>
<ul>
<li><b>Worker record return karta hai, print nahi karta aur global mein append nahi karta.</b> Har row ki keys ek jaisi hain, failure row ki bhi, isliye baad ka code kabhi missing field nahi dekhta.</li>
<li><b>Main thread har row ko IP ki key se dictionary mein rakhta hai.</b> <code>report</code> mein sirf ek thread likhta hai, isliye lock nahi chahiye.</li>
<li><b>Report <code>IPS</code> ke order mein print hoti hai,</b> khatam hone ke order mein nahi. <code>as_completed</code> sabse tez pehle deta hai, par jis report ko log roz-roz compare karte hain uska order sthir hona chahiye.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Workers records return karte hain, main thread unhe IP se rakhta hai aur sorted report print karta hai">
<rect x="10" y="20" width="150" height="120" rx="10" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">workers (threads)</text>
<text x="85" y="68" text-anchor="middle" class="svg-muted" font-size="11">ek device poll karo</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">record return karo</text><text x="85" y="108" text-anchor="middle" class="svg-muted" font-size="11">kuch print nahi</text>
<rect x="250" y="20" width="150" height="120" rx="10" fill="#fde68a"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="12">main thread</text>
<text x="325" y="68" text-anchor="middle" class="svg-muted" font-size="11">as_completed loop</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="11">report[ip] = row</text><text x="325" y="108" text-anchor="middle" class="svg-muted" font-size="11">progress ginna</text>
<rect x="490" y="20" width="140" height="120" rx="10" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">report</text>
<text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">IP se sorted</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="11">failures listed</text><text x="560" y="108" text-anchor="middle" class="svg-muted" font-size="11">ek baar print</text>
<line x1="160" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="162" text-anchor="middle" class="svg-accent" font-size="12">shared report sirf main thread likhta hai</text>
</svg><p class="cap">Workers jama karte hain, main thread jodta hai.</p></div>

<h3>Pachaas devices ke liye order, sorting aur progress</h3>
<p>Lab mein paanch routers hain, isliye yeh stand-in pachaas bane-banaye addresses par aisa function use karta hai jo SSH login ki tarah har address par ek second intezaar karta hai. Yeh do cheezein dikhata hai jo bade runs mein chahiye: progress line aur sahi sorted result.</p>
<pre class="code">import ipaddress
import time
from concurrent.futures import ThreadPoolExecutor, as_completed


def check(ip):
    n = int(ip.split(".")[-1])
    time.sleep(1)
    return ip, ("down" if n % 7 == 0 else "up")


ips = [f"10.99.1.{n}" for n in range(1, 51)]
status = {}
t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    futures = [pool.submit(check, ip) for ip in ips]
    for done, fut in enumerate(as_completed(futures), start=1):
        ip, state = fut.result()
        status[ip] = state
        if done % 10 == 0:
            print(f"{done:2d}/{len(ips)} done after {time.perf_counter() - t0:.0f}s")
down = sorted((ip for ip, s in status.items() if s == "down"), key=ipaddress.ip_address)
print("down:", down)
print(f"{len(status)} results in {time.perf_counter() - t0:.0f}s")</pre>
<ul>
<li><code>enumerate(..., start=1)</code> finished futures ginta hai; yeh counter main thread mein rehta hai, isliye race-free hai.</li>
<li><code>sorted(..., key=ipaddress.ip_address)</code> addresses ko numerically sort karta hai. Plain strings sort karne se 10.99.1.7, 10.99.1.49 ke baad aata. (Yeh <b>py-ipaddr</b> module use karta hai.)</li>
</ul>
<pre class="out">AUTO01$ python3 progress.py
10/50 done after 1s
20/50 done after 2s
30/50 done after 3s
40/50 done after 4s
<span class="hl">50/50 done after 5s</span>
<span class="hl">down: ['10.99.1.7', '10.99.1.14', '10.99.1.21', '10.99.1.28', '10.99.1.35', '10.99.1.42', '10.99.1.49']</span>
50 results in 5s</pre>
<p>Pachaas ek-second ki jobs dus ki paanch waves mein chali: pachaas second ki jagah paanch second. Progress lines operator ko batati hain ki script zinda hai. Saat down addresses sahi numeric order mein listed hain.</p>

<div class="eg"><p><b>Worked example.</b> Subah ki check mein 300 switches hain. Workers <code>(ip, "up")</code> ya <code>(ip, "down")</code> return karte hain. Main thread <code>status</code> banata hai, "287 up, 13 down" aur 13 sorted addresses ki list print karta hai. Manager yeh do lines padhta hai; operator intezaar ke dauraan progress lines padhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Workers se print karna, jisse alag devices ki lines aapas mein mil jaati hain. Bahut jagah se global list mein append karke bhool jana ki finishing order random hai. Sirf successes report karna, jisse missing device dikhta nahi. IP strings ko alphabetically sort karna. Worker mein bare <code>except</code> use karna jisse asli bug "device down" jaisa dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pool.map</code> results input order mein deta hai, <code>as_completed</code> khatam hone ke order mein; IP ki key wali dictionary dono ko safe bana deti hai. Ping exit code 0 ka matlab reply aaya; non-zero ka matlab reply nahi, zaroori nahi ki device dead ho.</p></div>

<div class="scn"><h4>Do reports, do alag order</h4><p>Do engineers ne kal aur aaj ki device reports <code>diff</code> se compare ki aur saikdon changes dekhe, jabki sirf ek switch badla tha. Script rows ko khatam hone ke order mein print karti thi, jo har run mein alag hota hai. Rows ko dictionary mein rakhkar sorted IP order mein print karne se reports comparable ho gayi aur ek asli change saaf dikha.</p><p><b>Lesson:</b> pehle jama karo, phir sort karo, phir print karo.</p></div>

<div class="iv"><p class="q">"Bahut threads se results safely kaise jama karte ho?"</p><p>Main workers ko pure rakhta hoon: woh input lete hain aur record return karte hain, na print, na shared write. Main thread futures khatam hote hi records ko key se rakhta hai, phir ek baar sort karke print karta hai. Collection ko sirf ek thread chhuta hai, isliye lock nahi chahiye, aur failures rows ke roop mein record hote hain, khote nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ping sweep I/O-bound hai: pool mein <code>subprocess.run</code>; exit code 0 ka matlab reply.</li>
<li>Workers records return karte hain; main thread unhe key se rakhta hai aur report banata hai.</li>
<li>Failure rows ki keys success rows jaisi hon taaki baad ka code saral rahe.</li>
<li>Sthir order mein print karo; IPs ko <code>key=ipaddress.ip_address</code> se sort karo.</li>
<li>Progress main thread ke <code>as_completed</code> loop mein ginna.</li>
</ul></div>
`}};export{e as default};