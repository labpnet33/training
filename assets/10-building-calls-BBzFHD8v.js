var e={id:`building-calls`,h:{en:`Constructing API calls from the documentation (and Lab 2)`,hi:`Documentation se API calls banana (aur Lab 2)`},body:{en:`
<p>You now know nine platforms. The skill that carries across all of them is <b>turning an API reference page into a working call</b>. The exam gives you a snippet of documentation or a half-finished script and asks which part is wrong. This chapter gives you a method, a table of "what the answer looks like" for each platform, and a walk through Lab 2, where you fix a broken call using only the documentation and the status codes.</p>

<h3>The five parts of every call</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Anatomy of an API call">
<rect x="10" y="10" width="620" height="190" rx="8" fill="#e2e8f0"/>
<rect x="24" y="24" width="120" height="40" rx="8" fill="#fde68a"/><text x="84" y="49" text-anchor="middle" class="svg-ink" font-size="13">1 Method</text>
<rect x="156" y="24" width="460" height="40" rx="8" fill="#bae6fd"/><text x="386" y="49" text-anchor="middle" class="svg-ink" font-size="13">2 URL = base + path + path parameters + ?query</text>
<rect x="24" y="76" width="592" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="101" text-anchor="middle" class="svg-ink" font-size="13">3 Headers: authentication, Accept (what I want), Content-Type (what I send)</text>
<rect x="24" y="128" width="592" height="30" rx="8" fill="#ddd6fe"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">4 Body: JSON, XML, SOAP or form fields (only for POST, PUT, PATCH)</text>
<rect x="24" y="166" width="592" height="26" rx="8" fill="#fed7aa"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="13">5 Read the reply: status code, useful headers, body wrapper</text>
</svg><p class="cap">Check these five, in order, every time something fails.</p></div>
<ol>
<li><b>Method.</b> The reference names it. GET reads, POST creates or triggers, PUT replaces, PATCH merges, DELETE removes. Using the wrong one gives 405 or an unexpected result.</li>
<li><b>URL.</b> Base URL, then the path, with the object ids filled in, then optional query parameters. Special characters inside a value must be percent-encoded (a slash inside a name becomes <code>%2F</code>).</li>
<li><b>Headers.</b> Authentication first (the platform's own style). <code>Accept</code> says what format you want back. <code>Content-Type</code> says what you are sending. A mismatch gives 406 or 415.</li>
<li><b>Body.</b> Exactly the shape in the reference: required fields present, names spelled the same, nesting correct. Python's <code>json=</code> turns a dictionary into JSON for you.</li>
<li><b>Reply.</b> Status code first, then headers such as <code>Location</code> (where the new object lives) or <code>Retry-After</code>, then the body.</li>
</ol>

<h3>Where the data hides: the wrapper key</h3>
<p>Beginners write correct calls and then crash on <code>KeyError</code> because every platform wraps the list differently.</p>
<table class="cmp"><tr><th>Platform</th><th>Reply shape</th><th>Read it with</th></tr>
<tr><td>Meraki</td><td>A bare JSON list</td><td>r.json()</td></tr>
<tr><td>Catalyst Center</td><td>{"response": [...], "version": ...}</td><td>r.json()["response"]</td></tr>
<tr><td>ACI</td><td>{"imdata": [{"fvTenant": {"attributes": {...}}}], "totalCount": ...}</td><td>r.json()["imdata"]</td></tr>
<tr><td>SD-WAN Manager</td><td>{"data": [...]}</td><td>r.json()["data"]</td></tr>
<tr><td>Webex</td><td>{"items": [...]}</td><td>r.json()["items"]</td></tr>
<tr><td>RESTCONF (NSO, devices)</td><td>{"module:name": ...}, qualified key</td><td>r.json()["ietf-interfaces:interface"]</td></tr>
<tr><td>FMC</td><td>{"items": [...], "paging": {...}}</td><td>r.json()["items"]</td></tr></table>

<h3>Status codes you will meet again and again</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>First thing to check</th></tr>
<tr><td>200 / 201 / 204</td><td>OK / Created / OK with no body</td><td>Nothing; 204 is normal for PUT, PATCH and DELETE</td></tr>
<tr><td>400</td><td>Bad request</td><td>Body shape, missing field, malformed path</td></tr>
<tr><td>401</td><td>Not authenticated</td><td>Wrong or expired credential, wrong header name</td></tr>
<tr><td>403</td><td>Authenticated but not allowed</td><td>Role or permission; missing XSRF token</td></tr>
<tr><td>404</td><td>Nothing at this path</td><td>Typo, wrong id, wrong API version</td></tr>
<tr><td>405</td><td>Method not allowed here</td><td>Use the method the reference lists</td></tr>
<tr><td>406 / 415</td><td>Cannot give that format / cannot read what you sent</td><td>Accept and Content-Type headers</td></tr>
<tr><td>429</td><td>Too many requests</td><td>Wait Retry-After seconds, then retry</td></tr>
<tr><td>5xx</td><td>Server-side problem</td><td>Retry later, check the platform</td></tr></table>

<h3>Lab 2 walk-through: three mistakes, three status codes</h3>
<p>In Lab 2 the script <code>describe.py</code> tries to put the description "WAN-UPLINK set by API" on interface Gi0/1 of two routers. The file <code>api-notes.txt</code> is the "documentation". Let the codes guide you, as a real engineer does.</p>
<pre class="out">AUTO&gt; python3 describe.py
10.99.0.1 PATCH -&gt; <span class="hl">406</span>
requests.exceptions.HTTPError: 406 Client Error: Not Acceptable ...</pre>
<p><b>406 = headers.</b> The script asks for <code>Accept: text/html</code>, but the notes say <code>application/yang-data+json</code>. Fix that one value and run again.</p>
<pre class="out">AUTO&gt; python3 describe.py
10.99.0.1 PATCH -&gt; <span class="hl">400</span></pre>
<p><b>400 = the request itself is malformed.</b> The header is now accepted, so the server looks at the URL. The notes say the first path node must be module-qualified (<code>ietf-interfaces:interfaces</code>), and the script wrote just <code>interfaces</code>. There is a second problem hiding behind it: the interface name has a slash, which must be written <code>%2F</code>. Fix both in the URL.</p>
<pre class="out">AUTO&gt; python3 describe.py
10.99.0.1 PATCH -&gt; <span class="hl">204</span>
10.99.0.2 PATCH -&gt; <span class="hl">204</span></pre>
<p><b>204 = success, no body.</b> Do not stop here: read the value back with a GET (the lab asks you to append one line) and look at the router's own CLI. A status code says the server accepted the request; the router's configuration is the proof.</p>

<h3>Idempotency: can I run it twice?</h3>
<p>An operation is <b>idempotent</b> if repeating it leaves the same result. GET, PUT and DELETE are idempotent; POST usually is not (two POSTs may create two objects). PATCH with the same fields is safe to repeat. Before you put a call in a scheduled job, ask: "what happens on the second run?"</p>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once and not knowing which one fixed it; change one thing per run. Trusting the status code without reading the data back. Copying a body from a blog that uses an older field name. Forgetting <code>verify</code> and certificate handling and then switching it off in production.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam often shows a call with one wrong detail (wrong header name for the platform, token in the wrong place, GET where POST is needed, missing Content-Type). Compare each of the five parts against what you know about that platform's login and objects.</p></div>

<div class="scn"><h4>The 415 that took two hours</h4><p>A developer posted a JSON body to an API and kept getting 415 Unsupported Media Type. The body was valid and the credentials were fine. He had set the header <code>Content-Type: text/plain</code> because an earlier test used plain text and a helper function reused it. Switching to <code>json=body</code> in requests (which sets the right header) fixed it in one line.</p><p><b>Lesson:</b> when the body is right but the call fails, read the headers next.</p></div>

<div class="iv"><p class="q">"Your API call returns 400. How do you debug it?"</p><p>Read the response body, because most platforms say what is wrong. Then check the five parts: method, URL (path and encoding), headers (Content-Type), the body against the reference (required fields, names, nesting) and the version of the API. Compare with a working example from the docs, change one thing at a time and verify the result by reading the object back.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every call has five parts: method, URL, headers, body, and how you read the reply.</li>
<li>Know each platform's wrapper key: response, imdata, data, items, or a module-qualified key.</li>
<li>406 and 415 point to Accept and Content-Type; 400 to the body or path; 401 to credentials; 403 to permissions; 429 to rate limits.</li>
<li>Percent-encode special characters in path values (a slash becomes %2F).</li>
<li>Always verify by reading the object back; know which methods are idempotent.</li>
</ul></div>
`,hi:`
<p>Ab aap nau platforms jaante ho. Jo skill sab par kaam aati hai woh hai <b>API reference page ko chalti hui call mein badalna</b>. Exam aapko documentation ka tukda ya adhoori script deta hai aur poochta hai ki kaunsa hissa galat hai. Yeh chapter aapko ek method deta hai, har platform ke liye "jawab kaisa dikhta hai" ki table, aur Lab 2 ka walk-through, jismein aap sirf documentation aur status codes se tooti hui call theek karte ho.</p>

<h3>Har call ke paanch hisse</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Anatomy of an API call">
<rect x="10" y="10" width="620" height="190" rx="8" fill="#e2e8f0"/>
<rect x="24" y="24" width="120" height="40" rx="8" fill="#fde68a"/><text x="84" y="49" text-anchor="middle" class="svg-ink" font-size="13">1 Method</text>
<rect x="156" y="24" width="460" height="40" rx="8" fill="#bae6fd"/><text x="386" y="49" text-anchor="middle" class="svg-ink" font-size="13">2 URL = base + path + path parameters + ?query</text>
<rect x="24" y="76" width="592" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="101" text-anchor="middle" class="svg-ink" font-size="13">3 Headers: authentication, Accept (kya chahiye), Content-Type (kya bhej raha hoon)</text>
<rect x="24" y="128" width="592" height="30" rx="8" fill="#ddd6fe"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">4 Body: JSON, XML, SOAP ya form fields (sirf POST, PUT, PATCH ke liye)</text>
<rect x="24" y="166" width="592" height="26" rx="8" fill="#fed7aa"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="13">5 Reply padho: status code, kaam ke headers, body wrapper</text>
</svg><p class="cap">Jab bhi kuch fail ho, yeh paanch cheezein is order mein check karo.</p></div>
<ol>
<li><b>Method.</b> Reference uska naam batata hai. GET padhta hai, POST banata ya trigger karta hai, PUT replace karta hai, PATCH merge karta hai, DELETE hatata hai. Galat method 405 ya anjaana result deta hai.</li>
<li><b>URL.</b> Base URL, phir path, object ids bhare hue, phir optional query parameters. Value ke andar ke special characters percent-encode hone chahiye (naam ke andar slash <code>%2F</code> ban jaata hai).</li>
<li><b>Headers.</b> Pehle authentication (platform ka apna style). <code>Accept</code> batata hai ki wapas kaunsa format chahiye. <code>Content-Type</code> batata hai ki aap kya bhej rahe ho. Mismatch 406 ya 415 deta hai.</li>
<li><b>Body.</b> Bilkul reference wali shakal: required fields maujood, naam wahi spelling, nesting sahi. Python ka <code>json=</code> dictionary ko aapke liye JSON bana deta hai.</li>
<li><b>Reply.</b> Pehle status code, phir <code>Location</code> (naya object kahan hai) ya <code>Retry-After</code> jaise headers, phir body.</li>
</ol>

<h3>Data kahan chhupa hai: wrapper key</h3>
<p>Beginners sahi call likhte hain aur phir <code>KeyError</code> par crash hote hain, kyunki har platform list ko alag tarah wrap karta hai.</p>
<table class="cmp"><tr><th>Platform</th><th>Reply ki shakal</th><th>Kaise padhein</th></tr>
<tr><td>Meraki</td><td>Seedhi JSON list</td><td>r.json()</td></tr>
<tr><td>Catalyst Center</td><td>{"response": [...], "version": ...}</td><td>r.json()["response"]</td></tr>
<tr><td>ACI</td><td>{"imdata": [{"fvTenant": {"attributes": {...}}}], "totalCount": ...}</td><td>r.json()["imdata"]</td></tr>
<tr><td>SD-WAN Manager</td><td>{"data": [...]}</td><td>r.json()["data"]</td></tr>
<tr><td>Webex</td><td>{"items": [...]}</td><td>r.json()["items"]</td></tr>
<tr><td>RESTCONF (NSO, devices)</td><td>{"module:name": ...}, qualified key</td><td>r.json()["ietf-interfaces:interface"]</td></tr>
<tr><td>FMC</td><td>{"items": [...], "paging": {...}}</td><td>r.json()["items"]</td></tr></table>

<h3>Status codes jo baar-baar milenge</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Pehle kya check karo</th></tr>
<tr><td>200 / 201 / 204</td><td>OK / Created / bina body ke OK</td><td>Kuch nahi; PUT, PATCH aur DELETE ke liye 204 normal hai</td></tr>
<tr><td>400</td><td>Bad request</td><td>Body ki shakal, missing field, bigda hua path</td></tr>
<tr><td>401</td><td>Authenticated nahi</td><td>Galat ya expire credential, header ka galat naam</td></tr>
<tr><td>403</td><td>Authenticated par allowed nahi</td><td>Role ya permission; missing XSRF token</td></tr>
<tr><td>404</td><td>Is path par kuch nahi</td><td>Typo, galat id, galat API version</td></tr>
<tr><td>405</td><td>Yahan method allowed nahi</td><td>Reference mein jo method hai wahi use karo</td></tr>
<tr><td>406 / 415</td><td>Woh format de nahi sakta / jo bheja use padh nahi sakta</td><td>Accept aur Content-Type headers</td></tr>
<tr><td>429</td><td>Bahut zyada requests</td><td>Retry-After second ruko, phir retry</td></tr>
<tr><td>5xx</td><td>Server-side problem</td><td>Baad mein retry, platform check karo</td></tr></table>

<h3>Lab 2 walk-through: teen galtiyan, teen status codes</h3>
<p>Lab 2 mein script <code>describe.py</code> do routers ke interface Gi0/1 par description "WAN-UPLINK set by API" lagane ki koshish karti hai. File <code>api-notes.txt</code> "documentation" hai. Codes se raasta lo, jaise asli engineer lete hain.</p>
<pre class="out">AUTO&gt; python3 describe.py
10.99.0.1 PATCH -&gt; <span class="hl">406</span>
requests.exceptions.HTTPError: 406 Client Error: Not Acceptable ...</pre>
<p><b>406 = headers.</b> Script <code>Accept: text/html</code> maangti hai, par notes <code>application/yang-data+json</code> kehte hain. Ek value theek karo aur dobara chalao.</p>
<pre class="out">AUTO&gt; python3 describe.py
10.99.0.1 PATCH -&gt; <span class="hl">400</span></pre>
<p><b>400 = request khud bigdi hui hai.</b> Header ab accept ho gaya, isliye server URL dekhta hai. Notes kehte hain ki path ka pehla node module-qualified hona chahiye (<code>ietf-interfaces:interfaces</code>), aur script ne sirf <code>interfaces</code> likha. Uske peeche ek doosri problem chhupi hai: interface naam mein slash hai, jise <code>%2F</code> likhna padta hai. URL mein dono theek karo.</p>
<pre class="out">AUTO&gt; python3 describe.py
10.99.0.1 PATCH -&gt; <span class="hl">204</span>
10.99.0.2 PATCH -&gt; <span class="hl">204</span></pre>
<p><b>204 = success, bina body.</b> Yahan ruko mat: GET se value wapas padho (lab aapse ek line jodne ko kehta hai) aur router ka apna CLI dekho. Status code batata hai ki server ne request accept ki; router ki configuration proof hai.</p>

<h3>Idempotency: kya main ise do baar chala sakta hoon?</h3>
<p>Koi operation <b>idempotent</b> hota hai agar use dohrane se result wahi rahe. GET, PUT aur DELETE idempotent hain; POST aam taur par nahi (do POST do objects bana sakte hain). Wahi fields ke saath PATCH dohrana safe hai. Call ko scheduled job mein daalne se pehle poochho: "doosri run par kya hoga?"</p>

<div class="warn"><p><b>Common mistakes.</b> Ek saath teen cheezein badalna aur pata na chalna ki kisne fix kiya; ek run mein ek hi cheez badlo. Data wapas padhe bina status code par bharosa karna. Purane field naam wale blog se body copy karna. <code>verify</code> aur certificate handling bhool jana aur phir production mein use band kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam aksar aisi call dikhata hai jismein ek detail galat hoti hai (platform ke liye galat header naam, token galat jagah, POST ki jagah GET, missing Content-Type). Paanchon hisson ko us platform ke login aur objects ki apni samajh se compare karo.</p></div>

<div class="scn"><h4>Do ghante wala 415</h4><p>Ek developer API par JSON body POST karta raha aur 415 Unsupported Media Type milta raha. Body valid thi aur credentials theek the. Usne header <code>Content-Type: text/plain</code> set kiya tha kyunki pehle ek test plain text ka tha aur helper function wahi dobara use kar raha tha. requests mein <code>json=body</code> par jaane se (jo sahi header khud set karta hai) ek line mein fix ho gaya.</p><p><b>Lesson:</b> body sahi ho par call fail ho to agla kadam headers padhna hai.</p></div>

<div class="iv"><p class="q">"Aapki API call 400 lautati hai. Debug kaise karoge?"</p><p>Response body padho, kyunki zyadatar platforms batate hain kya galat hai. Phir paanch hisse check karo: method, URL (path aur encoding), headers (Content-Type), body ko reference se compare karo (required fields, naam, nesting) aur API ka version. Docs ke working example se compare karo, ek baar mein ek cheez badlo aur object wapas padhkar result verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har call ke paanch hisse: method, URL, headers, body, aur reply padhne ka tareeka.</li>
<li>Har platform ki wrapper key jaano: response, imdata, data, items, ya module-qualified key.</li>
<li>406 aur 415 Accept aur Content-Type ki taraf; 400 body ya path; 401 credentials; 403 permissions; 429 rate limits.</li>
<li>Path values ke special characters percent-encode karo (slash %2F ban jaata hai).</li>
<li>Hamesha object wapas padhkar verify karo; jaano kaunse methods idempotent hain.</li>
</ul></div>
`}};export{e as default};