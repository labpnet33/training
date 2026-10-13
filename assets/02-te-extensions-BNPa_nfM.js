var e={id:`te-extensions`,h:{en:`IGP TE extensions: advertising bandwidth, affinity and TE metric`,hi:`IGP TE extensions: bandwidth, affinity aur TE metric advertise karna`},body:{en:`
<p>A normal IGP tells every router only the cost of each link, like a road map with distances. To plan reservations, the head end of a tunnel also needs to know how much room is left on each road and what kind of road it is. The IGP is therefore <b>extended</b> to flood extra link attributes, and every router stores them in the <b>Traffic Engineering Database (TED)</b>. The head end then runs <b>CSPF</b>, Constrained Shortest Path First, which is ordinary SPF run on the TED after pruning links that do not meet the constraints.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="The IGP builds the TE database; CSPF computes the path; RSVP-TE signals it."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">IS-IS or OSPF</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">floods TE info</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">TED</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">links, bandwidth, flags</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">CSPF</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">prunes then SPF</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Explicit path</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">handed to RSVP</text></svg><p class="cap">The IGP builds the TE database; CSPF computes the path; RSVP-TE signals it.</p></div>
<h3>What the IGP carries</h3>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th><th>Typical command</th></tr><tr><td>TE router ID</td><td>A stable loopback that identifies the node in the TED</td><td>mpls traffic-eng router-id Loopback0</td></tr><tr><td>Maximum bandwidth</td><td>Interface line rate</td><td>Learned from the interface</td></tr><tr><td>Maximum reservable bandwidth</td><td>Part of the link that RSVP may reserve</td><td>ip rsvp bandwidth 7500000 (IOS XE, in kbps)</td></tr><tr><td>Unreserved bandwidth</td><td>What is left at each of eight priority levels (0 to 7)</td><td>Computed from signalled tunnels</td></tr><tr><td>Administrative group (affinity)</td><td>A 32 bit mask of colours assigned to a link</td><td>mpls traffic-eng attribute-flags 0x1</td></tr><tr><td>TE metric</td><td>Optional second metric used by CSPF, for example link delay</td><td>mpls traffic-eng administrative-weight 20</td></tr><tr><td>SRLG</td><td>Shared Risk Link Group: links that fail together</td><td>Defined per link, used for protection</td></tr></table>
<h3>How each IGP carries it</h3>
<ul>
<li><b>OSPF</b> uses opaque LSAs of type 10 (area-local scope) with the TE LSA, defined in RFC 3630. <code>mpls traffic-eng area 0</code> under <code>router ospf</code> enables it.</li>
<li><b>IS-IS</b> uses the extended IS reachability TLV 22 (and TLV 135 for IP) with TE sub-TLVs, defined in RFC 5305, and TLV 134 for the TE router ID. It requires <b>wide metrics</b>: <code>metric-style wide</code>. With narrow metrics the TE sub-TLVs cannot be carried.</li>
<li>Both protocols re-flood when reservations change enough to cross thresholds, not on every tunnel, to limit LSP or LSA churn.</li>
</ul>
<h3>Reference configuration</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
mpls traffic-eng tunnels
<span class="c">!</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 metric-style wide
 mpls traffic-eng router-id Loopback0
 mpls traffic-eng level-2
<span class="c">!</span>
interface TenGigabitEthernet0/0/1
 ip address 198.51.100.1 255.255.255.252
 ip router isis CORE
 mpls traffic-eng tunnels
 mpls traffic-eng attribute-flags 0x1
 mpls traffic-eng administrative-weight 20
 ip rsvp bandwidth 7500000
<span class="c">!</span>
<span class="c">! IOS XR</span>
rsvp
 interface TenGigE0/0/0/1
  bandwidth 7500000
<span class="c">!</span>
mpls traffic-eng
 interface TenGigE0/0/0/1
  attribute-names RED
<span class="c"> !</span>
 affinity-map RED bit-position 1
<span class="c">!</span>
router isis CORE
 address-family ipv4 unicast
  metric-style wide
  mpls traffic-eng level-2-only
  mpls traffic-eng router-id Loopback0</pre>
<p>On IOS XE the bandwidth under <code>ip rsvp bandwidth</code> is in kbps (7 500 000 kbps is 7.5 Gbps on a 10G link, a 75 percent reservable share). On IOS XR, affinities are named through an <code>affinity-map</code> and applied with <code>attribute-names</code>, which is easier to read than raw bitmasks. Check exact units and keywords in your release notes before using them in production.</p>
<h3>Priorities, affinity and the TED in practice</h3>
<ul>
<li><b>Setup and hold priority</b> (0 is best, 7 is worst) let an important tunnel pre-empt a less important one when bandwidth is short. The TED shows unreserved bandwidth per priority.</li>
<li><b>Affinity</b> works as colours. A link flagged <i>red</i> can be required, excluded or preferred by a tunnel through its <b>affinity</b> and <b>mask</b> (IOS XE) or <b>include-any / include-all / exclude-any</b> (IOS XR).</li>
<li><b>TE metric</b> lets CSPF minimise something other than the IGP metric, such as latency, without changing normal routing.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A 10G link has maximum reservable bandwidth 7.5G. Tunnel A (priority 3) reserves 3G, Tunnel B (priority 5) reserves 2G. Unreserved at priority 4 is 7.5 minus 3 (only tunnel A counts at higher priority, numerically lower), so 4.5G. Unreserved at priority 6 is 7.5 minus 5, so 2.5G. A new tunnel C asking 4G with setup priority 4 fits (4.5G available at its priority), but a tunnel D with setup priority 6 asking 4G does not (only 2.5G).</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting <code>metric-style wide</code> on IS-IS, or enabling <code>mpls traffic-eng tunnels</code> globally but not on the interfaces. The TED stays empty and CSPF finds no path. Another mistake is not defining a TE router ID, which makes nodes appear under unstable addresses.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF uses opaque LSA type 10; IS-IS uses TLV 22 with sub-TLVs and needs wide metrics. The head end computes the path with CSPF using the TED, and the TED holds eight unreserved-bandwidth values, one per priority.</p></div>
<div class="scn"><h4>The tunnel that found no path</h4><p>A newly built tunnel stayed down with "no path". The IGP adjacency was fine and the interfaces had RSVP bandwidth. The engineer checked the IS-IS configuration and found metric-style narrow on two P routers. Their TE sub-TLVs were never flooded, so those links did not exist in the TED. Switching to wide metrics, in a planned step, brought the tunnel up.</p><p><b>Lesson:</b> when CSPF finds no path, check whether the TED actually contains the links: wide metrics, interface TE enabled, router ID set.</p></div>
<div class="iv"><p class="q">"How does the IGP carry TE information, and what is CSPF?"</p><p>OSPF floods type 10 opaque TE LSAs; IS-IS adds TE sub-TLVs to the extended IS reachability TLV 22 and needs wide metrics. They carry maximum and unreserved bandwidth per priority, administrative groups, TE metric and the TE router ID, which every router stores in the TED. CSPF is SPF run at the head end on the TED after pruning links that fail constraints such as bandwidth or affinity.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The IGP floods link bandwidth, unreserved bandwidth at 8 priorities, admin groups and TE metric into the TED.</li>
<li>OSPF: opaque LSA type 10 (RFC 3630). IS-IS: TLV 22 sub-TLVs (RFC 5305), needs metric-style wide.</li>
<li>CSPF is SPF on the TED after pruning links that do not meet constraints.</li>
<li>Affinity colours links; priorities 0 to 7 allow pre-emption.</li>
<li>A missing router ID, narrow metrics or interface TE disabled leaves the TED empty.</li>
</ul></div>
`,hi:`
<p>Normal IGP har router ko sirf har link ki cost batata hai, jaise distances wala road map. Reservations plan karne ke liye tunnel ke head end ko yeh bhi jaanna padta hai ki har road par kitni jagah bachi hai aur road kaisi hai. Isliye IGP ko <b>extend</b> kiya jaata hai taaki extra link attributes flood hon, aur har router unhe <b>Traffic Engineering Database (TED)</b> mein rakhta hai. Phir head end <b>CSPF</b>, Constrained Shortest Path First, chalata hai, jo TED par normal SPF hai lekin constraints poore na karne wale links hataane ke baad.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="IGP TE database banata hai; CSPF path compute karta hai; RSVP-TE use signal karta hai."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">IS-IS ya OSPF</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">TE info flood karta hai</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">TED</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">links, bandwidth, flags</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">CSPF</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">prune phir SPF</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Explicit path</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">RSVP ko deta hai</text></svg><p class="cap">IGP TE database banata hai; CSPF path compute karta hai; RSVP-TE use signal karta hai.</p></div>
<h3>IGP kya carry karta hai</h3>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th><th>Typical command</th></tr><tr><td>TE router ID</td><td>Stable loopback jo TED mein node ko identify karta hai</td><td>mpls traffic-eng router-id Loopback0</td></tr><tr><td>Maximum bandwidth</td><td>Interface line rate</td><td>Interface se seekha jaata hai</td></tr><tr><td>Maximum reservable bandwidth</td><td>Link ka woh hissa jo RSVP reserve kar sakta hai</td><td>ip rsvp bandwidth 7500000 (IOS XE, kbps mein)</td></tr><tr><td>Unreserved bandwidth</td><td>Aath priority levels (0 se 7) par kitna bacha hai</td><td>Signalled tunnels se compute hota hai</td></tr><tr><td>Administrative group (affinity)</td><td>Link ko diye gaye colours ka 32 bit mask</td><td>mpls traffic-eng attribute-flags 0x1</td></tr><tr><td>TE metric</td><td>CSPF ka optional doosra metric, jaise link delay</td><td>mpls traffic-eng administrative-weight 20</td></tr><tr><td>SRLG</td><td>Shared Risk Link Group: jo links saath fail hote hain</td><td>Har link par define, protection mein use</td></tr></table>
<h3>Har IGP ise kaise carry karta hai</h3>
<ul>
<li><b>OSPF</b> opaque LSAs type 10 (area-local scope) TE LSA ke saath use karta hai, RFC 3630. <code>router ospf</code> ke neeche <code>mpls traffic-eng area 0</code> ise enable karta hai.</li>
<li><b>IS-IS</b> extended IS reachability TLV 22 (aur IP ke liye TLV 135) TE sub-TLVs ke saath use karta hai, RFC 5305, aur TE router ID ke liye TLV 134. Ise <b>wide metrics</b> chahiye: <code>metric-style wide</code>. Narrow metrics ke saath TE sub-TLVs carry nahi ho sakte.</li>
<li>Dono protocols tab re-flood karte hain jab reservations thresholds cross karne jitna badalte hain, har tunnel par nahi, taaki LSP ya LSA churn kam rahe.</li>
</ul>
<h3>Reference configuration</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
mpls traffic-eng tunnels
<span class="c">!</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 metric-style wide
 mpls traffic-eng router-id Loopback0
 mpls traffic-eng level-2
<span class="c">!</span>
interface TenGigabitEthernet0/0/1
 ip address 198.51.100.1 255.255.255.252
 ip router isis CORE
 mpls traffic-eng tunnels
 mpls traffic-eng attribute-flags 0x1
 mpls traffic-eng administrative-weight 20
 ip rsvp bandwidth 7500000
<span class="c">!</span>
<span class="c">! IOS XR</span>
rsvp
 interface TenGigE0/0/0/1
  bandwidth 7500000
<span class="c">!</span>
mpls traffic-eng
 interface TenGigE0/0/0/1
  attribute-names RED
<span class="c"> !</span>
 affinity-map RED bit-position 1
<span class="c">!</span>
router isis CORE
 address-family ipv4 unicast
  metric-style wide
  mpls traffic-eng level-2-only
  mpls traffic-eng router-id Loopback0</pre>
<p>IOS XE par <code>ip rsvp bandwidth</code> ki bandwidth kbps mein hoti hai (10G link par 7 500 000 kbps matlab 7.5 Gbps, yaani 75 percent reservable share). IOS XR par affinities <code>affinity-map</code> se naam milte hain aur <code>attribute-names</code> se lagte hain, jo raw bitmasks se padhne mein aasaan hai. Production mein use karne se pehle apne release notes mein exact units aur keywords check karo.</p>
<h3>Priorities, affinity aur TED practice mein</h3>
<ul>
<li><b>Setup aur hold priority</b> (0 sabse achhi, 7 sabse kharab) bandwidth kam padne par important tunnel ko kam important tunnel pre-empt karne deti hai. TED har priority par unreserved bandwidth dikhata hai.</li>
<li><b>Affinity</b> colours ki tarah kaam karti hai. <i>Red</i> flag wala link tunnel ki <b>affinity</b> aur <b>mask</b> (IOS XE) ya <b>include-any / include-all / exclude-any</b> (IOS XR) se required, excluded ya preferred ho sakta hai.</li>
<li><b>TE metric</b> CSPF ko IGP metric ki jagah kuch aur minimise karne deta hai, jaise latency, bina normal routing badle.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> 10G link ki maximum reservable bandwidth 7.5G hai. Tunnel A (priority 3) 3G reserve karta hai, Tunnel B (priority 5) 2G. Priority 4 par unreserved 7.5 minus 3 (sirf tunnel A higher priority par ginta hai), yaani 4.5G. Priority 6 par unreserved 7.5 minus 5, yaani 2.5G. Naya tunnel C jo setup priority 4 par 4G maangta hai fit ho jaata hai (uski priority par 4.5G available), lekin setup priority 6 wala tunnel D jo 4G maangta hai fit nahi hota (sirf 2.5G).</p></div>
<div class="warn"><p><b>Common mistake.</b> IS-IS par <code>metric-style wide</code> bhoolna, ya <code>mpls traffic-eng tunnels</code> globally on karke interfaces par na lagana. TED khaali rehta hai aur CSPF ko path nahi milta. Ek aur galti TE router ID define na karna hai, jisse nodes unstable addresses ke neeche dikhte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF opaque LSA type 10 use karta hai; IS-IS sub-TLVs ke saath TLV 22 use karta hai aur wide metrics chahiye. Head end TED se CSPF chalakar path compute karta hai, aur TED mein aath unreserved-bandwidth values hoti hain, har priority ke liye ek.</p></div>
<div class="scn"><h4>Tunnel jise path nahi mila</h4><p>Naya banaya tunnel "no path" ke saath down raha. IGP adjacency theek thi aur interfaces par RSVP bandwidth thi. Engineer ne IS-IS configuration check ki aur do P routers par metric-style narrow paya. Unke TE sub-TLVs kabhi flood nahi hue, isliye woh links TED mein the hi nahi. Planned step mein wide metrics par switch karne se tunnel up ho gaya.</p><p><b>Lesson:</b> CSPF ko path na mile to check karo ki TED mein links hain ya nahi: wide metrics, interface par TE enabled, router ID set.</p></div>
<div class="iv"><p class="q">"IGP TE information kaise carry karta hai, aur CSPF kya hai?"</p><p>OSPF type 10 opaque TE LSAs flood karta hai; IS-IS extended IS reachability TLV 22 mein TE sub-TLVs jodta hai aur wide metrics chahta hai. Yeh maximum aur unreserved bandwidth per priority, administrative groups, TE metric aur TE router ID carry karte hain, jo har router TED mein rakhta hai. CSPF head end par TED par chalne wala SPF hai, bandwidth ya affinity jaise constraints fail karne wale links ko prune karne ke baad.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP link bandwidth, 8 priorities par unreserved bandwidth, admin groups aur TE metric TED mein flood karta hai.</li>
<li>OSPF: opaque LSA type 10 (RFC 3630). IS-IS: TLV 22 sub-TLVs (RFC 5305), metric-style wide chahiye.</li>
<li>CSPF TED par constraints na poore karne wale links prune karke chalne wala SPF hai.</li>
<li>Affinity links ko colour karti hai; priorities 0 se 7 pre-emption allow karti hain.</li>
<li>Router ID na ho, narrow metrics ya interface par TE disabled ho to TED khaali rehta hai.</li>
</ul></div>
`}};export{e as default};