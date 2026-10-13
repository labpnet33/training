var e={id:`restconf`,h:{en:`RESTCONF: URIs, media types and verbs`,hi:`RESTCONF: URIs, media types aur verbs`},body:{en:`
<p>If NETCONF is a formal meeting between lawyers, RESTCONF is a well-organised online shop. Every product has its own web address, you use the same few actions everywhere (look, add, change, remove), and the shop answers with a short status number: 200 all good, 404 not found, 409 already in your cart. RESTCONF takes the same YANG data as NETCONF and exposes it in that REST style over <b>HTTPS</b>.</p>

<h3>What RESTCONF is</h3>
<p><b>RESTCONF</b> is defined in <b>RFC 8040</b>. It runs over HTTPS on <b>TCP 443</b>, uses standard HTTP methods, and encodes data as <b>JSON</b> (RFC 7951) or <b>XML</b>. It is <b>stateless</b>: no sessions, no hello, no locks and no candidate datastore; each request carries its own credentials (usually HTTP Basic authentication inside TLS). That makes it perfect for quick scripts, web portals and tools such as Postman, while NETCONF stays stronger for large, multi-step transactions.</p>

<h3>Anatomy of a RESTCONF URI</h3>
<pre class="code">192.168.50.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description
<span class="c">| host        | API root | datastore | module:top-node          | list=key                  | leaf</span></pre>
<ul>
<li><b>/restconf</b> is the API root. A client can discover it with GET <code>/.well-known/host-meta</code>.</li>
<li><b>/data</b> is the combined datastore resource (config plus state). <b>/operations</b> holds RPCs; <code>/restconf/data/ietf-yang-library:modules-state</code> lists supported models.</li>
<li>The first node is <b>module-qualified</b>: <code>ietf-interfaces:interfaces</code>. Child nodes of the same module need no prefix; nodes from an augmenting module do (<code>ietf-ip:ipv4</code>).</li>
<li>A <b>list entry</b> is <code>list=key</code>; several keys are comma-separated (<code>static=10.0.0.0,255.0.0.0,10.0.12.2</code>).</li>
<li>Reserved characters inside a key are <b>percent-encoded</b>: "/" becomes <code>%2F</code>, so GigabitEthernet0/1 is <code>GigabitEthernet0%2F1</code>.</li>
</ul>
<div class="note"><p><b>Typing URLs in the lab.</b> This course writes addresses without the scheme. In the lab, the <code>rest</code> tool needs the full URL: type the HTTPS scheme (the letters, a colon and two slashes) in front of <code>192.168.50.1/restconf/...</code>.</p></div>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RESTCONF request and response">
<rect x="20" y="30" width="150" height="140" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">DEVBOX</text><text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="11">rest / Postman</text><text x="95" y="105" text-anchor="middle" class="svg-muted" font-size="11">Python requests</text>
<rect x="470" y="30" width="150" height="140" rx="8" fill="#bae6fd"/><text x="545" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="11">/restconf/data</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="11">YANG datastore</text>
<line x1="170" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">GET + Accept + Authorization</text>
<line x1="470" y1="130" x2="170" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">200 OK + application/yang-data+json</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">TLS on TCP 443, no session state</text>
</svg><p class="cap">Every RESTCONF call is one independent HTTPS request and response.</p></div>

<h3>Media types (headers)</h3>
<p>Use <code>Accept</code> to say what you want back and <code>Content-Type</code> to describe the body you send: <code>application/yang-data+json</code> or <code>application/yang-data+xml</code>. IOS XE defaults to JSON when you ask for nothing. Plain <code>application/json</code> is not the RESTCONF media type; strict servers answer 406 or 415.</p>

<h3>Verbs and their NETCONF twins</h3>
<table class="cmp"><tr><th>Method</th><th>Meaning</th><th>NETCONF equivalent</th><th>Typical success</th></tr>
<tr><td>GET</td><td>Read a resource</td><td>get / get-config</td><td>200 OK</td></tr>
<tr><td>POST</td><td>Create a <b>child</b> resource (or invoke an RPC)</td><td>edit-config operation create</td><td>201 Created</td></tr>
<tr><td>PUT</td><td>Create or <b>replace</b> the target resource</td><td>edit-config operation replace</td><td>201 (created) or 204 (replaced)</td></tr>
<tr><td>PATCH</td><td><b>Merge</b> into the target resource</td><td>edit-config operation merge</td><td>204 No Content</td></tr>
<tr><td>DELETE</td><td>Delete the target resource</td><td>edit-config operation delete</td><td>204 No Content</td></tr></table>
<p>POST is sent to the <b>parent</b> (<code>.../nk-native:native/vlan</code>) and the body carries the new entry; PUT, PATCH and DELETE are sent to the resource itself (<code>.../vlan/vlan-list=30</code>).</p>

<h3>Lab 1 tasks 5 to 7</h3>
<pre class="out">DEVBOX&gt; rest GET 192.168.50.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100 -u devnet:DevNet123
<span class="hl">HTTP/1.1 200 OK</span>
Server: nginx
<span class="hl">Content-Type: application/yang-data+json</span>

{
  "ietf-interfaces:interface": [
    {
      "name": "Loopback100",
      "description": "Managed by NETCONF",
      "type": "iana-if-type:softwareLoopback",
      "enabled": true,
      "ietf-ip:ipv4": {
        "address": [
          { "ip": "10.100.100.1", "netmask": "255.255.255.255" }
        ]
      }
    }
  ]
}</pre>
<p>The loopback created through NETCONF in XML is read back through RESTCONF in JSON: one datastore, two protocols. Notice the JSON rules from RFC 7951: the top member is <code>module:name</code>; a list is a JSON array even with one entry; <code>enabled</code> is a JSON boolean without quotes; the augmented <code>ietf-ip:ipv4</code> carries its module prefix. Add <code>-H 'Accept: application/yang-data+xml'</code> to see the same data in XML.</p>
<p>Task 6 reads state from the native model with GET <code>192.168.50.1/restconf/data/nk-native:native/router</code>. The reply includes <code>"neighbor-count": 1</code> and <code>"active-router-id": "1.1.1.1"</code>: RESTCONF GET on <code>/data</code> returns config <b>and</b> state by default (you can narrow it with the query parameter <code>?content=config</code> or <code>?content=nonconfig</code>, and limit size with <code>?depth=2</code> or <code>?fields=...</code>).</p>
<pre class="code">DEVBOX&gt; rest PATCH 192.168.50.1/restconf/data/nk-native:native/hostname -u devnet:DevNet123 -d '{"nk-native:hostname": "R1-CORE"}'
<span class="c">! expected: HTTP/1.1 204 No Content, and the R1 prompt becomes R1-CORE#</span></pre>
<p>On a real IOS XE router the same change is PATCH <code>/restconf/data/Cisco-IOS-XE-native:native/hostname</code> with <code>{"Cisco-IOS-XE-native:hostname": "R1-CORE"}</code>.</p>

<div class="eg"><p><b>Worked example.</b> Choose the verb. (a) Add VLAN 30 that does not exist: POST to <code>.../native/vlan</code>, expect 201. (b) Change its name only: PATCH <code>.../vlan-list=30</code> with <code>{"nk-native:vlan-list": [{"id": 30, "name": "VOICE-NEW"}]}</code>, expect 204. (c) Make VLAN 30 exactly match a golden body, removing extra leaves: PUT to <code>.../vlan-list=30</code>, expect 204. (d) Remove it: DELETE <code>.../vlan-list=30</code>, expect 204. POSTing VLAN 30 a second time returns 409 Conflict.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using PUT when you mean PATCH. PUT replaces the whole target: a PUT to an interface with only a description removes its IP address. Also, forgetting <code>%2F</code> in <code>GigabitEthernet0/1</code> makes the router read <code>1</code> as a child node and answer 400 or 404.</p></div>
<div class="exam"><p><b>Exam trap.</b> RESTCONF is RFC 8040, HTTPS, JSON or XML, stateless. PATCH = merge, PUT = replace, POST = create (409 if it exists). Media type is <code>application/yang-data+json</code>. RESTCONF has no candidate datastore and no lock operation.</p></div>

<div class="scn"><h4>The description that deleted an address</h4><p>A service desk portal updated interface descriptions with PUT to <code>.../interface=GigabitEthernet0%2F2</code>, sending only name, type and description. The first ticket it processed removed the IP address from a WAN interface and cut off a branch. The call was changed to PATCH on the <code>description</code> leaf, and a pre-change GET was added so the portal could show a diff.</p><p><b>Lesson:</b> PATCH merges, PUT replaces; read before you write.</p></div>

<div class="iv"><p class="q">"Compare NETCONF and RESTCONF."</p><p>Strong answer: both use YANG models. NETCONF (RFC 6241) runs over SSH port 830 with XML, is session-based, supports running, startup and candidate datastores, locks, validate and commit, which makes it strong for transactional, multi-device change. RESTCONF (RFC 8040) runs over HTTPS 443 with JSON or XML, is stateless, maps HTTP verbs to NETCONF operations (GET to get, POST to create, PUT to replace, PATCH to merge, DELETE to delete) and is easy to use from any HTTP tool. Many shops read with RESTCONF and change with NETCONF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URI: host / restconf / data / module:top-node / list=key / leaf; encode "/" in keys as %2F.</li>
<li>Media types: <code>application/yang-data+json</code> and <code>application/yang-data+xml</code> in Accept and Content-Type.</li>
<li>GET 200, POST 201, PUT 201/204, PATCH 204, DELETE 204.</li>
<li>JSON: module-qualified top member, lists are arrays, numbers and booleans without quotes.</li>
<li>RESTCONF GET on /data returns config and state; use <code>content</code>, <code>depth</code> and <code>fields</code> to narrow it.</li>
</ul></div>
`,hi:`
<p>Agar NETCONF lawyers ki formal meeting hai, to RESTCONF ek achhi tarah se organised online shop hai. Har product ka apna web address hai, aap har jagah wahi kuch actions use karte ho (dekho, add karo, badlo, hatao), aur shop ek chhote status number se jawab deti hai: 200 sab theek, 404 nahi mila, 409 pehle se cart mein hai. RESTCONF wahi YANG data leta hai jo NETCONF leta hai aur use <b>HTTPS</b> par is REST style mein dikhata hai.</p>

<h3>RESTCONF kya hai</h3>
<p><b>RESTCONF</b> <b>RFC 8040</b> mein define hai. Yeh <b>TCP 443</b> par HTTPS par chalta hai, standard HTTP methods use karta hai, aur data ko <b>JSON</b> (RFC 7951) ya <b>XML</b> mein encode karta hai. Yeh <b>stateless</b> hai: na sessions, na hello, na locks aur na candidate datastore; har request apne credentials khud le jaati hai (aam taur par TLS ke andar HTTP Basic authentication). Isse yeh quick scripts, web portals aur Postman jaise tools ke liye perfect hai, jabki bade, multi-step transactions ke liye NETCONF zyada strong rehta hai.</p>

<h3>RESTCONF URI ki anatomy</h3>
<pre class="code">192.168.50.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description
<span class="c">| host        | API root | datastore | module:top-node          | list=key                  | leaf</span></pre>
<ul>
<li><b>/restconf</b> API root hai. Client ise <code>/.well-known/host-meta</code> par GET karke discover kar sakta hai.</li>
<li><b>/data</b> combined datastore resource hai (config plus state). <b>/operations</b> mein RPCs hote hain; <code>/restconf/data/ietf-yang-library:modules-state</code> supported models list karta hai.</li>
<li>Pehla node <b>module-qualified</b> hota hai: <code>ietf-interfaces:interfaces</code>. Same module ke child nodes ko prefix nahi chahiye; augment karne wale module ke nodes ko chahiye (<code>ietf-ip:ipv4</code>).</li>
<li><b>List entry</b> <code>list=key</code> hai; kai keys comma se alag hoti hain (<code>static=10.0.0.0,255.0.0.0,10.0.12.2</code>).</li>
<li>Key ke andar reserved characters <b>percent-encode</b> hote hain: "/" <code>%2F</code> ban jaata hai, isliye GigabitEthernet0/1 <code>GigabitEthernet0%2F1</code> hai.</li>
</ul>
<div class="note"><p><b>Lab mein URLs type karna.</b> Yeh course addresses bina scheme ke likhta hai. Lab mein <code>rest</code> tool ko poora URL chahiye: <code>192.168.50.1/restconf/...</code> ke aage HTTPS scheme (letters, ek colon aur do slashes) type karo.</p></div>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RESTCONF request and response">
<rect x="20" y="30" width="150" height="140" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">DEVBOX</text><text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="11">rest / Postman</text><text x="95" y="105" text-anchor="middle" class="svg-muted" font-size="11">Python requests</text>
<rect x="470" y="30" width="150" height="140" rx="8" fill="#bae6fd"/><text x="545" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="11">/restconf/data</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="11">YANG datastore</text>
<line x1="170" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">GET + Accept + Authorization</text>
<line x1="470" y1="130" x2="170" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">200 OK + application/yang-data+json</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">TCP 443 par TLS, koi session state nahi</text>
</svg><p class="cap">Har RESTCONF call ek independent HTTPS request aur response hai.</p></div>

<h3>Media types (headers)</h3>
<p>Kya wapas chahiye yeh batane ke liye <code>Accept</code> use karo aur bheji body describe karne ke liye <code>Content-Type</code>: <code>application/yang-data+json</code> ya <code>application/yang-data+xml</code>. Kuch na maango to IOS XE default mein JSON deta hai. Plain <code>application/json</code> RESTCONF media type nahi hai; strict servers 406 ya 415 dete hain.</p>

<h3>Verbs aur unke NETCONF jodidaar</h3>
<table class="cmp"><tr><th>Method</th><th>Matlab</th><th>NETCONF equivalent</th><th>Typical success</th></tr>
<tr><td>GET</td><td>Resource padho</td><td>get / get-config</td><td>200 OK</td></tr>
<tr><td>POST</td><td>Ek <b>child</b> resource banao (ya RPC chalao)</td><td>edit-config operation create</td><td>201 Created</td></tr>
<tr><td>PUT</td><td>Target resource banao ya <b>replace</b> karo</td><td>edit-config operation replace</td><td>201 (bana) ya 204 (replace hua)</td></tr>
<tr><td>PATCH</td><td>Target resource mein <b>merge</b></td><td>edit-config operation merge</td><td>204 No Content</td></tr>
<tr><td>DELETE</td><td>Target resource delete</td><td>edit-config operation delete</td><td>204 No Content</td></tr></table>
<p>POST <b>parent</b> ko bheja jaata hai (<code>.../nk-native:native/vlan</code>) aur body mein nayi entry hoti hai; PUT, PATCH aur DELETE resource ko hi bheje jaate hain (<code>.../vlan/vlan-list=30</code>).</p>

<h3>Lab 1 tasks 5 se 7</h3>
<pre class="out">DEVBOX&gt; rest GET 192.168.50.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100 -u devnet:DevNet123
<span class="hl">HTTP/1.1 200 OK</span>
Server: nginx
<span class="hl">Content-Type: application/yang-data+json</span>

{
  "ietf-interfaces:interface": [
    {
      "name": "Loopback100",
      "description": "Managed by NETCONF",
      "type": "iana-if-type:softwareLoopback",
      "enabled": true,
      "ietf-ip:ipv4": {
        "address": [
          { "ip": "10.100.100.1", "netmask": "255.255.255.255" }
        ]
      }
    }
  ]
}</pre>
<p>NETCONF se XML mein bana loopback RESTCONF se JSON mein wapas padha jaata hai: ek datastore, do protocols. RFC 7951 ke JSON rules dekho: top member <code>module:name</code> hai; list JSON array hai chahe ek hi entry ho; <code>enabled</code> bina quotes ka JSON boolean hai; augment hua <code>ietf-ip:ipv4</code> apna module prefix rakhta hai. Wahi data XML mein dekhne ke liye <code>-H 'Accept: application/yang-data+xml'</code> jodo.</p>
<p>Task 6 native model se state padhta hai, <code>192.168.50.1/restconf/data/nk-native:native/router</code> par GET se. Reply mein <code>"neighbor-count": 1</code> aur <code>"active-router-id": "1.1.1.1"</code> hai: <code>/data</code> par RESTCONF GET default mein config <b>aur</b> state deta hai (aap ise query parameter <code>?content=config</code> ya <code>?content=nonconfig</code> se sankra kar sakte ho, aur <code>?depth=2</code> ya <code>?fields=...</code> se size limit kar sakte ho).</p>
<pre class="code">DEVBOX&gt; rest PATCH 192.168.50.1/restconf/data/nk-native:native/hostname -u devnet:DevNet123 -d '{"nk-native:hostname": "R1-CORE"}'
<span class="c">! expected: HTTP/1.1 204 No Content, aur R1 ka prompt R1-CORE# ban jaata hai</span></pre>
<p>Asli IOS XE router par yahi change <code>/restconf/data/Cisco-IOS-XE-native:native/hostname</code> par <code>{"Cisco-IOS-XE-native:hostname": "R1-CORE"}</code> ke saath PATCH hai.</p>

<div class="eg"><p><b>Worked example.</b> Verb chuno. (a) VLAN 30 add karo jo exist nahi karta: <code>.../native/vlan</code> par POST, 201 expect karo. (b) Sirf uska naam badlo: <code>{"nk-native:vlan-list": [{"id": 30, "name": "VOICE-NEW"}]}</code> ke saath <code>.../vlan-list=30</code> par PATCH, 204 expect karo. (c) VLAN 30 ko golden body se bilkul match karao, extra leaves hatakar: <code>.../vlan-list=30</code> par PUT, 204 expect karo. (d) Use hatao: <code>.../vlan-list=30</code> par DELETE, 204 expect karo. VLAN 30 ko doosri baar POST karne par 409 Conflict milta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> PATCH chahiye tha aur PUT use kiya. PUT poora target replace karta hai: sirf description ke saath interface par PUT uska IP address hata deta hai. Aur <code>GigabitEthernet0/1</code> mein <code>%2F</code> bhoolne se router <code>1</code> ko child node padhta hai aur 400 ya 404 deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> RESTCONF RFC 8040 hai, HTTPS, JSON ya XML, stateless. PATCH = merge, PUT = replace, POST = create (exist kare to 409). Media type <code>application/yang-data+json</code> hai. RESTCONF mein candidate datastore aur lock operation nahi hai.</p></div>

<div class="scn"><h4>Description jisne address delete kar diya</h4><p>Ek service desk portal interface descriptions ko <code>.../interface=GigabitEthernet0%2F2</code> par PUT se update karta tha, sirf name, type aur description bhejkar. Pehle hi ticket ne WAN interface se IP address hata diya aur ek branch kaat di. Call ko <code>description</code> leaf par PATCH mein badla gaya, aur change se pehle ek GET joda gaya taaki portal diff dikha sake.</p><p><b>Seekh:</b> PATCH merge karta hai, PUT replace; likhne se pehle padho.</p></div>

<div class="iv"><p class="q">"NETCONF aur RESTCONF compare karo."</p><p>Strong answer: dono YANG models use karte hain. NETCONF (RFC 6241) SSH port 830 par XML ke saath chalta hai, session-based hai, running, startup aur candidate datastores, locks, validate aur commit support karta hai, jo ise transactional, multi-device change ke liye strong banata hai. RESTCONF (RFC 8040) HTTPS 443 par JSON ya XML ke saath chalta hai, stateless hai, HTTP verbs ko NETCONF operations par map karta hai (GET se get, POST se create, PUT se replace, PATCH se merge, DELETE se delete) aur kisi bhi HTTP tool se use karna aasaan hai. Kai teams RESTCONF se padhti hain aur NETCONF se badalti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URI: host / restconf / data / module:top-node / list=key / leaf; keys mein "/" ko %2F encode karo.</li>
<li>Media types: Accept aur Content-Type mein <code>application/yang-data+json</code> aur <code>application/yang-data+xml</code>.</li>
<li>GET 200, POST 201, PUT 201/204, PATCH 204, DELETE 204.</li>
<li>JSON: module-qualified top member, lists arrays hain, numbers aur booleans bina quotes.</li>
<li>/data par RESTCONF GET config aur state deta hai; sankra karne ke liye <code>content</code>, <code>depth</code> aur <code>fields</code> use karo.</li>
</ul></div>
`}};export{e as default};