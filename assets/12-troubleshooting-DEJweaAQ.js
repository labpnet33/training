var e={id:`troubleshooting`,h:{en:`Troubleshooting DMVPN: a workflow through all four labs`,hi:`DMVPN troubleshooting: chaaron labs ke through ek workflow`},body:{en:`
<p>A good mechanic does not start by replacing the engine. Fuel, battery, spark, then the expensive parts. DMVPN has an equally clear order, because each layer depends on the one below: <b>underlay, tunnel, crypto, NHRP, routing adjacency, routing next hops, spoke-to-spoke</b>. Fix the lowest broken layer first; everything above it will look broken too until you do.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="DMVPN troubleshooting ladder">
<rect x="40" y="10" width="560" height="34" rx="6" fill="#e2e8f0"/><text x="60" y="32" class="svg-ink" font-size="13">1 Underlay: ping hub NBMA from Gi0/0, GRE/ESP/UDP 500/4500 allowed</text>
<rect x="40" y="50" width="560" height="34" rx="6" fill="#bae6fd"/><text x="60" y="72" class="svg-ink" font-size="13">2 Tunnel: up/up, gre multipoint, source, key</text>
<rect x="40" y="90" width="560" height="34" rx="6" fill="#ddd6fe"/><text x="60" y="112" class="svg-ink" font-size="13">3 Crypto: show dmvpn state IKE/IPSEC? isakmp QM_IDLE, SA counters</text>
<rect x="40" y="130" width="560" height="34" rx="6" fill="#fde68a"/><text x="60" y="152" class="svg-ink" font-size="13">4 NHRP: nhs RE, hub lists spoke (D), auth, NHS address, map</text>
<rect x="40" y="170" width="560" height="34" rx="6" fill="#fed7aa"/><text x="60" y="192" class="svg-ink" font-size="13">5 IGP adjacency: map multicast, network type, DR on hub</text>
<rect x="40" y="210" width="560" height="34" rx="6" fill="#bbf7d0"/><text x="60" y="232" class="svg-ink" font-size="13">6 Routes and next hops: right for the phase?</text>
<rect x="40" y="250" width="560" height="34" rx="6" fill="#bbf7d0"/><text x="60" y="272" class="svg-ink" font-size="13">7 Spoke-to-spoke: D entries, shortcuts, traceroute skips hub</text>
</svg><p class="cap">Work from the bottom of the stack (top of this ladder) upwards; stop at the first layer that fails.</p></div>

<h3>The command toolkit</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Healthy looks like</th></tr>
<tr><td>Underlay</td><td><code>ping 100.64.10.2 source GigabitEthernet0/0</code></td><td>!!!!!</td></tr>
<tr><td>Tunnel</td><td><code>show interfaces Tunnel0</code></td><td>up/up, multi-GRE/IP, correct source</td></tr>
<tr><td>Crypto</td><td><code>show crypto isakmp sa</code>, <code>show crypto ipsec sa</code>, <code>show crypto session</code></td><td>QM_IDLE / READY, encaps and decaps rising, UP-ACTIVE</td></tr>
<tr><td>NHRP</td><td><code>show ip nhrp nhs detail</code>, <code>show dmvpn</code>, <code>show ip nhrp</code></td><td>RE; State UP; D entries on the hub</td></tr>
<tr><td>IGP</td><td><code>show ip ospf interface Tunnel0</code>, <code>show ip ospf neighbor</code>, <code>show ip eigrp neighbors</code></td><td>right type, hub DR, FULL</td></tr>
<tr><td>Routing</td><td><code>show ip route</code></td><td>next hop = far spoke (phase 2) or hub with % / H (phase 3)</td></tr>
<tr><td>Deep dive</td><td><code>debug nhrp</code>, <code>debug dmvpn all nhrp</code>, <code>debug crypto isakmp</code></td><td>use with care on a hub with many spokes</td></tr></table>

<h3>Lab 1 · Build a DMVPN phase 2 network with OSPF</h3>
<p>While building, check after every step instead of at the end. After the hub and spokes: <code>show ip nhrp nhs detail</code> on each spoke must say RE and <code>show dmvpn</code> on the hub must show two D peers. After OSPF: the hub must be DR with both spokes FULL/DROTHER. After routing: SPOKE1 must show 10.3.3.0/24 via 172.16.100.3. After the ping: SPOKE1 must show a D entry for 100.64.30.2. If you check only at the end and PC1 cannot reach PC2, you have seven layers to suspect instead of one.</p>

<h3>Lab 2 · Troubleshoot: Kochi cannot reach Pune</h3>
<p>The ticket says SPOKE2 has no routes. There are three stacked faults, and the ladder finds them in order.</p>
<p><b>Fault 1, NHRP layer.</b> The hub lists only one peer. On SPOKE2:</p>
<pre class="out">SPOKE2# show ip nhrp nhs detail
Legend: E=Expecting replies, R=Responding, W=Waiting, D=Dynamic
Tunnel0:
<span class="hl">172.16.100.11  E priority = 0 cluster = 0  req-sent 14  req-failed 0  repl-recv 0</span></pre>
<p>State E, zero replies, and the NHS address is 172.16.100.11, a typo for the hub's .1. Fix: <code>no ip nhrp nhs 172.16.100.11</code>, <code>ip nhrp nhs 172.16.100.1</code>. The hub now shows two D peers.</p>
<p><b>Fault 2, IGP layer (network type).</b> HUB and SPOKE2 become FULL, yet SPOKE2 learns no OSPF routes.</p>
<pre class="out">SPOKE2# show ip ospf interface Tunnel0 | include Network
<span class="hl">  Process ID 1, Router ID 3.3.3.3, Network Type POINT_TO_POINT, Cost: 1000</span></pre>
<p>The hub is BROADCAST, SPOKE2 is the tunnel default POINT_TO_POINT. Same timers, so FULL; different LSA link types, so no usable routes. Fix: <code>ip ospf network broadcast</code> on SPOKE2.</p>
<p><b>Fault 3, IGP layer (DR).</b> SPOKE2 is still cut off.</p>
<pre class="out">HUB# show ip ospf interface Tunnel0 | include Designated|Backup
<span class="hl">  Designated Router (ID) 2.2.2.2, Interface address 172.16.100.2</span>
  Backup Designated router (ID) 1.1.1.1, Interface address 172.16.100.1</pre>
<p>SPOKE1 kept the default priority 1 and beat the hub on router ID. SPOKE2 cannot hear SPOKE1, so it cannot become adjacent to the DR. Fix: <code>ip ospf priority 0</code> on SPOKE1 (SPOKE2 already has it). A router whose priority becomes 0 gives up the DR role, the hub takes over, and SPOKE2 learns 10.2.2.0/24 via 172.16.100.2. <b>Proof:</b> PC2 pings PC1, <code>show dmvpn</code> on SPOKE2 shows a D entry for 100.64.20.2, and <code>trace 10.2.2.10</code> from PC2 does not show 172.16.100.1.</p>

<h3>Lab 3 · Move the cloud to DMVPN phase 3</h3>
<p>Symptom: everything works but every branch-to-branch trace shows the hub (172.16.100.1) as hop 2. Ladder: NHRP fine, OSPF fine, <b>layer 6</b>: next hops all point to the hub because of point-to-multipoint. Rather than change OSPF, add <code>ip nhrp redirect</code> on the hub and <code>ip nhrp shortcut</code> on both spokes. Verify at <b>layer 7</b>: <code>show ip nhrp</code> has 10.3.3.0/24 with flag nho, <code>show ip route</code> marks the OSPF route with %, <code>show dmvpn detail</code> shows DT2, and the trace no longer crosses the hub. If only one direction shortcuts, one spoke is missing <code>ip nhrp shortcut</code>.</p>

<h3>Lab 4 · Encrypt the DMVPN with one shared IPsec profile</h3>
<p>Expected transient failure: after the hub alone is protected, the spokes' NHS goes to E and OSPF drops. That is <b>layer 3</b>, crypto, not NHRP: the hub now drops plain GRE. Once both spokes have the identical profile, <code>show crypto isakmp sa</code> on the hub shows QM_IDLE to 100.64.20.2 and 100.64.30.2, registrations return and OSPF is FULL. If one spoke stays in state IKE in <code>show dmvpn</code>, compare its policy, key and transform set with the hub. Finally ping PC2 twice from PC1 and check <code>show crypto ipsec sa peer 100.64.30.2</code> on SPOKE1: a spoke-to-spoke SA with a rising encaps counter.</p>

<div class="eg"><p><b>Worked example: one symptom, three layers.</b> "Spoke X has no routes" can be: layer 4 (not registered, hub has no D entry), layer 5 (registered, but hub lacks <code>map multicast dynamic</code>, so no hellos arrive and there is no neighbour), or layer 5 again (FULL but network type mismatch or a spoke DR). Three commands separate them in under a minute: <code>show dmvpn</code> on the hub, <code>show ip ospf neighbor</code> on the hub, <code>show ip ospf interface Tunnel0</code> on both ends.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting with <code>debug</code> on a production hub with hundreds of spokes (use conditional debugs or check <code>show</code> commands first). Fixing layer 5 while layer 4 is broken. Clearing NHRP (<code>clear ip nhrp</code>) on the hub during business hours: every spoke re-registers and every spoke-to-spoke tunnel is torn down.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the state to the layer: <code>show dmvpn</code> State <b>IKE/IPSEC</b> = crypto; <b>NHRP</b> = mapping exists but registration or resolution failed; NHS <b>E</b> = requests unanswered; OSPF <b>FULL but no routes</b> = network type mismatch or spoke DR; traffic always via hub = phase 2 next hop rewritten or phase 3 commands missing.</p></div>

<div class="scn"><h4>The quiet ACL</h4><p>After a firewall migration, two new spokes could reach the hub but never each other: <code>show dmvpn</code> showed their mutual entries stuck incomplete and traffic hairpinned through the hub. Layer 1 check from spoke to spoke (<code>ping</code> of the other spoke's NBMA sourced from Gi0/0) failed, while ping to the hub worked. The new ACL only allowed ESP and UDP 500/4500 to and from the hub's address. Opening them for the branch public range fixed the dynamic tunnels.</p><p><b>Lesson:</b> the underlay check includes spoke-to-spoke reachability, not just spoke-to-hub.</p></div>

<div class="iv"><p class="q">"A DMVPN spoke has no routes to other sites. How do you troubleshoot it?"</p><p>Strong answer: bottom up. Underlay ping to the hub NBMA from the WAN interface; tunnel up/up in gre multipoint; if IPsec, <code>show dmvpn</code> state and <code>show crypto isakmp sa</code>; NHRP registration with <code>show ip nhrp nhs detail</code> (RE vs E) and <code>show dmvpn</code> on the hub; then the IGP: multicast mapping, neighbour state, network type and DR on the hub; then next hops for the phase. Mention the typical causes at each layer: wrong NHS, auth mismatch, missing map multicast dynamic, network type mismatch, spoke DR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay, tunnel, crypto, NHRP, adjacency, next hops, spoke-to-spoke.</li>
<li><code>show dmvpn</code> state tells you the layer: IKE/IPSEC = crypto, NHRP = registration, UP = go higher.</li>
<li>Lab 2 faults: NHS typo, point-to-point vs broadcast, spoke DR with default priority.</li>
<li>Lab 3: next hops via hub, fixed by redirect + shortcut; verify %, nho, DT2.</li>
<li>Lab 4: protect all routers in one window; one SA pair per peer, including spoke-to-spoke.</li>
</ul></div>
`,hi:`
<p>Achha mechanic engine badalne se shuru nahi karta. Fuel, battery, spark, phir mehnge parts. DMVPN ka bhi utna hi saaf order hai, kyunki har layer apne neeche wali par depend karti hai: <b>underlay, tunnel, crypto, NHRP, routing adjacency, routing next hops, spoke-to-spoke</b>. Sabse neeche wali tooti layer pehle theek karo; jab tak aap woh nahi karte, uske upar sab kuch toota hi dikhega.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="DMVPN troubleshooting ladder">
<rect x="40" y="10" width="560" height="34" rx="6" fill="#e2e8f0"/><text x="60" y="32" class="svg-ink" font-size="13">1 Underlay: Gi0/0 se hub NBMA ping, GRE/ESP/UDP 500/4500 allowed</text>
<rect x="40" y="50" width="560" height="34" rx="6" fill="#bae6fd"/><text x="60" y="72" class="svg-ink" font-size="13">2 Tunnel: up/up, gre multipoint, source, key</text>
<rect x="40" y="90" width="560" height="34" rx="6" fill="#ddd6fe"/><text x="60" y="112" class="svg-ink" font-size="13">3 Crypto: show dmvpn state IKE/IPSEC? isakmp QM_IDLE, SA counters</text>
<rect x="40" y="130" width="560" height="34" rx="6" fill="#fde68a"/><text x="60" y="152" class="svg-ink" font-size="13">4 NHRP: nhs RE, hub par spoke (D), auth, NHS address, map</text>
<rect x="40" y="170" width="560" height="34" rx="6" fill="#fed7aa"/><text x="60" y="192" class="svg-ink" font-size="13">5 IGP adjacency: map multicast, network type, hub par DR</text>
<rect x="40" y="210" width="560" height="34" rx="6" fill="#bbf7d0"/><text x="60" y="232" class="svg-ink" font-size="13">6 Routes aur next hops: phase ke hisaab se sahi?</text>
<rect x="40" y="250" width="560" height="34" rx="6" fill="#bbf7d0"/><text x="60" y="272" class="svg-ink" font-size="13">7 Spoke-to-spoke: D entries, shortcuts, traceroute mein hub nahi</text>
</svg><p class="cap">Stack ke neeche se (is ladder ke upar se) upar ki taraf kaam karo; pehli fail hone wali layer par ruko.</p></div>

<h3>Command toolkit</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Healthy kaisa dikhta hai</th></tr>
<tr><td>Underlay</td><td><code>ping 100.64.10.2 source GigabitEthernet0/0</code></td><td>!!!!!</td></tr>
<tr><td>Tunnel</td><td><code>show interfaces Tunnel0</code></td><td>up/up, multi-GRE/IP, sahi source</td></tr>
<tr><td>Crypto</td><td><code>show crypto isakmp sa</code>, <code>show crypto ipsec sa</code>, <code>show crypto session</code></td><td>QM_IDLE / READY, encaps aur decaps badhte hue, UP-ACTIVE</td></tr>
<tr><td>NHRP</td><td><code>show ip nhrp nhs detail</code>, <code>show dmvpn</code>, <code>show ip nhrp</code></td><td>RE; State UP; hub par D entries</td></tr>
<tr><td>IGP</td><td><code>show ip ospf interface Tunnel0</code>, <code>show ip ospf neighbor</code>, <code>show ip eigrp neighbors</code></td><td>sahi type, hub DR, FULL</td></tr>
<tr><td>Routing</td><td><code>show ip route</code></td><td>next hop = door wala spoke (phase 2) ya % / H ke saath hub (phase 3)</td></tr>
<tr><td>Deep dive</td><td><code>debug nhrp</code>, <code>debug dmvpn all nhrp</code>, <code>debug crypto isakmp</code></td><td>kai spokes wale hub par dhyan se use karo</td></tr></table>

<h3>Lab 1 · OSPF ke saath DMVPN phase 2 network banao</h3>
<p>Banate waqt har step ke baad check karo, aakhir mein nahi. Hub aur spokes ke baad: har spoke par <code>show ip nhrp nhs detail</code> RE kahe aur hub par <code>show dmvpn</code> do D peers dikhaye. OSPF ke baad: hub DR ho aur dono spokes FULL/DROTHER. Routing ke baad: SPOKE1 10.3.3.0/24 via 172.16.100.3 dikhaye. Ping ke baad: SPOKE1 100.64.30.2 ki D entry dikhaye. Agar sirf aakhir mein check karo aur PC1 PC2 tak na pahunche, to aapke paas ek ki jagah saat layers par shak karne ko hain.</p>

<h3>Lab 2 · Troubleshoot: Kochi, Pune tak nahi pahunch pa raha</h3>
<p>Ticket kehta hai SPOKE2 ke paas koi routes nahi. Teen stacked faults hain, aur ladder unhe order mein dhoondti hai.</p>
<p><b>Fault 1, NHRP layer.</b> Hub sirf ek peer list karta hai. SPOKE2 par:</p>
<pre class="out">SPOKE2# show ip nhrp nhs detail
Legend: E=Expecting replies, R=Responding, W=Waiting, D=Dynamic
Tunnel0:
<span class="hl">172.16.100.11  E priority = 0 cluster = 0  req-sent 14  req-failed 0  repl-recv 0</span></pre>
<p>State E, zero replies, aur NHS address 172.16.100.11 hai, hub ke .1 ka typo. Fix: <code>no ip nhrp nhs 172.16.100.11</code>, <code>ip nhrp nhs 172.16.100.1</code>. Ab hub do D peers dikhata hai.</p>
<p><b>Fault 2, IGP layer (network type).</b> HUB aur SPOKE2 FULL ho jaate hain, phir bhi SPOKE2 koi OSPF route nahi seekhta.</p>
<pre class="out">SPOKE2# show ip ospf interface Tunnel0 | include Network
<span class="hl">  Process ID 1, Router ID 3.3.3.3, Network Type POINT_TO_POINT, Cost: 1000</span></pre>
<p>Hub BROADCAST hai, SPOKE2 tunnel default POINT_TO_POINT. Same timers, isliye FULL; alag LSA link types, isliye usable routes nahi. Fix: SPOKE2 par <code>ip ospf network broadcast</code>.</p>
<p><b>Fault 3, IGP layer (DR).</b> SPOKE2 ab bhi kata hua hai.</p>
<pre class="out">HUB# show ip ospf interface Tunnel0 | include Designated|Backup
<span class="hl">  Designated Router (ID) 2.2.2.2, Interface address 172.16.100.2</span>
  Backup Designated router (ID) 1.1.1.1, Interface address 172.16.100.1</pre>
<p>SPOKE1 ne default priority 1 rakhi aur router ID par hub ko hara diya. SPOKE2 SPOKE1 ko sun nahi sakta, isliye DR ke saath adjacent nahi ho sakta. Fix: SPOKE1 par <code>ip ospf priority 0</code> (SPOKE2 par pehle se hai). Jis router ki priority 0 ho jaati hai woh DR role chhod deta hai, hub le leta hai, aur SPOKE2 10.2.2.0/24 via 172.16.100.2 seekhta hai. <b>Proof:</b> PC2 PC1 ko ping karta hai, SPOKE2 par <code>show dmvpn</code> 100.64.20.2 ki D entry dikhata hai, aur PC2 se <code>trace 10.2.2.10</code> mein 172.16.100.1 nahi dikhta.</p>

<h3>Lab 3 · Cloud ko DMVPN phase 3 par le jao</h3>
<p>Symptom: sab chalta hai lekin har branch-to-branch trace hop 2 par hub (172.16.100.1) dikhata hai. Ladder: NHRP theek, OSPF theek, <b>layer 6</b>: point-to-multipoint ki wajah se saare next hops hub ki taraf hain. OSPF badalne ki jagah hub par <code>ip nhrp redirect</code> aur dono spokes par <code>ip nhrp shortcut</code> jodo. <b>Layer 7</b> par verify karo: <code>show ip nhrp</code> mein 10.3.3.0/24 flag nho ke saath, <code>show ip route</code> OSPF route ko % se mark karta hai, <code>show dmvpn detail</code> DT2 dikhata hai, aur trace ab hub se nahi guzarta. Agar sirf ek direction shortcut le, to ek spoke par <code>ip nhrp shortcut</code> missing hai.</p>

<h3>Lab 4 · Ek shared IPsec profile se DMVPN encrypt karo</h3>
<p>Expected temporary failure: sirf hub protect hone ke baad spokes ka NHS E par jaata hai aur OSPF girta hai. Yeh <b>layer 3</b>, crypto, hai, NHRP nahi: hub ab plain GRE drop karta hai. Jab dono spokes par same profile lag jaata hai, hub par <code>show crypto isakmp sa</code> 100.64.20.2 aur 100.64.30.2 ke liye QM_IDLE dikhata hai, registrations wapas aati hain aur OSPF FULL hota hai. Agar koi spoke <code>show dmvpn</code> mein state IKE mein reh jaaye, uski policy, key aur transform set hub se compare karo. Aakhir mein PC1 se PC2 ko do baar ping karo aur SPOKE1 par <code>show crypto ipsec sa peer 100.64.30.2</code> check karo: badhte encaps counter wala spoke-to-spoke SA.</p>

<div class="eg"><p><b>Worked example: ek symptom, teen layers.</b> "Spoke X ke paas routes nahi" ho sakta hai: layer 4 (registered nahi, hub par D entry nahi), layer 5 (registered, lekin hub par <code>map multicast dynamic</code> nahi, isliye hellos nahi aate aur neighbour nahi), ya phir layer 5 (FULL lekin network type mismatch ya spoke DR). Teen commands ek minute se kam mein inhe alag karti hain: hub par <code>show dmvpn</code>, hub par <code>show ip ospf neighbor</code>, dono ends par <code>show ip ospf interface Tunnel0</code>.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Saikdon spokes wale production hub par <code>debug</code> se shuru karna (conditional debugs use karo ya pehle <code>show</code> commands dekho). Layer 4 tooti ho tab layer 5 theek karna. Business hours mein hub par NHRP clear karna (<code>clear ip nhrp</code>): har spoke re-register karta hai aur har spoke-to-spoke tunnel toot jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> State ko layer se match karo: <code>show dmvpn</code> State <b>IKE/IPSEC</b> = crypto; <b>NHRP</b> = mapping hai lekin registration ya resolution fail; NHS <b>E</b> = requests ka jawab nahi; OSPF <b>FULL lekin routes nahi</b> = network type mismatch ya spoke DR; traffic hamesha hub se = phase 2 next hop rewrite ya phase 3 commands missing.</p></div>

<div class="scn"><h4>Chupchaap ACL</h4><p>Firewall migration ke baad do naye spokes hub tak pahunch sakte the lekin ek doosre tak kabhi nahi: <code>show dmvpn</code> unki mutual entries incomplete dikhata tha aur traffic hub se hairpin hota tha. Spoke se spoke layer 1 check (Gi0/0 se source karke doosre spoke ke NBMA ka <code>ping</code>) fail hua, jabki hub ka ping chal raha tha. Naya ACL sirf hub ke address se ESP aur UDP 500/4500 allow karta tha. Branch public range ke liye kholne se dynamic tunnels theek ho gaye.</p><p><b>Seekh:</b> underlay check mein spoke-to-spoke reachability bhi shamil hai, sirf spoke-to-hub nahi.</p></div>

<div class="iv"><p class="q">"DMVPN spoke ke paas doosri sites ke routes nahi hain. Aap kaise troubleshoot karoge?"</p><p>Strong answer: bottom up. WAN interface se hub NBMA tak underlay ping; tunnel gre multipoint mein up/up; IPsec ho to <code>show dmvpn</code> state aur <code>show crypto isakmp sa</code>; <code>show ip nhrp nhs detail</code> (RE vs E) aur hub par <code>show dmvpn</code> se NHRP registration; phir IGP: multicast mapping, neighbour state, network type aur hub par DR; phir phase ke hisaab se next hops. Har layer ke typical causes batao: galat NHS, auth mismatch, missing map multicast dynamic, network type mismatch, spoke DR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay, tunnel, crypto, NHRP, adjacency, next hops, spoke-to-spoke.</li>
<li><code>show dmvpn</code> state layer batata hai: IKE/IPSEC = crypto, NHRP = registration, UP = upar jao.</li>
<li>Lab 2 faults: NHS typo, point-to-point vs broadcast, default priority wala spoke DR.</li>
<li>Lab 3: next hops hub se, redirect + shortcut se theek; %, nho, DT2 verify karo.</li>
<li>Lab 4: saare routers ek window mein protect karo; har peer ka ek SA pair, spoke-to-spoke bhi.</li>
</ul></div>
`}};export{e as default};