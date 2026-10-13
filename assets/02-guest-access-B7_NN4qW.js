var e={id:`guest-access`,h:{en:`Guest access: the visitor journey (concept)`,hi:`Guest access: visitor ki journey (concept)`},body:{en:`
<p><b>Not simulated in the lab.</b> The guest self-registration portal and captive portal are concepts in this course. The lab simulates only the network side of a guest: the GUEST role in VLAN 40 and the R1 access list that keeps guests away from internal networks. Everything in the first half of this chapter describes the real ClearPass product.</p>

<h3>Start with an analogy: the visitor desk</h3>
<p>When a visitor arrives at a company, the guard does not give them an employee badge. A receptionist asks for a name, a host and a reason, prints a temporary pass that works for one day, and the pass opens only the lobby and the meeting rooms. At closing time the pass stops working. Guest access on a network is the same idea: a <b>bounded identity</b>, a <b>bounded network</b> and a <b>bounded time</b>.</p>

<h3>What ClearPass Guest does (real product)</h3>
<p>ClearPass Policy Manager makes the access decision. A companion module, ClearPass Guest, provides the visitor workflow: web pages where a visitor can <b>self-register</b>, or where a staff member (a <b>sponsor</b> or receptionist) creates an account for them. The account is stored with a validity period, a role and sometimes a data-collection form. When the visitor later logs in, ClearPass authenticates them against that guest repository and returns the guest role.</p>
<p>The common guest journeys are:</p>
<ul>
<li><b>Sponsor-created account.</b> The receptionist creates the account and hands over the username and password. Good for controlled visits.</li>
<li><b>Self-registration.</b> The visitor fills a form on the portal. The account can be active at once, or wait for sponsor approval. Good for high-volume public areas.</li>
<li><b>Login-only guest.</b> The visitor already has credentials, for example an event badge, and just logs in.</li>
</ul>

<h3>The captive portal flow</h3>
<p>A visitor's phone has no credentials yet, so the network must let it reach the portal before it is "authenticated". The usual sequence on a wired or wireless network is:</p>
<ol>
<li>The device connects. The switch has no credentials, so it performs MAC authentication (or an unknown-device decision) and ClearPass returns a pre-login role. That role allows DHCP, DNS and the portal address only.</li>
<li>The visitor opens a web page. The network redirects the browser to the ClearPass Guest login or registration page. The redirect is done by the network device as part of the role; the exact mechanism depends on the switch or controller model and software release.</li>
<li>The visitor registers or logs in. ClearPass checks the account.</li>
<li>ClearPass changes the session to the post-login guest role. This is where RFC 5176 CoA appears again: the session is already live, so ClearPass uses CoA or a reauthentication to move it from the pre-login role to the guest role.</li>
<li>When the account expires, new logins fail. Whether an already running session is also ended depends on what you configured (session timeout, reauthentication or an explicit Disconnect). Test it, do not assume it.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Captive portal flow">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Visitor</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">phone</text>
<rect x="170" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="230" y="45" text-anchor="middle" class="svg-ink" font-size="13">Switch / AP</text><text x="230" y="63" text-anchor="middle" class="svg-muted" font-size="12">pre-login role</text>
<rect x="340" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="405" y="45" text-anchor="middle" class="svg-ink" font-size="13">Guest portal</text><text x="405" y="63" text-anchor="middle" class="svg-muted" font-size="12">register / login</text>
<rect x="510" y="20" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">decides, sends CoA</text>
<line x1="120" y1="50" x2="170" y2="50" stroke="#64748b"/><line x1="290" y1="50" x2="340" y2="50" stroke="#64748b"/><line x1="470" y1="50" x2="510" y2="50" stroke="#64748b"/>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">1 connect  2 redirect  3 register  4 CoA to guest role  5 expiry</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">The portal is a front door; the role on the switch is the real boundary.</text>
</svg><p class="cap">The portal collects identity. The enforcement is still a role on the access device.</p></div>

<h3>What the lab does simulate: the guest boundary</h3>
<p>In the lab the guest destination is an ordinary role. ACCESS defines <code>port-access role GUEST</code> with <code>vlan access 40</code>. VLAN 40 is the 10.20.40.0/24 GUEST network, and R1's GUEST-IN access list blocks it from VLANs 10, 20 and 30 and from the server networks. A client in that role can obtain a DHCP address and has internet-style access, but a ping to APP1 at 10.20.70.20 fails. That is exactly the guest security property you need to prove in production: <b>connectivity works, internal access is denied</b>.</p>

<h3>Guest security design points</h3>
<table class="cmp"><tr><th>Question</th><th>Why it matters</th></tr>
<tr><td>Who may create guest accounts?</td><td>A receptionist role should create guests without having policy-administrator rights.</td></tr>
<tr><td>How long does an account last?</td><td>Short validity limits exposure; define it per visit type.</td></tr>
<tr><td>What does the pre-login role allow?</td><td>Only DHCP, DNS and the portal. Anything more is a hole.</td></tr>
<tr><td>Where is the real boundary?</td><td>On the switch and router (role plus ACL), not on the web page.</td></tr>
<tr><td>What happens at expiry?</td><td>Decide if running sessions are ended, and test it.</td></tr></table>
<p>One more real-world feature is <b>MAC caching</b>. After a visitor logs in once, ClearPass can remember the device MAC for the validity period, so that the next time the phone connects, MAC authentication succeeds silently and no portal page appears. ClearPass has a built-in role named [MAC Caching] for this purpose.</p>

<div class="warn"><p><b>Common mistake.</b> Judging a guest design by whether the portal page appears. A page that loads proves nothing about DHCP, DNS, the role or the ACL. Always test the three outcomes: the visitor can browse, the visitor cannot reach internal servers, and access ends when the account expires.</p></div>

<div class="exam"><p><b>Exam trap.</b> Guest self-registration is not the same as the reject-role. A guest portal user is a deliberate, registered visitor. A reject-role user is someone who tried to authenticate and failed. They may end up in the same VLAN, but the audit trail and the risk are different.</p></div>

<div class="scn"><h4>"Login successful" but no internet</h4><p>A visitor sees the portal message "login successful" but no page loads. The engineer checks the switch first: the port shows the guest role applied in VLAN 40. Next, DHCP: the client has an address. Next, DNS: the resolver is not reachable from the guest VLAN, so names do not resolve. Fixing the guest ACL to allow the DNS server solved it. Another day, a visitor could open the internal file server, which was a firewall rule that was too broad.</p><p><b>Lesson:</b> a portal outcome is only one step. Check role, address, DNS and permitted destinations with traffic evidence.</p></div>

<div class="iv"><p class="q">"How would you design guest Wi-Fi or wired guest access with ClearPass?"</p><p>Strong answer: define the journey (sponsored or self-registered, validity, data collected), a pre-login role limited to DHCP, DNS and the portal, a post-login guest role on a guest VLAN with an ACL denying internal networks, a CoA to move the session after login, expiry behaviour that you tested, and a least-privilege sponsor role. State that the portal is not the boundary.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest access means bounded identity, bounded network and bounded time.</li>
<li>ClearPass Guest provides sponsor and self-registration workflows; this is a concept, not simulated in the lab.</li>
<li>A captive portal needs a pre-login role, a redirect and a CoA or reauthentication to the guest role.</li>
<li>In the lab the guest boundary is the GUEST role (VLAN 40) plus the R1 GUEST-IN list.</li>
<li>Always prove: guests can browse and cannot reach internal servers.</li>
</ul></div>
`,hi:`
<p><b>Not simulated in the lab.</b> Guest self-registration portal aur captive portal is course mein concepts hain. Lab guest ka sirf network side simulate karta hai: VLAN 40 mein GUEST role aur R1 ki access list jo guests ko internal networks se door rakhti hai. Is chapter ke pehle half mein jo kuch hai woh real ClearPass product ko describe karta hai.</p>

<h3>Ek analogy se shuru karo: visitor desk</h3>
<p>Jab koi visitor company mein aata hai to guard use employee badge nahi deta. Receptionist naam, host aur reason poochta hai, ek din ka temporary pass print karta hai, aur woh pass sirf lobby aur meeting rooms kholta hai. Closing time par pass kaam karna band kar deta hai. Network par guest access bhi yahi idea hai: <b>bounded identity</b>, <b>bounded network</b> aur <b>bounded time</b>.</p>

<h3>ClearPass Guest kya karta hai (real product)</h3>
<p>ClearPass Policy Manager access decision leta hai. Ek companion module, ClearPass Guest, visitor workflow deta hai: web pages jahan visitor <b>self-register</b> kar sakta hai, ya jahan staff member (<b>sponsor</b> ya receptionist) uske liye account banata hai. Account validity period, role aur kabhi kabhi data-collection form ke saath store hota hai. Visitor baad mein login karta hai to ClearPass use us guest repository se authenticate karta hai aur guest role return karta hai.</p>
<p>Common guest journeys:</p>
<ul>
<li><b>Sponsor-created account.</b> Receptionist account banata hai aur username-password deta hai. Controlled visits ke liye achha.</li>
<li><b>Self-registration.</b> Visitor portal par form bharta hai. Account turant active ho sakta hai, ya sponsor approval ka intezaar kar sakta hai. High-volume public areas ke liye achha.</li>
<li><b>Login-only guest.</b> Visitor ke paas pehle se credentials hain, jaise event badge, aur woh bas login karta hai.</li>
</ul>

<h3>Captive portal flow</h3>
<p>Visitor ke phone ke paas abhi credentials nahi hain, isliye network ko "authenticated" hone se pehle use portal tak pahunchne dena padta hai. Wired ya wireless network par usual sequence:</p>
<ol>
<li>Device connect hota hai. Switch ke paas credentials nahi hain, isliye woh MAC authentication (ya unknown-device decision) karta hai aur ClearPass pre-login role return karta hai. Yeh role sirf DHCP, DNS aur portal address allow karta hai.</li>
<li>Visitor web page kholta hai. Network browser ko ClearPass Guest login ya registration page par redirect karta hai. Redirect network device role ke part ke roop mein karta hai; exact mechanism switch ya controller model aur software release par depend karta hai.</li>
<li>Visitor register ya login karta hai. ClearPass account check karta hai.</li>
<li>ClearPass session ko post-login guest role mein badalta hai. Yahan RFC 5176 CoA phir aata hai: session already live hai, isliye ClearPass CoA ya reauthentication se use pre-login role se guest role mein le jaata hai.</li>
<li>Account expire hone par new logins fail hote hain. Already chalta session bhi band hoga ya nahi, yeh aapki configuration par depend karta hai (session timeout, reauthentication ya explicit Disconnect). Test karo, assume mat karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Captive portal flow">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Visitor</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">phone</text>
<rect x="170" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="230" y="45" text-anchor="middle" class="svg-ink" font-size="13">Switch / AP</text><text x="230" y="63" text-anchor="middle" class="svg-muted" font-size="12">pre-login role</text>
<rect x="340" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="405" y="45" text-anchor="middle" class="svg-ink" font-size="13">Guest portal</text><text x="405" y="63" text-anchor="middle" class="svg-muted" font-size="12">register / login</text>
<rect x="510" y="20" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">decide, CoA bhejta</text>
<line x1="120" y1="50" x2="170" y2="50" stroke="#64748b"/><line x1="290" y1="50" x2="340" y2="50" stroke="#64748b"/><line x1="470" y1="50" x2="510" y2="50" stroke="#64748b"/>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">1 connect  2 redirect  3 register  4 CoA guest role  5 expiry</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Portal front door hai; switch ka role asli boundary hai.</text>
</svg><p class="cap">Portal identity collect karta hai. Enforcement abhi bhi access device ka role hai.</p></div>

<h3>Lab kya simulate karta hai: guest boundary</h3>
<p>Lab mein guest destination ek ordinary role hai. ACCESS par <code>port-access role GUEST</code> aur <code>vlan access 40</code> define hai. VLAN 40 10.20.40.0/24 GUEST network hai, aur R1 ki GUEST-IN access list use VLANs 10, 20, 30 aur server networks se block karti hai. Us role ka client DHCP address le sakta hai aur internet-style access paata hai, lekin APP1 (10.20.70.20) ko ping fail hota hai. Production mein bhi yahi guest security property prove karni hoti hai: <b>connectivity chalti hai, internal access denied hai</b>.</p>

<h3>Guest security design points</h3>
<table class="cmp"><tr><th>Sawal</th><th>Kyun matter karta hai</th></tr>
<tr><td>Guest accounts kaun bana sakta hai?</td><td>Receptionist role guests bana sake bina policy-administrator rights ke.</td></tr>
<tr><td>Account kitne time ka hai?</td><td>Chhoti validity exposure kam karti hai; visit type ke hisaab se define karo.</td></tr>
<tr><td>Pre-login role kya allow karta hai?</td><td>Sirf DHCP, DNS aur portal. Isse zyada hole hai.</td></tr>
<tr><td>Asli boundary kahan hai?</td><td>Switch aur router par (role plus ACL), web page par nahi.</td></tr>
<tr><td>Expiry par kya hota hai?</td><td>Decide karo ki running sessions band hon ya nahi, aur test karo.</td></tr></table>
<p>Ek aur real-world feature hai <b>MAC caching</b>. Visitor ek baar login kar le to ClearPass validity period tak device MAC yaad rakh sakta hai, taaki agli baar phone connect ho to MAC authentication chupchaap succeed ho aur portal page na aaye. Is kaam ke liye ClearPass ka built-in role [MAC Caching] hai.</p>

<div class="warn"><p><b>Common mistake.</b> Guest design ko isse judge karna ki portal page aata hai ya nahi. Page load hona DHCP, DNS, role ya ACL ke baare mein kuch prove nahi karta. Hamesha teen outcomes test karo: visitor browse kar sakta hai, visitor internal servers tak nahi pahunch sakta, aur account expire hone par access khatam ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Guest self-registration reject-role ke barabar nahi hai. Guest portal user ek jaan-boojh kar registered visitor hai. Reject-role user woh hai jisne authenticate karne ki koshish ki aur fail hua. Dono same VLAN mein ho sakte hain, lekin audit trail aur risk alag hain.</p></div>

<div class="scn"><h4>"Login successful" lekin internet nahi</h4><p>Visitor ko portal message "login successful" dikhta hai lekin koi page load nahi hota. Engineer pehle switch check karta hai: port par guest role VLAN 40 mein applied hai. Phir DHCP: client ke paas address hai. Phir DNS: guest VLAN se resolver reachable nahi, isliye names resolve nahi hote. Guest ACL mein DNS server allow karne se problem solve hui. Ek aur din ek visitor internal file server khol sakta tha, jo ek bahut broad firewall rule tha.</p><p><b>Seekh:</b> portal outcome sirf ek step hai. Role, address, DNS aur permitted destinations ko traffic evidence ke saath check karo.</p></div>

<div class="iv"><p class="q">"ClearPass ke saath guest Wi-Fi ya wired guest access kaise design karoge?"</p><p>Strong answer: journey define karo (sponsored ya self-registered, validity, kya data collect hoga), DHCP, DNS aur portal tak limited pre-login role, guest VLAN par post-login guest role jisme ACL internal networks deny kare, login ke baad session badalne ke liye CoA, tested expiry behaviour, aur least-privilege sponsor role. Bolo ki portal boundary nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest access ka matlab bounded identity, bounded network aur bounded time.</li>
<li>ClearPass Guest sponsor aur self-registration workflows deta hai; yeh concept hai, lab mein simulated nahi.</li>
<li>Captive portal ko pre-login role, redirect aur guest role tak CoA ya reauthentication chahiye.</li>
<li>Lab mein guest boundary GUEST role (VLAN 40) plus R1 GUEST-IN list hai.</li>
<li>Hamesha prove karo: guests browse kar sakte hain aur internal servers tak nahi pahunch sakte.</li>
</ul></div>
`}};export{e as default};