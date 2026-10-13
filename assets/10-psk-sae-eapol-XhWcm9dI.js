var e={id:`psk-sae-eapol`,h:{en:`PSK, the EAPOL 4-way handshake, WPA3-SAE, OWE and PMF`,hi:`PSK, EAPOL 4-way handshake, WPA3-SAE, OWE aur PMF`},body:{en:`
<p>In CCNA you learned that the 4-way handshake "proves both sides know the passphrase without sending it". ENCOR objective 5.4 expects you to explain the handshake message by message, show where the keys come from, and explain what WPA3 changes. This chapter covers the personal (shared key) side and open networks; chapter 11 covers 802.1X and WebAuth.</p>

<h3>An analogy: two people with the same recipe book</h3>
<p>Two chefs own the same secret recipe book (the <b>PMK</b>). To prove it without reading the book aloud, each writes down a random number (the <b>nonces</b>) and shares it openly. Each then mixes the book with both random numbers and produces today's secret sauce (the <b>PTK</b>). If both sauces taste the same (the <b>MIC</b> checks out), they both own the book. An eavesdropper saw the random numbers but not the book, so cannot make the sauce. With WPA2-PSK, however, the eavesdropper can take the numbers home and try every recipe book in the library until one matches. WPA3-SAE removes that possibility.</p>

<h3>Where the keys come from</h3>
<dl class="terms">
<dt>PMK (Pairwise Master Key)</dt><dd>The long-lived shared secret. With PSK: <code>PMK = PBKDF2(passphrase, SSID, 4096 iterations, 256 bits)</code>, so the SSID is part of the key. With 802.1X it is derived from the EAP session (chapter 11).</dd>
<dt>PTK (Pairwise Transient Key)</dt><dd>Per-client, per-session key derived from PMK + ANonce + SNonce + both MAC addresses. It is split into the <b>KCK</b> (key confirmation key, used for MICs), <b>KEK</b> (key encryption key, protects the GTK) and <b>TK</b> (temporal key, encrypts unicast data with AES-CCMP or GCMP).</dd>
<dt>GTK (Group Temporal Key)</dt><dd>Shared by all clients of the BSS for broadcast and multicast; the AP sends it encrypted inside message 3 and rotates it with the 2-message group key handshake.</dd>
</dl>

<h3>The EAPOL 4-way handshake, step by step</h3>
<p>The handshake runs after 802.11 authentication and association (and after 802.1X, if used). All four frames are <b>EAPOL-Key</b> frames. Until it finishes, the AP drops all the client's data except EAPOL.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="EAPOL 4-way handshake">
<rect x="30" y="10" width="140" height="34" rx="8" fill="#bae6fd"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client (supplicant)</text>
<rect x="470" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">AP / WLC (authenticator)</text>
<line x1="100" y1="44" x2="100" y2="250" stroke="#64748b"/><line x1="540" y1="44" x2="540" y2="250" stroke="#64748b"/>
<line x1="540" y1="70" x2="100" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="13">M1: ANonce</text>
<text x="100" y="95" class="svg-muted" font-size="12">client derives PTK</text>
<line x1="100" y1="120" x2="540" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">M2: SNonce + RSN IE + MIC</text>
<text x="400" y="145" class="svg-muted" font-size="12">AP derives PTK, checks MIC</text>
<line x1="540" y1="170" x2="100" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">M3: ANonce + RSN IE + GTK (encrypted) + MIC, install</text>
<line x1="100" y1="215" x2="540" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">M4: MIC (acknowledge)</text>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="13">both install PTK and GTK, the port opens for data</text>
</svg><p class="cap">Message 2's MIC is where a wrong passphrase is caught.</p></div>
<ol>
<li><b>M1 (AP → client)</b>: the AP's random <b>ANonce</b>. No MIC yet. The client now has everything to compute the PTK: PMK, ANonce, its own SNonce and both MACs.</li>
<li><b>M2 (client → AP)</b>: the client's <b>SNonce</b>, its RSN information element (the ciphers and AKM it wants), and a <b>MIC</b> computed with the KCK. The AP computes the same PTK and checks the MIC. <b>Wrong passphrase = different PMK = MIC failure here.</b></li>
<li><b>M3 (AP → client)</b>: ANonce again, the AP's RSN IE (so the client can detect a downgrade by comparing with the beacon), the <b>GTK encrypted with the KEK</b>, the install flag and a MIC.</li>
<li><b>M4 (client → AP)</b>: a MIC-protected acknowledgement. Both sides install the keys; data flows encrypted.</li></ol>
<pre class="out">%APF-4-AUTH_FAIL: Client 00:50:2f:e9:9a:01 failed PSK authentication on WLAN 1 (NK-STAFF) via AP AP1: <span class="hl">MIC failure in 4-way handshake (wrong pre-shared key)</span></pre>

<h3>The weakness of WPA2-PSK</h3>
<p>Anyone who captures M1 and M2 has the nonces, MACs, SSID and a MIC. They can guess passphrases offline at high speed until one reproduces the MIC: an <b>offline dictionary attack</b>. And if the passphrase leaks later, recorded traffic can be decrypted (<b>no forward secrecy</b>). Long random passphrases help; changing the protocol helps more.</p>

<h3>WPA3-Personal: SAE</h3>
<p><b>Simultaneous Authentication of Equals</b> (SAE, based on the Dragonfly key exchange) replaces the open 802.11 authentication frames with a <b>Commit</b> and <b>Confirm</b> exchange in which each side proves knowledge of the password with a zero-knowledge style exchange. It produces a fresh, strong PMK. The normal 4-way handshake then runs with that PMK. The results:</p>
<ul><li>Each password guess requires a live exchange with the AP, so offline dictionary attacks are not possible.</li>
<li><b>Forward secrecy</b>: learning the password later does not decrypt old sessions.</li>
<li><b>PMF (802.11w) is mandatory.</b></li></ul>
<p><b>Transition mode</b> (WPA2/WPA3 mixed) advertises both AKMs, PSK and SAE, with the same passphrase and PMF optional, so WPA3 clients use SAE and older clients keep PSK. It is a migration tool: an attacker can still target the PSK side, so plan to move to WPA3-only (6 GHz requires it).</p>

<h3>PMF, OWE and WPA3-Enterprise</h3>
<ul><li><b>Protected Management Frames</b> (802.11w) sign deauthentication, disassociation and certain action frames, defeating the classic "deauth attack" that kicks clients off to capture handshakes. Settings: disabled, optional (capable) or required.</li>
<li><b>Enhanced Open / OWE</b> (Opportunistic Wireless Encryption): for open networks such as cafés. A Diffie-Hellman exchange during association gives each client its own encryption keys, with no password. It encrypts, but does not authenticate anyone. <b>OWE transition mode</b> pairs an open SSID with a hidden OWE SSID for older clients.</li>
<li><b>WPA3-Enterprise</b>: 802.1X with PMF required; an optional <b>192-bit mode</b> (CNSA suite, GCMP-256, EAP-TLS with specific cipher suites) for high-security sites.</li></ul>

<h3>Lab: transition mode on NK-STAFF</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF: Status off, Security tab (WPA2 + WPA3, PSK + SAE), Apply to Device; Configuration &gt; Security &gt; Web Auth &gt; WLANs tab &gt; NK-STAFF &gt; Edit: PMF Optional; Status on</span>
WLC1(config)# wlan NK-STAFF
WLC1(config-wlan)# shutdown
WLC1(config-wlan)# security wpa wpa3
WLC1(config-wlan)# security wpa akm sae
WLC1(config-wlan)# security pmf optional
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# end
WLC1# show wlan name NK-STAFF</pre>
<pre class="out">  WPA2 : Enabled   WPA3 : <span class="hl">Enabled</span>   AES : Enabled
  Auth Key Mgmt : PSK <span class="hl">SAE</span>
  PMF Support   : <span class="hl">Optional</span></pre>
<p>Changing the security of a live WLAN de-authenticates its clients; LAPTOP1 reconnects from its saved profile. On the 9800 an enabled WLAN refuses security edits, so the order is always shutdown, edit, no shutdown; the web UI does the same when you switch Status off first. WPA2/WPA3 transition needs PMF Optional and WPA3-only needs PMF Required, otherwise the enable step is refused with the reason.</p>

<div class="eg"><p><b>Worked example.</b> Same passphrase "NkStaff2024" on SSIDs NK-STAFF and NK-LAB gives two different PMKs, because the SSID salts PBKDF2. A laptop configured for NK-STAFF cannot silently join NK-LAB with a cached key, and precomputed tables must be built per SSID, which is why common SSIDs such as "linksys" were attractive targets for precomputed tables.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting PMF to "required" on a WLAN with old clients that do not support it: they fail to associate. (2) Assuming OWE authenticates users; it only encrypts. (3) Sharing one PSK across thousands of devices; use 802.1X or identity PSK (per-device keys handed out by RADIUS) instead.</p></div>

<div class="exam"><p><b>Exam traps.</b> The GTK is delivered in message 3, encrypted with the KEK. A wrong PSK shows as a MIC failure on message 2. SAE replaces the open authentication, not the 4-way handshake. PMF is mandatory in WPA3 and in 6 GHz. PSK PMK = PBKDF2(passphrase, SSID).</p></div>

<div class="tip"><p><b>Doing it in the web UI</b></p><p>Lab 1, task 1 (GUI only). Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF: switch Status off; Security tab: tick WPA2 and WPA3, tick PSK and SAE, keep the key; Apply to Device. Then set PMF to Optional (on a real 9800: the WLAN's Security, Layer2 tab; in the lab: Configuration &gt; Security &gt; Web Auth &gt; WLANs tab &gt; NK-STAFF &gt; Edit) and switch Status on. Verify with Monitoring &gt; Wireless &gt; WLANs, which lists [WPA2][WPA3][PSK][SAE], and with LAPTOP1: <code>wifi status</code>. SAE, PMF and OWE exchanges themselves are concept only here (wl-secure, Advanced wireless security).</p></div>

<div class="scn"><h4>Handshakes captured in the car park</h4><p>A penetration test on a factory's WPA2-PSK network sent forged deauthentication frames from the car park, captured the 4-way handshakes as clients reconnected, and cracked the eight-character passphrase offline overnight. The fix had two parts: enable PMF so forged deauths are ignored, and migrate the WLAN to WPA2/WPA3 transition mode, then WPA3-SAE only once the handheld terminals received a firmware update. The retest could not crack SAE offline.</p><p><b>Lesson:</b> WPA2-PSK strength depends only on the passphrase; WPA3-SAE and PMF remove the offline attack and the deauth trick.</p></div>

<div class="iv"><p class="q">"Walk me through the 4-way handshake."</p><p>Strong answer: after association, the AP sends M1 with the ANonce; the client derives the PTK from the PMK, both nonces and both MACs and replies with M2 containing the SNonce, its RSN IE and a MIC; the AP derives the same PTK and verifies the MIC (a wrong PSK fails here); M3 carries the ANonce, the AP's RSN IE, the GTK encrypted with the KEK and a MIC and tells the client to install keys; M4 acknowledges. Then name the PTK parts (KCK, KEK, TK) and add how SAE and PMF improve WPA3.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PMK (from PSK or 802.1X) → PTK (KCK, KEK, TK) per session; GTK for broadcast/multicast.</li>
<li>M1 ANonce; M2 SNonce + MIC; M3 GTK (encrypted) + install; M4 ack.</li>
<li>WPA2-PSK allows offline dictionary attacks; WPA3-SAE prevents them and adds forward secrecy.</li>
<li>PMF protects management frames and is mandatory in WPA3; OWE encrypts open networks.</li>
<li>Transition mode (PSK + SAE) is for migration; 6 GHz requires WPA3 or OWE.</li>
</ul></div>
`,hi:`
<p>CCNA mein aapne seekha ki 4-way handshake "bina bheje saabit karta hai ki dono taraf passphrase pata hai". ENCOR objective 5.4 expect karta hai ki aap handshake ko message by message samjhao, dikhao keys kahan se aati hain, aur samjhao WPA3 kya badalta hai. Yeh chapter personal (shared key) side aur open networks cover karta hai; chapter 11 802.1X aur WebAuth cover karta hai.</p>

<h3>Ek analogy: same recipe book wale do log</h3>
<p>Do chefs ke paas same secret recipe book hai (<b>PMK</b>). Book zor se padhe bina yeh saabit karne ke liye, har ek ek random number likhta hai (<b>nonces</b>) aur khule mein share karta hai. Phir har ek book ko dono random numbers ke saath milakar aaj ki secret sauce banata hai (<b>PTK</b>). Agar dono sauces ka taste same hai (<b>MIC</b> match hota hai), to dono ke paas book hai. Chhupkar sunne wale ne random numbers dekhe par book nahi, isliye sauce nahi bana sakta. Lekin WPA2-PSK mein woh numbers ghar le jaakar library ki har recipe book try kar sakta hai jab tak ek match na ho. WPA3-SAE yeh sambhavna khatam karta hai.</p>

<h3>Keys kahan se aati hain</h3>
<dl class="terms">
<dt>PMK (Pairwise Master Key)</dt><dd>Lambe time wala shared secret. PSK ke saath: <code>PMK = PBKDF2(passphrase, SSID, 4096 iterations, 256 bits)</code>, yaani SSID key ka hissa hai. 802.1X ke saath yeh EAP session se banta hai (chapter 11).</dd>
<dt>PTK (Pairwise Transient Key)</dt><dd>Har client, har session ki key jo PMK + ANonce + SNonce + dono MAC addresses se banti hai. Yeh <b>KCK</b> (key confirmation key, MICs ke liye), <b>KEK</b> (key encryption key, GTK ko protect karti hai) aur <b>TK</b> (temporal key, AES-CCMP ya GCMP se unicast data encrypt karti hai) mein bant-ti hai.</dd>
<dt>GTK (Group Temporal Key)</dt><dd>BSS ke saare clients broadcast aur multicast ke liye share karte hain; AP ise message 3 mein encrypted bhejta hai aur 2-message group key handshake se rotate karta hai.</dd>
</dl>

<h3>EAPOL 4-way handshake, step by step</h3>
<p>Handshake 802.11 authentication aur association ke baad chalta hai (aur 802.1X ke baad, agar use ho). Chaaron frames <b>EAPOL-Key</b> frames hain. Jab tak yeh khatam na ho, AP client ka EAPOL ke alawa saara data drop karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="EAPOL 4-way handshake">
<rect x="30" y="10" width="140" height="34" rx="8" fill="#bae6fd"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client (supplicant)</text>
<rect x="470" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">AP / WLC (authenticator)</text>
<line x1="100" y1="44" x2="100" y2="250" stroke="#64748b"/><line x1="540" y1="44" x2="540" y2="250" stroke="#64748b"/>
<line x1="540" y1="70" x2="100" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="13">M1: ANonce</text>
<text x="100" y="95" class="svg-muted" font-size="12">client PTK banata hai</text>
<line x1="100" y1="120" x2="540" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">M2: SNonce + RSN IE + MIC</text>
<text x="380" y="145" class="svg-muted" font-size="12">AP PTK banata hai, MIC check</text>
<line x1="540" y1="170" x2="100" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">M3: ANonce + RSN IE + GTK (encrypted) + MIC, install</text>
<line x1="100" y1="215" x2="540" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">M4: MIC (acknowledge)</text>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="13">dono PTK aur GTK install karte hain, data ke liye port khulta hai</text>
</svg><p class="cap">Message 2 ke MIC par galat passphrase pakdi jaati hai.</p></div>
<ol>
<li><b>M1 (AP → client)</b>: AP ka random <b>ANonce</b>. Abhi MIC nahi. Ab client ke paas PTK banane ke liye sab hai: PMK, ANonce, apna SNonce aur dono MACs.</li>
<li><b>M2 (client → AP)</b>: client ka <b>SNonce</b>, uska RSN information element (jo ciphers aur AKM woh chahta hai), aur KCK se bana <b>MIC</b>. AP same PTK banata hai aur MIC check karta hai. <b>Galat passphrase = alag PMK = yahin MIC failure.</b></li>
<li><b>M3 (AP → client)</b>: phir se ANonce, AP ka RSN IE (taaki client beacon se compare karke downgrade pakad sake), <b>KEK se encrypted GTK</b>, install flag aur MIC.</li>
<li><b>M4 (client → AP)</b>: MIC-protected acknowledgement. Dono sides keys install karti hain; data encrypted chalta hai.</li></ol>
<pre class="out">%APF-4-AUTH_FAIL: Client 00:50:2f:e9:9a:01 failed PSK authentication on WLAN 1 (NK-STAFF) via AP AP1: <span class="hl">MIC failure in 4-way handshake (wrong pre-shared key)</span></pre>

<h3>WPA2-PSK ki kamzori</h3>
<p>Jo bhi M1 aur M2 capture kar le uske paas nonces, MACs, SSID aur ek MIC hai. Woh offline tez speed par passphrases guess kar sakta hai jab tak ek MIC reproduce na kar de: <b>offline dictionary attack</b>. Aur agar passphrase baad mein leak ho, recorded traffic decrypt ho sakta hai (<b>forward secrecy nahi</b>). Lambi random passphrases madad karti hain; protocol badalna zyada madad karta hai.</p>

<h3>WPA3-Personal: SAE</h3>
<p><b>Simultaneous Authentication of Equals</b> (SAE, Dragonfly key exchange par based) open 802.11 authentication frames ki jagah <b>Commit</b> aur <b>Confirm</b> exchange laata hai jismein har side zero-knowledge style exchange se password ka gyaan saabit karti hai. Isse ek naya, strong PMK banta hai. Phir us PMK ke saath normal 4-way handshake chalta hai. Nateeje:</p>
<ul><li>Har password guess ke liye AP ke saath live exchange chahiye, isliye offline dictionary attacks possible nahi.</li>
<li><b>Forward secrecy</b>: baad mein password pata chalne par bhi purane sessions decrypt nahi hote.</li>
<li><b>PMF (802.11w) zaroori hai.</b></li></ul>
<p><b>Transition mode</b> (WPA2/WPA3 mixed) dono AKMs, PSK aur SAE, same passphrase aur PMF optional ke saath advertise karta hai, taaki WPA3 clients SAE use karein aur purane clients PSK. Yeh migration tool hai: attacker ab bhi PSK side ko target kar sakta hai, isliye WPA3-only par jaane ka plan rakho (6 GHz ise zaroori banata hai).</p>

<h3>PMF, OWE aur WPA3-Enterprise</h3>
<ul><li><b>Protected Management Frames</b> (802.11w) deauthentication, disassociation aur kuch action frames ko sign karte hain, jisse classic "deauth attack" fail hota hai jo handshakes capture karne ke liye clients ko nikaalta hai. Settings: disabled, optional (capable) ya required.</li>
<li><b>Enhanced Open / OWE</b> (Opportunistic Wireless Encryption): cafe jaise open networks ke liye. Association ke dauraan Diffie-Hellman exchange har client ko apni encryption keys deta hai, bina password. Yeh encrypt karta hai, par kisi ko authenticate nahi karta. <b>OWE transition mode</b> purane clients ke liye open SSID ke saath ek hidden OWE SSID jodta hai.</li>
<li><b>WPA3-Enterprise</b>: PMF required ke saath 802.1X; high-security sites ke liye optional <b>192-bit mode</b> (CNSA suite, GCMP-256, specific cipher suites ke saath EAP-TLS).</li></ul>

<h3>Lab: NK-STAFF par transition mode</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF: Status off, Security tab (WPA2 + WPA3, PSK + SAE), Apply to Device; Configuration &gt; Security &gt; Web Auth &gt; WLANs tab &gt; NK-STAFF &gt; Edit: PMF Optional; Status on</span>
WLC1(config)# wlan NK-STAFF
WLC1(config-wlan)# shutdown
WLC1(config-wlan)# security wpa wpa3
WLC1(config-wlan)# security wpa akm sae
WLC1(config-wlan)# security pmf optional
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# end
WLC1# show wlan name NK-STAFF</pre>
<pre class="out">  WPA2 : Enabled   WPA3 : <span class="hl">Enabled</span>   AES : Enabled
  Auth Key Mgmt : PSK <span class="hl">SAE</span>
  PMF Support   : <span class="hl">Optional</span></pre>
<p>Live WLAN ki security badalne se uske clients de-authenticate hote hain; LAPTOP1 apne saved profile se dobara connect hota hai. 9800 par enabled WLAN security edit refuse karta hai, isliye order hamesha shutdown, edit, no shutdown hota hai; web UI bhi wahi karta hai jab aap pehle Status off karte ho. WPA2/WPA3 transition ko PMF Optional aur sirf-WPA3 ko PMF Required chahiye, warna enable step wajah ke saath refuse hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Same passphrase "NkStaff2024" SSIDs NK-STAFF aur NK-LAB par do alag PMKs deti hai, kyunki SSID PBKDF2 ka salt hai. NK-STAFF ke liye configured laptop cached key se chupchaap NK-LAB join nahi kar sakta, aur precomputed tables har SSID ke liye alag banani padti hain, isiliye "linksys" jaise common SSIDs precomputed tables ke liye aakarshak target the.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Purane clients wale WLAN par PMF "required" set karna jo use support nahi karte: woh associate nahi kar paate. (2) Maanna ki OWE users ko authenticate karta hai; woh sirf encrypt karta hai. (3) Hazaaron devices mein ek PSK share karna; iske bajaaye 802.1X ya identity PSK (RADIUS se diye per-device keys) use karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> GTK message 3 mein KEK se encrypted aata hai. Galat PSK message 2 par MIC failure ke roop mein dikhta hai. SAE open authentication ki jagah leta hai, 4-way handshake ki nahi. PMF WPA3 aur 6 GHz mein zaroori hai. PSK PMK = PBKDF2(passphrase, SSID).</p></div>

<div class="tip"><p><b>Web UI mein karna</b></p><p>Lab 1, task 1 (sirf GUI). Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF: Status off karo; Security tab: WPA2 aur WPA3 tick karo, PSK aur SAE tick karo, key wahi rakho; Apply to Device. Phir PMF ko Optional karo (asli 9800 par: WLAN ka Security, Layer2 tab; lab mein: Configuration &gt; Security &gt; Web Auth &gt; WLANs tab &gt; NK-STAFF &gt; Edit) aur Status on karo. Verify Monitoring &gt; Wireless &gt; WLANs se karo, jo [WPA2][WPA3][PSK][SAE] dikhata hai, aur LAPTOP1 par <code>wifi status</code> se. SAE, PMF aur OWE ke exchanges khud yahan concept only hain (wl-secure, Advanced wireless security).</p></div>

<div class="scn"><h4>Car park mein capture hue handshakes</h4><p>Ek factory ke WPA2-PSK network par penetration test ne car park se forged deauthentication frames bheje, clients ke reconnect hote hi 4-way handshakes capture kiye, aur aath character ki passphrase raat bhar mein offline crack kar di. Fix ke do hisse the: PMF enable karo taaki forged deauths ignore hon, aur WLAN ko WPA2/WPA3 transition mode mein le jao, phir handheld terminals ko firmware update milne par sirf WPA3-SAE. Retest SAE ko offline crack nahi kar paaya.</p><p><b>Lesson:</b> WPA2-PSK ki taakat sirf passphrase par depend karti hai; WPA3-SAE aur PMF offline attack aur deauth trick dono hata dete hain.</p></div>

<div class="iv"><p class="q">"Mujhe 4-way handshake step by step samjhao."</p><p>Strong answer: association ke baad AP ANonce ke saath M1 bhejta hai; client PMK, dono nonces aur dono MACs se PTK banata hai aur SNonce, apne RSN IE aur MIC ke saath M2 bhejta hai; AP same PTK banakar MIC verify karta hai (galat PSK yahin fail hota hai); M3 mein ANonce, AP ka RSN IE, KEK se encrypted GTK aur MIC hota hai aur client ko keys install karne ko kehta hai; M4 acknowledge karta hai. Phir PTK ke hisse (KCK, KEK, TK) batao aur jodo ki SAE aur PMF WPA3 ko kaise behtar banate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PMK (PSK ya 802.1X se) → har session ka PTK (KCK, KEK, TK); broadcast/multicast ke liye GTK.</li>
<li>M1 ANonce; M2 SNonce + MIC; M3 GTK (encrypted) + install; M4 ack.</li>
<li>WPA2-PSK offline dictionary attacks allow karta hai; WPA3-SAE unhe rokta hai aur forward secrecy jodta hai.</li>
<li>PMF management frames protect karta hai aur WPA3 mein zaroori hai; OWE open networks encrypt karta hai.</li>
<li>Transition mode (PSK + SAE) migration ke liye hai; 6 GHz ko WPA3 ya OWE chahiye.</li>
</ul></div>
`}};export{e as default};