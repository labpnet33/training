var e={id:`getters-practice`,h:{en:`Getters in practice: fleet reports, safe calls and raw config`,hi:`Getters practice mein: fleet reports, safe calls aur raw config`},body:{en:`<p>One getter on one device is a demo. A tool is a loop over many devices that survives the ones that fail, copes with the getters a driver lacks, and turns the data into something a human reads. This chapter builds those three habits, then shows the two escape hatches for when no getter fits: <code>get_config()</code> and <code>cli()</code>.</p>

<h3>An analogy: the morning round</h3>
<p>A hospital nurse visits every bed with the same chart. Some beds are empty, some patients cannot be measured the usual way, and the nurse still finishes the round and writes one summary. A fleet script does the same: one chart, every device, and an honest row for the ones that could not be read.</p>

<h3>Habit 1: a dead device is a row, not a crash</h3>
<p>If <code>open()</code> raises inside a loop, the whole run stops and you lose the devices after it. Catch the connection error, record it, and go on. The script adds a fake device X1 that does not answer, to prove it.</p>
<pre class="code">"""fleet.py - one row per device; a dead device becomes a row, not a crash"""
from napalm.base.exceptions import ConnectionException
from tabulate import tabulate

from nkdev import DEVICES, open_device

DEVICES["X1"] = {"host": "10.99.0.99", "driver": "ios", "args": {"secret": "NK@2026"}}
rows = []
for name in DEVICES:
    try:
        dev = open_device(name)
    except ConnectionException as err:
        rows.append([name, "-", "-", "-", "UNREACHABLE: " + str(err).splitlines()[0]])
        continue
    facts = dev.get_facts()
    peers = dev.get_bgp_neighbors()["global"]["peers"]
    up = sum(1 for p in peers.values() if p["is_up"])
    rows.append([name, facts["vendor"], facts["model"], "%d/%d" % (up, len(peers)), "ok"])
    dev.close()
print(tabulate(rows, headers=["device", "vendor", "model", "bgp up", "status"]))</pre>
<pre class="out">AUTO01$ python3 fleet.py
device    vendor    model     bgp up    status
--------  --------  --------  --------  ---------------------------------------------
R1        Cisco     ISR4331   2/2       ok
J1        Juniper   VMX       1/1       ok
E1        Arista    vEOS-lab  1/1       ok
X1        -         -         -         <span class="hl">UNREACHABLE: TCP connection to device failed.</span></pre>
<p>Three rows are real and the fourth says why it is empty. A report with a visible failure is useful; a crash with no report is not. The tabulate library (from Program 1) draws the table. In <code>adv-nornir</code> this pattern becomes <code>failed_hosts</code> and you will not write the try/except yourself.</p>

<h3>Habit 2: a safe wrapper for missing getters</h3>
<p>Chapter 3 showed that a driver may lack a getter. Wrap the call once instead of writing <code>try/except</code> everywhere:</p>
<pre class="code">from nkdev import DEVICES, open_device


def safe(dev, getter, default=None, **kwargs):
    """Call a getter; return the default when this driver does not implement it."""
    try:
        return getattr(dev, getter)(**kwargs)
    except NotImplementedError:
        return default


for name in DEVICES:
    dev = open_device(name)
    vlans = safe(dev, "get_vlans", default={})
    users = safe(dev, "get_users", default={})
    snmp = safe(dev, "get_snmp_information")
    print("%s vlans=%d users=%s snmp=%s" % (name, len(vlans), sorted(users), "n/a" if snmp is None else "ok"))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 safe.py
R1 vlans=0 users=['netops'] snmp=ok
J1 vlans=0 users=['netops'] <span class="hl">snmp=n/a</span>
E1 vlans=1 users=['netops'] snmp=ok</pre>
<p>R1 and E1 answer; J1 gives <code>n/a</code> for SNMP because the call raised <code>NotImplementedError</code>. The default decides what "no answer" looks like, so choose it deliberately: <code>{}</code> for a dictionary you will loop over, <code>None</code> when you must tell "unknown" apart from "empty".</p>

<h3>Habit 3: do not compare what changes by itself</h3>
<p>Save getter output to compare with yesterday's, but strip the noisy fields first: <code>uptime</code>, byte counters, <code>last_flapped</code>, BGP session <code>uptime</code>. A diff that is full of noise teaches people to ignore diffs. Keep identity (hostname, model), design (NTP servers, BGP peers and their AS numbers) and state that should be steady (<code>is_up</code>).</p>

<h3>Escape hatch 1: get_config</h3>
<p><code>get_config(retrieve="all", full=False, sanitized=False)</code> returns a dictionary with the keys <code>running</code>, <code>startup</code> and <code>candidate</code>. Each value is plain text in the vendor's own format. Passing <code>retrieve="running"</code> fills only that key.</p>
<pre class="code">from nkdev import DEVICES, open_device

for name in DEVICES:
    dev = open_device(name)
    cfg = dev.get_config()
    print(name, {k: len(v.splitlines()) for k, v in sorted(cfg.items())})
    dev.close()</pre>
<pre class="out">AUTO01$ python3 cfgs.py
R1 {'candidate': 0, 'running': 65, 'startup': 65}
J1 {'candidate': 51, 'running': 52, <span class="hl">'startup': 0</span>}
E1 {'candidate': 0, 'running': 32, 'startup': 32}</pre>
<p>IOS and EOS have a candidate of <code>0</code> lines because nothing is staged. Junos has no separate startup configuration (every commit is the startup), so its <code>startup</code> is empty, and its <code>candidate</code> holds the candidate database. Line counts differ because they are different languages: IOS is flat text, Junos is the curly-brace format. Use <code>sanitized=True</code> on real gear to blank passwords before you save a file or send it to a colleague.</p>

<h3>Escape hatch 2: cli</h3>
<p>When there is no getter, <code>dev.cli(["show clock"])</code> returns raw text in a dictionary keyed by command, as chapter 2 showed. You are back to parsing text, so keep these calls few and put them in one function you can later replace by a getter.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The line counts above are those of the simulator's configuration, not of a real ISR.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Letting one dead device end the loop; saving raw getter output with <code>uptime</code> inside and then diffing it; calling <code>cli()</code> for something a getter already returns; committing a raw <code>get_config()</code> file with secrets to Git. Use <code>sanitized=True</code> or a secrets scanner.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>get_config()</code> returns a dictionary of three strings, not a string. The key you want from <code>retrieve="running"</code> is still <code>["running"]</code>.</p></div>

<div class="scn"><h4>The report that was green because it was empty</h4><p>A weekly BGP report listed "peers down: none" for a whole month. A dead router in the middle of the list had raised an exception that the script swallowed with a bare <code>except: pass</code>, so its peers were never counted. The fix was the habit above: a row with UNREACHABLE for every device that could not be read, and an exit code that is not zero when any row is not ok.</p><p><b>Lesson:</b> "no problems found" is only true if you also report what you could not look at.</p></div>

<div class="iv"><p class="q">"How do you build a fleet report that does not lie when a device is down?"</p><p>I treat connection failure as data: one row per device with a status column, an exit code that reflects it, and no bare <code>except</code>. I wrap optional getters so a missing one gives a clear default, and I strip volatile fields before I store anything for comparison.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catch <code>ConnectionException</code> per device and keep the row.</li>
<li>Wrap optional getters once with a default you chose.</li>
<li>Strip uptime and counters before comparing runs.</li>
<li><code>get_config()</code> returns running, startup and candidate text; Junos has no separate startup.</li>
<li><code>cli()</code> is a last resort; hide it in one function.</li></ul></div>`,hi:`<p>Ek device par ek getter demo hai. Tool woh loop hai jo kai devices par chalta hai, jo fail hone wale devices se bachta hai, driver ke missing getters sambhalta hai, aur data ko aisi cheez banata hai jo insaan padh sake. Yeh chapter yeh teen aadatein banata hai, phir do escape hatches dikhata hai jab koi getter fit na ho: <code>get_config()</code> aur <code>cli()</code>.</p>

<h3>Ek analogy: subah ka round</h3>
<p>Hospital ki nurse har bed par wahi chart leke jaati hai. Kuch beds khaali hain, kuch patients ko aam tareeke se naapa nahi ja sakta, phir bhi nurse round poora karti hai aur ek summary likhti hai. Fleet script bhi yahi karti hai: ek chart, har device, aur jo padhe nahi ja sake unke liye imaandaar row.</p>

<h3>Aadat 1: dead device ek row hai, crash nahi</h3>
<p>Agar loop ke andar <code>open()</code> exception uthaye, poora run ruk jaata hai aur uske baad ke devices chhoot jaate hain. Connection error pakdo, record karo, aur aage badho. Script saabit karne ke liye ek nakli device X1 jodti hai jo jawab nahi deta.</p>
<pre class="code">"""fleet.py - one row per device; a dead device becomes a row, not a crash"""
from napalm.base.exceptions import ConnectionException
from tabulate import tabulate

from nkdev import DEVICES, open_device

DEVICES["X1"] = {"host": "10.99.0.99", "driver": "ios", "args": {"secret": "NK@2026"}}
rows = []
for name in DEVICES:
    try:
        dev = open_device(name)
    except ConnectionException as err:
        rows.append([name, "-", "-", "-", "UNREACHABLE: " + str(err).splitlines()[0]])
        continue
    facts = dev.get_facts()
    peers = dev.get_bgp_neighbors()["global"]["peers"]
    up = sum(1 for p in peers.values() if p["is_up"])
    rows.append([name, facts["vendor"], facts["model"], "%d/%d" % (up, len(peers)), "ok"])
    dev.close()
print(tabulate(rows, headers=["device", "vendor", "model", "bgp up", "status"]))</pre>
<pre class="out">AUTO01$ python3 fleet.py
device    vendor    model     bgp up    status
--------  --------  --------  --------  ---------------------------------------------
R1        Cisco     ISR4331   2/2       ok
J1        Juniper   VMX       1/1       ok
E1        Arista    vEOS-lab  1/1       ok
X1        -         -         -         <span class="hl">UNREACHABLE: TCP connection to device failed.</span></pre>
<p>Teen rows asli hain aur chauthi batati hai ki khaali kyon hai. Dikhti hui failure wali report kaam ki hai; bina report ka crash nahi. tabulate library (Program 1 se) table banati hai. <code>adv-nornir</code> mein yeh pattern <code>failed_hosts</code> ban jaata hai aur aap try/except khud nahi likhoge.</p>

<h3>Aadat 2: missing getters ke liye safe wrapper</h3>
<p>Chapter 3 ne dikhaya ki driver mein getter missing ho sakta hai. Har jagah <code>try/except</code> likhne ke bajaye call ko ek baar wrap karo:</p>
<pre class="code">from nkdev import DEVICES, open_device


def safe(dev, getter, default=None, **kwargs):
    """Call a getter; return the default when this driver does not implement it."""
    try:
        return getattr(dev, getter)(**kwargs)
    except NotImplementedError:
        return default


for name in DEVICES:
    dev = open_device(name)
    vlans = safe(dev, "get_vlans", default={})
    users = safe(dev, "get_users", default={})
    snmp = safe(dev, "get_snmp_information")
    print("%s vlans=%d users=%s snmp=%s" % (name, len(vlans), sorted(users), "n/a" if snmp is None else "ok"))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 safe.py
R1 vlans=0 users=['netops'] snmp=ok
J1 vlans=0 users=['netops'] <span class="hl">snmp=n/a</span>
E1 vlans=1 users=['netops'] snmp=ok</pre>
<p>R1 aur E1 jawab dete hain; J1 SNMP ke liye <code>n/a</code> deta hai kyunki call ne <code>NotImplementedError</code> uthaya. Default tay karta hai ki "jawab nahi" kaisa dikhe, isliye soch samajhkar chuno: jis dictionary par loop chalana hai uske liye <code>{}</code>, aur jab "pata nahi" ko "khaali" se alag karna ho tab <code>None</code>.</p>

<h3>Aadat 3: jo khud badalta hai use compare mat karo</h3>
<p>Kal ke saath compare karne ke liye getter output save karo, par pehle shor wali fields hatao: <code>uptime</code>, byte counters, <code>last_flapped</code>, BGP session ka <code>uptime</code>. Shor se bhara diff logon ko diff ignore karna sikha deta hai. Identity (hostname, model), design (NTP servers, BGP peers aur unke AS numbers) aur woh state rakho jo sthir honi chahiye (<code>is_up</code>).</p>

<h3>Escape hatch 1: get_config</h3>
<p><code>get_config(retrieve="all", full=False, sanitized=False)</code> ek dictionary lautata hai jisme keys <code>running</code>, <code>startup</code> aur <code>candidate</code> hain. Har value vendor ke apne format ka plain text hai. <code>retrieve="running"</code> dene par sirf wahi key bharti hai.</p>
<pre class="code">from nkdev import DEVICES, open_device

for name in DEVICES:
    dev = open_device(name)
    cfg = dev.get_config()
    print(name, {k: len(v.splitlines()) for k, v in sorted(cfg.items())})
    dev.close()</pre>
<pre class="out">AUTO01$ python3 cfgs.py
R1 {'candidate': 0, 'running': 65, 'startup': 65}
J1 {'candidate': 51, 'running': 52, <span class="hl">'startup': 0</span>}
E1 {'candidate': 0, 'running': 32, 'startup': 32}</pre>
<p>IOS aur EOS ka candidate <code>0</code> lines ka hai kyunki kuch stage nahi hai. Junos ke paas alag startup configuration nahi hoti (har commit hi startup hai), isliye uska <code>startup</code> khaali hai, aur uska <code>candidate</code> candidate database rakhta hai. Line counts alag hain kyunki bhasha alag hai: IOS flat text hai, Junos curly-brace format. Asli gear par file save karne ya saathi ko bhejne se pehle passwords chhupane ke liye <code>sanitized=True</code> use karo.</p>

<h3>Escape hatch 2: cli</h3>
<p>Jab getter na ho, <code>dev.cli(["show clock"])</code> raw text command-keyed dictionary mein lautata hai, jaise chapter 2 ne dikhaya. Aap wapas text parse kar rahe ho, isliye yeh calls kam rakho aur ek function mein rakho jise baad mein getter se badal sako.</p>

<div class="note"><p><b>Lab mein vs asli gear par.</b> Upar ke line counts simulator ki configuration ke hain, asli ISR ke nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek dead device se loop khatam kar dena; <code>uptime</code> ke saath raw getter output save karke use diff karna; jo getter pehle se deta hai uske liye <code>cli()</code> bulana; secrets wali raw <code>get_config()</code> file Git mein commit karna. <code>sanitized=True</code> ya secrets scanner use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>get_config()</code> teen strings ki dictionary lautata hai, string nahi. <code>retrieve="running"</code> se jo key chahiye woh ab bhi <code>["running"]</code> hai.</p></div>

<div class="scn"><h4>Woh report jo khaali hone ki wajah se hari thi</h4><p>Ek weekly BGP report poore mahine "peers down: none" kehti rahi. List ke beech ek dead router ne exception uthayi thi jise script ne bare <code>except: pass</code> se nigal liya, isliye uske peers kabhi gine hi nahi gaye. Fix upar wali aadat thi: har us device ke liye UNREACHABLE wali row jo padha nahi ja saka, aur jab koi row ok na ho tab non-zero exit code.</p><p><b>Lesson:</b> "koi problem nahi mili" tabhi sach hai jab aap yeh bhi report karo ki kya dekha nahi ja saka.</p></div>

<div class="iv"><p class="q">"Fleet report kaise banaoge jo device down hone par jhooth na bole?"</p><p>Main connection failure ko data maanta hoon: har device ki ek row status column ke saath, usse jura exit code, aur koi bare <code>except</code> nahi. Optional getters ko wrap karta hoon taaki missing getter saaf default de, aur compare ke liye kuch bhi store karne se pehle volatile fields hata deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har device par <code>ConnectionException</code> pakdo aur row rakho.</li>
<li>Optional getters ko apne chune default ke saath ek baar wrap karo.</li>
<li>Runs compare karne se pehle uptime aur counters hatao.</li>
<li><code>get_config()</code> running, startup aur candidate text lautata hai; Junos ka alag startup nahi hota.</li>
<li><code>cli()</code> aakhri sahara hai; use ek function mein chhupao.</li></ul></div>`}};export{e as default};