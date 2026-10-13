var e={id:`layer2-refresher`,h:{en:`Layer 2 refresher at CCNP depth`,hi:`CCNP depth par Layer 2 refresher`},body:{en:`
<p>Think of an apartment tower. Each <b>floor</b> is a VLAN: residents on the same floor can walk to each other's doors, but to reach another floor they must go through reception (a router). The <b>lift shaft</b> is a trunk: it carries people from every floor, each wearing a badge that says which floor they belong to. The <b>fire doors</b> are spanning tree: extra corridors exist for emergencies, but some doors stay closed so people do not walk in circles forever. CCNA taught you each of these. ENCOR expects you to tune them, protect them and troubleshoot them quickly.</p>

<h3>VLANs and 802.1Q, precisely</h3>
<p>A <b>VLAN</b> is a separate broadcast domain on shared switches. On a trunk, 802.1Q inserts a 4-byte tag after the source MAC: a TPID of <code>0x8100</code>, 3 bits of <b>PCP</b> (the CoS priority used by QoS), 1 DEI bit, and a 12-bit <b>VLAN ID</b> (1 to 4094 usable). VLANs 1 to 1005 are the normal range and 1006 to 4094 the extended range. The <b>native VLAN</b> is sent untagged; both ends must agree, or traffic leaks between VLANs and CDP reports a native VLAN mismatch.</p>

<h3>Trunk negotiation (DTP) and VTP</h3>
<table class="cmp"><tr><th>Local mode</th><th>Remote: trunk</th><th>Remote: desirable</th><th>Remote: auto</th><th>Remote: access</th></tr>
<tr><td>trunk</td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Mismatch</td></tr>
<tr><td>dynamic desirable</td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Access</td></tr>
<tr><td>dynamic auto</td><td>Trunk</td><td>Trunk</td><td><b>Access</b></td><td>Access</td></tr>
</table>
<p>Best practice: configure trunks statically (<code>switchport mode trunk</code>), disable DTP with <code>switchport nonegotiate</code>, prune the allowed VLAN list, and set an unused native VLAN. <b>VTP</b> can synchronise VLAN lists, but a switch with a higher configuration revision can wipe VLANs across the domain; most enterprises run VTP transparent or off, or VTP version 3 with a controlled primary server.</p>

<h3>Spanning tree variants</h3>
<table class="cmp"><tr><th>Variant</th><th>Standard</th><th>Instances</th><th>Notes</th></tr>
<tr><td>STP / CST</td><td>802.1D</td><td>One for all VLANs</td><td>Slow (30 to 50 s convergence)</td></tr>
<tr><td>PVST+</td><td>Cisco</td><td>One per VLAN</td><td>802.1D timers, per-VLAN load sharing</td></tr>
<tr><td>Rapid PVST+</td><td>802.1w per VLAN</td><td>One per VLAN</td><td>Sub-second to a few seconds; common choice on Catalyst</td></tr>
<tr><td>MST</td><td>802.1s</td><td>Few instances, many VLANs each</td><td>Scales to many VLANs; needs matching region name, revision and VLAN map</td></tr>
</table>
<p>The root bridge is the switch with the lowest <b>bridge ID</b>: priority (in steps of 4096) plus the VLAN number (the extended system ID) plus the MAC. So priority 24576 in VLAN 10 shows as 24586. Every other switch picks a <b>root port</b> (best cost to root), each segment gets a <b>designated port</b>, and the leftovers become <b>alternate</b> (or <b>backup</b>) ports in the discarding state. Short-mode costs: 10 Gbps = 2, 1 Gbps = 4, 100 Mbps = 19.</p>
<p>Protection features you must know cold: <b>PortFast</b> (edge ports go straight to forwarding), <b>BPDU guard</b> (err-disable an edge port that receives a BPDU), <b>root guard</b> (stop a downstream switch becoming root), <b>loop guard</b> (stop an alternate port going forwarding when BPDUs stop arriving, for example on a unidirectional link), and <b>BPDU filter</b> (stop sending and receiving BPDUs, dangerous if misused).</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="STP in the NK Corp distribution block">
<rect x="100" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="180" y="42" text-anchor="middle" class="svg-ink" font-size="14">DIST1</text><text x="180" y="60" text-anchor="middle" class="svg-muted" font-size="12">root, prio 24576</text>
<rect x="380" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="460" y="42" text-anchor="middle" class="svg-ink" font-size="14">DIST2</text><text x="460" y="60" text-anchor="middle" class="svg-muted" font-size="12">backup, prio 28672</text>
<line x1="260" y1="45" x2="380" y2="45" stroke="#64748b" stroke-width="5"/><text x="320" y="36" text-anchor="middle" class="svg-accent" font-size="12">Po1 LACP</text>
<rect x="240" y="180" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10, 20, 30, 99</text>
<line x1="290" y1="180" x2="180" y2="70" stroke="#64748b" stroke-width="3"/><text x="120" y="130" class="svg-accent" font-size="12">Te1/1/1 root FWD</text>
<line x1="350" y1="180" x2="460" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/><text x="430" y="130" class="svg-muted" font-size="12">Te1/1/2 alternate BLK</text>
<text x="320" y="270" text-anchor="middle" class="svg-muted" font-size="12">Access ports: PortFast + BPDU guard</text>
</svg><p class="cap">DIST1 is root for the user VLANs, so ACC1 forwards towards DIST1 and blocks towards DIST2 until DIST1 fails.</p></div>

<h3>EtherChannel</h3>
<p>EtherChannel bundles up to 8 active links into one logical port-channel, so STP sees one link and nothing blocks. <b>LACP</b> (802.3ad/802.1AX) uses <b>active</b> and <b>passive</b>; <b>PAgP</b> (Cisco) uses <b>desirable</b> and <b>auto</b>; <b>on</b> forces a bundle with no negotiation. Passive-passive and auto-auto never form. Members must match speed, duplex, switchport mode, allowed VLANs and native VLAN. Traffic is spread <b>per flow</b> by a hash (<code>port-channel load-balance src-dst-ip</code> is typical), so one flow never exceeds one member's speed.</p>

<pre class="code"><span class="c">! DIST1: LACP bundle to DIST2 and user-VLAN root priority</span>
DIST1(config)# interface range TenGigabitEthernet1/0/7 - 8
DIST1(config-if-range)# switchport mode trunk
DIST1(config-if-range)# switchport nonegotiate
DIST1(config-if-range)# channel-group 1 mode active
DIST1(config-if-range)# exit
DIST1(config)# spanning-tree mode rapid-pvst
DIST1(config)# spanning-tree vlan 10,20,30,99 priority 24576
<span class="c">! ACC1: edge ports</span>
ACC1(config)# interface range GigabitEthernet1/0/1 - 48
ACC1(config-if-range)# spanning-tree portfast
ACC1(config-if-range)# spanning-tree bpduguard enable</pre>
<pre class="out">ACC1# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     a0b1.c2d3.0001
             Cost        2
             <span class="hl">Port        49 (TenGigabitEthernet1/1/1)</span>
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- ----------------
Gi1/0/1             Desg FWD 4         128.1    P2p Edge
Te1/1/1             Root FWD 2         128.49   P2p
<span class="hl">Te1/1/2             Altn BLK 2         128.50   P2p</span>

DIST1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------
<span class="hl">1      Po1(SU)         LACP      Te1/0/7(P)      Te1/0/8(P)</span></pre>

<div class="eg"><p><b>Worked example.</b> DIST2 has priority 28672 and MAC a0b1.c2d3.0002; DIST1 has 24576 and a0b1.c2d3.0001. In VLAN 20 the bridge IDs are 28692 and 24596. DIST1 is lower, so it is root. If DIST1 reloads, DIST2 becomes root and ACC1's alternate port Te1/1/2 moves to root port within about a second with Rapid PVST+.</p></div>

<h3>What ENCOR adds on top of CCNA</h3>
<p>ENCOR asks you to configure and verify static and dynamic trunks, LACP and PAgP EtherChannels including load balancing, RSTP and MST (regions, instances, root and cost tuning), and the guard features. The Advanced switching module later in this track goes deep on each; here you only need the foundation to be solid.</p>

<div class="warn"><p><b>Common mistake.</b> Making the HSRP active gateway DIST2 while the STP root is DIST1. User traffic then goes ACC1 to DIST1 and across Po1 to DIST2 before being routed, wasting the inter-switch link. Align the STP root and the FHRP active router on the same switch per VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> dynamic auto on both ends gives an <b>access</b> port, not a trunk. LACP passive on both ends and PAgP auto on both ends never bundle. The bridge priority shown includes the VLAN ID (24576 + 10 = 24586), and configured priorities must be multiples of 4096.</p></div>

<div class="scn"><h4>The printer that became root</h4><p>Users on one floor saw two-second freezes every few minutes. <code>show spanning-tree vlan 10</code> on ACC2 showed a root bridge MAC nobody recognised, reached through an access port. A contractor had connected a cheap managed switch with priority 0 to feed a printer and a lab PC. Because the access ports lacked BPDU guard, the new switch became root and pulled the topology around. The fix: enable BPDU guard on all access ports, root guard on distribution downlinks, and set explicit root priorities on DIST1 and DIST2.</p><p><b>Lesson:</b> never leave root election to chance; lock it down with priorities and guard features.</p></div>

<div class="iv"><p class="q">"What is the difference between BPDU guard and root guard?"</p><p>Strong answer: BPDU guard goes on edge (PortFast) ports and err-disables the port if any BPDU arrives, because no switch should be there. Root guard goes on ports towards downstream switches; it allows normal BPDUs but puts the port into root-inconsistent (blocking) state if a superior BPDU arrives, so the root stays where you designed it. Add loop guard for unidirectional-link protection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1Q tag: TPID 0x8100, 3-bit PCP, 12-bit VLAN ID; native VLAN must match on both ends.</li>
<li>Static trunks with nonegotiate, pruned VLAN lists and an unused native VLAN; VTP transparent or v3.</li>
<li>Root = lowest bridge ID (priority + VLAN + MAC); Rapid PVST+ per VLAN, MST maps many VLANs to few instances.</li>
<li>PortFast + BPDU guard on edges, root guard towards downstream switches, loop guard against unidirectional links.</li>
<li>EtherChannel: LACP active/passive, PAgP desirable/auto, members must match; hashing is per flow.</li>
</ul></div>
`,hi:`
<p>Ek apartment tower socho. Har <b>floor</b> ek VLAN hai: same floor ke residents ek doosre ke darwaze tak chal kar jaa sakte hain, par doosre floor tak jaane ke liye unhe reception (router) se guzarna padta hai. <b>Lift shaft</b> trunk hai: yeh har floor ke logon ko le jaati hai, har ek ne badge pehna hai jo batata hai ki woh kis floor ka hai. <b>Fire doors</b> spanning tree hain: emergency ke liye extra corridors hote hain, par kuch darwaze band rehte hain taaki log hamesha gol gol na ghoomein. CCNA ne inme se har ek sikhaya. ENCOR expect karta hai ki aap inhe tune karo, protect karo aur jaldi troubleshoot karo.</p>

<h3>VLANs aur 802.1Q, bilkul sahi tarah</h3>
<p><b>VLAN</b> shared switches par ek alag broadcast domain hai. Trunk par, 802.1Q source MAC ke baad 4-byte tag daalta hai: <code>0x8100</code> ka TPID, <b>PCP</b> ke 3 bits (QoS mein use hone wali CoS priority), 1 DEI bit, aur 12-bit <b>VLAN ID</b> (1 se 4094 usable). VLANs 1 se 1005 normal range aur 1006 se 4094 extended range hain. <b>Native VLAN</b> untagged bheja jaata hai; dono ends ko agree karna chahiye, warna traffic VLANs ke beech leak hota hai aur CDP native VLAN mismatch report karta hai.</p>

<h3>Trunk negotiation (DTP) aur VTP</h3>
<table class="cmp"><tr><th>Local mode</th><th>Remote: trunk</th><th>Remote: desirable</th><th>Remote: auto</th><th>Remote: access</th></tr>
<tr><td>trunk</td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Mismatch</td></tr>
<tr><td>dynamic desirable</td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Access</td></tr>
<tr><td>dynamic auto</td><td>Trunk</td><td>Trunk</td><td><b>Access</b></td><td>Access</td></tr>
</table>
<p>Best practice: trunks ko statically configure karo (<code>switchport mode trunk</code>), <code>switchport nonegotiate</code> se DTP disable karo, allowed VLAN list prune karo, aur ek unused native VLAN set karo. <b>VTP</b> VLAN lists sync kar sakta hai, par zyada configuration revision wala switch poore domain ke VLANs mita sakta hai; zyada tar enterprises VTP transparent ya off chalate hain, ya controlled primary server ke saath VTP version 3.</p>

<h3>Spanning tree variants</h3>
<table class="cmp"><tr><th>Variant</th><th>Standard</th><th>Instances</th><th>Notes</th></tr>
<tr><td>STP / CST</td><td>802.1D</td><td>Saare VLANs ke liye ek</td><td>Slow (30 se 50 s convergence)</td></tr>
<tr><td>PVST+</td><td>Cisco</td><td>Har VLAN ke liye ek</td><td>802.1D timers, per-VLAN load sharing</td></tr>
<tr><td>Rapid PVST+</td><td>Har VLAN par 802.1w</td><td>Har VLAN ke liye ek</td><td>Sub-second se kuch seconds; Catalyst par common choice</td></tr>
<tr><td>MST</td><td>802.1s</td><td>Kam instances, har ek mein kai VLANs</td><td>Bahut VLANs tak scale karta hai; matching region name, revision aur VLAN map chahiye</td></tr>
</table>
<p>Root bridge woh switch hai jiska <b>bridge ID</b> sabse kam ho: priority (4096 ke steps mein) plus VLAN number (extended system ID) plus MAC. Isliye VLAN 10 mein priority 24576, 24586 dikhti hai. Baaki har switch ek <b>root port</b> chunta hai (root tak best cost), har segment ko ek <b>designated port</b> milta hai, aur bache hue <b>alternate</b> (ya <b>backup</b>) ports discarding state mein chale jaate hain. Short-mode costs: 10 Gbps = 2, 1 Gbps = 4, 100 Mbps = 19.</p>
<p>Protection features jo aapko pakke yaad hone chahiye: <b>PortFast</b> (edge ports seedhe forwarding mein jaate hain), <b>BPDU guard</b> (BPDU receive karne wale edge port ko err-disable karta hai), <b>root guard</b> (downstream switch ko root banne se rokta hai), <b>loop guard</b> (BPDUs aana band hone par alternate port ko forwarding mein jaane se rokta hai, jaise unidirectional link par), aur <b>BPDU filter</b> (BPDUs bhejna aur lena band karta hai, galat use par khatarnak).</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="STP in the NK Corp distribution block">
<rect x="100" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="180" y="42" text-anchor="middle" class="svg-ink" font-size="14">DIST1</text><text x="180" y="60" text-anchor="middle" class="svg-muted" font-size="12">root, prio 24576</text>
<rect x="380" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="460" y="42" text-anchor="middle" class="svg-ink" font-size="14">DIST2</text><text x="460" y="60" text-anchor="middle" class="svg-muted" font-size="12">backup, prio 28672</text>
<line x1="260" y1="45" x2="380" y2="45" stroke="#64748b" stroke-width="5"/><text x="320" y="36" text-anchor="middle" class="svg-accent" font-size="12">Po1 LACP</text>
<rect x="240" y="180" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10, 20, 30, 99</text>
<line x1="290" y1="180" x2="180" y2="70" stroke="#64748b" stroke-width="3"/><text x="120" y="130" class="svg-accent" font-size="12">Te1/1/1 root FWD</text>
<line x1="350" y1="180" x2="460" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/><text x="430" y="130" class="svg-muted" font-size="12">Te1/1/2 alternate BLK</text>
<text x="320" y="270" text-anchor="middle" class="svg-muted" font-size="12">Access ports: PortFast + BPDU guard</text>
</svg><p class="cap">DIST1 user VLANs ke liye root hai, isliye ACC1 DIST1 ki taraf forward karta hai aur DIST1 fail hone tak DIST2 ki taraf block karta hai.</p></div>

<h3>EtherChannel</h3>
<p>EtherChannel 8 tak active links ko ek logical port-channel mein bundle karta hai, isliye STP ko ek link dikhta hai aur kuch block nahi hota. <b>LACP</b> (802.3ad/802.1AX) <b>active</b> aur <b>passive</b> use karta hai; <b>PAgP</b> (Cisco) <b>desirable</b> aur <b>auto</b> use karta hai; <b>on</b> bina negotiation ke bundle force karta hai. Passive-passive aur auto-auto kabhi nahi bante. Members ki speed, duplex, switchport mode, allowed VLANs aur native VLAN match hone chahiye. Traffic ek hash se <b>per flow</b> baanta jaata hai (<code>port-channel load-balance src-dst-ip</code> typical hai), isliye ek flow kabhi ek member ki speed se aage nahi jaata.</p>

<pre class="code"><span class="c">! DIST1: DIST2 tak LACP bundle aur user-VLAN root priority</span>
DIST1(config)# interface range TenGigabitEthernet1/0/7 - 8
DIST1(config-if-range)# switchport mode trunk
DIST1(config-if-range)# switchport nonegotiate
DIST1(config-if-range)# channel-group 1 mode active
DIST1(config-if-range)# exit
DIST1(config)# spanning-tree mode rapid-pvst
DIST1(config)# spanning-tree vlan 10,20,30,99 priority 24576
<span class="c">! ACC1: edge ports</span>
ACC1(config)# interface range GigabitEthernet1/0/1 - 48
ACC1(config-if-range)# spanning-tree portfast
ACC1(config-if-range)# spanning-tree bpduguard enable</pre>
<pre class="out">ACC1# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     a0b1.c2d3.0001
             Cost        2
             <span class="hl">Port        49 (TenGigabitEthernet1/1/1)</span>
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- ----------------
Gi1/0/1             Desg FWD 4         128.1    P2p Edge
Te1/1/1             Root FWD 2         128.49   P2p
<span class="hl">Te1/1/2             Altn BLK 2         128.50   P2p</span>

DIST1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+----------------------------------
<span class="hl">1      Po1(SU)         LACP      Te1/0/7(P)      Te1/0/8(P)</span></pre>

<div class="eg"><p><b>Worked example.</b> DIST2 ki priority 28672 aur MAC a0b1.c2d3.0002 hai; DIST1 ki 24576 aur a0b1.c2d3.0001. VLAN 20 mein bridge IDs 28692 aur 24596 hain. DIST1 kam hai, isliye woh root hai. Agar DIST1 reload ho, to DIST2 root ban jaata hai aur Rapid PVST+ ke saath ACC1 ka alternate port Te1/1/2 lagbhag ek second mein root port ban jaata hai.</p></div>

<h3>CCNA ke upar ENCOR kya jodta hai</h3>
<p>ENCOR aapse static aur dynamic trunks, load balancing samet LACP aur PAgP EtherChannels, RSTP aur MST (regions, instances, root aur cost tuning), aur guard features configure aur verify karwata hai. Is track ka Advanced switching module baad mein har ek par deep jaata hai; yahan aapko sirf foundation solid chahiye.</p>

<div class="warn"><p><b>Common galti.</b> HSRP active gateway DIST2 ko banana jabki STP root DIST1 hai. Tab user traffic ACC1 se DIST1 aur Po1 ke across DIST2 tak jaata hai aur phir route hota hai, inter-switch link waste hota hai. Har VLAN ke liye STP root aur FHRP active router ko same switch par align karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Dono ends par dynamic auto se <b>access</b> port banta hai, trunk nahi. Dono ends par LACP passive aur dono ends par PAgP auto kabhi bundle nahi karte. Dikhne wali bridge priority mein VLAN ID shaamil hai (24576 + 10 = 24586), aur configured priorities 4096 ke multiples honi chahiye.</p></div>

<div class="scn"><h4>Printer jo root ban gaya</h4><p>Ek floor ke users ko har kuch minute mein do second ke freezes dikhte the. ACC2 par <code>show spanning-tree vlan 10</code> ne ek aisa root bridge MAC dikhaya jise koi nahi pehchanta tha, jo ek access port se reach ho raha tha. Ek contractor ne printer aur lab PC chalane ke liye priority 0 wala sasta managed switch jod diya tha. Access ports par BPDU guard nahi tha, isliye naya switch root ban gaya aur topology ko apni taraf kheench liya. Fix: saare access ports par BPDU guard, distribution downlinks par root guard, aur DIST1 aur DIST2 par explicit root priorities.</p><p><b>Seekh:</b> root election ko kabhi kismat par mat chhodo; priorities aur guard features se lock karo.</p></div>

<div class="iv"><p class="q">"BPDU guard aur root guard mein kya fark hai?"</p><p>Strong answer: BPDU guard edge (PortFast) ports par lagta hai aur koi bhi BPDU aane par port err-disable karta hai, kyunki wahan koi switch nahi hona chahiye. Root guard downstream switches ki taraf ke ports par lagta hai; yeh normal BPDUs allow karta hai par superior BPDU aane par port ko root-inconsistent (blocking) state mein daal deta hai, taaki root wahin rahe jahan aapne design kiya. Unidirectional-link protection ke liye loop guard jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1Q tag: TPID 0x8100, 3-bit PCP, 12-bit VLAN ID; native VLAN dono ends par match hona chahiye.</li>
<li>Nonegotiate ke saath static trunks, pruned VLAN lists aur unused native VLAN; VTP transparent ya v3.</li>
<li>Root = sabse kam bridge ID (priority + VLAN + MAC); Rapid PVST+ har VLAN par, MST kai VLANs ko kam instances mein map karta hai.</li>
<li>Edges par PortFast + BPDU guard, downstream switches ki taraf root guard, unidirectional links ke khilaaf loop guard.</li>
<li>EtherChannel: LACP active/passive, PAgP desirable/auto, members match hone chahiye; hashing per flow hai.</li>
</ul></div>
`}};export{e as default};