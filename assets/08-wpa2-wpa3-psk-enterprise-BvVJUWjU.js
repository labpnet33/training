var e={id:`security`,h:{en:`Wireless security: WPA2, WPA3, PSK and Enterprise`,hi:`Wireless security: WPA2, WPA3, PSK aur Enterprise`},body:{en:`
<p>A radio signal walks through walls into the car park and the building next door. Anyone there can listen. So Wi-Fi security must do two jobs: <b>authentication</b>, deciding who may join (the guard at the door), and <b>encryption</b>, scrambling every frame so listeners learn nothing (a sealed envelope for every letter). A shared door code that everyone knows is PSK; a personal badge checked against the HR database is Enterprise.</p>

<h3>From WEP to WPA3</h3>
<table class="cmp"><tr><th>Protocol</th><th>Encryption</th><th>Status</th></tr>
<tr><td>WEP (1997)</td><td>RC4 with static keys and weak IVs</td><td>Broken in minutes. Never use.</td></tr>
<tr><td>WPA (2003)</td><td>TKIP (still RC4, patched)</td><td>Interim fix, deprecated. Never use.</td></tr>
<tr><td>WPA2 (2004, 802.11i)</td><td>AES-CCMP, 128-bit</td><td>Still widely used; acceptable with a strong passphrase or 802.1X.</td></tr>
<tr><td>WPA3 (2018)</td><td>AES-CCMP or GCMP; SAE for personal; protected management frames mandatory</td><td>Current best practice; required in 6 GHz.</td></tr>
</table>

<h3>WPA2 and WPA3 in more detail</h3>
<ul>
<li><b>WPA2-Personal (PSK)</b>: every user types the same passphrase (8 to 63 characters). Client and AP prove they know it with the <b>4-way handshake</b> and derive fresh encryption keys per session. Weakness: an attacker who captures one handshake can try millions of passwords offline. A short or dictionary passphrase falls quickly.</li>
<li><b>WPA3-Personal (SAE)</b>: replaces the PSK exchange with <b>Simultaneous Authentication of Equals</b> (the "Dragonfly" handshake). Each guess requires a live exchange with the AP, so offline dictionary attacks do not work, and it provides <b>forward secrecy</b>: capturing traffic today and learning the password later does not decrypt it.</li>
<li><b>Protected management frames (802.11w, PMF)</b>: optional in WPA2, mandatory in WPA3. They stop attackers forging deauthentication frames to kick clients off.</li>
<li><b>WPA3-Enterprise</b>: 802.1X like WPA2-Enterprise, with an optional <b>192-bit security mode</b> (GCMP-256 and stronger key exchange) for high-security organisations.</li>
<li><b>WPA2/WPA3 transition mode</b>: one SSID accepts both, so older clients keep working while new ones use SAE.</li>
<li><b>Enhanced Open (OWE)</b>: encrypts open networks, such as cafés, without a password. It does not authenticate users; it only stops passive eavesdropping.</li>
</ul>

<h3>Authentication: PSK versus Enterprise</h3>
<table class="cmp"><tr><th></th><th>PSK / SAE (Personal)</th><th>Enterprise (802.1X)</th></tr>
<tr><td>Credential</td><td>One shared passphrase</td><td>Per-user username and password, or a certificate</td></tr>
<tr><td>Who checks it</td><td>The AP or controller</td><td>A RADIUS server (UDP 1812 authentication, 1813 accounting), often linked to the user directory</td></tr>
<tr><td>Someone leaves</td><td>Change the key on every AP and every device</td><td>Disable one account</td></tr>
<tr><td>Extras</td><td>None</td><td>Per-user logs, dynamic VLAN assignment, per-user policies</td></tr>
<tr><td>Best for</td><td>Homes, small offices, IoT that cannot do 802.1X</td><td>Businesses, campuses, anything with many users</td></tr>
</table>
<p>802.1X has three roles: the <b>supplicant</b> (the client software), the <b>authenticator</b> (the AP or controller, which relays and enforces) and the <b>authentication server</b> (RADIUS). They carry <b>EAP</b> (Extensible Authentication Protocol) messages. Common EAP methods: <b>EAP-TLS</b> (certificates on both client and server, strongest), <b>PEAP</b> (server certificate builds a TLS tunnel, then the user's password is checked inside it) and <b>EAP-TTLS</b>. Clients must validate the server certificate, or an attacker's fake AP can collect passwords.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="802.1X roles">
<rect x="20" y="60" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="95" y="99" text-anchor="middle" class="svg-muted" font-size="12">laptop</text>
<rect x="245" y="60" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="99" text-anchor="middle" class="svg-muted" font-size="12">AP or controller</text>
<rect x="470" y="60" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="545" y="99" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<line x1="170" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/><line x1="395" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="207" y="50" text-anchor="middle" class="svg-accent" font-size="12">EAP over air</text><text x="432" y="50" text-anchor="middle" class="svg-accent" font-size="12">EAP in RADIUS</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Accept: keys installed, client placed in its VLAN. Reject: no network access.</text>
</svg><p class="cap">802.1X: the AP never decides alone; it relays EAP to RADIUS and enforces the answer.</p></div>

<h3>What it looks like on a controller</h3>
<pre class="code"><span class="c">! Move the lab WLAN from WPA2-PSK to WPA2/WPA3 transition mode</span>
config wlan disable 1
config wlan security wpa wpa3 enable 1
config wlan security wpa akm sae enable 1
config wlan enable 1</pre>
<pre class="out">(WLC1) &gt;show wlan 1
Network Name (SSID).............................. CORP-OFFICE
Status........................................... Enabled
   Wi-Fi Protected Access (WPA/WPA2/WPA3)........ Enabled
      WPA2 (RSN IE).............................. Enabled
         AES Cipher.............................. Enabled
      <span class="hl">WPA3 (SAE capable)......................... Enabled</span>
      Auth Key Management
         802.1X.................................. Disabled
         PSK..................................... Enabled
         <span class="hl">SAE..................................... Enabled</span>
   Pre-shared key................................ Set (13 characters)</pre>

<div class="eg"><p><b>Worked example.</b> A 200-person company uses one WPA2-PSK for everything. An employee leaves on bad terms and still knows the key. With PSK, IT must change the key on every AP and every laptop, phone and printer that day. With WPA2- or WPA3-Enterprise, IT disables one directory account and the ex-employee is locked out immediately, while everyone else keeps working.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving <b>WPS</b> (Wi-Fi Protected Setup) PIN mode enabled on small APs. The 8-digit PIN can be brute-forced in hours and reveals the WPA2 passphrase. Disable WPS. Also avoid "WPA2 with TKIP" mixed modes; they drag every client down to the weak cipher and old data rates.</p></div>

<div class="exam"><p><b>Exam trap.</b> WPA2 uses AES-CCMP; TKIP belongs to WPA. WPA3-Personal uses SAE, which defeats offline dictionary attacks. 802.1X is port-based network access control; the AP is the authenticator and RADIUS is the authentication server. MAC filtering and hidden SSIDs are not real security: MAC addresses are easy to spoof.</p></div>

<div class="scn"><h4>Coffee shop password, company network</h4><p>A design studio printed its WPA2-PSK on a card in the reception area. A penetration tester sitting in the lobby captured a handshake and cracked the eight-letter dictionary passphrase offline within minutes, then reached the file server on the same VLAN. The fix: staff moved to WPA3-Enterprise with PEAP against the directory, visitors got a separate guest SSID on an isolated VLAN, and the old PSK SSID was removed.</p><p><b>Lesson:</b> shared keys leak; use per-user authentication for staff and keep guests on their own network.</p></div>

<div class="iv"><p class="q">"What are the advantages of WPA3 over WPA2, and when would you choose Enterprise over Personal?"</p><p>Strong answer: WPA3-Personal replaces the PSK handshake with SAE, which resists offline dictionary attacks and gives forward secrecy; WPA3 also makes protected management frames mandatory and adds a 192-bit Enterprise mode; it is required in 6 GHz, with transition mode for older clients. Choose Enterprise (802.1X with RADIUS and EAP-TLS or PEAP) whenever you have many users: per-user identity, instant revocation, dynamic VLANs and logging. Keep PSK/SAE for small sites and IoT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Never use WEP, WPA or TKIP; WPA2 uses AES-CCMP; WPA3 adds SAE, mandatory PMF and 192-bit Enterprise mode.</li>
<li>PSK = one shared passphrase checked by the AP; Enterprise = 802.1X per-user authentication via RADIUS.</li>
<li>802.1X roles: supplicant, authenticator (AP/controller), authentication server (RADIUS, UDP 1812/1813).</li>
<li>EAP-TLS uses certificates on both sides; PEAP uses a server certificate and a user password.</li>
<li>Disable WPS; hidden SSIDs and MAC filters are not security; Enhanced Open encrypts open networks.</li>
</ul></div>
`,hi:`
<p>Radio signal deewaron se hote hue car park aur bagal wali building tak chala jaata hai. Wahan koi bhi sun sakta hai. Isliye Wi-Fi security ko do kaam karne hote hain: <b>authentication</b>, tay karna ki kaun join kar sakta hai (darwaze par guard), aur <b>encryption</b>, har frame ko aisa scramble karna ki sunne walon ko kuch pata na chale (har chitthi ke liye seal band lifafa). Ek shared door code jo sabko pata hai woh PSK hai; HR database se check hone wala personal badge Enterprise hai.</p>

<h3>WEP se WPA3 tak</h3>
<table class="cmp"><tr><th>Protocol</th><th>Encryption</th><th>Status</th></tr>
<tr><td>WEP (1997)</td><td>Static keys aur kamzor IVs ke saath RC4</td><td>Minuton mein toot jaata hai. Kabhi use mat karo.</td></tr>
<tr><td>WPA (2003)</td><td>TKIP (abhi bhi RC4, patched)</td><td>Interim fix, deprecated. Kabhi use mat karo.</td></tr>
<tr><td>WPA2 (2004, 802.11i)</td><td>AES-CCMP, 128-bit</td><td>Abhi bhi bahut use hota hai; strong passphrase ya 802.1X ke saath acceptable.</td></tr>
<tr><td>WPA3 (2018)</td><td>AES-CCMP ya GCMP; personal ke liye SAE; protected management frames mandatory</td><td>Current best practice; 6 GHz mein zaroori.</td></tr>
</table>

<h3>WPA2 aur WPA3 detail mein</h3>
<ul>
<li><b>WPA2-Personal (PSK)</b>: har user same passphrase type karta hai (8 se 63 characters). Client aur AP <b>4-way handshake</b> se saabit karte hain ki unhe woh pata hai aur har session ke liye nayi encryption keys banate hain. Kamzori: jo attacker ek handshake capture kar le woh offline laakhon passwords try kar sakta hai. Chhota ya dictionary passphrase jaldi toot jaata hai.</li>
<li><b>WPA3-Personal (SAE)</b>: PSK exchange ko <b>Simultaneous Authentication of Equals</b> ("Dragonfly" handshake) se badalta hai. Har guess ke liye AP ke saath live exchange chahiye, isliye offline dictionary attacks kaam nahi karte, aur yeh <b>forward secrecy</b> deta hai: aaj traffic capture karke baad mein password jaan lene se bhi woh decrypt nahi hota.</li>
<li><b>Protected management frames (802.11w, PMF)</b>: WPA2 mein optional, WPA3 mein mandatory. Yeh attackers ko clients ko bhagane ke liye nakli deauthentication frames banane se rokte hain.</li>
<li><b>WPA3-Enterprise</b>: WPA2-Enterprise jaisa 802.1X, high-security organisations ke liye optional <b>192-bit security mode</b> (GCMP-256 aur strong key exchange) ke saath.</li>
<li><b>WPA2/WPA3 transition mode</b>: ek SSID dono accept karta hai, isliye purane clients chalte rehte hain jabki naye SAE use karte hain.</li>
<li><b>Enhanced Open (OWE)</b>: open networks, jaise cafés, ko bina password encrypt karta hai. Yeh users ko authenticate nahi karta; sirf passive eavesdropping rokta hai.</li>
</ul>

<h3>Authentication: PSK vs Enterprise</h3>
<table class="cmp"><tr><th></th><th>PSK / SAE (Personal)</th><th>Enterprise (802.1X)</th></tr>
<tr><td>Credential</td><td>Ek shared passphrase</td><td>Har user ka username aur password, ya certificate</td></tr>
<tr><td>Kaun check karta hai</td><td>AP ya controller</td><td>RADIUS server (UDP 1812 authentication, 1813 accounting), aksar user directory se juda</td></tr>
<tr><td>Koi chhod kar jaaye</td><td>Har AP aur har device par key badlo</td><td>Ek account disable karo</td></tr>
<tr><td>Extras</td><td>Kuch nahi</td><td>Per-user logs, dynamic VLAN assignment, per-user policies</td></tr>
<tr><td>Kiske liye best</td><td>Ghar, chhote offices, IoT jo 802.1X nahi kar sakta</td><td>Businesses, campuses, bahut users wali har jagah</td></tr>
</table>
<p>802.1X ke teen roles hain: <b>supplicant</b> (client software), <b>authenticator</b> (AP ya controller, jo relay aur enforce karta hai) aur <b>authentication server</b> (RADIUS). Yeh <b>EAP</b> (Extensible Authentication Protocol) messages le jaate hain. Common EAP methods: <b>EAP-TLS</b> (client aur server dono par certificates, sabse strong), <b>PEAP</b> (server certificate TLS tunnel banata hai, phir uske andar user ka password check hota hai) aur <b>EAP-TTLS</b>. Clients ko server certificate validate karna chahiye, warna attacker ka nakli AP passwords ikatthe kar sakta hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="802.1X roles">
<rect x="20" y="60" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="95" y="99" text-anchor="middle" class="svg-muted" font-size="12">laptop</text>
<rect x="245" y="60" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="99" text-anchor="middle" class="svg-muted" font-size="12">AP ya controller</text>
<rect x="470" y="60" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="545" y="99" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<line x1="170" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/><line x1="395" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="207" y="50" text-anchor="middle" class="svg-accent" font-size="12">Hawa par EAP</text><text x="432" y="50" text-anchor="middle" class="svg-accent" font-size="12">RADIUS mein EAP</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Accept: keys install, client apne VLAN mein. Reject: koi network access nahi.</text>
</svg><p class="cap">802.1X: AP kabhi akele faisla nahi karta; woh EAP ko RADIUS tak relay karta hai aur jawab enforce karta hai.</p></div>

<h3>Controller par yeh kaisa dikhta hai</h3>
<pre class="code"><span class="c">! Lab WLAN ko WPA2-PSK se WPA2/WPA3 transition mode par le jao</span>
config wlan disable 1
config wlan security wpa wpa3 enable 1
config wlan security wpa akm sae enable 1
config wlan enable 1</pre>
<pre class="out">(WLC1) &gt;show wlan 1
Network Name (SSID).............................. CORP-OFFICE
Status........................................... Enabled
   Wi-Fi Protected Access (WPA/WPA2/WPA3)........ Enabled
      WPA2 (RSN IE).............................. Enabled
         AES Cipher.............................. Enabled
      <span class="hl">WPA3 (SAE capable)......................... Enabled</span>
      Auth Key Management
         802.1X.................................. Disabled
         PSK..................................... Enabled
         <span class="hl">SAE..................................... Enabled</span>
   Pre-shared key................................ Set (13 characters)</pre>

<div class="eg"><p><b>Worked example.</b> 200 logon ki ek company sab kuch ke liye ek WPA2-PSK use karti hai. Ek employee naraz hokar chhodta hai aur use abhi bhi key pata hai. PSK ke saath IT ko usi din har AP aur har laptop, phone aur printer par key badalni padegi. WPA2- ya WPA3-Enterprise ke saath IT ek directory account disable karta hai aur purana employee turant bahar ho jaata hai, jabki baaki sab kaam karte rehte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Chhote APs par <b>WPS</b> (Wi-Fi Protected Setup) PIN mode enabled chhodna. 8-digit PIN ghanton mein brute-force ho sakta hai aur WPA2 passphrase bata deta hai. WPS disable karo. "WPA2 with TKIP" mixed modes se bhi bacho; yeh har client ko kamzor cipher aur purane data rates par kheench lete hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> WPA2 AES-CCMP use karta hai; TKIP WPA ka hai. WPA3-Personal SAE use karta hai, jo offline dictionary attacks ko harata hai. 802.1X port-based network access control hai; AP authenticator hai aur RADIUS authentication server. MAC filtering aur hidden SSIDs asli security nahi hain: MAC addresses aasani se spoof hote hain.</p></div>

<div class="scn"><h4>Coffee shop jaisa password, company network</h4><p>Ek design studio ne apna WPA2-PSK reception area mein ek card par print kiya tha. Lobby mein baithe ek penetration tester ne handshake capture kiya aur aath akshar ka dictionary passphrase minuton mein offline crack kar liya, phir same VLAN par file server tak pahunch gaya. Fix: staff ko directory ke against PEAP ke saath WPA3-Enterprise par shift kiya, visitors ko isolated VLAN par alag guest SSID mila, aur purana PSK SSID hata diya gaya.</p><p><b>Seekh:</b> shared keys leak hoti hain; staff ke liye per-user authentication use karo aur guests ko apne network par rakho.</p></div>

<div class="iv"><p class="q">"WPA2 ke upar WPA3 ke kya fayde hain, aur aap Personal ki jagah Enterprise kab chunoge?"</p><p>Strong answer: WPA3-Personal PSK handshake ko SAE se badalta hai, jo offline dictionary attacks jhel leta hai aur forward secrecy deta hai; WPA3 protected management frames ko mandatory bhi banata hai aur 192-bit Enterprise mode jodta hai; 6 GHz mein yeh zaroori hai, purane clients ke liye transition mode ke saath. Jab bhi bahut users hon Enterprise (RADIUS aur EAP-TLS ya PEAP ke saath 802.1X) chuno: per-user identity, turant revocation, dynamic VLANs aur logging. PSK/SAE chhoti sites aur IoT ke liye rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WEP, WPA ya TKIP kabhi use mat karo; WPA2 AES-CCMP use karta hai; WPA3 SAE, mandatory PMF aur 192-bit Enterprise mode jodta hai.</li>
<li>PSK = AP dwara check hone wala ek shared passphrase; Enterprise = RADIUS ke through 802.1X per-user authentication.</li>
<li>802.1X roles: supplicant, authenticator (AP/controller), authentication server (RADIUS, UDP 1812/1813).</li>
<li>EAP-TLS dono taraf certificates use karta hai; PEAP server certificate aur user password use karta hai.</li>
<li>WPS disable karo; hidden SSIDs aur MAC filters security nahi hain; Enhanced Open open networks encrypt karta hai.</li>
</ul></div>
`}};export{e as default};