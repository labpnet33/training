var e={id:`metrics-lb`,h:{en:`Wide metrics, load balancing and offset-lists`,hi:`Wide metrics, load balancing aur offset-lists`},body:{en:`
<p>A delivery company with two roads to a city can send all vans on the fast highway, split them evenly when both roads are equally good, or send some vans on the slower road too, as long as the slower road is "not too much worse" and guaranteed not to loop back. EIGRP's knobs for this are <b>maximum-paths</b>, <b>variance</b> and <b>traffic-share</b>, and the ruler it measures with is the <b>metric</b>. When tickets say "the backup link carries nothing" or "traffic prefers the wrong link", the cause is almost always one of those knobs, a metric you did not expect, or a path that is not a feasible successor.</p>

<h3>Wide metrics: what to check when troubleshooting</h3>
<p>You met wide metrics in ENCOR. For troubleshooting, remember these points:</p>
<ul>
<li>Named mode uses 64-bit metrics with delay in picoseconds, so 10G, 40G and 100G links finally get different metrics.</li>
<li>The routing table holds only 32 bits, so the wide metric is divided by the <b>RIB scale</b> (<code>metric rib-scale</code>, default 128). HUB's summary: 1392640 / 128 = 10880 in <code>show ip route</code>.</li>
<li>If a scaled metric still exceeds the 32-bit maximum, the route cannot be installed; raising <code>metric rib-scale</code> fixes it. You see this on very long, slow paths.</li>
<li>K values in named mode have a sixth weight: <code>metric weights 0 1 0 1 0 0 0</code>. K6 (extended attributes) is 0 by default.</li>
</ul>
<pre class="out">SP1#show ip protocols | section EIGRP-IPv4
  EIGRP-IPv4 VR(NK-WAN) Address-Family Protocol for AS(10)
    <span class="hl">Metric weight K1=1, K2=0, K3=1, K4=0, K5=0 K6=0</span>
    Metric rib-scale 128
    <span class="hl">Metric version 64bit</span>
    Router-ID: 2.2.2.2
    Stub, connected, summary
    Topology : 0 (base)
      Active Timer: 3 min
      Distance: internal 90 external 170
      Maximum path: 4
      Maximum hopcount 100
      Maximum metric variance 1</pre>

<h3>Equal-cost load balancing</h3>
<p>Paths with <b>exactly</b> the same metric are installed together, up to <code>maximum-paths</code> (default 4, set under <code>topology base</code> or under <code>router eigrp</code> in classic). "Exactly" is the trap: a single extra 10 microseconds of delay on one path makes the metrics unequal and only one is installed.</p>

<h3>Unequal-cost load balancing with variance</h3>
<p>With <code>variance N</code>, a path is also installed if <b>(1)</b> it is a <b>feasible successor</b> and <b>(2)</b> its metric is less than N times the FD. Traffic is shared in inverse proportion to the metrics (<code>traffic-share balanced</code>, the default). <code>traffic-share min across-interfaces</code> installs the extra paths but sends traffic only on the best, which gives instant failover without sharing.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Variance decision">
<rect x="20" y="20" width="600" height="44" rx="8" fill="#bbf7d0"/><text x="40" y="47" class="svg-ink" font-size="13">via R2: 3072 / RD 2816, successor (FD 3072)</text><text x="600" y="47" text-anchor="end" class="svg-ink" font-size="13">installed</text>
<rect x="20" y="80" width="600" height="44" rx="8" fill="#fde68a"/><text x="40" y="107" class="svg-ink" font-size="13">via R3: 26112 / RD 2816, FS; 26112 &lt; 9 x 3072 = 27648</text><text x="600" y="107" text-anchor="end" class="svg-ink" font-size="13">installed with variance 9</text>
<rect x="20" y="140" width="600" height="44" rx="8" fill="#fed7aa"/><text x="40" y="167" class="svg-ink" font-size="13">via R4: 256768 / RD 3072, not an FS</text><text x="600" y="167" text-anchor="end" class="svg-ink" font-size="13">never, any variance</text>
</svg><p class="cap">Using the R1 topology from chapter 6: variance can only add feasible successors.</p></div>

<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  topology base
   variance 9
   maximum-paths 4
<span class="c">! classic: router eigrp 10 → variance 9</span></pre>
<pre class="out">R1#show ip route 192.168.4.0
Routing entry for 192.168.4.0/24
  Known via "eigrp 10", distance 90, metric 3072, type internal
  Routing Descriptor Blocks:
  * 10.0.12.2, from 10.0.12.2, 00:02:10 ago, via GigabitEthernet0/0
      Route metric is 3072, traffic share count is 17
<span class="hl">    10.0.13.3, from 10.0.13.3, 00:02:10 ago, via GigabitEthernet0/1</span>
      Route metric is 26112, traffic share count is 2</pre>

<div class="eg"><p><b>Worked example: which variance?</b> FD = 3072. R3's metric is 26112. 26112 / 3072 = 8.5, so variance must be at least <b>9</b> (the path must be strictly less than variance x FD: 8 x 3072 = 24576 is too small). R4 (256768) would need variance 84, but it is not a feasible successor (RD 3072 is not less than 3072), so no variance will ever install it. To use R4, lower its RD, for example by reducing delay on R4's path, until it passes the FC.</p></div>

<h3>Offset-lists: nudging a metric</h3>
<p>An <b>offset-list</b> adds a value to the metric of routes matched by an ACL, received (<code>in</code>) or sent (<code>out</code>) on an interface. It is a quick way to make one path less preferred without touching interface delay.</p>
<pre class="code">access-list 10 permit 192.168.4.0 0.0.0.255
router eigrp 10
 offset-list 10 in 2560 GigabitEthernet0/0     <span class="c">! make R2's path worse</span>
<span class="c">! named mode: the same command under topology base</span></pre>
<p>Now R2's path is 3072 + 2560 = 5632. It is still the successor here (5632 is less than 26112), but a larger offset could flip the choice. An <code>out</code> offset changes what the neighbour receives, which means it changes that neighbour's reported distance, and so its feasibility decisions too.</p>

<div class="warn"><p><b>Common mistakes.</b> Expecting variance to use a path that is not a feasible successor; forgetting that equal-cost needs identical metrics; tuning bandwidth instead of delay (bandwidth also changes EIGRP pacing and QoS calculations); an offset-list with the wrong ACL or interface that silently matches nothing; <code>maximum-paths 1</code> left from an old change.</p></div>

<div class="exam"><p><b>Exam trap.</b> Variance 1 (the default) means equal-cost only. A path is used with variance only if it is a feasible successor <b>and</b> its metric is less than variance x FD. Default maximum-paths is 4. In named mode, variance, maximum-paths, traffic-share and offset-list are under <code>topology base</code>.</p></div>

<div class="scn"><h4>The expensive link that stayed idle</h4><p>A company bought a second 100 Mbps circuit to share load with its 1 Gbps primary and set <code>variance 20</code> on the branch router. The new circuit stayed idle. <code>show ip eigrp topology all-links</code> showed the new path with an RD equal to the FD, because the far-end router reached the data centre through the same core link as the primary path. It failed the feasibility condition, so variance could not use it. The team lowered the delay on the far-end router's direct data-centre link, the RD dropped below the FD, and <code>show ip route</code> showed both paths with traffic share counts.</p><p><b>Lesson:</b> when variance does nothing, check the feasibility condition before anything else.</p></div>

<div class="iv"><p class="q">"You configured variance but traffic still uses one link. Why?"</p><p>Give the two conditions: the alternate path must be a feasible successor (RD &lt; FD) and its metric must be less than variance x FD. Then the other checks: maximum-paths not set to 1, the named-mode variance actually under topology base, CEF load-sharing per destination (a single flow uses one path), and traffic-share min across-interfaces, which installs but does not use the extra path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wide metrics are divided by the RIB scale (128) for the routing table; raise it if routes cannot be installed.</li>
<li>Equal-cost needs identical metrics; maximum-paths defaults to 4.</li>
<li>Variance adds only feasible successors whose metric is below variance x FD.</li>
<li>Offset-lists add to metrics in or out of an interface; out offsets change the neighbour's RD.</li>
<li>Prefer delay changes over bandwidth changes when steering EIGRP.</li>
</ul></div>
`,hi:`
<p>Ek delivery company ke paas sheher tak do roads hain. Woh saari vans tez highway par bhej sakti hai, dono roads barabar achhi hon to barabar baant sakti hai, ya kuch vans slow road par bhi bhej sakti hai, bashart slow road "bahut zyada kharab" na ho aur pakka loop na kare. EIGRP ke iske liye knobs hain <b>maximum-paths</b>, <b>variance</b> aur <b>traffic-share</b>, aur jis ruler se woh naapta hai woh <b>metric</b> hai. Jab tickets kehte hain "backup link kuch nahi le jaata" ya "traffic galat link prefer karta hai", to wajah lagbhag hamesha inmein se koi knob, koi unexpected metric, ya aisa path hota hai jo feasible successor nahi hai.</p>

<h3>Wide metrics: troubleshooting mein kya check karein</h3>
<p>Wide metrics aap ENCOR mein mil chuke ho. Troubleshooting ke liye yeh points yaad rakho:</p>
<ul>
<li>Named mode picoseconds mein delay ke saath 64-bit metrics use karta hai, isliye 10G, 40G aur 100G links ko aakhirkaar alag metrics milte hain.</li>
<li>Routing table sirf 32 bits rakhti hai, isliye wide metric <b>RIB scale</b> (<code>metric rib-scale</code>, default 128) se divide hota hai. HUB ka summary: <code>show ip route</code> mein 1392640 / 128 = 10880.</li>
<li>Agar scaled metric phir bhi 32-bit maximum se zyada ho, route install nahi ho sakta; <code>metric rib-scale</code> badhane se theek hota hai. Yeh bahut lambe, slow paths par dikhta hai.</li>
<li>Named mode mein K values ka chhatha weight hai: <code>metric weights 0 1 0 1 0 0 0</code>. K6 (extended attributes) default 0 hai.</li>
</ul>
<pre class="out">SP1#show ip protocols | section EIGRP-IPv4
  EIGRP-IPv4 VR(NK-WAN) Address-Family Protocol for AS(10)
    <span class="hl">Metric weight K1=1, K2=0, K3=1, K4=0, K5=0 K6=0</span>
    Metric rib-scale 128
    <span class="hl">Metric version 64bit</span>
    Router-ID: 2.2.2.2
    Stub, connected, summary
    Topology : 0 (base)
      Active Timer: 3 min
      Distance: internal 90 external 170
      Maximum path: 4
      Maximum hopcount 100
      Maximum metric variance 1</pre>

<h3>Equal-cost load balancing</h3>
<p><b>Bilkul</b> same metric wale paths ek saath install hote hain, <code>maximum-paths</code> tak (default 4, <code>topology base</code> ke neeche ya classic mein <code>router eigrp</code> ke neeche set hota hai). "Bilkul" hi trap hai: ek path par sirf 10 microseconds extra delay metrics ko unequal bana deta hai aur sirf ek install hota hai.</p>

<h3>Variance ke saath unequal-cost load balancing</h3>
<p><code>variance N</code> ke saath path tab bhi install hota hai jab <b>(1)</b> woh <b>feasible successor</b> ho aur <b>(2)</b> uska metric FD ke N guna se kam ho. Traffic metrics ke inverse proportion mein share hota hai (<code>traffic-share balanced</code>, default). <code>traffic-share min across-interfaces</code> extra paths install karta hai lekin traffic sirf best par bhejta hai, jisse bina sharing ke instant failover milta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Variance decision">
<rect x="20" y="20" width="600" height="44" rx="8" fill="#bbf7d0"/><text x="40" y="47" class="svg-ink" font-size="13">R2 se: 3072 / RD 2816, successor (FD 3072)</text><text x="600" y="47" text-anchor="end" class="svg-ink" font-size="13">install</text>
<rect x="20" y="80" width="600" height="44" rx="8" fill="#fde68a"/><text x="40" y="107" class="svg-ink" font-size="13">R3 se: 26112 / RD 2816, FS; 26112 &lt; 9 x 3072 = 27648</text><text x="600" y="107" text-anchor="end" class="svg-ink" font-size="13">variance 9 se install</text>
<rect x="20" y="140" width="600" height="44" rx="8" fill="#fed7aa"/><text x="40" y="167" class="svg-ink" font-size="13">R4 se: 256768 / RD 3072, FS nahi</text><text x="600" y="167" text-anchor="end" class="svg-ink" font-size="13">kabhi nahi, koi bhi variance</text>
</svg><p class="cap">Chapter 6 ki R1 topology: variance sirf feasible successors add kar sakta hai.</p></div>

<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  topology base
   variance 9
   maximum-paths 4
<span class="c">! classic: router eigrp 10 → variance 9</span></pre>
<pre class="out">R1#show ip route 192.168.4.0
Routing entry for 192.168.4.0/24
  Known via "eigrp 10", distance 90, metric 3072, type internal
  Routing Descriptor Blocks:
  * 10.0.12.2, from 10.0.12.2, 00:02:10 ago, via GigabitEthernet0/0
      Route metric is 3072, traffic share count is 17
<span class="hl">    10.0.13.3, from 10.0.13.3, 00:02:10 ago, via GigabitEthernet0/1</span>
      Route metric is 26112, traffic share count is 2</pre>

<div class="eg"><p><b>Worked example: kaunsa variance?</b> FD = 3072. R3 ka metric 26112 hai. 26112 / 3072 = 8.5, isliye variance kam se kam <b>9</b> hona chahiye (path variance x FD se strictly kam hona chahiye: 8 x 3072 = 24576 bahut chhota hai). R4 (256768) ko variance 84 chahiye hota, lekin woh feasible successor nahi hai (RD 3072, 3072 se kam nahi), isliye koi bhi variance use kabhi install nahi karega. R4 use karne ke liye uska RD kam karo, jaise R4 ke path par delay ghata kar, jab tak woh FC pass na kare.</p></div>

<h3>Offset-lists: metric ko thoda dhakka dena</h3>
<p><b>Offset-list</b> ACL se match hue routes ke metric mein ek value jodta hai, jo kisi interface par receive (<code>in</code>) ya send (<code>out</code>) hote hain. Interface delay chhue bina ek path ko kam preferred banane ka yeh jaldi wala tareeka hai.</p>
<pre class="code">access-list 10 permit 192.168.4.0 0.0.0.255
router eigrp 10
 offset-list 10 in 2560 GigabitEthernet0/0     <span class="c">! R2 ka path kharab karo</span>
<span class="c">! named mode: yahi command topology base ke neeche</span></pre>
<p>Ab R2 ka path 3072 + 2560 = 5632 hai. Yahan woh ab bhi successor hai (5632, 26112 se kam hai), lekin bada offset choice palat sakta hai. <code>out</code> offset badal deta hai ki neighbour ko kya milta hai, matlab us neighbour ka reported distance badalta hai, aur isliye uske feasibility decisions bhi.</p>

<div class="warn"><p><b>Common galtiyan.</b> Variance se aise path ke use hone ki umeed jo feasible successor nahi; bhool jaana ki equal-cost ko identical metrics chahiye; delay ki jagah bandwidth tune karna (bandwidth EIGRP pacing aur QoS calculations bhi badalti hai); galat ACL ya interface wali offset-list jo chupchaap kuch match nahi karti; purane change se bacha <code>maximum-paths 1</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Variance 1 (default) matlab sirf equal-cost. Variance ke saath path tabhi use hota hai jab woh feasible successor ho <b>aur</b> uska metric variance x FD se kam ho. Default maximum-paths 4 hai. Named mode mein variance, maximum-paths, traffic-share aur offset-list <code>topology base</code> ke neeche hain.</p></div>

<div class="scn"><h4>Mehenga link jo khaali pada raha</h4><p>Ek company ne apne 1 Gbps primary ke saath load share karne ke liye doosra 100 Mbps circuit khareeda aur branch router par <code>variance 20</code> set kiya. Naya circuit khaali pada raha. <code>show ip eigrp topology all-links</code> ne naye path ko FD ke barabar RD ke saath dikhaya, kyunki far-end router data centre tak primary path wale same core link se pahunchta tha. Woh feasibility condition fail kar raha tha, isliye variance use use nahi kar sakta tha. Team ne far-end router ke direct data-centre link par delay kam kiya, RD FD se neeche aaya, aur <code>show ip route</code> ne dono paths ko traffic share counts ke saath dikhaya.</p><p><b>Seekh:</b> jab variance kuch na kare, to sabse pehle feasibility condition check karo.</p></div>

<div class="iv"><p class="q">"Aapne variance configure kiya lekin traffic ab bhi ek hi link use karta hai. Kyun?"</p><p>Do conditions batao: alternate path feasible successor hona chahiye (RD &lt; FD) aur uska metric variance x FD se kam hona chahiye. Phir baaki checks: maximum-paths 1 par set na ho, named-mode variance sach mein topology base ke neeche ho, CEF load-sharing per destination hai (ek flow ek hi path use karta hai), aur traffic-share min across-interfaces, jo extra path install karta hai par use nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing table ke liye wide metrics RIB scale (128) se divide hote hain; agar routes install na ho sakein to ise badhao.</li>
<li>Equal-cost ko identical metrics chahiye; maximum-paths default 4 hai.</li>
<li>Variance sirf un feasible successors ko add karta hai jinka metric variance x FD se kam ho.</li>
<li>Offset-lists interface ke in ya out par metrics mein jodte hain; out offsets neighbour ka RD badalte hain.</li>
<li>EIGRP ko steer karte waqt bandwidth ki jagah delay badalna prefer karo.</li>
</ul></div>
`}};export{e as default};