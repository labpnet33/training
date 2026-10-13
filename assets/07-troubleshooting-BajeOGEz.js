var e={id:`troubleshooting`,h:{en:`Split-brain and other multi-homing failure modes`,hi:`Split-brain aur doosre multi-homing failure modes`},body:{en:`
<p>Two co-pilots who read different checklists will each fly the plane "correctly" and still disagree. This is split-brain: the two leaves of a segment each act on their own view of the world, and the world they see is not the same. The result is not a clean outage but strange, intermittent symptoms: duplicate packets, MAC flapping, one-way traffic, a bundle that will not form. Use a symptom-first method.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Proof</th></tr>
<tr><td>Host receives every broadcast twice</td><td>Two DFs for the same VLAN (election disagreement)</td><td>"DF by VLAN" shows <i>local</i> on both leaves</td></tr>
<tr><td>Some broadcasts never reach the host</td><td>No DF at all (each leaf thinks the other is DF)</td><td>Both lists show a peer for the VLAN</td></tr>
<tr><td>Remote leaves show a single next hop for the MAC</td><td>No aliasing: per-EVI type 1 missing or ESI different</td><td>show l2vpn evpn mac shows one next hop</td></tr>
<tr><td>MAC flaps between LEAF1 and LEAF2</td><td>ESI mismatch, so the fabric treats the two links as unrelated</td><td>Rising MacMobility sequence; different ESI on the two leaves</td></tr>
<tr><td>Second link on SW-CE is suspended</td><td>LACP system ID differs (ESI or LACP config mismatch)</td><td>show etherchannel summary shows (s)</td></tr>
<tr><td>Segment shows no peers</td><td>Type 4 not received (send-community, ES-Import RT, BGP session)</td><td>show bgp l2vpn evpn route-type 4 empty on the peer</td></tr>
<tr><td>One link up, traffic one-way after link flap</td><td>Mode mismatch (all-active versus single-active)</td><td>Redundancy line differs between leaves</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Split-brain example">
<rect x="20" y="30" width="200" height="70" rx="8" fill="#bae6fd"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="120" y="72" text-anchor="middle" class="svg-accent" font-size="12">ESI ...7788</text><text x="120" y="90" text-anchor="middle" class="svg-muted" font-size="12">"my segment is alone"</text>
<rect x="420" y="30" width="200" height="70" rx="8" fill="#fed7aa"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="520" y="72" text-anchor="middle" class="svg-accent" font-size="12">ESI ...7789 (typo)</text><text x="520" y="90" text-anchor="middle" class="svg-muted" font-size="12">"my segment is alone"</text>
<rect x="240" y="130" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">SW-CE: bundle suspended</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="100" x2="270" y2="130"/><line x1="520" y1="100" x2="370" y2="130"/></g>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">no type-4 match</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">each leaf is DF for everything</text>
</svg><p class="cap">A one-digit ESI typo makes two leaves of one segment strangers.</p></div>

<h3>The method: four questions in order</h3>
<ol>
<li><b>Do both leaves show the same ESI?</b> <code>show l2vpn evpn ethernet-segment</code> on both. A different ESI is the most common cause.</li>
<li><b>Do they see each other?</b> The Peers column must show the other leaf. If it is empty, check type 4 (<code>show bgp l2vpn evpn route-type 4</code>) and the underlying BGP session and send-community.</li>
<li><b>Are the DF lists mirror images?</b> <code>... ethernet-segment detail</code> on both.</li>
<li><b>Do the modes match?</b> The Redundancy column is the same on both.</li>
</ol>

<pre class="out">LEAF1# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7788      Po10        all-active   <span class="hl">(none)</span>

LEAF2# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7789      Po10        all-active   (none)

LEAF1# show l2vpn evpn ethernet-segment detail
  DF by VLAN:        10 (local), 11 (local), 20 (local), 21 (local)</pre>
<p>Two different ESIs and no peers: each leaf elects itself DF for every VLAN, so the host gets duplicates, and remote leaves never alias. The fix is one line on LEAF2: <code>identifier type 0 00.11.22.33.44.55.66.77.88</code>.</p>

<h3>Failure modes in more detail</h3>
<ul>
<li><b>DF disagreement without ESI mismatch.</b> Same ESI, but different wait-time or election method; or a leaf that has not yet heard the peer's type 4 because of a spine route-reflector problem. Check that the type-4 routes reach both leaves.</li>
<li><b>Missing <code>evpn ethernet-segment 1</code> under the port-channel.</b> The segment is defined globally but not bound. show ethernet-segment lists no interface; the host is effectively single-homed.</li>
<li><b>Stale MAC after a leaf reload.</b> The reloading leaf has not yet withdrawn its type-1 routes before it died; remote leaves keep it as next hop for a few seconds. BGP hold timers and BFD on the fabric shorten this window.</li>
<li><b>Dropped per-ES route.</b> Missing <code>send-community both</code> removes the ES-Import RT, so peers never match each other.</li>
</ul>

<div class="eg"><p><b>Worked example: ticket "H5 gets duplicate ARP replies".</b> Proof 3 (DF lists): LEAF1 says VLAN 10 local; LEAF2 says VLAN 10 local. Proof 2 (peers): each shows the other as peer. Same ESI, so why two DFs? <code>show running-config | section ethernet-segment</code> reveals LEAF2 has <code>df-election wait-time 0</code> and was rebooted: it elected before hearing LEAF1. Restoring wait-time 3 on LEAF2 and clearing the election (shut/no shut of Po10) produced mirror-image lists.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing the symptom on the host (for example disabling NIC teaming) instead of checking the segment. Always make the four questions your first move.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ESI split-brain" in EVPN means mismatched ESI (or mode) between leaves of the same device, which makes the fabric see them as unrelated. It is not the same as vPC split-brain after a peer-link failure; EVPN has no peer-link.</p></div>

<div class="scn"><h4>One digit, two outages</h4><p>An MSP replaced LEAF2 after a hardware failure and restored its configuration from a spreadsheet where the ESI had a typo (7789 instead of 7788). For two days the customer experienced intermittent doubled broadcasts and a few seconds of disruption on each failover. During the next audit the team ran the four questions: ESI mismatch showed immediately. After correcting it, failovers were invisible.</p><p><b>Lesson:</b> automate ESI generation and diff it between peers.</p></div>

<div class="iv"><p class="q">"What is split-brain in EVPN multi-homing and how do you troubleshoot it?"</p><p>Strong answer: the leaves of one segment disagree about the segment, typically through different ESIs, modes, or DF election state. Symptoms are duplicate BUM, no aliasing, MAC flaps or a suspended LACP member. Compare ESI, peers, DF lists and mode on both leaves, and check type-4 and type-1 route propagation including send-community.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four questions: same ESI, see each other, mirror DF lists, same mode.</li>
<li>Two DFs = duplicate BUM; no DF = lost BUM.</li>
<li>ESI typo = unrelated links, no aliasing, MAC flaps.</li>
<li>Type 4 must reach both leaves (send-community, RRs).</li>
</ul></div>
`,hi:`
<p>Do co-pilots jo alag checklists padhte hain, har ek plane "sahi" udayega aur phir bhi disagree karenge. Yahi split-brain hai: segment ke do leaves apni-apni world-view par act karte hain, aur jo duniya woh dekhte hain woh same nahi hoti. Result clean outage nahi hota, balki ajeeb, intermittent symptoms: duplicate packets, MAC flapping, one-way traffic, bundle jo ban hi nahi raha. Symptom-first method use karo.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Proof</th></tr>
<tr><td>Host har broadcast do baar receive karta hai</td><td>Ek VLAN ke liye do DFs (election disagreement)</td><td>"DF by VLAN" dono leaves par <i>local</i> dikhata hai</td></tr>
<tr><td>Kuch broadcasts host tak nahi pahunchte</td><td>Koi DF nahi (har leaf sochta hai doosra DF hai)</td><td>Dono lists VLAN ke liye peer dikhati hain</td></tr>
<tr><td>Remote leaves MAC ke liye ek hi next hop dikhate hain</td><td>Aliasing nahi: per-EVI type 1 missing ya ESI alag</td><td>show l2vpn evpn mac ek next hop dikhata hai</td></tr>
<tr><td>MAC LEAF1 aur LEAF2 ke beech flap karta hai</td><td>ESI mismatch, isliye fabric dono links ko unrelated maanta hai</td><td>MacMobility sequence badhta hai; dono leaves par alag ESI</td></tr>
<tr><td>SW-CE ka doosra link suspended</td><td>LACP system ID alag (ESI ya LACP config mismatch)</td><td>show etherchannel summary mein (s)</td></tr>
<tr><td>Segment mein koi peer nahi</td><td>Type 4 receive nahi hua (send-community, ES-Import RT, BGP session)</td><td>peer par show bgp l2vpn evpn route-type 4 khaali</td></tr>
<tr><td>Ek link up, link flap ke baad traffic one-way</td><td>Mode mismatch (all-active versus single-active)</td><td>Leaves ke beech Redundancy line alag</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Split-brain example">
<rect x="20" y="30" width="200" height="70" rx="8" fill="#bae6fd"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="120" y="72" text-anchor="middle" class="svg-accent" font-size="12">ESI ...7788</text><text x="120" y="90" text-anchor="middle" class="svg-muted" font-size="12">"mera segment akela hai"</text>
<rect x="420" y="30" width="200" height="70" rx="8" fill="#fed7aa"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="520" y="72" text-anchor="middle" class="svg-accent" font-size="12">ESI ...7789 (typo)</text><text x="520" y="90" text-anchor="middle" class="svg-muted" font-size="12">"mera segment akela hai"</text>
<rect x="240" y="130" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">SW-CE: bundle suspended</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="100" x2="270" y2="130"/><line x1="520" y1="100" x2="370" y2="130"/></g>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">type-4 match nahi</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">har leaf sab ka DF</text>
</svg><p class="cap">Ek digit ka ESI typo ek segment ke do leaves ko ajnabi bana deta hai.</p></div>

<h3>Method: kramwar chaar sawaal</h3>
<ol>
<li><b>Kya dono leaves same ESI dikhate hain?</b> Dono par <code>show l2vpn evpn ethernet-segment</code>. Alag ESI sabse common cause hai.</li>
<li><b>Kya woh ek-doosre ko dekhte hain?</b> Peers column mein doosra leaf hona chahiye. Agar khaali hai to type 4 (<code>show bgp l2vpn evpn route-type 4</code>) aur neeche ka BGP session aur send-community check karo.</li>
<li><b>Kya DF lists mirror image hain?</b> Dono par <code>... ethernet-segment detail</code>.</li>
<li><b>Kya modes match karte hain?</b> Redundancy column dono par same ho.</li>
</ol>

<pre class="out">LEAF1# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7788      Po10        all-active   <span class="hl">(none)</span>

LEAF2# show l2vpn evpn ethernet-segment
Ethernet Segment ID           Interface   Redundancy   Peers
0000.1122.3344.5566.7789      Po10        all-active   (none)

LEAF1# show l2vpn evpn ethernet-segment detail
  DF by VLAN:        10 (local), 11 (local), 20 (local), 21 (local)</pre>
<p>Do alag ESIs aur koi peer nahi: har leaf khud ko har VLAN ka DF elect karta hai, isliye host ko duplicates milte hain, aur remote leaves kabhi alias nahi karte. Fix LEAF2 par ek line hai: <code>identifier type 0 00.11.22.33.44.55.66.77.88</code>.</p>

<h3>Failure modes thodi aur detail mein</h3>
<ul>
<li><b>ESI mismatch ke bina DF disagreement.</b> Same ESI, lekin alag wait-time ya election method; ya spine route-reflector problem ki wajah se leaf ne abhi peer ka type 4 nahi suna. Check karo ki type-4 routes dono leaves tak pahunchte hain.</li>
<li><b>Port-channel ke neeche <code>evpn ethernet-segment 1</code> missing.</b> Segment globally define hai lekin bound nahi. show ethernet-segment koi interface list nahi karta; host asal mein single-homed hai.</li>
<li><b>Leaf reload ke baad stale MAC.</b> Reload hone wale leaf ne marne se pehle type-1 routes withdraw nahi kiye; remote leaves use kuch seconds next hop rakhte hain. Fabric par BGP hold timers aur BFD is window ko chhota karte hain.</li>
<li><b>Dropped per-ES route.</b> <code>send-community both</code> missing hone par ES-Import RT hat jaata hai, isliye peers kabhi ek-doosre se match nahi karte.</li>
</ul>

<div class="eg"><p><b>Worked example: ticket "H5 ko duplicate ARP replies mil rahe hain".</b> Proof 3 (DF lists): LEAF1 VLAN 10 local kehta hai; LEAF2 VLAN 10 local kehta hai. Proof 2 (peers): har ek doosre ko peer dikhata hai. Same ESI, to do DFs kyun? <code>show running-config | section ethernet-segment</code> dikhata hai ki LEAF2 par <code>df-election wait-time 0</code> hai aur woh reboot hua tha: usne LEAF1 ko sunne se pehle elect kar liya. LEAF2 par wait-time 3 wapas karke aur election clear karke (Po10 shut/no shut) mirror-image lists mil gayi.</p></div>

<div class="warn"><p><b>Common galti.</b> Host par symptom theek karna (jaise NIC teaming disable karna) segment check karne ki jagah. Chaar sawaal hamesha pehla kadam rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> EVPN mein "ESI split-brain" ka matlab ek hi device ke leaves ke beech mismatched ESI (ya mode) hai, jisse fabric unhe unrelated dekhta hai. Yeh peer-link failure ke baad vPC split-brain jaisa nahi hai; EVPN mein peer-link hota hi nahi.</p></div>

<div class="scn"><h4>Ek digit, do outages</h4><p>Ek MSP ne hardware failure ke baad LEAF2 replace kiya aur configuration ek spreadsheet se restore kiya jisme ESI mein typo tha (7788 ki jagah 7789). Do din customer ko intermittent doubled broadcasts aur har failover par kuch seconds ka disruption mila. Agle audit mein team ne chaar sawaal chalaye: ESI mismatch turant dikha. Theek karne ke baad failovers invisible the.</p><p><b>Seekh:</b> ESI generation automate karo aur peers ke beech diff lo.</p></div>

<div class="iv"><p class="q">"EVPN multi-homing mein split-brain kya hai aur troubleshoot kaise karte ho?"</p><p>Strong answer: ek segment ke leaves segment ke baare mein disagree karte hain, aam taur par alag ESIs, modes ya DF election state ki wajah se. Symptoms: duplicate BUM, aliasing nahi, MAC flaps ya suspended LACP member. Dono leaves par ESI, peers, DF lists aur mode compare karo, aur send-community sahit type-4 aur type-1 route propagation check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar sawaal: same ESI, ek-doosre ko dekhte hain, mirror DF lists, same mode.</li>
<li>Do DFs = duplicate BUM; koi DF nahi = BUM lost.</li>
<li>ESI typo = unrelated links, aliasing nahi, MAC flaps.</li>
<li>Type 4 dono leaves tak pahunchna chahiye (send-community, RRs).</li>
</ul></div>
`}};export{e as default};