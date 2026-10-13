var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one picture</h3>
<p>Each Bharat Retail Co site has a switch behind its MX: SW-MUM (core, with SVIs for VLAN 10 and 20), SW-BLR and SW-DEL. A switch is online only when its management VLAN 99 reaches the MX untagged: native VLAN 99 on both ends of the uplink trunk and 99 in the allowed list. APs behind it also need an enabled port with PoE and the right VLANs. Spanning tree protects against loops with the root at the core and BPDU guard at the edge. ACLs on the core filter VLAN 10 to VLAN 20 traffic by first match.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MS module summary stack">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Ports: enabled, PoE, speed, tags</text>
<rect x="20" y="56" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">VLANs: access, trunk, native 99, allowed list</text>
<rect x="20" y="102" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Spanning tree: RSTP, root = SW-MUM, BPDU guard</text>
<rect x="20" y="148" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">ACL on core SVIs: first match, narrow permit above wide deny</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Troubleshoot: who is offline, change log, uplink ends, device port, VLAN reach, policy</text>
</svg><p class="cap">Layers from the cable to the policy.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Read the Switch ports page and explain name, enabled, type, VLAN, PoE, speed, status and tags.</li>
<li>Bring an AP online: port enabled, PoE on, native 99 and allowed 10,30,99.</li>
<li>Explain access versus trunk, native VLAN and the allowed list.</li>
<li>Explain why a native VLAN mismatch on the uplink takes the switch offline.</li>
<li>Describe a broadcast storm and how RSTP prevents it.</li>
<li>Set the root bridge by priority at the core SW-MUM.</li>
<li>Explain BPDU guard, err-disabled and how to recover safely.</li>
<li>Write an ACL with a narrow permit above a wide deny and read hit counts.</li>
<li>Name port protection measures and run the six-step switch troubleshooting workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Port</dt><dd>One physical door on a switch; the unit you configure.</dd>
<dt>PoE</dt><dd>Power over Ethernet: power delivered over the data cable.</dd>
<dt>Access / trunk</dt><dd>One untagged VLAN / many tagged VLANs with an allowed list.</dd>
<dt>Native VLAN</dt><dd>The VLAN carried untagged on a trunk; must match at both ends.</dd>
<dt>Management VLAN</dt><dd>VLAN 99, used by switches and APs to reach the dashboard.</dd>
<dt>SVI</dt><dd>The switch's routed interface in a VLAN.</dd>
<dt>STP / RSTP</dt><dd>Protocol that blocks redundant links to prevent loops; RSTP is the rapid version.</dd>
<dt>Root bridge</dt><dd>The switch with the lowest bridge priority (MAC breaks ties).</dd>
<dt>BPDU guard</dt><dd>Err-disables an access port that receives a BPDU.</dd>
<dt>ACL</dt><dd>Ordered permit and deny rules; first match wins.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why is a switch offline after a trunk edit?</td><td>Native VLAN mismatch or 99 missing from the allowed list</td></tr>
<tr><td>Which switch is the STP root?</td><td>Lowest priority; lowest MAC on a tie</td></tr>
<tr><td>What does BPDU guard do?</td><td>Err-disables an access port that receives a BPDU</td></tr>
<tr><td>Where does the ACL run in our design?</td><td>On the core SW-MUM SVIs for VLAN 10 and 20</td></tr>
<tr><td>ACL evaluation</td><td>Top to bottom, first match wins</td></tr>
<tr><td>AP offline, switch online</td><td>Check port enabled, PoE on, VLAN native 99</td></tr>
<tr><td>Model numbers, PoE budgets, priority limits</td><td>Check the vendor documentation</td></tr></table>

<div class="eg"><p><b>Worked example.</b> SW-BLR and AP-BLR offline, MX-BLR online, log shows an edit of SW-BLR port 1 native VLAN. Compare ends: MX native 99, switch native 1. Set the switch to 99, save, and both devices return online. Then verify a PC in VLAN 10 still gets 10.2.10.x.</p></div>
<div class="note"><p><b>What does this module change on the wire/policy?</b> Port settings change forwarding and power; VLAN settings change tagging and reach; STP priority changes the tree; BPDU guard changes port behaviour on a BPDU; ACLs change which routed packets pass. Always confirm in the dashboard after saving.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Leaving the native VLAN at the default; leaving BPDU guard off; wide deny above narrow permit; trunk on a user port; testing only locally.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lower priority is better. Native VLAN is untagged. Err-disabled needs the cause removed first.</p></div>

<div class="scn"><h4>Quarter audit of the switches</h4><p>An auditor asked for evidence of switch hardening. The engineer showed unused ports disabled, BPDU guard on all access ports, SW-MUM as root, the ACL with hit counters and the change log. The review passed with one note: name all ports.</p><p><b>Lesson:</b> a tidy port table and an event log are your evidence.</p></div>

<div class="iv"><p class="q">"Summarise how you would harden and troubleshoot a small switched network."</p><p>Strong answer: disable unused ports, access mode on user ports, BPDU guard at the edge, root at the core, native VLAN equal to the management VLAN on uplinks, ACLs for inter-VLAN policy, and a fixed workflow that starts with which devices are offline and what changed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management VLAN 99 must be native on the uplink at both ends.</li>
<li>AP needs enabled port, PoE, native 99 and the SSID VLANs allowed.</li>
<li>Root bridge: lowest priority, set at the core; BPDU guard at the edge.</li>
<li>ACLs on the core SVIs: first match wins, read hit counts.</li>
<li>Vendor-specific numbers come from the vendor documentation.</li>
</ul></div>
`,hi:`
<h3>Poora module ek picture mein</h3>
<p>Bharat Retail Co ki har site par MX ke peeche ek switch hai: SW-MUM (core, VLAN 10 aur 20 ke SVIs ke saath), SW-BLR aur SW-DEL. Switch tabhi online hota hai jab uski management VLAN 99 MX tak untagged pahunchti hai: uplink trunk ke dono ends par native VLAN 99 aur allowed list mein 99. Uske peeche ke APs ko enabled port, PoE aur sahi VLANs bhi chahiye. Spanning tree loops se bachata hai: root core par aur BPDU guard edge par. Core par ACLs VLAN 10 se VLAN 20 traffic ko pehle match se filter karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MS module summary stack">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Ports: enabled, PoE, speed, tags</text>
<rect x="20" y="56" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">VLANs: access, trunk, native 99, allowed list</text>
<rect x="20" y="102" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Spanning tree: RSTP, root = SW-MUM, BPDU guard</text>
<rect x="20" y="148" width="600" height="38" rx="6" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">Core SVIs par ACL: pehla match, narrow permit wide deny ke upar</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Troubleshoot: kaun offline, change log, uplink ends, device port, VLAN reach, policy</text>
</svg><p class="cap">Cable se policy tak ki layers.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Switch ports page padhna aur name, enabled, type, VLAN, PoE, speed, status aur tags samjhana.</li>
<li>AP ko online lana: port enabled, PoE on, native 99 aur allowed 10,30,99.</li>
<li>Access versus trunk, native VLAN aur allowed list samjhana.</li>
<li>Samjhana ki uplink par native VLAN mismatch switch ko offline kyun karta hai.</li>
<li>Broadcast storm batana aur RSTP use kaise roke.</li>
<li>Core SW-MUM par priority se root bridge set karna.</li>
<li>BPDU guard, err-disabled aur safely recover kaise karna samjhana.</li>
<li>Narrow permit ko wide deny ke upar rakhkar ACL likhna aur hit counts padhna.</li>
<li>Port protection measures batana aur chhe-step switch troubleshooting workflow chalana.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Port</dt><dd>Switch par ek physical darwaza; configure hone wali unit.</dd>
<dt>PoE</dt><dd>Power over Ethernet: data cable par bijli.</dd>
<dt>Access / trunk</dt><dd>Ek untagged VLAN / allowed list ke saath kai tagged VLANs.</dd>
<dt>Native VLAN</dt><dd>Trunk par untagged chalne wali VLAN; dono ends par match honi chahiye.</dd>
<dt>Management VLAN</dt><dd>VLAN 99, jo switches aur APs dashboard tak pahunchne ke liye use karte hain.</dd>
<dt>SVI</dt><dd>Switch ka VLAN mein routed interface.</dd>
<dt>STP / RSTP</dt><dd>Protocol jo loops rokne ke liye redundant links block karta hai; RSTP rapid version hai.</dd>
<dt>Root bridge</dt><dd>Sabse kam bridge priority wala switch (tie par MAC).</dd>
<dt>BPDU guard</dt><dd>BPDU receive karne wale access port ko err-disable karta hai.</dd>
<dt>ACL</dt><dd>Ordered permit aur deny rules; pehla match jeetta hai.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Trunk edit ke baad switch offline kyun?</td><td>Native VLAN mismatch ya allowed list se 99 missing</td></tr>
<tr><td>STP root kaunsa switch?</td><td>Sabse kam priority; tie par sabse kam MAC</td></tr>
<tr><td>BPDU guard kya karta hai?</td><td>BPDU receive karne wale access port ko err-disable</td></tr>
<tr><td>Humare design mein ACL kahan chalta hai?</td><td>Core SW-MUM ke VLAN 10 aur 20 SVIs par</td></tr>
<tr><td>ACL evaluation</td><td>Upar se neeche, pehla match jeetta hai</td></tr>
<tr><td>AP offline, switch online</td><td>Port enabled, PoE on, VLAN native 99 check karo</td></tr>
<tr><td>Model numbers, PoE budgets, priority limits</td><td>Vendor documentation check karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> SW-BLR aur AP-BLR offline, MX-BLR online, log mein SW-BLR port 1 native VLAN ka edit. Ends compare: MX native 99, switch native 1. Switch ko 99 karo, save karo, aur dono devices online wapas aate hain. Phir verify karo ki VLAN 10 ka PC abhi bhi 10.2.10.x leta hai.</p></div>
<div class="note"><p><b>Is module se wire/policy par kya badalta hai?</b> Port settings forwarding aur power badalti hain; VLAN settings tagging aur reach badalti hain; STP priority tree badalti hai; BPDU guard BPDU aane par port ka behaviour badalta hai; ACLs badalte hain kaunse routed packets guzarte hain. Save ke baad hamesha dashboard mein confirm karo.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Native VLAN default par chhodna; BPDU guard off rakhna; narrow permit ke upar wide deny; user port par trunk; sirf locally test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kam priority behtar hai. Native VLAN untagged hai. Err-disabled mein pehle cause hatao.</p></div>

<div class="scn"><h4>Switches ka quarter audit</h4><p>Auditor ne switch hardening ka evidence maanga. Engineer ne unused ports disabled, saare access ports par BPDU guard, SW-MUM root, hit counters ke saath ACL aur change log dikhaya. Review ek note ke saath pass hua: saare ports ko naam do.</p><p><b>Seekh:</b> tidy port table aur event log aapka evidence hain.</p></div>

<div class="iv"><p class="q">"Chhote switched network ko harden aur troubleshoot kaise karoge, short mein batao."</p><p>Strong answer: unused ports disable, user ports par access mode, edge par BPDU guard, root core par, uplinks par native VLAN management VLAN ke barabar, inter-VLAN policy ke liye ACLs, aur fixed workflow jo is se shuru hota hai ki kaunse devices offline hain aur kya badla.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management VLAN 99 uplink par dono ends native honi chahiye.</li>
<li>AP ko enabled port, PoE, native 99 aur SSID VLANs allowed chahiye.</li>
<li>Root bridge: sabse kam priority, core par set; edge par BPDU guard.</li>
<li>Core SVIs par ACLs: pehla match jeetta hai, hit counts padho.</li>
<li>Vendor-specific numbers vendor documentation se aate hain.</li>
</ul></div>
`}};export{e as default};