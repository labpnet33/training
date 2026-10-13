var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with the question "who may join and what protects the data". You can now answer it for open, PSK and 802.1X WLANs, configure and rotate each safely on a Catalyst 9800-style controller, and troubleshoot a RADIUS key fault from evidence. Use this chapter as your final revision sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain open, WPA2, WPA3, PSK, SAE, OWE and PMF in one sentence each.</li>
<li>Draw the 4-way handshake and say what PMK, PTK and GTK are.</li>
<li>Name the three 802.1X roles and who plays each in the lab.</li>
<li>Compare PEAP-MSCHAPv2 and EAP-TLS, including the server certificate risk.</li>
<li>Build the AAA chain: radius server, aaa new-model, server group, method list.</li>
<li>Create a WPA2-Enterprise WLAN, a policy profile on VLAN 40 and map it in the policy tag.</li>
<li>Rotate a PSK with shutdown, set-key and no shutdown, then run the positive and negative test.</li>
<li>Tell timeouts from rejects and find a shared-secret mismatch with show aaa servers and show logging.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! PSK WLAN and rotation</span>
wlan NK-STAFF 1 NK-STAFF
 shutdown
 security wpa akm psk
 security wpa psk set-key ascii 0 NkStaff2025
 no shutdown

<span class="c">! RADIUS and AAA chain</span>
radius server RAD1
 address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
aaa new-model
aaa group server radius RG-NK
 server name RAD1
aaa authentication dot1x NK-DOT1X group RG-NK

<span class="c">! Enterprise WLAN and policy</span>
wlan NK-CORP 2 NK-CORP
 security dot1x authentication-list NK-DOT1X
 no shutdown
wireless profile policy PP-CORP
 vlan 40
 no shutdown
wireless tag policy PT-CAMPUS
 wlan NK-CORP policy PP-CORP

<span class="c">! Verify</span>
show wlan summary
show aaa servers
show radius server-group all
show logging
show wireless tag policy detailed PT-CAMPUS</pre>

<h3>Lab recap</h3>
<table class="cmp"><tr><th>Lab</th><th>Task</th><th>Key fact</th></tr>
<tr><td>wl-psk-rotate</td><td>NkStaff2024 to NkStaff2025</td><td>shutdown, set-key, no shutdown; prove old key fails</td></tr>
<tr><td>wl-dot1x-build</td><td>NK-CORP, VLAN 40, RAD1</td><td>AAA chain first; alice joins, wrong password rejected</td></tr>
<tr><td>wl-radius-key</td><td>Fix timeouts after RAD1 rebuild</td><td>Re-enter key 0 NkRadius1 under radius server RAD1</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AKM</dt><dd>Authentication and key management type: psk, dot1x or sae.</dd>
<dt>PMK, PTK, GTK</dt><dd>Master key, per-client session key and group key.</dd>
<dt>SAE</dt><dd>WPA3 password exchange that blocks offline guessing.</dd>
<dt>PMF (802.11w)</dt><dd>Signs management frames such as deauthentication.</dd>
<dt>Supplicant, authenticator, server</dt><dd>Client, AP and controller, RADIUS.</dd>
<dt>EAP, EAPOL</dt><dd>Authentication framework and its transport on the wireless LAN.</dd>
<dt>NAS</dt><dd>Network access server; here the controller.</dd>
<dt>Method list</dt><dd>Named AAA policy that points to a server group.</dd>
<dt>CoA</dt><dd>Server-initiated change of a live session, UDP 3799.</dd>
<dt>OWE</dt><dd>Encryption for open networks without a password.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>WPA2 uses AES-CCMP; WPA3 adds SAE and mandatory PMF; TKIP and WEP are obsolete.</li>
<li>The passphrase is never sent; the 4-way handshake proves knowledge of the PMK.</li>
<li>RADIUS: UDP 1812 authentication, 1813 accounting; secret shared by controller and server.</li>
<li>A wrong shared secret causes timeouts (silent drop), not Access-Reject.</li>
<li>A WLAN must be disabled before security edits; new WLANs and policy profiles start shut.</li>
<li>802.1X needs aaa new-model, a method list, a server group and a server, referenced by name.</li>
<li>A WLAN is broadcast only if the AP policy tag maps it to an enabled policy profile.</li>
</ol>
<div class="note"><p><b>Concept only, not simulated in the lab:</b> EAP-TLS certificates and chains, SAE and PMF exchanges, OWE, iPSK, dynamic VLAN attributes, CoA, web authentication portals, posture, 802.11r/k/v. Coming up: wl-secure (Advanced security), and wl-mobility (Mobility and high availability) for 802.11r/k/v.</p></div>
<div class="warn"><p><b>Common mistake in exams.</b> Choosing "change the WLAN key" as a fix for an 802.1X failure. 802.1X has no WLAN passphrase; look at AAA, the server or the account.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authenticator is the controller or AP, not RADIUS. Reject is an answer; timeout is silence.</p></div>

<div class="scn"><h4>Putting it all together: Monday morning</h4><p>Staff cannot connect with the new passphrase and corporate users time out. Evidence: show wlan summary shows NK-STAFF down (someone shut it after rotating and forgot no shutdown) and show aaa servers shows timeouts on RAD1. Two faults, two objects: enable the WLAN, and re-enter the RADIUS key. Both are proven with clients.</p><p><b>Lesson:</b> check each object with its own evidence and fix them one at a time.</p></div>
<div class="iv"><p class="q">"Summarise how you would secure and troubleshoot Wi-Fi authentication on a 9800."</p><p>Pick the model per device class. For PSK: long key, shut-before-edit rotation, positive and negative test. For 802.1X: RADIUS server, aaa new-model, group, method list, WLAN, policy and tag. Troubleshoot with counters then logs: timeouts mean secret, reachability or NAS entry; rejects mean credentials.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Open, PSK and 802.1X cover most SSIDs; match them to device classes.</li>
<li>Know the 4-way handshake and the three 802.1X roles cold.</li>
<li>The AAA chain is four objects plus aaa new-model, linked by name.</li>
<li>Timeouts versus rejects is the fastest diagnostic split.</li>
<li>Practise all three labs until you can do them without notes.</li>
</ul></div>
`,hi:`
<p>Aapne "kaun join kar sakta hai aur data ko kya protect karta hai" sawal se shuru kiya tha. Ab aap ise open, PSK aur 802.1X WLANs ke liye answer kar sakte ho, Catalyst 9800-style controller par har ek ko safely configure aur rotate kar sakte ho, aur evidence se RADIUS key fault troubleshoot kar sakte ho. Is chapter ko final revision sheet ki tarah use karo.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Open, WPA2, WPA3, PSK, SAE, OWE aur PMF har ek ko ek sentence mein explain karo.</li>
<li>4-way handshake draw karo aur batao PMK, PTK aur GTK kya hain.</li>
<li>802.1X ke teen roles batao aur lab mein har role kaun nibhata hai.</li>
<li>PEAP-MSCHAPv2 aur EAP-TLS compare karo, server certificate risk samet.</li>
<li>AAA chain build karo: radius server, aaa new-model, server group, method list.</li>
<li>WPA2-Enterprise WLAN, VLAN 40 par policy profile banao aur policy tag mein map karo.</li>
<li>PSK ko shutdown, set-key aur no shutdown se rotate karo, phir positive aur negative test chalao.</li>
<li>Timeouts aur rejects mein farq pehchano aur show aaa servers aur show logging se shared-secret mismatch dhoondho.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! PSK WLAN aur rotation</span>
wlan NK-STAFF 1 NK-STAFF
 shutdown
 security wpa akm psk
 security wpa psk set-key ascii 0 NkStaff2025
 no shutdown

<span class="c">! RADIUS aur AAA chain</span>
radius server RAD1
 address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
aaa new-model
aaa group server radius RG-NK
 server name RAD1
aaa authentication dot1x NK-DOT1X group RG-NK

<span class="c">! Enterprise WLAN aur policy</span>
wlan NK-CORP 2 NK-CORP
 security dot1x authentication-list NK-DOT1X
 no shutdown
wireless profile policy PP-CORP
 vlan 40
 no shutdown
wireless tag policy PT-CAMPUS
 wlan NK-CORP policy PP-CORP

<span class="c">! Verify</span>
show wlan summary
show aaa servers
show radius server-group all
show logging
show wireless tag policy detailed PT-CAMPUS</pre>

<h3>Lab recap</h3>
<table class="cmp"><tr><th>Lab</th><th>Task</th><th>Key fact</th></tr>
<tr><td>wl-psk-rotate</td><td>NkStaff2024 se NkStaff2025</td><td>shutdown, set-key, no shutdown; prove karo purani key fail hoti hai</td></tr>
<tr><td>wl-dot1x-build</td><td>NK-CORP, VLAN 40, RAD1</td><td>Pehle AAA chain; alice join, galat password reject</td></tr>
<tr><td>wl-radius-key</td><td>RAD1 rebuild ke baad timeouts fix</td><td>radius server RAD1 ke andar key 0 NkRadius1 dobara enter karo</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AKM</dt><dd>Authentication and key management type: psk, dot1x ya sae.</dd>
<dt>PMK, PTK, GTK</dt><dd>Master key, per-client session key aur group key.</dd>
<dt>SAE</dt><dd>WPA3 password exchange jo offline guessing block karta hai.</dd>
<dt>PMF (802.11w)</dt><dd>Deauthentication jaise management frames sign karta hai.</dd>
<dt>Supplicant, authenticator, server</dt><dd>Client, AP aur controller, RADIUS.</dd>
<dt>EAP, EAPOL</dt><dd>Authentication framework aur wireless LAN par uska transport.</dd>
<dt>NAS</dt><dd>Network access server; yahan controller.</dd>
<dt>Method list</dt><dd>Named AAA policy jo server group ko point karti hai.</dd>
<dt>CoA</dt><dd>Live session ka server-initiated change, UDP 3799.</dd>
<dt>OWE</dt><dd>Password ke bina open networks ke liye encryption.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>WPA2 AES-CCMP use karta hai; WPA3 SAE aur mandatory PMF jodta hai; TKIP aur WEP obsolete hain.</li>
<li>Passphrase kabhi nahi bheja jaata; 4-way handshake PMK ka knowledge prove karta hai.</li>
<li>RADIUS: UDP 1812 authentication, 1813 accounting; secret controller aur server share karte hain.</li>
<li>Galat shared secret timeouts (silent drop) deta hai, Access-Reject nahi.</li>
<li>Security edit se pehle WLAN disable karna padta hai; naye WLANs aur policy profiles shut start hote hain.</li>
<li>802.1X ko aaa new-model, method list, server group aur server chahiye, naam se referenced.</li>
<li>WLAN tabhi broadcast hota hai jab AP policy tag use enabled policy profile se map kare.</li>
</ol>
<div class="note"><p><b>Concept only, lab mein simulated nahi:</b> EAP-TLS certificates aur chains, SAE aur PMF exchanges, OWE, iPSK, dynamic VLAN attributes, CoA, web authentication portals, posture, 802.11r/k/v. Aage aane wale: wl-secure (Advanced security), aur 802.11r/k/v ke liye wl-mobility (Mobility and high availability).</p></div>
<div class="warn"><p><b>Exam mein common mistake.</b> 802.1X failure ke fix ke roop mein "WLAN key badlo" chunna. 802.1X mein WLAN passphrase nahi hota; AAA, server ya account dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authenticator controller ya AP hai, RADIUS nahi. Reject ek jawab hai; timeout khamoshi hai.</p></div>

<div class="scn"><h4>Sab kuch jodkar: Monday subah</h4><p>Staff nayi passphrase se connect nahi kar pa rahe aur corporate users timeout ho rahe hain. Evidence: show wlan summary mein NK-STAFF down dikhta hai (kisi ne rotate ke baad shut karke no shutdown bhula diya) aur show aaa servers RAD1 par timeouts dikhata hai. Do faults, do objects: WLAN enable karo, aur RADIUS key dobara enter karo. Dono clients se prove hote hain.</p><p><b>Lesson:</b> har object ko uske apne evidence se check karo aur ek ek karke fix karo.</p></div>
<div class="iv"><p class="q">"9800 par Wi-Fi authentication ko secure aur troubleshoot karne ka summary do."</p><p>Device class ke hisaab se model chuno. PSK ke liye: lambi key, shut-before-edit rotation, positive aur negative test. 802.1X ke liye: RADIUS server, aaa new-model, group, method list, WLAN, policy aur tag. Counters phir logs se troubleshoot karo: timeouts matlab secret, reachability ya NAS entry; rejects matlab credentials.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Open, PSK aur 802.1X zyaadatar SSIDs cover karte hain; unhe device classes se match karo.</li>
<li>4-way handshake aur 802.1X ke teen roles pakke yaad rakho.</li>
<li>AAA chain chaar objects plus aaa new-model hai, naam se linked.</li>
<li>Timeouts versus rejects sabse tez diagnostic split hai.</li>
<li>Teenon labs tab tak practise karo jab tak bina notes ke kar sako.</li>
</ul></div>
`}};export{e as default};