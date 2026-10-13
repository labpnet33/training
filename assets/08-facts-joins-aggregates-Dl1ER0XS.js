var e={id:`facts-joins-aggregates`,h:{en:`Facts, joins and aggregates: record router facts and find the gaps`,hi:`Facts, joins aur aggregates: router facts record karo aur gaps dhoondho`},body:{en:`
<p><b>The idea of this chapter:</b> an inventory says what <i>should</i> exist. Facts say what you actually <i>found</i>. Keeping them in two tables and comparing them is the heart of network auditing. This chapter finishes Lab 1, tasks 4 and 5: create <code>facts</code>, run <code>facts.py</code>, then use a join to find the devices that still have no facts.</p>

<h3>Analogy: two cabinets and a link card</h3>
<p>One cabinet holds a card per device (the plan). Another holds a card per inspection (what the inspector found). Each inspection card carries the device name, which is a link back to the first cabinet. A <b>join</b> lays the matching cards side by side. An <b>aggregate</b> (count, sum, max) squeezes many cards into one number.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="devices linked to facts by name, and to interfaces by device">
<rect x="20" y="40" width="160" height="80" rx="10" fill="#bae6fd"/><text x="100" y="64" text-anchor="middle" class="svg-ink" font-size="13">devices</text><text x="100" y="84" text-anchor="middle" class="svg-muted" font-size="10">name (PK), ip, role, site</text><text x="100" y="102" text-anchor="middle" class="svg-muted" font-size="10">the plan</text>
<rect x="400" y="10" width="220" height="60" rx="10" fill="#bbf7d0"/><text x="510" y="34" text-anchor="middle" class="svg-ink" font-size="13">facts</text><text x="510" y="54" text-anchor="middle" class="svg-muted" font-size="10">device, up_count, taken_at</text>
<rect x="400" y="90" width="220" height="60" rx="10" fill="#fde68a"/><text x="510" y="114" text-anchor="middle" class="svg-ink" font-size="13">interfaces</text><text x="510" y="134" text-anchor="middle" class="svg-muted" font-size="10">device, ifname, status</text>
<line x1="180" y1="70" x2="400" y2="40" stroke="#64748b" stroke-width="2"/><line x1="180" y1="90" x2="400" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="290" y="46" text-anchor="middle" class="svg-accent" font-size="11">one fact row</text><text x="290" y="116" text-anchor="middle" class="svg-accent" font-size="11">many interface rows</text>
</svg><p class="cap">Tables are linked by a shared device name.</p></div>

<h3>Lab 1, task 4: create facts and run facts.py</h3>
<p><code>facts.py</code> connects to every core and edge router over SSH with the lab library <code>nkmiko</code>, counts the interfaces that are up and up, and stores the result.</p>
<pre class="code">import sqlite3
from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

db = sqlite3.connect("inventory.db")
routers = db.execute("SELECT name, ip FROM devices WHERE role IN ('core', 'edge') ORDER BY name").fetchall()
for name, ip in routers:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
        out = conn.send_command("show ip interface brief")
        conn.disconnect()
    except (NetmikoTimeoutException, NetmikoAuthenticationException) as err:
        print(f"{name}: {type(err).__name__}")
        continue
    up = sum(1 for line in out.splitlines()[1:] if line.split()[-2:] == ["up", "up"])
    db.execute("INSERT OR REPLACE INTO facts (device, up_count, taken_at) VALUES (?, ?, datetime('now'))", (name, up))
    print(f"{name}: {up} interface(s) up")
db.commit()
db.close()</pre>
<ul>
<li>One <code>SELECT ... WHERE role IN ('core', 'edge')</code> picks the routers from the database. The inventory drives the script; nothing is typed by hand.</li>
<li>A dead router raises a timeout. The <code>except</code> prints the exception name and <code>continue</code> moves to the next router, so one failure does not stop the run.</li>
<li>The <code>up</code> line counts lines of the <code>show</code> output whose last two words are <code>up up</code>.</li>
<li><code>datetime('now')</code> is an SQL function that stamps the row with the current UTC time, as text like <code>2026-10-10 21:26:29</code>.</li>
<li><code>INSERT OR REPLACE</code> keeps one row per device: the newest. One <code>commit()</code> after the loop saves all rows together.</li>
</ul>
<p>The table must exist first. Without it, the first success fails with <code>sqlite3.OperationalError: no such table: facts</code>. Create it from the shell, run the script and look inside:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "CREATE TABLE facts (device TEXT PRIMARY KEY, up_count INTEGER, taken_at TEXT)"
AUTO01$ python3 facts.py
BLR-EDGE-R2: 1 interface(s) up
<span class="hl">HYD-EDGE-R3: NetmikoTimeoutException</span>
PUN-CORE-R1: 1 interface(s) up
AUTO01$ sqlite3 -header -column inventory.db "SELECT * FROM facts"
device       up_count  taken_at
-----------  --------  -------------------
BLR-EDGE-R2  1         2026-10-10 21:26:29
PUN-CORE-R1  1         2026-10-10 21:26:40</pre>
<p>R3 is down, so it timed out and has no facts row. The timestamps in your lab will show your own clock. The answer to the lab question is <b>NetmikoTimeoutException</b>.</p>

<h3>Lab 1, task 5: which devices have no facts?</h3>
<p>An <b>INNER JOIN</b> keeps only rows that have a partner on both sides. A <b>LEFT JOIN</b> keeps every row from the left table and fills the right side with NULL when there is no partner. Filter on that NULL and you have the gaps.</p>
<pre class="out">AUTO01$ sqlite3 -header -column inventory.db "SELECT d.name, d.role FROM devices d LEFT JOIN facts f ON f.device = d.name WHERE f.device IS NULL ORDER BY d.name"
name         role
-----------  --------
HYD-EDGE-R3  edge
PUN-ACC-SW1  access
PUN-ACC-SW2  access
<span class="hl">PUN-FW1      firewall</span></pre>
<ul>
<li><code>devices d</code> gives the table a short alias <code>d</code>; <code>facts f</code> gives <code>f</code>.</li>
<li><code>ON f.device = d.name</code> says how rows match.</li>
<li><code>WHERE f.device IS NULL</code> keeps only devices with no matching fact. The answer is <b>4</b>: the dead router and the three devices the script never contacts.</li>
</ul>
<p>Stale facts are found the same way with a time test, because the timestamp text sorts correctly:</p>
<pre class="out">AUTO01$ python3 times2.py
stale: [('BLR-EDGE-R2',)]
fresh: [('PUN-CORE-R1',)]</pre>
<p>(That script stored R1 with <code>datetime('now')</code> and R2 with <code>datetime('now', '-3 days')</code>, then compared with <code>datetime('now', '-1 day')</code>.)</p>

<h3>Aggregates and GROUP BY with interfaces</h3>
<p>Many rows per device calls for grouping. Assume an <code>interfaces</code> table (<code>device</code>, <code>ifname</code>, <code>status</code>, primary key on the first two) holding nine ports (the queries are run with the <code>show()</code> helper from chapter 5):</p>
<pre class="code">conn.execute("CREATE TABLE IF NOT EXISTS interfaces (device TEXT, ifname TEXT, status TEXT, PRIMARY KEY (device, ifname))")
rows = [
    ("PUN-CORE-R1", "Gi0/0", "up"), ("PUN-CORE-R1", "Gi0/1", "up"), ("PUN-CORE-R1", "Gi0/2", "down"),
    ("BLR-EDGE-R2", "Gi0/0", "up"), ("BLR-EDGE-R2", "Gi0/1", "down"),
    ("PUN-ACC-SW1", "Gi0/1", "up"), ("PUN-ACC-SW1", "Gi0/2", "up"),
    ("PUN-ACC-SW1", "Gi0/3", "up"), ("PUN-ACC-SW1", "Gi0/4", "down"),
]
conn.executemany("INSERT OR REPLACE INTO interfaces VALUES (?, ?, ?)", rows)</pre>
<pre class="out">AUTO01$ python3 join2.py
-- inner join
('BLR-EDGE-R2', 'Bengaluru', 'Gi0/1', 'down')
('PUN-ACC-SW1', 'Pune', 'Gi0/4', 'down')
('PUN-CORE-R1', 'Pune', 'Gi0/2', 'down')
-- up and down per device
('BLR-EDGE-R2', 1, 1)
('PUN-ACC-SW1', 3, 1)
('PUN-CORE-R1', 2, 1)
-- having
('PUN-ACC-SW1', 4)
('PUN-CORE-R1', 3)
-- per site
('Bengaluru', 2)
('Pune', 7)</pre>
<pre class="code">SELECT d.name, d.site, i.ifname, i.status
FROM devices d JOIN interfaces i ON i.device = d.name
WHERE i.status = 'down' ORDER BY d.name, i.ifname

SELECT device, sum(status = 'up') AS up, sum(status = 'down') AS down
FROM interfaces GROUP BY device ORDER BY device

SELECT device, count(*) AS total FROM interfaces
GROUP BY device HAVING count(*) &gt;= 3 ORDER BY device

SELECT d.site, count(*) AS ports
FROM devices d JOIN interfaces i ON i.device = d.name
GROUP BY d.site ORDER BY d.site</pre>
<ul>
<li><code>GROUP BY device</code> makes one result row per device; each aggregate works inside its group. <code>sum(status = 'up')</code> adds 1 for every true comparison, an easy way to count conditions.</li>
<li><code>WHERE</code> filters <i>rows</i> before grouping. <code>HAVING</code> filters <i>groups</i> after counting. Devices with fewer than three ports disappear from the third result.</li>
<li>Other aggregates: <code>min</code>, <code>max</code>, <code>avg</code>, <code>sum</code>. Every selected column must be in <code>GROUP BY</code> or inside an aggregate.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the <code>ON</code> condition, which pairs every row with every row. Filtering a LEFT JOIN's right table in <code>WHERE</code> with a normal test, which silently turns it into an INNER JOIN. Using <code>WHERE count(*) &gt; 1</code> instead of <code>HAVING</code>. Running <code>facts.py</code> before creating <code>facts</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> LEFT JOIN plus <code>IS NULL</code> on the right table's key finds "left rows with no match". INNER JOIN drops them. <code>WHERE</code> cannot use aggregates; <code>HAVING</code> can.</p></div>

<div class="scn"><h4>Forty switches nobody polled</h4><p>A weekly audit compared the inventory with the polling results. A LEFT JOIN with <code>IS NULL</code> listed 40 switches that were in the inventory but never polled. All 40 were on a management VLAN the polling script could not reach, a fact nobody had noticed for months.</p><p><b>Lesson:</b> the interesting rows are often the ones that did not match.</p></div>

<div class="iv"><p class="q">"Write a query for devices that have never reported facts, and explain it."</p><p><code>SELECT d.name FROM devices d LEFT JOIN facts f ON f.device = d.name WHERE f.device IS NULL</code>. The LEFT JOIN keeps every device, the right side is NULL where no fact exists, and the WHERE keeps exactly those rows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory is the plan; facts are what was found. Compare them with a join.</li>
<li>INNER JOIN keeps matches; LEFT JOIN keeps all left rows; <code>IS NULL</code> finds the gaps.</li>
<li><code>GROUP BY</code> with <code>count</code>, <code>sum</code>, <code>max</code> summarises many rows.</li>
<li><code>WHERE</code> filters rows, <code>HAVING</code> filters groups.</li>
<li><code>datetime('now')</code> stamps rows; text timestamps compare correctly.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> inventory batati hai ki kya <i>hona chahiye</i>. Facts batate hain ki asal mein kya <i>mila</i>. Dono ko do tables mein rakhna aur compare karna network auditing ka dil hai. Yeh chapter Lab 1 ke task 4 aur 5 poore karta hai: <code>facts</code> banao, <code>facts.py</code> chalao, phir join se woh devices dhoondho jinke abhi facts nahi hain.</p>

<h3>Analogy: do cabinets aur ek link card</h3>
<p>Ek cabinet mein har device ka card hai (plan). Doosre cabinet mein har inspection ka card hai (inspector ne kya paya). Har inspection card par device ka naam hai, jo pehle cabinet ki taraf link hai. <b>Join</b> milte-julte cards ko saath-saath rakhta hai. <b>Aggregate</b> (count, sum, max) kai cards ko ek number mein nichod deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="devices facts se naam ke zariye aur interfaces se device ke zariye judi hai">
<rect x="20" y="40" width="160" height="80" rx="10" fill="#bae6fd"/><text x="100" y="64" text-anchor="middle" class="svg-ink" font-size="13">devices</text><text x="100" y="84" text-anchor="middle" class="svg-muted" font-size="10">name (PK), ip, role, site</text><text x="100" y="102" text-anchor="middle" class="svg-muted" font-size="10">plan</text>
<rect x="400" y="10" width="220" height="60" rx="10" fill="#bbf7d0"/><text x="510" y="34" text-anchor="middle" class="svg-ink" font-size="13">facts</text><text x="510" y="54" text-anchor="middle" class="svg-muted" font-size="10">device, up_count, taken_at</text>
<rect x="400" y="90" width="220" height="60" rx="10" fill="#fde68a"/><text x="510" y="114" text-anchor="middle" class="svg-ink" font-size="13">interfaces</text><text x="510" y="134" text-anchor="middle" class="svg-muted" font-size="10">device, ifname, status</text>
<line x1="180" y1="70" x2="400" y2="40" stroke="#64748b" stroke-width="2"/><line x1="180" y1="90" x2="400" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="290" y="46" text-anchor="middle" class="svg-accent" font-size="11">ek fact row</text><text x="290" y="116" text-anchor="middle" class="svg-accent" font-size="11">kai interface rows</text>
</svg><p class="cap">Tables ek saajha device naam se judi hain.</p></div>

<h3>Lab 1, task 4: facts banao aur facts.py chalao</h3>
<p><code>facts.py</code> lab library <code>nkmiko</code> se har core aur edge router se SSH par connect hoti hai, jo interfaces up aur up hain unhe ginti hai, aur result store karti hai.</p>
<pre class="code">import sqlite3
from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

db = sqlite3.connect("inventory.db")
routers = db.execute("SELECT name, ip FROM devices WHERE role IN ('core', 'edge') ORDER BY name").fetchall()
for name, ip in routers:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
        out = conn.send_command("show ip interface brief")
        conn.disconnect()
    except (NetmikoTimeoutException, NetmikoAuthenticationException) as err:
        print(f"{name}: {type(err).__name__}")
        continue
    up = sum(1 for line in out.splitlines()[1:] if line.split()[-2:] == ["up", "up"])
    db.execute("INSERT OR REPLACE INTO facts (device, up_count, taken_at) VALUES (?, ?, datetime('now'))", (name, up))
    print(f"{name}: {up} interface(s) up")
db.commit()
db.close()</pre>
<ul>
<li>Ek <code>SELECT ... WHERE role IN ('core', 'edge')</code> database se routers chunta hai. Inventory script ko chalati hai; haath se kuch type nahi hota.</li>
<li>Mara hua router timeout deta hai. <code>except</code> exception ka naam print karta hai aur <code>continue</code> agle router par jaata hai, isliye ek failure poora run nahi rokta.</li>
<li><code>up</code> line <code>show</code> output ki un lines ko ginti hai jinke aakhri do shabd <code>up up</code> hain.</li>
<li><code>datetime('now')</code> ek SQL function hai jo row par abhi ka UTC time text ki tarah lagata hai, jaise <code>2026-10-10 21:26:29</code>.</li>
<li><code>INSERT OR REPLACE</code> har device ki ek row rakhta hai: sabse nayi. Loop ke baad ek <code>commit()</code> saari rows ek saath save karta hai.</li>
</ul>
<p>Table pehle maujood honi chahiye. Iske bina pehli safalta par <code>sqlite3.OperationalError: no such table: facts</code> aata hai. Shell se banao, script chalao aur andar dekho:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "CREATE TABLE facts (device TEXT PRIMARY KEY, up_count INTEGER, taken_at TEXT)"
AUTO01$ python3 facts.py
BLR-EDGE-R2: 1 interface(s) up
<span class="hl">HYD-EDGE-R3: NetmikoTimeoutException</span>
PUN-CORE-R1: 1 interface(s) up
AUTO01$ sqlite3 -header -column inventory.db "SELECT * FROM facts"
device       up_count  taken_at
-----------  --------  -------------------
BLR-EDGE-R2  1         2026-10-10 21:26:29
PUN-CORE-R1  1         2026-10-10 21:26:40</pre>
<p>R3 down hai, isliye timeout hua aur uski facts row nahi hai. Aapke lab mein timestamps aapki apni clock ke honge. Lab sawaal ka jawab <b>NetmikoTimeoutException</b> hai.</p>

<h3>Lab 1, task 5: kin devices ke facts nahi hain?</h3>
<p><b>INNER JOIN</b> sirf woh rows rakhta hai jinke dono taraf partner hain. <b>LEFT JOIN</b> left table ki har row rakhta hai aur partner na ho to right side NULL se bharta hai. Us NULL par filter lagao to gaps mil jaate hain.</p>
<pre class="out">AUTO01$ sqlite3 -header -column inventory.db "SELECT d.name, d.role FROM devices d LEFT JOIN facts f ON f.device = d.name WHERE f.device IS NULL ORDER BY d.name"
name         role
-----------  --------
HYD-EDGE-R3  edge
PUN-ACC-SW1  access
PUN-ACC-SW2  access
<span class="hl">PUN-FW1      firewall</span></pre>
<ul>
<li><code>devices d</code> table ko chhota alias <code>d</code> deta hai; <code>facts f</code> <code>f</code> deta hai.</li>
<li><code>ON f.device = d.name</code> batata hai rows kaise match hongi.</li>
<li><code>WHERE f.device IS NULL</code> sirf woh devices rakhta hai jinka koi matching fact nahi. Jawab <b>4</b> hai: mara hua router aur teen devices jinse script kabhi contact nahi karti.</li>
</ul>
<p>Stale facts bhi isi tarah time test se milte hain, kyunki timestamp text sahi sort hota hai:</p>
<pre class="out">AUTO01$ python3 times2.py
stale: [('BLR-EDGE-R2',)]
fresh: [('PUN-CORE-R1',)]</pre>
<p>(Us script ne R1 ko <code>datetime('now')</code> aur R2 ko <code>datetime('now', '-3 days')</code> ke saath store kiya, phir <code>datetime('now', '-1 day')</code> se compare kiya.)</p>

<h3>Interfaces ke saath aggregates aur GROUP BY</h3>
<p>Ek device ki kai rows ho to grouping chahiye. Maan lo ek <code>interfaces</code> table hai (<code>device</code>, <code>ifname</code>, <code>status</code>, pehle do par primary key) jisme nau ports hain (queries chapter 5 ke <code>show()</code> helper se chalayi gayi hain):</p>
<pre class="code">conn.execute("CREATE TABLE IF NOT EXISTS interfaces (device TEXT, ifname TEXT, status TEXT, PRIMARY KEY (device, ifname))")
rows = [
    ("PUN-CORE-R1", "Gi0/0", "up"), ("PUN-CORE-R1", "Gi0/1", "up"), ("PUN-CORE-R1", "Gi0/2", "down"),
    ("BLR-EDGE-R2", "Gi0/0", "up"), ("BLR-EDGE-R2", "Gi0/1", "down"),
    ("PUN-ACC-SW1", "Gi0/1", "up"), ("PUN-ACC-SW1", "Gi0/2", "up"),
    ("PUN-ACC-SW1", "Gi0/3", "up"), ("PUN-ACC-SW1", "Gi0/4", "down"),
]
conn.executemany("INSERT OR REPLACE INTO interfaces VALUES (?, ?, ?)", rows)</pre>
<pre class="out">AUTO01$ python3 join2.py
-- inner join
('BLR-EDGE-R2', 'Bengaluru', 'Gi0/1', 'down')
('PUN-ACC-SW1', 'Pune', 'Gi0/4', 'down')
('PUN-CORE-R1', 'Pune', 'Gi0/2', 'down')
-- up and down per device
('BLR-EDGE-R2', 1, 1)
('PUN-ACC-SW1', 3, 1)
('PUN-CORE-R1', 2, 1)
-- having
('PUN-ACC-SW1', 4)
('PUN-CORE-R1', 3)
-- per site
('Bengaluru', 2)
('Pune', 7)</pre>
<pre class="code">SELECT d.name, d.site, i.ifname, i.status
FROM devices d JOIN interfaces i ON i.device = d.name
WHERE i.status = 'down' ORDER BY d.name, i.ifname

SELECT device, sum(status = 'up') AS up, sum(status = 'down') AS down
FROM interfaces GROUP BY device ORDER BY device

SELECT device, count(*) AS total FROM interfaces
GROUP BY device HAVING count(*) &gt;= 3 ORDER BY device

SELECT d.site, count(*) AS ports
FROM devices d JOIN interfaces i ON i.device = d.name
GROUP BY d.site ORDER BY d.site</pre>
<ul>
<li><code>GROUP BY device</code> har device ki ek result row banata hai; har aggregate apne group ke andar chalta hai. <code>sum(status = 'up')</code> har true comparison par 1 jodta hai, conditions ginne ka aasaan tareeka.</li>
<li><code>WHERE</code> grouping se pehle <i>rows</i> filter karta hai. <code>HAVING</code> counting ke baad <i>groups</i> filter karta hai. Teen se kam ports wale devices teesre result se gayab ho jaate hain.</li>
<li>Doosre aggregates: <code>min</code>, <code>max</code>, <code>avg</code>, <code>sum</code>. Har selected column ya <code>GROUP BY</code> mein ho ya aggregate ke andar.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> <code>ON</code> condition bhoolna, jo har row ko har row se jod deta hai. LEFT JOIN ki right table ko <code>WHERE</code> mein normal test se filter karna, jo use chupchaap INNER JOIN bana deta hai. <code>HAVING</code> ki jagah <code>WHERE count(*) &gt; 1</code> likhna. <code>facts</code> banane se pehle <code>facts.py</code> chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Right table ki key par LEFT JOIN aur <code>IS NULL</code> "bina match wali left rows" dhoondhta hai. INNER JOIN unhe hata deta hai. <code>WHERE</code> aggregates use nahi kar sakta; <code>HAVING</code> kar sakta hai.</p></div>

<div class="scn"><h4>Chalis switches jinhe kisi ne poll nahi kiya</h4><p>Ek weekly audit ne inventory ko polling results se compare kiya. <code>IS NULL</code> ke saath LEFT JOIN ne 40 switches list kiye jo inventory mein the par kabhi poll nahi hue. Sab 40 ek management VLAN par the jahan polling script pahunch nahi sakti thi, aur mahino se kisi ne yeh notice nahi kiya tha.</p><p><b>Lesson:</b> dilchasp rows aksar wahi hoti hain jo match nahi hui.</p></div>

<div class="iv"><p class="q">"Un devices ki query likho jinhone kabhi facts report nahi kiye, aur samjhao."</p><p><code>SELECT d.name FROM devices d LEFT JOIN facts f ON f.device = d.name WHERE f.device IS NULL</code>. LEFT JOIN har device rakhta hai, jahan fact nahi wahan right side NULL hoti hai, aur WHERE theek wahi rows rakhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory plan hai; facts jo mila woh hai. Dono ko join se compare karo.</li>
<li>INNER JOIN matches rakhta hai; LEFT JOIN saari left rows; <code>IS NULL</code> gaps dhoondhta hai.</li>
<li><code>count</code>, <code>sum</code>, <code>max</code> ke saath <code>GROUP BY</code> kai rows ka saar nikaalta hai.</li>
<li><code>WHERE</code> rows filter karta hai, <code>HAVING</code> groups.</li>
<li><code>datetime('now')</code> rows par stamp lagata hai; text timestamps sahi compare hote hain.</li>
</ul></div>
`}};export{e as default};