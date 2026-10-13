var e={id:`styles`,h:{en:`API styles: REST, RPC and SOAP, synchronous and asynchronous`,hi:`API styles: REST, RPC aur SOAP, synchronous aur asynchronous`},body:{en:`
<p>Two ways to get a taxi. In the first you say "take me to the airport" and the driver decides the route: you ask for an <i>action</i>. In the second you look at a list of cars on a map, pick car number 7 and tell it what to do: you work with <i>things</i> (resources). Both get you to the airport; they are different <b>styles</b>. APIs also come in styles, and the exam expects you to describe them and to say when a call is <b>synchronous</b> or <b>asynchronous</b>. This chapter covers exam topic <b>describing common API styles</b>.</p>

<h3>REST: resources and HTTP methods</h3>
<p><b>REST</b> (Representational State Transfer) models everything as <b>resources</b> with URLs, and uses the standard HTTP methods on them. Five constraints define it, plus a usual data format:</p>
<ul>
<li><b>Client-server</b>: the two sides are separate and can change independently.</li>
<li><b>Stateless</b>: each request carries everything the server needs (credentials, parameters). The server does not remember you between calls. This is why every request has an Authorization header.</li>
<li><b>Cacheable</b>: responses say whether they may be reused.</li>
<li><b>Uniform interface</b>: the same few methods (GET, POST, PUT, PATCH, DELETE) on every resource.</li>
<li><b>Layered</b>: proxies and gateways may sit in between without the client knowing.</li>
<li>Data is usually JSON (sometimes XML).</li>
</ul>
<p>RESTCONF on a router is REST-style access to YANG data, and so are the Meraki, Catalyst Center and most cloud APIs.</p>

<h3>RPC: call a remote procedure</h3>
<p><b>RPC</b> (Remote Procedure Call) makes a remote function look like a local one: you name a <b>method</b> and send <b>parameters</b>; the server runs it and returns the result. The URL is often a single endpoint, and the action is inside the message. Examples: <b>JSON-RPC</b> (JSON messages), <b>XML-RPC</b>, <b>gRPC</b> (binary Protocol Buffers over HTTP/2, used by gNMI streaming telemetry) and <b>NETCONF</b> (XML RPCs over SSH, with operations such as <code>get-config</code> and <code>edit-config</code>).</p>
<pre class="code">POST /rpc HTTP/1.1
Content-Type: application/json

{"jsonrpc": "2.0", "method": "interface.set_state",
 "params": {"name": "Loopback10", "enabled": false}, "id": 41}</pre>
<pre class="out">{"jsonrpc": "2.0", "id": 41, <span class="hl">"result": {"name": "Loopback10", "enabled": false}</span>}</pre>

<h3>SOAP: XML envelopes and a contract</h3>
<p><b>SOAP</b> wraps every call in an XML <b>envelope</b> and is described by a <b>WSDL</b> file (a machine-readable contract). It is strict and verbose, still common in older enterprise and telecom systems, and you will rarely write it by hand today.</p>

<div class="tbl"><table class="cmp"><tr><th></th><th>REST</th><th>RPC (JSON-RPC, gRPC, NETCONF)</th><th>SOAP</th></tr>
<tr><td>Thinks in</td><td>Resources and nouns</td><td>Actions and verbs</td><td>Operations in a WSDL contract</td></tr>
<tr><td>Endpoints</td><td>Many URLs</td><td>Often one</td><td>One service URL</td></tr>
<tr><td>Format</td><td>JSON or XML</td><td>JSON, XML or binary</td><td>XML only</td></tr>
<tr><td>Weight</td><td>Light</td><td>Light to very light</td><td>Heavy</td></tr>
<tr><td>Network examples</td><td>RESTCONF, Meraki, Catalyst Center</td><td>NETCONF, gNMI</td><td>Legacy provisioning systems</td></tr></table></div>

<h3>Synchronous or asynchronous?</h3>
<p>In a <b>synchronous</b> call the client waits on the open connection until the real answer arrives: GET an interface, receive it. In an <b>asynchronous</b> call the server cannot finish quickly (upgrading firmware on 50 switches, deploying a template), so it answers at once with "<b>202 Accepted</b>" and a <b>job or task identifier</b>, and works in the background. The client then either <b>polls</b> the job URL until it says finished, or receives a <b>webhook</b> when it is done (chapter 8).</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Synchronous versus asynchronous">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Synchronous</text>
<line x1="60" y1="35" x2="60" y2="230" stroke="#64748b"/><line x1="260" y1="35" x2="260" y2="230" stroke="#64748b"/>
<text x="60" y="48" text-anchor="middle" class="svg-muted" font-size="12">client</text><text x="260" y="48" text-anchor="middle" class="svg-muted" font-size="12">server</text>
<line x1="60" y1="80" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><text x="160" y="80" text-anchor="middle" class="svg-accent" font-size="12">GET /interfaces</text>
<rect x="250" y="100" width="20" height="60" fill="#bbf7d0"/><text x="160" y="135" text-anchor="middle" class="svg-muted" font-size="12">client waits</text>
<line x1="260" y1="170" x2="60" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="160" y="195" text-anchor="middle" class="svg-accent" font-size="12">200 + data</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Asynchronous</text>
<line x1="380" y1="35" x2="380" y2="230" stroke="#64748b"/><line x1="580" y1="35" x2="580" y2="230" stroke="#64748b"/>
<line x1="380" y1="65" x2="580" y2="75" stroke="#64748b" stroke-width="2"/><text x="480" y="62" text-anchor="middle" class="svg-accent" font-size="12">POST /upgrade</text>
<line x1="580" y1="90" x2="380" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="480" y="110" text-anchor="middle" class="svg-accent" font-size="12">202 + job id</text>
<line x1="380" y1="140" x2="580" y2="148" stroke="#64748b"/><text x="480" y="136" text-anchor="middle" class="svg-muted" font-size="12">GET /jobs/778 (running)</text>
<line x1="380" y1="185" x2="580" y2="193" stroke="#64748b"/><text x="480" y="181" text-anchor="middle" class="svg-muted" font-size="12">GET /jobs/778 (done)</text>
<text x="480" y="225" text-anchor="middle" class="svg-ink" font-size="12">client is free in between</text>
</svg><p class="cap">Left: the client waits for the answer. Right: the server answers "accepted" and the client checks the job later.</p></div>
<p>Reference snippet of an asynchronous exchange (not a lab device):</p>
<pre class="code">curl -s -i -X POST "h&#116;tps://api.example/v2/upgrades" -H "Content-Type: application/json" \\
     -H "Authorization: Bearer $TOKEN" -d '{"devices": ["r1","r2"], "image": "17.9.4"}'</pre>
<pre class="out">HTTP/1.1 <span class="hl">202 Accepted</span>
Location: /v2/jobs/778
{"job_id": 778, "state": "queued"}

GET /v2/jobs/778  -&gt;  {"job_id": 778, "state": "running", "progress": 40}
GET /v2/jobs/778  -&gt;  {"job_id": 778, "state": "succeeded"}</pre>

<div class="warn"><p><b>Common mistakes.</b> Treating 202 as "done" and reading the result immediately; polling every 100 ms and hitting the rate limit; calling REST "a protocol" (it is an architectural style over HTTP); saying NETCONF is REST (it is RPC over SSH).</p></div>
<div class="exam"><p><b>Exam trap.</b> 200 means the work is finished, 202 means "accepted, not finished". REST is stateless: the server keeps no session between requests, so every call must carry credentials.</p></div>

<div class="scn"><h4>Upgrade "successful" but nothing upgraded</h4><p>A script posted a software upgrade for 30 branch routers, got 202 for each, printed "upgrade done" and exited. Two hours later the NOC saw the routers still on the old image: six jobs had failed on low flash space. The script had never checked the job state. The fix: save the job id, poll until the state is succeeded or failed, and report the failures.</p><p><b>Lesson:</b> With asynchronous APIs, the first response only means "I got your request".</p></div>

<div class="iv"><p class="q">"Explain REST versus RPC."</p><p>REST is resource-oriented: URLs name things and the HTTP method says what to do, with stateless requests and usually JSON. RPC is action-oriented: you call a named method with parameters, often through one endpoint. Give network examples: RESTCONF is REST-style; NETCONF over SSH and gRPC-based gNMI are RPC-style. Mention SOAP as the older XML and WSDL style.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>REST = resources, URLs, HTTP methods, stateless, usually JSON.</li>
<li>RPC = call a named method with parameters (JSON-RPC, gRPC, NETCONF).</li>
<li>SOAP = XML envelope with a WSDL contract; older and heavy.</li>
<li>Synchronous = wait for the real answer; asynchronous = 202 plus a job id, then poll or wait for a webhook.</li>
<li>Always check the final job state, never only the 202.</li>
</ul></div>
`,hi:`
<p>Taxi lene ke do tareeke. Pehle mein aap kehte ho "airport le chalo" aur driver route tay karta hai: aap ek <i>action</i> maangte ho. Doosre mein aap map par gaadiyon ki list dekhte ho, car number 7 chunte ho aur use batate ho kya karna hai: aap <i>cheezon</i> (resources) ke saath kaam karte ho. Dono airport pahunchate hain; yeh alag <b>styles</b> hain. APIs ke bhi styles hote hain, aur exam mein unhe describe karna aur batana aana chahiye ki call <b>synchronous</b> hai ya <b>asynchronous</b>. Yeh chapter exam topic <b>describing common API styles</b> cover karta hai.</p>

<h3>REST: resources aur HTTP methods</h3>
<p><b>REST</b> (Representational State Transfer) har cheez ko URL wale <b>resources</b> ki tarah model karta hai, aur un par standard HTTP methods use karta hai. Paanch constraints ise define karte hain, saath mein ek aam data format:</p>
<ul>
<li><b>Client-server</b>: dono taraf alag hain aur apne aap badal sakti hain.</li>
<li><b>Stateless</b>: har request mein woh sab hota hai jo server ko chahiye (credentials, parameters). Server calls ke beech aapko yaad nahi rakhta. Isi liye har request mein Authorization header hota hai.</li>
<li><b>Cacheable</b>: responses batate hain ki unhe dobara use kar sakte hain ya nahi.</li>
<li><b>Uniform interface</b>: har resource par wahi kuch methods (GET, POST, PUT, PATCH, DELETE).</li>
<li><b>Layered</b>: beech mein proxies aur gateways ho sakte hain, client ko pata nahi chalta.</li>
<li>Data aam taur par JSON hota hai (kabhi XML).</li>
</ul>
<p>Router par RESTCONF YANG data ka REST-style access hai, aur Meraki, Catalyst Center aur zyada tar cloud APIs bhi.</p>

<h3>RPC: remote procedure call karo</h3>
<p><b>RPC</b> (Remote Procedure Call) remote function ko local function jaisa bana deta hai: aap ek <b>method</b> ka naam aur <b>parameters</b> bhejte ho; server use chalata hai aur result lautata hai. URL aksar ek hi endpoint hota hai, aur action message ke andar hota hai. Examples: <b>JSON-RPC</b> (JSON messages), <b>XML-RPC</b>, <b>gRPC</b> (HTTP/2 par binary Protocol Buffers, gNMI streaming telemetry mein use hota hai) aur <b>NETCONF</b> (SSH par XML RPCs, <code>get-config</code> aur <code>edit-config</code> jaise operations ke saath).</p>
<pre class="code">POST /rpc HTTP/1.1
Content-Type: application/json

{"jsonrpc": "2.0", "method": "interface.set_state",
 "params": {"name": "Loopback10", "enabled": false}, "id": 41}</pre>
<pre class="out">{"jsonrpc": "2.0", "id": 41, <span class="hl">"result": {"name": "Loopback10", "enabled": false}</span>}</pre>

<h3>SOAP: XML envelope aur contract</h3>
<p><b>SOAP</b> har call ko XML <b>envelope</b> mein lapetta hai aur <b>WSDL</b> file (machine-readable contract) se describe hota hai. Yeh strict aur verbose hai, purane enterprise aur telecom systems mein ab bhi common hai, aur aaj aap ise shayad hi haath se likhoge.</p>

<div class="tbl"><table class="cmp"><tr><th></th><th>REST</th><th>RPC (JSON-RPC, gRPC, NETCONF)</th><th>SOAP</th></tr>
<tr><td>Sochta hai</td><td>Resources aur nouns</td><td>Actions aur verbs</td><td>WSDL contract ke operations</td></tr>
<tr><td>Endpoints</td><td>Kai URLs</td><td>Aksar ek</td><td>Ek service URL</td></tr>
<tr><td>Format</td><td>JSON ya XML</td><td>JSON, XML ya binary</td><td>Sirf XML</td></tr>
<tr><td>Wazan</td><td>Halka</td><td>Halka se bahut halka</td><td>Bhaari</td></tr>
<tr><td>Network examples</td><td>RESTCONF, Meraki, Catalyst Center</td><td>NETCONF, gNMI</td><td>Legacy provisioning systems</td></tr></table></div>

<h3>Synchronous ya asynchronous?</h3>
<p><b>Synchronous</b> call mein client khuli connection par tab tak intezaar karta hai jab tak asli jawab na aaye: interface GET karo, mil gaya. <b>Asynchronous</b> call mein server jaldi khatam nahi kar sakta (50 switches par firmware upgrade, template deploy), isliye woh turant "<b>202 Accepted</b>" aur ek <b>job ya task identifier</b> deta hai, aur background mein kaam karta hai. Phir client ya to job URL ko <b>poll</b> karta hai jab tak woh finished na bole, ya kaam khatam hone par <b>webhook</b> milta hai (chapter 8).</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Synchronous versus asynchronous">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Synchronous</text>
<line x1="60" y1="35" x2="60" y2="230" stroke="#64748b"/><line x1="260" y1="35" x2="260" y2="230" stroke="#64748b"/>
<text x="60" y="48" text-anchor="middle" class="svg-muted" font-size="12">client</text><text x="260" y="48" text-anchor="middle" class="svg-muted" font-size="12">server</text>
<line x1="60" y1="80" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><text x="160" y="80" text-anchor="middle" class="svg-accent" font-size="12">GET /interfaces</text>
<rect x="250" y="100" width="20" height="60" fill="#bbf7d0"/><text x="160" y="135" text-anchor="middle" class="svg-muted" font-size="12">client wait karta hai</text>
<line x1="260" y1="170" x2="60" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="160" y="195" text-anchor="middle" class="svg-accent" font-size="12">200 + data</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Asynchronous</text>
<line x1="380" y1="35" x2="380" y2="230" stroke="#64748b"/><line x1="580" y1="35" x2="580" y2="230" stroke="#64748b"/>
<line x1="380" y1="65" x2="580" y2="75" stroke="#64748b" stroke-width="2"/><text x="480" y="62" text-anchor="middle" class="svg-accent" font-size="12">POST /upgrade</text>
<line x1="580" y1="90" x2="380" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="480" y="110" text-anchor="middle" class="svg-accent" font-size="12">202 + job id</text>
<line x1="380" y1="140" x2="580" y2="148" stroke="#64748b"/><text x="480" y="136" text-anchor="middle" class="svg-muted" font-size="12">GET /jobs/778 (running)</text>
<line x1="380" y1="185" x2="580" y2="193" stroke="#64748b"/><text x="480" y="181" text-anchor="middle" class="svg-muted" font-size="12">GET /jobs/778 (done)</text>
<text x="480" y="225" text-anchor="middle" class="svg-ink" font-size="12">beech mein client free hai</text>
</svg><p class="cap">Left: client jawab ka intezaar karta hai. Right: server "accepted" bolta hai aur client job ko baad mein check karta hai.</p></div>
<p>Asynchronous exchange ka reference snippet (lab device nahi):</p>
<pre class="code">curl -s -i -X POST "h&#116;tps://api.example/v2/upgrades" -H "Content-Type: application/json" \\
     -H "Authorization: Bearer $TOKEN" -d '{"devices": ["r1","r2"], "image": "17.9.4"}'</pre>
<pre class="out">HTTP/1.1 <span class="hl">202 Accepted</span>
Location: /v2/jobs/778
{"job_id": 778, "state": "queued"}

GET /v2/jobs/778  -&gt;  {"job_id": 778, "state": "running", "progress": 40}
GET /v2/jobs/778  -&gt;  {"job_id": 778, "state": "succeeded"}</pre>

<div class="warn"><p><b>Common mistakes.</b> 202 ko "ho gaya" maan kar turant result padhna; har 100 ms par poll karke rate limit se takrana; REST ko "protocol" kehna (yeh HTTP par architectural style hai); NETCONF ko REST kehna (yeh SSH par RPC hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> 200 matlab kaam khatam, 202 matlab "accepted, khatam nahi hua". REST stateless hai: server requests ke beech session nahi rakhta, isliye har call mein credentials hone chahiye.</p></div>

<div class="scn"><h4>Upgrade "successful" par upgrade hua hi nahi</h4><p>Ek script ne 30 branch routers ke software upgrade ke liye POST kiya, har ek ka 202 mila, "upgrade done" print kiya aur exit ho gayi. Do ghante baad NOC ne dekha ki routers abhi bhi purani image par hain: chhe jobs low flash space ki wajah se fail ho gaye the. Script ne job state kabhi check hi nahi ki thi. Fix: job id save karo, state succeeded ya failed hone tak poll karo, aur failures report karo.</p><p><b>Lesson:</b> Asynchronous APIs mein pehla response sirf "mujhe aapki request mil gayi" ka matlab rakhta hai.</p></div>

<div class="iv"><p class="q">"REST aur RPC ka farak samjhao."</p><p>REST resource-oriented hai: URLs cheezon ke naam hain aur HTTP method batata hai kya karna hai, stateless requests ke saath aur aam taur par JSON. RPC action-oriented hai: aap parameters ke saath ek named method call karte ho, aksar ek hi endpoint se. Network examples do: RESTCONF REST-style hai; SSH par NETCONF aur gRPC-based gNMI RPC-style hain. SOAP ko purane XML aur WSDL style ke roop mein mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>REST = resources, URLs, HTTP methods, stateless, aam taur par JSON.</li>
<li>RPC = parameters ke saath named method call karo (JSON-RPC, gRPC, NETCONF).</li>
<li>SOAP = WSDL contract wala XML envelope; purana aur bhaari.</li>
<li>Synchronous = asli jawab ka wait; asynchronous = 202 plus job id, phir poll ya webhook ka intezaar.</li>
<li>Hamesha final job state check karo, sirf 202 nahi.</li>
</ul></div>
`}};export{e as default};