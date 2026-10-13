var e={id:`capwap`,h:{en:`CAPWAP: the control and data tunnels between AP and WLC`,hi:`CAPWAP: AP aur WLC ke beech control aur data tunnels`},body:{en:`
<p>Imagine a bank branch that sends two kinds of traffic to head office. Instructions and reports go in a locked, sealed briefcase carried by a trusted courier. Cash deposits go in armoured vans. Two different vehicles, two different jobs, the same two addresses. <b>CAPWAP</b> works the same way: one tunnel for control messages, one tunnel for client data, both running between an AP and its controller.</p>

<h3>What CAPWAP is</h3>
<p><b>CAPWAP</b> (Control And Provisioning of Wireless Access Points) is the open standard protocol, defined in RFC 5415, that lightweight APs use to talk to a wireless LAN controller. It replaced Cisco's older <b>LWAPP</b> (which used UDP 12222 and 12223). CAPWAP runs over plain <b>UDP/IP</b>, which is the key design choice: the AP and the WLC do not need to be in the same VLAN or even the same building. The AP only needs an IP address and a route to the controller's <b>management interface</b>.</p>

<h3>Two tunnels, two ports</h3>
<table class="cmp"><tr><th></th><th>Control tunnel</th><th>Data tunnel</th></tr>
<tr><td>Port on the WLC</td><td><b>UDP 5246</b></td><td><b>UDP 5247</b></td></tr>
<tr><td>Carries</td><td>Discovery, join, configuration, firmware download, echo keepalives, statistics, RRM data, client association events</td><td>Clients' 802.11 frames (and so their IP packets), encapsulated</td></tr>
<tr><td>Encryption</td><td><b>Always DTLS</b>-protected</td><td>DTLS <b>optional</b>, off by default</td></tr>
</table>
<p><b>DTLS</b> (Datagram Transport Layer Security) is TLS adapted for UDP. The AP and WLC authenticate each other with <b>X.509 certificates</b>: every Cisco AP ships with a Manufacturing Installed Certificate (MIC), and the WLC has its own. After the DTLS handshake the control channel is encrypted and tamper-proof, so nobody on the wire can inject a fake configuration into an AP.</p>
<p>The data tunnel carries the client's frames. Wireless traffic was already encrypted over the air (WPA2/WPA3), but the AP decrypts it before tunnelling. That is why, on untrusted paths such as a branch across the internet, data DTLS can be switched on.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="CAPWAP encapsulation of a client packet">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 packet as it travels from AP1 to WLC1 (local mode)</text>
<rect x="10" y="40" width="110" height="44" rx="6" fill="#e2e8f0"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">outer IPv4</text><text x="65" y="76" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.11 to .99.10</text>
<rect x="125" y="40" width="90" height="44" rx="6" fill="#bae6fd"/><text x="170" y="60" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="170" y="76" text-anchor="middle" class="svg-muted" font-size="12">dst 5247</text>
<rect x="220" y="40" width="100" height="44" rx="6" fill="#ddd6fe"/><text x="270" y="60" text-anchor="middle" class="svg-ink" font-size="12">CAPWAP hdr</text><text x="270" y="76" text-anchor="middle" class="svg-muted" font-size="12">WLAN, radio</text>
<rect x="325" y="40" width="100" height="44" rx="6" fill="#fed7aa"/><text x="375" y="60" text-anchor="middle" class="svg-ink" font-size="12">802.11 hdr</text><text x="375" y="76" text-anchor="middle" class="svg-muted" font-size="12">client MAC</text>
<rect x="430" y="40" width="200" height="44" rx="6" fill="#bbf7d0"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="12">inner IP packet</text><text x="530" y="76" text-anchor="middle" class="svg-muted" font-size="12">10.10.20.21 to 10.10.50.10</text>
<rect x="60" y="130" width="160" height="50" rx="8" fill="#fed7aa"/><text x="140" y="160" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="420" y="130" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="160" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<line x1="220" y1="143" x2="420" y2="143" stroke="#64748b" stroke-width="2"/><text x="320" y="137" text-anchor="middle" class="svg-accent" font-size="12">control UDP 5246 (DTLS)</text>
<line x1="220" y1="168" x2="420" y2="168" stroke="#64748b" stroke-width="4"/><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">data UDP 5247 (client frames)</text>
</svg><p class="cap">The switch between AP1 and WLC1 only ever sees AP1's own address talking to 10.10.99.10. The client's real packet is hidden inside.</p></div>

<h3>The CAPWAP state machine</h3>
<p>When an AP boots it walks through fixed states. You will see these names in AP console logs and on the controller:</p>
<ol>
<li><b>Discovery</b>: the AP sends Discovery Requests to every controller address it knows, and collects Discovery Responses (next chapter explains how it learns addresses).</li>
<li><b>DTLS setup</b>: certificates are exchanged and the secure control channel is built with the chosen WLC.</li>
<li><b>Join</b>: Join Request and Join Response. The WLC checks that the AP is allowed (licences, AP authorization, regulatory domain).</li>
<li><b>Image</b>: if the AP's software differs from the WLC's, the AP downloads the matching image and reboots, then joins again. This is automatic.</li>
<li><b>Configure</b>: the WLC pushes WLANs, radio settings, AP mode and name.</li>
<li><b>Run</b>: the AP turns its radios on and serves clients. <b>A lightweight AP's radios are off until it reaches RUN.</b></li>
</ol>
<p>In RUN, the AP sends a CAPWAP <b>Echo Request</b> every <b>30 seconds</b> by default. If several echoes go unanswered, the AP declares the controller dead, drops its clients (in local mode) and goes back to Discovery to find another WLC.</p>

<pre class="out">AP1&gt; show capwap
AP name                  : AP1
AP IP address            : 10.10.10.11/24 (DHCP)
Default gateway          : 10.10.10.1
Static controller        : not set
DHCP option 43           : 10.10.99.10
<span class="hl">CAPWAP state             : RUN (joined)</span>
Controller               : WLC1 (10.10.99.10)
Discovered by            : DHCP option 43
<span class="hl">Control / data ports     : UDP 5246 / UDP 5247 (control protected by DTLS)</span>
Joined for               : 412 s</pre>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 (10.10.20.21) sends a 1400-byte IP packet to SRV1. AP1 wraps it: 802.11 header and LLC (about 32 bytes), CAPWAP header (8 bytes or more), UDP (8), outer IPv4 (20). The tunnelled packet is roughly 1470 bytes and still fits a 1500-byte MTU. A 1500-byte client packet would not fit, so CAPWAP fragments it or the AP and WLC use path MTU discovery to lower the tunnel MTU. This is why a VPN or GRE tunnel on the AP-to-WLC path sometimes causes "small pings work, big transfers fail".</p></div>

<h3>Why it matters to the network team</h3>
<p>Because CAPWAP is ordinary UDP, every device between the AP and the WLC must allow it. A firewall or an ACL between the AP VLAN and the WLC management VLAN must permit <b>UDP 5246 and 5247</b> from the AP subnet to the WLC management address (plus DHCP and DNS for the AP itself). Also, in local mode the switch never sees the client VLANs on the AP port, only the AP's own management VLAN.</p>

<div class="warn"><p><b>Common mistake.</b> Allowing only UDP 5246 through a firewall. APs join (the control channel works), SSIDs appear, clients associate, but no client gets an IP address, because DHCP and everything else rides the data tunnel on UDP 5247.</p></div>

<div class="exam"><p><b>Exam trap.</b> CAPWAP = <b>UDP</b>, never TCP. <b>5246 control</b> (always DTLS), <b>5247 data</b> (DTLS optional). 1812/1813 are RADIUS; 12222/12223 were LWAPP. Radios on a lightweight AP stay down until the AP is in the RUN state.</p></div>

<div class="scn"><h4>The new firewall that broke the Wi-Fi</h4><p>A company placed a new firewall between the access layer and the data center. The next morning, APs on every floor showed a blinking LED and no SSIDs. The AP console showed repeated "Discovery Request sent" messages and no response. The WLC's AP list was empty. The engineer checked the firewall log: UDP 5246 packets from 10.10.10.0/24 to 10.10.99.10 were being denied by the default rule. After adding a rule permitting UDP 5246 and 5247 from the AP subnet to the WLC, the APs moved through DTLS setup and join, downloaded their configuration and reached RUN within two minutes.</p><p><b>Lesson:</b> CAPWAP is just UDP. Any filter on the path must permit both ports, or APs cannot join and clients cannot pass data.</p></div>

<div class="iv"><p class="q">"What is CAPWAP, and what are the control and data tunnels?"</p><p>Strong answer: CAPWAP is the standard (RFC 5415) protocol between lightweight APs and a WLC, running over UDP. The control tunnel, UDP 5246, is always DTLS-encrypted and carries discovery, join, configuration, firmware and keepalives. The data tunnel, UDP 5247, carries client frames, with DTLS optional. Mention that because it is IP-based, APs can be in a different subnet or site from the controller, and that firewalls must allow both ports.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CAPWAP (RFC 5415) links lightweight APs to the WLC over UDP; it replaced LWAPP.</li>
<li>Control: UDP 5246, always protected by DTLS with certificates. Data: UDP 5247, DTLS optional.</li>
<li>States: Discovery, DTLS setup, Join, Image, Configure, Run; radios are off until Run.</li>
<li>Echoes every 30 s keep the tunnel alive; lost echoes send the AP back to Discovery.</li>
<li>Firewalls and ACLs between AP and WLC must permit both UDP 5246 and 5247.</li>
</ul></div>
`,hi:`
<p>Ek bank branch ki kalpana karo jo head office ko do tarah ka traffic bhejti hai. Instructions aur reports ek locked, sealed briefcase mein trusted courier le jaata hai. Cash deposits armoured vans mein jaate hain. Do alag gaadiyan, do alag kaam, wahi do addresses. <b>CAPWAP</b> bhi aise hi kaam karta hai: control messages ke liye ek tunnel, client data ke liye ek tunnel, dono AP aur uske controller ke beech chalte hain.</p>

<h3>CAPWAP kya hai</h3>
<p><b>CAPWAP</b> (Control And Provisioning of Wireless Access Points) open standard protocol hai, RFC 5415 mein defined, jise lightweight APs wireless LAN controller se baat karne ke liye use karte hain. Isne Cisco ke purane <b>LWAPP</b> ki jagah li (jo UDP 12222 aur 12223 use karta tha). CAPWAP plain <b>UDP/IP</b> par chalta hai, aur yahi key design choice hai: AP aur WLC ko same VLAN ya same building mein hone ki bhi zaroorat nahi. AP ko bas ek IP address aur controller ke <b>management interface</b> tak ek route chahiye.</p>

<h3>Do tunnels, do ports</h3>
<table class="cmp"><tr><th></th><th>Control tunnel</th><th>Data tunnel</th></tr>
<tr><td>WLC par port</td><td><b>UDP 5246</b></td><td><b>UDP 5247</b></td></tr>
<tr><td>Kya le jaata hai</td><td>Discovery, join, configuration, firmware download, echo keepalives, statistics, RRM data, client association events</td><td>Clients ke 802.11 frames (aur isliye unke IP packets), encapsulated</td></tr>
<tr><td>Encryption</td><td><b>Hamesha DTLS</b>-protected</td><td>DTLS <b>optional</b>, default off</td></tr>
</table>
<p><b>DTLS</b> (Datagram Transport Layer Security) UDP ke liye adapt kiya gaya TLS hai. AP aur WLC <b>X.509 certificates</b> se ek doosre ko authenticate karte hain: har Cisco AP ek Manufacturing Installed Certificate (MIC) ke saath aata hai, aur WLC ka apna certificate hota hai. DTLS handshake ke baad control channel encrypted aur tamper-proof ho jaata hai, isliye wire par koi bhi AP mein fake configuration inject nahi kar sakta.</p>
<p>Data tunnel client ke frames le jaata hai. Wireless traffic hawa mein pehle se encrypted tha (WPA2/WPA3), lekin AP tunnel karne se pehle use decrypt karta hai. Isiliye untrusted paths par, jaise internet ke paar branch, data DTLS on kiya ja sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Client packet ka CAPWAP encapsulation">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 ka packet jab AP1 se WLC1 tak jaata hai (local mode)</text>
<rect x="10" y="40" width="110" height="44" rx="6" fill="#e2e8f0"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">outer IPv4</text><text x="65" y="76" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.11 se .99.10</text>
<rect x="125" y="40" width="90" height="44" rx="6" fill="#bae6fd"/><text x="170" y="60" text-anchor="middle" class="svg-ink" font-size="12">UDP</text><text x="170" y="76" text-anchor="middle" class="svg-muted" font-size="12">dst 5247</text>
<rect x="220" y="40" width="100" height="44" rx="6" fill="#ddd6fe"/><text x="270" y="60" text-anchor="middle" class="svg-ink" font-size="12">CAPWAP hdr</text><text x="270" y="76" text-anchor="middle" class="svg-muted" font-size="12">WLAN, radio</text>
<rect x="325" y="40" width="100" height="44" rx="6" fill="#fed7aa"/><text x="375" y="60" text-anchor="middle" class="svg-ink" font-size="12">802.11 hdr</text><text x="375" y="76" text-anchor="middle" class="svg-muted" font-size="12">client MAC</text>
<rect x="430" y="40" width="200" height="44" rx="6" fill="#bbf7d0"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="12">andar ka IP packet</text><text x="530" y="76" text-anchor="middle" class="svg-muted" font-size="12">10.10.20.21 se 10.10.50.10</text>
<rect x="60" y="130" width="160" height="50" rx="8" fill="#fed7aa"/><text x="140" y="160" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="420" y="130" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="160" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<line x1="220" y1="143" x2="420" y2="143" stroke="#64748b" stroke-width="2"/><text x="320" y="137" text-anchor="middle" class="svg-accent" font-size="12">control UDP 5246 (DTLS)</text>
<line x1="220" y1="168" x2="420" y2="168" stroke="#64748b" stroke-width="4"/><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">data UDP 5247 (client frames)</text>
</svg><p class="cap">AP1 aur WLC1 ke beech ka switch sirf AP1 ke apne address ko 10.10.99.10 se baat karte dekhta hai. Client ka asli packet andar chhupa hota hai.</p></div>

<h3>CAPWAP state machine</h3>
<p>Jab AP boot hota hai to woh fixed states se guzarta hai. Yeh naam aapko AP console logs mein aur controller par dikhenge:</p>
<ol>
<li><b>Discovery</b>: AP har us controller address ko Discovery Requests bhejta hai jo use pata hai, aur Discovery Responses collect karta hai (agla chapter batata hai ki woh addresses kaise seekhta hai).</li>
<li><b>DTLS setup</b>: certificates exchange hote hain aur chune hue WLC ke saath secure control channel banta hai.</li>
<li><b>Join</b>: Join Request aur Join Response. WLC check karta hai ki AP allowed hai (licences, AP authorization, regulatory domain).</li>
<li><b>Image</b>: agar AP ka software WLC se alag hai, AP matching image download karta hai aur reboot hota hai, phir dobara join karta hai. Yeh automatic hai.</li>
<li><b>Configure</b>: WLC WLANs, radio settings, AP mode aur naam push karta hai.</li>
<li><b>Run</b>: AP apne radios on karta hai aur clients ko serve karta hai. <b>Lightweight AP ke radios RUN tak pahunchne se pehle off rehte hain.</b></li>
</ol>
<p>RUN mein AP default se har <b>30 seconds</b> par ek CAPWAP <b>Echo Request</b> bhejta hai. Agar kai echoes ka jawab nahi aata, AP controller ko dead maan leta hai, apne clients drop karta hai (local mode mein) aur doosra WLC dhoondhne ke liye wapas Discovery mein jaata hai.</p>

<pre class="out">AP1&gt; show capwap
AP name                  : AP1
AP IP address            : 10.10.10.11/24 (DHCP)
Default gateway          : 10.10.10.1
Static controller        : not set
DHCP option 43           : 10.10.99.10
<span class="hl">CAPWAP state             : RUN (joined)</span>
Controller               : WLC1 (10.10.99.10)
Discovered by            : DHCP option 43
<span class="hl">Control / data ports     : UDP 5246 / UDP 5247 (control protected by DTLS)</span>
Joined for               : 412 s</pre>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 (10.10.20.21) SRV1 ko 1400-byte ka IP packet bhejta hai. AP1 use wrap karta hai: 802.11 header aur LLC (lagbhag 32 bytes), CAPWAP header (8 bytes ya zyada), UDP (8), outer IPv4 (20). Tunnelled packet lagbhag 1470 bytes ka hai aur 1500-byte MTU mein abhi bhi fit hota hai. 1500-byte ka client packet fit nahi hoga, isliye CAPWAP use fragment karta hai ya AP aur WLC path MTU discovery se tunnel MTU kam karte hain. Isiliye AP-to-WLC path par VPN ya GRE tunnel kabhi kabhi "chhote pings chalte hain, bade transfers fail hote hain" wali problem deta hai.</p></div>

<h3>Network team ke liye yeh kyun matter karta hai</h3>
<p>Kyunki CAPWAP ordinary UDP hai, AP aur WLC ke beech har device ko use allow karna hoga. AP VLAN aur WLC management VLAN ke beech ka firewall ya ACL AP subnet se WLC management address tak <b>UDP 5246 aur 5247</b> permit kare (plus AP ke liye DHCP aur DNS). Saath hi local mode mein switch AP port par client VLANs kabhi nahi dekhta, sirf AP ka apna management VLAN.</p>

<div class="warn"><p><b>Common galti.</b> Firewall mein sirf UDP 5246 allow karna. APs join ho jaate hain (control channel chalta hai), SSIDs dikhte hain, clients associate hote hain, lekin kisi client ko IP address nahi milta, kyunki DHCP aur baaki sab data tunnel par UDP 5247 se jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> CAPWAP = <b>UDP</b>, kabhi TCP nahi. <b>5246 control</b> (hamesha DTLS), <b>5247 data</b> (DTLS optional). 1812/1813 RADIUS hain; 12222/12223 LWAPP the. Lightweight AP ke radios tab tak down rehte hain jab tak AP RUN state mein na aaye.</p></div>

<div class="scn"><h4>Naya firewall jisne Wi-Fi tod diya</h4><p>Ek company ne access layer aur data center ke beech naya firewall lagaya. Agli subah har floor ke APs blinking LED dikha rahe the aur koi SSID nahi tha. AP console baar baar "Discovery Request sent" dikha raha tha aur koi response nahi. WLC ki AP list khaali thi. Engineer ne firewall log check kiya: 10.10.10.0/24 se 10.10.99.10 ke UDP 5246 packets default rule se deny ho rahe the. AP subnet se WLC tak UDP 5246 aur 5247 permit karne wala rule jodne ke baad APs DTLS setup aur join se guzre, apni configuration download ki aur do minute mein RUN tak pahunch gaye.</p><p><b>Seekh:</b> CAPWAP bas UDP hai. Raaste ka har filter dono ports permit kare, warna APs join nahi kar sakte aur clients data pass nahi kar sakte.</p></div>

<div class="iv"><p class="q">"CAPWAP kya hai, aur control aur data tunnels kya hain?"</p><p>Strong answer: CAPWAP lightweight APs aur WLC ke beech ka standard (RFC 5415) protocol hai, jo UDP par chalta hai. Control tunnel, UDP 5246, hamesha DTLS-encrypted hota hai aur discovery, join, configuration, firmware aur keepalives le jaata hai. Data tunnel, UDP 5247, client frames le jaata hai, DTLS optional ke saath. Batao ki IP-based hone ki wajah se APs controller se alag subnet ya site mein ho sakte hain, aur firewalls ko dono ports allow karne chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CAPWAP (RFC 5415) lightweight APs ko UDP par WLC se jodta hai; isne LWAPP ki jagah li.</li>
<li>Control: UDP 5246, certificates ke saath hamesha DTLS se protected. Data: UDP 5247, DTLS optional.</li>
<li>States: Discovery, DTLS setup, Join, Image, Configure, Run; Run tak radios off rehte hain.</li>
<li>Har 30 s ke echoes tunnel ko zinda rakhte hain; echoes kho jaayein to AP wapas Discovery mein jaata hai.</li>
<li>AP aur WLC ke beech firewalls aur ACLs ko UDP 5246 aur 5247 dono permit karne chahiye.</li>
</ul></div>
`}};export{e as default};