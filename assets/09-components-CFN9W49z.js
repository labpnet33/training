var e={id:`components`,h:{en:`Network components and their roles`,hi:`Network components aur unke roles`},body:{en:`
<p>Picture a big corporate campus. There are security guards at the main gate, receptionists on every floor who direct visitors to the right desk, corridors and lifts that connect floors, a control room that manages all the Wi-Fi hotspots, the employees themselves, and the service rooms (canteen, mail room, records). Every network diagram you will see in your career has the same cast: <b>firewalls</b>, <b>switches</b>, <b>routers</b>, <b>access points</b> and <b>controllers</b>, <b>endpoints</b> and <b>servers</b>. The CCNA blueprint asks you to explain the role and function of each.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Typical enterprise components">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Internet / WAN</text>
<rect x="250" y="62" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Edge router</text>
<rect x="250" y="114" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">NGFW / IPS</text>
<rect x="250" y="166" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="189" text-anchor="middle" class="svg-ink" font-size="13">L3 core switch</text>
<rect x="60" y="222" width="140" height="36" rx="8" fill="#bae6fd"/><text x="130" y="245" text-anchor="middle" class="svg-ink" font-size="13">L2 access (PoE)</text>
<rect x="440" y="222" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="510" y="245" text-anchor="middle" class="svg-ink" font-size="13">Servers</text>
<rect x="470" y="166" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="540" y="189" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<text x="130" y="285" text-anchor="middle" class="svg-muted" font-size="12">APs, phones, PCs, cameras</text>
<line x1="320" y1="46" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="320" y2="114" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="166" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="202" x2="150" y2="222" stroke="#64748b" stroke-width="2"/><line x1="360" y1="202" x2="490" y2="222" stroke="#64748b" stroke-width="2"/><line x1="390" y1="184" x2="470" y2="184" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="258" x2="130" y2="270" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A small enterprise: every component the CCNA blueprint lists appears once.</p></div>

<h3>Routers</h3>
<p>A router connects <b>different IP networks</b> and forwards packets between them using its <b>routing table</b> (Layer 3). It separates broadcast domains: an ARP broadcast never crosses a router. Routers connect the LAN to the WAN and internet, choose best paths with routing protocols such as OSPF, and often provide edge services such as NAT, DHCP, VPN termination and QoS. R1 in our lab is a router between 10.1.1.0/24 and 203.0.113.0/24.</p>

<h3>Layer 2 and Layer 3 switches</h3>
<p>A <b>Layer 2 switch</b> connects devices in the same LAN, learns MAC addresses into its MAC address table, forwards frames by destination MAC, floods unknowns and broadcasts, and supports VLANs to split one switch into several broadcast domains. Each switch port is its own <b>collision domain</b>, and full duplex removes collisions entirely. A <b>Layer 3 switch</b> (multilayer switch) does all that and also <b>routes between VLANs</b> in hardware using SVIs (switched virtual interfaces) or routed ports. It is the usual distribution and core device in a campus because it routes at wire speed with many ports, while a router offers more WAN interfaces and edge features.</p>

<h3>Next-generation firewalls and IPS</h3>
<p>A <b>firewall</b> enforces a security policy between zones (inside, outside, DMZ). A classic <b>stateful</b> firewall tracks each connection (Layer 3 and 4) and automatically allows return traffic for sessions started from the inside. A <b>next-generation firewall (NGFW)</b> adds application visibility and control (it can permit "Webex" and block "BitTorrent" even on the same port), user identity, URL filtering, malware protection and an integrated IPS. An <b>IPS</b> (intrusion prevention system) sits <b>inline</b> and drops traffic that matches attack signatures or anomalies; an <b>IDS</b> only watches a copy of the traffic (from a SPAN port or tap) and alerts.</p>

<h3>Access points and controllers</h3>
<p>An <b>access point (AP)</b> bridges wireless clients (IEEE 802.11) onto the wired Ethernet network. An <b>autonomous</b> AP is configured one by one. In larger networks <b>lightweight</b> APs are managed centrally by a <b>wireless LAN controller (WLC)</b>: they build <b>CAPWAP</b> tunnels to it (UDP 5246 for control, 5247 for data), and the WLC pushes SSIDs, security, radio channels and power, and handles roaming. More broadly, "controllers" also include <b>SDN controllers</b> such as Cisco Catalyst Center or cloud dashboards, which manage many devices through APIs; you will meet them in the automation modules.</p>

<h3>Endpoints and servers</h3>
<p><b>Endpoints</b> are the devices people and things use: PCs, laptops, phones, IP phones, printers, cameras, IoT sensors. They are the source and destination of most traffic and the most common entry point for attacks. <b>Servers</b> provide services to clients: web, DNS, DHCP, email, file, database, authentication. In the client-server model the client starts the conversation to a server listening on a well-known port, exactly like PC1 and SRV on port 80.</p>

<h3>PoE: power over the data cable</h3>
<p><b>Power over Ethernet</b> lets a switch (the <b>PSE</b>, power sourcing equipment) power a device (the <b>PD</b>, powered device) over the same twisted-pair cable, so APs, phones and cameras need no local socket. The switch first detects a valid PD, then classifies how much power it needs.</p>
<table class="cmp"><tr><th>Standard</th><th>Name</th><th>Power at the switch port</th><th>Typical device</th></tr>
<tr><td>802.3af</td><td>PoE (Type 1)</td><td>15.4 W</td><td>IP phone</td></tr>
<tr><td>802.3at</td><td>PoE+ (Type 2)</td><td>30 W</td><td>Wi-Fi 6 AP, PTZ camera</td></tr>
<tr><td>802.3bt</td><td>Type 3 / Type 4</td><td>60 W / 90 W</td><td>High-end AP, thin client, lighting</td></tr>
</table>
<p>Each switch has a <b>power budget</b>; when it is used up, new PDs do not get power.</p>
<pre class="code"><span class="c">! How much PoE budget is left, and what is each port drawing?</span>
SW1# show power inline</pre>
<pre class="out">Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
<span class="hl">1           370.0       37.0       333.0</span>
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         7.0     IP Phone 8845       2     30.0
Gi1/0/2   auto   on         30.0    C9120AXI-B          4     30.0
Gi1/0/3   auto   off        0.0     n/a                 n/a   30.0</pre>

<div class="eg"><p><b>Worked example.</b> A 48-port access switch has a 740 W PoE budget. The design adds 40 phones at class 2 (7 W allocated) = 280 W and 8 Wi-Fi 6 APs needing PoE+ (30 W) = 240 W. Total 520 W, leaving 220 W, enough for seven more 30 W cameras. Add a ninth AP and three more cameras later and you would be at 640 W: still fine, but track it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling every switch "Layer 3" because it has a management IP. Thinking an IDS blocks attacks (it only alerts; an IPS is inline and blocks). Assuming any PoE port can power any device: a PoE+ AP on an 802.3af port may boot with reduced radios or not at all.</p></div>

<div class="exam"><p><b>Exam traps.</b> Routers separate broadcast domains; switches separate collision domains. The WLC manages lightweight APs over CAPWAP. NGFW = stateful firewall + application awareness + IPS + more. PSE supplies power, PD receives it. 802.3af 15.4 W, 802.3at 30 W, 802.3bt up to 90 W.</p></div>

<div class="scn"><h4>New APs that would not come up</h4><p>A school replaced old access points with Wi-Fi 6 models. Half of them stayed dark. <code>show power inline</code> on the older access switch showed "Available 370.0, Used 368.0", and the log showed power-denied messages for the new ports. The old switch's budget, planned for 15 W phones, could not also feed 30 W APs. The team moved the APs to a PoE+ switch with a larger budget (and added a second power supply where the model supported it), and every AP joined the controller.</p><p><b>Lesson:</b> PoE is a budget, not a feature tick-box. Check the class each device needs and the switch's total budget before a rollout.</p></div>

<div class="iv"><p class="q">"What is the difference between a Layer 2 switch, a Layer 3 switch and a router?"</p><p>L2 switch: forwards frames by MAC inside a VLAN, one broadcast domain per VLAN. L3 switch: adds hardware routing between VLANs with SVIs, used in campus distribution and core. Router: routes between networks, with WAN interfaces and edge services such as NAT, VPN and deep QoS. Add that routers and L3 switches both stop broadcasts, and give a design example: "L3 switches in the core, routers at the WAN edge, NGFW at the internet edge".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router: routes between IP networks and separates broadcast domains; also NAT, VPN, DHCP at the edge.</li>
<li>L2 switch forwards by MAC; L3 switch also routes between VLANs in hardware.</li>
<li>Stateful firewall tracks sessions; NGFW adds application, user and URL control plus IPS; IPS is inline, IDS only alerts.</li>
<li>APs bridge Wi-Fi to Ethernet; a WLC manages lightweight APs over CAPWAP.</li>
<li>PoE: PSE powers PD; 802.3af 15.4 W, 802.3at 30 W, 802.3bt 60/90 W; watch the switch's budget.</li>
</ul></div>
`,hi:`
<p>Ek bada corporate campus socho. Main gate par security guards hain, har floor par receptionists jo visitors ko sahi desk tak bhejte hain, corridors aur lifts jo floors ko jodte hain, ek control room jo saare Wi-Fi hotspots manage karta hai, khud employees, aur service rooms (canteen, mail room, records). Aapke career mein jo bhi network diagram dikhega usmein yahi cast hoga: <b>firewalls</b>, <b>switches</b>, <b>routers</b>, <b>access points</b> aur <b>controllers</b>, <b>endpoints</b> aur <b>servers</b>. CCNA blueprint aapse har ek ka role aur function explain karne ko kehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Typical enterprise components">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Internet / WAN</text>
<rect x="250" y="62" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Edge router</text>
<rect x="250" y="114" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">NGFW / IPS</text>
<rect x="250" y="166" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="189" text-anchor="middle" class="svg-ink" font-size="13">L3 core switch</text>
<rect x="60" y="222" width="140" height="36" rx="8" fill="#bae6fd"/><text x="130" y="245" text-anchor="middle" class="svg-ink" font-size="13">L2 access (PoE)</text>
<rect x="440" y="222" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="510" y="245" text-anchor="middle" class="svg-ink" font-size="13">Servers</text>
<rect x="470" y="166" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="540" y="189" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<text x="130" y="285" text-anchor="middle" class="svg-muted" font-size="12">APs, phones, PCs, cameras</text>
<line x1="320" y1="46" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="320" y2="114" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="166" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="202" x2="150" y2="222" stroke="#64748b" stroke-width="2"/><line x1="360" y1="202" x2="490" y2="222" stroke="#64748b" stroke-width="2"/><line x1="390" y1="184" x2="470" y2="184" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="258" x2="130" y2="270" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek chhota enterprise: CCNA blueprint ka har component ek baar dikhta hai.</p></div>

<h3>Routers</h3>
<p>Router <b>alag alag IP networks</b> ko jodta hai aur apni <b>routing table</b> (Layer 3) use karke unke beech packets forward karta hai. Yeh broadcast domains alag karta hai: ARP broadcast kabhi router paar nahi karta. Routers LAN ko WAN aur internet se jodte hain, OSPF jaise routing protocols se best paths chunte hain, aur aksar NAT, DHCP, VPN termination aur QoS jaisi edge services dete hain. Hamare lab mein R1 10.1.1.0/24 aur 203.0.113.0/24 ke beech ek router hai.</p>

<h3>Layer 2 aur Layer 3 switches</h3>
<p><b>Layer 2 switch</b> same LAN ke devices ko jodta hai, MAC addresses ko apni MAC address table mein seekhta hai, frames ko destination MAC se forward karta hai, unknowns aur broadcasts flood karta hai, aur VLANs support karta hai taaki ek switch kai broadcast domains mein bant jaaye. Har switch port apna <b>collision domain</b> hai, aur full duplex collisions poori tarah khatam kar deta hai. <b>Layer 3 switch</b> (multilayer switch) yeh sab karta hai aur SVIs (switched virtual interfaces) ya routed ports use karke hardware mein <b>VLANs ke beech route</b> bhi karta hai. Campus mein yeh aam distribution aur core device hai kyunki yeh bahut saare ports ke saath wire speed par route karta hai, jabki router zyada WAN interfaces aur edge features deta hai.</p>

<h3>Next-generation firewalls aur IPS</h3>
<p><b>Firewall</b> zones (inside, outside, DMZ) ke beech security policy enforce karta hai. Classic <b>stateful</b> firewall har connection track karta hai (Layer 3 aur 4) aur inside se shuru hue sessions ka return traffic apne aap allow karta hai. <b>Next-generation firewall (NGFW)</b> application visibility aur control jodta hai (woh same port par bhi "Webex" permit aur "BitTorrent" block kar sakta hai), user identity, URL filtering, malware protection aur integrated IPS. <b>IPS</b> (intrusion prevention system) <b>inline</b> baithta hai aur attack signatures ya anomalies se match hone wala traffic drop karta hai; <b>IDS</b> sirf traffic ki copy dekhta hai (SPAN port ya tap se) aur alert karta hai.</p>

<h3>Access points aur controllers</h3>
<p><b>Access point (AP)</b> wireless clients (IEEE 802.11) ko wired Ethernet network par bridge karta hai. <b>Autonomous</b> AP ek ek karke configure hota hai. Bade networks mein <b>lightweight</b> APs ko <b>wireless LAN controller (WLC)</b> centrally manage karta hai: woh uske saath <b>CAPWAP</b> tunnels banate hain (control ke liye UDP 5246, data ke liye 5247), aur WLC SSIDs, security, radio channels aur power push karta hai, aur roaming handle karta hai. Aur bade roop mein, "controllers" mein <b>SDN controllers</b> bhi aate hain jaise Cisco Catalyst Center ya cloud dashboards, jo APIs se bahut saare devices manage karte hain; aap inse automation modules mein miloge.</p>

<h3>Endpoints aur servers</h3>
<p><b>Endpoints</b> woh devices hain jo log aur cheezein use karte hain: PCs, laptops, phones, IP phones, printers, cameras, IoT sensors. Zyada tar traffic ka source aur destination yahi hote hain aur attacks ka sabse common entry point bhi. <b>Servers</b> clients ko services dete hain: web, DNS, DHCP, email, file, database, authentication. Client-server model mein client well-known port par listen kar rahe server se conversation shuru karta hai, bilkul port 80 par PC1 aur SRV ki tarah.</p>

<h3>PoE: data cable par power</h3>
<p><b>Power over Ethernet</b> switch (<b>PSE</b>, power sourcing equipment) ko usi twisted-pair cable par ek device (<b>PD</b>, powered device) ko power dene deta hai, isliye APs, phones aur cameras ko local socket nahi chahiye. Switch pehle valid PD detect karta hai, phir classify karta hai ki use kitni power chahiye.</p>
<table class="cmp"><tr><th>Standard</th><th>Naam</th><th>Switch port par power</th><th>Typical device</th></tr>
<tr><td>802.3af</td><td>PoE (Type 1)</td><td>15.4 W</td><td>IP phone</td></tr>
<tr><td>802.3at</td><td>PoE+ (Type 2)</td><td>30 W</td><td>Wi-Fi 6 AP, PTZ camera</td></tr>
<tr><td>802.3bt</td><td>Type 3 / Type 4</td><td>60 W / 90 W</td><td>High-end AP, thin client, lighting</td></tr>
</table>
<p>Har switch ka ek <b>power budget</b> hota hai; jab woh khatam ho jaata hai, naye PDs ko power nahi milti.</p>
<pre class="code"><span class="c">! Kitna PoE budget bacha hai, aur har port kitna le raha hai?</span>
SW1# show power inline</pre>
<pre class="out">Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
<span class="hl">1           370.0       37.0       333.0</span>
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         7.0     IP Phone 8845       2     30.0
Gi1/0/2   auto   on         30.0    C9120AXI-B          4     30.0
Gi1/0/3   auto   off        0.0     n/a                 n/a   30.0</pre>

<div class="eg"><p><b>Worked example.</b> Ek 48-port access switch ka PoE budget 740 W hai. Design mein 40 phones class 2 par (7 W allocated) = 280 W aur 8 Wi-Fi 6 APs jinhe PoE+ (30 W) chahiye = 240 W. Total 520 W, bachte hain 220 W, jo saat aur 30 W cameras ke liye kaafi hai. Baad mein ek naunva AP aur teen aur cameras jodo to aap 640 W par hoge: ab bhi theek, lekin track karte raho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Har switch ko "Layer 3" kehna kyunki uska management IP hai. Sochna ki IDS attacks block karta hai (woh sirf alert karta hai; IPS inline hai aur block karta hai). Maan lena ki koi bhi PoE port koi bhi device chala sakta hai: 802.3af port par PoE+ AP kam radios ke saath boot ho sakta hai ya bilkul nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Routers broadcast domains alag karte hain; switches collision domains alag karte hain. WLC lightweight APs ko CAPWAP par manage karta hai. NGFW = stateful firewall + application awareness + IPS + aur bhi. PSE power deta hai, PD leta hai. 802.3af 15.4 W, 802.3at 30 W, 802.3bt 90 W tak.</p></div>

<div class="scn"><h4>Naye APs jo up nahi ho rahe the</h4><p>Ek school ne purane access points ko Wi-Fi 6 models se badla. Aadhe andhere mein hi rahe. Purane access switch par <code>show power inline</code> ne "Available 370.0, Used 368.0" dikhaya, aur log mein naye ports ke liye power-denied messages the. Purane switch ka budget, jo 15 W phones ke liye plan hua tha, 30 W APs ko bhi nahi chala sakta tha. Team ne APs ko bade budget wale PoE+ switch par shift kiya (aur jahan model support karta tha wahan doosri power supply lagayi), aur har AP controller se join ho gaya.</p><p><b>Seekh:</b> PoE ek budget hai, feature ka tick-box nahi. Rollout se pehle har device ki zaroori class aur switch ka total budget check karo.</p></div>

<div class="iv"><p class="q">"Layer 2 switch, Layer 3 switch aur router mein kya farak hai?"</p><p>L2 switch: VLAN ke andar MAC se frames forward karta hai, har VLAN ek broadcast domain. L3 switch: SVIs ke saath VLANs ke beech hardware routing jodta hai, campus distribution aur core mein use hota hai. Router: networks ke beech route karta hai, WAN interfaces aur NAT, VPN aur deep QoS jaisi edge services ke saath. Jodo ki routers aur L3 switches dono broadcasts rokte hain, aur ek design example do: "core mein L3 switches, WAN edge par routers, internet edge par NGFW".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router: IP networks ke beech route karta hai aur broadcast domains alag karta hai; edge par NAT, VPN, DHCP bhi.</li>
<li>L2 switch MAC se forward karta hai; L3 switch hardware mein VLANs ke beech route bhi karta hai.</li>
<li>Stateful firewall sessions track karta hai; NGFW application, user aur URL control plus IPS jodta hai; IPS inline hai, IDS sirf alert karta hai.</li>
<li>APs Wi-Fi ko Ethernet se bridge karte hain; WLC lightweight APs ko CAPWAP par manage karta hai.</li>
<li>PoE: PSE PD ko power deta hai; 802.3af 15.4 W, 802.3at 30 W, 802.3bt 60/90 W; switch ka budget dekho.</li>
</ul></div>
`}};export{e as default};