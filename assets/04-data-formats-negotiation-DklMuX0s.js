var e={id:`formats`,h:{en:`Data formats and content negotiation: Accept and Content-Type`,hi:`Data formats aur content negotiation: Accept aur Content-Type`},body:{en:`
<p>When you phone a call centre you first agree on a language: "Do you speak Hindi or English?" Two programs must also agree on a language for the data. They do it with two headers. <code>Content-Type</code> says "the data <i>I am sending</i> is in this format". <code>Accept</code> says "I would like the data <i>you send back</i> in this format". This agreement is called <b>content negotiation</b>. It is exam topic 2.8, and it explains two of the most confusing status codes, 406 and 415.</p>

<h3>The three formats you must know</h3>
<div class="tbl"><table class="cmp"><tr><th>Format</th><th>Looks like</th><th>Typical use in networking</th></tr>
<tr><td><b>JSON</b></td><td>Curly braces, quoted keys</td><td>REST and RESTCONF APIs, Meraki, Catalyst Center, webhooks</td></tr>
<tr><td><b>XML</b></td><td>Nested tags</td><td>NETCONF, SOAP, older APIs, RESTCONF on request</td></tr>
<tr><td><b>YAML</b></td><td>Indented lines, no braces</td><td>Ansible playbooks, OpenAPI files, CI configs; for files that humans edit</td></tr></table></div>
<p>The same interface in the three formats:</p>
<pre class="code">JSON:  {"name": "Loopback10", "enabled": true}

XML:   &lt;interface&gt;
         &lt;name&gt;Loopback10&lt;/name&gt;
         &lt;enabled&gt;true&lt;/enabled&gt;
       &lt;/interface&gt;

YAML:  name: Loopback10
       enabled: true</pre>
<p>JSON rules that cause most 400 errors: keys and text in <b>double</b> quotes (never single), no trailing comma after the last item, <code>true</code>, <code>false</code> and <code>null</code> in lower case and without quotes, and numbers without quotes (<code>"10"</code> is text, <code>10</code> is a number).</p>

<h3>Media types: the names of formats</h3>
<p>A format has an official name called a <b>media type</b> (also MIME type): <code>application/json</code>, <code>application/xml</code>, <code>text/html</code>, <code>text/plain</code>. RESTCONF defines its own: <code>application/yang-data+json</code> and <code>application/yang-data+xml</code>. The part after the plus sign tells you the underlying syntax.</p>

<h3>Accept and Content-Type in action</h3>
<ul>
<li><b>Request with a body</b> (POST, PUT, PATCH): send <code>Content-Type</code> to describe the body. If it is missing or wrong, expect <b>415 Unsupported Media Type</b>.</li>
<li><b>Any request</b> where you care about the answer: send <code>Accept</code>. If the server cannot produce any listed type, it may answer <b>406 Not Acceptable</b>.</li>
<li>A list is allowed with preferences, called <b>q-values</b> (0 to 1): <code>Accept: application/json;q=0.9, application/xml;q=0.5</code> means "JSON preferred, XML if you must".</li>
<li>The <b>response</b> also has a <code>Content-Type</code>: always read it before parsing. An error page in HTML must not be fed to a JSON parser.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Accept and Content-Type">
<rect x="20" y="60" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="14">Client</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">script</text>
<rect x="490" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="14">Server</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">router API</text>
<line x1="150" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="12">Content-Type: body I send is JSON</text>
<text x="320" y="98" text-anchor="middle" class="svg-accent" font-size="12">Accept: I want JSON back</text>
<line x1="490" y1="120" x2="150" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">Content-Type: body I return is JSON</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">Cannot read your body: 415. Cannot produce your Accept: 406.</text>
</svg><p class="cap">Content-Type describes the data in <i>this</i> message. Accept lists what the client is willing to receive.</p></div>

<h3>See 406 and 415 with the lab router</h3>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback10 -u netops:NK@2026 -H 'Accept: text/html'</pre>
<pre class="out">HTTP/1.1 <span class="hl">406 Not Acceptable</span>
Content-Type: application/yang-data+json
...
"error-message": "Accept must be application/yang-data+json or application/yang-data+xml"</pre>
<p>The router names the fix in its message. Replace <code>text/html</code> with <code>application/yang-data+json</code>. For 415 the cause is on the sending side: a body sent with <code>Content-Type: application/xml</code> to an endpoint that only reads JSON (you met this in the HTTP module).</p>

<h3>Working with formats in Python</h3>
<p>requests helps you for JSON. With <code>json=body</code> it converts the dictionary to JSON text and sets <code>Content-Type: application/json</code> unless you set your own header, which you must do for RESTCONF (<code>application/yang-data+json</code>). With <code>data=...</code> and a dictionary, it sends form fields (<code>application/x-www-form-urlencoded</code>), which is something different.</p>
<pre class="code">import json, requests
r = requests.get(url, headers={"Accept": "application/json"}, timeout=10)
print(r.headers["Content-Type"])      # check what really came back
if "json" in r.headers.get("Content-Type", ""):
    data = r.json()                   # JSON text -&gt; dict / list
else:
    print("Not JSON, first 80 characters:", r.text[:80])

text = json.dumps(data, indent=2)     # dict -&gt; pretty JSON text (for logs)
back = json.loads(text)               # text -&gt; dict</pre>
<p>For YAML use <code>yaml.safe_load(text)</code> (reading) and <code>yaml.safe_dump(data)</code> (writing); always the "safe" versions. For XML use <code>xml.etree.ElementTree.fromstring(text)</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Sending JSON with <code>Content-Type: text/plain</code> or no header; copying <code>Accept: application/json</code> to a RESTCONF device that wants the <code>yang-data+json</code> name; calling <code>r.json()</code> on a 404 HTML page; writing JSON with single quotes (Python dictionary syntax is not JSON text).</p></div>
<div class="exam"><p><b>Exam trap.</b> Content-Type = format of what <i>this message carries</i>. Accept = format the client <i>wants back</i>. 415 points at your body, 406 points at your Accept.</p></div>

<div class="scn"><h4>The page that was not JSON</h4><p>Lab 2's audit script died with <code>JSONDecodeError: Expecting value</code> on router R2. The code looked correct. The engineer printed <code>r.status_code</code> and <code>r.text</code> and saw 404 with a small HTML page: RESTCONF was disabled on R2, and the server answers with HTML, not JSON. After <code>restconf</code> was enabled, the same code worked.</p><p><b>Lesson:</b> A JSON parse error usually means the body is not JSON, which means an error page. Look at the status code and the Content-Type first.</p></div>

<div class="iv"><p class="q">"What is the difference between the Accept and Content-Type headers?"</p><p>Content-Type describes the format of the body in the message that carries it, for example the JSON I POST. Accept tells the server which formats I can read in the response. A wrong Content-Type typically gives 415; an Accept the server cannot satisfy gives 406. Add that the response Content-Type should be checked before parsing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON for REST, XML for NETCONF and SOAP, YAML for human-edited files.</li>
<li>Content-Type describes this message's body; Accept lists formats the client wants back.</li>
<li>415 = server cannot read your body format; 406 = server cannot produce what you accept.</li>
<li>RESTCONF uses application/yang-data+json and application/yang-data+xml.</li>
<li>Check the response Content-Type and status code before calling <code>r.json()</code>.</li>
</ul></div>
`,hi:`
<p>Call centre ko phone karte waqt pehle bhasha tay hoti hai: "Hindi ya English?" Do programs ko bhi data ki bhasha par sehmat hona padta hai. Woh do headers se karte hain. <code>Content-Type</code> kehta hai "jo data <i>main bhej raha hoon</i> woh is format mein hai". <code>Accept</code> kehta hai "jo data <i>aap wapas bhejoge</i> woh mujhe is format mein chahiye". Is sehmati ko <b>content negotiation</b> kehte hain. Yeh exam topic 2.8 hai, aur yeh do sabse confusing status codes, 406 aur 415, ko samjhata hai.</p>

<h3>Teen formats jo aapko aane chahiye</h3>
<div class="tbl"><table class="cmp"><tr><th>Format</th><th>Dikhta kaisa hai</th><th>Networking mein use</th></tr>
<tr><td><b>JSON</b></td><td>Curly braces, quoted keys</td><td>REST aur RESTCONF APIs, Meraki, Catalyst Center, webhooks</td></tr>
<tr><td><b>XML</b></td><td>Nested tags</td><td>NETCONF, SOAP, purani APIs, maangne par RESTCONF</td></tr>
<tr><td><b>YAML</b></td><td>Indented lines, braces nahi</td><td>Ansible playbooks, OpenAPI files, CI configs; insaan jo files edit karte hain</td></tr></table></div>
<p>Wahi interface teen formats mein:</p>
<pre class="code">JSON:  {"name": "Loopback10", "enabled": true}

XML:   &lt;interface&gt;
         &lt;name&gt;Loopback10&lt;/name&gt;
         &lt;enabled&gt;true&lt;/enabled&gt;
       &lt;/interface&gt;

YAML:  name: Loopback10
       enabled: true</pre>
<p>JSON ke rules jinse zyada tar 400 errors aate hain: keys aur text <b>double</b> quotes mein (single kabhi nahi), aakhri item ke baad trailing comma nahi, <code>true</code>, <code>false</code> aur <code>null</code> lower case mein aur bina quotes ke, aur numbers bina quotes ke (<code>"10"</code> text hai, <code>10</code> number hai).</p>

<h3>Media types: formats ke naam</h3>
<p>Har format ka official naam hota hai jise <b>media type</b> (MIME type bhi) kehte hain: <code>application/json</code>, <code>application/xml</code>, <code>text/html</code>, <code>text/plain</code>. RESTCONF apne khud ke define karta hai: <code>application/yang-data+json</code> aur <code>application/yang-data+xml</code>. Plus ke baad wala hissa underlying syntax batata hai.</p>

<h3>Accept aur Content-Type kaam mein</h3>
<ul>
<li><b>Body wali request</b> (POST, PUT, PATCH): body describe karne ke liye <code>Content-Type</code> bhejo. Agar missing ya galat ho to <b>415 Unsupported Media Type</b> ki umeed rakho.</li>
<li><b>Koi bhi request</b> jahan jawab ka format maayne rakhta hai: <code>Accept</code> bhejo. Agar server listed types mein se kuch bana nahi sakta, to woh <b>406 Not Acceptable</b> de sakta hai.</li>
<li>Preferences ke saath list bhi chalti hai, jise <b>q-values</b> kehte hain (0 se 1): <code>Accept: application/json;q=0.9, application/xml;q=0.5</code> ka matlab "JSON pasand, majboori ho to XML".</li>
<li><b>Response</b> mein bhi <code>Content-Type</code> hota hai: parse karne se pehle hamesha padho. HTML error page ko JSON parser mein mat daalo.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Accept and Content-Type">
<rect x="20" y="60" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="14">Client</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">script</text>
<rect x="490" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="14">Server</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">router API</text>
<line x1="150" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="12">Content-Type: meri body JSON hai</text>
<text x="320" y="98" text-anchor="middle" class="svg-accent" font-size="12">Accept: mujhe JSON wapas chahiye</text>
<line x1="490" y1="120" x2="150" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">Content-Type: lautayi body JSON hai</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">Body padh nahi paya: 415. Accept bana nahi paya: 406.</text>
</svg><p class="cap">Content-Type <i>is</i> message ka data describe karta hai. Accept batata hai client kya receive karne ko taiyar hai.</p></div>

<h3>Lab router ke saath 406 aur 415 dekho</h3>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback10 -u netops:NK@2026 -H 'Accept: text/html'</pre>
<pre class="out">HTTP/1.1 <span class="hl">406 Not Acceptable</span>
Content-Type: application/yang-data+json
...
"error-message": "Accept must be application/yang-data+json or application/yang-data+xml"</pre>
<p>Router apne message mein fix khud batata hai. <code>text/html</code> ko <code>application/yang-data+json</code> se badlo. 415 ki wajah bhejne wali taraf hoti hai: aisi body jo <code>Content-Type: application/xml</code> ke saath us endpoint ko gayi jo sirf JSON padhta hai (HTTP module mein aap yeh mil chuke ho).</p>

<h3>Python mein formats ke saath kaam</h3>
<p>JSON mein requests madad karta hai. <code>json=body</code> se woh dictionary ko JSON text mein badalta hai aur <code>Content-Type: application/json</code> set karta hai jab tak aap apna header na do, jo RESTCONF ke liye aapko dena hi padta hai (<code>application/yang-data+json</code>). <code>data=...</code> ke saath dictionary dene par woh form fields bhejta hai (<code>application/x-www-form-urlencoded</code>), jo alag cheez hai.</p>
<pre class="code">import json, requests
r = requests.get(url, headers={"Accept": "application/json"}, timeout=10)
print(r.headers["Content-Type"])      # check karo asal mein kya aaya
if "json" in r.headers.get("Content-Type", ""):
    data = r.json()                   # JSON text -&gt; dict / list
else:
    print("Not JSON, first 80 characters:", r.text[:80])

text = json.dumps(data, indent=2)     # dict -&gt; pretty JSON text (logs ke liye)
back = json.loads(text)               # text -&gt; dict</pre>
<p>YAML ke liye <code>yaml.safe_load(text)</code> (padhna) aur <code>yaml.safe_dump(data)</code> (likhna); hamesha "safe" versions. XML ke liye <code>xml.etree.ElementTree.fromstring(text)</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> JSON ko <code>Content-Type: text/plain</code> ya bina header ke bhejna; <code>Accept: application/json</code> ko us RESTCONF device par copy karna jo <code>yang-data+json</code> naam chahta hai; 404 HTML page par <code>r.json()</code> call karna; JSON ko single quotes se likhna (Python dictionary syntax JSON text nahi hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> Content-Type = <i>is message</i> mein jo hai uska format. Accept = client ko <i>wapas</i> kya chahiye. 415 aapki body ki taraf ishara karta hai, 406 aapke Accept ki taraf.</p></div>

<div class="scn"><h4>Woh page jo JSON nahi tha</h4><p>Lab 2 ki audit script router R2 par <code>JSONDecodeError: Expecting value</code> ke saath mar gayi. Code theek dikh raha tha. Engineer ne <code>r.status_code</code> aur <code>r.text</code> print kiye aur 404 ke saath chhota HTML page dekha: R2 par RESTCONF disabled tha, aur server JSON ki jagah HTML se jawab deta hai. <code>restconf</code> enable karne ke baad wahi code chal gaya.</p><p><b>Lesson:</b> JSON parse error ka aam matlab hota hai ki body JSON nahi hai, yaani error page. Pehle status code aur Content-Type dekho.</p></div>

<div class="iv"><p class="q">"Accept aur Content-Type headers mein kya farak hai?"</p><p>Content-Type us message ki body ka format batata hai jisme woh hai, jaise jo JSON main POST karta hoon. Accept server ko batata hai ki response mein main kaunse formats padh sakta hoon. Galat Content-Type aam taur par 415 deta hai; server ka satisfy na kar paane wala Accept 406 deta hai. Yeh bhi jodo ki parse karne se pehle response ka Content-Type check karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>REST ke liye JSON, NETCONF aur SOAP ke liye XML, insaano ki edit ki files ke liye YAML.</li>
<li>Content-Type is message ki body describe karta hai; Accept woh formats batata hai jo client wapas chahta hai.</li>
<li>415 = server aapki body ka format padh nahi sakta; 406 = server aapka Accept bana nahi sakta.</li>
<li>RESTCONF application/yang-data+json aur application/yang-data+xml use karta hai.</li>
<li><code>r.json()</code> se pehle response ka Content-Type aur status code check karo.</li>
</ul></div>
`}};export{e as default};