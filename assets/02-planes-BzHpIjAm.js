var e={id:`planes`,h:{en:`The three planes: management, control and data`,hi:`Teen planes: management, control aur data`},body:{en:`
<p>Think of a city's road system. The <b>cars moving on the roads</b> are the traffic itself. The <b>traffic control room</b> decides which roads are open, how long each signal stays green and which detour to use after an accident. And somewhere there is an <b>office</b> where city engineers log in to change the rules, look at reports and read the incident log. Every router and switch has the same three jobs inside it. We call them <b>planes</b>.</p>

<h3>The three planes, one by one</h3>
<p><b>Data plane (also called the forwarding plane).</b> This is the part that moves user traffic: it receives a frame or packet, looks up where it should go and sends it out of the right interface. It must be extremely fast, so on switches and most routers it runs in special hardware chips called <b>ASICs</b>, using tables stored in fast memory such as <b>TCAM</b>. Jobs of the data plane: MAC address lookup on a switch, IP lookup in the <b>FIB</b> (the CEF table) on a router, applying ACLs, NAT, QoS marking, adding and removing 802.1Q tags or tunnel headers.</p>
<p><b>Control plane.</b> This is the brain that decides <i>how</i> traffic should be forwarded. It talks to neighbouring devices and builds the tables the data plane uses. OSPF, EIGRP and BGP build the routing table (the <b>RIB</b>), which is then copied into the FIB. STP decides which ports forward or block. ARP learns MAC addresses for IP next hops. LACP negotiates EtherChannels. These protocols run in software on the device's CPU.</p>
<p><b>Management plane.</b> This is how people and tools configure, monitor and operate the device: SSH and the console for the CLI, SNMP for polling counters, syslog for sending log messages, NTP for time, and the APIs you will use in this module, NETCONF and RESTCONF. It also runs on the CPU.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three planes inside one router">
<rect x="140" y="15" width="360" height="60" rx="8" fill="#ddd6fe"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Management plane (CPU)</text>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">SSH, SNMP, syslog, NTP, RESTCONF</text>
<rect x="140" y="90" width="360" height="60" rx="8" fill="#bbf7d0"/>
<text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Control plane (CPU)</text>
<text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">OSPF, BGP, STP, ARP, LACP: build tables</text>
<rect x="140" y="165" width="360" height="60" rx="8" fill="#bae6fd"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="14">Data plane (ASIC)</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">FIB and MAC lookup, ACL, NAT, forward</text>
<line x1="20" y1="45" x2="140" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="70" y="36" text-anchor="middle" class="svg-muted" font-size="12">engineer</text>
<line x1="500" y1="120" x2="620" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="565" y="111" text-anchor="middle" class="svg-muted" font-size="12">neighbours</text>
<line x1="20" y1="195" x2="140" y2="195" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="195" x2="620" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="70" y="186" text-anchor="middle" class="svg-muted" font-size="12">packets in</text>
<text x="565" y="186" text-anchor="middle" class="svg-muted" font-size="12">packets out</text>
<text x="320" y="244" text-anchor="middle" class="svg-accent" font-size="12">control plane programs the data plane</text>
</svg><p class="cap">One device, three jobs. The control plane builds tables; the data plane uses them at line rate.</p></div>

<table class="cmp"><tr><th>Plane</th><th>Question it answers</th><th>Examples</th><th>Runs on</th></tr>
<tr><td><b>Data</b></td><td>"Where does this packet go right now?"</td><td>CEF/FIB lookup, MAC lookup, ACL, NAT, 802.1Q tagging</td><td>ASIC / hardware</td></tr>
<tr><td><b>Control</b></td><td>"What is the best path, what should the tables contain?"</td><td>OSPF, EIGRP, BGP, STP, ARP, LACP</td><td>CPU</td></tr>
<tr><td><b>Management</b></td><td>"How do humans and tools run this box?"</td><td>SSH, console, SNMP, syslog, NTP, NETCONF, RESTCONF</td><td>CPU</td></tr></table>

<div class="eg"><p><b>Worked example.</b> R1 learns 10.40.0.0/24 from its OSPF neighbour 10.0.12.2. The OSPF hellos and LSAs are <b>control plane</b>. The result goes into the RIB (<code>show ip route</code>) and is copied into the FIB (<code>show ip cef</code>). A user's packet to 10.40.0.25 arriving on GigabitEthernet0/0 is switched using that FIB entry: <b>data plane</b>. You connect to R1 with SSH to check all this: <b>management plane</b>.</p></div>

<pre class="out">R1# show ip route 10.40.0.0
Routing entry for 10.40.0.0/24
  Known via "ospf 1", distance 110, metric 2, type intra area
  Last update from 10.0.12.2 on GigabitEthernet0/1, 00:12:44 ago
  Routing Descriptor Blocks:
  * 10.0.12.2, from 2.2.2.2, 00:12:44 ago, via GigabitEthernet0/1
      Route metric is 2, traffic share count is 1

R1# show ip cef 10.40.0.0
<span class="hl">10.40.0.0/24
  nexthop 10.0.12.2 GigabitEthernet0/1</span></pre>
<p>The first output is the control plane's decision. The highlighted CEF entry is what the data plane actually uses for every packet.</p>

<h3>Why the planes matter for automation</h3>
<p>Traffic <b>through</b> the device (transit traffic) stays in the data plane. Traffic <b>to</b> the device (OSPF hellos, SSH sessions, pings to its own address) is sent up, or <b>punted</b>, to the CPU. If the CPU is overloaded, routing neighbours drop and SSH becomes slow, even while hardware forwarding continues. Protecting the control plane (for example with Control Plane Policing) is a topic for the next level.</p>
<p>More importantly for this module: the idea of <b>separating the control plane from the data plane</b> is the basis of controller-based networking and SDN. In a traditional network, every box has its own full control plane. In SDN, a central controller takes over much of the control and management work and programs the devices, which focus on forwarding. The next chapter builds on this.</p>

<div class="warn"><p><b>Common mistake.</b> Calling everything that uses TCP or UDP "data plane". An SSH session <i>to</i> the router is management plane. An SSH session from a PC <i>through</i> the router to a server is just transit traffic in the data plane. Ask: is the device the destination, and what is the purpose?</p></div>

<div class="exam"><p><b>Exam trap.</b> ARP and STP are <b>control plane</b>, not data plane, even though they work at Layer 2. Forwarding a frame using the MAC table is data plane. SNMP, syslog and NTP are usually placed in the <b>management plane</b>. If a question says "builds the routing table", the answer is control plane; "forwards packets based on the table" is data plane.</p></div>

<div class="scn"><h4>Routing flaps, but traffic still moves</h4><p>A campus core router suddenly reported OSPF neighbours going down and up every few minutes, and SSH to it took ten seconds per keystroke. Strangely, users said most applications still worked. The engineer ran <code>show processes cpu sorted</code> and saw CPU near 99% with the ARP input process on top. A Layer 2 loop in an access closet was flooding broadcast ARP requests, and each one was punted to the CPU. The data plane kept forwarding in hardware, but the control plane (OSPF, ARP) and management plane (SSH) were starved. Fixing the loop and enabling storm control on access ports brought CPU back to 8%.</p><p><b>Lesson:</b> the planes fail in different ways. Knowing which plane is hurting points you straight to the cause.</p></div>

<div class="iv"><p class="q">"Explain the data, control and management planes with one example each."</p><p>Strong answer: the data plane forwards user traffic using the FIB and MAC tables, often in ASICs, for example CEF switching a packet. The control plane builds those tables by talking to neighbours, for example OSPF or STP, and runs on the CPU. The management plane is how we operate the device, for example SSH, SNMP, syslog or RESTCONF. Then link it to SDN: controller-based networking centralises control and management while devices keep the data plane.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data plane: forwards traffic at line rate using FIB and MAC tables, usually in hardware.</li>
<li>Control plane: builds the tables (OSPF, BGP, STP, ARP, LACP), runs on the CPU.</li>
<li>Management plane: SSH, console, SNMP, syslog, NTP, NETCONF, RESTCONF.</li>
<li><code>show ip route</code> shows the control plane's RIB; <code>show ip cef</code> shows the FIB the data plane uses.</li>
<li>Separating control from data plane is the foundation of SDN and controller-based networks.</li>
</ul></div>
`,hi:`
<p>Ek shehar ke road system ke baare mein socho. <b>Sadkon par chalti gaadiyaan</b> khud traffic hain. <b>Traffic control room</b> decide karta hai ki kaunsi sadkein khuli hain, har signal kitni der green rahe aur accident ke baad kaunsa detour lena hai. Aur kahin ek <b>office</b> hai jahan city engineers login karke rules badalte hain, reports dekhte hain aur incident log padhte hain. Har router aur switch ke andar yahi teen kaam hote hain. Inhe hum <b>planes</b> kehte hain.</p>

<h3>Teen planes, ek-ek karke</h3>
<p><b>Data plane (forwarding plane bhi kehte hain).</b> Yeh woh hissa hai jo user traffic ko aage bhejta hai: frame ya packet receive karta hai, dekhta hai kahan jaana chahiye aur sahi interface se bahar bhejta hai. Ise bahut fast hona chahiye, isliye switches aur zyada tar routers par yeh <b>ASICs</b> naam ke special hardware chips mein chalta hai, aur <b>TCAM</b> jaisi fast memory mein rakhe tables use karta hai. Data plane ke kaam: switch par MAC address lookup, router par <b>FIB</b> (CEF table) mein IP lookup, ACLs lagana, NAT, QoS marking, 802.1Q tags ya tunnel headers jodna aur hatana.</p>
<p><b>Control plane.</b> Yeh woh dimaag hai jo decide karta hai ki traffic <i>kaise</i> forward ho. Yeh padosi devices se baat karta hai aur woh tables banata hai jo data plane use karta hai. OSPF, EIGRP aur BGP routing table (<b>RIB</b>) banate hain, jo phir FIB mein copy hoti hai. STP decide karta hai kaunse ports forward karein ya block. ARP IP next hops ke MAC addresses seekhta hai. LACP EtherChannels negotiate karta hai. Yeh protocols device ke CPU par software mein chalte hain.</p>
<p><b>Management plane.</b> Isse log aur tools device ko configure, monitor aur operate karte hain: CLI ke liye SSH aur console, counters poll karne ke liye SNMP, log messages bhejne ke liye syslog, time ke liye NTP, aur woh APIs jo aap is module mein use karoge, NETCONF aur RESTCONF. Yeh bhi CPU par chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ek router ke andar teen planes">
<rect x="140" y="15" width="360" height="60" rx="8" fill="#ddd6fe"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Management plane (CPU)</text>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">SSH, SNMP, syslog, NTP, RESTCONF</text>
<rect x="140" y="90" width="360" height="60" rx="8" fill="#bbf7d0"/>
<text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Control plane (CPU)</text>
<text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">OSPF, BGP, STP, ARP, LACP: tables banao</text>
<rect x="140" y="165" width="360" height="60" rx="8" fill="#bae6fd"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="14">Data plane (ASIC)</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">FIB aur MAC lookup, ACL, NAT, forward</text>
<line x1="20" y1="45" x2="140" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="70" y="36" text-anchor="middle" class="svg-muted" font-size="12">engineer</text>
<line x1="500" y1="120" x2="620" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="565" y="111" text-anchor="middle" class="svg-muted" font-size="12">padosi</text>
<line x1="20" y1="195" x2="140" y2="195" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="195" x2="620" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="70" y="186" text-anchor="middle" class="svg-muted" font-size="12">packets andar</text>
<text x="565" y="186" text-anchor="middle" class="svg-muted" font-size="12">packets bahar</text>
<text x="320" y="244" text-anchor="middle" class="svg-accent" font-size="12">control plane data plane ko program karta hai</text>
</svg><p class="cap">Ek device, teen kaam. Control plane tables banata hai; data plane unhe line rate par use karta hai.</p></div>

<table class="cmp"><tr><th>Plane</th><th>Kis sawaal ka jawab</th><th>Examples</th><th>Kahan chalta hai</th></tr>
<tr><td><b>Data</b></td><td>"Yeh packet abhi kahan jaaye?"</td><td>CEF/FIB lookup, MAC lookup, ACL, NAT, 802.1Q tagging</td><td>ASIC / hardware</td></tr>
<tr><td><b>Control</b></td><td>"Best path kya hai, tables mein kya hona chahiye?"</td><td>OSPF, EIGRP, BGP, STP, ARP, LACP</td><td>CPU</td></tr>
<tr><td><b>Management</b></td><td>"Insaan aur tools is box ko kaise chalayein?"</td><td>SSH, console, SNMP, syslog, NTP, NETCONF, RESTCONF</td><td>CPU</td></tr></table>

<div class="eg"><p><b>Worked example.</b> R1 apne OSPF neighbour 10.0.12.2 se 10.40.0.0/24 seekhta hai. OSPF hellos aur LSAs <b>control plane</b> hain. Result RIB mein jaata hai (<code>show ip route</code>) aur FIB mein copy hota hai (<code>show ip cef</code>). GigabitEthernet0/0 par aane wala user ka 10.40.0.25 ka packet usi FIB entry se switch hota hai: <b>data plane</b>. Yeh sab check karne ke liye aap R1 se SSH se connect karte ho: <b>management plane</b>.</p></div>

<pre class="out">R1# show ip route 10.40.0.0
Routing entry for 10.40.0.0/24
  Known via "ospf 1", distance 110, metric 2, type intra area
  Last update from 10.0.12.2 on GigabitEthernet0/1, 00:12:44 ago
  Routing Descriptor Blocks:
  * 10.0.12.2, from 2.2.2.2, 00:12:44 ago, via GigabitEthernet0/1
      Route metric is 2, traffic share count is 1

R1# show ip cef 10.40.0.0
<span class="hl">10.40.0.0/24
  nexthop 10.0.12.2 GigabitEthernet0/1</span></pre>
<p>Pehla output control plane ka decision hai. Highlighted CEF entry woh hai jo data plane asal mein har packet ke liye use karta hai.</p>

<h3>Automation ke liye planes kyun matter karte hain</h3>
<p>Device ke <b>through</b> jaane wala traffic (transit traffic) data plane mein hi rehta hai. Device <b>tak</b> aane wala traffic (OSPF hellos, SSH sessions, uske apne address par ping) upar CPU ko bheja jaata hai, ise <b>punt</b> kehte hain. Agar CPU overload ho jaaye, to routing neighbours drop hote hain aur SSH slow ho jaata hai, jabki hardware forwarding chalti rehti hai. Control plane ko protect karna (jaise Control Plane Policing se) agle level ka topic hai.</p>
<p>Is module ke liye zyada zaroori baat: <b>control plane ko data plane se alag karne</b> ka idea hi controller-based networking aur SDN ki buniyaad hai. Traditional network mein har box ka apna poora control plane hota hai. SDN mein ek central controller control aur management ka bahut sa kaam le leta hai aur devices ko program karta hai, jo forwarding par focus karte hain. Agla chapter isi par banta hai.</p>

<div class="warn"><p><b>Common galti.</b> TCP ya UDP use karne wali har cheez ko "data plane" kehna. Router <i>tak</i> SSH session management plane hai. PC se router ke <i>through</i> server tak SSH session bas data plane ka transit traffic hai. Poocho: kya device destination hai, aur purpose kya hai?</p></div>

<div class="exam"><p><b>Exam trap.</b> ARP aur STP <b>control plane</b> hain, data plane nahi, bhale hi woh Layer 2 par kaam karte hain. MAC table se frame forward karna data plane hai. SNMP, syslog aur NTP aam taur par <b>management plane</b> mein rakhe jaate hain. Agar sawaal kahe "routing table banata hai", to jawab control plane; "table ke hisaab se packets forward karta hai" data plane hai.</p></div>

<div class="scn"><h4>Routing flap ho rahi hai, par traffic chal raha hai</h4><p>Ek campus core router ne achanak report kiya ki OSPF neighbours har kuch minute mein down-up ho rahe hain, aur uspar SSH mein har keystroke dus second le raha tha. Ajeeb baat yeh ki users ne kaha zyada tar applications chal rahi thi. Engineer ne <code>show processes cpu sorted</code> chalaya aur dekha CPU lagbhag 99% par hai aur sabse upar ARP input process hai. Ek access closet mein Layer 2 loop broadcast ARP requests flood kar raha tha, aur har ek CPU ko punt ho rahi thi. Data plane hardware mein forward karta raha, par control plane (OSPF, ARP) aur management plane (SSH) bhookhe reh gaye. Loop theek karne aur access ports par storm control enable karne se CPU wapas 8% par aa gaya.</p><p><b>Seekh:</b> planes alag-alag tareeke se fail hote hain. Kaunsa plane takleef mein hai, yeh jaanna aapko seedha cause tak le jaata hai.</p></div>

<div class="iv"><p class="q">"Data, control aur management planes ko ek-ek example ke saath samjhao."</p><p>Strong answer: data plane FIB aur MAC tables se user traffic forward karta hai, aksar ASICs mein, jaise CEF ka packet switch karna. Control plane padosiyon se baat karke woh tables banata hai, jaise OSPF ya STP, aur CPU par chalta hai. Management plane se hum device operate karte hain, jaise SSH, SNMP, syslog ya RESTCONF. Phir ise SDN se jodo: controller-based networking control aur management ko centralise karta hai jabki devices data plane rakhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data plane: FIB aur MAC tables se traffic line rate par forward karta hai, aam taur par hardware mein.</li>
<li>Control plane: tables banata hai (OSPF, BGP, STP, ARP, LACP), CPU par chalta hai.</li>
<li>Management plane: SSH, console, SNMP, syslog, NTP, NETCONF, RESTCONF.</li>
<li><code>show ip route</code> control plane ki RIB dikhata hai; <code>show ip cef</code> woh FIB dikhata hai jo data plane use karta hai.</li>
<li>Control ko data plane se alag karna SDN aur controller-based networks ki buniyaad hai.</li>
</ul></div>
`}};export{e as default};