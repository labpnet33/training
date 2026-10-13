var e={id:`status-codes-payloads`,h:{en:`Status codes and reading JSON payloads`,hi:`Status codes aur JSON payloads padhna`},body:{en:`
<p>A courier always brings back a slip: "delivered", "left at reception", "nobody home", "wrong address", "refused by customer". You do not need to open the parcel to know what happened; the slip tells you. Every REST reply starts with such a slip, the <b>status code</b>, and then may carry a parcel, the <b>payload</b>. Blueprint item 6.5 asks you to interpret both, using RESTCONF and Catalyst Center as examples.</p>

<h3>The five families</h3>
<table class="cmp"><tr><th>Range</th><th>Meaning</th><th>Who must act</th></tr>
<tr><td>1xx</td><td>Informational</td><td>Rarely seen in APIs</td></tr>
<tr><td><b>2xx</b></td><td>Success</td><td>Nobody; read the body if any</td></tr>
<tr><td>3xx</td><td>Redirection</td><td>Client follows the new location</td></tr>
<tr><td><b>4xx</b></td><td>Client error</td><td>You: fix the request, credentials or data</td></tr>
<tr><td><b>5xx</b></td><td>Server error</td><td>The device or controller; retry or escalate</td></tr></table>

<h3>The codes you must know cold</h3>
<table class="cmp"><tr><th>Code</th><th>Name</th><th>Typical cause in RESTCONF / controller APIs</th></tr>
<tr><td><b>200</b></td><td>OK</td><td>GET succeeded; data is in the body</td></tr>
<tr><td><b>201</b></td><td>Created</td><td>POST (or PUT) created a new resource; a Location header points to it</td></tr>
<tr><td>202</td><td>Accepted</td><td>Request queued for asynchronous work (Catalyst Center returns a task ID)</td></tr>
<tr><td><b>204</b></td><td>No Content</td><td>PATCH, PUT on existing data, or DELETE succeeded; no body</td></tr>
<tr><td><b>400</b></td><td>Bad Request</td><td>Body or URI does not match the model: unknown element, wrong type, missing key, bad JSON</td></tr>
<tr><td><b>401</b></td><td>Unauthorized</td><td>No credentials, wrong credentials, wrong authentication method, expired token</td></tr>
<tr><td><b>403</b></td><td>Forbidden</td><td>Authenticated, but not allowed: privilege below 15, role lacks permission</td></tr>
<tr><td><b>404</b></td><td>Not Found</td><td>Wrong path or module name, list entry does not exist, RESTCONF not enabled</td></tr>
<tr><td>405</td><td>Method Not Allowed</td><td>Verb not valid for that resource (e.g. writing state data)</td></tr>
<tr><td>406 / 415</td><td>Not Acceptable / Unsupported Media Type</td><td>Wrong Accept / Content-Type header</td></tr>
<tr><td><b>409</b></td><td>Conflict</td><td>POST of data that already exists (error-tag data-exists), or a lock is held</td></tr>
<tr><td>500 / 503</td><td>Internal Error / Service Unavailable</td><td>Server fault, or the API processes are still starting</td></tr></table>
<div class="tip"><p><b>Memory hook.</b> 401 = "who are you?" (identity). 403 = "I know you, but no" (permission). 404 = "there is nothing here". 409 = "it is already there". 400 = "I cannot understand what you sent".</p></div>

<h3>RESTCONF error payloads</h3>
<p>When RESTCONF fails it still returns a structured body, <code>ietf-restconf:errors</code>, so a script can react to the <b>error-tag</b> instead of parsing prose:</p>
<pre class="out">HTTP/1.1 400 Bad Request
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
<span class="hl">        "error-tag": "unknown-element",</span>
<span class="hl">        "error-message": "unknown element \\"vlan_id\\" in nk-native:vlan-list (valid: id, name)"</span>
      }
    ]
  }
}</pre>
<p>Common error-tags and their usual HTTP code: <code>malformed-message</code> 400 (JSON syntax), <code>unknown-element</code> 400, <code>invalid-value</code> 400, <code>missing-element</code> 400, <code>access-denied</code> 401 or 403, <code>data-missing</code> 404, <code>data-exists</code> 409, <code>in-use</code> or <code>lock-denied</code> 409, <code>operation-not-supported</code> 405 or 501.</p>

<h3>Reading a JSON payload</h3>
<p>From the previous module: JSON has <b>objects</b> <code>{ }</code> of key/value pairs, <b>arrays</b> <code>[ ]</code> of values, and values that are strings (quoted), numbers, <code>true</code>/<code>false</code> or <code>null</code>. To read a payload, walk it from the outside in and write down the path. Here is a Catalyst Center answer to GET <code>/dna/intent/api/v1/network-device</code>:</p>
<pre class="out">{
  "response": [
    {
      "hostname": "EDGE-SW1.corp.example",
      "managementIpAddress": "10.10.20.51",
      "platformId": "C9300-48P",
      "softwareVersion": "17.9.4",
<span class="hl">      "reachabilityStatus": "Reachable",</span>
      "upTime": "41 days, 3:12:08.52",
      "id": "5f3c8b1e-2a7d-4c33-9a9e-0c2b1d7e4a11"
    },
    {
      "hostname": "EDGE-SW2.corp.example",
      "managementIpAddress": "10.10.20.52",
      "platformId": "C9300-48P",
      "softwareVersion": "17.6.5",
<span class="hl">      "reachabilityStatus": "Unreachable",</span>
      "upTime": null,
      "id": "8a91d2c4-6b0e-4f7a-8d21-3e5f9c0b7d62"
    }
  ],
  "version": "1.0"
}</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="JSON path walk">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="12">object</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="11">top level</text>
<rect x="180" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="245" y="92" text-anchor="middle" class="svg-ink" font-size="12">"response"</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="11">array</text>
<rect x="350" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="92" text-anchor="middle" class="svg-ink" font-size="12">[1]</text><text x="405" y="110" text-anchor="middle" class="svg-muted" font-size="11">second item</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="12">"hostname"</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">string</text>
<line x1="140" y1="95" x2="180" y2="95" stroke="#64748b"/><line x1="310" y1="95" x2="350" y2="95" stroke="#64748b"/><line x1="460" y1="95" x2="500" y2="95" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">data["response"][1]["hostname"] = "EDGE-SW2.corp.example"</text>
</svg><p class="cap">Walk a payload from the outside in: object, key, array index, key.</p></div>
<p>Reading it: the top level is an object with two keys, <code>response</code> (an array of devices) and <code>version</code>. There are two devices. The second is unreachable, runs an older release, and its <code>upTime</code> is <code>null</code> (no value). In Python:</p>
<pre class="code">data = r.json()                          <span class="c"># r is the response object from requests</span>
for dev in data["response"]:
    if dev["reachabilityStatus"] != "Reachable":
        print(dev["hostname"], dev["managementIpAddress"])
<span class="c"># prints: EDGE-SW2.corp.example 10.10.20.52</span></pre>

<div class="eg"><p><b>Worked example.</b> Interpret four replies. (1) <code>201 Created</code> after POST to <code>.../native/vlan</code>: the VLAN now exists; no body is needed. (2) <code>204 No Content</code> after PATCH: success; an empty body is normal, do not treat it as an error. (3) GET for <code>.../interface=Loopback200</code>, which does not exist: <code>404 Not Found</code> with error-tag <code>data-missing</code>, not an empty 200; a successful GET always carries data. (4) <code>202 Accepted</code> from Catalyst Center with <code>{"response": {"taskId": "7c1e...", "url": "/api/v1/task/7c1e..."}, "version": "1.0"}</code>: the job is queued; poll the task URL until it reports completion.</p></div>

<div class="warn"><p><b>Common mistake.</b> Checking only for 200. A script that treats every non-200 as failure will flag successful 201 and 204 replies. Test for the 2xx range, then read the body only when one is expected.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 versus 403 is the most tested pair. Wrong password or missing token is 401; valid login with insufficient rights is 403. Also, 204 has no body by definition, and 201 is the normal answer to a successful POST.</p></div>

<div class="scn"><h4>The 403 that looked like a password problem</h4><p>A new automation account kept getting 403 from every RESTCONF call, and the team reset its password three times. The engineer pointed out that a wrong password produces 401, so the credentials were fine. <code>show running-config | include username</code> showed the account had no privilege keyword, so it was level 1. Recreating it with <code>privilege 15</code> fixed it instantly.</p><p><b>Lesson:</b> the status code tells you which layer failed; read it before you change anything.</p></div>

<div class="iv"><p class="q">"Your RESTCONF POST returns 409. What does it mean and what do you do?"</p><p>Strong answer: 409 Conflict with error-tag data-exists means the resource you tried to create already exists, because POST only creates. Either the change was already done (idempotency problem in the script) or you meant to update: use PATCH to merge or PUT to replace on the resource URI. Mention checking with GET first and that 409 can also mean a lock is held.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2xx success, 4xx fix your request, 5xx server side.</li>
<li>200 OK (GET), 201 Created (POST), 202 Accepted (async), 204 No Content (PATCH/PUT/DELETE).</li>
<li>400 bad data, 401 who are you, 403 not allowed, 404 not there, 409 already there.</li>
<li>RESTCONF errors carry <code>ietf-restconf:errors</code> with error-type, error-tag and error-message.</li>
<li>Read JSON outside in: object, key, array index, key; Catalyst Center wraps data in <code>response</code>.</li>
</ul></div>
`,hi:`
<p>Courier hamesha ek slip wapas laata hai: "delivered", "reception par chhoda", "ghar par koi nahi", "galat address", "customer ne mana kiya". Kya hua yeh jaanne ke liye parcel kholne ki zaroorat nahi; slip bata deti hai. Har REST reply aisi hi slip se shuru hota hai, <b>status code</b>, aur phir ek parcel le ja sakta hai, <b>payload</b>. Blueprint item 6.5 aapse dono samajhne ko kehta hai, RESTCONF aur Catalyst Center ko examples ki tarah use karke.</p>

<h3>Paanch families</h3>
<table class="cmp"><tr><th>Range</th><th>Matlab</th><th>Kise action lena hai</th></tr>
<tr><td>1xx</td><td>Informational</td><td>APIs mein kam hi dikhta hai</td></tr>
<tr><td><b>2xx</b></td><td>Success</td><td>Kisi ko nahi; body ho to padho</td></tr>
<tr><td>3xx</td><td>Redirection</td><td>Client nayi location follow kare</td></tr>
<tr><td><b>4xx</b></td><td>Client error</td><td>Aap: request, credentials ya data theek karo</td></tr>
<tr><td><b>5xx</b></td><td>Server error</td><td>Device ya controller; retry ya escalate karo</td></tr></table>

<h3>Codes jo aapko zubaani yaad hone chahiye</h3>
<table class="cmp"><tr><th>Code</th><th>Naam</th><th>RESTCONF / controller APIs mein typical wajah</th></tr>
<tr><td><b>200</b></td><td>OK</td><td>GET successful; data body mein hai</td></tr>
<tr><td><b>201</b></td><td>Created</td><td>POST (ya PUT) ne naya resource banaya; Location header uski taraf point karta hai</td></tr>
<tr><td>202</td><td>Accepted</td><td>Request asynchronous kaam ke liye queue hui (Catalyst Center task ID deta hai)</td></tr>
<tr><td><b>204</b></td><td>No Content</td><td>PATCH, existing data par PUT, ya DELETE successful; body nahi</td></tr>
<tr><td><b>400</b></td><td>Bad Request</td><td>Body ya URI model se match nahi karti: unknown element, galat type, missing key, kharab JSON</td></tr>
<tr><td><b>401</b></td><td>Unauthorized</td><td>Credentials nahi, galat credentials, galat authentication method, expired token</td></tr>
<tr><td><b>403</b></td><td>Forbidden</td><td>Authenticated, par allowed nahi: privilege 15 se kam, role mein permission nahi</td></tr>
<tr><td><b>404</b></td><td>Not Found</td><td>Galat path ya module naam, list entry exist nahi karti, RESTCONF enabled nahi</td></tr>
<tr><td>405</td><td>Method Not Allowed</td><td>Us resource ke liye verb valid nahi (jaise state data likhna)</td></tr>
<tr><td>406 / 415</td><td>Not Acceptable / Unsupported Media Type</td><td>Galat Accept / Content-Type header</td></tr>
<tr><td><b>409</b></td><td>Conflict</td><td>Jo data pehle se hai uska POST (error-tag data-exists), ya lock pakda hua hai</td></tr>
<tr><td>500 / 503</td><td>Internal Error / Service Unavailable</td><td>Server fault, ya API processes abhi start ho rahe hain</td></tr></table>
<div class="tip"><p><b>Yaad rakhne ka tarika.</b> 401 = "aap kaun ho?" (identity). 403 = "main aapko jaanta hoon, par nahi" (permission). 404 = "yahan kuch nahi hai". 409 = "yeh pehle se hai". 400 = "aapne jo bheja woh samajh nahi aaya".</p></div>

<h3>RESTCONF error payloads</h3>
<p>Fail hone par bhi RESTCONF ek structured body, <code>ietf-restconf:errors</code>, lautata hai, taaki script prose parse karne ki jagah <b>error-tag</b> par react kar sake:</p>
<pre class="out">HTTP/1.1 400 Bad Request
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
<span class="hl">        "error-tag": "unknown-element",</span>
<span class="hl">        "error-message": "unknown element \\"vlan_id\\" in nk-native:vlan-list (valid: id, name)"</span>
      }
    ]
  }
}</pre>
<p>Common error-tags aur unka usual HTTP code: <code>malformed-message</code> 400 (JSON syntax), <code>unknown-element</code> 400, <code>invalid-value</code> 400, <code>missing-element</code> 400, <code>access-denied</code> 401 ya 403, <code>data-missing</code> 404, <code>data-exists</code> 409, <code>in-use</code> ya <code>lock-denied</code> 409, <code>operation-not-supported</code> 405 ya 501.</p>

<h3>JSON payload padhna</h3>
<p>Pichle module se: JSON mein key/value pairs ke <b>objects</b> <code>{ }</code> hote hain, values ke <b>arrays</b> <code>[ ]</code>, aur values jo strings (quoted), numbers, <code>true</code>/<code>false</code> ya <code>null</code> hoti hain. Payload padhne ke liye use bahar se andar ki taraf chalo aur path likhte jao. Yeh Catalyst Center ka <code>/dna/intent/api/v1/network-device</code> par GET ka jawab hai:</p>
<pre class="out">{
  "response": [
    {
      "hostname": "EDGE-SW1.corp.example",
      "managementIpAddress": "10.10.20.51",
      "platformId": "C9300-48P",
      "softwareVersion": "17.9.4",
<span class="hl">      "reachabilityStatus": "Reachable",</span>
      "upTime": "41 days, 3:12:08.52",
      "id": "5f3c8b1e-2a7d-4c33-9a9e-0c2b1d7e4a11"
    },
    {
      "hostname": "EDGE-SW2.corp.example",
      "managementIpAddress": "10.10.20.52",
      "platformId": "C9300-48P",
      "softwareVersion": "17.6.5",
<span class="hl">      "reachabilityStatus": "Unreachable",</span>
      "upTime": null,
      "id": "8a91d2c4-6b0e-4f7a-8d21-3e5f9c0b7d62"
    }
  ],
  "version": "1.0"
}</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="JSON path walk">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="12">object</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="11">top level</text>
<rect x="180" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="245" y="92" text-anchor="middle" class="svg-ink" font-size="12">"response"</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="11">array</text>
<rect x="350" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="92" text-anchor="middle" class="svg-ink" font-size="12">[1]</text><text x="405" y="110" text-anchor="middle" class="svg-muted" font-size="11">doosra item</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="12">"hostname"</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">string</text>
<line x1="140" y1="95" x2="180" y2="95" stroke="#64748b"/><line x1="310" y1="95" x2="350" y2="95" stroke="#64748b"/><line x1="460" y1="95" x2="500" y2="95" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">data["response"][1]["hostname"] = "EDGE-SW2.corp.example"</text>
</svg><p class="cap">Payload ko bahar se andar chalo: object, key, array index, key.</p></div>
<p>Ise padhna: top level ek object hai jiski do keys hain, <code>response</code> (devices ka array) aur <code>version</code>. Do devices hain. Doosra unreachable hai, purani release chala raha hai, aur uska <code>upTime</code> <code>null</code> hai (koi value nahi). Python mein:</p>
<pre class="code">data = r.json()                          <span class="c"># r requests ka response object hai</span>
for dev in data["response"]:
    if dev["reachabilityStatus"] != "Reachable":
        print(dev["hostname"], dev["managementIpAddress"])
<span class="c"># print karta hai: EDGE-SW2.corp.example 10.10.20.52</span></pre>

<div class="eg"><p><b>Worked example.</b> Chaar replies samjho. (1) <code>.../native/vlan</code> par POST ke baad <code>201 Created</code>: VLAN ab exist karta hai; body ki zaroorat nahi. (2) PATCH ke baad <code>204 No Content</code>: success; khaali body normal hai, ise error mat samjho. (3) Missing entry par <code>200</code> nahi aata, balki error-tag <code>data-missing</code> ke saath <code>404</code> aata hai, isliye 200 hamesha data ke saath aata hai. (4) Catalyst Center se <code>{"response": {"taskId": "7c1e...", "url": "/api/v1/task/7c1e..."}, "version": "1.0"}</code> ke saath <code>202 Accepted</code>: job queue mein hai; task URL ko tab tak poll karo jab tak woh completion report na kare.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf 200 check karna. Jo script har non-200 ko failure maanti hai woh successful 201 aur 204 replies ko flag karegi. 2xx range test karo, phir body sirf tab padho jab expected ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 vs 403 sabse zyada test hone wali jodi hai. Galat password ya missing token 401 hai; valid login par kam rights 403 hai. Aur 204 mein definition se body nahi hoti, aur successful POST ka normal jawab 201 hai.</p></div>

<div class="scn"><h4>403 jo password problem lag raha tha</h4><p>Ek naye automation account ko har RESTCONF call se 403 mil raha tha, aur team ne teen baar uska password reset kiya. Engineer ne bataya ki galat password 401 deta hai, isliye credentials theek the. <code>show running-config | include username</code> ne dikhaya ki account mein privilege keyword nahi tha, isliye woh level 1 par tha. Use <code>privilege 15</code> ke saath dobara banane se turant theek ho gaya.</p><p><b>Seekh:</b> status code batata hai kaunsi layer fail hui; kuch badalne se pehle use padho.</p></div>

<div class="iv"><p class="q">"Aapka RESTCONF POST 409 deta hai. Iska matlab kya hai aur aap kya karoge?"</p><p>Strong answer: error-tag data-exists ke saath 409 Conflict ka matlab hai jo resource aap banana chahte the woh pehle se exist karta hai, kyunki POST sirf banata hai. Ya to change pehle hi ho chuka tha (script mein idempotency problem) ya aap update karna chahte the: resource URI par merge ke liye PATCH ya replace ke liye PUT use karo. Pehle GET se check karna batao aur yeh ki 409 ka matlab lock pakda hona bhi ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2xx success, 4xx apni request theek karo, 5xx server side.</li>
<li>200 OK (GET), 201 Created (POST), 202 Accepted (async), 204 No Content (PATCH/PUT/DELETE).</li>
<li>400 kharab data, 401 aap kaun ho, 403 allowed nahi, 404 wahan nahi hai, 409 pehle se hai.</li>
<li>RESTCONF errors mein error-type, error-tag aur error-message ke saath <code>ietf-restconf:errors</code> hota hai.</li>
<li>JSON bahar se andar padho: object, key, array index, key; Catalyst Center data ko <code>response</code> mein lapeta hai.</li>
</ul></div>
`}};export{e as default};