var e={id:`stp-rstp-deep-dive`,h:{en:`STP deep dive: 802.1D recap, RSTP proposal/agreement and topology changes`,hi:`STP deep dive: 802.1D recap, RSTP proposal/agreement aur topology changes`},body:{en:`
<p>Classic 802.1D is a cautious traffic officer who, when a road opens, waits 30 seconds with the barrier half up "just in case". RSTP is an officer with a radio: before opening a road he calls the next junction, asks "are you safe?", hears "yes" and opens at once. Same rules for who is in charge; a completely different speed.</p>

<h3>802.1D recap in five lines</h3>
<ul>
<li><b>Root bridge</b>: lowest bridge ID (priority, default 32768 + sys-id-ext, then MAC).</li>
<li><b>Root port</b> on every other switch: lowest root path cost, then lowest sender bridge ID, then lowest sender port ID.</li>
<li><b>Designated port</b> on every segment: the port closest to the root; every other port blocks.</li>
<li><b>Costs</b>: short method 1G = 4, 10G = 2; long method (802.1t) 1G = 20000, 10G = 2000, 100M = 200000. MST always uses long costs; PVST+ uses long ones after <code>spanning-tree pathcost method long</code>.</li>
<li><b>Timers</b>: hello 2 s, max age 20 s, forward delay 15 s. A port goes blocking, listening (15 s), learning (15 s), forwarding: 30 s, or up to 50 s when it must first wait for max age.</li>
</ul>

<h3>RSTP (802.1w): what changed</h3>
<table class="cmp"><tr><th>Topic</th><th>802.1D</th><th>RSTP</th></tr>
<tr><td>Port states</td><td>blocking, listening, learning, forwarding</td><td><b>discarding</b>, learning, forwarding</td></tr>
<tr><td>Port roles</td><td>root, designated, blocked</td><td>root, designated, <b>alternate</b> (backup path to the root), <b>backup</b> (second port on the same shared segment)</td></tr>
<tr><td>BPDUs</td><td>only relayed from the root</td><td>every switch sends its own every hello; neighbour lost after 3 missed hellos (6 s)</td></tr>
<tr><td>Transition</td><td>timers</td><td>handshake (proposal/agreement) on point-to-point links; alternate becomes root port immediately</td></tr></table>

<h3>Link types decide how fast a port may move</h3>
<dl class="terms">
<dt>Edge</dt><dd>A port to an end host, configured with PortFast. Goes to forwarding immediately and never causes a topology change. If it receives a BPDU it loses edge status.</dd>
<dt>Point-to-point</dt><dd>Detected automatically from <b>full duplex</b>. Only here can the proposal/agreement handshake run.</dd>
<dt>Shared</dt><dd>Half duplex (a hub). RSTP falls back to 802.1D-style timers. Override with <code>spanning-tree link-type point-to-point</code> if you know better.</dd>
</dl>

<h3>Proposal and agreement, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RSTP proposal agreement">
<rect x="30" y="30" width="120" height="44" rx="8" fill="#bae6fd"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">Root</text>
<rect x="260" y="30" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="13">SW-A</text>
<rect x="490" y="30" width="120" height="44" rx="8" fill="#fde68a"/><text x="550" y="57" text-anchor="middle" class="svg-ink" font-size="13">SW-B</text>
<line x1="150" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><text x="205" y="94" text-anchor="middle" class="svg-accent" font-size="12">1 proposal</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">2 sync: block non-edge</text>
<text x="320" y="141" text-anchor="middle" class="svg-muted" font-size="12">designated ports</text>
<line x1="260" y1="165" x2="150" y2="165" stroke="#64748b" stroke-width="2"/><text x="205" y="159" text-anchor="middle" class="svg-accent" font-size="12">3 agreement</text>
<text x="90" y="195" text-anchor="middle" class="svg-muted" font-size="12">4 forwarding now</text>
<line x1="380" y1="210" x2="490" y2="210" stroke="#64748b" stroke-width="2"/><text x="435" y="204" text-anchor="middle" class="svg-accent" font-size="12">5 proposal</text>
<text x="550" y="235" text-anchor="middle" class="svg-muted" font-size="12">wave moves down the tree</text>
</svg><p class="cap">The sync wave: each switch blocks downstream before agreeing, so no loop can form while the upstream port opens instantly.</p></div>
<ol>
<li>A new link comes up. The root's port is designated and discarding; it sends a BPDU with the <b>proposal</b> flag.</li>
<li>SW-A sees a superior BPDU, makes that port its root port and runs <b>sync</b>: it puts all its non-edge designated ports into discarding. Edge ports keep forwarding.</li>
<li>SW-A replies with an <b>agreement</b>.</li>
<li>The root moves its port to forwarding at once, no timers.</li>
<li>SW-A now sends proposals on its own designated ports, and the wave moves down the tree in well under a second.</li>
</ol>
<p>If the neighbour never answers (it runs 802.1D, or the link is shared), the port falls back to learning and forwarding by forward-delay timers. That is why a single legacy switch slows convergence of its whole segment.</p>

<h3>Topology change handling</h3>
<p>A topology change (TC) makes CAM entries point to the wrong ports, so switches must forget them.</p>
<ul>
<li><b>802.1D</b>: the detecting switch sends a <b>TCN BPDU</b> out its root port every hello until the upstream switch sets the <b>TCA</b> flag; each hop repeats this up to the root. The root then sets the <b>TC</b> flag in its BPDUs for max age + forward delay (35 s), and every switch shortens CAM aging to forward delay (15 s).</li>
<li><b>RSTP</b>: only a <b>non-edge port moving to forwarding</b> is a TC (a port going down or blocking is not). The detecting switch starts a TC-while timer (2 x hello), <b>flushes</b> MACs learned on its other non-edge ports and sends BPDUs with the TC flag on its root and designated ports. Each receiver flushes all ports except the one the TC came in on, and floods the TC onward. No trip to the root is needed.</li>
</ul>
<pre class="out">SW1# show spanning-tree vlan 10 detail

 VLAN0010 is executing the rstp compatible Spanning Tree protocol
  Bridge Identifier has priority 24576, sysid 10, address 5254.0001.0000
  Configured hello time 2, max age 20, forward delay 15, transmit hold-count 6
  We are the root of the spanning tree
  Topology change flag not set, detected flag not set
<span class="hl">  Number of topology changes 38 last change occurred 00:00:41 ago
          from GigabitEthernet0/2</span></pre>

<div class="eg"><p><b>Worked example: chasing a TC storm.</b> Users complain of short slowdowns every minute. On SW1 the counter shows 38 changes, last from Gi0/2. Gi0/2 leads to SW3, so run the same command on SW3 for the same VLAN: the last change came from Gi0/7. Gi0/7 is an access port with no PortFast feeding a PC that sleeps and wakes constantly. Every wake moves a non-edge port to forwarding, which floods a TC through the VLAN and flushes every CAM. Fix: <code>spanning-tree portfast</code> on Gi0/7 (and on all host ports). Count on SW1 stops growing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking RSTP always converges in a second. It does only on point-to-point links between RSTP switches. A half-duplex link, a legacy 802.1D neighbour or a missing PortFast on host ports brings back timers or constant TCs.</p></div>

<div class="exam"><p><b>Exam trap.</b> In RSTP, a port going to discarding does not generate a TC; only a non-edge port going to forwarding does. The alternate port is RSTP's name for the pre-computed backup root port; the backup port exists only on shared media.</p></div>

<div class="scn"><h4>Voice calls clipping every few minutes</h4><p>A contact centre on Rapid PVST+ had IP phones dropping audio for a second several times an hour. <code>show spanning-tree detail</code> on the distribution switch showed thousands of topology changes. Following "from" hop by hop led to an access switch whose phone ports had PortFast removed by a template error. Each phone reboot after a firmware push triggered a TC and a CAM flush across the voice VLAN, causing a flood burst. Re-applying <code>spanning-tree portfast</code> on the access ports stopped the TCs.</p><p><b>Lesson:</b> TC counters plus the "from" interface lead you straight to the port causing churn.</p></div>

<div class="iv"><p class="q">"Explain how RSTP converges so quickly compared with 802.1D."</p><p>Strong answer: RSTP replaces timers with a handshake. On point-to-point links a designated port proposes, the downstream switch syncs by blocking its non-edge designated ports and agrees, and the upstream port forwards immediately; the wave moves down the tree. Alternate ports are pre-computed, so a root port failure is fixed instantly, and neighbours are declared lost after 3 missed hellos instead of 20 s max age. Mention edge ports and that TCs flush MACs directly rather than via the root.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D: root by lowest bridge ID, timers 2/20/15, 30-50 s convergence.</li>
<li>RSTP states: discarding, learning, forwarding; roles: root, designated, alternate, backup.</li>
<li>Link types: edge (PortFast), point-to-point (full duplex, handshake), shared (timers).</li>
<li>Proposal, sync, agreement: the upstream port forwards immediately and the wave moves down.</li>
<li>RSTP TC = non-edge port to forwarding; MACs are flushed at once; use the "from" field to find the source.</li>
</ul></div>
`,hi:`
<p>Classic 802.1D ek darpok traffic officer hai jo sadak khulne par 30 second tak barrier aadha upar rakh kar "just in case" intezaar karta hai. RSTP radio wala officer hai: sadak kholne se pehle woh agle chauraahe ko call karta hai, poochta hai "tum safe ho?", "haan" sunta hai aur turant khol deta hai. Kaun in-charge hai iske rules same hain; speed bilkul alag.</p>

<h3>Paanch lines mein 802.1D recap</h3>
<ul>
<li><b>Root bridge</b>: sabse kam bridge ID (priority, default 32768 + sys-id-ext, phir MAC).</li>
<li>Har doosre switch par <b>root port</b>: sabse kam root path cost, phir sabse kam sender bridge ID, phir sabse kam sender port ID.</li>
<li>Har segment par <b>designated port</b>: root ke sabse kareeb wala port; baaki har port block hota hai.</li>
<li><b>Costs</b>: short method 1G = 4, 10G = 2; long method (802.1t) 1G = 20000, 10G = 2000, 100M = 200000. MST hamesha long costs use karta hai; PVST+ <code>spanning-tree pathcost method long</code> ke baad long use karta hai.</li>
<li><b>Timers</b>: hello 2 s, max age 20 s, forward delay 15 s. Port blocking, listening (15 s), learning (15 s), forwarding jaata hai: 30 s, ya 50 s tak jab pehle max age ka intezaar karna pade.</li>
</ul>

<h3>RSTP (802.1w): kya badla</h3>
<table class="cmp"><tr><th>Topic</th><th>802.1D</th><th>RSTP</th></tr>
<tr><td>Port states</td><td>blocking, listening, learning, forwarding</td><td><b>discarding</b>, learning, forwarding</td></tr>
<tr><td>Port roles</td><td>root, designated, blocked</td><td>root, designated, <b>alternate</b> (root tak backup path), <b>backup</b> (same shared segment par doosra port)</td></tr>
<tr><td>BPDUs</td><td>sirf root se relay</td><td>har switch har hello par apna bhejta hai; 3 hellos miss hone (6 s) par neighbour lost</td></tr>
<tr><td>Transition</td><td>timers</td><td>point-to-point links par handshake (proposal/agreement); alternate turant root port banta hai</td></tr></table>

<h3>Link types decide karte hain port kitni jaldi move kar sakta hai</h3>
<dl class="terms">
<dt>Edge</dt><dd>End host ki taraf port, PortFast ke saath configured. Turant forwarding mein jaata hai aur kabhi topology change nahi karta. BPDU mile to edge status kho deta hai.</dd>
<dt>Point-to-point</dt><dd><b>Full duplex</b> se automatically detect hota hai. Sirf yahin proposal/agreement handshake chal sakta hai.</dd>
<dt>Shared</dt><dd>Half duplex (hub). RSTP 802.1D-style timers par wapas aa jaata hai. Agar aap behtar jaante ho to <code>spanning-tree link-type point-to-point</code> se override karo.</dd>
</dl>

<h3>Proposal aur agreement, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RSTP proposal agreement">
<rect x="30" y="30" width="120" height="44" rx="8" fill="#bae6fd"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">Root</text>
<rect x="260" y="30" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="13">SW-A</text>
<rect x="490" y="30" width="120" height="44" rx="8" fill="#fde68a"/><text x="550" y="57" text-anchor="middle" class="svg-ink" font-size="13">SW-B</text>
<line x1="150" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><text x="205" y="94" text-anchor="middle" class="svg-accent" font-size="12">1 proposal</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">2 sync: non-edge</text>
<text x="320" y="141" text-anchor="middle" class="svg-muted" font-size="12">designated ports block</text>
<line x1="260" y1="165" x2="150" y2="165" stroke="#64748b" stroke-width="2"/><text x="205" y="159" text-anchor="middle" class="svg-accent" font-size="12">3 agreement</text>
<text x="90" y="195" text-anchor="middle" class="svg-muted" font-size="12">4 turant forwarding</text>
<line x1="380" y1="210" x2="490" y2="210" stroke="#64748b" stroke-width="2"/><text x="435" y="204" text-anchor="middle" class="svg-accent" font-size="12">5 proposal</text>
<text x="550" y="235" text-anchor="middle" class="svg-muted" font-size="12">lehar tree mein neeche jaati hai</text>
</svg><p class="cap">Sync ki lehar: har switch agree karne se pehle downstream block karta hai, isliye upstream port turant khulte waqt koi loop nahi ban sakta.</p></div>
<ol>
<li>Naya link up hota hai. Root ka port designated aur discarding hai; woh <b>proposal</b> flag wala BPDU bhejta hai.</li>
<li>SW-A superior BPDU dekhta hai, us port ko apna root port banata hai aur <b>sync</b> chalata hai: apne saare non-edge designated ports ko discarding mein daal deta hai. Edge ports forward karte rehte hain.</li>
<li>SW-A <b>agreement</b> ke saath jawab deta hai.</li>
<li>Root apna port turant forwarding mein le jaata hai, koi timers nahi.</li>
<li>Ab SW-A apne designated ports par proposals bhejta hai, aur lehar ek second se bhi kam mein tree mein neeche jaati hai.</li>
</ol>
<p>Agar neighbour kabhi jawab na de (woh 802.1D chala raha ho, ya link shared ho), to port forward-delay timers se learning aur forwarding par wapas aa jaata hai. Isliye ek legacy switch apne poore segment ka convergence slow kar deta hai.</p>

<h3>Topology change handling</h3>
<p>Topology change (TC) CAM entries ko galat ports ki taraf point karwa deta hai, isliye switches ko unhe bhoolna padta hai.</p>
<ul>
<li><b>802.1D</b>: detect karne wala switch apne root port se har hello par <b>TCN BPDU</b> bhejta hai jab tak upstream switch <b>TCA</b> flag set na kare; har hop root tak yahi dohrata hai. Phir root apne BPDUs mein max age + forward delay (35 s) tak <b>TC</b> flag set karta hai, aur har switch CAM aging ko forward delay (15 s) tak chhota kar deta hai.</li>
<li><b>RSTP</b>: sirf <b>non-edge port ka forwarding mein jaana</b> TC hai (port ka down ya blocking hona nahi). Detect karne wala switch TC-while timer (2 x hello) shuru karta hai, apne doosre non-edge ports par seekhe MACs <b>flush</b> karta hai aur apne root aur designated ports par TC flag wale BPDUs bhejta hai. Har receiver us port ko chhod kar jahan TC aaya, saare ports flush karta hai, aur TC aage flood karta hai. Root tak jaane ki zaroorat nahi.</li>
</ul>
<pre class="out">SW1# show spanning-tree vlan 10 detail

 VLAN0010 is executing the rstp compatible Spanning Tree protocol
  Bridge Identifier has priority 24576, sysid 10, address 5254.0001.0000
  Configured hello time 2, max age 20, forward delay 15, transmit hold-count 6
  We are the root of the spanning tree
  Topology change flag not set, detected flag not set
<span class="hl">  Number of topology changes 38 last change occurred 00:00:41 ago
          from GigabitEthernet0/2</span></pre>

<div class="eg"><p><b>Worked example: TC storm ka peecha.</b> Users har minute chhote slowdowns ki shikayat karte hain. SW1 par counter 38 changes dikhata hai, aakhri Gi0/2 se. Gi0/2 SW3 ki taraf jaata hai, to SW3 par same VLAN ke liye wahi command chalao: aakhri change Gi0/7 se aaya. Gi0/7 bina PortFast wala access port hai jisme ek PC hai jo baar baar sota aur jaagta hai. Har baar jaagne par non-edge port forwarding mein jaata hai, jo VLAN mein TC flood karta hai aur har CAM flush karta hai. Fix: Gi0/7 par (aur saare host ports par) <code>spanning-tree portfast</code>. SW1 par count badhna band ho jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Sochna ki RSTP hamesha ek second mein converge karta hai. Aisa sirf RSTP switches ke beech point-to-point links par hota hai. Half-duplex link, legacy 802.1D neighbour ya host ports par missing PortFast timers ya lagataar TCs wapas le aate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> RSTP mein port ka discarding mein jaana TC generate nahi karta; sirf non-edge port ka forwarding mein jaana karta hai. Alternate port pehle se calculated backup root port ka RSTP naam hai; backup port sirf shared media par hota hai.</p></div>

<div class="scn"><h4>Har kuch minute mein katti voice calls</h4><p>Rapid PVST+ wale ek contact centre mein IP phones ghante mein kai baar ek second ke liye audio kho rahe the. Distribution switch par <code>show spanning-tree detail</code> ne hazaaron topology changes dikhaye. "from" ko hop by hop follow karne par ek access switch mila jiske phone ports se template error ki wajah se PortFast hat gaya tha. Firmware push ke baad har phone reboot TC aur voice VLAN mein CAM flush trigger karta tha, jisse flood burst hota tha. Access ports par <code>spanning-tree portfast</code> dobara lagane se TCs ruk gaye.</p><p><b>Seekh:</b> TC counters plus "from" interface aapko seedha churn karne wale port tak le jaate hain.</p></div>

<div class="iv"><p class="q">"Samjhao ki RSTP 802.1D ke muqable itni jaldi converge kaise karta hai."</p><p>Strong answer: RSTP timers ko handshake se replace karta hai. Point-to-point links par designated port propose karta hai, downstream switch apne non-edge designated ports block karke sync karta hai aur agree karta hai, aur upstream port turant forward karta hai; lehar tree mein neeche jaati hai. Alternate ports pehle se calculated hote hain, isliye root port failure turant fix hota hai, aur neighbours 20 s max age ki jagah 3 missed hellos ke baad lost maane jaate hain. Edge ports ka zikr karo aur yeh ki TCs root ke through jaane ki jagah seedhe MACs flush karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D: sabse kam bridge ID se root, timers 2/20/15, 30-50 s convergence.</li>
<li>RSTP states: discarding, learning, forwarding; roles: root, designated, alternate, backup.</li>
<li>Link types: edge (PortFast), point-to-point (full duplex, handshake), shared (timers).</li>
<li>Proposal, sync, agreement: upstream port turant forward karta hai aur lehar neeche jaati hai.</li>
<li>RSTP TC = non-edge port ka forwarding mein jaana; MACs turant flush; source dhoondhne ke liye "from" field use karo.</li>
</ul></div>
`}};export{e as default};