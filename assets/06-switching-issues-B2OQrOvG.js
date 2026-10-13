var e={id:`switching-issues`,h:{en:`Switching faults: STP, VLANs and ACLs`,hi:`Switching faults: STP, VLANs aur ACLs`},body:{en:`
<p>Objective 5.3 moves up to network services, starting with switching. You configured VLANs and trunks in np-switching and ACLs in np-security; here you learn how they fail. Picture a city's road network. Spanning tree is the traffic authority that closes some roads so cars never drive in circles. VLANs are the colour-coded lanes that keep different groups apart. ACLs are the checkpoints that decide who may pass. When any of them is wrong, traffic loops, lands in the wrong lane, or is turned away.</p>

<h3>Spanning tree loops</h3>
<p>Switches are connected with redundant links for resilience, but Ethernet frames have no TTL. Without Spanning Tree Protocol (STP), a broadcast sent into a loop circles forever and multiplies. A <b>switching loop</b> shows these symptoms:</p>
<ul>
<li><b>Broadcast storm:</b> link utilisation jumps to 100%, every port LED flashes together, the whole VLAN (often the whole building) stops working.</li>
<li><b>MAC address flapping:</b> the switch learns the same MAC on two ports in turn. Logs look like <code>%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.0a01 in vlan 10 is flapping between port Gi1/0/1 and port Gi1/0/24</code>.</li>
<li><b>High CPU</b> on switches, dropped management sessions, duplicate frames at hosts.</li>
</ul>
<p>Common causes: STP disabled on a port or VLAN, a user connecting two wall ports with one cable, a small unmanaged switch that drops BPDUs, BPDU filtering in the wrong place, or a unidirectional fiber link. Quick relief: shut one of the looping ports (the flapping log tells you which). Prevention: keep STP on everywhere, use <b>BPDU Guard</b> on access ports and <b>Root Guard</b> on downlinks.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Triangle of switches with one blocked port">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">DIST1 (root)</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">all ports designated</text>
<rect x="60" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="130" y="157" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text>
<rect x="440" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="510" y="157" text-anchor="middle" class="svg-ink" font-size="13">ACC2</text>
<line x1="270" y1="54" x2="150" y2="130" stroke="#64748b"/><text x="200" y="88" text-anchor="end" class="svg-muted" font-size="12">root port</text>
<line x1="370" y1="54" x2="490" y2="130" stroke="#64748b"/><text x="440" y="88" class="svg-muted" font-size="12">root port</text>
<line x1="200" y1="152" x2="440" y2="152" stroke="#64748b" stroke-dasharray="5 4"/><text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">ACC2 side: alternate, blocking</text>
</svg><p class="cap">Three switches form a loop; STP blocks one port so frames cannot circle. Remove that block and you get a broadcast storm.</p></div>

<h3>Root bridge selection</h3>
<p>STP elects one <b>root bridge</b> per VLAN: the switch with the lowest <b>bridge ID</b>, which is the priority (default 32768 plus the VLAN number) followed by the MAC address. If nobody sets priorities, the lowest MAC wins, which is often the oldest or cheapest switch in a cupboard. All traffic then flows toward that switch, taking bad paths and overloading weak links.</p>
<pre class="out">DIST1# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    32778
             <span class="hl">Address     0011.2233.4401</span>
             Cost        23
             Port        24 (GigabitEthernet1/0/24)
  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     70d3.79be.4400
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- ----------
Gi1/0/1             Desg FWD 4         128.1    P2p
Gi1/0/2             <span class="hl">Altn BLK 4         128.2    P2p</span>
Gi1/0/24            Root FWD 19        128.24   P2p</pre>
<p>Here DIST1, the distribution switch, is not the root: the root is a switch with MAC 0011.2233.4401 reached over a 100 Mbps port (cost 19). The fix is to set the root deliberately: <code>spanning-tree vlan 10 root primary</code> (or <code>priority 24576</code>) on the core or distribution switch, <code>root secondary</code> on its partner.</p>

<h3>Port roles and states</h3>
<table class="cmp"><tr><th>Role</th><th>Meaning</th><th>State</th></tr>
<tr><td>Root port</td><td>This switch's best path to the root (one per non-root switch)</td><td>Forwarding</td></tr>
<tr><td>Designated port</td><td>The forwarding port for a segment (all ports on the root are designated)</td><td>Forwarding</td></tr>
<tr><td>Alternate port (RSTP)</td><td>A backup path to the root</td><td>Discarding (blocking)</td></tr>
<tr><td>Backup port (RSTP)</td><td>A backup port to the same segment</td><td>Discarding</td></tr>
<tr><td>Disabled</td><td>Administratively down</td><td>Disabled</td></tr>
</table>
<p>Classic 802.1D STP states are <b>blocking, listening, learning, forwarding</b> and disabled; a port takes about <b>30 seconds</b> (two 15-second forward-delay timers) to go from listening to forwarding. RSTP (802.1w) reduces the states to <b>discarding, learning, forwarding</b> and converges in about a second. A troubleshooting symptom: a PC plugged into a port without PortFast waits 30 seconds before it can send traffic, so its DHCP request times out and it shows a 169.254.x.x address. Fix: <code>spanning-tree portfast</code> on access ports.</p>

<h3>Incorrect VLAN assignment</h3>
<p>If a port is in the wrong VLAN, the device lands in the wrong subnet. With DHCP it gets an address from the wrong pool (and wrong access rights); with a static address it simply cannot reach its gateway. On trunks, a VLAN missing from the allowed list, or a native VLAN mismatch, cuts a whole VLAN off between switches.</p>
<div class="eg"><p><b>Worked example.</b> A new finance hire at desk 3-14 gets 10.0.20.57 instead of a 10.0.10.x finance address and cannot open the finance share.</p>
<pre class="out">SW1# show vlan brief
VLAN Name        Status    Ports
---- ----------- --------- ------------------------------
10   FINANCE     active    Gi1/0/1, Gi1/0/2, Gi1/0/3
20   GUEST       active    <span class="hl">Gi1/0/14</span>, Gi1/0/20
SW1# show interfaces Gi1/0/14 switchport | include Access Mode
<span class="hl">Access Mode VLAN: 20 (GUEST)</span></pre>
<p>The port was left in the guest VLAN from a visitor desk. Fix: <code>interface Gi1/0/14</code>, <code>switchport access vlan 10</code>; then the user renews the lease (<code>ipconfig /renew</code>) and gets 10.0.10.x.</p></div>

<h3>ACLs</h3>
<p>An access control list is read <b>top-down, first match wins</b>, and ends with an invisible <b>implicit deny</b>. The usual faults: a line in the wrong order (a broad deny above a specific permit), the ACL applied in the wrong <b>direction</b> (in versus out) or on the wrong interface, a wrong wildcard mask, and forgetting that the implicit deny also blocks return traffic or routing protocols. The troubleshooting tool is always the same: <code>show access-lists</code> and its <b>hit counters</b>, plus <code>show ip interface</code> to see which list is applied where. You met this in the INC-4410 ticket in chapter 2.</p>

<div class="warn"><p><b>Common mistakes.</b> Disabling STP "because it slows things down". Changing a VLAN on a port without checking whether a phone uses a voice VLAN on the same port. Adding a <code>deny</code> line at the end of an ACL that already has <code>permit ip any any</code> above it, so the new line never matches.</p></div>

<div class="exam"><p><b>Exam traps.</b> The root bridge has the lowest bridge ID (priority, then MAC), never the highest. Blocking/alternate ports still receive BPDUs. A device with the wrong address range after moving desks suggests incorrect VLAN assignment. Every ACL ends with an implicit deny.</p></div>

<div class="scn"><h4>The meeting room that took down the floor</h4><p>At 10:02 the whole third floor lost the network. Switch logs filled with MAC flapping messages between Gi1/0/31 and Gi1/0/32, both meeting-room wall ports. Someone had connected a small desktop switch to both ports to "get more sockets". That unmanaged switch forwarded frames but no STP protection existed on those ports. The engineer shut Gi1/0/32; the storm stopped at once. Prevention: BPDU Guard on every access port, so a port that receives a BPDU goes err-disabled instead of looping.</p><p><b>Lesson:</b> MAC flapping between two access ports means a loop through the user side. Shut one port first, investigate second.</p></div>

<div class="iv"><p class="q">"How would you recognise and stop a switching loop?"</p><p>Symptoms: broadcast storm, all LEDs flashing, very high utilisation and CPU, MAC flapping messages, a whole VLAN down. Use the flapping log or interface counters to find the ports, shut one to break the loop, then find the root cause (STP disabled, BPDU filter, user-side switch). Prevent it with STP everywhere, a deliberately placed root, BPDU Guard on access ports and Root Guard on downlinks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loops cause broadcast storms, MAC flapping and high CPU; shut one looping port, then fix the cause.</li>
<li>The root bridge is the lowest bridge ID; set it deliberately on core/distribution switches.</li>
<li>Roles: root, designated, alternate, backup; 802.1D states take about 30 s, RSTP about 1 s; use PortFast on access ports.</li>
<li>Wrong VLAN means wrong subnet: check <code>show vlan brief</code> and <code>show interfaces switchport</code>.</li>
<li>ACLs: top-down, first match, implicit deny; check direction, placement and hit counters.</li>
</ul></div>
`,hi:`
<p>Objective 5.3 network services par upar jaata hai, switching se shuru karke. Aapne np-switching mein VLANs aur trunks aur np-security mein ACLs configure kiye; yahan aap seekhoge ki woh fail kaise hote hain. Ek shahar ka road network socho. Spanning tree woh traffic authority hai jo kuch sadkein band karti hai taaki gaadiyan kabhi gol gol na ghoomein. VLANs rang-coded lanes hain jo alag groups ko alag rakhti hain. ACLs checkpoints hain jo decide karte hain kaun guzar sakta hai. Jab inmein se koi galat ho, traffic loop karta hai, galat lane mein pahunchta hai, ya wapas bhej diya jaata hai.</p>

<h3>Spanning tree loops</h3>
<p>Switches resilience ke liye redundant links se jude hote hain, lekin Ethernet frames mein TTL nahi hota. Spanning Tree Protocol (STP) ke bina, loop mein bheja gaya broadcast hamesha ghoomta hai aur badhta jaata hai. <b>Switching loop</b> yeh symptoms dikhata hai:</p>
<ul>
<li><b>Broadcast storm:</b> link utilisation 100% par, har port ki LED ek saath flash, poora VLAN (aksar poori building) kaam karna band.</li>
<li><b>MAC address flapping:</b> switch same MAC ko baari baari do ports par seekhta hai. Logs aise dikhte hain: <code>%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.0a01 in vlan 10 is flapping between port Gi1/0/1 and port Gi1/0/24</code>.</li>
<li>Switches par <b>high CPU</b>, management sessions drop, hosts par duplicate frames.</li>
</ul>
<p>Common causes: kisi port ya VLAN par STP disabled, user ka ek cable se do wall ports jodna, chhota unmanaged switch jo BPDUs drop karta hai, galat jagah BPDU filtering, ya unidirectional fiber link. Turant raahat: looping ports mein se ek shut karo (flapping log batata hai kaunsa). Prevention: har jagah STP on rakho, access ports par <b>BPDU Guard</b> aur downlinks par <b>Root Guard</b> use karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Teen switches ka triangle, ek blocked port">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">DIST1 (root)</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">saare ports designated</text>
<rect x="60" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="130" y="157" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text>
<rect x="440" y="130" width="140" height="44" rx="8" fill="#bae6fd"/><text x="510" y="157" text-anchor="middle" class="svg-ink" font-size="13">ACC2</text>
<line x1="270" y1="54" x2="150" y2="130" stroke="#64748b"/><text x="200" y="88" text-anchor="end" class="svg-muted" font-size="12">root port</text>
<line x1="370" y1="54" x2="490" y2="130" stroke="#64748b"/><text x="440" y="88" class="svg-muted" font-size="12">root port</text>
<line x1="200" y1="152" x2="440" y2="152" stroke="#64748b" stroke-dasharray="5 4"/><text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">ACC2 side: alternate, blocking</text>
</svg><p class="cap">Teen switches loop banate hain; STP ek port block karta hai taaki frames gol na ghoomein. Woh block hatao aur broadcast storm milta hai.</p></div>

<h3>Root bridge selection</h3>
<p>STP har VLAN ke liye ek <b>root bridge</b> elect karta hai: sabse chhote <b>bridge ID</b> wala switch, jo priority (default 32768 plus VLAN number) aur uske baad MAC address hota hai. Agar koi priorities set na kare, to sabse chhota MAC jeetta hai, jo aksar almari mein rakha sabse purana ya sasta switch hota hai. Phir saara traffic us switch ki taraf behta hai, bure paths leta hai aur kamzor links ko overload karta hai.</p>
<pre class="out">DIST1# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    32778
             <span class="hl">Address     0011.2233.4401</span>
             Cost        23
             Port        24 (GigabitEthernet1/0/24)
  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     70d3.79be.4400
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- ----------
Gi1/0/1             Desg FWD 4         128.1    P2p
Gi1/0/2             <span class="hl">Altn BLK 4         128.2    P2p</span>
Gi1/0/24            Root FWD 19        128.24   P2p</pre>
<p>Yahan DIST1, distribution switch, root nahi hai: root ek switch hai jiska MAC 0011.2233.4401 hai aur jo 100 Mbps port (cost 19) se reach hota hai. Fix hai root jaan-boojh kar set karna: core ya distribution switch par <code>spanning-tree vlan 10 root primary</code> (ya <code>priority 24576</code>), uske partner par <code>root secondary</code>.</p>

<h3>Port roles aur states</h3>
<table class="cmp"><tr><th>Role</th><th>Matlab</th><th>State</th></tr>
<tr><td>Root port</td><td>Is switch ka root tak best path (har non-root switch par ek)</td><td>Forwarding</td></tr>
<tr><td>Designated port</td><td>Ek segment ka forwarding port (root ke saare ports designated hote hain)</td><td>Forwarding</td></tr>
<tr><td>Alternate port (RSTP)</td><td>Root tak backup path</td><td>Discarding (blocking)</td></tr>
<tr><td>Backup port (RSTP)</td><td>Same segment ka backup port</td><td>Discarding</td></tr>
<tr><td>Disabled</td><td>Administratively down</td><td>Disabled</td></tr>
</table>
<p>Classic 802.1D STP states hain <b>blocking, listening, learning, forwarding</b> aur disabled; port ko listening se forwarding tak jaane mein lagbhag <b>30 second</b> lagte hain (do 15-second forward-delay timers). RSTP (802.1w) states ko <b>discarding, learning, forwarding</b> tak kam karta hai aur lagbhag ek second mein converge hota hai. Ek troubleshooting symptom: bina PortFast wale port mein laga PC traffic bhejne se pehle 30 second wait karta hai, isliye uski DHCP request time out hoti hai aur woh 169.254.x.x address dikhata hai. Fix: access ports par <code>spanning-tree portfast</code>.</p>

<h3>Galat VLAN assignment</h3>
<p>Agar port galat VLAN mein hai, to device galat subnet mein pahunchta hai. DHCP ke saath use galat pool se address milta hai (aur galat access rights); static address ke saath woh apne gateway tak pahunch hi nahi paata. Trunks par, allowed list se missing VLAN, ya native VLAN mismatch, switches ke beech poora VLAN kaat deta hai.</p>
<div class="eg"><p><b>Worked example.</b> Desk 3-14 par naye finance employee ko 10.0.10.x finance address ki jagah 10.0.20.57 milta hai aur woh finance share nahi khol paata.</p>
<pre class="out">SW1# show vlan brief
VLAN Name        Status    Ports
---- ----------- --------- ------------------------------
10   FINANCE     active    Gi1/0/1, Gi1/0/2, Gi1/0/3
20   GUEST       active    <span class="hl">Gi1/0/14</span>, Gi1/0/20
SW1# show interfaces Gi1/0/14 switchport | include Access Mode
<span class="hl">Access Mode VLAN: 20 (GUEST)</span></pre>
<p>Port visitor desk ke zamane se guest VLAN mein chhoda gaya tha. Fix: <code>interface Gi1/0/14</code>, <code>switchport access vlan 10</code>; phir user lease renew karta hai (<code>ipconfig /renew</code>) aur 10.0.10.x pata hai.</p></div>

<h3>ACLs</h3>
<p>Access control list <b>top-down, first match wins</b> padhi jaati hai, aur ek invisible <b>implicit deny</b> par khatam hoti hai. Usual faults: galat order mein line (specific permit ke upar broad deny), ACL galat <b>direction</b> (in vs out) mein ya galat interface par applied, galat wildcard mask, aur yeh bhoolna ki implicit deny return traffic ya routing protocols ko bhi block karta hai. Troubleshooting tool hamesha same hai: <code>show access-lists</code> aur uske <b>hit counters</b>, plus <code>show ip interface</code> yeh dekhne ke liye ki kaunsi list kahan applied hai. Aap yeh chapter 2 ke INC-4410 ticket mein dekh chuke ho.</p>

<div class="warn"><p><b>Common galtiyan.</b> STP ko disable karna "kyunki yeh cheezein slow karta hai". Port par VLAN badalna bina check kiye ki same port par phone voice VLAN use karta hai ya nahi. Aise ACL ke end mein <code>deny</code> line jodna jismein upar pehle se <code>permit ip any any</code> hai, jisse nayi line kabhi match nahi hoti.</p></div>

<div class="exam"><p><b>Exam traps.</b> Root bridge ka bridge ID sabse chhota hota hai (priority, phir MAC), kabhi sabse bada nahi. Blocking/alternate ports ab bhi BPDUs receive karte hain. Desk badalne ke baad galat address range wala device galat VLAN assignment suggest karta hai. Har ACL implicit deny par khatam hota hai.</p></div>

<div class="scn"><h4>Meeting room jisne poora floor gira diya</h4><p>10:02 baje poore third floor ka network chala gaya. Switch logs Gi1/0/31 aur Gi1/0/32 ke beech MAC flapping messages se bhar gaye, dono meeting-room wall ports. Kisi ne "zyada sockets" ke liye ek chhota desktop switch dono ports se jod diya tha. Woh unmanaged switch frames forward karta tha lekin un ports par koi STP protection nahi thi. Engineer ne Gi1/0/32 shut kiya; storm turant ruk gaya. Prevention: har access port par BPDU Guard, taaki BPDU receive karne wala port loop karne ki jagah err-disabled ho jaaye.</p><p><b>Seekh:</b> do access ports ke beech MAC flapping ka matlab user side se loop hai. Pehle ek port shut karo, investigate baad mein.</p></div>

<div class="iv"><p class="q">"Switching loop ko kaise pehchanoge aur rokoge?"</p><p>Symptoms: broadcast storm, saari LEDs flash, bahut high utilisation aur CPU, MAC flapping messages, poora VLAN down. Flapping log ya interface counters se ports dhoondo, loop todne ke liye ek shut karo, phir root cause dhoondo (STP disabled, BPDU filter, user-side switch). Har jagah STP, jaan-boojh kar rakha gaya root, access ports par BPDU Guard aur downlinks par Root Guard se ise roko.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loops broadcast storms, MAC flapping aur high CPU laate hain; ek looping port shut karo, phir cause theek karo.</li>
<li>Root bridge sabse chhota bridge ID hai; ise core/distribution switches par jaan-boojh kar set karo.</li>
<li>Roles: root, designated, alternate, backup; 802.1D states lagbhag 30 s lete hain, RSTP lagbhag 1 s; access ports par PortFast use karo.</li>
<li>Galat VLAN matlab galat subnet: <code>show vlan brief</code> aur <code>show interfaces switchport</code> check karo.</li>
<li>ACLs: top-down, first match, implicit deny; direction, placement aur hit counters check karo.</li>
</ul></div>
`}};export{e as default};