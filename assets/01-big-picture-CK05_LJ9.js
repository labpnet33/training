var e={id:`big-picture`,h:{en:`Why NetBox: one source of truth for the whole network`,hi:`NetBox kyon: poore network ke liye ek source of truth`},body:{en:`
<p><b>What you will learn.</b> By the end of this module you can read a network inventory out of NetBox with REST and with <code>pynetbox</code>, ask precise questions with filters, take the next free prefix and address without clashes, read every error a script meets, render a router configuration from NetBox data, push it with netmiko, check the router against NetBox for drift, and write the result back. You will build one small tool, step by step, and then break another one four ways and repair it.</p>
<p><b>Prerequisites.</b> <code>auto-requests</code> (REST with the requests library, which you already know), <code>py-ipaddr</code> (the ipaddress module), <code>py-templates</code> (Jinja2), <code>py-secrets</code> (environment variables and .env files) and <code>adv-nkmiko</code> (netmiko-style SSH to many vendors). The module after this one, <code>adv-nornir</code>, uses a NetBox plugin for its inventory; here we only point forward to it.</p>

<h3>An analogy: the architect's drawings</h3>
<p>A building has two lives. One is on paper: the architect's drawings say where every wall, pipe and socket should be. The other is in concrete: what the builders actually made. When the two disagree, somebody is wrong, and you need to know which. A network is the same. Most teams keep the paper version in spreadsheets, wiki pages and people's heads, and then wonder why the real network does not match. <b>NetBox is the drawing board</b>: a database of what the network is <i>supposed</i> to be, with an API so that scripts can read the drawings, build from them and inspect the building against them.</p>

<h3>Intent and state</h3>
<p>Two words carry this whole module. <b>Intent</b> is what you want: PUN-CORE-R1 exists in Pune, it is a core router, GigabitEthernet0/1 has the address 172.31.10.1/30. <b>State</b> is what the device reports: the interface is up, it holds that address, OSPF has three networks. A <b>source of truth</b> (SoT) is the one place where intent is written down, so that every tool agrees on it. NetBox covers two families of intent: <b>DCIM</b> (sites, racks, devices, interfaces, cables) and <b>IPAM</b> (VRFs, prefixes, IP addresses, VLANs). It does not replace monitoring: it does not know that an interface went down five minutes ago.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NetBox in the middle, scripts and devices around it">
<rect x="250" y="20" width="140" height="64" rx="12" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">NetBox</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">intent: DCIM + IPAM</text>
<rect x="20" y="20" width="150" height="64" rx="12" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">Python scripts</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="11">requests, pynetbox</text>
<rect x="470" y="20" width="150" height="64" rx="12" fill="#ddd6fe"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">Jinja2 templates</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="11">intent to config</text>
<rect x="250" y="150" width="140" height="64" rx="12" fill="#fed7aa"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Routers, switches</text><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="11">state: what is running</text>
<line x1="170" y1="52" x2="250" y2="52" stroke="#64748b" stroke-width="2"/><line x1="390" y1="52" x2="470" y2="52" stroke="#64748b" stroke-width="2"/>
<line x1="545" y1="84" x2="390" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="84" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="150" y="120" text-anchor="middle" class="svg-muted" font-size="11">1 read and allocate</text><text x="500" y="130" text-anchor="middle" class="svg-muted" font-size="11">2 render, 3 push</text><text x="395" y="122" text-anchor="start" class="svg-muted" font-size="11">4 verify, write back</text>
</svg><p class="cap">Intent lives in NetBox. A script reads it, renders configuration, pushes it, then compares the device with NetBox and writes the result back.</p></div>

<h3>The lab world</h3>
<table class="cmp"><tr><th>Device</th><th>What it is</th><th>Address</th></tr>
<tr><td>AUTO01</td><td>Ubuntu automation host (netadmin / Deccan@123)</td><td>10.99.0.60</td></tr>
<tr><td>NB</td><td>NetBox 4.1 server, nginx on 443 in front of the application</td><td>10.99.0.80</td></tr>
<tr><td>R1</td><td>IOS XE router that plays PUN-CORE-R1 (SSH netops / NK@2026)</td><td>10.99.0.1</td></tr>
<tr><td>SW1, DSW</td><td>Switches: the management LAN, and a stand-in for PUN-DIST-SW1</td><td>-</td></tr></table>
<p>NetBox starts with a small estate: two sites (Pune and Bengaluru), six devices, ten IP addresses, nine prefixes and six config contexts. Credentials never sit in scripts. The file <code>~/.netbox.env</code> holds the address and token, and <code>nbconn.py</code> reads it; you met this pattern in <code>py-secrets</code>.</p>
<pre class="code">NETBOX_URL=h&#116;tps://10.99.0.80
NETBOX_TOKEN=&lt;your 40-character token&gt;
DEVICE_USER=netops
DEVICE_PASSWORD=NK@2026</pre>
<p>Your first call, with the requests library you know from Program 1:</p>
<pre class="code">import requests

from nbconn import URL, session

s = session()
r = s.get(URL + "/api/status/")
print("status", r.status_code, "NetBox", r.json()["netbox-version"])

r = s.get(URL + "/api/dcim/devices/", params={"site": "pune", "role": "core-router", "fields": "id,name,status"})
body = r.json()
print("core routers at pune:", body["count"])
for d in body["results"]:
    print("  ", d["id"], d["name"], d["status"]["value"])

anon = requests.get(URL + "/api/status/", verify=False)
print("without a token:", anon.status_code, anon.json()["detail"])</pre>
<pre class="out">AUTO01$ python3 rest_check.py
status 200 NetBox 4.1.11
core routers at pune: 2
   1 PUN-CORE-R1 active
   2 PUN-CORE-R3 active
<span class="hl">without a token: 403 Authentication credentials were not provided.</span></pre>
<p>The last line is the interesting one: with no token NetBox answers <b>403</b>, not 401. Remember it; chapter 10 uses it.</p>

<div class="eg"><p><b>Worked example: the inventory.</b> The same question in pynetbox is shorter and returns objects instead of dictionaries. This is the report you will extend in chapter 5.</p>
<pre class="out">AUTO01$ python3 inventory.py
NetBox 4.1 4.1.11
DEVICE         ROLE                 SITE       STATUS    MGMT IP
PUN-ACC-SW1    Access Switch        Pune       Active    10.99.0.21/24
PUN-CORE-R1    Core Router          Pune       Active    10.99.0.1/24
PUN-CORE-R3    Core Router          Pune       Active    10.99.0.3/24
<span class="hl">   maintenance window: Sun 02:00-04:00 IST</span>
PUN-DIST-SW1   Distribution Switch  Pune       Active    10.99.0.11/24
devices: 6 pune: 4</pre></div>

<div class="warn"><p><b>Common mistake.</b> Treating NetBox as the place where you <i>record what you found</i> after the fact. If the drawings are written after the building, they describe the mess. Write intent first, then build from it.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab NetBox is an educational model of NetBox 4.1.11. Field names, JSON shapes, filters, status codes and error texts follow the real product, but the data lives in memory and goes back to the seed when you leave the lab, and there is no web page, plugin, webhook or user system. Everything you write against the API also runs against a real NetBox 4.1.</p></div>

<div class="scn"><h4>The two spreadsheets</h4><p>A Pune team kept IP addresses in one spreadsheet and device names in another. During a data-centre move, two engineers each took 10.99.0.30 for a new switch, and a link flapped for an hour before anyone found the clash. After the team moved to NetBox, the same request became one API call that returns the next free address and records it at once, so the second engineer got 10.99.0.31.</p><p><b>Lesson:</b> a source of truth is not about nicer screens. It is about one writer-safe place that every tool consults.</p></div>
<div class="iv"><p class="q">"What is a source of truth, and why NetBox?"</p><p>A source of truth is the single place where the intended state of the network is recorded, so automation can build from it and check against it. NetBox fits because it models both DCIM and IPAM, exposes a REST and GraphQL API, and enforces rules (no duplicate addresses, valid relations) that a spreadsheet cannot.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent is what you want; state is what the device reports. NetBox stores intent.</li>
<li>NetBox covers DCIM (sites, devices, interfaces, cables) and IPAM (VRFs, prefixes, addresses, VLANs).</li>
<li>The flow is read, allocate, render, push, verify, write back.</li>
<li>Credentials come from the environment, never from the script.</li>
<li>Without a token NetBox answers 403.</li></ul></div>`,hi:`
<p><b>Aap kya seekhoge.</b> Is module ke ant tak aap REST aur <code>pynetbox</code> se NetBox ki network inventory padh sakte ho, filters se precise sawal pooch sakte ho, bina clash ke agla free prefix aur address le sakte ho, script ko milne wala har error padh sakte ho, NetBox data se router configuration render kar sakte ho, netmiko se push kar sakte ho, router ko NetBox se milakar drift check kar sakte ho aur result wapas likh sakte ho. Ek chhota tool step by step banaoge, phir doosre tool ko chaar tareeke se todkar theek karoge.</p>
<p><b>Prerequisites.</b> <code>auto-requests</code> (requests library se REST, jo aap jaante ho), <code>py-ipaddr</code> (ipaddress module), <code>py-templates</code> (Jinja2), <code>py-secrets</code> (environment variables aur .env files) aur <code>adv-nkmiko</code> (kai vendors par netmiko-style SSH). Is module ke baad wala <code>adv-nornir</code> apni inventory ke liye NetBox plugin use karta hai; yahan hum sirf us taraf ishara karte hain.</p>

<h3>Ek analogy: architect ke drawings</h3>
<p>Ek building ki do zindagiyan hoti hain. Ek kagaz par: architect ke drawings batate hain ki har deewar, pipe aur socket kahan hona chahiye. Doosri concrete mein: builders ne asal mein kya banaya. Jab dono mein farq ho, to koi galat hai, aur aapko jaanna hai kaun. Network bhi aisa hi hai. Zyadatar teams kagaz wala version spreadsheets, wiki pages aur logon ke dimaag mein rakhti hain, phir sochti hain ki asli network match kyon nahi karta. <b>NetBox drawing board hai</b>: ek database jo batata hai ki network kaisa <i>hona chahiye</i>, aur ek API jisse scripts drawings padh sakein, unse build kar sakein aur building ko unse milakar inspect kar sakein.</p>

<h3>Intent aur state</h3>
<p>Do shabd poore module ko sambhalte hain. <b>Intent</b> woh hai jo aap chahte ho: PUN-CORE-R1 Pune mein hai, woh core router hai, GigabitEthernet0/1 ka address 172.31.10.1/30 hai. <b>State</b> woh hai jo device report karta hai: interface up hai, usne woh address pakda hai, OSPF mein teen networks hain. <b>Source of truth</b> (SoT) woh ek jagah hai jahan intent likha jata hai, taaki har tool us par ek mat ho. NetBox intent ke do parivar sambhalta hai: <b>DCIM</b> (sites, racks, devices, interfaces, cables) aur <b>IPAM</b> (VRFs, prefixes, IP addresses, VLANs). Yeh monitoring ki jagah nahi leta: use nahi pata ki ek interface paanch minute pehle down hua.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Beech mein NetBox, aas paas scripts aur devices">
<rect x="250" y="20" width="140" height="64" rx="12" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">NetBox</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">intent: DCIM + IPAM</text>
<rect x="20" y="20" width="150" height="64" rx="12" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">Python scripts</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="11">requests, pynetbox</text>
<rect x="470" y="20" width="150" height="64" rx="12" fill="#ddd6fe"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">Jinja2 templates</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="11">intent se config</text>
<rect x="250" y="150" width="140" height="64" rx="12" fill="#fed7aa"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Routers, switches</text><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="11">state: jo chal raha hai</text>
<line x1="170" y1="52" x2="250" y2="52" stroke="#64748b" stroke-width="2"/><line x1="390" y1="52" x2="470" y2="52" stroke="#64748b" stroke-width="2"/>
<line x1="545" y1="84" x2="390" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="84" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="150" y="120" text-anchor="middle" class="svg-muted" font-size="11">1 padho aur allocate karo</text><text x="500" y="130" text-anchor="middle" class="svg-muted" font-size="11">2 render, 3 push</text><text x="395" y="122" text-anchor="start" class="svg-muted" font-size="11">4 verify, write back</text>
</svg><p class="cap">Intent NetBox mein rehta hai. Script use padhti hai, configuration render karti hai, push karti hai, phir device ko NetBox se milati hai aur result wapas likhti hai.</p></div>

<h3>Lab ki duniya</h3>
<table class="cmp"><tr><th>Device</th><th>Kya hai</th><th>Address</th></tr>
<tr><td>AUTO01</td><td>Ubuntu automation host (netadmin / Deccan@123)</td><td>10.99.0.60</td></tr>
<tr><td>NB</td><td>NetBox 4.1 server, application ke aage 443 par nginx</td><td>10.99.0.80</td></tr>
<tr><td>R1</td><td>IOS XE router jo PUN-CORE-R1 banta hai (SSH netops / NK@2026)</td><td>10.99.0.1</td></tr>
<tr><td>SW1, DSW</td><td>Switches: management LAN, aur PUN-DIST-SW1 ka stand-in</td><td>-</td></tr></table>
<p>NetBox ek chhote estate ke saath shuru hota hai: do sites (Pune aur Bengaluru), chhe devices, das IP addresses, nau prefixes aur chhe config contexts. Credentials kabhi scripts mein nahi baithte. File <code>~/.netbox.env</code> mein address aur token hain, aur <code>nbconn.py</code> use padhta hai; yeh pattern aap <code>py-secrets</code> mein mil chuke ho.</p>
<pre class="code">NETBOX_URL=h&#116;tps://10.99.0.80
NETBOX_TOKEN=&lt;your 40-character token&gt;
DEVICE_USER=netops
DEVICE_PASSWORD=NK@2026</pre>
<p>Aapki pehli call, requests library ke saath jo aap Program 1 se jaante ho:</p>
<pre class="code">import requests

from nbconn import URL, session

s = session()
r = s.get(URL + "/api/status/")
print("status", r.status_code, "NetBox", r.json()["netbox-version"])

r = s.get(URL + "/api/dcim/devices/", params={"site": "pune", "role": "core-router", "fields": "id,name,status"})
body = r.json()
print("core routers at pune:", body["count"])
for d in body["results"]:
    print("  ", d["id"], d["name"], d["status"]["value"])

anon = requests.get(URL + "/api/status/", verify=False)
print("without a token:", anon.status_code, anon.json()["detail"])</pre>
<pre class="out">AUTO01$ python3 rest_check.py
status 200 NetBox 4.1.11
core routers at pune: 2
   1 PUN-CORE-R1 active
   2 PUN-CORE-R3 active
<span class="hl">without a token: 403 Authentication credentials were not provided.</span></pre>
<p>Aakhri line dilchasp hai: token na ho to NetBox <b>403</b> deta hai, 401 nahi. Yaad rakhna; chapter 10 mein kaam aayega.</p>

<div class="eg"><p><b>Worked example: inventory.</b> Wahi sawal pynetbox mein chhota hai aur dictionaries ki jagah objects lautata hai. Yeh woh report hai jo aap chapter 5 mein badhaoge.</p>
<pre class="out">AUTO01$ python3 inventory.py
NetBox 4.1 4.1.11
DEVICE         ROLE                 SITE       STATUS    MGMT IP
PUN-ACC-SW1    Access Switch        Pune       Active    10.99.0.21/24
PUN-CORE-R1    Core Router          Pune       Active    10.99.0.1/24
PUN-CORE-R3    Core Router          Pune       Active    10.99.0.3/24
<span class="hl">   maintenance window: Sun 02:00-04:00 IST</span>
PUN-DIST-SW1   Distribution Switch  Pune       Active    10.99.0.11/24
devices: 6 pune: 4</pre></div>

<div class="warn"><p><b>Common mistake.</b> NetBox ko aisi jagah samajhna jahan aap cheezein <i>baad mein record</i> karte ho jab woh mil chuki hon. Agar drawings building ke baad likhe jayen, to woh gadbad ko hi describe karte hain. Pehle intent likho, phir usse build karo.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab ka NetBox NetBox 4.1.11 ka educational model hai. Field names, JSON shapes, filters, status codes aur error texts asli product ko follow karte hain, par data memory mein rehta hai aur lab chhodne par seed par wapas chala jata hai, aur koi web page, plugin, webhook ya user system nahi hai. API par jo bhi aap likhoge woh asli NetBox 4.1 par bhi chalega.</p></div>

<div class="scn"><h4>Do spreadsheets</h4><p>Pune ki ek team IP addresses ek spreadsheet mein aur device names doosri mein rakhti thi. Data-centre move ke dauran do engineers ne naye switch ke liye 10.99.0.30 le liya, aur ek ghante tak link flap hota raha jab tak kisi ne clash nahi pakda. Team NetBox par aayi to wahi request ek API call ban gayi jo agla free address deti hai aur turant record kar leti hai, isliye doosre engineer ko 10.99.0.31 mila.</p><p><b>Lesson:</b> source of truth ka matlab sundar screens nahi hai. Matlab hai ek aisi jagah jahan likhna safe ho aur har tool use dekhe.</p></div>
<div class="iv"><p class="q">"Source of truth kya hota hai, aur NetBox hi kyon?"</p><p>Source of truth woh ek jagah hai jahan network ki intended state likhi hoti hai, taaki automation usse build kar sake aur usse check kar sake. NetBox isliye fit hai kyunki woh DCIM aur IPAM dono model karta hai, REST aur GraphQL API deta hai, aur woh rules lagata hai (duplicate address nahi, valid relations) jo spreadsheet nahi laga sakti.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent woh hai jo aap chahte ho; state woh hai jo device report karta hai. NetBox intent store karta hai.</li>
<li>NetBox DCIM (sites, devices, interfaces, cables) aur IPAM (VRFs, prefixes, addresses, VLANs) cover karta hai.</li>
<li>Flow hai: padho, allocate karo, render karo, push karo, verify karo, write back karo.</li>
<li>Credentials environment se aate hain, script se kabhi nahi.</li>
<li>Token ke bina NetBox 403 deta hai.</li></ul></div>`}};export{e as default};