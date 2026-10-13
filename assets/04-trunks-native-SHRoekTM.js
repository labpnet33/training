var e={id:`trunks-native`,h:{en:`Trunks, 802.1Q tags and the native VLAN`,hi:`Trunks, 802.1Q tags aur native VLAN`},body:{en:`
<p>Return to the office building. Each floor (VLAN) has its own rooms, but the whole building shares one lift shaft. Every passenger wears a coloured badge saying which floor they belong to, so the lift can drop them at the right place. A <b>trunk</b> is that lift shaft: a single link between two switches that carries many VLANs at once. The coloured badge is the <b>IEEE 802.1Q tag</b>.</p>

<h3>The 802.1Q tag</h3>
<p>802.1Q inserts 4 bytes between the source MAC and the type field of the frame. Inside are a 16-bit tag protocol identifier (0x8100), 3 priority bits (used by CoS), 1 drop-eligible bit and the 12-bit <b>VLAN ID</b>. The receiving switch reads the ID and keeps the frame inside that VLAN. Hosts never see tags on access ports: the switch adds the tag when the frame enters a trunk and removes it when the frame leaves through an access port.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Trunk between ACC and CORE">
<rect x="20" y="30" width="100" height="34" rx="8" fill="#bae6fd"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="13">PC1 SALES</text>
<rect x="20" y="130" width="100" height="34" rx="8" fill="#bbf7d0"/><text x="70" y="152" text-anchor="middle" class="svg-ink" font-size="13">PC2 ENG</text>
<rect x="190" y="70" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="245" y="105" text-anchor="middle" class="svg-ink" font-size="14">ACC</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#fde68a"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<line x1="120" y1="47" x2="190" y2="88" stroke="#64748b" stroke-width="2"/><line x1="120" y1="147" x2="190" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="6"/>
<text x="400" y="88" text-anchor="middle" class="svg-accent" font-size="12">trunk: VLAN 10 + VLAN 20 tagged</text>
<text x="400" y="125" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0 on both ends</text>
<text x="120" y="80" class="svg-muted" font-size="12">untagged</text>
</svg><p class="cap">Access ports are untagged; the trunk carries tagged frames.</p></div>

<h3>Configuring a trunk</h3>
<p>In Lab 2 the access switch ACC already has a trunk. CORE is blank, so you build the matching end. Note that both ends must carry the same VLANs:</p>
<pre class="code"><span class="c"># on CORE</span>
set vlans SALES vlan-id 10
set vlans ENG vlan-id 20
set interfaces ge-0/0/0 unit 0 family ethernet-switching interface-mode trunk vlan members [ SALES ENG ]</pre>
<p>Only VLANs listed in <code>vlan members</code> cross the trunk. <code>vlan members all</code> allows every VLAN that exists. Real output of the trunk on CORE after commit:</p>
<pre class="out">lab@CORE&gt; show ethernet-switching interface ge-0/0/0 detail
Logical Interface          : ge-0/0/0.0
  State                    : up
  Interface mode           : trunk
  MAC addresses learned    : 0
  VLAN membership          :
    SALES                 10    <span class="hl">tagged</span>    Forwarding
    ENG                   20    <span class="hl">tagged</span>    Forwarding</pre>

<h3>The native VLAN</h3>
<p>Sometimes untagged frames arrive on a trunk: a management protocol, an old device, or a switch that sends its own control frames without a tag. The <b>native VLAN</b> tells the switch which VLAN these untagged frames belong to. On Junos a trunk has <b>no native VLAN by default</b>, so untagged frames arriving on it are dropped. You enable it on the physical interface:</p>
<pre class="code">set interfaces ge-0/0/0 native-vlan-id 99      <span class="c"># the numeric ID; the lab uses MGMT = 99</span>
set interfaces ge-0/0/0 native-vlan-id MGMT</pre>
<p>The <code>native-vlan-id</code> statement sits under the physical interface, not under <code>unit 0</code>. Frames of the native VLAN leave the trunk <b>untagged</b>; untagged arrivals are placed into that VLAN. The VLAN listed as native must also be in the member list of that trunk (or be covered by <code>members all</code>).</p>
<p>Both ends must agree. If ACC says native STAFF and CORE says native MGMT, an untagged frame sent by CORE in VLAN 99 arrives at ACC and is placed in VLAN 30. No log message tells you; traffic of both VLANs simply goes to the wrong place. The Lab 3 ticket is exactly this fault.</p>

<div class="eg"><p><b>Worked example.</b> CORE sends a frame from VLAN 99 (MGMT) across a trunk where MGMT is native. The frame leaves untagged. ACC receives an untagged frame on a trunk whose native VLAN is also 99, so it places the frame in VLAN 99 and the management ping works. For VLAN 30 the same trunk sends a frame with an 802.1Q tag 30, and ACC delivers it to VLAN 30.</p></div>

<table class="cmp"><tr><th>Symptom</th><th>Usual cause</th></tr>
<tr><td>One VLAN fails across the uplink, others work</td><td>VLAN missing from <code>vlan members</code> on one end</td></tr>
<tr><td>Untagged or management traffic fails</td><td>Native VLAN missing or different on the two ends</td></tr>
<tr><td>A PC on a port shows <code>tagged</code></td><td>Port set to <code>interface-mode trunk</code> by mistake</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Making a PC port a trunk: the PC sends untagged frames, and a trunk with no native VLAN drops them. Another: configuring the native VLAN on only one switch. A third: forgetting to create the VLAN on the second switch; a VLAN named in <code>vlan members</code> that does not exist is rejected at commit.</p></div>
<div class="exam"><p><b>Exam trap.</b> On Junos, access ports are untagged, trunk ports are tagged, and the native VLAN is optional and off by default. Do not assume it is VLAN 1 as on some other vendors.</p></div>

<div class="scn"><h4>Printers die after the weekend change</h4><p>Staff and printers lost connectivity at Hyderabad on Monday. The weekend change had moved the trunk's native VLAN to STAFF on the access switch only. Printer traffic was fine at the edge, but management frames from the core arrived untagged and landed in the wrong VLAN. The engineer compared <code>show ethernet-switching interface ge-0/0/0 detail</code> on both ends and saw different native VLANs.</p><p><b>Lesson:</b> compare both ends of every trunk before you look anywhere else.</p></div>

<div class="iv"><p class="q">"What is the native VLAN, and what happens if it does not match?"</p><p>It is the VLAN assigned to untagged frames on a trunk; on Junos it is not set by default. If the two ends differ, untagged frames are silently placed in different VLANs, which breaks management and any untagged traffic. Say that you verify with <code>show ethernet-switching interface detail</code> on both ends.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A trunk carries many VLANs; each frame carries a 12-bit 802.1Q tag.</li>
<li>Use <code>interface-mode trunk vlan members [ ... ]</code> under <code>family ethernet-switching</code>.</li>
<li>Junos trunks have no native VLAN by default; set <code>native-vlan-id</code> on the physical interface.</li>
<li>Both ends must agree on member VLANs and native VLAN.</li>
</ul></div>
`,hi:`
<p>Phir office building par aate hain. Har floor (VLAN) ke apne kamre hain, lekin poori building ek hi lift shaft share karti hai. Har passenger ek rangeen badge pehnta hai jo batata hai ki woh kis floor ka hai, taaki lift use sahi jagah utaare. <b>Trunk</b> wahi lift shaft hai: do switches ke beech ek hi link jo ek saath kai VLANs le jaata hai. Rangeen badge <b>IEEE 802.1Q tag</b> hai.</p>

<h3>802.1Q tag</h3>
<p>802.1Q frame mein source MAC aur type field ke beech 4 bytes daalta hai. Andar 16-bit tag protocol identifier (0x8100), 3 priority bits (CoS ke liye), 1 drop-eligible bit aur 12-bit <b>VLAN ID</b> hota hai. Receiving switch ID padhkar frame ko usi VLAN mein rakhta hai. Hosts ko access ports par tags kabhi nahi dikhte: switch frame ke trunk mein jaate waqt tag lagata hai aur access port se nikalte waqt hata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ACC aur CORE ke beech trunk">
<rect x="20" y="30" width="100" height="34" rx="8" fill="#bae6fd"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="13">PC1 SALES</text>
<rect x="20" y="130" width="100" height="34" rx="8" fill="#bbf7d0"/><text x="70" y="152" text-anchor="middle" class="svg-ink" font-size="13">PC2 ENG</text>
<rect x="190" y="70" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="245" y="105" text-anchor="middle" class="svg-ink" font-size="14">ACC</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#fde68a"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<line x1="120" y1="47" x2="190" y2="88" stroke="#64748b" stroke-width="2"/><line x1="120" y1="147" x2="190" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="6"/>
<text x="400" y="88" text-anchor="middle" class="svg-accent" font-size="12">trunk: VLAN 10 + VLAN 20 tagged</text>
<text x="400" y="125" text-anchor="middle" class="svg-muted" font-size="12">dono ends par ge-0/0/0</text>
<text x="120" y="80" class="svg-muted" font-size="12">untagged</text>
</svg><p class="cap">Access ports untagged hain; trunk tagged frames le jaata hai.</p></div>

<h3>Trunk configure karna</h3>
<p>Lab 2 mein access switch ACC par trunk pehle se hai. CORE khaali hai, isliye aap matching end banate ho. Dhyan rahe ki dono ends par same VLANs hone chahiye:</p>
<pre class="code"><span class="c"># on CORE</span>
set vlans SALES vlan-id 10
set vlans ENG vlan-id 20
set interfaces ge-0/0/0 unit 0 family ethernet-switching interface-mode trunk vlan members [ SALES ENG ]</pre>
<p>Sirf <code>vlan members</code> mein likhe VLANs trunk paar karte hain. <code>vlan members all</code> har maujood VLAN ko allow karta hai. Commit ke baad CORE par trunk ka real output:</p>
<pre class="out">lab@CORE&gt; show ethernet-switching interface ge-0/0/0 detail
Logical Interface          : ge-0/0/0.0
  State                    : up
  Interface mode           : trunk
  MAC addresses learned    : 0
  VLAN membership          :
    SALES                 10    <span class="hl">tagged</span>    Forwarding
    ENG                   20    <span class="hl">tagged</span>    Forwarding</pre>

<h3>Native VLAN</h3>
<p>Kabhi trunk par untagged frames aate hain: koi management protocol, purana device, ya aisa switch jo apne control frames bina tag ke bhejta hai. <b>Native VLAN</b> switch ko batata hai ki ye untagged frames kis VLAN ke hain. Junos par trunk ka <b>default mein koi native VLAN nahi</b> hota, isliye us par aane wale untagged frames drop ho jaate hain. Aap ise physical interface par enable karte ho:</p>
<pre class="code">set interfaces ge-0/0/0 native-vlan-id 99      <span class="c"># numeric ID; lab mein MGMT = 99</span>
set interfaces ge-0/0/0 native-vlan-id MGMT</pre>
<p><code>native-vlan-id</code> statement physical interface ke neeche aata hai, <code>unit 0</code> ke neeche nahi. Native VLAN ke frames trunk se <b>untagged</b> nikalte hain; untagged aane wale frames usi VLAN mein jaate hain. Native VLAN us trunk ki member list mein bhi hona chahiye (ya <code>members all</code> use karo).</p>
<p>Dono ends ka match hona zaroori hai. ACC kahe native STAFF aur CORE kahe native MGMT, to CORE ka VLAN 99 ka untagged frame ACC par VLAN 30 mein chala jaata hai. Koi log message nahi batata; dono VLANs ka traffic bas galat jagah jaata hai. Lab 3 ka ticket bilkul yahi fault hai.</p>

<div class="eg"><p><b>Worked example.</b> CORE VLAN 99 (MGMT) ka frame us trunk par bhejta hai jahan MGMT native hai. Frame untagged nikalta hai. ACC ko trunk par untagged frame milta hai jiska native VLAN bhi 99 hai, isliye woh frame VLAN 99 mein rakhta hai aur management ping chalta hai. VLAN 30 ke liye wahi trunk 802.1Q tag 30 ke saath frame bhejta hai aur ACC use VLAN 30 mein deliver karta hai.</p></div>

<table class="cmp"><tr><th>Symptom</th><th>Aam wajah</th></tr>
<tr><td>Uplink ke paar ek VLAN fail, baaki theek</td><td>Ek end par woh VLAN <code>vlan members</code> mein nahi</td></tr>
<tr><td>Untagged ya management traffic fail</td><td>Native VLAN missing ya dono ends par alag</td></tr>
<tr><td>Port par PC <code>tagged</code> dikhata hai</td><td>Galti se port <code>interface-mode trunk</code> par set hai</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> PC port ko trunk banana: PC untagged frames bhejta hai, aur bina native VLAN wala trunk unhe drop karta hai. Doosri: native VLAN sirf ek switch par configure karna. Teesri: doosre switch par VLAN banana bhool jaana; <code>vlan members</code> mein aisa VLAN jo exist nahi karta, commit par reject hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos par access ports untagged, trunk ports tagged hote hain, aur native VLAN optional hai aur default mein off. Doosre vendors ki tarah yeh maan mat lo ki woh VLAN 1 hai.</p></div>

<div class="scn"><h4>Weekend change ke baad printers band</h4><p>Hyderabad mein Monday ko staff aur printers ka connectivity gaya. Weekend change ne sirf access switch par trunk ka native VLAN STAFF kar diya tha. Edge par printer traffic theek tha, lekin core se aaye management frames untagged pahunchte the aur galat VLAN mein jaate the. Engineer ne dono ends par <code>show ethernet-switching interface ge-0/0/0 detail</code> compare kiya aur alag native VLANs dekhe.</p><p><b>Lesson:</b> kuch aur dekhne se pehle har trunk ke dono ends compare karo.</p></div>

<div class="iv"><p class="q">"Native VLAN kya hai, aur match na kare to kya hota hai?"</p><p>Yeh trunk par untagged frames ko diya gaya VLAN hai; Junos par yeh default mein set nahi hota. Dono ends alag hon to untagged frames chupchaap alag VLANs mein jaate hain, jisse management aur koi bhi untagged traffic toot jaata hai. Batao ki aap dono ends par <code>show ethernet-switching interface detail</code> se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunk kai VLANs le jaata hai; har frame par 12-bit 802.1Q tag hota hai.</li>
<li><code>family ethernet-switching</code> ke neeche <code>interface-mode trunk vlan members [ ... ]</code> use karo.</li>
<li>Junos trunks par default native VLAN nahi hota; physical interface par <code>native-vlan-id</code> set karo.</li>
<li>Dono ends par member VLANs aur native VLAN match hone chahiye.</li>
</ul></div>
`}};export{e as default};