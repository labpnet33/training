var e={id:`path-vector`,h:{en:`Path vector, AS_PATH loop prevention and eBGP vs iBGP`,hi:`Path vector, AS_PATH loop prevention aur eBGP vs iBGP`},body:{en:`
<p>A courier parcel that travels from Chennai to Delhi to Frankfurt to London collects a stamp at every hub. At any hub, staff can read the whole route history on the label. If the Delhi hub ever receives a parcel whose label already shows "Delhi", it knows something has gone wrong and refuses it. BGP routes carry exactly such a label, and that single idea gives BGP its name and its loop prevention.</p>

<h3>Distance vector, link state, path vector</h3>
<ul>
<li><b>Distance vector</b> (RIP, EIGRP's roots): a router knows only "this prefix is N units away via that neighbour".</li>
<li><b>Link state</b> (OSPF, IS-IS): every router holds the full map of the area and runs SPF.</li>
<li><b>Path vector</b> (BGP): each route carries the <b>list of ASes</b> it has crossed, plus other attributes. A router does not know every link, but it knows the AS-level path, which is enough to detect loops and apply policy.</li>
</ul>

<h3>How AS_PATH is built</h3>
<p>When a router advertises a route to a peer in a <b>different</b> AS, it <b>prepends its own ASN</b> to the left of the AS_PATH. Nothing is added when advertising inside the same AS. So the path reads <b>right to left</b> in time: the right-most ASN is the <b>origin AS</b>, the left-most is the neighbour you learned it from. The number of ASNs is the <b>AS_PATH length</b>, one of the steps in best-path selection.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="AS_PATH growing across four ASes">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="13">R1 AS 65101</text><text x="70" y="70" text-anchor="middle" class="svg-muted" font-size="12">campus</text>
<rect x="175" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="13">R2 AS 65102</text><text x="235" y="70" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="340" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="13">R3 AS 65103</text><text x="400" y="70" text-anchor="middle" class="svg-muted" font-size="12">metro</text>
<rect x="505" y="30" width="125" height="50" rx="8" fill="#ddd6fe"/><text x="567" y="52" text-anchor="middle" class="svg-ink" font-size="13">R4 AS 65104</text><text x="567" y="70" text-anchor="middle" class="svg-muted" font-size="12">172.31.4.0/24</text>
<line x1="130" y1="55" x2="175" y2="55" stroke="#64748b" stroke-width="2"/><line x1="295" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="460" y1="55" x2="505" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="567" y="115" text-anchor="middle" class="svg-accent" font-size="12">path: 65104</text>
<text x="400" y="140" text-anchor="middle" class="svg-accent" font-size="12">path: 65103 65104</text>
<text x="235" y="165" text-anchor="middle" class="svg-accent" font-size="12">path: 65102 65103 65104</text>
<text x="70" y="190" text-anchor="middle" class="svg-ink" font-size="12">R1 sees length 3</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Each eBGP hop prepends its own ASN on the left</text>
</svg><p class="cap">Lab 2: the data-centre prefix collects one ASN per AS boundary on its way to the campus.</p></div>

<h3>Loop prevention</h3>
<p>The rule is simple: <b>an eBGP speaker rejects any update whose AS_PATH already contains its own ASN</b>. If AS 65102 ever received 172.31.4.0/24 with path <code>65101 65102 65103 65104</code>, it would drop it silently, because its own number is in the list. No hop counts, no timers, no split-horizon tricks are needed between ASes.</p>
<p>This rule has a side effect you will meet in real life: a customer with two sites using the <b>same</b> private ASN connected through an ISP will not learn the other site's routes, because each site sees its own ASN in the path. Providers fix that with <code>neighbor ... allowas-in</code> on the customer router or <code>as-override</code> on the PE; these are previews for later courses.</p>

<h3>eBGP and iBGP: same protocol, different rules</h3>
<p>A BGP session is <b>external (eBGP)</b> when the two routers are in <b>different</b> ASes, and <b>internal (iBGP)</b> when they are in the <b>same</b> AS. The router decides this simply by comparing <code>neighbor x remote-as</code> with its own <code>router bgp</code> number.</p>
<table class="cmp"><tr><th>Behaviour</th><th>eBGP</th><th>iBGP</th></tr>
<tr><td>Administrative distance</td><td><b>20</b></td><td><b>200</b></td></tr>
<tr><td>Default TTL of BGP packets</td><td><b>1</b> (peer must be directly connected)</td><td>255 (peer can be many hops away, usually loopbacks)</td></tr>
<tr><td>AS_PATH</td><td>Own ASN prepended</td><td>Unchanged</td></tr>
<tr><td>NEXT_HOP</td><td>Set to own address on the session</td><td><b>Unchanged</b> (use <code>next-hop-self</code> if needed)</td></tr>
<tr><td>LOCAL_PREF</td><td>Not sent</td><td>Sent to all iBGP peers</td></tr>
<tr><td>Re-advertising learned routes</td><td>To all peers</td><td>Routes learned from iBGP are <b>not</b> sent to other iBGP peers</td></tr>
</table>

<h3>Why iBGP needs a full mesh (preview)</h3>
<p>Inside an AS there is no AS_PATH change, so AS_PATH cannot detect loops. BGP therefore uses an <b>iBGP split-horizon rule</b>: a route learned from one iBGP peer is never passed to another iBGP peer. The consequence is that every iBGP router must peer with every other one: a <b>full mesh</b> of n(n-1)/2 sessions. Ten routers need 45 sessions. Route reflectors and confederations remove that burden; you will study them in CCNP ENARSI. For ENCOR, remember the rule and the formula.</p>

<div class="eg"><p><b>Worked example.</b> An AS has 6 BGP routers. Full mesh = 6 x 5 / 2 = <b>15</b> iBGP sessions. If one of them, R-EDGE, learns 203.0.113.0/24 from an ISP with next hop 100.64.10.1, then R-EDGE's iBGP peers receive the route with next hop <b>still 100.64.10.1</b>. If they have no IGP route to 100.64.10.0/30, the route is not valid for them (no <code>*</code>), and they cannot use it. The fix is <code>neighbor x next-hop-self</code> on R-EDGE or advertising the link subnet into the IGP.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading AS_PATH left to right and blaming the wrong AS. In <code>65102 65103 65104</code>, 65104 originated the prefix. If the prefix is wrong or hijacked, 65104 announced it; 65102 only passed it on.</p></div>

<div class="exam"><p><b>Exam trap.</b> eBGP changes the next hop, iBGP does not. eBGP TTL is 1, iBGP TTL is 255. AD 20 for eBGP beats OSPF 110, but AD 200 for iBGP loses to every IGP. Expect a question where an iBGP route is in the BGP table but not in the RIB because OSPF already has the prefix.</p></div>

<div class="scn"><h4>Two branches, one ASN, no routes</h4><p>A retail chain connected every branch to an MPLS provider with eBGP and, to keep it simple, used AS 65020 at every branch. Sessions were Established everywhere, but branch A never learned branch B's LAN. <code>show ip bgp neighbors ... received-routes</code> was empty for those prefixes because the provider's update carried <code>64500 65020</code> and the branch dropped it on seeing its own ASN. The provider enabled <code>as-override</code>, replacing the customer ASN with its own in the path.</p><p><b>Lesson:</b> AS_PATH loop prevention is automatic and silent; same-ASN multi-site designs need a deliberate workaround.</p></div>

<div class="iv"><p class="q">"How does BGP prevent loops, both between ASes and inside an AS?"</p><p>Strong answer: between ASes, every eBGP speaker prepends its ASN and rejects updates that already contain its own ASN. Inside an AS, AS_PATH does not change, so iBGP uses split horizon: routes from an iBGP peer are not advertised to other iBGP peers. That forces a full mesh, n(n-1)/2 sessions, or route reflectors and confederations. Mentioning both halves shows real understanding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP is path-vector: each route carries the list of ASes it crossed (AS_PATH).</li>
<li>AS_PATH grows on the left at each eBGP hop; the right-most ASN is the origin.</li>
<li>A router rejects updates whose AS_PATH contains its own ASN.</li>
<li>eBGP: AD 20, TTL 1, next hop changed. iBGP: AD 200, TTL 255, next hop unchanged, LOCAL_PREF shared.</li>
<li>iBGP split horizon forces a full mesh of n(n-1)/2 sessions unless route reflectors or confederations are used.</li>
</ul></div>
`,hi:`
<p>Chennai se Delhi, Frankfurt hote hue London jaane wala courier parcel har hub par ek stamp jama karta hai. Kisi bhi hub par staff label par poori route history padh sakta hai. Agar Delhi hub ko kabhi aisa parcel mile jiske label par pehle se "Delhi" likha ho, to use pata chal jaata hai ki kuch gadbad hai aur woh use mana kar deta hai. BGP routes bilkul aisa hi label le kar chalte hain, aur yahi ek idea BGP ko uska naam aur uska loop prevention deta hai.</p>

<h3>Distance vector, link state, path vector</h3>
<ul>
<li><b>Distance vector</b> (RIP, EIGRP ki jadein): router sirf itna jaanta hai "yeh prefix us neighbour ke through N units door hai".</li>
<li><b>Link state</b> (OSPF, IS-IS): har router ke paas area ka poora map hota hai aur woh SPF chalata hai.</li>
<li><b>Path vector</b> (BGP): har route un <b>ASes ki list</b> le kar chalta hai jinse woh guzra, plus doosre attributes. Router ko har link nahi pata, par AS-level path pata hai, jo loops pakadne aur policy lagane ke liye kaafi hai.</li>
</ul>

<h3>AS_PATH kaise banta hai</h3>
<p>Jab router kisi <b>alag</b> AS ke peer ko route advertise karta hai, woh AS_PATH ke left mein <b>apna ASN prepend karta hai</b>. Same AS ke andar advertise karte waqt kuch nahi judta. Isliye path time ke hisaab se <b>right se left</b> padha jaata hai: sabse right wala ASN <b>origin AS</b> hai, sabse left wala woh neighbour jisse aapne seekha. ASNs ki ginti <b>AS_PATH length</b> hai, jo best-path selection ka ek step hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Chaar ASes mein badhta AS_PATH">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="13">R1 AS 65101</text><text x="70" y="70" text-anchor="middle" class="svg-muted" font-size="12">campus</text>
<rect x="175" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="13">R2 AS 65102</text><text x="235" y="70" text-anchor="middle" class="svg-muted" font-size="12">transit</text>
<rect x="340" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="13">R3 AS 65103</text><text x="400" y="70" text-anchor="middle" class="svg-muted" font-size="12">metro</text>
<rect x="505" y="30" width="125" height="50" rx="8" fill="#ddd6fe"/><text x="567" y="52" text-anchor="middle" class="svg-ink" font-size="13">R4 AS 65104</text><text x="567" y="70" text-anchor="middle" class="svg-muted" font-size="12">172.31.4.0/24</text>
<line x1="130" y1="55" x2="175" y2="55" stroke="#64748b" stroke-width="2"/><line x1="295" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="460" y1="55" x2="505" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="567" y="115" text-anchor="middle" class="svg-accent" font-size="12">path: 65104</text>
<text x="400" y="140" text-anchor="middle" class="svg-accent" font-size="12">path: 65103 65104</text>
<text x="235" y="165" text-anchor="middle" class="svg-accent" font-size="12">path: 65102 65103 65104</text>
<text x="70" y="190" text-anchor="middle" class="svg-ink" font-size="12">R1 ko length 3 dikhti hai</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Har eBGP hop left mein apna ASN prepend karta hai</text>
</svg><p class="cap">Lab 2: data-centre prefix campus tak jaate hue har AS boundary par ek ASN jama karta hai.</p></div>

<h3>Loop prevention</h3>
<p>Rule simple hai: <b>eBGP speaker har woh update reject karta hai jiske AS_PATH mein pehle se uska apna ASN ho</b>. Agar AS 65102 ko kabhi 172.31.4.0/24 path <code>65101 65102 65103 65104</code> ke saath mile, to woh use chupchaap drop kar dega, kyunki list mein uska apna number hai. ASes ke beech hop counts, timers ya split-horizon tricks ki zaroorat nahi.</p>
<p>Is rule ka ek side effect real life mein milega: ek customer jiski do sites ISP ke through <b>same</b> private ASN ke saath judi hain, doosri site ke routes nahi seekhega, kyunki har site path mein apna ASN dekhti hai. Providers ise customer router par <code>neighbor ... allowas-in</code> ya PE par <code>as-override</code> se theek karte hain; yeh baad ke courses ke previews hain.</p>

<h3>eBGP aur iBGP: same protocol, alag rules</h3>
<p>BGP session <b>external (eBGP)</b> hota hai jab dono routers <b>alag</b> ASes mein hon, aur <b>internal (iBGP)</b> jab <b>same</b> AS mein hon. Router yeh bas <code>neighbor x remote-as</code> ko apne <code>router bgp</code> number se compare karke decide karta hai.</p>
<table class="cmp"><tr><th>Behaviour</th><th>eBGP</th><th>iBGP</th></tr>
<tr><td>Administrative distance</td><td><b>20</b></td><td><b>200</b></td></tr>
<tr><td>BGP packets ka default TTL</td><td><b>1</b> (peer directly connected hona chahiye)</td><td>255 (peer kai hops door ho sakta hai, aam taur par loopbacks)</td></tr>
<tr><td>AS_PATH</td><td>Apna ASN prepend</td><td>Unchanged</td></tr>
<tr><td>NEXT_HOP</td><td>Session par apne address par set</td><td><b>Unchanged</b> (zaroorat ho to <code>next-hop-self</code>)</td></tr>
<tr><td>LOCAL_PREF</td><td>Nahi bheja jaata</td><td>Saare iBGP peers ko bheja jaata hai</td></tr>
<tr><td>Seekhe routes dobara advertise karna</td><td>Saare peers ko</td><td>iBGP se seekhe routes doosre iBGP peers ko <b>nahi</b> bheje jaate</td></tr>
</table>

<h3>iBGP ko full mesh kyun chahiye (preview)</h3>
<p>AS ke andar AS_PATH nahi badalta, isliye AS_PATH loops nahi pakad sakta. Isliye BGP ek <b>iBGP split-horizon rule</b> use karta hai: ek iBGP peer se seekha route kabhi doosre iBGP peer ko nahi diya jaata. Nateeja yeh ki har iBGP router ko har doosre se peer karna padta hai: n(n-1)/2 sessions ka <b>full mesh</b>. Das routers ko 45 sessions chahiye. Route reflectors aur confederations yeh bojh hatate hain; inhe aap CCNP ENARSI mein padhoge. ENCOR ke liye rule aur formula yaad rakho.</p>

<div class="eg"><p><b>Worked example.</b> Ek AS mein 6 BGP routers hain. Full mesh = 6 x 5 / 2 = <b>15</b> iBGP sessions. Agar unme se ek, R-EDGE, ISP se 203.0.113.0/24 next hop 100.64.10.1 ke saath seekhta hai, to R-EDGE ke iBGP peers ko route next hop <b>abhi bhi 100.64.10.1</b> ke saath milta hai. Agar unke paas 100.64.10.0/30 ka IGP route nahi hai, to route unke liye valid nahi (koi <code>*</code> nahi), aur woh use use nahi kar sakte. Fix hai R-EDGE par <code>neighbor x next-hop-self</code> ya link subnet ko IGP mein advertise karna.</p></div>

<div class="warn"><p><b>Common galti.</b> AS_PATH ko left se right padhna aur galat AS ko blame karna. <code>65102 65103 65104</code> mein 65104 ne prefix originate kiya. Agar prefix galat ya hijacked hai, to 65104 ne announce kiya; 65102 ne sirf aage bheja.</p></div>

<div class="exam"><p><b>Exam trap.</b> eBGP next hop badalta hai, iBGP nahi. eBGP TTL 1 hai, iBGP TTL 255. eBGP ki AD 20 OSPF 110 ko harati hai, par iBGP ki AD 200 har IGP se haar jaati hai. Aisa question expect karo jahan iBGP route BGP table mein hai par RIB mein nahi, kyunki OSPF ke paas prefix pehle se hai.</p></div>

<div class="scn"><h4>Do branches, ek ASN, koi routes nahi</h4><p>Ek retail chain ne har branch ko eBGP se MPLS provider se joda aur simple rakhne ke liye har branch par AS 65020 use kiya. Har jagah sessions Established the, par branch A ko kabhi branch B ka LAN nahi mila. Un prefixes ke liye <code>show ip bgp neighbors ... received-routes</code> khali tha kyunki provider ke update mein <code>64500 65020</code> tha aur branch ne apna ASN dekh kar use drop kar diya. Provider ne <code>as-override</code> enable kiya, jo path mein customer ASN ko apne ASN se badal deta hai.</p><p><b>Seekh:</b> AS_PATH loop prevention automatic aur silent hai; same-ASN multi-site designs ko jaan boojh kar workaround chahiye.</p></div>

<div class="iv"><p class="q">"BGP loops kaise rokta hai, ASes ke beech bhi aur AS ke andar bhi?"</p><p>Strong answer: ASes ke beech har eBGP speaker apna ASN prepend karta hai aur woh updates reject karta hai jinme pehle se uska ASN ho. AS ke andar AS_PATH nahi badalta, isliye iBGP split horizon use karta hai: iBGP peer se aaye routes doosre iBGP peers ko advertise nahi hote. Isse full mesh, n(n-1)/2 sessions, ya route reflectors aur confederations zaroori ho jaate hain. Dono hisse batana asli samajh dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP path-vector hai: har route un ASes ki list le kar chalta hai jinse woh guzra (AS_PATH).</li>
<li>Har eBGP hop par AS_PATH left mein badhta hai; sabse right wala ASN origin hai.</li>
<li>Router woh updates reject karta hai jinke AS_PATH mein uska apna ASN ho.</li>
<li>eBGP: AD 20, TTL 1, next hop badalta hai. iBGP: AD 200, TTL 255, next hop same, LOCAL_PREF share hota hai.</li>
<li>iBGP split horizon n(n-1)/2 sessions ka full mesh zaroori karta hai jab tak route reflectors ya confederations use na hon.</li>
</ul></div>
`}};export{e as default};