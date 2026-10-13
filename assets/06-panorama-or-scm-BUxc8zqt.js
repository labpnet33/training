var e={id:`panorama-or-scm`,h:{en:`Choosing the management path: Panorama or Strata Cloud Manager`,hi:`Management path chunna: Panorama ya Strata Cloud Manager`},body:{en:`
<p>Prisma Access can be managed in two ways. Both end in the same cloud service, but the menus, objects and the way you save changes are different. You must recognise both paths by name, because exam questions and real tickets use either.</p>

<h3>Analogy: two remote controls for one television</h3>
<p>The television is Prisma Access. One remote is <b>Panorama</b> with the <b>Cloud Services plugin</b>, a management server you run yourself (physical or virtual) that is familiar to firewall teams. The other remote is <b>Strata Cloud Manager (SCM)</b>, a cloud-based interface with task-driven workflows and a Command Center dashboard. You pick the remote that suits your team; the television does the same job.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Two management paths to one service">
<rect x="20" y="20" width="200" height="60" rx="8" fill="#bae6fd"/><text x="120" y="46" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text><text x="120" y="64" text-anchor="middle" class="svg-muted" font-size="11">Cloud Services plugin</text>
<rect x="20" y="110" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="120" y="136" text-anchor="middle" class="svg-ink" font-size="13">Strata Cloud Manager</text><text x="120" y="154" text-anchor="middle" class="svg-muted" font-size="11">SCM, in the cloud</text>
<ellipse cx="450" cy="95" rx="120" ry="60" fill="#ddd6fe"/><text x="450" y="92" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="450" y="112" text-anchor="middle" class="svg-muted" font-size="11">same service</text>
<line x1="220" y1="50" x2="345" y2="80" stroke="#64748b"/><line x1="220" y1="140" x2="345" y2="110" stroke="#64748b"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Logs from both go to the Strata Logging Service</text>
</svg><p class="cap">Two management paths, one service, one log store.</p></div>

<h3>Panorama with the Cloud Services plugin</h3>
<p>Here an on-premises or virtual Panorama manages Prisma Access through the plugin. Key facts:</p>
<ul>
<li>Panorama needs <b>active internet connectivity</b> to the cloud service. The documentation warns that without it, the service can fail.</li>
<li>The plugin creates three templates: <code>Mobile_User_Template</code>, <code>Remote_Network_Template</code> and <code>Service_Conn_Template</code>.</li>
<li>Rules live in device groups. Names seen in the documentation include <code>Remote_Network_Device_Group</code> and the device groups called <b>GlobalProtect</b> and <b>Explicit Proxy</b> in the push dialog.</li>
<li>The menu is <code>Panorama &gt; Cloud Services</code>, with <b>Configuration</b> (Service Setup, Mobile Users - GlobalProtect, Mobile Users - Explicit Proxy, Remote Networks, Service Connection) and <b>Status</b> (Status, Monitor, Network Details).</li>
<li>Changes are applied with <i>Commit to Panorama</i> followed by <i>Commit and Push</i>.</li>
</ul>
<p>For Prisma Access release 6.2 the documentation names plugin version 6.1.</p>

<h3>Strata Cloud Manager</h3>
<ul>
<li>Cloud-based, with task-driven workflows and a Command Center.</li>
<li>Menu: <code>Configuration &gt; NGFW and Prisma Access</code>, with a <b>Configuration Scope</b> selector (global, a folder, or Prisma Access). Under Prisma Access you find Infrastructure Settings, Mobile Users, Remote Networks and Service Connections. Teach it as "Configuration"; some older material says "Manage".</li>
<li>Configuration is organised in <b>folders</b>. Settings in a parent folder inherit to children. The predefined Prisma Access folders (mobile users, remote networks, service connections) cannot be edited.</li>
<li>Changes are applied with <code>Configuration &gt; Operations &gt; Push Config</code>.</li>
</ul>
<table class="cmp"><tr><th>Question</th><th>Panorama + plugin</th><th>Strata Cloud Manager</th></tr>
<tr><td>Where does it run?</td><td>Your server (physical or virtual)</td><td>Cloud service</td></tr>
<tr><td>Best fit</td><td>Teams already using Panorama and common policy</td><td>Fast onboarding with built-in best practice policy</td></tr>
<tr><td>Containers for rules</td><td>Templates and device groups</td><td>Folders and snippets</td></tr>
<tr><td>Save and apply</td><td>Commit to Panorama, then Commit and Push</td><td>Push Config</td></tr>
<tr><td>Status view</td><td>Panorama &gt; Cloud Services &gt; Status</td><td>Sync Status and Activity Insights</td></tr>
</table>

<h3>How to choose</h3>
<p>Ask three questions. Does the team already run Panorama and want one policy for firewalls and Prisma Access? Then Panorama fits. Does the team want the quickest start and built-in best practices? Then SCM fits. Do you need a feature that exists in only one path? The documentation says features differ and provides a compatibility matrix, so check it before deciding.</p>
<div class="warn"><p><b>Migration is one way.</b> The documentation describes migration from Panorama to SCM only. Once completed it is irreversible. Some items are not supported in migration, including Data Filtering, FedRAMP, IoT Security, multitenant and SSH Proxy. You will study this in the operations module.</p></div>

<div class="eg"><p><b>Worked example.</b> Company A has 30 on-premises firewalls, a Panorama and a team trained on device groups. They choose Panorama with the plugin and reuse their shared objects. Company B is a 200-person firm with no Panorama and two engineers. They choose SCM, accept the default best practice rules, and onboard the first branch the same afternoon. Both reach the same Prisma Access service.</p></div>

<div class="exam"><p><b>Exam trap.</b> The three template names are exact: Mobile_User_Template, Remote_Network_Template and Service_Conn_Template. Do not call the SCM equivalent "templates"; SCM uses folders.</p></div>

<div class="scn"><h4>The team that picked by habit</h4><p>A firewall team with a large Panorama estate chose SCM "because it is newer", then spent weeks rebuilding shared objects and found a feature they relied on behaved differently. They had skipped the compatibility check. They paused, compared the matrix, and kept production on the path that matched their operating model.</p><p><b>Lesson:</b> pick the path from your team, your features and your policy model, not from fashion.</p></div>

<div class="iv"><p class="q">"Panorama or Strata Cloud Manager for a new Prisma Access customer?"</p><p>Strong answer: it depends. Panorama with the Cloud Services plugin suits teams that already run Panorama and want common policy; it needs internet access to the service. SCM suits fast onboarding with built-in best practice policy and cloud management. Check the feature compatibility matrix, and mention that migration is Panorama to SCM only and irreversible.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two paths: Panorama with the Cloud Services plugin, or Strata Cloud Manager.</li>
<li>Panorama creates Mobile_User_Template, Remote_Network_Template and Service_Conn_Template.</li>
<li>SCM uses folders and Configuration &gt; NGFW and Prisma Access.</li>
<li>Apply changes with Commit and Push (Panorama) or Push Config (SCM).</li>
<li>Migration is Panorama to SCM, one-way, with unsupported items.</li>
</ul></div>
`,hi:`
<p>Prisma Access ko do tareeke se manage kiya ja sakta hai. Dono ek hi cloud service par pahunchte hain, lekin menus, objects aur changes save karne ka tareeka alag hai. Aapko dono paths naam se pehchaanne honge, kyunki exam questions aur real tickets dono mein aate hain.</p>

<h3>Analogy: ek television ke do remote</h3>
<p>Television Prisma Access hai. Ek remote <b>Panorama</b> hai jo <b>Cloud Services plugin</b> ke saath aata hai, ek management server jo aap khud chalate ho (physical ya virtual) aur firewall teams ko familiar hai. Doosra remote <b>Strata Cloud Manager (SCM)</b> hai, ek cloud-based interface jismein task-driven workflows aur Command Center dashboard hai. Aap woh remote chunte ho jo aapki team ko suit kare; television wahi kaam karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ek service tak do management paths">
<rect x="20" y="20" width="200" height="60" rx="8" fill="#bae6fd"/><text x="120" y="46" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text><text x="120" y="64" text-anchor="middle" class="svg-muted" font-size="11">Cloud Services plugin</text>
<rect x="20" y="110" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="120" y="136" text-anchor="middle" class="svg-ink" font-size="13">Strata Cloud Manager</text><text x="120" y="154" text-anchor="middle" class="svg-muted" font-size="11">SCM, cloud mein</text>
<ellipse cx="450" cy="95" rx="120" ry="60" fill="#ddd6fe"/><text x="450" y="92" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="450" y="112" text-anchor="middle" class="svg-muted" font-size="11">wahi service</text>
<line x1="220" y1="50" x2="345" y2="80" stroke="#64748b"/><line x1="220" y1="140" x2="345" y2="110" stroke="#64748b"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Dono ke logs Strata Logging Service mein jaate hain</text>
</svg><p class="cap">Do management paths, ek service, ek log store.</p></div>

<h3>Panorama with Cloud Services plugin</h3>
<p>Yahan on-premises ya virtual Panorama plugin ke through Prisma Access manage karta hai. Key facts:</p>
<ul>
<li>Panorama ko cloud service tak <b>active internet connectivity</b> chahiye. Documentation warn karti hai ki iske bina service fail ho sakti hai.</li>
<li>Plugin teen templates banata hai: <code>Mobile_User_Template</code>, <code>Remote_Network_Template</code> aur <code>Service_Conn_Template</code>.</li>
<li>Rules device groups mein rehte hain. Documentation mein dikhe naam: <code>Remote_Network_Device_Group</code> aur push dialog mein <b>GlobalProtect</b> aur <b>Explicit Proxy</b> naam ke device groups.</li>
<li>Menu <code>Panorama &gt; Cloud Services</code> hai, jismein <b>Configuration</b> (Service Setup, Mobile Users - GlobalProtect, Mobile Users - Explicit Proxy, Remote Networks, Service Connection) aur <b>Status</b> (Status, Monitor, Network Details) hain.</li>
<li>Changes <i>Commit to Panorama</i> ke baad <i>Commit and Push</i> se apply hote hain.</li>
</ul>
<p>Prisma Access release 6.2 ke liye documentation plugin version 6.1 batati hai.</p>

<h3>Strata Cloud Manager</h3>
<ul>
<li>Cloud-based, task-driven workflows aur Command Center ke saath.</li>
<li>Menu: <code>Configuration &gt; NGFW and Prisma Access</code>, jismein <b>Configuration Scope</b> selector hai (global, ek folder, ya Prisma Access). Prisma Access ke neeche Infrastructure Settings, Mobile Users, Remote Networks aur Service Connections milte hain. Ise "Configuration" ke naam se padhao; kuch purane material mein "Manage" likha hota hai.</li>
<li>Configuration <b>folders</b> mein organised hoti hai. Parent folder ki settings children ko inherit hoti hain. Predefined Prisma Access folders (mobile users, remote networks, service connections) edit nahi ho sakte.</li>
<li>Changes <code>Configuration &gt; Operations &gt; Push Config</code> se apply hote hain.</li>
</ul>
<table class="cmp"><tr><th>Sawaal</th><th>Panorama + plugin</th><th>Strata Cloud Manager</th></tr>
<tr><td>Kahan chalta hai?</td><td>Aapka server (physical ya virtual)</td><td>Cloud service</td></tr>
<tr><td>Best fit</td><td>Jo teams pehle se Panorama aur common policy use karti hain</td><td>Built-in best practice policy ke saath tez onboarding</td></tr>
<tr><td>Rules ke containers</td><td>Templates aur device groups</td><td>Folders aur snippets</td></tr>
<tr><td>Save aur apply</td><td>Commit to Panorama, phir Commit and Push</td><td>Push Config</td></tr>
<tr><td>Status view</td><td>Panorama &gt; Cloud Services &gt; Status</td><td>Sync Status aur Activity Insights</td></tr>
</table>

<h3>Kaise choose karein</h3>
<p>Teen sawaal poochho. Kya team pehle se Panorama chalati hai aur firewalls aur Prisma Access ke liye ek policy chahti hai? To Panorama fit hai. Kya team sabse tez start aur built-in best practices chahti hai? To SCM fit hai. Kya koi feature sirf ek path mein hai? Documentation kehti hai features alag hain aur compatibility matrix deti hai, isliye decide karne se pehle check karo.</p>
<div class="warn"><p><b>Migration one way hai.</b> Documentation sirf Panorama se SCM migration describe karti hai. Complete hone ke baad irreversible hai. Migration mein kuch items supported nahi hain, jaise Data Filtering, FedRAMP, IoT Security, multitenant aur SSH Proxy. Operations module mein ise padhoge.</p></div>

<div class="eg"><p><b>Worked example.</b> Company A ke paas 30 on-premises firewalls, ek Panorama aur device groups mein trained team hai. Woh plugin ke saath Panorama chunte hain aur shared objects reuse karte hain. Company B 200 logon ki firm hai, Panorama nahi hai aur do engineers hain. Woh SCM chunte hain, default best practice rules accept karte hain, aur pehli branch usi dopahar onboard kar dete hain. Dono ek hi Prisma Access service tak pahunchte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen template names exact hain: Mobile_User_Template, Remote_Network_Template aur Service_Conn_Template. SCM ke equivalent ko "templates" mat bolo; SCM folders use karta hai.</p></div>

<div class="scn"><h4>Jis team ne aadat se path chuna</h4><p>Bade Panorama estate wali firewall team ne "naya hai" kehkar SCM chun liya, phir shared objects rebuild karne mein hafte lagaye aur dekha ki jis feature par woh depend thi woh alag behave karta hai. Unhone compatibility check skip kiya tha. Unhone ruk kar matrix compare ki, aur production ko us path par rakha jo unke operating model se match karta tha.</p><p><b>Seekh:</b> path apni team, features aur policy model ke hisaab se chuno, fashion se nahi.</p></div>

<div class="iv"><p class="q">"Naye Prisma Access customer ke liye Panorama ya Strata Cloud Manager?"</p><p>Strong answer: depend karta hai. Cloud Services plugin ke saath Panorama un teams ko suit karta hai jo pehle se Panorama chalati hain aur common policy chahti hain; ise service tak internet access chahiye. SCM built-in best practice policy aur cloud management ke saath tez onboarding ke liye suit karta hai. Feature compatibility matrix check karo, aur bolo ki migration sirf Panorama se SCM hoti hai aur irreversible hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do paths: Cloud Services plugin ke saath Panorama, ya Strata Cloud Manager.</li>
<li>Panorama Mobile_User_Template, Remote_Network_Template aur Service_Conn_Template banata hai.</li>
<li>SCM folders aur Configuration &gt; NGFW and Prisma Access use karta hai.</li>
<li>Changes Commit and Push (Panorama) ya Push Config (SCM) se apply karo.</li>
<li>Migration Panorama se SCM, one-way, kuch unsupported items ke saath.</li>
</ul></div>
`}};export{e as default};