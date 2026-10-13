var e={id:`stp-problem`,h:{en:`Why two uplinks are not twice the bandwidth`,hi:`Do uplinks double bandwidth kyun nahi dete`},body:{en:`
<p>Picture a small town with two bridges over a river. The town council is scared that traffic might go round and round in circles, so it closes one bridge with a barrier and opens it only when the other bridge collapses. Everyone is safe, but half the bridges stand empty every day. That is what <b>spanning tree</b> does to redundant Ethernet links, and that is the problem this chapter explains.</p>

<h3>Why Layer 2 loops are deadly</h3>
<p>An IP packet has a <b>TTL</b> (time to live) field that routers decrease at every hop; a looping packet dies after at most 255 hops. An <b>Ethernet frame has no TTL</b>. If a broadcast frame (for example an ARP request) enters a loop, every switch floods it out of every port, copies multiply, and within seconds the links are saturated. This is a <b>broadcast storm</b>. At the same time, switches see the same source MAC arriving on different ports and keep rewriting their MAC table, which is called <b>MAC flapping</b>. CPUs spike and the whole VLAN stops working.</p>

<h3>What spanning tree does about it</h3>
<p><b>Spanning Tree Protocol (STP)</b>, and its faster versions <b>Rapid PVST+</b> and <b>MST</b>, elect a <b>root bridge</b>, calculate the best path from every switch to the root, and put every redundant port into a <b>blocking</b> (discarding) state. The result is a loop-free tree. The cost is that the blocked links carry no user traffic.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="STP blocks one of two uplinks">
<rect x="90" y="20" width="160" height="42" rx="8" fill="#ddd6fe"/><text x="170" y="46" text-anchor="middle" class="svg-ink" font-size="13">AGG1 (root)</text>
<rect x="390" y="20" width="160" height="42" rx="8" fill="#ddd6fe"/><text x="470" y="46" text-anchor="middle" class="svg-ink" font-size="13">AGG2</text>
<line x1="250" y1="41" x2="390" y2="41" stroke="#64748b" stroke-width="3"/>
<rect x="240" y="150" width="160" height="42" rx="8" fill="#bae6fd"/><text x="320" y="176" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-01</text>
<line x1="170" y1="62" x2="280" y2="150" stroke="#64748b" stroke-width="3"/><text x="160" y="115" class="svg-muted" font-size="12">Eth1/49 FWD</text>
<line x1="470" y1="62" x2="360" y2="150" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="420" y="115" class="svg-accent" font-size="12">Eth1/50 BLK</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">Triangle = loop, so one side must block</text>
</svg><p class="cap">Two uplinks are bought and cabled, but STP lets only one of them forward per VLAN.</p></div>

<pre class="out">ACCESS-01# show spanning-tree vlan 10
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/49          Root FWD 2         128.49   P2p
<span class="hl">Eth1/50          Altn BLK 2         128.50   P2p</span></pre>

<h3>The three costs of relying on STP</h3>
<ul>
<li><b>Idle bandwidth.</b> Half of the uplink capacity you paid for sits unused until something fails. You can spread VLANs so that some forward on the left and others on the right (per-VLAN load balancing), but any single VLAN still uses one link.</li>
<li><b>Convergence events.</b> When the forwarding link fails, the alternate port must move to forwarding. Rapid PVST+ does this in well under a second on point-to-point links; legacy 802.1D took 30 to 50 seconds. Every topology change also <b>flushes MAC tables</b>, so traffic floods briefly.</li>
<li><b>Fragility.</b> STP is a safety net that must be configured perfectly. A wrong root, a unidirectional link or a switch that stops sending BPDUs can create a real loop.</li>
</ul>

<h3>The same problem, inside the server: NIC teaming</h3>
<p>A server with two NICs faces the same question: how do I use two cables without confusing the network? Operating systems offer several <b>teaming</b> (Windows, VMware) or <b>bonding</b> (Linux) modes. The Linux names are the most precise, so we use them:</p>
<table class="cmp"><tr><th>Linux bonding mode</th><th>How it sends</th><th>Switch side</th><th>Both links forward?</th></tr>
<tr><td><b>active-backup</b> (mode 1)</td><td>One NIC active, the other waits</td><td>Nothing special; works to two independent switches</td><td>No</td></tr>
<tr><td><b>balance-tlb / balance-alb</b> (modes 5 and 6)</td><td>Spreads outbound traffic; alb also tricks ARP to spread inbound</td><td>Nothing special</td><td>Partly, with side effects</td></tr>
<tr><td><b>balance-xor</b> (mode 2)</td><td>Hash per flow over both NICs</td><td>Needs a static port-channel (mode on)</td><td>Yes, one switch or vPC</td></tr>
<tr><td><b>802.3ad</b> (mode 4)</td><td>LACP bundle, hash per flow</td><td>Needs an LACP port-channel</td><td>Yes, one switch or vPC</td></tr>
</table>
<p>VMware has the same split: <b>route based on originating virtual port</b> (the default) works with two independent switches but pins each VM to one uplink; <b>route based on IP hash</b> needs a static port-channel; <b>LACP</b> needs a distributed switch and an LACP port-channel upstream.</p>
<p>Here is the key point. Every mode in which <b>both links carry traffic for the same MAC</b> requires the upstream side to be <b>one port-channel</b>. If the two NICs land on two ordinary switches, only the "switch-independent" modes are safe, and they give you active/standby behaviour or tricks with side effects.</p>

<div class="eg"><p><b>Worked example.</b> SRV1 has eth0 on NX1 and eth1 on NX2, and the admin chooses <code>balance-xor</code> without any port-channel on the switches. SRV1's MAC now appears on NX1 Ethernet1/3 for some flows and on NX2 Ethernet1/3 for others. Each switch learns the MAC, then the frames cross the link between the switches and each switch relearns it on the inter-switch port. The MAC flaps dozens of times a second, NX-OS logs MAC move messages from its L2FM process (the exact wording varies by platform and release) and replies to SRV1 arrive on the wrong NIC. The fix is either active-backup (safe but half the bandwidth) or a real port-channel spanning both switches: vPC.</p></div>

<h3>The solution in principle</h3>
<p>If we can make several physical links look like <b>one logical link</b>, STP sees one port, there is nothing to block, and the server's hash can use all members. That logical link is a <b>port-channel</b> (chapter 3). If we can make two switches look like <b>one LACP partner</b>, the logical link can even span two chassis. That is <b>vPC</b> (chapter 4 onward).</p>

<div class="warn"><p><b>Common mistake.</b> Turning off spanning tree "because vPC handles loops". vPC removes the need to block, but STP must stay enabled as a safety net against mis-cabling and against devices that are not part of a port-channel. Cisco's guidance is to keep STP running on vPC pairs.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which server teaming mode works with two standalone switches and no special switch configuration?" The answer is active-backup (switch-independent). LACP and static IP-hash teaming require a port-channel on the switch side, which across two switches means vPC.</p></div>

<div class="scn"><h4>The bond that flapped every MAC in the rack</h4><p>A new sysadmin built database servers with <code>balance-rr</code> bonding (mode 0, round-robin per packet) cabled to two separate leaf switches that were not a vPC pair. Within minutes monitoring showed MAC move notifications on both leaves, TCP retransmissions on the database and slow queries. The network engineer ran <code>show mac address-table address</code> for the server MAC on both leaves and saw it bouncing between the server port and the inter-switch link. The fix for that week was to change the bonds to <code>active-backup</code>. The permanent fix was to rebuild the leaves as a vPC pair and move the bonds to <code>802.3ad</code>.</p><p><b>Lesson:</b> the server's bonding mode and the switch configuration must match; "both NICs active" only works over a port-channel.</p></div>

<div class="iv"><p class="q">"Why can't a server just send on both NICs to two different switches?"</p><p>Strong answer: because the network then sees the same source MAC on two ports that are connected to each other, which causes MAC flapping, and redundant links between the switches create a loop that STP must block. Only switch-independent teaming such as active-backup is safe to two standalone switches. To use both links you need a port-channel, and to span two switches you need multi-chassis EtherChannel such as vPC. Mention the Linux mode names (active-backup vs 802.3ad) to show hands-on experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet frames have no TTL, so a Layer 2 loop becomes a broadcast storm and MAC flapping.</li>
<li>STP prevents loops by blocking redundant ports, leaving bandwidth idle and adding convergence events.</li>
<li>Switch-independent teaming (active-backup) is safe but uses one NIC at a time.</li>
<li>Any mode where both NICs send for the same MAC (802.3ad, balance-xor, IP hash) needs a port-channel upstream.</li>
<li>The fix is to make many links look like one: a port-channel, and across two switches, vPC.</li>
</ul></div>
`,hi:`
<p>Ek chhote shehar ki kalpana karo jismein nadi par do pul hain. Nagar parishad ko darr hai ki traffic gol gol ghoomta rahega, isliye woh ek pul ko barrier se band kar deti hai aur use tabhi kholti hai jab doosra pul gir jaaye. Sab safe hain, par har din aadhe pul khaali khade rehte hain. <b>Spanning tree</b> redundant Ethernet links ke saath yahi karta hai, aur yahi problem yeh chapter samjhata hai.</p>

<h3>Layer 2 loops jaanleva kyun hain</h3>
<p>IP packet mein <b>TTL</b> (time to live) field hota hai jise router har hop par kam karte hain; loop mein ghoomta packet zyada se zyada 255 hops ke baad mar jaata hai. <b>Ethernet frame mein TTL nahi hota</b>. Agar broadcast frame (jaise ARP request) loop mein ghus jaaye, to har switch use har port se flood karta hai, copies badhti jaati hain, aur kuch hi seconds mein links saturate ho jaate hain. Ise <b>broadcast storm</b> kehte hain. Saath hi switches same source MAC ko alag alag ports par aate dekhte hain aur apni MAC table baar baar likhte rehte hain, ise <b>MAC flapping</b> kehte hain. CPUs upar chale jaate hain aur poora VLAN kaam karna band kar deta hai.</p>

<h3>Spanning tree iske baare mein kya karta hai</h3>
<p><b>Spanning Tree Protocol (STP)</b>, aur uske tez versions <b>Rapid PVST+</b> aur <b>MST</b>, ek <b>root bridge</b> elect karte hain, har switch se root tak best path calculate karte hain, aur har redundant port ko <b>blocking</b> (discarding) state mein daal dete hain. Result ek loop-free tree hai. Keemat yeh hai ki blocked links koi user traffic nahi le jaate.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="STP do uplinks mein se ek block karta hai">
<rect x="90" y="20" width="160" height="42" rx="8" fill="#ddd6fe"/><text x="170" y="46" text-anchor="middle" class="svg-ink" font-size="13">AGG1 (root)</text>
<rect x="390" y="20" width="160" height="42" rx="8" fill="#ddd6fe"/><text x="470" y="46" text-anchor="middle" class="svg-ink" font-size="13">AGG2</text>
<line x1="250" y1="41" x2="390" y2="41" stroke="#64748b" stroke-width="3"/>
<rect x="240" y="150" width="160" height="42" rx="8" fill="#bae6fd"/><text x="320" y="176" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-01</text>
<line x1="170" y1="62" x2="280" y2="150" stroke="#64748b" stroke-width="3"/><text x="160" y="115" class="svg-muted" font-size="12">Eth1/49 FWD</text>
<line x1="470" y1="62" x2="360" y2="150" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="420" y="115" class="svg-accent" font-size="12">Eth1/50 BLK</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">Triangle = loop, isliye ek side block karni padti hai</text>
</svg><p class="cap">Do uplinks khareede aur cable kiye gaye, par STP har VLAN ke liye sirf ek ko forward karne deta hai.</p></div>

<pre class="out">ACCESS-01# show spanning-tree vlan 10
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/49          Root FWD 2         128.49   P2p
<span class="hl">Eth1/50          Altn BLK 2         128.50   P2p</span></pre>

<h3>STP par depend karne ki teen keematein</h3>
<ul>
<li><b>Khaali bandwidth.</b> Jo uplink capacity aapne khareedi uska aadha hissa tab tak bekaar padha rehta hai jab tak kuch fail na ho. Aap VLANs aise baant sakte ho ki kuch left par forward karein aur kuch right par (per-VLAN load balancing), par koi bhi ek VLAN phir bhi ek hi link use karta hai.</li>
<li><b>Convergence events.</b> Jab forwarding link fail hota hai, alternate port ko forwarding mein jaana padta hai. Rapid PVST+ point-to-point links par yeh ek second se kaafi kam mein karta hai; purana 802.1D 30 se 50 second leta tha. Har topology change <b>MAC tables flush</b> bhi karta hai, isliye thodi der traffic flood hota hai.</li>
<li><b>Nazuk-pan.</b> STP ek safety net hai jise perfectly configure karna padta hai. Galat root, unidirectional link ya BPDUs bhejna band karne wala switch asli loop bana sakta hai.</li>
</ul>

<h3>Wahi problem, server ke andar: NIC teaming</h3>
<p>Do NICs wale server ke saamne bhi yahi sawaal hai: network ko confuse kiye bina do cables kaise use karun? Operating systems kai <b>teaming</b> (Windows, VMware) ya <b>bonding</b> (Linux) modes dete hain. Linux ke naam sabse precise hain, isliye hum wahi use karte hain:</p>
<table class="cmp"><tr><th>Linux bonding mode</th><th>Kaise bhejta hai</th><th>Switch side</th><th>Dono links forward?</th></tr>
<tr><td><b>active-backup</b> (mode 1)</td><td>Ek NIC active, doosra intezaar karta hai</td><td>Kuch special nahi; do independent switches tak chalta hai</td><td>Nahi</td></tr>
<tr><td><b>balance-tlb / balance-alb</b> (modes 5 aur 6)</td><td>Outbound traffic baant-ta hai; alb inbound baantne ke liye ARP ke saath trick bhi karta hai</td><td>Kuch special nahi</td><td>Kuch had tak, side effects ke saath</td></tr>
<tr><td><b>balance-xor</b> (mode 2)</td><td>Dono NICs par per flow hash</td><td>Static port-channel (mode on) chahiye</td><td>Haan, ek switch ya vPC</td></tr>
<tr><td><b>802.3ad</b> (mode 4)</td><td>LACP bundle, per flow hash</td><td>LACP port-channel chahiye</td><td>Haan, ek switch ya vPC</td></tr>
</table>
<p>VMware mein bhi yahi bantwara hai: <b>route based on originating virtual port</b> (default) do independent switches ke saath chalta hai par har VM ko ek uplink par pin kar deta hai; <b>route based on IP hash</b> ko static port-channel chahiye; <b>LACP</b> ko distributed switch aur upstream LACP port-channel chahiye.</p>
<p>Yahan key point hai. Har woh mode jismein <b>dono links same MAC ke liye traffic le jaate hain</b>, upstream side ko <b>ek port-channel</b> hona zaroori hai. Agar dono NICs do normal switches par aate hain, to sirf "switch-independent" modes safe hain, aur woh aapko active/standby behaviour ya side effects wali tricks dete hain.</p>

<div class="eg"><p><b>Worked example.</b> SRV1 ka eth0 NX1 par aur eth1 NX2 par hai, aur admin switches par koi port-channel banaye bina <code>balance-xor</code> chun leta hai. Ab SRV1 ka MAC kuch flows ke liye NX1 Ethernet1/3 par aur kuch ke liye NX2 Ethernet1/3 par dikhta hai. Har switch MAC seekhta hai, phir frames switches ke beech wale link ko cross karte hain aur har switch use inter-switch port par dobara seekhta hai. MAC second mein darjanon baar flap karta hai, NX-OS apne L2FM process se MAC move messages log karta hai (exact wording platform aur release ke hisaab se badalti hai) aur SRV1 ke replies galat NIC par aate hain. Fix ya to active-backup hai (safe par aadhi bandwidth) ya asli port-channel jo dono switches tak faile: vPC.</p></div>

<h3>Solution principle mein</h3>
<p>Agar hum kai physical links ko <b>ek logical link</b> jaisa dikha dein, to STP ko ek port dikhta hai, block karne ko kuch nahi bachta, aur server ka hash saare members use kar sakta hai. Woh logical link <b>port-channel</b> hai (chapter 3). Agar hum do switches ko <b>ek LACP partner</b> jaisa dikha dein, to logical link do chassis tak bhi fail sakta hai. Woh <b>vPC</b> hai (chapter 4 se aage).</p>

<div class="warn"><p><b>Common galti.</b> "vPC loops sambhal leta hai" soch kar spanning tree band kar dena. vPC block karne ki zaroorat hatata hai, par STP ko mis-cabling aur un devices ke khilaaf safety net ki tarah enabled rehna chahiye jo port-channel ka hissa nahi hain. Cisco ki guidance hai ki vPC pairs par STP chalta rahe.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa server teaming mode do standalone switches ke saath bina kisi special switch configuration ke chalta hai?" Jawab active-backup hai (switch-independent). LACP aur static IP-hash teaming ko switch side par port-channel chahiye, jo do switches ke across ka matlab vPC hai.</p></div>

<div class="scn"><h4>Woh bond jisne rack ka har MAC flap karwa diya</h4><p>Ek naye sysadmin ne database servers <code>balance-rr</code> bonding (mode 0, per packet round-robin) ke saath banaye, jo do alag leaf switches se cabled the jo vPC pair nahi the. Kuch minute mein monitoring ne dono leaves par MAC move notifications, database par TCP retransmissions aur slow queries dikhayi. Network engineer ne dono leaves par server MAC ke liye <code>show mac address-table address</code> chalaya aur use server port aur inter-switch link ke beech uchhalte dekha. Us hafte ka fix bonds ko <code>active-backup</code> karna tha. Permanent fix leaves ko vPC pair ke roop mein dobara banana aur bonds ko <code>802.3ad</code> par le jaana tha.</p><p><b>Seekh:</b> server ka bonding mode aur switch configuration match hone chahiye; "dono NICs active" sirf port-channel ke upar chalta hai.</p></div>

<div class="iv"><p class="q">"Server do alag switches ki taraf dono NICs par seedha kyun nahi bhej sakta?"</p><p>Strong answer: kyunki tab network ko same source MAC do aise ports par dikhta hai jo aapas mein jude hain, jisse MAC flapping hoti hai, aur switches ke beech redundant links loop banate hain jise STP ko block karna padta hai. Do standalone switches tak sirf active-backup jaisi switch-independent teaming safe hai. Dono links use karne ke liye port-channel chahiye, aur do switches tak failane ke liye vPC jaisa multi-chassis EtherChannel chahiye. Hands-on experience dikhane ke liye Linux mode ke naam lo (active-backup vs 802.3ad).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet frames mein TTL nahi hota, isliye Layer 2 loop broadcast storm aur MAC flapping ban jaata hai.</li>
<li>STP redundant ports block karke loops rokta hai, jisse bandwidth khaali rehti hai aur convergence events aate hain.</li>
<li>Switch-independent teaming (active-backup) safe hai par ek samay mein ek NIC use karti hai.</li>
<li>Jis mode mein dono NICs same MAC ke liye bhejte hain (802.3ad, balance-xor, IP hash), use upstream port-channel chahiye.</li>
<li>Fix hai kai links ko ek jaisa dikhana: port-channel, aur do switches ke across, vPC.</li>
</ul></div>
`}};export{e as default};