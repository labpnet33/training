var e={id:`dot1x-roles-eap`,h:{en:`802.1X roles, EAPOL and EAP methods`,hi:`802.1X roles, EAPOL aur EAP methods`},body:{en:`
<p>Think of a nightclub. You (the <b>supplicant</b>) walk up to the bouncer (the <b>authenticator</b>). The bouncer does not know you and does not decide; he takes your ID card, shows it over the radio to the manager inside (the <b>authentication server</b>), and waits. Only when the manager says "let them in, VIP area" does the rope open. Until then you stand outside and cannot even buy a drink. That is 802.1X exactly.</p>

<h3>The three roles</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Software on the endpoint that answers with credentials: the Windows Wired AutoConfig or WLAN AutoConfig service, Secure Client's Network Access Manager, or wpa_supplicant on Linux.</dd>
<dt>Authenticator</dt><dd>The switch port or wireless controller. It relays EAP between the supplicant and the server and enforces the result. It never validates the password itself.</dd>
<dt>Authentication server</dt><dd>The RADIUS server (ISE) that runs the EAP method, checks the identity store and returns Access-Accept or Access-Reject with authorization attributes.</dd>
</dl>
<p>Until the session is authorized, the port is in the <b>unauthorized</b> state and forwards <b>only EAPOL</b> frames: no DHCP, no ARP, no ping. (CDP and LLDP are also processed so IP phones can be discovered.)</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="802.1X roles and protocols">
<rect x="10" y="60" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="250" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="13">ISE</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">auth server</text>
<line x1="150" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="200" y="50" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text><text x="200" y="145" text-anchor="middle" class="svg-muted" font-size="12">EtherType 0x888E</text>
<text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">EAP in RADIUS</text><text x="440" y="145" text-anchor="middle" class="svg-muted" font-size="12">UDP 1812</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">The EAP conversation is end to end between PC1 and ISE</text>
</svg><p class="cap">EAP rides in EAPOL frames on the wire to the switch, and inside RADIUS from the switch to ISE.</p></div>

<h3>EAPOL on the wire</h3>
<p><b>EAP over LAN (EAPOL)</b> frames use <b>EtherType 0x888E</b> and are sent to the multicast MAC <b>01:80:C2:00:00:03</b>, a reserved address that switches never forward, so the conversation stays on one link. The EAPOL packet types you should recognise:</p>
<table class="cmp"><tr><th>Type</th><th>Purpose</th></tr>
<tr><td>EAP-Packet (0)</td><td>Carries an EAP Request, Response, Success or Failure</td></tr>
<tr><td>EAPOL-Start (1)</td><td>Supplicant asks the switch to begin, instead of waiting</td></tr>
<tr><td>EAPOL-Logoff (2)</td><td>Supplicant ends the session (user logs off)</td></tr>
<tr><td>EAPOL-Key (3)</td><td>Key exchange, used by Wi-Fi's 4-way handshake</td></tr>
<tr><td>EAPOL-MKA (5)</td><td>MACsec Key Agreement (chapter 10)</td></tr>
</table>
<p>Between the switch and ISE the same EAP message is copied into the RADIUS <b>EAP-Message</b> attribute (79), protected by a <b>Message-Authenticator</b> (80) computed with the shared secret.</p>

<h3>EAP methods: how the credentials are proved</h3>
<p><b>EAP</b> (Extensible Authentication Protocol) is a framework, not a single method. The switch does not care which method runs; the supplicant and ISE must agree. Tunnelled methods first build a TLS tunnel using the <b>server certificate</b>, then send the real credentials inside it. The first identity sent (the <b>outer identity</b>) can therefore be anonymous, while the real user name (the <b>inner identity</b>) is hidden.</p>
<table class="cmp"><tr><th>Method</th><th>Credentials</th><th>Notes</th></tr>
<tr><td><b>EAP-TLS</b></td><td>Client and server certificates</td><td>Mutual certificate authentication; strongest; needs a PKI to issue client certs</td></tr>
<tr><td><b>PEAP</b></td><td>Password (MSCHAPv2) or token (GTC) inside TLS</td><td>Only a server certificate; the most common method with Active Directory</td></tr>
<tr><td><b>EAP-FAST</b></td><td>Password or certificate inside a tunnel built with a PAC</td><td>Cisco-designed; supports EAP chaining (machine and user in one session)</td></tr>
<tr><td><b>EAP-TTLS</b></td><td>Legacy inner methods (PAP, MSCHAPv2) or EAP inside TLS</td><td>Server certificate only; common on non-Windows clients</td></tr>
<tr><td><b>TEAP</b></td><td>Tunnelled, standards-based</td><td>Successor to EAP-FAST, also supports machine and user chaining</td></tr>
<tr><td>EAP-MD5</td><td>Password hash</td><td>No server authentication and no keys; lab and legacy use only (used in this simulator)</td></tr>
</table>

<h3>The same 802.1X on Wi-Fi (wireless security in brief)</h3>
<p>On a WLAN the <b>WLC</b> is the authenticator and the SSID uses <b>WPA2-Enterprise</b> or <b>WPA3-Enterprise</b>. After a successful EAP method, ISE sends key material to the WLC, and the WLC and client run the <b>4-way handshake</b> (EAPOL-Key) to derive per-session encryption keys. Home-style networks use a pre-shared key instead: <b>WPA2-Personal (PSK)</b> or <b>WPA3-Personal (SAE)</b>, which resists offline dictionary attacks. WPA3 makes <b>Protected Management Frames (802.11w)</b> mandatory, offers a <b>192-bit mode</b> for high-security enterprises, and <b>Enhanced Open (OWE)</b> encrypts open guest SSIDs without a password. Fast roaming (<b>802.11r</b>) avoids a full EAP exchange at every AP. The <b>encor-wireless</b> module covers configuration.</p>

<h3>The supplicant in the lab</h3>
<pre class="code">PC1&gt; dot1x user alice password Nk@2026      <span class="c">! configure and enable the supplicant</span>
PC1&gt; dot1x status                           <span class="c">! is the port authorized?</span></pre>
<p>On the switch, <code>show dot1x all</code> confirms the global switch and each port's timers:</p>
<pre class="out">SW1# show dot1x all
<span class="hl">Sysauthcontrol              Enabled</span>
Dot1x Protocol Version            3

Dot1x Info for GigabitEthernet0/1
------------------------------------
PAE                       = AUTHENTICATOR
QuietPeriod               = 60
ServerTimeout             = 0
SuppTimeout               = 30
ReAuthMax                 = 2
MaxReq                    = 2
TxPeriod                  = 5</pre>

<div class="eg"><p><b>Worked example.</b> A bank chooses EAP-TLS for corporate laptops (certificates pushed by the domain), PEAP-MSCHAPv2 for a few Linux engineering hosts during migration, and MAB for 400 printers. ISE logs show the outer identity <code>anonymous</code> for PEAP users, but the inner identity <code>alice@corp.example</code> in the authentication details, because the password exchange happened inside the TLS tunnel.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deploying PEAP without telling clients to validate the server certificate. A rogue access point with its own RADIUS server can then collect MSCHAPv2 exchanges and crack weak passwords offline. Always push a supplicant profile that trusts only your ISE certificate chain.</p></div>

<div class="exam"><p><b>Exam trap.</b> EAP-TLS is the only common method that <b>requires a client certificate</b>. PEAP, EAP-TTLS and EAP-FAST need only a server certificate (EAP-FAST can even work without one using a PAC). EAPOL is layer 2 and never crosses a router; RADIUS is layer 4 and does.</p></div>

<div class="scn"><h4>The laptops that never answered</h4><p>After a Windows image refresh, every laptop on a new floor ended up in the guest VLAN. The switch showed "dot1x: No response" for each port. Wireshark on one laptop showed EAP-Request/Identity frames arriving and nothing going back. The new image had the Wired AutoConfig service set to manual, so no supplicant was running. The desktop team fixed the image with a group policy that starts the service and pushes the 802.1X profile.</p><p><b>Lesson:</b> "no response" is a supplicant problem, not a RADIUS problem. Check that the endpoint is actually running 802.1X.</p></div>

<div class="iv"><p class="q">"Compare PEAP and EAP-TLS. Which would you deploy?"</p><p>Strong answer: both build a TLS tunnel with the server certificate. PEAP then sends a password (MSCHAPv2) inside, so it is easy to deploy with Active Directory but depends on password strength and correct server-certificate validation. EAP-TLS authenticates both sides with certificates, so there is no password to steal; it needs a PKI and certificate lifecycle management. Recommend EAP-TLS for managed devices and explain how certificates are enrolled (group policy, MDM, SCEP).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supplicant answers, authenticator relays and enforces, authentication server decides.</li>
<li>EAPOL: EtherType 0x888E, destination 01:80:C2:00:00:03; EAP travels in RADIUS attribute 79.</li>
<li>Unauthorized port passes only EAPOL (plus CDP/LLDP).</li>
<li>EAP-TLS = mutual certificates; PEAP, EAP-TTLS, EAP-FAST, TEAP = tunnelled, server certificate.</li>
<li>Wi-Fi: WPA2/WPA3-Enterprise use 802.1X; WPA3 adds SAE, mandatory PMF, 192-bit mode and OWE.</li>
</ul></div>
`,hi:`
<p>Ek nightclub ke baare mein socho. Aap (<b>supplicant</b>) bouncer (<b>authenticator</b>) ke paas jaate ho. Bouncer aapko nahi jaanta aur decide bhi nahi karta; woh aapka ID card leta hai, radio par andar manager (<b>authentication server</b>) ko dikhata hai, aur intezaar karta hai. Jab manager kehta hai "andar aane do, VIP area", tabhi rassi khulti hai. Tab tak aap bahar khade rehte ho aur drink bhi nahi khareed sakte. Bilkul yahi 802.1X hai.</p>

<h3>Teen roles</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Endpoint par software jo credentials se jawab deta hai: Windows Wired AutoConfig ya WLAN AutoConfig service, Secure Client ka Network Access Manager, ya Linux par wpa_supplicant.</dd>
<dt>Authenticator</dt><dd>Switch port ya wireless controller. Yeh supplicant aur server ke beech EAP relay karta hai aur result enforce karta hai. Yeh khud kabhi password validate nahi karta.</dd>
<dt>Authentication server</dt><dd>RADIUS server (ISE) jo EAP method chalata hai, identity store check karta hai aur authorization attributes ke saath Access-Accept ya Access-Reject return karta hai.</dd>
</dl>
<p>Jab tak session authorized nahi hota, port <b>unauthorized</b> state mein rehta hai aur <b>sirf EAPOL</b> frames forward karta hai: na DHCP, na ARP, na ping. (CDP aur LLDP bhi process hote hain taaki IP phones discover ho sakein.)</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="802.1X roles aur protocols">
<rect x="10" y="60" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="250" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<rect x="490" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="13">ISE</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">auth server</text>
<line x1="150" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="200" y="50" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text><text x="200" y="145" text-anchor="middle" class="svg-muted" font-size="12">EtherType 0x888E</text>
<text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">RADIUS mein EAP</text><text x="440" y="145" text-anchor="middle" class="svg-muted" font-size="12">UDP 1812</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">EAP baatcheet PC1 aur ISE ke beech end to end hai</text>
</svg><p class="cap">EAP wire par switch tak EAPOL frames mein, aur switch se ISE tak RADIUS ke andar chalta hai.</p></div>

<h3>Wire par EAPOL</h3>
<p><b>EAP over LAN (EAPOL)</b> frames <b>EtherType 0x888E</b> use karte hain aur multicast MAC <b>01:80:C2:00:00:03</b> ko bheje jaate hain, ek reserved address jise switches kabhi forward nahi karte, isliye baatcheet ek hi link par rehti hai. EAPOL packet types jo aapko pehchanne chahiye:</p>
<table class="cmp"><tr><th>Type</th><th>Purpose</th></tr>
<tr><td>EAP-Packet (0)</td><td>EAP Request, Response, Success ya Failure carry karta hai</td></tr>
<tr><td>EAPOL-Start (1)</td><td>Supplicant intezaar karne ki jagah switch se shuru karne ko kehta hai</td></tr>
<tr><td>EAPOL-Logoff (2)</td><td>Supplicant session khatam karta hai (user log off karta hai)</td></tr>
<tr><td>EAPOL-Key (3)</td><td>Key exchange, Wi-Fi ke 4-way handshake mein use hota hai</td></tr>
<tr><td>EAPOL-MKA (5)</td><td>MACsec Key Agreement (chapter 10)</td></tr>
</table>
<p>Switch aur ISE ke beech wahi EAP message RADIUS ke <b>EAP-Message</b> attribute (79) mein copy hota hai, jise shared secret se compute hone wala <b>Message-Authenticator</b> (80) protect karta hai.</p>

<h3>EAP methods: credentials kaise prove hote hain</h3>
<p><b>EAP</b> (Extensible Authentication Protocol) ek framework hai, single method nahi. Switch ko farak nahi padta kaunsa method chalta hai; supplicant aur ISE ko agree karna hota hai. Tunnelled methods pehle <b>server certificate</b> se TLS tunnel banate hain, phir asli credentials uske andar bhejte hain. Isliye pehli bheji gayi identity (<b>outer identity</b>) anonymous ho sakti hai, jabki asli user name (<b>inner identity</b>) chhupa rehta hai.</p>
<table class="cmp"><tr><th>Method</th><th>Credentials</th><th>Notes</th></tr>
<tr><td><b>EAP-TLS</b></td><td>Client aur server certificates</td><td>Mutual certificate authentication; sabse strong; client certs issue karne ke liye PKI chahiye</td></tr>
<tr><td><b>PEAP</b></td><td>TLS ke andar password (MSCHAPv2) ya token (GTC)</td><td>Sirf server certificate; Active Directory ke saath sabse common method</td></tr>
<tr><td><b>EAP-FAST</b></td><td>PAC se bane tunnel ke andar password ya certificate</td><td>Cisco-designed; EAP chaining support karta hai (ek session mein machine aur user)</td></tr>
<tr><td><b>EAP-TTLS</b></td><td>TLS ke andar legacy inner methods (PAP, MSCHAPv2) ya EAP</td><td>Sirf server certificate; non-Windows clients par common</td></tr>
<tr><td><b>TEAP</b></td><td>Tunnelled, standards-based</td><td>EAP-FAST ka successor, machine aur user chaining bhi support karta hai</td></tr>
<tr><td>EAP-MD5</td><td>Password hash</td><td>Server authentication nahi aur keys nahi; sirf lab aur legacy use (is simulator mein use hota hai)</td></tr>
</table>

<h3>Wi-Fi par wahi 802.1X (wireless security short mein)</h3>
<p>WLAN par <b>WLC</b> authenticator hai aur SSID <b>WPA2-Enterprise</b> ya <b>WPA3-Enterprise</b> use karta hai. Successful EAP method ke baad ISE WLC ko key material bhejta hai, aur WLC aur client per-session encryption keys nikaalne ke liye <b>4-way handshake</b> (EAPOL-Key) chalate hain. Ghar jaise networks iski jagah pre-shared key use karte hain: <b>WPA2-Personal (PSK)</b> ya <b>WPA3-Personal (SAE)</b>, jo offline dictionary attacks ko resist karta hai. WPA3 <b>Protected Management Frames (802.11w)</b> ko mandatory banata hai, high-security enterprises ke liye <b>192-bit mode</b> deta hai, aur <b>Enhanced Open (OWE)</b> open guest SSIDs ko bina password encrypt karta hai. Fast roaming (<b>802.11r</b>) har AP par full EAP exchange se bachata hai. <b>encor-wireless</b> module configuration cover karta hai.</p>

<h3>Lab mein supplicant</h3>
<pre class="code">PC1&gt; dot1x user alice password Nk@2026      <span class="c">! supplicant configure aur enable karo</span>
PC1&gt; dot1x status                           <span class="c">! kya port authorized hai?</span></pre>
<p>Switch par <code>show dot1x all</code> global switch aur har port ke timers confirm karta hai:</p>
<pre class="out">SW1# show dot1x all
<span class="hl">Sysauthcontrol              Enabled</span>
Dot1x Protocol Version            3

Dot1x Info for GigabitEthernet0/1
------------------------------------
PAE                       = AUTHENTICATOR
QuietPeriod               = 60
ServerTimeout             = 0
SuppTimeout               = 30
ReAuthMax                 = 2
MaxReq                    = 2
TxPeriod                  = 5</pre>

<div class="eg"><p><b>Worked example.</b> Ek bank corporate laptops ke liye EAP-TLS chunta hai (domain se certificates push hote hain), migration ke dauraan kuch Linux engineering hosts ke liye PEAP-MSCHAPv2, aur 400 printers ke liye MAB. ISE logs PEAP users ke liye outer identity <code>anonymous</code> dikhate hain, lekin authentication details mein inner identity <code>alice@corp.example</code>, kyunki password exchange TLS tunnel ke andar hua.</p></div>

<div class="warn"><p><b>Common galti.</b> Clients ko server certificate validate karne ko kahe bina PEAP deploy karna. Tab apne RADIUS server wala rogue access point MSCHAPv2 exchanges collect karke kamzor passwords offline crack kar sakta hai. Hamesha aisa supplicant profile push karo jo sirf aapki ISE certificate chain ko trust kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> EAP-TLS akela common method hai jise <b>client certificate chahiye</b>. PEAP, EAP-TTLS aur EAP-FAST ko sirf server certificate chahiye (EAP-FAST PAC ke saath bina uske bhi chal sakta hai). EAPOL layer 2 hai aur kabhi router cross nahi karta; RADIUS layer 4 hai aur karta hai.</p></div>

<div class="scn"><h4>Laptops jo kabhi jawab nahi dete the</h4><p>Windows image refresh ke baad naye floor ka har laptop guest VLAN mein pahunch gaya. Switch har port ke liye "dot1x: No response" dikhata tha. Ek laptop par Wireshark ne dikhaya ki EAP-Request/Identity frames aa rahe the aur wapas kuch nahi ja raha tha. Nayi image mein Wired AutoConfig service manual par set thi, isliye koi supplicant chal hi nahi raha tha. Desktop team ne group policy se image theek ki jo service start karti hai aur 802.1X profile push karti hai.</p><p><b>Seekh:</b> "no response" supplicant ki problem hai, RADIUS ki nahi. Check karo ki endpoint sach mein 802.1X chala raha hai.</p></div>

<div class="iv"><p class="q">"PEAP aur EAP-TLS compare karo. Aap kaunsa deploy karoge?"</p><p>Strong answer: dono server certificate se TLS tunnel banate hain. PEAP phir andar password (MSCHAPv2) bhejta hai, isliye Active Directory ke saath deploy karna aasaan hai lekin password strength aur sahi server-certificate validation par depend karta hai. EAP-TLS dono sides ko certificates se authenticate karta hai, isliye churaane ke liye koi password nahi hai; ise PKI aur certificate lifecycle management chahiye. Managed devices ke liye EAP-TLS recommend karo aur batao ki certificates kaise enroll hote hain (group policy, MDM, SCEP).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supplicant jawab deta hai, authenticator relay aur enforce karta hai, authentication server decide karta hai.</li>
<li>EAPOL: EtherType 0x888E, destination 01:80:C2:00:00:03; EAP RADIUS attribute 79 mein chalta hai.</li>
<li>Unauthorized port sirf EAPOL (plus CDP/LLDP) pass karta hai.</li>
<li>EAP-TLS = mutual certificates; PEAP, EAP-TTLS, EAP-FAST, TEAP = tunnelled, server certificate.</li>
<li>Wi-Fi: WPA2/WPA3-Enterprise 802.1X use karte hain; WPA3 SAE, mandatory PMF, 192-bit mode aur OWE jodta hai.</li>
</ul></div>
`}};export{e as default};