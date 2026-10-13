var e={id:`services-oob`,h:{en:`Closing unused services; out-of-band management and the management VLAN`,hi:`Unused services band karna; out-of-band management aur management VLAN`},body:{en:`
<p>A house with ten doors is harder to protect than a house with two. Every service a router runs is a door: a web server, a discovery protocol, an old diagnostic service. Hardening means closing every door you do not use, and building a separate, private corridor that only the maintenance staff use. That private corridor is <b>out-of-band management</b>.</p>

<h3>Part 1: shrinking the attack surface</h3>
<p>The <b>attack surface</b> is the set of services and protocols an attacker can reach. Before you disable anything, look at what the device is listening on:</p>
<pre class="out">EDGE# show control-plane host open-ports
Active internet connections (servers and established)
Prot        Local Address      Foreign Address                  Service    State
 tcp                 *:22                  *:0               SSH-Server   LISTEN
 tcp                 *:23                  *:0                   Telnet   LISTEN
<span class="hl"> tcp                 *:80                  *:0                HTTP CORE   LISTEN</span>
<span class="hl"> tcp                *:443                  *:0                HTTP CORE   LISTEN</span>
 udp                 *:67                  *:0            DHCPD Receive   LISTEN</pre>
<p>Port 80 and 443 mean the built-in web server is running although nobody uses it. Port 23 listening does not mean Telnet logins succeed (the VTY lines can still refuse them), but it is one more thing to explain to an auditor.</p>

<table class="cmp"><tr><th>Service</th><th>Risk</th><th>Command</th></tr>
<tr><td>Web server (HTTP/HTTPS)</td><td>Extra login page, past vulnerabilities</td><td><code>no ip h&#116;tp server</code>, <code>no ip h&#116;tp secure-server</code> (keep HTTPS only if you use the web UI or RESTCONF)</td></tr>
<tr><td>CDP / LLDP on edge links</td><td>Reveals model, IOS version, IP addresses to the neighbour</td><td>Interface: <code>no cdp enable</code>, <code>no lldp transmit</code>, <code>no lldp receive</code>; global: <code>no cdp run</code></td></tr>
<tr><td>IP source routing</td><td>Lets a sender choose the path through your network</td><td><code>no ip source-route</code></td></tr>
<tr><td>Proxy ARP</td><td>Router answers ARP for other networks, can hide misconfigurations</td><td>Interface: <code>no ip proxy-arp</code></td></tr>
<tr><td>BOOTP server</td><td>Legacy service, not needed</td><td><code>no ip bootp server</code></td></tr>
<tr><td>Unused interfaces</td><td>Someone plugs in and gets access</td><td><code>shutdown</code>, and on switches an unused VLAN</td></tr>
<tr><td>SNMPv1/v2c "public"</td><td>Clear-text community strings, often default</td><td>Remove defaults; use SNMPv3 (ccna-ops-services)</td></tr>
</table>
<p>Some older risky services, such as TCP/UDP small servers, finger and directed broadcast, are already off by default on modern IOS. Two helpful extras: <code>service tcp-keepalives-in</code> clears hung remote sessions so they do not occupy VTY lines, and <code>no ip domain lookup</code> stops a mistyped command from being treated as a hostname to resolve.</p>

<pre class="code">EDGE(config)# no ip h&#116;tp server
EDGE(config)# no ip h&#116;tp secure-server
EDGE(config)# no ip source-route
EDGE(config)# no ip bootp server
EDGE(config)# service tcp-keepalives-in
EDGE(config)# interface GigabitEthernet0/0          <span class="c">! internet-facing link</span>
EDGE(config-if)# no cdp enable
EDGE(config-if)# no lldp transmit
EDGE(config-if)# no lldp receive
EDGE(config-if)# no ip proxy-arp</pre>
<p>CDP and LLDP are useful inside the network (you used them in ccna-discovery), so disable them only on links to the ISP, customers, guests or anything you do not control. IOS also has an interactive <code>auto secure</code> wizard that applies many of these settings at once; it is worth knowing it exists, but in production you apply a reviewed template instead.</p>

<h3>Part 2: in-band versus out-of-band management</h3>
<p><b>In-band management</b> means your SSH, SNMP and syslog travel over the same network that carries user traffic. It is simple, but if a routing mistake or a broken link takes down the network, it also takes away your way in to fix it. <b>Out-of-band (OOB) management</b> uses a separate path that does not depend on the production network.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="In-band and out-of-band management">
<rect x="20" y="20" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">NOC</text>
<rect x="250" y="20" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">production net</text>
<rect x="490" y="90" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="112" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="555" y="129" text-anchor="middle" class="svg-muted" font-size="12">data ports</text>
<rect x="250" y="160" width="140" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">OOB switch or</text><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">console server</text>
<line x1="150" y1="43" x2="250" y2="43" stroke="#64748b" stroke-width="2"/><line x1="390" y1="43" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="66" x2="250" y2="183" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="390" y1="183" x2="540" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="200" y="30" text-anchor="middle" class="svg-muted" font-size="12">in-band</text>
<text x="470" y="185" text-anchor="middle" class="svg-accent" font-size="12">OOB: mgmt port / console</text>
</svg><p class="cap">Solid line: management shares the production path. Dashed line: a separate path that still works when production is broken.</p></div>

<table class="cmp"><tr><th>OOB method</th><th>How it works</th></tr>
<tr><td>Dedicated management port</td><td>Many devices have a port isolated from the data plane, often in its own VRF (for example <code>GigabitEthernet0/0</code> in <code>Mgmt-vrf</code> on Catalyst 9000, <code>mgmt0</code> on Nexus), cabled to a separate management switch</td></tr>
<tr><td>Console server</td><td>A box with many serial ports cabled to every device's console; you SSH to the console server, then reach any console even if the device has no IP connectivity</td></tr>
<tr><td>Cellular/LTE OOB</td><td>A console server with its own mobile uplink for sites where the WAN is down</td></tr>
</table>

<h3>The management VLAN on switches</h3>
<p>When a full OOB network is too expensive, the next best thing is a <b>dedicated management VLAN and subnet</b> inside the production network, separate from user VLANs and never VLAN 1. Only the NOC can route to it, and the VTY <code>access-class</code> permits only that subnet. In the lab, 10.99.99.0/24 is exactly that management subnet.</p>
<pre class="code">SW-NOC(config)# vlan 99
SW-NOC(config-vlan)# name MGMT
SW-NOC(config-vlan)# exit
SW-NOC(config)# interface vlan 99
SW-NOC(config-if)# ip address 10.99.99.2 255.255.255.0
SW-NOC(config-if)# no shutdown
SW-NOC(config-if)# interface vlan 1
SW-NOC(config-if)# shutdown                      <span class="c">! no management on VLAN 1</span>
SW-NOC(config-if)# exit
SW-NOC(config)# ip default-gateway 10.99.99.1</pre>
<p>On routers, a related habit is to source all management traffic from one stable address, usually a loopback, so ACLs and servers only need to trust one IP: <code>ip ssh source-interface Loopback0</code>, <code>logging source-interface Loopback0</code>, <code>ip tacacs source-interface Loopback0</code>.</p>

<div class="eg"><p><b>Worked example.</b> A switch has its management IP on VLAN 1 with every user port also in VLAN 1. Any user can ping it and attempt SSH. After moving management to VLAN 99 (10.99.99.2/24), shutting the VLAN 1 SVI and adding <code>access-class 15 in</code> for 10.99.99.0/24, users in VLAN 10 cannot even reach the address unless routing allows it, and even then the VTY lines refuse them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Disabling CDP globally and then losing the IP phone voice VLAN discovery that depends on it. Turning off the HTTPS server on a device that is managed by a controller or RESTCONF. Moving the management SVI to a new VLAN over SSH without a console fallback and cutting yourself off. Putting management on VLAN 1, the default VLAN of every port.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>no cdp run</code> is global, <code>no cdp enable</code> is per interface. LLDP needs both <code>transmit</code> and <code>receive</code> disabled to be fully off on an interface. OOB management uses a path separate from user traffic; a management VLAN is still in-band. A Layer 2 switch needs <code>ip default-gateway</code> to answer admins on other subnets.</p></div>

<div class="scn"><h4>The outage nobody could log in to fix</h4><p>An engineer pushed a wrong route map to a data center core pair during a change window. Routing to the NOC subnet disappeared, and with it every SSH session. The team had to drive 40 km to the site to use a console cable. Afterwards they installed console servers with LTE uplinks in each site and cabled every management port to a separate OOB switch. The next bad change was rolled back in six minutes from a console reached through the OOB network.</p><p><b>Lesson:</b> never depend only on the network you are changing to reach the device you are changing.</p></div>

<div class="iv"><p class="q">"What is the difference between in-band and out-of-band management, and which services would you disable on an edge router?"</p><p>Strong answer: in-band uses the production network, so it fails when production fails; OOB uses a separate path such as a dedicated management port, OOB switch or console server, often with LTE. On an edge router I disable the web server if unused, CDP and LLDP on the ISP-facing interface, IP source routing, proxy ARP on external interfaces, unused interfaces, and default SNMP communities, and I verify with <code>show control-plane host open-ports</code>. Mention a management VLAN that is not VLAN 1 and a loopback as the management source.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every running service is a door; check with <code>show control-plane host open-ports</code> and close what is unused.</li>
<li>Typical list: web server, CDP/LLDP on edge links, source routing, proxy ARP, BOOTP, unused ports, default SNMP.</li>
<li>OOB management uses a separate path (management port, OOB switch, console server) that survives production outages.</li>
<li>Use a dedicated management VLAN and subnet, never VLAN 1, and restrict VTY to it.</li>
<li>Source management traffic from a loopback so servers and ACLs trust one address.</li>
</ul></div>
`,hi:`
<p>Das darwazon wale ghar ko bachana do darwazon wale ghar se mushkil hai. Router par chalne wali har service ek darwaza hai: web server, discovery protocol, koi purani diagnostic service. Hardening ka matlab hai har woh darwaza band karna jo aap use nahi karte, aur ek alag, private corridor banana jise sirf maintenance staff use kare. Woh private corridor hai <b>out-of-band management</b>.</p>

<h3>Part 1: attack surface chhota karna</h3>
<p><b>Attack surface</b> un services aur protocols ka set hai jin tak attacker pahunch sakta hai. Kuch bhi disable karne se pehle dekho ki device kis par listen kar raha hai:</p>
<pre class="out">EDGE# show control-plane host open-ports
Active internet connections (servers and established)
Prot        Local Address      Foreign Address                  Service    State
 tcp                 *:22                  *:0               SSH-Server   LISTEN
 tcp                 *:23                  *:0                   Telnet   LISTEN
<span class="hl"> tcp                 *:80                  *:0                HTTP CORE   LISTEN</span>
<span class="hl"> tcp                *:443                  *:0                HTTP CORE   LISTEN</span>
 udp                 *:67                  *:0            DHCPD Receive   LISTEN</pre>
<p>Port 80 aur 443 ka matlab hai built-in web server chal raha hai jabki koi use use nahi karta. Port 23 ka listen karna yeh nahi batata ki Telnet logins succeed hote hain (VTY lines unhe phir bhi refuse kar sakti hain), lekin auditor ko samjhane ke liye yeh ek aur cheez hai.</p>

<table class="cmp"><tr><th>Service</th><th>Risk</th><th>Command</th></tr>
<tr><td>Web server (HTTP/HTTPS)</td><td>Extra login page, purani vulnerabilities</td><td><code>no ip h&#116;tp server</code>, <code>no ip h&#116;tp secure-server</code> (HTTPS sirf tab rakho jab web UI ya RESTCONF use karte ho)</td></tr>
<tr><td>Edge links par CDP / LLDP</td><td>Neighbour ko model, IOS version, IP addresses bata deta hai</td><td>Interface: <code>no cdp enable</code>, <code>no lldp transmit</code>, <code>no lldp receive</code>; global: <code>no cdp run</code></td></tr>
<tr><td>IP source routing</td><td>Sender ko aapke network ka path choose karne deta hai</td><td><code>no ip source-route</code></td></tr>
<tr><td>Proxy ARP</td><td>Router doosre networks ke liye ARP ka jawab deta hai, misconfigurations chhupa sakta hai</td><td>Interface: <code>no ip proxy-arp</code></td></tr>
<tr><td>BOOTP server</td><td>Legacy service, zaroorat nahi</td><td><code>no ip bootp server</code></td></tr>
<tr><td>Unused interfaces</td><td>Koi plug karke access le leta hai</td><td><code>shutdown</code>, aur switches par ek unused VLAN</td></tr>
<tr><td>SNMPv1/v2c "public"</td><td>Clear-text community strings, aksar default</td><td>Defaults hatao; SNMPv3 use karo (ccna-ops-services)</td></tr>
</table>
<p>Kuch purani risky services, jaise TCP/UDP small servers, finger aur directed broadcast, modern IOS par default mein pehle se band hain. Do helpful extras: <code>service tcp-keepalives-in</code> atke hue remote sessions saaf karta hai taaki woh VTY lines na ghere rahein, aur <code>no ip domain lookup</code> galat type ki gayi command ko resolve karne wala hostname maanne se rokta hai.</p>

<pre class="code">EDGE(config)# no ip h&#116;tp server
EDGE(config)# no ip h&#116;tp secure-server
EDGE(config)# no ip source-route
EDGE(config)# no ip bootp server
EDGE(config)# service tcp-keepalives-in
EDGE(config)# interface GigabitEthernet0/0          <span class="c">! internet ki taraf wala link</span>
EDGE(config-if)# no cdp enable
EDGE(config-if)# no lldp transmit
EDGE(config-if)# no lldp receive
EDGE(config-if)# no ip proxy-arp</pre>
<p>CDP aur LLDP network ke andar useful hain (aapne ccna-discovery mein use kiye), isliye unhe sirf ISP, customers, guests ya jo bhi aapke control mein nahi hai unke links par disable karo. IOS mein ek interactive <code>auto secure</code> wizard bhi hai jo inmein se kai settings ek saath lagata hai; yeh jaanna achha hai ki woh hai, lekin production mein aap reviewed template lagate ho.</p>

<h3>Part 2: in-band versus out-of-band management</h3>
<p><b>In-band management</b> ka matlab hai aapka SSH, SNMP aur syslog usi network par chalta hai jo user traffic le jaata hai. Yeh simple hai, lekin agar routing ki galti ya toota link network gira de, to use theek karne ka aapka raasta bhi chala jaata hai. <b>Out-of-band (OOB) management</b> ek alag path use karta hai jo production network par depend nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="In-band aur out-of-band management">
<rect x="20" y="20" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">NOC</text>
<rect x="250" y="20" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">production net</text>
<rect x="490" y="90" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="112" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="555" y="129" text-anchor="middle" class="svg-muted" font-size="12">data ports</text>
<rect x="250" y="160" width="140" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">OOB switch ya</text><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">console server</text>
<line x1="150" y1="43" x2="250" y2="43" stroke="#64748b" stroke-width="2"/><line x1="390" y1="43" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="66" x2="250" y2="183" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="390" y1="183" x2="540" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="200" y="30" text-anchor="middle" class="svg-muted" font-size="12">in-band</text>
<text x="470" y="185" text-anchor="middle" class="svg-accent" font-size="12">OOB: mgmt port / console</text>
</svg><p class="cap">Solid line: management production path share karta hai. Dashed line: alag path jo production toote hone par bhi chalta hai.</p></div>

<table class="cmp"><tr><th>OOB method</th><th>Kaise kaam karta hai</th></tr>
<tr><td>Dedicated management port</td><td>Kai devices mein data plane se isolated port hota hai, aksar apne VRF mein (jaise Catalyst 9000 par <code>Mgmt-vrf</code> mein <code>GigabitEthernet0/0</code>, Nexus par <code>mgmt0</code>), jo alag management switch se cabled hota hai</td></tr>
<tr><td>Console server</td><td>Bahut saare serial ports wala box jo har device ke console se cabled hota hai; aap console server par SSH karte ho, phir kisi bhi console tak pahunchte ho chahe device ki IP connectivity na ho</td></tr>
<tr><td>Cellular/LTE OOB</td><td>Apne mobile uplink wala console server, un sites ke liye jahan WAN down ho</td></tr>
</table>

<h3>Switches par management VLAN</h3>
<p>Jab poora OOB network bahut mehenga ho, to agla best option hai production network ke andar <b>dedicated management VLAN aur subnet</b>, user VLANs se alag aur kabhi VLAN 1 nahi. Sirf NOC usse route kar sakta hai, aur VTY <code>access-class</code> sirf us subnet ko permit karta hai. Lab mein 10.99.99.0/24 bilkul wahi management subnet hai.</p>
<pre class="code">SW-NOC(config)# vlan 99
SW-NOC(config-vlan)# name MGMT
SW-NOC(config-vlan)# exit
SW-NOC(config)# interface vlan 99
SW-NOC(config-if)# ip address 10.99.99.2 255.255.255.0
SW-NOC(config-if)# no shutdown
SW-NOC(config-if)# interface vlan 1
SW-NOC(config-if)# shutdown                      <span class="c">! VLAN 1 par management nahi</span>
SW-NOC(config-if)# exit
SW-NOC(config)# ip default-gateway 10.99.99.1</pre>
<p>Routers par ek related aadat hai saara management traffic ek stable address se source karna, aam taur par loopback, taaki ACLs aur servers ko sirf ek IP par trust karna pade: <code>ip ssh source-interface Loopback0</code>, <code>logging source-interface Loopback0</code>, <code>ip tacacs source-interface Loopback0</code>.</p>

<div class="eg"><p><b>Worked example.</b> Ek switch ka management IP VLAN 1 par hai aur har user port bhi VLAN 1 mein hai. Koi bhi user use ping kar sakta hai aur SSH try kar sakta hai. Management ko VLAN 99 (10.99.99.2/24) par le jaane, VLAN 1 SVI shut karne aur 10.99.99.0/24 ke liye <code>access-class 15 in</code> add karne ke baad, VLAN 10 ke users address tak pahunch bhi nahi sakte jab tak routing allow na kare, aur tab bhi VTY lines unhe refuse karti hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> CDP globally disable karna aur phir IP phone ki voice VLAN discovery kho dena jo uspar depend karti hai. Controller ya RESTCONF se manage hone wale device par HTTPS server band karna. Console fallback ke bina SSH par management SVI ko naye VLAN mein move karna aur khud ko kaat dena. Management ko VLAN 1 par rakhna, jo har port ka default VLAN hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>no cdp run</code> global hai, <code>no cdp enable</code> per interface. Interface par LLDP poori tarah band karne ke liye <code>transmit</code> aur <code>receive</code> dono disable karne padte hain. OOB management user traffic se alag path use karta hai; management VLAN abhi bhi in-band hai. Layer 2 switch ko doosre subnets ke admins ko jawab dene ke liye <code>ip default-gateway</code> chahiye.</p></div>

<div class="scn"><h4>Outage jise theek karne ke liye koi login nahi kar saka</h4><p>Ek engineer ne change window ke dauraan data center core pair par galat route map push kar diya. NOC subnet ki routing gayab ho gayi, aur uske saath har SSH session. Team ko console cable use karne ke liye 40 km door site tak gaadi chalani padi. Uske baad unhone har site mein LTE uplinks wale console servers lagaye aur har management port ko alag OOB switch se cable kiya. Agla galat change OOB network se pahunche console se chhe minute mein roll back ho gaya.</p><p><b>Seekh:</b> jis device ko aap badal rahe ho, us tak pahunchne ke liye kabhi sirf usi network par depend mat karo jise aap badal rahe ho.</p></div>

<div class="iv"><p class="q">"In-band aur out-of-band management mein kya farak hai, aur edge router par aap kaunsi services disable karoge?"</p><p>Strong answer: in-band production network use karta hai, isliye production fail hone par woh bhi fail hota hai; OOB alag path use karta hai jaise dedicated management port, OOB switch ya console server, aksar LTE ke saath. Edge router par main unused web server, ISP ki taraf wale interface par CDP aur LLDP, IP source routing, external interfaces par proxy ARP, unused interfaces, aur default SNMP communities disable karta hoon, aur <code>show control-plane host open-ports</code> se verify karta hoon. VLAN 1 ke alawa management VLAN aur management source ke roop mein loopback ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har chalti service ek darwaza hai; <code>show control-plane host open-ports</code> se check karo aur jo unused hai band karo.</li>
<li>Typical list: web server, edge links par CDP/LLDP, source routing, proxy ARP, BOOTP, unused ports, default SNMP.</li>
<li>OOB management alag path (management port, OOB switch, console server) use karta hai jo production outages jhel leta hai.</li>
<li>Dedicated management VLAN aur subnet use karo, kabhi VLAN 1 nahi, aur VTY ko usi tak restrict karo.</li>
<li>Management traffic loopback se source karo taaki servers aur ACLs ek address par trust karein.</li>
</ul></div>
`}};export{e as default};