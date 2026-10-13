var e={id:`rest-controller-apis`,h:{en:`REST APIs with Python: Catalyst Center, SD-WAN Manager and status codes`,hi:`Python se REST APIs: Catalyst Center, SD-WAN Manager aur status codes`},body:{en:`
<p>At a water park you show your ticket once at the gate and get a <b>wristband</b>. For the rest of the day every ride checks the wristband, not the ticket, and in the evening it expires. Controller APIs work the same way: you log in once with a username and password, receive a <b>token</b> (or a session cookie), and send it with every request until it expires. Each answer comes back with a three-digit <b>status code</b> that tells you, before you read anything else, whether it worked.</p>

<h3>REST in one paragraph</h3>
<p>A REST API is used over HTTPS. Each request has a <b>method</b> (GET read, POST create, PUT replace, PATCH modify, DELETE remove), a <b>URL</b> made of the controller's base address plus a <b>path</b> such as <code>/dna/intent/api/v1/network-device</code>, <b>headers</b> (for example <code>Content-Type: application/json</code> and the token), and for POST, PUT or PATCH a JSON <b>body</b>. The server answers with a status code, headers and usually a JSON body. The CCNA automation module covered this in detail; here we drive it from Python with the <b>requests</b> library.</p>
<pre class="code">import os
import requests

base = os.environ["DNAC_BASE"]    <span class="c"># scheme + controller name, kept outside the script</span>
r = requests.get(base + "/dna/intent/api/v1/site", headers=hdrs, timeout=10)   <span class="c"># hdrs: see below</span>
print(r.status_code)              <span class="c"># 200</span>
data = r.json()                   <span class="c"># body decoded into dicts and lists</span>
r.raise_for_status()              <span class="c"># raise an exception on any 4xx or 5xx</span></pre>
<p>The script never contains the controller's address or password: the base address (scheme plus host name, for example the HTTPS address of <code>dnac.nwkings.example</code>) and credentials come from environment variables, so the same script runs against lab and production.</p>

<h3>Catalyst Center: token, then GET</h3>
<p>Catalyst Center (formerly DNA Center) exposes the <b>Intent API</b>, a northbound REST API. Authentication is two steps: POST to <code>/dna/system/api/v1/auth/token</code> with <b>HTTP Basic</b> authentication; the reply body is <code>{"Token": "..."}</code>. Then send that value in the <code>X-Auth-Token</code> header of every call. The token is valid for about an hour.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Catalyst Center token flow">
<rect x="20" y="10" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="33" text-anchor="middle" class="svg-ink" font-size="13">Python script</text>
<rect x="480" y="10" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="550" y="33" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="90" y1="46" x2="90" y2="220" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="550" y1="46" x2="550" y2="220" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="90" y1="72" x2="550" y2="72" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="12">POST /dna/system/api/v1/auth/token (Basic auth)</text>
<line x1="550" y1="106" x2="90" y2="106" stroke="#64748b" stroke-width="2"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">200 {"Token": "eyJ0eXAi..."}</text>
<line x1="90" y1="144" x2="550" y2="144" stroke="#64748b" stroke-width="2"/><text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">GET /dna/intent/api/v1/network-device + X-Auth-Token</text>
<line x1="550" y1="180" x2="90" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="12">200 {"response": [ ...devices... ], "version": "1.0"}</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">token expires after about 60 minutes: a 401 means log in again</text>
</svg><p class="cap">Log in once, reuse the token, handle the status code of every reply.</p></div>
<pre class="code">user, pw = os.environ["DNAC_USER"], os.environ["DNAC_PASS"]
r = requests.post(base + "/dna/system/api/v1/auth/token", auth=(user, pw), timeout=10)
if r.status_code != 200:
    raise SystemExit("login failed: {}".format(r.status_code))
hdrs = {"X-Auth-Token": r.json()["Token"], "Accept": "application/json"}

r = requests.get(base + "/dna/intent/api/v1/network-device", headers=hdrs, timeout=10)
if r.status_code == 200:
    for d in r.json()["response"]:
        print("{:&lt;10} {:&lt;12} {}".format(d["hostname"], d["managementIpAddress"],
                                      d["reachabilityStatus"]))
elif r.status_code == 401:
    print("token missing or expired: request a new one")
else:
    print("error", r.status_code, r.text)</pre>
<pre class="out">EDGE-R1    10.99.0.1    Reachable
ACC-SW1    10.99.0.11   Reachable
<span class="hl">ACC-SW2    10.99.0.12   Unreachable</span></pre>
<p>Notice that the list of devices is not the top level: it sits under the key <code>"response"</code>. Changes (POST, PUT, DELETE) are <b>asynchronous</b>: Catalyst Center answers <b>202 Accepted</b> with a body such as <code>{"response": {"taskId": "..."}}</code>, and you poll <code>/dna/intent/api/v1/task/</code> plus that taskId to learn whether it finished or failed.</p>

<h3>SD-WAN Manager: session cookie and XSRF token</h3>
<p>SD-WAN Manager (formerly vManage) uses a <b>session</b>. POST form fields <code>j_username</code> and <code>j_password</code> to <code>/j_security_check</code>; the server sets a <code>JSESSIONID</code> cookie. For any call that changes something (POST, PUT, DELETE) you also need a cross-site request forgery token: GET <code>/dataservice/client/token</code> and send its text in the <code>X-XSRF-TOKEN</code> header. Data lives under <code>/dataservice/</code>, and responses put the records in a <code>"data"</code> list. Newer releases also offer token-based (JWT) login, but the session method is what you will meet most.</p>
<pre class="code">s = requests.Session()                     <span class="c"># keeps the JSESSIONID cookie</span>
r = s.post(vbase + "/j_security_check",
           data={"j_username": vuser, "j_password": vpass}, timeout=10)
if r.status_code != 200 or "JSESSIONID" not in s.cookies:
    raise SystemExit("SD-WAN Manager login failed")
s.headers["X-XSRF-TOKEN"] = s.get(vbase + "/dataservice/client/token").text
for dev in s.get(vbase + "/dataservice/device").json()["data"]:
    print(dev["host-name"], dev["system-ip"], dev["reachability"])</pre>
<p>A failed login here does <b>not</b> return 401: the server usually answers 200 with an HTML login page and no session cookie, which is why the script checks the cookie as well as the code.</p>

<h3>Status codes you must know</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Typical cause or next step</th></tr>
<tr><td>200 OK</td><td>Success, body has data</td><td>Normal GET, token request</td></tr>
<tr><td>201 Created</td><td>Resource created</td><td>POST that creates something (RESTCONF)</td></tr>
<tr><td>202 Accepted</td><td>Accepted, still running</td><td>Catalyst Center change: poll the task</td></tr>
<tr><td>204 No Content</td><td>Success, empty body</td><td>RESTCONF PATCH, PUT or DELETE</td></tr>
<tr><td>400 Bad Request</td><td>Server cannot understand the request</td><td>Invalid JSON or a wrong field in the body</td></tr>
<tr><td>401 Unauthorized</td><td>Not authenticated</td><td>Missing, wrong or expired token</td></tr>
<tr><td>403 Forbidden</td><td>Authenticated but not allowed</td><td>Role lacks permission, missing XSRF token</td></tr>
<tr><td>404 Not Found</td><td>No such resource</td><td>Typo in the path, wrong device ID</td></tr>
<tr><td>405 / 415</td><td>Method not allowed / unsupported media type</td><td>Wrong verb / wrong Content-Type header</td></tr>
<tr><td>429 Too Many Requests</td><td>Rate limit reached</td><td>Slow down and retry later</td></tr>
<tr><td>500 / 503</td><td>Server error / unavailable</td><td>Problem on the controller side</td></tr>
</table>
<p>Rule of thumb: <b>2xx</b> success, <b>3xx</b> redirection, <b>4xx</b> the client (your script) did something wrong, <b>5xx</b> the server failed.</p>

<h3>ncclient, briefly</h3>
<p>For device APIs, <b>ncclient</b> is the Python NETCONF client: <code>manager.connect(host=..., port=830, username=..., password=..., hostkey_verify=False)</code> opens NETCONF over SSH on TCP 830, and <code>get_config(source="running")</code> or <code>edit_config(...)</code> exchange XML shaped by YANG models. RESTCONF uses requests exactly as above. Both are the subject of the next module.</p>

<div class="eg"><p><b>Worked example.</b> A GET to <code>/dna/intent/api/v1/network-device</code> returns 200 and a body whose <code>"response"</code> list has 42 entries, 3 of them with <code>"reachabilityStatus": "Unreachable"</code>. <code>len(r.json()["response"])</code> is 42 and <code>sum(1 for d in r.json()["response"] if d["reachabilityStatus"] != "Reachable")</code> is 3. The same call an hour later returns 401 with no device data: nothing broke on the network, the token expired.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>verify=False</code> outside a lab (it disables certificate checking; point <code>verify</code> at your CA bundle instead); reading <code>r.json()</code> without checking the status code first; putting the token in the wrong header (Catalyst Center wants <code>X-Auth-Token</code>, not <code>Authorization: Bearer</code>); and treating 202 as "done".</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 versus 403: 401 means the server does not know who you are (no or bad credentials or token); 403 means it knows and refuses. 202 means accepted but not finished. 204 means success with no body, so <code>r.json()</code> on it raises an error. Catalyst Center: Basic auth to get a token, then X-Auth-Token. SD-WAN Manager: j_security_check session, XSRF token for changes, data under <code>/dataservice</code>.</p></div>

<div class="scn"><h4>The report that died after an hour</h4><p>A health report walked 2,000 clients through Catalyst Center, one API call per site. It ran fine in testing on one site but failed halfway through production with a wall of 401 errors, and the output file held only half the sites. The token had expired after about 60 minutes. The engineer changed the request function so that on a 401 it requests a new token once and retries the call, added a short pause on 429, and the full run completed.</p><p><b>Lesson:</b> long-running API scripts must expect tokens to expire and rate limits to apply; handle 401 and 429 explicitly.</p></div>

<div class="iv"><p class="q">"Walk me through getting the device list from Catalyst Center with Python."</p><p>Strong answer: POST to <code>/dna/system/api/v1/auth/token</code> with Basic auth and read <code>Token</code> from the JSON reply; GET <code>/dna/intent/api/v1/network-device</code> with the header <code>X-Auth-Token</code>; check for 200; walk <code>r.json()["response"]</code> reading hostname, managementIpAddress and reachabilityStatus. Handle 401 by re-authenticating, keep credentials in environment variables or a vault, and verify certificates. Mention that writes return 202 and a taskId to poll.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests: <code>get/post(url, headers=, auth=, json=, timeout=)</code>, then <code>status_code</code> and <code>json()</code>.</li>
<li>Catalyst Center: POST <code>/dna/system/api/v1/auth/token</code> (Basic) gives Token; send <code>X-Auth-Token</code>; data under <code>"response"</code>; writes return 202 and a taskId.</li>
<li>SD-WAN Manager: POST <code>/j_security_check</code> for a JSESSIONID session, <code>/dataservice/client/token</code> for X-XSRF-TOKEN, data under <code>"data"</code>.</li>
<li>2xx success, 4xx client error, 5xx server error; know 200, 201, 202, 204, 400, 401, 403, 404.</li>
<li>Build URLs from a base variable plus a path; keep secrets out of the script.</li>
</ul></div>
`,hi:`
<p>Water park mein aap gate par ek baar ticket dikhate ho aur aapko <b>wristband</b> milta hai. Poore din har ride wristband check karti hai, ticket nahi, aur shaam ko woh expire ho jaata hai. Controller APIs bhi aise hi kaam karti hain: aap username aur password se ek baar login karte ho, ek <b>token</b> (ya session cookie) milta hai, aur expire hone tak use har request ke saath bhejte ho. Har jawab teen digit ke <b>status code</b> ke saath aata hai jo baaki kuch padhne se pehle hi bata deta hai ki kaam hua ya nahi.</p>

<h3>REST ek paragraph mein</h3>
<p>REST API HTTPS par use hoti hai. Har request mein ek <b>method</b> hota hai (GET padhna, POST banana, PUT replace, PATCH modify, DELETE hatana), ek <b>URL</b> jo controller ke base address plus <code>/dna/intent/api/v1/network-device</code> jaise <b>path</b> se banta hai, <b>headers</b> (jaise <code>Content-Type: application/json</code> aur token), aur POST, PUT ya PATCH ke liye JSON <b>body</b>. Server status code, headers aur aam taur par JSON body ke saath jawab deta hai. CCNA automation module ne yeh detail mein cover kiya tha; yahan hum ise Python se <b>requests</b> library ke saath chalate hain.</p>
<pre class="code">import os
import requests

base = os.environ["DNAC_BASE"]    <span class="c"># scheme + controller naam, script ke bahar rakha</span>
r = requests.get(base + "/dna/intent/api/v1/site", headers=hdrs, timeout=10)   <span class="c"># hdrs: neeche dekho</span>
print(r.status_code)              <span class="c"># 200</span>
data = r.json()                   <span class="c"># body dicts aur lists mein decode</span>
r.raise_for_status()              <span class="c"># kisi bhi 4xx ya 5xx par exception</span></pre>
<p>Script mein kabhi controller ka address ya password nahi hota: base address (scheme plus host name, jaise <code>dnac.nwkings.example</code> ka HTTPS address) aur credentials environment variables se aate hain, taaki same script lab aur production dono par chale.</p>

<h3>Catalyst Center: token, phir GET</h3>
<p>Catalyst Center (pehle DNA Center) <b>Intent API</b> deta hai, ek northbound REST API. Authentication do steps mein hai: <b>HTTP Basic</b> authentication ke saath <code>/dna/system/api/v1/auth/token</code> par POST; reply body <code>{"Token": "..."}</code> hoti hai. Phir woh value har call ke <code>X-Auth-Token</code> header mein bhejo. Token lagbhag ek ghanta valid rehta hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Catalyst Center token flow">
<rect x="20" y="10" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="33" text-anchor="middle" class="svg-ink" font-size="13">Python script</text>
<rect x="480" y="10" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="550" y="33" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="90" y1="46" x2="90" y2="220" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="550" y1="46" x2="550" y2="220" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="90" y1="72" x2="550" y2="72" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="12">POST /dna/system/api/v1/auth/token (Basic auth)</text>
<line x1="550" y1="106" x2="90" y2="106" stroke="#64748b" stroke-width="2"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">200 {"Token": "eyJ0eXAi..."}</text>
<line x1="90" y1="144" x2="550" y2="144" stroke="#64748b" stroke-width="2"/><text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">GET /dna/intent/api/v1/network-device + X-Auth-Token</text>
<line x1="550" y1="180" x2="90" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="12">200 {"response": [ ...devices... ], "version": "1.0"}</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">token lagbhag 60 minute mein expire: 401 matlab dobara login</text>
</svg><p class="cap">Ek baar login karo, token dobara use karo, har reply ka status code handle karo.</p></div>
<pre class="code">user, pw = os.environ["DNAC_USER"], os.environ["DNAC_PASS"]
r = requests.post(base + "/dna/system/api/v1/auth/token", auth=(user, pw), timeout=10)
if r.status_code != 200:
    raise SystemExit("login failed: {}".format(r.status_code))
hdrs = {"X-Auth-Token": r.json()["Token"], "Accept": "application/json"}

r = requests.get(base + "/dna/intent/api/v1/network-device", headers=hdrs, timeout=10)
if r.status_code == 200:
    for d in r.json()["response"]:
        print("{:&lt;10} {:&lt;12} {}".format(d["hostname"], d["managementIpAddress"],
                                      d["reachabilityStatus"]))
elif r.status_code == 401:
    print("token missing or expired: request a new one")
else:
    print("error", r.status_code, r.text)</pre>
<pre class="out">EDGE-R1    10.99.0.1    Reachable
ACC-SW1    10.99.0.11   Reachable
<span class="hl">ACC-SW2    10.99.0.12   Unreachable</span></pre>
<p>Dhyan do ki devices ki list top level par nahi hai: woh key <code>"response"</code> ke neeche hai. Changes (POST, PUT, DELETE) <b>asynchronous</b> hain: Catalyst Center <b>202 Accepted</b> ke saath <code>{"response": {"taskId": "..."}}</code> jaisi body deta hai, aur aap <code>/dna/intent/api/v1/task/</code> plus woh taskId poll karte ho ye jaanne ke liye ki kaam poora hua ya fail hua.</p>

<h3>SD-WAN Manager: session cookie aur XSRF token</h3>
<p>SD-WAN Manager (pehle vManage) ek <b>session</b> use karta hai. Form fields <code>j_username</code> aur <code>j_password</code> ko <code>/j_security_check</code> par POST karo; server <code>JSESSIONID</code> cookie set karta hai. Kuch bhi badalne wali call (POST, PUT, DELETE) ke liye cross-site request forgery token bhi chahiye: <code>/dataservice/client/token</code> ko GET karo aur uska text <code>X-XSRF-TOKEN</code> header mein bhejo. Data <code>/dataservice/</code> ke neeche rehta hai, aur responses records ko <code>"data"</code> list mein rakhte hain. Naye releases token-based (JWT) login bhi dete hain, par aap zyada tar session wala tarika hi dekhoge.</p>
<pre class="code">s = requests.Session()                     <span class="c"># JSESSIONID cookie rakhta hai</span>
r = s.post(vbase + "/j_security_check",
           data={"j_username": vuser, "j_password": vpass}, timeout=10)
if r.status_code != 200 or "JSESSIONID" not in s.cookies:
    raise SystemExit("SD-WAN Manager login failed")
s.headers["X-XSRF-TOKEN"] = s.get(vbase + "/dataservice/client/token").text
for dev in s.get(vbase + "/dataservice/device").json()["data"]:
    print(dev["host-name"], dev["system-ip"], dev["reachability"])</pre>
<p>Yahan failed login 401 <b>nahi</b> deta: server aam taur par HTML login page aur bina session cookie ke 200 ke saath jawab deta hai, isliye script code ke saath cookie bhi check karta hai.</p>

<h3>Status codes jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Typical wajah ya agla step</th></tr>
<tr><td>200 OK</td><td>Success, body mein data</td><td>Normal GET, token request</td></tr>
<tr><td>201 Created</td><td>Resource bana</td><td>POST jo kuch banata hai (RESTCONF)</td></tr>
<tr><td>202 Accepted</td><td>Accept hua, abhi chal raha hai</td><td>Catalyst Center change: task poll karo</td></tr>
<tr><td>204 No Content</td><td>Success, khaali body</td><td>RESTCONF PATCH, PUT ya DELETE</td></tr>
<tr><td>400 Bad Request</td><td>Server request samajh nahi paaya</td><td>Invalid JSON ya body mein galat field</td></tr>
<tr><td>401 Unauthorized</td><td>Authenticated nahi</td><td>Token missing, galat ya expired</td></tr>
<tr><td>403 Forbidden</td><td>Authenticated par allowed nahi</td><td>Role ke paas permission nahi, XSRF token missing</td></tr>
<tr><td>404 Not Found</td><td>Aisa resource nahi</td><td>Path mein typo, galat device ID</td></tr>
<tr><td>405 / 415</td><td>Method allowed nahi / media type unsupported</td><td>Galat verb / galat Content-Type header</td></tr>
<tr><td>429 Too Many Requests</td><td>Rate limit pahunch gaya</td><td>Dheere karo aur baad mein retry</td></tr>
<tr><td>500 / 503</td><td>Server error / unavailable</td><td>Controller side par problem</td></tr>
</table>
<p>Rule of thumb: <b>2xx</b> success, <b>3xx</b> redirection, <b>4xx</b> client (aapke script) ne kuch galat kiya, <b>5xx</b> server fail hua.</p>

<h3>ncclient, sankshep mein</h3>
<p>Device APIs ke liye <b>ncclient</b> Python ka NETCONF client hai: <code>manager.connect(host=..., port=830, username=..., password=..., hostkey_verify=False)</code> TCP 830 par SSH ke upar NETCONF kholta hai, aur <code>get_config(source="running")</code> ya <code>edit_config(...)</code> YANG models se shaped XML exchange karte hain. RESTCONF bilkul upar ki tarah requests use karta hai. Dono agle module ka vishay hain.</p>

<div class="eg"><p><b>Worked example.</b> <code>/dna/intent/api/v1/network-device</code> par GET 200 deta hai aur aisi body jiski <code>"response"</code> list mein 42 entries hain, unme se 3 <code>"reachabilityStatus": "Unreachable"</code> ke saath. <code>len(r.json()["response"])</code> 42 hai aur <code>sum(1 for d in r.json()["response"] if d["reachabilityStatus"] != "Reachable")</code> 3 hai. Wahi call ek ghante baad bina device data ke 401 deti hai: network par kuch nahi toota, token expire ho gaya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Lab ke bahar <code>verify=False</code> use karna (yeh certificate checking band kar deta hai; iski jagah <code>verify</code> ko apne CA bundle par point karo); status code check kiye bina <code>r.json()</code> padhna; token galat header mein daalna (Catalyst Center ko <code>X-Auth-Token</code> chahiye, <code>Authorization: Bearer</code> nahi); aur 202 ko "ho gaya" maan lena.</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 vs 403: 401 ka matlab server nahi jaanta aap kaun ho (credentials ya token nahi ya galat); 403 ka matlab jaanta hai aur mana karta hai. 202 matlab accept hua par khatam nahi. 204 matlab bina body ke success, isliye us par <code>r.json()</code> error deta hai. Catalyst Center: token ke liye Basic auth, phir X-Auth-Token. SD-WAN Manager: j_security_check session, changes ke liye XSRF token, data <code>/dataservice</code> ke neeche.</p></div>

<div class="scn"><h4>Report jo ek ghante baad mar gayi</h4><p>Ek health report Catalyst Center se 2,000 clients par chalti thi, har site ke liye ek API call. Testing mein ek site par theek chali par production mein aadhe raaste 401 errors ki deewar ke saath fail hui, aur output file mein sirf aadhi sites thi. Token lagbhag 60 minute baad expire ho gaya tha. Engineer ne request function badla taaki 401 par woh ek baar naya token maange aur call retry kare, 429 par chhota pause joda, aur poora run khatam hua.</p><p><b>Seekh:</b> lambe chalne wale API scripts ko expect karna chahiye ki tokens expire honge aur rate limits lagenge; 401 aur 429 ko explicitly handle karo.</p></div>

<div class="iv"><p class="q">"Python se Catalyst Center ki device list nikaalne ka process samjhao."</p><p>Strong answer: Basic auth ke saath <code>/dna/system/api/v1/auth/token</code> par POST karo aur JSON reply se <code>Token</code> padho; header <code>X-Auth-Token</code> ke saath <code>/dna/intent/api/v1/network-device</code> GET karo; 200 check karo; <code>r.json()["response"]</code> mein chal kar hostname, managementIpAddress aur reachabilityStatus padho. 401 ko re-authenticate karke handle karo, credentials environment variables ya vault mein rakho, aur certificates verify karo. Batao ki writes 202 aur poll karne ke liye taskId return karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests: <code>get/post(url, headers=, auth=, json=, timeout=)</code>, phir <code>status_code</code> aur <code>json()</code>.</li>
<li>Catalyst Center: POST <code>/dna/system/api/v1/auth/token</code> (Basic) Token deta hai; <code>X-Auth-Token</code> bhejo; data <code>"response"</code> ke neeche; writes 202 aur taskId dete hain.</li>
<li>SD-WAN Manager: JSESSIONID session ke liye POST <code>/j_security_check</code>, X-XSRF-TOKEN ke liye <code>/dataservice/client/token</code>, data <code>"data"</code> ke neeche.</li>
<li>2xx success, 4xx client error, 5xx server error; 200, 201, 202, 204, 400, 401, 403, 404 aane chahiye.</li>
<li>URLs base variable plus path se banao; secrets script se bahar rakho.</li>
</ul></div>
`}};export{e as default};