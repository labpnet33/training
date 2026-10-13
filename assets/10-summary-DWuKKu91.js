var e={id:`summary`,h:{en:`Cisco data center portfolio map and the road ahead: summary and exam checklist`,hi:`Cisco data center portfolio map aur aage ka raasta: summary aur exam checklist`},body:{en:`
<p>You have now walked through the whole building: power and cooling, racks and cables, servers, hypervisors, storage, the network, operations and security. Before you open the network modules, this chapter gives you a map. First, which Cisco products live at each layer. Second, how the <b>350-601 DCCOR</b> exam is organised and which module of this track covers each part. Finally, a checklist, a glossary and the facts that are tested most often.</p>

<h3>The Cisco data center portfolio, layer by layer</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Cisco data center portfolio map">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Management and automation: Nexus Dashboard (NDFC, Insights, Orchestrator), Intersight, APIC</text>
<rect x="10" y="60" width="300" height="50" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">Network: Nexus 9000</text><text x="160" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX-OS mode or ACI mode</text>
<rect x="330" y="60" width="300" height="50" rx="8" fill="#ddd6fe"/><text x="480" y="82" text-anchor="middle" class="svg-ink" font-size="13">Policy fabric: Cisco ACI</text><text x="480" y="100" text-anchor="middle" class="svg-muted" font-size="12">Nexus 9000 + APIC cluster</text>
<rect x="10" y="120" width="300" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="142" text-anchor="middle" class="svg-ink" font-size="13">Compute: Cisco UCS</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">B, C, X-Series + fabric interconnects</text>
<rect x="330" y="120" width="300" height="50" rx="8" fill="#fed7aa"/><text x="480" y="142" text-anchor="middle" class="svg-ink" font-size="13">Storage network: MDS 9000</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">Fibre Channel, VSANs, zoning</text>
<rect x="10" y="180" width="620" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">Legacy you may still meet: Nexus 7000/7700, Nexus 5000 with Nexus 2000 FEX</text>
</svg><p class="cap">One brand family per layer, with management platforms across the top.</p></div>

<table class="cmp"><tr><th>Product</th><th>What it is</th><th>Where you study it</th></tr>
<tr><td><b>Nexus 9000 + NX-OS</b></td><td>The main data center switch family today, used as leaf and spine. Runs standalone NX-OS (you configure VXLAN EVPN, vPC and routing yourself) or ACI mode</td><td>Network modules</td></tr>
<tr><td><b>Nexus 7000/7700</b></td><td>Older modular core/aggregation chassis with features such as VDCs and OTV; being replaced by Nexus 9000 in new designs</td><td>Awareness only</td></tr>
<tr><td><b>MDS 9000</b></td><td>Fibre Channel SAN switches and directors: VSANs, zoning, FC up to 64G</td><td>Storage module</td></tr>
<tr><td><b>UCS</b></td><td>Cisco servers (B-Series blades, C-Series rack, X-Series modular) connected through a pair of fabric interconnects and managed with service profiles</td><td>Compute module</td></tr>
<tr><td><b>Intersight</b></td><td>Cloud-operated (SaaS, or on-premises appliance) management and automation for UCS and more</td><td>Compute module</td></tr>
<tr><td><b>ACI + APIC</b></td><td>Application Centric Infrastructure: a policy-driven VXLAN fabric of Nexus 9000 switches controlled by an APIC cluster (usually three controllers). Tenants, EPGs and contracts</td><td>ACI module</td></tr>
<tr><td><b>Nexus Dashboard / NDFC</b></td><td>Operations platform. NDFC (Nexus Dashboard Fabric Controller, formerly DCNM) builds and manages NX-OS fabrics; Insights gives analytics; Orchestrator manages multi-site</td><td>Automation module</td></tr>
</table>

<h3>How DCCOR maps to this track</h3>
<p>CCNP Data Center requires the core exam <b>350-601 DCCOR</b> plus one concentration exam of your choice. Passing DCCOR alone also earns a Specialist certification. The blueprint has five domains (weights as published for v1.1; always check the current blueprint before you book):</p>
<table class="cmp"><tr><th>DCCOR domain</th><th>Weight</th><th>Modules in this track</th></tr>
<tr><td>1.0 Network</td><td>25%</td><td>DC networking refresher; spine-leaf and NX-OS first steps; underlay; VXLAN; BGP EVPN; vPC; ACI</td></tr>
<tr><td>2.0 Compute</td><td>25%</td><td>Cisco UCS, service profiles and Intersight</td></tr>
<tr><td>3.0 Storage Network</td><td>20%</td><td>Fibre Channel, zoning, VSANs, FCoE, iSCSI and NFS</td></tr>
<tr><td>4.0 Automation</td><td>15%</td><td>NX-API, Ansible, POAP, telemetry, Nexus Dashboard</td></tr>
<tr><td>5.0 Security</td><td>15%</td><td>DC security (AAA, RBAC, CoPP) plus ACI contracts, building on chapter 9 here</td></tr>
</table>
<div class="eg"><p><b>Worked example: planning study time.</b> You have 100 hours before the exam. Split by weight: Network 25 h, Compute 25 h, Storage 20 h, Automation 15 h, Security 15 h. Then adjust for your background: a routing and switching engineer might move 10 hours from Network to Storage and Compute, which are usually newer to them.</p></div>

<h3>Checklist: you should now be able to explain</h3>
<ul>
<li>The layers of a data center and the "always two, truly independent" rule.</li>
<li>The power path (utility, ATS, generator, UPS, PDU, dual PSU), A/B feeds, N+1 vs 2N, and a rack power budget.</li>
<li>Hot/cold aisles and containment, CRAC vs CRAH, how to calculate PUE, Tier I to IV.</li>
<li>Rack units, ToR vs EoR, multimode vs single-mode, SFP28/QSFP28/QSFP-DD, DAC vs AOC, 100G to 4 × 25G breakout.</li>
<li>Server parts, BMC (CIMC/iLO/iDRAC), PXE boot, teaming vs LACP and why LACP across two switches needs vPC.</li>
<li>Type 1 vs type 2 hypervisors, vSS vs vDS, port groups and trunks, why vMotion needs Layer-2 mobility.</li>
<li>RAID capacity math, LUNs, block vs file vs object, DAS vs NAS vs SAN, why storage needs a lossless or reliable network.</li>
<li>Why three-tier with STP gave way to spine-leaf, oversubscription, border leaf, OOB management, overlays.</li>
<li>Incident vs problem vs change, MOPs with rollback, SNMP/syslog/telemetry.</li>
<li>VRFs and tenants, micro-segmentation, TACACS+ vs RADIUS, RPO vs RTO.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>A/B power</dt><dd>Two independent power paths to every device.</dd>
<dt>AOC</dt><dd>Active optical cable: fibre with fixed optics on both ends.</dd>
<dt>APIC</dt><dd>Controller cluster that manages a Cisco ACI fabric.</dd>
<dt>BMC</dt><dd>Out-of-band server controller (CIMC, iLO, iDRAC).</dd>
<dt>Border leaf</dt><dd>Leaf that connects the fabric to the outside.</dd>
<dt>CRAH / CRAC</dt><dd>Cooling unit using chilled water / using its own refrigerant.</dd>
<dt>DAC</dt><dd>Direct attach copper cable for short links.</dd>
<dt>DCI</dt><dd>Data center interconnect between sites.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: traffic spread over several equal routes.</dd>
<dt>EoR / ToR</dt><dd>End-of-row / top-of-rack switch placement.</dd>
<dt>Hypervisor</dt><dd>Software that runs virtual machines.</dd>
<dt>LUN</dt><dd>Block volume presented from storage to a host.</dd>
<dt>MOP</dt><dd>Method of procedure for a change, including rollback.</dd>
<dt>NAS / SAN</dt><dd>File-level shared storage / block-level storage network.</dd>
<dt>OOB</dt><dd>Out-of-band management network, separate from production.</dd>
<dt>Oversubscription</dt><dd>Ratio of downstream to upstream capacity on a leaf.</dd>
<dt>PDU</dt><dd>Power distribution unit.</dd>
<dt>PUE</dt><dd>Total facility power ÷ IT power.</dd>
<dt>PXE</dt><dd>Network boot using DHCP and TFTP.</dd>
<dt>RAID</dt><dd>Combining disks for protection and speed.</dd>
<dt>RPO / RTO</dt><dd>Acceptable data loss / acceptable downtime.</dd>
<dt>Spine-leaf</dt><dd>Two-layer fabric; every leaf connects to every spine.</dd>
<dt>UPS</dt><dd>Battery-backed supply that bridges power gaps.</dd>
<dt>vMotion</dt><dd>VMware live migration of a running VM.</dd>
<dt>VRF</dt><dd>Separate routing table inside a device.</dd>
<dt>VXLAN / VNI</dt><dd>Layer-2 overlay over UDP 4789 / its 24-bit segment ID.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>1U = 1.75 inches; racks are 19 inches wide.</li>
<li>PUE = total facility ÷ IT; Tier III = concurrently maintainable, Tier IV = fault tolerant.</li>
<li>QSFP28 = 4 × 25G = 100G; QSFP-DD = 400G; multimode is short reach, single-mode long reach.</li>
<li>RAID 5 = N − 1, RAID 6 = N − 2, RAID 10 = 50%.</li>
<li>Spine-leaf: every leaf to every spine, no spine-to-spine links, ECMP.</li>
<li>VXLAN: UDP 4789, 24-bit VNI (about 16 million); VLAN: 12-bit (4,094 usable).</li>
<li>SNMP 161/162, syslog 514, TACACS+ TCP 49, RADIUS UDP 1812/1813, iSCSI TCP 3260, NFS TCP 2049.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Jumping straight into VXLAN commands without understanding the facility, servers and storage around the fabric. Most real outages start at the edges: a PDU, an optic, a trunk, a teaming mode.</p></div>
<div class="exam"><p><b>Exam tip.</b> Nexus 9000 runs in NX-OS mode or ACI mode, not both at once. NDFC was formerly DCNM. UCS servers connect through fabric interconnects; MDS is for Fibre Channel.</p></div>

<div class="scn"><h4>The first-week tour</h4><p>A new engineer was asked, in her first week, to find out why a payroll VM was slow. Instead of guessing, she traced the layers: the VM ran on a UCS X-Series blade (checked in Intersight: healthy), which connected through fabric interconnects to a vPC pair of Nexus 9000 leaves (NDFC showed the fabric healthy), and its datastore came through MDS fabric A and B to an array. On the MDS she found fabric B's link to the array down since a cable move the day before, so every I/O used one path and the array's single port was saturated. Remote hands reseated the cable; latency returned to normal.</p><p><b>Lesson:</b> knowing which product owns which layer turns a vague "it is slow" into a five-minute path check.</p></div>

<div class="iv"><p class="q">"Walk me through the Cisco data center portfolio."</p><p>Strong answer: go layer by layer. Network: Nexus 9000 as leaf and spine, in NX-OS mode (VXLAN EVPN managed with NDFC) or ACI mode (with an APIC cluster). Storage: MDS 9000 for Fibre Channel with VSANs and zoning. Compute: UCS B, C and X-Series through fabric interconnects, managed by UCS Manager or Intersight. Operations: Nexus Dashboard for Insights, Orchestrator and NDFC. Mention that older Nexus 7000/5000/2000 designs still exist in brownfield sites.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nexus 9000 (NX-OS or ACI) for the network, MDS for Fibre Channel, UCS with Intersight for compute, Nexus Dashboard and APIC for management.</li>
<li>DCCOR domains: Network, Compute, Storage Network, Automation, Security; this track has a module for each.</li>
<li>Use the checklist: if you can explain every line, you are ready for the network modules.</li>
<li>Learn the glossary and the most-tested numbers; they appear in both exams and interviews.</li>
<li>Next stop: the data center networking refresher, then spine-leaf with NX-OS.</li>
</ul></div>
`,hi:`
<p>Ab aap poori building ghoom chuke ho: power aur cooling, racks aur cables, servers, hypervisors, storage, network, operations aur security. Network modules kholne se pehle, yeh chapter aapko ek map deta hai. Pehla, har layer par kaunse Cisco products rehte hain. Dusra, <b>350-601 DCCOR</b> exam kaise organised hai aur is track ka kaunsa module uska kaunsa hissa cover karta hai. Aakhir mein, ek checklist, ek glossary aur woh facts jo sabse zyada test hote hain.</p>

<h3>Cisco data center portfolio, layer by layer</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Cisco data center portfolio map">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Management aur automation: Nexus Dashboard (NDFC, Insights, Orchestrator), Intersight, APIC</text>
<rect x="10" y="60" width="300" height="50" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">Network: Nexus 9000</text><text x="160" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX-OS mode ya ACI mode</text>
<rect x="330" y="60" width="300" height="50" rx="8" fill="#ddd6fe"/><text x="480" y="82" text-anchor="middle" class="svg-ink" font-size="13">Policy fabric: Cisco ACI</text><text x="480" y="100" text-anchor="middle" class="svg-muted" font-size="12">Nexus 9000 + APIC cluster</text>
<rect x="10" y="120" width="300" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="142" text-anchor="middle" class="svg-ink" font-size="13">Compute: Cisco UCS</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">B, C, X-Series + fabric interconnects</text>
<rect x="330" y="120" width="300" height="50" rx="8" fill="#fed7aa"/><text x="480" y="142" text-anchor="middle" class="svg-ink" font-size="13">Storage network: MDS 9000</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">Fibre Channel, VSANs, zoning</text>
<rect x="10" y="180" width="620" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">Legacy jo abhi bhi mil sakta hai: Nexus 7000/7700, Nexus 2000 FEX ke saath Nexus 5000</text>
</svg><p class="cap">Har layer ke liye ek brand family, aur upar management platforms.</p></div>

<table class="cmp"><tr><th>Product</th><th>Kya hai</th><th>Kahan padhoge</th></tr>
<tr><td><b>Nexus 9000 + NX-OS</b></td><td>Aaj ki main data center switch family, leaf aur spine ki tarah use hoti hai. Standalone NX-OS chalati hai (VXLAN EVPN, vPC aur routing aap khud configure karte ho) ya ACI mode</td><td>Network modules</td></tr>
<tr><td><b>Nexus 7000/7700</b></td><td>Purane modular core/aggregation chassis, VDCs aur OTV jaise features ke saath; naye designs mein Nexus 9000 inki jagah le raha hai</td><td>Sirf awareness</td></tr>
<tr><td><b>MDS 9000</b></td><td>Fibre Channel SAN switches aur directors: VSANs, zoning, 64G tak FC</td><td>Storage module</td></tr>
<tr><td><b>UCS</b></td><td>Cisco servers (B-Series blades, C-Series rack, X-Series modular) jo ek pair fabric interconnects ke through jude hote hain aur service profiles se manage hote hain</td><td>Compute module</td></tr>
<tr><td><b>Intersight</b></td><td>UCS aur aur bhi cheezon ke liye cloud-operated (SaaS, ya on-premises appliance) management aur automation</td><td>Compute module</td></tr>
<tr><td><b>ACI + APIC</b></td><td>Application Centric Infrastructure: Nexus 9000 switches ka policy-driven VXLAN fabric jo APIC cluster (aam taur par teen controllers) control karta hai. Tenants, EPGs aur contracts</td><td>ACI module</td></tr>
<tr><td><b>Nexus Dashboard / NDFC</b></td><td>Operations platform. NDFC (Nexus Dashboard Fabric Controller, pehle DCNM) NX-OS fabrics banata aur manage karta hai; Insights analytics deta hai; Orchestrator multi-site manage karta hai</td><td>Automation module</td></tr>
</table>

<h3>DCCOR is track se kaise map hota hai</h3>
<p>CCNP Data Center ke liye core exam <b>350-601 DCCOR</b> plus apni pasand ka ek concentration exam chahiye. Sirf DCCOR pass karne se bhi ek Specialist certification milta hai. Blueprint ke paanch domains hain (weights v1.1 ke liye published; book karne se pehle hamesha current blueprint check karo):</p>
<table class="cmp"><tr><th>DCCOR domain</th><th>Weight</th><th>Is track ke modules</th></tr>
<tr><td>1.0 Network</td><td>25%</td><td>DC networking refresher; spine-leaf aur NX-OS first steps; underlay; VXLAN; BGP EVPN; vPC; ACI</td></tr>
<tr><td>2.0 Compute</td><td>25%</td><td>Cisco UCS, service profiles aur Intersight</td></tr>
<tr><td>3.0 Storage Network</td><td>20%</td><td>Fibre Channel, zoning, VSANs, FCoE, iSCSI aur NFS</td></tr>
<tr><td>4.0 Automation</td><td>15%</td><td>NX-API, Ansible, POAP, telemetry, Nexus Dashboard</td></tr>
<tr><td>5.0 Security</td><td>15%</td><td>DC security (AAA, RBAC, CoPP) plus ACI contracts, yahan ke chapter 9 par based</td></tr>
</table>
<div class="eg"><p><b>Worked example: study time plan karna.</b> Exam se pehle aapke paas 100 ghante hain. Weight ke hisaab se baanto: Network 25 h, Compute 25 h, Storage 20 h, Automation 15 h, Security 15 h. Phir apne background ke hisaab se adjust karo: routing aur switching engineer Network se 10 ghante nikaal kar Storage aur Compute mein daal sakta hai, jo aam taur par uske liye naye hote hain.</p></div>

<h3>Checklist: ab aap yeh samjha paane chahiye</h3>
<ul>
<li>Data center ki layers aur "hamesha do, sach mein independent" rule.</li>
<li>Power path (utility, ATS, generator, UPS, PDU, dual PSU), A/B feeds, N+1 vs 2N, aur rack power budget.</li>
<li>Hot/cold aisles aur containment, CRAC vs CRAH, PUE kaise calculate karein, Tier I se IV.</li>
<li>Rack units, ToR vs EoR, multimode vs single-mode, SFP28/QSFP28/QSFP-DD, DAC vs AOC, 100G se 4 × 25G breakout.</li>
<li>Server parts, BMC (CIMC/iLO/iDRAC), PXE boot, teaming vs LACP aur do switches ke across LACP ko vPC kyun chahiye.</li>
<li>Type 1 vs type 2 hypervisors, vSS vs vDS, port groups aur trunks, vMotion ko Layer-2 mobility kyun chahiye.</li>
<li>RAID capacity math, LUNs, block vs file vs object, DAS vs NAS vs SAN, storage ko lossless ya reliable network kyun chahiye.</li>
<li>STP wala three-tier spine-leaf ke liye kyun hata, oversubscription, border leaf, OOB management, overlays.</li>
<li>Incident vs problem vs change, rollback ke saath MOPs, SNMP/syslog/telemetry.</li>
<li>VRFs aur tenants, micro-segmentation, TACACS+ vs RADIUS, RPO vs RTO.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>A/B power</dt><dd>Har device tak do independent power paths.</dd>
<dt>AOC</dt><dd>Active optical cable: dono ends par fixed optics wala fibre.</dd>
<dt>APIC</dt><dd>Controller cluster jo Cisco ACI fabric manage karta hai.</dd>
<dt>BMC</dt><dd>Out-of-band server controller (CIMC, iLO, iDRAC).</dd>
<dt>Border leaf</dt><dd>Woh leaf jo fabric ko bahar se jodta hai.</dd>
<dt>CRAH / CRAC</dt><dd>Chilled water use karne wala / apna refrigerant use karne wala cooling unit.</dd>
<dt>DAC</dt><dd>Chhote links ke liye direct attach copper cable.</dd>
<dt>DCI</dt><dd>Sites ke beech data center interconnect.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: traffic kai barabar routes par baanta jaata hai.</dd>
<dt>EoR / ToR</dt><dd>End-of-row / top-of-rack switch placement.</dd>
<dt>Hypervisor</dt><dd>Virtual machines chalane wala software.</dd>
<dt>LUN</dt><dd>Storage se host ko diya gaya block volume.</dd>
<dt>MOP</dt><dd>Change ka method of procedure, rollback ke saath.</dd>
<dt>NAS / SAN</dt><dd>File-level shared storage / block-level storage network.</dd>
<dt>OOB</dt><dd>Out-of-band management network, production se alag.</dd>
<dt>Oversubscription</dt><dd>Leaf par downstream aur upstream capacity ka ratio.</dd>
<dt>PDU</dt><dd>Power distribution unit.</dd>
<dt>PUE</dt><dd>Total facility power ÷ IT power.</dd>
<dt>PXE</dt><dd>DHCP aur TFTP use karke network boot.</dd>
<dt>RAID</dt><dd>Protection aur speed ke liye disks ko jodna.</dd>
<dt>RPO / RTO</dt><dd>Acceptable data loss / acceptable downtime.</dd>
<dt>Spine-leaf</dt><dd>Do-layer fabric; har leaf har spine se juda.</dd>
<dt>UPS</dt><dd>Battery-backed supply jo power gaps ko bharta hai.</dd>
<dt>vMotion</dt><dd>Chalte VM ka VMware live migration.</dd>
<dt>VRF</dt><dd>Device ke andar alag routing table.</dd>
<dt>VXLAN / VNI</dt><dd>UDP 4789 par Layer-2 overlay / uska 24-bit segment ID.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>1U = 1.75 inch; racks 19 inch chaude hote hain.</li>
<li>PUE = total facility ÷ IT; Tier III = concurrently maintainable, Tier IV = fault tolerant.</li>
<li>QSFP28 = 4 × 25G = 100G; QSFP-DD = 400G; multimode short reach, single-mode long reach.</li>
<li>RAID 5 = N − 1, RAID 6 = N − 2, RAID 10 = 50%.</li>
<li>Spine-leaf: har leaf har spine se, spine-to-spine links nahi, ECMP.</li>
<li>VXLAN: UDP 4789, 24-bit VNI (lagbhag 1.6 crore); VLAN: 12-bit (4,094 usable).</li>
<li>SNMP 161/162, syslog 514, TACACS+ TCP 49, RADIUS UDP 1812/1813, iSCSI TCP 3260, NFS TCP 2049.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Fabric ke aas-paas ki facility, servers aur storage samjhe bina seedha VXLAN commands mein kood jaana. Zyada tar real outages edges se shuru hote hain: ek PDU, ek optic, ek trunk, ek teaming mode.</p></div>
<div class="exam"><p><b>Exam tip.</b> Nexus 9000 NX-OS mode ya ACI mode mein chalta hai, dono ek saath nahi. NDFC pehle DCNM tha. UCS servers fabric interconnects ke through judte hain; MDS Fibre Channel ke liye hai.</p></div>

<div class="scn"><h4>Pehle hafte ka tour</h4><p>Ek nayi engineer se uske pehle hafte mein poocha gaya ki payroll VM slow kyun hai. Guess karne ke bajaye usne layers trace ki: VM ek UCS X-Series blade par chal raha tha (Intersight mein check kiya: healthy), jo fabric interconnects ke through Nexus 9000 leaves ke vPC pair se juda tha (NDFC ne fabric healthy dikhaya), aur uska datastore MDS fabric A aur B ke through array se aata tha. MDS par usne paaya ki ek din pehle ke cable move ke baad se fabric B ka array tak ka link down tha, isliye har I/O ek hi path use kar raha tha aur array ka single port saturated tha. Remote hands ne cable reseat ki; latency normal ho gayi.</p><p><b>Seekh:</b> yeh jaanna ki kaunsa product kaunsi layer ka maalik hai, ek vague "slow hai" ko paanch minute ke path check mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Mujhe Cisco data center portfolio samjhao."</p><p>Strong answer: layer by layer chalo. Network: leaf aur spine ke roop mein Nexus 9000, NX-OS mode (NDFC se managed VXLAN EVPN) ya ACI mode (APIC cluster ke saath) mein. Storage: VSANs aur zoning ke saath Fibre Channel ke liye MDS 9000. Compute: fabric interconnects ke through UCS B, C aur X-Series, UCS Manager ya Intersight se managed. Operations: Insights, Orchestrator aur NDFC ke liye Nexus Dashboard. Batao ki purane Nexus 7000/5000/2000 designs brownfield sites mein abhi bhi milte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network ke liye Nexus 9000 (NX-OS ya ACI), Fibre Channel ke liye MDS, compute ke liye Intersight ke saath UCS, management ke liye Nexus Dashboard aur APIC.</li>
<li>DCCOR domains: Network, Compute, Storage Network, Automation, Security; is track mein har ek ke liye module hai.</li>
<li>Checklist use karo: agar aap har line samjha sakte ho, to aap network modules ke liye ready ho.</li>
<li>Glossary aur most-tested numbers yaad karo; yeh exams aur interviews dono mein aate hain.</li>
<li>Agla stop: data center networking refresher, phir NX-OS ke saath spine-leaf.</li>
</ul></div>
`}};export{e as default};