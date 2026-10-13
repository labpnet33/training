var e={id:`wpa`,h:{en:`Wireless security protocols: WPA, WPA2 and WPA3`,hi:`Wireless security protocols: WPA, WPA2 aur WPA3`},body:{en:`
<p>A wired network is like a conversation inside a closed room: to listen, you must get into the room. Wireless is like talking in a park: anyone within range can hear every word. So wireless security must do two jobs that a switch port gets almost for free: prove who is allowed to join (<b>authentication</b>) and scramble every frame so bystanders hear only noise (<b>encryption</b> with <b>integrity</b>). You met the radio side in the Wireless principles module; here we compare the protocols the exam names.</p>

<h3>From WEP to WPA3</h3>
<table class="cmp"><tr><th></th><th>WEP</th><th>WPA</th><th>WPA2</th><th>WPA3</th></tr>
<tr><td>Year</td><td>1997</td><td>2003</td><td>2004</td><td>2018</td></tr>
<tr><td>Encryption</td><td>RC4, static key</td><td>TKIP (RC4-based, per-packet keys)</td><td>AES-CCMP</td><td>AES-CCMP; AES-GCMP-256 in 192-bit mode</td></tr>
<tr><td>Integrity</td><td>CRC (weak)</td><td>MIC ("Michael")</td><td>CCMP MIC</td><td>CCMP/GCMP MIC</td></tr>
<tr><td>Personal auth</td><td>Shared key</td><td>PSK</td><td>PSK with 4-way handshake</td><td><b>SAE</b></td></tr>
<tr><td>Enterprise auth</td><td>-</td><td>802.1X</td><td>802.1X / EAP + RADIUS</td><td>802.1X, optional 192-bit suite</td></tr>
<tr><td>Management frames</td><td>Unprotected</td><td>Unprotected</td><td>PMF optional</td><td><b>PMF mandatory</b></td></tr>
<tr><td>Status</td><td>Broken, never use</td><td>Deprecated</td><td>Still common</td><td>Current best practice</td></tr></table>
<p><b>WEP</b> was cracked in minutes because of its short initialisation vector and static keys. <b>WPA</b> was a quick fix that could run on old hardware using <b>TKIP</b>; it is now deprecated. <b>WPA2</b>, based on IEEE 802.11i, introduced <b>AES-CCMP</b>, which is still strong. <b>WPA3</b> fixes WPA2's weak points in personal mode and makes management-frame protection mandatory.</p>

<h3>Personal versus Enterprise</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Personal and Enterprise wireless authentication">
<text x="160" y="24" text-anchor="middle" class="svg-ink" font-size="14">Personal</text>
<rect x="20" y="40" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="190" y="40" width="110" height="46" rx="8" fill="#bae6fd"/><text x="245" y="68" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="130" y1="63" x2="190" y2="63" stroke="#64748b" stroke-width="2"/>
<text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">one shared passphrase</text>
<text x="160" y="128" text-anchor="middle" class="svg-muted" font-size="12">for every user</text>
<text x="480" y="24" text-anchor="middle" class="svg-ink" font-size="14">Enterprise</text>
<rect x="340" y="40" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="385" y="68" text-anchor="middle" class="svg-ink" font-size="12">Supplicant</text>
<rect x="450" y="40" width="80" height="46" rx="8" fill="#bae6fd"/><text x="490" y="68" text-anchor="middle" class="svg-ink" font-size="12">AP/WLC</text>
<rect x="550" y="40" width="80" height="46" rx="8" fill="#ddd6fe"/><text x="590" y="68" text-anchor="middle" class="svg-ink" font-size="12">RADIUS</text>
<line x1="430" y1="63" x2="450" y2="63" stroke="#64748b" stroke-width="2"/><line x1="530" y1="63" x2="550" y2="63" stroke="#64748b" stroke-width="2"/>
<text x="485" y="110" text-anchor="middle" class="svg-muted" font-size="12">each user's own credentials</text>
<text x="485" y="128" text-anchor="middle" class="svg-muted" font-size="12">or certificate, via 802.1X/EAP</text>
<rect x="120" y="160" width="400" height="44" rx="8" fill="#fde68a"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="13">Both end with a 4-way handshake that creates per-session keys</text>
</svg><p class="cap">Personal: everyone knows the same secret. Enterprise: every user proves their own identity to a RADIUS server.</p></div>
<p><b>Personal</b> mode (home, small office) uses one passphrase for everybody. If one person leaves, you must change it on every device. <b>Enterprise</b> mode uses 802.1X: the client (supplicant) authenticates through the AP or wireless controller (authenticator) to a RADIUS server with its own username and password (PEAP) or certificate (EAP-TLS). Each user can be revoked individually, assigned a VLAN, and logged. This is the same 802.1X you met on wired ports.</p>

<h3>WPA2 and the 4-way handshake</h3>
<p>In both modes, after authentication the client and AP run the <b>4-way handshake</b>. They exchange random numbers (nonces) and derive fresh session keys from the <b>pairwise master key (PMK)</b>. In WPA2-Personal, the PMK comes straight from the passphrase and SSID. That is the weakness: an attacker who records one handshake can try millions of passphrases <b>offline</b>, with no lockout, until one produces matching values. A weak passphrase falls quickly.</p>

<h3>What WPA3 changes</h3>
<ul>
<li><b>SAE</b> (Simultaneous Authentication of Equals) replaces the PSK exchange in WPA3-Personal. Each password guess requires a live exchange with the AP, so offline dictionary attacks do not work. SAE also gives <b>forward secrecy</b>: learning the password later does not decrypt traffic recorded earlier.</li>
<li><b>Protected Management Frames (PMF, 802.11w)</b> are mandatory, which stops forged deauthentication frames used to kick clients off or push them to an evil twin.</li>
<li><b>WPA3-Enterprise 192-bit mode</b> uses a stronger suite (GCMP-256 and matching hashes and curves) for government and high-security networks.</li>
<li><b>Transition mode</b> lets WPA2 and WPA3 clients join the same SSID during migration.</li>
<li><b>Enhanced Open (OWE)</b>, a companion certification, encrypts open guest networks without a password.</li>
</ul>

<h3>What a client shows</h3>
<pre class="out">C:\\&gt; netsh wlan show interfaces
    State                  : connected
    SSID                   : NK-STAFF
    Radio type             : 802.11ax
<span class="hl">    Authentication         : WPA3-Personal
    Cipher                 : CCMP</span>
    Channel                : 36
    Signal                 : 92%</pre>

<div class="eg"><p><b>Worked example.</b> A 40-person office runs WPA2-Personal with passphrase "Office@123", shared for five years. Risks: anyone who ever worked there knows it; a captured handshake cracks it offline in minutes. Recommendation: move staff to WPA3-Enterprise (or WPA2/WPA3-Enterprise transition) with 802.1X to the RADIUS server, give guests a separate SSID with Enhanced Open or WPA3-Personal and a rotating passphrase, isolated to internet only.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Leaving TKIP enabled "for compatibility", which drags the SSID down to WPA-level security. (2) Short passphrases on WPA2-Personal. (3) Enabling WPA3 without checking client support; use transition mode during migration. (4) Thinking a hidden SSID is a security control; it is still visible in probe frames.</p></div>

<div class="exam"><p><b>Exam trap.</b> WPA = TKIP; WPA2 = AES-CCMP; WPA3 = SAE and mandatory PMF. Personal = PSK/SAE; Enterprise = 802.1X with RADIUS. WPA3-Personal resists offline dictionary attacks. On the exam, "which protocol provides the strongest security for a new WLAN" is WPA3.</p></div>

<div class="scn"><h4>The leaked Wi-Fi password</h4><p>A coaching institute found its staff Wi-Fi passphrase written on a student forum. Because it was WPA2-Personal, anyone nearby could join the staff network and reach the fee-collection server. The network team created a WPA3-Enterprise SSID with PEAP against RADIUS and staff directory accounts, moved staff laptops to it, turned the old SSID into an internet-only guest network with a weekly passphrase, and added an ACL between the guest VLAN and internal subnets.</p><p><b>Lesson:</b> a shared passphrase cannot be revoked per person. Enterprise mode ties Wi-Fi access to individual identities.</p></div>

<div class="iv"><p class="q">"What improvements does WPA3 bring over WPA2?"</p><p>Strong answer: in personal mode SAE replaces the PSK handshake, so an attacker cannot capture a handshake and brute force the passphrase offline, and it adds forward secrecy. PMF is mandatory, protecting deauthentication and disassociation frames. Enterprise gets an optional 192-bit mode with GCMP-256. Transition mode eases migration, and Enhanced Open (OWE) encrypts open networks. Both WPA2 and WPA3 use AES; the big change is how the keys are established.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WEP broken, WPA (TKIP) deprecated, WPA2 (AES-CCMP) common, WPA3 current best practice.</li>
<li>Personal = one shared passphrase; Enterprise = 802.1X with individual credentials via RADIUS.</li>
<li>WPA2-Personal handshakes can be attacked offline; WPA3 SAE prevents that and adds forward secrecy.</li>
<li>WPA3 makes PMF mandatory; 192-bit mode for high security; transition mode for migration.</li>
<li>Enhanced Open (OWE) encrypts open guest networks without a password.</li>
</ul></div>
`,hi:`
<p>Wired network ek band kamre ki baatcheet jaisa hai: sunne ke liye kamre mein ghusna padega. Wireless park mein baat karne jaisa hai: range ke andar koi bhi har shabd sun sakta hai. Isliye wireless security ko do kaam karne padte hain jo switch port ko lagbhag muft mein milte hain: prove karna ki kaun join kar sakta hai (<b>authentication</b>) aur har frame ko scramble karna taaki paas khade log sirf shor sunein (<b>integrity</b> ke saath <b>encryption</b>). Radio side aapne Wireless principles module mein dekhi; yahan hum un protocols ko compare karte hain jinka naam exam leta hai.</p>

<h3>WEP se WPA3 tak</h3>
<table class="cmp"><tr><th></th><th>WEP</th><th>WPA</th><th>WPA2</th><th>WPA3</th></tr>
<tr><td>Saal</td><td>1997</td><td>2003</td><td>2004</td><td>2018</td></tr>
<tr><td>Encryption</td><td>RC4, static key</td><td>TKIP (RC4-based, per-packet keys)</td><td>AES-CCMP</td><td>AES-CCMP; 192-bit mode mein AES-GCMP-256</td></tr>
<tr><td>Integrity</td><td>CRC (kamzor)</td><td>MIC ("Michael")</td><td>CCMP MIC</td><td>CCMP/GCMP MIC</td></tr>
<tr><td>Personal auth</td><td>Shared key</td><td>PSK</td><td>4-way handshake ke saath PSK</td><td><b>SAE</b></td></tr>
<tr><td>Enterprise auth</td><td>-</td><td>802.1X</td><td>802.1X / EAP + RADIUS</td><td>802.1X, optional 192-bit suite</td></tr>
<tr><td>Management frames</td><td>Unprotected</td><td>Unprotected</td><td>PMF optional</td><td><b>PMF mandatory</b></td></tr>
<tr><td>Status</td><td>Toota hua, kabhi use mat karo</td><td>Deprecated</td><td>Abhi bhi common</td><td>Current best practice</td></tr></table>
<p><b>WEP</b> apne chhote initialisation vector aur static keys ki wajah se minutes mein crack ho jaata tha. <b>WPA</b> ek jaldi ka fix tha jo purane hardware par <b>TKIP</b> ke saath chal sakta tha; ab deprecated hai. <b>WPA2</b>, IEEE 802.11i par based, <b>AES-CCMP</b> laaya, jo abhi bhi mazboot hai. <b>WPA3</b> personal mode mein WPA2 ki kamzoriyan theek karta hai aur management-frame protection ko mandatory banata hai.</p>

<h3>Personal vs Enterprise</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Personal aur Enterprise wireless authentication">
<text x="160" y="24" text-anchor="middle" class="svg-ink" font-size="14">Personal</text>
<rect x="20" y="40" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="190" y="40" width="110" height="46" rx="8" fill="#bae6fd"/><text x="245" y="68" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="130" y1="63" x2="190" y2="63" stroke="#64748b" stroke-width="2"/>
<text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">ek shared passphrase</text>
<text x="160" y="128" text-anchor="middle" class="svg-muted" font-size="12">har user ke liye</text>
<text x="480" y="24" text-anchor="middle" class="svg-ink" font-size="14">Enterprise</text>
<rect x="340" y="40" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="385" y="68" text-anchor="middle" class="svg-ink" font-size="12">Supplicant</text>
<rect x="450" y="40" width="80" height="46" rx="8" fill="#bae6fd"/><text x="490" y="68" text-anchor="middle" class="svg-ink" font-size="12">AP/WLC</text>
<rect x="550" y="40" width="80" height="46" rx="8" fill="#ddd6fe"/><text x="590" y="68" text-anchor="middle" class="svg-ink" font-size="12">RADIUS</text>
<line x1="430" y1="63" x2="450" y2="63" stroke="#64748b" stroke-width="2"/><line x1="530" y1="63" x2="550" y2="63" stroke="#64748b" stroke-width="2"/>
<text x="485" y="110" text-anchor="middle" class="svg-muted" font-size="12">har user ke apne credentials</text>
<text x="485" y="128" text-anchor="middle" class="svg-muted" font-size="12">ya certificate, 802.1X/EAP se</text>
<rect x="120" y="160" width="400" height="44" rx="8" fill="#fde68a"/><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="13">Dono 4-way handshake par khatam hote hain jo per-session keys banata hai</text>
</svg><p class="cap">Personal: sabko ek hi secret pata hai. Enterprise: har user RADIUS server ko apni identity prove karta hai.</p></div>
<p><b>Personal</b> mode (ghar, chhota office) sabke liye ek passphrase use karta hai. Agar ek insaan chala jaaye, to aapko har device par use badalna padta hai. <b>Enterprise</b> mode 802.1X use karta hai: client (supplicant) AP ya wireless controller (authenticator) ke through RADIUS server par apne username aur password (PEAP) ya certificate (EAP-TLS) se authenticate karta hai. Har user ko alag se revoke kiya ja sakta hai, VLAN diya ja sakta hai, aur log kiya ja sakta hai. Yeh wahi 802.1X hai jo aapne wired ports par dekha.</p>

<h3>WPA2 aur 4-way handshake</h3>
<p>Dono modes mein, authentication ke baad client aur AP <b>4-way handshake</b> chalate hain. Woh random numbers (nonces) exchange karte hain aur <b>pairwise master key (PMK)</b> se fresh session keys nikalte hain. WPA2-Personal mein PMK seedha passphrase aur SSID se aata hai. Yahi kamzori hai: jo attacker ek handshake record kar le woh bina lockout ke <b>offline</b> laakhon passphrases try kar sakta hai, jab tak koi matching values na de de. Kamzor passphrase jaldi toot jaata hai.</p>

<h3>WPA3 kya badalta hai</h3>
<ul>
<li><b>SAE</b> (Simultaneous Authentication of Equals) WPA3-Personal mein PSK exchange ki jagah leta hai. Har password guess ke liye AP ke saath live exchange chahiye, isliye offline dictionary attacks kaam nahi karte. SAE <b>forward secrecy</b> bhi deta hai: baad mein password pata chalne se pehle record kiya traffic decrypt nahi hota.</li>
<li><b>Protected Management Frames (PMF, 802.11w)</b> mandatory hain, jo nakli deauthentication frames rokte hain jinse clients ko nikala ya evil twin ki taraf dhakela jaata hai.</li>
<li><b>WPA3-Enterprise 192-bit mode</b> sarkari aur high-security networks ke liye mazboot suite (GCMP-256 aur matching hashes aur curves) use karta hai.</li>
<li><b>Transition mode</b> migration ke dauraan WPA2 aur WPA3 clients ko ek hi SSID join karne deta hai.</li>
<li><b>Enhanced Open (OWE)</b>, ek companion certification, bina password ke open guest networks ko encrypt karta hai.</li>
</ul>

<h3>Client kya dikhata hai</h3>
<pre class="out">C:\\&gt; netsh wlan show interfaces
    State                  : connected
    SSID                   : NK-STAFF
    Radio type             : 802.11ax
<span class="hl">    Authentication         : WPA3-Personal
    Cipher                 : CCMP</span>
    Channel                : 36
    Signal                 : 92%</pre>

<div class="eg"><p><b>Worked example.</b> 40 logon ka office WPA2-Personal par passphrase "Office@123" ke saath chal raha hai, paanch saal se shared. Risks: jisne kabhi wahan kaam kiya use pata hai; capture hua handshake minutes mein offline crack ho jaata hai. Recommendation: staff ko RADIUS server tak 802.1X ke saath WPA3-Enterprise (ya WPA2/WPA3-Enterprise transition) par le jao, guests ko Enhanced Open ya rotating passphrase wale WPA3-Personal ke saath alag SSID do, sirf internet tak isolated.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) "Compatibility ke liye" TKIP enabled chhodna, jo SSID ko WPA-level security tak gira deta hai. (2) WPA2-Personal par chhote passphrases. (3) Client support check kiye bina WPA3 enable karna; migration ke dauraan transition mode use karo. (4) Hidden SSID ko security control samajhna; woh probe frames mein phir bhi dikhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> WPA = TKIP; WPA2 = AES-CCMP; WPA3 = SAE aur mandatory PMF. Personal = PSK/SAE; Enterprise = RADIUS ke saath 802.1X. WPA3-Personal offline dictionary attacks rokta hai. Exam par "naye WLAN ke liye kaunsa protocol sabse mazboot security deta hai" ka jawab WPA3 hai.</p></div>

<div class="scn"><h4>Leak hua Wi-Fi password</h4><p>Ek coaching institute ne apna staff Wi-Fi passphrase ek student forum par likha hua paaya. Kyunki yeh WPA2-Personal tha, paas ka koi bhi staff network join karke fee-collection server tak pahunch sakta tha. Network team ne RADIUS aur staff directory accounts ke against PEAP ke saath WPA3-Enterprise SSID banaya, staff laptops ko us par shift kiya, purane SSID ko weekly passphrase wala sirf-internet guest network bana diya, aur guest VLAN aur internal subnets ke beech ACL jodi.</p><p><b>Seekh:</b> shared passphrase ko har insaan ke liye alag se revoke nahi kiya ja sakta. Enterprise mode Wi-Fi access ko individual identities se jodta hai.</p></div>

<div class="iv"><p class="q">"WPA3 WPA2 ke upar kya improvements laata hai?"</p><p>Strong answer: personal mode mein SAE PSK handshake ki jagah leta hai, isliye attacker handshake capture karke passphrase offline brute force nahi kar sakta, aur yeh forward secrecy jodta hai. PMF mandatory hai, jo deauthentication aur disassociation frames protect karta hai. Enterprise ko GCMP-256 ke saath optional 192-bit mode milta hai. Transition mode migration aasaan karta hai, aur Enhanced Open (OWE) open networks encrypt karta hai. WPA2 aur WPA3 dono AES use karte hain; bada badlav yeh hai ki keys kaise banti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WEP toota hua, WPA (TKIP) deprecated, WPA2 (AES-CCMP) common, WPA3 current best practice.</li>
<li>Personal = ek shared passphrase; Enterprise = RADIUS ke through individual credentials ke saath 802.1X.</li>
<li>WPA2-Personal handshakes par offline attack ho sakta hai; WPA3 SAE ise rokta hai aur forward secrecy jodta hai.</li>
<li>WPA3 PMF ko mandatory banata hai; high security ke liye 192-bit mode; migration ke liye transition mode.</li>
<li>Enhanced Open (OWE) bina password ke open guest networks encrypt karta hai.</li>
</ul></div>
`}};export{e as default};