var e={id:`eap-types`,h:{en:`EAP types and flows: PEAP, EAP-TLS, EAP-FAST (concept only)`,hi:`EAP types aur flows: PEAP, EAP-TLS, EAP-FAST (concept only)`},body:{en:`
<p>EAP stands for <b>Extensible Authentication Protocol</b>. Think of it as an empty envelope that 802.1X uses to carry a conversation between the client and the authentication server. The envelope is the same for every method; what is inside decides how strong the proof of identity is. Choosing the EAP method is one of the biggest security decisions in an enterprise WLAN. This chapter is <b>concept only</b>: the simulator authenticates a user name and password at RAD1 but does not run the inner exchanges, so you will not configure EAP methods here. You will need them for design questions and for troubleshooting with the server administrator.</p>

<h3>The 802.1X conversation, end to end</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="802.1X EAP flow">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text>
<rect x="265" y="20" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLC (NAS)</text>
<rect x="520" y="20" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="45" text-anchor="middle" class="svg-ink" font-size="13">RADIUS / ISE</text>
<line x1="65" y1="60" x2="65" y2="255" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
<line x1="320" y1="60" x2="320" y2="255" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
<line x1="575" y1="60" x2="575" y2="255" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
<text x="192" y="86" text-anchor="middle" class="svg-muted" font-size="11">1 associate (open system)</text>
<line x1="65" y1="92" x2="320" y2="92" stroke="#64748b" stroke-width="1.5"/>
<text x="192" y="114" text-anchor="middle" class="svg-muted" font-size="11">2 EAP Request / Response identity</text>
<line x1="65" y1="120" x2="320" y2="120" stroke="#64748b" stroke-width="1.5"/>
<text x="447" y="140" text-anchor="middle" class="svg-muted" font-size="11">3 Access-Request (EAP inside)</text>
<line x1="320" y1="146" x2="575" y2="146" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="11">4 method exchange (TLS tunnel, inner proof) relayed both ways</text>
<line x1="65" y1="178" x2="575" y2="178" stroke="#0ea5e9" stroke-width="2"/>
<text x="447" y="200" text-anchor="middle" class="svg-muted" font-size="11">5 Access-Accept + keys + attributes</text>
<line x1="575" y1="206" x2="320" y2="206" stroke="#64748b" stroke-width="1.5"/>
<text x="192" y="228" text-anchor="middle" class="svg-muted" font-size="11">6 EAP-Success, then 4-way handshake</text>
<line x1="320" y1="234" x2="65" y2="234" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="262" text-anchor="middle" class="svg-accent" font-size="12">The controller relays; it never needs the user password.</text>
</svg><p class="cap">Association is open; identity and proof run over EAP; the accept carries the key material for the 4-way handshake.</p></div>
<p>The controller is a relay: it forwards EAP between the client (over EAPOL on the radio) and the server (inside RADIUS). On success the server sends the master key and the controller and client derive session keys in the <b>4-way handshake</b> (you met it in wl-security). Also in the accept: VLAN, ACL, tag and other authorization results (chapters 3 and 4).</p>

<h3>The common methods</h3>
<table class="cmp"><tr><th>Method</th><th>Client proves identity with</th><th>Server proves identity with</th><th>Notes for a defender</th></tr>
<tr><td><b>PEAP</b> (MSCHAPv2 inside)</td><td>User name and password in a TLS tunnel</td><td>Server certificate</td><td>Easy with a directory; security depends on clients validating the server certificate and on password strength</td></tr>
<tr><td><b>EAP-TLS</b></td><td>Client certificate</td><td>Server certificate</td><td>Mutual certificates, no password to steal, strongest; needs a PKI and device enrollment (MDM)</td></tr>
<tr><td><b>EAP-FAST</b></td><td>A PAC (Protected Access Credential) then inner method</td><td>PAC (or certificate)</td><td>Cisco method, avoids certificates on the server side if you provision PACs carefully</td></tr>
<tr><td><b>EAP-TTLS</b></td><td>Inner method (password types) in a tunnel</td><td>Server certificate</td><td>Common on non-Windows clients</td></tr>
<tr><td><b>TEAP</b></td><td>Chained user and machine identity</td><td>Server certificate</td><td>Lets policy see both user and device in one session</td></tr>
</table>
<p>Two patterns to remember: an <b>outer tunnel</b> (TLS) protects an <b>inner method</b> (password or token), or the TLS handshake itself <b>is</b> the authentication (EAP-TLS, with certificates on both sides). Modern EAP-TLS can use TLS 1.3.</p>

<h3>Server identity validation: the part that decides real security</h3>
<p>Every tunnelled method begins with the client receiving the server's certificate. If the client checks it, the client knows it is talking to the real authentication server. If the client does <b>not</b> check (the supplicant is set to "do not validate", or users are allowed to click through a warning), then an <b>impostor access point</b> broadcasting the same SSID can present any certificate and receive the inner credentials. This is a defender's priority because it needs no break of the cryptography, only a client that trusts everyone. Controls:</p>
<ul>
<li>Push the <b>supplicant profile</b> with MDM or group policy: pin the trusted CA, the server name, and disable user prompts to accept new servers.</li>
<li>Prefer <b>EAP-TLS</b> where you can: there is no password to hand over.</li>
<li>Use certificates with proper lifetimes, monitor expiry, and plan renewal before the server certificate on ISE or RADIUS expires. An expired server certificate breaks every user at once.</li>
<li>Detect impostor SSIDs with rogue detection (chapter 9).</li>
</ul>

<h3>What the lab shows, and what it does not</h3>
<p>In the simulator RAD1 checks a user name and password and can return a VLAN. The labs let you practise the controller side: AAA lists, the server group, the policy profile with <code>aaa-override</code>, and the client log. The inner EAP exchange, certificate checks and PAC provisioning are not simulated.</p>
<pre class="out">WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client 0050.7966.6801 on WLAN 2 (NK-CORP): RADIUS server not responding (check address, port and shared secret)
%DOT1X-6-AUTH_SUCCESS: Client 0050.7966.6801 on WLAN 2 (NK-CORP): user alice authenticated</pre>

<div class="eg"><p><b>Worked example.</b> A company has 800 managed laptops and 2,000 BYOD phones. Laptops: EAP-TLS with certificates from the company PKI, pushed by MDM. Phones: PEAP with directory passwords, supplicant profile pinning the CA through an onboarding portal. The security team sets a goal to move phones to certificates too, because password reuse is the weak point of PEAP.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Allowing users to accept unknown server certificates. Letting the RADIUS server certificate expire unnoticed. Choosing PEAP and calling it "certificate-based" (only the server has a certificate). Mixing EAP methods between supplicant and server so the negotiation fails.</p></div>

<div class="exam"><p><b>Exam traps.</b> EAP-TLS is mutual certificate authentication; PEAP needs only a server certificate. PEAP and EAP-FAST use a tunnel; EAP-TLS is the tunnel itself. 802.1X is not an encryption cipher: encryption keys come out of it. The controller does not see the password in 802.1X (unlike web auth).</p></div>

<div class="scn"><h4>The certificate that expired on Monday</h4><p>On Monday morning every corporate laptop failed to join NK-CORP. Controller logs showed authentication failures with no timeout, so RADIUS answered. The security team found the RADIUS server certificate had expired over the weekend, and clients correctly refused it. A renewed certificate restored service in minutes; afterwards they added expiry monitoring thirty days ahead.</p><p><b>Lesson:</b> certificate lifetimes are an operational risk. Strong security still needs a calendar.</p></div>

<div class="iv"><p class="q">"PEAP or EAP-TLS for a new enterprise WLAN, and why?"</p><p>EAP-TLS if I can issue and manage client certificates (MDM and PKI): mutual authentication and no password to phish or reuse. PEAP as a transition for unmanaged devices, with a supplicant profile that pins the CA and server name so clients cannot be tricked into trusting an impostor. Mention certificate renewal as an operational duty.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EAP carries the 802.1X conversation; the controller relays it and does not see the password.</li>
<li>PEAP: server certificate plus inner password. EAP-TLS: certificates on both sides. EAP-FAST: PAC based.</li>
<li>Clients must validate the server certificate; this is what makes tunnelled methods safe.</li>
<li>Expired server certificates break everyone, so monitor lifetimes.</li>
<li>EAP inner exchanges are concept only in the simulator.</li>
</ul></div>
`,hi:`
<p>EAP ka matlab hai <b>Extensible Authentication Protocol</b>. Ise ek khaali lifafa samjho jo 802.1X client aur authentication server ke beech baatcheet le jaane ke liye use karta hai. Lifafa har method ke liye same hai; andar kya hai woh tay karta hai ki pehchaan ka proof kitna strong hai. EAP method chunna enterprise WLAN ke sabse bade security decisions mein se ek hai. Yeh chapter <b>concept only</b> hai: simulator RAD1 par user name aur password authenticate karta hai lekin inner exchanges run nahi karta, isliye aap yahan EAP methods configure nahi karoge. Design questions aur server administrator ke saath troubleshooting ke liye aapko inki zaroorat padegi.</p>

<h3>802.1X conversation, shuru se end tak</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="802.1X EAP flow">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text>
<rect x="265" y="20" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLC (NAS)</text>
<rect x="520" y="20" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="45" text-anchor="middle" class="svg-ink" font-size="13">RADIUS / ISE</text>
<line x1="65" y1="60" x2="65" y2="255" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
<line x1="320" y1="60" x2="320" y2="255" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
<line x1="575" y1="60" x2="575" y2="255" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
<text x="192" y="86" text-anchor="middle" class="svg-muted" font-size="11">1 associate (open system)</text>
<line x1="65" y1="92" x2="320" y2="92" stroke="#64748b" stroke-width="1.5"/>
<text x="192" y="114" text-anchor="middle" class="svg-muted" font-size="11">2 EAP Request / Response identity</text>
<line x1="65" y1="120" x2="320" y2="120" stroke="#64748b" stroke-width="1.5"/>
<text x="447" y="140" text-anchor="middle" class="svg-muted" font-size="11">3 Access-Request (andar EAP)</text>
<line x1="320" y1="146" x2="575" y2="146" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="11">4 method exchange (TLS tunnel, inner proof) dono taraf relay</text>
<line x1="65" y1="178" x2="575" y2="178" stroke="#0ea5e9" stroke-width="2"/>
<text x="447" y="200" text-anchor="middle" class="svg-muted" font-size="11">5 Access-Accept + keys + attributes</text>
<line x1="575" y1="206" x2="320" y2="206" stroke="#64748b" stroke-width="1.5"/>
<text x="192" y="228" text-anchor="middle" class="svg-muted" font-size="11">6 EAP-Success, phir 4-way handshake</text>
<line x1="320" y1="234" x2="65" y2="234" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="262" text-anchor="middle" class="svg-accent" font-size="12">Controller relay karta hai; use user password ki zaroorat nahi.</text>
</svg><p class="cap">Association open hota hai; identity aur proof EAP par chalte hain; accept 4-way handshake ke liye key material carry karta hai.</p></div>
<p>Controller relay hai: woh EAP ko client (radio par EAPOL ke zariye) aur server (RADIUS ke andar) ke beech forward karta hai. Success par server master key bhejta hai aur controller aur client <b>4-way handshake</b> mein session keys derive karte hain (wl-security mein dekha tha). Accept mein VLAN, ACL, tag aur doosre authorization results bhi hote hain (chapters 3 aur 4).</p>

<h3>Common methods</h3>
<table class="cmp"><tr><th>Method</th><th>Client pehchaan kaise prove karta hai</th><th>Server pehchaan kaise prove karta hai</th><th>Defender ke liye notes</th></tr>
<tr><td><b>PEAP</b> (andar MSCHAPv2)</td><td>TLS tunnel mein user name aur password</td><td>Server certificate</td><td>Directory ke saath aasaan; security is par depend karti hai ki clients server certificate validate karte hain aur password kitna strong hai</td></tr>
<tr><td><b>EAP-TLS</b></td><td>Client certificate</td><td>Server certificate</td><td>Mutual certificates, churane ke liye password nahi, sabse strong; PKI aur device enrollment (MDM) chahiye</td></tr>
<tr><td><b>EAP-FAST</b></td><td>PAC (Protected Access Credential) phir inner method</td><td>PAC (ya certificate)</td><td>Cisco method, PACs dhyaan se provision karo to server side certificates ki zaroorat nahi</td></tr>
<tr><td><b>EAP-TTLS</b></td><td>Tunnel mein inner method (password types)</td><td>Server certificate</td><td>Non-Windows clients par common</td></tr>
<tr><td><b>TEAP</b></td><td>Chained user aur machine identity</td><td>Server certificate</td><td>Policy ko ek session mein user aur device dono dikhne deta hai</td></tr>
</table>
<p>Do patterns yaad rakho: ek <b>outer tunnel</b> (TLS) ek <b>inner method</b> (password ya token) ko protect karta hai, ya TLS handshake khud hi <b>authentication hai</b> (EAP-TLS, dono taraf certificates ke saath). Modern EAP-TLS TLS 1.3 use kar sakta hai.</p>

<h3>Server identity validation: woh hissa jo asli security tay karta hai</h3>
<p>Har tunnelled method is se shuru hota hai ki client ko server ka certificate milta hai. Agar client use check kare, to client jaanta hai ki woh asli authentication server se baat kar raha hai. Agar client check <b>nahi</b> karta (supplicant "do not validate" par hai, ya users ko warning par click karke aage badhne ki ijaazat hai), to same SSID broadcast karne wala <b>impostor access point</b> koi bhi certificate dikha kar inner credentials le sakta hai. Yeh defender ki priority hai kyunki ismein cryptography tootne ki zaroorat nahi, bas aisa client chahiye jo sab par bharosa kare. Controls:</p>
<ul>
<li><b>Supplicant profile</b> ko MDM ya group policy se push karo: trusted CA, server name pin karo, aur naye servers accept karne ke user prompts disable karo.</li>
<li>Jahan ho sake <b>EAP-TLS</b> prefer karo: dene ke liye password hi nahi hota.</li>
<li>Sahi lifetimes wale certificates use karo, expiry monitor karo, aur ISE ya RADIUS ke server certificate ke expire hone se pehle renewal plan karo. Expired server certificate ek saath har user ko tod deta hai.</li>
<li>Impostor SSIDs ko rogue detection se pakdo (chapter 9).</li>
</ul>

<h3>Lab kya dikhati hai, aur kya nahi</h3>
<p>Simulator mein RAD1 user name aur password check karta hai aur VLAN return kar sakta hai. Labs aapko controller side practise karne deti hain: AAA lists, server group, <code>aaa-override</code> ke saath policy profile, aur client log. Inner EAP exchange, certificate checks aur PAC provisioning simulate nahi hote.</p>
<pre class="out">WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client 0050.7966.6801 on WLAN 2 (NK-CORP): RADIUS server not responding (check address, port and shared secret)
%DOT1X-6-AUTH_SUCCESS: Client 0050.7966.6801 on WLAN 2 (NK-CORP): user alice authenticated</pre>

<div class="eg"><p><b>Worked example.</b> Ek company ke paas 800 managed laptops aur 2,000 BYOD phones hain. Laptops: company PKI ke certificates ke saath EAP-TLS, MDM se push. Phones: directory passwords ke saath PEAP, onboarding portal ke zariye CA pin karne wala supplicant profile. Security team lakshya rakhti hai ki phones ko bhi certificates par le jaaye, kyunki password reuse PEAP ka kamzor point hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Users ko unknown server certificates accept karne dena. RADIUS server certificate ko bina dhyaan ke expire hone dena. PEAP chun kar use "certificate-based" kehna (sirf server ke paas certificate hai). Supplicant aur server ke beech EAP methods mix karna jisse negotiation fail ho.</p></div>

<div class="exam"><p><b>Exam traps.</b> EAP-TLS mutual certificate authentication hai; PEAP ko sirf server certificate chahiye. PEAP aur EAP-FAST tunnel use karte hain; EAP-TLS khud tunnel hai. 802.1X encryption cipher nahi hai: encryption keys usse nikalti hain. 802.1X mein controller password nahi dekhta (web auth se alag).</p></div>

<div class="scn"><h4>Certificate jo Monday ko expire hua</h4><p>Monday subah har corporate laptop NK-CORP join karne mein fail hua. Controller logs mein authentication failures the lekin timeout nahi, matlab RADIUS ne jawab diya. Security team ne paaya ki RADIUS server certificate weekend mein expire ho gaya tha, aur clients ne sahi tarah use refuse kiya. Renewed certificate ne minutes mein service wapas ki; baad mein unhone tees din pehle expiry monitoring joda.</p><p><b>Lesson:</b> certificate lifetimes operational risk hain. Strong security ko bhi calendar chahiye.</p></div>

<div class="iv"><p class="q">"Naye enterprise WLAN ke liye PEAP ya EAP-TLS, aur kyun?"</p><p>EAP-TLS agar client certificates issue aur manage kar sakte hain (MDM aur PKI): mutual authentication aur phish ya reuse karne ke liye password nahi. PEAP unmanaged devices ke liye transition ke taur par, aise supplicant profile ke saath jo CA aur server name pin kare taaki clients ko impostor par bharosa karne ke liye na bahkaya ja sake. Certificate renewal ko operational duty ke taur par mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EAP 802.1X ki baatcheet carry karta hai; controller relay karta hai aur password nahi dekhta.</li>
<li>PEAP: server certificate plus inner password. EAP-TLS: dono taraf certificates. EAP-FAST: PAC based.</li>
<li>Clients ko server certificate validate karna chahiye; yahi tunnelled methods ko safe banata hai.</li>
<li>Expired server certificates sabko tod dete hain, isliye lifetimes monitor karo.</li>
<li>EAP inner exchanges simulator mein concept only hain.</li>
</ul></div>
`}};export{e as default};