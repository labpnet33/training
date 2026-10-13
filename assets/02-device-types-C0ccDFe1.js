var e={id:`device-types`,h:{en:`The device_type map and the dev dictionary`,hi:`device_type map aur dev dictionary`},body:{en:`
<p><b>The idea of this chapter:</b> every netmiko connection starts with one word, the <b>device_type</b>. It is the dialect code. ConnectHandler reads it and hands you a driver class written for that platform. Get the word right and the rest of the module is easy; get it wrong and nothing behaves.</p>

<h3>Analogy: the country code on a phone call</h3>
<p>You dial +91 or +44 before the number. The code does not change the number, it changes the network that carries the call. The <code>device_type</code> does the same: the host and password stay, but the driver that handles prompts, paging, config mode and commit changes.</p>

<h3>The map</h3>
<table class="cmp"><tr><th>Platform</th><th>Real device_type</th><th>Lab alias (Program 1)</th><th>Prompt in the lab</th></tr>
<tr><td>Cisco IOS and IOS XE</td><td><code>cisco_ios</code> (also <code>cisco_xe</code>)</td><td><code>nk_ios</code>, <code>nk_iosxe</code></td><td><code>PUN-CORE-R1#</code></td></tr>
<tr><td>Cisco NX-OS</td><td><code>cisco_nxos</code></td><td><code>nk_nxos</code></td><td><code>N1#</code></td></tr>
<tr><td>Arista EOS</td><td><code>arista_eos</code></td><td><code>nk_eos</code></td><td><code>E1#</code></td></tr>
<tr><td>Juniper Junos</td><td><code>juniper_junos</code> (also <code>juniper</code>)</td><td><code>nk_junos</code></td><td><code>netops@J1&gt;</code></td></tr>
<tr><td>Cisco ASA</td><td><code>cisco_asa</code></td><td>-</td><td><code>ASA1#</code></td></tr>
<tr><td>Fortinet FortiOS</td><td><code>fortinet</code></td><td>-</td><td><code>FGT1 #</code></td></tr>
<tr><td>Palo Alto PAN-OS</td><td><code>paloalto_panos</code></td><td>-</td><td><code>admin@PA1&gt;</code></td></tr></table>
<p>Two more names are worth knowing: <code>autodetect</code> (let <code>SSHDetect</code> guess, chapter 9) and <code>generic</code> / <code>terminal_server</code> for devices netmiko has no driver for. The lab aliases <code>nk_ios</code>, <code>nk_eos</code>, <code>nk_junos</code> and so on exist only in the lab so that Program 1 scripts keep running. In Program 2 you write the real names, because that is the code that runs on real gear.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="device_type selects a driver class">
<rect x="10" y="55" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="13">ConnectHandler(**dev)</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="11">device_type = "arista_eos"</text>
<rect x="230" y="55" width="130" height="60" rx="8" fill="#fde68a"/><text x="295" y="82" text-anchor="middle" class="svg-ink" font-size="13">class map</text><text x="295" y="100" text-anchor="middle" class="svg-muted" font-size="11">CLASS_MAPPER</text>
<line x1="160" y1="85" x2="230" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="5" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="27" text-anchor="middle" class="svg-ink" font-size="12">CiscoIosSSH</text>
<rect x="440" y="45" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="67" text-anchor="middle" class="svg-ink" font-size="12">JuniperSSH</text>
<rect x="440" y="85" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="107" text-anchor="middle" class="svg-ink" font-size="12">AristaSSH</text>
<rect x="440" y="125" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="147" text-anchor="middle" class="svg-ink" font-size="12">CiscoNxosSSH</text>
<line x1="360" y1="85" x2="440" y2="22" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="85" x2="440" y2="62" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="85" x2="440" y2="102" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="85" x2="440" y2="142" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">ConnectHandler is a factory: the device_type picks the driver class, and the class carries the platform's rules.</p></div>

<h3>The dev dictionary</h3>
<pre class="code">dev = {
    "device_type": "juniper_junos",   <span class="c"># required: the dialect</span>
    "host": "10.99.0.11",             <span class="c"># required: IP or DNS name</span>
    "username": "netops",
    "password": "...",                <span class="c"># from the environment, never typed in code</span>
    "secret": "...",                  <span class="c"># enable password (IOS, EOS, ASA); ignored by Junos</span>
    "port": 22,                       <span class="c"># default 22</span>
    "conn_timeout": 10,               <span class="c"># seconds to open the TCP connection</span>
    "session_log": "logs/J1.log",     <span class="c"># everything netmiko saw and sent</span>
}
conn = ConnectHandler(**dev)          <span class="c"># ** turns the dictionary into keyword arguments</span></pre>
<p>Because it is a plain dictionary you can store it in a file, build it from an inventory row and reuse it. The other arguments you will meet are <code>auth_timeout</code> and <code>banner_timeout</code> (login phase), <code>global_delay_factor</code> and <code>fast_cli</code> (speed tuning), and <code>session_log_file_mode</code>.</p>

<h3>A wrong device_type is caught early, or late</h3>
<p>A name netmiko does not know stops at once with <code>ValueError</code>. A name that exists but is the wrong one for the box is caught only when the driver and the device disagree (chapter 9). Check the inventory before the run:</p>
<pre class="out">AUTO01$ python3 ch2.py
cisco_ios       in platforms: True
cisco_xe        in platforms: True
cisco_nxos      in platforms: True
arista_eos      in platforms: True
juniper_junos   in platforms: True
cisco_asa       in platforms: True
fortinet        in platforms: True
paloalto_panos  in platforms: True
<span class="hl">Unsupported 'device_type' currently supported platforms are:</span>
arista_eos
autodetect
cisco_asa
cisco_ios
cisco_nxos
cisco_xe
fortinet
generic
juniper
juniper_junos
nk_eos
nk_ios
nk_iosxe
nk_junos
nk_nxos
paloalto_panos
terminal_server
AUTO01$ python3 ch2b.py
unknown device_type: ['R9']</pre>
<p>The second script uses <code>from netmiko.ssh_dispatcher import platforms</code> and lists the inventory rows whose type is not in it. Real netmiko prints a longer platform list than the lab does.</p>

<h3>Lab 1, tasks 1 and 2: inventory, credentials, probe</h3>
<p>Do not put device facts in the code. Put them in <code>inventory.csv</code>, and put passwords in <code>.env</code>, which only the owner may read (<code>chmod 600 .env</code>). The inventory stores the <i>name</i> of the password variable, so N1 can use a different password from the others:</p>
<pre class="code">name,host,device_type,pass_var
R1,10.99.0.1,cisco_ios,NET_PASS
J1,10.99.0.11,juniper_junos,NET_PASS
E1,10.99.0.21,arista_eos,NET_PASS
N1,10.99.0.31,cisco_nxos,NXOS_PASS</pre>
<pre class="code"><span class="c"># common.py</span>
import csv
import os

from dotenv import load_dotenv
from netmiko import ConnectHandler

load_dotenv(".env")                    <span class="c"># puts NET_USER, NET_PASS, NXOS_PASS into os.environ</span>


def load_inventory(path="inventory.csv"):
    with open(path) as f:
        return list(csv.DictReader(f))


def device_params(row):
    password = os.environ[row["pass_var"]]
    return {
        "device_type": row["device_type"],
        "host": row["host"],
        "username": os.environ["NET_USER"],
        "password": password,
        "secret": password,
        "session_log": f"logs/{row['name']}.log",
    }


def connect(row):
    os.makedirs("logs", exist_ok=True)
    return ConnectHandler(**device_params(row))</pre>
<pre class="code"><span class="c"># probe.py</span>
from common import load_inventory, connect

for row in load_inventory():
    with connect(row) as conn:
        print(f"{row['name']:&lt;4} {row['device_type']:&lt;14} {conn.find_prompt()}")</pre>
<pre class="out">AUTO01$ python3 probe.py
R1   cisco_ios      PUN-CORE-R1#
<span class="hl">J1   juniper_junos  netops@J1&gt;</span>
E1   arista_eos     E1#
N1   cisco_nxos     N1#</pre>
<p>Four platforms, one loop, four different prompts. The <code>with</code> block disconnects for you, even when an error happens inside it.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>cisco_ios</code> for NX-OS or EOS "because the commands look alike": show commands may look fine and then config, save and prompt handling go wrong. Forgetting <code>secret</code> on IOS-like devices that need <code>enable</code>. A missing variable in <code>.env</code> raises <code>KeyError</code>, not a netmiko error. Committing <code>.env</code> to git.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ConnectHandler</code> is a factory function, not one class. <code>Netmiko</code> is another name for it. The module also exposes <code>ssh_dispatcher.platforms</code> with the supported names.</p></div>

<div class="scn"><h4>One typo, one dead 02:00 run</h4><p>A colleague added a Cisco IOS XR router to the inventory with <code>cisco_xr</code>, a name that is not what netmiko calls it. The nightly run reached that row after thirty good devices, raised <code>ValueError</code> and exited, so nothing after row thirty-one was collected.</p><p><b>Lesson:</b> validate the whole inventory against <code>platforms</code> before connecting to anything, and treat one bad row as a reported failure, not a crash.</p></div>

<div class="iv"><p class="q">"What does the device_type argument do in netmiko?"</p><p>It selects the driver class from a mapping. The class knows the platform's prompt pattern, how to disable paging, how to enter and leave config mode, how to commit and how to save. The same host and credentials with another device_type behave differently, so the type must come from the inventory, per device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>device_type picks the driver: <code>cisco_ios</code>, <code>cisco_nxos</code>, <code>arista_eos</code>, <code>juniper_junos</code>, <code>cisco_asa</code>, <code>fortinet</code>, <code>paloalto_panos</code>.</li>
<li>The lab's <code>nk_*</code> names are Program 1 aliases; write the real names now.</li>
<li>Build the dev dictionary from an inventory row plus environment variables.</li>
<li>Validate device_type values before the run starts.</li>
<li>Use <code>with ConnectHandler(...) as conn</code> so the session always closes.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> har netmiko connection ek shabd se shuru hota hai, <b>device_type</b>. Yeh dialect code hai. ConnectHandler use padhta hai aur us platform ke liye likhi driver class aapko deta hai. Shabd sahi ho to module ka baaki hissa aasaan hai; galat ho to kuch bhi sahi behave nahi karta.</p>

<h3>Analogy: phone call ka country code</h3>
<p>Number se pehle aap +91 ya +44 dial karte ho. Code number nahi badalta, woh network badalta hai jo call ko le jaata hai. <code>device_type</code> bhi aisa hi karta hai: host aur password wahi rehte hain, par prompts, paging, config mode aur commit sambhalne wala driver badal jaata hai.</p>

<h3>Map</h3>
<table class="cmp"><tr><th>Platform</th><th>Asli device_type</th><th>Lab alias (Program 1)</th><th>Lab mein prompt</th></tr>
<tr><td>Cisco IOS aur IOS XE</td><td><code>cisco_ios</code> (aur <code>cisco_xe</code>)</td><td><code>nk_ios</code>, <code>nk_iosxe</code></td><td><code>PUN-CORE-R1#</code></td></tr>
<tr><td>Cisco NX-OS</td><td><code>cisco_nxos</code></td><td><code>nk_nxos</code></td><td><code>N1#</code></td></tr>
<tr><td>Arista EOS</td><td><code>arista_eos</code></td><td><code>nk_eos</code></td><td><code>E1#</code></td></tr>
<tr><td>Juniper Junos</td><td><code>juniper_junos</code> (aur <code>juniper</code>)</td><td><code>nk_junos</code></td><td><code>netops@J1&gt;</code></td></tr>
<tr><td>Cisco ASA</td><td><code>cisco_asa</code></td><td>-</td><td><code>ASA1#</code></td></tr>
<tr><td>Fortinet FortiOS</td><td><code>fortinet</code></td><td>-</td><td><code>FGT1 #</code></td></tr>
<tr><td>Palo Alto PAN-OS</td><td><code>paloalto_panos</code></td><td>-</td><td><code>admin@PA1&gt;</code></td></tr></table>
<p>Do naam aur jaanne layak hain: <code>autodetect</code> (<code>SSHDetect</code> se guess karwana, chapter 9) aur <code>generic</code> / <code>terminal_server</code> un devices ke liye jinke liye netmiko ke paas driver nahi hai. Lab aliases <code>nk_ios</code>, <code>nk_eos</code>, <code>nk_junos</code> waghera sirf lab mein hain taaki Program 1 ki scripts chalti rahein. Program 2 mein aap asli naam likhte ho, kyunki wahi code asli gear par chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="device_type selects a driver class">
<rect x="10" y="55" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="13">ConnectHandler(**dev)</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="11">device_type = "arista_eos"</text>
<rect x="230" y="55" width="130" height="60" rx="8" fill="#fde68a"/><text x="295" y="82" text-anchor="middle" class="svg-ink" font-size="13">class map</text><text x="295" y="100" text-anchor="middle" class="svg-muted" font-size="11">CLASS_MAPPER</text>
<line x1="160" y1="85" x2="230" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="5" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="27" text-anchor="middle" class="svg-ink" font-size="12">CiscoIosSSH</text>
<rect x="440" y="45" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="67" text-anchor="middle" class="svg-ink" font-size="12">JuniperSSH</text>
<rect x="440" y="85" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="107" text-anchor="middle" class="svg-ink" font-size="12">AristaSSH</text>
<rect x="440" y="125" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="535" y="147" text-anchor="middle" class="svg-ink" font-size="12">CiscoNxosSSH</text>
<line x1="360" y1="85" x2="440" y2="22" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="85" x2="440" y2="62" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="85" x2="440" y2="102" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="85" x2="440" y2="142" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">ConnectHandler ek factory hai: device_type driver class chunta hai, aur class platform ke niyam rakhti hai.</p></div>

<h3>dev dictionary</h3>
<pre class="code">dev = {
    "device_type": "juniper_junos",   <span class="c"># zaroori: dialect</span>
    "host": "10.99.0.11",             <span class="c"># zaroori: IP ya DNS naam</span>
    "username": "netops",
    "password": "...",                <span class="c"># environment se, code mein type nahi</span>
    "secret": "...",                  <span class="c"># enable password (IOS, EOS, ASA); Junos ignore karta hai</span>
    "port": 22,                       <span class="c"># default 22</span>
    "conn_timeout": 10,               <span class="c"># TCP connection kholne ke seconds</span>
    "session_log": "logs/J1.log",     <span class="c"># netmiko ne jo dekha aur bheja sab</span>
}
conn = ConnectHandler(**dev)          <span class="c"># ** dictionary ko keyword arguments bana deta hai</span></pre>
<p>Kyunki yeh simple dictionary hai, ise file mein rakh sakte ho, inventory row se bana sakte ho aur dobara use kar sakte ho. Aur arguments jo milenge: <code>auth_timeout</code> aur <code>banner_timeout</code> (login phase), <code>global_delay_factor</code> aur <code>fast_cli</code> (speed tuning), aur <code>session_log_file_mode</code>.</p>

<h3>Galat device_type ya to jaldi pakda jaata hai, ya der se</h3>
<p>Jo naam netmiko nahi jaanta woh turant <code>ValueError</code> se ruk jaata hai. Jo naam exist karta hai par box ke liye galat hai woh tabhi pakda jaata hai jab driver aur device ek doosre se asehmat hon (chapter 9). Run se pehle inventory check karo:</p>
<pre class="out">AUTO01$ python3 ch2.py
cisco_ios       in platforms: True
cisco_xe        in platforms: True
cisco_nxos      in platforms: True
arista_eos      in platforms: True
juniper_junos   in platforms: True
cisco_asa       in platforms: True
fortinet        in platforms: True
paloalto_panos  in platforms: True
<span class="hl">Unsupported 'device_type' currently supported platforms are:</span>
arista_eos
autodetect
cisco_asa
cisco_ios
cisco_nxos
cisco_xe
fortinet
generic
juniper
juniper_junos
nk_eos
nk_ios
nk_iosxe
nk_junos
nk_nxos
paloalto_panos
terminal_server
AUTO01$ python3 ch2b.py
unknown device_type: ['R9']</pre>
<p>Doosri script <code>from netmiko.ssh_dispatcher import platforms</code> use karti hai aur woh inventory rows batati hai jinka type usme nahi hai. Asli netmiko lab se lambi platform list print karta hai.</p>

<h3>Lab 1, tasks 1 aur 2: inventory, credentials, probe</h3>
<p>Device ki baatein code mein mat rakho. Unhe <code>inventory.csv</code> mein rakho, aur passwords <code>.env</code> mein, jise sirf owner padh sake (<code>chmod 600 .env</code>). Inventory password variable ka <i>naam</i> rakhti hai, taaki N1 baaki se alag password use kar sake:</p>
<pre class="code">name,host,device_type,pass_var
R1,10.99.0.1,cisco_ios,NET_PASS
J1,10.99.0.11,juniper_junos,NET_PASS
E1,10.99.0.21,arista_eos,NET_PASS
N1,10.99.0.31,cisco_nxos,NXOS_PASS</pre>
<pre class="code"><span class="c"># common.py</span>
import csv
import os

from dotenv import load_dotenv
from netmiko import ConnectHandler

load_dotenv(".env")                    <span class="c"># NET_USER, NET_PASS, NXOS_PASS ko os.environ mein daalta hai</span>


def load_inventory(path="inventory.csv"):
    with open(path) as f:
        return list(csv.DictReader(f))


def device_params(row):
    password = os.environ[row["pass_var"]]
    return {
        "device_type": row["device_type"],
        "host": row["host"],
        "username": os.environ["NET_USER"],
        "password": password,
        "secret": password,
        "session_log": f"logs/{row['name']}.log",
    }


def connect(row):
    os.makedirs("logs", exist_ok=True)
    return ConnectHandler(**device_params(row))</pre>
<pre class="code"><span class="c"># probe.py</span>
from common import load_inventory, connect

for row in load_inventory():
    with connect(row) as conn:
        print(f"{row['name']:&lt;4} {row['device_type']:&lt;14} {conn.find_prompt()}")</pre>
<pre class="out">AUTO01$ python3 probe.py
R1   cisco_ios      PUN-CORE-R1#
<span class="hl">J1   juniper_junos  netops@J1&gt;</span>
E1   arista_eos     E1#
N1   cisco_nxos     N1#</pre>
<p>Chaar platforms, ek loop, chaar alag prompts. <code>with</code> block khud disconnect karta hai, andar error aaye tab bhi.</p>

<div class="warn"><p><b>Common mistakes.</b> NX-OS ya EOS ke liye <code>cisco_ios</code> use karna "kyunki commands milti-julti hain": show commands theek dikh sakti hain, phir config, save aur prompt handling bigad jaate hain. Jin IOS-jaise devices ko <code>enable</code> chahiye unke liye <code>secret</code> bhool jaana. <code>.env</code> mein variable na ho to netmiko error nahi, <code>KeyError</code> aata hai. <code>.env</code> ko git mein commit kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ConnectHandler</code> ek factory function hai, ek class nahi. <code>Netmiko</code> uska doosra naam hai. Module <code>ssh_dispatcher.platforms</code> bhi deta hai jisme supported naam hain.</p></div>

<div class="scn"><h4>Ek typo, ek mara hua 02:00 run</h4><p>Ek colleague ne inventory mein Cisco IOS XR router <code>cisco_xr</code> ke saath jod diya, jo woh naam nahi hai jo netmiko use karta hai. Raat ka run tees achhe devices ke baad us row par pahuncha, <code>ValueError</code> aaya aur exit ho gaya, isliye ikatisvi row ke baad kuch collect nahi hua.</p><p><b>Lesson:</b> kuch bhi connect karne se pehle poori inventory ko <code>platforms</code> se validate karo, aur ek buri row ko crash nahi, reported failure maano.</p></div>

<div class="iv"><p class="q">"netmiko mein device_type argument kya karta hai?"</p><p>Woh mapping se driver class chunta hai. Class platform ka prompt pattern, paging band karna, config mode mein jaana-nikalna, commit aur save jaanti hai. Wahi host aur credentials, alag device_type ke saath, alag behave karte hain, isliye type inventory se, har device ke liye, aana chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>device_type driver chunta hai: <code>cisco_ios</code>, <code>cisco_nxos</code>, <code>arista_eos</code>, <code>juniper_junos</code>, <code>cisco_asa</code>, <code>fortinet</code>, <code>paloalto_panos</code>.</li>
<li>Lab ke <code>nk_*</code> naam Program 1 ke aliases hain; ab asli naam likho.</li>
<li>dev dictionary inventory row aur environment variables se banao.</li>
<li>Run shuru hone se pehle device_type values validate karo.</li>
<li>Session hamesha band ho isliye <code>with ConnectHandler(...) as conn</code> use karo.</li>
</ul></div>
`}};export{e as default};