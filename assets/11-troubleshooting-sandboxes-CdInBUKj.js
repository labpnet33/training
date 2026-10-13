var e={id:`troubleshooting-sandboxes`,h:{en:`Troubleshooting workflow (Lab 1 and Lab 2) and DevNet sandboxes`,hi:`Troubleshooting workflow (Lab 1 aur Lab 2) aur DevNet sandboxes`},body:{en:`
<p>When an automation job fails there are always two possible places for the fault: the <b>API side</b> (your call is wrong, your token expired, the platform is down) or the <b>network side</b> (the thing the platform reports on is really broken). Good engineers decide which one it is before they change anything. This chapter gives one workflow for both, walks through both labs with it, and then shows where to practise safely: the DevNet sandboxes.</p>

<h3>The workflow: API first, then network, then proof</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Reproduce</text><text x="80" y="66" text-anchor="middle" class="svg-muted" font-size="12">one call, one result</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 Read the code</text><text x="240" y="66" text-anchor="middle" class="svg-muted" font-size="12">status + body</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 Five parts</text><text x="400" y="66" text-anchor="middle" class="svg-muted" font-size="12">method, URL, headers, body</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 API ok?</text><text x="560" y="66" text-anchor="middle" class="svg-muted" font-size="12">then read the data</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="110" width="220" height="60" rx="8" fill="#fed7aa"/><text x="200" y="136" text-anchor="middle" class="svg-ink" font-size="13">5 Fix the network cause</text><text x="200" y="156" text-anchor="middle" class="svg-muted" font-size="12">on the device, not in the script</text>
<rect x="340" y="110" width="220" height="60" rx="8" fill="#e2e8f0"/><text x="450" y="136" text-anchor="middle" class="svg-ink" font-size="13">6 Prove it twice</text><text x="450" y="156" text-anchor="middle" class="svg-muted" font-size="12">API says healthy, CLI agrees</text>
<line x1="560" y1="80" x2="450" y2="110" stroke="#64748b" stroke-width="2"/><line x1="310" y1="140" x2="340" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">If the API call is fine, the data it returns is the evidence for the network.</p></div>
<ol>
<li><b>Reproduce</b> with a single call. Do not loop over 200 devices to find a bug.</li>
<li><b>Read the code and the body.</b> Status code first; then the error text in the body.</li>
<li><b>Check the five parts</b> (method, URL, headers, body, reply). Fix one thing per run.</li>
<li><b>When the call succeeds</b>, the API is telling you the truth about the network. Read it carefully: it is your evidence.</li>
<li><b>Fix the cause where it lives</b>: on the device, with the CLI or a template, not by editing the report script.</li>
<li><b>Prove it twice</b>: the API now shows healthy, and the device CLI shows the same.</li>
</ol>

<h3>Lab 1: read the controller REST API and find the fault</h3>
<p><b>Situation.</b> The Pune campus has a new controller, CTRL. The ticket asks: which devices does it know, and what does its issues API say is broken? You only have the northbound REST explorer and the device CLIs.</p>
<p><b>Step 1: discover and count.</b> The controller knows nothing until it discovers devices. After <code>center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro</code>, call the inventory API.</p>
<pre class="out">CTRL&gt; center api get /api/v1/network-device
GET /api/v1/network-device  -&gt;  200 OK
{ "response": [ { "hostname": "DSW1", ... "reachabilityStatus": "Reachable" },
                { "hostname": "ASW1", ... }, { "hostname": "ASW2", ... } ], "version": "1.0" }</pre>
<p>Three devices. Where is R1? It sits behind a link that is not working yet, so the discovery could not reach it. A missing device in the inventory API is already a clue.</p>
<p><b>Step 2: read the issues API.</b></p>
<pre class="out">CTRL&gt; center api get /api/v1/issues
{ "response": [ { "issueId": "#2B80", <span class="hl">"priority": "P1"</span>, "category": "Routing",
                  "deviceName": "DSW1", "name": "OSPF adjacency down on Gi0/3 toward R1",
                  "impacted": [ "DSW1", "R1" ] }, ... ] }</pre>
<p>The P1 names a device pair (DSW1 and R1) and a protocol (OSPF). The API has told you <b>where to look</b>; it has not told you why. That part is on the devices.</p>
<p><b>Step 3: find the cause on the devices.</b> On R1, <code>show ip ospf interface brief</code> shows its link to DSW1 in area 1, while DSW1 has the same link in area 0. OSPF neighbours must agree on the area, so no adjacency forms. Fix R1, keeping the loopback and LAN network statements as they are:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# no network 10.0.0.0 0.0.0.3 area 1
R1(config-router)# network 10.0.0.0 0.0.0.3 area 0</pre>
<p><b>Step 4: bring R1 into the inventory.</b> Discover its loopback with <code>center discover 10.255.0.1 cli netadmin NK@dmin1 snmp nkro</code>, then call the inventory API again: four devices.</p>
<p><b>Step 5: prove it.</b> <code>center api get /api/v1/network-health</code> must show <code>"healthScore": 100</code> and <code>center pathtrace PC2 SRV</code> must complete. The API and the path trace agree with the CLI: OSPF FULL on DSW1.</p>

<h3>Lab 2 in the same workflow</h3>
<p>Lab 2 is the "API side" case. Reproduce (one run), read the code (406), check the five parts (the Accept header), fix one thing, run again (400), check the five parts (URL path and encoding), fix, run (204), then prove it twice: a GET in the script reads the label back, and the router CLI (<code>show interfaces description</code>) shows it. Two labs, one habit: <b>status code, five parts, one change at a time, proof from a second source.</b></p>

<h3>DevNet sandboxes: where to practise</h3>
<p>You cannot learn Webex or ACI by reading only. Cisco's DevNet program offers <b>sandboxes</b>: ready-made lab environments you use for free, with real platforms and sample data. There are two kinds, and the exam asks you to tell them apart.</p>
<table class="cmp"><tr><th></th><th>Always-On sandbox</th><th>Reservable sandbox</th></tr>
<tr><td>Availability</td><td>Running all the time; use it any moment, no booking</td><td>You book a time slot (for example a few hours or days) and wait for it to be built for you</td></tr>
<tr><td>Who shares it</td><td>Many users at once</td><td>You alone, a dedicated copy</td></tr>
<tr><td>Access</td><td>Public address and shared read-mostly credentials; no VPN</td><td>Usually a VPN to the lab, with your own credentials</td></tr>
<tr><td>Permissions</td><td>Limited; do not break it for others</td><td>Full control; you may configure, break and rebuild</td></tr>
<tr><td>State</td><td>Other users may change data; do not rely on it being as you left it</td><td>Stays as you leave it until the reservation ends</td></tr>
<tr><td>Typical use</td><td>First API calls, learning response shapes</td><td>Deep labs, testing changes, simulated networks</td></tr></table>
<p>Typical Always-On examples include controller and cloud-management platforms for quick GETs; reservable examples include larger simulated topologies such as ACI or SD-WAN labs. A simulated-network tool (CML) is often used for reservable labs. A good habit: build and test your script on a sandbox, then switch the base URL and credentials to production through variables.</p>

<div class="warn"><p><b>Common mistakes.</b> Editing the script to hide a bad value instead of fixing the device that produced it. Doing "write" experiments on a shared Always-On sandbox. Hard-coding sandbox credentials in code you later share. Forgetting that a reservation ends and the lab is deleted.</p></div>
<div class="exam"><p><b>Exam trap.</b> Always-On = shared, no reservation, limited rights. Reservable = dedicated, booked for a time slot, full control. Read the question for "dedicated", "shared" or "reserve".</p></div>

<div class="scn"><h4>The report that blamed the script</h4><p>A weekly report script started showing "3 devices" instead of 4. The first reaction was to suspect the script and add a retry loop. A colleague asked the five questions: status 200, correct token, right path, JSON fine. The API was healthy. So the platform was telling the truth: one switch was really missing from the inventory. A look at the device showed that a recent change had put an uplink in the wrong OSPF area, so the controller could no longer reach it. One corrected line on the device, a re-discovery, and the report showed 4 again.</p><p><b>Lesson:</b> when the API call is correct, trust what it reports and fix the network.</p></div>

<div class="iv"><p class="q">"Your monitoring script shows a device missing. Script bug or network issue?"</p><p>First prove the API call works: status 200, correct auth and path, valid JSON. If the call is fine, the missing device is real data: check reachability and the controller's issues, then the device and its routing or credentials. Fix the cause on the device, re-run the script and confirm from two sources, the API and the device CLI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decide first whether the fault is on the API side or in the network.</li>
<li>Reproduce with one call, read the status code and body, fix one thing at a time.</li>
<li>If the API call is correct, its data is evidence: fix the cause on the device.</li>
<li>Prove a repair from two sources: the API and the device CLI.</li>
<li>Always-On sandboxes are shared and always available; reservable sandboxes are dedicated and booked.</li>
</ul></div>
`,hi:`
<p>Jab automation job fail hoti hai to fault ke do hi sambhavit jagah hote hain: <b>API side</b> (aapki call galat hai, token expire ho gaya, platform down hai) ya <b>network side</b> (jis cheez ki platform report karta hai woh sach mein kharab hai). Achhe engineers kuch badalne se pehle tay karte hain ki kaunsa hai. Yeh chapter dono ke liye ek workflow deta hai, dono labs ko usse walk-through karta hai, aur phir dikhata hai ki safely practice kahan karein: DevNet sandboxes.</p>

<h3>Workflow: pehle API, phir network, phir proof</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Reproduce</text><text x="80" y="66" text-anchor="middle" class="svg-muted" font-size="12">ek call, ek result</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 Code padho</text><text x="240" y="66" text-anchor="middle" class="svg-muted" font-size="12">status + body</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 Paanch hisse</text><text x="400" y="66" text-anchor="middle" class="svg-muted" font-size="12">method, URL, headers, body</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 API theek?</text><text x="560" y="66" text-anchor="middle" class="svg-muted" font-size="12">phir data padho</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="110" width="220" height="60" rx="8" fill="#fed7aa"/><text x="200" y="136" text-anchor="middle" class="svg-ink" font-size="13">5 Network ki wajah fix karo</text><text x="200" y="156" text-anchor="middle" class="svg-muted" font-size="12">device par, script mein nahi</text>
<rect x="340" y="110" width="220" height="60" rx="8" fill="#e2e8f0"/><text x="450" y="136" text-anchor="middle" class="svg-ink" font-size="13">6 Do baar prove karo</text><text x="450" y="156" text-anchor="middle" class="svg-muted" font-size="12">API healthy, CLI bhi sehmat</text>
<line x1="560" y1="80" x2="450" y2="110" stroke="#64748b" stroke-width="2"/><line x1="310" y1="140" x2="340" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Agar API call theek hai, to jo data woh lautati hai wahi network ka evidence hai.</p></div>
<ol>
<li><b>Reproduce</b> ek hi call se. Bug dhoondhne ke liye 200 devices par loop mat chalao.</li>
<li><b>Code aur body padho.</b> Pehle status code; phir body ka error text.</li>
<li><b>Paanch hisse check karo</b> (method, URL, headers, body, reply). Ek run mein ek hi cheez theek karo.</li>
<li><b>Call successful ho</b> to API aapko network ke baare mein sach bata rahi hai. Use dhyaan se padho: yahi aapka evidence hai.</li>
<li><b>Wajah wahin fix karo jahan woh hai</b>: device par, CLI ya template se, report script edit karke nahi.</li>
<li><b>Do baar prove karo</b>: API ab healthy dikhati hai, aur device CLI bhi wahi dikhata hai.</li>
</ol>

<h3>Lab 1: controller REST API padho aur fault dhoondo</h3>
<p><b>Situation.</b> Pune campus mein naya controller CTRL hai. Ticket poochta hai: yeh kin devices ko jaanta hai, aur uski issues API kya kharab bata rahi hai? Aapke paas sirf northbound REST explorer aur device CLIs hain.</p>
<p><b>Step 1: discover aur count.</b> Controller devices discover kiye bina kuch nahi jaanta. <code>center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro</code> ke baad inventory API call karo.</p>
<pre class="out">CTRL&gt; center api get /api/v1/network-device
GET /api/v1/network-device  -&gt;  200 OK
{ "response": [ { "hostname": "DSW1", ... "reachabilityStatus": "Reachable" },
                { "hostname": "ASW1", ... }, { "hostname": "ASW2", ... } ], "version": "1.0" }</pre>
<p>Teen devices. R1 kahan hai? Woh aise link ke peeche hai jo abhi kaam nahi kar raha, isliye discovery wahan tak nahi pahunch saki. Inventory API mein device ka na hona hi ek clue hai.</p>
<p><b>Step 2: issues API padho.</b></p>
<pre class="out">CTRL&gt; center api get /api/v1/issues
{ "response": [ { "issueId": "#2B80", <span class="hl">"priority": "P1"</span>, "category": "Routing",
                  "deviceName": "DSW1", "name": "OSPF adjacency down on Gi0/3 toward R1",
                  "impacted": [ "DSW1", "R1" ] }, ... ] }</pre>
<p>P1 ek device pair (DSW1 aur R1) aur ek protocol (OSPF) ka naam leta hai. API ne aapko <b>kahan dekhna hai</b> bata diya; kyun, yeh nahi bataya. Woh hissa devices par hai.</p>
<p><b>Step 3: devices par wajah dhoondo.</b> R1 par <code>show ip ospf interface brief</code> DSW1 wala link area 1 mein dikhata hai, jabki DSW1 par wahi link area 0 mein hai. OSPF neighbours ko area par sehmat hona padta hai, isliye adjacency nahi banti. R1 ko theek karo, loopback aur LAN network statements jaise hain waise rakhte hue:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# no network 10.0.0.0 0.0.0.3 area 1
R1(config-router)# network 10.0.0.0 0.0.0.3 area 0</pre>
<p><b>Step 4: R1 ko inventory mein laao.</b> <code>center discover 10.255.0.1 cli netadmin NK@dmin1 snmp nkro</code> se uska loopback discover karo, phir inventory API dobara call karo: chaar devices.</p>
<p><b>Step 5: prove karo.</b> <code>center api get /api/v1/network-health</code> mein <code>"healthScore": 100</code> dikhna chahiye aur <code>center pathtrace PC2 SRV</code> complete hona chahiye. API aur path trace CLI se sehmat hain: DSW1 par OSPF FULL.</p>

<h3>Lab 2 isi workflow mein</h3>
<p>Lab 2 "API side" ka case hai. Reproduce (ek run), code padho (406), paanch hisse check karo (Accept header), ek cheez theek karo, phir run (400), paanch hisse check karo (URL path aur encoding), theek karo, run (204), phir do baar prove karo: script mein ek GET label wapas padhta hai, aur router CLI (<code>show interfaces description</code>) use dikhata hai. Do labs, ek aadat: <b>status code, paanch hisse, ek baar mein ek change, doosre source se proof.</b></p>

<h3>DevNet sandboxes: practice kahan karein</h3>
<p>Webex ya ACI sirf padhkar nahi seekh sakte. Cisco ka DevNet program <b>sandboxes</b> deta hai: ready-made lab environments jo aap free use karte ho, asli platforms aur sample data ke saath. Do kism ke hain, aur exam aapse unmein farak poochta hai.</p>
<table class="cmp"><tr><th></th><th>Always-On sandbox</th><th>Reservable sandbox</th></tr>
<tr><td>Availability</td><td>Hamesha chalta hai; kisi bhi pal use karo, booking nahi</td><td>Aap time slot book karte ho (jaise kuch ghante ya din) aur apne liye banne ka intezaar karte ho</td></tr>
<tr><td>Kaun share karta hai</td><td>Ek saath bahut users</td><td>Sirf aap, dedicated copy</td></tr>
<tr><td>Access</td><td>Public address aur shared, zyadatar read-only credentials; VPN nahi</td><td>Aam taur par lab tak VPN, apne credentials ke saath</td></tr>
<tr><td>Permissions</td><td>Limited; doosron ke liye ise mat bigaado</td><td>Poora control; configure, bigaad aur dobara bana sakte ho</td></tr>
<tr><td>State</td><td>Doosre users data badal sakte hain; yeh na maano ki jaisa chhoda waisa milega</td><td>Reservation khatam hone tak waisa hi rehta hai jaisa chhoda</td></tr>
<tr><td>Aam use</td><td>Pehli API calls, response shapes seekhna</td><td>Gehre labs, changes test karna, simulated networks</td></tr></table>
<p>Always-On ke aam examples mein quick GETs ke liye controller aur cloud-management platforms aate hain; reservable examples mein ACI ya SD-WAN labs jaise bade simulated topologies. Simulated-network tool (CML) aksar reservable labs mein use hota hai. Achhi aadat: script sandbox par banao aur test karo, phir variables ke zariye base URL aur credentials production par badal do.</p>

<div class="warn"><p><b>Common mistakes.</b> Kharab value chhupane ke liye script edit karna, jabki use banane wale device ko fix karna chahiye. Shared Always-On sandbox par "write" experiments karna. Sandbox credentials ko aisa code mein hard-code karna jo baad mein share ho. Yeh bhool jana ki reservation khatam hoti hai aur lab delete ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Always-On = shared, reservation nahi, limited rights. Reservable = dedicated, time slot ke liye booked, poora control. Sawaal mein "dedicated", "shared" ya "reserve" shabd dhyaan se padho.</p></div>

<div class="scn"><h4>Report ne script ko dosh diya</h4><p>Ek weekly report script 4 ki jagah "3 devices" dikhane lagi. Pehla reaction tha script par shak karna aur retry loop jodna. Ek colleague ne paanch sawaal poochhe: status 200, token sahi, path sahi, JSON theek. API healthy thi. Yaani platform sach bol raha tha: ek switch sach mein inventory se gayab tha. Device dekha to ek recent change ne uplink ko galat OSPF area mein daal diya tha, isliye controller ab us tak pahunch nahi pa raha tha. Device par ek sudhari hui line, ek re-discovery, aur report phir 4 dikhane lagi.</p><p><b>Lesson:</b> API call sahi ho to jo woh report karti hai us par bharosa karo aur network fix karo.</p></div>

<div class="iv"><p class="q">"Aapki monitoring script mein ek device missing hai. Script bug hai ya network issue?"</p><p>Pehle saabit karo ki API call kaam karti hai: status 200, sahi auth aur path, valid JSON. Call theek ho to missing device asli data hai: reachability aur controller ke issues check karo, phir device aur uski routing ya credentials. Wajah device par fix karo, script dobara chalao aur do sources se confirm karo, API aur device CLI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle tay karo ki fault API side mein hai ya network mein.</li>
<li>Ek call se reproduce karo, status code aur body padho, ek baar mein ek cheez theek karo.</li>
<li>API call sahi ho to uska data evidence hai: wajah device par fix karo.</li>
<li>Repair ko do sources se prove karo: API aur device CLI.</li>
<li>Always-On sandboxes shared aur hamesha available hain; reservable sandboxes dedicated aur booked hote hain.</li>
</ul></div>
`}};export{e as default};