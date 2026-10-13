var e={id:`load-sharing-glbp`,h:{en:`Load sharing: multiple HSRP groups, STP alignment and GLBP`,hi:`Load sharing: kai HSRP groups, STP alignment aur GLBP`},body:{en:`
<p>A toll plaza with two booths where only one is ever open is redundant but wasteful: half the capacity sits idle until the first booth breaks. HSRP and VRRP groups work that way; one router forwards, the other waits. Paying for two 1 Gbps ISP links and using one is hard to justify to a manager. There are two ways to use both: run <b>several groups</b> and split the hosts, or use <b>GLBP</b>, which splits hosts automatically inside one group.</p>

<h3>Multiple HSRP groups (MHSRP)</h3>
<p>On the same subnet you can run two groups with two VIPs. R1 is Active for group 1 and Standby for group 2; R2 is the opposite. Half the hosts use gateway .1, the other half .254, usually by handing out two DHCP scopes or two DHCP pools with different default routers.</p>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 priority 110
 standby 1 preempt
 standby 2 ip 192.168.20.254
 standby 2 preempt
<span class="c">! R2</span>
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 preempt
 standby 2 ip 192.168.20.254
 standby 2 priority 110
 standby 2 preempt</pre>
<p>The limitation is administrative: the split is only as even as your DHCP design. In campus networks with many VLANs, the more common form of load sharing is <b>per VLAN</b>: distribution switch D1 is Active for odd VLANs, D2 for even VLANs.</p>

<h3>Align HSRP with Spanning Tree</h3>
<p>In a Layer 2 access design with a loop, STP blocks one uplink per VLAN. If D1 is the HSRP Active for VLAN 10 but D2 is the STP root, traffic from the access switch goes up to D2 on the forwarding link, crosses the inter-switch link to D1, and only then gets routed. The fix is simple and very commonly tested: <b>make the same switch the STP root and the HSRP Active for each VLAN</b>.</p>
<pre class="code"><span class="c">! D1: root and Active for VLAN 10, secondary for VLAN 20</span>
spanning-tree vlan 10 root primary
spanning-tree vlan 20 root secondary
interface Vlan10
 standby 10 ip 10.10.10.1
 standby 10 priority 110
 standby 10 preempt
interface Vlan20
 standby 20 ip 10.10.20.1
 standby 20 preempt</pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="GLBP AVG and AVFs">
<rect x="70" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="170" y="54" text-anchor="middle" class="svg-ink" font-size="13">R1: AVG + AVF 1</text><text x="170" y="74" text-anchor="middle" class="svg-muted" font-size="12">0007.b400.0101</text>
<rect x="370" y="30" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="470" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2: AVF 2</text><text x="470" y="74" text-anchor="middle" class="svg-muted" font-size="12">0007.b400.0102</text>
<rect x="60" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="120" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC-A</text>
<rect x="260" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC-B</text>
<rect x="460" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="520" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC-C</text>
<line x1="120" y1="170" x2="150" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="450" y2="90" stroke="#64748b" stroke-width="2"/><line x1="520" y1="170" x2="200" y2="90" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">ARP for VIP .1 answered with different MACs</text>
</svg><p class="cap">GLBP: one VIP, but the AVG answers each host's ARP with a different forwarder's virtual MAC.</p></div>

<h3>GLBP: load sharing inside one group</h3>
<p><b>Gateway Load Balancing Protocol</b> (Cisco proprietary) gives all hosts the same gateway IP but different gateway MACs:</p>
<ul>
<li>One router is elected <b>AVG</b> (Active Virtual Gateway) by highest priority (default 100), then highest IP. It answers every ARP request for the VIP.</li>
<li>Up to four routers are <b>AVFs</b> (Active Virtual Forwarders). The AVG assigns each one a virtual MAC <b>0007.b400.XXYY</b>, where XX is the group and YY the forwarder number (01 to 04).</li>
<li>Load-balancing method: <b>round-robin</b> (default, each ARP reply gets the next MAC), <b>weighted</b> (in proportion to each AVF's weight) or <b>host-dependent</b> (a host always gets the same MAC; needed with stateful NAT).</li>
<li>Hellos go to 224.0.0.102 on UDP 3222. AVG preemption is off by default; AVF preemption is on by default.</li>
<li>If an AVF fails, another AVF takes over its virtual MAC, so hosts that learned it keep working.</li>
</ul>
<pre class="code">interface GigabitEthernet0/0
 glbp 1 ip 192.168.40.1
 glbp 1 priority 110
 glbp 1 preempt
 glbp 1 load-balancing round-robin
 glbp 1 weighting 100 lower 70 upper 90
 glbp 1 weighting track 10 decrement 40</pre>
<p>Tracking in GLBP lowers the <b>weight</b>, not the priority. If the weight falls below the lower threshold (70), the router stops acting as a forwarder; when it recovers above the upper threshold (90), it forwards again. Here, 100 - 40 = 60, below 70, so this router stops forwarding when track 10 goes Down.</p>

<div class="eg"><p><b>Worked example.</b> Three hosts ARP for 192.168.40.1 in order A, B, C with round-robin and two AVFs. A gets 0007.b400.0101 (R1), B gets 0007.b400.0102 (R2), C gets 0007.b400.0101 again. With weighted balancing and weights 100 and 50, R1 receives about two thirds of the new hosts.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using GLBP with a looped Layer 2 access design where STP blocks one path. Hosts sent to the forwarder on the blocked side cross the inter-switch link anyway. GLBP load sharing makes sense when both gateways are directly reachable from the hosts without a blocking link. Also check platform support: many modern switching platforms support only HSRP and VRRP.</p></div>

<div class="exam"><p><b>Exam trap.</b> HSRP and VRRP can load share only with multiple groups; GLBP load shares within one group. GLBP tracking changes weight, not priority. The GLBP MAC 0007.b400.XXYY has two variable fields: group and forwarder.</p></div>

<div class="scn"><h4>The inter-switch link at 95 percent</h4><p>A college campus had VLANs 10 to 40 on two distribution switches. The inter-switch link ran at 95 percent every afternoon, while both uplinks to the core were half empty. <code>show spanning-tree vlan 10</code> showed D2 as root, while <code>show standby brief</code> showed D1 as Active for every VLAN. All traffic went up to D2, across to D1 for routing, then back through D2 to the core. Aligning root and Active per VLAN (odd VLANs D1, even VLANs D2) dropped the link to 10 percent.</p><p><b>Lesson:</b> the HSRP Active and the STP root must be the same switch per VLAN.</p></div>

<div class="iv"><p class="q">"How can you use both gateways at the same time with an FHRP?"</p><p>Three answers, in order of preference. For HSRP or VRRP, use multiple groups: per-VLAN Active roles aligned with STP roots, or two groups on one subnet with split DHCP. For automatic per-host sharing within one group, GLBP with an AVG and up to four AVFs, round-robin, weighted or host-dependent. Mention that GLBP is Cisco-only and that tracking in GLBP reduces weight with lower and upper thresholds.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP/VRRP share load only with multiple groups: per VLAN or split hosts on one subnet.</li>
<li>Align the HSRP Active router with the STP root in every VLAN.</li>
<li>GLBP: AVG answers ARP, up to 4 AVFs, MAC 0007.b400.XXYY, UDP 3222 to 224.0.0.102.</li>
<li>GLBP methods: round-robin (default), weighted, host-dependent.</li>
<li>GLBP tracking lowers weight; below the lower threshold the router stops forwarding.</li>
</ul></div>
`,hi:`
<p>Do booths wala toll plaza jahan hamesha sirf ek khula ho, redundant hai lekin wasteful: pehla booth tootne tak aadhi capacity khaali baithi rehti hai. HSRP aur VRRP groups aise hi kaam karte hain; ek router forward karta hai, doosra intezaar. Do 1 Gbps ISP links ke paise dekar ek use karna manager ko samjhaana mushkil hai. Dono use karne ke do tareeke hain: <b>kai groups</b> chalao aur hosts baanto, ya <b>GLBP</b> use karo, jo ek group ke andar hosts ko apne aap baant deta hai.</p>

<h3>Kai HSRP groups (MHSRP)</h3>
<p>Same subnet par aap do VIPs ke saath do groups chala sakte ho. R1 group 1 ke liye Active aur group 2 ke liye Standby hai; R2 ulta. Aadhe hosts gateway .1 use karte hain, baaki aadhe .254, aam taur par do DHCP scopes ya alag default routers wale do DHCP pools dekar.</p>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 priority 110
 standby 1 preempt
 standby 2 ip 192.168.20.254
 standby 2 preempt
<span class="c">! R2</span>
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 preempt
 standby 2 ip 192.168.20.254
 standby 2 priority 110
 standby 2 preempt</pre>
<p>Limitation administrative hai: split utna hi barabar hai jitna aapka DHCP design. Kai VLANs wale campus networks mein load sharing ka zyada common roop <b>per VLAN</b> hai: distribution switch D1 odd VLANs ke liye Active, D2 even VLANs ke liye.</p>

<h3>HSRP ko Spanning Tree ke saath align karo</h3>
<p>Loop wale Layer 2 access design mein STP har VLAN ke liye ek uplink block karta hai. Agar VLAN 10 ke liye D1 HSRP Active hai lekin D2 STP root, to access switch ka traffic forwarding link par D2 tak jaata hai, inter-switch link cross karke D1 tak, aur tabhi route hota hai. Fix simple hai aur bahut common test hota hai: <b>har VLAN ke liye same switch ko STP root aur HSRP Active banao</b>.</p>
<pre class="code"><span class="c">! D1: VLAN 10 ke liye root aur Active, VLAN 20 ke liye secondary</span>
spanning-tree vlan 10 root primary
spanning-tree vlan 20 root secondary
interface Vlan10
 standby 10 ip 10.10.10.1
 standby 10 priority 110
 standby 10 preempt
interface Vlan20
 standby 20 ip 10.10.20.1
 standby 20 preempt</pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="GLBP AVG aur AVFs">
<rect x="70" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="170" y="54" text-anchor="middle" class="svg-ink" font-size="13">R1: AVG + AVF 1</text><text x="170" y="74" text-anchor="middle" class="svg-muted" font-size="12">0007.b400.0101</text>
<rect x="370" y="30" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="470" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2: AVF 2</text><text x="470" y="74" text-anchor="middle" class="svg-muted" font-size="12">0007.b400.0102</text>
<rect x="60" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="120" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC-A</text>
<rect x="260" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC-B</text>
<rect x="460" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="520" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC-C</text>
<line x1="120" y1="170" x2="150" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="450" y2="90" stroke="#64748b" stroke-width="2"/><line x1="520" y1="170" x2="200" y2="90" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">VIP .1 ke ARP ka jawab alag MACs se</text>
</svg><p class="cap">GLBP: ek VIP, lekin AVG har host ke ARP ka jawab alag forwarder ke virtual MAC se deta hai.</p></div>

<h3>GLBP: ek group ke andar load sharing</h3>
<p><b>Gateway Load Balancing Protocol</b> (Cisco proprietary) saare hosts ko same gateway IP lekin alag gateway MACs deta hai:</p>
<ul>
<li>Ek router sabse zyada priority (default 100), phir sabse zyada IP se <b>AVG</b> (Active Virtual Gateway) chuna jaata hai. Yeh VIP ke har ARP request ka jawab deta hai.</li>
<li>Chaar tak routers <b>AVFs</b> (Active Virtual Forwarders) hote hain. AVG har ek ko virtual MAC <b>0007.b400.XXYY</b> deta hai, jahan XX group aur YY forwarder number (01 se 04) hai.</li>
<li>Load-balancing method: <b>round-robin</b> (default, har ARP reply ko agla MAC), <b>weighted</b> (har AVF ke weight ke hisaab se) ya <b>host-dependent</b> (host ko hamesha same MAC; stateful NAT ke saath zaroori).</li>
<li>Hellos 224.0.0.102 par UDP 3222 par jaate hain. AVG preemption default mein off hai; AVF preemption default mein on.</li>
<li>Agar AVF fail ho, to doosra AVF uska virtual MAC le leta hai, to jin hosts ne use seekha tha woh chalte rehte hain.</li>
</ul>
<pre class="code">interface GigabitEthernet0/0
 glbp 1 ip 192.168.40.1
 glbp 1 priority 110
 glbp 1 preempt
 glbp 1 load-balancing round-robin
 glbp 1 weighting 100 lower 70 upper 90
 glbp 1 weighting track 10 decrement 40</pre>
<p>GLBP mein tracking <b>weight</b> kam karta hai, priority nahi. Agar weight lower threshold (70) se neeche gire, to router forwarder ka kaam band kar deta hai; upper threshold (90) se upar wapas aane par phir forward karta hai. Yahan 100 - 40 = 60, jo 70 se neeche hai, to track 10 Down hone par yeh router forward karna band karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Teen hosts round-robin aur do AVFs ke saath A, B, C order mein 192.168.40.1 ke liye ARP karte hain. A ko 0007.b400.0101 (R1) milta hai, B ko 0007.b400.0102 (R2), C ko phir 0007.b400.0101. Weights 100 aur 50 ke saath weighted balancing mein R1 ko lagbhag do-tihaai naye hosts milte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> GLBP ko looped Layer 2 access design ke saath use karna jahan STP ek path block karta hai. Blocked side ke forwarder par bheje gaye hosts phir bhi inter-switch link cross karte hain. GLBP load sharing tab samajh aata hai jab dono gateways hosts se bina blocking link ke seedhe reachable hon. Platform support bhi check karo: kai modern switching platforms sirf HSRP aur VRRP support karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> HSRP aur VRRP sirf kai groups se load share kar sakte hain; GLBP ek group ke andar load share karta hai. GLBP tracking weight badalta hai, priority nahi. GLBP MAC 0007.b400.XXYY mein do variable fields hain: group aur forwarder.</p></div>

<div class="scn"><h4>95 percent par inter-switch link</h4><p>Ek college campus mein do distribution switches par VLANs 10 se 40 the. Inter-switch link har dopahar 95 percent par chalta tha, jabki core ke dono uplinks aadhe khaali the. <code>show spanning-tree vlan 10</code> D2 ko root dikha raha tha, jabki <code>show standby brief</code> har VLAN ke liye D1 ko Active. Saara traffic D2 tak jaata, routing ke liye D1 tak cross karta, phir D2 ke through core wapas. Har VLAN ke liye root aur Active align karne se (odd VLANs D1, even VLANs D2) link 10 percent par aa gaya.</p><p><b>Seekh:</b> har VLAN ke liye HSRP Active aur STP root same switch hona chahiye.</p></div>

<div class="iv"><p class="q">"FHRP ke saath dono gateways ek saath kaise use kar sakte ho?"</p><p>Preference ke order mein teen jawab. HSRP ya VRRP ke liye kai groups use karo: STP roots ke saath aligned per-VLAN Active roles, ya split DHCP ke saath ek subnet par do groups. Ek group ke andar automatic per-host sharing ke liye GLBP, AVG aur chaar tak AVFs ke saath, round-robin, weighted ya host-dependent. Batao ki GLBP sirf Cisco ka hai aur GLBP mein tracking lower aur upper thresholds ke saath weight kam karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP/VRRP sirf kai groups se load share karte hain: per VLAN ya ek subnet par hosts baantkar.</li>
<li>Har VLAN mein HSRP Active router ko STP root ke saath align karo.</li>
<li>GLBP: AVG ARP ka jawab deta hai, 4 tak AVFs, MAC 0007.b400.XXYY, 224.0.0.102 par UDP 3222.</li>
<li>GLBP methods: round-robin (default), weighted, host-dependent.</li>
<li>GLBP tracking weight kam karta hai; lower threshold se neeche router forward karna band karta hai.</li>
</ul></div>
`}};export{e as default};