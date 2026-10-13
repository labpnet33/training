var e={id:`sanboot`,h:{en:`Boot from SAN: the chain, the checks and why hosts fail to boot`,hi:`Boot from SAN: chain, checks aur hosts boot kyun nahi hote`},body:{en:`
<p>Imagine a courier who must collect a parcel from a warehouse locker. He needs the right warehouse address, the gate guard must have his name on the list, and the locker must be assigned to him with the right locker number. If any one of those is wrong, he comes back empty-handed, and he cannot tell you which one failed unless you ask the right person. <b>Boot from SAN</b> is that courier trip, done by the server's vHBA before any operating system is running.</p>

<h3>Why boot from SAN</h3>
<p>If the OS lives on a LUN in the storage array instead of on a local disk, the blade holds no state at all. That is what makes the stateless model complete: move the service profile to a spare blade and it boots the same OS from the same LUN. The array also gives the boot disk RAID protection, snapshots and replication.</p>

<h3>The chain, link by link</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Boot from SAN chain">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">Boot policy</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">vHBA, target, LUN</text>
<rect x="135" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="12">vHBA fc0</text><text x="190" y="63" text-anchor="middle" class="svg-muted" font-size="12">WWPN, VSAN 10</text>
<rect x="260" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="12">FI-A (NPV)</text><text x="315" y="63" text-anchor="middle" class="svg-muted" font-size="12">FC uplink</text>
<rect x="385" y="20" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="12">MDS-A</text><text x="440" y="63" text-anchor="middle" class="svg-muted" font-size="12">NPIV, zoning</text>
<rect x="510" y="20" width="120" height="56" rx="8" fill="#fed7aa"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="12">Array CT0.FC0</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">masking, LUN 0</text>
<line x1="120" y1="48" x2="135" y2="48" stroke="#64748b" stroke-width="2"/><line x1="245" y1="48" x2="260" y2="48" stroke="#64748b" stroke-width="2"/><line x1="370" y1="48" x2="385" y2="48" stroke="#64748b" stroke-width="2"/><line x1="495" y1="48" x2="510" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="190" y="115" text-anchor="middle" class="svg-accent" font-size="12">1 FLOGI</text>
<text x="315" y="115" text-anchor="middle" class="svg-accent" font-size="12">2 name server</text>
<text x="440" y="115" text-anchor="middle" class="svg-accent" font-size="12">3 PLOGI / PRLI</text>
<text x="570" y="115" text-anchor="middle" class="svg-accent" font-size="12">4 REPORT LUNS</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Fabric B repeats the same chain: fc1 → FI-B → MDS-B (VSAN 20) → CT1.FC0</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Every link must be right, or the BIOS reports no bootable device</text>
</svg><p class="cap">Four steps across five owners: server team, UCS, SAN team and storage team.</p></div>
<ol>
<li><b>FLOGI (fabric login).</b> The vHBA logs in to the fabric in its VSAN. The FI in end-host mode runs NPV and forwards it to the MDS (as an FDISC on the FI's uplink), so the MDS must have <b>NPIV</b> enabled and the FC uplink must carry that VSAN.</li>
<li><b>Name server.</b> The vHBA asks the fabric name server which targets exist. It sees only targets that are <b>zoned</b> with its WWPN in the active zoneset of that VSAN.</li>
<li><b>PLOGI and PRLI.</b> It logs in to the target WWPN written in the boot policy. A typo in that WWPN means "target not found".</li>
<li><b>REPORT LUNS.</b> The array answers with the LUNs <b>masked</b> (mapped) to this initiator WWPN. The BIOS boots from the LUN ID written in the boot policy, normally LUN 0.</li>
</ol>

<h3>Building the boot policy (Lab 2)</h3>
<p><b>Servers ▸ Policies ▸ Boot Policies ▸ Create Boot Policy</b>: name BOOT-SAN, boot mode <b>UEFI</b>. Add SAN Boot for fc0 with target 52:4A:93:7A:00:00:01:00 LUN 0 (array port CT0.FC0 on fabric A), then SAN Boot for fc1 with target 52:4A:93:7A:00:00:01:10 LUN 0 (CT1.FC0 on fabric B). <b>SAN ▸ Storage Array</b> in the lab shows the target ports. In full UCSM, a SAN boot entry has a <b>primary</b> and a <b>secondary</b> vHBA, and each vHBA can have a primary and a secondary target, so up to four paths.</p>
<p>The <b>vHBA names</b> in the boot policy (fc0, fc1) must match the vHBA names in the profile. The <b>boot mode</b> must match how the OS was installed: an OS installed in UEFI mode does not boot under Legacy, and the reverse.</p>

<h3>The zoning and masking side</h3>
<pre class="code"><span class="c">! MDS-A, fabric A: single-initiator zone for ESX-01 fc0</span>
zone name ESX-01_fc0__FLASH01_CT0 vsan 10
  member pwwn 20:00:00:25:b5:0a:00:00
  member pwwn 52:4a:93:7a:00:00:01:00
zoneset name FAB-A vsan 10
  member ESX-01_fc0__FLASH01_CT0
zoneset activate name FAB-A vsan 10</pre>
<p>On the array, host ESX-01 is defined with WWPNs 20:00:00:25:B5:0A:00:00 and 20:00:00:25:B5:0B:00:00, and the boot volume is mapped to it as LUN 0. Notice that both zoning and masking use the <b>WWPNs from the UCS pools</b>, which is why those WWPNs must never change.</p>

<h3>Verifying each link</h3>
<pre class="out">MDS-A# show flogi database vsan 10
INTERFACE  VSAN  FCID      PORT NAME                NODE NAME
fc1/1      10    0x470000  20:01:00:3a:9c:5e:12:40  20:0a:00:3a:9c:5e:12:41
<span class="hl">fc1/1      10    0x470002  20:00:00:25:b5:0a:00:00  20:00:00:25:b5:00:00:00</span>
fc1/5      10    0x470100  52:4a:93:7a:00:00:01:00  52:4a:93:7a:00:00:01:00</pre>
<p>Line one is the FI's own NP uplink login; line two is ESX-01 fc0 logged in through it (NPIV); line three is the array port. On the FI you can confirm the same with <code>connect nxos a</code> and <code>show npv flogi-table</code>. From the adapter itself, <code>connect adapter 1/1/1</code>, <code>connect</code>, <code>attach-fls</code> and <code>lunlist</code> show what the vHBA really saw during boot:</p>
<pre class="out">adapter 1/1/1 (fls):1# lunlist
vnic : 13 lifid: 5
  - FLOGI State : flogi est (fc_id 0x470002)
  - PLOGI Sessions
    - WWNN 52:4a:93:7a:00:00:01:00 WWPN 52:4a:93:7a:00:00:01:00 fc_id 0x470100
      - LUN's configured (SCSI Type, Version, Vendor, Serial No.)
<span class="hl">          LUN ID : 0x0000000000000000 access failure</span>
      - REPORT LUNs Query Response
  - Nameserver Query Response
    - WWPN : 52:4a:93:7a:00:00:01:00</pre>
<p>Here FLOGI and PLOGI worked but REPORT LUNS returned nothing: the problem is masking on the array, not UCS or zoning.</p>

<h3>Why hosts fail to boot from SAN</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Owner</th></tr>
<tr><td>No FLOGI for the vHBA</td><td>vHBA in a VSAN that the FC uplink does not carry, VSAN missing, FC uplink down, NPIV off on MDS</td><td>UCS / SAN</td></tr>
<tr><td>FLOGI ok, PLOGI to target failed, target not in name server</td><td>Wrong target WWPN in the boot policy, missing zone, zoneset not activated, vHBA on the wrong fabric</td><td>UCS / SAN</td></tr>
<tr><td>Target logged in, REPORT LUNS empty</td><td>Initiator WWPN not masked (often a profile got a new WWPN)</td><td>Storage</td></tr>
<tr><td>LUN found but no boot loader</td><td>Wrong LUN ID in boot policy, Legacy/UEFI mismatch, OS not installed on that LUN</td><td>UCS / server</td></tr>
</table>

<div class="eg"><p><b>Worked example: the ticket lab.</b> After a change, ESX-01 and ESX-02 show "No bootable device". The KVM trace for fc0 says FLOGI ok in VSAN 10, PLOGI to 52:4a:93:7a:00:00:01:01 failed, targets seen: 52:4a:93:7a:00:00:01:00. One digit in BOOT-SAN is wrong: fix it to ...01:00. For fc1 the trace shows a login in VSAN 1: the updating template vHBA-B points to VSAN default instead of VSAN-B (20). Fix the template; because it is updating, ESX-01 follows. Both changes are pending, so Reset the server and confirm "LUN 0 found, booting" on the KVM.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Copying a target WWPN by hand (use copy and paste from the array or the name server). Zoning with the WWNN instead of the WWPN. Forgetting to activate the zoneset. Installing the OS with both paths active before multipathing drivers are present on OSes that need a single path at install time.</p></div>
<div class="exam"><p><b>Exam tip.</b> Order: FLOGI → name server → PLOGI/PRLI → REPORT LUNS → boot. FI in FC end-host mode = NPV; MDS needs NPIV. Zoning and masking are keyed on the initiator <b>WWPN</b>. The boot policy names the vHBA, target WWPN and LUN ID.</p></div>

<div class="scn"><h4>The replacement blade configured by hand</h4><p>A blade failed and a technician, unaware of service profiles, built a new profile by hand with "hardware default" WWPNs for the replacement. The host stopped at "No bootable device". <code>lunlist</code> showed FLOGI and PLOGI working but an empty REPORT LUNS: the new vHBA WWPN 20:00:00:25:b5:0a:00:5c was not the 20:00:00:25:b5:0a:00:11 the array masked. Instead of asking the storage team to rezone and remask, the engineer deleted the hand-made profile, associated the original service profile with the new blade, and the host booted with its old WWPNs.</p><p><b>Lesson:</b> never rebuild identity by hand; move the profile and the SAN chain stays intact.</p></div>

<div class="iv"><p class="q">"A UCS blade cannot boot from SAN. How do you troubleshoot?"</p><p>Strong answer: follow the chain. Check the vHBA's VSAN and the FC uplink (FLOGI in <code>show flogi database</code> or <code>show npv flogi-table</code>), then zoning (<code>show zoneset active</code>) and the target WWPN in the boot policy, then masking on the array (REPORT LUNS via <code>lunlist</code>), then the LUN ID and the UEFI/Legacy boot mode. Mention the KVM console and Faults, and that a changed WWPN from a rebuilt profile is the classic cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SAN boot makes the blade fully stateless: the OS lives on an array LUN.</li>
<li>Chain: boot policy → vHBA (VSAN, WWPN) → FI NPV uplink → MDS NPIV and zoning → array masking → LUN.</li>
<li>Boot policy = vHBA name + target WWPN + LUN ID, plus the boot mode (UEFI/Legacy).</li>
<li>Diagnose by the last step that worked: no FLOGI, no PLOGI, no LUNs, or no boot loader.</li>
<li>Tools: KVM console, Faults, show flogi database, show npv flogi-table, show zoneset active, lunlist.</li>
</ul></div>
`,hi:`
<p>Ek courier ki kalpana karo jise warehouse locker se parcel lena hai. Use sahi warehouse address chahiye, gate guard ki list mein uska naam hona chahiye, aur locker sahi locker number ke saath uske naam hona chahiye. Inmein se ek bhi galat ho to woh khaali haath lautta hai, aur woh aapko tab tak nahi bata sakta ki kaunsa fail hua jab tak aap sahi insaan se na poocho. <b>Boot from SAN</b> wahi courier trip hai, jo server ka vHBA kisi bhi operating system ke chalne se pehle karta hai.</p>

<h3>SAN se boot kyun</h3>
<p>Agar OS local disk ki jagah storage array ke LUN par rehta hai, to blade koi bhi state nahi rakhta. Yahi stateless model ko poora karta hai: service profile ko spare blade par le jao aur woh usi LUN se wahi OS boot karta hai. Array boot disk ko RAID protection, snapshots aur replication bhi deta hai.</p>

<h3>Chain, ek-ek link</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Boot from SAN chain">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">Boot policy</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">vHBA, target, LUN</text>
<rect x="135" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="12">vHBA fc0</text><text x="190" y="63" text-anchor="middle" class="svg-muted" font-size="12">WWPN, VSAN 10</text>
<rect x="260" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="12">FI-A (NPV)</text><text x="315" y="63" text-anchor="middle" class="svg-muted" font-size="12">FC uplink</text>
<rect x="385" y="20" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="12">MDS-A</text><text x="440" y="63" text-anchor="middle" class="svg-muted" font-size="12">NPIV, zoning</text>
<rect x="510" y="20" width="120" height="56" rx="8" fill="#fed7aa"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="12">Array CT0.FC0</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">masking, LUN 0</text>
<line x1="120" y1="48" x2="135" y2="48" stroke="#64748b" stroke-width="2"/><line x1="245" y1="48" x2="260" y2="48" stroke="#64748b" stroke-width="2"/><line x1="370" y1="48" x2="385" y2="48" stroke="#64748b" stroke-width="2"/><line x1="495" y1="48" x2="510" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="190" y="115" text-anchor="middle" class="svg-accent" font-size="12">1 FLOGI</text>
<text x="315" y="115" text-anchor="middle" class="svg-accent" font-size="12">2 name server</text>
<text x="440" y="115" text-anchor="middle" class="svg-accent" font-size="12">3 PLOGI / PRLI</text>
<text x="570" y="115" text-anchor="middle" class="svg-accent" font-size="12">4 REPORT LUNS</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Fabric B yahi chain dohrata hai: fc1 → FI-B → MDS-B (VSAN 20) → CT1.FC0</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Har link sahi hona chahiye, warna BIOS no bootable device report karta hai</text>
</svg><p class="cap">Paanch owners ke across chaar steps: server team, UCS, SAN team aur storage team.</p></div>
<ol>
<li><b>FLOGI (fabric login).</b> vHBA apne VSAN mein fabric par login karta hai. End-host mode wala FI NPV chalata hai aur ise MDS tak forward karta hai (FI ke uplink par FDISC ki tarah), isliye MDS par <b>NPIV</b> enabled hona chahiye aur FC uplink ko woh VSAN carry karna chahiye.</li>
<li><b>Name server.</b> vHBA fabric name server se poochta hai ki kaunse targets exist karte hain. Use sirf woh targets dikhte hain jo us VSAN ke active zoneset mein uske WWPN ke saath <b>zoned</b> hain.</li>
<li><b>PLOGI aur PRLI.</b> Yeh boot policy mein likhe target WWPN par login karta hai. Us WWPN mein typo ka matlab "target not found".</li>
<li><b>REPORT LUNS.</b> Array un LUNs ke saath jawab deta hai jo is initiator WWPN par <b>masked</b> (mapped) hain. BIOS boot policy mein likhe LUN ID se boot karta hai, aam taur par LUN 0.</li>
</ol>

<h3>Boot policy banana (Lab 2)</h3>
<p><b>Servers ▸ Policies ▸ Boot Policies ▸ Create Boot Policy</b>: naam BOOT-SAN, boot mode <b>UEFI</b>. fc0 ke liye SAN Boot jodo target 52:4A:93:7A:00:00:01:00 LUN 0 (fabric A par array port CT0.FC0), phir fc1 ke liye SAN Boot target 52:4A:93:7A:00:00:01:10 LUN 0 (fabric B par CT1.FC0). Lab mein <b>SAN ▸ Storage Array</b> target ports dikhata hai. Poore UCSM mein SAN boot entry ka ek <b>primary</b> aur ek <b>secondary</b> vHBA hota hai, aur har vHBA ka primary aur secondary target ho sakta hai, yaani chaar paths tak.</p>
<p>Boot policy mein <b>vHBA names</b> (fc0, fc1) profile ke vHBA names se match hone chahiye. <b>Boot mode</b> us tareeke se match hona chahiye jaise OS install hua tha: UEFI mode mein install OS Legacy mein boot nahi hota, aur ulta bhi.</p>

<h3>Zoning aur masking ki side</h3>
<pre class="code"><span class="c">! MDS-A, fabric A: ESX-01 fc0 ke liye single-initiator zone</span>
zone name ESX-01_fc0__FLASH01_CT0 vsan 10
  member pwwn 20:00:00:25:b5:0a:00:00
  member pwwn 52:4a:93:7a:00:00:01:00
zoneset name FAB-A vsan 10
  member ESX-01_fc0__FLASH01_CT0
zoneset activate name FAB-A vsan 10</pre>
<p>Array par host ESX-01 WWPNs 20:00:00:25:B5:0A:00:00 aur 20:00:00:25:B5:0B:00:00 ke saath define hai, aur boot volume use LUN 0 ki tarah mapped hai. Dhyan do ki zoning aur masking dono <b>UCS pools ke WWPNs</b> use karte hain, isiliye woh WWPNs kabhi nahi badalne chahiye.</p>

<h3>Har link verify karna</h3>
<pre class="out">MDS-A# show flogi database vsan 10
INTERFACE  VSAN  FCID      PORT NAME                NODE NAME
fc1/1      10    0x470000  20:01:00:3a:9c:5e:12:40  20:0a:00:3a:9c:5e:12:41
<span class="hl">fc1/1      10    0x470002  20:00:00:25:b5:0a:00:00  20:00:00:25:b5:00:00:00</span>
fc1/5      10    0x470100  52:4a:93:7a:00:00:01:00  52:4a:93:7a:00:00:01:00</pre>
<p>Pehli line FI ke apne NP uplink ka login hai; doosri line uske through logged in ESX-01 fc0 hai (NPIV); teesri array port hai. FI par aap yahi <code>connect nxos a</code> aur <code>show npv flogi-table</code> se confirm kar sakte ho. Adapter se khud, <code>connect adapter 1/1/1</code>, <code>connect</code>, <code>attach-fls</code> aur <code>lunlist</code> dikhate hain ki boot ke dauraan vHBA ne asal mein kya dekha:</p>
<pre class="out">adapter 1/1/1 (fls):1# lunlist
vnic : 13 lifid: 5
  - FLOGI State : flogi est (fc_id 0x470002)
  - PLOGI Sessions
    - WWNN 52:4a:93:7a:00:00:01:00 WWPN 52:4a:93:7a:00:00:01:00 fc_id 0x470100
      - LUN's configured (SCSI Type, Version, Vendor, Serial No.)
<span class="hl">          LUN ID : 0x0000000000000000 access failure</span>
      - REPORT LUNs Query Response
  - Nameserver Query Response
    - WWPN : 52:4a:93:7a:00:00:01:00</pre>
<p>Yahan FLOGI aur PLOGI chal gaye lekin REPORT LUNS ne kuch nahi lautaya: problem array par masking hai, UCS ya zoning nahi.</p>

<h3>Hosts SAN se boot kyun nahi hote</h3>
<table class="cmp"><tr><th>Aapko kya dikhta hai</th><th>Sambhavit wajah</th><th>Owner</th></tr>
<tr><td>vHBA ka FLOGI nahi</td><td>vHBA aise VSAN mein jo FC uplink carry nahi karta, VSAN missing, FC uplink down, MDS par NPIV off</td><td>UCS / SAN</td></tr>
<tr><td>FLOGI ok, target par PLOGI fail, target name server mein nahi</td><td>Boot policy mein galat target WWPN, zone missing, zoneset activate nahi hua, vHBA galat fabric par</td><td>UCS / SAN</td></tr>
<tr><td>Target logged in, REPORT LUNS khaali</td><td>Initiator WWPN masked nahi (aksar profile ko naya WWPN mil gaya)</td><td>Storage</td></tr>
<tr><td>LUN mila lekin boot loader nahi</td><td>Boot policy mein galat LUN ID, Legacy/UEFI mismatch, us LUN par OS install nahi</td><td>UCS / server</td></tr>
</table>

<div class="eg"><p><b>Worked example: ticket lab.</b> Ek change ke baad ESX-01 aur ESX-02 "No bootable device" dikhate hain. fc0 ka KVM trace kehta hai VSAN 10 mein FLOGI ok, 52:4a:93:7a:00:00:01:01 par PLOGI fail, targets seen: 52:4a:93:7a:00:00:01:00. BOOT-SAN mein ek digit galat hai: use ...01:00 karo. fc1 ke liye trace VSAN 1 mein login dikhata hai: updating template vHBA-B VSAN-B (20) ki jagah VSAN default par point karta hai. Template theek karo; kyunki woh updating hai, ESX-01 use follow karta hai. Dono changes pending hain, isliye server Reset karo aur KVM par "LUN 0 found, booting" confirm karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Target WWPN haath se copy karna (array ya name server se copy-paste karo). WWPN ki jagah WWNN se zoning karna. Zoneset activate karna bhool jaana. Un OSes par jinhe install ke waqt single path chahiye, multipathing drivers aane se pehle dono paths active rakh kar OS install karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Order: FLOGI → name server → PLOGI/PRLI → REPORT LUNS → boot. FC end-host mode mein FI = NPV; MDS ko NPIV chahiye. Zoning aur masking initiator <b>WWPN</b> par based hain. Boot policy vHBA, target WWPN aur LUN ID batati hai.</p></div>

<div class="scn"><h4>Haath se configure kiya replacement blade</h4><p>Ek blade fail hua aur ek technician ne, service profiles se anjaan, replacement ke liye "hardware default" WWPNs ke saath haath se naya profile bana diya. Host "No bootable device" par ruk gaya. <code>lunlist</code> ne FLOGI aur PLOGI chalte hue lekin khaali REPORT LUNS dikhaya: naye vHBA ka WWPN 20:00:00:25:b5:0a:00:5c tha, na ki 20:00:00:25:b5:0a:00:11 jo array ne mask kiya tha. Storage team se rezone aur remask karwane ki jagah engineer ne haath se bana profile delete kiya, original service profile ko naye blade se associate kiya, aur host apne purane WWPNs ke saath boot ho gaya.</p><p><b>Seekh:</b> identity kabhi haath se dobara mat banao; profile move karo aur SAN chain intact rehti hai.</p></div>

<div class="iv"><p class="q">"UCS blade SAN se boot nahi kar pa raha. Kaise troubleshoot karoge?"</p><p>Strong answer: chain follow karo. vHBA ka VSAN aur FC uplink check karo (<code>show flogi database</code> ya <code>show npv flogi-table</code> mein FLOGI), phir zoning (<code>show zoneset active</code>) aur boot policy ka target WWPN, phir array par masking (<code>lunlist</code> se REPORT LUNS), phir LUN ID aur UEFI/Legacy boot mode. KVM console aur Faults mention karo, aur yeh ki dobara banaye profile se badla hua WWPN classic wajah hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SAN boot blade ko poori tarah stateless banata hai: OS array LUN par rehta hai.</li>
<li>Chain: boot policy → vHBA (VSAN, WWPN) → FI NPV uplink → MDS NPIV aur zoning → array masking → LUN.</li>
<li>Boot policy = vHBA name + target WWPN + LUN ID, plus boot mode (UEFI/Legacy).</li>
<li>Aakhri kaam karne wale step se diagnose karo: FLOGI nahi, PLOGI nahi, LUNs nahi, ya boot loader nahi.</li>
<li>Tools: KVM console, Faults, show flogi database, show npv flogi-table, show zoneset active, lunlist.</li>
</ul></div>
`}};export{e as default};