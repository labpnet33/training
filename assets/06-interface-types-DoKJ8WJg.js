var e={id:`interface-types`,h:{en:`Interface types: physical, VLAN, redundant, EtherChannel, bridge groups and IRB`,hi:`Interface types: physical, VLAN, redundant, EtherChannel, bridge groups aur IRB`},body:{en:`
<p>A building's entrances come in several forms: a single door, a door with a spare key-card reader, a wide double door, or a lobby that several corridors open into. Each is still "an entrance" with a name on the sign. Firewall interfaces are the same. The security policy only ever sees the <b>nameif</b>; underneath it can sit a single port, a VLAN, a pair of ports in standby, a bundle of ports, or a bridge of several ports. Choosing the right one is a deployment decision about bandwidth, resilience and addressing.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Layers of an interface">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#fed7aa"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Policy sees: nameif + security level (+ zone)</text>
<rect x="20" y="90" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">Physical</text><text x="75" y="133" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<rect x="142" y="90" width="110" height="60" rx="8" fill="#bae6fd"/><text x="197" y="115" text-anchor="middle" class="svg-ink" font-size="13">Subinterface</text><text x="197" y="133" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1.20 vlan 20</text>
<rect x="264" y="90" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="319" y="115" text-anchor="middle" class="svg-ink" font-size="13">Redundant</text><text x="319" y="133" text-anchor="middle" class="svg-muted" font-size="12">1 active, 1 standby</text>
<rect x="386" y="90" width="110" height="60" rx="8" fill="#fde68a"/><text x="441" y="115" text-anchor="middle" class="svg-ink" font-size="13">EtherChannel</text><text x="441" y="133" text-anchor="middle" class="svg-muted" font-size="12">Po1, LACP</text>
<rect x="508" y="90" width="112" height="60" rx="8" fill="#e2e8f0"/><text x="564" y="115" text-anchor="middle" class="svg-ink" font-size="13">Bridge group</text><text x="564" y="133" text-anchor="middle" class="svg-muted" font-size="12">members + BVI</text>
<line x1="320" y1="60" x2="75" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="197" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="319" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="441" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="564" y2="90" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Threat Defense adds interface modes:</text>
<text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">routed, switched (BVI), inline set, passive, passive ERSPAN</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">subinterfaces can also sit on a redundant interface or a port-channel</text>
</svg><p class="cap">Different building blocks underneath; one nameif on top for the policy.</p></div>

<h3>Physical interfaces and subinterfaces</h3>
<p>A physical interface is the simplest case: <code>nameif</code>, security level, and an IP address in routed mode or <code>bridge-group</code> in transparent mode. When you need many segments on few ports, you use <b>subinterfaces</b>: each carries one 802.1Q VLAN tag. The parent interface is just <code>no shutdown</code>, with no nameif of its own.</p>
<pre class="code">interface GigabitEthernet0/1
 no shutdown
interface GigabitEthernet0/1.20
 vlan 20
 nameif guest
 security-level 20
 ip address 10.0.20.1 255.255.255.0</pre>

<h3>Redundant interfaces (ASA)</h3>
<p>A <b>redundant interface</b> pairs two physical ports: one is active, the other is standby and takes over within a second or so if the active link fails. Only one port forwards at a time, so there is no extra bandwidth, but the switch side needs no special configuration. The ASA supports up to 8 redundant pairs.</p>
<pre class="code">interface Redundant1
 member-interface GigabitEthernet0/2
 member-interface GigabitEthernet0/3
 nameif dmz
 security-level 50
 ip address 10.0.50.1 255.255.255.0</pre>
<pre class="out">NK-ASA# show interface Redundant1 | include Member|switchover
<span class="hl">        Member GigabitEthernet0/2(Active), GigabitEthernet0/3</span>
        Last switchover at 09:12:40 UTC Sep 30 2026</pre>

<h3>EtherChannel</h3>
<p>An <b>EtherChannel</b> bundles several ports into one logical <code>Port-channel</code> interface that carries the nameif and address. All members forward at the same time, so you gain bandwidth <i>and</i> resilience. Use LACP (<code>mode active</code>) so a mis-cabled or failed member is detected. On the ASA a bundle can have up to 16 members, with 8 active; flows are spread by a hash, <b>src-dst-ip</b> by default.</p>
<pre class="code">interface GigabitEthernet0/4
 channel-group 1 mode active
 no shutdown
interface GigabitEthernet0/5
 channel-group 1 mode active
 no shutdown
interface Port-channel1
 nameif inside
 security-level 100
 ip address 10.0.1.1 255.255.255.0</pre>
<pre class="out">NK-ASA# show port-channel summary
Group  Port-channel  Protocol  Span-cluster  Ports
------+-------------+---------+------------+------------------------------------
<span class="hl">1      Po1(U)            LACP          No     Gi0/4(P)   Gi0/5(P)</span></pre>
<p>Firewall <b>clusters</b> use a <b>spanned EtherChannel</b>: one port-channel on the switch reaches all cluster units, which is covered in sec-asa-ha.</p>

<h3>Bridge groups in routed mode: IRB</h3>
<p>Since ASA 9.7 and on Threat Defense, bridge groups also exist in <b>routed</b> mode. This is <b>integrated routing and bridging (IRB)</b>. Several member ports are bridged into one segment, like a small switch, and the <b>BVI gets a nameif</b> and acts as the routed gateway for that segment. Threat Defense calls these member ports <b>switched</b> interfaces. It is ideal for a small branch box where a few PCs plug directly into the firewall. In transparent mode, by contrast, the BVI has no nameif and is only a management address.</p>
<pre class="code"><span class="c">! routed mode, IRB</span>
interface GigabitEthernet0/6
 nameif lan1
 security-level 100
 bridge-group 10
interface GigabitEthernet0/7
 nameif lan2
 security-level 100
 bridge-group 10
interface BVI10
 nameif lan
 security-level 100
 ip address 10.0.10.1 255.255.255.0</pre>

<h3>Threat Defense interface modes</h3>
<table class="cmp"><tr><th>Mode</th><th>What it is</th></tr>
<tr><td>Routed</td><td>Layer 3 interface with an IP address, like an ASA routed interface.</td></tr>
<tr><td>Switched (BVI)</td><td>Member of a bridge group (transparent mode, or IRB in routed mode).</td></tr>
<tr><td>Inline set</td><td>A pair of interfaces that forms a transparent IPS "wire", optionally in tap mode (chapter 7).</td></tr>
<tr><td>Passive</td><td>Receives a copy of traffic from a SPAN port or TAP; detection only.</td></tr>
<tr><td>Passive ERSPAN</td><td>Receives mirrored traffic in GRE from a remote switch (routed mode only).</td></tr></table>
<p>Every data interface also needs a <b>security zone</b> or interface group on Threat Defense, because access control rules match zones rather than security levels. A dedicated <b>management</b> interface (<code>management-only</code> on the ASA) carries only traffic to and from the box.</p>

<div class="eg"><p><b>Worked example.</b> A data centre edge ASA needs 4 Gbps towards the core and must survive a cable failure. Two options: a redundant interface with two 10 G ports (10 G usable, 1 port idle) or an EtherChannel with two 10 G ports (up to 20 G, both active). The core is a vPC pair, so LACP to both core switches is available. They choose Port-channel1 with LACP, giving 20 G total, and the loss of any one member halves capacity without an outage.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>nameif</code> or an IP address on the physical members of an EtherChannel or redundant interface. The logical interface (Port-channel1, Redundant1) owns the nameif; the members carry only <code>channel-group</code> or <code>member-interface</code> settings.</p></div>

<div class="exam"><p><b>Exam trap.</b> Redundant interface = active/standby, no extra bandwidth, no switch configuration. EtherChannel = all members active, needs a matching port-channel on the switch. A question that asks for "more bandwidth and link resilience" points to EtherChannel.</p></div>

<div class="scn"><h4>Half the flows disappear</h4><p>After a new EtherChannel went live between a firewall and a switch stack, about half of the sessions to the DMZ failed. <code>show port-channel summary</code> showed Gi0/4(P) and Gi0/5(s): the second member was suspended. On the switch, the second port had been added with <code>channel-group 1 mode on</code> while the first used LACP. The engineer set both switch ports to <code>mode active</code>; both members came up as (P) and the failures stopped.</p><p><b>Lesson:</b> LACP on both ends catches mismatches; always check each member's flag, not just whether the port-channel is up.</p></div>

<div class="iv"><p class="q">"When would you use a redundant interface instead of an EtherChannel on a firewall?"</p><p>When you only need link resilience and cannot or do not want to configure a port-channel on the switch side, for example two access switches that do not support multi-chassis EtherChannel. It gives active/standby with no switch changes. EtherChannel is preferred when the switch side supports LACP (or vPC/VSS), because it adds bandwidth and detects mis-cabling. Mention that both hide the members behind one nameif.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy sees only the nameif (and zone); underneath can be a port, VLAN, redundant pair, port-channel or bridge group.</li>
<li>Subinterfaces carry one VLAN each; the parent has no nameif.</li>
<li>Redundant interface = active/standby pair; EtherChannel = LACP bundle with all members active.</li>
<li>IRB puts bridge groups into routed mode, and there the BVI has a nameif and routes.</li>
<li>Threat Defense modes: routed, switched, inline set, passive, passive ERSPAN.</li>
</ul></div>
`,hi:`
<p>Building ke entrances kai roop mein aate hain: ek akela darwaaza, spare key-card reader wala darwaaza, chauda double door, ya ek lobby jismein kai corridors khulte hain. Har ek phir bhi "entrance" hai jiske sign par ek naam hai. Firewall interfaces bhi aise hi hain. Security policy hamesha sirf <b>nameif</b> dekhti hai; uske neeche ek port, ek VLAN, standby mein ports ka pair, ports ka bundle, ya kai ports ka bridge ho sakta hai. Sahi wala chunna bandwidth, resilience aur addressing ka deployment decision hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Interface ki layers">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#fed7aa"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Policy dekhti hai: nameif + security level (+ zone)</text>
<rect x="20" y="90" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">Physical</text><text x="75" y="133" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<rect x="142" y="90" width="110" height="60" rx="8" fill="#bae6fd"/><text x="197" y="115" text-anchor="middle" class="svg-ink" font-size="13">Subinterface</text><text x="197" y="133" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1.20 vlan 20</text>
<rect x="264" y="90" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="319" y="115" text-anchor="middle" class="svg-ink" font-size="13">Redundant</text><text x="319" y="133" text-anchor="middle" class="svg-muted" font-size="12">1 active, 1 standby</text>
<rect x="386" y="90" width="110" height="60" rx="8" fill="#fde68a"/><text x="441" y="115" text-anchor="middle" class="svg-ink" font-size="13">EtherChannel</text><text x="441" y="133" text-anchor="middle" class="svg-muted" font-size="12">Po1, LACP</text>
<rect x="508" y="90" width="112" height="60" rx="8" fill="#e2e8f0"/><text x="564" y="115" text-anchor="middle" class="svg-ink" font-size="13">Bridge group</text><text x="564" y="133" text-anchor="middle" class="svg-muted" font-size="12">members + BVI</text>
<line x1="320" y1="60" x2="75" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="197" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="319" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="441" y2="90" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="564" y2="90" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Threat Defense interface modes jodta hai:</text>
<text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">routed, switched (BVI), inline set, passive, passive ERSPAN</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">subinterfaces redundant interface ya port-channel par bhi baith sakte hain</text>
</svg><p class="cap">Neeche alag building blocks; policy ke liye upar ek nameif.</p></div>

<h3>Physical interfaces aur subinterfaces</h3>
<p>Physical interface sabse simple case hai: <code>nameif</code>, security level, aur routed mode mein IP address ya transparent mode mein <code>bridge-group</code>. Jab kam ports par kai segments chahiye, aap <b>subinterfaces</b> use karte ho: har ek ek 802.1Q VLAN tag le jaata hai. Parent interface sirf <code>no shutdown</code> hai, uska apna nameif nahi hota.</p>
<pre class="code">interface GigabitEthernet0/1
 no shutdown
interface GigabitEthernet0/1.20
 vlan 20
 nameif guest
 security-level 20
 ip address 10.0.20.1 255.255.255.0</pre>

<h3>Redundant interfaces (ASA)</h3>
<p><b>Redundant interface</b> do physical ports ko pair karta hai: ek active hai, doosra standby hai aur active link fail hone par lagbhag ek second mein take over karta hai. Ek samay mein sirf ek port forward karta hai, isliye extra bandwidth nahi milti, lekin switch side ko koi special configuration nahi chahiye. ASA 8 tak redundant pairs support karta hai.</p>
<pre class="code">interface Redundant1
 member-interface GigabitEthernet0/2
 member-interface GigabitEthernet0/3
 nameif dmz
 security-level 50
 ip address 10.0.50.1 255.255.255.0</pre>
<pre class="out">NK-ASA# show interface Redundant1 | include Member|switchover
<span class="hl">        Member GigabitEthernet0/2(Active), GigabitEthernet0/3</span>
        Last switchover at 09:12:40 UTC Sep 30 2026</pre>

<h3>EtherChannel</h3>
<p><b>EtherChannel</b> kai ports ko ek logical <code>Port-channel</code> interface mein bundle karta hai jis par nameif aur address hota hai. Saare members ek saath forward karte hain, isliye aapko bandwidth <i>aur</i> resilience dono milte hain. LACP (<code>mode active</code>) use karo taaki galat cabled ya failed member pakda jaaye. ASA par bundle mein 16 tak members ho sakte hain, jinme 8 active; flows hash se baante jaate hain, default mein <b>src-dst-ip</b>.</p>
<pre class="code">interface GigabitEthernet0/4
 channel-group 1 mode active
 no shutdown
interface GigabitEthernet0/5
 channel-group 1 mode active
 no shutdown
interface Port-channel1
 nameif inside
 security-level 100
 ip address 10.0.1.1 255.255.255.0</pre>
<pre class="out">NK-ASA# show port-channel summary
Group  Port-channel  Protocol  Span-cluster  Ports
------+-------------+---------+------------+------------------------------------
<span class="hl">1      Po1(U)            LACP          No     Gi0/4(P)   Gi0/5(P)</span></pre>
<p>Firewall <b>clusters</b> <b>spanned EtherChannel</b> use karte hain: switch ka ek port-channel saare cluster units tak pahunchta hai, jo sec-asa-ha mein cover hai.</p>

<h3>Routed mode mein bridge groups: IRB</h3>
<p>ASA 9.7 se aur Threat Defense par, bridge groups <b>routed</b> mode mein bhi hote hain. Yeh <b>integrated routing and bridging (IRB)</b> hai. Kai member ports ek segment mein bridge hote hain, ek chhote switch ki tarah, aur <b>BVI ko nameif milta hai</b> aur woh us segment ka routed gateway banta hai. Threat Defense in member ports ko <b>switched</b> interfaces kehta hai. Yeh chhote branch box ke liye ideal hai jahan kuch PCs seedhe firewall mein plug hote hain. Iske ulat, transparent mode mein BVI ka nameif nahi hota aur woh sirf management address hai.</p>
<pre class="code"><span class="c">! routed mode, IRB</span>
interface GigabitEthernet0/6
 nameif lan1
 security-level 100
 bridge-group 10
interface GigabitEthernet0/7
 nameif lan2
 security-level 100
 bridge-group 10
interface BVI10
 nameif lan
 security-level 100
 ip address 10.0.10.1 255.255.255.0</pre>

<h3>Threat Defense interface modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Yeh kya hai</th></tr>
<tr><td>Routed</td><td>IP address wala layer 3 interface, ASA routed interface jaisa.</td></tr>
<tr><td>Switched (BVI)</td><td>Bridge group ka member (transparent mode, ya routed mode mein IRB).</td></tr>
<tr><td>Inline set</td><td>Interfaces ka pair jo transparent IPS "wire" banata hai, optionally tap mode mein (chapter 7).</td></tr>
<tr><td>Passive</td><td>SPAN port ya TAP se traffic ki copy leta hai; sirf detection.</td></tr>
<tr><td>Passive ERSPAN</td><td>Remote switch se GRE mein mirrored traffic leta hai (sirf routed mode).</td></tr></table>
<p>Threat Defense par har data interface ko ek <b>security zone</b> ya interface group bhi chahiye, kyunki access control rules security levels ke bajaye zones match karte hain. Ek dedicated <b>management</b> interface (ASA par <code>management-only</code>) sirf box se aane-jaane wala traffic le jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> Data centre edge ASA ko core ki taraf 4 Gbps chahiye aur cable failure jhelni hai. Do options: do 10 G ports wala redundant interface (10 G usable, 1 port idle) ya do 10 G ports wala EtherChannel (20 G tak, dono active). Core ek vPC pair hai, isliye dono core switches tak LACP available hai. Woh LACP ke saath Port-channel1 chunte hain, jo total 20 G deta hai, aur kisi ek member ke jaane par capacity aadhi hoti hai bina outage ke.</p></div>

<div class="warn"><p><b>Common galti.</b> EtherChannel ya redundant interface ke physical members par <code>nameif</code> ya IP address configure karna. Logical interface (Port-channel1, Redundant1) nameif ka maalik hai; members sirf <code>channel-group</code> ya <code>member-interface</code> settings rakhte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Redundant interface = active/standby, extra bandwidth nahi, switch configuration nahi. EtherChannel = saare members active, switch par matching port-channel chahiye. Jo question "zyada bandwidth aur link resilience" maangta hai woh EtherChannel ki taraf ishara karta hai.</p></div>

<div class="scn"><h4>Aadhe flows gayab</h4><p>Firewall aur switch stack ke beech naya EtherChannel live hone ke baad DMZ ke lagbhag aadhe sessions fail hue. <code>show port-channel summary</code> ne Gi0/4(P) aur Gi0/5(s) dikhaya: doosra member suspended tha. Switch par doosra port <code>channel-group 1 mode on</code> ke saath joda gaya tha jabki pehla LACP use karta tha. Engineer ne dono switch ports ko <code>mode active</code> kiya; dono members (P) ki tarah up hue aur failures ruk gaye.</p><p><b>Seekh:</b> dono ends par LACP mismatches pakadta hai; hamesha har member ka flag check karo, sirf yeh nahi ki port-channel up hai.</p></div>

<div class="iv"><p class="q">"Firewall par EtherChannel ki jagah redundant interface kab use karoge?"</p><p>Jab sirf link resilience chahiye aur switch side par port-channel configure nahi kar sakte ya nahi karna chahte, jaise do access switches jo multi-chassis EtherChannel support nahi karte. Yeh bina switch changes ke active/standby deta hai. Jab switch side LACP (ya vPC/VSS) support karti hai to EtherChannel behtar hai, kyunki woh bandwidth jodta hai aur mis-cabling pakadta hai. Batao ki dono members ko ek nameif ke peeche chhupate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy sirf nameif (aur zone) dekhti hai; neeche port, VLAN, redundant pair, port-channel ya bridge group ho sakta hai.</li>
<li>Subinterfaces har ek ek VLAN le jaate hain; parent ka nameif nahi hota.</li>
<li>Redundant interface = active/standby pair; EtherChannel = LACP bundle jisme saare members active.</li>
<li>IRB bridge groups ko routed mode mein laata hai, aur wahan BVI ka nameif hota hai aur woh route karta hai.</li>
<li>Threat Defense modes: routed, switched, inline set, passive, passive ERSPAN.</li>
</ul></div>
`}};export{e as default};