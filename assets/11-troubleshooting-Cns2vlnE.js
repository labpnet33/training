var e={id:`troubleshoot`,h:{en:`Troubleshooting the SAN: a gate-by-gate workflow for "logged in but no disks"`,hi:`SAN troubleshooting: "logged in hai par disks nahi" ke liye gate-by-gate workflow`},body:{en:`
<p>When a car will not start, a good mechanic does not replace the engine first. He checks in order: is there fuel, does the battery turn the starter, is there a spark. Each check is cheap and rules out half of the possible causes. SAN troubleshooting is the same. You already know the six gates from chapter 1; this chapter turns them into a workflow with exact commands, and then works the two ticket labs.</p>

<h3>The fastest first question: does the array see the host?</h3>
<p>Before walking gate by gate, split the problem in half. On the array, run <code>show initiators</code> (or the array GUI's host connectivity view). If the host's WWPN is <b>not</b> logged in to the array port, the problem is in the fabric: gates 1 to 4. If it <b>is</b> logged in, the fabric is fine and the problem is masking or the host: gates 5 and 6. One command removes half of the search space.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="10" width="290" height="34" rx="6" fill="#e2e8f0"/><text x="165" y="32" text-anchor="middle" class="svg-ink" font-size="12">1 Link up? show interface brief</text>
<rect x="20" y="52" width="290" height="34" rx="6" fill="#bae6fd"/><text x="165" y="74" text-anchor="middle" class="svg-ink" font-size="12">2 FLOGI? show flogi database</text>
<rect x="20" y="94" width="290" height="34" rx="6" fill="#bae6fd"/><text x="165" y="116" text-anchor="middle" class="svg-ink" font-size="12">3 Same VSAN? VSAN column, fcns</text>
<rect x="20" y="136" width="290" height="34" rx="6" fill="#ddd6fe"/><text x="165" y="158" text-anchor="middle" class="svg-ink" font-size="12">4 Zoned and active? zoneset active</text>
<rect x="20" y="178" width="290" height="34" rx="6" fill="#fde68a"/><text x="165" y="200" text-anchor="middle" class="svg-ink" font-size="12">5 Masked? array show masking</text>
<rect x="20" y="220" width="290" height="34" rx="6" fill="#bbf7d0"/><text x="165" y="242" text-anchor="middle" class="svg-ink" font-size="12">6 Rescanned, all paths? path list</text>
<line x1="330" y1="10" x2="330" y2="170" stroke="#64748b" stroke-width="2"/><text x="345" y="95" class="svg-ink" font-size="13">Fabric (MDS)</text>
<line x1="330" y1="178" x2="330" y2="254" stroke="#64748b" stroke-width="2"/><text x="345" y="220" class="svg-ink" font-size="13">Array and host</text>
<rect x="470" y="150" width="160" height="56" rx="8" fill="#fed7aa"/><text x="550" y="172" text-anchor="middle" class="svg-ink" font-size="12">Split point:</text><text x="550" y="192" text-anchor="middle" class="svg-ink" font-size="12">array show initiators</text>
</svg><p class="cap">Walk the gates top to bottom, or start at the split point to decide which half to walk.</p></div>

<h3>The gate-by-gate commands</h3>
<table class="cmp"><tr><th>Gate</th><th>Command</th><th>Healthy</th><th>Typical fault</th></tr>
<tr><td>1 Link</td><td><code>show interface brief</code>, <code>show interface fc1/2</code></td><td>up, Oper Mode F, expected speed</td><td>down (Link failure or not-connected), Administratively down, wrong optic</td></tr>
<tr><td>2 FLOGI</td><td><code>show flogi database interface fc1/2</code></td><td>WWPN and FCID present</td><td>No login: HBA disabled, port in wrong mode</td></tr>
<tr><td>3 VSAN</td><td>VSAN column; <code>show fcns database vsan 10</code></td><td>Host scsi-fcp:init and array scsi-fcp:target in the same VSAN</td><td>Port left in VSAN 1</td></tr>
<tr><td>4 Zoning</td><td><code>show zone member pwwn … vsan 10</code>, <code>show zoneset active vsan 10</code>, <code>show zone status vsan 10</code></td><td>Both members with *, session none</td><td>Typo, zone not in zoneset, not reactivated, uncommitted session</td></tr>
<tr><td>5 Masking</td><td>Array <code>show initiators</code>, <code>show masking</code></td><td>Initiator logged in, LUN masked to its WWPN</td><td>LUN masked to nobody or to the old WWPN</td></tr>
<tr><td>6 Host</td><td><code>esxcli storage core adapter rescan --all</code>, <code>esxcli storage core path list</code></td><td>LUN visible, all expected paths active</td><td>No rescan done, dead paths on one HBA</td></tr>
</table>
<p>A few port states worth recognising: <b>down (Inactive)</b> means the port's VSAN is not active (for example suspended); <b>errDisabled</b> means the switch shut the port after errors; on ISLs, <b>isolated</b> with a reason such as domain overlap or zone merge failure means two switches could not agree on domain IDs or zoning when the link came up. For physical problems use <code>show interface fc1/2 counters</code> (CRC errors, link failures, loss of sync) and <code>show interface fc1/2 transceiver details</code> (receive power). <code>show logging log</code> shows when the link went up and down.</p>

<h3>Worked ticket 1: "the HBA is logged in, but ESXi finds no disks" (lab 4)</h3>
<p>ESX02 (WWPN 20:00:00:25:b5:aa:00:02) is on MDS-A fc1/2. The server team saw it in the FLOGI table and assumed the fabric was fine.</p>
<pre class="out">MDS-A# show flogi database
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
fc1/1            10      0x0a0000       20:00:00:25:b5:aa:00:01 20:00:00:25:b5:00:00:01
<span class="hl">fc1/2            1       0x0a0080       20:00:00:25:b5:aa:00:02 20:00:00:25:b5:00:00:02</span>
fc1/5            10      0x0a0020       50:06:01:60:3e:a0:12:34 50:06:01:60:be:a0:12:34</pre>
<ol>
<li><b>Gate 3 fails:</b> fc1/2 is in VSAN 1. Fix: <code>vsan database</code>, <code>vsan 10 interface fc1/2</code>. The host logs in again, now in VSAN 10.</li>
<li><b>Gate 4, member check:</b> <code>show zone name ESX02_ARRAY1 vsan 10</code> shows <code>pwwn 20:00:00:25:b5:aa:00:20</code>: two digits swapped. Fix: under the zone, <code>no member pwwn 20:00:00:25:b5:aa:00:20</code> and <code>member pwwn 20:00:00:25:b5:aa:00:02</code>.</li>
<li><b>Gate 4, activation check:</b> <code>show zoneset active vsan 10</code> lists only ESX01_ARRAY1. The zone was never added. Fix: <code>zoneset name ZS-FABRIC-A vsan 10</code>, <code>member ESX02_ARRAY1</code>, <code>zoneset activate name ZS-FABRIC-A vsan 10</code>.</li>
<li><b>Gates 5 and 6:</b> masking was already correct (LUN 1 to ESX02). Rescan ESX02: LUN 1 visible. Check ESX01 still sees LUN 0.</li>
</ol>
<p>Three independent faults in one ticket is realistic: each person who touched the change did "their part" and nobody verified the whole chain.</p>

<h3>Worked ticket 2: "the change was done last night" (lab 5)</h3>
<pre class="out">MDS-A# show zone status vsan 10
VSAN: 10 default-zone: deny distribute: full Interop: default
<span class="hl">    mode: enhanced merge-control: allow
    session: cli [admin]</span></pre>
<ol>
<li><b>Gate 4:</b> an open enhanced session. <code>show zone pending-diff vsan 10</code> shows only the planned ESX03 zone and activation, so commit it: <code>zone commit vsan 10</code>. Confirm <code>session: none</code> and a * next to ESX03-HBA1 in <code>show zoneset active vsan 10</code>.</li>
<li><b>Split point:</b> the array's <code>show initiators</code> now lists ESX03 with "Masked LUNs: none". Fabric is proven; the fault is gate 5.</li>
<li><b>Gate 5:</b> <code>lun mask 2 initiator 20:00:00:25:b5:aa:00:03</code>. <b>Gate 6:</b> rescan ESX03, LUN 2 (1000 GB) visible. Save MDS-A.</li>
</ol>

<div class="eg"><p><b>Worked example: reading path counts.</b> A host with 2 HBAs, each zoned to 2 array ports in its fabric, should show <b>2 × 2 = 4 paths</b> per LUN. If it shows 2, look for which HBA or which array port is missing: if all missing paths share vmhba2, look at fabric B; if they all share one target port, look at that array port and its zones on both fabrics.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Stopping at "it is in show flogi database". Fixing one fault and closing the ticket without re-testing the whole chain. Rebooting the host or the switch "to see if it helps", which destroys the evidence and risks other servers. Forgetting that after zoning or masking changes the host must rescan.</p></div>
<div class="exam"><p><b>Exam tip.</b> Order of checks: physical, FLOGI, VSAN, name server, zoning (active zoneset, member stars, pending session), LUN masking, host rescan and multipathing. Isolated E_Ports usually mean domain ID overlap or a zone merge failure.</p></div>

<div class="scn"><h4>The array port nobody suspected</h4><p>Twenty hosts reported degraded paths at the same time, but only on fabric A, and only half of their fabric A paths. Hosts, HBAs and zoning looked fine. The engineer compared the missing paths: every dead path targeted ARRAY1 spa1. <code>show interface</code> on the MDS port facing spa1 showed thousands of CRC errors and a low receive power in the transceiver details. A dirty connector at the array end was corrupting frames. After cleaning and reseating the cable, errors stopped and every host recovered its paths without any change to zoning.</p><p><b>Lesson:</b> find what the failing paths have in common (one HBA, one fabric, one target port) before touching configuration.</p></div>

<div class="iv"><p class="q">"A server is logged in to the fabric but sees no LUNs. How do you troubleshoot?"</p><p>Strong answer: confirm the facts, then walk the gates. FLOGI is present, so link and login are fine; check the VSAN in the FLOGI row and in <code>show fcns database</code>; check zoning with <code>show zone member pwwn</code> and <code>show zoneset active</code> (both members starred), and <code>show zone status</code> for an uncommitted enhanced session; on the array check <code>show initiators</code> and masking; then rescan the host and check paths. Mention the half-split (does the array see the initiator?) and that you verify on both fabrics and confirm other hosts are unaffected.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Split first: if the array does not see the initiator, the fault is in the fabric; if it does, check masking and the host.</li>
<li>Walk the gates in order: link, FLOGI, VSAN, zoning, masking, host rescan and paths.</li>
<li>Read whole rows: the VSAN column, member stars, the zoning session state.</li>
<li>Several faults can hide in one ticket; re-verify the entire chain after each fix.</li>
<li>For physical issues, check counters, transceiver power and what failing paths have in common.</li>
</ul></div>
`,hi:`
<p>Jab car start nahi hoti, achha mechanic pehle engine nahi badalta. Woh order mein check karta hai: petrol hai kya, battery starter ghumati hai kya, spark hai kya. Har check sasta hai aur aadhe possible causes ko hata deta hai. SAN troubleshooting bhi aisi hi hai. Chapter 1 ke chhe gates aap pehle se jaante ho; yeh chapter unhe exact commands ke saath ek workflow mein badalta hai, aur phir do ticket labs solve karta hai.</p>

<h3>Sabse fast pehla sawaal: kya array host ko dekhta hai?</h3>
<p>Gate by gate chalne se pehle problem ko aadha karo. Array par <code>show initiators</code> chalao (ya array GUI ka host connectivity view). Agar host ka WWPN array port par logged in <b>nahi</b> hai, problem fabric mein hai: gates 1 se 4. Agar logged in <b>hai</b>, fabric theek hai aur problem masking ya host mein hai: gates 5 aur 6. Ek command search space ka aadha hissa hata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="10" width="290" height="34" rx="6" fill="#e2e8f0"/><text x="165" y="32" text-anchor="middle" class="svg-ink" font-size="12">1 Link up? show interface brief</text>
<rect x="20" y="52" width="290" height="34" rx="6" fill="#bae6fd"/><text x="165" y="74" text-anchor="middle" class="svg-ink" font-size="12">2 FLOGI? show flogi database</text>
<rect x="20" y="94" width="290" height="34" rx="6" fill="#bae6fd"/><text x="165" y="116" text-anchor="middle" class="svg-ink" font-size="12">3 Same VSAN? VSAN column, fcns</text>
<rect x="20" y="136" width="290" height="34" rx="6" fill="#ddd6fe"/><text x="165" y="158" text-anchor="middle" class="svg-ink" font-size="12">4 Zoned aur active? zoneset active</text>
<rect x="20" y="178" width="290" height="34" rx="6" fill="#fde68a"/><text x="165" y="200" text-anchor="middle" class="svg-ink" font-size="12">5 Masked? array show masking</text>
<rect x="20" y="220" width="290" height="34" rx="6" fill="#bbf7d0"/><text x="165" y="242" text-anchor="middle" class="svg-ink" font-size="12">6 Rescan, saare paths? path list</text>
<line x1="330" y1="10" x2="330" y2="170" stroke="#64748b" stroke-width="2"/><text x="345" y="95" class="svg-ink" font-size="13">Fabric (MDS)</text>
<line x1="330" y1="178" x2="330" y2="254" stroke="#64748b" stroke-width="2"/><text x="345" y="220" class="svg-ink" font-size="13">Array aur host</text>
<rect x="470" y="150" width="160" height="56" rx="8" fill="#fed7aa"/><text x="550" y="172" text-anchor="middle" class="svg-ink" font-size="12">Split point:</text><text x="550" y="192" text-anchor="middle" class="svg-ink" font-size="12">array show initiators</text>
</svg><p class="cap">Gates upar se neeche chalo, ya split point se shuru karke tay karo ki kaunsa aadha hissa chalna hai.</p></div>

<h3>Gate-by-gate commands</h3>
<table class="cmp"><tr><th>Gate</th><th>Command</th><th>Healthy</th><th>Typical fault</th></tr>
<tr><td>1 Link</td><td><code>show interface brief</code>, <code>show interface fc1/2</code></td><td>up, Oper Mode F, expected speed</td><td>down (Link failure or not-connected), Administratively down, galat optic</td></tr>
<tr><td>2 FLOGI</td><td><code>show flogi database interface fc1/2</code></td><td>WWPN aur FCID present</td><td>Login nahi: HBA disabled, port galat mode mein</td></tr>
<tr><td>3 VSAN</td><td>VSAN column; <code>show fcns database vsan 10</code></td><td>Host scsi-fcp:init aur array scsi-fcp:target same VSAN mein</td><td>Port VSAN 1 mein chhoot gaya</td></tr>
<tr><td>4 Zoning</td><td><code>show zone member pwwn … vsan 10</code>, <code>show zoneset active vsan 10</code>, <code>show zone status vsan 10</code></td><td>Dono members * ke saath, session none</td><td>Typo, zone zoneset mein nahi, reactivate nahi hua, uncommitted session</td></tr>
<tr><td>5 Masking</td><td>Array <code>show initiators</code>, <code>show masking</code></td><td>Initiator logged in, LUN uske WWPN ko masked</td><td>LUN kisi ko masked nahi ya purane WWPN ko</td></tr>
<tr><td>6 Host</td><td><code>esxcli storage core adapter rescan --all</code>, <code>esxcli storage core path list</code></td><td>LUN visible, saare expected paths active</td><td>Rescan nahi hua, ek HBA par dead paths</td></tr>
</table>
<p>Kuch port states jinhe pehchanna zaroori hai: <b>down (Inactive)</b> ka matlab hai port ka VSAN active nahi hai (jaise suspended); <b>errDisabled</b> ka matlab hai switch ne errors ke baad port band kar diya; ISLs par, domain overlap ya zone merge failure jaise reason ke saath <b>isolated</b> ka matlab hai link up hone par do switches domain IDs ya zoning par agree nahi kar paaye. Physical problems ke liye <code>show interface fc1/2 counters</code> (CRC errors, link failures, loss of sync) aur <code>show interface fc1/2 transceiver details</code> (receive power) use karo. <code>show logging log</code> dikhata hai link kab up aur down hua.</p>

<h3>Worked ticket 1: "HBA logged in hai, par ESXi ko disks nahi milti" (lab 4)</h3>
<p>ESX02 (WWPN 20:00:00:25:b5:aa:00:02) MDS-A fc1/2 par hai. Server team ne use FLOGI table mein dekha aur maan liya ki fabric theek hai.</p>
<pre class="out">MDS-A# show flogi database
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
fc1/1            10      0x0a0000       20:00:00:25:b5:aa:00:01 20:00:00:25:b5:00:00:01
<span class="hl">fc1/2            1       0x0a0080       20:00:00:25:b5:aa:00:02 20:00:00:25:b5:00:00:02</span>
fc1/5            10      0x0a0020       50:06:01:60:3e:a0:12:34 50:06:01:60:be:a0:12:34</pre>
<ol>
<li><b>Gate 3 fail:</b> fc1/2 VSAN 1 mein hai. Fix: <code>vsan database</code>, <code>vsan 10 interface fc1/2</code>. Host dobara login karta hai, ab VSAN 10 mein.</li>
<li><b>Gate 4, member check:</b> <code>show zone name ESX02_ARRAY1 vsan 10</code> <code>pwwn 20:00:00:25:b5:aa:00:20</code> dikhata hai: do digits ulte. Fix: zone ke neeche <code>no member pwwn 20:00:00:25:b5:aa:00:20</code> aur <code>member pwwn 20:00:00:25:b5:aa:00:02</code>.</li>
<li><b>Gate 4, activation check:</b> <code>show zoneset active vsan 10</code> sirf ESX01_ARRAY1 list karta hai. Zone kabhi joda hi nahi gaya. Fix: <code>zoneset name ZS-FABRIC-A vsan 10</code>, <code>member ESX02_ARRAY1</code>, <code>zoneset activate name ZS-FABRIC-A vsan 10</code>.</li>
<li><b>Gates 5 aur 6:</b> masking pehle se sahi thi (LUN 1 ESX02 ko). ESX02 rescan karo: LUN 1 visible. Check karo ESX01 ko ab bhi LUN 0 dikhta hai.</li>
</ol>
<p>Ek ticket mein teen independent faults realistic hai: change ko chhoone wale har insaan ne "apna hissa" kiya aur kisi ne poori chain verify nahi ki.</p>

<h3>Worked ticket 2: "change kal raat ho gaya tha" (lab 5)</h3>
<pre class="out">MDS-A# show zone status vsan 10
VSAN: 10 default-zone: deny distribute: full Interop: default
<span class="hl">    mode: enhanced merge-control: allow
    session: cli [admin]</span></pre>
<ol>
<li><b>Gate 4:</b> ek khula enhanced session. <code>show zone pending-diff vsan 10</code> sirf planned ESX03 zone aur activation dikhata hai, isliye commit karo: <code>zone commit vsan 10</code>. <code>session: none</code> aur <code>show zoneset active vsan 10</code> mein ESX03-HBA1 ke aage * confirm karo.</li>
<li><b>Split point:</b> array ka <code>show initiators</code> ab ESX03 ko "Masked LUNs: none" ke saath list karta hai. Fabric proven hai; fault gate 5 hai.</li>
<li><b>Gate 5:</b> <code>lun mask 2 initiator 20:00:00:25:b5:aa:00:03</code>. <b>Gate 6:</b> ESX03 rescan, LUN 2 (1000 GB) visible. MDS-A save karo.</li>
</ol>

<div class="eg"><p><b>Worked example: path counts padhna.</b> 2 HBAs wala host, jismein har HBA apne fabric mein 2 array ports se zoned hai, har LUN ke liye <b>2 × 2 = 4 paths</b> dikhana chahiye. Agar 2 dikhata hai, dekho kaunsa HBA ya kaunsa array port missing hai: agar saare missing paths vmhba2 share karte hain, fabric B dekho; agar saare ek target port share karte hain, us array port aur dono fabrics par uski zones dekho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Yeh show flogi database mein hai" par ruk jaana. Ek fault fix karke poori chain re-test kiye bina ticket close karna. "Shayad madad kare" sochkar host ya switch reboot karna, jo evidence mita deta hai aur doosre servers ko risk mein daalta hai. Bhool jaana ki zoning ya masking changes ke baad host ko rescan karna padta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Checks ka order: physical, FLOGI, VSAN, name server, zoning (active zoneset, member stars, pending session), LUN masking, host rescan aur multipathing. Isolated E_Ports ka matlab aam taur par domain ID overlap ya zone merge failure hota hai.</p></div>

<div class="scn"><h4>Woh array port jis par kisi ko shak nahi tha</h4><p>Bees hosts ne ek saath degraded paths report kiye, lekin sirf fabric A par, aur unke fabric A paths ke sirf aadhe. Hosts, HBAs aur zoning theek lag rahe the. Engineer ne missing paths compare kiye: har dead path ARRAY1 spa1 ko target kar raha tha. spa1 ki taraf wale MDS port par <code>show interface</code> ne hazaaron CRC errors aur transceiver details mein kam receive power dikhaya. Array end par ek ganda connector frames corrupt kar raha tha. Cable saaf karke dobara lagane ke baad errors ruk gaye aur har host ne zoning mein koi badlaav kiye bina apne paths wapas paa liye.</p><p><b>Seekh:</b> configuration chhoone se pehle dhoondho ki failing paths mein kya common hai (ek HBA, ek fabric, ek target port).</p></div>

<div class="iv"><p class="q">"Ek server fabric mein logged in hai lekin koi LUN nahi dekhta. Aap kaise troubleshoot karoge?"</p><p>Strong answer: facts confirm karo, phir gates chalo. FLOGI present hai, to link aur login theek hain; FLOGI row mein aur <code>show fcns database</code> mein VSAN check karo; <code>show zone member pwwn</code> aur <code>show zoneset active</code> (dono members starred) se zoning check karo, aur uncommitted enhanced session ke liye <code>show zone status</code>; array par <code>show initiators</code> aur masking check karo; phir host rescan karo aur paths check karo. Half-split (kya array initiator dekhta hai?) ka zikr karo aur yeh ki aap dono fabrics par verify karte ho aur confirm karte ho ki doosre hosts unaffected hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle split karo: agar array initiator nahi dekhta, fault fabric mein hai; agar dekhta hai, masking aur host check karo.</li>
<li>Gates order mein chalo: link, FLOGI, VSAN, zoning, masking, host rescan aur paths.</li>
<li>Poori rows padho: VSAN column, member stars, zoning session state.</li>
<li>Ek ticket mein kai faults chhup sakte hain; har fix ke baad poori chain dobara verify karo.</li>
<li>Physical issues ke liye counters, transceiver power check karo aur dekho failing paths mein kya common hai.</li>
</ul></div>
`}};export{e as default};