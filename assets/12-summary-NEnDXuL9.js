var e={id:`summary`,h:{en:`Summary and exam checklist: SAN with Cisco MDS`,hi:`Summary aur exam checklist: Cisco MDS ke saath SAN`},body:{en:`
<p>You started this module knowing that a SAN gives servers block storage. You finish it able to build, change, design and troubleshoot one. This chapter packs everything into a checklist, a glossary and the facts that exams and interviews ask again and again. Use it the night before an exam, or before your first change window on a real fabric.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Six gates recap">
<rect x="10" y="30" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="57" y="56" text-anchor="middle" class="svg-ink" font-size="12">Link</text><text x="57" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 3</text>
<rect x="115" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="162" y="56" text-anchor="middle" class="svg-ink" font-size="12">FLOGI</text><text x="162" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 4</text>
<rect x="220" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="267" y="56" text-anchor="middle" class="svg-ink" font-size="12">VSAN</text><text x="267" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 5</text>
<rect x="325" y="30" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="372" y="56" text-anchor="middle" class="svg-ink" font-size="12">Zoning</text><text x="372" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 6, 7</text>
<rect x="430" y="30" width="95" height="60" rx="8" fill="#fde68a"/><text x="477" y="56" text-anchor="middle" class="svg-ink" font-size="12">Masking</text><text x="477" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 2, 7</text>
<rect x="535" y="30" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="582" y="56" text-anchor="middle" class="svg-ink" font-size="12">Paths</text><text x="582" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 8</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">x 2 fabrics, verified on the host</text>
</svg><p class="cap">The six gates and the chapters that taught them. Every SAN task passes through all six, on both fabrics.</p></div>

<h3>Checklist: you should be able to…</h3>
<ul>
<li>Explain why FC is lossless (buffer-to-buffer credits, R_RDY) and calculate credits for a long link.</li>
<li>Name the FC layers FC-0 to FC-4, the three topologies, and the 8/16/32/64GFC speeds.</li>
<li>Read a WWPN and an FCID; say which switch a device is on from the first FCID byte.</li>
<li>Describe FLOGI, name server registration, PLOGI and PRLI, and read <code>show flogi database</code> and <code>show fcns database</code>.</li>
<li>Create a VSAN, assign ports, set F mode, and verify with <code>show vsan membership</code> and <code>show interface brief</code>.</li>
<li>Create and commit device aliases, build single-initiator zones, add them to the zoneset and activate it.</li>
<li>Work in enhanced zoning: read <code>show zone status</code> and <code>show zone pending-diff</code>, commit or discard.</li>
<li>Design dual fabrics, explain multipathing and ALUA, and compute ISL oversubscription.</li>
<li>Explain NPV vs NPIV, the UCS end-host mode, and F-port channel trunking.</li>
<li>Explain FCoE with PFC, ETS, DCBX and FIP; configure a vFC; compare iSCSI, NFS and NVMe-oF.</li>
<li>Troubleshoot "logged in but no disks" gate by gate and prove the fix on the host.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>HBA</dt><dd>Host bus adapter; the server's FC interface (initiator).</dd>
<dt>WWNN / WWPN</dt><dd>8-byte permanent names for a node and for each of its ports; zone on WWPN.</dd>
<dt>FCID</dt><dd>24-bit address domain.area.port, assigned at FLOGI.</dd>
<dt>FLOGI / FDISC / PLOGI / PRLI</dt><dd>Fabric login; extra NPIV login; port-to-port login; FC-4 process login.</dd>
<dt>FCNS</dt><dd>The name server at 0xFFFFFC; lists devices and FC-4 types per VSAN.</dd>
<dt>VSAN</dt><dd>Independent virtual fabric with its own services; 1 default, 4094 isolated.</dd>
<dt>Zone / zoneset / active zoneset</dt><dd>Access list of members / group of zones / the enforced copy (one per VSAN).</dd>
<dt>Device alias / fcalias</dt><dd>Global CFS-distributed name for a pWWN / per-VSAN alias in the zoning database.</dd>
<dt>LUN masking</dt><dd>The array's list of which initiators may see which LUNs.</dd>
<dt>ALUA</dt><dd>Array reports optimized and non-optimized paths per LUN.</dd>
<dt>NPV / NPIV</dt><dd>Edge mode without domain ID / core feature allowing many logins per port.</dd>
<dt>FCF, vFC, FIP, DCB</dt><dd>FCoE forwarder, virtual FC interface, FCoE init protocol, lossless Ethernet features.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>FC frame</td><td>Max 2148 bytes, payload 2112 bytes, Class 3 in practice</td></tr>
<tr><td>Domains</td><td>1 to 239 per VSAN, assigned by the principal switch (priority, then lowest WWN)</td></tr>
<tr><td>Well-known addresses</td><td>0xFFFFFE login server, 0xFFFFFC name server, 0xFFFFFD fabric controller</td></tr>
<tr><td>VSANs</td><td>1 default, 2 to 4093 user, 4094 isolated, up to 256 per switch</td></tr>
<tr><td>Zoning</td><td>One active zoneset per VSAN; default zone deny; hard zoning on MDS</td></tr>
<tr><td>Enhanced zoning</td><td>Session lock, full DB distribution, changes on <code>zone commit vsan N</code></td></tr>
<tr><td>Port types</td><td>N, F, E, TE, NP, TF, TNP</td></tr>
<tr><td>FCoE</td><td>Ethertype 0x8906, FIP 0x8914, PFC 802.1Qbb, ETS 802.1Qaz, CoS 3</td></tr>
<tr><td>IP storage ports</td><td>iSCSI TCP 3260, NFS TCP 2049, NVMe/TCP 4420, RoCEv2 UDP 4791</td></tr>
<tr><td>NPV</td><td>Enabling it on MDS erases the config and reloads; core needs <code>feature npiv</code></td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! build</span>
vsan database / vsan 10 name FABRIC-A / vsan 10 interface fc1/1
interface fc1/1 / switchport mode F / no shutdown
device-alias database / device-alias name ESX01-HBA1 pwwn … / device-alias commit
zone name ESX01_ARRAY1 vsan 10 / member device-alias ESX01-HBA1
zoneset name ZS-FABRIC-A vsan 10 / member ESX01_ARRAY1
zoneset activate name ZS-FABRIC-A vsan 10
zone mode enhanced vsan 10 / zone commit vsan 10 / no zone commit vsan 10
<span class="c">! verify</span>
show interface brief / show vsan membership / show flogi database
show fcns database vsan 10 / show zoneset active vsan 10
show zone status vsan 10 / show zone pending-diff vsan 10
show device-alias database / show zone member pwwn … vsan 10
copy running-config startup-config</pre>

<div class="eg"><p><b>Worked example: a two-minute self-test.</b> A host WWPN appears in <code>show flogi database</code> on MDS-B with FCID 0x0a0040 and VSAN 1. What is wrong? Two things. First, 0x0a is MDS-A's domain, so either the output is really from MDS-A or the domain plan is broken; MDS-B should give FCIDs starting 0x14. Second, VSAN 1 means the port was never moved into the production VSAN (20 on fabric B). If you spotted both, you are reading outputs like a SAN engineer.</p></div>

<div class="warn"><p><b>Last reminders.</b> Never connect fabric A to fabric B. Never activate a zoneset name you did not intend. Never leave an enhanced session open. Never close a ticket before the host shows every expected path. Always save the configuration.</p></div>
<div class="exam"><p><b>Exam tip.</b> Most scenario questions are solved by the gate order. Read every output fully: VSAN column, FCID domain byte, stars in the active zoneset, the session line in zone status, and path states on the host.</p></div>

<div class="scn"><h4>The first solo change window</h4><p>Three months after joining the SAN team, the engineer from chapter 1 ran his first solo window: two new hosts, both fabrics. He pre-checked FLOGI and VSANs, found one port still in VSAN 1 and fixed it before starting. He committed aliases, built SIST zones, read the pending diff on the enhanced VSAN, committed, confirmed stars and <code>session: none</code>, had the storage team mask both HBAs of each host, and checked four active paths per LUN on each host. He saved both switches and attached the before-and-after outputs to the change. The review said: "nothing to add".</p><p><b>Lesson:</b> the gates, repeated on both fabrics and proven on the host, are the whole job.</p></div>

<div class="iv"><p class="q">"You have five minutes. Explain what a SAN engineer does on a Cisco MDS fabric."</p><p>Strong answer: we provide block storage connectivity through two independent fabrics. We keep devices logged in and in the right VSANs, control who talks to whom with single-initiator zoning on pWWNs or device aliases, manage zoneset activation (and commits in enhanced mode) safely, design for redundancy and bandwidth (dual fabric, multipathing, oversubscription, NPV/NPIV for UCS), integrate FCoE or IP storage where used, and troubleshoot gate by gate with FLOGI, FCNS, active zoneset and zone status, working with the storage team on masking and with the server team on paths.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every SAN task is the six gates: link, FLOGI, VSAN, zoning, masking, paths, on both fabrics.</li>
<li>Know the numbers: 2112-byte payload, 239 domains, VSAN 1 and 4094, 0x8906 and 0x8914, 3260 and 2049.</li>
<li>Zoning is only real once activated (and committed in enhanced mode); stars prove logged-in members.</li>
<li>Design with two separate fabrics, multipathing and sized ISLs; use NPV edges with an NPIV core.</li>
<li>Verify on the host and save the configuration before closing any change.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module is jaankari ke saath shuru kiya tha ki SAN servers ko block storage deta hai. Aap ise khatam kar rahe ho ek SAN build, change, design aur troubleshoot karne ki kabiliyat ke saath. Yeh chapter sab kuch ek checklist, ek glossary aur un facts mein pack karta hai jo exams aur interviews baar baar poochte hain. Ise exam se pehle wali raat, ya real fabric par apni pehli change window se pehle use karo.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Chhe gates ka recap">
<rect x="10" y="30" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="57" y="56" text-anchor="middle" class="svg-ink" font-size="12">Link</text><text x="57" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 3</text>
<rect x="115" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="162" y="56" text-anchor="middle" class="svg-ink" font-size="12">FLOGI</text><text x="162" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 4</text>
<rect x="220" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="267" y="56" text-anchor="middle" class="svg-ink" font-size="12">VSAN</text><text x="267" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 5</text>
<rect x="325" y="30" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="372" y="56" text-anchor="middle" class="svg-ink" font-size="12">Zoning</text><text x="372" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 6, 7</text>
<rect x="430" y="30" width="95" height="60" rx="8" fill="#fde68a"/><text x="477" y="56" text-anchor="middle" class="svg-ink" font-size="12">Masking</text><text x="477" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 2, 7</text>
<rect x="535" y="30" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="582" y="56" text-anchor="middle" class="svg-ink" font-size="12">Paths</text><text x="582" y="76" text-anchor="middle" class="svg-muted" font-size="12">ch 8</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">x 2 fabrics, host par verified</text>
</svg><p class="cap">Chhe gates aur woh chapters jinhone unhe sikhaya. Har SAN task dono fabrics par chhe ke chhe se guzarta hai.</p></div>

<h3>Checklist: aapko yeh kar paana chahiye…</h3>
<ul>
<li>Samjhana ki FC lossless kyun hai (buffer-to-buffer credits, R_RDY) aur lambe link ke liye credits calculate karna.</li>
<li>FC layers FC-0 se FC-4, teen topologies, aur 8/16/32/64GFC speeds ke naam batana.</li>
<li>WWPN aur FCID padhna; pehle FCID byte se batana ki device kis switch par hai.</li>
<li>FLOGI, name server registration, PLOGI aur PRLI describe karna, aur <code>show flogi database</code> aur <code>show fcns database</code> padhna.</li>
<li>VSAN banana, ports assign karna, F mode set karna, aur <code>show vsan membership</code> aur <code>show interface brief</code> se verify karna.</li>
<li>Device aliases banana aur commit karna, single-initiator zones banana, unhe zoneset mein jodna aur activate karna.</li>
<li>Enhanced zoning mein kaam karna: <code>show zone status</code> aur <code>show zone pending-diff</code> padhna, commit ya discard karna.</li>
<li>Dual fabrics design karna, multipathing aur ALUA samjhana, aur ISL oversubscription compute karna.</li>
<li>NPV vs NPIV, UCS end-host mode, aur F-port channel trunking samjhana.</li>
<li>PFC, ETS, DCBX aur FIP ke saath FCoE samjhana; vFC configure karna; iSCSI, NFS aur NVMe-oF compare karna.</li>
<li>"Logged in par disks nahi" ko gate by gate troubleshoot karna aur fix ko host par prove karna.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>HBA</dt><dd>Host bus adapter; server ka FC interface (initiator).</dd>
<dt>WWNN / WWPN</dt><dd>Node aur uske har port ke 8-byte permanent naam; WWPN par zone karo.</dd>
<dt>FCID</dt><dd>24-bit address domain.area.port, FLOGI par assign hota hai.</dd>
<dt>FLOGI / FDISC / PLOGI / PRLI</dt><dd>Fabric login; extra NPIV login; port-to-port login; FC-4 process login.</dd>
<dt>FCNS</dt><dd>0xFFFFFC par name server; har VSAN ke devices aur FC-4 types list karta hai.</dd>
<dt>VSAN</dt><dd>Apni services wala independent virtual fabric; 1 default, 4094 isolated.</dd>
<dt>Zone / zoneset / active zoneset</dt><dd>Members ki access list / zones ka group / enforce hone wali copy (har VSAN mein ek).</dd>
<dt>Device alias / fcalias</dt><dd>pWWN ka global CFS-distributed naam / zoning database mein per-VSAN alias.</dd>
<dt>LUN masking</dt><dd>Array ki list ki kaunse initiators kaunse LUNs dekh sakte hain.</dd>
<dt>ALUA</dt><dd>Array har LUN ke optimized aur non-optimized paths report karta hai.</dd>
<dt>NPV / NPIV</dt><dd>Bina domain ID ka edge mode / core feature jo har port par kai logins allow karta hai.</dd>
<dt>FCF, vFC, FIP, DCB</dt><dd>FCoE forwarder, virtual FC interface, FCoE init protocol, lossless Ethernet features.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>FC frame</td><td>Max 2148 bytes, payload 2112 bytes, practice mein Class 3</td></tr>
<tr><td>Domains</td><td>Har VSAN mein 1 se 239, principal switch assign karta hai (priority, phir sabse kam WWN)</td></tr>
<tr><td>Well-known addresses</td><td>0xFFFFFE login server, 0xFFFFFC name server, 0xFFFFFD fabric controller</td></tr>
<tr><td>VSANs</td><td>1 default, 2 se 4093 user, 4094 isolated, har switch par 256 tak</td></tr>
<tr><td>Zoning</td><td>Har VSAN mein ek active zoneset; default zone deny; MDS par hard zoning</td></tr>
<tr><td>Enhanced zoning</td><td>Session lock, full DB distribution, changes <code>zone commit vsan N</code> par</td></tr>
<tr><td>Port types</td><td>N, F, E, TE, NP, TF, TNP</td></tr>
<tr><td>FCoE</td><td>Ethertype 0x8906, FIP 0x8914, PFC 802.1Qbb, ETS 802.1Qaz, CoS 3</td></tr>
<tr><td>IP storage ports</td><td>iSCSI TCP 3260, NFS TCP 2049, NVMe/TCP 4420, RoCEv2 UDP 4791</td></tr>
<tr><td>NPV</td><td>MDS par enable karne se config erase aur reload; core ko <code>feature npiv</code> chahiye</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! build</span>
vsan database / vsan 10 name FABRIC-A / vsan 10 interface fc1/1
interface fc1/1 / switchport mode F / no shutdown
device-alias database / device-alias name ESX01-HBA1 pwwn … / device-alias commit
zone name ESX01_ARRAY1 vsan 10 / member device-alias ESX01-HBA1
zoneset name ZS-FABRIC-A vsan 10 / member ESX01_ARRAY1
zoneset activate name ZS-FABRIC-A vsan 10
zone mode enhanced vsan 10 / zone commit vsan 10 / no zone commit vsan 10
<span class="c">! verify</span>
show interface brief / show vsan membership / show flogi database
show fcns database vsan 10 / show zoneset active vsan 10
show zone status vsan 10 / show zone pending-diff vsan 10
show device-alias database / show zone member pwwn … vsan 10
copy running-config startup-config</pre>

<div class="eg"><p><b>Worked example: do minute ka self-test.</b> Ek host WWPN MDS-B par <code>show flogi database</code> mein FCID 0x0a0040 aur VSAN 1 ke saath dikhta hai. Kya galat hai? Do cheezein. Pehli, 0x0a MDS-A ka domain hai, to ya to output asal mein MDS-A ka hai ya domain plan toota hua hai; MDS-B ko 0x14 se shuru hone wale FCIDs dene chahiye. Doosri, VSAN 1 ka matlab hai port kabhi production VSAN (fabric B par 20) mein move hi nahi hua. Agar aapne dono pakde, to aap outputs SAN engineer ki tarah padh rahe ho.</p></div>

<div class="warn"><p><b>Aakhri reminders.</b> Fabric A ko fabric B se kabhi mat jodo. Aisa zoneset naam kabhi activate mat karo jo aapka irada nahi tha. Enhanced session kabhi khula mat chhodo. Host saare expected paths dikhaye usse pehle ticket kabhi close mat karo. Configuration hamesha save karo.</p></div>
<div class="exam"><p><b>Exam tip.</b> Zyada tar scenario questions gate order se solve hote hain. Har output poora padho: VSAN column, FCID domain byte, active zoneset mein stars, zone status mein session line, aur host par path states.</p></div>

<div class="scn"><h4>Pehli solo change window</h4><p>SAN team join karne ke teen mahine baad, chapter 1 wale engineer ne apni pehli solo window chalayi: do naye hosts, dono fabrics. Usne FLOGI aur VSANs pre-check kiye, ek port abhi bhi VSAN 1 mein paaya aur shuru karne se pehle use fix kiya. Usne aliases commit kiye, SIST zones banayi, enhanced VSAN par pending diff padha, commit kiya, stars aur <code>session: none</code> confirm kiye, storage team se har host ke dono HBAs mask karwaye, aur har host par har LUN ke chaar active paths check kiye. Usne dono switches save kiye aur before-and-after outputs change ke saath attach kiye. Review ne kaha: "jodne ko kuch nahi".</p><p><b>Seekh:</b> gates, dono fabrics par repeat kiye hue aur host par prove kiye hue, hi poora kaam hai.</p></div>

<div class="iv"><p class="q">"Aapke paas paanch minute hain. Samjhao ki Cisco MDS fabric par SAN engineer kya karta hai."</p><p>Strong answer: hum do independent fabrics ke through block storage connectivity dete hain. Hum devices ko logged in aur sahi VSANs mein rakhte hain, pWWNs ya device aliases par single-initiator zoning se control karte hain ki kaun kisse baat kare, zoneset activation (aur enhanced mode mein commits) safely manage karte hain, redundancy aur bandwidth ke liye design karte hain (dual fabric, multipathing, oversubscription, UCS ke liye NPV/NPIV), jahan use ho wahan FCoE ya IP storage integrate karte hain, aur FLOGI, FCNS, active zoneset aur zone status ke saath gate by gate troubleshoot karte hain, masking par storage team ke saath aur paths par server team ke saath kaam karte hue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har SAN task chhe gates hai: link, FLOGI, VSAN, zoning, masking, paths, dono fabrics par.</li>
<li>Numbers yaad rakho: 2112-byte payload, 239 domains, VSAN 1 aur 4094, 0x8906 aur 0x8914, 3260 aur 2049.</li>
<li>Zoning tabhi real hai jab activate ho (aur enhanced mode mein commit ho); stars logged-in members prove karte hain.</li>
<li>Do alag fabrics, multipathing aur sized ISLs ke saath design karo; NPIV core ke saath NPV edges use karo.</li>
<li>Koi bhi change close karne se pehle host par verify karo aur configuration save karo.</li>
</ul></div>
`}};export{e as default};