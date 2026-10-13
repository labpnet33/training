var e={id:`spanning-tree`,h:{en:`Spanning tree: redundancy without loops`,hi:`Spanning tree: loops ke bina redundancy`},body:{en:`
<h3>The analogy: one-way barriers on a ring road</h3>
<p>A town builds a ring road so that if one road is closed, traffic can go the other way. But the town has no traffic lights and cars never stop, so on a ring they would circle forever and jam everything. The solution: put one barrier on the ring. Traffic follows a tree shape with no circle. If any road on the tree breaks, the barrier is lifted and the ring becomes the backup path. <b>Spanning Tree Protocol (STP)</b> is that barrier for switches.</p>

<h3>Why layer 2 loops are deadly</h3>
<p>Good design connects switches with redundant links so one cable failure does not cut a floor off. But Ethernet frames have <b>no TTL</b>, unlike IP packets. A broadcast sent into a loop is flooded out every port, returns, and is flooded again, forever. Within seconds you get:</p>
<ul>
<li><b>Broadcast storms</b>: links at 100% utilisation with copies of the same frames; switch CPUs pegged.</li>
<li><b>MAC table instability (MAC flapping)</b>: the same source MAC arrives on different ports, so the table keeps changing.</li>
<li><b>Duplicate frames</b>: hosts receive several copies of the same unicast.</li>
</ul>
<p>The whole VLAN (often the whole building) stops working. STP prevents this by logically <b>blocking</b> just enough ports to leave a loop-free tree, and unblocking them if the active path fails.</p>

<h3>How STP builds the tree</h3>
<p>Switches exchange <b>BPDUs</b> (bridge protocol data units) every 2 seconds. From them they perform three steps:</p>
<ol>
<li><b>Elect a root bridge.</b> Each switch has a <b>bridge ID</b> = priority (default 32768, plus the VLAN number on per-VLAN versions) + MAC address. The <b>lowest</b> bridge ID wins. All ports on the root are designated (forwarding).</li>
<li><b>Choose one root port on every other switch</b>: the port with the lowest total <b>path cost</b> to the root. Default costs: 10 Gb/s = 2, 1 Gb/s = 4, 100 Mb/s = 19, 10 Mb/s = 100.</li>
<li><b>Choose one designated port on every link</b>: the side closer to the root. Every port that is neither root nor designated is <b>blocked</b> (called <i>alternate</i> in RSTP).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three-switch triangle with one blocked port">
<rect x="250" y="14" width="140" height="48" rx="8" fill="#fde68a"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">DIST1 (root)</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">priority 24576</text>
<rect x="60" y="160" width="140" height="48" rx="8" fill="#bae6fd"/><text x="130" y="182" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="130" y="200" text-anchor="middle" class="svg-muted" font-size="12">32768</text>
<rect x="440" y="160" width="140" height="48" rx="8" fill="#bae6fd"/><text x="510" y="182" text-anchor="middle" class="svg-ink" font-size="14">ACC2</text><text x="510" y="200" text-anchor="middle" class="svg-muted" font-size="12">32768, higher MAC</text>
<line x1="270" y1="62" x2="150" y2="160" stroke="#64748b" stroke-width="2"/><line x1="370" y1="62" x2="490" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="184" x2="440" y2="184" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="140" y="120" class="svg-ink" font-size="12">RP</text><text x="480" y="120" class="svg-ink" font-size="12">RP</text>
<text x="210" y="176" class="svg-ink" font-size="12">DP</text><text x="395" y="176" class="svg-accent" font-size="12">BLK</text>
</svg><p class="cap">The root forwards on all ports; each access switch has a root port (RP); on the ACC1-ACC2 link ACC1 is designated (DP) and ACC2 blocks.</p></div>

<h3>Port states, timers and the faster RSTP</h3>
<p>Classic <b>802.1D STP</b> moves a port through <b>blocking, listening, learning, forwarding</b> (plus disabled). With a 20-second max age and two 15-second forward delays, recovery can take 30 to 50 seconds. <b>Rapid STP (802.1w, RSTP)</b> simplifies the states to <b>discarding, learning, forwarding</b>, pre-computes <b>alternate</b> and <b>backup</b> ports, and uses a handshake between switches, so it usually converges in a second or two. Cisco-style switches run one tree per VLAN (<b>PVST+</b> or <b>Rapid PVST+</b>); <b>MSTP (802.1s)</b> maps many VLANs to a few trees. For the exam, know that modern networks should run RSTP or MSTP.</p>
<pre class="code"><span class="c">! Choose rapid spanning tree and make DIST1 the root on purpose</span>
spanning-tree mode rapid-pvst
spanning-tree vlan 10,20 priority 24576
<span class="c">! Edge ports: PCs, printers, phones</span>
interface range GigabitEthernet0/1 - 24
 spanning-tree portfast
 spanning-tree bpduguard enable</pre>
<pre class="out">ACC2#show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     5254.0011.0001
             Cost        4
             Port        1 (GigabitEthernet0/0)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     5254.0033.0003

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/0               Root FWD 4         128.1    P2p
<span class="hl">Gi0/2               Altn BLK 4         128.3    P2p</span>
Gi0/3               Desg FWD 4         128.4    P2p Edge</pre>
<p>The root priority 24586 is 24576 + VLAN 10; ACC2's 32778 is 32768 + 10. <b>PortFast</b> lets an edge port go straight to forwarding (no 30-second wait for a PC to get DHCP). <b>BPDU guard</b> shuts an edge port (err-disabled) if a BPDU arrives there, so a rogue switch plugged into a desk port cannot disturb the tree. <b>Root guard</b> stops a downstream switch from becoming root.</p>

<div class="eg"><p><b>Worked example.</b> Three switches have priority 32768 and MACs ending 0001, 0002, 0003. With no tuning, the switch with MAC ...0001 becomes root, even if it is an old access switch in a closet. Setting the distribution switch to priority 24576 (priorities go in steps of 4096) makes it root for that VLAN, so the tree forms around the strongest, most central switch.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Leaving root election to chance, so an old edge switch becomes root. (2) Disabling STP to "speed things up", then suffering a storm when someone patches a loop. (3) Enabling PortFast on switch-to-switch links. (4) Forgetting BPDU guard on user ports.</p></div>

<div class="exam"><p><b>Exam traps.</b> STP exists to <b>prevent layer 2 loops</b> (broadcast storms). Lowest bridge ID wins root; default priority 32768. Classic STP convergence 30 to 50 seconds; RSTP is much faster. A blocked port still receives BPDUs. PortFast is for end devices only.</p></div>

<div class="scn"><h4>The meeting-room loop</h4><p>During a workshop, someone plugged both ends of a spare patch cable into two floor ports of the same small unmanaged switch under the table, which was itself connected to the office switch. Within seconds the whole floor lost the network and switch CPU hit 99%. Logs showed <code>%SW_MATM-4-MACFLAP_NOTIF</code> messages. The access port to the meeting room had PortFast but not BPDU guard, and the cheap switch did not run STP. The engineer found the port with the storm by its input counters, shut it, removed the cable, and then enabled <code>spanning-tree bpduguard enable</code> and storm control on all user ports.</p><p><b>Lesson:</b> STP protects managed switches, but edge protection (BPDU guard, storm control) is what saves you from loops built outside your control.</p></div>

<div class="iv"><p class="q">"Explain how spanning tree chooses which port to block."</p><p>Strong answer: switches elect the root bridge by lowest bridge ID (priority then MAC). Every non-root switch picks one root port, its lowest-cost path to the root. On every segment, the switch with the best path becomes designated. Remaining ports are blocked (alternate in RSTP). Mention costs (1 Gb/s = 4), that you set the root deliberately with priority, and that RSTP converges far faster than 802.1D.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet frames have no TTL, so a layer 2 loop causes broadcast storms and MAC flapping.</li>
<li>STP elects a root (lowest bridge ID), picks root and designated ports, and blocks the rest.</li>
<li>Classic STP takes 30 to 50 seconds to converge; RSTP (802.1w) takes about a second.</li>
<li>Set the root deliberately with a lower priority (multiples of 4096).</li>
<li>Use PortFast plus BPDU guard on edge ports, never on links to other switches.</li>
</ul></div>
`,hi:`
<h3>Analogy: ring road par one-way barriers</h3>
<p>Ek shehar ring road banata hai taaki agar ek sadak band ho to traffic doosri taraf se ja sake. Lekin shehar mein koi traffic lights nahi hain aur gaadiyan kabhi rukti nahi, isliye ring par woh hamesha ghoomti rahengi aur sab jam kar dengi. Solution: ring par ek barrier lagao. Traffic bina circle ke tree shape follow karta hai. Agar tree ki koi sadak toote, barrier utha diya jaata hai aur ring backup path ban jaati hai. Switches ke liye woh barrier <b>Spanning Tree Protocol (STP)</b> hai.</p>

<h3>Layer 2 loops itne khatarnak kyun hain</h3>
<p>Achha design switches ko redundant links se jodta hai taaki ek cable failure se floor kat na jaaye. Lekin Ethernet frames mein IP packets ki tarah <b>koi TTL nahi</b> hota. Loop mein bheja gaya broadcast har port par flood hota hai, wapas aata hai, aur phir flood hota hai, hamesha ke liye. Seconds mein aapko milta hai:</p>
<ul>
<li><b>Broadcast storms</b>: links same frames ki copies se 100% utilisation par; switch CPUs full.</li>
<li><b>MAC table instability (MAC flapping)</b>: same source MAC alag ports par aata hai, isliye table badalti rehti hai.</li>
<li><b>Duplicate frames</b>: hosts ko same unicast ki kai copies milti hain.</li>
</ul>
<p>Poora VLAN (aksar poori building) kaam karna band kar deta hai. STP ise rokta hai, bas utne ports ko logically <b>block</b> karke jitne loop-free tree chhodne ke liye chahiye, aur active path fail hone par unhe unblock karke.</p>

<h3>STP tree kaise banata hai</h3>
<p>Switches har 2 seconds mein <b>BPDUs</b> (bridge protocol data units) exchange karte hain. Unse woh teen steps karte hain:</p>
<ol>
<li><b>Root bridge elect karo.</b> Har switch ka ek <b>bridge ID</b> hota hai = priority (default 32768, per-VLAN versions mein plus VLAN number) + MAC address. <b>Sabse kam</b> bridge ID jeet-ta hai. Root ke saare ports designated (forwarding) hote hain.</li>
<li><b>Har doosre switch par ek root port chuno</b>: woh port jiska root tak total <b>path cost</b> sabse kam ho. Default costs: 10 Gb/s = 2, 1 Gb/s = 4, 100 Mb/s = 19, 10 Mb/s = 100.</li>
<li><b>Har link par ek designated port chuno</b>: woh side jo root ke zyada paas hai. Jo port na root hai na designated, woh <b>blocked</b> hota hai (RSTP mein ise <i>alternate</i> kehte hain).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Teen switch triangle jismein ek blocked port">
<rect x="250" y="14" width="140" height="48" rx="8" fill="#fde68a"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">DIST1 (root)</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">priority 24576</text>
<rect x="60" y="160" width="140" height="48" rx="8" fill="#bae6fd"/><text x="130" y="182" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="130" y="200" text-anchor="middle" class="svg-muted" font-size="12">32768</text>
<rect x="440" y="160" width="140" height="48" rx="8" fill="#bae6fd"/><text x="510" y="182" text-anchor="middle" class="svg-ink" font-size="14">ACC2</text><text x="510" y="200" text-anchor="middle" class="svg-muted" font-size="12">32768, bada MAC</text>
<line x1="270" y1="62" x2="150" y2="160" stroke="#64748b" stroke-width="2"/><line x1="370" y1="62" x2="490" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="184" x2="440" y2="184" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="140" y="120" class="svg-ink" font-size="12">RP</text><text x="480" y="120" class="svg-ink" font-size="12">RP</text>
<text x="210" y="176" class="svg-ink" font-size="12">DP</text><text x="395" y="176" class="svg-accent" font-size="12">BLK</text>
</svg><p class="cap">Root saare ports par forward karta hai; har access switch ka ek root port (RP) hai; ACC1-ACC2 link par ACC1 designated (DP) hai aur ACC2 block karta hai.</p></div>

<h3>Port states, timers aur tez RSTP</h3>
<p>Classic <b>802.1D STP</b> port ko <b>blocking, listening, learning, forwarding</b> (plus disabled) se guzarta hai. 20-second max age aur do 15-second forward delays ke saath recovery mein 30 se 50 seconds lag sakte hain. <b>Rapid STP (802.1w, RSTP)</b> states ko <b>discarding, learning, forwarding</b> tak simplify karta hai, <b>alternate</b> aur <b>backup</b> ports pehle se calculate rakhta hai, aur switches ke beech handshake use karta hai, isliye aam taur par ek-do second mein converge hota hai. Cisco-style switches har VLAN ka ek tree chalate hain (<b>PVST+</b> ya <b>Rapid PVST+</b>); <b>MSTP (802.1s)</b> kai VLANs ko kuch trees par map karta hai. Exam ke liye yaad rakho ki modern networks ko RSTP ya MSTP chalana chahiye.</p>
<pre class="code"><span class="c">! Rapid spanning tree chuno aur DIST1 ko jaan-boojhkar root banao</span>
spanning-tree mode rapid-pvst
spanning-tree vlan 10,20 priority 24576
<span class="c">! Edge ports: PCs, printers, phones</span>
interface range GigabitEthernet0/1 - 24
 spanning-tree portfast
 spanning-tree bpduguard enable</pre>
<pre class="out">ACC2#show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     5254.0011.0001
             Cost        4
             Port        1 (GigabitEthernet0/0)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     5254.0033.0003

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/0               Root FWD 4         128.1    P2p
<span class="hl">Gi0/2               Altn BLK 4         128.3    P2p</span>
Gi0/3               Desg FWD 4         128.4    P2p Edge</pre>
<p>Root priority 24586 = 24576 + VLAN 10; ACC2 ka 32778 = 32768 + 10. <b>PortFast</b> edge port ko seedha forwarding mein jaane deta hai (PC ko DHCP ke liye 30-second wait nahi). <b>BPDU guard</b> edge port ko shut (err-disabled) kar deta hai agar wahan BPDU aaye, taaki desk port mein laga rogue switch tree ko disturb na kar sake. <b>Root guard</b> downstream switch ko root banne se rokta hai.</p>

<div class="eg"><p><b>Worked example.</b> Teen switches ki priority 32768 hai aur MACs ...0001, ...0002, ...0003 par khatam hote hain. Bina tuning ke, MAC ...0001 wala switch root banta hai, chahe woh closet ka purana access switch ho. Distribution switch ko priority 24576 dene se (priorities 4096 ke steps mein chalti hain) woh us VLAN ka root ban jaata hai, isliye tree sabse strong, sabse central switch ke around banta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Root election ko kismat par chhodna, jisse purana edge switch root ban jaata hai. (2) "Speed badhane" ke liye STP disable karna, phir jab koi loop patch kare to storm jhelna. (3) Switch-to-switch links par PortFast enable karna. (4) User ports par BPDU guard bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> STP <b>layer 2 loops rokne</b> (broadcast storms) ke liye hai. Sabse kam bridge ID root jeet-ta hai; default priority 32768. Classic STP convergence 30 se 50 seconds; RSTP kahin zyada tez. Blocked port bhi BPDUs receive karta hai. PortFast sirf end devices ke liye hai.</p></div>

<div class="scn"><h4>Meeting room ka loop</h4><p>Ek workshop ke dauraan kisi ne spare patch cable ke dono ends table ke neeche rakhe chhote unmanaged switch ke do ports mein laga diye, jo khud office switch se juda tha. Seconds mein poore floor ka network chala gaya aur switch CPU 99% par pahunch gaya. Logs mein <code>%SW_MATM-4-MACFLAP_NOTIF</code> messages the. Meeting room ke access port par PortFast tha lekin BPDU guard nahi, aur sasta switch STP nahi chalata tha. Engineer ne input counters se storm wala port dhoondha, use shut kiya, cable hataayi, aur phir saare user ports par <code>spanning-tree bpduguard enable</code> aur storm control enable kiya.</p><p><b>Seekh:</b> STP managed switches ko bachata hai, lekin aapke control ke bahar bane loops se edge protection (BPDU guard, storm control) hi bachata hai.</p></div>

<div class="iv"><p class="q">"Samjhao ki spanning tree kaise chunta hai ki kaunsa port block karna hai."</p><p>Strong answer: switches sabse kam bridge ID (pehle priority phir MAC) se root bridge elect karte hain. Har non-root switch ek root port chunta hai, root tak ka uska lowest-cost path. Har segment par, best path wala switch designated banta hai. Baaki ports block hote hain (RSTP mein alternate). Costs mention karo (1 Gb/s = 4), yeh ki aap priority se root jaan-boojhkar set karte ho, aur RSTP 802.1D se kahin tez converge karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet frames mein TTL nahi hota, isliye layer 2 loop broadcast storms aur MAC flapping paida karta hai.</li>
<li>STP root elect karta hai (sabse kam bridge ID), root aur designated ports chunta hai, aur baaki block karta hai.</li>
<li>Classic STP converge hone mein 30 se 50 seconds leta hai; RSTP (802.1w) lagbhag ek second.</li>
<li>Kam priority (4096 ke multiples) se root jaan-boojhkar set karo.</li>
<li>Edge ports par PortFast plus BPDU guard use karo, doosre switches ke links par kabhi nahi.</li>
</ul></div>
`}};export{e as default};