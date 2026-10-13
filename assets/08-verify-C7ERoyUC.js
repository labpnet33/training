var e={id:`verify`,h:{en:`Verification: reading the nve show commands like an operator`,hi:`Verification: nve show commands ko operator ki tarah padhna`},body:{en:`
<p>A doctor does not diagnose by asking "do you feel fine?". She checks pulse, blood pressure and temperature in a fixed order, and each reading narrows the problem. VXLAN verification works the same way: four or five show commands, always in the same order, each answering one precise question. Learn the order once and you will use it for the rest of your career.</p>

<h3>The verification ladder</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Verification ladder">
<rect x="20" y="200" width="600" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="13">1. Underlay: show ip route / ping remote loopback1</text>
<rect x="60" y="155" width="520" height="36" rx="6" fill="#bae6fd"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">2. VTEP: show nve interface nve1 detail</text>
<rect x="100" y="110" width="440" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">3. Segments: show nve vni (+ ingress-replication)</text>
<rect x="140" y="65" width="360" height="36" rx="6" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">4. Tunnels: show nve peers</text>
<rect x="180" y="20" width="280" height="36" rx="6" fill="#fed7aa"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">5. Hosts: show mac address-table</text>
</svg><p class="cap">Climb from the bottom. A failure on one rung explains every failure above it.</p></div>

<h3>Rung 1: the underlay</h3>
<pre class="out">LEAF1# ping 10.254.0.2 source 10.254.0.1 count 2
PING 10.254.0.2 (10.254.0.2) from 10.254.0.1: 56 data bytes
64 bytes from 10.254.0.2: icmp_seq=0 ttl=253 time=1.1 ms
64 bytes from 10.254.0.2: icmp_seq=1 ttl=253 time=0.9 ms
<span class="hl">2 packets transmitted, 2 packets received, 0.00% packet loss</span></pre>
<p>Source the ping from loopback1 so you test exactly the path VXLAN will use: VTEP address to VTEP address. TTL 253 shows two routed hops (leaf, spine, leaf).</p>

<h3>Rung 2: the VTEP itself</h3>
<pre class="out">LEAF1# show nve interface nve1 detail
<span class="hl">Interface: nve1, State: Up, encapsulation: VXLAN</span>
 VPC Capability: VPC-VIP-Only [not-notified]
 Local Router MAC: 5254.0012.a001
 Host Learning Mode: Data-Plane
 <span class="hl">Source-Interface: loopback1 (primary: 10.254.0.1, secondary: 0.0.0.0)</span>
 Source Interface State: Up</pre>
<p>Questions answered: is nve1 up, is it doing data-plane learning, and which address will be the outer source IP? If the primary address is wrong, every peer will see packets from an address it does not expect.</p>

<h3>Rung 3: the segments</h3>
<pre class="out">LEAF1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP
       SU - Suppress Unknown Unicast
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastStatic     Up    DP   L2 [10]</span>

LEAF1# show vxlan
Vlan            VN-Segment
====            ==========
10              10010</pre>
<p>Read each column: <b>VNI</b> 10010 (must match the remote leaf), <b>Multicast-group</b> UnicastStatic (static ingress replication), <b>State</b> Up, <b>Mode</b> DP (data plane learning), <b>Type</b> L2 with the bridge domain [10], which is the local VLAN. A VNI that shows <b>UC</b> means you added the member VNI but no VLAN is mapped to it. Add <code>show nve vni ingress-replication</code> to see the peer list per VNI.</p>

<h3>Rung 4: the tunnels</h3>
<pre class="out">LEAF1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    DP        00:03:52 n/a</span></pre>
<p>Each row is a remote VTEP this leaf exchanges VXLAN with. LearnType DP means the peer was discovered through the data plane; Router-Mac is n/a because there is no EVPN routing information. The Uptime tells you how long the tunnel has been healthy, which is very useful after an incident.</p>

<h3>Rung 5: the hosts</h3>
<pre class="out">LEAF1# show mac address-table vlan 10
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     0050.56aa.0011   dynamic  0         F      F    Eth1/5
<span class="hl">*   10     0050.56aa.0012   dynamic  0         F      F    nve1(10.254.0.2)</span></pre>
<p>The final proof: SRV2's MAC is known behind the remote VTEP. If rung 4 is up but this entry never appears, the remote side is not sending (host down, wrong VLAN on the remote access port, or the remote leaf is not replicating to you).</p>

<div class="eg"><p><b>Worked example: a full packet walk with outputs.</b> Before the ping, LEAF1 shows nve1 Up and VNI 10010 Up, but the MAC table has only Eth1/5 and <code>show nve peers</code> may be empty because no VXLAN traffic has flowed. SRV1 pings 172.16.10.12: the ARP broadcast is replicated to 10.254.0.2; LEAF2 learns SRV1's MAC on nve1(10.254.0.1) and floods to SRV2; SRV2's reply returns as unicast VXLAN; LEAF1 learns SRV2's MAC on nve1(10.254.0.2). Now all five rungs are green, <code>show interface nve1</code> counters increase on both leaves, and the ping reports 0% loss from the second attempt.</p></div>

<h3>Two extra tools</h3>
<ul>
<li><code>show interface nve1</code>: packet and byte counters in and out. If "out" grows on LEAF1 but "in" never grows on LEAF2, the packets are lost in the underlay (often MTU or a filter).</li>
<li><code>clear mac address-table dynamic</code>: flushes learned entries so you can watch learning happen again during a test.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Treating "peer Up" as "everything works". A peer can be Up while large packets are dropped because of MTU, or while one VNI works and another does not (the peer table is per VTEP, not per VNI). Always finish with the host-level test and, for MTU, a large DF ping between the servers.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>show nve vni</code>, the Mode column shows <b>DP</b> for flood-and-learn and <b>CP</b> for EVPN; the Multicast-group column shows <b>UnicastStatic</b> for static ingress replication, <b>UnicastBGP</b> for EVPN ingress replication, or a group address for multicast. Expect a question that shows one of these outputs and asks which replication mode is in use.</p></div>

<div class="scn"><h4>The ticket that was solved from the bottom rung</h4><p>A night-shift engineer received "VLAN 10 broken between rack 3 and rack 9". He started at the top: the MAC table on LEAF3 had no remote entries, the peer list was empty. Instead of changing VXLAN config, he walked down the ladder. nve1 was Up, VNI 10010 was Up, but <code>ping 10.254.0.9 source 10.254.0.3</code> failed. <code>show ip route 10.254.0.9</code> returned nothing: during a spine upgrade earlier that evening, a route filter had been applied that dropped the 10.254.0.0/24 loopbacks. Removing the filter brought the peer up within seconds, and the MAC table filled.</p><p><b>Lesson:</b> overlay symptoms often have underlay causes. The ladder finds them fast.</p></div>

<div class="iv"><p class="q">"Which commands do you use to verify a VXLAN flood-and-learn deployment, and what do you look for?"</p><p>Strong answer: in order: ping remote loopback1 from local loopback1 (underlay); show nve interface nve1 detail (state Up, source loopback and primary IP, data-plane learning); show nve vni (VNI Up, mode DP, UnicastStatic or group, correct bridge domain); show nve vni ingress-replication (peer list); show nve peers (remote VTEP Up, LearnType DP); show mac address-table (remote MACs on nve1(peer)). Mention counters on show interface nve1 and a large DF ping for MTU.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify bottom-up: underlay, VTEP, VNI, peers, MACs.</li>
<li>show nve interface nve1 detail confirms state, source loopback and learning mode.</li>
<li>show nve vni: VNI, replication mode (UnicastStatic or group), State, Mode DP, BD.</li>
<li>show nve peers lists remote VTEPs; LearnType DP for flood-and-learn.</li>
<li>Remote hosts appear as nve1(peer IP) in the MAC table only after they send traffic.</li>
</ul></div>
`,hi:`
<p>Doctor "aap theek feel kar rahe ho?" pooch kar diagnose nahi karti. Woh ek fixed order mein pulse, blood pressure aur temperature check karti hai, aur har reading problem ko chhota karti hai. VXLAN verification bhi aise hi kaam karta hai: chaar-paanch show commands, hamesha same order mein, har ek ek precise sawaal ka jawab deta hai. Order ek baar seekh lo aur poore career mein use karoge.</p>

<h3>Verification ladder</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Verification ladder">
<rect x="20" y="200" width="600" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="13">1. Underlay: show ip route / remote loopback1 ping</text>
<rect x="60" y="155" width="520" height="36" rx="6" fill="#bae6fd"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">2. VTEP: show nve interface nve1 detail</text>
<rect x="100" y="110" width="440" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">3. Segments: show nve vni (+ ingress-replication)</text>
<rect x="140" y="65" width="360" height="36" rx="6" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">4. Tunnels: show nve peers</text>
<rect x="180" y="20" width="280" height="36" rx="6" fill="#fed7aa"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">5. Hosts: show mac address-table</text>
</svg><p class="cap">Neeche se upar chadho. Ek rung ka failure uske upar ke har failure ko explain karta hai.</p></div>

<h3>Rung 1: underlay</h3>
<pre class="out">LEAF1# ping 10.254.0.2 source 10.254.0.1 count 2
PING 10.254.0.2 (10.254.0.2) from 10.254.0.1: 56 data bytes
64 bytes from 10.254.0.2: icmp_seq=0 ttl=253 time=1.1 ms
64 bytes from 10.254.0.2: icmp_seq=1 ttl=253 time=0.9 ms
<span class="hl">2 packets transmitted, 2 packets received, 0.00% packet loss</span></pre>
<p>Ping ko loopback1 se source karo taaki aap exactly wahi path test karo jo VXLAN use karega: VTEP address se VTEP address. TTL 253 do routed hops dikhata hai (leaf, spine, leaf).</p>

<h3>Rung 2: VTEP khud</h3>
<pre class="out">LEAF1# show nve interface nve1 detail
<span class="hl">Interface: nve1, State: Up, encapsulation: VXLAN</span>
 VPC Capability: VPC-VIP-Only [not-notified]
 Local Router MAC: 5254.0012.a001
 Host Learning Mode: Data-Plane
 <span class="hl">Source-Interface: loopback1 (primary: 10.254.0.1, secondary: 0.0.0.0)</span>
 Source Interface State: Up</pre>
<p>Jawab milne wale sawaal: kya nve1 up hai, kya yeh data-plane learning kar raha hai, aur outer source IP kaunsa address hoga? Agar primary address galat hai, to har peer ko aise address se packets dikhenge jiski woh umeed nahi karta.</p>

<h3>Rung 3: segments</h3>
<pre class="out">LEAF1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP
       SU - Suppress Unknown Unicast
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastStatic     Up    DP   L2 [10]</span>

LEAF1# show vxlan
Vlan            VN-Segment
====            ==========
10              10010</pre>
<p>Har column padho: <b>VNI</b> 10010 (remote leaf se match hona chahiye), <b>Multicast-group</b> UnicastStatic (static ingress replication), <b>State</b> Up, <b>Mode</b> DP (data plane learning), <b>Type</b> L2 aur bridge domain [10], jo local VLAN hai. Jo VNI <b>UC</b> dikhaye uska matlab hai aapne member VNI add kiya lekin koi VLAN us par map nahi hai. Har VNI ki peer list dekhne ke liye <code>show nve vni ingress-replication</code> bhi chalao.</p>

<h3>Rung 4: tunnels</h3>
<pre class="out">LEAF1# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    DP        00:03:52 n/a</span></pre>
<p>Har row ek remote VTEP hai jiske saath yeh leaf VXLAN exchange karta hai. LearnType DP ka matlab peer data plane se discover hua; Router-Mac n/a hai kyunki koi EVPN routing information nahi hai. Uptime batata hai ki tunnel kab se healthy hai, jo incident ke baad bahut useful hai.</p>

<h3>Rung 5: hosts</h3>
<pre class="out">LEAF1# show mac address-table vlan 10
   VLAN     MAC Address      Type      age     Secure NTFY Ports
---------+-----------------+--------+---------+------+----+------------------
*   10     0050.56aa.0011   dynamic  0         F      F    Eth1/5
<span class="hl">*   10     0050.56aa.0012   dynamic  0         F      F    nve1(10.254.0.2)</span></pre>
<p>Aakhri saboot: SRV2 ka MAC remote VTEP ke peeche known hai. Agar rung 4 up hai lekin yeh entry kabhi nahi aati, to remote side bhej nahi rahi (host down, remote access port par galat VLAN, ya remote leaf aapko replicate nahi kar raha).</p>

<div class="eg"><p><b>Worked example: outputs ke saath poora packet walk.</b> Ping se pehle LEAF1 nve1 Up aur VNI 10010 Up dikhata hai, lekin MAC table mein sirf Eth1/5 hai aur <code>show nve peers</code> khaali ho sakta hai kyunki abhi koi VXLAN traffic flow nahi hua. SRV1, 172.16.10.12 ko ping karta hai: ARP broadcast 10.254.0.2 ko replicate hota hai; LEAF2 SRV1 ka MAC nve1(10.254.0.1) par learn karta hai aur SRV2 ko flood karta hai; SRV2 ka reply unicast VXLAN ban kar wapas aata hai; LEAF1 SRV2 ka MAC nve1(10.254.0.2) par learn karta hai. Ab paanchon rungs green hain, dono leaves par <code>show interface nve1</code> counters badhte hain, aur doosri koshish se ping 0% loss report karti hai.</p></div>

<h3>Do extra tools</h3>
<ul>
<li><code>show interface nve1</code>: andar aur bahar ke packet aur byte counters. Agar LEAF1 par "out" badhta hai lekin LEAF2 par "in" kabhi nahi badhta, to packets underlay mein kho rahe hain (aksar MTU ya filter).</li>
<li><code>clear mac address-table dynamic</code>: learned entries flush karta hai taaki test ke dauraan aap learning ko dobara hote dekh sako.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> "Peer Up" ko "sab kuch kaam kar raha hai" samajhna. Peer Up ho sakta hai jabki MTU ki wajah se bade packets drop ho rahe hon, ya ek VNI kaam kare aur doosra nahi (peer table per VTEP hai, per VNI nahi). Hamesha host-level test se khatam karo aur MTU ke liye servers ke beech bada DF ping karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show nve vni</code> mein Mode column flood-and-learn ke liye <b>DP</b> aur EVPN ke liye <b>CP</b> dikhata hai; Multicast-group column static ingress replication ke liye <b>UnicastStatic</b>, EVPN ingress replication ke liye <b>UnicastBGP</b>, ya multicast ke liye group address dikhata hai. Aisa question expect karo jo inmein se ek output dikha kar pooche ki kaunsa replication mode use ho raha hai.</p></div>

<div class="scn"><h4>Woh ticket jo neeche wale rung se solve hua</h4><p>Night-shift engineer ko "rack 3 aur rack 9 ke beech VLAN 10 toota hai" mila. Usne upar se shuru kiya: LEAF3 ke MAC table mein koi remote entries nahi thi, peer list khaali thi. VXLAN config badalne ke bajaye woh ladder se neeche utra. nve1 Up tha, VNI 10010 Up tha, lekin <code>ping 10.254.0.9 source 10.254.0.3</code> fail hua. <code>show ip route 10.254.0.9</code> ne kuch nahi diya: usi shaam spine upgrade ke dauraan ek route filter lagaya gaya tha jo 10.254.0.0/24 loopbacks ko drop kar raha tha. Filter hatate hi kuch seconds mein peer up ho gaya, aur MAC table bhar gayi.</p><p><b>Seekh:</b> overlay symptoms ke causes aksar underlay mein hote hain. Ladder unhe jaldi dhoondh leti hai.</p></div>

<div class="iv"><p class="q">"VXLAN flood-and-learn deployment verify karne ke liye kaunse commands use karte ho, aur kya dekhte ho?"</p><p>Strong answer: order mein: local loopback1 se remote loopback1 ping (underlay); show nve interface nve1 detail (state Up, source loopback aur primary IP, data-plane learning); show nve vni (VNI Up, mode DP, UnicastStatic ya group, sahi bridge domain); show nve vni ingress-replication (peer list); show nve peers (remote VTEP Up, LearnType DP); show mac address-table (nve1(peer) par remote MACs). show interface nve1 ke counters aur MTU ke liye bada DF ping mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar verify karo: underlay, VTEP, VNI, peers, MACs.</li>
<li>show nve interface nve1 detail state, source loopback aur learning mode confirm karta hai.</li>
<li>show nve vni: VNI, replication mode (UnicastStatic ya group), State, Mode DP, BD.</li>
<li>show nve peers remote VTEPs list karta hai; flood-and-learn ke liye LearnType DP.</li>
<li>Remote hosts MAC table mein nve1(peer IP) ki tarah tabhi dikhte hain jab woh traffic bhejte hain.</li>
</ul></div>
`}};export{e as default};