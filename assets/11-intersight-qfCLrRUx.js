var e={id:`intersight`,h:{en:`Intersight, IMM, HyperFlex and a troubleshooting workflow`,hi:`Intersight, IMM, HyperFlex aur ek troubleshooting workflow`},body:{en:`
<p>A family used to keep one paper diary per house. Then they moved to a shared calendar in the cloud: every house still has its own rooms and doors, but everyone sees one schedule from anywhere. UCS Manager is the paper diary of one UCS domain. <b>Cisco Intersight</b> is the shared calendar for all of them, and with <b>Intersight Managed Mode</b> it can also become the place where server configuration is written.</p>

<h3>What Intersight is</h3>
<p>Intersight is Cisco's management platform for compute and related infrastructure. It comes in three forms:</p>
<ul>
<li><b>SaaS</b>: hosted by Cisco; nothing to install.</li>
<li><b>Connected Virtual Appliance</b>: a VM in your data center that still talks to the Intersight cloud for updates and support.</li>
<li><b>Private Virtual Appliance</b>: fully air-gapped, for environments that cannot reach the internet.</li>
</ul>
<p>Every managed system (a UCS Manager domain, a standalone C-Series CIMC, FIs in IMM, HyperFlex clusters) contains a <b>Device Connector</b> that opens an outbound, encrypted connection to Intersight. You <b>claim</b> a target by entering its Device ID and Claim Code into your Intersight account. Licensing tiers (Essentials, Advantage) unlock features such as server profiles, HCL checks and advanced analytics.</p>

<h3>What you get even without changing how you manage</h3>
<ul>
<li><b>Global inventory and health</b> of every domain and server in one place.</li>
<li><b>HCL status</b>: does this server's OS, driver and firmware combination appear on the Hardware Compatibility List?</li>
<li><b>Advisories</b>: field notices and security advisories that apply to your exact hardware.</li>
<li><b>Proactive support</b>: Intersight can open TAC cases and collect tech-support bundles; proactive RMA for some failures.</li>
<li><b>APIs, Terraform and workflow automation</b> (Intersight Cloud Orchestrator) across all sites.</li>
</ul>

<h3>Intersight Managed Mode (IMM) versus UCS Manager Managed Mode</h3>
<table class="cmp"><tr><th></th><th>UCSM Managed Mode</th><th>Intersight Managed Mode</th></tr>
<tr><td>Where configuration lives</td><td>UCS Manager on the FIs</td><td>Intersight (policies pushed to the FIs)</td></tr>
<tr><td>Main objects</td><td>Service profiles, templates, pools, policies</td><td><b>Domain profile</b> (ports, VLANs, VSANs, system QoS), <b>chassis profile</b>, <b>server profiles</b> and <b>server profile templates</b>, pools, policies</td></tr>
<tr><td>Scope</td><td>One domain</td><td>Many domains and standalone servers, one policy set</td></tr>
<tr><td>Hardware</td><td>6200/6300/6400/6536 FIs, B- and C-Series</td><td>6400 and 6536 FIs, X-Series (its natural home), B-Series M5 and later, C-Series</td></tr>
</table>
<p>The concepts carry over directly: server profiles still draw identities from MAC, WWNN, WWPN, UUID and IP pools and still reference boot order, BIOS, LAN connectivity and SAN connectivity policies. A domain is either in UCSM mode or IMM mode, not both; moving from one to the other means re-initialising the FIs, and Cisco provides the <b>IMM Transition Tool</b> to convert existing UCSM policies.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Intersight managing several targets">
<rect x="220" y="12" width="200" height="50" rx="10" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">Intersight</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">SaaS or appliance</text>
<rect x="15" y="150" width="140" height="56" rx="8" fill="#fde68a"/><text x="85" y="174" text-anchor="middle" class="svg-ink" font-size="12">UCSM domain</text><text x="85" y="192" text-anchor="middle" class="svg-muted" font-size="12">monitor, HCL</text>
<rect x="170" y="150" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="240" y="174" text-anchor="middle" class="svg-ink" font-size="12">IMM domain</text><text x="240" y="192" text-anchor="middle" class="svg-muted" font-size="12">server profiles</text>
<rect x="325" y="150" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="395" y="174" text-anchor="middle" class="svg-ink" font-size="12">C-Series CIMC</text><text x="395" y="192" text-anchor="middle" class="svg-muted" font-size="12">standalone</text>
<rect x="480" y="150" width="140" height="56" rx="8" fill="#fed7aa"/><text x="550" y="174" text-anchor="middle" class="svg-ink" font-size="12">HyperFlex</text><text x="550" y="192" text-anchor="middle" class="svg-muted" font-size="12">HCI cluster</text>
<line x1="85" y1="150" x2="270" y2="62" stroke="#64748b" stroke-width="2"/><line x1="240" y1="150" x2="300" y2="62" stroke="#64748b" stroke-width="2"/><line x1="395" y1="150" x2="340" y2="62" stroke="#64748b" stroke-width="2"/><line x1="550" y1="150" x2="370" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">Device Connector: outbound, encrypted</text>
</svg><p class="cap">One console for many sites; configuration authority depends on the mode of each target.</p></div>

<h3>HyperFlex at concept level</h3>
<p><b>HyperFlex (HX)</b> is Cisco's hyperconverged infrastructure: compute and storage in the same UCS servers. Each node runs a hypervisor plus a <b>storage controller VM</b>; together they pool the nodes' local SSD/NVMe drives into one distributed datastore with inline deduplication and compression. Data is protected with a <b>replication factor</b> of 2 or 3 (two or three copies on different nodes). A standard cluster needs at least <b>3 converged nodes</b>; edge clusters for branch sites can be 2 to 4 nodes, and a 2-node edge cluster uses Intersight as its witness. Cisco has announced end-of-sale for HyperFlex, so you mostly meet it in existing installations and at concept level in the exam.</p>

<h3>Troubleshooting tools</h3>
<dl class="terms">
<dt>Faults</dt><dd>Severity (critical, major, minor, warning, info), a code, the affected DN and a description. Faults have a lifecycle: active, then <b>soaking</b> or <b>flapping</b> if unstable, then cleared and retained for a while.</dd>
<dt>FSM tab</dt><dd>For every long task (association, firmware, discovery): the current step, progress, retries and the remote error text when a step fails.</dd>
<dt>Events and audit log</dt><dd>What changed, when and by whom. Your first stop for "it worked yesterday".</dd>
<dt>SEL (System Event Log)</dt><dd>The server's own hardware log: DIMM errors, PSU and temperature events.</dd>
<dt>Tech-support</dt><dd>A bundle of logs for TAC. Admin ▸ Create and Download Tech Support in the GUI, or from the CLI: <code>connect local-mgmt</code> then <code>show tech-support ucsm detail</code>, <code>show tech-support chassis 1 all detail</code> or <code>show tech-support server 1/1</code>. Intersight can collect it remotely.</dd>
</dl>

<h3>A troubleshooting workflow that works</h3>
<ol>
<li><b>Scope.</b> One server, one chassis, one fabric, or everything? One VLAN or all? The answer points to the layer.</li>
<li><b>Faults.</b> Sort by severity, read the DN and the description. F0327, F0283 and server health faults explain most problems.</li>
<li><b>Recent changes.</b> Audit log and Pending Activities: was a template edited, is a reboot waiting?</li>
<li><b>FSM.</b> For association, discovery or firmware problems, read the failed step and its error.</li>
<li><b>Physical.</b> Equipment tab, SEL, IOM and FI port status, chassis discovery links.</li>
<li><b>Connectivity.</b> vNIC state and pinning, uplink VLANs, <b>show cluster state</b>; for SAN: FLOGI, name server, zoning, masking, <code>lunlist</code>.</li>
<li><b>OS view.</b> ESXi vmnic status, teaming, vmkping, multipath status.</li>
<li><b>Escalate</b> with a tech-support bundle and a clear timeline.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Clearing or acknowledging faults without fixing the cause. Starting in the OS when UCSM already shows a fault that explains everything. Assuming IMM and UCSM can manage the same FIs at the same time. Forgetting that Intersight needs outbound connectivity from the Device Connector (or an appliance).</p></div>
<div class="exam"><p><b>Exam tip.</b> Intersight: SaaS, Connected Virtual Appliance, Private Virtual Appliance. IMM uses domain, chassis and server profiles and supports 6400/6536 FIs and X-Series. HyperFlex: controller VM per node, RF2/RF3, minimum 3 nodes for a standard cluster.</p></div>

<div class="scn"><h4>The HCL warning that explained the purple screen</h4><p>Two ESXi hosts in a remote site crashed with a purple diagnostic screen after a VMware patch. The local team suspected the blades. The central team opened Intersight: both servers showed HCL status "Not Listed", because the patch had installed a newer VIC driver that was not validated with the adapter firmware in their host firmware package. Every other host in the fleet still ran the older driver. They rolled the driver back on the two hosts and scheduled a host firmware package upgrade that matched the new driver. Intersight's advisory view also showed a field notice for the same adapter, which went into the plan.</p><p><b>Lesson:</b> driver, firmware and OS must match the HCL together; Intersight turns that check from a spreadsheet exercise into a dashboard.</p></div>

<div class="iv"><p class="q">"What is the difference between UCS Manager and Intersight Managed Mode?"</p><p>Strong answer: UCSM is embedded on the FIs and manages one domain with service profiles. In IMM the FIs (6400/6536) are managed from Intersight, SaaS or appliance, using domain, chassis and server profiles and a single policy set across many domains; it is required for X-Series in most designs. Concepts like pools, boot, BIOS and LAN/SAN connectivity policies are the same. Mention that Intersight can also just monitor UCSM domains (inventory, HCL, advisories, TAC cases) without taking over configuration, and that moving to IMM re-initialises the FIs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intersight: SaaS, Connected or Private Virtual Appliance; targets are claimed through the Device Connector.</li>
<li>It adds global inventory, HCL checks, advisories, TAC integration and automation.</li>
<li>IMM moves configuration authority to Intersight: domain, chassis and server profiles; UCSM concepts map directly.</li>
<li>HyperFlex = HCI with a controller VM per node, RF2/RF3, minimum 3 nodes (standard).</li>
<li>Workflow: scope, faults, recent changes, FSM, physical, connectivity, OS, escalate with tech-support.</li>
</ul></div>
`,hi:`
<p>Ek family pehle har ghar ke liye ek paper diary rakhti thi. Phir woh cloud mein shared calendar par aa gayi: har ghar ke apne rooms aur darwaze ab bhi hain, lekin sab kahin se bhi ek hi schedule dekhte hain. UCS Manager ek UCS domain ki paper diary hai. <b>Cisco Intersight</b> un sab ka shared calendar hai, aur <b>Intersight Managed Mode</b> ke saath yeh woh jagah bhi ban sakta hai jahan server configuration likhi jaati hai.</p>

<h3>Intersight kya hai</h3>
<p>Intersight compute aur related infrastructure ke liye Cisco ka management platform hai. Yeh teen roop mein aata hai:</p>
<ul>
<li><b>SaaS</b>: Cisco host karta hai; kuch install nahi karna.</li>
<li><b>Connected Virtual Appliance</b>: aapke data center mein ek VM jo updates aur support ke liye ab bhi Intersight cloud se baat karta hai.</li>
<li><b>Private Virtual Appliance</b>: poori tarah air-gapped, un environments ke liye jo internet tak nahi pahunch sakte.</li>
</ul>
<p>Har managed system (UCS Manager domain, standalone C-Series CIMC, IMM mein FIs, HyperFlex clusters) mein ek <b>Device Connector</b> hota hai jo Intersight tak outbound, encrypted connection kholta hai. Aap target ko uska Device ID aur Claim Code apne Intersight account mein daal kar <b>claim</b> karte ho. Licensing tiers (Essentials, Advantage) server profiles, HCL checks aur advanced analytics jaise features unlock karte hain.</p>

<h3>Management ka tareeka badle bina bhi kya milta hai</h3>
<ul>
<li>Har domain aur server ki <b>global inventory aur health</b> ek jagah.</li>
<li><b>HCL status</b>: kya is server ka OS, driver aur firmware combination Hardware Compatibility List mein hai?</li>
<li><b>Advisories</b>: field notices aur security advisories jo aapke exact hardware par lagu hote hain.</li>
<li><b>Proactive support</b>: Intersight TAC cases khol sakta hai aur tech-support bundles collect kar sakta hai; kuch failures ke liye proactive RMA.</li>
<li>Saari sites ke across <b>APIs, Terraform aur workflow automation</b> (Intersight Cloud Orchestrator).</li>
</ul>

<h3>Intersight Managed Mode (IMM) vs UCS Manager Managed Mode</h3>
<table class="cmp"><tr><th></th><th>UCSM Managed Mode</th><th>Intersight Managed Mode</th></tr>
<tr><td>Configuration kahan rehti hai</td><td>FIs par UCS Manager mein</td><td>Intersight mein (policies FIs par push hoti hain)</td></tr>
<tr><td>Main objects</td><td>Service profiles, templates, pools, policies</td><td><b>Domain profile</b> (ports, VLANs, VSANs, system QoS), <b>chassis profile</b>, <b>server profiles</b> aur <b>server profile templates</b>, pools, policies</td></tr>
<tr><td>Scope</td><td>Ek domain</td><td>Kai domains aur standalone servers, ek policy set</td></tr>
<tr><td>Hardware</td><td>6200/6300/6400/6536 FIs, B- aur C-Series</td><td>6400 aur 6536 FIs, X-Series (iska natural ghar), B-Series M5 aur baad ke, C-Series</td></tr>
</table>
<p>Concepts seedhe carry over hote hain: server profiles ab bhi MAC, WWNN, WWPN, UUID aur IP pools se identities lete hain aur ab bhi boot order, BIOS, LAN connectivity aur SAN connectivity policies refer karte hain. Domain ya to UCSM mode mein hota hai ya IMM mode mein, dono mein nahi; ek se doosre mein jaane ka matlab FIs ko re-initialise karna hai, aur existing UCSM policies convert karne ke liye Cisco <b>IMM Transition Tool</b> deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Intersight kai targets manage karta hai">
<rect x="220" y="12" width="200" height="50" rx="10" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">Intersight</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">SaaS ya appliance</text>
<rect x="15" y="150" width="140" height="56" rx="8" fill="#fde68a"/><text x="85" y="174" text-anchor="middle" class="svg-ink" font-size="12">UCSM domain</text><text x="85" y="192" text-anchor="middle" class="svg-muted" font-size="12">monitor, HCL</text>
<rect x="170" y="150" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="240" y="174" text-anchor="middle" class="svg-ink" font-size="12">IMM domain</text><text x="240" y="192" text-anchor="middle" class="svg-muted" font-size="12">server profiles</text>
<rect x="325" y="150" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="395" y="174" text-anchor="middle" class="svg-ink" font-size="12">C-Series CIMC</text><text x="395" y="192" text-anchor="middle" class="svg-muted" font-size="12">standalone</text>
<rect x="480" y="150" width="140" height="56" rx="8" fill="#fed7aa"/><text x="550" y="174" text-anchor="middle" class="svg-ink" font-size="12">HyperFlex</text><text x="550" y="192" text-anchor="middle" class="svg-muted" font-size="12">HCI cluster</text>
<line x1="85" y1="150" x2="270" y2="62" stroke="#64748b" stroke-width="2"/><line x1="240" y1="150" x2="300" y2="62" stroke="#64748b" stroke-width="2"/><line x1="395" y1="150" x2="340" y2="62" stroke="#64748b" stroke-width="2"/><line x1="550" y1="150" x2="370" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">Device Connector: outbound, encrypted</text>
</svg><p class="cap">Kai sites ke liye ek console; configuration authority har target ke mode par depend karti hai.</p></div>

<h3>HyperFlex concept level par</h3>
<p><b>HyperFlex (HX)</b> Cisco ka hyperconverged infrastructure hai: compute aur storage same UCS servers mein. Har node ek hypervisor plus ek <b>storage controller VM</b> chalata hai; milkar yeh nodes ki local SSD/NVMe drives ko inline deduplication aur compression ke saath ek distributed datastore mein pool karte hain. Data <b>replication factor</b> 2 ya 3 se protected hota hai (alag nodes par do ya teen copies). Standard cluster ko kam se kam <b>3 converged nodes</b> chahiye; branch sites ke edge clusters 2 se 4 nodes ke ho sakte hain, aur 2-node edge cluster Intersight ko witness ki tarah use karta hai. Cisco ne HyperFlex ka end-of-sale announce kiya hai, isliye yeh aapko zyada tar existing installations mein aur exam mein concept level par milega.</p>

<h3>Troubleshooting tools</h3>
<dl class="terms">
<dt>Faults</dt><dd>Severity (critical, major, minor, warning, info), ek code, affected DN aur description. Faults ka lifecycle hota hai: active, phir unstable ho to <b>soaking</b> ya <b>flapping</b>, phir cleared aur kuch der retained.</dd>
<dt>FSM tab</dt><dd>Har lambe task (association, firmware, discovery) ke liye: current step, progress, retries aur step fail hone par remote error text.</dd>
<dt>Events aur audit log</dt><dd>Kya badla, kab aur kisne. "Kal tak chal raha tha" ke liye pehla stop.</dd>
<dt>SEL (System Event Log)</dt><dd>Server ka apna hardware log: DIMM errors, PSU aur temperature events.</dd>
<dt>Tech-support</dt><dd>TAC ke liye logs ka bundle. GUI mein Admin ▸ Create and Download Tech Support, ya CLI se: <code>connect local-mgmt</code> phir <code>show tech-support ucsm detail</code>, <code>show tech-support chassis 1 all detail</code> ya <code>show tech-support server 1/1</code>. Intersight ise remotely collect kar sakta hai.</dd>
</dl>

<h3>Ek troubleshooting workflow jo kaam karta hai</h3>
<ol>
<li><b>Scope.</b> Ek server, ek chassis, ek fabric, ya sab kuch? Ek VLAN ya saare? Jawab layer ki taraf ishara karta hai.</li>
<li><b>Faults.</b> Severity se sort karo, DN aur description padho. F0327, F0283 aur server health faults zyada tar problems samjha dete hain.</li>
<li><b>Recent changes.</b> Audit log aur Pending Activities: kya template edit hua, kya koi reboot wait kar raha hai?</li>
<li><b>FSM.</b> Association, discovery ya firmware problems ke liye fail hua step aur uska error padho.</li>
<li><b>Physical.</b> Equipment tab, SEL, IOM aur FI port status, chassis discovery links.</li>
<li><b>Connectivity.</b> vNIC state aur pinning, uplink VLANs, <b>show cluster state</b>; SAN ke liye: FLOGI, name server, zoning, masking, <code>lunlist</code>.</li>
<li><b>OS view.</b> ESXi vmnic status, teaming, vmkping, multipath status.</li>
<li>Tech-support bundle aur saaf timeline ke saath <b>escalate</b> karo.</li>
</ol>

<div class="warn"><p><b>Common galtiyan.</b> Cause theek kiye bina faults clear ya acknowledge kar dena. OS se shuru karna jab UCSM pehle se ek fault dikha raha ho jo sab samjha deta hai. Maan lena ki IMM aur UCSM same FIs ko ek saath manage kar sakte hain. Bhool jaana ki Intersight ko Device Connector se outbound connectivity chahiye (ya appliance).</p></div>
<div class="exam"><p><b>Exam tip.</b> Intersight: SaaS, Connected Virtual Appliance, Private Virtual Appliance. IMM domain, chassis aur server profiles use karta hai aur 6400/6536 FIs aur X-Series support karta hai. HyperFlex: har node par controller VM, RF2/RF3, standard cluster ke liye minimum 3 nodes.</p></div>

<div class="scn"><h4>HCL warning jisne purple screen samjhaayi</h4><p>Ek remote site ke do ESXi hosts VMware patch ke baad purple diagnostic screen ke saath crash hue. Local team ko blades par shak tha. Central team ne Intersight khola: dono servers ka HCL status "Not Listed" tha, kyunki patch ne ek naya VIC driver install kiya tha jo unke host firmware package ke adapter firmware ke saath validated nahi tha. Fleet ke baaki har host par purana driver chal raha tha. Unhone do hosts par driver roll back kiya aur naye driver se match karne wala host firmware package upgrade schedule kiya. Intersight ke advisory view ne usi adapter ka ek field notice bhi dikhaya, jo plan mein shaamil hua.</p><p><b>Seekh:</b> driver, firmware aur OS teeno ko saath mein HCL se match hona chahiye; Intersight us check ko spreadsheet exercise se dashboard bana deta hai.</p></div>

<div class="iv"><p class="q">"UCS Manager aur Intersight Managed Mode mein kya farak hai?"</p><p>Strong answer: UCSM FIs par embedded hai aur service profiles ke saath ek domain manage karta hai. IMM mein FIs (6400/6536) Intersight se manage hote hain, SaaS ya appliance, domain, chassis aur server profiles aur kai domains ke across ek policy set ke saath; zyada tar designs mein X-Series ke liye yeh zaroori hai. Pools, boot, BIOS aur LAN/SAN connectivity policies jaise concepts same hain. Mention karo ki Intersight UCSM domains ko sirf monitor bhi kar sakta hai (inventory, HCL, advisories, TAC cases) bina configuration liye, aur yeh ki IMM par jaane se FIs re-initialise hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intersight: SaaS, Connected ya Private Virtual Appliance; targets Device Connector se claim hote hain.</li>
<li>Yeh global inventory, HCL checks, advisories, TAC integration aur automation jodta hai.</li>
<li>IMM configuration authority Intersight ko de deta hai: domain, chassis aur server profiles; UCSM concepts seedhe map hote hain.</li>
<li>HyperFlex = HCI, har node par controller VM, RF2/RF3, minimum 3 nodes (standard).</li>
<li>Workflow: scope, faults, recent changes, FSM, physical, connectivity, OS, tech-support ke saath escalate.</li>
</ul></div>
`}};export{e as default};