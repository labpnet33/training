var e={id:`platform-apis`,h:{en:`Platform: Intent API, response codes, payloads and events`,hi:`Platform: Intent API, response codes, payloads aur events`},body:{en:`
<p>A restaurant has a dining room for guests and a <b>service window</b> for delivery riders. The riders never walk into the kitchen; they hand over an order slip in a fixed format and get back a packed bag and a receipt. The <b>Intent API</b> is Catalyst Center's service window: scripts, ITSM tools and other platforms send a request in a fixed format and get back JSON plus a status code.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Intent API call flow">
<rect x="10" y="20" width="150" height="160" rx="10" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Script / ITSM</text>
<rect x="480" y="20" width="150" height="160" rx="10" fill="#bbf7d0"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="160" y1="70" x2="480" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="63" text-anchor="middle" class="svg-ink" font-size="12">1. POST auth/token (Basic)</text>
<line x1="480" y1="92" x2="160" y2="92" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">200 + Token</text>
<line x1="160" y1="135" x2="480" y2="135" stroke="#64748b" stroke-width="2"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="12">2. GET / POST with X-Auth-Token</text>
<line x1="480" y1="157" x2="160" y2="157" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="173" text-anchor="middle" class="svg-accent" font-size="12">200 JSON, or 202 + taskId</text>
</svg><p class="cap">Two steps every time: authenticate once, then carry the token on every request.</p></div>

<h3>The Intent API in five facts</h3>
<ul><li>It is a <b>REST</b> API over HTTPS on the controller's normal address, with <b>JSON</b> bodies. Paths look like <code>/dna/intent/api/v1/network-device</code> (the "dna" survives from the DNA Center name).</li>
<li>It is <b>stateless</b>: first you get a token, then every request carries it in the <code>X-Auth-Token</code> header.</li>
<li><b>Methods</b>: <code>GET</code> reads, <code>POST</code> creates or starts an action, <code>PUT</code> updates or replaces, <code>DELETE</code> removes.</li>
<li>Long jobs are <b>asynchronous</b>: the POST returns <b>202 Accepted</b> with a <code>taskId</code> (or an execution ID), and you poll the task until it finishes.</li>
<li>Access follows <b>role-based access control</b>: an observer account can read but a write call returns 403.</li></ul>

<h3>Step 1: get a token</h3>
<pre class="code"><span class="c">! Basic authentication with the controller username and password (base64 of user:password)</span>
POST catc.campus.example/dna/system/api/v1/auth/token
Authorization: Basic bmV0YWRtaW46TktAZG1pbjE=
Content-Type: application/json</pre>
<pre class="out"><span class="hl">200 OK</span>
{
  "Token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOi..."
}</pre>
<p>The token is valid for about an hour. When it expires the next call gets <b>401 Unauthorized</b>, and the script simply asks for a new one.</p>

<h3>Step 2: read data</h3>
<pre class="code">GET catc.campus.example/dna/intent/api/v1/network-device?family=Switches%20and%20Hubs
X-Auth-Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
Accept: application/json</pre>
<pre class="out">200 OK
{
  "response": [
    {
      "hostname": "ASW1",
      "managementIpAddress": "10.99.0.11",
      "platformId": "C9200-24P",
      "role": "ACCESS",
      <span class="hl">"reachabilityStatus": "Reachable",</span>
      "collectionStatus": "Managed",
      "id": "4c3f2a1e-...-9b7d"
    }
  ],
  "version": "1.0"
}</pre>
<p>How to read a payload: the useful data is inside the <code>response</code> key, which is a <b>list</b> (square brackets) of <b>objects</b> (curly braces). Each object has key-value pairs; strings are quoted, numbers and <code>true</code>/<code>false</code> are not. Every device has an <code>id</code> (a UUID) that other calls use, for example to fetch its health or its config.</p>

<h3>Step 3: start an action and poll it</h3>
<pre class="code"><span class="c">! Ask the controller for a Path Trace (flow analysis) of PC2 to SRV on TCP 80</span>
POST catc.campus.example/dna/intent/api/v1/flow-analysis
{"sourceIP": "10.20.20.22", "destIP": "172.16.50.10", "destPort": "80", "protocol": "TCP",
 "inclusions": ["ACL-TRACE", "INTERFACE-STATS"]}</pre>
<pre class="out"><span class="hl">202 Accepted</span>
{
  "response": {
    "flowAnalysisId": "6f1c0a52-...-e21d",
    "taskId": "a3b2c1d0-...-77aa",
    "url": "/api/v1/flow-analysis/6f1c0a52-...-e21d"
  },
  "version": "1.0"
}</pre>
<p>202 means "accepted, not finished". You then <code>GET /dna/intent/api/v1/flow-analysis/6f1c0a52-...</code> (or the task at <code>/dna/intent/api/v1/task/a3b2c1d0-...</code>) until the status says COMPLETED or FAILED. Template deployment, discovery, image distribution and Command Runner all work the same way.</p>

<h3>Response codes you must recognise</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Typical cause</th></tr>
<tr><td><b>200</b> OK</td><td>Success, body contains data</td><td>A GET that worked</td></tr>
<tr><td><b>201</b> Created</td><td>A new resource was created</td><td>RESTCONF POST of a new loopback</td></tr>
<tr><td><b>202</b> Accepted</td><td>Request queued, check the task later</td><td>Catalyst Center deploy, discovery, path trace</td></tr>
<tr><td><b>204</b> No Content</td><td>Success, nothing to return</td><td>RESTCONF PUT/PATCH/DELETE that worked</td></tr>
<tr><td><b>400</b> Bad Request</td><td>The request itself is wrong</td><td>Malformed JSON, missing required field</td></tr>
<tr><td><b>401</b> Unauthorized</td><td>Not authenticated</td><td>Missing or expired token, wrong password</td></tr>
<tr><td><b>403</b> Forbidden</td><td>Authenticated but not allowed</td><td>Read-only role trying to write</td></tr>
<tr><td><b>404</b> Not Found</td><td>No resource at that path</td><td>Typo in URI, wrong device ID</td></tr>
<tr><td><b>409</b> Conflict</td><td>Clashes with current state</td><td>RESTCONF POST of something that already exists</td></tr>
<tr><td><b>500</b> / <b>503</b></td><td>Server-side error / unavailable</td><td>Controller bug, service restarting</td></tr></table>
<p>Memory hook: <b>2xx</b> you did well, <b>4xx</b> you did something wrong, <b>5xx</b> the server did something wrong.</p>

<h3>RESTCONF at an intro level</h3>
<p>Objective 6.5 also asks you to read RESTCONF results. RESTCONF talks directly to a device (not the controller), using YANG paths under <code>/restconf/data/</code> and the media type <code>application/yang-data+json</code>:</p>
<pre class="code">GET r1.campus.example/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F0
Accept: application/yang-data+json</pre>
<pre class="out">200 OK
{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/0",
    "description": "to-DSW1",
    <span class="hl">"enabled": true</span>
  }
}</pre>
<p>A PATCH changing the description returns <b>204</b>; a POST creating Loopback100 returns <b>201</b>, and the same POST again returns <b>409</b>. The YANG, NETCONF and RESTCONF module covers this in depth. For comparison, <b>SD-WAN Manager</b>'s REST API lives under <code>/dataservice/</code> and uses a session cookie plus an XSRF token instead of <code>X-Auth-Token</code>.</p>

<h3>Events, webhooks and integrations</h3>
<p>Instead of polling, you can <b>subscribe</b> to events (device unreachable, new P1 issue, SWIM failure, compliance change) and have Catalyst Center push a notification to a <b>REST webhook</b>, email, syslog or SNMP trap receiver. ITSM integration can open and update incidents automatically. The <b>Developer Toolkit</b> in the GUI documents every API and lets you try it.</p>

<div class="eg"><p><b>Worked example: the lab API explorer.</b> The lab controller has a read-only explorer with shorter paths:</p>
<pre class="code">CTRL&gt; center api get /api/v1/network-health</pre>
<pre class="out">GET /api/v1/network-health  -&gt;  200 OK
{
  "response": [
    {
      "time": "19:47:45",
      <span class="hl">"healthScore": 100,</span>
      "totalCount": 4,
      "goodCount": 4,
      "badCount": 0
    }
  ],
  "devices": [ { "name": "DSW1", "overallHealth": 8, "category": "Good" }, ... ]
}</pre>
<p>Reading it: status 200, four monitored devices, all Good, so healthScore is 4/4 = 100. Try <code>/api/v1</code> to list resources, then <code>/api/v1/issues</code> and <code>/api/v1/compliance</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sending the token as <code>Authorization: Bearer</code> instead of <code>X-Auth-Token</code>. Treating 202 as "done". Forgetting that 401 is authentication and 403 is authorisation. Not URL-encoding a slash in an interface name for RESTCONF (<code>GigabitEthernet0%2F0</code>).</p></div>
<div class="exam"><p><b>Exam traps.</b> 201 = created; 204 = success with no body; 202 = accepted for async processing. 400 is your request's fault, 404 wrong resource, 409 conflict with existing data. Catalyst Center token call: POST to <code>/dna/system/api/v1/auth/token</code>, then header <code>X-Auth-Token</code>.</p></div>

<div class="scn"><h4>The script that broke every hour</h4><p>A NOC script pulled issues from Catalyst Center every five minutes and posted P1s to the team chat. It worked for about an hour, then only logged errors. The log showed <code>401 Unauthorized</code>: the script fetched the token once at start-up and the token expired. The fix was to catch 401, request a new token and retry once. A second bug appeared later: a new read-only service account got <code>403</code> on a template call it should never have made.</p><p><b>Lesson:</b> handle 401 by re-authenticating; treat 403 as a permissions design question, not a bug to retry.</p></div>

<div class="iv"><p class="q">"Walk me through calling the Catalyst Center API to list devices."</p><p>POST to the auth token endpoint with Basic authentication, read the Token from the JSON, then GET <code>/dna/intent/api/v1/network-device</code> with the token in <code>X-Auth-Token</code>. Expect 200 and a <code>response</code> list of device objects (hostname, managementIpAddress, reachabilityStatus, id). Mention 401 on expiry, that actions like deploy return 202 with a taskId to poll, and that everything is also documented in the Developer Toolkit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent API: REST + JSON, token from <code>/dna/system/api/v1/auth/token</code>, sent in <code>X-Auth-Token</code>.</li>
<li>Data sits in the <code>response</code> list; each device has an <code>id</code> used by other calls.</li>
<li>Long actions return 202 with a taskId to poll.</li>
<li>Know 200, 201, 202, 204, 400, 401, 403, 404, 409, 500.</li>
<li>Events and webhooks push notifications instead of polling; RESTCONF talks to devices directly.</li>
</ul></div>
`,hi:`
<p>Restaurant mein guests ke liye dining room hota hai aur delivery riders ke liye ek <b>service window</b>. Riders kabhi kitchen mein nahi jaate; woh fixed format mein order slip dete hain aur packed bag aur receipt wapas paate hain. <b>Intent API</b> Catalyst Center ki service window hai: scripts, ITSM tools aur dusre platforms fixed format mein request bhejte hain aur JSON plus ek status code wapas paate hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Intent API call flow">
<rect x="10" y="20" width="150" height="160" rx="10" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Script / ITSM</text>
<rect x="480" y="20" width="150" height="160" rx="10" fill="#bbf7d0"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="160" y1="70" x2="480" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="63" text-anchor="middle" class="svg-ink" font-size="12">1. POST auth/token (Basic)</text>
<line x1="480" y1="92" x2="160" y2="92" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">200 + Token</text>
<line x1="160" y1="135" x2="480" y2="135" stroke="#64748b" stroke-width="2"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="12">2. X-Auth-Token ke saath GET / POST</text>
<line x1="480" y1="157" x2="160" y2="157" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="173" text-anchor="middle" class="svg-accent" font-size="12">200 JSON, ya 202 + taskId</text>
</svg><p class="cap">Har baar do steps: ek baar authenticate karo, phir har request par token le jao.</p></div>

<h3>Intent API paanch facts mein</h3>
<ul><li>Yeh controller ke normal address par HTTPS ke upar <b>REST</b> API hai, <b>JSON</b> bodies ke saath. Paths aise dikhte hain <code>/dna/intent/api/v1/network-device</code> (DNA Center naam se "dna" bacha hua hai).</li>
<li>Yeh <b>stateless</b> hai: pehle aap token lete ho, phir har request use <code>X-Auth-Token</code> header mein le jaati hai.</li>
<li><b>Methods</b>: <code>GET</code> padhta hai, <code>POST</code> banata hai ya action shuru karta hai, <code>PUT</code> update ya replace karta hai, <code>DELETE</code> hatata hai.</li>
<li>Lambe jobs <b>asynchronous</b> hain: POST <code>taskId</code> (ya execution ID) ke saath <b>202 Accepted</b> deta hai, aur aap task ko khatam hone tak poll karte ho.</li>
<li>Access <b>role-based access control</b> follow karta hai: observer account padh sakta hai lekin write call par 403 milta hai.</li></ul>

<h3>Step 1: token lo</h3>
<pre class="code"><span class="c">! Controller username aur password se Basic authentication (user:password ka base64)</span>
POST catc.campus.example/dna/system/api/v1/auth/token
Authorization: Basic bmV0YWRtaW46TktAZG1pbjE=
Content-Type: application/json</pre>
<pre class="out"><span class="hl">200 OK</span>
{
  "Token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOi..."
}</pre>
<p>Token lagbhag ek ghante valid rehta hai. Expire hone par agli call ko <b>401 Unauthorized</b> milta hai, aur script bas naya token maang leti hai.</p>

<h3>Step 2: data padho</h3>
<pre class="code">GET catc.campus.example/dna/intent/api/v1/network-device?family=Switches%20and%20Hubs
X-Auth-Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
Accept: application/json</pre>
<pre class="out">200 OK
{
  "response": [
    {
      "hostname": "ASW1",
      "managementIpAddress": "10.99.0.11",
      "platformId": "C9200-24P",
      "role": "ACCESS",
      <span class="hl">"reachabilityStatus": "Reachable",</span>
      "collectionStatus": "Managed",
      "id": "4c3f2a1e-...-9b7d"
    }
  ],
  "version": "1.0"
}</pre>
<p>Payload kaise padhein: kaam ka data <code>response</code> key ke andar hai, jo <b>objects</b> (curly braces) ki ek <b>list</b> (square brackets) hai. Har object mein key-value pairs hain; strings quotes mein hoti hain, numbers aur <code>true</code>/<code>false</code> nahi. Har device ka ek <code>id</code> (UUID) hota hai jo dusri calls use karti hain, jaise uski health ya config laane ke liye.</p>

<h3>Step 3: action shuru karo aur poll karo</h3>
<pre class="code"><span class="c">! Controller se PC2 se SRV tak TCP 80 ka Path Trace (flow analysis) maango</span>
POST catc.campus.example/dna/intent/api/v1/flow-analysis
{"sourceIP": "10.20.20.22", "destIP": "172.16.50.10", "destPort": "80", "protocol": "TCP",
 "inclusions": ["ACL-TRACE", "INTERFACE-STATS"]}</pre>
<pre class="out"><span class="hl">202 Accepted</span>
{
  "response": {
    "flowAnalysisId": "6f1c0a52-...-e21d",
    "taskId": "a3b2c1d0-...-77aa",
    "url": "/api/v1/flow-analysis/6f1c0a52-...-e21d"
  },
  "version": "1.0"
}</pre>
<p>202 ka matlab "accept ho gaya, khatam nahi hua". Phir aap <code>GET /dna/intent/api/v1/flow-analysis/6f1c0a52-...</code> (ya <code>/dna/intent/api/v1/task/a3b2c1d0-...</code> par task) karte ho jab tak status COMPLETED ya FAILED na bole. Template deployment, discovery, image distribution aur Command Runner sab isi tarah kaam karte hain.</p>

<h3>Response codes jo pehchaanne chahiye</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Typical cause</th></tr>
<tr><td><b>200</b> OK</td><td>Success, body mein data</td><td>Ek GET jo chal gaya</td></tr>
<tr><td><b>201</b> Created</td><td>Naya resource bana</td><td>Naye loopback ka RESTCONF POST</td></tr>
<tr><td><b>202</b> Accepted</td><td>Request queue mein, task baad mein check karo</td><td>Catalyst Center deploy, discovery, path trace</td></tr>
<tr><td><b>204</b> No Content</td><td>Success, lautane ko kuch nahi</td><td>RESTCONF PUT/PATCH/DELETE jo chal gaya</td></tr>
<tr><td><b>400</b> Bad Request</td><td>Request hi galat hai</td><td>Malformed JSON, required field missing</td></tr>
<tr><td><b>401</b> Unauthorized</td><td>Authenticated nahi</td><td>Token missing ya expired, galat password</td></tr>
<tr><td><b>403</b> Forbidden</td><td>Authenticated par allowed nahi</td><td>Read-only role write karne ki koshish kar raha</td></tr>
<tr><td><b>404</b> Not Found</td><td>Us path par koi resource nahi</td><td>URI mein typo, galat device ID</td></tr>
<tr><td><b>409</b> Conflict</td><td>Current state se takraav</td><td>Pehle se maujood cheez ka RESTCONF POST</td></tr>
<tr><td><b>500</b> / <b>503</b></td><td>Server-side error / unavailable</td><td>Controller bug, service restart ho rahi</td></tr></table>
<p>Yaad rakhne ka hook: <b>2xx</b> aapne accha kiya, <b>4xx</b> aapne kuch galat kiya, <b>5xx</b> server ne kuch galat kiya.</p>

<h3>RESTCONF intro level par</h3>
<p>Objective 6.5 RESTCONF results padhna bhi poochta hai. RESTCONF seedha device se baat karta hai (controller se nahi), <code>/restconf/data/</code> ke neeche YANG paths aur media type <code>application/yang-data+json</code> use karke:</p>
<pre class="code">GET r1.campus.example/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F0
Accept: application/yang-data+json</pre>
<pre class="out">200 OK
{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/0",
    "description": "to-DSW1",
    <span class="hl">"enabled": true</span>
  }
}</pre>
<p>Description badalne wala PATCH <b>204</b> deta hai; Loopback100 banane wala POST <b>201</b> deta hai, aur wahi POST dobara <b>409</b> deta hai. YANG, NETCONF aur RESTCONF module ise gehraai se cover karta hai. Comparison ke liye, <b>SD-WAN Manager</b> ka REST API <code>/dataservice/</code> ke neeche hai aur <code>X-Auth-Token</code> ki jagah session cookie plus XSRF token use karta hai.</p>

<h3>Events, webhooks aur integrations</h3>
<p>Polling ki jagah aap events ko <b>subscribe</b> kar sakte ho (device unreachable, naya P1 issue, SWIM failure, compliance change) aur Catalyst Center notification ko <b>REST webhook</b>, email, syslog ya SNMP trap receiver par push karta hai. ITSM integration incidents automatically khol aur update kar sakta hai. GUI ka <b>Developer Toolkit</b> har API document karta hai aur try karne deta hai.</p>

<div class="eg"><p><b>Worked example: lab API explorer.</b> Lab controller mein chhote paths wala read-only explorer hai:</p>
<pre class="code">CTRL&gt; center api get /api/v1/network-health</pre>
<pre class="out">GET /api/v1/network-health  -&gt;  200 OK
{
  "response": [
    {
      "time": "19:47:45",
      <span class="hl">"healthScore": 100,</span>
      "totalCount": 4,
      "goodCount": 4,
      "badCount": 0
    }
  ],
  "devices": [ { "name": "DSW1", "overallHealth": 8, "category": "Good" }, ... ]
}</pre>
<p>Padhna: status 200, chaar monitored devices, sab Good, isliye healthScore 4/4 = 100. Resources list karne ke liye <code>/api/v1</code> try karo, phir <code>/api/v1/issues</code> aur <code>/api/v1/compliance</code>.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Token ko <code>X-Auth-Token</code> ki jagah <code>Authorization: Bearer</code> mein bhejna. 202 ko "ho gaya" samajhna. Bhool jaana ki 401 authentication hai aur 403 authorisation. RESTCONF ke liye interface name ke slash ko URL-encode na karna (<code>GigabitEthernet0%2F0</code>).</p></div>
<div class="exam"><p><b>Exam traps.</b> 201 = created; 204 = bina body ke success; 202 = async processing ke liye accepted. 400 aapki request ki galti, 404 galat resource, 409 existing data se conflict. Catalyst Center token call: <code>/dna/system/api/v1/auth/token</code> par POST, phir header <code>X-Auth-Token</code>.</p></div>

<div class="scn"><h4>Woh script jo har ghante toot jaati thi</h4><p>Ek NOC script har paanch minute Catalyst Center se issues kheench kar P1s team chat mein post karti thi. Lagbhag ek ghanta chali, phir sirf errors log karne lagi. Log mein <code>401 Unauthorized</code> tha: script start-up par ek baar token leti thi aur token expire ho gaya. Fix tha 401 pakadna, naya token maangna aur ek baar retry karna. Baad mein doosra bug aaya: ek naye read-only service account ko ek template call par <code>403</code> mila jo use kabhi karni hi nahi chahiye thi.</p><p><b>Lesson:</b> 401 ko re-authenticate karke handle karo; 403 ko permissions design ka sawaal maano, retry karne wala bug nahi.</p></div>

<div class="iv"><p class="q">"Catalyst Center API call karke devices list karna samjhao."</p><p>Basic authentication ke saath auth token endpoint par POST karo, JSON se Token padho, phir token ko <code>X-Auth-Token</code> mein rakh kar <code>/dna/intent/api/v1/network-device</code> par GET karo. 200 aur device objects ki <code>response</code> list expect karo (hostname, managementIpAddress, reachabilityStatus, id). Expiry par 401 batao, ki deploy jaise actions 202 ke saath poll karne ke liye taskId dete hain, aur yeh sab Developer Toolkit mein documented hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent API: REST + JSON, token <code>/dna/system/api/v1/auth/token</code> se, <code>X-Auth-Token</code> mein bheja jaata hai.</li>
<li>Data <code>response</code> list mein hota hai; har device ka <code>id</code> dusri calls use karti hain.</li>
<li>Lambe actions 202 ke saath poll karne ke liye taskId dete hain.</li>
<li>200, 201, 202, 204, 400, 401, 403, 404, 409, 500 jaano.</li>
<li>Events aur webhooks polling ki jagah notifications push karte hain; RESTCONF seedha devices se baat karta hai.</li>
</ul></div>
`}};export{e as default};