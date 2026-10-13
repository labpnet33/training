var e={id:`netmiko-plugin`,h:{en:`The Netmiko plugin: commands, enable, TextFSM and refused commands`,hi:`Netmiko plugin: commands, enable, TextFSM aur refused commands`},body:{en:`
<p>Nornir does not talk to devices by itself. It uses <b>connection plugins</b>, and the most common one is <code>nornir_netmiko</code>, a thin layer over the Netmiko you used in <code>adv-nkmiko</code>. This chapter shows what the plugin gives you, how the inventory feeds it, and one behaviour that surprises almost everybody: a command that the device refuses does not fail the host.</p>

<h3>An analogy: travel adapters</h3>
<p>A traveller carries one charger and a bag of plug adapters. The charger is the same in every country; the adapter changes. Your task is the charger. The <code>platform</code> in the inventory (<code>cisco_ios</code>, <code>juniper_junos</code>, <code>arista_eos</code>, <code>cisco_nxos</code>) picks the adapter, so the same task works on four vendors.</p>

<h3>The tasks you will use</h3>
<table class="cmp"><tr><th>Task</th><th>What it does</th><th>Notes</th></tr>
<tr><td><code>netmiko_send_command</code></td><td>Runs one show command and returns the text</td><td><code>command_string=</code>, <code>enable=True</code>, <code>use_textfsm=True</code></td></tr>
<tr><td><code>netmiko_send_config</code></td><td>Sends configuration lines</td><td><code>config_commands=[...]</code> or <code>config_file=</code></td></tr>
<tr><td><code>netmiko_commit</code></td><td>Commits on Junos</td><td>Needed after <code>netmiko_send_config</code> there</td></tr>
<tr><td><code>netmiko_save_config</code></td><td>Saves running to startup</td><td>For platforms with a save command</td></tr></table>
<p>They live in <code>nornir_netmiko.tasks</code>. Nornir opens the SSH session the first time a task needs it, keeps it open for later tasks on the same host, and <code>nr.close_connections()</code> closes them at the end. Username, password, address and the device type all come from the inventory, so the task call never contains them.</p>

<h3>Enable mode and per-vendor commands</h3>
<p>On IOS and EOS the configuration is visible only in privileged mode. <code>enable=True</code> makes the plugin enter it with the <code>secret</code> from <code>connection_options</code> (chapter 2). On Junos and NX-OS the flag has no effect, so the same task call works on all four. The command text, however, differs: <code>show running-config</code> on three of them, <code>show configuration</code> on Junos. That is why the command is a <b>data key</b> in the groups file and the task reads <code>task.host["backup_cmd"]</code>. The task stays vendor-neutral, and the vendor knowledge lives in the inventory.</p>

<h3>Parsed output</h3>
<p>With <code>use_textfsm=True</code> the result is a list of dictionaries instead of text, using the ntc-templates you met in <code>py-textfsm</code>.</p>
<pre class="code"><span class="hl">result = nr.run(task=netmiko_send_command, command_string="show ip interface brief", use_textfsm=True)</span>
rows = result["r1"][0].result
print(type(rows).__name__, len(rows), "rows; first:", rows[0])
print("up:", [row["interface"] for row in rows if row["status"] == "up"])</pre>
<pre class="out">AUTO01$ python3 ifaces.py
<span class="hl">list 4 rows; first: {'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}</span>
up: ['GigabitEthernet0/0']</pre>
<p>The type is <code>list</code>, so <code>row["status"]</code> works. In Netmiko, when no template matches, you get the raw text back instead, so a script that loops over rows should check <code>isinstance(rows, list)</code> before it trusts the result. Lab 2 uses this on the IOS hosts.</p>

<h3>A refused command is not a failed host</h3>
<p>Run <code>show clock</code> on all four vendors. Junos has no such command, and the device answers with a syntax error. Look at what Nornir thinks.</p>
<pre class="code">nr = InitNornir(config_file="config.yaml").filter(filter_func=lambda h: h.name != "r3")
result = nr.run(task=netmiko_send_command, command_string="show clock")
for name, multi in result.items():
<span class="hl">    print("%-3s failed=%-5s %s" % (name, multi.failed, multi[0].result.strip().splitlines()[-1]))</span></pre>
<pre class="out">AUTO01$ python3 errors.py
r1  failed=False 15:23:42.327 UTC Sun Oct 11 2026
<span class="hl">j1  failed=False syntax error, expecting &lt;command&gt;.</span>
e1  failed=False Clock source: local
n1  failed=False 15:23:42.327 UTC Sun Oct 11 2026</pre>
<p><code>j1</code> shows <code>failed=False</code> and the error text sits in <code>result</code>. The SSH session worked, the command was sent, the device replied: as far as the library is concerned that is success. The same is true for <code>% Invalid input</code> on IOS and for an <code>Ambiguous</code> or <code>Incomplete</code> command. A script that only looks at <code>failed_hosts</code> will report "all good" while a host answered with an error.</p>
<p>The cure is a small wrapper task that checks the text for the markers and raises, which turns the refusal into a failed host.</p>
<pre class="code">REFUSED = ("% Invalid input", "% Ambiguous command", "% Incomplete command", "syntax error", "unknown command")


def strict_show(task, command):
    out = task.run(task=netmiko_send_command, command_string=command).result
    for marker in REFUSED:
        if marker in out:
<span class="hl">            raise ValueError("%s refused %r: %s" % (task.host.name, command, out.strip().splitlines()[-1]))</span>
    return out</pre>
<pre class="out"><span class="hl">strict_show failed hosts: ['j1']</span>
ValueError - j1 refused 'show clock': syntax error, expecting &lt;command&gt;.</pre>
<p>Now <code>j1</code> is in <code>failed_hosts</code>, and the exception tells which command was refused. Lab 2 uses the same idea: the audit script's own checks, not Netmiko, must decide what "wrong" means.</p>

<div class="warn"><p><b>Common mistake.</b> Trusting an empty <code>failed_hosts</code> as proof that the commands worked. It proves only that the connections and the sends worked. If the answer matters (a config push, a compliance check), read it or wrap the command as above.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failure types differ. A timeout or a wrong password raises an exception (<code>NetmikoTimeoutException</code>, <code>NetmikoAuthenticationException</code>) and the host fails. A refused command raises nothing and the host does not fail.</p></div>

<div class="scn"><h4>The green report with a red router</h4><p>A nightly script ran <code>show ip bgp summary</code> on 30 routers and reported "0 failed hosts". Three routers had a typo in the platform's VRF command and answered "% Invalid input detected". Nobody noticed for a week, because the report was green. After adding a marker check, the three hosts failed loudly on the next run.</p><p><b>Lesson:</b> success of the transport is not success of the command.</p></div>

<div class="iv"><p class="q">"A command is rejected by the device. Does Nornir mark the host as failed?"</p><p>No. Netmiko returns the device's error text as normal output, so the host is not failed. I wrap the task, search the output for the vendor's error markers and raise an exception. Then the host lands in <code>failed_hosts</code> and the run can report it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>nornir_netmiko</code> gives <code>netmiko_send_command</code>, <code>netmiko_send_config</code>, <code>netmiko_commit</code> and <code>netmiko_save_config</code>.</li>
<li>The inventory supplies address, credentials and device type; the task call stays clean.</li>
<li><code>enable=True</code> is safe on all four vendors; keep vendor-specific commands in inventory data.</li>
<li><code>use_textfsm=True</code> returns a list of dicts; check the type.</li>
<li>A refused command does not fail the host; check the text or raise.</li>
</ul></div>
`,hi:`
<p>Nornir khud devices se baat nahi karta. Woh <b>connection plugins</b> use karta hai, aur sabse common <code>nornir_netmiko</code> hai, jo <code>adv-nkmiko</code> ke Netmiko par patli si layer hai. Yeh chapter dikhata hai ki plugin kya deta hai, inventory use kaise feed karti hai, aur ek behaviour jo lagbhag sabko chaunkata hai: jo command device refuse kare, usse host fail nahi hota.</p>

<h3>Ek analogy: travel adapters</h3>
<p>Musafir ek charger aur plug adapters ka bag rakhta hai. Charger har desh mein wahi hai; adapter badalta hai. Aapka task charger hai. Inventory ka <code>platform</code> (<code>cisco_ios</code>, <code>juniper_junos</code>, <code>arista_eos</code>, <code>cisco_nxos</code>) adapter chunta hai, isliye wahi task chaar vendors par chalta hai.</p>

<h3>Jo tasks aap use karoge</h3>
<table class="cmp"><tr><th>Task</th><th>Kya karta hai</th><th>Notes</th></tr>
<tr><td><code>netmiko_send_command</code></td><td>Ek show command chalata hai aur text lautata hai</td><td><code>command_string=</code>, <code>enable=True</code>, <code>use_textfsm=True</code></td></tr>
<tr><td><code>netmiko_send_config</code></td><td>Configuration lines bhejta hai</td><td><code>config_commands=[...]</code> ya <code>config_file=</code></td></tr>
<tr><td><code>netmiko_commit</code></td><td>Junos par commit karta hai</td><td>Wahan <code>netmiko_send_config</code> ke baad zaroori</td></tr>
<tr><td><code>netmiko_save_config</code></td><td>Running ko startup mein save karta hai</td><td>Un platforms ke liye jinke paas save command hai</td></tr></table>
<p>Yeh <code>nornir_netmiko.tasks</code> mein hain. Nornir SSH session tab kholta hai jab pehli baar kisi task ko zaroorat ho, usi host ke agle tasks ke liye khula rakhta hai, aur ant mein <code>nr.close_connections()</code> band karta hai. Username, password, address aur device type sab inventory se aate hain, isliye task call mein kabhi nahi hote.</p>

<h3>Enable mode aur vendor ke commands</h3>
<p>IOS aur EOS par configuration sirf privileged mode mein dikhti hai. <code>enable=True</code> plugin ko <code>connection_options</code> ke <code>secret</code> (chapter 2) se enable mein le jaata hai. Junos aur NX-OS par is flag ka asar nahi hota, isliye wahi task call chaaron par chalti hai. Command ka text zaroor alag hai: teen par <code>show running-config</code>, Junos par <code>show configuration</code>. Isiliye command groups file mein ek <b>data key</b> hai aur task <code>task.host["backup_cmd"]</code> padhta hai. Task vendor-neutral rehta hai, aur vendor ka gyaan inventory mein rehta hai.</p>

<h3>Parsed output</h3>
<p><code>use_textfsm=True</code> ke saath result text ki jagah dictionaries ki list hota hai, un ntc-templates se jo aapne <code>py-textfsm</code> mein dekhe.</p>
<pre class="code"><span class="hl">result = nr.run(task=netmiko_send_command, command_string="show ip interface brief", use_textfsm=True)</span>
rows = result["r1"][0].result
print(type(rows).__name__, len(rows), "rows; first:", rows[0])
print("up:", [row["interface"] for row in rows if row["status"] == "up"])</pre>
<pre class="out">AUTO01$ python3 ifaces.py
<span class="hl">list 4 rows; first: {'interface': 'GigabitEthernet0/0', 'ip_address': '10.99.0.1', 'status': 'up', 'proto': 'up'}</span>
up: ['GigabitEthernet0/0']</pre>
<p>Type <code>list</code> hai, isliye <code>row["status"]</code> chalta hai. Netmiko mein agar koi template match na kare to raw text wapas milta hai, isliye rows par loop karne wali script ko result par bharosa karne se pehle <code>isinstance(rows, list)</code> check karna chahiye. Lab 2 IOS hosts par yahi use karta hai.</p>

<h3>Refused command failed host nahi hai</h3>
<p>Chaaron vendors par <code>show clock</code> chalao. Junos mein aisi command nahi hai, aur device syntax error se jawab deta hai. Dekho Nornir kya sochta hai.</p>
<pre class="code">nr = InitNornir(config_file="config.yaml").filter(filter_func=lambda h: h.name != "r3")
result = nr.run(task=netmiko_send_command, command_string="show clock")
for name, multi in result.items():
<span class="hl">    print("%-3s failed=%-5s %s" % (name, multi.failed, multi[0].result.strip().splitlines()[-1]))</span></pre>
<pre class="out">AUTO01$ python3 errors.py
r1  failed=False 15:23:42.327 UTC Sun Oct 11 2026
<span class="hl">j1  failed=False syntax error, expecting &lt;command&gt;.</span>
e1  failed=False Clock source: local
n1  failed=False 15:23:42.327 UTC Sun Oct 11 2026</pre>
<p><code>j1</code> <code>failed=False</code> dikhata hai aur error text <code>result</code> mein baitha hai. SSH session chala, command gayi, device ne jawab diya: library ke hisaab se yeh success hai. IOS par <code>% Invalid input</code> aur <code>Ambiguous</code> ya <code>Incomplete</code> command ke liye bhi yahi sach hai. Jo script sirf <code>failed_hosts</code> dekhti hai woh "sab theek" report karegi jabki ek host error se jawab de chuka hai.</p>
<p>Ilaaj ek chhota wrapper task hai jo text mein markers dhoondhta hai aur raise karta hai, jisse refusal failed host ban jaata hai.</p>
<pre class="code">REFUSED = ("% Invalid input", "% Ambiguous command", "% Incomplete command", "syntax error", "unknown command")


def strict_show(task, command):
    out = task.run(task=netmiko_send_command, command_string=command).result
    for marker in REFUSED:
        if marker in out:
<span class="hl">            raise ValueError("%s refused %r: %s" % (task.host.name, command, out.strip().splitlines()[-1]))</span>
    return out</pre>
<pre class="out"><span class="hl">strict_show failed hosts: ['j1']</span>
ValueError - j1 refused 'show clock': syntax error, expecting &lt;command&gt;.</pre>
<p>Ab <code>j1</code> <code>failed_hosts</code> mein hai, aur exception batata hai ki kaunsi command refuse hui. Lab 2 mein yahi soch hai: "galat" kya hai, yeh Netmiko nahi, audit script ki apni checks tay karti hain.</p>

<div class="warn"><p><b>Common mistake.</b> Khaali <code>failed_hosts</code> ko saboot maan lena ki commands chali. Yeh sirf yeh saabit karta hai ki connections aur sends chale. Jawab matter kare (config push, compliance check), to use padho ya upar jaisa wrap karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failure ke types alag hain. Timeout ya galat password exception uthata hai (<code>NetmikoTimeoutException</code>, <code>NetmikoAuthenticationException</code>) aur host fail hota hai. Refused command kuch nahi uthata aur host fail nahi hota.</p></div>

<div class="scn"><h4>Hara report, laal router</h4><p>Ek nightly script ne 30 routers par <code>show ip bgp summary</code> chalayi aur "0 failed hosts" report kiya. Teen routers mein VRF command ka typo tha aur unhone "% Invalid input detected" jawab diya. Ek hafte tak kisi ko pata nahi chala, kyunki report hari thi. Marker check jodne ke baad agli run mein teen hosts zor se fail hue.</p><p><b>Lesson:</b> transport ki success command ki success nahi hai.</p></div>

<div class="iv"><p class="q">"Device command reject kare. Kya Nornir host ko failed mark karta hai?"</p><p>Nahi. Netmiko device ka error text normal output ki tarah lautata hai, isliye host failed nahi hota. Main task ko wrap karta hoon, output mein vendor ke error markers dhoondhta hoon aur exception raise karta hoon. Tab host <code>failed_hosts</code> mein aata hai aur run use report kar sakti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>nornir_netmiko</code> deta hai <code>netmiko_send_command</code>, <code>netmiko_send_config</code>, <code>netmiko_commit</code> aur <code>netmiko_save_config</code>.</li>
<li>Inventory address, credentials aur device type deti hai; task call saaf rehti hai.</li>
<li><code>enable=True</code> chaaron vendors par safe hai; vendor-specific commands inventory data mein rakho.</li>
<li><code>use_textfsm=True</code> dicts ki list deta hai; type check karo.</li>
<li>Refused command host ko fail nahi karti; text check karo ya raise karo.</li>
</ul></div>
`}};export{e as default};