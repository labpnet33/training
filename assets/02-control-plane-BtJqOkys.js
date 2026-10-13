var e={id:`control-plane`,h:{en:`Control-plane protection: CoPP, LPTS and management plane protection`,hi:`Control-plane protection: CoPP, LPTS aur management plane protection`},body:{en:`
<p><b>Why the CPU needs a bodyguard.</b> A router forwards most packets in hardware. But some packets must be examined by the route processor (RP) CPU: routing protocol packets, ARP, ICMP to the router, SSH and SNMP to the router, TTL-expired packets. This traffic is called <b>punted</b> traffic. The CPU is small compared with the forwarding hardware. If an attacker (or just a misconfigured host) sends a flood of packets addressed to the router itself, the CPU can be starved and BGP or IS-IS hellos are missed. Then sessions drop and the whole network suffers.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Internet / customers</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Line card</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">hardware forwarding</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Control-plane policer</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">CoPP / LPTS</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Route processor</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">BGP, IS-IS, SSH</text></svg><p class="cap">Only traffic that must reach the CPU is punted, and it is rate-limited first.</p></div>
<h3>CoPP on IOS XE</h3>
<p><b>Control Plane Policing (CoPP)</b> applies a normal QoS policy to a virtual interface called the <i>control plane</i>. You classify punted traffic into classes (routing, management, ICMP, everything else) and give each class a policer. Classes use ACLs, so you decide who may talk to the router. Best practice is to <b>start in monitor mode</b>: use a policy that only counts (conform-action transmit, exceed-action transmit), read the counters, and only then tighten.</p>
<p><b>Reference configuration (not run in the simulator).</b> Placeholder addresses only.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
ip access-list extended ACL-ROUTING
 permit tcp host 192.0.2.2 eq bgp any
 permit tcp host 192.0.2.2 any eq bgp
ip access-list extended ACL-MGMT
 permit tcp 198.51.100.0 0.0.0.255 any eq 22
class-map match-all CM-ROUTING
 match access-group name ACL-ROUTING
class-map match-all CM-MGMT
 match access-group name ACL-MGMT
policy-map PM-COPP
 class CM-ROUTING
  police rate 2000 pps conform-action transmit exceed-action transmit
 class CM-MGMT
  police rate 500 pps conform-action transmit exceed-action drop
 class class-default
  police rate 200 pps conform-action transmit exceed-action drop
control-plane
 service-policy input PM-COPP</pre>
<p>The routing class above is deliberately set to transmit on exceed, so a misjudged rate cannot break BGP. You can tighten after you have watched real traffic with <code>show policy-map control-plane</code>.</p>
<h3>LPTS on IOS XR</h3>
<p>IOS XR does not use CoPP. It uses <b>Local Packet Transport Services (LPTS)</b>. LPTS keeps a table, the <b>pre-Internal Forwarding Information Base (pIFIB)</b>, that lists every flow the router is willing to receive locally: for example "TCP port 179 from the configured BGP neighbor". The line card looks up each packet for the router in this table. Packets that match no entry are dropped in hardware before the CPU sees them. Matching flows are placed in a <b>flow type</b> (such as bgp-known, bgp-cfg-peer or bgp-default) and each flow type is policed. The key idea: configured neighbors get a generous "known" rate and unknown sources get a low default rate, automatically.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! LPTS is automatic; you tune the rate of a flow type per line card</span>
lpts pifib hardware police location 0/0/CPU0
 flow bgp known rate 5000
 flow bgp default rate 1000
<span class="c">! Verify (command names, output depends on platform and release)</span>
show lpts pifib hardware entry brief location 0/0/CPU0
show lpts pifib hardware police location 0/0/CPU0</pre>
<h3>Management plane protection and VTY ACLs</h3>
<p><b>Management Plane Protection (MPP)</b> on IOS XR lets you say on which interfaces the router will accept management protocols at all, for example SSH only on the out-of-band management interface. On IOS XE the simple tool is <code>access-class</code> on the VTY lines plus <code>transport input ssh</code>. Pair either with AAA (TACACS+ or RADIUS), because who may log in matters as much as where from.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
ip access-list standard ACL-VTY
 permit 198.51.100.0 0.0.0.255
line vty 0 15
 access-class ACL-VTY in
 transport input ssh</pre>
<table class="cmp"><tr><th>Platform</th><th>Mechanism</th><th>Key idea</th></tr><tr><td>IOS / IOS XE</td><td>CoPP</td><td>QoS policy with ACL classes and policers on control-plane</td></tr><tr><td>IOS XR</td><td>LPTS</td><td>pIFIB flow table, per-flow-type policing in hardware</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Applying a strict CoPP policy on day one. A too-low rate on the routing class drops BGP keepalives and causes the very outage you wanted to prevent. Monitor first.</p></div>
<div class="exam"><p><b>Exam trap.</b> CoPP is IOS XE and classic IOS; LPTS is IOS XR. LPTS builds its table from configuration and active sessions, so you rarely write ACLs for it. Know that LPTS drops packets with no pIFIB entry in hardware.</p></div>
<div class="scn"><h4>The scanner that slowed the router</h4><p>A PE router showed high CPU and slow SSH after a misconfigured monitoring server started sending ICMP and SNMP probes to every loopback. BGP stayed up only because the routing class was ahead of the others. After a monitor-mode CoPP policy confirmed the source, the provider limited ICMP and SNMP to the monitoring subnet and rate-limited the rest.</p><p><b>Lesson:</b> Classify before you drop; protect routing traffic first.</p></div>
<div class="iv"><p class="q">"What is the difference between CoPP and LPTS?"</p><p>CoPP is a QoS policy on the control-plane interface of IOS and IOS XE, written by the operator with ACLs and policers. LPTS is the IOS XR mechanism: it builds a pIFIB table of flows the router accepts, drops unmatched traffic in hardware, and polices each flow type separately, so most of the policy is automatic.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Punted traffic reaches the route processor CPU, which is small and must be protected.</li>
<li>CoPP: QoS on the control-plane interface, ACL-based classes with policers.</li>
<li>LPTS: pIFIB table, flow types, per-type policing in hardware on IOS XR.</li>
<li>MPP and VTY ACLs limit where management sessions may come from.</li>
<li>Start CoPP in monitor mode, then tighten.</li></ul></div>
`,hi:`
<p><b>CPU ko bodyguard kyun chahiye.</b> Router zyaadatar packets hardware mein forward karta hai. Lekin kuch packets route processor (RP) CPU ko examine karne padte hain: routing protocol packets, ARP, router ko ICMP, router ko SSH aur SNMP, TTL-expired packets. Is traffic ko <b>punted</b> traffic kehte hain. Forwarding hardware ke muqable CPU chhota hota hai. Agar koi attacker (ya sirf galat configured host) router ke apne address par packets ka flood bheje, to CPU starve ho sakta hai aur BGP ya IS-IS hellos miss ho jaate hain. Phir sessions girte hain aur poora network suffer karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Internet / customers</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Line card</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">hardware forwarding</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Control-plane policer</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">CoPP / LPTS</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Route processor</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">BGP, IS-IS, SSH</text></svg><p class="cap">Sirf wahi traffic CPU tak punt hota hai jo zaroori hai, aur pehle rate-limit hota hai.</p></div>
<h3>IOS XE par CoPP</h3>
<p><b>Control Plane Policing (CoPP)</b> ek normal QoS policy ko <i>control plane</i> naam ke virtual interface par lagata hai. Aap punted traffic ko classes mein baantte ho (routing, management, ICMP, baaki sab) aur har class ko policer dete ho. Classes ACLs use karti hain, isliye aap decide karte ho ki router se kaun baat kar sakta hai. Best practice hai <b>monitor mode se shuru karna</b>: aisi policy jo sirf count kare (conform-action transmit, exceed-action transmit), counters padho, phir tight karo.</p>
<p><b>Reference configuration (not run in the simulator).</b> Sirf placeholder addresses.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
ip access-list extended ACL-ROUTING
 permit tcp host 192.0.2.2 eq bgp any
 permit tcp host 192.0.2.2 any eq bgp
ip access-list extended ACL-MGMT
 permit tcp 198.51.100.0 0.0.0.255 any eq 22
class-map match-all CM-ROUTING
 match access-group name ACL-ROUTING
class-map match-all CM-MGMT
 match access-group name ACL-MGMT
policy-map PM-COPP
 class CM-ROUTING
  police rate 2000 pps conform-action transmit exceed-action transmit
 class CM-MGMT
  police rate 500 pps conform-action transmit exceed-action drop
 class class-default
  police rate 200 pps conform-action transmit exceed-action drop
control-plane
 service-policy input PM-COPP</pre>
<p>Upar routing class jaanbujhkar exceed par transmit rakhi hai, taaki galat anuman se BGP na toote. Real traffic dekhne ke baad <code>show policy-map control-plane</code> se tight kar sakte ho.</p>
<h3>IOS XR par LPTS</h3>
<p>IOS XR CoPP use nahi karta. Woh <b>Local Packet Transport Services (LPTS)</b> use karta hai. LPTS ek table rakhta hai, <b>pre-Internal Forwarding Information Base (pIFIB)</b>, jisme har woh flow listed hai jo router locally receive karne ko taiyar hai: jaise "configured BGP neighbor se TCP port 179". Line card router ke liye aaye har packet ko is table mein dekhta hai. Jo packets kisi entry se match nahi karte woh CPU tak pahunchne se pehle hardware mein drop ho jaate hain. Matching flows ek <b>flow type</b> mein jaate hain (jaise bgp-known, bgp-cfg-peer ya bgp-default) aur har flow type police hota hai. Key idea: configured neighbors ko generous "known" rate milta hai aur unknown sources ko automatically low default rate.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! LPTS is automatic; you tune the rate of a flow type per line card</span>
lpts pifib hardware police location 0/0/CPU0
 flow bgp known rate 5000
 flow bgp default rate 1000
<span class="c">! Verify (command names, output depends on platform and release)</span>
show lpts pifib hardware entry brief location 0/0/CPU0
show lpts pifib hardware police location 0/0/CPU0</pre>
<h3>Management plane protection aur VTY ACLs</h3>
<p>IOS XR par <b>Management Plane Protection (MPP)</b> aapko batane deta hai ki router kin interfaces par management protocols accept karega, jaise SSH sirf out-of-band management interface par. IOS XE par simple tool VTY lines par <code>access-class</code> plus <code>transport input ssh</code> hai. Dono ke saath AAA (TACACS+ ya RADIUS) lagao, kyunki kaun login kare yeh utna hi zaroori hai jitna kahan se.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
ip access-list standard ACL-VTY
 permit 198.51.100.0 0.0.0.255
line vty 0 15
 access-class ACL-VTY in
 transport input ssh</pre>
<table class="cmp"><tr><th>Platform</th><th>Mechanism</th><th>Key idea</th></tr><tr><td>IOS / IOS XE</td><td>CoPP</td><td>control-plane par ACL classes aur policers wali QoS policy</td></tr><tr><td>IOS XR</td><td>LPTS</td><td>pIFIB flow table, hardware mein per-flow-type policing</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Pehle din hi strict CoPP policy lagana. Routing class par bahut kam rate BGP keepalives drop kar deta hai aur wahi outage deta hai jisse bachna tha. Pehle monitor karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> CoPP IOS XE aur classic IOS hai; LPTS IOS XR hai. LPTS apni table configuration aur active sessions se banata hai, isliye uske liye ACLs kam hi likhte hain. Yaad rakho ki pIFIB entry na ho to LPTS packets hardware mein drop karta hai.</p></div>
<div class="scn"><h4>Scanner jisne router slow kar diya</h4><p>Ek PE router par high CPU aur slow SSH dikha jab ek galat configured monitoring server har loopback par ICMP aur SNMP probes bhejne laga. BGP isliye up raha kyunki routing class baaki se aage thi. Monitor-mode CoPP policy ne source confirm kiya, phir provider ne ICMP aur SNMP monitoring subnet tak limit kiye aur baaki rate-limit kiya.</p><p><b>Lesson:</b> Drop karne se pehle classify karo; routing traffic ko pehle protect karo.</p></div>
<div class="iv"><p class="q">"CoPP aur LPTS mein kya difference hai?"</p><p>CoPP IOS aur IOS XE ke control-plane interface par QoS policy hai, jo operator ACLs aur policers se likhta hai. LPTS IOS XR ka mechanism hai: yeh pIFIB table banata hai jisme router ke accept kiye flows hain, unmatched traffic hardware mein drop karta hai, aur har flow type ko alag police karta hai, isliye zyaadatar policy automatic hoti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Punted traffic route processor CPU tak pahunchta hai, jo chhota hota hai aur protect karna zaroori hai.</li>
<li>CoPP: control-plane interface par QoS, ACL-based classes aur policers.</li>
<li>LPTS: pIFIB table, flow types, IOS XR par hardware mein per-type policing.</li>
<li>MPP aur VTY ACLs batate hain ki management sessions kahan se aa sakte hain.</li>
<li>CoPP monitor mode se shuru karo, phir tight karo.</li></ul></div>
`}};export{e as default};