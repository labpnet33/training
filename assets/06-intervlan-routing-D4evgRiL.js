var e={id:`intervlan-routing`,h:{en:`Inter-VLAN routing: router-on-a-stick and SVIs`,hi:`Inter-VLAN routing: router-on-a-stick aur SVIs`},body:{en:`
<h3>The analogy: the security desk between floors</h3>
<p>VLANs keep floors apart, but staff still need to send documents to the print room and guests still need the internet. Every movement between floors passes the security desk, which knows every floor and decides who may go where. In a network that desk is a <b>layer 3 device</b>: a router, a layer 3 switch or a firewall. It owns one IP address in each VLAN's subnet, and that address is the <b>default gateway</b> for the hosts in the VLAN.</p>

<h3>Why routing is required</h3>
<p>When PC1 (192.168.10.10/24) wants to reach PC2 (192.168.20.10/24), it compares the destination with its own subnet. 192.168.20.10 is outside 192.168.10.0/24, so PC1 does not ARP for PC2. It ARPs for its <b>gateway</b>, 192.168.10.1, and sends the frame to the gateway's MAC. Only a device with an interface in both subnets can pass the packet across. That is inter-VLAN routing, and there are two common designs.</p>

<h3>Design 1: router-on-a-stick</h3>
<p>One router port connects to a switch trunk. On the router you create a logical <b>sub-interface</b> per VLAN. Each sub-interface is told which 802.1Q tag it handles and gets that VLAN's gateway IP. This is exactly the lab design.</p>
<pre class="code"><span class="c">! Lab task on R1: sub-interfaces per VLAN</span>
enable
configure terminal
interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
end</pre>
<p>Three details matter. The <b>physical</b> interface must be <code>no shutdown</code>; sub-interfaces cannot be up if their parent is down. <code>encapsulation dot1Q 10</code> must come <b>before</b> the IP address, and the number must match the VLAN on the switch. The sub-interface number (.10) is only a label; matching it to the VLAN ID is a convention that saves confusion. If you need the router to handle the native VLAN, use <code>encapsulation dot1Q 999 native</code> on that sub-interface.</p>
<pre class="out">R1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
<span class="hl">GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up</span>
GigabitEthernet0/1     unassigned      YES unset  administratively down down

R1#show ip route connected
C        192.168.10.0/24 is directly connected, GigabitEthernet0/0.10
L        192.168.10.1/32 is directly connected, GigabitEthernet0/0.10
C        192.168.20.0/24 is directly connected, GigabitEthernet0/0.20
L        192.168.20.1/32 is directly connected, GigabitEthernet0/0.20</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Packet walk through router-on-a-stick">
<rect x="250" y="12" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">R1 routes</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">.10 in, .20 out</text>
<line x1="305" y1="56" x2="305" y2="110" stroke="#64748b" stroke-width="2"/><line x1="335" y1="56" x2="335" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="180" y="88" class="svg-ink" font-size="12">1. up, tag 10</text><text x="345" y="88" class="svg-accent" font-size="12">2. down, tag 20</text>
<rect x="250" y="110" width="140" height="40" rx="8" fill="#bae6fd"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">SW1 trunk Gi0/0</text>
<line x1="280" y1="150" x2="150" y2="180" stroke="#64748b" stroke-width="2"/><line x1="360" y1="150" x2="490" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="70" y="180" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="150" y="205" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text>
<rect x="410" y="180" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="490" y="205" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 20</text>
</svg><p class="cap">PC1 to PC2: up the trunk tagged 10, routed by R1, back down tagged 20. The same link is crossed twice.</p></div>

<div class="eg"><p><b>Worked example: the lab ping, hop by hop.</b> (1) PC1 sees 192.168.20.10 is remote and ARPs for 192.168.10.1. (2) SW1 floods the ARP in VLAN 10, including out the trunk tagged 10. (3) R1's Gi0/0.10 replies with its MAC. (4) PC1 sends the ICMP packet to R1's MAC; it crosses the trunk tagged 10. (5) R1 looks up 192.168.20.10, finds the connected route via Gi0/0.20, ARPs for PC2 in VLAN 20, and sends the packet down tagged 20 with TTL reduced by one. (6) SW1 removes the tag and delivers it to Gi0/2. The reply takes the reverse path. On PC1 you see <code>84 bytes from 192.168.20.10 icmp_seq=1 ttl=63</code>: a TTL of 63 instead of 64 proves one router was crossed.</p></div>

<h3>Design 2: a layer 3 switch with SVIs</h3>
<p>A <b>switch virtual interface (SVI)</b> is a virtual layer 3 interface for a VLAN inside a switch, named <code>interface vlan 10</code>. On a layer 3 switch, give each VLAN an SVI with the gateway IP and enable routing. Traffic between VLANs is routed inside the switch hardware at wire speed, with no trunk to an external router.</p>
<pre class="code"><span class="c">! Same gateways, built on a layer 3 switch</span>
ip routing
vlan 10
 name STAFF
vlan 20
 name GUEST
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
interface Vlan20
 ip address 192.168.20.1 255.255.255.0
 no shutdown</pre>
<p>An SVI comes <b>up/up</b> only when the VLAN exists, the SVI is not shut down, and at least one port in that VLAN (access or trunk) is up and forwarding. An SVI for an empty VLAN stays down, which surprises many beginners. A plain layer 2 switch also uses one SVI, only for <b>management</b>: <code>interface vlan 99</code> with an IP address, plus <code>ip default-gateway</code> so it can be reached from other subnets.</p>

<table class="cmp"><tr><th></th><th>Router-on-a-stick</th><th>Layer 3 switch SVIs</th></tr>
<tr><td>Hardware</td><td>Any router plus layer 2 switch</td><td>Layer 3 (multilayer) switch</td></tr>
<tr><td>Performance</td><td>Limited by one link, crossed twice</td><td>Routed in switch hardware, very fast</td></tr>
<tr><td>Typical place</td><td>Small branch, lab, home lab</td><td>Campus distribution/core, data center</td></tr>
<tr><td>Gateway lives on</td><td>Sub-interface Gi0/0.10</td><td>interface Vlan10</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>no shutdown</code> on the router's physical port, so every sub-interface is down. (2) Wrong dot1Q number on a sub-interface (VLAN 20 traffic arriving at a sub-interface expecting 21). (3) Forgetting <code>ip routing</code> on a layer 3 switch: SVIs are up but nothing routes. (4) Hosts with the wrong default gateway, or no gateway at all.</p></div>

<div class="exam"><p><b>Exam traps.</b> An SVI is a <b>virtual</b> interface for a VLAN; it is the objective's "switch virtual interface". Router-on-a-stick needs a <b>trunk</b> on the switch side. A layer 3 switch needs <code>ip routing</code>. The gateway of each VLAN is the sub-interface or SVI IP in that VLAN's subnet.</p></div>

<div class="scn"><h4>The branch where only VLAN 10 worked</h4><p>A new branch router was configured with sub-interfaces .10 and .20. Staff could browse; guests got an address by static config but could not reach their gateway. <code>show running-config interface Gi0/0.20</code> showed <code>encapsulation dot1Q 200</code>, a typo. Guest frames arrived tagged 20 and no sub-interface claimed them. Fixing the encapsulation to 20 made guest traffic flow immediately.</p><p><b>Lesson:</b> the switch's VLAN ID, the trunk's allowed list and the router's dot1Q number must be the same number; check all three.</p></div>

<div class="iv"><p class="q">"Router-on-a-stick or SVIs: which would you choose and why?"</p><p>Strong answer: explain both, then choose by scale. Router-on-a-stick is cheap and fine for a small branch, but all inter-VLAN traffic crosses one trunk twice and the router CPU or link becomes the bottleneck. SVIs on a layer 3 switch route in hardware and scale to campus and data center; remember <code>ip routing</code> and that an SVI needs an active port in its VLAN. Mention that security policy then goes on the SVIs (ACLs) or on a firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hosts in different VLANs reach each other through their default gateway, a layer 3 interface in each VLAN.</li>
<li>Router-on-a-stick: a trunk to one router port, one dot1Q sub-interface per VLAN; the parent must be up.</li>
<li>SVIs: <code>interface vlan N</code> on a layer 3 switch plus <code>ip routing</code>; up only with an active port in the VLAN.</li>
<li>Verify with <code>show ip interface brief</code>, <code>show ip route connected</code> and a ping (TTL drops by one per router).</li>
<li>VLAN ID, allowed list and dot1Q number must all match.</li>
</ul></div>
`,hi:`
<h3>Analogy: floors ke beech ka security desk</h3>
<p>VLANs floors ko alag rakhte hain, lekin staff ko phir bhi print room documents bhejne hain aur guests ko internet chahiye. Floors ke beech har movement security desk se guzarti hai, jo har floor ko jaanta hai aur decide karta hai ki kaun kahan ja sakta hai. Network mein woh desk ek <b>layer 3 device</b> hai: router, layer 3 switch ya firewall. Uske paas har VLAN ke subnet mein ek IP address hota hai, aur wahi address us VLAN ke hosts ka <b>default gateway</b> hai.</p>

<h3>Routing zaroori kyun hai</h3>
<p>Jab PC1 (192.168.10.10/24) PC2 (192.168.20.10/24) tak pahunchna chahta hai, woh destination ko apne subnet se compare karta hai. 192.168.20.10, 192.168.10.0/24 ke bahar hai, isliye PC1 PC2 ke liye ARP nahi karta. Woh apne <b>gateway</b> 192.168.10.1 ke liye ARP karta hai, aur frame gateway ke MAC par bhejta hai. Sirf wahi device packet ko paar kara sakta hai jiska interface dono subnets mein ho. Yahi inter-VLAN routing hai, aur iske do common designs hain.</p>

<h3>Design 1: router-on-a-stick</h3>
<p>Router ka ek port switch ke trunk se judta hai. Router par aap har VLAN ke liye ek logical <b>sub-interface</b> banate ho. Har sub-interface ko bataya jaata hai ki woh kaunsa 802.1Q tag handle karega aur use us VLAN ka gateway IP milta hai. Lab ka design bilkul yahi hai.</p>
<pre class="code"><span class="c">! R1 par lab task: har VLAN ke liye sub-interfaces</span>
enable
configure terminal
interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
end</pre>
<p>Teen details matter karti hain. <b>Physical</b> interface <code>no shutdown</code> hona chahiye; parent down ho to sub-interfaces up nahi ho sakte. <code>encapsulation dot1Q 10</code> IP address se <b>pehle</b> aana chahiye, aur number switch ke VLAN se match hona chahiye. Sub-interface number (.10) sirf ek label hai; use VLAN ID se match karna ek convention hai jo confusion bachata hai. Agar router ko native VLAN handle karna hai, to us sub-interface par <code>encapsulation dot1Q 999 native</code> use karo.</p>
<pre class="out">R1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
<span class="hl">GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up</span>
GigabitEthernet0/1     unassigned      YES unset  administratively down down

R1#show ip route connected
C        192.168.10.0/24 is directly connected, GigabitEthernet0/0.10
L        192.168.10.1/32 is directly connected, GigabitEthernet0/0.10
C        192.168.20.0/24 is directly connected, GigabitEthernet0/0.20
L        192.168.20.1/32 is directly connected, GigabitEthernet0/0.20</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Router-on-a-stick se packet walk">
<rect x="250" y="12" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">R1 route karta hai</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">.10 andar, .20 bahar</text>
<line x1="305" y1="56" x2="305" y2="110" stroke="#64748b" stroke-width="2"/><line x1="335" y1="56" x2="335" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="180" y="88" class="svg-ink" font-size="12">1. upar, tag 10</text><text x="345" y="88" class="svg-accent" font-size="12">2. neeche, tag 20</text>
<rect x="250" y="110" width="140" height="40" rx="8" fill="#bae6fd"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">SW1 trunk Gi0/0</text>
<line x1="280" y1="150" x2="150" y2="180" stroke="#64748b" stroke-width="2"/><line x1="360" y1="150" x2="490" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="70" y="180" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="150" y="205" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text>
<rect x="410" y="180" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="490" y="205" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 20</text>
</svg><p class="cap">PC1 se PC2: trunk par tag 10 ke saath upar, R1 route karta hai, tag 20 ke saath wapas neeche. Wahi link do baar cross hota hai.</p></div>

<div class="eg"><p><b>Worked example: lab ping, hop by hop.</b> (1) PC1 dekhta hai ki 192.168.20.10 remote hai aur 192.168.10.1 ke liye ARP karta hai. (2) SW1 ARP ko VLAN 10 mein flood karta hai, trunk par tag 10 ke saath bhi. (3) R1 ka Gi0/0.10 apne MAC ke saath reply karta hai. (4) PC1 ICMP packet R1 ke MAC par bhejta hai; woh trunk ko tag 10 ke saath cross karta hai. (5) R1 192.168.20.10 look up karta hai, Gi0/0.20 ke through connected route paata hai, VLAN 20 mein PC2 ke liye ARP karta hai, aur packet ko TTL ek kam karke tag 20 ke saath neeche bhejta hai. (6) SW1 tag hataata hai aur use Gi0/2 par deliver karta hai. Reply ulta raasta leta hai. PC1 par aapko <code>84 bytes from 192.168.20.10 icmp_seq=1 ttl=63</code> dikhta hai: 64 ki jagah 63 TTL saabit karta hai ki ek router cross hua.</p></div>

<h3>Design 2: SVIs wala layer 3 switch</h3>
<p><b>Switch virtual interface (SVI)</b> switch ke andar kisi VLAN ka virtual layer 3 interface hai, jiska naam <code>interface vlan 10</code> hota hai. Layer 3 switch par har VLAN ko gateway IP ke saath ek SVI do aur routing enable karo. VLANs ke beech traffic switch hardware ke andar wire speed par route hota hai, bina external router tak trunk ke.</p>
<pre class="code"><span class="c">! Wahi gateways, layer 3 switch par bane hue</span>
ip routing
vlan 10
 name STAFF
vlan 20
 name GUEST
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
interface Vlan20
 ip address 192.168.20.1 255.255.255.0
 no shutdown</pre>
<p>SVI <b>up/up</b> tabhi aata hai jab VLAN exist kare, SVI shut down na ho, aur us VLAN ka kam se kam ek port (access ya trunk) up aur forwarding ho. Khaali VLAN ka SVI down rehta hai, jo kai beginners ko hairaan karta hai. Simple layer 2 switch bhi ek SVI use karta hai, sirf <b>management</b> ke liye: IP address ke saath <code>interface vlan 99</code>, aur <code>ip default-gateway</code> taaki doosre subnets se use reach kiya ja sake.</p>

<table class="cmp"><tr><th></th><th>Router-on-a-stick</th><th>Layer 3 switch SVIs</th></tr>
<tr><td>Hardware</td><td>Koi bhi router plus layer 2 switch</td><td>Layer 3 (multilayer) switch</td></tr>
<tr><td>Performance</td><td>Ek link se limited, do baar cross hota hai</td><td>Switch hardware mein route, bahut fast</td></tr>
<tr><td>Typical jagah</td><td>Chhoti branch, lab, home lab</td><td>Campus distribution/core, data center</td></tr>
<tr><td>Gateway kahan hai</td><td>Sub-interface Gi0/0.10</td><td>interface Vlan10</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> (1) Router ke physical port par <code>no shutdown</code> bhool jaana, jisse har sub-interface down rehta hai. (2) Sub-interface par galat dot1Q number (VLAN 20 ka traffic us sub-interface par pahunchta hai jo 21 expect kar raha hai). (3) Layer 3 switch par <code>ip routing</code> bhool jaana: SVIs up hain lekin kuch route nahi hota. (4) Hosts par galat default gateway, ya gateway hi nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> SVI ek VLAN ka <b>virtual</b> interface hai; yahi objective ka "switch virtual interface" hai. Router-on-a-stick ke liye switch side par <b>trunk</b> chahiye. Layer 3 switch ko <code>ip routing</code> chahiye. Har VLAN ka gateway us VLAN ke subnet mein sub-interface ya SVI ka IP hai.</p></div>

<div class="scn"><h4>Branch jahan sirf VLAN 10 chalta tha</h4><p>Ek naye branch router par sub-interfaces .10 aur .20 configure kiye gaye. Staff browse kar pa rahe the; guests ko static config se address mila tha lekin woh apne gateway tak nahi pahunch pa rahe the. <code>show running-config interface Gi0/0.20</code> mein <code>encapsulation dot1Q 200</code> tha, ek typo. Guest frames tag 20 ke saath aate the aur koi sub-interface unhe claim nahi karta tha. Encapsulation ko 20 karte hi guest traffic turant chal pada.</p><p><b>Seekh:</b> switch ka VLAN ID, trunk ki allowed list aur router ka dot1Q number ek hi number hone chahiye; teeno check karo.</p></div>

<div class="iv"><p class="q">"Router-on-a-stick ya SVIs: aap kaunsa chunoge aur kyun?"</p><p>Strong answer: dono samjhao, phir scale ke hisaab se chuno. Router-on-a-stick sasta hai aur chhoti branch ke liye theek hai, lekin saara inter-VLAN traffic ek trunk ko do baar cross karta hai aur router CPU ya link bottleneck ban jaata hai. Layer 3 switch par SVIs hardware mein route karte hain aur campus aur data center tak scale karte hain; <code>ip routing</code> yaad rakho aur yeh ki SVI ko apne VLAN mein ek active port chahiye. Batao ki security policy phir SVIs par (ACLs) ya firewall par lagti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Alag VLANs ke hosts apne default gateway ke through ek doosre tak pahunchte hain, jo har VLAN mein ek layer 3 interface hai.</li>
<li>Router-on-a-stick: ek router port tak trunk, har VLAN ka ek dot1Q sub-interface; parent up hona chahiye.</li>
<li>SVIs: layer 3 switch par <code>interface vlan N</code> plus <code>ip routing</code>; VLAN mein active port ho tabhi up.</li>
<li><code>show ip interface brief</code>, <code>show ip route connected</code> aur ping se verify karo (har router par TTL ek kam hota hai).</li>
<li>VLAN ID, allowed list aur dot1Q number sab match hone chahiye.</li>
</ul></div>
`}};export{e as default};