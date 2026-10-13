var e={id:`eigrp-bgp`,h:{en:`EIGRP and BGP over DMVPN`,hi:`DMVPN par EIGRP aur BGP`},body:{en:`
<p>Every routing protocol behaves slightly strangely on an NBMA cloud, because it was designed for links where "the interface I learned a route on" means "the neighbour I learned it from". On a DMVPN hub, one interface faces hundreds of neighbours. The rules that stop loops on a point-to-point link now stop spokes from learning about each other. This chapter covers EIGRP and BGP; OSPF gets its own chapter next.</p>

<h3>EIGRP: two knobs on the hub</h3>
<p>Recall from the ENARSI EIGRP module that <b>split horizon</b> forbids advertising a route out of the interface it was learned on. The hub learns 10.2.2.0/24 from SPOKE1 on Tunnel0 and would have to advertise it to SPOKE2 out of Tunnel0, so split horizon blocks it. Second, by default EIGRP sets <b>itself as next hop</b> when it advertises a route (next-hop-self), which is fine for phase 1 and 3 but kills phase 2.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EIGRP split horizon and next-hop-self on a DMVPN hub">
<defs><marker id="e8e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24</text>
<rect x="260" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">HUB</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">one Tunnel0</text>
<rect x="500" y="80" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">learns 10.2.2.0/24?</text>
<line x1="140" y1="105" x2="256" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#e8e)"/><text x="198" y="96" text-anchor="middle" class="svg-muted" font-size="12">update</text>
<line x1="380" y1="105" x2="496" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#e8e)"/>
<text x="440" y="30" text-anchor="middle" class="svg-accent" font-size="12">split horizon ON: not sent</text>
<text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">no split-horizon: sent</text>
<text x="440" y="165" text-anchor="middle" class="svg-ink" font-size="12">next-hop-self: via 172.16.100.1</text>
<text x="440" y="185" text-anchor="middle" class="svg-ink" font-size="12">no next-hop-self: via 172.16.100.2</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">phase 2 needs both: no split-horizon + no next-hop-self</text>
</svg><p class="cap">Split horizon decides whether SPOKE2 hears the route; next-hop-self decides which next hop it sees.</p></div>

<table class="cmp"><tr><th>Phase</th><th>Split horizon on hub Tunnel0</th><th>Next-hop-self on hub</th><th>Summary / default from hub</th></tr>
<tr><td>1</td><td>Disable it, <b>or</b> keep it and send a summary/default</td><td>Leave on</td><td>Recommended</td></tr>
<tr><td>2</td><td><b>Disable</b> (spokes need every prefix)</td><td><b>Disable</b> (keep the spoke as next hop)</td><td>Not allowed</td></tr>
<tr><td>3</td><td>Keep on if the hub sends a summary/default; disable only if spokes need specifics</td><td>Leave on</td><td>Recommended</td></tr></table>

<pre class="code"><span class="c">! Phase 2, classic mode on the HUB</span>
interface Tunnel0
 bandwidth 10000
 no ip split-horizon eigrp 100
 no ip next-hop-self eigrp 100
router eigrp 100
 network 172.16.100.0 0.0.0.255
 network 10.1.1.0 0.0.0.255
<span class="c">! Same thing in named mode</span>
router eigrp NK
 address-family ipv4 unicast autonomous-system 100
  af-interface Tunnel0
   no split-horizon
   no next-hop-self
  exit-af-interface
<span class="c">! Phase 3 (or 1): keep defaults and summarise instead</span>
  af-interface Tunnel0
   summary-address 10.0.0.0 255.0.0.0
<span class="c">! Spokes: never transit, never queried</span>
router eigrp 100
 eigrp stub connected summary</pre>
<p>Two practical details. EIGRP by default uses at most 50% of the interface bandwidth for its own packets; with the tunnel default of 100 kbit/s, a hub with many spokes paces updates painfully slowly, so set <code>bandwidth</code> on the tunnel. And make spokes <b>EIGRP stub</b>: the hub will not query them during convergence, and a dual-homed spoke will never become a transit path.</p>

<h3>BGP over DMVPN and dynamic neighbours</h3>
<p>The ENARSI blueprint lists "dynamic neighbor" for DMVPN. It has two meanings, and you should know both. First, the <b>NHRP</b> meaning: the hub learns spokes dynamically from registration. Second, the <b>BGP</b> meaning: the hub accepts BGP sessions from any address in a range, so it needs no per-spoke <code>neighbor</code> statement, just like NHRP needs no per-spoke map.</p>
<pre class="code"><span class="c">! HUB: iBGP route reflector with dynamic neighbours (AS 65000)</span>
router bgp 65000
 bgp listen range 172.16.100.0/24 peer-group SPOKES
 bgp listen limit 200
 neighbor SPOKES peer-group
 neighbor SPOKES remote-as 65000
 address-family ipv4
  neighbor SPOKES activate
  neighbor SPOKES route-reflector-client
<span class="c">! SPOKE1: a normal static neighbour pointing at the hub</span>
router bgp 65000
 neighbor 172.16.100.1 remote-as 65000
 address-family ipv4
  network 10.2.2.0 mask 255.255.255.0
  neighbor 172.16.100.1 activate</pre>
<pre class="out">HUB# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">*172.16.100.2    4        65000      12      14        5    0    0 00:05:31        1</span>
*172.16.100.3    4        65000      11      14        5    0    0 00:05:02        1
* Dynamically created based on a listen range command
Dynamically created neighbors: 2, Subnet ranges: 1</pre>
<p>The hub is <b>passive</b> for listen-range peers: it never opens the TCP session, so the spokes must be configured with the hub as neighbour. For phase 2, iBGP is convenient: a route reflector does <b>not</b> change the next hop of reflected routes, so SPOKE2 sees 10.2.2.0/24 via 172.16.100.2. For phase 3, the hub can advertise an aggregate or <code>neighbor SPOKES default-originate</code>. With eBGP (a different AS per spoke, using <code>remote-as 65001 alternate-as 65002 65003</code>) the hub rewrites the next hop to itself, which suits phase 3 but not phase 2.</p>

<div class="eg"><p><b>Worked example.</b> Phase 2 with EIGRP, but the hub has only <code>no ip split-horizon eigrp 100</code>. SPOKE1's table: <code>D 10.3.3.0/24 [90/...] via 172.16.100.1</code>. Spoke-to-spoke never forms. Add <code>no ip next-hop-self eigrp 100</code> and the route becomes <code>via 172.16.100.3</code>; the next ping triggers resolution and a D entry appears in <code>show dmvpn</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Disabling split horizon on the spoke instead of the hub (it does nothing useful there). Putting <code>no ip next-hop-self</code> without <code>no ip split-horizon</code> (spokes still learn nothing). Forgetting that a BGP listen range only accepts; nothing comes up until the spokes point at the hub.</p></div>

<div class="exam"><p><b>Exam trap.</b> For EIGRP phase 2 you need <b>both</b> <code>no ip split-horizon eigrp</code> and <code>no ip next-hop-self eigrp</code> on the <b>hub</b> tunnel. For phase 3 neither is required when the hub summarises. <code>bgp listen range</code> requires a peer-group, and dynamic neighbours show with an asterisk in <code>show ip bgp summary</code>.</p></div>

<div class="scn"><h4>The spoke that became a transit</h4><p>A branch with two routers on two DMVPN clouds suddenly carried traffic between the two clouds, saturating its small links. Both branch routers redistributed and re-advertised every EIGRP route back to the hubs. Configuring <code>eigrp stub connected summary</code> on all spokes stopped them from advertising learned routes, removed them from hub queries and restored the intended paths.</p><p><b>Lesson:</b> spokes should be EIGRP stubs; the hub should be the only router that re-advertises routes into the cloud.</p></div>

<div class="iv"><p class="q">"What must you change for EIGRP to support DMVPN phase 2, and why is phase 3 easier?"</p><p>Strong answer: on the hub tunnel, disable split horizon so spoke routes are re-advertised to other spokes, and disable next-hop-self so the original spoke remains the next hop and triggers NHRP resolution; no summarisation. In phase 3 the hub can keep defaults and send a summary or default because NHRP redirects and shortcuts create the direct path. Add that spokes should be stubs and the tunnel bandwidth should be set.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP phase 2: hub needs <code>no ip split-horizon eigrp</code> + <code>no ip next-hop-self eigrp</code>; no summaries.</li>
<li>EIGRP phase 1/3: keep defaults and send a summary or default from the hub.</li>
<li>Make spokes EIGRP stubs and set tunnel bandwidth (EIGRP uses max 50% of it).</li>
<li>BGP dynamic neighbours: <code>bgp listen range ... peer-group</code>; the hub is passive.</li>
<li>iBGP route reflectors keep the next hop (good for phase 2); eBGP rewrites it (fine for phase 3).</li>
</ul></div>
`,hi:`
<p>Har routing protocol NBMA cloud par thoda ajeeb behave karta hai, kyunki woh aise links ke liye design hua tha jahan "jis interface par route seekha" ka matlab hai "jis neighbour se seekha". DMVPN hub par ek interface saikdon neighbours ki taraf hai. Point-to-point link par loops rokne wale rules ab spokes ko ek doosre ke baare mein seekhne se rokte hain. Yeh chapter EIGRP aur BGP cover karta hai; OSPF ko agla chapter milta hai.</p>

<h3>EIGRP: hub par do knobs</h3>
<p>ENARSI EIGRP module se yaad karo ki <b>split horizon</b> route ko usi interface se advertise karne se rokta hai jahan woh seekha gaya. Hub SPOKE1 se 10.2.2.0/24 Tunnel0 par seekhta hai aur use SPOKE2 ko Tunnel0 se hi advertise karna hoga, isliye split horizon use block kar deta hai. Doosra, default mein EIGRP route advertise karte waqt <b>khud ko next hop</b> set karta hai (next-hop-self), jo phase 1 aur 3 ke liye theek hai lekin phase 2 ko khatam kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DMVPN hub par EIGRP split horizon aur next-hop-self">
<defs><marker id="e8h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24</text>
<rect x="260" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">HUB</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">ek Tunnel0</text>
<rect x="500" y="80" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24 seekhega?</text>
<line x1="140" y1="105" x2="256" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#e8h)"/><text x="198" y="96" text-anchor="middle" class="svg-muted" font-size="12">update</text>
<line x1="380" y1="105" x2="496" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#e8h)"/>
<text x="440" y="30" text-anchor="middle" class="svg-accent" font-size="12">split horizon ON: nahi bheja</text>
<text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">no split-horizon: bheja</text>
<text x="440" y="165" text-anchor="middle" class="svg-ink" font-size="12">next-hop-self: via 172.16.100.1</text>
<text x="440" y="185" text-anchor="middle" class="svg-ink" font-size="12">no next-hop-self: via 172.16.100.2</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">phase 2 ko dono chahiye: no split-horizon + no next-hop-self</text>
</svg><p class="cap">Split horizon decide karta hai ki SPOKE2 route sunega ya nahi; next-hop-self decide karta hai ki use kaunsa next hop dikhega.</p></div>

<table class="cmp"><tr><th>Phase</th><th>Hub Tunnel0 par split horizon</th><th>Hub par next-hop-self</th><th>Hub se summary / default</th></tr>
<tr><td>1</td><td>Disable karo, <b>ya</b> rakho aur summary/default bhejo</td><td>On rehne do</td><td>Recommended</td></tr>
<tr><td>2</td><td><b>Disable</b> (spokes ko har prefix chahiye)</td><td><b>Disable</b> (spoke ko next hop rakho)</td><td>Allowed nahi</td></tr>
<tr><td>3</td><td>Hub summary/default bheje to on rakho; sirf tab disable karo jab spokes ko specifics chahiye</td><td>On rehne do</td><td>Recommended</td></tr></table>

<pre class="code"><span class="c">! Phase 2, HUB par classic mode</span>
interface Tunnel0
 bandwidth 10000
 no ip split-horizon eigrp 100
 no ip next-hop-self eigrp 100
router eigrp 100
 network 172.16.100.0 0.0.0.255
 network 10.1.1.0 0.0.0.255
<span class="c">! Named mode mein wahi cheez</span>
router eigrp NK
 address-family ipv4 unicast autonomous-system 100
  af-interface Tunnel0
   no split-horizon
   no next-hop-self
  exit-af-interface
<span class="c">! Phase 3 (ya 1): defaults rakho aur summarise karo</span>
  af-interface Tunnel0
   summary-address 10.0.0.0 255.0.0.0
<span class="c">! Spokes: kabhi transit nahi, kabhi query nahi</span>
router eigrp 100
 eigrp stub connected summary</pre>
<p>Do practical details. EIGRP default mein apne packets ke liye interface bandwidth ka zyada se zyada 50% use karta hai; tunnel ke default 100 kbit/s ke saath, kai spokes wala hub updates bahut dheere bhejta hai, isliye tunnel par <code>bandwidth</code> set karo. Aur spokes ko <b>EIGRP stub</b> banao: convergence ke dauraan hub unhe query nahi karega, aur dual-homed spoke kabhi transit path nahi banega.</p>

<h3>DMVPN par BGP aur dynamic neighbours</h3>
<p>ENARSI blueprint DMVPN ke liye "dynamic neighbor" list karta hai. Iske do matlab hain, aur dono aane chahiye. Pehla, <b>NHRP</b> wala matlab: hub registration se spokes ko dynamically seekhta hai. Doosra, <b>BGP</b> wala matlab: hub ek range ke kisi bhi address se BGP sessions accept karta hai, isliye use har spoke ke liye <code>neighbor</code> statement nahi chahiye, bilkul waise hi jaise NHRP ko har spoke ki map nahi chahiye.</p>
<pre class="code"><span class="c">! HUB: dynamic neighbours ke saath iBGP route reflector (AS 65000)</span>
router bgp 65000
 bgp listen range 172.16.100.0/24 peer-group SPOKES
 bgp listen limit 200
 neighbor SPOKES peer-group
 neighbor SPOKES remote-as 65000
 address-family ipv4
  neighbor SPOKES activate
  neighbor SPOKES route-reflector-client
<span class="c">! SPOKE1: hub ki taraf normal static neighbour</span>
router bgp 65000
 neighbor 172.16.100.1 remote-as 65000
 address-family ipv4
  network 10.2.2.0 mask 255.255.255.0
  neighbor 172.16.100.1 activate</pre>
<pre class="out">HUB# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">*172.16.100.2    4        65000      12      14        5    0    0 00:05:31        1</span>
*172.16.100.3    4        65000      11      14        5    0    0 00:05:02        1
* Dynamically created based on a listen range command
Dynamically created neighbors: 2, Subnet ranges: 1</pre>
<p>Listen-range peers ke liye hub <b>passive</b> hai: woh kabhi TCP session nahi kholta, isliye spokes par hub ko neighbour configure karna zaroori hai. Phase 2 ke liye iBGP convenient hai: route reflector reflected routes ka next hop <b>nahi</b> badalta, isliye SPOKE2 ko 10.2.2.0/24 via 172.16.100.2 dikhta hai. Phase 3 ke liye hub aggregate ya <code>neighbor SPOKES default-originate</code> advertise kar sakta hai. eBGP ke saath (har spoke ka alag AS, <code>remote-as 65001 alternate-as 65002 65003</code> use karke) hub next hop ko khud par rewrite karta hai, jo phase 3 ke liye theek hai lekin phase 2 ke liye nahi.</p>

<div class="eg"><p><b>Worked example.</b> EIGRP ke saath phase 2, lekin hub par sirf <code>no ip split-horizon eigrp 100</code> hai. SPOKE1 ki table: <code>D 10.3.3.0/24 [90/...] via 172.16.100.1</code>. Spoke-to-spoke kabhi nahi banta. <code>no ip next-hop-self eigrp 100</code> jodo aur route <code>via 172.16.100.3</code> ho jaata hai; agla ping resolution trigger karta hai aur <code>show dmvpn</code> mein D entry dikhti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Hub ki jagah spoke par split horizon disable karna (wahan iska koi faayda nahi). <code>no ip split-horizon</code> ke bina <code>no ip next-hop-self</code> lagana (spokes ab bhi kuch nahi seekhte). Bhool jaana ki BGP listen range sirf accept karti hai; jab tak spokes hub ki taraf point na karein, kuch up nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> EIGRP phase 2 ke liye <b>hub</b> tunnel par <code>no ip split-horizon eigrp</code> aur <code>no ip next-hop-self eigrp</code> <b>dono</b> chahiye. Phase 3 mein hub summarise kare to dono mein se koi zaroori nahi. <code>bgp listen range</code> ko peer-group chahiye, aur dynamic neighbours <code>show ip bgp summary</code> mein asterisk ke saath dikhte hain.</p></div>

<div class="scn"><h4>Spoke jo transit ban gaya</h4><p>Do DMVPN clouds par do routers wali ek branch achanak dono clouds ke beech traffic le jaane lagi, jisse uske chhote links saturate ho gaye. Dono branch routers har EIGRP route ko redistribute karke hubs ko wapas advertise kar rahe the. Saare spokes par <code>eigrp stub connected summary</code> configure karne se woh learned routes advertise karna band kar diye, hub queries se bahar ho gaye aur intended paths wapas aa gaye.</p><p><b>Seekh:</b> spokes EIGRP stubs hone chahiye; cloud mein routes re-advertise karne wala sirf hub hona chahiye.</p></div>

<div class="iv"><p class="q">"EIGRP ko DMVPN phase 2 support karne ke liye kya badalna padta hai, aur phase 3 aasaan kyun hai?"</p><p>Strong answer: hub tunnel par split horizon disable karo taaki spoke routes doosre spokes ko re-advertise hon, aur next-hop-self disable karo taaki original spoke next hop rahe aur NHRP resolution trigger kare; koi summarisation nahi. Phase 3 mein hub defaults rakh kar summary ya default bhej sakta hai kyunki NHRP redirects aur shortcuts direct path banate hain. Jodo ki spokes stubs hone chahiye aur tunnel bandwidth set honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP phase 2: hub ko <code>no ip split-horizon eigrp</code> + <code>no ip next-hop-self eigrp</code> chahiye; summaries nahi.</li>
<li>EIGRP phase 1/3: defaults rakho aur hub se summary ya default bhejo.</li>
<li>Spokes ko EIGRP stubs banao aur tunnel bandwidth set karo (EIGRP max 50% use karta hai).</li>
<li>BGP dynamic neighbours: <code>bgp listen range ... peer-group</code>; hub passive hai.</li>
<li>iBGP route reflectors next hop rakhte hain (phase 2 ke liye achha); eBGP use rewrite karta hai (phase 3 ke liye theek).</li>
</ul></div>
`}};export{e as default};