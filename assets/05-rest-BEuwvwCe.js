var e={id:`rest`,h:{en:`REST APIs: verbs, URIs, headers, authentication and status codes`,hi:`REST APIs: verbs, URIs, headers, authentication aur status codes`},body:{en:`
<p>Think of a restaurant with a strict waiter. You (the <b>client</b>) read the menu (the API documentation), fill in a standard order slip and hand it over. The kitchen (the <b>server</b>) prepares exactly what the slip says and sends back the dish with a short note: "served", "we are out of that", "you are not a member". The waiter has no memory: every slip must carry your table number and membership card again. That is a <b>REST API</b> in one paragraph.</p>

<h3>What makes an API RESTful</h3>
<p><b>REST</b> (REpresentational State Transfer) is an architectural style for APIs that runs over <b>HTTP</b>, normally protected with TLS as <b>HTTPS</b>. The properties the CCNA expects you to know:</p>
<ul>
<li><b>Client-server.</b> The client asks, the server holds the resources and answers. Each side can change independently.</li>
<li><b>Stateless.</b> The server keeps no session memory between requests. Every request carries everything needed, including credentials or a token.</li>
<li><b>Cacheable.</b> Responses say whether they may be cached, so repeated reads can be served faster.</li>
<li><b>Uniform interface.</b> Every <b>resource</b> (a device, an interface, a VLAN) has its own address, a <b>URI</b>, and is handled with the same small set of HTTP methods.</li>
<li><b>Layered system.</b> The client does not need to know whether it talks to the real server or to a proxy or load balancer in between.</li>
</ul>

<h3>Anatomy of a URI</h3>
<p>A URI names the resource. In this text we write addresses without the scheme; in the lab you type the full address beginning with the HTTPS scheme (h&#116;tps, a colon and two slashes).</p>
<table class="cmp"><tr><th>Part</th><th>Example</th><th>Meaning</th></tr>
<tr><td>Scheme</td><td>HTTPS</td><td>Protocol; HTTPS uses TCP port 443 by default</td></tr>
<tr><td>Host</td><td><code>10.20.0.1</code></td><td>The server (here router R1)</td></tr>
<tr><td>Path</td><td><code>/restconf/data/ietf-interfaces:interfaces</code></td><td>Which resource</td></tr>
<tr><td>Query</td><td><code>?depth=2</code></td><td>Optional filters or options after <code>?</code></td></tr></table>

<h3>CRUD and the HTTP verbs</h3>
<p>Almost everything you do with data is one of four actions, called <b>CRUD</b>. Each maps to an HTTP method (also called a verb):</p>
<table class="cmp"><tr><th>CRUD</th><th>HTTP verb</th><th>What it does</th><th>Typical success</th></tr>
<tr><td>Create</td><td><b>POST</b></td><td>Create a new resource (a new child under the URI)</td><td>201 Created</td></tr>
<tr><td>Read</td><td><b>GET</b></td><td>Retrieve a resource; changes nothing</td><td>200 OK</td></tr>
<tr><td>Update</td><td><b>PUT</b></td><td>Replace the whole resource with the body you send</td><td>200 OK or 204 No Content</td></tr>
<tr><td>Update</td><td><b>PATCH</b></td><td>Modify only the fields you send (merge)</td><td>200 OK or 204 No Content</td></tr>
<tr><td>Delete</td><td><b>DELETE</b></td><td>Remove the resource</td><td>204 No Content</td></tr></table>
<p>GET, PUT and DELETE are <b>idempotent</b>: sending the same request twice leaves the same result. POST is not: two POSTs may create two objects.</p>

<h3>Request and response</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="REST request and response">
<rect x="20" y="40" width="140" height="110" rx="8" fill="#bae6fd"/>
<text x="90" y="85" text-anchor="middle" class="svg-ink" font-size="14">Client</text>
<text x="90" y="108" text-anchor="middle" class="svg-muted" font-size="12">NMS, script</text>
<rect x="480" y="40" width="140" height="110" rx="8" fill="#bbf7d0"/>
<text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="14">Server</text>
<text x="550" y="108" text-anchor="middle" class="svg-muted" font-size="12">R1 RESTCONF</text>
<line x1="160" y1="70" x2="480" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="480,64 492,70 480,76" fill="#64748b"/>
<text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">method + URI + headers + optional body</text>
<line x1="160" y1="125" x2="480" y2="125" stroke="#64748b" stroke-width="2"/>
<polygon points="160,119 148,125 160,131" fill="#64748b"/>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">status code + headers + optional body (JSON)</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">stateless: every request carries its own credentials</text>
</svg><p class="cap">One request, one response. The server remembers nothing between them.</p></div>

<pre class="out">GET /restconf/data/ietf-interfaces:interfaces HTTP/1.1
Host: 10.20.0.1
Accept: application/yang-data+json
Authorization: Basic bmV0YWRtaW46UmVzdEAxMjM=

<span class="hl">HTTP/1.1 200 OK</span>
Server: nginx
Content-Type: application/yang-data+json

{ "ietf-interfaces:interfaces": { "interface": [ ... ] } }</pre>

<h3>Headers and data encoding</h3>
<ul>
<li><code>Accept</code>: the format I want back, for example <code>application/json</code> or, for RESTCONF, <code>application/yang-data+json</code>.</li>
<li><code>Content-Type</code>: the format of the body I am sending.</li>
<li><code>Authorization</code>: credentials or a token.</li>
</ul>
<p>The <b>data encoding</b> is the text format of the body: <b>JSON</b> (most common), <b>XML</b> (NETCONF, older APIs) and, for files rather than APIs, <b>YAML</b>.</p>

<h3>Authentication types</h3>
<ul>
<li><b>Basic authentication</b>: <code>username:password</code> encoded in <b>base64</b> and sent in every request. Base64 is encoding, not encryption, so it must only be used over HTTPS.</li>
<li><b>Token-based (bearer) authentication</b>: you log in once, receive a token, and send the token in a header on later requests until it expires. Catalyst Center works this way with the <code>X-Auth-Token</code> header.</li>
<li><b>API key</b>: a long secret string issued to one application.</li>
<li><b>OAuth 2.0</b>: an authorization server issues limited, expiring access tokens so an application can act without ever seeing the user's password.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> In Lab 1 the user is <code>netadmin</code> with password <code>Rest@123</code>. The client joins them as <code>netadmin:Rest@123</code> and base64-encodes it to <code>bmV0YWRtaW46UmVzdEAxMjM=</code>. Anyone who captures that header can decode it in one second, which is why RESTCONF only runs over HTTPS.</p></div>

<h3>Status codes</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>What to check</th></tr>
<tr><td>2xx</td><td>Success: 200 OK (body returned), 201 Created, 204 No Content (done, no body)</td><td>Nothing, but read the body</td></tr>
<tr><td>3xx</td><td>Redirection, for example 301 Moved Permanently</td><td>The new location</td></tr>
<tr><td>400 Bad Request</td><td>The server cannot accept the request</td><td>JSON syntax, key names, data types</td></tr>
<tr><td>401 Unauthorized</td><td>Missing or wrong credentials</td><td>Username, password, token expiry</td></tr>
<tr><td>403 Forbidden</td><td>Authenticated but not allowed</td><td>Privilege level, role</td></tr>
<tr><td>404 Not Found</td><td>The resource does not exist</td><td>Typos in the path, wrong key</td></tr>
<tr><td>405 / 409 / 415</td><td>Method not allowed / conflict / unsupported media type</td><td>Verb, existing object, Content-Type</td></tr>
<tr><td>5xx</td><td>Server error, for example 500 or 503</td><td>The server side, not your request</td></tr></table>
<p>Memory aid: <b>2</b> = good, <b>4</b> = you (the client) did something wrong, <b>5</b> = the server did.</p>

<div class="warn"><p><b>Common mistake.</b> Using PUT when you meant PATCH. PUT replaces the whole resource: if you PUT an interface with only a description, you may remove its IP address. When you want to change one field, use PATCH.</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 = authentication failed (who are you?); 403 = authorization failed (I know you, but no). POST creates, PUT replaces, PATCH modifies. REST is stateless, so credentials or a token travel with every request. Basic authentication is only base64, not encryption.</p></div>

<div class="scn"><h4>The integration that died at midnight</h4><p>A ticketing system pulled device health from the campus controller every five minutes. Every night at midnight it started failing with <b>401 Unauthorized</b>, and the NOC dashboard went blank until someone restarted the integration in the morning. The engineer read the logs: the script requested a token once at start-up and reused it forever, but the controller's tokens expire after one hour. The fix was to request a new token whenever a 401 arrived, then retry the call.</p><p><b>Lesson:</b> the status code tells you which layer to fix. 401 is about credentials, not about the URL or the JSON.</p></div>

<div class="iv"><p class="q">"What are the characteristics of a REST API, and how do CRUD operations map to HTTP?"</p><p>Strong answer: REST is client-server, stateless, cacheable, with a uniform interface where every resource has a URI. Create = POST, Read = GET, Update = PUT (replace) or PATCH (partial), Delete = DELETE. Mention headers (Accept, Content-Type, Authorization), authentication types (basic, token, API key, OAuth) and status code classes: 2xx success, 4xx client error such as 400, 401, 403, 404, 5xx server error.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>REST: client-server, stateless, cacheable, uniform interface, resources identified by URIs.</li>
<li>CRUD: POST create, GET read, PUT replace, PATCH modify, DELETE remove.</li>
<li>Headers: Accept (what I want back), Content-Type (what I send), Authorization.</li>
<li>Authentication: basic (base64, needs HTTPS), token, API key, OAuth.</li>
<li>2xx success, 4xx client error (400, 401, 403, 404), 5xx server error.</li>
</ul></div>
`,hi:`
<p>Ek restaurant socho jismein ek sakht waiter hai. Aap (<b>client</b>) menu (API documentation) padhte ho, ek standard order slip bharte ho aur de dete ho. Kitchen (<b>server</b>) wahi banata hai jo slip mein likha hai aur dish ke saath ek chhota note bhejta hai: "serve ho gaya", "woh khatam hai", "aap member nahi ho". Waiter ki koi memory nahi: har slip par dobara aapka table number aur membership card hona chahiye. Ek paragraph mein yahi <b>REST API</b> hai.</p>

<h3>API ko RESTful kya banata hai</h3>
<p><b>REST</b> (REpresentational State Transfer) APIs ka ek architectural style hai jo <b>HTTP</b> par chalta hai, aam taur par TLS se protected <b>HTTPS</b> ke roop mein. CCNA aapse yeh properties jaanne ki ummeed rakhta hai:</p>
<ul>
<li><b>Client-server.</b> Client poochta hai, server resources rakhta hai aur jawab deta hai. Dono side alag se badal sakti hain.</li>
<li><b>Stateless.</b> Server requests ke beech koi session memory nahi rakhta. Har request mein sab kuch hota hai, credentials ya token bhi.</li>
<li><b>Cacheable.</b> Responses batate hain ki unhe cache kiya ja sakta hai ya nahi, taaki baar-baar ke reads fast serve ho sakein.</li>
<li><b>Uniform interface.</b> Har <b>resource</b> (device, interface, VLAN) ka apna address hota hai, ek <b>URI</b>, aur use HTTP methods ke same chhote set se handle kiya jaata hai.</li>
<li><b>Layered system.</b> Client ko jaanna zaroori nahi ki woh asli server se baat kar raha hai ya beech ke kisi proxy ya load balancer se.</li>
</ul>

<h3>URI ki anatomy</h3>
<p>URI resource ka naam batata hai. Is text mein hum addresses bina scheme ke likhte hain; lab mein aap poora address type karte ho jo HTTPS scheme (h&#116;tps, ek colon aur do slashes) se shuru hota hai.</p>
<table class="cmp"><tr><th>Hissa</th><th>Example</th><th>Matlab</th></tr>
<tr><td>Scheme</td><td>HTTPS</td><td>Protocol; HTTPS default mein TCP port 443 use karta hai</td></tr>
<tr><td>Host</td><td><code>10.20.0.1</code></td><td>Server (yahan router R1)</td></tr>
<tr><td>Path</td><td><code>/restconf/data/ietf-interfaces:interfaces</code></td><td>Kaunsa resource</td></tr>
<tr><td>Query</td><td><code>?depth=2</code></td><td><code>?</code> ke baad optional filters ya options</td></tr></table>

<h3>CRUD aur HTTP verbs</h3>
<p>Data ke saath aap jo bhi karte ho woh lagbhag hamesha chaar actions mein se ek hai, jinhe <b>CRUD</b> kehte hain. Har ek ek HTTP method (verb bhi kehte hain) se map hota hai:</p>
<table class="cmp"><tr><th>CRUD</th><th>HTTP verb</th><th>Kya karta hai</th><th>Aam success</th></tr>
<tr><td>Create</td><td><b>POST</b></td><td>Naya resource banata hai (URI ke neeche naya child)</td><td>201 Created</td></tr>
<tr><td>Read</td><td><b>GET</b></td><td>Resource laata hai; kuch nahi badalta</td><td>200 OK</td></tr>
<tr><td>Update</td><td><b>PUT</b></td><td>Poore resource ko bheji gayi body se replace karta hai</td><td>200 OK ya 204 No Content</td></tr>
<tr><td>Update</td><td><b>PATCH</b></td><td>Sirf bheje gaye fields badalta hai (merge)</td><td>200 OK ya 204 No Content</td></tr>
<tr><td>Delete</td><td><b>DELETE</b></td><td>Resource hata deta hai</td><td>204 No Content</td></tr></table>
<p>GET, PUT aur DELETE <b>idempotent</b> hain: same request do baar bhejo to result same rehta hai. POST nahi hai: do POSTs do objects bana sakte hain.</p>

<h3>Request aur response</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="REST request aur response">
<rect x="20" y="40" width="140" height="110" rx="8" fill="#bae6fd"/>
<text x="90" y="85" text-anchor="middle" class="svg-ink" font-size="14">Client</text>
<text x="90" y="108" text-anchor="middle" class="svg-muted" font-size="12">NMS, script</text>
<rect x="480" y="40" width="140" height="110" rx="8" fill="#bbf7d0"/>
<text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="14">Server</text>
<text x="550" y="108" text-anchor="middle" class="svg-muted" font-size="12">R1 RESTCONF</text>
<line x1="160" y1="70" x2="480" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="480,64 492,70 480,76" fill="#64748b"/>
<text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">method + URI + headers + optional body</text>
<line x1="160" y1="125" x2="480" y2="125" stroke="#64748b" stroke-width="2"/>
<polygon points="160,119 148,125 160,131" fill="#64748b"/>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">status code + headers + optional body (JSON)</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">stateless: har request apne credentials khud laati hai</text>
</svg><p class="cap">Ek request, ek response. Server dono ke beech kuch yaad nahi rakhta.</p></div>

<pre class="out">GET /restconf/data/ietf-interfaces:interfaces HTTP/1.1
Host: 10.20.0.1
Accept: application/yang-data+json
Authorization: Basic bmV0YWRtaW46UmVzdEAxMjM=

<span class="hl">HTTP/1.1 200 OK</span>
Server: nginx
Content-Type: application/yang-data+json

{ "ietf-interfaces:interfaces": { "interface": [ ... ] } }</pre>

<h3>Headers aur data encoding</h3>
<ul>
<li><code>Accept</code>: mujhe wapas kaunsa format chahiye, jaise <code>application/json</code> ya RESTCONF ke liye <code>application/yang-data+json</code>.</li>
<li><code>Content-Type</code>: jo body main bhej raha hoon uska format.</li>
<li><code>Authorization</code>: credentials ya token.</li>
</ul>
<p><b>Data encoding</b> body ka text format hai: <b>JSON</b> (sabse common), <b>XML</b> (NETCONF, purani APIs) aur APIs ki jagah files ke liye <b>YAML</b>.</p>

<h3>Authentication types</h3>
<ul>
<li><b>Basic authentication</b>: <code>username:password</code> ko <b>base64</b> mein encode karke har request mein bheja jaata hai. Base64 encoding hai, encryption nahi, isliye ise sirf HTTPS par use karna chahiye.</li>
<li><b>Token-based (bearer) authentication</b>: aap ek baar login karte ho, ek token milta hai, aur aage ki requests mein woh token header mein bhejte ho jab tak expire na ho. Catalyst Center isi tarah <code>X-Auth-Token</code> header ke saath kaam karta hai.</li>
<li><b>API key</b>: ek application ko diya gaya ek lamba secret string.</li>
<li><b>OAuth 2.0</b>: ek authorization server limited, expire hone wale access tokens deta hai taaki application user ka password dekhe bina kaam kar sake.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab 1 mein user <code>netadmin</code> hai aur password <code>Rest@123</code>. Client inhe <code>netadmin:Rest@123</code> ki tarah jodta hai aur base64 mein encode karke <code>bmV0YWRtaW46UmVzdEAxMjM=</code> banata hai. Jo bhi us header ko capture kare woh use ek second mein decode kar sakta hai, isiliye RESTCONF sirf HTTPS par chalta hai.</p></div>

<h3>Status codes</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Kya check karein</th></tr>
<tr><td>2xx</td><td>Success: 200 OK (body mili), 201 Created, 204 No Content (ho gaya, body nahi)</td><td>Kuch nahi, par body padho</td></tr>
<tr><td>3xx</td><td>Redirection, jaise 301 Moved Permanently</td><td>Nayi location</td></tr>
<tr><td>400 Bad Request</td><td>Server request accept nahi kar sakta</td><td>JSON syntax, key names, data types</td></tr>
<tr><td>401 Unauthorized</td><td>Credentials missing ya galat</td><td>Username, password, token expiry</td></tr>
<tr><td>403 Forbidden</td><td>Authenticated par allowed nahi</td><td>Privilege level, role</td></tr>
<tr><td>404 Not Found</td><td>Resource exist nahi karta</td><td>Path mein typos, galat key</td></tr>
<tr><td>405 / 409 / 415</td><td>Method allowed nahi / conflict / unsupported media type</td><td>Verb, pehle se maujood object, Content-Type</td></tr>
<tr><td>5xx</td><td>Server error, jaise 500 ya 503</td><td>Server side, aapki request nahi</td></tr></table>
<p>Yaad rakhne ka tareeka: <b>2</b> = achha, <b>4</b> = aapne (client ne) galti ki, <b>5</b> = server ne ki.</p>

<div class="warn"><p><b>Common galti.</b> PATCH chahiye tha aur PUT use kar liya. PUT poore resource ko replace karta hai: agar aap kisi interface ko sirf description ke saath PUT karo, to uska IP address hat sakta hai. Jab ek field badalni ho, PATCH use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 = authentication fail (aap kaun ho?); 403 = authorization fail (main aapko jaanta hoon, par nahi). POST banata hai, PUT replace karta hai, PATCH modify karta hai. REST stateless hai, isliye credentials ya token har request ke saath jaate hain. Basic authentication sirf base64 hai, encryption nahi.</p></div>

<div class="scn"><h4>Woh integration jo aadhi raat ko mar gaya</h4><p>Ek ticketing system har paanch minute campus controller se device health kheenchta tha. Har raat 12 baje woh <b>401 Unauthorized</b> ke saath fail hone lagta, aur NOC dashboard subah tak khaali rehta jab tak koi integration restart na kare. Engineer ne logs padhe: script start-up par ek baar token maangti thi aur use hamesha reuse karti thi, par controller ke tokens ek ghante mein expire ho jaate hain. Fix yeh tha ki jab bhi 401 aaye, naya token maango, phir call retry karo.</p><p><b>Seekh:</b> status code batata hai ki kaunsi layer theek karni hai. 401 credentials ke baare mein hai, URL ya JSON ke baare mein nahi.</p></div>

<div class="iv"><p class="q">"REST API ki characteristics kya hain, aur CRUD operations HTTP se kaise map hote hain?"</p><p>Strong answer: REST client-server, stateless, cacheable hai, uniform interface ke saath jahan har resource ka ek URI hota hai. Create = POST, Read = GET, Update = PUT (replace) ya PATCH (partial), Delete = DELETE. Headers (Accept, Content-Type, Authorization), authentication types (basic, token, API key, OAuth) aur status code classes batao: 2xx success, 4xx client error jaise 400, 401, 403, 404, 5xx server error.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>REST: client-server, stateless, cacheable, uniform interface, resources URIs se pehchaane jaate hain.</li>
<li>CRUD: POST create, GET read, PUT replace, PATCH modify, DELETE remove.</li>
<li>Headers: Accept (mujhe kya wapas chahiye), Content-Type (main kya bhej raha hoon), Authorization.</li>
<li>Authentication: basic (base64, HTTPS chahiye), token, API key, OAuth.</li>
<li>2xx success, 4xx client error (400, 401, 403, 404), 5xx server error.</li>
</ul></div>
`}};export{e as default};