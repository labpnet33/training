var e={id:`models-paths-subs`,h:{en:`Models, paths and subscriptions`,hi:`Models, paths aur subscriptions`},body:{en:`
<h3>The idea: a menu everyone agrees on</h3>
<p>Imagine ordering food from three restaurants that each call "a cup of tea" something different. You would need three phrase books. Network devices used to be like that: every vendor named its CPU counter differently. A <b>data model</b> is a shared menu: it defines which items exist, what they are called and what type each has. Streaming telemetry asks for items by their names on this menu.</p>

<h3>YANG and OpenConfig-style models</h3>
<dl class="terms">
<dt>YANG</dt><dd>A language for describing a data model as a tree: containers, lists and leaves. A leaf holds one value, such as an operational status.</dd>
<dt>OpenConfig-style model</dt><dd>A vendor-neutral set of models that describe interfaces, routing, system and more in the same way across vendors. Vendors also publish their own native models. A device may support both.</dd>
<dt>Path</dt><dd>The address of a node in the tree, written like a file path with slashes, for example <code>/interfaces/interface/state/oper-status</code>.</dd>
<dt>Key predicate</dt><dd>A filter inside square brackets that picks one entry of a list, for example <code>interface[name=Gi0/1]</code> picks the interface called Gi0/1. Without it you select every interface.</dd>
</dl>
<p>The console knows six paths. Read them on the Telemetry page, in the card "Device model paths":</p>
<table class="cmp"><tr><th>Path</th><th>Modes it allows</th><th>Good for</th></tr>
<tr><td>/interfaces/interface/state/oper-status</td><td>sample, on-change</td><td>link up or down</td></tr>
<tr><td>/interfaces/interface/state/counters</td><td>sample</td><td>traffic and errors</td></tr>
<tr><td>/system/cpu</td><td>sample</td><td>CPU load</td></tr>
<tr><td>/system/memory</td><td>sample</td><td>memory use</td></tr>
<tr><td>/qos/interface/queue/depth</td><td>sample</td><td>queue depth, microbursts</td></tr>
<tr><td>/routing/bgp/neighbors/neighbor/state/session-state</td><td>sample, on-change</td><td>BGP session changes</td></tr></table>
<p>Notice the pattern: <b>state-like</b> values (up or down, session established or idle) allow on-change. <b>Rate-like</b> values (counters, CPU) are different on every read, so on-change would fire constantly. They allow sample only. The console ignores key predicates when matching a path against the model, but a typo in the path itself breaks the subscription.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Model tree and path">
<rect x="20" y="90" width="90" height="36" rx="8" fill="#e2e8f0"/><text x="65" y="113" text-anchor="middle" class="svg-ink" font-size="12">/ (root)</text>
<rect x="150" y="30" width="110" height="36" rx="8" fill="#bae6fd"/><text x="205" y="53" text-anchor="middle" class="svg-ink" font-size="12">interfaces</text>
<rect x="150" y="90" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="205" y="113" text-anchor="middle" class="svg-ink" font-size="12">system</text>
<rect x="150" y="150" width="110" height="36" rx="8" fill="#ddd6fe"/><text x="205" y="173" text-anchor="middle" class="svg-ink" font-size="12">qos</text>
<rect x="300" y="30" width="110" height="36" rx="8" fill="#bae6fd"/><text x="355" y="53" text-anchor="middle" class="svg-ink" font-size="12">interface[Gi0/1]</text>
<rect x="300" y="90" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="355" y="113" text-anchor="middle" class="svg-ink" font-size="12">cpu</text>
<rect x="450" y="30" width="170" height="36" rx="8" fill="#fde68a"/><text x="535" y="53" text-anchor="middle" class="svg-ink" font-size="12">state/oper-status</text>
<line x1="110" y1="108" x2="150" y2="48" stroke="#64748b" stroke-width="2"/><line x1="110" y1="108" x2="150" y2="108" stroke="#64748b" stroke-width="2"/><line x1="110" y1="108" x2="150" y2="168" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="48" x2="300" y2="48" stroke="#64748b" stroke-width="2"/><line x1="260" y1="108" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="410" y1="48" x2="450" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">path = /interfaces/interface[name=Gi0/1]/state/oper-status</text>
</svg><p class="cap">A path walks down the tree from the root to one leaf.</p></div>

<h3>gNMI: the protocol and its three verbs</h3>
<p>gNMI is a network management interface that runs over gRPC, which in turn runs over HTTP/2 and TLS. You do not need the wire details; you need the three operations:</p>
<ul>
<li><b>Get</b>: read the value at a path once, like one poll.</li>
<li><b>Set</b>: change configuration at a path (update, replace or delete). It is the only verb that changes the device.</li>
<li><b>Subscribe</b>: ask for a stream of updates for one or more paths. This is what telemetry uses.</li>
</ul>
<p>The device is the <b>target</b>; the program that asks is the <b>client</b>. The exact listening port is given in your vendor documentation. The console uses a simulator port for teaching and says so on the page.</p>

<h3>Encodings and TLS</h3>
<p><b>Encoding</b> is how values are written into the message. <b>JSON</b> is readable text, easy to debug and larger. <b>Protobuf</b> is a compact binary format that is smaller and faster for the CPU, but you need the schema to read it. Many devices offer both. Choose JSON while learning, protobuf when volume matters. <b>TLS</b> encrypts the channel and lets each side check the other's certificate. A subscription with the wrong TLS setting fails before any data flows. In the console each subscription has a TLS switch and each device agent has <code>tls</code> and <code>tlsOk</code> flags; if they disagree, the subscription shows the reason <code>tls</code>.</p>

<h3>What a subscription contains</h3>
<p>On the console a subscription is a card with these fields: name, target (the device), path, mode (sample or on-change), sample interval in ms, collector address and port, device port, TLS and Enabled. Press <b>Edit</b> on a card to see them.</p>
<pre class="out">ts-ctl-kch   target R-KCH
path       /interfaces/interface[name=Gi0/1]/state/oper-status
mode       <span class="hl">on-change</span>
collector  10.1.50.100:57400   tls on   enabled yes
status     streaming</pre>
<p><b>What does this change on the wire/policy?</b> Saving and applying a subscription tells the device: "open a secure channel to the collector and send me updates for this path in this mode". It adds load on the device for as long as the subscription exists. Deleting the card ends the stream.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) A typo in the path, such as <code>oper_status</code> instead of <code>oper-status</code>: the model has no such node. (2) Choosing on-change for a counter path. (3) Setting Subscribe but forgetting to enable the subscription. (4) Confusing gNMI Set (changes config) with Subscribe (read only).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which gNMI operation streams data?" Subscribe. Get returns the value once. Set modifies configuration.</p></div>

<div class="scn"><h4>The vendor-neutral path that worked on two routers</h4><p>Godavari Foods had routers from two vendors. The monitoring engineer wrote one OpenConfig-style interface path and used it for both. The same subscription returned operational status from each, with no vendor-specific rewrite. Only one router needed a native path for a queue counter the common model lacked.</p><p><b>Lesson:</b> common models reduce work, but check which paths each device really supports.</p></div>

<div class="iv"><p class="q">"What are YANG, a path and gNMI Subscribe?"</p><p>Strong answer: YANG describes the data model as a tree, a path addresses one node, and gNMI Subscribe asks the device to stream updates for those paths over a TLS-protected gRPC channel. I would mention sample and on-change modes and that Set is the verb that changes configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A data model is a shared menu; YANG describes it as a tree and a path addresses a node.</li>
<li>gNMI has three verbs: Get (once), Set (change), Subscribe (stream).</li>
<li>State paths allow on-change; rate-like paths allow sample only.</li>
<li>JSON is readable, protobuf is compact; TLS protects the channel.</li>
<li>A subscription is target, path, mode, interval, collector, port, TLS and enabled.</li>
</ul></div>
`,hi:`
<h3>Idea: ek menu jispar sab sehmat hain</h3>
<p>Kalpana karo ki aap teen restaurants se khana mangate ho aur har ek "ek cup chai" ko alag naam deta hai. Aapko teen phrase books chahiye honge. Network devices pehle aise hi the: har vendor apne CPU counter ka naam alag rakhta tha. <b>Data model</b> ek shared menu hai: yeh define karta hai ki kaun se items hain, unke naam kya hain aur har ek ka type kya hai. Streaming telemetry items ko is menu ke naam se maangti hai.</p>

<h3>YANG aur OpenConfig-style models</h3>
<dl class="terms">
<dt>YANG</dt><dd>Data model ko tree ki tarah describe karne ki language: containers, lists aur leaves. Ek leaf ek value rakhta hai, jaise operational status.</dd>
<dt>OpenConfig-style model</dt><dd>Vendor-neutral models ka set jo interfaces, routing, system aur baaki cheezon ko sab vendors mein ek jaise describe karta hai. Vendors apne native models bhi publish karte hain. Ek device dono support kar sakta hai.</dd>
<dt>Path</dt><dd>Tree ke ek node ka address, file path ki tarah slashes ke saath likha jaata hai, jaise <code>/interfaces/interface/state/oper-status</code>.</dd>
<dt>Key predicate</dt><dd>Square brackets ke andar ek filter jo list ki ek entry chunta hai, jaise <code>interface[name=Gi0/1]</code> Gi0/1 naam ka interface chunta hai. Iske bina aap saare interfaces chun lete ho.</dd>
</dl>
<p>Console chhe paths jaanta hai. Inhe Telemetry page ke "Device model paths" card mein padho:</p>
<table class="cmp"><tr><th>Path</th><th>Allowed modes</th><th>Kis kaam ke liye</th></tr>
<tr><td>/interfaces/interface/state/oper-status</td><td>sample, on-change</td><td>link up ya down</td></tr>
<tr><td>/interfaces/interface/state/counters</td><td>sample</td><td>traffic aur errors</td></tr>
<tr><td>/system/cpu</td><td>sample</td><td>CPU load</td></tr>
<tr><td>/system/memory</td><td>sample</td><td>memory use</td></tr>
<tr><td>/qos/interface/queue/depth</td><td>sample</td><td>queue depth, microbursts</td></tr>
<tr><td>/routing/bgp/neighbors/neighbor/state/session-state</td><td>sample, on-change</td><td>BGP session changes</td></tr></table>
<p>Pattern dekho: <b>state-like</b> values (up ya down, session established ya idle) on-change allow karti hain. <b>Rate-like</b> values (counters, CPU) har read par alag hoti hain, to on-change har waqt fire karega. Unme sirf sample allowed hai. Console path ko model se match karte waqt key predicates ignore karta hai, lekin path mein hi typo ho to subscription toot jaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Model tree and path">
<rect x="20" y="90" width="90" height="36" rx="8" fill="#e2e8f0"/><text x="65" y="113" text-anchor="middle" class="svg-ink" font-size="12">/ (root)</text>
<rect x="150" y="30" width="110" height="36" rx="8" fill="#bae6fd"/><text x="205" y="53" text-anchor="middle" class="svg-ink" font-size="12">interfaces</text>
<rect x="150" y="90" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="205" y="113" text-anchor="middle" class="svg-ink" font-size="12">system</text>
<rect x="150" y="150" width="110" height="36" rx="8" fill="#ddd6fe"/><text x="205" y="173" text-anchor="middle" class="svg-ink" font-size="12">qos</text>
<rect x="300" y="30" width="110" height="36" rx="8" fill="#bae6fd"/><text x="355" y="53" text-anchor="middle" class="svg-ink" font-size="12">interface[Gi0/1]</text>
<rect x="300" y="90" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="355" y="113" text-anchor="middle" class="svg-ink" font-size="12">cpu</text>
<rect x="450" y="30" width="170" height="36" rx="8" fill="#fde68a"/><text x="535" y="53" text-anchor="middle" class="svg-ink" font-size="12">state/oper-status</text>
<line x1="110" y1="108" x2="150" y2="48" stroke="#64748b" stroke-width="2"/><line x1="110" y1="108" x2="150" y2="108" stroke="#64748b" stroke-width="2"/><line x1="110" y1="108" x2="150" y2="168" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="48" x2="300" y2="48" stroke="#64748b" stroke-width="2"/><line x1="260" y1="108" x2="300" y2="108" stroke="#64748b" stroke-width="2"/><line x1="410" y1="48" x2="450" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">path = /interfaces/interface[name=Gi0/1]/state/oper-status</text>
</svg><p class="cap">Path root se neeche chalkar ek leaf tak pahunchta hai.</p></div>

<h3>gNMI: protocol aur uske teen verbs</h3>
<p>gNMI ek network management interface hai jo gRPC par chalta hai, aur gRPC HTTP/2 aur TLS par. Aapko wire details nahi chahiye; teen operations chahiye:</p>
<ul>
<li><b>Get</b>: ek path ki value ek baar padho, ek poll jaisa.</li>
<li><b>Set</b>: ek path par configuration badlo (update, replace ya delete). Yehi akela verb hai jo device ko badalta hai.</li>
<li><b>Subscribe</b>: ek ya zyada paths ke updates ki stream maango. Telemetry yehi use karti hai.</li>
</ul>
<p>Device <b>target</b> hai; jo program poochta hai woh <b>client</b>. Exact listening port aapke vendor documentation mein diya hota hai. Console teaching ke liye ek simulator port use karta hai aur page par yeh likha hai.</p>

<h3>Encodings aur TLS</h3>
<p><b>Encoding</b> yeh hai ki values message mein kaise likhi jaati hain. <b>JSON</b> readable text hai, debug karna aasan aur size mein bada. <b>Protobuf</b> compact binary format hai, chhota aur CPU ke liye tez, lekin padhne ke liye schema chahiye. Kai devices dono dete hain. Seekhte waqt JSON, volume badhne par protobuf chuno. <b>TLS</b> channel ko encrypt karta hai aur har side ko doosre ka certificate check karne deta hai. Galat TLS setting wali subscription data flow hone se pehle hi fail ho jaati hai. Console mein har subscription par TLS switch hai aur har device agent ke <code>tls</code> aur <code>tlsOk</code> flags hain; agar woh match nahi karte, subscription reason <code>tls</code> dikhati hai.</p>

<h3>Subscription mein kya hota hai</h3>
<p>Console par subscription ek card hai jisme ye fields hain: name, target (device), path, mode (sample ya on-change), sample interval ms mein, collector address aur port, device port, TLS aur Enabled. Fields dekhne ke liye card par <b>Edit</b> dabao.</p>
<pre class="out">ts-ctl-kch   target R-KCH
path       /interfaces/interface[name=Gi0/1]/state/oper-status
mode       <span class="hl">on-change</span>
collector  10.1.50.100:57400   tls on   enabled yes
status     streaming</pre>
<p><b>Wire/policy par kya badalta hai?</b> Subscription save aur apply karne se device ko kaha jaata hai: "collector tak secure channel kholo aur is path ke updates is mode mein bhejo". Jab tak subscription hai, device par load rehta hai. Card delete karne se stream ruk jaati hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Path mein typo, jaise <code>oper-status</code> ki jagah <code>oper_status</code>: model mein aisa koi node nahi. (2) Counter path par on-change chunna. (3) Subscribe set karna par subscription enable karna bhool jaana. (4) gNMI Set (config badalta hai) aur Subscribe (sirf read) ko mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaun sa gNMI operation data stream karta hai?" Subscribe. Get value ek baar deta hai. Set configuration modify karta hai.</p></div>

<div class="scn"><h4>Vendor-neutral path jo do routers par chala</h4><p>Godavari Foods ke paas do vendors ke routers the. Monitoring engineer ne ek OpenConfig-style interface path likha aur dono par use kiya. Wahi subscription har router se operational status layi, bina vendor-specific rewrite ke. Sirf ek router ko ek queue counter ke liye native path chahiye tha jo common model mein nahi tha.</p><p><b>Seekh:</b> common models kaam kam karte hain, lekin check karo ki har device sach mein kaun se paths support karta hai.</p></div>

<div class="iv"><p class="q">"YANG, path aur gNMI Subscribe kya hain?"</p><p>Strong answer: YANG data model ko tree ki tarah describe karta hai, path ek node ko address karta hai, aur gNMI Subscribe device se un paths ke updates TLS-protected gRPC channel par stream karne ko kehta hai. Main sample aur on-change modes batata aur yeh bhi ki Set woh verb hai jo configuration badalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data model shared menu hai; YANG use tree ki tarah describe karta hai aur path ek node ko address karta hai.</li>
<li>gNMI ke teen verbs: Get (ek baar), Set (change), Subscribe (stream).</li>
<li>State paths on-change allow karte hain; rate-like paths sirf sample.</li>
<li>JSON readable hai, protobuf compact; TLS channel ko protect karta hai.</li>
<li>Subscription matlab target, path, mode, interval, collector, port, TLS aur enabled.</li>
</ul></div>
`}};export{e as default};