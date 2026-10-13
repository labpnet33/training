var e={id:`rstp`,h:{en:`RSTP: roles, states, link types and proposal/agreement`,hi:`RSTP: roles, states, link types aur proposal/agreement`},body:{en:`
<p>Picture a one-lane bridge with a policeman at each end. The classic method is: "stop all traffic, wait 30 seconds to be sure the bridge is empty, then let cars through." The rapid method is a walkie-talkie: "Can I send my cars?" "Wait, let me stop mine... done, go ahead." Same safety, a fraction of the delay. That walkie-talkie conversation is RSTP's <b>proposal/agreement</b> handshake, and it is why Rapid PVST+ converges in about a second.</p>

<h3>What stays the same</h3>
<p>RSTP (802.1w) keeps everything from chapters 4 to 6: the Bridge ID, the path costs, the root election and the rules for root and designated ports. What changes is how a port reaches forwarding and how failures are detected.</p>

<h3>RSTP port roles</h3>
<dl class="terms">
<dt>Root port</dt><dd>Best path to the root, one per non-root switch. Forwarding.</dd>
<dt>Designated port</dt><dd>Best port on a segment, forwarding away from the root.</dd>
<dt>Alternate port</dt><dd>A discarding port that receives a <b>better BPDU from another switch</b>. It is a ready-made backup for the <b>root port</b>: if the root port fails, the alternate becomes root port and forwards immediately. This is what SW3 Gi0/2 is in VLAN 10 after the lab is tuned.</dd>
<dt>Backup port</dt><dd>A discarding port that receives a better BPDU from <b>its own switch</b>, which only happens when two ports of one switch connect to the same shared segment (a hub). It backs up a designated port. Rare in modern networks.</dd>
<dt>Disabled</dt><dd>Administratively down or failed.</dd>
</dl>

<h3>RSTP port states</h3>
<table class="cmp"><tr><th>802.1D state</th><th>RSTP state</th><th>Learns MACs</th><th>Forwards</th></tr>
<tr><td>Disabled</td><td rowspan="3">Discarding</td><td rowspan="3">No</td><td rowspan="3">No</td></tr>
<tr><td>Blocking</td></tr>
<tr><td>Listening</td></tr>
<tr><td>Learning</td><td>Learning</td><td>Yes</td><td>No</td></tr>
<tr><td>Forwarding</td><td>Forwarding</td><td>Yes</td><td>Yes</td></tr>
</table>
<p>Role and state are separate ideas: an alternate port is <i>discarding</i>; a designated port may be discarding for a moment during the handshake and then <i>forwarding</i>. Cisco output still prints discarding as <code>BLK</code>.</p>

<h3>Link types</h3>
<ul>
<li><b>Point-to-point</b> (<code>P2p</code>): a full-duplex link between two switches. The only link type on which proposal/agreement works. Full duplex is detected automatically.</li>
<li><b>Shared</b> (<code>Shr</code>): a half-duplex port, assumed to face a hub. RSTP falls back to 802.1D-style timers here.</li>
<li><b>Edge</b> (<code>Edge</code>): a port configured with PortFast, facing a host. It goes to forwarding immediately, is ignored by sync, and never causes a topology change. If it receives a BPDU it loses edge status at once.</li>
</ul>
<p>You can override detection with <code>spanning-tree link-type point-to-point</code> on an interface, for example on a half-duplex link you know is point-to-point.</p>

<h3>Proposal and agreement, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RSTP proposal and agreement handshake">
<rect x="40" y="30" width="150" height="46" rx="8" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW1 (upstream)</text>
<rect x="450" y="30" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="525" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW3 (downstream)</text>
<line x1="115" y1="76" x2="115" y2="240" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="525" y1="76" x2="525" y2="240" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="115" y1="100" x2="525" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="94" text-anchor="middle" class="svg-accent" font-size="13">1. BPDU with Proposal flag</text>
<rect x="400" y="120" width="220" height="44" rx="6" fill="#fde68a"/><text x="510" y="139" text-anchor="middle" class="svg-ink" font-size="12">2. sync: block other</text><text x="510" y="155" text-anchor="middle" class="svg-ink" font-size="12">non-edge designated ports</text>
<line x1="525" y1="190" x2="115" y2="190" stroke="#64748b" stroke-width="2"/><text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="13">3. BPDU with Agreement flag</text>
<text x="115" y="225" text-anchor="middle" class="svg-ink" font-size="12">4. DP forwards now</text>
<text x="525" y="225" text-anchor="middle" class="svg-ink" font-size="12">RP forwards now</text>
</svg><p class="cap">No timers: the link forwards as soon as the agreement arrives, typically in milliseconds per hop.</p></div>
<ol>
<li>A new link comes up. SW1's port becomes designated but starts in <b>discarding</b>, and SW1 sends a BPDU with the <b>Proposal</b> flag: "I want to be designated here and forward."</li>
<li>SW3 sees the proposal is superior and makes this port its root port. Before agreeing, it performs <b>sync</b>: it moves all its other <b>non-edge designated ports</b> to discarding, so no loop can form through it. Edge ports keep forwarding; alternate ports are already discarding.</li>
<li>SW3 sends a BPDU with the <b>Agreement</b> flag back out of its root port.</li>
<li>SW1 moves its designated port straight to forwarding, and SW3 forwards on its root port. Then each of SW3's newly blocked designated ports sends its own proposal downstream, and the handshake ripples to the edge of the network.</li>
</ol>

<h3>Other RSTP improvements</h3>
<ul>
<li><b>Every switch sends BPDUs</b> every hello (2 s), not only the root. BPDUs act as keepalives: <b>three missed hellos (6 s)</b> and the neighbour's information is aged out, instead of 20 s max age.</li>
<li><b>Alternate to root in an instant</b>: when the root port fails, the alternate port becomes root port and forwards immediately (the old UplinkFast idea).</li>
<li><b>Inferior BPDUs are acted on at once</b>: a switch that hears a neighbour suddenly claim a worse root replies immediately with its better information (the old BackboneFast idea).</li>
<li><b>Topology changes</b>: only a <b>non-edge port moving to forwarding</b> generates a TC. The detecting switch floods BPDUs with the TC flag out of its non-edge ports and flushes their MAC entries immediately; every switch that receives it does the same. No TCN trip to the root.</li>
</ul>

<div class="eg"><p><b>Worked example: the tuned lab.</b> After chapter 9, SW3 in VLAN 10 shows Gi0/1 as root port and Gi0/2 as alternate. If the SW1-SW3 cable is pulled, SW3 detects loss of light, promotes Gi0/2 to root port and forwards within milliseconds; the only delay is flushing MAC entries. PC1 sees perhaps one lost ping.</p>
<pre class="out">SW3# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.2    P2p
<span class="hl">Gi0/2               Altn BLK 4         128.3    P2p</span>
Gi0/5               Desg FWD 4         128.6    P2p Edge</pre></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting that RSTP speed depends on <b>point-to-point</b> links and <b>edge</b> ports. A host port without PortFast is a non-edge designated port: it is caught in every sync and triggers a TC each time the PC reboots. A half-duplex link falls back to timers.</p></div>

<div class="exam"><p><b>Exam trap.</b> RSTP has <b>three</b> states (discarding, learning, forwarding) and <b>four</b> active roles (root, designated, alternate, backup) plus disabled. <b>Alternate</b> backs up the root port via another switch; <b>backup</b> backs up a designated port on a shared segment. An <code>Altn BLK</code> line means alternate role, discarding state.</p></div>

<div class="scn"><h4>The media converter that forced half duplex</h4><p>A warehouse reached its office building over fibre using two old media converters. During a failover test, the backup path took 30 seconds to forward even though everything ran Rapid PVST+. <code>show spanning-tree vlan 10</code> showed the link as <code>Shr</code>: a converter had forced half duplex, so RSTP treated the link as shared and could not use proposal/agreement. Fixing the converter settings to full duplex (and, as a safety net, <code>spanning-tree link-type point-to-point</code>) brought failover down to under a second.</p><p><b>Lesson:</b> check the Type column; <code>Shr</code> or <code>Peer(STP)</code> means RSTP is running slow on that port.</p></div>

<div class="iv"><p class="q">"How does RSTP converge so much faster than 802.1D?"</p><p>Strong answer: RSTP replaces timers with explicit handshakes. On point-to-point links the designated port proposes, the downstream switch syncs by blocking its other non-edge designated ports, agrees, and both ends forward immediately. Alternate ports are pre-computed backups for the root port and take over at once. Every switch sends BPDUs as keepalives, so a lost neighbour is detected in 6 s, and edge ports go straight to forwarding without TCs. Mention the three states and four roles.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSTP roles: root, designated, alternate (backs up the RP), backup (backs up a DP on a shared segment), disabled.</li>
<li>RSTP states: discarding, learning, forwarding; Cisco shows discarding as BLK.</li>
<li>Link types: point-to-point (full duplex), shared (half duplex), edge (PortFast).</li>
<li>Proposal, sync, agreement: forwarding in about a second with no timers, only on point-to-point links.</li>
<li>BPDUs are keepalives (3 missed hellos = 6 s); only non-edge ports going to forwarding cause TCs.</li>
</ul></div>
`,hi:`
<p>Ek one-lane bridge socho jiske dono ends par ek ek policeman hai. Classic tareeka hai: "saara traffic roko, 30 second wait karo taaki pakka ho ki bridge khaali hai, phir gaadiyan jaane do." Rapid tareeka walkie-talkie hai: "Kya main apni gaadiyan bhej doon?" "Ruko, main apni rok leta hoon... ho gaya, bhejo." Same safety, delay ka chhota sa hissa. Wahi walkie-talkie baat-cheet RSTP ka <b>proposal/agreement</b> handshake hai, aur isiliye Rapid PVST+ lagbhag ek second mein converge karta hai.</p>

<h3>Kya same rehta hai</h3>
<p>RSTP (802.1w) chapters 4 se 6 ki har cheez rakhta hai: Bridge ID, path costs, root election aur root aur designated ports ke rules. Jo badalta hai woh hai ki port forwarding tak kaise pahunchta hai aur failures kaise detect hote hain.</p>

<h3>RSTP port roles</h3>
<dl class="terms">
<dt>Root port</dt><dd>Root tak best path, har non-root switch par ek. Forwarding.</dd>
<dt>Designated port</dt><dd>Segment par best port, root se door ki taraf forwarding.</dd>
<dt>Alternate port</dt><dd>Discarding port jo <b>kisi doosre switch se better BPDU</b> receive karta hai. Yeh <b>root port</b> ka ready-made backup hai: root port fail ho to alternate root port banta hai aur turant forward karta hai. Lab tune hone ke baad VLAN 10 mein SW3 Gi0/2 yahi hai.</dd>
<dt>Backup port</dt><dd>Discarding port jo <b>apne hi switch</b> se better BPDU receive karta hai, jo sirf tab hota hai jab ek switch ke do ports same shared segment (hub) se jude hon. Yeh designated port ka backup hai. Modern networks mein rare.</dd>
<dt>Disabled</dt><dd>Administratively down ya failed.</dd>
</dl>

<h3>RSTP port states</h3>
<table class="cmp"><tr><th>802.1D state</th><th>RSTP state</th><th>MACs learn</th><th>Forward</th></tr>
<tr><td>Disabled</td><td rowspan="3">Discarding</td><td rowspan="3">Nahi</td><td rowspan="3">Nahi</td></tr>
<tr><td>Blocking</td></tr>
<tr><td>Listening</td></tr>
<tr><td>Learning</td><td>Learning</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Forwarding</td><td>Forwarding</td><td>Haan</td><td>Haan</td></tr>
</table>
<p>Role aur state alag ideas hain: alternate port <i>discarding</i> hota hai; designated port handshake ke dauraan ek pal ke liye discarding ho sakta hai aur phir <i>forwarding</i>. Cisco output discarding ko abhi bhi <code>BLK</code> print karta hai.</p>

<h3>Link types</h3>
<ul>
<li><b>Point-to-point</b> (<code>P2p</code>): do switches ke beech full-duplex link. Akela link type jis par proposal/agreement kaam karta hai. Full duplex apne aap detect hota hai.</li>
<li><b>Shared</b> (<code>Shr</code>): half-duplex port, maana jaata hai ki hub ki taraf hai. Yahan RSTP 802.1D-style timers par wapas aa jaata hai.</li>
<li><b>Edge</b> (<code>Edge</code>): PortFast ke saath configured port, host ki taraf. Turant forwarding mein jaata hai, sync ise ignore karta hai, aur yeh kabhi topology change nahi karta. Agar ise BPDU mile to yeh turant edge status kho deta hai.</li>
</ul>
<p>Aap interface par <code>spanning-tree link-type point-to-point</code> se detection override kar sakte ho, jaise us half-duplex link par jiske baare mein aap jaante ho ki woh point-to-point hai.</p>

<h3>Proposal aur agreement, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RSTP proposal aur agreement handshake">
<rect x="40" y="30" width="150" height="46" rx="8" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW1 (upstream)</text>
<rect x="450" y="30" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="525" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW3 (downstream)</text>
<line x1="115" y1="76" x2="115" y2="240" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="525" y1="76" x2="525" y2="240" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="115" y1="100" x2="525" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="94" text-anchor="middle" class="svg-accent" font-size="13">1. Proposal flag wala BPDU</text>
<rect x="400" y="120" width="220" height="44" rx="6" fill="#fde68a"/><text x="510" y="139" text-anchor="middle" class="svg-ink" font-size="12">2. sync: baaki non-edge</text><text x="510" y="155" text-anchor="middle" class="svg-ink" font-size="12">designated ports block</text>
<line x1="525" y1="190" x2="115" y2="190" stroke="#64748b" stroke-width="2"/><text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="13">3. Agreement flag wala BPDU</text>
<text x="115" y="225" text-anchor="middle" class="svg-ink" font-size="12">4. DP ab forward</text>
<text x="525" y="225" text-anchor="middle" class="svg-ink" font-size="12">RP ab forward</text>
</svg><p class="cap">Koi timer nahi: agreement aate hi link forward karta hai, aam taur par har hop par milliseconds mein.</p></div>
<ol>
<li>Naya link up hota hai. SW1 ka port designated banta hai lekin <b>discarding</b> mein shuru hota hai, aur SW1 <b>Proposal</b> flag ke saath BPDU bhejta hai: "Main yahan designated banke forward karna chahta hoon."</li>
<li>SW3 dekhta hai ki proposal superior hai aur is port ko apna root port banata hai. Agree karne se pehle woh <b>sync</b> karta hai: apne baaki saare <b>non-edge designated ports</b> ko discarding mein daalta hai, taaki uske through koi loop na ban sake. Edge ports forward karte rehte hain; alternate ports pehle se discarding hain.</li>
<li>SW3 apne root port se wapas <b>Agreement</b> flag wala BPDU bhejta hai.</li>
<li>SW1 apne designated port ko seedha forwarding mein le jaata hai, aur SW3 apne root port par forward karta hai. Phir SW3 ke har naye blocked designated port apna proposal downstream bhejta hai, aur handshake network ke edge tak lehar ki tarah jaata hai.</li>
</ol>

<h3>RSTP ke doosre improvements</h3>
<ul>
<li><b>Har switch BPDUs bhejta hai</b> har hello (2 s) par, sirf root nahi. BPDUs keepalives ka kaam karte hain: <b>teen missed hellos (6 s)</b> aur neighbour ki information age out, 20 s max age ki jagah.</li>
<li><b>Alternate se root ek pal mein</b>: root port fail ho to alternate port root port banta hai aur turant forward karta hai (purana UplinkFast idea).</li>
<li><b>Inferior BPDUs par turant action</b>: jo switch neighbour ko achanak worse root claim karte sunta hai, woh turant apni better information ke saath jawab deta hai (purana BackboneFast idea).</li>
<li><b>Topology changes</b>: sirf <b>non-edge port ka forwarding mein jaana</b> TC generate karta hai. Detect karne wala switch apne non-edge ports se TC flag wale BPDUs flood karta hai aur unki MAC entries turant flush karta hai; ise receive karne wala har switch yahi karta hai. Root tak TCN ka safar nahi.</li>
</ul>

<div class="eg"><p><b>Worked example: tuned lab.</b> Chapter 9 ke baad VLAN 10 mein SW3 Gi0/1 ko root port aur Gi0/2 ko alternate dikhata hai. Agar SW1-SW3 cable kheench di jaaye, SW3 loss of light detect karta hai, Gi0/2 ko root port banata hai aur milliseconds mein forward karta hai; delay sirf MAC entries flush karne ka hai. PC1 ko shayad ek ping lost dikhe.</p>
<pre class="out">SW3# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.2    P2p
<span class="hl">Gi0/2               Altn BLK 4         128.3    P2p</span>
Gi0/5               Desg FWD 4         128.6    P2p Edge</pre></div>

<div class="warn"><p><b>Common galti.</b> Bhool jaana ki RSTP ki speed <b>point-to-point</b> links aur <b>edge</b> ports par depend karti hai. Bina PortFast wala host port non-edge designated port hai: woh har sync mein phansta hai aur har baar PC reboot hone par TC trigger karta hai. Half-duplex link timers par wapas aa jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> RSTP ke <b>teen</b> states hain (discarding, learning, forwarding) aur <b>chaar</b> active roles (root, designated, alternate, backup) plus disabled. <b>Alternate</b> doosre switch ke through root port ka backup hai; <b>backup</b> shared segment par designated port ka backup hai. <code>Altn BLK</code> line ka matlab alternate role, discarding state.</p></div>

<div class="scn"><h4>Media converter jisne half duplex force kiya</h4><p>Ek warehouse do purane media converters ke through fibre par office building tak pahunchta tha. Failover test ke dauraan backup path ko forward karne mein 30 second lage, jabki sab kuch Rapid PVST+ chala raha tha. <code>show spanning-tree vlan 10</code> ne link ko <code>Shr</code> dikhaya: ek converter ne half duplex force kar diya tha, isliye RSTP ne link ko shared maana aur proposal/agreement use nahi kar saka. Converter settings full duplex par theek karne se (aur safety net ke roop mein <code>spanning-tree link-type point-to-point</code>) failover ek second se kam ho gaya.</p><p><b>Seekh:</b> Type column check karo; <code>Shr</code> ya <code>Peer(STP)</code> ka matlab us port par RSTP slow chal raha hai.</p></div>

<div class="iv"><p class="q">"RSTP 802.1D se itna tez converge kaise karta hai?"</p><p>Strong answer: RSTP timers ki jagah explicit handshakes use karta hai. Point-to-point links par designated port propose karta hai, downstream switch apne baaki non-edge designated ports block karke sync karta hai, agree karta hai, aur dono ends turant forward karte hain. Alternate ports root port ke pehle se calculate kiye backups hain aur turant le lete hain. Har switch keepalives ki tarah BPDUs bhejta hai, isliye khoya hua neighbour 6 s mein detect hota hai, aur edge ports bina TCs ke seedha forwarding mein jaate hain. Teen states aur chaar roles ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSTP roles: root, designated, alternate (RP ka backup), backup (shared segment par DP ka backup), disabled.</li>
<li>RSTP states: discarding, learning, forwarding; Cisco discarding ko BLK dikhata hai.</li>
<li>Link types: point-to-point (full duplex), shared (half duplex), edge (PortFast).</li>
<li>Proposal, sync, agreement: bina timers ke lagbhag ek second mein forwarding, sirf point-to-point links par.</li>
<li>BPDUs keepalives hain (3 missed hellos = 6 s); sirf non-edge ports ka forwarding mein jaana TCs karta hai.</li>
</ul></div>
`}};export{e as default};