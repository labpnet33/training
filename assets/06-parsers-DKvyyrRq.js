var e={id:`parsers`,h:{en:`Structured parsers: dictionaries without counting columns`,hi:`Structured parsers: columns ginne ke bina dictionaries`},body:{en:`
<p>Splitting and regex put the work on <b>you</b>: you design every pattern, test it on every platform, and repair it after every upgrade. A <b>parser</b> moves that work to a maintained library. You give it the command name and the raw text; it returns a <b>dictionary</b> with named fields. This is the third and most robust method of the module, and the second half of lab 1 (<code>up2.py</code>).</p>
<h3>The idea: a library of patterns, indexed by command</h3>
<p>A parser library contains, for each command, patterns that were written and tested by many people on many software versions. You call one function:</p>
<p><code>data = parse("show ip interface brief", output)</code></p>
<p>and get a dictionary in a <b>known shape</b>. Your code then reads fields by name (<code>data["interface"]["Loopback0"]["ip_address"]</code>) instead of by position.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Parser pipeline"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Command</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">show ip interface brief</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Raw text</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">one string</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">parse()</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">command name plus text</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Dictionary</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">named fields</text></svg><p class="cap">Parser pipeline</p></div>
<h3>The real tools you will meet</h3>
<table class="cmp"><tr><th>Tool</th><th>Style</th><th>Typical use</th></tr><tr><td>Genie parsers (pyATS)</td><td>Python classes, returns nested dictionaries</td><td>Test frameworks, large Cisco coverage</td></tr><tr><td>TextFSM with ntc-templates</td><td>Template files, returns a list of dictionaries</td><td>Netmiko <code>use_textfsm=True</code></td></tr><tr><td>TTP</td><td>Your own simple templates</td><td>Custom outputs</td></tr></table>
<p>In the lab you use the simulator's library <code>nkparse</code>, which behaves like a Genie-style parser: the function is <code>parse(command, output)</code>. The real tools above are <b>reference code, not run in the simulator</b>:</p>
<p><i>Reference code (not run in the simulator).</i></p><pre class="code"># Genie / pyATS (Genie-style dictionary)
# parsed = device.parse("show ip interface brief")

# Netmiko with TextFSM templates (list of dictionaries)
# rows = conn.send_command("show ip interface brief", use_textfsm=True)

# ntc-templates directly
# from ntc_templates.parse import parse_output
# rows = parse_output(platform="cisco_ios", command="show ip interface brief", data=raw)</pre>
<h3>The lab library in action</h3>
<p>Here is the lab call on router MUM-R1. The script logs in over SSH, gets the output string, and passes the command name and the text to <code>parse</code>. Compare it with the dozens of lines you would need for split or regex.</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse
import json

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
output = conn.send_command("show ip interface brief")
conn.disconnect()

data = parse("show ip interface brief", output)
print(list(data.keys()))
print(list(data["interface"].keys()))
print(json.dumps(data["interface"]["GigabitEthernet0/3"], indent=2))</pre><p><i>Run in the lab terminal (it uses the lab routers). Output captured from the simulator.</i></p><pre class="out">['interface']
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Loopback0']
{
  "ip_address": "unassigned",
  "interface_is_ok": "YES",
  "method": "unset",
  "status": "administratively down",
  "protocol": "down"
}</pre>
<p>Read the shape. The top of the dictionary has one key, <code>interface</code>. Inside it is one entry <b>per interface</b>, keyed by the interface name. Each entry is a small dictionary with the same field names every time: <code>ip_address</code>, <code>interface_is_ok</code>, <code>method</code>, <code>status</code> and <code>protocol</code>. Notice that <code>status</code> for the administratively-down port is <code>administratively down</code>, <b>one</b> value. The parser solved the two-word problem for you.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="The shape of the parsed data"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">data</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">dictionary</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">interface</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">one key</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">GigabitEthernet0</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">3/one entry per interface</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">status, protocol</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">named fields</text></svg><p class="cap">The shape of the parsed data</p></div>
<h3>Walking the dictionary</h3>
<p>Everything from the earlier chapters applies: <code>.items()</code> gives key and value pairs, <code>if</code> filters. This example uses a small dictionary in the same shape, so you can run it anywhere.</p>
<pre class="code">data = {"interface": {
    "GigabitEthernet0/0": {"ip_address": "10.99.0.1", "status": "up", "protocol": "up"},
    "GigabitEthernet0/2": {"ip_address": "10.50.0.1", "status": "down", "protocol": "down"},
    "GigabitEthernet0/3": {"ip_address": "unassigned", "status": "administratively down", "protocol": "down"},
    "Loopback0": {"ip_address": "1.1.1.1", "status": "up", "protocol": "up"},
}}

for intf, info in data["interface"].items():
    if info["status"] == "up" and info["protocol"] == "up":
        print(f"{intf:&lt;22}{info['ip_address']}")

shut = [n for n, i in data["interface"].items() if i["status"] == "administratively down"]
print("Shut by an engineer:", shut)
print("Total interfaces:", len(data["interface"]))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">GigabitEthernet0/0    10.99.0.1
Loopback0             1.1.1.1
Shut by an engineer: ['GigabitEthernet0/3']
Total interfaces: 4</pre>
<p>The first loop is the heart of <code>up2.py</code>. The list comprehension shows how easy the <b>admin-down</b> question becomes with named fields.</p>
<h3>Finishing up2.py</h3>
<p>The lab file <code>up2.py</code> starts with <code>data = {}</code> and a TODO. With an empty dictionary the loop asks for <code>data["interface"]</code> and crashes with <code>KeyError: 'interface'</code>. Replacing the line with <code>data = parse("show ip interface brief", output)</code> fixes it, and the script prints each up/up interface with its IP. This is the real lab output of the finished script:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

ROUTERS = {"MUM-R1": "10.99.0.1", "MUM-R2": "10.99.0.2"}

for name, ip in ROUTERS.items():
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    output = conn.send_command("show ip interface brief")
    conn.disconnect()
    data = parse("show ip interface brief", output)
    print(f"=== {name} ===")
    for intf, info in data["interface"].items():
        if info["status"] == "up" and info["protocol"] == "up":
            print(f"{intf:&lt;22}{info['ip_address']}")</pre><p><i>Run in the lab terminal (it uses the lab routers). Output captured from the simulator.</i></p><pre class="out">=== MUM-R1 ===
GigabitEthernet0/0    10.99.0.1
GigabitEthernet0/1    10.12.0.1
Loopback0             1.1.1.1
=== MUM-R2 ===
GigabitEthernet0/0    10.99.0.2
GigabitEthernet0/1    10.12.0.2
Loopback0             2.2.2.2
Loopback1             22.22.22.22</pre>
<p>Count the answer to the lab question: on MUM-R2 the up/up interfaces are GigabitEthernet0/0, GigabitEthernet0/1, Loopback0 and Loopback1, which is <b>4</b>. GigabitEthernet0/2 is administratively down and GigabitEthernet0/3 is unassigned and down.</p>
<h3>Other commands, same idea</h3>
<p>The same call parses other commands. For <code>show version</code> it returns hostname, version, uptime and serial under the key <code>version</code>:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
output = conn.send_command("show version")
conn.disconnect()
print(parse("show version", output))</pre><p><i>Run in the lab terminal (it uses the lab routers). Output captured from the simulator.</i></p><pre class="out">{'version': {'version': '2.0', 'hostname': 'BLR-CORE', 'uptime': '0 minutes', 'chassis_sn': 'NK3C15U4X00', 'chassis': None}}</pre>
<p>A command without a parser stops with a clear error, so you know to fall back to regex:</p>
<pre class="code">from nkparse import parse

try:
    parse("show clock", "10:00:00.000 UTC Fri Oct 2 2026")
except ValueError as e:
    print("ValueError:", e)</pre><p><i>Run in the lab terminal (it uses the lab routers). Output captured from the simulator.</i></p><pre class="out">ValueError: no parser for 'show clock' (available: show ip interface brief, show ip ospf neighbor, show ip bgp summary, show ip route, show version, show vlan brief)</pre>
<h3>Parser or regex?</h3>
<p>Prefer a <b>parser</b> when one exists for your command and platform: it is tested, and your code reads fields by name. Use <b>regex</b> for one-off outputs or custom commands with no template. Use <b>split</b> only for the simplest tables. Whatever you choose, still check that the result contains what you expect.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Assuming a parser exists for every command; it raises an error or returns nothing otherwise. (2) Forgetting that a parser is tied to a platform and version family. (3) Reading fields that are missing in some outputs; use <code>.get()</code> for optional fields. (4) Not checking an empty result, which looks like "no interfaces" instead of "parse failed".</p></div>
<div class="exam"><p><b>Exam trap.</b> Genie returns nested dictionaries; TextFSM returns a list of dictionaries (one per row). A structured API such as RESTCONF is still preferred over parsing when it is available.</p></div>
<div class="scn"><h4>Replacing 400 lines of regex</h4><p>A team maintained a 400-line file of regex patterns for ten show commands. Each software upgrade broke two or three. They moved to a parser library for the common commands, kept regex only for two custom outputs, and added a small test that parses a saved sample of every command after each upgrade. Maintenance dropped from days to an hour.</p>
<p><b>Lesson:</b> let a maintained library carry the parsing, and test it on saved real output.</p></div>
<div class="iv"><p class="q">"What is the advantage of using a parser such as Genie or TextFSM over your own regex?"</p><p>A parser library holds tested patterns for many commands, platforms and versions, and returns data in a consistent structure with named fields, so my code does not depend on column positions. It is easier to maintain after upgrades. I still validate that the result is not empty, and I fall back to regex only for commands the library does not cover.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A parser takes the command name and raw text and returns a dictionary or list of dictionaries.</li>
<li>Lab <code>parse("show ip interface brief", output)</code> returns <code>data["interface"][name][field]</code>.</li>
<li>Fields are read by name, so the two-word status is no longer a problem.</li>
<li>Genie returns nested dictionaries; TextFSM returns a list of row dictionaries.</li>
<li>Check that the parse worked and fall back to regex for commands without a parser.</li>
</ul></div>
`,hi:`
<p>Split aur regex kaam <b>aap</b> par daalte hain: aap har pattern design karte ho, har platform par test karte ho, aur har upgrade ke baad repair karte ho. <b>Parser</b> woh kaam maintained library ko de deta hai. Aap use command ka naam aur raw text dete ho; woh named fields wali <b>dictionary</b> return karta hai. Yeh module ka teesra aur sabse mazboot method hai, aur lab 1 (<code>up2.py</code>) ka doosra hissa.</p>
<h3>Idea: command ke hisaab se patterns ki library</h3>
<p>Parser library mein har command ke liye aise patterns hote hain jo bahut logon ne bahut software versions par likhe aur test kiye. Aap ek function call karte ho:</p>
<p><code>data = parse("show ip interface brief", output)</code></p>
<p>aur ek <b>jaane-pehchane shape</b> wali dictionary milti hai. Phir aapka code fields ko position se nahi, naam se padhta hai (<code>data["interface"]["Loopback0"]["ip_address"]</code>).</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Parser pipeline"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Command</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">show ip interface brief</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Raw text</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">ek string</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">parse()</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">command naam aur text</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Dictionary</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">named fields</text></svg><p class="cap">Parser pipeline</p></div>
<h3>Asli tools jinse aap milenge</h3>
<table class="cmp"><tr><th>Tool</th><th>Style</th><th>Aam use</th></tr><tr><td>Genie parsers (pyATS)</td><td>Python classes, nested dictionaries deta hai</td><td>Test frameworks, bada Cisco coverage</td></tr><tr><td>TextFSM aur ntc-templates</td><td>Template files, dictionaries ki list deta hai</td><td>Netmiko <code>use_textfsm=True</code></td></tr><tr><td>TTP</td><td>Aapke apne simple templates</td><td>Custom outputs</td></tr></table>
<p>Lab mein aap simulator ki library <code>nkparse</code> use karte ho, jo Genie-style parser ki tarah chalti hai: function <code>parse(command, output)</code> hai. Upar ke asli tools <b>reference code hain, simulator mein nahi chalte</b>:</p>
<p><i>Reference code (simulator mein nahi chalta).</i></p><pre class="code"># Genie / pyATS (Genie-style dictionary)
# parsed = device.parse("show ip interface brief")

# Netmiko with TextFSM templates (list of dictionaries)
# rows = conn.send_command("show ip interface brief", use_textfsm=True)

# ntc-templates directly
# from ntc_templates.parse import parse_output
# rows = parse_output(platform="cisco_ios", command="show ip interface brief", data=raw)</pre>
<h3>Lab library kaam mein</h3>
<p>Yeh router MUM-R1 par lab call hai. Script SSH se login karti hai, output string leti hai, aur command ka naam aur text <code>parse</code> ko deti hai. Ise split ya regex ke liye lagne wali darjano lines se compare karo.</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse
import json

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
output = conn.send_command("show ip interface brief")
conn.disconnect()

data = parse("show ip interface brief", output)
print(list(data.keys()))
print(list(data["interface"].keys()))
print(json.dumps(data["interface"]["GigabitEthernet0/3"], indent=2))</pre><p><i>Lab terminal mein chalaya (lab routers use hote hain). Output simulator se liya gaya.</i></p><pre class="out">['interface']
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Loopback0']
{
  "ip_address": "unassigned",
  "interface_is_ok": "YES",
  "method": "unset",
  "status": "administratively down",
  "protocol": "down"
}</pre>
<p>Shape padho. Dictionary ke top par ek key hai, <code>interface</code>. Uske andar <b>har interface ke liye ek entry</b> hai, interface ke naam se keyed. Har entry ek chhoti dictionary hai jisme har baar wahi field names hain: <code>ip_address</code>, <code>interface_is_ok</code>, <code>method</code>, <code>status</code> aur <code>protocol</code>. Dhyaan do ki administratively-down port ka <code>status</code> <code>administratively down</code> hai, <b>ek</b> value. Parser ne do-shabd problem aapke liye solve kar di.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Parse kiye data ka shape"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">data</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">dictionary</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">interface</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">ek key</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">GigabitEthernet0</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">3/har interface ki ek entry</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">status, protocol</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">named fields</text></svg><p class="cap">Parse kiye data ka shape</p></div>
<h3>Dictionary par chalna</h3>
<p>Pichhle chapters ki sab baatein lagu hain: <code>.items()</code> key aur value ki jodiyan deta hai, <code>if</code> filter karta hai. Yeh example usi shape ki chhoti dictionary use karta hai, taaki kahin bhi chal sake.</p>
<pre class="code">data = {"interface": {
    "GigabitEthernet0/0": {"ip_address": "10.99.0.1", "status": "up", "protocol": "up"},
    "GigabitEthernet0/2": {"ip_address": "10.50.0.1", "status": "down", "protocol": "down"},
    "GigabitEthernet0/3": {"ip_address": "unassigned", "status": "administratively down", "protocol": "down"},
    "Loopback0": {"ip_address": "1.1.1.1", "status": "up", "protocol": "up"},
}}

for intf, info in data["interface"].items():
    if info["status"] == "up" and info["protocol"] == "up":
        print(f"{intf:&lt;22}{info['ip_address']}")

shut = [n for n, i in data["interface"].items() if i["status"] == "administratively down"]
print("Shut by an engineer:", shut)
print("Total interfaces:", len(data["interface"]))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">GigabitEthernet0/0    10.99.0.1
Loopback0             1.1.1.1
Shut by an engineer: ['GigabitEthernet0/3']
Total interfaces: 4</pre>
<p>Pehla loop <code>up2.py</code> ka dil hai. List comprehension dikhata hai ki named fields ke saath <b>admin-down</b> ka sawaal kitna aasaan ho jaata hai.</p>
<h3>up2.py poora karna</h3>
<p>Lab file <code>up2.py</code> <code>data = {}</code> aur ek TODO se shuru hoti hai. Khaali dictionary ke saath loop <code>data["interface"]</code> maangta hai aur <code>KeyError: 'interface'</code> se crash hota hai. Us line ko <code>data = parse("show ip interface brief", output)</code> se badalne par fix ho jaata hai, aur script har up/up interface ko uske IP ke saath print karti hai. Poori ki hui script ka asli lab output yeh hai:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

ROUTERS = {"MUM-R1": "10.99.0.1", "MUM-R2": "10.99.0.2"}

for name, ip in ROUTERS.items():
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    output = conn.send_command("show ip interface brief")
    conn.disconnect()
    data = parse("show ip interface brief", output)
    print(f"=== {name} ===")
    for intf, info in data["interface"].items():
        if info["status"] == "up" and info["protocol"] == "up":
            print(f"{intf:&lt;22}{info['ip_address']}")</pre><p><i>Lab terminal mein chalaya (lab routers use hote hain). Output simulator se liya gaya.</i></p><pre class="out">=== MUM-R1 ===
GigabitEthernet0/0    10.99.0.1
GigabitEthernet0/1    10.12.0.1
Loopback0             1.1.1.1
=== MUM-R2 ===
GigabitEthernet0/0    10.99.0.2
GigabitEthernet0/1    10.12.0.2
Loopback0             2.2.2.2
Loopback1             22.22.22.22</pre>
<p>Lab ke sawaal ka jawab ginti karo: MUM-R2 par up/up interfaces GigabitEthernet0/0, GigabitEthernet0/1, Loopback0 aur Loopback1 hain, jo <b>4</b> hain. GigabitEthernet0/2 administratively down hai aur GigabitEthernet0/3 unassigned aur down.</p>
<h3>Doosre commands, wahi idea</h3>
<p>Wahi call doosre commands parse karti hai. <code>show version</code> ke liye woh key <code>version</code> ke neeche hostname, version, uptime aur serial deti hai:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkparse import parse

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
output = conn.send_command("show version")
conn.disconnect()
print(parse("show version", output))</pre><p><i>Lab terminal mein chalaya (lab routers use hote hain). Output simulator se liya gaya.</i></p><pre class="out">{'version': {'version': '2.0', 'hostname': 'BLR-CORE', 'uptime': '0 minutes', 'chassis_sn': 'NK3C15U4X00', 'chassis': None}}</pre>
<p>Jis command ka parser nahi, woh saaf error ke saath ruk jaata hai, taaki aap jaano ki regex par wapas jaana hai:</p>
<pre class="code">from nkparse import parse

try:
    parse("show clock", "10:00:00.000 UTC Fri Oct 2 2026")
except ValueError as e:
    print("ValueError:", e)</pre><p><i>Lab terminal mein chalaya (lab routers use hote hain). Output simulator se liya gaya.</i></p><pre class="out">ValueError: no parser for 'show clock' (available: show ip interface brief, show ip ospf neighbor, show ip bgp summary, show ip route, show version, show vlan brief)</pre>
<h3>Parser ya regex?</h3>
<p>Jab aapke command aur platform ke liye <b>parser</b> ho to use pasand karo: woh tested hai, aur aapka code fields ko naam se padhta hai. Ek-baar ke outputs ya bina template ke custom commands ke liye <b>regex</b> use karo. <b>Split</b> sirf sabse simple tables ke liye. Jo bhi chuno, phir bhi check karo ki result mein wahi hai jo umeed thi.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Maan lena ki har command ke liye parser hai; warna error aati hai ya kuch return nahi hota. (2) Yeh bhoolna ki parser platform aur version family se bandha hai. (3) Aise fields padhna jo kuch outputs mein missing hain; optional fields ke liye <code>.get()</code> use karo. (4) Khaali result check na karna, jo "parse fail hua" ki jagah "koi interface nahi" jaisa dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Genie nested dictionaries deta hai; TextFSM dictionaries ki list (har row ke liye ek). RESTCONF jaisi structured API ab bhi parsing se behtar hai jab available ho.</p></div>
<div class="scn"><h4>400 lines ke regex ki jagah</h4><p>Ek team das show commands ke liye 400 lines ki regex patterns ki file maintain karti thi. Har software upgrade do-teen ko tod deta tha. Unhone common commands ke liye parser library apnayi, regex sirf do custom outputs ke liye rakha, aur har upgrade ke baad har command ke saved sample ko parse karne wali chhoti test jodi. Maintenance dino se ghante par aa gayi.</p>
<p><b>Lesson:</b> parsing maintained library ko uthane do, aur use saved asli output par test karo.</p></div>
<div class="iv"><p class="q">"Apne regex ki jagah Genie ya TextFSM jaise parser ka kya fayda hai?"</p><p>Parser library mein kai commands, platforms aur versions ke tested patterns hote hain, aur woh consistent structure mein named fields wala data deti hai, isliye mera code column positions par nirbhar nahi. Upgrades ke baad maintain karna aasaan hai. Phir bhi main check karta hoon ki result khaali nahi hai, aur regex par sirf un commands ke liye jaata hoon jinhe library cover nahi karti.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parser command ka naam aur raw text leta hai aur dictionary ya dictionaries ki list deta hai.</li>
<li>Lab <code>parse("show ip interface brief", output)</code> <code>data["interface"][name][field]</code> deta hai.</li>
<li>Fields naam se padhe jaate hain, isliye do-shabd status ab problem nahi.</li>
<li>Genie nested dictionaries deta hai; TextFSM row dictionaries ki list.</li>
<li>Check karo ki parse chala aur parser na ho to regex par jao.</li>
</ul></div>
`}};export{e as default};