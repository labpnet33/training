var e={id:`controller-apis`,h:{en:`Controller APIs: Catalyst Center and SD-WAN Manager`,hi:`Controller APIs: Catalyst Center aur SD-WAN Manager`},body:{en:`
<p>Talking to each router with NETCONF or RESTCONF is like phoning every shop in a mall to ask about stock. A <b>controller</b> is the mall's information desk: it already knows every shop, their inventory and their problems, and it answers one question about all of them. Blueprint item 6.4 asks you to describe the APIs of two Cisco controllers: <b>Catalyst Center</b> (formerly DNA Center) for the campus, and <b>Catalyst SD-WAN Manager</b> (formerly vManage) for the WAN. Both are REST APIs over HTTPS with JSON; they differ in how you log in and how answers are wrapped.</p>

<h3>The four directions of a controller API</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Controller API directions">
<rect x="230" y="105" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">Catalyst Center / SD-WAN Mgr</text>
<rect x="230" y="15" width="180" height="45" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">Northbound REST API</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="11">your scripts, apps</text>
<rect x="230" y="210" width="180" height="45" rx="8" fill="#fde68a"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">Southbound</text><text x="320" y="246" text-anchor="middle" class="svg-muted" font-size="11">NETCONF, CLI, SNMP to devices</text>
<rect x="20" y="110" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="132" text-anchor="middle" class="svg-ink" font-size="12">Westbound</text><text x="100" y="148" text-anchor="middle" class="svg-muted" font-size="11">ITSM, IPAM integration</text>
<rect x="460" y="110" width="160" height="50" rx="8" fill="#fed7aa"/><text x="540" y="132" text-anchor="middle" class="svg-ink" font-size="12">Eastbound</text><text x="540" y="148" text-anchor="middle" class="svg-muted" font-size="11">events, webhooks</text>
<line x1="320" y1="60" x2="320" y2="105" stroke="#64748b"/><line x1="320" y1="165" x2="320" y2="210" stroke="#64748b"/><line x1="180" y1="135" x2="230" y2="135" stroke="#64748b"/><line x1="410" y1="135" x2="460" y2="135" stroke="#64748b"/>
</svg><p class="cap">Northbound faces your code; southbound faces the devices; east and west integrate other systems.</p></div>
<p>Catalyst Center names its API families: the <b>Intent API</b> (northbound REST, what you script against), <b>Integration API</b> (westbound, for ITSM tools such as ServiceNow and IPAM), the <b>Multivendor SDK</b> (southbound, device packages for other vendors), and <b>Events and Notifications</b> (eastbound: webhooks, email, syslog when an assurance issue fires). The Intent API is called "intent" because you say <i>what</i> you want (a site, a device in a site) and the controller works out the device commands.</p>

<h3>Catalyst Center: authenticate, then use the token</h3>
<pre class="code"><span class="c"># 1. Get a token: POST with HTTP Basic authentication</span>
POST /dna/system/api/v1/auth/token
Authorization: Basic ZGV2bmV0dXNlcjpDaXNjbzEyMyE=
<span class="c"># reply 200: {"Token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."}</span>

<span class="c"># 2. Every later call carries the token in a header</span>
GET /dna/intent/api/v1/network-device
X-Auth-Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json</pre>
<p>The token is a JSON Web Token valid for about one hour; after that calls return <b>401</b> and you request a new one. Useful Intent API resources:</p>
<table class="cmp"><tr><th>Path</th><th>Returns</th></tr>
<tr><td><code>/dna/intent/api/v1/network-device</code></td><td>Inventory: hostname, management IP, platform, software version, reachability</td></tr>
<tr><td><code>/dna/intent/api/v1/site</code></td><td>Site hierarchy: areas, buildings, floors</td></tr>
<tr><td><code>/dna/intent/api/v1/site-health</code>, <code>/client-health</code>, <code>/network-health</code></td><td>Assurance health scores</td></tr>
<tr><td><code>/dna/intent/api/v1/topology/physical-topology</code></td><td>Nodes and links for a topology map</td></tr>
<tr><td><code>/dna/intent/api/v1/network-device-poller/cli/read-request</code></td><td>Command Runner: run read-only show commands (asynchronous)</td></tr>
<tr><td><code>/dna/intent/api/v1/task/{taskId}</code></td><td>Status of an asynchronous job</td></tr></table>
<p>Answers are wrapped in an object with a <code>response</code> key (an array or object) and a <code>version</code>, as you read in chapter 8. Long jobs (Command Runner, provisioning, templates) answer <b>202 Accepted</b> with a <code>taskId</code>; you poll <code>/dna/intent/api/v1/task/{taskId}</code> until <code>endTime</code> is set and <code>isError</code> is false, then fetch the result (Command Runner gives a <code>fileId</code> to download from <code>/dna/intent/api/v1/file/{fileId}</code>).</p>

<h3>SD-WAN Manager: session cookie plus XSRF token</h3>
<pre class="code"><span class="c"># 1. Log in with a form post (not Basic auth, not JSON)</span>
POST /j_security_check
Content-Type: application/x-www-form-urlencoded
j_username=netops&amp;j_password=S3cure!Pass
<span class="c"># success: 200 and a session cookie JSESSIONID=...</span>

<span class="c"># 2. Fetch the cross-site request forgery token (needed for POST/PUT/DELETE)</span>
GET /dataservice/client/token          <span class="c"># reply body: a plain-text token string</span>

<span class="c"># 3. Call the API with the cookie, plus X-XSRF-TOKEN on changes</span>
GET /dataservice/device
Cookie: JSESSIONID=...
X-XSRF-TOKEN: 3B9F0D...</pre>
<p>Everything lives under <b>/dataservice</b>. Typical resources: <code>/dataservice/device</code> (all fabric devices), <code>/dataservice/device/control/connections?deviceId=...</code> (control connections), <code>/dataservice/device/bfd/sessions?deviceId=...</code> (BFD sessions), <code>/dataservice/alarms</code>, <code>/dataservice/template/device</code> (device templates) and <code>/dataservice/statistics/interface</code>. Replies wrap the records in a <code>data</code> array next to a <code>header</code> object that describes the columns:</p>
<pre class="out">{
  "header": { "generatedOn": 1790000000000, "title": "Device" },
  "data": [
    { "host-name": "BR1-EDGE1", "system-ip": "10.255.0.11", "site-id": "100",
      "personality": "vedge", "device-model": "vedge-C8000V",
<span class="hl">      "reachability": "reachable",</span> "version": "17.9.4" },
    { "host-name": "BR2-EDGE1", "system-ip": "10.255.0.21", "site-id": "200",
      "personality": "vedge", "device-model": "vedge-C8000V",
<span class="hl">      "reachability": "unreachable",</span> "version": "17.9.4" }
  ]
}</pre>
<p>End the session with GET <code>/logout</code>. Cisco also publishes Python SDKs for both controllers (for example <code>dnacentersdk</code> and <code>catalystwan</code>) that handle authentication and paging for you.</p>

<table class="cmp"><tr><th></th><th>Catalyst Center</th><th>SD-WAN Manager</th></tr>
<tr><td>Login</td><td>POST <code>/dna/system/api/v1/auth/token</code>, Basic auth</td><td>POST <code>/j_security_check</code>, form fields</td></tr>
<tr><td>Carries identity</td><td><code>X-Auth-Token</code> header</td><td><code>JSESSIONID</code> cookie (+ <code>X-XSRF-TOKEN</code> for changes)</td></tr>
<tr><td>API prefix</td><td><code>/dna/intent/api/v1/</code></td><td><code>/dataservice/</code></td></tr>
<tr><td>Data wrapper</td><td><code>response</code></td><td><code>data</code> (with <code>header</code>)</td></tr>
<tr><td>Long jobs</td><td>202 + taskId, poll task</td><td>action ID, poll <code>/dataservice/device/action/status/{id}</code></td></tr></table>

<div class="eg"><p><b>Worked example.</b> From the SD-WAN reply above, list unreachable edges: loop over <code>data</code>, keep entries where <code>reachability</code> is not "reachable", print <code>host-name</code> and <code>system-ip</code>: <code>BR2-EDGE1 10.255.0.21</code>. The same logic on Catalyst Center loops over <code>response</code> and tests <code>reachabilityStatus</code>. Different wrappers and key names, same method.</p></div>

<div class="warn"><p><b>Common mistake.</b> On SD-WAN Manager a wrong password to <code>/j_security_check</code> often returns <b>200 with an HTML login page</b> instead of 401. Scripts must check that no HTML came back (or that a JSESSIONID cookie was set) before continuing. Another trap: POST calls without <code>X-XSRF-TOKEN</code> are rejected with 403.</p></div>
<div class="exam"><p><b>Exam trap.</b> Catalyst Center token: <code>X-Auth-Token</code> header, obtained from <code>/dna/system/api/v1/auth/token</code>. SD-WAN Manager: <code>j_security_check</code> and <code>/dataservice</code>. The northbound API faces applications; southbound faces devices. Old names (DNA Center, vManage) still appear in questions.</p></div>

<div class="scn"><h4>The dashboard that went blank every hour</h4><p>A NOC dashboard pulled device health from Catalyst Center every five minutes. Every hour it went blank for one cycle. Logs showed <code>401 Unauthorized</code> exactly 60 minutes after each token request. The script requested the token only at start-up. The fix: on a 401, request a new token once and retry the call.</p><p><b>Lesson:</b> controller tokens expire; handle 401 by re-authenticating, not by alarming.</p></div>

<div class="iv"><p class="q">"How do you authenticate to the Catalyst Center and SD-WAN Manager APIs?"</p><p>Strong answer: Catalyst Center: POST to /dna/system/api/v1/auth/token with Basic authentication, read the Token from the JSON reply, and send it as X-Auth-Token on every Intent API call; it expires after about an hour. SD-WAN Manager: POST form fields j_username and j_password to /j_security_check to get a JSESSIONID cookie, then GET /dataservice/client/token and send it as X-XSRF-TOKEN on changes. Mention async tasks (202 and taskId) on Catalyst Center.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controllers expose northbound REST APIs; they talk southbound to devices with NETCONF, CLI or SNMP.</li>
<li>Catalyst Center: token from <code>/dna/system/api/v1/auth/token</code>, header <code>X-Auth-Token</code>, paths under <code>/dna/intent/api/v1/</code>, data in <code>response</code>.</li>
<li>SD-WAN Manager: <code>/j_security_check</code> cookie, <code>X-XSRF-TOKEN</code> for changes, paths under <code>/dataservice/</code>, data in <code>data</code>.</li>
<li>Asynchronous jobs return 202 and a task ID to poll.</li>
<li>Expired tokens give 401; missing XSRF tokens give 403.</li>
</ul></div>
`,hi:`
<p>Har router se NETCONF ya RESTCONF se baat karna aisa hai jaise mall ki har dukaan ko phone karke stock poochhna. <b>Controller</b> mall ka information desk hai: use har dukaan, unka inventory aur unki problems pehle se pata hain, aur woh sab ke baare mein ek sawaal ka jawab deta hai. Blueprint item 6.4 aapse do Cisco controllers ke APIs describe karwata hai: campus ke liye <b>Catalyst Center</b> (pehle DNA Center), aur WAN ke liye <b>Catalyst SD-WAN Manager</b> (pehle vManage). Dono HTTPS par JSON ke saath REST APIs hain; fark yeh hai ki login kaise hota hai aur jawab kaise lipta hota hai.</p>

<h3>Controller API ki chaar dishayen</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Controller API directions">
<rect x="230" y="105" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">Catalyst Center / SD-WAN Mgr</text>
<rect x="230" y="15" width="180" height="45" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">Northbound REST API</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="11">aapki scripts, apps</text>
<rect x="230" y="210" width="180" height="45" rx="8" fill="#fde68a"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">Southbound</text><text x="320" y="246" text-anchor="middle" class="svg-muted" font-size="11">devices ko NETCONF, CLI, SNMP</text>
<rect x="20" y="110" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="132" text-anchor="middle" class="svg-ink" font-size="12">Westbound</text><text x="100" y="148" text-anchor="middle" class="svg-muted" font-size="11">ITSM, IPAM integration</text>
<rect x="460" y="110" width="160" height="50" rx="8" fill="#fed7aa"/><text x="540" y="132" text-anchor="middle" class="svg-ink" font-size="12">Eastbound</text><text x="540" y="148" text-anchor="middle" class="svg-muted" font-size="11">events, webhooks</text>
<line x1="320" y1="60" x2="320" y2="105" stroke="#64748b"/><line x1="320" y1="165" x2="320" y2="210" stroke="#64748b"/><line x1="180" y1="135" x2="230" y2="135" stroke="#64748b"/><line x1="410" y1="135" x2="460" y2="135" stroke="#64748b"/>
</svg><p class="cap">Northbound aapke code ki taraf; southbound devices ki taraf; east aur west doosre systems integrate karte hain.</p></div>
<p>Catalyst Center apni API families ke naam rakhta hai: <b>Intent API</b> (northbound REST, jiske against aap script likhte ho), <b>Integration API</b> (westbound, ServiceNow jaise ITSM tools aur IPAM ke liye), <b>Multivendor SDK</b> (southbound, doosre vendors ke device packages), aur <b>Events and Notifications</b> (eastbound: assurance issue aane par webhooks, email, syslog). Intent API ko "intent" isliye kehte hain kyunki aap batate ho ki aapko <i>kya</i> chahiye (ek site, site mein ek device) aur controller device commands khud nikalta hai.</p>

<h3>Catalyst Center: authenticate karo, phir token use karo</h3>
<pre class="code"><span class="c"># 1. Token lo: HTTP Basic authentication ke saath POST</span>
POST /dna/system/api/v1/auth/token
Authorization: Basic ZGV2bmV0dXNlcjpDaXNjbzEyMyE=
<span class="c"># reply 200: {"Token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."}</span>

<span class="c"># 2. Baad ki har call token ko header mein le jaati hai</span>
GET /dna/intent/api/v1/network-device
X-Auth-Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json</pre>
<p>Token ek JSON Web Token hai jo lagbhag ek ghante valid rehta hai; uske baad calls <b>401</b> deti hain aur aap naya maangte ho. Kaam ke Intent API resources:</p>
<table class="cmp"><tr><th>Path</th><th>Kya deta hai</th></tr>
<tr><td><code>/dna/intent/api/v1/network-device</code></td><td>Inventory: hostname, management IP, platform, software version, reachability</td></tr>
<tr><td><code>/dna/intent/api/v1/site</code></td><td>Site hierarchy: areas, buildings, floors</td></tr>
<tr><td><code>/dna/intent/api/v1/site-health</code>, <code>/client-health</code>, <code>/network-health</code></td><td>Assurance health scores</td></tr>
<tr><td><code>/dna/intent/api/v1/topology/physical-topology</code></td><td>Topology map ke liye nodes aur links</td></tr>
<tr><td><code>/dna/intent/api/v1/network-device-poller/cli/read-request</code></td><td>Command Runner: read-only show commands chalao (asynchronous)</td></tr>
<tr><td><code>/dna/intent/api/v1/task/{taskId}</code></td><td>Asynchronous job ka status</td></tr></table>
<p>Jawab ek object mein lipte hote hain jisme <code>response</code> key (array ya object) aur <code>version</code> hota hai, jaisa aapne chapter 8 mein padha. Lambe jobs (Command Runner, provisioning, templates) <code>taskId</code> ke saath <b>202 Accepted</b> dete hain; aap <code>/dna/intent/api/v1/task/{taskId}</code> ko tab tak poll karte ho jab tak <code>endTime</code> set na ho aur <code>isError</code> false na ho, phir result laate ho (Command Runner ek <code>fileId</code> deta hai jise <code>/dna/intent/api/v1/file/{fileId}</code> se download karte hain).</p>

<h3>SD-WAN Manager: session cookie plus XSRF token</h3>
<pre class="code"><span class="c"># 1. Form post se login (Basic auth nahi, JSON nahi)</span>
POST /j_security_check
Content-Type: application/x-www-form-urlencoded
j_username=netops&amp;j_password=S3cure!Pass
<span class="c"># success: 200 aur ek session cookie JSESSIONID=...</span>

<span class="c"># 2. Cross-site request forgery token lo (POST/PUT/DELETE ke liye chahiye)</span>
GET /dataservice/client/token          <span class="c"># reply body: ek plain-text token string</span>

<span class="c"># 3. Cookie ke saath API call karo, changes par X-XSRF-TOKEN bhi</span>
GET /dataservice/device
Cookie: JSESSIONID=...
X-XSRF-TOKEN: 3B9F0D...</pre>
<p>Sab kuch <b>/dataservice</b> ke neeche hai. Typical resources: <code>/dataservice/device</code> (saare fabric devices), <code>/dataservice/device/control/connections?deviceId=...</code> (control connections), <code>/dataservice/device/bfd/sessions?deviceId=...</code> (BFD sessions), <code>/dataservice/alarms</code>, <code>/dataservice/template/device</code> (device templates) aur <code>/dataservice/statistics/interface</code>. Replies records ko ek <code>data</code> array mein lapette hain, jiske saath ek <code>header</code> object hota hai jo columns describe karta hai:</p>
<pre class="out">{
  "header": { "generatedOn": 1790000000000, "title": "Device" },
  "data": [
    { "host-name": "BR1-EDGE1", "system-ip": "10.255.0.11", "site-id": "100",
      "personality": "vedge", "device-model": "vedge-C8000V",
<span class="hl">      "reachability": "reachable",</span> "version": "17.9.4" },
    { "host-name": "BR2-EDGE1", "system-ip": "10.255.0.21", "site-id": "200",
      "personality": "vedge", "device-model": "vedge-C8000V",
<span class="hl">      "reachability": "unreachable",</span> "version": "17.9.4" }
  ]
}</pre>
<p>Session <code>/logout</code> par GET se khatam karo. Cisco dono controllers ke liye Python SDKs bhi publish karta hai (jaise <code>dnacentersdk</code> aur <code>catalystwan</code>) jo authentication aur paging aapke liye sambhalte hain.</p>

<table class="cmp"><tr><th></th><th>Catalyst Center</th><th>SD-WAN Manager</th></tr>
<tr><td>Login</td><td>POST <code>/dna/system/api/v1/auth/token</code>, Basic auth</td><td>POST <code>/j_security_check</code>, form fields</td></tr>
<tr><td>Identity kaise jaati hai</td><td><code>X-Auth-Token</code> header</td><td><code>JSESSIONID</code> cookie (+ changes ke liye <code>X-XSRF-TOKEN</code>)</td></tr>
<tr><td>API prefix</td><td><code>/dna/intent/api/v1/</code></td><td><code>/dataservice/</code></td></tr>
<tr><td>Data wrapper</td><td><code>response</code></td><td><code>data</code> (<code>header</code> ke saath)</td></tr>
<tr><td>Lambe jobs</td><td>202 + taskId, task poll karo</td><td>action ID, <code>/dataservice/device/action/status/{id}</code> poll karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Upar wale SD-WAN reply se unreachable edges list karo: <code>data</code> par loop karo, woh entries rakho jahan <code>reachability</code> "reachable" nahi hai, <code>host-name</code> aur <code>system-ip</code> print karo: <code>BR2-EDGE1 10.255.0.21</code>. Catalyst Center par yahi logic <code>response</code> par loop karta hai aur <code>reachabilityStatus</code> test karta hai. Alag wrappers aur key names, same tarika.</p></div>

<div class="warn"><p><b>Common galti.</b> SD-WAN Manager par <code>/j_security_check</code> ko galat password aksar 401 ki jagah <b>HTML login page ke saath 200</b> deta hai. Scripts ko aage badhne se pehle check karna chahiye ki HTML wapas nahi aaya (ya JSESSIONID cookie set hui). Ek aur trap: <code>X-XSRF-TOKEN</code> ke bina POST calls 403 ke saath reject hoti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Catalyst Center token: <code>X-Auth-Token</code> header, <code>/dna/system/api/v1/auth/token</code> se milta hai. SD-WAN Manager: <code>j_security_check</code> aur <code>/dataservice</code>. Northbound API applications ki taraf hai; southbound devices ki taraf. Purane naam (DNA Center, vManage) abhi bhi questions mein aate hain.</p></div>

<div class="scn"><h4>Dashboard jo har ghante blank ho jaata tha</h4><p>Ek NOC dashboard har paanch minute mein Catalyst Center se device health kheenchta tha. Har ghante woh ek cycle ke liye blank ho jaata. Logs ne har token request ke theek 60 minute baad <code>401 Unauthorized</code> dikhaya. Script sirf start-up par token maangti thi. Fix: 401 aane par ek baar naya token maango aur call retry karo.</p><p><b>Seekh:</b> controller tokens expire hote hain; 401 ko alarm se nahi, dobara authenticate karke handle karo.</p></div>

<div class="iv"><p class="q">"Catalyst Center aur SD-WAN Manager APIs mein authenticate kaise karte ho?"</p><p>Strong answer: Catalyst Center: /dna/system/api/v1/auth/token par Basic authentication ke saath POST, JSON reply se Token padho, aur har Intent API call par X-Auth-Token ki tarah bhejo; yeh lagbhag ek ghante mein expire hota hai. SD-WAN Manager: JSESSIONID cookie ke liye /j_security_check par j_username aur j_password form fields POST karo, phir /dataservice/client/token GET karo aur changes par X-XSRF-TOKEN ki tarah bhejo. Catalyst Center par async tasks (202 aur taskId) batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controllers northbound REST APIs expose karte hain; southbound devices se NETCONF, CLI ya SNMP se baat karte hain.</li>
<li>Catalyst Center: <code>/dna/system/api/v1/auth/token</code> se token, header <code>X-Auth-Token</code>, paths <code>/dna/intent/api/v1/</code> ke neeche, data <code>response</code> mein.</li>
<li>SD-WAN Manager: <code>/j_security_check</code> cookie, changes ke liye <code>X-XSRF-TOKEN</code>, paths <code>/dataservice/</code> ke neeche, data <code>data</code> mein.</li>
<li>Asynchronous jobs 202 aur poll karne ke liye task ID dete hain.</li>
<li>Expired tokens 401 dete hain; missing XSRF tokens 403.</li>
</ul></div>
`}};export{e as default};