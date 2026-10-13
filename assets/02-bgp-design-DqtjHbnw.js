var e={id:`bgp-design`,h:{en:`The BGP design: iBGP, route reflectors on the spines, send-community`,hi:`BGP design: iBGP, spines par route reflectors, send-community`},body:{en:`
<p>Imagine a company newsletter. Every department could e-mail every other department directly, but with 40 departments that is 780 conversations. Instead, two editors (the spines) collect news from each department and forward it to all the others. Departments only talk to the two editors. In BGP language the editors are <b>route reflectors (RR)</b> and the departments are <b>RR clients</b>. This is why iBGP, which normally needs a full mesh, scales to hundreds of leaves in a fabric.</p>

<h3>Design decisions</h3>
<ul>
<li><b>iBGP, one AS (65001).</b> Simple, no AS-path tricks. The route reflectors preserve the original next hop, so the next hop of an EVPN route stays the leaf's VTEP address.</li>
<li><b>Sessions between Loopback0 addresses.</b> Loopbacks are always up and are advertised in OSPF. Session source is <code>update-source Loopback0</code>.</li>
<li><b>Two RRs for redundancy.</b> Each leaf peers with both spines. A leaf sees every route twice (one copy per RR), which is normal.</li>
<li><b>Extended communities are essential.</b> Route targets and the VXLAN encapsulation tag travel as extended communities. Without <code>send-community both</code> (or extended) they are dropped.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route reflection flow">
<rect x="20" y="60" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="80" y="96" text-anchor="middle" class="svg-muted" font-size="12">originates</text>
<rect x="260" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 RR</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">reflects</text>
<rect x="260" y="110" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">SPINE2 RR</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">reflects</text>
<rect x="500" y="60" width="120" height="44" rx="8" fill="#bae6fd"/><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 / LEAF3</text><text x="560" y="96" text-anchor="middle" class="svg-muted" font-size="12">receive 2 copies</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="72" x2="260" y2="42"/><line x1="140" y1="92" x2="260" y2="132"/><line x1="380" y1="42" x2="500" y2="72"/><line x1="380" y1="132" x2="500" y2="92"/></g>
</svg><p class="cap">The next hop stays LEAF1's VTEP address on every copy.</p></div>

<h3>Leaf configuration (LEAF1)</h3>
<pre class="code">l2vpn evpn
 replication-type ingress
 router-id Loopback0
router bgp 65001
 bgp router-id interface Loopback0
 neighbor 10.255.0.101 remote-as 65001
 neighbor 10.255.0.101 update-source Loopback0
 neighbor 10.255.0.102 remote-as 65001
 neighbor 10.255.0.102 update-source Loopback0
 address-family l2vpn evpn
  neighbor 10.255.0.101 activate
  neighbor 10.255.0.101 send-community both
  neighbor 10.255.0.102 activate
  neighbor 10.255.0.102 send-community both</pre>

<h3>Spine configuration (SPINE1)</h3>
<pre class="code">router bgp 65001
 bgp router-id interface Loopback0
 neighbor 10.255.0.11 remote-as 65001
 neighbor 10.255.0.11 update-source Loopback0
 neighbor 10.255.0.12 remote-as 65001
 neighbor 10.255.0.12 update-source Loopback0
 neighbor 10.255.0.13 remote-as 65001
 neighbor 10.255.0.13 update-source Loopback0
 address-family l2vpn evpn
  neighbor 10.255.0.11 activate
  neighbor 10.255.0.11 send-community both
  neighbor 10.255.0.11 route-reflector-client
  neighbor 10.255.0.12 activate
  neighbor 10.255.0.12 send-community both
  neighbor 10.255.0.12 route-reflector-client
  neighbor 10.255.0.13 activate
  neighbor 10.255.0.13 send-community both
  neighbor 10.255.0.13 route-reflector-client</pre>
<p>The spines carry no VLAN, VNI or VRF configuration. They are not VTEPs and have no nve1.</p>

<pre class="out">LEAF1# show bgp l2vpn evpn summary
BGP router identifier 10.255.0.11, local AS number 65001
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.101    4 65001     212     198       24    0    0 00:41:02        <span class="hl">6</span>
10.255.0.102    4 65001     211     199       24    0    0 00:41:00        <span class="hl">6</span></pre>
<p>State/PfxRcd is a number, not a word like Idle or Active. Both spines send the same count, because both reflect the same routes.</p>

<div class="eg"><p><b>Worked example: counting sessions.</b> Full mesh among 3 leaves and 2 spines would be 10 sessions. With route reflection each leaf has 2 sessions and each spine has 3: 6 sessions in total. At 40 leaves with 2 spines a full mesh needs 861 sessions; the RR design needs 80 (2 per leaf).</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>route-reflector-client</code> on a spine neighbor. The leaf sends its routes to the spine, but the spine does not pass them on to other iBGP peers (an ordinary iBGP rule). The spine's table holds the routes, the other leaves see nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>send-community both</code> sends standard and extended communities. In EVPN the route target is an <b>extended</b> community; standard-only sending silently removes it and no leaf imports the route.</p></div>

<div class="scn"><h4>All sessions up, zero imports</h4><p>A new leaf joined the fabric. Both BGP sessions showed Established and a healthy prefix count, but the leaf never installed any remote MAC. SPINE1's output for the leaf's routes had no Extended Community line. The new leaf's template said <code>send-community</code> without <code>both</code>, so route targets and encapsulation tags were stripped before they left the leaf. Adding <code>send-community both</code> on both neighbors fixed it within a minute.</p><p><b>Lesson:</b> a spine's view of a route is the best evidence of what the leaf really sent.</p></div>

<div class="iv"><p class="q">"Why do the spines act as route reflectors and what do they need configured?"</p><p>Strong answer: iBGP requires a full mesh or reflection. Spines reflect EVPN routes between leaves, so each leaf needs only two sessions. On the spine each leaf neighbor needs activation in l2vpn evpn, send-community both, and route-reflector-client. The spines do not need VNIs or VRFs because they only reflect, they do not forward overlay traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP AS 65001, sessions loopback to loopback, both spines as RRs.</li>
<li>Activate every neighbor under address-family l2vpn evpn.</li>
<li>send-community both preserves route targets.</li>
<li>route-reflector-client on spine neighbors is mandatory for reflection.</li>
</ul></div>
`,hi:`
<p>Ek company newsletter socho. Har department doosre department ko seedhe e-mail kar sakta hai, lekin 40 departments mein yeh 780 conversations hain. Iski jagah do editors (spines) har department se news collect karke baaki sabko forward karte hain. Departments sirf do editors se baat karte hain. BGP ki bhasha mein editors <b>route reflectors (RR)</b> hain aur departments <b>RR clients</b>. Isliye iBGP, jisko aam taur par full mesh chahiye, fabric mein sainkdon leaves tak scale ho jaata hai.</p>

<h3>Design decisions</h3>
<ul>
<li><b>iBGP, ek AS (65001).</b> Simple, AS-path ke jhanjhat nahi. Route reflectors original next hop preserve karte hain, isliye EVPN route ka next hop leaf ka VTEP address rehta hai.</li>
<li><b>Loopback0 addresses ke beech sessions.</b> Loopbacks hamesha up rehte hain aur OSPF mein advertise hote hain. Session source <code>update-source Loopback0</code> hai.</li>
<li><b>Redundancy ke liye do RRs.</b> Har leaf dono spines se peer karta hai. Leaf har route do baar dekhta hai (har RR se ek copy), jo normal hai.</li>
<li><b>Extended communities zaroori hain.</b> Route targets aur VXLAN encapsulation tag extended communities mein jaate hain. <code>send-community both</code> (ya extended) ke bina woh gir jaate hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route reflection flow">
<rect x="20" y="60" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="80" y="96" text-anchor="middle" class="svg-muted" font-size="12">originate</text>
<rect x="260" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">SPINE1 RR</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">reflect</text>
<rect x="260" y="110" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">SPINE2 RR</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">reflect</text>
<rect x="500" y="60" width="120" height="44" rx="8" fill="#bae6fd"/><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 / LEAF3</text><text x="560" y="96" text-anchor="middle" class="svg-muted" font-size="12">2 copies milti hain</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="72" x2="260" y2="42"/><line x1="140" y1="92" x2="260" y2="132"/><line x1="380" y1="42" x2="500" y2="72"/><line x1="380" y1="132" x2="500" y2="92"/></g>
</svg><p class="cap">Har copy par next hop LEAF1 ka VTEP address rehta hai.</p></div>

<h3>Leaf configuration (LEAF1)</h3>
<pre class="code">l2vpn evpn
 replication-type ingress
 router-id Loopback0
router bgp 65001
 bgp router-id interface Loopback0
 neighbor 10.255.0.101 remote-as 65001
 neighbor 10.255.0.101 update-source Loopback0
 neighbor 10.255.0.102 remote-as 65001
 neighbor 10.255.0.102 update-source Loopback0
 address-family l2vpn evpn
  neighbor 10.255.0.101 activate
  neighbor 10.255.0.101 send-community both
  neighbor 10.255.0.102 activate
  neighbor 10.255.0.102 send-community both</pre>

<h3>Spine configuration (SPINE1)</h3>
<pre class="code">router bgp 65001
 bgp router-id interface Loopback0
 neighbor 10.255.0.11 remote-as 65001
 neighbor 10.255.0.11 update-source Loopback0
 neighbor 10.255.0.12 remote-as 65001
 neighbor 10.255.0.12 update-source Loopback0
 neighbor 10.255.0.13 remote-as 65001
 neighbor 10.255.0.13 update-source Loopback0
 address-family l2vpn evpn
  neighbor 10.255.0.11 activate
  neighbor 10.255.0.11 send-community both
  neighbor 10.255.0.11 route-reflector-client
  neighbor 10.255.0.12 activate
  neighbor 10.255.0.12 send-community both
  neighbor 10.255.0.12 route-reflector-client
  neighbor 10.255.0.13 activate
  neighbor 10.255.0.13 send-community both
  neighbor 10.255.0.13 route-reflector-client</pre>
<p>Spines par koi VLAN, VNI ya VRF configuration nahi hota. Woh VTEPs nahi hain aur unke paas nve1 nahi hai.</p>

<pre class="out">LEAF1# show bgp l2vpn evpn summary
BGP router identifier 10.255.0.11, local AS number 65001
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.101    4 65001     212     198       24    0    0 00:41:02        <span class="hl">6</span>
10.255.0.102    4 65001     211     199       24    0    0 00:41:00        <span class="hl">6</span></pre>
<p>State/PfxRcd ek number hai, Idle ya Active jaisa shabd nahi. Dono spines same count bhejte hain, kyunki dono wahi routes reflect karte hain.</p>

<div class="eg"><p><b>Worked example: sessions ginna.</b> 3 leaves aur 2 spines ke beech full mesh 10 sessions hota. Route reflection ke saath har leaf ke 2 sessions aur har spine ke 3: kul 6 sessions. 40 leaves aur 2 spines par full mesh ko 861 sessions chahiye; RR design ko 80 (har leaf ke 2).</p></div>

<div class="warn"><p><b>Common galti.</b> Spine neighbor par <code>route-reflector-client</code> bhool jaana. Leaf apne routes spine ko bhejta hai, lekin spine unhe doosre iBGP peers ko pass nahi karta (normal iBGP rule). Spine ki table mein routes hain, baaki leaves ko kuch nahi dikhta.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>send-community both</code> standard aur extended communities dono bhejta hai. EVPN mein route target <b>extended</b> community hai; sirf standard bhejne se woh chupchaap hat jaata hai aur koi leaf route import nahi karta.</p></div>

<div class="scn"><h4>Saare sessions up, imports zero</h4><p>Fabric mein naya leaf juda. Dono BGP sessions Established the aur prefix count healthy tha, lekin leaf ne koi remote MAC install nahi kiya. SPINE1 par leaf ke routes ke output mein Extended Community line nahi thi. Naye leaf ke template mein <code>send-community</code> bina <code>both</code> ke tha, isliye route targets aur encapsulation tags leaf se nikalne se pehle hi hat gaye. Dono neighbors par <code>send-community both</code> jodne se ek minute mein theek ho gaya.</p><p><b>Seekh:</b> spine ka route view yeh dekhne ka sabse accha saboot hai ki leaf ne asal mein kya bheja.</p></div>

<div class="iv"><p class="q">"Spines route reflector kyun hain aur unpar kya configure hona chahiye?"</p><p>Strong answer: iBGP ko full mesh ya reflection chahiye. Spines leaves ke beech EVPN routes reflect karte hain, isliye har leaf ko sirf do sessions chahiye. Spine par har leaf neighbor ko l2vpn evpn mein activation, send-community both aur route-reflector-client chahiye. Spines ko VNIs ya VRFs nahi chahiye kyunki woh sirf reflect karte hain, overlay traffic forward nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP AS 65001, loopback se loopback sessions, dono spines RRs.</li>
<li>Har neighbor ko address-family l2vpn evpn ke neeche activate karo.</li>
<li>send-community both route targets preserve karta hai.</li>
<li>Spine neighbors par route-reflector-client reflection ke liye zaroori hai.</li>
</ul></div>
`}};export{e as default};