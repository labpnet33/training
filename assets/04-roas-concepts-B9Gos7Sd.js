var e={id:`roas-concepts`,h:{en:`Router-on-a-stick: subinterfaces and the packet walk`,hi:`Router-on-a-stick: subinterfaces aur packet walk`},body:{en:`
<p>Go back to the office tower. Instead of a private staircase per floor, the building now has <b>one lift shaft</b>. Every passenger carries a coloured ticket that says which floor they belong to. Reception reads the colour, knows which floor desk handles that person, and sends them back down the same shaft with a new colour for the floor they want. One shaft, many floors, identified by colour. That is <b>router-on-a-stick</b> (ROAS): one physical link, many VLANs, identified by 802.1Q tags.</p>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Trunk</dt><dd>The switch port facing the router is an 802.1Q trunk, so frames for every VLAN cross the one cable, each carrying a 4-byte tag with its VLAN ID (except the native VLAN, which is untagged). You learned trunks in the VLANs module.</dd>
<dt>Subinterface</dt><dd>A logical interface carved out of a physical one, written <code>GigabitEthernet0/0.10</code>. The number after the dot is only a local name. It does not have to match the VLAN, but matching it (.10 for VLAN 10) is the universal convention.</dd>
<dt>encapsulation dot1Q</dt><dd>The command that binds a subinterface to one VLAN ID. <code>encapsulation dot1Q 10</code> means: frames arriving with tag 10 belong to this subinterface, and packets routed out of this subinterface are sent with tag 10.</dd>
<dt>Physical parent interface</dt><dd>Gi0/0 itself usually has no IP address; it only needs to be up. If the parent is shut down or unplugged, every subinterface goes down with it.</dd>
</dl>
<p>Each subinterface gets the gateway IP for its VLAN. In the lab, Gi0/0.10 holds 192.168.10.1 and Gi0/0.20 holds 192.168.20.1. To the routing table they look exactly like two separate interfaces, so R1 gets two connected routes and can route between them with no extra configuration.</p>

<h3>The packet walk, hop by hop</h3>
<p>Follow a ping from PC1 (VLAN 10, 192.168.10.10) to PC2 (VLAN 20, 192.168.20.10). PC1 has already ARPed for its gateway, as in chapter 2.</p>
<ol>
<li>PC1 sends an <b>untagged</b> frame to R1's MAC. PCs never tag; they do not know VLANs exist.</li>
<li>SW1 receives it on access port Gi0/1, which is in VLAN 10. SW1 looks up R1's MAC in VLAN 10 and finds it on the trunk Gi0/0.</li>
<li>SW1 sends the frame up the trunk <b>with tag 10</b>.</li>
<li>R1 reads tag 10 and hands the frame to <b>Gi0/0.10</b>. The IP layer sees a packet for 192.168.20.10, matches the connected route out <b>Gi0/0.20</b>, decrements TTL and ARPs for PC2 in VLAN 20 if needed.</li>
<li>R1 sends the new frame back down the same cable <b>with tag 20</b>, source MAC R1, destination MAC PC2.</li>
<li>SW1 reads tag 20, looks up PC2's MAC in VLAN 20, removes the tag and sends it out access port Gi0/2 to PC2, untagged.</li>
</ol>
<p>The reply takes the same path in reverse: up with tag 20, down with tag 10.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Router-on-a-stick packet walk with tag 10 up and tag 20 down">
<rect x="240" y="14" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">.10 = VLAN 10, .20 = VLAN 20</text>
<rect x="260" y="140" width="120" height="40" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="5"/>
<text x="300" y="98" text-anchor="end" class="svg-accent" font-size="12">3: up, tag 10</text>
<text x="340" y="98" class="svg-accent" font-size="12">5: down, tag 20</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">trunk Gi0/0</text>
<line x1="280" y1="180" x2="150" y2="225" stroke="#64748b" stroke-width="2"/><line x1="360" y1="180" x2="490" y2="225" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="225" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="150" y="244" text-anchor="middle" class="svg-ink" font-size="12">PC1 192.168.10.10</text><text x="150" y="261" text-anchor="middle" class="svg-muted" font-size="12">1: untagged</text>
<rect x="410" y="225" width="160" height="44" rx="8" fill="#fde68a"/><text x="490" y="244" text-anchor="middle" class="svg-ink" font-size="12">PC2 192.168.20.10</text><text x="490" y="261" text-anchor="middle" class="svg-muted" font-size="12">6: untagged</text>
<text x="130" y="200" text-anchor="middle" class="svg-muted" font-size="12">2: Gi0/1 access 10</text>
<text x="515" y="200" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 access 20</text>
<text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="12">4: route, TTL minus 1</text>
</svg><p class="cap">One cable, two trips: inter-VLAN traffic goes up tagged with the source VLAN and comes down tagged with the destination VLAN.</p></div>

<h3>The hairpin and what it costs</h3>
<p>Because inter-VLAN traffic goes up and back down the same link, it is called a <b>hairpin</b>. The link is full duplex, so the upward direction carries the frame once and the downward direction carries it once. The real limit is that <b>all</b> inter-VLAN traffic, plus any internet traffic from the router, shares that one link and one router CPU.</p>
<div class="eg"><p><b>Worked example.</b> A branch has a 1 Gbps link to R1. A nightly backup copies files at 600 Mbps from VLAN 10 to a NAS in VLAN 20. Upstream (SW1 to R1) carries 600 Mbps tagged 10; downstream carries 600 Mbps tagged 20. Only 400 Mbps is left in each direction for everyone else, and a small branch router may not even forward 600 Mbps in software. A Layer 3 switch would route the same backup inside its hardware without touching R1.</p></div>

<h3>The native VLAN on a router</h3>
<p>Frames in the trunk's <b>native VLAN</b> cross the cable <b>untagged</b>. The router must know which interface owns untagged frames, and it must send that VLAN's traffic untagged too. You have two options:</p>
<ul>
<li>Create a subinterface with <code>encapsulation dot1Q 99 native</code>, where 99 matches the switch's native VLAN.</li>
<li>Or put the native VLAN's IP address on the <b>physical</b> interface itself, which by default handles untagged frames.</li>
</ul>
<p>Use one method, not both. If the router and switch disagree about the native VLAN, only that VLAN breaks; the tagged VLANs keep working, which can make the fault look random.</p>
<pre class="out">R1# show interfaces GigabitEthernet0/0.20 | include Encapsulation|line protocol
GigabitEthernet0/0.20 is up, line protocol is up
<span class="hl">  Encapsulation 802.1Q Virtual LAN, Vlan ID  20.</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Believing the subinterface number sets the VLAN (it does not; only <code>encapsulation dot1Q</code> does). Leaving the parent Gi0/0 shut down while configuring perfect subinterfaces. Expecting the router to negotiate the trunk with DTP; routers do not run DTP, so the switch side must be a static trunk.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Gi0/0.30 is configured with <code>encapsulation dot1Q 3</code>. Which VLAN does it serve?" VLAN 3. The name .30 is cosmetic. Also: a subinterface with the wrong VLAN ID still shows <b>up/up</b>, because the parent link is fine.</p></div>

<div class="scn"><h4>The slow afternoon at the branch</h4><p>A sales branch complained that file transfers to its local NAS crawled every afternoon. Users and NAS were in different VLANs, routed by router-on-a-stick over a single 1 Gbps link, and the same router also carried internet traffic. Interface counters showed the trunk to R1 at 95 percent load and R1's CPU at 90 percent during backups. The fix was a small Layer 3 access switch with SVIs for the user and storage VLANs, leaving R1 only for WAN traffic.</p><p><b>Lesson:</b> ROAS is perfect for light inter-VLAN traffic; heavy east-west traffic belongs on a Layer 3 switch.</p></div>

<div class="iv"><p class="q">"How does a router-on-a-stick know which VLAN a frame belongs to?"</p><p>Strong answer: the switch port is an 802.1Q trunk, so each frame arrives with a VLAN tag, except the native VLAN which is untagged. Each router subinterface has <code>encapsulation dot1Q &lt;vlan&gt;</code>, so the tag selects the subinterface. On the way out the router adds the tag of the egress subinterface. Mention that the subinterface number is only a label, that the native VLAN is handled with the <code>native</code> keyword or the physical interface, and that inter-VLAN traffic hairpins over the link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ROAS = one 802.1Q trunk to the router and one subinterface per VLAN, each holding that VLAN's gateway IP.</li>
<li><code>encapsulation dot1Q N</code> binds a subinterface to VLAN N; the subinterface number is only a label.</li>
<li>Traffic goes up tagged with the source VLAN and down tagged with the destination VLAN: a hairpin.</li>
<li>The native VLAN is untagged; handle it with <code>encapsulation dot1Q N native</code> or on the physical interface.</li>
<li>The single link and router CPU limit performance; fine for branches, not for heavy east-west traffic.</li>
</ul></div>
`,hi:`
<p>Office tower par wapas chalo. Har floor ki private seedhi ki jagah ab building mein <b>ek lift shaft</b> hai. Har passenger ke paas ek rangeen ticket hai jo batata hai ki woh kis floor ka hai. Reception rang padhta hai, jaanta hai ki us insaan ko kaunsi floor desk handle karti hai, aur use usi shaft se wapas neeche bhejta hai, jis floor par jaana hai uske naye rang ke saath. Ek shaft, kai floors, rang se pehchaan. Yahi <b>router-on-a-stick</b> (ROAS) hai: ek physical link, kai VLANs, 802.1Q tags se pehchaan.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Trunk</dt><dd>Router ki taraf wala switch port 802.1Q trunk hai, isliye har VLAN ke frames ek hi cable cross karte hain, har ek apne VLAN ID ke saath 4-byte tag le kar (native VLAN chhod kar, jo untagged hota hai). Trunks aapne VLANs module mein seekhe.</dd>
<dt>Subinterface</dt><dd>Physical interface se kaata gaya ek logical interface, jaise <code>GigabitEthernet0/0.10</code>. Dot ke baad ka number sirf local naam hai. VLAN se match karna zaroori nahi, lekin match karna (VLAN 10 ke liye .10) sab jagah ka convention hai.</dd>
<dt>encapsulation dot1Q</dt><dd>Woh command jo subinterface ko ek VLAN ID se baandhti hai. <code>encapsulation dot1Q 10</code> ka matlab: tag 10 ke saath aane wale frames is subinterface ke hain, aur is subinterface se route hone wale packets tag 10 ke saath bheje jaate hain.</dd>
<dt>Physical parent interface</dt><dd>Gi0/0 par aam taur par koi IP address nahi hota; use sirf up hona chahiye. Agar parent shut ho ya unplugged ho, to har subinterface uske saath down ho jaata hai.</dd>
</dl>
<p>Har subinterface ko apne VLAN ka gateway IP milta hai. Lab mein Gi0/0.10 ke paas 192.168.10.1 hai aur Gi0/0.20 ke paas 192.168.20.1. Routing table ko yeh bilkul do alag interfaces jaise dikhte hain, isliye R1 ko do connected routes milte hain aur woh bina extra configuration ke unke beech route kar sakta hai.</p>

<h3>Packet walk, hop by hop</h3>
<p>PC1 (VLAN 10, 192.168.10.10) se PC2 (VLAN 20, 192.168.20.10) tak ek ping follow karo. PC1 chapter 2 ki tarah pehle hi apne gateway ke liye ARP kar chuka hai.</p>
<ol>
<li>PC1 R1 ke MAC par <b>untagged</b> frame bhejta hai. PCs kabhi tag nahi karte; unhe pata hi nahi ki VLANs exist karte hain.</li>
<li>SW1 use access port Gi0/1 par receive karta hai, jo VLAN 10 mein hai. SW1 VLAN 10 mein R1 ka MAC dhoondhta hai aur use trunk Gi0/0 par paata hai.</li>
<li>SW1 frame ko trunk par <b>tag 10 ke saath</b> upar bhejta hai.</li>
<li>R1 tag 10 padhta hai aur frame <b>Gi0/0.10</b> ko deta hai. IP layer ko 192.168.20.10 ka packet dikhta hai, <b>Gi0/0.20</b> se bahar wala connected route match hota hai, TTL kam hota hai aur zaroorat ho to VLAN 20 mein PC2 ke liye ARP hota hai.</li>
<li>R1 naya frame usi cable se <b>tag 20 ke saath</b> wapas neeche bhejta hai, source MAC R1, destination MAC PC2.</li>
<li>SW1 tag 20 padhta hai, VLAN 20 mein PC2 ka MAC dhoondhta hai, tag hatata hai aur access port Gi0/2 se PC2 ko untagged bhejta hai.</li>
</ol>
<p>Reply ulta same path leta hai: tag 20 ke saath upar, tag 10 ke saath neeche.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Router-on-a-stick packet walk, upar tag 10 aur neeche tag 20">
<rect x="240" y="14" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">.10 = VLAN 10, .20 = VLAN 20</text>
<rect x="260" y="140" width="120" height="40" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="5"/>
<text x="300" y="98" text-anchor="end" class="svg-accent" font-size="12">3: upar, tag 10</text>
<text x="340" y="98" class="svg-accent" font-size="12">5: neeche, tag 20</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">trunk Gi0/0</text>
<line x1="280" y1="180" x2="150" y2="225" stroke="#64748b" stroke-width="2"/><line x1="360" y1="180" x2="490" y2="225" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="225" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="150" y="244" text-anchor="middle" class="svg-ink" font-size="12">PC1 192.168.10.10</text><text x="150" y="261" text-anchor="middle" class="svg-muted" font-size="12">1: untagged</text>
<rect x="410" y="225" width="160" height="44" rx="8" fill="#fde68a"/><text x="490" y="244" text-anchor="middle" class="svg-ink" font-size="12">PC2 192.168.20.10</text><text x="490" y="261" text-anchor="middle" class="svg-muted" font-size="12">6: untagged</text>
<text x="130" y="200" text-anchor="middle" class="svg-muted" font-size="12">2: Gi0/1 access 10</text>
<text x="515" y="200" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 access 20</text>
<text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="12">4: route, TTL minus 1</text>
</svg><p class="cap">Ek cable, do chakkar: inter-VLAN traffic source VLAN ke tag ke saath upar jaata hai aur destination VLAN ke tag ke saath neeche aata hai.</p></div>

<h3>Hairpin aur uski keemat</h3>
<p>Kyunki inter-VLAN traffic same link par upar jaata hai aur wapas neeche aata hai, ise <b>hairpin</b> kehte hain. Link full duplex hai, isliye upar wali direction frame ko ek baar le jaati hai aur neeche wali direction ek baar. Asli limit yeh hai ki <b>saara</b> inter-VLAN traffic, plus router ka koi bhi internet traffic, usi ek link aur ek router CPU ko share karta hai.</p>
<div class="eg"><p><b>Worked example.</b> Ek branch ka R1 tak 1 Gbps link hai. Raat ka backup VLAN 10 se VLAN 20 ke NAS par 600 Mbps par files copy karta hai. Upstream (SW1 se R1) tag 10 ke saath 600 Mbps le jaata hai; downstream tag 20 ke saath 600 Mbps. Baaki sab ke liye har direction mein sirf 400 Mbps bachta hai, aur chhota branch router shayad software mein 600 Mbps forward bhi na kar paaye. Layer 3 switch wahi backup R1 ko chhue bina apne hardware ke andar route kar deta.</p></div>

<h3>Router par native VLAN</h3>
<p>Trunk ke <b>native VLAN</b> ke frames cable ko <b>untagged</b> cross karte hain. Router ko pata hona chahiye ki untagged frames kis interface ke hain, aur use us VLAN ka traffic bhi untagged bhejna chahiye. Aapke paas do options hain:</p>
<ul>
<li><code>encapsulation dot1Q 99 native</code> ke saath ek subinterface banao, jahan 99 switch ke native VLAN se match karta hai.</li>
<li>Ya native VLAN ka IP address <b>physical</b> interface par hi daal do, jo default mein untagged frames handle karta hai.</li>
</ul>
<p>Ek method use karo, dono nahi. Agar router aur switch native VLAN par sehmat nahi hain, to sirf woh VLAN toot-ta hai; tagged VLANs chalte rehte hain, jisse fault random lag sakta hai.</p>
<pre class="out">R1# show interfaces GigabitEthernet0/0.20 | include Encapsulation|line protocol
GigabitEthernet0/0.20 is up, line protocol is up
<span class="hl">  Encapsulation 802.1Q Virtual LAN, Vlan ID  20.</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maanna ki subinterface number VLAN set karta hai (nahi karta; sirf <code>encapsulation dot1Q</code> karta hai). Perfect subinterfaces configure karte hue parent Gi0/0 ko shut chhod dena. Router se DTP ke saath trunk negotiate karne ki ummeed rakhna; routers DTP nahi chalate, isliye switch side static trunk honi chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Gi0/0.30 par <code>encapsulation dot1Q 3</code> configured hai. Yeh kaunsa VLAN serve karta hai?" VLAN 3. Naam .30 sirf dikhawa hai. Aur: galat VLAN ID wala subinterface bhi <b>up/up</b> dikhata hai, kyunki parent link theek hai.</p></div>

<div class="scn"><h4>Branch ki slow dopahar</h4><p>Ek sales branch ne shikayat ki ki har dopahar local NAS par file transfers reng rahe the. Users aur NAS alag VLANs mein the, ek hi 1 Gbps link par router-on-a-stick se routed, aur wahi router internet traffic bhi le jaata tha. Interface counters ne backups ke dauraan R1 tak trunk ko 95 percent load par aur R1 ke CPU ko 90 percent par dikhaya. Fix tha ek chhota Layer 3 access switch jismein user aur storage VLANs ke SVIs the, aur R1 ko sirf WAN traffic ke liye chhod diya gaya.</p><p><b>Seekh:</b> halke inter-VLAN traffic ke liye ROAS perfect hai; bhaari east-west traffic Layer 3 switch par hona chahiye.</p></div>

<div class="iv"><p class="q">"Router-on-a-stick ko kaise pata chalta hai ki frame kis VLAN ka hai?"</p><p>Strong answer: switch port 802.1Q trunk hai, isliye har frame VLAN tag ke saath aata hai, native VLAN chhod kar jo untagged hota hai. Har router subinterface par <code>encapsulation dot1Q &lt;vlan&gt;</code> hai, isliye tag subinterface chunta hai. Bahar jaate waqt router egress subinterface ka tag lagata hai. Batao ki subinterface number sirf label hai, native VLAN <code>native</code> keyword ya physical interface se handle hota hai, aur inter-VLAN traffic link par hairpin karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ROAS = router tak ek 802.1Q trunk aur har VLAN ke liye ek subinterface, har ek par us VLAN ka gateway IP.</li>
<li><code>encapsulation dot1Q N</code> subinterface ko VLAN N se baandhta hai; subinterface number sirf label hai.</li>
<li>Traffic source VLAN ke tag ke saath upar aur destination VLAN ke tag ke saath neeche jaata hai: hairpin.</li>
<li>Native VLAN untagged hai; ise <code>encapsulation dot1Q N native</code> ya physical interface par handle karo.</li>
<li>Ek link aur router CPU performance ko limit karte hain; branches ke liye theek, bhaari east-west traffic ke liye nahi.</li>
</ul></div>
`}};export{e as default};