var e={id:`troubleshooting`,h:{en:`Troubleshooting with and of CDP and LLDP`,hi:`CDP aur LLDP se, aur CDP aur LLDP ki, troubleshooting`},body:{en:`
<p>A doctor uses a stethoscope to find problems in a patient, but sometimes the stethoscope itself is broken and the doctor hears nothing. Discovery protocols are the network engineer's stethoscope. This chapter covers both situations: using CDP and LLDP to find faults on a link, and fixing CDP and LLDP when a neighbour you expect is missing.</p>

<h3>Part 1: discovery finds the fault</h3>
<p>Because CDPv2 carries the <b>duplex</b> and <b>native VLAN</b> of the sending port, each switch compares them with its own settings and logs a warning when they differ. These two messages are some of the most useful free alarms in a Cisco network.</p>
<pre class="out">SW1#
<span class="hl">%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (1), with SW2 GigabitEthernet0/1 (99).</span>
<span class="hl">%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on GigabitEthernet0/1 (not full duplex), with SW2 GigabitEthernet0/1 (full duplex).</span></pre>
<p>Read them carefully. The first value belongs to the local port (native VLAN 1 on SW1 Gi0/1), the second to the neighbour (native VLAN 99 on SW2 Gi0/1). Either end may be the wrong one: check the design, then fix the port that differs.</p>
<ul>
<li><b>Native VLAN mismatch.</b> Untagged frames sent from VLAN 1 on SW1 arrive in VLAN 99 on SW2, so the two VLANs leak into each other and spanning tree may block the port for inconsistency. Fix with <code>switchport trunk native vlan 99</code> on the side that is wrong, as covered in the VLAN module.</li>
<li><b>Duplex mismatch.</b> One side half, one side full: the link comes up but late collisions and CRC errors grow and throughput collapses under load. Fix by setting both ends to auto, or both to the same fixed speed and duplex, as covered in the interfaces module.</li>
</ul>
<p>Other clues: <code>show cdp neighbors detail</code> shows the neighbour's VTP domain, so a typo in a domain name is visible from either side; and a neighbour on the wrong port instantly reveals a patching mistake before any traffic is lost.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Missing neighbour workflow">
<rect x="200" y="10" width="240" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Neighbour missing</text>
<rect x="30" y="66" width="270" height="36" rx="8" fill="#bae6fd"/><text x="165" y="89" text-anchor="middle" class="svg-ink" font-size="13">1. Interface up/up both ends?</text>
<rect x="340" y="66" width="270" height="36" rx="8" fill="#bae6fd"/><text x="475" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Global: cdp run / lldp run?</text>
<rect x="30" y="122" width="270" height="36" rx="8" fill="#bae6fd"/><text x="165" y="145" text-anchor="middle" class="svg-ink" font-size="13">3. Interface: enable / tx / rx?</text>
<rect x="340" y="122" width="270" height="36" rx="8" fill="#bae6fd"/><text x="475" y="145" text-anchor="middle" class="svg-ink" font-size="13">4. Far end sends the same protocol?</text>
<rect x="30" y="178" width="270" height="36" rx="8" fill="#bae6fd"/><text x="165" y="201" text-anchor="middle" class="svg-ink" font-size="13">5. Anything in between?</text>
<rect x="340" y="178" width="270" height="36" rx="8" fill="#bae6fd"/><text x="475" y="201" text-anchor="middle" class="svg-ink" font-size="13">6. Counters: show cdp/lldp traffic</text>
<rect x="160" y="240" width="320" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="13">Stale or late entry? Wait holdtime or clear table</text>
<line x1="320" y1="46" x2="165" y2="66" stroke="#64748b"/><line x1="320" y1="46" x2="475" y2="66" stroke="#64748b"/>
</svg><p class="cap">Work from the cable up: physical link, global switch, interface switch, the far end, the path between, then the counters.</p></div>

<h3>Part 2: the neighbour you expect is missing</h3>
<ol>
<li><b>Is the link up?</b> <code>show ip interface brief</code> or <code>show interfaces status</code>. No link, no discovery.</li>
<li><b>Is the protocol running?</b> <code>show cdp</code> or <code>show lldp</code>. "% CDP is not enabled" or "% LLDP is not enabled" means the global command is missing. Remember LLDP is off by default.</li>
<li><b>Is it enabled on this port?</b> <code>show cdp interface g0/1</code> (the port is missing if <code>no cdp enable</code>) or <code>show lldp interface g0/1</code> (look at Tx and Rx).</li>
<li><b>Does the far end send the same protocol?</b> You see a neighbour only if <b>it transmits</b> and <b>you receive</b>. A PC, a firewall or a server without an agent sends nothing.</li>
<li><b>Is something in between?</b> A media converter or transparent device can drop discovery frames; an unmanaged switch floods CDP and shows several neighbours on one port.</li>
<li><b>Are frames moving?</b> Run <code>show cdp traffic</code> or <code>show lldp traffic</code> twice; input and output counters should rise.</li>
</ol>
<p>The opposite symptom, a neighbour that should be <b>gone</b> but is still listed, is almost always holdtime: the entry stays up to 180 seconds (CDP) or 120 seconds (LLDP) after the last frame. Wait, or use <code>clear cdp table</code> / <code>clear lldp table</code>.</p>

<h3>Walking through this module's labs</h3>
<table class="cmp"><tr><th>Symptom in the lab</th><th>Cause</th><th>What to do</th></tr>
<tr><td>PC1 and PC2 never appear on SW1</td><td>PCs do not run CDP</td><td>Nothing: expected. Use the MAC table.</td></tr>
<tr><td>SW2 still lists R2 after <code>no cdp run</code></td><td>Holdtime from R2's last frame</td><td>Wait or <code>clear cdp table</code> on SW2</td></tr>
<tr><td>"% LLDP is not enabled" on SW1</td><td>LLDP off by default</td><td><code>lldp run</code> on R1, SW1 and SW2</td></tr>
<tr><td>SW2 cannot see R1 in LLDP</td><td>Not directly connected</td><td>Read R1's management address from SW1's detail</td></tr>
<tr><td>Kiosk port shows no neighbour and Tx/Rx disabled</td><td>The security task worked</td><td>Confirm with <code>show lldp interface g0/5</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> SW1 lists SW2 in <code>show lldp neighbors</code>, but SW2 does not list SW1. Links are up and <code>lldp run</code> is on both. Because SW1 hears SW2, SW2 is transmitting and SW1 is receiving. The failing direction is SW1 to SW2: either SW1 Gi0/1 has <code>no lldp transmit</code> or SW2 Gi0/1 has <code>no lldp receive</code>. <code>show lldp interface g0/1</code> on SW1 shows "Tx: disabled". Enter <code>lldp transmit</code> and within 30 seconds SW2 lists SW1.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Treating a missing CDP neighbour as a cabling fault when the far device is simply non-Cisco or has CDP off. (2) Ignoring the native VLAN mismatch log because "the link works". (3) Fixing the wrong end of a mismatch: always compare with the design, not with whichever switch you logged in to first.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <code>%CDP-4-NATIVE_VLAN_MISMATCH</code> and <code>%CDP-4-DUPLEX_MISMATCH</code> messages come from <b>CDP</b>, not from STP, DTP or LLDP. If CDP is disabled on the link, these warnings disappear even though the mismatch is still there.</p></div>

<div class="scn"><h4>The trunk that leaked two VLANs</h4><p>Users in VLAN 1 on one floor started receiving DHCP offers meant for the management VLAN 99. Logs on the distribution switch showed <code>%CDP-4-NATIVE_VLAN_MISMATCH</code> on the uplink every minute: the distribution side had <code>switchport trunk native vlan 99</code> from a new standard, the access switch still used 1. Untagged traffic was crossing between the two VLANs. Setting native VLAN 99 on the access uplink stopped both the leak and the log messages.</p><p><b>Lesson:</b> a repeating CDP mismatch log is a real fault report, not noise.</p></div>

<div class="iv"><p class="q">"You expect to see a neighbour in show cdp neighbors but it is not there. How do you troubleshoot?"</p><p>Give the ordered workflow: link up on both ends, CDP running globally on both, enabled on both interfaces, far end actually a CDP speaker (otherwise use LLDP), nothing in between filtering or flooding, counters in <code>show cdp traffic</code> increasing. Mention holdtime for entries that linger, and that the mismatch syslogs are a separate benefit of CDP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CDPv2 raises <code>%CDP-4-NATIVE_VLAN_MISMATCH</code> and <code>%CDP-4-DUPLEX_MISMATCH</code>; the first value is local, the second the neighbour's.</li>
<li>Missing neighbour: link, global, interface, far end, path, counters.</li>
<li>You see a neighbour only if it transmits and you receive; one-sided views point to one direction.</li>
<li>Lingering entries are holdtime; wait or clear the table.</li>
<li>PCs, many servers and firewalls do not appear because they do not send discovery frames.</li>
</ul></div>
`,hi:`
<p>Doctor patient ki problem dhoondhne ke liye stethoscope use karta hai, lekin kabhi-kabhi stethoscope khud kharab hota hai aur doctor ko kuch sunai nahi deta. Discovery protocols network engineer ka stethoscope hain. Yeh chapter dono situations cover karta hai: link par faults dhoondhne ke liye CDP aur LLDP use karna, aur jab expected neighbour missing ho tab CDP aur LLDP ko theek karna.</p>

<h3>Part 1: discovery fault dhoondhti hai</h3>
<p>Kyunki CDPv2 bhejne wale port ka <b>duplex</b> aur <b>native VLAN</b> carry karta hai, har switch inhe apni settings se compare karta hai aur farak hone par warning log karta hai. Yeh do messages Cisco network ke sabse useful free alarms mein se hain.</p>
<pre class="out">SW1#
<span class="hl">%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (1), with SW2 GigabitEthernet0/1 (99).</span>
<span class="hl">%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on GigabitEthernet0/1 (not full duplex), with SW2 GigabitEthernet0/1 (full duplex).</span></pre>
<p>Inhe dhyan se padho. Pehli value local port ki hai (SW1 Gi0/1 par native VLAN 1), doosri neighbour ki (SW2 Gi0/1 par native VLAN 99). Galat koi bhi end ho sakta hai: design check karo, phir jo port alag hai use theek karo.</p>
<ul>
<li><b>Native VLAN mismatch.</b> SW1 par VLAN 1 se bheje gaye untagged frames SW2 par VLAN 99 mein pahunchte hain, isliye dono VLANs ek doosre mein leak hote hain aur spanning tree inconsistency ki wajah se port block kar sakta hai. Galat side par <code>switchport trunk native vlan 99</code> se fix karo, jaise VLAN module mein padha.</li>
<li><b>Duplex mismatch.</b> Ek side half, ek side full: link up aata hai lekin late collisions aur CRC errors badhte hain aur load par throughput gir jaata hai. Dono ends ko auto par, ya dono ko same fixed speed aur duplex par set karke fix karo, jaise interfaces module mein padha.</li>
</ul>
<p>Aur clues: <code>show cdp neighbors detail</code> neighbour ka VTP domain dikhata hai, isliye domain name ka typo kisi bhi side se dikh jaata hai; aur galat port par neighbour dikhna koi traffic khone se pehle hi patching ki galti bata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Missing neighbour workflow">
<rect x="200" y="10" width="240" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Neighbour missing</text>
<rect x="30" y="66" width="270" height="36" rx="8" fill="#bae6fd"/><text x="165" y="89" text-anchor="middle" class="svg-ink" font-size="13">1. Dono ends par interface up/up?</text>
<rect x="340" y="66" width="270" height="36" rx="8" fill="#bae6fd"/><text x="475" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Global: cdp run / lldp run?</text>
<rect x="30" y="122" width="270" height="36" rx="8" fill="#bae6fd"/><text x="165" y="145" text-anchor="middle" class="svg-ink" font-size="13">3. Interface: enable / tx / rx?</text>
<rect x="340" y="122" width="270" height="36" rx="8" fill="#bae6fd"/><text x="475" y="145" text-anchor="middle" class="svg-ink" font-size="13">4. Far end same protocol bhejta hai?</text>
<rect x="30" y="178" width="270" height="36" rx="8" fill="#bae6fd"/><text x="165" y="201" text-anchor="middle" class="svg-ink" font-size="13">5. Beech mein kuch hai?</text>
<rect x="340" y="178" width="270" height="36" rx="8" fill="#bae6fd"/><text x="475" y="201" text-anchor="middle" class="svg-ink" font-size="13">6. Counters: show cdp/lldp traffic</text>
<rect x="160" y="240" width="320" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="13">Stale ya late entry? Holdtime wait ya table clear</text>
<line x1="320" y1="46" x2="165" y2="66" stroke="#64748b"/><line x1="320" y1="46" x2="475" y2="66" stroke="#64748b"/>
</svg><p class="cap">Cable se upar ki taraf kaam karo: physical link, global switch, interface switch, far end, beech ka path, phir counters.</p></div>

<h3>Part 2: expected neighbour missing hai</h3>
<ol>
<li><b>Kya link up hai?</b> <code>show ip interface brief</code> ya <code>show interfaces status</code>. Link nahi, to discovery nahi.</li>
<li><b>Kya protocol chal raha hai?</b> <code>show cdp</code> ya <code>show lldp</code>. "% CDP is not enabled" ya "% LLDP is not enabled" ka matlab global command missing hai. Yaad rakho LLDP default off hai.</li>
<li><b>Kya is port par enabled hai?</b> <code>show cdp interface g0/1</code> (<code>no cdp enable</code> ho to port missing hota hai) ya <code>show lldp interface g0/1</code> (Tx aur Rx dekho).</li>
<li><b>Kya far end same protocol bhejta hai?</b> Neighbour tabhi dikhta hai jab <b>woh transmit kare</b> aur <b>aap receive karo</b>. PC, firewall ya bina agent wala server kuch nahi bhejta.</li>
<li><b>Kya beech mein kuch hai?</b> Media converter ya transparent device discovery frames drop kar sakta hai; unmanaged switch CDP flood karta hai aur ek port par kai neighbours dikhata hai.</li>
<li><b>Kya frames chal rahe hain?</b> <code>show cdp traffic</code> ya <code>show lldp traffic</code> do baar chalao; input aur output counters badhne chahiye.</li>
</ol>
<p>Ulta symptom, jo neighbour <b>chala jaana</b> chahiye tha woh ab bhi list mein hai, lagbhag hamesha holdtime hota hai: entry aakhri frame ke baad 180 seconds (CDP) ya 120 seconds (LLDP) tak rehti hai. Wait karo, ya <code>clear cdp table</code> / <code>clear lldp table</code> use karo.</p>

<h3>Is module ke labs ka walkthrough</h3>
<table class="cmp"><tr><th>Lab mein symptom</th><th>Cause</th><th>Kya karein</th></tr>
<tr><td>PC1 aur PC2 SW1 par kabhi nahi dikhte</td><td>PCs CDP nahi chalate</td><td>Kuch nahi: expected. MAC table use karo.</td></tr>
<tr><td><code>no cdp run</code> ke baad bhi SW2 R2 list karta hai</td><td>R2 ke aakhri frame ka holdtime</td><td>Wait karo ya SW2 par <code>clear cdp table</code></td></tr>
<tr><td>SW1 par "% LLDP is not enabled"</td><td>LLDP default off</td><td>R1, SW1 aur SW2 par <code>lldp run</code></td></tr>
<tr><td>SW2 LLDP mein R1 nahi dekh sakta</td><td>Directly connected nahi</td><td>SW1 ki detail se R1 ka management address padho</td></tr>
<tr><td>Kiosk port par koi neighbour nahi aur Tx/Rx disabled</td><td>Security task kaam kar gaya</td><td><code>show lldp interface g0/5</code> se confirm karo</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> SW1 <code>show lldp neighbors</code> mein SW2 list karta hai, lekin SW2 SW1 ko list nahi karta. Links up hain aur dono par <code>lldp run</code> on hai. Kyunki SW1 SW2 ko sunta hai, SW2 transmit kar raha hai aur SW1 receive kar raha hai. Fail hone wali direction SW1 se SW2 hai: ya to SW1 Gi0/1 par <code>no lldp transmit</code> hai ya SW2 Gi0/1 par <code>no lldp receive</code>. SW1 par <code>show lldp interface g0/1</code> "Tx: disabled" dikhata hai. <code>lldp transmit</code> daalo aur 30 seconds ke andar SW2 SW1 ko list karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Missing CDP neighbour ko cabling fault maan lena jabki door wala device bas non-Cisco hai ya uska CDP off hai. (2) Native VLAN mismatch log ko ignore karna kyunki "link to chal raha hai". (3) Mismatch ka galat end theek karna: hamesha design se compare karo, us switch se nahi jis par aapne pehle login kiya.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>%CDP-4-NATIVE_VLAN_MISMATCH</code> aur <code>%CDP-4-DUPLEX_MISMATCH</code> messages <b>CDP</b> se aate hain, STP, DTP ya LLDP se nahi. Agar link par CDP disabled hai, to yeh warnings gayab ho jaati hain jabki mismatch ab bhi hai.</p></div>

<div class="scn"><h4>Trunk jisne do VLANs leak kiye</h4><p>Ek floor par VLAN 1 ke users ko management VLAN 99 ke liye bane DHCP offers milne lage. Distribution switch ke logs uplink par har minute <code>%CDP-4-NATIVE_VLAN_MISMATCH</code> dikha rahe the: distribution side par naye standard se <code>switchport trunk native vlan 99</code> tha, access switch ab bhi 1 use kar raha tha. Untagged traffic dono VLANs ke beech cross ho raha tha. Access uplink par native VLAN 99 set karne se leak aur log messages dono ruk gaye.</p><p><b>Seekh:</b> baar-baar aane wala CDP mismatch log asli fault report hai, noise nahi.</p></div>

<div class="iv"><p class="q">"Aapko show cdp neighbors mein ek neighbour dikhne ki umeed hai lekin woh nahi hai. Kaise troubleshoot karoge?"</p><p>Ordered workflow do: dono ends par link up, dono par CDP globally chal raha hai, dono interfaces par enabled, far end sach mein CDP bolta hai (warna LLDP use karo), beech mein kuch filter ya flood nahi kar raha, <code>show cdp traffic</code> ke counters badh rahe hain. Rukne wali entries ke liye holdtime batao, aur yeh bhi ki mismatch syslogs CDP ka alag fayda hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CDPv2 <code>%CDP-4-NATIVE_VLAN_MISMATCH</code> aur <code>%CDP-4-DUPLEX_MISMATCH</code> deta hai; pehli value local, doosri neighbour ki.</li>
<li>Missing neighbour: link, global, interface, far end, path, counters.</li>
<li>Neighbour tabhi dikhta hai jab woh transmit kare aur aap receive karo; ek-taraf view ek direction ki taraf ishara karta hai.</li>
<li>Rukne wali entries holdtime hain; wait karo ya table clear karo.</li>
<li>PCs, kai servers aur firewalls nahi dikhte kyunki woh discovery frames nahi bhejte.</li>
</ul></div>
`}};export{e as default};