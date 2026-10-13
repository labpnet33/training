var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking both labs`,hi:`Troubleshooting workflow: dono labs ko step by step`},body:{en:`
<p>When a parcel does not arrive, a good courier company checks in order: was the address reachable, was the shop open, did the receiver have the right ID, was the parcel labelled correctly, and did the contents match the order form. API troubleshooting follows the same ladder, and each rung has its own unmistakable error. Climb from the bottom and never skip a rung.</p>

<h3>The ladder</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="API troubleshooting ladder">
<rect x="40" y="245" width="560" height="38" rx="8" fill="#e2e8f0"/><text x="60" y="269" class="svg-ink" font-size="12">1. Reachability</text><text x="580" y="269" text-anchor="end" class="svg-muted" font-size="12">timeout / no route: ping, routes, ACL</text>
<rect x="40" y="200" width="560" height="38" rx="8" fill="#fde68a"/><text x="60" y="224" class="svg-ink" font-size="12">2. Service listening</text><text x="580" y="224" text-anchor="end" class="svg-muted" font-size="12">connection refused: HTTPS server, netconf-yang</text>
<rect x="40" y="155" width="560" height="38" rx="8" fill="#fed7aa"/><text x="60" y="179" class="svg-ink" font-size="12">3. Authentication</text><text x="580" y="179" text-anchor="end" class="svg-muted" font-size="12">401: user, password, auth method</text>
<rect x="40" y="110" width="560" height="38" rx="8" fill="#ddd6fe"/><text x="60" y="134" class="svg-ink" font-size="12">4. Authorisation</text><text x="580" y="134" text-anchor="end" class="svg-muted" font-size="12">403: privilege 15, AAA</text>
<rect x="40" y="65" width="560" height="38" rx="8" fill="#bae6fd"/><text x="60" y="89" class="svg-ink" font-size="12">5. Resource path</text><text x="580" y="89" text-anchor="end" class="svg-muted" font-size="12">404: module name, keys, %2F</text>
<rect x="40" y="20" width="560" height="38" rx="8" fill="#bbf7d0"/><text x="60" y="44" class="svg-ink" font-size="12">6. Payload and state</text><text x="580" y="44" text-anchor="end" class="svg-muted" font-size="12">400 / 409: names, types, exists</text>
</svg><p class="cap">Climb from rung 1. The error you get tells you which rung you are standing on.</p></div>

<h3>Tools for each rung</h3>
<ul>
<li><b>Reachability</b>: <code>ping 192.168.60.2</code> from DEVBOX; a <b>timeout</b> points to routing or an ACL, not to the API.</li>
<li><b>Service</b>: "Connection refused" means the IP answered but nothing listens on that port. On the device: the web-server status command (<code>show ip h&#116;tp server status</code>), <code>show netconf-yang status</code>, <code>show platform software yang-management process</code>.</li>
<li><b>Authentication and authorisation</b>: <code>show running-config | include username</code>, the web-server authentication method, and the <code>%DMI-5-AUTH_FAILED</code> / <code>%DMI-5-AUTH_PASSED</code> log lines.</li>
<li><b>Path</b>: the YANG tree (<code>yang tree nk-native</code>) and a GET one level higher to see what exists.</li>
<li><b>Payload</b>: the error-tag and error-message in the body, compared with the tree's names and types.</li>
</ul>

<h3>Lab 2 walk-through: RESTCONF keeps saying no</h3>
<p>The voice team's script on DEVBOX must create VLAN 30 (VOICE) on DSW1 at 192.168.60.2 with the account <code>automation</code> / <code>ApiPass1</code>.</p>
<p><b>Error 1: connection refused.</b></p>
<pre class="out">DEVBOX&gt; rest GET 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1
<span class="hl">rest: (7) Failed to connect to 192.168.60.2 port 443 after 4 ms: Connection refused</span></pre>
<p>Refused, not timeout: DSW1 is reachable but nothing listens on 443 (rung 2). On DSW1 the web-server status shows <code>HTTP secure server status: Disabled</code> and the restconf session module Inactive, although <code>restconf</code> is in the running config. Fix: <code>ip h&#116;tp secure-server</code>.</p>
<p><b>Error 2: 403 Forbidden.</b></p>
<pre class="out">HTTP/1.1 403 Forbidden
{
  "ietf-restconf:errors": {
    "error": [ { "error-type": "protocol", "error-tag": "access-denied",
<span class="hl">      "error-message": "user \\"automation\\" has privilege level 1; API access needs privilege level 15"</span> } ]
  }
}</pre>
<p>Not 401, so the password and the local authentication method are fine (rung 3 passed); the user lacks rights (rung 4). <code>show running-config | include username</code> shows <code>username automation secret 9 ...</code> with no privilege. Fix: <code>username automation privilege 15 secret ApiPass1</code>.</p>
<p><b>Error 3: 400, unknown element.</b> Now GET returns 200 with VLAN 10. POST <code>-d @vlan30.json</code> to <code>.../nk-native:native/vlan</code> answers 400 with error-tag <code>unknown-element</code>: <code>unknown element "vlan_id" in nk-native:vlan-list (valid: id, name)</code>. The tree confirms <code>vlan-list* [id]</code>. Fix the file: <code>sed -i 's/vlan_id/id/' vlan30.json</code>.</p>
<p><b>Error 4: 400, invalid value.</b> The next POST answers 400 with error-tag <code>invalid-value</code>: <code>invalid value "30" for leaf id (expected a number 2-4094 without quotes)</code>. The tree says <code>id</code> is <code>uint16</code>, so JSON needs a number. Fix: <code>sed -i 's/"30"/30/' vlan30.json</code>. The file becomes <code>{"nk-native:vlan-list": [{"id": 30, "name": "VOICE"}]}</code>.</p>
<pre class="out">DEVBOX&gt; rest POST 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1 -d @vlan30.json
<span class="hl">HTTP/1.1 201 Created</span></pre>
<p><b>Verify.</b> GET <code>.../nk-native:native/vlan/vlan-list=30</code> returns 200 with <code>{"id": 30, "name": "VOICE"}</code>, <code>show vlan brief</code> on DSW1 lists <code>30 VOICE active</code>, and the POST answer to record in the lab is <b>201</b>. Running the same POST again would now return 409 data-exists.</p>

<h3>Lab 1 errors you may meet on the way</h3>
<table class="cmp"><tr><th>Symptom</th><th>Rung</th><th>Cause and fix</th></tr>
<tr><td><code>netconf: connect to host 192.168.50.1 port 830: Connection refused</code></td><td>2</td><td><code>netconf-yang</code> missing on R1</td></tr>
<tr><td><code>devnet@192.168.50.1: Permission denied (password).</code></td><td>3</td><td>Wrong password or user missing</td></tr>
<tr><td>"authenticated, but NETCONF needs privilege level 15"</td><td>4</td><td>User created without <code>privilege 15</code></td></tr>
<tr><td><code>&lt;rpc-error&gt;</code> <code>unknown-namespace</code></td><td>6</td><td>XML element without <code>xmlns</code></td></tr>
<tr><td><code>&lt;rpc-error&gt;</code> <code>operation-not-supported</code> on commit</td><td>6</td><td>No <code>:candidate</code>; edit running directly</td></tr>
<tr><td>RESTCONF 404 on <code>interface=GigabitEthernet0/0</code></td><td>5</td><td>Encode "/" as <code>%2F</code></td></tr></table>

<div class="eg"><p><b>Worked example.</b> A timeout versus a refusal. From DEVBOX, <code>rest GET 192.168.60.99/...</code> hangs for three seconds and reports "Timeout was reached": nothing answered at IP level (wrong address, route or ACL drop). <code>rest GET 192.168.60.2/...</code> fails in 4 ms with "Connection refused": the host sent a TCP reset, so it is alive but the service is off. Two very different rungs from two similar-looking messages.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing several things at once, for example recreating the user, re-enabling RESTCONF and rewriting the JSON together. You fix the ticket but learn nothing, and you may introduce a new problem. Change one thing, retest, read the new code.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connection refused" is not an HTTP status code; it happens before HTTP. 401 is a credentials or method problem; 403 is a rights problem; 400 is the body; 404 is the URI. The exam gives you an output and asks which fix applies.</p></div>

<div class="scn"><h4>The API that died after hardening</h4><p>After a security team applied a hardening template, all RESTCONF automation to the campus switches returned "Connection refused". The template had added <code>no ip h&#116;tp secure-server</code> along with <code>no ip h&#116;tp server</code>, intending to remove only clear-text web access. Restoring the secure server (and restricting it with an access class) brought the API back while keeping the device hardened.</p><p><b>Lesson:</b> RESTCONF depends on the HTTPS server; hardening templates must keep it, restricted by ACL, not removed.</p></div>

<div class="iv"><p class="q">"A RESTCONF script fails against a switch. How do you troubleshoot it?"</p><p>Strong answer: work bottom up. Ping and check timeout versus refused. If refused, check the HTTPS server, restconf and the yang-management processes. Then read the status code: 401 means credentials or authentication method, 403 means privilege or AAA authorisation, 404 means a wrong path, module name or key encoding, 400 means the body does not match the YANG model, so compare names and types with the tree, 409 means the data exists. Change one thing at a time and verify with GET and the CLI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder: reachability, service, authentication, authorisation, path, payload and state.</li>
<li>Timeout = network; refused = service not listening; then read the HTTP status code.</li>
<li>Lab 2 fixes: HTTPS secure server, privilege 15 user, key name <code>id</code>, numeric <code>30</code>; success is 201.</li>
<li>Use the YANG tree to settle every 400: names, keys and types.</li>
<li>Change one thing at a time; verify with GET, <code>show</code> commands and DMI logs.</li>
</ul></div>
`,hi:`
<p>Jab parcel nahi pahunchta, to achhi courier company kram se check karti hai: address tak pahuncha ja sakta tha, dukaan khuli thi, receiver ke paas sahi ID thi, parcel par sahi label tha, aur andar ka saamaan order form se match karta tha. API troubleshooting bhi isi seedhi ko follow karti hai, aur har paaydaan ka apna saaf error hai. Neeche se chadho aur koi paaydaan mat chhodo.</p>

<h3>Seedhi</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="API troubleshooting ladder">
<rect x="40" y="245" width="560" height="38" rx="8" fill="#e2e8f0"/><text x="60" y="269" class="svg-ink" font-size="12">1. Reachability</text><text x="580" y="269" text-anchor="end" class="svg-muted" font-size="12">timeout / no route: ping, routes, ACL</text>
<rect x="40" y="200" width="560" height="38" rx="8" fill="#fde68a"/><text x="60" y="224" class="svg-ink" font-size="12">2. Service sun rahi hai</text><text x="580" y="224" text-anchor="end" class="svg-muted" font-size="12">connection refused: HTTPS server, netconf-yang</text>
<rect x="40" y="155" width="560" height="38" rx="8" fill="#fed7aa"/><text x="60" y="179" class="svg-ink" font-size="12">3. Authentication</text><text x="580" y="179" text-anchor="end" class="svg-muted" font-size="12">401: user, password, auth method</text>
<rect x="40" y="110" width="560" height="38" rx="8" fill="#ddd6fe"/><text x="60" y="134" class="svg-ink" font-size="12">4. Authorisation</text><text x="580" y="134" text-anchor="end" class="svg-muted" font-size="12">403: privilege 15, AAA</text>
<rect x="40" y="65" width="560" height="38" rx="8" fill="#bae6fd"/><text x="60" y="89" class="svg-ink" font-size="12">5. Resource path</text><text x="580" y="89" text-anchor="end" class="svg-muted" font-size="12">404: module naam, keys, %2F</text>
<rect x="40" y="20" width="560" height="38" rx="8" fill="#bbf7d0"/><text x="60" y="44" class="svg-ink" font-size="12">6. Payload aur state</text><text x="580" y="44" text-anchor="end" class="svg-muted" font-size="12">400 / 409: names, types, exists</text>
</svg><p class="cap">Paaydaan 1 se chadho. Jo error milta hai woh batata hai aap kis paaydaan par khade ho.</p></div>

<h3>Har paaydaan ke tools</h3>
<ul>
<li><b>Reachability</b>: DEVBOX se <code>ping 192.168.60.2</code>; <b>timeout</b> routing ya ACL ki taraf ishaara karta hai, API ki taraf nahi.</li>
<li><b>Service</b>: "Connection refused" ka matlab IP ne jawab diya par us port par koi nahi sun raha. Device par: web-server status command (<code>show ip h&#116;tp server status</code>), <code>show netconf-yang status</code>, <code>show platform software yang-management process</code>.</li>
<li><b>Authentication aur authorisation</b>: <code>show running-config | include username</code>, web-server authentication method, aur <code>%DMI-5-AUTH_FAILED</code> / <code>%DMI-5-AUTH_PASSED</code> log lines.</li>
<li><b>Path</b>: YANG tree (<code>yang tree nk-native</code>) aur ek level upar GET karke dekho kya exist karta hai.</li>
<li><b>Payload</b>: body mein error-tag aur error-message, tree ke names aur types se compare karke.</li>
</ul>

<h3>Lab 2 walk-through: RESTCONF baar-baar mana kar raha hai</h3>
<p>Voice team ki DEVBOX wali script ko DSW1 (192.168.60.2) par account <code>automation</code> / <code>ApiPass1</code> se VLAN 30 (VOICE) banana hai.</p>
<p><b>Error 1: connection refused.</b></p>
<pre class="out">DEVBOX&gt; rest GET 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1
<span class="hl">rest: (7) Failed to connect to 192.168.60.2 port 443 after 4 ms: Connection refused</span></pre>
<p>Refused, timeout nahi: DSW1 reachable hai par 443 par koi nahi sun raha (paaydaan 2). DSW1 par web-server status <code>HTTP secure server status: Disabled</code> aur restconf session module Inactive dikhata hai, jabki <code>restconf</code> running config mein hai. Fix: <code>ip h&#116;tp secure-server</code>.</p>
<p><b>Error 2: 403 Forbidden.</b></p>
<pre class="out">HTTP/1.1 403 Forbidden
{
  "ietf-restconf:errors": {
    "error": [ { "error-type": "protocol", "error-tag": "access-denied",
<span class="hl">      "error-message": "user \\"automation\\" has privilege level 1; API access needs privilege level 15"</span> } ]
  }
}</pre>
<p>401 nahi, to password aur local authentication method theek hain (paaydaan 3 paar); user ke paas rights nahi (paaydaan 4). <code>show running-config | include username</code> <code>username automation secret 9 ...</code> dikhata hai, bina privilege ke. Fix: <code>username automation privilege 15 secret ApiPass1</code>.</p>
<p><b>Error 3: 400, unknown element.</b> Ab GET VLAN 10 ke saath 200 deta hai. <code>.../nk-native:native/vlan</code> par <code>-d @vlan30.json</code> ka POST error-tag <code>unknown-element</code> ke saath 400 deta hai: <code>unknown element "vlan_id" in nk-native:vlan-list (valid: id, name)</code>. Tree <code>vlan-list* [id]</code> confirm karta hai. File theek karo: <code>sed -i 's/vlan_id/id/' vlan30.json</code>.</p>
<p><b>Error 4: 400, invalid value.</b> Agla POST error-tag <code>invalid-value</code> ke saath 400 deta hai: <code>invalid value "30" for leaf id (expected a number 2-4094 without quotes)</code>. Tree kehta hai <code>id</code> <code>uint16</code> hai, isliye JSON ko number chahiye. Fix: <code>sed -i 's/"30"/30/' vlan30.json</code>. File ban jaati hai <code>{"nk-native:vlan-list": [{"id": 30, "name": "VOICE"}]}</code>.</p>
<pre class="out">DEVBOX&gt; rest POST 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1 -d @vlan30.json
<span class="hl">HTTP/1.1 201 Created</span></pre>
<p><b>Verify.</b> <code>.../nk-native:native/vlan/vlan-list=30</code> par GET <code>{"id": 30, "name": "VOICE"}</code> ke saath 200 deta hai, DSW1 par <code>show vlan brief</code> <code>30 VOICE active</code> list karta hai, aur lab mein record karne wala POST ka jawab <b>201</b> hai. Wahi POST dobara chalane par ab 409 data-exists milega.</p>

<h3>Lab 1 ke errors jo raaste mein mil sakte hain</h3>
<table class="cmp"><tr><th>Symptom</th><th>Paaydaan</th><th>Wajah aur fix</th></tr>
<tr><td><code>netconf: connect to host 192.168.50.1 port 830: Connection refused</code></td><td>2</td><td>R1 par <code>netconf-yang</code> missing</td></tr>
<tr><td><code>devnet@192.168.50.1: Permission denied (password).</code></td><td>3</td><td>Galat password ya user missing</td></tr>
<tr><td>"authenticated, but NETCONF needs privilege level 15"</td><td>4</td><td>User bina <code>privilege 15</code> ke bana</td></tr>
<tr><td><code>&lt;rpc-error&gt;</code> <code>unknown-namespace</code></td><td>6</td><td>XML element bina <code>xmlns</code> ke</td></tr>
<tr><td>commit par <code>&lt;rpc-error&gt;</code> <code>operation-not-supported</code></td><td>6</td><td><code>:candidate</code> nahi; seedha running edit karo</td></tr>
<tr><td><code>interface=GigabitEthernet0/0</code> par RESTCONF 404</td><td>5</td><td>"/" ko <code>%2F</code> encode karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Timeout vs refusal. DEVBOX se <code>rest GET 192.168.60.99/...</code> teen second atakta hai aur "Timeout was reached" report karta hai: IP level par kisi ne jawab nahi diya (galat address, route ya ACL drop). <code>rest GET 192.168.60.2/...</code> 4 ms mein "Connection refused" ke saath fail hota hai: host ne TCP reset bheja, yaani woh zinda hai par service band hai. Do milte-julte messages se do bilkul alag paaydaan.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek saath kai cheezein badalna, jaise user dobara banana, RESTCONF re-enable karna aur JSON dobara likhna sab saath mein. Ticket theek ho jaata hai par aap kuch nahi seekhte, aur nayi problem bhi aa sakti hai. Ek cheez badlo, retest karo, naya code padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connection refused" HTTP status code nahi hai; yeh HTTP se pehle hota hai. 401 credentials ya method problem hai; 403 rights problem; 400 body; 404 URI. Exam aapko ek output deta hai aur poochhta hai kaunsa fix lagega.</p></div>

<div class="scn"><h4>API jo hardening ke baad mar gayi</h4><p>Security team ne hardening template lagaya, uske baad campus switches ki saari RESTCONF automation "Connection refused" dene lagi. Template ne <code>no ip h&#116;tp server</code> ke saath <code>no ip h&#116;tp secure-server</code> bhi jod diya tha, jabki irada sirf clear-text web access hatane ka tha. Secure server wapas lagane (aur use access class se restrict karne) se API wapas aa gayi aur device hardened bhi raha.</p><p><b>Seekh:</b> RESTCONF HTTPS server par depend karta hai; hardening templates ko use hatana nahi, ACL se restrict karke rakhna chahiye.</p></div>

<div class="iv"><p class="q">"Ek RESTCONF script switch ke against fail ho rahi hai. Aap troubleshoot kaise karoge?"</p><p>Strong answer: neeche se upar kaam karo. Ping karo aur timeout vs refused check karo. Refused hai to HTTPS server, restconf aur yang-management processes check karo. Phir status code padho: 401 matlab credentials ya authentication method, 403 matlab privilege ya AAA authorisation, 404 matlab galat path, module naam ya key encoding, 400 matlab body YANG model se match nahi karti, to names aur types tree se compare karo, 409 matlab data exist karta hai. Ek baar mein ek cheez badlo aur GET aur CLI se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seedhi: reachability, service, authentication, authorisation, path, payload aur state.</li>
<li>Timeout = network; refused = service nahi sun rahi; phir HTTP status code padho.</li>
<li>Lab 2 fixes: HTTPS secure server, privilege 15 user, key naam <code>id</code>, numeric <code>30</code>; success 201 hai.</li>
<li>Har 400 ko YANG tree se suljhao: names, keys aur types.</li>
<li>Ek baar mein ek cheez badlo; GET, <code>show</code> commands aur DMI logs se verify karo.</li>
</ul></div>
`}};export{e as default};