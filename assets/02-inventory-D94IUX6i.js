var e={id:`inventory`,h:{en:`The inventory: hosts, groups, defaults and config.yaml`,hi:`Inventory: hosts, groups, defaults aur config.yaml`},body:{en:`
<p>Everything in Nornir starts from the inventory: the list of devices and what is known about each. This chapter is Lab 1, step 1. You write four small YAML files and then ask Nornir what it understood. Doing this carefully pays back later, because most "Nornir problems" are inventory problems (you will see this again in Lab 2).</p>

<h3>An analogy: the staff handbook</h3>
<p>A company has a handbook for everybody (the <b>defaults</b>), a section for each department (the <b>groups</b>) and an individual contract for each person (the <b>host</b>). If your contract names no holiday allowance, the department rule applies; if the department says nothing, the handbook applies. Nornir looks up every value the same way.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Inheritance order of a Nornir value">
<rect x="20" y="20" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">1. the host</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="11">hosts.yaml: r1, n1 ...</text>
<rect x="235" y="20" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">2. its groups</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="11">groups.yaml: ios, nxos ...</text>
<rect x="450" y="20" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">3. defaults</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="11">defaults.yaml</text>
<line x1="190" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="212" y="48" text-anchor="middle" class="svg-muted" font-size="11">missing?</text><text x="428" y="48" text-anchor="middle" class="svg-muted" font-size="11">missing?</text>
<text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">Nornir takes the first place that has the value. The most specific one wins.</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">n1 sets no password, its group nxos does: NKlab@123 wins over the default NK@2026.</text>
<text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">r1 sets no password and ios has none: it gets the default.</text>
</svg><p class="cap">Host, then groups, then defaults. The first place with the value is the answer.</p></div>

<h3>Four files</h3>
<p><code>config.yaml</code> tells Nornir where the inventory is and how to run. The inventory is three files in the <code>inventory/</code> folder.</p>
<pre class="code">---
inventory:
<span class="hl">  plugin: SimpleInventory</span>
  options:
    host_file: inventory/hosts.yaml
    group_file: inventory/groups.yaml
    defaults_file: inventory/defaults.yaml
runner:
<span class="hl">  plugin: threaded</span>
  options:
<span class="hl">    num_workers: 10</span>
logging:
  enabled: false</pre>
<p><code>SimpleInventory</code> is the plugin that reads YAML files. The runner is <code>threaded</code> with 10 workers, so up to 10 devices are handled at the same time (the lab runs them one after the other, so you will not see a speed-up here). Logging is off for now; chapter 7 turns it on.</p>
<pre class="code">---
r1:
  hostname: 10.99.0.1
  groups: [ios]
  data:
    site: pune
j1:
  hostname: 10.99.0.11
  groups: [junos]</pre>
<p>Each host has a name (<code>r1</code>), a <code>hostname</code> (the address Nornir connects to), a list of <code>groups</code> and its own <code>data</code>. Here the data holds the site, which chapter 6 uses to filter.</p>
<pre class="code">---
ios:
  platform: cisco_ios
  data:
    backup_cmd: show running-config
  connection_options:
    netmiko:
      extras:
        secret: NK@2026
junos:
  platform: juniper_junos
  data:
    backup_cmd: show configuration
eos:
  platform: arista_eos
  data:
    backup_cmd: show running-config
  connection_options:
    netmiko:
      extras:
        secret: NK@2026
nxos:
  platform: cisco_nxos
  password: NKlab@123
  data:
    backup_cmd: show running-config</pre>
<p>A group carries what all its members share: the <code>platform</code> (the Netmiko device type, so Nornir knows how to talk to it), the command that shows the configuration, and Netmiko options. <code>connection_options</code> passes <code>extras</code> straight to Netmiko; here it is the enable <code>secret</code>. The group <code>nxos</code> also sets its own <code>password</code>, because the NX-OS switch uses a different one.</p>
<pre class="code">---
username: netops
password: NK@2026
data:
  ntp_servers: [10.99.0.60, 10.99.0.62]</pre>
<p>Defaults apply to every host that does not say otherwise. The lab keeps the password here to stay short; on real gear it comes from the environment (below).</p>

<h3>Ask Nornir what it understood</h3>
<pre class="code">"""inv.py - what does Nornir know about each host?"""
from nornir import InitNornir

nr = InitNornir(config_file="config.yaml")
print(len(nr.inventory.hosts), "hosts")
for name, host in nr.inventory.hosts.items():
<span class="hl">    print("%-3s %-10s %-14s %-8s %s" % (name, host.hostname, host.platform, [g.name for g in host.groups], host["backup_cmd"]))</span></pre>]
<pre class="out">AUTO01$ python3 inv.py
5 hosts
r1  10.99.0.1  cisco_ios      ['ios']  show running-config
j1  10.99.0.11 juniper_junos  ['junos'] show configuration
e1  10.99.0.21 arista_eos     ['eos']  show running-config
n1  10.99.0.31 cisco_nxos     ['nxos'] show running-config
r3  10.99.0.3  cisco_ios      ['ios']  show running-config</pre>
<p><code>nr.inventory.hosts</code> is a dictionary of host objects. <code>host.hostname</code>, <code>host.platform</code> and <code>host.groups</code> are attributes. <code>host["backup_cmd"]</code> is a <b>data</b> lookup, and it found the value in the group because the host itself has no such key.</p>

<h3>Where does each value come from?</h3>
<pre class="out">r1 own data: {'site': 'pune'}
r1 user and password: netops NK@2026
r1 backup_cmd: show running-config | ntp_servers: ['10.99.0.60', '10.99.0.62']
n1 own data: {'site': 'hyderabad'}
<span class="hl">n1 user and password: netops NKlab@123</span>
n1 backup_cmd: show running-config | ntp_servers: ['10.99.0.60', '10.99.0.62']
keys of n1: ['backup_cmd', 'ntp_servers', 'site']
rack: no rack
<span class="hl">KeyError 'rack'</span></pre>
<p><code>host.data</code> shows only what the host file contains. <code>host.password</code> follows the chain: <code>r1</code> gets the default, <code>n1</code> gets its group's value. <code>host["ntp_servers"]</code> comes from the defaults for both. <code>host.keys()</code> lists every data key after inheritance. For a missing key, <code>host.get("rack", "no rack")</code> gives a fallback and <code>host["rack"]</code> raises <code>KeyError</code>, which matters when a task depends on a key that one group forgot.</p>

<h3>No files at all, and no secrets in files</h3>
<p>You can pass the same settings to <code>InitNornir</code> as arguments, and a <b>transform function</b> can edit every host after it loads. That is the place to read a password from the environment, as in <code>py-secrets</code>.</p>
<pre class="code">def transform(host):
    host.data["fqdn"] = host.name + ".nk.lab"
<span class="hl">    host.password = os.environ.get("NK_PASSWORD", host.password)<span class="c">   # real runs: the secret comes from the environment</span></span>


nr = InitNornir(
    inventory={
        "plugin": "SimpleInventory",
        "options": {"host_file": "inventory/hosts.yaml", "group_file": "inventory/groups.yaml", "defaults_file": "inventory/defaults.yaml"},
<span class="hl">        "transform_function": transform,</span>
    },
    runner={"plugin": "serial"},
    logging={"enabled": False},
)
print(type(nr.runner).__name__, len(nr.inventory.hosts), "hosts")
print(nr.inventory.hosts["j1"].data["fqdn"], nr.inventory.hosts["j1"].password)</pre>
<pre class="out">AUTO01$ python3 inline.py
SerialRunner 5 hosts
j1.nk.lab NK@2026</pre>

<div class="warn"><p><b>Common mistake.</b> Putting a typo in a data key, such as <code>version_command</code> in one group and <code>version_cmd</code> in the others. YAML does not complain. The host with the odd key fails later with a <code>KeyError</code>. This is one of the four faults in Lab 2.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order is host, then groups, then defaults. A group value beats a default, and a host value beats both. The <code>platform</code> value is not free text: it must be a name the connection plugin knows (<code>cisco_ios</code>, <code>juniper_junos</code>, <code>arista_eos</code>, <code>cisco_nxos</code> for Netmiko).</p></div>

<div class="scn"><h4>The switch that kept the old password</h4><p>After a password change the default was updated, but one NX-OS group still carried its own old <code>password</code> line. Every other device worked; the switch failed with an authentication error. Printing <code>host.password</code> for that host showed which level the value came from, and removing the line from the group fixed it.</p><p><b>Lesson:</b> when one host behaves differently, print the resolved value and look at every level above it.</p></div>

<div class="iv"><p class="q">"How does a SimpleInventory resolve a value for a host?"</p><p>It looks in the host, then in the groups of that host in order, then in the defaults, and takes the first value it finds. That applies to <code>username</code>, <code>password</code>, <code>platform</code>, <code>port</code>, <code>hostname</code> and to the keys in <code>data</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three inventory files (hosts, groups, defaults) plus <code>config.yaml</code>.</li>
<li>Resolution order: host, groups, defaults. The most specific wins.</li>
<li><code>host["key"]</code> reads data after inheritance; <code>host.get()</code> gives a fallback.</li>
<li><code>platform</code> must be a driver name the plugin knows.</li>
<li>Secrets belong in the environment, applied in a transform function.</li>
</ul></div>
`,hi:`
<p>Nornir mein sab kuch inventory se shuru hota hai: devices ki list aur har ek ke baare mein jo pata hai. Yeh chapter Lab 1 ka step 1 hai. Aap chaar chhoti YAML files likhte ho aur phir Nornir se poochte ho ki usne kya samjha. Yeh dhyaan se karne ka fayda baad mein milta hai, kyunki zyadatar "Nornir problems" asal mein inventory problems hoti hain (Lab 2 mein phir dekhoge).</p>

<h3>Ek analogy: staff handbook</h3>
<p>Company mein sabke liye ek handbook hota hai (<b>defaults</b>), har department ka ek section (<b>groups</b>) aur har insaan ka apna contract (<b>host</b>). Agar aapke contract mein holiday allowance nahi likha, to department ka rule lagta hai; department kuch nahi kehta, to handbook lagta hai. Nornir har value isi tarah dhoondhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Inheritance order of a Nornir value">
<rect x="20" y="20" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">1. the host</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="11">hosts.yaml: r1, n1 ...</text>
<rect x="235" y="20" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">2. its groups</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="11">groups.yaml: ios, nxos ...</text>
<rect x="450" y="20" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">3. defaults</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="11">defaults.yaml</text>
<line x1="190" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="212" y="48" text-anchor="middle" class="svg-muted" font-size="11">missing?</text><text x="428" y="48" text-anchor="middle" class="svg-muted" font-size="11">missing?</text>
<text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">Nornir takes the first place that has the value. The most specific one wins.</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">n1 sets no password, its group nxos does: NKlab@123 wins over the default NK@2026.</text>
<text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">r1 sets no password and ios has none: it gets the default.</text>
</svg><p class="cap">Host, then groups, then defaults. The first place with the value is the answer.</p></div>

<h3>Chaar files</h3>
<p><code>config.yaml</code> Nornir ko batati hai ki inventory kahan hai aur kaise chalana hai. Inventory <code>inventory/</code> folder ki teen files hain.</p>
<pre class="code">---
inventory:
<span class="hl">  plugin: SimpleInventory</span>
  options:
    host_file: inventory/hosts.yaml
    group_file: inventory/groups.yaml
    defaults_file: inventory/defaults.yaml
runner:
<span class="hl">  plugin: threaded</span>
  options:
<span class="hl">    num_workers: 10</span>
logging:
  enabled: false</pre>
<p><code>SimpleInventory</code> woh plugin hai jo YAML files padhta hai. Runner <code>threaded</code> hai, 10 workers ke saath, yaani ek saath 10 devices tak sambhale ja sakte hain (lab unhe ek ke baad ek chalata hai, isliye yahan speed-up nahi dikhega). Logging abhi off hai; chapter 7 use on karta hai.</p>
<pre class="code">---
r1:
  hostname: 10.99.0.1
  groups: [ios]
  data:
    site: pune
j1:
  hostname: 10.99.0.11
  groups: [junos]</pre>
<p>Har host ka ek naam hai (<code>r1</code>), ek <code>hostname</code> (woh address jahan Nornir connect karta hai), <code>groups</code> ki list aur apna <code>data</code>. Yahan data mein site hai, jise chapter 6 filter ke liye use karta hai.</p>
<pre class="code">---
ios:
  platform: cisco_ios
  data:
    backup_cmd: show running-config
  connection_options:
    netmiko:
      extras:
        secret: NK@2026
junos:
  platform: juniper_junos
  data:
    backup_cmd: show configuration
eos:
  platform: arista_eos
  data:
    backup_cmd: show running-config
  connection_options:
    netmiko:
      extras:
        secret: NK@2026
nxos:
  platform: cisco_nxos
  password: NKlab@123
  data:
    backup_cmd: show running-config</pre>
<p>Group woh rakhta hai jo uske sab members mein common hai: <code>platform</code> (Netmiko ka device type, taaki Nornir jaane kaise baat karni hai), configuration dikhane wali command, aur Netmiko options. <code>connection_options</code> <code>extras</code> ko seedha Netmiko ko deta hai; yahan woh enable <code>secret</code> hai. <code>nxos</code> group apna <code>password</code> bhi set karta hai, kyunki NX-OS switch ka password alag hai.</p>
<pre class="code">---
username: netops
password: NK@2026
data:
  ntp_servers: [10.99.0.60, 10.99.0.62]</pre>
<p>Defaults un sab hosts par lagte hain jo kuch aur nahi kehte. Lab chhota rakhne ke liye password yahan rakhta hai; real gear par woh environment se aata hai (neeche dekho).</p>

<h3>Nornir se poochho usne kya samjha</h3>
<pre class="code">"""inv.py - what does Nornir know about each host?"""
from nornir import InitNornir

nr = InitNornir(config_file="config.yaml")
print(len(nr.inventory.hosts), "hosts")
for name, host in nr.inventory.hosts.items():
<span class="hl">    print("%-3s %-10s %-14s %-8s %s" % (name, host.hostname, host.platform, [g.name for g in host.groups], host["backup_cmd"]))</span></pre>]
<pre class="out">AUTO01$ python3 inv.py
5 hosts
r1  10.99.0.1  cisco_ios      ['ios']  show running-config
j1  10.99.0.11 juniper_junos  ['junos'] show configuration
e1  10.99.0.21 arista_eos     ['eos']  show running-config
n1  10.99.0.31 cisco_nxos     ['nxos'] show running-config
r3  10.99.0.3  cisco_ios      ['ios']  show running-config</pre>
<p><code>nr.inventory.hosts</code> host objects ki dictionary hai. <code>host.hostname</code>, <code>host.platform</code> aur <code>host.groups</code> attributes hain. <code>host["backup_cmd"]</code> ek <b>data</b> lookup hai, aur usne value group mein paayi kyunki host ke paas yeh key nahi hai.</p>

<h3>Har value kahan se aati hai?</h3>
<pre class="out">r1 own data: {'site': 'pune'}
r1 user and password: netops NK@2026
r1 backup_cmd: show running-config | ntp_servers: ['10.99.0.60', '10.99.0.62']
n1 own data: {'site': 'hyderabad'}
<span class="hl">n1 user and password: netops NKlab@123</span>
n1 backup_cmd: show running-config | ntp_servers: ['10.99.0.60', '10.99.0.62']
keys of n1: ['backup_cmd', 'ntp_servers', 'site']
rack: no rack
<span class="hl">KeyError 'rack'</span></pre>
<p><code>host.data</code> sirf wahi dikhata hai jo host file mein hai. <code>host.password</code> chain follow karta hai: <code>r1</code> ko default milta hai, <code>n1</code> ko uske group ki value. <code>host["ntp_servers"]</code> dono ke liye defaults se aata hai. <code>host.keys()</code> inheritance ke baad saari data keys dikhata hai. Missing key ke liye <code>host.get("rack", "no rack")</code> fallback deta hai aur <code>host["rack"]</code> <code>KeyError</code> uthata hai; yeh tab maayne rakhta hai jab task aisi key par tika ho jo ek group bhool gaya.</p>

<h3>Bina files ke, aur files mein secrets nahi</h3>
<p>Wahi settings aap <code>InitNornir</code> ko arguments ki tarah bhi de sakte ho, aur ek <b>transform function</b> load hone ke baad har host ko edit kar sakta hai. Password environment se padhne ki yahi jagah hai, jaise <code>py-secrets</code> mein.</p>
<pre class="code">def transform(host):
    host.data["fqdn"] = host.name + ".nk.lab"
<span class="hl">    host.password = os.environ.get("NK_PASSWORD", host.password)<span class="c">   # real runs: the secret comes from the environment</span></span>


nr = InitNornir(
    inventory={
        "plugin": "SimpleInventory",
        "options": {"host_file": "inventory/hosts.yaml", "group_file": "inventory/groups.yaml", "defaults_file": "inventory/defaults.yaml"},
<span class="hl">        "transform_function": transform,</span>
    },
    runner={"plugin": "serial"},
    logging={"enabled": False},
)
print(type(nr.runner).__name__, len(nr.inventory.hosts), "hosts")
print(nr.inventory.hosts["j1"].data["fqdn"], nr.inventory.hosts["j1"].password)</pre>
<pre class="out">AUTO01$ python3 inline.py
SerialRunner 5 hosts
j1.nk.lab NK@2026</pre>

<div class="warn"><p><b>Common mistake.</b> Data key mein typo, jaise ek group mein <code>version_command</code> aur baaki mein <code>version_cmd</code>. YAML shikayat nahi karta. Alag key wala host baad mein <code>KeyError</code> se fail hota hai. Lab 2 ke chaar faults mein se yeh ek hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order hai host, phir groups, phir defaults. Group ki value default ko haraati hai, aur host ki value dono ko. <code>platform</code> free text nahi hai: yeh woh naam hona chahiye jo connection plugin jaanta hai (Netmiko ke liye <code>cisco_ios</code>, <code>juniper_junos</code>, <code>arista_eos</code>, <code>cisco_nxos</code>).</p></div>

<div class="scn"><h4>Switch jisne purana password rakha</h4><p>Password badalne ke baad default update ho gaya, par ek NX-OS group ki apni purani <code>password</code> line bachi rahi. Baaki sab devices chale; switch authentication error se fail hua. Us host ka <code>host.password</code> print karne se dikha ki value kis level se aa rahi hai, aur group se line hatane par theek ho gaya.</p><p><b>Lesson:</b> jab ek host alag behave kare, resolved value print karo aur uske upar ka har level dekho.</p></div>

<div class="iv"><p class="q">"SimpleInventory host ki value kaise resolve karta hai?"</p><p>Pehle host mein dekhta hai, phir us host ke groups mein order se, phir defaults mein, aur pehli mili value leta hai. Yeh <code>username</code>, <code>password</code>, <code>platform</code>, <code>port</code>, <code>hostname</code> aur <code>data</code> ki keys par lagu hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen inventory files (hosts, groups, defaults) aur <code>config.yaml</code>.</li>
<li>Resolution order: host, groups, defaults. Sabse specific jeetta hai.</li>
<li><code>host["key"]</code> inheritance ke baad data padhta hai; <code>host.get()</code> fallback deta hai.</li>
<li><code>platform</code> aisa driver name hona chahiye jo plugin jaanta ho.</li>
<li>Secrets environment mein rakho, transform function mein lagao.</li>
</ul></div>
`}};export{e as default};