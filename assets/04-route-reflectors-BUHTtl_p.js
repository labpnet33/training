var e={id:`route-reflectors`,h:{en:`Route reflectors: clients, non-clients, ORIGINATOR_ID and CLUSTER_LIST`,hi:`Route reflectors: clients, non-clients, ORIGINATOR_ID aur CLUSTER_LIST`},body:{en:`
<p>Back to the office with the "never pass news to a colleague" rule. With five people, everyone can phone everyone. With fifty, nobody gets any work done. So the company appoints a <b>head office noticeboard</b>: one person is officially allowed to repeat news to everyone, and stamps each notice with "originally from X, posted by board Y" so that nothing is posted twice. That person is a <b>route reflector</b> (RR).</p>

<h3>The vocabulary</h3>
<dl class="terms">
<dt>Route reflector</dt><dd>An iBGP router allowed to break the split-horizon rule for its clients. Configured with <code>neighbor X route-reflector-client</code>.</dd>
<dt>Client</dt><dd>An iBGP peer that the RR has marked as a client. The client itself needs <b>no special configuration</b>; it simply peers with the RR and does not know it is a client.</dd>
<dt>Non-client</dt><dd>A normal iBGP peer of the RR, not marked as client. Non-clients must still be fully meshed with each other and with the RR.</dd>
<dt>Cluster</dt><dd>The RR plus its clients, identified by a <b>cluster ID</b> (the RR's router ID by default, or <code>bgp cluster-id</code>).</dd>
</dl>

<h3>The three reflection rules</h3>
<table class="cmp"><tr><th>RR learned the best path from</th><th>RR advertises it to</th></tr>
<tr><td>An eBGP peer</td><td>All clients and all non-clients (normal behaviour)</td></tr>
<tr><td>A client</td><td>All other clients and all non-clients (and eBGP peers)</td></tr>
<tr><td>A non-client</td><td><b>Clients only</b> (and eBGP peers), never other non-clients</td></tr>
</table>
<p>Two details matter. The RR reflects only its <b>best</b> path for each prefix, so clients may see fewer paths than in a full mesh. And the RR <b>does not change</b> the next hop, AS_PATH, local preference or MED of a reflected route. Your edge routers therefore still need next-hop-self (or IGP reachability to external next hops).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Route reflector cluster">
<rect x="250" y="20" width="140" height="54" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">CORE = RR</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">cluster 10.255.0.2</text>
<rect x="60" y="160" width="140" height="54" rx="8" fill="#bae6fd"/><text x="130" y="184" text-anchor="middle" class="svg-ink" font-size="14">EDGE (client)</text><text x="130" y="202" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<rect x="440" y="160" width="140" height="54" rx="8" fill="#bae6fd"/><text x="510" y="184" text-anchor="middle" class="svg-ink" font-size="14">BRANCH (client)</text><text x="510" y="202" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.3</text>
<line x1="280" y1="74" x2="150" y2="160" stroke="#64748b" stroke-width="2"/><line x1="360" y1="74" x2="490" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="180" y="112" class="svg-accent" font-size="12">iBGP</text><text x="430" y="112" class="svg-accent" font-size="12">iBGP</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">no EDGE-BRANCH session</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">2 sessions instead of 3; with 20 routers, 19 instead of 190</text>
</svg><p class="cap">The Meridian network redesigned with CORE as route reflector. EDGE and BRANCH are clients and do not peer with each other.</p></div>

<h3>Loop prevention: ORIGINATOR_ID and CLUSTER_LIST</h3>
<p>Once a router may repeat iBGP routes, loops become possible again, so reflection adds two optional non-transitive attributes:</p>
<ul>
<li><b>ORIGINATOR_ID</b>: the router ID of the router that first brought the route into the AS. The RR sets it when reflecting (if not already present). A router that receives a route carrying <b>its own router ID</b> as originator discards it.</li>
<li><b>CLUSTER_LIST</b>: a list of cluster IDs the route has passed through. Each RR prepends its cluster ID. An RR that sees <b>its own cluster ID</b> in the list discards the route.</li>
</ul>
<p>Both also appear in best-path selection: for reflected routes the ORIGINATOR_ID is used in place of the router ID in the tie-breaker, and a shorter CLUSTER_LIST is preferred just before the lowest neighbor address step.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! CORE becomes the RR; EDGE and BRANCH are clients</span>
router bgp 65300
 neighbor 10.255.0.1 remote-as 65300
 neighbor 10.255.0.1 update-source Loopback0
 neighbor 10.255.0.1 route-reflector-client
 neighbor 10.255.0.3 remote-as 65300
 neighbor 10.255.0.3 update-source Loopback0
 neighbor 10.255.0.3 route-reflector-client
<span class="c">! EDGE: ordinary iBGP to CORE only, plus next-hop-self (the RR will not fix next hops)</span>
router bgp 65300
 neighbor 10.255.0.2 remote-as 65300
 neighbor 10.255.0.2 update-source Loopback0
 neighbor 10.255.0.2 next-hop-self</pre>

<h3>Verification</h3>
<pre class="out">BRANCH# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 7
Paths: (1 available, best #1, table default)
  Not advertised to any peer
  Refresh Epoch 1
  64999
    10.255.0.1 (metric 3) from 10.255.0.2 (10.255.0.2)
      Origin IGP, metric 0, localpref 100, valid, internal, best
<span class="hl">      Originator: 10.255.0.1, Cluster list: 10.255.0.2</span>

CORE# show ip bgp neighbors 10.255.0.3 | include Reflector
<span class="hl">  Route-Reflector Client</span></pre>
<p>Read the first output carefully: the route came <i>from</i> 10.255.0.2 (the RR), but the next hop is still 10.255.0.1 (EDGE, thanks to EDGE's next-hop-self). The originator is EDGE, and the cluster list shows it passed through one cluster. On the RR itself, routes from clients are labelled <code>(Received from a RR-client)</code>.</p>

<div class="eg"><p><b>Worked example.</b> Add a non-client router MON (10.255.0.9) that peers with CORE only. MON originates 10.99.0.0/16. CORE learned it from a non-client, so CORE reflects it to EDGE and BRANCH (clients) but would not send it to another non-client. EDGE, a client, sends 203.0.113.0/24 to CORE; CORE reflects it to BRANCH (client) and MON (non-client). MON therefore reaches the Internet without any session to EDGE.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Marking the client on the wrong router (the <code>route-reflector-client</code> keyword belongs on the RR). Removing the EDGE-BRANCH session before the RR configuration is in place, creating an outage. Expecting <code>next-hop-self</code> on the RR to rewrite reflected routes: on IOS XE it applies to eBGP-learned routes; for reflected iBGP routes the newer <code>next-hop-self all</code> keyword is required, and it changes the forwarding path through the RR.</p></div>

<div class="exam"><p><b>Exam traps.</b> A route from a non-client is never reflected to another non-client. Clients need no special configuration. The RR changes neither next hop nor attributes. Default cluster ID = RR router ID. Multiple RRs per cluster, confederations and dynamic peers are excluded from ENARSI 1.10, so expect single-RR questions.</p></div>

<div class="scn"><h4>The monitoring server that saw half the network</h4><p>A provider added a new route reflector and moved all access routers to it as clients. The NOC monitoring router was left as a non-client peered only with the RR, and another data-center router was also a non-client. Prefixes originated by the data-center router never reached the monitoring router. The RR was correctly refusing to reflect non-client routes to another non-client. Marking the monitoring router as a client fixed it.</p><p><b>Lesson:</b> list every peer of an RR as client or non-client and check the three reflection rules.</p></div>

<div class="iv"><p class="q">"How does a route reflector prevent loops?"</p><p>Mention both attributes: ORIGINATOR_ID (router ID of the router that injected the route into the AS; a router drops updates carrying its own ID) and CLUSTER_LIST (each RR prepends its cluster ID; an RR drops updates that already contain its own). Add that both are optional non-transitive, never leave the AS, and act as tie-breakers in best-path selection. Bonus: the RR reflects only its best path and does not change the next hop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An RR relaxes iBGP split horizon: clients peer only with the RR.</li>
<li>From client or eBGP: to everyone; from non-client: to clients only.</li>
<li>The RR reflects its best path and does not change next hop, AS_PATH, local preference or MED.</li>
<li>ORIGINATOR_ID and CLUSTER_LIST prevent loops; default cluster ID is the RR router ID.</li>
<li>Only the RR needs configuration: <code>neighbor X route-reflector-client</code>.</li>
</ul></div>
`,hi:`
<p>Wapas us office par chalo jahan "colleague ko kabhi khabar mat do" wala rule hai. Paanch logon ke saath sab ek dusre ko phone kar sakte hain. Pachaas ke saath koi kaam hi nahi hoga. Isliye company ek <b>head office noticeboard</b> banati hai: ek insaan ko officially sabko khabar dohraane ki ijaazat hai, aur woh har notice par "originally X se, board Y ne lagaya" ki mohar lagata hai taaki kuch bhi do baar na lage. Woh insaan <b>route reflector</b> (RR) hai.</p>

<h3>Vocabulary</h3>
<dl class="terms">
<dt>Route reflector</dt><dd>Ek iBGP router jise apne clients ke liye split-horizon rule todne ki ijaazat hai. <code>neighbor X route-reflector-client</code> se configure hota hai.</dd>
<dt>Client</dt><dd>Woh iBGP peer jise RR ne client mark kiya. Client ko khud <b>koi special configuration nahi chahiye</b>; woh bas RR se peer karta hai aur use pata bhi nahi ki woh client hai.</dd>
<dt>Non-client</dt><dd>RR ka normal iBGP peer, client mark nahi hua. Non-clients ko abhi bhi aapas mein aur RR ke saath full mesh chahiye.</dd>
<dt>Cluster</dt><dd>RR plus uske clients, ek <b>cluster ID</b> se pehchane jaate hain (default mein RR ka router ID, ya <code>bgp cluster-id</code>).</dd>
</dl>

<h3>Teen reflection rules</h3>
<table class="cmp"><tr><th>RR ne best path kahan se seekha</th><th>RR ise kisko advertise karta hai</th></tr>
<tr><td>eBGP peer se</td><td>Saare clients aur saare non-clients (normal behaviour)</td></tr>
<tr><td>Client se</td><td>Baaki saare clients aur saare non-clients (aur eBGP peers)</td></tr>
<tr><td>Non-client se</td><td><b>Sirf clients</b> (aur eBGP peers), dusre non-clients ko kabhi nahi</td></tr>
</table>
<p>Do details important hain. RR har prefix ka sirf apna <b>best</b> path reflect karta hai, isliye clients ko full mesh se kam paths dikh sakte hain. Aur RR reflected route ka next hop, AS_PATH, local preference ya MED <b>nahi badalta</b>. Isliye aapke edge routers ko abhi bhi next-hop-self (ya external next hops tak IGP reachability) chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Route reflector cluster">
<rect x="250" y="20" width="140" height="54" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">CORE = RR</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">cluster 10.255.0.2</text>
<rect x="60" y="160" width="140" height="54" rx="8" fill="#bae6fd"/><text x="130" y="184" text-anchor="middle" class="svg-ink" font-size="14">EDGE (client)</text><text x="130" y="202" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<rect x="440" y="160" width="140" height="54" rx="8" fill="#bae6fd"/><text x="510" y="184" text-anchor="middle" class="svg-ink" font-size="14">BRANCH (client)</text><text x="510" y="202" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.3</text>
<line x1="280" y1="74" x2="150" y2="160" stroke="#64748b" stroke-width="2"/><line x1="360" y1="74" x2="490" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="180" y="112" class="svg-accent" font-size="12">iBGP</text><text x="430" y="112" class="svg-accent" font-size="12">iBGP</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">EDGE-BRANCH session nahi</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">3 ki jagah 2 sessions; 20 routers par 190 ki jagah 19</text>
</svg><p class="cap">Meridian network CORE ko route reflector bana kar redesign kiya gaya. EDGE aur BRANCH clients hain aur aapas mein peer nahi karte.</p></div>

<h3>Loop prevention: ORIGINATOR_ID aur CLUSTER_LIST</h3>
<p>Jab ek router iBGP routes dohra sakta hai, loops phir possible ho jaate hain, isliye reflection do optional non-transitive attributes jodta hai:</p>
<ul>
<li><b>ORIGINATOR_ID</b>: us router ka router ID jo route ko sabse pehle AS mein laaya. RR reflect karte waqt ise set karta hai (agar pehle se nahi hai). Jo router aisa route receive kare jismein originator <b>uska apna router ID</b> ho, woh use discard kar deta hai.</li>
<li><b>CLUSTER_LIST</b>: un cluster IDs ki list jinse route guzra. Har RR apna cluster ID prepend karta hai. Jo RR list mein <b>apna cluster ID</b> dekhe, woh route discard karta hai.</li>
</ul>
<p>Dono best-path selection mein bhi aate hain: reflected routes ke liye tie-breaker mein router ID ki jagah ORIGINATOR_ID use hota hai, aur lowest neighbor address step se theek pehle chhoti CLUSTER_LIST prefer hoti hai.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! CORE RR banta hai; EDGE aur BRANCH clients hain</span>
router bgp 65300
 neighbor 10.255.0.1 remote-as 65300
 neighbor 10.255.0.1 update-source Loopback0
 neighbor 10.255.0.1 route-reflector-client
 neighbor 10.255.0.3 remote-as 65300
 neighbor 10.255.0.3 update-source Loopback0
 neighbor 10.255.0.3 route-reflector-client
<span class="c">! EDGE: sirf CORE tak ordinary iBGP, plus next-hop-self (RR next hops fix nahi karega)</span>
router bgp 65300
 neighbor 10.255.0.2 remote-as 65300
 neighbor 10.255.0.2 update-source Loopback0
 neighbor 10.255.0.2 next-hop-self</pre>

<h3>Verification</h3>
<pre class="out">BRANCH# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 7
Paths: (1 available, best #1, table default)
  Not advertised to any peer
  Refresh Epoch 1
  64999
    10.255.0.1 (metric 3) from 10.255.0.2 (10.255.0.2)
      Origin IGP, metric 0, localpref 100, valid, internal, best
<span class="hl">      Originator: 10.255.0.1, Cluster list: 10.255.0.2</span>

CORE# show ip bgp neighbors 10.255.0.3 | include Reflector
<span class="hl">  Route-Reflector Client</span></pre>
<p>Pehla output dhyan se padho: route 10.255.0.2 (RR) <i>se</i> aaya, par next hop abhi bhi 10.255.0.1 (EDGE, EDGE ke next-hop-self ki wajah se) hai. Originator EDGE hai, aur cluster list dikhati hai ki route ek cluster se guzra. RR par khud, clients se aaye routes par <code>(Received from a RR-client)</code> label hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek non-client router MON (10.255.0.9) jodo jo sirf CORE se peer karta hai. MON 10.99.0.0/16 originate karta hai. CORE ne ise non-client se seekha, isliye CORE ise EDGE aur BRANCH (clients) ko reflect karta hai par kisi dusre non-client ko nahi bhejega. EDGE, ek client, 203.0.113.0/24 CORE ko bhejta hai; CORE ise BRANCH (client) aur MON (non-client) ko reflect karta hai. Isliye MON bina EDGE se session ke Internet tak pahunch jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Client ko galat router par mark karna (<code>route-reflector-client</code> keyword RR par lagta hai). RR configuration lagne se pehle EDGE-BRANCH session hata dena, jisse outage hota hai. RR par <code>next-hop-self</code> se reflected routes rewrite hone ki umeed: IOS XE par yeh eBGP se seekhe routes par lagta hai; reflected iBGP routes ke liye naya <code>next-hop-self all</code> keyword chahiye, aur woh forwarding path ko RR ke through badal deta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Non-client se aaya route kabhi dusre non-client ko reflect nahi hota. Clients ko koi special configuration nahi chahiye. RR na next hop badalta hai na attributes. Default cluster ID = RR router ID. Ek cluster mein multiple RRs, confederations aur dynamic peers ENARSI 1.10 se bahar hain, isliye single-RR questions expect karo.</p></div>

<div class="scn"><h4>Monitoring server jo aadha network dekhta tha</h4><p>Ek provider ne naya route reflector joda aur saare access routers ko uske clients bana diya. NOC monitoring router ko non-client chhod diya gaya jo sirf RR se peer karta tha, aur ek aur data-center router bhi non-client tha. Data-center router ke originate kiye prefixes monitoring router tak kabhi nahi pahunche. RR sahi tarah non-client routes ko dusre non-client ko reflect karne se mana kar raha tha. Monitoring router ko client mark karne se fix ho gaya.</p><p><b>Seekh:</b> RR ke har peer ko client ya non-client mein list karo aur teen reflection rules check karo.</p></div>

<div class="iv"><p class="q">"Route reflector loops kaise rokta hai?"</p><p>Dono attributes batao: ORIGINATOR_ID (us router ka router ID jisne route AS mein daala; router apna ID wale updates drop karta hai) aur CLUSTER_LIST (har RR apna cluster ID prepend karta hai; RR aise updates drop karta hai jismein uska apna ID pehle se ho). Jodo ki dono optional non-transitive hain, AS se bahar kabhi nahi jaate, aur best-path selection mein tie-breakers ka kaam karte hain. Bonus: RR sirf apna best path reflect karta hai aur next hop nahi badalta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RR iBGP split horizon ko dheela karta hai: clients sirf RR se peer karte hain.</li>
<li>Client ya eBGP se: sabko; non-client se: sirf clients ko.</li>
<li>RR apna best path reflect karta hai aur next hop, AS_PATH, local preference ya MED nahi badalta.</li>
<li>ORIGINATOR_ID aur CLUSTER_LIST loops rokte hain; default cluster ID RR ka router ID hai.</li>
<li>Sirf RR ko configuration chahiye: <code>neighbor X route-reflector-client</code>.</li>
</ul></div>
`}};export{e as default};