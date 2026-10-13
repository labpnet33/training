var e={id:`big-picture`,h:{en:`WLAN security: what you will learn and the big picture`,hi:`WLAN security: aap kya seekhoge aur big picture`},body:{en:`
<h3>What you will learn</h3>
<p>Wi-Fi travels through the air, so anybody standing in the car park can hear every frame. Security is the set of rules that decides who may join the radio network and what keeps the data private after they join. By the end of this module you will be able to explain the Wi-Fi security generations, rotate a pre-shared key safely, build an 802.1X enterprise WLAN on a Catalyst 9800-style controller with a RADIUS server, and troubleshoot a RADIUS shared-secret mismatch from controller evidence.</p>
<ul>
<li>Open, WPA2, WPA3, PSK, SAE and PMF, and what each one protects.</li>
<li>The 4-way handshake and why a passphrase is never sent over the air.</li>
<li>802.1X roles (supplicant, authenticator, authentication server), EAP methods, RADIUS and AAA method lists on IOS XE.</li>
<li>Three labs: <code>wl-psk-rotate</code>, <code>wl-dot1x-build</code> and <code>wl-radius-key</code>.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> You should have finished the earlier modules: the 9800 object model (WLAN profile, policy profile, policy tag, AP tags) and AP join. We reuse those objects here and do not re-teach them. If a term such as policy tag is unclear, go back to the first module.</p></div>

<h3>Analogy: an office building with three kinds of door</h3>
<p>Imagine an office building. A <b>public lobby</b> has no lock: anyone walks in (an open WLAN). A <b>shared keypad door</b> uses one code that every employee knows (a pre-shared key, PSK). Cheap and simple, but when one person leaves you must change the code for everybody. A <b>badge reader</b> checks each person's own card against the HR database (802.1X with RADIUS). Everybody has an individual identity, so you can remove one person without disturbing the others. The guard who reads the badge does not keep the database; he phones the security office and gets a yes or no. That guard is the controller, and the security office is the RADIUS server.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three security models">
<rect x="20" y="30" width="180" height="120" rx="10" fill="#e2e8f0"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="14">Open</text>
<text x="110" y="85" text-anchor="middle" class="svg-muted" font-size="12">No password</text><text x="110" y="105" text-anchor="middle" class="svg-muted" font-size="12">No encryption (or OWE)</text><text x="110" y="125" text-anchor="middle" class="svg-muted" font-size="12">Guest SSID</text>
<rect x="230" y="30" width="180" height="120" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">Personal (PSK / SAE)</text>
<text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">One shared passphrase</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">Staff, voice handsets</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Lab: NK-STAFF</text>
<rect x="440" y="30" width="180" height="120" rx="10" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="14">Enterprise (802.1X)</text>
<text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">Per-user identity</text><text x="530" y="105" text-anchor="middle" class="svg-muted" font-size="12">RADIUS decides</text><text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">Lab: NK-CORP</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">Weakest to strongest control of who joins</text>
</svg><p class="cap">Three models cover almost every SSID you will ever build.</p></div>

<h3>Where security sits in the 9800 object model</h3>
<p>On the Catalyst 9800 everything about <i>who may join and how frames are protected</i> lives in the <b>WLAN profile</b>. The policy profile decides the VLAN and the policy tag ties them together, but security belongs to the WLAN. That is why, in our labs, you edit security under <code>wlan NK-STAFF</code> and <code>wlan NK-CORP</code> and never under the policy profile.</p>
<table class="cmp"><tr><th>Lab object</th><th>Security type</th><th>Detail</th></tr>
<tr><td>NK-STAFF (id 1)</td><td>WPA2-PSK</td><td>Passphrase rotated to NkStaff2025</td></tr>
<tr><td>NK-CORP (id 2)</td><td>WPA2-Enterprise</td><td>authentication-list NK-DOT1X, RADIUS RAD1</td></tr>
<tr><td>NK-GUEST (id 3)</td><td>Open</td><td>Isolated in VLAN 50</td></tr>
<tr><td>NK-VOICE (id 4)</td><td>WPA2-PSK</td><td>Key NkVoice2024, VLAN 30</td></tr></table>

<h3>What is simulated and what is concept only</h3>
<p>Our lab engine models the controller configuration, the RADIUS exchange outcome and the client result (joined with a VLAN, or rejected). It does <b>not</b> model real EAP-TLS certificates, certificate chains, 802.11r fast roaming, web authentication portals or posture checking. Coming up: wl-secure (Advanced security) for web auth, ISE, CoA and EAP types, and wl-mobility (Mobility and high availability) for 802.11r/k/v. We teach those honestly as concepts and mark them <b>not simulated in the lab</b>.</p>
<div class="eg"><p><b>Worked example.</b> A company has 120 staff, 40 voice handsets and visitors. A sensible design is NK-CORP (802.1X) for staff laptops, NK-VOICE (PSK) for handsets that cannot do 802.1X, and NK-GUEST (open, isolated) for visitors. Each SSID maps to its own policy profile and VLAN.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating a hidden SSID as security. Hiding the name (no broadcast-ssid) only removes the name from beacons. It is not encryption and any tool reveals it. Real protection is the authentication and cipher.</p></div>

<div class="scn"><h4>The ex-employee and the shared password</h4><p>A staff member leaves a company that uses one PSK for all 200 staff. The security team realises that the leaver still knows the key and can sit outside the office and connect. They must change the key on the WLAN and re-enter it on every device. It takes two days. The same company later moves staff laptops to 802.1X, and removing one account in the directory is enough.</p><p><b>Lesson:</b> PSK is a shared secret, so its lifetime is tied to the person who knows it. Individual credentials scale better.</p></div>
<div class="iv"><p class="q">"What is the difference between WPA2-Personal and WPA2-Enterprise?"</p><p>Personal uses one shared passphrase on the WLAN and every client derives keys from it. Enterprise uses 802.1X with EAP and a RADIUS server, so each user or device has its own credential and the controller never sees the password. Mention revocation, auditing and that enterprise needs an authentication server.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three models: open, personal (PSK or SAE) and enterprise (802.1X).</li>
<li>On the 9800, security is configured in the WLAN profile.</li>
<li>PSK shares one secret; 802.1X gives each user an identity.</li>
<li>Hiding an SSID is not security.</li>
<li>EAP-TLS certificates, 802.11r and web auth are concept only in our labs.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Wi-Fi hawa mein travel karta hai, isliye car park mein khada koi bhi insaan har frame sun sakta hai. Security woh rules ka set hai jo decide karta hai ki radio network mein kaun join kar sakta hai aur join ke baad data private kaise rehta hai. Is module ke end tak aap Wi-Fi security generations explain kar paoge, pre-shared key safely rotate kar paoge, Catalyst 9800-style controller par RADIUS server ke saath 802.1X enterprise WLAN build kar paoge, aur controller evidence se RADIUS shared-secret mismatch troubleshoot kar paoge.</p>
<ul>
<li>Open, WPA2, WPA3, PSK, SAE aur PMF, aur har ek kya protect karta hai.</li>
<li>4-way handshake aur passphrase kabhi air par kyun nahi bheja jaata.</li>
<li>802.1X roles (supplicant, authenticator, authentication server), EAP methods, RADIUS aur IOS XE par AAA method lists.</li>
<li>Teen labs: <code>wl-psk-rotate</code>, <code>wl-dot1x-build</code> aur <code>wl-radius-key</code>.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> Aapne pichle modules complete kiye hone chahiye: 9800 object model (WLAN profile, policy profile, policy tag, AP tags) aur AP join. Hum yahan wahi objects reuse karte hain, dobara nahi padhate. Agar policy tag jaisa term clear nahi hai to pehle module par wapas jao.</p></div>

<h3>Analogy: office building ke teen tarah ke darwaze</h3>
<p>Ek office building socho. <b>Public lobby</b> mein koi lock nahi: koi bhi andar aa sakta hai (open WLAN). <b>Shared keypad door</b> ek code use karta hai jo har employee ko pata hai (pre-shared key, PSK). Sasta aur simple, lekin ek banda chhodke jaye to code sabke liye badalna padta hai. <b>Badge reader</b> har insaan ka apna card HR database se check karta hai (RADIUS ke saath 802.1X). Har kisi ki individual identity hai, to ek ko hata sakte ho baaki ko disturb kiye bina. Badge padhne wala guard database nahi rakhta; woh security office ko phone karke yes ya no leta hai. Woh guard controller hai aur security office RADIUS server hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three security models">
<rect x="20" y="30" width="180" height="120" rx="10" fill="#e2e8f0"/><text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="14">Open</text>
<text x="110" y="85" text-anchor="middle" class="svg-muted" font-size="12">Koi password nahi</text><text x="110" y="105" text-anchor="middle" class="svg-muted" font-size="12">Encryption nahi (ya OWE)</text><text x="110" y="125" text-anchor="middle" class="svg-muted" font-size="12">Guest SSID</text>
<rect x="230" y="30" width="180" height="120" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">Personal (PSK / SAE)</text>
<text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">Ek shared passphrase</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">Staff, voice handsets</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Lab: NK-STAFF</text>
<rect x="440" y="30" width="180" height="120" rx="10" fill="#bbf7d0"/><text x="530" y="58" text-anchor="middle" class="svg-ink" font-size="14">Enterprise (802.1X)</text>
<text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">Per-user identity</text><text x="530" y="105" text-anchor="middle" class="svg-muted" font-size="12">RADIUS decide karta hai</text><text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">Lab: NK-CORP</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">Kaun join kare: kamzor se strongest control</text>
</svg><p class="cap">Teen models lagbhag har SSID cover kar lete hain jo aap kabhi banaoge.</p></div>

<h3>9800 object model mein security kahan baithti hai</h3>
<p>Catalyst 9800 par <i>kaun join karega aur frames kaise protect honge</i> yeh sab <b>WLAN profile</b> mein hota hai. Policy profile VLAN decide karta hai aur policy tag sabko jodta hai, lekin security WLAN ki hoti hai. Isiliye hamari labs mein security <code>wlan NK-STAFF</code> aur <code>wlan NK-CORP</code> ke andar edit karte ho, policy profile mein kabhi nahi.</p>
<table class="cmp"><tr><th>Lab object</th><th>Security type</th><th>Detail</th></tr>
<tr><td>NK-STAFF (id 1)</td><td>WPA2-PSK</td><td>Passphrase NkStaff2025 mein rotate hota hai</td></tr>
<tr><td>NK-CORP (id 2)</td><td>WPA2-Enterprise</td><td>authentication-list NK-DOT1X, RADIUS RAD1</td></tr>
<tr><td>NK-GUEST (id 3)</td><td>Open</td><td>VLAN 50 mein isolated</td></tr>
<tr><td>NK-VOICE (id 4)</td><td>WPA2-PSK</td><td>Key NkVoice2024, VLAN 30</td></tr></table>

<h3>Kya simulated hai aur kya sirf concept</h3>
<p>Hamara lab engine controller configuration, RADIUS exchange ka outcome aur client ka result (VLAN ke saath joined, ya rejected) model karta hai. Yeh real EAP-TLS certificates, certificate chains, 802.11r fast roaming, web authentication portals ya posture checking model <b>nahi</b> karta. Aage aane wale: wl-secure (Advanced security) web auth, ISE, CoA aur EAP types ke liye, aur wl-mobility (Mobility and high availability) 802.11r/k/v ke liye. Hum inhe concept ki tarah imaandari se padhate hain aur <b>not simulated in the lab</b> mark karte hain.</p>
<div class="eg"><p><b>Worked example.</b> Ek company mein 120 staff, 40 voice handsets aur visitors hain. Achha design: staff laptops ke liye NK-CORP (802.1X), un handsets ke liye NK-VOICE (PSK) jo 802.1X nahi kar sakte, aur visitors ke liye NK-GUEST (open, isolated). Har SSID apne policy profile aur VLAN se map hota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Hidden SSID ko security samajhna. Naam hide karna (broadcast-ssid band) sirf beacons se naam hatata hai. Yeh encryption nahi hai aur koi bhi tool use reveal kar deta hai. Asli protection authentication aur cipher hai.</p></div>

<div class="scn"><h4>Ex-employee aur shared password</h4><p>Ek company 200 staff ke liye ek hi PSK use karti hai. Ek staff member jaata hai. Security team ko samajh aata hai ki leaver ko key abhi bhi pata hai aur woh office ke bahar baithkar connect kar sakta hai. Unhe WLAN par key badalni padti hai aur har device par dobara enter karni padti hai. Do din lagte hain. Baad mein company staff laptops ko 802.1X par le jaati hai aur ek account directory se hatana kaafi hota hai.</p><p><b>Lesson:</b> PSK shared secret hai, to uski life us insaan se bandhi hai jise woh pata hai. Individual credentials better scale karte hain.</p></div>
<div class="iv"><p class="q">"WPA2-Personal aur WPA2-Enterprise mein kya difference hai?"</p><p>Personal WLAN par ek shared passphrase use karta hai aur har client usse keys derive karta hai. Enterprise 802.1X, EAP aur RADIUS server use karta hai, to har user ya device ka apna credential hota hai aur controller password kabhi nahi dekhta. Revocation, auditing aur yeh bhi bolo ki enterprise ko authentication server chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen models: open, personal (PSK ya SAE) aur enterprise (802.1X).</li>
<li>9800 par security WLAN profile mein configure hoti hai.</li>
<li>PSK ek secret share karta hai; 802.1X har user ko identity deta hai.</li>
<li>SSID hide karna security nahi hai.</li>
<li>EAP-TLS certificates, 802.11r aur web auth hamari labs mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};