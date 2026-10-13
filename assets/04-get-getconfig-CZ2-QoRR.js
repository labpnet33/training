var e={id:`get-getconfig`,h:{en:`Reading data: get, get_config and filters`,hi:`Data padhna: get, get_config aur filters`},body:{en:`
<p>Reading is the safe half of NETCONF, and you will do it before and after every change: before, to see what is there; after, to prove it. ncclient gives you two read operations, <code>get_config</code> and <code>get</code>, and two ways to say what you want, a subtree filter and an XPath filter.</p>

<h3>An analogy: the plan and the live camera</h3>
<p>A building has a set of plans on paper and a live camera in the corridor. The plans say what <i>should</i> be there; the camera shows what is happening now: who is walking, which lights are on. <code>get_config</code> reads the plans (configuration only, from a datastore you name). <code>get</code> reads plans and camera together (configuration plus operational state such as link status and counters).</p>

<h3>get_config versus get</h3>
<p>The example asks R1 for the same interface twice. Look at what the second answer adds:</p>
<pre class="code"><span class="c"># getvs.py - what does get_config return, and what does get add?</span>
from ncutil import connect

FLT = '&lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;&lt;interface&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;'


def leaves(root):
    return [e.tag.split("}")[1] for e in root.iter() if isinstance(e.tag, str)]


with connect("R1") as m:
    cfg = m.get_config(source="running", filter=("subtree", FLT)).data
    both = m.get(filter=("subtree", FLT)).data
    print("get_config:", leaves(cfg))
    print("get:       ", leaves(both))
    print("oper-status:", both.findtext(".//{*}oper-status"))</pre>
<pre class="out">AUTO01$ python3 getvs.py
get_config: ['data', 'interfaces', 'interface', 'name', 'description', 'type', 'enabled', 'ipv4', 'address', 'ip', 'netmask', 'ipv6']
get:        ['data', 'interfaces', 'interface', 'name', 'description', 'type', 'enabled', 'ipv4', 'address', 'ip', 'netmask', 'ipv6', <span class="hl">'oper-status', 'phys-address', 'statistics', 'in-octets', 'in-unicast-pkts', 'out-octets', 'out-unicast-pkts'</span>]
oper-status: <span class="hl">down</span></pre>
<p>Both replies hold the configured leaves (description, enabled, the IPv4 address). Only <code>get</code> adds <code>oper-status</code>, <code>phys-address</code> and the <code>statistics</code> counters. The interface is administratively configured but <code>oper-status</code> says <code>down</code>: in this lab nothing is cabled to it.</p>
<table class="cmp"><tr><th></th><th><code>get_config(source=...)</code></th><th><code>get()</code></th></tr>
<tr><td>Returns</td><td>Configuration only</td><td>Configuration and operational state</td></tr>
<tr><td>Datastore</td><td>You choose: <code>running</code>, or <code>candidate</code> when supported</td><td>None; it reads the live device</td></tr>
<tr><td>Use for</td><td>"What is configured?", and read-back after an edit</td><td>"Is it up? how many errors?"</td></tr></table>

<h3>Filters: ask only for what you need</h3>
<p>A device can hold thousands of lines of configuration. A filter limits the reply. ncclient takes it as a tuple: <code>filter=("subtree", xml)</code> or <code>filter=("xpath", expression)</code>.</p>
<ul>
<li><b>Subtree filter</b>: an XML skeleton of what you want. An element with only its name selects everything below it; an element with a value (like <code>&amp;lt;name&amp;gt;GigabitEthernet0/1&amp;lt;/name&amp;gt;</code>) is a key that selects one list entry. Every NETCONF server must support it.</li>
<li><b>XPath filter</b>: a path expression such as <code>/interfaces/interface[name='GigabitEthernet0/1']</code>. Only servers with <code>:xpath</code> support it; in this lab that is R1, and J1 answers <code>operation-not-supported</code> (chapter 3).</li></ul>
<p>Prefer the subtree filter in scripts that must work everywhere.</p>

<h3>Working with the reply</h3>
<p>The object that comes back has three useful views of the same answer:</p>
<dl class="terms">
<dt><code>reply.data</code></dt><dd>The content as an lxml element, ready to search with <code>find</code>, <code>findtext</code> and <code>iter</code>.</dd>
<dt><code>reply.data_xml</code></dt><dd>The content as text, good for printing and for saving a backup.</dd>
<dt><code>reply.xml</code></dt><dd>The whole <code>rpc-reply</code> text including the message-id, handy when debugging.</dd></dl>
<p>XML elements carry a namespace. A search for <code>description</code> would miss <code>{urn:ietf:params:xml:ns:yang:ietf-interfaces}description</code>, so the examples use the wildcard <code>{*}</code>, which means "any namespace": <code>data.findtext(".//{*}description")</code>. (The next module, <code>adv-xml</code>, covers lxml and namespaces in depth.)</p>

<h3>The read function of the lab script</h3>
<p>Lab 1 builds one script, <code>ifchange.py</code>, across several chapters. Its first part reads the description and the address of an interface from either vendor and returns the same shape: a tuple <code>(description, "address/prefix")</code>.</p>
<pre class="code"><span class="c"># ifchange.py, part 1 (Lab 1, step 2) - read one interface from either vendor</span>
import sys
from ipaddress import ip_interface

from ncclient.operations import RPCError
from ncutil import DEVICES, connect

IETF = "urn:ietf:params:xml:ns:yang:ietf-interfaces"
IETF_IP = "urn:ietf:params:xml:ns:yang:ietf-ip"


def read_interface(m, vendor, ifname):
    """Return (description, address) as the device holds them in running."""
    if vendor == "iosxe":
        flt = '&lt;interfaces xmlns="%s"&gt;&lt;interface&gt;&lt;name&gt;%s&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;' % (IETF, ifname)
    else:
        flt = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;%s&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;" % ifname
    data = m.get_config(source="running", filter=("subtree", flt)).data
    desc = data.findtext(".//{*}description")
    if vendor == "iosxe":
        ip = data.findtext(".//{*}address/{*}ip")
        mask = data.findtext(".//{*}address/{*}netmask")
        addr = ip_interface("%s/%s" % (ip, mask)).with_prefixlen if ip else None
    else:
        addr = data.findtext(".//{*}unit/{*}family/{*}inet/{*}address/{*}name")
    return desc, addr</pre>
<pre class="code"><span class="c"># show.py</span>
from ifchange import read_interface
from ncutil import DEVICES, connect

for name, dev in DEVICES.items():
    with connect(name) as m:
        print(name, read_interface(m, dev["vendor"], dev["uplink"]))</pre>
<pre class="out">AUTO01$ python3 show.py
R1 ('LINK-TO-PUN-OLD', <span class="hl">'172.16.10.1/30'</span>)
J1 ('LINK-TO-PUN-OLD', <span class="hl">'172.16.20.1/30'</span>)</pre>
<p>On IOS XE the address and the mask are two leaves in the standard ietf-ip model, so the function joins them and lets Python's <code>ipaddress</code> turn <code>255.255.255.252</code> into <code>/30</code>. On Junos the address already is <code>172.16.20.1/30</code>. Hiding that difference inside one function is the whole point of this module.</p>

<h3>One interface, two vendors, three models</h3>
<p>The same data can look completely different depending on the model you ask for. Junos has one native tree, shown here for <code>ge-0/0/1</code>:</p>
<pre class="code"><span class="c"># the Junos side: the configuration tree is the filter</span>
from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/1&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"
with connect("J1") as m:
    print(m.get_config(source="running", filter=("subtree", FLT)).data_xml)</pre>
<pre class="out">AUTO01$ python3 jread.py
&lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;data&gt;
&lt;configuration junos:commit-seconds="1791706013" junos:commit-localtime="2026-10-11 08:06:53 UTC" junos:commit-user="root"&gt;
&lt;interfaces&gt;
&lt;interface&gt;
&lt;name&gt;ge-0/0/1&lt;/name&gt;
&lt;description&gt;LINK-TO-PUN-OLD&lt;/description&gt;
&lt;unit&gt;
&lt;name&gt;0&lt;/name&gt;
&lt;family&gt;
&lt;inet&gt;
&lt;address&gt;
&lt;name&gt;<span class="hl">172.16.20.1/30</span>&lt;/name&gt;
&lt;/address&gt;
&lt;/inet&gt;
&lt;/family&gt;
&lt;/unit&gt;
&lt;/interface&gt;
&lt;/interfaces&gt;
&lt;/configuration&gt;
&lt;/data&gt;</pre>
<p>The root is <code>configuration</code>, there is no namespace on the elements, and the address is a list entry whose key (<code>name</code>) holds the prefix. The attributes on <code>configuration</code> (commit-seconds and so on) are Junos extras.</p>
<p>IOS XE offers the Cisco native model as well as the standard one. The same interface in the native model:</p>
<pre class="code"><span class="c"># native.py - the same interface in the Cisco native model</span>
from ncutil import connect

FLT = """&lt;native xmlns="h&#116;tp://cisco.com/ns/yang/Cisco-IOS-XE-native"&gt;
  &lt;interface&gt;&lt;GigabitEthernet&gt;&lt;name&gt;0/1&lt;/name&gt;&lt;/GigabitEthernet&gt;&lt;/interface&gt;
&lt;/native&gt;"""
with connect("R1") as m:
    print(m.get_config(source="running", filter=("subtree", FLT)).data_xml)</pre>
<pre class="out">AUTO01$ python3 native.py
&lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;data&gt;
    &lt;native xmlns="h&#116;tp://cisco.com/ns/yang/Cisco-IOS-XE-native"&gt;
      &lt;interface&gt;
        &lt;GigabitEthernet&gt;
          &lt;name&gt;0/1&lt;/name&gt;
          &lt;description&gt;LINK-TO-PUN-OLD&lt;/description&gt;
          &lt;ip&gt;
            &lt;address&gt;
              &lt;primary&gt;
                &lt;address&gt;<span class="hl">172.16.10.1</span>&lt;/address&gt;
                &lt;mask&gt;<span class="hl">255.255.255.252</span>&lt;/mask&gt;
              &lt;/primary&gt;
            &lt;/address&gt;
          &lt;/ip&gt;
        &lt;/GigabitEthernet&gt;
      &lt;/interface&gt;
    &lt;/native&gt;
  &lt;/data&gt;</pre>
<p>Here the interface type is part of the element name (<code>GigabitEthernet</code>), the number is in <code>name</code> as <code>0/1</code>, and the address uses a <code>mask</code> instead of a <code>netmask</code>. Our script uses the standard ietf-interfaces model on R1 because the same filter and the same shape then work on any vendor that supports it. Use the native model when something is only there, and expect to rewrite it when the platform changes.</p>

<div class="warn"><p><b>Common mistake.</b> Using <code>get()</code> to read back a configuration change. It works, but it returns much more data and, on some platforms, a counter that changes every second makes comparisons noisy. For "did my edit land?" use <code>get_config</code> with a tight filter.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get</code> has no <code>source</code> argument. Configuration datastores are named only in <code>get_config</code> (and in the edit and copy operations).</p></div>

<div class="scn"><h4>Everything on the device, for one description</h4><p>A script read a router's whole configuration with <code>get_config()</code> and no filter, only to compare one interface description. On a large router the reply was several megabytes and the nightly run took minutes per device. Adding a subtree filter for the interface cut the reply to a few lines and the run to seconds.</p><p><b>Lesson:</b> always filter, and read only what you will compare.</p></div>

<div class="iv"><p class="q">"What is the difference between get and get_config?"</p><p><code>get_config</code> returns configuration from a datastore you name (running, or candidate if supported). <code>get</code> returns configuration plus operational state such as interface status and counters, from the live device. Both can take a subtree or XPath filter; I use subtree where portability matters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>get_config</code> reads configuration from a named datastore; <code>get</code> adds operational state.</li>
<li>Filter every read: <code>("subtree", xml)</code> works everywhere, <code>("xpath", expr)</code> only with <code>:xpath</code>.</li>
<li><code>.data</code> is lxml, <code>.data_xml</code> is text, <code>.xml</code> is the whole reply.</li>
<li>Use <code>{*}</code> in searches so the namespace does not hide your element.</li>
<li>Read back with a tight <code>get_config</code> filter after every edit.</li>
</ul></div>
`,hi:`
<p>Padhna NETCONF ka safe hissa hai, aur aap ise har change se pehle aur baad mein karoge: pehle, dekhne ke liye ki kya hai; baad mein, saabit karne ke liye. ncclient do read operations deta hai, <code>get_config</code> aur <code>get</code>, aur kya chahiye batane ke do tareeke, subtree filter aur XPath filter.</p>

<h3>Analogy: naksha aur live camera</h3>
<p>Ek building ke paas kagaz par naksha hota hai aur corridor mein live camera. Naksha batata hai ki kya <i>hona chahiye</i>; camera dikhata hai ki abhi kya ho raha hai: kaun chal raha hai, kaunsi lights on hain. <code>get_config</code> naksha padhta hai (sirf configuration, aapke batae datastore se). <code>get</code> naksha aur camera dono padhta hai (configuration ke saath link status aur counters jaisi operational state).</p>

<h3>get_config versus get</h3>
<p>Example R1 se wahi interface do baar maangta hai. Dekho dusra jawab kya jodta hai:</p>
<pre class="code"><span class="c"># getvs.py - what does get_config return, and what does get add?</span>
from ncutil import connect

FLT = '&lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;&lt;interface&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;'


def leaves(root):
    return [e.tag.split("}")[1] for e in root.iter() if isinstance(e.tag, str)]


with connect("R1") as m:
    cfg = m.get_config(source="running", filter=("subtree", FLT)).data
    both = m.get(filter=("subtree", FLT)).data
    print("get_config:", leaves(cfg))
    print("get:       ", leaves(both))
    print("oper-status:", both.findtext(".//{*}oper-status"))</pre>
<pre class="out">AUTO01$ python3 getvs.py
get_config: ['data', 'interfaces', 'interface', 'name', 'description', 'type', 'enabled', 'ipv4', 'address', 'ip', 'netmask', 'ipv6']
get:        ['data', 'interfaces', 'interface', 'name', 'description', 'type', 'enabled', 'ipv4', 'address', 'ip', 'netmask', 'ipv6', <span class="hl">'oper-status', 'phys-address', 'statistics', 'in-octets', 'in-unicast-pkts', 'out-octets', 'out-unicast-pkts'</span>]
oper-status: <span class="hl">down</span></pre>
<p>Dono replies mein configured leaves hain (description, enabled, IPv4 address). Sirf <code>get</code> <code>oper-status</code>, <code>phys-address</code> aur <code>statistics</code> counters jodta hai. Interface administratively configured hai par <code>oper-status</code> <code>down</code> hai: lab mein usse kuch cable nahi hai.</p>
<table class="cmp"><tr><th></th><th><code>get_config(source=...)</code></th><th><code>get()</code></th></tr>
<tr><td>Kya deta hai</td><td>Sirf configuration</td><td>Configuration aur operational state</td></tr>
<tr><td>Datastore</td><td>Aap chunte ho: <code>running</code>, ya support ho to <code>candidate</code></td><td>Koi nahi; live device padhta hai</td></tr>
<tr><td>Kab use karein</td><td>"Kya configured hai?", aur edit ke baad read-back</td><td>"Up hai? kitne errors?"</td></tr></table>

<h3>Filters: sirf wahi maango jo chahiye</h3>
<p>Device mein hazaaron lines ki configuration ho sakti hai. Filter reply ko seemit karta hai. ncclient use tuple mein leta hai: <code>filter=("subtree", xml)</code> ya <code>filter=("xpath", expression)</code>.</p>
<ul>
<li><b>Subtree filter</b>: jo chahiye uska XML dhancha. Sirf naam wala element uske neeche sab kuch select karta hai; value wala element (jaise <code>&amp;lt;name&amp;gt;GigabitEthernet0/1&amp;lt;/name&amp;gt;</code>) key hai jo ek list entry chunta hai. Har NETCONF server ko ise support karna hota hai.</li>
<li><b>XPath filter</b>: path expression jaise <code>/interfaces/interface[name='GigabitEthernet0/1']</code>. Sirf <code>:xpath</code> wale servers support karte hain; is lab mein R1, aur J1 <code>operation-not-supported</code> deta hai (chapter 3).</li></ul>
<p>Jo scripts har jagah chalni chahiye unme subtree filter ko prefer karo.</p>

<h3>Reply ke saath kaam</h3>
<p>Jo object wapas aata hai usme ek hi jawab ke teen useful views hain:</p>
<dl class="terms">
<dt><code>reply.data</code></dt><dd>Content lxml element ki tarah, <code>find</code>, <code>findtext</code> aur <code>iter</code> se search karne ke liye taiyar.</dd>
<dt><code>reply.data_xml</code></dt><dd>Content text ki tarah, print karne aur backup save karne ke liye achha.</dd>
<dt><code>reply.xml</code></dt><dd>Poora <code>rpc-reply</code> text, message-id ke saath, debugging mein kaam aata hai.</dd></dl>
<p>XML elements ka namespace hota hai. <code>description</code> ki search <code>{urn:ietf:params:xml:ns:yang:ietf-interfaces}description</code> ko miss kar degi, isliye examples wildcard <code>{*}</code> use karte hain, jiska matlab "koi bhi namespace": <code>data.findtext(".//{*}description")</code>. (Agla module, <code>adv-xml</code>, lxml aur namespaces gehraai se sikhata hai.)</p>

<h3>Lab script ka read function</h3>
<p>Lab 1 ek script, <code>ifchange.py</code>, kai chapters mein banata hai. Uska pehla hissa dono vendors se interface ki description aur address padhta hai aur ek hi shape lautata hai: tuple <code>(description, "address/prefix")</code>.</p>
<pre class="code"><span class="c"># ifchange.py, part 1 (Lab 1, step 2) - read one interface from either vendor</span>
import sys
from ipaddress import ip_interface

from ncclient.operations import RPCError
from ncutil import DEVICES, connect

IETF = "urn:ietf:params:xml:ns:yang:ietf-interfaces"
IETF_IP = "urn:ietf:params:xml:ns:yang:ietf-ip"


def read_interface(m, vendor, ifname):
    """Return (description, address) as the device holds them in running."""
    if vendor == "iosxe":
        flt = '&lt;interfaces xmlns="%s"&gt;&lt;interface&gt;&lt;name&gt;%s&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;' % (IETF, ifname)
    else:
        flt = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;%s&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;" % ifname
    data = m.get_config(source="running", filter=("subtree", flt)).data
    desc = data.findtext(".//{*}description")
    if vendor == "iosxe":
        ip = data.findtext(".//{*}address/{*}ip")
        mask = data.findtext(".//{*}address/{*}netmask")
        addr = ip_interface("%s/%s" % (ip, mask)).with_prefixlen if ip else None
    else:
        addr = data.findtext(".//{*}unit/{*}family/{*}inet/{*}address/{*}name")
    return desc, addr</pre>
<pre class="code"><span class="c"># show.py</span>
from ifchange import read_interface
from ncutil import DEVICES, connect

for name, dev in DEVICES.items():
    with connect(name) as m:
        print(name, read_interface(m, dev["vendor"], dev["uplink"]))</pre>
<pre class="out">AUTO01$ python3 show.py
R1 ('LINK-TO-PUN-OLD', <span class="hl">'172.16.10.1/30'</span>)
J1 ('LINK-TO-PUN-OLD', <span class="hl">'172.16.20.1/30'</span>)</pre>
<p>IOS XE par address aur mask standard ietf-ip model mein do alag leaves hain, isliye function unhe jodta hai aur Python ka <code>ipaddress</code> <code>255.255.255.252</code> ko <code>/30</code> bana deta hai. Junos par address pehle se <code>172.16.20.1/30</code> hai. Is farq ko ek function ke andar chhupana hi is module ka maksad hai.</p>

<h3>Ek interface, do vendors, teen models</h3>
<p>Wahi data alag dikh sakta hai, aap kaunsa model maangte ho uspar nirbhar. Junos mein ek native tree hai, yahan <code>ge-0/0/1</code> ke liye:</p>
<pre class="code"><span class="c"># the Junos side: the configuration tree is the filter</span>
from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/1&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"
with connect("J1") as m:
    print(m.get_config(source="running", filter=("subtree", FLT)).data_xml)</pre>
<pre class="out">AUTO01$ python3 jread.py
&lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;data&gt;
&lt;configuration junos:commit-seconds="1791706013" junos:commit-localtime="2026-10-11 08:06:53 UTC" junos:commit-user="root"&gt;
&lt;interfaces&gt;
&lt;interface&gt;
&lt;name&gt;ge-0/0/1&lt;/name&gt;
&lt;description&gt;LINK-TO-PUN-OLD&lt;/description&gt;
&lt;unit&gt;
&lt;name&gt;0&lt;/name&gt;
&lt;family&gt;
&lt;inet&gt;
&lt;address&gt;
&lt;name&gt;<span class="hl">172.16.20.1/30</span>&lt;/name&gt;
&lt;/address&gt;
&lt;/inet&gt;
&lt;/family&gt;
&lt;/unit&gt;
&lt;/interface&gt;
&lt;/interfaces&gt;
&lt;/configuration&gt;
&lt;/data&gt;</pre>
<p>Root <code>configuration</code> hai, elements par namespace nahi hai, aur address ek list entry hai jiski key (<code>name</code>) prefix rakhti hai. <code>configuration</code> par attributes (commit-seconds wagairah) Junos ke extras hain.</p>
<p>IOS XE standard model ke saath Cisco native model bhi deta hai. Wahi interface native model mein:</p>
<pre class="code"><span class="c"># native.py - the same interface in the Cisco native model</span>
from ncutil import connect

FLT = """&lt;native xmlns="h&#116;tp://cisco.com/ns/yang/Cisco-IOS-XE-native"&gt;
  &lt;interface&gt;&lt;GigabitEthernet&gt;&lt;name&gt;0/1&lt;/name&gt;&lt;/GigabitEthernet&gt;&lt;/interface&gt;
&lt;/native&gt;"""
with connect("R1") as m:
    print(m.get_config(source="running", filter=("subtree", FLT)).data_xml)</pre>
<pre class="out">AUTO01$ python3 native.py
&lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;data&gt;
    &lt;native xmlns="h&#116;tp://cisco.com/ns/yang/Cisco-IOS-XE-native"&gt;
      &lt;interface&gt;
        &lt;GigabitEthernet&gt;
          &lt;name&gt;0/1&lt;/name&gt;
          &lt;description&gt;LINK-TO-PUN-OLD&lt;/description&gt;
          &lt;ip&gt;
            &lt;address&gt;
              &lt;primary&gt;
                &lt;address&gt;<span class="hl">172.16.10.1</span>&lt;/address&gt;
                &lt;mask&gt;<span class="hl">255.255.255.252</span>&lt;/mask&gt;
              &lt;/primary&gt;
            &lt;/address&gt;
          &lt;/ip&gt;
        &lt;/GigabitEthernet&gt;
      &lt;/interface&gt;
    &lt;/native&gt;
  &lt;/data&gt;</pre>
<p>Yahan interface type element naam ka hissa hai (<code>GigabitEthernet</code>), number <code>name</code> mein <code>0/1</code> hai, aur address <code>netmask</code> ki jagah <code>mask</code> use karta hai. Hamari script R1 par standard ietf-interfaces model use karti hai kyunki tab wahi filter aur wahi shape us har vendor par chalta hai jo ise support karta hai. Native model tab use karo jab cheez sirf wahin ho, aur platform badalne par ise dobara likhne ke liye taiyar raho.</p>

<div class="warn"><p><b>Common mistake.</b> Configuration change ka read-back <code>get()</code> se karna. Chalta hai, par bahut zyada data aata hai, aur kuch platforms par har second badalne wala counter comparison ko noisy bana deta hai. "Mera edit pahunch gaya?" ke liye tight filter ke saath <code>get_config</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get</code> mein <code>source</code> argument nahi hota. Configuration datastores sirf <code>get_config</code> mein (aur edit aur copy operations mein) naam se aate hain.</p></div>

<div class="scn"><h4>Ek description ke liye poora device</h4><p>Ek script ne router ki poori configuration bina filter ke <code>get_config()</code> se padhi, sirf ek interface description compare karne ke liye. Bade router par reply kai megabytes ka tha aur nightly run har device par minutes leta tha. Interface ke liye subtree filter jodne se reply kuch lines ka ho gaya aur run seconds mein.</p><p><b>Lesson:</b> hamesha filter lagao, aur sirf wahi padho jo compare karoge.</p></div>

<div class="iv"><p class="q">"get aur get_config mein kya farq hai?"</p><p><code>get_config</code> aapke batae datastore (running, ya support ho to candidate) se configuration deta hai. <code>get</code> live device se configuration ke saath interface status aur counters jaisi operational state deta hai. Dono subtree ya XPath filter le sakte hain; jahan portability chahiye wahan main subtree use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>get_config</code> named datastore se configuration padhta hai; <code>get</code> operational state jodta hai.</li>
<li>Har read filter karo: <code>("subtree", xml)</code> har jagah chalta hai, <code>("xpath", expr)</code> sirf <code>:xpath</code> ke saath.</li>
<li><code>.data</code> lxml hai, <code>.data_xml</code> text hai, <code>.xml</code> poora reply hai.</li>
<li>Searches mein <code>{*}</code> use karo taaki namespace aapke element ko na chhupaye.</li>
<li>Har edit ke baad tight <code>get_config</code> filter se read-back karo.</li>
</ul></div>
`}};export{e as default};