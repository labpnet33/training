var e={id:`data-flow`,h:{en:`From the source of truth to the device: inventory, intent, templates`,hi:`Source of truth se device tak: inventory, intent, templates`},body:{en:`
<p>The first half of the chain turns <i>"what should exist"</i> into <i>"the exact text for each vendor"</i> without touching a device. Three steps do it: an inventory that comes from NetBox, an intent document per device, and one template per platform. Each step has an output you can read and a failure you can name.</p>

<h3>Step 1: the inventory comes from NetBox</h3>
<p>In <code>adv-nornir</code> the inventory was three YAML files. Here there is no YAML: the Nornir inventory is built from NetBox, filtered to the devices of one site that carry one tag. Adding a router to the automation means tagging it in NetBox, not editing a file in the repository.</p>
<pre class="code">def credentials(host):
    """NetBox holds no passwords: add them here and turn the NetBox platform into a NAPALM driver name."""
    host.username = settings.DEVICE_USER
    host.password = settings.DEVICE_PASSWORD
<span class="hl">    host.platform = PLATFORMS[host.platform]</span>

def build():
    return InitNornir(
        inventory={"plugin": "NetBoxInventory2",
                   "options": {"nb_url": settings.NETBOX_URL, "nb_token": settings.NETBOX_TOKEN, "ssl_verify": False,
                               "use_platform_slug": True,
<span class="hl">                               "filter_parameters": {"site": settings.SITE, "tag": settings.SCOPE_TAG}},</span>
                   "transform_function": credentials},
        runner={"plugin": "threaded", "options": {"num_workers": 5}},
        logging={"enabled": False})</pre>
<pre class="out">AUTO01$ python3 mvtool.py inventory
2 hosts in scope
NGP-BR-J1    10.99.0.11   junos  zero-touch
NGP-BR-R1    10.99.0.1    ios    zero-touch</pre>
<p>Three details matter. The <b>transform function</b> is the right place to add secrets, because NetBox must not store them. <code>PLATFORMS</code> maps the NetBox platform slug (<code>cisco-ios-xe</code>, <code>junos</code>) to the NAPALM driver name (<code>ios</code>, <code>junos</code>): a slug that is not in the table raises a <code>KeyError</code> at start, which is a good failure. And the <b>filter</b> is a quiet decision: a device without the tag is simply not there, and nothing says so. Chapter 10 comes back to that.</p>

<h3>Step 2: the intent, a document per device</h3>
<p>Why not render templates straight from NetBox? Because templates should not know how NetBox is shaped. The <b>intent</b> is a small JSON document with exactly what a template needs: names, addresses, servers. It is the contract between the data side and the text side.</p>
<pre class="code">def build(nb, host):
    ctx = host.data["config_context"]
    interfaces = []
    for ifc in nb.dcim.interfaces.filter(device=host.name, ordering="name"):
        for ip in nb.ipam.ip_addresses.filter(interface_id=ifc.id):
<span class="hl">            if str(ip).split("/")[0] != host.hostname:          # never touch the management interface</span>
                interfaces.append({"name": ifc.name, "address": str(ip), "description": ifc.description})
    return {"device": host.name, "platform": host.platform, "mgmt_ip": host.hostname,
            "ntp_servers": ctx["ntp_servers"], "syslog_server": ctx["syslog_server"], "interfaces": interfaces}</pre>
<pre class="out">AUTO01$ cat intent/NGP-BR-J1.json
{
  "device": "NGP-BR-J1",
  "interfaces": [
    {
      "address": "2.2.2.2/32",
      "description": "NGP-BR-J1 loopback",
      "name": "lo0"
    }
  ],
  "mgmt_ip": "10.99.0.11",
  "ntp_servers": ["10.99.0.60", "10.99.0.61"],
  "platform": "junos",
  "syslog_server": "10.99.0.60"
}</pre>
<p>The NTP and syslog servers come from a NetBox <b>config context</b> that applies to the whole site, so one edit changes every branch router. The management address is left out on purpose: a tool that rewrites the address it is connected through cuts its own branch. The file is written with sorted keys, so two runs of unchanged data give identical files and a <code>diff</code> shows only real changes. (The output above shows the lists on one line to save space; the file has one item per line.)</p>

<h3>Step 3: one template per platform</h3>
<pre class="code">{# templates/junos.j2 #}
set system host-name {{ device }}
{% for server in ntp_servers %}
set system ntp server {{ server }}
{% endfor %}
set system syslog host {{ syslog_server }} any notice
{% for i in interfaces %}
set interfaces {{ i.name }} unit 0 description "{{ i.description }}"
set interfaces {{ i.name }} unit 0 family inet address {{ i.address }}
{% endfor %}</pre>
<pre class="out">AUTO01$ python3 mvtool.py render
NGP-BR-J1    junos  6 lines -> build/configs/NGP-BR-J1.cfg
NGP-BR-R1    ios    7 lines -> build/configs/NGP-BR-R1.cfg</pre>
<p>The environment uses <code>StrictUndefined</code>: a key that the intent does not have is an error, not an empty line. The IOS template wants a netmask where Junos wants a prefix length, so <code>render.py</code> works out <code>ip</code> and <code>netmask</code> in Python with <code>ipaddress.ip_interface</code> and passes them in. Templates stay simple; arithmetic stays in code that can be tested.</p>
<div class="note"><p><b>Merge, not replace.</b> These candidates are loaded as a <i>merge</i>: the router keeps everything it has and receives these lines in addition. That is safe for a first toolkit, but it also means that a server removed from NetBox is not removed from the router. Removal needs a replace workflow or an explicit "no" line, and that is a design decision to write down, not an accident.</p></div>

<div class="scn"><h4>Two truths for one loopback</h4><p>A team kept loopback addresses in NetBox and also in a YAML file used by the renderer. After a renumbering, only NetBox was updated. The renderer produced the old address, the gate passed (the file was valid) and the router lost its router-id. Removing the YAML and rendering from the NetBox intent ended the argument about which one was right.</p><p><b>Lesson:</b> every fact has one home. A copy is a bug waiting for a renumbering.</p></div>

<div class="iv"><p class="q">"Why an intent document between NetBox and the templates?"</p><p>It separates what from how. The templates know vendor syntax and nothing about NetBox; the NetBox code knows the data model and nothing about syntax. The intent in the middle is small, easy to check against a schema, easy to diff and easy to test, and a second source such as a CSV could feed the same templates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The inventory is NetBox filtered by site and tag; secrets are added in a transform function.</li>
<li>The intent is a per-device JSON document that leaves out the management address.</li>
<li>Config contexts give site-wide values; one NetBox edit reaches every router.</li>
<li>One template per platform, <code>StrictUndefined</code>, arithmetic in Python.</li>
<li>Merge never removes anything; write that limit into the design.</li>
</ul></div>
`,hi:`
<p>Chain ka pehla aadha hissa <i>"kya hona chahiye"</i> ko <i>"har vendor ka exact text"</i> mein badalta hai, bina kisi device ko chhue. Teen steps yeh karte hain: NetBox se aane wala inventory, har device ka ek intent document, aur har platform ka ek template. Har step ka ek output hota hai jo aap padh sakte ho aur ek failure jiska naam le sakte ho.</p>

<h3>Step 1: inventory NetBox se aata hai</h3>
<p><code>adv-nornir</code> mein inventory teen YAML files thi. Yahan YAML nahi hai: Nornir inventory NetBox se banta hai, ek site ke un devices tak chhanta hua jinpar ek tag hai. Router ko automation mein jodna matlab NetBox mein tag lagana, repository ki file edit karna nahi.</p>
<pre class="code">def credentials(host):
    """NetBox holds no passwords: add them here and turn the NetBox platform into a NAPALM driver name."""
    host.username = settings.DEVICE_USER
    host.password = settings.DEVICE_PASSWORD
<span class="hl">    host.platform = PLATFORMS[host.platform]</span>

def build():
    return InitNornir(
        inventory={"plugin": "NetBoxInventory2",
                   "options": {"nb_url": settings.NETBOX_URL, "nb_token": settings.NETBOX_TOKEN, "ssl_verify": False,
                               "use_platform_slug": True,
<span class="hl">                               "filter_parameters": {"site": settings.SITE, "tag": settings.SCOPE_TAG}},</span>
                   "transform_function": credentials},
        runner={"plugin": "threaded", "options": {"num_workers": 5}},
        logging={"enabled": False})</pre>
<pre class="out">AUTO01$ python3 mvtool.py inventory
2 hosts in scope
NGP-BR-J1    10.99.0.11   junos  zero-touch
NGP-BR-R1    10.99.0.1    ios    zero-touch</pre>
<p>Teen details zaroori hain. <b>Transform function</b> secrets jodne ki sahi jagah hai, kyunki NetBox mein woh store nahi hone chahiye. <code>PLATFORMS</code> NetBox platform slug (<code>cisco-ios-xe</code>, <code>junos</code>) ko NAPALM driver naam (<code>ios</code>, <code>junos</code>) se jodta hai: table mein na milne wala slug start par <code>KeyError</code> deta hai, jo achha failure hai. Aur <b>filter</b> ek chupka faisla hai: tag ke bina device bas wahan hota hi nahi, aur koi batata nahi. Chapter 10 isi par wapas aata hai.</p>

<h3>Step 2: intent, har device ka ek document</h3>
<p>Templates seedha NetBox se kyon nahi render karte? Kyunki templates ko nahi pata hona chahiye ki NetBox ka shape kaisa hai. <b>Intent</b> ek chhota JSON document hai jisme exactly wahi hai jo template ko chahiye: naam, addresses, servers. Yeh data side aur text side ke beech ka contract hai.</p>
<pre class="code">def build(nb, host):
    ctx = host.data["config_context"]
    interfaces = []
    for ifc in nb.dcim.interfaces.filter(device=host.name, ordering="name"):
        for ip in nb.ipam.ip_addresses.filter(interface_id=ifc.id):
<span class="hl">            if str(ip).split("/")[0] != host.hostname:          # never touch the management interface</span>
                interfaces.append({"name": ifc.name, "address": str(ip), "description": ifc.description})
    return {"device": host.name, "platform": host.platform, "mgmt_ip": host.hostname,
            "ntp_servers": ctx["ntp_servers"], "syslog_server": ctx["syslog_server"], "interfaces": interfaces}</pre>
<pre class="out">AUTO01$ cat intent/NGP-BR-J1.json
{
  "device": "NGP-BR-J1",
  "interfaces": [
    {
      "address": "2.2.2.2/32",
      "description": "NGP-BR-J1 loopback",
      "name": "lo0"
    }
  ],
  "mgmt_ip": "10.99.0.11",
  "ntp_servers": ["10.99.0.60", "10.99.0.61"],
  "platform": "junos",
  "syslog_server": "10.99.0.60"
}</pre>
<p>NTP aur syslog servers NetBox ke <b>config context</b> se aate hain jo poori site par lagta hai, isliye ek edit har branch router ko badal deta hai. Management address jaan boojhkar chhoda gaya hai: jis address se tool connect hai use badalne wala tool apni hi branch kaat deta hai. File sorted keys ke saath likhi jati hai, isliye na badle data par do runs ki files same hoti hain aur <code>diff</code> sirf asli change dikhata hai. (Upar output mein jagah bachane ke liye lists ek line mein dikhayi hain; file mein har item alag line par hota hai.)</p>

<h3>Step 3: har platform ka ek template</h3>
<pre class="code">{# templates/junos.j2 #}
set system host-name {{ device }}
{% for server in ntp_servers %}
set system ntp server {{ server }}
{% endfor %}
set system syslog host {{ syslog_server }} any notice
{% for i in interfaces %}
set interfaces {{ i.name }} unit 0 description "{{ i.description }}"
set interfaces {{ i.name }} unit 0 family inet address {{ i.address }}
{% endfor %}</pre>
<pre class="out">AUTO01$ python3 mvtool.py render
NGP-BR-J1    junos  6 lines -> build/configs/NGP-BR-J1.cfg
NGP-BR-R1    ios    7 lines -> build/configs/NGP-BR-R1.cfg</pre>
<p>Environment <code>StrictUndefined</code> use karta hai: intent mein na hone wali key error hai, khali line nahi. IOS template ko netmask chahiye jahan Junos ko prefix length, isliye <code>render.py</code> <code>ip</code> aur <code>netmask</code> ko Python mein <code>ipaddress.ip_interface</code> se nikalta hai aur andar pass karta hai. Templates saade rehte hain; hisaab code mein rehta hai jise test kiya ja sakta hai.</p>
<div class="note"><p><b>Merge, replace nahi.</b> Yeh candidates <i>merge</i> ke roop mein load hote hain: router apna sab kuch rakhta hai aur yeh lines upar se mil jaati hain. Pehli toolkit ke liye yeh safe hai, par iska matlab yeh bhi hai ki NetBox se hataya gaya server router se nahi hatta. Hatane ke liye replace workflow ya saaf "no" line chahiye, aur yeh design ka faisla hai jo likha jana chahiye, hadsa nahi.</p></div>

<div class="scn"><h4>Ek loopback, do sach</h4><p>Ek team loopback addresses NetBox mein bhi rakhti thi aur renderer ki YAML file mein bhi. Renumbering ke baad sirf NetBox update hua. Renderer ne purana address banaya, gate pass hua (file valid thi) aur router ka router-id chala gaya. YAML hatakar NetBox intent se render karne se bahas khatam hui ki kaunsa sahi tha.</p><p><b>Lesson:</b> har fact ka ek ghar. Copy renumbering ka intezaar karta hua bug hai.</p></div>

<div class="iv"><p class="q">"NetBox aur templates ke beech intent document kyon?"</p><p>Woh what ko how se alag karta hai. Templates vendor syntax jaante hain, NetBox ke baare mein kuch nahi; NetBox code data model jaanta hai, syntax ke baare mein kuch nahi. Beech ka intent chhota hai, schema se check karna aasaan, diff karna aasaan, test karna aasaan, aur CSV jaisa doosra source bhi wahi templates chala sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory NetBox hai, site aur tag se chhanta hua; secrets transform function mein jude hain.</li>
<li>Intent har device ka JSON document hai jisme management address nahi hota.</li>
<li>Config contexts site-wide values dete hain; ek NetBox edit har router tak pahunchta hai.</li>
<li>Har platform ka ek template, <code>StrictUndefined</code>, hisaab Python mein.</li>
<li>Merge kuch hatata nahi; yeh limit design mein likho.</li>
</ul></div>
`}};export{e as default};