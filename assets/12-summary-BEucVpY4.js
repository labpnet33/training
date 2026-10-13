var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you check the tyres, fuel, lights and documents with a short list, not by rereading the car manual. This chapter is that list for PBR, VRF-lite and BFD: what you must be able to do, the words you must know, the facts the exam loves, and the commands in one place.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three tools summary">
<rect x="10" y="30" width="200" height="130" rx="10" fill="#fde68a"/><text x="110" y="56" text-anchor="middle" class="svg-ink" font-size="14">PBR</text><text x="110" y="84" text-anchor="middle" class="svg-muted" font-size="12">steer selected packets</text><text x="110" y="104" text-anchor="middle" class="svg-muted" font-size="12">ingress, route map</text><text x="110" y="124" text-anchor="middle" class="svg-muted" font-size="12">no match = normal</text>
<rect x="220" y="30" width="200" height="130" rx="10" fill="#bbf7d0"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="14">VRF-lite</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">separate tables</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">per-VRF protocols</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">leak on purpose</text>
<rect x="430" y="30" width="200" height="130" rx="10" fill="#bae6fd"/><text x="530" y="56" text-anchor="middle" class="svg-ink" font-size="14">BFD</text><text x="530" y="84" text-anchor="middle" class="svg-muted" font-size="12">detect in ms</text><text x="530" y="104" text-anchor="middle" class="svg-muted" font-size="12">async + echo</text><text x="530" y="124" text-anchor="middle" class="svg-muted" font-size="12">notify clients</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Choose the path, separate the paths, notice when a path dies</text>
</svg><p class="cap">The module in one picture.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why PBR is applied inbound and what happens to unmatched packets.</li>
<li>Configure PBR with a standard or extended ACL, <code>match length</code>, and each set clause, and predict the order in which set clauses are tried.</li>
<li>Add IP SLA and tracking with <code>set ip next-hop verify-availability</code>, and prove failover with <code>show track</code> and <code>show route-map</code>.</li>
<li>Steer router-originated traffic with <code>ip local policy route-map</code>.</li>
<li>Explain how summaries and Null0 discard routes affect <code>set ip default next-hop</code>.</li>
<li>Create a VRF, move interfaces into it, and run static, OSPF, EIGRP and BGP inside it.</li>
<li>Leak routes between a VRF and the global table in both directions, and limit the leak.</li>
<li>Use VRF-aware ping, traceroute and show commands.</li>
<li>Describe BFD async and echo modes, compute negotiated intervals and detection time, and register OSPF, EIGRP, BGP and static routes.</li>
<li>Walk the PBR troubleshooting order and diagnose VRF and BFD tickets from output.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PBR</dt><dd>Policy-based routing: forwarding decided by a route map on the ingress interface, before the routing table.</dd>
<dt>Local policy</dt><dd>PBR for traffic the router itself originates, <code>ip local policy route-map</code>.</dd>
<dt>verify-availability</dt><dd>PBR next hop used only while a track object is Up.</dd>
<dt>VRF</dt><dd>A separate routing and forwarding table on one router.</dd>
<dt>VRF-lite</dt><dd>VRFs without MPLS, separated hop by hop.</dd>
<dt>RD</dt><dd>Route distinguisher; optional for VRF-lite, required for BGP inside a VRF.</dd>
<dt>Route leaking</dt><dd>Deliberately installing a route in one table that points into another.</dd>
<dt>BFD</dt><dd>Bidirectional Forwarding Detection: a lightweight hello that detects forwarding failures in milliseconds.</dd>
<dt>Echo mode</dt><dd>BFD packets looped back by the neighbour's data plane.</dd>
<dt>Detect multiplier</dt><dd>Number of missed BFD intervals before the session is declared down.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>PBR direction</td><td>Inbound only, on the interface where packets arrive</td></tr>
<tr><td>PBR no match / deny</td><td>Normal routing, never a drop</td></tr>
<tr><td>Set order</td><td>next-hop, interface, default next-hop, default interface</td></tr>
<tr><td>default next-hop</td><td>Used only without an explicit route; the default route does not count, summaries do</td></tr>
<tr><td>Next hop</td><td>Must be directly connected unless <code>recursive</code></td></tr>
<tr><td>Counters</td><td><code>show route-map</code>; binding in <code>show ip policy</code></td></tr>
<tr><td>Router's own traffic</td><td>Needs <code>ip local policy route-map</code></td></tr>
<tr><td>VRF interface</td><td><code>vrf forwarding</code> removes the IP address</td></tr>
<tr><td>BGP in VRF</td><td>Needs an RD</td></tr>
<tr><td>OSPF in VRF</td><td>One process per VRF; <code>capability vrf-lite</code> on multi-VRF CE facing a PE</td></tr>
<tr><td>BFD ports</td><td>3784 control, 3785 echo, 4784 multihop</td></tr>
<tr><td>BFD math</td><td>TX = max(local TX, remote RX); detection = remote multiplier x interval</td></tr>
<tr><td>BFD echo on IOS</td><td>Default on; needs <code>no ip redirects</code></td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! PBR</span>
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop verify-availability 10.0.2.1 10 track 20
interface GigabitEthernet0/3
 ip policy route-map GUEST-VIA-ISP2
ip local policy route-map LOCAL-PBR
<span class="c">! VRF-lite</span>
vrf definition GUEST
 address-family ipv4
interface GigabitEthernet0/1
 vrf forwarding GUEST
 ip address 10.0.2.2 255.255.255.252
ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1
router ospf 20 vrf GUEST
<span class="c">! BFD</span>
interface GigabitEthernet0/0
 bfd interval 50 min_rx 50 multiplier 3
router ospf 1
 bfd all-interfaces
router bgp 65010
 neighbor 10.0.1.1 fall-over bfd
ip route static bfd GigabitEthernet0/0 10.0.1.1</pre>
<pre class="out"><span class="hl">show ip policy | show route-map | show access-lists | debug ip policy</span>
show track | show vrf | show ip vrf interfaces | show ip route vrf GUEST
ping vrf GUEST 198.51.100.10 | traceroute vrf GUEST 198.51.100.10
<span class="hl">show bfd neighbors [details]</span></pre>

<div class="eg"><p><b>Worked example: a 30-second exam drill.</b> "R1: interval 300 min_rx 300 multiplier 3. R2: interval 100 min_rx 100 multiplier 4. What is R1's detection time?" R2 sends at max(100, 300) = 300 ms. R1 uses R2's multiplier: 4 x 300 = <b>1200 ms</b>. And R2's detection time: R1 sends at max(300, 100) = 300 ms, times R1's multiplier 3 = <b>900 ms</b>.</p></div>

<div class="warn"><p><b>Common last-minute mistakes.</b> Saying PBR "drops" unmatched traffic; applying PBR outbound; forgetting the <code>vrf</code> keyword on show and ping; using the local multiplier in BFD detection time; forgetting that BFD must be configured on both ends.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Match every symptom to one missing piece: router ping not steered = local policy; stuck on a dead but "up" ISP = tracking; default next-hop ignored = explicit or summary route exists; VRF route will not install = next hop not in that VRF; BGP VRF AF refused = no RD; BFD RD = 0 = remote side silent.</p></div>

<div class="scn"><h4>The design review question</h4><p>In a design review, a manager asked why the new branch template used VRF-lite for guests, PBR for backup traffic, and BFD on the WAN. The engineer answered in three lines: guests must be isolated from staff, which only a VRF guarantees; backups need a different path only for one server and one port, which is what PBR is for; and the WAN provider's handoff hides failures behind an up link, so BFD makes routing notice them in under a second.</p><p><b>Lesson:</b> knowing when to use each tool is as valuable as knowing how to configure it.</p></div>

<div class="iv"><p class="q">"In one minute: PBR, VRF-lite and BFD, what does each do and when would you use it?"</p><p>Strong answer: PBR overrides the routing table for selected packets on the ingress interface, using route maps, for exceptions such as guest or backup traffic. VRF-lite gives separate routing tables on one router for isolation and overlapping addresses, with per-VRF protocols and deliberate leaking. BFD is a fast, shared hello that detects forwarding failures in milliseconds and notifies OSPF, EIGRP, BGP and static routes. Close with how you verify each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR: ingress, route map, deny or no match means normal routing, track the next hop.</li>
<li>VRF-lite: separate tables, per-VRF protocols, <code>vrf</code> keyword everywhere, leak narrowly.</li>
<li>BFD: sub-second detection, async plus echo, remote multiplier x negotiated interval.</li>
<li>Summaries change PBR default next-hop behaviour and live in their own VRF table.</li>
<li>Troubleshoot in a fixed order and verify from real hosts.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap tyres, fuel, lights aur documents ek chhoti list se check karte ho, car manual dobara padh kar nahi. Yeh chapter PBR, VRF-lite aur BFD ki wahi list hai: aapko kya kar paana chahiye, kaunse shabd aane chahiye, exam ko kaunse facts pasand hain, aur commands ek jagah.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three tools summary">
<rect x="10" y="30" width="200" height="130" rx="10" fill="#fde68a"/><text x="110" y="56" text-anchor="middle" class="svg-ink" font-size="14">PBR</text><text x="110" y="84" text-anchor="middle" class="svg-muted" font-size="12">chune packets steer</text><text x="110" y="104" text-anchor="middle" class="svg-muted" font-size="12">ingress, route map</text><text x="110" y="124" text-anchor="middle" class="svg-muted" font-size="12">no match = normal</text>
<rect x="220" y="30" width="200" height="130" rx="10" fill="#bbf7d0"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="14">VRF-lite</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">alag tables</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">per-VRF protocols</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">soch kar leak</text>
<rect x="430" y="30" width="200" height="130" rx="10" fill="#bae6fd"/><text x="530" y="56" text-anchor="middle" class="svg-ink" font-size="14">BFD</text><text x="530" y="84" text-anchor="middle" class="svg-muted" font-size="12">ms mein detect</text><text x="530" y="104" text-anchor="middle" class="svg-muted" font-size="12">async + echo</text><text x="530" y="124" text-anchor="middle" class="svg-muted" font-size="12">clients ko batao</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Path chuno, paths alag karo, path marne par notice karo</text>
</svg><p class="cap">Poora module ek picture mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao PBR inbound kyun lagta hai aur unmatched packets ka kya hota hai.</li>
<li>Standard ya extended ACL, <code>match length</code>, aur har set clause ke saath PBR configure karo, aur predict karo set clauses kis order mein try hote hain.</li>
<li><code>set ip next-hop verify-availability</code> ke saath IP SLA aur tracking jodo, aur <code>show track</code> aur <code>show route-map</code> se failover saabit karo.</li>
<li><code>ip local policy route-map</code> se router ka apna traffic steer karo.</li>
<li>Samjhao summaries aur Null0 discard routes <code>set ip default next-hop</code> ko kaise affect karte hain.</li>
<li>VRF banao, interfaces usmein daalo, aur uske andar static, OSPF, EIGRP aur BGP chalao.</li>
<li>VRF aur global table ke beech dono directions mein routes leak karo, aur leak ko limit karo.</li>
<li>VRF-aware ping, traceroute aur show commands use karo.</li>
<li>BFD async aur echo modes describe karo, negotiated intervals aur detection time calculate karo, aur OSPF, EIGRP, BGP aur static routes register karo.</li>
<li>PBR troubleshooting order walk karo aur output se VRF aur BFD tickets diagnose karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PBR</dt><dd>Policy-based routing: ingress interface par route map se, routing table se pehle, forwarding decide hona.</dd>
<dt>Local policy</dt><dd>Router ke khud ke banaye traffic ke liye PBR, <code>ip local policy route-map</code>.</dd>
<dt>verify-availability</dt><dd>PBR next hop sirf tab use hota hai jab track object Up ho.</dd>
<dt>VRF</dt><dd>Ek router par alag routing aur forwarding table.</dd>
<dt>VRF-lite</dt><dd>Bina MPLS ke VRFs, hop by hop alag.</dd>
<dt>RD</dt><dd>Route distinguisher; VRF-lite ke liye optional, VRF ke andar BGP ke liye zaroori.</dd>
<dt>Route leaking</dt><dd>Jaan-boojh kar ek table mein aisa route install karna jo doosri table mein point kare.</dd>
<dt>BFD</dt><dd>Bidirectional Forwarding Detection: ek halka hello jo milliseconds mein forwarding failures detect karta hai.</dd>
<dt>Echo mode</dt><dd>BFD packets jo neighbour ka data plane wapas loop karta hai.</dd>
<dt>Detect multiplier</dt><dd>Session down declare hone se pehle kitne BFD intervals miss ho sakte hain.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>PBR direction</td><td>Sirf inbound, us interface par jahan packets aate hain</td></tr>
<tr><td>PBR no match / deny</td><td>Normal routing, kabhi drop nahi</td></tr>
<tr><td>Set order</td><td>next-hop, interface, default next-hop, default interface</td></tr>
<tr><td>default next-hop</td><td>Sirf explicit route na hone par; default route nahi ginta, summaries ginti hain</td></tr>
<tr><td>Next hop</td><td>Directly connected hona chahiye jab tak <code>recursive</code> na ho</td></tr>
<tr><td>Counters</td><td><code>show route-map</code>; binding <code>show ip policy</code> mein</td></tr>
<tr><td>Router ka apna traffic</td><td><code>ip local policy route-map</code> chahiye</td></tr>
<tr><td>VRF interface</td><td><code>vrf forwarding</code> IP address hata deta hai</td></tr>
<tr><td>VRF mein BGP</td><td>RD chahiye</td></tr>
<tr><td>VRF mein OSPF</td><td>Har VRF ka ek process; PE ki taraf multi-VRF CE par <code>capability vrf-lite</code></td></tr>
<tr><td>BFD ports</td><td>3784 control, 3785 echo, 4784 multihop</td></tr>
<tr><td>BFD math</td><td>TX = max(local TX, remote RX); detection = remote multiplier x interval</td></tr>
<tr><td>IOS par BFD echo</td><td>Default on; <code>no ip redirects</code> chahiye</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! PBR</span>
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop verify-availability 10.0.2.1 10 track 20
interface GigabitEthernet0/3
 ip policy route-map GUEST-VIA-ISP2
ip local policy route-map LOCAL-PBR
<span class="c">! VRF-lite</span>
vrf definition GUEST
 address-family ipv4
interface GigabitEthernet0/1
 vrf forwarding GUEST
 ip address 10.0.2.2 255.255.255.252
ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1
router ospf 20 vrf GUEST
<span class="c">! BFD</span>
interface GigabitEthernet0/0
 bfd interval 50 min_rx 50 multiplier 3
router ospf 1
 bfd all-interfaces
router bgp 65010
 neighbor 10.0.1.1 fall-over bfd
ip route static bfd GigabitEthernet0/0 10.0.1.1</pre>
<pre class="out"><span class="hl">show ip policy | show route-map | show access-lists | debug ip policy</span>
show track | show vrf | show ip vrf interfaces | show ip route vrf GUEST
ping vrf GUEST 198.51.100.10 | traceroute vrf GUEST 198.51.100.10
<span class="hl">show bfd neighbors [details]</span></pre>

<div class="eg"><p><b>Worked example: 30-second exam drill.</b> "R1: interval 300 min_rx 300 multiplier 3. R2: interval 100 min_rx 100 multiplier 4. R1 ka detection time kya hai?" R2 max(100, 300) = 300 ms par bhejta hai. R1 R2 ka multiplier use karta hai: 4 x 300 = <b>1200 ms</b>. Aur R2 ka detection time: R1 max(300, 100) = 300 ms par bhejta hai, R1 ke multiplier 3 se guna = <b>900 ms</b>.</p></div>

<div class="warn"><p><b>Aakhri waqt ki common galtiyan.</b> Kehna ki PBR unmatched traffic "drop" karta hai; PBR outbound lagana; show aur ping par <code>vrf</code> keyword bhoolna; BFD detection time mein local multiplier use karna; bhoolna ki BFD dono ends par configure hona chahiye.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Har symptom ko ek missing piece se match karo: router ping steer nahi hua = local policy; dead lekin "up" ISP par atke = tracking; default next-hop ignore hua = explicit ya summary route hai; VRF route install nahi hota = next hop us VRF mein nahi; BGP VRF AF refuse = RD nahi; BFD RD = 0 = remote side chup.</p></div>

<div class="scn"><h4>Design review ka sawaal</h4><p>Ek design review mein manager ne poocha ki naye branch template mein guests ke liye VRF-lite, backup traffic ke liye PBR, aur WAN par BFD kyun hai. Engineer ne teen lines mein jawab diya: guests ko staff se isolated hona chahiye, jo sirf VRF guarantee karta hai; backups ko sirf ek server aur ek port ke liye alag path chahiye, jiske liye PBR bana hai; aur WAN provider ka handoff failures ko up link ke peeche chhupata hai, isliye BFD routing ko unhe ek second se kam mein notice karwata hai.</p><p><b>Seekh:</b> kab kaunsa tool use karna hai yeh jaanna utna hi keemti hai jitna use configure karna.</p></div>

<div class="iv"><p class="q">"Ek minute mein: PBR, VRF-lite aur BFD, har ek kya karta hai aur aap kab use karoge?"</p><p>Strong answer: PBR ingress interface par route maps se chune hue packets ke liye routing table override karta hai, guest ya backup traffic jaise exceptions ke liye. VRF-lite isolation aur overlapping addresses ke liye ek router par alag routing tables deta hai, per-VRF protocols aur soch-samajh kar leaking ke saath. BFD ek tez, shared hello hai jo milliseconds mein forwarding failures detect karke OSPF, EIGRP, BGP aur static routes ko notify karta hai. Har ek ko kaise verify karte ho, us se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR: ingress, route map, deny ya no match ka matlab normal routing, next hop track karo.</li>
<li>VRF-lite: alag tables, per-VRF protocols, har jagah <code>vrf</code> keyword, narrow leak.</li>
<li>BFD: sub-second detection, async plus echo, remote multiplier x negotiated interval.</li>
<li>Summaries PBR default next-hop behaviour badalti hain aur apne VRF ki table mein rehti hain.</li>
<li>Fixed order mein troubleshoot karo aur asli hosts se verify karo.</li>
</ul></div>
`}};export{e as default};