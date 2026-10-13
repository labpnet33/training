var e={id:`structured-output`,h:{en:`Structured output with ntc-templates on four vendors`,hi:`Chaar vendors par ntc-templates se structured output`},body:{en:`
<p><b>The idea of this chapter:</b> text is for humans, rows are for scripts. <code>use_textfsm=True</code> turns a show command's text into a list of dictionaries. It worked for you on IOS in Program 1. On four vendors the call is the same, but the <b>key names</b> and the <b>values</b> are not, and that is what breaks multivendor tables.</p>

<h3>Analogy: pigeonholes in a post office</h3>
<p>Raw output is a sack of letters. A TextFSM template is the sorting rule: "everything that looks like an address goes into hole <code>ip_address</code>". The <code>ntc-templates</code> project ships hundreds of ready-made rules, one per platform and command. netmiko finds the right file from the pair (<code>device_type</code>, command), for example <code>cisco_ios</code> plus <code>show ip interface brief</code>. Different platform, different rule, different hole names.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="From raw text to rows through a template chosen by platform and command">
<rect x="10" y="35" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="75" y="60" text-anchor="middle" class="svg-ink" font-size="12">raw show output</text><text x="75" y="78" text-anchor="middle" class="svg-muted" font-size="10">one string</text>
<rect x="190" y="10" width="190" height="52" rx="8" fill="#fde68a"/><text x="285" y="33" text-anchor="middle" class="svg-ink" font-size="12">template lookup</text><text x="285" y="50" text-anchor="middle" class="svg-muted" font-size="10">(device_type, command)</text>
<rect x="190" y="78" width="190" height="52" rx="8" fill="#bae6fd"/><text x="285" y="101" text-anchor="middle" class="svg-ink" font-size="12">TextFSM engine</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="10">state machine over lines</text>
<rect x="430" y="35" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="12">list of dictionaries</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="10">or the raw string if no template</text>
<line x1="140" y1="65" x2="190" y2="36" stroke="#64748b" stroke-width="2"/><line x1="140" y1="65" x2="190" y2="104" stroke="#64748b" stroke-width="2"/><line x1="285" y1="62" x2="285" y2="78" stroke="#64748b" stroke-width="2"/><line x1="380" y1="104" x2="430" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The platform and the command choose the template. No template means you get the original string back.</p></div>

<h3>Refresher in four lines (py-textfsm)</h3>
<pre class="code">rows = conn.send_command("show ip interface brief", use_textfsm=True)
if isinstance(rows, str):                  <span class="c"># no template: the raw text came back</span>
    raise SystemExit("no template for this platform and command")
print(rows[0])                             <span class="c"># always look at one row first</span></pre>
<p>If you need a rule that ntc-templates does not have, pass your own file with <code>textfsm_template="my.textfsm"</code>. Writing templates is covered in py-textfsm.</p>

<h3>Same command, three different answers</h3>
<p>A short script (<code>ch5.py</code>) connects to each platform, runs <code>show ip interface brief</code> with <code>use_textfsm=True</code> and prints the type, the keys and the first row.</p>
<pre class="out">AUTO01$ python3 ch5.py
cisco_ios list 4
  keys: ['interface', 'ip_address', 'status', 'proto']
  row : {'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}
cisco_nxos list 1
  keys: ['vrf', 'interface', 'ip_address', 'status', 'link', 'proto']
  row : {'vrf': 'default', 'interface': 'Eth1/1', 'ip_address': '10.99.0.31', <span class="hl">'status': 'admin-up', 'link': 'link-up', 'proto': 'protocol-up'</span>}
arista_eos list 1
  keys: ['interface', 'ip_address', 'status', <span class="hl">'protocol'</span>, 'mtu']
  row : {'interface': 'Ethernet1', <span class="hl">'ip_address': '10.99.0.21/24'</span>, 'status': 'up', 'protocol': 'up', 'mtu': '1500'}</pre>
<table class="cmp"><tr><th>Platform</th><th>Keys</th><th>What to watch</th></tr>
<tr><td><code>cisco_ios</code></td><td>interface, ip_address, status, <b>proto</b></td><td>status and proto are <code>up</code> or <code>down</code></td></tr>
<tr><td><code>cisco_nxos</code></td><td>vrf, interface, ip_address, status, link, <b>proto</b></td><td>values are words like <code>admin-up</code>, <code>link-up</code>, <code>protocol-up</code></td></tr>
<tr><td><code>arista_eos</code></td><td>interface, ip_address, status, <b>protocol</b>, mtu</td><td>the address carries its prefix length: <code>10.99.0.21/24</code></td></tr></table>
<p>Three vendors, one question, three vocabularies. A script that reads <code>row["proto"]</code> works on IOS and NX-OS and dies with <code>KeyError: 'proto'</code> on EOS. Meanwhile some commands agree: <code>show vlan</code> gives <code>vlan_id</code>, <code>vlan_name</code>, <code>status</code> and <code>interfaces</code> on both EOS and NX-OS. Never assume; print one row per platform when you add a command.</p>

<h3>Junos: when the template does not fit</h3>
<p>The script <code>ch5b.py</code> makes four calls on J1 inside <code>try/except TextFSMError</code> and prints what each returned (the first five lines are shown).</p>
<pre class="out">AUTO01$ python3 ch5b.py
<span class="hl">TextFSMError: State Error raised. Rule Line: ^. -&gt; Error Line: Interface               Admin Link Proto</span>
str 17 lines
list 2
NK7R3DC4X00 VMX
str</pre>
<p>Reading the lines: <code>show interfaces terse</code> raised <code>TextFSMError</code> in the lab (the real template and the lab's Junos output disagree), the raw text has 17 lines, <code>show chassis hardware</code> parsed into 2 rows with keys such as <code>chassis_serial_number</code>, and <code>show arp</code> had no template, so a plain string came back. Three outcomes, three ways to fail: <b>rows</b>, <b>string</b> and <b>exception</b>. Handle all three. On a real Junos box the shipped terse template normally works; print one row before you trust it.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab runs the real ntc-templates files (version 9.3.0 subset), so key names are real. Some lab device outputs do not match their template (for example Junos <code>show interfaces terse</code> here); a real device would return rows. Newer and older ntc-templates versions name keys differently (older ones used <code>intf</code> and <code>ipaddr</code>); pin the version in <code>requirements.txt</code>.</p></div>

<h3>Lab 1, task 4: one table from four vendors</h3>
<p>The cure for different vocabularies is a <b>normaliser</b> per platform that returns the same four fields: device, interface, ip, state. The "is it up?" rule is data (a dictionary of small functions), and Junos, where no template is used, is parsed with a regular expression.</p>
<pre class="code"><span class="c"># interfaces.py (core)</span>
CMD = {
    "cisco_ios": "show ip interface brief",
    "cisco_nxos": "show ip interface brief",
    "arista_eos": "show ip interface brief",
    "juniper_junos": "show interfaces terse",
}
IS_UP = {
    "cisco_ios": lambda r: r["status"] == "up" and r["proto"] == "up",
    "cisco_nxos": lambda r: r["link"] == "link-up" and r["proto"] == "protocol-up",
    "arista_eos": lambda r: r["status"] == "up" and r["protocol"] == "up",
}
JUNOS = re.compile(r"^(\\S+)\\s+(up|down)\\s+(up|down)\\s+inet\\s+(\\S+)")


def interface_rows(row, conn):
    kind = row["device_type"]
    out = []
    if kind == "juniper_junos":
        for line in conn.send_command(CMD[kind]).splitlines():
            m = JUNOS.match(line)
            if m:
                state = "up" if m.group(2) == "up" and m.group(3) == "up" else "down"
                out.append([row["name"], m.group(1), m.group(4).split("/")[0], state])
        return out
    for r in conn.send_command(CMD[kind], use_textfsm=True):
        if r["ip_address"] in ("", "unassigned"):
            continue
        state = "up" if IS_UP[kind](r) else "down"
        out.append([row["name"], r["interface"], r["ip_address"].split("/")[0], state])
    return out</pre>
<pre class="out">AUTO01$ python3 interfaces.py
device    interface           ip          state
--------  ------------------  ----------  -------
R1        GigabitEthernet0/0  10.99.0.1   up
J1        ge-0/0/0.0          10.99.0.11  up
E1        Ethernet1           10.99.0.21  up
N1        Eth1/1              10.99.0.31  up
<span class="hl">4 interfaces written to interfaces.csv</span></pre>
<p>The full file also loops over the inventory and writes <code>interfaces.csv</code> with the <code>csv</code> module; the hint in Lab 1 has the whole script. Notice what the normaliser did: it dropped the prefix from the EOS address, mapped three different "up" spellings to one, and ignored interfaces without an IP.</p>

<div class="warn"><p><b>Common mistakes.</b> Assuming the same keys on every platform. Treating the return value as a list when a string came back (<code>TypeError: string indices must be integers</code>). Catching <code>TextFSMError</code> with a bare <code>except</code> and returning an empty table. Upgrading ntc-templates without re-checking the keys.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>use_textfsm=True</code> returns a list of dictionaries when a template matches, the raw string when no template exists, and raises when a template exists but does not match the output.</p></div>

<div class="scn"><h4>The dashboard that went blank after an upgrade</h4><p>After a routine <code>pip upgrade</code>, an inventory dashboard showed zero interfaces for every Arista switch. The new ntc-templates release had renamed a key, the script used <code>row.get("intf")</code>, and <code>get</code> returned <code>None</code> without any error.</p><p><b>Lesson:</b> pin the library version, read keys with <code>row["key"]</code> so a rename fails loudly, and add one test that parses a saved sample output per platform.</p></div>

<div class="iv"><p class="q">"How do you build one report across Cisco, Arista and Juniper?"</p><p>I parse each platform with its own template (or a regex where none exists), then run a small normaliser that maps vendor-specific keys and values to one schema: device, interface, address, state. The platform differences live in dictionaries, so adding a vendor means adding entries, not rewriting the loop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template = (platform, command); the keys are different for each platform.</li>
<li>Three outcomes: rows, raw string (no template), <code>TextFSMError</code> (no match).</li>
<li>IOS and NX-OS say <code>proto</code>, EOS says <code>protocol</code>; EOS addresses carry <code>/24</code>; NX-OS states are words like <code>link-up</code>.</li>
<li>Normalise into one schema; keep the vendor rules in dictionaries.</li>
<li>Pin ntc-templates and print one row per platform before you trust a key.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> text insaanon ke liye hai, rows scripts ke liye. <code>use_textfsm=True</code> show command ke text ko dictionaries ki list bana deta hai. Program 1 mein IOS par yeh aapke liye chala tha. Chaar vendors par call wahi hai, par <b>key names</b> aur <b>values</b> wahi nahi, aur multivendor tables isi se tootti hain.</p>

<h3>Analogy: post office ke pigeonholes</h3>
<p>Raw output chitthiyon ka bora hai. TextFSM template chhantne ka niyam hai: "jo address jaisa dikhe woh hole <code>ip_address</code> mein jaye". <code>ntc-templates</code> project sainkdon ready-made niyam deta hai, har platform aur command ke liye ek. netmiko sahi file (<code>device_type</code>, command) ki jodi se dhoondhta hai, jaise <code>cisco_ios</code> aur <code>show ip interface brief</code>. Alag platform, alag niyam, alag hole ke naam.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="From raw text to rows through a template chosen by platform and command">
<rect x="10" y="35" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="75" y="60" text-anchor="middle" class="svg-ink" font-size="12">raw show output</text><text x="75" y="78" text-anchor="middle" class="svg-muted" font-size="10">ek string</text>
<rect x="190" y="10" width="190" height="52" rx="8" fill="#fde68a"/><text x="285" y="33" text-anchor="middle" class="svg-ink" font-size="12">template lookup</text><text x="285" y="50" text-anchor="middle" class="svg-muted" font-size="10">(device_type, command)</text>
<rect x="190" y="78" width="190" height="52" rx="8" fill="#bae6fd"/><text x="285" y="101" text-anchor="middle" class="svg-ink" font-size="12">TextFSM engine</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="10">lines par state machine</text>
<rect x="430" y="35" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="12">dictionaries ki list</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="10">template na ho to raw string</text>
<line x1="140" y1="65" x2="190" y2="36" stroke="#64748b" stroke-width="2"/><line x1="140" y1="65" x2="190" y2="104" stroke="#64748b" stroke-width="2"/><line x1="285" y1="62" x2="285" y2="78" stroke="#64748b" stroke-width="2"/><line x1="380" y1="104" x2="430" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Platform aur command template chunte hain. Template na ho to original string wapas milti hai.</p></div>

<h3>Chaar lines mein refresher (py-textfsm)</h3>
<pre class="code">rows = conn.send_command("show ip interface brief", use_textfsm=True)
if isinstance(rows, str):                  <span class="c"># template nahi: raw text wapas aaya</span>
    raise SystemExit("no template for this platform and command")
print(rows[0])                             <span class="c"># hamesha pehle ek row dekho</span></pre>
<p>Jo niyam ntc-templates mein nahi hai woh chahiye to apni file <code>textfsm_template="my.textfsm"</code> se do. Template likhna py-textfsm mein hai.</p>

<h3>Wahi command, teen alag jawab</h3>
<p>Ek chhoti script (<code>ch5.py</code>) har platform se connect karti hai, <code>use_textfsm=True</code> ke saath <code>show ip interface brief</code> chalati hai aur type, keys aur pehli row print karti hai.</p>
<pre class="out">AUTO01$ python3 ch5.py
cisco_ios list 4
  keys: ['interface', 'ip_address', 'status', 'proto']
  row : {'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}
cisco_nxos list 1
  keys: ['vrf', 'interface', 'ip_address', 'status', 'link', 'proto']
  row : {'vrf': 'default', 'interface': 'Eth1/1', 'ip_address': '10.99.0.31', <span class="hl">'status': 'admin-up', 'link': 'link-up', 'proto': 'protocol-up'</span>}
arista_eos list 1
  keys: ['interface', 'ip_address', 'status', <span class="hl">'protocol'</span>, 'mtu']
  row : {'interface': 'Ethernet1', <span class="hl">'ip_address': '10.99.0.21/24'</span>, 'status': 'up', 'protocol': 'up', 'mtu': '1500'}</pre>
<table class="cmp"><tr><th>Platform</th><th>Keys</th><th>Kya dekhna hai</th></tr>
<tr><td><code>cisco_ios</code></td><td>interface, ip_address, status, <b>proto</b></td><td>status aur proto <code>up</code> ya <code>down</code> hote hain</td></tr>
<tr><td><code>cisco_nxos</code></td><td>vrf, interface, ip_address, status, link, <b>proto</b></td><td>values <code>admin-up</code>, <code>link-up</code>, <code>protocol-up</code> jaise shabd hain</td></tr>
<tr><td><code>arista_eos</code></td><td>interface, ip_address, status, <b>protocol</b>, mtu</td><td>address prefix length ke saath aata hai: <code>10.99.0.21/24</code></td></tr></table>
<p>Teen vendors, ek sawaal, teen shabdkosh. Jo script <code>row["proto"]</code> padhti hai woh IOS aur NX-OS par chalti hai aur EOS par <code>KeyError: 'proto'</code> se mar jaati hai. Dusri taraf kuch commands ek jaisi hain: <code>show vlan</code> EOS aur NX-OS dono par <code>vlan_id</code>, <code>vlan_name</code>, <code>status</code> aur <code>interfaces</code> deta hai. Kabhi maan mat lo; nayi command jodte waqt har platform ki ek row print karo.</p>

<h3>Junos: jab template fit nahi hota</h3>
<p>Script <code>ch5b.py</code> J1 par chaar calls <code>try/except TextFSMError</code> ke andar karti hai aur har ek ka natija print karti hai (pehli paanch lines dikhayi hain).</p>
<pre class="out">AUTO01$ python3 ch5b.py
<span class="hl">TextFSMError: State Error raised. Rule Line: ^. -&gt; Error Line: Interface               Admin Link Proto</span>
str 17 lines
list 2
NK7R3DC4X00 VMX
str</pre>
<p>Lines padho: <code>show interfaces terse</code> ne lab mein <code>TextFSMError</code> uthaya (asli template aur lab ke Junos output mein tal-mel nahi), raw text 17 lines ka hai, <code>show chassis hardware</code> 2 rows mein parse hua jinke keys <code>chassis_serial_number</code> jaise hain, aur <code>show arp</code> ka template nahi tha, isliye plain string aayi. Teen natije, fail hone ke teen tareeke: <b>rows</b>, <b>string</b> aur <b>exception</b>. Teeno sambhalo. Asli Junos box par terse ka shipped template aam taur par chalta hai; bharosa karne se pehle ek row print karo.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab asli ntc-templates files (version 9.3.0 subset) chalata hai, isliye key names asli hain. Kuch lab device outputs apne template se match nahi karte (jaise yahan Junos <code>show interfaces terse</code>); asli device rows lautata. ntc-templates ke naye aur purane versions keys alag naam dete hain (purane <code>intf</code> aur <code>ipaddr</code> use karte the); <code>requirements.txt</code> mein version pin karo.</p></div>

<h3>Lab 1, task 4: chaar vendors se ek table</h3>
<p>Alag shabdkosh ka ilaaj har platform ka ek <b>normaliser</b> hai jo wahi chaar fields lautata hai: device, interface, ip, state. "Up hai ya nahi?" ka niyam data hai (chhote functions ki dictionary), aur Junos, jahan template use nahi hota, regular expression se parse hota hai.</p>
<pre class="code"><span class="c"># interfaces.py (core)</span>
CMD = {
    "cisco_ios": "show ip interface brief",
    "cisco_nxos": "show ip interface brief",
    "arista_eos": "show ip interface brief",
    "juniper_junos": "show interfaces terse",
}
IS_UP = {
    "cisco_ios": lambda r: r["status"] == "up" and r["proto"] == "up",
    "cisco_nxos": lambda r: r["link"] == "link-up" and r["proto"] == "protocol-up",
    "arista_eos": lambda r: r["status"] == "up" and r["protocol"] == "up",
}
JUNOS = re.compile(r"^(\\S+)\\s+(up|down)\\s+(up|down)\\s+inet\\s+(\\S+)")


def interface_rows(row, conn):
    kind = row["device_type"]
    out = []
    if kind == "juniper_junos":
        for line in conn.send_command(CMD[kind]).splitlines():
            m = JUNOS.match(line)
            if m:
                state = "up" if m.group(2) == "up" and m.group(3) == "up" else "down"
                out.append([row["name"], m.group(1), m.group(4).split("/")[0], state])
        return out
    for r in conn.send_command(CMD[kind], use_textfsm=True):
        if r["ip_address"] in ("", "unassigned"):
            continue
        state = "up" if IS_UP[kind](r) else "down"
        out.append([row["name"], r["interface"], r["ip_address"].split("/")[0], state])
    return out</pre>
<pre class="out">AUTO01$ python3 interfaces.py
device    interface           ip          state
--------  ------------------  ----------  -------
R1        GigabitEthernet0/0  10.99.0.1   up
J1        ge-0/0/0.0          10.99.0.11  up
E1        Ethernet1           10.99.0.21  up
N1        Eth1/1              10.99.0.31  up
<span class="hl">4 interfaces written to interfaces.csv</span></pre>
<p>Poori file inventory par loop bhi karti hai aur <code>csv</code> module se <code>interfaces.csv</code> likhti hai; Lab 1 ke hint mein poori script hai. Dekho normaliser ne kya kiya: EOS address se prefix hataya, "up" ke teen spellings ko ek mein badla, aur bina IP wale interfaces chhod diye.</p>

<div class="warn"><p><b>Common mistakes.</b> Har platform par same keys maan lena. Return value ko list samajhna jab string aayi ho (<code>TypeError: string indices must be integers</code>). <code>TextFSMError</code> ko bare <code>except</code> se pakadkar khaali table lautana. ntc-templates upgrade karke keys dobara check na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>use_textfsm=True</code> template match hone par dictionaries ki list lautata hai, template na ho to raw string, aur template ho par output se match na ho to exception uthata hai.</p></div>

<div class="scn"><h4>Upgrade ke baad dashboard khaali ho gaya</h4><p>Routine <code>pip upgrade</code> ke baad ek inventory dashboard ne har Arista switch ke liye zero interfaces dikhaye. Naye ntc-templates release ne ek key ka naam badal diya tha, script <code>row.get("intf")</code> use karti thi, aur <code>get</code> bina kisi error ke <code>None</code> lauta deta tha.</p><p><b>Lesson:</b> library version pin karo, keys <code>row["key"]</code> se padho taaki naam badalne par awaaz ke saath fail ho, aur har platform ke ek saved sample output ko parse karne wala ek test jodo.</p></div>

<div class="iv"><p class="q">"Cisco, Arista aur Juniper par ek report kaise banate ho?"</p><p>Main har platform ko uske template se (ya jahan template nahi wahan regex se) parse karta hoon, phir ek chhota normaliser vendor-specific keys aur values ko ek schema mein map karta hai: device, interface, address, state. Platform ke farq dictionaries mein rehte hain, isliye naya vendor jodna entries jodna hai, loop dobara likhna nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template = (platform, command); har platform ke keys alag hain.</li>
<li>Teen natije: rows, raw string (template nahi), <code>TextFSMError</code> (match nahi).</li>
<li>IOS aur NX-OS <code>proto</code> kehte hain, EOS <code>protocol</code>; EOS addresses <code>/24</code> rakhte hain; NX-OS states <code>link-up</code> jaise shabd hain.</li>
<li>Ek schema mein normalise karo; vendor ke niyam dictionaries mein rakho.</li>
<li>ntc-templates pin karo aur key par bharosa karne se pehle har platform ki ek row print karo.</li>
</ul></div>
`}};export{e as default};