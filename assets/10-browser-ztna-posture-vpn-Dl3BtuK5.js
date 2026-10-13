var e={id:`browser-ztna`,h:{en:`Browser-based ZTNA, endpoint posture and VPN as a service: choosing the access method`,hi:`Browser-based ZTNA, endpoint posture aur VPN as a service: access method chunna`},body:{en:`
<p>A hotel gives its own staff a programmed key card. A plumber who comes for one afternoon does not get a card; reception walks him to the one room, watches the job and walks him out. A long-term tenant who needs the whole floor gets a different arrangement again. Secure Access offers the same three options for private apps: <b>client-based ZTNA</b> for managed laptops, <b>browser-based ZTNA</b> for unmanaged devices, and <b>VPN as a service</b> for what ZTNA cannot do yet.</p>

<h3>Browser-based (clientless) ZTNA</h3>
<p>Some users cannot or should not install software: auditors, contractors, partners, an employee on a personal tablet. For them a private web app gets a <b>public URL</b> hosted by Secure Access. The user opens it in any browser, signs in with <b>SAML</b>, and Secure Access applies the private access rule and proxies the session through a resource connector. Characteristics:</p>
<ul>
<li>No client, nothing to install or uninstall.</li>
<li>Designed for <b>web applications</b> (HTTP and HTTPS).</li>
<li><b>Limited posture</b>: the browser can report little more than browser type and operating system; there is no disk-encryption or anti-malware check.</li>
<li>Exposes exactly one app, with every request logged with the user identity.</li>
</ul>

<h3>Lab walk-through: Neha on her personal tablet</h3>
<ol>
<li><b>Resources, Private Resources</b>, select <b>Finance-ERP</b>, <b>Edit</b>, switch on <b>Browser-based access (public URL for unmanaged devices)</b>. The resource card now shows the URL, in this lab <code>financeerp-8195126.ztna.sse.cisco.com</code> over HTTPS.</li>
<li><b>Secure, Access Policy, Private access</b>, open <b>Finance to ERP</b> and tick <b>Browser-based</b> next to Client-based in <b>Access methods</b>. The rule's posture setting still applies to client-based sessions.</li>
<li>From TABLET open the URL as Neha:</li>
</ol>
<pre class="code">TABLET&gt; browser financeerp-8195126.ztna.sse.cisco.com --user neha.kapoor@nwkings.example</pre>
<pre class="out">&lt;h1&gt;Finance-ERP · ERP&lt;/h1&gt;&lt;p&gt;Private application reached through Cisco Secure Access (<span class="hl">browser-based ZTNA</span>) via resource connector RC1.&lt;/p&gt;&lt;p&gt;Signed in as neha.kapoor@nwkings.example&lt;/p&gt;</pre>
<p>Without <code>--user</code> the page is the SAML sign-in prompt ("Sign in to continue to Finance-ERP"). If you forget step 2, the response is <code>Access denied ... Blocked by private access rule Default Private Access</code>: the Finance rule matched Neha's group but not the browser access method, so evaluation fell through to the default block.</p>

<h3>Endpoint posture in depth</h3>
<p>Posture asks "is this device healthy enough for this app?" With client-based ZTNA, Secure Client reports the device state:</p>
<pre class="out">ROAM1&gt; secure-access posture
Posture (reported to Secure Access)
  Operating system : Windows 11 23H2
  Firewall         : <span class="hl">On</span>
  Disk encryption  : <span class="hl">Enabled (BitLocker)</span>
  Anti-malware     : <span class="hl">Secure Endpoint — up to date</span></pre>
<p>The lab's <b>Compliant</b> posture requires all three (firewall, disk encryption, anti-malware). If one fails, the session is refused with a precise reason, for example <code>Posture check failed (disk not encrypted)</code>, and the Roaming computers table in End User Connectivity shows the computer as <b>Non-compliant</b>. Real deployments add OS minimum versions, specific processes, and certificates, and can require stricter posture for the payroll app than for the intranet.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Choosing the access method">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">Private app request</text>
<rect x="20" y="100" width="180" height="54" rx="8" fill="#bbf7d0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">Managed laptop</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="11">client-based ZTNA</text>
<rect x="230" y="100" width="180" height="54" rx="8" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Unmanaged, web app</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="11">browser-based ZTNA</text>
<rect x="440" y="100" width="180" height="54" rx="8" fill="#fed7aa"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">Server-initiated, legacy</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="11">VPN as a service</text>
<line x1="280" y1="50" x2="110" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">All three are governed by the same identity, group and posture policy</text>
</svg><p class="cap">Pick the narrowest method that works for the user and the app.</p></div>

<h3>VPN as a service: still needed sometimes</h3>
<p>Secure Access also terminates <b>remote access VPN</b> with the Secure Client VPN module, so you can retire the on-premises concentrator even for traffic that ZTNA does not fit: applications where the <b>server initiates</b> connections to the client (some VoIP softphones, management agents that push to endpoints), legacy thick clients with many dynamic ports, or administrators who need network-level reach. Use split tunnelling for private prefixes only, and keep the VPN group as small as possible.</p>

<table class="cmp"><tr><th>Need</th><th>Best fit</th><th>Why</th></tr>
<tr><td>Employee laptop to ERP, Git, SSH</td><td>Client-based ZTNA</td><td>Full posture, per-app, TCP and UDP</td></tr>
<tr><td>Contractor on personal laptop to a web portal</td><td>Browser-based ZTNA</td><td>No client, one app, SAML</td></tr>
<tr><td>Softphone that receives inbound calls from the PBX</td><td>VPN as a service</td><td>Server-initiated traffic</td></tr>
<tr><td>Branch PCs to the data center</td><td>Network tunnel + private resources</td><td>No client on each PC</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Network Kings has 120 employees, 15 auditors twice a year and 6 support engineers who manage the softphone server. Plan: client-based ZTNA for all 120 (ERP, Git, wiki), browser-based for auditors to the ERP only, and a 6-user VPN group with split tunnel to 10.20.5.0/24 for the voice team. The old VPN pool of 500 addresses shrinks to 16.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Publishing browser-based access for an app but not adding the Browser-based method to the private rule. Expecting device posture checks on unmanaged browsers. Moving every user to ZTNA in one weekend without testing apps that use server-initiated connections.</p></div>

<div class="exam"><p><b>Exam traps.</b> Browser-based ZTNA = clientless, web apps, SAML, limited posture, ideal for third parties. Client-based ZTNA = Secure Client Zero Trust Access module, device certificate, full posture. RAVPN gives network-level access and remains for use cases ZTNA cannot cover.</p></div>

<div class="scn"><h4>Contractor on a personal laptop</h4><p>An auditor needed the web-based ERP for two weeks from an unmanaged laptop, and IT refused to install software on it. The first idea was a full-tunnel VPN profile, which would have put a personal device on the finance network. Instead the engineer enabled browser-based access on Finance-ERP and added a private rule for the auditor's account with the Browser-based method. On day 15 the account was disabled in the IdP and access ended immediately.</p><p><b>Lesson:</b> for third parties, give one app through the browser, tied to an identity you can switch off.</p></div>

<div class="iv"><p class="q">"When would you choose browser-based ZTNA over client-based ZTNA, and what do you lose?"</p><p>Strong answer: for unmanaged or third-party devices where you cannot install Secure Client, and for web applications. You lose full device posture (no disk-encryption or anti-malware checks), non-web protocols, and the transparent experience of the client. Compensate with stronger identity (MFA), short sessions, a narrow rule to one app, and logging.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Browser-based ZTNA: public URL per web app, SAML sign-in, no client, limited posture.</li>
<li>The private rule must include the Browser-based access method.</li>
<li>Client-based posture checks firewall, disk encryption and anti-malware; failures give precise reasons.</li>
<li>VPN as a service covers server-initiated and legacy traffic.</li>
<li>Choose the narrowest access method that fits user and app.</li>
</ul></div>
`,hi:`
<p>Hotel apne staff ko programmed key card deta hai. Jo plumber ek dopahar ke liye aata hai use card nahi milta; reception use us ek room tak le jaata hai, kaam dekhta hai aur bahar chhod aata hai. Jis long-term tenant ko poora floor chahiye uske liye alag arrangement hota hai. Secure Access private apps ke liye yahi teen options deta hai: managed laptops ke liye <b>client-based ZTNA</b>, unmanaged devices ke liye <b>browser-based ZTNA</b>, aur jo ZTNA abhi nahi kar sakta uske liye <b>VPN as a service</b>.</p>

<h3>Browser-based (clientless) ZTNA</h3>
<p>Kuch users software install nahi kar sakte ya nahi karne chahiye: auditors, contractors, partners, personal tablet par employee. Unke liye private web app ko Secure Access dwara hosted ek <b>public URL</b> milta hai. User use kisi bhi browser mein kholta hai, <b>SAML</b> se sign in karta hai, aur Secure Access private access rule lagakar session ko resource connector se proxy karta hai. Khasiyat:</p>
<ul>
<li>Koi client nahi, install ya uninstall karne ko kuch nahi.</li>
<li><b>Web applications</b> (HTTP aur HTTPS) ke liye design kiya gaya.</li>
<li><b>Limited posture</b>: browser browser type aur operating system se zyada kuch report nahi kar sakta; disk-encryption ya anti-malware check nahi hota.</li>
<li>Bilkul ek app expose karta hai, har request user identity ke saath log hoti hai.</li>
</ul>

<h3>Lab walk-through: Neha apne personal tablet par</h3>
<ol>
<li><b>Resources, Private Resources</b>, <b>Finance-ERP</b> select karo, <b>Edit</b>, <b>Browser-based access (public URL for unmanaged devices)</b> on karo. Resource card ab URL dikhata hai, is lab mein HTTPS par <code>financeerp-8195126.ztna.sse.cisco.com</code>.</li>
<li><b>Secure, Access Policy, Private access</b>, <b>Finance to ERP</b> kholo aur <b>Access methods</b> mein Client-based ke saath <b>Browser-based</b> tick karo. Rule ki posture setting client-based sessions par lagti rehti hai.</li>
<li>TABLET se Neha ki tarah URL kholo:</li>
</ol>
<pre class="code">TABLET&gt; browser financeerp-8195126.ztna.sse.cisco.com --user neha.kapoor@nwkings.example</pre>
<pre class="out">&lt;h1&gt;Finance-ERP · ERP&lt;/h1&gt;&lt;p&gt;Private application reached through Cisco Secure Access (<span class="hl">browser-based ZTNA</span>) via resource connector RC1.&lt;/p&gt;&lt;p&gt;Signed in as neha.kapoor@nwkings.example&lt;/p&gt;</pre>
<p><code>--user</code> ke bina page SAML sign-in prompt hota hai ("Sign in to continue to Finance-ERP"). Agar aap step 2 bhool jao, to response hota hai <code>Access denied ... Blocked by private access rule Default Private Access</code>: Finance rule Neha ke group se match hua par browser access method se nahi, isliye evaluation default block tak gir gaya.</p>

<h3>Endpoint posture detail mein</h3>
<p>Posture poochta hai "kya yeh device is app ke liye kaafi healthy hai?" Client-based ZTNA mein Secure Client device state report karta hai:</p>
<pre class="out">ROAM1&gt; secure-access posture
Posture (reported to Secure Access)
  Operating system : Windows 11 23H2
  Firewall         : <span class="hl">On</span>
  Disk encryption  : <span class="hl">Enabled (BitLocker)</span>
  Anti-malware     : <span class="hl">Secure Endpoint — up to date</span></pre>
<p>Lab ka <b>Compliant</b> posture teeno maangta hai (firewall, disk encryption, anti-malware). Agar ek bhi fail ho, session ek precise reason ke saath refuse hota hai, jaise <code>Posture check failed (disk not encrypted)</code>, aur End User Connectivity ki Roaming computers table computer ko <b>Non-compliant</b> dikhati hai. Real deployments OS minimum versions, specific processes aur certificates jodte hain, aur intranet se zyada strict posture payroll app ke liye maang sakte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Choosing the access method">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">Private app request</text>
<rect x="20" y="100" width="180" height="54" rx="8" fill="#bbf7d0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">Managed laptop</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="11">client-based ZTNA</text>
<rect x="230" y="100" width="180" height="54" rx="8" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Unmanaged, web app</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="11">browser-based ZTNA</text>
<rect x="440" y="100" width="180" height="54" rx="8" fill="#fed7aa"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">Server-initiated, legacy</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="11">VPN as a service</text>
<line x1="280" y1="50" x2="110" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="530" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Teeno same identity, group aur posture policy se chalte hain</text>
</svg><p class="cap">User aur app ke liye kaam karne wala sabse narrow method chuno.</p></div>

<h3>VPN as a service: kabhi-kabhi ab bhi zaroori</h3>
<p>Secure Access Secure Client VPN module ke saath <b>remote access VPN</b> bhi terminate karta hai, isliye aap on-premises concentrator retire kar sakte ho, us traffic ke liye bhi jo ZTNA mein fit nahi hota: aisi applications jahan <b>server client ki taraf connection initiate</b> karta hai (kuch VoIP softphones, endpoints par push karne wale management agents), bahut saare dynamic ports wale legacy thick clients, ya administrators jinhe network-level reach chahiye. Sirf private prefixes ke liye split tunnelling use karo, aur VPN group jitna ho sake chhota rakho.</p>

<table class="cmp"><tr><th>Zaroorat</th><th>Best fit</th><th>Kyun</th></tr>
<tr><td>Employee laptop se ERP, Git, SSH</td><td>Client-based ZTNA</td><td>Full posture, per-app, TCP aur UDP</td></tr>
<tr><td>Personal laptop par contractor se web portal</td><td>Browser-based ZTNA</td><td>Koi client nahi, ek app, SAML</td></tr>
<tr><td>Softphone jo PBX se inbound calls receive karta hai</td><td>VPN as a service</td><td>Server-initiated traffic</td></tr>
<tr><td>Branch PCs se data center</td><td>Network tunnel + private resources</td><td>Har PC par client nahi</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Network Kings mein 120 employees, saal mein do baar 15 auditors aur 6 support engineers hain jo softphone server manage karte hain. Plan: saare 120 ke liye client-based ZTNA (ERP, Git, wiki), auditors ke liye sirf ERP tak browser-based, aur voice team ke liye 10.20.5.0/24 tak split tunnel wala 6-user VPN group. 500 addresses ka purana VPN pool 16 tak sikud jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> App ke liye browser-based access publish karna par private rule mein Browser-based method na jodna. Unmanaged browsers par device posture checks ki ummeed karna. Server-initiated connections use karne wale apps test kiye bina ek weekend mein har user ko ZTNA par shift karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Browser-based ZTNA = clientless, web apps, SAML, limited posture, third parties ke liye ideal. Client-based ZTNA = Secure Client Zero Trust Access module, device certificate, full posture. RAVPN network-level access deta hai aur un use cases ke liye rehta hai jo ZTNA cover nahi kar sakta.</p></div>

<div class="scn"><h4>Personal laptop par contractor</h4><p>Ek auditor ko do hafte unmanaged laptop se web-based ERP chahiye tha, aur IT ne us par software install karne se mana kar diya. Pehla idea full-tunnel VPN profile tha, jo personal device ko finance network par daal deta. Iski jagah engineer ne Finance-ERP par browser-based access enable kiya aur auditor ke account ke liye Browser-based method wala private rule joda. 15ve din account IdP mein disable hua aur access turant khatam ho gaya.</p><p><b>Seekh:</b> third parties ko browser ke through ek app do, ek aisi identity se bandha jise aap switch off kar sako.</p></div>

<div class="iv"><p class="q">"Client-based ZTNA ki jagah browser-based ZTNA kab chunoge, aur kya khoge?"</p><p>Strong answer: unmanaged ya third-party devices ke liye jahan Secure Client install nahi kar sakte, aur web applications ke liye. Aap full device posture (disk-encryption ya anti-malware checks nahi), non-web protocols, aur client ka transparent experience khote ho. Isko stronger identity (MFA), chhote sessions, ek app tak narrow rule aur logging se compensate karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Browser-based ZTNA: har web app ka public URL, SAML sign-in, koi client nahi, limited posture.</li>
<li>Private rule mein Browser-based access method hona chahiye.</li>
<li>Client-based posture firewall, disk encryption aur anti-malware check karta hai; failures precise reasons dete hain.</li>
<li>VPN as a service server-initiated aur legacy traffic cover karta hai.</li>
<li>User aur app ke liye fit hone wala sabse narrow access method chuno.</li>
</ul></div>
`}};export{e as default};