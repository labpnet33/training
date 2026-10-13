var e={id:`inventory`,h:{en:`Asset inventory, IPAM, SLAs and wireless surveys`,hi:`Asset inventory, IPAM, SLAs aur wireless surveys`},body:{en:`
<p>A good restaurant knows exactly what is in its store room: how many kilos of rice, which spices expire next week, which fridge is still under warranty. It also knows which table is booked by whom, and it promises customers that food arrives within 20 minutes. A network team needs the same three things: an <b>asset inventory</b> (the store room), <b>IP address management</b> (the table bookings) and <b>service level agreements</b> (the 20-minute promise). For wireless it also needs a map of where the signal is strong: the <b>site survey</b> and <b>heat map</b>.</p>

<h3>Asset inventory</h3>
<p>An <b>asset inventory</b> is the authoritative list of everything the network owns. N10-009 names four parts:</p>
<table class="cmp"><tr><th>Part</th><th>What is recorded</th><th>Why it matters</th></tr>
<tr><td><b>Hardware</b></td><td>Device name, model, serial number, location, owner, purchase date</td><td>Replacing failed parts, audits, theft detection</td></tr>
<tr><td><b>Software</b></td><td>Operating system and firmware versions on each device</td><td>Finding every device affected by a new vulnerability</td></tr>
<tr><td><b>Licensing</b></td><td>Feature licences, subscription terms, expiry dates, counts</td><td>A lapsed licence can disable features such as security services or wireless APs</td></tr>
<tr><td><b>Warranty and support</b></td><td>Support contract level, expiry, hardware replacement time</td><td>Knowing whether a failed switch is replaced next business day or in four hours</td></tr>
</table>
<p>When a critical vulnerability is announced for one operating system version, a team with a good inventory answers "which of our devices run it?" in minutes. A team without one starts logging in to devices one by one.</p>

<h3>IP address management (IPAM)</h3>
<p><b>IPAM</b> is the system that tracks the address space: which blocks are allocated to which site, which subnets exist, which addresses inside each subnet are static, reserved or handed out by DHCP, and which DNS names match them. Spreadsheets work for ten subnets; real IPAM tools integrate with DHCP and DNS servers, discover addresses in use and warn before two people allocate the same subnet.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IPAM hierarchy from block to address">
<rect x="10" y="20" width="180" height="44" rx="8" fill="#fde68a"/><text x="100" y="47" text-anchor="middle" class="svg-ink" font-size="13">Block 192.168.0.0/16</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Subnet 192.168.50.0/24</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">HQ management</text>
<rect x="450" y="10" width="180" height="30" rx="6" fill="#bbf7d0"/><text x="540" y="30" text-anchor="middle" class="svg-ink" font-size="12">.1 R1 gateway (static)</text>
<rect x="450" y="46" width="180" height="30" rx="6" fill="#bbf7d0"/><text x="540" y="66" text-anchor="middle" class="svg-ink" font-size="12">.100 NMS (static)</text>
<rect x="450" y="82" width="180" height="30" rx="6" fill="#ddd6fe"/><text x="540" y="102" text-anchor="middle" class="svg-ink" font-size="12">.10-.99 DHCP scope</text>
<line x1="190" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="42" x2="450" y2="25" stroke="#64748b"/><line x1="410" y1="42" x2="450" y2="61" stroke="#64748b"/><line x1="410" y1="42" x2="450" y2="97" stroke="#64748b"/>
<rect x="10" y="140" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">IPAM links each address to DHCP, DNS names, owner and status</text>
</svg><p class="cap">IPAM works from large blocks down to single addresses, and ties them to DHCP scopes and DNS records.</p></div>

<div class="eg"><p><b>Worked example.</b> A new branch needs 60 user addresses and a management subnet. The IPAM tool shows 192.168.0.0/16 has 192.168.60.0/24 free. The engineer reserves 192.168.60.0/26 (62 hosts) for users and 192.168.60.64/28 (14 hosts) for switch and AP management, records the gateway .1 addresses as static, creates the DHCP scope from IPAM, and the new DNS records are created automatically. No one else can allocate those ranges now.</p></div>

<h3>Service level agreements (SLA)</h3>
<p>An <b>SLA</b> is a written agreement between a service provider and a customer (external, like an ISP, or internal, like IT and the sales department) that defines measurable targets: availability (for example 99.9% per month), response time to a ticket, time to restore service, and what happens when the target is missed (usually service credits). SLAs are why monitoring matters: you cannot prove 99.9% availability, or claim a credit from your ISP, without availability data.</p>
<p>99.9% of a 30-day month allows about 43 minutes of downtime; 99.99% allows about 4.3 minutes. The difference in cost between the two is large, because the second needs redundant everything.</p>

<h3>Wireless site surveys and heat maps</h3>
<p>You met RF basics in np-wireless. A <b>wireless site survey</b> measures or predicts coverage, interference and capacity before and after deploying access points. Types:</p>
<ul>
<li><b>Predictive survey</b>: software models coverage from a floor plan with wall materials; used for planning.</li>
<li><b>Passive survey</b>: a laptop listens to beacons on every channel and records signal strength (RSSI) and noise at each spot.</li>
<li><b>Active survey</b>: the laptop associates with the network and measures throughput, loss and roaming.</li>
</ul>
<p>The result is drawn as a <b>heat map</b>: the floor plan coloured by signal strength. A common design target is about <b>-67 dBm</b> or stronger for voice and video, with enough overlap between APs for clients to roam. Surveys are part of documentation: keep the post-install heat map so you can compare after walls move or new APs are added.</p>

<div class="warn"><p><b>Common mistakes.</b> Keeping inventory and IPAM in personal spreadsheets that drift from reality. Forgetting licence expiry dates until a feature stops working. Signing an SLA without the monitoring to measure it. Doing only a predictive wireless survey and never validating it on site after installation.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which document defines the uptime the provider guarantees?" is an <b>SLA</b>, not an MOU or a change request. "Which tool prevents two admins assigning the same subnet?" is <b>IPAM</b>. "Which shows dead spots on a floor plan?" is a <b>heat map</b> from a site survey.</p></div>

<div class="scn"><h4>The vulnerability hunt</h4><p>A security advisory warned that one firmware version on the company's access switches allowed remote code execution. The team had kept software versions in its asset inventory, so a single report listed 37 affected switches in 6 sites, with their support contract status. Four were past end of support and could not receive the fix; those went on an urgent replacement list. The other 33 were patched in two change windows within the week.</p><p><b>Lesson:</b> an inventory that includes software and support status turns a crisis into a checklist.</p></div>

<div class="iv"><p class="q">"What would you record in a network asset inventory, and how do you keep it accurate?"</p><p>Strong answer: hardware details (model, serial, location), software and firmware versions, licensing and warranty/support status. Keep it accurate with automated discovery (SNMP, APIs) feeding the inventory, updates as part of every change and decommission, and periodic audits. Mention IPAM for addresses and the link between inventory and vulnerability response.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Asset inventory covers hardware, software, licensing and warranty/support.</li>
<li>IPAM tracks blocks, subnets and individual addresses and integrates with DHCP and DNS.</li>
<li>An SLA defines measurable targets such as 99.9% availability and penalties when missed.</li>
<li>Site surveys can be predictive, passive or active; results are shown as heat maps.</li>
<li>All of these are living documents, updated with every change.</li>
</ul></div>
`,hi:`
<p>Ek achhe restaurant ko pata hota hai ki store room mein exactly kya hai: kitne kilo chawal, kaunse masale agle hafte expire honge, kaunsa fridge abhi warranty mein hai. Use yeh bhi pata hota hai ki kaunsi table kisne book ki hai, aur woh customers se wada karta hai ki khana 20 minute mein aayega. Network team ko bhi yahi teen cheezein chahiye: <b>asset inventory</b> (store room), <b>IP address management</b> (table bookings) aur <b>service level agreements</b> (20 minute ka wada). Wireless ke liye use yeh map bhi chahiye ki signal kahan strong hai: <b>site survey</b> aur <b>heat map</b>.</p>

<h3>Asset inventory</h3>
<p><b>Asset inventory</b> network ki har cheez ki authoritative list hai. N10-009 iske chaar hisse batata hai:</p>
<table class="cmp"><tr><th>Hissa</th><th>Kya record hota hai</th><th>Kyun matter karta hai</th></tr>
<tr><td><b>Hardware</b></td><td>Device name, model, serial number, location, owner, purchase date</td><td>Fail hue parts replace karna, audits, chori pakadna</td></tr>
<tr><td><b>Software</b></td><td>Har device par operating system aur firmware versions</td><td>Nayi vulnerability se affected har device dhoondhna</td></tr>
<tr><td><b>Licensing</b></td><td>Feature licences, subscription terms, expiry dates, counts</td><td>Expire hua licence security services ya wireless APs jaise features band kar sakta hai</td></tr>
<tr><td><b>Warranty aur support</b></td><td>Support contract level, expiry, hardware replacement time</td><td>Pata hona ki fail hua switch next business day replace hoga ya chaar ghante mein</td></tr>
</table>
<p>Jab kisi ek operating system version ke liye critical vulnerability announce hoti hai, achhi inventory wali team "hamare kaunse devices ise chalate hain?" ka jawab minutes mein de deti hai. Bina inventory wali team ek ek device mein login karna shuru karti hai.</p>

<h3>IP address management (IPAM)</h3>
<p><b>IPAM</b> woh system hai jo address space track karta hai: kaunse blocks kis site ko diye gaye, kaunse subnets exist karte hain, har subnet ke andar kaunse addresses static, reserved ya DHCP se diye gaye hain, aur kaunse DNS names unse match karte hain. Das subnets ke liye spreadsheets chal jaati hain; asli IPAM tools DHCP aur DNS servers se integrate hote hain, use ho rahe addresses discover karte hain aur do log ek hi subnet allocate karein usse pehle warn karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Block se address tak IPAM hierarchy">
<rect x="10" y="20" width="180" height="44" rx="8" fill="#fde68a"/><text x="100" y="47" text-anchor="middle" class="svg-ink" font-size="13">Block 192.168.0.0/16</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Subnet 192.168.50.0/24</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">HQ management</text>
<rect x="450" y="10" width="180" height="30" rx="6" fill="#bbf7d0"/><text x="540" y="30" text-anchor="middle" class="svg-ink" font-size="12">.1 R1 gateway (static)</text>
<rect x="450" y="46" width="180" height="30" rx="6" fill="#bbf7d0"/><text x="540" y="66" text-anchor="middle" class="svg-ink" font-size="12">.100 NMS (static)</text>
<rect x="450" y="82" width="180" height="30" rx="6" fill="#ddd6fe"/><text x="540" y="102" text-anchor="middle" class="svg-ink" font-size="12">.10-.99 DHCP scope</text>
<line x1="190" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="42" x2="450" y2="25" stroke="#64748b"/><line x1="410" y1="42" x2="450" y2="61" stroke="#64748b"/><line x1="410" y1="42" x2="450" y2="97" stroke="#64748b"/>
<rect x="10" y="140" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">IPAM har address ko DHCP, DNS names, owner aur status se jodta hai</text>
</svg><p class="cap">IPAM bade blocks se single addresses tak kaam karta hai, aur unhe DHCP scopes aur DNS records se jodta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Nayi branch ko 60 user addresses aur ek management subnet chahiye. IPAM tool dikhata hai ki 192.168.0.0/16 mein 192.168.60.0/24 free hai. Engineer users ke liye 192.168.60.0/26 (62 hosts) aur switch aur AP management ke liye 192.168.60.64/28 (14 hosts) reserve karta hai, gateway .1 addresses ko static record karta hai, IPAM se DHCP scope banata hai, aur naye DNS records apne aap ban jaate hain. Ab koi aur un ranges ko allocate nahi kar sakta.</p></div>

<h3>Service level agreements (SLA)</h3>
<p><b>SLA</b> ek service provider aur customer (external, jaise ISP, ya internal, jaise IT aur sales department) ke beech likha hua agreement hai jo measurable targets define karta hai: availability (jaise mahine mein 99.9%), ticket par response time, service restore karne ka time, aur target miss hone par kya hoga (aam taur par service credits). SLAs hi wajah hain ki monitoring matter karti hai: availability data ke bina aap 99.9% availability sabit nahi kar sakte, na ISP se credit claim kar sakte.</p>
<p>30 din ke mahine ka 99.9% lagbhag 43 minute downtime allow karta hai; 99.99% lagbhag 4.3 minute. Dono ki cost mein bada farak hai, kyunki doosre ke liye har cheez redundant chahiye.</p>

<h3>Wireless site surveys aur heat maps</h3>
<p>RF basics aap np-wireless mein padh chuke ho. <b>Wireless site survey</b> access points deploy karne se pehle aur baad coverage, interference aur capacity ko measure ya predict karta hai. Types:</p>
<ul>
<li><b>Predictive survey</b>: software floor plan aur deewaron ke material se coverage model karta hai; planning ke liye.</li>
<li><b>Passive survey</b>: laptop har channel par beacons sunta hai aur har jagah signal strength (RSSI) aur noise record karta hai.</li>
<li><b>Active survey</b>: laptop network se associate hota hai aur throughput, loss aur roaming measure karta hai.</li>
</ul>
<p>Result ek <b>heat map</b> ke roop mein banta hai: floor plan jo signal strength ke hisaab se rangeen hota hai. Voice aur video ke liye common design target lagbhag <b>-67 dBm</b> ya usse strong hai, APs ke beech itne overlap ke saath ki clients roam kar sakein. Surveys documentation ka hissa hain: post-install heat map sambhaal ke rakho taaki deewarein hilne ya naye APs judne ke baad compare kar sako.</p>

<div class="warn"><p><b>Common galtiyan.</b> Inventory aur IPAM ko personal spreadsheets mein rakhna jo reality se door chali jaati hain. Licence expiry dates tab tak bhoolna jab tak koi feature kaam karna band na kare. Use measure karne wali monitoring ke bina SLA sign karna. Sirf predictive wireless survey karna aur installation ke baad site par kabhi validate na karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa document provider ki guarantee ki hui uptime define karta hai?" <b>SLA</b> hai, MOU ya change request nahi. "Kaunsa tool do admins ko same subnet assign karne se rokta hai?" <b>IPAM</b> hai. "Floor plan par dead spots kaun dikhata hai?" site survey ka <b>heat map</b>.</p></div>

<div class="scn"><h4>Vulnerability ki talaash</h4><p>Ek security advisory ne chetavni di ki company ke access switches ka ek firmware version remote code execution allow karta hai. Team ne apni asset inventory mein software versions rakhe the, isliye ek hi report ne 6 sites mein 37 affected switches unke support contract status ke saath list kar diye. Chaar end of support ke paar the aur fix nahi le sakte the; woh urgent replacement list par gaye. Baaki 33 hafte ke andar do change windows mein patch ho gaye.</p><p><b>Seekh:</b> jis inventory mein software aur support status ho, woh crisis ko checklist mein badal deti hai.</p></div>

<div class="iv"><p class="q">"Aap network asset inventory mein kya record karoge, aur use accurate kaise rakhoge?"</p><p>Strong answer: hardware details (model, serial, location), software aur firmware versions, licensing aur warranty/support status. Use accurate rakhne ke liye automated discovery (SNMP, APIs) inventory ko feed kare, har change aur decommission ke saath updates hon, aur periodic audits hon. Addresses ke liye IPAM aur inventory aur vulnerability response ke link ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Asset inventory hardware, software, licensing aur warranty/support cover karti hai.</li>
<li>IPAM blocks, subnets aur individual addresses track karta hai aur DHCP aur DNS se integrate hota hai.</li>
<li>SLA 99.9% availability jaise measurable targets aur miss hone par penalties define karta hai.</li>
<li>Site surveys predictive, passive ya active ho sakte hain; results heat maps ke roop mein dikhte hain.</li>
<li>Yeh sab living documents hain, har change ke saath update hote hain.</li>
</ul></div>
`}};export{e as default};