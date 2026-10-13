var e={id:`dot1x-flow`,h:{en:`The 802.1X exchange: EAPOL, PEAP and RADIUS`,hi:`802.1X exchange: EAPOL, PEAP aur RADIUS`},body:{en:`
<p>Think of a courier handing a sealed letter to a gatekeeper who cannot read it. The gatekeeper does not open the letter; he posts it to head office in a bigger envelope, waits for the reply, and hands the answer back. 802.1X works like this: the switch never understands the user's credentials, it only <b>relays</b> them.</p>

<h3>Three protocols, one conversation</h3>
<dl class="terms">
<dt>EAPOL</dt><dd>EAP over LAN. The frame format used between the supplicant and the switch port, sent to a special multicast address. It exists only on that one cable.</dd>
<dt>EAP</dt><dd>Extensible Authentication Protocol, the container for the real authentication method. Methods include PEAP, EAP-TLS and others.</dd>
<dt>RADIUS</dt><dd>The protocol between the switch (the NAD) and ClearPass over UDP: ports 1812 for authentication and 1813 for accounting are the standard ones. The EAP messages travel inside the RADIUS attribute EAP-Message.</dd>
<dt>PEAP</dt><dd>Protected EAP. First a TLS tunnel is built using the <b>server certificate</b> of ClearPass; inside the tunnel the user proves the password, normally with MSCHAPv2. Only the server needs a certificate.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="802.1X PEAP message flow">
<text x="70" y="20" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ACCESS</text><text x="570" y="20" text-anchor="middle" class="svg-ink" font-size="13">CPPM</text>
<line x1="70" y1="30" x2="70" y2="320" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="30" x2="320" y2="320" stroke="#64748b" stroke-width="1.5"/><line x1="570" y1="30" x2="570" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="70" y1="50" x2="320" y2="50" stroke="#64748b" stroke-width="2"/><text x="195" y="44" text-anchor="middle" class="svg-muted" font-size="12">EAPOL-Start</text>
<line x1="320" y1="80" x2="70" y2="80" stroke="#64748b" stroke-width="2"/><text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="12">EAP-Request Identity</text>
<line x1="70" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="195" y="104" text-anchor="middle" class="svg-muted" font-size="12">EAP-Response alice</text>
<line x1="320" y1="140" x2="570" y2="140" stroke="#64748b" stroke-width="2"/><text x="445" y="134" text-anchor="middle" class="svg-accent" font-size="12">Access-Request</text>
<line x1="570" y1="170" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><text x="445" y="164" text-anchor="middle" class="svg-accent" font-size="12">Access-Challenge (PEAP)</text>
<rect x="150" y="190" width="340" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">TLS tunnel + MSCHAPv2 relayed both ways</text>
<line x1="570" y1="250" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><text x="445" y="244" text-anchor="middle" class="svg-accent" font-size="12">Access-Accept + attributes</text>
<line x1="320" y1="285" x2="70" y2="285" stroke="#64748b" stroke-width="2"/><text x="195" y="279" text-anchor="middle" class="svg-muted" font-size="12">EAP-Success</text>
<text x="320" y="318" text-anchor="middle" class="svg-ink" font-size="12">port authorized in role or VLAN</text>
</svg><p class="cap">The switch only relays; ClearPass terminates the PEAP tunnel and decides.</p></div>

<h3>Step by step</h3>
<ol>
<li>The link comes up. The port is <b>unauthorized</b>: only EAPOL passes. DHCP and everything else are blocked.</li>
<li>The supplicant sends EAPOL-Start (or the switch sends an EAP-Request Identity first).</li>
<li>The supplicant answers with its <b>outer identity</b>, often the real username or "anonymous".</li>
<li>ACCESS puts it into a RADIUS Access-Request, adding attributes such as NAS-IP-Address, NAS-Port-Type (Ethernet is 15) and Service-Type, then signs it with the shared secret.</li>
<li>ClearPass answers Access-Challenge messages carrying the TLS handshake. The laptop checks the server certificate. A laptop that does not trust the certificate stops here.</li>
<li>Inside the tunnel the password is proved.</li>
<li>ClearPass runs its policy and sends Access-Accept (with attributes) or Access-Reject. The switch converts that into EAP-Success or EAP-Failure.</li>
</ol>
<p>The attributes matter for this module. NAS-Port-Type = 15 (Ethernet) and Service-Type are exactly what the service classification rule in module 1 matched. The reply attributes, <code>Aruba-User-Role</code> or the Tunnel set, are what place the user.</p>

<h3>What the switch shows</h3>
<p>After success the AOS-CX style switch lists the client, the method and the role:</p>
<pre class="out">ACCESS# show port-access clients

Port Access Clients

Port    MAC-Address        Onboarded    Status       Role         Method
------- ------------------ ------------ ------------ ------------ -------
<span class="hl">1/1/3   00:50:2f:e9:9a:01  yes          authorized   EMPLOYEE     dot1x</span></pre>
<p>If you see <code>Method dot1x</code> the supplicant took part. If you see <code>mac-auth</code> the device had no supplicant and fell back (chapter 7). The exact column layout differs between releases; this is a representative output.</p>

<div class="eg"><p><b>Worked example.</b> Timeline for alice: t=0 cable inserted, t=1 s EAPOL-Start, t=2 s identity alice, t=3 s to 5 s TLS handshake as four to six round trips of Challenge and Response, t=6 s Access-Accept, t=7 s DHCP Discover on VLAN 10. A printer with no supplicant never answers the identity request; the switch waits about 10 seconds in the lab model, then tries MAC authentication, so its first address arrives around 12 s after link up. That delay is normal and is one reason printers sometimes look slow to wake up.</p></div>

<div class="note"><p><b>Real platform note.</b> The lab models PEAP with a local user. In a real deployment ClearPass usually checks the password against Active Directory, which needs the server to be joined to the domain. That, and EAP-TLS with certificates, are <b>not simulated in the lab</b>. The flow above is identical for those methods; only the inner check differs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Debugging the user's password when the TLS handshake never finished. If the laptop does not trust the ClearPass server certificate, or the secret is wrong so ClearPass never answers, there is no password check at all. Always find how far the conversation got.</p></div>

<div class="exam"><p><b>Exam trap.</b> The RADIUS shared secret protects the packet between switch and server (it signs it and hides some attributes). It is not the user's password and it is not used inside the TLS tunnel. Also remember that a wrong shared secret is silently dropped: there is no reject.</p></div>

<div class="scn"><h4>"Anonymous" and the missing log</h4><p>A new switch authenticated nobody. The Access Tracker was empty. The engineer checked the user database first, which was fine. Only when she opened the Event Viewer did she see packets dropped from an unknown device. ClearPass never got far enough to write an Access Tracker record, because the request failed the network device check before any policy ran. Registering the right source address fixed it.</p><p><b>Lesson:</b> if the Access Tracker is empty, the problem is before policy: address, secret or reachability.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a laptop is plugged into an 802.1X port."</p><p>Strong answer: the port is unauthorized and passes only EAPOL; the supplicant and the switch exchange identity; the switch relays EAP inside RADIUS Access-Request to ClearPass; PEAP builds a TLS tunnel with the server certificate, then the credentials are proved inside; ClearPass evaluates policy and returns Access-Accept with attributes such as a role or VLAN; the switch applies them, the port opens and DHCP runs. Mention that the switch never sees the password.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EAPOL runs on the cable, RADIUS runs between the switch and ClearPass; the switch relays EAP.</li>
<li>PEAP uses the server certificate to build a TLS tunnel and proves the password inside it.</li>
<li>Until success the port passes only EAPOL.</li>
<li>NAS-Port-Type 15 and Service-Type in the request drive service classification.</li>
<li>No Access Tracker record usually means the request died before policy.</li>
</ul></div>
`,hi:`
<p>Socho ek courier gatekeeper ko sealed letter deta hai jo use padh nahi sakta. Gatekeeper letter kholta nahi; woh use bade envelope mein head office ko post karta hai, reply ka wait karta hai aur jawab wapas de deta hai. 802.1X aise hi kaam karta hai: switch user ke credentials kabhi samajhta nahi, sirf unhe <b>relay</b> karta hai.</p>

<h3>Teen protocols, ek conversation</h3>
<dl class="terms">
<dt>EAPOL</dt><dd>EAP over LAN. Supplicant aur switch port ke beech use hone wala frame format, jo ek special multicast address par bheja jaata hai. Yeh sirf us ek cable par exist karta hai.</dd>
<dt>EAP</dt><dd>Extensible Authentication Protocol, real authentication method ka container. Methods mein PEAP, EAP-TLS aur doosre aate hain.</dd>
<dt>RADIUS</dt><dd>Switch (NAD) aur ClearPass ke beech UDP protocol: standard ports 1812 authentication ke liye aur 1813 accounting ke liye hain. EAP messages RADIUS attribute EAP-Message ke andar travel karte hain.</dd>
<dt>PEAP</dt><dd>Protected EAP. Pehle ClearPass ke <b>server certificate</b> se TLS tunnel banta hai; tunnel ke andar user password prove karta hai, aam taur par MSCHAPv2 se. Sirf server ko certificate chahiye.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="802.1X PEAP message flow">
<text x="70" y="20" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ACCESS</text><text x="570" y="20" text-anchor="middle" class="svg-ink" font-size="13">CPPM</text>
<line x1="70" y1="30" x2="70" y2="320" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="30" x2="320" y2="320" stroke="#64748b" stroke-width="1.5"/><line x1="570" y1="30" x2="570" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="70" y1="50" x2="320" y2="50" stroke="#64748b" stroke-width="2"/><text x="195" y="44" text-anchor="middle" class="svg-muted" font-size="12">EAPOL-Start</text>
<line x1="320" y1="80" x2="70" y2="80" stroke="#64748b" stroke-width="2"/><text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="12">EAP-Request Identity</text>
<line x1="70" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="195" y="104" text-anchor="middle" class="svg-muted" font-size="12">EAP-Response alice</text>
<line x1="320" y1="140" x2="570" y2="140" stroke="#64748b" stroke-width="2"/><text x="445" y="134" text-anchor="middle" class="svg-accent" font-size="12">Access-Request</text>
<line x1="570" y1="170" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><text x="445" y="164" text-anchor="middle" class="svg-accent" font-size="12">Access-Challenge (PEAP)</text>
<rect x="150" y="190" width="340" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">TLS tunnel + MSCHAPv2 dono taraf relay</text>
<line x1="570" y1="250" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><text x="445" y="244" text-anchor="middle" class="svg-accent" font-size="12">Access-Accept + attributes</text>
<line x1="320" y1="285" x2="70" y2="285" stroke="#64748b" stroke-width="2"/><text x="195" y="279" text-anchor="middle" class="svg-muted" font-size="12">EAP-Success</text>
<text x="320" y="318" text-anchor="middle" class="svg-ink" font-size="12">port role ya VLAN mein authorized</text>
</svg><p class="cap">Switch sirf relay karta hai; ClearPass PEAP tunnel terminate karta hai aur decide karta hai.</p></div>

<h3>Step by step</h3>
<ol>
<li>Link up hota hai. Port <b>unauthorized</b> hai: sirf EAPOL pass hota hai. DHCP aur baaki sab blocked.</li>
<li>Supplicant EAPOL-Start bhejta hai (ya switch pehle EAP-Request Identity bhejta hai).</li>
<li>Supplicant apni <b>outer identity</b> se jawab deta hai, aksar real username ya "anonymous".</li>
<li>ACCESS use RADIUS Access-Request mein daalta hai, NAS-IP-Address, NAS-Port-Type (Ethernet ke liye 15) aur Service-Type jaise attributes jodta hai, aur shared secret se sign karta hai.</li>
<li>ClearPass Access-Challenge messages se jawab deta hai jinme TLS handshake hota hai. Laptop server certificate check karta hai. Jo laptop certificate par trust nahi karta woh yahin ruk jaata hai.</li>
<li>Tunnel ke andar password prove hota hai.</li>
<li>ClearPass policy chalata hai aur Access-Accept (attributes ke saath) ya Access-Reject bhejta hai. Switch use EAP-Success ya EAP-Failure mein badalta hai.</li>
</ol>
<p>Is module ke liye attributes important hain. NAS-Port-Type = 15 (Ethernet) aur Service-Type wahi hain jo module 1 ka service classification rule match karta tha. Reply attributes, <code>Aruba-User-Role</code> ya Tunnel set, user ko place karte hain.</p>

<h3>Switch kya dikhata hai</h3>
<p>Success ke baad AOS-CX style switch client, method aur role list karta hai:</p>
<pre class="out">ACCESS# show port-access clients

Port Access Clients

Port    MAC-Address        Onboarded    Status       Role         Method
------- ------------------ ------------ ------------ ------------ -------
<span class="hl">1/1/3   00:50:2f:e9:9a:01  yes          authorized   EMPLOYEE     dot1x</span></pre>
<p>Agar <code>Method dot1x</code> dikhe to supplicant ne hissa liya. Agar <code>mac-auth</code> dikhe to device mein supplicant nahi tha aur woh fallback hua (chapter 7). Column layout releases ke beech alag ho sakta hai; yeh representative output hai.</p>

<div class="eg"><p><b>Worked example.</b> Alice ki timeline: t=0 cable lagi, t=1 s EAPOL-Start, t=2 s identity alice, t=3 s se 5 s TLS handshake chaar se chhe round trips Challenge aur Response ke, t=6 s Access-Accept, t=7 s VLAN 10 par DHCP Discover. Bina supplicant wala printer identity request ka jawab kabhi nahi deta; lab model mein switch lagbhag 10 second wait karta hai, phir MAC authentication try karta hai, to uska pehla address link up ke lagbhag 12 s baad aata hai. Yeh delay normal hai aur isi wajah se printers kabhi kabhi slow jaagte lagte hain.</p></div>

<div class="note"><p><b>Real platform note.</b> Lab PEAP ko local user ke saath model karta hai. Real deployment mein ClearPass aam taur par password Active Directory se check karta hai, jiske liye server ko domain join karna padta hai. Woh aur certificates ke saath EAP-TLS lab mein <b>not simulated in the lab</b> hain. Upar ka flow un methods ke liye bhi same hai; sirf inner check alag hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> User ka password debug karna jabki TLS handshake kabhi poora hi nahi hua. Agar laptop ClearPass server certificate par trust nahi karta, ya secret galat hai aur ClearPass kabhi jawab hi nahi deta, to password check hota hi nahi. Hamesha dhoondho ki conversation kahan tak pahunchi.</p></div>

<div class="exam"><p><b>Exam trap.</b> RADIUS shared secret switch aur server ke beech packet ko protect karta hai (sign karta hai aur kuch attributes chhupata hai). Yeh user ka password nahi hai aur TLS tunnel ke andar use nahi hota. Yeh bhi yaad rakho ki galat shared secret silently drop hota hai: koi reject nahi aata.</p></div>

<div class="scn"><h4>"Anonymous" aur gaayab log</h4><p>Ek naye switch ne kisi ko authenticate nahi kiya. Access Tracker khaali tha. Engineer ne pehle user database check kiya, jo theek tha. Jab usne Event Viewer kholi tab unknown device se dropped packets dikhe. ClearPass Access Tracker record likhne tak pahunchta hi nahi, kyunki request kisi bhi policy se pehle network device check mein fail ho gayi. Sahi source address register karne se theek ho gaya.</p><p><b>Seekh:</b> agar Access Tracker khaali hai to problem policy se pehle hai: address, secret ya reachability.</p></div>

<div class="iv"><p class="q">"Jab laptop ko 802.1X port mein lagaya jaata hai tab kya hota hai, mujhe walk through karo."</p><p>Strong answer: port unauthorized hai aur sirf EAPOL pass karta hai; supplicant aur switch identity exchange karte hain; switch EAP ko RADIUS Access-Request ke andar ClearPass tak relay karta hai; PEAP server certificate se TLS tunnel banata hai, phir andar credentials prove hote hain; ClearPass policy evaluate karke role ya VLAN jaise attributes ke saath Access-Accept bhejta hai; switch unhe apply karta hai, port khulta hai aur DHCP chalta hai. Bolo ki switch password kabhi nahi dekhta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EAPOL cable par chalta hai, RADIUS switch aur ClearPass ke beech; switch EAP relay karta hai.</li>
<li>PEAP server certificate se TLS tunnel banata hai aur password tunnel ke andar prove karta hai.</li>
<li>Success tak port sirf EAPOL pass karta hai.</li>
<li>Request mein NAS-Port-Type 15 aur Service-Type service classification chalate hain.</li>
<li>Access Tracker record na hona aam taur par matlab request policy se pehle mar gayi.</li>
</ul></div>
`}};export{e as default};