var e={id:`vsan`,h:{en:`VSANs: virtual fabrics, port membership and VSAN trunking`,hi:`VSANs: virtual fabrics, port membership aur VSAN trunking`},body:{en:`
<p>Imagine a tall building where each floor is a completely separate company: its own reception, its own staff directory, its own security rules, its own fire doors. A fire drill on floor 3 never stops work on floor 5. A <b>VSAN</b> (virtual SAN) turns one physical MDS switch, or a group of switches, into several such floors. Each VSAN is a <b>complete, independent Fibre Channel fabric</b>.</p>

<h3>What exactly is separate in each VSAN</h3>
<p>A VLAN on Ethernet mainly separates broadcast domains. A VSAN goes much further. Every VSAN runs its own copy of every fabric service:</p>
<ul>
<li>Its own <b>principal switch</b> election and <b>domain IDs</b> (fcdomain).</li>
<li>Its own <b>name server</b> (FCNS) and fabric login table.</li>
<li>Its own <b>zoning database</b>, active zoneset and zoning mode (basic or enhanced).</li>
<li>Its own <b>routing</b> (FSPF, the FC link-state routing protocol) across ISLs.</li>
</ul>
<p>So a fabric rebuild, a zoning mistake or a misbehaving device in VSAN 10 does not disturb VSAN 20. That isolation is the whole point: you can host production, backup and test on the same hardware without letting them hurt each other.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VSANs on one MDS">
<rect x="20" y="15" width="600" height="190" rx="10" fill="#e2e8f0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">One physical MDS switch</text>
<rect x="40" y="55" width="270" height="130" rx="8" fill="#bae6fd"/><text x="175" y="78" text-anchor="middle" class="svg-ink" font-size="13">VSAN 10 FABRIC-A</text>
<text x="175" y="102" text-anchor="middle" class="svg-muted" font-size="12">name server, zoning, domain 0x0a</text><text x="175" y="126" text-anchor="middle" class="svg-ink" font-size="12">fc1/1 ESX01, fc1/5 ARRAY1</text>
<rect x="330" y="55" width="270" height="130" rx="8" fill="#fde68a"/><text x="465" y="78" text-anchor="middle" class="svg-ink" font-size="13">VSAN 1 (default)</text>
<text x="465" y="102" text-anchor="middle" class="svg-muted" font-size="12">every port starts here</text><text x="465" y="126" text-anchor="middle" class="svg-ink" font-size="12">fc1/2 ESX02 (forgotten!)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">No traffic crosses between VSANs</text>
</svg><p class="cap">A port that was never moved stays in VSAN 1. It can still log in, but it will never see targets in VSAN 10.</p></div>

<h3>VSAN numbers and limits</h3>
<table class="cmp"><tr><th>VSAN</th><th>Meaning</th></tr>
<tr><td><b>1</b></td><td>Default VSAN. Every port is in VSAN 1 out of the box. Best practice: do not use it for production.</td></tr>
<tr><td><b>2 to 4093</b></td><td>User VSANs (a few IDs in this range are reserved on some platforms).</td></tr>
<tr><td><b>4094</b></td><td>Isolated VSAN. If you delete a VSAN, its ports move here and stop working until reassigned.</td></tr>
</table>
<p>An MDS supports up to <b>256 VSANs</b> configured per switch. A normal port (F or E) belongs to exactly <b>one</b> VSAN, its <b>port VSAN</b>. Only trunking ports (TE, TF, TNP) carry several VSANs.</p>

<h3>Configuration: exactly what lab 1 asks</h3>
<pre class="code"><span class="c">! create the VSAN and give it a name</span>
MDS-A# configure terminal
MDS-A(config)# vsan database
MDS-A(config-vsan-db)# vsan 10 name FABRIC-A
<span class="c">! move the host and array ports into VSAN 10</span>
MDS-A(config-vsan-db)# vsan 10 interface fc1/1
MDS-A(config-vsan-db)# vsan 10 interface fc1/5
MDS-A(config-vsan-db)# exit
<span class="c">! set the ports to F mode and enable them</span>
MDS-A(config)# interface fc1/1
MDS-A(config-if)# switchport mode F
MDS-A(config-if)# no shutdown
MDS-A(config-if)# interface fc1/5
MDS-A(config-if)# switchport mode F
MDS-A(config-if)# no shutdown
MDS-A(config-if)# end
MDS-A# copy running-config startup-config</pre>
<p>Moving an interface into a VSAN is done inside <code>vsan database</code>, not under the interface. If the port is already up and logged in, moving it makes the device log out and log in again in the new VSAN, which is disruptive for that device.</p>

<h3>Verification</h3>
<pre class="out">MDS-A# show vsan 10
vsan 10 information
         name:FABRIC-A  state:active
         interoperability mode:default
         loadbalancing:src-id/dst-id/oxid
         operational state:up

MDS-A# show vsan membership
vsan 1 interfaces:
    fc1/2             fc1/3             fc1/4             fc1/6
<span class="hl">vsan 10 interfaces:
    fc1/1             fc1/5</span>

MDS-A# show interface brief
-------------------------------------------------------------------------------
Interface  Vsan   Admin  Admin   Status          SFP    Oper  Oper   Port
                  Mode   Trunk                          Mode  Speed  Channel
                         Mode                                 (Gbps)
-------------------------------------------------------------------------------
fc1/1      10     F      on      up              swl    F     32     --
fc1/5      10     F      on      up              swl    F     32     --</pre>
<p>Check three columns in <code>show interface brief</code>: <b>Vsan</b> (is it the right one?), <b>Status</b> (up) and <b>Oper Mode</b> (F for host and array ports). The VSAN's operational state becomes "up" only when at least one port in it is up.</p>
<p>The load-balancing line matters on ISLs: <code>src-id/dst-id/oxid</code> (the default) spreads each exchange separately across equal-cost paths, while <code>src-id/dst-id</code> keeps every frame between one pair on one path, which some older arrays or replication tools need to guarantee in-order delivery.</p>

<h3>VSAN trunking between switches</h3>
<p>Inside one fabric (for example between an edge and a core MDS in fabric A) you usually need more than one VSAN on the ISL, such as production VSAN 10 and backup VSAN 11. A <b>TE_Port</b> carries several VSANs, adding a small VSAN tag to each frame (the Cisco EISL format).</p>
<pre class="code"><span class="c">! ISL port on the edge switch of fabric A</span>
interface fc1/48
  switchport mode E
  switchport trunk mode on
  switchport trunk allowed vsan 10
  switchport trunk allowed vsan add 11
  no shutdown</pre>
<p>In <code>show interface brief</code> a working trunk shows Oper Mode <b>TE</b> and status <b>trunking</b>. Several ISLs can also be bundled into a <b>SAN port channel</b> (<code>interface port-channel 1</code>, members with <code>channel-group 1</code>) for bandwidth and resilience; the port channel then trunks the VSANs. Never trunk or connect fabric A to fabric B: they must stay separate physical networks.</p>

<div class="eg"><p><b>Worked example: a VSAN plan.</b> A company has production, backup and replication traffic in two fabrics. Plan: fabric A uses VSAN 10 (production), 11 (backup), 12 (replication); fabric B uses VSAN 20, 21, 22. Different numbers per fabric make every output self-explanatory: if you ever see VSAN 20 on an MDS-A port, you know someone cabled or configured the wrong fabric. Each fabric has 3 VSANs, well under the 256 limit, and VSAN 1 stays empty.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to move a new port out of VSAN 1: the host logs in, <code>show flogi database</code> shows it, and everyone believes the fabric is fine, but the host sits alone in VSAN 1. Deleting a VSAN that still has ports (they go to isolated VSAN 4094). Allowing all VSANs on a trunk instead of only the ones needed.</p></div>
<div class="exam"><p><b>Exam tip.</b> VSAN 1 default, 4094 isolated, user range 2 to 4093, up to 256 VSANs per switch. Each VSAN has its own domain IDs, name server, zoning and FSPF. A port has one port VSAN; TE ports trunk many. Inter-VSAN routing (IVR) is the separate feature that lets selected devices in different VSANs talk.</p></div>

<div class="scn"><h4>Logged in, but in the wrong VSAN</h4><p>Ticket INC-4471: "ESX02 is logged in, we can see it in show flogi database, but a rescan finds no disks." The engineer ran <code>show flogi database</code> and read the whole row, not just the WWPN: fc1/2 was in VSAN <b>1</b>. The port had been enabled but never added to VSAN 10, so the host and ARRAY1 lived in different fabrics. The fix was <code>vsan database</code>, <code>vsan 10 interface fc1/2</code>. The host logged in again in VSAN 10, but the ticket was not finished yet: the zone still had a typo, which is the next gate (lab 4).</p><p><b>Lesson:</b> "it is in the FLOGI table" is not enough; always read the VSAN column.</p></div>

<div class="iv"><p class="q">"How is a VSAN different from a VLAN?"</p><p>Strong answer: both segment a physical network, but a VSAN is a full, independent Fibre Channel fabric: its own principal switch and domain IDs, name server, zoning database and FSPF routing. A problem in one VSAN (a fabric rebuild, a zoning error) does not affect another. A port belongs to one VSAN; TE trunks carry several with EISL tagging. Mention VSAN 1 default and 4094 isolated, and that devices in different VSANs cannot talk without IVR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VSAN is a complete virtual fabric with its own fcdomain, name server, zoning and FSPF.</li>
<li>VSAN 1 is the default, 4094 is isolated; user VSANs 2 to 4093; up to 256 per switch.</li>
<li>Assign ports inside <code>vsan database</code> with <code>vsan N interface fcX/Y</code>; verify with <code>show vsan membership</code> and <code>show interface brief</code>.</li>
<li>TE ports and SAN port channels trunk several VSANs within one fabric; never connect fabric A to fabric B.</li>
<li>A port still in VSAN 1 logs in but never sees targets in the production VSAN.</li>
</ul></div>
`,hi:`
<p>Ek oonchi building socho jismein har floor ek bilkul alag company hai: apna reception, apni staff directory, apne security rules, apne fire doors. Floor 3 par fire drill floor 5 ka kaam kabhi nahi rokti. <b>VSAN</b> (virtual SAN) ek physical MDS switch, ya switches ke group, ko aise kai floors mein badal deta hai. Har VSAN ek <b>poora, independent Fibre Channel fabric</b> hai.</p>

<h3>Har VSAN mein kya kya alag hai</h3>
<p>Ethernet par VLAN mainly broadcast domains alag karta hai. VSAN usse kahin aage jaata hai. Har VSAN har fabric service ki apni copy chalata hai:</p>
<ul>
<li>Apna <b>principal switch</b> election aur <b>domain IDs</b> (fcdomain).</li>
<li>Apna <b>name server</b> (FCNS) aur fabric login table.</li>
<li>Apna <b>zoning database</b>, active zoneset aur zoning mode (basic ya enhanced).</li>
<li>ISLs ke across apni <b>routing</b> (FSPF, FC ka link-state routing protocol).</li>
</ul>
<p>Isliye VSAN 10 mein fabric rebuild, zoning galti ya koi gadbad device VSAN 20 ko disturb nahi karta. Yahi isolation poora point hai: aap production, backup aur test ko ek hi hardware par host kar sakte ho bina unhe ek doosre ko nuksaan pahunchane diye.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ek MDS par VSANs">
<rect x="20" y="15" width="600" height="190" rx="10" fill="#e2e8f0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Ek physical MDS switch</text>
<rect x="40" y="55" width="270" height="130" rx="8" fill="#bae6fd"/><text x="175" y="78" text-anchor="middle" class="svg-ink" font-size="13">VSAN 10 FABRIC-A</text>
<text x="175" y="102" text-anchor="middle" class="svg-muted" font-size="12">name server, zoning, domain 0x0a</text><text x="175" y="126" text-anchor="middle" class="svg-ink" font-size="12">fc1/1 ESX01, fc1/5 ARRAY1</text>
<rect x="330" y="55" width="270" height="130" rx="8" fill="#fde68a"/><text x="465" y="78" text-anchor="middle" class="svg-ink" font-size="13">VSAN 1 (default)</text>
<text x="465" y="102" text-anchor="middle" class="svg-muted" font-size="12">har port yahin se shuru</text><text x="465" y="126" text-anchor="middle" class="svg-ink" font-size="12">fc1/2 ESX02 (bhool gaye!)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">VSANs ke beech koi traffic cross nahi karta</text>
</svg><p class="cap">Jo port kabhi move nahi hua woh VSAN 1 mein rehta hai. Woh phir bhi login kar sakta hai, lekin VSAN 10 ke targets kabhi nahi dekhega.</p></div>

<h3>VSAN numbers aur limits</h3>
<table class="cmp"><tr><th>VSAN</th><th>Matlab</th></tr>
<tr><td><b>1</b></td><td>Default VSAN. Out of the box har port VSAN 1 mein hota hai. Best practice: ise production ke liye use mat karo.</td></tr>
<tr><td><b>2 se 4093</b></td><td>User VSANs (is range ke kuch IDs kuch platforms par reserved hain).</td></tr>
<tr><td><b>4094</b></td><td>Isolated VSAN. Agar aap VSAN delete karte ho, uske ports yahan aa jaate hain aur reassign hone tak kaam band kar dete hain.</td></tr>
</table>
<p>MDS har switch par <b>256 VSANs</b> tak configure karna support karta hai. Normal port (F ya E) bilkul <b>ek</b> VSAN ka hota hai, jise uska <b>port VSAN</b> kehte hain. Sirf trunking ports (TE, TF, TNP) kai VSANs le jaate hain.</p>

<h3>Configuration: bilkul wahi jo lab 1 maangta hai</h3>
<pre class="code"><span class="c">! VSAN banao aur use naam do</span>
MDS-A# configure terminal
MDS-A(config)# vsan database
MDS-A(config-vsan-db)# vsan 10 name FABRIC-A
<span class="c">! host aur array ports ko VSAN 10 mein daalo</span>
MDS-A(config-vsan-db)# vsan 10 interface fc1/1
MDS-A(config-vsan-db)# vsan 10 interface fc1/5
MDS-A(config-vsan-db)# exit
<span class="c">! ports ko F mode mein set karo aur enable karo</span>
MDS-A(config)# interface fc1/1
MDS-A(config-if)# switchport mode F
MDS-A(config-if)# no shutdown
MDS-A(config-if)# interface fc1/5
MDS-A(config-if)# switchport mode F
MDS-A(config-if)# no shutdown
MDS-A(config-if)# end
MDS-A# copy running-config startup-config</pre>
<p>Interface ko VSAN mein daalna <code>vsan database</code> ke andar hota hai, interface ke neeche nahi. Agar port pehle se up aur logged in hai, to use move karne se device log out hokar naye VSAN mein dobara login karta hai, jo us device ke liye disruptive hai.</p>

<h3>Verification</h3>
<pre class="out">MDS-A# show vsan 10
vsan 10 information
         name:FABRIC-A  state:active
         interoperability mode:default
         loadbalancing:src-id/dst-id/oxid
         operational state:up

MDS-A# show vsan membership
vsan 1 interfaces:
    fc1/2             fc1/3             fc1/4             fc1/6
<span class="hl">vsan 10 interfaces:
    fc1/1             fc1/5</span>

MDS-A# show interface brief
-------------------------------------------------------------------------------
Interface  Vsan   Admin  Admin   Status          SFP    Oper  Oper   Port
                  Mode   Trunk                          Mode  Speed  Channel
                         Mode                                 (Gbps)
-------------------------------------------------------------------------------
fc1/1      10     F      on      up              swl    F     32     --
fc1/5      10     F      on      up              swl    F     32     --</pre>
<p><code>show interface brief</code> mein teen columns check karo: <b>Vsan</b> (kya sahi wala hai?), <b>Status</b> (up) aur <b>Oper Mode</b> (host aur array ports ke liye F). VSAN ka operational state tabhi "up" hota hai jab usmein kam se kam ek port up ho.</p>
<p>Load-balancing line ISLs par matter karti hai: <code>src-id/dst-id/oxid</code> (default) har exchange ko equal-cost paths par alag alag failata hai, jabki <code>src-id/dst-id</code> ek pair ke beech ke har frame ko ek hi path par rakhta hai, jo kuch purane arrays ya replication tools ko in-order delivery ki guarantee ke liye chahiye.</p>

<h3>Switches ke beech VSAN trunking</h3>
<p>Ek fabric ke andar (jaise fabric A mein edge aur core MDS ke beech) aapko aam taur par ISL par ek se zyada VSAN chahiye, jaise production VSAN 10 aur backup VSAN 11. <b>TE_Port</b> kai VSANs le jaata hai, har frame mein ek chhota VSAN tag jodta hai (Cisco EISL format).</p>
<pre class="code"><span class="c">! fabric A ke edge switch par ISL port</span>
interface fc1/48
  switchport mode E
  switchport trunk mode on
  switchport trunk allowed vsan 10
  switchport trunk allowed vsan add 11
  no shutdown</pre>
<p><code>show interface brief</code> mein kaam karta trunk Oper Mode <b>TE</b> aur status <b>trunking</b> dikhata hai. Kai ISLs ko bandwidth aur resilience ke liye ek <b>SAN port channel</b> mein bhi bundle kiya ja sakta hai (<code>interface port-channel 1</code>, members <code>channel-group 1</code> ke saath); phir port channel VSANs trunk karta hai. Fabric A ko fabric B se kabhi trunk ya connect mat karo: unhe alag physical networks rehna chahiye.</p>

<div class="eg"><p><b>Worked example: ek VSAN plan.</b> Ek company ke paas do fabrics mein production, backup aur replication traffic hai. Plan: fabric A VSAN 10 (production), 11 (backup), 12 (replication) use karta hai; fabric B VSAN 20, 21, 22. Har fabric ke alag numbers har output ko self-explanatory banate hain: agar aapko kabhi MDS-A ke port par VSAN 20 dikhe, to aap jaan jaoge ki kisi ne galat fabric cable ya configure kiya. Har fabric mein 3 VSANs hain, 256 ki limit se kaafi neeche, aur VSAN 1 khaali rehta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Naye port ko VSAN 1 se bahar le jaana bhool jaana: host login karta hai, <code>show flogi database</code> use dikhata hai, aur sab maan lete hain ki fabric theek hai, lekin host VSAN 1 mein akela baitha hai. Aisa VSAN delete karna jismein abhi bhi ports hain (woh isolated VSAN 4094 mein chale jaate hain). Trunk par sirf zaroori VSANs ke bajaye saare VSANs allow karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> VSAN 1 default, 4094 isolated, user range 2 se 4093, har switch par 256 VSANs tak. Har VSAN ke apne domain IDs, name server, zoning aur FSPF hote hain. Port ka ek port VSAN hota hai; TE ports kai trunk karte hain. Inter-VSAN routing (IVR) alag feature hai jo alag VSANs ke chune hue devices ko baat karne deta hai.</p></div>

<div class="scn"><h4>Logged in, par galat VSAN mein</h4><p>Ticket INC-4471: "ESX02 logged in hai, show flogi database mein dikh raha hai, lekin rescan se koi disk nahi milti." Engineer ne <code>show flogi database</code> chalaya aur sirf WWPN nahi, poori row padhi: fc1/2 VSAN <b>1</b> mein tha. Port enable to hua tha lekin kabhi VSAN 10 mein add nahi hua, isliye host aur ARRAY1 alag fabrics mein rehte the. Fix tha <code>vsan database</code>, <code>vsan 10 interface fc1/2</code>. Host ne VSAN 10 mein dobara login kiya, lekin ticket abhi khatam nahi hua tha: zone mein abhi bhi ek typo tha, jo agla gate hai (lab 4).</p><p><b>Seekh:</b> "FLOGI table mein hai" kaafi nahi hai; hamesha VSAN column padho.</p></div>

<div class="iv"><p class="q">"VSAN VLAN se kaise alag hai?"</p><p>Strong answer: dono physical network ko segment karte hain, lekin VSAN ek poora, independent Fibre Channel fabric hai: apna principal switch aur domain IDs, name server, zoning database aur FSPF routing. Ek VSAN ki problem (fabric rebuild, zoning error) doosre ko affect nahi karti. Port ek VSAN ka hota hai; TE trunks EISL tagging ke saath kai le jaate hain. VSAN 1 default aur 4094 isolated ka zikr karo, aur yeh ki alag VSANs ke devices IVR ke bina baat nahi kar sakte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VSAN apne fcdomain, name server, zoning aur FSPF ke saath ek poora virtual fabric hai.</li>
<li>VSAN 1 default hai, 4094 isolated; user VSANs 2 se 4093; har switch par 256 tak.</li>
<li>Ports ko <code>vsan database</code> ke andar <code>vsan N interface fcX/Y</code> se assign karo; <code>show vsan membership</code> aur <code>show interface brief</code> se verify karo.</li>
<li>TE ports aur SAN port channels ek fabric ke andar kai VSANs trunk karte hain; fabric A ko fabric B se kabhi mat jodo.</li>
<li>VSAN 1 mein reh gaya port login to karta hai lekin production VSAN ke targets kabhi nahi dekhta.</li>
</ul></div>
`}};export{e as default};