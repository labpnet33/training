var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one picture</h3>
<p>One <b>organization</b> holds admins, the API switch, the licence and templates. Under it, one <b>network</b> per site holds <b>devices</b> claimed by serial number and grouped with <b>tags</b>. A <b>template</b> can drive the shared design of many networks, while each network keeps its own subnets and uplinks. All of it is configured in a cloud dashboard (control plane) while the devices at the site forward traffic (data plane).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary map">
<rect x="10" y="10" width="200" height="80" rx="8" fill="#ddd6fe"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="13">Organization</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">admins, API switch,</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">licence, templates</text>
<rect x="240" y="10" width="170" height="80" rx="8" fill="#bae6fd"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="13">Network per site</text><text x="325" y="58" text-anchor="middle" class="svg-muted" font-size="12">mum, blr, del</text>
<rect x="440" y="10" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="13">Devices</text><text x="535" y="58" text-anchor="middle" class="svg-muted" font-size="12">serial, name, tags</text>
<line x1="210" y1="50" x2="240" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="120" width="620" height="70" rx="8" fill="#fde68a"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">Method: online? then uplink? then configuration? then what changed?</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Change windows and the change log keep you safe</text>
</svg><p class="cap">Organization, network, device, with templates and a method on top.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready for the labs and interviews when you can do each of these without notes:</p>
<ul>
<li>Explain control plane, data plane and management plane, and what keeps working when the dashboard is unreachable (and why you check the vendor documentation for details).</li>
<li>Draw the tree: organization, networks (mum, blr, del) and devices.</li>
<li>Choose a privilege (full or read-only, organization or network scope) for a given person, and justify it with least privilege.</li>
<li>Explain what the API access switch does and why keys must be protected.</li>
<li>Claim a device by serial number, assign it to the right network, set a name TYPE-CITY and a tag.</li>
<li>Bind and unbind a network, and say what the template controls and what stays local.</li>
<li>Explain why a bound network refuses a local edit and give two ways to resolve it (edit the template, or unbind).</li>
<li>Run the method: online, uplink, configuration, change log, and plan a maintenance window.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Dashboard</dt><dd>The cloud web page where you configure and monitor.</dd>
<dt>Organization</dt><dd>Top-level container for admins, templates, licence and networks.</dd>
<dt>Network</dt><dd>A container of settings and devices, normally one per site.</dd>
<dt>Claim</dt><dd>Add a device to the organization by its serial number.</dd>
<dt>Tag</dt><dd>A short label used to group or target devices.</dd>
<dt>Template</dt><dd>A reusable design that bound networks follow.</dd>
<dt>Bind / unbind</dt><dd>Attach a network to a template / detach it, keeping a copy of the settings.</dd>
<dt>Privilege</dt><dd>An admin's access level plus scope.</dd>
<dt>Least privilege</dt><dd>Only the access needed for the job.</dd>
<dt>Change log</dt><dd>Audit trail of who changed what and when.</dd>
<dt>Maintenance window</dt><dd>Agreed time when disruption is acceptable.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Cloud-managed</td><td>Traffic stays local; only management goes to the cloud</td></tr>
<tr><td>Offline in dashboard</td><td>Not the same as users down; check both</td></tr>
<tr><td>Device identity</td><td>Serial number, not IP address</td></tr>
<tr><td>Template controls</td><td>VLAN list, firewall rules, SSIDs, content settings</td></tr>
<tr><td>Stays local</td><td>Subnets and addresses, devices, uplinks</td></tr>
<tr><td>Bound network</td><td>Controlled items are read-only</td></tr>
<tr><td>Troubleshooting order</td><td>Online, uplink, configuration, change log</td></tr>
</table>

<div class="exam"><p><b>Exam trap summary.</b> (1) Offline does not mean users are down. (2) Subnets are per network even when a template is bound. (3) Unbind keeps a copy of settings, it does not erase them. (4) A read-only admin never changes anything.</p></div>
<div class="warn"><p><b>Lab reminder (mk-start-3).</b> When the lab says a bound network refuses a local edit, resist the urge to unbind first. Read the banner that names the template, decide whether the change belongs in the template, and only unbind if this site truly needs to be different.</p></div>

<div class="scn"><h4>Onboarding the Pune store</h4><p>Bharat Retail Co opens a store in Pune. The engineer creates the network, claims the switch, access point and appliance by serial, names them with TYPE-CITY, binds the network to the branch template, and sets the Pune-only subnets. A new Network read-only admin is created for the store manager. In the maintenance window the devices are plugged in, show online, and the change log records every step.</p><p><b>Lesson:</b> a clean structure turns a branch rollout into a checklist.</p></div>

<div class="iv"><p class="q">"Summarise how you would structure a cloud-managed network for a retail company with many shops."</p><p>Strong answer: one organization, one network per shop, devices claimed by serial and named TYPE-CITY with tags for role and location, a template for the shared VLANs, firewall and SSIDs with per-site subnets, network-scoped admin roles following least privilege, API access only if needed, and a change-log and maintenance-window discipline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization, then network, then device; templates and tags sit across them.</li>
<li>Control plane is in the cloud; data plane is at the site.</li>
<li>Least privilege and a change log protect the estate.</li>
<li>Templates standardise; subnets and uplinks stay local.</li>
<li>Troubleshoot online, uplink, configuration, then confirm with the change log.</li>
</ul></div>
`,hi:`
<h3>Poora module ek picture mein</h3>
<p>Ek <b>organization</b> mein admins, API switch, licence aur templates hote hain. Uske neeche har site ke liye ek <b>network</b> hota hai jisme serial number se claim kiye gaye <b>devices</b> hote hain aur woh <b>tags</b> se group hote hain. Ek <b>template</b> bahut saare networks ka shared design drive kar sakta hai, jabki har network apne subnets aur uplinks khud rakhta hai. Yeh sab cloud dashboard (control plane) mein configure hota hai jabki site ke devices traffic forward karte hain (data plane).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary map">
<rect x="10" y="10" width="200" height="80" rx="8" fill="#ddd6fe"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="13">Organization</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">admins, API switch,</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">licence, templates</text>
<rect x="240" y="10" width="170" height="80" rx="8" fill="#bae6fd"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="13">Har site ka network</text><text x="325" y="58" text-anchor="middle" class="svg-muted" font-size="12">mum, blr, del</text>
<rect x="440" y="10" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="13">Devices</text><text x="535" y="58" text-anchor="middle" class="svg-muted" font-size="12">serial, name, tags</text>
<line x1="210" y1="50" x2="240" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="120" width="620" height="70" rx="8" fill="#fde68a"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">Method: online? phir uplink? phir configuration? phir kya badla?</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Change windows aur change log aapko safe rakhte hain</text>
</svg><p class="cap">Organization, network, device, upar templates aur ek method.</p></div>

<h3>Can-do checklist</h3>
<p>Aap labs aur interviews ke liye ready ho jab bina notes ke yeh sab kar sako:</p>
<ul>
<li>Control plane, data plane aur management plane explain karo, aur dashboard unreachable hone par kya chalta rehta hai (aur details ke liye vendor documentation kyun dekhte hain).</li>
<li>Tree draw karo: organization, networks (mum, blr, del) aur devices.</li>
<li>Kisi insaan ke liye privilege chuno (full ya read-only, organization ya network scope), aur least privilege se justify karo.</li>
<li>Samjhao ki API access switch kya karta hai aur keys ko protect kyun karna chahiye.</li>
<li>Device ko serial number se claim karo, sahi network mein assign karo, naam TYPE-CITY aur ek tag set karo.</li>
<li>Network ko bind aur unbind karo, aur batao template kya control karta hai aur kya local rehta hai.</li>
<li>Samjhao ki bound network local edit kyun refuse karta hai aur do tareeke batao resolve karne ke (template edit karo, ya unbind).</li>
<li>Method chalao: online, uplink, configuration, change log, aur maintenance window plan karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Dashboard</dt><dd>Cloud web page jahan aap configure aur monitor karte ho.</dd>
<dt>Organization</dt><dd>Admins, templates, licence aur networks ka top-level container.</dd>
<dt>Network</dt><dd>Settings aur devices ka container, aam taur par ek site ke liye ek.</dd>
<dt>Claim</dt><dd>Device ko serial number se organization mein add karna.</dd>
<dt>Tag</dt><dd>Devices ko group ya target karne ke liye chhota label.</dd>
<dt>Template</dt><dd>Reusable design jise bound networks follow karte hain.</dd>
<dt>Bind / unbind</dt><dd>Network ko template se jodna / alag karna, settings ki copy rakhte hue.</dd>
<dt>Privilege</dt><dd>Admin ka access level plus scope.</dd>
<dt>Least privilege</dt><dd>Sirf kaam ke liye zaroori access.</dd>
<dt>Change log</dt><dd>Kisne kya kab badla uska audit trail.</dd>
<dt>Maintenance window</dt><dd>Tay time jab disruption acceptable hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Cloud-managed</td><td>Traffic local rehta hai; sirf management cloud jaata hai</td></tr>
<tr><td>Dashboard mein offline</td><td>Users down ke barabar nahi; dono check karo</td></tr>
<tr><td>Device identity</td><td>Serial number, IP address nahi</td></tr>
<tr><td>Template controls</td><td>VLAN list, firewall rules, SSIDs, content settings</td></tr>
<tr><td>Local rehta hai</td><td>Subnets aur addresses, devices, uplinks</td></tr>
<tr><td>Bound network</td><td>Controlled items read-only hote hain</td></tr>
<tr><td>Troubleshooting order</td><td>Online, uplink, configuration, change log</td></tr>
</table>

<div class="exam"><p><b>Exam trap summary.</b> (1) Offline ka matlab users down nahi. (2) Template bound hone par bhi subnets per network hote hain. (3) Unbind settings ki copy rakhta hai, unhe mitata nahi. (4) Read-only admin kuch nahi badal sakta.</p></div>
<div class="warn"><p><b>Lab reminder (mk-start-3).</b> Jab lab bole ki bound network local edit refuse kar raha hai, to pehle unbind karne ka mann mat banao. Template ka naam batane wala banner padho, decide karo ki change template mein belong karta hai ya nahi, aur unbind tabhi karo jab is site ko sach mein alag hona ho.</p></div>

<div class="scn"><h4>Pune store ka onboarding</h4><p>Bharat Retail Co Pune mein nayi store kholti hai. Engineer network banata hai, switch, access point aur appliance ko serial se claim karta hai, unhe TYPE-CITY naam deta hai, network ko branch template se bind karta hai, aur Pune ke subnets set karta hai. Store manager ke liye ek naya Network read-only admin banta hai. Maintenance window mein devices plug in hote hain, online dikhte hain, aur change log har step record karta hai.</p><p><b>Seekh:</b> saaf structure branch rollout ko checklist bana deta hai.</p></div>

<div class="iv"><p class="q">"Bahut saari shops wali retail company ke liye cloud-managed network ka structure kaise banaoge, summary mein batao."</p><p>Strong answer: ek organization, har shop ke liye ek network, devices serial se claim aur TYPE-CITY naam ke saath, role aur location ke tags, shared VLANs, firewall aur SSIDs ke liye template aur per-site subnets, least privilege wale network-scoped admin roles, API access sirf zaroorat par, aur change-log aur maintenance-window ka discipline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization, phir network, phir device; templates aur tags unke across baithte hain.</li>
<li>Control plane cloud mein hai; data plane site par.</li>
<li>Least privilege aur change log estate ko protect karte hain.</li>
<li>Templates standardise karte hain; subnets aur uplinks local rehte hain.</li>
<li>Troubleshoot online, uplink, configuration, phir change log se confirm.</li>
</ul></div>
`}};export{e as default};