var e={id:`collect-backup`,h:{en:`Collecting and backing up: survive a dead router and say so`,hi:`Collect aur backup: dead router se bacho aur batao bhi`},body:{en:`
<p><b>The idea of this chapter:</b> the backup is the toolkit's sensor. Golden, drift and the report all compare against what the backup recorded, so it has to keep two promises: <i>save every router that answers</i>, and <i>never stop because one does not</i>, while saying clearly which one did not. You built the SSH part in <code>auto-ssh</code> and the survival part in <code>py-tools</code>; here they sit together in <code>collect.py</code>.</p>

<h3>collect.py</h3>
<pre class="code">"""collect.py - read the running config of routers over SSH."""
import os

from nkmiko import ConnectHandler

NOISE = ("Building configuration", "Current configuration")


def clean(text):
    """Running config without the lines that change by themselves."""
    return [ln.rstrip() for ln in text.splitlines()
            if ln.strip() and not ln.startswith("!") and not ln.startswith(NOISE)]


def connect(ip):
    return ConnectHandler(device_type="nk_ios", host=ip, username=os.environ["NK_USER"], password=os.environ["NK_PASS"])


def fetch(ip):
    conn = connect(ip)
    try:
        return clean(conn.send_command("show running-config"))
    finally:
        conn.disconnect()


def backup_all(devices, folder="backups"):
    """Save every reachable router. Returns {name: 'ok' or 'unreachable'}."""
    os.makedirs(folder, exist_ok=True)
    status = {}
    for name, ip in devices:
        try:
            lines = fetch(ip)
        except Exception as err:
            status[name] = "unreachable"
            continue
        with open(f"{folder}/{name}.cfg", "w") as f:
            f.write("\\n".join(lines) + "\\n")
        status[name] = "ok"
    return status</pre>

<h3>Why clean() exists</h3>
<p>A running config starts with lines like <code>Building configuration...</code> and <code>Current configuration : 760 bytes</code>, and has many <code>!</code> separator lines. The byte count changes whenever the config changes, and a comment line says nothing. If you kept them, <i>every</i> backup would differ from the golden copy and drift would shout all the time. So <code>clean()</code> keeps only real configuration. It strips trailing spaces and drops empty lines, but it keeps the leading space of a child line, because that indent is how a line belongs to its interface.</p>
<pre class="out">AUTO01$ cat t2.py
from toolkit import collect

raw = "Building configuration...\\n\\nCurrent configuration : 760 bytes\\n!\\nhostname R1\\n!\\ninterface Gi0/0   \\n ip address 10.0.0.1 255.255.255.0\\n"
print(collect.clean(raw))
AUTO01$ python3 t2.py
<span class="hl">['hostname R1', 'interface Gi0/0', ' ip address 10.0.0.1 255.255.255.0']</span></pre>

<h3>connect() and fetch()</h3>
<p><code>connect()</code> builds the SSH session with the lab library <code>nkmiko</code> (<code>device_type="nk_ios"</code>). The user name and password are read from the environment (<code>os.environ</code>), which <code>load_dotenv()</code> filled from <code>.env</code>; no secret is in the code (py-secrets). <code>fetch()</code> runs <code>show running-config</code> and cleans the answer. The <code>try</code> and <code>finally</code> make sure <code>disconnect()</code> always runs, even when something fails half way, so the router's VTY lines are never left occupied.</p>

<h3>backup_all(): catch the right exception</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="For each router: try to fetch; on success write the file and record ok; on any exception record unreachable and continue; finally write status.json">
<rect x="10" y="55" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">next router</text><text x="65" y="93" text-anchor="middle" class="svg-muted" font-size="10">name, ip</text>
<rect x="160" y="55" width="110" height="50" rx="8" fill="#fde68a"/><text x="215" y="76" text-anchor="middle" class="svg-ink" font-size="12">try fetch(ip)</text><text x="215" y="93" text-anchor="middle" class="svg-muted" font-size="10">SSH session</text>
<rect x="320" y="12" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="395" y="33" text-anchor="middle" class="svg-ink" font-size="12">write name.cfg</text><text x="395" y="50" text-anchor="middle" class="svg-muted" font-size="10">status = ok</text>
<rect x="320" y="100" width="150" height="50" rx="8" fill="#fecaca"/><text x="395" y="121" text-anchor="middle" class="svg-ink" font-size="12">except Exception</text><text x="395" y="138" text-anchor="middle" class="svg-muted" font-size="10">status = unreachable</text>
<rect x="510" y="55" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="76" text-anchor="middle" class="svg-ink" font-size="12">status.json</text><text x="570" y="93" text-anchor="middle" class="svg-muted" font-size="10">after the loop</text>
<line x1="120" y1="80" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="270" y1="70" x2="320" y2="40" stroke="#64748b" stroke-width="2"/><line x1="270" y1="90" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="470" y1="40" x2="510" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="125" x2="510" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="65" y="38" text-anchor="middle" class="svg-muted" font-size="10">loop continues</text>
</svg><p class="cap">Both branches return to the loop; only the final record differs.</p></div>
<p>The loop is the whole idea. The <code>try</code> wraps one router. If <code>fetch</code> fails for <i>any</i> reason (timeout, wrong password, a missing environment variable) the <code>except</code> records <code>unreachable</code> and <code>continue</code> moves to the next router. Choosing <code>Exception</code> here is deliberate: this is the boundary of <i>one device</i>, and whatever goes wrong with that device is that device's problem, never the whole run's. Inside smaller functions you still catch named errors, as in py-tools.</p>
<p>The opposite mistake is catching too little. The handed-over toolkit in Lab 2 says <code>except ValueError</code>. A dead router raises a netmiko timeout, not a ValueError, so the error flies straight through and the run dies.</p>

<h3>The front desk: cmd_backup</h3>
<pre class="code">def cmd_backup(args):
    found = devices()
    if not found:
        print("inventory is empty - nothing to back up")
        return
    status = collect.backup_all(found)
    for name, state in status.items():
        print(f"{name}: {state}")
    with open("status.json", "w") as f:
        json.dump(status, f)
    ok = sum(1 for s in status.values() if s == "ok")
    print(f"ok: {ok}, unreachable: {len(status) - ok}")</pre>
<p>Three things to notice. An empty inventory gets its own message instead of a silent success. Each router's state is printed. And the dictionary is saved as <code>status.json</code>: a <b>record of this run</b> that the report will read in chapter 7.</p>
<pre class="out">AUTO01$ python3 nettool.py backup
R1: ok
R2: ok
<span class="hl">R3: unreachable</span>
<span class="hl">ok: 2, unreachable: 1</span>
AUTO01$ ls backups
R1.cfg  R2.cfg
AUTO01$ cat status.json
{"R1": "ok", "R2": "ok", "R3": "unreachable"}
AUTO01$ head -5 backups/R1.cfg
version 2.0
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
hostname PUN-CORE-R1
AUTO01$ wc -l backups/R1.cfg
35 backups/R1.cfg</pre>

<div class="note"><p><b>Reference code.</b> This <code>backup</code> always exits with code 0. For cron or monitoring you may prefer <code>sys.exit(1)</code> when any router is unreachable (py-tools). The loop is also sequential on purpose; for fifty routers a thread pool (py-concurrency) would cut the time, but the status dictionary and the rules stay the same.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Catching a narrow error like <code>ValueError</code> so one dead router stops everything. Catching an error and recording nothing, so a failure looks like success. Forgetting <code>finally</code>, which leaves SSH sessions open. Keeping the <code>!</code> and byte-count lines, so every backup differs.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>continue</code> skips to the next loop item; <code>break</code> leaves the loop. Using <code>break</code> in the except block would stop the backup at the first dead router.</p></div>

<div class="scn"><h4>Forty-nine good backups, one missing line</h4><p>A nightly job crashed on router 17 of 50 and the morning report said nothing, because no report existed. After the loop learned to record "unreachable" and carry on, the team opened the morning file, saw one router in red and fixed a cable instead of rerunning everything.</p><p><b>Lesson:</b> a good run is complete and honest about what it could not do.</p></div>

<div class="iv"><p class="q">"How do you make a multi-device backup robust?"</p><p>I wrap each device in its own try and except, catch the failure at the device boundary, record the state per device, and continue. I always disconnect in a <code>finally</code>, I write a status record for the run, and I print or exit with a result that tells the truth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>clean()</code> removes lines that change by themselves, so backups compare cleanly.</li>
<li>Credentials come from the environment; <code>finally</code> always disconnects.</li>
<li>Catch at the device boundary, record <code>unreachable</code>, and <code>continue</code>.</li>
<li>Catching too little (<code>ValueError</code>) lets one dead router kill the run.</li>
<li><code>status.json</code> is the record of the run that later actions trust.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> backup toolkit ka sensor hai. Golden, drift aur report sab usi se compare karte hain jo backup ne record kiya, isliye usse do waade nibhane hain: <i>jo router jawab de use save karo</i>, aur <i>ek ke jawab na dene par rukna mat</i>, saath mein saaf batao ki kaunsa jawab nahi diya. SSH wala hissa aapne <code>auto-ssh</code> mein banaya aur survival wala hissa <code>py-tools</code> mein; yahan dono <code>collect.py</code> mein saath baithte hain.</p>

<h3>collect.py</h3>
<pre class="code">"""collect.py - read the running config of routers over SSH."""
import os

from nkmiko import ConnectHandler

NOISE = ("Building configuration", "Current configuration")


def clean(text):
    """Running config without the lines that change by themselves."""
    return [ln.rstrip() for ln in text.splitlines()
            if ln.strip() and not ln.startswith("!") and not ln.startswith(NOISE)]


def connect(ip):
    return ConnectHandler(device_type="nk_ios", host=ip, username=os.environ["NK_USER"], password=os.environ["NK_PASS"])


def fetch(ip):
    conn = connect(ip)
    try:
        return clean(conn.send_command("show running-config"))
    finally:
        conn.disconnect()


def backup_all(devices, folder="backups"):
    """Save every reachable router. Returns {name: 'ok' or 'unreachable'}."""
    os.makedirs(folder, exist_ok=True)
    status = {}
    for name, ip in devices:
        try:
            lines = fetch(ip)
        except Exception as err:
            status[name] = "unreachable"
            continue
        with open(f"{folder}/{name}.cfg", "w") as f:
            f.write("\\n".join(lines) + "\\n")
        status[name] = "ok"
    return status</pre>

<h3>clean() kyon hai</h3>
<p>Running config <code>Building configuration...</code> aur <code>Current configuration : 760 bytes</code> jaisi lines se shuru hoti hai, aur usme bahut saari <code>!</code> separator lines hoti hain. Byte count config badalte hi badal jata hai, aur comment line kuch kehti nahi. Agar inhe rakho to <i>har</i> backup golden copy se alag dikhega aur drift baar-baar chillayega. Isliye <code>clean()</code> sirf asli configuration rakhta hai. Yeh trailing spaces hatata hai aur khaali lines girata hai, par child line ka leading space rakhta hai, kyunki yahi indent batata hai ki line kis interface ki hai.</p>
<pre class="out">AUTO01$ cat t2.py
from toolkit import collect

raw = "Building configuration...\\n\\nCurrent configuration : 760 bytes\\n!\\nhostname R1\\n!\\ninterface Gi0/0   \\n ip address 10.0.0.1 255.255.255.0\\n"
print(collect.clean(raw))
AUTO01$ python3 t2.py
<span class="hl">['hostname R1', 'interface Gi0/0', ' ip address 10.0.0.1 255.255.255.0']</span></pre>

<h3>connect() aur fetch()</h3>
<p><code>connect()</code> lab library <code>nkmiko</code> (<code>device_type="nk_ios"</code>) se SSH session banata hai. User name aur password environment (<code>os.environ</code>) se aate hain, jise <code>load_dotenv()</code> ne <code>.env</code> se bhara; code mein koi secret nahi (py-secrets). <code>fetch()</code> <code>show running-config</code> chalata hai aur jawab clean karta hai. <code>try</code> aur <code>finally</code> pakka karte hain ki <code>disconnect()</code> hamesha chale, chahe beech mein kuch fail ho, taaki router ki VTY lines kabhi occupied na rahein.</p>

<h3>backup_all(): sahi exception pakdo</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Har router ke liye: fetch try karo; success par file likho aur ok record karo; kisi bhi exception par unreachable record karke aage badho; ant mein status.json likho">
<rect x="10" y="55" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">agla router</text><text x="65" y="93" text-anchor="middle" class="svg-muted" font-size="10">name, ip</text>
<rect x="160" y="55" width="110" height="50" rx="8" fill="#fde68a"/><text x="215" y="76" text-anchor="middle" class="svg-ink" font-size="12">try fetch(ip)</text><text x="215" y="93" text-anchor="middle" class="svg-muted" font-size="10">SSH session</text>
<rect x="320" y="12" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="395" y="33" text-anchor="middle" class="svg-ink" font-size="12">name.cfg likho</text><text x="395" y="50" text-anchor="middle" class="svg-muted" font-size="10">status = ok</text>
<rect x="320" y="100" width="150" height="50" rx="8" fill="#fecaca"/><text x="395" y="121" text-anchor="middle" class="svg-ink" font-size="12">except Exception</text><text x="395" y="138" text-anchor="middle" class="svg-muted" font-size="10">status = unreachable</text>
<rect x="510" y="55" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="76" text-anchor="middle" class="svg-ink" font-size="12">status.json</text><text x="570" y="93" text-anchor="middle" class="svg-muted" font-size="10">loop ke baad</text>
<line x1="120" y1="80" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="270" y1="70" x2="320" y2="40" stroke="#64748b" stroke-width="2"/><line x1="270" y1="90" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="470" y1="40" x2="510" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="125" x2="510" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="65" y="38" text-anchor="middle" class="svg-muted" font-size="10">loop chalta rehta hai</text>
</svg><p class="cap">Dono branches loop mein wapas aati hain; sirf aakhri record alag hota hai.</p></div>
<p>Loop hi poora idea hai. <code>try</code> ek router ko wrap karta hai. Agar <code>fetch</code> <i>kisi bhi</i> wajah se fail ho (timeout, galat password, environment variable missing) to <code>except</code> <code>unreachable</code> record karta hai aur <code>continue</code> agle router par le jata hai. Yahan <code>Exception</code> chunna jaan-boojhkar hai: yeh <i>ek device</i> ki seema hai, aur us device ke saath jo bhi galat ho woh usi device ki problem hai, poore run ki nahi. Chhote functions ke andar aap ab bhi naam wale errors pakadte ho, jaise py-tools mein.</p>
<p>Ulta galti hai kam pakadna. Lab 2 ke handover hue toolkit mein <code>except ValueError</code> likha hai. Dead router netmiko timeout raise karta hai, ValueError nahi, isliye error seedha nikal jata hai aur run mar jata hai.</p>

<h3>Front desk: cmd_backup</h3>
<pre class="code">def cmd_backup(args):
    found = devices()
    if not found:
        print("inventory is empty - nothing to back up")
        return
    status = collect.backup_all(found)
    for name, state in status.items():
        print(f"{name}: {state}")
    with open("status.json", "w") as f:
        json.dump(status, f)
    ok = sum(1 for s in status.values() if s == "ok")
    print(f"ok: {ok}, unreachable: {len(status) - ok}")</pre>
<p>Teen baatein dekho. Khaali inventory ko chupchaap success ki jagah apna message milta hai. Har router ka state print hota hai. Aur dictionary <code>status.json</code> ki tarah save hoti hai: <b>is run ka record</b> jise report chapter 7 mein padhegi.</p>
<pre class="out">AUTO01$ python3 nettool.py backup
R1: ok
R2: ok
<span class="hl">R3: unreachable</span>
<span class="hl">ok: 2, unreachable: 1</span>
AUTO01$ ls backups
R1.cfg  R2.cfg
AUTO01$ cat status.json
{"R1": "ok", "R2": "ok", "R3": "unreachable"}
AUTO01$ head -5 backups/R1.cfg
version 2.0
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
hostname PUN-CORE-R1
AUTO01$ wc -l backups/R1.cfg
35 backups/R1.cfg</pre>

<div class="note"><p><b>Reference code.</b> Yeh <code>backup</code> hamesha exit code 0 deta hai. Cron ya monitoring ke liye aap kisi router ke unreachable hone par <code>sys.exit(1)</code> pasand kar sakte ho (py-tools). Loop jaan-boojhkar sequential hai; pachaas routers ke liye thread pool (py-concurrency) time ghatayega, par status dictionary aur rules wahi rahenge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>ValueError</code> jaisa narrow error pakadna taaki ek dead router sab rok de. Error pakadkar kuch record na karna, jisse failure success jaisi dikhe. <code>finally</code> bhoolna, jisse SSH sessions khule reh jaate hain. <code>!</code> aur byte-count lines rakhna, jisse har backup alag dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>continue</code> agle loop item par jata hai; <code>break</code> loop se bahar nikalta hai. Except block mein <code>break</code> lagane se backup pehle dead router par ruk jata.</p></div>

<div class="scn"><h4>Unchaas achhe backups, ek gayab line</h4><p>Ek nightly job 50 mein se router 17 par crash hui aur subah report ne kuch nahi bataya, kyunki koi report thi hi nahi. Loop ko "unreachable" record karke aage badhna sikhane ke baad team ne subah file kholi, ek router laal dekha aur sab dobara chalane ki jagah ek cable theek kiya.</p><p><b>Lesson:</b> achha run poora hota hai aur jo woh nahi kar paya uske baare mein imaandar hota hai.</p></div>

<div class="iv"><p class="q">"Multi-device backup ko robust kaise banate ho?"</p><p>Har device ko apne try aur except mein wrap karta hoon, failure ko device ki seema par pakadta hoon, har device ka state record karta hoon, aur aage badhta hoon. Disconnect hamesha <code>finally</code> mein karta hoon, run ka status record likhta hoon, aur aisa result print ya exit karta hoon jo sach batata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>clean()</code> woh lines hatata hai jo khud badalti hain, taaki backups saaf compare hon.</li>
<li>Credentials environment se aate hain; <code>finally</code> hamesha disconnect karta hai.</li>
<li>Device ki seema par pakdo, <code>unreachable</code> record karo, aur <code>continue</code> karo.</li>
<li>Kam pakadna (<code>ValueError</code>) ek dead router ko poora run maarne deta hai.</li>
<li><code>status.json</code> run ka record hai jis par aage ke actions bharosa karte hain.</li>
</ul></div>
`}};export{e as default};