var e=e=>`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Route reflector rules"><rect x="260" y="20" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">RR</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.20.255.2</text><rect x="60" y="120" width="130" height="50" rx="8" fill="#bae6fd"/><text x="125" y="142" text-anchor="middle" class="svg-ink" font-size="14">PE1 client</text><text x="125" y="160" text-anchor="middle" class="svg-muted" font-size="12">10.20.255.1</text><rect x="450" y="120" width="130" height="50" rx="8" fill="#bae6fd"/><text x="515" y="142" text-anchor="middle" class="svg-ink" font-size="14">PE2 client</text><text x="515" y="160" text-anchor="middle" class="svg-muted" font-size="12">10.20.255.3</text><line x1="270" y1="70" x2="150" y2="120" stroke="#64748b" stroke-width="2"/><line x1="370" y1="70" x2="490" y2="120" stroke="#64748b" stroke-width="2"/><path d="M130 112 Q140 80 262 50" fill="none" stroke="#0ea5e9" stroke-width="2"/><path d="M378 48 Q500 80 510 112" fill="none" stroke="#0ea5e9" stroke-width="2"/><text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">172.16.1.0/24 reflected</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">2 sessions instead of 3; no PE1-PE2 session</text></svg><p class="cap">`+e+`</p></div>`,t={id:`route-reflectors`,h:{en:`Route reflectors: rules, clients and loop prevention`,hi:`Route reflectors: rules, clients aur loop prevention`},body:{en:`
<p>Back to the postal analogy. A <b>route reflector (RR)</b> is the directory desk. It is the one iBGP router that is allowed to break split horizon for the routers you mark as its <b>clients</b>. Clients need no special configuration; they just peer with the RR and think it is a normal iBGP neighbour. Only the RR is configured.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! RR (this is exactly what the lab solution uses)</span>
router bgp 65000
 neighbor 10.20.255.1 remote-as 65000
 neighbor 10.20.255.1 update-source Loopback0
 neighbor 10.20.255.1 route-reflector-client
 neighbor 10.20.255.3 remote-as 65000
 neighbor 10.20.255.3 update-source Loopback0
 neighbor 10.20.255.3 route-reflector-client
<span class="c">! PE1 and PE2 (the clients)</span>
router bgp 65000
 neighbor 10.20.255.2 remote-as 65000
 neighbor 10.20.255.2 update-source Loopback0
 neighbor 10.20.255.2 next-hop-self</pre>

<h3>Reflection rules</h3>
<table class="cmp"><tr><th>RR learned the best path from</th><th>RR advertises it to</th></tr>
<tr><td>an eBGP peer</td><td>all clients and non-clients</td></tr>
<tr><td>a client</td><td>all other clients and all non-clients</td></tr>
<tr><td>a non-client</td><td>clients only</td></tr></table>
<p>Two more facts. The RR reflects only its <b>best</b> path per prefix. And it does <b>not</b> change the next hop, AS_PATH, local preference or MED of what it reflects, so the next-hop-self on the PEs is still required.</p>

@@D@@

<h3>Verifying that reflection works</h3>
<p>Real output from the lab after the solution. The RR shows who is a client and which routes it passes on:</p>
<pre class="out">RR# show ip bgp neighbors 10.20.255.1
BGP neighbor is 10.20.255.1,  remote AS 65000, internal link
  BGP state = Established, up for 00:00:35
 For address family: IPv4 Unicast
  <span class="hl">Route-Reflector Client</span>

RR# show ip bgp neighbors 10.20.255.3 advertised-routes
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;i 172.16.1.0/24    10.20.255.1              0    100      0 65101 i
Total number of prefixes 1</pre>
<p>The route came from PE1 (a client) and is advertised to PE2 (another client). Without <code>route-reflector-client</code> on PE1 the RR would hold the route as a non-client route and would send it to clients only. If <i>neither</i> PE is a client, nothing is reflected at all, the kind of fault you will meet in the troubleshooting lab.</p>

<h3>Loop prevention: ORIGINATOR_ID and CLUSTER_LIST</h3>
<p>Once a router may repeat iBGP routes, loops become possible. Two optional non-transitive attributes protect against that:</p>
<ul>
<li><b>ORIGINATOR_ID</b> is the router ID of the router that first injected the route into the AS. The RR adds it if missing. A router that sees <i>its own</i> router ID there drops the route.</li>
<li><b>CLUSTER_LIST</b> lists the cluster IDs the route has crossed. Each RR prepends its own. An RR that finds <i>its own</i> cluster ID already in the list drops the route. The cluster ID defaults to the RR's router ID.</li>
</ul>
<pre class="out">PE2# show ip bgp 172.16.1.0
BGP routing table entry for 172.16.1.0/24, version 3
  65101
    10.20.255.1 (metric 20) from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      <span class="hl">Originator: 10.20.255.1, Cluster list: 10.20.255.2</span></pre>
<p>Read it: the route was born on 10.20.255.1 (PE1); it was reflected by 10.20.255.2 (the RR), whose router ID is also the cluster ID; the next hop is PE1's loopback, 20 away in the IS-IS metric.</p>

<div class="eg"><p><b>Worked example: session count.</b> A carrier has 40 PEs. Full mesh: 40 x 39 / 2 = 780 sessions. With two RRs and every PE a client of both: 40 x 2 = 80 PE-to-RR sessions plus one RR-to-RR session = 81. The RR numbers stay small even when the PE count doubles.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Marking only one side as client (the other side's routes are then not reflected to it). Expecting the RR to fix the next hop. Forgetting that the RR is a control-plane device only if it is off the forwarding path; in the lab it is in the path, so it still needs its own route to the destination.</p></div>
<div class="exam"><p><b>Exam trap.</b> The client does not know it is a client. <code>route-reflector-client</code> is configured only on the RR. Also: non-client to non-client reflection never happens.</p></div>

<div class="scn"><h4>The reflector that reflected nothing</h4><p>A carrier migrated two PEs to a new RR. Both sessions showed Established and the RR table had both customer routes, yet the PEs saw only their own customers. Neither session had <code>route-reflector-client</code>, so the RR treated both PEs as ordinary iBGP peers and obeyed split horizon: a non-client route is never sent to another non-client. Adding the command for both neighbours fixed it within a minute.</p><p><b>Lesson:</b> an Established session with prefixes received on the RR proves nothing about reflection. Check <code>show ip bgp neighbors</code> for "Route-Reflector Client" on every client.</p></div>

<div class="iv"><p class="q">"What does a route reflector do and how are loops prevented?"</p><p>An RR relaxes iBGP split horizon: it reflects client routes to other clients and non-clients, and non-client routes to clients. It adds ORIGINATOR_ID (the originating router ID) and CLUSTER_LIST (the clusters passed). A router drops a route carrying its own router ID as originator, and an RR drops a route containing its own cluster ID. It does not change the next hop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>route-reflector-client is configured on the RR only.</li>
<li>Client to anyone; non-client to clients; eBGP to everyone.</li>
<li>The RR reflects best paths and leaves next hop unchanged.</li>
<li>ORIGINATOR_ID and CLUSTER_LIST stop reflection loops.</li>
<li>Check <code>show ip bgp neighbors</code> for "Route-Reflector Client".</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 and PE2 are clients of the RR; the route 172.16.1.0/24 is reflected without a PE1-PE2 session.`)),hi:`
<p>Wapas postal analogy par. <b>Route reflector (RR)</b> directory desk hai. Yeh ek hi iBGP router hai jise un routers ke liye split horizon todne ki ijaazat hai jinhe aap apne <b>clients</b> mark karte ho. Clients ko koi special configuration nahi chahiye; woh bas RR se peer karte hain aur use normal iBGP neighbour samajhte hain. Sirf RR configure hota hai.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! RR (lab solution mein bilkul yahi use hota hai)</span>
router bgp 65000
 neighbor 10.20.255.1 remote-as 65000
 neighbor 10.20.255.1 update-source Loopback0
 neighbor 10.20.255.1 route-reflector-client
 neighbor 10.20.255.3 remote-as 65000
 neighbor 10.20.255.3 update-source Loopback0
 neighbor 10.20.255.3 route-reflector-client
<span class="c">! PE1 aur PE2 (clients)</span>
router bgp 65000
 neighbor 10.20.255.2 remote-as 65000
 neighbor 10.20.255.2 update-source Loopback0
 neighbor 10.20.255.2 next-hop-self</pre>

<h3>Reflection rules</h3>
<table class="cmp"><tr><th>RR ne best path kahan se seekha</th><th>RR kise advertise karta hai</th></tr>
<tr><td>eBGP peer</td><td>saare clients aur non-clients</td></tr>
<tr><td>client</td><td>baaki saare clients aur saare non-clients</td></tr>
<tr><td>non-client</td><td>sirf clients</td></tr></table>
<p>Do aur facts. RR har prefix ka sirf <b>best</b> path reflect karta hai. Aur woh jo reflect karta hai uska next hop, AS_PATH, local preference ya MED <b>nahi</b> badalta, isliye PEs par next-hop-self ab bhi chahiye.</p>

@@D@@

<h3>Verify karna ki reflection chal raha hai</h3>
<p>Solution ke baad lab ka real output. RR dikhata hai ki kaun client hai aur kaunse routes aage de raha hai:</p>
<pre class="out">RR# show ip bgp neighbors 10.20.255.1
BGP neighbor is 10.20.255.1,  remote AS 65000, internal link
  BGP state = Established, up for 00:00:35
 For address family: IPv4 Unicast
  <span class="hl">Route-Reflector Client</span>

RR# show ip bgp neighbors 10.20.255.3 advertised-routes
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;i 172.16.1.0/24    10.20.255.1              0    100      0 65101 i
Total number of prefixes 1</pre>
<p>Route PE1 (client) se aaya aur PE2 (doosra client) ko advertise hua. PE1 par <code>route-reflector-client</code> ke bina RR route ko non-client route ki tarah rakhta aur sirf clients ko bhejta. Agar <i>koi bhi</i> PE client nahi hai to kuch bhi reflect nahi hota, jaisa fault troubleshooting lab mein milega.</p>

<h3>Loop prevention: ORIGINATOR_ID aur CLUSTER_LIST</h3>
<p>Jab router iBGP routes repeat kar sakta hai to loops possible ho jaate hain. Do optional non-transitive attributes bachate hain:</p>
<ul>
<li><b>ORIGINATOR_ID</b> us router ka router ID hai jisne route ko pehli baar AS mein daala. RR missing ho to jodta hai. Jo router <i>apna</i> router ID wahan dekhe woh route drop kar deta hai.</li>
<li><b>CLUSTER_LIST</b> un cluster IDs ki list hai jinse route guzra. Har RR apna prepend karta hai. Jo RR list mein <i>apna</i> cluster ID pehle se paaye woh route drop karta hai. Cluster ID default mein RR ka router ID hota hai.</li>
</ul>
<pre class="out">PE2# show ip bgp 172.16.1.0
BGP routing table entry for 172.16.1.0/24, version 3
  65101
    10.20.255.1 (metric 20) from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      <span class="hl">Originator: 10.20.255.1, Cluster list: 10.20.255.2</span></pre>
<p>Padho: route 10.20.255.1 (PE1) par paida hua; 10.20.255.2 (RR) ne reflect kiya, jiska router ID hi cluster ID hai; next hop PE1 ka loopback hai, IS-IS metric mein 20 door.</p>

<div class="eg"><p><b>Worked example: session count.</b> Ek carrier ke 40 PEs hain. Full mesh: 40 x 39 / 2 = 780 sessions. Do RRs ke saath aur har PE dono ka client: 40 x 2 = 80 PE-to-RR sessions aur ek RR-to-RR session = 81. PE count double ho to bhi RR numbers chhote rehte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf ek side ko client mark karna (doosri side ke routes tab us tak reflect nahi hote). RR se next hop theek hone ki ummeed. Yeh bhoolna ki RR sirf tab control-plane device hai jab woh forwarding path se bahar ho; lab mein woh path mein hai, isliye use destination ka apna route chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Client ko pata nahi hota ki woh client hai. <code>route-reflector-client</code> sirf RR par configure hota hai. Aur: non-client se non-client reflection kabhi nahi hota.</p></div>

<div class="scn"><h4>Reflector jo kuch reflect nahi karta tha</h4><p>Ek carrier ne do PEs ko naye RR par migrate kiya. Dono sessions Established dikhe aur RR table mein dono customer routes the, phir bhi PEs ko sirf apne customers dikhe. Kisi session par <code>route-reflector-client</code> nahi tha, isliye RR ne dono PEs ko normal iBGP peers maana aur split horizon follow kiya: non-client route kisi doosre non-client ko kabhi nahi bheja jaata. Dono neighbours par command lagane se ek minute mein fix ho gaya.</p><p><b>Lesson:</b> RR par Established session aur prefixes received reflection ka saboot nahi hain. Har client ke liye <code>show ip bgp neighbors</code> mein "Route-Reflector Client" check karo.</p></div>

<div class="iv"><p class="q">"Route reflector kya karta hai aur loops kaise rokte hain?"</p><p>RR iBGP split horizon ko dheela karta hai: client routes ko doosre clients aur non-clients ko reflect karta hai, aur non-client routes ko clients ko. Woh ORIGINATOR_ID (originating router ID) aur CLUSTER_LIST (guzre clusters) jodta hai. Jo router apna router ID originator ke roop mein dekhe woh route drop karta hai, aur jo RR apna cluster ID list mein dekhe woh drop karta hai. Woh next hop nahi badalta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>route-reflector-client sirf RR par configure hota hai.</li>
<li>Client se sabko; non-client se clients ko; eBGP se sabko.</li>
<li>RR best paths reflect karta hai aur next hop unchanged rakhta hai.</li>
<li>ORIGINATOR_ID aur CLUSTER_LIST reflection loops rokte hain.</li>
<li>"Route-Reflector Client" ke liye <code>show ip bgp neighbors</code> dekho.</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 aur PE2 RR ke clients hain; route 172.16.1.0/24 bina PE1-PE2 session ke reflect hota hai.`))}};export{t as default};