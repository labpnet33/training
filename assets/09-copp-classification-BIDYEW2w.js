var e={id:`copp-classification`,h:{en:`CoPP classification: management, routing protocols and the host subinterface`,hi:`CoPP classification: management, routing protocols aur host subinterface`},body:{en:`
<p>The CEO's assistant from chapter 1 keeps a short list of visitor types: board members (always let in, never make them wait), managers with appointments (let in, but only a few per hour), salespeople (maybe one a day), and "everybody else" (politely refused when the diary is full). If the assistant's list does not mention a type of visitor, that visitor lands in "everybody else". Now imagine the list forgot the board members. That is almost every CoPP outage you will ever troubleshoot.</p>

<h3>A quick reminder from ENCOR</h3>
<p><b>CoPP</b> (control plane policing) is an MQC policy attached to the <code>control-plane</code> in the input direction. It sees only packets that are <b>punted</b> to the route processor: packets addressed to the router, routing protocol packets, packets with IP options or TTL expiry, ARP, and so on. It never sees transit traffic that CEF forwards in the data plane. Classes are checked <b>top to bottom, first match wins</b>, and everything unmatched lands in <code>class-default</code>.</p>

<h3>Writing the classes correctly</h3>
<p>Classification is usually done with extended ACLs behind <code>match access-group</code>. Remember that in CoPP an ACL <code>permit</code> means "belongs to this class", and a <code>deny</code> means "not this class, try the next". It never means "drop"; the drop decision is the policer's.</p>
<table class="cmp"><tr><th>Traffic</th><th>What to match</th><th>Gotcha</th></tr>
<tr><td>Telnet</td><td><code>tcp any any eq telnet</code> (TCP 23)</td><td>Usually placed in an "undesired" class and dropped</td></tr>
<tr><td>SSH</td><td><code>tcp MGMT-SUBNET any eq 22</code></td><td>The source subnet must be exact</td></tr>
<tr><td>HTTP / HTTPS</td><td><code>tcp MGMT any eq www</code>, <code>eq 443</code></td><td>Only if the router's web server or RESTCONF is used</td></tr>
<tr><td>SNMP</td><td><code>udp NMS any eq snmp</code> (UDP 161)</td><td>Traps (UDP 162) are sent by the router, not received</td></tr>
<tr><td>OSPF</td><td><code>ospf any any</code> (IP protocol 89)</td><td>Hellos go to 224.0.0.5/6 and to unicast neighbours</td></tr>
<tr><td>EIGRP</td><td><code>eigrp any any</code> (IP protocol 88)</td><td>224.0.0.10 plus unicast updates and static neighbours</td></tr>
<tr><td>BGP</td><td><code>tcp any any eq bgp</code> <b>and</b> <code>tcp any eq bgp any</code></td><td>TCP 179 can be the destination or the source port, depending on who opened the session</td></tr></table>

<pre class="code">ip access-list extended ACL-COPP-ROUTING
 permit ospf any any
 permit eigrp any any
 permit tcp any any eq bgp
 permit tcp any eq bgp any
ip access-list extended ACL-COPP-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq 22
 permit tcp 10.99.0.0 0.0.0.255 any eq 443
 permit udp host 10.99.0.20 any eq snmp
ip access-list extended ACL-COPP-UNDESIRED
 permit tcp any any eq telnet
 permit tcp any any eq www
!
class-map match-all CP-ROUTING
 match access-group name ACL-COPP-ROUTING
class-map match-all CP-MGMT
 match access-group name ACL-COPP-MGMT
class-map match-all CP-UNDESIRED
 match access-group name ACL-COPP-UNDESIRED
class-map match-any CP-ICMP
 match protocol icmp
!
policy-map COPP
 class CP-ROUTING
  police 512000 conform-action transmit exceed-action transmit
 class CP-MGMT
  police 256000 conform-action transmit exceed-action drop
 class CP-UNDESIRED
  drop
 class CP-ICMP
  police 64000 conform-action transmit exceed-action drop
 class class-default
  police 64000 conform-action transmit exceed-action drop
control-plane
 service-policy input COPP</pre>
<p>Order matters here: CP-UNDESIRED is placed <b>after</b> CP-MGMT, so if you ever permit HTTP (TCP 80) from the management subnet in ACL-COPP-MGMT, that management traffic is matched first and is not dropped. Put it the other way round and your permitted management flow would be killed by the undesired class.</p>

<h3>The control-plane host subinterface</h3>
<p>The aggregate <code>control-plane</code> policy above sees every punted packet. <b>Control Plane Protection</b> (CPPr) splits the control plane into three subinterfaces, each with its own policy:</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control plane subinterfaces">
<rect x="10" y="90" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="13">Punted</text><text x="70" y="129" text-anchor="middle" class="svg-muted" font-size="12">packets</text>
<rect x="200" y="20" width="200" height="50" rx="8" fill="#bae6fd"/><text x="300" y="42" text-anchor="middle" class="svg-ink" font-size="13">control-plane host</text><text x="300" y="59" text-anchor="middle" class="svg-muted" font-size="12">to router IPs: SSH, SNMP, iBGP</text>
<rect x="200" y="90" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="300" y="112" text-anchor="middle" class="svg-ink" font-size="13">control-plane transit</text><text x="300" y="129" text-anchor="middle" class="svg-muted" font-size="12">software-switched transit</text>
<rect x="200" y="160" width="200" height="50" rx="8" fill="#fde68a"/><text x="300" y="182" text-anchor="middle" class="svg-ink" font-size="13">control-plane cef-exception</text><text x="300" y="199" text-anchor="middle" class="svg-muted" font-size="12">ARP, OSPF, eBGP, LDP, L2</text>
<rect x="470" y="90" width="160" height="50" rx="8" fill="#fed7aa"/><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="13">Route processor</text><text x="550" y="129" text-anchor="middle" class="svg-muted" font-size="12">CPU</text>
<line x1="130" y1="110" x2="200" y2="45" stroke="#64748b" stroke-width="2"/><line x1="130" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="130" y1="120" x2="200" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="45" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="400" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><line x1="400" y1="185" x2="470" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">CPPr: host, transit and cef-exception subinterfaces, each with its own policy.</p></div>
<ul>
<li><b>host</b>: traffic addressed to one of the router's own IP addresses and terminated there, such as SSH, SNMP and iBGP sessions. Only the host subinterface supports extra features like <b>port filtering</b> (drop packets to closed TCP/UDP ports) and <b>queue thresholds</b>. Management Plane Protection also lives here: <code>control-plane host</code>, then <code>management-interface GigabitEthernet0/2 allow ssh snmp</code> accepts management protocols only on that interface.</li>
<li><b>transit</b>: software-switched transit traffic, for example packets that CEF cannot switch.</li>
<li><b>cef-exception</b>: packets redirected to the CPU by CEF or queued directly by the interface driver. Cisco lists ARP, OSPF, external BGP, LDP and Layer 2 keepalives here.</li>
</ul>
<p>The trap: if you move your routing class to <code>control-plane host</code>, OSPF hellos never reach it, because they are cef-exception traffic. Classify each protocol on the subinterface that really sees it, or keep the aggregate policy.</p>

<div class="eg"><p><b>Worked example: BGP in one direction.</b> R1 has <code>permit tcp any any eq bgp</code> only. Its eBGP neighbour opens the session to R1: packets arrive with destination port 179, they match. But after a reset, R1 opens the session itself: now R1's source port is random and the neighbour's replies arrive with <b>source</b> port 179 and a random destination port. They do not match, fall to class-default and meet a 64 kbps policer, and the session flaps under load. Adding <code>permit tcp any eq bgp any</code> fixes it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting a routing protocol that is in use (OSPF, BFD, HSRP, VRRP, PIM, LDP), so it lands in a tight class-default. Using a typo subnet in the management ACL. Putting <code>drop</code> or a tiny policer in class-default on day one, before you have baselined what really reaches the CPU.</p></div>

<div class="exam"><p><b>Exam trap.</b> A <code>deny</code> in a CoPP class ACL does not drop the packet; it removes it from that class. CoPP applies only to packets punted to the CPU, never to transit traffic forwarded by CEF. BGP needs both port directions.</p></div>

<div class="scn"><h4>SNMP polling gaps every five minutes</h4><p>A monitoring team saw holes in their graphs for one router. SSH and routing were fine. <code>show policy-map control-plane</code> showed the SNMP poller's packets in class-default, which was policed at 32 kbps, with exceeded counters rising exactly at every poll cycle. The ACL for the management class permitted UDP 161 from the old poller address; the poller had moved to a new host. After adding the new address, the SNMP packets were counted in the management class and the gaps disappeared.</p><p><b>Lesson:</b> every management or routing flow must be named in a class; otherwise class-default decides its fate.</p></div>

<div class="iv"><p class="q">"How would you classify BGP, OSPF and SSH in a CoPP policy, and what do you watch out for?"</p><p>Strong answer: extended ACLs behind class-maps. OSPF is IP protocol 89, EIGRP 88; BGP needs TCP 179 as destination and as source, because either peer can open the session. SSH should be limited to the management subnet on TCP 22. Watch the class order (first match wins), that a deny only means "not this class", and that with CPPr, OSPF and eBGP are cef-exception traffic, not host traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CoPP is an input MQC policy on the control plane; it sees only punted traffic.</li>
<li>Match OSPF (89), EIGRP (88) and BGP (TCP 179 both directions); limit SSH, HTTPS and SNMP to management sources.</li>
<li>Classes are evaluated top down; unmatched traffic goes to class-default.</li>
<li>CPPr splits the control plane into host, transit and cef-exception subinterfaces.</li>
<li>OSPF, ARP and eBGP are cef-exception traffic, not host traffic.</li>
</ul></div>
`,hi:`
<p>Chapter 1 wali CEO ki assistant visitor types ki ek chhoti list rakhti hai: board members (hamesha andar, kabhi intezaar nahi), appointment wale managers (andar, par ek ghante mein kuch hi), salespeople (shayad din mein ek), aur "baaki sab" (diary bhari ho to vinamrata se mana). Agar assistant ki list mein kisi visitor type ka zikr nahi, to woh visitor "baaki sab" mein aata hai. Ab socho list board members ko hi bhool gayi. Lagbhag har CoPP outage jo aap kabhi troubleshoot karoge, yahi hai.</p>

<h3>ENCOR se ek chhota reminder</h3>
<p><b>CoPP</b> (control plane policing) ek MQC policy hai jo <code>control-plane</code> par input direction mein lagti hai. Yeh sirf woh packets dekhti hai jo route processor ko <b>punt</b> hote hain: router ko address kiye packets, routing protocol packets, IP options ya TTL expiry wale packets, ARP, waghera. Yeh kabhi woh transit traffic nahi dekhti jo CEF data plane mein forward karta hai. Classes <b>upar se neeche check hoti hain, pehla match jeet-ta hai</b>, aur jo match na ho woh <code>class-default</code> mein aata hai.</p>

<h3>Classes sahi likhna</h3>
<p>Classification aam taur par <code>match access-group</code> ke peeche extended ACLs se hota hai. Yaad rakho CoPP mein ACL <code>permit</code> ka matlab "is class ka hai", aur <code>deny</code> ka matlab "is class ka nahi, agli try karo". Iska matlab kabhi "drop" nahi; drop ka faisla policer ka hai.</p>
<table class="cmp"><tr><th>Traffic</th><th>Kya match karna</th><th>Gotcha</th></tr>
<tr><td>Telnet</td><td><code>tcp any any eq telnet</code> (TCP 23)</td><td>Aam taur par "undesired" class mein rakh kar drop</td></tr>
<tr><td>SSH</td><td><code>tcp MGMT-SUBNET any eq 22</code></td><td>Source subnet bilkul sahi hona chahiye</td></tr>
<tr><td>HTTP / HTTPS</td><td><code>tcp MGMT any eq www</code>, <code>eq 443</code></td><td>Sirf tab jab router ka web server ya RESTCONF use ho</td></tr>
<tr><td>SNMP</td><td><code>udp NMS any eq snmp</code> (UDP 161)</td><td>Traps (UDP 162) router bhejta hai, receive nahi karta</td></tr>
<tr><td>OSPF</td><td><code>ospf any any</code> (IP protocol 89)</td><td>Hellos 224.0.0.5/6 aur unicast neighbours ko jaate hain</td></tr>
<tr><td>EIGRP</td><td><code>eigrp any any</code> (IP protocol 88)</td><td>224.0.0.10 plus unicast updates aur static neighbours</td></tr>
<tr><td>BGP</td><td><code>tcp any any eq bgp</code> <b>aur</b> <code>tcp any eq bgp any</code></td><td>TCP 179 destination ya source port ho sakta hai, is par nirbhar ki session kisne khola</td></tr></table>

<pre class="code">ip access-list extended ACL-COPP-ROUTING
 permit ospf any any
 permit eigrp any any
 permit tcp any any eq bgp
 permit tcp any eq bgp any
ip access-list extended ACL-COPP-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq 22
 permit tcp 10.99.0.0 0.0.0.255 any eq 443
 permit udp host 10.99.0.20 any eq snmp
ip access-list extended ACL-COPP-UNDESIRED
 permit tcp any any eq telnet
 permit tcp any any eq www
!
class-map match-all CP-ROUTING
 match access-group name ACL-COPP-ROUTING
class-map match-all CP-MGMT
 match access-group name ACL-COPP-MGMT
class-map match-all CP-UNDESIRED
 match access-group name ACL-COPP-UNDESIRED
class-map match-any CP-ICMP
 match protocol icmp
!
policy-map COPP
 class CP-ROUTING
  police 512000 conform-action transmit exceed-action transmit
 class CP-MGMT
  police 256000 conform-action transmit exceed-action drop
 class CP-UNDESIRED
  drop
 class CP-ICMP
  police 64000 conform-action transmit exceed-action drop
 class class-default
  police 64000 conform-action transmit exceed-action drop
control-plane
 service-policy input COPP</pre>
<p>Yahan order matter karta hai: CP-UNDESIRED CP-MGMT ke <b>baad</b> rakhi gayi hai, isliye agar aap kabhi ACL-COPP-MGMT mein management subnet se HTTP (TCP 80) permit karo, to woh management traffic pehle match hota hai aur drop nahi hota. Ulta rakho to aapka permitted management flow undesired class se maar diya jaayega.</p>

<h3>Control-plane host subinterface</h3>
<p>Upar wali aggregate <code>control-plane</code> policy har punted packet dekhti hai. <b>Control Plane Protection</b> (CPPr) control plane ko teen subinterfaces mein baant-ta hai, har ek ki apni policy ke saath:</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Control plane subinterfaces">
<rect x="10" y="90" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="13">Punted</text><text x="70" y="129" text-anchor="middle" class="svg-muted" font-size="12">packets</text>
<rect x="200" y="20" width="200" height="50" rx="8" fill="#bae6fd"/><text x="300" y="42" text-anchor="middle" class="svg-ink" font-size="13">control-plane host</text><text x="300" y="59" text-anchor="middle" class="svg-muted" font-size="12">router IPs ko: SSH, SNMP, iBGP</text>
<rect x="200" y="90" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="300" y="112" text-anchor="middle" class="svg-ink" font-size="13">control-plane transit</text><text x="300" y="129" text-anchor="middle" class="svg-muted" font-size="12">software-switched transit</text>
<rect x="200" y="160" width="200" height="50" rx="8" fill="#fde68a"/><text x="300" y="182" text-anchor="middle" class="svg-ink" font-size="13">control-plane cef-exception</text><text x="300" y="199" text-anchor="middle" class="svg-muted" font-size="12">ARP, OSPF, eBGP, LDP, L2</text>
<rect x="470" y="90" width="160" height="50" rx="8" fill="#fed7aa"/><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="13">Route processor</text><text x="550" y="129" text-anchor="middle" class="svg-muted" font-size="12">CPU</text>
<line x1="130" y1="110" x2="200" y2="45" stroke="#64748b" stroke-width="2"/><line x1="130" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="130" y1="120" x2="200" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="45" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="400" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><line x1="400" y1="185" x2="470" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">CPPr: host, transit aur cef-exception subinterfaces, har ek ki apni policy.</p></div>
<ul>
<li><b>host</b>: router ke apne kisi IP address ko address kiya aur wahin khatam hone wala traffic, jaise SSH, SNMP aur iBGP sessions. Sirf host subinterface <b>port filtering</b> (band TCP/UDP ports ke packets drop) aur <b>queue thresholds</b> jaise extra features support karta hai. Management Plane Protection bhi yahin rehta hai: <code>control-plane host</code>, phir <code>management-interface GigabitEthernet0/2 allow ssh snmp</code> management protocols sirf us interface par accept karta hai.</li>
<li><b>transit</b>: software-switched transit traffic, jaise woh packets jo CEF switch nahi kar pata.</li>
<li><b>cef-exception</b>: CEF dwara CPU ko redirect kiye ya interface driver dwara seedhe queue kiye packets. Cisco yahan ARP, OSPF, external BGP, LDP aur Layer 2 keepalives list karta hai.</li>
</ul>
<p>Trap: agar aap apni routing class ko <code>control-plane host</code> par le jaate ho, to OSPF hellos wahan kabhi nahi pahunchte, kyunki woh cef-exception traffic hain. Har protocol ko usi subinterface par classify karo jo use sach mein dekhta hai, ya aggregate policy rakho.</p>

<div class="eg"><p><b>Worked example: ek direction mein BGP.</b> R1 par sirf <code>permit tcp any any eq bgp</code> hai. Uska eBGP neighbour R1 ki taraf session kholta hai: packets destination port 179 ke saath aate hain, match hote hain. Lekin reset ke baad R1 khud session kholta hai: ab R1 ka source port random hai aur neighbour ke replies <b>source</b> port 179 aur random destination port ke saath aate hain. Woh match nahi karte, class-default mein girte hain aur 64 kbps policer se milte hain, aur load mein session flap karta hai. <code>permit tcp any eq bgp any</code> jodne se theek ho jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Use mein chal rahe kisi routing protocol ko bhool jaana (OSPF, BFD, HSRP, VRRP, PIM, LDP), jisse woh tight class-default mein girta hai. Management ACL mein typo wala subnet. Pehle hi din class-default mein <code>drop</code> ya chhota policer lagana, yeh baseline kiye bina ki CPU tak asal mein kya pahunchta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoPP class ACL mein <code>deny</code> packet drop nahi karta; use us class se bahar karta hai. CoPP sirf CPU ko punt hue packets par lagta hai, CEF se forward hone wale transit traffic par kabhi nahi. BGP ko dono port directions chahiye.</p></div>

<div class="scn"><h4>Har paanch minute mein SNMP polling ke gaps</h4><p>Monitoring team ko ek router ke graphs mein chhed dikhe. SSH aur routing theek the. <code>show policy-map control-plane</code> ne SNMP poller ke packets class-default mein dikhaye, jo 32 kbps par policed thi, aur exceeded counters theek har poll cycle par badh rahe the. Management class ki ACL purane poller address se UDP 161 permit karti thi; poller naye host par shift ho gaya tha. Naya address jodne ke baad SNMP packets management class mein gine gaye aur gaps gayab ho gaye.</p><p><b>Seekh:</b> har management ya routing flow ka kisi class mein naam hona chahiye; warna class-default uski kismat tay karti hai.</p></div>

<div class="iv"><p class="q">"CoPP policy mein BGP, OSPF aur SSH ko kaise classify karoge, aur kis baat ka dhyan rakhoge?"</p><p>Strong answer: class-maps ke peeche extended ACLs. OSPF IP protocol 89 hai, EIGRP 88; BGP ko TCP 179 destination aur source dono ki tarah chahiye, kyunki koi bhi peer session khol sakta hai. SSH ko TCP 22 par management subnet tak seemit rakhna chahiye. Class order (pehla match jeet-ta hai) ka dhyan rakho, ki deny ka matlab sirf "is class ka nahi" hai, aur ki CPPr ke saath OSPF aur eBGP cef-exception traffic hain, host traffic nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CoPP control plane par input MQC policy hai; yeh sirf punted traffic dekhti hai.</li>
<li>OSPF (89), EIGRP (88) aur BGP (TCP 179 dono directions) match karo; SSH, HTTPS aur SNMP ko management sources tak seemit rakho.</li>
<li>Classes upar se neeche evaluate hoti hain; unmatched traffic class-default mein jaata hai.</li>
<li>CPPr control plane ko host, transit aur cef-exception subinterfaces mein baant-ta hai.</li>
<li>OSPF, ARP aur eBGP cef-exception traffic hain, host traffic nahi.</li>
</ul></div>
`}};export{e as default};