var e={id:`data-model`,h:{en:`The data model: sites, devices, interfaces and addresses`,hi:`Data model: sites, devices, interfaces aur addresses`},body:{en:`
<p>Picture the map of a city you know. The city has districts, districts have streets, streets have houses, houses have rooms. Every address in the city is found by walking down that tree. NetBox stores a network the same way, and almost every question you will ask of it is a walk along one branch: from a site to its devices, from a device to its interfaces, from an interface to its addresses, from an address up to the prefix that contains it.</p>

<h3>The tree you need to know</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Main NetBox objects and how they point at each other">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">Site</text>
<rect x="170" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="225" y="45" text-anchor="middle" class="svg-ink" font-size="13">Rack</text>
<rect x="320" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="45" text-anchor="middle" class="svg-ink" font-size="13">Device</text>
<rect x="490" y="20" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="12">Device type, role</text>
<rect x="320" y="100" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="125" text-anchor="middle" class="svg-ink" font-size="13">Interface</text>
<rect x="320" y="180" width="130" height="40" rx="8" fill="#fde68a"/><text x="385" y="205" text-anchor="middle" class="svg-ink" font-size="13">IP address</text>
<rect x="170" y="180" width="110" height="40" rx="8" fill="#fde68a"/><text x="225" y="205" text-anchor="middle" class="svg-ink" font-size="13">Prefix</text>
<rect x="20" y="180" width="110" height="40" rx="8" fill="#fed7aa"/><text x="75" y="205" text-anchor="middle" class="svg-ink" font-size="13">VLAN / VRF</text>
<rect x="490" y="100" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="125" text-anchor="middle" class="svg-ink" font-size="12">Tags, custom fields</text>
<rect x="490" y="180" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="205" text-anchor="middle" class="svg-ink" font-size="12">Config context</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="40" x2="170" y2="40"/><line x1="280" y1="40" x2="320" y2="40"/><line x1="450" y1="40" x2="490" y2="40"/><line x1="385" y1="60" x2="385" y2="100"/><line x1="385" y1="140" x2="385" y2="180"/><line x1="320" y1="200" x2="280" y2="200"/><line x1="170" y1="200" x2="130" y2="200"/><line x1="450" y1="120" x2="490" y2="120"/><line x1="450" y1="190" x2="490" y2="200"/></g>
</svg><p class="cap">A device belongs to a site and has a type and a role. Interfaces belong to a device, addresses to an interface, and a prefix contains the address.</p></div>

<h3>Reading one device end to end</h3>
<p>This is <code>model.py</code>. It walks the branch from PUN-CORE-R1 down to its addresses and up to the management prefix.</p>
<pre class="code">"""model.py - how one device hangs together in NetBox"""
from nbconn import api

nb = api()
d = nb.dcim.devices.get(name="PUN-CORE-R1")
for field in ("name", "status", "role", "site", "tenant", "platform", "device_type", "rack", "primary_ip4"):
    print("%-12s %s" % (field, getattr(d, field)))
print("%-12s %s" % ("tags", [t.name for t in d.tags]))
print("%-12s %s" % ("custom", d.custom_fields))
for ifc in nb.dcim.interfaces.filter(device_id=d.id, ordering="name"):
    addrs = [str(ip) for ip in nb.ipam.ip_addresses.filter(interface_id=ifc.id)]
    print("  %-20s %-9s %s" % (ifc.name, ifc.type.value, addrs))
p = nb.ipam.prefixes.get(prefix="10.99.0.0/24")
print("prefix", p, "| vlan:", p.vlan, "| role:", p.role, "| site:", p.site)</pre>
<pre class="out">AUTO01$ python3 model.py
name         PUN-CORE-R1
status       Active
role         Core Router
site         Pune
tenant       MyPnetLab
platform     Cisco IOS XE
device_type  CSR1000V
rack         None
<span class="hl">primary_ip4  10.99.0.1/24</span>
tags         ['critical', 'automation']
custom       {'monitored': True, 'owner_team': 'NOC'}
  GigabitEthernet0/0   1000base-t ['10.99.0.1/24']
  GigabitEthernet0/1   1000base-t []
  GigabitEthernet0/2   1000base-t []
  Loopback0            virtual   ['1.1.1.1/32']
prefix 10.99.0.0/24 | vlan: MGMT | role: Management | site: Pune</pre>
<p>Notice what each line is. <code>role</code>, <code>site</code>, <code>tenant</code> and <code>platform</code> are separate objects that the device points at; the name you see is just their display text. <code>primary_ip4</code> is a pointer to one of the device's own addresses, and it is the address scripts use to reach the device. Two lists, <code>tags</code> and <code>custom_fields</code>, carry the flexible part.</p>

<h3>Three ways to add your own data</h3>
<table class="cmp"><tr><th>Mechanism</th><th>Use it for</th><th>Example in the lab</th></tr>
<tr><td>Tags</td><td>A label you filter on</td><td><code>critical</code>, <code>automation</code></td></tr>
<tr><td>Custom fields</td><td>One typed value per object</td><td><code>owner_team</code> (text), <code>monitored</code> (true/false)</td></tr>
<tr><td>Config context</td><td>A JSON document merged into every matching device</td><td>NTP servers, syslog, OSPF process, SNMP</td></tr></table>
<p>A <b>config context</b> is the one most scripts love. It is JSON attached to a site, a role, a platform, a tag and so on, and NetBox merges every context that matches a device, lowest <b>weight</b> first, so a higher weight wins when two contexts set the same key. The device's own <code>local_context_data</code> is merged last. The result is the read-only field <code>config_context</code>.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/dcim/devices/2/?fields=name,config_context"
{"name":"PUN-CORE-R3","config_context":{"ntp_servers":["10.99.0.60"],"dns_servers":["8.8.8.8","1.1.1.1"],"domain_name":"nk.lab","syslog_server":"10.99.0.60","snmp":{"community":"nk-ro","location":"Pune DC"},"connection":{"device_type":"cisco_xe","port":22},"ospf":{"process_id":1,"area":0},"maintenan ...</pre>
<p>PUN-CORE-R3 gets its NTP and syslog from the global and Pune contexts, its OSPF process from the "Core router OSPF" context (weight 4000, assigned to the role) and its <code>maintenance_window</code> from its own local context. You will use exactly this in chapter 8.</p>

<h3>A second door: GraphQL</h3>
<p>REST returns one object type per call. GraphQL lets one request walk several levels and ask only for the fields you name. The lab supports a subset (queries only).</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" -H "Content-Type: application/json" -X POST $NETBOX_URL/graphql/ -d '{"query":"{ device_list(filters:{site:"pune", role:"core-router"}) { name primary_ip4 { address } interfaces { name } } }"}'
{"data":{"device_list":[{"name":"PUN-CORE-R1","primary_ip4":{"address":"10.99.0.1/24"},"interfaces":[{"name":"GigabitEthernet0/0"},{"name":"Loopback0"},{"name":"GigabitEthernet0/1"},{"name":"GigabitEthernet0/2"}]},{"name":"PUN-CORE-R3","pri ...</pre>

<div class="warn"><p><b>Common mistake.</b> Putting the device role into a custom field or the description because "the role list is not right yet". Filters, templates and reports key on the real <code>role</code> object. Fix the model; do not route around it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The device's <code>role</code> was called <code>device_role</code> before NetBox 4.0. Old scripts and old blog posts use the old name; the 4.1 API uses <code>role</code>.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab models the endpoints in chapter 2 only. A real NetBox adds modules, front and rear ports, power, circuits, VPN, wireless, journal entries, webhooks and plugins. GraphQL in the lab has no mutations or introspection.</p></div>

<div class="scn"><h4>The role that was a description</h4><p>A new engineer typed "core router" into the description of six devices instead of choosing the role. The nightly script that renders OSPF configuration asked for <code>role=core-router</code> and found none, so no router got its OSPF update. The first hint was a script that reported "0 devices" and finished green.</p><p><b>Lesson:</b> automation reads structured fields. Free text is for humans.</p></div>
<div class="iv"><p class="q">"What is a config context and how does it differ from a custom field?"</p><p>A custom field is one typed value on one object. A config context is a JSON document, attached to groups of objects such as a site, role or platform, that NetBox merges by weight into each matching device. I put shared settings such as NTP, syslog and the routing process there, and per-device facts in custom fields.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk the tree: site, device, interface, IP address, prefix, VLAN or VRF.</li>
<li>A device points at its role, type, platform, tenant and site; <code>primary_ip4</code> is how you reach it.</li>
<li>Tags filter, custom fields hold one typed value, config contexts hold merged JSON.</li>
<li>Higher weight wins; <code>local_context_data</code> is merged last.</li>
<li>GraphQL walks several levels in one request.</li></ul></div>`,hi:`
<p>Kisi shehar ka naksha socho jise aap jaante ho. Shehar mein districts hain, districts mein streets, streets mein ghar, gharon mein kamre. Shehar ka har address us tree par chalkar milta hai. NetBox network ko isi tarah store karta hai, aur aap jo bhi sawal poochoge woh lagbhag har baar ek branch par chalna hoga: site se uske devices tak, device se uske interfaces tak, interface se uske addresses tak, address se upar us prefix tak jo use contain karta hai.</p>

<h3>Woh tree jo aapko aani chahiye</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Mukhya NetBox objects aur woh ek doosre ko kaise point karte hain">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">Site</text>
<rect x="170" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="225" y="45" text-anchor="middle" class="svg-ink" font-size="13">Rack</text>
<rect x="320" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="45" text-anchor="middle" class="svg-ink" font-size="13">Device</text>
<rect x="490" y="20" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="12">Device type, role</text>
<rect x="320" y="100" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="385" y="125" text-anchor="middle" class="svg-ink" font-size="13">Interface</text>
<rect x="320" y="180" width="130" height="40" rx="8" fill="#fde68a"/><text x="385" y="205" text-anchor="middle" class="svg-ink" font-size="13">IP address</text>
<rect x="170" y="180" width="110" height="40" rx="8" fill="#fde68a"/><text x="225" y="205" text-anchor="middle" class="svg-ink" font-size="13">Prefix</text>
<rect x="20" y="180" width="110" height="40" rx="8" fill="#fed7aa"/><text x="75" y="205" text-anchor="middle" class="svg-ink" font-size="13">VLAN / VRF</text>
<rect x="490" y="100" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="125" text-anchor="middle" class="svg-ink" font-size="12">Tags, custom fields</text>
<rect x="490" y="180" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="205" text-anchor="middle" class="svg-ink" font-size="12">Config context</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="40" x2="170" y2="40"/><line x1="280" y1="40" x2="320" y2="40"/><line x1="450" y1="40" x2="490" y2="40"/><line x1="385" y1="60" x2="385" y2="100"/><line x1="385" y1="140" x2="385" y2="180"/><line x1="320" y1="200" x2="280" y2="200"/><line x1="170" y1="200" x2="130" y2="200"/><line x1="450" y1="120" x2="490" y2="120"/><line x1="450" y1="190" x2="490" y2="200"/></g>
</svg><p class="cap">Device ek site ka hota hai aur uska type aur role hota hai. Interfaces device ke hote hain, addresses interface ke, aur prefix address ko contain karta hai.</p></div>

<h3>Ek device ko shuru se ant tak padhna</h3>
<p>Yeh <code>model.py</code> hai. Yeh PUN-CORE-R1 se uske addresses tak neeche aur management prefix tak upar branch par chalta hai.</p>
<pre class="code">"""model.py - how one device hangs together in NetBox"""
from nbconn import api

nb = api()
d = nb.dcim.devices.get(name="PUN-CORE-R1")
for field in ("name", "status", "role", "site", "tenant", "platform", "device_type", "rack", "primary_ip4"):
    print("%-12s %s" % (field, getattr(d, field)))
print("%-12s %s" % ("tags", [t.name for t in d.tags]))
print("%-12s %s" % ("custom", d.custom_fields))
for ifc in nb.dcim.interfaces.filter(device_id=d.id, ordering="name"):
    addrs = [str(ip) for ip in nb.ipam.ip_addresses.filter(interface_id=ifc.id)]
    print("  %-20s %-9s %s" % (ifc.name, ifc.type.value, addrs))
p = nb.ipam.prefixes.get(prefix="10.99.0.0/24")
print("prefix", p, "| vlan:", p.vlan, "| role:", p.role, "| site:", p.site)</pre>
<pre class="out">AUTO01$ python3 model.py
name         PUN-CORE-R1
status       Active
role         Core Router
site         Pune
tenant       MyPnetLab
platform     Cisco IOS XE
device_type  CSR1000V
rack         None
<span class="hl">primary_ip4  10.99.0.1/24</span>
tags         ['critical', 'automation']
custom       {'monitored': True, 'owner_team': 'NOC'}
  GigabitEthernet0/0   1000base-t ['10.99.0.1/24']
  GigabitEthernet0/1   1000base-t []
  GigabitEthernet0/2   1000base-t []
  Loopback0            virtual   ['1.1.1.1/32']
prefix 10.99.0.0/24 | vlan: MGMT | role: Management | site: Pune</pre>
<p>Dhyan do har line kya hai. <code>role</code>, <code>site</code>, <code>tenant</code> aur <code>platform</code> alag objects hain jinhe device point karta hai; jo naam aap dekhte ho woh unka display text hai. <code>primary_ip4</code> device ke apne addresses mein se ek ka pointer hai, aur yahi woh address hai jisse scripts device tak pahunchti hain. Do lists, <code>tags</code> aur <code>custom_fields</code>, flexible hissa lekar chalti hain.</p>

<h3>Apna data jodne ke teen tareeke</h3>
<table class="cmp"><tr><th>Mechanism</th><th>Kis kaam ke liye</th><th>Lab mein example</th></tr>
<tr><td>Tags</td><td>Aisa label jis par filter lagate ho</td><td><code>critical</code>, <code>automation</code></td></tr>
<tr><td>Custom fields</td><td>Har object par ek typed value</td><td><code>owner_team</code> (text), <code>monitored</code> (true/false)</td></tr>
<tr><td>Config context</td><td>JSON document jo har matching device mein merge hota hai</td><td>NTP servers, syslog, OSPF process, SNMP</td></tr></table>
<p><b>Config context</b> woh hai jo zyadatar scripts ko pasand aata hai. Yeh JSON hai jo site, role, platform, tag waghera se jodi jati hai, aur NetBox device se match karne wale har context ko merge karta hai, sabse kam <b>weight</b> pehle, isliye jab do contexts ek hi key set karein to zyada weight jeetta hai. Device ka apna <code>local_context_data</code> sabse baad mein merge hota hai. Result read-only field <code>config_context</code> hai.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/dcim/devices/2/?fields=name,config_context"
{"name":"PUN-CORE-R3","config_context":{"ntp_servers":["10.99.0.60"],"dns_servers":["8.8.8.8","1.1.1.1"],"domain_name":"nk.lab","syslog_server":"10.99.0.60","snmp":{"community":"nk-ro","location":"Pune DC"},"connection":{"device_type":"cisco_xe","port":22},"ospf":{"process_id":1,"area":0},"maintenan ...</pre>
<p>PUN-CORE-R3 ko NTP aur syslog global aur Pune contexts se milte hain, OSPF process "Core router OSPF" context se (weight 4000, role ko assign) aur <code>maintenance_window</code> apne local context se. Chapter 8 mein aap bilkul yahi use karoge.</p>

<h3>Doosra darwaza: GraphQL</h3>
<p>REST ek call mein ek object type lautata hai. GraphQL mein ek request kai levels par chal sakti hai aur sirf wahi fields maangti hai jinke naam aap likhte ho. Lab ek subset support karta hai (sirf queries).</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" -H "Content-Type: application/json" -X POST $NETBOX_URL/graphql/ -d '{"query":"{ device_list(filters:{site:"pune", role:"core-router"}) { name primary_ip4 { address } interfaces { name } } }"}'
{"data":{"device_list":[{"name":"PUN-CORE-R1","primary_ip4":{"address":"10.99.0.1/24"},"interfaces":[{"name":"GigabitEthernet0/0"},{"name":"Loopback0"},{"name":"GigabitEthernet0/1"},{"name":"GigabitEthernet0/2"}]},{"name":"PUN-CORE-R3","pri ...</pre>

<div class="warn"><p><b>Common mistake.</b> Device role ko custom field ya description mein daalna kyunki "role list abhi theek nahi hai". Filters, templates aur reports asli <code>role</code> object par chalte hain. Model theek karo; usse bachkar mat chalo.</p></div>
<div class="exam"><p><b>Exam trap.</b> NetBox 4.0 se pehle device ke <code>role</code> ko <code>device_role</code> kehte the. Purani scripts aur purane blog posts purana naam use karte hain; 4.1 API <code>role</code> use karti hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab sirf chapter 2 ke endpoints model karta hai. Asli NetBox mein modules, front aur rear ports, power, circuits, VPN, wireless, journal entries, webhooks aur plugins bhi hote hain. Lab ke GraphQL mein mutations ya introspection nahi hai.</p></div>

<div class="scn"><h4>Role jo description ban gaya</h4><p>Ek naye engineer ne chhe devices ke description mein "core router" likh diya, role chunne ki jagah. Raat ki script jo OSPF configuration render karti hai, <code>role=core-router</code> maangti thi aur use koi nahi mila, isliye kisi router ko OSPF update nahi mila. Pehla ishara ek script thi jisne "0 devices" report kiya aur green khatam hui.</p><p><b>Lesson:</b> automation structured fields padhti hai. Free text insaanon ke liye hai.</p></div>
<div class="iv"><p class="q">"Config context kya hai aur custom field se kaise alag hai?"</p><p>Custom field ek object par ek typed value hai. Config context ek JSON document hai, jo site, role ya platform jaise objects ke groups se judta hai, aur NetBox use weight ke hisaab se har matching device mein merge karta hai. Shared settings, jaise NTP, syslog aur routing process, main wahan rakhta hoon, aur per-device facts custom fields mein.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tree par chalo: site, device, interface, IP address, prefix, VLAN ya VRF.</li>
<li>Device apne role, type, platform, tenant aur site ko point karta hai; <code>primary_ip4</code> se device tak pahunchte ho.</li>
<li>Tags filter karte hain, custom fields ek typed value rakhte hain, config contexts merged JSON.</li>
<li>Zyada weight jeetta hai; <code>local_context_data</code> sabse baad mein merge hota hai.</li>
<li>GraphQL ek request mein kai levels par chalta hai.</li></ul></div>`}};export{e as default};