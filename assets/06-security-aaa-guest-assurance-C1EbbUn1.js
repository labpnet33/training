var e={id:`security`,h:{en:`Security, AAA, guest, DHCP/DNS and assurance design`,hi:`Security, AAA, guest, DHCP/DNS aur assurance design`},body:{en:`
<p><b>Analogy.</b> Airport security has several layers: a check at the door (who are you), a lane that decides where you may go (policy), a separate area for visitors (guest), and cameras watching everything (assurance). Wi-Fi security design uses the same layers.</p>

<h3>The case: Pioneer Airport</h3>
<p>Pioneer Airport, a fictional regional airport, serves 12,000 passengers on a busy day. It needs: free passenger Wi-Fi with a branded sign-in page and visitor analytics; secure Wi-Fi for 900 airline and ground staff with different access rights; baggage scanners and gate displays that cannot do 802.1X; and a regulator-driven rule that guest traffic never touches the corporate network. The security team also wants to find unauthorised APs set up by shops in the terminal.</p>

<h3>Authentication and encryption choices</h3>
<table class="cmp"><tr><th>Use case</th><th>Choice</th><th>Why</th></tr>
<tr><td>Corporate staff</td><td>WPA3-Enterprise (802.1X with ISE), PMF on</td><td>Per-user identity and keys, strong encryption</td></tr>
<tr><td>High-security staff</td><td>WPA3-Enterprise 192-bit mode</td><td>Stronger cryptography for regulated users</td></tr>
<tr><td>Devices without 802.1X</td><td>MAC Authentication Bypass (MAB) with ISE profiling, or iPSK / PSK on a separate WLAN</td><td>Devices still get a policy, not a flat network</td></tr>
<tr><td>Open guest</td><td>Open with WPA3 OWE or transition mode, plus web portal</td><td>OWE encrypts traffic without a password</td></tr>
<tr><td>Home-style personal</td><td>WPA3-Personal (SAE)</td><td>Resists offline guessing, unlike WPA2 PSK</td></tr>
</table>
<p>Use WPA3 transition mode only while old clients exist, and plan to remove it. Mixed WPA2 and WPA3 on one SSID is a compatibility step, not an end state.</p>

<h3>AAA design with ISE</h3>
<p>Cisco Identity Services Engine (ISE) is the RADIUS and policy server. A good design has: at least <b>two policy service nodes</b> (PSNs) and controllers configured to use both; correct timers so a failed server is detected quickly; <b>change of authorization (CoA)</b> so ISE can re-assign a client's policy after profiling or posture; and results returned as VLAN, ACL, or <b>security group tag (SGT)</b>. For FlexConnect branches, place a PSN, or a plan for local authentication, near sites that must survive WAN failure.</p>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Pioneer Airport security design">
<rect x="10" y="10" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="36" text-anchor="middle" class="svg-ink" font-size="12">Staff 802.1X</text>
<rect x="10" y="90" width="140" height="44" rx="8" fill="#fde68a"/><text x="80" y="116" text-anchor="middle" class="svg-ink" font-size="12">Scanners MAB</text>
<rect x="10" y="170" width="140" height="44" rx="8" fill="#fed7aa"/><text x="80" y="196" text-anchor="middle" class="svg-ink" font-size="12">Passengers guest</text>
<rect x="230" y="90" width="130" height="60" rx="8" fill="#bae6fd"/><text x="295" y="116" text-anchor="middle" class="svg-ink" font-size="12">Internal</text><text x="295" y="134" text-anchor="middle" class="svg-ink" font-size="12">9800 controller</text>
<line x1="150" y1="32" x2="230" y2="105" stroke="#64748b"/><line x1="150" y1="112" x2="230" y2="118" stroke="#64748b"/>
<line x1="150" y1="192" x2="190" y2="192" stroke="#64748b"/><line x1="190" y1="192" x2="190" y2="235" stroke="#64748b"/>
<rect x="450" y="10" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="12">ISE policy nodes x2</text>
<line x1="360" y1="105" x2="450" y2="35" stroke="#64748b"/>
<rect x="450" y="90" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="116" text-anchor="middle" class="svg-ink" font-size="12">Corporate LAN, SGT</text>
<line x1="360" y1="120" x2="450" y2="112" stroke="#64748b"/>
<rect x="190" y="215" width="170" height="44" rx="8" fill="#fed7aa"/><text x="275" y="241" text-anchor="middle" class="svg-ink" font-size="12">DMZ anchor 9800</text>
<line x1="295" y1="150" x2="275" y2="215" stroke="#f59e0b" stroke-width="3"/>
<rect x="450" y="215" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="241" text-anchor="middle" class="svg-ink" font-size="12">Firewall, internet</text>
<line x1="360" y1="237" x2="450" y2="237" stroke="#64748b"/>
<text x="10" y="272" class="svg-muted" font-size="11">Orange = guest tunnel to the DMZ anchor. Guest never reaches the corporate LAN.</text>
</svg><p class="cap">Staff and devices are authorised by ISE; guest traffic is tunnelled to an anchor controller in the DMZ.</p></div>

<h3>Guest design</h3>
<p>For guest, use a <b>central web authentication (CWA)</b> portal on ISE, or a captive portal from Cisco Spaces. The guest WLAN on the internal controller is the <b>foreign</b> side; it tunnels clients to an <b>anchor</b> controller in the DMZ, where the guest VLAN ends behind a firewall. This keeps guest traffic off the internal network. The guest DHCP scope sits in the DMZ and the guest DNS must resolve the portal name before sign-in.</p>

<h3>DHCP and DNS design</h3>
<ul>
<li><b>Scope size:</b> plan for peak devices, not people. Pioneer expects 12,000 passengers x 1.5 devices = 18,000. A /24 gives only about 250 addresses, so use several guest scopes or a /19, and set a short <b>lease time</b> (one hour) so addresses return quickly.</li>
<li><b>Separate scopes</b> for AP management, staff, devices and guest.</li>
<li>Resilient DHCP servers (failover or split scope) and at least two DNS servers.</li>
<li>Controller DHCP behaviour: either relay (DHCP bridging) with a helper address on the gateway, or the controller acts as a proxy. Choose one design and keep it consistent.</li>
</ul>

<h3>Rogue management, location and assurance</h3>
<p>The security team finds shop APs using <b>rogue detection</b>: APs scan and report unknown APs, and the controller classifies them as friendly, malicious or unclassified. Dedicated <b>monitor-mode</b> APs improve coverage. Be careful with <b>rogue containment</b>, because affecting a neighbour's network can have legal consequences; usually you find, locate and remove the device physically. <b>Cisco Spaces</b> provides location services, passenger analytics and a captive portal; accuracy depends on AP density, with APs also placed at the edges, so plan for it during the survey. <b>Cisco Catalyst Center</b> gives wireless assurance: health scores, client 360 views, onboarding times, AP and radio problems, and issues with suggested actions, and it can use sensors for tests such as DHCP, DNS and RADIUS reachability.</p>

<div class="warn"><p><b>Common mistakes.</b> Guest portal DNS that cannot resolve before authentication. A /24 guest scope with a 8-day lease. One ISE node for everything. Containing a rogue that belongs to the shop next door.</p></div>
<div class="exam"><p><b>Exam trap.</b> The anchor controller sits in the DMZ and the foreign controller is the one the AP joins. Do not reverse them. Also, WPA3 on 6 GHz is mandatory, not optional.</p></div>

<div class="scn"><h4>Guests who could not sign in</h4><p>At Pioneer's soft launch, passengers connected to the guest SSID but the sign-in page never opened. The engineer used the assurance tool to look at onboarding: authentication was fine but DHCP took 40 seconds. The guest scope in the DMZ was a /24 with 8-day leases, so it was full of stale addresses. They changed to a larger scope with a one-hour lease and the page loaded in seconds.</p><p><b>Lesson:</b> size DHCP for devices and short leases for guest, and monitor onboarding steps, not just signal strength.</p></div>

<div class="iv"><p class="q">"How do you design secure guest access?"</p><p>Strong answer: separate guest WLAN with web authentication (CWA on ISE or a Spaces portal), tunnel to an anchor controller in the DMZ, guest VLAN behind a firewall with internet-only policy, guest DHCP and DNS in the DMZ with short leases, rate limiting, and logging. Mention OWE for encryption without a password.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WPA3-Enterprise with ISE for staff; MAB or iPSK for devices; OWE or portal for guest.</li>
<li>Use two ISE nodes, CoA, and return VLAN, ACL or SGT per role.</li>
<li>Guest: foreign controller tunnels to a DMZ anchor behind a firewall.</li>
<li>Size DHCP by devices and use short guest leases; DNS must work before sign-in.</li>
<li>Rogues are detected, classified and located; Spaces gives location; Catalyst Center gives assurance.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Airport security mein kai layers hoti hain: darwaze par check (aap kaun ho), ek lane jo tay karti hai aap kahan ja sakte ho (policy), visitors ke liye alag area (guest), aur sab kuch dekhne wale cameras (assurance). Wi-Fi security design bhi wahi layers use karta hai.</p>

<h3>Case: Pioneer Airport</h3>
<p>Pioneer Airport, ek fictional regional airport, busy din par 12,000 passengers serve karta hai. Use chahiye: branded sign-in page aur visitor analytics ke saath free passenger Wi-Fi; 900 airline aur ground staff ke liye alag access rights wala secure Wi-Fi; baggage scanners aur gate displays jo 802.1X nahi kar sakte; aur regulator ka rule ki guest traffic kabhi corporate network ko na chhue. Security team terminal mein dukaanon ke lagaye unauthorised APs bhi dhoondhna chahti hai.</p>

<h3>Authentication aur encryption ke choices</h3>
<table class="cmp"><tr><th>Use case</th><th>Choice</th><th>Wajah</th></tr>
<tr><td>Corporate staff</td><td>WPA3-Enterprise (ISE ke saath 802.1X), PMF on</td><td>Per-user identity aur keys, strong encryption</td></tr>
<tr><td>High-security staff</td><td>WPA3-Enterprise 192-bit mode</td><td>Regulated users ke liye stronger cryptography</td></tr>
<tr><td>802.1X ke bina devices</td><td>ISE profiling ke saath MAC Authentication Bypass (MAB), ya alag WLAN par iPSK / PSK</td><td>Devices ko flat network nahi, policy milti hai</td></tr>
<tr><td>Open guest</td><td>WPA3 OWE ya transition mode ke saath open, plus web portal</td><td>OWE bina password ke traffic encrypt karta hai</td></tr>
<tr><td>Home-style personal</td><td>WPA3-Personal (SAE)</td><td>Offline guessing ka resist karta hai, WPA2 PSK ki tarah nahi</td></tr>
</table>
<p>WPA3 transition mode tabhi use karo jab tak purane clients hain, aur use hatane ka plan banao. Ek SSID par mixed WPA2 aur WPA3 compatibility ka step hai, end state nahi.</p>

<h3>ISE ke saath AAA design</h3>
<p>Cisco Identity Services Engine (ISE) RADIUS aur policy server hai. Achhe design mein hota hai: kam se kam <b>do policy service nodes</b> (PSNs) aur controllers dono use karne ke liye configured; sahi timers taaki failed server jaldi detect ho; <b>change of authorization (CoA)</b> taaki ISE profiling ya posture ke baad client ki policy re-assign kar sake; aur results VLAN, ACL ya <b>security group tag (SGT)</b> ke roop mein. FlexConnect branches ke liye, un sites ke paas PSN ya local authentication ka plan rakho jinhe WAN failure survive karna hai.</p>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Pioneer Airport ka security design">
<rect x="10" y="10" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="36" text-anchor="middle" class="svg-ink" font-size="12">Staff 802.1X</text>
<rect x="10" y="90" width="140" height="44" rx="8" fill="#fde68a"/><text x="80" y="116" text-anchor="middle" class="svg-ink" font-size="12">Scanners MAB</text>
<rect x="10" y="170" width="140" height="44" rx="8" fill="#fed7aa"/><text x="80" y="196" text-anchor="middle" class="svg-ink" font-size="12">Passengers guest</text>
<rect x="230" y="90" width="130" height="60" rx="8" fill="#bae6fd"/><text x="295" y="116" text-anchor="middle" class="svg-ink" font-size="12">Internal</text><text x="295" y="134" text-anchor="middle" class="svg-ink" font-size="12">9800 controller</text>
<line x1="150" y1="32" x2="230" y2="105" stroke="#64748b"/><line x1="150" y1="112" x2="230" y2="118" stroke="#64748b"/>
<line x1="150" y1="192" x2="190" y2="192" stroke="#64748b"/><line x1="190" y1="192" x2="190" y2="235" stroke="#64748b"/>
<rect x="450" y="10" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="12">ISE policy nodes x2</text>
<line x1="360" y1="105" x2="450" y2="35" stroke="#64748b"/>
<rect x="450" y="90" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="116" text-anchor="middle" class="svg-ink" font-size="12">Corporate LAN, SGT</text>
<line x1="360" y1="120" x2="450" y2="112" stroke="#64748b"/>
<rect x="190" y="215" width="170" height="44" rx="8" fill="#fed7aa"/><text x="275" y="241" text-anchor="middle" class="svg-ink" font-size="12">DMZ anchor 9800</text>
<line x1="295" y1="150" x2="275" y2="215" stroke="#f59e0b" stroke-width="3"/>
<rect x="450" y="215" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="241" text-anchor="middle" class="svg-ink" font-size="12">Firewall, internet</text>
<line x1="360" y1="237" x2="450" y2="237" stroke="#64748b"/>
<text x="10" y="272" class="svg-muted" font-size="11">Orange = DMZ anchor tak guest tunnel. Guest corporate LAN tak nahi pahunchta.</text>
</svg><p class="cap">Staff aur devices ko ISE authorise karta hai; guest traffic DMZ ke anchor controller tak tunnel hota hai.</p></div>

<h3>Guest design</h3>
<p>Guest ke liye ISE par <b>central web authentication (CWA)</b> portal use karo, ya Cisco Spaces ka captive portal. Internal controller par guest WLAN <b>foreign</b> side hai; wo clients ko DMZ ke <b>anchor</b> controller tak tunnel karta hai, jahan guest VLAN firewall ke peeche khatam hoti hai. Isse guest traffic internal network se bahar rehta hai. Guest DHCP scope DMZ mein hota hai aur guest DNS ko sign-in se pehle portal name resolve karna chahiye.</p>

<h3>DHCP aur DNS design</h3>
<ul>
<li><b>Scope size:</b> people ke hisaab se nahi, peak devices ke hisaab se plan karo. Pioneer mein 12,000 passengers x 1.5 devices = 18,000. /24 mein sirf lagbhag 250 addresses hote hain, isliye kai guest scopes ya /19 use karo, aur chhoti <b>lease time</b> (ek ghanta) rakho taaki addresses jaldi wapas aayein.</li>
<li>AP management, staff, devices aur guest ke liye <b>alag scopes</b>.</li>
<li>Resilient DHCP servers (failover ya split scope) aur kam se kam do DNS servers.</li>
<li>Controller DHCP behaviour: ya to relay (DHCP bridging) gateway par helper address ke saath, ya controller proxy ki tarah kaam kare. Ek design chuno aur consistent raho.</li>
</ul>

<h3>Rogue management, location aur assurance</h3>
<p>Security team dukaan ke APs <b>rogue detection</b> se dhoondhti hai: APs scan karte hain aur unknown APs report karte hain, aur controller unhe friendly, malicious ya unclassified mein classify karta hai. Dedicated <b>monitor-mode</b> APs coverage behtar karte hain. <b>Rogue containment</b> mein savdhan raho, kyunki padosi ke network ko affect karne ke legal consequences ho sakte hain; aam taur par device ko dhoondho, locate karo aur physically hatao. <b>Cisco Spaces</b> location services, passenger analytics aur captive portal deta hai; accuracy AP density par depend karti hai, APs edges par bhi lagte hain, isliye survey ke dauraan iska plan banao. <b>Cisco Catalyst Center</b> wireless assurance deta hai: health scores, client 360 views, onboarding times, AP aur radio problems, aur suggested actions ke saath issues, aur wo DHCP, DNS aur RADIUS reachability jaise tests ke liye sensors use kar sakta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Guest portal DNS jo authentication se pehle resolve nahi kar paata. 8-din ki lease wala /24 guest scope. Sab kuch ke liye ek ISE node. Padosi dukaan ke rogue ko contain karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Anchor controller DMZ mein hota hai aur foreign controller wo hai jisse AP join karta hai. Ulta mat karo. Aur 6 GHz par WPA3 mandatory hai, optional nahi.</p></div>

<div class="scn"><h4>Guests jo sign in nahi kar paaye</h4><p>Pioneer ke soft launch par passengers guest SSID se connect hue par sign-in page kabhi nahi khula. Engineer ne assurance tool se onboarding dekhi: authentication theek tha par DHCP mein 40 seconds lag rahe the. DMZ ka guest scope 8-din ki leases wala /24 tha, isliye stale addresses se bhara tha. Unhone bade scope aur ek-ghante ki lease par switch kiya aur page seconds mein load hone laga.</p><p><b>Lesson:</b> DHCP ko devices ke hisaab se size karo aur guest ke liye chhoti leases rakho, aur sirf signal strength nahi, onboarding steps monitor karo.</p></div>

<div class="iv"><p class="q">"Secure guest access kaise design karte ho?"</p><p>Strong answer: web authentication (ISE par CWA ya Spaces portal) wali alag guest WLAN, DMZ ke anchor controller tak tunnel, internet-only policy ke saath firewall ke peeche guest VLAN, DMZ mein chhoti leases wale guest DHCP aur DNS, rate limiting aur logging. Bina password ke encryption ke liye OWE mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Staff ke liye ISE ke saath WPA3-Enterprise; devices ke liye MAB ya iPSK; guest ke liye OWE ya portal.</li>
<li>Do ISE nodes, CoA use karo, aur role ke hisaab se VLAN, ACL ya SGT return karo.</li>
<li>Guest: foreign controller firewall ke peeche DMZ anchor tak tunnel karta hai.</li>
<li>DHCP ko devices se size karo aur guest leases chhoti rakho; DNS sign-in se pehle kaam kare.</li>
<li>Rogues detect, classify aur locate hote hain; Spaces location deta hai; Catalyst Center assurance deta hai.</li>
</ul></div>
`}};export{e as default};