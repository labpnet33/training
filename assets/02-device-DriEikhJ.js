var e={id:`device`,h:{en:`Opening and closing a Device`,hi:`Device kholna aur band karna`},body:{en:`
<p>A <code>Device</code> is the Python object that stands for one router. Creating it only stores the address and the login; nothing travels on the network until you call <code>open()</code>. That two-step design is useful: you can build a list of devices first and decide later which ones to contact.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="40" width="170" height="60" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="105" y="66" text-anchor="middle" font-size="13" class="svg-ink">Device(host=..., ...)</text><text x="105" y="82" text-anchor="middle" font-size="13" class="svg-ink">connected = False</text><rect x="235" y="40" width="170" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="66" text-anchor="middle" font-size="13" class="svg-ink">dev.open()</text><text x="320" y="82" text-anchor="middle" font-size="13" class="svg-ink">connected = True</text><rect x="450" y="40" width="170" height="60" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="535" y="66" text-anchor="middle" font-size="13" class="svg-ink">dev.close()</text><text x="535" y="82" text-anchor="middle" font-size="13" class="svg-ink">connected = False</text><line x1="190" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="405" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="25" text-anchor="middle" font-size="12" class="svg-muted">facts, rpc, tables work only here</text><text x="320" y="125" text-anchor="middle" font-size="12" class="svg-muted">a with-block does open() and close() for you</text></svg><p class="cap">The life of a Device. Creating the object does not touch the network.</p></div>
<h3>Step 0: the router must allow NETCONF</h3><p>PyEZ needs the NETCONF-over-SSH service and a login that may use it. The lab routers already have these lines:</p>
<pre class="code"><span class="c"># Junos configuration (set format)</span>
set system services ssh
set system services netconf ssh
set system login user netops class super-user authentication encrypted-password "..."</pre>
<p>Without <code>netconf ssh</code> the SSH port still answers, but the NETCONF subsystem is missing and PyEZ raises <code>ConnectClosedError</code>. You will see exactly that in chapter 8.</p>
<h3>The constructor arguments</h3>
<table class="cmp"><tr><th>Argument</th><th>Default</th><th>Meaning</th></tr><tr><td><code>host</code></td><td>-</td><td>Name or IP address of the router</td></tr><tr><td><code>user</code>, <code>passwd</code></td><td>-</td><td>Login. <code>password</code> is accepted as a second spelling of <code>passwd</code></td></tr><tr><td><code>port</code></td><td>830</td><td>NETCONF over SSH</td></tr><tr><td><code>gather_facts</code></td><td>True</td><td>Read the facts during <code>open()</code></td></tr><tr><td><code>timeout</code></td><td>30</td><td>Seconds to wait for an RPC reply (changeable at run time)</td></tr><tr><td><code>conn_open_timeout</code></td><td>30</td><td>Seconds to wait while opening the session</td></tr><tr><td><code>auto_probe</code></td><td>0</td><td>Seconds to probe the port before connecting (0 = off)</td></tr><tr><td><code>normalize</code></td><td>False</td><td>Strip whitespace from RPC reply text (chapter 5)</td></tr></table>
<p>Real PyEZ also accepts <code>ssh_private_key_file</code> for key logins. In the lab only password login is simulated, so the labs use <code>passwd</code>.</p>
<h3>Open, use, close</h3><p>The script below walks through the whole life. Look at <code>gather_facts=False</code>: the facts are not read at <code>open()</code>, yet <code>dev.facts</code> still works because PyEZ loads them on first access.</p>
<pre class="code">from jnpr.junos import Device
from pyezutil import FLEET, USER, PASSWORD

dev = Device(host=FLEET["J1"], user=USER, passwd=PASSWORD, gather_facts=False)
print(dev, dev.connected)
dev.open()
print(dev.connected, dev.hostname, dev.user, dev.timeout)
print(dev.facts["hostname"])
dev.close()
print(dev.connected)</pre>
<pre class="out">AUTO01$ python3 connect.py
Device(10.99.0.11) False
<span class="hl">True 10.99.0.11 netops 30</span>
PUN-J1
False</pre>
<p>The repr <code>Device(10.99.0.11)</code> is how PyEZ prints the object, and it is also how it prints errors. <code>dev.connected</code> is <code>False</code> before <code>open()</code> and again after <code>close()</code>.</p>
<h3>The with-block: the habit to keep</h3><p>If a script crashes between <code>open()</code> and <code>close()</code>, the session stays open on the router until it times out. A router can limit how many NETCONF sessions it accepts, so a crashing script that runs every five minutes can lock out the next one. A <code>with</code> block closes the session even when an exception passes through.</p>
<p>Every script in this module starts from one helper, <code>pyezutil.py</code>. It returns a Device that is <b>not opened yet</b>, so the caller decides how to open it.</p>
<pre class="code">"""pyezutil.py - the Junos inventory and one device() helper for the PyEZ scripts"""
from jnpr.junos import Device

USER = "netops"
PASSWORD = "NK@2026"          <span class="c"># lab value only; real scripts read it from the environment</span>

FLEET = {
    "J1": "10.99.0.11",
    "J2": "10.99.0.12",
    "J3": "10.99.0.13",
}


def device(host, **extra):
    """Return a Device that is NOT opened yet; use it in a with-block."""
    return Device(host=host, user=USER, passwd=PASSWORD, **extra)</pre>
<h3>Timeouts, probe and options</h3><p>Three more tools help in the field. <code>dev.timeout</code> can be changed at run time for a slow command. <code>dev.probe(timeout)</code> checks whether the port answers without a login and returns <code>True</code> or <code>False</code>. <code>dev.uptime</code> is the router uptime in seconds.</p>
<pre class="code">from jnpr.junos import Device
from pyezutil import FLEET, USER, PASSWORD

dev = Device(host=FLEET["J2"], user=USER, passwd=PASSWORD, port=830, timeout=10, gather_facts=False)
print(dev.timeout, dev.connected)
print("probe J2:", dev.probe(timeout=2))
print("probe dead:", Device(host="10.99.0.77", user=USER, passwd=PASSWORD).probe(timeout=2))
dev.open()
print(dev.uptime)
dev.timeout = 60
print(dev.timeout)
dev.close()</pre>
<pre class="out">AUTO01$ python3 opts.py
10 False
<span class="hl">probe J2: True</span>
<span class="hl">probe dead: False</span>
143
60</pre>
<div class="warn"><p><b>Common mistakes.</b> Using port 22 (that is the CLI, not NETCONF). Calling <code>dev.rpc</code> before <code>open()</code>. Leaving a password in the script: read it with <code>os.environ</code> or <code>getpass</code>, as in <code>py-secrets</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Creating <code>Device(...)</code> does not connect. The connection happens in <code>open()</code>, or at the start of a with-block. Default port is 830.</p></div>
<div class="scn"><h4>The job that locked itself out</h4><p>A nightly script opened a Device in a loop and called <code>close()</code> only on the happy path. One router returned an error, the script crashed, and the open sessions stayed on the other routers. The next run could not open new sessions on two of them until the old ones timed out. Wrapping each router in a with-block ended the problem.</p><p><b>Lesson:</b> let a with-block do the closing.</p></div>
<div class="iv"><p class="q">"What happens when you create a PyEZ Device object?"</p><p>Nothing on the network. The object only holds the host, login and options. The session opens with <code>open()</code> or when a with-block starts, facts are read then unless <code>gather_facts=False</code>, and <code>close()</code> or the end of the block ends the session.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>Device(host, user, passwd)</code> builds the object; <code>open()</code> connects.</li><li>Default port is 830; the router needs <code>netconf ssh</code>.</li><li>Use a with-block so the session always closes.</li><li><code>gather_facts=False</code> skips the facts at open; <code>timeout</code> can change at run time.</li><li>Keep passwords out of scripts.</li></ul></div>
`,hi:`
<p><code>Device</code> woh Python object hai jo ek router ko represent karta hai. Ise banane se sirf address aur login store hote hain; jab tak <code>open()</code> na bulao network par kuch nahi jaata. Yeh do-step design kaam ka hai: pehle devices ki list bana lo aur baad mein tay karo kin ko contact karna hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="40" width="170" height="60" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="105" y="66" text-anchor="middle" font-size="13" class="svg-ink">Device(host=..., ...)</text><text x="105" y="82" text-anchor="middle" font-size="13" class="svg-ink">connected = False</text><rect x="235" y="40" width="170" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="66" text-anchor="middle" font-size="13" class="svg-ink">dev.open()</text><text x="320" y="82" text-anchor="middle" font-size="13" class="svg-ink">connected = True</text><rect x="450" y="40" width="170" height="60" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="535" y="66" text-anchor="middle" font-size="13" class="svg-ink">dev.close()</text><text x="535" y="82" text-anchor="middle" font-size="13" class="svg-ink">connected = False</text><line x1="190" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="405" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="25" text-anchor="middle" font-size="12" class="svg-muted">facts, rpc, tables sirf yahan chalte hain</text><text x="320" y="125" text-anchor="middle" font-size="12" class="svg-muted">with-block open() aur close() tumhare liye karta hai</text></svg><p class="cap">Device ka jeevan. Object banane se network ko haath nahi lagta.</p></div>
<h3>Step 0: router ko NETCONF allow karna hoga</h3><p>PyEZ ko NETCONF-over-SSH service aur aisa login chahiye jo use kar sake. Lab routers mein yeh lines pehle se hain:</p>
<pre class="code"><span class="c"># Junos configuration (set format)</span>
set system services ssh
set system services netconf ssh
set system login user netops class super-user authentication encrypted-password "..."</pre>
<p><code>netconf ssh</code> ke bina SSH port jawab deta rehta hai, par NETCONF subsystem nahi hota aur PyEZ <code>ConnectClosedError</code> raise karta hai. Yahi chapter 8 mein dekhoge.</p>
<h3>Constructor ke arguments</h3>
<table class="cmp"><tr><th>Argument</th><th>Default</th><th>Matlab</th></tr><tr><td><code>host</code></td><td>-</td><td>Router ka naam ya IP address</td></tr><tr><td><code>user</code>, <code>passwd</code></td><td>-</td><td>Login. <code>password</code>, <code>passwd</code> ki doosri spelling hai</td></tr><tr><td><code>port</code></td><td>830</td><td>NETCONF over SSH</td></tr><tr><td><code>gather_facts</code></td><td>True</td><td><code>open()</code> ke dauran facts padho</td></tr><tr><td><code>timeout</code></td><td>30</td><td>RPC reply ke liye seconds (run time par badal sakte ho)</td></tr><tr><td><code>conn_open_timeout</code></td><td>30</td><td>Session kholte waqt kitne seconds ruko</td></tr><tr><td><code>auto_probe</code></td><td>0</td><td>Connect se pehle port probe karne ke seconds (0 = off)</td></tr><tr><td><code>normalize</code></td><td>False</td><td>RPC reply text se whitespace hatao (chapter 5)</td></tr></table>
<p>Asli PyEZ key login ke liye <code>ssh_private_key_file</code> bhi leta hai. Lab mein sirf password login simulate hota hai, isliye labs <code>passwd</code> use karte hain.</p>
<h3>Open, use, close</h3><p>Neeche ki script poora jeevan dikhati hai. <code>gather_facts=False</code> dekho: <code>open()</code> par facts nahi padhe jaate, phir bhi <code>dev.facts</code> chalta hai kyunki PyEZ pehli baar access par unhe load karta hai.</p>
<pre class="code">from jnpr.junos import Device
from pyezutil import FLEET, USER, PASSWORD

dev = Device(host=FLEET["J1"], user=USER, passwd=PASSWORD, gather_facts=False)
print(dev, dev.connected)
dev.open()
print(dev.connected, dev.hostname, dev.user, dev.timeout)
print(dev.facts["hostname"])
dev.close()
print(dev.connected)</pre>
<pre class="out">AUTO01$ python3 connect.py
Device(10.99.0.11) False
<span class="hl">True 10.99.0.11 netops 30</span>
PUN-J1
False</pre>
<p>Repr <code>Device(10.99.0.11)</code> PyEZ ka object print karne ka tareeka hai, aur errors bhi isi tarah print hote hain. <code>dev.connected</code> <code>open()</code> se pehle <code>False</code> hai aur <code>close()</code> ke baad dobara <code>False</code>.</p>
<h3>With-block: jo aadat rakhni hai</h3><p>Agar script <code>open()</code> aur <code>close()</code> ke beech crash ho jaye to session router par timeout hone tak khula rehta hai. Router NETCONF sessions ki sankhya limit kar sakta hai, isliye har paanch minute chalne wali crashing script agli script ko bahar kar sakti hai. <code>with</code> block exception guzarne par bhi session band kar deta hai.</p>
<p>Is module ki har script ek helper <code>pyezutil.py</code> se shuru hoti hai. Yeh aisa Device lautata hai jo <b>abhi khula nahi</b>, taaki caller khud tay kare kaise kholna hai.</p>
<pre class="code">"""pyezutil.py - the Junos inventory and one device() helper for the PyEZ scripts"""
from jnpr.junos import Device

USER = "netops"
PASSWORD = "NK@2026"          <span class="c"># lab value only; real scripts read it from the environment</span>

FLEET = {
    "J1": "10.99.0.11",
    "J2": "10.99.0.12",
    "J3": "10.99.0.13",
}


def device(host, **extra):
    """Return a Device that is NOT opened yet; use it in a with-block."""
    return Device(host=host, user=USER, passwd=PASSWORD, **extra)</pre>
<h3>Timeouts, probe aur options</h3><p>Field mein teen aur tools kaam aate hain. <code>dev.timeout</code> dheemi command ke liye run time par badla ja sakta hai. <code>dev.probe(timeout)</code> bina login ke check karta hai ki port jawab deta hai ya nahi aur <code>True</code> ya <code>False</code> lautata hai. <code>dev.uptime</code> router ka uptime seconds mein hai.</p>
<pre class="code">from jnpr.junos import Device
from pyezutil import FLEET, USER, PASSWORD

dev = Device(host=FLEET["J2"], user=USER, passwd=PASSWORD, port=830, timeout=10, gather_facts=False)
print(dev.timeout, dev.connected)
print("probe J2:", dev.probe(timeout=2))
print("probe dead:", Device(host="10.99.0.77", user=USER, passwd=PASSWORD).probe(timeout=2))
dev.open()
print(dev.uptime)
dev.timeout = 60
print(dev.timeout)
dev.close()</pre>
<pre class="out">AUTO01$ python3 opts.py
10 False
<span class="hl">probe J2: True</span>
<span class="hl">probe dead: False</span>
143
60</pre>
<div class="warn"><p><b>Aam galtiyan.</b> Port 22 use karna (woh CLI hai, NETCONF nahi). <code>open()</code> se pehle <code>dev.rpc</code> bulana. Password script mein chhod dena: <code>py-secrets</code> ki tarah <code>os.environ</code> ya <code>getpass</code> se padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Device(...)</code> banane se connect nahi hota. Connection <code>open()</code> mein hota hai, ya with-block ke shuru mein. Default port 830 hai.</p></div>
<div class="scn"><h4>Woh job jo khud ko bahar kar baithi</h4><p>Ek nightly script loop mein Device kholti thi aur <code>close()</code> sirf happy path par bulati thi. Ek router ne error diya, script crash hui, aur baaki routers par sessions khule rah gaye. Agli run do routers par naye sessions nahi khol saki jab tak purane timeout na ho gaye. Har router ko with-block mein daalne se masla khatam.</p><p><b>Lesson:</b> closing with-block ko karne do.</p></div>
<div class="iv"><p class="q">"PyEZ Device object banane par kya hota hai?"</p><p>Network par kuch nahi. Object sirf host, login aur options rakhta hai. Session <code>open()</code> se ya with-block shuru hone par khulta hai, tab facts padhe jaate hain jab tak <code>gather_facts=False</code> na ho, aur <code>close()</code> ya block ka ant session khatam karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>Device(host, user, passwd)</code> object banata hai; <code>open()</code> connect karta hai.</li><li>Default port 830 hai; router ko <code>netconf ssh</code> chahiye.</li><li>With-block use karo taaki session hamesha band ho.</li><li><code>gather_facts=False</code> open par facts chhod deta hai; <code>timeout</code> run time par badal sakta hai.</li><li>Passwords scripts se bahar rakho.</li></ul></div>
`}};export{e as default};