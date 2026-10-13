var e=String.raw`<pre class="code"><span class="c"># d_conn.py - the two ways to connect</span>
import pyeapi

conn = pyeapi.connect(host="10.99.0.11", username="netops", password="NK@2026")
print(conn)
print(conn.execute(["show hostname"]))
node = pyeapi.connect(host="10.99.0.11", username="netops", password="NK@2026", return_node=True)
print(node)
print(node.run_commands("show hostname"))</pre>
<pre class="out">AUTO01$ python3 d_conn.py
HttpsEapiConnection(host=10.99.0.11, port=None, username=netops)
{'jsonrpc': '2.0', 'id': '1', 'result': [{'fqdn': 'LEAF1', 'hostname': 'LEAF1'}]}
Node(connection=HttpsEapiConnection(host=10.99.0.11, port=None, username=netops))
[<span class="hl">{'fqdn': 'LEAF1', 'hostname': 'LEAF1'}</span>]</pre>`,t=String.raw`<pre class="code"><span class="c"># ~/.eapi.conf (Lab 1, step 2)</span>
[connection:leaf1]
host: 10.99.0.11
username: netops
password: NK@2026
transport: h&#116;tps

[connection:leaf2]
host: 10.99.0.12
username: netops
password: NK@2026
transport: h&#116;tps</pre>`,n=String.raw`<pre class="code"><span class="c"># facts.py - ask every leaf in ~/.eapi.conf who it is</span>
import pyeapi

for name in ("leaf1", "leaf2"):
    node = pyeapi.connect_to(name)
    print(name, node.model, node.version, node.version_number)
    print("   hostname:", node.run_commands("show hostname")[0]["hostname"])</pre>
<pre class="out">AUTO01$ python3 facts.py
leaf1 vEOS-lab <span class="hl">4.31.4M 4.31.4</span>
   hostname: LEAF1
leaf2 vEOS-lab 4.31.4M 4.31.4
   hostname: LEAF2</pre>`,r=String.raw`<pre class="code"><span class="c"># d_prof.py - what pyeapi knows about the file</span>
import pyeapi

pyeapi.load_config()
print(pyeapi.client.config.connections)
print(pyeapi.config_for("leaf2"))
node = pyeapi.connect_to("leaf2")
print(node)
try:
    pyeapi.connect_to("leaf9")
except AttributeError as err:
    print("AttributeError:", err)</pre>
<pre class="out">AUTO01$ python3 d_prof.py
['leaf1', 'leaf2']
{'host': '10.99.0.12', 'username': 'netops', 'password': 'NK@2026', 'transport': 'h&#116;tps'}
Node(connection=HttpsEapiConnection(host=10.99.0.12, port=None, username=netops))
AttributeError: <span class="hl">connection profile not found in config</span></pre>`,i=String.raw`<pre class="code"><span class="c"># d_env.py - no password in the file: read it from the environment (py-secrets)</span>
import os

import pyeapi

node = pyeapi.connect(host="10.99.0.11", username=os.environ["EAPI_USER"],
                      password=os.environ["EAPI_PASS"], return_node=True)
print(node.version)</pre>
<pre class="out">AUTO01$ EAPI_USER=netops EAPI_PASS=NK@2026 python3 d_env.py
4.31.4M</pre>`,a=String.raw`<pre class="code"><span class="c"># d_conn2.py - an unknown transport</span>
import pyeapi

try:
    pyeapi.connect(transport="smtp", host="10.99.0.11", username="netops", password="NK@2026")
except TypeError as err:
    print(type(err).__name__, "|", err)</pre>
<pre class="out">AUTO01$ python3 d_conn2.py
TypeError | <span class="hl">Invalid transport specified</span></pre>`,o={id:`connect-profiles`,h:{en:`Connecting: pyeapi.connect, .eapi.conf and the Node`,hi:`Connect karna: pyeapi.connect, .eapi.conf aur Node`},body:{en:`
<p>You know what travels on the wire. Now let pyeapi build it. There are two ideas to separate: the <b>connection</b> (how to reach a switch) and the <b>Node</b> (an object that knows how to run commands on it). This chapter is Lab 1, step 2.</p>

<h3>connect(): connection or Node</h3>
<p><code>pyeapi.connect()</code> builds a connection. By default it returns the bare <code>EapiConnection</code>, whose <code>execute()</code> gives you the raw JSON-RPC reply. With <code>return_node=True</code> it returns a <code>Node</code>, which adds <code>run_commands</code>, <code>config</code>, <code>api()</code> and the rest. You almost always want the Node.</p>
`+e+`
<p>The bare connection returns the full reply (<code>jsonrpc</code>, <code>id</code>, <code>result</code>). The Node unwraps it to the list of results. Notice <code>port=None</code>: the transport picks the default port.</p>
<table class="cmp"><tr><th>Argument</th><th>Default</th><th>Meaning</th></tr>
<tr><td><code>transport</code></td><td><code>h&#116;tps</code></td><td><code>h&#116;tps</code> (port 443) or <code>h&#116;tp</code> (port 80). <code>socket</code> and <code>http_local</code> exist only for scripts running on the switch itself.</td></tr>
<tr><td><code>host</code></td><td><code>localhost</code></td><td>Name or address of the switch.</td></tr>
<tr><td><code>username</code>, <code>password</code></td><td><code>admin</code>, empty</td><td>Basic authentication.</td></tr>
<tr><td><code>port</code></td><td><code>None</code></td><td>Override when the service listens elsewhere (<code>protocol h&#116;tps port 8443</code>).</td></tr>
<tr><td><code>timeout</code></td><td>60</td><td>Seconds to wait before giving up.</td></tr>
<tr><td><code>return_node</code></td><td><code>False</code></td><td><code>True</code> returns a Node.</td></tr></table>
`+a+`

<h3>Profiles in .eapi.conf</h3>
<p>Typing host and password in every script is how credentials leak. pyeapi reads <b>connection profiles</b> from an INI file. The search list is <code>~/.eapi.conf</code>, then <code>/mnt/flash/eapi.conf</code> (the switch's own flash), then <code>eapi.conf</code> in the current folder; if the <code>EAPI_CONF</code> environment variable is set, that one file is used instead. Each section is named <code>connection:NAME</code>; the keys are the same as the arguments of <code>connect()</code>, plus <code>enablepwd</code>. If you leave out <code>host</code>, the section name is used as the host name.</p>
`+t+`
<p>Now scripts say <i>which</i> switch, not <i>how</i> to reach it. <code>connect_to(name)</code> reads the profile and returns a Node. This is Lab 1, step 2: write the file, then <code>facts.py</code>.</p>
`+n+`
<p><code>node.model</code>, <code>node.version</code> and <code>node.version_number</code> all come from one <code>show version</code> that the Node runs on first use and then caches. <code>version_number</code> strips the image flavour letter (<code>M</code> here). Use it when you compare versions.</p>
`+r+`
<p>An unknown profile name raises <code>AttributeError</code>, not a connection error: the failure is in your own configuration, before any packet is sent. <code>config_for()</code> returns the profile as a dictionary, which is also a quick way to see what the file really contains.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> In the lab the file is read the first time a profile is used. Real pyeapi reads it when it is imported. If a script reads <code>pyeapi.client.config.connections</code> before it connects, call <code>pyeapi.load_config()</code> first, as <code>d_prof.py</code> does. That is correct on both. The <code>socket</code> and <code>http_local</code> transports are for scripts that run on the switch itself; do not use them from a server.</p></div>

<h3>Keeping the password out of the file</h3>
<p>The profile file holds a password in clear text. Protect it with <code>chmod 600 ~/.eapi.conf</code> (Lab 2 ends with this), keep it out of git, and give automation its own low-risk account. Better, leave the password out and pass it from the environment, as you learned in <code>py-secrets</code>.</p>
`+i+`
<div class="warn"><p><b>Common mistake.</b> Using the admin account for every script. Make a dedicated user such as <code>netops</code> (or a read-only <code>viewer</code> for reporting scripts) so the switch's log and the hit table show who did what.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>connect()</code> returns a connection, not a Node, unless you pass <code>return_node=True</code>. <code>connect_to()</code> always returns a Node.</p></div>

<div class="scn"><h4>The profile that was not there</h4><p>A cron job started failing with <code>AttributeError: connection profile not found in config</code> right after a server rebuild. The job ran as a different user, so it looked for <code>~/.eapi.conf</code> in an empty home folder. Setting <code>EAPI_CONF=/etc/nk/eapi.conf</code> in the crontab fixed it.</p><p><b>Lesson:</b> that error means "the name is not in any file pyeapi could read", not "the switch is down".</p></div>

<div class="iv"><p class="q">"How do you manage many switches and their credentials with pyeapi?"</p><p>With connection profiles in an INI file: one <code>[connection:NAME]</code> section per switch, loaded by <code>connect_to(NAME)</code>. The file is mode 600 and outside version control, or I leave the password out and pass it from an environment variable or a vault. Scripts use names, never addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>connect()</code> gives a connection; <code>return_node=True</code> or <code>connect_to()</code> gives a Node.</li>
<li>Profiles live in <code>[connection:NAME]</code> sections of <code>~/.eapi.conf</code> (or <code>EAPI_CONF</code>).</li>
<li>Default transport is <code>h&#116;tps</code> on port 443; unknown profile means <code>AttributeError</code>.</li>
<li><code>node.version</code>, <code>version_number</code> and <code>model</code> come from one cached <code>show version</code>.</li>
<li>Protect the file with chmod 600, or read secrets from the environment.</li>
</ul></div>
`,hi:`
<p>Aap jaante ho wire par kya jaata hai. Ab pyeapi ko use banane do. Do ideas alag rakho: <b>connection</b> (switch tak kaise pahunchna hai) aur <b>Node</b> (woh object jo us par commands chalana jaanta hai). Yeh chapter Lab 1 ka step 2 hai.</p>

<h3>connect(): connection ya Node</h3>
<p><code>pyeapi.connect()</code> connection banata hai. Default mein woh bare <code>EapiConnection</code> lautata hai jiska <code>execute()</code> raw JSON-RPC reply deta hai. <code>return_node=True</code> ke saath woh <code>Node</code> lautata hai jisme <code>run_commands</code>, <code>config</code>, <code>api()</code> aur baaki sab jud jaata hai. Aap lagbhag hamesha Node chahoge.</p>
`+e+`
<p>Bare connection poora reply (<code>jsonrpc</code>, <code>id</code>, <code>result</code>) deta hai. Node use results ki list mein unwrap kar deta hai. <code>port=None</code> dekho: transport default port chunta hai.</p>
<table class="cmp"><tr><th>Argument</th><th>Default</th><th>Matlab</th></tr>
<tr><td><code>transport</code></td><td><code>h&#116;tps</code></td><td><code>h&#116;tps</code> (port 443) ya <code>h&#116;tp</code> (port 80). <code>socket</code> aur <code>http_local</code> sirf us script ke liye hain jo switch par hi chalti hai.</td></tr>
<tr><td><code>host</code></td><td><code>localhost</code></td><td>Switch ka naam ya address.</td></tr>
<tr><td><code>username</code>, <code>password</code></td><td><code>admin</code>, khaali</td><td>Basic authentication.</td></tr>
<tr><td><code>port</code></td><td><code>None</code></td><td>Service kahin aur sun rahi ho to override karo (<code>protocol h&#116;tps port 8443</code>).</td></tr>
<tr><td><code>timeout</code></td><td>60</td><td>Haar maanne se pehle kitne seconds ruko.</td></tr>
<tr><td><code>return_node</code></td><td><code>False</code></td><td><code>True</code> Node lautata hai.</td></tr></table>
`+a+`

<h3>.eapi.conf mein profiles</h3>
<p>Har script mein host aur password type karna hi credentials leak hone ka tareeka hai. pyeapi <b>connection profiles</b> INI file se padhta hai. Search list: <code>~/.eapi.conf</code>, phir <code>/mnt/flash/eapi.conf</code> (yaani switch ki apni flash), phir current folder ka <code>eapi.conf</code>; agar <code>EAPI_CONF</code> environment variable set hai to uski ek file hi use hoti hai. Har section ka naam <code>connection:NAME</code> hota hai; keys <code>connect()</code> ke arguments ke barabar hain, saath mein <code>enablepwd</code>. <code>host</code> chhod do to section ka naam host name ban jaata hai.</p>
`+t+`
<p>Ab scripts batati hain <i>kaunsa</i> switch, <i>kaise</i> pahunchna nahi. <code>connect_to(name)</code> profile padhta hai aur Node lautata hai. Yeh Lab 1 ka step 2 hai: file likho, phir <code>facts.py</code>.</p>
`+n+`
<p><code>node.model</code>, <code>node.version</code> aur <code>node.version_number</code> teeno ek <code>show version</code> se aate hain jo Node pehli baar use par chalata hai aur phir cache kar leta hai. <code>version_number</code> image flavour ka letter (yahan <code>M</code>) hata deta hai. Versions compare karte waqt isse use karo.</p>
`+r+`
<p>Anjaan profile naam <code>AttributeError</code> deta hai, connection error nahi: failure aapki apni configuration mein hai, koi packet bheje jaane se pehle. <code>config_for()</code> profile ko dictionary ki tarah lautata hai, aur file mein asal mein kya hai yeh dekhne ka tez tareeka bhi hai.</p>

<div class="note"><p><b>Lab vs real gear.</b> Lab mein file pehli baar profile use hone par padhi jaati hai. Asli pyeapi use import hote hi padhta hai. Agar script connect karne se pehle <code>pyeapi.client.config.connections</code> padhti hai to pehle <code>pyeapi.load_config()</code> bulao, jaise <code>d_prof.py</code> karti hai. Dono par sahi hai. <code>socket</code> aur <code>http_local</code> transports un scripts ke liye hain jo switch par hi chalti hain; server se unhe use mat karo.</p></div>

<h3>Password ko file se bahar rakhna</h3>
<p>Profile file mein password clear text mein hota hai. <code>chmod 600 ~/.eapi.conf</code> se bachao (Lab 2 isi par khatam hota hai), git se bahar rakho, aur automation ko apna kam-risk account do. Behtar: password file mein mat rakho aur environment se do, jaise aapne <code>py-secrets</code> mein seekha.</p>
`+i+`
<div class="warn"><p><b>Common mistake.</b> Har script ke liye admin account use karna. <code>netops</code> jaisa dedicated user banao (reporting scripts ke liye read-only <code>viewer</code>) taaki switch ka log aur hit table dikhaye kisne kya kiya.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>return_node=True</code> na do to <code>connect()</code> Node nahi, connection lautata hai. <code>connect_to()</code> hamesha Node lautata hai.</p></div>

<div class="scn"><h4>Woh profile jo wahan thi hi nahi</h4><p>Server rebuild ke turant baad ek cron job <code>AttributeError: connection profile not found in config</code> se fail hone lagi. Job doosre user se chalti thi, isliye woh khaali home folder mein <code>~/.eapi.conf</code> dhoondh rahi thi. Crontab mein <code>EAPI_CONF=/etc/nk/eapi.conf</code> set karne se theek hua.</p><p><b>Lesson:</b> us error ka matlab "naam pyeapi ki padh sakne wali kisi file mein nahi hai", "switch down hai" nahi.</p></div>

<div class="iv"><p class="q">"pyeapi ke saath bahut saare switches aur unke credentials kaise manage karte ho?"</p><p>INI file ke connection profiles se: har switch ke liye ek <code>[connection:NAME]</code> section, <code>connect_to(NAME)</code> se load. File mode 600 aur version control se bahar hoti hai, ya password chhodkar environment variable ya vault se deta hoon. Scripts naam use karti hain, addresses nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>connect()</code> connection deta hai; <code>return_node=True</code> ya <code>connect_to()</code> Node deta hai.</li>
<li>Profiles <code>~/.eapi.conf</code> (ya <code>EAPI_CONF</code>) ke <code>[connection:NAME]</code> sections mein rehti hain.</li>
<li>Default transport port 443 par <code>h&#116;tps</code> hai; anjaan profile ka matlab <code>AttributeError</code>.</li>
<li><code>node.version</code>, <code>version_number</code> aur <code>model</code> ek cached <code>show version</code> se aate hain.</li>
<li>File ko chmod 600 se bachao, ya secrets environment se padho.</li>
</ul></div>
`}};export{o as default};