var e={id:`capwap-split-mac`,h:{en:`Split MAC and CAPWAP: control and data tunnels`,hi:`Split MAC aur CAPWAP: control aur data tunnels`},body:{en:`
<h3>Analogy: the waiter and the kitchen manager</h3>
<p>In a restaurant the waiter handles the immediate, time-critical jobs: taking the order, carrying plates, smiling at the guest. The kitchen manager handles the decisions: menu, pricing, special requests, who is allowed in the private room. A good restaurant splits the work so the waiter is never stuck waiting for a decision on every plate. Lightweight Wi-Fi does the same thing. The idea is called <b>split MAC</b>.</p>

<h3>What is split MAC?</h3>
<p>An 802.11 device performs many functions: sending beacons, acknowledging frames, retrying, encrypting, authenticating clients, assigning clients to networks, choosing channels and power. Some of them must happen within microseconds or milliseconds, close to the antenna. Others are decisions that benefit from a central view. Split MAC divides them:</p>
<table class="cmp"><tr><th>AP does (real time)</th><th>Controller does (management)</th></tr>
<tr><td>Beacons and probe responses</td><td>WLAN, policy and tag configuration</td></tr>
<tr><td>ACKs, retries, frame queueing</td><td>Client authentication decisions (PSK, 802.1X via RADIUS)</td></tr>
<tr><td>Frame encryption and decryption of data</td><td>Client policy, VLAN assignment, QoS and ACL profiles</td></tr>
<tr><td>Radio on or off, transmit power applied</td><td>RF decisions: channel and power plans, rogue handling</td></tr>
<tr><td>Client association handling (first contact)</td><td>Mobility, roaming state and client database</td></tr>
</table>
<p>The exact line varies between products, but the principle stays: real-time work at the AP, policy at the controller. Both halves talk through <b>CAPWAP</b>.</p>

<h3>CAPWAP in one page</h3>
<p><b>CAPWAP</b> (Control And Provisioning of Wireless Access Points, an IETF standard) is a tunnel between the AP and the controller. It is carried over ordinary IP and UDP, so any routed network can transport it. Two separate tunnels exist:</p>
<ul>
<li><b>CAPWAP control tunnel, UDP port 5246.</b> Carries discovery, join, configuration, statistics, firmware download and the AP heartbeat. It is always protected with <b>DTLS</b>, TLS adapted for UDP.</li>
<li><b>CAPWAP data tunnel, UDP port 5247.</b> Carries client data frames when the WLAN is centrally switched: the AP wraps the client frame in CAPWAP and sends it to the controller, which places it onto the VLAN. DTLS on the data tunnel is optional.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="CAPWAP tunnels">
<rect x="20" y="70" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="510" y="70" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<line x1="130" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="3"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">Control: UDP 5246 (DTLS) - join, config, heartbeat</text>
<line x1="130" y1="118" x2="510" y2="118" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">Data: UDP 5247 - client frames (central switching)</text>
<text x="75" y="160" text-anchor="middle" class="svg-muted" font-size="12">Client frames in</text>
<text x="565" y="160" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 / 40 / 50</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Both tunnels run over normal routed IP between VLAN 10 and VLAN 99</text>
</svg><p class="cap">Two tunnels, two ports. A firewall or ACL that blocks UDP 5246 stops the join; blocking UDP 5247 breaks only client traffic.</p></div>

<h3>Central switching: where does client traffic go?</h3>
<p>In the labs every WLAN is <b>centrally switched</b>. A laptop on NK-STAFF sends a frame to AP1. AP1 wraps the frame in CAPWAP (UDP 5247) and sends it to WLC1 at 10.10.99.10. WLC1 removes the wrapper and places the frame on VLAN 20 as defined by the policy profile PP-STAFF. That is why the controller trunk must carry VLAN 20 as well as VLAN 99, and why the client's IP address comes from the VLAN 20 pool and not from VLAN 10. The AP's own address (VLAN 10) is used only for the tunnel.</p>
<p>The alternative is <b>FlexConnect local switching</b>: the AP drops client traffic straight onto a local VLAN and sends only control traffic to the controller, which suits small branch sites over a slow WAN. This is a concept only in this course: <b>not simulated in the lab</b>.</p>

<h3>The cost of tunnelling: MTU</h3>
<p>Wrapping a frame in CAPWAP adds outer IP, UDP, CAPWAP and (for the control tunnel) DTLS headers: roughly 50 to 70 bytes. A full 1500-byte client packet plus this overhead no longer fits a 1500-byte link. CAPWAP therefore fragments, or the AP and controller discover a smaller path MTU. Large frames that must be fragmented are a classic cause of slow, odd behaviour when some link in the middle drops fragments. The control tunnel is more sensitive: a join may stall at the DTLS or image step if large packets are lost.</p>

<div class="eg"><p><b>Worked example.</b> A client sends a 1400-byte frame. AP1 (10.10.10.21) wraps it: outer IP 20 bytes, UDP 8, CAPWAP header 8 and optional DTLS about 25 to 40. The packet from AP1 to 10.10.99.10 becomes about 1460 to 1480 bytes: it still fits. A 1500-byte payload would not, and fragmentation would be needed. Same hosts, same VLANs, only the size changed.</p></div>

<h3>Seeing it on the controller</h3>
<p>The controller shows how many APs use its tunnels with the summary command. Output layout is similar to this:</p>
<pre class="out">WLC1&gt; show ap summary
Number of APs: 2

AP Name   Slots  AP Model      Ethernet MAC    Radio MAC       Country  IP Address     State
<span class="hl">AP1       2      C9120AXI-D    0050.7966.6801  0050.7966.6811  IN       10.10.10.21    Registered</span>
AP2       2      C9120AXI-D    0050.7966.6802  0050.7966.6812  IN       10.10.10.22    Registered</pre>
<p>"Registered" means the CAPWAP control tunnel is up and the AP is in the run state. The IP address column is the AP address in VLAN 10, not the client range.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Confusing the two ports: 5246 is control, 5247 is data. (2) Assuming client traffic leaves the AP on the AP's own VLAN: under central switching it leaves the controller on the policy VLAN. (3) Forgetting that a firewall between AP and controller must allow both UDP ports.</p></div>
<div class="exam"><p><b>Exam trap.</b> CAPWAP replaced the older Cisco LWAPP and uses UDP 5246 (control) and 5247 (data). The control channel is always DTLS-encrypted; the data channel encryption is optional. FlexConnect is the exception to "all data to the controller".</p></div>

<div class="scn"><h4>The firewall that ate port 5246</h4><p>A branch got a new firewall. The APs received addresses and could ping the controller, yet never joined. Packet logs on the firewall showed denied UDP 5246 from the AP subnet to the WLC. The rule set allowed ICMP but not CAPWAP. After permitting UDP 5246 and 5247 the APs joined within a minute.</p><p><b>Lesson:</b> a working ping does not prove the tunnel ports are open.</p></div>

<div class="iv"><p class="q">"Explain split MAC and the two CAPWAP tunnels."</p><p>Split MAC divides 802.11 functions: real-time frame work stays on the AP, management and policy go to the controller. CAPWAP carries both over UDP: control on 5246, always DTLS-protected, and data on 5247 for centrally switched client traffic. Mention FlexConnect as local switching and MTU overhead as the practical cost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Split MAC: AP handles real-time radio work, controller handles policy and management.</li>
<li>CAPWAP control uses UDP 5246 with DTLS; CAPWAP data uses UDP 5247.</li>
<li>Central switching sends client frames through the controller onto the policy VLAN.</li>
<li>FlexConnect local switching is a concept here, not simulated in the lab. Coming up: module wl-flex (FlexConnect).</li>
<li>Tunnel overhead reduces the usable MTU; blocked fragments cause odd failures.</li>
</ul></div>
`,hi:`
<h3>Analogy: waiter aur kitchen manager</h3>
<p>Restaurant mein waiter turant aur time-critical kaam karta hai: order lena, plates uthana, guest ko smile dena. Kitchen manager decisions leta hai: menu, pricing, special requests, private room mein kaun jaa sakta hai. Achha restaurant kaam ko aise baantta hai ki waiter ko har plate par decision ke liye ruk na pade. Lightweight Wi-Fi bhi yahi karta hai. Is idea ko <b>split MAC</b> kehte hain.</p>

<h3>Split MAC kya hai?</h3>
<p>802.11 device kai functions karta hai: beacons bhejna, frames acknowledge karna, retry, encrypt, clients authenticate karna, clients ko networks assign karna, channels aur power chunna. Inme se kuch microseconds ya milliseconds mein, antenna ke paas hone chahiye. Baaki decisions hain jinhe central view se fayda hota hai. Split MAC inhe baantta hai:</p>
<table class="cmp"><tr><th>AP karta hai (real time)</th><th>Controller karta hai (management)</th></tr>
<tr><td>Beacons aur probe responses</td><td>WLAN, policy aur tag configuration</td></tr>
<tr><td>ACKs, retries, frame queueing</td><td>Client authentication decisions (PSK, RADIUS ke zariye 802.1X)</td></tr>
<tr><td>Data frames ka encryption aur decryption</td><td>Client policy, VLAN assignment, QoS aur ACL profiles</td></tr>
<tr><td>Radio on ya off, transmit power apply karna</td><td>RF decisions: channel aur power plans, rogue handling</td></tr>
<tr><td>Client association handling (pehla contact)</td><td>Mobility, roaming state aur client database</td></tr>
</table>
<p>Exact line products ke beech badalti hai, lekin principle wahi: real-time kaam AP par, policy controller par. Dono half <b>CAPWAP</b> ke zariye baat karte hain.</p>

<h3>CAPWAP ek page mein</h3>
<p><b>CAPWAP</b> (Control And Provisioning of Wireless Access Points, ek IETF standard) AP aur controller ke beech ek tunnel hai. Yeh normal IP aur UDP par chalta hai, isliye koi bhi routed network ise transport kar sakta hai. Do alag tunnels hote hain:</p>
<ul>
<li><b>CAPWAP control tunnel, UDP port 5246.</b> Discovery, join, configuration, statistics, firmware download aur AP heartbeat carry karta hai. Hamesha <b>DTLS</b> se protected, yaani UDP ke liye adapt kiya hua TLS.</li>
<li><b>CAPWAP data tunnel, UDP port 5247.</b> Jab WLAN centrally switched ho tab client data frames carry karta hai: AP client frame ko CAPWAP mein wrap karke controller ko bhejta hai, jo use VLAN par rakhta hai. Data tunnel par DTLS optional hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="CAPWAP tunnels">
<rect x="20" y="70" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="510" y="70" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<line x1="130" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="3"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">Control: UDP 5246 (DTLS) - join, config, heartbeat</text>
<line x1="130" y1="118" x2="510" y2="118" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">Data: UDP 5247 - client frames (central switching)</text>
<text x="75" y="160" text-anchor="middle" class="svg-muted" font-size="12">Client frames andar</text>
<text x="565" y="160" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 / 40 / 50</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Dono tunnels VLAN 10 aur VLAN 99 ke beech normal routed IP par chalte hain</text>
</svg><p class="cap">Do tunnels, do ports. Firewall ya ACL jo UDP 5246 block kare to join ruk jaata hai; UDP 5247 block ho to sirf client traffic toot-ta hai.</p></div>

<h3>Central switching: client traffic kahan jaata hai?</h3>
<p>Labs mein har WLAN <b>centrally switched</b> hai. NK-STAFF par laptop AP1 ko frame bhejta hai. AP1 us frame ko CAPWAP (UDP 5247) mein wrap karta hai aur WLC1 (10.10.99.10) ko bhejta hai. WLC1 wrapper hatata hai aur policy profile PP-STAFF ke hisaab se frame ko VLAN 20 par rakhta hai. Isiliye controller trunk ko VLAN 99 ke saath VLAN 20 bhi carry karna padta hai, aur client ka IP address VLAN 20 pool se aata hai, VLAN 10 se nahi. AP ka apna address (VLAN 10) sirf tunnel ke liye use hota hai.</p>
<p>Alternative hai <b>FlexConnect local switching</b>: AP client traffic ko seedha local VLAN par chhod deta hai aur sirf control traffic controller ko bhejta hai, jo slow WAN wali chhoti branch sites ke liye suit karta hai. Is course mein yeh sirf concept hai: <b>lab mein simulate nahi hota</b>.</p>

<h3>Tunnelling ki keemat: MTU</h3>
<p>Frame ko CAPWAP mein wrap karne se outer IP, UDP, CAPWAP aur (control tunnel ke liye) DTLS headers add hote hain: lagbhag 50 se 70 bytes. 1500-byte client packet plus yeh overhead 1500-byte link mein fit nahi hota. Isliye CAPWAP fragment karta hai, ya AP aur controller chhota path MTU discover karte hain. Jin bade frames ko fragment hona padta hai woh slow, ajeeb behaviour ki classic wajah hain jab beech ka koi link fragments drop kare. Control tunnel zyada sensitive hai: agar bade packets lost hon to join DTLS ya image step par atak sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Client 1400-byte frame bhejta hai. AP1 (10.10.10.21) use wrap karta hai: outer IP 20 bytes, UDP 8, CAPWAP header 8 aur optional DTLS lagbhag 25 se 40. AP1 se 10.10.99.10 ka packet lagbhag 1460 se 1480 bytes ka hota hai: abhi bhi fit hota hai. 1500-byte payload fit nahi hota aur fragmentation chahiye hoti. Same hosts, same VLANs, sirf size badla.</p></div>

<h3>Controller par dekhna</h3>
<p>Controller summary command se dikhata hai ki kitne APs uske tunnels use kar rahe hain. Output layout kuch aisa hota hai:</p>
<pre class="out">WLC1&gt; show ap summary
Number of APs: 2

AP Name   Slots  AP Model      Ethernet MAC    Radio MAC       Country  IP Address     State
<span class="hl">AP1       2      C9120AXI-D    0050.7966.6801  0050.7966.6811  IN       10.10.10.21    Registered</span>
AP2       2      C9120AXI-D    0050.7966.6802  0050.7966.6812  IN       10.10.10.22    Registered</pre>
<p>"Registered" ka matlab CAPWAP control tunnel up hai aur AP run state mein hai. IP address column AP ka VLAN 10 address hai, client range nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Dono ports confuse karna: 5246 control hai, 5247 data. (2) Maan lena ki client traffic AP ke apne VLAN par nikalta hai: central switching mein woh controller se policy VLAN par nikalta hai. (3) Bhool jaana ki AP aur controller ke beech firewall ko dono UDP ports allow karne chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> CAPWAP ne purane Cisco LWAPP ko replace kiya aur UDP 5246 (control) aur 5247 (data) use karta hai. Control channel hamesha DTLS-encrypted hai; data channel encryption optional hai. FlexConnect "saara data controller ko" rule ka exception hai.</p></div>

<div class="scn"><h4>Firewall jo port 5246 kha gaya</h4><p>Ek branch ko naya firewall mila. APs ko addresses mile aur woh controller ko ping kar sakte the, phir bhi join nahi hue. Firewall ke packet logs mein AP subnet se WLC ko UDP 5246 denied dikha. Rule set ICMP allow karta tha lekin CAPWAP nahi. UDP 5246 aur 5247 permit karne ke baad APs ek minute mein join ho gaye.</p><p><b>Seekh:</b> chalta hua ping yeh prove nahi karta ki tunnel ports khule hain.</p></div>

<div class="iv"><p class="q">"Split MAC aur do CAPWAP tunnels explain karo."</p><p>Split MAC 802.11 functions baantta hai: real-time frame work AP par rehta hai, management aur policy controller ke paas jaate hain. CAPWAP dono ko UDP par carry karta hai: control 5246 par, hamesha DTLS-protected, aur data 5247 par centrally switched client traffic ke liye. FlexConnect ko local switching ke roop mein aur MTU overhead ko practical cost ke roop mein mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Split MAC: AP real-time radio kaam karta hai, controller policy aur management.</li>
<li>CAPWAP control UDP 5246 DTLS ke saath; CAPWAP data UDP 5247.</li>
<li>Central switching client frames ko controller ke zariye policy VLAN par bhejti hai.</li>
<li>FlexConnect local switching yahan concept hai, lab mein simulate nahi hota. Aage aane wala module: wl-flex (FlexConnect).</li>
<li>Tunnel overhead usable MTU kam karta hai; block hue fragments ajeeb failures dete hain.</li>
</ul></div>
`}};export{e as default};