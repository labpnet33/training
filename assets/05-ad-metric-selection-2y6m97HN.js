var e={id:`ad-metric-selection`,h:{en:`Administrative distance, metric and the route selection order`,hi:`Administrative distance, metric aur route selection order`},body:{en:`
<p>You ask three people for directions to the station: a police officer, a local shopkeeper and a tourist with a phone. If they disagree, you trust the police officer first, the shopkeeper second and the tourist last. That ranking of <b>who</b> you believe is administrative distance. Once you have chosen the police officer, if she describes two roads, you pick the <b>shorter</b> one. That is the metric.</p>

<h3>Two different decisions</h3>
<p>A router makes two separate decisions, at two different times, and exam questions constantly try to blur them:</p>
<ol>
<li><b>Which routes enter the table?</b> (control plane, when routes are learned). If two sources offer the <b>same prefix with the same length</b>, the one with the lowest AD is installed. If one source offers several paths to the same prefix, the lowest metric is installed; equal metrics are installed together (ECMP).</li>
<li><b>Which route does a packet use?</b> (data plane, per packet). Longest prefix match among everything in the table, as in chapter 4.</li>
</ol>
<p>So the full selection order is: <b>longest prefix match, then administrative distance, then metric</b>. AD and metric only break ties between routes for the identical prefix/length.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Route selection order">
<rect x="20" y="30" width="180" height="70" rx="8" fill="#bae6fd"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Longest prefix</text><text x="110" y="78" text-anchor="middle" class="svg-muted" font-size="12">per packet</text>
<rect x="230" y="30" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Lowest AD</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">same prefix, other source</text>
<rect x="440" y="30" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Lowest metric</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="12">same prefix, same source</text>
<line x1="200" y1="65" x2="230" y2="65" stroke="#64748b" stroke-width="2"/><line x1="410" y1="65" x2="440" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="140" width="180" height="60" rx="8" fill="#fde68a"/><text x="530" y="165" text-anchor="middle" class="svg-ink" font-size="13">Equal metric</text><text x="530" y="184" text-anchor="middle" class="svg-muted" font-size="12">ECMP: all installed</text>
<line x1="530" y1="100" x2="530" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="220" y="175" text-anchor="middle" class="svg-muted" font-size="12">AD and metric never beat a longer prefix</text>
</svg><p class="cap">Longest match first; AD and metric only settle ties for the same prefix and length.</p></div>

<h3>The administrative distance table</h3>
<table class="cmp">
<tr><th>Route source</th><th>Default AD</th></tr>
<tr><td>Connected (and local)</td><td>0</td></tr>
<tr><td>Static</td><td>1</td></tr>
<tr><td>EIGRP summary route</td><td>5</td></tr>
<tr><td>eBGP</td><td>20</td></tr>
<tr><td>EIGRP internal</td><td>90</td></tr>
<tr><td>IGRP (legacy)</td><td>100</td></tr>
<tr><td>OSPF</td><td>110</td></tr>
<tr><td>IS-IS</td><td>115</td></tr>
<tr><td>RIP</td><td>120</td></tr>
<tr><td>EIGRP external</td><td>170</td></tr>
<tr><td>iBGP</td><td>200</td></tr>
<tr><td>DHCP-learned default route</td><td>254</td></tr>
<tr><td>Unknown / unusable (never installed)</td><td>255</td></tr>
</table>
<p>Memorise at least 0, 1, 20, 90, 110, 115, 120, 170, 200 and 255. AD is <b>local</b> to one router: it is never advertised, and you can change it (for a static route by adding a number at the end of <code>ip route</code>).</p>

<h3>Metric: the protocol's own measuring tape</h3>
<p>Each routing protocol measures path cost differently, which is why metrics from different protocols can never be compared, and why AD exists at all.</p>
<ul>
<li><b>RIP</b>: hop count, maximum 15.</li>
<li><b>OSPF</b>: cost, the sum of interface costs; by default cost = 100 Mbps reference bandwidth divided by interface bandwidth, so Fast Ethernet and anything faster all cost 1 unless you raise the reference (the OSPF module covers this).</li>
<li><b>EIGRP</b>: a composite of the slowest bandwidth and total delay along the path.</li>
<li><b>Static</b>: metric 0. Static routes have no measuring tape, so two statics to the same prefix with the same AD are simply both installed.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Router HQ learns 10.50.0.0/16 from OSPF [110/20] and from EIGRP [90/156160], and also has a static <code>ip route 10.50.8.0 255.255.255.0 10.1.1.2</code>.</p>
<ul>
<li>Table insertion for 10.50.0.0/16: OSPF and EIGRP offer the same prefix/length. AD 90 beats 110, so the EIGRP route is installed; the OSPF one stays in the OSPF database only.</li>
<li>10.50.8.0/24 is a different prefix, so the static is installed as well.</li>
<li>A packet to 10.50.8.20 matches both /16 and /24: the static /24 wins by longest match.</li>
<li>A packet to 10.50.9.1 matches only the /16: it uses the EIGRP route.</li>
</ul></div>

<h3>Equal-cost paths</h3>
<pre class="out">R1#show ip route 172.16.3.0
Routing entry for 172.16.3.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 10.12.12.2
      Route metric is 0, traffic share count is 1
    10.13.13.2
      Route metric is 0, traffic share count is 1</span></pre>
<p>Two statics for the same prefix with the same AD are both installed and CEF load-shares per flow (by default per source/destination pair). The asterisk in this output marks the path used most recently by process switching, not a "preferred" path.</p>

<div class="warn"><p><b>Common mistake.</b> Saying "static routes are preferred over OSPF". They are, but only for the <b>same prefix</b>. An OSPF /24 still beats a static /16 for addresses inside that /24.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions that ask "which route will be installed?" are AD/metric questions (same prefix). Questions that ask "which route will the packet use?" are longest-match questions. Read which one is asked before you look at the numbers. Also remember: lower AD is better, and AD 255 means the route is never used.</p></div>

<div class="scn"><h4>The migration that did nothing</h4><p>During a move from RIP to OSPF, an engineer enabled OSPF on every router and expected traffic to shift at once. On most routers it did: OSPF (AD 110) beat RIP (AD 120) and the entries changed from <code>R</code> to <code>O</code>. On one branch router nothing changed, even after RIP was removed there. <code>show ip route</code> showed the prefixes as <code>S [1/0]</code>: leftover statics from an old project, with AD 1, were beating OSPF for the same prefixes and sending traffic along an old path. Removing the stale statics let the <code>O</code> routes install.</p><p><b>Lesson:</b> when a protocol's routes do not appear, look for another source with a lower AD for the same prefix.</p></div>

<div class="iv"><p class="q">"How does a router choose a route when the same network is known from several sources?"</p><p>Strong answer: first, for forwarding, longest prefix match decides between different prefix lengths. For the same prefix and length, the lowest administrative distance wins table installation; within one protocol, the lowest metric wins; equal metrics give ECMP. Quote the key ADs (0, 1, 20, 90, 110, 120, 200) and stress that AD is local and never advertised.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: longest prefix match, then lowest AD, then lowest metric.</li>
<li>AD ranks route sources and is local to the router; metric ranks paths within one protocol.</li>
<li>Key ADs: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, iBGP 200, 255 unusable.</li>
<li>Metrics from different protocols cannot be compared.</li>
<li>Equal AD and metric for the same prefix installs multiple paths (ECMP).</li>
</ul></div>
`,hi:`
<p>Aap station ka raasta teen logon se poochte ho: ek police officer, ek local dukaandaar aur phone wala ek tourist. Agar teeno alag bolein, to aap pehle police officer par bharosa karte ho, phir dukaandaar, aur sabse aakhir mein tourist. <b>Kiski</b> baat maani jaaye, yeh ranking administrative distance hai. Police officer chun lene ke baad, agar woh do sadkein batayein, to aap <b>chhoti</b> wali lete ho. Woh metric hai.</p>

<h3>Do alag decisions</h3>
<p>Router do alag decisions, do alag samay par leta hai, aur exam questions inhe lagatar mix karne ki koshish karte hain:</p>
<ol>
<li><b>Table mein kaunse routes jaate hain?</b> (control plane, jab routes seekhe jaate hain). Agar do sources <b>same prefix same length ke saath</b> dein, to sabse kam AD wala install hota hai. Agar ek source same prefix ke kai paths de, to sabse kam metric install hota hai; barabar metrics saath mein install hote hain (ECMP).</li>
<li><b>Packet kaunsa route use karta hai?</b> (data plane, har packet par). Table ki har cheez mein longest prefix match, jaise chapter 4 mein.</li>
</ol>
<p>Isliye poora selection order hai: <b>longest prefix match, phir administrative distance, phir metric</b>. AD aur metric sirf bilkul same prefix/length wale routes ke tie todte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Route selection order">
<rect x="20" y="30" width="180" height="70" rx="8" fill="#bae6fd"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Longest prefix</text><text x="110" y="78" text-anchor="middle" class="svg-muted" font-size="12">har packet par</text>
<rect x="230" y="30" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Sabse kam AD</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">same prefix, alag source</text>
<rect x="440" y="30" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Sabse kam metric</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="12">same prefix, same source</text>
<line x1="200" y1="65" x2="230" y2="65" stroke="#64748b" stroke-width="2"/><line x1="410" y1="65" x2="440" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="140" width="180" height="60" rx="8" fill="#fde68a"/><text x="530" y="165" text-anchor="middle" class="svg-ink" font-size="13">Barabar metric</text><text x="530" y="184" text-anchor="middle" class="svg-muted" font-size="12">ECMP: sab install</text>
<line x1="530" y1="100" x2="530" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="220" y="175" text-anchor="middle" class="svg-muted" font-size="12">AD aur metric kabhi lambe prefix ko nahi harate</text>
</svg><p class="cap">Pehle longest match; AD aur metric sirf same prefix aur length ke ties settle karte hain.</p></div>

<h3>Administrative distance table</h3>
<table class="cmp">
<tr><th>Route source</th><th>Default AD</th></tr>
<tr><td>Connected (aur local)</td><td>0</td></tr>
<tr><td>Static</td><td>1</td></tr>
<tr><td>EIGRP summary route</td><td>5</td></tr>
<tr><td>eBGP</td><td>20</td></tr>
<tr><td>EIGRP internal</td><td>90</td></tr>
<tr><td>IGRP (legacy)</td><td>100</td></tr>
<tr><td>OSPF</td><td>110</td></tr>
<tr><td>IS-IS</td><td>115</td></tr>
<tr><td>RIP</td><td>120</td></tr>
<tr><td>EIGRP external</td><td>170</td></tr>
<tr><td>iBGP</td><td>200</td></tr>
<tr><td>DHCP se seekha default route</td><td>254</td></tr>
<tr><td>Unknown / unusable (kabhi install nahi)</td><td>255</td></tr>
</table>
<p>Kam se kam 0, 1, 20, 90, 110, 115, 120, 170, 200 aur 255 yaad karo. AD ek router ke liye <b>local</b> hai: yeh kabhi advertise nahi hoti, aur aap ise badal sakte ho (static route ke liye <code>ip route</code> ke end mein number jodkar).</p>

<h3>Metric: protocol ka apna measuring tape</h3>
<p>Har routing protocol path cost alag tarah naapta hai, isliye alag protocols ke metrics kabhi compare nahi ho sakte, aur isi wajah se AD exist karti hai.</p>
<ul>
<li><b>RIP</b>: hop count, maximum 15.</li>
<li><b>OSPF</b>: cost, interface costs ka sum; default mein cost = 100 Mbps reference bandwidth divided by interface bandwidth, isliye Fast Ethernet aur usse tez sab ki cost 1 hoti hai jab tak aap reference na badhao (OSPF module ise cover karta hai).</li>
<li><b>EIGRP</b>: path ki sabse slow bandwidth aur total delay ka composite.</li>
<li><b>Static</b>: metric 0. Static routes ke paas measuring tape nahi hai, isliye same prefix aur same AD wale do statics dono install ho jaate hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Router HQ 10.50.0.0/16 OSPF [110/20] se aur EIGRP [90/156160] se seekhta hai, aur uske paas static <code>ip route 10.50.8.0 255.255.255.0 10.1.1.2</code> bhi hai.</p>
<ul>
<li>10.50.0.0/16 ka table insertion: OSPF aur EIGRP same prefix/length dete hain. AD 90 110 ko harata hai, isliye EIGRP route install hota hai; OSPF wala sirf OSPF database mein rehta hai.</li>
<li>10.50.8.0/24 alag prefix hai, isliye static bhi install hota hai.</li>
<li>10.50.8.20 ka packet /16 aur /24 dono match karta hai: static /24 longest match se jeetta hai.</li>
<li>10.50.9.1 ka packet sirf /16 match karta hai: woh EIGRP route use karta hai.</li>
</ul></div>

<h3>Equal-cost paths</h3>
<pre class="out">R1#show ip route 172.16.3.0
Routing entry for 172.16.3.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 10.12.12.2
      Route metric is 0, traffic share count is 1
    10.13.13.2
      Route metric is 0, traffic share count is 1</span></pre>
<p>Same prefix aur same AD wale do statics dono install hote hain aur CEF per flow load-share karta hai (default mein har source/destination pair par). Is output mein asterisk woh path mark karta hai jo process switching ne sabse recently use kiya, koi "preferred" path nahi.</p>

<div class="warn"><p><b>Common galti.</b> Kehna "static routes OSPF se preferred hote hain". Hote hain, lekin sirf <b>same prefix</b> ke liye. OSPF /24 us /24 ke andar ke addresses ke liye static /16 ko ab bhi harata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa route install hoga?" poochne wale questions AD/metric questions hain (same prefix). "Packet kaunsa route use karega?" poochne wale longest-match questions hain. Numbers dekhne se pehle padho ki kya poocha gaya hai. Aur yaad rakho: kam AD better hai, aur AD 255 matlab route kabhi use nahi hota.</p></div>

<div class="scn"><h4>Woh migration jisne kuch nahi kiya</h4><p>RIP se OSPF par move karte waqt ek engineer ne har router par OSPF enable kiya aur traffic turant shift hone ki ummeed ki. Zyada tar routers par hua bhi: OSPF (AD 110) ne RIP (AD 120) ko haraya aur entries <code>R</code> se <code>O</code> ho gayi. Ek branch router par kuch nahi badla, wahan RIP hatane ke baad bhi. <code>show ip route</code> ne prefixes ko <code>S [1/0]</code> dikhaya: ek purane project ke bache hue statics, AD 1 ke saath, same prefixes ke liye OSPF ko hara rahe the aur traffic purane path par bhej rahe the. Stale statics hatane se <code>O</code> routes install ho gaye.</p><p><b>Seekh:</b> jab kisi protocol ke routes na dikhein, same prefix ke liye kam AD wala doosra source dhoondho.</p></div>

<div class="iv"><p class="q">"Jab same network kai sources se pata ho to router route kaise choose karta hai?"</p><p>Strong answer: pehle, forwarding ke liye, longest prefix match alag prefix lengths ke beech decide karta hai. Same prefix aur length ke liye sabse kam administrative distance table installation jeetti hai; ek protocol ke andar sabse kam metric jeetta hai; barabar metrics se ECMP milta hai. Key ADs batao (0, 1, 20, 90, 110, 120, 200) aur zor do ki AD local hai aur kabhi advertise nahi hoti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: longest prefix match, phir sabse kam AD, phir sabse kam metric.</li>
<li>AD route sources ko rank karti hai aur router ke liye local hai; metric ek protocol ke andar paths ko rank karta hai.</li>
<li>Key ADs: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, iBGP 200, 255 unusable.</li>
<li>Alag protocols ke metrics compare nahi ho sakte.</li>
<li>Same prefix ke liye barabar AD aur metric multiple paths install karte hain (ECMP).</li>
</ul></div>
`}};export{e as default};