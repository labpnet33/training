var e={id:`rest-api-python`,h:{en:`REST API and Python automation: authenticate and read the device list`,hi:`REST API aur Python automation: authenticate karo aur device list padho`},body:{en:`
<p>A restaurant has a menu for guests and a kitchen window for waiters. Guests use the dining room, the way engineers use the Manager GUI. Waiters never go to the dining room; they use the kitchen window and speak a fixed format: "Table 4, two dosas." The <b>REST API</b> is the kitchen window of the Manager. Every button in the GUI is built on an API call, so anything you click you can also automate.</p>

<h3>Why automate with the API</h3>
<ul>
<li><b>Reports</b>: a daily list of unreachable devices, certificate expiry dates or software versions, without opening 72 device pages.</li>
<li><b>Bulk work</b>: acknowledging alarms, collecting statistics for hundreds of tunnels, or checking that every edge runs the approved version.</li>
<li><b>Integration</b>: sending alarms to an ITSM tool, or creating a ticket when a site loses all WAN connectivity.</li>
<li><b>Consistency</b>: a script does the same thing every time, and leaves a record.</li>
</ul>

<h3>The authentication flow in three steps</h3>
<p>The Manager API is session based. You log in once, receive a session cookie, then fetch a token and send both on every call. For current releases both the cookie and the token are mandatory:</p>
<ol>
<li><b>Log in.</b> <code>POST /j_security_check</code> with the content type <code>application/x-www-form-urlencoded</code> and two form fields: <code>j_username</code> and <code>j_password</code>. The response sets a <code>JSESSIONID</code> cookie.</li>
<li><b>Get the token.</b> <code>GET /dataservice/client/token</code> with the <code>JSESSIONID</code> cookie. The response body is the token (the CSRF or XSRF protection token).</li>
<li><b>Call the API.</b> Send <code>Cookie: JSESSIONID=...</code> and the header <code>X-XSRF-TOKEN: ...</code> on every request to <code>the Manager address followed by /dataservice/&lt;endpoint&gt;</code>. Use the content type <code>application/json</code>.</li>
<li><b>Log out</b> when finished: <code>POST /logout?nocache=&lt;random number&gt;</code> with the cookie.</li>
</ol>
<p>Session rules from the Cisco documentation: a session lasts up to 24 hours with a 30-minute inactivity timeout, and the Manager allows at most 100 concurrent sessions, invalidating the oldest when the limit is exceeded. A script that logs in on every run and never logs out slowly uses up sessions; log out at the end.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Manager API authentication sequence">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Python script</text>
<rect x="470" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="13">Manager VMANAGE</text>
<line x1="95" y1="60" x2="95" y2="215" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/><line x1="545" y1="60" x2="545" y2="215" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="95" y1="85" x2="545" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="12">1 POST /j_security_check (user, password)</text>
<line x1="545" y1="110" x2="95" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">Set-Cookie: JSESSIONID</text>
<line x1="95" y1="135" x2="545" y2="135" stroke="#64748b" stroke-width="2"/><text x="320" y="129" text-anchor="middle" class="svg-ink" font-size="12">2 GET /dataservice/client/token</text>
<line x1="545" y1="160" x2="95" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">token in the body</text>
<line x1="95" y1="185" x2="545" y2="185" stroke="#64748b" stroke-width="2"/><text x="320" y="179" text-anchor="middle" class="svg-accent" font-size="12">3 GET /dataservice/device (cookie + X-XSRF-TOKEN)</text>
<line x1="545" y1="208" x2="95" y2="208" stroke="#64748b" stroke-width="2"/><text x="320" y="202" text-anchor="middle" class="svg-muted" font-size="12">JSON: data array</text>
</svg><p class="cap">Log in, fetch the token, then every call carries the cookie and the token.</p></div>

<h3>A first Python script: list the devices</h3>
<p>Python's <code>requests</code> library with a <code>Session</code> object stores the cookie for us. The script logs in, gets the token, reads the device list and prints a table. (For a lab with a self-signed certificate we turn off certificate verification; never do that in production, install a trusted certificate instead.)</p>
<pre class="code">import os
import requests

MANAGER = "https" + "://198.51.100.10"          <span class="c"># VMANAGE in the Bharat Retail lab</span>
USER = "nk-api"                              <span class="c"># a dedicated, read-only API user</span>
PASSWORD = os.environ["SDWAN_PASSWORD"]      <span class="c"># never hard-code passwords</span>

s = requests.Session()
s.verify = False                             <span class="c"># LAB ONLY</span>

<span class="c"># 1. log in: form-encoded user and password; the session keeps JSESSIONID</span>
r = s.post(MANAGER + "/j_security_check",
           data={"j_username": USER, "j_password": PASSWORD})
if "html" in r.text.lower():                 <span class="c"># a failed login returns the login page</span>
    raise SystemExit("login failed")

<span class="c"># 2. get the token and send it on every later call</span>
token = s.get(MANAGER + "/dataservice/client/token").text
s.headers.update({"X-XSRF-TOKEN": token, "Content-Type": "application/json"})

<span class="c"># 3. read the device list</span>
resp = s.get(MANAGER + "/dataservice/device")
resp.raise_for_status()
for d in resp.json()["data"]:
    print(d["host-name"], d["system-ip"], d["site-id"],
          d["device-type"], d["reachability"])

<span class="c"># 4. log out</span>
s.post(MANAGER + "/logout?nocache=1")</pre>
<p>Sample output for the Bharat Retail lab (system IPs from the topology):</p>
<pre class="out">VMANAGE 10.255.255.1 1   vmanage  reachable
VSMART  10.255.255.2 1   vsmart   reachable
VBOND   10.255.255.3 1   vbond    reachable
E-DEL-1 10.255.0.11  100 vedge    reachable
E-MUM-1 10.255.0.12  200 vedge    reachable
<span class="hl">E-BLR-1 10.255.0.13  300 vedge    unreachable</span></pre>
<p>The response is JSON with a top-level <code>data</code> array; each element is one device with keys such as <code>host-name</code>, <code>system-ip</code>, <code>site-id</code>, <code>device-type</code>, <code>reachability</code>, <code>version</code>, <code>uuid</code> and <code>device-model</code>. Controllers and edges are all in the same list, told apart by <code>device-type</code>. Release names and key sets can vary slightly, so print one raw element first and check the keys you need.</p>

<h3>Useful GET endpoints</h3>
<table class="cmp"><tr><th>Endpoint</th><th>What it returns</th></tr>
<tr><td><code>/dataservice/device</code></td><td>The device inventory</td></tr>
<tr><td><code>/dataservice/device/control/synced/connections</code></td><td>Control connection status</td></tr>
<tr><td><code>/dataservice/device/counters</code></td><td>OMP peers, controller connections, BFD session counts</td></tr>
<tr><td><code>/dataservice/device/system/status</code></td><td>Uptime, version, memory and CPU</td></tr>
<tr><td><code>/dataservice/device/interface/synced</code></td><td>Interface operational status</td></tr>
<tr><td><code>/dataservice/device/tunnel/statistics?deviceId=10.255.0.11</code></td><td>Per-tunnel statistics, loss, latency, jitter</td></tr>
<tr><td><code>/dataservice/alarms</code></td><td>Alarms (queries use the Simple Query format)</td></tr></table>
<p>Device-specific calls take the <b>system IP</b> as the <code>deviceId</code> parameter. Cisco documents every endpoint for each release on its developer portal; use it to look up the exact request and response of the release you run, and avoid copying calls from old blog posts.</p>

<div class="eg"><p><b>Worked example.</b> The NOC wants a morning report of unreachable edges. The script above runs from a scheduled job at 08:00, filters <code>[d for d in data if d["reachability"] != "reachable" and d["device-type"] == "vedge"]</code> and posts the list to the NOC channel. At 08:00 today it posts one line: E-BLR-1, site 300, unreachable. It replaces a person clicking through the device list, and it takes under three seconds for 72 sites.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using the <code>admin</code> account for scripts: create a dedicated user in a group with only the read permission the script needs. (2) Storing the password in the script or in Git. (3) Forgetting the token and then getting a forbidden error on POST or PUT calls. (4) Disabling certificate verification in production. (5) Never logging out, which exhausts the 100 sessions.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order of authentication: <code>/j_security_check</code> (cookie), then <code>/dataservice/client/token</code> (token), then calls with both. The base path is <code>/dataservice</code>. A device list is <code>GET /dataservice/device</code> and the data is in the <code>data</code> array.</p></div>

<div class="scn"><h4>The script that locked everyone out</h4><p>A new automation job logged in every minute and never logged out. After a few hours the Manager reached its limit of 100 sessions and started invalidating the oldest, which included engineers using the GUI, who were suddenly logged out. The team changed the script to reuse one session, log out at the end and run every five minutes, and moved it to a dedicated read-only user.</p><p><b>Lesson:</b> API sessions are a shared, limited resource.</p></div>

<div class="iv"><p class="q">"How do you authenticate to the Manager REST API and get the device list?"</p><p>POST the form fields j_username and j_password to /j_security_check to get a JSESSIONID cookie, GET /dataservice/client/token to get the XSRF token, then call GET /dataservice/device with the cookie and the X-XSRF-TOKEN header. The JSON response has a data array with host-name, system-ip, site-id, device-type and reachability for each device. I use a dedicated least-privilege user, verify certificates, and log out when finished.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every GUI action is an API call under <code>/dataservice</code>.</li>
<li>Authenticate with <code>/j_security_check</code>, then fetch <code>/dataservice/client/token</code>; send both cookie and token.</li>
<li><code>GET /dataservice/device</code> returns the inventory in a <code>data</code> array.</li>
<li>Sessions last up to 24 hours, 30 minutes idle, 100 at most: log out.</li>
<li>Use a least-privilege API user and keep secrets out of code.</li>
</ul></div>
`,hi:`
<p>Restaurant mein guests ke liye menu hota hai aur waiters ke liye kitchen window. Guests dining room use karte hain, jaise engineers Manager GUI use karte hain. Waiters kabhi dining room nahi jaate; woh kitchen window use karte hain aur fixed format mein bolte hain: "Table 4, do dosa." <b>REST API</b> Manager ki kitchen window hai. GUI ka har button ek API call par bana hai, isliye jo aap click karte ho use automate bhi kar sakte ho.</p>

<h3>API se automate kyun karein</h3>
<ul>
<li><b>Reports</b>: 72 device pages kholne ke bina unreachable devices, certificate expiry dates ya software versions ki daily list.</li>
<li><b>Bulk work</b>: alarms acknowledge karna, saikdon tunnels ke statistics collect karna, ya check karna ki har edge approved version chala raha hai.</li>
<li><b>Integration</b>: alarms ko ITSM tool ko bhejna, ya jab koi site saari WAN connectivity kho de to ticket banana.</li>
<li><b>Consistency</b>: script har baar wahi karti hai, aur record chhodti hai.</li>
</ul>

<h3>Authentication flow teen steps mein</h3>
<p>Manager API session based hai. Aap ek baar login karte ho, session cookie milti hai, phir token lete ho aur har call par dono bhejte ho. Current releases mein cookie aur token dono zaroori hain:</p>
<ol>
<li><b>Login.</b> <code>POST /j_security_check</code>, content type <code>application/x-www-form-urlencoded</code> aur do form fields: <code>j_username</code> aur <code>j_password</code>. Response <code>JSESSIONID</code> cookie set karta hai.</li>
<li><b>Token lo.</b> <code>JSESSIONID</code> cookie ke saath <code>GET /dataservice/client/token</code>. Response body token hai (CSRF ya XSRF protection token).</li>
<li><b>API call karo.</b> <code>the Manager address followed by /dataservice/&lt;endpoint&gt;</code> par har request mein <code>Cookie: JSESSIONID=...</code> aur header <code>X-XSRF-TOKEN: ...</code> bhejo. Content type <code>application/json</code> use karo.</li>
<li><b>Logout</b> khatam hone par: cookie ke saath <code>POST /logout?nocache=&lt;random number&gt;</code>.</li>
</ol>
<p>Cisco documentation ke session rules: session 24 ghante tak chalta hai aur 30 minute inactivity timeout hai, aur Manager adhiktam 100 concurrent sessions deta hai, limit paar hone par sabse purane ko invalidate karta hai. Jo script har run par login karti hai aur logout nahi karti woh dheere-dheere sessions khatam kar deti hai; ant mein logout karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Manager API authentication sequence">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Python script</text>
<rect x="470" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="13">Manager VMANAGE</text>
<line x1="95" y1="60" x2="95" y2="215" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/><line x1="545" y1="60" x2="545" y2="215" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="95" y1="85" x2="545" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="12">1 POST /j_security_check (user, password)</text>
<line x1="545" y1="110" x2="95" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">Set-Cookie: JSESSIONID</text>
<line x1="95" y1="135" x2="545" y2="135" stroke="#64748b" stroke-width="2"/><text x="320" y="129" text-anchor="middle" class="svg-ink" font-size="12">2 GET /dataservice/client/token</text>
<line x1="545" y1="160" x2="95" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">body mein token</text>
<line x1="95" y1="185" x2="545" y2="185" stroke="#64748b" stroke-width="2"/><text x="320" y="179" text-anchor="middle" class="svg-accent" font-size="12">3 GET /dataservice/device (cookie + X-XSRF-TOKEN)</text>
<line x1="545" y1="208" x2="95" y2="208" stroke="#64748b" stroke-width="2"/><text x="320" y="202" text-anchor="middle" class="svg-muted" font-size="12">JSON: data array</text>
</svg><p class="cap">Login karo, token lo, phir har call cookie aur token carry karti hai.</p></div>

<h3>Pehli Python script: devices ki list</h3>
<p>Python ki <code>requests</code> library ka <code>Session</code> object hamare liye cookie store karta hai. Script login karti hai, token leti hai, device list padhti hai aur table print karti hai. (Self-signed certificate wale lab ke liye hum certificate verification band karte hain; production mein kabhi nahi, uski jagah trusted certificate install karo.)</p>
<pre class="code">import os
import requests

MANAGER = "https" + "://198.51.100.10"          <span class="c"># Bharat Retail lab ka VMANAGE</span>
USER = "nk-api"                              <span class="c"># dedicated, read-only API user</span>
PASSWORD = os.environ["SDWAN_PASSWORD"]      <span class="c"># password kabhi hard-code mat karo</span>

s = requests.Session()
s.verify = False                             <span class="c"># SIRF LAB</span>

<span class="c"># 1. login: form-encoded user aur password; session JSESSIONID rakhti hai</span>
r = s.post(MANAGER + "/j_security_check",
           data={"j_username": USER, "j_password": PASSWORD})
if "html" in r.text.lower():                 <span class="c"># failed login login page return karta hai</span>
    raise SystemExit("login failed")

<span class="c"># 2. token lo aur baad ki har call par bhejo</span>
token = s.get(MANAGER + "/dataservice/client/token").text
s.headers.update({"X-XSRF-TOKEN": token, "Content-Type": "application/json"})

<span class="c"># 3. device list padho</span>
resp = s.get(MANAGER + "/dataservice/device")
resp.raise_for_status()
for d in resp.json()["data"]:
    print(d["host-name"], d["system-ip"], d["site-id"],
          d["device-type"], d["reachability"])

<span class="c"># 4. logout</span>
s.post(MANAGER + "/logout?nocache=1")</pre>
<p>Bharat Retail lab ka sample output (topology ke system IPs):</p>
<pre class="out">VMANAGE 10.255.255.1 1   vmanage  reachable
VSMART  10.255.255.2 1   vsmart   reachable
VBOND   10.255.255.3 1   vbond    reachable
E-DEL-1 10.255.0.11  100 vedge    reachable
E-MUM-1 10.255.0.12  200 vedge    reachable
<span class="hl">E-BLR-1 10.255.0.13  300 vedge    unreachable</span></pre>
<p>Response JSON hai jisme top-level <code>data</code> array hai; har element ek device hai jisme <code>host-name</code>, <code>system-ip</code>, <code>site-id</code>, <code>device-type</code>, <code>reachability</code>, <code>version</code>, <code>uuid</code> aur <code>device-model</code> jaise keys hain. Controllers aur edges ek hi list mein hain, <code>device-type</code> se alag pehchane jaate hain. Release ke hisaab se keys thode alag ho sakte hain, isliye pehle ek raw element print karke apni zaroori keys check karo.</p>

<h3>Kaam ke GET endpoints</h3>
<table class="cmp"><tr><th>Endpoint</th><th>Kya return karta hai</th></tr>
<tr><td><code>/dataservice/device</code></td><td>Device inventory</td></tr>
<tr><td><code>/dataservice/device/control/synced/connections</code></td><td>Control connection status</td></tr>
<tr><td><code>/dataservice/device/counters</code></td><td>OMP peers, controller connections, BFD session counts</td></tr>
<tr><td><code>/dataservice/device/system/status</code></td><td>Uptime, version, memory aur CPU</td></tr>
<tr><td><code>/dataservice/device/interface/synced</code></td><td>Interface operational status</td></tr>
<tr><td><code>/dataservice/device/tunnel/statistics?deviceId=10.255.0.11</code></td><td>Per-tunnel statistics, loss, latency, jitter</td></tr>
<tr><td><code>/dataservice/alarms</code></td><td>Alarms (queries Simple Query format use karti hain)</td></tr></table>
<p>Device-specific calls <b>system IP</b> ko <code>deviceId</code> parameter ke roop mein leti hain. Cisco apne developer portal par har release ka har endpoint document karta hai; apne release ka exact request aur response wahan dekho, aur purane blog posts se calls copy mat karo.</p>

<div class="eg"><p><b>Worked example.</b> NOC ko unreachable edges ki morning report chahiye. Upar wali script 08:00 par scheduled job se chalti hai, <code>[d for d in data if d["reachability"] != "reachable" and d["device-type"] == "vedge"]</code> se filter karti hai aur list NOC channel mein post karti hai. Aaj 08:00 par woh ek line post karti hai: E-BLR-1, site 300, unreachable. Yeh device list mein click karte ek insaan ki jagah leti hai, aur 72 sites ke liye teen second se kam leti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Scripts ke liye <code>admin</code> account use karna: ek dedicated user banao jiski group mein sirf script ko chahiye wali read permission ho. (2) Password ko script ya Git mein rakhna. (3) Token bhool jaana aur POST ya PUT calls par forbidden error milna. (4) Production mein certificate verification band karna. (5) Kabhi logout na karna, jisse 100 sessions khatam ho jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication ka order: <code>/j_security_check</code> (cookie), phir <code>/dataservice/client/token</code> (token), phir dono ke saath calls. Base path <code>/dataservice</code> hai. Device list <code>GET /dataservice/device</code> hai aur data <code>data</code> array mein hai.</p></div>

<div class="scn"><h4>Script jisne sabko locked out kiya</h4><p>Ek nayi automation job har minute login karti thi aur kabhi logout nahi. Kuch ghanton baad Manager 100 sessions ki limit par pahunch gaya aur sabse purane invalidate karne laga, jisme GUI use karte engineers bhi the, jo achanak logged out ho gaye. Team ne script ko ek session reuse karne, ant mein logout karne aur har paanch minute chalne ke liye badla, aur use dedicated read-only user par le gayi.</p><p><b>Lesson:</b> API sessions shared, limited resource hain.</p></div>

<div class="iv"><p class="q">"Manager REST API se authenticate karke device list kaise lete ho?"</p><p>Form fields j_username aur j_password ko /j_security_check par POST karke JSESSIONID cookie leta hoon, XSRF token ke liye GET /dataservice/client/token, phir cookie aur X-XSRF-TOKEN header ke saath GET /dataservice/device call karta hoon. JSON response mein data array hai jisme har device ke liye host-name, system-ip, site-id, device-type aur reachability hai. Main dedicated least-privilege user use karta hoon, certificates verify karta hoon, aur khatam hone par logout karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GUI ka har action <code>/dataservice</code> ke neeche ek API call hai.</li>
<li><code>/j_security_check</code> se authenticate karo, phir <code>/dataservice/client/token</code> lo; cookie aur token dono bhejo.</li>
<li><code>GET /dataservice/device</code> inventory ko <code>data</code> array mein deta hai.</li>
<li>Sessions 24 ghante tak, 30 minute idle, adhiktam 100: logout karo.</li>
<li>Least-privilege API user use karo aur secrets code se bahar rakho.</li>
</ul></div>
`}};export{e as default};