var e=e=>`<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="`+e.alt+`"><rect x="170" y="10" width="300" height="60" rx="10" fill="#fde68a" stroke="#64748b"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="14">`+e.top+`</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">`+e.top2+`</text><rect x="20" y="100" width="190" height="64" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="115" y="122" text-anchor="middle" class="svg-ink" font-size="13">`+e.o1+`</text><text x="115" y="142" text-anchor="middle" class="svg-muted" font-size="12">`+e.o1b+`</text><rect x="225" y="100" width="190" height="64" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">`+e.o2+`</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">`+e.o2b+`</text><rect x="430" y="100" width="190" height="64" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="525" y="122" text-anchor="middle" class="svg-ink" font-size="13">`+e.o3+`</text><text x="525" y="142" text-anchor="middle" class="svg-muted" font-size="12">`+e.o3b+`</text><line x1="115" y1="100" x2="250" y2="70" stroke="#64748b"/><line x1="320" y1="100" x2="320" y2="70" stroke="#64748b"/><line x1="525" y1="100" x2="390" y2="70" stroke="#64748b"/><rect x="20" y="200" width="130" height="50" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="85" y="222" text-anchor="middle" class="svg-ink" font-size="13">`+e.d1+`</text><text x="85" y="239" text-anchor="middle" class="svg-muted" font-size="11">`+e.dp+`</text><rect x="170" y="200" width="130" height="50" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="235" y="222" text-anchor="middle" class="svg-ink" font-size="13">`+e.d2+`</text><text x="235" y="239" text-anchor="middle" class="svg-muted" font-size="11">`+e.dp+`</text><rect x="340" y="200" width="130" height="50" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="405" y="222" text-anchor="middle" class="svg-ink" font-size="13">`+e.d3+`</text><text x="405" y="239" text-anchor="middle" class="svg-muted" font-size="11">`+e.dp+`</text><rect x="490" y="200" width="130" height="50" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="555" y="222" text-anchor="middle" class="svg-ink" font-size="13">`+e.fw+`</text><text x="555" y="239" text-anchor="middle" class="svg-muted" font-size="11">`+e.fw2+`</text><line x1="85" y1="164" x2="85" y2="200" stroke="#64748b"/><line x1="235" y1="164" x2="300" y2="200" stroke="#64748b" stroke-dasharray="0"/><line x1="320" y1="164" x2="405" y2="200" stroke="#64748b"/><line x1="525" y1="164" x2="555" y2="200" stroke="#64748b"/><text x="320" y="275" text-anchor="middle" class="svg-muted" font-size="12">`+e.note+`</text><rect x="30" y="296" width="14" height="14" fill="#fde68a" stroke="#64748b"/><text x="50" y="308" class="svg-muted" font-size="12">`+e.l1+`</text><rect x="190" y="296" width="14" height="14" fill="#ddd6fe" stroke="#64748b"/><text x="210" y="308" class="svg-muted" font-size="12">`+e.l2+`</text><rect x="330" y="296" width="14" height="14" fill="#bae6fd" stroke="#64748b"/><text x="350" y="308" class="svg-muted" font-size="12">`+e.l3+`</text><rect x="470" y="296" width="14" height="14" fill="#fed7aa" stroke="#64748b"/><text x="490" y="308" class="svg-muted" font-size="12">`+e.l4+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t={id:`intersight-design`,h:{en:`Intersight design: operating model, policies and firmware`,hi:`Intersight design: operating model, policies aur firmware`},body:{en:`
<h3>The customer case: Meridian Bank</h3>
<p>Meridian Bank has six UCS domains in three cities plus 40 standalone C-series servers in branch hubs. Each team keeps its own spreadsheet of firmware versions. Last quarter an audit found 11 servers on a firmware release with a published security advisory, and nobody could say which cluster they belonged to. Changes to BIOS settings are made directly on servers and nobody records who did it.</p>
<p><b>Requirements:</b> one inventory; firmware compliance report; separation between production and test; every change logged; integration with the ITSM ticket system; staged firmware upgrades that never take down both nodes of a cluster. <b>Constraints:</b> the bank's security policy allows outbound HTTPS only through a proxy; branch hubs have thin links; the infrastructure team has 8 people with different duties.</p>
<p>Chapter 2 compared UCSM, Intersight Managed Mode and the three Intersight forms. Here we design the <b>operating model</b> inside Intersight once the platform choice is made.</p>

<h3>Beginner view: a rulebook, not a remote control</h3>
<p>Many beginners treat Intersight as a remote control for servers. A better picture is a rulebook plus a filing cabinet. You write the rules once (policies), file them (organisations), and attach them to servers (profiles). Intersight keeps a record of what each device runs and warns you when it differs from the rules.</p>
`+e({alt:`Intersight organisations, profiles and firmware policy`,top:`Intersight`,top2:`inventory, policy, audit, API`,o1:`Org: Production`,o1b:`role: Server Admin`,o2:`Org: Test`,o2b:`role: Server Admin`,o3:`Org: Shared`,o3b:`policies, pools, templates`,d1:`Domain 1`,d2:`Domain 2`,d3:`Rack servers`,dp:`profile attached`,fw:`Firmware policy`,fw2:`version + HCL check`,note:`Shared policies are reused by Production and Test; resource groups decide who sees which devices`,l1:`Platform`,l2:`Organisation`,l3:`Managed device`,l4:`Policy`,cap:`Organisations hold the policies, pools and templates. Resource groups limit which devices a role can see. One firmware policy is attached to many profiles.`})+`
<h3>Design building blocks</h3>
<dl class="terms">
<dt>Account, organisation, resource group</dt><dd>An account holds everything. An <b>organisation</b> is a tenant-like container for policies, pools and profiles. A <b>resource group</b> is a set of devices. A role binds a user to an organisation and resource group, so a test engineer can work only on test devices.</dd>
<dt>Roles</dt><dd>Built-in roles include Account Administrator, Read-Only and Server Administrator, among others. Give least privilege; keep Account Administrator for two or three people.</dd>
<dt>Policies and pools</dt><dd>Reusable objects in an organisation. Examples: BIOS, boot order, adapter, LAN and SAN connectivity, NTP, syslog, SNMP, firmware, power, and for domains the port, VLAN, VSAN and network connectivity policies.</dd>
<dt>Profiles and templates</dt><dd>A <b>domain profile</b> configures the FI pair. <b>Chassis profiles</b> and <b>server profiles</b> configure the rest. Server profile templates give one design for many servers.</dd>
<dt>Device Connector</dt><dd>The outbound agent on each device. Check proxy, DNS and NTP first when a device shows disconnected.</dd>
<dt>Licence tier</dt><dd>Features depend on the tier, such as Essentials and Advantage. Count servers per tier and keep unused licences visible. Without a valid licence a device keeps working but loses licensed features after the grace period.</dd>
</dl>

<h3>Firmware design</h3>
<ol>
<li>Define a <b>firmware policy</b> per server model family and attach it through the template.</li>
<li>Check the <b>Hardware Compatibility List</b> result for the chosen firmware plus the host OS, driver and adapter firmware. Intersight shows compliance on the server.</li>
<li>Upgrade in a safe order: the domain (FIs and chassis) first, then servers. Upgrade one fabric at a time for fabric A then fabric B when the domain procedure asks for it.</li>
<li>Within a cluster, upgrade one host at a time: place the ESXi host in maintenance mode, deploy the profile change, wait for it to rejoin, then continue.</li>
<li>Review <b>security advisories</b> and the end-of-life report on a schedule.</li>
</ol>
<p>Intersight also offers an API with Terraform and Ansible providers, ITSM integrations, and orchestration workflows, so firmware and profile deployment can be pipelines with approvals.</p>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>1. One organisation, everyone Account Administrator</td><td>Quick start</td><td>No separation; every mistake is global</td></tr>
<tr><td>2. Organisations per environment, shared policy organisation, resource groups per site</td><td>Least privilege, reuse, clear audit</td><td>Needs naming discipline up front</td></tr>
<tr><td>3. One organisation per server, no sharing</td><td>Total isolation</td><td>Policy sprawl; defeats the purpose</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option 2. Organisation <code>Shared</code> holds NTP, syslog, SNMP and base BIOS policies. <code>Prod</code> and <code>Test</code> hold their own templates. Resource groups follow city, and roles are assigned by duty. Firmware policies are tested on Test first, then promoted. The bank's proxy is set in the Device Connector of every FI and C-series server, and ITSM integration opens a ticket when a critical advisory matches an installed server.</p></div>

<div class="warn"><p><b>Post-mortem: the mass deploy.</b> An engineer deployed a changed template to 40 branch servers at once. Thin links delayed the firmware download and several servers stayed in the staging state during business hours. Fix: deploy in waves, use maintenance windows, and stage firmware ahead of time on slow sites.</p></div>
<div class="exam"><p><b>Exam trap.</b> Organisations separate policies and profiles; resource groups limit device visibility; roles join the two. A question about letting a team see only its own devices is answered with a resource group plus a role, not a separate Intersight account.</p></div>

<div class="scn"><h4>Advisory on a Friday</h4><p>A security advisory was published for a BMC firmware release. Intersight listed 11 matching servers in two domains within minutes. The team staged the fixed firmware in the policy, upgraded Test over the weekend, and rolled production the next week in four waves. The audit report came straight from Intersight.</p><p><b>Lesson:</b> central inventory turns a week of spreadsheet hunting into a report.</p></div>
<div class="iv"><p class="q">"How would you design access control in Intersight for production and test teams?"</p><p>Strong answer: separate organisations for Prod and Test, a shared organisation for common policies, resource groups per site or environment, least-privilege roles, and audit log review. Mention that Account Administrator is limited to a few people.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organisations hold policies and profiles; resource groups limit devices; roles tie users to both.</li>
<li>Reuse policies through templates to keep servers consistent and auditable.</li>
<li>Firmware policy plus HCL check protects against unsupported combinations.</li>
<li>Upgrade domains first, then servers, one host at a time within a cluster.</li>
<li>API, Terraform and ITSM integration make changes repeatable and logged.</li>
</ul></div>
`,hi:`
<h3>Customer case: Meridian Bank</h3>
<p>Meridian Bank ke paas teen shehron mein chhe UCS domains aur branch hubs mein 40 standalone C-series servers hain. Har team firmware versions ki apni spreadsheet rakhti hai. Pichhli quarter audit mein 11 servers aise firmware release par mile jiski security advisory publish ho chuki thi, aur koi nahi bata paya ki woh kis cluster ke hain. BIOS settings seedhe servers par badli jaati hain aur kisi ko pata nahi kisne badli.</p>
<p><b>Requirements:</b> ek inventory; firmware compliance report; production aur test ke beech separation; har change logged; ITSM ticket system se integration; staged firmware upgrades jo cluster ke dono nodes ko ek saath na giraayein. <b>Constraints:</b> bank ki security policy sirf proxy ke through outbound HTTPS deti hai; branch hubs ke links patle hain; infrastructure team ke 8 logon ki alag alag duties hain.</p>
<p>Chapter 2 mein UCSM, Intersight Managed Mode aur teen Intersight forms ki tulna hui thi. Yahan platform choose hone ke baad Intersight ke andar <b>operating model</b> design karte hain.</p>

<h3>Beginner view: remote control nahi, rulebook</h3>
<p>Kai beginners Intersight ko servers ka remote control samajhte hain. Behtar tasveer hai rulebook plus filing cabinet. Aap rules ek baar likhte ho (policies), unhe file karte ho (organisations), aur servers se attach karte ho (profiles). Intersight har device ka record rakhta hai aur rules se alag hone par warning deta hai.</p>
`+e({alt:`Intersight organisations, profiles aur firmware policy`,top:`Intersight`,top2:`inventory, policy, audit, API`,o1:`Org: Production`,o1b:`role: Server Admin`,o2:`Org: Test`,o2b:`role: Server Admin`,o3:`Org: Shared`,o3b:`policies, pools, templates`,d1:`Domain 1`,d2:`Domain 2`,d3:`Rack servers`,dp:`profile attached`,fw:`Firmware policy`,fw2:`version + HCL check`,note:`Shared policies Production aur Test dono reuse karte hain; resource groups tay karte hain kaun kaunsa device dekhe`,l1:`Platform`,l2:`Organisation`,l3:`Managed device`,l4:`Policy`,cap:`Organisations policies, pools aur templates rakhte hain. Resource groups role ko dikhne wale devices limit karte hain. Ek firmware policy kai profiles se attach hoti hai.`})+`
<h3>Design building blocks</h3>
<dl class="terms">
<dt>Account, organisation, resource group</dt><dd>Account mein sab kuch hota hai. <b>Organisation</b> policies, pools aur profiles ka tenant-jaisa container hai. <b>Resource group</b> devices ka set hai. Role user ko organisation aur resource group se bandhta hai, isliye test engineer sirf test devices par kaam kar sakta hai.</dd>
<dt>Roles</dt><dd>Built-in roles mein Account Administrator, Read-Only aur Server Administrator waghera hain. Least privilege do; Account Administrator do-teen logon tak rakho.</dd>
<dt>Policies aur pools</dt><dd>Organisation ke reusable objects. Examples: BIOS, boot order, adapter, LAN aur SAN connectivity, NTP, syslog, SNMP, firmware, power, aur domains ke liye port, VLAN, VSAN aur network connectivity policies.</dd>
<dt>Profiles aur templates</dt><dd><b>Domain profile</b> FI pair configure karta hai. <b>Chassis profiles</b> aur <b>server profiles</b> baaki configure karte hain. Server profile templates kai servers ke liye ek design dete hain.</dd>
<dt>Device Connector</dt><dd>Har device par outbound agent. Device disconnected dikhe to pehle proxy, DNS aur NTP check karo.</dd>
<dt>Licence tier</dt><dd>Features tier par depend karte hain, jaise Essentials aur Advantage. Per tier servers gino aur unused licences visible rakho. Valid licence ke bina device chalta rehta hai lekin grace period ke baad licensed features chale jaate hain.</dd>
</dl>

<h3>Firmware design</h3>
<ol>
<li>Har server model family ke liye ek <b>firmware policy</b> banao aur template se attach karo.</li>
<li>Chuna hua firmware plus host OS, driver aur adapter firmware ka <b>Hardware Compatibility List</b> result check karo. Intersight server par compliance dikhata hai.</li>
<li>Safe order mein upgrade karo: pehle domain (FIs aur chassis), phir servers. Jab domain procedure kahe to fabric A phir fabric B ek ek karke upgrade karo.</li>
<li>Cluster ke andar ek time par ek host upgrade karo: ESXi host ko maintenance mode mein daalo, profile change deploy karo, rejoin hone ka wait karo, phir aage badho.</li>
<li>Schedule par <b>security advisories</b> aur end-of-life report dekho.</li>
</ol>
<p>Intersight API, Terraform aur Ansible providers, ITSM integrations aur orchestration workflows bhi deta hai, isliye firmware aur profile deployment approvals ke saath pipelines ban sakte hain.</p>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>1. Ek organisation, sab Account Administrator</td><td>Jaldi shuru</td><td>Separation nahi; har galti global</td></tr>
<tr><td>2. Environment ke hisaab se organisations, shared policy organisation, site ke hisaab se resource groups</td><td>Least privilege, reuse, saaf audit</td><td>Pehle se naming discipline chahiye</td></tr>
<tr><td>3. Har server ka alag organisation, sharing nahi</td><td>Poora isolation</td><td>Policy sprawl; maqsad hi khatam</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option 2. Organisation <code>Shared</code> mein NTP, syslog, SNMP aur base BIOS policies hain. <code>Prod</code> aur <code>Test</code> mein apne templates hain. Resource groups shehar ke hisaab se hain, aur roles duty ke hisaab se diye gaye hain. Firmware policies pehle Test par check hoti hain, phir promote. Bank ka proxy har FI aur C-series server ke Device Connector mein set hai, aur ITSM integration critical advisory kisi installed server se match kare to ticket kholta hai.</p></div>

<div class="warn"><p><b>Post-mortem: mass deploy.</b> Ek engineer ne badla hua template 40 branch servers par ek saath deploy kiya. Patle links ki wajah se firmware download late hua aur kai servers business hours mein staging state mein atke rahe. Fix: waves mein deploy karo, maintenance windows use karo, aur slow sites par firmware pehle se stage karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Organisations policies aur profiles alag karte hain; resource groups device visibility limit karte hain; roles dono ko jodte hain. Agar sawal ho ki team sirf apne devices dekhe, to jawab hai resource group plus role, alag Intersight account nahi.</p></div>

<div class="scn"><h4>Friday ki advisory</h4><p>Ek BMC firmware release ke liye security advisory publish hui. Intersight ne minutes mein do domains ke 11 matching servers list kar diye. Team ne policy mein fixed firmware stage kiya, weekend mein Test upgrade kiya, aur agle hafte production ko chaar waves mein roll kiya. Audit report seedha Intersight se nikli.</p><p><b>Seekh:</b> central inventory spreadsheet dhoondhne ke ek hafte ko ek report mein badal deti hai.</p></div>
<div class="iv"><p class="q">"Production aur test teams ke liye Intersight mein access control kaise design karoge?"</p><p>Strong answer: Prod aur Test ke alag organisations, common policies ke liye shared organisation, site ya environment ke hisaab se resource groups, least-privilege roles, aur audit log review. Batao ki Account Administrator kuch hi logon tak limit hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organisations policies aur profiles rakhte hain; resource groups devices limit karte hain; roles users ko dono se jodte hain.</li>
<li>Templates ke through policies reuse karo taaki servers consistent aur auditable rahein.</li>
<li>Firmware policy plus HCL check unsupported combinations se bachata hai.</li>
<li>Pehle domains, phir servers; cluster mein ek host ek baar.</li>
<li>API, Terraform aur ITSM integration changes ko repeatable aur logged banate hain.</li>
</ul></div>
`}};export{t as default};