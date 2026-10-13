var e={id:`sec-compute-storage`,h:{en:`Securing compute and storage: UCS RBAC, secure boot, KVM, SAN security and ACI contracts`,hi:`Compute aur storage secure karna: UCS RBAC, secure boot, KVM, SAN security aur ACI contracts`},body:{en:`
<p>A hospital protects more than its front door. The pharmacy has its own lock and a list of who may open it, the records room checks that each file request matches a patient's own doctor, and every operating theatre checks the patient's wristband before surgery starts. Data center security works the same way beyond the network: the <b>compute</b> layer (UCS servers, their management and boot process), the <b>storage</b> layer (Fibre Channel SAN and arrays) and <b>policy</b> between applications (ACI contracts) each need their own controls.</p>

<h3>UCS RBAC: roles, privileges and locales</h3>
<p>UCS Manager uses <b>role-based access control</b> too. A <b>privilege</b> allows one type of task; a <b>role</b> is a bundle of privileges. Built-in roles include <b>admin</b>, <b>read-only</b>, <b>aaa</b>, <b>network</b>, <b>storage</b>, <b>server-profile</b>, <b>server-equipment</b>, <b>server-security</b>, <b>server-compute</b>, <b>operations</b> and <b>facility-manager</b>. A <b>locale</b> restricts a user to one or more <b>organizations</b> in the UCS object hierarchy (for example root/Finance). Combining the two gives precise rights: "server-profile role, locale Finance" means the user can manage service profiles, but only those in the Finance organization.</p>
<p>Logins should come from a central directory: UCS Manager supports <b>LDAP</b>, <b>RADIUS</b> and <b>TACACS+</b>, with provider groups and authentication domains, and keeps a local fallback account. In <b>Intersight</b> the same ideas appear as <b>organizations</b> and <b>resource groups</b> (which servers a team can see) plus <b>roles</b> made of privileges (for example Server Administrator or Read-Only), usually with single sign-on through the company identity provider.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="UCS role plus locale">
<rect x="10" y="60" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="75" y="87" text-anchor="middle" class="svg-ink" font-size="13">User: priya</text>
<rect x="200" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="285" y="47" text-anchor="middle" class="svg-ink" font-size="13">Role: server-profile</text>
<rect x="200" y="100" width="170" height="44" rx="8" fill="#fde68a"/><text x="285" y="127" text-anchor="middle" class="svg-ink" font-size="13">Locale: Finance</text>
<rect x="440" y="60" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">Can edit service</text><text x="535" y="97" text-anchor="middle" class="svg-ink" font-size="13">profiles in root/Finance</text>
<line x1="140" y1="82" x2="200" y2="42" stroke="#64748b" stroke-width="2"/><line x1="140" y1="82" x2="200" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="42" x2="440" y2="82" stroke="#64748b" stroke-width="2"/><line x1="370" y1="122" x2="440" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="285" y="162" text-anchor="middle" class="svg-muted" font-size="12">role = what you may do; locale = where you may do it</text>
</svg><p class="cap">In UCS Manager, a role grants the task and a locale limits the organizations it applies to.</p></div>

<h3>Secure boot and trusted hardware</h3>
<p>An attacker who replaces a server's boot loader controls everything above it. <b>UEFI Secure Boot</b> makes the firmware check the digital signature of the boot loader and operating system kernel before running them; an unsigned or modified loader is refused. In UCS you enable it in the <b>boot policy</b>: boot mode UEFI with boot security turned on. Cisco servers and switches also verify their own firmware and NX-OS images against a hardware root of trust (the Trust Anchor module), and a <b>TPM</b> can record boot measurements so tools can attest that a host booted cleanly.</p>

<h3>KVM and out-of-band access</h3>
<p>The <b>KVM</b> console (keyboard, video, mouse over the network) gives full control of a server, including its BIOS and virtual media to boot any image. Treat it like physical access: reach it only through a dedicated out-of-band management network, assign KVM management IP addresses from a controlled pool, allow it only to roles that need it, set session timeouts, keep audit logs, and disable protocols you do not use, such as IPMI over LAN. Virtual media can be encrypted in UCS policies.</p>

<h3>SAN security: who may see which disks</h3>
<table class="cmp"><tr><th>Control</th><th>What it protects</th><th>Where</th></tr>
<tr><td><b>VSAN</b></td><td>Separates fabrics logically, like VLANs for Fibre Channel</td><td>MDS / Nexus FC switches</td></tr>
<tr><td><b>Zoning</b></td><td>Which initiators may talk to which targets</td><td>Fabric (switches)</td></tr>
<tr><td><b>LUN masking</b></td><td>Which LUNs a host WWPN may see on the array</td><td>Storage array</td></tr>
<tr><td><b>Port security</b></td><td>Which device WWNs may log in on which switch ports</td><td>Switch port</td></tr>
<tr><td><b>Fabric binding</b></td><td>Which switches (sWWN) may join the fabric via ISLs</td><td>Switch-to-switch</td></tr>
<tr><td><b>FC-SP (DH-CHAP)</b></td><td>Authenticates switches and devices with shared secrets</td><td>Links</td></tr>
</table>
<pre class="code">zone name ESX01-HBA0_ARRAY-A1 vsan 10
  member pwwn 20:00:00:25:b5:0a:00:01
  member pwwn 50:06:01:60:3e:a0:12:34
zoneset name FAB-A vsan 10
  member ESX01-HBA0_ARRAY-A1
zoneset activate name FAB-A vsan 10

feature port-security
port-security activate vsan 10
port-security database copy vsan 10

feature fabric-binding
fabric-binding database vsan 10
  swwn 20:00:00:05:9b:7a:11:01
fabric-binding activate vsan 10</pre>
<p>Best practice is <b>single-initiator zoning</b> (one host HBA with its targets per zone, or smart zoning), members identified by <b>pWWN</b>, hard zoning enforced in hardware, and a default zone that denies. Port security learns the devices currently logged in when it is activated; copying the learned entries into the database and then stopping auto-learn locks the fabric to known devices.</p>

<h3>ACI contracts as security</h3>
<p>In ACI, endpoints are grouped into <b>EPGs</b>, and by default EPGs <b>cannot talk to each other</b>. Traffic is allowed only when a <b>contract</b> exists: one EPG <b>provides</b> it, the other <b>consumes</b> it, and the contract's <b>subjects</b> and <b>filters</b> say which protocols and ports are permitted. This allow-list model is a built-in firewall between application tiers. Related tools: <b>taboo contracts</b> explicitly deny, <b>vzAny</b> applies a contract to all EPGs in a VRF, <b>preferred groups</b> let chosen EPGs talk freely, <b>intra-EPG isolation</b> blocks traffic inside one EPG, and <b>microsegmentation (uSeg EPGs)</b> classifies endpoints by attributes such as VM name or IP. ACI's own RBAC uses <b>security domains</b> so a tenant's administrators see only their tenants.</p>

<div class="eg"><p><b>Worked example.</b> Tenant PROD has EPGs WEB, APP and DB. Contract <code>web-to-app</code> (filter TCP 8080) is provided by APP and consumed by WEB; contract <code>app-to-db</code> (filter TCP 1433) is provided by DB and consumed by APP. A compromised web server tries to reach the database directly on TCP 1433: there is no contract between WEB and DB, so the leaf drops it. It tries SSH to an app server: the only filter between WEB and APP is TCP 8080, so SSH is dropped too. Three EPGs and two contracts give a least-privilege path through the application.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Giving everyone the UCS admin role because locales seem complicated. KVM reachable from the user network. One big zone containing every host and array port, so a misbehaving host disrupts others. Leaving port security in auto-learn forever, so any new device is learned. In ACI, using a permit-any filter or vzAny with permit-all "to make it work", which removes the security the contracts were meant to provide.</p></div>
<div class="exam"><p><b>Exam trap.</b> UCS: role = privileges, locale = organizations. Secure boot needs UEFI boot mode. Zoning is on the fabric, LUN masking on the array. Port security binds device WWNs to ports; fabric binding restricts which switches join. ACI is allow-list: no contract, no traffic; provider and consumer; taboo contracts deny.</p></div>

<div class="scn"><h4>The test host that saw production disks</h4><p>A storage engineer added a new test ESXi host to an existing zone "to save time". The zone contained the production array ports, and LUN masking on the array had a wildcard host group from an old migration. The test host rescanned its adapters and showed 14 production datastores, and a junior admin almost formatted one. The team removed the host from the zone, created single-initiator zones for every host, fixed the array's host group to exact WWPNs, and enabled port security so unknown WWNs could not log in on production ports.</p><p><b>Lesson:</b> storage security is layered: zoning on the fabric and masking on the array must both be exact.</p></div>

<div class="iv"><p class="q">"How do you secure access to storage in a Fibre Channel SAN?"</p><p>Strong answer: separate fabrics with VSANs; single-initiator (or smart) zoning by pWWN with hard zoning and default-deny; LUN masking on the array; port security to bind WWNs to ports; fabric binding so only known switches join; FC-SP DH-CHAP for authentication; RBAC and AAA for switch management. Mention that zoning and masking are complementary and that both must be kept exact.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UCS RBAC: roles bundle privileges; locales limit them to organizations; Intersight uses organizations and resource groups.</li>
<li>Secure boot (UEFI) verifies signed boot loaders; protect KVM and out-of-band management like physical access.</li>
<li>SAN: VSANs, single-initiator pWWN zoning, LUN masking, port security, fabric binding and FC-SP.</li>
<li>ACI contracts form an allow-list between EPGs: provider, consumer, subjects and filters.</li>
<li>Taboo contracts, vzAny, preferred groups, intra-EPG isolation and uSeg EPGs refine ACI policy.</li>
</ul></div>
`,hi:`
<p>Hospital sirf apna front door nahi bachata. Pharmacy ka apna taala aur list hoti hai ki kaun khol sakta hai, records room check karta hai ki har file request patient ke apne doctor se match kare, aur har operating theatre surgery shuru hone se pehle patient ka wristband check karta hai. Network ke aage data center security bhi aise hi kaam karti hai: <b>compute</b> layer (UCS servers, unka management aur boot process), <b>storage</b> layer (Fibre Channel SAN aur arrays) aur applications ke beech <b>policy</b> (ACI contracts), har ek ko apne controls chahiye.</p>

<h3>UCS RBAC: roles, privileges aur locales</h3>
<p>UCS Manager bhi <b>role-based access control</b> use karta hai. <b>Privilege</b> ek tarah ka kaam allow karta hai; <b>role</b> privileges ka bundle hai. Built-in roles mein <b>admin</b>, <b>read-only</b>, <b>aaa</b>, <b>network</b>, <b>storage</b>, <b>server-profile</b>, <b>server-equipment</b>, <b>server-security</b>, <b>server-compute</b>, <b>operations</b> aur <b>facility-manager</b> shaamil hain. <b>Locale</b> user ko UCS object hierarchy ki ek ya zyada <b>organizations</b> tak seemit karta hai (jaise root/Finance). Dono ko milane se precise rights milte hain: "server-profile role, locale Finance" ka matlab user service profiles manage kar sakta hai, lekin sirf Finance organization wale.</p>
<p>Logins central directory se aane chahiye: UCS Manager <b>LDAP</b>, <b>RADIUS</b> aur <b>TACACS+</b> support karta hai, provider groups aur authentication domains ke saath, aur ek local fallback account rakhta hai. <b>Intersight</b> mein yahi ideas <b>organizations</b> aur <b>resource groups</b> (team kaunse servers dekh sakti hai) plus privileges se bane <b>roles</b> (jaise Server Administrator ya Read-Only) ki tarah dikhte hain, aam taur par company identity provider ke through single sign-on ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="UCS role plus locale">
<rect x="10" y="60" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="75" y="87" text-anchor="middle" class="svg-ink" font-size="13">User: priya</text>
<rect x="200" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="285" y="47" text-anchor="middle" class="svg-ink" font-size="13">Role: server-profile</text>
<rect x="200" y="100" width="170" height="44" rx="8" fill="#fde68a"/><text x="285" y="127" text-anchor="middle" class="svg-ink" font-size="13">Locale: Finance</text>
<rect x="440" y="60" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">root/Finance ke service</text><text x="535" y="97" text-anchor="middle" class="svg-ink" font-size="13">profiles edit kar sakti hai</text>
<line x1="140" y1="82" x2="200" y2="42" stroke="#64748b" stroke-width="2"/><line x1="140" y1="82" x2="200" y2="122" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="42" x2="440" y2="82" stroke="#64748b" stroke-width="2"/><line x1="370" y1="122" x2="440" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="285" y="162" text-anchor="middle" class="svg-muted" font-size="12">role = kya kar sakte ho; locale = kahan kar sakte ho</text>
</svg><p class="cap">UCS Manager mein role kaam deta hai aur locale seemit karta hai ki woh kin organizations par lagu ho.</p></div>

<h3>Secure boot aur trusted hardware</h3>
<p>Jo attacker server ka boot loader badal deta hai, woh uske upar ki har cheez control karta hai. <b>UEFI Secure Boot</b> firmware se boot loader aur operating system kernel ka digital signature chalane se pehle check karwata hai; unsigned ya modified loader mana ho jaata hai. UCS mein aap ise <b>boot policy</b> mein enable karte ho: boot mode UEFI, boot security on ke saath. Cisco servers aur switches apne firmware aur NX-OS images ko hardware root of trust (Trust Anchor module) ke against verify bhi karte hain, aur <b>TPM</b> boot measurements record kar sakta hai taaki tools attest kar sakein ki host saaf tarah boot hua.</p>

<h3>KVM aur out-of-band access</h3>
<p><b>KVM</b> console (network par keyboard, video, mouse) server ka poora control deta hai, BIOS aur koi bhi image boot karne ke liye virtual media samet. Ise physical access ki tarah treat karo: sirf dedicated out-of-band management network se pahuncho, KVM management IP addresses controlled pool se do, sirf unhi roles ko allow karo jinhe zaroorat hai, session timeouts set karo, audit logs rakho, aur jo protocols use nahi karte unhe band karo, jaise IPMI over LAN. UCS policies mein virtual media encrypt ho sakta hai.</p>

<h3>SAN security: kaun kaunsi disks dekh sakta hai</h3>
<table class="cmp"><tr><th>Control</th><th>Kya bachata hai</th><th>Kahan</th></tr>
<tr><td><b>VSAN</b></td><td>Fabrics ko logically alag karta hai, Fibre Channel ke liye VLANs jaisa</td><td>MDS / Nexus FC switches</td></tr>
<tr><td><b>Zoning</b></td><td>Kaunse initiators kaunse targets se baat kar sakte hain</td><td>Fabric (switches)</td></tr>
<tr><td><b>LUN masking</b></td><td>Array par host WWPN kaunse LUNs dekh sakta hai</td><td>Storage array</td></tr>
<tr><td><b>Port security</b></td><td>Kaunse device WWNs kaunse switch ports par login kar sakte hain</td><td>Switch port</td></tr>
<tr><td><b>Fabric binding</b></td><td>Kaunse switches (sWWN) ISLs se fabric join kar sakte hain</td><td>Switch-to-switch</td></tr>
<tr><td><b>FC-SP (DH-CHAP)</b></td><td>Shared secrets se switches aur devices authenticate karta hai</td><td>Links</td></tr>
</table>
<pre class="code">zone name ESX01-HBA0_ARRAY-A1 vsan 10
  member pwwn 20:00:00:25:b5:0a:00:01
  member pwwn 50:06:01:60:3e:a0:12:34
zoneset name FAB-A vsan 10
  member ESX01-HBA0_ARRAY-A1
zoneset activate name FAB-A vsan 10

feature port-security
port-security activate vsan 10
port-security database copy vsan 10

feature fabric-binding
fabric-binding database vsan 10
  swwn 20:00:00:05:9b:7a:11:01
fabric-binding activate vsan 10</pre>
<p>Best practice hai <b>single-initiator zoning</b> (har zone mein ek host HBA apne targets ke saath, ya smart zoning), members <b>pWWN</b> se pehchane jaayein, hardware mein enforced hard zoning, aur deny karne wala default zone. Port security activate hone par us waqt logged-in devices seekh leta hai; seekhi entries ko database mein copy karke phir auto-learn band karne se fabric known devices tak lock ho jaata hai.</p>

<h3>Security ki tarah ACI contracts</h3>
<p>ACI mein endpoints <b>EPGs</b> mein group hote hain, aur default mein EPGs <b>ek dusre se baat nahi kar sakte</b>. Traffic tabhi allowed hai jab <b>contract</b> ho: ek EPG use <b>provide</b> karta hai, dusra <b>consume</b> karta hai, aur contract ke <b>subjects</b> aur <b>filters</b> batate hain ki kaunse protocols aur ports permitted hain. Yeh allow-list model application tiers ke beech built-in firewall hai. Related tools: <b>taboo contracts</b> explicitly deny karte hain, <b>vzAny</b> ek VRF ke saare EPGs par contract lagata hai, <b>preferred groups</b> chune hue EPGs ko khulkar baat karne dete hain, <b>intra-EPG isolation</b> ek EPG ke andar traffic block karta hai, aur <b>microsegmentation (uSeg EPGs)</b> endpoints ko VM name ya IP jaise attributes se classify karta hai. ACI ka apna RBAC <b>security domains</b> use karta hai taaki tenant ke administrators sirf apne tenants dekhein.</p>

<div class="eg"><p><b>Worked example.</b> Tenant PROD mein EPGs WEB, APP aur DB hain. Contract <code>web-to-app</code> (filter TCP 8080) APP provide karta hai aur WEB consume karta hai; contract <code>app-to-db</code> (filter TCP 1433) DB provide karta hai aur APP consume karta hai. Ek compromised web server seedhe database tak TCP 1433 par pahunchne ki koshish karta hai: WEB aur DB ke beech koi contract nahi, isliye leaf drop karta hai. Woh app server par SSH try karta hai: WEB aur APP ke beech sirf TCP 8080 ka filter hai, isliye SSH bhi drop hota hai. Teen EPGs aur do contracts application ke through least-privilege raasta dete hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sabko UCS admin role de dena kyunki locales complicated lagte hain. KVM ka user network se reachable hona. Ek bada zone jismein har host aur array port ho, taaki ek bigda host dusron ko disrupt kare. Port security ko hamesha auto-learn mein chhod dena, taaki har naya device seekh liya jaaye. ACI mein "chalane ke liye" permit-any filter ya permit-all wala vzAny use karna, jo contracts ki security hi hata deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> UCS: role = privileges, locale = organizations. Secure boot ko UEFI boot mode chahiye. Zoning fabric par hai, LUN masking array par. Port security device WWNs ko ports se bandhta hai; fabric binding seemit karta hai ki kaunse switches join karein. ACI allow-list hai: contract nahi, traffic nahi; provider aur consumer; taboo contracts deny karte hain.</p></div>

<div class="scn"><h4>Test host jisne production disks dekh li</h4><p>Ek storage engineer ne "time bachane ke liye" naya test ESXi host ek maujooda zone mein jod diya. Zone mein production array ports the, aur array par LUN masking mein purane migration ka wildcard host group tha. Test host ne apne adapters rescan kiye aur 14 production datastores dikhaye, aur ek junior admin ne lagbhag ek ko format kar diya. Team ne host ko zone se hataya, har host ke liye single-initiator zones banaye, array ke host group ko exact WWPNs par theek kiya, aur port security enable ki taaki unknown WWNs production ports par login na kar sakein.</p><p><b>Seekh:</b> storage security layered hai: fabric par zoning aur array par masking dono exact hone chahiye.</p></div>

<div class="iv"><p class="q">"Fibre Channel SAN mein storage access kaise secure karte ho?"</p><p>Strong answer: VSANs se fabrics alag karo; hard zoning aur default-deny ke saath pWWN se single-initiator (ya smart) zoning; array par LUN masking; WWNs ko ports se bandhne ke liye port security; fabric binding taaki sirf known switches join karein; authentication ke liye FC-SP DH-CHAP; switch management ke liye RBAC aur AAA. Batao ki zoning aur masking ek dusre ke poorak hain aur dono exact rakhne chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UCS RBAC: roles privileges bundle karte hain; locales unhe organizations tak seemit karte hain; Intersight organizations aur resource groups use karta hai.</li>
<li>Secure boot (UEFI) signed boot loaders verify karta hai; KVM aur out-of-band management ko physical access ki tarah bachao.</li>
<li>SAN: VSANs, single-initiator pWWN zoning, LUN masking, port security, fabric binding aur FC-SP.</li>
<li>ACI contracts EPGs ke beech allow-list banate hain: provider, consumer, subjects aur filters.</li>
<li>Taboo contracts, vzAny, preferred groups, intra-EPG isolation aur uSeg EPGs ACI policy ko refine karte hain.</li>
</ul></div>
`}};export{e as default};