var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now take a Junos device from factory default to a named, secured, consistent device. This chapter is your revision sheet for the JNCIA-Junos (JN0-106) Configuration Basics objectives covered here: initial configuration, user accounts and authentication, interfaces, and configuration groups.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Setup summary">
<rect x="10" y="40" width="190" height="70" rx="8" fill="#fde68a"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">root pw, host-name, mgmt</text>
<rect x="225" y="40" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">Access</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">users, classes, RADIUS</text>
<rect x="440" y="40" width="190" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">Network + standards</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="11">interfaces, groups</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="75" x2="225" y2="75"/><line x1="415" y1="75" x2="440" y2="75"/></g>
</svg><p class="cap">Identity, access, network and standards: the four jobs of initial setup.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why a factory-default device cannot commit and set <code>root-authentication</code>.</li>
<li>Set host name, domain, name server, time zone, banner and management address.</li>
<li>Enable SSH, deny root login, and know which service listens on which port.</li>
<li>Create users in <code>super-user</code>, <code>operator</code>, <code>read-only</code> and custom classes.</li>
<li>Build a custom class with permission flags, <code>allow-commands</code> and <code>deny-commands</code>.</li>
<li>Configure RADIUS or TACACS+ and set <code>authentication-order</code>; explain the local fallback.</li>
<li>Read an interface name and place addresses on unit and family inet.</li>
<li>Create groups with wildcards, apply them and read <code>display inheritance</code>.</li>
<li>Troubleshoot commit errors, login issues, interface state and group inheritance.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Factory-default</dt><dd>The minimal configuration a new or zeroized device boots with.</dd>
<dt>root-authentication</dt><dd>Mandatory statement that sets the root password or key.</dd>
<dt>Login class</dt><dd>Set of permissions and command rules attached to a user.</dd>
<dt>Template user</dt><dd>Local account whose class applies to remotely authenticated users.</dd>
<dt>RADIUS / TACACS+</dt><dd>Central AAA protocols: UDP 1812 and TCP 49.</dd>
<dt>Unit</dt><dd>Logical interface under a physical interface, such as ge-0/0/1.0.</dd>
<dt>Family</dt><dd>Protocol type on a unit: inet, inet6, iso, mpls, ethernet-switching.</dd>
<dt>Configuration group</dt><dd>Reusable block applied with apply-groups; local statements override it.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Mandatory statement for first commit</td><td><code>system root-authentication</code></td></tr>
<tr><td>Predefined login classes</td><td>super-user, operator, read-only, unauthorized</td></tr>
<tr><td>Can operator configure?</td><td>No (no configure permission)</td></tr>
<tr><td>Can read-only ping?</td><td>No (view only)</td></tr>
<tr><td>deny-commands vs permission</td><td>Deny wins</td></tr>
<tr><td>RADIUS transport</td><td>UDP 1812/1813</td></tr>
<tr><td>TACACS+ transport</td><td>TCP 49, full payload encryption</td></tr>
<tr><td>No AAA server answers</td><td>Fallback to local password</td></tr>
<tr><td>Where does an IPv4 address go?</td><td>unit N family inet address</td></tr>
<tr><td>Out-of-band interface names</td><td>fxp0, em0, me0, vme</td></tr>
<tr><td>Group conflicts with local config</td><td>Local configuration wins</td></tr>
<tr><td>Show inherited statements</td><td><code>show | display inheritance</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set system root-authentication plain-text-password
set system host-name NK-PUNE-EDGE
set system services ssh root-login deny
set system login user noc class operator authentication plain-text-password
set system login class HELPDESK permissions [ view network ]
set system login class HELPDESK deny-commands "^traceroute"
set system radius-server 10.99.0.10 secret "key"
set system authentication-order [ radius password ]
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.1/24
set groups GE-STANDARD interfaces &lt;ge-*&gt; mtu 9000
set apply-groups GE-STANDARD
show system alarms | show interfaces terse | show | display inheritance</pre>

<div class="warn"><p><b>Last reminders.</b> Never keep telnet or a shared root account; test every class from the user's point of view; always verify with show commands and a real ping.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> No root password means no commit. Operator cannot configure. Deny beats permit. Wildcards match only existing statements. Local beats group.</p></div>

<div class="scn"><h4>The 15-minute branch</h4><p>NK opened a new branch. The engineer applied a template: root password, host name, SSH, named accounts via RADIUS with a local fallback, the NK-BASE group for banner and MTU, and interface addresses for the LAN. He ran <code>show | display inheritance</code>, pinged the gateway from a test PC, saved the commit comment "branch 18 initial" and handed over to operations. The old process had taken a day.</p><p><b>Lesson:</b> standard building blocks make setup fast and consistent.</p></div>

<div class="iv"><p class="q">"Summarise how you secure a new Junos device."</p><p>I set a strong root password, create named accounts with least-privilege login classes, configure RADIUS or TACACS+ with a local emergency fallback, enable only SSH, deny root login, set a login banner, restrict management to trusted networks, and apply standard groups so every device has the same baseline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Root password first; then identity, access, interfaces and groups.</li>
<li>Classes define least-privilege access; remote AAA centralises accounts with local fallback.</li>
<li>Interfaces: physical properties, unit, family, address.</li>
<li>Groups plus local overrides keep standards and exceptions simple.</li>
<li>Next: the System services module covers syslog, NTP, SNMP and the rescue configuration.</li>
</ul></div>
`,hi:`
<p>Ab aap Junos device ko factory default se named, secured, consistent device tak le ja sakte ho. Yeh chapter JNCIA-Junos (JN0-106) ke Configuration Basics objectives ki revision sheet hai jo yahan cover hue: initial configuration, user accounts aur authentication, interfaces, aur configuration groups.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Setup summary">
<rect x="10" y="40" width="190" height="70" rx="8" fill="#fde68a"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">root pw, host-name, mgmt</text>
<rect x="225" y="40" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">Access</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">users, classes, RADIUS</text>
<rect x="440" y="40" width="190" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">Network + standards</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="11">interfaces, groups</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="75" x2="225" y2="75"/><line x1="415" y1="75" x2="440" y2="75"/></g>
</svg><p class="cap">Identity, access, network aur standards: initial setup ke chaar kaam.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao factory-default device commit kyun nahi kar sakta aur <code>root-authentication</code> set karo.</li>
<li>Host name, domain, name server, time zone, banner aur management address set karo.</li>
<li>SSH enable karo, root login deny karo, aur jaano kaunsi service kaunse port par sunti hai.</li>
<li><code>super-user</code>, <code>operator</code>, <code>read-only</code> aur custom classes mein users banao.</li>
<li>Permission flags, <code>allow-commands</code> aur <code>deny-commands</code> ke saath custom class banao.</li>
<li>RADIUS ya TACACS+ configure karo aur <code>authentication-order</code> set karo; local fallback samjhao.</li>
<li>Interface naam padho aur addresses unit aur family inet par rakho.</li>
<li>Wildcards ke saath groups banao, apply karo aur <code>display inheritance</code> padho.</li>
<li>Commit errors, login issues, interface state aur group inheritance troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Factory-default</dt><dd>Minimal configuration jisse naya ya zeroized device boot hota hai.</dd>
<dt>root-authentication</dt><dd>Mandatory statement jo root password ya key set karta hai.</dd>
<dt>Login class</dt><dd>User se jude permissions aur command rules ka set.</dd>
<dt>Template user</dt><dd>Local account jiski class remotely authenticated users par lagti hai.</dd>
<dt>RADIUS / TACACS+</dt><dd>Central AAA protocols: UDP 1812 aur TCP 49.</dd>
<dt>Unit</dt><dd>Physical interface ke neeche logical interface, jaise ge-0/0/1.0.</dd>
<dt>Family</dt><dd>Unit par protocol type: inet, inet6, iso, mpls, ethernet-switching.</dd>
<dt>Configuration group</dt><dd>apply-groups se lagne wala reusable block; local statements use override karte hain.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Pehle commit ke liye mandatory statement</td><td><code>system root-authentication</code></td></tr>
<tr><td>Predefined login classes</td><td>super-user, operator, read-only, unauthorized</td></tr>
<tr><td>Kya operator configure kar sakta hai?</td><td>Nahi (configure permission nahi)</td></tr>
<tr><td>Kya read-only ping kar sakta hai?</td><td>Nahi (sirf view)</td></tr>
<tr><td>deny-commands vs permission</td><td>Deny jeetta hai</td></tr>
<tr><td>RADIUS transport</td><td>UDP 1812/1813</td></tr>
<tr><td>TACACS+ transport</td><td>TCP 49, poora payload encryption</td></tr>
<tr><td>Koi AAA server jawab na de</td><td>Local password par fallback</td></tr>
<tr><td>IPv4 address kahan jaata hai?</td><td>unit N family inet address</td></tr>
<tr><td>Out-of-band interface naam</td><td>fxp0, em0, me0, vme</td></tr>
<tr><td>Group local config se conflict kare</td><td>Local configuration jeetti hai</td></tr>
<tr><td>Inherited statements dikhana</td><td><code>show | display inheritance</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set system root-authentication plain-text-password
set system host-name NK-PUNE-EDGE
set system services ssh root-login deny
set system login user noc class operator authentication plain-text-password
set system login class HELPDESK permissions [ view network ]
set system login class HELPDESK deny-commands "^traceroute"
set system radius-server 10.99.0.10 secret "key"
set system authentication-order [ radius password ]
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.1/24
set groups GE-STANDARD interfaces &lt;ge-*&gt; mtu 9000
set apply-groups GE-STANDARD
show system alarms | show interfaces terse | show | display inheritance</pre>

<div class="warn"><p><b>Aakhri reminders.</b> Telnet ya shared root account kabhi mat rakho; har class ko user ke nazariye se test karo; hamesha show commands aur real ping se verify karo.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> Root password nahi to commit nahi. Operator configure nahi kar sakta. Deny permit se jeetta hai. Wildcards sirf maujooda statements ko match karte hain. Local group se jeetta hai.</p></div>

<div class="scn"><h4>15 minute ki branch</h4><p>NK ne nayi branch kholi. Engineer ne template apply kiya: root password, host name, SSH, local fallback ke saath RADIUS se named accounts, banner aur MTU ke liye NK-BASE group, aur LAN ke interface addresses. Usne <code>show | display inheritance</code> chalaya, test PC se gateway ping kiya, commit comment "branch 18 initial" likha aur operations ko handover kiya. Purana process ek din leta tha.</p><p><b>Lesson:</b> standard building blocks setup ko tez aur consistent banate hain.</p></div>

<div class="iv"><p class="q">"Naye Junos device ko secure kaise karte ho, summary mein batao."</p><p>Strong root password set karta hoon, least-privilege login classes ke saath named accounts banata hoon, local emergency fallback ke saath RADIUS ya TACACS+ configure karta hoon, sirf SSH enable karta hoon, root login deny karta hoon, login banner lagata hoon, management ko trusted networks tak restrict karta hoon, aur standard groups apply karta hoon taaki har device ki baseline same ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle root password; phir identity, access, interfaces aur groups.</li>
<li>Classes least-privilege access deti hain; remote AAA accounts centralise karta hai local fallback ke saath.</li>
<li>Interfaces: physical properties, unit, family, address.</li>
<li>Groups aur local overrides standards aur exceptions simple rakhte hain.</li>
<li>Aage: System services module syslog, NTP, SNMP aur rescue configuration cover karta hai.</li>
</ul></div>
`}};export{e as default};