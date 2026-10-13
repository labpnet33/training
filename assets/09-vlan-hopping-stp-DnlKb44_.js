var e={id:`vlan-hop`,h:{en:`VLAN hopping, STP protection and storm control`,hi:`VLAN hopping, STP protection aur storm control`},body:{en:`
<p>In a hotel, each floor's lift button only works with the key card for that floor. VLANs are those floors. VLAN hopping is a guest finding a way to ride to a floor their card should never reach: either by convincing the lift they are a staff member (switch spoofing), or by hiding inside a service trolley that is sent to another floor (double tagging). This chapter closes those tricks, protects spanning tree, and adds storm control, then combines everything into one access-port template.</p>

<h3>Switch spoofing (DTP abuse)</h3>
<p>You met <b>DTP</b> (Dynamic Trunking Protocol) in the VLANs module. A port left at its default dynamic mode will form a trunk if the other side asks. An attacker's laptop that speaks DTP asks, the port becomes an 802.1Q trunk, and the laptop can now send and receive frames in <b>every VLAN</b> allowed on the trunk (all of them, by default).</p>
<p><b>Mitigation:</b> never leave user ports dynamic. Configure <code>switchport mode access</code> on every edge port. On real trunks, configure <code>switchport mode trunk</code> plus <code>switchport nonegotiate</code> so no DTP is sent at all. Many hardening templates add <code>switchport nonegotiate</code> to access ports as well.</p>

<h3>Double tagging</h3>
<p>The attacker sits in the access VLAN that equals the trunk's <b>native VLAN</b> (VLAN 1 by default). The laptop sends a frame with two 802.1Q tags: outer tag VLAN 1, inner tag VLAN 20. The first switch receives it on the access port, sees it must go out the trunk in the native VLAN, and native VLAN frames are sent <b>untagged</b>, so it removes the outer tag. The second switch now sees a frame tagged VLAN 20 and delivers it into VLAN 20. The attack is one-way (replies do not come back the same way), but it is enough to send malicious traffic into another VLAN.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Double tagging">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="12">Attacker</text><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="12">VLAN 1</text>
<rect x="190" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="110" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="400" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="455" y="110" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<rect x="560" y="80" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="595" y="102" text-anchor="middle" class="svg-ink" font-size="12">Victim</text><text x="595" y="120" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
<line x1="120" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="105" x2="400" y2="105" stroke="#64748b" stroke-width="2"/><line x1="510" y1="105" x2="560" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="155" y="60" text-anchor="middle" class="svg-accent" font-size="12">tags 1 + 20</text>
<text x="350" y="60" text-anchor="middle" class="svg-accent" font-size="12">tag 20 only</text>
<text x="350" y="150" text-anchor="middle" class="svg-muted" font-size="12">trunk, native VLAN 1</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Fix: native VLAN = unused VLAN (999), never on access ports</text>
</svg><p class="cap">SW1 strips the outer native tag; SW2 forwards the inner tag into VLAN 20.</p></div>

<p><b>Mitigation:</b> set the trunk native VLAN to an <b>unused VLAN</b> (for example 999) that is never assigned to any access port, so no attacker can be "in" the native VLAN. Optionally, <code>vlan dot1q tag native</code> (global) makes the switch tag native VLAN frames too. Move users off VLAN 1.</p>

<h3>Shut unused ports</h3>
<p>An unused port that is up, dynamic and in VLAN 1 is an invitation. Put unused ports in an unused "parking" VLAN, make them static access, and <code>shutdown</code>. When someone needs the port, a change request brings it up in the right VLAN.</p>

<h3>STP manipulation: BPDU Guard and Root Guard</h3>
<p>From the STP module: a device sending a superior BPDU can become root. On <b>PortFast edge ports</b> (users, printers), no BPDU should ever arrive. <b>BPDU Guard</b> err-disables the port the moment one does (<code>spanning-tree bpduguard enable</code>, or globally <code>spanning-tree portfast bpduguard default</code> for all PortFast ports). <b>Root Guard</b> (<code>spanning-tree guard root</code>) goes on distribution ports facing access switches: if a superior BPDU arrives there, the port is put in <b>root-inconsistent</b> state (blocking) until the superior BPDUs stop, and then it recovers by itself.</p>

<h3>Storm control</h3>
<p>A loop or a broken NIC can flood broadcasts and bring a VLAN to its knees. <b>Storm control</b> measures broadcast, multicast or unknown-unicast traffic per port against a threshold (percentage of bandwidth, bps or pps). Above it, the default action drops the excess (filter); you can add <code>storm-control action trap</code> or <code>shutdown</code> (err-disable, cause <code>storm-control</code>).</p>

<div class="eg"><p><b>Worked example.</b> A 48-port access switch: Gi0/1-44 users in VLAN 10, Gi0/45-46 unused, Gi0/47-48 uplink trunks carrying VLANs 10, 20 and 30. Native VLAN becomes 999 (PARKING), which is also the parking VLAN for unused ports. Broadcast storm threshold on user ports: 5 percent of bandwidth, with a trap.</p></div>

<h3>The hardened access-switch template</h3>
<pre class="code">SW1(config)# vlan 999
SW1(config-vlan)# name PARKING
SW1(config)# interface range g0/1 - 44
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport nonegotiate
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# spanning-tree portfast
SW1(config-if-range)# spanning-tree bpduguard enable
SW1(config-if-range)# storm-control broadcast level 5.00
SW1(config-if-range)# storm-control action trap
SW1(config)# interface range g0/45 - 46
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 999
SW1(config-if-range)# shutdown
SW1(config)# interface range g0/47 - 48
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# switchport nonegotiate
SW1(config-if-range)# switchport trunk native vlan 999
SW1(config-if-range)# switchport trunk allowed vlan 10,20,30</pre>
<p>Remember the native VLAN must match on both ends of each trunk, or CDP reports a native VLAN mismatch.</p>

<h3>Verification</h3>
<pre class="out">SW1# show interfaces g0/48 switchport
Name: Gi0/48
Switchport: Enabled
<span class="hl">Administrative Mode: trunk</span>
Operational Mode: trunk
<span class="hl">Negotiation of Trunking: Off</span>
<span class="hl">Trunking Native Mode VLAN: 999 (PARKING)</span>

SW1# show storm-control g0/1 broadcast
Interface  Filter State   Upper        Lower        Current
---------  -------------  -----------  -----------  ----------
<span class="hl">Gi0/1      Forwarding           5.00%        5.00%      0.12%</span>

SW1# show spanning-tree interface g0/1 detail | include Bpdu
<span class="hl">   Bpdu guard is enabled</span></pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing the native VLAN on one side of a trunk only. (2) Using VLAN 1 for users "because it is there". (3) Enabling Root Guard on the wrong side (on the access switch uplink), which blocks the path to the real root. (4) Enabling BPDU Guard on uplinks, which err-disables them immediately.</p></div>

<div class="exam"><p><b>Exam trap.</b> Switch spoofing is stopped by disabling DTP (static access mode, nonegotiate on trunks). Double tagging is stopped by an unused native VLAN (or tagging the native VLAN), and it only works when the attacker is in the native VLAN. BPDU Guard err-disables; Root Guard puts the port in root-inconsistent state.</p></div>

<div class="scn"><h4>The pen-test that hopped VLANs</h4><p>An external penetration tester at a manufacturing company plugged into a spare port in the canteen and within minutes could reach the production VLAN. The port was in default dynamic desirable mode and formed a trunk with the tester's laptop. The remediation: every edge port set to static access with nonegotiate, native VLAN moved to unused 999 on all trunks, spare ports parked in VLAN 999 and shut, and BPDU Guard enabled globally for PortFast ports. The retest found no path between VLANs.</p><p><b>Lesson:</b> defaults are built for easy plug-and-play, not security. Hardening means replacing every default on user-facing ports.</p></div>

<div class="iv"><p class="q">"What is VLAN hopping and how do you prevent it?"</p><p>Strong answer: two methods. Switch spoofing uses DTP to turn an access port into a trunk; prevent it with static access mode and nonegotiate on trunks. Double tagging sends a frame with two tags when the attacker is in the native VLAN; prevent it by using an unused native VLAN never assigned to access ports, or by tagging the native VLAN. Add shutting unused ports into a parking VLAN, and mention BPDU Guard and Root Guard for STP attacks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch spoofing abuses DTP: use switchport mode access, and mode trunk plus nonegotiate on trunks.</li>
<li>Double tagging needs the attacker in the native VLAN: set an unused native VLAN like 999.</li>
<li>Park unused ports in an unused VLAN and shut them down; keep users off VLAN 1.</li>
<li>BPDU Guard on PortFast edge ports (err-disable); Root Guard where the root must never appear (root-inconsistent).</li>
<li>Storm control limits broadcast/multicast/unknown-unicast per port; action filter, trap or shutdown.</li>
</ul></div>
`,hi:`
<p>Hotel mein har floor ka lift button sirf us floor ke key card se chalta hai. VLANs woh floors hain. VLAN hopping matlab ek guest ka aise floor tak pahunchne ka tareeka dhoondhna jahan uska card kabhi nahi le jaana chahiye: ya to lift ko yakeen dila kar ki woh staff member hai (switch spoofing), ya ek service trolley mein chhup kar jo kisi aur floor par bheji ja rahi hai (double tagging). Yeh chapter in tricks ko band karta hai, spanning tree ko protect karta hai, storm control jodta hai, aur phir sab kuch ek access-port template mein jodta hai.</p>

<h3>Switch spoofing (DTP abuse)</h3>
<p>Aapne VLANs module mein <b>DTP</b> (Dynamic Trunking Protocol) dekha tha. Default dynamic mode par chhoda gaya port trunk bana leta hai agar doosri side maange. DTP bolne wala attacker ka laptop maangta hai, port 802.1Q trunk ban jaata hai, aur laptop ab trunk par allowed <b>har VLAN</b> (default mein saare) mein frames bhej aur le sakta hai.</p>
<p><b>Mitigation:</b> user ports ko kabhi dynamic mat chhodo. Har edge port par <code>switchport mode access</code> configure karo. Asli trunks par <code>switchport mode trunk</code> plus <code>switchport nonegotiate</code> configure karo taaki bilkul DTP na bheja jaaye. Bahut saare hardening templates access ports par bhi <code>switchport nonegotiate</code> jodte hain.</p>

<h3>Double tagging</h3>
<p>Attacker us access VLAN mein baitha hai jo trunk ke <b>native VLAN</b> ke barabar hai (default mein VLAN 1). Laptop do 802.1Q tags wala frame bhejta hai: outer tag VLAN 1, inner tag VLAN 20. Pehla switch use access port par leta hai, dekhta hai ki use trunk par native VLAN mein bhejna hai, aur native VLAN frames <b>untagged</b> bheje jaate hain, isliye woh outer tag hata deta hai. Doosra switch ab VLAN 20 tagged frame dekhta hai aur use VLAN 20 mein deliver kar deta hai. Attack one-way hai (replies usi raaste wapas nahi aate), lekin doosre VLAN mein malicious traffic bhejne ke liye kaafi hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Double tagging">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="12">Attacker</text><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="12">VLAN 1</text>
<rect x="190" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="110" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="400" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="455" y="110" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<rect x="560" y="80" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="595" y="102" text-anchor="middle" class="svg-ink" font-size="12">Victim</text><text x="595" y="120" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
<line x1="120" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="105" x2="400" y2="105" stroke="#64748b" stroke-width="2"/><line x1="510" y1="105" x2="560" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="155" y="60" text-anchor="middle" class="svg-accent" font-size="12">tags 1 + 20</text>
<text x="350" y="60" text-anchor="middle" class="svg-accent" font-size="12">sirf tag 20</text>
<text x="350" y="150" text-anchor="middle" class="svg-muted" font-size="12">trunk, native VLAN 1</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Fix: native VLAN = unused VLAN (999), access ports par kabhi nahi</text>
</svg><p class="cap">SW1 outer native tag hata deta hai; SW2 inner tag ko VLAN 20 mein forward kar deta hai.</p></div>

<p><b>Mitigation:</b> trunk ka native VLAN ek <b>unused VLAN</b> (jaise 999) set karo jo kabhi kisi access port ko assign na ho, taaki koi attacker native VLAN "mein" ho hi na sake. Optionally, <code>vlan dot1q tag native</code> (global) switch se native VLAN frames ko bhi tag karwata hai. Users ko VLAN 1 se hatao.</p>

<h3>Unused ports shut karo</h3>
<p>Jo unused port up hai, dynamic hai aur VLAN 1 mein hai woh ek nyota hai. Unused ports ko ek unused "parking" VLAN mein daalo, static access banao, aur <code>shutdown</code> karo. Jab kisi ko port chahiye, change request use sahi VLAN mein up karti hai.</p>

<h3>STP manipulation: BPDU Guard aur Root Guard</h3>
<p>STP module se: superior BPDU bhejne wala device root ban sakta hai. <b>PortFast edge ports</b> (users, printers) par kabhi koi BPDU nahi aana chahiye. <b>BPDU Guard</b> jaise hi aata hai port err-disable kar deta hai (<code>spanning-tree bpduguard enable</code>, ya saare PortFast ports ke liye globally <code>spanning-tree portfast bpduguard default</code>). <b>Root Guard</b> (<code>spanning-tree guard root</code>) access switches ki taraf ke distribution ports par lagta hai: agar wahan superior BPDU aaye, port <b>root-inconsistent</b> state (blocking) mein chala jaata hai jab tak superior BPDUs ruk na jaayein, aur phir khud recover ho jaata hai.</p>

<h3>Storm control</h3>
<p>Loop ya kharaab NIC broadcasts flood karke VLAN ko ghutno par la sakta hai. <b>Storm control</b> har port par broadcast, multicast ya unknown-unicast traffic ko ek threshold (bandwidth ka percentage, bps ya pps) se naapta hai. Uske upar default action extra traffic drop karta hai (filter); aap <code>storm-control action trap</code> ya <code>shutdown</code> (err-disable, cause <code>storm-control</code>) jod sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> 48-port access switch: Gi0/1-44 users VLAN 10 mein, Gi0/45-46 unused, Gi0/47-48 uplink trunks jo VLANs 10, 20 aur 30 le jaate hain. Native VLAN 999 (PARKING) banta hai, jo unused ports ka parking VLAN bhi hai. User ports par broadcast storm threshold: bandwidth ka 5 percent, trap ke saath.</p></div>

<h3>Hardened access-switch template</h3>
<pre class="code">SW1(config)# vlan 999
SW1(config-vlan)# name PARKING
SW1(config)# interface range g0/1 - 44
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport nonegotiate
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# spanning-tree portfast
SW1(config-if-range)# spanning-tree bpduguard enable
SW1(config-if-range)# storm-control broadcast level 5.00
SW1(config-if-range)# storm-control action trap
SW1(config)# interface range g0/45 - 46
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 999
SW1(config-if-range)# shutdown
SW1(config)# interface range g0/47 - 48
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# switchport nonegotiate
SW1(config-if-range)# switchport trunk native vlan 999
SW1(config-if-range)# switchport trunk allowed vlan 10,20,30</pre>
<p>Yaad rakho native VLAN har trunk ke dono ends par match hona chahiye, warna CDP native VLAN mismatch report karta hai.</p>

<h3>Verification</h3>
<pre class="out">SW1# show interfaces g0/48 switchport
Name: Gi0/48
Switchport: Enabled
<span class="hl">Administrative Mode: trunk</span>
Operational Mode: trunk
<span class="hl">Negotiation of Trunking: Off</span>
<span class="hl">Trunking Native Mode VLAN: 999 (PARKING)</span>

SW1# show storm-control g0/1 broadcast
Interface  Filter State   Upper        Lower        Current
---------  -------------  -----------  -----------  ----------
<span class="hl">Gi0/1      Forwarding           5.00%        5.00%      0.12%</span>

SW1# show spanning-tree interface g0/1 detail | include Bpdu
<span class="hl">   Bpdu guard is enabled</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Trunk ki sirf ek side par native VLAN badalna. (2) Users ke liye VLAN 1 use karna "kyunki woh already hai". (3) Root Guard galat side par (access switch ke uplink par) enable karna, jo asli root ka raasta block kar deta hai. (4) Uplinks par BPDU Guard enable karna, jo unhe turant err-disable kar deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Switch spoofing DTP disable karke rukta hai (static access mode, trunks par nonegotiate). Double tagging unused native VLAN (ya native VLAN tag karke) se rukta hai, aur tabhi chalta hai jab attacker native VLAN mein ho. BPDU Guard err-disable karta hai; Root Guard port ko root-inconsistent state mein daalta hai.</p></div>

<div class="scn"><h4>Pen-test jisne VLANs hop kiye</h4><p>Ek manufacturing company mein external penetration tester ne canteen ke ek spare port mein laptop lagaya aur minutes mein production VLAN tak pahunch gaya. Port default dynamic desirable mode mein tha aur tester ke laptop ke saath trunk ban gaya. Remediation: har edge port static access nonegotiate ke saath, saare trunks par native VLAN unused 999 par, spare ports VLAN 999 mein park aur shut, aur PortFast ports ke liye globally BPDU Guard enabled. Retest mein VLANs ke beech koi raasta nahi mila.</p><p><b>Seekh:</b> defaults aasaan plug-and-play ke liye bane hain, security ke liye nahi. Hardening matlab user-facing ports par har default ko replace karna.</p></div>

<div class="iv"><p class="q">"VLAN hopping kya hai aur aap ise kaise rokte ho?"</p><p>Strong answer: do tareeke. Switch spoofing DTP use karke access port ko trunk bana deta hai; static access mode aur trunks par nonegotiate se roko. Double tagging tab do tags wala frame bhejta hai jab attacker native VLAN mein ho; aisa unused native VLAN use karke roko jo kabhi access ports ko assign na ho, ya native VLAN tag karke. Unused ports ko parking VLAN mein shut karna jodo, aur STP attacks ke liye BPDU Guard aur Root Guard batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch spoofing DTP ka galat use hai: switchport mode access use karo, aur trunks par mode trunk plus nonegotiate.</li>
<li>Double tagging ke liye attacker ka native VLAN mein hona zaroori hai: 999 jaisa unused native VLAN set karo.</li>
<li>Unused ports ko unused VLAN mein park karke shut down karo; users ko VLAN 1 se door rakho.</li>
<li>PortFast edge ports par BPDU Guard (err-disable); jahan root kabhi nahi aana chahiye wahan Root Guard (root-inconsistent).</li>
<li>Storm control har port par broadcast/multicast/unknown-unicast limit karta hai; action filter, trap ya shutdown.</li>
</ul></div>
`}};export{e as default};