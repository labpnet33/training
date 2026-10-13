var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs through a checklist before every take-off, even after thousands of flights, because a checklist catches what memory misses. This final chapter is your checklist for the data center foundations module. Use it before the quiz, before an interview and before the exam. If any line feels uncertain, the chapter number next to it tells you where to go back.</p>

<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary map">
<rect x="160" y="10" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="230" y="32" text-anchor="middle" class="svg-ink" font-size="13">Spine</text>
<rect x="340" y="10" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="410" y="32" text-anchor="middle" class="svg-ink" font-size="13">Spine</text>
<rect x="30" y="120" width="120" height="34" rx="6" fill="#bae6fd"/><text x="90" y="142" text-anchor="middle" class="svg-ink" font-size="12">Compute leaf</text>
<rect x="180" y="120" width="120" height="34" rx="6" fill="#bae6fd"/><text x="240" y="142" text-anchor="middle" class="svg-ink" font-size="12">Storage leaf</text>
<rect x="330" y="120" width="120" height="34" rx="6" fill="#bae6fd"/><text x="390" y="142" text-anchor="middle" class="svg-ink" font-size="12">Service leaf</text>
<rect x="480" y="120" width="130" height="34" rx="6" fill="#fde68a"/><text x="545" y="142" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="230" y1="44" x2="90" y2="120"/><line x1="230" y1="44" x2="240" y2="120"/><line x1="230" y1="44" x2="390" y2="120"/><line x1="230" y1="44" x2="545" y2="120"/><line x1="410" y1="44" x2="90" y2="120"/><line x1="410" y1="44" x2="240" y2="120"/><line x1="410" y1="44" x2="390" y2="120"/><line x1="410" y1="44" x2="545" y2="120"/></g>
<text x="320" y="84" text-anchor="middle" class="svg-accent" font-size="12">routed /31, OSPF, ECMP, MTU 9216</text>
<rect x="10" y="185" width="300" height="52" rx="8" fill="#bbf7d0"/><text x="160" y="207" text-anchor="middle" class="svg-ink" font-size="12">Overlay: VXLAN VNI, BGP EVPN, ACI</text><text x="160" y="226" text-anchor="middle" class="svg-muted" font-size="12">L2 anywhere, tenants, 16M segments</text>
<rect x="330" y="185" width="300" height="52" rx="8" fill="#e2e8f0"/><text x="480" y="207" text-anchor="middle" class="svg-ink" font-size="12">NX-OS: features, processes, VRFs</text><text x="480" y="226" text-anchor="middle" class="svg-muted" font-size="12">Nexus 9300 leaf, 9300/9500 spine</text>
</svg><p class="cap">Spine-leaf underlay, overlay on top, NX-OS on every box.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain north-south versus east-west traffic and why east-west drives design. (Ch 1)</li>
<li>I can draw three-tier, show where STP blocks and where the L2/L3 boundary sits, and explain what vPC fixed and what it did not. (Ch 2)</li>
<li>I can state the four Clos wiring rules and walk a packet leaf, spine, leaf with ECMP. (Ch 3)</li>
<li>I can explain what happens when one of N spines fails. (Ch 3)</li>
<li>I can calculate oversubscription both ways and check it at N-1. (Ch 4)</li>
<li>I can explain how leaf uplinks cap spines and spine ports cap leaves, and what a super-spine is. (Ch 4)</li>
<li>I can compare STP Layer 2, FabricPath/TRILL, pure Layer 3 and L3 underlay with VXLAN overlay. (Ch 5)</li>
<li>I can list what the underlay must provide and what the overlay adds. (Ch 6)</li>
<li>I can name Nexus families, the parts of a modular chassis and how breakout works. (Ch 7)</li>
<li>I can explain NX-OS features, process restart, HA, VDCs and the management VRF. (Ch 8)</li>
<li>I can configure a routed /31 uplink, loopback0 and OSPF point-to-point, verify FULL and save. (Ch 9)</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>East-west / north-south</dt><dd>Server-to-server traffic inside the DC / traffic entering or leaving the DC.</dd>
<dt>Failure domain</dt><dd>The part of the network affected by one fault.</dd>
<dt>vPC / MLAG</dt><dd>Two switches appear as one to a downstream port-channel so both links forward.</dd>
<dt>Clos / spine-leaf</dt><dd>Two-layer fabric; every leaf connects to every spine; any-to-any is leaf, spine, leaf.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath; flows hashed across equal routes.</dd>
<dt>Oversubscription</dt><dd>Downlink bandwidth ÷ uplink bandwidth on a leaf.</dd>
<dt>Super-spine</dt><dd>Extra layer joining pods: a 5-stage Clos.</dd>
<dt>Border leaf</dt><dd>Leaf connecting the fabric to WAN, internet or other DCs.</dd>
<dt>Underlay / overlay</dt><dd>Routed physical fabric / tunnels carrying tenant traffic on top.</dd>
<dt>VTEP, VNI</dt><dd>VXLAN tunnel endpoint (nve interface) / 24-bit segment ID.</dd>
<dt>FabricPath, TRILL</dt><dd>Legacy Layer-2 multipath technologies using IS-IS.</dd>
<dt>Supervisor, fabric module</dt><dd>Chassis control-plane card / card connecting all line cards.</dd>
<dt>VDC</dt><dd>Logical switch inside a Nexus 7000/7700.</dd>
<dt>PSS</dt><dd>NX-OS Persistent Storage Service used for stateful process restart.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact to remember</th></tr>
<tr><td>Oversubscription</td><td>Down ÷ up. 48 × 25G with 6 × 100G = 2:1; with 4 × 100G = 3:1. Target 3:1 on 1,200G needs 400G up.</td></tr>
<tr><td>Clos rules</td><td>Every leaf to every spine; no leaf-leaf transport; no spine-spine; endpoints on leaves only.</td></tr>
<tr><td>Scaling</td><td>More leaves for ports; more spines for bandwidth; spine ports cap leaves; leaf uplinks cap spines.</td></tr>
<tr><td>Spine failure</td><td>Lose 1/N of leaf uplink bandwidth; nothing isolated.</td></tr>
<tr><td>ECMP</td><td>Per flow (5-tuple hash), not per packet.</td></tr>
<tr><td>VXLAN</td><td>UDP 4789, 24-bit VNI (about 16M), about 50 bytes overhead; underlay MTU 9216.</td></tr>
<tr><td>VLAN</td><td>12-bit ID, 4,094 usable.</td></tr>
<tr><td>NX-OS features</td><td>Enable first; rejected command means check <code>show feature</code>; <code>no feature</code> deletes config.</td></tr>
<tr><td>NX-OS syntax</td><td><code>no switchport</code>, <code>ip address x/31</code>, <code>ip router ospf TAG area 0.0.0.0</code>, <code>copy running-config startup-config</code>.</td></tr>
<tr><td>Platforms</td><td>Nexus 9000: NX-OS or ACI mode; VDCs only on Nexus 7000/7700; mgmt0 in management VRF.</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! Build</span>
feature ospf
interface Ethernet1/1
  no switchport
  mtu 9216
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
<span class="c">! Verify</span>
show feature | include ospf
show ip interface brief
show ip ospf neighbors
show ip route 10.255.0.11
show running-config ospf
<span class="c">! Protect and save</span>
checkpoint BEFORE-CHANGE
copy running-config startup-config</pre>

<div class="warn"><p><b>Last-minute traps.</b> Writing the ratio upside down. Saying spine-leaf has "no Layer 2 at all". Forgetting N-1. Connecting border routers to spines. Using <code>write memory</code> on NX-OS. Pinging mgmt hosts without <code>vrf management</code>.</p></div>
<div class="exam"><p><b>Exam tip.</b> Many questions are scenario style: a symptom plus a CLI output. Read the highlighted state first (FULL, EXSTART, disabled, BLK, MTU), then match it to the concept. Most answers in this module come back to five ideas: feature enabled, routed link correct, MTU consistent, Clos rules respected, ratio calculated correctly.</p></div>

<div class="scn"><h4>The new-leaf runbook</h4><p>A data center team kept making small mistakes when adding leaves: a missing feature here, an MTU there, a forgotten loopback. The senior engineer turned this module into a runbook. Before cabling: confirm the leaf has a free port on every spine and that adding it keeps the target ratio. Before configuration: <code>checkpoint</code>. Configuration: features, routed /31 uplinks with <code>mtu 9216</code>, loopback0 and loopback1, OSPF point-to-point. Verification: one FULL neighbor per spine in <code>show ip ospf neighbors</code>, remote loopbacks with one path per spine in <code>show ip route</code>, and a <code>df-bit</code> ping at 8972 bytes to another leaf's VTEP loopback. Finally <code>copy running-config startup-config</code>. Leaf additions dropped from a two-hour task with frequent rollbacks to a 30-minute routine.</p><p><b>Lesson:</b> the foundations in this module become a repeatable checklist; checklists are how teams avoid repeating the same outage.</p></div>

<div class="iv"><p class="q">"Design a small data center fabric for 800 servers with dual 25G NICs and tell me how you would bring up the first leaf."</p><p>Strong answer: 800 servers × 2 ports = 1,600 25G ports; with 48-port leaves that is about 34 compute leaves (17 pairs), plus a border pair and a service pair. At 48 × 25G = 1,200G per leaf, four 100G uplinks give 3:1 (4:1 with one spine down), six give 2:1. Four fixed 64 × 100G spines leave room to grow to 64 leaves. Underlay: routed /31 links, loopbacks, OSPF point-to-point or eBGP, MTU 9216, ECMP. Overlay later: VXLAN EVPN or ACI. First leaf: enable features, configure uplinks and loopbacks, bring up OSPF, verify FULL neighbors and ECMP routes, test with a full-size DF ping, save.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>East-west traffic drove the move from three-tier with STP to routed spine-leaf with ECMP.</li>
<li>Clos rules, 1/N spine failure impact and oversubscription maths are the core design facts.</li>
<li>Routed underlay plus VXLAN overlay gives Layer 2 where needed and small failure domains.</li>
<li>Nexus 9000 in NX-OS or ACI mode is the current platform; NX-OS is modular and feature-based.</li>
<li>You can now build and verify a routed /31 uplink with OSPF on NX-OS, the base for every later module.</li>
</ul></div>
`,hi:`
<p>Pilot har take-off se pehle checklist chalata hai, hazaaron flights ke baad bhi, kyunki checklist woh pakad leti hai jo yaaddasht se chhoot jaata hai. Yeh aakhri chapter data center foundations module ki aapki checklist hai. Ise quiz se pehle, interview se pehle aur exam se pehle use karo. Agar koi line uncertain lage, to uske saath ka chapter number batata hai ki kahan wapas jaana hai.</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary map">
<rect x="160" y="10" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="230" y="32" text-anchor="middle" class="svg-ink" font-size="13">Spine</text>
<rect x="340" y="10" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="410" y="32" text-anchor="middle" class="svg-ink" font-size="13">Spine</text>
<rect x="30" y="120" width="120" height="34" rx="6" fill="#bae6fd"/><text x="90" y="142" text-anchor="middle" class="svg-ink" font-size="12">Compute leaf</text>
<rect x="180" y="120" width="120" height="34" rx="6" fill="#bae6fd"/><text x="240" y="142" text-anchor="middle" class="svg-ink" font-size="12">Storage leaf</text>
<rect x="330" y="120" width="120" height="34" rx="6" fill="#bae6fd"/><text x="390" y="142" text-anchor="middle" class="svg-ink" font-size="12">Service leaf</text>
<rect x="480" y="120" width="130" height="34" rx="6" fill="#fde68a"/><text x="545" y="142" text-anchor="middle" class="svg-ink" font-size="12">Border leaf</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="230" y1="44" x2="90" y2="120"/><line x1="230" y1="44" x2="240" y2="120"/><line x1="230" y1="44" x2="390" y2="120"/><line x1="230" y1="44" x2="545" y2="120"/><line x1="410" y1="44" x2="90" y2="120"/><line x1="410" y1="44" x2="240" y2="120"/><line x1="410" y1="44" x2="390" y2="120"/><line x1="410" y1="44" x2="545" y2="120"/></g>
<text x="320" y="84" text-anchor="middle" class="svg-accent" font-size="12">routed /31, OSPF, ECMP, MTU 9216</text>
<rect x="10" y="185" width="300" height="52" rx="8" fill="#bbf7d0"/><text x="160" y="207" text-anchor="middle" class="svg-ink" font-size="12">Overlay: VXLAN VNI, BGP EVPN, ACI</text><text x="160" y="226" text-anchor="middle" class="svg-muted" font-size="12">L2 kahin bhi, tenants, 16M segments</text>
<rect x="330" y="185" width="300" height="52" rx="8" fill="#e2e8f0"/><text x="480" y="207" text-anchor="middle" class="svg-ink" font-size="12">NX-OS: features, processes, VRFs</text><text x="480" y="226" text-anchor="middle" class="svg-muted" font-size="12">Nexus 9300 leaf, 9300/9500 spine</text>
</svg><p class="cap">Spine-leaf underlay, upar overlay, har box par NX-OS.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main north-south vs east-west traffic samjha sakta hoon aur bata sakta hoon ki east-west design ko kyun drive karta hai. (Ch 1)</li>
<li>Main three-tier draw kar sakta hoon, dikha sakta hoon ki STP kahan block karta hai aur L2/L3 boundary kahan hai, aur samjha sakta hoon ki vPC ne kya theek kiya aur kya nahi. (Ch 2)</li>
<li>Main chaar Clos wiring rules bata sakta hoon aur ECMP ke saath packet ko leaf, spine, leaf walk kara sakta hoon. (Ch 3)</li>
<li>Main samjha sakta hoon ki N mein se ek spine fail hone par kya hota hai. (Ch 3)</li>
<li>Main oversubscription dono taraf se calculate kar sakta hoon aur N-1 par check kar sakta hoon. (Ch 4)</li>
<li>Main samjha sakta hoon ki leaf uplinks spines ko kaise cap karte hain aur spine ports leaves ko, aur super-spine kya hai. (Ch 4)</li>
<li>Main STP Layer 2, FabricPath/TRILL, pure Layer 3 aur VXLAN overlay ke saath L3 underlay compare kar sakta hoon. (Ch 5)</li>
<li>Main list kar sakta hoon ki underlay ko kya dena chahiye aur overlay kya jodta hai. (Ch 6)</li>
<li>Main Nexus families, modular chassis ke parts aur breakout kaise kaam karta hai bata sakta hoon. (Ch 7)</li>
<li>Main NX-OS features, process restart, HA, VDCs aur management VRF samjha sakta hoon. (Ch 8)</li>
<li>Main routed /31 uplink, loopback0 aur OSPF point-to-point configure kar sakta hoon, FULL verify kar sakta hoon aur save kar sakta hoon. (Ch 9)</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>East-west / north-south</dt><dd>DC ke andar server-to-server traffic / DC mein aane ya bahar jaane wala traffic.</dd>
<dt>Failure domain</dt><dd>Network ka woh hissa jo ek fault se affect hota hai.</dd>
<dt>vPC / MLAG</dt><dd>Do switches downstream port-channel ko ek jaise dikhte hain taaki dono links forward karein.</dd>
<dt>Clos / spine-leaf</dt><dd>Do-layer fabric; har leaf har spine se judta hai; any-to-any leaf, spine, leaf hai.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath; flows barabar routes par hash hote hain.</dd>
<dt>Oversubscription</dt><dd>Leaf par downlink bandwidth ÷ uplink bandwidth.</dd>
<dt>Super-spine</dt><dd>Pods ko jodne wali extra layer: 5-stage Clos.</dd>
<dt>Border leaf</dt><dd>Woh leaf jo fabric ko WAN, internet ya dusre DCs se jodta hai.</dd>
<dt>Underlay / overlay</dt><dd>Routed physical fabric / upar tenant traffic le jaane wale tunnels.</dd>
<dt>VTEP, VNI</dt><dd>VXLAN tunnel endpoint (nve interface) / 24-bit segment ID.</dd>
<dt>FabricPath, TRILL</dt><dd>IS-IS use karne wali legacy Layer-2 multipath technologies.</dd>
<dt>Supervisor, fabric module</dt><dd>Chassis ka control-plane card / saare line cards ko jodne wala card.</dd>
<dt>VDC</dt><dd>Nexus 7000/7700 ke andar logical switch.</dd>
<dt>PSS</dt><dd>NX-OS Persistent Storage Service jo stateful process restart ke liye use hota hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakhne wala fact</th></tr>
<tr><td>Oversubscription</td><td>Down ÷ up. 48 × 25G ke saath 6 × 100G = 2:1; 4 × 100G ke saath = 3:1. 1,200G par 3:1 target ke liye 400G up chahiye.</td></tr>
<tr><td>Clos rules</td><td>Har leaf har spine se; koi leaf-leaf transport nahi; koi spine-spine nahi; endpoints sirf leaves par.</td></tr>
<tr><td>Scaling</td><td>Ports ke liye zyada leaves; bandwidth ke liye zyada spines; spine ports leaves ko cap karte hain; leaf uplinks spines ko.</td></tr>
<tr><td>Spine failure</td><td>Leaf uplink bandwidth ka 1/N jaata hai; kuch isolate nahi hota.</td></tr>
<tr><td>ECMP</td><td>Per flow (5-tuple hash), per packet nahi.</td></tr>
<tr><td>VXLAN</td><td>UDP 4789, 24-bit VNI (lagbhag 16M), lagbhag 50 bytes overhead; underlay MTU 9216.</td></tr>
<tr><td>VLAN</td><td>12-bit ID, 4,094 usable.</td></tr>
<tr><td>NX-OS features</td><td>Pehle enable karo; reject hua command matlab <code>show feature</code> check karo; <code>no feature</code> config delete karta hai.</td></tr>
<tr><td>NX-OS syntax</td><td><code>no switchport</code>, <code>ip address x/31</code>, <code>ip router ospf TAG area 0.0.0.0</code>, <code>copy running-config startup-config</code>.</td></tr>
<tr><td>Platforms</td><td>Nexus 9000: NX-OS ya ACI mode; VDCs sirf Nexus 7000/7700 par; mgmt0 management VRF mein.</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! Build</span>
feature ospf
interface Ethernet1/1
  no switchport
  mtu 9216
  ip address 10.1.1.1/31
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
<span class="c">! Verify</span>
show feature | include ospf
show ip interface brief
show ip ospf neighbors
show ip route 10.255.0.11
show running-config ospf
<span class="c">! Protect aur save</span>
checkpoint BEFORE-CHANGE
copy running-config startup-config</pre>

<div class="warn"><p><b>Last-minute traps.</b> Ratio ulta likhna. Yeh kehna ki spine-leaf mein "Layer 2 bilkul nahi". N-1 bhool jaana. Border routers ko spines se jodna. NX-OS par <code>write memory</code> use karna. <code>vrf management</code> ke bina mgmt hosts ko ping karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Bahut saare questions scenario style hote hain: ek symptom plus ek CLI output. Pehle highlighted state padho (FULL, EXSTART, disabled, BLK, MTU), phir use concept se match karo. Is module ke zyada tar answers paanch ideas par wapas aate hain: feature enabled, routed link sahi, MTU consistent, Clos rules follow hue, ratio sahi calculate hua.</p></div>

<div class="scn"><h4>Naye leaf ka runbook</h4><p>Ek data center team leaves jodte waqt baar baar chhoti galtiyan karti thi: kahin missing feature, kahin MTU, kahin bhoola hua loopback. Senior engineer ne is module ko ek runbook mein badal diya. Cabling se pehle: confirm karo ki leaf ke liye har spine par ek free port hai aur use jodne se target ratio bana rehta hai. Configuration se pehle: <code>checkpoint</code>. Configuration: features, <code>mtu 9216</code> ke saath routed /31 uplinks, loopback0 aur loopback1, OSPF point-to-point. Verification: <code>show ip ospf neighbors</code> mein har spine ka ek FULL neighbor, <code>show ip route</code> mein har spine ke liye ek path ke saath remote loopbacks, aur dusre leaf ke VTEP loopback tak 8972 bytes ka <code>df-bit</code> ping. Aakhir mein <code>copy running-config startup-config</code>. Leaf jodna baar baar rollbacks wale do ghante ke kaam se 30 minute ka routine ban gaya.</p><p><b>Seekh:</b> is module ki foundations ek repeatable checklist ban jaati hain; checklists se hi teams same outage dohraane se bachti hain.</p></div>

<div class="iv"><p class="q">"Dual 25G NICs wale 800 servers ke liye ek chhota data center fabric design karo aur batao ki pehla leaf kaise up karoge."</p><p>Strong answer: 800 servers × 2 ports = 1,600 25G ports; 48-port leaves ke saath lagbhag 34 compute leaves (17 pairs), plus ek border pair aur ek service pair. 48 × 25G = 1,200G per leaf par chaar 100G uplinks 3:1 dete hain (ek spine down par 4:1), chhe 2:1 dete hain. Chaar fixed 64 × 100G spines 64 leaves tak badhne ki jagah chhodte hain. Underlay: routed /31 links, loopbacks, OSPF point-to-point ya eBGP, MTU 9216, ECMP. Overlay baad mein: VXLAN EVPN ya ACI. Pehla leaf: features enable karo, uplinks aur loopbacks configure karo, OSPF up karo, FULL neighbors aur ECMP routes verify karo, full-size DF ping se test karo, save karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>East-west traffic ne STP wale three-tier se ECMP wale routed spine-leaf ki taraf move ko drive kiya.</li>
<li>Clos rules, 1/N spine failure impact aur oversubscription maths core design facts hain.</li>
<li>Routed underlay plus VXLAN overlay zaroorat ki jagah Layer 2 aur chhote failure domains deta hai.</li>
<li>NX-OS ya ACI mode mein Nexus 9000 current platform hai; NX-OS modular aur feature-based hai.</li>
<li>Ab aap NX-OS par OSPF ke saath routed /31 uplink build aur verify kar sakte ho, jo baad ke har module ka base hai.</li>
</ul></div>
`}};export{e as default};