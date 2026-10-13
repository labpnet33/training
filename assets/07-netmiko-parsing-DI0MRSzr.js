var e={id:`netmiko-parsing`,h:{en:`Talking to devices over SSH and parsing show output`,hi:`SSH par devices se baat karna aur show output parse karna`},body:{en:`
<p>Imagine your bank sends you a printed statement and you need the total of every fuel payment. You can run a ruler down the page, find the right column and add the numbers: slow, and it breaks if the bank changes the layout. Or the bank can give you a spreadsheet where "amount" is already a column. Reading CLI output from a router is the printed statement. It works everywhere, but you must <b>parse</b> it: cut text into pieces and pick the ones you need. This is called <b>screen scraping</b>, and it is still the most common automation in real networks.</p>

<h3>Netmiko: SSH made simple</h3>
<p><b>Netmiko</b> is an open-source Python library, built on the lower-level SSH library <b>Paramiko</b>, that handles the boring parts of a CLI session: logging in, recognising the prompt, turning off paging, entering and leaving configuration mode, and waiting for output. The lab library <code>nkmiko</code> follows the same API; its <code>device_type</code> is <code>nk_ios</code>, where real Netmiko uses values such as <code>cisco_ios</code>, <code>cisco_xe</code> or <code>cisco_nxos</code>. It opens a real SSH session across the simulated network, so routing, ACLs, RSA keys, <code>transport input ssh</code> and local users all matter.</p>
<pre class="code">from nkmiko import ConnectHandler

device = {"device_type": "nk_ios", "host": "10.99.0.2",
          "username": "netops", "password": "NK@2026"}
conn = ConnectHandler(**device)                  <span class="c"># SSH login</span>
print(conn.find_prompt())                        <span class="c"># R2#</span>
out = conn.send_command("show ip interface brief")   <span class="c"># returns one string</span>
conn.send_config_set(["interface Loopback100",
                      "description Managed by Python",
                      "ip address 100.100.100.2 255.255.255.255"])
conn.save_config()                               <span class="c"># write memory</span>
conn.disconnect()</pre>
<table class="cmp"><tr><th>Method</th><th>What it does</th></tr>
<tr><td><code>send_command(cmd)</code></td><td>Runs one EXEC command and returns the output as a string</td></tr>
<tr><td><code>send_config_set(list)</code></td><td>Enters configuration mode, sends each line, exits</td></tr>
<tr><td><code>save_config()</code></td><td>Saves the running configuration</td></tr>
<tr><td><code>enable()</code></td><td>Enters privileged mode using <code>secret=</code>, needed if the user is not privilege 15</td></tr>
<tr><td><code>find_prompt()</code></td><td>Returns the current prompt, such as <code>R2#</code></td></tr>
<tr><td><code>disconnect()</code></td><td>Closes the SSH session</td></tr>
</table>
<p>You can also write <code>with ConnectHandler(**device) as conn:</code>; the session closes automatically at the end of the block.</p>

<h3>Parsing with split()</h3>
<p>Here is what <code>send_command("show ip interface brief")</code> returns from R2 after the lab changes:</p>
<pre class="out">Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.2       YES manual up                    up
GigabitEthernet0/1     10.23.0.1       YES manual up                    up
<span class="hl">GigabitEthernet0/2     unassigned      YES unset  administratively down down</span>
Loopback100            100.100.100.2   YES manual up                    up</pre>
<p>The lab function <code>parse_brief</code> turns that text into a list of dicts:</p>
<pre class="code">def parse_brief(text):
    rows = []
    for line in text.splitlines()[1:]:          <span class="c"># every line except the header</span>
        parts = line.split()                     <span class="c"># cut at any run of spaces</span>
        if len(parts) &lt; 6:
            continue                             <span class="c"># skip blank or odd lines</span>
        rows.append({"intf": parts[0], "ip": parts[1],
                     "status": " ".join(parts[4:-1]), "proto": parts[-1]})
    return rows</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Splitting one output line">
<rect x="10" y="40" width="130" height="36" rx="6" fill="#bae6fd"/><text x="75" y="63" text-anchor="middle" class="svg-ink" font-size="12">GigabitEthernet0/2</text>
<rect x="148" y="40" width="85" height="36" rx="6" fill="#e2e8f0"/><text x="190" y="63" text-anchor="middle" class="svg-ink" font-size="12">unassigned</text>
<rect x="241" y="40" width="45" height="36" rx="6" fill="#e2e8f0"/><text x="263" y="63" text-anchor="middle" class="svg-ink" font-size="12">YES</text>
<rect x="294" y="40" width="55" height="36" rx="6" fill="#e2e8f0"/><text x="321" y="63" text-anchor="middle" class="svg-ink" font-size="12">unset</text>
<rect x="357" y="40" width="130" height="36" rx="6" fill="#fde68a"/><text x="422" y="63" text-anchor="middle" class="svg-ink" font-size="12">administratively</text>
<rect x="495" y="40" width="60" height="36" rx="6" fill="#fde68a"/><text x="525" y="63" text-anchor="middle" class="svg-ink" font-size="12">down</text>
<rect x="563" y="40" width="65" height="36" rx="6" fill="#bbf7d0"/><text x="595" y="63" text-anchor="middle" class="svg-ink" font-size="12">down</text>
<text x="75" y="30" text-anchor="middle" class="svg-accent" font-size="12">[0]</text><text x="190" y="30" text-anchor="middle" class="svg-accent" font-size="12">[1]</text><text x="263" y="30" text-anchor="middle" class="svg-accent" font-size="12">[2]</text><text x="321" y="30" text-anchor="middle" class="svg-accent" font-size="12">[3]</text><text x="422" y="30" text-anchor="middle" class="svg-accent" font-size="12">[4]</text><text x="525" y="30" text-anchor="middle" class="svg-accent" font-size="12">[5]</text><text x="595" y="30" text-anchor="middle" class="svg-accent" font-size="12">[-1]</text>
<text x="490" y="104" text-anchor="middle" class="svg-ink" font-size="12">status = parts[4:-1] joined</text>
<text x="595" y="126" text-anchor="middle" class="svg-ink" font-size="12">proto</text>
</svg><p class="cap">Status can be one word or two, so the function joins everything from index 4 up to (not including) the last part.</p></div>

<h3>Regular expressions: finding patterns</h3>
<p>When the value you want is inside a sentence rather than a column, use a <b>regular expression</b> (regex), a small pattern language provided by the <code>re</code> module. Write patterns as raw strings (<code>r"..."</code>) so backslashes stay as typed.</p>
<table class="cmp"><tr><th>Pattern</th><th>Matches</th></tr>
<tr><td><code>&#92;d+</code></td><td>One or more digits</td></tr>
<tr><td><code>&#92;S+</code></td><td>One or more non-space characters</td></tr>
<tr><td><code>&#92;s+</code></td><td>One or more spaces or tabs</td></tr>
<tr><td><code>.</code> and <code>&#92;.</code></td><td>Any character / a literal dot</td></tr>
<tr><td><code>^</code> and <code>$</code></td><td>Start / end of the line</td></tr>
<tr><td><code>( )</code></td><td>A capture group: the part you want back</td></tr>
</table>
<pre class="code">import re
ver = conn.send_command("show version")
m = re.search(r"Version (&#92;S+),", ver)
if m:
    print(m.group(1))                  <span class="c"># 17.9.4a</span>
up = re.search(r"uptime is (.+)", ver).group(1)
loops = re.findall(r"^(Loopback&#92;d+)", out, re.M)   <span class="c"># every loopback name</span></pre>
<p><code>re.search()</code> returns a match object for the first hit, or <code>None</code> if there is none, so test it before calling <code>.group()</code>. <code>re.findall()</code> returns a list of all captured values. <code>re.M</code> makes <code>^</code> match at the start of every line.</p>

<h3>Let a parser do it: TextFSM and Genie</h3>
<p>Writing a parser for every command is tedious. Netmiko can call <b>TextFSM</b> with the community <b>ntc-templates</b>: <code>send_command("show vlan brief", use_textfsm=True)</code> returns a list of dicts with keys such as <code>vlan_id</code> instead of a string. Cisco's pyATS <b>Genie</b> parsers do the same with <code>use_genie=True</code>. Parsed values are still <b>strings</b>, which is why the lab script writes <code>int(v["vlan_id"])</code>. If no template exists for a command, you get the plain string back.</p>

<div class="eg"><p><b>Worked example.</b> For R2's output above, <code>parse_brief</code> skips the header, splits each of the four lines, and returns four dicts. The comprehension <code>[r["intf"] for r in rows if r["status"] == "up" and r["proto"] == "up"]</code> keeps three: GigabitEthernet0/0, GigabitEthernet0/1 and Loopback100. GigabitEthernet0/2 fails because its status is <code>"administratively down"</code>. <code>len(up)</code> is 3, so the lab prints R2 followed by "3 up".</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the header line, so "Interface" becomes a device port; assuming status is always one word (<code>parts[4]</code> gives "administratively"); calling <code>.group()</code> on a <code>None</code> result (<code>AttributeError</code>); and pushing configuration with <code>send_command()</code>, which runs in EXEC mode.</p></div>

<div class="exam"><p><b>Exam trap.</b> Screen scraping returns <b>unstructured</b> text that must be parsed and can break when output changes between releases; APIs such as RESTCONF, NETCONF and controller REST APIs return <b>structured</b> data (JSON or XML). Know which Netmiko method sends configuration (<code>send_config_set</code>) and which runs a show command (<code>send_command</code>).</p></div>

<div class="scn"><h4>The upgrade that broke the report</h4><p>A weekly interface report parsed <code>show interfaces</code> with fixed positions, such as "the 4th word of line 3". After an IOS XE upgrade one line gained an extra word and the report started showing input rates as output rates for 60 switches. Nobody noticed for two weeks. The team replaced the hand parser with TextFSM templates for the CLI devices and, for the newer switches, moved to RESTCONF, where the counters come back as named JSON fields.</p><p><b>Lesson:</b> parse by pattern or template, not by fixed position, and prefer structured APIs where the platform supports them.</p></div>

<div class="iv"><p class="q">"What is screen scraping, and what are its pros and cons compared with using an API?"</p><p>Strong answer: screen scraping means logging in over SSH, sending CLI commands and parsing the human-readable text, typically with Netmiko plus split, regex, TextFSM or Genie. Pros: works on almost any device, no extra features to enable. Cons: output is unstructured, differs by platform and release, and parsers break silently. APIs return structured, model-driven data and report errors with status codes. Say you use both: APIs where available, scraping for older gear.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Netmiko (on Paramiko) handles SSH login, prompts and config mode; <code>ConnectHandler(**device)</code> starts it.</li>
<li><code>send_command</code> for show, <code>send_config_set</code> for configuration lists, <code>save_config</code> to save.</li>
<li>Parse with <code>splitlines()</code> and <code>split()</code>; skip headers; handle multi-word fields with slices.</li>
<li>Regex: <code>re.search</code> (first match or None), <code>re.findall</code> (all), groups in brackets, raw strings.</li>
<li>TextFSM or Genie return lists of dicts; values are still strings.</li>
</ul></div>
`,hi:`
<p>Socho aapka bank aapko printed statement bhejta hai aur aapko har fuel payment ka total chahiye. Aap page par ruler chala kar sahi column dhoondh kar numbers jod sakte ho: dheema, aur bank layout badle to toot jaata hai. Ya bank aapko spreadsheet de sakta hai jahan "amount" pehle se ek column hai. Router ka CLI output padhna printed statement hai. Yeh har jagah chalta hai, par aapko use <b>parse</b> karna padta hai: text ko tukdon mein kaat kar zaroori tukde chunna. Ise <b>screen scraping</b> kehte hain, aur asli networks mein yeh aaj bhi sabse common automation hai.</p>

<h3>Netmiko: SSH aasaan banaya</h3>
<p><b>Netmiko</b> ek open-source Python library hai, jo lower-level SSH library <b>Paramiko</b> par bani hai, aur CLI session ke boring hisse sambhalti hai: login karna, prompt pehchanna, paging band karna, configuration mode mein aana-jaana, aur output ka intezaar karna. Lab library <code>nkmiko</code> same API follow karti hai; iska <code>device_type</code> <code>nk_ios</code> hai, jabki asli Netmiko <code>cisco_ios</code>, <code>cisco_xe</code> ya <code>cisco_nxos</code> jaise values use karti hai. Yeh simulated network ke across asli SSH session kholti hai, isliye routing, ACLs, RSA keys, <code>transport input ssh</code> aur local users sab matter karte hain.</p>
<pre class="code">from nkmiko import ConnectHandler

device = {"device_type": "nk_ios", "host": "10.99.0.2",
          "username": "netops", "password": "NK@2026"}
conn = ConnectHandler(**device)                  <span class="c"># SSH login</span>
print(conn.find_prompt())                        <span class="c"># R2#</span>
out = conn.send_command("show ip interface brief")   <span class="c"># ek string return karta hai</span>
conn.send_config_set(["interface Loopback100",
                      "description Managed by Python",
                      "ip address 100.100.100.2 255.255.255.255"])
conn.save_config()                               <span class="c"># write memory</span>
conn.disconnect()</pre>
<table class="cmp"><tr><th>Method</th><th>Kya karta hai</th></tr>
<tr><td><code>send_command(cmd)</code></td><td>Ek EXEC command chalata hai aur output string ki tarah return karta hai</td></tr>
<tr><td><code>send_config_set(list)</code></td><td>Configuration mode mein jaata hai, har line bhejta hai, bahar aata hai</td></tr>
<tr><td><code>save_config()</code></td><td>Running configuration save karta hai</td></tr>
<tr><td><code>enable()</code></td><td><code>secret=</code> se privileged mode mein jaata hai, agar user privilege 15 nahi hai to zaroori</td></tr>
<tr><td><code>find_prompt()</code></td><td>Current prompt return karta hai, jaise <code>R2#</code></td></tr>
<tr><td><code>disconnect()</code></td><td>SSH session band karta hai</td></tr>
</table>
<p>Aap <code>with ConnectHandler(**device) as conn:</code> bhi likh sakte ho; block ke end mein session automatically band ho jaata hai.</p>

<h3>split() se parsing</h3>
<p>Lab changes ke baad R2 se <code>send_command("show ip interface brief")</code> yeh return karta hai:</p>
<pre class="out">Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.2       YES manual up                    up
GigabitEthernet0/1     10.23.0.1       YES manual up                    up
<span class="hl">GigabitEthernet0/2     unassigned      YES unset  administratively down down</span>
Loopback100            100.100.100.2   YES manual up                    up</pre>
<p>Lab function <code>parse_brief</code> us text ko dicts ki list mein badalta hai:</p>
<pre class="code">def parse_brief(text):
    rows = []
    for line in text.splitlines()[1:]:          <span class="c"># header ke alawa har line</span>
        parts = line.split()                     <span class="c"># spaces ke har run par kaato</span>
        if len(parts) &lt; 6:
            continue                             <span class="c"># khaali ya ajeeb lines skip</span>
        rows.append({"intf": parts[0], "ip": parts[1],
                     "status": " ".join(parts[4:-1]), "proto": parts[-1]})
    return rows</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Output ki ek line split karna">
<rect x="10" y="40" width="130" height="36" rx="6" fill="#bae6fd"/><text x="75" y="63" text-anchor="middle" class="svg-ink" font-size="12">GigabitEthernet0/2</text>
<rect x="148" y="40" width="85" height="36" rx="6" fill="#e2e8f0"/><text x="190" y="63" text-anchor="middle" class="svg-ink" font-size="12">unassigned</text>
<rect x="241" y="40" width="45" height="36" rx="6" fill="#e2e8f0"/><text x="263" y="63" text-anchor="middle" class="svg-ink" font-size="12">YES</text>
<rect x="294" y="40" width="55" height="36" rx="6" fill="#e2e8f0"/><text x="321" y="63" text-anchor="middle" class="svg-ink" font-size="12">unset</text>
<rect x="357" y="40" width="130" height="36" rx="6" fill="#fde68a"/><text x="422" y="63" text-anchor="middle" class="svg-ink" font-size="12">administratively</text>
<rect x="495" y="40" width="60" height="36" rx="6" fill="#fde68a"/><text x="525" y="63" text-anchor="middle" class="svg-ink" font-size="12">down</text>
<rect x="563" y="40" width="65" height="36" rx="6" fill="#bbf7d0"/><text x="595" y="63" text-anchor="middle" class="svg-ink" font-size="12">down</text>
<text x="75" y="30" text-anchor="middle" class="svg-accent" font-size="12">[0]</text><text x="190" y="30" text-anchor="middle" class="svg-accent" font-size="12">[1]</text><text x="263" y="30" text-anchor="middle" class="svg-accent" font-size="12">[2]</text><text x="321" y="30" text-anchor="middle" class="svg-accent" font-size="12">[3]</text><text x="422" y="30" text-anchor="middle" class="svg-accent" font-size="12">[4]</text><text x="525" y="30" text-anchor="middle" class="svg-accent" font-size="12">[5]</text><text x="595" y="30" text-anchor="middle" class="svg-accent" font-size="12">[-1]</text>
<text x="490" y="104" text-anchor="middle" class="svg-ink" font-size="12">status = parts[4:-1] jode hue</text>
<text x="595" y="126" text-anchor="middle" class="svg-ink" font-size="12">proto</text>
</svg><p class="cap">Status ek shabd ya do ho sakta hai, isliye function index 4 se lekar aakhri part tak (use chhod kar) sab jodta hai.</p></div>

<h3>Regular expressions: patterns dhoondhna</h3>
<p>Jab aapko chahiye wali value column mein nahi balki ek sentence ke andar ho, to <b>regular expression</b> (regex) use karo, <code>re</code> module ki di hui chhoti pattern language. Patterns raw strings (<code>r"..."</code>) ki tarah likho taaki backslashes jaise type kiye waise hi rahein.</p>
<table class="cmp"><tr><th>Pattern</th><th>Match karta hai</th></tr>
<tr><td><code>&#92;d+</code></td><td>Ek ya zyada digits</td></tr>
<tr><td><code>&#92;S+</code></td><td>Ek ya zyada non-space characters</td></tr>
<tr><td><code>&#92;s+</code></td><td>Ek ya zyada spaces ya tabs</td></tr>
<tr><td><code>.</code> aur <code>&#92;.</code></td><td>Koi bhi character / asli dot</td></tr>
<tr><td><code>^</code> aur <code>$</code></td><td>Line ki shuruaat / end</td></tr>
<tr><td><code>( )</code></td><td>Capture group: woh hissa jo aapko wapas chahiye</td></tr>
</table>
<pre class="code">import re
ver = conn.send_command("show version")
m = re.search(r"Version (&#92;S+),", ver)
if m:
    print(m.group(1))                  <span class="c"># 17.9.4a</span>
up = re.search(r"uptime is (.+)", ver).group(1)
loops = re.findall(r"^(Loopback&#92;d+)", out, re.M)   <span class="c"># har loopback ka naam</span></pre>
<p><code>re.search()</code> pehle hit ka match object deta hai, ya kuch na mile to <code>None</code>, isliye <code>.group()</code> call karne se pehle use test karo. <code>re.findall()</code> saari captured values ki list deta hai. <code>re.M</code> se <code>^</code> har line ki shuruaat par match karta hai.</p>

<h3>Parser ko karne do: TextFSM aur Genie</h3>
<p>Har command ke liye parser likhna thakaau hai. Netmiko community <b>ntc-templates</b> ke saath <b>TextFSM</b> call kar sakta hai: <code>send_command("show vlan brief", use_textfsm=True)</code> string ki jagah <code>vlan_id</code> jaisi keys wali dicts ki list return karta hai. Cisco ke pyATS <b>Genie</b> parsers <code>use_genie=True</code> se yahi karte hain. Parsed values abhi bhi <b>strings</b> hoti hain, isliye lab script <code>int(v["vlan_id"])</code> likhta hai. Agar kisi command ka template nahi hai, to aapko plain string wapas milti hai.</p>

<div class="eg"><p><b>Worked example.</b> Upar wale R2 output ke liye <code>parse_brief</code> header skip karta hai, chaaron lines split karta hai, aur chaar dicts return karta hai. Comprehension <code>[r["intf"] for r in rows if r["status"] == "up" and r["proto"] == "up"]</code> teen rakhta hai: GigabitEthernet0/0, GigabitEthernet0/1 aur Loopback100. GigabitEthernet0/2 fail hota hai kyunki uska status <code>"administratively down"</code> hai. <code>len(up)</code> 3 hai, isliye lab R2 ke baad "3 up" print karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Header line bhool jaana, jisse "Interface" ek device port ban jaata hai; maan lena ki status hamesha ek shabd hai (<code>parts[4]</code> "administratively" deta hai); <code>None</code> result par <code>.group()</code> call karna (<code>AttributeError</code>); aur <code>send_command()</code> se configuration push karna, jo EXEC mode mein chalta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Screen scraping <b>unstructured</b> text deta hai jise parse karna padta hai aur jo releases ke beech output badalne par toot sakta hai; RESTCONF, NETCONF aur controller REST APIs jaisi APIs <b>structured</b> data (JSON ya XML) deti hain. Jaano kaunsa Netmiko method configuration bhejta hai (<code>send_config_set</code>) aur kaunsa show command chalata hai (<code>send_command</code>).</p></div>

<div class="scn"><h4>Upgrade jisne report tod di</h4><p>Ek weekly interface report <code>show interfaces</code> ko fixed positions se parse karti thi, jaise "line 3 ka 4th shabd". IOS XE upgrade ke baad ek line mein ek extra shabd aa gaya aur report 60 switches ke input rates ko output rates ki tarah dikhane lagi. Do hafte kisi ne notice nahi kiya. Team ne CLI devices ke liye haath ka parser TextFSM templates se badla aur naye switches ke liye RESTCONF par shift ki, jahan counters named JSON fields ki tarah aate hain.</p><p><b>Seekh:</b> fixed position se nahi, pattern ya template se parse karo, aur jahan platform support kare wahan structured APIs ko prefer karo.</p></div>

<div class="iv"><p class="q">"Screen scraping kya hai, aur API ke mukable iske pros aur cons kya hain?"</p><p>Strong answer: screen scraping ka matlab SSH par login karna, CLI commands bhejna aur human-readable text parse karna, aam taur par Netmiko plus split, regex, TextFSM ya Genie ke saath. Pros: lagbhag har device par chalta hai, koi extra feature enable nahi karna. Cons: output unstructured hai, platform aur release ke hisaab se badalta hai, aur parsers chupchaap toot-te hain. APIs structured, model-driven data deti hain aur errors status codes se report karti hain. Batao ki aap dono use karte ho: jahan available ho wahan APIs, purane gear ke liye scraping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Netmiko (Paramiko par) SSH login, prompts aur config mode sambhalta hai; <code>ConnectHandler(**device)</code> se shuru hota hai.</li>
<li>Show ke liye <code>send_command</code>, configuration lists ke liye <code>send_config_set</code>, save ke liye <code>save_config</code>.</li>
<li><code>splitlines()</code> aur <code>split()</code> se parse karo; headers skip karo; multi-word fields slices se sambhalo.</li>
<li>Regex: <code>re.search</code> (pehla match ya None), <code>re.findall</code> (sab), brackets mein groups, raw strings.</li>
<li>TextFSM ya Genie dicts ki lists dete hain; values abhi bhi strings hoti hain.</li>
</ul></div>
`}};export{e as default};