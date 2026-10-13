var e={id:`onboarding-admins`,h:{en:`Onboarding firewalls and securing administrator access`,hi:`Firewalls onboard karna aur administrator access secure karna`},body:{en:`
<p>Before any push works, the firewall must be a managed device. This chapter shows the onboarding steps and how to give people access without giving them everything.</p>
<div class="note"><p><b>Note.</b> Reference material (not run in the simulator). Serial numbers, addresses and keys below are placeholders.</p></div>
<h3>Onboarding steps</h3>
<p>1. <b>Add the device</b> on Panorama (Panorama, Managed Devices) by its serial number. Use a placeholder such as 000000000001 in documentation and your real serial only in the system.</p>
<p>2. <b>Point the firewall at Panorama</b> in its own Device, Setup, Management settings, with the Panorama server address. On the CLI of the firewall:</p>
<pre class="code">set deviceconfig system panorama-server 192.0.2.50
commit</pre>
<p>3. <b>Connection</b>: the firewall initiates a management connection to Panorama over TCP 3978. Allow that port on any firewall or ACL between them. Browsers reach Panorama on 443 and administrators on 22 for SSH.</p>
<p>4. <b>Assign</b> the device to a device group and a template stack, then commit to Panorama and push.</p>
<p>5. <b>Check</b> that the device shows Connected and Shared Policy and Template as In Sync.</p>
<p>For virtual firewalls and zero-touch designs, a <b>device registration authentication key</b> is created on Panorama with a lifetime and a use count, then entered on the firewall, so the registration is allowed without sharing a permanent secret. Use short lifetimes and a count of one.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="A firewall is registered on Panorama, pointed at it, connects over TCP 3978, then receives its assignments."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Add serial</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">on Panorama</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Point firewall</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">at Panorama</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Connect</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">TCP 3978</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Assign</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">DG + stack</text></svg><p class="cap">A firewall is registered on Panorama, pointed at it, connects over TCP 3978, then receives its assignments.</p></div>
<h3>What the firewall keeps locally</h3>
<p>After onboarding, the firewall keeps its local configuration plus the pushed template and device group content. Settings from a template show on the firewall as pushed (and cannot be edited there unless overridden). You can view them on the firewall with:</p>
<pre class="code">show panorama-status
show config pushed-template
show config pushed-shared-policy</pre>
<h3>Administrator roles on Panorama</h3>
<p>Panorama has its own administrators and roles:</p>
<ul>
<li><b>Role types</b>: Panorama roles (the whole Panorama), Device Group and Template roles (restricted to selected scopes).</li>
<li><b>Admin role profile</b>: switches features on or off for the web interface, XML API, REST API and CLI, for example read-only policy and no access to Commit.</li>
<li><b>Access domains</b>: limit an administrator to chosen device groups, templates and device contexts. A regional engineer can edit the EMEA device group and nothing else.</li>
<li><b>Authentication profile</b>: sends login to RADIUS, LDAP, Kerberos or SAML, with multi-factor authentication; local accounts remain only for a break-glass account.</li>
</ul>
<p>Practical least-privilege model:</p>
<table class="cmp">
<tr><th>Person</th><th>Role</th><th>Scope</th></tr>
<tr><td>Policy author</td><td>Edit policy and objects, no Commit All</td><td>One device group</td></tr>
<tr><td>Network engineer</td><td>Edit templates</td><td>Template stack for their region</td></tr>
<tr><td>Release approver</td><td>Commit and push</td><td>All, with an audit comment</td></tr>
<tr><td>Auditor</td><td>Read-only, config audit and logs</td><td>All</td></tr>
</table>
<h3>Audit trail</h3>
<ul>
<li><b>Audit comments</b>: policy rules can require a comment when edited, and commits take a description. Write the ticket number in the description.</li>
<li><b>Config audit</b>: compare any two saved configuration versions in Panorama to see exactly what changed.</li>
<li><b>Config and System logs</b>: show who logged in, who committed and pushed, and from where. Forward them to your central logging.</li>
<li><b>Locks</b>: a config lock stops other administrators from changing configuration while you work; a commit lock stops a competing commit.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> The EMEA policy author logs in with SAML and MFA, is placed in the access domain EMEA-DG, edits a rule and saves it with the audit comment CHG-1042. She cannot push; the release approver reviews the change summary, commits and pushes in the window with the same ticket as description.</p></div>
<div class="warn"><p><b>Common mistake.</b> Giving everyone a superuser role for convenience, or sharing one admin account. You lose the audit trail and the blast radius of one stolen password is the whole network.</p></div>
<div class="exam"><p><b>Exam trap.</b> Access domains limit administrators to device groups and templates; the firewall initiates the connection to Panorama on TCP 3978. Keep API keys and auth keys confidential and short-lived.</p></div>
<div class="scn"><h4>The shared password nobody could trace</h4><p>A branch rule was changed and traffic broke. Panorama showed one shared account for the change, so the team could not tell who made it. They moved to SAML with named accounts, access domains and required audit comments. The next incident was traced to a person and a ticket within minutes.</p><p><b>Lesson:</b> audit trails need named accounts; shared logins remove them.</p></div>
<div class="iv"><p class="q">"How do you give a regional team access to edit only their policy in Panorama?"</p><p>Create an admin role profile for policy editing, assign an access domain that contains only their device group (and template if needed), authenticate through the identity provider with MFA, and keep Commit All with a separate approver. Require audit comments so changes trace to a ticket.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Add the serial on Panorama, point the firewall at it, and allow TCP 3978.</li><li>Use short-lived registration keys; keep secrets out of documents.</li><li>Access domains and role profiles enforce least privilege.</li><li>Named accounts, MFA and break-glass accounts protect Panorama.</li><li>Audit comments, config audit and config logs show who changed what.</li></ul></div>
`,hi:`
<p>Koi bhi push chalne se pehle firewall managed device hona chahiye. Yeh chapter onboarding steps dikhata hai aur yeh ki logon ko sab kuch diye bina access kaise dein.</p>
<div class="note"><p><b>Note.</b> Reference material (simulator mein nahi chalta). Neeche ke serial numbers, addresses aur keys placeholders hain.</p></div>
<h3>Onboarding steps</h3>
<p>1. Panorama par (Panorama, Managed Devices) serial number se <b>device add</b> karo. Documentation mein 000000000001 jaisa placeholder use karo aur asli serial sirf system mein.</p>
<p>2. Firewall ko apne Device, Setup, Management settings mein Panorama server address se <b>Panorama ki taraf point</b> karo. Firewall ke CLI par:</p>
<pre class="code">set deviceconfig system panorama-server 192.0.2.50
commit</pre>
<p>3. <b>Connection</b>: firewall Panorama tak TCP 3978 par management connection khud shuru karta hai. Beech ke kisi firewall ya ACL par yeh port allow karo. Browsers Panorama tak 443 par aur administrators SSH ke liye 22 par aate hain.</p>
<p>4. Device ko device group aur template stack mein <b>assign</b> karo, phir Panorama mein commit aur push karo.</p>
<p>5. <b>Check</b> karo ki device Connected dikhe aur Shared Policy aur Template In Sync dikhein.</p>
<p>Virtual firewalls aur zero-touch designs ke liye Panorama par lifetime aur use count ke saath <b>device registration authentication key</b> banti hai, jo firewall par daali jaati hai, taaki permanent secret share kiye bina registration allow ho. Chhoti lifetime aur count ek rakho.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Firewall Panorama par register hota hai, uski taraf point hota hai, TCP 3978 par connect hota hai, phir assignments paata hai."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Add serial</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">Panorama par</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall point karo</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">Panorama par</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Connect</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">TCP 3978</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Assign</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">DG + stack</text></svg><p class="cap">Firewall Panorama par register hota hai, uski taraf point hota hai, TCP 3978 par connect hota hai, phir assignments paata hai.</p></div>
<h3>Firewall local mein kya rakhta hai</h3>
<p>Onboarding ke baad firewall local configuration plus pushed template aur device group content rakhta hai. Template ki settings firewall par pushed dikhti hain (aur override ke bina wahan edit nahi hoti). Firewall par unhe dekhne ke liye:</p>
<pre class="code">show panorama-status
show config pushed-template
show config pushed-shared-policy</pre>
<h3>Panorama par administrator roles</h3>
<p>Panorama ke apne administrators aur roles hote hain:</p>
<ul>
<li><b>Role types</b>: Panorama roles (poora Panorama), Device Group aur Template roles (chune hue scopes tak restricted).</li>
<li><b>Admin role profile</b>: web interface, XML API, REST API aur CLI ke features on ya off karta hai, jaise read-only policy aur Commit ka access nahi.</li>
<li><b>Access domains</b>: administrator ko chune hue device groups, templates aur device contexts tak limit karte hain. Regional engineer EMEA device group edit kar sakta hai aur kuch nahi.</li>
<li><b>Authentication profile</b>: login ko RADIUS, LDAP, Kerberos ya SAML par bhejta hai, multi-factor authentication ke saath; local accounts sirf break-glass account ke liye rehte hain.</li>
</ul>
<p>Practical least-privilege model:</p>
<table class="cmp">
<tr><th>Vyakti</th><th>Role</th><th>Scope</th></tr>
<tr><td>Policy author</td><td>Policy aur objects edit, Commit All nahi</td><td>Ek device group</td></tr>
<tr><td>Network engineer</td><td>Templates edit</td><td>Apne region ka template stack</td></tr>
<tr><td>Release approver</td><td>Commit aur push</td><td>Sab, audit comment ke saath</td></tr>
<tr><td>Auditor</td><td>Read-only, config audit aur logs</td><td>Sab</td></tr>
</table>
<h3>Audit trail</h3>
<ul>
<li><b>Audit comments</b>: policy rules edit par comment zaroori kar sakte ho, aur commits description lete hain. Description mein ticket number likho.</li>
<li><b>Config audit</b>: Panorama mein do saved configuration versions compare karke dekho exactly kya badla.</li>
<li><b>Config aur System logs</b>: dikhate hain kisne login kiya, kisne commit aur push kiya, aur kahan se. Inhe central logging ko forward karo.</li>
<li><b>Locks</b>: config lock aapke kaam ke dauran doosre administrators ko configuration badalne se rokta hai; commit lock competing commit rokta hai.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> EMEA policy author SAML aur MFA se login karti hai, access domain EMEA-DG mein hai, ek rule edit karke audit comment CHG-1042 ke saath save karti hai. Woh push nahi kar sakti; release approver change summary review karke window mein usi ticket ko description banakar commit aur push karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Convenience ke liye sabko superuser role dena, ya ek admin account share karna. Audit trail jaata hai aur ek chori hue password ka blast radius poora network ban jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Access domains administrators ko device groups aur templates tak limit karte hain; firewall Panorama se TCP 3978 par connection khud shuru karta hai. API keys aur auth keys confidential aur short-lived rakho.</p></div>
<div class="scn"><h4>Shared password jise koi trace nahi kar paya</h4><p>Ek branch rule badli aur traffic toot gaya. Panorama ne change ke liye ek shared account dikhaya, isliye team nahi bata paayi kisne kiya. Unhone named accounts, access domains aur required audit comments ke saath SAML par shift kiya. Agla incident minutes mein ek vyakti aur ticket tak trace ho gaya.</p><p><b>Lesson:</b> audit trails ko named accounts chahiye; shared logins unhe hata dete hain.</p></div>
<div class="iv"><p class="q">"Regional team ko Panorama mein sirf apni policy edit karne ka access kaise doge?"</p><p>Policy editing ka admin role profile banao, ek access domain assign karo jisme sirf unka device group (aur zaroorat ho to template) ho, identity provider se MFA ke saath authenticate karo, aur Commit All alag approver ke paas rakho. Audit comments zaroori karo taaki changes ticket tak trace hon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Panorama par serial add karo, firewall ko usse point karo, aur TCP 3978 allow karo.</li><li>Short-lived registration keys use karo; secrets documents se bahar rakho.</li><li>Access domains aur role profiles least privilege enforce karte hain.</li><li>Named accounts, MFA aur break-glass accounts Panorama ko protect karte hain.</li><li>Audit comments, config audit aur config logs dikhate hain kisne kya badla.</li></ul></div>
`}};export{e as default};