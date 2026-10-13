var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have walked the whole city: lanes, arterial roads and highways; the rule that every district has two roads in; the traffic police that must stand where the cars actually arrive; the hot-standby pilot; the metro-style fabric; the rented cars of the cloud; the restaurant kitchens of wireless; and the sorting machine inside every switch. This chapter packs it into a checklist you can revise from the night before the exam or an interview.</p>

<h3>Can you do all of this?</h3>
<ul>
<li>Explain hierarchy, modularity, resiliency and flexibility, and give a network example of each.</li>
<li>Define a failure domain and describe three ways to keep it small.</li>
<li>Calculate an oversubscription ratio, counting only forwarding links, and compare it with 20:1 (access to distribution) and 4:1 (distribution to core).</li>
<li>Describe the roles of access, distribution and core, and say when a collapsed core is enough.</li>
<li>Compare L2 access, routed access and virtual switching with MEC.</li>
<li>Align STP root and HSRP active per VLAN, with preempt, and bundle the interconnect with LACP.</li>
<li>Build and verify the collapsed-core lab: Po1(SU), root ports on AS1, <code>show standby brief</code>, ECMP on R1, failover and the virtual MAC 0000.0c07.ac0a.</li>
<li>Explain RPR, RPR+, SSO, NSF, graceful restart, NSR, StackWise and StackWise Virtual.</li>
<li>Describe spine-leaf rules, how to scale a fabric, and the SD-Access planes.</li>
<li>Choose between on-premises, cloud and hybrid for a given workload and describe how to connect them.</li>
<li>Compare centralised, distributed, controller-less, controller-based, cloud and remote-branch WLAN models.</li>
<li>Explain process switching, fast switching and CEF, and the RIB, FIB, adjacency table, CAM and TCAM.</li>
<li>Run a design review and find a root/active mismatch and a channel-mode mismatch.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where each high-availability tool protects">
<rect x="10" y="20" width="145" height="70" rx="8" fill="#bae6fd"/><text x="82" y="48" text-anchor="middle" class="svg-ink" font-size="13">Link</text><text x="82" y="70" text-anchor="middle" class="svg-muted" font-size="12">EtherChannel, ECMP</text>
<rect x="165" y="20" width="145" height="70" rx="8" fill="#bbf7d0"/><text x="237" y="48" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="237" y="70" text-anchor="middle" class="svg-muted" font-size="12">HSRP, VRRP, GLBP</text>
<rect x="320" y="20" width="145" height="70" rx="8" fill="#fde68a"/><text x="392" y="48" text-anchor="middle" class="svg-ink" font-size="13">Device</text><text x="392" y="70" text-anchor="middle" class="svg-muted" font-size="12">SSO, NSF, NSR</text>
<rect x="475" y="20" width="155" height="70" rx="8" fill="#ddd6fe"/><text x="552" y="48" text-anchor="middle" class="svg-ink" font-size="13">Pair as one</text><text x="552" y="70" text-anchor="middle" class="svg-muted" font-size="12">StackWise, SVL, MEC</text>
<rect x="10" y="110" width="310" height="70" rx="8" fill="#fed7aa"/><text x="165" y="138" text-anchor="middle" class="svg-ink" font-size="13">Path</text><text x="165" y="160" text-anchor="middle" class="svg-muted" font-size="12">OSPF equal-cost paths, BGP multihoming</text>
<rect x="330" y="110" width="300" height="70" rx="8" fill="#e2e8f0"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="13">Design</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">Pairs, small failure domains, alignment</text>
</svg><p class="cap">Each HA tool covers one kind of failure; a resilient design layers them.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Collapsed core</dt><dd>Two-tier design in which distribution and core run on one switch pair.</dd>
<dt>Failure domain</dt><dd>The part of the network affected by one failure.</dd>
<dt>Oversubscription</dt><dd>Downstream bandwidth divided by usable upstream bandwidth.</dd>
<dt>Routed access</dt><dd>Access switch is the default gateway and routes on its uplinks; no FHRP, no uplink blocking.</dd>
<dt>MEC</dt><dd>Multichassis EtherChannel: one bundle to two physical switches acting as one.</dd>
<dt>SSO / NSF / NSR</dt><dd>Stateful standby supervisor / keep forwarding on the last FIB / keep routing state on the standby.</dd>
<dt>Graceful restart</dt><dd>Protocol signalling that asks NSF-aware neighbours to keep routes during a restart.</dd>
<dt>Spine-leaf</dt><dd>Fabric in which every leaf connects to every spine; always leaf-spine-leaf.</dd>
<dt>FlexConnect</dt><dd>AP mode with control to a central WLC and data switched locally; survives WAN loss.</dd>
<dt>FIB / adjacency</dt><dd>CEF's forwarding table and its pre-built Layer 2 rewrites.</dd>
<dt>TCAM</dt><dd>Ternary memory with value, mask and result entries for routes, ACLs and QoS.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Collapsed core</td><td>Merges distribution and core</td></tr>
<tr><td>Oversubscription guidance</td><td>About 20:1 access to distribution, 4:1 distribution to core</td></tr>
<tr><td>Routed access</td><td>No FHRP, no STP blocking on uplinks, VLAN cannot span</td></tr>
<tr><td>Alignment</td><td>Same switch is STP root and HSRP active per VLAN, with preempt</td></tr>
<tr><td>Root macros</td><td>primary = 24576 or 4096 below current root; secondary = 28672</td></tr>
<tr><td>HSRPv1 MAC</td><td>0000.0c07.acXX (group in hex)</td></tr>
<tr><td>EtherChannel modes</td><td>on only with on; active with active or passive</td></tr>
<tr><td>SSO vs NSF vs NSR</td><td>state sync; forward on last FIB with GR helpers; routing state on standby, no helper</td></tr>
<tr><td>Spine-leaf</td><td>Add spines for bandwidth, leaves for ports</td></tr>
<tr><td>SD-Access planes</td><td>LISP control, VXLAN data, SGT policy</td></tr>
<tr><td>CAPWAP</td><td>UDP 5246 control, UDP 5247 data</td></tr>
<tr><td>CAM vs TCAM</td><td>binary exact match vs ternary with don't-care</td></tr>
<tr><td>CEF</td><td>topology-driven, per-destination load sharing by default</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Bundle</span>
interface range g0/6 - 7
 channel-group 1 mode active
show etherchannel summary
show lacp neighbor
<span class="c">! STP and HSRP alignment</span>
spanning-tree vlan 10 root primary
spanning-tree vlan 20 root secondary
interface vlan 10
 standby 10 priority 110
 standby 10 preempt
show spanning-tree vlan 10
show standby brief
<span class="c">! Routing and forwarding</span>
show ip route ospf
show ip cef 10.1.20.0/24
show ip cef exact-route 172.16.0.10 10.1.20.12
show adjacency detail
show mac address-table vlan 10
<span class="c">! Device HA</span>
redundancy
 mode sso
show redundancy states
show switch
show stackwise-virtual</pre>

<div class="eg"><p><b>Worked example: a two-minute design answer.</b> "Medium office, one building, 600 users, voice and Wi-Fi." Answer: collapsed core with two Catalyst distribution/core switches (or a StackWise Virtual pair), access stacks with two uplinks each, routed or MEC uplinks if possible, otherwise L2 access with STP root and HSRP active aligned per VLAN and preempt; LACP interconnect; OSPF to two WAN edges with SD-WAN; centralised wireless with an HA SSO WLC pair; SSO on any modular chassis; oversubscription checked against 20:1.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Confusing collapsed core with merged access. Saying NSF needs no neighbour support. Forgetting that routed access removes FHRP. Mixing up CAPWAP ports. Calling TCAM "binary".</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> When two answers both "add redundancy", pick the one that also makes failover fast and keeps protocols aligned. When a question mentions heavy east-west traffic, think spine-leaf; branches and WAN outages, think FlexConnect and SD-WAN; supervisor failure, think SSO plus NSF or NSR.</p></div>

<div class="scn"><h4>The interview that turned into a whiteboard</h4><p>A candidate for a network engineer role was asked to "draw the network of a hospital with three buildings". Instead of drawing boxes first, she asked about users, critical systems and uptime, then drew a core pair, a distribution pair per building with routed links to the core, access stacks with two uplinks, and explained STP/HSRP alignment, SSO on the core chassis, FlexConnect for the two clinics and a hybrid cloud link for the imaging archive. The panel stopped her after ten minutes: she had covered their whole question bank.</p><p><b>Lesson:</b> design answers score when every box comes with the failure it survives.</p></div>

<div class="iv"><p class="q">"If you could change only one thing in a campus that keeps having slow periods, what would you look at first?"</p><p>Say you would first compare the running network with the design intent: STP root and FHRP active per VLAN, EtherChannel health on the distribution interconnect, and oversubscription on uplinks, because misaligned redundancy is the most common silent cause. Then explain how you would measure it with show commands and interface counters before changing anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design principles: hierarchy, modularity, resiliency, flexibility; measure failure domains and oversubscription.</li>
<li>Collapsed core for one site, three-tier for many blocks, spine-leaf for heavy east-west traffic.</li>
<li>Redundancy needs alignment: STP root with HSRP active, LACP bundles, both switches in routing.</li>
<li>SSO, NSF/GR, NSR, StackWise and StackWise Virtual protect inside the device or pair.</li>
<li>Know the WLAN models, on-premises versus cloud trade-offs and CEF, CAM and TCAM.</li>
</ul></div>
`,hi:`
<p>Aap poora shehar ghoom chuke ho: galiyan, arterial roads aur highways; yeh rule ki har district mein do raaste aate hain; traffic police jo wahan khadi honi chahiye jahan gaadiyan asal mein aati hain; hot-standby pilot; metro jaisa fabric; cloud ki kiraye ki gaadiyan; wireless ke restaurant kitchens; aur har switch ke andar ki sorting machine. Yeh chapter sab ek checklist mein pack karta hai jisse aap exam ya interview se pehle ki raat revise kar sako.</p>

<h3>Kya aap yeh sab kar sakte ho?</h3>
<ul>
<li>Hierarchy, modularity, resiliency aur flexibility samjhana, aur har ek ka network example dena.</li>
<li>Failure domain define karna aur use chhota rakhne ke teen tareeke batana.</li>
<li>Oversubscription ratio calculate karna, sirf forwarding links gin kar, aur use 20:1 (access se distribution) aur 4:1 (distribution se core) se compare karna.</li>
<li>Access, distribution aur core ke roles batana, aur kab collapsed core kaafi hai.</li>
<li>L2 access, routed access aur MEC ke saath virtual switching compare karna.</li>
<li>Har VLAN ke liye preempt ke saath STP root aur HSRP active align karna, aur interconnect ko LACP se bundle karna.</li>
<li>Collapsed-core lab banana aur verify karna: Po1(SU), AS1 par root ports, <code>show standby brief</code>, R1 par ECMP, failover aur virtual MAC 0000.0c07.ac0a.</li>
<li>RPR, RPR+, SSO, NSF, graceful restart, NSR, StackWise aur StackWise Virtual samjhana.</li>
<li>Spine-leaf rules, fabric kaise scale karein, aur SD-Access planes batana.</li>
<li>Diye gaye workload ke liye on-premises, cloud aur hybrid mein chunna aur unhe kaise jodein batana.</li>
<li>Centralised, distributed, controller-less, controller-based, cloud aur remote-branch WLAN models compare karna.</li>
<li>Process switching, fast switching aur CEF, aur RIB, FIB, adjacency table, CAM aur TCAM samjhana.</li>
<li>Design review chalana aur root/active mismatch aur channel-mode mismatch dhoondhna.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Har high-availability tool kahan protect karta hai">
<rect x="10" y="20" width="145" height="70" rx="8" fill="#bae6fd"/><text x="82" y="48" text-anchor="middle" class="svg-ink" font-size="13">Link</text><text x="82" y="70" text-anchor="middle" class="svg-muted" font-size="12">EtherChannel, ECMP</text>
<rect x="165" y="20" width="145" height="70" rx="8" fill="#bbf7d0"/><text x="237" y="48" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="237" y="70" text-anchor="middle" class="svg-muted" font-size="12">HSRP, VRRP, GLBP</text>
<rect x="320" y="20" width="145" height="70" rx="8" fill="#fde68a"/><text x="392" y="48" text-anchor="middle" class="svg-ink" font-size="13">Device</text><text x="392" y="70" text-anchor="middle" class="svg-muted" font-size="12">SSO, NSF, NSR</text>
<rect x="475" y="20" width="155" height="70" rx="8" fill="#ddd6fe"/><text x="552" y="48" text-anchor="middle" class="svg-ink" font-size="13">Pair ek ki tarah</text><text x="552" y="70" text-anchor="middle" class="svg-muted" font-size="12">StackWise, SVL, MEC</text>
<rect x="10" y="110" width="310" height="70" rx="8" fill="#fed7aa"/><text x="165" y="138" text-anchor="middle" class="svg-ink" font-size="13">Path</text><text x="165" y="160" text-anchor="middle" class="svg-muted" font-size="12">OSPF equal-cost paths, BGP multihoming</text>
<rect x="330" y="110" width="300" height="70" rx="8" fill="#e2e8f0"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="13">Design</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">Pairs, chhote failure domains, alignment</text>
</svg><p class="cap">Har HA tool ek tarah ka failure cover karta hai; resilient design unhe layer karta hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Collapsed core</dt><dd>Two-tier design jismein distribution aur core ek switch pair par chalte hain.</dd>
<dt>Failure domain</dt><dd>Network ka woh hissa jo ek failure se affect hota hai.</dd>
<dt>Oversubscription</dt><dd>Downstream bandwidth bhaag usable upstream bandwidth.</dd>
<dt>Routed access</dt><dd>Access switch default gateway hai aur uplinks par route karta hai; na FHRP, na uplink blocking.</dd>
<dt>MEC</dt><dd>Multichassis EtherChannel: ek ki tarah kaam karne wale do physical switches tak ek bundle.</dd>
<dt>SSO / NSF / NSR</dt><dd>Stateful standby supervisor / last FIB par forward karte raho / routing state standby par rakho.</dd>
<dt>Graceful restart</dt><dd>Protocol signalling jo NSF-aware neighbours se restart ke dauraan routes rakhne ko kehti hai.</dd>
<dt>Spine-leaf</dt><dd>Fabric jismein har leaf har spine se judta hai; hamesha leaf-spine-leaf.</dd>
<dt>FlexConnect</dt><dd>AP mode jismein control central WLC tak aur data locally switch; WAN loss jhel leta hai.</dd>
<dt>FIB / adjacency</dt><dd>CEF ki forwarding table aur uske pre-built Layer 2 rewrites.</dd>
<dt>TCAM</dt><dd>Routes, ACLs aur QoS ke liye value, mask aur result entries wali ternary memory.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Collapsed core</td><td>Distribution aur core merge karta hai</td></tr>
<tr><td>Oversubscription guidance</td><td>Lagbhag 20:1 access se distribution, 4:1 distribution se core</td></tr>
<tr><td>Routed access</td><td>Na FHRP, na uplinks par STP blocking, VLAN span nahi kar sakta</td></tr>
<tr><td>Alignment</td><td>Har VLAN ke liye same switch STP root aur HSRP active, preempt ke saath</td></tr>
<tr><td>Root macros</td><td>primary = 24576 ya current root se 4096 kam; secondary = 28672</td></tr>
<tr><td>HSRPv1 MAC</td><td>0000.0c07.acXX (group hex mein)</td></tr>
<tr><td>EtherChannel modes</td><td>on sirf on ke saath; active, active ya passive ke saath</td></tr>
<tr><td>SSO vs NSF vs NSR</td><td>state sync; GR helpers ke saath last FIB par forward; routing state standby par, helper nahi</td></tr>
<tr><td>Spine-leaf</td><td>Bandwidth ke liye spines, ports ke liye leaves jodo</td></tr>
<tr><td>SD-Access planes</td><td>LISP control, VXLAN data, SGT policy</td></tr>
<tr><td>CAPWAP</td><td>UDP 5246 control, UDP 5247 data</td></tr>
<tr><td>CAM vs TCAM</td><td>binary exact match vs don't-care wala ternary</td></tr>
<tr><td>CEF</td><td>topology-driven, default mein per-destination load sharing</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Bundle</span>
interface range g0/6 - 7
 channel-group 1 mode active
show etherchannel summary
show lacp neighbor
<span class="c">! STP aur HSRP alignment</span>
spanning-tree vlan 10 root primary
spanning-tree vlan 20 root secondary
interface vlan 10
 standby 10 priority 110
 standby 10 preempt
show spanning-tree vlan 10
show standby brief
<span class="c">! Routing aur forwarding</span>
show ip route ospf
show ip cef 10.1.20.0/24
show ip cef exact-route 172.16.0.10 10.1.20.12
show adjacency detail
show mac address-table vlan 10
<span class="c">! Device HA</span>
redundancy
 mode sso
show redundancy states
show switch
show stackwise-virtual</pre>

<div class="eg"><p><b>Worked example: do minute ka design answer.</b> "Medium office, ek building, 600 users, voice aur Wi-Fi." Answer: do Catalyst distribution/core switches (ya StackWise Virtual pair) ke saath collapsed core, har ek ke do uplinks wale access stacks, possible ho to routed ya MEC uplinks, warna har VLAN ke liye aligned STP root aur HSRP active aur preempt ke saath L2 access; LACP interconnect; SD-WAN ke saath do WAN edges tak OSPF; HA SSO WLC pair ke saath centralised wireless; har modular chassis par SSO; 20:1 ke against oversubscription check.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyon se bacho.</b> Collapsed core ko merged access samajhna. Kehna ki NSF ko neighbour support nahi chahiye. Bhoolna ki routed access FHRP hata deta hai. CAPWAP ports mix karna. TCAM ko "binary" kehna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Jab do answers dono "redundancy jodte" hon, woh chuno jo failover tez bhi kare aur protocols aligned rakhe. Jab question heavy east-west traffic bataye, spine-leaf socho; branches aur WAN outages, FlexConnect aur SD-WAN socho; supervisor failure, SSO plus NSF ya NSR socho.</p></div>

<div class="scn"><h4>Woh interview jo whiteboard ban gaya</h4><p>Network engineer role ki ek candidate se "teen buildings wale hospital ka network draw karo" kaha gaya. Pehle boxes draw karne ki jagah usne users, critical systems aur uptime ke baare mein poochha, phir core pair, core tak routed links ke saath har building ka distribution pair, do uplinks wale access stacks draw kiye, aur STP/HSRP alignment, core chassis par SSO, do clinics ke liye FlexConnect aur imaging archive ke liye hybrid cloud link samjhaya. Panel ne das minute baad use rok diya: usne unka poora question bank cover kar diya tha.</p><p><b>Seekh:</b> design answers tab score karte hain jab har box ke saath woh failure aata hai jo woh jhelta hai.</p></div>

<div class="iv"><p class="q">"Agar aap ek campus mein sirf ek cheez badal sakte jo baar baar slow hota hai, to pehle kya dekhoge?"</p><p>Batao ki pehle aap chalte network ko design intent se compare karoge: har VLAN ka STP root aur FHRP active, distribution interconnect par EtherChannel health, aur uplinks par oversubscription, kyunki misaligned redundancy sabse common chupa hua cause hai. Phir samjhao ki kuch badalne se pehle aap use show commands aur interface counters se kaise naapoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design principles: hierarchy, modularity, resiliency, flexibility; failure domains aur oversubscription naapo.</li>
<li>Ek site ke liye collapsed core, kai blocks ke liye three-tier, heavy east-west traffic ke liye spine-leaf.</li>
<li>Redundancy ko alignment chahiye: HSRP active ke saath STP root, LACP bundles, dono switches routing mein.</li>
<li>SSO, NSF/GR, NSR, StackWise aur StackWise Virtual device ya pair ke andar protect karte hain.</li>
<li>WLAN models, on-premises vs cloud trade-offs aur CEF, CAM aur TCAM jaano.</li>
</ul></div>
`}};export{e as default};