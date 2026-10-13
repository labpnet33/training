var e={id:`facts`,h:{en:`Facts: what PyEZ learns when it connects`,hi:`Facts: connect hote hi PyEZ kya seekhta hai`},body:{en:`
<p>Before you ask a router anything specific, you usually want to know what it is: the model, the Junos version, the serial number, the hostname. PyEZ collects that for you during <code>open()</code> and stores it in <code>dev.facts</code>. Facts turn a list of IP addresses into an inventory.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="10" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="31" text-anchor="middle" font-size="13" class="svg-ink">get-software-information</text><rect x="20" y="54" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="75" text-anchor="middle" font-size="13" class="svg-ink">get-chassis-inventory</text><rect x="20" y="98" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="119" text-anchor="middle" font-size="13" class="svg-ink">get-route-engine-information</text><rect x="20" y="142" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="163" text-anchor="middle" font-size="13" class="svg-ink">get-configuration (domain-name)</text><rect x="430" y="50" width="190" height="90" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="525" y="83" text-anchor="middle" font-size="13" class="svg-ink">dev.facts</text><text x="525" y="99" text-anchor="middle" font-size="13" class="svg-ink">one plain dict</text><text x="525" y="115" text-anchor="middle" font-size="13" class="svg-ink">32 keys</text><line x1="210" y1="27" x2="430" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="210" y1="71" x2="430" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="210" y1="115" x2="430" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="210" y1="159" x2="430" y2="120" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="20" text-anchor="middle" font-size="12" class="svg-muted">PyEZ asks four RPCs (in the lab)</text></svg><p class="cap">Where facts come from. They are a snapshot taken at open() time.</p></div>
<h3>Your first facts script</h3><p>This is step 1 of Lab 1. It prints the facts you will use most. Note that <code>version_info.major</code> is a tuple, not a string.</p>
<pre class="code">"""facts.py - what PyEZ learns about a router the moment it connects"""
from pyezutil import FLEET, device

with device(FLEET["J1"]) as dev:
    f = dev.facts
    print("hostname   ", f["hostname"])
    print("model      ", f["model"])
    print("version    ", f["version"])
    print("serial     ", f["serialnumber"])
    print("personality", f["personality"])
    print("virtual    ", f["virtual"])
    print("major      ", f["version_info"].major)
    print("RE0 status ", f["RE0"]["status"])
    print("RE0 uptime ", f["RE0"]["up_time"])</pre>
<pre class="out">AUTO01$ python3 facts.py
hostname    PUN-J1
model       VMX
<span class="hl">version     23.4R1.10</span>
<span class="hl">serial      NK7R3DC4X00</span>
personality MX
virtual     True
major       (23, 4)
RE0 status  OK
RE0 uptime  00:01:05</pre>
<h3>The facts worth knowing</h3>
<table class="cmp"><tr><th>Key</th><th>Example</th><th>Use</th></tr><tr><td><code>hostname</code>, <code>fqdn</code></td><td>PUN-J1</td><td>Names in reports</td></tr><tr><td><code>model</code></td><td>VMX</td><td>Hardware family</td></tr><tr><td><code>personality</code></td><td>MX</td><td>MX, SRX, EX, QFX: branch your code on it</td></tr><tr><td><code>version</code></td><td>23.4R1.10</td><td>Text of the Junos release</td></tr><tr><td><code>version_info</code></td><td>(23, 4) R 1 10</td><td>Compare releases safely</td></tr><tr><td><code>serialnumber</code></td><td>NK7R3DC4X00</td><td>Asset tracking</td></tr><tr><td><code>RE0</code></td><td>{status, up_time, ...}</td><td>Routing engine health</td></tr><tr><td><code>virtual</code></td><td>True</td><td>vMX or hardware</td></tr></table>
<p>A second script shows the shape of the dict and the version helper. Never compare versions as text: <code>"9.6" &gt; "23.4"</code> is true for strings. Compare the tuple <code>version_info.major</code> instead.</p>
<pre class="code">from pyezutil import FLEET, device

with device(FLEET["J2"], gather_facts=False) as dev:
    f = dev.facts
    print(type(f).__name__, len(f))
    print(sorted(f)[:8])
    print(f["version_info"])
    print(f["version_info"].major, f["version_info"].type, f["version_info"].minor, f["version_info"].build)
    print(f["version_info"].major &gt;= (22, 1))
    print(f["RE0"])
    print(f["hostname_info"], f["domain"], f["fqdn"])
    print(f["model_info"], f["personality"])
    dev.facts_refresh()
    print("refreshed", f["hostname"])</pre>
<pre class="out">AUTO01$ python3 facts2.py
dict 32
['2RE', 'HOME', 'RE0', 'RE1', 'RE_hw_mi', 'current_re', 'domain', 'fqdn']
<span class="hl">junos.version_info(major=(23, 4), type=R, minor=1, build=10)</span>
(23, 4) R 1 10
<span class="hl">True</span>
{'mastership_state': 'master', 'status': 'OK', 'model': 'RE-VMX', 'last_reboot_reason': 'Router rebooted after a normal shutdown.', 'up_time': '00:01:00'}
{'re0': 'BLR-J2'} None BLR-J2
{'re0': 'VMX'} MX
refreshed BLR-J2</pre>
<p><code>dev.facts_refresh()</code> reads the facts again, for example after a change that renames the router. The facts are a snapshot: they do not update by themselves.</p>
<h3>Facts at fleet scale: the inventory</h3><p>Step 2 of the lab turns facts into a table for the whole fleet. Two details matter. The loop catches <code>ConnectError</code> (the parent of every connect problem, chapter 8), so one dead router becomes one row. And J9 is a router from an old spreadsheet that no longer answers, which is exactly what real inventories contain.</p>
<pre class="code">"""inventory.py - one row per Junos router; an unreachable router becomes a row, not a crash"""
from jnpr.junos.exception import ConnectError
from pyezutil import FLEET, device

SHEET = dict(FLEET, J9="10.99.0.77")        <span class="c"># the old spreadsheet still lists J9</span>

print("%-4s %-8s %-6s %-10s %-12s %s" % ("NAME", "HOSTNAME", "MODEL", "VERSION", "SERIAL", "UPTIME"))
for name, host in SHEET.items():
    try:
        with device(host) as dev:
            f = dev.facts
            print("%-4s %-8s %-6s %-10s %-12s %s" % (name, f["hostname"], f["model"], f["version"], f["serialnumber"], f["RE0"]["up_time"]))
    except ConnectError as err:
        print("%-4s UNREACHABLE  %r" % (name, err))</pre>
<pre class="out">AUTO01$ python3 inventory.py
NAME HOSTNAME MODEL  VERSION    SERIAL       UPTIME
J1   PUN-J1   VMX    23.4R1.10  NK7R3DC4X00  00:01:12
J2   BLR-J2   VMX    23.4R1.10  NK8L26F1X00  00:01:12
J3   HYD-J3   VMX    23.4R1.10  NK8B2KQ2X00  00:01:12
<span class="hl">J9   UNREACHABLE  ConnectTimeoutError(10.99.0.77)</span></pre>
<p>The last column is the routing engine uptime from the facts. The serial numbers are what a procurement team asks for. The J9 row ends with <code>ConnectTimeoutError(10.99.0.77)</code>: the repr already names the host that did not answer.</p>
<div class="note"><p><b>Cost of facts.</b> Each <code>open()</code> with <code>gather_facts=True</code> runs a handful of extra RPCs. For one router that is nothing; for 500 routers it adds minutes. When a script only needs one RPC, pass <code>gather_facts=False</code>, as the BGP scripts later do.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating facts as live. <code>RE0["up_time"]</code> is the value at open time; it will not advance while your script runs.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>dev.facts</code> is a plain dict, so <code>dev.facts["model"]</code> works and <code>dev.facts.model</code> does not.</p></div>
<div class="scn"><h4>The 400-router inventory</h4><p>An engineer wrote an inventory loop over 400 routers with default settings and it took most of an hour, because each router also ran its facts RPCs. For a quick uptime report she switched to <code>gather_facts=False</code> and a thread pool from <code>py-concurrency</code>. The same report finished in minutes.</p><p><b>Lesson:</b> collect only what the report needs.</p></div>
<div class="iv"><p class="q">"How do you find out which Junos version a router runs from PyEZ?"</p><p>Open a Device and read <code>dev.facts["version"]</code> for the text, or <code>dev.facts["version_info"].major</code> for a tuple I can compare. Facts are collected at open time through a few RPCs, so I turn them off when the script does not need them.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>dev.facts</code> is a dict of 32 keys read at open time.</li><li>Use <code>version_info.major</code> for version comparisons.</li><li>Facts are a snapshot; <code>facts_refresh()</code> reads them again.</li><li>Catch <code>ConnectError</code> so one dead router becomes a row.</li><li>Pass <code>gather_facts=False</code> when you do not need facts.</li></ul></div>
`,hi:`
<p>Router se kuch khaas poochne se pehle aksar jaanna hota hai ki woh hai kya: model, Junos version, serial number, hostname. PyEZ yeh <code>open()</code> ke dauran khud jama karta hai aur <code>dev.facts</code> mein rakhta hai. Facts IP addresses ki list ko inventory bana dete hain.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="10" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="31" text-anchor="middle" font-size="13" class="svg-ink">get-software-information</text><rect x="20" y="54" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="75" text-anchor="middle" font-size="13" class="svg-ink">get-chassis-inventory</text><rect x="20" y="98" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="119" text-anchor="middle" font-size="13" class="svg-ink">get-route-engine-information</text><rect x="20" y="142" width="190" height="34" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="115" y="163" text-anchor="middle" font-size="13" class="svg-ink">get-configuration (domain-name)</text><rect x="430" y="50" width="190" height="90" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="525" y="83" text-anchor="middle" font-size="13" class="svg-ink">dev.facts</text><text x="525" y="99" text-anchor="middle" font-size="13" class="svg-ink">ek plain dict</text><text x="525" y="115" text-anchor="middle" font-size="13" class="svg-ink">32 keys</text><line x1="210" y1="27" x2="430" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="210" y1="71" x2="430" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="210" y1="115" x2="430" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="210" y1="159" x2="430" y2="120" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="20" text-anchor="middle" font-size="12" class="svg-muted">PyEZ chaar RPCs poochta hai (lab mein)</text></svg><p class="cap">Facts kahan se aate hain. Yeh open() ke samay ka snapshot hai.</p></div>
<h3>Tumhari pehli facts script</h3><p>Yeh Lab 1 ka step 1 hai. Yeh woh facts print karti hai jo sabse zyada kaam aate hain. Dhyan do ki <code>version_info.major</code> tuple hai, string nahi.</p>
<pre class="code">"""facts.py - what PyEZ learns about a router the moment it connects"""
from pyezutil import FLEET, device

with device(FLEET["J1"]) as dev:
    f = dev.facts
    print("hostname   ", f["hostname"])
    print("model      ", f["model"])
    print("version    ", f["version"])
    print("serial     ", f["serialnumber"])
    print("personality", f["personality"])
    print("virtual    ", f["virtual"])
    print("major      ", f["version_info"].major)
    print("RE0 status ", f["RE0"]["status"])
    print("RE0 uptime ", f["RE0"]["up_time"])</pre>
<pre class="out">AUTO01$ python3 facts.py
hostname    PUN-J1
model       VMX
<span class="hl">version     23.4R1.10</span>
<span class="hl">serial      NK7R3DC4X00</span>
personality MX
virtual     True
major       (23, 4)
RE0 status  OK
RE0 uptime  00:01:05</pre>
<h3>Kaam ke facts</h3>
<table class="cmp"><tr><th>Key</th><th>Example</th><th>Upyog</th></tr><tr><td><code>hostname</code>, <code>fqdn</code></td><td>PUN-J1</td><td>Reports mein naam</td></tr><tr><td><code>model</code></td><td>VMX</td><td>Hardware family</td></tr><tr><td><code>personality</code></td><td>MX</td><td>MX, SRX, EX, QFX: code ko isi par branch karo</td></tr><tr><td><code>version</code></td><td>23.4R1.10</td><td>Junos release ka text</td></tr><tr><td><code>version_info</code></td><td>(23, 4) R 1 10</td><td>Releases ko safely compare karo</td></tr><tr><td><code>serialnumber</code></td><td>NK7R3DC4X00</td><td>Asset tracking</td></tr><tr><td><code>RE0</code></td><td>{status, up_time, ...}</td><td>Routing engine health</td></tr><tr><td><code>virtual</code></td><td>True</td><td>vMX ya hardware</td></tr></table>
<p>Doosri script dict ka shape aur version helper dikhati hai. Versions ko kabhi text ki tarah compare mat karo: strings ke liye <code>"9.6" &gt; "23.4"</code> sahi nikalta hai. Iski jagah tuple <code>version_info.major</code> compare karo.</p>
<pre class="code">from pyezutil import FLEET, device

with device(FLEET["J2"], gather_facts=False) as dev:
    f = dev.facts
    print(type(f).__name__, len(f))
    print(sorted(f)[:8])
    print(f["version_info"])
    print(f["version_info"].major, f["version_info"].type, f["version_info"].minor, f["version_info"].build)
    print(f["version_info"].major &gt;= (22, 1))
    print(f["RE0"])
    print(f["hostname_info"], f["domain"], f["fqdn"])
    print(f["model_info"], f["personality"])
    dev.facts_refresh()
    print("refreshed", f["hostname"])</pre>
<pre class="out">AUTO01$ python3 facts2.py
dict 32
['2RE', 'HOME', 'RE0', 'RE1', 'RE_hw_mi', 'current_re', 'domain', 'fqdn']
<span class="hl">junos.version_info(major=(23, 4), type=R, minor=1, build=10)</span>
(23, 4) R 1 10
<span class="hl">True</span>
{'mastership_state': 'master', 'status': 'OK', 'model': 'RE-VMX', 'last_reboot_reason': 'Router rebooted after a normal shutdown.', 'up_time': '00:01:00'}
{'re0': 'BLR-J2'} None BLR-J2
{'re0': 'VMX'} MX
refreshed BLR-J2</pre>
<p><code>dev.facts_refresh()</code> facts dobara padhta hai, jaise router ka naam badalne wale change ke baad. Facts snapshot hain: apne aap update nahi hote.</p>
<h3>Fleet scale par facts: inventory</h3><p>Lab ka step 2 facts ko poori fleet ki table banata hai. Do baatein zaroori hain. Loop <code>ConnectError</code> pakadta hai (har connect problem ka parent, chapter 8), isliye ek dead router ek row ban jaata hai. Aur J9 purani spreadsheet ka router hai jo ab jawab nahi deta, jo asli inventories mein hota hi hai.</p>
<pre class="code">"""inventory.py - one row per Junos router; an unreachable router becomes a row, not a crash"""
from jnpr.junos.exception import ConnectError
from pyezutil import FLEET, device

SHEET = dict(FLEET, J9="10.99.0.77")        <span class="c"># the old spreadsheet still lists J9</span>

print("%-4s %-8s %-6s %-10s %-12s %s" % ("NAME", "HOSTNAME", "MODEL", "VERSION", "SERIAL", "UPTIME"))
for name, host in SHEET.items():
    try:
        with device(host) as dev:
            f = dev.facts
            print("%-4s %-8s %-6s %-10s %-12s %s" % (name, f["hostname"], f["model"], f["version"], f["serialnumber"], f["RE0"]["up_time"]))
    except ConnectError as err:
        print("%-4s UNREACHABLE  %r" % (name, err))</pre>
<pre class="out">AUTO01$ python3 inventory.py
NAME HOSTNAME MODEL  VERSION    SERIAL       UPTIME
J1   PUN-J1   VMX    23.4R1.10  NK7R3DC4X00  00:01:12
J2   BLR-J2   VMX    23.4R1.10  NK8L26F1X00  00:01:12
J3   HYD-J3   VMX    23.4R1.10  NK8B2KQ2X00  00:01:12
<span class="hl">J9   UNREACHABLE  ConnectTimeoutError(10.99.0.77)</span></pre>
<p>Aakhri column facts se routing engine uptime hai. Serial numbers woh hain jo procurement team maangti hai. J9 row <code>ConnectTimeoutError(10.99.0.77)</code> par khatam hoti hai: repr khud us host ka naam batata hai jisne jawab nahi diya.</p>
<div class="note"><p><b>Facts ki keemat.</b> <code>gather_facts=True</code> wala har <code>open()</code> kuch extra RPCs chalata hai. Ek router ke liye kuch nahi; 500 routers ke liye minutes jodta hai. Jab script ko sirf ek RPC chahiye to <code>gather_facts=False</code> do, jaise baad ki BGP scripts karti hain.</p></div>
<div class="warn"><p><b>Aam galti.</b> Facts ko live samajhna. <code>RE0["up_time"]</code> open ke samay ki value hai; script chalte waqt aage nahi badhti.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>dev.facts</code> plain dict hai, isliye <code>dev.facts["model"]</code> chalta hai aur <code>dev.facts.model</code> nahi.</p></div>
<div class="scn"><h4>400-router inventory</h4><p>Ek engineer ne 400 routers par default settings ke saath inventory loop likha aur woh lagbhag ek ghanta chala, kyunki har router facts RPCs bhi chalata tha. Quick uptime report ke liye usne <code>gather_facts=False</code> aur <code>py-concurrency</code> ka thread pool use kiya. Wahi report minutes mein khatam.</p><p><b>Lesson:</b> sirf wahi collect karo jo report ko chahiye.</p></div>
<div class="iv"><p class="q">"PyEZ se kaise pata karoge ki router kaunsa Junos version chala raha hai?"</p><p>Device kholta hoon aur text ke liye <code>dev.facts["version"]</code>, ya compare karne layak tuple ke liye <code>dev.facts["version_info"].major</code> padhta hoon. Facts open ke samay kuch RPCs se aate hain, isliye jab script ko zaroorat nahi to unhe band kar deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>dev.facts</code> 32 keys ka dict hai jo open ke samay padha jaata hai.</li><li>Version comparison ke liye <code>version_info.major</code> use karo.</li><li>Facts snapshot hain; <code>facts_refresh()</code> dobara padhta hai.</li><li><code>ConnectError</code> pakdo taaki ek dead router ek row bane.</li><li>Facts na chahiye to <code>gather_facts=False</code> do.</li></ul></div>
`}};export{e as default};