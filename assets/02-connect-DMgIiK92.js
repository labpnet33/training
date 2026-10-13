var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 210" role="img" aria-label="The Scrapli factory picks a driver by platform name">
<rect x="10" y="80" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="102" text-anchor="middle" class="svg-ink" font-size="13">Scrapli(</text><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="12">platform="..." )</text>
<rect x="250" y="10" width="170" height="34" rx="8" fill="#bae6fd"/><text x="335" y="32" text-anchor="middle" class="svg-ink" font-size="13">IOSXEDriver</text>
<rect x="250" y="52" width="170" height="34" rx="8" fill="#bae6fd"/><text x="335" y="74" text-anchor="middle" class="svg-ink" font-size="13">IOSXRDriver</text>
<rect x="250" y="94" width="170" height="34" rx="8" fill="#bae6fd"/><text x="335" y="116" text-anchor="middle" class="svg-ink" font-size="13">NXOSDriver</text>
<rect x="250" y="136" width="170" height="34" rx="8" fill="#bae6fd"/><text x="335" y="158" text-anchor="middle" class="svg-ink" font-size="13">EOSDriver</text>
<rect x="250" y="178" width="170" height="28" rx="8" fill="#bae6fd"/><text x="335" y="197" text-anchor="middle" class="svg-ink" font-size="13">JunosDriver</text>
<text x="525" y="30" text-anchor="middle" class="svg-muted" font-size="12">cisco_iosxe</text><text x="525" y="72" text-anchor="middle" class="svg-muted" font-size="12">cisco_iosxr</text><text x="525" y="114" text-anchor="middle" class="svg-muted" font-size="12">cisco_nxos</text><text x="525" y="156" text-anchor="middle" class="svg-muted" font-size="12">arista_eos</text><text x="525" y="197" text-anchor="middle" class="svg-muted" font-size="12">juniper_junos</text>
<line x1="160" y1="105" x2="250" y2="27" stroke="#64748b" stroke-width="1.5"/><line x1="160" y1="105" x2="250" y2="69" stroke="#64748b" stroke-width="1.5"/><line x1="160" y1="105" x2="250" y2="111" stroke="#64748b" stroke-width="1.5"/><line x1="160" y1="105" x2="250" y2="153" stroke="#64748b" stroke-width="1.5"/><line x1="160" y1="105" x2="250" y2="192" stroke="#64748b" stroke-width="1.5"/>
<line x1="420" y1="27" x2="460" y2="27" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/><line x1="420" y1="69" x2="460" y2="69" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/><line x1="420" y1="111" x2="460" y2="111" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/><line x1="420" y1="153" x2="460" y2="153" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/><line x1="420" y1="192" x2="460" y2="192" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
</svg>`,n={id:`connect`,h:{en:`Drivers, platforms and the first connection`,hi:`Drivers, platforms aur pehla connection`},body:{en:`
<p><b>The idea of this chapter:</b> one call, <code>Scrapli(platform=..., host=...)</code>, hands you a ready driver. This chapter shows how to pick the platform, which arguments matter, how to open and close safely, and how the Lab 1 files <code>inventory.csv</code>, <code>common.py</code> and <code>probe.py</code> use them.</p>

<h3>The factory and the five core platforms</h3>
`+e(t,`The platform string selects the driver class. Anything else raises ScrapliModuleNotFound.`)+`
<table class="cmp"><tr><th>scrapli platform</th><th>Driver class</th><th>Prompt in the lab</th><th>netmiko device_type</th></tr>
<tr><td><code>cisco_iosxe</code></td><td><code>IOSXEDriver</code></td><td><code>PUN-CORE-R1#</code></td><td><code>cisco_ios</code></td></tr>
<tr><td><code>cisco_iosxr</code></td><td><code>IOSXRDriver</code></td><td>(not in this lab)</td><td><code>cisco_xr</code></td></tr>
<tr><td><code>cisco_nxos</code></td><td><code>NXOSDriver</code></td><td>(not in this lab)</td><td><code>cisco_nxos</code></td></tr>
<tr><td><code>arista_eos</code></td><td><code>EOSDriver</code></td><td><code>E1#</code></td><td><code>arista_eos</code></td></tr>
<tr><td><code>juniper_junos</code></td><td><code>JunosDriver</code></td><td><code>netops@J1&gt;</code></td><td><code>juniper_junos</code></td></tr></table>
<p>The driver classes live in <code>scrapli.driver.core</code>. You can build one directly (<code>IOSXEDriver(**dev)</code>) or through the factory; the result is the same object. The factory is better in an inventory loop, because the platform comes from data. On real gear, other vendors (Fortinet, Palo Alto and more) come from the separate <code>scrapli_community</code> package; the lab has only the five core platforms.</p>

<h3>The arguments you will use every day</h3>
<table class="cmp"><tr><th>Argument</th><th>Meaning</th></tr>
<tr><td><code>host</code>, <code>port</code></td><td>address and TCP port (22 by default)</td></tr>
<tr><td><code>auth_username</code>, <code>auth_password</code></td><td>the SSH login</td></tr>
<tr><td><code>auth_secondary</code></td><td>the enable password, netmiko's <code>secret</code></td></tr>
<tr><td><code>auth_strict_key</code></td><td>real default <code>True</code>: the host key must be in known_hosts. Labs use <code>False</code>; production should keep <code>True</code></td></tr>
<tr><td><code>timeout_socket</code>, <code>timeout_transport</code>, <code>timeout_ops</code></td><td>the three timeouts, chapter 6</td></tr></table>

<h3>Open, use, close</h3>
<p>You can call <code>open()</code> and <code>close()</code> yourself, or use a <code>with</code> block, which closes the session even when your code fails. Use <code>with</code> unless you have a reason not to.</p>
<pre class="code">from scrapli import Scrapli
from scrapli.driver import GenericDriver
from scrapli.driver.core import IOSXEDriver

dev = {
    "host": "10.99.0.1",
    "auth_username": "netops",
    "auth_password": "NK@2026",
    "auth_secondary": "NK@2026",
    "auth_strict_key": False,
}
conn = Scrapli(platform="cisco_iosxe", **dev)
print(type(conn).__name__)
conn.open()
print(conn.get_prompt(), conn.isalive())
conn.close()
print(conn.isalive())

with IOSXEDriver(**dev) as same:
    print(same.get_prompt())

with GenericDriver(**dev) as raw:
    print(raw.get_prompt())
    print(raw.send_command("show clock").result)</pre>
<pre class="out">AUTO01$ python3 ch2.py
IOSXEDriver
PUN-CORE-R1# True
False
PUN-CORE-R1#
PUN-CORE-R1#
15:01:40.544 UTC Sun Oct 11 2026</pre>
<p><code>get_prompt()</code> returns the current prompt, and <code>isalive()</code> says whether the session is still up. The last two lines show the <b>generic driver</b>: it does no privilege handling and no paging control, it just sends what you give it. It fits Linux hosts and odd devices; for routers and switches use a platform driver.</p>

<h3>Lab 1, tasks 1 and 2: inventory and probe</h3>
<p>The passwords never live in the code. <code>.env</code> holds <code>NET_USER</code> and <code>NET_PASS</code> (lab values; mode 600), and <code>inventory.csv</code> names the variable per row, exactly as in adv-nkmiko, but with scrapli's platform names. DEAD1 is a router that was decommissioned and never removed from the list:</p>
<pre class="code">name,host,platform,pass_var
R1,10.99.0.1,cisco_iosxe,NET_PASS
J1,10.99.0.11,juniper_junos,NET_PASS
E1,10.99.0.21,arista_eos,NET_PASS
DEAD1,10.99.0.99,cisco_iosxe,NET_PASS</pre>
<pre class="code">import csv
import os

from dotenv import load_dotenv
from scrapli import Scrapli
from scrapli.exceptions import ScrapliAuthenticationFailed, ScrapliConnectionNotOpened

load_dotenv(".env")


def load_inventory(path="inventory.csv"):
    with open(path) as f:
        return list(csv.DictReader(f))


def device_params(row):
    password = os.environ[row["pass_var"]]
    return {
        "platform": row["platform"],
        "host": row["host"],
        "auth_username": os.environ["NET_USER"],
        "auth_password": password,
        "auth_secondary": password,
        "auth_strict_key": False,
        "timeout_socket": 5,
        "timeout_transport": 10,
        "timeout_ops": 30,
    }


def connect(row):
    return Scrapli(**device_params(row))


def collect(job):
    """Run job(row, conn) on every device. A dead or locked device is reported, never fatal."""
    results = {}
    for row in load_inventory():
        try:
            with connect(row) as conn:
                results[row["name"]] = job(row, conn)
        except ScrapliAuthenticationFailed:
            print(f"{row['name']:&lt;6} login failed")
        except ScrapliConnectionNotOpened:
            print(f"{row['name']:&lt;6} unreachable")
    return results</pre>
<p><code>device_params()</code> turns one CSV row into scrapli arguments, <code>connect()</code> hands them to the factory, and <code>collect(job)</code> runs a function on every device. It catches the two exceptions that mean "this device is not reachable right now" and prints one line instead of crashing. Chapter 6 explains why those two and not others.</p>
<pre class="code">from common import collect


def job(row, conn):
    print(f"{row['name']:&lt;6} {row['platform']:&lt;14} {conn.get_prompt()}")


collect(job)</pre>
<pre class="out">AUTO01$ python3 probe.py
R1     cisco_iosxe    PUN-CORE-R1#
<span class="hl">J1     juniper_junos  netops@J1&gt;</span>
E1     arista_eos     E1#
DEAD1  unreachable</pre>
<p>The highlighted line answers the lab question: the Junos prompt ends in <code>&gt;</code> (operational mode). DEAD1 is reported and the run goes on.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>device_type</code> or <code>username</code> as an argument name: scrapli ignores unknown names silently in the lab and raises or misbehaves on real gear. Forgetting <code>auth_secondary</code> on IOS and then wondering why configuration mode is refused. Leaving <code>auth_strict_key=False</code> in production code.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>auth_secondary</code> is the enable password, not a second user. <code>platform</code> is a scrapli name, not a netmiko <code>device_type</code>.</p></div>

<div class="scn"><h4>One typo, one hundred devices</h4><p>An engineer pasted <code>platform="cisco_ios"</code> from an old netmiko script into a new scrapli inventory loop. The very first device raised <code>ScrapliModuleNotFound</code> and the job stopped before it touched anything. The same typo in a netmiko script would have raised a different error on every row, long after the first connection.</p><p><b>Lesson:</b> the factory validates the platform before any network traffic, so this class of mistake is cheap to find.</p></div>

<div class="iv"><p class="q">"How do you open a scrapli session safely?"</p><p>With a <code>with</code> block, so the session is closed whatever happens. The platform string selects the driver; the credentials come from the environment, not from the file; <code>auth_secondary</code> carries the enable password; and <code>auth_strict_key</code> stays on in production.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Scrapli(platform=...)</code> returns the matching driver; five core platforms exist.</li>
<li>scrapli argument names start with <code>auth_</code>; <code>auth_secondary</code> is the enable password.</li>
<li>Use <code>with</code>; <code>get_prompt()</code> and <code>isalive()</code> tell you the state.</li>
<li><code>GenericDriver</code> sends raw text with no platform logic.</li>
<li>Credentials come from .env; a dead device must not stop the run.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ek call, <code>Scrapli(platform=..., host=...)</code>, aapko taiyar driver deti hai. Yeh chapter dikhata hai ki platform kaise chunna hai, kaun se arguments matter karte hain, surakshit tareeke se kaise kholna aur band karna hai, aur Lab 1 ki files <code>inventory.csv</code>, <code>common.py</code> aur <code>probe.py</code> unhe kaise use karti hain.</p>

<h3>Factory aur paanch core platforms</h3>
`+e(t,`Platform string driver class chunti hai. Baaki sab ScrapliModuleNotFound deta hai.`)+`
<table class="cmp"><tr><th>scrapli platform</th><th>Driver class</th><th>Lab mein prompt</th><th>netmiko device_type</th></tr>
<tr><td><code>cisco_iosxe</code></td><td><code>IOSXEDriver</code></td><td><code>PUN-CORE-R1#</code></td><td><code>cisco_ios</code></td></tr>
<tr><td><code>cisco_iosxr</code></td><td><code>IOSXRDriver</code></td><td>(is lab mein nahi)</td><td><code>cisco_xr</code></td></tr>
<tr><td><code>cisco_nxos</code></td><td><code>NXOSDriver</code></td><td>(is lab mein nahi)</td><td><code>cisco_nxos</code></td></tr>
<tr><td><code>arista_eos</code></td><td><code>EOSDriver</code></td><td><code>E1#</code></td><td><code>arista_eos</code></td></tr>
<tr><td><code>juniper_junos</code></td><td><code>JunosDriver</code></td><td><code>netops@J1&gt;</code></td><td><code>juniper_junos</code></td></tr></table>
<p>Driver classes <code>scrapli.driver.core</code> mein hain. Aap seedha bana sakte ho (<code>IOSXEDriver(**dev)</code>) ya factory se; object wahi milta hai. Inventory loop mein factory behtar hai, kyunki platform data se aata hai. Real gear par doosre vendors (Fortinet, Palo Alto aur aur) alag <code>scrapli_community</code> package se aate hain; lab mein sirf paanch core platforms hain.</p>

<h3>Rozmarra ke arguments</h3>
<table class="cmp"><tr><th>Argument</th><th>Matlab</th></tr>
<tr><td><code>host</code>, <code>port</code></td><td>address aur TCP port (default 22)</td></tr>
<tr><td><code>auth_username</code>, <code>auth_password</code></td><td>SSH login</td></tr>
<tr><td><code>auth_secondary</code></td><td>enable password, netmiko ka <code>secret</code></td></tr>
<tr><td><code>auth_strict_key</code></td><td>real default <code>True</code>: host key known_hosts mein honi chahiye. Labs <code>False</code> use karte hain; production mein <code>True</code> rakho</td></tr>
<tr><td><code>timeout_socket</code>, <code>timeout_transport</code>, <code>timeout_ops</code></td><td>teen timeouts, chapter 6</td></tr></table>

<h3>Kholo, use karo, band karo</h3>
<p>Aap <code>open()</code> aur <code>close()</code> khud bula sakte ho, ya <code>with</code> block use kar sakte ho, jo aapka code fail hone par bhi session band kar deta hai. Jab tak koi wajah na ho, <code>with</code> use karo.</p>
<pre class="code">from scrapli import Scrapli
from scrapli.driver import GenericDriver
from scrapli.driver.core import IOSXEDriver

dev = {
    "host": "10.99.0.1",
    "auth_username": "netops",
    "auth_password": "NK@2026",
    "auth_secondary": "NK@2026",
    "auth_strict_key": False,
}
conn = Scrapli(platform="cisco_iosxe", **dev)
print(type(conn).__name__)
conn.open()
print(conn.get_prompt(), conn.isalive())
conn.close()
print(conn.isalive())

with IOSXEDriver(**dev) as same:
    print(same.get_prompt())

with GenericDriver(**dev) as raw:
    print(raw.get_prompt())
    print(raw.send_command("show clock").result)</pre>
<pre class="out">AUTO01$ python3 ch2.py
IOSXEDriver
PUN-CORE-R1# True
False
PUN-CORE-R1#
PUN-CORE-R1#
15:01:40.544 UTC Sun Oct 11 2026</pre>
<p><code>get_prompt()</code> maujooda prompt lautata hai, aur <code>isalive()</code> batata hai ki session abhi up hai ya nahi. Aakhri do lines <b>generic driver</b> dikhati hain: yeh na privilege handle karta hai na paging, bas jo dete ho woh bhejta hai. Yeh Linux hosts aur ajeeb devices ke liye theek hai; routers aur switches ke liye platform driver use karo.</p>

<h3>Lab 1, tasks 1 aur 2: inventory aur probe</h3>
<p>Passwords code mein kabhi nahi rehte. <code>.env</code> mein <code>NET_USER</code> aur <code>NET_PASS</code> hain (lab values; mode 600), aur <code>inventory.csv</code> har row par variable ka naam deti hai, bilkul adv-nkmiko jaise, par scrapli ke platform naamon ke saath. DEAD1 ek router hai jo decommission hua aur list se hataya nahi gaya:</p>
<pre class="code">name,host,platform,pass_var
R1,10.99.0.1,cisco_iosxe,NET_PASS
J1,10.99.0.11,juniper_junos,NET_PASS
E1,10.99.0.21,arista_eos,NET_PASS
DEAD1,10.99.0.99,cisco_iosxe,NET_PASS</pre>
<pre class="code">import csv
import os

from dotenv import load_dotenv
from scrapli import Scrapli
from scrapli.exceptions import ScrapliAuthenticationFailed, ScrapliConnectionNotOpened

load_dotenv(".env")


def load_inventory(path="inventory.csv"):
    with open(path) as f:
        return list(csv.DictReader(f))


def device_params(row):
    password = os.environ[row["pass_var"]]
    return {
        "platform": row["platform"],
        "host": row["host"],
        "auth_username": os.environ["NET_USER"],
        "auth_password": password,
        "auth_secondary": password,
        "auth_strict_key": False,
        "timeout_socket": 5,
        "timeout_transport": 10,
        "timeout_ops": 30,
    }


def connect(row):
    return Scrapli(**device_params(row))


def collect(job):
    """Run job(row, conn) on every device. A dead or locked device is reported, never fatal."""
    results = {}
    for row in load_inventory():
        try:
            with connect(row) as conn:
                results[row["name"]] = job(row, conn)
        except ScrapliAuthenticationFailed:
            print(f"{row['name']:&lt;6} login failed")
        except ScrapliConnectionNotOpened:
            print(f"{row['name']:&lt;6} unreachable")
    return results</pre>
<p><code>device_params()</code> ek CSV row ko scrapli arguments mein badalta hai, <code>connect()</code> unhe factory ko deta hai, aur <code>collect(job)</code> har device par ek function chalata hai. Yeh do exceptions pakadta hai jinka matlab hai "yeh device abhi reachable nahi" aur crash hone ki jagah ek line print karta hai. Chapter 6 samjhata hai ki yahi do kyun, aur koi aur kyun nahi.</p>
<pre class="code">from common import collect


def job(row, conn):
    print(f"{row['name']:&lt;6} {row['platform']:&lt;14} {conn.get_prompt()}")


collect(job)</pre>
<pre class="out">AUTO01$ python3 probe.py
R1     cisco_iosxe    PUN-CORE-R1#
<span class="hl">J1     juniper_junos  netops@J1&gt;</span>
E1     arista_eos     E1#
DEAD1  unreachable</pre>
<p>Highlighted line lab ke sawaal ka jawab hai: Junos prompt <code>&gt;</code> par khatam hota hai (operational mode). DEAD1 report hota hai aur run aage badhta hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Argument naam ke roop mein <code>device_type</code> ya <code>username</code> use karna: lab mein scrapli unknown naam chup-chaap ignore karta hai, real gear par error deta hai ya galat behave karta hai. IOS par <code>auth_secondary</code> bhool jaana aur phir sochna ki configuration mode refuse kyun ho raha hai. Production code mein <code>auth_strict_key=False</code> chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>auth_secondary</code> enable password hai, doosra user nahi. <code>platform</code> scrapli ka naam hai, netmiko ka <code>device_type</code> nahi.</p></div>

<div class="scn"><h4>Ek typo, sau devices</h4><p>Ek engineer ne purani netmiko script se <code>platform="cisco_ios"</code> naye scrapli inventory loop mein paste kar diya. Pehle hi device par <code>ScrapliModuleNotFound</code> aaya aur job kuch chhune se pehle ruk gayi. Wahi typo netmiko script mein har row par alag error deta, pehle connection ke bahut baad.</p><p><b>Lesson:</b> factory koi bhi network traffic se pehle platform validate karti hai, isliye is tarah ki galti dhoondhna sasta hai.</p></div>

<div class="iv"><p class="q">"scrapli session surakshit tareeke se kaise kholte ho?"</p><p><code>with</code> block se, taaki session har haal mein band ho. Platform string driver chunti hai; credentials file se nahi, environment se aate hain; <code>auth_secondary</code> enable password rakhta hai; aur production mein <code>auth_strict_key</code> on rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Scrapli(platform=...)</code> matching driver lautata hai; paanch core platforms hain.</li>
<li>scrapli ke argument naam <code>auth_</code> se shuru hote hain; <code>auth_secondary</code> enable password hai.</li>
<li><code>with</code> use karo; <code>get_prompt()</code> aur <code>isalive()</code> state batate hain.</li>
<li><code>GenericDriver</code> bina platform logic ke raw text bhejta hai.</li>
<li>Credentials .env se aate hain; dead device run ko rokna nahi chahiye.</li>
</ul></div>
`}};export{n as default};