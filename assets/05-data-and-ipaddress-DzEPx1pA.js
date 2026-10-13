var e={id:`data-and-ipaddress`,h:{en:`Feeding the template: CSV, JSON and ipaddress`,hi:`Template ko data dena: CSV, JSON aur ipaddress`},body:{en:`
<p><b>The idea of this chapter:</b> a template is only as good as its data. Here you learn to keep device values in a CSV or JSON file, load them into Python, and use the <code>ipaddress</code> module to compute masks, gateways and next hops, so the template stays plain text.</p>

<h3>Analogy: the order form and the kitchen</h3>
<p>A restaurant has an order form (the data) and a kitchen (the template and script). The waiter does not cook, and the cook does not write the order. Clean separation means anyone can fill the form, and the kitchen always produces dishes the same way. Your CSV or JSON is the order form.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Data files loaded by Python into dictionaries">
<rect x="20" y="20" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">switches.csv</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">table for people</text>
<rect x="20" y="100" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="126" text-anchor="middle" class="svg-ink" font-size="13">sites.json</text><text x="105" y="146" text-anchor="middle" class="svg-muted" font-size="12">nested data</text>
<line x1="190" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="130" x2="260" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="60" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="335" y="88" text-anchor="middle" class="svg-ink" font-size="13">Python</text><text x="335" y="108" text-anchor="middle" class="svg-muted" font-size="12">csv, json, ipaddress</text>
<line x1="410" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="460" y="45" width="160" height="100" rx="10" fill="#bbf7d0"/><text x="540" y="70" text-anchor="middle" class="svg-ink" font-size="13">dictionaries</text><text x="540" y="92" text-anchor="middle" class="svg-muted" font-size="12">hostname, ports,</text><text x="540" y="110" text-anchor="middle" class="svg-muted" font-size="12">gw, mask ...</text><text x="540" y="132" text-anchor="middle" class="svg-accent" font-size="12">passed to render()</text>
</svg><p class="cap">Files hold the values; Python loads and completes them; the template prints them.</p></div>

<h3>CSV: one row per device</h3>
<p>CSV is the right format when a person maintains the data in a spreadsheet. <code>csv.DictReader</code> turns every row into a dictionary keyed by the header names. Try it with <code>sw.csv</code>:</p>
<pre class="code">hostname,mgmt_ip,ports
PUN-ACC-SW1,192.0.2.11,Gi0/2 Gi0/3
PUN-ACC-SW2,192.0.2.12,Gi0/2</pre>
<pre class="code">import csv

with open("sw.csv") as f:
    rows = list(csv.DictReader(f))
print(rows[0])
print(rows[0]["ports"].split())</pre>
<pre class="out">AUTO01$ python3 c1.py
{'hostname': 'PUN-ACC-SW1', 'mgmt_ip': '192.0.2.11', 'ports': <span class="hl">'Gi0/2 Gi0/3'</span>}
<span class="hl">['Gi0/2', 'Gi0/3']</span></pre>
<p>A CSV cell is always <b>text</b>. The <code>ports</code> cell is one string with spaces, so you call <code>.split()</code> to turn it into a list the template can loop over. The lab's <code>render.py</code> does exactly that: <code>sw["ports"] = sw["ports"].split()</code>. Remember that a number such as a VLAN ID also arrives as text (<code>"10"</code>); templates print it fine, but convert with <code>int()</code> if you compare it.</p>

<h3>JSON: nested data</h3>
<p>When a site has a list of LANs, each with its own VLAN and name, JSON fits better, as in the lab's <code>sites.json</code>. <code>json.loads</code> (or <code>json.load</code> for a file) gives dictionaries and lists, and numbers stay numbers:</p>
<pre class="code">import json

text = '{"hostname": "BLR-BR-R1", "lans": [{"vlan": 10, "name": "USERS"}]}'
site = json.loads(text)
print(site["lans"][0]["name"])</pre>
<pre class="out">AUTO01$ python3 j1.py
<span class="hl">USERS</span></pre>

<h3>ipaddress: do the maths in Python</h3>
<p>Beginners put masks and gateways in the data by hand, and they get them wrong. Let Python derive them. <code>ip_interface</code> understands an address <i>with</i> its prefix, <code>ip_network</code> understands a network. The documentation addresses below are from <code>ip1.py</code>:</p>
<pre class="code">import ipaddress

wan = ipaddress.ip_interface("192.0.2.2/30")
print(wan.ip, wan.netmask, wan.network)
net = ipaddress.ip_network("198.51.100.0/24")
print(net.network_address + 1, net.netmask)
try:
    ipaddress.ip_network("192.0.2.2/30")
except ValueError as err:
    print("ValueError:", err)</pre>
<pre class="out">AUTO01$ python3 ip1.py
<span class="hl">192.0.2.2 255.255.255.252 192.0.2.0/30</span>
<span class="hl">198.51.100.1 255.255.255.0</span>
<span class="hl">ValueError: 192.0.2.2/30 has host bits set</span></pre>
<ul>
<li><code>ip_interface("192.0.2.2/30")</code> keeps the router's own address (<code>.ip</code>) <i>and</i> its mask and network.</li>
<li><code>network_address + 1</code> gives the first usable address, a typical gateway.</li>
<li><code>ip_network</code> refuses an address with host bits set. That exact error appears in the troubleshooting lab: the data held the router's own address, so the code must use <code>ip_interface</code>.</li>
</ul>
<p>Then add the results to the dictionary before rendering, as the lab's second render script does with <code>site["wan_addr"]</code>, <code>site["wan_mask"]</code> and <code>lan["gw"]</code>. The template just prints <code>{{ lan.gw }} {{ lan.mask }}</code>.</p>

<div class="eg"><p><b>Worked example.</b> A branch has WAN <code>100.64.10.2/30</code> in the data. Python computes address 100.64.10.2, mask 255.255.255.252, and the ISP side 100.64.10.1 as the network address plus one. The template says <code>ip address {{ site.wan_addr }} {{ site.wan_mask }}</code> and <code>ip route 0.0.0.0 0.0.0.0 {{ site.wan_next_hop }}</code>. Nobody typed a mask by hand, so nobody mistyped one.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Keeping the masks in the CSV and mistyping them. Forgetting that CSV values are text. A trailing space in a header cell, which makes the key <code>"ports "</code> and causes a <code>KeyError</code>. Loading a JSON file with a trailing comma, which Python rejects. Using <code>ip_network</code> on a host address.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip_interface</code> = address plus prefix (a host on a network); <code>ip_network</code> = a network, which must have no host bits set (unless <code>strict=False</code>). <code>csv.DictReader</code> returns text for every cell.</p></div>

<div class="scn"><h4>Masks typed by hand</h4><p>A team kept masks in a spreadsheet column. For one branch a /30 was typed as 255.255.255.248. The rendered config was perfectly formed, the router accepted it, and the WAN neighbour became unreachable because the subnet sizes did not match. After the team stored only <code>100.64.10.2/30</code> and let <code>ipaddress</code> compute the mask, the mismatch could no longer be typed in.</p><p><b>Lesson:</b> store the minimum, compute the rest in code.</p></div>

<div class="iv"><p class="q">"Where should subnet calculations happen in a template pipeline?"</p><p>In Python, before rendering, using the <code>ipaddress</code> module: <code>ip_interface</code> for an address with prefix, and its <code>.ip</code>, <code>.netmask</code> and <code>.network</code> attributes. The results go into the data passed to the template, which stays simple text. That makes the logic testable and keeps masks and gateways consistent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSV suits spreadsheet-style data; JSON suits nested data. Both load into dictionaries.</li>
<li>CSV cells are text: <code>.split()</code> a port list, <code>int()</code> a number if you compare it.</li>
<li><code>ip_interface</code> keeps an address with its prefix; <code>ip_network</code> rejects host bits.</li>
<li>Compute masks, gateways and next hops in Python, not by hand and not in the template.</li>
<li>Store the minimum in the data and derive the rest.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> template utna hi achha hota hai jitna uska data. Yahan aap device values ko CSV ya JSON file mein rakhna, Python mein load karna, aur <code>ipaddress</code> module se masks, gateways aur next hops nikaalna seekhoge, taaki template seedha text rahe.</p>

<h3>Analogy: order form aur kitchen</h3>
<p>Restaurant mein order form (data) aur kitchen (template aur script) hota hai. Waiter khana nahi banata, aur cook order nahi likhta. Saaf alag-alag hone ka matlab koi bhi form bhar sakta hai, aur kitchen hamesha dishes ek tareeke se banata hai. Aapka CSV ya JSON order form hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Python data files ko dictionaries mein load karta hai">
<rect x="20" y="20" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">switches.csv</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">logon ke liye table</text>
<rect x="20" y="100" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="126" text-anchor="middle" class="svg-ink" font-size="13">sites.json</text><text x="105" y="146" text-anchor="middle" class="svg-muted" font-size="12">nested data</text>
<line x1="190" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="130" x2="260" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="60" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="335" y="88" text-anchor="middle" class="svg-ink" font-size="13">Python</text><text x="335" y="108" text-anchor="middle" class="svg-muted" font-size="12">csv, json, ipaddress</text>
<line x1="410" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="460" y="45" width="160" height="100" rx="10" fill="#bbf7d0"/><text x="540" y="70" text-anchor="middle" class="svg-ink" font-size="13">dictionaries</text><text x="540" y="92" text-anchor="middle" class="svg-muted" font-size="12">hostname, ports,</text><text x="540" y="110" text-anchor="middle" class="svg-muted" font-size="12">gw, mask ...</text><text x="540" y="132" text-anchor="middle" class="svg-accent" font-size="12">render() ko diye jaate hain</text>
</svg><p class="cap">Files values rakhti hain; Python load karke poora karta hai; template unhe print karta hai.</p></div>

<h3>CSV: har device ki ek row</h3>
<p>CSV tab sahi format hai jab koi insaan data ko spreadsheet mein sambhalta hai. <code>csv.DictReader</code> har row ko header ke naamon wali dictionary bana deta hai. <code>sw.csv</code> ke saath try karo:</p>
<pre class="code">hostname,mgmt_ip,ports
PUN-ACC-SW1,192.0.2.11,Gi0/2 Gi0/3
PUN-ACC-SW2,192.0.2.12,Gi0/2</pre>
<pre class="code">import csv

with open("sw.csv") as f:
    rows = list(csv.DictReader(f))
print(rows[0])
print(rows[0]["ports"].split())</pre>
<pre class="out">AUTO01$ python3 c1.py
{'hostname': 'PUN-ACC-SW1', 'mgmt_ip': '192.0.2.11', 'ports': <span class="hl">'Gi0/2 Gi0/3'</span>}
<span class="hl">['Gi0/2', 'Gi0/3']</span></pre>
<p>CSV ka cell hamesha <b>text</b> hota hai. <code>ports</code> cell spaces wali ek string hai, isliye aap <code>.split()</code> se use aisi list banate ho jis par template loop kar sake. Lab ki <code>render.py</code> yahi karti hai: <code>sw["ports"] = sw["ports"].split()</code>. Yaad rakho ki VLAN ID jaisa number bhi text ke roop mein aata hai (<code>"10"</code>); templates use theek print karte hain, par compare karna ho to <code>int()</code> se badlo.</p>

<h3>JSON: nested data</h3>
<p>Jab site ke paas LANs ki list ho, har ek ka apna VLAN aur naam, to JSON behtar baithta hai, jaise lab ki <code>sites.json</code> mein. <code>json.loads</code> (ya file ke liye <code>json.load</code>) dictionaries aur lists deta hai, aur numbers numbers hi rehte hain:</p>
<pre class="code">import json

text = '{"hostname": "BLR-BR-R1", "lans": [{"vlan": 10, "name": "USERS"}]}'
site = json.loads(text)
print(site["lans"][0]["name"])</pre>
<pre class="out">AUTO01$ python3 j1.py
<span class="hl">USERS</span></pre>

<h3>ipaddress: maths Python mein karo</h3>
<p>Beginners masks aur gateways data mein haath se daalte hain, aur galat daal dete hain. Python se nikalwao. <code>ip_interface</code> address ko prefix <i>ke saath</i> samajhta hai, <code>ip_network</code> network samajhta hai. Neeche documentation addresses <code>ip1.py</code> se hain:</p>
<pre class="code">import ipaddress

wan = ipaddress.ip_interface("192.0.2.2/30")
print(wan.ip, wan.netmask, wan.network)
net = ipaddress.ip_network("198.51.100.0/24")
print(net.network_address + 1, net.netmask)
try:
    ipaddress.ip_network("192.0.2.2/30")
except ValueError as err:
    print("ValueError:", err)</pre>
<pre class="out">AUTO01$ python3 ip1.py
<span class="hl">192.0.2.2 255.255.255.252 192.0.2.0/30</span>
<span class="hl">198.51.100.1 255.255.255.0</span>
<span class="hl">ValueError: 192.0.2.2/30 has host bits set</span></pre>
<ul>
<li><code>ip_interface("192.0.2.2/30")</code> router ka apna address (<code>.ip</code>) <i>aur</i> uska mask aur network rakhta hai.</li>
<li><code>network_address + 1</code> pehla usable address deta hai, jo aam taur par gateway hota hai.</li>
<li><code>ip_network</code> host bits wale address ko mana karta hai. Wahi error troubleshooting lab mein aata hai: data mein router ka apna address tha, isliye code ko <code>ip_interface</code> use karna chahiye.</li>
</ul>
<p>Phir results ko render se pehle dictionary mein jodo, jaise lab ki doosri render script <code>site["wan_addr"]</code>, <code>site["wan_mask"]</code> aur <code>lan["gw"]</code> ke saath karti hai. Template bas <code>{{ lan.gw }} {{ lan.mask }}</code> print karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Branch ka WAN data mein <code>100.64.10.2/30</code> hai. Python address 100.64.10.2, mask 255.255.255.252, aur ISP side 100.64.10.1 network address plus one se nikaalta hai. Template kehta hai <code>ip address {{ site.wan_addr }} {{ site.wan_mask }}</code> aur <code>ip route 0.0.0.0 0.0.0.0 {{ site.wan_next_hop }}</code>. Kisi ne mask haath se type nahi kiya, isliye kisi ne galat type nahi kiya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Masks ko CSV mein rakhna aur galat type karna. Bhoolna ki CSV values text hoti hain. Header cell mein trailing space, jisse key <code>"ports "</code> ban jaati hai aur <code>KeyError</code> aata hai. Trailing comma wali JSON file load karna, jo Python reject karta hai. Host address par <code>ip_network</code> use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip_interface</code> = address plus prefix (network par ek host); <code>ip_network</code> = ek network, jisme host bits set nahi hone chahiye (jab tak <code>strict=False</code> na ho). <code>csv.DictReader</code> har cell text ke roop mein deta hai.</p></div>

<div class="scn"><h4>Haath se type kiye masks</h4><p>Ek team masks ko spreadsheet column mein rakhti thi. Ek branch ke liye /30 ko 255.255.255.248 type kar diya gaya. Rendered config bilkul theek bani thi, router ne accept ki, aur WAN neighbour unreachable ho gaya kyunki subnet sizes match nahi karte the. Jab team ne sirf <code>100.64.10.2/30</code> rakha aur mask <code>ipaddress</code> se nikalwaya, mismatch type hona hi band ho gaya.</p><p><b>Lesson:</b> kam se kam store karo, baaki code se nikaalo.</p></div>

<div class="iv"><p class="q">"Template pipeline mein subnet calculations kahan honi chahiye?"</p><p>Python mein, render se pehle, <code>ipaddress</code> module se: prefix wale address ke liye <code>ip_interface</code>, aur uske <code>.ip</code>, <code>.netmask</code> aur <code>.network</code> attributes. Results us data mein jaate hain jo template ko diya jaata hai, jo seedha text rehta hai. Isse logic testable hoti hai aur masks aur gateways consistent rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSV spreadsheet-style data ke liye; JSON nested data ke liye. Dono dictionaries mein load hote hain.</li>
<li>CSV cells text hain: port list ko <code>.split()</code> karo, compare karna ho to number ko <code>int()</code> karo.</li>
<li><code>ip_interface</code> prefix ke saath address rakhta hai; <code>ip_network</code> host bits reject karta hai.</li>
<li>Masks, gateways aur next hops Python mein nikaalo, haath se nahi aur template mein nahi.</li>
<li>Data mein kam se kam rakho aur baaki derive karo.</li>
</ul></div>
`}};export{e as default};