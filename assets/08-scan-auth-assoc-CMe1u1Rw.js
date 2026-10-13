var e={id:`scan-auth-assoc`,h:{en:`Joining Wi-Fi: scan, authenticate, associate, then roam`,hi:`Wi-Fi join karna: scan, authenticate, associate, phir roam`},body:{en:`
<p>When you tap a network name on your phone, a short, strict conversation happens in about a tenth of a second. Each step can fail for a different reason, so knowing the order tells you where to look. This chapter follows one client, LAPTOP1, from "no network" to "online".</p>

<h3>Analogy: entering an office building</h3>
<p>You first look for the building (scan). At reception you show that you are a real visitor (802.11 authentication, a formality). You get a visitor badge and a desk number (association, with an association ID). Then security checks your real identity or password (WPA2/WPA3 key handshake or 802.1X). Only after that can you walk the corridors (data).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Client states">
<rect x="20" y="20" width="160" height="60" rx="8" fill="#e2e8f0"/><text x="100" y="45" text-anchor="middle" class="svg-ink" font-size="13">State 1</text><text x="100" y="65" text-anchor="middle" class="svg-muted" font-size="12">not authenticated, not associated</text>
<rect x="240" y="20" width="160" height="60" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">State 2</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">authenticated, not associated</text>
<rect x="460" y="20" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="13">State 3</text><text x="540" y="65" text-anchor="middle" class="svg-muted" font-size="12">authenticated and associated</text>
<line x1="180" y1="50" x2="238" y2="50" stroke="#64748b" stroke-width="2"/><text x="209" y="40" text-anchor="middle" class="svg-muted" font-size="11">Auth</text>
<line x1="400" y1="50" x2="458" y2="50" stroke="#64748b" stroke-width="2"/><text x="429" y="40" text-anchor="middle" class="svg-muted" font-size="11">Assoc</text>
<rect x="460" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="540" y="142" text-anchor="middle" class="svg-ink" font-size="13">4-way handshake</text><text x="540" y="160" text-anchor="middle" class="svg-muted" font-size="12">keys installed, port open</text>
<line x1="540" y1="80" x2="540" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="20" y="130" class="svg-muted" font-size="12">Deauthentication: back to State 1</text><text x="20" y="150" class="svg-muted" font-size="12">Disassociation: back to State 2</text>
<text x="20" y="200" class="svg-muted" font-size="12">Before State 3: scan (passive or active) finds the AP and its rates</text>
<text x="20" y="225" class="svg-muted" font-size="12">After State 3: DHCP, then user traffic</text>
</svg><p class="cap">The 802.11 state machine. Security (4-way handshake or 802.1X) happens after association in WPA2; WPA3-SAE adds its exchange in the authentication step.</p></div>

<h3>Step 1: scanning</h3>
<p><b>Passive scanning</b>: the client listens on each channel for beacons, waiting about one beacon interval (about 100 ms). <b>Active scanning</b>: the client sends a <b>probe request</b> (broadcast or naming an SSID) and waits for <b>probe responses</b>. Active scanning is faster. DFS channels (chapter 4) allow only passive scanning until the client hears an AP there, and 6 GHz uses PSC channels, RNR and FILS or unsolicited probe responses (chapter 6). A hidden SSID does not appear in beacons, so the client must probe by name, which reveals the name to anyone listening; hiding is not security.</p>
<p>The client ranks what it found by signal and band, and it prefers 5 GHz when it is strong enough. In this simulator a client prefers 5 GHz when the signal is at least -70 dBm and cannot use an AP at all below the cell edge of its lowest mandatory rate (chapter 9).</p>
<pre class="out">LAPTOP1&gt; wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
NK-STAFF          0011.2233.4401     5 GHz   36   -61 dBm  WPA2-PSK              AP1
NK-STAFF          0011.2233.4400     2.4 GHz 6    -55 dBm  WPA2-PSK              AP1
NK-IOT            0011.2233.4402     2.4 GHz 6    -56 dBm  WPA2-PSK              AP1</pre>
<p>Sample output (your values differ). The same SSID appears once per band, each with its own BSSID, which is the radio MAC.</p>

<h3>Step 2: 802.11 authentication</h3>
<p>Two frames, <b>Open System</b> authentication, which always succeeds when the AP is willing: it only moves the client to State 2. It is not the security step. (Old WEP shared-key authentication is obsolete.) With WPA3-Personal the authentication frames carry the <b>SAE</b> (Simultaneous Authentication of Equals) exchange, which proves both sides know the password without sending anything that allows offline guessing.</p>

<h3>Step 3: association</h3>
<p>The client sends an <b>Association Request</b> with its SSID, supported rates and capabilities (HT, VHT, HE, EHT, security suites). The AP answers with a <b>status code</b> and, on success, an <b>Association ID (AID)</b>. Common status codes:</p>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Typical fix</th></tr>
<tr><td>0</td><td>Successful</td><td>-</td></tr>
<tr><td>1</td><td>Unspecified failure</td><td>Check controller logs</td></tr>
<tr><td>17</td><td>AP cannot handle more associated stations</td><td>Client limit, capacity, add AP</td></tr>
<tr><td>18</td><td>Client does not support all basic (mandatory) rates</td><td>Review mandatory rates; old clients may not support the new set</td></tr></table>
<p>Code 18 is the one that links directly to this module: if you disable all low rates and the remaining mandatory rate is higher than a legacy client supports, that client cannot associate. This is why a "no b clients" change is also a policy decision.</p>

<h3>Step 4: security handshake</h3>
<p>For WPA2-PSK or WPA3 the AP and client run the <b>4-way handshake</b> (EAPOL-Key messages) to derive the keys. For WPA2/WPA3-Enterprise the 802.1X exchange with RADIUS (taught in ccna-wlan and wl-security) happens first. Typical <b>deauthentication reason codes</b> you see afterwards: 15 (4-way handshake timeout, usually a wrong password), 23 (802.1X authentication failed), 4 (disassociated due to inactivity) and 3 (the station is leaving).</p>

<h3>Step 5: DHCP, and the controller view</h3>
<p>After keys are installed the client asks for an IP address. The controller places the client on the VLAN of the policy profile (the WLAN-to-policy mapping from your policy tag). If the client associates but gets no IP, the WLAN works and the problem is VLAN or DHCP, not RF.</p>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 0011.2233.4401
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -61 dBm
Security    : WPA2-PSK
IP address  : 10.10.20.51/24 (DHCP)</pre>

<h3>Roaming: associating to another AP</h3>
<p>When the signal falls, the client decides to move and sends a <b>Reassociation Request</b> to a new AP with the same SSID. The client, not the AP, decides when to roam. Helpers exist: <b>802.11k</b> (neighbour list), <b>802.11v</b> (the network suggests a better AP) and <b>802.11r</b> (fast transition, saves the key handshake time, for voice). These are concept only here and are covered in the wl-roaming and wl-mobility modules.</p>

<div class="warn"><p><b>Common mistake.</b> Calling the Open System authentication step "security". A network with WPA2 still uses open-system authentication frames; the real check is the 4-way handshake after association.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order: probe, authentication, association, then 4-way handshake (WPA2/WPA3 personal) or 802.1X first (enterprise), then DHCP. Reassociation (not association) is used when roaming inside the same ESS.</p></div>

<div class="scn"><h4>Everyone gets "can't connect" after the password change</h4><p>After a PSK change, laptops stuck at "connecting" while phones with the new key worked. The controller log showed deauthentication reason 15 for the stuck laptops: 4-way handshake timeout, because they still tried the old saved key. Forgetting the saved network and re-entering the key fixed them.</p><p><b>Lesson:</b> a handshake timeout is nearly always a wrong key, not an RF problem. Do not touch channels.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a client connects to a WPA2-PSK network."</p><p>Strong answer: scan (passive or active probing), Open System authentication, association request and response with capabilities, then the 4-way EAPOL handshake that derives the keys, then DHCP. Mention status and reason codes (17, 18, 15, 23) and that the controller assigns the VLAN from the policy profile.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: scan, authentication, association, security handshake (4-way or 802.1X), DHCP.</li>
<li>Open System authentication is a formality; WPA3-SAE reuses the authentication frames for a real exchange.</li>
<li>Status code 17 means the AP is full; status 18 means the client lacks a mandatory rate; reason 15 is a 4-way timeout.</li>
<li>Passive scanning listens for beacons; active scanning sends probe requests; hidden SSIDs are not security.</li>
<li>The client decides when to roam, using reassociation; 802.11k, v and r help it.</li>
</ul></div>
`,hi:`
<p>Phone par network ka naam tap karte ho to lagbhag ek second ke dasve hisse mein ek chhoti, sakht baatcheet hoti hai. Har step alag wajah se fail ho sakta hai, isliye order jaanna batata hai ki kahan dekhna hai. Yeh chapter ek client, LAPTOP1, ko "no network" se "online" tak follow karta hai.</p>

<h3>Analogy: office building mein jaana</h3>
<p>Pehle aap building dhoondhte ho (scan). Reception par dikhate ho ki aap asli visitor ho (802.11 authentication, ek formality). Aapko visitor badge aur desk number milta hai (association, association ID ke saath). Phir security aapki asli identity ya password check karti hai (WPA2/WPA3 key handshake ya 802.1X). Uske baad hi aap corridors mein chal sakte ho (data).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Client states">
<rect x="20" y="20" width="160" height="60" rx="8" fill="#e2e8f0"/><text x="100" y="45" text-anchor="middle" class="svg-ink" font-size="13">State 1</text><text x="100" y="65" text-anchor="middle" class="svg-muted" font-size="12">not authenticated, not associated</text>
<rect x="240" y="20" width="160" height="60" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">State 2</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">authenticated, not associated</text>
<rect x="460" y="20" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="13">State 3</text><text x="540" y="65" text-anchor="middle" class="svg-muted" font-size="12">authenticated aur associated</text>
<line x1="180" y1="50" x2="238" y2="50" stroke="#64748b" stroke-width="2"/><text x="209" y="40" text-anchor="middle" class="svg-muted" font-size="11">Auth</text>
<line x1="400" y1="50" x2="458" y2="50" stroke="#64748b" stroke-width="2"/><text x="429" y="40" text-anchor="middle" class="svg-muted" font-size="11">Assoc</text>
<rect x="460" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="540" y="142" text-anchor="middle" class="svg-ink" font-size="13">4-way handshake</text><text x="540" y="160" text-anchor="middle" class="svg-muted" font-size="12">keys install, port open</text>
<line x1="540" y1="80" x2="540" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="20" y="130" class="svg-muted" font-size="12">Deauthentication: wapas State 1</text><text x="20" y="150" class="svg-muted" font-size="12">Disassociation: wapas State 2</text>
<text x="20" y="200" class="svg-muted" font-size="12">State 3 se pehle: scan (passive ya active) AP aur uske rates dhoondhta hai</text>
<text x="20" y="225" class="svg-muted" font-size="12">State 3 ke baad: DHCP, phir user traffic</text>
</svg><p class="cap">802.11 state machine. WPA2 mein security (4-way handshake ya 802.1X) association ke baad hoti hai; WPA3-SAE apna exchange authentication step mein jodta hai.</p></div>

<h3>Step 1: scanning</h3>
<p><b>Passive scanning</b>: client har channel par beacons sunta hai, lagbhag ek beacon interval (lagbhag 100 ms) ruk kar. <b>Active scanning</b>: client <b>probe request</b> bhejta hai (broadcast ya SSID naam ke saath) aur <b>probe responses</b> ka intezaar karta hai. Active scanning tez hai. DFS channels (chapter 4) par jab tak client wahan AP na sun le sirf passive scanning allowed hai, aur 6 GHz PSC channels, RNR aur FILS ya unsolicited probe responses use karta hai (chapter 6). Hidden SSID beacons mein nahi aata, isliye client ko naam se probe karna padta hai, jisse sunne wale ko naam pata chal jaata hai; hide karna security nahi hai.</p>
<p>Client jo mila use signal aur band se rank karta hai, aur jab 5 GHz kaafi strong ho to use prefer karta hai. Is simulator mein client tab 5 GHz prefer karta hai jab signal kam se kam -70 dBm ho, aur apne lowest mandatory rate ke cell edge se neeche AP use hi nahi kar sakta (chapter 9).</p>
<pre class="out">LAPTOP1&gt; wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
NK-STAFF          0011.2233.4401     5 GHz   36   -61 dBm  WPA2-PSK              AP1
NK-STAFF          0011.2233.4400     2.4 GHz 6    -55 dBm  WPA2-PSK              AP1
NK-IOT            0011.2233.4402     2.4 GHz 6    -56 dBm  WPA2-PSK              AP1</pre>
<p>Sample output (aapke values alag honge). Wahi SSID har band par ek baar dikhta hai, har ek ke apne BSSID ke saath, jo radio MAC hai.</p>

<h3>Step 2: 802.11 authentication</h3>
<p>Do frames, <b>Open System</b> authentication, jo hamesha succeed hota hai jab AP tayyar ho: yeh sirf client ko State 2 mein le jaata hai. Yeh security step nahi hai. (Purana WEP shared-key authentication obsolete hai.) WPA3-Personal ke saath authentication frames <b>SAE</b> (Simultaneous Authentication of Equals) exchange carry karte hain, jo dikhata hai ki dono taraf password jaante hain bina kuch aisa bheje jisse offline guessing ho sake.</p>

<h3>Step 3: association</h3>
<p>Client <b>Association Request</b> bhejta hai apne SSID, supported rates aur capabilities (HT, VHT, HE, EHT, security suites) ke saath. AP <b>status code</b> ke saath jawab deta hai aur success par <b>Association ID (AID)</b> deta hai. Common status codes:</p>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Typical fix</th></tr>
<tr><td>0</td><td>Successful</td><td>-</td></tr>
<tr><td>1</td><td>Unspecified failure</td><td>Controller logs check karo</td></tr>
<tr><td>17</td><td>AP aur associated stations handle nahi kar sakta</td><td>Client limit, capacity, AP jodo</td></tr>
<tr><td>18</td><td>Client saare basic (mandatory) rates support nahi karta</td><td>Mandatory rates review karo; purane clients naye set ko support na karein</td></tr></table>
<p>Code 18 woh hai jo seedha is module se judta hai: agar aap saare low rates disable kar do aur bacha hua mandatory rate legacy client ke support se zyada ho, to woh client associate nahi kar sakta. Isliye "no b clients" badlav ek policy decision bhi hai.</p>

<h3>Step 4: security handshake</h3>
<p>WPA2-PSK ya WPA3 ke liye AP aur client keys nikalne ke liye <b>4-way handshake</b> (EAPOL-Key messages) chalate hain. WPA2/WPA3-Enterprise ke liye RADIUS ke saath 802.1X exchange (ccna-wlan aur wl-security mein sikhaya jaata hai) pehle hota hai. Baad mein jo <b>deauthentication reason codes</b> dikhte hain: 15 (4-way handshake timeout, aam taur par galat password), 23 (802.1X authentication failed), 4 (inactivity ki wajah se disassociated) aur 3 (station chhod raha hai).</p>

<h3>Step 5: DHCP, aur controller ka view</h3>
<p>Keys install hone ke baad client IP address maangta hai. Controller client ko policy profile ke VLAN par rakhta hai (aapke policy tag ka WLAN-to-policy mapping). Agar client associate ho gaya lekin IP nahi mila, to WLAN theek hai aur problem VLAN ya DHCP ki hai, RF ki nahi.</p>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 0011.2233.4401
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -61 dBm
Security    : WPA2-PSK
IP address  : 10.10.20.51/24 (DHCP)</pre>

<h3>Roaming: dusre AP se associate hona</h3>
<p>Signal girta hai to client move karne ka faisla karta hai aur same SSID wale naye AP ko <b>Reassociation Request</b> bhejta hai. Roam kab karna hai yeh client tay karta hai, AP nahi. Madadgar maujood hain: <b>802.11k</b> (neighbour list), <b>802.11v</b> (network behtar AP suggest karta hai) aur <b>802.11r</b> (fast transition, key handshake ka time bachata hai, voice ke liye). Yeh yahan concept only hain aur wl-roaming aur wl-mobility modules mein cover hote hain.</p>

<div class="warn"><p><b>Common galti.</b> Open System authentication step ko "security" kehna. WPA2 wale network mein bhi open-system authentication frames use hote hain; asli check association ke baad ka 4-way handshake hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order: probe, authentication, association, phir 4-way handshake (WPA2/WPA3 personal) ya pehle 802.1X (enterprise), phir DHCP. Same ESS ke andar roam karte waqt reassociation (association nahi) use hota hai.</p></div>

<div class="scn"><h4>Password badalne ke baad sab ko "can't connect"</h4><p>PSK badalne ke baad laptops "connecting" par atke rahe jabki naya key wale phones chale. Controller log mein atke hue laptops ke liye deauthentication reason 15 dikha: 4-way handshake timeout, kyunki woh abhi bhi purana saved key try kar rahe the. Saved network forget karke key dobara daalne se theek ho gaye.</p><p><b>Seekh:</b> handshake timeout lagbhag hamesha galat key hota hai, RF problem nahi. Channels ko mat chhedo.</p></div>

<div class="iv"><p class="q">"Jab client WPA2-PSK network se connect hota hai to kya hota hai, samjhao."</p><p>Strong answer: scan (passive ya active probing), Open System authentication, capabilities ke saath association request aur response, phir 4-way EAPOL handshake jo keys nikalta hai, phir DHCP. Status aur reason codes (17, 18, 15, 23) batao aur yeh ki controller policy profile se VLAN assign karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: scan, authentication, association, security handshake (4-way ya 802.1X), DHCP.</li>
<li>Open System authentication formality hai; WPA3-SAE authentication frames ko asli exchange ke liye use karta hai.</li>
<li>Status code 17 matlab AP full hai; status 18 matlab client ke paas mandatory rate nahi; reason 15 4-way timeout hai.</li>
<li>Passive scanning beacons sunti hai; active scanning probe requests bhejti hai; hidden SSIDs security nahi hain.</li>
<li>Roam kab karna hai client tay karta hai, reassociation se; 802.11k, v aur r madad karte hain.</li>
</ul></div>
`}};export{e as default};