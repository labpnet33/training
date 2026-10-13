var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter pulls the six design cases together. Remember the pattern the exam uses: a customer story, a list of requirements and constraints, and four options where only one fits everything. Always read the constraints first (budget, WAN type, staff, failover time) because they eliminate options.</p>

<h3>One-page decision guide</h3>
<table class="cmp"><tr><th>Customer</th><th>Problem</th><th>Design answer</th></tr>
<tr><td>Harbourline Insurance</td><td>Choppy calls beside backups</td><td>8-class model, trust boundary at access, map to provider 4 classes both ways</td></tr>
<tr><td>Kestrel Logistics</td><td>QoS ignored on a 10 Mb/s circuit on a 1 Gb/s port</td><td>Hierarchical shaper at contract rate with LLQ and CBWFQ child</td></tr>
<tr><td>Meridian Securities</td><td>RP single point of failure, floods on trading VLANs</td><td>SSM for known feeds, anycast RP with MSDP for the rest, IGMP snooping with querier</td></tr>
<tr><td>Sundara University</td><td>IPv6 mandate, IPv4 exhaustion, IPv4-only WAN</td><td>Dual stack, GRE tunnels as bridge, NAT64/DNS64 for IPv6-only Wi-Fi, IPv6 first-hop security</td></tr>
<tr><td>Larkfield Hospitals</td><td>Flat network, single AAA server</td><td>Redundant ISE PSNs, phased 802.1X and MAB, TrustSec SGT/SGACL, critical authentication</td></tr>
<tr><td>Orchid Retail</td><td>Backhaul, PCI isolation, branch wireless</td><td>SD-Access VNs and SGTs, SD-WAN with DIA and separate payment VPN, FlexConnect at stores</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Services design map">
<rect x="10" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">QoS: mark, queue, shape</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Multicast: PIM, RP, IGMP</text>
<rect x="440" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">IPv6: dual stack, NAT64</text>
<rect x="10" y="90" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">Services: DHCP, DNS, NTP</text>
<rect x="225" y="90" width="190" height="50" rx="8" fill="#fed7aa"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">AAA: ISE, TrustSec</text>
<rect x="440" y="90" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="535" y="120" text-anchor="middle" class="svg-ink" font-size="13">Fabric, SD-WAN, edge</text>
<rect x="10" y="165" width="620" height="32" rx="8" fill="#e2e8f0"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="13">Underneath all: redundancy, failure testing, constraints first</text>
</svg><p class="cap">The six design areas in this module sit on one habit: design for failure.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Choose between 4, 8 and 12-class QoS models and name the DSCP values (EF 46, CS3, CS6, AF4x, AF2x, CS1).</li>
<li>Place the trust boundary and explain conditional trust for phones.</li>
<li>Explain shaping versus policing and design HQoS for a slow WAN circuit.</li>
<li>Pick PIM-SM, SSM or BiDir; pick static RP, Auto-RP or BSR; design anycast RP with MSDP.</li>
<li>Use IGMP snooping and a querier; explain SD-Access head-end versus native multicast.</li>
<li>Compare dual stack, tunnelling and NAT64/DNS64 and build an addressing plan.</li>
<li>Design redundant DHCP, DNS, NTP and AAA, and phase a NAC rollout with ISE.</li>
<li>Explain SGT classification, propagation and enforcement.</li>
<li>Distinguish macro (VN) and micro (SGT) segmentation, and pick a wireless mode.</li>
<li>Choose an Internet breakout model and justify it.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LLQ</dt><dd>Strict-priority queue for voice, policed so it cannot starve others.</dd>
<dt>HQoS</dt><dd>Hierarchical QoS: a parent shaper with child queuing policy.</dd>
<dt>RPF</dt><dd>Reverse path forwarding check using the unicast table.</dd>
<dt>MSDP</dt><dd>Protocol that shares active multicast sources between RPs or domains.</dd>
<dt>SSM</dt><dd>Source-specific multicast, 232.0.0.0/8 by default, needs IGMPv3.</dd>
<dt>DNS64</dt><dd>Synthesises AAAA records for IPv4-only names, used with NAT64.</dd>
<dt>PSN</dt><dd>ISE policy service node that answers RADIUS requests.</dd>
<dt>SGT / SGACL</dt><dd>Group tag and the group-to-group access list.</dd>
<dt>VN</dt><dd>SD-Access virtual network, a VRF-based macro segment.</dd>
<dt>FlexConnect</dt><dd>Wireless mode with local switching at the branch.</dd>
<dt>DIA</dt><dd>Direct Internet access from the branch.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>QoS acts only during congestion; classify and mark at the edge.</li>
<li>Shaping buffers and is egress only; policing drops or re-marks.</li>
<li>Keep priority queue traffic to about one third of the link.</li>
<li>SSM needs IGMPv3 and no RP; BiDir has no source registration.</li>
<li>Anycast RP needs MSDP or RFC 4610; use different addresses for anycast and MSDP source.</li>
<li>Well-known NAT64 prefix is 64:ff9b::/96; SLAAC needs /64.</li>
<li>RADIUS for network access, TACACS+ for device admin; monitor, then low-impact, then closed.</li>
<li>SD-WAN segments with VPNs; SD-Access segments with VNs and SGTs.</li>
</ul>

<div class="exam"><p><b>Exam strategy.</b> Underline constraints (no new circuits, 5-second failover, IPv4-only provider, small team). Remove options that violate any constraint, then choose the simplest option that meets all requirements.</p></div>

<div class="scn"><h4>Putting it together: the merger weekend</h4><p>A retailer merged with a smaller chain. Overnight, 40 stores joined the SD-WAN, but market-style price feeds (multicast) stopped, guest Wi-Fi leaked into the payment VLAN, and voice dropped. Checking in order: multicast needed PIM on the new service VPN; the merged ISE had no SGT for payment; the shaper on the new circuits was higher than the contract. Each fix matched one chapter of this module.</p><p><b>Lesson:</b> services fail in layers; troubleshoot them one layer at a time.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design network services for a new multi-site customer."</p><p>Start with requirements and constraints, then QoS model and trust, multicast needs, IPv6 plan, core services and AAA with segmentation, fabric or SD-WAN policy, wireless mode and Internet breakout. Close with high availability and a failure test plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Constraints decide the design; read them first.</li>
<li>Every service needs redundancy and a tested failure plan.</li>
<li>Mark at the edge, shape to the contract, prioritise voice.</li>
<li>Prefer SSM for known sources and anycast RP elsewhere.</li>
<li>Segment by identity with VNs and SGTs, not by VLAN alone.</li>
</ul></div>
`,hi:`
<p>Yeh chapter chhe design cases ko ek saath jodta hai. Exam ka pattern yaad rakho: customer story, requirements aur constraints ki list, aur chaar options jinmein se sirf ek sab kuch fit karta hai. Hamesha pehle constraints padho (budget, WAN type, staff, failover time) kyunki woh options hata dete hain.</p>

<h3>Ek page ki decision guide</h3>
<table class="cmp"><tr><th>Customer</th><th>Problem</th><th>Design answer</th></tr>
<tr><td>Harbourline Insurance</td><td>Backups ke saath choppy calls</td><td>8-class model, access par trust boundary, provider ki 4 classes mein dono taraf mapping</td></tr>
<tr><td>Kestrel Logistics</td><td>1 Gb/s port par 10 Mb/s circuit mein QoS ignore</td><td>Contract rate par hierarchical shaper, LLQ aur CBWFQ child</td></tr>
<tr><td>Meridian Securities</td><td>RP single point of failure, trading VLANs par flooding</td><td>Known feeds ke liye SSM, baaki ke liye MSDP ke saath anycast RP, querier ke saath IGMP snooping</td></tr>
<tr><td>Sundara University</td><td>IPv6 mandate, IPv4 exhaustion, IPv4-only WAN</td><td>Dual stack, bridge ke taur par GRE tunnels, IPv6-only Wi-Fi ke liye NAT64/DNS64, IPv6 first-hop security</td></tr>
<tr><td>Larkfield Hospitals</td><td>Flat network, single AAA server</td><td>Redundant ISE PSNs, phased 802.1X aur MAB, TrustSec SGT/SGACL, critical authentication</td></tr>
<tr><td>Orchid Retail</td><td>Backhaul, PCI isolation, branch wireless</td><td>SD-Access VNs aur SGTs, DIA aur alag payment VPN wala SD-WAN, stores mein FlexConnect</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Services design map">
<rect x="10" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">QoS: mark, queue, shape</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Multicast: PIM, RP, IGMP</text>
<rect x="440" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">IPv6: dual stack, NAT64</text>
<rect x="10" y="90" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">Services: DHCP, DNS, NTP</text>
<rect x="225" y="90" width="190" height="50" rx="8" fill="#fed7aa"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">AAA: ISE, TrustSec</text>
<rect x="440" y="90" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="535" y="120" text-anchor="middle" class="svg-ink" font-size="13">Fabric, SD-WAN, edge</text>
<rect x="10" y="165" width="620" height="32" rx="8" fill="#e2e8f0"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="13">Sabke neeche: redundancy, failure testing, pehle constraints</text>
</svg><p class="cap">Is module ke chhe design areas ek habit par tike hain: failure ke liye design karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>4, 8 aur 12-class QoS models ke beech chuno aur DSCP values batao (EF 46, CS3, CS6, AF4x, AF2x, CS1).</li>
<li>Trust boundary place karo aur phones ke liye conditional trust samjhao.</li>
<li>Shaping versus policing samjhao aur slow WAN circuit ke liye HQoS design karo.</li>
<li>PIM-SM, SSM ya BiDir chuno; static RP, Auto-RP ya BSR chuno; MSDP ke saath anycast RP design karo.</li>
<li>IGMP snooping aur querier use karo; SD-Access head-end versus native multicast samjhao.</li>
<li>Dual stack, tunnelling aur NAT64/DNS64 compare karo aur addressing plan banao.</li>
<li>Redundant DHCP, DNS, NTP aur AAA design karo, aur ISE ke saath NAC rollout phase karo.</li>
<li>SGT classification, propagation aur enforcement samjhao.</li>
<li>Macro (VN) aur micro (SGT) segmentation mein farak batao, aur wireless mode chuno.</li>
<li>Internet breakout model chuno aur justify karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LLQ</dt><dd>Voice ke liye strict-priority queue, policed taaki doosron ko starve na kare.</dd>
<dt>HQoS</dt><dd>Hierarchical QoS: parent shaper aur child queuing policy.</dd>
<dt>RPF</dt><dd>Unicast table se reverse path forwarding check.</dd>
<dt>MSDP</dt><dd>Protocol jo RPs ya domains ke beech active multicast sources share karta hai.</dd>
<dt>SSM</dt><dd>Source-specific multicast, default 232.0.0.0/8, IGMPv3 chahiye.</dd>
<dt>DNS64</dt><dd>IPv4-only names ke liye AAAA records synthesise karta hai, NAT64 ke saath.</dd>
<dt>PSN</dt><dd>ISE policy service node jo RADIUS requests ka jawab deta hai.</dd>
<dt>SGT / SGACL</dt><dd>Group tag aur group-to-group access list.</dd>
<dt>VN</dt><dd>SD-Access virtual network, VRF-based macro segment.</dd>
<dt>FlexConnect</dt><dd>Branch mein local switching wala wireless mode.</dd>
<dt>DIA</dt><dd>Branch se direct Internet access.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>QoS sirf congestion mein kaam karta hai; edge par classify aur mark karo.</li>
<li>Shaping buffer karti hai aur sirf egress hai; policing drop ya re-mark karti hai.</li>
<li>Priority queue traffic link ka lagbhag ek tihai rakho.</li>
<li>SSM ko IGMPv3 chahiye aur RP nahi; BiDir mein source registration nahi.</li>
<li>Anycast RP ko MSDP ya RFC 4610 chahiye; anycast aur MSDP source ke liye alag addresses.</li>
<li>Well-known NAT64 prefix 64:ff9b::/96; SLAAC ko /64 chahiye.</li>
<li>Network access ke liye RADIUS, device admin ke liye TACACS+; monitor, phir low-impact, phir closed.</li>
<li>SD-WAN VPNs se segment karta hai; SD-Access VNs aur SGTs se.</li>
</ul>

<div class="exam"><p><b>Exam strategy.</b> Constraints underline karo (naye circuits nahi, 5-second failover, IPv4-only provider, chhoti team). Jo option kisi constraint ko todta hai use hatao, phir sabse simple option chuno jo saari requirements poori kare.</p></div>

<div class="scn"><h4>Sab kuch milakar: merger weekend</h4><p>Ek retailer ne chhoti chain ke saath merge kiya. Raat bhar mein 40 stores SD-WAN mein aaye, lekin market-style price feeds (multicast) ruk gaye, guest Wi-Fi payment VLAN mein leak hua, aur voice drop hui. Order mein check karne par: multicast ko naye service VPN par PIM chahiye tha; merged ISE mein payment ke liye SGT nahi tha; naye circuits par shaper contract se zyada tha. Har fix is module ke ek chapter se match karta tha.</p><p><b>Seekh:</b> services layers mein fail hoti hain; unhe ek ek layer mein troubleshoot karo.</p></div>

<div class="iv"><p class="q">"Naye multi-site customer ke liye network services design kaise karoge, samjhao."</p><p>Requirements aur constraints se shuru, phir QoS model aur trust, multicast needs, IPv6 plan, core services aur segmentation ke saath AAA, fabric ya SD-WAN policy, wireless mode aur Internet breakout. End mein high availability aur failure test plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Constraints design tay karte hain; pehle unhe padho.</li>
<li>Har service ko redundancy aur tested failure plan chahiye.</li>
<li>Edge par mark karo, contract par shape karo, voice prioritise karo.</li>
<li>Known sources ke liye SSM, baaki jagah anycast RP.</li>
<li>Sirf VLAN se nahi, identity se segment karo VNs aur SGTs ke saath.</li>
</ul></div>
`}};export{e as default};