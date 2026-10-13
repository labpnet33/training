var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now know how Panorama manages firewalls at scale. Use this page to check yourself before an exam or interview.</p>
<div class="note"><p><b>Note.</b> Panorama has no simulator lab yet. Practise policy and NAT basics in pan-setup and pan-nat, routing in pan-routing, and related central-management ideas in nse4-dynamic. Everything here is reference reading.</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The Panorama life cycle from a new firewall to a monitored, in-sync estate."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Onboard</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Template stack</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Device group</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Commit + push</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Monitor</text></svg><p class="cap">The Panorama life cycle from a new firewall to a monitored, in-sync estate.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Explain what Panorama does and how it differs from a firewall's local management.</li>
<li>Onboard a firewall: serial, Panorama server address, TCP 3978, assignment.</li>
<li>Build a template stack with base and regional templates and use variables.</li>
<li>Design a device group hierarchy with Shared, parent and child groups.</li>
<li>State the rule evaluation order including pre-rules, local rules and post-rules.</li>
<li>Run the commit and push workflow with preview, validation and scoped push.</li>
<li>Set up least-privilege admin roles with access domains, MFA and audit comments.</li>
<li>Configure log forwarding and explain Log Collectors and collector groups.</li>
<li>Troubleshoot connection, commit and push problems in order.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>Network and Device settings pushed to firewalls.</dd>
<dt>Template stack</dt><dd>Ordered group of templates assigned to firewalls; top wins.</dd>
<dt>Device group</dt><dd>Policies and objects shared by a set of firewalls.</dd>
<dt>Shared</dt><dd>Top level whose objects and rules every device group inherits.</dd>
<dt>Pre-rule / post-rule</dt><dd>Rules from Panorama evaluated before or after local rules.</dd>
<dt>Log Collector</dt><dd>System that stores and indexes logs from firewalls.</dd>
<dt>Access domain</dt><dd>Scope limiting an administrator to chosen device groups and templates.</dd>
</dl>
<h3>Most tested facts</h3>
<ul>
<li>Templates hold Network and Device settings; device groups hold policies and objects.</li>
<li>A stack holds up to sixteen templates; the topmost template wins conflicts.</li>
<li>Order: shared pre, device group pre, local, device group post, shared post, defaults.</li>
<li>Commit to Panorama is not a push; push sends to the devices.</li>
<li>The firewall connects to Panorama on TCP 3978.</li>
<li>Force Template Values overrides local settings.</li>
<li>Panorama must run the same or a newer PAN-OS than the firewalls it manages.</li>
</ul>
<h3>Command cheat-sheet</h3>
<pre class="code">set deviceconfig system panorama-server 192.0.2.50
show panorama-status
show config pushed-template
show config pushed-shared-policy
show devices connected
show jobs all</pre>
<p>The first three run on the firewall; show devices connected and show jobs all run on Panorama (show jobs all also works on a firewall).</p>
<div class="exam"><p><b>Exam trap.</b> When asked where a setting lives, ask: is it how the firewall is built (template) or what it allows (device group)?</p></div>
<div class="scn"><h4>The audit that passed</h4><p>During a security audit, the team showed how every firewall change was made: named admins with MFA, an access domain per region, audit comments with ticket numbers, a preview before each push and a config audit between versions. The auditor had no findings on change control.</p><p><b>Lesson:</b> Panorama is as much a control and evidence tool as a convenience.</p></div>
<div class="iv"><p class="q">"Walk me through setting up Panorama for 30 branch firewalls."</p><p>Create the template stack with base device and network templates plus regional layers and variables, build the device group tree with Shared, parent and child, onboard firewalls with serials over TCP 3978, assign them, set least-privilege roles with MFA, configure log forwarding and collectors, and push a pilot first before the rest, with preview and audit comments.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Template for how the firewall is built; device group for what it allows.</li><li>Know the rule order and the two-stage commit and push.</li><li>Control access with roles, access domains, MFA and audit comments.</li><li>Forward logs from every rule and monitor sync state.</li><li>Troubleshoot connection first, then validation, then job details.</li></ul></div>
`,hi:`
<p>Ab aap jaante ho ki Panorama firewalls ko scale par kaise manage karta hai. Exam ya interview se pehle khud ko check karne ke liye yeh page use karo.</p>
<div class="note"><p><b>Note.</b> Panorama ka abhi simulator lab nahi hai. Policy aur NAT basics pan-setup aur pan-nat mein, routing pan-routing mein, aur related central-management ideas nse4-dynamic mein practise karo. Yahan sab kuch reference reading hai.</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Naye firewall se monitored, in-sync estate tak Panorama ka life cycle."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Onboard</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Template stack</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Device group</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Commit + push</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Monitor</text></svg><p class="cap">Naye firewall se monitored, in-sync estate tak Panorama ka life cycle.</p></div>
<h3>Can-do checklist</h3>
<ul>
<li>Samjhao Panorama kya karta hai aur firewall ke local management se kaise alag hai.</li>
<li>Firewall onboard karo: serial, Panorama server address, TCP 3978, assignment.</li>
<li>Base aur regional templates ke saath template stack banao aur variables use karo.</li>
<li>Shared, parent aur child groups ke saath device group hierarchy design karo.</li>
<li>Pre-rules, local rules aur post-rules ke saath rule evaluation order batao.</li>
<li>Preview, validation aur scoped push ke saath commit aur push workflow chalao.</li>
<li>Access domains, MFA aur audit comments ke saath least-privilege admin roles set karo.</li>
<li>Log forwarding configure karo aur Log Collectors aur collector groups samjhao.</li>
<li>Connection, commit aur push problems kram se troubleshoot karo.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>Firewalls par push hone wali Network aur Device settings.</dd>
<dt>Template stack</dt><dd>Firewalls ko assign hua templates ka ordered group; top jeetta hai.</dd>
<dt>Device group</dt><dd>Firewalls ke set ke shared policies aur objects.</dd>
<dt>Shared</dt><dd>Top level jiske objects aur rules har device group inherit karta hai.</dd>
<dt>Pre-rule / post-rule</dt><dd>Panorama ki rules jo local rules se pehle ya baad evaluate hoti hain.</dd>
<dt>Log Collector</dt><dd>System jo firewalls ke logs store aur index karta hai.</dd>
<dt>Access domain</dt><dd>Scope jo administrator ko chune hue device groups aur templates tak limit karta hai.</dd>
</dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Templates Network aur Device settings rakhte hain; device groups policies aur objects.</li>
<li>Stack mein solah tak templates; sabse upar wala conflict jeetta hai.</li>
<li>Order: shared pre, device group pre, local, device group post, shared post, defaults.</li>
<li>Commit to Panorama push nahi hai; push devices ko bhejta hai.</li>
<li>Firewall Panorama se TCP 3978 par connect hota hai.</li>
<li>Force Template Values local settings override karta hai.</li>
<li>Panorama ko managed firewalls ke barabar ya naye PAN-OS par chalna chahiye.</li>
</ul>
<h3>Command cheat-sheet</h3>
<pre class="code">set deviceconfig system panorama-server 192.0.2.50
show panorama-status
show config pushed-template
show config pushed-shared-policy
show devices connected
show jobs all</pre>
<p>Pehle teen firewall par chalte hain; show devices connected aur show jobs all Panorama par chalte hain (show jobs all firewall par bhi chalta hai).</p>
<div class="exam"><p><b>Exam trap.</b> Setting kahan rehti hai poochha jaaye to socho: yeh firewall kaise bana hai (template) ya woh kya allow karta hai (device group)?</p></div>
<div class="scn"><h4>Audit jo pass hua</h4><p>Security audit ke dauran team ne dikhaya ki har firewall change kaise hua: MFA wale named admins, har region ke liye access domain, ticket numbers wale audit comments, har push se pehle preview aur versions ke beech config audit. Auditor ko change control par koi finding nahi mili.</p><p><b>Lesson:</b> Panorama convenience se zyada control aur evidence tool hai.</p></div>
<div class="iv"><p class="q">"30 branch firewalls ke liye Panorama setup kaise karoge?"</p><p>Base device aur network templates plus regional layers aur variables ke saath template stack banao, Shared, parent aur child ke saath device group tree banao, serials se TCP 3978 par firewalls onboard karo, assign karo, MFA ke saath least-privilege roles set karo, log forwarding aur collectors configure karo, aur baaki se pehle pilot push karo, preview aur audit comments ke saath.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Firewall kaise bana ke liye template; woh kya allow karta hai ke liye device group.</li><li>Rule order aur do-stage commit aur push jaano.</li><li>Roles, access domains, MFA aur audit comments se access control karo.</li><li>Har rule se logs forward karo aur sync state monitor karo.</li><li>Pehle connection, phir validation, phir job details troubleshoot karo.</li></ul></div>
`}};export{e as default};