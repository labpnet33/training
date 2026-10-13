var e={id:`route-reflection`,h:{en:`Route reflection: scaling IBGP without a full mesh`,hi:`Route reflection: full mesh ke bina IBGP scale karna`},body:{en:`
<p>IBGP has a loop-prevention rule: <b>a router must not advertise a route learned from an IBGP peer to another IBGP peer</b>. Inside one AS there is no AS path to detect loops, so the rule forces every router to peer with every other router: a <b>full mesh</b> of n x (n-1) / 2 sessions. Ten routers need 45 sessions, a hundred need 4,950. A <b>route reflector</b> (RR, RFC 4456) is a router that is allowed to break the rule for chosen neighbours, so the others peer only with the RR.</p>

<h3>Roles</h3>
<ul>
<li><b>Route reflector:</b> receives IBGP routes and reflects them.</li>
<li><b>Client:</b> an IBGP neighbour of the RR; it needs sessions only to the RR. It does not know it is a client.</li>
<li><b>Non-client:</b> any other IBGP neighbour of the RR, including other RRs. Non-clients still need a full mesh among themselves.</li>
<li><b>Cluster:</b> an RR and its clients.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Route reflector topology">
<rect x="250" y="20" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">RR1</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">cluster 10.100.255.1</text>
<rect x="30" y="140" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="14">C1 client</text>
<rect x="255" y="140" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="14">C2 client</text>
<rect x="480" y="140" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="14">C3 client</text>
<line x1="290" y1="70" x2="120" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="70" x2="520" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="95" y="210" text-anchor="middle" class="svg-muted" font-size="12">learns ISP route</text>
</svg><p class="cap">Three clients, three sessions to the RR, instead of a full mesh.</p></div>

<h3>Reflection rules</h3>
<table class="cmp"><tr><th>Route learned from</th><th>RR advertises it to</th></tr>
<tr><td>EBGP peer</td><td>all clients and all non-clients</td></tr>
<tr><td>Client</td><td>all other clients and all non-clients</td></tr>
<tr><td>Non-client</td><td>clients only</td></tr></table>
<p>The RR reflects only its <b>best</b> route for a prefix. It does not change the next hop, local preference or other attributes. This is why clients still need a next hop they can reach: either the edge router applies <code>next-hop self</code> towards the RR, or the IGP carries the external link.</p>

<h3>Loop prevention: two new attributes</h3>
<ul>
<li><b>ORIGINATOR_ID</b> - the router ID of the router that first injected the route into the AS. A router that sees its own ID in a received route ignores it.</li>
<li><b>CLUSTER_LIST</b> - each RR prepends its <b>cluster ID</b> when reflecting. An RR that sees its own cluster ID in a route drops it.</li>
</ul>
<p>Both attributes are optional non-transitive and are created by the RR; the cluster list also adds to the tie-breakers (shorter cluster list is better).</p>

<h3>Configuring the RR in the lab</h3>
<p>In bgp-rr-design the clients C1-C3 already point to RR1. On RR1 the <code>cluster</code> statement is what turns a group into a group of clients:</p>
<pre class="code">set protocols bgp group CLIENTS type internal
set protocols bgp group CLIENTS local-address 10.100.255.1
set protocols bgp group CLIENTS cluster 10.100.255.1
set protocols bgp group CLIENTS neighbor 10.100.255.11
set protocols bgp group CLIENTS neighbor 10.100.255.12
set protocols bgp group CLIENTS neighbor 10.100.255.13</pre>
<pre class="out">lab@RR1&gt; show bgp summary
Groups: 1 Peers: 3 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.100.255.11         65100          3         3       0       0        0:25 Establ
  inet.0: 2/2/2/0
10.100.255.12         65100          2         4       0       0        0:25 Establ
  inet.0: 0/0/0/0
10.100.255.13         65100          3         3       0       0        0:25 Establ
  inet.0: 1/1/1/0

lab@RR1&gt; show bgp neighbor 10.100.255.11
  Options: &lt;Preference LocalAddress <span class="hl">Cluster</span> AddressFamily PeerAS Refresh&gt;
  <span class="hl">Cluster ID: 10.100.255.1</span></pre>
<p>Now read a reflected route on client C3 (the ISP prefix learned by C1):</p>
<pre class="out">lab@C3&gt; show route 203.0.113.0/24 detail
203.0.113.0/24 (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Next hop type: Indirect
                Source: 10.100.255.1
                Next hop: 10.100.13.1 via ge-0/0/0.0, selected
                Protocol next hop: <span class="hl">10.100.255.11</span>
                AS path: 64496 I (Originator)
                <span class="hl">Cluster list:  10.100.255.1</span>
                <span class="hl">Originator ID: 10.100.255.11</span></pre>
<p>The source is the RR (10.100.255.1) but the originator is C1 (10.100.255.11), and the protocol next hop is still C1's loopback because C1 applied <code>next-hop self</code>. On RR1, <code>show route advertising-protocol bgp 10.100.255.13</code> confirms the next hop is not rewritten: it shows 10.100.255.11 for both ISP prefixes.</p>

<h3>Design points</h3>
<ul>
<li><b>Redundancy:</b> use two RRs. With the <i>same</i> cluster ID on both, each RR drops the other's reflections (less state). With <i>different</i> cluster IDs, clients keep two copies of every route (more resilience, more memory).</li>
<li><b>Hierarchy:</b> RRs can be clients of higher-level RRs. Keep the RR topology congruent with the physical topology, or reflected routes may take suboptimal paths or loop.</li>
<li><b>Client-to-client reflection</b> is on by default. If the clients are already fully meshed, <code>no-client-reflect</code> avoids duplicate work.</li>
<li>The RR is a control-plane device. It does not have to be in the forwarding path, but it should still be reachable by IGP.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Full mesh of 12 routers: 12 x 11 / 2 = 66 sessions, and adding the 13th router touches 12 devices. With one RR pair, 12 clients need 24 client sessions plus one RR-to-RR session. Adding a router means configuring two neighbours on the RRs and two on the new router.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting that the RR does not change the next hop. Clients show the route as hidden because the external next hop is unreachable in the IGP. The fix is next-hop self on the edge (as C1 does in this lab) or advertising the external subnet into the IGP.</p></div>
<div class="exam"><p><b>Exam trap.</b> An RR reflects only its best path. Two RRs in the <i>same</i> cluster must have the same cluster ID. ORIGINATOR_ID and CLUSTER_LIST are the loop-prevention attributes; the AS path is not changed by reflection.</p></div>

<div class="scn"><h4>The campus that outgrew its mesh</h4><p>Konark Media added sites quickly. Each new edge router needed a change on every existing router, and a typo on one of them broke a session for hours. They deployed RR1 as a core route reflector. New sites then needed only one new neighbour on the RR and a session from the site. PC3 behind C3 reached the ISP prefix 203.0.113.1 through the reflected route.</p><p><b>Lesson:</b> route reflection turns a quadratic problem into a linear one.</p></div>

<div class="iv"><p class="q">"How does a route reflector avoid loops?"</p><p>With ORIGINATOR_ID, which stops a route returning to its originator, and CLUSTER_LIST, where each RR adds its cluster ID and discards a route that already has it. Add that the RR reflects only its best route and does not alter the next hop, so the edge must apply next-hop self.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IBGP split horizon forces a full mesh; an RR relaxes it for its clients.</li>
<li>The cluster statement makes a Junos group a set of RR clients.</li>
<li>Reflection rules: from client to all, from non-client to clients only, from EBGP to all.</li>
<li>ORIGINATOR_ID and CLUSTER_LIST prevent loops; the next hop is never changed.</li>
<li>Use two RRs; same cluster ID means less state, different IDs means more resilience.</li>
</ul></div>
`,hi:`
<p>IBGP mein loop-prevention ka rule hai: <b>router IBGP peer se seekha route doosre IBGP peer ko advertise nahi karta</b>. Ek AS ke andar loop pakadne ke liye AS path nahi hota, isliye yeh rule har router ko har doosre router se peer karne par majboor karta hai: n x (n-1) / 2 sessions ka <b>full mesh</b>. Das routers ke liye 45 sessions, sau ke liye 4,950. <b>Route reflector</b> (RR, RFC 4456) woh router hai jise chune hue neighbours ke liye yeh rule todne ki ijaazat hoti hai, isliye baaki sirf RR se peer karte hain.</p>

<h3>Roles</h3>
<ul>
<li><b>Route reflector:</b> IBGP routes leta hai aur unhe reflect karta hai.</li>
<li><b>Client:</b> RR ka IBGP neighbour; use sirf RR se session chahiye. Use pata nahi hota ki woh client hai.</li>
<li><b>Non-client:</b> RR ka koi bhi doosra IBGP neighbour, doosre RRs samet. Non-clients ko aapas mein full mesh chahiye.</li>
<li><b>Cluster:</b> ek RR aur uske clients.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Route reflector topology">
<rect x="250" y="20" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">RR1</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">cluster 10.100.255.1</text>
<rect x="30" y="140" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="14">C1 client</text>
<rect x="255" y="140" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="14">C2 client</text>
<rect x="480" y="140" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="14">C3 client</text>
<line x1="290" y1="70" x2="120" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="70" x2="520" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="95" y="210" text-anchor="middle" class="svg-muted" font-size="12">ISP route seekhta hai</text>
</svg><p class="cap">Full mesh ki jagah teen clients, RR se teen sessions.</p></div>

<h3>Reflection rules</h3>
<table class="cmp"><tr><th>Route kahan se seekha</th><th>RR kise advertise karta hai</th></tr>
<tr><td>EBGP peer</td><td>saare clients aur saare non-clients</td></tr>
<tr><td>Client</td><td>baaki saare clients aur saare non-clients</td></tr>
<tr><td>Non-client</td><td>sirf clients</td></tr></table>
<p>RR kisi prefix ke liye sirf apna <b>best</b> route reflect karta hai. Woh next hop, local preference ya doosre attributes nahi badalta. Isliye clients ko aisa next hop chahiye jo woh reach kar saken: ya to edge router RR ki taraf <code>next-hop self</code> lagata hai, ya IGP external link carry karta hai.</p>

<h3>Loop prevention: do naye attributes</h3>
<ul>
<li><b>ORIGINATOR_ID</b> - us router ka router ID jisne route ko pehli baar AS mein daala. Jo router received route mein apna ID dekhta hai woh use ignore karta hai.</li>
<li><b>CLUSTER_LIST</b> - har RR reflect karte waqt apna <b>cluster ID</b> aage jodta hai. Jo RR route mein apna cluster ID dekhta hai woh use drop karta hai.</li>
</ul>
<p>Dono attributes optional non-transitive hain aur RR banata hai; cluster list tie-breakers mein bhi judti hai (chhoti cluster list behtar).</p>

<h3>Lab mein RR configure karna</h3>
<p>bgp-rr-design mein clients C1-C3 pehle se RR1 ki taraf point karte hain. RR1 par <code>cluster</code> statement group ko clients ka group banata hai:</p>
<pre class="code">set protocols bgp group CLIENTS type internal
set protocols bgp group CLIENTS local-address 10.100.255.1
set protocols bgp group CLIENTS cluster 10.100.255.1
set protocols bgp group CLIENTS neighbor 10.100.255.11
set protocols bgp group CLIENTS neighbor 10.100.255.12
set protocols bgp group CLIENTS neighbor 10.100.255.13</pre>
<pre class="out">lab@RR1&gt; show bgp summary
Groups: 1 Peers: 3 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.100.255.11         65100          3         3       0       0        0:25 Establ
  inet.0: 2/2/2/0
10.100.255.12         65100          2         4       0       0        0:25 Establ
  inet.0: 0/0/0/0
10.100.255.13         65100          3         3       0       0        0:25 Establ
  inet.0: 1/1/1/0

lab@RR1&gt; show bgp neighbor 10.100.255.11
  Options: &lt;Preference LocalAddress <span class="hl">Cluster</span> AddressFamily PeerAS Refresh&gt;
  <span class="hl">Cluster ID: 10.100.255.1</span></pre>
<p>Ab client C3 par reflected route padho (C1 se seekha ISP prefix):</p>
<pre class="out">lab@C3&gt; show route 203.0.113.0/24 detail
203.0.113.0/24 (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Next hop type: Indirect
                Source: 10.100.255.1
                Next hop: 10.100.13.1 via ge-0/0/0.0, selected
                Protocol next hop: <span class="hl">10.100.255.11</span>
                AS path: 64496 I (Originator)
                <span class="hl">Cluster list:  10.100.255.1</span>
                <span class="hl">Originator ID: 10.100.255.11</span></pre>
<p>Source RR (10.100.255.1) hai lekin originator C1 (10.100.255.11) hai, aur protocol next hop ab bhi C1 ka loopback hai kyunki C1 ne <code>next-hop self</code> lagaya. RR1 par <code>show route advertising-protocol bgp 10.100.255.13</code> confirm karta hai ki next hop rewrite nahi hua: dono ISP prefixes ke liye 10.100.255.11 dikhta hai.</p>

<h3>Design points</h3>
<ul>
<li><b>Redundancy:</b> do RRs lagao. Dono par <i>same</i> cluster ID ho to har RR doosre ke reflections drop karta hai (kam state). <i>Alag</i> cluster IDs ho to clients har route ki do copies rakhte hain (zyada resilience, zyada memory).</li>
<li><b>Hierarchy:</b> RRs higher-level RRs ke clients ho sakte hain. RR topology ko physical topology ke saath congruent rakho, warna reflected routes suboptimal paths ya loops le sakte hain.</li>
<li><b>Client-to-client reflection</b> default mein on hai. Agar clients pehle se full mesh mein hain to <code>no-client-reflect</code> duplicate kaam bachata hai.</li>
<li>RR control-plane device hai. Use forwarding path mein hona zaroori nahi, lekin IGP se reachable hona chahiye.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 12 routers ka full mesh: 12 x 11 / 2 = 66 sessions, aur 13va router jodne se 12 devices chhune padte hain. Ek RR pair ke saath 12 clients ko 24 client sessions aur ek RR-to-RR session chahiye. Router jodne ka matlab RRs par do neighbours aur naye router par do configure karna.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh bhoolna ki RR next hop nahi badalta. Clients route ko hidden dikhate hain kyunki external next hop IGP mein unreachable hai. Fix edge par next-hop self hai (jaise is lab mein C1 karta hai) ya external subnet ko IGP mein advertise karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> RR sirf best path reflect karta hai. <i>Same</i> cluster ke do RRs ka cluster ID same hona chahiye. ORIGINATOR_ID aur CLUSTER_LIST loop-prevention attributes hain; reflection se AS path nahi badalta.</p></div>

<div class="scn"><h4>Campus jo apne mesh se bada ho gaya</h4><p>Konark Media ne tezi se sites jode. Har naye edge router ke liye har maujooda router par change chahiye tha, aur ek par typo se session ghanton toota raha. Unhone RR1 ko core route reflector banaya. Ab naye site ke liye RR par ek neighbour aur site se ek session kaafi tha. C3 ke peeche PC3 reflected route ke zariye ISP prefix 203.0.113.1 tak pahuncha.</p><p><b>Lesson:</b> route reflection quadratic problem ko linear bana deta hai.</p></div>

<div class="iv"><p class="q">"Route reflector loops se kaise bachta hai?"</p><p>ORIGINATOR_ID se, jo route ko apne originator tak lautne se rokta hai, aur CLUSTER_LIST se, jahan har RR apna cluster ID jodta hai aur jis route mein woh pehle se ho use discard karta hai. Yeh jodo ki RR sirf best route reflect karta hai aur next hop nahi badalta, isliye edge ko next-hop self lagana padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IBGP split horizon full mesh maangta hai; RR apne clients ke liye ise dheela karta hai.</li>
<li>cluster statement Junos group ko RR clients ka set banata hai.</li>
<li>Reflection rules: client se sabko, non-client se sirf clients ko, EBGP se sabko.</li>
<li>ORIGINATOR_ID aur CLUSTER_LIST loops rokte hain; next hop kabhi nahi badalta.</li>
<li>Do RRs lagao; same cluster ID = kam state, alag IDs = zyada resilience.</li>
</ul></div>
`}};export{e as default};