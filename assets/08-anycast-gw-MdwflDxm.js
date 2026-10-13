var e={id:`agw`,h:{en:`Distributed anycast gateway and host mobility`,hi:`Distributed anycast gateway aur host mobility`},body:{en:`
<p>A national bank wants every customer to have "the nearest branch" as their branch. Instead of one head office where everyone must queue, it opens a counter in every neighbourhood, each with the same name, the same phone number and the same services. A customer who moves house simply walks into the new neighbourhood's counter and gets served without changing anything. The <b>distributed anycast gateway</b> does this for default gateways: every leaf presents the same gateway IP and the same gateway MAC for a subnet, so every host's gateway is always one hop away, on its own leaf, wherever the host lives or moves.</p>

<h3>The problem with a central gateway</h3>
<p>With a traditional first-hop redundancy protocol such as HSRP or VRRP, two routers share a virtual IP and virtual MAC, and one of them is active. In a fabric of 40 leaves, a host in rack 30 must send every inter-subnet packet across the fabric to the active gateway, perhaps in rack 1, and back again: the classic hair-pin. The active router is also a bottleneck and a single point of heavy load. Stretching HSRP over VXLAN makes things worse: extra hellos, split-brain risks and asymmetric paths.</p>

<h3>The anycast gateway idea</h3>
<ul>
<li>Every leaf that hosts VLAN 10 has <code>interface Vlan10</code> with the <b>same IP</b>, 172.16.10.1/24.</li>
<li>Every leaf uses the <b>same virtual MAC</b> for all anycast SVIs, set once globally: <code>fabric forwarding anycast-gateway-mac 0000.2222.3333</code>.</li>
<li>There are no hellos and no active/standby roles: every leaf is active for its local hosts. The leaves do not advertise the gateway IP/MAC as a remote host, so there is no conflict.</li>
</ul>
<p>When SRV1 ARPs for 172.16.10.1, its own leaf answers with 0000.2222.3333 and routes the packet immediately. That is why symmetric IRB (chapter 7) starts routing at the ingress leaf.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Same gateway on every leaf">
<rect x="20" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="13">LEAF1 Vlan10</text><text x="110" y="72" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.1 / 0000.2222.3333</text>
<rect x="230" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">LEAF2 Vlan10</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.1 / 0000.2222.3333</text>
<rect x="440" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">LEAF9 Vlan10</text><text x="530" y="72" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.1 / 0000.2222.3333</text>
<rect x="60" y="150" width="100" height="36" rx="6" fill="#fde68a"/><text x="110" y="173" text-anchor="middle" class="svg-ink" font-size="12">VM (before)</text>
<rect x="480" y="150" width="100" height="36" rx="6" fill="#fde68a"/><text x="530" y="173" text-anchor="middle" class="svg-ink" font-size="12">VM (after)</text>
<line x1="110" y1="90" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="530" y1="90" x2="530" y2="150" stroke="#64748b" stroke-width="2"/>
<path d="M160 168 L480 168" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4" fill="none"/><text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">vMotion: gateway IP and MAC unchanged</text>
</svg><p class="cap">Every leaf answers for the same gateway. A moved VM keeps its ARP entry for the gateway and keeps working.</p></div>

<h3>Configuration (lab 3, tasks 1 and 3)</h3>
<pre class="code"><span class="c">! on every leaf: identical</span>
feature interface-vlan
feature fabric forwarding
fabric forwarding anycast-gateway-mac 0000.2222.3333
<span class="c">! LEAF1: gateway for VLAN 10</span>
interface Vlan10
  no shutdown
  vrf member TENANT-A
  ip address 172.16.10.1/24
  fabric forwarding mode anycast-gateway
<span class="c">! LEAF2: gateway for VLAN 20</span>
interface Vlan20
  no shutdown
  vrf member TENANT-A
  ip address 172.16.20.1/24
  fabric forwarding mode anycast-gateway</pre>
<p>Two details matter. First, put <code>vrf member</code> <b>before</b> <code>ip address</code>: on NX-OS, changing an interface's VRF removes its Layer-3 configuration, so if you add the VRF afterwards, the IP disappears. Second, <code>fabric forwarding mode anycast-gateway</code> is per SVI; without it the SVI uses the switch's own system MAC, and each leaf would answer ARP for the same IP with a different MAC.</p>

<h3>Host mobility</h3>
<p>When a VM moves from LEAF1 to LEAF9 (for example by vMotion), three things happen:</p>
<ol>
<li>The hypervisor sends a gratuitous ARP or RARP from the VM's new port. LEAF9 learns the MAC (and IP) locally.</li>
<li>LEAF9 advertises a type-2 route for the MAC with a higher <b>MAC mobility sequence number</b> (an extended community). Every leaf, including LEAF1, sees that the new route has a higher sequence and prefers it. LEAF1 withdraws its old route.</li>
<li>The VM's ARP cache still says "gateway 172.16.10.1 is 0000.2222.3333", which is correct on LEAF9 too. No traffic is lost waiting for ARP to time out.</li>
</ol>
<p>If a MAC or IP moves back and forth too often (a loop, or two hosts using the same IP), NX-OS detects a duplicate. By default an IP that moves 5 times within 180 seconds is treated as a duplicate and learning is frozen for a while; the timers are tunable with <code>fabric forwarding dup-host-ip-addr-detection</code>.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show running-config | include anycast-gateway-mac
<span class="hl">fabric forwarding anycast-gateway-mac 0000.2222.3333</span>
LEAF1# show interface Vlan10
Vlan10 is up, line protocol is up, autostate enabled
<span class="hl">  Hardware is EtherSVI, address is  0000.2222.3333</span>
  Internet Address is 172.16.10.1/24
SRV1&gt; ping 172.16.10.1
84 bytes from 172.16.10.1 icmp_seq=1 ttl=255 time=1.412 ms</pre>
<p>Check the same line on every leaf. Lab 5 contains a leaf where it reads 0000.2222.3334.</p>

<div class="eg"><p><b>Worked example.</b> 800 VMs move between racks during a maintenance evacuation. With a per-rack gateway MAC, each VM would keep sending to the old MAC until its ARP entry for the gateway expired; many operating systems keep that entry for minutes, so hundreds of VMs lose routed connectivity at once. With one anycast MAC, every VM's first packet after the move is routed by its new leaf. Downtime per VM is limited to the vMotion switchover itself.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Different anycast MACs on different leaves; forgetting <code>feature fabric forwarding</code>; adding <code>vrf member</code> after the IP address; configuring HSRP on the same SVI; giving the anycast gateway a per-leaf IP (the IP must be identical everywhere).</p></div>
<div class="exam"><p><b>Exam trap.</b> The anycast gateway MAC is configured <b>globally</b> with <code>fabric forwarding anycast-gateway-mac</code>; the SVI only says <code>fabric forwarding mode anycast-gateway</code>. Both the gateway IP and the MAC must be identical across all leaves.</p></div>

<div class="scn"><h4>VM moved, gateway gone</h4><p>After a vMotion from rack 3 to rack 9, a VM's default gateway stopped answering for about ten minutes, then recovered by itself. Bridged traffic in the same VLAN worked the whole time. The engineer compared <code>show running-config | include anycast-gateway-mac</code>: LEAF3 had 0000.2222.3333, LEAF9 had 0000.2222.3334, a leftover from a lab build. The VM kept sending routed traffic to the old gateway MAC, which LEAF9 did not own, until the VM's ARP entry aged out. Setting the same MAC on every leaf fixed it permanently, and the team added a compliance check to their automation.</p><p><b>Lesson:</b> the anycast gateway only works if it is truly identical everywhere: same IP, same MAC.</p></div>

<div class="iv"><p class="q">"What is the distributed anycast gateway and how does it help VM mobility?"</p><p>Strong answer: every leaf hosting a subnet has an SVI with the same gateway IP and the same global virtual MAC (fabric forwarding anycast-gateway-mac, fabric forwarding mode anycast-gateway on the SVI). Each leaf routes for its local hosts, so there is no hair-pinning and no FHRP hellos. When a VM moves, its ARP entry for the gateway stays valid on the new leaf; EVPN MAC mobility sequence numbers make the new location win. Mention that a MAC mismatch between leaves breaks routed traffic after a move.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every leaf hosts the same gateway IP and the same virtual MAC for a subnet.</li>
<li>Global: feature fabric forwarding and fabric forwarding anycast-gateway-mac; per SVI: fabric forwarding mode anycast-gateway.</li>
<li>Configure vrf member before ip address on the SVI.</li>
<li>Host moves are handled by type-2 routes with higher MAC mobility sequence numbers.</li>
<li>No HSRP/VRRP, no hair-pinning; first-hop routing on the local leaf.</li>
</ul></div>
`,hi:`
<p>Ek national bank chahta hai ki har customer ka "sabse paas wala branch" hi uska branch ho. Ek head office jahan sabko line lagani pade, uski jagah woh har mohalle mein ek counter kholta hai, har ek ka same naam, same phone number aur same services. Ghar badalne wala customer bas naye mohalle ke counter par jaata hai aur kuch badle bina serve ho jaata hai. <b>Distributed anycast gateway</b> default gateways ke liye yahi karta hai: har leaf ek subnet ke liye same gateway IP aur same gateway MAC dikhata hai, isliye har host ka gateway hamesha ek hop door, uske apne leaf par hota hai, host jahan bhi rahe ya move kare.</p>

<h3>Central gateway ki problem</h3>
<p>HSRP ya VRRP jaise traditional first-hop redundancy protocol mein do routers ek virtual IP aur virtual MAC share karte hain, aur unmein se ek active hota hai. 40 leaves wale fabric mein rack 30 ke host ko har inter-subnet packet fabric ke paar active gateway tak bhejna padta hai, shayad rack 1 mein, aur phir wapas: classic hair-pin. Active router bottleneck bhi hai aur bhaari load ka single point bhi. VXLAN par HSRP failana cheezein aur bigaadta hai: extra hellos, split-brain risks aur asymmetric paths.</p>

<h3>Anycast gateway ka idea</h3>
<ul>
<li>Har leaf jo VLAN 10 host karta hai, uske paas <b>same IP</b>, 172.16.10.1/24, wala <code>interface Vlan10</code> hai.</li>
<li>Har leaf saare anycast SVIs ke liye <b>same virtual MAC</b> use karta hai, jo ek baar globally set hota hai: <code>fabric forwarding anycast-gateway-mac 0000.2222.3333</code>.</li>
<li>Koi hellos nahi aur koi active/standby roles nahi: har leaf apne local hosts ke liye active hai. Leaves gateway IP/MAC ko remote host ki tarah advertise nahi karte, isliye koi conflict nahi.</li>
</ul>
<p>Jab SRV1 172.16.10.1 ke liye ARP karta hai, uska apna leaf 0000.2222.3333 se jawab deta hai aur packet turant route karta hai. Isiliye symmetric IRB (chapter 7) ingress leaf par routing shuru karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Har leaf par same gateway">
<rect x="20" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="13">LEAF1 Vlan10</text><text x="110" y="72" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.1 / 0000.2222.3333</text>
<rect x="230" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">LEAF2 Vlan10</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.1 / 0000.2222.3333</text>
<rect x="440" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">LEAF9 Vlan10</text><text x="530" y="72" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.1 / 0000.2222.3333</text>
<rect x="60" y="150" width="100" height="36" rx="6" fill="#fde68a"/><text x="110" y="173" text-anchor="middle" class="svg-ink" font-size="12">VM (pehle)</text>
<rect x="480" y="150" width="100" height="36" rx="6" fill="#fde68a"/><text x="530" y="173" text-anchor="middle" class="svg-ink" font-size="12">VM (baad mein)</text>
<line x1="110" y1="90" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="530" y1="90" x2="530" y2="150" stroke="#64748b" stroke-width="2"/>
<path d="M160 168 L480 168" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4" fill="none"/><text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">vMotion: gateway IP aur MAC wahi</text>
</svg><p class="cap">Har leaf same gateway ke liye jawab deta hai. Move hui VM gateway ki apni ARP entry rakhti hai aur chalti rehti hai.</p></div>

<h3>Configuration (lab 3, tasks 1 aur 3)</h3>
<pre class="code"><span class="c">! har leaf par: bilkul same</span>
feature interface-vlan
feature fabric forwarding
fabric forwarding anycast-gateway-mac 0000.2222.3333
<span class="c">! LEAF1: VLAN 10 ka gateway</span>
interface Vlan10
  no shutdown
  vrf member TENANT-A
  ip address 172.16.10.1/24
  fabric forwarding mode anycast-gateway
<span class="c">! LEAF2: VLAN 20 ka gateway</span>
interface Vlan20
  no shutdown
  vrf member TENANT-A
  ip address 172.16.20.1/24
  fabric forwarding mode anycast-gateway</pre>
<p>Do details zaroori hain. Pehla, <code>vrf member</code> ko <code>ip address</code> se <b>pehle</b> daalo: NX-OS par interface ka VRF badalne se uska Layer-3 configuration hat jaata hai, to agar VRF baad mein jodoge to IP gayab ho jaayega. Doosra, <code>fabric forwarding mode anycast-gateway</code> har SVI par hota hai; iske bina SVI switch ka apna system MAC use karta hai, aur har leaf same IP ke ARP ka jawab alag MAC se dega.</p>

<h3>Host mobility</h3>
<p>Jab ek VM LEAF1 se LEAF9 par move hoti hai (jaise vMotion se), to teen cheezein hoti hain:</p>
<ol>
<li>Hypervisor VM ke naye port se gratuitous ARP ya RARP bhejta hai. LEAF9 MAC (aur IP) locally seekhta hai.</li>
<li>LEAF9 MAC ke liye ek type-2 route advertise karta hai jismein zyada <b>MAC mobility sequence number</b> hota hai (ek extended community). Har leaf, LEAF1 bhi, dekhta hai ki naye route ka sequence zyada hai aur use prefer karta hai. LEAF1 apna purana route withdraw karta hai.</li>
<li>VM ki ARP cache abhi bhi kehti hai "gateway 172.16.10.1 is 0000.2222.3333", jo LEAF9 par bhi sahi hai. ARP timeout ke intezaar mein koi traffic nahi khota.</li>
</ol>
<p>Agar ek MAC ya IP bahut baar idhar-udhar move ho (loop, ya do hosts same IP use kar rahe hon), to NX-OS duplicate detect karta hai. Default mein jo IP 180 second mein 5 baar move ho use duplicate maana jaata hai aur kuch der ke liye learning freeze hoti hai; timers <code>fabric forwarding dup-host-ip-addr-detection</code> se tune hote hain.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show running-config | include anycast-gateway-mac
<span class="hl">fabric forwarding anycast-gateway-mac 0000.2222.3333</span>
LEAF1# show interface Vlan10
Vlan10 is up, line protocol is up, autostate enabled
<span class="hl">  Hardware is EtherSVI, address is  0000.2222.3333</span>
  Internet Address is 172.16.10.1/24
SRV1&gt; ping 172.16.10.1
84 bytes from 172.16.10.1 icmp_seq=1 ttl=255 time=1.412 ms</pre>
<p>Har leaf par yahi line check karo. Lab 5 mein ek leaf hai jahan yeh 0000.2222.3334 padhti hai.</p>

<div class="eg"><p><b>Worked example.</b> Maintenance evacuation ke dauraan 800 VMs racks ke beech move hoti hain. Har rack ke alag gateway MAC ke saath, har VM purane MAC ko bhejti rehti jab tak gateway ki ARP entry expire na ho; kai operating systems woh entry minutes tak rakhte hain, isliye sainkdon VMs ek saath routed connectivity kho deti. Ek anycast MAC ke saath move ke baad har VM ka pehla packet uska naya leaf route karta hai. Har VM ka downtime sirf vMotion switchover jitna rehta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Alag leaves par alag anycast MACs; <code>feature fabric forwarding</code> bhoolna; IP address ke baad <code>vrf member</code> jodna; same SVI par HSRP configure karna; anycast gateway ko har leaf par alag IP dena (IP har jagah same hona chahiye).</p></div>
<div class="exam"><p><b>Exam trap.</b> Anycast gateway MAC <b>globally</b> <code>fabric forwarding anycast-gateway-mac</code> se configure hota hai; SVI sirf <code>fabric forwarding mode anycast-gateway</code> kehta hai. Gateway IP aur MAC dono saare leaves par same hone chahiye.</p></div>

<div class="scn"><h4>VM move hui, gateway gayab</h4><p>Rack 3 se rack 9 par vMotion ke baad ek VM ka default gateway lagbhag das minute jawab nahi deta raha, phir apne aap theek ho gaya. Same VLAN ka bridged traffic poore time chalta raha. Engineer ne <code>show running-config | include anycast-gateway-mac</code> milaya: LEAF3 par 0000.2222.3333 tha, LEAF9 par 0000.2222.3334, jo ek lab build se bacha tha. VM routed traffic purane gateway MAC ko bhejti rahi, jo LEAF9 ka tha hi nahi, jab tak VM ki ARP entry age out nahi hui. Har leaf par same MAC set karne se yeh hamesha ke liye theek hua, aur team ne apni automation mein ek compliance check joda.</p><p><b>Seekh:</b> anycast gateway tabhi kaam karta hai jab woh sach mein har jagah same ho: same IP, same MAC.</p></div>

<div class="iv"><p class="q">"Distributed anycast gateway kya hai aur yeh VM mobility mein kaise madad karta hai?"</p><p>Strong answer: subnet host karne wale har leaf par same gateway IP aur same global virtual MAC wala SVI hota hai (fabric forwarding anycast-gateway-mac, SVI par fabric forwarding mode anycast-gateway). Har leaf apne local hosts ke liye route karta hai, isliye na hair-pinning, na FHRP hellos. VM move hone par gateway ki uski ARP entry naye leaf par valid rehti hai; EVPN MAC mobility sequence numbers nayi location ko jitate hain. Batao ki leaves ke beech MAC mismatch move ke baad routed traffic tod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har leaf subnet ke liye same gateway IP aur same virtual MAC host karta hai.</li>
<li>Global: feature fabric forwarding aur fabric forwarding anycast-gateway-mac; har SVI par: fabric forwarding mode anycast-gateway.</li>
<li>SVI par vrf member ko ip address se pehle configure karo.</li>
<li>Host moves zyada MAC mobility sequence numbers wale type-2 routes se handle hote hain.</li>
<li>Na HSRP/VRRP, na hair-pinning; first-hop routing local leaf par.</li>
</ul></div>
`}};export{e as default};