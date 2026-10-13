var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now explain and configure the full MPLS-TE chain: IGP extensions fill the TED, CSPF computes a path from constraints, RSVP-TE signals it and distributes labels, tunnels are configured at the head end with path-options, traffic is steered into them, and FRR protects them in about 50 ms. This is your checklist for SPCOR 350-501 and interviews.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="The MPLS-TE chain from information to forwarding."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">TED</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">IGP extensions</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">CSPF</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">constraints</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">RSVP-TE</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">PATH, RESV, labels</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Steer + FRR</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">traffic and protection</text></svg><p class="cap">The MPLS-TE chain from information to forwarding.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Explain the fish problem and why the IGP shortest path ignores bandwidth.</li>
<li>Name the TE attributes the IGP floods and how OSPF (type 10 opaque LSA) and IS-IS (TLV 22, wide metrics) carry them.</li>
<li>Explain CSPF and the TED.</li>
<li>Describe PATH and RESV, the ERO and RRO, soft state and label allocation.</li>
<li>Configure a tunnel with explicit and dynamic path-options on IOS XE and IOS XR, with bandwidth and priorities.</li>
<li>Choose a steering method: autoroute, forwarding adjacency, static route, PBR or CBTS.</li>
<li>Explain FRR: PLR, MP, link versus node protection, facility backup and the label stack.</li>
<li>Describe auto-bandwidth, auto-tunnel and PCE with PCEP.</li>
<li>Apply the five-step troubleshooting workflow.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>TED</dt><dd>Traffic Engineering Database built from IGP TE information.</dd><dt>CSPF</dt><dd>Constrained SPF: SPF on the TED after pruning links that fail constraints.</dd><dt>RSVP-TE</dt><dd>RFC 3209 signalling protocol for TE LSPs, with soft state.</dd><dt>ERO / RRO</dt><dd>Explicit Route Object and Record Route Object.</dd><dt>Affinity</dt><dd>Colour mask on links matched by tunnels.</dd><dt>Setup / hold priority</dt><dd>0 to 7, 0 best, used for pre-emption.</dd><dt>Autoroute announce</dt><dd>Local steering of prefixes behind the tail into the tunnel.</dd><dt>Forwarding adjacency</dt><dd>Tunnel advertised into the IGP as a link.</dd><dt>PLR / MP</dt><dd>Point of Local Repair and Merge Point in FRR.</dd><dt>Facility backup</dt><dd>One bypass tunnel protects many LSPs.</dd><dt>PCE / PCEP</dt><dd>Central path computation element and its protocol, TCP 4189.</dd><dt>SRLG</dt><dd>Shared Risk Link Group.</dd></dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr><tr><td>Tunnel direction</td><td>Unidirectional; configured on the head end only</td></tr><tr><td>Path computation</td><td>At the head end with CSPF, unless a PCE does it</td></tr><tr><td>RSVP</td><td>IP protocol 46; refresh 30 s; PATH forward, RESV back with labels</td></tr><tr><td>OSPF TE</td><td>Opaque LSA type 10 (RFC 3630)</td></tr><tr><td>IS-IS TE</td><td>TLV 22 sub-TLVs (RFC 5305), metric-style wide required</td></tr><tr><td>Priorities</td><td>0 to 7, setup and hold, 0 is best</td></tr><tr><td>FRR time</td><td>About 50 ms, depends on fast detection</td></tr><tr><td>Link vs node</td><td>MP is NHOP for link protection, NNHOP for node protection</td></tr><tr><td>Make-before-break</td><td>Shared-explicit reservations, new LSP ID, hitless</td></tr><tr><td>Auto-bandwidth</td><td>Measures traffic, re-signals with min and max bounds</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
show mpls traffic-eng tunnels
show mpls traffic-eng topology
show ip rsvp neighbor
show ip rsvp sender
show ip rsvp reservation
show mpls forwarding-table
<span class="c">! IOS XR</span>
show mpls traffic-eng tunnels detail
show mpls traffic-eng topology
show rsvp neighbors
show rsvp session
show mpls forwarding</pre>
<div class="eg"><p><b>Self-test.</b> Design: PE1 to PE2, 4 Gbps, must avoid links coloured red, must survive any single link failure in about 50 ms, and traffic must use the tunnel only for the prefix 203.0.113.0/24. Answer: dynamic path-option with affinity excluding red and bandwidth 4G; fast-reroute on the tunnel and auto-tunnel backup on every core interface with BFD where links are not direct; a static route for 203.0.113.0/24 to the tunnel instead of autoroute; and a matching tunnel from PE2 if the return traffic also needs the path.</p></div>
<div class="warn"><p><b>Common mistake in the exam.</b> Confusing path-option numbers with priorities, or saying the transit routers need a tunnel interface. Another: assuming FRR replaces the head end re-optimisation; it only buys time.</p></div>
<div class="exam"><p><b>Final trap.</b> Read whether a question asks about <i>information</i> (IGP extensions, TED), <i>computation</i> (CSPF, PCE), <i>signalling</i> (RSVP) or <i>forwarding</i> (steering, FRR). Placing the topic in the right stage removes most wrong answers.</p></div>
<div class="scn"><h4>A tidy handover</h4><p>A provider asked a new engineer to hand over an MPLS-TE design for a major customer. The one-page summary listed the tunnel pair with both directions, the affinity and bandwidth, the path-option order, the FRR and auto-tunnel backup scope, the steering method and the five troubleshooting checks. The next on-call engineer solved a "tunnel up, no traffic" incident in ten minutes from that page.</p><p><b>Lesson:</b> a good TE design is documented as a chain: information, computation, signalling, steering, protection.</p></div>
<div class="iv"><p class="q">"Summarise MPLS-TE in one minute."</p><p>The IGP floods link bandwidth, affinity and TE metric into the TED. The head end runs CSPF to compute a constrained path and signals it with RSVP-TE: PATH goes downstream with an explicit route, RESV returns upstream reserving bandwidth and carrying labels. Tunnels are unidirectional and configured at the head end with path-options. Traffic is steered in with autoroute, static routes, PBR or CBTS. FRR with facility backup repairs a failure in around 50 ms and the head end re-optimises with make-before-break. Auto-bandwidth, auto-tunnels and a PCE automate it at scale.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain: IGP extensions, TED, CSPF, RSVP-TE, steering, FRR.</li>
<li>Tunnels are unidirectional; the head end computes, labels come back in RESV.</li>
<li>Facility backup: one bypass for many LSPs, about 50 ms.</li>
<li>Automation: auto-bandwidth, auto-tunnel, PCE with PCEP.</li>
<li>Practise related ideas in spcor-isis, spcor-mpls-ldp, jncis-ha and encor-l2.</li>
</ul></div>
`,hi:`
<p>Ab aap poori MPLS-TE chain samjha aur configure kar sakte ho: IGP extensions TED bharte hain, CSPF constraints se path compute karta hai, RSVP-TE use signal karke labels distribute karta hai, tunnels head end par path-options ke saath configure hote hain, traffic unme steer hota hai, aur FRR unhe lagbhag 50 ms mein protect karta hai. Yeh SPCOR 350-501 aur interviews ke liye aapki checklist hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Information se forwarding tak MPLS-TE chain."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">TED</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">IGP extensions</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">CSPF</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">constraints</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">RSVP-TE</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">PATH, RESV, labels</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Steer + FRR</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">traffic aur protection</text></svg><p class="cap">Information se forwarding tak MPLS-TE chain.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Fish problem samjhao aur batao IGP shortest path bandwidth kyun ignore karta hai.</li>
<li>Batao IGP kaunse TE attributes flood karta hai aur OSPF (type 10 opaque LSA) aur IS-IS (TLV 22, wide metrics) unhe kaise carry karte hain.</li>
<li>CSPF aur TED samjhao.</li>
<li>PATH aur RESV, ERO aur RRO, soft state aur label allocation describe karo.</li>
<li>IOS XE aur IOS XR par bandwidth aur priorities ke saath explicit aur dynamic path-options wala tunnel configure karo.</li>
<li>Steering method chuno: autoroute, forwarding adjacency, static route, PBR ya CBTS.</li>
<li>FRR samjhao: PLR, MP, link versus node protection, facility backup aur label stack.</li>
<li>Auto-bandwidth, auto-tunnel aur PCEP ke saath PCE describe karo.</li>
<li>Paanch-step troubleshooting workflow lagao.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>TED</dt><dd>IGP TE information se bana Traffic Engineering Database.</dd><dt>CSPF</dt><dd>Constrained SPF: constraints fail karne wale links prune karke TED par SPF.</dd><dt>RSVP-TE</dt><dd>TE LSPs ke liye RFC 3209 signalling protocol, soft state ke saath.</dd><dt>ERO / RRO</dt><dd>Explicit Route Object aur Record Route Object.</dd><dt>Affinity</dt><dd>Links par colour mask jo tunnels match karte hain.</dd><dt>Setup / hold priority</dt><dd>0 se 7, 0 sabse achha, pre-emption ke liye.</dd><dt>Autoroute announce</dt><dd>Tail ke peeche ke prefixes ko tunnel mein local steering.</dd><dt>Forwarding adjacency</dt><dd>Tunnel IGP mein link ki tarah advertise hota hai.</dd><dt>PLR / MP</dt><dd>FRR mein Point of Local Repair aur Merge Point.</dd><dt>Facility backup</dt><dd>Ek bypass tunnel kai LSPs protect karta hai.</dd><dt>PCE / PCEP</dt><dd>Central path computation element aur uska protocol, TCP 4189.</dd><dt>SRLG</dt><dd>Shared Risk Link Group.</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr><tr><td>Tunnel direction</td><td>Unidirectional; sirf head end par configure</td></tr><tr><td>Path computation</td><td>Head end par CSPF se, jab tak PCE na kare</td></tr><tr><td>RSVP</td><td>IP protocol 46; refresh 30 s; PATH aage, RESV labels ke saath wapas</td></tr><tr><td>OSPF TE</td><td>Opaque LSA type 10 (RFC 3630)</td></tr><tr><td>IS-IS TE</td><td>TLV 22 sub-TLVs (RFC 5305), metric-style wide zaroori</td></tr><tr><td>Priorities</td><td>0 se 7, setup aur hold, 0 sabse achha</td></tr><tr><td>FRR time</td><td>Lagbhag 50 ms, fast detection par depend</td></tr><tr><td>Link vs node</td><td>Link protection mein MP NHOP, node protection mein NNHOP</td></tr><tr><td>Make-before-break</td><td>Shared-explicit reservations, naya LSP ID, hitless</td></tr><tr><td>Auto-bandwidth</td><td>Traffic measure karta hai, min aur max bounds ke saath re-signal</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
show mpls traffic-eng tunnels
show mpls traffic-eng topology
show ip rsvp neighbor
show ip rsvp sender
show ip rsvp reservation
show mpls forwarding-table
<span class="c">! IOS XR</span>
show mpls traffic-eng tunnels detail
show mpls traffic-eng topology
show rsvp neighbors
show rsvp session
show mpls forwarding</pre>
<div class="eg"><p><b>Self-test.</b> Design: PE1 se PE2, 4 Gbps, red colour wale links avoid karne hain, kisi bhi single link failure ko lagbhag 50 ms mein survive karna hai, aur traffic sirf prefix 203.0.113.0/24 ke liye tunnel use kare. Answer: red exclude karne wali affinity aur 4G bandwidth ke saath dynamic path-option; tunnel par fast-reroute aur har core interface par auto-tunnel backup, jahan links direct nahi wahan BFD; autoroute ki jagah 203.0.113.0/24 ke liye tunnel ki taraf static route; aur return traffic ko bhi path chahiye to PE2 se matching tunnel.</p></div>
<div class="warn"><p><b>Exam mein common mistake.</b> Path-option numbers ko priorities se confuse karna, ya yeh kehna ki transit routers ko tunnel interface chahiye. Ek aur: FRR ko head end re-optimisation ka replacement maan lena; woh sirf waqt kharidta hai.</p></div>
<div class="exam"><p><b>Final trap.</b> Dekho ki question <i>information</i> (IGP extensions, TED), <i>computation</i> (CSPF, PCE), <i>signalling</i> (RSVP) ya <i>forwarding</i> (steering, FRR) ke baare mein hai. Topic ko sahi stage mein rakhne se zyadatar galat answers hat jaate hain.</p></div>
<div class="scn"><h4>Saaf handover</h4><p>Ek provider ne naye engineer se bade customer ke MPLS-TE design ka handover maanga. Ek page ke summary mein tunnel pair dono directions ke saath, affinity aur bandwidth, path-option order, FRR aur auto-tunnel backup scope, steering method aur paanch troubleshooting checks the. Agle on-call engineer ne us page se "tunnel up, traffic nahi" incident das minute mein solve kiya.</p><p><b>Lesson:</b> achha TE design chain ki tarah document hota hai: information, computation, signalling, steering, protection.</p></div>
<div class="iv"><p class="q">"MPLS-TE ko ek minute mein summarise karo."</p><p>IGP link bandwidth, affinity aur TE metric TED mein flood karta hai. Head end CSPF se constrained path compute karta hai aur RSVP-TE se signal karta hai: PATH explicit route ke saath downstream jaata hai, RESV upstream wapas aakar bandwidth reserve karta hai aur labels carry karta hai. Tunnels unidirectional hain aur head end par path-options ke saath configure hote hain. Traffic autoroute, static routes, PBR ya CBTS se steer hota hai. Facility backup ke saath FRR failure ko lagbhag 50 ms mein repair karta hai aur head end make-before-break se re-optimise karta hai. Auto-bandwidth, auto-tunnels aur PCE ise scale par automate karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain: IGP extensions, TED, CSPF, RSVP-TE, steering, FRR.</li>
<li>Tunnels unidirectional hain; head end compute karta hai, labels RESV mein wapas aate hain.</li>
<li>Facility backup: kai LSPs ke liye ek bypass, lagbhag 50 ms.</li>
<li>Automation: auto-bandwidth, auto-tunnel, PCEP ke saath PCE.</li>
<li>Related ideas spcor-isis, spcor-mpls-ldp, jncis-ha aur encor-l2 mein practise karo.</li>
</ul></div>
`}};export{e as default};