var e={id:`new-encor-areas`,h:{en:`Security, wireless, assurance and automation at a glance: the new ENCOR areas`,hi:`Security, wireless, assurance aur automation ek nazar mein: naye ENCOR areas`},body:{en:`
<p>Go back to the office building. Twenty years ago it only needed corridors and lifts. Today it also has badge readers at every door that check with a central security desk (<b>802.1X and AAA</b>), invisible corridors through the air (<b>wireless</b>), cameras and sensors reporting to a control room (<b>assurance</b>), and a building-management system that changes the lighting on every floor from one screen (<b>controllers and automation</b>). These areas are where CCNA holders feel least prepared, and together they are more than half of ENCOR. This chapter gives you the map; later modules fill in each area.</p>

<h3>Security (20%)</h3>
<p><b>Device access.</b> Use <code>enable secret</code> and <code>username ... secret</code> (strong hashing), SSH version 2 only (<code>transport input ssh</code>), and centralised <b>AAA</b>: authentication (who are you), authorisation (what may you do), accounting (what did you do).</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Transport</td><td>UDP 1812/1813</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Password only</td><td>Entire payload</td></tr>
<tr><td>AAA functions</td><td>Authentication and authorisation combined</td><td>All three separated (per-command authorisation)</td></tr>
<tr><td>Typical use</td><td>Network access: 802.1X, VPN, wireless</td><td>Device administration</td></tr>
</table>
<pre class="code">WAN1(config)# aaa new-model
WAN1(config)# tacacs server ISE1
WAN1(config-server-tacacs)# address ipv4 10.10.20.30
WAN1(config-server-tacacs)# key Nk-Example-Key
WAN1(config-server-tacacs)# exit
WAN1(config)# aaa authentication login default group tacacs+ local
WAN1(config)# aaa authorization exec default group tacacs+ local</pre>
<p><b>Infrastructure security.</b> ACLs (standard, extended, named, with an implicit deny at the end) and <b>CoPP</b>, which rate-limits traffic punted to the CPU (remember chapter 3). <b>Endpoint access</b>: <b>802.1X</b> (supplicant, authenticator, authentication server; EAP over LAN between PC and switch, RADIUS between switch and server), <b>MAB</b> (MAC Authentication Bypass for printers and cameras) and <b>WebAuth</b>. <b>TrustSec</b> tags traffic with a Security Group Tag (SGT) so policy follows the user, not the IP; <b>MACsec</b> (802.1AE) encrypts hop by hop at Layer 2. You must also describe threat defense components such as next-generation firewalls and endpoint security.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="802.1X and controller automation">
<rect x="20" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="47" text-anchor="middle" class="svg-ink" font-size="12">Supplicant (PC)</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="12">Authenticator ACC1</text>
<rect x="480" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="47" text-anchor="middle" class="svg-ink" font-size="12">RADIUS server (ISE)</text>
<line x1="160" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/><text x="205" y="85" text-anchor="middle" class="svg-accent" font-size="12">EAPoL</text>
<line x1="390" y1="42" x2="480" y2="42" stroke="#64748b" stroke-width="2"/><text x="435" y="85" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<rect x="20" y="150" width="140" height="44" rx="8" fill="#fde68a"/><text x="90" y="177" text-anchor="middle" class="svg-ink" font-size="12">Python / Ansible</text>
<rect x="250" y="150" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="177" text-anchor="middle" class="svg-ink" font-size="12">Catalyst Center</text>
<rect x="480" y="150" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="177" text-anchor="middle" class="svg-ink" font-size="12">Switches, routers, APs</text>
<line x1="160" y1="172" x2="250" y2="172" stroke="#64748b" stroke-width="2"/><text x="205" y="215" text-anchor="middle" class="svg-accent" font-size="12">REST API, JSON</text>
<line x1="390" y1="172" x2="480" y2="172" stroke="#64748b" stroke-width="2"/><text x="435" y="215" text-anchor="middle" class="svg-accent" font-size="12">NETCONF, CLI</text>
<text x="320" y="242" text-anchor="middle" class="svg-muted" font-size="12">Top: who may connect. Bottom: who configures the network.</text>
</svg><p class="cap">Two patterns you will meet everywhere in ENCOR: the 802.1X three-party model and the controller sitting between scripts and devices.</p></div>

<h3>Wireless (inside Architecture, Infrastructure and Security)</h3>
<p>Know RF basics (2.4, 5 and 6 GHz bands, channels, dBm, RSSI, SNR, antenna types), <b>AP modes</b> (local, FlexConnect, monitor, sniffer, bridge/mesh), <b>deployment models</b> (centralised WLC, FlexConnect for branches, embedded controller on a Catalyst switch or AP, cloud-managed), how an AP discovers and joins a controller over <b>CAPWAP</b> (UDP 5246 control, 5247 data), Layer 2 and Layer 3 <b>roaming</b>, and WLAN security: WPA2/WPA3 Personal (PSK, SAE), Enterprise (802.1X/EAP) and WebAuth.</p>

<h3>Architecture overlays and QoS</h3>
<p><b>Catalyst SD-WAN</b> separates the management plane (SD-WAN Manager), control plane (SD-WAN Controller, running OMP), orchestration (SD-WAN Validator) and data plane (WAN Edge routers). <b>SD-Access</b> is a campus fabric managed by Catalyst Center with ISE for policy, built from edge, border and control-plane nodes. <b>QoS</b>: classify and mark (voice is DSCP EF, 46), queue (LLQ for voice), police (drop or re-mark excess) or shape (buffer excess).</p>

<h3>Network assurance (10%)</h3>
<p>Syslog severities 0 (emergency) to 7 (debug); SNMPv2c (community strings) versus SNMPv3 (authentication and encryption); NetFlow and Flexible NetFlow for who-talks-to-whom; SPAN, RSPAN and ERSPAN to copy traffic to an analyser; IP SLA to measure reachability, latency and jitter; conditional debugs; and Catalyst Center assurance workflows.</p>

<h3>Automation (15%)</h3>
<p>Python basics and <b>JSON</b> (objects in braces, arrays in square brackets, key-value pairs), <b>YANG</b> data models, <b>NETCONF</b> (SSH port 830, XML encoding, operations such as get-config and edit-config) and <b>RESTCONF</b> (HTTPS with JSON or XML, verbs GET, POST, PUT, PATCH, DELETE). REST response codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error. <b>EEM</b> runs small on-box scripts triggered by events. Orchestration tools: <b>Ansible</b> is agentless and pushes YAML playbooks over SSH or APIs; <b>Puppet</b> and <b>Chef</b> traditionally use agents that pull configuration.</p>
<pre class="out">{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/0/1",
    "description": "to CORE1",
    <span class="hl">"enabled": true,</span>
    "ietf-ip:ipv4": {
      "address": [ { "ip": "10.0.0.14", "netmask": "255.255.255.252" } ]
    }
  }
}</pre>
<p>That is what a RESTCONF GET on WAN1's inside interface returns: the same data as <code>show running-config interface</code>, but structured so a script can read it without screen-scraping.</p>
<pre class="code"><span class="c">! EEM: a tiny on-box automation on DIST1</span>
DIST1(config)# event manager applet UPLINK-DOWN
DIST1(config-applet)# event syslog pattern "TenGigabitEthernet1/0/1, changed state to down"
DIST1(config-applet)# action 1.0 syslog msg "Uplink to CORE1 down, HSRP should move to DIST2"</pre>

<div class="eg"><p><b>Worked example: reading a response code.</b> Your script sends a RESTCONF PATCH to change an interface description and gets 204. That is success with no body returned. If it gets 401, your credentials are wrong or missing; 403 means you authenticated but lack permission; 404 means the URL path to the YANG node is wrong; 400 means the JSON you sent does not match the model.</p></div>

<div class="warn"><p><b>Common mistake.</b> Studying automation as "learn Python" and ignoring data models. ENCOR asks far more about <b>what</b> the data looks like (JSON structure, YANG, which protocol uses which port and encoding) than about writing long programs.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ encrypts the whole body and separates the three A's; RADIUS encrypts only the password. NETCONF uses SSH port 830 and XML; RESTCONF uses HTTPS and JSON or XML. Ansible is agentless and push-based; Puppet and Chef are agent-based and pull-based.</p></div>

<div class="scn"><h4>The printer that could not log in</h4><p>After 802.1X was enabled on all access ports at NK Corp, every PC worked but a floor of printers went offline. <code>show access-session interface GigabitEthernet1/0/20 details</code> on ACC2 showed the dot1x method timing out: printers have no supplicant, so nothing answered the switch's EAP requests. The team configured the ports to fall back to <b>MAB</b> and added the printer MAC addresses to an endpoint group on the RADIUS server with a restricted policy.</p><p><b>Lesson:</b> 802.1X deployments need a plan for devices without a supplicant; MAB and profiling are part of the design, not an afterthought.</p></div>

<div class="iv"><p class="q">"What is the difference between NETCONF and RESTCONF?"</p><p>Strong answer: both are programmatic interfaces that read and change configuration and state described by YANG models. NETCONF runs over SSH (port 830), uses XML, supports transactions with candidate datastores, locking and commit. RESTCONF is REST over HTTPS, uses JSON or XML and standard verbs (GET, POST, PUT, PATCH, DELETE), and is easier to use from web tools and simple scripts. Mention that on IOS XE both are enabled with <code>netconf-yang</code> and <code>restconf</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security: AAA with RADIUS (UDP, network access) or TACACS+ (TCP 49, device admin), ACLs, CoPP, 802.1X/MAB/WebAuth, TrustSec, MACsec.</li>
<li>Wireless: RF basics, AP modes, deployment models, CAPWAP 5246/5247, roaming, WPA2/WPA3 PSK/SAE/Enterprise.</li>
<li>Overlays: SD-WAN (Manager, Controller, Validator, WAN Edge), SD-Access (Catalyst Center, ISE, fabric nodes); QoS marks voice EF 46.</li>
<li>Assurance: syslog 0 to 7, SNMPv3, NetFlow, SPAN/RSPAN/ERSPAN, IP SLA, conditional debug.</li>
<li>Automation: JSON, YANG, NETCONF (SSH 830, XML), RESTCONF (HTTPS, JSON), response codes, EEM, Ansible versus Puppet/Chef.</li>
</ul></div>
`,hi:`
<p>Office building par wapas chalo. Bees saal pehle use sirf corridors aur lifts chahiye the. Aaj uske har darwaze par badge readers bhi hain jo central security desk se check karte hain (<b>802.1X aur AAA</b>), hawa mein invisible corridors hain (<b>wireless</b>), cameras aur sensors control room ko report karte hain (<b>assurance</b>), aur ek building-management system hai jo ek screen se har floor ki lighting badal deta hai (<b>controllers aur automation</b>). Yahi woh areas hain jahan CCNA holders sabse kam taiyaar mehsoos karte hain, aur milkar yeh ENCOR ke aadhe se zyada hain. Yeh chapter aapko map deta hai; aage ke modules har area bharte hain.</p>

<h3>Security (20%)</h3>
<p><b>Device access.</b> <code>enable secret</code> aur <code>username ... secret</code> (strong hashing), sirf SSH version 2 (<code>transport input ssh</code>), aur centralised <b>AAA</b> use karo: authentication (aap kaun ho), authorisation (aap kya kar sakte ho), accounting (aapne kya kiya).</p>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Transport</td><td>UDP 1812/1813</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Sirf password</td><td>Poora payload</td></tr>
<tr><td>AAA functions</td><td>Authentication aur authorisation combined</td><td>Teeno alag (per-command authorisation)</td></tr>
<tr><td>Typical use</td><td>Network access: 802.1X, VPN, wireless</td><td>Device administration</td></tr>
</table>
<pre class="code">WAN1(config)# aaa new-model
WAN1(config)# tacacs server ISE1
WAN1(config-server-tacacs)# address ipv4 10.10.20.30
WAN1(config-server-tacacs)# key Nk-Example-Key
WAN1(config-server-tacacs)# exit
WAN1(config)# aaa authentication login default group tacacs+ local
WAN1(config)# aaa authorization exec default group tacacs+ local</pre>
<p><b>Infrastructure security.</b> ACLs (standard, extended, named, end mein implicit deny ke saath) aur <b>CoPP</b>, jo CPU ko punt hone wale traffic ko rate-limit karta hai (chapter 3 yaad karo). <b>Endpoint access</b>: <b>802.1X</b> (supplicant, authenticator, authentication server; PC aur switch ke beech EAP over LAN, switch aur server ke beech RADIUS), <b>MAB</b> (printers aur cameras ke liye MAC Authentication Bypass) aur <b>WebAuth</b>. <b>TrustSec</b> traffic ko Security Group Tag (SGT) se tag karta hai taaki policy IP ke bajaye user ke saath chale; <b>MACsec</b> (802.1AE) Layer 2 par hop by hop encrypt karta hai. Aapko threat defense components bhi describe karne hain, jaise next-generation firewalls aur endpoint security.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="802.1X and controller automation">
<rect x="20" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="47" text-anchor="middle" class="svg-ink" font-size="12">Supplicant (PC)</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="12">Authenticator ACC1</text>
<rect x="480" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="47" text-anchor="middle" class="svg-ink" font-size="12">RADIUS server (ISE)</text>
<line x1="160" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/><text x="205" y="85" text-anchor="middle" class="svg-accent" font-size="12">EAPoL</text>
<line x1="390" y1="42" x2="480" y2="42" stroke="#64748b" stroke-width="2"/><text x="435" y="85" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<rect x="20" y="150" width="140" height="44" rx="8" fill="#fde68a"/><text x="90" y="177" text-anchor="middle" class="svg-ink" font-size="12">Python / Ansible</text>
<rect x="250" y="150" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="177" text-anchor="middle" class="svg-ink" font-size="12">Catalyst Center</text>
<rect x="480" y="150" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="177" text-anchor="middle" class="svg-ink" font-size="12">Switches, routers, APs</text>
<line x1="160" y1="172" x2="250" y2="172" stroke="#64748b" stroke-width="2"/><text x="205" y="215" text-anchor="middle" class="svg-accent" font-size="12">REST API, JSON</text>
<line x1="390" y1="172" x2="480" y2="172" stroke="#64748b" stroke-width="2"/><text x="435" y="215" text-anchor="middle" class="svg-accent" font-size="12">NETCONF, CLI</text>
<text x="320" y="242" text-anchor="middle" class="svg-muted" font-size="12">Upar: kaun connect kar sakta hai. Neeche: network kaun configure karta hai.</text>
</svg><p class="cap">Do patterns jo aapko ENCOR mein har jagah milenge: 802.1X three-party model aur scripts aur devices ke beech baitha controller.</p></div>

<h3>Wireless (Architecture, Infrastructure aur Security ke andar)</h3>
<p>RF basics jaano (2.4, 5 aur 6 GHz bands, channels, dBm, RSSI, SNR, antenna types), <b>AP modes</b> (local, FlexConnect, monitor, sniffer, bridge/mesh), <b>deployment models</b> (centralised WLC, branches ke liye FlexConnect, Catalyst switch ya AP par embedded controller, cloud-managed), AP <b>CAPWAP</b> (UDP 5246 control, 5247 data) par controller ko kaise discover aur join karta hai, Layer 2 aur Layer 3 <b>roaming</b>, aur WLAN security: WPA2/WPA3 Personal (PSK, SAE), Enterprise (802.1X/EAP) aur WebAuth.</p>

<h3>Architecture overlays aur QoS</h3>
<p><b>Catalyst SD-WAN</b> management plane (SD-WAN Manager), control plane (SD-WAN Controller, OMP chalata hai), orchestration (SD-WAN Validator) aur data plane (WAN Edge routers) ko alag karta hai. <b>SD-Access</b> Catalyst Center se managed campus fabric hai jisme policy ke liye ISE hai, edge, border aur control-plane nodes se bana. <b>QoS</b>: classify aur mark karo (voice DSCP EF, 46 hai), queue karo (voice ke liye LLQ), police karo (excess drop ya re-mark) ya shape karo (excess buffer).</p>

<h3>Network assurance (10%)</h3>
<p>Syslog severities 0 (emergency) se 7 (debug); SNMPv2c (community strings) versus SNMPv3 (authentication aur encryption); kaun kisse baat karta hai ke liye NetFlow aur Flexible NetFlow; traffic ko analyser tak copy karne ke liye SPAN, RSPAN aur ERSPAN; reachability, latency aur jitter measure karne ke liye IP SLA; conditional debugs; aur Catalyst Center assurance workflows.</p>

<h3>Automation (15%)</h3>
<p>Python basics aur <b>JSON</b> (braces mein objects, square brackets mein arrays, key-value pairs), <b>YANG</b> data models, <b>NETCONF</b> (SSH port 830, XML encoding, get-config aur edit-config jaise operations) aur <b>RESTCONF</b> (JSON ya XML ke saath HTTPS, verbs GET, POST, PUT, PATCH, DELETE). REST response codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error. <b>EEM</b> events se trigger hone wale chhote on-box scripts chalata hai. Orchestration tools: <b>Ansible</b> agentless hai aur SSH ya APIs par YAML playbooks push karta hai; <b>Puppet</b> aur <b>Chef</b> traditionally agents use karte hain jo configuration pull karte hain.</p>
<pre class="out">{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/0/1",
    "description": "to CORE1",
    <span class="hl">"enabled": true,</span>
    "ietf-ip:ipv4": {
      "address": [ { "ip": "10.0.0.14", "netmask": "255.255.255.252" } ]
    }
  }
}</pre>
<p>WAN1 ke inside interface par RESTCONF GET yahi return karta hai: <code>show running-config interface</code> jaisa hi data, par structured taaki script use bina screen-scraping ke padh sake.</p>
<pre class="code"><span class="c">! EEM: DIST1 par ek chhota on-box automation</span>
DIST1(config)# event manager applet UPLINK-DOWN
DIST1(config-applet)# event syslog pattern "TenGigabitEthernet1/0/1, changed state to down"
DIST1(config-applet)# action 1.0 syslog msg "Uplink to CORE1 down, HSRP should move to DIST2"</pre>

<div class="eg"><p><b>Worked example: response code padhna.</b> Aapki script interface description badalne ke liye RESTCONF PATCH bhejti hai aur 204 paati hai. Yeh success hai, bina body ke. Agar 401 mile, to aapke credentials galat ya missing hain; 403 ka matlab aap authenticate ho gaye par permission nahi hai; 404 ka matlab YANG node tak URL path galat hai; 400 ka matlab jo JSON aapne bheja woh model se match nahi karta.</p></div>

<div class="warn"><p><b>Common galti.</b> Automation ko "Python seekho" ki tarah padhna aur data models ignore karna. ENCOR lambe programs likhne se kahin zyada is baare mein poochta hai ki data <b>kaisa</b> dikhta hai (JSON structure, YANG, kaunsa protocol kaunsa port aur encoding use karta hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ poori body encrypt karta hai aur teen A's alag karta hai; RADIUS sirf password encrypt karta hai. NETCONF SSH port 830 aur XML use karta hai; RESTCONF HTTPS aur JSON ya XML use karta hai. Ansible agentless aur push-based hai; Puppet aur Chef agent-based aur pull-based hain.</p></div>

<div class="scn"><h4>Printer jo login nahi kar paaya</h4><p>NK Corp mein saare access ports par 802.1X enable hone ke baad, har PC chala par ek floor ke printers offline ho gaye. ACC2 par <code>show access-session interface GigabitEthernet1/0/20 details</code> ne dot1x method ko time out hote dikhaya: printers mein supplicant nahi hota, isliye switch ke EAP requests ka kisi ne jawab nahi diya. Team ne ports ko <b>MAB</b> par fall back karne ke liye configure kiya aur printer MAC addresses ko RADIUS server par restricted policy wale endpoint group mein joda.</p><p><b>Seekh:</b> 802.1X deployments ko bina supplicant wale devices ke liye plan chahiye; MAB aur profiling design ka hissa hain, baad ka khayal nahi.</p></div>

<div class="iv"><p class="q">"NETCONF aur RESTCONF mein kya fark hai?"</p><p>Strong answer: dono programmatic interfaces hain jo YANG models se described configuration aur state padhte aur badalte hain. NETCONF SSH (port 830) par chalta hai, XML use karta hai, candidate datastores, locking aur commit ke saath transactions support karta hai. RESTCONF HTTPS par REST hai, JSON ya XML aur standard verbs (GET, POST, PUT, PATCH, DELETE) use karta hai, aur web tools aur simple scripts se use karna aasaan hai. Mention karo ki IOS XE par dono <code>netconf-yang</code> aur <code>restconf</code> se enable hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security: RADIUS (UDP, network access) ya TACACS+ (TCP 49, device admin) ke saath AAA, ACLs, CoPP, 802.1X/MAB/WebAuth, TrustSec, MACsec.</li>
<li>Wireless: RF basics, AP modes, deployment models, CAPWAP 5246/5247, roaming, WPA2/WPA3 PSK/SAE/Enterprise.</li>
<li>Overlays: SD-WAN (Manager, Controller, Validator, WAN Edge), SD-Access (Catalyst Center, ISE, fabric nodes); QoS voice ko EF 46 mark karta hai.</li>
<li>Assurance: syslog 0 se 7, SNMPv3, NetFlow, SPAN/RSPAN/ERSPAN, IP SLA, conditional debug.</li>
<li>Automation: JSON, YANG, NETCONF (SSH 830, XML), RESTCONF (HTTPS, JSON), response codes, EEM, Ansible versus Puppet/Chef.</li>
</ul></div>
`}};export{e as default};