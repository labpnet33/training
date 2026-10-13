var e={id:`summary-checklist`,h:{en:`Summary and exam checklist: which API for which job`,hi:`Summary aur exam checklist: kaunsi API kis kaam ke liye`},body:{en:`
<p>This last chapter is your revision sheet for domain 3. Read the decision table first, then tick the can-do list, then learn the glossary and the most-tested facts.</p>

<h3>Which API for which job</h3>
<table class="cmp"><tr><th>The job</th><th>Platform</th><th>How you call it</th></tr>
<tr><td>List and rename cloud-managed switches, APs, appliances; get alerts</td><td>Meraki Dashboard</td><td>REST, Bearer API key, organization to network to device serial; webhooks for alerts</td></tr>
<tr><td>Inventory, health, issues and path trace on a campus network; push CLI templates</td><td>Catalyst Center</td><td>POST basic auth for a token, then X-Auth-Token; /dna/intent/api/v1/...</td></tr>
<tr><td>Create tenants, EPGs, bridge domains in a data center fabric</td><td>ACI APIC</td><td>aaaLogin and cookie; class query (/api/class) or DN query (/api/mo); imdata</td></tr>
<tr><td>Check WAN edge status, alarms and templates</td><td>Catalyst SD-WAN Manager</td><td>j_security_check session, X-XSRF-TOKEN for changes; /dataservice</td></tr>
<tr><td>Provision one service across several vendors, with preview and undo</td><td>NSO</td><td>RESTCONF or NETCONF on YANG models; dry-run, commit, rollback</td></tr>
<tr><td>Fleet-wide server inventory, firmware and policies from the cloud</td><td>Intersight</td><td>REST + OData, signed requests with an API key pair</td></tr>
<tr><td>Manage servers behind fabric interconnects (one domain)</td><td>UCS Manager</td><td>XML API at /nuova, aaaLogin cookie, configResolveClass</td></tr>
<tr><td>Chain tasks into a workflow for converged infrastructure</td><td>UCS Director</td><td>Workflow orchestration, API key header (concept)</td></tr>
<tr><td>Chat bot, post messages, react to mentions</td><td>Webex REST</td><td>Bearer bot token, /v1/messages, webhooks send IDs</td></tr>
<tr><td>Control or read a room device (dial, volume, status)</td><td>Webex Devices xAPI</td><td>xCommand, xStatus, xConfiguration, xEvent; macros</td></tr>
<tr><td>Add or change phones and users in Unified CM</td><td>AXL</td><td>SOAP/XML over HTTPS, /axl/, basic auth</td></tr>
<tr><td>End-user lookups and self-care in Unified CM</td><td>UDS</td><td>Light REST</td></tr>
<tr><td>Show agent state and calls in a custom desktop</td><td>Finesse</td><td>REST plus notifications; gadgets on the desktop</td></tr>
<tr><td>Correlate threat evidence and respond</td><td>XDR</td><td>OAuth 2.0 client credentials; observables, enrich, respond</td></tr>
<tr><td>Create firewall objects and policies, then push live</td><td>FMC</td><td>generatetoken (token in headers), domain UUID in URL, deployment</td></tr>
<tr><td>Find hosts, read detections, isolate a host</td><td>Secure Endpoint</td><td>Basic auth, client ID and API key; /v3/computers, /v3/events</td></tr>
<tr><td>Manage endpoints, groups, network devices in the identity engine</td><td>ISE</td><td>ERS API, basic auth, JSON Accept and Content-Type</td></tr>
<tr><td>Analyse a suspicious file, get a threat score</td><td>Secure Malware Analytics</td><td>REST with API key, upload a sample</td></tr>
<tr><td>Block a domain, read DNS reports</td><td>Umbrella / Secure Access</td><td>OAuth 2.0 client credentials, destination lists, reports</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>I can say what an SDK gives (auth, paging, retry, typed errors) and what it costs (dependency, lag, hidden requests).</li>
<li>I can drill down Meraki from organization to network to device serial with a Bearer key, and I know webhooks push alerts.</li>
<li>I can get a Catalyst Center token, call network-device, and explain why path trace and templates are asynchronous.</li>
<li>I can tell a class query from a DN query in ACI and log in with aaaLogin.</li>
<li>I can describe the SD-WAN Manager login: session cookie plus XSRF token.</li>
<li>I can explain NSO: YANG, NEDs, service models, dry-run, commit and rollback.</li>
<li>I can match Intersight, UCS Manager and UCS Director to their API styles.</li>
<li>I can build a Webex bot flow, and I can name the four xAPI word types and the AXL/UDS difference.</li>
<li>I can name the authentication method for FMC, ISE, Secure Endpoint, XDR and Umbrella.</li>
<li>I can build a call from documentation using the five parts and debug it from the status code.</li>
<li>I can explain Always-On versus reservable DevNet sandboxes.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SDK</dt><dd>A library that wraps an API so you call methods instead of raw HTTP.</dd>
<dt>Northbound / southbound</dt><dd>Controller interfaces towards users and scripts / towards the devices.</dd>
<dt>Intent API</dt><dd>Catalyst Center's northbound REST API.</dd>
<dt>MIT, MO, DN</dt><dd>ACI's tree, its objects, and an object's full unique path.</dd>
<dt>NED</dt><dd>NSO's driver for one vendor's devices.</dd>
<dt>FASTMAP</dt><dd>NSO's method that records what a service created so updates and deletes are automatic.</dd>
<dt>Moid</dt><dd>Intersight's unique object identifier.</dd>
<dt>Webhook</dt><dd>The platform calls your receiver when an event happens, instead of you polling.</dd>
<dt>xAPI</dt><dd>The command and status layer on Webex room devices.</dd>
<dt>AXL</dt><dd>Unified CM's SOAP administration API.</dd>
<dt>ERS</dt><dd>ISE's REST API for managing its objects.</dd>
<dt>Observable</dt><dd>An XDR evidence item with a type and a value.</dd>
<dt>Idempotent</dt><dd>Repeating the call leaves the same result.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Catalyst Center: POST /dna/system/api/v1/auth/token (basic auth), header X-Auth-Token, resources under /dna/intent/api/v1/, list in "response".</li>
<li>Meraki: Authorization Bearer API key on every call; devices by serial; 429 with Retry-After.</li>
<li>ACI: aaaLogin; /api/class/NAME.json versus /api/mo/DN.json; results in imdata.</li>
<li>SD-WAN: /j_security_check, then /dataservice/client/token; X-XSRF-TOKEN on POST, PUT, DELETE.</li>
<li>NSO: RESTCONF and NETCONF; dry-run, commit, rollback; NEDs and YANG service models.</li>
<li>Intersight: signed requests, OData $filter; UCS Manager: XML, aaaLogin, cookie.</li>
<li>Webex: Bearer token, rooms and messages, webhook contains IDs only, bot token does not expire quickly.</li>
<li>FMC: token in response headers, domain UUID in URL, deploy to apply.</li>
<li>406/415 = headers; 400 = body or path; 401 = credentials; 403 = permission; 429 = rate limit.</li>
</ul>

<div class="warn"><p><b>Last-minute mistakes.</b> Mixing up header names (X-Auth-Token versus Bearer versus X-auth-access-token). Mixing up the wrapper keys (response, imdata, data, items). Saying an SDK replaces the REST API.</p></div>
<div class="exam"><p><b>Exam trap.</b> When two answers both look possible, the one that names the platform's real login step and object model is usually right. Reject answers that give a Meraki-style key to a platform that needs a token first.</p></div>

<div class="scn"><h4>The pre-exam whiteboard test</h4><p>A study group drew the table above from memory on a whiteboard: platform, job, login. They scored each other: one point for the right login sentence, one for the right object names, one for the wrapper key. After two rounds, every member could give all three for the eight most common platforms without looking. Their practice-exam score in domain 3 went from 60% to 90%.</p><p><b>Lesson:</b> active recall of login, objects and wrapper keys beats re-reading.</p></div>

<div class="iv"><p class="q">"Pick any three Cisco platforms and compare how you authenticate and what you can automate."</p><p>For example: Meraki uses a Bearer API key and automates branch switches, Wi-Fi and alerts; Catalyst Center uses a token from a basic-auth POST and automates inventory, assurance and templates; ACI uses aaaLogin with a cookie and automates fabric policy through class and DN queries. Finish with when you would use an SDK and how you would test on a sandbox first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 3 = choose the right platform and build the right call.</li>
<li>Learn each platform by four questions: manages, login, objects, call.</li>
<li>Know the login sentence and wrapper key for each platform.</li>
<li>Debug with status code, five parts, one change at a time, proof from two sources.</li>
<li>Practise on Always-On and reservable DevNet sandboxes.</li>
</ul></div>
`,hi:`
<p>Yeh aakhri chapter domain 3 ke liye aapki revision sheet hai. Pehle decision table padho, phir can-do list tick karo, phir glossary aur sabse zyada poochhe jaane wale facts seekho.</p>

<h3>Kaunsi API kis kaam ke liye</h3>
<table class="cmp"><tr><th>Kaam</th><th>Platform</th><th>Call kaise karein</th></tr>
<tr><td>Cloud-managed switches, APs, appliances ki list aur rename; alerts</td><td>Meraki Dashboard</td><td>REST, Bearer API key, organization se network se device serial; alerts ke liye webhooks</td></tr>
<tr><td>Campus network ka inventory, health, issues aur path trace; CLI templates push</td><td>Catalyst Center</td><td>Token ke liye basic auth POST, phir X-Auth-Token; /dna/intent/api/v1/...</td></tr>
<tr><td>Data center fabric mein tenants, EPGs, bridge domains banana</td><td>ACI APIC</td><td>aaaLogin aur cookie; class query (/api/class) ya DN query (/api/mo); imdata</td></tr>
<tr><td>WAN edge ka status, alarms aur templates dekhna</td><td>Catalyst SD-WAN Manager</td><td>j_security_check session, changes ke liye X-XSRF-TOKEN; /dataservice</td></tr>
<tr><td>Kai vendors par ek service preview aur undo ke saath provision karna</td><td>NSO</td><td>YANG models par RESTCONF ya NETCONF; dry-run, commit, rollback</td></tr>
<tr><td>Cloud se poore fleet ka server inventory, firmware aur policies</td><td>Intersight</td><td>REST + OData, API key pair se signed requests</td></tr>
<tr><td>Fabric interconnects ke peeche servers manage karna (ek domain)</td><td>UCS Manager</td><td>/nuova par XML API, aaaLogin cookie, configResolveClass</td></tr>
<tr><td>Converged infrastructure ke liye tasks ko workflow mein jodna</td><td>UCS Director</td><td>Workflow orchestration, API key header (concept)</td></tr>
<tr><td>Chat bot, messages post karna, mention par react karna</td><td>Webex REST</td><td>Bearer bot token, /v1/messages, webhooks IDs bhejte hain</td></tr>
<tr><td>Room device control ya read karna (dial, volume, status)</td><td>Webex Devices xAPI</td><td>xCommand, xStatus, xConfiguration, xEvent; macros</td></tr>
<tr><td>Unified CM mein phones aur users add ya change karna</td><td>AXL</td><td>HTTPS par SOAP/XML, /axl/, basic auth</td></tr>
<tr><td>Unified CM mein end-user lookups aur self-care</td><td>UDS</td><td>Halki REST</td></tr>
<tr><td>Custom desktop mein agent state aur calls dikhana</td><td>Finesse</td><td>REST plus notifications; desktop par gadgets</td></tr>
<tr><td>Threat evidence correlate karna aur respond karna</td><td>XDR</td><td>OAuth 2.0 client credentials; observables, enrich, respond</td></tr>
<tr><td>Firewall objects aur policies banana, phir live push</td><td>FMC</td><td>generatetoken (token headers mein), URL mein domain UUID, deployment</td></tr>
<tr><td>Hosts dhoondhna, detections padhna, host isolate karna</td><td>Secure Endpoint</td><td>Basic auth, client ID aur API key; /v3/computers, /v3/events</td></tr>
<tr><td>Identity engine mein endpoints, groups, network devices manage karna</td><td>ISE</td><td>ERS API, basic auth, JSON Accept aur Content-Type</td></tr>
<tr><td>Suspicious file analyse karna, threat score lena</td><td>Secure Malware Analytics</td><td>API key wali REST, sample upload</td></tr>
<tr><td>Domain block karna, DNS reports padhna</td><td>Umbrella / Secure Access</td><td>OAuth 2.0 client credentials, destination lists, reports</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>Main bata sakta hoon ki SDK kya deta hai (auth, paging, retry, typed errors) aur uski keemat kya hai (dependency, lag, chhupi requests).</li>
<li>Main Bearer key se Meraki mein organization se network se device serial tak drill down kar sakta hoon, aur jaanta hoon ki webhooks alerts push karte hain.</li>
<li>Main Catalyst Center token le sakta hoon, network-device call kar sakta hoon, aur samjha sakta hoon ki path trace aur templates asynchronous kyun hain.</li>
<li>Main ACI mein class query aur DN query mein farak bata sakta hoon aur aaaLogin se login kar sakta hoon.</li>
<li>Main SD-WAN Manager login describe kar sakta hoon: session cookie plus XSRF token.</li>
<li>Main NSO samjha sakta hoon: YANG, NEDs, service models, dry-run, commit aur rollback.</li>
<li>Main Intersight, UCS Manager aur UCS Director ko unke API styles se match kar sakta hoon.</li>
<li>Main Webex bot flow bana sakta hoon, aur xAPI ke chaar word types aur AXL/UDS ka farak bata sakta hoon.</li>
<li>Main FMC, ISE, Secure Endpoint, XDR aur Umbrella ka authentication method bata sakta hoon.</li>
<li>Main paanch hisson se documentation se call bana sakta hoon aur status code se debug kar sakta hoon.</li>
<li>Main Always-On aur reservable DevNet sandboxes ka farak samjha sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SDK</dt><dd>Library jo API ko wrap karti hai taaki raw HTTP ki jagah methods call karo.</dd>
<dt>Northbound / southbound</dt><dd>Controller ke interfaces users aur scripts ki taraf / devices ki taraf.</dd>
<dt>Intent API</dt><dd>Catalyst Center ki northbound REST API.</dd>
<dt>MIT, MO, DN</dt><dd>ACI ka tree, uske objects, aur object ka poora unique path.</dd>
<dt>NED</dt><dd>Ek vendor ke devices ke liye NSO ka driver.</dd>
<dt>FASTMAP</dt><dd>NSO ka tareeka jo record karta hai ki service ne kya banaya taaki updates aur deletes automatic hon.</dd>
<dt>Moid</dt><dd>Intersight ka unique object identifier.</dd>
<dt>Webhook</dt><dd>Event hone par platform aapke receiver ko call karta hai, aap poll nahi karte.</dd>
<dt>xAPI</dt><dd>Webex room devices par command aur status layer.</dd>
<dt>AXL</dt><dd>Unified CM ki SOAP administration API.</dd>
<dt>ERS</dt><dd>ISE ki apne objects manage karne wali REST API.</dd>
<dt>Observable</dt><dd>XDR ka evidence item jiska type aur value hoti hai.</dd>
<dt>Idempotent</dt><dd>Call dohrane se result wahi rehta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Catalyst Center: POST /dna/system/api/v1/auth/token (basic auth), header X-Auth-Token, resources /dna/intent/api/v1/ ke neeche, list "response" mein.</li>
<li>Meraki: har call par Authorization Bearer API key; devices serial se; Retry-After ke saath 429.</li>
<li>ACI: aaaLogin; /api/class/NAME.json versus /api/mo/DN.json; results imdata mein.</li>
<li>SD-WAN: /j_security_check, phir /dataservice/client/token; POST, PUT, DELETE par X-XSRF-TOKEN.</li>
<li>NSO: RESTCONF aur NETCONF; dry-run, commit, rollback; NEDs aur YANG service models.</li>
<li>Intersight: signed requests, OData $filter; UCS Manager: XML, aaaLogin, cookie.</li>
<li>Webex: Bearer token, rooms aur messages, webhook mein sirf IDs, bot token jaldi expire nahi hota.</li>
<li>FMC: token response headers mein, domain UUID URL mein, apply karne ko deploy.</li>
<li>406/415 = headers; 400 = body ya path; 401 = credentials; 403 = permission; 429 = rate limit.</li>
</ul>

<div class="warn"><p><b>Aakhri waqt ki galtiyan.</b> Header names mila dena (X-Auth-Token versus Bearer versus X-auth-access-token). Wrapper keys mila dena (response, imdata, data, items). Yeh kehna ki SDK REST API ki jagah le leta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab do answers dono possible lagen, aksar wahi sahi hota hai jo platform ka asli login step aur object model batata hai. Aise answers reject karo jo Meraki-style key us platform ko dete hain jise pehle token chahiye.</p></div>

<div class="scn"><h4>Exam se pehle whiteboard test</h4><p>Ek study group ne upar wali table yaad se whiteboard par banayi: platform, kaam, login. Unhone ek doosre ko score kiya: sahi login vaakya ka ek point, sahi object naamon ka ek, wrapper key ka ek. Do rounds ke baad har member aath sabse common platforms ke teeno bina dekhe bata sakta tha. Domain 3 mein unka practice-exam score 60% se 90% ho gaya.</p><p><b>Lesson:</b> login, objects aur wrapper keys ka active recall dobara padhne se behtar hai.</p></div>

<div class="iv"><p class="q">"Koi bhi teen Cisco platforms chuno aur compare karo ki authenticate kaise karte ho aur kya automate kar sakte ho."</p><p>Jaise: Meraki Bearer API key use karta hai aur branch switches, Wi-Fi aur alerts automate karta hai; Catalyst Center basic-auth POST se mile token ko use karta hai aur inventory, assurance aur templates automate karta hai; ACI cookie ke saath aaaLogin use karta hai aur class aur DN queries se fabric policy automate karta hai. Ant mein batao ki SDK kab use karoge aur pehle sandbox par test kaise karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 3 = sahi platform chuno aur sahi call banao.</li>
<li>Har platform chaar sawaalon se seekho: kya manage, login, objects, call.</li>
<li>Har platform ka login vaakya aur wrapper key jaano.</li>
<li>Debug: status code, paanch hisse, ek baar mein ek change, do sources se proof.</li>
<li>Always-On aur reservable DevNet sandboxes par practice karo.</li>
</ul></div>
`}};export{e as default};