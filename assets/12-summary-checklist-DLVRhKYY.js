var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Think of this chapter as the packing list the night before a trip. You have covered a lot: platforms (Catalyst Center, SD-Access, Spaces, Meraki, EWC), location science, and the hands-on API skills on the 9800. Use the checklist to find gaps, the glossary to fix vocabulary, and the cheat sheet to rehearse commands. Remember the honesty rule: hands-on means labs 1 to 5; everything else in this module is concept only.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Platforms (concept)</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center, SDA, Meraki, EWC</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Location (concept + lab 4)</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">RSSI, trilateration, Spaces</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Programmability (labs 1,2,5)</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="12">YANG, RESTCONF, Python</text>
<rect x="120" y="120" width="400" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="14">9800 controller: one source of truth</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">lab 3 readiness checks sit between the two</text>
<line x1="105" y1="80" x2="220" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="535" y1="80" x2="420" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Everything in the module sits on or around the controller's single configuration.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why automate wireless: scale, consistency, audit, recovery.</li>
<li>Describe Catalyst Center: inventory, discovery, site hierarchy, network settings, wireless design, provisioning, assurance.</li>
<li>List the 9800 readiness items: user, SSH v2 (domain name, RSA), secure web with local auth, netconf-yang, NTP, DNS, SNMP, and TCP 22, 443, 830.</li>
<li>Explain day-0 versus day-N and what a template with variables renders.</li>
<li>Explain assurance: scores, baselines, issues, Client 360, Intelligent Capture.</li>
<li>Describe SD-Access wireless: fabric WLC (control only), fabric AP, edge, LISP, VXLAN, VN, SGT, anycast gateway.</li>
<li>Calculate distance from RSSI with the log-distance formula and solve a three-AP trilateration.</li>
<li>Name BLE, FastLocate and Hyperlocation and what each adds.</li>
<li>Bring up the Spaces connector and diagnose Inactive (clock, DNS, route); label AP locations.</li>
<li>Choose between controller, Meraki and EWC with reasons.</li>
<li>Enable RESTCONF and NETCONF; GET and PATCH a WLAN; explain the 409 rule.</li>
<li>Read 401, 403, 404, 405, 409 and refused connections and fix them in order.</li>
<li>Write and debug a Python requests script with safe habits.</li>
<li>Explain model-driven telemetry, dial-in versus dial-out, and gNMI.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Catalyst Center</dt><dd>Cisco's network controller platform (formerly DNA Center) for design, provisioning and assurance.</dd>
<dt>PnP</dt><dd>Plug and Play, zero-touch day-0 onboarding.</dd>
<dt>Assurance</dt><dd>Health scores, issues and baselines for clients, APs and controllers.</dd>
<dt>Fabric</dt><dd>The SD-Access overlay: VXLAN data plane, LISP control plane.</dd>
<dt>VN and SGT</dt><dd>Virtual network (macro segment) and Scalable Group Tag (micro segment label).</dd>
<dt>RSSI</dt><dd>Received signal strength indicator in dBm.</dd>
<dt>Trilateration</dt><dd>Position from distances to three or more known points.</dd>
<dt>NMSP</dt><dd>Network Mobility Services Protocol, carries location data to Spaces.</dd>
<dt>YANG</dt><dd>Language that models configuration and state data.</dd>
<dt>NETCONF</dt><dd>XML over SSH on TCP 830 with RPC operations.</dd>
<dt>RESTCONF</dt><dd>REST verbs on YANG data over the secure web server.</dd>
<dt>Telemetry</dt><dd>Data pushed by the device on a schedule or on change.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>NETCONF port</td><td>TCP 830, over SSH</td></tr>
<tr><td>RESTCONF transport</td><td>TCP 443, secure server only</td></tr>
<tr><td>API privilege level</td><td>15</td></tr>
<tr><td>401 / 403 / 404 / 409</td><td>Authentication / privilege / service or object / enabled object conflict</td></tr>
<tr><td>PATCH success</td><td>204, no body</td></tr>
<tr><td>Fabric control and data plane</td><td>LISP and VXLAN</td></tr>
<tr><td>Spaces Active needs</td><td>Enabled, URL, token, clock, DNS, default route (in the lab)</td></tr>
<tr><td>Trilateration needs</td><td>Three or more APs</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! API access</span>
username netops privilege 15 secret NkApi@2026
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf
netconf-yang
<span class="c">! readiness</span>
ip domain name nk.lab
crypto key generate rsa modulus 2048
ip ssh version 2
ntp server 10.10.60.20
ip name-server 10.10.60.20
snmp-server community nkro RO
<span class="c">! Spaces and AP location</span>
nmsp cloud-services server url h&#116;tps://nk-spaces.example.net/api/ctx
nmsp cloud-services server token NkSpacesToken123
nmsp cloud-services enable
ap name AP1 location Floor2-East</pre>
<pre class="out">show ip h&#116;tp server status
show platform software yang-management process
show netconf-yang status
show ip ssh
show ntp status
show hosts
show snmp community
show nmsp cloud-services summary</pre>

<div class="warn"><p><b>Common mistake.</b> Claiming experience you do not have. Say "I configured RESTCONF and Python on a 9800-style lab and I know Catalyst Center, SD-Access and Meraki as architecture". That honesty earns trust in an interview.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read the question for "which component" versus "which protocol" versus "which plane". Control plane, data plane and management plane are different answers in SD-Access and Meraki questions.</p></div>

<div class="scn"><h4>The interview that turned on one honest sentence</h4><p>A candidate was asked about SD-Access and said "I have only studied it, but here is how a wireless client's traffic flows, and here is the RESTCONF work I did hands-on." The panel then asked deeper RESTCONF questions, which the candidate answered with status codes and the 409 rule, and received the offer.</p><p><b>Lesson:</b> separate what you built from what you know, and be precise about both.</p></div>

<div class="iv"><p class="q">"Summarise what you learned about wireless automation."</p><p>The controller is the single source of truth with several doors: CLI, GUI and API. Catalyst Center adds design, provisioning and assurance; fabric and Spaces extend policy and location; the API lets scripts read and change it safely. Add the status-code method and one concrete lab you did.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One controller configuration, many doors.</li>
<li>Know readiness items, ports and privilege 15 by heart.</li>
<li>Know the status codes and the order of gates.</li>
<li>Be able to do the RSSI and trilateration maths.</li>
<li>Label what is hands-on and what is concept only.</li>
</ul></div>
`,hi:`
<p>Is chapter ko safar se pehli raat ki packing list samjho. Aapne bahut kuch cover kiya hai: platforms (Catalyst Center, SD-Access, Spaces, Meraki, EWC), location science, aur 9800 par hands-on API skills. Gaps dhoondhne ke liye checklist, vocabulary theek karne ke liye glossary, aur commands rehearse karne ke liye cheat sheet use karo. Honesty rule yaad rakho: hands-on matlab labs 1 se 5; is module ka baaki sab sirf concept hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Platforms (concept)</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center, SDA, Meraki, EWC</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Location (concept + lab 4)</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">RSSI, trilateration, Spaces</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Programmability (labs 1,2,5)</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="12">YANG, RESTCONF, Python</text>
<rect x="120" y="120" width="400" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="14">9800 controller: ek source of truth</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">lab 3 readiness checks in dono ke beech</text>
<line x1="105" y1="80" x2="220" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="535" y1="80" x2="420" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Module ka sab kuch controller ki single configuration par ya uske aas-paas hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao wireless automate kyun karte hain: scale, consistency, audit, recovery.</li>
<li>Catalyst Center describe karo: inventory, discovery, site hierarchy, network settings, wireless design, provisioning, assurance.</li>
<li>9800 readiness items list karo: user, SSH v2 (domain name, RSA), local auth wala secure web, netconf-yang, NTP, DNS, SNMP, aur TCP 22, 443, 830.</li>
<li>Day-0 versus day-N aur variables wala template kya render karta hai samjhao.</li>
<li>Assurance samjhao: scores, baselines, issues, Client 360, Intelligent Capture.</li>
<li>SD-Access wireless describe karo: fabric WLC (sirf control), fabric AP, edge, LISP, VXLAN, VN, SGT, anycast gateway.</li>
<li>Log-distance formula se RSSI se doori nikalo aur teen-AP trilateration solve karo.</li>
<li>BLE, FastLocate aur Hyperlocation ke naam aur har ek kya jodta hai batao.</li>
<li>Spaces connector up karo aur Inactive diagnose karo (clock, DNS, route); AP locations label karo.</li>
<li>Controller, Meraki aur EWC mein wajah ke saath chuno.</li>
<li>RESTCONF aur NETCONF enable karo; WLAN GET aur PATCH karo; 409 rule samjhao.</li>
<li>401, 403, 404, 405, 409 aur refused connections padho aur order mein fix karo.</li>
<li>Safe habits ke saath Python requests script likho aur debug karo.</li>
<li>Model-driven telemetry, dial-in versus dial-out aur gNMI samjhao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Catalyst Center</dt><dd>Cisco ka network controller platform (pehle DNA Center) design, provisioning aur assurance ke liye.</dd>
<dt>PnP</dt><dd>Plug and Play, zero-touch day-0 onboarding.</dd>
<dt>Assurance</dt><dd>Clients, APs aur controllers ke health scores, issues aur baselines.</dd>
<dt>Fabric</dt><dd>SD-Access overlay: VXLAN data plane, LISP control plane.</dd>
<dt>VN aur SGT</dt><dd>Virtual network (macro segment) aur Scalable Group Tag (micro segment label).</dd>
<dt>RSSI</dt><dd>Received signal strength indicator, dBm mein.</dd>
<dt>Trilateration</dt><dd>Teen ya zyada known points se doori ke zariye position.</dd>
<dt>NMSP</dt><dd>Network Mobility Services Protocol, location data Spaces tak le jaata hai.</dd>
<dt>YANG</dt><dd>Language jo configuration aur state data model karti hai.</dd>
<dt>NETCONF</dt><dd>TCP 830 par SSH ke upar XML, RPC operations ke saath.</dd>
<dt>RESTCONF</dt><dd>Secure web server par YANG data ke upar REST verbs.</dd>
<dt>Telemetry</dt><dd>Device dwara schedule par ya change par push kiya gaya data.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>NETCONF port</td><td>TCP 830, SSH ke upar</td></tr>
<tr><td>RESTCONF transport</td><td>TCP 443, sirf secure server</td></tr>
<tr><td>API privilege level</td><td>15</td></tr>
<tr><td>401 / 403 / 404 / 409</td><td>Authentication / privilege / service ya object / enabled object conflict</td></tr>
<tr><td>PATCH success</td><td>204, bina body</td></tr>
<tr><td>Fabric control aur data plane</td><td>LISP aur VXLAN</td></tr>
<tr><td>Spaces Active ke liye</td><td>Enabled, URL, token, clock, DNS, default route (lab mein)</td></tr>
<tr><td>Trilateration ko chahiye</td><td>Teen ya zyada APs</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! API access</span>
username netops privilege 15 secret NkApi@2026
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf
netconf-yang
<span class="c">! readiness</span>
ip domain name nk.lab
crypto key generate rsa modulus 2048
ip ssh version 2
ntp server 10.10.60.20
ip name-server 10.10.60.20
snmp-server community nkro RO
<span class="c">! Spaces aur AP location</span>
nmsp cloud-services server url h&#116;tps://nk-spaces.example.net/api/ctx
nmsp cloud-services server token NkSpacesToken123
nmsp cloud-services enable
ap name AP1 location Floor2-East</pre>
<pre class="out">show ip h&#116;tp server status
show platform software yang-management process
show netconf-yang status
show ip ssh
show ntp status
show hosts
show snmp community
show nmsp cloud-services summary</pre>

<div class="warn"><p><b>Common mistake.</b> Aisa experience claim karna jo aapke paas nahi hai. Bolo "maine 9800-style lab par RESTCONF aur Python configure kiya aur Catalyst Center, SD-Access aur Meraki ko architecture ke taur par jaanta hoon". Yeh honesty interview mein trust dilati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Question mein "kaun sa component" versus "kaun sa protocol" versus "kaun sa plane" padho. SD-Access aur Meraki ke sawalon mein control plane, data plane aur management plane alag jawab hain.</p></div>

<div class="scn"><h4>Interview jo ek honest sentence par palta</h4><p>Ek candidate se SD-Access ke baare mein poochha gaya aur usne kaha "maine ise sirf padha hai, lekin wireless client ka traffic aise flow karta hai, aur yeh RESTCONF kaam maine hands-on kiya." Panel ne phir gehre RESTCONF sawal poochhe, jinka candidate ne status codes aur 409 rule se jawab diya, aur offer mila.</p><p><b>Lesson:</b> jo banaya aur jo jaante ho use alag rakho, aur dono mein precise raho.</p></div>

<div class="iv"><p class="q">"Wireless automation ke baare mein aapne kya seekha, summarise karo."</p><p>Controller single source of truth hai jisme kai darwaze hain: CLI, GUI aur API. Catalyst Center design, provisioning aur assurance jodta hai; fabric aur Spaces policy aur location badhate hain; API scripts ko ise safely padhne aur badalne deti hai. Status-code method aur ek concrete lab jodo jo aapne kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek controller configuration, kai darwaze.</li>
<li>Readiness items, ports aur privilege 15 yaad rakho.</li>
<li>Status codes aur gates ka order jaano.</li>
<li>RSSI aur trilateration ka maths kar sako.</li>
<li>Label karo kya hands-on hai aur kya sirf concept.</li>
</ul></div>
`}};export{e as default};