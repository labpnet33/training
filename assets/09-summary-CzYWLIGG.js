var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now explain and configure the segment routing stack of an SP core: SIDs and the SRGB, SR-MPLS on IS-IS with LDP coexistence, TI-LFA protection, SR-TE policies with color, ODN and automated steering, flexible algorithms, and the basics of SRv6. This is your checklist for SPCOR 350-501 and interviews.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="The segment routing toolbox of this module."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">SIDs</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">prefix, adjacency</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">TI-LFA</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">50 ms repair</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">SR-TE</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">policy, color, ODN</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Flex-algo + SRv6</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">planes, IPv6</text></svg><p class="cap">The segment routing toolbox of this module.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Explain source routing and why SR removes per-path state from the core.</li>
<li>Calculate a prefix-SID label from the SRGB base and the index; know the default SRGB 16000 to 23999.</li>
<li>Distinguish prefix, node, anycast, adjacency and binding SIDs.</li>
<li>Configure SR-MPLS on IS-IS on IOS XR and IOS XE and verify the label table and forwarding.</li>
<li>Describe SR and LDP coexistence, preference, mapping server and interworking.</li>
<li>Explain how TI-LFA computes the repair from P-space and Q-space and why it is topology independent.</li>
<li>Describe an SR policy: head end, color, endpoint, candidate paths and preference; ODN and automated steering.</li>
<li>Explain flexible algorithm 128 to 255, FAD, and per-algorithm SIDs.</li>
<li>Describe SRv6 SID structure, the SRH, behaviors and uSID compression.</li>
<li>Follow the troubleshooting order: IGP, SIDs, labels, policy, protection.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>SID</dt><dd>Segment Identifier: an instruction carried in the packet.</dd><dt>SRGB</dt><dd>Segment Routing Global Block, labels for global SIDs; default 16000 to 23999.</dd><dt>Prefix-SID / Node-SID</dt><dd>Global segment to a prefix or router.</dd><dt>Adjacency-SID</dt><dd>Local segment for one link.</dd><dt>Binding-SID</dt><dd>Label that represents a whole SR policy.</dd><dt>SRMS</dt><dd>Segment routing mapping server: advertises SIDs for non-SR prefixes.</dd><dt>TI-LFA</dt><dd>Topology-Independent Loop-Free Alternate, post-convergence fast reroute.</dd><dt>P-space / Q-space</dt><dd>Nodes reachable from the PLR, and nodes that reach the destination, without the failed element.</dd><dt>SR policy</dt><dd>Head end, color and endpoint with candidate paths.</dd><dt>ODN</dt><dd>On-demand next hop: policy created from a template when a colored route arrives.</dd><dt>Flex-algo</dt><dd>Flexible algorithm, constraint-based IGP plane with algorithm 128 to 255.</dd><dt>SRH</dt><dd>Segment routing header, IPv6 routing header type 4.</dd><dt>uSID</dt><dd>Micro-segment, compressed SRv6 instruction of 16 bits.</dd><dt>MSD</dt><dd>Maximum SID Depth a platform can push.</dd></dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr><tr><td>Label formula</td><td>SRGB base plus index; default 16000 to 23999</td></tr><tr><td>Global versus local</td><td>Prefix-SIDs global; adjacency-SIDs local</td></tr><tr><td>IS-IS requirement</td><td>metric-style wide</td></tr><tr><td>SR and LDP</td><td>Coexist; sr-prefer (XR) or sr-label-preferred (XE); SRMS for non-SR prefixes</td></tr><tr><td>TI-LFA</td><td>Post-convergence path, P-space and Q-space, about 50 ms, link, node, SRLG</td></tr><tr><td>SR policy key</td><td>Head end, color, endpoint; highest valid preference wins</td></tr><tr><td>Steering</td><td>BGP color extended community plus next hop equal to endpoint</td></tr><tr><td>Flex-algo</td><td>128 to 255, FAD advertised in the IGP, highest priority wins</td></tr><tr><td>SRv6 SID</td><td>Locator, function, arguments; SRH routing header type 4</td></tr><tr><td>uSID</td><td>16 bit instructions after a common block, F3216 format</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR</span>
show isis segment-routing label table
show isis database verbose
show mpls forwarding
show isis fast-reroute detail
show segment-routing traffic-eng policy
ping sr-mpls 192.0.2.2/32
traceroute sr-mpls 192.0.2.2/32
<span class="c">! IOS XE</span>
show segment-routing mpls connected-prefix-sid-map ipv4
show isis database detail
show mpls forwarding-table
show isis fast-reroute</pre>
<div class="eg"><p><b>Self-test.</b> Design: a core of 20 routers needs SR with 50 ms repair, a low-latency service for the bank, and a gradual retirement of LDP. Answer: one SRGB 16000 to 23999 and an index plan; IS-IS with wide metrics and segment-routing; sr-prefer while LDP is still on; TI-LFA with microloop avoidance on all core links and BFD on non-direct links; flex-algo 128 with delay metric or an ODN color 100 template for the bank; remove LDP after a stable period.</p></div>
<div class="warn"><p><b>Common mistake in the exam.</b> Mixing up preference rules: SR-TE uses the highest preference, RSVP path-options use the lowest number. Another: saying that SRv6 needs MPLS or an SRH for every packet.</p></div>
<div class="exam"><p><b>Final trap.</b> Decide whether the question is about the <i>control plane</i> (IGP extensions, SIDs), <i>protection</i> (TI-LFA), <i>traffic engineering</i> (SR policy, ODN, flex-algo) or the <i>data plane</i> (SR-MPLS versus SRv6). That narrows most answers at once.</p></div>
<div class="scn"><h4>A clean cut-over</h4><p>A provider moved 120 routers from LDP and RSVP-TE to SR over six months. Each wave enabled SR, preferred SR, tested TI-LFA with a controlled failure, converted the service to ODN, and only then removed LDP on that wave. The final cut-over night had no customer-visible loss, and the number of core LSPs fell from tens of thousands to the number of nodes.</p><p><b>Lesson:</b> a staged migration with a test at every step is what makes the change boring.</p></div>
<div class="iv"><p class="q">"Give a one-minute summary of segment routing for an SP core."</p><p>SR is source routing: the IGP floods SIDs, prefix-SIDs are global labels from the SRGB and adjacency-SIDs are local. The head end pushes a segment list and transit routers keep no per-path state, so LDP and RSVP-TE are not needed. TI-LFA gives automatic 50 ms repair along the post-convergence path. SR policies with color, ODN and automated steering replace TE tunnels, flex-algo gives constraint-based planes in the IGP, and SRv6 carries the same ideas in IPv6 with the SRH and uSID compression. I migrate in steps with SR and LDP coexisting.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SR: IGP-distributed SIDs, source routing, no per-path state.</li>
<li>Prefix-SID label equals SRGB base plus index; adjacency-SIDs are local.</li>
<li>TI-LFA: automatic 50 ms repair on the post-convergence path.</li>
<li>SR-TE: color, endpoint, candidate paths, ODN, automated steering; flex-algo and SRv6 extend the model.</li>
<li>Practise related ideas in spcor-isis, spcor-mpls-ldp, jncis-ha and encor-l2.</li>
</ul></div>
`,hi:`
<p>Ab aap SP core ke segment routing stack ko samjha aur configure kar sakte ho: SIDs aur SRGB, LDP coexistence ke saath IS-IS par SR-MPLS, TI-LFA protection, color, ODN aur automated steering ke saath SR-TE policies, flexible algorithms, aur SRv6 ki basics. Yeh SPCOR 350-501 aur interviews ke liye aapki checklist hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Is module ka segment routing toolbox."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">SIDs</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">prefix, adjacency</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">TI-LFA</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">50 ms repair</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">SR-TE</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">policy, color, ODN</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Flex-algo + SRv6</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">planes, IPv6</text></svg><p class="cap">Is module ka segment routing toolbox.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Source routing samjhao aur batao SR core se per-path state kyun hataata hai.</li>
<li>SRGB base aur index se prefix-SID label calculate karo; default SRGB 16000 se 23999 jaano.</li>
<li>Prefix, node, anycast, adjacency aur binding SIDs mein fark batao.</li>
<li>IOS XR aur IOS XE par IS-IS par SR-MPLS configure karo aur label table aur forwarding verify karo.</li>
<li>SR aur LDP coexistence, preference, mapping server aur interworking describe karo.</li>
<li>Samjhao ki TI-LFA P-space aur Q-space se repair kaise compute karta hai aur topology independent kyun hai.</li>
<li>SR policy describe karo: head end, color, endpoint, candidate paths aur preference; ODN aur automated steering.</li>
<li>Flexible algorithm 128 se 255, FAD aur per-algorithm SIDs samjhao.</li>
<li>SRv6 SID structure, SRH, behaviors aur uSID compression describe karo.</li>
<li>Troubleshooting order follow karo: IGP, SIDs, labels, policy, protection.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>SID</dt><dd>Segment Identifier: packet mein carry hone wala instruction.</dd><dt>SRGB</dt><dd>Segment Routing Global Block, global SIDs ke labels; default 16000 se 23999.</dd><dt>Prefix-SID / Node-SID</dt><dd>Prefix ya router tak global segment.</dd><dt>Adjacency-SID</dt><dd>Ek link ka local segment.</dd><dt>Binding-SID</dt><dd>Poori SR policy ko represent karne wala label.</dd><dt>SRMS</dt><dd>Segment routing mapping server: non-SR prefixes ke SIDs advertise karta hai.</dd><dt>TI-LFA</dt><dd>Topology-Independent Loop-Free Alternate, post-convergence fast reroute.</dd><dt>P-space / Q-space</dt><dd>Failed element ke bina PLR se reachable nodes, aur destination tak pahunchne wale nodes.</dd><dt>SR policy</dt><dd>Head end, color aur endpoint candidate paths ke saath.</dd><dt>ODN</dt><dd>On-demand next hop: colored route aane par template se bani policy.</dd><dt>Flex-algo</dt><dd>Flexible algorithm, algorithm 128 se 255 wala constraint-based IGP plane.</dd><dt>SRH</dt><dd>Segment routing header, IPv6 routing header type 4.</dd><dt>uSID</dt><dd>Micro-segment, 16 bit ka compressed SRv6 instruction.</dd><dt>MSD</dt><dd>Platform jitne SIDs push kar sakta hai, Maximum SID Depth.</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr><tr><td>Label formula</td><td>SRGB base plus index; default 16000 se 23999</td></tr><tr><td>Global versus local</td><td>Prefix-SIDs global; adjacency-SIDs local</td></tr><tr><td>IS-IS requirement</td><td>metric-style wide</td></tr><tr><td>SR aur LDP</td><td>Coexist karte hain; sr-prefer (XR) ya sr-label-preferred (XE); non-SR prefixes ke liye SRMS</td></tr><tr><td>TI-LFA</td><td>Post-convergence path, P-space aur Q-space, lagbhag 50 ms, link, node, SRLG</td></tr><tr><td>SR policy key</td><td>Head end, color, endpoint; sabse high valid preference jeetti hai</td></tr><tr><td>Steering</td><td>BGP color extended community plus endpoint ke barabar next hop</td></tr><tr><td>Flex-algo</td><td>128 se 255, FAD IGP mein advertise, sabse high priority jeetti hai</td></tr><tr><td>SRv6 SID</td><td>Locator, function, arguments; SRH routing header type 4</td></tr><tr><td>uSID</td><td>Common block ke baad 16 bit instructions, F3216 format</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XR</span>
show isis segment-routing label table
show isis database verbose
show mpls forwarding
show isis fast-reroute detail
show segment-routing traffic-eng policy
ping sr-mpls 192.0.2.2/32
traceroute sr-mpls 192.0.2.2/32
<span class="c">! IOS XE</span>
show segment-routing mpls connected-prefix-sid-map ipv4
show isis database detail
show mpls forwarding-table
show isis fast-reroute</pre>
<div class="eg"><p><b>Self-test.</b> Design: 20 routers ke core ko 50 ms repair ke saath SR chahiye, bank ke liye low-latency service, aur LDP ka gradual retirement. Answer: ek SRGB 16000 se 23999 aur index plan; wide metrics aur segment-routing ke saath IS-IS; LDP abhi on ho tab sr-prefer; saare core links par microloop avoidance ke saath TI-LFA aur non-direct links par BFD; bank ke liye delay metric wala flex-algo 128 ya color 100 ODN template; stable period ke baad LDP hatao.</p></div>
<div class="warn"><p><b>Exam mein common mistake.</b> Preference rules mix karna: SR-TE sabse high preference use karta hai, RSVP path-options sabse chhota number. Ek aur: yeh kehna ki SRv6 ko MPLS chahiye ya har packet ko SRH chahiye.</p></div>
<div class="exam"><p><b>Final trap.</b> Tay karo ki question <i>control plane</i> (IGP extensions, SIDs), <i>protection</i> (TI-LFA), <i>traffic engineering</i> (SR policy, ODN, flex-algo) ya <i>data plane</i> (SR-MPLS versus SRv6) ke baare mein hai. Isse zyadatar answers turant chhote ho jaate hain.</p></div>
<div class="scn"><h4>Saaf cut-over</h4><p>Ek provider ne 120 routers ko LDP aur RSVP-TE se SR par chhe mahine mein move kiya. Har wave mein SR enable hua, SR prefer hua, controlled failure se TI-LFA test hua, service ODN par gayi, aur tab hi us wave par LDP hata. Final cut-over raat mein koi customer-visible loss nahi hua, aur core LSPs ki ginti hazaaron se ghatkar nodes ki ginti jitni reh gayi.</p><p><b>Lesson:</b> har step par test ke saath staged migration change ko boring banata hai.</p></div>
<div class="iv"><p class="q">"SP core ke liye segment routing ka ek minute ka summary do."</p><p>SR source routing hai: IGP SIDs flood karta hai, prefix-SIDs SRGB ke global labels hain aur adjacency-SIDs local. Head end segment list push karta hai aur transit routers per-path state nahi rakhte, isliye LDP aur RSVP-TE nahi chahiye. TI-LFA post-convergence path par automatic 50 ms repair deta hai. Color, ODN aur automated steering wali SR policies TE tunnels ki jagah leti hain, flex-algo IGP mein constraint-based planes deta hai, aur SRv6 wahi ideas IPv6 mein SRH aur uSID compression ke saath carry karta hai. Main SR aur LDP ko coexist karwa kar steps mein migrate karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SR: IGP se distribute hone wale SIDs, source routing, per-path state nahi.</li>
<li>Prefix-SID label = SRGB base plus index; adjacency-SIDs local hain.</li>
<li>TI-LFA: post-convergence path par automatic 50 ms repair.</li>
<li>SR-TE: color, endpoint, candidate paths, ODN, automated steering; flex-algo aur SRv6 model ko extend karte hain.</li>
<li>Related ideas spcor-isis, spcor-mpls-ldp, jncis-ha aur encor-l2 mein practise karo.</li>
</ul></div>
`}};export{e as default};