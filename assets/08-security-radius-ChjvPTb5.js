var e={id:`security-radius`,h:{en:`WPA2/WPA3 Personal and Enterprise: PSK, SAE and RADIUS on the WLC`,hi:`WPA2/WPA3 Personal aur Enterprise: WLC par PSK, SAE aur RADIUS`},body:{en:`
<p>A small office locks its door with one key copied for every employee: easy, but when someone leaves, every lock must change. A large company gives each employee a personal badge checked by a security desk: more work to set up, but one badge can be cancelled without touching anybody else's. That is <b>Personal</b> (one shared passphrase) versus <b>Enterprise</b> (per-user login checked by a RADIUS server). In ccna-wireless you learned the theory of WPA2, WPA3, PSK, SAE and 802.1X. Here you configure them on the controller.</p>

<h3>Quick recap of the options</h3>
<table class="cmp"><tr><th>Mode</th><th>Authentication (AKM)</th><th>Encryption</th><th>Credentials</th></tr>
<tr><td>WPA2-Personal</td><td>PSK</td><td>AES-CCMP</td><td>One shared passphrase (8 to 63 ASCII characters)</td></tr>
<tr><td>WPA3-Personal</td><td><b>SAE</b></td><td>AES-CCMP / GCMP, <b>PMF required</b></td><td>Shared passphrase, but resistant to offline dictionary attacks</td></tr>
<tr><td>WPA2-Enterprise</td><td>802.1X/EAP</td><td>AES-CCMP</td><td>Per-user, checked by RADIUS</td></tr>
<tr><td>WPA3-Enterprise</td><td>802.1X/EAP (optional 192-bit mode)</td><td>AES-GCMP-256 in 192-bit mode, PMF required</td><td>Per-user, checked by RADIUS</td></tr>
</table>

<h3>WPA2-Personal (you built it in the last chapter)</h3>
<p>Security &gt; Layer 2: Layer 2 Security <i>WPA+WPA2</i> (called <i>WPA2+WPA3</i> on newer releases), WPA2 Policy ticked, encryption <b>AES</b>, Authentication Key Management <b>PSK</b> enabled and <b>802.1X</b> disabled, PSK format ASCII, then the key.</p>

<h3>WPA3-Personal with SAE</h3>
<pre class="code"><span class="c">! a WPA3-only WLAN for new laptops, clients in VLAN 20</span>
(WLC1) &gt;config wlan create 4 SECURE NK-SECURE
(WLC1) &gt;config wlan interface 4 staff
(WLC1) &gt;config wlan security wpa wpa2 disable 4
(WLC1) &gt;config wlan security wpa wpa3 enable 4
(WLC1) &gt;config wlan security wpa akm 802.1x disable 4
(WLC1) &gt;config wlan security wpa akm sae enable 4
(WLC1) &gt;config wlan security wpa akm psk set-key ascii NkSecure@2024 4
(WLC1) &gt;config wlan enable 4
<span class="c">! real AireOS: WPA3 also needs Protected Management Frames</span>
<span class="c">! config wlan security pmf required 4   (not needed in the lab)</span></pre>
<p>The SAE passphrase is stored in the same key field as the PSK. <b>Transition mode</b> enables WPA2 + PSK and WPA3 + SAE together on one SSID, so older devices keep using WPA2 while new ones use WPA3; PMF is then <i>optional</i> instead of required.</p>

<h3>Enterprise: who does what</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="802.1X roles on a controller-based WLAN">
<rect x="10" y="80" width="130" height="56" rx="8" fill="#e2e8f0"/><text x="75" y="103" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text><text x="75" y="122" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="190" y="80" width="110" height="56" rx="8" fill="#fed7aa"/><text x="245" y="103" text-anchor="middle" class="svg-ink" font-size="13">AP1</text><text x="245" y="122" text-anchor="middle" class="svg-muted" font-size="12">relays EAP</text>
<rect x="350" y="80" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="410" y="103" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="410" y="122" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<rect x="510" y="80" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="570" y="103" text-anchor="middle" class="svg-ink" font-size="13">RAD1</text><text x="570" y="122" text-anchor="middle" class="svg-muted" font-size="12">auth server</text>
<line x1="140" y1="108" x2="190" y2="108" stroke="#64748b" stroke-width="2"/><text x="165" y="70" text-anchor="middle" class="svg-accent" font-size="12">EAPoL</text>
<line x1="300" y1="108" x2="350" y2="108" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="325" y="70" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP</text>
<line x1="470" y1="108" x2="510" y2="108" stroke="#64748b" stroke-width="2"/><text x="490" y="70" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="490" y="170" text-anchor="middle" class="svg-muted" font-size="12">UDP 1812, secret NkRadius1</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">RAD1 must know WLC1 as a client: source 10.10.99.10 (management interface)</text>
</svg><p class="cap">The WLC is the authenticator and the RADIUS client. The AP only relays EAP frames inside CAPWAP.</p></div>
<ul>
<li><b>Supplicant</b>: the client software on the laptop that holds the username/password or certificate.</li>
<li><b>Authenticator</b>: the WLC (with the AP). It blocks all data from the client except EAP until the RADIUS server says yes.</li>
<li><b>Authentication server</b>: RADIUS (for example Cisco ISE). It checks the credentials and returns <i>Access-Accept</i> or <i>Access-Reject</i>, optionally with a VLAN or ACL.</li>
</ul>
<p>Common EAP methods: <b>EAP-TLS</b> (certificates on both sides, strongest), <b>PEAP</b> (server certificate plus username/password inside a TLS tunnel, very common), <b>EAP-FAST</b> (Cisco, uses a PAC instead of certificates).</p>

<h3>Configuring WPA2-Enterprise (lab: WPA2-Enterprise WLAN with RADIUS)</h3>
<p>GUI: <b>Security &gt; AAA &gt; RADIUS &gt; Authentication &gt; New</b> (server IP, shared secret, port 1812). Then on the WLAN: Security &gt; Layer 2 WPA2 with AKM 802.1X, and Security &gt; <b>AAA Servers</b> select server 1. CLI:</p>
<pre class="code"><span class="c">! 1. make WLC1 a RADIUS client of RAD1</span>
(WLC1) &gt;config radius auth add 1 10.10.50.20 1812 ascii NkRadius1
<span class="c">! 2. on the RADIUS server, register the WLC (lab server syntax)</span>
RAD1&gt; aaa-server client 10.10.99.10 key NkRadius1
<span class="c">! 3. an interface for corporate clients</span>
(WLC1) &gt;config interface create corp 40
(WLC1) &gt;config interface address dynamic-interface corp 10.10.40.5 255.255.255.0 10.10.40.1
<span class="c">! 4. the WLAN: default security is already WPA2 + 802.1X</span>
(WLC1) &gt;config wlan create 2 CORP NK-CORP
(WLC1) &gt;config wlan interface 2 corp
(WLC1) &gt;config wlan radius_server auth add 2 1
(WLC1) &gt;config wlan enable 2</pre>

<pre class="out">(WLC1) &gt;show radius summary

Authentication Servers

Idx  Server Address   Port   State     Requests  Timeouts
---  ---------------  -----  --------  --------  --------
<span class="hl">1    10.10.50.20      1812   Enabled   2         0</span>

LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
...
<span class="hl">DDORA IP 10.10.40.21/24 GW 10.10.40.1</span></pre>

<div class="eg"><p><b>Worked example.</b> Why must RAD1 know <b>10.10.99.10</b> and not 10.10.40.5 or the AP address? RADIUS requests are generated by the controller and sourced from its <b>management interface</b>. RAD1 looks up the source IP in its client list to find the shared secret. If the WLC is registered as 10.10.40.5, RAD1 treats 10.10.99.10 as unknown and silently drops the request. The WLC then counts a timeout, and alice sees "authentication failed".</p></div>

<div class="warn"><p><b>Common mistakes.</b> Shared secret typed differently on the WLC and the RADIUS server (the server silently discards the packets, you see only timeouts). Registering the wrong WLC source IP on the server. Forgetting to untick 802.1X when building a PSK WLAN, or forgetting to select the RADIUS server under AAA Servers on an 802.1X WLAN. Using WPA3-SAE with old clients that do not support it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Supplicant = client, authenticator = WLC/AP, authentication server = RADIUS. RADIUS uses <b>UDP 1812</b> (authentication) and <b>1813</b> (accounting). WPA3-Personal = <b>SAE</b> and <b>PMF mandatory</b>. PSK length: 8 to 63 ASCII characters (or 64 hex digits). The exam's GUI task is a WPA2 <b>PSK</b> WLAN.</p></div>

<div class="scn"><h4>The secret with a trailing space</h4><p>After a new corporate WLAN went live, nobody could log in. The RADIUS server's live log was empty, as if no request ever arrived. <code>show radius summary</code> on the WLC showed Requests and Timeouts climbing together. A packet capture on the server proved the requests were arriving from 10.10.99.10. The server's client entry had been pasted from an email with a trailing space in the shared secret, so every request failed its authenticator check and was dropped without a reply. Retyping the secret on both sides fixed it at once.</p><p><b>Lesson:</b> "RADIUS timeouts with the server reachable" almost always means a wrong shared secret or a wrong client IP on the server.</p></div>

<div class="iv"><p class="q">"Compare WPA2-Personal, WPA3-Personal and WPA2-Enterprise. When would you use each?"</p><p>Strong answer: WPA2-Personal uses one pre-shared key with AES; simple but a leaked key affects everybody and weak keys can be cracked offline from a captured handshake. WPA3-Personal replaces PSK with SAE, which resists offline dictionary attacks and gives forward secrecy, and requires PMF. WPA2/WPA3-Enterprise uses 802.1X with a RADIUS server so each user has their own credentials, access can be revoked per user, and RADIUS can assign VLANs. Use Personal for small sites or IoT, Enterprise for corporate users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Personal = shared passphrase (PSK in WPA2, SAE in WPA3); Enterprise = 802.1X with RADIUS.</li>
<li>WPA3-Personal: disable WPA2, enable WPA3 and AKM SAE, set the key; PMF is required.</li>
<li>On an 802.1X WLAN the WLC is the authenticator and RADIUS client, sourcing requests from the management IP.</li>
<li>Register the WLC's management IP and the same shared secret on the RADIUS server.</li>
<li>Verify with show wlan, show radius summary (requests vs timeouts) and a real client login.</li>
</ul></div>
`,hi:`
<p>Ek chhota office apna darwaza ek chaabi se lock karta hai jiski copy har employee ke paas hai: aasaan, lekin jab koi chhod kar jaata hai, har lock badalna padta hai. Ek badi company har employee ko personal badge deti hai jo security desk check karta hai: set up karne mein zyada kaam, lekin ek badge kisi aur ko chhue bina cancel ho sakta hai. Yahi <b>Personal</b> (ek shared passphrase) vs <b>Enterprise</b> (RADIUS server se check hone wala per-user login) hai. ccna-wireless mein aapne WPA2, WPA3, PSK, SAE aur 802.1X ki theory seekhi. Yahan aap unhe controller par configure karoge.</p>

<h3>Options ka quick recap</h3>
<table class="cmp"><tr><th>Mode</th><th>Authentication (AKM)</th><th>Encryption</th><th>Credentials</th></tr>
<tr><td>WPA2-Personal</td><td>PSK</td><td>AES-CCMP</td><td>Ek shared passphrase (8 se 63 ASCII characters)</td></tr>
<tr><td>WPA3-Personal</td><td><b>SAE</b></td><td>AES-CCMP / GCMP, <b>PMF zaroori</b></td><td>Shared passphrase, lekin offline dictionary attacks ke khilaf mazboot</td></tr>
<tr><td>WPA2-Enterprise</td><td>802.1X/EAP</td><td>AES-CCMP</td><td>Per-user, RADIUS se check</td></tr>
<tr><td>WPA3-Enterprise</td><td>802.1X/EAP (optional 192-bit mode)</td><td>192-bit mode mein AES-GCMP-256, PMF zaroori</td><td>Per-user, RADIUS se check</td></tr>
</table>

<h3>WPA2-Personal (pichhle chapter mein banaya)</h3>
<p>Security &gt; Layer 2: Layer 2 Security <i>WPA+WPA2</i> (nayi releases mein <i>WPA2+WPA3</i> kehlata hai), WPA2 Policy ticked, encryption <b>AES</b>, Authentication Key Management mein <b>PSK</b> enabled aur <b>802.1X</b> disabled, PSK format ASCII, phir key.</p>

<h3>SAE ke saath WPA3-Personal</h3>
<pre class="code"><span class="c">! naye laptops ke liye WPA3-only WLAN, clients VLAN 20 mein</span>
(WLC1) &gt;config wlan create 4 SECURE NK-SECURE
(WLC1) &gt;config wlan interface 4 staff
(WLC1) &gt;config wlan security wpa wpa2 disable 4
(WLC1) &gt;config wlan security wpa wpa3 enable 4
(WLC1) &gt;config wlan security wpa akm 802.1x disable 4
(WLC1) &gt;config wlan security wpa akm sae enable 4
(WLC1) &gt;config wlan security wpa akm psk set-key ascii NkSecure@2024 4
(WLC1) &gt;config wlan enable 4
<span class="c">! real AireOS: WPA3 ko Protected Management Frames bhi chahiye</span>
<span class="c">! config wlan security pmf required 4   (lab mein zaroorat nahi)</span></pre>
<p>SAE passphrase PSK wale same key field mein store hota hai. <b>Transition mode</b> ek hi SSID par WPA2 + PSK aur WPA3 + SAE dono enable karta hai, taaki purane devices WPA2 use karte rahein aur naye WPA3; tab PMF required ki jagah <i>optional</i> hota hai.</p>

<h3>Enterprise: kaun kya karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Controller-based WLAN par 802.1X roles">
<rect x="10" y="80" width="130" height="56" rx="8" fill="#e2e8f0"/><text x="75" y="103" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text><text x="75" y="122" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="190" y="80" width="110" height="56" rx="8" fill="#fed7aa"/><text x="245" y="103" text-anchor="middle" class="svg-ink" font-size="13">AP1</text><text x="245" y="122" text-anchor="middle" class="svg-muted" font-size="12">EAP relay karta</text>
<rect x="350" y="80" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="410" y="103" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="410" y="122" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<rect x="510" y="80" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="570" y="103" text-anchor="middle" class="svg-ink" font-size="13">RAD1</text><text x="570" y="122" text-anchor="middle" class="svg-muted" font-size="12">auth server</text>
<line x1="140" y1="108" x2="190" y2="108" stroke="#64748b" stroke-width="2"/><text x="165" y="70" text-anchor="middle" class="svg-accent" font-size="12">EAPoL</text>
<line x1="300" y1="108" x2="350" y2="108" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="325" y="70" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP</text>
<line x1="470" y1="108" x2="510" y2="108" stroke="#64748b" stroke-width="2"/><text x="490" y="70" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="490" y="170" text-anchor="middle" class="svg-muted" font-size="12">UDP 1812, secret NkRadius1</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">RAD1 ko WLC1 client ke roop mein pata hona chahiye: source 10.10.99.10 (management)</text>
</svg><p class="cap">WLC authenticator aur RADIUS client hai. AP sirf EAP frames ko CAPWAP ke andar relay karta hai.</p></div>
<ul>
<li><b>Supplicant</b>: laptop par client software jo username/password ya certificate rakhta hai.</li>
<li><b>Authenticator</b>: WLC (AP ke saath). Jab tak RADIUS server haan na bole, yeh client ka EAP ke alawa saara data block karta hai.</li>
<li><b>Authentication server</b>: RADIUS (jaise Cisco ISE). Yeh credentials check karta hai aur <i>Access-Accept</i> ya <i>Access-Reject</i> lautata hai, optionally VLAN ya ACL ke saath.</li>
</ul>
<p>Common EAP methods: <b>EAP-TLS</b> (dono taraf certificates, sabse mazboot), <b>PEAP</b> (server certificate plus TLS tunnel ke andar username/password, bahut common), <b>EAP-FAST</b> (Cisco, certificates ki jagah PAC use karta hai).</p>

<h3>WPA2-Enterprise configure karna (lab: WPA2-Enterprise WLAN with RADIUS)</h3>
<p>GUI: <b>Security &gt; AAA &gt; RADIUS &gt; Authentication &gt; New</b> (server IP, shared secret, port 1812). Phir WLAN par: Security &gt; Layer 2 mein AKM 802.1X ke saath WPA2, aur Security &gt; <b>AAA Servers</b> mein server 1 select karo. CLI:</p>
<pre class="code"><span class="c">! 1. WLC1 ko RAD1 ka RADIUS client banao</span>
(WLC1) &gt;config radius auth add 1 10.10.50.20 1812 ascii NkRadius1
<span class="c">! 2. RADIUS server par WLC register karo (lab server syntax)</span>
RAD1&gt; aaa-server client 10.10.99.10 key NkRadius1
<span class="c">! 3. corporate clients ke liye interface</span>
(WLC1) &gt;config interface create corp 40
(WLC1) &gt;config interface address dynamic-interface corp 10.10.40.5 255.255.255.0 10.10.40.1
<span class="c">! 4. WLAN: default security pehle se WPA2 + 802.1X hai</span>
(WLC1) &gt;config wlan create 2 CORP NK-CORP
(WLC1) &gt;config wlan interface 2 corp
(WLC1) &gt;config wlan radius_server auth add 2 1
(WLC1) &gt;config wlan enable 2</pre>

<pre class="out">(WLC1) &gt;show radius summary

Authentication Servers

Idx  Server Address   Port   State     Requests  Timeouts
---  ---------------  -----  --------  --------  --------
<span class="hl">1    10.10.50.20      1812   Enabled   2         0</span>

LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
...
<span class="hl">DDORA IP 10.10.40.21/24 GW 10.10.40.1</span></pre>

<div class="eg"><p><b>Worked example.</b> RAD1 ko <b>10.10.99.10</b> kyun pata hona chahiye, 10.10.40.5 ya AP address kyun nahi? RADIUS requests controller generate karta hai aur woh uske <b>management interface</b> se source hoti hain. RAD1 shared secret dhoondhne ke liye source IP ko apni client list mein dekhta hai. Agar WLC 10.10.40.5 ke roop mein registered hai, RAD1 10.10.99.10 ko anjaan maanta hai aur request chupchaap drop kar deta hai. Phir WLC ek timeout ginta hai, aur alice ko "authentication failed" dikhta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> WLC aur RADIUS server par shared secret alag type hona (server packets chupchaap discard karta hai, aapko sirf timeouts dikhte hain). Server par galat WLC source IP register karna. PSK WLAN banate waqt 802.1X untick karna bhoolna, ya 802.1X WLAN par AAA Servers mein RADIUS server select karna bhoolna. Aise purane clients ke saath WPA3-SAE use karna jo ise support nahi karte.</p></div>

<div class="exam"><p><b>Exam trap.</b> Supplicant = client, authenticator = WLC/AP, authentication server = RADIUS. RADIUS <b>UDP 1812</b> (authentication) aur <b>1813</b> (accounting) use karta hai. WPA3-Personal = <b>SAE</b> aur <b>PMF mandatory</b>. PSK length: 8 se 63 ASCII characters (ya 64 hex digits). Exam ka GUI task WPA2 <b>PSK</b> WLAN hai.</p></div>

<div class="scn"><h4>Aakhir mein space wala secret</h4><p>Naya corporate WLAN live hone ke baad koi login nahi kar pa raha tha. RADIUS server ka live log khaali tha, jaise koi request kabhi aayi hi nahi. WLC par <code>show radius summary</code> mein Requests aur Timeouts saath saath badh rahe the. Server par packet capture ne saabit kiya ki requests 10.10.99.10 se aa rahi thi. Server ki client entry ek email se paste hui thi jismein shared secret ke aakhir mein ek space tha, isliye har request apna authenticator check fail karti aur bina reply ke drop ho jaati. Dono taraf secret dobara type karne se turant fix ho gaya.</p><p><b>Seekh:</b> "server reachable hone ke bawajood RADIUS timeouts" ka matlab lagbhag hamesha galat shared secret ya server par galat client IP hota hai.</p></div>

<div class="iv"><p class="q">"WPA2-Personal, WPA3-Personal aur WPA2-Enterprise compare karo. Har ek kab use karoge?"</p><p>Strong answer: WPA2-Personal AES ke saath ek pre-shared key use karta hai; simple hai lekin leak hui key sabko affect karti hai aur kamzor keys captured handshake se offline crack ho sakti hain. WPA3-Personal PSK ki jagah SAE use karta hai, jo offline dictionary attacks rokta hai aur forward secrecy deta hai, aur PMF maangta hai. WPA2/WPA3-Enterprise RADIUS server ke saath 802.1X use karta hai taaki har user ke apne credentials hon, access per user revoke ho sake, aur RADIUS VLANs assign kar sake. Chhoti sites ya IoT ke liye Personal, corporate users ke liye Enterprise.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Personal = shared passphrase (WPA2 mein PSK, WPA3 mein SAE); Enterprise = RADIUS ke saath 802.1X.</li>
<li>WPA3-Personal: WPA2 disable, WPA3 aur AKM SAE enable, key set karo; PMF zaroori hai.</li>
<li>802.1X WLAN par WLC authenticator aur RADIUS client hai, requests management IP se source karta hai.</li>
<li>RADIUS server par WLC ka management IP aur same shared secret register karo.</li>
<li>show wlan, show radius summary (requests vs timeouts) aur real client login se verify karo.</li>
</ul></div>
`}};export{e as default};