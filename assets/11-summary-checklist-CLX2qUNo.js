var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have walked from "what does each control protect" to rogue detection and a troubleshooting routine. This last chapter pulls it together: a can-do checklist, a short glossary, the facts examiners love, and a command cheat-sheet. Keep it open while you redo the five labs. Reminder: this simulator is an original learning model, not Cisco software and not a certification exam simulator, and everything marked <b>concept only</b> is explained but not run by it.</p>

<h3>I can do this (checklist)</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Identify: web auth, MAB, 802.1X</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Protect: WPA3, PMF, OWE</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">Restrict: ACL, override, SGT</text>
<rect x="115" y="90" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="215" y="120" text-anchor="middle" class="svg-ink" font-size="13">Detect: rogues, aWIPS</text>
<rect x="325" y="90" width="200" height="50" rx="8" fill="#fed7aa"/><text x="425" y="120" text-anchor="middle" class="svg-ink" font-size="13">Limit: client exclusion</text>
<rect x="220" y="170" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Fix: state, log, policy</text>
</svg><p class="cap">Identify, protect, restrict, detect, limit, fix: the six verbs of advanced WLAN security.</p></div>
<ul>
<li>Build local web authentication: user, <code>aaa new-model</code>, login list, web server, parameter map, WLAN, policy profile, tag (lab 1).</li>
<li>Explain WEBAUTH_REQUIRED: DHCP and DNS only, until login moves the client to RUN.</li>
<li>Explain CWA with ISE: MAB, redirect and redirect ACL (permit = redirect), portal, CoA (concept only).</li>
<li>Write a guest ACL with denies first, apply it with <code>ipv4 acl</code>, and prove it with counters (lab 3).</li>
<li>Enable <code>aaa-override</code> and explain why the RADIUS VLAN must exist (lab 5).</li>
<li>Configure MAB and read its five failure reasons; explain why it is spoofable.</li>
<li>Explain SGT classification, propagation and enforcement (concept only).</li>
<li>Choose PMF optional versus mandatory, and explain status 31 and 43 (lab 4).</li>
<li>Compare PEAP, EAP-TLS and EAP-FAST, and why server certificate validation matters.</li>
<li>Read the rogue summary, set min-rssi, and tune client exclusion without causing false positives.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LWA / CWA</dt><dd>Local versus Central Web Authentication.</dd>
<dt>Parameter map</dt><dd>Defines the web auth page: type webauth, consent or webconsent; <code>global</code> is the fallback.</dd>
<dt>NAS</dt><dd>Network access server: the controller as RADIUS client.</dd>
<dt>CoA</dt><dd>Change of Authorization: server-initiated change or disconnect of a session.</dd>
<dt>dACL</dt><dd>Downloadable ACL delivered by ISE at login.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: identify a device by MAC.</dd>
<dt>SGT / SGACL</dt><dd>Security group tag, and the ACL applied between two groups.</dd>
<dt>SXP</dt><dd>SGT Exchange Protocol, TCP port 64999 by default.</dd>
<dt>PMF</dt><dd>Protected Management Frames (802.11w).</dd>
<dt>SAE</dt><dd>Simultaneous Authentication of Equals, the WPA3-Personal handshake.</dd>
<dt>OWE</dt><dd>Opportunistic Wireless Encryption for open networks.</dd>
<dt>EAP</dt><dd>Extensible Authentication Protocol carried by 802.1X.</dd>
<dt>Rogue AP</dt><dd>Any AP not managed by your controller.</dd>
<dt>aWIPS</dt><dd>Adaptive wireless intrusion prevention (signature-based).</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Web auth</td><td>Open WLAN, Layer 3 security, no encryption; only DHCP and DNS pass before login</td></tr>
<tr><td>CWA redirect ACL</td><td>Permit = redirect, deny = bypass</td></tr>
<tr><td>CoA</td><td>Server to controller; Disconnect-Request and CoA-Request</td></tr>
<tr><td>ACL</td><td>First match, implicit deny, unknown name permits all</td></tr>
<tr><td>AAA override</td><td>Server attribute plus policy profile setting; VLAN must exist</td></tr>
<tr><td>MAB</td><td>Authorization method list; MAC as user and password; spoofable</td></tr>
<tr><td>PMF</td><td>Disabled, optional, mandatory; WPA3-only needs mandatory; status 31</td></tr>
<tr><td>SAE-only</td><td>Client without SAE gets status 43</td></tr>
<tr><td>6 GHz</td><td>WPA3 and PMF mandatory</td></tr>
<tr><td>EAP-TLS</td><td>Certificates on both sides; PEAP only server certificate</td></tr>
<tr><td>Rogues</td><td>Friendly, Malicious, Unclassified; containment has legal limits</td></tr>
<tr><td>Exclusion</td><td>Timer based (60 s default in the model); clear with the exclusion command</td></tr>
</table>

<h3>Command cheat-sheet (simulated)</h3>
<pre class="code"><span class="c">! web auth</span>
username guest1 password 0 Guest@123
aaa new-model
aaa authentication login GUEST-LIST local
ip h&#116;tp server
parameter-map type webauth PM-GUEST
 type webauth
<span class="c">! WLAN</span>
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 security web-auth
 security web-auth authentication-list GUEST-LIST
 security web-auth parameter-map PM-GUEST
<span class="c">! PMF and MAB (WLAN shut down first)</span>
 security pmf optional
 mac-filtering MAB-LIST
<span class="c">! policy profile</span>
wireless profile policy PP-GUEST
 ipv4 acl GUEST-ACL
 aaa-override
 exclusionlist timeout 120
<span class="c">! global</span>
ip access-list extended GUEST-ACL
wireless wps client-exclusion web-auth
wireless wps rogue detection min-rssi -75</pre>
<pre class="out">show wlan name NK-GUEST            show aaa method-lists authentication
show parameter-map type webauth all   show ip access-lists GUEST-ACL
show wireless client summary          show wireless client mac-address &lt;mac&gt; detail
show wireless profile policy detailed PP-GUEST
show wireless exclusionlist           show wireless wps rogue ap summary
clear wireless exclusionlist client mac-address &lt;mac&gt;</pre>
<p>Items not confirmed against vendor documentation (check your release): <code>security pmf</code> spelling, <code>ipv4 acl</code> under the policy profile, <code>wireless wps client-exclusion</code>, and the WPA3 keywords.</p>

<div class="eg"><p><b>Worked example.</b> Self-test: a client is in WEBAUTH_REQUIRED, the web server is on, the parameter map exists, and the sign-in says there is no authentication list. Answer: the WLAN is missing <code>security web-auth authentication-list</code>, or the named list is not defined. Name the object, the command and the proof.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on the exam.</b> Calling web auth or MAB "encryption". Choosing mandatory PMF without checking legacy clients. Forgetting that a missing ACL permits. Confusing 802.11w with WPA3 itself.</p></div>

<div class="exam"><p><b>Exam traps.</b> Read the question for the layer: identity (EAP, MAB, web auth), protection (WPA3, PMF, OWE), or access (ACL, VLAN, SGT). Distractors usually offer a control from the wrong layer.</p></div>

<div class="scn"><h4>The audit that passed</h4><p>An external audit asked: how do you protect guests, staff and IoT? The team showed a single page: guest open or OWE with consent web auth, ACL and counters; staff 802.1X with EAP-TLS, PMF, per-user VLAN by AAA override; IoT with MAB in a restricted VLAN; rogue detection with min-rssi tuned, exclusion on. Each line named the control, the proof command and the limit. The audit closed with no findings.</p><p><b>Lesson:</b> a control is only as good as your ability to prove it and to state its limit.</p></div>

<div class="iv"><p class="q">"Summarise your WLAN security design in two minutes."</p><p>Start with the four questions (confidentiality, identity, access, management integrity), then give one control per question per WLAN, then how you detect (rogues, logs) and how you prove changes (client state, log, policy).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pick controls by the question they answer: identity, protection, access, detection.</li>
<li>Web auth, MAB and exclusion are simulated; CWA, CoA, SGT, OWE, EAP internals and aWIPS are concept only.</li>
<li>Know the numbers: status 31 and 43, SXP 64999, 60 s exclusion, permit means redirect.</li>
<li>Always prove a change from the client, and state the control's limit.</li>
<li>Continue to the next modules: FlexConnect, mobility, QoS and diagnostics reuse these security objects.</li>
</ul></div>
`,hi:`
<p>Aap "har control kya protect karta hai" se rogue detection aur troubleshooting routine tak chal chuke ho. Yeh aakhri chapter sab kuch ek jagah laata hai: can-do checklist, chhota glossary, woh facts jo examiners pasand karte hain, aur command cheat-sheet. Paanch labs dobara karte waqt ise khula rakho. Yaad dilana: yeh simulator ek original learning model hai, Cisco software nahi aur certification exam simulator nahi, aur jo <b>concept only</b> mark hai woh samjhaya gaya hai lekin simulator use run nahi karta.</p>

<h3>Main yeh kar sakta hoon (checklist)</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Identify: web auth, MAB, 802.1X</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Protect: WPA3, PMF, OWE</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">Restrict: ACL, override, SGT</text>
<rect x="115" y="90" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="215" y="120" text-anchor="middle" class="svg-ink" font-size="13">Detect: rogues, aWIPS</text>
<rect x="325" y="90" width="200" height="50" rx="8" fill="#fed7aa"/><text x="425" y="120" text-anchor="middle" class="svg-ink" font-size="13">Limit: client exclusion</text>
<rect x="220" y="170" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Fix: state, log, policy</text>
</svg><p class="cap">Identify, protect, restrict, detect, limit, fix: advanced WLAN security ke chhe verbs.</p></div>
<ul>
<li>Local web authentication build karo: user, <code>aaa new-model</code>, login list, web server, parameter map, WLAN, policy profile, tag (lab 1).</li>
<li>WEBAUTH_REQUIRED samjhao: sirf DHCP aur DNS, jab tak login client ko RUN mein na le jaye.</li>
<li>ISE ke saath CWA samjhao: MAB, redirect aur redirect ACL (permit = redirect), portal, CoA (concept only).</li>
<li>Denies pehle wala guest ACL likho, <code>ipv4 acl</code> se apply karo, aur counters se prove karo (lab 3).</li>
<li><code>aaa-override</code> enable karo aur samjhao ki RADIUS VLAN exist karna kyun zaroori hai (lab 5).</li>
<li>MAB configure karo aur uski paanch failure reasons padho; samjhao woh spoofable kyun hai.</li>
<li>SGT classification, propagation aur enforcement samjhao (concept only).</li>
<li>PMF optional versus mandatory chuno, aur status 31 aur 43 samjhao (lab 4).</li>
<li>PEAP, EAP-TLS aur EAP-FAST compare karo, aur server certificate validation kyun matter karta hai.</li>
<li>Rogue summary padho, min-rssi set karo, aur false positives ke bina client exclusion tune karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LWA / CWA</dt><dd>Local versus Central Web Authentication.</dd>
<dt>Parameter map</dt><dd>Web auth page define karta hai: type webauth, consent ya webconsent; <code>global</code> fallback hai.</dd>
<dt>NAS</dt><dd>Network access server: controller RADIUS client ke taur par.</dd>
<dt>CoA</dt><dd>Change of Authorization: server-initiated session change ya disconnect.</dd>
<dt>dACL</dt><dd>Downloadable ACL jo ISE login par deta hai.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: device ko MAC se identify karo.</dd>
<dt>SGT / SGACL</dt><dd>Security group tag, aur do groups ke beech lagne wala ACL.</dd>
<dt>SXP</dt><dd>SGT Exchange Protocol, default TCP port 64999.</dd>
<dt>PMF</dt><dd>Protected Management Frames (802.11w).</dd>
<dt>SAE</dt><dd>Simultaneous Authentication of Equals, WPA3-Personal handshake.</dd>
<dt>OWE</dt><dd>Open networks ke liye Opportunistic Wireless Encryption.</dd>
<dt>EAP</dt><dd>802.1X ka carry kiya Extensible Authentication Protocol.</dd>
<dt>Rogue AP</dt><dd>Koi bhi AP jo aapke controller se managed nahi.</dd>
<dt>aWIPS</dt><dd>Adaptive wireless intrusion prevention (signature-based).</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Web auth</td><td>Open WLAN, Layer 3 security, encryption nahi; login se pehle sirf DHCP aur DNS pass hote hain</td></tr>
<tr><td>CWA redirect ACL</td><td>Permit = redirect, deny = bypass</td></tr>
<tr><td>CoA</td><td>Server se controller; Disconnect-Request aur CoA-Request</td></tr>
<tr><td>ACL</td><td>First match, implicit deny, unknown naam sab permit karta hai</td></tr>
<tr><td>AAA override</td><td>Server attribute plus policy profile setting; VLAN exist kare</td></tr>
<tr><td>MAB</td><td>Authorization method list; MAC hi user aur password; spoofable</td></tr>
<tr><td>PMF</td><td>Disabled, optional, mandatory; WPA3-only ko mandatory chahiye; status 31</td></tr>
<tr><td>SAE-only</td><td>SAE-less client ko status 43</td></tr>
<tr><td>6 GHz</td><td>WPA3 aur PMF mandatory</td></tr>
<tr><td>EAP-TLS</td><td>Dono taraf certificates; PEAP mein sirf server certificate</td></tr>
<tr><td>Rogues</td><td>Friendly, Malicious, Unclassified; containment par legal limits</td></tr>
<tr><td>Exclusion</td><td>Timer based (model mein 60 s default); exclusion command se clear karo</td></tr>
</table>

<h3>Command cheat-sheet (simulated)</h3>
<pre class="code"><span class="c">! web auth</span>
username guest1 password 0 Guest@123
aaa new-model
aaa authentication login GUEST-LIST local
ip h&#116;tp server
parameter-map type webauth PM-GUEST
 type webauth
<span class="c">! WLAN</span>
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 security web-auth
 security web-auth authentication-list GUEST-LIST
 security web-auth parameter-map PM-GUEST
<span class="c">! PMF aur MAB (pehle WLAN shut down)</span>
 security pmf optional
 mac-filtering MAB-LIST
<span class="c">! policy profile</span>
wireless profile policy PP-GUEST
 ipv4 acl GUEST-ACL
 aaa-override
 exclusionlist timeout 120
<span class="c">! global</span>
ip access-list extended GUEST-ACL
wireless wps client-exclusion web-auth
wireless wps rogue detection min-rssi -75</pre>
<pre class="out">show wlan name NK-GUEST            show aaa method-lists authentication
show parameter-map type webauth all   show ip access-lists GUEST-ACL
show wireless client summary          show wireless client mac-address &lt;mac&gt; detail
show wireless profile policy detailed PP-GUEST
show wireless exclusionlist           show wireless wps rogue ap summary
clear wireless exclusionlist client mac-address &lt;mac&gt;</pre>
<p>Jo items vendor documentation ke against confirm nahi hue (apni release check karo): <code>security pmf</code> ki spelling, policy profile ke andar <code>ipv4 acl</code>, <code>wireless wps client-exclusion</code>, aur WPA3 keywords.</p>

<div class="eg"><p><b>Worked example.</b> Self-test: client WEBAUTH_REQUIRED mein hai, web server on hai, parameter map exist karta hai, aur sign-in kehta hai ki authentication list nahi hai. Jawab: WLAN mein <code>security web-auth authentication-list</code> missing hai, ya jo list ka naam diya woh defined nahi hai. Object, command aur proof ka naam batao.</p></div>

<div class="warn"><p><b>Exam mein bachne wali common mistakes.</b> Web auth ya MAB ko "encryption" kehna. Legacy clients check kiye bina mandatory PMF chunna. Yeh bhoolna ki missing ACL permit karta hai. 802.11w ko khud WPA3 samajhna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sawal mein layer dekho: identity (EAP, MAB, web auth), protection (WPA3, PMF, OWE) ya access (ACL, VLAN, SGT). Distractors aksar galat layer ka control offer karte hain.</p></div>

<div class="scn"><h4>Audit jo pass hua</h4><p>Ek external audit ne poocha: guests, staff aur IoT ko aap kaise protect karte ho? Team ne ek page dikhaya: guest open ya OWE consent web auth, ACL aur counters ke saath; staff EAP-TLS ke saath 802.1X, PMF, AAA override se per-user VLAN; IoT restricted VLAN mein MAB ke saath; rogue detection min-rssi tuned, exclusion on. Har line ne control, proof command aur limit ka naam liya. Audit bina kisi finding ke band hua.</p><p><b>Lesson:</b> control utna hi achha hai jitna aap use prove kar sako aur uski limit bata sako.</p></div>

<div class="iv"><p class="q">"Apne WLAN security design ko do minute mein summarise karo."</p><p>Chaar sawalon (confidentiality, identity, access, management integrity) se shuru karo, phir har WLAN ke liye har sawal ka ek control batao, phir bolo ki aap detect kaise karte ho (rogues, logs) aur changes ko prove kaise karte ho (client state, log, policy).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controls ko us sawal se chuno jiska woh jawab dete hain: identity, protection, access, detection.</li>
<li>Web auth, MAB aur exclusion simulated hain; CWA, CoA, SGT, OWE, EAP internals aur aWIPS concept only hain.</li>
<li>Numbers jaano: status 31 aur 43, SXP 64999, 60 s exclusion, permit matlab redirect.</li>
<li>Har change ko client se prove karo, aur control ki limit batao.</li>
<li>Agle modules par jao: FlexConnect, mobility, QoS aur diagnostics in security objects ko reuse karte hain.</li>
</ul></div>
`}};export{e as default};