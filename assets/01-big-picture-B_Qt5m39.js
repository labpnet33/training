var e={id:`big-picture`,h:{en:`API skills: what you will learn and the big picture`,hi:`API skills: aap kya seekhoge aur big picture`},body:{en:`
<p>Think of a restaurant. You (the <b>client</b>) never walk into the kitchen. You read the menu, tell the waiter what you want, and the waiter brings the food back. The waiter is the <b>API</b>: a fixed, documented way to ask another system for something. The menu is the <b>API documentation</b>. The kitchen has rules too: you must give your table number (<b>authentication</b>), the kitchen only cooks so many orders per minute (<b>rate limiting</b>), a huge order arrives in several trays (<b>pagination</b>), and if the dish takes 20 minutes the waiter may say "we will call you" (<b>asynchronous</b> work and <b>webhooks</b>).</p>

<h3>What you will learn</h3>
<p>In the earlier modules you learned the basics: HTTP methods, status codes, headers, basic authentication and JSON (module <i>HTTP &amp; REST APIs from zero</i>), and you sent your first Python requests to a router (module <i>REST APIs in Python with requests</i>). This module turns "a call that works once" into "an integration that keeps working". It maps to the exam domain <b>Understanding and Using APIs</b> of the Cisco 200-901 CCNAAUTO exam, which is about 20 percent of the exam.</p>
<ul>
<li>Build a REST request from its parts: base URL, resource, path parameters and query string.</li>
<li>Describe API styles (REST, RPC, SOAP), synchronous versus asynchronous calls, and polling versus webhooks.</li>
<li>Choose and explain authentication: basic, API key, bearer token and the OAuth 2.0 roles and flow.</li>
<li>Handle large and busy services: pagination, rate limits (429 and Retry-After), back-off, retries, idempotency and timeouts.</li>
<li>Read an API reference and an OpenAPI (Swagger) file, and use curl-style tools and Postman.</li>
<li>Write Python that fails safely: <code>raise_for_status</code>, <code>try/except</code>, <code>timeout</code> and sessions.</li>
<li>Troubleshoot a broken call from the status code and the error body, in a fixed order.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already know what GET, POST, PUT, PATCH and DELETE do, what 200, 201, 204, 401, 404 mean, how a JSON body looks, and how to run <code>requests.get()</code> in Python. If any of that feels shaky, revisit those two modules first. We build on them and do not repeat them.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Client, API and service">
<rect x="20" y="70" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="14">Client</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="12">script / Postman</text>
<rect x="260" y="50" width="120" height="110" rx="8" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">API</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">auth check</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">rate limit</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">validation</text>
<rect x="500" y="70" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="14">Service</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">router / controller</text>
<line x1="140" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><text x="200" y="88" text-anchor="middle" class="svg-accent" font-size="12">request</text>
<line x1="260" y1="125" x2="140" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="200" y="142" text-anchor="middle" class="svg-accent" font-size="12">response</text>
<line x1="380" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Every skill in this module is one of: build the request, pass the checks, read the response.</text>
</svg><p class="cap">The client talks only to the API. The API decides who may ask, how often, and in what format.</p></div>

<h3>Map of the module</h3>
<div class="tbl"><table class="cmp"><tr><th>Blueprint topic</th><th>Chapters</th></tr>
<tr><td>Construct a REST request (URL, path, query)</td><td>2, 4</td></tr>
<tr><td>API styles, sync/async, polling/webhooks</td><td>3, 8</td></tr>
<tr><td>Authentication and OAuth 2.0</td><td>5, 6</td></tr>
<tr><td>Pagination, rate limits, retries, idempotency</td><td>7</td></tr>
<tr><td>Docs, OpenAPI, Postman and curl</td><td>9</td></tr>
<tr><td>Python error handling</td><td>10</td></tr>
<tr><td>Troubleshooting with labs</td><td>11</td></tr></table></div>

<h3>How the labs fit in</h3>
<p>You get two labs. <b>Lab 1</b> gives you seven saved curl-style calls against a router; each one fails (or answers badly) for a different reason, and you must read the status code and the error message to fix it. <b>Lab 2</b> gives you a Python audit script for four routers that crashes on the first broken one; you make it survive failures and then use its error messages to repair each router. The lab router has a RESTCONF API only. Pagination, rate limiting, bearer tokens and webhooks are not in the lab router, so we teach them with clearly marked <b>reference snippets</b>: real, correct code that you can read and reuse, but not run in the lab.</p>

<div class="note"><p>Reference snippets use example names such as <code>r1.example</code> and <code>api.example</code>. They are not live services. Never paste real tokens or passwords into notes, tickets or chat.</p></div>

<div class="scn"><h4>The report that worked for one week</h4><p>Anita at a Pune NOC wrote a script that read interface counters from 40 routers through an API. It worked in testing. In week two it printed half a report and stopped: one router had been replaced, and the new one answered 401. The script had no error handling, so the whole run died, and nobody noticed until the monthly capacity review. Anita rewrote it to log each failure, skip that router and continue, and to email a summary of failures.</p><p><b>Lesson:</b> A first call that works proves nothing. Reliable automation expects failures and handles each kind on purpose.</p></div>

<div class="iv"><p class="q">"What is an API and why do network engineers care?"</p><p>An API is a documented contract that lets one program ask another for data or actions. Engineers care because scripts can then configure and check hundreds of devices consistently, instead of typing CLI commands by hand. A strong answer also mentions authentication, error handling and idempotency as the difference between a demo and a tool you can trust.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An API is a documented contract between a client and a service.</li>
<li>The exam domain is about building, authenticating, protecting, troubleshooting and scaling API calls.</li>
<li>Most failures are 4xx (your request) or 5xx (their service); read the code first, then the error body.</li>
<li>Lab devices cover RESTCONF with basic auth; other topics are taught with reference snippets.</li>
<li>Plan for failure: timeouts, retries, error handling and logging belong in every real script.</li>
</ul></div>
`,hi:`
<p>Ek restaurant socho. Aap (<b>client</b>) kabhi kitchen mein nahi jaate. Aap menu padhte ho, waiter ko batate ho kya chahiye, aur waiter khana laata hai. Waiter hi <b>API</b> hai: kisi doosre system se kuch maangne ka fixed, documented tareeka. Menu hai <b>API documentation</b>. Kitchen ke bhi rules hote hain: aapko apna table number batana padta hai (<b>authentication</b>), kitchen ek minute mein sirf itne orders banati hai (<b>rate limiting</b>), bada order kai trays mein aata hai (<b>pagination</b>), aur agar dish ko 20 minute lagte hain to waiter kehta hai "hum aapko bula lenge" (<b>asynchronous</b> kaam aur <b>webhooks</b>).</p>

<h3>Aap kya seekhoge</h3>
<p>Pichhle modules mein aapne basics seekhe: HTTP methods, status codes, headers, basic authentication aur JSON (module <i>HTTP &amp; REST APIs from zero</i>), aur router ko apni pehli Python requests bheji (module <i>REST APIs in Python with requests</i>). Yeh module "ek baar chalne wali call" ko "hamesha chalne wali integration" banata hai. Yeh Cisco 200-901 CCNAAUTO exam ke domain <b>Understanding and Using APIs</b> se map hota hai, jo exam ka lagbhag 20 percent hai.</p>
<ul>
<li>REST request ko uske parts se banao: base URL, resource, path parameters aur query string.</li>
<li>API styles (REST, RPC, SOAP), synchronous vs asynchronous calls, aur polling vs webhooks samjhao.</li>
<li>Authentication chuno aur explain karo: basic, API key, bearer token aur OAuth 2.0 ke roles aur flow.</li>
<li>Bade aur busy services handle karo: pagination, rate limits (429 aur Retry-After), back-off, retries, idempotency aur timeouts.</li>
<li>API reference aur OpenAPI (Swagger) file padho, aur curl-style tools aur Postman use karo.</li>
<li>Aisi Python likho jo safely fail ho: <code>raise_for_status</code>, <code>try/except</code>, <code>timeout</code> aur sessions.</li>
<li>Toot chuki call ko status code aur error body se, fixed order mein troubleshoot karo.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko pehle se pata hona chahiye ki GET, POST, PUT, PATCH aur DELETE kya karte hain, 200, 201, 204, 401, 404 ka matlab kya hai, JSON body kaisi dikhti hai, aur Python mein <code>requests.get()</code> kaise chalate hain. Agar inmein se kuch kamzor lage to pehle woh do modules dobara dekho. Hum unhi par aage banate hain, unhe repeat nahi karte.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Client, API and service">
<rect x="20" y="70" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="14">Client</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="12">script / Postman</text>
<rect x="260" y="50" width="120" height="110" rx="8" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">API</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">auth check</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">rate limit</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">validation</text>
<rect x="500" y="70" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="14">Service</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">router / controller</text>
<line x1="140" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><text x="200" y="88" text-anchor="middle" class="svg-accent" font-size="12">request</text>
<line x1="260" y1="125" x2="140" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="200" y="142" text-anchor="middle" class="svg-accent" font-size="12">response</text>
<line x1="380" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Har skill: request banao, checks pass karo, response padho.</text>
</svg><p class="cap">Client sirf API se baat karta hai. API tay karti hai ki kaun maang sakta hai, kitni baar, aur kis format mein.</p></div>

<h3>Module ka map</h3>
<div class="tbl"><table class="cmp"><tr><th>Blueprint topic</th><th>Chapters</th></tr>
<tr><td>REST request banao (URL, path, query)</td><td>2, 4</td></tr>
<tr><td>API styles, sync/async, polling/webhooks</td><td>3, 8</td></tr>
<tr><td>Authentication aur OAuth 2.0</td><td>5, 6</td></tr>
<tr><td>Pagination, rate limits, retries, idempotency</td><td>7</td></tr>
<tr><td>Docs, OpenAPI, Postman aur curl</td><td>9</td></tr>
<tr><td>Python error handling</td><td>10</td></tr>
<tr><td>Labs ke saath troubleshooting</td><td>11</td></tr></table></div>

<h3>Labs yahan kaise fit hote hain</h3>
<p>Aapko do labs milte hain. <b>Lab 1</b> mein router ke against saat saved curl-style calls hain; har ek alag wajah se fail hoti hai (ya kharab jawab deti hai), aur aapko status code aur error message padh kar use theek karna hai. <b>Lab 2</b> mein chaar routers ke liye Python audit script hai jo pehle kharab router par crash ho jaati hai; aap use failures se survive karne layak banate ho aur phir uske error messages se har router repair karte ho. Lab router mein sirf RESTCONF API hai. Pagination, rate limiting, bearer tokens aur webhooks lab router mein nahi hain, isliye unhe hum clearly marked <b>reference snippets</b> se sikhate hain: sahi, real code jo aap padh kar reuse kar sakte ho, par lab mein chala nahi sakte.</p>

<div class="note"><p>Reference snippets mein <code>r1.example</code> aur <code>api.example</code> jaise example names hain. Yeh live services nahi hain. Asli tokens ya passwords kabhi notes, tickets ya chat mein paste mat karo.</p></div>

<div class="scn"><h4>Woh report jo ek hafta chali</h4><p>Pune NOC ki Anita ne ek script likhi jo 40 routers se API ke through interface counters padhti thi. Testing mein chali. Doosre hafte mein aadhi report print karke ruk gayi: ek router badla gaya tha aur naya router 401 de raha tha. Script mein error handling nahi thi, isliye poora run mar gaya, aur monthly capacity review tak kisi ko pata nahi chala. Anita ne use dobara likha: har failure log ho, us router ko skip karke aage badho, aur failures ka summary email ho.</p><p><b>Lesson:</b> Pehli call chal gayi, iska koi saboot nahi. Reliable automation failures ki umeed rakhti hai aur har kism ko jaan-boojh kar handle karti hai.</p></div>

<div class="iv"><p class="q">"API kya hai aur network engineers ko isse kya matlab?"</p><p>API ek documented contract hai jisse ek program doosre program se data ya action maang sakta hai. Engineers ko isliye matlab hai ki scripts phir hundreds of devices ko consistent tareeke se configure aur check kar sakti hain, haath se CLI commands type karne ke bajay. Strong jawab mein authentication, error handling aur idempotency ka zikr bhi hota hai, kyunki yahi demo aur bharose layak tool mein farak hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>API client aur service ke beech ka documented contract hai.</li>
<li>Exam domain API calls ko banana, authenticate karna, protect karna, troubleshoot karna aur scale karna hai.</li>
<li>Zyada tar failures 4xx (aapki request) ya 5xx (unki service) hote hain; pehle code padho, phir error body.</li>
<li>Lab devices basic auth ke saath RESTCONF cover karte hain; baaki topics reference snippets se sikhaye gaye hain.</li>
<li>Failure ki planning karo: timeouts, retries, error handling aur logging har real script ka hissa hain.</li>
</ul></div>
`}};export{e as default};