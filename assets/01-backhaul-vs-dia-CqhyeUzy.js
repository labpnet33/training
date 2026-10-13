var e={id:`backhaul-vs-dia`,h:{en:`Backhaul versus Direct Internet Access: the big picture`,hi:`Backhaul versus Direct Internet Access: big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn why modern branches stop sending internet traffic to the data center, and how Catalyst SD-WAN lets a WAN Edge send it straight out of the local internet link. You will turn on NAT on a transport interface, enable Direct Internet Access (DIA) with the NAT route, build a selective DIA data policy for guests, add safety nets (fallback and trackers), secure the branch, handle DNS correctly, understand Cloud OnRamp for SaaS and Multicloud, and troubleshoot a DIA that is "configured but dead". The three labs of this module (NAT route, selective DIA, and the DIA ticket) are walked through step by step. <b>Prerequisites:</b> you should know the SD-WAN components, VPN 0 (transport) versus service VPNs, TLOCs and colors, and what a centralized data policy is (previous module).</p>

<h3>Start with an analogy: courier via head office or direct</h3>
<p>Imagine a company where every branch must post its parcels to head office in Mumbai, and head office then posts them to the final customer. The parcel to a customer in the same street in Pune travels to Mumbai and back. That is <b>backhaul</b> (also called centralized internet breakout). Now imagine each branch is allowed to hand parcels to the local courier directly. That is <b>Direct Internet Access</b> (also called local internet breakout). Head office still receives internal mail (site-to-site traffic over the overlay), but the customer parcels take the short road.</p>

<h3>Why backhaul is no longer enough</h3>
<p>In a classic hub-and-spoke WAN, all internet traffic is carried to the data center, inspected by one big firewall stack, and sent out through one internet link. That made sense when applications lived in the data center. Today most traffic goes to SaaS (Microsoft 365, Webex, Salesforce) and to public cloud. Backhaul then means the branch link carries the packet to Mumbai, the data center internet link carries it again to the cloud, and the reply makes the same trip in reverse. Latency grows, data center bandwidth is consumed, and one branch's video call competes with every other branch's traffic at the hub.</p>

<table class="cmp"><tr><th></th><th>Backhaul (central breakout)</th><th>DIA (local breakout)</th></tr>
<tr><td>Latency to SaaS</td><td>Branch to DC to internet (higher)</td><td>Branch to internet (lowest)</td></tr>
<tr><td>DC internet and WAN bandwidth</td><td>Consumed by every branch</td><td>Saved</td></tr>
<tr><td>Security stack</td><td>One central stack, easy to audit</td><td>Needed at every branch or in the cloud</td></tr>
<tr><td>Public IP seen by the internet</td><td>DC firewall address</td><td>Branch transport address</td></tr>
<tr><td>Typical use</td><td>Regulated traffic, legacy compliance</td><td>Guest Wi-Fi, SaaS, trusted cloud apps</td></tr></table>
<p>Most real networks are <b>hybrid</b>: trusted SaaS and guest traffic break out locally, everything else is still backhauled. You will build both in this module.</p>

<h3>The lab topology: Bharat Retail</h3>
<p>Bharat Retail's data center in Mumbai has the SD-WAN Manager (VMANAGE), Controller (VSMART) and Validator (VBOND) behind the router DCR. The hub WAN Edge <b>E-DC</b> (site 100) has a LAN 10.100.0.0/24 with the firewall <b>DC-FW</b> (10.100.0.2) that translates the whole company to 203.0.113.14 on its way to the internet. The Pune branch WAN Edge <b>E-BR1</b> (site 200, system-ip 10.255.0.21) has the <code>biz-internet</code> transport on GigabitEthernet1 (203.0.113.10), the staff LAN 10.1.10.0/24 on GigabitEthernet3 with <b>STAFF-PC</b> (10.1.10.10), and a guest Wi-Fi 10.1.20.0/24 on GigabitEthernet4 with <b>GUEST-PC</b> (10.1.20.10). The internet is simulated by the router INET, with a test target at 8.8.8.8. Both subnets belong to service VPN 10.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Bharat Retail lab topology with backhaul and DIA paths">
<rect x="10" y="90" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="55" y="110" text-anchor="middle" class="svg-ink" font-size="12">STAFF-PC</text><text x="55" y="126" text-anchor="middle" class="svg-muted" font-size="11">10.1.10.10</text>
<rect x="10" y="170" width="90" height="46" rx="8" fill="#fed7aa"/><text x="55" y="190" text-anchor="middle" class="svg-ink" font-size="12">GUEST-PC</text><text x="55" y="206" text-anchor="middle" class="svg-muted" font-size="11">10.1.20.10</text>
<rect x="150" y="120" width="100" height="56" rx="8" fill="#bae6fd"/><text x="200" y="145" text-anchor="middle" class="svg-ink" font-size="13">E-BR1</text><text x="200" y="163" text-anchor="middle" class="svg-muted" font-size="11">Pune, site 200</text>
<rect x="320" y="110" width="90" height="76" rx="30" fill="#ddd6fe"/><text x="365" y="145" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="365" y="163" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text>
<rect x="500" y="20" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="13">E-DC</text><text x="550" y="63" text-anchor="middle" class="svg-muted" font-size="11">Mumbai, site 100</text>
<rect x="500" y="110" width="100" height="56" rx="8" fill="#fde68a"/><text x="550" y="135" text-anchor="middle" class="svg-ink" font-size="13">DC-FW</text><text x="550" y="153" text-anchor="middle" class="svg-muted" font-size="11">NAT 203.0.113.14</text>
<line x1="100" y1="113" x2="150" y2="140" stroke="#64748b" stroke-width="2"/><line x1="100" y1="193" x2="150" y2="158" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="148" x2="320" y2="148" stroke="#16a34a" stroke-width="3"/><text x="285" y="140" text-anchor="middle" class="svg-accent" font-size="11">DIA</text>
<path d="M200 120 C 240 40, 420 30, 500 48" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="42" text-anchor="middle" class="svg-accent" font-size="11">overlay tunnel (backhaul)</text>
<line x1="550" y1="76" x2="550" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="140" x2="410" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Today: staff internet goes E-BR1, tunnel, E-DC, DC-FW, INET. After DIA: E-BR1 straight to INET.</text>
</svg><p class="cap">Dashed blue is the overlay (backhaul) path; solid green is the local breakout.</p></div>

<div class="eg"><p><b>Worked example.</b> A Pune user opens Microsoft 365. With backhaul, the packet goes Pune to Mumbai over the tunnel (say 25 ms), through DC-FW, out to the internet and to the nearest SaaS front door. The reply returns the same way. With DIA the packet leaves Pune directly, and a SaaS endpoint near Pune can be reached in a few milliseconds. Meanwhile the Mumbai internet link no longer carries Pune's video calls.</p></div>

<div class="note"><p><b>Names.</b> We use the current terms: WAN Edge (IOS XE, earlier cEdge), SD-WAN Manager (vManage), SD-WAN Controller (vSmart), SD-WAN Validator (vBond). The lab devices keep their short names VMANAGE, VSMART and VBOND.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking DIA is a switch you flip. DIA needs three things: (1) NAT on the transport, (2) a way to steer traffic to it (a NAT route or a data policy), and (3) security at the branch. The next chapters build them in that order.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which term describes sending branch internet traffic to the data center before it leaves?" is <b>backhaul</b>. DIA is local breakout. Neither affects site-to-site traffic, which always uses the overlay.</p></div>

<div class="scn"><h4>Microsoft 365 is slow in Pune</h4><p>Bharat Retail's Pune staff complained that Microsoft 365 meetings froze every afternoon. A traceroute from STAFF-PC to the internet showed hops through Mumbai and the DC firewall, and the DC internet link was nearly full because 40 branches backhauled their video calls. The team enabled DIA for the Pune VPN 10 on the branch transport. Meeting quality improved at once, and the Mumbai link dropped to a third of its former load.</p><p><b>Lesson:</b> backhaul is a design choice with a cost. Measure it, then decide per branch and per application.</p></div>

<div class="iv"><p class="q">"What is the difference between backhaul and DIA, and why would you choose DIA?"</p><p>Backhaul sends all internet traffic over the overlay to a central site with one security stack. DIA breaks traffic out at the branch transport after NAT. Choose DIA for lower latency to SaaS and cloud, to save hub bandwidth, and to keep guest traffic away from the corporate backbone. Mention the price: security must now exist at the branch or in the cloud, and a hybrid design is common.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backhaul sends internet traffic to the DC first; DIA breaks it out locally at the branch.</li>
<li>DIA lowers latency and saves hub bandwidth but moves the security burden to the branch or the cloud.</li>
<li>Site-to-site traffic keeps using the overlay in both designs.</li>
<li>DIA = NAT on the transport + steering (route or policy) + branch security.</li>
<li>Most real designs are hybrid: guests and trusted SaaS local, everything else backhauled.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki modern branches internet traffic data center ko bhejna band kyun karti hain, aur Catalyst SD-WAN ek WAN Edge ko use seedha local internet link se bahar bhejne kaise deta hai. Aap transport interface par NAT on karoge, NAT route se Direct Internet Access (DIA) enable karoge, guests ke liye selective DIA data policy banaoge, safety nets (fallback aur trackers) jodoge, branch ko secure karoge, DNS sahi handle karoge, Cloud OnRamp for SaaS aur Multicloud samjhoge, aur "configured lekin dead" DIA troubleshoot karoge. Is module ki teen labs (NAT route, selective DIA, aur DIA ticket) step by step walk-through ki gayi hain. <b>Prerequisites:</b> aapko SD-WAN components, VPN 0 (transport) versus service VPNs, TLOCs aur colors, aur centralized data policy kya hai (pichhla module) pata hona chahiye.</p>

<h3>Ek analogy se shuru karo: head office se courier ya seedha</h3>
<p>Ek company socho jahan har branch ko apne parcels Mumbai head office ko post karne padte hain, aur head office unhe final customer ko post karta hai. Pune ki usi gali ke customer ka parcel Mumbai jaakar wapas aata hai. Yeh <b>backhaul</b> hai (centralized internet breakout bhi kehte hain). Ab socho har branch local courier ko seedha parcel de sakti hai. Yeh <b>Direct Internet Access</b> hai (local internet breakout). Head office ko ab bhi internal mail milti hai (overlay par site-to-site traffic), lekin customer parcels chhote raaste se jaate hain.</p>

<h3>Backhaul ab kaafi kyun nahi hai</h3>
<p>Classic hub-and-spoke WAN mein saara internet traffic data center tak le jaaya jaata hai, ek bade firewall stack se inspect hota hai, aur ek internet link se bahar jaata hai. Jab applications data center mein thi tab yeh theek tha. Aaj zyada traffic SaaS (Microsoft 365, Webex, Salesforce) aur public cloud ko jaata hai. Backhaul ka matlab hai branch link packet ko Mumbai le jaata hai, data center internet link use phir cloud tak le jaata hai, aur reply ulta wahi safar karta hai. Latency badhti hai, data center bandwidth khapti hai, aur ek branch ki video call hub par har doosri branch ke traffic se compete karti hai.</p>

<table class="cmp"><tr><th></th><th>Backhaul (central breakout)</th><th>DIA (local breakout)</th></tr>
<tr><td>SaaS tak latency</td><td>Branch se DC se internet (zyada)</td><td>Branch se internet (sabse kam)</td></tr>
<tr><td>DC internet aur WAN bandwidth</td><td>Har branch khaati hai</td><td>Bachti hai</td></tr>
<tr><td>Security stack</td><td>Ek central stack, audit aasaan</td><td>Har branch par ya cloud mein chahiye</td></tr>
<tr><td>Internet ko dikhne wala public IP</td><td>DC firewall address</td><td>Branch transport address</td></tr>
<tr><td>Typical use</td><td>Regulated traffic, legacy compliance</td><td>Guest Wi-Fi, SaaS, trusted cloud apps</td></tr></table>
<p>Zyada tar real networks <b>hybrid</b> hote hain: trusted SaaS aur guest traffic local breakout karta hai, baaki sab abhi bhi backhaul hota hai. Is module mein aap dono banaoge.</p>

<h3>Lab topology: Bharat Retail</h3>
<p>Bharat Retail ke Mumbai data center mein SD-WAN Manager (VMANAGE), Controller (VSMART) aur Validator (VBOND) router DCR ke peeche hain. Hub WAN Edge <b>E-DC</b> (site 100) ka LAN 10.100.0.0/24 hai jisme firewall <b>DC-FW</b> (10.100.0.2) hai jo poori company ko internet jaate waqt 203.0.113.14 mein translate karta hai. Pune branch ke WAN Edge <b>E-BR1</b> (site 200, system-ip 10.255.0.21) ke paas GigabitEthernet1 par <code>biz-internet</code> transport (203.0.113.10) hai, GigabitEthernet3 par staff LAN 10.1.10.0/24 jisme <b>STAFF-PC</b> (10.1.10.10) hai, aur GigabitEthernet4 par guest Wi-Fi 10.1.20.0/24 jisme <b>GUEST-PC</b> (10.1.20.10) hai. Internet ko router INET simulate karta hai, jisme test target 8.8.8.8 hai. Dono subnets service VPN 10 mein hain.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Bharat Retail lab topology backhaul aur DIA paths ke saath">
<rect x="10" y="90" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="55" y="110" text-anchor="middle" class="svg-ink" font-size="12">STAFF-PC</text><text x="55" y="126" text-anchor="middle" class="svg-muted" font-size="11">10.1.10.10</text>
<rect x="10" y="170" width="90" height="46" rx="8" fill="#fed7aa"/><text x="55" y="190" text-anchor="middle" class="svg-ink" font-size="12">GUEST-PC</text><text x="55" y="206" text-anchor="middle" class="svg-muted" font-size="11">10.1.20.10</text>
<rect x="150" y="120" width="100" height="56" rx="8" fill="#bae6fd"/><text x="200" y="145" text-anchor="middle" class="svg-ink" font-size="13">E-BR1</text><text x="200" y="163" text-anchor="middle" class="svg-muted" font-size="11">Pune, site 200</text>
<rect x="320" y="110" width="90" height="76" rx="30" fill="#ddd6fe"/><text x="365" y="145" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="365" y="163" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text>
<rect x="500" y="20" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="13">E-DC</text><text x="550" y="63" text-anchor="middle" class="svg-muted" font-size="11">Mumbai, site 100</text>
<rect x="500" y="110" width="100" height="56" rx="8" fill="#fde68a"/><text x="550" y="135" text-anchor="middle" class="svg-ink" font-size="13">DC-FW</text><text x="550" y="153" text-anchor="middle" class="svg-muted" font-size="11">NAT 203.0.113.14</text>
<line x1="100" y1="113" x2="150" y2="140" stroke="#64748b" stroke-width="2"/><line x1="100" y1="193" x2="150" y2="158" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="148" x2="320" y2="148" stroke="#16a34a" stroke-width="3"/><text x="285" y="140" text-anchor="middle" class="svg-accent" font-size="11">DIA</text>
<path d="M200 120 C 240 40, 420 30, 500 48" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="42" text-anchor="middle" class="svg-accent" font-size="11">overlay tunnel (backhaul)</text>
<line x1="550" y1="76" x2="550" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="140" x2="410" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Aaj: staff internet E-BR1, tunnel, E-DC, DC-FW, INET se jaata hai. DIA ke baad: E-BR1 seedha INET.</text>
</svg><p class="cap">Dashed neela overlay (backhaul) path hai; solid hara local breakout hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Pune ka user Microsoft 365 kholta hai. Backhaul mein packet Pune se Mumbai tunnel par jaata hai (maan lo 25 ms), DC-FW se guzarta hai, internet par nikalta hai aur sabse paas ke SaaS front door tak jaata hai. Reply wahi raasta wapas leta hai. DIA mein packet Pune se seedha nikalta hai, aur Pune ke paas ka SaaS endpoint kuch milliseconds mein mil jaata hai. Saath hi Mumbai internet link ab Pune ki video calls nahi uthata.</p></div>

<div class="note"><p><b>Names.</b> Hum current terms use karte hain: WAN Edge (IOS XE, pehle cEdge), SD-WAN Manager (vManage), SD-WAN Controller (vSmart), SD-WAN Validator (vBond). Lab devices apne chhote naam VMANAGE, VSMART aur VBOND rakhte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> DIA ko ek switch samajhna jo flip karna hai. DIA ko teen cheezein chahiye: (1) transport par NAT, (2) traffic ko wahan steer karne ka tareeka (NAT route ya data policy), aur (3) branch par security. Agle chapters inhe isi order mein banate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Branch ka internet traffic bahar jaane se pehle data center bhejne ko kya kehte hain?" jawab <b>backhaul</b>. DIA local breakout hai. Dono mein site-to-site traffic par koi asar nahi, woh hamesha overlay use karta hai.</p></div>

<div class="scn"><h4>Pune mein Microsoft 365 slow hai</h4><p>Bharat Retail ke Pune staff ne shikayat ki ki Microsoft 365 meetings roz dopahar freeze hoti hain. STAFF-PC se internet ka traceroute Mumbai aur DC firewall ke hops dikhata tha, aur DC internet link lagbhag full tha kyunki 40 branches apni video calls backhaul kar rahi thi. Team ne Pune ke VPN 10 ke liye branch transport par DIA enable kiya. Meeting quality turant behtar hui, aur Mumbai link ka load pehle ka ek tihai reh gaya.</p><p><b>Lesson:</b> backhaul ek design choice hai jiski keemat hoti hai. Measure karo, phir per branch aur per application decide karo.</p></div>

<div class="iv"><p class="q">"Backhaul aur DIA mein kya difference hai, aur DIA kyun chunoge?"</p><p>Backhaul saara internet traffic overlay par central site tak bhejta hai jahan ek security stack hai. DIA traffic ko branch transport par NAT ke baad break out karta hai. SaaS aur cloud ki kam latency, hub bandwidth bachane, aur guest traffic ko corporate backbone se door rakhne ke liye DIA chuno. Keemat batao: security ab branch par ya cloud mein honi chahiye, aur hybrid design common hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backhaul internet traffic ko pehle DC bhejta hai; DIA use branch par locally break out karta hai.</li>
<li>DIA latency kam karta hai aur hub bandwidth bachata hai lekin security ka bojh branch ya cloud par daal deta hai.</li>
<li>Dono designs mein site-to-site traffic overlay hi use karta hai.</li>
<li>DIA = transport par NAT + steering (route ya policy) + branch security.</li>
<li>Zyada tar real designs hybrid hote hain: guests aur trusted SaaS local, baaki sab backhaul.</li>
</ul></div>
`}};export{e as default};