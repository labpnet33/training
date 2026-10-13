var e={id:`drivers-connect`,h:{en:`Drivers and connections: get_network_driver, optional_args and the exception ladder`,hi:`Drivers aur connections: get_network_driver, optional_args aur exception ladder`},body:{en:`<p>Before any getter or diff, a NAPALM script has to get through the front door of a device. Every platform has a different door: a username and an enable secret on IOS, a NETCONF subsystem on Junos, an HTTPS API on EOS. This chapter shows the one call that picks the right door, the arguments each door needs, and the errors you meet when it will not open.</p>

<h3>An analogy: one key ring, three locks</h3>
<p>You carry one ring with three keys. <code>get_network_driver("ios")</code> hands you the right key for the Cisco lock, <code>"junos"</code> the Juniper one, <code>"eos"</code> the Arista one. A wrong key name does not fit any lock, and a right key in a lock that is bolted from inside (the API is off) still does not turn.</p>

<h3>Step 1: pick the driver</h3>
<table class="cmp"><tr><th>Name</th><th>Platform</th><th>Transport</th></tr>
<tr><td><code>ios</code></td><td>Cisco IOS and IOS XE</td><td>SSH through netmiko</td></tr>
<tr><td><code>junos</code></td><td>Juniper Junos</td><td>NETCONF, port 830, through PyEZ</td></tr>
<tr><td><code>eos</code></td><td>Arista EOS</td><td>eAPI over HTTPS through pyeapi</td></tr>
<tr><td><code>nxos_ssh</code></td><td>Cisco NX-OS over SSH</td><td>SSH through netmiko</td></tr>
<tr><td><code>nxos</code></td><td>Cisco NX-OS over NX-API</td><td>NX-API on real gear</td></tr></table>
<p><code>get_network_driver(name)</code> returns a <b>class</b>, not a connection. You then call that class with the device address and your login. An unknown name raises <code>ModuleImportError</code>, whose text names the package NAPALM looked for.</p>

<h3>Step 2: build the object and open it</h3>
<pre class="code">driver = get_network_driver("ios")
dev = driver(hostname, username, password, timeout=60, optional_args={...})
dev.open()      # the session starts here
dev.close()     # always close, or use: with driver(...) as dev:</pre>
<p><code>optional_args</code> is a dictionary of driver-specific settings. The ones you will use:</p>
<table class="cmp"><tr><th>Driver</th><th>Useful optional_args</th></tr>
<tr><td><code>ios</code></td><td><code>secret</code> (enable password), <code>transport</code> (ssh or telnet), <code>port</code>, <code>dest_file_system</code>, <code>auto_rollback_on_error</code></td></tr>
<tr><td><code>eos</code></td><td><code>transport</code> (https default, or h&#116;tp), <code>port</code>, <code>enable_password</code></td></tr>
<tr><td><code>junos</code></td><td><code>port</code> (NETCONF, 830), <code>config_lock</code>, <code>lock_disable</code>, <code>config_format</code>, <code>ignore_warning</code></td></tr></table>

<h3>Step 3: one inventory, one helper</h3>
<p>In the lab every script imports <code>nkdev.py</code>. The inventory says which driver each device needs; <code>open_device(name)</code> hides the differences. Lab 1 gives you this file already.</p>
<pre class="code">"""nkdev.py - inventory and one open_device() helper for the NAPALM scripts"""
from napalm import get_network_driver

USER = "netops"
PASSWORD = "NK@2026"<span class="c">          # lab value only; real scripts read it from the environment</span>

DEVICES = {
    "R1": {"host": "10.99.0.1", "driver": "ios", "args": {"secret": "NK@2026"}},
    "J1": {"host": "10.99.0.11", "driver": "junos", "args": {}},
    "E1": {"host": "10.99.0.21", "driver": "eos", "args": {}},
}


def open_device(name):
    d = DEVICES[name]
    driver = get_network_driver(d["driver"])
    dev = driver(d["host"], USER, PASSWORD, timeout=30, optional_args=d["args"])
    dev.open()
    return dev</pre>
<p>The password sits in the file only because this is a lab; in real work read it from the environment or a vault, as in <code>py-secrets</code> (and, later, <code>adv-vault</code>).</p>

<h3>What a connected object can do</h3>
<p>Every driver offers <code>is_alive()</code>, <code>cli(commands)</code> and <code>get_config()</code> next to the getters. <code>cli()</code> is your escape hatch: it sends show commands and returns raw text in a dictionary keyed by command.</p>
<pre class="code">from napalm import get_network_driver

driver = get_network_driver("ios")
dev = driver(hostname="10.99.0.1", username="netops", password="NK@2026", timeout=30, optional_args={"secret": "NK@2026"})
print("before open:", dev.is_alive())
dev.open()
print("after open: ", dev.is_alive())
out = dev.cli(["show clock", "show ip interface brief"])
for cmd, text in out.items():
    print("%-24s %d line(s)" % (cmd, len(text.splitlines())))
print(out["show ip interface brief"].splitlines()[0])
dev.close()
print("after close:", dev.is_alive())</pre>
<pre class="out">AUTO01$ python3 conn.py
before open: {'is_alive': False}
after open:  {<span class="hl">'is_alive': True</span>}
show clock               1 line(s)
show ip interface brief  6 line(s)
Interface              IP-Address      OK? Method Status                Protocol
after close: {'is_alive': False}</pre>
<p><code>is_alive()</code> returns a dictionary, not a bare boolean. Do not write <code>if dev.is_alive():</code>, because a non-empty dictionary is always true; write <code>dev.is_alive()["is_alive"]</code>.</p>

<h3>The exception ladder at connect time</h3>
<p>Exceptions live in <code>napalm.base.exceptions</code>. Six situations are enough to teach every case. <code>errors.py</code> tries them all:</p>
<pre class="code">from napalm import get_network_driver
from napalm.base.exceptions import ModuleImportError

try:
    get_network_driver("foo")
except ModuleImportError as err:
    print("ModuleImportError:", err)

TESTS = [
    ("ios", "10.99.0.1", "wrong-pass", {"secret": "NK@2026"}),
    ("ios", "10.99.0.99", "NK@2026", {"secret": "NK@2026"}),
    ("eos", "10.99.0.21", "wrong-pass", {}),
    ("eos", "10.99.0.99", "NK@2026", {}),
    ("junos", "10.99.0.11", "wrong-pass", {}),
    ("junos", "10.99.0.99", "NK@2026", {}),
]
for drv, host, pw, args in TESTS:
    dev = get_network_driver(drv)(host, "netops", pw, timeout=10, optional_args=args)
    try:
        dev.open()
    except Exception as err:
        text = str(err).splitlines()[0] if str(err) else ""
        print("%-5s %-10s %s: %s" % (drv, host, type(err).__name__, text))</pre>
<pre class="out">AUTO01$ python3 errors.py
ModuleImportError: Cannot import "napalm_foo". Is the library installed?
ios   10.99.0.1  ConnectionException: Authentication to device failed.
ios   10.99.0.99 ConnectionException: TCP connection to device failed.
eos   10.99.0.21 ConnectionException: Unauthorized. Check the user name and password (HT&#84;P 401)
eos   10.99.0.99 ConnectionException: Socket error during eAPI connection: timed out
junos 10.99.0.11 <span class="hl">ConnectAuthError: ConnectAuthError(10.99.0.11)</span>
junos 10.99.0.99 ConnectionException: ConnectTimeoutError(10.99.0.99)</pre>
<table class="cmp"><tr><th>Symptom</th><th>Cause</th></tr>
<tr><td><code>ModuleImportError</code></td><td>The driver name is wrong or not installed.</td></tr>
<tr><td><code>ConnectionException: Authentication to device failed.</code></td><td>IOS or NX-OS: wrong user or password.</td></tr>
<tr><td><code>ConnectionException: TCP connection to device failed.</code></td><td>Host down, SSH off or wrong port.</td></tr>
<tr><td><code>ConnectionException: Unauthorized ... (HT&#84;P 401)</code></td><td>EOS: wrong user or password.</td></tr>
<tr><td><code>ConnectionException: Socket error during eAPI connection</code></td><td>EOS: host down or eAPI switched off.</td></tr>
<tr><td><code>ConnectAuthError</code> (PyEZ)</td><td>Junos: wrong password. The PyEZ exception passes through.</td></tr>
<tr><td><code>ConnectionException: ConnectTimeoutError</code></td><td>Junos: host unreachable.</td></tr></table>
<p>Junos with NETCONF switched off raises PyEZ's <code>ConnectRefusedError</code> in the same way. Catch <code>ConnectionException</code> for most failures and, if you run Junos, also the PyEZ classes from <code>jnpr.junos.exception</code>.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab's exception texts match the real drivers closely, and a dead host fails at once instead of after a long timeout. The <code>timeout</code> argument is accepted but you do not wait for it. The lab's R1 reports a long NK-OS version line in <code>os_version</code>; a real IOS XE router prints its own release string.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>secret</code> on IOS when the user lands in user mode. Using the CLI port for Junos instead of 830. Leaving eAPI off on EOS. Never leave a connection open when an exception is raised: use <code>with</code> or <code>try/finally</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> The constructor is <code>driver(hostname, username, password, timeout=60, optional_args=None)</code>. The connection starts at <code>open()</code>, not at construction, so a wrong password is raised by <code>open()</code>.</p></div>

<div class="scn"><h4>Only J1 is red</h4><p>After a "clean" configuration replace on J1 the nightly job reported <code>ConnectRefusedError(10.99.0.11)</code> for the Junos router only. SSH still worked, which fooled the on-call engineer. The replace file did not contain <code>set system services netconf ssh</code>, so the NETCONF subsystem had gone. Restoring that line brought the job back.</p><p><b>Lesson:</b> a NAPALM driver depends on the API of the platform. Keep that API line in every golden configuration.</p></div>

<div class="iv"><p class="q">"A NAPALM script works for IOS but fails on Junos with a connection error. What do you check?"</p><p>I read the exception class. A refused connection on Junos means NETCONF is not enabled or port 830 is blocked, so I check <code>set system services netconf ssh</code> and reachability of 830. A <code>ConnectAuthError</code> means credentials. I do not assume SSH working means NETCONF working.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>get_network_driver(name)</code> returns a class; <code>driver(...)</code> builds the object; <code>open()</code> connects.</li>
<li><code>optional_args</code> carries the enable secret (ios), transport (eos) and NETCONF port (junos).</li>
<li>Junos needs NETCONF and EOS needs eAPI switched on.</li>
<li><code>is_alive()</code> returns a dictionary; <code>cli()</code> returns raw text per command.</li>
<li>Read the exception class: ModuleImportError, ConnectionException, or the PyEZ class on Junos.</li></ul></div>`,hi:`<p>Kisi bhi getter ya diff se pehle NAPALM script ko device ke front door se guzarna padta hai. Har platform ka darwaza alag hai: IOS par username aur enable secret, Junos par NETCONF subsystem, EOS par HTTPS API. Yeh chapter woh ek call dikhata hai jo sahi darwaza chunti hai, har darwaze ke arguments, aur woh errors jo darwaza na khulne par milte hain.</p>

<h3>Ek analogy: ek key ring, teen taale</h3>
<p>Aapke paas ek ring mein teen chabiyan hain. <code>get_network_driver("ios")</code> Cisco ke taale ki sahi chabi deta hai, <code>"junos"</code> Juniper ki, <code>"eos"</code> Arista ki. Galat chabi ka naam kisi taale mein nahi baithta, aur sahi chabi bhi us taale mein nahi ghoomti jo andar se band ho (API off ho).</p>

<h3>Step 1: driver chuno</h3>
<table class="cmp"><tr><th>Naam</th><th>Platform</th><th>Transport</th></tr>
<tr><td><code>ios</code></td><td>Cisco IOS aur IOS XE</td><td>netmiko ke through SSH</td></tr>
<tr><td><code>junos</code></td><td>Juniper Junos</td><td>PyEZ ke through NETCONF, port 830</td></tr>
<tr><td><code>eos</code></td><td>Arista EOS</td><td>pyeapi ke through HTTPS par eAPI</td></tr>
<tr><td><code>nxos_ssh</code></td><td>Cisco NX-OS SSH par</td><td>netmiko ke through SSH</td></tr>
<tr><td><code>nxos</code></td><td>Cisco NX-OS NX-API par</td><td>Asli gear par NX-API</td></tr></table>
<p><code>get_network_driver(name)</code> ek <b>class</b> lautata hai, connection nahi. Phir aap us class ko device address aur login ke saath bulate ho. Anjaan naam <code>ModuleImportError</code> uthata hai jiska text us package ka naam batata hai jo NAPALM ne dhoondha.</p>

<h3>Step 2: object banao aur kholo</h3>
<pre class="code">driver = get_network_driver("ios")
dev = driver(hostname, username, password, timeout=60, optional_args={...})
dev.open()      # session yahan shuru hota hai
dev.close()     # hamesha band karo, ya use karo: with driver(...) as dev:</pre>
<p><code>optional_args</code> driver-specific settings ki dictionary hai. Jo aap use karoge:</p>
<table class="cmp"><tr><th>Driver</th><th>Kaam ke optional_args</th></tr>
<tr><td><code>ios</code></td><td><code>secret</code> (enable password), <code>transport</code> (ssh ya telnet), <code>port</code>, <code>dest_file_system</code>, <code>auto_rollback_on_error</code></td></tr>
<tr><td><code>eos</code></td><td><code>transport</code> (https default, ya h&#116;tp), <code>port</code>, <code>enable_password</code></td></tr>
<tr><td><code>junos</code></td><td><code>port</code> (NETCONF, 830), <code>config_lock</code>, <code>lock_disable</code>, <code>config_format</code>, <code>ignore_warning</code></td></tr></table>

<h3>Step 3: ek inventory, ek helper</h3>
<p>Lab mein har script <code>nkdev.py</code> import karti hai. Inventory batati hai har device ko kaunsa driver chahiye; <code>open_device(name)</code> farq chhupa deta hai. Lab 1 yeh file aapko pehle se deta hai.</p>
<pre class="code">"""nkdev.py - inventory and one open_device() helper for the NAPALM scripts"""
from napalm import get_network_driver

USER = "netops"
PASSWORD = "NK@2026"<span class="c">          # lab value only; real scripts read it from the environment</span>

DEVICES = {
    "R1": {"host": "10.99.0.1", "driver": "ios", "args": {"secret": "NK@2026"}},
    "J1": {"host": "10.99.0.11", "driver": "junos", "args": {}},
    "E1": {"host": "10.99.0.21", "driver": "eos", "args": {}},
}


def open_device(name):
    d = DEVICES[name]
    driver = get_network_driver(d["driver"])
    dev = driver(d["host"], USER, PASSWORD, timeout=30, optional_args=d["args"])
    dev.open()
    return dev</pre>
<p>Password file mein sirf isliye hai kyunki yeh lab hai; asli kaam mein ise environment ya vault se padho, jaise <code>py-secrets</code> mein (aur aage <code>adv-vault</code> mein).</p>

<h3>Connected object kya kar sakta hai</h3>
<p>Har driver getters ke saath <code>is_alive()</code>, <code>cli(commands)</code> aur <code>get_config()</code> bhi deta hai. <code>cli()</code> aapka escape hatch hai: yeh show commands bhejta hai aur command ke naam ki dictionary mein raw text lautata hai.</p>
<pre class="code">from napalm import get_network_driver

driver = get_network_driver("ios")
dev = driver(hostname="10.99.0.1", username="netops", password="NK@2026", timeout=30, optional_args={"secret": "NK@2026"})
print("before open:", dev.is_alive())
dev.open()
print("after open: ", dev.is_alive())
out = dev.cli(["show clock", "show ip interface brief"])
for cmd, text in out.items():
    print("%-24s %d line(s)" % (cmd, len(text.splitlines())))
print(out["show ip interface brief"].splitlines()[0])
dev.close()
print("after close:", dev.is_alive())</pre>
<pre class="out">AUTO01$ python3 conn.py
before open: {'is_alive': False}
after open:  {<span class="hl">'is_alive': True</span>}
show clock               1 line(s)
show ip interface brief  6 line(s)
Interface              IP-Address      OK? Method Status                Protocol
after close: {'is_alive': False}</pre>
<p><code>is_alive()</code> dictionary lautata hai, seedha boolean nahi. <code>if dev.is_alive():</code> mat likho, kyunki non-empty dictionary hamesha true hoti hai; <code>dev.is_alive()["is_alive"]</code> likho.</p>

<h3>Connect ke waqt exception ladder</h3>
<p>Exceptions <code>napalm.base.exceptions</code> mein rehti hain. Chhe situations har case sikhane ke liye kaafi hain. <code>errors.py</code> sab try karti hai:</p>
<pre class="code">from napalm import get_network_driver
from napalm.base.exceptions import ModuleImportError

try:
    get_network_driver("foo")
except ModuleImportError as err:
    print("ModuleImportError:", err)

TESTS = [
    ("ios", "10.99.0.1", "wrong-pass", {"secret": "NK@2026"}),
    ("ios", "10.99.0.99", "NK@2026", {"secret": "NK@2026"}),
    ("eos", "10.99.0.21", "wrong-pass", {}),
    ("eos", "10.99.0.99", "NK@2026", {}),
    ("junos", "10.99.0.11", "wrong-pass", {}),
    ("junos", "10.99.0.99", "NK@2026", {}),
]
for drv, host, pw, args in TESTS:
    dev = get_network_driver(drv)(host, "netops", pw, timeout=10, optional_args=args)
    try:
        dev.open()
    except Exception as err:
        text = str(err).splitlines()[0] if str(err) else ""
        print("%-5s %-10s %s: %s" % (drv, host, type(err).__name__, text))</pre>
<pre class="out">AUTO01$ python3 errors.py
ModuleImportError: Cannot import "napalm_foo". Is the library installed?
ios   10.99.0.1  ConnectionException: Authentication to device failed.
ios   10.99.0.99 ConnectionException: TCP connection to device failed.
eos   10.99.0.21 ConnectionException: Unauthorized. Check the user name and password (HT&#84;P 401)
eos   10.99.0.99 ConnectionException: Socket error during eAPI connection: timed out
junos 10.99.0.11 <span class="hl">ConnectAuthError: ConnectAuthError(10.99.0.11)</span>
junos 10.99.0.99 ConnectionException: ConnectTimeoutError(10.99.0.99)</pre>
<table class="cmp"><tr><th>Lakshan</th><th>Wajah</th></tr>
<tr><td><code>ModuleImportError</code></td><td>Driver ka naam galat hai ya install nahi hai.</td></tr>
<tr><td><code>ConnectionException: Authentication to device failed.</code></td><td>IOS ya NX-OS: user ya password galat.</td></tr>
<tr><td><code>ConnectionException: TCP connection to device failed.</code></td><td>Host down, SSH off ya port galat.</td></tr>
<tr><td><code>ConnectionException: Unauthorized ... (HT&#84;P 401)</code></td><td>EOS: user ya password galat.</td></tr>
<tr><td><code>ConnectionException: Socket error during eAPI connection</code></td><td>EOS: host down ya eAPI off.</td></tr>
<tr><td><code>ConnectAuthError</code> (PyEZ)</td><td>Junos: password galat. PyEZ ki exception seedha nikal aati hai.</td></tr>
<tr><td><code>ConnectionException: ConnectTimeoutError</code></td><td>Junos: host unreachable.</td></tr></table>
<p>Junos par NETCONF off ho to PyEZ ki <code>ConnectRefusedError</code> usi tarah uthti hai. Zyada tar failures ke liye <code>ConnectionException</code> pakdo aur Junos chalate ho to <code>jnpr.junos.exception</code> ki PyEZ classes bhi pakdo.</p>

<div class="note"><p><b>Lab mein vs asli gear par.</b> Lab ke exception texts asli drivers se kaafi milte hain, aur dead host lambe timeout ke baad nahi balki turant fail hota hai. <code>timeout</code> argument accept hota hai par aap intezar nahi karte. Lab ka R1 <code>os_version</code> mein lamba NK-OS version line batata hai; asli IOS XE router apna release string batata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> IOS par jab user, user mode mein pahunche tab <code>secret</code> bhool jana. Junos ke liye 830 ki jagah CLI port use karna. EOS par eAPI off chhodna. Exception uthne par connection khula mat chhodo: <code>with</code> ya <code>try/finally</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Constructor <code>driver(hostname, username, password, timeout=60, optional_args=None)</code> hai. Connection <code>open()</code> par shuru hota hai, construction par nahi, isliye galat password <code>open()</code> uthata hai.</p></div>

<div class="scn"><h4>Sirf J1 laal hai</h4><p>J1 par "clean" configuration replace ke baad nightly job ne sirf Junos router ke liye <code>ConnectRefusedError(10.99.0.11)</code> report kiya. SSH ab bhi chal raha tha, jisne on-call engineer ko dhoka diya. Replace file mein <code>set system services netconf ssh</code> nahi thi, isliye NETCONF subsystem chala gaya tha. Woh line wapas daalne se job wapas aa gayi.</p><p><b>Lesson:</b> NAPALM driver platform ki API par nirbhar hai. Woh API line har golden configuration mein rakho.</p></div>

<div class="iv"><p class="q">"NAPALM script IOS par chalti hai par Junos par connection error deti hai. Kya check karoge?"</p><p>Main exception class padhta hoon. Junos par refused connection ka matlab NETCONF enabled nahi hai ya port 830 blocked hai, isliye main <code>set system services netconf ssh</code> aur 830 ki reachability check karta hoon. <code>ConnectAuthError</code> ka matlab credentials hain. Main yeh nahi maanta ki SSH chal raha hai to NETCONF bhi chal raha hoga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>get_network_driver(name)</code> class lautata hai; <code>driver(...)</code> object banata hai; <code>open()</code> connect karta hai.</li>
<li><code>optional_args</code> mein enable secret (ios), transport (eos) aur NETCONF port (junos) jaate hain.</li>
<li>Junos ko NETCONF aur EOS ko eAPI on chahiye.</li>
<li><code>is_alive()</code> dictionary lautata hai; <code>cli()</code> har command ka raw text lautata hai.</li>
<li>Exception class padho: ModuleImportError, ConnectionException, ya Junos par PyEZ class.</li></ul></div>`}};export{e as default};