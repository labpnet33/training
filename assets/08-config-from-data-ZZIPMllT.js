var e={id:`config-from-data`,h:{en:`Config from data: render a router from NetBox with Jinja2`,hi:`Data se config: NetBox se Jinja2 ke saath router render karna`},body:{en:`
<p>A recipe book does not cook anything by itself; a cook reads a recipe, takes ingredients from the shelf and makes a dish. Network configuration from NetBox is the same. The <b>ingredients</b> are the facts in NetBox: names, addresses, the routing process. The <b>recipe</b> is a Jinja2 template. The <b>cook</b> is a short Python script. If the dish is wrong, you fix the shelf or the recipe, never the dish by hand.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="NetBox facts and a template go through a script and become a configuration">
<rect x="20" y="20" width="150" height="45" rx="10" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">NetBox facts</text>
<rect x="20" y="85" width="150" height="45" rx="10" fill="#ddd6fe"/><text x="95" y="113" text-anchor="middle" class="svg-ink" font-size="13">iosxe.j2 template</text>
<rect x="250" y="52" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">render.py</text>
<rect x="470" y="52" width="150" height="50" rx="10" fill="#fde68a"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="13">19 lines of config</text>
<g stroke="#64748b" stroke-width="2"><line x1="170" y1="42" x2="250" y2="70"/><line x1="170" y1="108" x2="250" y2="86"/><line x1="390" y1="77" x2="470" y2="77"/></g>
</svg><p class="cap">Facts plus template give configuration. Nothing here is typed on a router.</p></div>

<h3>Step 1: gather the facts</h3>
<p><code>facts()</code> in <code>render.py</code> reads the device, then each of its interfaces, then each address on each interface. It uses the <code>ipaddress</code> module (py-ipaddr) to turn <code>172.31.10.1/30</code> into what IOS wants: a netmask <code>255.255.255.252</code> and, for OSPF, a wildcard <code>0.0.0.3</code>. The device's <code>config_context</code> from chapter 3 supplies NTP, syslog and the OSPF process.</p>
<pre class="code">"""render.py - build the IOS XE configuration of one device from NetBox data"""
import sys
from ipaddress import ip_interface

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from nbconn import api


def facts(nb, name):
    """Everything the template needs, read from NetBox."""
    dev = nb.dcim.devices.get(name=name)
    interfaces = []
    for ifc in nb.dcim.interfaces.filter(device_id=dev.id, ordering="name"):
        for ip in nb.ipam.ip_addresses.filter(interface_id=ifc.id):
            net = ip_interface(str(ip))
            interfaces.append({"name": ifc.name, "description": ifc.description or "managed by NetBox",
                               "address": str(net.ip), "netmask": str(net.netmask),
                               "network": str(net.network.network_address), "wildcard": str(net.network.hostmask)})
    return {"hostname": dev.name, "interfaces": interfaces, "ctx": dev.config_context}</pre>

<h3>Step 2: the template</h3>
<p>This is the Jinja2 you met in py-templates, with two settings that matter. <code>StrictUndefined</code> makes a missing variable an error instead of an empty string, and <code>trim_blocks</code> with <code>lstrip_blocks</code> keep the <code>{% %}</code> lines from leaving blank lines in the output.</p>
<pre class="code">hostname {{ hostname }}
{% for server in ctx.ntp_servers %}
ntp server {{ server }}
{% endfor %}
logging host {{ ctx.syslog_server }}
{% for i in interfaces %}
interface {{ i.name }}
 description {{ i.description }}
 ip address {{ i.address }} {{ i.netmask }}
 no shutdown
{% endfor %}
router ospf {{ ctx.ospf.process_id }}
{% for i in interfaces %}
 network {{ i.network }} {{ i.wildcard }} area {{ ctx.ospf.area }}
{% endfor %}</pre>

<h3>Step 3: render</h3>
<pre class="out">AUTO01$ python3 render.py
hostname PUN-CORE-R1
ntp server 10.99.0.60
logging host 10.99.0.60
interface GigabitEthernet0/0
 description Management
 ip address 10.99.0.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/1
 description To PUN-DIST-SW1
 ip address 172.31.10.1 255.255.255.252
 no shutdown
interface Loopback0
 description Loopback
 ip address 1.1.1.1 255.255.255.255
 no shutdown
router ospf 1
 network 10.99.0.0 0.0.0.255 area 0
 network 172.31.10.0 0.0.0.3 area 0
 network 1.1.1.1 0.0.0.0 area 0</pre>
<p>Check this against the model. The /30 allocated in chapter 6 appears twice, once as an address with its mask on <code>GigabitEthernet0/1</code> and once as a <code>network</code> statement with its wildcard. Nobody typed <code>172.31.10.1</code> into a template or a script. If the allocation changes, the next render changes with it.</p>

<h3>When the data is incomplete</h3>
<p>Render a device that has no OSPF context, the access switch:</p>
<pre class="out">AUTO01$ python3 render.py PUN-ACC-SW1
Traceback (most recent call last):
  File "render.py", line 30, in &lt;module&gt;
    print("
".join(build(api(), sys.argv[1] if len(sys.argv) &gt; 1 else "PUN-CORE-R1")))
  File "render.py", line 25, in build
    text = env.get_template("iosxe.j2").render(**facts(nb, name))
UndefinedError: 'process_id' is undefined</pre>
<p>That failure is the point of <code>StrictUndefined</code>. Without it, Jinja2 prints an empty string and the router would get <code>router ospf</code> with no number, which IOS rejects halfway through the push. The error arrives on your laptop, before any device is touched.</p>

<h3>Do not put secrets in templates or NetBox</h3>
<p>The username and password for the router came from the environment in <code>push.py</code>, not from NetBox. NetBox holds facts; it is not a vault, and a read-only token can read every custom field. This is the py-secrets rule again.</p>

<h3>NetBox also has its own templates</h3>
<p>Real NetBox can render a device's configuration itself from <b>config templates</b> stored in NetBox, available at a <code>/render-config/</code> endpoint. It is a good fit when you want the template under the same permissions and history as the data. The lab does not model it, so this module uses the portable approach: the template lives in Git next to the script, and the facts come from the API. Tools such as Nornir (adv-nornir) and Ansible use the same pattern.</p>

<div class="warn"><p><b>Common mistake.</b> Editing the rendered output, or the router, to "fix" a wrong line. The next render overwrites it. Fix the source: the NetBox object or the template.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip_interface("172.31.10.1/30").network</code> is the <i>network</i> (<code>172.31.10.0/30</code>); <code>.ip</code> is the host address. Using the wrong one puts the network address on the interface.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab's Jinja2 words the missing-variable error as <code>'process_id' is undefined</code>. Real Jinja2 describes the same problem as <code>'dict object' has no attribute 'ospf'</code>, because the failure is found one level earlier. The meaning is the same; read the traceback for the name of the missing key either way. Also, the lab does not offer NetBox's server-side config templates.</p></div>

<div class="scn"><h4>The router with no mask</h4><p>An engineer built a template that read <code>{{ ip.address }}</code> and the NetBox address was <code>10.20.0.1/24</code>. The line became <code>ip address 10.20.0.1/24</code>, which IOS rejects. The rest of the script stopped halfway through the push, and the interface was left without an address. The fix was the facts layer: convert the prefix length to a netmask once, in Python, and check the template output before any connection opens.</p><p><b>Lesson:</b> shape the data for the device in code, render into text, then look at the text.</p></div>
<div class="iv"><p class="q">"Why use StrictUndefined?"</p><p>Because a missing variable should stop the run on my machine, not produce half a configuration on a router. By default Jinja2 renders an undefined variable as an empty string, which hides exactly the data errors I want to catch.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Facts from NetBox + a template in Git + a short script = configuration.</li>
<li>Convert masks and wildcards in Python with <code>ipaddress</code>, not in the template.</li>
<li><code>StrictUndefined</code>, <code>trim_blocks</code> and <code>lstrip_blocks</code> are the safe defaults.</li>
<li>Config contexts carry shared settings such as NTP, syslog and OSPF.</li>
<li>Credentials come from the environment, never from NetBox or the template.</li></ul></div>`,hi:`
<p>Recipe book khud kuch nahi pakati; cook recipe padhta hai, shelf se saaman leta hai aur dish banata hai. NetBox se network configuration bhi aisi hi hai. <b>Saaman</b> NetBox ke facts hain: naam, addresses, routing process. <b>Recipe</b> Jinja2 template hai. <b>Cook</b> ek chhoti Python script hai. Dish galat ho to shelf ya recipe theek karo, dish ko haath se kabhi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="NetBox facts aur template script se guzar kar configuration banate hain">
<rect x="20" y="20" width="150" height="45" rx="10" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">NetBox facts</text>
<rect x="20" y="85" width="150" height="45" rx="10" fill="#ddd6fe"/><text x="95" y="113" text-anchor="middle" class="svg-ink" font-size="13">iosxe.j2 template</text>
<rect x="250" y="52" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">render.py</text>
<rect x="470" y="52" width="150" height="50" rx="10" fill="#fde68a"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="13">19 lines config</text>
<g stroke="#64748b" stroke-width="2"><line x1="170" y1="42" x2="250" y2="70"/><line x1="170" y1="108" x2="250" y2="86"/><line x1="390" y1="77" x2="470" y2="77"/></g>
</svg><p class="cap">Facts aur template milkar configuration dete hain. Yahan kuch bhi router par type nahi hota.</p></div>

<h3>Step 1: facts jama karo</h3>
<p><code>render.py</code> ka <code>facts()</code> device padhta hai, phir uske har interface ko, phir har interface ke har address ko. Woh <code>ipaddress</code> module (py-ipaddr) se <code>172.31.10.1/30</code> ko woh banata hai jo IOS chahta hai: netmask <code>255.255.255.252</code> aur OSPF ke liye wildcard <code>0.0.0.3</code>. Chapter 3 ka device ka <code>config_context</code> NTP, syslog aur OSPF process deta hai.</p>
<pre class="code">"""render.py - build the IOS XE configuration of one device from NetBox data"""
import sys
from ipaddress import ip_interface

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from nbconn import api


def facts(nb, name):
    """Everything the template needs, read from NetBox."""
    dev = nb.dcim.devices.get(name=name)
    interfaces = []
    for ifc in nb.dcim.interfaces.filter(device_id=dev.id, ordering="name"):
        for ip in nb.ipam.ip_addresses.filter(interface_id=ifc.id):
            net = ip_interface(str(ip))
            interfaces.append({"name": ifc.name, "description": ifc.description or "managed by NetBox",
                               "address": str(net.ip), "netmask": str(net.netmask),
                               "network": str(net.network.network_address), "wildcard": str(net.network.hostmask)})
    return {"hostname": dev.name, "interfaces": interfaces, "ctx": dev.config_context}</pre>

<h3>Step 2: template</h3>
<p>Yeh wahi Jinja2 hai jo py-templates mein mila tha, do settings ke saath jo matter karti hain. <code>StrictUndefined</code> missing variable ko khali string ki jagah error banata hai, aur <code>trim_blocks</code> ke saath <code>lstrip_blocks</code> <code>{% %}</code> lines ko output mein blank lines chhodne se rokte hain.</p>
<pre class="code">hostname {{ hostname }}
{% for server in ctx.ntp_servers %}
ntp server {{ server }}
{% endfor %}
logging host {{ ctx.syslog_server }}
{% for i in interfaces %}
interface {{ i.name }}
 description {{ i.description }}
 ip address {{ i.address }} {{ i.netmask }}
 no shutdown
{% endfor %}
router ospf {{ ctx.ospf.process_id }}
{% for i in interfaces %}
 network {{ i.network }} {{ i.wildcard }} area {{ ctx.ospf.area }}
{% endfor %}</pre>

<h3>Step 3: render</h3>
<pre class="out">AUTO01$ python3 render.py
hostname PUN-CORE-R1
ntp server 10.99.0.60
logging host 10.99.0.60
interface GigabitEthernet0/0
 description Management
 ip address 10.99.0.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/1
 description To PUN-DIST-SW1
 ip address 172.31.10.1 255.255.255.252
 no shutdown
interface Loopback0
 description Loopback
 ip address 1.1.1.1 255.255.255.255
 no shutdown
router ospf 1
 network 10.99.0.0 0.0.0.255 area 0
 network 172.31.10.0 0.0.0.3 area 0
 network 1.1.1.1 0.0.0.0 area 0</pre>
<p>Isse model se milao. Chapter 6 mein allocate hua /30 do baar aata hai, ek baar <code>GigabitEthernet0/1</code> par mask ke saath address ki tarah aur ek baar wildcard ke saath <code>network</code> statement ki tarah. <code>172.31.10.1</code> kisi ne template ya script mein type nahi kiya. Allocation badle to agla render saath badal jata hai.</p>

<h3>Jab data adhura ho</h3>
<p>Aisa device render karo jisme OSPF context nahi hai, access switch:</p>
<pre class="out">AUTO01$ python3 render.py PUN-ACC-SW1
Traceback (most recent call last):
  File "render.py", line 30, in &lt;module&gt;
    print("
".join(build(api(), sys.argv[1] if len(sys.argv) &gt; 1 else "PUN-CORE-R1")))
  File "render.py", line 25, in build
    text = env.get_template("iosxe.j2").render(**facts(nb, name))
UndefinedError: 'process_id' is undefined</pre>
<p>Yeh failure <code>StrictUndefined</code> ka maksad hai. Iske bina Jinja2 khali string print karta aur router ko number ke bina <code>router ospf</code> milta, jise IOS push ke beech mein reject karta. Error aapke laptop par aata hai, kisi device ko chhune se pehle.</p>

<h3>Templates ya NetBox mein secrets mat rakho</h3>
<p>Router ka username aur password <code>push.py</code> mein environment se aaya, NetBox se nahi. NetBox facts rakhta hai; woh vault nahi hai, aur read-only token har custom field padh sakta hai. Yeh py-secrets ka niyam phir se hai.</p>

<h3>NetBox ke apne templates bhi hote hain</h3>
<p>Asli NetBox device ki configuration khud bhi render kar sakta hai NetBox mein rakhe <b>config templates</b> se, jo <code>/render-config/</code> endpoint par milte hain. Yeh tab achha hai jab aap template ko data jaisi hi permissions aur history ke neeche chahte ho. Lab ise model nahi karta, isliye yeh module portable tareeka use karta hai: template Git mein script ke paas rehta hai, aur facts API se aate hain. Nornir (adv-nornir) aur Ansible jaise tools wahi pattern use karte hain.</p>

<div class="warn"><p><b>Common mistake.</b> Galat line "theek karne" ke liye rendered output ya router ko edit karna. Agla render use overwrite kar dega. Source theek karo: NetBox object ya template.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip_interface("172.31.10.1/30").network</code> <i>network</i> hai (<code>172.31.10.0/30</code>); <code>.ip</code> host address hai. Galat wala use karne se interface par network address chala jata hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab ka Jinja2 missing-variable error ko <code>'process_id' is undefined</code> likhta hai. Asli Jinja2 wahi samasya <code>'dict object' has no attribute 'ospf'</code> likhta hai, kyunki failure ek star pehle pakda jata hai. Matlab wahi hai; dono mein traceback se missing key ka naam padho. Aur lab NetBox ke server-side config templates nahi deta.</p></div>

<div class="scn"><h4>Router jisme mask nahi tha</h4><p>Ek engineer ne template banaya jisme <code>{{ ip.address }}</code> tha aur NetBox address <code>10.20.0.1/24</code> tha. Line ban gayi <code>ip address 10.20.0.1/24</code>, jise IOS reject karta hai. Baaki script push ke beech mein ruk gayi, aur interface bina address ke reh gaya. Hal facts layer mein tha: prefix length ko ek baar Python mein netmask banao, aur koi connection khulne se pehle template output dekho.</p><p><b>Lesson:</b> data ko device ke liye code mein shape karo, text mein render karo, phir text dekho.</p></div>
<div class="iv"><p class="q">"StrictUndefined kyun use karte ho?"</p><p>Kyunki missing variable ko meri machine par run rokna chahiye, router par adhi configuration nahi banani chahiye. Default mein Jinja2 undefined variable ko khali string render karta hai, jo wahi data errors chhupata hai jinhe main pakadna chahta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NetBox ke facts + Git mein template + chhoti script = configuration.</li>
<li>Masks aur wildcards Python mein <code>ipaddress</code> se badlo, template mein nahi.</li>
<li><code>StrictUndefined</code>, <code>trim_blocks</code> aur <code>lstrip_blocks</code> safe defaults hain.</li>
<li>Config contexts shared settings rakhte hain: NTP, syslog, OSPF.</li>
<li>Credentials environment se aate hain, NetBox ya template se kabhi nahi.</li></ul></div>`}};export{e as default};