var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have designed six campuses in this module. The exam asks you to do the same thing in a few minutes per question: read a customer description, pull out the requirements and constraints, discard options that break a constraint, and pick the one that best fits. This chapter gives you the method, the decision map, a checklist and the most-tested facts.</p>

<h3>The five-step design method</h3>
<ol>
<li><b>Requirements.</b> What must the network do (availability target, convergence time, segmentation, voice, multicast, growth)?</li>
<li><b>Constraints.</b> Budget, skills, fibre, existing hardware, vendor limits, change windows, "VLAN must span closets".</li>
<li><b>Options.</b> Two to four realistic candidates, not a list of every technology.</li>
<li><b>Trade-offs.</b> Compare on convergence, scalability, complexity, cost, operations.</li>
<li><b>Choice and justification.</b> One sentence per requirement showing it is met, and one sentence on risk.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Campus design decision map">
<g stroke="#64748b" stroke-width="1.5">
<line x1="210" y1="45" x2="250" y2="45"/><line x1="210" y1="125" x2="250" y2="125"/><line x1="210" y1="205" x2="250" y2="205"/><line x1="210" y1="285" x2="250" y2="285"/>
<line x1="430" y1="45" x2="450" y2="45"/><line x1="430" y1="125" x2="450" y2="125"/><line x1="430" y1="205" x2="450" y2="205"/><line x1="430" y1="285" x2="450" y2="285"/>
</g>
<g class="svg-ink" font-size="12" text-anchor="middle">
<rect x="10" y="20" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="49">VLAN must span closets?</text>
<rect x="250" y="20" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="49">L2 access + SVL, contain it</text>
<rect x="450" y="20" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="49">Routed access, ECMP, BFD</text>
<rect x="10" y="100" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="129">Need identity policy?</text>
<rect x="250" y="100" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="129">SD-Access: VN + SGT</text>
<rect x="450" y="100" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="129">VRF-lite or TrustSec</text>
<rect x="10" y="180" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="209">Fast fibre, jumbo MTU?</text>
<rect x="250" y="180" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="209">SD-Access transit</text>
<rect x="450" y="180" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="209">IP transit (SGT lost)</text>
<rect x="10" y="260" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="289">Legacy ASM multicast apps?</text>
<rect x="250" y="260" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="289">Anycast RP + MSDP</text>
<rect x="450" y="260" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="289">PIM SSM, no RP</text>
</g>
<g class="svg-muted" font-size="11" text-anchor="middle"><text x="230" y="38">Yes</text><text x="440" y="38">No</text><text x="230" y="118">Yes</text><text x="440" y="118">No</text><text x="230" y="198">Yes</text><text x="440" y="198">No</text><text x="230" y="278">Yes</text><text x="440" y="278">No</text></g>
</svg><p class="cap">Yellow boxes are the question; green is the usual answer when yes, blue when no. Always check the stated constraints first.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain access, distribution and core roles, and when a collapsed core is right (chapter 1).</li>
<li>Compare Layer 2 and routed access with convergence, STP and FHRP effects (1).</li>
<li>Choose between Rapid PVST+, MST, EtherChannel (LACP, PAgP), StackWise Virtual and stacks (2).</li>
<li>Describe edge protection: PortFast, BPDU guard, root guard, loop guard, UDLD, storm control (2).</li>
<li>Compare HSRP, VRRP and GLBP and align root, active gateway and tracking (3).</li>
<li>Explain SSO, NSF, ISSU and BFD, and what each protects (3).</li>
<li>Name SD-Access roles, underlay and overlay protocols, site and transit options (4).</li>
<li>Design wireless in fabric, Fabric in a Box and extended nodes (4).</li>
<li>Use VN for macro-segmentation and SGT for micro-segmentation; explain Layer 2 flooding in fabric (5).</li>
<li>Design a trust boundary, a queuing model, an RP placement and anycast RP (6).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>MEC</dt><dd>Multichassis EtherChannel; one port-channel spread across two chassis.</dd>
<dt>SVL</dt><dd>StackWise Virtual; two switches act as one logical switch.</dd>
<dt>DAD</dt><dd>Dual-active detection; stops split-brain in SVL.</dd>
<dt>SSO / NSF</dt><dd>Stateful switchover / non-stop forwarding with graceful restart.</dd>
<dt>LISP</dt><dd>Location/ID separation; control plane of SD-Access.</dd>
<dt>VXLAN-GPO</dt><dd>Data plane with group policy option carrying the SGT.</dd>
<dt>Fusion router</dt><dd>Device that leaks routes between VRFs and shared services.</dd>
<dt>RP / MSDP</dt><dd>Rendezvous Point / protocol sharing source lists between RPs.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact to remember</th></tr>
<tr><td>Links in full mesh</td><td>n(n-1)/2 versus 2n with a core pair</td></tr>
<tr><td>MST region</td><td>Name, revision and VLAN mapping must match</td></tr>
<tr><td>LACP versus PAgP</td><td>Open standard versus Cisco; passive-passive never forms</td></tr>
<tr><td>HSRP preempt</td><td>Off by default; VRRP preempt on by default</td></tr>
<tr><td>NSF</td><td>Needs NSF-aware neighbours</td></tr>
<tr><td>SD-Access planes</td><td>LISP control, VXLAN data, TrustSec SGT policy</td></tr>
<tr><td>Underlay MTU</td><td>VXLAN adds about 50 bytes; automation uses 9100</td></tr>
<tr><td>Border types</td><td>Internal (known), external (unknown), anywhere (both)</td></tr>
<tr><td>IP transit</td><td>VXLAN removed at border; SGT lost unless carried another way</td></tr>
<tr><td>Voice marking</td><td>EF (46); signalling CS3 (24); priority queue capped</td></tr>
<tr><td>SSM range</td><td>232.0.0.0/8, IGMPv3, no RP</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Choosing the newest technology when a constraint rules it out; ignoring operations skills; and answering with a technology instead of a justification.</p></div>
<div class="exam"><p><b>Exam trap.</b> Words like "most", "best", "least operational overhead" and "while minimising cost" change the answer. Underline them before looking at the options.</p></div>

<div class="scn"><h4>Final case: Evergreen Retail HQ</h4><p>Evergreen has one 900-user building, a POS lab VLAN that must reach two floors, a 99.9% target and a USD 300,000 budget. The engineer chose a 2-tier collapsed core with a StackWise Virtual pair, MEC to closets and HSRP-free routing, Rapid PVST+ as a safety net, DSCP marking at the edge and PIM SSM for a digital-signage feed. SD-Access was documented as the next phase, not bought now.</p><p><b>Lesson:</b> the best design fits the constraints today and leaves a clean path for tomorrow.</p></div>
<div class="iv"><p class="q">"Walk me through how you would design a new campus."</p><p>State the five steps. Give requirements and constraints first, then hierarchy and Layer 2 or routed access, HA features, segmentation, QoS and multicast, and a migration path. Quote trade-offs, not just products.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design is requirements, constraints, options, trade-offs, justification.</li>
<li>Routed access and SVL are the main answers to Layer 2 risk; contain exceptions.</li>
<li>HA is layered: FHRP for gateway, SSO and NSF for control plane, ISSU for upgrades.</li>
<li>SD-Access gives automation and group policy; plan sites, transit, MTU and shared services.</li>
<li>QoS and multicast need end-to-end consistency: trust, queues, PIM on every hop, redundant RP.</li>
</ul></div>
`,hi:`
<p>Is module mein aapne chhe campuses design kiye. Exam aapse wahi kaam kuch minute per question mein karwata hai: customer description padho, requirements aur constraints nikaalo, jo options constraint todte hain unhe hatao, aur sabse best fit choose karo. Yeh chapter aapko method, decision map, checklist aur sabse zyada tested facts deta hai.</p>

<h3>Paanch-step design method</h3>
<ol>
<li><b>Requirements.</b> Network ko kya karna hai (availability target, convergence time, segmentation, voice, multicast, growth)?</li>
<li><b>Constraints.</b> Budget, skills, fibre, existing hardware, vendor limits, change windows, "VLAN closets ke beech span karni hai".</li>
<li><b>Options.</b> Do se chaar realistic candidates, har technology ki list nahi.</li>
<li><b>Trade-offs.</b> Convergence, scalability, complexity, cost, operations par compare karo.</li>
<li><b>Choice aur justification.</b> Har requirement ke liye ek line ki woh poori hoti hai, aur risk par ek line.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Campus design decision map">
<g stroke="#64748b" stroke-width="1.5">
<line x1="210" y1="45" x2="250" y2="45"/><line x1="210" y1="125" x2="250" y2="125"/><line x1="210" y1="205" x2="250" y2="205"/><line x1="210" y1="285" x2="250" y2="285"/>
<line x1="430" y1="45" x2="450" y2="45"/><line x1="430" y1="125" x2="450" y2="125"/><line x1="430" y1="205" x2="450" y2="205"/><line x1="430" y1="285" x2="450" y2="285"/>
</g>
<g class="svg-ink" font-size="12" text-anchor="middle">
<rect x="10" y="20" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="49">VLAN closets span kare?</text>
<rect x="250" y="20" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="49">L2 access + SVL, contain</text>
<rect x="450" y="20" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="49">Routed access, ECMP, BFD</text>
<rect x="10" y="100" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="129">Identity policy chahiye?</text>
<rect x="250" y="100" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="129">SD-Access: VN + SGT</text>
<rect x="450" y="100" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="129">VRF-lite ya TrustSec</text>
<rect x="10" y="180" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="209">Fast fibre, jumbo MTU?</text>
<rect x="250" y="180" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="209">SD-Access transit</text>
<rect x="450" y="180" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="209">IP transit (SGT lost)</text>
<rect x="10" y="260" width="200" height="50" rx="8" fill="#fde68a" stroke="#475569"/><text x="110" y="289">Legacy ASM multicast apps?</text>
<rect x="250" y="260" width="180" height="50" rx="8" fill="#bbf7d0" stroke="#475569"/><text x="340" y="289">Anycast RP + MSDP</text>
<rect x="450" y="260" width="180" height="50" rx="8" fill="#bae6fd" stroke="#475569"/><text x="540" y="289">PIM SSM, no RP</text>
</g>
<g class="svg-muted" font-size="11" text-anchor="middle"><text x="230" y="38">Haan</text><text x="440" y="38">Nahi</text><text x="230" y="118">Haan</text><text x="440" y="118">Nahi</text><text x="230" y="198">Haan</text><text x="440" y="198">Nahi</text><text x="230" y="278">Haan</text><text x="440" y="278">Nahi</text></g>
</svg><p class="cap">Yellow box sawaal hai; green haan par usual answer, blue nahi par. Hamesha pehle stated constraints check karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Access, distribution aur core ke roles samjhao, aur collapsed core kab sahi hai (chapter 1).</li>
<li>Layer 2 aur routed access ko convergence, STP aur FHRP effects ke saath compare karo (1).</li>
<li>Rapid PVST+, MST, EtherChannel (LACP, PAgP), StackWise Virtual aur stacks mein se choose karo (2).</li>
<li>Edge protection describe karo: PortFast, BPDU guard, root guard, loop guard, UDLD, storm control (2).</li>
<li>HSRP, VRRP aur GLBP compare karo aur root, active gateway aur tracking align karo (3).</li>
<li>SSO, NSF, ISSU aur BFD samjhao, aur har ek kya protect karta hai (3).</li>
<li>SD-Access roles, underlay aur overlay protocols, site aur transit options batao (4).</li>
<li>Fabric mein wireless, Fabric in a Box aur extended nodes design karo (4).</li>
<li>Macro-segmentation ke liye VN aur micro-segmentation ke liye SGT use karo; fabric mein Layer 2 flooding samjhao (5).</li>
<li>Trust boundary, queuing model, RP placement aur anycast RP design karo (6).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>MEC</dt><dd>Multichassis EtherChannel; ek port-channel jo do chassis mein phailta hai.</dd>
<dt>SVL</dt><dd>StackWise Virtual; do switches ek logical switch ki tarah kaam karte hain.</dd>
<dt>DAD</dt><dd>Dual-active detection; SVL mein split-brain rokta hai.</dd>
<dt>SSO / NSF</dt><dd>Stateful switchover / graceful restart ke saath non-stop forwarding.</dd>
<dt>LISP</dt><dd>Location/ID separation; SD-Access ka control plane.</dd>
<dt>VXLAN-GPO</dt><dd>Group policy option wala data plane jo SGT carry karta hai.</dd>
<dt>Fusion router</dt><dd>Device jo VRFs aur shared services ke beech routes leak karta hai.</dd>
<dt>RP / MSDP</dt><dd>Rendezvous Point / RPs ke beech source lists share karne wala protocol.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakhne wala fact</th></tr>
<tr><td>Full mesh mein links</td><td>n(n-1)/2 versus core pair ke saath 2n</td></tr>
<tr><td>MST region</td><td>Name, revision aur VLAN mapping match hone chahiye</td></tr>
<tr><td>LACP versus PAgP</td><td>Open standard versus Cisco; passive-passive kabhi form nahi hota</td></tr>
<tr><td>HSRP preempt</td><td>Default off; VRRP preempt default on</td></tr>
<tr><td>NSF</td><td>NSF-aware neighbours chahiye</td></tr>
<tr><td>SD-Access planes</td><td>LISP control, VXLAN data, TrustSec SGT policy</td></tr>
<tr><td>Underlay MTU</td><td>VXLAN lagbhag 50 bytes jodta hai; automation 9100 use karta hai</td></tr>
<tr><td>Border types</td><td>Internal (known), external (unknown), anywhere (dono)</td></tr>
<tr><td>IP transit</td><td>Border par VXLAN hat jaata hai; SGT jaata hai jab tak aur tareeke se carry na ho</td></tr>
<tr><td>Voice marking</td><td>EF (46); signalling CS3 (24); priority queue capped</td></tr>
<tr><td>SSM range</td><td>232.0.0.0/8, IGMPv3, RP nahi</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Newest technology choose karna jabki koi constraint use rule out karta hai; operations skills ignore karna; aur justification ki jagah technology ka naam likh dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Most", "best", "least operational overhead" aur "while minimising cost" jaise words answer badal dete hain. Options dekhne se pehle inhe underline karo.</p></div>

<div class="scn"><h4>Final case: Evergreen Retail HQ</h4><p>Evergreen ki ek 900-user building hai, POS lab VLAN jo do floors tak jaana chahiye, 99.9% target aur USD 300,000 budget. Engineer ne 2-tier collapsed core choose kiya, StackWise Virtual pair, closets tak MEC aur HSRP-free routing ke saath, Rapid PVST+ safety net ke roop mein, edge par DSCP marking, aur digital-signage feed ke liye PIM SSM. SD-Access ko next phase ke roop mein document kiya gaya, abhi kharida nahi.</p><p><b>Seekh:</b> best design aaj ke constraints mein fit hota hai aur kal ke liye saaf raasta chhodta hai.</p></div>
<div class="iv"><p class="q">"Mujhe batao ki aap naya campus kaise design karoge."</p><p>Paanch steps batao. Pehle requirements aur constraints do, phir hierarchy aur Layer 2 ya routed access, HA features, segmentation, QoS aur multicast, aur migration path. Sirf products nahi, trade-offs quote karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design = requirements, constraints, options, trade-offs, justification.</li>
<li>Routed access aur SVL Layer 2 risk ke main jawab hain; exceptions contain karo.</li>
<li>HA layered hai: gateway ke liye FHRP, control plane ke liye SSO aur NSF, upgrades ke liye ISSU.</li>
<li>SD-Access automation aur group policy deta hai; sites, transit, MTU aur shared services plan karo.</li>
<li>QoS aur multicast ko end-to-end consistency chahiye: trust, queues, har hop par PIM, redundant RP.</li>
</ul></div>
`}};export{e as default};