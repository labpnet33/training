var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 130" role="img" aria-label="What send_configs does around your lines">
<rect x="5" y="35" width="105" height="55" rx="8" fill="#bae6fd"/><text x="57" y="58" text-anchor="middle" class="svg-ink" font-size="12">enter config</text><text x="57" y="76" text-anchor="middle" class="svg-muted" font-size="11">acquire_priv</text>
<rect x="125" y="35" width="105" height="55" rx="8" fill="#bbf7d0"/><text x="177" y="58" text-anchor="middle" class="svg-ink" font-size="12">line 1</text><text x="177" y="76" text-anchor="middle" class="svg-muted" font-size="11">Response 1</text>
<rect x="245" y="35" width="105" height="55" rx="8" fill="#bbf7d0"/><text x="297" y="58" text-anchor="middle" class="svg-ink" font-size="12">line 2</text><text x="297" y="76" text-anchor="middle" class="svg-muted" font-size="11">Response 2</text>
<rect x="365" y="35" width="105" height="55" rx="8" fill="#fde68a"/><text x="417" y="58" text-anchor="middle" class="svg-ink" font-size="12">commit</text><text x="417" y="76" text-anchor="middle" class="svg-muted" font-size="11">Junos: your line</text>
<rect x="485" y="35" width="105" height="55" rx="8" fill="#bae6fd"/><text x="537" y="58" text-anchor="middle" class="svg-ink" font-size="12">leave config</text><text x="537" y="76" text-anchor="middle" class="svg-muted" font-size="11">back to exec</text>
<line x1="110" y1="62" x2="125" y2="62" stroke="#64748b" stroke-width="2"/><line x1="230" y1="62" x2="245" y2="62" stroke="#64748b" stroke-width="2"/><line x1="350" y1="62" x2="365" y2="62" stroke="#64748b" stroke-width="2"/><line x1="470" y1="62" x2="485" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">MultiResponse = the middle three boxes</text>
</svg>`,n={id:`backup-config`,h:{en:`Backups and configuration pushes: send_command, send_configs, commit`,hi:`Backups aur configuration push: send_command, send_configs, commit`},body:{en:`
<p><b>The idea of this chapter:</b> two jobs make up most network automation: reading the configuration (backup) and changing it (push). With scrapli both are a few lines, and in both the Response object keeps you honest.</p>

<h3>Lab 1, task 5: backup.py</h3>
<p>The show command differs per platform (<code>show running-config</code>, <code>show configuration</code> on Junos). The important line is <code>response.raise_for_status()</code>: it makes sure a rejected command can never be saved as if it were a backup.</p>
<pre class="code">import os
from datetime import date

from common import collect

SHOW = {
    "cisco_iosxe": "show running-config",
    "arista_eos": "show running-config",
    "juniper_junos": "show configuration",
}
folder = f"backups/{date.today().isoformat()}"
os.makedirs(folder, exist_ok=True)


def job(row, conn):
    response = conn.send_command(SHOW[row["platform"]])
    response.raise_for_status()
    path = f"{folder}/{row['name']}.cfg"
    with open(path, "w") as f:
        f.write(response.result + "\\n")
    lines = len(response.result.splitlines())
    print(f"saved {row['name']:&lt;3} ({row['platform']}) {lines} lines -&gt; {path}")


collect(job)</pre>
<pre class="out">AUTO01$ python3 backup.py
saved R1  (cisco_iosxe) 68 lines -&gt; backups/2026-09-29/R1.cfg
<span class="hl">saved J1  (juniper_junos) 52 lines -&gt; backups/2026-09-29/J1.cfg</span>
saved E1  (arista_eos) 32 lines -&gt; backups/2026-09-29/E1.cfg
DEAD1  unreachable</pre>
<pre class="out">AUTO01$ ls -R backups
backups:
2026-09-29

backups/2026-09-29:
E1.cfg  J1.cfg  R1.cfg</pre>
<p>The highlighted line answers the lab question: J1's configuration is 52 lines in this lab. The file name comes from the clock of the lab (<code>2026-09-29</code>), and DEAD1 has no file, because collecting it failed and was reported. This is the same behaviour as the netmiko version in adv-nkmiko, with one difference: the netmiko version had to remember to look for error text; here the library does it.</p>

<h3>send_configs: what happens around your lines</h3>
`+e(t,`send_configs enters configuration mode, sends each line as its own command, and leaves configuration mode. It never commits for you.`)+`
<p><code>send_configs(["line1", "line2"])</code> takes a <b>list</b>. For every line it returns one <code>Response</code>, collected in a <code>MultiResponse</code>. <code>send_config("line1\\nline2")</code> takes one string with newlines and returns one <code>Response</code>. If you pass a string to <code>send_configs</code> you get a <code>ScrapliTypeError</code> (Lab 2, fault 5). Both methods accept <code>stop_on_failed</code> and <code>failed_when_contains</code>. There are also <code>send_configs_from_file</code> and <code>send_config_from_file</code> for configuration kept in a file.</p>
<pre class="code">from scrapli import Scrapli

common = {"auth_username": "netops", "auth_password": "NK@2026", "auth_strict_key": False}
with Scrapli(platform="juniper_junos", host="10.99.0.11", **common) as j:
    no_commit = j.send_configs(["set system ntp server 10.99.0.62"])
    print(no_commit, "|", j.send_command("show configuration system ntp | display set").result)
    done = j.send_configs(["set system ntp server 10.99.0.62", "commit"])
    print(done, "|", j.send_command("show configuration system ntp | display set").result)
    bad = j.send_configs(["set system ntp server 10.99.0.63", "set bogus statement", "commit"], stop_on_failed=True)
    print(bad, [x.failed for x in bad])
    print(bad[1].result.strip())
    j.send_configs(["delete system ntp server 10.99.0.62", "commit"])

with Scrapli(platform="cisco_iosxe", host="10.99.0.1", auth_secondary="NK@2026", **common) as c:
    one = c.send_config("interface Loopback20\\n description from-send-config\\n ip address 20.20.20.20 255.255.255.255")
    print(one, one.failed)
    print(c.send_command("show running-config interface Loopback20").result)
    c.send_configs(["no interface Loopback20"])
    print(c.get_prompt())</pre>
<pre class="out">AUTO01$ python3 ch5.py
MultiResponse &lt;Success: True; Response Elements: 1&gt; | set system ntp server 10.99.0.60
MultiResponse &lt;Success: True; Response Elements: 2&gt; | set system ntp server 10.99.0.60
set system ntp server 10.99.0.62
MultiResponse &lt;Success: False; Response Elements: 2&gt; [False, True]
^
syntax error.
Response &lt;Success: True&gt; False
Building configuration...

Current configuration : 91 bytes
!
interface Loopback20
 description from-send-config
 ip address 20.20.20.20 255.255.255.255
end
PUN-CORE-R1#</pre>
<p>Look at the first two lines. Without <code>commit</code> the Junos NTP server was <b>not</b> in the configuration afterwards: the lab discards an uncommitted candidate when configuration mode is left. With <code>commit</code> as the last line of the list the server is there, and the MultiResponse has 2 elements. Then a bad statement with <code>stop_on_failed=True</code>: the MultiResponse stops after the failing line, <code>[False, True]</code>, and the failing Response holds the Junos <code>syntax error</code> text. Since <code>commit</code> was never sent, nothing changed. Last, IOS: <code>send_config</code> with one string of three lines gave one Response, and the read-back shows the loopback.</p>

<h3>Platform rules for configuration</h3>
<table class="cmp"><tr><th>Platform</th><th>Your list</th><th>Remember</th></tr>
<tr><td>IOS XE</td><td>plain configuration lines</td><td>applied at once; no commit; <code>copy running-config startup-config</code> is a separate <code>send_command</code></td></tr>
<tr><td>Arista EOS</td><td>plain configuration lines</td><td>applied at once; inside a config session, <code>commit</code> is a line you send</td></tr>
<tr><td>Junos</td><td>set/delete lines, then <code>commit</code></td><td>no <code>commit</code> means no change</td></tr></table>

<h3>Lab 1, task 6: push_ntp.py</h3>
<p>The script keeps the differences in two dictionaries (what to send, what to read back), sends with <code>stop_on_failed=True</code>, and never trusts the flag alone: it reads the NTP configuration back and reports <code>present</code> or <code>MISSING</code>.</p>
<pre class="code">from common import collect

NTP = "10.99.0.62"
LINES = {
    "cisco_iosxe": [f"ntp server {NTP}"],
    "arista_eos": [f"ntp server {NTP}"],
    "juniper_junos": [f"set system ntp server {NTP}", "commit"],
}
READ = {
    "cisco_iosxe": "show running-config | include ntp",
    "arista_eos": "show running-config | include ntp",
    "juniper_junos": "show configuration system ntp | display set",
}


def job(row, conn):
    name, platform = row["name"], row["platform"]
    responses = conn.send_configs(LINES[platform], stop_on_failed=True)
    print(f"{name:&lt;3} {responses}")
    if responses.failed:
        print(f"{name:&lt;3} FAILED, state unknown, check by hand")
        return False
    shown = conn.send_command(READ[platform]).result
    ok = NTP in shown
    print(f"{name:&lt;3} {'present' if ok else 'MISSING'}: ntp server {NTP}")
    return ok


results = collect(job)
print(f"{sum(results.values())}/{len(results)} devices have ntp server {NTP}")</pre>
<pre class="out">AUTO01$ python3 push_ntp.py
R1  MultiResponse &lt;Success: True; Response Elements: 1&gt;
R1  present: ntp server 10.99.0.62
<span class="hl">J1  MultiResponse &lt;Success: True; Response Elements: 2&gt;</span>
<span class="hl">J1  present: ntp server 10.99.0.62</span>
E1  MultiResponse &lt;Success: True; Response Elements: 1&gt;
E1  present: ntp server 10.99.0.62
DEAD1  unreachable
3/3 devices have ntp server 10.99.0.62</pre>
<p>Run it a second time and nothing breaks, because adding an NTP server that is already there changes nothing: the script is <b>idempotent</b>. The highlighted lines answer the lab question: the MultiResponse of J1 has 2 elements, the <code>set</code> line and the <code>commit</code>. R1 and E1 have one.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>commit</code> on Junos and trusting <code>Success: True</code>. Passing a string to <code>send_configs</code>. Saving a backup without <code>raise_for_status()</code>. Sending a long list without <code>stop_on_failed</code> on a device where line 3 depends on line 2. Never reading the state back after the change.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_configs</code> does not save the configuration on IOS XE and does not commit on Junos. Both are your job. Success only means that no listed error string appeared.</p></div>

<div class="scn"><h4>Thirty routers, no NTP</h4><p>A change window pushed an NTP server to thirty Junos routers with <code>send_configs</code> and no <code>commit</code>. The script printed success thirty times. The next morning the time was still wrong. The fix was one extra element in the list, and a read-back that compared the device's <code>show configuration system ntp</code> with the intended server.</p><p><b>Lesson:</b> the change is finished when the device says so, not when your script says so.</p></div>

<div class="iv"><p class="q">"How do you push a configuration change safely with scrapli?"</p><p>A list of lines per platform, <code>send_configs</code> with <code>stop_on_failed=True</code>, an explicit <code>commit</code> on Junos, a broader <code>failed_when_contains</code> where the platform words errors differently, and a read-back that compares the real state with the intent. Re-running the script must change nothing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_configs</code> takes a list and returns a MultiResponse; <code>send_config</code> takes one string.</li>
<li>It enters and leaves configuration mode for you, but never commits or saves.</li>
<li>On Junos the list must end with <code>commit</code>.</li>
<li><code>stop_on_failed=True</code> stops at the first failing line; read the state back after every change.</li>
<li>Use <code>raise_for_status()</code> before saving a backup.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> zyadatar network automation do kaamon se banta hai: configuration padhna (backup) aur badalna (push). scrapli ke saath dono kuch lines ke hain, aur dono mein Response object aapko imaandaar rakhta hai.</p>

<h3>Lab 1, task 5: backup.py</h3>
<p>Show command platform ke hisaab se alag hai (<code>show running-config</code>, Junos par <code>show configuration</code>). Sabse zaroori line <code>response.raise_for_status()</code> hai: yeh pakka karti hai ki reject hui command kabhi backup ban kar save na ho.</p>
<pre class="code">import os
from datetime import date

from common import collect

SHOW = {
    "cisco_iosxe": "show running-config",
    "arista_eos": "show running-config",
    "juniper_junos": "show configuration",
}
folder = f"backups/{date.today().isoformat()}"
os.makedirs(folder, exist_ok=True)


def job(row, conn):
    response = conn.send_command(SHOW[row["platform"]])
    response.raise_for_status()
    path = f"{folder}/{row['name']}.cfg"
    with open(path, "w") as f:
        f.write(response.result + "\\n")
    lines = len(response.result.splitlines())
    print(f"saved {row['name']:&lt;3} ({row['platform']}) {lines} lines -&gt; {path}")


collect(job)</pre>
<pre class="out">AUTO01$ python3 backup.py
saved R1  (cisco_iosxe) 68 lines -&gt; backups/2026-09-29/R1.cfg
<span class="hl">saved J1  (juniper_junos) 52 lines -&gt; backups/2026-09-29/J1.cfg</span>
saved E1  (arista_eos) 32 lines -&gt; backups/2026-09-29/E1.cfg
DEAD1  unreachable</pre>
<pre class="out">AUTO01$ ls -R backups
backups:
2026-09-29

backups/2026-09-29:
E1.cfg  J1.cfg  R1.cfg</pre>
<p>Highlighted line lab ke sawaal ka jawab hai: is lab mein J1 ki configuration 52 lines ki hai. File ka naam lab ki clock (<code>2026-09-29</code>) se aata hai, aur DEAD1 ki file nahi hai, kyunki use collect karna fail hua aur report hua. Yeh adv-nkmiko ke netmiko version jaisa hi behaviour hai, ek farak ke saath: netmiko version ko error text dhoondhna yaad rakhna padta tha; yahan library karti hai.</p>

<h3>send_configs: aapki lines ke aas-paas kya hota hai</h3>
`+e(t,`send_configs configuration mode mein jaata hai, har line ko alag command ki tarah bhejta hai, aur configuration mode se nikalta hai. Woh aapke liye commit kabhi nahi karta.`)+`
<p><code>send_configs(["line1", "line2"])</code> ek <b>list</b> leta hai. Har line ke liye ek <code>Response</code> lautata hai, jo <code>MultiResponse</code> mein jama hote hain. <code>send_config("line1\\nline2")</code> newlines wali ek string leta hai aur ek <code>Response</code> lautata hai. <code>send_configs</code> ko string do to <code>ScrapliTypeError</code> milta hai (Lab 2, fault 5). Dono methods <code>stop_on_failed</code> aur <code>failed_when_contains</code> accept karte hain. File mein rakhi configuration ke liye <code>send_configs_from_file</code> aur <code>send_config_from_file</code> bhi hain.</p>
<pre class="code">from scrapli import Scrapli

common = {"auth_username": "netops", "auth_password": "NK@2026", "auth_strict_key": False}
with Scrapli(platform="juniper_junos", host="10.99.0.11", **common) as j:
    no_commit = j.send_configs(["set system ntp server 10.99.0.62"])
    print(no_commit, "|", j.send_command("show configuration system ntp | display set").result)
    done = j.send_configs(["set system ntp server 10.99.0.62", "commit"])
    print(done, "|", j.send_command("show configuration system ntp | display set").result)
    bad = j.send_configs(["set system ntp server 10.99.0.63", "set bogus statement", "commit"], stop_on_failed=True)
    print(bad, [x.failed for x in bad])
    print(bad[1].result.strip())
    j.send_configs(["delete system ntp server 10.99.0.62", "commit"])

with Scrapli(platform="cisco_iosxe", host="10.99.0.1", auth_secondary="NK@2026", **common) as c:
    one = c.send_config("interface Loopback20\\n description from-send-config\\n ip address 20.20.20.20 255.255.255.255")
    print(one, one.failed)
    print(c.send_command("show running-config interface Loopback20").result)
    c.send_configs(["no interface Loopback20"])
    print(c.get_prompt())</pre>
<pre class="out">AUTO01$ python3 ch5.py
MultiResponse &lt;Success: True; Response Elements: 1&gt; | set system ntp server 10.99.0.60
MultiResponse &lt;Success: True; Response Elements: 2&gt; | set system ntp server 10.99.0.60
set system ntp server 10.99.0.62
MultiResponse &lt;Success: False; Response Elements: 2&gt; [False, True]
^
syntax error.
Response &lt;Success: True&gt; False
Building configuration...

Current configuration : 91 bytes
!
interface Loopback20
 description from-send-config
 ip address 20.20.20.20 255.255.255.255
end
PUN-CORE-R1#</pre>
<p>Pehli do lines dekho. <code>commit</code> ke bina Junos ka NTP server baad mein configuration mein <b>nahi</b> tha: lab configuration mode chhodte waqt uncommitted candidate discard kar deta hai. List ki aakhri line <code>commit</code> ho to server wahan hai, aur MultiResponse mein 2 elements hain. Phir <code>stop_on_failed=True</code> ke saath ek galat statement: MultiResponse failing line ke baad ruk jaata hai, <code>[False, True]</code>, aur failing Response mein Junos ka <code>syntax error</code> text hai. <code>commit</code> kabhi bheja hi nahi gaya, isliye kuch nahi badla. Aakhir mein IOS: teen lines ki ek string ke saath <code>send_config</code> ne ek Response diya, aur read-back loopback dikhata hai.</p>

<h3>Configuration ke platform niyam</h3>
<table class="cmp"><tr><th>Platform</th><th>Aapki list</th><th>Yaad rakho</th></tr>
<tr><td>IOS XE</td><td>plain configuration lines</td><td>turant apply; commit nahi; <code>copy running-config startup-config</code> alag <code>send_command</code> hai</td></tr>
<tr><td>Arista EOS</td><td>plain configuration lines</td><td>turant apply; config session ke andar <code>commit</code> ek line hai jo aap bhejte ho</td></tr>
<tr><td>Junos</td><td>set/delete lines, phir <code>commit</code></td><td><code>commit</code> nahi to badlaav nahi</td></tr></table>

<h3>Lab 1, task 6: push_ntp.py</h3>
<p>Script farak ko do dictionaries mein rakhti hai (kya bhejna hai, kya wapas padhna hai), <code>stop_on_failed=True</code> ke saath bhejti hai, aur akele flag par bharosa nahi karti: NTP configuration wapas padhti hai aur <code>present</code> ya <code>MISSING</code> report karti hai.</p>
<pre class="code">from common import collect

NTP = "10.99.0.62"
LINES = {
    "cisco_iosxe": [f"ntp server {NTP}"],
    "arista_eos": [f"ntp server {NTP}"],
    "juniper_junos": [f"set system ntp server {NTP}", "commit"],
}
READ = {
    "cisco_iosxe": "show running-config | include ntp",
    "arista_eos": "show running-config | include ntp",
    "juniper_junos": "show configuration system ntp | display set",
}


def job(row, conn):
    name, platform = row["name"], row["platform"]
    responses = conn.send_configs(LINES[platform], stop_on_failed=True)
    print(f"{name:&lt;3} {responses}")
    if responses.failed:
        print(f"{name:&lt;3} FAILED, state unknown, check by hand")
        return False
    shown = conn.send_command(READ[platform]).result
    ok = NTP in shown
    print(f"{name:&lt;3} {'present' if ok else 'MISSING'}: ntp server {NTP}")
    return ok


results = collect(job)
print(f"{sum(results.values())}/{len(results)} devices have ntp server {NTP}")</pre>
<pre class="out">AUTO01$ python3 push_ntp.py
R1  MultiResponse &lt;Success: True; Response Elements: 1&gt;
R1  present: ntp server 10.99.0.62
<span class="hl">J1  MultiResponse &lt;Success: True; Response Elements: 2&gt;</span>
<span class="hl">J1  present: ntp server 10.99.0.62</span>
E1  MultiResponse &lt;Success: True; Response Elements: 1&gt;
E1  present: ntp server 10.99.0.62
DEAD1  unreachable
3/3 devices have ntp server 10.99.0.62</pre>
<p>Ise dusri baar chalao to kuch nahi tootta, kyunki jo NTP server pehle se hai use jodne se kuch nahi badalta: script <b>idempotent</b> hai. Highlighted lines lab ke sawaal ka jawab hain: J1 ke MultiResponse mein 2 elements hain, <code>set</code> line aur <code>commit</code>. R1 aur E1 mein ek ek hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Junos par <code>commit</code> bhool jaana aur <code>Success: True</code> par bharosa karna. <code>send_configs</code> ko string dena. <code>raise_for_status()</code> ke bina backup save karna. Aisi device par <code>stop_on_failed</code> ke bina lambi list bhejna jahan line 3 line 2 par depend karti hai. Change ke baad state kabhi wapas na padhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_configs</code> IOS XE par configuration save nahi karta aur Junos par commit nahi karta. Dono aapka kaam hai. Success ka matlab sirf itna hai ki koi listed error string nahi aayi.</p></div>

<div class="scn"><h4>Tees routers, NTP nahi</h4><p>Ek change window ne tees Junos routers par <code>send_configs</code> se NTP server push kiya, <code>commit</code> ke bina. Script ne tees baar success print kiya. Agli subah time ab bhi galat tha. Fix list mein ek extra element tha, aur ek read-back jisne device ke <code>show configuration system ntp</code> ko intended server se compare kiya.</p><p><b>Lesson:</b> change tab khatam hota hai jab device kahe, tab nahi jab aapki script kahe.</p></div>

<div class="iv"><p class="q">"scrapli se configuration change surakshit tareeke se kaise push karte ho?"</p><p>Har platform ke liye lines ki list, <code>stop_on_failed=True</code> ke saath <code>send_configs</code>, Junos par explicit <code>commit</code>, jahan platform errors alag shabdon mein kahe wahan broader <code>failed_when_contains</code>, aur read-back jo asli state ko intent se compare kare. Script dobara chalane se kuch nahi badalna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_configs</code> list leta hai aur MultiResponse lautata hai; <code>send_config</code> ek string leta hai.</li>
<li>Woh configuration mode mein jaata aur nikalta hai, par commit ya save kabhi nahi karta.</li>
<li>Junos par list <code>commit</code> par khatam honi chahiye.</li>
<li><code>stop_on_failed=True</code> pehli failing line par rok deta hai; har change ke baad state wapas padho.</li>
<li>Backup save karne se pehle <code>raise_for_status()</code> use karo.</li>
</ul></div>
`}};export{n as default};