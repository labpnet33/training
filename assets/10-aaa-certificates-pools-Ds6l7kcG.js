var e={id:`aaa-certs-pools`,h:{en:`Remote access identity: AAA, RADIUS, certificates and address pools`,hi:`Remote access identity: AAA, RADIUS, certificates aur address pools`},body:{en:`
<p>A remote access VPN is a door to the whole company network from anywhere on the internet. That makes it one of the most attacked services you will ever run: password spraying, stolen credentials and fake gateways are everyday threats. So the identity part matters more than the encryption. This chapter covers who the user is (AAA), how the client knows it reached the real gateway (certificates) and which address the user gets (pools).</p>

<h3>AAA in one picture</h3>
<p><b>Authentication</b> answers "who are you?", <b>authorization</b> answers "what may you do?", <b>accounting</b> records "what did you do and for how long?". On the Threat Defense the <b>connection profile</b> chooses the authentication source, and authorization can come from the group policy or from attributes returned by a RADIUS server.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Remote access authentication options">
<rect x="10" y="80" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="70" y="107" text-anchor="middle" class="svg-ink" font-size="12">Secure Client</text>
<rect x="190" y="80" width="130" height="44" rx="8" fill="#fed7aa"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="12">NK-FTD</text><text x="255" y="116" text-anchor="middle" class="svg-muted" font-size="11">connection profile</text>
<rect x="400" y="10" width="230" height="34" rx="8" fill="#e2e8f0"/><text x="515" y="32" text-anchor="middle" class="svg-ink" font-size="12">Local realm (users on the device)</text>
<rect x="400" y="56" width="230" height="34" rx="8" fill="#bae6fd"/><text x="515" y="78" text-anchor="middle" class="svg-ink" font-size="12">RADIUS: Cisco ISE, UDP 1812/1813</text>
<rect x="400" y="102" width="230" height="34" rx="8" fill="#bbf7d0"/><text x="515" y="124" text-anchor="middle" class="svg-ink" font-size="12">LDAP / Active Directory realm</text>
<rect x="400" y="148" width="230" height="34" rx="8" fill="#fde68a"/><text x="515" y="170" text-anchor="middle" class="svg-ink" font-size="12">SAML identity provider (MFA)</text>
<line x1="130" y1="102" x2="190" y2="102" stroke="#64748b"/><line x1="320" y1="95" x2="400" y2="27" stroke="#64748b"/><line x1="320" y1="98" x2="400" y2="73" stroke="#64748b"/><line x1="320" y1="106" x2="400" y2="119" stroke="#64748b"/><line x1="320" y1="110" x2="400" y2="165" stroke="#64748b"/>
</svg><p class="cap">One connection profile points to one authentication source; certificates can be added on top.</p></div>

<h3>Authentication sources</h3>
<table class="cmp"><tr><th>Source</th><th>When to use it</th><th>Notes</th></tr>
<tr><td>Local realm</td><td>labs, small sites, break-glass accounts</td><td>users live on the device; no central password policy or MFA</td></tr>
<tr><td>RADIUS (Cisco ISE)</td><td>most enterprises</td><td>central policy, MFA via ISE or a proxy, authorization attributes, CoA for posture, accounting</td></tr>
<tr><td>LDAP / AD realm</td><td>direct directory lookup</td><td>use LDAPS; group membership can drive policy</td></tr>
<tr><td>SAML 2.0</td><td>cloud identity and MFA (for example Duo)</td><td>login happens in a browser window; the firewall trusts the IdP's signed assertion</td></tr>
<tr><td>Client certificate</td><td>managed laptops only</td><td>alone or together with AAA (certificate plus password), proves the device</td></tr></table>
<p>In the lab Management Center the connection profile's <b>Authentication Method</b> is <b>AAA Only — Local realm</b> or <b>AAA Only — RADIUS server</b>. For RADIUS, first add the server in the <b>RADIUS Server Groups</b> card: Name (for example <code>ISE</code>), <b>RADIUS Server (IP)</b> such as 10.0.1.30, <b>Key</b> (the same shared secret as the network device entry on ISE) and <b>Interface to reach the server</b> (inside). Then pick it as the Authentication Server in the profile. The generated configuration is <code>aaa-server ISE protocol radius</code> with authentication port 1812 and accounting port 1813.</p>

<h3>Reading the authentication logs</h3>
<pre class="out">%FTD-6-113012: AAA user authentication Successful : local database : user = ravi
%FTD-6-113015: AAA user authentication Rejected : reason = Invalid password : local database : user = ***** : user IP = 198.51.100.20
%FTD-6-113004: AAA user authentication Successful : server = 10.0.1.30 : user = priya
<span class="hl">%FTD-6-113005: AAA user authentication Rejected : reason = AAA failure : server = 10.0.1.30 : user = ***** : user IP = 198.51.100.20</span></pre>
<p>113012 and 113015 are the local database; 113004 and 113005 are an external server. If every RADIUS login fails with "AAA server unreachable", check routing to the server, the interface chosen to reach it and the shared secret: ISE silently drops requests from an unknown device or with a wrong key.</p>

<h3>Certificates: proving the gateway is real</h3>
<p>The headend presents an <b>identity certificate</b> during the TLS handshake. Its subject or SAN must match the name users connect to (vpn.nwk.lab), and it must chain to a CA the laptops trust. In the lab, <b>Objects → VPN Objects → Certificates</b> lists <code>NK-VPN-CERT</code> (CN=vpn.nwk.lab, issuer NK Lab Root CA, Enrolled). In production you enrol it on the device by manual (CSR), PKCS12 import, SCEP or EST, usually from a public CA so personal devices trust it. Without a certificate the client fails with "Connection attempt has failed due to server certificate problem". Never train users to click through certificate warnings: that is exactly what a fake gateway relies on.</p>

<h3>Address assignment</h3>
<p>A client can get its address from a <b>local pool</b> on the device (the lab uses VPN-POOL), from <b>DHCP</b> through the firewall, or from the <b>RADIUS server</b> (Framed-IP-Address, useful for fixed addresses per user). Several pools can be attached to one connection profile; they are used in order. Different user groups can get different pools, which makes access rules and logs easier to read (contractors from 10.51.0.0/24, staff from 10.50.0.0/24).</p>

<div class="eg"><p><b>Worked example.</b> Staff authenticate with RADIUS to ISE. ISE returns a Class attribute that selects group policy GP-Staff for members of AD group VPN-Staff and GP-Contractors for VPN-Contractors, and a downloadable ACL that limits contractors to two servers. Both groups use the same connection profile but receive different pools (10.50.0.0/24 and 10.51.0.0/24), so the access control rules can also distinguish them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Local realm users in production with no MFA; a RADIUS shared secret that differs between the firewall and ISE; choosing the outside interface to reach an inside RADIUS server; an expired or self-signed headend certificate; one large pool for everyone, which makes audits hard.</p></div>

<div class="exam"><p><b>Exam trap.</b> RADIUS authentication uses UDP 1812 and accounting 1813; TACACS+ (TCP 49) is for device administration, not for VPN users. The connection profile chooses the authentication server; the group policy can be selected by RADIUS attributes. SAML is the usual way to add cloud MFA to Secure Client.</p></div>

<div class="scn"><h4>The password spray at 3 a.m.</h4><p>A SOC analyst noticed thousands of <code>113015</code> rejections from many public addresses, each trying a few common usernames against the local realm. No account was compromised, but the attack was loud and constant. The team moved authentication to ISE with Duo MFA through SAML, disabled the local realm except for one break-glass account with a long random password, removed the group alias list so the gateway no longer displayed profile names, and enabled the remote access threat detection features of their release to block sources with repeated failures.</p><p><b>Lesson:</b> a VPN headend is an internet-facing login page; protect it like one with MFA, central identity and rate limiting.</p></div>

<div class="iv"><p class="q">"How would you secure authentication for a remote access VPN on Threat Defense?"</p><p>Use central identity (RADIUS to ISE, or SAML to an IdP) with MFA instead of local users; present a trusted public certificate matching the gateway FQDN; optionally require a device certificate for managed laptops; use authorization (group policies, downloadable ACLs, separate pools) to limit what each group reaches; log 113004/113005/113015 events to the SIEM and enable threat detection for repeated failures; keep one break-glass local account.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The connection profile picks authentication: local realm, RADIUS (ISE), LDAP/AD, SAML, and optionally client certificates.</li>
<li>RADIUS needs the server IP, a shared secret identical on ISE, and the right interface to reach it; ports 1812/1813.</li>
<li>Syslog 113012/113015 = local database, 113004/113005 = external server.</li>
<li>The headend identity certificate must match the FQDN and chain to a trusted CA.</li>
<li>Addresses come from local pools, DHCP or RADIUS; separate pools per group simplify rules and audits.</li>
</ul></div>
`,hi:`
<p>Remote access VPN internet par kahin se bhi poore company network ka darwaza hai. Isliye yeh un services mein se hai jin par sabse zyada attack hota hai: password spraying, chori hue credentials aur fake gateways roz ke threats hain. Isliye identity wala hissa encryption se zyada matter karta hai. Yeh chapter cover karta hai user kaun hai (AAA), client kaise jaanta hai ki woh asli gateway tak pahuncha (certificates) aur user ko kaunsa address milta hai (pools).</p>

<h3>Ek picture mein AAA</h3>
<p><b>Authentication</b> jawab deta hai "aap kaun ho?", <b>authorization</b> jawab deta hai "aap kya kar sakte ho?", <b>accounting</b> record karta hai "aapne kya kiya aur kitni der?". Threat Defense par <b>connection profile</b> authentication source chunta hai, aur authorization group policy se ya RADIUS server ke return kiye attributes se aa sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Remote access authentication options">
<rect x="10" y="80" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="70" y="107" text-anchor="middle" class="svg-ink" font-size="12">Secure Client</text>
<rect x="190" y="80" width="130" height="44" rx="8" fill="#fed7aa"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="12">NK-FTD</text><text x="255" y="116" text-anchor="middle" class="svg-muted" font-size="11">connection profile</text>
<rect x="400" y="10" width="230" height="34" rx="8" fill="#e2e8f0"/><text x="515" y="32" text-anchor="middle" class="svg-ink" font-size="12">Local realm (device par users)</text>
<rect x="400" y="56" width="230" height="34" rx="8" fill="#bae6fd"/><text x="515" y="78" text-anchor="middle" class="svg-ink" font-size="12">RADIUS: Cisco ISE, UDP 1812/1813</text>
<rect x="400" y="102" width="230" height="34" rx="8" fill="#bbf7d0"/><text x="515" y="124" text-anchor="middle" class="svg-ink" font-size="12">LDAP / Active Directory realm</text>
<rect x="400" y="148" width="230" height="34" rx="8" fill="#fde68a"/><text x="515" y="170" text-anchor="middle" class="svg-ink" font-size="12">SAML identity provider (MFA)</text>
<line x1="130" y1="102" x2="190" y2="102" stroke="#64748b"/><line x1="320" y1="95" x2="400" y2="27" stroke="#64748b"/><line x1="320" y1="98" x2="400" y2="73" stroke="#64748b"/><line x1="320" y1="106" x2="400" y2="119" stroke="#64748b"/><line x1="320" y1="110" x2="400" y2="165" stroke="#64748b"/>
</svg><p class="cap">Ek connection profile ek authentication source ki taraf point karta hai; certificates upar se jod sakte ho.</p></div>

<h3>Authentication sources</h3>
<table class="cmp"><tr><th>Source</th><th>Kab use karein</th><th>Notes</th></tr>
<tr><td>Local realm</td><td>labs, chhoti sites, break-glass accounts</td><td>users device par rehte hain; central password policy ya MFA nahi</td></tr>
<tr><td>RADIUS (Cisco ISE)</td><td>zyadatar enterprises</td><td>central policy, ISE ya proxy se MFA, authorization attributes, posture ke liye CoA, accounting</td></tr>
<tr><td>LDAP / AD realm</td><td>seedha directory lookup</td><td>LDAPS use karo; group membership policy chala sakti hai</td></tr>
<tr><td>SAML 2.0</td><td>cloud identity aur MFA (jaise Duo)</td><td>login browser window mein hota hai; firewall IdP ke signed assertion par trust karta hai</td></tr>
<tr><td>Client certificate</td><td>sirf managed laptops</td><td>akele ya AAA ke saath (certificate plus password), device prove karta hai</td></tr></table>
<p>Lab Management Center mein connection profile ka <b>Authentication Method</b> <b>AAA Only — Local realm</b> ya <b>AAA Only — RADIUS server</b> hai. RADIUS ke liye pehle <b>RADIUS Server Groups</b> card mein server jodo: Name (jaise <code>ISE</code>), <b>RADIUS Server (IP)</b> jaise 10.0.1.30, <b>Key</b> (ISE par network device entry wala same shared secret) aur <b>Interface to reach the server</b> (inside). Phir profile mein use Authentication Server ki tarah chuno. Generated configuration authentication port 1812 aur accounting port 1813 ke saath <code>aaa-server ISE protocol radius</code> hai.</p>

<h3>Authentication logs padhna</h3>
<pre class="out">%FTD-6-113012: AAA user authentication Successful : local database : user = ravi
%FTD-6-113015: AAA user authentication Rejected : reason = Invalid password : local database : user = ***** : user IP = 198.51.100.20
%FTD-6-113004: AAA user authentication Successful : server = 10.0.1.30 : user = priya
<span class="hl">%FTD-6-113005: AAA user authentication Rejected : reason = AAA failure : server = 10.0.1.30 : user = ***** : user IP = 198.51.100.20</span></pre>
<p>113012 aur 113015 local database hain; 113004 aur 113005 external server. Agar har RADIUS login "AAA server unreachable" se fail ho, to server tak routing, use reach karne ke liye chuna interface aur shared secret check karo: ISE unknown device ya galat key wali requests chupchaap drop kar deta hai.</p>

<h3>Certificates: gateway asli hai yeh prove karna</h3>
<p>Headend TLS handshake ke dauraan ek <b>identity certificate</b> dikhata hai. Uska subject ya SAN us naam se match hona chahiye jisse users connect karte hain (vpn.nwk.lab), aur use aise CA tak chain hona chahiye jis par laptops trust karte hain. Lab mein <b>Objects → VPN Objects → Certificates</b> <code>NK-VPN-CERT</code> list karta hai (CN=vpn.nwk.lab, issuer NK Lab Root CA, Enrolled). Production mein aap ise device par manual (CSR), PKCS12 import, SCEP ya EST se enrol karte ho, aam taur par public CA se taaki personal devices trust karein. Certificate ke bina client "Connection attempt has failed due to server certificate problem" se fail hota hai. Users ko certificate warnings click karke aage badhna kabhi mat sikhao: fake gateway bilkul isi par depend karta hai.</p>

<h3>Address assignment</h3>
<p>Client apna address device ke <b>local pool</b> se (lab VPN-POOL use karta hai), firewall ke through <b>DHCP</b> se, ya <b>RADIUS server</b> se (Framed-IP-Address, har user ke fixed address ke liye useful) le sakta hai. Ek connection profile se kai pools attach ho sakte hain; woh order mein use hote hain. Alag user groups ko alag pools mil sakte hain, jisse access rules aur logs padhna aasaan hota hai (contractors 10.51.0.0/24 se, staff 10.50.0.0/24 se).</p>

<div class="eg"><p><b>Worked example.</b> Staff RADIUS se ISE par authenticate karte hain. ISE ek Class attribute return karta hai jo AD group VPN-Staff ke members ke liye group policy GP-Staff aur VPN-Contractors ke liye GP-Contractors select karta hai, aur ek downloadable ACL jo contractors ko do servers tak limit karti hai. Dono groups same connection profile use karte hain par alag pools paate hain (10.50.0.0/24 aur 10.51.0.0/24), isliye access control rules bhi unhe alag pehchan sakte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Production mein bina MFA ke local realm users; firewall aur ISE ke beech alag RADIUS shared secret; inside RADIUS server tak pahunchne ke liye outside interface chunna; expired ya self-signed headend certificate; sab ke liye ek bada pool, jisse audits mushkil hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> RADIUS authentication UDP 1812 aur accounting 1813 use karta hai; TACACS+ (TCP 49) device administration ke liye hai, VPN users ke liye nahi. Connection profile authentication server chunta hai; group policy RADIUS attributes se select ho sakti hai. Secure Client mein cloud MFA jodne ka usual tarika SAML hai.</p></div>

<div class="scn"><h4>Raat 3 baje password spray</h4><p>Ek SOC analyst ne kai public addresses se hazaaron <code>113015</code> rejections dekhe, har ek local realm ke against kuch common usernames try kar raha tha. Koi account compromise nahi hua, par attack zor ka aur lagatar tha. Team ne authentication ko SAML ke through Duo MFA ke saath ISE par shift kiya, lambe random password wale ek break-glass account ko chhodkar local realm disable kiya, group alias list hatayi taaki gateway profile names na dikhaye, aur apne release ke remote access threat detection features enable kiye taaki baar-baar fail hone wale sources block hon.</p><p><b>Lesson:</b> VPN headend internet-facing login page hai; use MFA, central identity aur rate limiting se waise hi protect karo.</p></div>

<div class="iv"><p class="q">"Threat Defense par remote access VPN ka authentication kaise secure karoge?"</p><p>Local users ki jagah MFA ke saath central identity (ISE tak RADIUS, ya IdP tak SAML) use karo; gateway FQDN se match karta trusted public certificate dikhao; managed laptops ke liye optionally device certificate maango; har group kya access kare yeh limit karne ke liye authorization (group policies, downloadable ACLs, alag pools) use karo; 113004/113005/113015 events SIEM ko log karo aur baar-baar failures ke liye threat detection enable karo; ek break-glass local account rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connection profile authentication chunta hai: local realm, RADIUS (ISE), LDAP/AD, SAML, aur optionally client certificates.</li>
<li>RADIUS ko server IP, ISE par identical shared secret, aur use reach karne ka sahi interface chahiye; ports 1812/1813.</li>
<li>Syslog 113012/113015 = local database, 113004/113005 = external server.</li>
<li>Headend identity certificate FQDN se match hona aur trusted CA tak chain hona chahiye.</li>
<li>Addresses local pools, DHCP ya RADIUS se aate hain; har group ke alag pools rules aur audits aasaan banate hain.</li>
</ul></div>
`}};export{e as default};