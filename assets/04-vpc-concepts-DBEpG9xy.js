var e={id:`vpc-concepts`,h:{en:`The vPC idea: one port-channel, two switches`,hi:`vPC ka idea: ek port-channel, do switches`},body:{en:`
<p>Imagine two bank branches on the same street that decide to share customers. A customer can walk into either branch and the account looks identical, because the two managers phone each other constantly (a dedicated hotline) and also wave at each other through the window every second, just to be sure the other one is still there. Each branch still has its own staff and its own manager. That is <b>vPC</b>: two independent switches that cooperate so closely that a server sees them as one.</p>

<h3>The problem vPC solves</h3>
<p>In chapter 3 you learned that all members of a port-channel must see the <b>same LACP partner system ID</b>. A normal port-channel therefore ends on <b>one</b> switch, which is again a single point of failure. To land the two links of a bundle on two switches, both switches must send LACPDUs with the <b>same system ID</b>. This general idea is called <b>MCEC</b> (multi-chassis EtherChannel) or <b>MC-LAG</b>. Vendors implement it in different ways:</p>
<ul>
<li><b>Stacking and VSS</b>: two chassis merge into one logical device with one control plane and one configuration. Simple, but a software bug or upgrade affects both.</li>
<li><b>vPC (virtual port-channel)</b>, Cisco Nexus: two switches keep <b>separate control planes</b>, separate configurations and separate software upgrades, but cooperate for the shared port-channels. One switch can reload while the other keeps forwarding.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="vPC components">
<rect x="70" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="14">NX1</text><text x="160" y="60" text-anchor="middle" class="svg-muted" font-size="12">primary, prio 100</text>
<rect x="390" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="14">NX2</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">secondary, prio 200</text>
<line x1="250" y1="34" x2="390" y2="34" stroke="#64748b" stroke-width="5"/><text x="320" y="27" text-anchor="middle" class="svg-accent" font-size="12">peer-link Po1</text>
<line x1="250" y1="60" x2="390" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">peer-keepalive Eth1/8</text>
<rect x="120" y="200" width="160" height="48" rx="8" fill="#bbf7d0"/><text x="200" y="222" text-anchor="middle" class="svg-ink" font-size="13">SRV1 (bond0)</text><text x="200" y="239" text-anchor="middle" class="svg-muted" font-size="12">dual-homed</text>
<line x1="150" y1="70" x2="180" y2="200" stroke="#64748b" stroke-width="3"/><line x1="470" y1="70" x2="230" y2="200" stroke="#64748b" stroke-width="3"/>
<text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">vPC 20 (Po20 on both)</text>
<rect x="430" y="200" width="160" height="48" rx="8" fill="#fde68a"/><text x="510" y="222" text-anchor="middle" class="svg-ink" font-size="13">SRV2</text><text x="510" y="239" text-anchor="middle" class="svg-muted" font-size="12">single NIC</text>
<line x1="500" y1="70" x2="510" y2="200" stroke="#64748b" stroke-width="2"/><text x="520" y="140" class="svg-muted" font-size="12">orphan port</text>
<text x="320" y="280" text-anchor="middle" class="svg-ink" font-size="12">vPC domain 10, system MAC 00:23:04:ee:be:0a</text>
</svg><p class="cap">Every vPC component in the lab topology: two peers, a peer-link, a keepalive, one vPC and one orphan port.</p></div>

<h3>The components, one by one</h3>
<dl class="terms">
<dt>vPC domain</dt><dd>The pair of switches, identified by a <b>domain ID</b> (1 to 1000) that must be the same on both peers and unique among vPC pairs in the same Layer 2 network. Configured with <code>vpc domain 10</code>.</dd>
<dt>vPC peers</dt><dd>The two switches in the domain. Exactly two; vPC never has three members.</dd>
<dt>vPC system MAC</dt><dd>A MAC derived from the domain ID, <code>00:23:04:ee:be:&lt;domain in hex&gt;</code>. Both peers use it as their LACP system ID on vPC ports, so downstream devices see one partner. Domain 10 gives <code>00:23:04:ee:be:0a</code>.</dd>
<dt>Peer-link</dt><dd>A port-channel between the peers, normally at least two 10G or faster links on different line cards or ASICs, configured as a trunk with <code>vpc peer-link</code>. It carries <b>CFS</b> (Cisco Fabric Services) messages that synchronise MAC addresses, ARP, IGMP snooping state and configuration checks, plus data traffic for flooded frames, orphan ports and failure cases.</dd>
<dt>Peer-keepalive</dt><dd>A small Layer 3 heartbeat between the peers (UDP port 3200, every second by default), usually over the <b>mgmt0</b> port in the management VRF, or a dedicated routed link. It never carries data. Its only job is to answer one question when the peer-link fails: "is my peer dead, or only the link between us?"</dd>
<dt>vPC member port</dt><dd>A port-channel toward a downstream device with <code>vpc N</code>; the same N on both peers ties the two halves together. In the lab, port-channel20 with <code>vpc 20</code>.</dd>
<dt>Orphan port</dt><dd>A port in a vPC VLAN that is <b>not</b> part of a vPC, for example a server with one NIC, or a server in active-backup mode connected to only one peer at a time. Orphan ports are the weak spot of vPC designs, as you will see in chapter 7.</dd>
</dl>

<h3>Roles: primary and secondary</h3>
<p>The two peers are equal for forwarding, but one is elected <b>primary</b> and the other <b>secondary</b>. The role matters only for control decisions: who keeps forwarding if the peer-link fails, who suspends on a type-1 mismatch, and which switch answers STP. The rules:</p>
<ul>
<li>Lower <code>role priority</code> (1 to 65535, default 32667) wins primary.</li>
<li>If priorities are equal, the lower system MAC wins.</li>
<li>The election is <b>non-preemptive</b>. If the primary reloads, the secondary takes over as <b>operational primary</b>, and it keeps that role when the old primary returns. <code>show vpc role</code> then shows combined roles such as <code>secondary, operational primary</code>.</li>
</ul>
<pre class="out">NX1# show vpc role
vPC Role status
----------------------------------------------------
<span class="hl">vPC role                        : primary</span>
Dual Active Detection Status    : 0
<span class="hl">vPC system-mac                  : 00:23:04:ee:be:0a</span>
vPC system-priority             : 32667
vPC local system-mac            : 52:54:00:12:34:01
vPC local role-priority         : 100
vPC local config role-priority  : 100
vPC peer system-mac             : 52:54:00:12:34:02
vPC peer role-priority          : 200
vPC peer config role-priority   : 200</pre>

<div class="eg"><p><b>Worked example.</b> Domain 25: 25 in hex is 0x19, so the system MAC is <code>00:23:04:ee:be:19</code>. NX1 has role priority 32667 (default), NX2 has 32667 too. NX1's local MAC is 5254.0012.3401 and NX2's is 5254.0012.3402. Equal priority, so the lower MAC wins: NX1 is primary. If you want NX2 to be primary, set <code>role priority 100</code> on NX2 before the pair first forms; changing it later does not move the role because the election is non-preemptive.</p></div>

<h3>The loop-avoidance rule (preview)</h3>
<p>vPC does not block ports with STP. Instead it uses a hardware rule: <b>a frame that arrived over the peer-link is not sent out of a vPC member port if the twin member port on the other peer is up</b>. The other peer already delivered it locally. This rule, together with MAC synchronisation, is why traffic should normally stay on the local switch and not cross the peer-link. Chapter 7 shows what happens when a member port fails.</p>

<div class="warn"><p><b>Common mistake.</b> Treating the peer-link as a normal data path. It is sized for control, flooding and failure cases. If most of your traffic crosses it, something is wrong: typically many orphan ports on one side, or gateways that only exist on one peer.</p></div>

<div class="exam"><p><b>Exam trap.</b> The keepalive carries no data and no MAC sync; the peer-link carries CFS and data. Questions often swap them. Also, <code>00:00:0c:07:ac:0a</code> is the HSRP version 1 virtual MAC for group 10, not a vPC system MAC.</p></div>

<div class="scn"><h4>Two pairs, one domain ID</h4><p>A company had two vPC pairs in the same Layer 2 domain: leaves 1 and 2, and leaves 3 and 4, both built from the same template with <code>vpc domain 10</code>. An access switch was double-connected with one port-channel to each pair. LACP on the access switch saw the same system MAC 00:23:04:ee:be:0a from both pairs and tried to bundle all four links into one aggregate, which suspended members and caused intermittent loss. The fix was to renumber the second pair to domain 20 in a maintenance window.</p><p><b>Lesson:</b> the domain ID defines the LACP identity of the pair; it must be unique in the Layer 2 network.</p></div>

<div class="iv"><p class="q">"What is the difference between the vPC peer-link and the peer-keepalive?"</p><p>Strong answer: the peer-link is a high-bandwidth port-channel trunk that carries CFS synchronisation (MAC, ARP, IGMP, consistency checks) and data for flooded, orphan and failover traffic. The keepalive is a lightweight Layer 3 heartbeat over a separate path, usually mgmt0, carrying no data; it lets the pair tell a dead peer apart from a dead peer-link and so avoid dual-active. Add that they must never share fate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vPC makes two independent Nexus switches present one LACP system ID, the vPC system MAC 00:23:04:ee:be:&lt;domain hex&gt;.</li>
<li>Components: domain, two peers, peer-link, peer-keepalive, vPC member ports, orphan ports.</li>
<li>Peer-link = CFS sync plus data; keepalive = UDP 3200 heartbeat on a separate path, no data.</li>
<li>Lower role priority wins primary; tie goes to the lower system MAC; roles are non-preemptive.</li>
<li>Frames from the peer-link do not leave a vPC member port whose twin is up; that is how vPC avoids loops without blocking.</li>
</ul></div>
`,hi:`
<p>Ek hi street par do bank branches socho jo customers share karne ka faisla karti hain. Customer kisi bhi branch mein jaa sakta hai aur account bilkul same dikhta hai, kyunki dono managers lagatar ek doosre ko phone karte hain (ek dedicated hotline) aur har second khidki se haath bhi hilaate hain, bas yeh pakka karne ke liye ki doosra abhi bhi wahan hai. Har branch ka apna staff aur apna manager hai. Yahi <b>vPC</b> hai: do independent switches jo itne kareeb se cooperate karte hain ki server unhe ek dekhta hai.</p>

<h3>vPC kaunsi problem solve karta hai</h3>
<p>Chapter 3 mein aapne seekha ki port-channel ke saare members ko <b>same LACP partner system ID</b> dikhna chahiye. Isliye normal port-channel <b>ek</b> switch par khatam hota hai, jo phir se single point of failure hai. Bundle ke do links ko do switches par utaarne ke liye dono switches ko <b>same system ID</b> ke saath LACPDUs bhejne honge. Is general idea ko <b>MCEC</b> (multi-chassis EtherChannel) ya <b>MC-LAG</b> kehte hain. Vendors ise alag tarike se banate hain:</p>
<ul>
<li><b>Stacking aur VSS</b>: do chassis ek logical device mein mil jaate hain, ek control plane aur ek configuration ke saath. Simple, par ek software bug ya upgrade dono par asar karta hai.</li>
<li><b>vPC (virtual port-channel)</b>, Cisco Nexus: do switches <b>alag control planes</b>, alag configurations aur alag software upgrades rakhte hain, par shared port-channels ke liye cooperate karte hain. Ek switch reload ho sakta hai jabki doosra forward karta rehta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="vPC components">
<rect x="70" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="14">NX1</text><text x="160" y="60" text-anchor="middle" class="svg-muted" font-size="12">primary, prio 100</text>
<rect x="390" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="14">NX2</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">secondary, prio 200</text>
<line x1="250" y1="34" x2="390" y2="34" stroke="#64748b" stroke-width="5"/><text x="320" y="27" text-anchor="middle" class="svg-accent" font-size="12">peer-link Po1</text>
<line x1="250" y1="60" x2="390" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">peer-keepalive Eth1/8</text>
<rect x="120" y="200" width="160" height="48" rx="8" fill="#bbf7d0"/><text x="200" y="222" text-anchor="middle" class="svg-ink" font-size="13">SRV1 (bond0)</text><text x="200" y="239" text-anchor="middle" class="svg-muted" font-size="12">dual-homed</text>
<line x1="150" y1="70" x2="180" y2="200" stroke="#64748b" stroke-width="3"/><line x1="470" y1="70" x2="230" y2="200" stroke="#64748b" stroke-width="3"/>
<text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">vPC 20 (dono par Po20)</text>
<rect x="430" y="200" width="160" height="48" rx="8" fill="#fde68a"/><text x="510" y="222" text-anchor="middle" class="svg-ink" font-size="13">SRV2</text><text x="510" y="239" text-anchor="middle" class="svg-muted" font-size="12">ek NIC</text>
<line x1="500" y1="70" x2="510" y2="200" stroke="#64748b" stroke-width="2"/><text x="520" y="140" class="svg-muted" font-size="12">orphan port</text>
<text x="320" y="280" text-anchor="middle" class="svg-ink" font-size="12">vPC domain 10, system MAC 00:23:04:ee:be:0a</text>
</svg><p class="cap">Lab topology mein vPC ka har component: do peers, ek peer-link, ek keepalive, ek vPC aur ek orphan port.</p></div>

<h3>Components, ek ek karke</h3>
<dl class="terms">
<dt>vPC domain</dt><dd>Switches ka pair, jise <b>domain ID</b> (1 se 1000) se pehchana jaata hai jo dono peers par same aur same Layer 2 network ke vPC pairs mein unique hona chahiye. <code>vpc domain 10</code> se configure hota hai.</dd>
<dt>vPC peers</dt><dd>Domain ke do switches. Bilkul do; vPC mein kabhi teen members nahi hote.</dd>
<dt>vPC system MAC</dt><dd>Domain ID se bana MAC, <code>00:23:04:ee:be:&lt;domain hex mein&gt;</code>. Dono peers vPC ports par ise apne LACP system ID ki tarah use karte hain, isliye downstream devices ko ek partner dikhta hai. Domain 10 se <code>00:23:04:ee:be:0a</code> banta hai.</dd>
<dt>Peer-link</dt><dd>Peers ke beech port-channel, normally alag line cards ya ASICs par kam se kam do 10G ya tez links, trunk ki tarah <code>vpc peer-link</code> ke saath configure. Yeh <b>CFS</b> (Cisco Fabric Services) messages le jaata hai jo MAC addresses, ARP, IGMP snooping state aur configuration checks sync karte hain, plus flooded frames, orphan ports aur failure cases ka data traffic.</dd>
<dt>Peer-keepalive</dt><dd>Peers ke beech chhoti Layer 3 heartbeat (UDP port 3200, default mein har second), aam taur par management VRF mein <b>mgmt0</b> port par, ya dedicated routed link par. Yeh kabhi data nahi le jaata. Iska ek hi kaam hai, peer-link fail hone par ek sawaal ka jawab dena: "kya mera peer mar gaya, ya sirf hamare beech ka link?"</dd>
<dt>vPC member port</dt><dd>Downstream device ki taraf <code>vpc N</code> wala port-channel; dono peers par same N dono hisson ko jodta hai. Lab mein, <code>vpc 20</code> ke saath port-channel20.</dd>
<dt>Orphan port</dt><dd>vPC VLAN ka woh port jo vPC ka hissa <b>nahi</b> hai, jaise ek NIC wala server, ya active-backup mode wala server jo ek samay mein sirf ek peer se juda ho. Orphan ports vPC designs ki kamzor kadi hain, jaisa aap chapter 7 mein dekhoge.</dd>
</dl>

<h3>Roles: primary aur secondary</h3>
<p>Forwarding ke liye dono peers barabar hain, par ek <b>primary</b> aur doosra <b>secondary</b> elect hota hai. Role sirf control decisions ke liye matter karta hai: peer-link fail ho to kaun forward karta rahe, type-1 mismatch par kaun suspend kare, aur STP ka jawab kaunsa switch de. Rules:</p>
<ul>
<li>Kam <code>role priority</code> (1 se 65535, default 32667) primary jeetta hai.</li>
<li>Priorities barabar hon to kam system MAC jeetta hai.</li>
<li>Election <b>non-preemptive</b> hai. Agar primary reload ho, to secondary <b>operational primary</b> ban jaata hai, aur purane primary ke wapas aane par bhi woh role rakhta hai. Tab <code>show vpc role</code> <code>secondary, operational primary</code> jaise combined roles dikhata hai.</li>
</ul>
<pre class="out">NX1# show vpc role
vPC Role status
----------------------------------------------------
<span class="hl">vPC role                        : primary</span>
Dual Active Detection Status    : 0
<span class="hl">vPC system-mac                  : 00:23:04:ee:be:0a</span>
vPC system-priority             : 32667
vPC local system-mac            : 52:54:00:12:34:01
vPC local role-priority         : 100
vPC local config role-priority  : 100
vPC peer system-mac             : 52:54:00:12:34:02
vPC peer role-priority          : 200
vPC peer config role-priority   : 200</pre>

<div class="eg"><p><b>Worked example.</b> Domain 25: 25 hex mein 0x19 hai, isliye system MAC <code>00:23:04:ee:be:19</code> hai. NX1 ki role priority 32667 (default) hai, NX2 ki bhi 32667. NX1 ka local MAC 5254.0012.3401 aur NX2 ka 5254.0012.3402 hai. Priority barabar, isliye kam MAC jeetta hai: NX1 primary hai. Agar aap NX2 ko primary banana chahte ho, to pair pehli baar banne se pehle NX2 par <code>role priority 100</code> set karo; baad mein badalne se role nahi hilta kyunki election non-preemptive hai.</p></div>

<h3>Loop-avoidance rule (preview)</h3>
<p>vPC STP se ports block nahi karta. Iski jagah woh ek hardware rule use karta hai: <b>jo frame peer-link se aaya, woh vPC member port se bahar nahi bheja jaata agar doosre peer par jodidaar member port up hai</b>. Doosre peer ne use pehle hi locally deliver kar diya. Yeh rule, MAC synchronisation ke saath, wajah hai ki traffic normally local switch par hi rehna chahiye aur peer-link cross nahi karna chahiye. Chapter 7 dikhata hai ki member port fail hone par kya hota hai.</p>

<div class="warn"><p><b>Common galti.</b> Peer-link ko normal data path maanna. Yeh control, flooding aur failure cases ke liye size kiya jaata hai. Agar aapka zyada tar traffic ise cross karta hai, to kuch galat hai: aam taur par ek side par bahut saare orphan ports, ya gateways jo sirf ek peer par exist karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Keepalive na data le jaata hai na MAC sync; peer-link CFS aur data le jaata hai. Questions aksar inhe ulat dete hain. Aur <code>00:00:0c:07:ac:0a</code> group 10 ka HSRP version 1 virtual MAC hai, vPC system MAC nahi.</p></div>

<div class="scn"><h4>Do pairs, ek domain ID</h4><p>Ek company ke same Layer 2 domain mein do vPC pairs the: leaves 1 aur 2, aur leaves 3 aur 4, dono same template se <code>vpc domain 10</code> ke saath bane. Ek access switch dono pairs se ek ek port-channel ke saath double-connected tha. Access switch ke LACP ne dono pairs se same system MAC 00:23:04:ee:be:0a dekha aur chaaron links ko ek aggregate mein bundle karne ki koshish ki, jisse members suspend hue aur beech beech mein loss hua. Fix tha maintenance window mein doosre pair ko domain 20 par renumber karna.</p><p><b>Seekh:</b> domain ID pair ki LACP identity define karta hai; Layer 2 network mein yeh unique hona chahiye.</p></div>

<div class="iv"><p class="q">"vPC peer-link aur peer-keepalive mein kya fark hai?"</p><p>Strong answer: peer-link high-bandwidth port-channel trunk hai jo CFS synchronisation (MAC, ARP, IGMP, consistency checks) aur flooded, orphan aur failover traffic ka data le jaata hai. Keepalive alag path par, aam taur par mgmt0 par, halki Layer 3 heartbeat hai jo koi data nahi le jaati; yeh pair ko dead peer aur dead peer-link mein fark karne deti hai aur is tarah dual-active se bachati hai. Jodo ki dono ki kismat kabhi ek saath nahi judni chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vPC do independent Nexus switches se ek LACP system ID present karwata hai, vPC system MAC 00:23:04:ee:be:&lt;domain hex&gt;.</li>
<li>Components: domain, do peers, peer-link, peer-keepalive, vPC member ports, orphan ports.</li>
<li>Peer-link = CFS sync plus data; keepalive = alag path par UDP 3200 heartbeat, koi data nahi.</li>
<li>Kam role priority primary jeetti hai; tie mein kam system MAC; roles non-preemptive hain.</li>
<li>Peer-link se aaye frames us vPC member port se bahar nahi jaate jiska jodidaar up hai; isi tarah vPC bina block kiye loops se bachta hai.</li>
</ul></div>
`}};export{e as default};