var e={id:`collector-threads`,h:{en:`One inventory, many vendors: collector design, threads and retries`,hi:`Ek inventory, kai vendors: collector design, threads aur retries`},body:{en:`
<p><b>The idea of this chapter:</b> a script that talks to one device is a command. A script that talks to fifty devices of four vendors, every night, and tells you what failed, is a <b>collector</b>. The difference is design: data in files, small functions, one connection per thread, failures treated as results, and retries only where retrying makes sense.</p>

<h3>Analogy: a courier company</h3>
<p>The depot keeps the address list (the inventory). Each van takes its own route (one thread, one connection). If a house is closed (timeout) the van tries again later. If the customer says "wrong person" (bad password) the van does <i>not</i> keep ringing the bell: that would only upset the neighbours, or lock your account. At the end of the day the manager gets a report, and a red flag if any parcel was not delivered.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Thread pool with one connection per device and a retry loop">
<rect x="10" y="70" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="70" y="96" text-anchor="middle" class="svg-ink" font-size="12">inventory rows</text><text x="70" y="114" text-anchor="middle" class="svg-muted" font-size="10">R1 J1 E1 N1 DEAD1</text>
<rect x="180" y="10" width="170" height="38" rx="8" fill="#bae6fd"/><text x="265" y="34" text-anchor="middle" class="svg-ink" font-size="12">thread 1: connect R1</text>
<rect x="180" y="56" width="170" height="38" rx="8" fill="#bae6fd"/><text x="265" y="80" text-anchor="middle" class="svg-ink" font-size="12">thread 2: connect J1</text>
<rect x="180" y="102" width="170" height="38" rx="8" fill="#bae6fd"/><text x="265" y="126" text-anchor="middle" class="svg-ink" font-size="12">thread 3: connect E1, N1</text>
<rect x="180" y="148" width="170" height="38" rx="8" fill="#fde68a"/><text x="265" y="172" text-anchor="middle" class="svg-ink" font-size="12">thread 4: DEAD1, retry x3</text>
<rect x="420" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="485" y="96" text-anchor="middle" class="svg-ink" font-size="12">results list</text><text x="485" y="114" text-anchor="middle" class="svg-muted" font-size="10">ok / FAILED + reason</text>
<rect x="575" y="70" width="60" height="60" rx="8" fill="#fed7aa"/><text x="605" y="96" text-anchor="middle" class="svg-ink" font-size="11">alert</text><text x="605" y="114" text-anchor="middle" class="svg-muted" font-size="10">exit 1</text>
<line x1="130" y1="100" x2="180" y2="29" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="100" x2="180" y2="75" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="100" x2="180" y2="121" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="100" x2="180" y2="167" stroke="#64748b" stroke-width="1.5"/>
<line x1="350" y1="29" x2="420" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="350" y1="75" x2="420" y2="97" stroke="#64748b" stroke-width="1.5"/><line x1="350" y1="121" x2="420" y2="106" stroke="#64748b" stroke-width="1.5"/><line x1="350" y1="167" x2="420" y2="115" stroke="#64748b" stroke-width="1.5"/><line x1="550" y1="100" x2="575" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each worker owns its connection from login to logout. A failing device ends as a result row, not as a crash.</p></div>

<h3>Six design rules</h3>
<ol>
<li><b>Data, not code:</b> inventory file plus a command map per device_type.</li>
<li><b>Small functions:</b> <code>connect(row)</code>, one function per job (<code>backup</code>, <code>interface_rows</code>), a main that loops.</li>
<li><b>One connection per thread.</b> A Netmiko object holds one channel and one prompt state; never share it between threads.</li>
<li><b>Failures are results:</b> catch the specific exceptions, record device and reason, carry on.</li>
<li><b>Retry timeouts, not logins.</b> Back off between tries (2 s, 4 s...).</li>
<li><b>Report:</b> summary, alert file and exit code.</li>
</ol>

<h3>Lab 1, task 5: backup.py</h3>
<p>Each vendor shows its configuration with a different command; the map is the only vendor knowledge in the file.</p>
<pre class="code">SHOW = {
    "cisco_ios": "show running-config",
    "cisco_nxos": "show running-config",
    "arista_eos": "show running-config",
    "juniper_junos": "show configuration",
}


def backup(row, conn, folder):
    text = conn.send_command(SHOW[row["device_type"]])
    path = f"{folder}/{row['name']}.cfg"
    with open(path, "w") as f:
        f.write(text + "\\n")
    return path, len(text.splitlines())


if __name__ == "__main__":
    folder = f"backups/{date.today().isoformat()}"
    os.makedirs(folder, exist_ok=True)
    for dev in load_inventory():
        with connect(dev) as conn:
            path, n = backup(dev, conn, folder)
        print(f"saved {dev['name']:&lt;3} ({dev['device_type']}) {n} lines -&gt; {path}")</pre>
<pre class="out">AUTO01$ python3 backup.py
saved R1  (cisco_ios) 55 lines -&gt; backups/2026-09-29/R1.cfg
<span class="hl">saved J1  (juniper_junos) 27 lines -&gt; backups/2026-09-29/J1.cfg</span>
saved E1  (arista_eos) 18 lines -&gt; backups/2026-09-29/E1.cfg
saved N1  (cisco_nxos) 47 lines -&gt; backups/2026-09-29/N1.cfg</pre>
<p>The folder name is the date (<code>2026-09-29</code> sorts correctly as text), and the <code>if __name__ == "__main__"</code> guard lets other scripts <code>import backup</code> without running it. The answer to the lab question is the highlighted 27.</p>

<h3>Why threads help: virtual time</h3>
<pre class="out">AUTO01$ python3 ch7.py
('R1', 'PUN-CORE-R1#')
('J1', 'netops@J1&gt;')
('E1', 'E1#')
('N1', 'N1#')
('DEAD1', 'TIMEOUT')
<span class="hl">sequential: 15.5s</span>
('R1', 'PUN-CORE-R1#')
('J1', 'netops@J1&gt;')
('E1', 'E1#')
('N1', 'N1#')
('DEAD1', 'TIMEOUT')
<span class="hl">threads:    5.0s</span></pre>
<p>The five devices are the same, one is dead. Sequentially every wait adds up; in a pool the waits overlap and the total is the slowest device (here the 5-second <code>conn_timeout</code> of the dead one). The same arithmetic holds on real gear, where the wait is real.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab runs threads one after the other on a virtual clock, so the times above are simulated; results, ordering and the one-connection-per-thread rule are exactly as in real Python. Do not read lab timings as measurements.</p></div>

<h3>Size the pool: the vty limit</h3>
<pre class="out">AUTO01$ python3 ch7c.py

A paramiko SSHException occurred during connection creation:

Error reading SSH protocol banner</pre>
<p>This was the <b>sixth</b> simultaneous session to an IOS router with <code>line vty 0 4</code> (five lines). Real devices end up doing the same: the extra login fails in a confusing way. Junos has <code>system services ssh connection-limit</code>. So never open more sessions to <i>one device</i> than it allows; one thread per device (as in the pool above) is the natural limit, and <code>max_workers</code> bounds the load on your own server and on AAA.</p>

<h3>Lab 1, task 6: threads, retries, alert</h3>
<pre class="code">def job(dev):
    name = dev["name"]
    for attempt in range(1, TRIES + 1):
        try:
            with connect(dev) as conn:
                path, n = backup(dev, conn, folder)
            return name, "ok", f"{n} lines"
        except NetmikoAuthenticationException:
            return name, "FAILED", "authentication failed (not retried)"
        except NetmikoTimeoutException:
            print(f"{name}: attempt {attempt}/{TRIES} timed out")
            time.sleep(2 * attempt)
    return name, "FAILED", f"unreachable after {TRIES} attempts"


with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(job, load_inventory()))</pre>
<pre class="out">AUTO01$ python3 run_all.py; echo "exit code: $?"
DEAD1: attempt 1/3 timed out
DEAD1: attempt 2/3 timed out
DEAD1: attempt 3/3 timed out
R1     ok      55 lines
J1     ok      27 lines
E1     ok      18 lines
N1     ok      47 lines
<span class="hl">DEAD1  FAILED  unreachable after 3 attempts</span>
ALERT: 1 device(s) failed, see alerts.txt
exit code: 1</pre>
<p>The rest of <code>run_all.py</code> writes <code>alerts.txt</code> and calls <code>sys.exit(1)</code> when the failed list is not empty. <code>pool.map</code> returns results in inventory order, even though devices finish at different times. The exit code 1 is the answer the lab asks for; cron wrappers and monitoring read it.</p>

<div class="warn"><p><b>Common mistakes.</b> Sharing one connection between threads. Retrying <code>NetmikoAuthenticationException</code> (a wrong password retried three times can lock a shared account). Retrying a config push blindly: a push that half-worked may not be safe to repeat, so retry only idempotent reads. A bare <code>except Exception</code> that hides your own bugs. <code>max_workers</code> larger than the devices or the vty lines allow.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pool.map</code> keeps input order; <code>as_completed</code> gives completion order. Threads suit netmiko because the time is spent waiting for the network, not computing.</p></div>

<div class="scn"><h4>The account that locked at 02:00</h4><p>A collector retried every failure five times. When the TACACS password rotated, 200 devices times five wrong logins locked the shared service account within seconds, and the NOC lost CLI access to the whole estate until it was unlocked.</p><p><b>Lesson:</b> never retry authentication failures; fail once, alert once, and let a human fix the secret.</p></div>

<div class="iv"><p class="q">"How do you make a network collector reliable?"</p><p>Inventory-driven loop, one connection per worker thread, specific exception handling, retries with back-off for timeouts only, a result row for every device, a log and an alert for failures, and a non-zero exit code. I test with a deliberately dead device so the failure path is exercised before it matters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Put vendor knowledge in dictionaries; keep the loop vendor-blind.</li>
<li>One connection per thread, closed with <code>with</code>.</li>
<li>Retry timeouts with back-off; never retry logins; never blindly retry config pushes.</li>
<li>A dead device becomes a result row plus an alert, and the exit code becomes 1.</li>
<li>Do not exceed the vty or connection limit of any single device.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo script ek device se baat karti hai woh command hai. Jo script chaar vendors ke pachaas devices se har raat baat kare aur bataye ki kya fail hua, woh <b>collector</b> hai. Farq design ka hai: data files mein, chhote functions, har thread ka ek connection, failures ko results maanna, aur retries sirf wahan jahan retry karna samajhdari hai.</p>

<h3>Analogy: courier company</h3>
<p>Depot address list rakhta hai (inventory). Har van apna route leti hai (ek thread, ek connection). Ghar band ho (timeout) to van baad mein dobara koshish karti hai. Customer bole "galat insaan" (galat password) to van bell bajati <i>nahi</i> rehti: isse padosi pareshaan hote hain, ya aapka account lock ho jaata hai. Din ke ant mein manager ko report milti hai, aur koi parcel deliver na hua ho to laal jhanda.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Thread pool with one connection per device and a retry loop">
<rect x="10" y="70" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="70" y="96" text-anchor="middle" class="svg-ink" font-size="12">inventory rows</text><text x="70" y="114" text-anchor="middle" class="svg-muted" font-size="10">R1 J1 E1 N1 DEAD1</text>
<rect x="180" y="10" width="170" height="38" rx="8" fill="#bae6fd"/><text x="265" y="34" text-anchor="middle" class="svg-ink" font-size="12">thread 1: connect R1</text>
<rect x="180" y="56" width="170" height="38" rx="8" fill="#bae6fd"/><text x="265" y="80" text-anchor="middle" class="svg-ink" font-size="12">thread 2: connect J1</text>
<rect x="180" y="102" width="170" height="38" rx="8" fill="#bae6fd"/><text x="265" y="126" text-anchor="middle" class="svg-ink" font-size="12">thread 3: connect E1, N1</text>
<rect x="180" y="148" width="170" height="38" rx="8" fill="#fde68a"/><text x="265" y="172" text-anchor="middle" class="svg-ink" font-size="12">thread 4: DEAD1, retry x3</text>
<rect x="420" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="485" y="96" text-anchor="middle" class="svg-ink" font-size="12">results list</text><text x="485" y="114" text-anchor="middle" class="svg-muted" font-size="10">ok / FAILED + wajah</text>
<rect x="575" y="70" width="60" height="60" rx="8" fill="#fed7aa"/><text x="605" y="96" text-anchor="middle" class="svg-ink" font-size="11">alert</text><text x="605" y="114" text-anchor="middle" class="svg-muted" font-size="10">exit 1</text>
<line x1="130" y1="100" x2="180" y2="29" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="100" x2="180" y2="75" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="100" x2="180" y2="121" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="100" x2="180" y2="167" stroke="#64748b" stroke-width="1.5"/>
<line x1="350" y1="29" x2="420" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="350" y1="75" x2="420" y2="97" stroke="#64748b" stroke-width="1.5"/><line x1="350" y1="121" x2="420" y2="106" stroke="#64748b" stroke-width="1.5"/><line x1="350" y1="167" x2="420" y2="115" stroke="#64748b" stroke-width="1.5"/><line x1="550" y1="100" x2="575" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har worker apne connection ka login se logout tak maalik hai. Fail hone wala device result row banta hai, crash nahi.</p></div>

<h3>Chhe design rules</h3>
<ol>
<li><b>Data, code nahi:</b> inventory file aur har device_type ka command map.</li>
<li><b>Chhote functions:</b> <code>connect(row)</code>, har kaam ka ek function (<code>backup</code>, <code>interface_rows</code>), aur loop chalane wala main.</li>
<li><b>Har thread ka ek connection.</b> Netmiko object ek channel aur ek prompt state rakhta hai; use threads ke beech kabhi share mat karo.</li>
<li><b>Failures results hain:</b> specific exceptions pakdo, device aur wajah record karo, aage badho.</li>
<li><b>Timeouts retry karo, logins nahi.</b> Koshishon ke beech back off karo (2 s, 4 s...).</li>
<li><b>Report:</b> summary, alert file aur exit code.</li>
</ol>

<h3>Lab 1, task 5: backup.py</h3>
<p>Har vendor apni configuration alag command se dikhata hai; map hi file mein akela vendor-knowledge hai.</p>
<pre class="code">SHOW = {
    "cisco_ios": "show running-config",
    "cisco_nxos": "show running-config",
    "arista_eos": "show running-config",
    "juniper_junos": "show configuration",
}


def backup(row, conn, folder):
    text = conn.send_command(SHOW[row["device_type"]])
    path = f"{folder}/{row['name']}.cfg"
    with open(path, "w") as f:
        f.write(text + "\\n")
    return path, len(text.splitlines())


if __name__ == "__main__":
    folder = f"backups/{date.today().isoformat()}"
    os.makedirs(folder, exist_ok=True)
    for dev in load_inventory():
        with connect(dev) as conn:
            path, n = backup(dev, conn, folder)
        print(f"saved {dev['name']:&lt;3} ({dev['device_type']}) {n} lines -&gt; {path}")</pre>
<pre class="out">AUTO01$ python3 backup.py
saved R1  (cisco_ios) 55 lines -&gt; backups/2026-09-29/R1.cfg
<span class="hl">saved J1  (juniper_junos) 27 lines -&gt; backups/2026-09-29/J1.cfg</span>
saved E1  (arista_eos) 18 lines -&gt; backups/2026-09-29/E1.cfg
saved N1  (cisco_nxos) 47 lines -&gt; backups/2026-09-29/N1.cfg</pre>
<p>Folder ka naam date hai (<code>2026-09-29</code> text ki tarah bhi sahi sort hoti hai), aur <code>if __name__ == "__main__"</code> guard doosri scripts ko <code>import backup</code> karne deta hai bina use chalaye. Lab sawaal ka jawab highlight wala 27 hai.</p>

<h3>Threads kyun madad karte hain: virtual time</h3>
<pre class="out">AUTO01$ python3 ch7.py
('R1', 'PUN-CORE-R1#')
('J1', 'netops@J1&gt;')
('E1', 'E1#')
('N1', 'N1#')
('DEAD1', 'TIMEOUT')
<span class="hl">sequential: 15.5s</span>
('R1', 'PUN-CORE-R1#')
('J1', 'netops@J1&gt;')
('E1', 'E1#')
('N1', 'N1#')
('DEAD1', 'TIMEOUT')
<span class="hl">threads:    5.0s</span></pre>
<p>Paanch device wahi hain, ek mara hua hai. Sequential mein har intezaar jud jaata hai; pool mein intezaar overlap hote hain aur total sabse dheema device hota hai (yahan mare hue device ka 5 second ka <code>conn_timeout</code>). Wahi ganit asli gear par bhi chalta hai, jahan intezaar asli hota hai.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab threads ko virtual clock par ek ke baad ek chalata hai, isliye upar ke times simulated hain; results, ordering aur har thread ka ek connection wale niyam bilkul asli Python jaise hain. Lab ke timings ko measurement mat samjho.</p></div>

<h3>Pool ka size: vty limit</h3>
<pre class="out">AUTO01$ python3 ch7c.py

A paramiko SSHException occurred during connection creation:

Error reading SSH protocol banner</pre>
<p>Yeh <code>line vty 0 4</code> (paanch lines) wale IOS router par <b>chhathva</b> simultaneous session tha. Asli devices bhi aisa hi karte hain: extra login ulajhane wale tareeke se fail hota hai. Junos mein <code>system services ssh connection-limit</code> hai. Isliye <i>ek device</i> par kabhi uski limit se zyada sessions mat kholo; ek device ke liye ek thread (jaise upar ke pool mein) swabhavik limit hai, aur <code>max_workers</code> aapke apne server aur AAA ka load bound karta hai.</p>

<h3>Lab 1, task 6: threads, retries, alert</h3>
<pre class="code">def job(dev):
    name = dev["name"]
    for attempt in range(1, TRIES + 1):
        try:
            with connect(dev) as conn:
                path, n = backup(dev, conn, folder)
            return name, "ok", f"{n} lines"
        except NetmikoAuthenticationException:
            return name, "FAILED", "authentication failed (not retried)"
        except NetmikoTimeoutException:
            print(f"{name}: attempt {attempt}/{TRIES} timed out")
            time.sleep(2 * attempt)
    return name, "FAILED", f"unreachable after {TRIES} attempts"


with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(job, load_inventory()))</pre>
<pre class="out">AUTO01$ python3 run_all.py; echo "exit code: $?"
DEAD1: attempt 1/3 timed out
DEAD1: attempt 2/3 timed out
DEAD1: attempt 3/3 timed out
R1     ok      55 lines
J1     ok      27 lines
E1     ok      18 lines
N1     ok      47 lines
<span class="hl">DEAD1  FAILED  unreachable after 3 attempts</span>
ALERT: 1 device(s) failed, see alerts.txt
exit code: 1</pre>
<p><code>run_all.py</code> ka baaki hissa <code>alerts.txt</code> likhta hai aur failed list khaali na ho to <code>sys.exit(1)</code> bulata hai. <code>pool.map</code> results inventory ke order mein lautata hai, chahe devices alag waqt par khatam hon. Exit code 1 woh jawab hai jo lab maangta hai; cron wrappers aur monitoring use padhte hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Ek connection ko threads mein share karna. <code>NetmikoAuthenticationException</code> retry karna (galat password teen baar retry karne se shared account lock ho sakta hai). Config push ko andhadhundh retry karna: aadha chala push dobara chalana safe nahi ho sakta, isliye sirf idempotent reads retry karo. Bare <code>except Exception</code> jo aapke apne bugs chhupa de. <code>max_workers</code> devices ya vty lines se zyada rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pool.map</code> input order rakhta hai; <code>as_completed</code> completion order deta hai. Threads netmiko ke liye isliye theek hain ki samay network ke intezaar mein jaata hai, computation mein nahi.</p></div>

<div class="scn"><h4>Account jo 02:00 baje lock ho gaya</h4><p>Ek collector har failure paanch baar retry karta tha. TACACS password rotate hua to 200 devices ke paanch-paanch galat logins ne seconds mein shared service account lock kar diya, aur NOC ka poore estate par CLI access tab tak gaya jab tak account unlock nahi hua.</p><p><b>Lesson:</b> authentication failures kabhi retry mat karo; ek baar fail, ek baar alert, aur secret insaan theek kare.</p></div>

<div class="iv"><p class="q">"Network collector ko reliable kaise banate ho?"</p><p>Inventory-driven loop, har worker thread ka ek connection, specific exception handling, sirf timeouts ke liye back-off ke saath retries, har device ki ek result row, failures ke liye log aur alert, aur non-zero exit code. Main jaanbujhkar mare hue device se test karta hoon taaki failure path pehle hi exercise ho jaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Vendor knowledge dictionaries mein rakho; loop ko vendor-blind rakho.</li>
<li>Har thread ka ek connection, <code>with</code> se band.</li>
<li>Timeouts back-off ke saath retry karo; logins kabhi nahi; config push andhadhundh nahi.</li>
<li>Mara hua device ek result row aur alert banta hai, aur exit code 1 hota hai.</li>
<li>Kisi bhi ek device ki vty ya connection limit paar mat karo.</li>
</ul></div>
`}};export{e as default};