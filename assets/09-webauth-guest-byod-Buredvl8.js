var e={id:`webauth-guest-byod`,h:{en:`WebAuth, guest services and BYOD onboarding`,hi:`WebAuth, guest services aur BYOD onboarding`},body:{en:`
<p>A hotel lobby has three ways in. A walk-in visitor reads the house rules at the desk and gets a day pass (hotspot). A visitor can fill in a form and receive a code by SMS (self-registration). A business guest is pre-registered by the employee they are visiting (sponsored). And a staff member who brings a personal phone gets it registered once, receives a badge sticker for it, and from then on walks straight through (BYOD). ISE implements all of these with <b>web authentication</b> portals and a little help from CoA.</p>

<h3>Three ways to give guests access</h3>
<table class="cmp"><tr><th>Method</th><th>Where the login page lives</th><th>Notes</th></tr>
<tr><td>Guest VLAN on the switch</td><td>No login at all</td><td>What the lab builds with <code>authentication event no-response action authorize vlan 50</code>. Simple, but no identity, no terms acceptance, no logging of who the guest was</td></tr>
<tr><td>Local WebAuth (LWA)</td><td>On the switch or WLC</td><td>The NAS hosts the page and sends the credentials to ISE; limited customisation</td></tr>
<tr><td>Central WebAuth (CWA)</td><td>On the ISE PSN</td><td>Most common with ISE: MAB plus redirect, ISE portal, then CoA; full guest lifecycle and reporting</td></tr>
</table>

<h3>Central WebAuth, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Central web authentication flow">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">GUEST1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">ISE PSN</text>
<line x1="80" y1="28" x2="80" y2="280" stroke="#64748b" stroke-width="1"/><line x1="320" y1="28" x2="320" y2="280" stroke="#64748b" stroke-width="1"/><line x1="560" y1="28" x2="560" y2="280" stroke="#64748b" stroke-width="1"/>
<line x1="320" y1="55" x2="560" y2="55" stroke="#64748b" stroke-width="2"/><text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">1 MAB, unknown MAC</text>
<line x1="560" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="440" y="80" text-anchor="middle" class="svg-accent" font-size="12">2 Accept + url-redirect</text>
<line x1="80" y1="120" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><text x="200" y="115" text-anchor="middle" class="svg-muted" font-size="12">3 browser opens any site</text>
<line x1="320" y1="145" x2="80" y2="145" stroke="#64748b" stroke-width="2"/><text x="200" y="160" text-anchor="middle" class="svg-muted" font-size="12">redirected to portal</text>
<line x1="80" y1="185" x2="560" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">4 guest logs in on port 8443</text>
<line x1="560" y1="215" x2="320" y2="215" stroke="#64748b" stroke-width="2"/><text x="440" y="210" text-anchor="middle" class="svg-accent" font-size="12">5 CoA reauth</text>
<line x1="320" y1="245" x2="560" y2="245" stroke="#64748b" stroke-width="2"/><line x1="560" y1="265" x2="320" y2="265" stroke="#64748b" stroke-width="2"/><text x="440" y="240" text-anchor="middle" class="svg-accent" font-size="12">6 MAB again</text><text x="440" y="280" text-anchor="middle" class="svg-accent" font-size="12">Accept: guest access</text>
</svg><p class="cap">CWA: the first MAB returns a redirect, the guest logs in on ISE, and a CoA makes the switch re-authenticate so the second MAB matches the "guest flow" rule.</p></div>
<ol>
<li>The guest's laptop has no supplicant, so the switch falls back to MAB. ISE does not know the MAC, but "If User not found = Continue" lets it reach authorization.</li>
<li>The authorization rule for Wired_MAB returns a redirect profile: <code>url-redirect</code> to the guest portal and <code>url-redirect-acl</code> naming a switch ACL (permit = redirect web traffic; deny = let DHCP, DNS and ISE through).</li>
<li>The guest opens a browser; the switch intercepts the web request and answers with a redirect to the PSN portal on port 8443.</li>
<li>The guest accepts the terms or logs in. ISE marks the endpoint (for example in the GuestEndpoints identity group) and remembers the session as a completed guest flow.</li>
<li>ISE sends a <b>CoA reauthenticate</b> to the switch for that session.</li>
<li>The switch runs MAB again. Now a higher rule matches, such as <b>Network Access:UseCase EQUALS Guest Flow</b> or identity group GuestEndpoints, and returns internet-only access (a guest VLAN, a dACL or SGT Guests).</li>
</ol>

<pre class="code"><span class="c">! switch pieces for CWA</span>
ip access-list extended ACL-REDIRECT
 deny   udp any any eq domain
 deny   udp any any eq bootps
 deny   ip any host 10.99.99.10
 permit tcp any any eq www
 permit tcp any any eq 443
ip h&#116;tp server
ip h&#116;tp secure-server
aaa server radius dynamic-author
 client 10.99.99.10 server-key NKcoa</pre>

<h3>Guest portal types</h3>
<ul>
<li><b>Hotspot</b>: accept an acceptable use policy (AUP), optionally enter an access code; no account.</li>
<li><b>Self-registered</b>: the guest fills a form, receives credentials by SMS or email, optionally needs sponsor approval.</li>
<li><b>Sponsored</b>: an employee creates accounts in the <b>sponsor portal</b>, choosing a guest type that sets duration (for example 1 day) and allowed login hours.</li>
</ul>

<h3>BYOD: personal devices with corporate trust</h3>
<p>The ISE <b>BYOD</b> flow onboards a personal phone or laptop so it can later use EAP-TLS like a corporate device:</p>
<ol>
<li>The user connects (single-SSID with PEAP, or a dual-SSID design starting on an open onboarding SSID) and is redirected to the BYOD portal.</li>
<li>The user registers the device; ISE pushes a <b>native supplicant provisioning</b> profile and a <b>certificate</b> issued by the ISE internal CA (or an external CA through SCEP).</li>
<li>The device reconnects with EAP-TLS; ISE sees EndPoints:BYODRegistration = Yes and the certificate, and applies the BYOD rule (for example SGT BYOD, internet plus email only).</li>
<li>Users manage lost devices in the <b>My Devices portal</b>; marking a device lost or stolen blocks it. ISE can also query an <b>MDM</b> to require enrolment and compliance.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A sponsor creates 25 accounts for a two-day partner workshop with guest type "Workshop", 2-day duration, login 08:00 to 20:00. On day one, each laptop goes through MAB, redirect, login and CoA in about 10 seconds. The authorization rule for the guest flow returns GUEST_DACL (DNS, DHCP and internet only, deny 10.0.0.0/8) and SGT Guests. On day three the accounts expire and new logins fail with an expired-account reason in Live Logs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Building CWA but forgetting CoA support on the switch (<code>aaa server radius dynamic-author</code>). The guest logs in successfully on the portal, but the switch never re-authenticates, so the guest stays stuck on the redirect. This is the same fault you fix in the lab "CoA ignored".</p></div>

<div class="exam"><p><b>Exam trap.</b> CWA = MAB + redirect + portal on ISE + CoA. LWA = the portal is on the network device. The guest portal port on ISE defaults to 8443. BYOD onboarding typically ends with EAP-TLS and a certificate from the ISE internal CA.</p></div>

<div class="scn"><h4>The redirect loop</h4><p>Guests at a branch saw the portal but after login were redirected again and again. Live Logs showed the CoA succeeded and the second MAB matched the Guest Flow rule, which returned PermitAccess, but the switch still applied the redirect. The guest flow rule profile did not override the earlier redirect because the guest session had been bounced to a different PSN behind a load balancer without persistence, so the second PSN did not know the guest flow state. Enabling source-IP stickiness for RADIUS on the load balancer fixed it.</p><p><b>Lesson:</b> CWA depends on the same PSN seeing the whole flow; check PSN stickiness when guests loop.</p></div>

<div class="iv"><p class="q">"Describe central web authentication for wired guests."</p><p>Strong answer: the port tries 802.1X, falls back to MAB, ISE continues on unknown MAC and returns a redirect profile with url-redirect and a redirect ACL. The switch intercepts web traffic and sends the guest to the ISE portal; after login ISE sends CoA reauth, the switch re-runs MAB, and a guest-flow rule returns limited access. Mention that the switch needs its web server and dynamic-author configured.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest options: switch guest VLAN (no identity), LWA (portal on NAS), CWA (portal on ISE).</li>
<li>CWA = MAB with Continue, redirect profile, portal login, CoA reauth, guest-flow rule.</li>
<li>Portal types: hotspot, self-registered, sponsored (sponsor portal and guest types).</li>
<li>BYOD onboarding provisions a supplicant profile and certificate, then the device uses EAP-TLS.</li>
<li>The switch needs a redirect ACL, its web server and CoA support for CWA to work.</li>
</ul></div>
`,hi:`
<p>Hotel lobby mein andar aane ke teen tarike hain. Walk-in visitor desk par house rules padhta hai aur day pass paata hai (hotspot). Visitor ek form bhar sakta hai aur SMS se code paa sakta hai (self-registration). Business guest ko woh employee pehle se register karta hai jisse woh milne aaya hai (sponsored). Aur jo staff member personal phone laata hai, use ek baar register karwata hai, uske liye badge sticker paata hai, aur uske baad seedha andar jaata hai (BYOD). ISE yeh sab <b>web authentication</b> portals aur CoA ki thodi madad se karta hai.</p>

<h3>Guests ko access dene ke teen tarike</h3>
<table class="cmp"><tr><th>Method</th><th>Login page kahan hai</th><th>Notes</th></tr>
<tr><td>Switch par guest VLAN</td><td>Koi login nahi</td><td>Lab <code>authentication event no-response action authorize vlan 50</code> se yahi banata hai. Simple, par na identity, na terms acceptance, na yeh log ki guest kaun tha</td></tr>
<tr><td>Local WebAuth (LWA)</td><td>Switch ya WLC par</td><td>NAS page host karta hai aur credentials ISE ko bhejta hai; limited customisation</td></tr>
<tr><td>Central WebAuth (CWA)</td><td>ISE PSN par</td><td>ISE ke saath sabse common: MAB plus redirect, ISE portal, phir CoA; poora guest lifecycle aur reporting</td></tr>
</table>

<h3>Central WebAuth, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Central web authentication flow">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">GUEST1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">ISE PSN</text>
<line x1="80" y1="28" x2="80" y2="280" stroke="#64748b" stroke-width="1"/><line x1="320" y1="28" x2="320" y2="280" stroke="#64748b" stroke-width="1"/><line x1="560" y1="28" x2="560" y2="280" stroke="#64748b" stroke-width="1"/>
<line x1="320" y1="55" x2="560" y2="55" stroke="#64748b" stroke-width="2"/><text x="440" y="50" text-anchor="middle" class="svg-accent" font-size="12">1 MAB, anjaan MAC</text>
<line x1="560" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="440" y="80" text-anchor="middle" class="svg-accent" font-size="12">2 Accept + url-redirect</text>
<line x1="80" y1="120" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><text x="200" y="115" text-anchor="middle" class="svg-muted" font-size="12">3 browser koi site kholta hai</text>
<line x1="320" y1="145" x2="80" y2="145" stroke="#64748b" stroke-width="2"/><text x="200" y="160" text-anchor="middle" class="svg-muted" font-size="12">portal par redirect</text>
<line x1="80" y1="185" x2="560" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">4 guest port 8443 par login karta hai</text>
<line x1="560" y1="215" x2="320" y2="215" stroke="#64748b" stroke-width="2"/><text x="440" y="210" text-anchor="middle" class="svg-accent" font-size="12">5 CoA reauth</text>
<line x1="320" y1="245" x2="560" y2="245" stroke="#64748b" stroke-width="2"/><line x1="560" y1="265" x2="320" y2="265" stroke="#64748b" stroke-width="2"/><text x="440" y="240" text-anchor="middle" class="svg-accent" font-size="12">6 dobara MAB</text><text x="440" y="280" text-anchor="middle" class="svg-accent" font-size="12">Accept: guest access</text>
</svg><p class="cap">CWA: pehla MAB redirect lautata hai, guest ISE par login karta hai, aur CoA switch se re-authenticate karwata hai taaki doosra MAB "guest flow" rule match kare.</p></div>
<ol>
<li>Guest ke laptop mein supplicant nahi hai, isliye switch MAB par fallback karta hai. ISE MAC nahi jaanta, par "If User not found = Continue" use authorization tak pahunchne deta hai.</li>
<li>Wired_MAB ka authorization rule ek redirect profile lautata hai: guest portal tak <code>url-redirect</code> aur switch ACL ka naam batata <code>url-redirect-acl</code> (permit = web traffic redirect; deny = DHCP, DNS aur ISE ko jaane do).</li>
<li>Guest browser kholta hai; switch web request intercept karta hai aur port 8443 par PSN portal ke redirect se jawab deta hai.</li>
<li>Guest terms accept karta hai ya login karta hai. ISE endpoint ko mark karta hai (jaise GuestEndpoints identity group mein) aur session ko completed guest flow ki tarah yaad rakhta hai.</li>
<li>ISE us session ke liye switch ko <b>CoA reauthenticate</b> bhejta hai.</li>
<li>Switch dobara MAB chalata hai. Ab ek upar wala rule match hota hai, jaise <b>Network Access:UseCase EQUALS Guest Flow</b> ya identity group GuestEndpoints, aur internet-only access lautata hai (guest VLAN, dACL ya SGT Guests).</li>
</ol>

<pre class="code"><span class="c">! CWA ke liye switch ke pieces</span>
ip access-list extended ACL-REDIRECT
 deny   udp any any eq domain
 deny   udp any any eq bootps
 deny   ip any host 10.99.99.10
 permit tcp any any eq www
 permit tcp any any eq 443
ip h&#116;tp server
ip h&#116;tp secure-server
aaa server radius dynamic-author
 client 10.99.99.10 server-key NKcoa</pre>

<h3>Guest portal types</h3>
<ul>
<li><b>Hotspot</b>: acceptable use policy (AUP) accept karo, optionally access code daalo; koi account nahi.</li>
<li><b>Self-registered</b>: guest form bharta hai, SMS ya email se credentials paata hai, optionally sponsor approval chahiye.</li>
<li><b>Sponsored</b>: ek employee <b>sponsor portal</b> mein accounts banata hai, ek guest type chunkar jo duration (jaise 1 din) aur allowed login hours set karta hai.</li>
</ul>

<h3>BYOD: corporate trust ke saath personal devices</h3>
<p>ISE ka <b>BYOD</b> flow ek personal phone ya laptop ko onboard karta hai taaki woh baad mein corporate device ki tarah EAP-TLS use kar sake:</p>
<ol>
<li>User connect karta hai (PEAP ke saath single-SSID, ya open onboarding SSID se shuru hone wala dual-SSID design) aur BYOD portal par redirect hota hai.</li>
<li>User device register karta hai; ISE ek <b>native supplicant provisioning</b> profile aur ISE internal CA (ya SCEP se external CA) ka issue kiya <b>certificate</b> push karta hai.</li>
<li>Device EAP-TLS ke saath reconnect karta hai; ISE EndPoints:BYODRegistration = Yes aur certificate dekhta hai, aur BYOD rule apply karta hai (jaise SGT BYOD, sirf internet plus email).</li>
<li>Users kho gaye devices ko <b>My Devices portal</b> mein manage karte hain; device ko lost ya stolen mark karne se woh block hota hai. ISE enrolment aur compliance maangne ke liye <b>MDM</b> ko query bhi kar sakta hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek sponsor do din ke partner workshop ke liye 25 accounts banata hai, guest type "Workshop", 2-day duration, login 08:00 se 20:00. Pehle din har laptop MAB, redirect, login aur CoA lagbhag 10 seconds mein poora karta hai. Guest flow ka authorization rule GUEST_DACL (sirf DNS, DHCP aur internet, deny 10.0.0.0/8) aur SGT Guests lautata hai. Teesre din accounts expire hote hain aur naye logins Live Logs mein expired-account reason ke saath fail hote hain.</p></div>

<div class="warn"><p><b>Common galti.</b> CWA banana par switch par CoA support (<code>aaa server radius dynamic-author</code>) bhool jaana. Guest portal par successfully login karta hai, par switch kabhi re-authenticate nahi karta, isliye guest redirect par atka rehta hai. Yeh wahi fault hai jo aap lab "CoA ignored" mein fix karte ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> CWA = MAB + redirect + ISE par portal + CoA. LWA = portal network device par hai. ISE par guest portal ka default port 8443 hai. BYOD onboarding aam taur par EAP-TLS aur ISE internal CA ke certificate ke saath khatam hota hai.</p></div>

<div class="scn"><h4>Redirect loop</h4><p>Ek branch ke guests ko portal dikhta tha par login ke baad baar baar redirect hote the. Live Logs dikhate the ki CoA succeed hua aur doosre MAB ne Guest Flow rule match kiya, jo PermitAccess lautata tha, par switch abhi bhi redirect apply karta tha. Asal mein guest session load balancer ke peeche bina persistence ke ek doosre PSN par chala gaya tha, isliye doosre PSN ko guest flow state pata hi nahi tha. Load balancer par RADIUS ke liye source-IP stickiness enable karne se fix hua.</p><p><b>Seekh:</b> CWA is par nirbhar hai ki poora flow ek hi PSN dekhe; guests loop karein to PSN stickiness check karo.</p></div>

<div class="iv"><p class="q">"Wired guests ke liye central web authentication describe karo."</p><p>Strong answer: port 802.1X try karta hai, MAB par fallback karta hai, ISE anjaan MAC par continue karta hai aur url-redirect aur redirect ACL ke saath redirect profile lautata hai. Switch web traffic intercept karke guest ko ISE portal par bhejta hai; login ke baad ISE CoA reauth bhejta hai, switch MAB dobara chalata hai, aur guest-flow rule limited access lautata hai. Batao ki switch ko apna web server aur dynamic-author configured chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest options: switch guest VLAN (koi identity nahi), LWA (NAS par portal), CWA (ISE par portal).</li>
<li>CWA = Continue ke saath MAB, redirect profile, portal login, CoA reauth, guest-flow rule.</li>
<li>Portal types: hotspot, self-registered, sponsored (sponsor portal aur guest types).</li>
<li>BYOD onboarding supplicant profile aur certificate provision karta hai, phir device EAP-TLS use karta hai.</li>
<li>CWA chalne ke liye switch ko redirect ACL, apna web server aur CoA support chahiye.</li>
</ul></div>
`}};export{e as default};