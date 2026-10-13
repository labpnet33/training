var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a switch and a policy server that trusted each other. You now have a complete wired access design: 802.1X for laptops, MAC authentication for printers, role or VLAN placement, and a method to troubleshoot it. This chapter gathers everything for revision.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="13">Port tries</text><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">dot1x</text>
<rect x="135" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="68" text-anchor="middle" class="svg-ink" font-size="13">then</text><text x="190" y="86" text-anchor="middle" class="svg-ink" font-size="13">mac-auth</text>
<rect x="260" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="68" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="315" y="86" text-anchor="middle" class="svg-ink" font-size="13">6 stages</text>
<rect x="385" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="440" y="68" text-anchor="middle" class="svg-ink" font-size="13">Role name</text><text x="440" y="86" text-anchor="middle" class="svg-ink" font-size="13">or Tunnel x3</text>
<rect x="510" y="40" width="120" height="60" rx="8" fill="#fed7aa"/><text x="570" y="68" text-anchor="middle" class="svg-ink" font-size="13">Switch role</text><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="13">VLAN + DHCP</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Prove it on the switch, every time</text>
</svg><p class="cap">The whole module in one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain EAPOL, EAP, PEAP and RADIUS and who talks to whom.</li>
<li>Configure the switch: RADIUS host, server group, global and port methods, roles, trunk VLANs.</li>
<li>Name the six ClearPass stages and the failure signature of each.</li>
<li>Return a placement with Aruba-User-Role and match the switch role name exactly.</li>
<li>Return a placement with the three Tunnel attributes and recognise "authorized in VLAN 1".</li>
<li>Add an endpoint to the Endpoints Repository, build the MAC authentication service and bind RM-MAC and EPOL-MAC.</li>
<li>Design one port template with fallback, reject-role and critical-role.</li>
<li>Troubleshoot by reading the switch and the Access Tracker, one fix at a time.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Software on the endpoint that speaks 802.1X.</dd>
<dt>Authenticator / NAD</dt><dd>The switch port (network access device) enforcing access.</dd>
<dt>EAPOL</dt><dd>EAP over LAN, supplicant to switch.</dd>
<dt>PEAP</dt><dd>TLS tunnel with the server certificate; password inside.</dd>
<dt>Aruba-User-Role</dt><dd>Vendor attribute carrying a switch role name.</dd>
<dt>Tunnel-Private-Group-Id</dt><dd>Attribute that carries the VLAN; needs Tunnel-Type 13 and Tunnel-Medium-Type 6.</dd>
<dt>Endpoints Repository</dt><dd>ClearPass database of devices by MAC with status and attributes.</dd>
<dt>Role mapping</dt><dd>Policy that turns attributes into ClearPass roles.</dd>
<dt>Enforcement profile / policy</dt><dd>The returned attributes, and the rules that choose them.</dd>
<dt>Reject-role / critical-role</dt><dd>Switch outcomes for explicit reject and server outage.</dd>
<dt>Access Tracker</dt><dd>Per-request record with Summary, Input, Output and Alerts tabs.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Ethernet NAS-Port-Type</td><td>15</td></tr>
<tr><td>Tunnel-Type VLAN / Medium 802</td><td>13 / 6</td></tr>
<tr><td>RADIUS authentication / accounting UDP</td><td>1812 / 1813</td></tr>
<tr><td>CoA / Disconnect (RFC 5176)</td><td>UDP 3799</td></tr>
<tr><td>Failed to classify request to service</td><td>9002</td></tr>
<tr><td>Wrong password / unknown / disabled</td><td>215 / 216 / 217</td></tr>
<tr><td>Switch precedence</td><td>role, then Tunnel VLAN, then port VLAN</td></tr>
<tr><td>Switch RADIUS source in the lab (the NAD address)</td><td>10.20.99.2</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Switch (AOS-CX style)</span>
show port-access clients detail
show port-access role EMPLOYEE
show aaa authentication port-access
show radius-server
show ip interface brief
<span class="c">! Lab shell on ClearPass (mirrors the GUI path)</span>
monitoring access-tracker detail latest summary
monitoring access-tracker detail latest alerts
monitoring access-tracker detail latest output
monitoring event-viewer
configuration enforcement profile EP-EMPLOYEE template vlan 10
configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer</pre>

<div class="note"><p><b>Not simulated in the lab.</b> The real Policy Manager web GUI and clustering, Active Directory and LDAP, EAP-TLS and certificates, device profiling, OnGuard posture, downloadable user roles, guest portals, and dynamic segmentation. You know where they fit in the chain, but you practise them on real equipment or in a later module.</p></div>

<div class="eg"><p><b>Worked example.</b> Final self-test: a new printer is plugged into 1/1/5 and gets nothing. Say aloud: 802.1X times out, MAC auth starts; the tracker says 216, so the MAC is not in the repository; add it as known with Category Printer; RM-MAC maps it to a role; EPOL-MAC returns EP-IOT; the switch role IOT gives VLAN 30; verify with <code>show port-access clients detail</code> and an address from 10.20.30.0/24. If you can say that without notes, you are ready.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the model behind them. The exam and the interviewer ask "why", not "what was the command".</p></div>

<div class="exam"><p><b>Exam trap.</b> Check the question for which side holds the fault: the profile value, the switch role, the VLAN list or the service. Wrong-side answers are the most common distractor.</p></div>

<div class="scn"><h4>The new hire's first week</h4><p>A new engineer used the two-sided method on three live tickets: a role case mismatch, a missing Tunnel attribute and a printer that was missing from the repository. Each took under fifteen minutes because she read the switch status and the Access Tracker before touching anything.</p><p><b>Lesson:</b> a method beats a memory of past fixes.</p></div>

<div class="iv"><p class="q">"Summarise how you would roll out wired 802.1X with MAC authentication fallback."</p><p>Strong answer: register the switch and agree on the secret; build the server group and methods on the switch; define roles and VLANs and allow them on the trunk; build the ClearPass chain of service, role mapping, enforcement; add endpoints for non-supplicant devices; define reject and critical outcomes; pilot on one floor, verify on the switch, then roll out.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch relays, ClearPass decides, switch enforces.</li>
<li>Role names are exact; VLAN attributes come in threes.</li>
<li>MAC authentication is a fallback; restrict the roles it earns.</li>
<li>Read evidence on both sides; fix one object; prove with the switch.</li>
<li>Know which concepts the lab simulates and which are real-platform only.</li>
</ul></div>
`,hi:`
<p>Is module ki shuruaat mein ek switch aur ek policy server the jo ek doosre par trust karte the. Ab aapke paas poora wired access design hai: laptops ke liye 802.1X, printers ke liye MAC authentication, role ya VLAN placement, aur use troubleshoot karne ki method. Yeh chapter revision ke liye sab ek jagah jodta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="13">Port dot1x</text><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">try karta hai</text>
<rect x="135" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="68" text-anchor="middle" class="svg-ink" font-size="13">phir</text><text x="190" y="86" text-anchor="middle" class="svg-ink" font-size="13">mac-auth</text>
<rect x="260" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="68" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="315" y="86" text-anchor="middle" class="svg-ink" font-size="13">6 stages</text>
<rect x="385" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="440" y="68" text-anchor="middle" class="svg-ink" font-size="13">Role name</text><text x="440" y="86" text-anchor="middle" class="svg-ink" font-size="13">ya Tunnel x3</text>
<rect x="510" y="40" width="120" height="60" rx="8" fill="#fed7aa"/><text x="570" y="68" text-anchor="middle" class="svg-ink" font-size="13">Switch role</text><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="13">VLAN + DHCP</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Har baar switch par prove karo</text>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>EAPOL, EAP, PEAP aur RADIUS samjhao aur batao kaun kisse baat karta hai.</li>
<li>Switch configure karo: RADIUS host, server group, global aur port methods, roles, trunk VLANs.</li>
<li>ClearPass ke chhe stages aur har ek ka failure signature batao.</li>
<li>Aruba-User-Role se placement return karo aur switch role name exact match karo.</li>
<li>Teen Tunnel attributes se placement return karo aur "authorized in VLAN 1" pehchano.</li>
<li>Endpoints Repository mein endpoint add karo, MAC authentication service banao aur RM-MAC aur EPOL-MAC bind karo.</li>
<li>Fallback, reject-role aur critical-role ke saath ek port template design karo.</li>
<li>Switch aur Access Tracker padh kar, ek ek fix karke troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Endpoint par software jo 802.1X bolta hai.</dd>
<dt>Authenticator / NAD</dt><dd>Switch port (network access device) jo access enforce karta hai.</dd>
<dt>EAPOL</dt><dd>EAP over LAN, supplicant se switch tak.</dd>
<dt>PEAP</dt><dd>Server certificate ke saath TLS tunnel; password andar.</dd>
<dt>Aruba-User-Role</dt><dd>Vendor attribute jo switch role name le jaata hai.</dd>
<dt>Tunnel-Private-Group-Id</dt><dd>Attribute jo VLAN le jaata hai; Tunnel-Type 13 aur Tunnel-Medium-Type 6 chahiye.</dd>
<dt>Endpoints Repository</dt><dd>MAC ke hisaab se devices ka ClearPass database, status aur attributes ke saath.</dd>
<dt>Role mapping</dt><dd>Policy jo attributes ko ClearPass roles mein badalti hai.</dd>
<dt>Enforcement profile / policy</dt><dd>Return hone wale attributes, aur unhe chunne wale rules.</dd>
<dt>Reject-role / critical-role</dt><dd>Explicit reject aur server outage ke liye switch outcomes.</dd>
<dt>Access Tracker</dt><dd>Har request ka record jisme Summary, Input, Output aur Alerts tabs hain.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Ethernet NAS-Port-Type</td><td>15</td></tr>
<tr><td>Tunnel-Type VLAN / Medium 802</td><td>13 / 6</td></tr>
<tr><td>RADIUS authentication / accounting UDP</td><td>1812 / 1813</td></tr>
<tr><td>CoA / Disconnect (RFC 5176)</td><td>UDP 3799</td></tr>
<tr><td>Failed to classify request to service</td><td>9002</td></tr>
<tr><td>Galat password / unknown / disabled</td><td>215 / 216 / 217</td></tr>
<tr><td>Switch precedence</td><td>role, phir Tunnel VLAN, phir port VLAN</td></tr>
<tr><td>Lab mein switch ka RADIUS source (NAD address)</td><td>10.20.99.2</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Switch (AOS-CX style)</span>
show port-access clients detail
show port-access role EMPLOYEE
show aaa authentication port-access
show radius-server
show ip interface brief
<span class="c">! Lab shell on ClearPass (mirrors the GUI path)</span>
monitoring access-tracker detail latest summary
monitoring access-tracker detail latest alerts
monitoring access-tracker detail latest output
monitoring event-viewer
configuration enforcement profile EP-EMPLOYEE template vlan 10
configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer</pre>

<div class="note"><p><b>Not simulated in the lab.</b> Real Policy Manager web GUI aur clustering, Active Directory aur LDAP, EAP-TLS aur certificates, device profiling, OnGuard posture, downloadable user roles, guest portals aur dynamic segmentation. Aap jaante ho ki yeh chain mein kahan fit hote hain, par inki practice real equipment par ya aage ke module mein karoge.</p></div>

<div class="eg"><p><b>Worked example.</b> Final self-test: ek naya printer 1/1/5 mein lagaya aur kuch nahi mila. Zor se bolo: 802.1X timeout hota hai, MAC auth shuru hota hai; tracker 216 kehta hai, yaani MAC repository mein nahi hai; use Category Printer ke saath known add karo; RM-MAC use role se map karta hai; EPOL-MAC EP-IOT return karta hai; switch role IOT VLAN 30 deta hai; <code>show port-access clients detail</code> aur 10.20.30.0/24 ke address se verify karo. Agar aap bina notes ke yeh bol sakte ho to aap taiyaar ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Model samjhe bina commands ratna. Exam aur interviewer "kyun" poochte hain, "command kya tha" nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Question mein dekho ki fault kis side hai: profile value, switch role, VLAN list ya service. Galat-side wale jawab sabse aam distractor hain.</p></div>

<div class="scn"><h4>Naye hire ka pehla hafta</h4><p>Ek naye engineer ne teen live tickets par do-side method use ki: role case mismatch, missing Tunnel attribute aur repository mein na hone wala printer. Har ek ko pandrah minute se kam laga kyunki usne kuch chhune se pehle switch status aur Access Tracker padhe.</p><p><b>Seekh:</b> method purane fixes ki yaad se behtar hai.</p></div>

<div class="iv"><p class="q">"MAC authentication fallback ke saath wired 802.1X rollout ka summary batao."</p><p>Strong answer: switch register karo aur secret par agree karo; switch par server group aur methods banao; roles aur VLANs define karo aur trunk par allow karo; ClearPass chain banao: service, role mapping, enforcement; non-supplicant devices ke endpoints add karo; reject aur critical outcomes define karo; ek floor par pilot karo, switch par verify karo, phir rollout karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch relay karta hai, ClearPass decide karta hai, switch enforce karta hai.</li>
<li>Role names exact hote hain; VLAN attributes teen ke set mein aate hain.</li>
<li>MAC authentication fallback hai; usse milne wale roles restrict karo.</li>
<li>Dono sides ka evidence padho; ek object fix karo; switch se prove karo.</li>
<li>Jaano ki lab kya simulate karta hai aur kya sirf real platform ka hai.</li>
</ul></div>
`}};export{e as default};