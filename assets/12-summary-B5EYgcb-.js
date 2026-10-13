var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs a checklist before every flight, not because he forgot how to fly, but because the checklist catches the one item a tired brain skips. This chapter is your UCS checklist: what you must be able to do, the words you must know, and the facts the exam and interviewers ask most.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Pools and policies flow into templates, profiles and blades">
<rect x="15" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">Pools</text>
<rect x="15" y="90" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="117" text-anchor="middle" class="svg-ink" font-size="12">Policies</text>
<rect x="15" y="160" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="187" text-anchor="middle" class="svg-ink" font-size="12">vNIC/vHBA tmpl</text>
<rect x="200" y="90" width="140" height="44" rx="8" fill="#fde68a"/><text x="270" y="117" text-anchor="middle" class="svg-ink" font-size="12">Profile template</text>
<rect x="390" y="90" width="110" height="44" rx="8" fill="#fed7aa"/><text x="445" y="117" text-anchor="middle" class="svg-ink" font-size="12">Profiles</text>
<rect x="540" y="90" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="585" y="117" text-anchor="middle" class="svg-ink" font-size="12">Blades</text>
<line x1="145" y1="42" x2="200" y2="105" stroke="#64748b" stroke-width="2"/><line x1="145" y1="112" x2="200" y2="112" stroke="#64748b" stroke-width="2"/><line x1="145" y1="182" x2="200" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="112" x2="390" y2="112" stroke="#64748b" stroke-width="2"/><line x1="500" y1="112" x2="540" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="365" y="100" text-anchor="middle" class="svg-muted" font-size="12">create</text>
<text x="520" y="100" text-anchor="middle" class="svg-accent" font-size="12">associate</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">All of it runs in UCS Manager on the FIs (or in Intersight with IMM)</text>
</svg><p class="cap">Identities from pools, behaviour from policies, consistency from templates, hardware independence from association.</p></div>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Draw a UCS domain: FI-A and FI-B, L1/L2 cluster links, chassis with IOM A and IOM B, blades with VICs, LAN and SAN uplinks per fabric.</li>
<li>Explain primary/subordinate (management) versus active/active (data) and read <code>show cluster state</code>.</li>
<li>Explain end-host mode (no STP, pinning, no uplink-to-uplink forwarding) and FC NPV with NPIV on the MDS.</li>
<li>Assign FI port roles: server, Ethernet uplink, FC uplink, FC storage/appliance, monitor.</li>
<li>Create UUID, MAC, WWNN, WWPN and IP pools with 00:25:B5 and fabric encoding, sized with spares.</li>
<li>Create boot, BIOS, maintenance (user-ack), host firmware, QoS and network control policies.</li>
<li>Create vNIC and vHBA templates per fabric and a service profile template, and explain initial versus updating.</li>
<li>Create profiles from a template, associate them, read the FSM and fix F0327 reasons.</li>
<li>Build a SAN boot policy and troubleshoot FLOGI, zoning, target WWPN, masking, LUN ID and boot mode.</li>
<li>Move a profile to a spare blade and prove the identity did not change.</li>
<li>Plan an infrastructure and a server firmware upgrade, and schedule the four backup types.</li>
<li>Design ESXi networking on UCS: teaming, per-port-group fabric choice, VLANs in four places, jumbo frames.</li>
<li>Describe Intersight form factors, IMM objects and HyperFlex at concept level.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FI</dt><dd>Fabric interconnect; the pair of switches that connects and manages the domain.</dd>
<dt>IOM / IFM / FEX</dt><dd>Chassis modules that extend the FI into the chassis; no local switching.</dd>
<dt>VIC</dt><dd>Virtual interface card; presents vNICs and vHBAs to the OS.</dd>
<dt>Service profile</dt><dd>The logical server: identities, connectivity, policies; associated with one server.</dd>
<dt>Updating template</dt><dd>Template whose changes propagate to all bound profiles.</dd>
<dt>Maintenance policy</dt><dd>Decides when disruptive changes reboot the server: Immediate, User Ack, Timer Automatic.</dd>
<dt>End-host mode</dt><dd>FI Ethernet mode with no STP and vNIC pinning; FC equivalent is NPV.</dd>
<dt>FSM</dt><dd>Finite state machine; the step-by-step engine behind association, discovery and upgrades.</dd>
<dt>DN</dt><dd>Distinguished name; an object's path, such as org-root/ls-ESX-01.</dd>
<dt>IMM</dt><dd>Intersight Managed Mode; configuration from Intersight with domain, chassis and server profiles.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Identity</td><td>OUI 00:25:B5; WWNN per server, WWPN per vHBA; zoning and masking use WWPN</td></tr>
<tr><td>Cluster</td><td>L1/L2 carry no data; HA READY before maintenance; UCSM on the primary, reached by the cluster IP</td></tr>
<tr><td>IOM</td><td>IOM A to FI-A only; no local switching; chassis discovery policy sets link count</td></tr>
<tr><td>Templates</td><td>Initial = no propagation; updating = propagates; fabric failover only on vNICs</td></tr>
<tr><td>Faults</td><td>F0327 = profile configuration failure (insufficient-resources, compute-unavailable); F0283 = ENM source pinning failed</td></tr>
<tr><td>Firmware</td><td>UCSM → IOMs → subordinate FI → primary FI; A/B/C bundles; host firmware package for servers</td></tr>
<tr><td>Backups</td><td>Full state (binary), all, system, logical configuration (XML)</td></tr>
<tr><td>QoS</td><td>FC class CoS 3 no-drop; Best Effort and FC always on; jumbo needs class MTU 9216</td></tr>
<tr><td>ESXi</td><td>Port ID or LBT teaming, never IP hash; vmkping -d -s 8972 for MTU 9000</td></tr>
<tr><td>HyperFlex</td><td>Controller VM per node, RF2/RF3, standard cluster minimum 3 nodes</td></tr>
</table>

<div class="exam"><p><b>Exam traps in one line each.</b> "Which FI forwards data?" Both. "What changes when a profile moves?" Nothing visible outside: same MAC, WWPN, UUID. "Why did 40 hosts reboot?" Updating template plus Immediate maintenance policy. "Target not in name server?" Wrong target WWPN, zoning or VSAN. "REPORT LUNS empty?" Masking.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a data center role was asked to "design compute for 32 ESXi hosts on UCS". She drew two FIs with vPC uplinks to a leaf pair and FC uplinks to MDS-A and MDS-B, four chassis with two IOMs each, and then listed: MAC-A/MAC-B and WWPN-A/WWPN-B pools of 128 with 0A/0B encoding, UUID and WWNN pools, a BOOT-SAN policy with one target per fabric, BIOS-ESX, MAINT-USERACK, a host firmware package, updating vNIC/vHBA templates per fabric, and an updating ESXi service profile template with a SPARES pool. She finished with teaming (port ID, vMotion pinned to fabric A) and jumbo frames end to end. The panel stopped her after eight minutes: she had covered every topic they planned to ask.</p><p><b>Lesson:</b> if you can draw and justify this one design, you understand the module.</p></div>

<div class="iv"><p class="q">"Design the UCS compute layer for a new ESXi cluster."</p><p>Strong answer: start with the physical picture (two FIs, dual-fabric LAN and SAN uplinks, chassis with IOMs), then pools with 00:25:B5 and fabric encoding, then policies (SAN boot, BIOS, user-ack maintenance, host firmware), then per-fabric vNIC/vHBA templates and an updating service profile template with a server pool and spares. Close with operations: blade replacement by moving profiles, firmware order, backups, Intersight monitoring, and the ESXi teaming and MTU design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stateless computing: identity and configuration live in the service profile, not the hardware.</li>
<li>Pools, policies and templates make many identical servers; maintenance policies make changes safe.</li>
<li>Boot from SAN completes statelessness; troubleshoot it link by link.</li>
<li>Day 2: move profiles for blade failures, upgrade in the right order, back up off-box.</li>
<li>Design ESXi networking for two separate fabrics and verify VLANs and MTU end to end.</li>
</ul></div>
`,hi:`
<p>Pilot har flight se pehle checklist chalata hai, isliye nahi ki woh udna bhool gaya, balki isliye ki checklist woh ek item pakad leti hai jo thaka hua dimaag skip kar deta hai. Yeh chapter aapki UCS checklist hai: aapko kya kar paana chahiye, kaunse shabd aane chahiye, aur exam aur interviewers sabse zyada kaunse facts poochte hain.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Pools aur policies templates, profiles aur blades tak jaate hain">
<rect x="15" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">Pools</text>
<rect x="15" y="90" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="117" text-anchor="middle" class="svg-ink" font-size="12">Policies</text>
<rect x="15" y="160" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="80" y="187" text-anchor="middle" class="svg-ink" font-size="12">vNIC/vHBA tmpl</text>
<rect x="200" y="90" width="140" height="44" rx="8" fill="#fde68a"/><text x="270" y="117" text-anchor="middle" class="svg-ink" font-size="12">Profile template</text>
<rect x="390" y="90" width="110" height="44" rx="8" fill="#fed7aa"/><text x="445" y="117" text-anchor="middle" class="svg-ink" font-size="12">Profiles</text>
<rect x="540" y="90" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="585" y="117" text-anchor="middle" class="svg-ink" font-size="12">Blades</text>
<line x1="145" y1="42" x2="200" y2="105" stroke="#64748b" stroke-width="2"/><line x1="145" y1="112" x2="200" y2="112" stroke="#64748b" stroke-width="2"/><line x1="145" y1="182" x2="200" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="112" x2="390" y2="112" stroke="#64748b" stroke-width="2"/><line x1="500" y1="112" x2="540" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="365" y="100" text-anchor="middle" class="svg-muted" font-size="12">create</text>
<text x="520" y="100" text-anchor="middle" class="svg-accent" font-size="12">associate</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Yeh sab FIs par UCS Manager mein chalta hai (ya IMM ke saath Intersight mein)</text>
</svg><p class="cap">Identities pools se, behaviour policies se, consistency templates se, hardware independence association se.</p></div>

<h3>Checklist: aapko yeh kar paana chahiye...</h3>
<ul>
<li>UCS domain draw karna: FI-A aur FI-B, L1/L2 cluster links, IOM A aur IOM B wala chassis, VICs wale blades, har fabric ke LAN aur SAN uplinks.</li>
<li>Primary/subordinate (management) vs active/active (data) samjhana aur <code>show cluster state</code> padhna.</li>
<li>End-host mode (STP nahi, pinning, uplink-se-uplink forwarding nahi) aur MDS par NPIV ke saath FC NPV samjhana.</li>
<li>FI port roles assign karna: server, Ethernet uplink, FC uplink, FC storage/appliance, monitor.</li>
<li>00:25:B5 aur fabric encoding ke saath UUID, MAC, WWNN, WWPN aur IP pools banana, spares ke saath size karke.</li>
<li>Boot, BIOS, maintenance (user-ack), host firmware, QoS aur network control policies banana.</li>
<li>Har fabric ke vNIC aur vHBA templates aur ek service profile template banana, aur initial vs updating samjhana.</li>
<li>Template se profiles banana, unhe associate karna, FSM padhna aur F0327 reasons theek karna.</li>
<li>SAN boot policy banana aur FLOGI, zoning, target WWPN, masking, LUN ID aur boot mode troubleshoot karna.</li>
<li>Profile ko spare blade par le jaana aur saabit karna ki identity nahi badli.</li>
<li>Infrastructure aur server firmware upgrade plan karna, aur chaar backup types schedule karna.</li>
<li>UCS par ESXi networking design karna: teaming, har port group ka fabric choice, chaar jagah VLANs, jumbo frames.</li>
<li>Intersight form factors, IMM objects aur HyperFlex concept level par describe karna.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FI</dt><dd>Fabric interconnect; switches ka pair jo domain ko jodta aur manage karta hai.</dd>
<dt>IOM / IFM / FEX</dt><dd>Chassis modules jo FI ko chassis ke andar tak extend karte hain; local switching nahi.</dd>
<dt>VIC</dt><dd>Virtual interface card; OS ko vNICs aur vHBAs dikhata hai.</dd>
<dt>Service profile</dt><dd>Logical server: identities, connectivity, policies; ek server se associated.</dd>
<dt>Updating template</dt><dd>Template jiske changes saare bound profiles tak propagate hote hain.</dd>
<dt>Maintenance policy</dt><dd>Decide karti hai ki disruptive changes server ko kab reboot karein: Immediate, User Ack, Timer Automatic.</dd>
<dt>End-host mode</dt><dd>FI ka Ethernet mode jismein STP nahi aur vNIC pinning hoti hai; FC equivalent NPV hai.</dd>
<dt>FSM</dt><dd>Finite state machine; association, discovery aur upgrades ke peeche ka step-by-step engine.</dd>
<dt>DN</dt><dd>Distinguished name; object ka path, jaise org-root/ls-ESX-01.</dd>
<dt>IMM</dt><dd>Intersight Managed Mode; domain, chassis aur server profiles ke saath Intersight se configuration.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Identity</td><td>OUI 00:25:B5; WWNN har server ka, WWPN har vHBA ka; zoning aur masking WWPN use karte hain</td></tr>
<tr><td>Cluster</td><td>L1/L2 data nahi le jaate; maintenance se pehle HA READY; UCSM primary par, cluster IP se access</td></tr>
<tr><td>IOM</td><td>IOM A sirf FI-A tak; local switching nahi; chassis discovery policy link count set karti hai</td></tr>
<tr><td>Templates</td><td>Initial = propagation nahi; updating = propagate karta hai; fabric failover sirf vNICs par</td></tr>
<tr><td>Faults</td><td>F0327 = profile configuration failure (insufficient-resources, compute-unavailable); F0283 = ENM source pinning failed</td></tr>
<tr><td>Firmware</td><td>UCSM → IOMs → subordinate FI → primary FI; A/B/C bundles; servers ke liye host firmware package</td></tr>
<tr><td>Backups</td><td>Full state (binary), all, system, logical configuration (XML)</td></tr>
<tr><td>QoS</td><td>FC class CoS 3 no-drop; Best Effort aur FC hamesha on; jumbo ke liye class MTU 9216</td></tr>
<tr><td>ESXi</td><td>Port ID ya LBT teaming, IP hash kabhi nahi; MTU 9000 ke liye vmkping -d -s 8972</td></tr>
<tr><td>HyperFlex</td><td>Har node par controller VM, RF2/RF3, standard cluster minimum 3 nodes</td></tr>
</table>

<div class="exam"><p><b>Exam traps, har ek ek line mein.</b> "Kaunsa FI data forward karta hai?" Dono. "Profile move hone par kya badalta hai?" Bahar kuch visible nahi: same MAC, WWPN, UUID. "40 hosts reboot kyun hue?" Updating template plus Immediate maintenance policy. "Target name server mein nahi?" Galat target WWPN, zoning ya VSAN. "REPORT LUNS khaali?" Masking.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Data center role ki ek candidate se kaha gaya "UCS par 32 ESXi hosts ke liye compute design karo". Usne leaf pair tak vPC uplinks aur MDS-A aur MDS-B tak FC uplinks wale do FIs draw kiye, do-do IOMs wale chaar chassis, aur phir list kiya: 0A/0B encoding ke saath 128 ke MAC-A/MAC-B aur WWPN-A/WWPN-B pools, UUID aur WWNN pools, har fabric par ek target wali BOOT-SAN policy, BIOS-ESX, MAINT-USERACK, host firmware package, har fabric ke updating vNIC/vHBA templates, aur SPARES pool ke saath updating ESXi service profile template. Usne teaming (port ID, vMotion fabric A par pinned) aur end-to-end jumbo frames ke saath khatam kiya. Panel ne aath minute baad use rok diya: usne woh har topic cover kar liya tha jo woh poochna chahte the.</p><p><b>Seekh:</b> agar aap yeh ek design draw aur justify kar sakte ho, to aap module samajh gaye.</p></div>

<div class="iv"><p class="q">"Naye ESXi cluster ke liye UCS compute layer design karo."</p><p>Strong answer: physical picture se shuru karo (do FIs, dual-fabric LAN aur SAN uplinks, IOMs wale chassis), phir 00:25:B5 aur fabric encoding ke saath pools, phir policies (SAN boot, BIOS, user-ack maintenance, host firmware), phir har fabric ke vNIC/vHBA templates aur server pool aur spares ke saath updating service profile template. Operations ke saath khatam karo: profiles move karke blade replacement, firmware order, backups, Intersight monitoring, aur ESXi teaming aur MTU design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stateless computing: identity aur configuration service profile mein rehti hai, hardware mein nahi.</li>
<li>Pools, policies aur templates kai ek jaise servers banate hain; maintenance policies changes ko safe banati hain.</li>
<li>Boot from SAN statelessness poora karta hai; ise link by link troubleshoot karo.</li>
<li>Day 2: blade failures ke liye profiles move karo, sahi order mein upgrade karo, backup box ke bahar rakho.</li>
<li>ESXi networking do alag fabrics ke liye design karo aur VLANs aur MTU end to end verify karo.</li>
</ul></div>
`}};export{e as default};