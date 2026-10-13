var e={id:`security`,h:{en:`Wireless security: WPA2, WPA3, PSK and 802.1X`,hi:`Wireless security: WPA2, WPA3, PSK aur 802.1X`},body:{en:`
<p>Think of three office buildings. The first has its front door wide open: anyone walks in (an <b>open</b> network). The second has a keypad with one code that every employee knows: easy, but when someone leaves, the code must change for everyone (a <b>pre-shared key</b>). The third has a security desk that checks each person's own ID badge against the HR database and can cancel one badge without touching anyone else's (<b>802.1X</b>). Wi-Fi security is the choice between these three buildings, plus the lock on every conversation inside: <b>encryption</b>.</p>

<h3>What wireless security must provide</h3>
<ul>
<li><b>Authentication</b>: only authorised users and devices may join, and clients should be sure they joined the real network.</li>
<li><b>Confidentiality</b>: anyone in range can capture the frames, so the data must be encrypted.</li>
<li><b>Integrity</b>: a message integrity check (MIC) proves frames were not changed in transit.</li>
</ul>

<h3>From WEP to WPA3</h3>
<table class="cmp"><tr><th>Generation</th><th>Encryption</th><th>Authentication</th><th>Status</th></tr>
<tr><td>WEP (1999)</td><td>RC4, static 40 or 104-bit key</td><td>Open or shared key</td><td>Broken in minutes; never use</td></tr>
<tr><td>WPA (2003)</td><td>TKIP (RC4 with per-packet keys)</td><td>PSK or 802.1X</td><td>Interim fix; deprecated</td></tr>
<tr><td>WPA2 (2004, 802.11i)</td><td><b>AES-CCMP</b> (128-bit)</td><td>PSK (Personal) or 802.1X (Enterprise)</td><td>Still widely used</td></tr>
<tr><td>WPA3 (2018)</td><td>AES-CCMP 128 (Personal); GCMP-256 in 192-bit Enterprise mode</td><td><b>SAE</b> (Personal) or 802.1X (Enterprise)</td><td>Current; mandatory in 6 GHz</td></tr></table>
<p>WPA3 improves on WPA2 in four ways. <b>SAE</b> (simultaneous authentication of equals) replaces the PSK exchange, so an attacker who captures a handshake cannot run an offline dictionary attack against the passphrase, and each session gets <b>forward secrecy</b>. <b>Protected Management Frames</b> (802.11w) are mandatory. <b>WPA3-Enterprise 192-bit mode</b> uses stronger suites for sensitive networks. And <b>Enhanced Open</b> (OWE) encrypts open guest networks without any password. A WLAN in <b>transition mode</b> accepts both WPA2-PSK and WPA3-SAE clients during migration.</p>

<h3>Personal versus Enterprise</h3>
<dl class="terms">
<dt>Personal (PSK or SAE)</dt><dd>Everyone uses the same passphrase, 8 to 63 characters. For WPA2 the pairwise master key (PMK) is derived from the passphrase and the SSID, identical for every user. Simple for homes and small offices, but you cannot tell users apart, and removing one person means changing the key on every device.</dd>
<dt>Enterprise (802.1X/EAP)</dt><dd>Each user or device proves its own identity to a <b>RADIUS</b> server (UDP 1812 for authentication, 1813 for accounting). Every client gets its own PMK, access can be revoked for one person, and the server can assign a VLAN or policy per user.</dd>
</dl>
<p>802.1X has three roles, and the exam loves them:</p>
<ul>
<li><b>Supplicant</b>: the client software on the laptop or phone.</li>
<li><b>Authenticator</b>: the device that controls access, the AP and WLC. It relays EAP messages but does not decide.</li>
<li><b>Authentication server</b>: the RADIUS server (for example Cisco ISE) that checks the credentials and says accept or reject.</li>
</ul>
<p>Common EAP methods: <b>EAP-TLS</b> (certificates on both client and server, strongest), <b>PEAP</b> (server certificate plus an inner username and password, typically MSCHAPv2), <b>EAP-FAST</b> (Cisco, uses a protected access credential) and <b>EAP-TTLS</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="802.1X roles">
<rect x="10" y="60" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="85" text-anchor="middle" class="svg-ink" font-size="14">Supplicant</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">LAPTOP1</text>
<rect x="240" y="60" width="160" height="60" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="14">Authenticator</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">AP + WLC1</text>
<rect x="470" y="60" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="14">Auth server</text><text x="550" y="104" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<line x1="170" y1="90" x2="240" y2="90" stroke="#64748b" stroke-width="2"/><text x="205" y="80" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text>
<line x1="400" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><text x="435" y="80" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="435" y="140" text-anchor="middle" class="svg-muted" font-size="12">UDP 1812/1813</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">EAP runs end to end; the authenticator only relays and enforces</text>
</svg><p class="cap">802.1X: the supplicant proves its identity to the authentication server through the authenticator, which opens the port only after an Access-Accept.</p></div>

<h3>The 4-way handshake</h3>
<p>Whether the PMK came from a passphrase, SAE or 802.1X, the client and AP then run the <b>4-way handshake</b> (four EAPOL-Key messages). It proves both sides hold the same PMK without sending it, and derives the <b>PTK</b> (pairwise transient key, encrypts unicast traffic for this client) and delivers the <b>GTK</b> (group temporal key, for broadcast and multicast). If the client typed the wrong passphrase, the MIC in message 2 does not match and the handshake fails.</p>

<p>The lab WLAN uses WPA2-Personal. The controller shows the security settings without revealing the key:</p>
<pre class="out">(WLC1) &gt;show wlan 1
...
Security

   802.11 Authentication:........................ Open System
   Wi-Fi Protected Access (WPA/WPA2/WPA3)........ Enabled
      WPA2 (RSN IE).............................. Enabled
         AES Cipher.............................. Enabled
      WPA3 (SAE capable)......................... Disabled
      Auth Key Management
         802.1X.................................. Disabled
<span class="hl">         PSK..................................... Enabled</span>
         SAE..................................... Disabled
<span class="hl">   Pre-shared key................................ Set (11 characters)</span>

Security Summary................................. [WPA2][Auth(PSK)]</pre>
<p>Creating WLANs, choosing WPA2 or WPA3 and pointing them at RADIUS in the controller GUI are covered step by step in ccna-wlan.</p>

<div class="eg"><p><b>Worked example.</b> A 200-person company uses one WPA2 passphrase. Three people leave each month. With PSK, each departure means changing the key on the controller and on about 200 laptops and 200 phones, or accepting that ex-staff can still join. With 802.1X, IT disables three accounts in the directory and nothing else changes. That operational difference, more than cryptography, is why businesses choose Enterprise.</p></div>

<div class="warn"><p><b>Common mistake.</b> Relying on a hidden SSID or MAC address filtering as security. Both are trivially bypassed: the SSID appears in probe frames and MAC addresses can be copied. They are at most small extra hurdles on top of WPA2 or WPA3.</p></div>

<div class="exam"><p><b>Exam trap.</b> WPA2 = AES-CCMP; TKIP belongs to WPA; WEP uses RC4. WPA3-Personal uses SAE; PMF is mandatory in WPA3. In 802.1X the AP/WLC is the <b>authenticator</b>, not the authentication server. PSK is the same for all users; 802.1X gives per-user credentials and keys.</p></div>

<div class="scn"><h4>The ex-employee who never left the Wi-Fi</h4><p>An audit found an unknown laptop connecting to the staff WLAN every evening from the car park. It belonged to a contractor whose engagement had ended months earlier; the staff network used one WPA2 passphrase that had never been changed. The short-term fix was a new passphrase pushed to all staff devices over a weekend. The permanent fix was WPA2/WPA3-Enterprise with 802.1X and PEAP against the company directory, so access ends when an account is disabled.</p><p><b>Lesson:</b> shared keys cannot be revoked per person; use 802.1X wherever users come and go.</p></div>

<div class="iv"><p class="q">"What is the difference between WPA2-Personal and WPA2-Enterprise, and what does WPA3 add?"</p><p>Strong answer: both use AES-CCMP encryption. Personal uses one pre-shared key for everyone, with the PMK derived from the passphrase; Enterprise uses 802.1X, where the supplicant authenticates to a RADIUS server through the AP/WLC acting as authenticator, giving per-user identity, keys, revocation and policy. WPA3 replaces PSK with SAE, which resists offline dictionary attacks and adds forward secrecy, makes PMF mandatory, adds a 192-bit Enterprise mode and Enhanced Open for guest networks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security needs authentication, confidentiality (encryption) and integrity (MIC).</li>
<li>WEP and TKIP are obsolete; WPA2 uses AES-CCMP; WPA3 adds SAE, mandatory PMF, 192-bit mode and OWE.</li>
<li>Personal = one shared passphrase; Enterprise = 802.1X with per-user credentials via RADIUS.</li>
<li>802.1X roles: supplicant, authenticator (AP/WLC), authentication server (RADIUS).</li>
<li>The 4-way handshake derives the PTK and delivers the GTK; a wrong passphrase fails here.</li>
</ul></div>
`,hi:`
<p>Teen office buildings socho. Pehli ka main darwaza poora khula hai: koi bhi andar aa sakta hai (<b>open</b> network). Doosri mein ek keypad hai jiska ek code har employee jaanta hai: aasaan, par jab koi chhodta hai, to code sabke liye badalna padta hai (<b>pre-shared key</b>). Teesri mein security desk hai jo har insaan ka apna ID badge HR database se check karta hai aur kisi aur ko chhue bina ek badge cancel kar sakta hai (<b>802.1X</b>). Wi-Fi security in teen buildings ke beech ka chunaav hai, plus andar har baatcheet par lock: <b>encryption</b>.</p>

<h3>Wireless security ko kya dena chahiye</h3>
<ul>
<li><b>Authentication</b>: sirf authorised users aur devices join karein, aur clients ko pakka ho ki unhone asli network join kiya.</li>
<li><b>Confidentiality</b>: range mein koi bhi frames capture kar sakta hai, isliye data encrypted hona chahiye.</li>
<li><b>Integrity</b>: message integrity check (MIC) prove karta hai ki raaste mein frames badle nahi gaye.</li>
</ul>

<h3>WEP se WPA3 tak</h3>
<table class="cmp"><tr><th>Generation</th><th>Encryption</th><th>Authentication</th><th>Status</th></tr>
<tr><td>WEP (1999)</td><td>RC4, static 40 ya 104-bit key</td><td>Open ya shared key</td><td>Minutes mein toot jaata hai; kabhi use mat karo</td></tr>
<tr><td>WPA (2003)</td><td>TKIP (per-packet keys ke saath RC4)</td><td>PSK ya 802.1X</td><td>Beech ka jugaad; deprecated</td></tr>
<tr><td>WPA2 (2004, 802.11i)</td><td><b>AES-CCMP</b> (128-bit)</td><td>PSK (Personal) ya 802.1X (Enterprise)</td><td>Abhi bhi bahut use hota hai</td></tr>
<tr><td>WPA3 (2018)</td><td>AES-CCMP 128 (Personal); 192-bit Enterprise mode mein GCMP-256</td><td><b>SAE</b> (Personal) ya 802.1X (Enterprise)</td><td>Current; 6 GHz mein mandatory</td></tr></table>
<p>WPA3 WPA2 ko chaar tarah se behtar karta hai. <b>SAE</b> (simultaneous authentication of equals) PSK exchange ki jagah leta hai, isliye handshake capture karne wala attacker passphrase par offline dictionary attack nahi chala sakta, aur har session ko <b>forward secrecy</b> milti hai. <b>Protected Management Frames</b> (802.11w) mandatory hain. <b>WPA3-Enterprise 192-bit mode</b> sensitive networks ke liye strong suites use karta hai. Aur <b>Enhanced Open</b> (OWE) open guest networks ko bina password ke encrypt karta hai. <b>Transition mode</b> wala WLAN migration ke dauraan WPA2-PSK aur WPA3-SAE dono clients accept karta hai.</p>

<h3>Personal vs Enterprise</h3>
<dl class="terms">
<dt>Personal (PSK ya SAE)</dt><dd>Sab same passphrase use karte hain, 8 se 63 characters. WPA2 ke liye pairwise master key (PMK) passphrase aur SSID se banti hai, har user ke liye same. Ghar aur chhote offices ke liye simple, par aap users mein fark nahi kar sakte, aur ek insaan ko hatane ka matlab har device par key badalna.</dd>
<dt>Enterprise (802.1X/EAP)</dt><dd>Har user ya device apni khud ki identity ek <b>RADIUS</b> server ko prove karta hai (authentication ke liye UDP 1812, accounting ke liye 1813). Har client ko apni PMK milti hai, ek insaan ka access revoke ho sakta hai, aur server har user ke liye VLAN ya policy assign kar sakta hai.</dd>
</dl>
<p>802.1X ke teen roles hain, aur exam ko yeh bahut pasand hain:</p>
<ul>
<li><b>Supplicant</b>: laptop ya phone par client software.</li>
<li><b>Authenticator</b>: woh device jo access control karta hai, AP aur WLC. Yeh EAP messages relay karta hai par faisla nahi karta.</li>
<li><b>Authentication server</b>: RADIUS server (jaise Cisco ISE) jo credentials check karke accept ya reject kehta hai.</li>
</ul>
<p>Common EAP methods: <b>EAP-TLS</b> (client aur server dono par certificates, sabse strong), <b>PEAP</b> (server certificate plus andar username aur password, typically MSCHAPv2), <b>EAP-FAST</b> (Cisco, protected access credential use karta hai) aur <b>EAP-TTLS</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="802.1X roles">
<rect x="10" y="60" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="85" text-anchor="middle" class="svg-ink" font-size="14">Supplicant</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">LAPTOP1</text>
<rect x="240" y="60" width="160" height="60" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="14">Authenticator</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">AP + WLC1</text>
<rect x="470" y="60" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="14">Auth server</text><text x="550" y="104" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<line x1="170" y1="90" x2="240" y2="90" stroke="#64748b" stroke-width="2"/><text x="205" y="80" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text>
<line x1="400" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/><text x="435" y="80" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="435" y="140" text-anchor="middle" class="svg-muted" font-size="12">UDP 1812/1813</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">EAP end to end chalta hai; authenticator sirf relay aur enforce karta hai</text>
</svg><p class="cap">802.1X: supplicant authenticator ke through authentication server ko apni identity prove karta hai, jo Access-Accept ke baad hi port kholta hai.</p></div>

<h3>4-way handshake</h3>
<p>PMK chahe passphrase se aayi ho, SAE se ya 802.1X se, uske baad client aur AP <b>4-way handshake</b> chalate hain (chaar EAPOL-Key messages). Yeh bina bheje prove karta hai ki dono taraf same PMK hai, aur <b>PTK</b> (pairwise transient key, is client ka unicast traffic encrypt karti hai) banata hai aur <b>GTK</b> (group temporal key, broadcast aur multicast ke liye) deliver karta hai. Agar client ne galat passphrase type kiya, to message 2 ka MIC match nahi karta aur handshake fail hota hai.</p>

<p>Lab WLAN WPA2-Personal use karta hai. Controller key dikhaye bina security settings dikhata hai:</p>
<pre class="out">(WLC1) &gt;show wlan 1
...
Security

   802.11 Authentication:........................ Open System
   Wi-Fi Protected Access (WPA/WPA2/WPA3)........ Enabled
      WPA2 (RSN IE).............................. Enabled
         AES Cipher.............................. Enabled
      WPA3 (SAE capable)......................... Disabled
      Auth Key Management
         802.1X.................................. Disabled
<span class="hl">         PSK..................................... Enabled</span>
         SAE..................................... Disabled
<span class="hl">   Pre-shared key................................ Set (11 characters)</span>

Security Summary................................. [WPA2][Auth(PSK)]</pre>
<p>Controller GUI mein WLANs banana, WPA2 ya WPA3 chunna aur unhe RADIUS ki taraf point karna ccna-wlan mein step by step aata hai.</p>

<div class="eg"><p><b>Worked example.</b> 200 logon ki company ek WPA2 passphrase use karti hai. Har mahine teen log chhodte hain. PSK ke saath har departure ka matlab controller par aur lagbhag 200 laptops aur 200 phones par key badalna, ya maan lena ki purana staff abhi bhi join kar sakta hai. 802.1X ke saath IT directory mein teen accounts disable karta hai aur kuch aur nahi badalta. Cryptography se zyada yahi operational fark wajah hai ki businesses Enterprise chunte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Hidden SSID ya MAC address filtering ko security maanna. Dono aasaani se bypass hote hain: SSID probe frames mein dikhta hai aur MAC addresses copy kiye ja sakte hain. Yeh zyada se zyada WPA2 ya WPA3 ke upar chhoti extra rukaavatein hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> WPA2 = AES-CCMP; TKIP WPA ka hai; WEP RC4 use karta hai. WPA3-Personal SAE use karta hai; WPA3 mein PMF mandatory hai. 802.1X mein AP/WLC <b>authenticator</b> hai, authentication server nahi. PSK sab users ke liye same hai; 802.1X per-user credentials aur keys deta hai.</p></div>

<div class="scn"><h4>Woh ex-employee jo kabhi Wi-Fi se nahi gaya</h4><p>Ek audit mein ek anjaan laptop mila jo har shaam car park se staff WLAN se connect hota tha. Woh ek contractor ka tha jiska kaam mahino pehle khatam ho chuka tha; staff network ek WPA2 passphrase use karta tha jo kabhi badla nahi gaya tha. Short-term fix tha weekend par saare staff devices par naya passphrase push karna. Permanent fix tha company directory ke against 802.1X aur PEAP ke saath WPA2/WPA3-Enterprise, taaki account disable hote hi access khatam ho.</p><p><b>Seekh:</b> shared keys ko per person revoke nahi kar sakte; jahan users aate jaate hain wahan 802.1X use karo.</p></div>

<div class="iv"><p class="q">"WPA2-Personal aur WPA2-Enterprise mein kya fark hai, aur WPA3 kya jodta hai?"</p><p>Strong answer: dono AES-CCMP encryption use karte hain. Personal sabke liye ek pre-shared key use karta hai, PMK passphrase se banti hai; Enterprise 802.1X use karta hai, jahan supplicant authenticator bane AP/WLC ke through RADIUS server ko authenticate karta hai, jisse per-user identity, keys, revocation aur policy milti hai. WPA3 PSK ki jagah SAE laata hai, jo offline dictionary attacks jhelta hai aur forward secrecy deta hai, PMF mandatory karta hai, 192-bit Enterprise mode aur guest networks ke liye Enhanced Open jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security ko authentication, confidentiality (encryption) aur integrity (MIC) chahiye.</li>
<li>WEP aur TKIP obsolete hain; WPA2 AES-CCMP use karta hai; WPA3 SAE, mandatory PMF, 192-bit mode aur OWE jodta hai.</li>
<li>Personal = ek shared passphrase; Enterprise = RADIUS ke through per-user credentials ke saath 802.1X.</li>
<li>802.1X roles: supplicant, authenticator (AP/WLC), authentication server (RADIUS).</li>
<li>4-way handshake PTK banata hai aur GTK deliver karta hai; galat passphrase yahin fail hota hai.</li>
</ul></div>
`}};export{e as default};