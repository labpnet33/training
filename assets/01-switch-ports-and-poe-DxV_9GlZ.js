var e={id:`switch-ports-and-poe`,h:{en:`Switch ports and PoE: the ports table, speed, tags and powering access points`,hi:`Switch ports aur PoE: ports table, speed, tags aur access points ko power dena`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What a switch does and how a <b>port</b> is the unit you configure.</li>
<li>How to read the <b>Switch ports</b> page: name, enabled, type, VLAN, PoE, speed and tags.</li>
<li>What <b>PoE</b> is and why an access point can go offline because of one setting.</li>
<li>The big picture for the whole module: ports, VLANs, spanning tree and ACLs on SW-MUM, SW-BLR and SW-DEL.</li>
</ul>
<p><b>Prerequisites.</b> Basic IP and Ethernet. Earlier modules: <b>mk-start</b> (organization and networks) and <b>mk-mx</b> (VLANs, DHCP and the firewall on the MX). We do not repeat them here.</p>

<h3>The big picture: a switch is a building with numbered doors</h3>
<p>A <b>switch</b> connects devices inside one site and forwards Ethernet frames only to the port where the destination lives. Imagine an office block with numbered doors. The corridor between doors is the switch. Each door (<b>port</b>) can be locked or unlocked, can supply electricity, and belongs to a department (a VLAN). In a cloud-managed network you do not walk to the switch with a console cable: you edit the port in the dashboard and the change is pushed to the device. Click-ops, but you understand what each click does.</p>
<p>Bharat Retail Co has a core switch SW-MUM in Mumbai (it also has the routed interfaces for VLAN 10 and 20, covered in chapter 4) and branch switches SW-BLR and SW-DEL. Every switch has an <b>uplink</b> port to its MX, ports for an access point (AP), and ports for PCs and servers.</p>

<h3>Reading the ports table</h3>
<pre class="out">Switch ports  (device: SW-BLR, network: Bengaluru Branch)
Port  Name      Enabled  Type    VLAN / native  Allowed       PoE   Speed     Status        Tags
1     uplink    yes      trunk   native 99      10,20,30,99   off   1 Gbps    connected     uplink
2     AP-BLR    yes      trunk   native 99      10,30,99      on    1 Gbps    connected     ap
3     PC-BLR    yes      access  VLAN 10        -             off   100 Mbps  connected     staff
4     SRV-BLR   yes      access  VLAN 20        -             off   1 Gbps    connected     server
5     spare     <span class="hl">no</span>       access  VLAN 10        -             off   -         disabled</pre>
<p>Column by column:</p>
<ul>
<li><b>Name</b>: a label for humans. Name what is plugged in; it makes the dashboard readable.</li>
<li><b>Enabled</b>: an administratively disabled port carries nothing, no matter what is plugged in. It is the safest way to secure unused doors.</li>
<li><b>Type</b>: <b>access</b> (one VLAN, untagged) or <b>trunk</b> (many VLANs, tagged). The next chapter explains both.</li>
<li><b>PoE</b> (power over Ethernet): the port sends electricity over the cable so a device needs no power adapter.</li>
<li><b>Speed</b>: the negotiated link speed, such as 100 Mbps or 1 Gbps. Both ends normally agree automatically. A low speed on a port that should run at 1 Gbps often means a bad cable or patch lead.</li>
<li><b>Status</b>: connected, disconnected, disabled or, later, err-disabled.</li>
<li><b>Tags</b>: free labels such as uplink, ap, staff. They let you filter and edit many ports at once. (Do not confuse them with <b>VLAN tags</b>, which are inside the frames.)</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SW-BLR ports and what is plugged in">
<rect x="150" y="20" width="340" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">ports 1 - 5</text>
<rect x="20" y="150" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="172" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text><text x="75" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 1 uplink</text>
<rect x="150" y="150" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="200" y="172" text-anchor="middle" class="svg-ink" font-size="13">AP-BLR</text><text x="200" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 2 PoE</text>
<rect x="270" y="150" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC-BLR</text><text x="320" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 3 VLAN 10</text>
<rect x="390" y="150" width="100" height="50" rx="8" fill="#fed7aa"/><text x="440" y="172" text-anchor="middle" class="svg-ink" font-size="13">SRV-BLR</text><text x="440" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 4 VLAN 20</text>
<rect x="510" y="150" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="565" y="172" text-anchor="middle" class="svg-ink" font-size="13">spare</text><text x="565" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 5 disabled</text>
<line x1="75" y1="150" x2="200" y2="80" stroke="#64748b" stroke-width="2"/><line x1="200" y1="150" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="440" y1="150" x2="390" y2="80" stroke="#64748b" stroke-width="2"/><line x1="565" y1="150" x2="470" y2="80" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Port numbers here are illustrative. Your lab page shows its own table.</p></div>

<h3>PoE and the access point</h3>
<p>An AP is usually mounted on a ceiling with only one cable. <b>PoE</b> lets the switch power it through that cable. If PoE is switched off on the port (or the port is disabled), the AP has no power and appears <b>offline</b> in the dashboard, though nothing is wrong with the wireless. For an AP to be online, the port must be enabled, PoE must be on, and the VLAN the AP uses to reach the dashboard must arrive on that port. Chapter 2 shows the VLAN part. A PC, a printer or a server does not need PoE, so leave it off there.</p>
<p>A switch has a limited <b>PoE budget</b>, the total watts it can supply. Plugging many powered devices can exceed it. The exact budget per model is in the vendor documentation.</p>

<div class="eg"><p><b>Worked example.</b> AP-BLR is offline at 11:30. SW-BLR is online, so the problem is behind it. The ports table shows port 2 with PoE <b>off</b>. Turning PoE on and saving powers the AP, it boots, reaches the dashboard and shows online within minutes. On the wire the change switches the electrical supply on that one port; no VLAN or policy changes.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Enabled changes whether the port forwards any frames. PoE changes whether the port supplies power. Name and tags are labels only. Saving pushes the change to the switch; a port you disable drops the link at once.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Disabling the uplink port by mistake (you can cut off the switch and everything behind it); leaving PoE on for ports with ordinary devices; editing the wrong switch in a multi-switch site; naming ports vaguely.</p></div>
<div class="exam"><p><b>Exam trap.</b> "AP is offline but the switch is online." Check the AP port: enabled, PoE on, VLAN right. Power comes before VLANs.</p></div>

<div class="scn"><h4>The dark ceiling AP</h4><p>After a cabling tidy-up at Delhi, AP-DEL went offline. SW-DEL was online. Port 2 was enabled but PoE was off because the new patch panel profile had reset it. Switching PoE on brought the AP back in minutes. The engineer then tagged the port ap to find such ports quickly.</p><p><b>Lesson:</b> check power first, then VLANs, then the AP itself.</p></div>

<div class="iv"><p class="q">"An access point is offline in the dashboard. What do you check on the switch?"</p><p>Strong answer: first whether the switch itself is online, then the AP port: enabled, PoE on, link status, and that the port VLAN or native VLAN matches the AP management VLAN, 99 in our design. Then the PoE budget.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A port is the unit you configure: name, enabled, type, VLANs, PoE, speed and tags.</li>
<li>Disabling unused ports is simple, effective security.</li>
<li>PoE powers devices like APs through the data cable.</li>
<li>A port tag is a label; a VLAN tag is inside the frame.</li>
<li>AP offline behind an online switch: check port enabled, PoE and VLAN.</li>
</ul></div>
`,hi:`
<h3>What you will learn</h3>
<ul>
<li>Switch kya karta hai aur <b>port</b> woh unit kaise hai jise aap configure karte ho.</li>
<li><b>Switch ports</b> page kaise padhte hain: name, enabled, type, VLAN, PoE, speed aur tags.</li>
<li><b>PoE</b> kya hai aur ek setting se access point offline kyun ho sakta hai.</li>
<li>Poore module ki big picture: SW-MUM, SW-BLR aur SW-DEL par ports, VLANs, spanning tree aur ACLs.</li>
</ul>
<p><b>Prerequisites.</b> Basic IP aur Ethernet. Pichhle modules: <b>mk-start</b> (organization aur networks) aur <b>mk-mx</b> (MX par VLANs, DHCP aur firewall). Unhe yahan dobara nahi samjhaate.</p>

<h3>Big picture: switch ek building hai jisme numbered darwaze hain</h3>
<p><b>Switch</b> ek site ke andar devices ko jodta hai aur Ethernet frames ko sirf us port par bhejta hai jahan destination hai. Ek office block socho jisme numbered darwaze hain. Darwaaza ke beech ka corridor switch hai. Har darwaza (<b>port</b>) lock ya unlock ho sakta hai, bijli de sakta hai, aur kisi department (VLAN) ka hota hai. Cloud-managed network mein aap console cable lekar switch tak nahi jaate: dashboard mein port edit karte ho aur change device tak push ho jaata hai. Click-ops, but you understand what each click does.</p>
<p>Bharat Retail Co ka Mumbai mein core switch SW-MUM hai (usme VLAN 10 aur 20 ke routed interfaces bhi hain, chapter 4 mein) aur branch switches SW-BLR aur SW-DEL. Har switch ka apne MX tak ek <b>uplink</b> port hai, access point (AP) ke liye ports, aur PCs aur servers ke liye ports.</p>

<h3>Ports table padhna</h3>
<pre class="out">Switch ports  (device: SW-BLR, network: Bengaluru Branch)
Port  Name      Enabled  Type    VLAN / native  Allowed       PoE   Speed     Status        Tags
1     uplink    yes      trunk   native 99      10,20,30,99   off   1 Gbps    connected     uplink
2     AP-BLR    yes      trunk   native 99      10,30,99      on    1 Gbps    connected     ap
3     PC-BLR    yes      access  VLAN 10        -             off   100 Mbps  connected     staff
4     SRV-BLR   yes      access  VLAN 20        -             off   1 Gbps    connected     server
5     spare     <span class="hl">no</span>       access  VLAN 10        -             off   -         disabled</pre>
<p>Column by column:</p>
<ul>
<li><b>Name</b>: insaano ke liye label. Jo plugged hai uska naam do; dashboard readable ho jaata hai.</li>
<li><b>Enabled</b>: administratively disabled port kuch carry nahi karta, chahe kuch bhi plugged ho. Unused darwaazon ko secure karne ka sabse safe tareeka.</li>
<li><b>Type</b>: <b>access</b> (ek VLAN, untagged) ya <b>trunk</b> (kai VLANs, tagged). Agla chapter dono samjhata hai.</li>
<li><b>PoE</b> (power over Ethernet): port cable par bijli bhejta hai, taaki device ko power adapter na chahiye.</li>
<li><b>Speed</b>: negotiated link speed, jaise 100 Mbps ya 1 Gbps. Dono ends aam taur par automatically agree karte hain. Jis port ko 1 Gbps par chalna chahiye wahan kam speed aksar kharab cable ya patch lead ka sanket hai.</li>
<li><b>Status</b>: connected, disconnected, disabled ya aage chalke err-disabled.</li>
<li><b>Tags</b>: free labels jaise uplink, ap, staff. Inse aap kai ports ko ek saath filter aur edit kar sakte ho. (Inhe <b>VLAN tags</b> se mat milao, jo frames ke andar hote hain.)</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SW-BLR ports aur kya plugged hai">
<rect x="150" y="20" width="340" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">ports 1 - 5</text>
<rect x="20" y="150" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="172" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text><text x="75" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 1 uplink</text>
<rect x="150" y="150" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="200" y="172" text-anchor="middle" class="svg-ink" font-size="13">AP-BLR</text><text x="200" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 2 PoE</text>
<rect x="270" y="150" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC-BLR</text><text x="320" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 3 VLAN 10</text>
<rect x="390" y="150" width="100" height="50" rx="8" fill="#fed7aa"/><text x="440" y="172" text-anchor="middle" class="svg-ink" font-size="13">SRV-BLR</text><text x="440" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 4 VLAN 20</text>
<rect x="510" y="150" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="565" y="172" text-anchor="middle" class="svg-ink" font-size="13">spare</text><text x="565" y="188" text-anchor="middle" class="svg-muted" font-size="12">port 5 disabled</text>
<line x1="75" y1="150" x2="200" y2="80" stroke="#64748b" stroke-width="2"/><line x1="200" y1="150" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="440" y1="150" x2="390" y2="80" stroke="#64748b" stroke-width="2"/><line x1="565" y1="150" x2="470" y2="80" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Port numbers yahan illustrative hain. Aapke lab page par apni table dikhegi.</p></div>

<h3>PoE aur access point</h3>
<p>AP aam taur par ceiling par sirf ek cable ke saath lagta hai. <b>PoE</b> switch ko usi cable se use power dene deta hai. Agar port par PoE off hai (ya port disabled hai), to AP ko power nahi milti aur dashboard mein woh <b>offline</b> dikhta hai, jabki wireless mein kuch galat nahi. AP online hone ke liye port enabled ho, PoE on ho, aur jis VLAN se AP dashboard tak pahunchta hai woh us port par aani chahiye. VLAN wala hissa chapter 2 mein hai. PC, printer ya server ko PoE nahi chahiye, to wahan off rakho.</p>
<p>Switch ka ek limited <b>PoE budget</b> hota hai, yaani total watts jo woh de sakta hai. Bahut saare powered devices lagane se yeh exceed ho sakta hai. Har model ka exact budget vendor documentation mein hai.</p>

<div class="eg"><p><b>Worked example.</b> AP-BLR 11:30 par offline hai. SW-BLR online hai, to problem uske peeche hai. Ports table mein port 2 par PoE <b>off</b> hai. PoE on karke save karne se AP ko power milti hai, woh boot hota hai, dashboard tak pahunchta hai aur kuch minutes mein online dikhta hai. Wire par change sirf us ek port ki electrical supply on karta hai; koi VLAN ya policy nahi badalti.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Enabled badalta hai ki port koi frame forward karega ya nahi. PoE badalta hai ki port power dega ya nahi. Name aur tags sirf labels hain. Save karne se change switch tak push hota hai; jo port aap disable karte ho uska link turant gir jaata hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Galti se uplink port disable karna (switch aur uske peeche sab kat sakta hai); normal devices ke ports par PoE on chhodna; multi-switch site mein galat switch edit karna; ports ke vague naam.</p></div>
<div class="exam"><p><b>Exam trap.</b> "AP offline hai lekin switch online hai." AP port check karo: enabled, PoE on, VLAN sahi. Power VLANs se pehle aati hai.</p></div>

<div class="scn"><h4>Andhere ceiling ka AP</h4><p>Delhi mein cabling tidy-up ke baad AP-DEL offline ho gaya. SW-DEL online tha. Port 2 enabled tha lekin naye patch panel profile ne PoE reset karke off kar diya tha. PoE on karne se AP kuch minutes mein wapas aa gaya. Engineer ne phir port ko ap tag kiya taaki aise ports jaldi mil jaayein.</p><p><b>Seekh:</b> pehle power check karo, phir VLANs, phir AP khud.</p></div>

<div class="iv"><p class="q">"Dashboard mein access point offline hai. Switch par kya check karoge?"</p><p>Strong answer: pehle ki switch khud online hai, phir AP port: enabled, PoE on, link status, aur port VLAN ya native VLAN AP management VLAN se match karti hai, humare design mein 99. Phir PoE budget.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port configure hone wali unit hai: name, enabled, type, VLANs, PoE, speed aur tags.</li>
<li>Unused ports disable karna simple aur effective security hai.</li>
<li>PoE data cable se AP jaise devices ko power deta hai.</li>
<li>Port tag label hai; VLAN tag frame ke andar hota hai.</li>
<li>Online switch ke peeche AP offline: port enabled, PoE aur VLAN check karo.</li>
</ul></div>
`}};export{e as default};