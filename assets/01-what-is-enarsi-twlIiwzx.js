var e={id:`what-is-enarsi`,h:{en:`What ENARSI is, how it is weighted, and how this track works`,hi:`ENARSI kya hai, iska weight kaise bata hai, aur yeh track kaise chalta hai`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What the CCNP ENARSI 300-410 v1.1 exam is, where it sits in the CCNP Enterprise certification, and what its four domains weigh.</li>
<li>Why ENARSI is a <b>troubleshooting</b> exam first and a configuration exam second, and what that means for how you study.</li>
<li>A structured troubleshooting process and six methods, and when to pick each one.</li>
<li>Two checklists you will use in every later module: the packet-forwarding checklist and the routing-protocol checklist.</li>
<li>The IOS toolkit: filtered show commands, extended ping and traceroute, safe conditional debugging, logging, SNMP, syslog, NetFlow, IP SLA and Embedded Packet Capture.</li>
<li>How to read a routing table like an ENARSI engineer, the time-saving commands, and an exam strategy for troubleshooting tickets.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with CCNA-level IPv4 and IPv6 addressing and subnetting, basic static routing, and the idea of OSPF, EIGRP and BGP neighbours. If you have done the ENCOR "Start here" module you already know the life of a packet inside a router (RIB, FIB, adjacency table) and a first troubleshooting method. This module goes deeper into the method, because in ENARSI the method <b>is</b> the skill.</p>

<h3>The big picture: the network doctor</h3>
<p>Think of two doctors. The first one hears "my stomach hurts" and immediately prescribes a pill. Sometimes the pill works. The second one asks when it started, what you ate, checks your temperature, orders one blood test, and only then treats the cause. When the patient is complicated, only the second doctor succeeds reliably. ENARSI trains you to be the second doctor for routed networks. The patient is a network with OSPF, EIGRP, BGP, redistribution, VPNs and security features all interacting, and the symptom is usually a one-line complaint: "branch users cannot reach the payroll server".</p>

<h3>What ENARSI is</h3>
<p><b>ENARSI</b> stands for <b>Implementing Cisco Enterprise Advanced Routing and Services</b>. The exam code is <b>300-410</b>, the current blueprint is <b>version 1.1</b>, and the exam lasts <b>90 minutes</b>. It is a <b>concentration exam</b>: pass it together with the core exam ENCOR 350-401 and you earn <b>CCNP Enterprise</b>. Pass it on its own and you earn the <b>Cisco Certified Specialist - Enterprise Advanced Infrastructure Implementation</b> certification. ENCOR gives breadth across the enterprise; ENARSI gives depth in routing and the services around it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ENARSI domain weights">
<text x="20" y="24" class="svg-ink" font-size="14">ENARSI 300-410 v1.1 domain weights</text>
<rect x="220" y="44" width="350" height="30" rx="4" fill="#bae6fd"/><text x="20" y="64" class="svg-ink" font-size="13">1.0 Layer 3 Technologies</text><text x="580" y="64" class="svg-accent" font-size="13">35%</text>
<rect x="220" y="90" width="200" height="30" rx="4" fill="#ddd6fe"/><text x="20" y="110" class="svg-ink" font-size="13">2.0 VPN Technologies</text><text x="430" y="110" class="svg-accent" font-size="13">20%</text>
<rect x="220" y="136" width="200" height="30" rx="4" fill="#fed7aa"/><text x="20" y="156" class="svg-ink" font-size="13">3.0 Infrastructure Security</text><text x="430" y="156" class="svg-accent" font-size="13">20%</text>
<rect x="220" y="182" width="250" height="30" rx="4" fill="#bbf7d0"/><text x="20" y="202" class="svg-ink" font-size="13">4.0 Infrastructure Services</text><text x="480" y="202" class="svg-accent" font-size="13">25%</text>
</svg><p class="cap">Layer 3 is the biggest domain, but services and security together are 45% of the exam.</p></div>

<h3>The four domains</h3>
<table class="cmp"><tr><th>Domain</th><th>Weight</th><th>What it covers</th></tr>
<tr><td>1.0 Layer 3 Technologies</td><td>35%</td><td>Administrative distance, route maps, loop prevention (filtering, tagging, split horizon, route poisoning), redistribution, summarisation, PBR, VRF-lite, BFD, EIGRP, OSPFv2 and OSPFv3, internal and external BGP</td></tr>
<tr><td>2.0 VPN Technologies</td><td>20%</td><td>MPLS operations (LSR, LDP, label switching, LSP), MPLS Layer 3 VPN, DMVPN (GRE/mGRE, NHRP, IPsec, dynamic neighbours, spoke-to-spoke)</td></tr>
<tr><td>3.0 Infrastructure Security</td><td>20%</td><td>IOS AAA with TACACS+ and RADIUS, IPv4 and IPv6 ACLs, uRPF, control plane policing, IPv6 first-hop security (RA guard, DHCP guard, binding table, ND inspection, source guard)</td></tr>
<tr><td>4.0 Infrastructure Services</td><td>25%</td><td>Device management access, SNMP v2c and v3, logging and conditional debugs, IPv4 and IPv6 DHCP, IP SLA and tracking, NetFlow, Catalyst Center (formerly DNA Center) assurance</td></tr>
</table>

<h3>A troubleshooting-heavy exam</h3>
<p>Read the blueprint carefully and you will notice the verb that appears again and again: <b>troubleshoot</b>. Most items say "Troubleshoot redistribution", "Troubleshoot DMVPN", "Troubleshoot SNMP". Cisco is telling you that knowing how to type the configuration is not enough. You must look at output from a broken network and decide what is wrong. Expect multiple-choice questions built around <code>show</code> output, drag-and-drop items that order a process or match commands to results, and simulation-style items (simlets and testlets) where you run show commands on a topology and answer several questions about it. You cannot go back to a previous question on a Cisco exam, so each item must be closed before you move on.</p>

<div class="eg"><p><b>Worked example.</b> Candidates commonly report roughly 55 to 65 items in 90 minutes. Take 60 items: the weights suggest about 21 Layer 3 items (35%), 12 VPN, 12 security and 15 services items. At 90 minutes that is an average of 1.5 minutes each, but a simlet can easily take 8 to 10 minutes. That means the quick multiple-choice items must be answered in under a minute to bank time. Speed comes from a practised method, not from reading faster.</p></div>

<h3>How this track is organised</h3>
<p>This module is the "start here" module. It teaches the method and toolkit once, so every later module can simply say "run the routing-protocol checklist". Then the modules follow the blueprint: Layer 3 (redistribution and route maps, EIGRP, OSPF stub/NSSA/virtual links/authentication, BGP, PBR/VRF-lite/BFD), VPN (MPLS, DMVPN), security (AAA, ACLs, uRPF, CoPP, IPv6 first-hop security) and services (syslog, debug, SNMP, DHCP, IP SLA, NetFlow, OSPFv3 details). Each has configuration labs and ticket labs.</p>
<p>Throughout this module we use one small reference topology, shown in the diagram below, so every example uses the same names and addresses.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Reference topology">
<rect x="10" y="60" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="50" y="80" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="50" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="140" y="60" width="90" height="44" rx="8" fill="#bae6fd"/><text x="185" y="80" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="185" y="96" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.255.0.1</text>
<rect x="290" y="60" width="90" height="44" rx="8" fill="#fde68a"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="335" y="96" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.255.0.2</text>
<rect x="440" y="60" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="485" y="96" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.255.0.3</text>
<rect x="560" y="60" width="74" height="44" rx="8" fill="#e2e8f0"/><text x="597" y="80" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="597" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.3.30.10</text>
<line x1="90" y1="82" x2="140" y2="82" stroke="#64748b" stroke-width="2"/><line x1="230" y1="82" x2="290" y2="82" stroke="#64748b" stroke-width="2"/><line x1="380" y1="82" x2="440" y2="82" stroke="#64748b" stroke-width="2"/><line x1="530" y1="82" x2="560" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="260" y="50" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30</text><text x="260" y="130" text-anchor="middle" class="svg-accent" font-size="12">OSPF area 0</text>
<text x="410" y="50" text-anchor="middle" class="svg-muted" font-size="12">10.0.23.0/30</text><text x="410" y="130" text-anchor="middle" class="svg-accent" font-size="12">EIGRP AS 100</text>
<text x="335" y="155" text-anchor="middle" class="svg-ink" font-size="12">R2 redistributes OSPF and EIGRP both ways</text>
</svg><p class="cap">Reference topology: PC1 in 10.1.10.0/24 behind R1, SRV1 in 10.3.30.0/24 behind R3, R2 joins two routing domains.</p></div>

<div class="warn"><p><b>Common mistake.</b> Studying ENARSI only by typing configurations from a guide. Labs that always work teach you nothing about failure. For every lab you complete, break it on purpose (wrong area, missing <code>metric</code>, an ACL in the wrong direction) and read the symptoms.</p></div>

<div class="exam"><p><b>Exam trap.</b> The domain names matter for your study plan: DHCP, SNMP, NetFlow and IP SLA live in <b>Infrastructure Services (25%)</b>, not security. AAA, uRPF and CoPP are <b>Infrastructure Security (20%)</b>. Candidates who only study routing protocols leave almost half the marks on the table.</p></div>

<div class="scn"><h4>The engineer who knew every command</h4><p>A network engineer with years of configuration experience failed ENARSI on his first attempt. His score report was strongest in configuration-style items and weakest in the troubleshooting simlets: he ran out of time on the second simlet because he checked every device top to bottom instead of isolating the fault. On his second attempt he practised a fixed checklist (define the path, check the routing table on each hop, check neighbours, then filters) on broken labs every evening and passed with time to spare.</p><p><b>Lesson:</b> ENARSI rewards a repeatable method under time pressure far more than memorised configuration.</p></div>

<div class="iv"><p class="q">"How do you usually approach a routing problem you have never seen before?"</p><p>A strong candidate describes a method, not a command: define the problem and scope, identify the traffic path, check the routing table and forwarding decision hop by hop, then the control plane (neighbours, what is advertised and received, filters, redistribution), then data-plane policy (ACLs, NAT, PBR). Mention that you compare against a baseline and that you document the root cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI is 300-410 v1.1, 90 minutes, the CCNP Enterprise concentration exam in advanced routing and services.</li>
<li>Weights: Layer 3 35%, VPN 20%, Infrastructure Security 20%, Infrastructure Services 25%.</li>
<li>Most blueprint items use the verb "troubleshoot"; expect show-output questions, drag-and-drop and simlets.</li>
<li>This module teaches the method and toolkit once; later modules apply it to each technology.</li>
<li>The reference topology PC1-R1-R2-R3-SRV1 with OSPF and EIGRP is used in every example here.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>CCNP ENARSI 300-410 v1.1 exam kya hai, CCNP Enterprise certification mein iski jagah kya hai, aur iske chaar domains ka weight kitna hai.</li>
<li>ENARSI pehle ek <b>troubleshooting</b> exam kyun hai aur configuration exam baad mein, aur iska aapki padhai par kya matlab hai.</li>
<li>Ek structured troubleshooting process aur chhe methods, aur kab kaunsa chunna hai.</li>
<li>Do checklists jo aap har agle module mein use karoge: packet-forwarding checklist aur routing-protocol checklist.</li>
<li>IOS toolkit: filtered show commands, extended ping aur traceroute, safe conditional debugging, logging, SNMP, syslog, NetFlow, IP SLA aur Embedded Packet Capture.</li>
<li>Routing table ko ENARSI engineer ki tarah kaise padhein, time bachane wale commands, aur troubleshooting tickets ke liye exam strategy.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko CCNA-level IPv4 aur IPv6 addressing aur subnetting, basic static routing, aur OSPF, EIGRP aur BGP neighbours ka idea comfortable hona chahiye. Agar aapne ENCOR ka "Start here" module kiya hai to aap router ke andar packet ki zindagi (RIB, FIB, adjacency table) aur ek pehla troubleshooting method pehle se jaante ho. Yeh module method mein aur gehrai tak jaata hai, kyunki ENARSI mein method <b>hi</b> skill hai.</p>

<h3>Big picture: network ka doctor</h3>
<p>Do doctors socho. Pehla "mera pet dard kar raha hai" sunta hai aur turant goli likh deta hai. Kabhi kabhi goli kaam kar jaati hai. Doosra poochta hai ki kab shuru hua, kya khaya, temperature check karta hai, ek blood test karwata hai, aur tab jaakar cause ka ilaaj karta hai. Jab patient complicated ho, to sirf doosra doctor bharose se safal hota hai. ENARSI aapko routed networks ka doosra doctor banna sikhata hai. Patient ek network hai jismein OSPF, EIGRP, BGP, redistribution, VPNs aur security features sab ek doosre par asar daalte hain, aur symptom aam taur par ek line ki complaint hota hai: "branch users payroll server tak nahi pahunch pa rahe".</p>

<h3>ENARSI kya hai</h3>
<p><b>ENARSI</b> ka matlab hai <b>Implementing Cisco Enterprise Advanced Routing and Services</b>. Exam code <b>300-410</b> hai, current blueprint <b>version 1.1</b> hai, aur exam <b>90 minutes</b> ka hai. Yeh ek <b>concentration exam</b> hai: ise core exam ENCOR 350-401 ke saath pass karo aur aapko <b>CCNP Enterprise</b> milta hai. Akele pass karo to aapko <b>Cisco Certified Specialist - Enterprise Advanced Infrastructure Implementation</b> certification milta hai. ENCOR enterprise mein breadth deta hai; ENARSI routing aur uske aas paas ki services mein depth deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ENARSI domain weights">
<text x="20" y="24" class="svg-ink" font-size="14">ENARSI 300-410 v1.1 domain weights</text>
<rect x="220" y="44" width="350" height="30" rx="4" fill="#bae6fd"/><text x="20" y="64" class="svg-ink" font-size="13">1.0 Layer 3 Technologies</text><text x="580" y="64" class="svg-accent" font-size="13">35%</text>
<rect x="220" y="90" width="200" height="30" rx="4" fill="#ddd6fe"/><text x="20" y="110" class="svg-ink" font-size="13">2.0 VPN Technologies</text><text x="430" y="110" class="svg-accent" font-size="13">20%</text>
<rect x="220" y="136" width="200" height="30" rx="4" fill="#fed7aa"/><text x="20" y="156" class="svg-ink" font-size="13">3.0 Infrastructure Security</text><text x="430" y="156" class="svg-accent" font-size="13">20%</text>
<rect x="220" y="182" width="250" height="30" rx="4" fill="#bbf7d0"/><text x="20" y="202" class="svg-ink" font-size="13">4.0 Infrastructure Services</text><text x="480" y="202" class="svg-accent" font-size="13">25%</text>
</svg><p class="cap">Layer 3 sabse bada domain hai, par services aur security milkar exam ka 45% hain.</p></div>

<h3>Chaar domains</h3>
<table class="cmp"><tr><th>Domain</th><th>Weight</th><th>Kya cover karta hai</th></tr>
<tr><td>1.0 Layer 3 Technologies</td><td>35%</td><td>Administrative distance, route maps, loop prevention (filtering, tagging, split horizon, route poisoning), redistribution, summarisation, PBR, VRF-lite, BFD, EIGRP, OSPFv2 aur OSPFv3, internal aur external BGP</td></tr>
<tr><td>2.0 VPN Technologies</td><td>20%</td><td>MPLS operations (LSR, LDP, label switching, LSP), MPLS Layer 3 VPN, DMVPN (GRE/mGRE, NHRP, IPsec, dynamic neighbours, spoke-to-spoke)</td></tr>
<tr><td>3.0 Infrastructure Security</td><td>20%</td><td>TACACS+ aur RADIUS ke saath IOS AAA, IPv4 aur IPv6 ACLs, uRPF, control plane policing, IPv6 first-hop security (RA guard, DHCP guard, binding table, ND inspection, source guard)</td></tr>
<tr><td>4.0 Infrastructure Services</td><td>25%</td><td>Device management access, SNMP v2c aur v3, logging aur conditional debugs, IPv4 aur IPv6 DHCP, IP SLA aur tracking, NetFlow, Catalyst Center (pehle DNA Center) assurance</td></tr>
</table>

<h3>Troubleshooting-heavy exam</h3>
<p>Blueprint dhyan se padho to ek verb baar baar dikhega: <b>troubleshoot</b>. Zyada tar items kehte hain "Troubleshoot redistribution", "Troubleshoot DMVPN", "Troubleshoot SNMP". Cisco aapko bata raha hai ki configuration type karna aana kaafi nahi hai. Aapko toote hue network ka output dekhkar decide karna hai ki kya galat hai. <code>show</code> output par bane multiple-choice questions, process ko order karne ya commands ko results se match karne wale drag-and-drop items, aur simulation-style items (simlets aur testlets) expect karo jahan aap ek topology par show commands chalate ho aur uske baare mein kai sawaalon ke jawab dete ho. Cisco exam mein aap pichhle question par wapas nahi jaa sakte, isliye har item aage badhne se pehle band karna hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Candidates aam taur par 90 minutes mein lagbhag 55 se 65 items report karte hain. 60 items lo: weights ke hisaab se lagbhag 21 Layer 3 items (35%), 12 VPN, 12 security aur 15 services items. 90 minutes mein average 1.5 minute har item, par ek simlet aaram se 8 se 10 minute le sakta hai. Matlab jaldi wale multiple-choice items ek minute se kam mein karne honge taaki time bach sake. Speed practise kiye hue method se aati hai, tez padhne se nahi.</p></div>

<h3>Yeh track kaise organised hai</h3>
<p>Yeh module "start here" module hai. Yeh method aur toolkit ek baar sikhata hai, taaki har agla module seedha keh sake "routing-protocol checklist chalao". Phir modules blueprint follow karte hain: Layer 3 (redistribution aur route maps, EIGRP, OSPF stub/NSSA/virtual links/authentication, BGP, PBR/VRF-lite/BFD), VPN (MPLS, DMVPN), security (AAA, ACLs, uRPF, CoPP, IPv6 first-hop security) aur services (syslog, debug, SNMP, DHCP, IP SLA, NetFlow, OSPFv3 details). Har ek mein configuration labs aur ticket labs hain.</p>
<p>Is poore module mein hum ek chhoti reference topology use karte hain, jo neeche diagram mein hai, taaki har example mein same names aur addresses hon.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Reference topology">
<rect x="10" y="60" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="50" y="80" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="50" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="140" y="60" width="90" height="44" rx="8" fill="#bae6fd"/><text x="185" y="80" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="185" y="96" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.255.0.1</text>
<rect x="290" y="60" width="90" height="44" rx="8" fill="#fde68a"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="335" y="96" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.255.0.2</text>
<rect x="440" y="60" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="485" y="96" text-anchor="middle" class="svg-muted" font-size="12">Lo 10.255.0.3</text>
<rect x="560" y="60" width="74" height="44" rx="8" fill="#e2e8f0"/><text x="597" y="80" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="597" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.3.30.10</text>
<line x1="90" y1="82" x2="140" y2="82" stroke="#64748b" stroke-width="2"/><line x1="230" y1="82" x2="290" y2="82" stroke="#64748b" stroke-width="2"/><line x1="380" y1="82" x2="440" y2="82" stroke="#64748b" stroke-width="2"/><line x1="530" y1="82" x2="560" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="260" y="50" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30</text><text x="260" y="130" text-anchor="middle" class="svg-accent" font-size="12">OSPF area 0</text>
<text x="410" y="50" text-anchor="middle" class="svg-muted" font-size="12">10.0.23.0/30</text><text x="410" y="130" text-anchor="middle" class="svg-accent" font-size="12">EIGRP AS 100</text>
<text x="335" y="155" text-anchor="middle" class="svg-ink" font-size="12">R2 OSPF aur EIGRP ko dono taraf redistribute karta hai</text>
</svg><p class="cap">Reference topology: R1 ke peeche 10.1.10.0/24 mein PC1, R3 ke peeche 10.3.30.0/24 mein SRV1, R2 do routing domains ko jodta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> ENARSI sirf guide se configurations type karke padhna. Jo labs hamesha chal jaati hain woh failure ke baare mein kuch nahi sikhati. Har complete lab ko jaan boojhkar todo (galat area, missing <code>metric</code>, galat direction mein ACL) aur symptoms padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Study plan ke liye domain names matter karte hain: DHCP, SNMP, NetFlow aur IP SLA <b>Infrastructure Services (25%)</b> mein hain, security mein nahi. AAA, uRPF aur CoPP <b>Infrastructure Security (20%)</b> hain. Jo candidates sirf routing protocols padhte hain woh lagbhag aadhe marks table par chhod dete hain.</p></div>

<div class="scn"><h4>Woh engineer jise har command aata tha</h4><p>Saalon ke configuration experience wala ek network engineer ENARSI mein pehli attempt mein fail ho gaya. Uski score report configuration-style items mein sabse strong aur troubleshooting simlets mein sabse kamzor thi: doosre simlet mein uska time khatam ho gaya kyunki woh fault isolate karne ki jagah har device ko upar se neeche tak check kar raha tha. Doosri attempt se pehle usne har shaam toote labs par ek fixed checklist (path define karo, har hop par routing table check karo, neighbours check karo, phir filters) practise ki aur time bachakar pass ho gaya.</p><p><b>Seekh:</b> ENARSI time pressure mein repeatable method ko yaad ki hui configuration se kahin zyada reward karta hai.</p></div>

<div class="iv"><p class="q">"Aap aisi routing problem ko kaise approach karte ho jo aapne pehle kabhi nahi dekhi?"</p><p>Strong candidate method batata hai, command nahi: problem aur scope define karo, traffic path pehchano, har hop par routing table aur forwarding decision check karo, phir control plane (neighbours, kya advertise ho raha hai aur kya receive, filters, redistribution), phir data-plane policy (ACLs, NAT, PBR). Batao ki aap baseline se compare karte ho aur root cause document karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI 300-410 v1.1 hai, 90 minutes, advanced routing aur services mein CCNP Enterprise concentration exam.</li>
<li>Weights: Layer 3 35%, VPN 20%, Infrastructure Security 20%, Infrastructure Services 25%.</li>
<li>Zyada tar blueprint items "troubleshoot" verb use karte hain; show-output questions, drag-and-drop aur simlets expect karo.</li>
<li>Yeh module method aur toolkit ek baar sikhata hai; agle modules ise har technology par lagate hain.</li>
<li>Reference topology PC1-R1-R2-R3-SRV1, OSPF aur EIGRP ke saath, yahan har example mein use hoti hai.</li>
</ul></div>
`}};export{e as default};