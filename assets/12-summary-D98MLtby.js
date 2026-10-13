var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs a checklist before every take-off even after thousands of flights, because memory fails under pressure and a list does not. This chapter is your pre-exam and pre-interview checklist for model-driven programmability: what you must be able to do, the words you must define in one sentence, the facts that come up again and again, and a one-screen command sheet for both labs.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why CLI scraping is fragile and what model-driven programmability adds (structure, types, validation, transactions, clear replies).</li>
<li>Describe the benefits of YANG and identify module, namespace, prefix, revision, container, list and key, leaf, leaf-list, typedef, grouping/uses, augment, choice and config false.</li>
<li>Read a <code>pyang -f tree</code> output: rw, ro, ?, *, [key], !, augmented prefixes; find the key of any list.</li>
<li>Compare IETF, OpenConfig and native models, and find the models a device supports (hello, yang-library, get-schema).</li>
<li>Enable and verify NETCONF and RESTCONF on IOS XE.</li>
<li>Describe NETCONF layers, hello and capabilities, datastores and operations; run a filtered get-config and an edit-config with namespaces.</li>
<li>Build a RESTCONF URI, choose GET/POST/PUT/PATCH/DELETE, set the media type, and predict the status code.</li>
<li>Interpret 200, 201, 202, 204, 400, 401, 403, 404, 409 and the <code>ietf-restconf:errors</code> body; walk a JSON payload to a value.</li>
<li>Describe how to authenticate to and query the Catalyst Center and SD-WAN Manager APIs.</li>
<li>Explain periodic versus on-change, dial-in versus dial-out telemetry, and gNMI's four RPCs.</li>
<li>Troubleshoot bottom-up: reachability, service, authentication, authorisation, path, payload.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">YANG (6.3)</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="11">model, tree, families</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">NETCONF</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">SSH 830, XML, datastores</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">RESTCONF</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="11">HTTPS 443, JSON/XML</text>
<rect x="20" y="130" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="152" text-anchor="middle" class="svg-ink" font-size="13">Codes, payloads (6.5)</text><text x="110" y="170" text-anchor="middle" class="svg-muted" font-size="11">2xx, 4xx, JSON walk</text>
<rect x="230" y="130" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Controllers (6.4)</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">Catalyst Center, SD-WAN</text>
<rect x="440" y="130" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="152" text-anchor="middle" class="svg-ink" font-size="13">Telemetry</text><text x="530" y="170" text-anchor="middle" class="svg-muted" font-size="11">dial-in/out, gNMI</text>
<line x1="200" y1="45" x2="230" y2="45" stroke="#64748b"/><line x1="410" y1="45" x2="440" y2="45" stroke="#64748b"/><line x1="530" y1="70" x2="110" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="70" x2="530" y2="130" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">one YANG model under everything</text>
</svg><p class="cap">The whole module on one page, with the blueprint items it covers.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>YANG</dt><dd>Data modelling language (RFC 7950) describing config, state, RPCs and notifications.</dd>
<dt>Container / list / leaf</dt><dd>Group that occurs once / entries identified by a key / single typed value.</dd>
<dt>augment</dt><dd>One module adding nodes into another's tree (ietf-ip adds ipv4 to interfaces).</dd>
<dt>Capability</dt><dd>A URN in the NETCONF hello announcing a feature or a supported module.</dd>
<dt>Datastore</dt><dd>A copy of configuration: running, startup, candidate.</dd>
<dt>Candidate</dt><dd>Scratch datastore applied with commit; needs <code>:candidate</code>.</dd>
<dt>error-tag</dt><dd>Machine-readable error name in NETCONF and RESTCONF replies (invalid-value, data-exists...).</dd>
<dt>Intent API</dt><dd>Catalyst Center's northbound REST API.</dd>
<dt>Dial-out</dt><dd>Telemetry subscription configured on the device, which connects to the receiver.</dd>
<dt>gNMI</dt><dd>gRPC service with Capabilities, Get, Set and Subscribe.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ports</td><td>NETCONF TCP 830 (SSH); RESTCONF TCP 443 (HTTPS)</td></tr>
<tr><td>RFCs</td><td>YANG 7950, NETCONF 6241, RESTCONF 8040, JSON for YANG 7951</td></tr>
<tr><td>Encodings</td><td>NETCONF XML only; RESTCONF JSON or XML; telemetry GPB/kvGPB/JSON</td></tr>
<tr><td>get vs get-config</td><td>get = config + state; get-config = config only</td></tr>
<tr><td>edit-config operations</td><td>merge (default), replace, create, delete, remove</td></tr>
<tr><td>Verb mapping</td><td>POST create 201, PUT replace 201/204, PATCH merge 204, DELETE 204, GET 200</td></tr>
<tr><td>Media type</td><td><code>application/yang-data+json</code> / <code>+xml</code></td></tr>
<tr><td>401 vs 403</td><td>401 identity (credentials, token); 403 permission (privilege 15)</td></tr>
<tr><td>409</td><td>POST of existing data (data-exists) or lock held</td></tr>
<tr><td>URI key encoding</td><td><code>interface=GigabitEthernet0%2F1</code></td></tr>
<tr><td>Catalyst Center</td><td>Token from <code>/dna/system/api/v1/auth/token</code>, header <code>X-Auth-Token</code>, data in <code>response</code>, async 202 + taskId</td></tr>
<tr><td>SD-WAN Manager</td><td><code>/j_security_check</code> cookie, <code>X-XSRF-TOKEN</code>, <code>/dataservice/</code>, data in <code>data</code></td></tr>
<tr><td>Telemetry</td><td>IOS XE periodic in centiseconds; dial-out persistent, dial-in dynamic</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! IOS XE: enable and verify</span>
username devnet privilege 15 secret DevNet123
netconf-yang
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf
show netconf-yang status | sessions
show platform software yang-management process
show ip h&#116;tp server status
<span class="c">! DEVBOX: YANG and NETCONF</span>
yang tree ietf-interfaces
netconf 192.168.50.1 -u devnet:DevNet123
get-config running /interfaces
get /interfaces
edit-config running &lt;config&gt;...&lt;/config&gt;
close-session
<span class="c">! DEVBOX: RESTCONF (type the HTTPS scheme before the address)</span>
rest GET 192.168.50.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100 -u devnet:DevNet123
rest PATCH 192.168.50.1/restconf/data/nk-native:native/hostname -u devnet:DevNet123 -d '{"nk-native:hostname": "R1-CORE"}'
rest POST 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1 -d @vlan30.json</pre>
<pre class="out">Lab 1 answers: list key = <span class="hl">name</span>; OSPF neighbor-count = <span class="hl">1</span>; PATCH = <span class="hl">204</span>
Lab 2 answers: refused -&gt; secure server; 403 -&gt; privilege 15; 400 -&gt; id, number 30; POST = <span class="hl">201</span></pre>

<div class="eg"><p><b>Worked example: a last self-test.</b> "Create Loopback200 with RESTCONF, then change only its description." Answer: POST to <code>/restconf/data/ietf-interfaces:interfaces</code> with <code>{"ietf-interfaces:interface": [{"name": "Loopback200", "type": "iana-if-type:softwareLoopback", "enabled": true}]}</code>, expect 201; then PATCH <code>.../interface=Loopback200/description</code> with <code>{"ietf-interfaces:description": "TEST"}</code>, expect 204; verify with GET 200. If you could say that without looking, you are ready.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising URIs without the model behind them. The exam changes the model; the method (tree, key, namespace or module prefix, verb, expected code) stays the same.</p></div>
<div class="exam"><p><b>Exam trap.</b> Watch for distractors that swap ports (830 and 443), encodings (JSON on NETCONF), verbs (PUT described as merge), and old/new names (vManage and SD-WAN Manager, DNA Center and Catalyst Center are the same products).</p></div>

<div class="scn"><h4>The interview that turned on one tree</h4><p>A candidate for a network automation role was handed a printed pyang tree of an unfamiliar OpenConfig model and asked to write the RESTCONF URI for one leaf and the JSON body to change it. They found the list and key, noted the leaf was rw and its type was uint16, wrote the URI with <code>list=key</code>, chose PATCH, and sent the number without quotes. They got the offer; the interviewer said most candidates guessed.</p><p><b>Lesson:</b> the durable skill is reading the model; everything else follows from it.</p></div>

<div class="iv"><p class="q">"In two minutes, explain model-driven programmability to a network manager."</p><p>Strong answer: devices publish YANG models that describe their configuration and state as structured, typed data. We read and change that data through APIs: NETCONF over SSH for transactional changes, RESTCONF over HTTPS for simple REST access, gNMI for streaming telemetry. Replies are machine-readable, changes are validated before they apply, and controllers such as Catalyst Center and SD-WAN Manager add network-wide REST APIs on top. Result: faster, safer, auditable changes and better visibility.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG is the contract; NETCONF, RESTCONF and gNMI move data that follows it.</li>
<li>Know the ports, RFCs, encodings, datastores and the verb-to-operation mapping cold.</li>
<li>Status codes tell you the failing layer: 400 data, 401 identity, 403 rights, 404 path, 409 exists.</li>
<li>Controllers: token or session auth, then REST calls under their API prefix.</li>
<li>Telemetry pushes YANG data periodically or on change, dial-in or dial-out.</li>
</ul></div>
`,hi:`
<p>Pilot hazaaron flights ke baad bhi har take-off se pehle checklist chalata hai, kyunki pressure mein yaaddasht fail hoti hai aur list nahi. Yeh chapter model-driven programmability ke liye aapki pre-exam aur pre-interview checklist hai: aapko kya kar paana chahiye, woh shabd jinhe ek sentence mein define karna hai, woh facts jo baar-baar aate hain, aur dono labs ke liye ek-screen command sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain karo ki CLI scraping kyun fragile hai aur model-driven programmability kya jodti hai (structure, types, validation, transactions, saaf replies).</li>
<li>YANG ke fayde describe karo aur module, namespace, prefix, revision, container, list aur key, leaf, leaf-list, typedef, grouping/uses, augment, choice aur config false pehchano.</li>
<li><code>pyang -f tree</code> output padho: rw, ro, ?, *, [key], !, augmented prefixes; kisi bhi list ki key dhoondho.</li>
<li>IETF, OpenConfig aur native models compare karo, aur device kaunse models support karta hai yeh dhoondho (hello, yang-library, get-schema).</li>
<li>IOS XE par NETCONF aur RESTCONF enable aur verify karo.</li>
<li>NETCONF layers, hello aur capabilities, datastores aur operations describe karo; filtered get-config aur namespaces ke saath edit-config chalao.</li>
<li>RESTCONF URI banao, GET/POST/PUT/PATCH/DELETE chuno, media type set karo, aur status code predict karo.</li>
<li>200, 201, 202, 204, 400, 401, 403, 404, 409 aur <code>ietf-restconf:errors</code> body samjho; JSON payload mein ek value tak chalo.</li>
<li>Catalyst Center aur SD-WAN Manager APIs mein authenticate aur query karna describe karo.</li>
<li>Periodic vs on-change, dial-in vs dial-out telemetry, aur gNMI ke chaar RPCs explain karo.</li>
<li>Neeche se upar troubleshoot karo: reachability, service, authentication, authorisation, path, payload.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">YANG (6.3)</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="11">model, tree, families</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">NETCONF</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">SSH 830, XML, datastores</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">RESTCONF</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="11">HTTPS 443, JSON/XML</text>
<rect x="20" y="130" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="152" text-anchor="middle" class="svg-ink" font-size="13">Codes, payloads (6.5)</text><text x="110" y="170" text-anchor="middle" class="svg-muted" font-size="11">2xx, 4xx, JSON walk</text>
<rect x="230" y="130" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Controllers (6.4)</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">Catalyst Center, SD-WAN</text>
<rect x="440" y="130" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="152" text-anchor="middle" class="svg-ink" font-size="13">Telemetry</text><text x="530" y="170" text-anchor="middle" class="svg-muted" font-size="11">dial-in/out, gNMI</text>
<line x1="200" y1="45" x2="230" y2="45" stroke="#64748b"/><line x1="410" y1="45" x2="440" y2="45" stroke="#64748b"/><line x1="530" y1="70" x2="110" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="70" x2="530" y2="130" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">sab ke neeche ek YANG model</text>
</svg><p class="cap">Poora module ek page par, cover hone wale blueprint items ke saath.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>YANG</dt><dd>Data modelling language (RFC 7950) jo config, state, RPCs aur notifications describe karti hai.</dd>
<dt>Container / list / leaf</dt><dd>Ek baar aane wala group / key se pehchani jaane wali entries / single typed value.</dd>
<dt>augment</dt><dd>Ek module doosre ke tree mein nodes jodta hai (ietf-ip interfaces mein ipv4 jodta hai).</dd>
<dt>Capability</dt><dd>NETCONF hello mein ek URN jo feature ya supported module announce karta hai.</dd>
<dt>Datastore</dt><dd>Configuration ki ek copy: running, startup, candidate.</dd>
<dt>Candidate</dt><dd>Scratch datastore jo commit se apply hota hai; <code>:candidate</code> chahiye.</dd>
<dt>error-tag</dt><dd>NETCONF aur RESTCONF replies mein machine-readable error naam (invalid-value, data-exists...).</dd>
<dt>Intent API</dt><dd>Catalyst Center ka northbound REST API.</dd>
<dt>Dial-out</dt><dd>Device par configured telemetry subscription, jo receiver se connect karta hai.</dd>
<dt>gNMI</dt><dd>Capabilities, Get, Set aur Subscribe wali gRPC service.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ports</td><td>NETCONF TCP 830 (SSH); RESTCONF TCP 443 (HTTPS)</td></tr>
<tr><td>RFCs</td><td>YANG 7950, NETCONF 6241, RESTCONF 8040, YANG ke liye JSON 7951</td></tr>
<tr><td>Encodings</td><td>NETCONF sirf XML; RESTCONF JSON ya XML; telemetry GPB/kvGPB/JSON</td></tr>
<tr><td>get vs get-config</td><td>get = config + state; get-config = sirf config</td></tr>
<tr><td>edit-config operations</td><td>merge (default), replace, create, delete, remove</td></tr>
<tr><td>Verb mapping</td><td>POST create 201, PUT replace 201/204, PATCH merge 204, DELETE 204, GET 200</td></tr>
<tr><td>Media type</td><td><code>application/yang-data+json</code> / <code>+xml</code></td></tr>
<tr><td>401 vs 403</td><td>401 identity (credentials, token); 403 permission (privilege 15)</td></tr>
<tr><td>409</td><td>Existing data ka POST (data-exists) ya lock pakda hua</td></tr>
<tr><td>URI key encoding</td><td><code>interface=GigabitEthernet0%2F1</code></td></tr>
<tr><td>Catalyst Center</td><td><code>/dna/system/api/v1/auth/token</code> se token, header <code>X-Auth-Token</code>, data <code>response</code> mein, async 202 + taskId</td></tr>
<tr><td>SD-WAN Manager</td><td><code>/j_security_check</code> cookie, <code>X-XSRF-TOKEN</code>, <code>/dataservice/</code>, data <code>data</code> mein</td></tr>
<tr><td>Telemetry</td><td>IOS XE periodic centiseconds mein; dial-out persistent, dial-in dynamic</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! IOS XE: enable aur verify</span>
username devnet privilege 15 secret DevNet123
netconf-yang
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf
show netconf-yang status | sessions
show platform software yang-management process
show ip h&#116;tp server status
<span class="c">! DEVBOX: YANG aur NETCONF</span>
yang tree ietf-interfaces
netconf 192.168.50.1 -u devnet:DevNet123
get-config running /interfaces
get /interfaces
edit-config running &lt;config&gt;...&lt;/config&gt;
close-session
<span class="c">! DEVBOX: RESTCONF (address ke aage HTTPS scheme type karo)</span>
rest GET 192.168.50.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100 -u devnet:DevNet123
rest PATCH 192.168.50.1/restconf/data/nk-native:native/hostname -u devnet:DevNet123 -d '{"nk-native:hostname": "R1-CORE"}'
rest POST 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1 -d @vlan30.json</pre>
<pre class="out">Lab 1 answers: list key = <span class="hl">name</span>; OSPF neighbor-count = <span class="hl">1</span>; PATCH = <span class="hl">204</span>
Lab 2 answers: refused -&gt; secure server; 403 -&gt; privilege 15; 400 -&gt; id, number 30; POST = <span class="hl">201</span></pre>

<div class="eg"><p><b>Worked example: aakhri self-test.</b> "RESTCONF se Loopback200 banao, phir sirf uska description badlo." Jawab: <code>/restconf/data/ietf-interfaces:interfaces</code> par <code>{"ietf-interfaces:interface": [{"name": "Loopback200", "type": "iana-if-type:softwareLoopback", "enabled": true}]}</code> ke saath POST, 201 expect karo; phir <code>.../interface=Loopback200/description</code> par <code>{"ietf-interfaces:description": "TEST"}</code> ke saath PATCH, 204 expect karo; GET 200 se verify karo. Agar aap yeh bina dekhe bol sakte ho, to aap ready ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Model samjhe bina URIs ratna. Exam model badal deta hai; tarika (tree, key, namespace ya module prefix, verb, expected code) wahi rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aise distractors se bacho jo ports (830 aur 443), encodings (NETCONF par JSON), verbs (PUT ko merge batana), aur purane/naye naam ulat dete hain (vManage aur SD-WAN Manager, DNA Center aur Catalyst Center same products hain).</p></div>

<div class="scn"><h4>Interview jo ek tree par palat gaya</h4><p>Network automation role ke ek candidate ko ek anjaan OpenConfig model ka printed pyang tree diya gaya aur ek leaf ka RESTCONF URI aur use badalne ki JSON body likhne ko kaha gaya. Unhone list aur key dhoondhi, note kiya ki leaf rw hai aur uska type uint16 hai, <code>list=key</code> ke saath URI likha, PATCH chuna, aur number bina quotes bheja. Unhe offer mila; interviewer ne kaha zyada tar candidates ne guess kiya tha.</p><p><b>Seekh:</b> tikne wala skill model padhna hai; baaki sab usi se nikalta hai.</p></div>

<div class="iv"><p class="q">"Do minute mein ek network manager ko model-driven programmability samjhao."</p><p>Strong answer: devices YANG models publish karte hain jo unki configuration aur state ko structured, typed data ki tarah describe karte hain. Hum us data ko APIs se padhte aur badalte hain: transactional changes ke liye SSH par NETCONF, simple REST access ke liye HTTPS par RESTCONF, streaming telemetry ke liye gNMI. Replies machine-readable hote hain, changes apply hone se pehle validate hote hain, aur Catalyst Center aur SD-WAN Manager jaise controllers upar se network-wide REST APIs jodte hain. Nateeja: tez, safe, auditable changes aur behtar visibility.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG contract hai; NETCONF, RESTCONF aur gNMI us contract ko follow karne wala data le jaate hain.</li>
<li>Ports, RFCs, encodings, datastores aur verb-to-operation mapping zubaani yaad rakho.</li>
<li>Status codes fail hone wali layer batate hain: 400 data, 401 identity, 403 rights, 404 path, 409 exists.</li>
<li>Controllers: token ya session auth, phir unke API prefix ke neeche REST calls.</li>
<li>Telemetry YANG data periodically ya change par push karti hai, dial-in ya dial-out.</li>
</ul></div>
`}};export{e as default};