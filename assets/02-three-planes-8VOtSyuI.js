var e={id:`three-planes`,h:{en:`Device hardening across the three planes`,hi:`Teen planes mein device hardening`},body:{en:`
<p>A castle is not defended by one wall. It has a moat for the crowd outside, guards at the gate who check every messenger, and a locked tower for the king's seal. Hardening a router or firewall works the same way: different traffic reaches different parts of the device, and each part needs its own defence. SCOR calls this <b>device hardening of network infrastructure</b>, split across the data, control and management planes plus routing protocol security.</p>

<h3>Step 1: know which traffic hits the CPU</h3>
<p>Most packets are <b>transit</b> traffic: they enter one interface and leave another, switched in hardware without the CPU looking at them. Some packets are <b>receive</b> (to-the-box) traffic: an OSPF hello, an SSH login, an SNMP poll, an NTP reply, a ping to the router's own address. These are "punted" to the route processor. Attackers love the punt path, because a small flood of to-the-box packets can drive the CPU to 100 percent and take down routing and management together.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Transit versus punted traffic">
<rect x="20" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="13">Ingress port</text>
<rect x="260" y="100" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="325" y="140" text-anchor="middle" class="svg-muted" font-size="12">hardware, ACL, uRPF</text>
<rect x="500" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="13">Egress port</text>
<line x1="140" y1="125" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="500" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="445" y="115" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="240" y="10" width="170" height="50" rx="8" fill="#fde68a"/><text x="325" y="32" text-anchor="middle" class="svg-ink" font-size="13">CoPP policer</text><text x="325" y="50" text-anchor="middle" class="svg-muted" font-size="12">control-plane</text>
<line x1="325" y1="100" x2="325" y2="60" stroke="#64748b" stroke-width="2"/><text x="360" y="85" class="svg-accent" font-size="12">punt</text>
<rect x="440" y="10" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Route processor</text><text x="530" y="50" text-anchor="middle" class="svg-muted" font-size="12">OSPF, SSH, SNMP, NTP</text>
<line x1="410" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Data plane protection sits in the forwarding path;</text>
<text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">control and management traffic must pass CoPP first.</text>
</svg><p class="cap">Transit traffic stays in hardware; to-the-box traffic is punted to the CPU through Control Plane Policing.</p></div>

<h3>Data plane: filter what passes through</h3>
<ul>
<li><b>Infrastructure ACLs (iACLs)</b> at the edge deny outside traffic addressed to your own router and switch addresses, while permitting transit traffic to servers.</li>
<li><b>uRPF</b> (<code>ip verify unicast source reachable-via rx</code>, strict mode) drops packets whose source address would not be routed back out of the same interface, which stops most spoofed sources.</li>
<li><b>Disable risky features</b>: <code>no ip source-route</code>, <code>no ip directed-broadcast</code> (default today), <code>no ip proxy-arp</code> and <code>no ip redirects</code> on untrusted interfaces.</li>
<li><b>Layer 2 security</b> (port security, DHCP snooping, DAI, IPSG) was the whole of the previous module; refer back to it for access ports.</li>
</ul>

<h3>Control plane: police the CPU and authenticate neighbours</h3>
<p><b>Control Plane Policing (CoPP)</b> applies a QoS policy to the virtual <code>control-plane</code> interface, so each class of punted traffic gets a rate limit. Catalyst 9000 switches ship with a system CoPP policy you can tune; routers let you build one with the MQC:</p>
<pre class="code"><span class="c">! classify to-the-box traffic</span>
ip access-list extended COPP-ROUTING
 permit ospf any any
ip access-list extended COPP-MGMT
 permit tcp 10.10.11.0 0.0.0.255 any eq 22
 permit udp host 10.10.10.200 eq 123 any
class-map match-all CM-ROUTING
 match access-group name COPP-ROUTING
class-map match-all CM-MGMT
 match access-group name COPP-MGMT
policy-map PM-COPP
 class CM-ROUTING
  police 512000 conform-action transmit exceed-action transmit
 class CM-MGMT
  police 256000 conform-action transmit exceed-action drop
 class class-default
  police 64000 conform-action transmit exceed-action drop
<span class="c">! attach it to the CPU</span>
control-plane
 service-policy input PM-COPP</pre>
<p><b>Routing protocol security</b> stops a rogue router from injecting routes. Authenticate every adjacency and prefer SHA over MD5 where the protocol supports it:</p>
<pre class="code"><span class="c">! OSPF with an HMAC-SHA-256 key chain</span>
key chain OSPF-KC
 key 1
  key-string NK-Ospf-26
  cryptographic-algorithm hmac-sha-256
interface GigabitEthernet0/1
 ip ospf authentication key-chain OSPF-KC
<span class="c">! eBGP: TCP MD5 password and GTSM (TTL security)</span>
router bgp 65010
 neighbor 203.0.113.2 password NK-Bgp-26
 neighbor 203.0.113.2 ttl-security hops 1</pre>
<p>Add <b>passive interfaces</b> so routing hellos never go out toward users, and <b>prefix filters</b> so even an authenticated neighbour cannot advertise something it should not.</p>

<h3>Management plane: the rest of this module</h3>
<p>The management plane is protected by: personal accounts through AAA (chapters 3 to 5), SNMPv3 (chapter 6), authenticated NTP (chapter 7), exported and timestamped logs (chapter 8), SSH-only access with an <code>access-class</code> (chapter 9), secure file transfer (chapter 10) and an audit against a benchmark (chapter 11). On platforms that support it, <b>Management Plane Protection</b> restricts management protocols to named interfaces:</p>
<pre class="code">control-plane host
 management-interface GigabitEthernet0/0 allow ssh snmp</pre>
<p>Many networks go further with <b>out-of-band management</b>: a separate management VRF or physical network (the <code>Mgmt-vrf</code> and GigabitEthernet0/0 port on Catalyst switches) that user traffic can never reach.</p>

<div class="eg"><p><b>Worked example.</b> An edge router receives 80,000 packets per second of spoofed SSH SYNs aimed at its public address. Without CoPP, the CPU hits 99 percent and OSPF hellos are missed, so the dead interval (40 seconds) expires and the WAN adjacency drops. With the policy above, the SYNs fall into CM-MGMT only if they come from 10.10.11.0/24; the rest land in class-default and are policed to 64 kbps. OSPF stays in its own class, the adjacency never flaps, and the CPU stays below 20 percent.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing a CoPP policy whose class-default is so tight that you forgot a protocol, such as BGP, BFD or NTP, and it gets dropped. Always start with <code>exceed-action transmit</code> to measure with <code>show policy-map control-plane</code>, then tighten.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoPP protects the CPU from to-the-box traffic; it does nothing for transit traffic. uRPF and iACLs are data-plane tools. Routing protocol authentication is a control-plane protection, not a management-plane one.</p></div>

<div class="scn"><h4>The lab router that became a neighbour</h4><p>A trainee connected a lab router to a production access switch. Its OSPF process advertised a default route with a better cost and pulled the whole floor's internet traffic into the lab. The distribution switches had no OSPF authentication and no passive interfaces on user VLANs. The fix: passive-interface default with explicit non-passive uplinks, and an HMAC-SHA-256 key chain on every real adjacency.</p><p><b>Lesson:</b> routing protocol authentication and passive interfaces are control-plane hardening, and they stop accidents as well as attacks.</p></div>

<div class="iv"><p class="q">"How would you protect a router's CPU from a flood of packets?"</p><p>Explain the punt path, then CoPP: classify to-the-box traffic with ACLs into classes (routing, management, monitoring, undesired), police each class, attach the policy with <code>service-policy input</code> under <code>control-plane</code>, and verify with <code>show policy-map control-plane</code>. Mention that infrastructure ACLs at the edge and MPP reduce what even reaches CoPP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transit traffic stays in hardware; to-the-box traffic is punted to the CPU and must be policed.</li>
<li>Data plane: iACLs, uRPF, disabling source-route, proxy ARP and redirects, plus Layer 2 security.</li>
<li>Control plane: CoPP on the control-plane interface, and authenticated routing (OSPF SHA key chains, BGP password and GTSM).</li>
<li>Management plane: AAA, SNMPv3, NTP authentication, syslog, SSH with access-class, MPP and out-of-band management.</li>
<li>Test CoPP by measuring first, then tightening, so you never drop your own routing protocols.</li>
</ul></div>
`,hi:`
<p>Ek kila ek deewar se defend nahi hota. Bahar ki bheed ke liye khaai hoti hai, gate par guards hote hain jo har messenger ko check karte hain, aur raja ki mohar ke liye ek locked tower hota hai. Router ya firewall ko harden karna bhi aise hi kaam karta hai: alag traffic device ke alag hisson tak pahunchta hai, aur har hisse ko apna defence chahiye. SCOR ise <b>network infrastructure ki device hardening</b> kehta hai, jo data, control aur management planes plus routing protocol security mein bati hai.</p>

<h3>Step 1: jaano kaunsa traffic CPU ko hit karta hai</h3>
<p>Zyada tar packets <b>transit</b> traffic hote hain: ek interface se aate hain aur doosre se nikalte hain, hardware mein switch hote hain bina CPU ke dekhe. Kuch packets <b>receive</b> (box ke liye) traffic hote hain: OSPF hello, SSH login, SNMP poll, NTP reply, router ke apne address par ping. Yeh route processor ko "punt" hote hain. Attackers punt path ko pasand karte hain, kyunki box ke liye aane wale packets ki chhoti si flood bhi CPU ko 100 percent tak le ja sakti hai aur routing aur management dono ko ek saath gira sakti hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Transit vs punted traffic">
<rect x="20" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="13">Ingress port</text>
<rect x="260" y="100" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="325" y="140" text-anchor="middle" class="svg-muted" font-size="12">hardware, ACL, uRPF</text>
<rect x="500" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="13">Egress port</text>
<line x1="140" y1="125" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="500" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="445" y="115" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="240" y="10" width="170" height="50" rx="8" fill="#fde68a"/><text x="325" y="32" text-anchor="middle" class="svg-ink" font-size="13">CoPP policer</text><text x="325" y="50" text-anchor="middle" class="svg-muted" font-size="12">control-plane</text>
<line x1="325" y1="100" x2="325" y2="60" stroke="#64748b" stroke-width="2"/><text x="360" y="85" class="svg-accent" font-size="12">punt</text>
<rect x="440" y="10" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Route processor</text><text x="530" y="50" text-anchor="middle" class="svg-muted" font-size="12">OSPF, SSH, SNMP, NTP</text>
<line x1="410" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Data plane protection forwarding path mein hai;</text>
<text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">control aur management traffic pehle CoPP se guzarta hai.</text>
</svg><p class="cap">Transit traffic hardware mein rehta hai; box ke liye traffic Control Plane Policing se hokar CPU ko punt hota hai.</p></div>

<h3>Data plane: jo guzarta hai use filter karo</h3>
<ul>
<li>Edge par <b>Infrastructure ACLs (iACLs)</b> bahar ke us traffic ko deny karte hain jo aapke apne router aur switch addresses ke liye hai, jabki servers ke transit traffic ko permit karte hain.</li>
<li><b>uRPF</b> (<code>ip verify unicast source reachable-via rx</code>, strict mode) un packets ko drop karta hai jinka source address usi interface se wapas route nahi hota, jo zyada tar spoofed sources rok deta hai.</li>
<li><b>Risky features band karo</b>: untrusted interfaces par <code>no ip source-route</code>, <code>no ip directed-broadcast</code> (aaj default hai), <code>no ip proxy-arp</code> aur <code>no ip redirects</code>.</li>
<li><b>Layer 2 security</b> (port security, DHCP snooping, DAI, IPSG) pichhla poora module tha; access ports ke liye wahan wapas dekho.</li>
</ul>

<h3>Control plane: CPU ko police karo aur neighbours ko authenticate karo</h3>
<p><b>Control Plane Policing (CoPP)</b> virtual <code>control-plane</code> interface par ek QoS policy lagata hai, taaki punted traffic ki har class ko ek rate limit mile. Catalyst 9000 switches ek system CoPP policy ke saath aate hain jise aap tune kar sakte ho; routers par aap MQC se khud bana sakte ho:</p>
<pre class="code"><span class="c">! box ke liye traffic classify karo</span>
ip access-list extended COPP-ROUTING
 permit ospf any any
ip access-list extended COPP-MGMT
 permit tcp 10.10.11.0 0.0.0.255 any eq 22
 permit udp host 10.10.10.200 eq 123 any
class-map match-all CM-ROUTING
 match access-group name COPP-ROUTING
class-map match-all CM-MGMT
 match access-group name COPP-MGMT
policy-map PM-COPP
 class CM-ROUTING
  police 512000 conform-action transmit exceed-action transmit
 class CM-MGMT
  police 256000 conform-action transmit exceed-action drop
 class class-default
  police 64000 conform-action transmit exceed-action drop
<span class="c">! CPU par attach karo</span>
control-plane
 service-policy input PM-COPP</pre>
<p><b>Routing protocol security</b> ek rogue router ko routes inject karne se rokti hai. Har adjacency authenticate karo aur jahan protocol support kare wahan MD5 ki jagah SHA prefer karo:</p>
<pre class="code"><span class="c">! HMAC-SHA-256 key chain ke saath OSPF</span>
key chain OSPF-KC
 key 1
  key-string NK-Ospf-26
  cryptographic-algorithm hmac-sha-256
interface GigabitEthernet0/1
 ip ospf authentication key-chain OSPF-KC
<span class="c">! eBGP: TCP MD5 password aur GTSM (TTL security)</span>
router bgp 65010
 neighbor 203.0.113.2 password NK-Bgp-26
 neighbor 203.0.113.2 ttl-security hops 1</pre>
<p><b>Passive interfaces</b> jodo taaki routing hellos kabhi users ki taraf na jaayein, aur <b>prefix filters</b> taaki authenticated neighbour bhi woh advertise na kar sake jo use nahi karna chahiye.</p>

<h3>Management plane: is module ka baaki hissa</h3>
<p>Management plane in cheezon se protect hota hai: AAA se personal accounts (chapters 3 se 5), SNMPv3 (chapter 6), authenticated NTP (chapter 7), exported aur timestamped logs (chapter 8), <code>access-class</code> ke saath sirf-SSH access (chapter 9), secure file transfer (chapter 10) aur benchmark ke against audit (chapter 11). Jin platforms par support hai, wahan <b>Management Plane Protection</b> management protocols ko named interfaces tak seemit karta hai:</p>
<pre class="code">control-plane host
 management-interface GigabitEthernet0/0 allow ssh snmp</pre>
<p>Kai networks aur aage jaate hain <b>out-of-band management</b> ke saath: ek alag management VRF ya physical network (Catalyst switches par <code>Mgmt-vrf</code> aur GigabitEthernet0/0 port) jahan user traffic kabhi nahi pahunch sakta.</p>

<div class="eg"><p><b>Worked example.</b> Ek edge router ko uske public address par 80,000 packets per second ke spoofed SSH SYNs milte hain. CoPP ke bina, CPU 99 percent par pahunchta hai aur OSPF hellos miss hote hain, to dead interval (40 seconds) expire hota hai aur WAN adjacency gir jaati hai. Upar wali policy ke saath, SYNs CM-MGMT mein sirf tab aate hain jab woh 10.10.11.0/24 se hon; baaki class-default mein girte hain aur 64 kbps tak police hote hain. OSPF apni class mein rehta hai, adjacency kabhi flap nahi hoti, aur CPU 20 percent se neeche rehta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Aisi CoPP policy likhna jiski class-default itni tight ho ki aap koi protocol bhool gaye, jaise BGP, BFD ya NTP, aur woh drop ho jaaye. Hamesha <code>exceed-action transmit</code> se shuru karo, <code>show policy-map control-plane</code> se measure karo, phir tight karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoPP CPU ko box ke liye aane wale traffic se bachata hai; transit traffic ke liye kuch nahi karta. uRPF aur iACLs data-plane tools hain. Routing protocol authentication control-plane protection hai, management-plane wali nahi.</p></div>

<div class="scn"><h4>Lab router jo neighbour ban gaya</h4><p>Ek trainee ne lab router ko production access switch se jod diya. Uske OSPF process ne behtar cost ke saath default route advertise kiya aur poore floor ka internet traffic lab mein kheench liya. Distribution switches par na OSPF authentication thi na user VLANs par passive interfaces. Fix: passive-interface default ke saath explicit non-passive uplinks, aur har asli adjacency par HMAC-SHA-256 key chain.</p><p><b>Seekh:</b> routing protocol authentication aur passive interfaces control-plane hardening hain, aur yeh attacks ke saath accidents bhi rokte hain.</p></div>

<div class="iv"><p class="q">"Aap router ke CPU ko packets ki flood se kaise bachaoge?"</p><p>Punt path samjhao, phir CoPP: box ke liye traffic ko ACLs se classes (routing, management, monitoring, undesired) mein classify karo, har class ko police karo, policy ko <code>control-plane</code> ke neeche <code>service-policy input</code> se attach karo, aur <code>show policy-map control-plane</code> se verify karo. Batao ki edge par infrastructure ACLs aur MPP woh traffic kam karte hain jo CoPP tak pahunchta hi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transit traffic hardware mein rehta hai; box ke liye traffic CPU ko punt hota hai aur use police karna zaroori hai.</li>
<li>Data plane: iACLs, uRPF, source-route, proxy ARP aur redirects band karna, plus Layer 2 security.</li>
<li>Control plane: control-plane interface par CoPP, aur authenticated routing (OSPF SHA key chains, BGP password aur GTSM).</li>
<li>Management plane: AAA, SNMPv3, NTP authentication, syslog, access-class ke saath SSH, MPP aur out-of-band management.</li>
<li>CoPP ko pehle measure karke, phir tight karke test karo, taaki aap kabhi apne hi routing protocols drop na karo.</li>
</ul></div>
`}};export{e as default};