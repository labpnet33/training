var e={id:`programmability`,h:{en:`Designing for programmability: YANG, NETCONF, RESTCONF and gNMI`,hi:`Programmability ka design: YANG, NETCONF, RESTCONF aur gNMI`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design the automation and assurance layer of an enterprise network, the way the ENSLD 300-420 exam and real design reviews expect it: choosing programmability interfaces, deciding between a controller and device-by-device tooling, designing monitoring and telemetry that scales, building a management network that survives an outage, and wrapping everything in change control. Every chapter starts from a customer case, because the exam asks you to pick the best design for a situation, not to recite definitions. <b>Prerequisites:</b> ENCOR-level knowledge (routing, switching, wireless basics), what an API is, and what JSON looks like. You do not need to be a programmer.</p>

<h3>The customer case: Kestrel Retail Group</h3>
<p>Kestrel Retail runs 180 stores in four countries and two data centers. A nine-person network team supports it. Each store has one router (Cisco ISR 4331 on IOS XE) and two access switches. The project budget is USD 400,000. The business brief: "Roll out a new guest-WiFi VLAN and a new QoS policy to every store in one weekend, and prove afterwards that all 180 stores match."</p>
<p><b>Requirements:</b> repeatable change at 180 sites, a compliance report, rollback if a store breaks. <b>Constraints:</b> the team knows CLI, not programming; 22 older stores still have ISR G2 routers on IOS 15, which have no YANG support; change windows are only Sunday 01:00 to 05:00 local time.</p>

<h3>Analogy: a restaurant order system</h3>
<p>Typing CLI by hand is like shouting orders into the kitchen. It works for one table. With 180 tables you need a printed order slip with fixed fields (a <b>data model</b>), a waiter protocol to carry the slip (<b>transport</b>), and a kitchen that rejects a malformed slip instead of guessing (<b>validation</b>). That is model-driven programmability.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Model-driven programmability stack">
<rect x="10" y="40" width="130" height="70" rx="10" fill="#ddd6fe"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">Tool</text><text x="75" y="90" text-anchor="middle" class="svg-muted" font-size="12">Python / Ansible</text>
<rect x="170" y="40" width="140" height="70" rx="10" fill="#bae6fd"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">NETCONF 830</text><text x="240" y="102" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF 443</text>
<rect x="340" y="40" width="130" height="70" rx="10" fill="#fde68a"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="13">YANG model</text><text x="405" y="90" text-anchor="middle" class="svg-muted" font-size="12">the schema</text>
<rect x="500" y="40" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="13">IOS XE router</text><text x="565" y="90" text-anchor="middle" class="svg-muted" font-size="12">datastore</text>
<line x1="140" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="340" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="140" width="300" height="40" rx="10" fill="#fed7aa"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">gNMI over gRPC: telemetry and config (device to collector)</text>
<line x1="320" y1="140" x2="320" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Purple: tool. Blue: protocol. Yellow: model. Green: device. Orange: streaming.</text>
</svg><p class="cap">The model (YANG) defines what can be said. The protocol only carries it. The tool decides when and to whom.</p></div>

<h3>The pieces, defined</h3>
<dl class="terms">
<dt>YANG</dt><dd>A data-modelling language (RFC 7950) that describes configuration, state and operations as a tree. Models come from the IETF, OpenConfig and Cisco native models (for example the Cisco-IOS-XE-native module).</dd>
<dt>NETCONF</dt><dd>An XML-based protocol (RFC 6241) over SSH, TCP 830 by default. It supports a candidate datastore, transactions, validation and commit, so a change is applied whole or not at all.</dd>
<dt>RESTCONF</dt><dd>An HTTP-based protocol (RFC 8040) over HTTPS using GET, POST, PUT, PATCH and DELETE with JSON or XML. It exposes the same YANG data as familiar REST URLs but has no candidate datastore or multi-step commit.</dd>
<dt>gNMI</dt><dd>gRPC Network Management Interface. It runs over gRPC (HTTP/2, protobuf) and has four RPCs: Capabilities, Get, Set and Subscribe. It is built for streaming telemetry.</dd>
</dl>

<h3>Options for Kestrel</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th><th>Fit for Kestrel</th></tr>
<tr><td>CLI scripts over SSH</td><td>Works on every device incl. ISR G2</td><td>Screen-scraping, no validation, fragile</td><td>Fallback only</td></tr>
<tr><td>NETCONF with YANG</td><td>Transactional, validated, rollback-friendly</td><td>XML, learning curve</td><td>Best for the 158 IOS XE stores</td></tr>
<tr><td>RESTCONF</td><td>Easy for web developers, JSON</td><td>No candidate datastore, per-request apply</td><td>Good for reads and small edits</td></tr>
<tr><td>Ansible (orchestrator)</td><td>Readable YAML, no coding, huge module set</td><td>Needs inventory discipline</td><td>Team skills fit</td></tr>
</table>

<h3>Chosen design and justification</h3>
<p>Ansible is the orchestrator because the team can read YAML. For the 158 IOS XE stores, Ansible uses NETCONF so each store change is validated and committed atomically. The 22 ISR G2 stores use the CLI module as a documented exception, with a plan to replace them in the next refresh. gNMI is not used in stores (a small router does not need sub-second streams); it is reserved for data center telemetry, covered in chapter 4. <b>Fit rules:</b> Python for custom logic and one-off tools, Ansible for repeatable device configuration by operators, Terraform for declaring cloud and some controller resources as desired state.</p>

<pre class="code"><span class="c">! IOS XE: enable the programmability interfaces</span>
netconf-yang
restconf
ip h&#116;tp secure-server
username automation privilege 15 secret ExamplePass1</pre>
<pre class="out">Router# show netconf-yang sessions
Number of sessions : 1
session-id : 41
transport  : netconf-ssh
username   : automation
source-host: <span class="hl">198.51.100.20</span></pre>

<div class="warn"><p><b>Common mistake.</b> Enabling NETCONF or RESTCONF on every device but leaving the management ACL open. These interfaces can change configuration, so restrict them to the automation server address and use AAA.</p></div>
<div class="exam"><p><b>Exam trap.</b> NETCONF uses SSH and XML on port 830; RESTCONF uses HTTPS and JSON or XML. Only NETCONF offers a candidate datastore with commit. gNMI is the telemetry-oriented choice. YANG is the model, not a protocol.</p></div>

<div class="scn"><h4>Post-mortem: the weekend that half-worked</h4><p>Kestrel's first attempt used a CLI script through SSH. At 03:10 the script hit a store where the router prompt differed after a banner change. It sent the QoS lines into the wrong mode, 14 stores lost their WAN policy, and the team spent Sunday morning fixing them by hand. After redesign, NETCONF with a candidate datastore rejected invalid payloads before anything changed, and the second weekend finished 180 of 180 with a drift report from get-config.</p><p><b>Lesson:</b> pick model-driven interfaces where the platform supports them, because validation and atomic commit are design features, not conveniences.</p></div>

<div class="iv"><p class="q">"When would you choose NETCONF over RESTCONF?"</p><p>When I need transactional change: a candidate datastore, validation and a single commit across several edits. RESTCONF is better when a web team wants simple JSON and per-request changes. Both use the same YANG models, so the model choice does not lock me in. Mention gNMI for telemetry.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG defines the data; NETCONF, RESTCONF and gNMI carry it.</li>
<li>NETCONF: SSH, XML, port 830, candidate datastore and commit.</li>
<li>RESTCONF: HTTPS, JSON or XML, REST verbs, simple but per-request.</li>
<li>Match the tool to the team: Ansible for operators, Python for custom logic, Terraform for desired state.</li>
<li>Design an exception path for legacy devices and secure the management interfaces.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap enterprise network ki automation aur assurance layer ko design karna seekhoge, bilkul waise jaise ENSLD 300-420 exam aur real design reviews expect karte hain: programmability interfaces chunna, controller aur device-by-device tooling mein se decide karna, scale hone wala monitoring aur telemetry design karna, aisa management network banana jo outage mein bhi zinda rahe, aur sab kuch change control mein lapetna. Har chapter ek customer case se shuru hota hai, kyunki exam situation ke liye best design chunne ko kehta hai, definitions ratne ko nahi. <b>Prerequisites:</b> ENCOR-level knowledge (routing, switching, wireless basics), API kya hota hai, aur JSON kaisa dikhta hai. Programmer hona zaroori nahi.</p>

<h3>Customer case: Kestrel Retail Group</h3>
<p>Kestrel Retail chaar countries mein 180 stores aur do data centers chalata hai. Nau logon ki network team ise support karti hai. Har store mein ek router (Cisco ISR 4331, IOS XE) aur do access switches hain. Project budget USD 400,000 hai. Business brief: "Ek weekend mein har store par naya guest-WiFi VLAN aur naya QoS policy roll out karo, aur baad mein prove karo ki 180 ke 180 stores match karte hain."</p>
<p><b>Requirements:</b> 180 sites par repeatable change, compliance report, store toot jaye to rollback. <b>Constraints:</b> team CLI jaanti hai, programming nahi; 22 purane stores mein IOS 15 wale ISR G2 routers hain jinme YANG support nahi hai; change window sirf Sunday 01:00 se 05:00 local time hai.</p>

<h3>Analogy: restaurant ka order system</h3>
<p>Haath se CLI type karna kitchen mein chilla kar order dene jaisa hai. Ek table ke liye chalta hai. 180 tables ke liye aapko fixed fields wali printed order slip chahiye (<b>data model</b>), slip ko le jaane wala waiter protocol (<b>transport</b>), aur aisi kitchen jo galat slip ko guess karne ke bajaye reject kare (<b>validation</b>). Yahi model-driven programmability hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Model-driven programmability stack">
<rect x="10" y="40" width="130" height="70" rx="10" fill="#ddd6fe"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">Tool</text><text x="75" y="90" text-anchor="middle" class="svg-muted" font-size="12">Python / Ansible</text>
<rect x="170" y="40" width="140" height="70" rx="10" fill="#bae6fd"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">NETCONF 830</text><text x="240" y="102" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF 443</text>
<rect x="340" y="40" width="130" height="70" rx="10" fill="#fde68a"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="13">YANG model</text><text x="405" y="90" text-anchor="middle" class="svg-muted" font-size="12">schema</text>
<rect x="500" y="40" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="13">IOS XE router</text><text x="565" y="90" text-anchor="middle" class="svg-muted" font-size="12">datastore</text>
<line x1="140" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="340" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="140" width="300" height="40" rx="10" fill="#fed7aa"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">gNMI over gRPC: telemetry aur config</text>
<line x1="320" y1="140" x2="320" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Purple: tool. Blue: protocol. Yellow: model. Green: device. Orange: streaming.</text>
</svg><p class="cap">Model (YANG) tay karta hai ki kya kaha ja sakta hai. Protocol sirf le jaata hai. Tool decide karta hai kab aur kisko.</p></div>

<h3>Pieces ki definitions</h3>
<dl class="terms">
<dt>YANG</dt><dd>Ek data-modelling language (RFC 7950) jo configuration, state aur operations ko tree ki tarah describe karti hai. Models IETF, OpenConfig aur Cisco native models se aate hain (jaise Cisco-IOS-XE-native module).</dd>
<dt>NETCONF</dt><dd>XML-based protocol (RFC 6241) jo SSH par chalta hai, default TCP 830. Isme candidate datastore, transactions, validation aur commit hota hai, isliye change poora lagta hai ya bilkul nahi.</dd>
<dt>RESTCONF</dt><dd>HTTP-based protocol (RFC 8040) jo HTTPS par GET, POST, PUT, PATCH aur DELETE ke saath JSON ya XML use karta hai. Wahi YANG data familiar REST URLs ki tarah dikhata hai, par candidate datastore ya multi-step commit nahi hota.</dd>
<dt>gNMI</dt><dd>gRPC Network Management Interface. Yeh gRPC (HTTP/2, protobuf) par chalta hai aur iske chaar RPCs hain: Capabilities, Get, Set aur Subscribe. Streaming telemetry ke liye bana hai.</dd>
</dl>

<h3>Kestrel ke options</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th><th>Kestrel ke liye fit</th></tr>
<tr><td>SSH par CLI scripts</td><td>Har device par chalta hai, ISR G2 bhi</td><td>Screen-scraping, validation nahi, fragile</td><td>Sirf fallback</td></tr>
<tr><td>NETCONF with YANG</td><td>Transactional, validated, rollback-friendly</td><td>XML, learning curve</td><td>158 IOS XE stores ke liye best</td></tr>
<tr><td>RESTCONF</td><td>Web developers ke liye aasan, JSON</td><td>Candidate datastore nahi, har request par apply</td><td>Reads aur chhote edits ke liye accha</td></tr>
<tr><td>Ansible (orchestrator)</td><td>Readable YAML, coding nahi, bade module set</td><td>Inventory discipline chahiye</td><td>Team skills se match</td></tr>
</table>

<h3>Chosen design aur justification</h3>
<p>Ansible orchestrator hai kyunki team YAML padh sakti hai. 158 IOS XE stores ke liye Ansible NETCONF use karta hai taaki har store ka change validate ho aur atomically commit ho. 22 ISR G2 stores documented exception ke roop mein CLI module use karte hain, aur agle refresh mein unhe replace karne ka plan hai. gNMI stores mein use nahi hota (chhote router ko sub-second streams nahi chahiye); woh data center telemetry ke liye reserved hai, jo chapter 4 mein hai. <b>Fit rules:</b> custom logic aur one-off tools ke liye Python, operators ke repeatable device configuration ke liye Ansible, cloud aur kuch controller resources ko desired state mein declare karne ke liye Terraform.</p>

<pre class="code"><span class="c">! IOS XE: programmability interfaces enable karo</span>
netconf-yang
restconf
ip h&#116;tp secure-server
username automation privilege 15 secret ExamplePass1</pre>
<pre class="out">Router# show netconf-yang sessions
Number of sessions : 1
session-id : 41
transport  : netconf-ssh
username   : automation
source-host: <span class="hl">198.51.100.20</span></pre>

<div class="warn"><p><b>Common mistake.</b> Har device par NETCONF ya RESTCONF enable kar dena lekin management ACL khula chhod dena. Yeh interfaces configuration badal sakte hain, isliye unhe automation server address tak restrict karo aur AAA lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> NETCONF SSH aur XML par port 830 use karta hai; RESTCONF HTTPS aur JSON ya XML use karta hai. Sirf NETCONF mein commit wala candidate datastore hota hai. gNMI telemetry-oriented choice hai. YANG model hai, protocol nahi.</p></div>

<div class="scn"><h4>Post-mortem: weekend jo aadha hi chala</h4><p>Kestrel ki pehli koshish SSH par CLI script thi. Raat 03:10 par script ek aise store par pahunchi jahan banner change ke baad router prompt alag tha. Script ne QoS lines galat mode mein bhej deen, 14 stores ki WAN policy chali gayi, aur team ne Sunday subah haath se theek kiya. Redesign ke baad candidate datastore wale NETCONF ne invalid payload kuch badalne se pehle hi reject kiya, aur doosra weekend 180 mein se 180 par khatam hua, get-config se drift report ke saath.</p><p><b>Seekh:</b> jahan platform support kare wahan model-driven interfaces chuno, kyunki validation aur atomic commit design features hain, sirf convenience nahi.</p></div>

<div class="iv"><p class="q">"NETCONF aur RESTCONF mein se kab kya chunoge?"</p><p>Jab mujhe transactional change chahiye: candidate datastore, validation aur kai edits par ek commit. Jab web team ko simple JSON aur per-request changes chahiye tab RESTCONF better hai. Dono same YANG models use karte hain, isliye model choice mujhe lock nahi karta. Telemetry ke liye gNMI ka zikr zaroor karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG data define karta hai; NETCONF, RESTCONF aur gNMI use le jaate hain.</li>
<li>NETCONF: SSH, XML, port 830, candidate datastore aur commit.</li>
<li>RESTCONF: HTTPS, JSON ya XML, REST verbs, simple lekin per-request.</li>
<li>Tool ko team se match karo: operators ke liye Ansible, custom logic ke liye Python, desired state ke liye Terraform.</li>
<li>Legacy devices ke liye exception path design karo aur management interfaces secure karo.</li>
</ul></div>
`}};export{e as default};