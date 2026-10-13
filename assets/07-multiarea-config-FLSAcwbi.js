var e={id:`multiarea-config`,h:{en:`Configuring and verifying multi-area OSPF`,hi:`Multi-area OSPF configure aur verify karna`},body:{en:`
<p>Opening a new state border office is simple: you post one officer on the border road, with one foot in each state. The officer does not need a special licence; standing on the border is what makes him a border officer. An OSPF ABR is the same. You do not type "abr"; you put one interface in area 0 and another in area 10, and the router starts behaving as an ABR.</p>

<h3>Lab 1 starting point</h3>
<p>R1 already runs OSPF in area 10: <code>network 10.10.12.0 0.0.0.3 area 10</code>, <code>network 172.16.0.0 0.0.3.255 area 10</code> and its loopback 1.1.1.1. Its four LAN loopbacks use <code>ip ospf network point-to-point</code> so they are advertised as /24. CORE runs area 0 with <code>network 10.0.0.0 0.0.255.255 area 0</code>. R5 runs area 20 with its plant LAN passive. ABR1 and ABR2 have IP addresses but no OSPF. Right now nothing crosses between areas.</p>

<h3>Two ways to enable OSPF, both valid on an ABR</h3>
<p><b>Interface method</b> (used on ABR1). You state the area on each interface, so there is no wildcard to get wrong. <code>show ip ospf interface</code> then says "Attached via Interface Enable".</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# router-id 2.2.2.2
ABR1(config-router)# interface GigabitEthernet0/0
ABR1(config-if)# ip ospf 1 area 10
ABR1(config-if)# interface GigabitEthernet0/1
ABR1(config-if)# ip ospf 1 area 0
ABR1(config-if)# interface Loopback0
ABR1(config-if)# ip ospf 1 area 0</pre>
<p><b>Network statement method</b> (used on ABR2). Each statement matches interface addresses with a wildcard and puts them in an area. On an ABR keep the statements specific and non-overlapping, so every interface lands in exactly the area you intend.</p>
<pre class="code">ABR2(config)# router ospf 1
ABR2(config-router)# router-id 4.4.4.4
ABR2(config-router)# network 10.0.34.0 0.0.0.3 area 0
ABR2(config-router)# network 4.4.4.4 0.0.0.0 area 0
ABR2(config-router)# network 10.20.45.0 0.0.0.3 area 20</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Interface to area mapping on ABR1 and ABR2">
<rect x="30" y="30" width="260" height="140" rx="10" fill="#e2e8f0"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="13">ABR1 (2.2.2.2)</text>
<rect x="50" y="70" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="100" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 area 10</text>
<rect x="170" y="70" width="100" height="30" rx="6" fill="#bae6fd"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1 area 0</text>
<rect x="170" y="115" width="100" height="30" rx="6" fill="#bae6fd"/><text x="220" y="135" text-anchor="middle" class="svg-ink" font-size="12">Lo0 area 0</text>
<rect x="350" y="30" width="260" height="140" rx="10" fill="#e2e8f0"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="13">ABR2 (4.4.4.4)</text>
<rect x="370" y="70" width="100" height="30" rx="6" fill="#bae6fd"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 area 0</text>
<rect x="370" y="115" width="100" height="30" rx="6" fill="#bae6fd"/><text x="420" y="135" text-anchor="middle" class="svg-ink" font-size="12">Lo0 area 0</text>
<rect x="490" y="70" width="100" height="30" rx="6" fill="#fde68a"/><text x="540" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1 area 20</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">One LSDB per area on each ABR; loopbacks placed in area 0</text>
</svg><p class="cap">Each ABR has one foot in area 0 and one in its regional area.</p></div>

<h3>Verify the ABR role</h3>
<pre class="out">ABR1# show ip ospf | include border|Area
 <span class="hl">It is an area border router</span>
    Area BACKBONE(0)
        Area has no authentication
    Area 10
        Area has no authentication

ABR1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0
Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1
Gi0/0        1     10              10.10.12.2/30      1     BDR   1/1</pre>
<p>Both transit interfaces show BDR because R1 and CORE were already running and won the DR role on their segments; the election is non-preemptive. That is fine; in production you would make these links point-to-point as in chapter 4.</p>

<h3>Verify inter-area routes</h3>
<pre class="out">R1# show ip route ospf
      2.0.0.0/32 is subnetted, 1 subnets
O IA     2.2.2.2 [110/2] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O IA     3.3.3.3 [110/3] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
      5.0.0.0/32 is subnetted, 1 subnets
O IA     5.5.5.5 [110/5] via 10.10.12.2, 00:00:48, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O IA     10.0.23.0/30 [110/2] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
O IA     10.0.34.0/30 [110/3] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
O IA     10.20.45.0/30 [110/4] via 10.10.12.2, 00:00:48, GigabitEthernet0/0
<span class="hl">O IA  192.168.20.0/24 [110/5] via 10.10.12.2, 00:00:48, GigabitEthernet0/0</span></pre>
<p>Note that ABR1's own loopback 2.2.2.2 is O IA on R1: it lives in area 0, so R1 learns it through a type 3 LSA. On R5 the check is <code>O IA 1.1.1.1/32</code>, proving the path works in both directions.</p>

<h3>show ip ospf border-routers</h3>
<p>This command shows the internal routing table of ABRs and ASBRs, the routers that OSPF must reach to use type 3, 4 and 5 LSAs.</p>
<pre class="out">CORE# show ip ospf border-routers

            OSPF Router with ID (3.3.3.3) (Process ID 1)

Internal Router Routing Table
Codes: i - Intra-area route, I - Inter-area route

<span class="hl">i 2.2.2.2 [1] via 10.0.23.1, GigabitEthernet0/0, ABR, Area 0, SPF 6</span>
<span class="hl">i 4.4.4.4 [1] via 10.0.34.2, GigabitEthernet0/1, ABR, Area 0, SPF 6</span></pre>
<p>On R1 you would see <code>i 2.2.2.2 [1] ... ABR, Area 10</code>. If an ASBR existed in area 20, R1 would see it as <code>I 5.5.5.5 [4] ... ASBR, Area 10</code>, learned through ABR1's type 4 LSA.</p>

<div class="eg"><p><b>Worked example: the cost 5.</b> R1 to 192.168.20.0/24: ABR2 calculates its intra-area cost to the LAN as 1 (Gi0/1) + 1 (R5 Gi0/1 stub) = 2 and puts 2 in its type 3 into area 0. CORE adds 1 to reach ABR2: 3. ABR1 adds 1 to reach CORE, so it originates a new type 3 into area 10 with metric 3 + 1 = 4. R1 adds 1 to reach ABR1: <b>5</b>. Every ABR re-originates the prefix with its own total cost.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a broad statement like <code>network 10.0.0.0 0.255.255.255 area 0</code> on an ABR. It also matches 10.10.12.2 and 10.20.45.1, so the area 10 or 20 links are placed in area 0 and the neighbour on the other side logs a mismatched area. Be specific on ABRs, or use the interface method.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>O IA</code> means inter-area, learned from a type 3 LSA. The process ID (<code>router ospf 1</code>) is local and does not need to match between neighbours; the area does.</p></div>

<div class="scn"><h4>The ABR that joined the wrong area</h4><p>A new distribution router was added with <code>network 10.0.0.0 0.255.255.255 area 0</code> to "catch everything". Its downlink to an area 30 router was 10.30.1.1/30. The area 30 router logged <code>%OSPF-4-ERRRCV: Received invalid packet: mismatched area ID from backbone area</code> and area 30 disappeared from the network. <code>show ip ospf interface brief</code> on the new router showed the downlink in area 0. Replacing the broad line with one specific statement per link, including <code>network 10.30.1.0 0.0.0.3 area 30</code>, fixed it.</p><p><b>Lesson:</b> on an ABR, verify the area of every interface with <code>show ip ospf interface brief</code>.</p></div>

<div class="iv"><p class="q">"How do you configure a router as an ABR, and how do you verify it?"</p><p>Strong answer: there is no ABR command; place at least one active interface in area 0 and another in a different area, with either network statements or <code>ip ospf &lt;pid&gt; area &lt;id&gt;</code>. Verify with <code>show ip ospf</code> ("It is an area border router"), <code>show ip ospf interface brief</code> for the per-interface area, <code>show ip ospf border-routers</code> on other routers, and O IA routes in the routing table.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A router becomes an ABR by having active interfaces in area 0 and another area.</li>
<li>The interface method avoids wildcard mistakes; on ABRs keep network statements specific.</li>
<li><code>show ip ospf</code>, <code>show ip ospf interface brief</code> and <code>show ip ospf border-routers</code> confirm the design.</li>
<li>Inter-area routes appear as O IA; each ABR re-originates them with its own cost.</li>
<li>Place ABR loopbacks deliberately; they appear O IA in other areas.</li>
</ul></div>
`,hi:`
<p>Naye state border office ko kholna simple hai: aap border road par ek officer tainaat karte ho, jiska ek pair har state mein ho. Officer ko special licence ki zaroorat nahi; border par khade hona hi use border officer banata hai. OSPF ABR bhi aisa hi hai. Aap "abr" type nahi karte; ek interface area 0 mein aur doosra area 10 mein daalte ho, aur router ABR ki tarah behave karna shuru kar deta hai.</p>

<h3>Lab 1 ka starting point</h3>
<p>R1 pehle se area 10 mein OSPF chala raha hai: <code>network 10.10.12.0 0.0.0.3 area 10</code>, <code>network 172.16.0.0 0.0.3.255 area 10</code> aur uska loopback 1.1.1.1. Uske chaar LAN loopbacks <code>ip ospf network point-to-point</code> use karte hain taaki /24 advertise hon. CORE <code>network 10.0.0.0 0.0.255.255 area 0</code> ke saath area 0 chala raha hai. R5 area 20 chala raha hai aur uska plant LAN passive hai. ABR1 aur ABR2 par IP addresses hain par OSPF nahi. Abhi areas ke beech kuch bhi cross nahi hota.</p>

<h3>OSPF enable karne ke do tarike, dono ABR par valid</h3>
<p><b>Interface method</b> (ABR1 par use hua). Aap har interface par area batate ho, isliye galat karne ke liye koi wildcard nahi. Tab <code>show ip ospf interface</code> kehta hai "Attached via Interface Enable".</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# router-id 2.2.2.2
ABR1(config-router)# interface GigabitEthernet0/0
ABR1(config-if)# ip ospf 1 area 10
ABR1(config-if)# interface GigabitEthernet0/1
ABR1(config-if)# ip ospf 1 area 0
ABR1(config-if)# interface Loopback0
ABR1(config-if)# ip ospf 1 area 0</pre>
<p><b>Network statement method</b> (ABR2 par use hua). Har statement wildcard se interface addresses match karta hai aur unhe ek area mein daalta hai. ABR par statements specific aur non-overlapping rakho, taaki har interface bilkul usi area mein jaaye jo aap chahte ho.</p>
<pre class="code">ABR2(config)# router ospf 1
ABR2(config-router)# router-id 4.4.4.4
ABR2(config-router)# network 10.0.34.0 0.0.0.3 area 0
ABR2(config-router)# network 4.4.4.4 0.0.0.0 area 0
ABR2(config-router)# network 10.20.45.0 0.0.0.3 area 20</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ABR1 aur ABR2 par interface se area mapping">
<rect x="30" y="30" width="260" height="140" rx="10" fill="#e2e8f0"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="13">ABR1 (2.2.2.2)</text>
<rect x="50" y="70" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="100" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 area 10</text>
<rect x="170" y="70" width="100" height="30" rx="6" fill="#bae6fd"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1 area 0</text>
<rect x="170" y="115" width="100" height="30" rx="6" fill="#bae6fd"/><text x="220" y="135" text-anchor="middle" class="svg-ink" font-size="12">Lo0 area 0</text>
<rect x="350" y="30" width="260" height="140" rx="10" fill="#e2e8f0"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="13">ABR2 (4.4.4.4)</text>
<rect x="370" y="70" width="100" height="30" rx="6" fill="#bae6fd"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 area 0</text>
<rect x="370" y="115" width="100" height="30" rx="6" fill="#bae6fd"/><text x="420" y="135" text-anchor="middle" class="svg-ink" font-size="12">Lo0 area 0</text>
<rect x="490" y="70" width="100" height="30" rx="6" fill="#fde68a"/><text x="540" y="90" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1 area 20</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Har ABR par har area ka ek LSDB; loopbacks area 0 mein</text>
</svg><p class="cap">Har ABR ka ek pair area 0 mein aur ek apne regional area mein hai.</p></div>

<h3>ABR role verify karo</h3>
<pre class="out">ABR1# show ip ospf | include border|Area
 <span class="hl">It is an area border router</span>
    Area BACKBONE(0)
        Area has no authentication
    Area 10
        Area has no authentication

ABR1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0
Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1
Gi0/0        1     10              10.10.12.2/30      1     BDR   1/1</pre>
<p>Dono transit interfaces BDR dikhate hain kyunki R1 aur CORE pehle se chal rahe the aur apne segments par DR role jeet chuke the; election non-preemptive hai. Yeh theek hai; production mein aap in links ko chapter 4 ki tarah point-to-point banaoge.</p>

<h3>Inter-area routes verify karo</h3>
<pre class="out">R1# show ip route ospf
      2.0.0.0/32 is subnetted, 1 subnets
O IA     2.2.2.2 [110/2] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O IA     3.3.3.3 [110/3] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
      5.0.0.0/32 is subnetted, 1 subnets
O IA     5.5.5.5 [110/5] via 10.10.12.2, 00:00:48, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O IA     10.0.23.0/30 [110/2] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
O IA     10.0.34.0/30 [110/3] via 10.10.12.2, 00:01:05, GigabitEthernet0/0
O IA     10.20.45.0/30 [110/4] via 10.10.12.2, 00:00:48, GigabitEthernet0/0
<span class="hl">O IA  192.168.20.0/24 [110/5] via 10.10.12.2, 00:00:48, GigabitEthernet0/0</span></pre>
<p>Dhyan do ki ABR1 ka apna loopback 2.2.2.2 R1 par O IA hai: woh area 0 mein hai, isliye R1 use type 3 LSA se seekhta hai. R5 par check hai <code>O IA 1.1.1.1/32</code>, jo prove karta hai ki path dono directions mein kaam karta hai.</p>

<h3>show ip ospf border-routers</h3>
<p>Yeh command ABRs aur ASBRs ki internal routing table dikhata hai, yaani woh routers jin tak OSPF ko type 3, 4 aur 5 LSAs use karne ke liye pahunchna hai.</p>
<pre class="out">CORE# show ip ospf border-routers

            OSPF Router with ID (3.3.3.3) (Process ID 1)

Internal Router Routing Table
Codes: i - Intra-area route, I - Inter-area route

<span class="hl">i 2.2.2.2 [1] via 10.0.23.1, GigabitEthernet0/0, ABR, Area 0, SPF 6</span>
<span class="hl">i 4.4.4.4 [1] via 10.0.34.2, GigabitEthernet0/1, ABR, Area 0, SPF 6</span></pre>
<p>R1 par aapko <code>i 2.2.2.2 [1] ... ABR, Area 10</code> dikhega. Agar area 20 mein koi ASBR hota, to R1 use <code>I 5.5.5.5 [4] ... ASBR, Area 10</code> ke roop mein dekhta, jo ABR1 ke type 4 LSA se seekha gaya.</p>

<div class="eg"><p><b>Worked example: cost 5.</b> R1 se 192.168.20.0/24: ABR2 LAN tak apni intra-area cost 1 (Gi0/1) + 1 (R5 Gi0/1 stub) = 2 calculate karta hai aur area 0 mein apne type 3 mein 2 daalta hai. CORE ABR2 tak pahunchne ke liye 1 jodta hai: 3. ABR1 CORE tak 1 jodta hai, isliye area 10 mein metric 3 + 1 = 4 ke saath naya type 3 banata hai. R1 ABR1 tak 1 jodta hai: <b>5</b>. Har ABR prefix ko apni total cost ke saath dobara originate karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> ABR par <code>network 10.0.0.0 0.255.255.255 area 0</code> jaisa broad statement use karna. Yeh 10.10.12.2 aur 10.20.45.1 ko bhi match karta hai, isliye area 10 ya 20 ke links area 0 mein chale jaate hain aur doosri taraf ka neighbour mismatched area log karta hai. ABRs par specific raho, ya interface method use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>O IA</code> ka matlab inter-area, type 3 LSA se seekha gaya. Process ID (<code>router ospf 1</code>) local hai aur neighbours ke beech match hona zaroori nahi; area zaroori hai.</p></div>

<div class="scn"><h4>ABR jo galat area mein join ho gaya</h4><p>Ek naya distribution router "sab kuch pakadne" ke liye <code>network 10.0.0.0 0.255.255.255 area 0</code> ke saath joda gaya. Uska area 30 router ki taraf downlink 10.30.1.1/30 tha. Area 30 router ne <code>%OSPF-4-ERRRCV: Received invalid packet: mismatched area ID from backbone area</code> log kiya aur area 30 network se gayab ho gaya. Naye router par <code>show ip ospf interface brief</code> ne downlink ko area 0 mein dikhaya. Broad line ko har link ke ek specific statement se replace karne se fix hua, jismein <code>network 10.30.1.0 0.0.0.3 area 30</code> bhi tha.</p><p><b>Seekh:</b> ABR par <code>show ip ospf interface brief</code> se har interface ka area verify karo.</p></div>

<div class="iv"><p class="q">"Router ko ABR kaise configure karte ho, aur kaise verify karte ho?"</p><p>Strong answer: koi ABR command nahi hai; kam se kam ek active interface area 0 mein aur doosra kisi alag area mein daalo, network statements ya <code>ip ospf &lt;pid&gt; area &lt;id&gt;</code> se. Verify karo <code>show ip ospf</code> ("It is an area border router") se, per-interface area ke liye <code>show ip ospf interface brief</code> se, doosre routers par <code>show ip ospf border-routers</code> se, aur routing table mein O IA routes se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router area 0 aur doosre area mein active interfaces rakh kar ABR banta hai.</li>
<li>Interface method wildcard galtiyon se bachata hai; ABRs par network statements specific rakho.</li>
<li><code>show ip ospf</code>, <code>show ip ospf interface brief</code> aur <code>show ip ospf border-routers</code> design confirm karte hain.</li>
<li>Inter-area routes O IA dikhte hain; har ABR unhe apni cost ke saath dobara originate karta hai.</li>
<li>ABR loopbacks soch samajh kar rakho; woh doosre areas mein O IA dikhte hain.</li>
</ul></div>
`}};export{e as default};