var e={id:`troubleshooting`,h:{en:`Troubleshooting the underlay: a bottom-up workflow`,hi:`Underlay troubleshooting: ek bottom-up workflow`},body:{en:`
<p>A good doctor does not start with a brain scan. They check pulse, breathing and temperature first, then move to more specific tests. Underlay troubleshooting works the same way: start at the cable and climb one layer at a time until you find the first thing that is not normal. Engineers who jump straight to "maybe it is a bug" waste hours; engineers who follow the ladder usually find the fault in minutes.</p>

<h3>The ladder</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ladder">
<rect x="120" y="215" width="400" height="34" rx="6" fill="#fed7aa"/><text x="320" y="237" text-anchor="middle" class="svg-ink" font-size="13">1 Physical: link up, errors, optics</text>
<rect x="120" y="175" width="400" height="34" rx="6" fill="#fde68a"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">2 Cabling: CDP / LLDP match the plan</text>
<rect x="120" y="135" width="400" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">3 IP and MTU: addresses, ping, big ping</text>
<rect x="120" y="95" width="400" height="34" rx="6" fill="#bae6fd"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="13">4 Adjacency: OSPF FULL on every uplink</text>
<rect x="120" y="55" width="400" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">5 Routes: every loopback present</text>
<rect x="120" y="15" width="400" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">6 ECMP: one next hop per spine</text>
</svg><p class="cap">Climb from the bottom. The first abnormal step is where the fault lives.</p></div>

<h3>Step 1: physical</h3>
<pre class="out">LEAF2# show interface brief | include Eth1/
Eth1/1        --      eth  routed up      none                    100G(D) --
<span class="hl">Eth1/2        --      eth  routed down    Link not connected      auto(D) --</span>
LEAF2# show interface Ethernet1/1 | include CRC
    0 runts  0 giants  0 CRC  0 no buffer</pre>
<p>A port that is down, or a growing CRC counter (dirty fibre, bad optic), stops the investigation here. Clean or replace, then continue.</p>

<h3>Step 2: cabling matches the plan</h3>
<pre class="out">LEAF2# show cdp neighbors
Device-ID          Local Intrfce  Hldtme Capability  Platform      Port ID
<span class="hl">SPINE1(FDO2312X0AB) Eth1/1        134    R S s       N9K-C9364C    Eth1/2
SPINE2(FDO2312X0CD) Eth1/2        131    R S s       N9K-C9364C    Eth1/2</span></pre>
<p>Compare with the address plan: LEAF2 Eth1/1 should reach SPINE1 Eth1/2, LEAF2 Eth1/2 should reach SPINE2 Eth1/2. A swapped cable means the /31 addresses do not match and nothing above will work. With other vendors in the path use <code>feature lldp</code> and <code>show lldp neighbors</code>.</p>

<h3>Step 3: IP and MTU</h3>
<p>Ping the neighbour's link address, then ping with large packets and the Don't Fragment bit set:</p>
<pre class="out">LEAF2# ping 10.2.2.0 count 2
64 bytes from 10.2.2.0: icmp_seq=0 ttl=254 time=0.912 ms
64 bytes from 10.2.2.0: icmp_seq=1 ttl=254 time=0.701 ms
LEAF2# ping 10.2.2.0 packet-size 9000 df-bit count 2
<span class="hl">Request 0 timed out
Request 1 timed out</span></pre>
<p>Small pings work, big pings fail: an MTU mismatch on that link. <code>show interface Ethernet1/2 | include MTU</code> on both ends will show which side is wrong.</p>

<h3>Step 4: OSPF adjacency states</h3>
<table class="cmp"><tr><th>What you see</th><th>Meaning</th><th>Usual causes</th></tr>
<tr><td>No neighbour at all</td><td>Hellos not accepted</td><td>Interface not in OSPF, <b>area mismatch</b>, hello/dead mismatch, authentication mismatch, passive interface</td></tr>
<tr><td>INIT</td><td>I hear you, you do not hear me</td><td>One-way fibre, ACL or CoPP dropping hellos on one side</td></tr>
<tr><td>EXSTART / EXCHANGE stuck</td><td>Database exchange fails</td><td><b>MTU mismatch</b>, duplicate router-ID</td></tr>
<tr><td>FULL/DR or FULL/BDR on a fabric link</td><td>Works, but broadcast type</td><td>Missing <code>ip ospf network point-to-point</code></td></tr>
<tr><td>FULL/ -</td><td>Healthy point-to-point</td><td></td></tr>
</table>
<pre class="out">LEAF3# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 2
 Neighbor ID     Pri State            Up Time  Address         Interface
 10.255.0.11       1 FULL/ -          01:10:44 10.3.1.0        Eth1/1
<span class="hl"> 10.255.0.12       1 EXSTART/ -       00:00:31 10.3.2.0        Eth1/2</span></pre>
<p>EXSTART is the classic MTU symptom: OSPF database description packets carry the interface MTU, and a router refuses a DBD packet advertising an MTU larger than its own. Fix the MTU; do not hide it with <code>ip ospf mtu-ignore</code>, because data packets would still be dropped. For history of what happened, <code>show ip ospf event-history adjacency</code> shows recent state changes.</p>

<h3>Step 5: missing loopbacks</h3>
<pre class="out">LEAF1# show ip route 10.254.0.2
<span class="hl">Route not found</span>
LEAF2# show ip ospf interface brief
 Interface               ID     Area            Cost   State    Neighbors Status
 Lo0                     1      0.0.0.0         1      LOOPBACK 0         up
 Eth1/1                  2      0.0.0.0         40     P2P      1         up
 Eth1/2                  3      0.0.0.0         40     P2P      1         up</pre>
<p>LEAF2's Lo1 is missing from the OSPF interface list, so its VTEP address is never advertised. Add <code>ip router ospf UNDERLAY area 0.0.0.0</code> under loopback1.</p>

<h3>Step 6: single-path ECMP (the module's ticket lab)</h3>
<p>Ticket INC-6610: "After last night's change LEAF2 sends everything through SPINE1." Follow the ladder on LEAF2:</p>
<pre class="out">LEAF2# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 1
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          00:42:10 10.2.1.0        Eth1/1</span>

LEAF2# show running-config interface Ethernet1/2
interface Ethernet1/2
  description to SPINE2
  no switchport
  mtu 9216
  ip address 10.2.2.1/31
<span class="hl">  ip router ospf UNDERLAY area 0.0.0.1</span>
  no shutdown</pre>
<p>Only one neighbour. The link is up and addressed, but Ethernet1/2 is in <b>area 0.0.0.1</b> while SPINE2's side is in area 0.0.0.0, so hellos are rejected. The network type line is also missing. The fix, on LEAF2 only:</p>
<pre class="code">interface Ethernet1/2
  no ip router ospf UNDERLAY area 0.0.0.1
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
end
copy running-config startup-config</pre>
<pre class="out">LEAF2# show ip route 10.255.0.1
10.255.0.1/32, ubest/mbest: 2/0
<span class="hl">    *via 10.2.1.0, Eth1/1, [110/81], 00:00:12, ospf-UNDERLAY, intra
    *via 10.2.2.0, Eth1/2, [110/81], 00:00:12, ospf-UNDERLAY, intra</span></pre>
<div class="eg"><p><b>Worked example: other reasons for ubest 1.</b> Even with two FULL neighbours you can see one path if the costs differ. LEAF4's Eth1/1 is 100G (cost 1 with the 40G reference) but Eth1/2 was moved to a 10G breakout (cost 4). Via SPINE1: 1 + 1 + 1 = 3. Via SPINE2: 4 + 1 + 1 = 6. Only the cost-3 path is installed. Check <code>show ip ospf interface brief</code> for the Cost column on both uplinks.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing spine configuration when the ticket says the fault is on one leaf. Using <code>mtu-ignore</code> to "fix" EXSTART. Testing only with small pings. Forgetting to save after the fix, so the fault returns at the next reload.</p></div>
<div class="exam"><p><b>Exam tip.</b> EXSTART/EXCHANGE = MTU mismatch (or duplicate router-ID). No neighbour = area, timers, authentication or not enabled. INIT = one-way. ubest 1 with two FULL neighbours = cost mismatch. ubest 1 with one neighbour = the other uplink is not adjacent.</p></div>

<div class="scn"><h4>Two FULL neighbours, still one path</h4><p>After a maintenance window, LEAF4's traffic all used SPINE1. Both OSPF neighbours were FULL/ -, so the on-call engineer first suspected hashing. <code>show ip route 10.255.0.1</code> showed ubest 1, which ruled out hashing: the routing table itself had one path. <code>show ip ospf interface brief</code> showed cost 1 on Eth1/1 and cost 4 on Eth1/2: during the window the SPINE2 uplink had been temporarily re-cabled to a 4 × 10G breakout port. Moving it back to a 100G port restored equal costs and ubest 2.</p><p><b>Lesson:</b> ECMP needs equal cost, not just adjacency. Read the route table before blaming the hash.</p></div>

<div class="iv"><p class="q">"A leaf is using only one of its two spines. How do you troubleshoot?"</p><p>Strong answer: check the routing table first: <code>show ip route</code> for a remote loopback. If ubest is 1, it is a routing problem, not hashing. Then climb the ladder on the affected uplink: interface state and errors, CDP/LLDP against the cabling plan, ping and a large df-bit ping for MTU, <code>show ip ospf neighbors</code> and <code>show ip ospf interface</code> for area, network type and cost. Fix on the side that deviates from the standard template, verify ubest 2, and save. If ubest is already 2 but traffic is uneven, look at elephant flows and the hash fields.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot bottom-up: physical, cabling, IP and MTU, adjacency, routes, ECMP.</li>
<li>CDP/LLDP confirm the cabling matches the address plan.</li>
<li>Small ping OK but large df-bit ping fails = MTU; EXSTART is the OSPF symptom.</li>
<li>No neighbour usually means area, timers, authentication or interface not in OSPF.</li>
<li>ubest 1 means routing (missing adjacency or unequal cost); only ubest 2 or more with uneven load points to hashing.</li>
</ul></div>
`,hi:`
<p>Achha doctor brain scan se shuru nahi karta. Woh pehle pulse, saans aur temperature check karta hai, phir zyada specific tests par jaata hai. Underlay troubleshooting bhi aise hi kaam karta hai: cable se shuru karo aur ek-ek layer upar chadho jab tak pehli cheez na mile jo normal nahi hai. Jo engineers seedha "shayad bug hai" par kood jaate hain woh ghante barbaad karte hain; jo seedhi follow karte hain woh aam taur par minutes mein fault dhoondh lete hain.</p>

<h3>Seedhi (ladder)</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ladder">
<rect x="120" y="215" width="400" height="34" rx="6" fill="#fed7aa"/><text x="320" y="237" text-anchor="middle" class="svg-ink" font-size="13">1 Physical: link up, errors, optics</text>
<rect x="120" y="175" width="400" height="34" rx="6" fill="#fde68a"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">2 Cabling: CDP / LLDP plan se match</text>
<rect x="120" y="135" width="400" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">3 IP aur MTU: addresses, ping, bada ping</text>
<rect x="120" y="95" width="400" height="34" rx="6" fill="#bae6fd"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="13">4 Adjacency: har uplink par OSPF FULL</text>
<rect x="120" y="55" width="400" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">5 Routes: har loopback maujood</text>
<rect x="120" y="15" width="400" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">6 ECMP: har spine ka ek next hop</text>
</svg><p class="cap">Neeche se chadho. Pehla abnormal step wahi hai jahan fault rehta hai.</p></div>

<h3>Step 1: physical</h3>
<pre class="out">LEAF2# show interface brief | include Eth1/
Eth1/1        --      eth  routed up      none                    100G(D) --
<span class="hl">Eth1/2        --      eth  routed down    Link not connected      auto(D) --</span>
LEAF2# show interface Ethernet1/1 | include CRC
    0 runts  0 giants  0 CRC  0 no buffer</pre>
<p>Down port, ya badhta hua CRC counter (gandi fibre, kharab optic), investigation yahin rok deta hai. Saaf karo ya replace karo, phir aage badho.</p>

<h3>Step 2: cabling plan se match karti hai</h3>
<pre class="out">LEAF2# show cdp neighbors
Device-ID          Local Intrfce  Hldtme Capability  Platform      Port ID
<span class="hl">SPINE1(FDO2312X0AB) Eth1/1        134    R S s       N9K-C9364C    Eth1/2
SPINE2(FDO2312X0CD) Eth1/2        131    R S s       N9K-C9364C    Eth1/2</span></pre>
<p>Address plan se compare karo: LEAF2 Eth1/1 ko SPINE1 Eth1/2 tak pahunchna chahiye, LEAF2 Eth1/2 ko SPINE2 Eth1/2 tak. Swapped cable ka matlab hai /31 addresses match nahi karte aur upar kuch bhi kaam nahi karega. Path mein dusre vendors hon to <code>feature lldp</code> aur <code>show lldp neighbors</code> use karo.</p>

<h3>Step 3: IP aur MTU</h3>
<p>Neighbour ka link address ping karo, phir bade packets aur Don't Fragment bit set karke ping karo:</p>
<pre class="out">LEAF2# ping 10.2.2.0 count 2
64 bytes from 10.2.2.0: icmp_seq=0 ttl=254 time=0.912 ms
64 bytes from 10.2.2.0: icmp_seq=1 ttl=254 time=0.701 ms
LEAF2# ping 10.2.2.0 packet-size 9000 df-bit count 2
<span class="hl">Request 0 timed out
Request 1 timed out</span></pre>
<p>Chhote pings chalte hain, bade fail hote hain: us link par MTU mismatch. Dono ends par <code>show interface Ethernet1/2 | include MTU</code> dikha dega ki kaunsi side galat hai.</p>

<h3>Step 4: OSPF adjacency states</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Matlab</th><th>Usual causes</th></tr>
<tr><td>Koi neighbour hi nahi</td><td>Hellos accept nahi ho rahe</td><td>Interface OSPF mein nahi, <b>area mismatch</b>, hello/dead mismatch, authentication mismatch, passive interface</td></tr>
<tr><td>INIT</td><td>Main tumhe sunta hoon, tum mujhe nahi</td><td>One-way fibre, ek side par ACL ya CoPP hellos drop kar raha hai</td></tr>
<tr><td>EXSTART / EXCHANGE par atka</td><td>Database exchange fail</td><td><b>MTU mismatch</b>, duplicate router-ID</td></tr>
<tr><td>Fabric link par FULL/DR ya FULL/BDR</td><td>Kaam karta hai, lekin broadcast type</td><td><code>ip ospf network point-to-point</code> missing</td></tr>
<tr><td>FULL/ -</td><td>Healthy point-to-point</td><td></td></tr>
</table>
<pre class="out">LEAF3# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 2
 Neighbor ID     Pri State            Up Time  Address         Interface
 10.255.0.11       1 FULL/ -          01:10:44 10.3.1.0        Eth1/1
<span class="hl"> 10.255.0.12       1 EXSTART/ -       00:00:31 10.3.2.0        Eth1/2</span></pre>
<p>EXSTART classic MTU symptom hai: OSPF database description packets interface MTU le jaate hain, aur router aise DBD packet ko mana kar deta hai jo uske apne se bada MTU advertise kare. MTU theek karo; ise <code>ip ospf mtu-ignore</code> se chhupao mat, kyunki data packets phir bhi drop honge. Kya hua uski history ke liye, <code>show ip ospf event-history adjacency</code> recent state changes dikhata hai.</p>

<h3>Step 5: missing loopbacks</h3>
<pre class="out">LEAF1# show ip route 10.254.0.2
<span class="hl">Route not found</span>
LEAF2# show ip ospf interface brief
 Interface               ID     Area            Cost   State    Neighbors Status
 Lo0                     1      0.0.0.0         1      LOOPBACK 0         up
 Eth1/1                  2      0.0.0.0         40     P2P      1         up
 Eth1/2                  3      0.0.0.0         40     P2P      1         up</pre>
<p>LEAF2 ka Lo1 OSPF interface list se missing hai, isliye uska VTEP address kabhi advertise nahi hota. loopback1 ke neeche <code>ip router ospf UNDERLAY area 0.0.0.0</code> jodo.</p>

<h3>Step 6: single-path ECMP (module ka ticket lab)</h3>
<p>Ticket INC-6610: "Kal raat ke change ke baad LEAF2 sab kuch SPINE1 se bhejta hai." LEAF2 par seedhi follow karo:</p>
<pre class="out">LEAF2# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 1
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          00:42:10 10.2.1.0        Eth1/1</span>

LEAF2# show running-config interface Ethernet1/2
interface Ethernet1/2
  description to SPINE2
  no switchport
  mtu 9216
  ip address 10.2.2.1/31
<span class="hl">  ip router ospf UNDERLAY area 0.0.0.1</span>
  no shutdown</pre>
<p>Sirf ek neighbour. Link up aur addressed hai, lekin Ethernet1/2 <b>area 0.0.0.1</b> mein hai jabki SPINE2 ki side area 0.0.0.0 mein hai, isliye hellos reject hote hain. Network type line bhi missing hai. Fix, sirf LEAF2 par:</p>
<pre class="code">interface Ethernet1/2
  no ip router ospf UNDERLAY area 0.0.0.1
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
end
copy running-config startup-config</pre>
<pre class="out">LEAF2# show ip route 10.255.0.1
10.255.0.1/32, ubest/mbest: 2/0
<span class="hl">    *via 10.2.1.0, Eth1/1, [110/81], 00:00:12, ospf-UNDERLAY, intra
    *via 10.2.2.0, Eth1/2, [110/81], 00:00:12, ospf-UNDERLAY, intra</span></pre>
<div class="eg"><p><b>Worked example: ubest 1 ki dusri wajahein.</b> Do FULL neighbours hone par bhi agar costs alag hain to ek hi path dikh sakta hai. LEAF4 ka Eth1/1 100G hai (40G reference ke saath cost 1) lekin Eth1/2 ko 10G breakout par move kar diya gaya (cost 4). SPINE1 ke through: 1 + 1 + 1 = 3. SPINE2 ke through: 4 + 1 + 1 = 6. Sirf cost-3 wala path install hota hai. Dono uplinks ke liye <code>show ip ospf interface brief</code> mein Cost column check karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Spine configuration badalna jabki ticket kehta hai fault ek leaf par hai. EXSTART ko "fix" karne ke liye <code>mtu-ignore</code> use karna. Sirf chhote pings se test karna. Fix ke baad save karna bhool jaana, jisse agle reload par fault wapas aa jaata hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> EXSTART/EXCHANGE = MTU mismatch (ya duplicate router-ID). Koi neighbour nahi = area, timers, authentication ya enabled nahi. INIT = one-way. Do FULL neighbours ke saath ubest 1 = cost mismatch. Ek neighbour ke saath ubest 1 = dusra uplink adjacent nahi hai.</p></div>

<div class="scn"><h4>Do FULL neighbours, phir bhi ek path</h4><p>Maintenance window ke baad LEAF4 ka saara traffic SPINE1 use kar raha tha. Dono OSPF neighbours FULL/ - the, isliye on-call engineer ne pehle hashing par shak kiya. <code>show ip route 10.255.0.1</code> ne ubest 1 dikhaya, jisne hashing ko rule out kar diya: routing table mein hi ek path tha. <code>show ip ospf interface brief</code> ne Eth1/1 par cost 1 aur Eth1/2 par cost 4 dikhaya: window ke dauraan SPINE2 uplink ko temporarily 4 × 10G breakout port par re-cable kiya gaya tha. Use wapas 100G port par le jaane se equal costs aur ubest 2 wapas aa gaye.</p><p><b>Seekh:</b> ECMP ko equal cost chahiye, sirf adjacency nahi. Hash ko blame karne se pehle route table padho.</p></div>

<div class="iv"><p class="q">"Ek leaf apne do spines mein se sirf ek use kar raha hai. Kaise troubleshoot karoge?"</p><p>Strong answer: pehle routing table check karo: remote loopback ke liye <code>show ip route</code>. Agar ubest 1 hai, to yeh routing problem hai, hashing nahi. Phir affected uplink par seedhi chadho: interface state aur errors, cabling plan ke against CDP/LLDP, MTU ke liye ping aur bada df-bit ping, area, network type aur cost ke liye <code>show ip ospf neighbors</code> aur <code>show ip ospf interface</code>. Us side par fix karo jo standard template se hat-ti hai, ubest 2 verify karo, aur save karo. Agar ubest pehle se 2 hai lekin traffic uneven hai, to elephant flows aur hash fields dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bottom-up troubleshoot karo: physical, cabling, IP aur MTU, adjacency, routes, ECMP.</li>
<li>CDP/LLDP confirm karte hain ki cabling address plan se match karti hai.</li>
<li>Chhota ping OK lekin bada df-bit ping fail = MTU; EXSTART uska OSPF symptom hai.</li>
<li>Koi neighbour nahi ka matlab aam taur par area, timers, authentication ya interface OSPF mein nahi.</li>
<li>ubest 1 matlab routing (missing adjacency ya unequal cost); sirf ubest 2 ya zyada ke saath uneven load hashing ki taraf ishaara karta hai.</li>
</ul></div>
`}};export{e as default};