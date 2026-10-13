var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from status code to fix (Lab 1 and Lab 2)`,hi:`Troubleshooting workflow: status code se fix tak (Lab 1 aur Lab 2)`},body:{en:`
<p>A doctor does not start with surgery. She asks "where does it hurt?", checks the pulse, reads the report and only then treats. A failing API call deserves the same order. The status code is the pulse, the error body is the report. With a fixed routine you fix most broken calls in minutes and you stop changing things at random. This chapter gives the routine (exam topic 2.5) and then walks you through <b>Lab 1</b> and <b>Lab 2</b>.</p>

<h3>The six-step routine</h3>
<ol>
<li><b>Did an answer arrive?</b> No answer (curl error 7 refused, 28 timeout, Python ConnectionError or Timeout) means a <i>network or service</i> problem: ping, interface state, route, port 443, firewall. Stop reading status codes: there are none.</li>
<li><b>Read the status code.</b> The first digit says whose fault: 4xx = your request, 5xx = the server.</li>
<li><b>Read the error body.</b> It often names the exact problem. Do not skip it.</li>
<li><b>Fix one thing</b> from the table below, then repeat the same call.</li>
<li><b>Verify</b> with a GET, and for configuration also look on the device.</li>
<li><b>Document</b> the symptom, the code, the cause and the fix.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting decision flow">
<rect x="230" y="8" width="180" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Call fails</text>
<rect x="20" y="85" width="190" height="44" rx="8" fill="#fed7aa"/><text x="115" y="104" text-anchor="middle" class="svg-ink" font-size="12">No HTTP answer at all</text><text x="115" y="120" text-anchor="middle" class="svg-muted" font-size="12">ping, interface, route, 443</text>
<rect x="225" y="85" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="12">4xx: fix YOUR request</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">URL, auth, headers, body</text>
<rect x="430" y="85" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="525" y="104" text-anchor="middle" class="svg-ink" font-size="12">5xx / 429: server side</text><text x="525" y="120" text-anchor="middle" class="svg-muted" font-size="12">wait, back-off, escalate</text>
<line x1="320" y1="44" x2="115" y2="85" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="85" stroke="#64748b"/><line x1="320" y1="44" x2="525" y2="85" stroke="#64748b"/>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Then: read the error body, change ONE thing, repeat, verify with GET</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">400 body   401 credentials   403 permission   404 URL   405 method   406 Accept   409 exists   415 Content-Type</text>
</svg><p class="cap">The first split is: did any HTTP answer arrive at all?</p></div>

<h3>Status code cheat table</h3>
<div class="tbl"><table class="cmp"><tr><th>Code</th><th>Meaning</th><th>First thing to check</th></tr>
<tr><td>400</td><td>Bad Request</td><td>JSON syntax, wrong key or type, unencoded character in the URL</td></tr>
<tr><td>401</td><td>Unauthorized</td><td>Missing, wrong or expired credentials; case-sensitive password</td></tr>
<tr><td>403</td><td>Forbidden</td><td>Known user without permission (privilege, scope, role); or plain HTTP to an HTTPS-only API</td></tr>
<tr><td>404</td><td>Not Found</td><td>URL typo, wrong object name, or the service itself is off</td></tr>
<tr><td>405</td><td>Method Not Allowed</td><td>Right URL, wrong method; read the docs for the allowed methods</td></tr>
<tr><td>406</td><td>Not Acceptable</td><td>Your Accept header names a format the server cannot produce</td></tr>
<tr><td>409</td><td>Conflict</td><td>Already exists, or conflicts with current state: use PATCH/PUT or check first</td></tr>
<tr><td>415</td><td>Unsupported Media Type</td><td>Your Content-Type is not accepted</td></tr>
<tr><td>429</td><td>Too Many Requests</td><td>Rate limit: obey Retry-After, back off</td></tr>
<tr><td>500</td><td>Internal Server Error</td><td>Server bug or crash; read logs, try a simpler call, escalate</td></tr>
<tr><td>503</td><td>Service Unavailable</td><td>Overloaded or restarting: retry later with back-off</td></tr></table></div>
<p>RESTCONF error bodies also carry an <code>error-tag</code> that adds precision: <code>invalid-value</code> (bad value or path), <code>malformed-message</code> (bad JSON), <code>access-denied</code> (auth), <code>data-exists</code> (409), <code>data-missing</code> (target not found) and <code>operation-not-supported</code> (405).</p>

<h3>Lab 1 walkthrough: read the error, fix the call</h3>
<p>Meera's file <code>calls.txt</code> holds seven calls. Use <code>cat calls.txt</code>, run each one, and apply the routine.</p>
<ol>
<li><b>Call 1: 403.</b> The URL starts with the plain web scheme. The error says RESTCONF is served only over HTTPS. Change the scheme to <code>h&#116;tps</code>. Lesson: 403 can also mean "this channel is not allowed".</li>
<li><b>Call 2: 406.</b> The header says <code>Accept: text/html</code>. The router can only answer in yang-data JSON or XML. Fix the Accept header.</li>
<li><b>Call 3: 400.</b> The key <code>GigabitEthernet0/1</code> has an unencoded slash. Write <code>GigabitEthernet0%2F1</code>. The router is fine.</li>
<li><b>Call 4: 403.</b> The same code as call 1 but a different message: user <code>viewer</code> has privilege 5, API users need 15. Use <code>netops</code> (or ask for the privilege to be raised through a change).</li>
<li><b>Call 5: 409.</b> POST tries to create Loopback10, which already exists (<code>data-exists</code>). Do not delete it. Use PATCH on <code>.../interface=Loopback10/description</code> and get 204.</li>
<li><b>Call 6: 404 with HTML.</b> This is R2. A JSON error body would mean "data not found"; an HTML page means the <i>service</i> is off. On R2 enter <code>restconf</code> in configuration mode and repeat the call: 200.</li>
<li><b>Call 7: query string.</b> Add <code>?content=config</code> to drop oper-status, statistics and the MAC address from the reply.</li>
</ol>
<pre class="out">R2# configure terminal
R2(config)# restconf
R2(config)# end

AUTO&gt; rest GET h&#116;tps://10.99.0.2/restconf/data/ietf-interfaces:interfaces -u netops:NK@2026
HTTP/1.1 <span class="hl">200 OK</span></pre>

<h3>Lab 2 walkthrough: a script that survives failures</h3>
<ol>
<li><b>Run <code>audit.py</code>.</b> It prints R1 and dies with <code>JSONDecodeError</code> on 10.99.0.2. The error is misleading: the real answer was an HTML 404 page.</li>
<li><b>Add <code>r.raise_for_status()</code></b> after the request. The traceback now says <code>404 Client Error: Not Found</code>: the true cause surfaces.</li>
<li><b>Wrap the call in try/except.</b> HTTPError prints "API error", ConnectionError or Timeout prints "unreachable". One run now reports all four routers.</li>
<li><b>Use the messages to fix the devices.</b> 404 on R2: enable <code>restconf</code>. 401 on R3: the local user's password differs; set <code>username netops privilege 15 secret NK@2026</code>. "unreachable" on R4: ping fails, <code>show ip interface brief</code> shows GigabitEthernet0/0 administratively down; <code>no shutdown</code>.</li>
<li><b>Run again.</b> Four lines, each with an enabled-interface count.</li>
</ol>
<pre class="out">AUTO&gt; python3 audit.py
10.99.0.1 enabled: 2
10.99.0.2 enabled: 3
10.99.0.3 enabled: 2
10.99.0.4 enabled: 2</pre>
<p>Note how the two labs complement each other: Lab 1 trains you to read <i>one</i> failure precisely; Lab 2 trains you to survive <i>many</i> failures across a fleet and to separate "no answer" from "answered with an error".</p>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once; fixing the client when the server is off (404 with an HTML body); retrying a 4xx forever; trusting the final traceback without reading the first error; forgetting to verify after a 204 (which only says "accepted").</p></div>
<div class="exam"><p><b>Exam trap.</b> Choose the cause from the code <i>and</i> the evidence: 404 + JSON error = path or object wrong; 404 + HTML = service off or wrong base path; 401 = who are you, 403 = not allowed; 409 = exists, 415 = your body format, 406 = your Accept.</p></div>

<div class="scn"><h4>Friday 17:40: "the API is down"</h4><p>A developer reported that the router API was down for her deployment script. The NOC engineer asked for the exact output. It was <code>403 Forbidden</code> with the message that RESTCONF is only served over HTTPS: someone had switched the base URL in the script to the plain scheme while testing. One character of configuration fixed it; no router was touched. The ticket note recorded: symptom, 403, message text, cause, fix.</p><p><b>Lesson:</b> Ask for the status code and body first. "It does not work" is not a symptom.</p></div>

<div class="iv"><p class="q">"An API call returns an error. Walk me through your troubleshooting."</p><p>First, did I get an HTTP answer at all? If not, it is a network or service issue: ping, interface, routing, port 443, firewall. If yes, I read the status code to decide whose fault it is, then the error body for the details. I change one thing, repeat the call, and confirm with a GET and, for config, on the device. Give two examples such as 401 versus 403, and 404 JSON versus 404 HTML.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: answer or not, status code, error body, fix one thing, verify, document.</li>
<li>No answer = network or service; 4xx = fix the request; 5xx or 429 = server side, wait and back off.</li>
<li>Same code can have different causes: always read the message (403 scheme versus 403 privilege).</li>
<li>404 with an HTML body means the service is disabled, not that the object is missing.</li>
<li>Scripts must separate failures per device and print enough to troubleshoot.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karta. Woh poochhti hai "dard kahan hai?", nabz dekhti hai, report padhti hai aur tab ilaaj karti hai. Fail hoti API call bhi isi order ki haqdaar hai. Status code nabz hai, error body report hai. Fixed routine ke saath aap zyada tar toti calls minutes mein theek kar lete ho aur random cheezein badalna band kar dete ho. Yeh chapter routine deta hai (exam topic 2.5) aur phir <b>Lab 1</b> aur <b>Lab 2</b> ka walkthrough karata hai.</p>

<h3>Chhe-step routine</h3>
<ol>
<li><b>Kya jawab aaya?</b> Bilkul jawab nahi (curl error 7 refused, 28 timeout, Python ConnectionError ya Timeout) ka matlab <i>network ya service</i> problem hai: ping, interface state, route, port 443, firewall. Status codes padhna band karo: koi hai hi nahi.</li>
<li><b>Status code padho.</b> Pehla digit batata hai kiski galti: 4xx = aapki request, 5xx = server.</li>
<li><b>Error body padho.</b> Woh aksar exact problem batati hai. Skip mat karo.</li>
<li>Neeche ki table se <b>ek cheez theek karo</b>, phir wahi call dohrao.</li>
<li>GET se <b>verify karo</b>, aur configuration ke liye device par bhi dekho.</li>
<li>Symptom, code, cause aur fix ko <b>document karo</b>.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting decision flow">
<rect x="230" y="8" width="180" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Call fail hui</text>
<rect x="20" y="85" width="190" height="44" rx="8" fill="#fed7aa"/><text x="115" y="104" text-anchor="middle" class="svg-ink" font-size="12">HTTP jawab hi nahi</text><text x="115" y="120" text-anchor="middle" class="svg-muted" font-size="12">ping, interface, route, 443</text>
<rect x="225" y="85" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="12">4xx: APNI request theek karo</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">URL, auth, headers, body</text>
<rect x="430" y="85" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="525" y="104" text-anchor="middle" class="svg-ink" font-size="12">5xx / 429: server side</text><text x="525" y="120" text-anchor="middle" class="svg-muted" font-size="12">ruko, back-off, escalate</text>
<line x1="320" y1="44" x2="115" y2="85" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="85" stroke="#64748b"/><line x1="320" y1="44" x2="525" y2="85" stroke="#64748b"/>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Phir: error body padho, EK cheez badlo, dohrao, GET se verify karo</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">400 body   401 credentials   403 permission   404 URL   405 method   406 Accept   409 exists   415 Content-Type</text>
</svg><p class="cap">Pehla split: kya koi HTTP jawab aaya bhi?</p></div>

<h3>Status code cheat table</h3>
<div class="tbl"><table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Sabse pehle kya check karein</th></tr>
<tr><td>400</td><td>Bad Request</td><td>JSON syntax, galat key ya type, URL mein unencoded character</td></tr>
<tr><td>401</td><td>Unauthorized</td><td>Credentials missing, galat ya expired; password case-sensitive</td></tr>
<tr><td>403</td><td>Forbidden</td><td>Jaana-pehchana user par permission nahi (privilege, scope, role); ya HTTPS-only API ko plain HTTP</td></tr>
<tr><td>404</td><td>Not Found</td><td>URL typo, galat object naam, ya service hi off hai</td></tr>
<tr><td>405</td><td>Method Not Allowed</td><td>URL sahi, method galat; allowed methods ke liye docs padho</td></tr>
<tr><td>406</td><td>Not Acceptable</td><td>Aapka Accept header aisa format maangta hai jo server bana nahi sakta</td></tr>
<tr><td>409</td><td>Conflict</td><td>Pehle se hai, ya maujooda state se takrata hai: PATCH/PUT use karo ya pehle check karo</td></tr>
<tr><td>415</td><td>Unsupported Media Type</td><td>Aapka Content-Type accept nahi hota</td></tr>
<tr><td>429</td><td>Too Many Requests</td><td>Rate limit: Retry-After maano, back off karo</td></tr>
<tr><td>500</td><td>Internal Server Error</td><td>Server bug ya crash; logs padho, simple call try karo, escalate karo</td></tr>
<tr><td>503</td><td>Service Unavailable</td><td>Overloaded ya restart ho raha hai: back-off ke saath baad mein retry</td></tr></table></div>
<p>RESTCONF error bodies mein <code>error-tag</code> bhi hota hai jo precision jodta hai: <code>invalid-value</code> (galat value ya path), <code>malformed-message</code> (kharab JSON), <code>access-denied</code> (auth), <code>data-exists</code> (409), <code>data-missing</code> (target nahi mila) aur <code>operation-not-supported</code> (405).</p>

<h3>Lab 1 walkthrough: error padho, call theek karo</h3>
<p>Meera ki file <code>calls.txt</code> mein saat calls hain. <code>cat calls.txt</code> use karo, har ek chalao, aur routine lagao.</p>
<ol>
<li><b>Call 1: 403.</b> URL plain web scheme se shuru hota hai. Error kehta hai RESTCONF sirf HTTPS par serve hota hai. Scheme ko <code>h&#116;tps</code> karo. Lesson: 403 ka matlab "yeh channel allowed nahi" bhi ho sakta hai.</li>
<li><b>Call 2: 406.</b> Header mein <code>Accept: text/html</code> hai. Router sirf yang-data JSON ya XML mein jawab de sakta hai. Accept header theek karo.</li>
<li><b>Call 3: 400.</b> Key <code>GigabitEthernet0/1</code> mein unencoded slash hai. <code>GigabitEthernet0%2F1</code> likho. Router theek hai.</li>
<li><b>Call 4: 403.</b> Call 1 wala hi code par alag message: user <code>viewer</code> ka privilege 5 hai, API users ko 15 chahiye. <code>netops</code> use karo (ya change ke through privilege badhwao).</li>
<li><b>Call 5: 409.</b> POST Loopback10 banana chahta hai jo pehle se hai (<code>data-exists</code>). Use delete mat karo. <code>.../interface=Loopback10/description</code> par PATCH karo aur 204 lo.</li>
<li><b>Call 6: HTML ke saath 404.</b> Yeh R2 hai. JSON error body ka matlab "data nahi mila"; HTML page ka matlab <i>service</i> off hai. R2 par configuration mode mein <code>restconf</code> likho aur call dohrao: 200.</li>
<li><b>Call 7: query string.</b> Reply se oper-status, statistics aur MAC address hatane ke liye <code>?content=config</code> jodo.</li>
</ol>
<pre class="out">R2# configure terminal
R2(config)# restconf
R2(config)# end

AUTO&gt; rest GET h&#116;tps://10.99.0.2/restconf/data/ietf-interfaces:interfaces -u netops:NK@2026
HTTP/1.1 <span class="hl">200 OK</span></pre>

<h3>Lab 2 walkthrough: script jo failures se survive kare</h3>
<ol>
<li><b><code>audit.py</code> chalao.</b> Yeh R1 print karti hai aur 10.99.0.2 par <code>JSONDecodeError</code> ke saath mar jaati hai. Error gumraah karne wala hai: asli jawab HTML 404 page tha.</li>
<li>Request ke baad <b><code>r.raise_for_status()</code> jodo</b>. Traceback ab <code>404 Client Error: Not Found</code> kehta hai: asli wajah saamne aati hai.</li>
<li><b>Call ko try/except mein lapeto.</b> HTTPError "API error" print karta hai, ConnectionError ya Timeout "unreachable". Ek run ab chaaron routers report karta hai.</li>
<li><b>Messages se devices theek karo.</b> R2 par 404: <code>restconf</code> enable karo. R3 par 401: local user ka password alag hai; <code>username netops privilege 15 secret NK@2026</code> set karo. R4 par "unreachable": ping fail, <code>show ip interface brief</code> mein GigabitEthernet0/0 administratively down; <code>no shutdown</code>.</li>
<li><b>Dobara chalao.</b> Chaar lines, har ek mein enabled-interface count.</li>
</ol>
<pre class="out">AUTO&gt; python3 audit.py
10.99.0.1 enabled: 2
10.99.0.2 enabled: 3
10.99.0.3 enabled: 2
10.99.0.4 enabled: 2</pre>
<p>Dhyaan do dono labs kaise ek doosre ko poora karte hain: Lab 1 aapko <i>ek</i> failure precisely padhna sikhata hai; Lab 2 aapko fleet mein <i>kai</i> failures se survive karna aur "jawab nahi" ko "error ke saath jawab" se alag karna sikhata hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Teen cheezein ek saath badalna; server off ho tab client theek karna (HTML body ke saath 404); 4xx ko hamesha retry karna; pehla error padhe bina aakhri traceback par bharosa; 204 ke baad verify karna bhoolna (jo sirf "accepted" kehta hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> Cause code <i>aur</i> evidence se chuno: 404 + JSON error = path ya object galat; 404 + HTML = service off ya galat base path; 401 = aap kaun ho, 403 = allowed nahi; 409 = pehle se hai, 415 = aapki body ka format, 406 = aapka Accept.</p></div>

<div class="scn"><h4>Friday 17:40: "API down hai"</h4><p>Ek developer ne report kiya ki uski deployment script ke liye router API down hai. NOC engineer ne exact output maanga. Woh <code>403 Forbidden</code> tha aur message ke saath ki RESTCONF sirf HTTPS par serve hota hai: kisi ne testing mein script ka base URL plain scheme par badal diya tha. Ek character ke fix se theek ho gaya; kisi router ko haath nahi lagaya. Ticket note mein likha gaya: symptom, 403, message text, cause, fix.</p><p><b>Lesson:</b> Pehle status code aur body maango. "Kaam nahi kar raha" symptom nahi hai.</p></div>

<div class="iv"><p class="q">"API call error deti hai. Apna troubleshooting samjhao."</p><p>Pehle, kya mujhe HTTP jawab mila? Nahi mila to network ya service issue hai: ping, interface, routing, port 443, firewall. Mila to status code padhta hoon ki kiski galti hai, phir details ke liye error body. Ek cheez badalta hoon, call dohrata hoon, aur GET se aur config ho to device par confirm karta hoon. Do examples do jaise 401 vs 403, aur 404 JSON vs 404 HTML.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: jawab aaya ya nahi, status code, error body, ek cheez theek karo, verify, document.</li>
<li>Jawab nahi = network ya service; 4xx = request theek karo; 5xx ya 429 = server side, ruko aur back off karo.</li>
<li>Ek hi code ki alag wajah ho sakti hain: hamesha message padho (403 scheme vs 403 privilege).</li>
<li>HTML body ke saath 404 ka matlab service disabled hai, object missing nahi.</li>
<li>Scripts ko failures per device alag karne aur troubleshoot karne layak print karna chahiye.</li>
</ul></div>
`}};export{e as default};