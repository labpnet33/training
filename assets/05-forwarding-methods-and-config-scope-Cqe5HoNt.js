var e={id:`forwarding-methods-and-config-scope`,h:{en:`Forwarding methods and where each setting lives`,hi:`Forwarding methods aur har setting kahan rehti hai`},body:{en:`
<p>A company can send its mail by courier, by post or by hand delivery. The letter is the same; the delivery method differs and each needs its own address book. Logs are similar. A firewall can send logs to Panorama, to a syslog server, by email and, in real PAN-OS, to other destinations such as SNMP receivers or HTTP servers. Which ones exist and which log types they support depend on the version, so check the documentation for your PAN-OS version. This course focuses on the two that matter most: <b>Panorama</b> and <b>syslog</b>.</p>

<h3>The common destinations</h3>
<table class="tbl"><tr><th>Destination</th><th>Best for</th><th>Needs</th></tr>
<tr><td>Panorama</td><td>Central search, reports, one place for all firewalls</td><td>Managed connection and a collector</td></tr>
<tr><td>Syslog</td><td>SIEM, long-term archive, other tools</td><td>A syslog server profile (address, transport, port, format)</td></tr>
<tr><td>Email</td><td>A few critical events for people</td><td>An email server profile; keep it rare, mail is not a log store</td></tr>
<tr><td>Others (SNMP, HTTP)</td><td>Special integrations</td><td>Their own server profiles; check the documentation for your PAN-OS version</td></tr>
</table>

<h3>Two kinds of objects</h3>
<p>This is the point many learners miss. Forwarding uses two different objects, and they are configured in different places on Panorama.</p>
<div class="dia"><svg viewBox="0 0 680 190" role="img" aria-label="Where objects live">
<rect x="10" y="20" width="310" height="150" rx="10" fill="#fed7aa"/><text x="165" y="48" text-anchor="middle" class="svg-ink" font-size="14">Log forwarding profile</text>
<text x="165" y="78" text-anchor="middle" class="svg-ink" font-size="12">match lists, filters</text><text x="165" y="100" text-anchor="middle" class="svg-ink" font-size="12">lives in shared log settings</text><text x="165" y="128" text-anchor="middle" class="svg-ink" font-size="12">pushed with the device group</text><text x="165" y="150" text-anchor="middle" class="svg-ink" font-size="12">(policy side)</text>
<rect x="360" y="20" width="310" height="150" rx="10" fill="#bae6fd"/><text x="515" y="48" text-anchor="middle" class="svg-ink" font-size="14">Syslog server profile</text>
<text x="515" y="78" text-anchor="middle" class="svg-ink" font-size="12">server address, transport, port, format</text><text x="515" y="100" text-anchor="middle" class="svg-ink" font-size="12">lives in a template</text><text x="515" y="128" text-anchor="middle" class="svg-ink" font-size="12">pushed with the template stack</text><text x="515" y="150" text-anchor="middle" class="svg-ink" font-size="12">(device side)</text>
</svg><p class="cap">The profile says which logs go to which named destination. The server profile says where that destination actually is.</p></div>
<p>The reason is the same split you learned earlier. A <b>device group</b> carries policy and objects, and logging choices (what to forward) are policy. A <b>template</b> carries device settings such as interfaces and server addresses, and a syslog server's address is a device setting. The forwarding profile only <i>names</i> the syslog server profile (<code>send-syslog NK-SYSLOG</code>). The name is resolved on the firewall, so the firewall must have received <b>both</b>: the device group push and the template push.</p>

<h3>The lab syntax</h3>
<pre class="code">set template NK-LOGS config shared server-profile syslog NK-SYSLOG server SIEM server 192.0.2.60 transport UDP port 514 format BSD facility LOG_USER
commit-all template-stack name NK-STACK</pre>
<p>The syslog profile is created in the template, then the stack that contains this template is pushed. The profile in the device group then refers to NK-SYSLOG by name. If the name does not exist on the firewall, there is nothing to deliver to. In the simulator, the forwarded-to-syslog counter counts only forwards to a profile that exists, in a template or locally. Real delivery to a syslog host is not simulated.</p>

<h3>Order of work</h3>
<ol>
<li>Create the syslog server profile in the template.</li>
<li>Add that template to the right stack and commit to Panorama.</li>
<li>Create or update the forwarding profile with the match lists.</li>
<li>Attach the profile to the rules.</li>
<li>Commit, then push the template stack and the device group.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Creating the syslog server profile in the wrong place; pushing the device group but not the template; renaming the server profile in one place only; email forwarding for high volume logs.</p></div>

<div class="scn"><h4>Half a push</h4><p>A team built the DENY match list and pushed the device group, then went home. The syslog server profile existed in a template that had been committed but never pushed to the Delhi firewall. Delhi forwarded to Panorama normally but its denies never reached the SIEM. The sync column showed Delhi template Out of Sync the whole time.</p><p><b>Lesson:</b> a logging change that spans a template and a device group needs both pushes.</p></div>

<div class="iv"><p class="q">"Where do you create a syslog server profile and a log forwarding profile when using Panorama, and why?"</p><p>The syslog server profile is a device setting, so it goes in a template and is pushed with the stack. The log forwarding profile is a policy-side object, so it lives in shared log settings or a device group and is pushed with the device group. The forwarding profile refers to the server profile by name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Destinations include Panorama, syslog, email and others; check the documentation for your PAN-OS version.</li>
<li>Forwarding profile = policy side (device group); server profile = device side (template).</li>
<li>The profile names the server profile; the firewall needs both pushes.</li>
<li>Use email only for rare, critical events.</li>
</ul></div>
`,hi:`
<p>Company apni mail courier se, post se ya haath se bhej sakti hai. Chitthi wahi rehti hai; delivery method alag hota hai aur har ek ko apni address book chahiye. Logs bhi aise hi hain. Firewall logs Panorama ko, syslog server ko, email se aur real PAN-OS mein SNMP receivers ya HTTP servers jaisi doosri jagahon par bhej sakta hai. Kaun se options hain aur kaunse log types support hote hain ye version par depend karta hai, isliye apne PAN-OS version ki documentation check karo. Ye course do par focus karta hai jo sabse zyada matter karte hain: <b>Panorama</b> aur <b>syslog</b>.</p>

<h3>Common destinations</h3>
<table class="tbl"><tr><th>Destination</th><th>Kis ke liye best</th><th>Kya chahiye</th></tr>
<tr><td>Panorama</td><td>Central search, reports, sab firewalls ke liye ek jagah</td><td>Managed connection aur collector</td></tr>
<tr><td>Syslog</td><td>SIEM, long-term archive, doosre tools</td><td>Syslog server profile (address, transport, port, format)</td></tr>
<tr><td>Email</td><td>Logon ke liye kuch critical events</td><td>Email server profile; kam rakho, mail log store nahi hai</td></tr>
<tr><td>Others (SNMP, HTTP)</td><td>Special integrations</td><td>Unke apne server profiles; apne PAN-OS version ki documentation check karo</td></tr>
</table>

<h3>Do tarah ke objects</h3>
<p>Ye wo point hai jo bahut learners miss karte hain. Forwarding do alag objects use karti hai, aur Panorama par ye alag jagah configure hote hain.</p>
<div class="dia"><svg viewBox="0 0 680 190" role="img" aria-label="Where objects live">
<rect x="10" y="20" width="310" height="150" rx="10" fill="#fed7aa"/><text x="165" y="48" text-anchor="middle" class="svg-ink" font-size="14">Log forwarding profile</text>
<text x="165" y="78" text-anchor="middle" class="svg-ink" font-size="12">match lists, filters</text><text x="165" y="100" text-anchor="middle" class="svg-ink" font-size="12">shared log settings mein rehta hai</text><text x="165" y="128" text-anchor="middle" class="svg-ink" font-size="12">device group ke saath push hota hai</text><text x="165" y="150" text-anchor="middle" class="svg-ink" font-size="12">(policy side)</text>
<rect x="360" y="20" width="310" height="150" rx="10" fill="#bae6fd"/><text x="515" y="48" text-anchor="middle" class="svg-ink" font-size="14">Syslog server profile</text>
<text x="515" y="78" text-anchor="middle" class="svg-ink" font-size="12">server address, transport, port, format</text><text x="515" y="100" text-anchor="middle" class="svg-ink" font-size="12">template mein rehta hai</text><text x="515" y="128" text-anchor="middle" class="svg-ink" font-size="12">template stack ke saath push hota hai</text><text x="515" y="150" text-anchor="middle" class="svg-ink" font-size="12">(device side)</text>
</svg><p class="cap">Profile batata hai kaunse logs kis naam wale destination par jayenge. Server profile batata hai wo destination asal mein kahan hai.</p></div>
<p>Wajah wahi split hai jo aapne pehle seekha. <b>Device group</b> policy aur objects carry karta hai, aur logging choices (kya forward karna hai) policy hain. <b>Template</b> interfaces aur server addresses jaisi device settings carry karta hai, aur syslog server ka address ek device setting hai. Forwarding profile syslog server profile ka sirf <i>naam</i> leta hai (<code>send-syslog NK-SYSLOG</code>). Naam firewall par resolve hota hai, isliye firewall ko <b>dono</b> milne chahiye: device group push aur template push.</p>

<h3>Lab syntax</h3>
<pre class="code">set template NK-LOGS config shared server-profile syslog NK-SYSLOG server SIEM server 192.0.2.60 transport UDP port 514 format BSD facility LOG_USER
commit-all template-stack name NK-STACK</pre>
<p>Syslog profile template mein banta hai, phir jis stack mein ye template hai use push karte hain. Device group wala profile phir NK-SYSLOG ko naam se refer karta hai. Firewall par naam exist na kare to deliver karne ko kuch nahi. Simulator mein forwarded-to-syslog counter sirf us profile ke forwards ginta hai jo exist karta ho, template mein ya locally. Real syslog host tak delivery simulate nahi hoti.</p>

<h3>Kaam ka order</h3>
<ol>
<li>Template mein syslog server profile banao.</li>
<li>Wo template sahi stack mein daalo aur Panorama par commit karo.</li>
<li>Forwarding profile banao ya update karo, match lists ke saath.</li>
<li>Profile ko rules par attach karo.</li>
<li>Commit karo, phir template stack aur device group push karo.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Syslog server profile galat jagah banana; device group push karna lekin template nahi; server profile ka naam ek hi jagah badalna; zyada volume ke logs ke liye email forwarding.</p></div>

<div class="scn"><h4>Aadha push</h4><p>Ek team ne DENY match list banayi aur device group push karke ghar chali gayi. Syslog server profile us template mein tha jo commit hua tha lekin Delhi firewall par kabhi push nahi hua. Delhi Panorama ko normally forward karta raha lekin uske denies SIEM tak nahi pahunche. Sync column mein Delhi ka template poore waqt Out of Sync dikh raha tha.</p><p><b>Lesson:</b> jo logging change template aur device group dono mein hai usse dono push chahiye.</p></div>

<div class="iv"><p class="q">"Panorama use karte waqt syslog server profile aur log forwarding profile kahan banate ho, aur kyun?"</p><p>Syslog server profile device setting hai, isliye template mein jata hai aur stack ke saath push hota hai. Log forwarding profile policy-side object hai, isliye shared log settings ya device group mein rehta hai aur device group ke saath push hota hai. Forwarding profile server profile ko naam se refer karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Destinations mein Panorama, syslog, email aur doosre hain; apne PAN-OS version ki documentation check karo.</li>
<li>Forwarding profile = policy side (device group); server profile = device side (template).</li>
<li>Profile server profile ka naam leta hai; firewall ko dono push chahiye.</li>
<li>Email sirf rare, critical events ke liye.</li>
</ul></div>
`}};export{e as default};