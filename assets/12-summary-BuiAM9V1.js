var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you run through a checklist: fuel, tyres, lights, documents. This chapter is that checklist for spanning tree. Read it the night before the exam or before a job interview, and if any line feels unfamiliar, go back to the chapter named next to it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="STP in one picture">
<rect x="245" y="15" width="150" height="44" rx="8" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Root bridge</text>
<rect x="20" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="116" text-anchor="middle" class="svg-ink" font-size="13">Elect</text><text x="90" y="134" text-anchor="middle" class="svg-muted" font-size="12">lowest BID</text>
<rect x="175" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="245" y="116" text-anchor="middle" class="svg-ink" font-size="13">Root ports</text><text x="245" y="134" text-anchor="middle" class="svg-muted" font-size="12">lowest cost</text>
<rect x="330" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="116" text-anchor="middle" class="svg-ink" font-size="13">Designated</text><text x="400" y="134" text-anchor="middle" class="svg-muted" font-size="12">one per link</text>
<rect x="485" y="95" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="116" text-anchor="middle" class="svg-ink" font-size="13">The rest</text><text x="555" y="134" text-anchor="middle" class="svg-muted" font-size="12">alternate, BLK</text>
<line x1="320" y1="59" x2="90" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="59" x2="245" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="59" x2="400" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="59" x2="555" y2="95" stroke="#64748b" stroke-width="1.5"/>
<rect x="20" y="170" width="290" height="44" rx="8" fill="#bbf7d0"/><text x="165" y="197" text-anchor="middle" class="svg-ink" font-size="13">Tune: priority, cost, port-priority</text>
<rect x="330" y="170" width="295" height="44" rx="8" fill="#fed7aa"/><text x="477" y="197" text-anchor="middle" class="svg-ink" font-size="13">Protect: PortFast, guards, filter</text>
</svg><p class="cap">The whole module in one picture: elect, choose roles, then tune and protect.</p></div>

<h3>Can you do all of this?</h3>
<ul>
<li>Explain the three effects of a Layer 2 loop: broadcast storm, MAC table instability, duplicate frames (ch. 2).</li>
<li>Name the STP flavours and their standards, and set the mode with <code>spanning-tree mode rapid-pvst</code> (ch. 3).</li>
<li>Decode a Bridge ID with extended system ID, for example 24596 = 24576 + VLAN 20 (ch. 4).</li>
<li>Elect the root, compute root path costs with the short and long tables, and mark RP, DP and blocked ports on a four-switch drawing (ch. 5, 6).</li>
<li>Compare 802.1D states and timers with RSTP roles, states and link types; describe proposal/agreement (ch. 7, 8).</li>
<li>Make a chosen switch root and another secondary per VLAN, and move a root port with cost or port-priority (ch. 9).</li>
<li>Configure PortFast, BPDU Guard, BPDU Filter, Root Guard and Loop Guard and predict what each does when it fires (ch. 10).</li>
<li>Run the five-step troubleshooting workflow and fix wrong root, blocked uplink, TC storm and err-disabled port (ch. 11).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BPDU</dt><dd>Bridge Protocol Data Unit; the STP message carrying root BID, root path cost, sender BID and port ID.</dd>
<dt>Bridge ID</dt><dd>4-bit priority + 12-bit extended system ID (VLAN) + 48-bit MAC; lowest is best.</dd>
<dt>Root port</dt><dd>A non-root switch's single best port toward the root.</dd>
<dt>Designated port</dt><dd>The one forwarding port per link that offers the best path to the root.</dd>
<dt>Alternate port</dt><dd>RSTP discarding port that backs up the root port via another switch.</dd>
<dt>Backup port</dt><dd>RSTP discarding port that backs up a designated port on a shared segment.</dd>
<dt>Edge port</dt><dd>A PortFast port toward a host; forwards immediately, no TCs.</dd>
<dt>Proposal/agreement</dt><dd>RSTP handshake that brings point-to-point links to forwarding without timers.</dd>
<dt>Topology change (TC)</dt><dd>Notification that the tree changed, causing MAC entries to be flushed or aged quickly.</dd>
<dt>Root-inconsistent / loop-inconsistent</dt><dd>Blocked states set by Root Guard and Loop Guard; both recover automatically.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Default priority</td><td>32768; configurable 0 to 61440 in steps of 4096; displayed value = priority + VLAN</td></tr>
<tr><td>Root macros</td><td>root primary 24576 (or 4096 below current root); root secondary 28672</td></tr>
<tr><td>Short costs</td><td>10M 100, 100M 19, 1G 4, 10G 2</td></tr>
<tr><td>Long costs</td><td>10M 2,000,000; 100M 200,000; 1G 20,000; 10G 2,000</td></tr>
<tr><td>RP tie-breakers</td><td>cost, neighbour BID, neighbour port ID, local port ID</td></tr>
<tr><td>802.1D timers</td><td>hello 2 s, max age 20 s, forward delay 15 s; 30 s direct, 50 s indirect</td></tr>
<tr><td>RSTP states</td><td>discarding, learning, forwarding (discarding shows as BLK)</td></tr>
<tr><td>RSTP roles</td><td>root, designated, alternate, backup (+ disabled)</td></tr>
<tr><td>Port priority</td><td>default 128, steps of 16 (0 to 240); set on the upstream switch</td></tr>
<tr><td>Guard results</td><td>BPDU Guard err-disabled; Root Guard root-inconsistent; Loop Guard loop-inconsistent</td></tr>
<tr><td>Standards</td><td>802.1D STP, 802.1w RSTP, 802.1s MST; PVST+ and Rapid PVST+ are Cisco</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Mode and root placement</span>
spanning-tree mode rapid-pvst
spanning-tree vlan 10 root primary
spanning-tree vlan 20 root secondary
spanning-tree vlan 10 priority 24576
spanning-tree pathcost method long
<span class="c">! Per-interface tuning</span>
spanning-tree vlan 10 cost 10
spanning-tree vlan 10 port-priority 64
spanning-tree link-type point-to-point
<span class="c">! Edge protection</span>
spanning-tree portfast
spanning-tree portfast trunk
spanning-tree bpduguard enable
spanning-tree bpdufilter enable
spanning-tree guard root
spanning-tree guard loop
<span class="c">! Global defaults and recovery</span>
spanning-tree portfast default
spanning-tree portfast bpduguard default
spanning-tree portfast bpdufilter default
spanning-tree loopguard default
errdisable recovery cause bpduguard
errdisable recovery interval 300
<span class="c">! Verification</span>
show spanning-tree vlan 10
show spanning-tree root
show spanning-tree summary
show spanning-tree blockedports
show spanning-tree interface Gi0/5 detail
show spanning-tree vlan 10 detail
show spanning-tree inconsistentports
show interfaces status err-disabled</pre>

<div class="eg"><p><b>Final self-test with the lab.</b> Tuned lab, VLAN 20: root SW2 (24596), SW1 secondary (28692), SW3 default (32788). Predict SW3's roles. Answer: Gi0/2 root port (cost 4), Gi0/1 alternate (SW1 wins the tied SW1-SW3 segment with the lower BID), Gi0/6 designated and edge. Then imagine ROGUE on Gi0/7 without BPDU Guard: its priority 0 + 20 = 20 beats everyone, so ROGUE becomes root for VLAN 20 and every switch recalculates. With the guard, Gi0/7 is err-disabled and nothing changes.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising numbers without the comparison order. Almost every exam calculation is "lowest wins, compare in this order": root BID, root path cost, sender BID, sender port ID.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read output questions carefully: <code>Altn BLK</code> is not broken, it is a healthy backup; <code>protocol rstp</code> means Rapid PVST+; <code>P2p Edge</code> means PortFast is active; <code>*ROOT_Inc</code> in the Type column means Root Guard has blocked the port.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a network support role was handed a drawing of four switches with mixed 1G and 100M links and asked where the loop would be blocked. She wrote each Bridge ID, circled the lowest as root, added root path costs next to every switch, marked one root port per switch, then one designated port per link, and crossed out the one port left over, explaining each tie-breaker aloud. The interviewer said the method mattered more than the answer.</p><p><b>Lesson:</b> the five-step recipe from chapter 6 turns any STP puzzle into routine work, in exams and interviews alike.</p></div>

<div class="iv"><p class="q">"Summarise how spanning tree builds a loop-free topology in under a minute."</p><p>Strong answer: switches exchange BPDUs and elect the lowest Bridge ID as root. Every non-root switch picks one root port by lowest root path cost, then neighbour BID, then neighbour port ID. Every link gets one designated port. All other ports discard. Rapid PVST+ runs this per VLAN with RSTP handshakes, so convergence is about a second. Engineers place the root with priority, protect edges with PortFast and BPDU Guard, and guard the core with Root Guard and Loop Guard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop-free tree: elect root, one RP per non-root switch, one DP per link, the rest discard.</li>
<li>Lower always wins: root BID, root path cost, sender BID, sender port ID.</li>
<li>Rapid PVST+: one RSTP instance per VLAN, about one second convergence, per-VLAN root placement.</li>
<li>Design the root and secondary; protect host ports with PortFast and BPDU Guard; use Root and Loop Guard in the core.</li>
<li>Troubleshoot in order: scope, root, path, guards, stability.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap ek checklist chalate ho: fuel, tyres, lights, documents. Yeh chapter spanning tree ke liye wahi checklist hai. Exam ya job interview se pehli raat ise padho, aur agar koi line anjaan lage, to uske aage likhe chapter par wapas jao.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ek picture mein STP">
<rect x="245" y="15" width="150" height="44" rx="8" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Root bridge</text>
<rect x="20" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="116" text-anchor="middle" class="svg-ink" font-size="13">Elect</text><text x="90" y="134" text-anchor="middle" class="svg-muted" font-size="12">sabse kam BID</text>
<rect x="175" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="245" y="116" text-anchor="middle" class="svg-ink" font-size="13">Root ports</text><text x="245" y="134" text-anchor="middle" class="svg-muted" font-size="12">sabse kam cost</text>
<rect x="330" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="116" text-anchor="middle" class="svg-ink" font-size="13">Designated</text><text x="400" y="134" text-anchor="middle" class="svg-muted" font-size="12">har link par ek</text>
<rect x="485" y="95" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="116" text-anchor="middle" class="svg-ink" font-size="13">Baaki</text><text x="555" y="134" text-anchor="middle" class="svg-muted" font-size="12">alternate, BLK</text>
<line x1="320" y1="59" x2="90" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="59" x2="245" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="59" x2="400" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="59" x2="555" y2="95" stroke="#64748b" stroke-width="1.5"/>
<rect x="20" y="170" width="290" height="44" rx="8" fill="#bbf7d0"/><text x="165" y="197" text-anchor="middle" class="svg-ink" font-size="13">Tune: priority, cost, port-priority</text>
<rect x="330" y="170" width="295" height="44" rx="8" fill="#fed7aa"/><text x="477" y="197" text-anchor="middle" class="svg-ink" font-size="13">Protect: PortFast, guards, filter</text>
</svg><p class="cap">Poora module ek picture mein: elect karo, roles chuno, phir tune aur protect karo.</p></div>

<h3>Kya aap yeh sab kar sakte ho?</h3>
<ul>
<li>Layer 2 loop ke teen effects samjhao: broadcast storm, MAC table instability, duplicate frames (ch. 2).</li>
<li>STP flavours aur unke standards ke naam batao, aur <code>spanning-tree mode rapid-pvst</code> se mode set karo (ch. 3).</li>
<li>Extended system ID ke saath Bridge ID decode karo, jaise 24596 = 24576 + VLAN 20 (ch. 4).</li>
<li>Root elect karo, short aur long tables se root path costs nikaalo, aur chaar-switch drawing par RP, DP aur blocked ports mark karo (ch. 5, 6).</li>
<li>802.1D states aur timers ko RSTP roles, states aur link types se compare karo; proposal/agreement samjhao (ch. 7, 8).</li>
<li>Har VLAN ke liye chune hue switch ko root aur doosre ko secondary banao, aur cost ya port-priority se root port badlo (ch. 9).</li>
<li>PortFast, BPDU Guard, BPDU Filter, Root Guard aur Loop Guard configure karo aur predict karo ki fire hone par har ek kya karta hai (ch. 10).</li>
<li>Paanch-step troubleshooting workflow chalao aur galat root, blocked uplink, TC storm aur err-disabled port fix karo (ch. 11).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BPDU</dt><dd>Bridge Protocol Data Unit; STP message jo root BID, root path cost, sender BID aur port ID le jaata hai.</dd>
<dt>Bridge ID</dt><dd>4-bit priority + 12-bit extended system ID (VLAN) + 48-bit MAC; sabse kam best.</dd>
<dt>Root port</dt><dd>Non-root switch ka root ki taraf akela best port.</dd>
<dt>Designated port</dt><dd>Har link par woh ek forwarding port jo root tak best path deta hai.</dd>
<dt>Alternate port</dt><dd>RSTP discarding port jo doosre switch ke through root port ka backup hai.</dd>
<dt>Backup port</dt><dd>RSTP discarding port jo shared segment par designated port ka backup hai.</dd>
<dt>Edge port</dt><dd>Host ki taraf PortFast port; turant forward karta hai, koi TCs nahi.</dd>
<dt>Proposal/agreement</dt><dd>RSTP handshake jo point-to-point links ko bina timers ke forwarding tak laata hai.</dd>
<dt>Topology change (TC)</dt><dd>Notification ki tree badla, jisse MAC entries flush ya jaldi age hoti hain.</dd>
<dt>Root-inconsistent / loop-inconsistent</dt><dd>Root Guard aur Loop Guard ke set kiye blocked states; dono apne aap recover hote hain.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Default priority</td><td>32768; configurable 0 se 61440, 4096 ke steps mein; displayed value = priority + VLAN</td></tr>
<tr><td>Root macros</td><td>root primary 24576 (ya current root se 4096 kam); root secondary 28672</td></tr>
<tr><td>Short costs</td><td>10M 100, 100M 19, 1G 4, 10G 2</td></tr>
<tr><td>Long costs</td><td>10M 2,000,000; 100M 200,000; 1G 20,000; 10G 2,000</td></tr>
<tr><td>RP tie-breakers</td><td>cost, neighbour BID, neighbour port ID, local port ID</td></tr>
<tr><td>802.1D timers</td><td>hello 2 s, max age 20 s, forward delay 15 s; direct 30 s, indirect 50 s</td></tr>
<tr><td>RSTP states</td><td>discarding, learning, forwarding (discarding BLK dikhta hai)</td></tr>
<tr><td>RSTP roles</td><td>root, designated, alternate, backup (+ disabled)</td></tr>
<tr><td>Port priority</td><td>default 128, 16 ke steps (0 se 240); upstream switch par set</td></tr>
<tr><td>Guard results</td><td>BPDU Guard err-disabled; Root Guard root-inconsistent; Loop Guard loop-inconsistent</td></tr>
<tr><td>Standards</td><td>802.1D STP, 802.1w RSTP, 802.1s MST; PVST+ aur Rapid PVST+ Cisco ke hain</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Mode aur root placement</span>
spanning-tree mode rapid-pvst
spanning-tree vlan 10 root primary
spanning-tree vlan 20 root secondary
spanning-tree vlan 10 priority 24576
spanning-tree pathcost method long
<span class="c">! Per-interface tuning</span>
spanning-tree vlan 10 cost 10
spanning-tree vlan 10 port-priority 64
spanning-tree link-type point-to-point
<span class="c">! Edge protection</span>
spanning-tree portfast
spanning-tree portfast trunk
spanning-tree bpduguard enable
spanning-tree bpdufilter enable
spanning-tree guard root
spanning-tree guard loop
<span class="c">! Global defaults aur recovery</span>
spanning-tree portfast default
spanning-tree portfast bpduguard default
spanning-tree portfast bpdufilter default
spanning-tree loopguard default
errdisable recovery cause bpduguard
errdisable recovery interval 300
<span class="c">! Verification</span>
show spanning-tree vlan 10
show spanning-tree root
show spanning-tree summary
show spanning-tree blockedports
show spanning-tree interface Gi0/5 detail
show spanning-tree vlan 10 detail
show spanning-tree inconsistentports
show interfaces status err-disabled</pre>

<div class="eg"><p><b>Lab ke saath final self-test.</b> Tuned lab, VLAN 20: root SW2 (24596), SW1 secondary (28692), SW3 default (32788). SW3 ke roles predict karo. Jawab: Gi0/2 root port (cost 4), Gi0/1 alternate (tied SW1-SW3 segment SW1 kam BID se jeetta hai), Gi0/6 designated aur edge. Phir socho ki bina BPDU Guard ke Gi0/7 par ROGUE hai: uski priority 0 + 20 = 20 sabko harati hai, isliye ROGUE VLAN 20 ka root ban jaata hai aur har switch recalculate karta hai. Guard ke saath Gi0/7 err-disabled hota hai aur kuch nahi badalta.</p></div>

<div class="warn"><p><b>Common galti.</b> Comparison order ke bina numbers ratna. Lagbhag har exam calculation hai "kam jeetta hai, is order mein compare karo": root BID, root path cost, sender BID, sender port ID.</p></div>

<div class="exam"><p><b>Exam trap.</b> Output questions dhyan se padho: <code>Altn BLK</code> kharab nahi hai, yeh healthy backup hai; <code>protocol rstp</code> ka matlab Rapid PVST+; <code>P2p Edge</code> ka matlab PortFast active hai; Type column mein <code>*ROOT_Inc</code> ka matlab Root Guard ne port block kiya hai.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Network support role ki ek candidate ko mixed 1G aur 100M links wale chaar switches ki drawing di gayi aur poocha gaya ki loop kahan block hoga. Usne har Bridge ID likha, sabse kam ko root ke roop mein circle kiya, har switch ke paas root path costs likhi, har switch par ek root port mark kiya, phir har link par ek designated port, aur bacha hua ek port kaat diya, har tie-breaker bol kar samjhate hue. Interviewer ne kaha ki answer se zyada method matter karta hai.</p><p><b>Seekh:</b> chapter 6 ki paanch-step recipe kisi bhi STP puzzle ko routine kaam bana deti hai, exam aur interview dono mein.</p></div>

<div class="iv"><p class="q">"Ek minute se kam mein summarise karo ki spanning tree loop-free topology kaise banata hai."</p><p>Strong answer: switches BPDUs exchange karte hain aur sabse kam Bridge ID ko root elect karte hain. Har non-root switch sabse kam root path cost, phir neighbour BID, phir neighbour port ID se ek root port chunta hai. Har link ko ek designated port milta hai. Baaki saare ports discard karte hain. Rapid PVST+ ise RSTP handshakes ke saath har VLAN ke liye chalata hai, isliye convergence lagbhag ek second hai. Engineers priority se root place karte hain, edges ko PortFast aur BPDU Guard se protect karte hain, aur core ko Root Guard aur Loop Guard se guard karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop-free tree: root elect karo, har non-root switch par ek RP, har link par ek DP, baaki discard.</li>
<li>Kam hamesha jeetta hai: root BID, root path cost, sender BID, sender port ID.</li>
<li>Rapid PVST+: har VLAN ka ek RSTP instance, lagbhag ek second convergence, per-VLAN root placement.</li>
<li>Root aur secondary design karo; host ports ko PortFast aur BPDU Guard se protect karo; core mein Root aur Loop Guard use karo.</li>
<li>Order mein troubleshoot karo: scope, root, path, guards, stability.</li>
</ul></div>
`}};export{e as default};