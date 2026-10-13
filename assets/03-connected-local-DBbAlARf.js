var e={id:`connected-local`,h:{en:`Connected and local routes: what the router knows for free`,hi:`Connected aur local routes: router ko free mein kya pata hota hai`},body:{en:`
<p>When you move into a new flat, you know two things without asking anyone: the street your building is on, and your own door number. You do not need a map for either. A router is the same. As soon as an interface has an IP address and is working, the router knows the <b>street</b> (the whole subnet) and its own <b>door number</b> (its exact address). These two facts become the <b>connected</b> and <b>local</b> routes.</p>

<h3>The two routes one interface creates</h3>
<p>Configure <code>ip address 172.16.1.1 255.255.255.0</code> on Gi0/0 and bring it up. IOS installs two entries:</p>
<pre class="out">C        172.16.1.0/24 is directly connected, GigabitEthernet0/0
L        172.16.1.1/32 is directly connected, GigabitEthernet0/0</pre>
<dl class="terms">
<dt>Connected route (C)</dt><dd>The subnet the interface belongs to, calculated from address and mask. It tells the router: "any destination in 172.16.1.0/24 is on this wire; ARP for the destination itself". There is no next hop.</dd>
<dt>Local route (L)</dt><dd>A /32 host route for the router's own interface address. It tells the router: "a packet to exactly 172.16.1.1 is for me; hand it to my own CPU, do not forward it". Local routes appeared in IOS 15 and are always /32 for IPv4 (and /128 for IPv6).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="One interface creates a connected and a local route">
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">172.16.1.1 255.255.255.0</text>
<line x1="320" y1="80" x2="160" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="480" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="140" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="160" y="165" text-anchor="middle" class="svg-ink" font-size="13">C 172.16.1.0/24</text><text x="160" y="185" text-anchor="middle" class="svg-muted" font-size="12">the whole street: ARP on the wire</text>
<rect x="360" y="140" width="240" height="60" rx="8" fill="#fde68a"/><text x="480" y="165" text-anchor="middle" class="svg-ink" font-size="13">L 172.16.1.1/32</text><text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">my own door: send to CPU</text>
</svg><p class="cap">One IP address on an up/up interface gives two routes: the subnet and the router's own address.</p></div>

<h3>When do they appear and disappear?</h3>
<p>Both routes exist only while the interface is <b>up/up</b> in <code>show ip interface brief</code> (Status up and Protocol up). Shut the interface, unplug the cable or lose the keepalives, and both C and L vanish instantly. So does every static route that depends on that interface. This is the mechanism that later makes floating static routes work.</p>
<pre class="out">R1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     172.16.1.1      YES manual up                    up</span>
GigabitEthernet0/1     10.12.12.1      YES manual up                    up
GigabitEthernet0/2     unassigned      YES unset  administratively down down</pre>

<h3>Why the local route matters</h3>
<p>Before local routes existed, the router had to work out "is this packet for me?" separately from its forwarding logic. Now the answer is inside the table: the /32 is always the <b>longest possible match</b>, so a packet to 172.16.1.1 matches the L route rather than the /24 and goes to the control plane. You also see it in CEF as a <b>receive</b> entry. Practically, local routes help you in two ways: they show you every IP the router owns at a glance, and they remind you that a ping to a router's interface only proves that router is reachable, not the subnet behind it.</p>

<div class="eg"><p><b>Worked example.</b> R2 has Gi0/0 10.12.12.2/30 and Gi0/1 10.23.23.1/30. Its connected table is:</p>
<pre class="out">R2#show ip route connected
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.12.12.0/30 is directly connected, GigabitEthernet0/0
L        10.12.12.2/32 is directly connected, GigabitEthernet0/0
C        10.23.23.0/30 is directly connected, GigabitEthernet0/1
L        10.23.23.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>Four subnets, two masks (/30 and /32). R2 can reach R1 (10.12.12.1) and R3 (10.23.23.2) with no configuration at all, but neither studio LAN.</p></div>

<h3>Special cases worth knowing</h3>
<ul>
<li><b>/31 point-to-point links</b> (RFC 3021): <code>ip address 10.0.0.0 255.255.255.254</code> produces <code>C 10.0.0.0/31</code> and <code>L 10.0.0.0/32</code>. Both addresses are usable.</li>
<li><b>/32 on a loopback</b>: <code>interface Loopback0</code> with <code>ip address 192.0.2.1 255.255.255.255</code> gives only <code>C 192.0.2.1/32</code>; there is no separate L entry because the connected route is already a host route. Loopbacks never go down unless shut, which is why they are used as router IDs and management addresses.</li>
<li><b>Secondary addresses</b>: each <code>ip address ... secondary</code> adds its own C and L pair.</li>
<li><b>Layer 3 switches</b>: SVIs and routed ports install C and L routes exactly like router interfaces, but only after <code>ip routing</code> is enabled, as you saw in the inter-VLAN module.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Adding a static route for a subnet that is already connected, "just to be safe". The connected route has AD 0 and always wins, so the static never installs while the interface is up. It only adds confusion, and if the interface goes down it may send traffic somewhere unexpected.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local routes are <b>/32</b>, not the interface mask. A question showing <code>L 10.12.12.1/30</code> is showing a wrong answer. Also, connected routes need <b>up/up</b>: an interface with an address that is administratively down contributes nothing to the table.</p></div>

<div class="scn"><h4>The route that disappeared at night</h4><p>A branch router's WAN subnet vanished from the table every night around 02:00 and came back ten minutes later; backups to HQ failed. The static routes looked correct. The engineer checked the log and saw <code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down</code> at the same time: the carrier was doing maintenance. With the interface down, the C and L routes and the static route through it were all withdrawn. The fix was a backup path (a floating static via a second link), covered in chapter 9.</p><p><b>Lesson:</b> connected routes, and everything built on them, follow the interface state.</p></div>

<div class="iv"><p class="q">"What is the difference between a C route and an L route?"</p><p>Strong answer: C is the directly connected subnet derived from the interface address and mask; it tells the router to deliver packets on that segment by ARPing for the destination. L is a /32 host route for the router's own interface address; it tells the router the packet is for itself and must be punted to the CPU. Both need the interface up/up, both have AD 0, and L entries were added in IOS 15.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every up/up interface with an IP installs a C route (subnet) and an L route (/32 own address).</li>
<li>Connected routes have AD 0 and no next hop; the router ARPs for the destination directly.</li>
<li>Interface down means C, L and any static routes through it are removed immediately.</li>
<li>L routes identify packets addressed to the router itself (CEF receive entries).</li>
<li>/31 links, /32 loopbacks, secondary addresses and SVIs follow the same logic.</li>
</ul></div>
`,hi:`
<p>Jab aap naye flat mein shift hote ho, to do cheezein bina kisi se pooche pata hoti hain: aapki building kis street par hai, aur aapka apna door number. Dono ke liye map nahi chahiye. Router bhi waisa hi hai. Jaise hi interface par IP address hai aur woh kaam kar raha hai, router ko <b>street</b> (poora subnet) aur apna <b>door number</b> (uska exact address) pata ho jaata hai. Yahi do facts <b>connected</b> aur <b>local</b> routes bante hain.</p>

<h3>Ek interface se banne wale do routes</h3>
<p>Gi0/0 par <code>ip address 172.16.1.1 255.255.255.0</code> configure karo aur up karo. IOS do entries install karta hai:</p>
<pre class="out">C        172.16.1.0/24 is directly connected, GigabitEthernet0/0
L        172.16.1.1/32 is directly connected, GigabitEthernet0/0</pre>
<dl class="terms">
<dt>Connected route (C)</dt><dd>Woh subnet jiska interface hissa hai, address aur mask se calculate kiya hua. Yeh router ko batata hai: "172.16.1.0/24 ka koi bhi destination isi wire par hai; khud destination ke liye ARP karo". Koi next hop nahi hota.</dd>
<dt>Local route (L)</dt><dd>Router ke apne interface address ka /32 host route. Yeh router ko batata hai: "exactly 172.16.1.1 wala packet mere liye hai; ise apne CPU ko do, forward mat karo". Local routes IOS 15 mein aaye aur IPv4 ke liye hamesha /32 hote hain (IPv6 ke liye /128).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ek interface se connected aur local route">
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">172.16.1.1 255.255.255.0</text>
<line x1="320" y1="80" x2="160" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="480" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="140" width="240" height="60" rx="8" fill="#bbf7d0"/><text x="160" y="165" text-anchor="middle" class="svg-ink" font-size="13">C 172.16.1.0/24</text><text x="160" y="185" text-anchor="middle" class="svg-muted" font-size="12">poori street: wire par ARP</text>
<rect x="360" y="140" width="240" height="60" rx="8" fill="#fde68a"/><text x="480" y="165" text-anchor="middle" class="svg-ink" font-size="13">L 172.16.1.1/32</text><text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">mera apna door: CPU ko bhejo</text>
</svg><p class="cap">Up/up interface par ek IP address do routes deta hai: subnet aur router ka apna address.</p></div>

<h3>Yeh kab aate aur jaate hain?</h3>
<p>Dono routes tabhi exist karte hain jab interface <code>show ip interface brief</code> mein <b>up/up</b> ho (Status up aur Protocol up). Interface shut karo, cable nikaalo ya keepalives kho do, to C aur L dono turant gayab. Us interface par depend karne wala har static route bhi. Yahi mechanism baad mein floating static routes ko kaam karwata hai.</p>
<pre class="out">R1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     172.16.1.1      YES manual up                    up</span>
GigabitEthernet0/1     10.12.12.1      YES manual up                    up
GigabitEthernet0/2     unassigned      YES unset  administratively down down</pre>

<h3>Local route kyun matter karta hai</h3>
<p>Local routes se pehle router ko "kya yeh packet mere liye hai?" apni forwarding logic se alag nikaalna padta tha. Ab jawab table ke andar hai: /32 hamesha <b>sabse lamba possible match</b> hai, isliye 172.16.1.1 ka packet /24 ki jagah L route match karta hai aur control plane ko jaata hai. CEF mein aap ise <b>receive</b> entry ki tarah dekhte ho. Practically local routes do tarah madad karte hain: ek nazar mein router ke saare IPs dikh jaate hain, aur yaad dilate hain ki router ke interface ka ping sirf yeh prove karta hai ki router reachable hai, uske peeche ka subnet nahi.</p>

<div class="eg"><p><b>Worked example.</b> R2 par Gi0/0 10.12.12.2/30 aur Gi0/1 10.23.23.1/30 hain. Uski connected table hai:</p>
<pre class="out">R2#show ip route connected
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.12.12.0/30 is directly connected, GigabitEthernet0/0
L        10.12.12.2/32 is directly connected, GigabitEthernet0/0
C        10.23.23.0/30 is directly connected, GigabitEthernet0/1
L        10.23.23.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>Chaar subnets, do masks (/30 aur /32). R2 bina kisi configuration ke R1 (10.12.12.1) aur R3 (10.23.23.2) tak pahunch sakta hai, lekin kisi studio LAN tak nahi.</p></div>

<h3>Special cases jo pata hone chahiye</h3>
<ul>
<li><b>/31 point-to-point links</b> (RFC 3021): <code>ip address 10.0.0.0 255.255.255.254</code> se <code>C 10.0.0.0/31</code> aur <code>L 10.0.0.0/32</code> bante hain. Dono addresses usable hain.</li>
<li><b>Loopback par /32</b>: <code>interface Loopback0</code> par <code>ip address 192.0.2.1 255.255.255.255</code> sirf <code>C 192.0.2.1/32</code> deta hai; alag L entry nahi hoti kyunki connected route pehle se host route hai. Loopbacks shut kiye bina kabhi down nahi hote, isliye router IDs aur management addresses ke liye use hote hain.</li>
<li><b>Secondary addresses</b>: har <code>ip address ... secondary</code> apna C aur L pair add karta hai.</li>
<li><b>Layer 3 switches</b>: SVIs aur routed ports router interfaces ki tarah hi C aur L routes install karte hain, lekin sirf <code>ip routing</code> enable hone ke baad, jaisa aapne inter-VLAN module mein dekha.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Pehle se connected subnet ke liye static route add karna, "bas safe rehne ke liye". Connected route ki AD 0 hai aur woh hamesha jeetta hai, isliye interface up rehte static kabhi install nahi hota. Yeh sirf confusion badhata hai, aur interface down hone par traffic kahin anjaan jagah bhej sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local routes <b>/32</b> hote hain, interface mask nahi. Jo question <code>L 10.12.12.1/30</code> dikhaye woh galat answer dikha raha hai. Aur connected routes ko <b>up/up</b> chahiye: address wala interface jo administratively down hai, table mein kuch contribute nahi karta.</p></div>

<div class="scn"><h4>Raat mein gayab hone wala route</h4><p>Ek branch router ka WAN subnet har raat lagbhag 02:00 baje table se gayab ho jaata tha aur das minute baad wapas aata; HQ ke backups fail hote the. Static routes sahi dikh rahe the. Engineer ne log check kiya aur usi samay <code>%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down</code> dekha: carrier maintenance kar raha tha. Interface down hone par C aur L routes aur us par se jaane wala static route sab withdraw ho gaye. Fix tha ek backup path (doosre link se floating static), jo chapter 9 mein cover hai.</p><p><b>Seekh:</b> connected routes, aur unpar bani har cheez, interface state follow karti hai.</p></div>

<div class="iv"><p class="q">"C route aur L route mein kya fark hai?"</p><p>Strong answer: C interface address aur mask se nikla directly connected subnet hai; yeh router ko batata hai ki us segment par packets destination ke liye ARP karke deliver karo. L router ke apne interface address ka /32 host route hai; yeh router ko batata hai ki packet uske liye hai aur CPU ko punt karna hai. Dono ko interface up/up chahiye, dono ki AD 0 hai, aur L entries IOS 15 mein add hui.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP wala har up/up interface ek C route (subnet) aur ek L route (/32 apna address) install karta hai.</li>
<li>Connected routes ki AD 0 hai aur koi next hop nahi; router seedha destination ke liye ARP karta hai.</li>
<li>Interface down matlab C, L aur us par se jaane wale saare static routes turant hat jaate hain.</li>
<li>L routes router ke liye address kiye gaye packets pehchante hain (CEF receive entries).</li>
<li>/31 links, /32 loopbacks, secondary addresses aur SVIs same logic follow karte hain.</li>
</ul></div>
`}};export{e as default};