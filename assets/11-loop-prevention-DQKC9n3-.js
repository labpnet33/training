var e={id:`loop-prevention`,h:{en:`Loop prevention: tags, split horizon and route poisoning`,hi:`Loop prevention: tags, split horizon aur route poisoning`},body:{en:`
<p>Every culture has rules against gossip loops. You stamp a letter so it is not delivered twice. You do not repeat a story back to the person who told it to you. And when a road is really closed, you shout "closed!" loudly instead of just going quiet, so nobody keeps driving towards it. Routing has exactly these three rules: <b>tags</b>, <b>split horizon</b> and <b>route poisoning</b>. Blueprint item 1.3 asks you to troubleshoot all of them, plus filtering.</p>

<h3>Route tags: the passport stamp</h3>
<p>A <b>route tag</b> is a 32-bit number attached to a route. It does nothing by itself; it is metadata that a route map can later match. Where it lives:</p>
<ul>
<li><b>EIGRP</b> external routes carry an administrator tag in the External data (named mode can also tag internal routes).</li>
<li><b>OSPF</b> type-5 and type-7 LSAs carry an External Route Tag, and every router in the domain sees it.</li>
<li><b>RIPv2</b> has a route tag field. <b>BGP</b> has no tag field; it uses communities for the same purpose.</li>
</ul>
<p>The key property: the tag <b>survives the trip through the other protocol</b>, because each redistribution can copy or set it. That lets the second boundary router recognise a route that originally came from the domain it is about to enter.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tag journey">
<rect x="20" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">E1</text><text x="80" y="68" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.0/24</text>
<rect x="190" y="30" width="120" height="46" rx="8" fill="#fde68a"/><text x="250" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="250" y="68" text-anchor="middle" class="svg-accent" font-size="12">set tag 90</text>
<rect x="360" y="30" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="420" y="52" text-anchor="middle" class="svg-ink" font-size="13">OSPF domain</text><text x="420" y="68" text-anchor="middle" class="svg-muted" font-size="12">type 5, tag 90</text>
<rect x="500" y="30" width="120" height="46" rx="8" fill="#fde68a"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR2</text><text x="560" y="68" text-anchor="middle" class="svg-accent" font-size="12">deny tag 90</text>
<line x1="140" y1="53" x2="190" y2="53" stroke="#64748b" stroke-width="2"/><line x1="310" y1="53" x2="360" y2="53" stroke="#64748b" stroke-width="2"/><line x1="480" y1="53" x2="500" y2="53" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="140" width="120" height="46" rx="8" fill="#e2e8f0"/><text x="560" y="168" text-anchor="middle" class="svg-muted" font-size="12">not back into EIGRP</text>
<line x1="560" y1="76" x2="560" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">90 = born in EIGRP, 110 = born in OSPF (numbers chosen to echo AD)</text>
</svg><p class="cap">BR1 stamps the Delhi route with tag 90 on its way into OSPF; BR2 sees the stamp and refuses to send it back into EIGRP.</p></div>

<h3>The lab tag design, line by line</h3>
<pre class="code">route-map EIGRP-TO-OSPF deny 10
 match tag 110          <span class="c">! born in OSPF: never send it back to OSPF</span>
route-map EIGRP-TO-OSPF permit 20
 set tag 90             <span class="c">! everything else: stamp "born in EIGRP"</span>
route-map OSPF-TO-EIGRP deny 10
 match tag 90           <span class="c">! born in EIGRP: never send it back to EIGRP</span>
route-map OSPF-TO-EIGRP permit 20
 set tag 110            <span class="c">! everything else: stamp "born in OSPF"</span></pre>
<p>The same four entries go on every boundary router. Each direction does two jobs: <b>deny</b> the other domain's stamp, and <b>set</b> its own stamp on everything it lets through.</p>

<pre class="out">O1#show ip ospf database external 172.16.10.0
            OSPF Router with ID (9.9.9.9) (Process ID 1)
                Type-5 AS External Link States
  LS age: 312
  Options: (No TOS-capability, DC, Upward)
  LS Type: AS External Link
  Link State ID: 172.16.10.0 (External Network Number )
  <span class="hl">Advertising Router: 1.1.1.1</span>
  LS Seq Number: 80000002
  Checksum: 0x5A2C
  Length: 36
  Network Mask: /24
        Metric Type: 2 (Larger than any link state path)
        MTID: 0
        Metric: 20
        Forward Address: 0.0.0.0
        <span class="hl">External Route Tag: 90</span></pre>

<div class="eg"><p><b>Worked example: three or more boundary routers.</b> With domain tags, any number of boundary routers can share the same two values. Some designs instead give each boundary router its own tag (BR1 sets 1, BR2 sets 2, BR3 sets 3) and every router denies all of them with one line, <code>match tag 1 2 3</code> (OR logic). Per-router tags let you see in any routing table exactly which boundary router injected a route, which speeds up troubleshooting in large networks.</p></div>

<h3>Tags to protect path choice</h3>
<p>Tags plus deny stop re-redistribution. To also stop a boundary router from <b>installing</b> a route that originally came from its own other side, filter by tag inbound, as in chapter 7: <code>distribute-list route-map NO-OSPF-BORN in</code> under EIGRP (deny tag 110). OSPF can do the same for its RIB with <code>distribute-list route-map</code> matching tag 90. Combining tags with this inbound filter is the most robust multi-point design.</p>

<h3>Split horizon and poison reverse</h3>
<p><b>Split horizon</b>: a distance-vector router never advertises a route out of the interface it uses to reach that route. It prevents two-router loops. RIP and EIGRP enable it by default. The classic exception is a hub-and-spoke network such as a DMVPN hub, where all spokes sit behind one tunnel interface; the hub must use <code>no ip split-horizon eigrp 100</code> on the tunnel so spokes learn each other's networks (DMVPN module). <b>Poison reverse</b> is the stronger form: advertise the route back to where it came from, but with an infinite metric.</p>

<h3>Route poisoning</h3>
<p>When a route fails, the router advertises it immediately with an <b>infinite metric</b> instead of silently dropping it: hop count 16 in RIP, maximum delay in EIGRP (EIGRP then queries neighbours for an alternative). Neighbours remove it at once instead of waiting for timers. RIP adds hold-down timers and triggered updates; EIGRP relies on DUAL's feasibility condition, which only accepts backup paths that are guaranteed loop-free.</p>

<h3>Other built-in guards worth knowing</h3>
<table class="cmp"><tr><th>Protocol</th><th>Guard</th></tr>
<tr><td>EIGRP</td><td>Ignores external routes whose originating router ID equals its own; feasibility condition</td></tr>
<tr><td>OSPF</td><td>SPF on a shared LSDB; inter-area routes must pass through area 0; down bit and domain tag for PE-CE (VRF module)</td></tr>
<tr><td>BGP</td><td>Rejects routes containing its own AS in AS_PATH; iBGP routes are not re-advertised to iBGP peers</td></tr>
<tr><td>RIP</td><td>Split horizon, poison reverse, route poisoning, hold-down, maximum 15 hops</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Setting tags but never matching them. A route map with only <code>set tag 90</code> stamps passports that nobody checks. Also, tag 0 is the default for untagged routes, so <code>match tag 0</code> matches almost everything and is not a loop guard.</p></div>

<div class="exam"><p><b>Exam trap.</b> Duplicate EIGRP router IDs. Because EIGRP drops external routes that carry its own router ID as the originator, two routers with the same router ID silently ignore each other's redistributed routes while internal routes work fine. Symptom: only D EX routes missing.</p></div>

<div class="scn"><h4>The cloned router ID</h4><p>A new Delhi branch router was built from E1's configuration template and kept <code>eigrp router-id 5.5.5.5</code>. It redistributed its static routes to a vendor network into EIGRP. Every router except E1 learned them; E1 did not. <code>show ip eigrp topology</code> on BR1 showed "Originating router is 5.5.5.5" for the vendor routes, the same as E1's own router ID, so E1 discarded them as its own looping externals. Changing the branch router ID to 5.5.5.6 fixed it.</p><p><b>Lesson:</b> the originating router ID in EIGRP external data is a loop guard; duplicate router IDs trigger it falsely.</p></div>

<div class="iv"><p class="q">"How do route tags prevent redistribution loops, and what other loop-prevention mechanisms should a network engineer know?"</p><p>Strong answer: a boundary router sets a tag identifying the source domain when it redistributes; the tag travels in EIGRP external data or the OSPF type-5 LSA; the other boundary router's route map denies that tag, so the route cannot re-enter its origin. Tags can also drive inbound distribute-lists to prevent installing re-entered routes. Then list the built-ins: split horizon and poison reverse, route poisoning with infinite metrics, EIGRP feasibility condition and originating router ID check, OSPF's backbone rule, BGP AS_PATH.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tag is a 32-bit stamp carried in EIGRP externals and OSPF type-5/7 LSAs; it survives redistribution.</li>
<li>Set your domain's tag on exit and deny the other domain's tag on entry, identically on every boundary router.</li>
<li>Inbound distribute-lists matching tags also protect path selection.</li>
<li>Split horizon, poison reverse and route poisoning prevent distance-vector loops; disable split horizon only where needed, such as a DMVPN hub.</li>
<li>Duplicate EIGRP router IDs make routers drop each other's external routes.</li>
</ul></div>
`,hi:`
<p>Har culture mein gossip loops ke khilaaf rules hote hain. Aap chitthi par stamp lagate ho taaki woh do baar deliver na ho. Aap kahani us insaan ko wapas nahi sunate jisne aapko sunayi thi. Aur jab sadak sach mein band ho, to aap chup hone ki jagah zor se "band hai!" chillaate ho, taaki koi us taraf gaadi na chalata rahe. Routing mein bilkul yahi teen rules hain: <b>tags</b>, <b>split horizon</b> aur <b>route poisoning</b>. Blueprint item 1.3 aapse in sab ko, plus filtering ko, troubleshoot karne ko kehta hai.</p>

<h3>Route tags: passport stamp</h3>
<p><b>Route tag</b> route se juda ek 32-bit number hai. Yeh khud kuch nahi karta; yeh metadata hai jise baad mein route map match kar sakta hai. Yeh kahan rehta hai:</p>
<ul>
<li><b>EIGRP</b> external routes External data mein administrator tag le jaate hain (named mode internal routes ko bhi tag kar sakta hai).</li>
<li><b>OSPF</b> type-5 aur type-7 LSAs External Route Tag le jaate hain, aur domain ka har router use dekhta hai.</li>
<li><b>RIPv2</b> mein route tag field hai. <b>BGP</b> mein tag field nahi hai; woh isi kaam ke liye communities use karta hai.</li>
</ul>
<p>Sabse zaroori property: tag <b>doosre protocol se guzarte hue bhi bacha rehta hai</b>, kyunki har redistribution use copy ya set kar sakta hai. Isse doosra boundary router us route ko pehchan leta hai jo asal mein usi domain se aaya tha jismein woh ghusne wala hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tag journey">
<rect x="20" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">E1</text><text x="80" y="68" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.0/24</text>
<rect x="190" y="30" width="120" height="46" rx="8" fill="#fde68a"/><text x="250" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="250" y="68" text-anchor="middle" class="svg-accent" font-size="12">set tag 90</text>
<rect x="360" y="30" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="420" y="52" text-anchor="middle" class="svg-ink" font-size="13">OSPF domain</text><text x="420" y="68" text-anchor="middle" class="svg-muted" font-size="12">type 5, tag 90</text>
<rect x="500" y="30" width="120" height="46" rx="8" fill="#fde68a"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR2</text><text x="560" y="68" text-anchor="middle" class="svg-accent" font-size="12">deny tag 90</text>
<line x1="140" y1="53" x2="190" y2="53" stroke="#64748b" stroke-width="2"/><line x1="310" y1="53" x2="360" y2="53" stroke="#64748b" stroke-width="2"/><line x1="480" y1="53" x2="500" y2="53" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="140" width="120" height="46" rx="8" fill="#e2e8f0"/><text x="560" y="168" text-anchor="middle" class="svg-muted" font-size="12">EIGRP mein wapas nahi</text>
<line x1="560" y1="76" x2="560" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">90 = EIGRP mein paida, 110 = OSPF mein paida (numbers AD jaise chune)</text>
</svg><p class="cap">BR1 Delhi route par OSPF mein jaate waqt tag 90 ka stamp lagata hai; BR2 stamp dekhta hai aur use wapas EIGRP mein bhejne se mana kar deta hai.</p></div>

<h3>Lab ka tag design, line dar line</h3>
<pre class="code">route-map EIGRP-TO-OSPF deny 10
 match tag 110          <span class="c">! OSPF mein paida: kabhi wapas OSPF mein mat bhejo</span>
route-map EIGRP-TO-OSPF permit 20
 set tag 90             <span class="c">! baaki sab: stamp "EIGRP mein paida"</span>
route-map OSPF-TO-EIGRP deny 10
 match tag 90           <span class="c">! EIGRP mein paida: kabhi wapas EIGRP mein mat bhejo</span>
route-map OSPF-TO-EIGRP permit 20
 set tag 110            <span class="c">! baaki sab: stamp "OSPF mein paida"</span></pre>
<p>Yahi chaar entries har boundary router par jaati hain. Har direction do kaam karti hai: doosre domain ka stamp <b>deny</b> karna, aur jo bhi aage jaane de us par apna stamp <b>set</b> karna.</p>

<pre class="out">O1#show ip ospf database external 172.16.10.0
            OSPF Router with ID (9.9.9.9) (Process ID 1)
                Type-5 AS External Link States
  LS age: 312
  Options: (No TOS-capability, DC, Upward)
  LS Type: AS External Link
  Link State ID: 172.16.10.0 (External Network Number )
  <span class="hl">Advertising Router: 1.1.1.1</span>
  LS Seq Number: 80000002
  Checksum: 0x5A2C
  Length: 36
  Network Mask: /24
        Metric Type: 2 (Larger than any link state path)
        MTID: 0
        Metric: 20
        Forward Address: 0.0.0.0
        <span class="hl">External Route Tag: 90</span></pre>

<div class="eg"><p><b>Worked example: teen ya zyada boundary routers.</b> Domain tags ke saath kitne bhi boundary routers wahi do values share kar sakte hain. Kuch designs iski jagah har boundary router ko apna tag dete hain (BR1 1 set karta hai, BR2 2, BR3 3) aur har router ek line se sabko deny karta hai, <code>match tag 1 2 3</code> (OR logic). Per-router tags se aap kisi bhi routing table mein dekh sakte ho ki kis boundary router ne route inject kiya, jisse bade networks mein troubleshooting tez hoti hai.</p></div>

<h3>Path choice bachane ke liye tags</h3>
<p>Tags plus deny re-redistribution rokte hain. Boundary router ko us route ko <b>install</b> karne se bhi rokne ke liye jo asal mein uski apni doosri side se aaya, tag se inbound filter karo, jaise chapter 7 mein: EIGRP ke neeche <code>distribute-list route-map NO-OSPF-BORN in</code> (tag 110 deny). OSPF apne RIB ke liye tag 90 match karne wali <code>distribute-list route-map</code> se yahi kar sakta hai. Tags ko is inbound filter ke saath jodna sabse robust multi-point design hai.</p>

<h3>Split horizon aur poison reverse</h3>
<p><b>Split horizon</b>: distance-vector router kabhi bhi route ko us interface se advertise nahi karta jise woh us route tak pahunchne ke liye use karta hai. Yeh do-router loops rokta hai. RIP aur EIGRP ise default mein enable rakhte hain. Classic exception hub-and-spoke network hai jaise DMVPN hub, jahan saare spokes ek tunnel interface ke peeche hote hain; hub ko tunnel par <code>no ip split-horizon eigrp 100</code> use karna padta hai taaki spokes ek doosre ke networks seekh sakein (DMVPN module). <b>Poison reverse</b> strong form hai: route ko wahin wapas advertise karo jahan se aaya, lekin infinite metric ke saath.</p>

<h3>Route poisoning</h3>
<p>Jab route fail hota hai, router use chupchaap drop karne ki jagah turant <b>infinite metric</b> ke saath advertise karta hai: RIP mein hop count 16, EIGRP mein maximum delay (phir EIGRP alternative ke liye neighbours ko query karta hai). Neighbours timers ka intezaar kiye bina use turant hata dete hain. RIP hold-down timers aur triggered updates jodta hai; EIGRP DUAL ki feasibility condition par nirbhar hai, jo sirf wahi backup paths accept karti hai jo guaranteed loop-free hon.</p>

<h3>Doosre built-in guards jo jaanne layak hain</h3>
<table class="cmp"><tr><th>Protocol</th><th>Guard</th></tr>
<tr><td>EIGRP</td><td>Woh external routes ignore karta hai jinka originating router ID uske apne jaisa ho; feasibility condition</td></tr>
<tr><td>OSPF</td><td>Shared LSDB par SPF; inter-area routes ko area 0 se guzarna padta hai; PE-CE ke liye down bit aur domain tag (VRF module)</td></tr>
<tr><td>BGP</td><td>AS_PATH mein apna AS ho to route reject; iBGP routes iBGP peers ko dobara advertise nahi hote</td></tr>
<tr><td>RIP</td><td>Split horizon, poison reverse, route poisoning, hold-down, maximum 15 hops</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Tags set karna lekin unhe kabhi match na karna. Sirf <code>set tag 90</code> wala route map aise passports par stamp lagata hai jinhe koi check nahi karta. Aur untagged routes ka default tag 0 hai, isliye <code>match tag 0</code> lagbhag sab kuch match karta hai aur loop guard nahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Duplicate EIGRP router IDs. Kyunki EIGRP un external routes ko drop karta hai jinme originator uska apna router ID ho, same router ID wale do routers chupchaap ek doosre ke redistributed routes ignore karte hain jabki internal routes theek chalte hain. Symptom: sirf D EX routes missing.</p></div>

<div class="scn"><h4>Clone hua router ID</h4><p>Ek naya Delhi branch router E1 ke configuration template se bana aur usme <code>eigrp router-id 5.5.5.5</code> reh gaya. Usne vendor network ke apne static routes EIGRP mein redistribute kiye. E1 ke alawa har router ne unhe seekh liya; E1 ne nahi. BR1 par <code>show ip eigrp topology</code> vendor routes ke liye "Originating router is 5.5.5.5" dikha raha tha, jo E1 ka apna router ID hai, isliye E1 ne unhe apne hi looping externals samajh kar discard kar diya. Branch ka router ID 5.5.5.6 karne se theek hua.</p><p><b>Seekh:</b> EIGRP external data mein originating router ID ek loop guard hai; duplicate router IDs ise galat trigger karte hain.</p></div>

<div class="iv"><p class="q">"Route tags redistribution loops kaise rokte hain, aur network engineer ko kaunse doosre loop-prevention mechanisms pata hone chahiye?"</p><p>Strong answer: boundary router redistribute karte waqt source domain ki pehchaan wala tag set karta hai; tag EIGRP external data ya OSPF type-5 LSA mein travel karta hai; doosre boundary router ka route map us tag ko deny karta hai, isliye route apne origin mein wapas nahi ghus sakta. Tags inbound distribute-lists ko bhi chala sakte hain taaki wapas aaye routes install na hon. Phir built-ins batao: split horizon aur poison reverse, infinite metrics ke saath route poisoning, EIGRP feasibility condition aur originating router ID check, OSPF ka backbone rule, BGP AS_PATH.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tag ek 32-bit stamp hai jo EIGRP externals aur OSPF type-5/7 LSAs mein jaata hai; yeh redistribution ke baad bhi bacha rehta hai.</li>
<li>Exit par apne domain ka tag set karo aur entry par doosre domain ka tag deny karo, har boundary router par identical.</li>
<li>Tags match karne wali inbound distribute-lists path selection ko bhi bachati hain.</li>
<li>Split horizon, poison reverse aur route poisoning distance-vector loops rokte hain; split horizon sirf wahin disable karo jahan zaroorat ho, jaise DMVPN hub.</li>
<li>Duplicate EIGRP router IDs routers se ek doosre ke external routes drop karwate hain.</li>
</ul></div>
`}};export{e as default};