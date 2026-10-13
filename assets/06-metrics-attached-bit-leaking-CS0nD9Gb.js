var e={id:`metrics-attached-bit-leaking`,h:{en:`Metrics, route preference, the attached bit and route leaking`,hi:`Metrics, route preference, attached bit aur route leaking`},body:{en:`
<p>A route is chosen in two steps. First, inside IS-IS, the lowest total <b>metric</b> wins. Second, if several protocols know the same prefix, the lowest <b>preference</b> decides which protocol is used. A third question is specific to IS-IS: how much of the other level's map does a router see? A level 1 router sees only its own area, but it still has to reach other areas. This chapter answers all three.</p>

<h3>Metrics</h3>
<ul>
<li>Every IS-IS interface gets a default metric of <b>10</b> on Junos, whatever its speed. Loopbacks have metric 0. The path cost is the sum of the link metrics plus the prefix metric.</li>
<li>Set a metric per interface and per level: <code>set protocols isis interface ge-0/0/1.0 level 2 metric 40</code>.</li>
<li>Or let Junos calculate it from bandwidth: <code>set protocols isis reference-bandwidth 100g</code>. A 1 Gbps link then costs 100.</li>
<li><b>Narrow metrics</b> (TLVs 2, 128, 130) are limited to 6 bits per link (63) and 1023 per path. <b>Wide metrics</b> (TLVs 22, 135) use 24 or 32 bits. Junos enables both by default, as <code>show isis overview</code> shows: <code>Wide metrics are enabled, Narrow metrics are enabled</code>. <code>level 2 wide-metrics-only</code> stops sending narrow ones. Never mix routers that understand only narrow metrics into a wide-only design.</li>
</ul>
<p>Here is the effect of a metric of 40 on the R2-R3 link at level 2 and of a 100 Gbps reference bandwidth in the Pune lab. The L1/L2 Metric column shows the metric per level (level 1 first, level 2 second):</p>
<pre class="code">set protocols isis interface ge-0/0/1.0 level 2 metric 40
set protocols isis reference-bandwidth 100g</pre>
<pre class="out">lab@R2&gt; show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 Point to Point    Point to Point         100/100
ge-0/0/1.0            3   0x2 Point to Point    Point to Point          <span class="hl">100/40</span>
lo0.0                 0   0x7 Passive           Passive                    0/0
lab@R2&gt; show route protocol isis
10.30.255.3/32     *[IS-IS/18] 00:03:07, metric 40
172.30.3.0/24      *[IS-IS/18] 00:03:07, metric 50</pre>
<p>The explicit level 2 metric (40) overrides the reference-bandwidth value (100) for level 2 only. The prefix 172.30.3.0/24 costs 50 because the link costs 40 and the passive LAN interface on R3 adds 10.</p>

<h3>Route preference</h3>
<table class="cmp"><tr><th>Route</th><th>Junos preference</th></tr>
<tr><td>Level 1 internal</td><td>15</td></tr>
<tr><td>Level 2 internal</td><td>18</td></tr>
<tr><td>Level 1 external (exported by policy)</td><td>160</td></tr>
<tr><td>Level 2 external</td><td>165</td></tr></table>
<p>OSPF internal routes have preference 10, which is lower and therefore better than IS-IS L1 (15). So if you run OSPF and IS-IS together in a migration, OSPF routes win until you change preferences. Static (5) and direct (0) win over both. Check the preference in the <code>[IS-IS/18]</code> part of <code>show route</code>.</p>

<h3>How a level 1 router leaves its area: the attached bit</h3>
<p>An L1/L2 router copies all its level 1 routes into level 2, so the backbone knows every area. The opposite direction is closed by default: a level 1 router only sees its own area. When an L1/L2 router has a level 2 adjacency to another area, it sets the <b>attached (ATT) bit</b> in its level 1 LSP. Every L1 router then installs a <b>default route</b> toward the nearest attached router. This is the same idea as a stub or totally stubby area in OSPF.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Attached bit and default route">
<circle cx="80" cy="80" r="28" fill="#bae6fd" stroke="#64748b"/><text x="80" y="84" text-anchor="middle" class="svg-ink" font-size="12">R1 L1</text>
<circle cx="280" cy="80" r="28" fill="#fed7aa" stroke="#64748b"/><text x="280" y="84" text-anchor="middle" class="svg-ink" font-size="12">R2 L1/2</text>
<circle cx="480" cy="80" r="28" fill="#ddd6fe" stroke="#64748b"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">R3 L2</text>
<line x1="108" y1="80" x2="252" y2="80" stroke="#64748b" stroke-width="2"/><text x="180" y="70" text-anchor="middle" class="svg-accent" font-size="12">L1 adjacency</text>
<line x1="308" y1="80" x2="452" y2="80" stroke="#64748b" stroke-width="2"/><text x="380" y="70" text-anchor="middle" class="svg-accent" font-size="12">L2 adjacency, other area</text>
<text x="180" y="125" text-anchor="middle" class="svg-muted" font-size="12">default route 0/0 [IS-IS/15]</text>
<text x="280" y="150" text-anchor="middle" class="svg-muted" font-size="12">R2 sets ATT in its L1 LSP</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Area 49.0001 on the left, area 49.0002 on the right</text>
</svg><p class="cap">ATT bit: the L1/L2 router tells L1 routers "I can reach other areas".</p></div>
<p>In the Pune lab R1 had only R2 in level 1. Before the second fault was fixed, R1 had only routes of its own area. When R2 formed the level 2 adjacency to R3 in a different area, R2's LSP gained the <b>Attached</b> attribute and R1 got a default route:</p>
<pre class="out">lab@R2&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x2   0x6235     1084 L1
R2.00-00                         0x4   0x3eef     1143 L1 L2 <span class="hl">Attached</span>
lab@R1&gt; show route protocol isis
0.0.0.0/0          *[IS-IS/15] 00:00:57, metric 10
                    &gt;  to 10.30.12.2 via ge-0/0/0.0
10.30.23.0/24      *[IS-IS/15] 00:01:56, metric 20
10.30.255.2/32     *[IS-IS/15] 00:01:56, metric 10</pre>
<p>R1 does not have a route to 172.30.3.0/24 (the server LAN). When it pings the server, it follows <code>0.0.0.0/0</code> toward R2, and R2 has a level 2 route to the LAN. This works, but a default route chooses the nearest exit, not always the best one. Options: <code>set protocols isis ignore-attached-bit</code> on an L1 router to refuse the default, and <code>set protocols isis suppress-attached-bit</code> on an L1/L2 router so it never sets the bit.</p>

<h3>Route leaking: giving level 1 more detail</h3>
<p>With several L1/L2 exits, the default chooses by metric to the nearest ATT router, which may be suboptimal. <b>Route leaking</b> exports selected level 2 routes into level 1 using a policy. In the lab, R2 leaks R3's loopback into level 1:</p>
<pre class="code">set policy-options policy-statement L2-TO-L1 term 1 from level 2
set policy-options policy-statement L2-TO-L1 term 1 from route-filter 10.30.255.3/32 exact
set policy-options policy-statement L2-TO-L1 term 1 to level 1
set policy-options policy-statement L2-TO-L1 term 1 then accept
set protocols isis export L2-TO-L1</pre>
<pre class="out">lab@R1&gt; show isis database detail
R2.00-00 Sequence: 0x5, Checksum: 0x306a, Lifetime: 1160 secs
   IP prefix: 10.30.255.2/32                   Metric:        0 Internal Up
   IP prefix: 10.30.255.3/32                   Metric:       10 Internal <span class="hl">Down</span>
lab@R1&gt; show route 10.30.255.3
10.30.255.3/32     *[IS-IS/15] 00:00:40, metric 20</pre>
<p>The prefix is marked <b>Down</b> (the up/down bit): it was leaked from level 2 into level 1, so it must never be sent back up into level 2, which prevents loops. R1 now has an exact route and no longer uses the default for this destination. Keep leaked routes to a short list, such as loopbacks of important services, not everything.</p>

<div class="eg"><p><b>Worked example.</b> In the output above R2 reaches 172.30.3.0/24 with metric 50: the R2-R3 link at level 2 costs 40, and the LAN prefix on R3 adds 10. The prefix metric is added to the path cost, so 40 + 10 = 50. The total is always the sum of link metrics along the path plus the prefix metric.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing a metric at only one level and wondering why the other level ignores it. Another is changing the reference bandwidth on some routers only, creating asymmetric paths. Narrow-only equipment with metrics above 63 is also a classic problem.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS preferences: L1 internal 15, L2 internal 18, L1 external 160, L2 external 165. The default metric is 10 for any interface speed. The ATT bit is set by an L1/L2 router in its L1 LSP when it has a L2 adjacency to another area, and L1 routers install a default toward it. Leaked routes carry the Down bit.</p></div>

<div class="scn"><h4>Two exits, one default</h4><p>A branch with two L1/L2 border routers used the default route for everything. Traffic to a payment server in the data centre area went through the nearer border router, which was the slower path. The team leaked the server's /32 from level 2 into level 1 on the better router with a policy, and the branch routers preferred the specific route.</p><p><b>Lesson:</b> the ATT default is simple, but a default is blind. Leak a few exact routes when path choice matters.</p></div>

<div class="iv"><p class="q">"How does an IS-IS level 1 router reach destinations in other areas?"</p><p>An L1/L2 router with a level 2 adjacency to another area sets the ATT bit in its level 1 LSP. L1 routers install a default route toward the nearest attached router with preference 15. If specific exits are needed, I leak level 2 routes into level 1 with an export policy; the leaked routes carry the up/down bit so they do not return to level 2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default interface metric is 10 on Junos; set per interface and level, or use reference-bandwidth.</li>
<li>Preferences: L1 15, L2 18, L1 external 160, L2 external 165.</li>
<li>L1 to L2 is automatic; L2 to L1 is closed except for the default from the ATT bit.</li>
<li>Leak specific routes with an export policy; leaked routes show the Down bit.</li>
<li>Wide metrics allow large values; narrow metrics stop at 63.</li>
</ul></div>
`,hi:`
<p>Route do steps mein chuna jaata hai. Pehle, IS-IS ke andar sabse kam total <b>metric</b> jeetta hai. Doosre, agar kai protocols ek hi prefix jaante hain, to sabse kam <b>preference</b> tay karti hai ki kaun sa protocol use ho. Teesra sawal IS-IS ka khaas hai: router doosre level ka kitna map dekhta hai? Level 1 router sirf apna area dekhta hai, par use doosre areas tak bhi pahunchna padta hai. Ye chapter teeno ka jawab deta hai.</p>

<h3>Metrics</h3>
<ul>
<li>Junos par har IS-IS interface ka default metric <b>10</b> hai, speed chahe kuch bhi ho. Loopbacks ka metric 0. Path cost link metrics plus prefix metric ka jod hai.</li>
<li>Metric per interface aur per level set karo: <code>set protocols isis interface ge-0/0/1.0 level 2 metric 40</code>.</li>
<li>Ya Junos ko bandwidth se calculate karne do: <code>set protocols isis reference-bandwidth 100g</code>. Tab 1 Gbps link ka cost 100 hota hai.</li>
<li><b>Narrow metrics</b> (TLVs 2, 128, 130) har link ke liye 6 bits (63) aur path ke liye 1023 tak limited hain. <b>Wide metrics</b> (TLVs 22, 135) 24 ya 32 bits use karte hain. Junos dono default enable rakhta hai, jaise <code>show isis overview</code> dikhata hai: <code>Wide metrics are enabled, Narrow metrics are enabled</code>. <code>level 2 wide-metrics-only</code> narrow bhejna band karta hai. Wide-only design mein sirf narrow samajhne wale routers kabhi mat milao.</li>
</ul>
<p>Pune lab mein R2-R3 link par level 2 metric 40 aur 100 Gbps reference bandwidth ka asar yeh hai. L1/L2 Metric column per level metric dikhata hai (pehle level 1, phir level 2):</p>
<pre class="code">set protocols isis interface ge-0/0/1.0 level 2 metric 40
set protocols isis reference-bandwidth 100g</pre>
<pre class="out">lab@R2&gt; show isis interface
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 Point to Point    Point to Point         100/100
ge-0/0/1.0            3   0x2 Point to Point    Point to Point          <span class="hl">100/40</span>
lo0.0                 0   0x7 Passive           Passive                    0/0
lab@R2&gt; show route protocol isis
10.30.255.3/32     *[IS-IS/18] 00:03:07, metric 40
172.30.3.0/24      *[IS-IS/18] 00:03:07, metric 50</pre>
<p>Explicit level 2 metric (40) sirf level 2 ke liye reference-bandwidth value (100) ko override karta hai. Prefix 172.30.3.0/24 ka cost 50 hai kyunki link 40 aur R3 ka passive LAN interface 10 jodta hai.</p>

<h3>Route preference</h3>
<table class="cmp"><tr><th>Route</th><th>Junos preference</th></tr>
<tr><td>Level 1 internal</td><td>15</td></tr>
<tr><td>Level 2 internal</td><td>18</td></tr>
<tr><td>Level 1 external (policy se export)</td><td>160</td></tr>
<tr><td>Level 2 external</td><td>165</td></tr></table>
<p>OSPF internal ki preference 10 hai, jo kam hai aur isliye IS-IS L1 (15) se behtar. To migration mein OSPF aur IS-IS saath chalayein to OSPF routes tab tak jeetenge jab tak aap preferences na badlo. Static (5) aur direct (0) dono se jeetate hain. <code>show route</code> ke <code>[IS-IS/18]</code> hisse mein preference check karo.</p>

<h3>Level 1 router apne area se bahar kaise jaata hai: attached bit</h3>
<p>L1/L2 router apne saare level 1 routes level 2 mein copy karta hai, isliye backbone har area jaanta hai. Ulti disha default mein band hai: level 1 router sirf apna area dekhta hai. L1/L2 router ka doosre area ke saath level 2 adjacency ho, to wo apne level 1 LSP mein <b>attached (ATT) bit</b> set karta hai. Har L1 router phir nazdeeki attached router ki taraf <b>default route</b> install karta hai. Ye OSPF ke stub ya totally stubby area jaisa idea hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Attached bit aur default route">
<circle cx="80" cy="80" r="28" fill="#bae6fd" stroke="#64748b"/><text x="80" y="84" text-anchor="middle" class="svg-ink" font-size="12">R1 L1</text>
<circle cx="280" cy="80" r="28" fill="#fed7aa" stroke="#64748b"/><text x="280" y="84" text-anchor="middle" class="svg-ink" font-size="12">R2 L1/2</text>
<circle cx="480" cy="80" r="28" fill="#ddd6fe" stroke="#64748b"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">R3 L2</text>
<line x1="108" y1="80" x2="252" y2="80" stroke="#64748b" stroke-width="2"/><text x="180" y="70" text-anchor="middle" class="svg-accent" font-size="12">L1 adjacency</text>
<line x1="308" y1="80" x2="452" y2="80" stroke="#64748b" stroke-width="2"/><text x="380" y="70" text-anchor="middle" class="svg-accent" font-size="12">L2 adjacency, doosra area</text>
<text x="180" y="125" text-anchor="middle" class="svg-muted" font-size="12">default route 0/0 [IS-IS/15]</text>
<text x="280" y="150" text-anchor="middle" class="svg-muted" font-size="12">R2 apne L1 LSP mein ATT set karta hai</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Baayein Area 49.0001, daayein area 49.0002</text>
</svg><p class="cap">ATT bit: L1/L2 router L1 routers ko batata hai "main doosre areas tak pahunch sakta hoon".</p></div>
<p>Pune lab mein R1 ke paas level 1 mein sirf R2 tha. Doosra fault theek hone se pehle R1 ke paas sirf apne area ke routes the. R2 ne doosre area ke R3 ke saath level 2 adjacency banayi to R2 ke LSP ko <b>Attached</b> attribute mila aur R1 ko default route mila:</p>
<pre class="out">lab@R2&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x2   0x6235     1084 L1
R2.00-00                         0x4   0x3eef     1143 L1 L2 <span class="hl">Attached</span>
lab@R1&gt; show route protocol isis
0.0.0.0/0          *[IS-IS/15] 00:00:57, metric 10
                    &gt;  to 10.30.12.2 via ge-0/0/0.0
10.30.23.0/24      *[IS-IS/15] 00:01:56, metric 20
10.30.255.2/32     *[IS-IS/15] 00:01:56, metric 10</pre>
<p>R1 ke paas 172.30.3.0/24 (server LAN) ka route nahi hai. Server ko ping karne par wo <code>0.0.0.0/0</code> ko R2 ki taraf follow karta hai, aur R2 ke paas LAN ka level 2 route hai. Ye chalta hai, par default nazdeeki exit chunta hai, hamesha behtar nahi. Options: L1 router par <code>set protocols isis ignore-attached-bit</code> default mana karne ke liye, aur L1/L2 router par <code>set protocols isis suppress-attached-bit</code> taaki wo bit kabhi set na kare.</p>

<h3>Route leaking: level 1 ko zyada detail dena</h3>
<p>Kai L1/L2 exits hon to default nazdeeki ATT router tak ke metric se chunta hai, jo suboptimal ho sakta hai. <b>Route leaking</b> policy se chune hue level 2 routes ko level 1 mein export karti hai. Lab mein R2 R3 ke loopback ko level 1 mein leak karta hai:</p>
<pre class="code">set policy-options policy-statement L2-TO-L1 term 1 from level 2
set policy-options policy-statement L2-TO-L1 term 1 from route-filter 10.30.255.3/32 exact
set policy-options policy-statement L2-TO-L1 term 1 to level 1
set policy-options policy-statement L2-TO-L1 term 1 then accept
set protocols isis export L2-TO-L1</pre>
<pre class="out">lab@R1&gt; show isis database detail
R2.00-00 Sequence: 0x5, Checksum: 0x306a, Lifetime: 1160 secs
   IP prefix: 10.30.255.2/32                   Metric:        0 Internal Up
   IP prefix: 10.30.255.3/32                   Metric:       10 Internal <span class="hl">Down</span>
lab@R1&gt; show route 10.30.255.3
10.30.255.3/32     *[IS-IS/15] 00:00:40, metric 20</pre>
<p>Prefix par <b>Down</b> mark hai (up/down bit): wo level 2 se level 1 mein leak hua, isliye use kabhi wapas level 2 mein nahi bhejna chahiye, jisse loops nahi bante. R1 ke paas ab exact route hai aur is destination ke liye wo default use nahi karta. Leaked routes ki list chhoti rakho, jaise zaroori services ke loopbacks, sab kuch nahi.</p>

<div class="eg"><p><b>Worked example.</b> Upar ke output mein R2 172.30.3.0/24 tak metric 50 se pahunchta hai: R2-R3 link level 2 par 40 hai, aur R3 ka LAN prefix 10 jodta hai. Prefix metric path cost mein judta hai, isliye 40 + 10 = 50. Total hamesha path ke link metrics ka jod plus prefix metric hota hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Metric sirf ek level par badalna aur sochna ki doosra level use ignore kyun karta hai. Ek aur: reference bandwidth sirf kuch routers par badalna, jisse asymmetric paths bante hain. 63 se upar metrics wala narrow-only equipment bhi classic problem hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS preferences: L1 internal 15, L2 internal 18, L1 external 160, L2 external 165. Default metric kisi bhi interface speed ke liye 10 hai. ATT bit L1/L2 router apne L1 LSP mein set karta hai jab uska doosre area ke saath L2 adjacency ho, aur L1 routers uski taraf default install karte hain. Leaked routes par Down bit hota hai.</p></div>

<div class="scn"><h4>Do exits, ek default</h4><p>Do L1/L2 border routers wale branch ne har cheez ke liye default route use kiya. Data centre area ke payment server ka traffic nazdeeki border router se gaya, jo slow path tha. Team ne behtar router par policy se server ka /32 level 2 se level 1 mein leak kiya, aur branch routers ne specific route ko prefer kiya.</p><p><b>Lesson:</b> ATT default simple hai, par default andha hota hai. Path choice mayne rakhe to kuch exact routes leak karo.</p></div>

<div class="iv"><p class="q">"IS-IS level 1 router doosre areas ki destinations tak kaise pahunchta hai?"</p><p>Doosre area ke saath level 2 adjacency wala L1/L2 router apne level 1 LSP mein ATT bit set karta hai. L1 routers nazdeeki attached router ki taraf preference 15 ke saath default route install karte hain. Specific exits chahiye to main export policy se level 2 routes ko level 1 mein leak karta hoon; leaked routes up/down bit carry karte hain taaki wo level 2 mein wapas na jaayein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos par default interface metric 10; per interface aur level set karo, ya reference-bandwidth use karo.</li>
<li>Preferences: L1 15, L2 18, L1 external 160, L2 external 165.</li>
<li>L1 se L2 automatic; L2 se L1 band, sirf ATT bit ke default ko chhodkar.</li>
<li>Specific routes ko export policy se leak karo; leaked routes par Down bit dikhta hai.</li>
<li>Wide metrics bade values dete hain; narrow metrics 63 par rukte hain.</li>
</ul></div>
`}};export{e as default};