var e={id:`profiles`,h:{en:`Service profiles: creation, association and server pools`,hi:`Service profiles: creation, association aur server pools`},body:{en:`
<p>An actor is a person; a role is a script. The same actor can play different roles, and a role can be handed to a new actor if the first one falls ill. In UCS the blade is the actor and the <b>service profile</b> is the role. This chapter is about writing the role, casting it onto a blade, and keeping a bench of understudies ready.</p>

<h3>What a service profile contains</h3>
<table class="cmp"><tr><th>Part</th><th>Examples</th><th>Comes from</th></tr>
<tr><td>Identity</td><td>UUID, one MAC per vNIC, WWNN, one WWPN per vHBA, CIMC management IP</td><td>Pools</td></tr>
<tr><td>Connectivity</td><td>vNICs (fabric, VLANs, MTU), vHBAs (fabric, VSAN), placement</td><td>vNIC/vHBA templates, connectivity policies</td></tr>
<tr><td>Behaviour</td><td>Boot order, BIOS, firmware, maintenance, local disk, scrub, power</td><td>Policies</td></tr>
<tr><td>Assignment</td><td>Which blade or rack server it runs on, or which server pool it draws from</td><td>Association</td></tr>
</table>
<p>A profile is associated with exactly one physical server at a time, and a server carries at most one profile.</p>

<h3>Three ways to create a profile</h3>
<ul>
<li><b>Expert wizard</b>: build one profile by hand. Fine for a one-off, poor for consistency.</li>
<li><b>From a template</b>: select the template ▸ <b>Create Service Profiles From Template</b>, give a naming prefix, a starting number and the number of instances. In Lab 2 the prefix ESX-0, start 1 and 2 instances give <b>ESX-01</b> and <b>ESX-02</b>, each bound to ESXi-SPT and each with its own identities from the pools.</li>
<li><b>Clone</b> an existing profile: the clone gets new identities from the same pools.</li>
</ul>
<p>After creation, open the profile's <b>Network</b> and <b>Storage</b> tabs: ESX-01 shows eth0 = 00:25:B5:0A:00:00, eth1 = 00:25:B5:0B:00:00, fc0 = 20:00:00:25:B5:0A:00:00, fc1 = 20:00:00:25:B5:0B:00:00, because it was first to draw from the sequential pools. ESX-02 gets the :01 values.</p>

<h3>Association: what really happens</h3>
<p><b>Change Service Profile Association</b> offers: select an existing server, select from a <b>server pool</b>, <b>pre-provision</b> a chassis/slot (the profile associates automatically when a blade is inserted there), or assign later. Once you confirm, UCSM runs an association <b>FSM</b> (finite state machine) task that you can watch in the profile's FSM tab:</p>
<ol>
<li>Validate the profile: pools have free identities, VLANs and VSANs exist, the adapter supports the vNIC/vHBA count.</li>
<li>Boot the blade into a small utility OS (PNuOS) for configuration.</li>
<li>Program the VIC with the vNICs, vHBAs, MACs and WWPNs; apply BIOS and boot policies; flash firmware if a host firmware package requires it; apply the local disk policy.</li>
<li>Configure the FIs: virtual Ethernet and FC interfaces, VLAN and VSAN membership, pinning to uplinks.</li>
<li>Power the server on (unless the profile's desired power state says off) so it boots its real OS.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Association FSM steps">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="12">Validate</text><text x="65" y="95" text-anchor="middle" class="svg-muted" font-size="12">pools, VLANs</text>
<rect x="135" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="77" text-anchor="middle" class="svg-ink" font-size="12">Utility OS</text><text x="190" y="95" text-anchor="middle" class="svg-muted" font-size="12">on the blade</text>
<rect x="260" y="50" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="12">Program VIC</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">BIOS, firmware</text>
<rect x="395" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="450" y="77" text-anchor="middle" class="svg-ink" font-size="12">Configure FIs</text><text x="450" y="95" text-anchor="middle" class="svg-muted" font-size="12">vEth, vFC, pin</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="77" text-anchor="middle" class="svg-ink" font-size="12">Power on</text><text x="575" y="95" text-anchor="middle" class="svg-muted" font-size="12">OS boots</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Follow it in the profile's FSM tab; a failure names the step</text>
</svg><p class="cap">Association is a multi-step task, usually a few minutes on real hardware (about 25 seconds in the lab).</p></div>

<pre class="code"><span class="c">! Associate ESX-01 with blade 1/1 and watch the FSM</span>
UCS-A# scope org /
UCS-A /org # scope service-profile ESX-01
UCS-A /org/service-profile # associate server 1/1
UCS-A /org/service-profile* # commit-buffer
UCS-A /org/service-profile # show fsm status</pre>
<pre class="out">Service Profile: ESX-01
    FSM 1:
        Remote Result: Not Applicable
        Remote Error Code: None
        Remote Error Description:
        Status: Associate Wait For Assoc Completion
        Previous Status: Associate Setup Vnic Profile
        Timestamp: 2026-09-29T10:14:52
        Try: 0
<span class="hl">        Progress (%): 62</span></pre>

<h3>When association fails</h3>
<p>If validation fails, the profile's overall status becomes <b>Config Failure</b> and fault <b>F0327</b> explains why:</p>
<pre class="out">Severity  Code   Description
--------  -----  -----------------------------------------------------------
<span class="hl">Major     F0327  Service profile ESX-12 configuration failed due to insufficient-resources</span></pre>
<table class="cmp"><tr><th>Reason</th><th>Meaning</th><th>Fix</th></tr>
<tr><td>insufficient-resources</td><td>A pool (MAC, WWPN, UUID...) is empty, or the adapter cannot host that many vNICs</td><td>Add a block to the pool, or reduce vNICs</td></tr>
<tr><td>compute-unavailable</td><td>The chosen server is inoperable, missing, or already associated</td><td>Pick another server or fix the hardware</td></tr>
<tr><td>non-existent VLAN / VSAN</td><td>A template references a VLAN or VSAN that is not defined</td><td>Create it, or fix the template</td></tr>
</table>

<h3>Server pools and qualification</h3>
<p>A <b>server pool</b> (Servers ▸ Pools ▸ Server Pools) is a group of physical servers, for example ESX-BLADES or SPARES. A template can point at a pool; each new profile then takes a free server from it automatically. A <b>server pool qualification policy</b> describes what a server must have (CPU cores, memory, adapter type, chassis/slot range), and a <b>server pool policy</b> automatically puts every newly discovered server that matches into the right pool. The result: slide a new B200 with 512 GB RAM into any slot, and it lands in the ESX-BLADES pool without anyone touching UCSM.</p>

<h3>Disassociation</h3>
<p><b>Disassociate Service Profile</b> removes the identity from the blade: UCSM shuts the server down, clears the VIC, applies the scrub policy and returns the server to its pool as available. The profile keeps its identities and waits for its next server. This is the first half of the blade-replacement procedure in chapter 9.</p>

<div class="warn"><p><b>Common mistakes.</b> Associating a profile while the server is running an OS someone still uses (association reboots it). Pointing a template at a server pool that also contains your spares. Using a server pool with mixed hardware, so a profile tuned for one CPU generation lands on another. Ignoring the adapter limit when adding many vNICs.</p></div>
<div class="exam"><p><b>Exam tip.</b> Association methods: existing server, server pool, pre-provisioned slot, assign later. F0327 = service profile configuration failure; read the reason text. Qualification policies decide which servers enter a pool.</p></div>

<div class="scn"><h4>The four profiles that would not associate</h4><p>A team created 12 profiles from ESXi-SPT for a new chassis; eight associated and four stayed in Config Failure. The Faults tab showed F0327 insufficient-resources for ESX-09 to ESX-12. On LAN ▸ Pools ▸ MAC Pools, MAC-A showed size 16, assigned 16, free 0: each profile uses two vNICs on fabric A (8 profiles × 2 = 16). The engineer added a second block of 112 addresses to MAC-A and MAC-B; the four profiles re-validated on their own and associated within minutes. No reboot of the eight running hosts was needed.</p><p><b>Lesson:</b> read the reason in F0327; insufficient-resources almost always means a pool is empty, and adding a block fixes it without touching running servers.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when you associate a service profile."</p><p>Strong answer: UCSM validates the profile (pools, VLANs/VSANs, adapter capacity), boots the blade into a utility OS, programs the VIC with the profile's vNICs/vHBAs and identities, applies BIOS, boot, local disk and firmware policies, configures the FIs (vEth/vFC interfaces, VLAN/VSAN, pinning) and powers the server on. It is an FSM task you monitor in the FSM tab; failures show as Config Failure with F0327 and a reason such as insufficient-resources or compute-unavailable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A profile = identities + connectivity + policies + assignment; one profile per server at a time.</li>
<li>Create profiles from templates with a prefix, start number and count (ESX-0, 1, 2 → ESX-01, ESX-02).</li>
<li>Association is an FSM task: validate, utility OS, program VIC/BIOS/firmware, configure FIs, power on.</li>
<li>F0327 Config Failure reasons: insufficient-resources (empty pool), compute-unavailable (bad or busy server).</li>
<li>Server pools plus qualification policies automate which blades a template may use.</li>
</ul></div>
`,hi:`
<p>Actor ek insaan hai; role ek script hai. Same actor alag roles kar sakta hai, aur agar pehla actor beemar pad jaaye to role naye actor ko diya ja sakta hai. UCS mein blade actor hai aur <b>service profile</b> role hai. Yeh chapter role likhne, use blade par cast karne, aur understudies ki bench tayyar rakhne ke baare mein hai.</p>

<h3>Service profile mein kya hota hai</h3>
<table class="cmp"><tr><th>Hissa</th><th>Examples</th><th>Kahan se aata hai</th></tr>
<tr><td>Identity</td><td>UUID, har vNIC ka ek MAC, WWNN, har vHBA ka ek WWPN, CIMC management IP</td><td>Pools</td></tr>
<tr><td>Connectivity</td><td>vNICs (fabric, VLANs, MTU), vHBAs (fabric, VSAN), placement</td><td>vNIC/vHBA templates, connectivity policies</td></tr>
<tr><td>Behaviour</td><td>Boot order, BIOS, firmware, maintenance, local disk, scrub, power</td><td>Policies</td></tr>
<tr><td>Assignment</td><td>Kis blade ya rack server par chalta hai, ya kis server pool se leta hai</td><td>Association</td></tr>
</table>
<p>Ek profile ek time par bilkul ek physical server se associated hota hai, aur ek server par zyada se zyada ek profile hota hai.</p>

<h3>Profile banane ke teen tareeke</h3>
<ul>
<li><b>Expert wizard</b>: ek profile haath se banao. One-off ke liye theek, consistency ke liye kharab.</li>
<li><b>Template se</b>: template chuno ▸ <b>Create Service Profiles From Template</b>, naming prefix, starting number aur instances ki sankhya do. Lab 2 mein prefix ESX-0, start 1 aur 2 instances se <b>ESX-01</b> aur <b>ESX-02</b> bante hain, dono ESXi-SPT se bound aur dono ki pools se apni identities.</li>
<li>Existing profile ka <b>clone</b>: clone ko same pools se nayi identities milti hain.</li>
</ul>
<p>Banne ke baad profile ke <b>Network</b> aur <b>Storage</b> tabs kholo: ESX-01 dikhata hai eth0 = 00:25:B5:0A:00:00, eth1 = 00:25:B5:0B:00:00, fc0 = 20:00:00:25:B5:0A:00:00, fc1 = 20:00:00:25:B5:0B:00:00, kyunki sequential pools se pehle isne liya. ESX-02 ko :01 values milti hain.</p>

<h3>Association: asal mein kya hota hai</h3>
<p><b>Change Service Profile Association</b> ye options deta hai: existing server chuno, <b>server pool</b> se chuno, chassis/slot <b>pre-provision</b> karo (wahan blade daalte hi profile automatically associate hota hai), ya baad mein assign karo. Confirm karte hi UCSM ek association <b>FSM</b> (finite state machine) task chalata hai jise aap profile ke FSM tab mein dekh sakte ho:</p>
<ol>
<li>Profile validate karo: pools mein free identities hain, VLANs aur VSANs exist karte hain, adapter vNIC/vHBA count support karta hai.</li>
<li>Configuration ke liye blade ko ek chhote utility OS (PNuOS) mein boot karo.</li>
<li>VIC ko vNICs, vHBAs, MACs aur WWPNs se program karo; BIOS aur boot policies lagao; host firmware package maange to firmware flash karo; local disk policy lagao.</li>
<li>FIs configure karo: virtual Ethernet aur FC interfaces, VLAN aur VSAN membership, uplinks par pinning.</li>
<li>Server power on karo (jab tak profile ka desired power state off na kahe) taaki woh apna asli OS boot kare.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Association FSM steps">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="12">Validate</text><text x="65" y="95" text-anchor="middle" class="svg-muted" font-size="12">pools, VLANs</text>
<rect x="135" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="77" text-anchor="middle" class="svg-ink" font-size="12">Utility OS</text><text x="190" y="95" text-anchor="middle" class="svg-muted" font-size="12">blade par</text>
<rect x="260" y="50" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="12">VIC program</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">BIOS, firmware</text>
<rect x="395" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="450" y="77" text-anchor="middle" class="svg-ink" font-size="12">FIs configure</text><text x="450" y="95" text-anchor="middle" class="svg-muted" font-size="12">vEth, vFC, pin</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="77" text-anchor="middle" class="svg-ink" font-size="12">Power on</text><text x="575" y="95" text-anchor="middle" class="svg-muted" font-size="12">OS boot</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Profile ke FSM tab mein dekho; failure step ka naam batata hai</text>
</svg><p class="cap">Association ek multi-step task hai, real hardware par aam taur par kuch minute (lab mein lagbhag 25 second).</p></div>

<pre class="code"><span class="c">! ESX-01 ko blade 1/1 se associate karo aur FSM dekho</span>
UCS-A# scope org /
UCS-A /org # scope service-profile ESX-01
UCS-A /org/service-profile # associate server 1/1
UCS-A /org/service-profile* # commit-buffer
UCS-A /org/service-profile # show fsm status</pre>
<pre class="out">Service Profile: ESX-01
    FSM 1:
        Remote Result: Not Applicable
        Remote Error Code: None
        Remote Error Description:
        Status: Associate Wait For Assoc Completion
        Previous Status: Associate Setup Vnic Profile
        Timestamp: 2026-09-29T10:14:52
        Try: 0
<span class="hl">        Progress (%): 62</span></pre>

<h3>Jab association fail ho</h3>
<p>Agar validation fail ho, to profile ka overall status <b>Config Failure</b> ho jaata hai aur fault <b>F0327</b> wajah batata hai:</p>
<pre class="out">Severity  Code   Description
--------  -----  -----------------------------------------------------------
<span class="hl">Major     F0327  Service profile ESX-12 configuration failed due to insufficient-resources</span></pre>
<table class="cmp"><tr><th>Reason</th><th>Matlab</th><th>Fix</th></tr>
<tr><td>insufficient-resources</td><td>Koi pool (MAC, WWPN, UUID...) khaali hai, ya adapter itne vNICs host nahi kar sakta</td><td>Pool mein block jodo, ya vNICs kam karo</td></tr>
<tr><td>compute-unavailable</td><td>Chuna gaya server inoperable hai, missing hai, ya pehle se associated hai</td><td>Doosra server chuno ya hardware theek karo</td></tr>
<tr><td>non-existent VLAN / VSAN</td><td>Template aisa VLAN ya VSAN refer karta hai jo define nahi hai</td><td>Use banao, ya template theek karo</td></tr>
</table>

<h3>Server pools aur qualification</h3>
<p><b>Server pool</b> (Servers ▸ Pools ▸ Server Pools) physical servers ka group hai, jaise ESX-BLADES ya SPARES. Template ek pool ki taraf point kar sakta hai; tab har naya profile usme se free server automatically le leta hai. <b>Server pool qualification policy</b> batati hai ki server mein kya hona chahiye (CPU cores, memory, adapter type, chassis/slot range), aur <b>server pool policy</b> har naye discover hue matching server ko automatically sahi pool mein daal deti hai. Result: 512 GB RAM wala naya B200 kisi bhi slot mein lagao, aur woh bina kisi ke UCSM chhue ESX-BLADES pool mein pahunch jaata hai.</p>

<h3>Disassociation</h3>
<p><b>Disassociate Service Profile</b> blade se identity hata deta hai: UCSM server shut down karta hai, VIC clear karta hai, scrub policy lagata hai aur server ko available ki tarah uske pool mein wapas kar deta hai. Profile apni identities rakhta hai aur apne agle server ka wait karta hai. Yeh chapter 9 ki blade-replacement procedure ka pehla aadha hissa hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Profile tab associate karna jab server par aisa OS chal raha ho jise koi abhi bhi use kar raha hai (association use reboot karta hai). Template ko aise server pool par point karna jismein aapke spares bhi hain. Mixed hardware wala server pool use karna, jisse ek CPU generation ke liye tune kiya profile doosre par pahunch jaata hai. Bahut saare vNICs jodte waqt adapter limit ignore karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Association methods: existing server, server pool, pre-provisioned slot, assign later. F0327 = service profile configuration failure; reason text padho. Qualification policies decide karti hain ki kaunse servers pool mein aayenge.</p></div>

<div class="scn"><h4>Woh chaar profiles jo associate nahi hue</h4><p>Ek team ne naye chassis ke liye ESXi-SPT se 12 profiles banaye; aath associate hue aur chaar Config Failure mein rahe. Faults tab ne ESX-09 se ESX-12 ke liye F0327 insufficient-resources dikhaya. LAN ▸ Pools ▸ MAC Pools par MAC-A ne size 16, assigned 16, free 0 dikhaya: har profile fabric A par do vNICs use karta hai (8 profiles × 2 = 16). Engineer ne MAC-A aur MAC-B mein 112 addresses ka doosra block joda; chaaron profiles apne aap re-validate hue aur minutes mein associate ho gaye. Chal rahe aath hosts ka koi reboot nahi chahiye tha.</p><p><b>Seekh:</b> F0327 mein reason padho; insufficient-resources ka matlab lagbhag hamesha khaali pool hota hai, aur block jodne se bina running servers chhue fix ho jaata hai.</p></div>

<div class="iv"><p class="q">"Service profile associate karne par kya hota hai, step by step batao."</p><p>Strong answer: UCSM profile validate karta hai (pools, VLANs/VSANs, adapter capacity), blade ko utility OS mein boot karta hai, VIC ko profile ke vNICs/vHBAs aur identities se program karta hai, BIOS, boot, local disk aur firmware policies lagata hai, FIs configure karta hai (vEth/vFC interfaces, VLAN/VSAN, pinning) aur server power on karta hai. Yeh FSM task hai jise aap FSM tab mein monitor karte ho; failures Config Failure ke roop mein F0327 aur insufficient-resources ya compute-unavailable jaisi reason ke saath dikhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profile = identities + connectivity + policies + assignment; ek time par ek server par ek profile.</li>
<li>Templates se profiles prefix, start number aur count ke saath banao (ESX-0, 1, 2 → ESX-01, ESX-02).</li>
<li>Association FSM task hai: validate, utility OS, VIC/BIOS/firmware program, FIs configure, power on.</li>
<li>F0327 Config Failure reasons: insufficient-resources (khaali pool), compute-unavailable (kharab ya busy server).</li>
<li>Server pools plus qualification policies automate karti hain ki template kaunse blades use kar sakta hai.</li>
</ul></div>
`}};export{e as default};