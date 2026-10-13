var e={id:`stack-hello`,h:{en:`The stack: SSH 830, hello, session-id and connect()`,hi:`Stack: SSH 830, hello, session-id aur connect()`},body:{en:`
<p>In <code>encor-yang</code> you met the four NETCONF layers. Now we look at the bottom two from the Python side: how a session starts, what the first messages are, and which arguments of <code>manager.connect()</code> matter. If a script cannot even connect, none of the later chapters help, so this chapter also gives you a table of connection failures.</p>

<h3>An analogy: a handshake at the door</h3>
<p>Think of a bank counter. You walk in (SSH to port 830), the guard checks who you are (user and password), and you are shown to window "netconf" (the subsystem). The clerk says "Hello, I am window 1633 and I can do these services" (the server hello with session-id and capabilities). You answer with your own list. From then on every form you hand over has a number (message-id), and the answer comes back stamped with the same number.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The hello exchange between client and server">
<rect x="40" y="10" width="120" height="34" rx="8" fill="#bae6fd"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client (ncclient)</text>
<rect x="480" y="10" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server (device)</text>
<line x1="100" y1="44" x2="100" y2="220" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
<line x1="540" y1="44" x2="540" y2="220" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
<line x1="100" y1="70" x2="540" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">1. SSH to port 830, ask for subsystem "netconf"</text>
<line x1="540" y1="108" x2="100" y2="108" stroke="#64748b" stroke-width="2"/><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">2. server hello: capabilities + session-id</text>
<line x1="100" y1="146" x2="540" y2="146" stroke="#64748b" stroke-width="2"/><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">3. client hello: its capabilities</text>
<line x1="100" y1="184" x2="540" y2="184" stroke="#64748b" stroke-width="2"/><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">4. rpc with message-id   (reply carries the same id)</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">manager.connect() does steps 1 to 3 for you</text>
</svg></div>
<p class="cap">The hello exchange. ncclient does steps 1 to 3 inside <code>manager.connect()</code>.</p>

<h3>The pieces</h3>
<dl class="terms">
<dt>SSH subsystem</dt><dd>A named service inside an SSH connection. NETCONF asks for the subsystem <code>netconf</code> on <b>TCP 830</b>, so there is no shell and no prompt, only XML messages.</dd>
<dt>hello</dt><dd>The first message each side sends. It lists the capabilities (the features and models). The server's hello also carries the <b>session-id</b>.</dd>
<dt>session-id</dt><dd>A number the server gives each session. It is the same for the whole session and it is what you see in a lock-denied error when another session holds the lock.</dd>
<dt>message-id</dt><dd>A number the client puts on each <code>rpc</code>. The <code>rpc-reply</code> repeats it so replies can be matched to requests. ncclient makes the ids for you.</dd>
<dt>base:1.0 and base:1.1</dt><dd>The framing versions. 1.0 ends every message with the marker <code>]]&amp;gt;]]&amp;gt;</code>; 1.1 sends chunks with a length in front, which is safer for large data. The session uses 1.1 only if <b>both</b> sides advertise it.</dd></dl>
<p>Here is what the two lab devices say in their hello:</p>
<pre class="code"><span class="c"># hello.py - what did the device say in its hello?</span>
from ncutil import DEVICES, connect

for name, dev in DEVICES.items():
    with connect(name) as m:
        caps = list(m.server_capabilities)
        print(name, dev["vendor"], "session-id", m.session_id, "-", len(caps), "capabilities")
        print("   server offers base:1.1:", "urn:ietf:params:netconf:base:1.1" in caps)</pre>
<pre class="out">AUTO01$ python3 hello.py
R1 iosxe <span class="hl">session-id 31</span> - 13 capabilities
   server offers base:1.1: <span class="hl">True</span>
J1 junos <span class="hl">session-id 1633</span> - 7 capabilities
   server offers base:1.1: <span class="hl">False</span></pre>
<p>R1 offers 13 capabilities including <code>base:1.1</code>, so the session would use chunked framing. J1 offers only <code>base:1.0</code>. Your code does not change; ncclient handles both. Session ids are per device and keep going up: R1 gave 31, J1 gave 1633 (the next session on J1 gets a higher number).</p>
<pre class="code"><span class="c"># ids.py - the session-id stays, the message-id changes with every RPC</span>
import re

from ncutil import connect

FLT = "&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;"
with connect("J1") as m:
    print("session-id:", m.session_id)
    for _ in range(2):
        reply = m.get_config(source="running", filter=("subtree", FLT))
        print("message-id:", re.search(r'message-id="([^"]+)"', reply.xml).group(1))</pre>
<pre class="out">AUTO01$ python3 ids.py
session-id: <span class="hl">1633</span>
message-id: <span class="hl">urn:uuid:13362279-23f5-49a0-ae13-6d67c7f9efb5</span>
message-id: <span class="hl">urn:uuid:83b68352-8786-4ed4-9cb0-bfe968909f37</span></pre>
<p>The message-id values are random UUIDs in this version of ncclient. Do not build logic on their shape; use them when you read a packet capture or a device log to match a request with its reply.</p>

<h3>manager.connect() arguments</h3>
<pre class="code">from ncclient import manager

m = manager.connect(
    host="10.99.0.11", port=830,            <span class="c"># NETCONF-over-SSH port, not 22</span>
    username="netops", password="NK@2026",   <span class="c"># lab values; real scripts read the environment</span>
    hostkey_verify=False,                    <span class="c"># lab only, see the warning below</span>
    allow_agent=False, look_for_keys=False,  <span class="c"># use the password, do not hunt for keys</span>
    device_params={"name": "junos"},         <span class="c"># 'iosxe', 'junos' or 'default'</span>
    timeout=10,                              <span class="c"># seconds to open the connection</span>
)
print(m.connected, m.session_id)
m.close_session()                            <span class="c"># polite goodbye; 'with' does this for you</span></pre>
<table class="cmp"><tr><th>Argument</th><th>Meaning</th></tr>
<tr><td><code>host</code>, <code>port</code></td><td>Where to connect. Port 830 for NETCONF; 22 is the CLI.</td></tr>
<tr><td><code>username</code>, <code>password</code></td><td>Account with NETCONF permission. In real scripts read them from the environment or <code>getpass</code>.</td></tr>
<tr><td><code>hostkey_verify</code></td><td><code>True</code> checks the server's key against known hosts; <code>False</code> accepts anything.</td></tr>
<tr><td><code>allow_agent</code>, <code>look_for_keys</code></td><td>Set to <code>False</code> so the script uses exactly the password you gave and does not try the keys on the machine.</td></tr>
<tr><td><code>device_params</code></td><td>Picks the vendor handler: <code>{"name": "iosxe"}</code>, <code>{"name": "junos"}</code> or <code>{"name": "default"}</code>.</td></tr>
<tr><td><code>timeout</code></td><td>Seconds allowed to open the connection. The wait for each reply is a separate setting, <code>m.timeout</code> (30 s by default).</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Leaving <code>hostkey_verify=False</code> in production. It switches off the check that you are talking to the real router, so a device in the middle could read the password. In the lab it saves typing; in production set it to <code>True</code> and keep the keys in your known hosts file.</p></div>

<h3>Why device_params matters</h3>
<p>The handler tells ncclient which vendor extras exist. The <code>junos</code> handler adds operations such as <code>compare_configuration()</code> and a Junos-aware <code>commit</code>; <code>iosxe</code> and <code>default</code> follow the standard only. The name must exist, and a made-up name fails at once.</p>
<pre class="code">from ncclient import manager

for vendor in ("junos", "default"):
    with manager.connect(device_params={"name": vendor}, **BASE) as m:
        try:
            diff = m.compare_configuration()
            print(vendor, "-&gt;", type(diff).__name__)
        except Exception as err:
            print(vendor, "-&gt;", type(err).__name__, err)</pre>
<pre class="out">AUTO01$ python3 dp.py
junos    compare_configuration() -&gt; <span class="hl">NCElement</span>
default  compare_configuration() -&gt; <span class="hl">RPCError operation-failed: syntax error</span>
name 'ios'      -&gt; <span class="hl">ModuleNotFoundError: No module named 'ncclient.devices.ios'</span></pre>
<p>Note the three results: the right handler works, the generic one sends a request Junos does not understand, and a name that does not exist never gets as far as the network.</p>

<h3>When connect() fails</h3>
<p>This is the output of one script that tries the same device six ways:</p>
<pre class="out">AUTO01$ python3 fails.py
good            connected
wrong port      <span class="hl">SSHError: Channel closed.</span>
closed port     <span class="hl">SSHError: Could not open socket to 10.99.0.11:8080</span>
wrong password  <span class="hl">AuthenticationError: AuthenticationException('Authentication failed.')</span>
host key check  <span class="hl">SSHUnknownHostError: Unknown host key [8e:ca:5e:85:06:47:d4:3d:6b:45:90:4b:20:54:9b:60] for [10.99.0.11]</span>
dead host       <span class="hl">SSHError: Could not open socket to 10.99.0.99:830</span></pre>
<table class="cmp"><tr><th>Message</th><th>Usual cause</th><th>First check</th></tr>
<tr><td><code>SSHError: Channel closed.</code></td><td>SSH works but there is no NETCONF subsystem there, for example port 22</td><td>Port is 830; <code>netconf-yang</code> (IOS XE) or <code>services netconf ssh</code> (Junos) is configured</td></tr>
<tr><td><code>SSHError: Could not open socket</code></td><td>Nothing listens, or the host is down, or a firewall drops it</td><td>Ping; <code>nc -vz host 830</code>; ACLs</td></tr>
<tr><td><code>AuthenticationError</code></td><td>Wrong user or password, or the account lacks NETCONF rights</td><td>Log in on the CLI with the same account</td></tr>
<tr><td><code>SSHUnknownHostError</code></td><td><code>hostkey_verify=True</code> and the key is not known</td><td>Add the key to known hosts after you verify it</td></tr></table>

<div class="exam"><p><b>Exam trap.</b> "Channel closed" on port 22 does not mean SSH is broken. SSH is fine; the NETCONF subsystem is simply not offered on that port. The right port is 830.</p></div>

<div class="scn"><h4>The new router that would not connect</h4><p>A script worked on 12 routers and failed on the 13th with "Channel closed". The engineer could SSH to the router by hand. The router had been built from an old template and had no <code>netconf-yang</code> line, so the port 830 service was off and the connection fell through to a plain SSH channel.</p><p><b>Lesson:</b> a login that works by hand only proves the CLI path; read the error text before you change the password.</p></div>

<div class="iv"><p class="q">"What happens when a NETCONF session starts?"</p><p>The client opens SSH to port 830 and requests the netconf subsystem. Each side sends a hello listing its capabilities, and the server's hello includes a session-id. If both support base:1.1 the session uses chunked framing, otherwise end-of-message markers. After that the client sends rpc messages with a message-id and the server answers with matching rpc-reply messages.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NETCONF is an SSH subsystem on TCP 830; there is no shell.</li>
<li>Hello messages carry capabilities; the server's hello gives the session-id.</li>
<li>message-id matches each reply to its request; ncclient creates it.</li>
<li>Use <code>device_params</code> with the right name so vendor operations exist.</li>
<li>Set <code>allow_agent=False</code> and <code>look_for_keys=False</code>; keep <code>hostkey_verify=True</code> outside the lab.</li>
</ul></div>
`,hi:`
<p><code>encor-yang</code> mein aapne NETCONF ki chaar layers dekhi thi. Ab hum neeche ki do layers ko Python ki taraf se dekhte hain: session kaise shuru hota hai, pehle messages kya hote hain, aur <code>manager.connect()</code> ke kaunse arguments zaroori hain. Agar script connect hi nahi ho paati to aage ke chapters kaam nahi aate, isliye is chapter mein connection failures ki table bhi hai.</p>

<h3>Analogy: darwaze par handshake</h3>
<p>Bank counter socho. Aap andar aate ho (port 830 par SSH), guard check karta hai aap kaun ho (user aur password), aur aapko window "netconf" (subsystem) par bheja jaata hai. Clerk kehta hai "Namaste, main window 1633 hoon aur yeh services de sakta hoon" (session-id aur capabilities ke saath server hello). Aap apni list se jawab dete ho. Uske baad aap jo bhi form dete ho uspar number hota hai (message-id), aur jawab usi number ki stamp ke saath aata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The hello exchange between client and server">
<rect x="40" y="10" width="120" height="34" rx="8" fill="#bae6fd"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client (ncclient)</text>
<rect x="480" y="10" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server (device)</text>
<line x1="100" y1="44" x2="100" y2="220" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
<line x1="540" y1="44" x2="540" y2="220" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
<line x1="100" y1="70" x2="540" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">1. SSH to port 830, ask for subsystem "netconf"</text>
<line x1="540" y1="108" x2="100" y2="108" stroke="#64748b" stroke-width="2"/><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">2. server hello: capabilities + session-id</text>
<line x1="100" y1="146" x2="540" y2="146" stroke="#64748b" stroke-width="2"/><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">3. client hello: its capabilities</text>
<line x1="100" y1="184" x2="540" y2="184" stroke="#64748b" stroke-width="2"/><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">4. rpc with message-id   (reply carries the same id)</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">manager.connect() does steps 1 to 3 for you</text>
</svg></div>
<p class="cap">Hello exchange. ncclient steps 1 se 3 <code>manager.connect()</code> ke andar karta hai.</p>

<h3>Zaroori hisse</h3>
<dl class="terms">
<dt>SSH subsystem</dt><dd>SSH connection ke andar ek naam wali service. NETCONF <b>TCP 830</b> par subsystem <code>netconf</code> maangta hai, isliye na shell hai na prompt, sirf XML messages.</dd>
<dt>hello</dt><dd>Har side ka bheja pehla message. Isme capabilities (features aur models) hoti hain. Server ke hello mein <b>session-id</b> bhi hota hai.</dd>
<dt>session-id</dt><dd>Server har session ko ek number deta hai. Poore session mein wahi rehta hai, aur lock-denied error mein jab doosra session lock pakde hota hai tab yahi number dikhta hai.</dd>
<dt>message-id</dt><dd>Client har <code>rpc</code> par ek number lagata hai. <code>rpc-reply</code> use dohrata hai taaki reply request se match ho. ncclient ids khud banata hai.</dd>
<dt>base:1.0 aur base:1.1</dt><dd>Framing versions. 1.0 har message ko <code>]]&amp;gt;]]&amp;gt;</code> marker se khatam karta hai; 1.1 aage length ke saath chunks bhejta hai, jo bade data ke liye safe hai. Session 1.1 tabhi use karta hai jab <b>dono</b> side advertise karein.</dd></dl>
<p>Dono lab devices apne hello mein yeh kehte hain:</p>
<pre class="code"><span class="c"># hello.py - what did the device say in its hello?</span>
from ncutil import DEVICES, connect

for name, dev in DEVICES.items():
    with connect(name) as m:
        caps = list(m.server_capabilities)
        print(name, dev["vendor"], "session-id", m.session_id, "-", len(caps), "capabilities")
        print("   server offers base:1.1:", "urn:ietf:params:netconf:base:1.1" in caps)</pre>
<pre class="out">AUTO01$ python3 hello.py
R1 iosxe <span class="hl">session-id 31</span> - 13 capabilities
   server offers base:1.1: <span class="hl">True</span>
J1 junos <span class="hl">session-id 1633</span> - 7 capabilities
   server offers base:1.1: <span class="hl">False</span></pre>
<p>R1 13 capabilities deta hai jisme <code>base:1.1</code> hai, isliye session chunked framing use karega. J1 sirf <code>base:1.0</code> deta hai. Aapka code nahi badalta; ncclient dono sambhalta hai. Session ids device ke hisaab se hote hain aur badhte rehte hain: R1 ne 31 diya, J1 ne 1633 (J1 ka agla session isse bada number paayega).</p>
<pre class="code"><span class="c"># ids.py - the session-id stays, the message-id changes with every RPC</span>
import re

from ncutil import connect

FLT = "&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;"
with connect("J1") as m:
    print("session-id:", m.session_id)
    for _ in range(2):
        reply = m.get_config(source="running", filter=("subtree", FLT))
        print("message-id:", re.search(r'message-id="([^"]+)"', reply.xml).group(1))</pre>
<pre class="out">AUTO01$ python3 ids.py
session-id: <span class="hl">1633</span>
message-id: <span class="hl">urn:uuid:13362279-23f5-49a0-ae13-6d67c7f9efb5</span>
message-id: <span class="hl">urn:uuid:83b68352-8786-4ed4-9cb0-bfe968909f37</span></pre>
<p>Is ncclient version mein message-id random UUID hote hain. Unki shakl par logic mat banao; unhe packet capture ya device log padhte waqt request aur reply milane ke liye use karo.</p>

<h3>manager.connect() ke arguments</h3>
<pre class="code">from ncclient import manager

m = manager.connect(
    host="10.99.0.11", port=830,            <span class="c"># NETCONF-over-SSH port, not 22</span>
    username="netops", password="NK@2026",   <span class="c"># lab values; real scripts read the environment</span>
    hostkey_verify=False,                    <span class="c"># lab only, see the warning below</span>
    allow_agent=False, look_for_keys=False,  <span class="c"># use the password, do not hunt for keys</span>
    device_params={"name": "junos"},         <span class="c"># 'iosxe', 'junos' or 'default'</span>
    timeout=10,                              <span class="c"># seconds to open the connection</span>
)
print(m.connected, m.session_id)
m.close_session()                            <span class="c"># polite goodbye; 'with' does this for you</span></pre>
<table class="cmp"><tr><th>Argument</th><th>Matlab</th></tr>
<tr><td><code>host</code>, <code>port</code></td><td>Kahan connect karna hai. NETCONF ke liye port 830; 22 CLI ka hai.</td></tr>
<tr><td><code>username</code>, <code>password</code></td><td>NETCONF permission wala account. Asli scripts mein environment ya <code>getpass</code> se padho.</td></tr>
<tr><td><code>hostkey_verify</code></td><td><code>True</code> server ki key ko known hosts se milata hai; <code>False</code> kuch bhi maan leta hai.</td></tr>
<tr><td><code>allow_agent</code>, <code>look_for_keys</code></td><td><code>False</code> rakho taaki script wahi password use kare jo aapne diya, machine ki keys na try kare.</td></tr>
<tr><td><code>device_params</code></td><td>Vendor handler chunta hai: <code>{"name": "iosxe"}</code>, <code>{"name": "junos"}</code> ya <code>{"name": "default"}</code>.</td></tr>
<tr><td><code>timeout</code></td><td>Connection kholne ke liye seconds. Har reply ka intezaar alag setting hai, <code>m.timeout</code> (default 30 s).</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Production mein <code>hostkey_verify=False</code> chhod dena. Yeh woh check band kar deta hai jo batata hai ki aap asli router se baat kar rahe ho, to beech ka device password padh sakta hai. Lab mein yeh typing bachata hai; production mein <code>True</code> rakho aur keys known hosts file mein rakho.</p></div>

<h3>device_params kyon zaroori hai</h3>
<p>Handler ncclient ko batata hai ki kaunse vendor extras hain. <code>junos</code> handler <code>compare_configuration()</code> jaise operations aur Junos-aware <code>commit</code> jodta hai; <code>iosxe</code> aur <code>default</code> sirf standard follow karte hain. Naam exist karna chahiye, aur banaya hua naam turant fail hota hai.</p>
<pre class="code">from ncclient import manager

for vendor in ("junos", "default"):
    with manager.connect(device_params={"name": vendor}, **BASE) as m:
        try:
            diff = m.compare_configuration()
            print(vendor, "-&gt;", type(diff).__name__)
        except Exception as err:
            print(vendor, "-&gt;", type(err).__name__, err)</pre>
<pre class="out">AUTO01$ python3 dp.py
junos    compare_configuration() -&gt; <span class="hl">NCElement</span>
default  compare_configuration() -&gt; <span class="hl">RPCError operation-failed: syntax error</span>
name 'ios'      -&gt; <span class="hl">ModuleNotFoundError: No module named 'ncclient.devices.ios'</span></pre>
<p>Teen results dekho: sahi handler kaam karta hai, generic wala aisi request bhejta hai jo Junos nahi samajhta, aur jo naam hai hi nahi woh network tak pahunchta hi nahi.</p>

<h3>Jab connect() fail ho</h3>
<p>Yeh ek script ka output hai jo ek hi device ko chhe tarah se try karti hai:</p>
<pre class="out">AUTO01$ python3 fails.py
good            connected
wrong port      <span class="hl">SSHError: Channel closed.</span>
closed port     <span class="hl">SSHError: Could not open socket to 10.99.0.11:8080</span>
wrong password  <span class="hl">AuthenticationError: AuthenticationException('Authentication failed.')</span>
host key check  <span class="hl">SSHUnknownHostError: Unknown host key [8e:ca:5e:85:06:47:d4:3d:6b:45:90:4b:20:54:9b:60] for [10.99.0.11]</span>
dead host       <span class="hl">SSHError: Could not open socket to 10.99.0.99:830</span></pre>
<table class="cmp"><tr><th>Message</th><th>Aam wajah</th><th>Pehla check</th></tr>
<tr><td><code>SSHError: Channel closed.</code></td><td>SSH chalta hai par wahan NETCONF subsystem nahi hai, jaise port 22</td><td>Port 830 hai; <code>netconf-yang</code> (IOS XE) ya <code>services netconf ssh</code> (Junos) configured hai</td></tr>
<tr><td><code>SSHError: Could not open socket</code></td><td>Koi sun nahi raha, ya host down hai, ya firewall drop karta hai</td><td>Ping; <code>nc -vz host 830</code>; ACLs</td></tr>
<tr><td><code>AuthenticationError</code></td><td>User ya password galat, ya account ko NETCONF rights nahi</td><td>Wahi account CLI par try karo</td></tr>
<tr><td><code>SSHUnknownHostError</code></td><td><code>hostkey_verify=True</code> aur key known nahi</td><td>Key verify karke known hosts mein jodo</td></tr></table>

<div class="exam"><p><b>Exam trap.</b> Port 22 par "Channel closed" ka matlab SSH kharab nahi hai. SSH theek hai; us port par NETCONF subsystem milta hi nahi. Sahi port 830 hai.</p></div>

<div class="scn"><h4>Naya router jo connect nahi hua</h4><p>Ek script 12 routers par chali aur 13ve par "Channel closed" se fail hui. Engineer haath se SSH kar paya. Router purane template se bana tha aur usme <code>netconf-yang</code> line nahi thi, isliye port 830 service band thi aur connection plain SSH channel par gir gaya.</p><p><b>Lesson:</b> haath se login chalna sirf CLI path saabit karta hai; password badalne se pehle error text padho.</p></div>

<div class="iv"><p class="q">"NETCONF session shuru hone par kya hota hai?"</p><p>Client port 830 par SSH kholta hai aur netconf subsystem maangta hai. Dono side apni capabilities ke saath hello bhejte hain, aur server ke hello mein session-id hota hai. Dono base:1.1 support karein to session chunked framing use karta hai, warna end-of-message markers. Uske baad client message-id ke saath rpc bhejta hai aur server matching rpc-reply deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NETCONF TCP 830 par SSH subsystem hai; shell nahi hota.</li>
<li>Hello messages capabilities le jaate hain; server ka hello session-id deta hai.</li>
<li>message-id har reply ko uski request se milata hai; ncclient banata hai.</li>
<li>Sahi naam ke saath <code>device_params</code> use karo taaki vendor operations milein.</li>
<li><code>allow_agent=False</code> aur <code>look_for_keys=False</code> rakho; lab ke bahar <code>hostkey_verify=True</code>.</li>
</ul></div>
`}};export{e as default};