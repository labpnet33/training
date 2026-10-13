var e={id:`troubleshooting`,h:{en:`Troubleshooting automation: read the status code first`,hi:`Automation troubleshooting: pehle status code padho`},body:{en:`
<p>When a parcel does not arrive, the post office tracking page tells you where it stopped: not collected, at the sorting centre, out for delivery. An API status code is the same kind of tracking message. It tells you <b>which gate</b> stopped your request. A good engineer reads the code first, then fixes exactly that gate, instead of changing five things at random. The same discipline applies to the Spaces connector and the Catalyst Center checks.</p>

<h3>The order of checks on the controller</h3>
<p>The controller tests a request in a fixed order, so the first failing gate decides the answer:</p>
<ol>
<li><b>Path and scheme.</b> Is the path under /restconf, and is it the secure scheme? A plain scheme is refused or answered 403.</li>
<li><b>Authentication.</b> Are the credentials valid, and is the authentication method local? Failure is 401. A user with privilege below 15 is 403.</li>
<li><b>Service enabled.</b> Is RESTCONF on? If not, 404 with an HTML page.</li>
<li><b>Data path and rules.</b> Does the object exist, is the body valid, is the object editable? Errors are 400, 404, 405 or 409.</li>
</ol>
<p>A consequence: a wrong password is 401 even while RESTCONF is off, because authentication is checked before the service.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Order of gates">
<rect x="10" y="30" width="125" height="50" rx="8" fill="#bae6fd"/><text x="72" y="52" text-anchor="middle" class="svg-ink" font-size="13">1 Path, scheme</text><text x="72" y="70" text-anchor="middle" class="svg-muted" font-size="12">refused, 403</text>
<rect x="165" y="30" width="125" height="50" rx="8" fill="#bae6fd"/><text x="227" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Login</text><text x="227" y="70" text-anchor="middle" class="svg-muted" font-size="12">401, 403</text>
<rect x="320" y="30" width="125" height="50" rx="8" fill="#bbf7d0"/><text x="382" y="52" text-anchor="middle" class="svg-ink" font-size="13">3 Service</text><text x="382" y="70" text-anchor="middle" class="svg-muted" font-size="12">404 (HTML)</text>
<rect x="475" y="30" width="150" height="50" rx="8" fill="#fde68a"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">4 Data and rules</text><text x="550" y="70" text-anchor="middle" class="svg-muted" font-size="12">400, 404, 405, 409</text>
<line x1="135" y1="55" x2="165" y2="55" stroke="#64748b" stroke-width="2"/><line x1="290" y1="55" x2="320" y2="55" stroke="#64748b" stroke-width="2"/><line x1="445" y1="55" x2="475" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">pass all four gates: 200 (GET) or 204 (PATCH)</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">no TCP connection at all = the secure server is off or a path problem</text>
</svg><p class="cap">The first gate that fails decides the answer, so each fix reveals the next gate.</p></div>

<h3>The status table</h3>
<table class="cmp"><tr><th>Situation</th><th>Result</th></tr>
<tr><td>Secure server off</td><td>TCP refused, no web status code at all</td></tr>
<tr><td>No credentials, wrong password, or default <code>enable</code> method</td><td>401 with a WWW-Authenticate header</td></tr>
<tr><td>Local user with privilege below 15</td><td>403</td></tr>
<tr><td>RESTCONF disabled, credentials fine</td><td>404 HTML page</td></tr>
<tr><td>Unknown key, unknown container, path outside /restconf</td><td>404</td></tr>
<tr><td>First path node without module prefix</td><td>400</td></tr>
<tr><td>Malformed JSON, no body, unknown or read-only leaf, wrong type, key mismatch</td><td>400</td></tr>
<tr><td>Edit of an enabled WLAN or policy</td><td>409</td></tr>
<tr><td>DELETE, POST, or PATCH on a container</td><td>405</td></tr>
<tr><td>XML requested</td><td>406 (JSON only in the lab)</td></tr>
<tr><td>Success</td><td>200 (GET), 204 (PATCH)</td></tr>
</table>

<h3>Lab 2: the same request fails three ways</h3>
<p>Start state: user netops exists with privilege 1, the secure server is on, the authentication method is the default <code>enable</code>, RESTCONF is off. Run the GET from ADMIN1 after each fix.</p>
<pre class="out"><span class="c">step 1</span>
H&#84;TP/1.1 <span class="hl">401</span> Unauthorized
WWW-Authenticate: Basic realm="restconf"
{ "ietf-restconf:errors": { "error": [ { "error-tag": "access-denied",
  "error-message": "authentication failed (web authentication method is \\"enable\\"; configure ip h&#116;tp authentication local to use local users)" } ] } }</pre>
<p><b>Read:</b> 401, an authentication problem. The message names the cause: method is enable. Fix: <code>ip h&#116;tp authentication local</code>.</p>
<pre class="out"><span class="c">step 2</span>
H&#84;TP/1.1 <span class="hl">403</span> Forbidden
"error-message": "user \\"netops\\" has privilege level 1; API access needs privilege level 15"</pre>
<p><b>Read:</b> 403 means you were identified but not allowed. Fix the account: <code>username netops privilege 15 secret NkApi@2026</code>.</p>
<pre class="out"><span class="c">step 3</span>
H&#84;TP/1.1 <span class="hl">404</span> Not Found
&lt;html&gt;&lt;body&gt;&lt;h1&gt;404 Not Found&lt;/h1&gt;&lt;p&gt;/restconf is not available (RESTCONF service is disabled).&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</pre>
<p><b>Read:</b> 404 with an HTML page and a message about the service. This is a service problem, not a missing object (a missing object returns a JSON error body). Fix: <code>restconf</code>.</p>
<pre class="out"><span class="c">step 4</span>
H&#84;TP/1.1 <span class="hl">200</span> OK</pre>
<p>Web UI: <b>Administration &gt; Management &gt; H&#84;TP/H&#84;TPS Access Configuration</b> (authentication = Local), <b>Administration &gt; Management &gt; Local User Accounts</b> (privilege 15) and <b>Administration &gt; Management &gt; RESTCONF</b> (switch on).</p>

<h3>The other labs, as a checklist</h3>
<ul>
<li><b>Lab 3 readiness.</b> Run <code>show ip ssh</code>, <code>show netconf-yang status</code>, <code>show ntp status</code>, <code>show hosts</code>, then ping 10.10.99.10 from CATC1. If the RSA key fails with "define a domain-name first", set <code>ip domain name</code>.</li>
<li><b>Lab 4 Spaces.</b> Summary Inactive: check NTP, DNS and the route, then AP locations.</li>
<li><b>Lab 5 Python.</b> Status 401 from the script: read the AUTH line first, not the controller. The script is the client, so check what it sends.</li>
<li><b>409 on a PATCH.</b> The object is enabled. Include its status in the body, or shut it first from the CLI.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A script returns 404 for <code>wlan-cfg-entry=NK-GUEST</code>. If the body is an HTML page, RESTCONF is off. If it is a JSON error saying the key path was not found, the profile name does not exist (typo or case). Same code, two causes, told apart by the body. Check with <code>show wlan summary</code> or <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing several things at once. After a 401, do not also change privilege and enable RESTCONF; you lose the information each status code gives you. Change one gate, retest, read the new code.</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 means authentication failed, 403 means authenticated but not authorised, 404 can be a missing service or a missing object, 409 is a conflict with current state, 405 means the verb is not allowed on that resource. A refused connection has no status code at all.</p></div>

<div class="scn"><h4>"The API is down" that was a policy change</h4><p>A monitoring tool reported the controller API down after a maintenance window. The status was 403, not a timeout. An engineer had reset the service account to privilege 5 during an audit cleanup. Restoring privilege 15 fixed the tool in a minute, whereas a reload of the controller would have been unnecessary and disruptive.</p><p><b>Lesson:</b> the status code points at the gate. 403 is about authorisation, not about the service being down.</p></div>

<div class="iv"><p class="q">"An API call to the controller returns 404. How do you troubleshoot?"</p><p>Look at the body: an HTML page means the service (RESTCONF) is off; a JSON error means the path or key does not exist. Then check the module prefix, the key spelling and the object with a show command. Mention the order of gates so the interviewer sees a method.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The controller checks path, login, service and then data, in that order.</li>
<li>401 authentication, 403 privilege, 404 service or object, 409 enabled object, 405 verb.</li>
<li>Change one thing, retest, read the new code.</li>
<li>The body distinguishes an HTML 404 (service) from a JSON 404 (object).</li>
<li>The same CLI rules apply to the API.</li>
</ul></div>
`,hi:`
<p>Jab parcel nahi pahunchta, post office ka tracking page batata hai kahan ruka: collect nahi hua, sorting centre mein hai, delivery ke liye nikla. API status code isi tarah ka tracking message hai. Yeh batata hai ki aapki request ko <b>kaun sa gate</b> roka. Achha engineer pehle code padhta hai, phir theek wahi gate fix karta hai, paanch cheezein random badalne ki jagah. Yahi discipline Spaces connector aur Catalyst Center checks par bhi lagti hai.</p>

<h3>Controller par checks ka order</h3>
<p>Controller request ko fixed order mein test karta hai, isliye pehla fail hone wala gate jawab decide karta hai:</p>
<ol>
<li><b>Path aur scheme.</b> Path /restconf ke neeche hai, aur kya yeh secure scheme hai? Plain scheme refuse hoti hai ya 403 milta hai.</li>
<li><b>Authentication.</b> Credentials valid hain, aur authentication method local hai? Failure 401 hai. Privilege 15 se kam wala user 403 hai.</li>
<li><b>Service enabled.</b> RESTCONF on hai? Nahi to HTML page ke saath 404.</li>
<li><b>Data path aur rules.</b> Object exist karta hai, body valid hai, object editable hai? Errors 400, 404, 405 ya 409 hain.</li>
</ol>
<p>Iska nateeja: RESTCONF off hone par bhi galat password 401 hai, kyunki authentication service se pehle check hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Gates ka order">
<rect x="10" y="30" width="125" height="50" rx="8" fill="#bae6fd"/><text x="72" y="52" text-anchor="middle" class="svg-ink" font-size="13">1 Path, scheme</text><text x="72" y="70" text-anchor="middle" class="svg-muted" font-size="12">refused, 403</text>
<rect x="165" y="30" width="125" height="50" rx="8" fill="#bae6fd"/><text x="227" y="52" text-anchor="middle" class="svg-ink" font-size="13">2 Login</text><text x="227" y="70" text-anchor="middle" class="svg-muted" font-size="12">401, 403</text>
<rect x="320" y="30" width="125" height="50" rx="8" fill="#bbf7d0"/><text x="382" y="52" text-anchor="middle" class="svg-ink" font-size="13">3 Service</text><text x="382" y="70" text-anchor="middle" class="svg-muted" font-size="12">404 (HTML)</text>
<rect x="475" y="30" width="150" height="50" rx="8" fill="#fde68a"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">4 Data aur rules</text><text x="550" y="70" text-anchor="middle" class="svg-muted" font-size="12">400, 404, 405, 409</text>
<line x1="135" y1="55" x2="165" y2="55" stroke="#64748b" stroke-width="2"/><line x1="290" y1="55" x2="320" y2="55" stroke="#64748b" stroke-width="2"/><line x1="445" y1="55" x2="475" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">chaaron gates pass: 200 (GET) ya 204 (PATCH)</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">TCP connection hi nahi = secure server off ya path problem</text>
</svg><p class="cap">Jo gate pehle fail hota hai wahi jawab decide karta hai, isliye har fix agla gate dikhata hai.</p></div>

<h3>Status table</h3>
<table class="cmp"><tr><th>Situation</th><th>Result</th></tr>
<tr><td>Secure server off</td><td>TCP refused, koi web status code nahi</td></tr>
<tr><td>Credentials nahi, galat password, ya default <code>enable</code> method</td><td>WWW-Authenticate header ke saath 401</td></tr>
<tr><td>Privilege 15 se kam wala local user</td><td>403</td></tr>
<tr><td>RESTCONF disabled, credentials theek</td><td>404 HTML page</td></tr>
<tr><td>Unknown key, unknown container, /restconf ke bahar ka path</td><td>404</td></tr>
<tr><td>Pehle path node par module prefix nahi</td><td>400</td></tr>
<tr><td>Malformed JSON, body nahi, unknown ya read-only leaf, galat type, key mismatch</td><td>400</td></tr>
<tr><td>Enabled WLAN ya policy ka edit</td><td>409</td></tr>
<tr><td>Container par DELETE, POST, ya PATCH</td><td>405</td></tr>
<tr><td>XML maanga</td><td>406 (lab mein sirf JSON)</td></tr>
<tr><td>Success</td><td>200 (GET), 204 (PATCH)</td></tr>
</table>

<h3>Lab 2: wahi request teen tarah fail hoti hai</h3>
<p>Start state: user netops privilege 1 ke saath hai, secure server on hai, authentication method default <code>enable</code> hai, RESTCONF off hai. Har fix ke baad ADMIN1 se GET chalao.</p>
<pre class="out"><span class="c">step 1</span>
H&#84;TP/1.1 <span class="hl">401</span> Unauthorized
WWW-Authenticate: Basic realm="restconf"
{ "ietf-restconf:errors": { "error": [ { "error-tag": "access-denied",
  "error-message": "authentication failed (web authentication method is \\"enable\\"; configure ip h&#116;tp authentication local to use local users)" } ] } }</pre>
<p><b>Padho:</b> 401, authentication problem. Message cause batata hai: method enable hai. Fix: <code>ip h&#116;tp authentication local</code>.</p>
<pre class="out"><span class="c">step 2</span>
H&#84;TP/1.1 <span class="hl">403</span> Forbidden
"error-message": "user \\"netops\\" has privilege level 1; API access needs privilege level 15"</pre>
<p><b>Padho:</b> 403 ka matlab aapki pehchaan hui lekin ijaazat nahi. Account fix karo: <code>username netops privilege 15 secret NkApi@2026</code>.</p>
<pre class="out"><span class="c">step 3</span>
H&#84;TP/1.1 <span class="hl">404</span> Not Found
&lt;html&gt;&lt;body&gt;&lt;h1&gt;404 Not Found&lt;/h1&gt;&lt;p&gt;/restconf is not available (RESTCONF service is disabled).&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</pre>
<p><b>Padho:</b> HTML page aur service ke baare mein message ke saath 404. Yeh service problem hai, missing object nahi (missing object JSON error body deta hai). Fix: <code>restconf</code>.</p>
<pre class="out"><span class="c">step 4</span>
H&#84;TP/1.1 <span class="hl">200</span> OK</pre>
<p>Web UI: <b>Administration &gt; Management &gt; H&#84;TP/H&#84;TPS Access Configuration</b> (authentication = Local), <b>Administration &gt; Management &gt; Local User Accounts</b> (privilege 15) aur <b>Administration &gt; Management &gt; RESTCONF</b> (switch on).</p>

<h3>Baaki labs, checklist ki tarah</h3>
<ul>
<li><b>Lab 3 readiness.</b> <code>show ip ssh</code>, <code>show netconf-yang status</code>, <code>show ntp status</code>, <code>show hosts</code> chalao, phir CATC1 se 10.10.99.10 ping karo. Agar RSA key "define a domain-name first" se fail ho, <code>ip domain name</code> set karo.</li>
<li><b>Lab 4 Spaces.</b> Summary Inactive: NTP, DNS aur route check karo, phir AP locations.</li>
<li><b>Lab 5 Python.</b> Script se status 401: pehle AUTH line padho, controller nahi. Script client hai, isliye check karo woh kya bhejti hai.</li>
<li><b>PATCH par 409.</b> Object enabled hai. Body mein uska status daalo, ya pehle CLI se shut karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek script <code>wlan-cfg-entry=NK-GUEST</code> ke liye 404 deti hai. Agar body HTML page hai to RESTCONF off hai. Agar JSON error hai jo kehta hai key path nahi mila, to profile name exist nahi karta (typo ya case). Same code, do causes, body se alag pehchane jaate hain. <code>show wlan summary</code> ya <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b> se check karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ek saath kai cheezein fix karna. 401 ke baad privilege bhi badalna aur RESTCONF bhi enable karna mat karo; har status code ki jaankari kho jaati hai. Ek gate badlo, retest karo, naya code padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> 401 matlab authentication fail, 403 matlab authenticated lekin authorised nahi, 404 missing service ya missing object ho sakta hai, 409 current state se conflict, 405 matlab us resource par verb allowed nahi. Refused connection ka koi status code hi nahi hota.</p></div>

<div class="scn"><h4>"API down hai" jo policy change nikla</h4><p>Maintenance window ke baad monitoring tool ne controller API down report kiya. Status 403 tha, timeout nahi. Ek engineer ne audit cleanup mein service account ko privilege 5 par reset kar diya tha. Privilege 15 wapas karne se tool ek minute mein theek ho gaya, jabki controller reload bekaar aur disruptive hota.</p><p><b>Lesson:</b> status code gate ki taraf ishara karta hai. 403 authorisation ke baare mein hai, service down hone ke baare mein nahi.</p></div>

<div class="iv"><p class="q">"Controller ko API call 404 deti hai. Aap troubleshoot kaise karoge?"</p><p>Body dekho: HTML page ka matlab service (RESTCONF) off hai; JSON error ka matlab path ya key exist nahi karti. Phir module prefix, key spelling aur object ko show command se check karo. Gates ka order batao taaki interviewer ko method dikhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller path, login, service phir data check karta hai, isi order mein.</li>
<li>401 authentication, 403 privilege, 404 service ya object, 409 enabled object, 405 verb.</li>
<li>Ek cheez badlo, retest karo, naya code padho.</li>
<li>Body HTML 404 (service) aur JSON 404 (object) mein farq batati hai.</li>
<li>Wahi CLI rules API par bhi lagte hain.</li>
</ul></div>
`}};export{e as default};