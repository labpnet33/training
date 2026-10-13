var e={id:`catalyst-center`,h:{en:`Catalyst Center: token login, inventory, issues, path trace and templates`,hi:`Catalyst Center: token login, inventory, issues, path trace aur templates`},body:{en:`
<p>Catalyst Center (formerly DNA Center) is the on-premises controller for campus networks. It discovers switches, routers and wireless controllers, keeps an <b>inventory</b>, scores their health (<b>Assurance</b>), traces paths and pushes configuration with <b>templates</b>. You met the idea in ENCOR: a controller has a <b>southbound</b> side that talks to devices (SSH, SNMP, NETCONF) and a <b>northbound</b> side that talks to you and your scripts. That northbound side is a REST API with JSON, called the <b>Intent API</b>. In this chapter we learn how to call it.</p>

<h3>Step 1: log in and get a token</h3>
<p>Catalyst Center does not use a key like Meraki. You first <b>POST to an authentication endpoint with basic authentication</b> (username and password). The reply contains a token. You then send that token in a header on every later call.</p>
<ul>
<li>Authentication endpoint: <code>POST /dna/system/api/v1/auth/token</code> with basic auth.</li>
<li>Reply body: <code>{"Token": "eyJ0eXAi..."}</code>.</li>
<li>Every following request carries the header <code>X-Auth-Token: eyJ0eXAi...</code>.</li>
<li>The token is valid for a limited time (about an hour). When a call returns <b>401</b>, fetch a new token.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
requests.packages.urllib3.disable_warnings()
BASE = "h&#116;tps://dnac.example"

r = requests.post(BASE + "/dna/system/api/v1/auth/token",
                  auth=("admin", "YOUR_PASSWORD"), verify=False)
r.raise_for_status()
token = r.json()["Token"]

H = {"X-Auth-Token": token, "Accept": "application/json"}
devs = requests.get(BASE + "/dna/intent/api/v1/network-device", headers=H, verify=False)
for d in devs.json()["response"]:
    print(d["hostname"], d["managementIpAddress"], d["reachabilityStatus"])</pre>
<pre class="out">DSW1  10.99.0.1   <span class="hl">Reachable</span>
ASW1  10.99.0.11  Reachable
ASW2  10.99.0.12  Reachable</pre>
<p>Notice the shape of the answer: the list is inside a key called <code>response</code>, plus a <code>version</code>. Most Intent API replies use this wrapper, so your code usually reads <code>.json()["response"]</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Catalyst Center token flow">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Your script</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="160" y1="35" x2="480" y2="35" stroke="#64748b" stroke-width="2"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="12">1. POST /dna/system/api/v1/auth/token (basic auth)</text>
<line x1="480" y1="55" x2="160" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">2. {"Token": "..."}</text>
<line x1="160" y1="105" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="12">3. GET /dna/intent/api/v1/network-device + X-Auth-Token</text>
<line x1="480" y1="125" x2="160" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">4. {"response": [ ... ], "version": "1.0"}</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Token expires: on 401 go back to step 1</text>
</svg><p class="cap">Login once, then send the token in the X-Auth-Token header.</p></div>

<h3>The main resources</h3>
<table class="cmp"><tr><th>Job</th><th>Call (Intent API)</th><th>Notes</th></tr>
<tr><td>List devices</td><td>GET /dna/intent/api/v1/network-device</td><td>Hostname, IP, platform, software, reachability. Filter by query parameters.</td></tr>
<tr><td>Count devices</td><td>GET /dna/intent/api/v1/network-device/count</td><td>Quick check without downloading the list.</td></tr>
<tr><td>Open issues</td><td>GET on the issues resource</td><td>Assurance problems with priority and the affected device. The exact path differs between releases, so read the docs of your version.</td></tr>
<tr><td>Path trace</td><td>POST /dna/intent/api/v1/flow-analysis, then GET /dna/intent/api/v1/flow-analysis/{id}</td><td>Body names the source and destination IP, and optionally ports and protocol.</td></tr>
<tr><td>Templates</td><td>/dna/intent/api/v1/template-programmer/template ...</td><td>Template Programmer: create, version and deploy CLI templates with variables.</td></tr>
<tr><td>Task status</td><td>GET /dna/intent/api/v1/task/{taskId}</td><td>Long jobs are asynchronous.</td></tr></table>

<h3>Asynchronous calls: task id, then poll</h3>
<p>Reading a list is instant. Starting a path trace or deploying a template is not. Catalyst Center answers immediately with a <b>task id</b> (and for path trace a <b>flowAnalysisId</b>), and the work continues in the background. You then <b>poll</b>: GET the task (or the flow-analysis) until it says it is finished, and read the result. A beginner who reads the first reply as "the result" sees an empty answer and thinks the call failed.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - path trace</span>
body = {"sourceIP": "10.20.20.22", "destIP": "172.16.50.10",
        "protocol": "TCP", "destPort": "80"}
r = requests.post(BASE + "/dna/intent/api/v1/flow-analysis", headers=H, json=body, verify=False)
fid = r.json()["response"]["flowAnalysisId"]
res = requests.get(BASE + "/dna/intent/api/v1/flow-analysis/" + fid, headers=H, verify=False)
print(res.json()["response"]["request"]["status"])      <span class="c"># INPROGRESS, then COMPLETED</span></pre>

<h3>Template Programmer in one paragraph</h3>
<p>A <b>template</b> is a CLI snippet with variables, for example an NTP configuration with a variable <code>ntp_server</code>. You create the template, commit a version, then <b>deploy</b> it to chosen devices with a body that gives the template id and the values for the variables. Catalyst Center renders the CLI per device, pushes it and reports a task result. This is how you roll one standard change out to 200 switches without logging in to any of them.</p>

<h3>The simulator's controller</h3>
<p>The lab controller (CTRL) has a read-only explorer in its shell. It uses short paths so you can read quickly: <code>center api get /api/v1/network-device</code>, <code>/api/v1/issues</code>, <code>/api/v1/network-health</code>, <code>/api/v1/template</code> and <code>/api/v1/path-trace</code>. A real Catalyst Center uses the longer <code>/dna/intent/api/v1/...</code> paths and needs a token first, but the JSON shapes (a <code>response</code> list with fields such as <code>hostname</code>, <code>reachabilityStatus</code> and <code>priority</code>) are the same idea. Lab 1 uses it.</p>
<pre class="out">CTRL&gt; center api get /api/v1/issues
{
  "response": [
    { "issueId": "#2B80", <span class="hl">"priority": "P1"</span>, "category": "Routing",
      "deviceName": "DSW1", "name": "OSPF adjacency down on Gi0/3 toward R1",
      "impacted": [ "DSW1", "R1" ] }
  ],
  "totalCount": 1
}</pre>

<div class="warn"><p><b>Common mistakes.</b> Sending the token as a Bearer header (Catalyst Center uses <code>X-Auth-Token</code>). Forgetting the <code>["response"]</code> wrapper and getting a KeyError. Treating the POST reply of an asynchronous call as the final result. Leaving certificate verification off in production.</p></div>
<div class="exam"><p><b>Exam trap.</b> The authentication path is <code>/dna/system/api/v1/auth/token</code> (system), while normal resources are under <code>/dna/intent/api/v1/</code> (intent). Know both, and know the header name <code>X-Auth-Token</code>.</p></div>

<div class="scn"><h4>The nightly health report</h4><p>A university campus team wrote a script that, every night at 2 am, fetched a token, listed devices, filtered those with reachability "Unreachable" and read the open issues. If anything was P1, it posted the issue name and the affected device into the network team's chat. After a month the script started failing at 2:05 with 401. The cause: the engineer had cached the token in a file and reused it for days. The fix was to request a fresh token at the start of every run (and to retry once on 401).</p><p><b>Lesson:</b> tokens expire; fetch a fresh one per run.</p></div>

<div class="iv"><p class="q">"How do you authenticate to Catalyst Center and list the devices?"</p><p>POST to /dna/system/api/v1/auth/token with basic auth, take the Token from the JSON, then GET /dna/intent/api/v1/network-device with the header X-Auth-Token and read the response list. Mention that the token expires, that long operations return a task id you must poll, and that the controller's northbound API is REST/JSON while it uses SSH, SNMP and NETCONF southbound.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center is the campus controller; its northbound Intent API is REST with JSON.</li>
<li>Login is a POST with basic auth to /dna/system/api/v1/auth/token; send the token as X-Auth-Token.</li>
<li>Most replies wrap data in a response key; tokens expire, so handle 401.</li>
<li>Path trace and template deployment are asynchronous: get a task or flow id, then poll.</li>
<li>Resources to know: network-device, issues, flow-analysis (path trace), template-programmer.</li>
</ul></div>
`,hi:`
<p>Catalyst Center (pehle DNA Center) campus networks ka on-premises controller hai. Yeh switches, routers aur wireless controllers ko discover karta hai, ek <b>inventory</b> rakhta hai, unki health score karta hai (<b>Assurance</b>), paths trace karta hai aur <b>templates</b> se configuration push karta hai. Yeh idea aap ENCOR mein mil chuke ho: controller ka ek <b>southbound</b> side hota hai jo devices se baat karta hai (SSH, SNMP, NETCONF) aur ek <b>northbound</b> side jo aapse aur aapki scripts se baat karta hai. Woh northbound side JSON wali REST API hai, jise <b>Intent API</b> kehte hain. Is chapter mein hum ise call karna seekhenge.</p>

<h3>Step 1: login karo aur token lo</h3>
<p>Catalyst Center Meraki jaisi key use nahi karta. Pehle aap <b>authentication endpoint par basic authentication (username aur password) ke saath POST</b> karte ho. Reply mein ek token aata hai. Phir har agli call ke header mein woh token bhejte ho.</p>
<ul>
<li>Authentication endpoint: <code>POST /dna/system/api/v1/auth/token</code>, basic auth ke saath.</li>
<li>Reply body: <code>{"Token": "eyJ0eXAi..."}</code>.</li>
<li>Har agli request mein header <code>X-Auth-Token: eyJ0eXAi...</code> hota hai.</li>
<li>Token limited time (lagbhag ek ghanta) ke liye valid hai. Jab call <b>401</b> de, naya token lo.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
requests.packages.urllib3.disable_warnings()
BASE = "h&#116;tps://dnac.example"

r = requests.post(BASE + "/dna/system/api/v1/auth/token",
                  auth=("admin", "YOUR_PASSWORD"), verify=False)
r.raise_for_status()
token = r.json()["Token"]

H = {"X-Auth-Token": token, "Accept": "application/json"}
devs = requests.get(BASE + "/dna/intent/api/v1/network-device", headers=H, verify=False)
for d in devs.json()["response"]:
    print(d["hostname"], d["managementIpAddress"], d["reachabilityStatus"])</pre>
<pre class="out">DSW1  10.99.0.1   <span class="hl">Reachable</span>
ASW1  10.99.0.11  Reachable
ASW2  10.99.0.12  Reachable</pre>
<p>Jawab ki shakal dekho: list <code>response</code> naam ki key ke andar hai, saath mein <code>version</code>. Zyadatar Intent API replies yahi wrapper use karte hain, isliye aapka code aam taur par <code>.json()["response"]</code> padhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Catalyst Center token flow">
<rect x="10" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Aapki script</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center</text>
<line x1="160" y1="35" x2="480" y2="35" stroke="#64748b" stroke-width="2"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="12">1. POST /dna/system/api/v1/auth/token (basic auth)</text>
<line x1="480" y1="55" x2="160" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">2. {"Token": "..."}</text>
<line x1="160" y1="105" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="12">3. GET /dna/intent/api/v1/network-device + X-Auth-Token</text>
<line x1="480" y1="125" x2="160" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">4. {"response": [ ... ], "version": "1.0"}</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Token expire ho jaye: 401 par step 1 par wapas</text>
</svg><p class="cap">Ek baar login karo, phir token ko X-Auth-Token header mein bhejo.</p></div>

<h3>Main resources</h3>
<table class="cmp"><tr><th>Kaam</th><th>Call (Intent API)</th><th>Notes</th></tr>
<tr><td>Devices list</td><td>GET /dna/intent/api/v1/network-device</td><td>Hostname, IP, platform, software, reachability. Query parameters se filter.</td></tr>
<tr><td>Devices count</td><td>GET /dna/intent/api/v1/network-device/count</td><td>List download kiye bina quick check.</td></tr>
<tr><td>Open issues</td><td>Issues resource par GET</td><td>Assurance problems, priority aur affected device ke saath. Exact path releases ke beech badalta hai, isliye apne version ki docs padho.</td></tr>
<tr><td>Path trace</td><td>POST /dna/intent/api/v1/flow-analysis, phir GET /dna/intent/api/v1/flow-analysis/{id}</td><td>Body mein source aur destination IP, aur chaho to ports aur protocol.</td></tr>
<tr><td>Templates</td><td>/dna/intent/api/v1/template-programmer/template ...</td><td>Template Programmer: variables wale CLI templates banao, version karo aur deploy karo.</td></tr>
<tr><td>Task status</td><td>GET /dna/intent/api/v1/task/{taskId}</td><td>Lambe jobs asynchronous hote hain.</td></tr></table>

<h3>Asynchronous calls: task id, phir poll</h3>
<p>List padhna turant hota hai. Path trace shuru karna ya template deploy karna turant nahi hota. Catalyst Center turant ek <b>task id</b> ke saath jawab deta hai (aur path trace ke liye <b>flowAnalysisId</b>), aur kaam background mein chalta rehta hai. Phir aap <b>poll</b> karte ho: task (ya flow-analysis) par tab tak GET karo jab tak woh finished na bole, aur result padho. Jo beginner pehle reply ko "result" maan leta hai use khali jawab dikhta hai aur lagta hai call fail ho gayi.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - path trace</span>
body = {"sourceIP": "10.20.20.22", "destIP": "172.16.50.10",
        "protocol": "TCP", "destPort": "80"}
r = requests.post(BASE + "/dna/intent/api/v1/flow-analysis", headers=H, json=body, verify=False)
fid = r.json()["response"]["flowAnalysisId"]
res = requests.get(BASE + "/dna/intent/api/v1/flow-analysis/" + fid, headers=H, verify=False)
print(res.json()["response"]["request"]["status"])      <span class="c"># INPROGRESS, phir COMPLETED</span></pre>

<h3>Template Programmer ek paragraph mein</h3>
<p><b>Template</b> variables wala CLI snippet hota hai, jaise NTP configuration jismein variable <code>ntp_server</code> ho. Aap template banate ho, ek version commit karte ho, phir chune hue devices par <b>deploy</b> karte ho aisi body ke saath jismein template id aur variables ki values hoti hain. Catalyst Center har device ke liye CLI render karta hai, push karta hai aur task result batata hai. Aise ek standard change 200 switches par bina kisi mein login kiye roll out hota hai.</p>

<h3>Simulator ka controller</h3>
<p>Lab controller (CTRL) ke shell mein ek read-only explorer hai. Yeh chhote paths use karta hai taaki jaldi padh sako: <code>center api get /api/v1/network-device</code>, <code>/api/v1/issues</code>, <code>/api/v1/network-health</code>, <code>/api/v1/template</code> aur <code>/api/v1/path-trace</code>. Asli Catalyst Center lambe <code>/dna/intent/api/v1/...</code> paths use karta hai aur pehle token maangta hai, par JSON ki shakal (<code>response</code> list jismein <code>hostname</code>, <code>reachabilityStatus</code> aur <code>priority</code> jaise fields) wahi idea hai. Lab 1 ise use karta hai.</p>
<pre class="out">CTRL&gt; center api get /api/v1/issues
{
  "response": [
    { "issueId": "#2B80", <span class="hl">"priority": "P1"</span>, "category": "Routing",
      "deviceName": "DSW1", "name": "OSPF adjacency down on Gi0/3 toward R1",
      "impacted": [ "DSW1", "R1" ] }
  ],
  "totalCount": 1
}</pre>

<div class="warn"><p><b>Common mistakes.</b> Token ko Bearer header mein bhejna (Catalyst Center <code>X-Auth-Token</code> use karta hai). <code>["response"]</code> wrapper bhool kar KeyError lena. Asynchronous call ke POST reply ko final result maan lena. Production mein certificate verification band rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authentication path <code>/dna/system/api/v1/auth/token</code> (system) hai, jabki normal resources <code>/dna/intent/api/v1/</code> (intent) ke neeche hote hain. Dono yaad rakho, aur header ka naam <code>X-Auth-Token</code> yaad rakho.</p></div>

<div class="scn"><h4>Raat ki health report</h4><p>Ek university campus team ne script likhi jo har raat 2 baje token leti, devices list karti, reachability "Unreachable" wale filter karti aur open issues padhti. Agar kuch P1 hota to issue ka naam aur affected device network team ki chat mein post kar deti. Ek mahine baad script 2:05 par 401 ke saath fail hone lagi. Wajah: engineer ne token ek file mein cache kiya tha aur kai din tak reuse kiya. Fix: har run ki shuruaat mein naya token maango (aur 401 par ek baar retry karo).</p><p><b>Lesson:</b> tokens expire hote hain; har run mein fresh token lo.</p></div>

<div class="iv"><p class="q">"Catalyst Center mein authenticate karke devices ki list kaise nikaloge?"</p><p>Basic auth ke saath /dna/system/api/v1/auth/token par POST karo, JSON se Token lo, phir header X-Auth-Token ke saath /dna/intent/api/v1/network-device par GET karo aur response list padho. Yeh batao ki token expire hota hai, lambe operations task id lautate hain jise poll karna padta hai, aur controller ki northbound API REST/JSON hai jabki southbound SSH, SNMP aur NETCONF use hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center campus controller hai; uski northbound Intent API JSON wali REST hai.</li>
<li>Login /dna/system/api/v1/auth/token par basic auth ke saath POST hai; token ko X-Auth-Token ki tarah bhejo.</li>
<li>Zyadatar replies data ko response key mein wrap karte hain; tokens expire hote hain, isliye 401 handle karo.</li>
<li>Path trace aur template deployment asynchronous hain: task ya flow id lo, phir poll karo.</li>
<li>Yaad rakhne wale resources: network-device, issues, flow-analysis (path trace), template-programmer.</li>
</ul></div>
`}};export{e as default};