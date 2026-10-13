var e={id:`wpa-generations`,h:{en:`WEP to WPA3: ciphers, SAE, PMF and the 4-way handshake`,hi:`WEP se WPA3 tak: ciphers, SAE, PMF aur 4-way handshake`},body:{en:`
<p>Wi-Fi security has changed several times because older designs were broken. As an engineer you must know which generation is acceptable today, which cipher it uses and what the client and controller actually exchange. This chapter is theory you will use in every later chapter.</p>

<h3>The generations in one table</h3>
<table class="cmp"><tr><th>Generation</th><th>Cipher / key method</th><th>Status</th></tr>
<tr><td>WEP</td><td>RC4, static key</td><td>Broken. Never use.</td></tr>
<tr><td>WPA (TKIP)</td><td>RC4 with per-packet mixing</td><td>Deprecated. Legacy only.</td></tr>
<tr><td>WPA2</td><td>AES-CCMP (128-bit), PSK or 802.1X</td><td>Standard today, still very common.</td></tr>
<tr><td>WPA3-Personal</td><td>AES-CCMP or GCMP-256, SAE instead of PSK</td><td>Current. Protects against offline dictionary attacks.</td></tr>
<tr><td>WPA3-Enterprise</td><td>802.1X, optional 192-bit mode (GCMP-256)</td><td>Current. PMF is mandatory.</td></tr>
<tr><td>OWE (Enhanced Open)</td><td>Opportunistic encryption, no password</td><td>For open guest networks that still want encryption.</td></tr></table>
<p><b>CCMP</b> is the AES-based encryption and integrity mechanism of WPA2. <b>GCMP</b> is a faster, stronger AES mode used by WPA3 192-bit. <b>TKIP</b> is the old stop-gap that patched WEP hardware. On a 9800 you normally enable only <code>ciphers aes</code>.</p>

<h3>PSK: how a passphrase becomes a key</h3>
<p>A WPA2-Personal passphrase is 8 to 63 ASCII characters. Both sides compute the <b>PMK</b> (pairwise master key) from the passphrase and the SSID name using a standard function (PBKDF2 with 4096 rounds). The passphrase itself is never sent. Because the SSID is part of the calculation, the same passphrase on two different SSIDs gives different PMKs.</p>

<h3>The 4-way handshake</h3>
<p>Once both sides hold a PMK (from PSK, or from 802.1X in the next chapters), they run the <b>4-way handshake</b>. It proves that both ends know the PMK without revealing it and derives a fresh <b>PTK</b> (pairwise transient key) for this session.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="4-way handshake">
<rect x="40" y="20" width="130" height="36" rx="8" fill="#bae6fd"/><text x="105" y="43" text-anchor="middle" class="svg-ink" font-size="13">Client (STA)</text>
<rect x="470" y="20" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="535" y="43" text-anchor="middle" class="svg-ink" font-size="13">AP / WLC</text>
<line x1="105" y1="56" x2="105" y2="230" stroke="#64748b"/><line x1="535" y1="56" x2="535" y2="230" stroke="#64748b"/>
<line x1="535" y1="80" x2="105" y2="80" stroke="#64748b"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">M1: ANonce</text>
<line x1="105" y1="120" x2="535" y2="120" stroke="#64748b"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">M2: SNonce + MIC (client now has PTK)</text>
<line x1="535" y1="160" x2="105" y2="160" stroke="#64748b"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">M3: GTK delivered + MIC, install keys</text>
<line x1="105" y1="200" x2="535" y2="200" stroke="#64748b"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">M4: ACK, keys installed</text>
</svg><p class="cap">PTK = function of PMK, both MAC addresses, ANonce and SNonce. The MIC proves each side knows the PMK.</p></div>
<ul>
<li><b>PTK</b> protects unicast frames between this client and the AP.</li>
<li><b>GTK</b> (group temporal key) protects broadcast and multicast frames for the BSS.</li>
<li>A wrong passphrase gives a wrong PMK, so the MIC in M2 fails and the AP drops the client. The client sees an authentication failure, not "wrong password" in words.</li>
</ul>

<h3>WPA3: SAE and why it matters</h3>
<p>In WPA2-PSK an attacker who records the handshake can try millions of passphrases offline. <b>SAE</b> (Simultaneous Authentication of Equals, also called Dragonfly) replaces the PSK exchange. Each guess requires a live exchange with the AP, so offline guessing is not possible, and past sessions stay safe even if the passphrase leaks later (forward secrecy). On the 9800 the AKM is <code>sae</code> instead of <code>psk</code>.</p>
<p><b>Transition mode</b> allows WPA2-PSK and WPA3-SAE clients on one SSID so old devices keep working during migration. It is a compromise: the WPA2 path keeps WPA2 weaknesses.</p>

<h3>PMF: protecting management frames</h3>
<p>Classic 802.11 management frames such as deauthentication were unprotected, so anyone could forge a deauth and kick a client off. <b>802.11w Protected Management Frames (PMF)</b> signs these frames. PMF can be <b>optional</b> (capable clients use it), or <b>required</b>. WPA3 requires PMF. Old clients that do not support PMF cannot join a PMF-required SSID. That is a common reason a legacy handset fails after an SSID is moved to WPA3.</p>
<p>In our lab the AKM and cipher commands are modelled, but PMF negotiation and SAE message exchange are <b>concept only, not simulated in the lab</b>. Coming up: module wl-secure (Advanced security).</p>

<div class="eg"><p><b>Worked example.</b> NK-VOICE handsets are 6 years old and support only WPA2-AES. Moving NK-VOICE to WPA3-only with PMF required would lock all handsets out. The fix is to keep the voice SSID WPA2 with AES, or use transition mode with PMF optional, until the handsets are replaced.</p></div>
<div class="exam"><p><b>Exam trap.</b> "WPA3 uses a stronger passphrase" is wrong. The improvement is the SAE exchange and mandatory PMF, not the length of the passphrase.</p></div>
<div class="warn"><p><b>Common mistake.</b> Enabling TKIP "for compatibility". It drags the whole SSID down and, on many controllers, limits 802.11n and later data rates.</p></div>

<div class="scn"><h4>Handsets vanish after a WPA3 upgrade</h4><p>A hospital moved its clinical SSID to WPA3-SAE over the weekend. On Monday, barcode scanners could not join. The controller showed association attempts failing. The scanners supported only WPA2 and had no PMF. The team put the SSID in WPA2/WPA3 transition mode and scheduled the scanner replacement.</p><p><b>Lesson:</b> check client capability lists before raising the security level.</p></div>
<div class="iv"><p class="q">"Why is WPA3-Personal safer than WPA2-Personal?"</p><p>SAE blocks offline dictionary attacks because every guess needs an interaction with the AP, adds forward secrecy and makes PMF mandatory. Mention that the passphrase length requirement is unchanged and that transition mode weakens the result.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WPA2 uses AES-CCMP; WPA3 adds SAE, GCMP-256 and mandatory PMF.</li>
<li>PMK comes from the passphrase and SSID; the passphrase is never sent.</li>
<li>The 4-way handshake derives PTK and delivers GTK.</li>
<li>PMF stops forged deauthentication; old clients may not support it.</li>
<li>SAE, PMF exchanges and OWE are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Wi-Fi security kai baar badli hai kyunki purane designs toot gaye. Engineer ke taur par aapko pata hona chahiye ki aaj kaunsi generation acceptable hai, woh kaunsa cipher use karti hai aur client aur controller asal mein kya exchange karte hain. Yeh chapter theory hai jo aap har aage ke chapter mein use karoge.</p>

<h3>Generations ek table mein</h3>
<table class="cmp"><tr><th>Generation</th><th>Cipher / key method</th><th>Status</th></tr>
<tr><td>WEP</td><td>RC4, static key</td><td>Broken. Kabhi use mat karo.</td></tr>
<tr><td>WPA (TKIP)</td><td>RC4 per-packet mixing ke saath</td><td>Deprecated. Sirf legacy.</td></tr>
<tr><td>WPA2</td><td>AES-CCMP (128-bit), PSK ya 802.1X</td><td>Aaj ka standard, ab bhi bahut common.</td></tr>
<tr><td>WPA3-Personal</td><td>AES-CCMP ya GCMP-256, PSK ki jagah SAE</td><td>Current. Offline dictionary attacks se bachata hai.</td></tr>
<tr><td>WPA3-Enterprise</td><td>802.1X, optional 192-bit mode (GCMP-256)</td><td>Current. PMF mandatory hai.</td></tr>
<tr><td>OWE (Enhanced Open)</td><td>Opportunistic encryption, password nahi</td><td>Open guest networks ke liye jo phir bhi encryption chahte hain.</td></tr></table>
<p><b>CCMP</b> WPA2 ka AES-based encryption aur integrity mechanism hai. <b>GCMP</b> tez aur strong AES mode hai jo WPA3 192-bit use karta hai. <b>TKIP</b> purana stop-gap tha jisne WEP hardware ko patch kiya. 9800 par aap normally sirf <code>ciphers aes</code> enable karte ho.</p>

<h3>PSK: passphrase key kaise banta hai</h3>
<p>WPA2-Personal passphrase 8 se 63 ASCII characters ka hota hai. Dono sides passphrase aur SSID naam se standard function (4096 rounds ke saath PBKDF2) use karke <b>PMK</b> (pairwise master key) compute karte hain. Passphrase khud kabhi nahi bheja jaata. SSID calculation ka hissa hai, isliye do alag SSIDs par same passphrase alag PMK deta hai.</p>

<h3>4-way handshake</h3>
<p>Jab dono sides ke paas PMK ho (PSK se, ya aage ke chapters ke 802.1X se), woh <b>4-way handshake</b> chalate hain. Yeh prove karta hai ki dono ko PMK pata hai bina use reveal kiye, aur is session ke liye fresh <b>PTK</b> (pairwise transient key) derive karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="4-way handshake">
<rect x="40" y="20" width="130" height="36" rx="8" fill="#bae6fd"/><text x="105" y="43" text-anchor="middle" class="svg-ink" font-size="13">Client (STA)</text>
<rect x="470" y="20" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="535" y="43" text-anchor="middle" class="svg-ink" font-size="13">AP / WLC</text>
<line x1="105" y1="56" x2="105" y2="230" stroke="#64748b"/><line x1="535" y1="56" x2="535" y2="230" stroke="#64748b"/>
<line x1="535" y1="80" x2="105" y2="80" stroke="#64748b"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">M1: ANonce</text>
<line x1="105" y1="120" x2="535" y2="120" stroke="#64748b"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">M2: SNonce + MIC (client ke paas PTK)</text>
<line x1="535" y1="160" x2="105" y2="160" stroke="#64748b"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">M3: GTK delivery + MIC, keys install</text>
<line x1="105" y1="200" x2="535" y2="200" stroke="#64748b"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">M4: ACK, keys installed</text>
</svg><p class="cap">PTK = PMK, dono MAC addresses, ANonce aur SNonce ka function. MIC prove karta hai ki dono ko PMK pata hai.</p></div>
<ul>
<li><b>PTK</b> is client aur AP ke beech unicast frames protect karta hai.</li>
<li><b>GTK</b> (group temporal key) BSS ke broadcast aur multicast frames protect karta hai.</li>
<li>Galat passphrase se galat PMK banta hai, to M2 ka MIC fail hota hai aur AP client ko drop kar deta hai. Client ko authentication failure dikhta hai, shabdon mein "wrong password" nahi.</li>
</ul>

<h3>WPA3: SAE aur yeh kyun zaroori hai</h3>
<p>WPA2-PSK mein jo attacker handshake record kar leta hai woh offline lakhon passphrases try kar sakta hai. <b>SAE</b> (Simultaneous Authentication of Equals, Dragonfly bhi kehte hain) PSK exchange ki jagah leta hai. Har guess ke liye AP ke saath live exchange chahiye, to offline guessing possible nahi, aur passphrase baad mein leak ho jaye tab bhi purane sessions safe rehte hain (forward secrecy). 9800 par AKM <code>psk</code> ki jagah <code>sae</code> hota hai.</p>
<p><b>Transition mode</b> ek SSID par WPA2-PSK aur WPA3-SAE dono clients allow karta hai taaki migration mein purane devices chalte rahein. Yeh compromise hai: WPA2 path WPA2 ki kamzoriyan rakhta hai.</p>

<h3>PMF: management frames ko protect karna</h3>
<p>Classic 802.11 management frames jaise deauthentication unprotected the, to koi bhi forged deauth bhejkar client ko nikaal sakta tha. <b>802.11w Protected Management Frames (PMF)</b> in frames ko sign karta hai. PMF <b>optional</b> ho sakta hai (capable clients use karte hain), ya <b>required</b>. WPA3 mein PMF required hai. Jo purane clients PMF support nahi karte woh PMF-required SSID join nahi kar sakte. SSID WPA3 par le jaane ke baad legacy handset ke fail hone ki yeh common wajah hai.</p>
<p>Hamari lab mein AKM aur cipher commands model hain, lekin PMF negotiation aur SAE message exchange <b>concept only, not simulated in the lab</b> hain. Aage aane wala module: wl-secure (Advanced security).</p>

<div class="eg"><p><b>Worked example.</b> NK-VOICE handsets 6 saal purane hain aur sirf WPA2-AES support karte hain. NK-VOICE ko WPA3-only aur PMF required par le jaane se saare handsets lock out ho jayenge. Fix: voice SSID WPA2 AES par rakho, ya handsets badalne tak transition mode aur PMF optional use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "WPA3 stronger passphrase use karta hai" galat hai. Improvement SAE exchange aur mandatory PMF hai, passphrase ki length nahi.</p></div>
<div class="warn"><p><b>Common mistake.</b> "Compatibility ke liye" TKIP enable karna. Yeh poore SSID ko neeche kheench deta hai aur kai controllers par 802.11n aur uske baad ke data rates limit kar deta hai.</p></div>

<div class="scn"><h4>WPA3 upgrade ke baad handsets gayab</h4><p>Ek hospital ne weekend par clinical SSID WPA3-SAE par move kiya. Monday ko barcode scanners join nahi kar paye. Controller par association attempts fail dikhe. Scanners sirf WPA2 support karte the aur PMF nahi tha. Team ne SSID ko WPA2/WPA3 transition mode mein daala aur scanner replacement schedule kiya.</p><p><b>Lesson:</b> security level badhane se pehle client capability list check karo.</p></div>
<div class="iv"><p class="q">"WPA3-Personal WPA2-Personal se safer kyun hai?"</p><p>SAE offline dictionary attacks block karta hai kyunki har guess ke liye AP se interaction chahiye, forward secrecy deta hai aur PMF mandatory karta hai. Yeh bhi bolo ki passphrase length requirement same hai aur transition mode result ko kamzor karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WPA2 AES-CCMP use karta hai; WPA3 SAE, GCMP-256 aur mandatory PMF jodta hai.</li>
<li>PMK passphrase aur SSID se aata hai; passphrase kabhi nahi bheja jaata.</li>
<li>4-way handshake PTK derive karta hai aur GTK deliver karta hai.</li>
<li>PMF forged deauthentication rokta hai; purane clients support nahi kar sakte.</li>
<li>SAE, PMF exchanges aur OWE lab mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};