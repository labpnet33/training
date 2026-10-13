var e={id:`big-picture`,h:{en:`The big picture: why one switch becomes many`,hi:`Big picture: ek switch kai switches kaise banta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end you will be able to explain how a switch learns and floods, why a flat network hurts, and how VLANs split one switch into many separate LANs. You will create and name VLANs, build access ports for PCs and IP phones, carry many VLANs between switches on an 802.1Q trunk, control exactly which VLANs cross that trunk, set the native VLAN safely, lock down DTP, decide what to do with VTP, and troubleshoot a real NOC ticket where one missing keyword took an office offline. These are core CCNA 200-301 topics in the Network Access domain, and they come up in almost every network engineer interview.</p>

<h3>Prerequisites</h3>
<ul>
<li>You can move around the Cisco IOS CLI: user EXEC, privileged EXEC, global and interface configuration modes (module <b>ccna-ios</b>).</li>
<li>You know what a MAC address is and what an Ethernet frame looks like (modules <b>ccna-models</b> and <b>ccna-interfaces</b>).</li>
<li>You can read an IPv4 address and mask and tell whether two hosts are in the same subnet (module <b>ccna-ipv4</b>).</li>
</ul>
<p>No switching experience beyond that is needed. Chapter 2 recaps exactly how a switch forwards frames, because everything in this module builds on it.</p>

<h3>An analogy: from one open hall to an office building</h3>
<p>Imagine a company where all 300 staff sit in one huge open hall. When anyone needs something, they shout. Everybody hears every shout, whether it is meant for them or not. Finance hears Sales, Sales hears HR, and a visitor standing at the door hears everything. As the company grows, the noise grows until people cannot work.</p>
<p>Now move the company into an office building with separate floors. Each floor has its own public-address speaker. An announcement on the Finance floor is heard only by Finance. People on different floors can still reach each other, but only by walking through reception (a router). And the building has one staircase shared by all floors: everyone uses it, but each person wears a badge with their floor number so they come out on the right floor at the other end.</p>
<p>In networking terms: the open hall is a <b>flat Layer 2 network</b>, a shout is a <b>broadcast</b>, each floor is a <b>VLAN</b>, the speaker range of a floor is a <b>broadcast domain</b>, reception is a <b>router or Layer 3 switch</b>, the shared staircase is a <b>trunk</b> and the badge is the <b>802.1Q tag</b>.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two switches with VLAN 10 and VLAN 20 joined by an 802.1Q trunk, and a router between VLANs">
<rect x="250" y="12" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Router / L3 switch</text>
<rect x="90" y="100" width="130" height="44" rx="8" fill="#bae6fd"/><text x="155" y="127" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="420" y="100" width="130" height="44" rx="8" fill="#bae6fd"/><text x="485" y="127" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<line x1="220" y1="122" x2="420" y2="122" stroke="#64748b" stroke-width="5"/>
<text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="12">802.1Q trunk: VLAN 10 + 20</text>
<line x1="200" y1="100" x2="280" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="210" y="72" class="svg-muted" font-size="12">routing between VLANs</text>
<rect x="30" y="200" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 10</text>
<rect x="160" y="200" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="210" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 20</text>
<rect x="380" y="200" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="430" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 10</text>
<rect x="510" y="200" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 20</text>
<line x1="130" y1="144" x2="80" y2="200" stroke="#64748b" stroke-width="2"/><line x1="170" y1="144" x2="210" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="144" x2="430" y2="200" stroke="#64748b" stroke-width="2"/><line x1="505" y1="144" x2="560" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">access ports: untagged, one VLAN each</text>
</svg><p class="cap">The whole module in one picture: access ports, VLANs, a tagged trunk between switches, and a router to move traffic between VLANs.</p></div>

<h3>The words you will meet</h3>
<dl class="terms">
<dt>Broadcast domain</dt><dd>The set of devices that receive a broadcast frame sent by any one of them.</dd>
<dt>VLAN (Virtual LAN)</dt><dd>A broadcast domain created by configuration inside one or more switches, identified by a number from 1 to 4094.</dd>
<dt>Access port</dt><dd>A switch port that belongs to one data VLAN (plus optionally one voice VLAN). Frames on it are untagged.</dd>
<dt>Trunk</dt><dd>A link that carries many VLANs at once, marking each frame with a VLAN tag.</dd>
<dt>802.1Q</dt><dd>The IEEE standard that defines the 4-byte VLAN tag used on trunks.</dd>
<dt>Native VLAN</dt><dd>The one VLAN whose frames cross an 802.1Q trunk without a tag.</dd>
<dt>DTP and VTP</dt><dd>Cisco protocols that negotiate trunking (DTP) and share the VLAN list between switches (VTP). You will learn to control both, and usually to switch them off.</dd>
</dl>

<h3>Why this matters in real networks</h3>
<p>Every enterprise campus, every data center and every branch office uses VLANs. Security teams separate cameras, guests, payment terminals and servers into their own VLANs. Voice teams put phones in a voice VLAN so calls get priority. Wi-Fi controllers map each SSID to a VLAN. Hypervisors connect virtual machines to VLANs over trunks. When a ticket says "users on floor 3 have no network", the first question a senior engineer asks is "which VLAN, and is it on the trunk?"</p>

<h3>How this module is organised</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Lab you can then do</th></tr>
<tr><td>2 to 4</td><td>Switching recap, VLAN concepts and ranges, creating VLANs and access ports</td><td>Lab: VLAN configuration (Kaveri Textiles)</td></tr>
<tr><td>5</td><td>Voice VLAN for IP phones, role of CDP and LLDP</td><td>Scenario tickets</td></tr>
<tr><td>6 to 9</td><td>802.1Q tag, trunks and the allowed list, native VLAN, DTP</td><td>Lab: trunking, DTP and the native VLAN (Sahyadri Health)</td></tr>
<tr><td>10</td><td>VTP and why most networks turn it off</td><td>Scenario tickets</td></tr>
<tr><td>11</td><td>Verification and the troubleshooting workflow</td><td>NOC ticket INC-2207</td></tr>
<tr><td>12</td><td>Summary and exam checklist</td><td>Quiz and interview practice</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A branch has 120 PCs and 40 IP phones on one flat network, 192.168.1.0/24. Every ARP request, DHCP Discover and phone announcement reaches all 160 devices. After the redesign, PCs go into VLAN 10 (10.10.10.0/24), phones into VLAN 110 (10.110.0.0/24), the CCTV cameras into VLAN 30 and guests into VLAN 40. A PC broadcast now reaches about 120 devices instead of 160, cameras are hidden from users, and a guest cannot even ARP for a finance PC. Same switches, same cables, four separate LANs.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that a VLAN is a physical thing, like a separate cable or switch. A VLAN is only a number the switch attaches to each port and each frame. Two PCs plugged into neighbouring ports can be in different VLANs and completely isolated, while two PCs in different buildings can be in the same VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Hosts in different VLANs can talk if they are on the same switch." False. Different VLANs need a Layer 3 device (router or Layer 3 switch) to communicate, even when both hosts are on the same physical switch. That is the next module, inter-VLAN routing.</p></div>

<div class="scn"><h4>The printer that slowed the whole office</h4><p>A 250-seat call centre ran on one flat /23 network across six stacked switches. Every morning at 9:30 the network felt slow. The engineer captured traffic on an idle PC and found more than 800 broadcast and multicast frames per second: ARP, NetBIOS, printer discovery and a misbehaving label printer sending discovery packets in a loop. Every PC had to receive and process all of them. The fix was to split the floor into VLANs (agents, supervisors, printers, phones) and move the printers into their own VLAN. Broadcast load per PC dropped by more than 70 percent and the morning slowness disappeared.</p><p><b>Lesson:</b> a flat network lets every device's noise reach every other device. VLANs contain the noise.</p></div>

<div class="iv"><p class="q">"What is a VLAN, and why would you use one?"</p><p>Strong answer: a VLAN is a logical broadcast domain created inside switches; one VLAN normally maps to one IP subnet. Give three reasons: smaller broadcast domains (less wasted bandwidth and CPU), security and segmentation (guests, cameras, payment devices isolated), and flexibility (group users by role, not by where they sit). Finish by saying that traffic between VLANs must be routed, which is where you apply security policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A flat network is one big broadcast domain; every broadcast reaches every device.</li>
<li>A VLAN is a separate broadcast domain inside the switch, normally one IP subnet.</li>
<li>Access ports carry one VLAN untagged; trunks carry many VLANs using 802.1Q tags.</li>
<li>Moving traffic between VLANs always needs a router or Layer 3 switch.</li>
<li>This module ends with a real NOC ticket, so learn the verification commands as carefully as the configuration.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Module ke end tak aap samjha paoge ki switch kaise learn aur flood karta hai, flat network kyun nuksaan karta hai, aur VLANs ek switch ko kai alag LANs mein kaise baant dete hain. Aap VLANs banaoge aur unhe naam doge, PCs aur IP phones ke liye access ports banaoge, 802.1Q trunk par switches ke beech kai VLANs le jaoge, control karoge ki trunk par exactly kaunse VLANs jaayein, native VLAN safely set karoge, DTP ko lock down karoge, decide karoge ki VTP ke saath kya karna hai, aur ek real NOC ticket troubleshoot karoge jahan ek missing keyword ne poora office offline kar diya tha. Yeh CCNA 200-301 ke Network Access domain ke core topics hain, aur lagbhag har network engineer interview mein aate hain.</p>

<h3>Prerequisites</h3>
<ul>
<li>Aap Cisco IOS CLI mein ghoom sakte ho: user EXEC, privileged EXEC, global aur interface configuration modes (module <b>ccna-ios</b>).</li>
<li>Aapko pata hai MAC address kya hota hai aur Ethernet frame kaisa dikhta hai (modules <b>ccna-models</b> aur <b>ccna-interfaces</b>).</li>
<li>Aap IPv4 address aur mask padh sakte ho aur bata sakte ho ki do hosts same subnet mein hain ya nahi (module <b>ccna-ipv4</b>).</li>
</ul>
<p>Iske alawa switching ka koi experience nahi chahiye. Chapter 2 exactly recap karta hai ki switch frames kaise forward karta hai, kyunki is module ki har cheez usi par banti hai.</p>

<h3>Ek analogy: ek khule hall se office building tak</h3>
<p>Ek company socho jiske saare 300 log ek bade khule hall mein baithte hain. Jab bhi kisi ko kuch chahiye, woh chillata hai. Har koi har aawaz sunta hai, chahe woh uske liye ho ya nahi. Finance Sales ko sunta hai, Sales HR ko sunta hai, aur darwaze par khada visitor sab kuch sunta hai. Company badhti hai to shor bhi badhta hai, jab tak log kaam hi nahi kar paate.</p>
<p>Ab company ko ek office building mein shift karo jisme alag floors hain. Har floor ka apna public-address speaker hai. Finance floor par announcement sirf Finance sunta hai. Alag floors ke log phir bhi ek doosre tak pahunch sakte hain, par sirf reception (router) se hokar. Aur building mein ek staircase hai jo saare floors share karte hain: har koi use karta hai, par har insaan apne floor number wala badge pehenta hai taaki doosre end par sahi floor par nikle.</p>
<p>Networking ki bhasha mein: khula hall ek <b>flat Layer 2 network</b> hai, chillana ek <b>broadcast</b> hai, har floor ek <b>VLAN</b> hai, floor ke speaker ki range ek <b>broadcast domain</b> hai, reception ek <b>router ya Layer 3 switch</b> hai, shared staircase ek <b>trunk</b> hai aur badge <b>802.1Q tag</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Do switches jinme VLAN 10 aur VLAN 20 hain, 802.1Q trunk se jude, aur VLANs ke beech router">
<rect x="250" y="12" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Router / L3 switch</text>
<rect x="90" y="100" width="130" height="44" rx="8" fill="#bae6fd"/><text x="155" y="127" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="420" y="100" width="130" height="44" rx="8" fill="#bae6fd"/><text x="485" y="127" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<line x1="220" y1="122" x2="420" y2="122" stroke="#64748b" stroke-width="5"/>
<text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="12">802.1Q trunk: VLAN 10 + 20</text>
<line x1="200" y1="100" x2="280" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="210" y="72" class="svg-muted" font-size="12">VLANs ke beech routing</text>
<rect x="30" y="200" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 10</text>
<rect x="160" y="200" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="210" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 20</text>
<rect x="380" y="200" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="430" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 10</text>
<rect x="510" y="200" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC VLAN 20</text>
<line x1="130" y1="144" x2="80" y2="200" stroke="#64748b" stroke-width="2"/><line x1="170" y1="144" x2="210" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="144" x2="430" y2="200" stroke="#64748b" stroke-width="2"/><line x1="505" y1="144" x2="560" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">access ports: untagged, har port ek VLAN</text>
</svg><p class="cap">Poora module ek picture mein: access ports, VLANs, switches ke beech tagged trunk, aur VLANs ke beech traffic le jaane ke liye router.</p></div>

<h3>Jo words aapko milenge</h3>
<dl class="terms">
<dt>Broadcast domain</dt><dd>Devices ka woh set jo unme se kisi ek ke bheje broadcast frame ko receive karta hai.</dd>
<dt>VLAN (Virtual LAN)</dt><dd>Ek ya zyada switches ke andar configuration se bana broadcast domain, jise 1 se 4094 tak ke number se pehchana jaata hai.</dd>
<dt>Access port</dt><dd>Switch port jo ek data VLAN ka hota hai (plus optionally ek voice VLAN). Is par frames untagged hote hain.</dd>
<dt>Trunk</dt><dd>Woh link jo ek saath kai VLANs carry karta hai, har frame par VLAN tag laga kar.</dd>
<dt>802.1Q</dt><dd>IEEE standard jo trunks par use hone wala 4-byte VLAN tag define karta hai.</dd>
<dt>Native VLAN</dt><dd>Woh ek VLAN jiske frames 802.1Q trunk ko bina tag ke cross karte hain.</dd>
<dt>DTP aur VTP</dt><dd>Cisco protocols jo trunking negotiate karte hain (DTP) aur switches ke beech VLAN list share karte hain (VTP). Aap dono ko control karna seekhoge, aur aam taur par band karna bhi.</dd>
</dl>

<h3>Real networks mein yeh kyun zaroori hai</h3>
<p>Har enterprise campus, har data center aur har branch office VLANs use karta hai. Security teams cameras, guests, payment terminals aur servers ko unke apne VLANs mein alag karti hain. Voice teams phones ko voice VLAN mein daalti hain taaki calls ko priority mile. Wi-Fi controllers har SSID ko ek VLAN se map karte hain. Hypervisors trunks ke through virtual machines ko VLANs se jodte hain. Jab ticket kehta hai "floor 3 ke users ka network nahi hai", to senior engineer ka pehla sawaal hota hai "kaunsa VLAN, aur kya woh trunk par hai?"</p>

<h3>Yeh module kaise organised hai</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Uske baad aap kaunsa lab kar sakte ho</th></tr>
<tr><td>2 se 4</td><td>Switching recap, VLAN concepts aur ranges, VLANs aur access ports banana</td><td>Lab: VLAN configuration (Kaveri Textiles)</td></tr>
<tr><td>5</td><td>IP phones ke liye voice VLAN, CDP aur LLDP ka role</td><td>Scenario tickets</td></tr>
<tr><td>6 se 9</td><td>802.1Q tag, trunks aur allowed list, native VLAN, DTP</td><td>Lab: trunking, DTP aur native VLAN (Sahyadri Health)</td></tr>
<tr><td>10</td><td>VTP aur zyada tar networks ise band kyun karte hain</td><td>Scenario tickets</td></tr>
<tr><td>11</td><td>Verification aur troubleshooting workflow</td><td>NOC ticket INC-2207</td></tr>
<tr><td>12</td><td>Summary aur exam checklist</td><td>Quiz aur interview practice</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek branch mein 120 PCs aur 40 IP phones ek flat network 192.168.1.0/24 par hain. Har ARP request, DHCP Discover aur phone announcement saare 160 devices tak pahunchta hai. Redesign ke baad PCs VLAN 10 (10.10.10.0/24) mein, phones VLAN 110 (10.110.0.0/24) mein, CCTV cameras VLAN 30 mein aur guests VLAN 40 mein jaate hain. Ab PC ka broadcast 160 ki jagah lagbhag 120 devices tak pahunchta hai, cameras users se chhup jaate hain, aur guest finance PC ke liye ARP bhi nahi kar sakta. Wahi switches, wahi cables, chaar alag LANs.</p></div>

<div class="warn"><p><b>Beginner ki common galti.</b> Yeh sochna ki VLAN koi physical cheez hai, jaise alag cable ya switch. VLAN sirf ek number hai jo switch har port aur har frame ke saath jodta hai. Paas paas ke ports mein lage do PCs alag VLANs mein ho kar poori tarah isolated ho sakte hain, jabki alag buildings ke do PCs same VLAN mein ho sakte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Alag VLANs ke hosts baat kar sakte hain agar woh same switch par hain." Galat. Alag VLANs ko communicate karne ke liye Layer 3 device (router ya Layer 3 switch) chahiye, chahe dono hosts same physical switch par hon. Yahi agla module hai, inter-VLAN routing.</p></div>

<div class="scn"><h4>Woh printer jisne poora office slow kar diya</h4><p>Ek 250-seat call centre chhe stacked switches par ek flat /23 network par chalta tha. Har subah 9:30 baje network slow lagta tha. Engineer ne ek idle PC par traffic capture kiya aur 800 se zyada broadcast aur multicast frames per second paaye: ARP, NetBIOS, printer discovery aur ek kharab label printer jo loop mein discovery packets bhej raha tha. Har PC ko yeh sab receive aur process karna padta tha. Fix tha floor ko VLANs mein baantna (agents, supervisors, printers, phones) aur printers ko unke apne VLAN mein daalna. Har PC par broadcast load 70 percent se zyada gira aur subah ki slowness gayab ho gayi.</p><p><b>Seekh:</b> flat network har device ka shor har doosre device tak pahunchne deta hai. VLANs us shor ko rok kar rakhte hain.</p></div>

<div class="iv"><p class="q">"VLAN kya hai, aur aap ise kyun use karoge?"</p><p>Strong answer: VLAN switches ke andar bana ek logical broadcast domain hai; ek VLAN normally ek IP subnet se map hota hai. Teen reasons do: chhote broadcast domains (kam bandwidth aur CPU waste), security aur segmentation (guests, cameras, payment devices isolated), aur flexibility (users ko role ke hisaab se group karo, is hisaab se nahi ki woh kahan baithe hain). End mein bolo ki VLANs ke beech traffic route karna padta hai, aur wahi jagah hai jahan aap security policy lagate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flat network ek bada broadcast domain hai; har broadcast har device tak pahunchta hai.</li>
<li>VLAN switch ke andar ek alag broadcast domain hai, normally ek IP subnet.</li>
<li>Access ports ek VLAN untagged carry karte hain; trunks 802.1Q tags use karke kai VLANs carry karte hain.</li>
<li>VLANs ke beech traffic le jaane ke liye hamesha router ya Layer 3 switch chahiye.</li>
<li>Yeh module ek real NOC ticket par khatam hota hai, isliye verification commands ko bhi configuration jitne dhyan se seekho.</li>
</ul></div>
`}};export{e as default};