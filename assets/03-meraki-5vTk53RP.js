var e={id:`meraki`,h:{en:`Meraki: the Dashboard API and webhooks`,hi:`Meraki: Dashboard API aur webhooks`},body:{en:`
<p>Meraki is the <b>cloud-managed</b> part of the Cisco portfolio. The switches, access points, security appliances and cameras are ordinary hardware in your branch, but their configuration lives in the Meraki cloud, in a web console called the <b>Dashboard</b>. Because everything is already in the cloud, the Dashboard also exposes one public REST API, and that API is the easiest of all the platforms to start with. Think of it as a remote control for a whole company's branches that you can press from a Python script.</p>

<h3>The object model: organization, network, device</h3>
<p>Meraki organises everything in three levels, and these names appear in almost every URL.</p>
<ul>
<li><b>Organization:</b> the customer or company account. It has an <code>id</code>. Licensing, admins and the API setting belong here.</li>
<li><b>Network:</b> a logical group of devices, usually one site, such as "Pune-Branch". A network holds settings such as SSIDs and VLANs. It has an id that starts with <code>N_</code> or <code>L_</code>.</li>
<li><b>Device:</b> one switch, access point or appliance. A device is identified by its <b>serial number</b>, for example <code>Q2XX-ABCD-1234</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Meraki object model">
<rect x="10" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="95" y="46" text-anchor="middle" class="svg-ink" font-size="13">Organization</text><text x="95" y="64" text-anchor="middle" class="svg-muted" font-size="12">/organizations/{orgId}</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">/networks/{networkId}</text>
<rect x="460" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="46" text-anchor="middle" class="svg-ink" font-size="13">Device</text><text x="545" y="64" text-anchor="middle" class="svg-muted" font-size="12">/devices/{serial}</text>
<line x1="180" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/><line x1="405" y1="50" x2="460" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">Header on every call: Authorization: Bearer YOUR_API_KEY</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">Same base URL for all customers; the key decides what you can see</text>
</svg><p class="cap">Organization contains networks, networks contain devices. IDs flow from one call into the next.</p></div>

<h3>Turning the API on and authenticating</h3>
<ol>
<li>An organization admin enables API access in the Dashboard (organization settings).</li>
<li>Each admin generates a personal <b>API key</b> from their profile. The key acts with that admin's permissions, so treat it like a password.</li>
<li>Send the key on every request in the header <code>Authorization: Bearer YOUR_API_KEY</code>. Older code uses the header <code>X-Cisco-Meraki-API-Key</code>, and you may still see it; Bearer is the current form.</li>
</ol>
<p>There is no login call and no token to refresh. The key is simply sent each time, which makes Meraki scripts very short. The base path is <code>/api/v1</code>, and all data is JSON.</p>

<h3>The first three calls</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
BASE = "h&#116;tps://api.meraki.example/api/v1"
H = {"Authorization": "Bearer YOUR_API_KEY", "Accept": "application/json"}

orgs = requests.get(BASE + "/organizations", headers=H).json()
org_id = orgs[0]["id"]                                  <span class="c"># step 1: which organization?</span>

nets = requests.get(BASE + "/organizations/" + org_id + "/networks", headers=H).json()
net_id = nets[0]["id"]                                  <span class="c"># step 2: which network?</span>

devs = requests.get(BASE + "/networks/" + net_id + "/devices", headers=H).json()
for d in devs:                                          <span class="c"># step 3: which devices?</span>
    print(d["serial"], d["model"], d.get("name"))</pre>
<pre class="out">Q2AB-CD12-EF34 MR46 Pune-AP-1
Q2GH-IJ56-KL78 MS225-24P Pune-SW-1
Q2MN-OP90-QR12 MX68 Pune-FW</pre>
<p>This <b>drill-down</b> is the heart of Meraki automation: the answer of one call (an id) goes into the URL of the next call.</p>

<h3>Changing something</h3>
<p>To rename a device you send a PUT with a small JSON body. A PUT to a Meraki object returns the updated object and status 200.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
body = {"name": "Pune-SW-1-core"}
r = requests.put(BASE + "/devices/Q2GH-IJ56-KL78", headers=H, json=body)
print(r.status_code)</pre>

<h3>Things that surprise beginners</h3>
<ul>
<li><b>Rate limit.</b> Each organization is limited to about 10 calls per second. Over that you get <b>429 Too Many Requests</b> and a <code>Retry-After</code> header. Wait that many seconds, then retry. The Python SDK does this for you.</li>
<li><b>Pagination.</b> Large lists come in pages. Use <code>perPage</code> and follow the <code>Link</code> response header for the next page.</li>
<li><b>Redirects.</b> The API may answer with a redirect to the shard that hosts your organization. Make sure your client follows it and keeps the Authorization header.</li>
<li><b>Organization-wide endpoints.</b> Prefer one call such as the organization's device list over hundreds of per-device calls.</li>
</ul>

<h3>Webhooks: Meraki calls you</h3>
<p>Polling the API every minute to see if a switch went down is wasteful. A <b>webhook</b> turns it around: you give Meraki the address of a small web service you run (the <b>receiver</b>), choose which alerts you care about (for example "a device went offline"), and optionally set a <b>shared secret</b>. When the event happens, the Dashboard sends an HTTP POST with a JSON body to your receiver. The body names the alert type, the network, the device and the time. Your receiver checks the shared secret, reads the JSON and does something useful, such as posting a message to a Webex space or opening a ticket.</p>
<p>Webhooks set up in the Dashboard (a webhook server plus alert settings) are the usual way; the same setup is also available through the API so that you can automate it for many networks.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting the API key in a public Git repository. Calling a per-network endpoint with an organization id (the ids are different things). Forgetting that the key inherits the admin's rights, so one admin's key can change settings across the whole organization.</p></div>
<div class="exam"><p><b>Exam trap.</b> Meraki identifies devices by <b>serial number</b>, not by a hostname or IP. The key travels in a header on every call; there is no separate token-fetch step.</p></div>

<div class="scn"><h4>The offline-switch alert</h4><p>A logistics company had 120 small branches on Meraki. The NOC found out about a dead switch only when a branch phoned. A junior engineer created a webhook receiver (a 30-line Flask app), registered it in the Dashboard for the "device went down" alert and added the shared secret. Now each event arrived as JSON within seconds, and the receiver posted "Pune-SW-1 is offline" into the NOC's Webex space. Mean time to notice dropped from about 40 minutes to under one.</p><p><b>Lesson:</b> use webhooks for events and the REST API for state and changes.</p></div>

<div class="iv"><p class="q">"How do you list all switches in all sites of a Meraki organization?"</p><p>GET organizations to find the org id, then use the organization-level device endpoint (or GET networks and then GET each network's devices), filter on the model or product type for switches, handle pagination through the Link header and respect the 10 calls per second rate limit. Mention that the API key goes in the Bearer header and that devices are keyed by serial number.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Meraki is cloud-managed; one Dashboard API covers organizations, networks and devices.</li>
<li>Authentication is an API key sent as a Bearer header on every call; no token refresh.</li>
<li>Drill down: organization id, then network id, then device serial.</li>
<li>Expect rate limits (429 with Retry-After), pagination and redirects.</li>
<li>Webhooks push alerts to your receiver as JSON, so you do not need to poll.</li>
</ul></div>
`,hi:`
<p>Meraki Cisco portfolio ka <b>cloud-managed</b> hissa hai. Switches, access points, security appliances aur cameras aapke branch mein ordinary hardware hain, par unki configuration Meraki cloud mein rehti hai, ek web console mein jise <b>Dashboard</b> kehte hain. Kyunki sab kuch pehle se cloud mein hai, Dashboard ek public REST API bhi deta hai, aur sabhi platforms mein yeh API shuru karne ke liye sabse aasan hai. Ise aise samjho jaise poori company ke branches ka remote control jo aap Python script se dabate ho.</p>

<h3>Object model: organization, network, device</h3>
<p>Meraki sab kuch teen levels mein organise karta hai, aur yeh naam lagbhag har URL mein dikhte hain.</p>
<ul>
<li><b>Organization:</b> customer ya company account. Iski ek <code>id</code> hoti hai. Licensing, admins aur API setting yahin ki hoti hai.</li>
<li><b>Network:</b> devices ka logical group, aam taur par ek site, jaise "Pune-Branch". Network mein SSIDs aur VLANs jaisi settings hoti hain. Iski id <code>N_</code> ya <code>L_</code> se shuru hoti hai.</li>
<li><b>Device:</b> ek switch, access point ya appliance. Device ki pehchaan uska <b>serial number</b> hai, jaise <code>Q2XX-ABCD-1234</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Meraki object model">
<rect x="10" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="95" y="46" text-anchor="middle" class="svg-ink" font-size="13">Organization</text><text x="95" y="64" text-anchor="middle" class="svg-muted" font-size="12">/organizations/{orgId}</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">/networks/{networkId}</text>
<rect x="460" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="46" text-anchor="middle" class="svg-ink" font-size="13">Device</text><text x="545" y="64" text-anchor="middle" class="svg-muted" font-size="12">/devices/{serial}</text>
<line x1="180" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/><line x1="405" y1="50" x2="460" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">Har call ke header mein: Authorization: Bearer YOUR_API_KEY</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">Sab customers ke liye same base URL; key tay karti hai aap kya dekh sakte ho</text>
</svg><p class="cap">Organization mein networks, networks mein devices. IDs ek call se agli call mein jaati hain.</p></div>

<h3>API on karna aur authenticate karna</h3>
<ol>
<li>Organization admin Dashboard mein API access enable karta hai (organization settings).</li>
<li>Har admin apni profile se personal <b>API key</b> banata hai. Key us admin ki permissions ke saath kaam karti hai, isliye ise password ki tarah treat karo.</li>
<li>Key har request mein header <code>Authorization: Bearer YOUR_API_KEY</code> mein bhejo. Purana code header <code>X-Cisco-Meraki-API-Key</code> use karta hai, aur woh ab bhi dikh sakta hai; Bearer current form hai.</li>
</ol>
<p>Koi login call nahi hai aur refresh karne ke liye koi token nahi. Key bas har baar bheji jaati hai, isliye Meraki scripts bahut chhoti hoti hain. Base path <code>/api/v1</code> hai, aur sab data JSON mein hai.</p>

<h3>Pehli teen calls</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
BASE = "h&#116;tps://api.meraki.example/api/v1"
H = {"Authorization": "Bearer YOUR_API_KEY", "Accept": "application/json"}

orgs = requests.get(BASE + "/organizations", headers=H).json()
org_id = orgs[0]["id"]                                  <span class="c"># step 1: kaunsi organization?</span>

nets = requests.get(BASE + "/organizations/" + org_id + "/networks", headers=H).json()
net_id = nets[0]["id"]                                  <span class="c"># step 2: kaunsa network?</span>

devs = requests.get(BASE + "/networks/" + net_id + "/devices", headers=H).json()
for d in devs:                                          <span class="c"># step 3: kaunse devices?</span>
    print(d["serial"], d["model"], d.get("name"))</pre>
<pre class="out">Q2AB-CD12-EF34 MR46 Pune-AP-1
Q2GH-IJ56-KL78 MS225-24P Pune-SW-1
Q2MN-OP90-QR12 MX68 Pune-FW</pre>
<p>Yeh <b>drill-down</b> Meraki automation ka dil hai: ek call ka jawab (ek id) agli call ke URL mein jaata hai.</p>

<h3>Kuch badalna</h3>
<p>Device ka naam badalne ke liye chhoti JSON body ke saath PUT bhejte hain. Meraki object par PUT updated object aur status 200 lautata hai.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
body = {"name": "Pune-SW-1-core"}
r = requests.put(BASE + "/devices/Q2GH-IJ56-KL78", headers=H, json=body)
print(r.status_code)</pre>

<h3>Beginners ko jo cheezein chaunkati hain</h3>
<ul>
<li><b>Rate limit.</b> Har organization ke liye lagbhag 10 calls per second ki limit hai. Usse zyada par <b>429 Too Many Requests</b> aur <code>Retry-After</code> header milta hai. Utne second ruko, phir retry karo. Python SDK yeh aapke liye karta hai.</li>
<li><b>Pagination.</b> Badi lists pages mein aati hain. <code>perPage</code> use karo aur agle page ke liye <code>Link</code> response header follow karo.</li>
<li><b>Redirects.</b> API aapki organization jis shard par hai us par redirect de sakti hai. Dhyaan rakho ki client redirect follow kare aur Authorization header bana rahe.</li>
<li><b>Organization-wide endpoints.</b> Saikdon per-device calls ki jagah organization ki device list jaisi ek call ko prefer karo.</li>
</ul>

<h3>Webhooks: Meraki aapko call karta hai</h3>
<p>Har minute API poll karke dekhna ki switch down hua ya nahi, wasteful hai. <b>Webhook</b> isse ulta kar deta hai: aap Meraki ko apni chalayi hui chhoti web service ka address dete ho (<b>receiver</b>), batate ho kaunse alerts chahiye (jaise "device went offline"), aur chaho to ek <b>shared secret</b> set karte ho. Event hone par Dashboard aapke receiver ko JSON body ke saath HTTP POST bhejta hai. Body mein alert type, network, device aur time hota hai. Aapka receiver shared secret check karta hai, JSON padhta hai aur kuch kaam ka karta hai, jaise Webex space mein message bhejna ya ticket kholna.</p>
<p>Dashboard mein set kiye gaye webhooks (webhook server plus alert settings) aam tareeka hai; wahi setup API se bhi ho sakta hai taaki bahut saare networks ke liye automate kar sako.</p>

<div class="warn"><p><b>Common mistakes.</b> API key ko public Git repository mein daal dena. Per-network endpoint ko organization id ke saath call karna (ids alag cheezein hain). Yeh bhool jana ki key admin ke rights inherit karti hai, isliye ek admin ki key poori organization ki settings badal sakti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Meraki devices ko <b>serial number</b> se pehchanta hai, hostname ya IP se nahi. Key har call ke header mein jaati hai; alag se token-fetch step nahi hota.</p></div>

<div class="scn"><h4>Offline-switch alert</h4><p>Ek logistics company ke 120 chhote branches Meraki par the. NOC ko dead switch ka pata tab chalta tha jab branch phone karta tha. Ek junior engineer ne webhook receiver banaya (30 line ki Flask app), Dashboard mein "device went down" alert ke liye register kiya aur shared secret jodha. Ab har event kuch second mein JSON ban kar aata tha, aur receiver NOC ke Webex space mein "Pune-SW-1 is offline" post karta tha. Pata chalne ka average time lagbhag 40 minute se ek minute se kam ho gaya.</p><p><b>Lesson:</b> events ke liye webhooks aur state aur changes ke liye REST API use karo.</p></div>

<div class="iv"><p class="q">"Ek Meraki organization ki saari sites ke saare switches ki list kaise nikaloge?"</p><p>Organizations par GET karke org id lo, phir organization-level device endpoint use karo (ya networks par GET karke har network ke devices par GET), switches ke liye model ya product type par filter karo, Link header se pagination handle karo aur 10 calls per second rate limit ka dhyaan rakho. Yeh bhi kaho ki API key Bearer header mein jaati hai aur devices serial number se key hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Meraki cloud-managed hai; ek Dashboard API organizations, networks aur devices ko cover karti hai.</li>
<li>Authentication har call par Bearer header mein API key hai; token refresh nahi.</li>
<li>Drill down: organization id, phir network id, phir device serial.</li>
<li>Rate limits (429 aur Retry-After), pagination aur redirects ke liye taiyaar raho.</li>
<li>Webhooks alerts ko JSON ke roop mein aapke receiver tak push karte hain, isliye poll nahi karna padta.</li>
</ul></div>
`}};export{e as default};