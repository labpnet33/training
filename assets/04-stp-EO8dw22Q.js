var e={id:`stp`,h:{en:`Spanning tree: loops, RSTP, MST and why the fabric core avoids it`,hi:`Spanning tree: loops, RSTP, MST aur fabric core ise kyun avoid karta hai`},body:{en:`
<p>Imagine a town with a ring road and no traffic lights, where every car that reaches a junction is copied and sent down every other road. Within minutes the roads are jammed with copies of copies, and nobody gets anywhere. That is a <b>Layer-2 loop</b>. Ethernet frames have no TTL (time to live), so nothing ever stops a looping frame, and broadcasts are copied out of every port. <b>Spanning Tree Protocol (STP)</b> is the traffic police that closes just enough roads to turn the ring into a tree.</p>

<h3>What a loop does</h3>
<ul>
<li><b>Broadcast storm.</b> One ARP broadcast is flooded, comes back, is flooded again, and multiplies until links run at 100% and switch CPUs are overwhelmed.</li>
<li><b>MAC flapping.</b> The same source MAC arrives on two ports alternately, so the MAC table keeps rewriting itself and unicast goes the wrong way.</li>
<li><b>Duplicate frames.</b> Hosts receive the same frame several times, breaking applications.</li>
</ul>

<h3>How STP builds the tree</h3>
<p>Switches exchange <b>BPDUs</b> (bridge protocol data units) every 2 seconds. Each switch has a <b>bridge ID</b> = priority (default 32768, changed in steps of 4096) + the VLAN number (extended system ID) + its MAC address.</p>
<ol>
<li><b>Elect the root bridge</b>: lowest bridge ID wins. With default priorities that is the oldest (lowest) MAC, which is why you always set the root by hand.</li>
<li><b>Choose a root port</b> on every other switch: the port with the lowest total <b>path cost</b> to the root (ties: lowest sender bridge ID, then lowest port ID).</li>
<li><b>Choose a designated port</b> on every segment: the port closest to the root.</li>
<li><b>Block</b> everything else. In RSTP these ports are called <b>alternate</b> (a backup path to the root) or <b>backup</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="STP triangle">
<rect x="250" y="15" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">AGG1 root (4096)</text>
<rect x="60" y="165" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="190" text-anchor="middle" class="svg-ink" font-size="13">AGG2 (8192)</text>
<rect x="440" y="165" width="140" height="40" rx="8" fill="#bae6fd"/><text x="510" y="190" text-anchor="middle" class="svg-ink" font-size="13">ACCESS1</text>
<line x1="290" y1="55" x2="150" y2="165" stroke="#64748b" stroke-width="3"/><text x="160" y="110" class="svg-muted" font-size="12">Desg / Root</text>
<line x1="350" y1="55" x2="490" y2="165" stroke="#64748b" stroke-width="3"/><text x="430" y="110" class="svg-muted" font-size="12">Desg / Root</text>
<line x1="200" y1="185" x2="440" y2="185" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">ACCESS1 side: Altn BLK</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">One link per loop is blocked; it unblocks if another fails</text>
</svg><p class="cap">The root has only designated ports. The worst-cost port of the loop becomes alternate and discards.</p></div>

<h3>From 802.1D to RSTP and MST</h3>
<p>Classic STP (802.1D) took 30 to 50 seconds to converge (listening, learning, forwarding with timers). <b>RSTP</b> (802.1w) uses a proposal and agreement handshake on point-to-point links and pre-computed alternate ports, so it converges in about a second. Port states are just <b>discarding, learning, forwarding</b>. Cisco runs one RSTP instance per VLAN, called <b>Rapid-PVST+</b>; it is the <b>default on NX-OS</b>. <b>MST</b> (802.1s) maps many VLANs to a few instances (for example VLANs 1 to 2000 in instance 1, 2001 to 4000 in instance 2), which saves CPU when you have thousands of VLANs; all switches in an MST region must share the same name, revision and VLAN-to-instance map.</p>

<h3>Protecting the edge</h3>
<ul>
<li><b>Edge port</b> (PortFast): a port to a server goes straight to forwarding and does not cause topology changes. On NX-OS: <code>spanning-tree port type edge</code>, or <code>spanning-tree port type edge trunk</code> for a trunk to a hypervisor.</li>
<li><b>BPDU guard</b>: if a BPDU arrives on an edge port, the port is error-disabled. This stops a rogue switch or a bridging VM from creating a loop.</li>
<li><b>Root guard</b>: on ports where the root must never appear (towards access switches), a superior BPDU puts the port into root-inconsistent state instead of moving the root.</li>
</ul>

<pre class="code"><span class="c">! make this switch root for VLANs 10-20 (priority 4096)</span>
AGG1(config)# spanning-tree vlan 10-20 priority 4096
<span class="c">! server-facing trunk to an ESXi host</span>
LEAF1(config)# interface Ethernet1/5
LEAF1(config-if)# spanning-tree port type edge trunk
LEAF1(config-if)# spanning-tree bpduguard enable
<span class="c">! or protect every edge port at once</span>
LEAF1(config)# spanning-tree port type edge bpduguard default
<span class="c">! downlink where a root must never appear</span>
AGG1(config-if)# spanning-tree guard root</pre>
<pre class="out">LEAF1# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    4106
             Address     00de.fb12.3401
             Cost        2
             Port        1 (Ethernet1/1)
  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/1           Root FWD 2         128.1    P2p
<span class="hl">Eth1/2           Altn BLK 2         128.2    P2p</span>
Eth1/5           Desg FWD 2         128.5    Edge P2p</pre>

<div class="eg"><p><b>Worked example: reading the root priority.</b> The root shows priority <b>4106</b>. Subtract the VLAN number: 4106 minus 10 = 4096, so the root was configured with priority 4096. Our own bridge shows 32778 = 32768 + 10, the default. Eth1/1 is the root port (cost 2 to the root), and Eth1/2 is an alternate path that is discarding and will take over within about a second if Eth1/1 fails.</p></div>

<h3>Why the data center fabric core does not use STP</h3>
<p>STP keeps a network loop-free by <b>wasting links</b>: half the uplinks sit blocked. It also creates one big failure domain per VLAN; a single misbehaving device can storm the whole domain. Modern fabrics solve this in two ways. Between switches, links are <b>routed</b> (spine-leaf with OSPF or BGP and ECMP), and routing has a TTL, so loops die out and all links forward. Where Layer 2 is still needed to a server or a pair of switches, <b>vPC</b> or port-channels make two links look like one, so STP sees no loop to block. STP still runs on the leaf switches as a <b>safety net</b> at the edge, with edge ports and BPDU guard, but it no longer decides which fabric links carry traffic.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving root election to chance (the oldest switch becomes root). Forgetting edge configuration on server ports, so every server reboot triggers a topology change and MAC flushes. Enabling BPDU guard on a port facing another switch.</p></div>
<div class="exam"><p><b>Exam tip.</b> Lowest bridge ID wins root; priority in steps of 4096; bridge priority shown = configured + VLAN ID. RSTP roles: root, designated, alternate, backup; states: discarding, learning, forwarding. NX-OS default mode: Rapid-PVST+. Edge port command: <code>spanning-tree port type edge</code>.</p></div>

<div class="scn"><h4>The test lab switch that brought down VLAN 40</h4><p>A developer plugged a small switch into a server port "to connect two test machines" and cabled both of its ports back to the same leaf pair. The leaf ports were configured as plain access ports without edge or BPDU guard. A loop formed in VLAN 40, CPU on both leaves rose sharply and MAC flapping messages filled the log. The on-call engineer found the flapping ports with <code>show mac address-table</code>, shut them, and then applied <code>spanning-tree port type edge bpduguard default</code> across all leaves.</p><p><b>Lesson:</b> every server-facing port should be an edge port with BPDU guard; loops at the edge must fail closed.</p></div>

<div class="iv"><p class="q">"Why do data center fabrics try to remove spanning tree, and where does it still run?"</p><p>Strong answer: STP blocks redundant links (wasted bandwidth), converges slower than routing and creates big Layer-2 failure domains. Spine-leaf uses routed links with ECMP, and vPC or port-channels provide loop-free dual-homing. STP remains as a safety net on leaf edge ports with Rapid-PVST+, edge port type and BPDU guard. Mention root election and root guard to show depth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet has no TTL: loops cause broadcast storms and MAC flapping.</li>
<li>STP elects a root (lowest bridge ID), picks root and designated ports, blocks the rest.</li>
<li>RSTP converges in about a second; Rapid-PVST+ is NX-OS default; MST groups VLANs into instances.</li>
<li>Server ports: <code>spanning-tree port type edge</code> (or edge trunk) plus BPDU guard; use root guard on downlinks.</li>
<li>Fabrics route between switches and use vPC, so STP is only an edge safety net.</li>
</ul></div>
`,hi:`
<p>Ek shehar socho jisme ring road hai aur koi traffic light nahi, jahan har car jo junction tak pahunchti hai copy hokar har dusri road par bhej di jaati hai. Kuch minute mein roads copies ki copies se jam ho jaati hain, aur koi kahin nahi pahunchta. Yahi <b>Layer-2 loop</b> hai. Ethernet frames mein TTL (time to live) nahi hota, isliye looping frame ko kabhi kuch nahi rokta, aur broadcasts har port se copy hote hain. <b>Spanning Tree Protocol (STP)</b> woh traffic police hai jo bas itni roads band karti hai ki ring ek tree ban jaaye.</p>

<h3>Loop kya karta hai</h3>
<ul>
<li><b>Broadcast storm.</b> Ek ARP broadcast flood hota hai, wapas aata hai, phir flood hota hai, aur tab tak badhta hai jab tak links 100% par na chalein aur switch CPUs overwhelm na ho jaayein.</li>
<li><b>MAC flapping.</b> Same source MAC baari baari do ports par aata hai, isliye MAC table khud ko baar baar likhta rehta hai aur unicast galat taraf jaata hai.</li>
<li><b>Duplicate frames.</b> Hosts same frame kai baar receive karte hain, jisse applications toot-ti hain.</li>
</ul>

<h3>STP tree kaise banata hai</h3>
<p>Switches har 2 seconds mein <b>BPDUs</b> (bridge protocol data units) exchange karte hain. Har switch ka ek <b>bridge ID</b> hota hai = priority (default 32768, 4096 ke steps mein badalti hai) + VLAN number (extended system ID) + uska MAC address.</p>
<ol>
<li><b>Root bridge elect karo</b>: sabse kam bridge ID jeet-ta hai. Default priorities ke saath yeh sabse purana (sabse kam) MAC hota hai, isiliye aap root hamesha haath se set karte ho.</li>
<li>Har dusre switch par <b>root port chuno</b>: woh port jiska root tak total <b>path cost</b> sabse kam ho (tie: sabse kam sender bridge ID, phir sabse kam port ID).</li>
<li>Har segment par <b>designated port chuno</b>: root ke sabse paas wala port.</li>
<li>Baaki sab <b>block</b> karo. RSTP mein in ports ko <b>alternate</b> (root tak backup path) ya <b>backup</b> kehte hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="STP triangle">
<rect x="250" y="15" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">AGG1 root (4096)</text>
<rect x="60" y="165" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="190" text-anchor="middle" class="svg-ink" font-size="13">AGG2 (8192)</text>
<rect x="440" y="165" width="140" height="40" rx="8" fill="#bae6fd"/><text x="510" y="190" text-anchor="middle" class="svg-ink" font-size="13">ACCESS1</text>
<line x1="290" y1="55" x2="150" y2="165" stroke="#64748b" stroke-width="3"/><text x="160" y="110" class="svg-muted" font-size="12">Desg / Root</text>
<line x1="350" y1="55" x2="490" y2="165" stroke="#64748b" stroke-width="3"/><text x="430" y="110" class="svg-muted" font-size="12">Desg / Root</text>
<line x1="200" y1="185" x2="440" y2="185" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">ACCESS1 ki side: Altn BLK</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">Har loop mein ek link block; dusra fail ho to unblock</text>
</svg><p class="cap">Root ke paas sirf designated ports hote hain. Loop ka sabse zyada cost wala port alternate banta hai aur discard karta hai.</p></div>

<h3>802.1D se RSTP aur MST tak</h3>
<p>Classic STP (802.1D) ko converge hone mein 30 se 50 seconds lagte the (timers ke saath listening, learning, forwarding). <b>RSTP</b> (802.1w) point-to-point links par proposal aur agreement handshake aur pehle se calculate kiye alternate ports use karta hai, isliye yeh lagbhag ek second mein converge hota hai. Port states sirf <b>discarding, learning, forwarding</b> hain. Cisco har VLAN ke liye ek RSTP instance chalata hai, jise <b>Rapid-PVST+</b> kehte hain; yeh <b>NX-OS par default</b> hai. <b>MST</b> (802.1s) kai VLANs ko kuch instances par map karta hai (jaise VLANs 1 se 2000 instance 1 mein, 2001 se 4000 instance 2 mein), jisse hazaaron VLANs hone par CPU bachta hai; MST region ke saare switches ka same name, revision aur VLAN-to-instance map hona chahiye.</p>

<h3>Edge ko protect karna</h3>
<ul>
<li><b>Edge port</b> (PortFast): server wala port seedha forwarding mein jaata hai aur topology changes nahi karta. NX-OS par: <code>spanning-tree port type edge</code>, ya hypervisor ki taraf trunk ke liye <code>spanning-tree port type edge trunk</code>.</li>
<li><b>BPDU guard</b>: agar edge port par BPDU aaye, to port error-disabled ho jaata hai. Yeh rogue switch ya bridging VM ko loop banane se rokta hai.</li>
<li><b>Root guard</b>: un ports par jahan root kabhi nahi aana chahiye (access switches ki taraf), superior BPDU port ko root-inconsistent state mein daal deta hai, root ko move karne ki jagah.</li>
</ul>

<pre class="code"><span class="c">! is switch ko VLANs 10-20 ka root banao (priority 4096)</span>
AGG1(config)# spanning-tree vlan 10-20 priority 4096
<span class="c">! ESXi host ki taraf server-facing trunk</span>
LEAF1(config)# interface Ethernet1/5
LEAF1(config-if)# spanning-tree port type edge trunk
LEAF1(config-if)# spanning-tree bpduguard enable
<span class="c">! ya har edge port ko ek saath protect karo</span>
LEAF1(config)# spanning-tree port type edge bpduguard default
<span class="c">! downlink jahan root kabhi nahi aana chahiye</span>
AGG1(config-if)# spanning-tree guard root</pre>
<pre class="out">LEAF1# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    4106
             Address     00de.fb12.3401
             Cost        2
             Port        1 (Ethernet1/1)
  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/1           Root FWD 2         128.1    P2p
<span class="hl">Eth1/2           Altn BLK 2         128.2    P2p</span>
Eth1/5           Desg FWD 2         128.5    Edge P2p</pre>

<div class="eg"><p><b>Worked example: root priority padhna.</b> Root priority <b>4106</b> dikhata hai. VLAN number ghatao: 4106 minus 10 = 4096, to root 4096 priority ke saath configure kiya gaya tha. Hamara apna bridge 32778 = 32768 + 10 dikhata hai, yaani default. Eth1/1 root port hai (root tak cost 2), aur Eth1/2 ek alternate path hai jo discard kar raha hai aur Eth1/1 fail hone par lagbhag ek second mein kaam sambhal lega.</p></div>

<h3>Data center fabric core STP kyun use nahi karta</h3>
<p>STP network ko loop-free <b>links waste karke</b> rakhta hai: aadhe uplinks blocked baithe rehte hain. Yeh har VLAN ke liye ek bada failure domain bhi banata hai; ek bigda hua device poore domain mein storm la sakta hai. Modern fabrics ise do tareekon se solve karte hain. Switches ke beech links <b>routed</b> hote hain (OSPF ya BGP aur ECMP ke saath spine-leaf), aur routing mein TTL hota hai, isliye loops khatam ho jaate hain aur saare links forward karte hain. Jahan server ya switches ke pair tak Layer 2 abhi bhi chahiye, <b>vPC</b> ya port-channels do links ko ek jaisa dikhate hain, isliye STP ko block karne ke liye koi loop nahi dikhta. STP abhi bhi leaf switches par edge par <b>safety net</b> ki tarah chalta hai, edge ports aur BPDU guard ke saath, lekin ab yeh decide nahi karta ki kaunse fabric links traffic le jaayenge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Root election ko kismat par chhodna (sabse purana switch root ban jaata hai). Server ports par edge configuration bhoolna, jisse har server reboot topology change aur MAC flushes trigger karta hai. Dusre switch ki taraf wale port par BPDU guard enable karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Sabse kam bridge ID root jeet-ta hai; priority 4096 ke steps mein; dikhayi gayi bridge priority = configured + VLAN ID. RSTP roles: root, designated, alternate, backup; states: discarding, learning, forwarding. NX-OS default mode: Rapid-PVST+. Edge port command: <code>spanning-tree port type edge</code>.</p></div>

<div class="scn"><h4>Test lab switch jisne VLAN 40 gira diya</h4><p>Ek developer ne "do test machines jodne ke liye" server port mein ek chhota switch laga diya aur uske dono ports wapas same leaf pair se cable kar diye. Leaf ports bina edge ya BPDU guard ke plain access ports ki tarah configured the. VLAN 40 mein loop ban gaya, dono leaves ka CPU tezi se badha aur MAC flapping messages se log bhar gaya. On-call engineer ne <code>show mac address-table</code> se flapping ports dhoondhe, unhe shut kiya, aur phir saare leaves par <code>spanning-tree port type edge bpduguard default</code> apply kiya.</p><p><b>Seekh:</b> har server-facing port BPDU guard ke saath edge port hona chahiye; edge par loops ko fail closed hona chahiye.</p></div>

<div class="iv"><p class="q">"Data center fabrics spanning tree hatane ki koshish kyun karte hain, aur yeh abhi bhi kahan chalta hai?"</p><p>Strong answer: STP redundant links block karta hai (bandwidth waste), routing se dheere converge hota hai aur bade Layer-2 failure domains banata hai. Spine-leaf ECMP ke saath routed links use karta hai, aur vPC ya port-channels loop-free dual-homing dete hain. STP leaf edge ports par Rapid-PVST+, edge port type aur BPDU guard ke saath safety net ki tarah rehta hai. Depth dikhane ke liye root election aur root guard ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet mein TTL nahi hai: loops broadcast storms aur MAC flapping laate hain.</li>
<li>STP root elect karta hai (sabse kam bridge ID), root aur designated ports chunta hai, baaki block karta hai.</li>
<li>RSTP lagbhag ek second mein converge hota hai; Rapid-PVST+ NX-OS default hai; MST VLANs ko instances mein group karta hai.</li>
<li>Server ports: <code>spanning-tree port type edge</code> (ya edge trunk) plus BPDU guard; downlinks par root guard use karo.</li>
<li>Fabrics switches ke beech route karte hain aur vPC use karte hain, isliye STP sirf edge safety net hai.</li>
</ul></div>
`}};export{e as default};