var e={id:`modes-aliasing`,h:{en:`All-active versus single-active, aliasing and fast failover`,hi:`All-active versus single-active, aliasing aur fast failover`},body:{en:`
<p>A shop with two cash counters can run in two ways. In the first, both counters serve customers at the same time: queues are short, and if one counter closes the other takes over. In the second, only one counter is open and the second is a stand-by used only when the first closes. Multi-homing has the same two modes: <b>all-active</b> and <b>single-active</b>. The right choice depends on what the connected device can do.</p>

<h3>The two redundancy modes</h3>
<table class="cmp"><tr><th></th><th>All-active</th><th>Single-active</th></tr>
<tr><td>Links forwarding</td><td>All links of the segment</td><td>One link (one leaf) per VLAN</td></tr>
<tr><td>Customer device</td><td>Needs a port-channel (LACP or static)</td><td>Any device, even without LACP (for example plain dual NICs with failover)</td></tr>
<tr><td>Bandwidth</td><td>Sum of all links</td><td>One link per VLAN</td></tr>
<tr><td>Remote leaves</td><td>Aliasing: load-balance to every leaf</td><td>Backup path: use the active leaf only</td></tr>
<tr><td>Typical use</td><td>Servers and switches with LACP</td><td>Hosts that cannot bundle, or when MAC flip-flops must be avoided</td></tr>
<tr><td>Config keyword</td><td><code>redundancy all-active</code></td><td><code>redundancy single-active</code></td></tr>
</table>
<p>In single-active mode the DF is also the only leaf that forwards <b>all</b> traffic (not just BUM) for that VLAN to and from the segment; the non-DF's segment port is blocked for the VLAN.</p>

<h3>Aliasing: remote leaves use both paths</h3>
<p>In all-active mode H5's frames are hashed by SW-CE onto either uplink, so LEAF1 might learn the MAC of H5 while LEAF2 never sees a frame from H5 (it might all go one way for a while). Without aliasing, LEAF3 would only know the leaf that advertised the type-2 route and send everything there. With aliasing, LEAF3 knows from per-EVI A-D routes that <b>both</b> leaves are attached to ESI 7788, so it installs the MAC with <b>two next hops</b> and load-balances.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Aliasing">
<rect x="20" y="70" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="90" y="106" text-anchor="middle" class="svg-muted" font-size="12">H4 sends to H5</text>
<rect x="300" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="375" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="375" y="56" text-anchor="middle" class="svg-muted" font-size="12">type 2 for H5 seen</text>
<rect x="300" y="120" width="150" height="44" rx="8" fill="#bae6fd"/><text x="375" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="375" y="156" text-anchor="middle" class="svg-muted" font-size="12">only type 1 per-EVI seen</text>
<rect x="520" y="70" width="110" height="44" rx="8" fill="#fde68a"/><text x="575" y="96" text-anchor="middle" class="svg-ink" font-size="12">SW-CE / H5</text>
<g stroke="#64748b" stroke-width="2"><line x1="160" y1="85" x2="300" y2="44"/><line x1="160" y1="100" x2="300" y2="142"/><line x1="450" y1="42" x2="520" y2="85"/><line x1="450" y1="142" x2="520" y2="100"/></g>
<text x="230" y="30" text-anchor="middle" class="svg-accent" font-size="12">50%</text><text x="230" y="175" text-anchor="middle" class="svg-accent" font-size="12">50%</text>
</svg><p class="cap">Aliasing: LEAF3 balances flows to H5 across both leaves although only one advertised the MAC.</p></div>

<h3>What type-2 routes carry in multi-homing</h3>
<pre class="out">LEAF3# show bgp l2vpn evpn route-type 2
Route Distinguisher: 65001:10
 *>i [2][65001:10][<span class="hl">0000.1122.3344.5566.7788</span>][0][48][0050.56aa.0005][32][10.10.10.15]/24
                    10.255.1.11              0    100      0 i

LEAF3# show l2vpn evpn mac evi 10
MAC Address    EVI   VLAN  ESI                      Ether Tag  Next Hop(s)
0050.56aa.0005 10    10    0000.1122.3344.5566.7788 0          <span class="hl">10.255.1.11, 10.255.1.12</span></pre>
<p>The type-2 route now has a <b>non-zero ESI</b>, and the MAC table shows two next hops. The second next hop arrived through the per-EVI A-D route, not through a MAC route.</p>

<h3>Fast failover step by step</h3>
<ol>
<li>The cable between LEAF1 and SW-CE fails. SW-CE immediately stops hashing flows to that link; LACP removes it.</li>
<li>LEAF1 withdraws its per-ES type-1 route (mass withdraw). All remote leaves drop 10.255.1.11 as a next hop for ESI 7788.</li>
<li>If LEAF1 was DF for some VLANs, LEAF2 recomputes the election with N = 1 and takes over those VLANs.</li>
<li>When the cable is restored, LEAF1 announces type 4 again, waits the DF wait-time, and takes back its VLANs.</li>
</ol>

<div class="eg"><p><b>Worked example: bandwidth maths.</b> Each uplink from SW-CE is 10 Gbps. All-active gives 20 Gbps aggregate for many flows, though a single flow is still limited to one link (10 Gbps) because of hashing. Single-active gives 10 Gbps per VLAN; you can spread VLANs across the two leaves to use both links over a day, but one VLAN never uses both at once.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using all-active toward a server whose NIC pair is not a bundle. The server sends the same MAC out of both NICs without LACP; the leaves see the MAC flip, mobility sequences climb, and the fabric may flag duplicates. For such hosts use single-active (or fix the server to use LACP).</p></div>

<div class="exam"><p><b>Exam trap.</b> Aliasing gives load balancing on <b>remote</b> leaves using per-EVI A-D routes. Mass withdraw gives fast failover using per-ES A-D routes. DF gives duplicate-free BUM using type 4. Three mechanisms, three route types.</p></div>

<div class="scn"><h4>The server that confused the fabric</h4><p>A new database pair used active-backup NIC teaming with no LACP. The team set up all-active segments as for other servers. After deployment, the monitoring showed MAC move alerts every few seconds and rising sequence numbers. The servers sent the same MAC from two ports of two leaves (only one active at a time, but during failovers both leaked frames). Switching the segment to single-active made the problem disappear.</p><p><b>Lesson:</b> the mode must match what the host actually does.</p></div>

<div class="iv"><p class="q">"What is aliasing and why does EVPN need it?"</p><p>Strong answer: with all-active multi-homing a remote MAC may be advertised by only one of the segment's leaves (the one that saw the host's frames). Aliasing uses per-EVI Ethernet A-D routes to tell remote leaves that every leaf attached to the same ESI can reach that MAC, so remote leaves load-balance across all of them instead of pinning the traffic to the advertising leaf. Mention mass withdraw as the companion mechanism for failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>All-active: all links, needs a bundle; single-active: one leaf per VLAN, any device.</li>
<li>Aliasing (per-EVI type 1) gives remote leaves two next hops.</li>
<li>Mass withdraw (per-ES type 1) gives fast failover.</li>
<li>Type-2 routes carry the ESI when the host is behind a segment.</li>
</ul></div>
`,hi:`
<p>Do cash counters wali shop do tareeke se chal sakti hai. Pehle mein dono counters ek saath customers serve karte hain: queues chhoti, aur ek band ho to doosra sambhal leta hai. Doosre mein sirf ek counter khula hai aur doosra stand-by hai jo tab chalta hai jab pehla band ho. Multi-homing ke bhi yehi do modes hain: <b>all-active</b> aur <b>single-active</b>. Sahi choice is par depend karti hai ki connected device kya kar sakta hai.</p>

<h3>Do redundancy modes</h3>
<table class="cmp"><tr><th></th><th>All-active</th><th>Single-active</th></tr>
<tr><td>Forward karne wale links</td><td>Segment ke saare links</td><td>Har VLAN ke liye ek link (ek leaf)</td></tr>
<tr><td>Customer device</td><td>Port-channel chahiye (LACP ya static)</td><td>Koi bhi device, LACP ke bina bhi (jaise failover wale plain dual NICs)</td></tr>
<tr><td>Bandwidth</td><td>Saare links ka jod</td><td>Har VLAN ke liye ek link</td></tr>
<tr><td>Remote leaves</td><td>Aliasing: har leaf par load-balance</td><td>Backup path: sirf active leaf use</td></tr>
<tr><td>Typical use</td><td>LACP wale servers aur switches</td><td>Jo hosts bundle nahi kar sakte, ya jab MAC flip-flop se bachna ho</td></tr>
<tr><td>Config keyword</td><td><code>redundancy all-active</code></td><td><code>redundancy single-active</code></td></tr>
</table>
<p>Single-active mode mein DF woh akela leaf bhi hai jo us VLAN ka segment ke aane-jaane wala <b>saara</b> traffic (sirf BUM nahi) forward karta hai; non-DF ka segment port us VLAN ke liye blocked hota hai.</p>

<h3>Aliasing: remote leaves dono paths use karte hain</h3>
<p>All-active mode mein H5 ke frames SW-CE kisi bhi uplink par hash karta hai, isliye LEAF1 H5 ka MAC learn kar sakta hai jabki LEAF2 ko H5 ka frame kabhi na mile (kuch der saara ek hi taraf ja sakta hai). Aliasing ke bina LEAF3 sirf us leaf ko jaanta jisne type-2 route advertise kiya aur sab wahin bhejta. Aliasing ke saath LEAF3 per-EVI A-D routes se jaanta hai ki <b>dono</b> leaves ESI 7788 se attached hain, isliye MAC ko <b>do next hops</b> ke saath install karta hai aur load-balance karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Aliasing">
<rect x="20" y="70" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="90" y="106" text-anchor="middle" class="svg-muted" font-size="12">H4 H5 ko bhejta hai</text>
<rect x="300" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="375" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="375" y="56" text-anchor="middle" class="svg-muted" font-size="12">H5 ka type 2 dikha</text>
<rect x="300" y="120" width="150" height="44" rx="8" fill="#bae6fd"/><text x="375" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="375" y="156" text-anchor="middle" class="svg-muted" font-size="12">sirf type 1 per-EVI dikha</text>
<rect x="520" y="70" width="110" height="44" rx="8" fill="#fde68a"/><text x="575" y="96" text-anchor="middle" class="svg-ink" font-size="12">SW-CE / H5</text>
<g stroke="#64748b" stroke-width="2"><line x1="160" y1="85" x2="300" y2="44"/><line x1="160" y1="100" x2="300" y2="142"/><line x1="450" y1="42" x2="520" y2="85"/><line x1="450" y1="142" x2="520" y2="100"/></g>
<text x="230" y="30" text-anchor="middle" class="svg-accent" font-size="12">50%</text><text x="230" y="175" text-anchor="middle" class="svg-accent" font-size="12">50%</text>
</svg><p class="cap">Aliasing: LEAF3 H5 ke flows dono leaves par baantta hai bhale hi MAC sirf ek ne advertise kiya.</p></div>

<h3>Multi-homing mein type-2 routes kya carry karte hain</h3>
<pre class="out">LEAF3# show bgp l2vpn evpn route-type 2
Route Distinguisher: 65001:10
 *>i [2][65001:10][<span class="hl">0000.1122.3344.5566.7788</span>][0][48][0050.56aa.0005][32][10.10.10.15]/24
                    10.255.1.11              0    100      0 i

LEAF3# show l2vpn evpn mac evi 10
MAC Address    EVI   VLAN  ESI                      Ether Tag  Next Hop(s)
0050.56aa.0005 10    10    0000.1122.3344.5566.7788 0          <span class="hl">10.255.1.11, 10.255.1.12</span></pre>
<p>Type-2 route mein ab <b>non-zero ESI</b> hai, aur MAC table do next hops dikhata hai. Doosra next hop per-EVI A-D route se aaya, MAC route se nahi.</p>

<h3>Fast failover step by step</h3>
<ol>
<li>LEAF1 aur SW-CE ke beech cable fail hoti hai. SW-CE turant us link par flows hash karna band karta hai; LACP use hata deta hai.</li>
<li>LEAF1 apna per-ES type-1 route withdraw karta hai (mass withdraw). Saare remote leaves ESI 7788 ke liye 10.255.1.11 ko next hop se hata dete hain.</li>
<li>Agar LEAF1 kuch VLANs ka DF tha, to LEAF2 N = 1 ke saath election dobara compute karke woh VLANs sambhal leta hai.</li>
<li>Cable wapas lagne par LEAF1 type 4 dobara announce karta hai, DF wait-time ruk kar apne VLANs wapas leta hai.</li>
</ol>

<div class="eg"><p><b>Worked example: bandwidth ka hisaab.</b> SW-CE ka har uplink 10 Gbps hai. All-active bahut saare flows ke liye 20 Gbps aggregate deta hai, lekin ek flow hashing ki wajah se ek hi link (10 Gbps) tak seemit rehta hai. Single-active har VLAN ke liye 10 Gbps deta hai; VLANs ko do leaves par baant kar din bhar mein dono links use kar sakte ho, lekin ek VLAN kabhi dono ek saath use nahi karta.</p></div>

<div class="warn"><p><b>Common galti.</b> Aise server ke liye all-active use karna jiske NIC pair bundle nahi hain. Server LACP ke bina same MAC dono NICs se bhejta hai; leaves MAC flip dekhte hain, mobility sequences badhte hain, aur fabric duplicates flag kar sakta hai. Aise hosts ke liye single-active use karo (ya server ko LACP par lao).</p></div>

<div class="exam"><p><b>Exam trap.</b> Aliasing <b>remote</b> leaves par per-EVI A-D routes se load balancing deta hai. Mass withdraw per-ES A-D routes se fast failover deta hai. DF type 4 se duplicate-free BUM deta hai. Teen mechanisms, teen route types.</p></div>

<div class="scn"><h4>Server jisne fabric ko confuse kiya</h4><p>Naye database pair ne LACP ke bina active-backup NIC teaming use ki. Team ne baaki servers ki tarah all-active segments setup kiye. Deployment ke baad monitoring mein har kuch second MAC move alerts aur badhte sequence numbers dikhe. Servers same MAC do leaves ke do ports se bhej rahe the (ek samay mein ek active, lekin failovers ke dauraan dono ne frames leak kiye). Segment ko single-active karne par problem gayab ho gayi.</p><p><b>Seekh:</b> mode wahi ho jo host asal mein karta hai.</p></div>

<div class="iv"><p class="q">"Aliasing kya hai aur EVPN ko iski zaroorat kyun?"</p><p>Strong answer: all-active multi-homing mein remote MAC segment ke sirf ek leaf (jisne host ke frames dekhe) se advertise ho sakta hai. Aliasing per-EVI Ethernet A-D routes se remote leaves ko batata hai ki same ESI se attached har leaf us MAC tak pahunch sakta hai, isliye remote leaves traffic ko advertising leaf par pin karne ki jagah sab par load-balance karte hain. Failover ke saathi mechanism ke roop mein mass withdraw batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>All-active: saare links, bundle chahiye; single-active: har VLAN ek leaf, koi bhi device.</li>
<li>Aliasing (per-EVI type 1) remote leaves ko do next hops deta hai.</li>
<li>Mass withdraw (per-ES type 1) fast failover deta hai.</li>
<li>Host segment ke peeche ho to type-2 routes ESI carry karte hain.</li>
</ul></div>
`}};export{e as default};