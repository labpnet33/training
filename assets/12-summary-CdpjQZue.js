var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with an office building whose lobby was wide open: every wall socket trusted every device. You now have a full set of locks. Port security decides <b>which devices</b> may use a port, DHCP snooping decides <b>who may hand out addresses</b>, DAI decides <b>who may claim an IP in ARP</b>, IP Source Guard decides <b>which source IPs</b> a port may send, DTP-off and an unused native VLAN stop <b>VLAN hopping</b>, BPDU and Root Guard protect <b>spanning tree</b>, and 802.1X decides <b>who the user is</b> before anything else happens. Use this chapter as your revision sheet before the exam and before an interview.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layer 2 defence stack">
<rect x="10" y="10" width="620" height="32" rx="8" fill="#ddd6fe"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">802.1X / MAB: who is connecting?</text>
<rect x="10" y="48" width="620" height="32" rx="8" fill="#bae6fd"/><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="13">Port security: which MACs, how many?</text>
<rect x="10" y="86" width="620" height="32" rx="8" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">DHCP snooping: who may offer leases? (binding table)</text>
<rect x="10" y="124" width="305" height="32" rx="8" fill="#fde68a"/><text x="162" y="145" text-anchor="middle" class="svg-ink" font-size="13">DAI: honest ARP</text>
<rect x="325" y="124" width="305" height="32" rx="8" fill="#fde68a"/><text x="477" y="145" text-anchor="middle" class="svg-ink" font-size="13">IP Source Guard: honest source IP</text>
<rect x="10" y="162" width="620" height="32" rx="8" fill="#fed7aa"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">DTP off, unused native VLAN, BPDU/Root Guard, storm control</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">Err-disabled is the common alarm; the reason names the layer that fired</text>
</svg><p class="cap">The Layer 2 defence stack. DAI and IPSG sit on top of the snooping binding table.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain MAC flooding, rogue DHCP, starvation, ARP spoofing, VLAN hopping and STP manipulation, and name the mitigation for each.</li>
<li>I can configure port security with maximum, static and sticky MACs and each violation mode, and read <code>show port-security</code>.</li>
<li>I can find an err-disabled port, read its reason and recover it manually or with <code>errdisable recovery</code>.</li>
<li>I can enable DHCP snooping globally and per VLAN, trust the right ports, rate-limit untrusted ports and read the binding table.</li>
<li>I can explain and fix the option 82 / giaddr 0.0.0.0 problem.</li>
<li>I can enable DAI with trust, static bindings or ARP ACLs, validation checks and rate limits, and read its statistics and logs.</li>
<li>I can explain IP Source Guard, VLAN hopping mitigations, BPDU Guard, Root Guard and storm control.</li>
<li>I can describe 802.1X roles and protocols and when to use MAB.</li>
<li>I can follow the troubleshooting workflow from symptom to verified fix.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAM table</dt><dd>The switch MAC address table; MAC flooding tries to fill it.</dd>
<dt>Secure MAC</dt><dd>A MAC allowed on a port-security port: static, dynamic or sticky.</dd>
<dt>Violation</dt><dd>A new MAC above the maximum, or a secure MAC seen on another secure port.</dd>
<dt>Err-disabled</dt><dd>Port shut down by the switch because a feature detected an error.</dd>
<dt>Trusted port</dt><dd>A port where DHCP server messages (snooping) or ARP (DAI) are not checked.</dd>
<dt>Binding</dt><dd>A snooping record of MAC, IP, lease, VLAN and port.</dd>
<dt>Option 82</dt><dd>DHCP relay agent information (circuit ID, remote ID) inserted by snooping switches.</dd>
<dt>giaddr</dt><dd>DHCP gateway (relay) address field; 0.0.0.0 with option 82 looks inconsistent to IOS.</dd>
<dt>ARP ACL</dt><dd>An access list that permits or denies IP-to-MAC pairs for DAI.</dd>
<dt>Native VLAN</dt><dd>The VLAN sent untagged on an 802.1Q trunk; basis of double tagging.</dd>
<dt>Supplicant / authenticator / authentication server</dt><dd>802.1X client / switch or AP / RADIUS server.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: the MAC is used as identity for devices without a supplicant.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact to remember</th></tr>
<tr><td>Port security defaults</td><td>Disabled; when on: maximum 1, violation shutdown, aging off; needs static access or trunk mode</td></tr>
<tr><td>Violation modes</td><td>protect: drop silently. restrict: drop, count, log. shutdown: err-disable, count, log</td></tr>
<tr><td>Sticky</td><td>Learned MACs go to the running-config; save to keep them</td></tr>
<tr><td>Err-disable recovery</td><td>Off by default per cause; interval default 300 s; bounce with shutdown / no shutdown</td></tr>
<tr><td>DHCP snooping</td><td>Global plus per VLAN; all ports untrusted; untrusted drops OFFER/ACK/NAK; binding from ACK</td></tr>
<tr><td>Option 82</td><td>Inserted by default, giaddr 0.0.0.0; fix with no ip dhcp snooping information option or relay trust</td></tr>
<tr><td>DAI</td><td>Checks ARP on untrusted ports against bindings / ARP ACLs; default 15 pps; static hosts need bindings</td></tr>
<tr><td>VLAN hopping</td><td>DTP off (access mode, nonegotiate) and unused native VLAN; shut unused ports</td></tr>
<tr><td>STP</td><td>BPDU Guard err-disables edge ports; Root Guard sets root-inconsistent</td></tr>
<tr><td>802.1X</td><td>EAPoL client to switch, RADIUS switch to server; MAB as fallback</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! port security</span>
switchport mode access
switchport port-security
switchport port-security maximum 2
switchport port-security mac-address sticky
switchport port-security violation {protect | restrict | shutdown}
switchport port-security aging time 60
<span class="c">! err-disable</span>
errdisable recovery cause psecure-violation
errdisable recovery interval 30
<span class="c">! DHCP snooping</span>
ip dhcp snooping
ip dhcp snooping vlan 10
no ip dhcp snooping information option
ip dhcp snooping trust                      <span class="c">! uplink</span>
ip dhcp snooping limit rate 10              <span class="c">! access port</span>
ip dhcp snooping database flash:snoop-db.txt
<span class="c">! DAI and IPSG</span>
ip arp inspection vlan 30
ip arp inspection trust                     <span class="c">! uplink / router</span>
ip arp inspection validate src-mac dst-mac ip
ip arp inspection limit rate 50
ip source binding 0050.7966.1e01 vlan 30 10.30.0.11 interface g0/1
ip verify source
<span class="c">! VLAN hopping and STP</span>
switchport nonegotiate
switchport trunk native vlan 999
spanning-tree bpduguard enable
spanning-tree guard root</pre>
<pre class="out"><span class="hl">show port-security [interface | address]</span>
show interfaces status err-disabled
show errdisable recovery
<span class="hl">show ip dhcp snooping [binding]</span>
<span class="hl">show ip arp inspection [interfaces | vlan | statistics]</span>
show ip source binding
show ip verify source
show interfaces switchport
show authentication sessions</pre>

<div class="eg"><p><b>Worked example: a last-minute exam drill.</b> Question: "A port shows 0 violations, the port is up, but a third device on it cannot communicate. Maximum is 2." Answer path: two secure MACs are learned, the third is a violation, the port is up and the counter did not move, so the mode must be <b>protect</b>. If the counter had moved with the port up, the mode would be restrict; if the port were err-disabled, shutdown.</p></div>

<div class="warn"><p><b>Common mistakes in the exam.</b> Mixing up restrict and protect; thinking sticky means "saved"; forgetting that DAI depends on snooping; believing port security stops ARP spoofing; choosing "trust the user port" as a fix; confusing BPDU Guard (err-disable) with Root Guard (root-inconsistent).</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> When an answer fixes a problem by disabling the security feature or trusting an access port, it is almost always wrong. Look for the answer that keeps the protection and addresses the real cause: a missing trust on an uplink, a missing binding, option 82, a wrong violation mode or a rate limit that is too low.</p></div>

<div class="scn"><h4>The audit that passed</h4><p>A bank branch network was audited a year after the team rolled out this module's template. The auditor tried a MAC flooding tool (the port went into restrict and logged), a rogue DHCP server (offers dropped at the untrusted port), ARP poisoning (DAI denied and logged), DTP trunk negotiation (nonegotiate, no trunk), a BPDU from a laptop (BPDU Guard err-disabled the port), and an unknown laptop on a spare port (port shut, 802.1X unauthorized). Every attempt left a syslog line with port, MAC and time.</p><p><b>Lesson:</b> layered Layer 2 security does not rely on any single feature. Each one covers a different trick, and each one leaves evidence.</p></div>

<div class="iv"><p class="q">"If you were hardening a new access switch today, what would you configure and in what order?"</p><p>Strong answer: static access on every edge port with nonegotiate, unused ports shut in a parking VLAN, unused native VLAN on trunks; PortFast with BPDU Guard on edge ports; port security with sensible maximums; DHCP snooping per VLAN with only uplinks trusted, option 82 decided, rate limits and a binding database; then DAI (and IPSG where needed) with trust on infrastructure ports and bindings for static hosts; storm control; and 802.1X with MAB where the organisation has RADIUS. Finish with verification commands and monitoring of violations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each Layer 2 threat has a matching control; know the pairs cold.</li>
<li>Defaults matter: port security max 1 and shutdown; snooping ports untrusted; option 82 on; DAI 15 pps.</li>
<li>Order matters: snooping and bindings before DAI and IPSG; trust before enforcement.</li>
<li>Err-disabled reasons and syslog messages are the fastest path to a diagnosis.</li>
<li>The right fix keeps security on and removes the real cause.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek aisi office building se shuru kiya tha jiski lobby poori khuli thi: har wall socket har device par bharosa karta tha. Ab aapke paas locks ka poora set hai. Port security decide karta hai ki <b>kaunse devices</b> port use kar sakte hain, DHCP snooping decide karta hai ki <b>addresses kaun baant sakta hai</b>, DAI decide karta hai ki <b>ARP mein IP kaun claim kar sakta hai</b>, IP Source Guard decide karta hai ki port <b>kaunse source IPs</b> bhej sakta hai, DTP-off aur unused native VLAN <b>VLAN hopping</b> rokte hain, BPDU aur Root Guard <b>spanning tree</b> ko protect karte hain, aur 802.1X sabse pehle decide karta hai ki <b>user kaun hai</b>. Exam aur interview se pehle is chapter ko revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layer 2 defence stack">
<rect x="10" y="10" width="620" height="32" rx="8" fill="#ddd6fe"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">802.1X / MAB: kaun connect kar raha hai?</text>
<rect x="10" y="48" width="620" height="32" rx="8" fill="#bae6fd"/><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="13">Port security: kaunse MACs, kitne?</text>
<rect x="10" y="86" width="620" height="32" rx="8" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">DHCP snooping: leases kaun offer kar sakta hai? (binding table)</text>
<rect x="10" y="124" width="305" height="32" rx="8" fill="#fde68a"/><text x="162" y="145" text-anchor="middle" class="svg-ink" font-size="13">DAI: imaandaar ARP</text>
<rect x="325" y="124" width="305" height="32" rx="8" fill="#fde68a"/><text x="477" y="145" text-anchor="middle" class="svg-ink" font-size="13">IP Source Guard: imaandaar source IP</text>
<rect x="10" y="162" width="620" height="32" rx="8" fill="#fed7aa"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">DTP off, unused native VLAN, BPDU/Root Guard, storm control</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">Err-disabled common alarm hai; reason batata hai kaunsi layer ne fire kiya</text>
</svg><p class="cap">Layer 2 defence stack. DAI aur IPSG snooping binding table ke upar baithte hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main MAC flooding, rogue DHCP, starvation, ARP spoofing, VLAN hopping aur STP manipulation samjha sakta hoon, aur har ek ka mitigation bata sakta hoon.</li>
<li>Main maximum, static aur sticky MACs aur har violation mode ke saath port security configure kar sakta hoon, aur <code>show port-security</code> padh sakta hoon.</li>
<li>Main err-disabled port dhoondh sakta hoon, uska reason padh sakta hoon aur use manually ya <code>errdisable recovery</code> se recover kar sakta hoon.</li>
<li>Main DHCP snooping globally aur per VLAN enable kar sakta hoon, sahi ports trust kar sakta hoon, untrusted ports rate-limit kar sakta hoon aur binding table padh sakta hoon.</li>
<li>Main option 82 / giaddr 0.0.0.0 problem samjha aur fix kar sakta hoon.</li>
<li>Main trust, static bindings ya ARP ACLs, validation checks aur rate limits ke saath DAI enable kar sakta hoon, aur uske statistics aur logs padh sakta hoon.</li>
<li>Main IP Source Guard, VLAN hopping mitigations, BPDU Guard, Root Guard aur storm control samjha sakta hoon.</li>
<li>Main 802.1X roles aur protocols bata sakta hoon aur MAB kab use karna hai yeh bhi.</li>
<li>Main symptom se verified fix tak troubleshooting workflow follow kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAM table</dt><dd>Switch ki MAC address table; MAC flooding ise bharne ki koshish karta hai.</dd>
<dt>Secure MAC</dt><dd>Port-security port par allowed MAC: static, dynamic ya sticky.</dd>
<dt>Violation</dt><dd>Maximum ke upar naya MAC, ya kisi dusre secure port par dikha secure MAC.</dd>
<dt>Err-disabled</dt><dd>Switch dwara shut kiya gaya port kyunki kisi feature ne error detect kiya.</dd>
<dt>Trusted port</dt><dd>Aisa port jahan DHCP server messages (snooping) ya ARP (DAI) check nahi hote.</dd>
<dt>Binding</dt><dd>MAC, IP, lease, VLAN aur port ka snooping record.</dd>
<dt>Option 82</dt><dd>Snooping switches dwara daali gayi DHCP relay agent information (circuit ID, remote ID).</dd>
<dt>giaddr</dt><dd>DHCP gateway (relay) address field; option 82 ke saath 0.0.0.0 IOS ko inconsistent lagta hai.</dd>
<dt>ARP ACL</dt><dd>Access list jo DAI ke liye IP-to-MAC pairs permit ya deny karti hai.</dd>
<dt>Native VLAN</dt><dd>802.1Q trunk par untagged bheja jaane wala VLAN; double tagging ka base.</dd>
<dt>Supplicant / authenticator / authentication server</dt><dd>802.1X client / switch ya AP / RADIUS server.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: bina supplicant wale devices ke liye MAC ko identity ki tarah use kiya jaata hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakhne wala fact</th></tr>
<tr><td>Port security defaults</td><td>Disabled; on hone par: maximum 1, violation shutdown, aging off; static access ya trunk mode chahiye</td></tr>
<tr><td>Violation modes</td><td>protect: chupchaap drop. restrict: drop, count, log. shutdown: err-disable, count, log</td></tr>
<tr><td>Sticky</td><td>Seekhe gaye MACs running-config mein jaate hain; rakhne ke liye save karo</td></tr>
<tr><td>Err-disable recovery</td><td>Har cause ke liye default off; interval default 300 s; shutdown / no shutdown se bounce</td></tr>
<tr><td>DHCP snooping</td><td>Global plus per VLAN; saare ports untrusted; untrusted OFFER/ACK/NAK drop karta hai; binding ACK se</td></tr>
<tr><td>Option 82</td><td>Default mein insert, giaddr 0.0.0.0; no ip dhcp snooping information option ya relay trust se fix</td></tr>
<tr><td>DAI</td><td>Untrusted ports par ARP ko bindings / ARP ACLs se check karta hai; default 15 pps; static hosts ko bindings chahiye</td></tr>
<tr><td>VLAN hopping</td><td>DTP off (access mode, nonegotiate) aur unused native VLAN; unused ports shut</td></tr>
<tr><td>STP</td><td>BPDU Guard edge ports err-disable karta hai; Root Guard root-inconsistent set karta hai</td></tr>
<tr><td>802.1X</td><td>Client se switch EAPoL, switch se server RADIUS; fallback mein MAB</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! port security</span>
switchport mode access
switchport port-security
switchport port-security maximum 2
switchport port-security mac-address sticky
switchport port-security violation {protect | restrict | shutdown}
switchport port-security aging time 60
<span class="c">! err-disable</span>
errdisable recovery cause psecure-violation
errdisable recovery interval 30
<span class="c">! DHCP snooping</span>
ip dhcp snooping
ip dhcp snooping vlan 10
no ip dhcp snooping information option
ip dhcp snooping trust                      <span class="c">! uplink</span>
ip dhcp snooping limit rate 10              <span class="c">! access port</span>
ip dhcp snooping database flash:snoop-db.txt
<span class="c">! DAI aur IPSG</span>
ip arp inspection vlan 30
ip arp inspection trust                     <span class="c">! uplink / router</span>
ip arp inspection validate src-mac dst-mac ip
ip arp inspection limit rate 50
ip source binding 0050.7966.1e01 vlan 30 10.30.0.11 interface g0/1
ip verify source
<span class="c">! VLAN hopping aur STP</span>
switchport nonegotiate
switchport trunk native vlan 999
spanning-tree bpduguard enable
spanning-tree guard root</pre>
<pre class="out"><span class="hl">show port-security [interface | address]</span>
show interfaces status err-disabled
show errdisable recovery
<span class="hl">show ip dhcp snooping [binding]</span>
<span class="hl">show ip arp inspection [interfaces | vlan | statistics]</span>
show ip source binding
show ip verify source
show interfaces switchport
show authentication sessions</pre>

<div class="eg"><p><b>Worked example: last-minute exam drill.</b> Question: "Port 0 violations dikhata hai, port up hai, lekin us par teesra device communicate nahi kar pa raha. Maximum 2 hai." Answer path: do secure MACs seekhe gaye, teesra violation hai, port up hai aur counter nahi hila, isliye mode <b>protect</b> hona chahiye. Agar port up rehte counter hilta, to mode restrict hota; agar port err-disabled hota, to shutdown.</p></div>

<div class="warn"><p><b>Exam mein common galtiyan.</b> Restrict aur protect ko mix karna; sochna ki sticky matlab "saved"; bhoolna ki DAI snooping par depend karta hai; maanna ki port security ARP spoofing rokta hai; fix ke roop mein "user port trust karo" chunna; BPDU Guard (err-disable) ko Root Guard (root-inconsistent) se confuse karna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Jab koi answer security feature band karke ya access port trust karke problem fix karta hai, to woh lagbhag hamesha galat hota hai. Woh answer dhoondho jo protection rakhe aur asli cause address kare: uplink par missing trust, missing binding, option 82, galat violation mode ya bahut kam rate limit.</p></div>

<div class="scn"><h4>Audit jo pass hua</h4><p>Team ne is module ka template roll out kiya, uske ek saal baad ek bank branch network ka audit hua. Auditor ne MAC flooding tool try kiya (port restrict mein gaya aur log kiya), rogue DHCP server (offers untrusted port par drop), ARP poisoning (DAI ne deny aur log kiya), DTP trunk negotiation (nonegotiate, koi trunk nahi), laptop se BPDU (BPDU Guard ne port err-disable kiya), aur spare port par unknown laptop (port shut, 802.1X unauthorized). Har attempt ne port, MAC aur time ke saath ek syslog line chhodi.</p><p><b>Seekh:</b> layered Layer 2 security kisi ek feature par depend nahi karti. Har ek alag trick cover karta hai, aur har ek saboot chhodta hai.</p></div>

<div class="iv"><p class="q">"Agar aap aaj ek naya access switch harden kar rahe ho, to kya configure karoge aur kis order mein?"</p><p>Strong answer: har edge port par nonegotiate ke saath static access, unused ports parking VLAN mein shut, trunks par unused native VLAN; edge ports par BPDU Guard ke saath PortFast; sensible maximums ke saath port security; per VLAN DHCP snooping jismein sirf uplinks trusted, option 82 ka faisla, rate limits aur binding database; phir infrastructure ports par trust aur static hosts ke liye bindings ke saath DAI (aur jahan zaroori ho IPSG); storm control; aur jahan organisation ke paas RADIUS hai wahan MAB ke saath 802.1X. Verification commands aur violations ki monitoring se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har Layer 2 threat ka matching control hai; pairs pakke yaad rakho.</li>
<li>Defaults matter karte hain: port security max 1 aur shutdown; snooping ports untrusted; option 82 on; DAI 15 pps.</li>
<li>Order matter karta hai: DAI aur IPSG se pehle snooping aur bindings; enforcement se pehle trust.</li>
<li>Err-disabled reasons aur syslog messages diagnosis ka sabse tez raasta hain.</li>
<li>Sahi fix security on rakhta hai aur asli cause hatata hai.</li>
</ul></div>
`}};export{e as default};