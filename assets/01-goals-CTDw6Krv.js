var e={id:`goals`,h:{en:`What you will learn, and why servers dual-home`,hi:`Aap kya seekhoge, aur servers dual-home kyun hote hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to take two brand-new Nexus switches, join them into a <b>vPC (virtual port-channel)</b> domain, dual-home a Linux server to both with one LACP bond, give the VLAN a redundant gateway with HSRP, and then calmly troubleshoot the pair when a peer-link, a keepalive or a whole switch dies. You will also understand why vPC is built the way it is, which is what interviewers and the CCNP Data Center (DCCOR 350-601) exam actually test.</p>

<h3>Prerequisites</h3>
<ul>
<li>VLANs, access and trunk ports, and what a MAC address table does.</li>
<li>The basic idea of spanning tree: loops are bad, so STP blocks ports.</li>
<li>IP addressing and a default gateway. You do not need to know routing protocols.</li>
<li>Comfort with a CLI. If you have used Cisco IOS, NX-OS will feel familiar; the differences are shown as we go.</li>
</ul>

<h3>Start with an analogy: a shop with two doors</h3>
<p>Imagine a busy shop on a corner with <b>two doors</b>, one on each street. If one door is jammed, customers use the other. On a normal day, customers use <b>both</b> doors, so there is no queue. But there is a catch: the shop must behave like <b>one shop</b>. If each door had a different cashier who did not talk to the other, a customer who paid at door A and returned an item at door B would cause chaos.</p>
<p>A dual-homed server is that shop. It has two network cards (NICs), each cabled to a different switch. We want both cables to carry traffic, and we want either switch to be able to fail or be upgraded. For that to work, the two switches must cooperate so that, to the server, they look like <b>one switch</b>. That cooperation is exactly what vPC provides.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="A server dual-homed to two Nexus switches">
<rect x="90" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="170" y="47" text-anchor="middle" class="svg-ink" font-size="14">NX1 (leaf A)</text>
<rect x="390" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="470" y="47" text-anchor="middle" class="svg-ink" font-size="14">NX2 (leaf B)</text>
<line x1="250" y1="36" x2="390" y2="36" stroke="#64748b" stroke-width="4"/><text x="320" y="28" text-anchor="middle" class="svg-muted" font-size="12">peer-link</text>
<line x1="250" y1="54" x2="390" y2="54" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">keepalive</text>
<rect x="240" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="14">SRV1</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">bond0 = eth0 + eth1</text>
<line x1="170" y1="64" x2="280" y2="160" stroke="#64748b" stroke-width="3"/><text x="190" y="125" class="svg-accent" font-size="12">eth0</text>
<line x1="470" y1="64" x2="360" y2="160" stroke="#64748b" stroke-width="3"/><text x="420" y="125" class="svg-accent" font-size="12">eth1</text>
<ellipse cx="320" cy="112" rx="120" ry="16" fill="none" stroke="#64748b" stroke-dasharray="5 4"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">one logical port-channel</text>
</svg><p class="cap">The lab topology you will use all module: two Nexus switches, one server, one bundle across both switches.</p></div>

<h3>Why servers dual-home at all</h3>
<p><b>Dual-homing</b> means connecting one device to two upstream devices. In a data center almost every production server is dual-homed, for four reasons:</p>
<ul>
<li><b>Switch failure.</b> A top-of-rack (ToR) switch can crash, lose power or suffer a hardware fault. With one uplink, every server in the rack goes dark.</li>
<li><b>Maintenance.</b> Switches need software upgrades. With dual-homing you upgrade leaf A while leaf B carries the traffic, then swap. No outage window for the application.</li>
<li><b>Cable and optic failure.</b> Optics die and cables get bent in cable trays. A second, independent path covers that.</li>
<li><b>Bandwidth.</b> Two 25G links that both forward give a server 50G of aggregate capacity, which matters for storage, backups and virtual machine hosts.</li>
</ul>
<p>The first three reasons are about <b>availability</b>; the fourth is about <b>performance</b>. The whole story of this module is how to get both at once, which is harder than it sounds.</p>

<h3>The problem in one sentence</h3>
<p>Ethernet cannot tolerate loops, so if you simply cable a server (or an access switch) to two switches that are connected to each other, you have created a loop. Spanning tree will then block one path, and you are back to using only half of what you bought. Chapter 2 shows this in detail. Chapter 3 shows how a <b>port-channel</b> fixes it when both links land on the <b>same</b> switch, and chapters 4 to 8 show how <b>vPC</b> stretches that port-channel across <b>two</b> switches.</p>

<div class="eg"><p><b>Worked example.</b> A rack has 20 virtualisation hosts, each with 2 × 25G NICs. With active/standby NIC teaming, each host can send at most 25G, so the rack can use 20 × 25 = 500 Gbit/s. With both NICs active in a vPC bundle, each host can use up to 50G of aggregate bandwidth across many flows, so the rack can use up to 1,000 Gbit/s. Same cables, same optics, double the usable capacity, and still survives the loss of either switch.</p></div>

<h3>The map of this module</h3>
<table class="cmp"><tr><th>Chapters</th><th>What you will be able to do</th><th>Lab</th></tr>
<tr><td>2 to 3</td><td>Explain STP blocking, NIC teaming modes, and build and verify an LACP port-channel on NX-OS</td><td>-</td></tr>
<tr><td>4 to 5</td><td>Name every vPC component and build a vPC domain in the right order</td><td>Build a vPC domain; dual-home a Linux server</td></tr>
<tr><td>6</td><td>Read consistency checks and fix a type-1 mismatch</td><td>Ticket: bond runs on one NIC</td></tr>
<tr><td>7 to 8</td><td>Predict what happens in every failure and choose the right enhancements</td><td>-</td></tr>
<tr><td>9</td><td>Run HSRP active/active on a vPC pair</td><td>HSRP gateway on a vPC pair</td></tr>
<tr><td>10</td><td>Explain vPC with VXLAN EVPN and compare it with EVPN multihoming</td><td>-</td></tr>
<tr><td>11 to 12</td><td>Troubleshoot like a NOC engineer and revise for the exam</td><td>NOC drill: peer-link failure, orphan port, dead primary</td></tr>
</table>

<div class="note"><p><b>Lab conventions.</b> Throughout the module the switches are <b>NX1</b> and <b>NX2</b>, vPC domain <b>10</b>, the peer-link is <b>port-channel1</b> on Ethernet1/1-2, the keepalive runs on a routed link <b>Ethernet1/8</b> (10.0.0.1/30 and 10.0.0.2/30), the server <b>SRV1</b> uses <b>bond0</b> with 10.10.10.100/24 in <b>VLAN 10</b>, and its bundle is <b>vPC 20</b> on port-channel20. A single-NIC appliance, <b>SRV2</b>, hangs off NX2 Ethernet1/5.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that "two cables" automatically means "redundant and fast". Two cables into two switches without vPC (or a similar technology) gives you either a loop, a blocked port, or a server that uses one NIC and keeps the other idle. Redundancy and bandwidth come from the design, not from the cable count.</p></div>

<div class="scn"><h4>The upgrade that took down a rack</h4><p>A media company ran 30 servers in a rack with a single ToR switch and a single 10G uplink per server. A routine NX-OS upgrade needed a reload of that switch. The change was approved for "five minutes of impact", but the new image took 11 minutes to boot and load its line card, and a transcoding cluster lost its storage connection and had to be rebuilt by hand. After the incident the team added a second ToR switch, formed a vPC pair, and bonded two NICs per server. The next upgrade was done one switch at a time in the middle of the business day; monitoring showed each server drop to one link and come back, and no application noticed.</p><p><b>Lesson:</b> dual-homing with vPC turns switch maintenance from an outage into a non-event.</p></div>

<div class="iv"><p class="q">"Why do data center servers usually connect to two switches instead of one?"</p><p>Strong answer: to survive a switch failure, an optic or cable failure, and planned maintenance such as an NX-OS upgrade, without application impact; and, when both links forward, to double the usable bandwidth. Then add the twist that shows depth: two links into two switches create a Layer 2 loop, so you need a mechanism such as vPC (or EVPN multihoming) that makes both switches appear as one LACP partner, otherwise STP or NIC teaming leaves one link idle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module takes you from STP basics to building, verifying and troubleshooting a vPC pair with HSRP.</li>
<li>Dual-homing protects against switch, cable and optic failures and makes upgrades hitless.</li>
<li>Both links should forward: that doubles usable bandwidth for the same hardware.</li>
<li>Two links to two switches create a loop; vPC solves it by making two switches look like one to the server.</li>
<li>Learn the lab names now: NX1, NX2, domain 10, Po1 peer-link, Eth1/8 keepalive, vPC 20, SRV1 bond0.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap do bilkul naye Nexus switches lekar unhe ek <b>vPC (virtual port-channel)</b> domain mein jod paoge, ek Linux server ko ek hi LACP bond se dono switches par dual-home kar paoge, VLAN ko HSRP se redundant gateway de paoge, aur phir jab peer-link, keepalive ya poora switch mar jaaye to pair ko shaanti se troubleshoot kar paoge. Aap yeh bhi samjhoge ki vPC aise hi kyun bana hai, aur interviewers aur CCNP Data Center (DCCOR 350-601) exam asal mein yahi test karte hain.</p>

<h3>Prerequisites</h3>
<ul>
<li>VLANs, access aur trunk ports, aur MAC address table kya karti hai.</li>
<li>Spanning tree ka basic idea: loops bure hain, isliye STP ports block karta hai.</li>
<li>IP addressing aur default gateway. Routing protocols aana zaroori nahi.</li>
<li>CLI ke saath comfort. Agar aapne Cisco IOS use kiya hai to NX-OS jaana-pehchana lagega; fark saath saath dikhaye jaayenge.</li>
</ul>

<h3>Ek analogy se shuru karo: do darwaazon wali dukaan</h3>
<p>Ek kone par busy dukaan socho jiske <b>do darwaaze</b> hain, har street par ek. Agar ek darwaaza atak jaaye, customers doosra use karte hain. Normal din mein customers <b>dono</b> darwaaze use karte hain, isliye line nahi lagti. Par ek shart hai: dukaan ko <b>ek hi dukaan</b> jaisa behave karna chahiye. Agar har darwaaze par alag cashier ho jo doosre se baat na kare, to jo customer darwaaza A par pay kare aur darwaaza B par item wapas kare, woh chaos paida karega.</p>
<p>Dual-homed server yahi dukaan hai. Uske paas do network cards (NICs) hain, har ek alag switch se cabled. Hum chahte hain ki dono cables traffic le jaayein, aur koi bhi switch fail ya upgrade ho sake. Iske liye dono switches ko aise cooperate karna hoga ki server ko woh <b>ek switch</b> jaise dikhein. Yahi cooperation vPC deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do Nexus switches par dual-homed server">
<rect x="90" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="170" y="47" text-anchor="middle" class="svg-ink" font-size="14">NX1 (leaf A)</text>
<rect x="390" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="470" y="47" text-anchor="middle" class="svg-ink" font-size="14">NX2 (leaf B)</text>
<line x1="250" y1="36" x2="390" y2="36" stroke="#64748b" stroke-width="4"/><text x="320" y="28" text-anchor="middle" class="svg-muted" font-size="12">peer-link</text>
<line x1="250" y1="54" x2="390" y2="54" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">keepalive</text>
<rect x="240" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="14">SRV1</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">bond0 = eth0 + eth1</text>
<line x1="170" y1="64" x2="280" y2="160" stroke="#64748b" stroke-width="3"/><text x="190" y="125" class="svg-accent" font-size="12">eth0</text>
<line x1="470" y1="64" x2="360" y2="160" stroke="#64748b" stroke-width="3"/><text x="420" y="125" class="svg-accent" font-size="12">eth1</text>
<ellipse cx="320" cy="112" rx="120" ry="16" fill="none" stroke="#64748b" stroke-dasharray="5 4"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">ek logical port-channel</text>
</svg><p class="cap">Lab topology jo aap poore module mein use karoge: do Nexus switches, ek server, dono switches ke paar ek bundle.</p></div>

<h3>Servers dual-home karte hi kyun hain</h3>
<p><b>Dual-homing</b> ka matlab hai ek device ko do upstream devices se jodna. Data center mein lagbhag har production server dual-homed hota hai, chaar wajahon se:</p>
<ul>
<li><b>Switch failure.</b> Top-of-rack (ToR) switch crash ho sakta hai, power kho sakta hai ya hardware fault aa sakta hai. Ek hi uplink ho to rack ka har server band ho jaata hai.</li>
<li><b>Maintenance.</b> Switches ko software upgrade chahiye. Dual-homing ke saath aap leaf A upgrade karte ho jab leaf B traffic le jaata hai, phir ulta. Application ke liye koi outage window nahi.</li>
<li><b>Cable aur optic failure.</b> Optics mar jaate hain aur cable trays mein cables mud jaati hain. Doosra, independent path isse bachata hai.</li>
<li><b>Bandwidth.</b> Do 25G links jo dono forward karein, server ko 50G aggregate capacity dete hain, jo storage, backups aur virtual machine hosts ke liye matter karta hai.</li>
</ul>
<p>Pehli teen wajahein <b>availability</b> ke baare mein hain; chauthi <b>performance</b> ke baare mein. Is poore module ki kahani yahi hai ki dono ek saath kaise milein, jo sunne se zyada mushkil hai.</p>

<h3>Problem ek line mein</h3>
<p>Ethernet loops bardaasht nahi kar sakta, isliye agar aap server (ya access switch) ko do aise switches se cable kar do jo aapas mein jude hain, to aapne loop bana diya. Phir spanning tree ek path block kar dega, aur aap wapas wahi pahunch gaye jahan khareedi hui cheez ka sirf aadha use ho raha hai. Chapter 2 yeh detail mein dikhata hai. Chapter 3 dikhata hai ki <b>port-channel</b> ise kaise theek karta hai jab dono links <b>ek hi</b> switch par aate hain, aur chapter 4 se 8 dikhate hain ki <b>vPC</b> us port-channel ko <b>do</b> switches tak kaise failata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek rack mein 20 virtualisation hosts hain, har ek mein 2 × 25G NICs. Active/standby NIC teaming ke saath har host zyada se zyada 25G bhej sakta hai, isliye rack 20 × 25 = 500 Gbit/s use kar sakta hai. vPC bundle mein dono NICs active hon to har host bahut saare flows ke across 50G tak aggregate bandwidth use kar sakta hai, isliye rack 1,000 Gbit/s tak use kar sakta hai. Wahi cables, wahi optics, double usable capacity, aur phir bhi kisi bhi ek switch ke jaane par zinda.</p></div>

<h3>Is module ka naksha</h3>
<table class="cmp"><tr><th>Chapters</th><th>Aap kya kar paoge</th><th>Lab</th></tr>
<tr><td>2 se 3</td><td>STP blocking, NIC teaming modes samjhana, aur NX-OS par LACP port-channel banana aur verify karna</td><td>-</td></tr>
<tr><td>4 se 5</td><td>vPC ka har component naam se batana aur vPC domain sahi kram mein banana</td><td>vPC domain banao; Linux server dual-home karo</td></tr>
<tr><td>6</td><td>Consistency checks padhna aur type-1 mismatch theek karna</td><td>Ticket: bond ek NIC par chal raha hai</td></tr>
<tr><td>7 se 8</td><td>Har failure mein kya hoga predict karna aur sahi enhancements chunna</td><td>-</td></tr>
<tr><td>9</td><td>vPC pair par HSRP active/active chalana</td><td>vPC pair par HSRP gateway</td></tr>
<tr><td>10</td><td>VXLAN EVPN ke saath vPC samjhana aur EVPN multihoming se compare karna</td><td>-</td></tr>
<tr><td>11 se 12</td><td>NOC engineer ki tarah troubleshoot karna aur exam ke liye revise karna</td><td>NOC drill: peer-link failure, orphan port, mara hua primary</td></tr>
</table>

<div class="note"><p><b>Lab conventions.</b> Poore module mein switches <b>NX1</b> aur <b>NX2</b> hain, vPC domain <b>10</b>, peer-link Ethernet1/1-2 par <b>port-channel1</b> hai, keepalive routed link <b>Ethernet1/8</b> par chalta hai (10.0.0.1/30 aur 10.0.0.2/30), server <b>SRV1</b> <b>VLAN 10</b> mein 10.10.10.100/24 ke saath <b>bond0</b> use karta hai, aur uska bundle port-channel20 par <b>vPC 20</b> hai. Ek single-NIC appliance, <b>SRV2</b>, NX2 Ethernet1/5 par latka hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki "do cables" ka matlab apne aap "redundant aur fast" hai. Do switches mein do cables bina vPC (ya waisi technology) ke aapko ya to loop deti hain, ya blocked port, ya aisa server jo ek NIC use karta hai aur doosra khaali rakhta hai. Redundancy aur bandwidth design se aati hai, cable count se nahi.</p></div>

<div class="scn"><h4>Upgrade jisne poora rack gira diya</h4><p>Ek media company ek rack mein 30 servers chalati thi, ek hi ToR switch aur har server ka ek hi 10G uplink. Routine NX-OS upgrade ke liye us switch ka reload chahiye tha. Change "paanch minute impact" ke liye approve hua, par naye image ko boot hone aur line card load karne mein 11 minute lage, aur ek transcoding cluster ka storage connection toot gaya aur use haath se rebuild karna pada. Incident ke baad team ne doosra ToR switch lagaya, vPC pair banaya, aur har server ke do NICs bond kiye. Agla upgrade business day ke beech mein ek ek switch karke hua; monitoring ne dikhaya ki har server ek link par gira aur wapas aaya, aur kisi application ko pata bhi nahi chala.</p><p><b>Seekh:</b> vPC ke saath dual-homing switch maintenance ko outage se non-event bana deti hai.</p></div>

<div class="iv"><p class="q">"Data center servers aam taur par ek ki jagah do switches se kyun connect hote hain?"</p><p>Strong answer: switch failure, optic ya cable failure, aur NX-OS upgrade jaisi planned maintenance ko bina application impact ke jhelne ke liye; aur jab dono links forward karein, to usable bandwidth double karne ke liye. Phir woh twist jodo jo depth dikhata hai: do switches mein do links Layer 2 loop banate hain, isliye aapko vPC (ya EVPN multihoming) jaisa mechanism chahiye jo dono switches ko ek LACP partner jaisa dikhaye, warna STP ya NIC teaming ek link ko khaali chhod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module aapko STP basics se lekar HSRP ke saath vPC pair banane, verify aur troubleshoot karne tak le jaata hai.</li>
<li>Dual-homing switch, cable aur optic failures se bachati hai aur upgrades ko hitless banati hai.</li>
<li>Dono links forward karne chahiye: isse same hardware mein usable bandwidth double hoti hai.</li>
<li>Do switches tak do links loop banate hain; vPC server ke liye do switches ko ek jaisa dikha kar ise solve karta hai.</li>
<li>Lab ke naam abhi yaad kar lo: NX1, NX2, domain 10, Po1 peer-link, Eth1/8 keepalive, vPC 20, SRV1 bond0.</li>
</ul></div>
`}};export{e as default};