var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a noisy open hall where everyone hears every shout, and you finish with a well-run office building: separate floors (VLANs), a badge system on the shared staircase (802.1Q), clear rules for visitors without badges (native VLAN), doors that never open by negotiation (DTP off), and no single notice board that can wipe everyone's records (VTP transparent or off). Use this chapter as your final revision sheet before the labs, the quiz and the exam.</p>

<h3>Which port type? A one-picture decision</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Decision: what is connected decides access, access plus voice, or trunk">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">What is plugged in?</text>
<rect x="20" y="110" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="132" text-anchor="middle" class="svg-ink" font-size="13">PC, printer, camera</text><text x="110" y="150" text-anchor="middle" class="svg-muted" font-size="12">mode access</text>
<rect x="230" y="110" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">Phone + PC</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">access + voice vlan</text>
<rect x="440" y="110" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="13">Switch, router, host</text><text x="530" y="150" text-anchor="middle" class="svg-muted" font-size="12">trunk + nonegotiate</text>
<line x1="280" y1="54" x2="110" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="54" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="54" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="110" y="190" text-anchor="middle" class="svg-muted" font-size="12">untagged</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">data untagged, voice tagged</text>
<text x="530" y="190" text-anchor="middle" class="svg-muted" font-size="12">tagged, native 999, pruned list</text>
<text x="320" y="220" text-anchor="middle" class="svg-accent" font-size="12">Nothing plugged in: parking VLAN + shutdown</text>
</svg><p class="cap">Every switch port you ever configure falls into one of these four boxes.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain learn, forward, flood and filter, and count collision and broadcast domains.</li>
<li>Explain why VLANs exist and map each VLAN to one subnet.</li>
<li>Recite the VLAN ranges and say which VLANs can never be deleted.</li>
<li>Create and name VLANs, configure static access ports and verify with <code>show vlan brief</code>.</li>
<li>Add a voice VLAN and explain the roles of CDP and LLDP-MED.</li>
<li>Draw the 802.1Q tag and decode a tag from hex.</li>
<li>Configure a static trunk, set a pruned allowed list and change it safely with <code>add</code> and <code>remove</code>.</li>
<li>Set a matching, unused native VLAN and recognise a mismatch from logs and spanning-tree output.</li>
<li>Predict any DTP combination and harden ports against switch spoofing.</li>
<li>Explain VTP modes, the revision danger and how to neutralise it.</li>
<li>Troubleshoot with the follow-the-frame workflow and close a ticket like INC-2207.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Broadcast domain</dt><dd>Devices reached by one broadcast; one per VLAN.</dd>
<dt>Access port</dt><dd>One data VLAN, untagged; optional voice VLAN, tagged.</dd>
<dt>Trunk</dt><dd>Link carrying many VLANs with 802.1Q tags.</dd>
<dt>TPID / VID / PCP</dt><dd>0x8100 tag identifier / 12-bit VLAN ID / 3-bit priority (CoS).</dd>
<dt>Native VLAN</dt><dd>VLAN sent untagged on a trunk; default 1; must match on both ends.</dd>
<dt>DTP</dt><dd>Cisco trunk negotiation: access, trunk, dynamic desirable, dynamic auto, nonegotiate.</dd>
<dt>VTP</dt><dd>Cisco VLAN database sharing: server, client, transparent, off; revision number.</dd>
<dt>Inactive port</dt><dd>Access port whose VLAN no longer exists; does not forward.</dd>
<dt>Switch spoofing / double tagging</dt><dd>The two VLAN hopping attacks; defeated by static modes and an unused native VLAN.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>MAC aging</td><td>300 seconds default; switches learn source MACs only</td></tr>
<tr><td>Usable VLANs</td><td>1 to 4094; normal 1 to 1005, extended 1006 to 4094; 1 and 1002 to 1005 cannot be deleted</td></tr>
<tr><td>VLAN storage</td><td>Normal range in flash:vlan.dat</td></tr>
<tr><td>802.1Q tag</td><td>4 bytes after source MAC; TPID 0x8100; PCP 3, DEI 1, VID 12 bits; frame up to 1522 bytes</td></tr>
<tr><td>ISL</td><td>Cisco legacy, encapsulates, 30 bytes overhead, no native VLAN</td></tr>
<tr><td>Voice VLAN</td><td>Voice tagged with CoS 5, data untagged; learned via CDP or LLDP-MED</td></tr>
<tr><td>Allowed list</td><td>Default 1 to 4094; bare list replaces; use add/remove</td></tr>
<tr><td>Native mismatch</td><td>Trunk stays up; CDP NATIVE_VLAN_MISMATCH; PVST+ PVID_Inc blocks the two VLANs</td></tr>
<tr><td>DTP</td><td>auto + auto = access; desirable + auto = trunk; access + trunk = mismatch</td></tr>
<tr><td>VTP</td><td>Default server; higher revision wins even from a client; v3 for extended VLANs</td></tr>
<tr><td>Deleted VLAN</td><td>Ports become inactive, not VLAN 1</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! VLANs and access ports</span>
vlan 10
 name SALES
interface range g0/1 - 2
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 110
<span class="c">! Trunks</span>
interface g0/0
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport nonegotiate
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,110,999
 switchport trunk allowed vlan add 30
 switchport trunk allowed vlan remove 20
<span class="c">! Global</span>
vtp mode transparent
vlan dot1q tag native
lldp run
<span class="c">! Verify</span>
show vlan brief
show interfaces trunk
show interfaces g0/0 switchport
show mac address-table vlan 10
show vtp status
show spanning-tree vlan 999</pre>

<div class="eg"><p><b>Worked example: a two-minute self-test.</b> A new access switch uplink shows <code>Administrative Mode: dynamic auto</code>, <code>Operational Mode: static access</code>. The distribution side shows the same. VLAN 60 is allowed on the distribution trunk but missing from "allowed and active" there. Answer: (1) no trunk, because auto + auto; configure both ends as trunk with nonegotiate; (2) VLAN 60 must be created on the distribution switch. If you got both, you are ready for the quiz.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Mixing up the native VLAN (untagged on trunks) with the default VLAN (VLAN 1) and the management VLAN (the SVI); thinking <code>show vlan brief</code> shows trunks; thinking a native mismatch downs the trunk; forgetting that the allowed list and native VLAN are configured on both ends separately.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Hosts in different VLANs always need a router, even on one switch. The voice VLAN port is still an access port. VTP clients can overwrite a domain. 802.1Q inserts a tag; ISL encapsulates.</p></div>

<div class="scn"><h4>The new-branch checklist</h4><p>A network team turned this module into a one-page checklist for every new branch switch: delete vlan.dat before staging; VTP transparent; VLANs created and named from the template; user ports static access with the right data and voice VLAN; spare ports in parking VLAN 998 and shut down; uplinks static trunk, nonegotiate, native 999 on both ends, explicit allowed list; after install, <code>show interfaces trunk</code> on both ends compared line by line with the design. Their branch-switch incidents in the first week after go-live dropped to almost zero.</p><p><b>Lesson:</b> the facts in this module turn into a checklist. Engineers who use one rarely create the tickets they later have to solve.</p></div>

<div class="iv"><p class="q">"Walk me through how you would connect a new access switch to the distribution layer."</p><p>Strong answer: create and name the VLANs, set VTP transparent, configure user ports as static access with data and voice VLANs, park unused ports, then build the uplink as a static 802.1Q trunk with nonegotiate, an unused native VLAN matching on both ends and an explicit allowed list. Verify with <code>show interfaces trunk</code> on both switches, check the last block, test from hosts to their gateways, and save.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VLAN is a broadcast domain and a subnet; routing is needed between VLANs.</li>
<li>Access ports are untagged; voice ports add a tagged voice VLAN; trunks tag with 802.1Q.</li>
<li>Manage the allowed list with add and remove; match an unused native VLAN on both ends.</li>
<li>Hard-code port modes, turn off DTP on trunks and run VTP transparent or off.</li>
<li>Troubleshoot by following the frame and checking both ends of every trunk.</li>
</ul></div>
`,hi:`
<p>Aapne ek shor bhare khule hall se shuru kiya jahan har koi har aawaz sunta hai, aur ek achhi tarah chalti office building par khatam kar rahe ho: alag floors (VLANs), shared staircase par badge system (802.1Q), bina badge visitors ke liye saaf rules (native VLAN), aise darwaze jo negotiation se kabhi nahi khulte (DTP off), aur koi aisa ek notice board nahi jo sabke records mita sake (VTP transparent ya off). Is chapter ko labs, quiz aur exam se pehle apni final revision sheet ki tarah use karo.</p>

<h3>Kaunsa port type? Ek picture mein decision</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Decision: kya juda hai yeh decide karta hai access, access plus voice, ya trunk">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Kya plug hai?</text>
<rect x="20" y="110" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="132" text-anchor="middle" class="svg-ink" font-size="13">PC, printer, camera</text><text x="110" y="150" text-anchor="middle" class="svg-muted" font-size="12">mode access</text>
<rect x="230" y="110" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">Phone + PC</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">access + voice vlan</text>
<rect x="440" y="110" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="13">Switch, router, host</text><text x="530" y="150" text-anchor="middle" class="svg-muted" font-size="12">trunk + nonegotiate</text>
<line x1="280" y1="54" x2="110" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="54" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="54" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="110" y="190" text-anchor="middle" class="svg-muted" font-size="12">untagged</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">data untagged, voice tagged</text>
<text x="530" y="190" text-anchor="middle" class="svg-muted" font-size="12">tagged, native 999, pruned list</text>
<text x="320" y="220" text-anchor="middle" class="svg-accent" font-size="12">Kuch plug nahi: parking VLAN + shutdown</text>
</svg><p class="cap">Aap jo bhi switch port kabhi configure karoge, woh in chaar boxes mein se kisi ek mein aata hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Learn, forward, flood aur filter samjhao, aur collision aur broadcast domains gino.</li>
<li>Samjhao ki VLANs kyun exist karte hain aur har VLAN ko ek subnet se map karo.</li>
<li>VLAN ranges bolo aur batao kaunse VLANs kabhi delete nahi ho sakte.</li>
<li>VLANs banao aur naam do, static access ports configure karo aur <code>show vlan brief</code> se verify karo.</li>
<li>Voice VLAN add karo aur CDP aur LLDP-MED ke roles samjhao.</li>
<li>802.1Q tag draw karo aur hex se tag decode karo.</li>
<li>Static trunk configure karo, pruned allowed list set karo aur use <code>add</code> aur <code>remove</code> se safely badlo.</li>
<li>Matching, unused native VLAN set karo aur logs aur spanning-tree output se mismatch pehchano.</li>
<li>Koi bhi DTP combination predict karo aur ports ko switch spoofing ke against harden karo.</li>
<li>VTP modes, revision ka khatra aur use neutralise karne ka tareeka samjhao.</li>
<li>Follow-the-frame workflow se troubleshoot karo aur INC-2207 jaisa ticket close karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Broadcast domain</dt><dd>Ek broadcast jin devices tak pahunchta hai; har VLAN ka ek.</dd>
<dt>Access port</dt><dd>Ek data VLAN, untagged; optional voice VLAN, tagged.</dd>
<dt>Trunk</dt><dd>802.1Q tags ke saath kai VLANs carry karne wala link.</dd>
<dt>TPID / VID / PCP</dt><dd>0x8100 tag identifier / 12-bit VLAN ID / 3-bit priority (CoS).</dd>
<dt>Native VLAN</dt><dd>Trunk par untagged bheja jaane wala VLAN; default 1; dono ends par match hona chahiye.</dd>
<dt>DTP</dt><dd>Cisco trunk negotiation: access, trunk, dynamic desirable, dynamic auto, nonegotiate.</dd>
<dt>VTP</dt><dd>Cisco VLAN database sharing: server, client, transparent, off; revision number.</dd>
<dt>Inactive port</dt><dd>Access port jiska VLAN ab exist nahi karta; forward nahi karta.</dd>
<dt>Switch spoofing / double tagging</dt><dd>Do VLAN hopping attacks; static modes aur unused native VLAN se haarte hain.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>MAC aging</td><td>Default 300 seconds; switches sirf source MACs seekhte hain</td></tr>
<tr><td>Usable VLANs</td><td>1 se 4094; normal 1 se 1005, extended 1006 se 4094; 1 aur 1002 se 1005 delete nahi hote</td></tr>
<tr><td>VLAN storage</td><td>Normal range flash:vlan.dat mein</td></tr>
<tr><td>802.1Q tag</td><td>Source MAC ke baad 4 bytes; TPID 0x8100; PCP 3, DEI 1, VID 12 bits; frame 1522 bytes tak</td></tr>
<tr><td>ISL</td><td>Cisco legacy, encapsulate karta hai, 30 bytes overhead, native VLAN nahi</td></tr>
<tr><td>Voice VLAN</td><td>Voice CoS 5 ke saath tagged, data untagged; CDP ya LLDP-MED se seekha jaata hai</td></tr>
<tr><td>Allowed list</td><td>Default 1 se 4094; bare list replace karti hai; add/remove use karo</td></tr>
<tr><td>Native mismatch</td><td>Trunk up rehta hai; CDP NATIVE_VLAN_MISMATCH; PVST+ PVID_Inc do VLANs block karta hai</td></tr>
<tr><td>DTP</td><td>auto + auto = access; desirable + auto = trunk; access + trunk = mismatch</td></tr>
<tr><td>VTP</td><td>Default server; zyada revision jeetta hai, client se bhi; extended VLANs ke liye v3</td></tr>
<tr><td>Deleted VLAN</td><td>Ports inactive ho jaate hain, VLAN 1 nahi</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! VLANs aur access ports</span>
vlan 10
 name SALES
interface range g0/1 - 2
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 110
<span class="c">! Trunks</span>
interface g0/0
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport nonegotiate
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,110,999
 switchport trunk allowed vlan add 30
 switchport trunk allowed vlan remove 20
<span class="c">! Global</span>
vtp mode transparent
vlan dot1q tag native
lldp run
<span class="c">! Verify</span>
show vlan brief
show interfaces trunk
show interfaces g0/0 switchport
show mac address-table vlan 10
show vtp status
show spanning-tree vlan 999</pre>

<div class="eg"><p><b>Worked example: do minute ka self-test.</b> Naye access switch ka uplink <code>Administrative Mode: dynamic auto</code>, <code>Operational Mode: static access</code> dikhata hai. Distribution side bhi yahi dikhati hai. VLAN 60 distribution trunk par allowed hai par wahan "allowed and active" se gayab hai. Jawab: (1) trunk nahi hai, kyunki auto + auto; dono ends ko nonegotiate ke saath trunk configure karo; (2) VLAN 60 distribution switch par banana hoga. Agar dono sahi the, to aap quiz ke liye ready ho.</p></div>

<div class="warn"><p><b>Last-minute galtiyan jinse bachna hai.</b> Native VLAN (trunks par untagged) ko default VLAN (VLAN 1) aur management VLAN (SVI) se mila dena; sochna ki <code>show vlan brief</code> trunks dikhata hai; sochna ki native mismatch trunk ko down karta hai; bhool jaana ki allowed list aur native VLAN dono ends par alag alag configure hote hain.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Alag VLANs ke hosts ko hamesha router chahiye, ek switch par bhi. Voice VLAN wala port phir bhi access port hai. VTP clients domain ko overwrite kar sakte hain. 802.1Q tag insert karta hai; ISL encapsulate karta hai.</p></div>

<div class="scn"><h4>Nayi branch ki checklist</h4><p>Ek network team ne is module ko har naye branch switch ke liye ek page ki checklist bana diya: staging se pehle vlan.dat delete; VTP transparent; VLANs template se bane aur named; user ports sahi data aur voice VLAN ke saath static access; spare ports parking VLAN 998 mein aur shutdown; uplinks static trunk, nonegotiate, dono ends par native 999, explicit allowed list; install ke baad dono ends par <code>show interfaces trunk</code> ko design se line by line compare karna. Go-live ke pehle hafte mein unke branch-switch incidents lagbhag zero ho gaye.</p><p><b>Seekh:</b> is module ke facts ek checklist ban jaate hain. Jo engineers checklist use karte hain, woh shayad hi aise tickets banate hain jo baad mein unhe khud solve karne padein.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki aap naye access switch ko distribution layer se kaise jodoge."</p><p>Strong answer: VLANs banao aur naam do, VTP transparent set karo, user ports ko data aur voice VLANs ke saath static access configure karo, unused ports park karo, phir uplink ko static 802.1Q trunk banao nonegotiate ke saath, dono ends par matching unused native VLAN aur explicit allowed list. Dono switches par <code>show interfaces trunk</code> se verify karo, last block check karo, hosts se unke gateways tak test karo, aur save karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN ek broadcast domain aur ek subnet hai; VLANs ke beech routing chahiye.</li>
<li>Access ports untagged hain; voice ports ek tagged voice VLAN jodte hain; trunks 802.1Q se tag karte hain.</li>
<li>Allowed list ko add aur remove se manage karo; dono ends par unused native VLAN match karo.</li>
<li>Port modes hard-code karo, trunks par DTP band karo aur VTP transparent ya off chalao.</li>
<li>Frame follow karke aur har trunk ke dono ends check karke troubleshoot karo.</li>
</ul></div>
`}};export{e as default};