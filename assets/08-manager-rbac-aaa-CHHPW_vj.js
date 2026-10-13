var e={id:`manager-rbac-aaa`,h:{en:`Securing management: SD-WAN Manager RBAC and AAA`,hi:`Management ko secure karna: SD-WAN Manager RBAC aur AAA`},body:{en:`
<p>SD-WAN Manager can push a policy to every branch with one click. That power makes it the most valuable target in the fabric, and also the place where an honest mistake can do the most damage. Securing management means answering four questions for every person and every tool: <b>who are you, what may you do, what did you do, and how do we stop you if needed?</b> In security language that is authentication, authorization, accounting and revocation.</p>

<h3>Analogy: keys to the control room</h3>
<p>The control room of a metro system has many panels. A trainee may watch the screens, an operator may change signals within limits, and only the chief engineer may reprogram the system. Everyone signs in with a personal badge, and every action is written in a logbook. Nobody shares a badge. That is <b>RBAC</b> (role-based access control) with <b>AAA</b>.</p>

<h3>Role-based access control in Manager</h3>
<p>Users belong to <b>user groups</b>. A group defines what its members can read and write, by feature area (for example monitoring, device configuration, policies, security, administration). Manager ships with default groups, and you can create <b>custom groups</b> with exactly the permissions a role needs.</p>
<table class="cmp"><tr><th>Group</th><th>Typical permission</th><th>Use</th></tr>
<tr><td><b>basic</b></td><td>Read-only on most monitoring</td><td>Help desk, auditors</td></tr>
<tr><td><b>operator</b></td><td>Monitoring and limited operational actions</td><td>NOC engineers</td></tr>
<tr><td><b>netadmin</b></td><td>Full network configuration and administration</td><td>Few senior engineers only</td></tr>
<tr><td><b>Custom</b></td><td>Read or write per feature</td><td>Security team can edit security policy but not templates</td></tr></table>
<p>Apply <b>least privilege</b>: give each person the smallest group that lets them do their job, and review membership every quarter. Separate duties: the person who writes a security policy should not be the only person who can activate it.</p>

<h3>Authentication: local, RADIUS, TACACS+, and single sign-on</h3>
<p>Manager supports local users, external servers (RADIUS or TACACS+) and single sign-on with SAML. The best practice is to authenticate admins against the company directory, so joiners and leavers are handled in one place, and to keep a break-glass local account with a long unique password stored in a vault for use when the external server is unreachable. Enforce strong passwords, multi-factor authentication through the identity provider, and session timeouts. Remove or rename default accounts and change default passwords before the first production day.</p>
<p>Network devices have their own AAA, configured by a template: the order of authentication methods (for example TACACS+ first, then local), command authorization and <b>accounting</b> that records commands to the server. Example idea of the logic: <i>try TACACS+, fall back to local if the server does not answer, and log every command</i>.</p>
<table class="cmp"><tr><th>Plane</th><th>Who connects</th><th>Control</th></tr>
<tr><td>Manager GUI and API</td><td>Admins and automation</td><td>RBAC groups, SSO, API users with minimal groups</td></tr>
<tr><td>Device CLI</td><td>Engineers</td><td>AAA (TACACS+ or RADIUS), command authorization, accounting</td></tr>
<tr><td>Management network</td><td>Both</td><td>VPN 512, ACLs, allow-service limited</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Role based access and AAA flow">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">Engineer</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="11">single sign-on</text>
<rect x="170" y="60" width="150" height="100" rx="10" fill="#ddd6fe"/><text x="245" y="90" text-anchor="middle" class="svg-ink" font-size="14">VMANAGE</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="11">RBAC user groups</text><text x="245" y="128" text-anchor="middle" class="svg-muted" font-size="11">audit log</text>
<rect x="400" y="15" width="220" height="55" rx="8" fill="#fde68a"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">Identity provider / AAA</text><text x="510" y="58" text-anchor="middle" class="svg-muted" font-size="11">RADIUS, TACACS+, SAML</text>
<rect x="400" y="150" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="175" text-anchor="middle" class="svg-ink" font-size="13">WAN Edges</text><text x="510" y="193" text-anchor="middle" class="svg-muted" font-size="11">device AAA, command accounting</text>
<line x1="120" y1="110" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="400" y2="45" stroke="#7c3aed" stroke-width="3"/><line x1="320" y1="140" x2="400" y2="175" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Identity from the directory, rights from the group, record in the log</text>
</svg><p class="cap">Authenticate centrally, authorize by group, and record every action.</p></div>

<h3>Accounting: audit logs and alerts</h3>
<p>Manager keeps an <b>audit log</b> of logins and configuration changes: who, what, when and from where. Forward it to your SIEM and keep it for the period your policy requires. Create alerts for repeated failed logins, new admin accounts, template or policy changes outside change windows, and certificate events. Never reuse accounts: shared accounts make an audit log useless.</p>

<h3>Hardening checklist</h3>
<ul>
<li>Management interfaces (Manager GUI, API, SSH) reachable only from a management network, not from the internet.</li>
<li>HTTPS with a valid certificate; disable unused services; set session and idle timeouts.</li>
<li>API credentials for automation in a vault, with a dedicated minimal group, rotated regularly.</li>
<li>Regular backups of Manager configuration database, stored securely and tested for restore.</li>
<li>Patch Manager and Controllers on a schedule and read the security advisories.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Bharat Retail creates a custom group SEC-POLICY that can edit and activate security policies but cannot change device templates or users. The NOC uses operator. Two senior engineers use netadmin through the company directory with multi-factor authentication. A local break-glass account exists with a long password in the vault. An alert fires when any user is added to netadmin. The auditor sees one named person per action.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Everyone in netadmin. (2) Shared "admin" accounts. (3) Default passwords left in place. (4) AAA with no local fallback, locking everyone out during a server outage. (5) Never reading the audit log.</p></div>

<div class="exam"><p><b>Exam trap.</b> RBAC controls what a user can do through user groups (basic, operator, netadmin or custom). AAA is authentication, authorization and accounting; Manager can use local, RADIUS, TACACS+ or SAML. Device AAA is configured through templates separately from Manager's own user management.</p></div>

<div class="scn"><h4>An unexpected policy change at night</h4><p>The security team asks who changed the guest firewall policy at 02:10. The audit log shows a named user in the SEC-POLICY group, and the change was part of a planned window that was not recorded in the ticket. The team adds change-window checks to alerts and requires a ticket reference in the comment.</p><p><b>Lesson:</b> personal accounts and logs turn a mystery into a five-minute answer.</p></div>

<div class="iv"><p class="q">"How do you secure access to SD-WAN Manager?"</p><p>I use role-based access control with least-privilege user groups (basic, operator, netadmin or custom), authenticate against the directory with RADIUS, TACACS+ or SAML single sign-on and multi-factor authentication, keep a vaulted local break-glass account, and put management on a restricted network. Every action is recorded in the audit log, forwarded to the SIEM with alerts for risky events. Devices use their own AAA with command accounting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RBAC by user groups; apply least privilege and separate duties.</li>
<li>Authenticate centrally (RADIUS, TACACS+, SAML) with a break-glass local account.</li>
<li>AAA includes accounting: audit logs and command logs to a SIEM.</li>
<li>Device AAA is configured by templates; Manager has its own user management.</li>
<li>Harden the management network, API credentials, backups and patching.</li>
</ul></div>
`,hi:`
<p>SD-WAN Manager ek click mein har branch ko policy push kar sakta hai. Yeh taakat use fabric ka sabse keemti target banati hai, aur woh jagah bhi jahan ek imaandar galti sabse zyada nuksan kar sakti hai. Management ko secure karne ka matlab har insaan aur har tool ke liye chaar sawaalon ka jawab dena hai: <b>tum kaun ho, tum kya kar sakte ho, tumne kya kiya, aur zaroorat padne par tumhe kaise roka jaaye?</b> Security ki bhasha mein yeh authentication, authorization, accounting aur revocation hai.</p>

<h3>Analogy: control room ki chaabiyan</h3>
<p>Metro system ke control room mein kai panels hote hain. Trainee screens dekh sakta hai, operator seemit tareeke se signals badal sakta hai, aur sirf chief engineer system reprogram kar sakta hai. Sab personal badge se sign in karte hain, aur har action logbook mein likhi jaati hai. Koi badge share nahi karta. Yeh <b>AAA</b> ke saath <b>RBAC</b> (role-based access control) hai.</p>

<h3>Manager mein role-based access control</h3>
<p>Users <b>user groups</b> mein hote hain. Group define karta hai ki uske members feature area ke hisaab se kya read aur write kar sakte hain (jaise monitoring, device configuration, policies, security, administration). Manager default groups ke saath aata hai, aur tum <b>custom groups</b> bana sakte ho jinme ek role ko jitni permissions chahiye utni hi hoti hain.</p>
<table class="cmp"><tr><th>Group</th><th>Typical permission</th><th>Use</th></tr>
<tr><td><b>basic</b></td><td>Zyadatar monitoring par read-only</td><td>Help desk, auditors</td></tr>
<tr><td><b>operator</b></td><td>Monitoring aur seemit operational actions</td><td>NOC engineers</td></tr>
<tr><td><b>netadmin</b></td><td>Poori network configuration aur administration</td><td>Sirf kuch senior engineers</td></tr>
<tr><td><b>Custom</b></td><td>Per feature read ya write</td><td>Security team security policy edit kar sakti hai lekin templates nahi</td></tr></table>
<p><b>Least privilege</b> lagao: har vyakti ko sabse chhota group do jo uska kaam chalne de, aur har quarter membership review karo. Duties alag rakho: jo vyakti security policy likhta hai woh use activate karne wala akela vyakti nahi hona chahiye.</p>

<h3>Authentication: local, RADIUS, TACACS+ aur single sign-on</h3>
<p>Manager local users, external servers (RADIUS ya TACACS+) aur SAML ke saath single sign-on support karta hai. Best practice hai ki admins ko company directory se authenticate karo, taaki joiners aur leavers ek jagah handle hon, aur break-glass local account rakho jiska lamba unique password vault mein ho aur jo external server unreachable hone par kaam aaye. Strong passwords, identity provider ke through multi-factor authentication, aur session timeouts lagao. Pehle production din se pehle default accounts hatao ya rename karo aur default passwords badlo.</p>
<p>Network devices ka apna AAA hota hai, jo template se configure hota hai: authentication methods ka order (jaise pehle TACACS+, phir local), command authorization aur server ko commands record karne wali <b>accounting</b>. Logic ka idea: <i>TACACS+ try karo, server jawab na de to local par fall back karo, aur har command log karo</i>.</p>
<table class="cmp"><tr><th>Plane</th><th>Kaun connect hota hai</th><th>Control</th></tr>
<tr><td>Manager GUI aur API</td><td>Admins aur automation</td><td>RBAC groups, SSO, minimal groups wale API users</td></tr>
<tr><td>Device CLI</td><td>Engineers</td><td>AAA (TACACS+ ya RADIUS), command authorization, accounting</td></tr>
<tr><td>Management network</td><td>Dono</td><td>VPN 512, ACLs, seemit allow-service</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Role based access aur AAA flow">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">Engineer</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="11">single sign-on</text>
<rect x="170" y="60" width="150" height="100" rx="10" fill="#ddd6fe"/><text x="245" y="90" text-anchor="middle" class="svg-ink" font-size="14">VMANAGE</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="11">RBAC user groups</text><text x="245" y="128" text-anchor="middle" class="svg-muted" font-size="11">audit log</text>
<rect x="400" y="15" width="220" height="55" rx="8" fill="#fde68a"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">Identity provider / AAA</text><text x="510" y="58" text-anchor="middle" class="svg-muted" font-size="11">RADIUS, TACACS+, SAML</text>
<rect x="400" y="150" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="175" text-anchor="middle" class="svg-ink" font-size="13">WAN Edges</text><text x="510" y="193" text-anchor="middle" class="svg-muted" font-size="11">device AAA, command accounting</text>
<line x1="120" y1="110" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="400" y2="45" stroke="#7c3aed" stroke-width="3"/><line x1="320" y1="140" x2="400" y2="175" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Directory se identity, group se rights, log mein record</text>
</svg><p class="cap">Central authentication, group se authorization, aur har action ka record.</p></div>

<h3>Accounting: audit logs aur alerts</h3>
<p>Manager logins aur configuration changes ka <b>audit log</b> rakhta hai: kisne, kya, kab aur kahan se. Use apne SIEM ko forward karo aur utne samay tak rakho jitna tumhari policy maangti hai. Baar baar failed logins, naye admin accounts, change windows ke bahar template ya policy changes, aur certificate events ke liye alerts banao. Accounts kabhi reuse mat karo: shared accounts audit log ko bekaar bana dete hain.</p>

<h3>Hardening checklist</h3>
<ul>
<li>Management interfaces (Manager GUI, API, SSH) sirf management network se reachable hon, internet se nahi.</li>
<li>Valid certificate ke saath HTTPS; unused services band; session aur idle timeouts set.</li>
<li>Automation ke API credentials vault mein, dedicated minimal group ke saath, regularly rotate.</li>
<li>Manager configuration database ke regular backups, securely stored aur restore test kiye hue.</li>
<li>Manager aur Controllers ko schedule par patch karo aur security advisories padho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Bharat Retail custom group SEC-POLICY banata hai jo security policies edit aur activate kar sakta hai lekin device templates ya users nahi badal sakta. NOC operator use karta hai. Do senior engineers company directory se multi-factor authentication ke saath netadmin use karte hain. Vault mein lambe password wala local break-glass account hai. Kisi ke netadmin mein jodne par alert chalta hai. Auditor ko har action ke liye ek named vyakti dikhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Sab netadmin mein. (2) Shared "admin" accounts. (3) Default passwords jaise ke taise. (4) Local fallback ke bina AAA, jo server outage mein sabko lock out kar deta hai. (5) Audit log kabhi na padhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> RBAC user groups (basic, operator, netadmin ya custom) se control karta hai ki user kya kar sakta hai. AAA authentication, authorization aur accounting hai; Manager local, RADIUS, TACACS+ ya SAML use kar sakta hai. Device AAA templates se Manager ke apne user management se alag configure hota hai.</p></div>

<div class="scn"><h4>Raat mein anapekshit policy change</h4><p>Security team poochti hai ki 02:10 baje guest firewall policy kisne badli. Audit log SEC-POLICY group ka ek named user dikhata hai, aur change ek planned window ka hissa tha jo ticket mein record nahi tha. Team alerts mein change-window checks jodti hai aur comment mein ticket reference zaroori karti hai.</p><p><b>Lesson:</b> personal accounts aur logs paheli ko paanch minute ke jawab mein badal dete hain.</p></div>

<div class="iv"><p class="q">"SD-WAN Manager tak access kaise secure karoge?"</p><p>Main least-privilege user groups (basic, operator, netadmin ya custom) ke saath role-based access control use karta hoon, directory se RADIUS, TACACS+ ya SAML single sign-on aur multi-factor authentication se authenticate karta hoon, vaulted local break-glass account rakhta hoon, aur management ko restricted network par rakhta hoon. Har action audit log mein record hota hai, SIEM ko forward hota hai aur risky events ke liye alerts hote hain. Devices command accounting ke saath apna AAA use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User groups se RBAC; least privilege aur separation of duties lagao.</li>
<li>Central authentication (RADIUS, TACACS+, SAML) aur break-glass local account.</li>
<li>AAA mein accounting shamil hai: audit logs aur command logs SIEM ko.</li>
<li>Device AAA templates se hota hai; Manager ka apna user management hai.</li>
<li>Management network, API credentials, backups aur patching harden karo.</li>
</ul></div>
`}};export{e as default};