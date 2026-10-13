var e={id:`python-requests-get`,h:{en:`Python requests: GET, JSON and a report across networks`,hi:`Python requests: GET, JSON aur networks ka report`},body:{en:`
<h3>The plan</h3>
<p>In this chapter you read the whole organization from code. You will list the networks, loop over them, list each network's devices and print a clean report. Reading is the safest use of an API because <b>GET changes nothing</b>. It matches lab <b>mk-api-1: read the organization</b>.</p>

<h3>The requests library in four lines</h3>
<p><code>requests</code> is a Python library that sends HTTP requests. <code>requests.get(url, headers=...)</code> sends a GET and returns a <b>Response</b> object. Three things on it matter now: <code>response.status_code</code> (a number such as 200), <code>response.json()</code> (the body converted into Python lists and dictionaries) and <code>response.text</code> (the raw text, useful when something is wrong).</p>
<pre class="code">import requests

BASE = "h&#116;tps://203.0.113.80/api/v1"
with open("key.txt") as f:
    HEADERS = {"Authorization": "Bearer " + f.read().strip()}

r = requests.get(BASE + "/organizations", headers=HEADERS)
print(r.status_code)
orgs = r.json()
org_id = orgs[0]["id"]
print("Organization:", orgs[0]["name"], org_id)</pre>
<pre class="out">200
Organization: Bharat Retail Co 1001</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Loop from organization to networks to devices">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">GET /organizations</text>
<rect x="190" y="20" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="290" y="50" text-anchor="middle" class="svg-ink" font-size="12">GET /organizations/1001/networks</text>
<rect x="420" y="20" width="210" height="50" rx="8" fill="#fde68a"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="12">for each network: /networks/id/devices</text>
<line x1="160" y1="45" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="45" x2="420" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="95" width="620" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">The id from each answer goes into the next path</text><text x="320" y="139" text-anchor="middle" class="svg-muted" font-size="12">org id, then network id, then devices</text>
<rect x="10" y="165" width="620" height="50" rx="8" fill="#fed7aa"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Output: one printed report line per device</text>
</svg><p class="cap">Each answer supplies the id for the next call.</p></div>

<h3>Networks and devices: the loop</h3>
<pre class="code">nets = requests.get(
    BASE + "/organizations/" + org_id + "/networks",
    headers=HEADERS,
).json()

for net in nets:
    print(net["id"], net["name"])</pre>
<pre class="out">mum Mumbai HQ
blr Bengaluru Branch
del Delhi Branch</pre>
<p>The loop picks one network dictionary at a time. Now add a second request inside the loop, using the network id:</p>
<pre class="code">for net in nets:
    url = BASE + "/networks/" + net["id"] + "/devices"
    devices = requests.get(url, headers=HEADERS).json()
    print(net["name"], "-", len(devices), "devices")
    for d in devices:
        print("   ", d["name"], d["type"])</pre>
<pre class="out">Mumbai HQ - 4 devices
    MX-MUM MX
    SW-MUM MS
    AP-MUM MR
    SRV-MUM server
Bengaluru Branch - 4 devices
    MX-BLR MX
    SW-BLR MS
    AP-BLR MR
    SRV-BLR server</pre>
<p>(The field names in these lab examples are our own; read the real responses in the lab with <code>print(r.json())</code> before you trust a field name.)</p>

<h3>A status report</h3>
<p>Combine the organization status call with a formatted print. The path <code>/organizations/{orgId}/devices/statuses</code> returns every device's state in one call, which is better than one call per device.</p>
<pre class="code">url = BASE + "/organizations/" + org_id + "/devices/statuses"
rows = requests.get(url, headers=HEADERS).json()

print("Device       Network   Status")
for row in rows:
    flag = "" if row["status"] == "online" else "  &lt;-- CHECK"
    print(f"{row['name']:12} {row['networkId']:8} {row['status']}{flag}")</pre>
<pre class="out">Device       Network   Status
MX-MUM       mum       online
AP-DEL       del       <span class="hl">offline</span>  &lt;-- CHECK</pre>
<p>The f-string <code>f"{row['name']:12}"</code> pads the name to 12 characters so the columns line up.</p>

<h3>Check the status code before using the data</h3>
<p>Never call <code>.json()</code> and assume success. Test the code first, so an error message does not get read as data:</p>
<pre class="code">r = requests.get(url, headers=HEADERS)
if r.status_code != 200:
    print("Request failed:", r.status_code, r.text)
    raise SystemExit(1)
data = r.json()</pre>

<div class="eg"><p><b>Worked example.</b> The morning check: the script prints devices with status other than online. It prints one line, AP-DEL offline. The engineer opens the Overview and sees PoE is off on the AP-DEL switch port, enables it, runs the script again and sees no lines. The whole check took seconds and could be run by anyone on the team.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Nothing: every call in this chapter is a GET. The only effect is a few requests to the dashboard. That makes reports ideal first automation.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>headers=HEADERS</code> (you get 401); building a path with a missing slash; calling <code>.json()</code> on an error page; looping with one request per device when one status call would do; printing the whole key while debugging.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>response.json()</code> returns Python data, not text. A JSON list becomes a Python list and an object becomes a dictionary, so you index with <code>["name"]</code>, not with a dot.</p></div>

<div class="scn"><h4>Inventory in a minute</h4><p>A manager asked for a list of every device and its state for the Monday meeting. The engineer wrote twelve lines of Python: one call for networks, one for statuses, a loop to print. The result was pasted into the meeting notes. A week later someone asked the same question about a new site; the script was run again, unchanged.</p><p><b>Lesson:</b> a small read-only script saves hours and has no risk.</p></div>

<div class="iv"><p class="q">"Write or describe a script that lists all devices in all networks of an organization."</p><p>Strong answer: GET organizations to get the id, GET its networks, loop over networks and GET each network's devices (or use one statuses call), check the status code, and print a report. Note that headers carry the Bearer key and that GET is read-only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests.get(url, headers=...) returns a Response with status_code and json().</li>
<li>Ids from one answer feed the next path: org id, network id, devices.</li>
<li>Loop over the JSON list and print a clean report with an f-string.</li>
<li>Check status_code before using the data.</li>
<li>GET is read-only, the safest way to start automating.</li>
</ul></div>
`,hi:`
<h3>Plan</h3>
<p>Is chapter mein aap poora organization code se padhoge. Networks list karoge, un par loop chalaoge, har network ke devices list karoge aur saaf report print karoge. Padhna API ka sabse safe use hai kyunki <b>GET kuch nahi badalta</b>. Yeh lab <b>mk-api-1: organization padho</b> se match karta hai.</p>

<h3>Chaar lines mein requests library</h3>
<p><code>requests</code> ek Python library hai jo HTTP requests bhejti hai. <code>requests.get(url, headers=...)</code> GET bhejta hai aur ek <b>Response</b> object lautata hai. Abhi us par teen cheezein matter karti hain: <code>response.status_code</code> (200 jaisa number), <code>response.json()</code> (body jo Python lists aur dictionaries mein badal gayi) aur <code>response.text</code> (raw text, jab kuch galat ho to kaam aata hai).</p>
<pre class="code">import requests

BASE = "h&#116;tps://203.0.113.80/api/v1"
with open("key.txt") as f:
    HEADERS = {"Authorization": "Bearer " + f.read().strip()}

r = requests.get(BASE + "/organizations", headers=HEADERS)
print(r.status_code)
orgs = r.json()
org_id = orgs[0]["id"]
print("Organization:", orgs[0]["name"], org_id)</pre>
<pre class="out">200
Organization: Bharat Retail Co 1001</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Organization se networks se devices tak loop">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">GET /organizations</text>
<rect x="190" y="20" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="290" y="50" text-anchor="middle" class="svg-ink" font-size="12">GET /organizations/1001/networks</text>
<rect x="420" y="20" width="210" height="50" rx="8" fill="#fde68a"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="12">har network: /networks/id/devices</text>
<line x1="160" y1="45" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="390" y1="45" x2="420" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="95" width="620" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Har jawab ki id agle path mein jaati hai</text><text x="320" y="139" text-anchor="middle" class="svg-muted" font-size="12">org id, phir network id, phir devices</text>
<rect x="10" y="165" width="620" height="50" rx="8" fill="#fed7aa"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Output: har device ki ek printed report line</text>
</svg><p class="cap">Har jawab agli call ke liye id deta hai.</p></div>

<h3>Networks aur devices: loop</h3>
<pre class="code">nets = requests.get(
    BASE + "/organizations/" + org_id + "/networks",
    headers=HEADERS,
).json()

for net in nets:
    print(net["id"], net["name"])</pre>
<pre class="out">mum Mumbai HQ
blr Bengaluru Branch
del Delhi Branch</pre>
<p>Loop ek baar mein ek network dictionary uthata hai. Ab loop ke andar network id use karke doosri request jodo:</p>
<pre class="code">for net in nets:
    url = BASE + "/networks/" + net["id"] + "/devices"
    devices = requests.get(url, headers=HEADERS).json()
    print(net["name"], "-", len(devices), "devices")
    for d in devices:
        print("   ", d["name"], d["type"])</pre>
<pre class="out">Mumbai HQ - 4 devices
    MX-MUM MX
    SW-MUM MS
    AP-MUM MR
    SRV-MUM server
Bengaluru Branch - 4 devices
    MX-BLR MX
    SW-BLR MS
    AP-BLR MR
    SRV-BLR server</pre>
<p>(In lab examples ke field names humare apne hain; field name par bharosa karne se pehle lab mein <code>print(r.json())</code> se asli responses padho.)</p>

<h3>Status report</h3>
<p>Organization status call ko formatted print ke saath jodo. Path <code>/organizations/{orgId}/devices/statuses</code> har device ki state ek call mein deta hai, jo har device ke liye ek call se behtar hai.</p>
<pre class="code">url = BASE + "/organizations/" + org_id + "/devices/statuses"
rows = requests.get(url, headers=HEADERS).json()

print("Device       Network   Status")
for row in rows:
    flag = "" if row["status"] == "online" else "  &lt;-- CHECK"
    print(f"{row['name']:12} {row['networkId']:8} {row['status']}{flag}")</pre>
<pre class="out">Device       Network   Status
MX-MUM       mum       online
AP-DEL       del       <span class="hl">offline</span>  &lt;-- CHECK</pre>
<p>f-string <code>f"{row['name']:12}"</code> naam ko 12 characters tak pad karti hai taaki columns seedhe rahein.</p>

<h3>Data use karne se pehle status code check karo</h3>
<p><code>.json()</code> call karke kabhi success maan mat lo. Pehle code test karo, taaki error message data ki tarah na padha jaye:</p>
<pre class="code">r = requests.get(url, headers=HEADERS)
if r.status_code != 200:
    print("Request failed:", r.status_code, r.text)
    raise SystemExit(1)
data = r.json()</pre>

<div class="eg"><p><b>Worked example.</b> Subah ka check: script un devices ko print karti hai jinka status online nahi hai. Woh ek line print karti hai, AP-DEL offline. Engineer Overview kholta hai aur dekhta hai ki AP-DEL switch port par PoE off hai, use enable karta hai, script dobara chalata hai aur koi line nahi dikhti. Poora check seconds mein hua aur team ka koi bhi chala sakta hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Kuch nahi: is chapter ki har call GET hai. Sirf dashboard ko kuch requests jaati hain. Isliye reports pehli automation ke liye ideal hain.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> <code>headers=HEADERS</code> bhool jaana (401 milta hai); path mein slash chhoot jaana; error page par <code>.json()</code> call karna; jab ek status call kaafi ho tab har device ke liye ek request karna; debugging mein poori key print karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>response.json()</code> Python data lautata hai, text nahi. JSON list Python list ban jaati hai aur object dictionary, isliye aap <code>["name"]</code> se index karte ho, dot se nahi.</p></div>

<div class="scn"><h4>Ek minute mein inventory</h4><p>Manager ne Monday meeting ke liye har device aur uski state ki list maangi. Engineer ne barah lines ki Python likhi: networks ke liye ek call, statuses ke liye ek, print karne ke liye loop. Result meeting notes mein paste hua. Ek hafte baad kisi ne naye site ke baare mein wahi sawal poocha; script bina badle dobara chali.</p><p><b>Seekh:</b> chhoti read-only script ghanton bachati hai aur koi risk nahi.</p></div>

<div class="iv"><p class="q">"Aisi script likho ya batao jo organization ke saare networks ke saare devices list kare."</p><p>Strong answer: id ke liye GET organizations, uske networks GET, networks par loop aur har network ke devices GET (ya ek statuses call), status code check, aur report print. Batao ki headers Bearer key le jaate hain aur GET read-only hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests.get(url, headers=...) status_code aur json() wala Response deta hai.</li>
<li>Ek jawab ki ids agle path ko feed karti hain: org id, network id, devices.</li>
<li>JSON list par loop chalao aur f-string se saaf report print karo.</li>
<li>Data use karne se pehle status_code check karo.</li>
<li>GET read-only hai, automation shuru karne ka sabse safe tareeka.</li>
</ul></div>
`}};export{e as default};