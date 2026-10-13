var e={id:`ap-join`,h:{en:`AP discovery and join: the CAPWAP state machine and WLC selection`,hi:`AP discovery aur join: CAPWAP state machine aur WLC selection`},body:{en:`
<p>In the CCNA lab you added DHCP option 43 and watched AP1 and AP2 join WLC1. At CCNP level you must describe every step between power-on and RUN, list the discovery methods in the order the AP uses them, and explain how the AP chooses one controller when several answer.</p>

<h3>An analogy: a new employee's first day</h3>
<p>A new hire arrives at the gate (power on), gets a visitor badge with an address (DHCP), asks "which manager do I report to?" in several ways: a note in their pocket from a previous job (primed controller), the receptionist's directory (option 43, DNS) or shouting in the lobby (broadcast). Several managers reply. The employee picks the one named in the note first, otherwise the senior manager, otherwise the least busy one. They then show ID (DTLS certificates), sign the contract (join), receive the latest handbook if theirs is old (image download), get their desk and tasks (configuration) and start work (RUN). Every 30 seconds they check in (echo).</p>

<h3>The states, in order</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CAPWAP state machine">
<rect x="5" y="20" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="45" y="45" text-anchor="middle" class="svg-ink" font-size="12">DHCP / IP</text>
<rect x="95" y="20" width="85" height="40" rx="8" fill="#bae6fd"/><text x="137" y="45" text-anchor="middle" class="svg-ink" font-size="12">Discovery</text>
<rect x="190" y="20" width="85" height="40" rx="8" fill="#ddd6fe"/><text x="232" y="45" text-anchor="middle" class="svg-ink" font-size="12">DTLS setup</text>
<rect x="285" y="20" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Join</text>
<rect x="365" y="20" width="85" height="40" rx="8" fill="#fde68a"/><text x="407" y="45" text-anchor="middle" class="svg-ink" font-size="12">Image data</text>
<rect x="460" y="20" width="85" height="40" rx="8" fill="#fed7aa"/><text x="502" y="45" text-anchor="middle" class="svg-ink" font-size="12">Configure</text>
<rect x="555" y="20" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="45" text-anchor="middle" class="svg-ink" font-size="12">RUN</text>
<line x1="85" y1="40" x2="95" y2="40" stroke="#64748b"/><line x1="180" y1="40" x2="190" y2="40" stroke="#64748b"/><line x1="275" y1="40" x2="285" y2="40" stroke="#64748b"/><line x1="355" y1="40" x2="365" y2="40" stroke="#64748b"/><line x1="450" y1="40" x2="460" y2="40" stroke="#64748b"/><line x1="545" y1="40" x2="555" y2="40" stroke="#64748b"/>
<text x="407" y="85" text-anchor="middle" class="svg-muted" font-size="12">only if versions differ (then reboot and rejoin)</text>
<text x="595" y="85" text-anchor="middle" class="svg-muted" font-size="12">echo every 30 s</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">lost echoes → back to Discovery (next controller in the list)</text>
</svg><p class="cap">The CAPWAP join sequence (RFC 5415 states, simplified).</p></div>
<ol>
<li><b>Get an IP address.</b> DHCP (normal) or a static address set on the AP.</li>
<li><b>Discovery.</b> The AP builds a list of controller addresses and sends <b>CAPWAP Discovery Requests</b> (UDP 5246). Controllers answer with <b>Discovery Responses</b> that include their name, load (APs joined versus maximum) and flags.</li>
<li><b>WLC selection.</b> The AP picks one controller from the responses (rules below).</li>
<li><b>DTLS setup.</b> AP and controller authenticate each other with certificates (the AP's manufacturer-installed certificate) and build an encrypted DTLS session for the control channel.</li>
<li><b>Join.</b> Join Request and Join Response. A non-zero result code means refusal: licence limit, country mismatch, or an AP authorisation list that does not include this AP.</li>
<li><b>Image data.</b> If the AP's software differs from the controller's, it downloads the matching image, reboots and joins again. This can take minutes and is normal after an upgrade.</li>
<li><b>Configure.</b> Configuration Status Request/Response: the controller pushes WLANs, radio channel and power, mode and timers.</li>
<li><b>RUN.</b> Radios come up, the AP starts beaconing. Echo requests every 30 seconds keep the session alive; data keepalives flow on UDP 5247.</li></ol>

<h3>Discovery methods</h3>
<ul>
<li><b>Primed / stored controllers</b>: primary, secondary and tertiary controller names and addresses configured on the controller for that AP and saved in the AP's memory, plus controllers it remembers from previous joins. A static controller address typed on the AP console also counts.</li>
<li><b>Layer 2 / subnet broadcast</b>: a Discovery Request to 255.255.255.255. Works only when the controller's management interface is in the AP's subnet, or when a router forwards UDP 5246 with <code>ip helper-address</code> plus <code>ip forward-protocol udp 5246</code>.</li>
<li><b>DHCP option 43</b>: the DHCP server hands the controller address list to the AP (type 0xf1, length = 4 × number of controllers, then the addresses in hex). For IPv6, DHCPv6 option 52.</li>
<li><b>DNS</b>: the AP resolves <code>CISCO-CAPWAP-CONTROLLER.&lt;local domain&gt;</code> (the domain comes from DHCP).</li>
<li><b>Plug and Play</b>: Catalyst Center (formerly DNA Center) can claim the AP and point it to a controller.</li></ul>
<pre class="code"><span class="c">! Option 43 for two controllers 10.10.99.10 and 10.10.99.11</span>
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f108.0a0a.630a.0a0a.630b   <span class="c">! f1 = type, 08 = two addresses</span></pre>

<h3>How the AP chooses a controller</h3>
<ol><li>The configured <b>primary</b> controller, then <b>secondary</b>, then <b>tertiary</b> (these names win over everything else, so this is how you pin an AP).</li>
<li>If none is configured or none answered: on AireOS, a controller flagged as <b>master controller</b> (a temporary aid for initial deployments; the Catalyst 9800 has no such flag, but the exam still lists it in the selection order).</li>
<li>Otherwise the controller with the <b>most available capacity</b> (least loaded relative to its maximum).</li></ol>
<p>High-availability SSO pairs appear as one controller, so APs do not rejoin when the active unit fails over. Without SSO, set primary and secondary so APs fail over to a known controller; <b>AP fallback</b> brings them back to the primary when it recovers.</p>

<pre class="out">AP2&gt; show capwap
AP IP address            : 10.10.10.12/24 (DHCP)
DHCP option 43           : 10.10.99.10
CAPWAP state             : <span class="hl">RUN (joined)</span>
Controller               : WLC1 (10.10.99.10)
Discovered by            : <span class="hl">DHCP option 43</span>
Control / data ports     : UDP 5246 / UDP 5247 (control protected by DTLS)</pre>

<div class="eg"><p><b>Worked example.</b> An AP boots in a new subnet 10.20.30.0/24. The router has no helper for UDP 5246 and the DHCP pool has no option 43, but the domain is corp.example and DNS has <code>CISCO-CAPWAP-CONTROLLER.corp.example</code> pointing to two controllers. Both answer. WLC-A has 900 of 1000 APs, WLC-B 200 of 1000. No primary is configured, so the AP joins WLC-B (more available capacity). The administrator then sets WLC-A as primary for the AP; after its next rediscovery it moves.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Option 43 with the wrong length byte (04 for one controller, 08 for two). (2) A firewall between AP and controller blocking UDP 5246/5247. (3) Wrong time on the controller, so the AP's certificate looks "not yet valid" and DTLS fails. (4) Country code on the controller not matching the AP's regulatory domain: depending on platform and release the join fails or the AP joins with its radios off (the lab does the second).</p></div>

<div class="exam"><p><b>Exam traps.</b> Selection order: primary, secondary, tertiary, then master controller, then least loaded. Discovery methods include broadcast, option 43, DNS (CISCO-CAPWAP-CONTROLLER) and stored/primed addresses. Image download happens only when versions differ. CAPWAP control is DTLS-encrypted; data encryption is optional.</p></div>

<div class="scn"><h4>Forty APs rebooting in a loop</h4><p>After a controller upgrade, 40 APs at one floor showed "Downloading image" again and again. The WAN to that floor's closet was fine, but an MTU issue on a new VPN hop fragmented the large image transfer packets and some were dropped, so every download failed and the AP restarted. Pre-downloading the image to the APs before the maintenance window and fixing the path MTU solved it.</p><p><b>Lesson:</b> Image data is a real state in the join process. If APs cycle through it, look at the path between AP and controller.</p></div>

<div class="iv"><p class="q">"An AP is not joining the controller. How do you troubleshoot?"</p><p>Strong answer: follow the state machine. Does the AP have an IP address and gateway? Can it reach the controller's management address (UDP 5246/5247 open)? How does it discover the controller (option 43 value and length, DNS name, broadcast/helper, primed)? Does the controller answer, and is it refusing the join (licence, country code, authorisation list, certificate or time)? Is it stuck downloading an image? Then check the controller's AP join statistics in the GUI for the reason code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join sequence: IP, Discovery, DTLS setup, Join, Image data (if needed), Configure, RUN.</li>
<li>Discovery: primed/stored, broadcast (or helper for UDP 5246), DHCP option 43, DNS CISCO-CAPWAP-CONTROLLER, PnP.</li>
<li>Selection: primary, secondary, tertiary, master controller, then most available capacity.</li>
<li>Echo every 30 s; lost echoes send the AP back to discovery.</li>
<li>Join failures: reachability, discovery, certificates/time, country, licence, image transfer.</li>
</ul></div>
`,hi:`
<p>CCNA lab mein aapne DHCP option 43 joda aur AP1 aur AP2 ko WLC1 join karte dekha. CCNP level par aapko power-on se RUN tak har step batana hai, discovery methods ko us order mein list karna hai jismein AP unhe use karta hai, aur samjhana hai ki kai controllers jawab dein to AP ek kaise chunta hai.</p>

<h3>Ek analogy: naye employee ka pehla din</h3>
<p>Naya employee gate par aata hai (power on), address wala visitor badge milta hai (DHCP), aur kai tareekon se poochta hai "main kis manager ko report karun?": pichli job ki jeb mein rakhi parchi (primed controller), receptionist ki directory (option 43, DNS) ya lobby mein chillakar (broadcast). Kai managers jawab dete hain. Employee pehle parchi wala chunta hai, warna senior manager, warna sabse kam busy wala. Phir ID dikhata hai (DTLS certificates), contract sign karta hai (join), apni handbook purani ho to nayi leta hai (image download), desk aur kaam milta hai (configuration) aur kaam shuru (RUN). Har 30 seconds woh check-in karta hai (echo).</p>

<h3>States, order mein</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CAPWAP state machine">
<rect x="5" y="20" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="45" y="45" text-anchor="middle" class="svg-ink" font-size="12">DHCP / IP</text>
<rect x="95" y="20" width="85" height="40" rx="8" fill="#bae6fd"/><text x="137" y="45" text-anchor="middle" class="svg-ink" font-size="12">Discovery</text>
<rect x="190" y="20" width="85" height="40" rx="8" fill="#ddd6fe"/><text x="232" y="45" text-anchor="middle" class="svg-ink" font-size="12">DTLS setup</text>
<rect x="285" y="20" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Join</text>
<rect x="365" y="20" width="85" height="40" rx="8" fill="#fde68a"/><text x="407" y="45" text-anchor="middle" class="svg-ink" font-size="12">Image data</text>
<rect x="460" y="20" width="85" height="40" rx="8" fill="#fed7aa"/><text x="502" y="45" text-anchor="middle" class="svg-ink" font-size="12">Configure</text>
<rect x="555" y="20" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="45" text-anchor="middle" class="svg-ink" font-size="12">RUN</text>
<line x1="85" y1="40" x2="95" y2="40" stroke="#64748b"/><line x1="180" y1="40" x2="190" y2="40" stroke="#64748b"/><line x1="275" y1="40" x2="285" y2="40" stroke="#64748b"/><line x1="355" y1="40" x2="365" y2="40" stroke="#64748b"/><line x1="450" y1="40" x2="460" y2="40" stroke="#64748b"/><line x1="545" y1="40" x2="555" y2="40" stroke="#64748b"/>
<text x="407" y="85" text-anchor="middle" class="svg-muted" font-size="12">sirf versions alag hon to (phir reboot aur rejoin)</text>
<text x="595" y="85" text-anchor="middle" class="svg-muted" font-size="12">har 30 s echo</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">echoes gum → wapas Discovery (list ka agla controller)</text>
</svg><p class="cap">CAPWAP join sequence (RFC 5415 states, simplified).</p></div>
<ol>
<li><b>IP address lo.</b> DHCP (normal) ya AP par set kiya static address.</li>
<li><b>Discovery.</b> AP controller addresses ki list banata hai aur <b>CAPWAP Discovery Requests</b> (UDP 5246) bhejta hai. Controllers <b>Discovery Responses</b> se jawab dete hain jinmein unka naam, load (joined APs vs maximum) aur flags hote hain.</li>
<li><b>WLC selection.</b> AP responses mein se ek controller chunta hai (rules neeche).</li>
<li><b>DTLS setup.</b> AP aur controller certificates se ek doosre ko authenticate karte hain (AP ka manufacturer-installed certificate) aur control channel ke liye encrypted DTLS session banate hain.</li>
<li><b>Join.</b> Join Request aur Join Response. Non-zero result code matlab mana: licence limit, country mismatch, ya AP authorisation list mein yeh AP nahi.</li>
<li><b>Image data.</b> Agar AP ka software controller se alag hai, woh matching image download karta hai, reboot hota hai aur dobara join karta hai. Isme minutes lag sakte hain aur upgrade ke baad normal hai.</li>
<li><b>Configure.</b> Configuration Status Request/Response: controller WLANs, radio channel aur power, mode aur timers push karta hai.</li>
<li><b>RUN.</b> Radios up hote hain, AP beacon karna shuru karta hai. Har 30 seconds echo requests session zinda rakhte hain; data keepalives UDP 5247 par chalte hain.</li></ol>

<h3>Discovery methods</h3>
<ul>
<li><b>Primed / stored controllers</b>: us AP ke liye controller par configured primary, secondary aur tertiary controller names aur addresses jo AP ki memory mein save hote hain, plus pichle joins se yaad controllers. AP console par type kiya static controller address bhi isi mein aata hai.</li>
<li><b>Layer 2 / subnet broadcast</b>: 255.255.255.255 par Discovery Request. Sirf tab chalta hai jab controller ka management interface AP ke subnet mein ho, ya router <code>ip helper-address</code> plus <code>ip forward-protocol udp 5246</code> se UDP 5246 forward kare.</li>
<li><b>DHCP option 43</b>: DHCP server AP ko controller address list deta hai (type 0xf1, length = 4 × controllers ki sankhya, phir hex mein addresses). IPv6 ke liye DHCPv6 option 52.</li>
<li><b>DNS</b>: AP <code>CISCO-CAPWAP-CONTROLLER.&lt;local domain&gt;</code> resolve karta hai (domain DHCP se aata hai).</li>
<li><b>Plug and Play</b>: Catalyst Center (pehle DNA Center) AP ko claim karke controller ki taraf point kar sakta hai.</li></ul>
<pre class="code"><span class="c">! Do controllers 10.10.99.10 aur 10.10.99.11 ke liye option 43</span>
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f108.0a0a.630a.0a0a.630b   <span class="c">! f1 = type, 08 = do addresses</span></pre>

<h3>AP controller kaise chunta hai</h3>
<ol><li>Configured <b>primary</b> controller, phir <b>secondary</b>, phir <b>tertiary</b> (yeh naam baaki sab par jeet-te hain, isi se AP ko pin karte ho).</li>
<li>Agar koi configured nahi ya kisi ne jawab nahi diya: AireOS par <b>master controller</b> flag wala controller (initial deployment ke liye temporary madad; Catalyst 9800 mein aisa flag nahi hota, par exam selection order mein ise abhi bhi list karta hai).</li>
<li>Warna <b>sabse zyada available capacity</b> wala controller (apne maximum ke relative sabse kam loaded).</li></ol>
<p>High-availability SSO pairs ek controller jaise dikhte hain, isliye active unit fail over hone par APs rejoin nahi karte. SSO ke bina primary aur secondary set karo taaki APs ek jaane-maane controller par fail over karein; <b>AP fallback</b> primary theek hone par unhe wapas laata hai.</p>

<pre class="out">AP2&gt; show capwap
AP IP address            : 10.10.10.12/24 (DHCP)
DHCP option 43           : 10.10.99.10
CAPWAP state             : <span class="hl">RUN (joined)</span>
Controller               : WLC1 (10.10.99.10)
Discovered by            : <span class="hl">DHCP option 43</span>
Control / data ports     : UDP 5246 / UDP 5247 (control protected by DTLS)</pre>

<div class="eg"><p><b>Worked example.</b> Ek AP naye subnet 10.20.30.0/24 mein boot hota hai. Router par UDP 5246 ka helper nahi aur DHCP pool mein option 43 nahi, lekin domain corp.example hai aur DNS mein <code>CISCO-CAPWAP-CONTROLLER.corp.example</code> do controllers ki taraf point karta hai. Dono jawab dete hain. WLC-A par 1000 mein se 900 APs hain, WLC-B par 1000 mein se 200. Koi primary configured nahi, to AP WLC-B join karta hai (zyada available capacity). Phir administrator AP ke liye WLC-A ko primary set karta hai; agli rediscovery ke baad AP shift ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Option 43 mein galat length byte (ek controller ke liye 04, do ke liye 08). (2) AP aur controller ke beech firewall jo UDP 5246/5247 block kare. (3) Controller par galat time, jisse AP ka certificate "abhi valid nahi" lagta hai aur DTLS fail hota hai. (4) Controller ka country code AP ke regulatory domain se match na kare, to platform aur release ke hisaab se join fail hota hai ya AP radios off ke saath join karta hai (lab doosra karti hai).</p></div>

<div class="exam"><p><b>Exam traps.</b> Selection order: primary, secondary, tertiary, phir master controller, phir least loaded. Discovery methods mein broadcast, option 43, DNS (CISCO-CAPWAP-CONTROLLER) aur stored/primed addresses aate hain. Image download sirf versions alag hon tab hota hai. CAPWAP control DTLS-encrypted hai; data encryption optional hai.</p></div>

<div class="scn"><h4>Loop mein reboot hote chaalees APs</h4><p>Controller upgrade ke baad ek floor ke 40 APs baar baar "Downloading image" dikhate rahe. Us floor ke closet tak WAN theek tha, par ek naye VPN hop par MTU issue bade image transfer packets ko fragment kar raha tha aur kuch drop ho rahe the, to har download fail hota aur AP restart ho jaata. Maintenance window se pehle APs par image pre-download karne aur path MTU theek karne se issue solve hua.</p><p><b>Lesson:</b> Image data join process ki ek asli state hai. Agar APs isme ghoomte rahein, to AP aur controller ke beech ka path dekho.</p></div>

<div class="iv"><p class="q">"Ek AP controller join nahi kar raha. Kaise troubleshoot karoge?"</p><p>Strong answer: state machine follow karo. Kya AP ke paas IP address aur gateway hai? Kya woh controller ke management address tak pahunch sakta hai (UDP 5246/5247 khule)? Woh controller kaise discover karta hai (option 43 value aur length, DNS naam, broadcast/helper, primed)? Kya controller jawab deta hai, aur kya join mana kar raha hai (licence, country code, authorisation list, certificate ya time)? Kya image download mein atka hai? Phir reason code ke liye GUI mein controller ke AP join statistics dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join sequence: IP, Discovery, DTLS setup, Join, Image data (zaroorat ho to), Configure, RUN.</li>
<li>Discovery: primed/stored, broadcast (ya UDP 5246 ke liye helper), DHCP option 43, DNS CISCO-CAPWAP-CONTROLLER, PnP.</li>
<li>Selection: primary, secondary, tertiary, master controller, phir sabse zyada available capacity.</li>
<li>Har 30 s echo; echoes gum hon to AP wapas discovery mein jaata hai.</li>
<li>Join failures: reachability, discovery, certificates/time, country, licence, image transfer.</li>
</ul></div>
`}};export{e as default};