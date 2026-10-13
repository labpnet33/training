var e={id:`big-picture`,h:{en:`The big picture: one gateway, one weak point`,hi:`Big picture: ek gateway, ek kamzor kadi`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why a single default gateway is a single point of failure, describe how a First Hop Redundancy Protocol (FHRP) hides two routers behind one virtual IP and one virtual MAC, configure and verify HSRP on Cisco IOS, tune priority, preempt, timers and tracking, share load across VLANs, compare HSRP with VRRP and GLBP, test failover safely and troubleshoot the classic mistakes. The two labs of this module (an HSRP active/standby build and a broken failover ticket) use exactly the devices and addresses you will meet in these chapters.</p>

<h3>Prerequisites</h3>
<ul>
<li><b>IPv4 addressing and subnetting</b> (module ccna-ipv4): you must be comfortable with a /24 and with the idea of a default gateway.</li>
<li><b>ARP</b>: a host that wants to reach its gateway first asks "who has this IP?" and caches the MAC it gets back.</li>
<li><b>VLANs and inter-VLAN routing</b> (ccna-vlans, ccna-intervlan): gateways usually live on router subinterfaces or switch SVIs, one per VLAN.</li>
<li><b>STP</b> (ccna-stp): you will align the Active gateway with the STP root in the load-sharing chapter.</li>
<li><b>Basic OSPF or static routing</b> (ccna-ospf, ccna-static): the lab routers use OSPF upstream. We only need the idea that both routers can reach the rest of the network.</li>
</ul>

<h3>An analogy: the reception desk phone number</h3>
<p>Imagine a hospital that prints one phone number on every card: the reception desk. Patients never call a doctor directly; they call reception. Now imagine the receptionist falls ill. If the number rings only on her desk, every call fails, even though a second receptionist sits one metre away. The smart hospital makes the number <b>ring on whichever desk is on duty</b>. Patients keep dialling the same number and never know who answers.</p>
<p>A host's default gateway is that printed number. The routers are the receptionists. A First Hop Redundancy Protocol makes the gateway address "ring" on whichever router is on duty.</p>

<h3>The problem in network terms</h3>
<p>A PC knows exactly <b>one</b> default gateway, typed by hand or received from DHCP. Every packet for a remote network goes to that single address. In the lab topology of this module, the Pune sales floor uses <code>192.168.10.1</code> as gateway. If only router R1 owned that address and R1 failed, PC1 and PC2 would lose the web server <code>203.0.113.10</code> and everything else beyond the LAN, even though R2 is plugged into the same switch SW1 and has a perfectly good path to CORE.</p>
<p>Why not just give hosts two gateways? Most operating systems accept only one active default gateway, and they do not detect a dead gateway quickly. Why not change the gateway on hundreds of PCs during an outage? Far too slow. Why not run a routing protocol on every PC? Not practical, and not secure. The answer the industry settled on is to make two or more routers <b>pretend to be one</b>.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology with two gateways">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">OSPF area 0</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#fde68a"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="14">WEB</text><text x="545" y="57" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<line x1="390" y1="42" x2="470" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="170" y="141" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="170" y="159" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 192.168.10.2</text>
<rect x="390" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="470" y="141" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="470" y="159" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 192.168.10.3</text>
<line x1="200" y1="120" x2="280" y2="64" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="360" y2="64" stroke="#64748b" stroke-width="2"/>
<text x="200" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/30</text><text x="440" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/30</text>
<rect x="260" y="200" width="120" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="170" y1="170" x2="280" y2="200" stroke="#64748b" stroke-width="2"/><line x1="470" y1="170" x2="360" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="250" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="200" y="275" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text>
<rect x="360" y="250" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="440" y="275" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text>
<line x1="290" y1="236" x2="220" y2="250" stroke="#64748b" stroke-width="2"/><line x1="350" y1="236" x2="420" y2="250" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">gateway 192.168.10.1 = ?</text>
</svg><p class="cap">The lab topology. Two routers share LAN 192.168.10.0/24, but the PCs can point at only one gateway address.</p></div>

<h3>The FHRP idea in one paragraph</h3>
<p>A <b>First Hop Redundancy Protocol</b> lets a group of routers on the same LAN share a <b>virtual IP address</b> (VIP) and a <b>virtual MAC address</b>. Hosts use the VIP as their gateway. At any moment one router is "on duty" and answers for the VIP. The routers exchange small hello messages; when the on-duty router goes silent, another router takes over the same IP and the same MAC within seconds. Nothing changes on the PCs. The "first hop" in the name is the first router a packet meets on its way off the LAN.</p>

<h3>The protocols you will meet</h3>
<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Roles</th><th>Depth in CCNA</th></tr>
<tr><td><b>HSRP</b> (Hot Standby Router Protocol)</td><td>Cisco proprietary</td><td>Active / Standby</td><td>Configure, verify, troubleshoot</td></tr>
<tr><td><b>VRRP</b> (Virtual Router Redundancy Protocol)</td><td>Open standard (RFC 5798)</td><td>Master / Backup</td><td>Describe and configure basics</td></tr>
<tr><td><b>GLBP</b> (Gateway Load Balancing Protocol)</td><td>Cisco proprietary</td><td>AVG / AVF</td><td>Concept only</td></tr></table>

<div class="eg"><p><b>Worked example.</b> The Pune floor has 60 PCs, all with gateway 192.168.10.1. Without an FHRP, R1 owns 192.168.10.1. R1's power supply fails at 11:00; 60 users lose the internet until someone reconfigures R2 with that address, perhaps 20 minutes later. With HSRP, R1 and R2 both join group 10 for VIP 192.168.10.1. When R1 dies, R2 stops hearing R1's hellos, waits for the 10-second hold time, and takes over. Users see at most about 10 seconds of loss, and nobody touches a PC.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking an FHRP protects the whole path. It protects only the <b>first hop</b>: the gateway on the LAN. If the on-duty router is alive on the LAN but has lost its uplink, hosts still send traffic to it. Chapter 7 (tracking) fixes that gap.</p></div>

<div class="exam"><p><b>Exam trap.</b> The CCNA 200-301 blueprint asks you to <b>describe the purpose, functions and concepts</b> of FHRPs. Expect questions on roles, virtual MAC formats, preempt and "which protocol is open standard or load-balances", more than on long configurations. Labs and interviews, however, expect you to configure and verify HSRP, so learn both.</p></div>

<div class="scn"><h4>A branch that went dark over a power strip</h4><p>A retail branch in Nagpur had two routers from two ISPs, but every till used 192.0.2.1, configured only on the primary router. A cleaner unplugged the primary router's power strip. The backup router and its ISP link were fine, yet all tills stopped taking card payments for 40 minutes until an engineer drove in and moved the address by hand. The fix was an HSRP group with a VIP shared by both routers.</p><p><b>Lesson:</b> a second router is not redundancy until hosts can reach it without any change on their side.</p></div>

<div class="iv"><p class="q">"Why do we need a First Hop Redundancy Protocol at all?"</p><p>Strong answer: hosts have a single static default gateway and do not run routing protocols, so if that one router fails they are cut off even when another router is on the same segment. An FHRP groups routers behind a shared virtual IP and virtual MAC; one forwards, the others monitor it with hellos and take over transparently. Mention HSRP, VRRP and GLBP by name and that the host configuration never changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A host has one default gateway; if that router fails, the host is cut off from every remote network.</li>
<li>An FHRP makes several routers act as one virtual router with a shared virtual IP and virtual MAC.</li>
<li>Hosts point at the VIP; failover needs no change on any PC.</li>
<li>HSRP and GLBP are Cisco protocols, VRRP is the open standard.</li>
<li>FHRPs protect only the first hop; uplink failures need tracking.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki ek akela default gateway single point of failure kyun hai, describe kar paoge ki First Hop Redundancy Protocol (FHRP) do routers ko ek virtual IP aur ek virtual MAC ke peeche kaise chhupata hai, Cisco IOS par HSRP configure aur verify kar paoge, priority, preempt, timers aur tracking tune kar paoge, VLANs mein load share kar paoge, HSRP ko VRRP aur GLBP se compare kar paoge, failover safely test kar paoge aur classic galtiyan troubleshoot kar paoge. Is module ke do labs (ek HSRP active/standby build aur ek toota hua failover ticket) bilkul wahi devices aur addresses use karte hain jo aap in chapters mein dekhoge.</p>

<h3>Prerequisites</h3>
<ul>
<li><b>IPv4 addressing aur subnetting</b> (module ccna-ipv4): /24 aur default gateway ka idea aapko aaram se samajh aana chahiye.</li>
<li><b>ARP</b>: jo host apne gateway tak pahunchna chahta hai woh pehle poochta hai "yeh IP kiske paas hai?" aur jo MAC wapas aata hai use cache kar leta hai.</li>
<li><b>VLANs aur inter-VLAN routing</b> (ccna-vlans, ccna-intervlan): gateways aam taur par router subinterfaces ya switch SVIs par hote hain, har VLAN ke liye ek.</li>
<li><b>STP</b> (ccna-stp): load-sharing chapter mein aap Active gateway ko STP root ke saath align karoge.</li>
<li><b>Basic OSPF ya static routing</b> (ccna-ospf, ccna-static): lab routers upstream OSPF use karte hain. Humein bas itna idea chahiye ki dono routers baaki network tak pahunch sakte hain.</li>
</ul>

<h3>Ek analogy: reception desk ka phone number</h3>
<p>Ek hospital socho jo har card par ek hi phone number chhaapta hai: reception desk. Patients kabhi doctor ko seedha call nahi karte; woh reception ko call karte hain. Ab socho receptionist bimaar pad gayi. Agar number sirf uske desk par bajta hai, to har call fail hogi, chahe doosri receptionist ek meter door baithi ho. Samajhdaar hospital number ko <b>us desk par bajwata hai jo duty par hai</b>. Patients wahi number dial karte rehte hain aur kabhi pata nahi chalta ki jawab kaun de raha hai.</p>
<p>Host ka default gateway wahi chhapa hua number hai. Routers receptionists hain. First Hop Redundancy Protocol gateway address ko us router par "bajwata" hai jo duty par hai.</p>

<h3>Network ki bhasha mein problem</h3>
<p>PC ko sirf <b>ek</b> default gateway pata hota hai, haath se likha hua ya DHCP se mila. Remote network ka har packet usi ek address par jaata hai. Is module ke lab topology mein Pune sales floor <code>192.168.10.1</code> ko gateway ki tarah use karta hai. Agar yeh address sirf router R1 ke paas hota aur R1 fail ho jaata, to PC1 aur PC2 web server <code>203.0.113.10</code> aur LAN ke bahar sab kuch kho dete, chahe R2 usi switch SW1 mein laga ho aur uske paas CORE tak bilkul theek path ho.</p>
<p>Hosts ko do gateways kyun na de dein? Zyada tar operating systems sirf ek active default gateway lete hain, aur mare hue gateway ko jaldi detect nahi karte. Outage ke time sau PCs par gateway kyun na badal dein? Bahut slow. Har PC par routing protocol kyun na chala dein? Practical nahi, aur secure bhi nahi. Industry ne jo jawab chuna woh hai do ya zyada routers ko <b>ek hone ka naatak</b> karwana.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Do gateways wala lab topology">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">OSPF area 0</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#fde68a"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="14">WEB</text><text x="545" y="57" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<line x1="390" y1="42" x2="470" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="170" y="141" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="170" y="159" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 192.168.10.2</text>
<rect x="390" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="470" y="141" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="470" y="159" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 192.168.10.3</text>
<line x1="200" y1="120" x2="280" y2="64" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="360" y2="64" stroke="#64748b" stroke-width="2"/>
<text x="200" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/30</text><text x="440" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/30</text>
<rect x="260" y="200" width="120" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="170" y1="170" x2="280" y2="200" stroke="#64748b" stroke-width="2"/><line x1="470" y1="170" x2="360" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="250" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="200" y="275" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text>
<rect x="360" y="250" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="440" y="275" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text>
<line x1="290" y1="236" x2="220" y2="250" stroke="#64748b" stroke-width="2"/><line x1="350" y1="236" x2="420" y2="250" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">gateway 192.168.10.1 = ?</text>
</svg><p class="cap">Lab topology. Do routers LAN 192.168.10.0/24 share karte hain, lekin PCs sirf ek gateway address ki taraf point kar sakte hain.</p></div>

<h3>FHRP ka idea ek paragraph mein</h3>
<p><b>First Hop Redundancy Protocol</b> same LAN ke routers ke group ko ek <b>virtual IP address</b> (VIP) aur ek <b>virtual MAC address</b> share karne deta hai. Hosts VIP ko gateway rakhte hain. Kisi bhi pal ek router "duty par" hota hai aur VIP ka jawab deta hai. Routers chhote hello messages exchange karte hain; jab duty wala router chup ho jaata hai, doosra router kuch hi seconds mein wahi IP aur wahi MAC le leta hai. PCs par kuch nahi badalta. Naam mein "first hop" woh pehla router hai jo packet ko LAN se bahar jaate waqt milta hai.</p>

<h3>Protocols jo aap dekhoge</h3>
<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Roles</th><th>CCNA mein depth</th></tr>
<tr><td><b>HSRP</b> (Hot Standby Router Protocol)</td><td>Cisco proprietary</td><td>Active / Standby</td><td>Configure, verify, troubleshoot</td></tr>
<tr><td><b>VRRP</b> (Virtual Router Redundancy Protocol)</td><td>Open standard (RFC 5798)</td><td>Master / Backup</td><td>Describe aur basic configure</td></tr>
<tr><td><b>GLBP</b> (Gateway Load Balancing Protocol)</td><td>Cisco proprietary</td><td>AVG / AVF</td><td>Sirf concept</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune floor par 60 PCs hain, sabka gateway 192.168.10.1. FHRP ke bina 192.168.10.1 R1 ke paas hai. 11:00 baje R1 ka power supply fail hota hai; 60 users ka internet tab tak band jab tak koi R2 par woh address configure na kare, shayad 20 minute baad. HSRP ke saath R1 aur R2 dono VIP 192.168.10.1 ke liye group 10 join karte hain. Jab R1 marta hai, R2 ko R1 ke hellos sunai dena band ho jaata hai, woh 10-second hold time wait karta hai, aur kaam sambhal leta hai. Users ko zyada se zyada lagbhag 10 second ka loss dikhta hai, aur koi PC ko haath nahi lagata.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki FHRP poore path ko bachata hai. Yeh sirf <b>first hop</b> bachata hai: LAN par gateway. Agar duty wala router LAN par zinda hai lekin uska uplink chala gaya, to hosts phir bhi usi ko traffic bhejte hain. Chapter 7 (tracking) yeh gap theek karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> CCNA 200-301 blueprint aapse FHRPs ka <b>purpose, functions aur concepts describe</b> karne ko kehta hai. Roles, virtual MAC formats, preempt aur "kaunsa protocol open standard hai ya load-balance karta hai" par questions expect karo, lambi configurations se zyada. Lekin labs aur interviews expect karte hain ki aap HSRP configure aur verify kar sako, isliye dono seekho.</p></div>

<div class="scn"><h4>Ek power strip se andhere mein gayi branch</h4><p>Nagpur ki ek retail branch mein do ISPs ke do routers the, lekin har till 192.0.2.1 use karta tha, jo sirf primary router par configured tha. Ek cleaner ne primary router ki power strip nikaal di. Backup router aur uska ISP link bilkul theek the, phir bhi saare tills 40 minute tak card payment nahi le paaye, jab tak ek engineer gaadi chala kar aaya aur address haath se shift kiya. Fix tha ek HSRP group jiska VIP dono routers share karein.</p><p><b>Seekh:</b> doosra router tab tak redundancy nahi hai jab tak hosts bina apni taraf kuch badle us tak pahunch na sakein.</p></div>

<div class="iv"><p class="q">"Humein First Hop Redundancy Protocol ki zaroorat hi kyun hai?"</p><p>Strong answer: hosts ke paas ek hi static default gateway hota hai aur woh routing protocols nahi chalate, isliye agar woh ek router fail ho jaaye to woh kat jaate hain, chahe same segment par doosra router ho. FHRP routers ko ek shared virtual IP aur virtual MAC ke peeche group karta hai; ek forward karta hai, baaki hellos se use monitor karte hain aur transparently kaam sambhal lete hain. HSRP, VRRP aur GLBP ke naam lo aur batao ki host configuration kabhi nahi badalti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host ka ek default gateway hota hai; woh router fail ho to host har remote network se kat jaata hai.</li>
<li>FHRP kai routers ko ek virtual router ki tarah chalata hai, shared virtual IP aur virtual MAC ke saath.</li>
<li>Hosts VIP ki taraf point karte hain; failover par kisi PC mein kuch badalna nahi padta.</li>
<li>HSRP aur GLBP Cisco protocols hain, VRRP open standard hai.</li>
<li>FHRPs sirf first hop bachate hain; uplink failures ke liye tracking chahiye.</li>
</ul></div>
`}};export{e as default};