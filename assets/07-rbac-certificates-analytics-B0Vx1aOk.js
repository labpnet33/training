var e={id:`rbac-certificates-analytics`,h:{en:`RBAC users and groups, certificate renewal and Analytics`,hi:`RBAC users aur groups, certificate renewal aur Analytics`},body:{en:`
<p>An office building has a reception desk, a security guard, an electrician and the owner. They carry different keys: the receptionist's card opens the lobby, the electrician's opens the panel rooms, the owner's opens everything. Each key also has an <b>expiry date</b>. If the security guard's card expires on Sunday, he is locked out on Monday morning. This chapter is about the two kinds of keys in a Catalyst SD-WAN network: <b>people's access</b> (RBAC) and <b>devices' identity</b> (certificates), plus the cloud <b>Analytics</b> service that watches trends over months.</p>

<h3>RBAC: who may do what in the Manager</h3>
<p><b>Role-based access control (RBAC)</b> gives each person only the permissions needed for the job. The Manager works with <b>users</b> and <b>user groups</b>; permissions belong to the group, and a user inherits the permissions of the groups they belong to.</p>
<ul>
<li>Three <b>predefined groups</b>: <b>basic</b> (limited, mostly read access), <b>operator</b> (intermediate; can see and run operational tasks) and <b>netadmin</b> (full network administrator). The built-in <b>admin</b> user is in netadmin.</li>
<li><b>Custom user groups</b> can be created in <b>Administration &gt; Manage Users</b>, choosing <b>read</b> and <b>write</b> permission for each feature area, such as Monitor, Configuration templates, Policy, Software upgrade, Certificates and Administration. This is how the trainee in chapter 3 gets monitoring access but cannot activate a policy.</li>
<li><b>External authentication</b>: users can be authenticated by a central <b>RADIUS</b> or <b>TACACS+</b> server (see the sdw-sec module), which maps them to Manager groups, so leavers lose access when the central directory removes them.</li>
<li><b>Account protection</b>: set automatic lockout after a number of failed logins or a period of inactivity, with automatic or manual unlock.</li>
</ul>
<p>Good practice: change the default admin password at first login; give every person their own account; use the audit log to review who did what; create a <b>dedicated, least-privilege user for automation</b> (chapter 4); remove accounts of people who leave.</p>
<table class="cmp"><tr><th>Person</th><th>Group</th><th>Why</th></tr>
<tr><td>NOC trainee</td><td>basic or a custom read-only group</td><td>Can view dashboards and alarms, cannot change anything</td></tr>
<tr><td>NOC engineer</td><td>operator or custom "NOC-ops" group</td><td>Can run diagnostics, acknowledge alarms, use real-time tools</td></tr>
<tr><td>Network designer</td><td>custom "policy-admin" group</td><td>Write access to templates and policy, no user management</td></tr>
<tr><td>Platform owner</td><td>netadmin</td><td>Everything, including users and certificates</td></tr>
<tr><td>Reporting script</td><td>custom read-only API group</td><td>Reads inventory and statistics only</td></tr></table>

<h3>Certificates: the identity of every device</h3>
<p>You met certificates in the sdw-ctrl and sdw-sec modules. Operationally, three questions matter: <b>who issues them, where do I see their state, and when do they expire?</b></p>
<ul>
<li><b>Issuers</b>: set in <b>Administration &gt; Settings</b>. The options are <b>Cisco PKI</b> (Cisco's recommended method; certificates are issued automatically through your smart account), <b>Enterprise Certificate</b> (signed by your own certificate authority) and the <b>Manual</b> method. Cisco notes that Cisco PKI is the default for virtual devices from release 20.18.1.</li>
<li><b>Where to look</b>: <b>Configuration &gt; Certificates</b> has two tabs: <b>WAN Edge List</b> (serial numbers, validity state) and <b>Controllers</b> (called Control Components from release 17.13.1a). Each WAN edge shows <b>Valid</b> (green, can join), <b>Staging</b> (yellow, being tested) or <b>Invalid</b> (red). The <b>Send to Controllers</b> button pushes the authorized list to the Controllers and Validators; if you forget it, new devices cannot authenticate.</li>
<li><b>CSR and renewal</b>: from each device's <b>More Actions</b> menu you can view, generate or renew a certificate signing request. When the Manager installs a new certificate on a WAN edge, the device first tests it in a staging step before switching to it, so a bad certificate does not cut the device off.</li>
<li><b>Expiry warnings</b>: the Manager raises alarms and sends SNMP traps for expiring enterprise certificates, more and more often as the date nears: monthly, then weekly, then daily, and every 12 hours in the final week. These warnings help only if someone receives them (chapter 3).</li>
</ul>
<pre class="out">E-DEL-1# show sdwan certificate validity
Certificate Valid From : Oct 02 06:00:00 2025 GMT
Certificate Valid To   : <span class="hl">Oct 02 06:00:00 2027 GMT</span>
E-DEL-1# show sdwan control local-properties | include certificate|organization
organization-name            BHARAT-RETAIL
certificate-status           Installed
<span class="hl">certificate-validity         Valid</span></pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Certificate calendar">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="3"/>
<circle cx="60" cy="100" r="8" fill="#bbf7d0"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="12">Issued</text><text x="60" y="146" text-anchor="middle" class="svg-muted" font-size="11">day 0</text>
<circle cx="260" cy="100" r="8" fill="#fde68a"/><text x="260" y="130" text-anchor="middle" class="svg-ink" font-size="12">6 months left</text><text x="260" y="146" text-anchor="middle" class="svg-muted" font-size="11">monthly warnings</text>
<circle cx="410" cy="100" r="8" fill="#fed7aa"/><text x="410" y="130" text-anchor="middle" class="svg-ink" font-size="12">60 days left</text><text x="410" y="146" text-anchor="middle" class="svg-muted" font-size="11">plan and renew</text>
<circle cx="520" cy="100" r="8" fill="#fed7aa"/><text x="520" y="130" text-anchor="middle" class="svg-ink" font-size="12">7 days left</text><text x="520" y="146" text-anchor="middle" class="svg-muted" font-size="11">daily, then 12 h</text>
<circle cx="595" cy="100" r="8" fill="#fca5a5"/><text x="595" y="130" text-anchor="middle" class="svg-ink" font-size="12">Expiry</text><text x="595" y="146" text-anchor="middle" class="svg-muted" font-size="11">devices drop off</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">Renew well before the expiry date, not on it</text>
</svg><p class="cap">Warnings get more frequent as expiry approaches; the safe renewal point is weeks earlier.</p></div>

<h3>A certificate renewal runbook</h3>
<ol>
<li><b>Inventory</b>: list controller and WAN edge certificate expiry dates (Configuration &gt; Certificates, or the API).</li>
<li><b>Check the clock and NTP</b> on all devices; a wrong clock looks like an expired certificate.</li>
<li><b>Back up</b> the Manager (chapter 5) and keep the root certificate and authorized serial file safe.</li>
<li><b>Renew controllers first</b> (during a change window), verify control connections, then WAN edges in waves, as in an upgrade.</li>
<li><b>Send to Controllers</b> if the WAN edge list changed, and verify with <code>show sdwan control connections</code>.</li>
<li><b>Record</b> the new expiry dates in the runbook calendar.</li>
</ol>

<h3>Analytics</h3>
<p><b>Cisco Catalyst SD-WAN Analytics</b> is a cloud service that takes data from the Manager and adds longer-term trends, application and site analysis and recommendations that the on-premises dashboards cannot show over months. It is turned on in <b>Administration &gt; Settings</b> under cloud services (the same area where the AI Assistant is enabled), and the Manager must reach the cloud service. Use the Manager dashboards for incidents (what is wrong now) and Analytics for planning (which sites need more bandwidth next quarter, how application performance changed since the SLA policy).</p>

<div class="eg"><p><b>Worked example.</b> The controller certificates of Bharat Retail were issued on 2 October 2025 and are valid for two years. The runbook calendar says: 2 April 2027 (6 months before) start monthly review; 2 August 2027 (60 days before) schedule the renewal; the renewal runs on Saturday 7 August 2027, 01:00 to 03:00, controllers first. Without the calendar the first warning email in the shared mailbox would arrive in April and nobody would own it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Sharing the admin account among the team. (2) Using netadmin for everything because custom groups are "too much work". (3) Letting a certificate reach the expiry date. (4) Renewing a controller certificate without a backup. (5) Forgetting to push the updated list with Send to Controllers.</p></div>

<div class="exam"><p><b>Exam trap.</b> The three predefined groups are basic, operator and netadmin; custom groups give per-feature read or write. Certificate options are Cisco PKI, Enterprise and Manual. WAN edge states are valid, staging and invalid. <b>Send to Controllers</b> synchronises the authorized list.</p></div>

<div class="scn"><h4>Everyone was netadmin</h4><p>An audit at a manufacturer found 14 netadmin users, including three who had left the company. A contractor's account had activated a policy outside a change window. The company moved authentication to TACACS+ so that leavers lost access automatically, created a "NOC-ops" and a "policy-admin" group, and kept netadmin for three people. The next audit had no findings.</p><p><b>Lesson:</b> least privilege plus central authentication prevents most accidents.</p></div>

<div class="iv"><p class="q">"How do you control who can change what in the Manager, and how do you avoid a certificate-expiry outage?"</p><p>I use RBAC: the predefined basic, operator and netadmin groups plus custom groups with read or write per feature, central TACACS+ or RADIUS authentication, lockout settings and audit-log reviews, and a dedicated least-privilege account for automation. For certificates I keep an expiry inventory and a calendar, route expiry alarms and SNMP traps to a monitored channel, renew weeks ahead with a backup, controllers first, then the edges, and verify control connections.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RBAC: basic, operator, netadmin and custom groups with per-feature read and write.</li>
<li>Use central authentication, lockout and the audit log; change default passwords.</li>
<li>Certificates: Cisco PKI, Enterprise or Manual; Configuration &gt; Certificates shows state.</li>
<li>Renew early, controllers first, and push the list with Send to Controllers.</li>
<li>Analytics is the cloud view for trends and planning; dashboards are for incidents.</li>
</ul></div>
`,hi:`
<p>Office building mein reception desk, security guard, electrician aur owner hote hain. Sabke paas alag chaabiyan hoti hain: receptionist ka card lobby kholta hai, electrician ka panel rooms, owner ka sab kuch. Har chaabi ki ek <b>expiry date</b> bhi hoti hai. Agar security guard ka card Sunday ko expire ho jaaye to Monday subah woh bahar reh jaata hai. Yeh chapter Catalyst SD-WAN network ki do tarah ki chaabiyon ke baare mein hai: <b>logon ka access</b> (RBAC) aur <b>devices ki identity</b> (certificates), saath hi cloud <b>Analytics</b> service jo mahinon ke trends dekhti hai.</p>

<h3>RBAC: Manager mein kaun kya kar sakta hai</h3>
<p><b>Role-based access control (RBAC)</b> har insaan ko sirf kaam ke liye zaroori permissions deta hai. Manager <b>users</b> aur <b>user groups</b> ke saath kaam karta hai; permissions group ki hoti hain, aur user un groups ki permissions inherit karta hai jinmein woh hai.</p>
<ul>
<li>Teen <b>predefined groups</b>: <b>basic</b> (limited, zyadatar read access), <b>operator</b> (intermediate; operational tasks dekh aur chala sakta hai) aur <b>netadmin</b> (poora network administrator). Built-in <b>admin</b> user netadmin mein hai.</li>
<li><b>Custom user groups</b> <b>Administration &gt; Manage Users</b> mein ban sakte hain, har feature area ke liye <b>read</b> aur <b>write</b> permission chunkar, jaise Monitor, Configuration templates, Policy, Software upgrade, Certificates aur Administration. Chapter 3 ka trainee isi se monitoring access paata hai lekin policy activate nahi kar sakta.</li>
<li><b>External authentication</b>: users ko central <b>RADIUS</b> ya <b>TACACS+</b> server authenticate kar sakta hai (sdw-sec module dekho), jo unhe Manager groups se map karta hai, isliye central directory se hatne par leavers ka access khatam ho jaata hai.</li>
<li><b>Account protection</b>: kuch failed logins ya inactivity ki ek period ke baad automatic lockout set karo, automatic ya manual unlock ke saath.</li>
</ul>
<p>Achhi practice: pehle login par default admin password badlo; har insaan ko apna account do; kisne kya kiya dekhne ke liye audit log review karo; <b>automation ke liye dedicated, least-privilege user</b> banao (chapter 4); jo log chhod jaayein unke accounts hatao.</p>
<table class="cmp"><tr><th>Insaan</th><th>Group</th><th>Kyun</th></tr>
<tr><td>NOC trainee</td><td>basic ya custom read-only group</td><td>Dashboards aur alarms dekh sakta hai, kuch badal nahi sakta</td></tr>
<tr><td>NOC engineer</td><td>operator ya custom "NOC-ops" group</td><td>Diagnostics chala sakta hai, alarms acknowledge, real-time tools use</td></tr>
<tr><td>Network designer</td><td>custom "policy-admin" group</td><td>Templates aur policy par write access, user management nahi</td></tr>
<tr><td>Platform owner</td><td>netadmin</td><td>Sab kuch, users aur certificates samet</td></tr>
<tr><td>Reporting script</td><td>custom read-only API group</td><td>Sirf inventory aur statistics padhti hai</td></tr></table>

<h3>Certificates: har device ki identity</h3>
<p>Aap certificates se sdw-ctrl aur sdw-sec modules mein mile the. Operationally teen sawal matter karte hain: <b>kaun issue karta hai, unki state kahan dikhti hai, aur woh kab expire hote hain?</b></p>
<ul>
<li><b>Issuers</b>: <b>Administration &gt; Settings</b> mein set hote hain. Options hain <b>Cisco PKI</b> (Cisco ka recommended tareeka; certificates aapke smart account se automatically issue hote hain), <b>Enterprise Certificate</b> (aapki apni certificate authority se signed) aur <b>Manual</b> method. Cisco batata hai ki release 20.18.1 se virtual devices ke liye Cisco PKI default hai.</li>
<li><b>Kahan dekhein</b>: <b>Configuration &gt; Certificates</b> mein do tabs hain: <b>WAN Edge List</b> (serial numbers, validity state) aur <b>Controllers</b> (release 17.13.1a se Control Components kehlata hai). Har WAN edge <b>Valid</b> (hara, join kar sakta hai), <b>Staging</b> (peela, test ho raha hai) ya <b>Invalid</b> (laal) dikhata hai. <b>Send to Controllers</b> button authorized list ko Controllers aur Validators tak bhejta hai; agar bhool gaye to naye devices authenticate nahi ho paate.</li>
<li><b>CSR aur renewal</b>: har device ke <b>More Actions</b> menu se aap certificate signing request dekh, generate ya renew kar sakte ho. Manager jab WAN edge par naya certificate install karta hai to device pehle use staging step mein test karta hai, taaki kharab certificate device ko kaat na de.</li>
<li><b>Expiry warnings</b>: Manager expiring enterprise certificates ke liye alarms uthata hai aur SNMP traps bhejta hai, tareekh paas aate-aate zyada baar: monthly, phir weekly, phir daily, aur aakhri hafte mein har 12 ghante. Yeh warnings tabhi madad karti hain jab koi unhe receive kare (chapter 3).</li>
</ul>
<pre class="out">E-DEL-1# show sdwan certificate validity
Certificate Valid From : Oct 02 06:00:00 2025 GMT
Certificate Valid To   : <span class="hl">Oct 02 06:00:00 2027 GMT</span>
E-DEL-1# show sdwan control local-properties | include certificate|organization
organization-name            BHARAT-RETAIL
certificate-status           Installed
<span class="hl">certificate-validity         Valid</span></pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Certificate calendar">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="3"/>
<circle cx="60" cy="100" r="8" fill="#bbf7d0"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="12">Issued</text><text x="60" y="146" text-anchor="middle" class="svg-muted" font-size="11">day 0</text>
<circle cx="260" cy="100" r="8" fill="#fde68a"/><text x="260" y="130" text-anchor="middle" class="svg-ink" font-size="12">6 mahine baaki</text><text x="260" y="146" text-anchor="middle" class="svg-muted" font-size="11">monthly warnings</text>
<circle cx="410" cy="100" r="8" fill="#fed7aa"/><text x="410" y="130" text-anchor="middle" class="svg-ink" font-size="12">60 din baaki</text><text x="410" y="146" text-anchor="middle" class="svg-muted" font-size="11">plan aur renew</text>
<circle cx="520" cy="100" r="8" fill="#fed7aa"/><text x="520" y="130" text-anchor="middle" class="svg-ink" font-size="12">7 din baaki</text><text x="520" y="146" text-anchor="middle" class="svg-muted" font-size="11">daily, phir 12 h</text>
<circle cx="595" cy="100" r="8" fill="#fca5a5"/><text x="595" y="130" text-anchor="middle" class="svg-ink" font-size="12">Expiry</text><text x="595" y="146" text-anchor="middle" class="svg-muted" font-size="11">devices gir jaate hain</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">Expiry date se bahut pehle renew karo, usi din nahi</text>
</svg><p class="cap">Expiry paas aate warnings zyada baar aati hain; safe renewal point hafton pehle hai.</p></div>

<h3>Certificate renewal runbook</h3>
<ol>
<li><b>Inventory</b>: controller aur WAN edge certificate expiry dates list karo (Configuration &gt; Certificates, ya API).</li>
<li>Saare devices par <b>clock aur NTP check karo</b>; galat clock expired certificate jaisa dikhta hai.</li>
<li>Manager ka <b>backup lo</b> (chapter 5) aur root certificate aur authorized serial file surakshit rakho.</li>
<li><b>Pehle controllers renew karo</b> (change window mein), control connections verify karo, phir WAN edges waves mein, upgrade ki tarah.</li>
<li>Agar WAN edge list badli to <b>Send to Controllers</b> karo, aur <code>show sdwan control connections</code> se verify karo.</li>
<li>Naye expiry dates runbook calendar mein <b>record</b> karo.</li>
</ol>

<h3>Analytics</h3>
<p><b>Cisco Catalyst SD-WAN Analytics</b> ek cloud service hai jo Manager se data leti hai aur lambe samay ke trends, application aur site analysis aur recommendations jodti hai jo on-premises dashboards mahinon mein nahi dikha sakte. Ise <b>Administration &gt; Settings</b> mein cloud services ke neeche on karte hain (wahi area jahan AI Assistant enable hota hai), aur Manager ko cloud service tak pahunchna padta hai. Incidents (abhi kya galat hai) ke liye Manager dashboards use karo aur planning ke liye Analytics (agli quarter kin sites ko zyada bandwidth chahiye, SLA policy ke baad application performance kaise badli).</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ke controller certificates 2 October 2025 ko issue hue aur do saal ke liye valid hain. Runbook calendar kehta hai: 2 April 2027 (6 mahine pehle) monthly review shuru; 2 August 2027 (60 din pehle) renewal schedule; renewal Saturday 7 August 2027, 01:00 se 03:00 chalega, controllers pehle. Calendar ke bina shared mailbox mein pehli warning email April mein aati aur koi uski zimmedari nahi leta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Team mein admin account share karna. (2) Custom groups "bahut mehnat" samajhkar sab ke liye netadmin use karna. (3) Certificate ko expiry date tak pahunchne dena. (4) Backup ke bina controller certificate renew karna. (5) Send to Controllers se updated list push karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen predefined groups basic, operator aur netadmin hain; custom groups per-feature read ya write dete hain. Certificate options Cisco PKI, Enterprise aur Manual hain. WAN edge states valid, staging aur invalid hain. <b>Send to Controllers</b> authorized list ko synchronise karta hai.</p></div>

<div class="scn"><h4>Sab netadmin the</h4><p>Ek manufacturer ke audit mein 14 netadmin users mile, jinmein teen company chhod chuke the. Ek contractor ke account ne change window ke bahar policy activate ki thi. Company ne authentication TACACS+ par move kiya taaki leavers ka access automatically chala jaaye, "NOC-ops" aur "policy-admin" groups banaye, aur netadmin teen logon ke paas rakha. Agle audit mein koi finding nahi thi.</p><p><b>Lesson:</b> least privilege plus central authentication zyadatar accidents rokta hai.</p></div>

<div class="iv"><p class="q">"Manager mein kaun kya badal sakta hai yeh kaise control karte ho, aur certificate-expiry outage se kaise bachte ho?"</p><p>Main RBAC use karta hoon: predefined basic, operator aur netadmin groups plus per-feature read ya write wale custom groups, central TACACS+ ya RADIUS authentication, lockout settings aur audit-log reviews, aur automation ke liye dedicated least-privilege account. Certificates ke liye main expiry inventory aur calendar rakhta hoon, expiry alarms aur SNMP traps ko monitored channel mein bhejta hoon, hafton pehle backup ke saath renew karta hoon, pehle controllers, phir edges, aur control connections verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RBAC: basic, operator, netadmin aur per-feature read aur write wale custom groups.</li>
<li>Central authentication, lockout aur audit log use karo; default passwords badlo.</li>
<li>Certificates: Cisco PKI, Enterprise ya Manual; Configuration &gt; Certificates state dikhata hai.</li>
<li>Jaldi renew karo, controllers pehle, aur Send to Controllers se list push karo.</li>
<li>Analytics trends aur planning ka cloud view hai; dashboards incidents ke liye.</li>
</ul></div>
`}};export{e as default};