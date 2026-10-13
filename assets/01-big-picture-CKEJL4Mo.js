var e={id:`big-picture`,h:{en:`From eBGP basics to running BGP inside your own AS`,hi:`eBGP basics se apne AS ke andar BGP chalane tak`},body:{en:`
<p><b>What you will learn in this module.</b> In CCNP ENCOR you brought up an eBGP session to an ISP, read <code>show ip bgp</code> and met the best-path list. ENARSI objective 1.10 asks for much more: you must <b>troubleshoot BGP, internal and external</b>. By the end of these 13 chapters you will be able to:</p>
<ul>
<li>Explain and fix the iBGP rules: full mesh, iBGP split horizon, next hop unchanged, and why synchronisation is history.</li>
<li>Build iBGP between loopbacks over OSPF with <code>update-source</code> and <code>next-hop-self</code>.</li>
<li>Replace a full mesh with a <b>route reflector</b> and read ORIGINATOR_ID and CLUSTER_LIST.</li>
<li>Troubleshoot neighbor relationships: states, update-source, ebgp-multihop, authentication, timers and prefix limits.</li>
<li>Write policies with prefix-lists, AS-path filter-lists (regex), route-maps and communities, and apply them with route refresh.</li>
<li>Steer traffic with weight, local preference, AS-path prepend and MED, and predict the best path step by step.</li>
<li>Enable BGP multipath, read 4-byte AS numbers in asplain and asdot, run the IPv6 address family, and harden every session.</li>
</ul>
<p><b>Prerequisites.</b> The ENCOR BGP module (sessions on TCP 179, the six states, basic eBGP configuration, attribute categories), OSPF from the ENARSI OSPF module, and route-maps and prefix-lists from the ENARSI redistribution module. We will refer back to them instead of re-teaching them.</p>

<h3>An analogy: a courier company with many depots</h3>
<p>Picture a national courier company. It is one organisation (an <b>autonomous system</b>) with depots in many cities. At the border depot it exchanges parcels with other courier companies: that is <b>eBGP</b>, a conversation between two different organisations. Inside, the depots send each other internal memos: "we can now deliver to these postcodes, hand parcels to the border depot". That internal memo system is <b>iBGP</b>.</p>
<p>The company has three strict memo rules. First, a memo keeps the original hand-over point written on it, so every depot must know how to reach the border depot (<b>next hop unchanged</b>). Second, a depot never forwards a memo it received from another depot, because nobody could tell if the memo was going round in circles (<b>iBGP split horizon</b>). Third, therefore every depot must hear directly from every border depot, or the head office must re-circulate memos (<b>full mesh</b> or <b>route reflector</b>). Almost every iBGP problem you will troubleshoot is one of these three rules.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="eBGP and iBGP in the Meridian lab">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="14">ISP</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">AS 64999</text>
<rect x="160" y="30" width="460" height="170" rx="12" fill="#e2e8f0"/><text x="390" y="52" text-anchor="middle" class="svg-muted" font-size="12">AS 65300 (OSPF area 0 inside)</text>
<rect x="190" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="102" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="245" y="120" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.1</text>
<rect x="340" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="395" y="102" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="395" y="120" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.2</text>
<rect x="490" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="545" y="102" text-anchor="middle" class="svg-ink" font-size="14">BRANCH</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.3</text>
<line x1="120" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="3"/><text x="155" y="96" text-anchor="middle" class="svg-accent" font-size="12">eBGP</text>
<line x1="300" y1="105" x2="340" y2="105" stroke="#64748b" stroke-width="2"/><line x1="450" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2"/>
<path d="M245 130 Q395 200 545 130" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="395" y="185" text-anchor="middle" class="svg-accent" font-size="12">iBGP full mesh between loopbacks</text>
</svg><p class="cap">The first lab network: one eBGP session at the edge, a full mesh of iBGP sessions inside, OSPF carrying the loopbacks.</p></div>

<h3>Quick recap: eBGP versus iBGP</h3>
<table class="cmp"><tr><th>Behaviour</th><th>eBGP (different AS)</th><th>iBGP (same AS)</th></tr>
<tr><td>Administrative distance</td><td>20</td><td>200</td></tr>
<tr><td>Default TTL of BGP packets</td><td>1 (directly connected)</td><td>255 (can be many hops away)</td></tr>
<tr><td>Next hop when advertising</td><td>Set to own address</td><td>Left unchanged</td></tr>
<tr><td>AS_PATH when advertising</td><td>Own AS prepended</td><td>Unchanged</td></tr>
<tr><td>Local preference</td><td>Not sent</td><td>Sent to all iBGP peers</td></tr>
<tr><td>Passing on routes learned from the same type</td><td>Yes, to other eBGP peers</td><td>No, never to another iBGP peer</td></tr>
</table>

<h3>Why this matters in a real network</h3>
<p>A company with two Internet providers, a partner connection and ten internal routers cannot put the full Internet table into OSPF. BGP carries external routes, OSPF carries only internal reachability (loopbacks and links), and iBGP glues the two together. When that glue is wrong, the symptoms are confusing: sessions are up, prefixes are in the table, yet traffic black-holes. ENARSI tests exactly this: reading outputs and naming the rule that was broken.</p>

<div class="eg"><p><b>Worked example.</b> Meridian Logistics (lab 1) has three routers in AS 65300. A full iBGP mesh needs n(n-1)/2 = 3 x 2 / 2 = <b>3 iBGP sessions</b> (EDGE-CORE, EDGE-BRANCH, CORE-BRANCH) plus <b>1 eBGP</b> session to the ISP. If the company grows to 20 routers, the mesh needs 20 x 19 / 2 = <b>190 sessions</b>. That number is why chapter 4 introduces route reflectors.</p></div>

<h3>How this module maps to the exam and the labs</h3>
<table class="cmp"><tr><th>Blueprint item (1.10)</th><th>Chapters</th><th>Lab</th></tr>
<tr><td>Neighbor relationship: update-source, next-hop-self</td><td>2, 3</td><td>iBGP full mesh over OSPF</td></tr>
<tr><td>Route reflector</td><td>4</td><td>(worked examples)</td></tr>
<tr><td>Neighbor relationship: authentication, ebgp-multihop</td><td>5, 6</td><td>BGP session hardening</td></tr>
<tr><td>Policies: inbound/outbound filtering</td><td>7, 8</td><td>Weight and local preference</td></tr>
<tr><td>Path preference, attributes and best path</td><td>9, 10</td><td>Weight and local preference</td></tr>
<tr><td>BGP multipath, 4-byte AS, address families</td><td>10, 11</td><td>(worked examples)</td></tr>
<tr><td>Troubleshooting internal and external BGP</td><td>12</td><td>NOC INC-5530</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Treating "session Established" as "BGP works". An Established iBGP session can still deliver routes whose next hop is unreachable, routes that lose best-path selection, or routes that lose to an IGP route because iBGP has AD 200. Always follow the route from the BGP table into the routing table and then into the forwarding path.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENARSI questions often show a perfectly correct eBGP configuration and ask why an <i>internal</i> router cannot reach a prefix. The answer is almost always an iBGP rule: missing next-hop-self, missing full mesh (or route reflector), or a missing IGP route to a loopback used as next hop.</p></div>

<div class="scn"><h4>The new branch that saw everything but reached nothing</h4><p>A retailer added a branch router, peered it over iBGP with the core only, and saw the session come up. The branch had no Internet routes at all. The engineer first suspected a filter. <code>show ip bgp neighbors 10.255.0.2 routes</code> on the branch was empty, while the core itself had the routes from the edge. The core was obeying iBGP split horizon: routes learned from the edge (an iBGP peer) are never passed to another iBGP peer. The fix was a session from the branch to the edge (completing the mesh). A year later, with 14 branches, they moved to a route reflector.</p><p><b>Lesson:</b> in iBGP, "my neighbor has the route" does not mean "my neighbor will send it to me".</p></div>

<div class="iv"><p class="q">"What are the main differences between eBGP and iBGP?"</p><p>Give a structured list: AD 20 versus 200; TTL 1 versus 255 (iBGP peers can be many hops away, usually on loopbacks); eBGP sets itself as next hop while iBGP leaves it unchanged; eBGP prepends the AS while iBGP cannot, so iBGP uses split horizon for loop prevention, which forces a full mesh or route reflectors; local preference travels only inside the AS. Finish with a practical consequence such as "that is why we configure next-hop-self on edge routers".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI moves from configuring eBGP to troubleshooting BGP inside and between autonomous systems.</li>
<li>iBGP rules: next hop unchanged, no re-advertising between iBGP peers, full mesh or route reflector.</li>
<li>OSPF carries loopbacks and links; BGP carries external and customer prefixes.</li>
<li>A full mesh needs n(n-1)/2 sessions: 3 for 3 routers, 190 for 20.</li>
<li>Session up is only the first check; next hop, best path, RIB and return path come after.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> CCNP ENCOR mein aapne ISP ke saath eBGP session banaya, <code>show ip bgp</code> padha aur best-path list dekhi. ENARSI objective 1.10 isse kahin zyada maangta hai: aapko <b>BGP troubleshoot karna hai, internal aur external dono</b>. In 13 chapters ke end tak aap yeh kar paoge:</p>
<ul>
<li>iBGP rules samjhana aur fix karna: full mesh, iBGP split horizon, next hop unchanged, aur synchronisation ab history kyun hai.</li>
<li>OSPF ke upar loopbacks ke beech iBGP banana, <code>update-source</code> aur <code>next-hop-self</code> ke saath.</li>
<li>Full mesh ko <b>route reflector</b> se replace karna aur ORIGINATOR_ID aur CLUSTER_LIST padhna.</li>
<li>Neighbor relationships troubleshoot karna: states, update-source, ebgp-multihop, authentication, timers aur prefix limits.</li>
<li>Prefix-lists, AS-path filter-lists (regex), route-maps aur communities se policies likhna, aur route refresh se unhe lagana.</li>
<li>Weight, local preference, AS-path prepend aur MED se traffic steer karna, aur best path step by step predict karna.</li>
<li>BGP multipath enable karna, 4-byte AS numbers asplain aur asdot mein padhna, IPv6 address family chalana, aur har session harden karna.</li>
</ul>
<p><b>Prerequisites.</b> ENCOR BGP module (TCP 179 par sessions, chhe states, basic eBGP configuration, attribute categories), ENARSI OSPF module se OSPF, aur ENARSI redistribution module se route-maps aur prefix-lists. Hum unhe dobara padhane ki jagah unka reference denge.</p>

<h3>Ek analogy: bahut saare depots wali courier company</h3>
<p>Ek national courier company socho. Yeh ek organisation hai (ek <b>autonomous system</b>) jiske depots kai shehron mein hain. Border depot par yeh dusri courier companies ke saath parcels exchange karti hai: yeh <b>eBGP</b> hai, do alag organisations ke beech baatcheet. Andar, depots ek dusre ko internal memos bhejte hain: "ab hum in postcodes par deliver kar sakte hain, parcels border depot ko do". Yeh internal memo system <b>iBGP</b> hai.</p>
<p>Company ke teen sakht memo rules hain. Pehla, memo par original hand-over point likha rehta hai, isliye har depot ko border depot tak pahunchna aana chahiye (<b>next hop unchanged</b>). Dusra, koi depot dusre depot se mila memo aage forward nahi karta, kyunki koi nahi bata sakta ki memo gol gol ghoom raha hai ya nahi (<b>iBGP split horizon</b>). Teesra, isliye har depot ko har border depot se seedha sunna padta hai, ya head office memos ko dobara circulate karta hai (<b>full mesh</b> ya <b>route reflector</b>). Lagbhag har iBGP problem jo aap troubleshoot karoge, in teen rules mein se ek hogi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Meridian lab mein eBGP aur iBGP">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="14">ISP</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">AS 64999</text>
<rect x="160" y="30" width="460" height="170" rx="12" fill="#e2e8f0"/><text x="390" y="52" text-anchor="middle" class="svg-muted" font-size="12">AS 65300 (andar OSPF area 0)</text>
<rect x="190" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="102" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="245" y="120" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.1</text>
<rect x="340" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="395" y="102" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="395" y="120" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.2</text>
<rect x="490" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="545" y="102" text-anchor="middle" class="svg-ink" font-size="14">BRANCH</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">Lo0 10.255.0.3</text>
<line x1="120" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="3"/><text x="155" y="96" text-anchor="middle" class="svg-accent" font-size="12">eBGP</text>
<line x1="300" y1="105" x2="340" y2="105" stroke="#64748b" stroke-width="2"/><line x1="450" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2"/>
<path d="M245 130 Q395 200 545 130" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="395" y="185" text-anchor="middle" class="svg-accent" font-size="12">loopbacks ke beech iBGP full mesh</text>
</svg><p class="cap">Pehla lab network: edge par ek eBGP session, andar iBGP sessions ka full mesh, aur OSPF loopbacks ko carry karta hai.</p></div>

<h3>Jaldi recap: eBGP versus iBGP</h3>
<table class="cmp"><tr><th>Behaviour</th><th>eBGP (alag AS)</th><th>iBGP (same AS)</th></tr>
<tr><td>Administrative distance</td><td>20</td><td>200</td></tr>
<tr><td>BGP packets ka default TTL</td><td>1 (directly connected)</td><td>255 (kai hops door ho sakta hai)</td></tr>
<tr><td>Advertise karte waqt next hop</td><td>Apna address set hota hai</td><td>Waisa hi rehta hai</td></tr>
<tr><td>Advertise karte waqt AS_PATH</td><td>Apna AS prepend hota hai</td><td>Nahi badalta</td></tr>
<tr><td>Local preference</td><td>Nahi bheja jaata</td><td>Saare iBGP peers ko bheja jaata hai</td></tr>
<tr><td>Same type se seekhe routes aage dena</td><td>Haan, dusre eBGP peers ko</td><td>Nahi, dusre iBGP peer ko kabhi nahi</td></tr>
</table>

<h3>Real network mein yeh kyun matter karta hai</h3>
<p>Do Internet providers, ek partner connection aur das internal routers wali company poori Internet table OSPF mein nahi daal sakti. BGP external routes carry karta hai, OSPF sirf internal reachability (loopbacks aur links) carry karta hai, aur iBGP dono ko jodta hai. Jab yeh jod galat hota hai to symptoms confusing hote hain: sessions up hain, prefixes table mein hain, phir bhi traffic black-hole ho jaata hai. ENARSI bilkul yahi test karta hai: outputs padhna aur us rule ka naam lena jo toota.</p>

<div class="eg"><p><b>Worked example.</b> Meridian Logistics (lab 1) ke AS 65300 mein teen routers hain. Full iBGP mesh ko n(n-1)/2 = 3 x 2 / 2 = <b>3 iBGP sessions</b> chahiye (EDGE-CORE, EDGE-BRANCH, CORE-BRANCH) plus ISP tak <b>1 eBGP</b> session. Agar company 20 routers tak badh jaaye, to mesh ko 20 x 19 / 2 = <b>190 sessions</b> chahiye. Yahi number wajah hai ki chapter 4 route reflectors laata hai.</p></div>

<h3>Yeh module exam aur labs se kaise juda hai</h3>
<table class="cmp"><tr><th>Blueprint item (1.10)</th><th>Chapters</th><th>Lab</th></tr>
<tr><td>Neighbor relationship: update-source, next-hop-self</td><td>2, 3</td><td>OSPF ke upar iBGP full mesh</td></tr>
<tr><td>Route reflector</td><td>4</td><td>(worked examples)</td></tr>
<tr><td>Neighbor relationship: authentication, ebgp-multihop</td><td>5, 6</td><td>BGP session hardening</td></tr>
<tr><td>Policies: inbound/outbound filtering</td><td>7, 8</td><td>Weight aur local preference</td></tr>
<tr><td>Path preference, attributes aur best path</td><td>9, 10</td><td>Weight aur local preference</td></tr>
<tr><td>BGP multipath, 4-byte AS, address families</td><td>10, 11</td><td>(worked examples)</td></tr>
<tr><td>Internal aur external BGP troubleshooting</td><td>12</td><td>NOC INC-5530</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> "Session Established" ko "BGP chal raha hai" maan lena. Established iBGP session bhi aise routes de sakta hai jinka next hop unreachable ho, jo best-path selection haar jaayein, ya jo IGP route se haar jaayein kyunki iBGP ki AD 200 hai. Hamesha route ko BGP table se routing table tak aur phir forwarding path tak follow karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENARSI questions aksar bilkul sahi eBGP configuration dikhate hain aur poochte hain ki ek <i>internal</i> router prefix tak kyun nahi pahunch pa raha. Jawab lagbhag hamesha ek iBGP rule hota hai: next-hop-self missing, full mesh (ya route reflector) missing, ya next hop ke roop mein use hue loopback ka IGP route missing.</p></div>

<div class="scn"><h4>Naya branch jo sab dekhta tha par kahin nahi pahunchta tha</h4><p>Ek retailer ne naya branch router joda, use sirf core ke saath iBGP par peer kiya, aur session up hota dekha. Branch ke paas ek bhi Internet route nahi tha. Engineer ne pehle filter par shak kiya. Branch par <code>show ip bgp neighbors 10.255.0.2 routes</code> khaali tha, jabki core ke paas edge se aaye routes the. Core iBGP split horizon follow kar raha tha: edge (ek iBGP peer) se seekhe routes kabhi dusre iBGP peer ko nahi diye jaate. Fix tha branch se edge tak session (mesh poora karna). Ek saal baad, 14 branches ke saath, unhone route reflector apna liya.</p><p><b>Seekh:</b> iBGP mein "mere neighbor ke paas route hai" ka matlab yeh nahi ki "mera neighbor mujhe route bhejega".</p></div>

<div class="iv"><p class="q">"eBGP aur iBGP mein main differences kya hain?"</p><p>Structured list do: AD 20 versus 200; TTL 1 versus 255 (iBGP peers kai hops door ho sakte hain, aam taur par loopbacks par); eBGP khud ko next hop set karta hai jabki iBGP use waisa hi chhodta hai; eBGP AS prepend karta hai jabki iBGP nahi kar sakta, isliye iBGP loop prevention ke liye split horizon use karta hai, jo full mesh ya route reflectors zaroori bana deta hai; local preference sirf AS ke andar travel karta hai. Ek practical consequence ke saath khatam karo jaise "isiliye hum edge routers par next-hop-self configure karte hain".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI eBGP configure karne se aage badh kar AS ke andar aur ASes ke beech BGP troubleshoot karna sikhata hai.</li>
<li>iBGP rules: next hop unchanged, iBGP peers ke beech re-advertise nahi, full mesh ya route reflector.</li>
<li>OSPF loopbacks aur links carry karta hai; BGP external aur customer prefixes carry karta hai.</li>
<li>Full mesh ko n(n-1)/2 sessions chahiye: 3 routers ke liye 3, 20 ke liye 190.</li>
<li>Session up hona sirf pehla check hai; uske baad next hop, best path, RIB aur return path aate hain.</li>
</ul></div>
`}};export{e as default};