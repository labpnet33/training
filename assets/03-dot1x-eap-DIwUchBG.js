var e={id:`dot1x-eap`,h:{en:`802.1X step by step: EAPoL, RADIUS and the EAP methods`,hi:`802.1X step by step: EAPoL, RADIUS aur EAP methods`},body:{en:`
<p>Imagine a nightclub with a bouncer who does not speak your language. You hand him a sealed envelope with your ID. He cannot read it, so he passes it by phone to the manager inside, word for word, and passes the manager's questions back to you. When the manager says "yes", the bouncer lifts the rope. That is 802.1X: the switch is the bouncer who relays a conversation it does not need to understand, between the endpoint and ISE.</p>

<h3>The three roles and two protocols</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Software on the endpoint that speaks 802.1X: the Windows wired AutoConfig service, macOS, Linux wpa_supplicant, or Cisco Secure Client Network Access Manager. In the lab, PC1 becomes a supplicant with <code>dot1x user priya password Pr!ya2026</code>.</dd>
<dt>Authenticator</dt><dd>The switch port (or WLC). It speaks <b>EAPoL</b> (EAP over LAN, Ethertype <code>0x888E</code>, sent to the reserved multicast MAC 01:80:C2:00:00:03) toward the endpoint, and <b>RADIUS</b> toward ISE, copying the EAP payload into the RADIUS <b>EAP-Message</b> attribute.</dd>
<dt>Authentication server</dt><dd>ISE. It runs the EAP method, checks the identity store and decides the authorization.</dd>
</dl>
<p><b>EAP</b>, the Extensible Authentication Protocol, is a framework: it carries many "methods" (password, certificate, tunnelled password). The switch does not care which method is used; it just relays.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="802.1X message flow">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="80" y1="28" x2="80" y2="320" stroke="#64748b" stroke-width="1"/><line x1="320" y1="28" x2="320" y2="320" stroke="#64748b" stroke-width="1"/><line x1="560" y1="28" x2="560" y2="320" stroke="#64748b" stroke-width="1"/>
<line x1="80" y1="50" x2="320" y2="50" stroke="#64748b" stroke-width="2"/><text x="200" y="45" text-anchor="middle" class="svg-muted" font-size="12">EAPoL-Start (optional)</text>
<line x1="320" y1="80" x2="80" y2="80" stroke="#64748b" stroke-width="2"/><text x="200" y="75" text-anchor="middle" class="svg-muted" font-size="12">EAP-Request/Identity</text>
<line x1="80" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="200" y="105" text-anchor="middle" class="svg-muted" font-size="12">EAP-Response/Identity priya</text>
<line x1="320" y1="140" x2="560" y2="140" stroke="#64748b" stroke-width="2"/><text x="440" y="135" text-anchor="middle" class="svg-accent" font-size="12">Access-Request</text>
<line x1="560" y1="170" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><text x="440" y="165" text-anchor="middle" class="svg-accent" font-size="12">Access-Challenge</text>
<line x1="320" y1="195" x2="80" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="80" y1="215" x2="320" y2="215" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="200" y="210" text-anchor="middle" class="svg-muted" font-size="12">EAP method exchange</text>
<line x1="560" y1="250" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><text x="440" y="245" text-anchor="middle" class="svg-accent" font-size="12">Access-Accept + VLAN 20</text>
<line x1="320" y1="280" x2="80" y2="280" stroke="#64748b" stroke-width="2"/><text x="200" y="275" text-anchor="middle" class="svg-muted" font-size="12">EAP-Success</text>
<text x="320" y="310" text-anchor="middle" class="svg-ink" font-size="12">port authorized, DHCP in VLAN 20</text>
</svg><p class="cap">EAPoL on the wire to the PC, RADIUS to ISE. The switch relays the EAP conversation and applies the result.</p></div>

<h3>The flow, step by step</h3>
<ol>
<li><b>Link up.</b> The port is <b>unauthorized</b>: it accepts only EAPoL (plus CDP, LLDP and STP). No DHCP, no ARP, no data.</li>
<li><b>Identity.</b> The switch sends <b>EAP-Request/Identity</b> every <code>tx-period</code> seconds. The supplicant answers with its identity (often an outer anonymous identity for tunnelled methods).</li>
<li><b>Relay.</b> The switch wraps the response in a RADIUS <b>Access-Request</b> with Calling-Station-Id (PC1's MAC 0050.7966.0201), NAS-Port and NAS-Port-Type Ethernet, and sends it to ISE.</li>
<li><b>Method exchange.</b> ISE and the supplicant exchange several Access-Challenge / Access-Request rounds, for example building a TLS tunnel.</li>
<li><b>Decision.</b> ISE sends <b>Access-Accept</b> with authorization attributes (VLAN 20 for priya) or <b>Access-Reject</b>.</li>
<li><b>Enforcement.</b> The switch sends EAP-Success, moves the port to VLAN 20 and authorizes it. Only now can PC1 get a DHCP lease 10.20.20.x.</li>
</ol>

<h3>EAP methods you must know</h3>
<table class="cmp"><tr><th>Method</th><th>Server proof</th><th>Client proof</th><th>Notes</th></tr>
<tr><td>EAP-TLS</td><td>Certificate</td><td>Certificate</td><td>Strongest and most common for corporate devices; needs a PKI</td></tr>
<tr><td>PEAP (EAP-MSCHAPv2 inside)</td><td>Certificate</td><td>Username and password</td><td>TLS tunnel first, then password inside; very common with AD</td></tr>
<tr><td>EAP-FAST</td><td>PAC or certificate</td><td>Password or certificate</td><td>Cisco-designed; supports EAP chaining</td></tr>
<tr><td>TEAP</td><td>Certificate</td><td>Inner methods</td><td>Standard (RFC 7170) tunnelled method; supports EAP chaining of machine and user</td></tr>
<tr><td>EAP-TTLS</td><td>Certificate</td><td>Inner PAP/MSCHAPv2 etc.</td><td>Tunnelled; common on non-Windows clients</td></tr>
<tr><td>EAP-MD5</td><td>None</td><td>Password hash</td><td>No mutual authentication, no keys; lab and legacy only</td></tr>
</table>
<p><b>EAP chaining</b> (EAP-FAST or TEAP) authenticates the machine and the user in one session, so ISE can say "corporate laptop AND employee". Without it, Windows does machine authentication at boot and user authentication at logon as two separate events.</p>
<p>In the lab the simulated supplicant uses EAP-MD5, which is why <code>show dot1x interface g0/1 details</code> shows <code>EAP Method = MD5</code>. In production you would use PEAP or EAP-TLS.</p>

<h3>Timers that decide how long things take</h3>
<p>If no supplicant answers, the switch retries EAP-Request/Identity <code>max-reauth-req</code> times, waiting <code>tx-period</code> each time. Defaults are 30 seconds and 2 retries, so the switch gives up after about (2 + 1) x 30 = <b>90 seconds</b> before falling back to MAB or the guest VLAN.</p>

<div class="eg"><p><b>Worked example.</b> The lab sets <code>dot1x timeout tx-period 5</code> and keeps <code>max-reauth-req 2</code>. Timeout = 3 x 5 = 15 seconds. That is why the lab hint says "wait about 15 seconds for MAB fallback" on CAM1 and GUEST1. A camera with default timers would sit for 90 seconds, and many cameras give up on DHCP before that.</p></div>

<pre class="out">ACC-SW1# show dot1x interface g0/1 details
Dot1x Info for GigabitEthernet0/1
------------------------------------
PAE                       = AUTHENTICATOR
QuietPeriod               = 60
ServerTimeout             = 0
SuppTimeout               = 30
ReAuthMax                 = 2
MaxReq                    = 2
<span class="hl">TxPeriod                  = 5</span>

Dot1x Authenticator Client List
-------------------------------
EAP Method                = MD5
Supplicant                = 0050.7966.0201
<span class="hl">Auth SM State             = AUTHENTICATED</span>
Auth BEND SM State        = IDLE</pre>

<div class="warn"><p><b>Common mistake.</b> Forgetting the server certificate. PEAP and EAP-TLS clients validate ISE's EAP certificate. If the client does not trust the issuing CA, it silently aborts and ISE logs <b>5411 Supplicant stopped responding to ISE</b> or <b>12321 PEAP failed SSL/TLS handshake because the client rejected the ISE local-certificate</b>.</p></div>

<div class="exam"><p><b>Exam trap.</b> EAPoL runs only between endpoint and switch; RADIUS runs only between switch and ISE. The endpoint never talks RADIUS. And EAP-TLS needs certificates on <b>both</b> sides, PEAP only on the server.</p></div>

<div class="scn"><h4>Laptops fail after the certificate renewal</h4><p>On Monday morning every PEAP laptop in a branch failed 802.1X. Live Logs showed 12321 for all of them. Over the weekend someone had renewed the ISE EAP certificate with a new intermediate CA that the laptops did not have in their trust store. The team pushed the new intermediate via group policy and the laptops reconnected; they also added a calendar reminder to stage future renewals a week early.</p><p><b>Lesson:</b> the EAP server certificate is part of your authentication path. Treat its renewal like a change, not housekeeping.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a laptop plugs into an 802.1X port."</p><p>Strong answer: the port starts unauthorized, passing only EAPoL. The switch requests identity, the supplicant answers, the switch relays it to ISE in a RADIUS Access-Request, ISE and the supplicant run an EAP method through Access-Challenges, and ISE returns Access-Accept with attributes like a VLAN or dACL. The switch sends EAP-Success, applies the attributes and authorizes the port, then DHCP happens. Name EAPoL Ethertype 0x888E and RADIUS 1812.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EAPoL between endpoint and switch, RADIUS between switch and ISE; the switch only relays EAP.</li>
<li>Unauthorized ports pass only EAPoL, CDP, LLDP and STP: no DHCP until authorized.</li>
<li>EAP-TLS = certificates both sides; PEAP = server certificate plus password in a tunnel; TEAP and EAP-FAST can chain machine and user.</li>
<li>dot1x timeout = tx-period x (max-reauth-req + 1): 90 s by default, 15 s in the lab.</li>
<li>Client trust of the ISE EAP certificate is a frequent hidden failure point.</li>
</ul></div>
`,hi:`
<p>Ek nightclub socho jiska bouncer aapki bhasha nahi bolta. Aap use apni ID wala ek sealed envelope dete ho. Woh use padh nahi sakta, to phone par andar manager ko word for word pass karta hai, aur manager ke sawaal aapko wapas pass karta hai. Jab manager "haan" kehta hai, bouncer rope utha deta hai. Yahi 802.1X hai: switch woh bouncer hai jo endpoint aur ISE ke beech ek aisi baatcheet relay karta hai jise samajhne ki use zaroorat nahi.</p>

<h3>Teen roles aur do protocols</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Endpoint par 802.1X bolne wala software: Windows wired AutoConfig service, macOS, Linux wpa_supplicant, ya Cisco Secure Client Network Access Manager. Lab mein PC1 <code>dot1x user priya password Pr!ya2026</code> se supplicant banta hai.</dd>
<dt>Authenticator</dt><dd>Switch port (ya WLC). Yeh endpoint ki taraf <b>EAPoL</b> (EAP over LAN, Ethertype <code>0x888E</code>, reserved multicast MAC 01:80:C2:00:00:03 par bheja jaata hai) bolta hai, aur ISE ki taraf <b>RADIUS</b>, EAP payload ko RADIUS ke <b>EAP-Message</b> attribute mein copy karke.</dd>
<dt>Authentication server</dt><dd>ISE. Yeh EAP method chalata hai, identity store check karta hai aur authorization decide karta hai.</dd>
</dl>
<p><b>EAP</b>, Extensible Authentication Protocol, ek framework hai: yeh kai "methods" le jaata hai (password, certificate, tunnelled password). Switch ko farak nahi padta kaunsa method use ho raha hai; woh bas relay karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="802.1X message flow">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="80" y1="28" x2="80" y2="320" stroke="#64748b" stroke-width="1"/><line x1="320" y1="28" x2="320" y2="320" stroke="#64748b" stroke-width="1"/><line x1="560" y1="28" x2="560" y2="320" stroke="#64748b" stroke-width="1"/>
<line x1="80" y1="50" x2="320" y2="50" stroke="#64748b" stroke-width="2"/><text x="200" y="45" text-anchor="middle" class="svg-muted" font-size="12">EAPoL-Start (optional)</text>
<line x1="320" y1="80" x2="80" y2="80" stroke="#64748b" stroke-width="2"/><text x="200" y="75" text-anchor="middle" class="svg-muted" font-size="12">EAP-Request/Identity</text>
<line x1="80" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="200" y="105" text-anchor="middle" class="svg-muted" font-size="12">EAP-Response/Identity priya</text>
<line x1="320" y1="140" x2="560" y2="140" stroke="#64748b" stroke-width="2"/><text x="440" y="135" text-anchor="middle" class="svg-accent" font-size="12">Access-Request</text>
<line x1="560" y1="170" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><text x="440" y="165" text-anchor="middle" class="svg-accent" font-size="12">Access-Challenge</text>
<line x1="320" y1="195" x2="80" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="80" y1="215" x2="320" y2="215" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="200" y="210" text-anchor="middle" class="svg-muted" font-size="12">EAP method exchange</text>
<line x1="560" y1="250" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><text x="440" y="245" text-anchor="middle" class="svg-accent" font-size="12">Access-Accept + VLAN 20</text>
<line x1="320" y1="280" x2="80" y2="280" stroke="#64748b" stroke-width="2"/><text x="200" y="275" text-anchor="middle" class="svg-muted" font-size="12">EAP-Success</text>
<text x="320" y="310" text-anchor="middle" class="svg-ink" font-size="12">port authorized, VLAN 20 mein DHCP</text>
</svg><p class="cap">PC ki taraf wire par EAPoL, ISE ki taraf RADIUS. Switch EAP conversation relay karta hai aur result apply karta hai.</p></div>

<h3>Flow, step by step</h3>
<ol>
<li><b>Link up.</b> Port <b>unauthorized</b> hai: sirf EAPoL accept karta hai (plus CDP, LLDP aur STP). Na DHCP, na ARP, na data.</li>
<li><b>Identity.</b> Switch har <code>tx-period</code> seconds par <b>EAP-Request/Identity</b> bhejta hai. Supplicant apni identity se jawab deta hai (tunnelled methods mein aksar ek outer anonymous identity).</li>
<li><b>Relay.</b> Switch response ko RADIUS <b>Access-Request</b> mein wrap karta hai jismein Calling-Station-Id (PC1 ka MAC 0050.7966.0201), NAS-Port aur NAS-Port-Type Ethernet hote hain, aur ISE ko bhejta hai.</li>
<li><b>Method exchange.</b> ISE aur supplicant kai Access-Challenge / Access-Request rounds exchange karte hain, jaise TLS tunnel banana.</li>
<li><b>Decision.</b> ISE authorization attributes (priya ke liye VLAN 20) ke saath <b>Access-Accept</b> ya <b>Access-Reject</b> bhejta hai.</li>
<li><b>Enforcement.</b> Switch EAP-Success bhejta hai, port ko VLAN 20 mein daalta hai aur authorize karta hai. Ab jaakar PC1 ko DHCP lease 10.20.20.x mil sakti hai.</li>
</ol>

<h3>EAP methods jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Method</th><th>Server proof</th><th>Client proof</th><th>Notes</th></tr>
<tr><td>EAP-TLS</td><td>Certificate</td><td>Certificate</td><td>Sabse strong aur corporate devices ke liye sabse common; PKI chahiye</td></tr>
<tr><td>PEAP (andar EAP-MSCHAPv2)</td><td>Certificate</td><td>Username aur password</td><td>Pehle TLS tunnel, phir andar password; AD ke saath bahut common</td></tr>
<tr><td>EAP-FAST</td><td>PAC ya certificate</td><td>Password ya certificate</td><td>Cisco-designed; EAP chaining support karta hai</td></tr>
<tr><td>TEAP</td><td>Certificate</td><td>Inner methods</td><td>Standard (RFC 7170) tunnelled method; machine aur user ki EAP chaining support karta hai</td></tr>
<tr><td>EAP-TTLS</td><td>Certificate</td><td>Inner PAP/MSCHAPv2 etc.</td><td>Tunnelled; non-Windows clients par common</td></tr>
<tr><td>EAP-MD5</td><td>Kuch nahi</td><td>Password hash</td><td>Na mutual authentication, na keys; sirf lab aur legacy</td></tr>
</table>
<p><b>EAP chaining</b> (EAP-FAST ya TEAP) machine aur user ko ek hi session mein authenticate karta hai, taaki ISE keh sake "corporate laptop AUR employee". Iske bina Windows boot par machine authentication aur logon par user authentication do alag events ki tarah karta hai.</p>
<p>Lab mein simulated supplicant EAP-MD5 use karta hai, isliye <code>show dot1x interface g0/1 details</code> <code>EAP Method = MD5</code> dikhata hai. Production mein aap PEAP ya EAP-TLS use karoge.</p>

<h3>Timers jo decide karte hain ki cheezein kitna time leti hain</h3>
<p>Agar koi supplicant jawab nahi deta, switch EAP-Request/Identity <code>max-reauth-req</code> baar retry karta hai, har baar <code>tx-period</code> wait karke. Defaults 30 seconds aur 2 retries hain, isliye switch MAB ya guest VLAN par fallback karne se pehle lagbhag (2 + 1) x 30 = <b>90 seconds</b> baad haar maanta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab <code>dot1x timeout tx-period 5</code> set karta hai aur <code>max-reauth-req 2</code> rakhta hai. Timeout = 3 x 5 = 15 seconds. Isi liye lab hint CAM1 aur GUEST1 par "MAB fallback ke liye lagbhag 15 seconds ruko" kehta hai. Default timers wala camera 90 seconds baitha rahega, aur kai cameras usse pehle DHCP chhod dete hain.</p></div>

<pre class="out">ACC-SW1# show dot1x interface g0/1 details
Dot1x Info for GigabitEthernet0/1
------------------------------------
PAE                       = AUTHENTICATOR
QuietPeriod               = 60
ServerTimeout             = 0
SuppTimeout               = 30
ReAuthMax                 = 2
MaxReq                    = 2
<span class="hl">TxPeriod                  = 5</span>

Dot1x Authenticator Client List
-------------------------------
EAP Method                = MD5
Supplicant                = 0050.7966.0201
<span class="hl">Auth SM State             = AUTHENTICATED</span>
Auth BEND SM State        = IDLE</pre>

<div class="warn"><p><b>Common galti.</b> Server certificate bhool jaana. PEAP aur EAP-TLS clients ISE ka EAP certificate validate karte hain. Agar client issuing CA ko trust nahi karta, to woh chup-chaap abort karta hai aur ISE <b>5411 Supplicant stopped responding to ISE</b> ya <b>12321 PEAP failed SSL/TLS handshake because the client rejected the ISE local-certificate</b> log karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> EAPoL sirf endpoint aur switch ke beech chalta hai; RADIUS sirf switch aur ISE ke beech. Endpoint kabhi RADIUS nahi bolta. Aur EAP-TLS ko <b>dono</b> sides par certificates chahiye, PEAP ko sirf server par.</p></div>

<div class="scn"><h4>Certificate renewal ke baad laptops fail</h4><p>Monday subah ek branch ka har PEAP laptop 802.1X mein fail hua. Live Logs mein sabke liye 12321 tha. Weekend par kisi ne ISE EAP certificate ek naye intermediate CA ke saath renew kiya tha jo laptops ke trust store mein nahi tha. Team ne group policy se naya intermediate push kiya aur laptops reconnect ho gaye; unhone future renewals ek hafta pehle stage karne ka calendar reminder bhi lagaya.</p><p><b>Seekh:</b> EAP server certificate aapke authentication path ka hissa hai. Uske renewal ko housekeeping nahi, ek change ki tarah treat karo.</p></div>

<div class="iv"><p class="q">"Mujhe batao jab ek laptop 802.1X port mein plug hota hai tab kya hota hai."</p><p>Strong answer: port unauthorized shuru hota hai, sirf EAPoL pass karta hai. Switch identity maangta hai, supplicant jawab deta hai, switch use RADIUS Access-Request mein ISE ko relay karta hai, ISE aur supplicant Access-Challenges ke through EAP method chalate hain, aur ISE VLAN ya dACL jaise attributes ke saath Access-Accept wapas deta hai. Switch EAP-Success bhejta hai, attributes apply karta hai aur port authorize karta hai, phir DHCP hota hai. EAPoL Ethertype 0x888E aur RADIUS 1812 ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoint aur switch ke beech EAPoL, switch aur ISE ke beech RADIUS; switch sirf EAP relay karta hai.</li>
<li>Unauthorized ports sirf EAPoL, CDP, LLDP aur STP pass karte hain: authorize hone tak koi DHCP nahi.</li>
<li>EAP-TLS = dono sides certificates; PEAP = server certificate plus tunnel mein password; TEAP aur EAP-FAST machine aur user ko chain kar sakte hain.</li>
<li>dot1x timeout = tx-period x (max-reauth-req + 1): default 90 s, lab mein 15 s.</li>
<li>Client ka ISE EAP certificate par trust ek aam chhupa hua failure point hai.</li>
</ul></div>
`}};export{e as default};