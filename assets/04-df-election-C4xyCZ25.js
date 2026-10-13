var e={id:`df-election`,h:{en:`Designated Forwarder election and BUM handling`,hi:`Designated Forwarder election aur BUM handling`},body:{en:`
<p>Two receptionists work at the same front desk of a building. If a courier arrives with a parcel for "everyone on floor 3" (a broadcast), and both receptionists announce it, residents hear the message twice. So the receptionists agree on a rule: for each floor, exactly one of them is the announcer. That announcer is the <b>Designated Forwarder (DF)</b> for that floor (VLAN). The other receptionist, the <b>non-DF</b>, stays silent for that floor, but still handles normal one-to-one deliveries.</p>

<h3>Why a DF is needed</h3>
<p>Remote leaves send BUM traffic (broadcast, unknown unicast, multicast) as a copy to every leaf that has the VNI, including both LEAF1 and LEAF2 of the segment. Both leaves receive the copy. If both forwarded it to SW-CE, SW-CE would get <b>two copies</b> of every broadcast. The DF election picks one forwarder per VLAN per segment, so only one copy goes out toward the segment. Known unicast is not affected: both leaves can forward unicast in all-active mode.</p>

<h3>The default election: modulo</h3>
<ol>
<li>All leaves of the segment (from type-4 routes) build an ordered list by originator IP, lowest first: ordinal 0 = 10.255.1.11 (LEAF1), ordinal 1 = 10.255.1.12 (LEAF2).</li>
<li>For each VLAN, compute <code>VLAN mod N</code>, where N is the number of leaves. The result is the ordinal of the DF.</li>
<li>After the <code>df-election wait-time</code> (3 seconds in our config) every leaf computes the same answer independently.</li>
</ol>
<table class="cmp"><tr><th>VLAN</th><th>VLAN mod 2</th><th>DF</th></tr>
<tr><td>10</td><td>0</td><td>LEAF1 (ordinal 0)</td></tr>
<tr><td>11</td><td>1</td><td>LEAF2 (ordinal 1)</td></tr>
<tr><td>20</td><td>0</td><td>LEAF1</td></tr>
<tr><td>21</td><td>1</td><td>LEAF2</td></tr>
</table>
<p>Because the election uses the VLAN number, odd and even VLANs are shared between the leaves, giving a rough balance of BUM duty across the two.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="DF and non-DF on BUM">
<rect x="20" y="60" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="85" y="96" text-anchor="middle" class="svg-muted" font-size="12">H4 sends ARP</text>
<rect x="260" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 = DF VLAN 10</text><text x="330" y="56" text-anchor="middle" class="svg-muted" font-size="12">forwards to Po10</text>
<rect x="260" y="110" width="140" height="44" rx="8" fill="#fed7aa"/><text x="330" y="130" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 = non-DF</text><text x="330" y="146" text-anchor="middle" class="svg-muted" font-size="12">drops BUM to Po10</text>
<rect x="500" y="60" width="130" height="44" rx="8" fill="#fde68a"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="12">SW-CE / H5</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="75" x2="260" y2="42"/><line x1="150" y1="90" x2="260" y2="132"/><line x1="400" y1="42" x2="500" y2="75"/></g>
<line x1="400" y1="132" x2="500" y2="90" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4"/>
<text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">blocked</text>
</svg><p class="cap">Per VLAN, one leaf forwards BUM into the segment; the other blocks it.</p></div>

<h3>The reverse direction: split horizon</h3>
<p>H5 sends a broadcast. SW-CE hashes it to, say, LEAF2. LEAF2 floods it into the fabric, including to LEAF1. LEAF1 is attached to the same segment and must <b>not</b> send it back to SW-CE (SW-CE already has it). To know the broadcast came from its own segment, LEAF2 adds the <b>ESI label</b> (advertised in the per-ES type-1 route) to the BUM packet. LEAF1 sees the label, recognises "this came from my own segment" and skips the segment-facing port. This is <b>split-horizon filtering by ESI label</b>.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show l2vpn evpn ethernet-segment detail
Ethernet Segment ID: 0000.1122.3344.5566.7788
  Interface:         Port-channel10 (up)
  Redundancy mode:   all-active
  DF election:       wait-time 3 s, state Done
  Peers:             10.255.1.12
  DF by VLAN:        10 (local), 11 (10.255.1.12), 20 (local), 21 (10.255.1.12)

LEAF2# show l2vpn evpn ethernet-segment detail
  DF by VLAN:        10 (10.255.1.11), 11 (local), 20 (10.255.1.11), 21 (local)</pre>
<p>The two lists must be <b>mirror images</b>: where LEAF1 says "local", LEAF2 says "10.255.1.11". If both say "local" for the same VLAN the segment duplicates BUM; if both say a peer, nobody forwards and BUM never reaches the segment.</p>

<div class="eg"><p><b>Worked example: three leaves in one segment.</b> If a third leaf joined the ES (IPs .11, .12, .13), N becomes 3. VLAN 10 mod 3 = 1, so ordinal 1 = 10.255.1.12 becomes the DF; VLAN 11 mod 3 = 2, so .13; VLAN 12 mod 3 = 0, so .11. A change in N shuffles the DF of every VLAN, which is why the wait-time exists: all leaves must see the same member list before electing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Lowering <code>df-election wait-time</code> to 0 for faster convergence. A leaf that boots might elect itself DF before it hears the peer's type-4 route, forwards BUM, and then loses the election once the peer appears: a short burst of duplicates. Keep a few seconds.</p></div>

<div class="exam"><p><b>Exam trap.</b> The DF concerns <b>BUM traffic toward the segment</b>, not unicast. In all-active mode, unicast uses every link. Also DF election is per VLAN (per EVI), not per segment overall.</p></div>

<div class="scn"><h4>Doubled ARP storm on one VLAN</h4><p>SW-CE's logs showed every ARP request arriving twice, but only for VLAN 11. The two leaves had been set up by different engineers: LEAF1 ran a platform default modulo election while LEAF2 was configured with a preference that made it DF for all VLANs. For VLAN 11, both leaves believed they were DF. The fix was removing the DF preference from LEAF2 so that both used the same algorithm.</p><p><b>Lesson:</b> both leaves must use the same election method and see the same member list.</p></div>

<div class="iv"><p class="q">"What is the DF in EVPN multi-homing and how is it elected?"</p><p>Strong answer: the DF is the one leaf per VLAN (per segment) that forwards BUM traffic from the fabric toward the multi-homed segment, to avoid duplicates. By default it is chosen with modulo: the VLAN number modulo the number of leaves on the segment picks the ordinal in the IP-ordered list from type-4 routes. Non-DFs block BUM toward the segment and use the ESI label for split horizon on traffic from the segment.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DF = one forwarder per VLAN per segment for BUM toward the segment.</li>
<li>Default election: VLAN mod N over the IP-ordered member list.</li>
<li>Split horizon uses the ESI label.</li>
<li>Both leaves must agree; mirror-image DF lists are healthy.</li>
</ul></div>
`,hi:`
<p>Ek building ke front desk par do receptionists kaam karte hain. Agar courier "floor 3 ke sabhi logon" ke liye parcel (broadcast) laye aur dono receptionists announce kar dein, to residents message do baar sunte hain. Isliye receptionists rule banate hain: har floor ke liye exactly ek announcer. Woh announcer us floor (VLAN) ka <b>Designated Forwarder (DF)</b> hai. Doosra receptionist, <b>non-DF</b>, us floor ke liye chup rehta hai, lekin normal one-to-one deliveries phir bhi handle karta hai.</p>

<h3>DF kyun chahiye</h3>
<p>Remote leaves BUM traffic (broadcast, unknown unicast, multicast) har us leaf ko copy bhejte hain jiske paas VNI hai, segment ke LEAF1 aur LEAF2 dono sahit. Dono leaves copy receive karte hain. Agar dono SW-CE ko forward karein to SW-CE ko har broadcast ki <b>do copies</b> milengi. DF election har VLAN per segment ek forwarder chunta hai, isliye segment ki taraf sirf ek copy jaati hai. Known unicast affect nahi hota: all-active mode mein dono leaves unicast forward kar sakte hain.</p>

<h3>Default election: modulo</h3>
<ol>
<li>Segment ke saare leaves (type-4 routes se) originator IP ke hisaab se ordered list banate hain, sabse chhota pehle: ordinal 0 = 10.255.1.11 (LEAF1), ordinal 1 = 10.255.1.12 (LEAF2).</li>
<li>Har VLAN ke liye <code>VLAN mod N</code> nikalo, jahan N leaves ki sankhya hai. Result DF ka ordinal hai.</li>
<li><code>df-election wait-time</code> (hamare config mein 3 second) ke baad har leaf independently wahi answer compute karta hai.</li>
</ol>
<table class="cmp"><tr><th>VLAN</th><th>VLAN mod 2</th><th>DF</th></tr>
<tr><td>10</td><td>0</td><td>LEAF1 (ordinal 0)</td></tr>
<tr><td>11</td><td>1</td><td>LEAF2 (ordinal 1)</td></tr>
<tr><td>20</td><td>0</td><td>LEAF1</td></tr>
<tr><td>21</td><td>1</td><td>LEAF2</td></tr>
</table>
<p>Election VLAN number use karta hai, isliye odd aur even VLANs leaves mein baant jaate hain, aur BUM ki duty dono mein lagbhag balance hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="DF and non-DF on BUM">
<rect x="20" y="60" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="85" y="96" text-anchor="middle" class="svg-muted" font-size="12">H4 ARP bhejta hai</text>
<rect x="260" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 = DF VLAN 10</text><text x="330" y="56" text-anchor="middle" class="svg-muted" font-size="12">Po10 ko forward</text>
<rect x="260" y="110" width="140" height="44" rx="8" fill="#fed7aa"/><text x="330" y="130" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 = non-DF</text><text x="330" y="146" text-anchor="middle" class="svg-muted" font-size="12">Po10 ko BUM drop</text>
<rect x="500" y="60" width="130" height="44" rx="8" fill="#fde68a"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="12">SW-CE / H5</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="75" x2="260" y2="42"/><line x1="150" y1="90" x2="260" y2="132"/><line x1="400" y1="42" x2="500" y2="75"/></g>
<line x1="400" y1="132" x2="500" y2="90" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4"/>
<text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">blocked</text>
</svg><p class="cap">Per VLAN, ek leaf segment mein BUM forward karta hai; doosra block karta hai.</p></div>

<h3>Ulti direction: split horizon</h3>
<p>H5 broadcast bhejta hai. SW-CE use, maano, LEAF2 par hash karta hai. LEAF2 use fabric mein flood karta hai, LEAF1 sahit. LEAF1 usi segment se attached hai aur use broadcast wapas SW-CE ko <b>nahi</b> bhejna chahiye (SW-CE ke paas pehle se hai). Yeh jaanne ke liye ki broadcast uske apne segment se aaya, LEAF2 BUM packet mein <b>ESI label</b> (per-ES type-1 route mein advertised) jodta hai. LEAF1 label dekhta hai, pehchanta hai "yeh mere apne segment se aaya", aur segment-facing port skip karta hai. Yeh <b>ESI label se split-horizon filtering</b> hai.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show l2vpn evpn ethernet-segment detail
Ethernet Segment ID: 0000.1122.3344.5566.7788
  Interface:         Port-channel10 (up)
  Redundancy mode:   all-active
  DF election:       wait-time 3 s, state Done
  Peers:             10.255.1.12
  DF by VLAN:        10 (local), 11 (10.255.1.12), 20 (local), 21 (10.255.1.12)

LEAF2# show l2vpn evpn ethernet-segment detail
  DF by VLAN:        10 (10.255.1.11), 11 (local), 20 (10.255.1.11), 21 (local)</pre>
<p>Dono lists <b>mirror image</b> honi chahiye: jahan LEAF1 "local" kehta hai, wahan LEAF2 "10.255.1.11" kehta hai. Agar dono same VLAN ke liye "local" kahein to segment BUM duplicate karta hai; agar dono peer kahein to koi forward nahi karta aur BUM segment tak kabhi nahi pahunchta.</p>

<div class="eg"><p><b>Worked example: ek segment mein teen leaves.</b> Agar teesra leaf ES mein juda (IPs .11, .12, .13), N 3 ho jaata hai. VLAN 10 mod 3 = 1, isliye ordinal 1 = 10.255.1.12 DF banta hai; VLAN 11 mod 3 = 2, isliye .13; VLAN 12 mod 3 = 0, isliye .11. N badalne se har VLAN ka DF shuffle hota hai, isliye wait-time hota hai: election se pehle saare leaves ko same member list dikhni chahiye.</p></div>

<div class="warn"><p><b>Common galti.</b> Tez convergence ke liye <code>df-election wait-time</code> 0 kar dena. Boot hone wala leaf peer ka type-4 route sunne se pehle khud ko DF elect kar sakta hai, BUM forward karta hai, aur peer aane par election haar jaata hai: duplicates ka chhota burst. Kuch seconds rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> DF <b>segment ki taraf BUM traffic</b> ke baare mein hai, unicast ke baare mein nahi. All-active mode mein unicast har link use karta hai. Aur DF election per VLAN (per EVI) hota hai, poore segment ke liye ek nahi.</p></div>

<div class="scn"><h4>Ek VLAN par doubled ARP storm</h4><p>SW-CE ke logs mein har ARP request do baar aati dikhi, lekin sirf VLAN 11 ke liye. Dono leaves alag engineers ne setup kiye the: LEAF1 platform default modulo election chala raha tha jabki LEAF2 ek preference ke saath configured tha jo use har VLAN ke liye DF banata tha. VLAN 11 ke liye dono leaves ko lagta tha ki woh DF hain. Fix: LEAF2 se DF preference hata di taaki dono same algorithm use karein.</p><p><b>Seekh:</b> dono leaves same election method use karein aur same member list dekhein.</p></div>

<div class="iv"><p class="q">"EVPN multi-homing mein DF kya hai aur kaise elect hota hai?"</p><p>Strong answer: DF har VLAN (per segment) ka woh ek leaf hai jo fabric se multi-homed segment ki taraf BUM traffic forward karta hai, duplicates se bachne ke liye. Default mein modulo se chuna jaata hai: VLAN number modulo segment ke leaves ki sankhya, type-4 routes se IP-ordered list ka ordinal chunta hai. Non-DFs segment ki taraf BUM block karte hain aur segment se aaye traffic par split horizon ke liye ESI label use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DF = har VLAN har segment ke liye segment ki taraf BUM ka ek forwarder.</li>
<li>Default election: IP-ordered member list par VLAN mod N.</li>
<li>Split horizon ESI label use karta hai.</li>
<li>Dono leaves agree karein; mirror-image DF lists healthy hain.</li>
</ul></div>
`}};export{e as default};