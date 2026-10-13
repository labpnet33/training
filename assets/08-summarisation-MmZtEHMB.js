var e={id:`summarisation`,h:{en:`Summarisation: area range and summary-address`,hi:`Summarisation: area range aur summary-address`},body:{en:`
<p>A courier company does not tell its Delhi hub about every house in Pune. It says "anything with a PIN code starting 411 goes to the Pune hub". One line replaces thousands, and when a new street is built in Pune the Delhi hub never needs to know. That is route summarisation. In OSPF it can happen in exactly two places: at an <b>ABR</b> for internal routes (<code>area range</code>) and at an <b>ASBR</b> for external routes (<code>summary-address</code>).</p>

<h3>Why summarise</h3>
<ul>
<li><b>Smaller LSDBs and routing tables</b> in every other area: one type 3 instead of many.</li>
<li><b>Stability</b>: a flapping /24 inside the summarised range does not change the summary, so no LSA floods into other areas and no routes change there.</li>
<li><b>Faster convergence and less CPU</b> across the backbone.</li>
</ul>
<p>The price is less precise routing: other areas see one path to the whole block, even if one component is only reachable through a different ABR.</p>

<h3>Inter-area summarisation with area range</h3>
<p>Configured on the ABR under the OSPF process, naming the area where the component networks <b>live</b>:</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 range 172.16.0.0 255.255.252.0
<span class="c">! optional keywords:</span>
<span class="c">!   not-advertise  suppress the summary and the components (a filter)</span>
<span class="c">!   cost 20        advertise the summary with a fixed metric</span></pre>
<p>The ABR stops sending the four /24 type 3 LSAs into area 0 and sends one type 3 for 172.16.0.0/22. The summary is advertised only while at least one component network exists in area 10. If all components disappear, the summary is withdrawn.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="area range on ABR1">
<rect x="20" y="30" width="200" height="160" rx="12" fill="#bbf7d0"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="12">172.16.0.0/24</text>
<text x="120" y="102" text-anchor="middle" class="svg-muted" font-size="12">172.16.1.0/24</text>
<text x="120" y="122" text-anchor="middle" class="svg-muted" font-size="12">172.16.2.0/24</text>
<text x="120" y="142" text-anchor="middle" class="svg-muted" font-size="12">172.16.3.0/24</text>
<rect x="250" y="90" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="305" y="110" text-anchor="middle" class="svg-ink" font-size="13">ABR1</text><text x="305" y="126" text-anchor="middle" class="svg-muted" font-size="12">area 10 range</text>
<rect x="400" y="30" width="220" height="160" rx="12" fill="#bae6fd"/><text x="510" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0 and beyond</text>
<text x="510" y="110" text-anchor="middle" class="svg-accent" font-size="13">one T3: 172.16.0.0/22</text>
<line x1="220" y1="112" x2="250" y2="112" stroke="#64748b" stroke-width="2"/><line x1="360" y1="112" x2="400" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="305" y="170" text-anchor="middle" class="svg-muted" font-size="12">Null0 discard route on ABR1</text>
</svg><p class="cap">Four type 3 LSAs become one. A flap of 172.16.2.0/24 is now invisible outside area 10.</p></div>

<h3>Verification</h3>
<pre class="out">ABR1# show ip ospf | begin Area 10
    Area 10
        Number of interfaces in this area is 1
        Area has no authentication
        SPF algorithm last executed 00:03:12.408 ago
        SPF algorithm executed 5 times
        <span class="hl">Area ranges are
           172.16.0.0/22 Active(2) Advertise</span>

ABR1# show ip route ospf | include 172.16
      172.16.0.0/16 is variably subnetted, 5 subnets, 2 masks
O        172.16.0.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
O        172.16.1.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
O        172.16.2.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
O        172.16.3.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
<span class="hl">O        172.16.0.0/22 is a summary, 00:00:41, Null0</span>

CORE# show ip route ospf | include 172.16
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">O IA     172.16.0.0/22 [110/3] via 10.0.23.1, 00:00:39, GigabitEthernet0/0</span></pre>
<p><b>Active(2)</b> means the range is active and its metric is 2. The <b>Null0 discard route</b> is installed automatically on the ABR. If a packet arrives for 172.16.3.77 but 172.16.3.0/24 has disappeared, the more specific route is gone, the packet matches the /22 to Null0 and is dropped, instead of following a default route back into the backbone and looping. The metric of the summary is derived from the metrics of its component routes; to make it deterministic you can pin it with the <code>cost</code> keyword.</p>

<h3>External summarisation with summary-address</h3>
<p>Type 5 (and type 7) LSAs are created by the ASBR, so only the ASBR can summarise them. The ABR's <code>area range</code> does not touch external routes.</p>
<pre class="code">R5(config)# ip route 10.50.0.0 255.255.255.0 Null0
R5(config)# ip route 10.50.1.0 255.255.255.0 Null0
R5(config)# router ospf 1
R5(config-router)# redistribute static subnets
R5(config-router)# summary-address 10.50.0.0 255.255.254.0</pre>
<p>R5 becomes an ASBR and originates one type 5 LSA for 10.50.0.0/23 instead of two /24s. Other routers see <code>O E2 10.50.0.0/23 [110/20]</code>. R5 also installs its own Null0 discard route for the external summary. <code>show ip ospf summary-address</code> lists the configured external summaries. <code>summary-address ... not-advertise</code> suppresses them, which acts as a filter.</p>

<div class="eg"><p><b>Worked example: choosing the range.</b> Pune has 172.16.0.0/24 to 172.16.3.0/24. Write the third octet in binary: 0 = 000000<b>00</b>, 1 = 000000<b>01</b>, 2 = 000000<b>10</b>, 3 = 000000<b>11</b>. The first 6 bits of the third octet are common, so the prefix length is 16 + 6 = 22: <code>172.16.0.0/22</code>, mask 255.255.252.0. If Pune later adds 172.16.4.0/24, it falls outside the /22; you would either add a second range or re-plan the block as /21 (172.16.0.0 to 172.16.7.255).</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>area 0 range 172.16.0.0 255.255.252.0</code> on ABR1 because "the summary goes into area 0". The area in the command is where the <b>components live</b> (area 10), not where the summary is sent. The wrong area makes the command do nothing useful.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>area range</code> = ABR, inter-area (type 3). <code>summary-address</code> = ASBR, external (type 5/7). Also, OSPF summarisation is never possible inside an area, because all routers in an area must have the same LSDB.</p></div>

<div class="scn"><h4>The summary that swallowed a data centre</h4><p>An ABR for area 5 was configured with <code>area 5 range 10.0.0.0 255.0.0.0</code> to "keep things tidy". A new data centre in area 7 also used 10.200.0.0/16. Traffic from area 0 to 10.200.x.x worked most of the time but sometimes went to the area 5 ABR, which sent it to its Null0 discard route. The engineer saw two O IA entries for overlapping prefixes on backbone routers: the /16 from area 7 (more specific, so normally preferred) and the /8 from area 5. During an area 7 flap the /16 disappeared and the /8 attracted traffic into a black hole. The fix was a correctly sized range for area 5.</p><p><b>Lesson:</b> summarise only address space that really lives behind that ABR; oversized summaries attract traffic.</p></div>

<div class="iv"><p class="q">"Where can you summarise in OSPF, and what are the commands?"</p><p>Strong answer: only at ABRs and ASBRs. On an ABR, <code>area X range</code> summarises type 3 LSAs for networks in area X; on an ASBR, <code>summary-address</code> summarises type 5 or type 7 external routes. Mention the automatic Null0 discard route, that the range is advertised only while a component exists, and the <code>not-advertise</code> and <code>cost</code> options.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Summarise at an ABR with <code>area &lt;where components live&gt; range</code>.</li>
<li>Summarise externals at the ASBR with <code>summary-address</code>.</li>
<li>A summary is advertised only while at least one component exists; a Null0 discard route prevents loops.</li>
<li><code>not-advertise</code> turns either command into a filter; <code>cost</code> pins the range metric.</li>
<li>Summaries hide flaps from other areas; oversized summaries black-hole traffic.</li>
</ul></div>
`,hi:`
<p>Courier company apne Delhi hub ko Pune ke har ghar ke baare mein nahi batati. Woh kehti hai "411 se shuru hone wala koi bhi PIN code Pune hub jaata hai". Ek line hazaaron ki jagah le leti hai, aur jab Pune mein nayi gali banti hai to Delhi hub ko kabhi pata karne ki zaroorat nahi. Yahi route summarisation hai. OSPF mein yeh sirf do jagah ho sakta hai: internal routes ke liye <b>ABR</b> par (<code>area range</code>) aur external routes ke liye <b>ASBR</b> par (<code>summary-address</code>).</p>

<h3>Summarise kyun karein</h3>
<ul>
<li>Har doosre area mein <b>chhote LSDBs aur routing tables</b>: kai ki jagah ek type 3.</li>
<li><b>Stability</b>: summarised range ke andar flap karta /24 summary ko nahi badalta, isliye doosre areas mein koi LSA flood nahi hota aur wahan koi route nahi badalta.</li>
<li>Backbone mein <b>tez convergence aur kam CPU</b>.</li>
</ul>
<p>Keemat hai kam precise routing: doosre areas poore block ke liye ek path dekhte hain, chahe koi component sirf doosre ABR se pahunch mein ho.</p>

<h3>area range se inter-area summarisation</h3>
<p>ABR par OSPF process ke andar configure hota hai, us area ka naam lekar jahan component networks <b>rehte hain</b>:</p>
<pre class="code">ABR1(config)# router ospf 1
ABR1(config-router)# area 10 range 172.16.0.0 255.255.252.0
<span class="c">! optional keywords:</span>
<span class="c">!   not-advertise  summary aur components dono ko suppress (ek filter)</span>
<span class="c">!   cost 20        summary ko fixed metric ke saath advertise</span></pre>
<p>ABR area 0 mein chaar /24 type 3 LSAs bhejna band karta hai aur 172.16.0.0/22 ka ek type 3 bhejta hai. Summary tabhi advertise hota hai jab area 10 mein kam se kam ek component network maujood ho. Agar saare components gayab ho jaayein, summary withdraw ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ABR1 par area range">
<rect x="20" y="30" width="200" height="160" rx="12" fill="#bbf7d0"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 10</text>
<text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="12">172.16.0.0/24</text>
<text x="120" y="102" text-anchor="middle" class="svg-muted" font-size="12">172.16.1.0/24</text>
<text x="120" y="122" text-anchor="middle" class="svg-muted" font-size="12">172.16.2.0/24</text>
<text x="120" y="142" text-anchor="middle" class="svg-muted" font-size="12">172.16.3.0/24</text>
<rect x="250" y="90" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="305" y="110" text-anchor="middle" class="svg-ink" font-size="13">ABR1</text><text x="305" y="126" text-anchor="middle" class="svg-muted" font-size="12">area 10 range</text>
<rect x="400" y="30" width="220" height="160" rx="12" fill="#bae6fd"/><text x="510" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0 aur aage</text>
<text x="510" y="110" text-anchor="middle" class="svg-accent" font-size="13">ek T3: 172.16.0.0/22</text>
<line x1="220" y1="112" x2="250" y2="112" stroke="#64748b" stroke-width="2"/><line x1="360" y1="112" x2="400" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="305" y="170" text-anchor="middle" class="svg-muted" font-size="12">ABR1 par Null0 discard route</text>
</svg><p class="cap">Chaar type 3 LSAs ek ban jaate hain. 172.16.2.0/24 ka flap ab area 10 ke bahar invisible hai.</p></div>

<h3>Verification</h3>
<pre class="out">ABR1# show ip ospf | begin Area 10
    Area 10
        Number of interfaces in this area is 1
        Area has no authentication
        SPF algorithm last executed 00:03:12.408 ago
        SPF algorithm executed 5 times
        <span class="hl">Area ranges are
           172.16.0.0/22 Active(2) Advertise</span>

ABR1# show ip route ospf | include 172.16
      172.16.0.0/16 is variably subnetted, 5 subnets, 2 masks
O        172.16.0.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
O        172.16.1.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
O        172.16.2.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
O        172.16.3.0/24 [110/2] via 10.10.12.1, 00:12:40, GigabitEthernet0/0
<span class="hl">O        172.16.0.0/22 is a summary, 00:00:41, Null0</span>

CORE# show ip route ospf | include 172.16
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">O IA     172.16.0.0/22 [110/3] via 10.0.23.1, 00:00:39, GigabitEthernet0/0</span></pre>
<p><b>Active(2)</b> ka matlab range active hai aur uska metric 2 hai. <b>Null0 discard route</b> ABR par apne aap install hota hai. Agar 172.16.3.77 ke liye packet aata hai lekin 172.16.3.0/24 gayab ho chuka hai, to specific route nahi hai, packet /22 se Null0 par match hota hai aur drop ho jaata hai, default route follow karke backbone mein wapas jaane aur loop banane ki jagah. Summary ka metric uske component routes ke metrics se nikalta hai; ise deterministic banane ke liye aap <code>cost</code> keyword se pin kar sakte ho.</p>

<h3>summary-address se external summarisation</h3>
<p>Type 5 (aur type 7) LSAs ASBR banata hai, isliye sirf ASBR unhe summarise kar sakta hai. ABR ka <code>area range</code> external routes ko nahi chhoota.</p>
<pre class="code">R5(config)# ip route 10.50.0.0 255.255.255.0 Null0
R5(config)# ip route 10.50.1.0 255.255.255.0 Null0
R5(config)# router ospf 1
R5(config-router)# redistribute static subnets
R5(config-router)# summary-address 10.50.0.0 255.255.254.0</pre>
<p>R5 ASBR ban jaata hai aur do /24s ki jagah 10.50.0.0/23 ka ek type 5 LSA banata hai. Doosre routers <code>O E2 10.50.0.0/23 [110/20]</code> dekhte hain. R5 external summary ke liye apna Null0 discard route bhi install karta hai. <code>show ip ospf summary-address</code> configured external summaries list karta hai. <code>summary-address ... not-advertise</code> unhe suppress karta hai, jo filter ki tarah kaam karta hai.</p>

<div class="eg"><p><b>Worked example: range chunna.</b> Pune ke paas 172.16.0.0/24 se 172.16.3.0/24 hain. Teesra octet binary mein likho: 0 = 000000<b>00</b>, 1 = 000000<b>01</b>, 2 = 000000<b>10</b>, 3 = 000000<b>11</b>. Teesre octet ke pehle 6 bits common hain, isliye prefix length 16 + 6 = 22: <code>172.16.0.0/22</code>, mask 255.255.252.0. Agar Pune baad mein 172.16.4.0/24 jodta hai, to woh /22 ke bahar hai; aap ya to doosri range jodoge ya block ko /21 (172.16.0.0 se 172.16.7.255) ke roop mein re-plan karoge.</p></div>

<div class="warn"><p><b>Common galti.</b> ABR1 par <code>area 0 range 172.16.0.0 255.255.252.0</code> configure karna kyunki "summary area 0 mein jaata hai". Command mein area woh hai jahan <b>components rehte hain</b> (area 10), woh nahi jahan summary bheja jaata hai. Galat area se command koi kaam ka nahi rehta.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>area range</code> = ABR, inter-area (type 3). <code>summary-address</code> = ASBR, external (type 5/7). Aur OSPF summarisation area ke andar kabhi possible nahi, kyunki area ke saare routers ka LSDB same hona chahiye.</p></div>

<div class="scn"><h4>Summary jo ek data centre nigal gaya</h4><p>Area 5 ke ABR par "cheezein saaf rakhne" ke liye <code>area 5 range 10.0.0.0 255.0.0.0</code> configure kiya gaya. Area 7 ka naya data centre bhi 10.200.0.0/16 use karta tha. Area 0 se 10.200.x.x ka traffic zyada tar kaam karta, lekin kabhi kabhi area 5 ABR par chala jaata, jo use apne Null0 discard route par bhej deta. Engineer ne backbone routers par overlapping prefixes ki do O IA entries dekhi: area 7 se /16 (zyada specific, isliye normally preferred) aur area 5 se /8. Area 7 ke flap ke dauraan /16 gayab hua aur /8 traffic ko black hole mein kheench laaya. Fix tha area 5 ke liye sahi size ki range.</p><p><b>Seekh:</b> sirf woh address space summarise karo jo sach mein us ABR ke peeche hai; bade summaries traffic kheench lete hain.</p></div>

<div class="iv"><p class="q">"OSPF mein kahan summarise kar sakte ho, aur commands kya hain?"</p><p>Strong answer: sirf ABRs aur ASBRs par. ABR par <code>area X range</code> area X ke networks ke type 3 LSAs summarise karta hai; ASBR par <code>summary-address</code> type 5 ya type 7 external routes summarise karta hai. Automatic Null0 discard route, yeh ki range tabhi advertise hoti hai jab koi component maujood ho, aur <code>not-advertise</code> aur <code>cost</code> options ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ABR par <code>area &lt;jahan components rehte hain&gt; range</code> se summarise karo.</li>
<li>Externals ko ASBR par <code>summary-address</code> se summarise karo.</li>
<li>Summary tabhi advertise hota hai jab kam se kam ek component ho; Null0 discard route loops rokta hai.</li>
<li><code>not-advertise</code> dono commands ko filter bana deta hai; <code>cost</code> range ka metric pin karta hai.</li>
<li>Summaries doosre areas se flaps chhupate hain; bade summaries traffic black-hole karte hain.</li>
</ul></div>
`}};export{e as default};