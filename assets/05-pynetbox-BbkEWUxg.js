var e={id:`pynetbox`,h:{en:`pynetbox: the Python way to read NetBox`,hi:`pynetbox: NetBox ko Python mein padhne ka tareeka`},body:{en:`
<p>In chapter 2 you called the API with <code>requests</code> and unpacked the JSON yourself. That works, but you wrote the same three things every time: the base URL, the token header and the loop over pages. <b>pynetbox</b> is a small library that does those three things for you and hands back objects instead of dictionaries. Think of <code>requests</code> as driving a car in manual and pynetbox as the same car in automatic: you still need to know where you are going.</p>

<h3>Connect once, then ask</h3>
<p>Every script in this module starts with <code>from nbconn import api</code>. That tiny file reads <code>~/.netbox.env</code> (the python-dotenv habit from py-secrets) and returns a ready connection. The app names mirror the URLs: <code>nb.dcim.devices</code> is <code>/api/dcim/devices/</code>, and <code>nb.ipam.ip_addresses</code> uses an underscore where the URL has a dash.</p>
<pre class="code">"""tour.py - the pynetbox basics in one run"""
from nbconn import api

nb = api()
print("version:", nb.version)
r1 = nb.dcim.devices.get(name="PUN-CORE-R1")
print("record:", r1, "| id:", r1.id)
print("role:", r1.role, "| site:", r1.site.slug, "| platform:", r1.platform.slug)
print("status:", r1.status.value, "/", r1.status.label)
print("custom fields:", r1.custom_fields)
print("ntp from config context:", r1.config_context["ntp_servers"])
print("tags:", [t.name for t in r1.tags])</pre>
<table class="cmp"><tr><th>Call</th><th>Returns</th><th>When nothing matches</th></tr>
<tr><td><code>get(name=...)</code> or <code>get(id)</code></td><td>one Record</td><td><code>None</code>; two matches raise <code>ValueError</code></td></tr>
<tr><td><code>filter(site="pune")</code></td><td>a RecordSet</td><td>an empty RecordSet</td></tr>
<tr><td><code>all()</code></td><td>a RecordSet of everything</td><td>empty</td></tr>
<tr><td><code>count(...)</code></td><td>an integer</td><td>0</td></tr>
<tr><td><code>create(...)</code>, <code>update([...])</code>, <code>delete(...)</code></td><td>Record(s) or True</td><td>chapter 7</td></tr></table>

<pre class="out">AUTO01$ python3 tour.py
version: 4.1
record: PUN-CORE-R1 | id: 1
role: Core Router | site: pune | platform: cisco-ios-xe
status: active / Active
custom fields: {'monitored': True, 'owner_team': 'NOC'}
ntp from config context: ['10.99.0.60']
tags: ['critical', 'automation']
device_type: CSR1000V | tenant: MyPnetLab
get() for a missing name: None
get() for a missing id: None
count: 6 | pune: 4
access switches: ['BLR-ACC-SW1', 'PUN-ACC-SW1']
a RecordSet is lazy: 6 items; first: ['BLR-ACC-SW1', 'BLR-EDGE-R1']
first with iter() and next(): BLR-ACC-SW1
next() on the RecordSet itself: 'RecordSet' object is not an iterator
endpoints: devices | ip-addresses</pre>

<h3>Records are objects with nested objects</h3>
<p>Read the first lines of the output. <code>r1.site.slug</code>, <code>r1.status.value</code>, <code>r1.config_context["ntp_servers"]</code>: the nested JSON became attribute access. A choice field such as status is an object with a machine <code>value</code> (<code>active</code>) and a human <code>label</code> (<code>Active</code>). Compare with the label in your own scripts at your peril; the value is what the API accepts.</p>

<h3>The laziness you should know about</h3>
<p>Two things are lazy. First, a <b>RecordSet</b> does not fetch anything until you iterate it, and it fetches page after page for you. It has a length and you can loop it, but you cannot index it with <code>[0]</code>. Second, a nested Record such as <code>device.primary_ip4</code> arrives as a brief object, only id, address and a few fields. Asking for a field it does not have makes pynetbox quietly fetch the full object.</p>
<pre class="code">from nbconn import api

nb = api()
d = nb.dcim.devices.get(name="PUN-CORE-R1")
ip = d.primary_ip4
print("nested record:", ip, "| id:", ip.id)
print("dns_name needs the full object:", ip.dns_name)</pre>
<pre class="out">AUTO01$ python3 lazy.py
nested record: 10.99.0.1/24 | id: 1
dns_name needs the full object: pun-core-r1.nk.lab</pre>
<pre class="out">NB# tail -n 2 /var/log/nginx/access.log
10.99.0.60 - - [11/Oct/2026:15:36:52 +0000] "GET /api/dcim/devices/?name=PUN-CORE-R1 HT&#84;P/1.1" 200 2603 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:52 +0000] "GET /api/ipam/ip-addresses/1/ HT&#84;P/1.1" 200 858 "-" "python-requests/2.32.3"</pre>
<p>That second command is the proof, taken from the NetBox access log: the first line is the device lookup, the second is the follow-up request for the IP address, made when we printed <code>dns_name</code>. Each lazy fetch is one more request, so a loop that touches a nested field on 500 devices makes 500 extra calls. The fix is to ask for what you need up front with a filter or <code>fields</code>, or to fetch the related objects in one query.</p>

<h3>The next() trap</h3>
<p>The tour ends with a famous one. A RecordSet is <i>iterable</i> but not an <i>iterator</i>. <code>next(rs)</code> fails with "not an iterator"; <code>next(iter(rs))</code> works. For "give me one" use <code>get()</code>, and for "give me the first of many" use <code>list(rs)[0]</code> after checking that the list is not empty.</p>

<div class="warn"><p><b>Common mistake.</b> <code>nb.dcim.devices.get(role="access-switch")</code> with more than one match raises <code>ValueError</code>, not "returns the first". Use <code>get()</code> only with a key that is unique, such as <code>name</code> or <code>id</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get()</code> returns <code>None</code> for "not found" instead of raising. Code that goes straight to <code>.id</code> on the result fails with <code>AttributeError: 'NoneType'</code> far from the real cause.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab's pynetbox is a pure-Python port of version 7.4.1 that talks to the lab NetBox, and its output is real for what we show above. It has one known gap: <code>record.save()</code>, the usual way to write back an edited Record, does not work reliably there. The labs and the scripts in this module write with <code>endpoint.update([{"id": ...}])</code> instead, which real pynetbox also supports. On a real server, <code>save()</code> is fine and widely used; if it works for you there, use it.</p></div>

<div class="scn"><h4>Five hundred hidden requests</h4><p>A report listed every device with its management address and DNS name. It took four minutes. The author had read <code>device.primary_ip4.dns_name</code> inside the loop, and each iteration quietly fetched the IP address. One change, fetching all addresses once with <code>ip_addresses.filter(...)</code> and joining in a dictionary, brought it to six seconds.</p><p><b>Lesson:</b> a dot can be a network call. Count requests the way you count loops.</p></div>
<div class="iv"><p class="q">"What is the difference between get() and filter() in pynetbox?"</p><p><code>get()</code> returns one Record, or None, and raises ValueError if more than one object matches. <code>filter()</code> returns a lazy RecordSet that pages through results as you iterate. I use <code>get()</code> only with unique keys and <code>filter()</code> for everything else.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pynetbox handles URL, token and paging; app and endpoint names mirror the URL.</li>
<li><code>get()</code> gives one Record or None, <code>filter()</code> a lazy RecordSet, <code>count()</code> an integer.</li>
<li>A RecordSet cannot be indexed and <code>next()</code> needs <code>iter()</code>.</li>
<li>Nested records are brief; reading a missing field triggers a hidden request.</li>
<li>Choice fields have a <code>value</code> and a <code>label</code>.</li></ul></div>`,hi:`
<p>Chapter 2 mein aapne <code>requests</code> se API bulayi aur JSON khud kholi. Woh chalta hai, par har baar aap wahi teen cheezein likhte the: base URL, token header aur pages par loop. <b>pynetbox</b> ek chhoti library hai jo yeh teen kaam aapke liye karti hai aur dictionaries ki jagah objects deti hai. <code>requests</code> ko manual car samjho aur pynetbox ko wahi car automatic mein: kahan jaana hai yeh phir bhi aapko pata hona chahiye.</p>

<h3>Ek baar connect, phir poocho</h3>
<p>Is module ki har script <code>from nbconn import api</code> se shuru hoti hai. Woh chhoti file <code>~/.netbox.env</code> padhti hai (py-secrets ki python-dotenv wali aadat) aur tayyar connection deti hai. App ke naam URLs jaise hain: <code>nb.dcim.devices</code> matlab <code>/api/dcim/devices/</code>, aur <code>nb.ipam.ip_addresses</code> mein underscore hai jahan URL mein dash hota hai.</p>
<pre class="code">"""tour.py - the pynetbox basics in one run"""
from nbconn import api

nb = api()
print("version:", nb.version)
r1 = nb.dcim.devices.get(name="PUN-CORE-R1")
print("record:", r1, "| id:", r1.id)
print("role:", r1.role, "| site:", r1.site.slug, "| platform:", r1.platform.slug)
print("status:", r1.status.value, "/", r1.status.label)
print("custom fields:", r1.custom_fields)
print("ntp from config context:", r1.config_context["ntp_servers"])
print("tags:", [t.name for t in r1.tags])</pre>
<table class="cmp"><tr><th>Call</th><th>Kya lautata hai</th><th>Kuch na mile to</th></tr>
<tr><td><code>get(name=...)</code> ya <code>get(id)</code></td><td>ek Record</td><td><code>None</code>; do match hon to <code>ValueError</code></td></tr>
<tr><td><code>filter(site="pune")</code></td><td>RecordSet</td><td>khali RecordSet</td></tr>
<tr><td><code>all()</code></td><td>sab ka RecordSet</td><td>khali</td></tr>
<tr><td><code>count(...)</code></td><td>integer</td><td>0</td></tr>
<tr><td><code>create(...)</code>, <code>update([...])</code>, <code>delete(...)</code></td><td>Record(s) ya True</td><td>chapter 7</td></tr></table>

<pre class="out">AUTO01$ python3 tour.py
version: 4.1
record: PUN-CORE-R1 | id: 1
role: Core Router | site: pune | platform: cisco-ios-xe
status: active / Active
custom fields: {'monitored': True, 'owner_team': 'NOC'}
ntp from config context: ['10.99.0.60']
tags: ['critical', 'automation']
device_type: CSR1000V | tenant: MyPnetLab
get() for a missing name: None
get() for a missing id: None
count: 6 | pune: 4
access switches: ['BLR-ACC-SW1', 'PUN-ACC-SW1']
a RecordSet is lazy: 6 items; first: ['BLR-ACC-SW1', 'BLR-EDGE-R1']
first with iter() and next(): BLR-ACC-SW1
next() on the RecordSet itself: 'RecordSet' object is not an iterator
endpoints: devices | ip-addresses</pre>

<h3>Records nested objects wale objects hain</h3>
<p>Output ki pehli lines padho. <code>r1.site.slug</code>, <code>r1.status.value</code>, <code>r1.config_context["ntp_servers"]</code>: nested JSON attribute access ban gayi. Status jaisa choice field ek object hai jisme machine <code>value</code> (<code>active</code>) aur insaani <code>label</code> (<code>Active</code>) hota hai. Apni scripts mein label se compare karna khatre ka kaam hai; API value ko maanti hai.</p>

<h3>Woh aalas jo aapko pata honi chahiye</h3>
<p>Do cheezein lazy hain. Pehli, <b>RecordSet</b> tab tak kuch fetch nahi karta jab tak aap use iterate na karo, aur woh aapke liye page par page fetch karta hai. Uski length hoti hai aur loop chal sakta hai, par <code>[0]</code> se index nahi kar sakte. Doosri, nested Record jaise <code>device.primary_ip4</code> brief object ki tarah aata hai, sirf id, address aur kuch fields. Jo field usme nahi hai use maangoge to pynetbox chupchap poora object fetch kar leta hai.</p>
<pre class="code">from nbconn import api

nb = api()
d = nb.dcim.devices.get(name="PUN-CORE-R1")
ip = d.primary_ip4
print("nested record:", ip, "| id:", ip.id)
print("dns_name needs the full object:", ip.dns_name)</pre>
<pre class="out">AUTO01$ python3 lazy.py
nested record: 10.99.0.1/24 | id: 1
dns_name needs the full object: pun-core-r1.nk.lab</pre>
<pre class="out">NB# tail -n 2 /var/log/nginx/access.log
10.99.0.60 - - [11/Oct/2026:15:36:52 +0000] "GET /api/dcim/devices/?name=PUN-CORE-R1 HT&#84;P/1.1" 200 2603 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:52 +0000] "GET /api/ipam/ip-addresses/1/ HT&#84;P/1.1" 200 858 "-" "python-requests/2.32.3"</pre>
<p>Doosra command saboot hai, NetBox ke access log se: pehli line device lookup hai, doosri IP address ka follow-up request hai, jo tab hua jab humne <code>dns_name</code> print kiya. Har lazy fetch ek aur request hai, isliye jo loop 500 devices par nested field chhuta hai woh 500 extra calls karta hai. Hal hai pehle se filter ya <code>fields</code> se jo chahiye maangna, ya related objects ek query mein laana.</p>

<h3>next() ka jaal</h3>
<p>Tour ek mashhoor jaal par khatam hoti hai. RecordSet <i>iterable</i> hai par <i>iterator</i> nahi. <code>next(rs)</code> "not an iterator" se fail hota hai; <code>next(iter(rs))</code> chalta hai. "Mujhe ek do" ke liye <code>get()</code> use karo, aur "bahut mein se pehla" ke liye list khali na ho yeh check karke <code>list(rs)[0]</code>.</p>

<div class="warn"><p><b>Common mistake.</b> <code>nb.dcim.devices.get(role="access-switch")</code> mein agar ek se zyada match hon to <code>ValueError</code> aata hai, "pehla de do" nahi hota. <code>get()</code> sirf unique key ke saath use karo, jaise <code>name</code> ya <code>id</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get()</code> "nahi mila" par raise karne ki jagah <code>None</code> lautata hai. Jo code seedha result par <code>.id</code> maangta hai woh asli wajah se door <code>AttributeError: 'NoneType'</code> se fail hota hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab ka pynetbox version 7.4.1 ka pure-Python port hai jo lab NetBox se baat karta hai, aur upar dikhaya output asli hai. Ek jaani hui kami hai: <code>record.save()</code>, jo edit kiye Record ko wapas likhne ka aam tareeka hai, wahan bharosemand nahi chalta. Is module ki labs aur scripts isliye <code>endpoint.update([{"id": ...}])</code> se likhti hain, jo asli pynetbox bhi support karta hai. Asli server par <code>save()</code> theek hai aur bahut use hota hai; wahan chale to use karo.</p></div>

<div class="scn"><h4>Paanch sau chhupe requests</h4><p>Ek report har device ko uske management address aur DNS name ke saath list karti thi. Chaar minute lagte the. Author ne loop ke andar <code>device.primary_ip4.dns_name</code> padha tha, aur har iteration chupchap IP address fetch karta tha. Ek badlav, saare addresses ek baar <code>ip_addresses.filter(...)</code> se laana aur dictionary mein join karna, ne chhe second kar diye.</p><p><b>Lesson:</b> ek dot network call ho sakta hai. Requests ko waise gino jaise loops ko ginte ho.</p></div>
<div class="iv"><p class="q">"pynetbox mein get() aur filter() ka kya farak hai?"</p><p><code>get()</code> ek Record lautata hai, ya None, aur ek se zyada match hon to ValueError. <code>filter()</code> lazy RecordSet lautata hai jo iterate karte hue pages laata hai. Main <code>get()</code> sirf unique keys ke saath use karta hoon aur baaki sab ke liye <code>filter()</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pynetbox URL, token aur paging sambhalta hai; app aur endpoint ke naam URL jaise hain.</li>
<li><code>get()</code> ek Record ya None, <code>filter()</code> lazy RecordSet, <code>count()</code> integer.</li>
<li>RecordSet ko index nahi kar sakte aur <code>next()</code> ko <code>iter()</code> chahiye.</li>
<li>Nested records brief hote hain; missing field padhne par chhupa request jata hai.</li>
<li>Choice fields mein <code>value</code> aur <code>label</code> hote hain.</li></ul></div>`}};export{e as default};