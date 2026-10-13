var e={id:`yang-trees-models`,h:{en:`Reading a YANG tree, and native vs IETF vs OpenConfig models`,hi:`YANG tree padhna, aur native vs IETF vs OpenConfig models`},body:{en:`
<p>A full YANG module can run to thousands of lines, just as a building has thousands of pages of drawings. Nobody reads all of them to find a room. You use the <b>floor plan</b>: one page that shows every room and corridor. For YANG the floor plan is the <b>tree view</b>, produced by the open-source tool <code>pyang -f tree</code>. Being able to read it quickly is the single most useful YANG skill, both in the exam and in real automation work.</p>

<h3>The tree for ietf-interfaces</h3>
<p>In Lab 1, task 2 asks you to print the tree on DEVBOX with <code>yang tree ietf-interfaces</code> (the lab's equivalent of <code>pyang -f tree ietf-interfaces.yang</code>):</p>
<pre class="out">DEVBOX&gt; yang tree ietf-interfaces
module: ietf-interfaces
  +--rw interfaces
<span class="hl">     +--rw interface* [name]</span>
        +--rw name                 string
        +--rw description?         string
        +--rw type                 identityref
        +--rw enabled?             boolean
<span class="hl">        +--ro oper-status          enumeration</span>
        +--ro phys-address?        yang:phys-address
        +--ro statistics
        |  +--ro in-octets?          yang:counter64
        |  +--ro out-octets?         yang:counter64
        +--rw ip:ipv4!               (augmented by ietf-ip)
        |  +--rw ip:address* [ip]
        |     +--rw ip:ip                  inet:ipv4-address-no-zone
        |     +--rw (subnet)
        |        +--:(prefix-length)
        |        |  +--rw ip:prefix-length?   uint8
        |        +--:(netmask)
        |           +--rw ip:netmask?         yang:dotted-quad</pre>

<h3>The symbols, one by one</h3>
<table class="cmp"><tr><th>Symbol</th><th>Meaning</th><th>Example</th></tr>
<tr><td><code>rw</code></td><td>Configuration data (config true): read-write</td><td><code>+--rw description?</code></td></tr>
<tr><td><code>ro</code></td><td>Operational state (config false): read-only</td><td><code>+--ro oper-status</code></td></tr>
<tr><td><code>?</code></td><td>Optional leaf (may be absent)</td><td><code>description?</code></td></tr>
<tr><td><code>*</code></td><td>List or leaf-list (many entries)</td><td><code>interface*</code></td></tr>
<tr><td><code>[name]</code></td><td>The key leaf(s) of the list</td><td><code>address* [ip]</code></td></tr>
<tr><td><code>!</code></td><td>Presence container</td><td><code>ipv4!</code></td></tr>
<tr><td><code>(subnet)</code> / <code>:(netmask)</code></td><td>A choice and one of its cases</td><td>prefix-length or netmask</td></tr>
<tr><td><code>-x</code> / <code>-n</code></td><td>RPC or action / notification</td><td><code>+---x reset</code></td></tr>
<tr><td><code>ip:</code> prefix</td><td>Node added by another module (augment)</td><td><code>ip:ipv4</code></td></tr></table>
<p>A leaf without <code>?</code> and without a default is mandatory when its parent exists, or it is a key. The column after the name is the <b>type</b>. So in one glance: the list key of <code>interface</code> is <b>name</b> (the answer to task 2), <code>oper-status</code> is state that <code>get-config</code> will never return, and an IPv4 address needs <code>ip</code> plus either <code>prefix-length</code> or <code>netmask</code>.</p>

<h3>From tree to URI, XML and JSON</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Tree to encodings">
<rect x="20" y="20" width="200" height="170" rx="8" fill="#e2e8f0"/><text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="13">tree path</text>
<text x="40" y="75" class="svg-muted" font-size="12">interfaces</text><text x="55" y="100" class="svg-muted" font-size="12">interface [name]</text><text x="70" y="125" class="svg-muted" font-size="12">description</text>
<rect x="260" y="20" width="360" height="45" rx="8" fill="#bae6fd"/><text x="440" y="47" text-anchor="middle" class="svg-ink" font-size="12">URI: .../interface=Loopback100/description</text>
<rect x="260" y="80" width="360" height="45" rx="8" fill="#bbf7d0"/><text x="440" y="107" text-anchor="middle" class="svg-ink" font-size="12">XPath: /interfaces/interface[name='Loopback100']</text>
<rect x="260" y="140" width="360" height="45" rx="8" fill="#fde68a"/><text x="440" y="167" text-anchor="middle" class="svg-ink" font-size="12">JSON: "ietf-interfaces:description"</text>
<line x1="220" y1="100" x2="260" y2="42" stroke="#64748b"/><line x1="220" y1="100" x2="260" y2="102" stroke="#64748b"/><line x1="220" y1="100" x2="260" y2="162" stroke="#64748b"/>
</svg><p class="cap">One tree path becomes a RESTCONF URI, a NETCONF XPath filter and JSON member names.</p></div>
<p>The tree tells you every path you will type later: RESTCONF uses <code>list=key</code>, NETCONF XPath filters use <code>list[key='value']</code>, and JSON prefixes the first node with the module name.</p>

<h3>Three families of models</h3>
<table class="cmp"><tr><th></th><th>IETF</th><th>OpenConfig</th><th>Native (vendor)</th></tr>
<tr><td>Written by</td><td>IETF working groups (RFCs)</td><td>Network operators (Google, Microsoft, AT&amp;T and others)</td><td>The vendor, e.g. Cisco-IOS-XE-native</td></tr>
<tr><td>Scope</td><td>Common basics: interfaces, IP, routing, ACLs</td><td>Operator needs, strong on telemetry and operational state</td><td>Every feature the platform has</td></tr>
<tr><td>Portable?</td><td>Yes, vendor-neutral</td><td>Yes, vendor-neutral</td><td>No, one OS only</td></tr>
<tr><td>Example</td><td><code>ietf-interfaces</code>, <code>ietf-ip</code></td><td><code>openconfig-interfaces</code></td><td><code>Cisco-IOS-XE-native</code>; lab: <code>nk-native</code></td></tr></table>
<p>Real networks mix them: use IETF or OpenConfig when the feature exists there (portable scripts), and native models for platform-specific features such as hostname, EEM or detailed OSPF knobs. On IOS XE, operational data usually lives in <code>Cisco-IOS-XE-*-oper</code> models. In the labs, <code>nk-native</code> plays the role of the Cisco native model: hostname, VLANs, static routes and OSPF, including the state leaf <code>neighbor-count</code>.</p>

<h3>How a device tells you which models it supports</h3>
<ul>
<li>The NETCONF <b>hello</b> lists every module and revision as a capability.</li>
<li>The <b>ietf-yang-library</b> model (<code>modules-state</code>) lists modules, revisions, features and <b>deviations</b> (places where the device does not implement a model exactly).</li>
<li>NETCONF <code>get-schema</code> downloads the module text from the device; Cisco also publishes all models in a public repository, and tools such as YANG Suite browse them graphically.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> You need the OSPF neighbour count on R1. The nk-native tree shows <code>native / router / ospf* [id] / neighbor-count</code> marked <code>ro</code>. Conclusion before you type anything: (1) it is state, so NETCONF <code>get-config</code> will not show it but <code>get</code> or a RESTCONF GET will; (2) you cannot PATCH it; (3) the RESTCONF path is <code>/restconf/data/nk-native:native/router</code>. That is exactly Lab 1 task 6, and the answer is 1 neighbour (R2).</p></div>

<div class="warn"><p><b>Common mistake.</b> Trying to configure a leaf marked <code>ro</code>, such as <code>oper-status</code>, to bring an interface up. The writable leaf is <code>enabled</code> (<code>rw</code>). The device answers 400 with a message that the leaf is config false.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a tree, <code>*</code> means list or leaf-list, not "mandatory"; <code>?</code> means optional. Also: OpenConfig is vendor-neutral but not an IETF standard; native models are the most complete but least portable.</p></div>

<div class="scn"><h4>The portable script that was not</h4><p>A team built interface automation on Cisco-IOS-XE-native paths, then bought a second vendor's routers. Every script had to be rewritten. For the next project they used openconfig-interfaces and ietf-interfaces for common data and kept native models only for platform-specific features, checking each device's yang-library for deviations first.</p><p><b>Lesson:</b> choose the model family deliberately: standard models for portability, native for completeness.</p></div>

<div class="iv"><p class="q">"How do you find which leaf to use when automating a feature you have never touched?"</p><p>Strong answer: check which modules the device supports (NETCONF hello or ietf-yang-library), pick IETF or OpenConfig if they cover the feature, otherwise the native model, then read the tree with pyang or YANG Suite: find the container, the list and its key, see rw versus ro and the type of each leaf. Configure one example on the CLI and GET it back to confirm the mapping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>pyang -f tree</code> gives the floor plan: rw = config, ro = state, ? = optional, * = list, [key] = list key, ! = presence.</li>
<li>The interface list key in ietf-interfaces is <b>name</b>.</li>
<li>Tree paths map directly to RESTCONF URIs, NETCONF XPath filters and JSON names.</li>
<li>IETF and OpenConfig are vendor-neutral; native models cover everything but only one platform.</li>
<li>Capabilities, ietf-yang-library and get-schema tell you what a device really supports.</li>
</ul></div>
`,hi:`
<p>Ek poora YANG module hazaaron lines ka ho sakta hai, jaise ek building ke drawings ke hazaaron pages hote hain. Ek kamra dhoondhne ke liye koi sab nahi padhta. Aap <b>floor plan</b> use karte ho: ek page jo har kamra aur corridor dikhata hai. YANG ke liye floor plan <b>tree view</b> hai, jo open-source tool <code>pyang -f tree</code> banata hai. Ise jaldi padh paana sabse kaam ka YANG skill hai, exam mein bhi aur asli automation kaam mein bhi.</p>

<h3>ietf-interfaces ka tree</h3>
<p>Lab 1 mein task 2 aapse DEVBOX par <code>yang tree ietf-interfaces</code> se tree print karwata hai (yeh lab mein <code>pyang -f tree ietf-interfaces.yang</code> ka barabar hai):</p>
<pre class="out">DEVBOX&gt; yang tree ietf-interfaces
module: ietf-interfaces
  +--rw interfaces
<span class="hl">     +--rw interface* [name]</span>
        +--rw name                 string
        +--rw description?         string
        +--rw type                 identityref
        +--rw enabled?             boolean
<span class="hl">        +--ro oper-status          enumeration</span>
        +--ro phys-address?        yang:phys-address
        +--ro statistics
        |  +--ro in-octets?          yang:counter64
        |  +--ro out-octets?         yang:counter64
        +--rw ip:ipv4!               (augmented by ietf-ip)
        |  +--rw ip:address* [ip]
        |     +--rw ip:ip                  inet:ipv4-address-no-zone
        |     +--rw (subnet)
        |        +--:(prefix-length)
        |        |  +--rw ip:prefix-length?   uint8
        |        +--:(netmask)
        |           +--rw ip:netmask?         yang:dotted-quad</pre>

<h3>Symbols, ek ek karke</h3>
<table class="cmp"><tr><th>Symbol</th><th>Matlab</th><th>Example</th></tr>
<tr><td><code>rw</code></td><td>Configuration data (config true): read-write</td><td><code>+--rw description?</code></td></tr>
<tr><td><code>ro</code></td><td>Operational state (config false): read-only</td><td><code>+--ro oper-status</code></td></tr>
<tr><td><code>?</code></td><td>Optional leaf (absent ho sakti hai)</td><td><code>description?</code></td></tr>
<tr><td><code>*</code></td><td>List ya leaf-list (kai entries)</td><td><code>interface*</code></td></tr>
<tr><td><code>[name]</code></td><td>List ki key leaf(s)</td><td><code>address* [ip]</code></td></tr>
<tr><td><code>!</code></td><td>Presence container</td><td><code>ipv4!</code></td></tr>
<tr><td><code>(subnet)</code> / <code>:(netmask)</code></td><td>Ek choice aur uska ek case</td><td>prefix-length ya netmask</td></tr>
<tr><td><code>-x</code> / <code>-n</code></td><td>RPC ya action / notification</td><td><code>+---x reset</code></td></tr>
<tr><td><code>ip:</code> prefix</td><td>Doosre module ka joda node (augment)</td><td><code>ip:ipv4</code></td></tr></table>
<p>Jis leaf par na <code>?</code> hai na default, woh parent ke exist karne par mandatory hai, ya woh key hai. Naam ke baad wala column <b>type</b> hai. To ek nazar mein: <code>interface</code> list ki key <b>name</b> hai (task 2 ka jawab), <code>oper-status</code> state hai jo <code>get-config</code> kabhi nahi dega, aur IPv4 address ko <code>ip</code> plus <code>prefix-length</code> ya <code>netmask</code> mein se ek chahiye.</p>

<h3>Tree se URI, XML aur JSON tak</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Tree to encodings">
<rect x="20" y="20" width="200" height="170" rx="8" fill="#e2e8f0"/><text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="13">tree path</text>
<text x="40" y="75" class="svg-muted" font-size="12">interfaces</text><text x="55" y="100" class="svg-muted" font-size="12">interface [name]</text><text x="70" y="125" class="svg-muted" font-size="12">description</text>
<rect x="260" y="20" width="360" height="45" rx="8" fill="#bae6fd"/><text x="440" y="47" text-anchor="middle" class="svg-ink" font-size="12">URI: .../interface=Loopback100/description</text>
<rect x="260" y="80" width="360" height="45" rx="8" fill="#bbf7d0"/><text x="440" y="107" text-anchor="middle" class="svg-ink" font-size="12">XPath: /interfaces/interface[name='Loopback100']</text>
<rect x="260" y="140" width="360" height="45" rx="8" fill="#fde68a"/><text x="440" y="167" text-anchor="middle" class="svg-ink" font-size="12">JSON: "ietf-interfaces:description"</text>
<line x1="220" y1="100" x2="260" y2="42" stroke="#64748b"/><line x1="220" y1="100" x2="260" y2="102" stroke="#64748b"/><line x1="220" y1="100" x2="260" y2="162" stroke="#64748b"/>
</svg><p class="cap">Ek tree path RESTCONF URI, NETCONF XPath filter aur JSON member names ban jaata hai.</p></div>
<p>Tree aapko har woh path batata hai jo aap baad mein type karoge: RESTCONF <code>list=key</code> use karta hai, NETCONF XPath filters <code>list[key='value']</code> use karte hain, aur JSON pehle node ke aage module ka naam lagata hai.</p>

<h3>Models ki teen families</h3>
<table class="cmp"><tr><th></th><th>IETF</th><th>OpenConfig</th><th>Native (vendor)</th></tr>
<tr><td>Kisne likha</td><td>IETF working groups (RFCs)</td><td>Network operators (Google, Microsoft, AT&amp;T aur doosre)</td><td>Vendor, jaise Cisco-IOS-XE-native</td></tr>
<tr><td>Scope</td><td>Common basics: interfaces, IP, routing, ACLs</td><td>Operators ki zarooratein, telemetry aur operational state mein strong</td><td>Platform ka har feature</td></tr>
<tr><td>Portable?</td><td>Haan, vendor-neutral</td><td>Haan, vendor-neutral</td><td>Nahi, sirf ek OS</td></tr>
<tr><td>Example</td><td><code>ietf-interfaces</code>, <code>ietf-ip</code></td><td><code>openconfig-interfaces</code></td><td><code>Cisco-IOS-XE-native</code>; lab: <code>nk-native</code></td></tr></table>
<p>Asli networks inhe mix karte hain: jab feature IETF ya OpenConfig mein ho tab unhe use karo (portable scripts), aur platform-specific features jaise hostname, EEM ya detailed OSPF knobs ke liye native models. IOS XE par operational data aam taur par <code>Cisco-IOS-XE-*-oper</code> models mein hota hai. Labs mein <code>nk-native</code> Cisco native model ka role nibhata hai: hostname, VLANs, static routes aur OSPF, state leaf <code>neighbor-count</code> ke saath.</p>

<h3>Device kaise batata hai ki woh kaunse models support karta hai</h3>
<ul>
<li>NETCONF <b>hello</b> har module aur revision ko capability ki tarah list karta hai.</li>
<li><b>ietf-yang-library</b> model (<code>modules-state</code>) modules, revisions, features aur <b>deviations</b> list karta hai (woh jagah jahan device model ko bilkul waisa implement nahi karta).</li>
<li>NETCONF <code>get-schema</code> device se module text download karta hai; Cisco saare models ek public repository mein bhi publish karta hai, aur YANG Suite jaise tools unhe graphically browse karte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aapko R1 par OSPF neighbour count chahiye. nk-native tree <code>native / router / ospf* [id] / neighbor-count</code> ko <code>ro</code> mark karke dikhata hai. Kuch type karne se pehle nateeja: (1) yeh state hai, isliye NETCONF <code>get-config</code> ise nahi dikhayega par <code>get</code> ya RESTCONF GET dikhayega; (2) aap ise PATCH nahi kar sakte; (3) RESTCONF path <code>/restconf/data/nk-native:native/router</code> hai. Yahi Lab 1 ka task 6 hai, aur jawab 1 neighbour (R2) hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Interface up karne ke liye <code>ro</code> marked leaf, jaise <code>oper-status</code>, configure karne ki koshish. Writable leaf <code>enabled</code> (<code>rw</code>) hai. Device 400 ke saath jawab deta hai ki leaf config false hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tree mein <code>*</code> ka matlab list ya leaf-list hai, "mandatory" nahi; <code>?</code> ka matlab optional. Aur: OpenConfig vendor-neutral hai par IETF standard nahi; native models sabse complete par sabse kam portable hain.</p></div>

<div class="scn"><h4>Portable script jo portable nahi thi</h4><p>Ek team ne interface automation Cisco-IOS-XE-native paths par banaya, phir doosre vendor ke routers khareed liye. Har script dobara likhni padi. Agle project ke liye unhone common data ke liye openconfig-interfaces aur ietf-interfaces use kiye aur native models sirf platform-specific features ke liye rakhe, pehle har device ki yang-library mein deviations check karke.</p><p><b>Seekh:</b> model family soch samajh kar chuno: portability ke liye standard models, completeness ke liye native.</p></div>

<div class="iv"><p class="q">"Jo feature aapne kabhi touch nahi kiya use automate karte waqt aap kaunsi leaf use karni hai kaise dhoondhoge?"</p><p>Strong answer: check karo device kaunse modules support karta hai (NETCONF hello ya ietf-yang-library), agar IETF ya OpenConfig feature cover karte hain to unhe chuno, warna native model, phir pyang ya YANG Suite se tree padho: container, list aur uski key dhoondho, rw vs ro aur har leaf ka type dekho. CLI par ek example configure karo aur mapping confirm karne ke liye use GET karke wapas dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>pyang -f tree</code> floor plan deta hai: rw = config, ro = state, ? = optional, * = list, [key] = list key, ! = presence.</li>
<li>ietf-interfaces mein interface list ki key <b>name</b> hai.</li>
<li>Tree paths seedha RESTCONF URIs, NETCONF XPath filters aur JSON names par map hote hain.</li>
<li>IETF aur OpenConfig vendor-neutral hain; native models sab cover karte hain par sirf ek platform.</li>
<li>Capabilities, ietf-yang-library aur get-schema batate hain ki device asal mein kya support karta hai.</li>
</ul></div>
`}};export{e as default};