var e={id:`security-hygiene`,h:{en:`Security hygiene: admin access, RBAC, certificates, tenant boundaries`,hi:`Security hygiene: admin access, RBAC, certificates, tenant boundaries`},body:{en:`
<p>A bank vault has a thick door, but the bank also controls who holds the keys, which keys open which rooms, whether keys expire, and who records each entry in a logbook. Securing an SD-WAN is similar. The encrypted tunnels are the thick door. Operations security is everything around the door: who may log in, what each person may do, whether certificates are still valid, and whether every change leaves a trace. This chapter is written from the defender's point of view: what to protect, what to check, and what good looks like.</p>

<h3>Four areas of operational security</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Security areas">
<rect x="10" y="20" width="148" height="120" rx="8" fill="#bae6fd"/><text x="84" y="46" text-anchor="middle" class="svg-ink" font-size="13">Admin access</text><text x="84" y="68" text-anchor="middle" class="svg-muted" font-size="11">named accounts</text><text x="84" y="84" text-anchor="middle" class="svg-muted" font-size="11">strong auth, MFA</text><text x="84" y="100" text-anchor="middle" class="svg-muted" font-size="11">management network</text>
<rect x="170" y="20" width="148" height="120" rx="8" fill="#ddd6fe"/><text x="244" y="46" text-anchor="middle" class="svg-ink" font-size="13">RBAC</text><text x="244" y="68" text-anchor="middle" class="svg-muted" font-size="11">least privilege</text><text x="244" y="84" text-anchor="middle" class="svg-muted" font-size="11">read-only roles</text><text x="244" y="100" text-anchor="middle" class="svg-muted" font-size="11">per-tenant scope</text>
<rect x="330" y="20" width="148" height="120" rx="8" fill="#fde68a"/><text x="404" y="46" text-anchor="middle" class="svg-ink" font-size="13">Certificates</text><text x="404" y="68" text-anchor="middle" class="svg-muted" font-size="11">device identity</text><text x="404" y="84" text-anchor="middle" class="svg-muted" font-size="11">expiry tracking</text><text x="404" y="100" text-anchor="middle" class="svg-muted" font-size="11">renewal plan</text>
<rect x="490" y="20" width="140" height="120" rx="8" fill="#bbf7d0"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Audit and logs</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">who changed what</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">logs reach Analytics</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">alerts on gaps</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">The tunnels protect traffic; these four protect the system that builds the tunnels</text>
</svg><p class="cap">Operational security is a set of boring, repeatable habits. Most real incidents come from skipping one of them.</p></div>

<h3>Admin access</h3>
<ul>
<li><b>Named accounts.</b> Every engineer has a personal login, never a shared "admin" that nobody can attribute. In the course CLI you are <code>admin</code> for practice; in production use named users so the audit trail means something.</li>
<li><b>Strong authentication.</b> Long passphrases or keys, multi-factor authentication on the Director GUI, and central authentication (for example a directory or an authentication server) so that leavers lose access in one place.</li>
<li><b>Management plane isolation.</b> The Director, Controller and Analytics management addresses (in the lab 198.51.100.10, .20 and .30) should be reachable only from a management network or jump host, not from the open Internet. Disable services you do not use.</li>
<li><b>Change default credentials</b> on every new device before it goes into service, including during zero-touch onboarding.</li>
</ul>

<h3>RBAC: role-based access control</h3>
<p><b>RBAC</b> means you give a person a <b>role</b> that contains only the permissions the job needs. A service-desk analyst may need to <i>see</i> tunnel and SLA state but not to commit configuration. A network engineer may change branch configuration in tenant Acme but not touch the headend. A platform administrator may do everything but is a very small group. This is the principle of <b>least privilege</b>. It limits mistakes (a read-only account cannot commit a typo) and limits the damage of a stolen account. In a multi-tenant Versa deployment roles can also be scoped to one tenant (organization), so the team that manages one customer cannot see another.</p>
<table class="cmp"><tr><th>Role example</th><th>Can</th><th>Cannot</th></tr>
<tr><td>Read-only operator</td><td>view dashboards, run show commands</td><td>commit, delete, push templates</td></tr>
<tr><td>Branch engineer</td><td>change branch settings in own tenant</td><td>change headend, other tenants</td></tr>
<tr><td>Template owner</td><td>edit and deploy templates</td><td>manage users, certificates</td></tr>
<tr><td>Platform admin</td><td>everything</td><td>(small group, reviewed often)</td></tr></table>

<h3>Certificates and device identity</h3>
<p>Devices prove who they are with <b>certificates</b> or equivalent credentials, and the tunnels use keys that are negotiated with those identities. If a certificate expires, the device can no longer authenticate and the tunnel or management connection fails even though every cable and route is fine. That is why certificate expiry is one of the classic "everything was perfect yesterday" faults. Defensive habits: keep an inventory of certificate expiry dates, alert at 60, 30 and 7 days, renew in a maintenance window, and verify afterwards that tunnels and BGP are up. The course CLI does not model certificates, so this is conceptual; practise it on real equipment or a vendor lab.</p>

<h3>Tenant boundaries are a security control</h3>
<p>In earlier modules you saw that LAN reachability needs the same organization. That boundary is a security feature. In the capstone you will see that a fix must not widen reachability by accident: acceptance includes what must stay blocked. If you "fix" a missing route by importing everything between tenants, the connectivity test passes and the security boundary is gone.</p>

<h3>Audit and logging</h3>
<p>Security needs evidence. Every administrative action should be logged with who, what and when; logs must flow to Analytics (chapter 7) and be retained for as long as your policy requires; and time must be synchronised (NTP) on all devices so that logs from different devices line up in an investigation. Alarm on the absence of logs, because an attacker or a typo can both cause silence.</p>

<div class="eg"><p><b>Worked example.</b> Quarterly access review. The platform lists 14 accounts with access to the Director. Three belong to contractors whose contract ended, one is a shared account used by two people, and two service-desk analysts have write permission they never use. Actions: disable three accounts, split the shared account into two named users, move two analysts to a read-only role. Total time: 40 minutes. Risk removed: three orphan logins that could have been used by anyone with the password.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Shared admin passwords; leaving default credentials; Director GUI reachable from the Internet; giving everyone full admin "to keep it simple"; no certificate expiry tracking; time not synchronised so logs cannot be correlated; "fixing" connectivity by widening policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Least privilege is the answer to most RBAC questions: the smallest role that lets the person do the job. Also, encryption of tunnels does not replace access control on the management plane; both are needed.</p></div>

<div class="scn"><h4>The certificate that expired on Sunday</h4><p>On a Sunday morning several branches lost their management connection to the Director while user traffic continued normally. Interfaces, routes and tunnels were fine. The engineer compared the time of the first failure with the certificate inventory and found that a shared management certificate had expired at midnight. Renewal and redeployment restored management. The team then added expiry alerts at 60, 30 and 7 days.</p><p><b>Lesson:</b> time-based faults have no config change behind them; keep an expiry calendar.</p></div>

<div class="iv"><p class="q">"How do you keep an SD-WAN's management plane secure?"</p><p>Named accounts with MFA and central authentication, management network isolation, least-privilege roles scoped per tenant, certificate inventory with expiry alerts, audit logs shipped to Analytics with NTP, and regular access reviews. Mention that tenant isolation must survive every fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnels protect traffic; access control, RBAC, certificates and audit protect the system.</li>
<li>Use named accounts, MFA, isolated management networks and no default credentials.</li>
<li>RBAC means least privilege, optionally scoped per tenant.</li>
<li>Expired certificates break authentication even when the network is perfect.</li>
<li>Never widen reachability or policy as a shortcut; verify what must stay blocked.</li>
</ul></div>
`,hi:`
<p>Bank vault ka darwaza mota hota hai, lekin bank ye bhi control karta hai ki chaabiyan kiske paas hain, kaunsi chaabi kaunsa kamra kholti hai, chaabiyan expire hoti hain ya nahi, aur har entry logbook mein kaun likhta hai. SD-WAN secure karna bhi aisa hi hai. Encrypted tunnels mota darwaza hain. Operations security darwaze ke aas-paas ki har cheez hai: kaun login kar sakta hai, har vyakti kya kar sakta hai, certificates abhi valid hain ya nahi, aur har change nishaan chhodta hai ya nahi. Ye chapter defender ke nazariye se likha hai: kya protect karna hai, kya check karna hai, aur achha kaisa dikhta hai.</p>

<h3>Operational security ke chaar areas</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Security areas">
<rect x="10" y="20" width="148" height="120" rx="8" fill="#bae6fd"/><text x="84" y="46" text-anchor="middle" class="svg-ink" font-size="13">Admin access</text><text x="84" y="68" text-anchor="middle" class="svg-muted" font-size="11">named accounts</text><text x="84" y="84" text-anchor="middle" class="svg-muted" font-size="11">strong auth, MFA</text><text x="84" y="100" text-anchor="middle" class="svg-muted" font-size="11">management network</text>
<rect x="170" y="20" width="148" height="120" rx="8" fill="#ddd6fe"/><text x="244" y="46" text-anchor="middle" class="svg-ink" font-size="13">RBAC</text><text x="244" y="68" text-anchor="middle" class="svg-muted" font-size="11">least privilege</text><text x="244" y="84" text-anchor="middle" class="svg-muted" font-size="11">read-only roles</text><text x="244" y="100" text-anchor="middle" class="svg-muted" font-size="11">per-tenant scope</text>
<rect x="330" y="20" width="148" height="120" rx="8" fill="#fde68a"/><text x="404" y="46" text-anchor="middle" class="svg-ink" font-size="13">Certificates</text><text x="404" y="68" text-anchor="middle" class="svg-muted" font-size="11">device identity</text><text x="404" y="84" text-anchor="middle" class="svg-muted" font-size="11">expiry tracking</text><text x="404" y="100" text-anchor="middle" class="svg-muted" font-size="11">renewal plan</text>
<rect x="490" y="20" width="140" height="120" rx="8" fill="#bbf7d0"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Audit aur logs</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">kisne kya badla</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">logs Analytics tak</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">gaps par alerts</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Tunnels traffic ko protect karte hain; ye chaar tunnels banane wale system ko</text>
</svg><p class="cap">Operational security boring, repeatable habits ka set hai. Zyadatar real incidents inme se ek skip karne se aate hain.</p></div>

<h3>Admin access</h3>
<ul>
<li><b>Named accounts.</b> Har engineer ka personal login ho, kabhi shared "admin" nahi jise koi attribute na kar sake. Course CLI mein practice ke liye aap <code>admin</code> ho; production mein named users use karo taaki audit trail ka matlab ho.</li>
<li><b>Strong authentication.</b> Lambi passphrases ya keys, Director GUI par multi-factor authentication, aur central authentication (jaise directory ya authentication server) taaki jaane wale ka access ek jagah se hat jaye.</li>
<li><b>Management plane isolation.</b> Director, Controller aur Analytics ke management addresses (lab mein 198.51.100.10, .20 aur .30) sirf management network ya jump host se reachable hon, open Internet se nahi. Jo services use nahi hoti unhe disable karo.</li>
<li><b>Default credentials badlo</b> har naye device par service mein jane se pehle, zero-touch onboarding ke dauran bhi.</li>
</ul>

<h3>RBAC: role-based access control</h3>
<p><b>RBAC</b> ka matlab hai aap vyakti ko ek <b>role</b> dete ho jisme sirf wahi permissions hain jo kaam ko chahiye. Service-desk analyst ko tunnel aur SLA state <i>dekhna</i> ho sakta hai lekin configuration commit nahi karna. Network engineer tenant Acme mein branch configuration badal sakta hai lekin headend ko haath nahi lagata. Platform administrator sab kuch kar sakta hai par wo bahut chhota group hota hai. Ye <b>least privilege</b> ka principle hai. Ye galtiyan kam karta hai (read-only account typo commit nahi kar sakta) aur chori hue account ka damage kam karta hai. Multi-tenant Versa deployment mein roles ek tenant (organization) tak scoped bhi ho sakte hain, taaki ek customer manage karne wali team doosre ko na dekh sake.</p>
<table class="cmp"><tr><th>Role example</th><th>Kar sakta hai</th><th>Nahi kar sakta</th></tr>
<tr><td>Read-only operator</td><td>dashboards dekhna, show commands</td><td>commit, delete, templates push</td></tr>
<tr><td>Branch engineer</td><td>apne tenant mein branch settings badalna</td><td>headend, doosre tenants badalna</td></tr>
<tr><td>Template owner</td><td>templates edit aur deploy</td><td>users, certificates manage</td></tr>
<tr><td>Platform admin</td><td>sab kuch</td><td>(chhota group, aksar review)</td></tr></table>

<h3>Certificates aur device identity</h3>
<p>Devices <b>certificates</b> ya equivalent credentials se apni pehchan prove karte hain, aur tunnels un identities ke saath negotiate hui keys use karte hain. Certificate expire ho jaye to device authenticate nahi kar pata aur tunnel ya management connection fail ho jata hai, chahe har cable aur route theek ho. Isiliye certificate expiry classic "kal tak sab perfect tha" fault hai. Defensive habits: certificate expiry dates ki inventory rakho, 60, 30 aur 7 din par alert do, maintenance window mein renew karo, aur baad mein verify karo ki tunnels aur BGP up hain. Course CLI certificates model nahi karta, isliye ye conceptual hai; real equipment ya vendor lab par practise karo.</p>

<h3>Tenant boundaries ek security control hain</h3>
<p>Pichhle modules mein dekha ki LAN reachability ke liye same organization chahiye. Ye boundary ek security feature hai. Capstone mein dekhoge ki fix reachability ko galti se widen na kare: acceptance mein ye bhi hai ki kya blocked rehna chahiye. Missing route ko "fix" karne ke liye tenants ke beech sab import kar doge to connectivity test pass hoga aur security boundary chali jayegi.</p>

<h3>Audit aur logging</h3>
<p>Security ko evidence chahiye. Har administrative action who, what aur when ke saath log ho; logs Analytics tak jayein (chapter 7) aur utne time retain hon jitna aapki policy chahe; aur sab devices par time synchronised ho (NTP) taaki alag devices ke logs investigation mein line up hon. Logs ke absence par alarm lagao, kyunki attacker ya typo dono silence la sakte hain.</p>

<div class="eg"><p><b>Worked example.</b> Quarterly access review. Platform Director ke liye 14 accounts list karta hai. Teen contractors ke hain jinka contract khatam ho chuka, ek shared account hai jo do log use karte hain, aur do service-desk analysts ke paas write permission hai jo wo kabhi use nahi karte. Actions: teen accounts disable, shared account ko do named users mein todo, do analysts ko read-only role par shift karo. Total time: 40 minute. Risk hata: teen orphan logins jo password jaanne wala koi bhi use kar sakta tha.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Shared admin passwords; default credentials chhodna; Director GUI Internet se reachable; "simple rakhne ke liye" sabko full admin dena; certificate expiry tracking na hona; time synchronised na hone se logs correlate na ho paana; policy widen karke connectivity "fix" karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zyadatar RBAC questions ka jawab least privilege hai: sabse chhota role jo vyakti ko kaam karne de. Ye bhi: tunnels ki encryption management plane ke access control ko replace nahi karti; dono chahiye.</p></div>

<div class="scn"><h4>Wo certificate jo Sunday ko expire hua</h4><p>Sunday subah kai branches ka Director se management connection toot gaya jabki user traffic normal chalta raha. Interfaces, routes aur tunnels theek the. Engineer ne pehli failure ka time certificate inventory se compare kiya aur paaya ki ek shared management certificate raat 12 baje expire hua tha. Renewal aur redeployment se management wapas aaya. Phir team ne 60, 30 aur 7 din par expiry alerts lagaye.</p><p><b>Lesson:</b> time-based faults ke peeche koi config change nahi hota; expiry calendar rakho.</p></div>

<div class="iv"><p class="q">"SD-WAN ka management plane secure kaise rakhte ho?"</p><p>MFA aur central authentication ke saath named accounts, management network isolation, per-tenant scoped least-privilege roles, expiry alerts ke saath certificate inventory, NTP ke saath audit logs jo Analytics tak jayein, aur regular access reviews. Batao ki har fix ke baad tenant isolation survive honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnels traffic protect karte hain; access control, RBAC, certificates aur audit system ko.</li>
<li>Named accounts, MFA, isolated management networks aur koi default credentials nahi.</li>
<li>RBAC ka matlab least privilege, optionally per tenant scoped.</li>
<li>Expired certificates network perfect hone par bhi authentication tod dete hain.</li>
<li>Shortcut ke taur par reachability ya policy kabhi widen mat karo; verify karo ki kya blocked rehna chahiye.</li>
</ul></div>
`}};export{e as default};