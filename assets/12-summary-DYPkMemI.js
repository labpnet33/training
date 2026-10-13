var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a box of APs that could not find anything and a controller with only a management address. You can now take them all the way to working, secure staff, corporate and guest WLANs, and troubleshoot them when they break. Like a pilot's pre-flight checklist, this chapter condenses the whole module into lists you can run through before a lab, an interview or the exam.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Compare autonomous, split-MAC (lightweight + WLC), cloud-managed, FlexConnect and embedded wireless controller designs.</li>
<li>State which 802.11 functions stay on the AP and which move to the WLC.</li>
<li>Explain CAPWAP: control UDP 5246 (DTLS), data UDP 5247, and the join states up to RUN.</li>
<li>List the AP discovery methods and build DHCP option 43 in hex for one or two controllers.</li>
<li>Troubleshoot an AP that will not join: power, DHCP, controller address, routing, filters, WLC log.</li>
<li>Distinguish WLC ports (DS, service, redundancy, console) from interfaces (management, virtual, service-port, dynamic).</li>
<li>Configure the switch: access port for local-mode APs, trunk for FlexConnect and the WLC, static LAG with mode on.</li>
<li>Create a WLAN in the GUI (General, Security, QoS, Advanced) and in the CLI, and map it to a dynamic interface.</li>
<li>Configure WPA2-PSK, WPA3-SAE and WPA2-Enterprise with a RADIUS server.</li>
<li>Build an isolated guest WLAN and secure management access with HTTPS, SSH and TACACS+.</li>
<li>Run the five-rung troubleshooting ladder and fix the "guest clients on the wrong VLAN" ticket.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="End to end path of a wireless client">
<rect x="10" y="70" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="57" y="100" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="130" y="70" width="95" height="50" rx="8" fill="#fed7aa"/><text x="177" y="93" text-anchor="middle" class="svg-ink" font-size="12">AP</text><text x="177" y="110" text-anchor="middle" class="svg-muted" font-size="12">access port</text>
<rect x="250" y="70" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="305" y="93" text-anchor="middle" class="svg-ink" font-size="12">WLC</text><text x="305" y="110" text-anchor="middle" class="svg-muted" font-size="12">WLAN to intf</text>
<rect x="385" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="440" y="93" text-anchor="middle" class="svg-ink" font-size="12">Switch</text><text x="440" y="110" text-anchor="middle" class="svg-muted" font-size="12">trunk VLAN</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="93" text-anchor="middle" class="svg-ink" font-size="12">Router</text><text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">DHCP, ACL</text>
<line x1="105" y1="95" x2="130" y2="95" stroke="#64748b" stroke-width="2"/><line x1="225" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="360" y1="95" x2="385" y2="95" stroke="#64748b" stroke-width="3"/><line x1="495" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="3"/>
<text x="117" y="60" text-anchor="middle" class="svg-accent" font-size="12">WPA2/3</text><text x="237" y="60" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP</text><text x="372" y="60" text-anchor="middle" class="svg-accent" font-size="12">802.1Q</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">every link in this chain appeared in a lab; every break in it is a ticket type</text>
</svg><p class="cap">The whole module on one line: radio security, CAPWAP tunnel, WLAN-to-VLAN mapping, trunk, gateway.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WLC</dt><dd>Wireless LAN controller: central brain for lightweight APs.</dd>
<dt>Split-MAC</dt><dd>802.11 real-time functions on the AP, management functions on the WLC.</dd>
<dt>CAPWAP</dt><dd>AP-to-WLC protocol over UDP: 5246 control (DTLS), 5247 data.</dd>
<dt>FlexConnect</dt><dd>AP mode for branches: local switching, survives WAN loss.</dd>
<dt>EWC</dt><dd>Embedded Wireless Controller: controller software running on an AP.</dd>
<dt>Option 43</dt><dd>DHCP option carrying WLC addresses to APs (TLV f1, 04 per address).</dd>
<dt>Dynamic interface</dt><dd>WLC logical interface per client VLAN; WLANs map to it.</dd>
<dt>Virtual interface</dt><dd>Non-routable WLC address (192.0.2.1) for web auth and DHCP relay.</dd>
<dt>LAG</dt><dd>Bundle of all WLC DS ports; static mode on only.</dd>
<dt>SAE</dt><dd>WPA3-Personal key exchange; resists offline dictionary attacks.</dd>
<dt>AAA override</dt><dd>Lets RADIUS assign a VLAN or ACL per user.</dd>
<dt>TACACS+</dt><dd>TCP 49 AAA for device administration, whole payload encrypted.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>CAPWAP ports</td><td>UDP 5246 control (always DTLS), UDP 5247 data</td></tr>
<tr><td>AP port (local mode)</td><td>Access port, AP VLAN</td></tr>
<tr><td>WLC port</td><td>802.1Q trunk; LAG = mode on (no LACP/PAgP)</td></tr>
<tr><td>AP discovery</td><td>Static, primed, DHCP option 43, DNS CISCO-CAPWAP-CONTROLLER, broadcast</td></tr>
<tr><td>Client VLAN decided by</td><td>The interface the WLAN is mapped to (General tab)</td></tr>
<tr><td>New WLAN default</td><td>Disabled, WPA2 + 802.1X</td></tr>
<tr><td>QoS profiles</td><td>Platinum voice, Gold video, Silver best effort, Bronze background</td></tr>
<tr><td>WPA3-Personal</td><td>SAE, PMF required</td></tr>
<tr><td>802.1X roles</td><td>Supplicant client, authenticator WLC, server RADIUS (UDP 1812/1813)</td></tr>
<tr><td>Device admin AAA</td><td>TACACS+ TCP 49; disable Telnet and HTTP</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! R1: controller discovery</span>
ip dhcp pool AP-POOL
 option 43 hex f104.0a0a.630a
<span class="c">! WLC: interface, WLAN, security</span>
config interface create staff 20
config interface address dynamic-interface staff 10.10.20.5 255.255.255.0 10.10.20.1
config interface vlan guest 30
config wlan create 1 STAFF NK-STAFF
config wlan interface 1 staff
config wlan security wpa akm 802.1x disable 1
config wlan security wpa akm psk enable 1
config wlan security wpa akm psk set-key ascii NkStaff2024 1
config wlan broadcast-ssid enable 1
config wlan enable 1
config radius auth add 1 10.10.50.20 1812 ascii NkRadius1
config wlan radius_server auth add 2 1
<span class="c">! WLC: verification</span>
show ap summary
show wlan summary
show wlan 1
show interface summary
show client summary
show radius summary
show msglog</pre>

<div class="eg"><p><b>Worked example: a five-minute self-test.</b> Without notes, write: the option 43 value for a controller at 10.10.99.12 (answer: <code>f104.0a0a.630c</code>); the switch mode for the WLC's two DS ports (trunk, <code>channel-group 1 mode on</code>); the tab where you set the WLAN's interface (General); the two commands that turn a new WLAN into WPA2-PSK (disable AKM 802.1X, enable AKM PSK, plus set-key); and the first command you run when guests are in the wrong subnet (<code>show wlan &lt;id&gt;</code>, look at Interface).</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Mixing up ports and interfaces. Saying CAPWAP uses TCP. Putting a local-mode AP on a trunk "because it serves many VLANs". Forgetting to enable the WLAN. Registering the wrong WLC IP on the RADIUS server. Calling a hidden SSID a security feature.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Read GUI screenshots carefully: Interface is on General, PSK/802.1X/SAE on Security &gt; Layer 2, RADIUS servers on Security &gt; AAA Servers, Platinum to Bronze on QoS, session timeout and AAA override on Advanced. Option 43 is for APs, option 150 for phones. TACACS+ for admins, RADIUS for users.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a network engineer role was asked: "A new branch has five APs and no controller on site. The head office has two WLCs. Design the wireless." She drew the head-office WLCs, wrote CAPWAP UDP 5246/5247 across the WAN, and chose FlexConnect with local switching so the branch survives WAN outages, with the AP ports as trunks (native VLAN = AP VLAN). She added option 43 with both controller addresses, a staff WLAN with WPA2/WPA3-Enterprise using RADIUS, a guest WLAN in its own VLAN with an internet-only ACL, and management over HTTPS/SSH with TACACS+. She also mentioned an EWC as the alternative if WAN latency was too high. She got the job.</p><p><b>Lesson:</b> the topics of this module fit together into one design story. Practise telling it end to end.</p></div>

<div class="iv"><p class="q">"Walk me through what happens from the moment a new lightweight AP is plugged in until a user browses the web through it."</p><p>Strong answer: the AP gets PoE and a DHCP address in the AP VLAN, learns the WLC from option 43 (or DNS, priming, broadcast), sends CAPWAP discovery, builds DTLS on UDP 5246, joins, downloads image and config, and reaches RUN. It beacons the enabled WLANs. The user associates and authenticates (PSK/SAE or 802.1X via RADIUS). Client frames go over CAPWAP UDP 5247 to the WLC, which places them on the WLAN's dynamic interface VLAN over its trunk. DHCP gives the user an address from that VLAN's pool, and the gateway routes it out, applying any ACL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Architecture: split-MAC with CAPWAP; FlexConnect and EWC for branches.</li>
<li>Join: IP first, then controller address (option 43 f1-04-IP), then DTLS, join, config, RUN.</li>
<li>Ports are physical, interfaces logical; the WLAN-to-interface mapping sets the client VLAN.</li>
<li>Security: PSK/SAE for small or IoT, 802.1X with RADIUS for corporate, isolated VLAN plus ACL for guests.</li>
<li>Protect the controller: HTTPS, SSH, TACACS+; troubleshoot with the five-rung ladder.</li>
</ul></div>
`,hi:`
<p>Aapne APs ke ek dabbe se shuru kiya tha jo kuch nahi dhoondh paate the, aur ek controller jiske paas sirf management address tha. Ab aap unhe working, secure staff, corporate aur guest WLANs tak le ja sakte ho, aur toote to troubleshoot kar sakte ho. Pilot ki pre-flight checklist ki tarah, yeh chapter poore module ko lists mein nichod deta hai jinhe aap lab, interview ya exam se pehle dekh sakte ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Autonomous, split-MAC (lightweight + WLC), cloud-managed, FlexConnect aur embedded wireless controller designs compare karo.</li>
<li>Batao kaunse 802.11 functions AP par rehte hain aur kaunse WLC par jaate hain.</li>
<li>CAPWAP samjhao: control UDP 5246 (DTLS), data UDP 5247, aur RUN tak ke join states.</li>
<li>AP discovery methods list karo aur ek ya do controllers ke liye DHCP option 43 hex mein banao.</li>
<li>Join na karne wale AP ko troubleshoot karo: power, DHCP, controller address, routing, filters, WLC log.</li>
<li>WLC ports (DS, service, redundancy, console) ko interfaces (management, virtual, service-port, dynamic) se alag karo.</li>
<li>Switch configure karo: local-mode APs ke liye access port, FlexConnect aur WLC ke liye trunk, mode on ke saath static LAG.</li>
<li>GUI (General, Security, QoS, Advanced) aur CLI mein WLAN banao, aur use dynamic interface se map karo.</li>
<li>WPA2-PSK, WPA3-SAE aur RADIUS server ke saath WPA2-Enterprise configure karo.</li>
<li>Isolated guest WLAN banao aur HTTPS, SSH aur TACACS+ se management access secure karo.</li>
<li>Paanch-seedhi troubleshooting ladder chalao aur "guest clients on the wrong VLAN" ticket fix karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Wireless client ka end to end path">
<rect x="10" y="70" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="57" y="100" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="130" y="70" width="95" height="50" rx="8" fill="#fed7aa"/><text x="177" y="93" text-anchor="middle" class="svg-ink" font-size="12">AP</text><text x="177" y="110" text-anchor="middle" class="svg-muted" font-size="12">access port</text>
<rect x="250" y="70" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="305" y="93" text-anchor="middle" class="svg-ink" font-size="12">WLC</text><text x="305" y="110" text-anchor="middle" class="svg-muted" font-size="12">WLAN se intf</text>
<rect x="385" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="440" y="93" text-anchor="middle" class="svg-ink" font-size="12">Switch</text><text x="440" y="110" text-anchor="middle" class="svg-muted" font-size="12">trunk VLAN</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="93" text-anchor="middle" class="svg-ink" font-size="12">Router</text><text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">DHCP, ACL</text>
<line x1="105" y1="95" x2="130" y2="95" stroke="#64748b" stroke-width="2"/><line x1="225" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="360" y1="95" x2="385" y2="95" stroke="#64748b" stroke-width="3"/><line x1="495" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="3"/>
<text x="117" y="60" text-anchor="middle" class="svg-accent" font-size="12">WPA2/3</text><text x="237" y="60" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP</text><text x="372" y="60" text-anchor="middle" class="svg-accent" font-size="12">802.1Q</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">is chain ki har kadi ek lab mein aayi; har tootan ek ticket type hai</text>
</svg><p class="cap">Poora module ek line mein: radio security, CAPWAP tunnel, WLAN-to-VLAN mapping, trunk, gateway.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WLC</dt><dd>Wireless LAN controller: lightweight APs ka central dimaag.</dd>
<dt>Split-MAC</dt><dd>802.11 real-time functions AP par, management functions WLC par.</dd>
<dt>CAPWAP</dt><dd>UDP par AP-to-WLC protocol: 5246 control (DTLS), 5247 data.</dd>
<dt>FlexConnect</dt><dd>Branches ke liye AP mode: local switching, WAN loss jhel leta hai.</dd>
<dt>EWC</dt><dd>Embedded Wireless Controller: AP par chalta controller software.</dd>
<dt>Option 43</dt><dd>DHCP option jo APs tak WLC addresses le jaata hai (TLV f1, har address ke liye 04).</dd>
<dt>Dynamic interface</dt><dd>Har client VLAN ke liye WLC logical interface; WLANs isse map hote hain.</dd>
<dt>Virtual interface</dt><dd>Web auth aur DHCP relay ke liye non-routable WLC address (192.0.2.1).</dd>
<dt>LAG</dt><dd>Saare WLC DS ports ka bundle; sirf static mode on.</dd>
<dt>SAE</dt><dd>WPA3-Personal key exchange; offline dictionary attacks rokta hai.</dd>
<dt>AAA override</dt><dd>RADIUS ko har user ke liye VLAN ya ACL assign karne deta hai.</dd>
<dt>TACACS+</dt><dd>Device administration ke liye TCP 49 AAA, poora payload encrypted.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>CAPWAP ports</td><td>UDP 5246 control (hamesha DTLS), UDP 5247 data</td></tr>
<tr><td>AP port (local mode)</td><td>Access port, AP VLAN</td></tr>
<tr><td>WLC port</td><td>802.1Q trunk; LAG = mode on (LACP/PAgP nahi)</td></tr>
<tr><td>AP discovery</td><td>Static, primed, DHCP option 43, DNS CISCO-CAPWAP-CONTROLLER, broadcast</td></tr>
<tr><td>Client VLAN kaun tay karta hai</td><td>Woh interface jisse WLAN mapped hai (General tab)</td></tr>
<tr><td>Naye WLAN ka default</td><td>Disabled, WPA2 + 802.1X</td></tr>
<tr><td>QoS profiles</td><td>Platinum voice, Gold video, Silver best effort, Bronze background</td></tr>
<tr><td>WPA3-Personal</td><td>SAE, PMF zaroori</td></tr>
<tr><td>802.1X roles</td><td>Supplicant client, authenticator WLC, server RADIUS (UDP 1812/1813)</td></tr>
<tr><td>Device admin AAA</td><td>TACACS+ TCP 49; Telnet aur HTTP disable karo</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! R1: controller discovery</span>
ip dhcp pool AP-POOL
 option 43 hex f104.0a0a.630a
<span class="c">! WLC: interface, WLAN, security</span>
config interface create staff 20
config interface address dynamic-interface staff 10.10.20.5 255.255.255.0 10.10.20.1
config interface vlan guest 30
config wlan create 1 STAFF NK-STAFF
config wlan interface 1 staff
config wlan security wpa akm 802.1x disable 1
config wlan security wpa akm psk enable 1
config wlan security wpa akm psk set-key ascii NkStaff2024 1
config wlan broadcast-ssid enable 1
config wlan enable 1
config radius auth add 1 10.10.50.20 1812 ascii NkRadius1
config wlan radius_server auth add 2 1
<span class="c">! WLC: verification</span>
show ap summary
show wlan summary
show wlan 1
show interface summary
show client summary
show radius summary
show msglog</pre>

<div class="eg"><p><b>Worked example: paanch minute ka self-test.</b> Bina notes ke likho: 10.10.99.12 wale controller ke liye option 43 value (answer: <code>f104.0a0a.630c</code>); WLC ke do DS ports ke liye switch mode (trunk, <code>channel-group 1 mode on</code>); woh tab jahan WLAN ka interface set karte ho (General); woh commands jo naye WLAN ko WPA2-PSK banati hain (AKM 802.1X disable, AKM PSK enable, plus set-key); aur guests galat subnet mein hon to pehli command (<code>show wlan &lt;id&gt;</code>, Interface dekho).</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> Ports aur interfaces mix karna. Kehna ki CAPWAP TCP use karta hai. Local-mode AP ko trunk par lagana "kyunki woh kai VLANs serve karta hai". WLAN enable karna bhoolna. RADIUS server par galat WLC IP register karna. Hidden SSID ko security feature kehna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> GUI screenshots dhyan se padho: Interface General par, PSK/802.1X/SAE Security &gt; Layer 2 par, RADIUS servers Security &gt; AAA Servers par, Platinum se Bronze QoS par, session timeout aur AAA override Advanced par. Option 43 APs ke liye, option 150 phones ke liye. Admins ke liye TACACS+, users ke liye RADIUS.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Network engineer role ki ek candidate se poocha gaya: "Ek nayi branch mein paanch APs hain aur site par koi controller nahi. Head office mein do WLCs hain. Wireless design karo." Usne head-office WLCs draw kiye, WAN ke paar CAPWAP UDP 5246/5247 likha, aur local switching ke saath FlexConnect chuna taaki branch WAN outages jhel sake, AP ports trunks ke saath (native VLAN = AP VLAN). Usne dono controller addresses ke saath option 43 joda, RADIUS use karta WPA2/WPA3-Enterprise wala staff WLAN, apne VLAN mein internet-only ACL wala guest WLAN, aur TACACS+ ke saath HTTPS/SSH par management. Usne yeh bhi bataya ki agar WAN latency zyada ho to EWC alternative hai. Use job mil gayi.</p><p><b>Seekh:</b> is module ke topics ek design story mein fit hote hain. Use end to end sunane ki practice karo.</p></div>

<div class="iv"><p class="q">"Naya lightweight AP plug hone se le kar user ke uske through web browse karne tak kya hota hai, step by step batao."</p><p>Strong answer: AP ko PoE aur AP VLAN mein DHCP address milta hai, option 43 (ya DNS, priming, broadcast) se WLC seekhta hai, CAPWAP discovery bhejta hai, UDP 5246 par DTLS banata hai, join karta hai, image aur config download karta hai, aur RUN tak pahunchta hai. Woh enabled WLANs beacon karta hai. User associate aur authenticate karta hai (PSK/SAE ya RADIUS ke through 802.1X). Client frames CAPWAP UDP 5247 par WLC tak jaate hain, jo unhe apne trunk par WLAN ke dynamic interface VLAN mein daalta hai. DHCP user ko us VLAN ke pool se address deta hai, aur gateway use bahar route karta hai, koi ACL ho to lagate hue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Architecture: CAPWAP ke saath split-MAC; branches ke liye FlexConnect aur EWC.</li>
<li>Join: pehle IP, phir controller address (option 43 f1-04-IP), phir DTLS, join, config, RUN.</li>
<li>Ports physical hain, interfaces logical; WLAN-to-interface mapping client VLAN set karti hai.</li>
<li>Security: chhote ya IoT ke liye PSK/SAE, corporate ke liye RADIUS ke saath 802.1X, guests ke liye isolated VLAN plus ACL.</li>
<li>Controller ko protect karo: HTTPS, SSH, TACACS+; paanch-seedhi ladder se troubleshoot karo.</li>
</ul></div>
`}};export{e as default};