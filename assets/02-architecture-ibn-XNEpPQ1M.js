var e={id:`architecture-ibn`,h:{en:`Controller-based architecture and intent-based networking`,hi:`Controller-based architecture aur intent-based networking`},body:{en:`
<p>Imagine running a chain of 50 restaurants where every chef writes their own recipes. Each kitchen works, but the food tastes different everywhere and nobody can prove what went wrong when a customer gets sick. A central kitchen office that writes the recipe once, sends it to every branch and inspects the result is the idea behind a <b>controller-based network</b>.</p>

<h3>Traditional versus controller-based</h3>
<p>In the <b>traditional</b> (box-by-box) model every router and switch is configured on its own, over SSH, one CLI session at a time. The behaviour of the whole network exists only as the sum of hundreds of separate running-configs, so small differences creep in (<b>configuration drift</b>), and troubleshooting means logging in to device after device.</p>
<p>A <b>controller-based</b> network adds a central brain that keeps an inventory of every managed device, turns what you want into device configuration, and continuously collects telemetry to tell you whether reality still matches what you wanted.</p>
<table class="cmp"><tr><th></th><th>Traditional</th><th>Controller-based</th></tr>
<tr><td>Configuration</td><td>Per device, manual CLI</td><td>Central templates and policies pushed to many devices</td></tr>
<tr><td>Consistency</td><td>Depends on the engineer</td><td>Compliance check against the golden config</td></tr>
<tr><td>Monitoring</td><td>Ping, SNMP polls, reading logs</td><td>Health scores, correlated issues, guided remediation</td></tr>
<tr><td>Scale</td><td>Slow and error-prone</td><td>Same workflow for 10 or 10 000 devices</td></tr></table>
<p>The devices still run their own <b>control plane</b> (OSPF, STP, ARP) and <b>data plane</b> (forwarding). Catalyst Center is the <b>management plane</b>: it configures and observes. In SD-Access it also drives the fabric's policy, but the fabric's LISP control plane and VXLAN data plane still live in the switches, as you saw in the SD-WAN and SD-Access module.</p>

<h3>Intent-based networking (IBN): a closed loop</h3>
<p><b>Intent</b> is what the business wants, written without device syntax: "guests may only reach the internet", "every switch syncs time to the site NTP source", "the payroll app gets priority". IBN is the loop that keeps the network matching that intent:</p>
<ol><li><b>Translate</b> the intent into policy and configuration (Design and Policy).</li>
<li><b>Activate</b> it on the infrastructure (Provision: templates, SWIM, fabric).</li>
<li><b>Assure</b> it by watching telemetry and comparing reality with intent (Assurance).</li>
<li><b>Correct</b> when reality drifts, by a human following suggested actions or by re-provisioning.</li></ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Intent-based networking loop">
<rect x="20" y="85" width="130" height="50" rx="10" fill="#fde68a"/><text x="85" y="108" text-anchor="middle" class="svg-ink" font-size="13">Business intent</text><text x="85" y="125" text-anchor="middle" class="svg-muted" font-size="12">what, not how</text>
<rect x="190" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="260" y="43" text-anchor="middle" class="svg-ink" font-size="13">Translate</text><text x="260" y="60" text-anchor="middle" class="svg-muted" font-size="12">Design, Policy</text>
<rect x="400" y="20" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="470" y="43" text-anchor="middle" class="svg-ink" font-size="13">Activate</text><text x="470" y="60" text-anchor="middle" class="svg-muted" font-size="12">Provision</text>
<rect x="400" y="150" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="470" y="173" text-anchor="middle" class="svg-ink" font-size="13">Assure</text><text x="470" y="190" text-anchor="middle" class="svg-muted" font-size="12">telemetry, health</text>
<rect x="190" y="150" width="140" height="50" rx="10" fill="#fed7aa"/><text x="260" y="173" text-anchor="middle" class="svg-ink" font-size="13">Correct</text><text x="260" y="190" text-anchor="middle" class="svg-muted" font-size="12">issues, actions</text>
<line x1="150" y1="100" x2="190" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="45" x2="400" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="70" x2="470" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="175" x2="330" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="150" x2="260" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">IBN never ends: assurance feeds corrections back into the next change.</p></div>

<h3>Northbound, southbound, east-west</h3>
<ul><li><b>Northbound API</b> faces "up", towards applications, scripts, ITSM tools and people. Catalyst Center's is the <b>Intent API</b>, a REST API over HTTPS with JSON bodies.</li>
<li><b>Southbound</b> interfaces face "down", towards devices: SSH/CLI, SNMP, <b>NETCONF</b> and RESTCONF with YANG models, streaming (model-driven) telemetry, syslog and NetFlow. The controller speaks these so you do not have to.</li>
<li><b>East-west</b> integrations connect the controller to peer systems: Cisco ISE, IP address management, other controllers, or the cloud AI service.</li></ul>

<h3>The appliance and the cluster</h3>
<p>Catalyst Center ships as a <b>physical appliance</b> in several sizes (more cores and memory = more devices and clients supported), and as a <b>virtual appliance</b> on supported hypervisors and public cloud. For high availability you build a <b>three-node cluster</b>; services are spread across the nodes and survive one node failing. A two-node cluster is not a supported HA design. For site-level disasters, a separate disaster recovery setup pairs two clusters. The appliance has separate interfaces for the enterprise network (device management), the cluster, out-of-band management and internet access (for software downloads and cloud services).</p>

<h3>ISE integration</h3>
<p>Catalyst Center is where you <b>author</b> identity-based policy; <b>Cisco ISE</b> is where it is <b>enforced</b> and where users are authenticated. You register ISE as an authentication and policy server in Catalyst Center; they trust each other with certificates, then use ISE's REST APIs and <b>pxGrid</b>. Scalable groups and contracts you create in Catalyst Center are written into ISE, which pushes group-based ACLs to the switches. In the other direction ISE shares identity context (user name, device type, group) so Assurance can show "Priya's laptop" instead of just a MAC address.</p>

<div class="eg"><p><b>Worked example.</b> Intent: "Staff in VLAN 20 must reach the intranet web app on 172.16.50.10, TCP 80." Translate: allow 10.20.20.0/24 to host 172.16.50.10 port 80. Activate: the ACL on R1 permits it. Assure: a TCP 80 Path Trace from PC2 completes. In Lab 2 the assure step fails because WAN-IN denies it, and correcting that is exactly the IBN loop in action.</p></div>

<div class="warn"><p><b>Common mistake.</b> Mixing up the directions: "Catalyst Center uses a northbound API to configure switches." No. Configuring switches is southbound (SSH, NETCONF). Northbound is what your script or ServiceNow uses to talk to Catalyst Center.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which plane does Catalyst Center belong to?" Management plane. "What is the HA cluster size?" Three nodes. And remember that REST APIs are <b>stateless</b>: every request carries its own authentication token.</p></div>

<div class="scn"><h4>The snowflake switches</h4><p>A retailer's audit found 37 different AAA configurations across 600 store switches, all "working", all slightly different. When the TACACS+ server IP changed, 90 stores lost remote login. The team moved to Catalyst Center: one AAA setting at Global in Design, one template, compliance run weekly. The next server change was a single variable edit, pushed overnight, and compliance showed 600 of 600 compliant by morning.</p><p><b>Lesson:</b> the controller's real job is removing drift, not just typing faster.</p></div>

<div class="iv"><p class="q">"Explain intent-based networking in your own words."</p><p>Define intent as the business outcome, not the CLI. Describe the closed loop: translate intent into policy, activate it on devices, assure it with telemetry, and correct drift. Give one concrete example (for example, a template plus compliance for NTP) and mention that Catalyst Center is Cisco's IBN controller for the campus, with ISE as the identity and enforcement partner.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller-based = central inventory, intent turned into config, continuous telemetry.</li>
<li>Catalyst Center is the management plane; devices keep their control and data planes.</li>
<li>IBN loop: translate, activate, assure, correct.</li>
<li>Northbound = Intent REST API; southbound = SSH, SNMP, NETCONF, telemetry.</li>
<li>HA = three-node cluster; ISE enforces the group-based policy Catalyst Center authors.</li>
</ul></div>
`,hi:`
<p>Socho aap 50 restaurants ki chain chalate ho jahan har chef apni recipes khud likhta hai. Har kitchen chalti hai, lekin khaana har jagah alag taste karta hai aur koi customer beemar pade to koi prove nahi kar sakta ki galti kahan hui. Ek central kitchen office jo recipe ek baar likhe, har branch ko bheje aur result inspect kare, yahi <b>controller-based network</b> ka idea hai.</p>

<h3>Traditional versus controller-based</h3>
<p><b>Traditional</b> (box-by-box) model mein har router aur switch alag se configure hota hai, SSH par, ek CLI session ek time par. Poore network ka behaviour sirf sainkdon alag running-configs ka jod hota hai, isliye chhote farak aa jaate hain (<b>configuration drift</b>), aur troubleshooting ka matlab hai ek ke baad ek device mein login karna.</p>
<p><b>Controller-based</b> network ek central dimaag jodta hai jo har managed device ki inventory rakhta hai, aap jo chahte ho use device configuration mein badalta hai, aur lagataar telemetry collect karke batata hai ki reality ab bhi aapki chahat se match karti hai ya nahi.</p>
<table class="cmp"><tr><th></th><th>Traditional</th><th>Controller-based</th></tr>
<tr><td>Configuration</td><td>Har device par, manual CLI</td><td>Central templates aur policies, kai devices par push</td></tr>
<tr><td>Consistency</td><td>Engineer par depend</td><td>Golden config ke against compliance check</td></tr>
<tr><td>Monitoring</td><td>Ping, SNMP polls, logs padhna</td><td>Health scores, correlated issues, guided remediation</td></tr>
<tr><td>Scale</td><td>Slow aur galtiyon wala</td><td>10 ho ya 10 000 devices, same workflow</td></tr></table>
<p>Devices ab bhi apna <b>control plane</b> (OSPF, STP, ARP) aur <b>data plane</b> (forwarding) khud chalate hain. Catalyst Center <b>management plane</b> hai: configure karta hai aur observe karta hai. SD-Access mein yeh fabric ki policy bhi drive karta hai, lekin fabric ka LISP control plane aur VXLAN data plane switches mein hi rehta hai, jaisa aapne SD-WAN aur SD-Access module mein dekha.</p>

<h3>Intent-based networking (IBN): ek closed loop</h3>
<p><b>Intent</b> woh hai jo business chahta hai, device syntax ke bina likha hua: "guests sirf internet tak jaa sakein", "har switch site NTP source se time sync kare", "payroll app ko priority mile". IBN woh loop hai jo network ko us intent se match rakhta hai:</p>
<ol><li>Intent ko policy aur configuration mein <b>translate</b> karo (Design aur Policy).</li>
<li>Use infrastructure par <b>activate</b> karo (Provision: templates, SWIM, fabric).</li>
<li>Telemetry dekh kar aur reality ko intent se compare karke <b>assure</b> karo (Assurance).</li>
<li>Reality drift ho to <b>correct</b> karo, suggested actions follow karke ya re-provision karke.</li></ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Intent-based networking loop">
<rect x="20" y="85" width="130" height="50" rx="10" fill="#fde68a"/><text x="85" y="108" text-anchor="middle" class="svg-ink" font-size="13">Business intent</text><text x="85" y="125" text-anchor="middle" class="svg-muted" font-size="12">kya, kaise nahi</text>
<rect x="190" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="260" y="43" text-anchor="middle" class="svg-ink" font-size="13">Translate</text><text x="260" y="60" text-anchor="middle" class="svg-muted" font-size="12">Design, Policy</text>
<rect x="400" y="20" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="470" y="43" text-anchor="middle" class="svg-ink" font-size="13">Activate</text><text x="470" y="60" text-anchor="middle" class="svg-muted" font-size="12">Provision</text>
<rect x="400" y="150" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="470" y="173" text-anchor="middle" class="svg-ink" font-size="13">Assure</text><text x="470" y="190" text-anchor="middle" class="svg-muted" font-size="12">telemetry, health</text>
<rect x="190" y="150" width="140" height="50" rx="10" fill="#fed7aa"/><text x="260" y="173" text-anchor="middle" class="svg-ink" font-size="13">Correct</text><text x="260" y="190" text-anchor="middle" class="svg-muted" font-size="12">issues, actions</text>
<line x1="150" y1="100" x2="190" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="45" x2="400" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="70" x2="470" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="175" x2="330" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="150" x2="260" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">IBN kabhi khatam nahi hota: assurance corrections ko agle change mein wapas bhejta hai.</p></div>

<h3>Northbound, southbound, east-west</h3>
<ul><li><b>Northbound API</b> "upar" ki taraf hai, applications, scripts, ITSM tools aur logon ki taraf. Catalyst Center ka northbound <b>Intent API</b> hai, HTTPS par JSON bodies wala REST API.</li>
<li><b>Southbound</b> interfaces "neeche" devices ki taraf hain: SSH/CLI, SNMP, YANG models ke saath <b>NETCONF</b> aur RESTCONF, streaming (model-driven) telemetry, syslog aur NetFlow. Controller yeh bolta hai taaki aapko na bolna pade.</li>
<li><b>East-west</b> integrations controller ko peer systems se jodte hain: Cisco ISE, IP address management, dusre controllers, ya cloud AI service.</li></ul>

<h3>Appliance aur cluster</h3>
<p>Catalyst Center kai sizes ke <b>physical appliance</b> mein aata hai (zyada cores aur memory = zyada devices aur clients supported), aur supported hypervisors aur public cloud par <b>virtual appliance</b> ke roop mein bhi. High availability ke liye aap <b>three-node cluster</b> banate ho; services nodes par bati hoti hain aur ek node fail hone par bhi chalti rehti hain. Two-node cluster supported HA design nahi hai. Site-level disaster ke liye alag disaster recovery setup do clusters ko pair karta hai. Appliance par enterprise network (device management), cluster, out-of-band management aur internet access (software downloads aur cloud services ke liye) ke alag interfaces hote hain.</p>

<h3>ISE integration</h3>
<p>Catalyst Center woh jagah hai jahan aap identity-based policy <b>likhte</b> ho; <b>Cisco ISE</b> woh jagah hai jahan woh <b>enforce</b> hoti hai aur users authenticate hote hain. Aap ISE ko Catalyst Center mein authentication aur policy server ke roop mein register karte ho; dono certificates se ek dusre par trust karte hain, phir ISE ke REST APIs aur <b>pxGrid</b> use karte hain. Catalyst Center mein banaye scalable groups aur contracts ISE mein likhe jaate hain, jo switches par group-based ACLs push karta hai. Doosri direction mein ISE identity context (user name, device type, group) share karta hai taaki Assurance sirf MAC address ki jagah "Priya ka laptop" dikha sake.</p>

<div class="eg"><p><b>Worked example.</b> Intent: "VLAN 20 ka staff 172.16.50.10 par intranet web app, TCP 80, tak pahunche." Translate: 10.20.20.0/24 ko host 172.16.50.10 port 80 tak allow karo. Activate: R1 par ACL ise permit kare. Assure: PC2 se TCP 80 Path Trace complete ho. Lab 2 mein assure step fail hota hai kyunki WAN-IN ise deny karta hai, aur use correct karna hi IBN loop ka asli action hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Directions mix karna: "Catalyst Center switches configure karne ke liye northbound API use karta hai." Nahi. Switches configure karna southbound hai (SSH, NETCONF). Northbound woh hai jo aapki script ya ServiceNow Catalyst Center se baat karne ke liye use karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Catalyst Center kaunse plane mein aata hai?" Management plane. "HA cluster ka size kya hai?" Teen nodes. Aur yaad rakho REST APIs <b>stateless</b> hain: har request apna authentication token khud le kar aati hai.</p></div>

<div class="scn"><h4>Snowflake switches</h4><p>Ek retailer ke audit mein 600 store switches par 37 alag AAA configurations mile, sab "chal rahe", sab thode alag. Jab TACACS+ server ka IP badla, 90 stores ka remote login chala gaya. Team Catalyst Center par shift hui: Design mein Global par ek AAA setting, ek template, har hafte compliance run. Agla server change sirf ek variable edit tha, raat mein push hua, aur subah tak compliance ne 600 mein se 600 compliant dikhaye.</p><p><b>Lesson:</b> controller ka asli kaam drift hatana hai, sirf tez typing nahi.</p></div>

<div class="iv"><p class="q">"Intent-based networking apne shabdon mein samjhao."</p><p>Intent ko business outcome ke roop mein define karo, CLI nahi. Closed loop describe karo: intent ko policy mein translate karo, devices par activate karo, telemetry se assure karo, aur drift correct karo. Ek concrete example do (jaise NTP ke liye template plus compliance) aur batao ki Catalyst Center campus ke liye Cisco ka IBN controller hai, aur ISE identity aur enforcement partner hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller-based = central inventory, intent config mein badalta hai, lagataar telemetry.</li>
<li>Catalyst Center management plane hai; devices apne control aur data planes rakhte hain.</li>
<li>IBN loop: translate, activate, assure, correct.</li>
<li>Northbound = Intent REST API; southbound = SSH, SNMP, NETCONF, telemetry.</li>
<li>HA = three-node cluster; ISE us group-based policy ko enforce karta hai jo Catalyst Center likhta hai.</li>
</ul></div>
`}};export{e as default};