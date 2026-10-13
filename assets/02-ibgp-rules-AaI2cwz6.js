var e={id:`ibgp-rules`,h:{en:`The iBGP rules: split horizon, full mesh, next hop and synchronisation`,hi:`iBGP rules: split horizon, full mesh, next hop aur synchronisation`},body:{en:`
<p>Imagine an office where a strict rule says: "if a colleague tells you a piece of news, you may tell customers, but you may never pass it to another colleague". The rule sounds odd, but it guarantees that news can never loop around the office forever. The price is that every colleague must hear the news directly from the person who first learned it. That is iBGP in one paragraph.</p>

<h3>Why iBGP needs its own loop-prevention rule</h3>
<p>In ENCOR you learned that eBGP prevents loops with the <b>AS_PATH</b>: every eBGP speaker prepends its AS, and a router that sees its own AS in a received path drops the route. Inside one AS this check is useless, because iBGP speakers do <b>not</b> prepend anything. A route passed around R1, R2, R3 and back to R1 would carry exactly the same AS_PATH every time. BGP therefore uses a blunt rule instead:</p>
<div class="note"><p><b>iBGP split horizon:</b> a route learned from an iBGP peer is never advertised to another iBGP peer. It may be advertised to eBGP peers, and routes learned from eBGP peers or originated locally may be advertised to iBGP peers.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="iBGP split horizon in a chain">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#fed7aa"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="14">ISP (eBGP)</text>
<rect x="190" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="100" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text>
<rect x="360" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="415" y="100" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="14">BRANCH</text>
<line x1="130" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/><line x1="470" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="160" y="60" text-anchor="middle" class="svg-accent" font-size="12">route in</text>
<text x="330" y="60" text-anchor="middle" class="svg-accent" font-size="12">iBGP: sent</text>
<text x="495" y="60" text-anchor="middle" class="svg-accent" font-size="12">iBGP: blocked</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">CORE learned the route from an iBGP peer, so it never tells BRANCH</text>
</svg><p class="cap">Without a session from BRANCH to EDGE (or a route reflector), BRANCH never learns the ISP routes.</p></div>

<h3>Consequence 1: the full mesh</h3>
<p>Because nobody relays iBGP routes, every iBGP router needs a session to every router that originates or learns external routes. The safe design is a <b>full mesh</b>: n(n-1)/2 sessions. The mesh is <b>logical</b>, not physical. The routers do not need cables between each other; they need IP reachability between their peering addresses, which the IGP provides. The two standard ways to scale beyond a handful of routers are <b>route reflectors</b> (chapter 4, in the blueprint) and <b>confederations</b> (sub-ASes inside the AS; explicitly excluded from the ENARSI blueprint, so just know the name).</p>

<h3>Consequence 2: the next hop is not changed</h3>
<p>When an edge router passes an eBGP-learned route to its iBGP peers, the NEXT_HOP attribute still contains the <b>external neighbor's address</b>. BGP resolves next hops recursively: an internal router must find a route to that address in its routing table, or the path is marked <i>inaccessible</i> and cannot be best. Two fixes exist: advertise the edge link into the IGP (often as a passive interface), or configure <code>neighbor X next-hop-self</code> on the edge router so it writes its own peering address as next hop. Chapter 3 walks through both in the lab. Routes a router originates itself with <code>network</code> get that router's peering (update-source) address as next hop, which is why loopbacks must be in the IGP.</p>

<h3>Consequence 3: administrative distance 200</h3>
<p>iBGP routes get AD 200, higher than every IGP. If OSPF (AD 110) also knows a prefix, OSPF wins the routing table and BGP marks its own entry with <code>r</code> (RIB-failure). That is normal and often intended, for example for loopbacks that are both in OSPF and advertised in BGP.</p>

<pre class="out">CORE# show ip bgp rib-failure
  Network            Next Hop                      RIB-failure   RIB-NH Matches
<span class="hl">10.255.0.3/32      10.255.0.3              Higher admin distance              n/a</span></pre>

<h3>Synchronisation: the history you still need to know</h3>
<p>Old IOS enforced a <b>synchronisation rule</b>: an iBGP-learned route could not be used or passed to eBGP peers unless the same prefix was also known through the IGP. It existed because early transit networks had routers in the middle that did not run BGP; if the edge advertised a prefix to the world before those middle routers had learned it through redistribution, traffic would black-hole. Redistributing the full Internet table into an IGP is not practical, so everyone configured <code>no synchronization</code>, and since IOS 12.2(8)T it has been <b>disabled by default</b>. Today the rule is replaced by design: either every router on the transit path runs BGP (a full mesh or route reflectors), or the core is BGP-free and uses MPLS labels so middle routers never need the external prefixes.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1 starts with only EDGE and CORE in BGP. BRANCH runs OSPF but not BGP. PC3 behind BRANCH sends traffic to 203.0.113.1. BRANCH has no route for it (no BGP, no default), so the packet dies at the very first hop. Even if you gave BRANCH a static default to CORE, CORE must also hold a usable BGP route, and the ISP must know 172.16.30.0/24 for replies. Every router on the forwarding path needs the destination, which is the real lesson of synchronisation.</p></div>

<h3>Seeing split horizon in the output</h3>
<pre class="out">CORE# show ip bgp summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.1      4        65300      18      16        4    0    0 00:12:40        1
10.255.0.3      4        65300      11      12        4    0    0 00:04:02        1

CORE# show ip bgp neighbors 10.255.0.3 advertised-routes
<span class="hl">Total number of prefixes 0</span></pre>
<p>CORE has the ISP prefix from EDGE and the branch LAN from BRANCH, yet it advertises nothing to BRANCH. That is not a filter; it is the rule working.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Adding <code>redistribute bgp</code> into OSPF to "fix" missing routes; this leaks BGP into the IGP and can pull the whole Internet table into OSPF. (2) Building the mesh on physical interface addresses; one link failure then kills sessions even though another path exists. (3) Believing a route reflector changes the next hop; it does not.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Which router will not receive the route?" questions test split horizon: count iBGP hops from the router that learned it via eBGP. "Synchronisation" answers are almost always wrong for modern IOS because it is off by default. A prefix with <code>r&gt;i</code> is best in BGP but lost the RIB to a lower AD route.</p></div>

<div class="scn"><h4>The route that looped for an hour</h4><p>A service provider lab engineer disabled iBGP split horizon behaviour by redistributing BGP into OSPF and back into BGP on two different routers to "share routes faster". The same prefixes came back into BGP as locally originated with origin incomplete, weight 32768, and won over the real external paths. Traffic for a customer looped between two core routers until the TTL expired. Removing the mutual redistribution and building iBGP sessions (a route reflector) restored normal paths.</p><p><b>Lesson:</b> split horizon and the full mesh exist for a reason; do not work around them with redistribution.</p></div>

<div class="iv"><p class="q">"Why does iBGP require a full mesh?"</p><p>Say it in three steps: iBGP does not prepend the AS, so AS_PATH loop detection does not work inside an AS; BGP therefore forbids re-advertising iBGP-learned routes to other iBGP peers; so each router must learn external routes directly from the router that learned them, which means a logical full mesh of n(n-1)/2 sessions. Then add the fixes: route reflectors or confederations, and mention that the mesh is logical, over loopbacks reached through the IGP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP split horizon: routes from one iBGP peer are never sent to another iBGP peer.</li>
<li>The full mesh is logical: sessions between loopbacks, reachability from the IGP.</li>
<li>iBGP leaves the eBGP next hop unchanged; unreachable next hop = inaccessible path.</li>
<li>iBGP AD is 200; an IGP route to the same prefix wins and BGP shows <code>r</code>.</li>
<li>Synchronisation is disabled by default; every router on the path must still know the destination.</li>
</ul></div>
`,hi:`
<p>Ek aise office ki kalpana karo jahan sakht rule hai: "agar koi colleague aapko koi khabar bataye, to aap customers ko bata sakte ho, par kisi dusre colleague ko kabhi nahi". Rule ajeeb lagta hai, par yeh guarantee deta hai ki khabar office mein hamesha ke liye gol gol nahi ghoomegi. Keemat yeh hai ki har colleague ko khabar seedhe us insaan se sunni padti hai jisne use sabse pehle jaana. Ek paragraph mein yahi iBGP hai.</p>

<h3>iBGP ko apna loop-prevention rule kyun chahiye</h3>
<p>ENCOR mein aapne seekha ki eBGP <b>AS_PATH</b> se loops rokta hai: har eBGP speaker apna AS prepend karta hai, aur jo router received path mein apna AS dekhta hai woh route drop kar deta hai. Ek AS ke andar yeh check bekaar hai, kyunki iBGP speakers kuch bhi prepend <b>nahi</b> karte. R1, R2, R3 se ghoom kar wapas R1 tak aaya route har baar bilkul same AS_PATH le kar aayega. Isliye BGP ek seedha rule use karta hai:</p>
<div class="note"><p><b>iBGP split horizon:</b> iBGP peer se seekha route kabhi dusre iBGP peer ko advertise nahi hota. Use eBGP peers ko advertise kiya ja sakta hai, aur eBGP peers se seekhe ya locally originate hue routes iBGP peers ko advertise ho sakte hain.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Chain mein iBGP split horizon">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#fed7aa"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="14">ISP (eBGP)</text>
<rect x="190" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="100" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text>
<rect x="360" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="415" y="100" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="14">BRANCH</text>
<line x1="130" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/><line x1="470" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="160" y="60" text-anchor="middle" class="svg-accent" font-size="12">route aaya</text>
<text x="330" y="60" text-anchor="middle" class="svg-accent" font-size="12">iBGP: bheja</text>
<text x="495" y="60" text-anchor="middle" class="svg-accent" font-size="12">iBGP: blocked</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">CORE ne route iBGP peer se seekha, isliye BRANCH ko kabhi nahi batata</text>
</svg><p class="cap">BRANCH se EDGE tak session (ya route reflector) ke bina BRANCH ko ISP routes kabhi nahi milte.</p></div>

<h3>Consequence 1: full mesh</h3>
<p>Kyunki koi iBGP routes relay nahi karta, har iBGP router ko har us router se session chahiye jo external routes originate karta ya seekhta hai. Safe design hai <b>full mesh</b>: n(n-1)/2 sessions. Mesh <b>logical</b> hai, physical nahi. Routers ke beech cables ki zaroorat nahi; unke peering addresses ke beech IP reachability chahiye, jo IGP deta hai. Kuch routers se aage scale karne ke do standard tareeke hain <b>route reflectors</b> (chapter 4, blueprint mein) aur <b>confederations</b> (AS ke andar sub-ASes; ENARSI blueprint se explicitly bahar, bas naam yaad rakho).</p>

<h3>Consequence 2: next hop nahi badalta</h3>
<p>Jab edge router eBGP se seekha route apne iBGP peers ko deta hai, to NEXT_HOP attribute mein abhi bhi <b>external neighbor ka address</b> hota hai. BGP next hops recursively resolve karta hai: internal router ko apni routing table mein us address ka route milna chahiye, warna path <i>inaccessible</i> mark hota hai aur best nahi ban sakta. Do fixes hain: edge link ko IGP mein advertise karo (aksar passive interface ki tarah), ya edge router par <code>neighbor X next-hop-self</code> configure karo taaki woh next hop mein apna peering address likhe. Chapter 3 lab mein dono dikhata hai. Jo routes router khud <code>network</code> se originate karta hai unka next hop us router ka peering (update-source) address hota hai, isliye loopbacks IGP mein hone chahiye.</p>

<h3>Consequence 3: administrative distance 200</h3>
<p>iBGP routes ki AD 200 hoti hai, har IGP se zyada. Agar OSPF (AD 110) ko bhi koi prefix pata hai, to routing table mein OSPF jeetta hai aur BGP apni entry ko <code>r</code> (RIB-failure) se mark karta hai. Yeh normal hai aur aksar intended hota hai, jaise un loopbacks ke liye jo OSPF mein bhi hain aur BGP mein bhi advertise hote hain.</p>

<pre class="out">CORE# show ip bgp rib-failure
  Network            Next Hop                      RIB-failure   RIB-NH Matches
<span class="hl">10.255.0.3/32      10.255.0.3              Higher admin distance              n/a</span></pre>

<h3>Synchronisation: history jo aapko abhi bhi pata honi chahiye</h3>
<p>Purana IOS ek <b>synchronisation rule</b> lagata tha: iBGP se seekha route tab tak use nahi hota ya eBGP peers ko nahi jaata tha jab tak wahi prefix IGP se bhi pata na ho. Yeh isliye tha kyunki shuruaati transit networks mein beech mein aise routers the jo BGP nahi chalate the; agar edge un beech ke routers ke redistribution se seekhne se pehle hi prefix duniya ko advertise kar deta, to traffic black-hole ho jaata. Poori Internet table ko IGP mein redistribute karna practical nahi hai, isliye sab <code>no synchronization</code> configure karte the, aur IOS 12.2(8)T se yeh <b>default mein disabled</b> hai. Aaj yeh rule design se replace ho gaya hai: ya to transit path ka har router BGP chalata hai (full mesh ya route reflectors), ya core BGP-free hota hai aur MPLS labels use karta hai taaki beech ke routers ko external prefixes ki zaroorat hi na pade.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1 mein shuru mein sirf EDGE aur CORE BGP mein hain. BRANCH OSPF chalata hai par BGP nahi. BRANCH ke peeche PC3 203.0.113.1 ko traffic bhejta hai. BRANCH ke paas iska koi route nahi (na BGP, na default), isliye packet pehle hi hop par mar jaata hai. Agar aap BRANCH ko CORE ki taraf static default de bhi do, to CORE ke paas bhi usable BGP route hona chahiye, aur replies ke liye ISP ko 172.16.30.0/24 pata hona chahiye. Forwarding path ke har router ko destination pata honi chahiye, yahi synchronisation ki asli seekh hai.</p></div>

<h3>Output mein split horizon dekhna</h3>
<pre class="out">CORE# show ip bgp summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.1      4        65300      18      16        4    0    0 00:12:40        1
10.255.0.3      4        65300      11      12        4    0    0 00:04:02        1

CORE# show ip bgp neighbors 10.255.0.3 advertised-routes
<span class="hl">Total number of prefixes 0</span></pre>
<p>CORE ke paas EDGE se ISP prefix hai aur BRANCH se branch LAN, phir bhi woh BRANCH ko kuch advertise nahi karta. Yeh filter nahi hai; yeh rule kaam kar raha hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Missing routes "fix" karne ke liye OSPF mein <code>redistribute bgp</code> daalna; isse BGP IGP mein leak hota hai aur poori Internet table OSPF mein aa sakti hai. (2) Mesh ko physical interface addresses par banana; tab ek link girne se sessions mar jaate hain jabki dusra path maujood hai. (3) Yeh maanna ki route reflector next hop badalta hai; woh nahi badalta.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Kaun sa router route receive nahi karega?" wale questions split horizon test karte hain: us router se iBGP hops gino jisne route eBGP se seekha. Modern IOS ke liye "synchronisation" wale answers lagbhag hamesha galat hote hain kyunki woh default mein off hai. <code>r&gt;i</code> wala prefix BGP mein best hai par kam AD wale route se RIB haar gaya.</p></div>

<div class="scn"><h4>Woh route jo ek ghante tak loop hua</h4><p>Ek service provider lab engineer ne "routes jaldi share karne" ke liye do alag routers par BGP ko OSPF mein aur wapas BGP mein redistribute kar diya, yaani iBGP split horizon ke kaam ko bypass kar diya. Wahi prefixes BGP mein locally originated ban kar wapas aaye, origin incomplete aur weight 32768 ke saath, aur asli external paths se jeet gaye. Ek customer ka traffic do core routers ke beech TTL expire hone tak loop hota raha. Mutual redistribution hata kar aur iBGP sessions (route reflector) bana kar normal paths wapas aaye.</p><p><b>Seekh:</b> split horizon aur full mesh kisi wajah se hain; unhe redistribution se bypass mat karo.</p></div>

<div class="iv"><p class="q">"iBGP ko full mesh kyun chahiye?"</p><p>Teen steps mein bolo: iBGP AS prepend nahi karta, isliye AS ke andar AS_PATH loop detection kaam nahi karta; isliye BGP iBGP se seekhe routes ko dusre iBGP peers ko re-advertise karna mana karta hai; isliye har router ko external routes seedhe us router se seekhne padte hain jisne unhe seekha, yaani n(n-1)/2 sessions ka logical full mesh. Phir fixes jodo: route reflectors ya confederations, aur batao ki mesh logical hai, IGP se reach hone wale loopbacks par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP split horizon: ek iBGP peer se aaye routes kabhi dusre iBGP peer ko nahi jaate.</li>
<li>Full mesh logical hai: loopbacks ke beech sessions, reachability IGP se.</li>
<li>iBGP eBGP wala next hop nahi badalta; unreachable next hop = inaccessible path.</li>
<li>iBGP AD 200 hai; same prefix ka IGP route jeetta hai aur BGP <code>r</code> dikhata hai.</li>
<li>Synchronisation default mein disabled hai; phir bhi path ke har router ko destination pata honi chahiye.</li>
</ul></div>
`}};export{e as default};