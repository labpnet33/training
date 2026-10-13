var e={id:`apis`,h:{en:`APIs and automation: Management Center REST API, dynamic objects and tooling`,hi:`APIs aur automation: Management Center REST API, dynamic objects aur tooling`},body:{en:`
<p>Every integration so far was a built-in connector. Sometimes you need your own: a SOAR playbook that blocks an IP the SOC confirmed, a script that audits 400 access rules, or a pipeline that builds a new branch firewall from a template. That is what the APIs are for.</p>

<h3>An analogy: the restaurant counter and the kitchen hatch</h3>
<p>The GUI is the restaurant counter: friendly, one order at a time, a human reads the menu. The REST API is the kitchen hatch used by the delivery partners: a fixed order format, a token to prove who you are, and hundreds of orders per hour with no conversation. Same kitchen, same food, different door.</p>

<h3>Which API for which manager</h3>
<table class="cmp"><tr><th>Manager</th><th>API</th><th>Typical use</th></tr>
<tr><td>Management Center</td><td>REST API (fmc_platform, fmc_config, fmc_tid paths), API Explorer built in</td><td>Objects, policies, rules, devices, deployment, health</td></tr>
<tr><td>Device Manager (on-box)</td><td>FDM REST API on the device</td><td>Single-site automation</td></tr>
<tr><td>Security Cloud Control</td><td>Cloud API</td><td>Multi-device cloud management</td></tr>
<tr><td>Management Center events</td><td>eStreamer (not REST)</td><td>Event streaming to SIEMs (chapter 8)</td></tr></table>

<h3>Authentication on the Management Center</h3>
<p>The REST API is enabled under System → Configuration → REST API Preferences (on by default). The built-in <b>API Explorer</b> (at fmc.nwk.example/api/api-explorer) documents every resource and lets you try calls. A client first requests a token, then sends it as a header on every call.</p>
<pre class="code"><span class="c">! 1. get a token (Basic authentication with a dedicated API account)</span>
POST fmc.nwk.example/api/fmc_platform/v1/auth/generatetoken
Authorization: Basic &lt;base64 of api-soc:password&gt;</pre>
<pre class="out">HTTP/1.1 204 No Content
<span class="hl">X-auth-access-token: 3f1c9b2e-5d7a-4c11-9e0b-6a2f8d4c1e77</span>
X-auth-refresh-token: 8a4d2c19-0b6e-4f3a-b5c7-1d9e2f6a3b80
<span class="hl">DOMAIN_UUID: e276abec-e0f2-11e3-8169-6d9ed49b625f</span></pre>
<p>The access token is valid for 30 minutes and can be refreshed three times; the DOMAIN_UUID (here the Global domain) goes into every configuration path. The API is rate-limited (120 requests per minute per user), and logging in with the same account through the API ends that account's GUI session — so use a <b>dedicated API user</b> with only the role it needs.</p>

<h3>Dynamic objects: changes without Deploy</h3>
<p>Normally an object change needs a Deploy. <b>Dynamic objects</b> are different: an access rule references the object once (deployed once), and afterwards only its <b>IP mappings</b> change through the API, taking effect on the devices without a new Deploy. That makes them ideal for automation — a SOAR playbook or XDR workflow adds an IP, the firewall blocks it seconds later. The <b>Cisco Secure Dynamic Attributes Connector</b> uses the same mechanism to fill dynamic objects from cloud and virtualisation tags (for example all VMs tagged "web" in a vCenter or a public cloud).</p>
<pre class="code"><span class="c">! 2. add an IP to the dynamic object used by the top rule "Block-SOC-List"</span>
POST fmc.nwk.example/api/fmc_config/v1/domain/e276abec-e0f2-11e3-8169-6d9ed49b625f/object/dynamicobjectmappings
X-auth-access-token: 3f1c9b2e-5d7a-4c11-9e0b-6a2f8d4c1e77
Content-Type: application/json

{ "add": [ { "dynamicObject": { "name": "SOC-Block-Dynamic" },
             "mappings": [ "198.51.100.200" ] } ] }</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Automation with dynamic objects">
<rect x="10" y="80" width="140" height="55" rx="8" fill="#bae6fd"/><text x="80" y="103" text-anchor="middle" class="svg-ink" font-size="13">SOAR / XDR</text><text x="80" y="121" text-anchor="middle" class="svg-muted" font-size="12">playbook</text>
<rect x="220" y="80" width="170" height="55" rx="8" fill="#ddd6fe"/><text x="305" y="103" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="305" y="121" text-anchor="middle" class="svg-muted" font-size="12">REST API</text>
<rect x="460" y="80" width="170" height="55" rx="8" fill="#fed7aa"/><text x="545" y="103" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="545" y="121" text-anchor="middle" class="svg-muted" font-size="12">rule Block-SOC-List</text>
<line x1="150" y1="107" x2="220" y2="107" stroke="#64748b" stroke-width="2"/><text x="185" y="95" text-anchor="middle" class="svg-accent" font-size="12">token</text>
<line x1="390" y1="107" x2="460" y2="107" stroke="#64748b" stroke-width="2"/><text x="425" y="95" text-anchor="middle" class="svg-accent" font-size="12">mapping</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">rule deployed once; IP mappings change later without Deploy</text>
</svg><p class="cap">The playbook authenticates, adds an IP mapping, and the already-deployed rule enforces it.</p></div>

<h3>Tooling you will meet</h3>
<ul>
<li><b>Python</b> with a REST library — the most common for audits and one-off jobs.</li>
<li><b>Ansible</b> (Cisco's Management Center collection) — declarative tasks for objects, rules and deployment.</li>
<li><b>Terraform</b> (the Management Center provider) — infrastructure as code for whole policies, with plan-before-apply.</li>
<li><b>Deployment API</b> — after configuration changes through the API you still trigger a Deploy (deploymentrequests) for normal objects and rules.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The SOC confirms that 198.51.100.200 is scanning the VPN portal. Their SOAR playbook calls generatetoken, then posts the mapping above. The rule Block-SOC-List at the top of NK-ACP (source or destination SOC-Block-Dynamic, action Block) was deployed last month; FTD1 starts dropping the address about ten seconds after the API call. Total human effort: one click to approve the playbook.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using the admin account for scripts, so every script run logs the engineer out of the GUI. Hard-coding passwords in scripts instead of a vault. Forgetting the DOMAIN_UUID or using a child domain's UUID by mistake. Calling the API in a tight loop and hitting the rate limit (HTTP 429). Expecting normal network-object edits to apply without a Deploy.</p></div>

<div class="exam"><p><b>Exam trap.</b> Token header name: X-auth-access-token. Token lifetime: 30 minutes, three refreshes. Events are streamed with eStreamer, not the REST API. Dynamic object mapping changes do not need a Deploy; the rule that references the object does, once.</p></div>

<div class="scn"><h4>The script that logged everyone out</h4><p>A team wrote a nightly audit script that pulled all access rules using the shared admin account. Every night at 02:00 the on-call engineer working in the GUI was suddenly logged out, mid-change. Investigation showed the script's token request with the same account ended the GUI session. They created an api-audit user with a read-only role, moved the password into the vault, and added a delay between calls to stay under 120 requests per minute.</p><p><b>Lesson:</b> automation is a user too. Give it its own account, the least privilege, and polite behaviour.</p></div>

<div class="iv"><p class="q">"How would you let your SOAR platform block an IP on Secure Firewall in seconds, without Deploys?"</p><p>Strong answer: create a dynamic object and reference it in a Block rule at the top of the access control policy, deploy that once. The SOAR platform authenticates to the Management Center REST API (generatetoken, X-auth-access-token, DOMAIN_UUID) with a dedicated least-privilege user and adds or removes IP mappings on the dynamic object; mapping changes take effect without Deploy. Mention rate limits, token refresh, and an expiry or review process so the list does not grow forever.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management Center REST API: token from generatetoken, header X-auth-access-token, DOMAIN_UUID in paths.</li>
<li>Tokens last 30 minutes with three refreshes; about 120 requests per minute per user.</li>
<li>Use a dedicated least-privilege API account; never the GUI admin.</li>
<li>Dynamic object mappings change enforcement without Deploy — ideal for SOAR and XDR.</li>
<li>Python, Ansible and Terraform automate policy; eStreamer, not REST, streams events.</li>
</ul></div>
`,hi:`
<p>Ab tak ka har integration ek built-in connector tha. Kabhi kabhi aapko apna chahiye: ek SOAR playbook jo SOC dwara confirm kiya IP block kare, ek script jo 400 access rules audit kare, ya ek pipeline jo template se naya branch firewall banaye. APIs isi ke liye hain.</p>

<h3>Ek analogy: restaurant counter aur kitchen ki khidki</h3>
<p>GUI restaurant ka counter hai: friendly, ek waqt mein ek order, insaan menu padhta hai. REST API kitchen ki woh khidki hai jo delivery partners use karte hain: fixed order format, kaun ho yeh saabit karne ke liye token, aur bina baatcheet ke ghante mein sainkdon orders. Wahi kitchen, wahi khana, alag darwaza.</p>

<h3>Kis manager ke liye kaunsi API</h3>
<table class="cmp"><tr><th>Manager</th><th>API</th><th>Typical use</th></tr>
<tr><td>Management Center</td><td>REST API (fmc_platform, fmc_config, fmc_tid paths), API Explorer built in</td><td>Objects, policies, rules, devices, deployment, health</td></tr>
<tr><td>Device Manager (on-box)</td><td>Device par FDM REST API</td><td>Single-site automation</td></tr>
<tr><td>Security Cloud Control</td><td>Cloud API</td><td>Multi-device cloud management</td></tr>
<tr><td>Management Center events</td><td>eStreamer (REST nahi)</td><td>SIEMs tak event streaming (chapter 8)</td></tr></table>

<h3>Management Center par authentication</h3>
<p>REST API System → Configuration → REST API Preferences mein enabled hoti hai (default on). Built-in <b>API Explorer</b> (fmc.nwk.example/api/api-explorer par) har resource document karta hai aur calls try karne deta hai. Client pehle token request karta hai, phir har call par use header ki tarah bhejta hai.</p>
<pre class="code"><span class="c">! 1. token lo (dedicated API account ke saath Basic authentication)</span>
POST fmc.nwk.example/api/fmc_platform/v1/auth/generatetoken
Authorization: Basic &lt;base64 of api-soc:password&gt;</pre>
<pre class="out">HTTP/1.1 204 No Content
<span class="hl">X-auth-access-token: 3f1c9b2e-5d7a-4c11-9e0b-6a2f8d4c1e77</span>
X-auth-refresh-token: 8a4d2c19-0b6e-4f3a-b5c7-1d9e2f6a3b80
<span class="hl">DOMAIN_UUID: e276abec-e0f2-11e3-8169-6d9ed49b625f</span></pre>
<p>Access token 30 minute valid rehta hai aur teen baar refresh ho sakta hai; DOMAIN_UUID (yahan Global domain) har configuration path mein jaata hai. API rate-limited hai (har user 120 requests per minute), aur API se same account se login karne par us account ka GUI session khatam ho jaata hai — isliye sirf zaroori role wala <b>dedicated API user</b> use karo.</p>

<h3>Dynamic objects: bina Deploy ke changes</h3>
<p>Normally object change ko Deploy chahiye. <b>Dynamic objects</b> alag hain: access rule object ko ek baar refer karti hai (ek baar deploy), aur uske baad sirf uski <b>IP mappings</b> API se badalti hain, jo bina naye Deploy ke devices par lagu hoti hain. Isliye yeh automation ke liye ideal hain — SOAR playbook ya XDR workflow ek IP jodta hai, firewall seconds baad use block karta hai. <b>Cisco Secure Dynamic Attributes Connector</b> isi mechanism se cloud aur virtualisation tags se dynamic objects bharta hai (jaise vCenter ya public cloud mein "web" tag wali saari VMs).</p>
<pre class="code"><span class="c">! 2. top rule "Block-SOC-List" mein use hone wale dynamic object mein IP jodo</span>
POST fmc.nwk.example/api/fmc_config/v1/domain/e276abec-e0f2-11e3-8169-6d9ed49b625f/object/dynamicobjectmappings
X-auth-access-token: 3f1c9b2e-5d7a-4c11-9e0b-6a2f8d4c1e77
Content-Type: application/json

{ "add": [ { "dynamicObject": { "name": "SOC-Block-Dynamic" },
             "mappings": [ "198.51.100.200" ] } ] }</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Dynamic objects ke saath automation">
<rect x="10" y="80" width="140" height="55" rx="8" fill="#bae6fd"/><text x="80" y="103" text-anchor="middle" class="svg-ink" font-size="13">SOAR / XDR</text><text x="80" y="121" text-anchor="middle" class="svg-muted" font-size="12">playbook</text>
<rect x="220" y="80" width="170" height="55" rx="8" fill="#ddd6fe"/><text x="305" y="103" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="305" y="121" text-anchor="middle" class="svg-muted" font-size="12">REST API</text>
<rect x="460" y="80" width="170" height="55" rx="8" fill="#fed7aa"/><text x="545" y="103" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="545" y="121" text-anchor="middle" class="svg-muted" font-size="12">rule Block-SOC-List</text>
<line x1="150" y1="107" x2="220" y2="107" stroke="#64748b" stroke-width="2"/><text x="185" y="95" text-anchor="middle" class="svg-accent" font-size="12">token</text>
<line x1="390" y1="107" x2="460" y2="107" stroke="#64748b" stroke-width="2"/><text x="425" y="95" text-anchor="middle" class="svg-accent" font-size="12">mapping</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">rule ek baar deploy; IP mappings baad mein bina Deploy badalti hain</text>
</svg><p class="cap">Playbook authenticate karta hai, IP mapping jodta hai, aur pehle se deployed rule use enforce karti hai.</p></div>

<h3>Tooling jo aapko milegi</h3>
<ul>
<li>REST library ke saath <b>Python</b> — audits aur one-off jobs ke liye sabse common.</li>
<li><b>Ansible</b> (Cisco ka Management Center collection) — objects, rules aur deployment ke liye declarative tasks.</li>
<li><b>Terraform</b> (Management Center provider) — poori policies ke liye infrastructure as code, apply se pehle plan ke saath.</li>
<li><b>Deployment API</b> — API se configuration changes ke baad bhi normal objects aur rules ke liye Deploy trigger karna padta hai (deploymentrequests).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> SOC confirm karta hai ki 198.51.100.200 VPN portal scan kar raha hai. Unka SOAR playbook generatetoken call karta hai, phir upar wali mapping post karta hai. NK-ACP ke top par rule Block-SOC-List (source ya destination SOC-Block-Dynamic, action Block) pichhle mahine deploy hui thi; FTD1 API call ke lagbhag das second baad address drop karna shuru kar deta hai. Kul human effort: playbook approve karne ke liye ek click.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Scripts ke liye admin account use karna, jisse har script run engineer ko GUI se logout kar deta hai. Vault ki jagah scripts mein passwords hard-code karna. DOMAIN_UUID bhoolna ya galti se child domain ka UUID use karna. API ko tight loop mein call karke rate limit hit karna (HTTP 429). Normal network-object edits bina Deploy lagu hone ki ummeed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Token header ka naam: X-auth-access-token. Token lifetime: 30 minute, teen refreshes. Events eStreamer se stream hote hain, REST API se nahi. Dynamic object mapping changes ko Deploy nahi chahiye; object refer karne wali rule ko chahiye, ek baar.</p></div>

<div class="scn"><h4>Woh script jisne sabko logout kar diya</h4><p>Ek team ne nightly audit script likhi jo shared admin account se saare access rules kheenchti thi. Har raat 02:00 baje GUI mein kaam kar raha on-call engineer achanak change ke beech logout ho jaata tha. Investigation se pata chala ki same account se script ki token request GUI session khatam kar deti thi. Unhone read-only role wala api-audit user banaya, password vault mein daala, aur 120 requests per minute ke neeche rehne ke liye calls ke beech delay joda.</p><p><b>Seekh:</b> automation bhi ek user hai. Use apna account, least privilege, aur tameez wala behaviour do.</p></div>

<div class="iv"><p class="q">"Aap apne SOAR platform ko bina Deploys ke seconds mein Secure Firewall par IP block karne kaise doge?"</p><p>Strong answer: ek dynamic object banao aur access control policy ke top par Block rule mein use refer karo, use ek baar deploy karo. SOAR platform dedicated least-privilege user ke saath Management Center REST API par authenticate karta hai (generatetoken, X-auth-access-token, DOMAIN_UUID) aur dynamic object par IP mappings add ya remove karta hai; mapping changes bina Deploy lagu hote hain. Rate limits, token refresh, aur ek expiry ya review process ka zikr karo taaki list hamesha badhti na rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management Center REST API: generatetoken se token, header X-auth-access-token, paths mein DOMAIN_UUID.</li>
<li>Tokens 30 minute chalte hain, teen refreshes; har user lagbhag 120 requests per minute.</li>
<li>Dedicated least-privilege API account use karo; kabhi GUI admin nahi.</li>
<li>Dynamic object mappings bina Deploy enforcement badalti hain — SOAR aur XDR ke liye ideal.</li>
<li>Python, Ansible aur Terraform policy automate karte hain; events eStreamer stream karta hai, REST nahi.</li>
</ul></div>
`}};export{e as default};