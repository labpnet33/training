var e={id:`distribute-lists`,h:{en:`Distribute-lists: filtering routes in and out`,hi:`Distribute-lists: routes ko andar aur bahar filter karna`},body:{en:`
<p>Two ways to share travel information. In an office, news about a road closure passes from desk to desk, and anyone can decide not to pass a story on: that is <b>distance vector</b>, like EIGRP and RIP. In a city, every driver carries the same printed map book: that is <b>link state</b>, like OSPF. You can refuse to repeat a rumour, but you cannot tear a page out of everyone's map book; at most you can decide not to drive down a road yourself. That single idea explains almost everything about <b>distribute-lists</b>.</p>

<h3>What a distribute-list is</h3>
<p>A distribute-list attaches a filter (ACL, prefix list or route map) to a routing process, in one direction:</p>
<pre class="code">distribute-list {ACL | prefix NAME | route-map NAME} in  [interface]
distribute-list {ACL | prefix NAME | route-map NAME} out [interface | protocol process]
<span class="c">! EIGRP and RIP extra: match the advertising neighbour too</span>
distribute-list prefix NAME gateway GW-NAME in [interface]</pre>

<h3>In EIGRP: real control over advertisements</h3>
<p>EIGRP routers only know what neighbours tell them, so filters change what others learn.</p>
<ul>
<li><code>out [interface]</code>: the router does not advertise matching routes (on that interface or all). Downstream routers never hear them.</li>
<li><code>in [interface]</code>: the router ignores matching routes received (from that interface or all). It will not install them and will not advertise them onward.</li>
<li><code>out ospf 1</code> (a protocol name): filters <b>which routes are redistributed</b> from that source into EIGRP. It is an alternative to a route map on the redistribute command.</li>
</ul>
<pre class="code">router eigrp 100
 distribute-list prefix BRANCH-ONLY out GigabitEthernet0/1
 distribute-list prefix BLR-LANS out ospf 1
 distribute-list route-map NO-OSPF-BORN in GigabitEthernet0/0</pre>

<h3>In OSPF: only the local routing table</h3>
<p>Every router in an area must hold an identical LSDB, so OSPF cannot simply drop LSAs.</p>
<ul>
<li><code>distribute-list ... in</code> filters between the LSDB and the RIB on <b>this router only</b>. The LSA stays in the database and is still flooded to neighbours.</li>
<li><code>distribute-list ... out</code> is valid only with a protocol name on an <b>ASBR</b>, for example <code>distribute-list prefix EXPORT out eigrp 100</code>. It controls which routes become type-5 LSAs.</li>
<li>Real OSPF filtering of what other routers see is done elsewhere: <code>area X filter-list prefix NAME in|out</code> and <code>area X range ... not-advertise</code> on an ABR (type 3), and <code>summary-address ... not-advertise</code> on an ASBR (type 5). The ENARSI OSPF module covers these.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Distribute-list in EIGRP vs OSPF">
<text x="160" y="24" text-anchor="middle" class="svg-ink" font-size="14">EIGRP</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="13">E1</text>
<rect x="220" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="260" y="65" text-anchor="middle" class="svg-ink" font-size="13">BR1</text>
<line x1="100" y1="60" x2="220" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="135" y="90" width="50" height="24" rx="6" fill="#fed7aa"/><text x="160" y="107" text-anchor="middle" class="svg-ink" font-size="12">filter</text>
<text x="160" y="140" text-anchor="middle" class="svg-muted" font-size="12">update never learned</text>
<text x="480" y="24" text-anchor="middle" class="svg-ink" font-size="14">OSPF</text>
<rect x="360" y="40" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="415" y="65" text-anchor="middle" class="svg-ink" font-size="13">LSDB (full)</text>
<rect x="520" y="40" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="570" y="65" text-anchor="middle" class="svg-ink" font-size="13">RIB</text>
<line x1="470" y1="60" x2="520" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="90" width="50" height="24" rx="6" fill="#fed7aa"/><text x="495" y="107" text-anchor="middle" class="svg-ink" font-size="12">filter</text>
<line x1="415" y1="80" x2="415" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="415" y="190" text-anchor="middle" class="svg-muted" font-size="12">LSAs still flooded</text>
<text x="320" y="235" text-anchor="middle" class="svg-accent" font-size="12">EIGRP filters updates; OSPF "in" only filters its own RIB</text>
</svg><p class="cap">In EIGRP a distribute-list changes what neighbours learn; in OSPF an inbound distribute-list only hides routes from the local routing table.</p></div>

<div class="eg"><p><b>Worked example: a safer AD design with a tag filter.</b> In chapter 3 we rejected <code>distance eigrp 90 105</code> because BR1 could install OSPF-born routes (tag 110) that came back through E1. A distribute-list removes that risk: BR1 refuses any EIGRP route carrying tag 110 from E1, because it already has the original in OSPF.</p>
<pre class="code">route-map NO-OSPF-BORN deny 10
 match tag 110
route-map NO-OSPF-BORN permit 20
router eigrp 100
 distribute-list route-map NO-OSPF-BORN in GigabitEthernet0/0</pre>
<p>Now BR1 can never prefer an EIGRP copy of a Bengaluru route, whatever the AD. This "filter re-entering routes by tag" pattern is the most robust multi-point redistribution design, and chapter 11 builds on it.</p></div>

<h3>Verification</h3>
<pre class="out">BR1#show ip protocols | section eigrp
Routing Protocol is "eigrp 100"
  Outgoing update filter list for all interfaces is not set
    <span class="hl">Redistributed ospf 1 filtered by BLR-LANS</span>
  Incoming update filter list for all interfaces is not set
  Default networks flagged in outgoing updates
  Default networks accepted from incoming updates
  <span class="hl">Redistributing: ospf 1</span>
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
    Router-ID: 1.1.1.1

O1#show ip protocols | include filter
  Outgoing update filter list for all interfaces is not set
  <span class="hl">Incoming update filter list for all interfaces is (prefix-list) NO-TEST</span></pre>
<p>After adding or changing an EIGRP distribute-list, EIGRP resynchronises with neighbours (graceful restart of the affected peers on recent releases). For an OSPF inbound filter, compare <code>show ip ospf database</code> (the LSA is still there) with <code>show ip route</code> (the route is gone).</p>

<div class="warn"><p><b>Common mistake.</b> Using an OSPF inbound distribute-list on a <b>transit</b> router to hide a network. Other routers still have the LSA and still compute paths through that router, which now has no route and drops the traffic: a black hole. Filter at the ABR or ASBR where the LSA is created, not in the middle of an area.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Router X has <code>distribute-list prefix NO-TEST in</code> under OSPF; what do its neighbours see?" Answer: everything, unchanged. The LSDB is untouched. Also, an EIGRP <code>distribute-list ... out</code> naming a protocol filters redistribution, not neighbour advertisements.</p></div>

<div class="scn"><h4>Filtered on O1, dropped on O1</h4><p>The Bengaluru security team asked that users in 10.200.10.0/24 must not reach the Delhi partner network 192.168.50.0/24. An engineer added an OSPF inbound distribute-list on O1 denying 192.168.50.0/24. The route vanished from O1, so O1 dropped the traffic; mission accomplished, apparently. A week later a second Bengaluru router, O2, was added behind O1. O2 still had the O E2 route (the LSA was flooded normally), sent partner traffic to O1, and O1 dropped it with ICMP unreachables, confusing the application team. The clean fix was to deny the prefix in route map EIGRP-TO-OSPF on both boundary routers, so no LSA existed.</p><p><b>Lesson:</b> in OSPF, filter where the LSA is born; inbound distribute-lists only hide routes locally.</p></div>

<div class="iv"><p class="q">"Why does a distribute-list behave differently in OSPF than in EIGRP?"</p><p>Strong answer: EIGRP is distance vector, so a router advertises only what it chooses and <code>in</code> or <code>out</code> filters change what neighbours learn. OSPF is link state; all routers in an area need identical LSDBs, so an inbound distribute-list only filters routes from the LSDB into the local RIB while the LSA is still flooded, and <code>out</code> works only with a source protocol on an ASBR to limit redistribution. For real OSPF filtering use ABR <code>area filter-list</code> or <code>range not-advertise</code>, or filter at redistribution.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A distribute-list attaches an ACL, prefix list or route map to a routing process, in or out, optionally per interface.</li>
<li>EIGRP: in and out really change what is learned and advertised; <code>out PROTOCOL</code> filters redistribution.</li>
<li>OSPF: <code>in</code> filters only the local RIB (LSAs still flood); <code>out PROTOCOL</code> works only on an ASBR.</li>
<li>A distribute-list with a route map can filter by tag, the core of robust multi-point redistribution.</li>
<li>Verify with <code>show ip protocols</code> and, for OSPF, compare the LSDB with the RIB.</li>
</ul></div>
`,hi:`
<p>Travel ki jaankari share karne ke do tarike. Ek office mein road band hone ki khabar desk se desk jaati hai, aur koi bhi tay kar sakta hai ki kahani aage na bataye: yeh <b>distance vector</b> hai, jaise EIGRP aur RIP. Ek shehar mein har driver ke paas same printed map book hai: yeh <b>link state</b> hai, jaise OSPF. Aap afwaah dohrane se mana kar sakte ho, lekin sabki map book se panna nahi phaad sakte; zyada se zyada aap khud us sadak par na chalne ka faisla kar sakte ho. Yeh ek idea <b>distribute-lists</b> ke baare mein lagbhag sab kuch samjha deta hai.</p>

<h3>Distribute-list kya hai</h3>
<p>Distribute-list ek filter (ACL, prefix list ya route map) ko routing process se ek direction mein jodti hai:</p>
<pre class="code">distribute-list {ACL | prefix NAME | route-map NAME} in  [interface]
distribute-list {ACL | prefix NAME | route-map NAME} out [interface | protocol process]
<span class="c">! EIGRP aur RIP extra: advertise karne wale neighbour ko bhi match karo</span>
distribute-list prefix NAME gateway GW-NAME in [interface]</pre>

<h3>EIGRP mein: advertisements par asli control</h3>
<p>EIGRP routers ko sirf wahi pata hota hai jo neighbours batate hain, isliye filters badal dete hain ki doosre kya seekhte hain.</p>
<ul>
<li><code>out [interface]</code>: router matching routes advertise nahi karta (us interface par ya sab par). Downstream routers unhe kabhi nahi sunte.</li>
<li><code>in [interface]</code>: router receive kiye matching routes ignore karta hai (us interface se ya sab se). Woh unhe install nahi karega aur aage advertise nahi karega.</li>
<li><code>out ospf 1</code> (protocol name): filter karta hai ki us source se <b>kaunse routes EIGRP mein redistribute honge</b>. Yeh redistribute command par route map ka alternative hai.</li>
</ul>
<pre class="code">router eigrp 100
 distribute-list prefix BRANCH-ONLY out GigabitEthernet0/1
 distribute-list prefix BLR-LANS out ospf 1
 distribute-list route-map NO-OSPF-BORN in GigabitEthernet0/0</pre>

<h3>OSPF mein: sirf local routing table</h3>
<p>Area ke har router ka LSDB identical hona chahiye, isliye OSPF LSAs ko aise hi drop nahi kar sakta.</p>
<ul>
<li><code>distribute-list ... in</code> <b>sirf is router par</b> LSDB aur RIB ke beech filter karta hai. LSA database mein rehta hai aur neighbours ko flood hota rehta hai.</li>
<li><code>distribute-list ... out</code> sirf <b>ASBR</b> par protocol name ke saath valid hai, jaise <code>distribute-list prefix EXPORT out eigrp 100</code>. Yeh control karta hai ki kaunse routes type-5 LSAs bante hain.</li>
<li>Doosre routers kya dekhte hain, uski asli OSPF filtering kahin aur hoti hai: ABR par <code>area X filter-list prefix NAME in|out</code> aur <code>area X range ... not-advertise</code> (type 3), aur ASBR par <code>summary-address ... not-advertise</code> (type 5). ENARSI OSPF module inhe cover karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Distribute-list in EIGRP vs OSPF">
<text x="160" y="24" text-anchor="middle" class="svg-ink" font-size="14">EIGRP</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="13">E1</text>
<rect x="220" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="260" y="65" text-anchor="middle" class="svg-ink" font-size="13">BR1</text>
<line x1="100" y1="60" x2="220" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="135" y="90" width="50" height="24" rx="6" fill="#fed7aa"/><text x="160" y="107" text-anchor="middle" class="svg-ink" font-size="12">filter</text>
<text x="160" y="140" text-anchor="middle" class="svg-muted" font-size="12">update kabhi seekha nahi</text>
<text x="480" y="24" text-anchor="middle" class="svg-ink" font-size="14">OSPF</text>
<rect x="360" y="40" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="415" y="65" text-anchor="middle" class="svg-ink" font-size="13">LSDB (poora)</text>
<rect x="520" y="40" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="570" y="65" text-anchor="middle" class="svg-ink" font-size="13">RIB</text>
<line x1="470" y1="60" x2="520" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="90" width="50" height="24" rx="6" fill="#fed7aa"/><text x="495" y="107" text-anchor="middle" class="svg-ink" font-size="12">filter</text>
<line x1="415" y1="80" x2="415" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="415" y="190" text-anchor="middle" class="svg-muted" font-size="12">LSAs flood hote rehte hain</text>
<text x="320" y="235" text-anchor="middle" class="svg-accent" font-size="12">EIGRP updates filter karta hai; OSPF "in" sirf apna RIB</text>
</svg><p class="cap">EIGRP mein distribute-list badal deti hai ki neighbours kya seekhte hain; OSPF mein inbound distribute-list sirf local routing table se routes chhupati hai.</p></div>

<div class="eg"><p><b>Worked example: tag filter ke saath safer AD design.</b> Chapter 3 mein humne <code>distance eigrp 90 105</code> reject kiya tha kyunki BR1 OSPF-born routes (tag 110) install kar sakta tha jo E1 ke through wapas aaye. Ek distribute-list woh risk hata deti hai: BR1 E1 se aane wala tag 110 wala har EIGRP route mana kar deta hai, kyunki original uske paas OSPF mein pehle se hai.</p>
<pre class="code">route-map NO-OSPF-BORN deny 10
 match tag 110
route-map NO-OSPF-BORN permit 20
router eigrp 100
 distribute-list route-map NO-OSPF-BORN in GigabitEthernet0/0</pre>
<p>Ab BR1 kabhi Bengaluru route ki EIGRP copy prefer nahi kar sakta, AD kuch bhi ho. Yeh "tag se wapas aane wale routes filter karo" pattern sabse robust multi-point redistribution design hai, aur chapter 11 isi par banta hai.</p></div>

<h3>Verification</h3>
<pre class="out">BR1#show ip protocols | section eigrp
Routing Protocol is "eigrp 100"
  Outgoing update filter list for all interfaces is not set
    <span class="hl">Redistributed ospf 1 filtered by BLR-LANS</span>
  Incoming update filter list for all interfaces is not set
  Default networks flagged in outgoing updates
  Default networks accepted from incoming updates
  <span class="hl">Redistributing: ospf 1</span>
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
    Router-ID: 1.1.1.1

O1#show ip protocols | include filter
  Outgoing update filter list for all interfaces is not set
  <span class="hl">Incoming update filter list for all interfaces is (prefix-list) NO-TEST</span></pre>
<p>EIGRP distribute-list jodne ya badalne ke baad EIGRP neighbours ke saath resynchronise karta hai (recent releases par affected peers ka graceful restart). OSPF inbound filter ke liye <code>show ip ospf database</code> (LSA abhi bhi hai) ko <code>show ip route</code> (route gayab hai) se compare karo.</p>

<div class="warn"><p><b>Common galti.</b> Kisi network ko chhupane ke liye <b>transit</b> router par OSPF inbound distribute-list use karna. Doosre routers ke paas LSA ab bhi hai aur woh us router ke through paths calculate karte rehte hain, jiske paas ab route nahi hai aur woh traffic drop kar deta hai: black hole. ABR ya ASBR par filter karo jahan LSA banta hai, area ke beech mein nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Router X par OSPF ke neeche <code>distribute-list prefix NO-TEST in</code> hai; uske neighbours kya dekhte hain?" Jawab: sab kuch, bina badlaav. LSDB ko koi haath nahi lagta. Aur EIGRP <code>distribute-list ... out</code> jo protocol ka naam le, woh redistribution filter karta hai, neighbour advertisements nahi.</p></div>

<div class="scn"><h4>O1 par filter, O1 par drop</h4><p>Bengaluru security team ne kaha ki 10.200.10.0/24 ke users Delhi partner network 192.168.50.0/24 tak nahi pahunchne chahiye. Ek engineer ne O1 par 192.168.50.0/24 deny karne wali OSPF inbound distribute-list jod di. Route O1 se gayab ho gaya, to O1 traffic drop karne laga; lagta tha kaam ho gaya. Ek hafte baad O1 ke peeche ek doosra Bengaluru router O2 joda gaya. O2 ke paas O E2 route ab bhi tha (LSA normal flood hua), usne partner traffic O1 ko bheja, aur O1 ne ICMP unreachables ke saath use drop kiya, jisse application team confuse ho gayi. Saaf fix tha dono boundary routers par route map EIGRP-TO-OSPF mein prefix deny karna, taaki koi LSA bane hi nahi.</p><p><b>Seekh:</b> OSPF mein wahan filter karo jahan LSA paida hota hai; inbound distribute-lists sirf locally routes chhupati hain.</p></div>

<div class="iv"><p class="q">"Distribute-list OSPF mein EIGRP se alag behave kyun karti hai?"</p><p>Strong answer: EIGRP distance vector hai, isliye router sirf wahi advertise karta hai jo woh chune aur <code>in</code> ya <code>out</code> filters badal dete hain ki neighbours kya seekhte hain. OSPF link state hai; area ke saare routers ko identical LSDBs chahiye, isliye inbound distribute-list sirf LSDB se local RIB mein aane wale routes filter karti hai jabki LSA flood hota rehta hai, aur <code>out</code> sirf ASBR par source protocol ke saath redistribution seemit karne ke liye kaam karta hai. Asli OSPF filtering ke liye ABR par <code>area filter-list</code> ya <code>range not-advertise</code> use karo, ya redistribution par filter karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Distribute-list ek ACL, prefix list ya route map ko routing process se jodti hai, in ya out, optionally har interface par.</li>
<li>EIGRP: in aur out sach mein badalte hain ki kya seekha aur advertise hota hai; <code>out PROTOCOL</code> redistribution filter karta hai.</li>
<li>OSPF: <code>in</code> sirf local RIB filter karta hai (LSAs flood hote rehte hain); <code>out PROTOCOL</code> sirf ASBR par kaam karta hai.</li>
<li>Route map wali distribute-list tag se filter kar sakti hai, jo robust multi-point redistribution ka core hai.</li>
<li><code>show ip protocols</code> se verify karo aur OSPF ke liye LSDB ko RIB se compare karo.</li>
</ul></div>
`}};export{e as default};