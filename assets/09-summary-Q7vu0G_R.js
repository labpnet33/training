var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now decide who may use an EX access port, how they prove it, where they land, and what happens when something fails. This is your final review for JN0-650 and for interviews.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Name the three 802.1X roles and what each protocol carries (EAPOL, RADIUS).</li>
<li>Configure radius-server, an access profile and the authenticator ports, with a dynamic VLAN.</li>
<li>Enable MAC RADIUS (and know restrict) and explain the user name used.</li>
<li>Configure a captive portal and explain the order 802.1X, MAC RADIUS, portal.</li>
<li>Choose guest-vlan, server-reject-vlan and a server-fail action for each port type.</li>
<li>Pick single, single-secure or multiple, and tune the timers.</li>
<li>Troubleshoot with held reason, aaa statistics and the server log.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Supplicant / authenticator</dt><dd>client / switch port that relays.</dd>
<dt>EAPOL</dt><dd>EAP over LAN, EtherType 0x888E.</dd>
<dt>NAS</dt><dd>network access server: the switch, from RADIUS's point of view.</dd>
<dt>Shared secret</dt><dd>password between switch and RADIUS server.</dd>
<dt>MAC RADIUS</dt><dd>authentication by MAC address sent as user name and password.</dd>
<dt>Captive portal</dt><dd>web login on the switch, checked by RADIUS.</dd>
<dt>Server-fail</dt><dd>action when RADIUS does not answer.</dd>
<dt>Held</dt><dd>state of a host that failed and waits out the quiet period.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Before authorisation the port passes</td><td>only EAPOL</td></tr>
<tr><td>RADIUS ports</td><td>UDP 1812 (auth), 1813 (accounting)</td></tr>
<tr><td>Wrong secret gives</td><td>timeout (server ignores)</td></tr>
<tr><td>Wrong password gives</td><td>Access-Reject</td></tr>
<tr><td>Method order</td><td>802.1X, MAC RADIUS, captive portal; guest VLAN as last resort</td></tr>
<tr><td>MAC RADIUS user name</td><td>12 hex digits, no separators; same as password</td></tr>
<tr><td>Default server-fail</td><td>deny</td></tr>
<tr><td>Timers</td><td>transmit 30 s, max-requests 2, quiet 60 s, reauth 3600 s</td></tr>
<tr><td>VLAN attributes</td><td>Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-ID</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">set access radius-server 172.20.50.10 secret "CHANGE-ME-LAB-ONLY"
set access profile NK-DOT1X authentication-order radius
set access profile NK-DOT1X radius authentication-server 172.20.50.10
set protocols dot1x authenticator authentication-profile-name NK-DOT1X
set protocols dot1x authenticator interface ge-0/0/1 supplicant single-secure
set protocols dot1x authenticator interface ge-0/0/2 mac-radius
set protocols dot1x authenticator interface ge-0/0/3 guest-vlan GUEST
set protocols dot1x authenticator interface ge-0/0/8 server-reject-vlan QUARANTINE
set protocols dot1x authenticator interface ge-0/0/1 server-fail permit
set protocols captive-portal interface ge-0/0/3
show dot1x interface
show dot1x interface ge-0/0/1 detail
show dot1x authentication-failed-users
show network-access aaa statistics authentication
show captive-portal interface
clear dot1x interface ge-0/0/1</pre>

<div class="warn"><p><b>Last mistakes to avoid.</b> 802.1X on trunks; confusing reject with fail; secrets in tickets; server-fail permit without a restricted VLAN; one RADIUS server only.</p></div>
<div class="exam"><p><b>Last exam trap.</b> Map the symptom to the zone: timeouts mean path, rejects mean credentials, no EAPOL response means guest VLAN or MAC RADIUS territory.</p></div>

<div class="scn"><h4>Audit week</h4><p>An auditor plugged in a laptop in every building. In the three that were migrated, the port stayed in a dead-end VLAN until the visitor portal. In the old building, with the default access VLAN, the laptop got an address. The old building was scheduled for migration that week.</p><p><b>Lesson:</b> good access control is visible from the outside: an unknown device gets nothing.</p></div>

<div class="iv"><p class="q">"Design port authentication for an office with laptops, printers, phones and visitors."</p><p>802.1X for laptops with dynamic VLAN from RADIUS, MAC RADIUS (restrict on printer-only ports) with restricted VLANs for printers, LLDP-MED plus MAC RADIUS or supplicant for phones, a captive portal with expiring accounts for visitors, a quarantine VLAN for rejected users, server-fail action chosen per port type, two RADIUS servers, and a staged roll-out starting with one test port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles: supplicant, authenticator, server. Port passes only EAPOL until success.</li>
<li>Methods and order: 802.1X, MAC RADIUS, portal, then guest VLAN.</li>
<li>Reject, no EAPOL response and server timeout are three different failures with three actions.</li>
<li>Supplicant mode follows what really sits behind the port.</li>
<li>Timeouts mean path; rejects mean credentials.</li>
</ul></div>
`,hi:`
<p>Ab aap tay kar sakte ho ki EX access port kaun use kare, kaise sabit kare, kahan pahunche, aur kuch fail ho to kya ho. Yeh JN0-650 aur interviews ke liye aapka final review hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>802.1X ke teen roles batao aur har protocol kya carry karta hai (EAPOL, RADIUS).</li>
<li>radius-server, access profile aur authenticator ports dynamic VLAN ke saath configure karo.</li>
<li>MAC RADIUS enable karo (restrict bhi jaano) aur use hone wala user name samjhao.</li>
<li>Captive portal configure karo aur 802.1X, MAC RADIUS, portal ka order samjhao.</li>
<li>Har port type ke liye guest-vlan, server-reject-vlan aur server-fail action chuno.</li>
<li>single, single-secure ya multiple chuno aur timers tune karo.</li>
<li>Held reason, aaa statistics aur server log se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Supplicant / authenticator</dt><dd>client / relay karne wala switch port.</dd>
<dt>EAPOL</dt><dd>EAP over LAN, EtherType 0x888E.</dd>
<dt>NAS</dt><dd>network access server: RADIUS ke nazariye se switch.</dd>
<dt>Shared secret</dt><dd>switch aur RADIUS server ke beech ka password.</dd>
<dt>MAC RADIUS</dt><dd>MAC address ko user name aur password bhejkar authentication.</dd>
<dt>Captive portal</dt><dd>switch par web login, RADIUS se check.</dd>
<dt>Server-fail</dt><dd>RADIUS jawab na de tab ka action.</dd>
<dt>Held</dt><dd>fail hue host ka state jo quiet period ka intezaar karta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Authorisation se pehle port pass karta hai</td><td>sirf EAPOL</td></tr>
<tr><td>RADIUS ports</td><td>UDP 1812 (auth), 1813 (accounting)</td></tr>
<tr><td>Galat secret se milta hai</td><td>timeout (server ignore karta hai)</td></tr>
<tr><td>Galat password se milta hai</td><td>Access-Reject</td></tr>
<tr><td>Method order</td><td>802.1X, MAC RADIUS, captive portal; guest VLAN aakhri raasta</td></tr>
<tr><td>MAC RADIUS user name</td><td>12 hex digits, separators nahi; password wahi</td></tr>
<tr><td>Default server-fail</td><td>deny</td></tr>
<tr><td>Timers</td><td>transmit 30 s, max-requests 2, quiet 60 s, reauth 3600 s</td></tr>
<tr><td>VLAN attributes</td><td>Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-ID</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">set access radius-server 172.20.50.10 secret "CHANGE-ME-LAB-ONLY"
set access profile NK-DOT1X authentication-order radius
set access profile NK-DOT1X radius authentication-server 172.20.50.10
set protocols dot1x authenticator authentication-profile-name NK-DOT1X
set protocols dot1x authenticator interface ge-0/0/1 supplicant single-secure
set protocols dot1x authenticator interface ge-0/0/2 mac-radius
set protocols dot1x authenticator interface ge-0/0/3 guest-vlan GUEST
set protocols dot1x authenticator interface ge-0/0/8 server-reject-vlan QUARANTINE
set protocols dot1x authenticator interface ge-0/0/1 server-fail permit
set protocols captive-portal interface ge-0/0/3
show dot1x interface
show dot1x interface ge-0/0/1 detail
show dot1x authentication-failed-users
show network-access aaa statistics authentication
show captive-portal interface
clear dot1x interface ge-0/0/1</pre>

<div class="warn"><p><b>Aakhri galtiyan jinse bachna hai.</b> Trunks par 802.1X; reject aur fail ko mix karna; tickets mein secrets; restricted VLAN ke bina server-fail permit; sirf ek RADIUS server.</p></div>
<div class="exam"><p><b>Aakhri exam trap.</b> Symptom ko zone se map karo: timeouts matlab path, rejects matlab credentials, EAPOL response nahi matlab guest VLAN ya MAC RADIUS ka ilaaka.</p></div>

<div class="scn"><h4>Audit week</h4><p>Ek auditor ne har building mein laptop plug kiya. Teen migrated buildings mein port visitor portal tak dead-end VLAN mein raha. Purani building mein, default access VLAN ke saath, laptop ko address mil gaya. Purani building ka migration usi hafte schedule tha.</p><p><b>Lesson:</b> achha access control bahar se dikhta hai: anjaan device ko kuch nahi milta.</p></div>

<div class="iv"><p class="q">"Laptops, printers, phones aur visitors wale office ke liye port authentication design karo."</p><p>Laptops ke liye RADIUS ke dynamic VLAN ke saath 802.1X, printers ke liye restricted VLANs ke saath MAC RADIUS (printer-only ports par restrict), phones ke liye LLDP-MED plus MAC RADIUS ya supplicant, visitors ke liye expiring accounts wala captive portal, rejected users ke liye quarantine VLAN, har port type ke hisaab se server-fail action, do RADIUS servers, aur ek test port se shuru hone wala staged roll-out.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles: supplicant, authenticator, server. Success tak port sirf EAPOL pass karta hai.</li>
<li>Methods aur order: 802.1X, MAC RADIUS, portal, phir guest VLAN.</li>
<li>Reject, EAPOL response nahi aur server timeout teen alag failures hain, teen actions ke saath.</li>
<li>Supplicant mode woh hai jo port ke peeche asal mein hai.</li>
<li>Timeouts matlab path; rejects matlab credentials.</li>
</ul></div>
`}};export{e as default};