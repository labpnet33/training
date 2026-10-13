var e={id:`anatomy`,h:{en:`Anatomy of a REST request: URL, path parameters and query string`,hi:`REST request ki anatomy: URL, path parameters aur query string`},body:{en:`
<p>A postal address works from big to small: country, city, street, house number. A REST URL works the same way, and every piece has a job. If you can name each piece, you can build any request and you can find the broken piece when a call fails. This chapter covers exam topic <b>constructing a REST API request to retrieve or create data</b>.</p>

<h3>The pieces of a URL</h3>
<pre class="code">h&#116;tps://api.example:8443/v2/devices/r1/interfaces?status=up&amp;limit=10
\\___/   \\_________/ \\__/ \\__/ \\_______/ \\________/ \\__________________/
scheme      host     port base resource  sub-resource   query string</pre>
<dl class="terms">
<dt>Scheme</dt><dd>The protocol: <code>h&#116;tps</code> is HTTP inside TLS (default port 443). Real APIs use HTTPS so that passwords and tokens are encrypted.</dd>
<dt>Host and port</dt><dd>Which server. The port is optional when it is the default (443 for HTTPS).</dd>
<dt>Base path</dt><dd>The fixed start of every API URL, often with a version, such as <code>/v2</code> or, for RESTCONF, <code>/restconf/data</code>. The version lets the provider change the API without breaking old clients.</dd>
<dt>Resource</dt><dd>The "noun" you work with: <code>devices</code>, <code>interfaces</code>. REST uses plural nouns, never verbs. The verb is the HTTP method.</dd>
<dt>Path parameter</dt><dd>A value inside the path that picks one item: <code>/devices/r1</code> means "the device called r1". In RESTCONF a list entry is picked with an equals sign: <code>interface=Loopback10</code>.</dd>
<dt>Query string</dt><dd>Everything after <code>?</code>: <code>name=value</code> pairs joined by <code>&amp;</code>. It does not pick the item, it <b>shapes the answer</b>: filter, sort, limit, choose a page, choose fields.</dd>
</dl>

<div class="eg"><p><b>Path or query?</b> Ask: "Am I naming <i>which thing</i>, or <i>how I want the list shown</i>?" <code>/devices/r1</code> names a thing: path. <code>?status=up&amp;limit=10</code> shapes a list: query. The same rule holds in RESTCONF: <code>interface=Loopback10</code> (path) picks one interface, and <code>?content=config</code> (query) asks for configuration data only, without counters.</p></div>

<h3>Special characters must be encoded</h3>
<p>A URL may only contain a safe set of characters, so others are written as <b>percent-encoding</b>: a percent sign and two hex digits. The two you meet most: a slash inside a value becomes <code>%2F</code>, and a space becomes <code>%20</code>. That is exactly why Lab 1 call 3 fails: <code>interface=GigabitEthernet0/1</code> makes the server see a new path level, so you must write <code>interface=GigabitEthernet0%2F1</code>. In Python, never build query strings by hand; let requests do it with <code>params=</code> (shown below).</p>

<h3>Retrieve: a GET request</h3>
<p>On the wire a request is just text: a request line, headers, an empty line and an optional body.</p>
<pre class="code">GET /v2/devices?status=up&amp;limit=10 HTTP/1.1
Host: api.example
Accept: application/json
Authorization: Bearer eyJ...redacted</pre>
<p>The same request as a curl command (curl is the standard command-line client; <code>-s</code> is silent, <code>-i</code> prints the response headers):</p>
<pre class="code">curl -s -i "h&#116;tps://api.example/v2/devices?status=up&amp;limit=10" \\
     -H "Accept: application/json" \\
     -H "Authorization: Bearer $TOKEN"</pre>
<p>And in Python, where <code>params</code> builds and encodes the query string for you (reference snippet, <code>api.example</code> is not a live service):</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://api.example/v2/devices",
                 params={"status": "up", "limit": 10},
                 headers={"Accept": "application/json"}, timeout=10)
print(r.url)          # h&#116;tps://api.example/v2/devices?status=up&amp;limit=10
print(r.status_code)  # 200</pre>

<h3>Create: a POST request</h3>
<p>To create something you POST to the <b>collection</b> URL, say what the body is with <code>Content-Type</code>, and send the data. A good API answers <b>201 Created</b> and a <code>Location</code> header with the URL of the new item.</p>
<pre class="code">curl -s -i -X POST "h&#116;tps://api.example/v2/devices" \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer $TOKEN" \\
     -d '{"name": "r5", "mgmt_ip": "192.0.2.15"}'</pre>
<pre class="out">HTTP/1.1 <span class="hl">201 Created</span>
Location: /v2/devices/r5
Content-Type: application/json

{"name": "r5", "mgmt_ip": "192.0.2.15", "status": "new"}</pre>
<p>With the lab tool the same ideas look like this (RESTCONF, basic auth, the lab router):</p>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback10?content=config -u netops:NK@2026</pre>
<pre class="out">HTTP/1.1 200 OK
Content-Type: application/yang-data+json

{
  "ietf-interfaces:interface": {
    "name": "Loopback10",
    "description": "PROBE-OLD",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true, ...
    <span class="hl">(no oper-status, no statistics: ?content=config removed them)</span>
  }
}</pre>

<div class="warn"><p><b>Common mistakes.</b> Putting a filter in the path (<code>/devices/status=up</code>) instead of the query; forgetting to encode <code>/</code> as <code>%2F</code>; sending a trailing slash the server does not accept; writing the verb in the URL (<code>/createDevice</code>); using plain HTTP so credentials travel in clear text.</p></div>
<div class="exam"><p><b>Exam trap.</b> The query string starts with <code>?</code>, pairs are joined with <code>&amp;</code>, and nothing after <code>#</code> (the fragment) is ever sent to the server. A path parameter identifies a resource; a query parameter filters or modifies the response.</p></div>

<div class="scn"><h4>The interface that "did not exist"</h4><p>A NOC engineer got 400 for <code>interface=GigabitEthernet0/1</code> and assumed the interface was missing on the router. The error message said the key value contained an unencoded slash. She changed the slash to <code>%2F</code> and got 200 with the data she needed. The router had been fine all along.</p><p><b>Lesson:</b> Read the error body before touching the device. The message often names the exact fix.</p></div>

<div class="iv"><p class="q">"What is the difference between a path parameter and a query parameter?"</p><p>A path parameter is part of the resource address and identifies one item, for example <code>/devices/r1</code>. A query parameter comes after <code>?</code> and modifies the response of a collection: filtering, sorting, limiting or paging. Add that special characters are percent-encoded and that you build query strings with the library (<code>params=</code>), not by string concatenation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URL = scheme + host (+port) + base path + resource + path parameter + query string.</li>
<li>Path picks the item; query shapes the answer (filter, sort, limit, content).</li>
<li>Encode special characters: <code>/</code> is <code>%2F</code>, space is <code>%20</code>.</li>
<li>Retrieve with GET; create with POST to the collection and expect 201 plus a Location header.</li>
<li>In Python pass <code>params=</code> and <code>json=</code> and let requests encode for you.</li>
</ul></div>
`,hi:`
<p>Dak ka pata bade se chhote ki taraf chalta hai: desh, shehar, gali, ghar ka number. REST URL bhi isi tarah kaam karta hai, aur har hisse ka apna kaam hai. Agar aap har hisse ka naam bata sakte ho, to aap koi bhi request bana sakte ho aur call fail hone par toota hua hissa dhoondh sakte ho. Yeh chapter exam topic <b>constructing a REST API request to retrieve or create data</b> cover karta hai.</p>

<h3>URL ke hisse</h3>
<pre class="code">h&#116;tps://api.example:8443/v2/devices/r1/interfaces?status=up&amp;limit=10
\\___/   \\_________/ \\__/ \\__/ \\_______/ \\________/ \\__________________/
scheme      host     port base resource  sub-resource   query string</pre>
<dl class="terms">
<dt>Scheme</dt><dd>Protocol: <code>h&#116;tps</code> yaani TLS ke andar HTTP (default port 443). Real APIs HTTPS use karti hain taaki passwords aur tokens encrypted rahein.</dd>
<dt>Host aur port</dt><dd>Kaunsa server. Port default hone par optional hai (HTTPS ke liye 443).</dd>
<dt>Base path</dt><dd>Har API URL ka fixed shuruaati hissa, aksar version ke saath, jaise <code>/v2</code> ya RESTCONF ke liye <code>/restconf/data</code>. Version se provider purane clients ko tode bina API badal sakta hai.</dd>
<dt>Resource</dt><dd>Woh "noun" jis par aap kaam karte ho: <code>devices</code>, <code>interfaces</code>. REST mein plural nouns hote hain, verbs nahi. Verb HTTP method hai.</dd>
<dt>Path parameter</dt><dd>Path ke andar ki value jo ek item chunti hai: <code>/devices/r1</code> ka matlab "r1 naam ka device". RESTCONF mein list entry barabar (=) se chunte hain: <code>interface=Loopback10</code>.</dd>
<dt>Query string</dt><dd><code>?</code> ke baad ka sab kuch: <code>name=value</code> jodiyan jo <code>&amp;</code> se judti hain. Yeh item nahi chunti, yeh <b>jawab ka shape tay karti hai</b>: filter, sort, limit, page, fields.</dd>
</dl>

<div class="eg"><p><b>Path ya query?</b> Poocho: "Main <i>kaunsi cheez</i> bata raha hoon, ya <i>list kaise dikhani hai</i>?" <code>/devices/r1</code> cheez batata hai: path. <code>?status=up&amp;limit=10</code> list ka shape batata hai: query. RESTCONF mein bhi yahi rule hai: <code>interface=Loopback10</code> (path) ek interface chunta hai, aur <code>?content=config</code> (query) sirf configuration data maangta hai, counters ke bina.</p></div>

<h3>Special characters ko encode karna padta hai</h3>
<p>URL mein sirf safe characters ka set aa sakta hai, isliye baaki <b>percent-encoding</b> se likhe jaate hain: percent sign aur do hex digits. Do sabse zyada milte hain: value ke andar ka slash <code>%2F</code> ban jaata hai, aur space <code>%20</code>. Isi wajah se Lab 1 ki call 3 fail hoti hai: <code>interface=GigabitEthernet0/1</code> se server ko naya path level dikhta hai, isliye <code>interface=GigabitEthernet0%2F1</code> likhna padta hai. Python mein query string haath se mat banao; requests ko <code>params=</code> se karne do (neeche dekho).</p>

<h3>Retrieve: GET request</h3>
<p>Wire par request bas text hai: request line, headers, ek khali line aur optional body.</p>
<pre class="code">GET /v2/devices?status=up&amp;limit=10 HTTP/1.1
Host: api.example
Accept: application/json
Authorization: Bearer eyJ...redacted</pre>
<p>Wahi request curl command ke roop mein (curl standard command-line client hai; <code>-s</code> silent hai, <code>-i</code> response headers print karta hai):</p>
<pre class="code">curl -s -i "h&#116;tps://api.example/v2/devices?status=up&amp;limit=10" \\
     -H "Accept: application/json" \\
     -H "Authorization: Bearer $TOKEN"</pre>
<p>Aur Python mein, jahan <code>params</code> query string banata aur encode karta hai (reference snippet, <code>api.example</code> live service nahi hai):</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://api.example/v2/devices",
                 params={"status": "up", "limit": 10},
                 headers={"Accept": "application/json"}, timeout=10)
print(r.url)          # h&#116;tps://api.example/v2/devices?status=up&amp;limit=10
print(r.status_code)  # 200</pre>

<h3>Create: POST request</h3>
<p>Kuch banane ke liye aap <b>collection</b> URL par POST karte ho, <code>Content-Type</code> se body ka type batate ho, aur data bhejte ho. Achhi API <b>201 Created</b> aur nayi item ke URL wala <code>Location</code> header deti hai.</p>
<pre class="code">curl -s -i -X POST "h&#116;tps://api.example/v2/devices" \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer $TOKEN" \\
     -d '{"name": "r5", "mgmt_ip": "192.0.2.15"}'</pre>
<pre class="out">HTTP/1.1 <span class="hl">201 Created</span>
Location: /v2/devices/r5
Content-Type: application/json

{"name": "r5", "mgmt_ip": "192.0.2.15", "status": "new"}</pre>
<p>Lab tool ke saath wahi ideas aise dikhte hain (RESTCONF, basic auth, lab router):</p>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback10?content=config -u netops:NK@2026</pre>
<pre class="out">HTTP/1.1 200 OK
Content-Type: application/yang-data+json

{
  "ietf-interfaces:interface": {
    "name": "Loopback10",
    "description": "PROBE-OLD",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true, ...
    <span class="hl">(no oper-status, no statistics: ?content=config ne hata diye)</span>
  }
}</pre>

<div class="warn"><p><b>Common mistakes.</b> Filter ko path mein daalna (<code>/devices/status=up</code>) query ki jagah; <code>/</code> ko <code>%2F</code> encode karna bhoolna; trailing slash bhejna jo server accept nahi karta; URL mein verb likhna (<code>/createDevice</code>); plain HTTP use karna jisse credentials clear text mein jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Query string <code>?</code> se shuru hoti hai, jodiyan <code>&amp;</code> se judti hain, aur <code>#</code> (fragment) ke baad ka kuch bhi server ko kabhi nahi jaata. Path parameter resource ko identify karta hai; query parameter response ko filter ya modify karta hai.</p></div>

<div class="scn"><h4>Woh interface jo "tha hi nahi"</h4><p>Ek NOC engineer ko <code>interface=GigabitEthernet0/1</code> par 400 mila aur usne maan liya ki router par interface missing hai. Error message mein likha tha ki key value mein unencoded slash hai. Usne slash ko <code>%2F</code> kiya aur 200 ke saath data mil gaya. Router poori tarah theek tha.</p><p><b>Lesson:</b> Device ko haath lagane se pehle error body padho. Message aksar exact fix batata hai.</p></div>

<div class="iv"><p class="q">"Path parameter aur query parameter mein kya farak hai?"</p><p>Path parameter resource address ka hissa hai aur ek item identify karta hai, jaise <code>/devices/r1</code>. Query parameter <code>?</code> ke baad aata hai aur collection ke response ko modify karta hai: filtering, sorting, limiting ya paging. Yeh bhi jodo ki special characters percent-encode hote hain aur query strings library se (<code>params=</code>) banate hain, string jodkar nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URL = scheme + host (+port) + base path + resource + path parameter + query string.</li>
<li>Path item chunta hai; query jawab ka shape tay karti hai (filter, sort, limit, content).</li>
<li>Special characters encode karo: <code>/</code> ka <code>%2F</code>, space ka <code>%20</code>.</li>
<li>Retrieve GET se; create collection par POST se, aur 201 plus Location header ki umeed rakho.</li>
<li>Python mein <code>params=</code> aur <code>json=</code> do aur encoding requests par chhodo.</li>
</ul></div>
`}};export{e as default};