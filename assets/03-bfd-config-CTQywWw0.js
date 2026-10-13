var e={id:`bfd-config`,h:{en:`Configuring BFD for IS-IS, OSPF, BGP and static routes`,hi:`IS-IS, OSPF, BGP aur static routes ke liye BFD configure karna`},body:{en:`
<p>Configuring BFD is always a two-part job, like switching on a smoke alarm and also wiring it to the building alarm panel. Part one defines the <b>BFD timers</b> on the interface or in a template. Part two tells each <b>client protocol</b> to use BFD. If you do only part one you get a session but nothing reacts; if you do only part two the client waits for a session that has no timers. This chapter shows IOS XE and IOS XR syntax side by side.</p>
<div class="note"><p><b>Reference configuration (not run in the simulator).</b> The simulator has no BFD lab for Cisco SP platforms yet, so the blocks below are teaching configuration with documentation addresses. To feel the same logic on a live device, use <code>jncis-ha</code>, where BFD protects a routing adjacency on Junos.</p></div>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Four steps: define timers, attach the client, bring the session up, verify."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Timers</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">interface or template</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Client</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">IS-IS, OSPF, BGP</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Session</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">Up on both ends</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Verify</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">show bfd neighbors</text></svg><p class="cap">Four steps: define timers, attach the client, bring the session up, verify.</p></div>
<h3>IOS XE: interface timers and client enablement</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
interface TenGigabitEthernet0/0/1
 ip address 198.51.100.1 255.255.255.252
 bfd interval 50 min_rx 50 multiplier 3
 isis network point-to-point
 ip router isis CORE
 isis bfd
<span class="c">!</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 metric-style wide
 bfd all-interfaces
<span class="c">!</span>
router ospf 1
 bfd all-interfaces
<span class="c">!</span>
router bgp 64512
 neighbor 192.0.2.2 remote-as 64512
 neighbor 192.0.2.2 update-source Loopback0
 neighbor 192.0.2.2 fall-over bfd multi-hop</pre>
<p>Notes for IOS XE: <code>bfd interval 50 min_rx 50 multiplier 3</code> sets min-tx, min-rx and the multiplier on a single-hop interface. <code>isis bfd</code> enables it on one interface, and <code>bfd all-interfaces</code> under <code>router isis</code> enables it on every IS-IS interface. For iBGP between loopbacks use multihop BFD: <code>fall-over bfd multi-hop</code> with a <code>bfd-map</code> or a multihop template, because the single-hop rules would drop packets whose TTL is not 255. On directly connected eBGP neighbours plain <code>fall-over bfd</code> is used. Newer releases also support <code>bfd-template single-hop NAME</code> and <code>bfd template NAME</code> on the interface, which lets you reuse one profile.</p>
<h3>IOS XR: BFD under the protocol</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
router isis CORE
 is-type level-2-only
 net 49.0001.0000.0000.0001.00
 address-family ipv4 unicast
  metric-style wide
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  point-to-point
  bfd minimum-interval 50
  bfd multiplier 3
  bfd fast-detect ipv4
  address-family ipv4 unicast
<span class="c"> !</span>
<span class="c">!</span>
router bgp 64512
 neighbor 192.0.2.2
  remote-as 64512
  update-source Loopback0
  bfd fast-detect
  bfd minimum-interval 300
  bfd multiplier 3</pre>
<p>On IOS XR the BFD timers sit <b>under the protocol interface or neighbour</b>. IS-IS uses <code>bfd fast-detect ipv4</code> (and <code>ipv6</code> for the v6 family). OSPF uses <code>bfd fast-detect</code> under the area interface. For BGP, <code>bfd fast-detect</code> under the neighbour enables BFD and the timers use <code>bfd minimum-interval</code> and <code>bfd multiplier</code>. Multihop BFD for BGP is configured with <code>bfd multihop</code> parameters under <code>bfd</code> global configuration on some releases; always check the release notes of your image.</p>
<h3>Static routes and other clients</h3>
<p>A static route will sit in the routing table even if the next hop is dead, which is dangerous for a customer handover. BFD can track the next hop. On IOS XE you define <code>ip route static bfd GigabitEthernet0/0/1 198.51.100.2</code> and then the static route with that next hop is removed when the session goes down. On IOS XR a static route uses <code>router static / address-family ipv4 unicast / 203.0.113.0/24 198.51.100.2 bfd fast-detect minimum-interval 50 multiplier 3</code>. BFD also protects MPLS-TE tunnels, LDP sessions in some designs and PIM neighbours.</p>
<table class="cmp"><tr><th>Client</th><th>IOS XE enable</th><th>IOS XR enable</th></tr><tr><td>IS-IS</td><td>isis bfd or bfd all-interfaces</td><td>bfd fast-detect ipv4 under the interface</td></tr><tr><td>OSPF</td><td>bfd all-interfaces or ip ospf bfd</td><td>bfd fast-detect under the area interface</td></tr><tr><td>BGP</td><td>neighbor x fall-over bfd</td><td>bfd fast-detect under the neighbour</td></tr><tr><td>Static</td><td>ip route static bfd</td><td>bfd fast-detect on the route</td></tr></table>
<h3>Verification you should know</h3>
<p>On IOS XE the commands are <code>show bfd neighbors</code> and <code>show bfd neighbors details</code>. You read the neighbour address, the state (Up or Down), the interface, and under details the negotiated intervals and the list of registered protocols such as ISIS or BGP. On IOS XR use <code>show bfd session</code> and <code>show bfd session detail</code>. A healthy line shows state UP and the clients that registered. We do not print sample output here because this module has no lab to capture it from; the layout is what you will see on the real device.</p>
<div class="eg"><p><b>Worked example.</b> P1 and P2 connect over a 10G wave service. You want 150 ms detection. Choose interval 50 ms and multiplier 3 (3 times 50 is 150 ms). Configure it on both TenGigE ports, enable it for IS-IS, then check that <code>show bfd neighbors details</code> lists the neighbour as Up, with ISIS as registered client. If the list shows no client, you did part one but forgot part two.</p></div>
<div class="warn"><p><b>Common mistake.</b> Enabling BFD on one router only. The session stays Down, the client sees no BFD and silently relies on slow hellos. Another classic mistake is forgetting that BGP multihop BFD needs a reachable path and matching templates on both ends.</p></div>
<div class="exam"><p><b>Exam trap.</b> On IOS XR you do not put <code>bfd interval</code> on the interface for IS-IS; you place <code>bfd minimum-interval</code>, <code>bfd multiplier</code> and <code>bfd fast-detect</code> under the protocol interface. On IOS XE the timers are an interface command and each protocol only switches BFD on.</p></div>
<div class="scn"><h4>The static route that outlived its next hop</h4><p>An enterprise handover used a static route to a customer edge across a media converter. When the customer side lost power, the converter kept the PE port up and the route stayed in the table, so traffic towards the customer was black-holed for hours. The team added BFD tracking to the static route with 300 ms by 3 timers. After the next outage the route was removed in under a second and the backup path took over.</p><p><b>Lesson:</b> a static route has no liveness check. Tie it to BFD wherever the interface cannot show real reachability.</p></div>
<div class="iv"><p class="q">"How would you enable BFD for IS-IS on a core link, and how do you verify it?"</p><p>Set the timers on the interface (IOS XE) or under the IS-IS interface (IOS XR), enable BFD for the IS-IS client with isis bfd or bfd fast-detect ipv4, do the same on the neighbour, then verify with show bfd neighbors details on XE or show bfd session detail on XR. Say that you check state Up, negotiated intervals and that IS-IS appears as a registered client.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD needs two parts: timers and a client that is told to use BFD.</li>
<li>IOS XE: bfd interval on the interface, isis bfd or bfd all-interfaces, fall-over bfd for BGP.</li>
<li>IOS XR: bfd minimum-interval, multiplier and fast-detect under the protocol interface or neighbour.</li>
<li>iBGP between loopbacks needs multihop BFD.</li>
<li>Verify with show bfd neighbors details (XE) or show bfd session detail (XR).</li>
</ul></div>
`,hi:`
<p>BFD configure karna hamesha do-part ka kaam hai, bilkul smoke alarm lagane aur use building alarm panel se jodne jaisa. Part one interface ya template par <b>BFD timers</b> define karta hai. Part two har <b>client protocol</b> ko BFD use karne ko kehta hai. Sirf part one karoge to session ban jaayega lekin koi react nahi karega; sirf part two karoge to client aise session ka intezaar karega jiske timers hi nahi hain. Is chapter mein IOS XE aur IOS XR syntax saath-saath dikhaya hai.</p>
<div class="note"><p><b>Reference configuration (simulator mein run nahi hoti).</b> Simulator mein Cisco SP platforms ke liye abhi BFD lab nahi hai, isliye neeche ke blocks documentation addresses ke saath teaching configuration hain. Same logic live device par feel karne ke liye <code>jncis-ha</code> use karo, jahan Junos par BFD routing adjacency ko protect karta hai.</p></div>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Chaar steps: timers define karo, client attach karo, session up karo, verify karo."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Timers</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">interface ya template</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Client</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">IS-IS, OSPF, BGP</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Session</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">dono ends par Up</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Verify</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">show bfd neighbors</text></svg><p class="cap">Chaar steps: timers define karo, client attach karo, session up karo, verify karo.</p></div>
<h3>IOS XE: interface timers aur client enablement</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
interface TenGigabitEthernet0/0/1
 ip address 198.51.100.1 255.255.255.252
 bfd interval 50 min_rx 50 multiplier 3
 isis network point-to-point
 ip router isis CORE
 isis bfd
<span class="c">!</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 metric-style wide
 bfd all-interfaces
<span class="c">!</span>
router ospf 1
 bfd all-interfaces
<span class="c">!</span>
router bgp 64512
 neighbor 192.0.2.2 remote-as 64512
 neighbor 192.0.2.2 update-source Loopback0
 neighbor 192.0.2.2 fall-over bfd multi-hop</pre>
<p>IOS XE ke notes: <code>bfd interval 50 min_rx 50 multiplier 3</code> single-hop interface par min-tx, min-rx aur multiplier set karta hai. <code>isis bfd</code> ek interface par enable karta hai, aur <code>router isis</code> ke neeche <code>bfd all-interfaces</code> har IS-IS interface par enable karta hai. Loopbacks ke beech iBGP ke liye multihop BFD use karo: <code>fall-over bfd multi-hop</code> ke saath <code>bfd-map</code> ya multihop template, kyunki single-hop rules un packets ko drop kar dete hain jinka TTL 255 nahi hota. Directly connected eBGP neighbours par seedha <code>fall-over bfd</code> use hota hai. Naye releases <code>bfd-template single-hop NAME</code> aur interface par <code>bfd template NAME</code> bhi support karte hain, jisse ek profile dobara use kar sakte ho.</p>
<h3>IOS XR: protocol ke neeche BFD</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
router isis CORE
 is-type level-2-only
 net 49.0001.0000.0000.0001.00
 address-family ipv4 unicast
  metric-style wide
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  point-to-point
  bfd minimum-interval 50
  bfd multiplier 3
  bfd fast-detect ipv4
  address-family ipv4 unicast
<span class="c"> !</span>
<span class="c">!</span>
router bgp 64512
 neighbor 192.0.2.2
  remote-as 64512
  update-source Loopback0
  bfd fast-detect
  bfd minimum-interval 300
  bfd multiplier 3</pre>
<p>IOS XR par BFD timers <b>protocol interface ya neighbour ke neeche</b> hote hain. IS-IS <code>bfd fast-detect ipv4</code> use karta hai (v6 family ke liye <code>ipv6</code>). OSPF area interface ke neeche <code>bfd fast-detect</code> use karta hai. BGP ke liye neighbour ke neeche <code>bfd fast-detect</code> BFD enable karta hai aur timers <code>bfd minimum-interval</code> aur <code>bfd multiplier</code> se set hote hain. BGP ke liye multihop BFD kuch releases par global <code>bfd</code> configuration mein <code>bfd multihop</code> parameters se hota hai; apne image ke release notes hamesha check karo.</p>
<h3>Static routes aur doosre clients</h3>
<p>Static route routing table mein tab bhi baitha rehta hai jab next hop dead ho, jo customer handover ke liye khatarnaak hai. BFD next hop ko track kar sakta hai. IOS XE par <code>ip route static bfd GigabitEthernet0/0/1 198.51.100.2</code> define karte ho aur session down hote hi us next hop wala static route hat jaata hai. IOS XR par static route <code>router static / address-family ipv4 unicast / 203.0.113.0/24 198.51.100.2 bfd fast-detect minimum-interval 50 multiplier 3</code> use karta hai. BFD MPLS-TE tunnels, kuch designs mein LDP sessions aur PIM neighbours ko bhi protect karta hai.</p>
<table class="cmp"><tr><th>Client</th><th>IOS XE enable</th><th>IOS XR enable</th></tr><tr><td>IS-IS</td><td>isis bfd ya bfd all-interfaces</td><td>interface ke neeche bfd fast-detect ipv4</td></tr><tr><td>OSPF</td><td>bfd all-interfaces ya ip ospf bfd</td><td>area interface ke neeche bfd fast-detect</td></tr><tr><td>BGP</td><td>neighbor x fall-over bfd</td><td>neighbour ke neeche bfd fast-detect</td></tr><tr><td>Static</td><td>ip route static bfd</td><td>route par bfd fast-detect</td></tr></table>
<h3>Verification jo aapko aani chahiye</h3>
<p>IOS XE par commands <code>show bfd neighbors</code> aur <code>show bfd neighbors details</code> hain. Aap neighbour address, state (Up ya Down), interface, aur details mein negotiated intervals aur registered protocols ki list (jaise ISIS ya BGP) padhte ho. IOS XR par <code>show bfd session</code> aur <code>show bfd session detail</code> use karo. Healthy line mein state UP aur registered clients dikhte hain. Yahan sample output nahi chhapa kyunki is module ka koi lab nahi hai jahan se capture karein; real device par layout aisa hi dikhega.</p>
<div class="eg"><p><b>Worked example.</b> P1 aur P2 10G wave service par jude hain. Aapko 150 ms detection chahiye. Interval 50 ms aur multiplier 3 chuno (3 guna 50 = 150 ms). Dono TenGigE ports par configure karo, IS-IS ke liye enable karo, phir <code>show bfd neighbors details</code> mein check karo ki neighbour Up hai aur ISIS registered client dikh raha hai. Agar client list khaali hai to aapne part one kiya lekin part two bhool gaye.</p></div>
<div class="warn"><p><b>Common mistake.</b> BFD sirf ek router par enable karna. Session Down rehta hai, client ko BFD dikhta nahi aur chupchaap slow hellos par chalta hai. Ek aur classic galti: yeh bhoolna ki BGP multihop BFD ko reachable path aur dono ends par matching templates chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS XR par IS-IS ke liye interface par <code>bfd interval</code> nahi likhte; <code>bfd minimum-interval</code>, <code>bfd multiplier</code> aur <code>bfd fast-detect</code> protocol interface ke neeche rakhte ho. IOS XE par timers interface command hain aur har protocol sirf BFD on karta hai.</p></div>
<div class="scn"><h4>Static route jo apne next hop se zyada jee gaya</h4><p>Ek enterprise handover media converter ke across customer edge tak static route use karta tha. Customer side ki power gayi to converter ne PE port up rakha aur route table mein bana raha, isliye customer ki taraf ka traffic ghanton black-hole hua. Team ne static route par 300 ms guna 3 timers ke BFD tracking add kiya. Agle outage mein route ek second se kam mein hata aur backup path ne takeover kar liya.</p><p><b>Lesson:</b> static route ka koi liveness check nahi hota. Jahan interface asli reachability nahi dikha sakta wahan use BFD se jodo.</p></div>
<div class="iv"><p class="q">"Core link par IS-IS ke liye BFD kaise enable karoge aur verify kaise karoge?"</p><p>Timers interface par (IOS XE) ya IS-IS interface ke neeche (IOS XR) set karo, IS-IS client ke liye isis bfd ya bfd fast-detect ipv4 se BFD enable karo, neighbour par bhi wahi karo, phir XE par show bfd neighbors details ya XR par show bfd session detail se verify karo. Batao ki aap state Up, negotiated intervals aur IS-IS ka registered client hona check karte ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD ke do parts: timers aur woh client jise BFD use karne ko bola gaya ho.</li>
<li>IOS XE: interface par bfd interval, isis bfd ya bfd all-interfaces, BGP ke liye fall-over bfd.</li>
<li>IOS XR: protocol interface ya neighbour ke neeche bfd minimum-interval, multiplier aur fast-detect.</li>
<li>Loopbacks ke beech iBGP ko multihop BFD chahiye.</li>
<li>Verify: show bfd neighbors details (XE) ya show bfd session detail (XR).</li>
</ul></div>
`}};export{e as default};