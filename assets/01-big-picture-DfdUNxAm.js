var e={id:`big-picture`,h:{en:`The big picture: one switch, many networks`,hi:`Big picture: ek switch, kai networks`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain how a switch learns and forwards frames, split one physical switch into several <b>VLANs</b>, carry those VLANs between devices on an <b>802.1Q trunk</b>, route between them with a <b>router-on-a-stick</b> or <b>SVIs</b> on a layer 3 switch, and set the interface features the exam lists: native VLAN, voice VLAN, speed, duplex, link aggregation, spanning tree, MTU and jumbo frames. You will also learn the physical side the exam tests in objective 2.4: MDF and IDF rooms, racks and airflow, patch panels, power and the environment. Finally you will troubleshoot a real VLAN ticket step by step.</p>
<p><b>Prerequisites.</b> You should already know what a MAC address and an IPv4 address are, how a subnet mask and default gateway work, and the OSI layers (layer 2 = frames and MAC addresses, layer 3 = packets and IP addresses). Those were covered in the modules on the OSI model and on IPv4 addressing. If "192.168.10.0/24" and "default gateway 192.168.10.1" feel familiar, you are ready.</p>

<h3>Start with an analogy: an office building with separate floors</h3>
<p>Imagine a company that rents one building. On the ground floor is reception, where guests wait. Upstairs are the staff offices, the accounts team and the server room. Everyone shares the same lifts and staircases, but a guest with a visitor badge can only open the reception door. To reach the staff floor, they must go through the security desk, which checks who they are and where they are allowed to go.</p>
<p>A <b>switch with VLANs</b> works the same way. The switch is the building. Each <b>VLAN</b> (virtual LAN) is a floor: devices on the same floor talk freely, but devices on different floors cannot reach each other directly. The <b>trunk</b> is the lift shaft that carries people from every floor, each wearing a badge that says which floor they belong to (the 802.1Q tag). The <b>router</b> or layer 3 switch is the security desk: the only place where traffic moves from one floor to another, and therefore the natural place to apply rules.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module lab topology">
<rect x="250" y="14" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">R1 (router)</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0.10 · Gi0/0.20</text>
<line x1="320" y1="58" x2="320" y2="112" stroke="#64748b" stroke-width="3"/>
<text x="332" y="90" class="svg-accent" font-size="12">802.1Q trunk (VLAN 10, 20)</text>
<rect x="250" y="112" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="14">SW1 (switch)</text><text x="320" y="148" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 up to R1</text>
<line x1="280" y1="156" x2="150" y2="200" stroke="#64748b" stroke-width="2"/><line x1="360" y1="156" x2="490" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="200" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="150" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC1 · VLAN 10 STAFF</text><text x="150" y="238" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10 · Gi0/1</text>
<rect x="410" y="200" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="490" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC2 · VLAN 20 GUEST</text><text x="490" y="238" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.10 · Gi0/2</text>
</svg><p class="cap">The lab you will build in this module: two VLANs on SW1, one trunk to R1, and R1 routing between them.</p></div>

<h3>Why segment a network at all?</h3>
<p>A small office often starts "flat": every PC, printer, phone, camera and guest laptop plugged into the same switch, in the same subnet. That works on day one and hurts later:</p>
<ul>
<li><b>Security.</b> A guest laptop infected with malware can scan and attack the accounts PCs, because they share one layer 2 network.</li>
<li><b>Broadcast noise.</b> Every ARP request and DHCP discover is flooded to every port. With hundreds of devices, all of them process traffic that is not for them.</li>
<li><b>Troubleshooting.</b> When everything is in one subnet, you cannot tell cameras from phones by address, and one misbehaving device affects everyone.</li>
<li><b>Policy.</b> Voice needs priority, guests need internet only, cameras need to reach only the recorder. You cannot give different treatment to groups you cannot separate.</li>
</ul>
<p>VLANs fix this without buying one switch per group. One 48-port switch can host staff, guests, voice and cameras, each in its own broadcast domain and its own IP subnet.</p>

<div class="eg"><p><b>Worked example: the plan for this module.</b> The lab office has staff and guests on one flat switch. You will create <code>VLAN 10 STAFF</code> for subnet 192.168.10.0/24 and <code>VLAN 20 GUEST</code> for 192.168.20.0/24. PC1 (staff) on port Gi0/1 gets 192.168.10.10 with gateway 192.168.10.1. PC2 (guest) on Gi0/2 gets 192.168.20.10 with gateway 192.168.20.1. Port Gi0/0 becomes a trunk to R1, and R1 gets one sub-interface per VLAN holding the two gateway addresses. When PC1 pings PC2, the packet goes up the trunk tagged 10, R1 routes it, and it comes back down tagged 20.</p></div>

<h3>The road map of this module</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Exam objective</th></tr>
<tr><td>2</td><td>How a switch learns MAC addresses and forwards frames</td><td>2.2 foundation</td></tr>
<tr><td>3 to 5</td><td>VLANs, VLAN database, access and voice ports, 802.1Q trunks, native VLAN</td><td>2.2</td></tr>
<tr><td>6</td><td>Inter-VLAN routing: router-on-a-stick and SVIs</td><td>2.2</td></tr>
<tr><td>7 to 9</td><td>Speed, duplex, MTU and jumbo frames, spanning tree, link aggregation</td><td>2.2</td></tr>
<tr><td>10</td><td>Physical installation: MDF/IDF, racks, airflow, cabling, power, environment</td><td>2.4</td></tr>
<tr><td>11 to 12</td><td>Troubleshooting workflow, the guest ticket, summary and exam checklist</td><td>2.2 and 5.x</td></tr>
</table>
<p>The labs use an industry-standard, Cisco-style command line because that is what most employers run and what most simulators copy. The concepts are vendor-neutral: every enterprise switch has VLANs, trunks, spanning tree and link aggregation, only the command spelling changes. The next module, on routing, builds on the gateways you create here, so take the time to make this one solid.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking a VLAN is "a group of IP addresses". A VLAN is a layer 2 idea: a set of switch ports that share one broadcast domain. The IP subnet is a layer 3 idea that you <i>map</i> onto the VLAN. Good design keeps a strict one VLAN = one subnet mapping, but the switch itself never looks at the IP address when it decides which VLAN a frame belongs to.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network+ questions often say "users in two VLANs on the same switch cannot communicate" and offer "add a trunk" as an answer. A trunk carries VLANs between devices; it does not route. Communication between VLANs always needs a layer 3 device: a router, a layer 3 switch with SVIs, or a firewall.</p></div>

<div class="scn"><h4>The guest who printed payroll</h4><p>A 60-person design studio ran one flat network. A visitor connected to the conference-room wall port and, out of curiosity, browsed the network. The shared printer's web page listed recent jobs, including a payroll summary. Nothing was stolen, but the owner was alarmed. The engineer created VLAN 10 for staff, VLAN 20 for guests and VLAN 30 for printers, moved every wall port in public rooms to VLAN 20, and on the router allowed guests to reach only the internet. The same printer was now invisible to guests, and staff printing kept working through the router.</p><p><b>Lesson:</b> VLANs create the separate "floors"; the layer 3 device between them is where you decide who may cross.</p></div>

<div class="iv"><p class="q">"Why would you use VLANs instead of just buying separate switches?"</p><p>A strong answer: VLANs give separate broadcast domains and security zones on shared hardware, so one switch can serve staff, guests, voice and cameras. They are flexible (moving a user to another group is a one-line change, not a re-cable), they scale across many switches with trunks, and they map cleanly to IP subnets and firewall policy. Mention that traffic between VLANs must be routed, which is where you apply ACLs or firewall rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VLAN is a separate layer 2 broadcast domain on a shared switch; design it as one VLAN = one IP subnet.</li>
<li>Access ports carry one VLAN untagged; 802.1Q trunks carry many VLANs, tagged.</li>
<li>Devices in different VLANs need a router or layer 3 switch to communicate.</li>
<li>Segmentation improves security, reduces broadcast noise and makes policy possible.</li>
<li>This module also covers STP, link aggregation, speed/duplex, MTU and the physical installation topics of objective 2.4.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki switch frames ko kaise learn aur forward karta hai, ek physical switch ko kai <b>VLANs</b> mein kaise baante, un VLANs ko devices ke beech <b>802.1Q trunk</b> par kaise le jaaye, unke beech <b>router-on-a-stick</b> ya layer 3 switch ke <b>SVIs</b> se kaise route kare, aur exam mein list kiye gaye interface features kaise set kare: native VLAN, voice VLAN, speed, duplex, link aggregation, spanning tree, MTU aur jumbo frames. Aap physical side bhi seekhoge jo exam objective 2.4 mein test hoti hai: MDF aur IDF rooms, racks aur airflow, patch panels, power aur environment. Aakhir mein aap ek real VLAN ticket step by step troubleshoot karoge.</p>
<p><b>Prerequisites.</b> Aapko pehle se pata hona chahiye ki MAC address aur IPv4 address kya hote hain, subnet mask aur default gateway kaise kaam karte hain, aur OSI layers (layer 2 = frames aur MAC addresses, layer 3 = packets aur IP addresses). Yeh OSI model aur IPv4 addressing wale modules mein cover ho chuka hai. Agar "192.168.10.0/24" aur "default gateway 192.168.10.1" jaane-pehchaane lagte hain, to aap ready ho.</p>

<h3>Ek analogy se shuru karo: alag floors wali office building</h3>
<p>Socho ek company ne ek building kiraye par li hai. Ground floor par reception hai, jahan guests wait karte hain. Upar staff offices, accounts team aur server room hain. Sab log same lifts aur seedhiyan share karte hain, lekin visitor badge wala guest sirf reception ka darwaza khol sakta hai. Staff floor tak pahunchne ke liye use security desk se guzarna padta hai, jo check karta hai ki woh kaun hai aur kahan ja sakta hai.</p>
<p><b>VLANs wala switch</b> bilkul aise hi kaam karta hai. Switch building hai. Har <b>VLAN</b> (virtual LAN) ek floor hai: same floor ke devices aaram se baat karte hain, lekin alag floors ke devices seedhe ek doosre tak nahi pahunch sakte. <b>Trunk</b> lift shaft hai jo har floor ke logon ko le jaata hai, aur har ek ne badge pehna hai jo batata hai ki woh kis floor ka hai (802.1Q tag). <b>Router</b> ya layer 3 switch security desk hai: sirf yahi jagah hai jahan traffic ek floor se doosre floor par jaata hai, isliye rules lagane ki natural jagah bhi yahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module ka lab topology">
<rect x="250" y="14" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">R1 (router)</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0.10 · Gi0/0.20</text>
<line x1="320" y1="58" x2="320" y2="112" stroke="#64748b" stroke-width="3"/>
<text x="332" y="90" class="svg-accent" font-size="12">802.1Q trunk (VLAN 10, 20)</text>
<rect x="250" y="112" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="14">SW1 (switch)</text><text x="320" y="148" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 R1 ki taraf</text>
<line x1="280" y1="156" x2="150" y2="200" stroke="#64748b" stroke-width="2"/><line x1="360" y1="156" x2="490" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="200" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="150" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC1 · VLAN 10 STAFF</text><text x="150" y="238" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10 · Gi0/1</text>
<rect x="410" y="200" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="490" y="220" text-anchor="middle" class="svg-ink" font-size="13">PC2 · VLAN 20 GUEST</text><text x="490" y="238" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.10 · Gi0/2</text>
</svg><p class="cap">Is module mein aap yeh lab banaoge: SW1 par do VLANs, R1 tak ek trunk, aur R1 unke beech routing karta hai.</p></div>

<h3>Network ko segment karna hi kyun?</h3>
<p>Chhota office aksar "flat" shuru hota hai: har PC, printer, phone, camera aur guest laptop ek hi switch mein, ek hi subnet mein. Pehle din yeh chalta hai aur baad mein dard deta hai:</p>
<ul>
<li><b>Security.</b> Malware wala guest laptop accounts PCs ko scan aur attack kar sakta hai, kyunki sab ek hi layer 2 network share karte hain.</li>
<li><b>Broadcast noise.</b> Har ARP request aur DHCP discover har port par flood hota hai. Sainkdon devices ke saath, sab log aisa traffic process karte hain jo unke liye hai hi nahi.</li>
<li><b>Troubleshooting.</b> Jab sab ek subnet mein ho, to address dekh kar cameras aur phones mein farak nahi kar sakte, aur ek bigda hua device sabko affect karta hai.</li>
<li><b>Policy.</b> Voice ko priority chahiye, guests ko sirf internet, cameras ko sirf recorder tak. Jin groups ko aap alag hi nahi kar sakte, unhe alag treatment nahi de sakte.</li>
</ul>
<p>VLANs yeh sab theek karte hain bina har group ke liye alag switch khareede. Ek 48-port switch staff, guests, voice aur cameras ko host kar sakta hai, har ek apne broadcast domain aur apne IP subnet mein.</p>

<div class="eg"><p><b>Worked example: is module ka plan.</b> Lab office mein staff aur guests ek flat switch par hain. Aap subnet 192.168.10.0/24 ke liye <code>VLAN 10 STAFF</code> aur 192.168.20.0/24 ke liye <code>VLAN 20 GUEST</code> banaoge. PC1 (staff) port Gi0/1 par 192.168.10.10 lega, gateway 192.168.10.1. PC2 (guest) Gi0/2 par 192.168.20.10 lega, gateway 192.168.20.1. Port Gi0/0 R1 ki taraf trunk banega, aur R1 par har VLAN ke liye ek sub-interface hoga jismein dono gateway addresses honge. Jab PC1, PC2 ko ping karega, packet tag 10 ke saath trunk par upar jaayega, R1 use route karega, aur woh tag 20 ke saath wapas neeche aayega.</p></div>

<h3>Is module ka road map</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Exam objective</th></tr>
<tr><td>2</td><td>Switch MAC addresses kaise learn karta hai aur frames kaise forward karta hai</td><td>2.2 foundation</td></tr>
<tr><td>3 se 5</td><td>VLANs, VLAN database, access aur voice ports, 802.1Q trunks, native VLAN</td><td>2.2</td></tr>
<tr><td>6</td><td>Inter-VLAN routing: router-on-a-stick aur SVIs</td><td>2.2</td></tr>
<tr><td>7 se 9</td><td>Speed, duplex, MTU aur jumbo frames, spanning tree, link aggregation</td><td>2.2</td></tr>
<tr><td>10</td><td>Physical installation: MDF/IDF, racks, airflow, cabling, power, environment</td><td>2.4</td></tr>
<tr><td>11 se 12</td><td>Troubleshooting workflow, guest ticket, summary aur exam checklist</td><td>2.2 aur 5.x</td></tr>
</table>
<p>Labs industry-standard, Cisco-style command line use karte hain kyunki zyada tar employers yahi chalate hain aur zyada tar simulators isi ki copy karte hain. Concepts vendor-neutral hain: har enterprise switch mein VLANs, trunks, spanning tree aur link aggregation hote hain, sirf command ki spelling badalti hai. Agla module, routing wala, un gateways par banega jo aap yahan banaoge, isliye is module ko time de kar mazboot banao.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki VLAN "IP addresses ka group" hai. VLAN layer 2 ka idea hai: switch ports ka set jo ek broadcast domain share karte hain. IP subnet layer 3 ka idea hai jise aap VLAN par <i>map</i> karte ho. Achha design strict ek VLAN = ek subnet mapping rakhta hai, lekin switch khud frame ka VLAN decide karte waqt IP address kabhi nahi dekhta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network+ questions aksar kehte hain "same switch par do VLANs ke users baat nahi kar pa rahe" aur answer mein "trunk add karo" dete hain. Trunk devices ke beech VLANs le jaata hai; woh route nahi karta. VLANs ke beech communication ke liye hamesha layer 3 device chahiye: router, SVIs wala layer 3 switch, ya firewall.</p></div>

<div class="scn"><h4>Guest jisne payroll print dekh liya</h4><p>60 logon ka ek design studio ek flat network chalata tha. Ek visitor ne conference room ke wall port mein laptop lagaya aur curiosity mein network browse kiya. Shared printer ke web page par recent jobs ki list thi, jismein payroll summary bhi tha. Kuch chori nahi hua, lekin owner ghabra gaya. Engineer ne staff ke liye VLAN 10, guests ke liye VLAN 20 aur printers ke liye VLAN 30 banaya, public rooms ke har wall port ko VLAN 20 mein daala, aur router par guests ko sirf internet tak jaane diya. Wahi printer ab guests ko dikhta hi nahi tha, aur staff ki printing router ke through chalti rahi.</p><p><b>Seekh:</b> VLANs alag "floors" banate hain; unke beech ka layer 3 device woh jagah hai jahan aap decide karte ho ki kaun cross kar sakta hai.</p></div>

<div class="iv"><p class="q">"Alag switches khareedne ki jagah aap VLANs kyun use karoge?"</p><p>Strong answer: VLANs shared hardware par alag broadcast domains aur security zones dete hain, isliye ek switch staff, guests, voice aur cameras ko serve kar sakta hai. Yeh flexible hain (user ko doosre group mein daalna ek line ka change hai, re-cabling nahi), trunks ke through kai switches tak scale karte hain, aur IP subnets aur firewall policy se saaf map hote hain. Batao ki VLANs ke beech traffic route hona chahiye, aur wahi jagah hai jahan aap ACLs ya firewall rules lagate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN shared switch par alag layer 2 broadcast domain hai; design karo ek VLAN = ek IP subnet.</li>
<li>Access ports ek VLAN untagged le jaate hain; 802.1Q trunks kai VLANs tagged le jaate hain.</li>
<li>Alag VLANs ke devices ko baat karne ke liye router ya layer 3 switch chahiye.</li>
<li>Segmentation security badhata hai, broadcast noise kam karta hai aur policy possible banata hai.</li>
<li>Yeh module STP, link aggregation, speed/duplex, MTU aur objective 2.4 ke physical installation topics bhi cover karta hai.</li>
</ul></div>
`}};export{e as default};