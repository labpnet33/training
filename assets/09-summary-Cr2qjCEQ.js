var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the full high availability toolbox for an SP core: BFD for fast detection, graceful restart and NSF for cooperative recovery, NSR with SSO for invisible recovery, and link aggregation with LACP for capacity and link redundancy. This chapter is your checklist before the SPCOR 350-501 exam and before an interview.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="The four building blocks of this module."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">BFD</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">detect in ms</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">NSF + GR</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">forward, helpers wait</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">NSR + SSO</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">state synced</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">LAG + LACP</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">share and survive</text></svg><p class="cap">The four building blocks of this module.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Explain why an up interface does not prove a working path, and why BFD is faster than IGP hellos.</li>
<li>Calculate BFD detection time from interval and multiplier, and predict the result when two ends differ.</li>
<li>Name the BFD ports (3784, 4784, 3785) and the session states.</li>
<li>Enable BFD for IS-IS, OSPF, BGP and static routes on IOS XE and IOS XR, and read the verification commands.</li>
<li>Distinguish NSF, graceful restart, NSR, SSO, RPR and ISSU.</li>
<li>Choose between graceful restart and NSR, and explain why BFD may defeat graceful restart.</li>
<li>Explain LACP modes, timers, minimum-links, hashing, and Layer 3 bundles on IOS XR.</li>
<li>Compare BFD over Bundle and BFD over Logical Bundle.</li>
<li>Walk through the bottom-up troubleshooting workflow for a BFD, restart or bundle problem.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>BFD</dt><dd>Bidirectional Forwarding Detection, RFC 5880, a fast protocol-independent liveness check.</dd><dt>Detect multiplier</dt><dd>Number of missed packets before a session is declared down.</dd><dt>NSF</dt><dd>Non-Stop Forwarding: forwarding continues on the old FIB during a control-plane restart.</dd><dt>Graceful restart</dt><dd>Protocol extension that asks neighbours to keep routes stale during a restart.</dd><dt>Helper</dt><dd>Neighbour that keeps the restarting router state during the grace period.</dd><dt>NSR</dt><dd>Non-Stop Routing: protocol state is synchronised to the standby so neighbours see no restart.</dd><dt>SSO</dt><dd>Stateful Switchover: standby processor with synchronised state.</dd><dt>ISSU</dt><dd>In-Service Software Upgrade with minimal or no traffic loss.</dd><dt>LACP</dt><dd>Link Aggregation Control Protocol, IEEE 802.1AX.</dd><dt>BoB</dt><dd>BFD over Bundle: one BFD session per member link.</dd><dt>MC-LAG</dt><dd>Multichassis link aggregation across two devices.</dd><dt>ESI</dt><dd>Ethernet Segment Identifier used by EVPN multihoming.</dd></dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact to remember</th></tr><tr><td>BFD ports</td><td>UDP 3784 single hop, 4784 multihop, 3785 echo</td></tr><tr><td>Detection time</td><td>Neighbour transmit interval times multiplier; slower side wins</td></tr><tr><td>BFD standards</td><td>RFC 5880 base, 5881 IPv4/IPv6 single hop, 5883 multihop, 7130 micro-BFD for bundles</td></tr><tr><td>IS-IS GR</td><td>Restart TLV, RFC 5306</td></tr><tr><td>OSPF GR</td><td>Grace LSA, RFC 3623; Cisco and IETF flavours do not mix</td></tr><tr><td>BGP GR</td><td>RFC 4724, End-of-RIB, restart-time, stalepath-time</td></tr><tr><td>LDP GR</td><td>RFC 3478</td></tr><tr><td>NSF vs NSR</td><td>NSF needs helpers and is visible; NSR is hidden and needs none</td></tr><tr><td>LACP</td><td>IEEE 802.1AX, fast 1 second, slow 30 second, active/passive</td></tr><tr><td>Bundle protection</td><td>minimum-links or minimum-bandwidth takes a degraded bundle down</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
show bfd neighbors details
show redundancy
show etherchannel summary
show isis neighbors
<span class="c">! IOS XR</span>
show bfd session detail
show bundle Bundle-Ether1
show lacp neighbor
show isis neighbors
show redundancy
show bgp neighbors</pre>
<div class="eg"><p><b>Self-test.</b> Two P routers are joined by a 4 x 10G L3 bundle. The bundle must carry up to 25 Gbps. Choose minimum-links 3 (three members give 30G, two give only 20G). Add per-member BFD at 50 ms by 3 so a silent member leaves in 150 ms, enable IS-IS BFD for the adjacency, fast LACP timers, NSR for IS-IS, BGP and LDP on dual-RP chassis, and test with a forced switchover. If you can justify every item, you are exam-ready.</p></div>
<div class="warn"><p><b>Common mistake in the exam.</b> Picking NSF when the question says "neighbours do not need to support any feature". That is NSR. Also, selecting echo when the question asks for the standard BFD port for single-hop control packets (3784).</p></div>
<div class="exam"><p><b>Final trap.</b> Check whether the question is about <i>detection</i> (BFD, LACP timers), <i>recovery of the control plane</i> (NSF, NSR) or <i>capacity</i> (LAG, minimum-links). Picking the right family removes most wrong answers.</p></div>
<div class="scn"><h4>Closing the loop on a core upgrade</h4><p>A provider planned a core upgrade. The runbook required: BFD at 150 ms on all non-direct links, graceful restart and NSR enabled on every PE, per-member BFD and minimum-links on every bundle, and a rehearsal in the lab for the switchover. The upgrade ran with zero customer-visible loss, and the same checklist became the standard change template.</p><p><b>Lesson:</b> HA is a set of tested features that match, not a single command.</p></div>
<div class="iv"><p class="q">"Give me a one-minute summary of high availability in an SP core."</p><p>I separate detection, recovery and capacity. BFD gives millisecond failure detection for IS-IS, BGP and static routes. NSF with graceful restart keeps forwarding while a neighbour restarts but needs helpers; NSR with SSO hides the switchover completely. Bundles with LACP add capacity and link redundancy, protected with minimum-links and per-member BFD. I test every feature with a forced failure before production.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Detection: BFD; recovery of the control plane: NSF, GR, NSR with SSO; capacity: LAG with LACP.</li>
<li>Detection time is multiplier times the neighbour transmit interval.</li>
<li>NSR needs no neighbour support; graceful restart does.</li>
<li>Per-member BFD and minimum-links protect bundles.</li>
<li>Practise related ideas in spcor-isis, spcor-mpls-ldp, jncis-ha and encor-l2.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas SP core ke liye poora high availability toolbox hai: fast detection ke liye BFD, cooperative recovery ke liye graceful restart aur NSF, invisible recovery ke liye SSO ke saath NSR, aur capacity aur link redundancy ke liye LACP ke saath link aggregation. Yeh chapter SPCOR 350-501 exam aur interview se pehle aapki checklist hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Is module ke chaar building blocks."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">BFD</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">ms mein detect</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">NSF + GR</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">forward, helpers wait</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">NSR + SSO</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">state synced</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">LAG + LACP</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">baanto aur bacho</text></svg><p class="cap">Is module ke chaar building blocks.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Samjha sako ki up interface working path ka saboot kyun nahi, aur BFD IGP hellos se tez kyun hai.</li>
<li>Interval aur multiplier se BFD detection time nikalo, aur dono ends alag hon to result predict karo.</li>
<li>BFD ports (3784, 4784, 3785) aur session states batao.</li>
<li>IOS XE aur IOS XR par IS-IS, OSPF, BGP aur static routes ke liye BFD enable karo aur verification commands padho.</li>
<li>NSF, graceful restart, NSR, SSO, RPR aur ISSU mein fark batao.</li>
<li>Graceful restart aur NSR mein chuno, aur batao BFD graceful restart ko kaise haraa sakta hai.</li>
<li>LACP modes, timers, minimum-links, hashing aur IOS XR par Layer 3 bundles samjhao.</li>
<li>BFD over Bundle aur BFD over Logical Bundle ki tulna karo.</li>
<li>BFD, restart ya bundle problem ke liye bottom-up troubleshooting workflow chalo.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>BFD</dt><dd>Bidirectional Forwarding Detection, RFC 5880, fast protocol-independent liveness check.</dd><dt>Detect multiplier</dt><dd>Session down declare hone se pehle missed packets ki sankhya.</dd><dt>NSF</dt><dd>Non-Stop Forwarding: control-plane restart ke dauran purane FIB par forwarding chalti rehti hai.</dd><dt>Graceful restart</dt><dd>Protocol extension jo neighbours se restart ke dauran routes stale rakhne ko kehta hai.</dd><dt>Helper</dt><dd>Neighbour jo grace period mein restarting router ki state rakhta hai.</dd><dt>NSR</dt><dd>Non-Stop Routing: protocol state standby se synchronise hoti hai, isliye neighbours ko restart nahi dikhta.</dd><dt>SSO</dt><dd>Stateful Switchover: synchronised state wala standby processor.</dd><dt>ISSU</dt><dd>In-Service Software Upgrade, minimal ya zero traffic loss ke saath.</dd><dt>LACP</dt><dd>Link Aggregation Control Protocol, IEEE 802.1AX.</dd><dt>BoB</dt><dd>BFD over Bundle: har member link par ek BFD session.</dd><dt>MC-LAG</dt><dd>Do devices ke across multichassis link aggregation.</dd><dt>ESI</dt><dd>EVPN multihoming mein use hone wala Ethernet Segment Identifier.</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakhne wala fact</th></tr><tr><td>BFD ports</td><td>UDP 3784 single hop, 4784 multihop, 3785 echo</td></tr><tr><td>Detection time</td><td>Neighbour transmit interval guna multiplier; slow side jeetti hai</td></tr><tr><td>BFD standards</td><td>RFC 5880 base, 5881 IPv4/IPv6 single hop, 5883 multihop, 7130 bundles ke liye micro-BFD</td></tr><tr><td>IS-IS GR</td><td>Restart TLV, RFC 5306</td></tr><tr><td>OSPF GR</td><td>Grace LSA, RFC 3623; Cisco aur IETF flavours mix nahi hote</td></tr><tr><td>BGP GR</td><td>RFC 4724, End-of-RIB, restart-time, stalepath-time</td></tr><tr><td>LDP GR</td><td>RFC 3478</td></tr><tr><td>NSF vs NSR</td><td>NSF ko helpers chahiye aur visible hai; NSR hidden hai aur kisi ko nahi chahiye</td></tr><tr><td>LACP</td><td>IEEE 802.1AX, fast 1 second, slow 30 second, active/passive</td></tr><tr><td>Bundle protection</td><td>minimum-links ya minimum-bandwidth degraded bundle ko down kar deta hai</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
show bfd neighbors details
show redundancy
show etherchannel summary
show isis neighbors
<span class="c">! IOS XR</span>
show bfd session detail
show bundle Bundle-Ether1
show lacp neighbor
show isis neighbors
show redundancy
show bgp neighbors</pre>
<div class="eg"><p><b>Self-test.</b> Do P routers 4 x 10G L3 bundle se jude hain. Bundle ko 25 Gbps tak carry karna hai. Minimum-links 3 chuno (teen members 30G dete hain, do sirf 20G). Per-member BFD 50 ms guna 3 lagao taaki silent member 150 ms mein nikal jaaye, adjacency ke liye IS-IS BFD enable karo, fast LACP timers, dual-RP chassis par IS-IS, BGP aur LDP ke liye NSR, aur forced switchover se test karo. Har item ka reason de sako to aap exam-ready ho.</p></div>
<div class="warn"><p><b>Exam mein common mistake.</b> Jab question kahe "neighbours ko koi feature support nahi karna padta" tab NSF chunna. Woh NSR hai. Aur jab question single-hop control packets ka standard BFD port poochhe tab echo chunna (sahi 3784 hai).</p></div>
<div class="exam"><p><b>Final trap.</b> Check karo ki question <i>detection</i> (BFD, LACP timers), <i>control plane recovery</i> (NSF, NSR) ya <i>capacity</i> (LAG, minimum-links) ke baare mein hai. Sahi family chunne se zyadatar galat answers hat jaate hain.</p></div>
<div class="scn"><h4>Core upgrade ka loop band karna</h4><p>Ek provider ne core upgrade plan kiya. Runbook mein tha: saare non-direct links par 150 ms BFD, har PE par graceful restart aur NSR, har bundle par per-member BFD aur minimum-links, aur switchover ke liye lab mein rehearsal. Upgrade zero customer-visible loss ke saath chala, aur wahi checklist standard change template ban gayi.</p><p><b>Lesson:</b> HA tested aur match karne wale features ka set hai, ek akela command nahi.</p></div>
<div class="iv"><p class="q">"SP core mein high availability ka ek minute ka summary do."</p><p>Main detection, recovery aur capacity alag rakhta hoon. BFD IS-IS, BGP aur static routes ke liye millisecond failure detection deta hai. Graceful restart ke saath NSF neighbour restart ke dauran forwarding rakhta hai lekin helpers chahiye; SSO ke saath NSR switchover ko poori tarah chhupa deta hai. LACP ke saath bundles capacity aur link redundancy dete hain, jinhe minimum-links aur per-member BFD protect karte hain. Main har feature ko production se pehle forced failure se test karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Detection: BFD; control plane recovery: NSF, GR, SSO ke saath NSR; capacity: LACP ke saath LAG.</li>
<li>Detection time = multiplier guna neighbour transmit interval.</li>
<li>NSR ko neighbour support nahi chahiye; graceful restart ko chahiye.</li>
<li>Per-member BFD aur minimum-links bundles ko protect karte hain.</li>
<li>Related ideas spcor-isis, spcor-mpls-ldp, jncis-ha aur encor-l2 mein practise karo.</li>
</ul></div>
`}};export{e as default};