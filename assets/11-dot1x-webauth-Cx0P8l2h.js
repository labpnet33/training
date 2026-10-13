var e={id:`dot1x-webauth`,h:{en:`802.1X and EAP methods, WebAuth, and fast secure roaming (PMK caching, OKC, 802.11r)`,hi:`802.1X aur EAP methods, WebAuth, aur fast secure roaming (PMK caching, OKC, 802.11r)`},body:{en:`
<p>A shared passphrase cannot tell alice from bob, cannot be revoked for one person, and leaks when anyone leaves. Enterprise WLANs therefore use <b>802.1X</b> with a RADIUS server, and guest WLANs use <b>web authentication</b>. Because 802.1X is slow compared to a PSK, you also need <b>fast secure roaming</b>. This chapter covers all three, and the lab tasks that build NK-CORP.</p>

<h3>An analogy: a company building with a security desk</h3>
<p>Staff badge in at the turnstile (802.1X): the guard (the WLC) does not know who is valid, so he phones the HR office (RADIUS) with the badge details, and HR says yes or no and which floor you may use (the VLAN). Visitors instead fill in a form at the reception screen (WebAuth). And a staff member walking between wings should not have to phone HR again at every door: a stamped day pass is honoured along the way (key caching and 802.11r).</p>

<h3>802.1X roles and the flow</h3>
<ul><li><b>Supplicant</b>: the client's software (for example the OS Wi-Fi stack).</li>
<li><b>Authenticator</b>: the WLC (with the AP). It relays EAP between the client (EAPOL over the air) and the server (EAP inside RADIUS, UDP 1812; accounting on UDP 1813).</li>
<li><b>Authentication server</b>: RADIUS, for example Cisco ISE, checking the user against a directory.</li></ul>
<ol><li>Client associates to NK-CORP; the WLC sends <b>EAP-Request/Identity</b>.</li>
<li>Client answers with its identity; the WLC wraps it in a RADIUS <b>Access-Request</b> to RAD1 from its management address.</li>
<li>Client and server run the chosen <b>EAP method</b> (usually a TLS tunnel first), relayed through the WLC in RADIUS Access-Challenge / Access-Request pairs.</li>
<li>RAD1 sends <b>Access-Accept</b> with the key material (MSK) and optional attributes (VLAN, ACL, QoS, session timeout). A reject ends it here.</li>
<li>Both client and WLC derive the <b>PMK</b> from the EAP session, and the <b>4-way handshake</b> (chapter 10) creates the PTK.</li></ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="802.1X roles">
<rect x="10" y="80" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="80" y="117" text-anchor="middle" class="svg-muted" font-size="12">PHONE1 (bob)</text>
<rect x="250" y="80" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="117" text-anchor="middle" class="svg-muted" font-size="12">AP2 + WLC1</text>
<rect x="490" y="80" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="560" y="117" text-anchor="middle" class="svg-muted" font-size="12">RAD1 10.10.50.20</text>
<line x1="150" y1="102" x2="250" y2="102" stroke="#64748b" stroke-width="2"/><text x="200" y="70" text-anchor="middle" class="svg-accent" font-size="12">EAPOL (air)</text>
<line x1="390" y1="102" x2="490" y2="102" stroke="#64748b" stroke-width="2"/><text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="12">RADIUS UDP 1812</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">shared secret NkRadius1 must match on WLC1 and RAD1</text>
</svg><p class="cap">The WLC relays EAP; it never sees the user's password when a tunnelled method is used.</p></div>

<h3>EAP methods</h3>
<table class="cmp"><tr><th>Method</th><th>Server certificate</th><th>Client credential</th><th>Notes</th></tr>
<tr><td><b>EAP-TLS</b></td><td>Yes</td><td>Client certificate</td><td>Strongest; needs a PKI to issue client certificates. Required for WPA3-Enterprise 192-bit.</td></tr>
<tr><td><b>PEAP</b> (MSCHAPv2 or GTC inside)</td><td>Yes</td><td>Username/password inside a TLS tunnel</td><td>Most common with Active Directory. Clients must validate the server certificate.</td></tr>
<tr><td><b>EAP-TTLS</b></td><td>Yes</td><td>Password (PAP, MSCHAPv2 and others) inside TLS</td><td>Flexible inner methods.</td></tr>
<tr><td><b>EAP-FAST</b></td><td>Optional</td><td>Password or certificate, with a PAC (Protected Access Credential)</td><td>Cisco-developed; tunnel built from the PAC.</td></tr>
<tr><td><b>TEAP</b></td><td>Yes</td><td>Chains machine and user authentication</td><td>Standard successor to EAP-FAST.</td></tr>
<tr><td><b>LEAP</b></td><td>No</td><td>Password (MS-CHAP)</td><td>Legacy Cisco, easily cracked; do not use.</td></tr></table>

<h3>Lab: RADIUS and a WPA3-Enterprise WLAN</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Security &gt; AAA (Servers, Server Groups, AAA Method List); Tags &amp; Profiles &gt; WLANs &gt; Add (WPA3, 802.1X, list NK-DOT1X; PMF Required in Security &gt; Web Auth &gt; WLANs); Policy &gt; Add PP-CORP (VLAN 40); Tags &gt; Policy &gt; PT-CAMPUS</span>
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config)# aaa new-model
WLC1(config)# aaa group server radius RG-NK
WLC1(config-sg-radius)# server name RAD1
WLC1(config)# aaa authentication dot1x NK-DOT1X group RG-NK
WLC1(config)# wlan NK-CORP 2 NK-CORP
WLC1(config-wlan)# security wpa wpa3
WLC1(config-wlan)# no security wpa wpa2
WLC1(config-wlan)# security dot1x authentication-list NK-DOT1X
WLC1(config-wlan)# security pmf mandatory
WLC1(config-wlan)# no shutdown
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-CORP policy PP-CORP
PHONE1&gt; wifi connect NK-CORP user bob password NkWifi@2025</pre>
<pre class="out">Found "NK-CORP" on AP2 (5 GHz, channel 40, -62 dBm)
802.1X/EAP: sending identity "bob" (WLC relays EAP to RADIUS)
<span class="hl">RADIUS Access-Accept from 10.10.60.20</span> - PMK installed, 4-way handshake ... completed
Connected to "NK-CORP" (<span class="hl">WPA3-Enterprise</span>) - 130 Mbps
DDORA IP 10.10.40.11/24 GW 10.10.40.1</pre>
<p>RAD1 already lists WLC1's management address 10.10.99.10 as a client with the same secret. If the secret differs, the server silently drops the request and the controller only sees a timeout; the ticket lab (chapter 13) makes you find that in the RADIUS log.</p>

<h3>Web authentication</h3>
<ul><li><b>Local web authentication (LWA)</b>: the WLC itself intercepts the guest's first web request and serves a login or acceptance page from its <b>virtual interface</b> (a non-routable address such as 192.0.2.1). Credentials are checked locally (lobby-admin guest accounts) or against RADIUS. Variants: <b>passthrough</b> (accept the terms, no credentials) and <b>external web auth</b> (the page is hosted on an external portal).</li>
<li><b>Central web authentication (CWA)</b>: the WLAN uses MAC filtering towards ISE. ISE answers the first MAC authentication with a <b>redirect URL and redirect ACL</b>; the guest logs in on the ISE portal; ISE sends a <b>Change of Authorization</b> (CoA, UDP 1700 on Cisco, 3799 in the RFC) and the client is re-authorised with full guest access. CWA supports self-registration, sponsors and BYOD onboarding.</li>
<li>Web authentication is a <b>Layer 3</b> security method: the client associates to an open (or OWE / PSK) WLAN, gets an IP address, and only DNS, DHCP and the portal are allowed until login.</li></ul>

<h3>Fast secure roaming</h3>
<p>A full 802.1X exchange can take hundreds of milliseconds to seconds; voice needs a roam under about 150 ms. Options:</p>
<ul><li><b>PMK caching (SKC, sticky key caching)</b>: the client and an AP it authenticated to before keep the PMK; returning to <b>that same AP</b> skips 802.1X and runs only the 4-way handshake.</li>
<li><b>OKC (opportunistic key caching)</b>: the controller shares the client's PMK with all its APs (and mobility group peers), so the client can reuse it on <b>any</b> AP; it sends a PMKID in its reassociation. Widely supported but not part of the 802.11 standard.</li>
<li><b>802.11r (Fast BSS Transition, FT)</b>: a standard key hierarchy (PMK-R0 at the controller, PMK-R1 per AP) lets the client derive the new keys during the authentication and reassociation exchange itself, so even the 4-way handshake disappears from the roam. Over-the-air or over-the-DS. Cisco's <b>Adaptive 11r</b> enables it only for clients known to support it, protecting older clients that fail with FT.</li>
<li><b>CCKM</b>: older Cisco-proprietary fast roaming, only for Cisco-compatible clients.</li></ul>

<div class="eg"><p><b>Worked example.</b> A phone roams 6 times during a 10-minute walk. With full 802.1X (PEAP, 400 ms each), the call suffers six audible gaps. With OKC, each roam is about 50 ms (reassociation plus 4-way handshake). With 802.11r, about 20–30 ms. The design choice: WPA2/WPA3-Enterprise with FT (or Adaptive FT) and PMF, plus 802.11k/v for faster neighbour discovery.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Clients not validating the RADIUS server certificate in PEAP, so a rogue AP with a fake RADIUS captures password hashes. (2) Enabling mandatory 802.11r on a WLAN with old clients that do not understand FT; they fail to join. Use Adaptive or a separate SSID. (3) Forgetting to open UDP 1812/1813 (and CoA) between WLC and ISE.</p></div>

<div class="exam"><p><b>Exam traps.</b> The WLC is the authenticator; RADIUS is the authentication server. EAP-TLS needs client certificates; PEAP needs only a server certificate. WebAuth is Layer 3 security using the virtual interface (LWA) or ISE with redirect and CoA (CWA). OKC works on any AP of the controller; PMK caching only on a previously visited AP; 802.11r is the standard.</p></div>

<div class="tip"><p><b>Doing it in the web UI</b></p><p>Lab 1, tasks 2 to 4 (GUI only). Configuration &gt; Security &gt; AAA: Servers &gt; Add RAD1 (10.10.60.20, secret NkRadius1); Server Groups &gt; Add RG-NK with RAD1; AAA Method List &gt; Authentication &gt; Add NK-DOT1X, type dot1x, group RG-NK. Then Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add NK-CORP (ID 2, Status off, WPA3 only, 802.1X, list NK-DOT1X, PMF Required, then Status on), Policy &gt; Add PP-CORP (VLAN 40, enabled) and Tags &gt; Policy &gt; PT-CAMPUS (map NK-CORP to PP-CORP). Test on PHONE1 and read Monitoring &gt; Wireless &gt; Clients. Web authentication, ISE, CoA and EAP-TLS certificates are concept only in the lab (wl-secure, Advanced wireless security).</p></div>

<div class="scn"><h4>Guests stuck on the login page</h4><p>After moving guest authentication from the WLC's local pages to ISE (CWA), guests saw the ISE portal, typed their codes, and then nothing happened: they stayed redirected. ISE logs showed the CoA being sent, but the WLC never processed it. The firewall between ISE and the controllers allowed RADIUS 1812/1813 but not the CoA port 1700. Opening it, and making sure the WLC had ISE configured as a CoA-capable server, fixed it.</p><p><b>Lesson:</b> CWA is a two-step process: redirect, then CoA. If guests are stuck after a successful login, check the CoA path.</p></div>

<div class="iv"><p class="q">"How do you make roaming fast on an 802.1X WLAN?"</p><p>Strong answer: avoid a full EAP exchange at every AP. PMK caching helps only when returning to an AP already visited; OKC shares the PMK across the controller's APs so any AP accepts the PMKID; 802.11r FT uses a PMK-R0/R1 key hierarchy to derive keys during reassociation, removing the 4-way handshake from the roam. Use Adaptive FT or check client support, keep controllers in the same mobility group so keys are shared, and add 802.11k/v.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X: supplicant, authenticator (WLC), RADIUS server; EAP over EAPOL and RADIUS (UDP 1812/1813).</li>
<li>EAP-TLS (client certs, strongest), PEAP and TTLS (password in TLS), EAP-FAST/TEAP; avoid LEAP.</li>
<li>After Access-Accept, the PMK feeds the 4-way handshake; attributes can assign VLAN and ACL.</li>
<li>WebAuth: LWA on the WLC's virtual interface, or CWA with ISE redirect and CoA.</li>
<li>Fast roaming: PMK caching (same AP), OKC (any AP), 802.11r FT (standard, fastest).</li>
</ul></div>
`,hi:`
<p>Ek shared passphrase alice aur bob mein farak nahi kar sakti, ek insaan ke liye revoke nahi ho sakti, aur koi bhi chhod kar jaaye to leak ho jaati hai. Isliye enterprise WLANs RADIUS server ke saath <b>802.1X</b> use karte hain, aur guest WLANs <b>web authentication</b>. Kyunki 802.1X PSK ke mukable dheema hai, aapko <b>fast secure roaming</b> bhi chahiye. Yeh chapter teeno cover karta hai, aur woh lab tasks jo NK-CORP banate hain.</p>

<h3>Ek analogy: security desk wali company building</h3>
<p>Staff turnstile par badge lagata hai (802.1X): guard (WLC) ko nahi pata kaun valid hai, isliye woh badge details ke saath HR office (RADIUS) ko phone karta hai, aur HR haan ya na aur kaunsi manzil use kar sakte ho (VLAN) batata hai. Visitors iske bajaaye reception screen par form bharte hain (WebAuth). Aur wings ke beech chalne wale staff ko har darwaaze par HR ko dobara phone nahi karna chahiye: stamp laga day pass raaste bhar maana jaata hai (key caching aur 802.11r).</p>

<h3>802.1X roles aur flow</h3>
<ul><li><b>Supplicant</b>: client ka software (jaise OS ka Wi-Fi stack).</li>
<li><b>Authenticator</b>: WLC (AP ke saath). Yeh client (hawa mein EAPOL) aur server (RADIUS ke andar EAP, UDP 1812; accounting UDP 1813) ke beech EAP relay karta hai.</li>
<li><b>Authentication server</b>: RADIUS, jaise Cisco ISE, jo user ko directory se check karta hai.</li></ul>
<ol><li>Client NK-CORP se associate karta hai; WLC <b>EAP-Request/Identity</b> bhejta hai.</li>
<li>Client apni identity se jawab deta hai; WLC use RADIUS <b>Access-Request</b> mein lapet kar apne management address se RAD1 ko bhejta hai.</li>
<li>Client aur server chuna hua <b>EAP method</b> chalate hain (aam taur par pehle TLS tunnel), WLC ke through RADIUS Access-Challenge / Access-Request pairs mein relay hota hai.</li>
<li>RAD1 key material (MSK) aur optional attributes (VLAN, ACL, QoS, session timeout) ke saath <b>Access-Accept</b> bhejta hai. Reject yahin khatam karta hai.</li>
<li>Client aur WLC dono EAP session se <b>PMK</b> banate hain, aur <b>4-way handshake</b> (chapter 10) PTK banata hai.</li></ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="802.1X roles">
<rect x="10" y="80" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="80" y="117" text-anchor="middle" class="svg-muted" font-size="12">PHONE1 (bob)</text>
<rect x="250" y="80" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="117" text-anchor="middle" class="svg-muted" font-size="12">AP2 + WLC1</text>
<rect x="490" y="80" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="560" y="117" text-anchor="middle" class="svg-muted" font-size="12">RAD1 10.10.50.20</text>
<line x1="150" y1="102" x2="250" y2="102" stroke="#64748b" stroke-width="2"/><text x="200" y="70" text-anchor="middle" class="svg-accent" font-size="12">EAPOL (hawa)</text>
<line x1="390" y1="102" x2="490" y2="102" stroke="#64748b" stroke-width="2"/><text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="12">RADIUS UDP 1812</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">shared secret NkRadius1 WLC1 aur RAD1 par match hona chahiye</text>
</svg><p class="cap">WLC EAP relay karta hai; tunnelled method mein woh user ka password kabhi nahi dekhta.</p></div>

<h3>EAP methods</h3>
<table class="cmp"><tr><th>Method</th><th>Server certificate</th><th>Client credential</th><th>Notes</th></tr>
<tr><td><b>EAP-TLS</b></td><td>Haan</td><td>Client certificate</td><td>Sabse strong; client certificates dene ke liye PKI chahiye. WPA3-Enterprise 192-bit ke liye zaroori.</td></tr>
<tr><td><b>PEAP</b> (andar MSCHAPv2 ya GTC)</td><td>Haan</td><td>TLS tunnel ke andar username/password</td><td>Active Directory ke saath sabse common. Clients ko server certificate validate karna chahiye.</td></tr>
<tr><td><b>EAP-TTLS</b></td><td>Haan</td><td>TLS ke andar password (PAP, MSCHAPv2 aur doosre)</td><td>Flexible inner methods.</td></tr>
<tr><td><b>EAP-FAST</b></td><td>Optional</td><td>PAC (Protected Access Credential) ke saath password ya certificate</td><td>Cisco ne banaya; tunnel PAC se banta hai.</td></tr>
<tr><td><b>TEAP</b></td><td>Haan</td><td>Machine aur user authentication chain karta hai</td><td>EAP-FAST ka standard successor.</td></tr>
<tr><td><b>LEAP</b></td><td>Nahi</td><td>Password (MS-CHAP)</td><td>Purana Cisco, aasaani se crack hota hai; use mat karo.</td></tr></table>

<h3>Lab: RADIUS aur ek WPA3-Enterprise WLAN</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Security &gt; AAA (Servers, Server Groups, AAA Method List); Tags &amp; Profiles &gt; WLANs &gt; Add (WPA3, 802.1X, list NK-DOT1X; PMF Required in Security &gt; Web Auth &gt; WLANs); Policy &gt; Add PP-CORP (VLAN 40); Tags &gt; Policy &gt; PT-CAMPUS</span>
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config)# aaa new-model
WLC1(config)# aaa group server radius RG-NK
WLC1(config-sg-radius)# server name RAD1
WLC1(config)# aaa authentication dot1x NK-DOT1X group RG-NK
WLC1(config)# wlan NK-CORP 2 NK-CORP
WLC1(config-wlan)# security wpa wpa3
WLC1(config-wlan)# no security wpa wpa2
WLC1(config-wlan)# security dot1x authentication-list NK-DOT1X
WLC1(config-wlan)# security pmf mandatory
WLC1(config-wlan)# no shutdown
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-CORP policy PP-CORP
PHONE1&gt; wifi connect NK-CORP user bob password NkWifi@2025</pre>
<pre class="out">Found "NK-CORP" on AP2 (5 GHz, channel 40, -62 dBm)
802.1X/EAP: sending identity "bob" (WLC relays EAP to RADIUS)
<span class="hl">RADIUS Access-Accept from 10.10.60.20</span> - PMK installed, 4-way handshake ... completed
Connected to "NK-CORP" (<span class="hl">WPA3-Enterprise</span>) - 130 Mbps
DDORA IP 10.10.40.11/24 GW 10.10.40.1</pre>
<p>RAD1 mein WLC1 ka management address 10.10.99.10 same secret ke saath client ke roop mein pehle se list hai. Agar secret alag ho, server request chupchaap drop karta hai aur controller ko sirf timeout dikhta hai; ticket lab (chapter 13) aapse yeh RADIUS log mein dhoondhwati hai.</p>

<h3>Web authentication</h3>
<ul><li><b>Local web authentication (LWA)</b>: WLC khud guest ki pehli web request intercept karta hai aur apne <b>virtual interface</b> (192.0.2.1 jaisa non-routable address) se login ya acceptance page serve karta hai. Credentials locally (lobby-admin guest accounts) ya RADIUS se check hote hain. Variants: <b>passthrough</b> (terms accept karo, credentials nahi) aur <b>external web auth</b> (page external portal par hosted).</li>
<li><b>Central web authentication (CWA)</b>: WLAN ISE ki taraf MAC filtering use karta hai. ISE pehle MAC authentication ka jawab <b>redirect URL aur redirect ACL</b> se deta hai; guest ISE portal par login karta hai; ISE <b>Change of Authorization</b> (CoA, Cisco par UDP 1700, RFC mein 3799) bhejta hai aur client poore guest access ke saath re-authorise hota hai. CWA self-registration, sponsors aur BYOD onboarding support karta hai.</li>
<li>Web authentication <b>Layer 3</b> security method hai: client open (ya OWE / PSK) WLAN se associate karta hai, IP address leta hai, aur login tak sirf DNS, DHCP aur portal allowed hote hain.</li></ul>

<h3>Fast secure roaming</h3>
<p>Poora 802.1X exchange sau milliseconds se seconds tak le sakta hai; voice ko lagbhag 150 ms se kam ka roam chahiye. Options:</p>
<ul><li><b>PMK caching (SKC, sticky key caching)</b>: client aur jis AP se pehle authenticate hua, dono PMK rakhte hain; <b>usi AP</b> par wapas aane par 802.1X skip hota hai aur sirf 4-way handshake chalta hai.</li>
<li><b>OKC (opportunistic key caching)</b>: controller client ka PMK apne saare APs (aur mobility group peers) ke saath share karta hai, taaki client use <b>kisi bhi</b> AP par reuse kar sake; woh reassociation mein PMKID bhejta hai. Bahut support hai par 802.11 standard ka hissa nahi.</li>
<li><b>802.11r (Fast BSS Transition, FT)</b>: standard key hierarchy (controller par PMK-R0, har AP par PMK-R1) client ko authentication aur reassociation exchange ke dauraan hi nayi keys banane deti hai, isliye roam se 4-way handshake bhi gayab ho jaata hai. Over-the-air ya over-the-DS. Cisco ka <b>Adaptive 11r</b> ise sirf un clients ke liye enable karta hai jo support karte hain, purane clients ko bachata hai jo FT se fail hote hain.</li>
<li><b>CCKM</b>: purana Cisco-proprietary fast roaming, sirf Cisco-compatible clients ke liye.</li></ul>

<div class="eg"><p><b>Worked example.</b> 10 minute ki walk mein ek phone 6 baar roam karta hai. Poore 802.1X (PEAP, har baar 400 ms) ke saath call mein chhe sunai dene wale gaps. OKC ke saath har roam lagbhag 50 ms (reassociation plus 4-way handshake). 802.11r ke saath lagbhag 20–30 ms. Design choice: FT (ya Adaptive FT) aur PMF ke saath WPA2/WPA3-Enterprise, plus tez neighbour discovery ke liye 802.11k/v.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) PEAP mein clients RADIUS server certificate validate nahi karte, to fake RADIUS wala rogue AP password hashes pakad leta hai. (2) Purane clients wale WLAN par mandatory 802.11r enable karna jo FT nahi samajhte; woh join nahi kar paate. Adaptive ya alag SSID use karo. (3) WLC aur ISE ke beech UDP 1812/1813 (aur CoA) kholna bhoolna.</p></div>

<div class="exam"><p><b>Exam traps.</b> WLC authenticator hai; RADIUS authentication server. EAP-TLS ko client certificates chahiye; PEAP ko sirf server certificate. WebAuth Layer 3 security hai jo virtual interface (LWA) ya redirect aur CoA ke saath ISE (CWA) use karta hai. OKC controller ke kisi bhi AP par chalta hai; PMK caching sirf pehle visit kiye AP par; 802.11r standard hai.</p></div>

<div class="tip"><p><b>Web UI mein karna</b></p><p>Lab 1, tasks 2 se 4 (sirf GUI). Configuration &gt; Security &gt; AAA: Servers &gt; Add RAD1 (10.10.60.20, secret NkRadius1); Server Groups &gt; Add RG-NK with RAD1; AAA Method List &gt; Authentication &gt; Add NK-DOT1X, type dot1x, group RG-NK. Phir Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add NK-CORP (ID 2, Status off, sirf WPA3, 802.1X, list NK-DOT1X, PMF Required, phir Status on), Policy &gt; Add PP-CORP (VLAN 40, enabled) aur Tags &gt; Policy &gt; PT-CAMPUS (NK-CORP ko PP-CORP se map karo). PHONE1 par test karo aur Monitoring &gt; Wireless &gt; Clients padho. Web authentication, ISE, CoA aur EAP-TLS certificates lab mein concept only hain (wl-secure, Advanced wireless security).</p></div>

<div class="scn"><h4>Login page par atke guests</h4><p>Guest authentication ko WLC ke local pages se ISE (CWA) par le jaane ke baad, guests ne ISE portal dekha, apne codes type kiye, aur phir kuch nahi hua: woh redirected hi rahe. ISE logs ne CoA bheja jaata dikhaya, par WLC ne kabhi process nahi kiya. ISE aur controllers ke beech firewall RADIUS 1812/1813 allow karta tha par CoA port 1700 nahi. Use kholne, aur WLC par ISE ko CoA-capable server ke roop mein configured ensure karne se theek hua.</p><p><b>Lesson:</b> CWA do-step process hai: redirect, phir CoA. Successful login ke baad guests atke hon to CoA path check karo.</p></div>

<div class="iv"><p class="q">"802.1X WLAN par roaming tez kaise banaoge?"</p><p>Strong answer: har AP par poore EAP exchange se bacho. PMK caching sirf pehle visit kiye AP par wapas aane mein madad karta hai; OKC controller ke APs mein PMK share karta hai taaki koi bhi AP PMKID accept kare; 802.11r FT PMK-R0/R1 key hierarchy se reassociation ke dauraan keys banata hai, roam se 4-way handshake hata deta hai. Adaptive FT use karo ya client support check karo, controllers ko same mobility group mein rakho taaki keys share hon, aur 802.11k/v jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X: supplicant, authenticator (WLC), RADIUS server; EAPOL aur RADIUS (UDP 1812/1813) par EAP.</li>
<li>EAP-TLS (client certs, sabse strong), PEAP aur TTLS (TLS mein password), EAP-FAST/TEAP; LEAP se bacho.</li>
<li>Access-Accept ke baad PMK 4-way handshake ko feed karta hai; attributes VLAN aur ACL assign kar sakte hain.</li>
<li>WebAuth: WLC ke virtual interface par LWA, ya ISE redirect aur CoA ke saath CWA.</li>
<li>Fast roaming: PMK caching (same AP), OKC (koi bhi AP), 802.11r FT (standard, sabse tez).</li>
</ul></div>
`}};export{e as default};