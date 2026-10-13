var e={id:`ntc-templates`,h:{en:`ntc-templates: ready-made templates, the index and use_textfsm`,hi:`ntc-templates: ready-made templates, index aur use_textfsm`},body:{en:`
<p><b>The idea of this chapter:</b> before you write a template, check whether somebody already did. <b>ntc-templates</b> is a community collection of tested TextFSM templates for many vendors. You will learn how it finds the right template, how to call it, what keys it returns, and the shortcut that <code>nkmiko</code> offers. You will also learn what to do when the command you need is not in the library.</p>

<h3>Analogy: a library with a card catalogue</h3>
<p>A library holds thousands of books, and a catalogue tells you the shelf for each title. ntc-templates is the library of layouts, and its <b>index</b> file is the catalogue. You ask for "platform cisco_ios, command show ip interface brief" and the index says which template file to use. You never browse the shelves yourself.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="platform and command go to the index file, which names a template file, which parses the data into rows">
<rect x="10" y="30" width="150" height="70" rx="10" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="12">platform + command</text><text x="85" y="75" text-anchor="middle" class="svg-muted" font-size="11">cisco_ios</text><text x="85" y="90" text-anchor="middle" class="svg-muted" font-size="11">show ip interface brief</text>
<rect x="190" y="30" width="120" height="70" rx="10" fill="#fde68a"/><text x="250" y="60" text-anchor="middle" class="svg-ink" font-size="13">index file</text><text x="250" y="80" text-anchor="middle" class="svg-muted" font-size="11">the catalogue</text>
<rect x="340" y="30" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="415" y="55" text-anchor="middle" class="svg-ink" font-size="12">template file</text><text x="415" y="75" text-anchor="middle" class="svg-muted" font-size="10">cisco_ios_show_ip_</text><text x="415" y="89" text-anchor="middle" class="svg-muted" font-size="10">interface_brief.textfsm</text>
<rect x="520" y="30" width="110" height="70" rx="10" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="13">rows</text><text x="575" y="80" text-anchor="middle" class="svg-muted" font-size="11">list of dicts</text>
<line x1="160" y1="65" x2="190" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="340" y2="65" stroke="#64748b" stroke-width="2"/><line x1="490" y1="65" x2="520" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The index turns a platform and a command into the right template.</p></div>

<h3>Naming and the index</h3>
<p>Every template file is named <code>platform_command_with_underscores.textfsm</code>, for example <code>cisco_ios_show_ip_interface_brief.textfsm</code>. A file called <code>index</code> in the same folder lists, one line per template, the template name, a hostname pattern, the platform and the command with its allowed abbreviations.</p>
<div class="note"><p><b>Reference code (not run in the simulator).</b> A line from the real <code>index</code> file looks like <code>cisco_ios_show_ip_interface_brief.textfsm, .*, cisco_ios, sh[[ow]] ip int[[erface]] br[[ief]]</code>. The double square brackets mean "these letters are optional", so <code>sh ip int br</code> works as well as the full command. The lab hides the folder; you use the functions only.</p></div>

<h3>Calling it: parse_output</h3>
<p>The lab script <code>ntc.py</code> parses the file you saved in chapter 5, with the library instead of your own template:</p>
<pre class="code">from ntc_templates.parse import parse_output

raw = open("r1_ipbrief.txt").read()
rows = parse_output(platform="cisco_ios", command="show ip interface brief", data=raw)
print(rows[0])
print(sum(1 for r in rows if r["status"] == "up"), "interfaces up")

from tabulate import tabulate
print(tabulate(rows, headers="keys", tablefmt="github"))</pre>
<pre class="out">AUTO01$ python3 ntc.py
<span class="hl">{'intf': 'GigabitEthernet0/0', 'ipaddr': '10.99.0.1', 'status': 'up', 'proto': 'up'}</span>
2 interfaces up
| intf               | ipaddr     | status                | proto   |
|--------------------|------------|-----------------------|---------|
| GigabitEthernet0/0 | 10.99.0.1  | up                    | up      |
| GigabitEthernet0/1 | unassigned | administratively down | down    |
| GigabitEthernet0/2 | unassigned | administratively down | down    |
| GigabitEthernet0/3 | unassigned | administratively down | down    |
| Loopback0          | 1.1.1.1    | up                    | up      |</pre>
<ul>
<li><code>parse_output</code> takes the platform, the command and the text, and returns a <b>list of dictionaries</b>.</li>
<li>The keys are the Value names of the library template, in <b>lowercase</b>. The answer to Lab 1 task 4 is <code>intf</code>. The author of the template chose the names, not you: your template used <code>INTF</code> and <code>IP</code>, the library uses <code>intf</code> and <code>ipaddr</code>.</li>
<li><code>tabulate(rows, headers="keys", tablefmt="github")</code> prints the dictionaries as a table you can paste into a ticket.</li>
</ul>

<h3>Abbreviations, unknown commands and the nkmiko shortcut</h3>
<p>The command string is matched through the index, so abbreviations work. When the library does not know the command or the platform it raises <code>ParsingException</code>. Instead of saving a file you can also ask the connection to parse for you with <code>use_textfsm=True</code>. The script <code>ntc_keys.py</code> compares all of this:</p>
<pre class="code">conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
b = conn.send_command("show ip interface brief", use_textfsm=True)
c = conn.send_command("show clock", use_textfsm=True)
conn.disconnect()
print("use_textfsm  :", b[0])
print("no template  :", type(c).__name__)</pre>
<pre class="out">AUTO01$ python3 ntc_keys.py
parse_output : {'intf': 'GigabitEthernet0/0', 'ipaddr': '10.99.0.1', 'status': 'up', 'proto': 'up'}
<span class="hl">use_textfsm  : {'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}</span>
no template  : str
<span class="hl">show cdp neighbors -&gt; No template found for cisco_ios show cdp neighbors</span>
sh ip int br -&gt; 5 rows
<span class="hl">No template found for platform fortinet (this lab ships cisco_ios, cisco_xe and cisco_nxos)</span></pre>
<div class="note"><p><b>nkmiko versus ntc-templates.</b> In real Netmiko, <code>use_textfsm=True</code> calls ntc-templates behind the scenes, so the keys are the ntc-templates keys. In this lab the <code>nkmiko</code> shortcut returns friendlier names for the same data: <code>interface</code> and <code>ip_address</code> instead of <code>intf</code> and <code>ipaddr</code>. The values are identical. The lesson is general: <b>never guess a key, print <code>rows[0]</code> and read it</b>. Also remember that <code>nkmiko</code> supports Cisco device types only, and that when no template matches, <code>send_command</code> does not fail: it hands back the raw text as a <b>string</b>. Test with <code>isinstance(rows, list)</code> before you loop (chapter 9).</p></div>
<p>In the lab the library covers <code>show ip interface brief</code>, <code>show vlan brief</code>, <code>show ip ospf neighbor</code> and <code>show version</code> for the Cisco platforms. A command such as <code>show cdp neighbors</code> has no template in the lab, so you write one yourself, and that is the next chapter's job.</p>

<h3>Library template or your own?</h3>
<table class="cmp"><tr><th>Situation</th><th>Choose</th></tr>
<tr><td>The command and platform exist in the library</td><td>Use <code>parse_output</code> and accept its key names</td></tr>
<tr><td>You want your own key names or fewer columns</td><td>Write your own template, or rename the keys after parsing</td></tr>
<tr><td>The command is missing or your device prints a different layout</td><td>Write a template and test it with a saved sample</td></tr>
<tr><td>You need a fix to a library template</td><td>Copy it, fix it, keep the copy in your repository (and share the fix upstream)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A daily report needs interface name and status from 30 routers. Using <code>parse_output</code> the loop is: collect the text, call <code>parse_output</code>, keep <code>r["intf"]</code> and <code>r["status"]</code>. No template to maintain, and a library update improves it for free.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>INTF</code> as the key with the library (the key is <code>intf</code>). Assuming <code>use_textfsm=True</code> always returns a list. Passing the wrong platform name such as <code>cisco</code> instead of <code>cisco_ios</code>. Not catching <code>ParsingException</code> for a command the library lacks.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template files are named <code>platform_command.textfsm</code> and the <code>index</code> file maps commands to them, including abbreviations. A template is chosen by platform and command, not by device name. The keys of <code>parse_output</code> are lowercase.</p></div>

<div class="scn"><h4>The key that changed after the upgrade</h4><p>A script read <code>row["interface"]</code> from a library template. After a library upgrade the key was renamed upstream and the report crashed with a <code>KeyError</code> at 02:00. The team pinned the library version in <code>requirements.txt</code> (module <code>py-tools</code>) and added a test that checks the key names.</p><p><b>Lesson:</b> third-party templates are code. Pin the version, and test the keys you depend on.</p></div>

<div class="iv"><p class="q">"What is ntc-templates and how does it choose a template?"</p><p>It is a community library of TextFSM templates. Files are named platform_command, and an index file maps a platform and a command, with abbreviations, to the template. I call parse_output with platform, command and the raw text and get a list of dictionaries with lowercase keys. If no template exists it raises ParsingException, and then I write my own.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ntc-templates = ready-made, tested templates named <code>platform_command.textfsm</code>.</li>
<li>The <code>index</code> file maps platform and command (with abbreviations) to the template.</li>
<li><code>parse_output(platform=, command=, data=)</code> returns a list of dicts; unknown input raises <code>ParsingException</code>.</li>
<li>Keys come from the template author; print <code>rows[0]</code> before you use a key.</li>
<li><code>use_textfsm=True</code> returns a list when a template matched and the raw string when not.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> template likhne se pehle dekho ki kisi ne pehle hi likha hai ya nahi. <b>ntc-templates</b> kai vendors ke tested TextFSM templates ka community collection hai. Aap seekhoge ki yeh sahi template kaise dhoondhta hai, ise kaise call karte hain, yeh kaunsi keys lautata hai, aur <code>nkmiko</code> ka shortcut kya hai. Yeh bhi seekhoge ki jab aapko chahiye wali command library mein na ho to kya karna hai.</p>

<h3>Analogy: card catalogue wali library</h3>
<p>Library mein hazaron kitabein hoti hain, aur catalogue har title ki shelf batata hai. ntc-templates layouts ki library hai, aur uski <b>index</b> file catalogue hai. Aap poochte ho "platform cisco_ios, command show ip interface brief" aur index batata hai ki kaunsi template file use karni hai. Aap shelves khud nahi dhoondhte.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="platform aur command index file mein jaate hain, jo template file batati hai, jo data ko rows mein parse karti hai">
<rect x="10" y="30" width="150" height="70" rx="10" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="12">platform + command</text><text x="85" y="75" text-anchor="middle" class="svg-muted" font-size="11">cisco_ios</text><text x="85" y="90" text-anchor="middle" class="svg-muted" font-size="11">show ip interface brief</text>
<rect x="190" y="30" width="120" height="70" rx="10" fill="#fde68a"/><text x="250" y="60" text-anchor="middle" class="svg-ink" font-size="13">index file</text><text x="250" y="80" text-anchor="middle" class="svg-muted" font-size="11">catalogue</text>
<rect x="340" y="30" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="415" y="55" text-anchor="middle" class="svg-ink" font-size="12">template file</text><text x="415" y="75" text-anchor="middle" class="svg-muted" font-size="10">cisco_ios_show_ip_</text><text x="415" y="89" text-anchor="middle" class="svg-muted" font-size="10">interface_brief.textfsm</text>
<rect x="520" y="30" width="110" height="70" rx="10" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="13">rows</text><text x="575" y="80" text-anchor="middle" class="svg-muted" font-size="11">dicts ki list</text>
<line x1="160" y1="65" x2="190" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="340" y2="65" stroke="#64748b" stroke-width="2"/><line x1="490" y1="65" x2="520" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Index platform aur command ko sahi template mein badal deta hai.</p></div>

<h3>Naming aur index</h3>
<p>Har template file ka naam <code>platform_command_with_underscores.textfsm</code> hota hai, jaise <code>cisco_ios_show_ip_interface_brief.textfsm</code>. Usi folder mein <code>index</code> naam ki file har template ki ek line mein template ka naam, hostname pattern, platform aur command (allowed abbreviations ke saath) list karti hai.</p>
<div class="note"><p><b>Reference code (not run in the simulator).</b> Asli <code>index</code> file ki ek line aisi dikhti hai <code>cisco_ios_show_ip_interface_brief.textfsm, .*, cisco_ios, sh[[ow]] ip int[[erface]] br[[ief]]</code>. Double square brackets ka matlab "yeh letters optional hain", isliye <code>sh ip int br</code> poori command ki tarah hi chalta hai. Lab folder ko chhupata hai; aap sirf functions use karte ho.</p></div>

<h3>Call karna: parse_output</h3>
<p>Lab script <code>ntc.py</code> chapter 5 mein save ki hui file ko apne template ki jagah library se parse karti hai:</p>
<pre class="code">from ntc_templates.parse import parse_output

raw = open("r1_ipbrief.txt").read()
rows = parse_output(platform="cisco_ios", command="show ip interface brief", data=raw)
print(rows[0])
print(sum(1 for r in rows if r["status"] == "up"), "interfaces up")

from tabulate import tabulate
print(tabulate(rows, headers="keys", tablefmt="github"))</pre>
<pre class="out">AUTO01$ python3 ntc.py
<span class="hl">{'intf': 'GigabitEthernet0/0', 'ipaddr': '10.99.0.1', 'status': 'up', 'proto': 'up'}</span>
2 interfaces up
| intf               | ipaddr     | status                | proto   |
|--------------------|------------|-----------------------|---------|
| GigabitEthernet0/0 | 10.99.0.1  | up                    | up      |
| GigabitEthernet0/1 | unassigned | administratively down | down    |
| GigabitEthernet0/2 | unassigned | administratively down | down    |
| GigabitEthernet0/3 | unassigned | administratively down | down    |
| Loopback0          | 1.1.1.1    | up                    | up      |</pre>
<ul>
<li><code>parse_output</code> platform, command aur text leta hai, aur <b>dictionaries ki list</b> lautata hai.</li>
<li>Keys library template ke Value names hain, <b>lowercase</b> mein. Lab 1 task 4 ka jawab <code>intf</code> hai. Naam template ke author ne chune, aapne nahi: aapke template mein <code>INTF</code> aur <code>IP</code> tha, library mein <code>intf</code> aur <code>ipaddr</code> hai.</li>
<li><code>tabulate(rows, headers="keys", tablefmt="github")</code> dictionaries ko table ki tarah print karta hai jise aap ticket mein paste kar sakte ho.</li>
</ul>

<h3>Abbreviations, unknown commands aur nkmiko shortcut</h3>
<p>Command string index se match hoti hai, isliye abbreviations chalte hain. Jab library command ya platform nahi jaanti to <code>ParsingException</code> uthati hai. File save karne ki jagah aap connection se bhi parse karwa sakte ho <code>use_textfsm=True</code> ke saath. Script <code>ntc_keys.py</code> yeh sab compare karti hai:</p>
<pre class="code">conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
b = conn.send_command("show ip interface brief", use_textfsm=True)
c = conn.send_command("show clock", use_textfsm=True)
conn.disconnect()
print("use_textfsm  :", b[0])
print("no template  :", type(c).__name__)</pre>
<pre class="out">AUTO01$ python3 ntc_keys.py
parse_output : {'intf': 'GigabitEthernet0/0', 'ipaddr': '10.99.0.1', 'status': 'up', 'proto': 'up'}
<span class="hl">use_textfsm  : {'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}</span>
no template  : str
<span class="hl">show cdp neighbors -&gt; No template found for cisco_ios show cdp neighbors</span>
sh ip int br -&gt; 5 rows
<span class="hl">No template found for platform fortinet (this lab ships cisco_ios, cisco_xe and cisco_nxos)</span></pre>
<div class="note"><p><b>nkmiko versus ntc-templates.</b> Asli Netmiko mein <code>use_textfsm=True</code> andar se ntc-templates call karta hai, isliye keys ntc-templates ki keys hoti hain. Is lab mein <code>nkmiko</code> ka shortcut wahi data friendlier names ke saath lautata hai: <code>intf</code> aur <code>ipaddr</code> ki jagah <code>interface</code> aur <code>ip_address</code>. Values ek jaisi hain. Seekh general hai: <b>key kabhi guess mat karo, <code>rows[0]</code> print karo aur padho</b>. Yeh bhi yaad rakho ki <code>nkmiko</code> sirf Cisco device types support karta hai, aur jab koi template match nahi hota to <code>send_command</code> fail nahi hota: woh raw text ek <b>string</b> ki tarah wapas deta hai. Loop se pehle <code>isinstance(rows, list)</code> se test karo (chapter 9).</p></div>
<p>Lab mein library Cisco platforms ke liye <code>show ip interface brief</code>, <code>show vlan brief</code>, <code>show ip ospf neighbor</code> aur <code>show version</code> cover karti hai. <code>show cdp neighbors</code> jaisi command ka lab mein template nahi hai, isliye aap khud likhte ho, aur yahi agle chapter ka kaam hai.</p>

<h3>Library template ya apna?</h3>
<table class="cmp"><tr><th>Situation</th><th>Chuno</th></tr>
<tr><td>Command aur platform library mein hain</td><td><code>parse_output</code> use karo aur uske key names maan lo</td></tr>
<tr><td>Aapko apne key names ya kam columns chahiye</td><td>Apna template likho, ya parse ke baad keys rename karo</td></tr>
<tr><td>Command missing hai ya device alag layout print karta hai</td><td>Template likho aur saved sample se test karo</td></tr>
<tr><td>Library template mein fix chahiye</td><td>Copy karo, fix karo, copy ko apni repository mein rakho (aur fix upstream share karo)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Roz ki report ko 30 routers se interface ka naam aur status chahiye. <code>parse_output</code> se loop yeh hai: text collect karo, <code>parse_output</code> call karo, <code>r["intf"]</code> aur <code>r["status"]</code> rakho. Maintain karne ko koi template nahi, aur library update free mein behtar kar deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Library ke saath key <code>INTF</code> use karna (key <code>intf</code> hai). Maan lena ki <code>use_textfsm=True</code> hamesha list deta hai. Galat platform naam dena, jaise <code>cisco_ios</code> ki jagah <code>cisco</code>. Library mein na hone wali command ke liye <code>ParsingException</code> na pakadna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template files <code>platform_command.textfsm</code> naam ki hoti hain aur <code>index</code> file commands ko unse map karti hai, abbreviations ke saath. Template platform aur command se chuna jaata hai, device ke naam se nahi. <code>parse_output</code> ki keys lowercase hoti hain.</p></div>

<div class="scn"><h4>Upgrade ke baad badli hui key</h4><p>Ek script library template se <code>row["interface"]</code> padhti thi. Library upgrade ke baad upstream mein key rename ho gayi aur raat 02:00 baje report <code>KeyError</code> ke saath crash hui. Team ne library version <code>requirements.txt</code> mein pin kiya (module <code>py-tools</code>) aur key names check karne wala test jodha.</p><p><b>Lesson:</b> third-party templates code hain. Version pin karo, aur jin keys par nirbhar ho unhe test karo.</p></div>

<div class="iv"><p class="q">"ntc-templates kya hai aur template kaise chunta hai?"</p><p>Yeh TextFSM templates ki community library hai. Files platform_command naam ki hoti hain, aur index file platform aur command ko, abbreviations ke saath, template se map karti hai. Main platform, command aur raw text ke saath parse_output call karta hoon aur lowercase keys wali dictionaries ki list paata hoon. Template na ho to ParsingException aata hai, aur tab main apna likhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ntc-templates = ready-made, tested templates jinka naam <code>platform_command.textfsm</code> hota hai.</li>
<li><code>index</code> file platform aur command (abbreviations ke saath) ko template se map karti hai.</li>
<li><code>parse_output(platform=, command=, data=)</code> dicts ki list deta hai; anjaan input par <code>ParsingException</code> aata hai.</li>
<li>Keys template author se aati hain; key use karne se pehle <code>rows[0]</code> print karo.</li>
<li><code>use_textfsm=True</code> template match hone par list aur na hone par raw string lautata hai.</li>
</ul></div>
`}};export{e as default};