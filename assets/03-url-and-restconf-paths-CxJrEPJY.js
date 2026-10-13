var e={id:`url-paths`,h:{en:`Reading a URL: scheme, host, path and RESTCONF levels`,hi:`URL padhna: scheme, host, path aur RESTCONF levels`},body:{en:`

<p>Every API call needs an address. This chapter teaches you to read and build one. If you can read a postal address, you can read a URL.</p>

<h3>The parts of a URL</h3>
<p>A <b>URL</b> (Uniform Resource Locator) is the address of a resource. Think of a letter: country, city, street, house number, flat. Each part narrows the target.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="A URL read from left to right: how, where, which door, which API, which data."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="5" y="30" width="70" height="44" rx="10" fill="#fde68a"/><text x="40" y="57" text-anchor="middle" class="svg-ink" font-size="14">h&#116;tps</text><rect x="80" y="30" width="15" height="44" rx="10" fill="#e2e8f0"/><text x="87.5" y="57" text-anchor="middle" class="svg-ink" font-size="14"></text><rect x="100" y="30" width="110" height="44" rx="10" fill="#bae6fd"/><text x="155" y="57" text-anchor="middle" class="svg-ink" font-size="14">10.99.0.1</text><rect x="215" y="30" width="55" height="44" rx="10" fill="#e2e8f0"/><text x="242.5" y="57" text-anchor="middle" class="svg-ink" font-size="14">:443</text><rect x="275" y="30" width="120" height="44" rx="10" fill="#bbf7d0"/><text x="335" y="57" text-anchor="middle" class="svg-ink" font-size="14">/restconf/data</text><rect x="400" y="30" width="230" height="44" rx="10" fill="#ddd6fe"/><text x="515" y="57" text-anchor="middle" class="svg-ink" font-size="14">/ietf-interfaces:interfaces</text><text x="40" y="100" text-anchor="middle" class="svg-ink" font-size="13">scheme</text><text x="155" y="100" text-anchor="middle" class="svg-ink" font-size="13">host</text><text x="242" y="100" text-anchor="middle" class="svg-ink" font-size="13">port</text><text x="335" y="100" text-anchor="middle" class="svg-ink" font-size="13">API root + store</text><text x="515" y="100" text-anchor="middle" class="svg-ink" font-size="13">resource path</text><text x="40" y="122" text-anchor="middle" class="svg-muted" font-size="12">how to talk</text><text x="155" y="122" text-anchor="middle" class="svg-muted" font-size="12">which device</text><text x="242" y="122" text-anchor="middle" class="svg-muted" font-size="12">which door</text><text x="335" y="122" text-anchor="middle" class="svg-muted" font-size="12">the API itself</text><text x="515" y="122" text-anchor="middle" class="svg-muted" font-size="12">which data</text><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">://</text></svg><p class="cap">A URL read from left to right: how, where, which door, which API, which data.</p></div>
<ul>
<li><b>scheme</b> (<code>h&#116;tps</code>): the way to talk. <code>h&#116;tps</code> is HTTP inside TLS; <code>h&#116;tp</code> is plain.</li>
<li><b>host</b> (<code>10.99.0.1</code>): which device, as an IP address or a name.</li>
<li><b>port</b> (<code>:443</code>): which door on that device. It is usually left out, because h&#116;tps means 443 by default.</li>
<li><b>path</b> (<code>/restconf/data/ietf-interfaces:interfaces</code>): which resource. It is separated by slashes like folders.</li>
<li><b>query</b> (starts with <code>?</code>): optional extra settings, for example <code>?depth=1</code>.</li>
</ul>

<h3>The RESTCONF path, level by level</h3>
<p>RESTCONF paths follow the YANG data model, the structure that describes what a device can store. Reading left to right:</p>
<table class="cmp"><tr><th>Piece</th><th>Meaning</th></tr>
<tr><td><code>/restconf</code></td><td>the API root (RFC 8040 says the server announces it)</td></tr>
<tr><td><code>/data</code></td><td>the data store: configuration plus operational state</td></tr>
<tr><td><code>ietf-interfaces:interfaces</code></td><td><code>module:container</code>. The <b>module</b> (ietf-interfaces) is the data model; the <b>container</b> (interfaces) is its top box</td></tr>
<tr><td><code>/interface=GigabitEthernet0%2F1</code></td><td>one entry of a <b>list</b>, picked by its <b>key</b> (the name). Written <code>list=key</code></td></tr>
<tr><td><code>/description</code></td><td>a <b>leaf</b>: a single value</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Each level of the path narrows the data: table, then row, then one cell."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="10" width="220" height="40" rx="10" fill="#bae6fd"/><text x="120" y="35" text-anchor="middle" class="svg-ink" font-size="14">ietf-interfaces:interfaces</text><rect x="60" y="70" width="220" height="40" rx="10" fill="#bbf7d0"/><text x="170" y="95" text-anchor="middle" class="svg-ink" font-size="14">interface=GigabitEthernet0%2F1</text><rect x="110" y="130" width="220" height="40" rx="10" fill="#ddd6fe"/><text x="220" y="155" text-anchor="middle" class="svg-ink" font-size="14">description</text><line x1="30" y1="50" x2="30" y2="90" stroke="#64748b" stroke-width="2"/><line x1="30" y1="90" x2="60" y2="90" stroke="#64748b" stroke-width="2"/><line x1="80" y1="110" x2="80" y2="150" stroke="#64748b" stroke-width="2"/><line x1="80" y1="150" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="13">module : container  (a table)</text><text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="13">list entry picked by key (a row)</text><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">leaf (one value)</text></svg><p class="cap">Each level of the path narrows the data: table, then row, then one cell.</p></div>
<p>Compare the path with a spreadsheet: the container is the table, the list entry is a row picked by its name, the leaf is one cell. Each extra segment makes the answer smaller. All three of these are real calls to R1:</p>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces                                   # whole table
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0               # one row
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description   # one cell</pre>
<p>The root itself can be fetched too, which shows that the server really is a RESTCONF server:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf -u apiuser:Api@2026
HTTP/1.1 200 OK
Content-Type: application/yang-data+json
ETag: "3yf6lo"

{
<span class="hl">  "ietf-restconf:restconf": {</span>
    "data": {},
    "operations": {},
    "yang-library-version": "2016-06-21"
  }
}</pre>

<h3>Why %2F? Special characters in a path</h3>
<p>An interface name such as <code>GigabitEthernet0/1</code> contains a slash. A slash in a URL means "go one level deeper", so the server would read <code>0</code> and <code>1</code> as two separate path pieces. To protect the slash you <b>percent-encode</b> it: the character becomes a percent sign plus its hexadecimal code, and <code>/</code> is <code>%2F</code>. Try it unencoded:</p>
<pre class="out">AUTO&gt; rest GET .../interface=GigabitEthernet0/1 -u apiuser:Api@2026
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "key value \\"GigabitEthernet0/1\\" contains an unencoded \\"/\\"; encode it as %2F, e.g. interface=GigabitEthernet0%2F1"</span>
      }
    ]
  }
}</pre>
<p>The status code is 400, which means "your request is malformed", and the message even gives the cure. With <code>%2F</code> the same call returns 200 and the JSON of that one interface:</p>
<pre class="out">AUTO&gt; rest GET .../interface=GigabitEthernet0%2F1 -u apiuser:Api@2026 -H 'Accept: application/yang-data+json'
<span class="hl">HTTP/1.1 200 OK</span>
Content-Type: application/yang-data+json
ETag: "80qnw"

{
  "ietf-interfaces:interface": {
<span class="hl">    "name": "GigabitEthernet0/1",</span>
    "description": "OLD-LINK",
    "type": "iana-if-type:ethernetCsmacd",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
    ...</pre>

<h3>One wrong letter</h3>
<p>Paths are case-sensitive and spelled exactly. A typo in the module name, <code>ietf-interface</code> without the final s, returns a 404:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interface:interfaces -u apiuser:Api@2026
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
  }
}</pre>
<p>And because R1 listens only on HTTPS, a call with <code>h&#116;tp</code> instead of <code>h&#116;tps</code> goes to port 80, where nothing listens:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tp://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">rest: (7) Failed to connect to 10.99.0.1 port 80 after 4 ms: Connection refused</span></pre>

<h3>The query part</h3>
<p>Queries add options after a <code>?</code>. RFC 8040 defines several for RESTCONF, such as <code>depth</code> to limit how deep the answer goes and <code>fields</code> to pick fields. Support varies by platform. The lab server accepts <code>?depth=1</code> but still returns the full object, so do not rely on queries in the lab; check the platform documentation on a real device.</p>

<div class="eg"><p><b>Worked example.</b> You need the IP address of Loopback0 only. Build the URL step by step: root <code>h&#116;tps://10.99.0.1/restconf/data/</code>, plus <code>ietf-interfaces:interfaces</code>, plus <code>/interface=Loopback0</code> to choose the row. The reply is one object. Choosing the row on the server is cheaper than downloading the whole list and filtering it in your program.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) An unencoded slash in an interface name. (2) A typo in the module name. (3) Writing <code>interface/Loopback0</code> instead of <code>interface=Loopback0</code>. (4) A trailing space or a missing colon between module and container.</p></div>
<div class="exam"><p><b>Exam trap.</b> The list key is written <code>list=key</code>. Module and container are joined with a colon. Special characters are percent-encoded: <code>/</code> is <code>%2F</code>, space is <code>%20</code>. The RESTCONF data store lives under <code>/restconf/data</code>.</p></div>

<div class="scn"><h4>The interface nobody could query</h4><p>A new engineer wrote a collector that worked for Loopback0 and failed with a 400 on every GigabitEthernet port. The URLs looked right. The slash in <code>GigabitEthernet0/1</code> was being read as a path separator. Encoding the interface name with <code>%2F</code> in the program fixed all ports at once.</p><p><b>Lesson:</b> a status code and its message point to the exact layer; read them before you change anything.</p></div>

<div class="iv"><p class="q">"Explain a RESTCONF URL."</p><p>The scheme is HTTPS and the host is the device. The path starts with <code>/restconf/data</code>, then <code>module:container</code> from the YANG model, then optional <code>list=key</code> to pick one entry and a leaf name to pick one value. Special characters in keys, such as the slash in <code>GigabitEthernet0/1</code>, must be percent-encoded as <code>%2F</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A URL is scheme, host, optional port, path and optional query.</li>
<li>RESTCONF data lives under <code>/restconf/data/module:container</code>.</li>
<li>Pick a list entry with <code>list=key</code> and a single value by its leaf name.</li>
<li>Encode a slash inside a key as <code>%2F</code>; unencoded gives 400.</li>
<li>A typo in the path gives 404; the wrong scheme or port gives "connection refused".</li>
</ul></div>

`,hi:`

<p>Har API call ko ek address chahiye. Yeh chapter aapko ek address padhna aur banana sikhata hai. Agar aap dak ka pata padh sakte ho, to URL bhi padh sakte ho.</p>

<h3>URL ke hisse</h3>
<p><b>URL</b> (Uniform Resource Locator) ek resource ka address hai. Ek chitthi socho: desh, shehar, sadak, ghar ka number, flat. Har hissa target ko chhota karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="URL ko left se right padho: kaise, kahan, kaunsa darwaza, kaunsi API, kaunsa data."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="5" y="30" width="70" height="44" rx="10" fill="#fde68a"/><text x="40" y="57" text-anchor="middle" class="svg-ink" font-size="14">h&#116;tps</text><rect x="80" y="30" width="15" height="44" rx="10" fill="#e2e8f0"/><text x="87.5" y="57" text-anchor="middle" class="svg-ink" font-size="14"></text><rect x="100" y="30" width="110" height="44" rx="10" fill="#bae6fd"/><text x="155" y="57" text-anchor="middle" class="svg-ink" font-size="14">10.99.0.1</text><rect x="215" y="30" width="55" height="44" rx="10" fill="#e2e8f0"/><text x="242.5" y="57" text-anchor="middle" class="svg-ink" font-size="14">:443</text><rect x="275" y="30" width="120" height="44" rx="10" fill="#bbf7d0"/><text x="335" y="57" text-anchor="middle" class="svg-ink" font-size="14">/restconf/data</text><rect x="400" y="30" width="230" height="44" rx="10" fill="#ddd6fe"/><text x="515" y="57" text-anchor="middle" class="svg-ink" font-size="14">/ietf-interfaces:interfaces</text><text x="40" y="100" text-anchor="middle" class="svg-ink" font-size="13">scheme</text><text x="155" y="100" text-anchor="middle" class="svg-ink" font-size="13">host</text><text x="242" y="100" text-anchor="middle" class="svg-ink" font-size="13">port</text><text x="335" y="100" text-anchor="middle" class="svg-ink" font-size="13">API root + store</text><text x="515" y="100" text-anchor="middle" class="svg-ink" font-size="13">resource path</text><text x="40" y="122" text-anchor="middle" class="svg-muted" font-size="12">kaise baat</text><text x="155" y="122" text-anchor="middle" class="svg-muted" font-size="12">kaunsa device</text><text x="242" y="122" text-anchor="middle" class="svg-muted" font-size="12">kaunsa darwaza</text><text x="335" y="122" text-anchor="middle" class="svg-muted" font-size="12">khud API</text><text x="515" y="122" text-anchor="middle" class="svg-muted" font-size="12">kaunsa data</text><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">://</text></svg><p class="cap">URL ko left se right padho: kaise, kahan, kaunsa darwaza, kaunsi API, kaunsa data.</p></div>
<ul>
<li><b>scheme</b> (<code>h&#116;tps</code>): baat karne ka tareeka. <code>h&#116;tps</code> TLS ke andar HTTP hai; <code>h&#116;tp</code> plain hai.</li>
<li><b>host</b> (<code>10.99.0.1</code>): kaunsa device, IP address ya naam ke roop mein.</li>
<li><b>port</b> (<code>:443</code>): us device par kaunsa darwaza. Aam taur par chhoda jaata hai, kyunki h&#116;tps ka matlab default 443 hai.</li>
<li><b>path</b> (<code>/restconf/data/ietf-interfaces:interfaces</code>): kaunsa resource. Folders ki tarah slashes se alag hota hai.</li>
<li><b>query</b> (<code>?</code> se shuru): optional extra settings, jaise <code>?depth=1</code>.</li>
</ul>

<h3>RESTCONF path, level by level</h3>
<p>RESTCONF paths YANG data model ka structure follow karte hain, jo batata hai ki device kya store kar sakta hai. Left se right padho:</p>
<table class="cmp"><tr><th>Hissa</th><th>Matlab</th></tr>
<tr><td><code>/restconf</code></td><td>API root (RFC 8040 kehta hai server use announce karta hai)</td></tr>
<tr><td><code>/data</code></td><td>data store: configuration plus operational state</td></tr>
<tr><td><code>ietf-interfaces:interfaces</code></td><td><code>module:container</code>. <b>Module</b> (ietf-interfaces) data model hai; <b>container</b> (interfaces) uska sabse upar ka dabba hai</td></tr>
<tr><td><code>/interface=GigabitEthernet0%2F1</code></td><td>ek <b>list</b> ki ek entry, uski <b>key</b> (naam) se chuni hui. <code>list=key</code> likha jaata hai</td></tr>
<tr><td><code>/description</code></td><td>ek <b>leaf</b>: ek akeli value</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Path ka har level data ko chhota karta hai: table, phir row, phir ek cell."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="10" width="220" height="40" rx="10" fill="#bae6fd"/><text x="120" y="35" text-anchor="middle" class="svg-ink" font-size="14">ietf-interfaces:interfaces</text><rect x="60" y="70" width="220" height="40" rx="10" fill="#bbf7d0"/><text x="170" y="95" text-anchor="middle" class="svg-ink" font-size="14">interface=GigabitEthernet0%2F1</text><rect x="110" y="130" width="220" height="40" rx="10" fill="#ddd6fe"/><text x="220" y="155" text-anchor="middle" class="svg-ink" font-size="14">description</text><line x1="30" y1="50" x2="30" y2="90" stroke="#64748b" stroke-width="2"/><line x1="30" y1="90" x2="60" y2="90" stroke="#64748b" stroke-width="2"/><line x1="80" y1="110" x2="80" y2="150" stroke="#64748b" stroke-width="2"/><line x1="80" y1="150" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="13">module : container  (ek table)</text><text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="13">key se chuni list entry (ek row)</text><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">leaf (ek value)</text></svg><p class="cap">Path ka har level data ko chhota karta hai: table, phir row, phir ek cell.</p></div>
<p>Path ko spreadsheet se compare karo: container table hai, list entry naam se chuni hui row hai, leaf ek cell hai. Har extra segment jawab ko chhota karta hai. Yeh teeno R1 par asli calls hain:</p>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces                                   # poori table
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0               # ek row
rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description   # ek cell</pre>
<p>Root bhi fetch kar sakte ho, jo dikhata hai ki server sach mein RESTCONF server hai:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf -u apiuser:Api@2026
HTTP/1.1 200 OK
Content-Type: application/yang-data+json
ETag: "3yf6lo"

{
<span class="hl">  "ietf-restconf:restconf": {</span>
    "data": {},
    "operations": {},
    "yang-library-version": "2016-06-21"
  }
}</pre>

<h3>%2F kyun? Path mein special characters</h3>
<p><code>GigabitEthernet0/1</code> jaise interface naam mein slash hota hai. URL mein slash ka matlab "ek level aur andar jao", isliye server <code>0</code> aur <code>1</code> ko do alag path pieces padhta. Slash ko bachane ke liye aap use <b>percent-encode</b> karte ho: character percent sign aur uske hexadecimal code mein badal jaata hai, aur <code>/</code> ka <code>%2F</code> hai. Bina encode kiye try karo:</p>
<pre class="out">AUTO&gt; rest GET .../interface=GigabitEthernet0/1 -u apiuser:Api@2026
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "key value \\"GigabitEthernet0/1\\" contains an unencoded \\"/\\"; encode it as %2F, e.g. interface=GigabitEthernet0%2F1"</span>
      }
    ]
  }
}</pre>
<p>Status code 400 hai, jiska matlab "aapki request malformed hai", aur message ilaaj bhi bata deta hai. <code>%2F</code> ke saath wahi call 200 aur us ek interface ka JSON deti hai:</p>
<pre class="out">AUTO&gt; rest GET .../interface=GigabitEthernet0%2F1 -u apiuser:Api@2026 -H 'Accept: application/yang-data+json'
<span class="hl">HTTP/1.1 200 OK</span>
Content-Type: application/yang-data+json
ETag: "80qnw"

{
  "ietf-interfaces:interface": {
<span class="hl">    "name": "GigabitEthernet0/1",</span>
    "description": "OLD-LINK",
    "type": "iana-if-type:ethernetCsmacd",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
    ...</pre>

<h3>Ek galat akshar</h3>
<p>Paths case-sensitive hote hain aur bilkul sahi spell hone chahiye. Module naam mein typo, <code>ietf-interface</code> bina aakhri s ke, 404 deta hai:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interface:interfaces -u apiuser:Api@2026
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
  }
}</pre>
<p>Aur kyunki R1 sirf HTTPS par sunta hai, <code>h&#116;tps</code> ki jagah <code>h&#116;tp</code> wali call port 80 par jaati hai, jahan kuch nahi sunta:</p>
<pre class="out">AUTO&gt; rest GET h&#116;tp://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u apiuser:Api@2026
<span class="hl">rest: (7) Failed to connect to 10.99.0.1 port 80 after 4 ms: Connection refused</span></pre>

<h3>Query wala hissa</h3>
<p>Queries <code>?</code> ke baad options jodti hain. RFC 8040 RESTCONF ke liye kai define karta hai, jaise <code>depth</code> jo jawab ki gehraai limit karta hai aur <code>fields</code> jo fields chunta hai. Support platform ke hisaab se alag hota hai. Lab server <code>?depth=1</code> accept karta hai par phir bhi poora object return karta hai, isliye lab mein queries par bharosa mat karo; asli device par platform documentation dekho.</p>

<div class="eg"><p><b>Worked example.</b> Aapko sirf Loopback0 ka IP address chahiye. URL step by step banao: root <code>h&#116;tps://10.99.0.1/restconf/data/</code>, plus <code>ietf-interfaces:interfaces</code>, plus row chunne ke liye <code>/interface=Loopback0</code>. Reply ek object hai. Row ko server par chunna poori list download karke apne program mein filter karne se sasta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Interface naam mein bina encode kiya slash. (2) Module naam mein typo. (3) <code>interface=Loopback0</code> ki jagah <code>interface/Loopback0</code> likhna. (4) Trailing space ya module aur container ke beech colon missing.</p></div>
<div class="exam"><p><b>Exam trap.</b> List key <code>list=key</code> likhi jaati hai. Module aur container colon se jude hote hain. Special characters percent-encode hote hain: <code>/</code> ka <code>%2F</code>, space ka <code>%20</code>. RESTCONF data store <code>/restconf/data</code> ke neeche hai.</p></div>

<div class="scn"><h4>Woh interface jise koi query nahi kar paya</h4><p>Ek naye engineer ne collector likha jo Loopback0 ke liye chala aur har GigabitEthernet port par 400 ke saath fail hua. URLs sahi dikhte the. <code>GigabitEthernet0/1</code> ka slash path separator ki tarah padha ja raha tha. Program mein interface naam ko <code>%2F</code> se encode karne se saare ports ek saath theek ho gaye.</p><p><b>Lesson:</b> status code aur uska message sahi layer ki taraf ishaara karte hain; kuch badalne se pehle unhe padho.</p></div>

<div class="iv"><p class="q">"Ek RESTCONF URL samjhao."</p><p>Scheme HTTPS hai aur host device hai. Path <code>/restconf/data</code> se shuru hota hai, phir YANG model ka <code>module:container</code>, phir ek entry chunne ke liye optional <code>list=key</code> aur ek value chunne ke liye leaf naam. Keys mein special characters, jaise <code>GigabitEthernet0/1</code> ka slash, <code>%2F</code> ke roop mein percent-encode hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URL scheme, host, optional port, path aur optional query hai.</li>
<li>RESTCONF data <code>/restconf/data/module:container</code> ke neeche hota hai.</li>
<li>List entry <code>list=key</code> se chuno aur ek value uske leaf naam se.</li>
<li>Key ke andar ka slash <code>%2F</code> likho; bina encode kiye 400 aata hai.</li>
<li>Path mein typo 404 deta hai; galat scheme ya port "connection refused" deta hai.</li>
</ul></div>

`}};export{e as default};