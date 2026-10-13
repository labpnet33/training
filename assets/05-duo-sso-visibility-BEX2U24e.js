var e={id:`duo-sso-visibility`,h:{en:`Duo SSO and identity visibility: SAML, Trust Monitor and the authentication log`,hi:`Duo SSO aur identity visibility: SAML, Trust Monitor aur authentication log`},body:{en:`
<p>At a large music festival you queue once at the main gate, show your ticket and ID, and receive a wristband. After that every stage, food court and camping zone simply scans the wristband; nobody asks for your ticket again. If security notices the same wristband being scanned at two gates a kilometre apart within one minute, they go and look. <b>Single sign-on</b> (SSO) is the wristband, and Duo's <b>Trust Monitor</b> and <b>authentication log</b> are the security team watching the scans.</p>

<h3>Duo SSO and SAML in plain words</h3>
<p><b>Duo SSO</b> is a cloud-hosted <b>identity provider</b> (IdP). Applications that trust it are <b>service providers</b> (SPs). The common protocol is <b>SAML 2.0</b>; newer applications may use <b>OIDC</b> (OpenID Connect). The SAML flow:</p>
<ol>
<li>The user opens a SaaS application, the SP.</li>
<li>The SP does not know the user, so it redirects the browser to the IdP with an authentication request.</li>
<li>Duo SSO checks the primary credential against its <b>authentication source</b>: Active Directory through the Authentication Proxy, the Duo directory with Duo passwordless, or another SAML IdP.</li>
<li>Duo applies the application's policy (device health, location, factor) and challenges the user.</li>
<li>Duo returns a <b>SAML assertion</b>, signed with the IdP's private key, through the browser to the SP's assertion consumer service.</li>
<li>The SP checks the signature with the IdP certificate it was given at setup, reads the user name and attributes, and opens a session.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SAML flow with Duo SSO">
<rect x="20" y="90" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="112" text-anchor="middle" class="svg-ink" font-size="13">User browser</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="11">carries messages</text>
<rect x="250" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="13">SaaS app (SP)</text><text x="325" y="60" text-anchor="middle" class="svg-muted" font-size="11">trusts the IdP cert</text>
<rect x="250" y="160" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="182" text-anchor="middle" class="svg-ink" font-size="13">Duo SSO (IdP)</text><text x="325" y="200" text-anchor="middle" class="svg-muted" font-size="11">policy + MFA</text>
<rect x="480" y="160" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="182" text-anchor="middle" class="svg-ink" font-size="13">Auth source</text><text x="555" y="200" text-anchor="middle" class="svg-muted" font-size="11">AD via Auth Proxy</text>
<line x1="150" y1="105" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="150" y1="125" x2="250" y2="180" stroke="#64748b" stroke-width="2"/><line x1="400" y1="185" x2="480" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="185" y="70" class="svg-accent" font-size="12">1, 6</text><text x="185" y="175" class="svg-accent" font-size="12">2, 5</text><text x="440" y="175" class="svg-accent" font-size="12">3</text>
</svg><p class="cap">SAML: the SP and IdP never talk directly in the basic flow; the browser carries the request and the signed assertion.</p></div>

<h3>Why SSO is a security control, not only a convenience</h3>
<ul>
<li><b>One policy point</b>: device health, location and factor rules are written once in Duo and apply to every SSO application.</li>
<li><b>One kill switch</b>: disabling a leaver in the directory removes access to every connected application at once.</li>
<li><b>Fewer passwords</b>: users stop reusing passwords across SaaS applications, which removes a large phishing and credential-stuffing risk.</li>
<li><b>One log</b>: every access to every application is recorded in the same authentication log.</li>
</ul>
<p>Other ways Duo protects access beyond SAML: the <b>Duo Network Gateway</b> publishes internal web applications and SSH servers through Duo without a VPN, and Duo integrations protect Windows logon, RDP and Unix servers.</p>

<h3>Visibility: the authentication log, Device Insight and Trust Monitor</h3>
<p>The <b>authentication log</b> records every decision: time, user, application, result, reason, factor, and details of the access device (IP address, location, OS, browser) and the authentication device (the phone or key). It is the first place to look in any Duo ticket. <b>Device Insight</b> shows the posture of every device that has authenticated: OS versions, encryption, firewall, whether it is a trusted endpoint, so you can see how many devices a planned policy would block <i>before</i> you enforce it. <b>Trust Monitor</b> builds a picture of normal behaviour and surfaces anomalies: a login from a new device in a new country, a burst of pushes (push spray), an unusual new Duo Mobile registration, or a denied access attempt. An analyst reviews each surfaced item and marks it as investigated or escalates it.</p>
<p>In the lab console, the Authentication Log, Device Insight and Trust Monitor pages show exactly these views for the simulated users, and every denial you cause in the labs appears in Trust Monitor.</p>

<h3>Sending Duo logs to the SIEM</h3>
<p>Duo logs are most useful next to firewall, DNS and endpoint data. Duo exposes them through its Admin API, and the Splunk add-on for Duo or the Cisco Security Cloud app in Splunk pulls them into an index. In this example the data lands in <code>index=duo</code>, and a quick search shows which users are denied most and why:</p>
<pre class="code">index=duo result=denied | stats count by user reason | sort -count</pre>
<pre class="out">user     reason                    count
<span class="hl">rkumar   User marked fraud            14</span>
jsingh   Location restricted           3
amehta   Out of date OS                2</pre>
<p>Fourteen fraud reports for one user is a push-fatigue attack in progress. The same idea extends to <b>Cisco Identity Intelligence</b>, which analyses identities across directories and IdPs for risks such as dormant administrator accounts, users without MFA and shared accounts.</p>

<div class="eg"><p><b>Worked example: offboarding.</b> A company has 400 users and 9 SaaS applications. Without SSO, a leaver has 9 separate accounts and IT must remember to disable all 9; one missed account stays open for months. With all 9 behind Duo SSO, disabling the user in Active Directory blocks the next SAML login to all 9 applications. The authentication log then shows any attempt by the leaver as a denied login, which is itself a useful alert.</p></div>

<div class="warn"><p><b>Common mistake.</b> Turning on SSO but leaving MFA or device checks off "for convenience". SSO concentrates access: one password now opens every application. SSO must always be paired with strong MFA and policy.</p></div>

<div class="exam"><p><b>Exam trap.</b> In SAML the <b>IdP</b> authenticates and signs the assertion; the <b>SP</b> is the application that consumes it. The assertion travels through the user's browser. Trust Monitor surfaces anomalous authentications; Device Insight shows device posture; the authentication log records every decision.</p></div>

<div class="scn"><h4>Two countries in forty minutes</h4><p>Trust Monitor surfaced a login for a project manager from Germany forty minutes after her normal login from Pune, on a browser and OS never seen before. The push was denied by the real user. The SOC treated it as a credential compromise: they reset her password, revoked active sessions in the SaaS applications, and searched the Duo index in Splunk for the same source IP against other users. Two more accounts had been tried; both had denied the push.</p><p><b>Lesson:</b> Trust Monitor turns a single denied login into an investigation lead, and the SIEM widens it to the whole company.</p></div>

<div class="iv"><p class="q">"Walk me through a SAML login with Duo SSO."</p><p>Strong answer: the user opens the SP; the SP redirects the browser to the IdP with a SAML request; Duo SSO checks the primary credential against its authentication source, applies the policy and MFA, and returns a signed SAML assertion through the browser to the SP's assertion consumer service; the SP validates the signature with the IdP certificate and creates a session. Mention that the SP and IdP never need a direct connection, and that SSO is a security control because policy and offboarding are centralised.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Duo SSO is a cloud IdP; applications are SPs that trust its signed SAML assertions (or OIDC tokens).</li>
<li>SSO centralises policy, offboarding and logging, but must always be paired with strong MFA.</li>
<li>The authentication log records every decision; Device Insight shows posture; Trust Monitor surfaces anomalies.</li>
<li>Send Duo logs to the SIEM and correlate them with network and endpoint data.</li>
<li>Duo Network Gateway and logon integrations extend the same policy to internal web apps, SSH, RDP and servers.</li>
</ul></div>
`,hi:`
<p>Ek bade music festival mein aap ek baar main gate par line lagate ho, ticket aur ID dikhate ho, aur ek wristband milta hai. Uske baad har stage, food court aur camping zone bas wristband scan karta hai; koi dobara ticket nahi maangta. Agar security ko dikhe ki ek hi wristband ek minute ke andar ek kilometre door do gates par scan hua, to woh jaakar dekhte hain. <b>Single sign-on</b> (SSO) wristband hai, aur Duo ka <b>Trust Monitor</b> aur <b>authentication log</b> woh security team hai jo scans dekh rahi hai.</p>

<h3>Duo SSO aur SAML seedhe shabdon mein</h3>
<p><b>Duo SSO</b> ek cloud-hosted <b>identity provider</b> (IdP) hai. Jo applications us par trust karti hain woh <b>service providers</b> (SPs) hain. Common protocol <b>SAML 2.0</b> hai; nayi applications <b>OIDC</b> (OpenID Connect) use kar sakti hain. SAML flow:</p>
<ol>
<li>User ek SaaS application, yaani SP, kholta hai.</li>
<li>SP user ko nahi jaanta, isliye browser ko authentication request ke saath IdP par redirect karta hai.</li>
<li>Duo SSO primary credential ko apne <b>authentication source</b> se check karta hai: Authentication Proxy ke through Active Directory, Duo passwordless ke saath Duo directory, ya koi aur SAML IdP.</li>
<li>Duo application ki policy (device health, location, factor) lagata hai aur user ko challenge karta hai.</li>
<li>Duo ek <b>SAML assertion</b> lautata hai, IdP ki private key se signed, browser ke through SP ki assertion consumer service tak.</li>
<li>SP setup par mile IdP certificate se signature check karta hai, user name aur attributes padhta hai, aur session kholta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SAML flow with Duo SSO">
<rect x="20" y="90" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="112" text-anchor="middle" class="svg-ink" font-size="13">User browser</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="11">messages le jaata</text>
<rect x="250" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="13">SaaS app (SP)</text><text x="325" y="60" text-anchor="middle" class="svg-muted" font-size="11">IdP cert par trust</text>
<rect x="250" y="160" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="182" text-anchor="middle" class="svg-ink" font-size="13">Duo SSO (IdP)</text><text x="325" y="200" text-anchor="middle" class="svg-muted" font-size="11">policy + MFA</text>
<rect x="480" y="160" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="182" text-anchor="middle" class="svg-ink" font-size="13">Auth source</text><text x="555" y="200" text-anchor="middle" class="svg-muted" font-size="11">Auth Proxy se AD</text>
<line x1="150" y1="105" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="150" y1="125" x2="250" y2="180" stroke="#64748b" stroke-width="2"/><line x1="400" y1="185" x2="480" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="185" y="70" class="svg-accent" font-size="12">1, 6</text><text x="185" y="175" class="svg-accent" font-size="12">2, 5</text><text x="440" y="175" class="svg-accent" font-size="12">3</text>
</svg><p class="cap">SAML: basic flow mein SP aur IdP kabhi seedhe baat nahi karte; browser request aur signed assertion le jaata hai.</p></div>

<h3>SSO sirf convenience nahi, security control kyun hai</h3>
<ul>
<li><b>Ek policy point</b>: device health, location aur factor rules Duo mein ek baar likhe jaate hain aur har SSO application par lagte hain.</li>
<li><b>Ek kill switch</b>: directory mein leaver ko disable karna ek saath har connected application ka access hata deta hai.</li>
<li><b>Kam passwords</b>: users SaaS applications ke across passwords reuse karna band karte hain, jisse bada phishing aur credential-stuffing risk hat jaata hai.</li>
<li><b>Ek log</b>: har application ka har access same authentication log mein record hota hai.</li>
</ul>
<p>SAML ke alawa Duo access aur kaise protect karta hai: <b>Duo Network Gateway</b> internal web applications aur SSH servers ko bina VPN ke Duo ke through publish karta hai, aur Duo integrations Windows logon, RDP aur Unix servers ko protect karte hain.</p>

<h3>Visibility: authentication log, Device Insight aur Trust Monitor</h3>
<p><b>Authentication log</b> har decision record karta hai: time, user, application, result, reason, factor, aur access device (IP address, location, OS, browser) aur authentication device (phone ya key) ki details. Kisi bhi Duo ticket mein dekhne ki pehli jagah yahi hai. <b>Device Insight</b> har authenticate hue device ka posture dikhata hai: OS versions, encryption, firewall, trusted endpoint hai ya nahi, taaki aap enforce karne se <i>pehle</i> dekh sako ki planned policy kitne devices block karegi. <b>Trust Monitor</b> normal behaviour ki tasveer banata hai aur anomalies surface karta hai: naye country mein naye device se login, pushes ka burst (push spray), unusual nayi Duo Mobile registration, ya denied access attempt. Analyst har surfaced item review karta hai aur use investigated mark karta hai ya escalate karta hai.</p>
<p>Lab console mein Authentication Log, Device Insight aur Trust Monitor pages simulated users ke liye bilkul yahi views dikhate hain, aur labs mein aapka kiya har denial Trust Monitor mein dikhta hai.</p>

<h3>Duo logs SIEM mein bhejna</h3>
<p>Duo logs firewall, DNS aur endpoint data ke saath sabse useful hain. Duo unhe apne Admin API se expose karta hai, aur Splunk add-on for Duo ya Splunk mein Cisco Security Cloud app unhe ek index mein khinchta hai. Is example mein data <code>index=duo</code> mein aata hai, aur ek quick search dikhati hai ki kaunse users sabse zyada deny hote hain aur kyun:</p>
<pre class="code">index=duo result=denied | stats count by user reason | sort -count</pre>
<pre class="out">user     reason                    count
<span class="hl">rkumar   User marked fraud            14</span>
jsingh   Location restricted           3
amehta   Out of date OS                2</pre>
<p>Ek user ke liye chaudah fraud reports matlab push-fatigue attack chal raha hai. Yahi idea <b>Cisco Identity Intelligence</b> tak jaata hai, jo directories aur IdPs ke across identities ko dormant administrator accounts, bina MFA wale users aur shared accounts jaise risks ke liye analyse karta hai.</p>

<div class="eg"><p><b>Worked example: offboarding.</b> Ek company mein 400 users aur 9 SaaS applications hain. Bina SSO, ek leaver ke 9 alag accounts hain aur IT ko sab 9 disable karna yaad rakhna padta hai; ek miss hua account mahinon khula rehta hai. Sab 9 Duo SSO ke peeche hon to Active Directory mein user disable karna sab 9 applications ka agla SAML login block kar deta hai. Phir authentication log leaver ki har koshish ko denied login ki tarah dikhata hai, jo khud ek useful alert hai.</p></div>

<div class="warn"><p><b>Common galti.</b> SSO on karna par MFA ya device checks "convenience ke liye" band chhod dena. SSO access ko concentrate karta hai: ek password ab har application kholta hai. SSO ko hamesha strong MFA aur policy ke saath jodna chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> SAML mein <b>IdP</b> authenticate karta hai aur assertion sign karta hai; <b>SP</b> woh application hai jo use consume karti hai. Assertion user ke browser se hokar jaata hai. Trust Monitor anomalous authentications surface karta hai; Device Insight device posture dikhata hai; authentication log har decision record karta hai.</p></div>

<div class="scn"><h4>Chaalis minute mein do desh</h4><p>Trust Monitor ne ek project manager ka login surface kiya jo Pune se uske normal login ke chaalis minute baad Germany se tha, aise browser aur OS par jo pehle kabhi nahi dikha. Asli user ne push deny kiya. SOC ne ise credential compromise maana: password reset kiya, SaaS applications mein active sessions revoke kiye, aur Splunk mein Duo index par same source IP ko doosre users ke against search kiya. Do aur accounts try hue the; dono ne push deny kiya tha.</p><p><b>Seekh:</b> Trust Monitor ek denied login ko investigation lead banata hai, aur SIEM use poori company tak failata hai.</p></div>

<div class="iv"><p class="q">"Duo SSO ke saath ek SAML login walk karo."</p><p>Strong answer: user SP kholta hai; SP browser ko SAML request ke saath IdP par redirect karta hai; Duo SSO primary credential apne authentication source se check karta hai, policy aur MFA lagata hai, aur browser ke through SP ki assertion consumer service tak signed SAML assertion lautata hai; SP IdP certificate se signature validate karke session banata hai. Batao ki SP aur IdP ko direct connection ki zaroorat nahi, aur SSO security control hai kyunki policy aur offboarding centralised hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Duo SSO ek cloud IdP hai; applications SPs hain jo uske signed SAML assertions (ya OIDC tokens) par trust karti hain.</li>
<li>SSO policy, offboarding aur logging centralise karta hai, par hamesha strong MFA ke saath hona chahiye.</li>
<li>Authentication log har decision record karta hai; Device Insight posture dikhata hai; Trust Monitor anomalies surface karta hai.</li>
<li>Duo logs SIEM mein bhejo aur network aur endpoint data ke saath correlate karo.</li>
<li>Duo Network Gateway aur logon integrations wahi policy internal web apps, SSH, RDP aur servers tak le jaate hain.</li>
</ul></div>
`}};export{e as default};