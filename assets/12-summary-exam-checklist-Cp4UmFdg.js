var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with "an API is a waiter" and you now know how to build a request, prove who you are, survive busy and broken services, receive events and troubleshoot with a routine. Use this chapter as your last revision page before the Cisco 200-901 CCNAAUTO domain <b>Understanding and Using APIs</b> (about 20 percent of the exam).</p>

<h3>Can-do checklist</h3>
<p>Tick each line only if you could explain it to a colleague without notes.</p>
<ul>
<li>Split a URL into scheme, host, port, base path, resource, path parameter and query string, and encode special characters (<code>%2F</code>).</li>
<li>Build a GET to retrieve and a POST to create, with the right headers and body, in curl, the lab <code>rest</code> tool and Python.</li>
<li>Describe REST, RPC (JSON-RPC, gRPC, NETCONF) and SOAP, and say which is stateless and resource-based.</li>
<li>Explain synchronous versus asynchronous (202 plus a job id) and polling versus webhooks.</li>
<li>Choose Content-Type and Accept correctly; explain 406 and 415.</li>
<li>Compare basic, API key, bearer token and OAuth 2.0; name the four OAuth roles and the authorization code flow.</li>
<li>Handle pagination (offset, page, cursor, Link header), 429 with Retry-After and back-off, retries, idempotency and timeouts.</li>
<li>Explain how a webhook is received and how an HMAC signature is verified.</li>
<li>Read an API reference and a small OpenAPI file; use curl and Postman.</li>
<li>Write Python with <code>raise_for_status</code>, specific <code>try/except</code>, <code>timeout</code> and a Session.</li>
<li>Troubleshoot from status code and error body: 400, 401, 403, 404, 405, 406, 409, 415, 429, 500, 503.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>API</dt><dd>A documented contract that lets one program use another.</dd>
<dt>Endpoint</dt><dd>One URL plus method that does one thing.</dd>
<dt>Path / query parameter</dt><dd>Value that picks one item / value that filters or shapes the answer.</dd>
<dt>Content negotiation</dt><dd>Agreeing on formats with Accept and Content-Type.</dd>
<dt>Idempotent</dt><dd>Doing it many times equals doing it once (GET, PUT, DELETE).</dd>
<dt>Pagination</dt><dd>Returning a big list in pages.</dd>
<dt>Rate limit</dt><dd>Maximum calls per time window; exceeded gives 429.</dd>
<dt>Back-off and jitter</dt><dd>Growing waits between retries plus random spread.</dd>
<dt>Bearer token</dt><dd>Short-lived credential sent as Authorization: Bearer.</dd>
<dt>OAuth 2.0</dt><dd>Authorization framework for limited, revocable access without sharing passwords.</dd>
<dt>Scope</dt><dd>A permission attached to a token.</dd>
<dt>Webhook</dt><dd>HTTP callback the service sends to your URL when an event happens.</dd>
<dt>HMAC signature</dt><dd>Hash made with a shared secret that proves origin and integrity.</dd>
<dt>OpenAPI / Swagger</dt><dd>Machine-readable description of a REST API / the tools around it.</dd>
</dl>

<h3>Most tested facts</h3>
<div class="tbl"><table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Status families</td><td>2xx success, 3xx redirect, 4xx client error, 5xx server error</td></tr>
<tr><td>401 versus 403</td><td>401 = authentication missing or failed; 403 = authenticated but not allowed</td></tr>
<tr><td>404 versus 405</td><td>404 = resource not found; 405 = resource exists, method not allowed</td></tr>
<tr><td>406 versus 415</td><td>406 = Accept cannot be met; 415 = Content-Type not accepted</td></tr>
<tr><td>409</td><td>Conflict, for example creating something that already exists</td></tr>
<tr><td>429</td><td>Rate limited; read Retry-After; exponential back-off</td></tr>
<tr><td>201 / 202 / 204</td><td>Created / accepted, not finished / done, no body</td></tr>
<tr><td>Idempotent methods</td><td>GET, PUT, DELETE (and HEAD, OPTIONS); POST is not</td></tr>
<tr><td>REST</td><td>Stateless, resource URLs, uniform HTTP methods, usually JSON</td></tr>
<tr><td>Basic auth</td><td>Base64 of user:password; not encryption; use HTTPS</td></tr>
<tr><td>OAuth roles</td><td>Resource owner, client, authorization server, resource server</td></tr>
<tr><td>Webhook</td><td>Push; verify the HMAC on the raw body; reply 2xx fast</td></tr>
<tr><td>requests</td><td>No exception for 4xx/5xx unless raise_for_status(); no default timeout</td></tr></table></div>

<h3>Command and code cheat sheet</h3>
<pre class="code">curl -s -i -X POST "h&#116;tps://api.example/v2/devices" -H "Authorization: Bearer $TOKEN" \\
     -H "Content-Type: application/json" -d '{"name": "r5"}'

rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1 -u netops:NK@2026

r = requests.get(url, params={"limit": 50}, headers=H, auth=A, timeout=(3, 10))
r.raise_for_status()
data = r.json()
# except requests.exceptions.HTTPError / ConnectionError / Timeout</pre>

<h3>Exam day tips</h3>
<ul>
<li>Read the code <i>and</i> the evidence in the question (body text, headers) before choosing.</li>
<li>For "which header" questions: Authorization (credentials), Content-Type (my body), Accept (what I want back), Retry-After (wait time), Location (new resource URL).</li>
<li>Questions about webhooks versus polling: push versus pull, and who runs the HTTP server.</li>
<li>If two answers look right, pick the one that is safe: HTTPS, least privilege, no secrets in code, timeouts and error handling.</li>
</ul>

<div class="warn"><p><b>Last common mistakes.</b> Mixing up 401 and 403; calling OAuth authentication; forgetting that POST is not idempotent; treating 202 as finished; trusting a 200 without checking the body; leaving out a timeout.</p></div>
<div class="exam"><p><b>Exam trap.</b> The word "most secure" in a question about credentials usually points to short-lived scoped tokens over HTTPS, not to basic auth and not to an API key in the URL.</p></div>

<div class="scn"><h4>The handover</h4><p>Before going on leave, Ritu handed her monitoring script to a colleague with a one-page note: base URL and version, the account and its privilege level, where the token comes from, the timeout and retry settings, the rate limit, and a table of the errors she had seen with their fixes. Three weeks later the script hit 429 during a large site rollout. The colleague found "429: wait Retry-After, max 3 retries" in the note and restored the report in ten minutes.</p><p><b>Lesson:</b> Document the contract and the failure handling, not only the happy path.</p></div>

<div class="iv"><p class="q">"What makes an API integration production-ready?"</p><p>Secure auth over HTTPS with secrets outside the code and least privilege; correct content negotiation; pagination; timeouts, retries with back-off and respect for rate limits; idempotent writes or idempotency keys; per-device error handling with logging and a summary; webhooks with signature verification where events matter; and documentation of the endpoints, limits and known errors.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build requests from URL parts; path picks the item, query shapes the answer.</li>
<li>Know styles (REST, RPC, SOAP), sync versus async, and polling versus webhooks.</li>
<li>Authenticate safely: basic over HTTPS, API key in a header, bearer tokens, OAuth 2.0 roles and scopes.</li>
<li>Protect against scale and failure: pagination, 429 and Retry-After, back-off, idempotency, timeouts.</li>
<li>Troubleshoot in order: answer or not, status code, error body, fix one thing, verify.</li>
</ul></div>
`,hi:`
<p>Aapne "API ek waiter hai" se shuru kiya tha aur ab aap jaante ho ki request kaise banate hain, apni pehchaan kaise saabit karte hain, busy aur kharab services se kaise survive karte hain, events kaise receive karte hain aur routine ke saath troubleshoot kaise karte hain. Cisco 200-901 CCNAAUTO ke domain <b>Understanding and Using APIs</b> (exam ka lagbhag 20 percent) se pehle is chapter ko apne aakhri revision page ki tarah use karo.</p>

<h3>Can-do checklist</h3>
<p>Har line tabhi tick karo jab aap use bina notes ke kisi colleague ko samjha sako.</p>
<ul>
<li>URL ko scheme, host, port, base path, resource, path parameter aur query string mein baanto, aur special characters encode karo (<code>%2F</code>).</li>
<li>Retrieve ke liye GET aur create ke liye POST banao, sahi headers aur body ke saath, curl, lab ke <code>rest</code> tool aur Python mein.</li>
<li>REST, RPC (JSON-RPC, gRPC, NETCONF) aur SOAP describe karo, aur batao kaun stateless aur resource-based hai.</li>
<li>Synchronous vs asynchronous (202 plus job id) aur polling vs webhooks samjhao.</li>
<li>Content-Type aur Accept sahi chuno; 406 aur 415 samjhao.</li>
<li>Basic, API key, bearer token aur OAuth 2.0 compare karo; OAuth ke chaar roles aur authorization code flow batao.</li>
<li>Pagination (offset, page, cursor, Link header), Retry-After aur back-off ke saath 429, retries, idempotency aur timeouts handle karo.</li>
<li>Samjhao ki webhook kaise receive hota hai aur HMAC signature kaise verify hota hai.</li>
<li>API reference aur chhoti OpenAPI file padho; curl aur Postman use karo.</li>
<li><code>raise_for_status</code>, specific <code>try/except</code>, <code>timeout</code> aur Session ke saath Python likho.</li>
<li>Status code aur error body se troubleshoot karo: 400, 401, 403, 404, 405, 406, 409, 415, 429, 500, 503.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>API</dt><dd>Documented contract jisse ek program doosre ko use kar sake.</dd>
<dt>Endpoint</dt><dd>Ek URL plus method jo ek kaam karta hai.</dd>
<dt>Path / query parameter</dt><dd>Value jo ek item chunti hai / value jo jawab ko filter ya shape karti hai.</dd>
<dt>Content negotiation</dt><dd>Accept aur Content-Type se formats par sehmati.</dd>
<dt>Idempotent</dt><dd>Kai baar karna = ek baar karna (GET, PUT, DELETE).</dd>
<dt>Pagination</dt><dd>Bade list ko pages mein lautana.</dd>
<dt>Rate limit</dt><dd>Ek time window mein maximum calls; paar hone par 429.</dd>
<dt>Back-off aur jitter</dt><dd>Retries ke beech badhti hui waits plus random spread.</dd>
<dt>Bearer token</dt><dd>Chhoti umar ka credential jo Authorization: Bearer ke roop mein jaata hai.</dd>
<dt>OAuth 2.0</dt><dd>Password share kiye bina limited, revocable access ka authorization framework.</dd>
<dt>Scope</dt><dd>Token se juda ek permission.</dd>
<dt>Webhook</dt><dd>Event hone par service aapke URL par jo HTTP callback bhejti hai.</dd>
<dt>HMAC signature</dt><dd>Shared secret se bana hash jo origin aur integrity saabit karta hai.</dd>
<dt>OpenAPI / Swagger</dt><dd>REST API ka machine-readable description / uske aas-paas ke tools.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<div class="tbl"><table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Status families</td><td>2xx success, 3xx redirect, 4xx client error, 5xx server error</td></tr>
<tr><td>401 vs 403</td><td>401 = authentication missing ya fail; 403 = authenticated par allowed nahi</td></tr>
<tr><td>404 vs 405</td><td>404 = resource nahi mila; 405 = resource hai, method allowed nahi</td></tr>
<tr><td>406 vs 415</td><td>406 = Accept poora nahi ho sakta; 415 = Content-Type accept nahi</td></tr>
<tr><td>409</td><td>Conflict, jaise aisi cheez banana jo pehle se hai</td></tr>
<tr><td>429</td><td>Rate limited; Retry-After padho; exponential back-off</td></tr>
<tr><td>201 / 202 / 204</td><td>Created / accepted, khatam nahi / ho gaya, body nahi</td></tr>
<tr><td>Idempotent methods</td><td>GET, PUT, DELETE (aur HEAD, OPTIONS); POST nahi</td></tr>
<tr><td>REST</td><td>Stateless, resource URLs, uniform HTTP methods, aam taur par JSON</td></tr>
<tr><td>Basic auth</td><td>user:password ka Base64; encryption nahi; HTTPS use karo</td></tr>
<tr><td>OAuth roles</td><td>Resource owner, client, authorization server, resource server</td></tr>
<tr><td>Webhook</td><td>Push; raw body par HMAC verify karo; jaldi 2xx reply</td></tr>
<tr><td>requests</td><td>raise_for_status() ke bina 4xx/5xx par exception nahi; default timeout nahi</td></tr></table></div>

<h3>Command aur code cheat sheet</h3>
<pre class="code">curl -s -i -X POST "h&#116;tps://api.example/v2/devices" -H "Authorization: Bearer $TOKEN" \\
     -H "Content-Type: application/json" -d '{"name": "r5"}'

rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1 -u netops:NK@2026

r = requests.get(url, params={"limit": 50}, headers=H, auth=A, timeout=(3, 10))
r.raise_for_status()
data = r.json()
# except requests.exceptions.HTTPError / ConnectionError / Timeout</pre>

<h3>Exam day tips</h3>
<ul>
<li>Choose karne se pehle sawaal mein code <i>aur</i> evidence (body text, headers) padho.</li>
<li>"Kaunsa header" sawaalon ke liye: Authorization (credentials), Content-Type (meri body), Accept (mujhe wapas kya chahiye), Retry-After (wait time), Location (naye resource ka URL).</li>
<li>Webhooks vs polling ke sawaal: push vs pull, aur HTTP server kaun chalata hai.</li>
<li>Agar do answers sahi lagein to woh chuno jo safe hai: HTTPS, least privilege, code mein secrets nahi, timeouts aur error handling.</li>
</ul>

<div class="warn"><p><b>Aakhri common mistakes.</b> 401 aur 403 mix karna; OAuth ko authentication kehna; bhool jaana ki POST idempotent nahi; 202 ko finished maanna; body check kiye bina 200 par bharosa; timeout chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Credentials ke sawaal mein "most secure" shabd aam taur par HTTPS par short-lived scoped tokens ki taraf ishara karta hai, basic auth ki taraf nahi aur URL mein API key ki taraf bhi nahi.</p></div>

<div class="scn"><h4>Handover</h4><p>Chhutti par jaane se pehle Ritu ne apni monitoring script ek colleague ko ek page ke note ke saath di: base URL aur version, account aur uska privilege level, token kahan se aata hai, timeout aur retry settings, rate limit, aur dekhe gaye errors ki table unke fixes ke saath. Teen hafte baad bade site rollout ke dauran script 429 par atak gayi. Colleague ko note mein "429: Retry-After tak ruko, max 3 retries" mil gaya aur usne dus minute mein report wapas chala di.</p><p><b>Lesson:</b> Contract aur failure handling document karo, sirf happy path nahi.</p></div>

<div class="iv"><p class="q">"API integration ko production-ready kya banata hai?"</p><p>HTTPS par secure auth, secrets code ke bahar aur least privilege; sahi content negotiation; pagination; timeouts, back-off ke saath retries aur rate limits ka samman; idempotent writes ya idempotency keys; per-device error handling logging aur summary ke saath; jahan events maayne rakhte hain wahan signature verification ke saath webhooks; aur endpoints, limits aur known errors ka documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URL ke hisson se requests banao; path item chunta hai, query jawab ko shape karti hai.</li>
<li>Styles (REST, RPC, SOAP), sync vs async, aur polling vs webhooks jaano.</li>
<li>Safely authenticate karo: HTTPS par basic, header mein API key, bearer tokens, OAuth 2.0 roles aur scopes.</li>
<li>Scale aur failure se bacho: pagination, 429 aur Retry-After, back-off, idempotency, timeouts.</li>
<li>Order mein troubleshoot karo: jawab aaya ya nahi, status code, error body, ek cheez theek karo, verify.</li>
</ul></div>
`}};export{e as default};