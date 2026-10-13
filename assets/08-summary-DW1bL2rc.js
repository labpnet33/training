var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with hosts hanging from a single leaf and you finish with a dual-homed segment that survives cable cuts, load-balances across leaves, avoids duplicate broadcasts and can be debugged with four questions. This chapter is the final revision sheet of the EVPN-VXLAN track: what you should be able to do, the vocabulary, the facts examiners like and a map of how the three modules fit together.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Multi-homing mechanisms">
<g font-size="12" class="svg-ink">
<rect x="20" y="20" width="190" height="64" rx="8" fill="#bae6fd"/><text x="115" y="42" text-anchor="middle">Type 4</text><text x="115" y="60" text-anchor="middle" class="svg-muted">members find each other</text><text x="115" y="75" text-anchor="middle" class="svg-muted">DF election</text>
<rect x="225" y="20" width="190" height="64" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle">Type 1 per-ES</text><text x="320" y="60" text-anchor="middle" class="svg-muted">mass withdraw</text><text x="320" y="75" text-anchor="middle" class="svg-muted">split-horizon label</text>
<rect x="430" y="20" width="190" height="64" rx="8" fill="#fde68a"/><text x="525" y="42" text-anchor="middle">Type 1 per-EVI</text><text x="525" y="60" text-anchor="middle" class="svg-muted">aliasing</text><text x="525" y="75" text-anchor="middle" class="svg-muted">remote load balancing</text>
<rect x="125" y="110" width="390" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="132" text-anchor="middle">Type 2 with ESI</text><text x="320" y="148" text-anchor="middle" class="svg-muted">host MAC is behind a segment, not a single leaf</text>
</g></svg><p class="cap">Four route-type roles in multi-homing.</p></div>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Explain the benefits of multi-homing and compare EVPN multi-homing with vPC or MLAG (standards-based, no peer-link).</li>
<li>Define Ethernet Segment and ESI (10 bytes, type 0 manual) and state the rule: same ESI on every leaf of a device, different ESIs for different devices.</li>
<li>Configure <code>l2vpn evpn ethernet-segment</code> with <code>identifier type 0</code>, <code>redundancy all-active</code>, <code>df-election wait-time</code>, and bind it with <code>evpn ethernet-segment</code> under Port-channel 10.</li>
<li>Describe route types 1 (per-ES and per-EVI) and 4 and say what each is used for.</li>
<li>Calculate a modulo DF election and explain split-horizon with the ESI label.</li>
<li>Compare all-active and single-active, and choose the correct mode for a host.</li>
<li>Explain aliasing and mass withdraw and show them in <code>show l2vpn evpn mac</code> and BGP output.</li>
<li>Run the five proofs (bundle, segment, DF, aliasing, failover) and the four split-brain questions.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ES / ESI</dt><dd>Ethernet Segment and its 10-byte identifier.</dd>
<dt>DF / non-DF</dt><dd>Designated Forwarder: the one leaf per VLAN that sends BUM into the segment.</dd>
<dt>All-active</dt><dd>Every link of the segment forwards; remote leaves alias.</dd>
<dt>Single-active</dt><dd>One leaf per VLAN forwards; the other is standby.</dd>
<dt>Aliasing</dt><dd>Remote leaves load-balance to all leaves of an ESI using per-EVI type-1 routes.</dd>
<dt>Mass withdraw</dt><dd>One per-ES type-1 withdrawal invalidates all MACs of the segment behind a leaf.</dd>
<dt>ES-Import RT</dt><dd>Route target derived from the ESI that keeps type 4 among members.</dd>
<dt>ESI label</dt><dd>Label for split-horizon filtering of BUM from the same segment.</dd>
<dt>Split-brain</dt><dd>Leaves of one segment disagree about it (ESI, mode, DF).</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Route type for Ethernet Segment discovery</td><td>Type 4</td></tr>
<tr><td>Route type for Ethernet A-D</td><td>Type 1 (per-ES and per-EVI)</td></tr>
<tr><td>Which route gives mass withdraw?</td><td>Per-ES type 1</td></tr>
<tr><td>Which route gives aliasing?</td><td>Per-EVI type 1</td></tr>
<tr><td>Default DF election</td><td>VLAN modulo N over IP-ordered members</td></tr>
<tr><td>What does the DF forward?</td><td>BUM from the fabric to the segment</td></tr>
<tr><td>ESI size</td><td>10 bytes</td></tr>
<tr><td>Does EVPN multi-homing need a peer-link?</td><td>No</td></tr>
<tr><td>Lab ESI / segment</td><td>identifier type 0 00.11.22.33.44.55.66.77.88, Po10</td></tr>
<tr><td>Mismatched ESI symptom</td><td>Duplicate BUM, no aliasing, MAC flaps, suspended LACP link</td></tr>
</table>

<h3>The three modules in one paragraph</h3>
<p><code>sre-vxlan</code> built the data plane: VNIs, VTEPs, an OSPF underlay and flood-and-learn. <code>sre-evpn</code> added the BGP control plane: route reflectors on the spines, route types 3, 2 and 5, RD and RT, symmetric IRB with an anycast gateway and MAC mobility. <code>sre-esi</code> completed the picture with multi-homing: ESI, types 1 and 4, DF election, aliasing and the split-brain playbook.</p>

<div class="warn"><p><b>Last-minute traps.</b> The segment index is local, the ESI is global. Two DFs duplicate BUM; no DF loses BUM. All-active needs a bundle on the host. Type 4 never leaves the members. Mass withdraw and aliasing are different mechanisms.</p></div>

<div class="exam"><p><b>Exam strategy.</b> In ESI questions, find the ESI value first, then the redundancy mode, then the DF lines. If the output shows two different ESIs for the same device, you already have the answer.</p></div>

<div class="scn"><h4>The final-round design question</h4><p>A candidate was asked: "A critical server needs two uplinks to your fabric, no downtime on a leaf reboot, and no vendor lock-in." She answered with all-active EVPN multi-homing: LACP port-channel on the server, the same ESI on two leaves, DF election per VLAN to avoid duplicate BUM, aliasing for remote load balancing, mass withdraw for sub-second failover, and the four-question playbook for ESI errors. The panel noted that she named the failure modes before they asked.</p><p><b>Lesson:</b> a good design answer includes how it fails.</p></div>

<div class="iv"><p class="q">"Summarise EVPN multi-homing in two minutes."</p><p>Strong answer: a device connects to two or more leaves with a port-channel; the leaves share an ESI configured identically. Type 4 routes let them discover each other and elect a DF per VLAN for BUM; type 1 per-ES routes give mass withdraw and the split-horizon label; type 1 per-EVI routes give aliasing so remote leaves load-balance; type 2 routes carry the ESI. All-active uses all links; single-active one per VLAN. It needs no peer-link. Typical faults: ESI mismatch, mode mismatch, send-community, DF disagreement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Same ESI on all leaves of a device; different per device.</li>
<li>Type 4 = discover and elect; type 1 = fast failover and aliasing.</li>
<li>DF forwards BUM per VLAN; split horizon with ESI label.</li>
<li>Prove: bundle, segment, DF, aliasing, failover.</li>
<li>Debug: ESI, peers, DF lists, mode.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek leaf se latke hosts ke saath shuru kiya aur ek aise dual-homed segment par khatam kiya jo cable cuts survive karta hai, leaves par load-balance karta hai, duplicate broadcasts se bachta hai aur chaar sawaalon se debug ho sakta hai. Yeh chapter EVPN-VXLAN track ki aakhri revision sheet hai: aapko kya aana chahiye, vocabulary, examiners ke pasandida facts aur teeno modules kaise judte hain uska map.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Multi-homing mechanisms">
<g font-size="12" class="svg-ink">
<rect x="20" y="20" width="190" height="64" rx="8" fill="#bae6fd"/><text x="115" y="42" text-anchor="middle">Type 4</text><text x="115" y="60" text-anchor="middle" class="svg-muted">members ek-doosre ko dhoondhte hain</text><text x="115" y="75" text-anchor="middle" class="svg-muted">DF election</text>
<rect x="225" y="20" width="190" height="64" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle">Type 1 per-ES</text><text x="320" y="60" text-anchor="middle" class="svg-muted">mass withdraw</text><text x="320" y="75" text-anchor="middle" class="svg-muted">split-horizon label</text>
<rect x="430" y="20" width="190" height="64" rx="8" fill="#fde68a"/><text x="525" y="42" text-anchor="middle">Type 1 per-EVI</text><text x="525" y="60" text-anchor="middle" class="svg-muted">aliasing</text><text x="525" y="75" text-anchor="middle" class="svg-muted">remote load balancing</text>
<rect x="125" y="110" width="390" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="132" text-anchor="middle">ESI ke saath Type 2</text><text x="320" y="148" text-anchor="middle" class="svg-muted">host MAC segment ke peeche hai, ek leaf ke nahi</text>
</g></svg><p class="cap">Multi-homing mein chaar route-type roles.</p></div>

<h3>Checklist: aapko yeh aana chahiye...</h3>
<ul>
<li>Multi-homing ke fayde samjhana aur EVPN multi-homing ko vPC ya MLAG se compare karna (standards-based, peer-link nahi).</li>
<li>Ethernet Segment aur ESI define karna (10 bytes, type 0 manual) aur rule batana: device ke har leaf par same ESI, alag devices ke alag ESIs.</li>
<li><code>identifier type 0</code>, <code>redundancy all-active</code>, <code>df-election wait-time</code> ke saath <code>l2vpn evpn ethernet-segment</code> configure karna, aur Port-channel 10 ke neeche <code>evpn ethernet-segment</code> se bind karna.</li>
<li>Route types 1 (per-ES aur per-EVI) aur 4 describe karna aur batana ki har ek kis kaam aata hai.</li>
<li>Modulo DF election calculate karna aur ESI label ke saath split-horizon samjhana.</li>
<li>All-active aur single-active compare karna, aur host ke liye sahi mode chunna.</li>
<li>Aliasing aur mass withdraw samjhana aur <code>show l2vpn evpn mac</code> aur BGP output mein dikhana.</li>
<li>Paanch proofs (bundle, segment, DF, aliasing, failover) aur chaar split-brain sawaal chalana.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ES / ESI</dt><dd>Ethernet Segment aur uska 10-byte identifier.</dd>
<dt>DF / non-DF</dt><dd>Designated Forwarder: har VLAN ka woh ek leaf jo segment mein BUM bhejta hai.</dd>
<dt>All-active</dt><dd>Segment ka har link forward karta hai; remote leaves alias karte hain.</dd>
<dt>Single-active</dt><dd>Har VLAN ke liye ek leaf forward karta hai; doosra standby.</dd>
<dt>Aliasing</dt><dd>Remote leaves per-EVI type-1 routes se ESI ke saare leaves par load-balance karte hain.</dd>
<dt>Mass withdraw</dt><dd>Ek per-ES type-1 withdrawal leaf ke peeche segment ke saare MACs invalid kar deta hai.</dd>
<dt>ES-Import RT</dt><dd>ESI se derive route target jo type 4 ko members tak rakhta hai.</dd>
<dt>ESI label</dt><dd>Same segment se aaye BUM ke split-horizon filtering ke liye label.</dd>
<dt>Split-brain</dt><dd>Ek segment ke leaves uske baare mein disagree karte hain (ESI, mode, DF).</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Ethernet Segment discovery ka route type</td><td>Type 4</td></tr>
<tr><td>Ethernet A-D ka route type</td><td>Type 1 (per-ES aur per-EVI)</td></tr>
<tr><td>Mass withdraw kaunsa route deta hai?</td><td>Per-ES type 1</td></tr>
<tr><td>Aliasing kaunsa route deta hai?</td><td>Per-EVI type 1</td></tr>
<tr><td>Default DF election</td><td>IP-ordered members par VLAN modulo N</td></tr>
<tr><td>DF kya forward karta hai?</td><td>Fabric se segment ko BUM</td></tr>
<tr><td>ESI size</td><td>10 bytes</td></tr>
<tr><td>EVPN multi-homing ko peer-link chahiye?</td><td>Nahi</td></tr>
<tr><td>Lab ESI / segment</td><td>identifier type 0 00.11.22.33.44.55.66.77.88, Po10</td></tr>
<tr><td>Mismatched ESI ka symptom</td><td>Duplicate BUM, aliasing nahi, MAC flaps, suspended LACP link</td></tr>
</table>

<h3>Teeno modules ek paragraph mein</h3>
<p><code>sre-vxlan</code> ne data plane banaya: VNIs, VTEPs, OSPF underlay aur flood-and-learn. <code>sre-evpn</code> ne BGP control plane jodi: spines par route reflectors, route types 3, 2 aur 5, RD aur RT, anycast gateway ke saath symmetric IRB aur MAC mobility. <code>sre-esi</code> ne multi-homing se picture poori ki: ESI, types 1 aur 4, DF election, aliasing aur split-brain playbook.</p>

<div class="warn"><p><b>Aakhri minute ke traps.</b> Segment index local hai, ESI global. Do DFs BUM duplicate karte hain; koi DF nahi to BUM lost. All-active ko host par bundle chahiye. Type 4 members se bahar nahi jaata. Mass withdraw aur aliasing alag mechanisms hain.</p></div>

<div class="exam"><p><b>Exam strategy.</b> ESI questions mein pehle ESI value dhoondho, phir redundancy mode, phir DF lines. Agar output ek hi device ke liye do alag ESIs dikhaye to jawab aapko pehle se mil gaya.</p></div>

<div class="scn"><h4>Final-round design question</h4><p>Candidate se poocha gaya: "Ek critical server ko aapke fabric se do uplinks chahiye, leaf reboot par downtime nahi, aur vendor lock-in nahi." Usne all-active EVPN multi-homing se jawab diya: server par LACP port-channel, do leaves par same ESI, duplicate BUM se bachne ke liye per VLAN DF election, remote load balancing ke liye aliasing, sub-second failover ke liye mass withdraw, aur ESI errors ke liye chaar-sawaal playbook. Panel ne note kiya ki usne failure modes unke poochne se pehle bata diye.</p><p><b>Seekh:</b> acche design answer mein yeh bhi hota hai ki woh kaise fail hota hai.</p></div>

<div class="iv"><p class="q">"EVPN multi-homing do minute mein summarise karo."</p><p>Strong answer: ek device do ya zyada leaves se port-channel ke saath judta hai; leaves identically configured ESI share karte hain. Type 4 routes unhe ek-doosre ko discover karne aur BUM ke liye per VLAN DF elect karne dete hain; type 1 per-ES routes mass withdraw aur split-horizon label dete hain; type 1 per-EVI routes aliasing dete hain taaki remote leaves load-balance karein; type 2 routes ESI carry karte hain. All-active saare links use karta hai; single-active har VLAN ke liye ek. Peer-link nahi chahiye. Typical faults: ESI mismatch, mode mismatch, send-community, DF disagreement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device ke saare leaves par same ESI; har device ke liye alag.</li>
<li>Type 4 = discover aur elect; type 1 = fast failover aur aliasing.</li>
<li>DF per VLAN BUM forward karta hai; ESI label se split horizon.</li>
<li>Prove: bundle, segment, DF, aliasing, failover.</li>
<li>Debug: ESI, peers, DF lists, mode.</li>
</ul></div>
`}};export{e as default};