var e={id:`status-codes`,h:{en:`Status codes: did it work?`,hi:`Status codes: kaam hua ya nahi?`},body:{en:`

<p>Every reply starts with a <b>status line</b> such as <code>HTTP/1.1 404 Not Found</code>. The three-digit number is the answer to "did it work, and if not, whose fault is it?". You do not need to remember sixty codes. Learn the five families and about ten common codes, and you can debug most API problems.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Read the first digit of the status code first."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="145" height="70" rx="10" fill="#bbf7d0"/><text x="82.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">2xx</text><text x="82.5" y="70" text-anchor="middle" class="svg-muted" font-size="12">Success</text><rect x="170" y="20" width="145" height="70" rx="10" fill="#bae6fd"/><text x="242.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">3xx</text><text x="242.5" y="70" text-anchor="middle" class="svg-muted" font-size="12">Redirect</text><rect x="330" y="20" width="145" height="70" rx="10" fill="#fde68a"/><text x="402.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">4xx</text><text x="402.5" y="70" text-anchor="middle" class="svg-muted" font-size="12">Your mistake</text><rect x="490" y="20" width="140" height="70" rx="10" fill="#fecaca"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="14">5xx</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="12">Server problem</text><text x="82" y="120" text-anchor="middle" class="svg-muted" font-size="12">200 201 204</text><text x="242" y="120" text-anchor="middle" class="svg-muted" font-size="12">301 302</text><text x="402" y="120" text-anchor="middle" class="svg-muted" font-size="11">400 401 403 404 405 409 415</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">500 502 503</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="13">First digit = who needs to act</text></svg><p class="cap">Read the first digit of the status code first.</p></div>

<h3>The families</h3>
<ul>
<li><b>2xx</b>: it worked. 200 OK (here is your data), 201 Created (new object made), 204 No Content (done, nothing to return).</li>
<li><b>3xx</b>: go somewhere else. Rare in device APIs.</li>
<li><b>4xx</b>: <i>you</i> sent something wrong. Fix the request. Retrying the same request will fail again.</li>
<li><b>5xx</b>: the <i>server</i> failed. The request may be fine; check the device, wait, retry.</li>
</ul>

<h3>The 4xx codes you will meet most</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Usual cause</th></tr>
<tr><td>400 Bad Request</td><td>The request is malformed</td><td>Broken JSON, bad path such as an unescaped slash</td></tr>
<tr><td>401 Unauthorized</td><td>Who are you?</td><td>Wrong or missing username and password</td></tr>
<tr><td>403 Forbidden</td><td>I know you, but no</td><td>User lacks privilege</td></tr>
<tr><td>404 Not Found</td><td>No data at that path</td><td>Typo in module, interface or key</td></tr>
<tr><td>405 Method Not Allowed</td><td>That verb is wrong here</td><td>POST to a leaf value</td></tr>
<tr><td>409 Conflict</td><td>Clashes with existing state</td><td>POST of an object that exists</td></tr>
<tr><td>415 Unsupported Media Type</td><td>I cannot read that body format</td><td>Wrong Content-Type header</td></tr></table>

<h3>Seeing them for real</h3>
<p>A wrong password gives 401, and the reply even carries a <code>WWW-Authenticate</code> header that says which login style the server wants. The body (JSON) names the exact reason in <code>error-message</code>:</p>
<pre class="out">AUTO&gt; rest GET .../ietf-interfaces:interfaces -u apiuser:wrongpass
<span class="hl">HTTP/1.1 401 Unauthorized</span>
Content-Type: application/yang-data+json
WWW-Authenticate: Basic realm="restconf"

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
<span class="hl">        "error-message": "authentication failed for user \\"apiuser\\""</span>
      }
    ]</pre>
<p>A path that points to nothing gives 404. Read the message: it says the keypath was not found:</p>
<pre class="out">AUTO&gt; rest GET .../interface=Loopback99 -u apiuser:Api@2026
<span class="hl">HTTP/1.1 404 Not Found</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "uri keypath not found (no data at this path)"</span>
      }
    ]
  }</pre>
<p>A verb that the target does not accept gives 405, and the lab even tells you what to use instead:</p>
<pre class="out">AUTO&gt; rest POST .../interface=GigabitEthernet0%2F1/description ...
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
<p>A body that is not valid JSON gives 400, with the line and column of the first problem:</p>
<pre class="out">AUTO&gt; rest PATCH .../description -u netops:NK@2026 -d '{bad}'
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "malformed-message",
<span class="hl">        "error-message": "malformed JSON body: line 1, column 2: expected a property name in double quotes but found 'b'"</span>
      }
    ]
  }</pre>
<p>And sometimes there is no status at all, because there was nobody to answer. The HTTPS service on the router is off, so the TCP connection is refused:</p>
<pre class="out">AUTO&gt; rest GET .../ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">rest: (7) Failed to connect to 10.99.0.1 port 443 after 4 ms: Connection refused</span></pre>

<div class="eg"><p><b>Worked example.</b> Your script gets 401 on a call that worked yesterday. The first digit says "my side". The word Unauthorized says "login problem". The message says "authentication failed for user". So: check the username and password, not the URL and not the network. Ten seconds, no guessing.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Treating every failure as "the API is down". Only 5xx and a refused connection point at the server. (2) Retrying a 4xx in a loop: it will never succeed. (3) Reading only the number and ignoring <code>error-message</code>, which usually tells you the fix. (4) Thinking 401 and 403 are the same: 401 is "prove who you are", 403 is "you may not".</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 = authentication problem, 403 = authorisation problem, 404 = resource not found, 405 = method not allowed, 409 = conflict, 415 = unsupported media type, 201 = created, 204 = success with no body. Know the family first digits.</p></div>

<div class="scn"><h4>Three alerts, three different fixes</h4><p>Monday morning, a script fails on three routers. R1 returns 401, R2 returns 404, R3 prints "Connection refused" with no status. Nobody needs to log in to guess: R1 needs a correct credential, R2 has a path typo or a missing object, and R3 has its HTTPS service off or a firewall in the way.</p><p><b>Lesson:</b> the status code (or its absence) is the first clue and splits the problem in half.</p></div>

<div class="iv"><p class="q">"A REST call returns 4xx. What do you do?"</p><p>I read the status line and the error body first. 4xx means the request is wrong, so I check credentials for 401, the path and keys for 404, the verb for 405, the body and Content-Type for 400 and 415, and existing state for 409. I do not retry until I have changed something. For 5xx or a refused connection I check the device and service instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First digit: 2 worked, 4 your mistake, 5 server problem.</li>
<li>401 is login, 403 is permission, 404 is a wrong path, 405 is a wrong verb.</li>
<li>400 is a bad body or path, 409 is a clash, 415 is a wrong Content-Type.</li>
<li>Always read the error-message in the body.</li>
<li>Connection refused has no status line: the service is not listening.</li>
</ul></div>

`,hi:`

<p>Har reply ek <b>status line</b> se shuru hoti hai jaise <code>HTTP/1.1 404 Not Found</code>. Teen digit ka number is sawaal ka jawab hai: "kaam hua ya nahi, aur nahi hua to galti kiski?". Aapko sau codes yaad rakhne ki zaroorat nahi. Paanch families aur lagbhag das common codes seekh lo, to zyadatar API problems debug ho jaati hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Status code ka pehla digit pehle padho."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="145" height="70" rx="10" fill="#bbf7d0"/><text x="82.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">2xx</text><text x="82.5" y="70" text-anchor="middle" class="svg-muted" font-size="12">Safal</text><rect x="170" y="20" width="145" height="70" rx="10" fill="#bae6fd"/><text x="242.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">3xx</text><text x="242.5" y="70" text-anchor="middle" class="svg-muted" font-size="12">Redirect</text><rect x="330" y="20" width="145" height="70" rx="10" fill="#fde68a"/><text x="402.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">4xx</text><text x="402.5" y="70" text-anchor="middle" class="svg-muted" font-size="12">Aapki galti</text><rect x="490" y="20" width="140" height="70" rx="10" fill="#fecaca"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="14">5xx</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="12">Server ki dikkat</text><text x="82" y="120" text-anchor="middle" class="svg-muted" font-size="12">200 201 204</text><text x="242" y="120" text-anchor="middle" class="svg-muted" font-size="12">301 302</text><text x="402" y="120" text-anchor="middle" class="svg-muted" font-size="11">400 401 403 404 405 409 415</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">500 502 503</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="13">Pehla digit = kisko kuch karna hai</text></svg><p class="cap">Status code ka pehla digit pehle padho.</p></div>

<h3>Families</h3>
<ul>
<li><b>2xx</b>: kaam ho gaya. 200 OK (yeh lo data), 201 Created (naya object bana), 204 No Content (ho gaya, wapas dene ko kuch nahi).</li>
<li><b>3xx</b>: kahin aur jao. Device APIs mein kam hota hai.</li>
<li><b>4xx</b>: <i>aapne</i> kuch galat bheja. Request theek karo. Wahi request dobara bhejoge to phir fail hogi.</li>
<li><b>5xx</b>: <i>server</i> fail hua. Request theek ho sakti hai; device check karo, ruko, retry karo.</li>
</ul>

<h3>Sabse zyada milne wale 4xx codes</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Aam wajah</th></tr>
<tr><td>400 Bad Request</td><td>Request galat banayi gayi</td><td>Toota JSON, bina escape slash wala path</td></tr>
<tr><td>401 Unauthorized</td><td>Aap kaun ho?</td><td>Galat ya missing username/password</td></tr>
<tr><td>403 Forbidden</td><td>Pehchaana, par nahi</td><td>User ke paas privilege nahi</td></tr>
<tr><td>404 Not Found</td><td>Us path par data nahi</td><td>Module, interface ya key mein typo</td></tr>
<tr><td>405 Method Not Allowed</td><td>Yahan yeh verb galat hai</td><td>Leaf value par POST</td></tr>
<tr><td>409 Conflict</td><td>Maujooda state se takraav</td><td>Pehle se maujood object ka POST</td></tr>
<tr><td>415 Unsupported Media Type</td><td>Yeh body format padh nahi sakta</td><td>Galat Content-Type header</td></tr></table>

<h3>Asli mein dekhte hain</h3>
<p>Galat password 401 deta hai, aur reply mein <code>WWW-Authenticate</code> header bhi hota hai jo batata hai server kaunsa login style chahta hai. Body (JSON) <code>error-message</code> mein sahi wajah batati hai:</p>
<pre class="out">AUTO&gt; rest GET .../ietf-interfaces:interfaces -u apiuser:wrongpass
<span class="hl">HTTP/1.1 401 Unauthorized</span>
Content-Type: application/yang-data+json
WWW-Authenticate: Basic realm="restconf"

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
<span class="hl">        "error-message": "authentication failed for user \\"apiuser\\""</span>
      }
    ]</pre>
<p>Jo path kisi cheez ki taraf nahi jaata woh 404 deta hai. Message padho: keypath nahi mila:</p>
<pre class="out">AUTO&gt; rest GET .../interface=Loopback99 -u apiuser:Api@2026
<span class="hl">HTTP/1.1 404 Not Found</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "uri keypath not found (no data at this path)"</span>
      }
    ]
  }</pre>
<p>Jo verb target accept nahi karta woh 405 deta hai, aur lab batata bhi hai ki kya use karna hai:</p>
<pre class="out">AUTO&gt; rest POST .../interface=GigabitEthernet0%2F1/description ...
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
<p>Jo body valid JSON nahi woh 400 deta hai, pehli galti ki line aur column ke saath:</p>
<pre class="out">AUTO&gt; rest PATCH .../description -u netops:NK@2026 -d '{bad}'
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "malformed-message",
<span class="hl">        "error-message": "malformed JSON body: line 1, column 2: expected a property name in double quotes but found 'b'"</span>
      }
    ]
  }</pre>
<p>Aur kabhi status hota hi nahi, kyunki jawab dene wala koi tha hi nahi. Router par HTTPS service band hai, isliye TCP connection refuse ho gaya:</p>
<pre class="out">AUTO&gt; rest GET .../ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">rest: (7) Failed to connect to 10.99.0.1 port 443 after 4 ms: Connection refused</span></pre>

<div class="eg"><p><b>Worked example.</b> Aapki script ko us call par 401 mila jo kal chali thi. Pehla digit kehta hai "meri taraf". Unauthorized kehta hai "login ki dikkat". Message kehta hai "authentication failed for user". To: username aur password check karo, URL ya network nahi. Das second, koi andaaza nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Har failure ko "API down hai" samajhna. Sirf 5xx aur refused connection server ki taraf ishaara karte hain. (2) 4xx ko loop mein retry karna: woh kabhi succeed nahi hoga. (3) Sirf number padhna aur <code>error-message</code> ignore karna, jo aksar fix batata hai. (4) 401 aur 403 ko ek samajhna: 401 "pehchaan do", 403 "aapko ijazat nahi".</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 = authentication problem, 403 = authorisation problem, 404 = resource not found, 405 = method not allowed, 409 = conflict, 415 = unsupported media type, 201 = created, 204 = bina body ke success. Families ke pehle digit jaano.</p></div>

<div class="scn"><h4>Teen alerts, teen alag fix</h4><p>Somvar subah, ek script teen routers par fail hoti hai. R1 401 deta hai, R2 404 deta hai, R3 bina status ke "Connection refused" print karta hai. Login karke andaaza lagane ki zaroorat nahi: R1 ko sahi credential chahiye, R2 mein path typo ya missing object hai, aur R3 ki HTTPS service band hai ya beech mein firewall hai.</p><p><b>Lesson:</b> status code (ya uska na hona) pehla clue hai aur problem ko aadha kar deta hai.</p></div>

<div class="iv"><p class="q">"REST call 4xx return kare to aap kya karte ho?"</p><p>Pehle status line aur error body padhta hoon. 4xx ka matlab request galat hai, isliye 401 par credentials, 404 par path aur keys, 405 par verb, 400 aur 415 par body aur Content-Type, aur 409 par maujooda state check karta hoon. Kuch badle bina retry nahi karta. 5xx ya refused connection par device aur service check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla digit: 2 chala, 4 aapki galti, 5 server ki dikkat.</li>
<li>401 login hai, 403 permission, 404 galat path, 405 galat verb.</li>
<li>400 kharab body ya path, 409 takraav, 415 galat Content-Type.</li>
<li>Body ka error-message hamesha padho.</li>
<li>Connection refused mein status line nahi hoti: service sun nahi rahi.</li>
</ul></div>

`}};export{e as default};