var e={id:`troubleshooting`,h:{en:`Troubleshooting five broken API calls`,hi:`Paanch kharab API calls ka troubleshooting`},body:{en:`

<p>Now we put everything together. In the lab, a colleague named Ravi left a file <code>calls.txt</code> with five API calls for R1. None of them work. Each one is broken in a different way, and each way matches a chapter you have just read. Work through them like a doctor: read the symptom, find the cause, fix one thing, check.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="The same four steps fix every failing API call."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="120" height="70" rx="10" fill="#fecaca"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="14">Read status</text><rect x="175" y="40" width="120" height="70" rx="10" fill="#fde68a"/><text x="235" y="80" text-anchor="middle" class="svg-ink" font-size="14">Read message</text><rect x="340" y="40" width="120" height="70" rx="10" fill="#bae6fd"/><text x="400" y="80" text-anchor="middle" class="svg-ink" font-size="14">Fix ONE thing</text><rect x="505" y="40" width="125" height="70" rx="10" fill="#bbf7d0"/><text x="567.5" y="80" text-anchor="middle" class="svg-ink" font-size="14">Re-run, verify</text><line x1="130" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="295" y1="75" x2="340" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="460" y1="75" x2="505" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="13">Never change two things at once</text></svg><p class="cap">The same four steps fix every failing API call.</p></div>

<h3>The file</h3>
<pre class="code"># Ravi's API calls for R1 - none of them work. Run each one, read the status line, fix it.
# 1. list all interfaces
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u netops:nk@2026
# 2. read only Loopback0
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interface:interfaces/interface=Loopback0 -u netops:NK@2026
# 3. set the Loopback0 description from a file
rest PATCH h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0/description -u netops:NK@2026 -d @lo-desc.json
# 4. set the GigabitEthernet0/1 description
rest POST h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description -u netops:NK@2026 -d '{"ietf-interfaces:description": "WAN to Chennai"}'
# 5. enable GigabitEthernet0/2
rest PATCH h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F2 -u netops:NK@2026 -H 'Content-Type: application/xml' -d @gi2-up.json</pre>
<p>(Hostname and path are shortened as <code>...</code> only in the text below; the real file has the full address.)</p>

<h3>Call 1: 401 Unauthorized</h3>
<pre class="out">AUTO&gt; rest GET .../ietf-interfaces:interfaces -u netops:nk@2026
<span class="hl">HTTP/1.1 401 Unauthorized</span>
Content-Type: application/yang-data+json
WWW-Authenticate: Basic realm="restconf"

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
<span class="hl">        "error-message": "authentication failed for user \\"netops\\""</span>
      }
    ]</pre>
<p>The first digit is 4 (our side) and the word is Unauthorized, so it is a login problem. Compare the password: <code>nk@2026</code> in lowercase against the lab password <code>NK@2026</code>. Passwords are case sensitive. Fix: capital N and K. The call then returns 200 and the interface list.</p>

<h3>Call 2: 404 Not Found</h3>
<pre class="out">AUTO&gt; rest GET .../ietf-interface:interfaces/interface=Loopback0
<span class="hl">HTTP/1.1 404 Not Found</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "uri keypath not found (unknown top-level node \\"ietf-interface:interfaces\\")"</span>
      }
    ]
  }</pre>
<p>The login now works, so the status moved on. The message names the culprit: unknown top-level node <code>ietf-interface:interfaces</code>. The module is called <code>ietf-interfaces</code> with an <b>s</b>. Fix the spelling and the same call returns 200 with Loopback0 (checked in the lab).</p>

<h3>Call 3: 400 Bad Request</h3>
<pre class="out">AUTO&gt; rest PATCH .../interface=Loopback0/description -u netops:NK@2026 -d @lo-desc.json
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "malformed-message",
<span class="hl">        "error-message": "malformed JSON body: line 2, column 3: property names must use double quotes (\\"), not single quotes (')"</span>
      }
    ]
  }</pre>
<p>400 means the body is the problem. Validate the file before touching the router:</p>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: INVALID JSON</span>
  line 2, column 3: property names must use double quotes ("), not single quotes (')
    2 |   'ietf-interfaces:description': 'Router ID - Chennai core'
      |   ^</pre>
<p>Single quotes again. After replacing them with double quotes the file reads:</p>
<pre class="code">{
  "ietf-interfaces:description": "Router ID - Chennai core"
}</pre>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:description)</span></pre>
<p>Re-run the PATCH and you get <code>HTTP/1.1 204 No Content</code>.</p>

<h3>Call 4: 405 Method Not Allowed</h3>
<pre class="out">AUTO&gt; rest POST .../interface=GigabitEthernet0%2F1/description -u netops:NK@2026 -d '{...}'
<span class="hl">HTTP/1.1 405 Method Not Allowed</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "operation-not-supported",
<span class="hl">        "error-message": "POST creates a child resource; use PATCH or PUT to change a leaf"</span>
      }
    ]
  }</pre>
<p>The message tells you the fix. A description is a single value (a leaf), not a list you add children to, so POST is wrong. Change the verb to PATCH: <code>HTTP/1.1 204 No Content</code>.</p>

<h3>Call 5: 415 Unsupported Media Type</h3>
<pre class="out">AUTO&gt; rest PATCH .../interface=GigabitEthernet0%2F2 -u netops:NK@2026 -H 'Content-Type: application/xml' -d @gi2-up.json
<span class="hl">HTTP/1.1 415 Unsupported Media Type</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "Content-Type application/xml is not supported for request bodies in this lab; send application/yang-data+json"
      }
    ]
  }</pre>
<p>The file <code>gi2-up.json</code> holds JSON, but the header says XML. Remove that header (or set it to the JSON media type). The result: <code>HTTP/1.1 204 No Content</code>.</p>

<h3>Prove it on the router</h3>
<p>A 204 is a promise, not proof. Finish the way every change should finish, with the device itself:</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual down                  down
<span class="hl">GigabitEthernet0/2     10.13.0.1       YES manual down                  down</span>
GigabitEthernet0/3     unassigned      YES unset  administratively down down
<span class="hl">Loopback0              1.1.1.1         YES manual up                    up</span></pre>

<div class="eg"><p><b>Worked example.</b> Notice the order of the five symptoms: 401, then 404, then 400, 405, 415. It is not an accident. The server checks <i>who you are</i> first, then <i>where you are going</i>, then <i>what you sent</i>. When you fix one layer, the next layer's error appears. That is progress, not a new fault.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Changing several things at once, so you do not know which fix worked. (2) Ignoring the error-message. (3) Fixing the call without checking the device afterwards. (4) Editing the router config by hand "to make the API work" instead of reading the status.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match symptom to layer: 401 credentials, 404 path or module name, 400 body syntax, 405 verb, 415 Content-Type, refused connection means HTTPS service or network. Questions give you a status code and ask for the cause.</p></div>

<div class="scn"><h4>Ravi's five calls</h4><p>You are handed Ravi's file at 6 pm with a deadline at 7. You run call 1: 401. Fix the password. Call 2: 404. Fix the module spelling. Call 3: 400. Validate, fix quotes. Call 4: 405. Change POST to PATCH. Call 5: 415. Remove the wrong header. Then <code>show ip interface brief</code> confirms. You finish in minutes because each message told you the fix.</p><p><b>Lesson:</b> read, fix one thing, re-run.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a failing REST call."</p><p>I start from the status line and the error body. 401 means credentials, 404 means a wrong path or module name, 400 means a malformed body or path, 405 means the wrong verb, 415 means the wrong Content-Type. I fix one thing at a time, re-run, then verify on the device with a show command. If there is no status, I check the service, the port and the network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the status line, then the error-message, then fix one thing.</li>
<li>The server checks identity, then path, then body: errors appear in that order.</li>
<li>Validate JSON before sending.</li>
<li>2xx is not proof: confirm on the device.</li>
<li>No status line means the service or network, not the request.</li>
</ul></div>

`,hi:`

<p>Ab hum sab kuch jodte hain. Lab mein Ravi naam ke colleague ne <code>calls.txt</code> file chhodi hai jisme R1 ke liye paanch API calls hain. Koi nahi chalti. Har ek alag tareeke se kharab hai, aur har tareeka kisi aise chapter se milta hai jo aapne abhi padha. Doctor ki tarah kaam karo: symptom padho, wajah dhoondo, ek cheez fix karo, check karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Wahi chaar steps har fail hoti API call ko theek karte hain."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="120" height="70" rx="10" fill="#fecaca"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="14">Status padho</text><rect x="175" y="40" width="120" height="70" rx="10" fill="#fde68a"/><text x="235" y="80" text-anchor="middle" class="svg-ink" font-size="14">Message padho</text><rect x="340" y="40" width="120" height="70" rx="10" fill="#bae6fd"/><text x="400" y="80" text-anchor="middle" class="svg-ink" font-size="14">Ek cheez fix</text><rect x="505" y="40" width="125" height="70" rx="10" fill="#bbf7d0"/><text x="567.5" y="80" text-anchor="middle" class="svg-ink" font-size="14">Dobara, verify</text><line x1="130" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="295" y1="75" x2="340" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="460" y1="75" x2="505" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="13">Ek saath do cheezein mat badlo</text></svg><p class="cap">Wahi chaar steps har fail hoti API call ko theek karte hain.</p></div>

<h3>File</h3>
<pre class="code"># Ravi's API calls for R1 - none of them work. Run each one, read the status line, fix it.
# 1. list all interfaces
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u netops:nk@2026
# 2. read only Loopback0
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interface:interfaces/interface=Loopback0 -u netops:NK@2026
# 3. set the Loopback0 description from a file
rest PATCH h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0/description -u netops:NK@2026 -d @lo-desc.json
# 4. set the GigabitEthernet0/1 description
rest POST h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description -u netops:NK@2026 -d '{"ietf-interfaces:description": "WAN to Chennai"}'
# 5. enable GigabitEthernet0/2
rest PATCH h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F2 -u netops:NK@2026 -H 'Content-Type: application/xml' -d @gi2-up.json</pre>
<p>(Niche ke text mein hostname aur path sirf <code>...</code> se chhote kiye gaye hain; asli file mein poora address hai.)</p>

<h3>Call 1: 401 Unauthorized</h3>
<pre class="out">AUTO&gt; rest GET .../ietf-interfaces:interfaces -u netops:nk@2026
<span class="hl">HTTP/1.1 401 Unauthorized</span>
Content-Type: application/yang-data+json
WWW-Authenticate: Basic realm="restconf"

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
<span class="hl">        "error-message": "authentication failed for user \\"netops\\""</span>
      }
    ]</pre>
<p>Pehla digit 4 hai (hamari taraf) aur shabd Unauthorized hai, to yeh login ki dikkat hai. Password compare karo: lowercase <code>nk@2026</code> aur lab password <code>NK@2026</code>. Passwords case sensitive hote hain. Fix: capital N aur K. Phir call 200 aur interface list deti hai.</p>

<h3>Call 2: 404 Not Found</h3>
<pre class="out">AUTO&gt; rest GET .../ietf-interface:interfaces/interface=Loopback0
<span class="hl">HTTP/1.1 404 Not Found</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "uri keypath not found (unknown top-level node \\"ietf-interface:interfaces\\")"</span>
      }
    ]
  }</pre>
<p>Login ab chal gaya, isliye status aage badh gaya. Message doshi ka naam batata hai: unknown top-level node <code>ietf-interface:interfaces</code>. Module ka naam <code>ietf-interfaces</code> hai, <b>s</b> ke saath. Spelling theek karo aur wahi call Loopback0 ke saath 200 deti hai (lab mein check kiya).</p>

<h3>Call 3: 400 Bad Request</h3>
<pre class="out">AUTO&gt; rest PATCH .../interface=Loopback0/description -u netops:NK@2026 -d @lo-desc.json
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "malformed-message",
<span class="hl">        "error-message": "malformed JSON body: line 2, column 3: property names must use double quotes (\\"), not single quotes (')"</span>
      }
    ]
  }</pre>
<p>400 ka matlab body ki dikkat hai. Router ko chhune se pehle file validate karo:</p>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: INVALID JSON</span>
  line 2, column 3: property names must use double quotes ("), not single quotes (')
    2 |   'ietf-interfaces:description': 'Router ID - Chennai core'
      |   ^</pre>
<p>Phir single quotes. Unhe double quotes se badalne ke baad file aisi dikhti hai:</p>
<pre class="code">{
  "ietf-interfaces:description": "Router ID - Chennai core"
}</pre>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:description)</span></pre>
<p>PATCH dobara chalao aur aapko <code>HTTP/1.1 204 No Content</code> milta hai.</p>

<h3>Call 4: 405 Method Not Allowed</h3>
<pre class="out">AUTO&gt; rest POST .../interface=GigabitEthernet0%2F1/description -u netops:NK@2026 -d '{...}'
<span class="hl">HTTP/1.1 405 Method Not Allowed</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "operation-not-supported",
<span class="hl">        "error-message": "POST creates a child resource; use PATCH or PUT to change a leaf"</span>
      }
    ]
  }</pre>
<p>Message fix bata deta hai. Description ek single value (leaf) hai, aisi list nahi jisme children add karo, isliye POST galat hai. Verb ko PATCH karo: <code>HTTP/1.1 204 No Content</code>.</p>

<h3>Call 5: 415 Unsupported Media Type</h3>
<pre class="out">AUTO&gt; rest PATCH .../interface=GigabitEthernet0%2F2 -u netops:NK@2026 -H 'Content-Type: application/xml' -d @gi2-up.json
<span class="hl">HTTP/1.1 415 Unsupported Media Type</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "Content-Type application/xml is not supported for request bodies in this lab; send application/yang-data+json"
      }
    ]
  }</pre>
<p>File <code>gi2-up.json</code> mein JSON hai, par header XML kehta hai. Woh header hatao (ya use JSON media type par set karo). Nateeja: <code>HTTP/1.1 204 No Content</code>.</p>

<h3>Router par saabit karo</h3>
<p>204 ek vaada hai, saboot nahi. Har change ko jaise khatam karna chahiye waise karo, device se hi:</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.12.0.1       YES manual down                  down
<span class="hl">GigabitEthernet0/2     10.13.0.1       YES manual down                  down</span>
GigabitEthernet0/3     unassigned      YES unset  administratively down down
<span class="hl">Loopback0              1.1.1.1         YES manual up                    up</span></pre>

<div class="eg"><p><b>Worked example.</b> Paanch symptoms ka kram dekho: 401, phir 404, phir 400, 405, 415. Yeh ittefaq nahi hai. Server pehle dekhta hai <i>aap kaun ho</i>, phir <i>kahan ja rahe ho</i>, phir <i>kya bheja</i>. Ek layer fix karte hi agli layer ka error dikhta hai. Yeh progress hai, nayi fault nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Ek saath kai cheezein badalna, to pata nahi chalta kaunsa fix chala. (2) error-message ignore karna. (3) Call fix karke device check na karna. (4) Status padhne ke bajaye "API chalane ke liye" router config haath se badalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symptom ko layer se milao: 401 credentials, 404 path ya module name, 400 body syntax, 405 verb, 415 Content-Type, refused connection matlab HTTPS service ya network. Sawaal status code dete hain aur wajah poochte hain.</p></div>

<div class="scn"><h4>Ravi ki paanch calls</h4><p>Shaam 6 baje aapko Ravi ki file milti hai aur deadline 7 baje hai. Call 1: 401. Password theek karo. Call 2: 404. Module spelling theek karo. Call 3: 400. Validate karo, quotes theek karo. Call 4: 405. POST ko PATCH karo. Call 5: 415. Galat header hatao. Phir <code>show ip interface brief</code> confirm karta hai. Aap kuch hi minutes mein khatam karte ho kyunki har message ne fix bata diya.</p><p><b>Lesson:</b> padho, ek cheez fix karo, dobara chalao.</p></div>

<div class="iv"><p class="q">"Fail hoti REST call ko aap kaise troubleshoot karte ho?"</p><p>Status line aur error body se shuru karta hoon. 401 matlab credentials, 404 matlab galat path ya module name, 400 matlab kharab body ya path, 405 matlab galat verb, 415 matlab galat Content-Type. Ek baar mein ek cheez fix karta hoon, dobara chalata hoon, phir device par show command se verify karta hoon. Status na ho to service, port aur network dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Status line padho, phir error-message, phir ek cheez fix karo.</li>
<li>Server pehle identity, phir path, phir body check karta hai: errors usi kram mein aate hain.</li>
<li>Bhejne se pehle JSON validate karo.</li>
<li>2xx saboot nahi: device par confirm karo.</li>
<li>Status line na ho to service ya network, request nahi.</li>
</ul></div>

`}};export{e as default};