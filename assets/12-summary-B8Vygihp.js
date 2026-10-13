var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you do a quick walk around the car: tyres, lights, fuel, mirrors. It takes two minutes and catches the things that would ruin the trip. This chapter is that walk-around for vPC. Use it the night before an exam or an interview, and come back to it before your first real vPC change.</p>

<h3>Checklist: you should be able to...</h3>
<ul>
<li>Explain why two uplinks under STP give you one link's worth of bandwidth, and why active-backup teaming is the only safe "two NIC" mode toward two standalone switches.</li>
<li>Configure an LACP port-channel on NX-OS, choose between active, passive and on, and read <code>show port-channel summary</code> flags (P, s, I, D, M, SU).</li>
<li>Explain per-flow hashing and why one flow never exceeds one member's speed; set <code>port-channel load-balance</code>.</li>
<li>Name every vPC component: domain, peers, peer-link, peer-keepalive, vPC member port, orphan port, and the vPC system MAC.</li>
<li>Build a vPC domain in order: features, domain and role priority, keepalive, peer-link, member ports; and verify each step.</li>
<li>Read <code>show vpc brief</code>, <code>show vpc role</code>, <code>show vpc peer-keepalive</code>, <code>show vpc consistency-parameters</code> and <code>show vpc orphan-ports</code>.</li>
<li>Classify a mismatch as type-1 (global, per-VLAN, interface) or type-2 and predict what gets suspended with graceful consistency check.</li>
<li>Predict the outcome of every failure: member link, keepalive, peer-link, primary, both, and a lonely reload.</li>
<li>Justify peer-gateway, peer-switch, auto-recovery, delay restore, ip arp synchronize and layer3 peer-router.</li>
<li>Configure HSRP on NX-OS and explain active/active forwarding on a vPC.</li>
<li>Explain anycast VTEP on a vPC pair and compare vPC with EVPN multihoming.</li>
<li>Run the troubleshooting workflow on both peers and read a failure from two lines of output.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="vPC in one picture">
<rect x="60" y="15" width="200" height="56" rx="8" fill="#bae6fd"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="13">NX1 primary</text><text x="160" y="57" text-anchor="middle" class="svg-muted" font-size="12">HSRP Active</text>
<rect x="380" y="15" width="200" height="56" rx="8" fill="#bae6fd"/><text x="480" y="38" text-anchor="middle" class="svg-ink" font-size="13">NX2 secondary</text><text x="480" y="57" text-anchor="middle" class="svg-muted" font-size="12">HSRP Standby, still routes</text>
<line x1="260" y1="32" x2="380" y2="32" stroke="#64748b" stroke-width="5"/><text x="320" y="25" text-anchor="middle" class="svg-accent" font-size="12">peer-link: CFS + data</text>
<line x1="260" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">keepalive: heartbeat only</text>
<rect x="240" y="140" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">SRV1 bond0</text>
<line x1="160" y1="71" x2="290" y2="140" stroke="#64748b" stroke-width="3"/><line x1="480" y1="71" x2="350" y2="140" stroke="#64748b" stroke-width="3"/>
<text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="12">vPC 20: one LACP partner 00:23:04:ee:be:0a</text>
</svg><p class="cap">The whole module in one picture.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Port-channel</dt><dd>Several physical links bundled into one logical interface; load shared per flow by hash.</dd>
<dt>LACP</dt><dd>IEEE 802.3ad / 802.1AX protocol that negotiates bundles; modes active and passive.</dd>
<dt>MCEC / MC-LAG</dt><dd>A port-channel whose members end on two chassis; vPC is Cisco's Nexus implementation.</dd>
<dt>vPC domain</dt><dd>The pair of peers, identified by a domain ID that also sets the vPC system MAC.</dd>
<dt>Peer-link</dt><dd>Port-channel trunk between the peers carrying CFS synchronisation and data for flooded, orphan and failover traffic.</dd>
<dt>Peer-keepalive</dt><dd>UDP 3200 heartbeat on a separate path (usually mgmt0) that distinguishes a dead peer from a dead peer-link.</dd>
<dt>vPC member port</dt><dd>Port-channel with <code>vpc N</code>, same N on both peers.</dd>
<dt>Orphan port</dt><dd>Single-attached port in a vPC VLAN; isolated on the secondary when the peer-link fails.</dd>
<dt>CFS</dt><dd>Cisco Fabric Services, the protocol the peers use over the peer-link to sync state and compare configuration.</dd>
<dt>Graceful consistency check</dt><dd>Default behaviour where a type-1 mismatch suspends only the secondary's vPC ports.</dd>
<dt>Operational primary</dt><dd>The role a secondary takes over when the primary fails; roles do not preempt back.</dd>
<dt>Anycast VTEP</dt><dd>Shared secondary IP on the NVE loopback of both vPC peers in a VXLAN fabric.</dd>
<dt>ESI</dt><dd>Ethernet Segment Identifier, the key of standards-based EVPN multihoming.</dd>
</dl>

<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>LACP modes</td><td>active + active or active + passive form; passive + passive never forms; NX-OS has no PAgP</td></tr>
<tr><td>vPC system MAC</td><td>00:23:04:ee:be:&lt;domain in hex&gt;; domain 10 = 00:23:04:ee:be:0a</td></tr>
<tr><td>Role election</td><td>Lower role priority wins (default 32667); tie: lower system MAC; non-preemptive</td></tr>
<tr><td>Keepalive</td><td>UDP 3200, 1 s interval, 5 s timeout; default VRF management; never over the peer-link</td></tr>
<tr><td>Consistency</td><td>Type-1 suspends, type-2 warns; graceful check suspends only the secondary</td></tr>
<tr><td>Peer-link down, keepalive up</td><td>Secondary suspends vPC member ports and vPC-VLAN SVIs; orphans on secondary isolated</td></tr>
<tr><td>Primary dies</td><td>Secondary becomes "secondary, operational primary"</td></tr>
<tr><td>Both links down, both alive</td><td>Dual-active (split brain)</td></tr>
<tr><td>auto-recovery</td><td>Default reload delay 240 s</td></tr>
<tr><td>delay restore</td><td>Default 30 s for vPCs, 10 s for SVIs</td></tr>
<tr><td>peer-gateway vs peer-switch</td><td>Routing for the peer's router MAC vs one shared STP bridge ID</td></tr>
<tr><td>HSRP on vPC</td><td>Both Active and Standby route frames to the virtual MAC; v1 vMAC 0000.0c07.acXX</td></tr>
<tr><td>Loop avoidance</td><td>Frames from the peer-link never exit a vPC member port whose twin is up</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code">feature lacp
feature vpc
feature hsrp
vpc domain 10
  role priority 100
  peer-keepalive destination 10.0.0.2 source 10.0.0.1 vrf default
  peer-gateway
  peer-switch
  auto-recovery reload-delay 240
  delay restore 150
interface port-channel1
  switchport mode trunk
  vpc peer-link
interface port-channel20
  switchport access vlan 10
  vpc 20
interface ethernet1/3
  channel-group 20 mode active
interface ethernet1/5
  vpc orphan-port suspend
interface vlan10
  hsrp 10
    ip 10.10.10.1
    priority 110
    preempt</pre>
<pre class="out">show vpc brief                  show vpc role
show vpc peer-keepalive         show vpc orphan-ports
show vpc consistency-parameters global
show vpc consistency-parameters interface port-channel 20
show port-channel summary       show lacp neighbor
show hsrp brief                 show running-config vpc</pre>

<div class="eg"><p><b>Worked example: a two-line diagnosis.</b> You are shown only: <code>Peer status : peer link is down</code> and <code>vPC keep-alive status : peer is alive</code>, taken on the switch whose role is secondary. Conclusion in one breath: peer-link failure, keepalive healthy, this switch has suspended its vPC member ports and vPC-VLAN SVIs, dual-homed devices run on the primary, orphans on this switch are isolated. That is the level of speed an exam and an interviewer expect.</p></div>

<div class="warn"><p><b>Last-minute traps.</b> Keepalive does not carry MAC sync. The primary does not suspend when the peer-link fails. <code>desirable</code> is not an NX-OS LACP mode. <code>standby</code> is not an NX-OS HSRP command. The anycast VTEP is the secondary IP, not the primary.</p></div>

<div class="exam"><p><b>Exam strategy.</b> For every vPC scenario question, first identify three things: which switch is (operationally) primary, whether the keepalive is alive, and whether the peer-link is up. Almost every answer follows from those three facts.</p></div>

<div class="scn"><h4>The design review that passed first time</h4><p>A junior engineer presented a new rack design to a review board. For each question she answered from this checklist: keepalive over mgmt0 on the out-of-band network; peer-link of 2 × 100G on different ASICs; domain ID unique in the Layer 2 domain; peer-gateway, peer-switch with identical STP priority, auto-recovery and delay restore tuned to BGP convergence; HSRP Active aligned with vPC primary; every server dual-homed with LACP, and the two single-NIC appliances on the primary with a plan to replace them. The board approved it without changes.</p><p><b>Lesson:</b> a good vPC design is a checklist of answered failure questions.</p></div>

<div class="iv"><p class="q">"Give me a two-minute overview of vPC."</p><p>Strong answer: vPC lets two independent Nexus switches present one LACP system ID, so a downstream device bundles links to both and all links forward without STP blocking. The pair has a domain, a peer-link that carries CFS sync and failover data, and a separate keepalive that tells a dead peer from a dead peer-link. Consistency checks keep the peers identical (type-1 suspends, type-2 warns). On peer-link failure the secondary suspends its vPCs; on primary failure the secondary becomes operational primary. HSRP forwards active/active, and best practice adds peer-gateway, peer-switch, auto-recovery and delay restore. In VXLAN fabrics the pair shares an anycast VTEP, and EVPN multihoming is the standards-based alternative.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vPC = two control planes, one LACP identity, all links forwarding.</li>
<li>Peer-link carries sync and data; keepalive only answers "is my peer alive?".</li>
<li>Type-1 suspends (the secondary, with graceful check); type-2 warns.</li>
<li>Know every failure outcome, especially peer-link down with keepalive up.</li>
<li>Best practice: peer-gateway, peer-switch, auto-recovery, delay restore, HSRP on both peers, and no orphans on the secondary.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap car ke chaaron taraf ek chakkar lagate ho: tyres, lights, fuel, mirrors. Do minute lagte hain aur woh cheezein pakad leta hai jo trip barbaad kar deti. Yeh chapter vPC ke liye wahi chakkar hai. Ise exam ya interview se pehle ki raat use karo, aur apne pehle asli vPC change se pehle wapas aao.</p>

<h3>Checklist: aapko yeh kar paana chahiye...</h3>
<ul>
<li>Samjhana ki STP ke neeche do uplinks aapko ek link jitni bandwidth kyun dete hain, aur do standalone switches ki taraf active-backup teaming hi ek safe "do NIC" mode kyun hai.</li>
<li>NX-OS par LACP port-channel configure karna, active, passive aur on mein se chunna, aur <code>show port-channel summary</code> ke flags (P, s, I, D, M, SU) padhna.</li>
<li>Per-flow hashing samjhana aur ek flow kabhi ek member ki speed se aage kyun nahi jaata; <code>port-channel load-balance</code> set karna.</li>
<li>vPC ka har component naam se batana: domain, peers, peer-link, peer-keepalive, vPC member port, orphan port, aur vPC system MAC.</li>
<li>vPC domain kram mein banana: features, domain aur role priority, keepalive, peer-link, member ports; aur har step verify karna.</li>
<li><code>show vpc brief</code>, <code>show vpc role</code>, <code>show vpc peer-keepalive</code>, <code>show vpc consistency-parameters</code> aur <code>show vpc orphan-ports</code> padhna.</li>
<li>Mismatch ko type-1 (global, per-VLAN, interface) ya type-2 mein classify karna aur predict karna ki graceful consistency check ke saath kya suspend hoga.</li>
<li>Har failure ka result predict karna: member link, keepalive, peer-link, primary, dono, aur akela reload.</li>
<li>peer-gateway, peer-switch, auto-recovery, delay restore, ip arp synchronize aur layer3 peer-router ko justify karna.</li>
<li>NX-OS par HSRP configure karna aur vPC par active/active forwarding samjhana.</li>
<li>vPC pair par anycast VTEP samjhana aur vPC ko EVPN multihoming se compare karna.</li>
<li>Dono peers par troubleshooting workflow chalana aur output ki do lines se failure padhna.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek picture mein vPC">
<rect x="60" y="15" width="200" height="56" rx="8" fill="#bae6fd"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="13">NX1 primary</text><text x="160" y="57" text-anchor="middle" class="svg-muted" font-size="12">HSRP Active</text>
<rect x="380" y="15" width="200" height="56" rx="8" fill="#bae6fd"/><text x="480" y="38" text-anchor="middle" class="svg-ink" font-size="13">NX2 secondary</text><text x="480" y="57" text-anchor="middle" class="svg-muted" font-size="12">HSRP Standby, phir bhi route</text>
<line x1="260" y1="32" x2="380" y2="32" stroke="#64748b" stroke-width="5"/><text x="320" y="25" text-anchor="middle" class="svg-accent" font-size="12">peer-link: CFS + data</text>
<line x1="260" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">keepalive: sirf heartbeat</text>
<rect x="240" y="140" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">SRV1 bond0</text>
<line x1="160" y1="71" x2="290" y2="140" stroke="#64748b" stroke-width="3"/><line x1="480" y1="71" x2="350" y2="140" stroke="#64748b" stroke-width="3"/>
<text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="12">vPC 20: ek LACP partner 00:23:04:ee:be:0a</text>
</svg><p class="cap">Poora module ek picture mein.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Port-channel</dt><dd>Kai physical links ek logical interface mein bundled; load hash se per flow baanta jaata hai.</dd>
<dt>LACP</dt><dd>IEEE 802.3ad / 802.1AX protocol jo bundles negotiate karta hai; modes active aur passive.</dd>
<dt>MCEC / MC-LAG</dt><dd>Aisa port-channel jiske members do chassis par khatam hote hain; vPC Cisco ka Nexus implementation hai.</dd>
<dt>vPC domain</dt><dd>Peers ka pair, jise domain ID se pehchana jaata hai jo vPC system MAC bhi set karta hai.</dd>
<dt>Peer-link</dt><dd>Peers ke beech port-channel trunk jo CFS synchronisation aur flooded, orphan aur failover traffic ka data le jaata hai.</dd>
<dt>Peer-keepalive</dt><dd>Alag path (aam taur par mgmt0) par UDP 3200 heartbeat jo dead peer ko dead peer-link se alag pehchanta hai.</dd>
<dt>vPC member port</dt><dd><code>vpc N</code> wala port-channel, dono peers par same N.</dd>
<dt>Orphan port</dt><dd>vPC VLAN mein single-attached port; peer-link fail hone par secondary par akela pad jaata hai.</dd>
<dt>CFS</dt><dd>Cisco Fabric Services, woh protocol jise peers peer-link par state sync aur configuration compare karne ke liye use karte hain.</dd>
<dt>Graceful consistency check</dt><dd>Default behaviour jismein type-1 mismatch sirf secondary ke vPC ports suspend karta hai.</dd>
<dt>Operational primary</dt><dd>Woh role jo primary ke fail hone par secondary le leta hai; roles wapas preempt nahi hote.</dd>
<dt>Anycast VTEP</dt><dd>VXLAN fabric mein dono vPC peers ke NVE loopback par shared secondary IP.</dd>
<dt>ESI</dt><dd>Ethernet Segment Identifier, standards-based EVPN multihoming ki chaabi.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>LACP modes</td><td>active + active ya active + passive banta hai; passive + passive kabhi nahi; NX-OS mein PAgP nahi</td></tr>
<tr><td>vPC system MAC</td><td>00:23:04:ee:be:&lt;domain hex mein&gt;; domain 10 = 00:23:04:ee:be:0a</td></tr>
<tr><td>Role election</td><td>Kam role priority jeetti hai (default 32667); tie: kam system MAC; non-preemptive</td></tr>
<tr><td>Keepalive</td><td>UDP 3200, 1 s interval, 5 s timeout; default VRF management; kabhi peer-link ke upar nahi</td></tr>
<tr><td>Consistency</td><td>Type-1 suspend karta hai, type-2 warn; graceful check sirf secondary suspend karta hai</td></tr>
<tr><td>Peer-link down, keepalive up</td><td>Secondary vPC member ports aur vPC-VLAN SVIs suspend karta hai; secondary ke orphans akele</td></tr>
<tr><td>Primary mara</td><td>Secondary "secondary, operational primary" banta hai</td></tr>
<tr><td>Dono links down, dono zinda</td><td>Dual-active (split brain)</td></tr>
<tr><td>auto-recovery</td><td>Default reload delay 240 s</td></tr>
<tr><td>delay restore</td><td>vPCs ke liye default 30 s, SVIs ke liye 10 s</td></tr>
<tr><td>peer-gateway vs peer-switch</td><td>Peer ke router MAC ke liye routing vs ek shared STP bridge ID</td></tr>
<tr><td>vPC par HSRP</td><td>Active aur Standby dono virtual MAC ke frames route karte hain; v1 vMAC 0000.0c07.acXX</td></tr>
<tr><td>Loop avoidance</td><td>Peer-link se aaye frames kabhi us vPC member port se bahar nahi jaate jiska jodidaar up hai</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code">feature lacp
feature vpc
feature hsrp
vpc domain 10
  role priority 100
  peer-keepalive destination 10.0.0.2 source 10.0.0.1 vrf default
  peer-gateway
  peer-switch
  auto-recovery reload-delay 240
  delay restore 150
interface port-channel1
  switchport mode trunk
  vpc peer-link
interface port-channel20
  switchport access vlan 10
  vpc 20
interface ethernet1/3
  channel-group 20 mode active
interface ethernet1/5
  vpc orphan-port suspend
interface vlan10
  hsrp 10
    ip 10.10.10.1
    priority 110
    preempt</pre>
<pre class="out">show vpc brief                  show vpc role
show vpc peer-keepalive         show vpc orphan-ports
show vpc consistency-parameters global
show vpc consistency-parameters interface port-channel 20
show port-channel summary       show lacp neighbor
show hsrp brief                 show running-config vpc</pre>

<div class="eg"><p><b>Worked example: do line ka diagnosis.</b> Aapko sirf yeh dikhaya jaata hai: <code>Peer status : peer link is down</code> aur <code>vPC keep-alive status : peer is alive</code>, us switch se jiska role secondary hai. Ek saans mein conclusion: peer-link failure, keepalive healthy, is switch ne apne vPC member ports aur vPC-VLAN SVIs suspend kar diye, dual-homed devices primary par chalte hain, is switch ke orphans akele pad gaye. Exam aur interviewer isi speed ki umeed karte hain.</p></div>

<div class="warn"><p><b>Aakhri minute ke traps.</b> Keepalive MAC sync nahi le jaata. Peer-link fail hone par primary suspend nahi karta. <code>desirable</code> NX-OS LACP mode nahi hai. <code>standby</code> NX-OS HSRP command nahi hai. Anycast VTEP secondary IP hai, primary nahi.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Har vPC scenario question mein pehle teen cheezein pehchano: kaunsa switch (operationally) primary hai, keepalive alive hai ya nahi, aur peer-link up hai ya nahi. Lagbhag har jawab in teen facts se nikalta hai.</p></div>

<div class="scn"><h4>Design review jo pehli baar mein pass hua</h4><p>Ek junior engineer ne review board ke saamne naya rack design present kiya. Har sawaal ka jawab usne isi checklist se diya: out-of-band network par mgmt0 ke upar keepalive; alag ASICs par 2 × 100G ka peer-link; Layer 2 domain mein unique domain ID; peer-gateway, identical STP priority ke saath peer-switch, auto-recovery aur BGP convergence ke hisaab se tuned delay restore; vPC primary ke saath aligned HSRP Active; har server LACP ke saath dual-homed, aur do single-NIC appliances primary par, unhe badalne ke plan ke saath. Board ne bina kisi badlaav ke approve kar diya.</p><p><b>Seekh:</b> achha vPC design failure sawaalon ke jawabon ki checklist hai.</p></div>

<div class="iv"><p class="q">"Mujhe vPC ka do minute ka overview do."</p><p>Strong answer: vPC do independent Nexus switches se ek LACP system ID present karwata hai, isliye downstream device dono tak links bundle karta hai aur saare links bina STP blocking ke forward karte hain. Pair ka ek domain hota hai, ek peer-link jo CFS sync aur failover data le jaata hai, aur ek alag keepalive jo dead peer ko dead peer-link se alag karta hai. Consistency checks peers ko identical rakhte hain (type-1 suspend, type-2 warn). Peer-link failure par secondary apne vPCs suspend karta hai; primary failure par secondary operational primary banta hai. HSRP active/active forward karta hai, aur best practice mein peer-gateway, peer-switch, auto-recovery aur delay restore jodte hain. VXLAN fabrics mein pair anycast VTEP share karta hai, aur EVPN multihoming standards-based alternative hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vPC = do control planes, ek LACP identity, saare links forwarding.</li>
<li>Peer-link sync aur data le jaata hai; keepalive sirf "kya mera peer zinda hai?" ka jawab deta hai.</li>
<li>Type-1 suspend karta hai (graceful check ke saath secondary); type-2 warn karta hai.</li>
<li>Har failure ka result jaano, khaas kar keepalive up ke saath peer-link down.</li>
<li>Best practice: peer-gateway, peer-switch, auto-recovery, delay restore, dono peers par HSRP, aur secondary par koi orphans nahi.</li>
</ul></div>
`}};export{e as default};