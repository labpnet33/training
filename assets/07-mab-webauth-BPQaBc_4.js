var e={id:`mab-webauth`,h:{en:`MAB and WebAuth: devices without a supplicant, and guests`,hi:`MAB aur WebAuth: bina supplicant wale devices, aur guests`},body:{en:`
<p>At the office gate, employees show their ID card. But the courier van has no ID card; the guard checks the number plate against a list of approved vehicles instead. And a visitor with no card and no car? They go to reception, type their details on a tablet and get a paper pass. Those are the three ways into a campus network: <b>802.1X</b> (the ID card), <b>MAB</b> (the number plate) and <b>WebAuth</b> (the visitor tablet).</p>

<h3>MAC Authentication Bypass (MAB)</h3>
<p>Printers, IP cameras, badge readers, medical devices and building sensors often have no 802.1X supplicant. <b>MAC Authentication Bypass</b> lets the switch authenticate them using the only identity they cannot avoid sending: their MAC address.</p>
<ol>
<li>The device sends any frame (typically a DHCP Discover). The port is not authorized, so the frame is dropped, but the switch <b>learns the source MAC</b>.</li>
<li>The switch sends a RADIUS Access-Request with <b>User-Name</b> and password set to the MAC (by default 12 lowercase hex digits, e.g. <code>00507a000030</code>), <b>Service-Type = Call-Check</b> (10) and Calling-Station-Id = the MAC. Call-Check is how ISE recognises a MAB request.</li>
<li>ISE looks the MAC up in its <b>endpoint database</b> (often an endpoint identity group such as "Printers", populated by profiling) and returns Access-Accept with the printer policy, or Access-Reject.</li>
</ol>
<p>No EAP runs, so there is nothing on the endpoint to configure. The price is security: a MAC address is trivially spoofed. Treat MAB as <b>identification, not strong authentication</b>. Give MAB devices least privilege (a printer VLAN or a dACL that permits only print traffic), and use ISE profiling to notice when "a printer" suddenly behaves like a Windows laptop.</p>

<h3>MAB in the lab</h3>
<p>PRN1 (MAC 0050.7a00.0030) has no supplicant. ISE has <code>aaa-server mab 0050.7a00.0030 vlan 30 sgt 30</code>. On SW1 the interface command is simply <code>mab</code>; the next chapter combines it with 802.1X.</p>
<pre class="out">SW1# show mab interface g0/2
MAB details for GigabitEthernet0/2
-------------------------------------
Mac-Auth-Bypass           = Enabled
MAB Client List
---------------
Client MAC                = 0050.7a00.0030
Session ID                = 0A0A63010000002B
MAB SM state              = TERMINATE
<span class="hl">Auth Status               = AUTHORIZED</span></pre>
<pre class="out">SW1# show authentication sessions
Interface                MAC Address    Method  Domain  Status Fg  Session ID
--------------------------------------------------------------------------------------------
Gi0/1                    0050.7966.0101 dot1x   DATA    Auth      0A0A63010000002A
<span class="hl">Gi0/2                    0050.7a00.0030 mab     DATA    Auth      0A0A63010000002B</span>
Gi0/3                    0050.7966.0c33 none    DATA    Auth      0A0A63010000002C</pre>
<p>GUEST1's MAC is unknown, so ISE rejects its MAB request ("unknown endpoint" in the log). The port is still Authorized, but by the switch's own <b>no-response</b> guest VLAN 50 rule, not by ISE. You will see how in chapter 8.</p>

<h3>WebAuth: authentication through a browser</h3>
<p><b>Web authentication</b> is for people who have a browser but no 802.1X profile: guests, contractors, or a fallback when 802.1X fails. There are two flavours.</p>
<table class="cmp"><tr><th></th><th>Local WebAuth (LWA)</th><th>Central WebAuth (CWA)</th></tr>
<tr><td>Who hosts the login page</td><td>The switch or WLC (or it redirects to an external page)</td><td>ISE (guest portal on a PSN)</td></tr>
<tr><td>First step</td><td>Switch intercepts web traffic itself</td><td>MAB; ISE returns a redirect</td></tr>
<tr><td>After login</td><td>Switch/WLC applies the result directly</td><td>ISE sends CoA; the session is re-authorized</td></tr>
<tr><td>Features</td><td>Basic; per-device configuration</td><td>Self-registration, sponsors, BYOD, posture, rich policy</td></tr>
</table>
<p>CWA is Cisco's recommended design. Its flow:</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Central WebAuth flow">
<rect x="10" y="20" width="190" height="44" rx="8" fill="#e2e8f0"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Guest plugs in</text><text x="105" y="56" text-anchor="middle" class="svg-muted" font-size="12">MAB: MAC unknown</text>
<rect x="225" y="20" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 ISE: Access-Accept</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">redirect URL + ACL</text>
<rect x="440" y="20" width="190" height="44" rx="8" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Browser opens a site</text><text x="535" y="56" text-anchor="middle" class="svg-muted" font-size="12">switch redirects to ISE</text>
<rect x="440" y="120" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="140" text-anchor="middle" class="svg-ink" font-size="12">4 Guest logs in</text><text x="535" y="156" text-anchor="middle" class="svg-muted" font-size="12">on the ISE portal</text>
<rect x="225" y="120" width="190" height="44" rx="8" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">5 ISE sends CoA</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">reauthenticate</text>
<rect x="10" y="120" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="140" text-anchor="middle" class="svg-ink" font-size="12">6 MAB again</text><text x="105" y="156" text-anchor="middle" class="svg-muted" font-size="12">now a known guest</text>
<rect x="10" y="195" width="620" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="12">7 Final result: guest access (internet only, guest SGT or VLAN)</text>
<line x1="200" y1="42" x2="225" y2="42" stroke="#64748b" stroke-width="2"/><line x1="415" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/><line x1="535" y1="64" x2="535" y2="120" stroke="#64748b" stroke-width="2"/><line x1="440" y1="142" x2="415" y2="142" stroke="#64748b" stroke-width="2"/><line x1="225" y1="142" x2="200" y2="142" stroke="#64748b" stroke-width="2"/><line x1="105" y1="164" x2="105" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Central WebAuth: MAB, redirect, portal login, CoA, MAB again with the new identity.</p></div>
<p>In step 2 ISE returns two Cisco attributes: <code>url-redirect</code> (the portal address, including the session ID) and <code>url-redirect-acl</code> (the <b>name</b> of an ACL that must already exist on the switch). In the redirect ACL, <b>permit means "redirect this"</b> and <b>deny means "do not redirect"</b>; it is not a security filter.</p>
<pre class="code"><span class="c">! switch side of Central WebAuth</span>
SW1(config)# ip access-list extended REDIRECT-ACL
SW1(config-ext-nacl)# deny udp any any eq domain        <span class="c">! let DNS through unredirected</span>
SW1(config-ext-nacl)# deny ip any host 10.99.99.10      <span class="c">! never redirect traffic to ISE itself</span>
SW1(config-ext-nacl)# permit tcp any any eq www         <span class="c">! redirect web traffic</span>
SW1(config-ext-nacl)# permit tcp any any eq 443
SW1(config)# ip h&#116;tp server                             <span class="c">! the switch intercepts web sessions</span>
SW1(config)# ip h&#116;tp secure-server
SW1(config)# aaa server radius dynamic-author           <span class="c">! accept CoA from ISE (chapter 9)</span>
SW1(config-locsvr-da-radius)# client 10.99.99.10 server-key NKsecret</pre>

<div class="eg"><p><b>Worked example.</b> A hotel conference floor has 120 ports. The team configures 802.1X with MAB fallback on every port. Staff laptops pass 802.1X in about 2 s. A delegate's laptop sends no EAPOL; after 15 s (tx-period 5) MAB runs, ISE does not know the MAC and returns the CWA redirect. The delegate opens a browser, lands on the self-registration portal, accepts the terms, and 3 s later a CoA moves the session to "internet only" for 24 hours. On the next day the MAC is already a registered guest, so MAB succeeds without the portal until the account expires.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting to deny DNS and ISE in the redirect ACL. The guest's browser then cannot resolve names, or the switch redirects the request to the portal back to itself in a loop, and the portal never loads.</p></div>

<div class="exam"><p><b>Exam trap.</b> MAB uses Service-Type <b>Call-Check</b> and the MAC as user name; no EAP is involved. CWA starts with <b>MAB</b>, not with 802.1X, and depends on <b>CoA</b>; LWA does not need CoA because the switch itself hosts the login.</p></div>

<div class="scn"><h4>The printer that impersonated a laptop</h4><p>ISE profiling raised an alert: endpoint 0050.7a00.0030, profiled for months as a printer, was now sending a Windows DHCP fingerprint and a browser user agent. Someone had copied the printer's MAC to a laptop to bypass 802.1X in a meeting room. Because the printer policy was a dACL permitting only IPP and LPD to the print servers, the laptop could reach nothing else. The SOC used ANC to quarantine the port and found the device the same afternoon.</p><p><b>Lesson:</b> MAB can be spoofed. Least-privilege authorization and profiling limit the damage.</p></div>

<div class="iv"><p class="q">"How does Central WebAuth work, and why is it preferred over Local WebAuth?"</p><p>Strong answer: the endpoint first goes through MAB; the MAC is unknown, and ISE (with "continue if user not found") returns Access-Accept with url-redirect and url-redirect-acl. The switch redirects web traffic matching the ACL to the ISE portal. After the guest logs in, ISE marks the endpoint as a guest and sends a CoA reauthenticate; MAB runs again and matches the guest rule. It is preferred because the portal, guest accounts, sponsors and policy live centrally in ISE, and posture and BYOD can be added; LWA is configured per device with limited features.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAB: MAC as user name and password, Service-Type Call-Check, no EAP, nothing on the endpoint.</li>
<li>MAB is spoofable: authorize with least privilege and use profiling.</li>
<li>LWA: switch or WLC hosts the login; CWA: ISE hosts the portal after MAB, finishes with CoA.</li>
<li>Redirect ACL: permit = redirect, deny = do not redirect; always exclude DNS and ISE.</li>
<li>CWA needs the switch web server, the redirect ACL and dynamic-author (CoA).</li>
</ul></div>
`,hi:`
<p>Office gate par employees apna ID card dikhate hain. Lekin courier van ke paas ID card nahi hota; guard uski jagah number plate ko approved vehicles ki list se check karta hai. Aur bina card aur bina gaadi wala visitor? Woh reception jaata hai, tablet par apni details type karta hai aur paper pass leta hai. Campus network mein aane ke yahi teen raaste hain: <b>802.1X</b> (ID card), <b>MAB</b> (number plate) aur <b>WebAuth</b> (visitor tablet).</p>

<h3>MAC Authentication Bypass (MAB)</h3>
<p>Printers, IP cameras, badge readers, medical devices aur building sensors mein aksar 802.1X supplicant nahi hota. <b>MAC Authentication Bypass</b> switch ko unhe us ek identity se authenticate karne deta hai jo woh bhejne se bach nahi sakte: unka MAC address.</p>
<ol>
<li>Device koi bhi frame bhejta hai (aam taur par DHCP Discover). Port authorized nahi hai, isliye frame drop hota hai, lekin switch <b>source MAC seekh leta hai</b>.</li>
<li>Switch RADIUS Access-Request bhejta hai jismein <b>User-Name</b> aur password MAC par set hote hain (default 12 lowercase hex digits, jaise <code>00507a000030</code>), <b>Service-Type = Call-Check</b> (10) aur Calling-Station-Id = MAC. Call-Check se hi ISE MAB request pehchanta hai.</li>
<li>ISE MAC ko apne <b>endpoint database</b> mein dhoondhta hai (aksar "Printers" jaisa endpoint identity group, jo profiling se bharta hai) aur printer policy ke saath Access-Accept, ya Access-Reject return karta hai.</li>
</ol>
<p>Koi EAP nahi chalta, isliye endpoint par configure karne ko kuch nahi hai. Keemat security hai: MAC address spoof karna bahut aasaan hai. MAB ko <b>identification maano, strong authentication nahi</b>. MAB devices ko least privilege do (printer VLAN ya dACL jo sirf print traffic permit kare), aur ISE profiling use karo taaki pata chale jab "printer" achanak Windows laptop jaisa behave kare.</p>

<h3>Lab mein MAB</h3>
<p>PRN1 (MAC 0050.7a00.0030) ke paas supplicant nahi hai. ISE par <code>aaa-server mab 0050.7a00.0030 vlan 30 sgt 30</code> hai. SW1 par interface command bas <code>mab</code> hai; agla chapter ise 802.1X ke saath combine karta hai.</p>
<pre class="out">SW1# show mab interface g0/2
MAB details for GigabitEthernet0/2
-------------------------------------
Mac-Auth-Bypass           = Enabled
MAB Client List
---------------
Client MAC                = 0050.7a00.0030
Session ID                = 0A0A63010000002B
MAB SM state              = TERMINATE
<span class="hl">Auth Status               = AUTHORIZED</span></pre>
<pre class="out">SW1# show authentication sessions
Interface                MAC Address    Method  Domain  Status Fg  Session ID
--------------------------------------------------------------------------------------------
Gi0/1                    0050.7966.0101 dot1x   DATA    Auth      0A0A63010000002A
<span class="hl">Gi0/2                    0050.7a00.0030 mab     DATA    Auth      0A0A63010000002B</span>
Gi0/3                    0050.7966.0c33 none    DATA    Auth      0A0A63010000002C</pre>
<p>GUEST1 ka MAC unknown hai, isliye ISE uski MAB request reject karta hai (log mein "unknown endpoint"). Port phir bhi Authorized hai, lekin switch ke apne <b>no-response</b> guest VLAN 50 rule se, ISE se nahi. Kaise, yeh aap chapter 8 mein dekhoge.</p>

<h3>WebAuth: browser ke through authentication</h3>
<p><b>Web authentication</b> un logon ke liye hai jinke paas browser hai lekin 802.1X profile nahi: guests, contractors, ya 802.1X fail hone par fallback. Iske do flavours hain.</p>
<table class="cmp"><tr><th></th><th>Local WebAuth (LWA)</th><th>Central WebAuth (CWA)</th></tr>
<tr><td>Login page kaun host karta hai</td><td>Switch ya WLC (ya external page par redirect karta hai)</td><td>ISE (PSN par guest portal)</td></tr>
<tr><td>Pehla step</td><td>Switch khud web traffic intercept karta hai</td><td>MAB; ISE redirect return karta hai</td></tr>
<tr><td>Login ke baad</td><td>Switch/WLC result seedha apply karta hai</td><td>ISE CoA bhejta hai; session re-authorize hota hai</td></tr>
<tr><td>Features</td><td>Basic; per-device configuration</td><td>Self-registration, sponsors, BYOD, posture, rich policy</td></tr>
</table>
<p>CWA Cisco ka recommended design hai. Iska flow:</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Central WebAuth flow">
<rect x="10" y="20" width="190" height="44" rx="8" fill="#e2e8f0"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Guest plug in karta hai</text><text x="105" y="56" text-anchor="middle" class="svg-muted" font-size="12">MAB: MAC unknown</text>
<rect x="225" y="20" width="190" height="44" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 ISE: Access-Accept</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">redirect URL + ACL</text>
<rect x="440" y="20" width="190" height="44" rx="8" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Browser site kholta hai</text><text x="535" y="56" text-anchor="middle" class="svg-muted" font-size="12">switch ISE par bhejta hai</text>
<rect x="440" y="120" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="140" text-anchor="middle" class="svg-ink" font-size="12">4 Guest login karta hai</text><text x="535" y="156" text-anchor="middle" class="svg-muted" font-size="12">ISE portal par</text>
<rect x="225" y="120" width="190" height="44" rx="8" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">5 ISE CoA bhejta hai</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">reauthenticate</text>
<rect x="10" y="120" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="140" text-anchor="middle" class="svg-ink" font-size="12">6 Phir se MAB</text><text x="105" y="156" text-anchor="middle" class="svg-muted" font-size="12">ab known guest</text>
<rect x="10" y="195" width="620" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="12">7 Final result: guest access (sirf internet, guest SGT ya VLAN)</text>
<line x1="200" y1="42" x2="225" y2="42" stroke="#64748b" stroke-width="2"/><line x1="415" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/><line x1="535" y1="64" x2="535" y2="120" stroke="#64748b" stroke-width="2"/><line x1="440" y1="142" x2="415" y2="142" stroke="#64748b" stroke-width="2"/><line x1="225" y1="142" x2="200" y2="142" stroke="#64748b" stroke-width="2"/><line x1="105" y1="164" x2="105" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Central WebAuth: MAB, redirect, portal login, CoA, nayi identity ke saath phir MAB.</p></div>
<p>Step 2 mein ISE do Cisco attributes return karta hai: <code>url-redirect</code> (portal ka address, session ID ke saath) aur <code>url-redirect-acl</code> (ek ACL ka <b>naam</b> jo switch par pehle se hona chahiye). Redirect ACL mein <b>permit ka matlab "ise redirect karo"</b> aur <b>deny ka matlab "redirect mat karo"</b>; yeh security filter nahi hai.</p>
<pre class="code"><span class="c">! Central WebAuth ka switch side</span>
SW1(config)# ip access-list extended REDIRECT-ACL
SW1(config-ext-nacl)# deny udp any any eq domain        <span class="c">! DNS ko bina redirect jaane do</span>
SW1(config-ext-nacl)# deny ip any host 10.99.99.10      <span class="c">! ISE ki taraf traffic kabhi redirect mat karo</span>
SW1(config-ext-nacl)# permit tcp any any eq www         <span class="c">! web traffic redirect karo</span>
SW1(config-ext-nacl)# permit tcp any any eq 443
SW1(config)# ip h&#116;tp server                             <span class="c">! switch web sessions intercept karta hai</span>
SW1(config)# ip h&#116;tp secure-server
SW1(config)# aaa server radius dynamic-author           <span class="c">! ISE se CoA accept karo (chapter 9)</span>
SW1(config-locsvr-da-radius)# client 10.99.99.10 server-key NKsecret</pre>

<div class="eg"><p><b>Worked example.</b> Ek hotel ke conference floor par 120 ports hain. Team har port par MAB fallback ke saath 802.1X configure karti hai. Staff laptops lagbhag 2 s mein 802.1X pass karte hain. Ek delegate ka laptop koi EAPOL nahi bhejta; 15 s (tx-period 5) baad MAB chalta hai, ISE ko MAC pata nahi hai aur woh CWA redirect return karta hai. Delegate browser kholta hai, self-registration portal par aata hai, terms accept karta hai, aur 3 s baad CoA session ko 24 ghante ke liye "sirf internet" par le jaata hai. Agle din MAC pehle se registered guest hai, isliye account expire hone tak MAB bina portal ke succeed hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Redirect ACL mein DNS aur ISE ko deny karna bhool jaana. Tab guest ka browser names resolve nahi kar pata, ya switch portal ki request ko loop mein wapas khud par redirect karta hai, aur portal kabhi load nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> MAB Service-Type <b>Call-Check</b> aur user name ki tarah MAC use karta hai; koi EAP involved nahi hai. CWA <b>MAB</b> se shuru hota hai, 802.1X se nahi, aur <b>CoA</b> par depend karta hai; LWA ko CoA nahi chahiye kyunki login switch khud host karta hai.</p></div>

<div class="scn"><h4>Printer jisne laptop ka roop liya</h4><p>ISE profiling ne alert diya: endpoint 0050.7a00.0030, jo mahino se printer ki tarah profile tha, ab Windows DHCP fingerprint aur browser user agent bhej raha tha. Kisi ne meeting room mein 802.1X bypass karne ke liye printer ka MAC laptop par copy kar diya tha. Kyunki printer policy ek dACL thi jo sirf print servers tak IPP aur LPD permit karti thi, laptop kahin aur nahi pahunch saka. SOC ne ANC se port quarantine kiya aur usi dopahar device dhoondh liya.</p><p><b>Seekh:</b> MAB spoof ho sakta hai. Least-privilege authorization aur profiling nuksaan ko limit karte hain.</p></div>

<div class="iv"><p class="q">"Central WebAuth kaise kaam karta hai, aur ise Local WebAuth se zyada kyun prefer kiya jaata hai?"</p><p>Strong answer: endpoint pehle MAB se guzarta hai; MAC unknown hai, aur ISE ("continue if user not found" ke saath) url-redirect aur url-redirect-acl ke saath Access-Accept return karta hai. Switch ACL se match hone wale web traffic ko ISE portal par redirect karta hai. Guest ke login karne ke baad ISE endpoint ko guest mark karta hai aur CoA reauthenticate bhejta hai; MAB phir chalta hai aur guest rule se match hota hai. Ise isliye prefer kiya jaata hai kyunki portal, guest accounts, sponsors aur policy centrally ISE mein rehte hain, aur posture aur BYOD joda ja sakta hai; LWA per device configure hota hai aur features limited hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAB: MAC user name aur password ki tarah, Service-Type Call-Check, koi EAP nahi, endpoint par kuch nahi.</li>
<li>MAB spoof ho sakta hai: least privilege se authorize karo aur profiling use karo.</li>
<li>LWA: switch ya WLC login host karta hai; CWA: MAB ke baad ISE portal host karta hai, CoA se khatam hota hai.</li>
<li>Redirect ACL: permit = redirect, deny = redirect nahi; DNS aur ISE ko hamesha exclude karo.</li>
<li>CWA ko switch web server, redirect ACL aur dynamic-author (CoA) chahiye.</li>
</ul></div>
`}};export{e as default};