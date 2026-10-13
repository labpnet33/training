var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive, a careful driver walks around the car once: tyres, lights, fuel, mirrors. This chapter is that walk-around for ENARSI domain 4.0. If you can tick every box below without looking back, you are ready for the exam questions and for the NOC tickets that look exactly like them.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why SSH is refused and check keys, version, <code>transport input</code>, <code>access-class</code>, free VTY lines and authentication.</li>
<li>I can enable the HTTPS server securely and restrict it, and I know SCP needs <code>aaa authorization exec</code>.</li>
<li>I can set logging levels per destination, read <code>show logging</code>, and trust timestamps only with NTP.</li>
<li>I can run a debug safely with an ACL or a debug condition, to the buffer, and stop it with <code>undebug all</code>.</li>
<li>I can read <code>show snmp</code> counters and tell a wrong community or ACL from a routing problem.</li>
<li>I can build and troubleshoot an SNMPv3 group, user and view, and map each error to a cause.</li>
<li>I can configure an IOS DHCP pool with options 3, 6, 43 and 150, and read bindings, conflicts and statistics.</li>
<li>I can place <code>ip helper-address</code> correctly, explain giaddr and fix option 82 drops.</li>
<li>I can choose stateless or stateful DHCPv6 with the RA flags and configure <code>ipv6 dhcp relay destination</code>.</li>
<li>I can build IP SLA icmp-echo and udp-jitter with a responder, track it, and fail over a static route.</li>
<li>I can build and troubleshoot traditional NetFlow and Flexible NetFlow export.</li>
<li>I can interpret Catalyst Center device, network and client health and use its troubleshooting tools.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Domain 4 summary">
<rect x="10" y="20" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">4.1 Mgmt: SSH, HTTPS, SCP</text>
<rect x="220" y="20" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">4.2 SNMP v2c / v3</text>
<rect x="430" y="20" width="200" height="40" rx="8" fill="#fde68a"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="12">4.3 Logging, debugs</text>
<rect x="10" y="100" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="12">4.4 DHCPv4 / DHCPv6</text>
<rect x="220" y="100" width="200" height="40" rx="8" fill="#fed7aa"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">4.5 IP SLA + track</text>
<rect x="430" y="100" width="200" height="40" rx="8" fill="#bae6fd"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="12">4.6 NetFlow, 4.7 Assurance</text>
</svg><p class="cap">The seven blueprint items of domain 4.0 Infrastructure Services.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>access-class</dt><dd>ACL applied to VTY lines to filter who may open a session.</dd>
<dt>Conditional debug</dt><dd><code>debug condition</code> that limits debug output to an interface, IP, MAC or user.</dd>
<dt>Community</dt><dd>SNMPv1/v2c clear-text password with RO or RW access, optionally tied to an ACL and a view.</dd>
<dt>Engine ID</dt><dd>SNMPv3 engine identifier; user keys are localised to it.</dd>
<dt>giaddr</dt><dd>DHCPv4 field set by the relay to the receiving interface IP; selects the pool and receives the reply.</dd>
<dt>link-address</dt><dd>DHCPv6 relay field with the same role as giaddr.</dd>
<dt>Option 82</dt><dd>Relay agent information: circuit ID and remote ID.</dd>
<dt>IP SLA responder</dt><dd>Router feature that answers and timestamps udp-jitter probes.</dd>
<dt>Track object</dt><dd>Turns an SLA, interface or route state into Up or Down for other features.</dd>
<dt>Flow record / exporter / monitor</dt><dd>Flexible NetFlow objects: what to match and collect, where to send, and the cache applied to an interface.</dd>
<dt>Health score</dt><dd>Catalyst Center value 1 to 10 per device or client, driven by the worst KPI.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Syslog</td><td>Levels 0 emergencies to 7 debugging; a level includes all lower numbers; UDP 514; <code>logging trap</code> = level for servers</td></tr>
<tr><td>Timestamps</td><td><b>*</b> = clock not authoritative; use <code>service timestamps log datetime msec</code> and NTP</td></tr>
<tr><td>Debug</td><td>VTY needs <code>terminal monitor</code>; <code>debug ip packet</code> shows only process-switched packets</td></tr>
<tr><td>SNMP</td><td>Polls UDP 161, traps/informs UDP 162; ACL deny counts as "Unknown community name"; traps need enable traps + host</td></tr>
<tr><td>SNMPv3</td><td>Level set on the group; users only in <code>show snmp user</code>; wrong priv password looks like a timeout</td></tr>
<tr><td>DHCPv4</td><td>Helper on receiving interface; server picks pool by giaddr and replies to it; IOS client default route AD 254</td></tr>
<tr><td>Options</td><td>3 router, 6 DNS, 43 WLC (f1 + length), 82 relay info, 150 TFTP for phones</td></tr>
<tr><td>DHCPv6</td><td>M=1 stateful, O=1 stateless; gateway from RA; UDP 546/547; ff02::1:2</td></tr>
<tr><td>IP SLA</td><td>Schedule it; udp-jitter needs responder (control UDP 1967); reachability vs state; pin the target with a /32</td></tr>
<tr><td>NetFlow</td><td>v5 fixed IPv4; v9/IPFIX templates; match = key, collect = non-key; inactive 15 s, active 30 min defaults</td></tr>
<tr><td>Assurance</td><td>Health 1-10: poor 1-3, fair 4-7, good 8-10; network health = % healthy devices</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show ip ssh | show users | show ip h&#116;tp server status
show logging | show debugging | show debug condition | undebug all
show snmp | show snmp community | show snmp host | show snmp user | show snmp group
show ip dhcp binding | show ip dhcp pool | show ip dhcp conflict | show ip dhcp server statistics
debug ip dhcp server packet | show ip interface g0/0 | include Helper | show dhcp lease
show ipv6 dhcp interface | show ipv6 dhcp binding | show ipv6 dhcp pool | debug ipv6 dhcp detail
show ip sla configuration | show ip sla statistics | show track | show ip route static
show ip cache flow | show ip flow export | show flow monitor NAME cache format table
show flow exporter NAME statistics | show flow interface</pre>

<div class="eg"><p><b>Worked example: one-minute self-test.</b> A router sends syslog at <code>logging trap notifications</code>. Does %TRACK-6-STATE reach the server? No, 6 is less severe than 5. Does %LINK-3-UPDOWN? Yes, 3 is more severe. Does %LINEPROTO-5-UPDOWN? Yes, it is exactly level 5. If you answered all three in under a minute, you know the level rule.</p></div>

<div class="warn"><p><b>Common mistakes at exam time.</b> Mixing up <code>logging trap</code> and SNMP traps; choosing "wrong community" when the output shows an ACL issue; putting the helper on the server side; forgetting that DHCPv6 never supplies the gateway; forgetting the IP SLA schedule.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> access-class (lines) vs access-group (interfaces); RO community Set = "Illegal operation"; option 43 length must be 4 x number of controllers; floating static AD must be higher than the tracked route; v5 cannot export IPv6.</p></div>

<div class="scn"><h4>The pre-change checklist that saved a weekend</h4><p>Before migrating 30 branches to new routers, a team turned this checklist into a verification script: SSH and SCP test, <code>show logging</code> host link up, one SNMPv3 poll and one test trap, a DHCP renew from a test PC, <code>show track</code> Up, and one flow seen at the collector. Two branches failed the SNMP step (ACL typo) and one failed DHCP (helper on the wrong SVI). All were fixed before users arrived on Monday.</p><p><b>Lesson:</b> the exam checklist is also an operational acceptance test.</p></div>

<div class="iv"><p class="q">"What are the first services you verify after replacing a branch router?"</p><p>Management (SSH from the jump host), time (NTP), logging to the syslog server, SNMP polling and a test trap, DHCP relay with a real renew, IP SLA and tracking state, and NetFlow export. A strong answer shows evidence for each: a log line on the server, a trap received, a binding, a track state and a flow at the collector.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 4.0 = device management, SNMP, logging, DHCP (v4 and v6), IP SLA, NetFlow and Catalyst Center assurance.</li>
<li>Every service has a sender, a path and a receiver; counters show where it stops.</li>
<li>Know the numbers: syslog levels, UDP 161/162/514/67/68/546/547/1967/2055, health score bands.</li>
<li>Know the placements: access-class on lines, helper on the receiving interface, monitor on the interface and direction.</li>
<li>Use this checklist before the exam and after every change.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle, saavdhaan driver ek baar gaadi ke chaaron taraf ghoomta hai: tyres, lights, fuel, mirrors. Yeh chapter ENARSI domain 4.0 ke liye wahi chakkar hai. Agar aap neeche ka har box bina peechhe dekhe tick kar sakte ho, to aap exam questions aur unhi jaise dikhne wale NOC tickets ke liye taiyaar ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon SSH kyun refuse hota hai aur keys, version, <code>transport input</code>, <code>access-class</code>, free VTY lines aur authentication check kar sakta hoon.</li>
<li>Main HTTPS server ko securely enable aur restrict kar sakta hoon, aur jaanta hoon ki SCP ko <code>aaa authorization exec</code> chahiye.</li>
<li>Main har destination ke liye logging levels set kar sakta hoon, <code>show logging</code> padh sakta hoon, aur timestamps par sirf NTP ke saath bharosa karta hoon.</li>
<li>Main ACL ya debug condition ke saath, buffer mein, safely debug chala sakta hoon aur <code>undebug all</code> se rok sakta hoon.</li>
<li>Main <code>show snmp</code> counters padh sakta hoon aur galat community ya ACL ko routing problem se alag bata sakta hoon.</li>
<li>Main SNMPv3 group, user aur view bana aur troubleshoot kar sakta hoon, aur har error ko cause se mila sakta hoon.</li>
<li>Main options 3, 6, 43 aur 150 ke saath IOS DHCP pool configure kar sakta hoon, aur bindings, conflicts aur statistics padh sakta hoon.</li>
<li>Main <code>ip helper-address</code> sahi jagah laga sakta hoon, giaddr samjha sakta hoon aur option 82 drops theek kar sakta hoon.</li>
<li>Main RA flags se stateless ya stateful DHCPv6 chun sakta hoon aur <code>ipv6 dhcp relay destination</code> configure kar sakta hoon.</li>
<li>Main responder ke saath IP SLA icmp-echo aur udp-jitter bana sakta hoon, use track kar sakta hoon, aur static route fail over kar sakta hoon.</li>
<li>Main traditional NetFlow aur Flexible NetFlow export bana aur troubleshoot kar sakta hoon.</li>
<li>Main Catalyst Center device, network aur client health interpret kar sakta hoon aur uske troubleshooting tools use kar sakta hoon.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Domain 4 summary">
<rect x="10" y="20" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">4.1 Mgmt: SSH, HTTPS, SCP</text>
<rect x="220" y="20" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">4.2 SNMP v2c / v3</text>
<rect x="430" y="20" width="200" height="40" rx="8" fill="#fde68a"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="12">4.3 Logging, debugs</text>
<rect x="10" y="100" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="12">4.4 DHCPv4 / DHCPv6</text>
<rect x="220" y="100" width="200" height="40" rx="8" fill="#fed7aa"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">4.5 IP SLA + track</text>
<rect x="430" y="100" width="200" height="40" rx="8" fill="#bae6fd"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="12">4.6 NetFlow, 4.7 Assurance</text>
</svg><p class="cap">Domain 4.0 Infrastructure Services ke saat blueprint items.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>access-class</dt><dd>VTY lines par laga ACL jo filter karta hai ki kaun session khol sakta hai.</dd>
<dt>Conditional debug</dt><dd><code>debug condition</code> jo debug output ko ek interface, IP, MAC ya user tak seemit karta hai.</dd>
<dt>Community</dt><dd>SNMPv1/v2c ka clear-text password RO ya RW access ke saath, optionally ACL aur view se juda.</dd>
<dt>Engine ID</dt><dd>SNMPv3 engine identifier; user keys isi se localise hoti hain.</dd>
<dt>giaddr</dt><dd>DHCPv4 field jise relay receiving interface IP par set karta hai; pool chunta hai aur reply receive karta hai.</dd>
<dt>link-address</dt><dd>DHCPv6 relay field jiska role giaddr jaisa hai.</dd>
<dt>Option 82</dt><dd>Relay agent information: circuit ID aur remote ID.</dd>
<dt>IP SLA responder</dt><dd>Router feature jo udp-jitter probes ka jawab deta hai aur timestamp lagata hai.</dd>
<dt>Track object</dt><dd>SLA, interface ya route state ko doosre features ke liye Up ya Down mein badalta hai.</dd>
<dt>Flow record / exporter / monitor</dt><dd>Flexible NetFlow objects: kya match aur collect karna hai, kahan bhejna hai, aur interface par laga cache.</dd>
<dt>Health score</dt><dd>Har device ya client ke liye Catalyst Center ki 1 se 10 value, sabse kharab KPI se chalti hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Syslog</td><td>Levels 0 emergencies se 7 debugging; ek level mein saare kam numbers aate hain; UDP 514; <code>logging trap</code> = servers ka level</td></tr>
<tr><td>Timestamps</td><td><b>*</b> = clock authoritative nahi; <code>service timestamps log datetime msec</code> aur NTP use karo</td></tr>
<tr><td>Debug</td><td>VTY ko <code>terminal monitor</code> chahiye; <code>debug ip packet</code> sirf process-switched packets dikhata hai</td></tr>
<tr><td>SNMP</td><td>Polls UDP 161, traps/informs UDP 162; ACL deny "Unknown community name" mein gina jaata hai; traps ko enable traps + host chahiye</td></tr>
<tr><td>SNMPv3</td><td>Level group par set hota hai; users sirf <code>show snmp user</code> mein; galat priv password timeout jaisa dikhta hai</td></tr>
<tr><td>DHCPv4</td><td>Helper receiving interface par; server giaddr se pool chunta hai aur usi ko reply karta hai; IOS client default route AD 254</td></tr>
<tr><td>Options</td><td>3 router, 6 DNS, 43 WLC (f1 + length), 82 relay info, 150 phones ke liye TFTP</td></tr>
<tr><td>DHCPv6</td><td>M=1 stateful, O=1 stateless; gateway RA se; UDP 546/547; ff02::1:2</td></tr>
<tr><td>IP SLA</td><td>Schedule karo; udp-jitter ko responder chahiye (control UDP 1967); reachability vs state; target ko /32 se pin karo</td></tr>
<tr><td>NetFlow</td><td>v5 fixed IPv4; v9/IPFIX templates; match = key, collect = non-key; inactive 15 s, active 30 min defaults</td></tr>
<tr><td>Assurance</td><td>Health 1-10: poor 1-3, fair 4-7, good 8-10; network health = healthy devices ka %</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show ip ssh | show users | show ip h&#116;tp server status
show logging | show debugging | show debug condition | undebug all
show snmp | show snmp community | show snmp host | show snmp user | show snmp group
show ip dhcp binding | show ip dhcp pool | show ip dhcp conflict | show ip dhcp server statistics
debug ip dhcp server packet | show ip interface g0/0 | include Helper | show dhcp lease
show ipv6 dhcp interface | show ipv6 dhcp binding | show ipv6 dhcp pool | debug ipv6 dhcp detail
show ip sla configuration | show ip sla statistics | show track | show ip route static
show ip cache flow | show ip flow export | show flow monitor NAME cache format table
show flow exporter NAME statistics | show flow interface</pre>

<div class="eg"><p><b>Worked example: ek minute ka self-test.</b> Router <code>logging trap notifications</code> par syslog bhejta hai. Kya %TRACK-6-STATE server tak pahunchta hai? Nahi, 6 level 5 se kam severe hai. Kya %LINK-3-UPDOWN? Haan, 3 zyada severe hai. Kya %LINEPROTO-5-UPDOWN? Haan, yeh bilkul level 5 hai. Agar aapne teeno ek minute se kam mein jawab diye, to aap level rule jaante ho.</p></div>

<div class="warn"><p><b>Exam time ki common galtiyan.</b> <code>logging trap</code> aur SNMP traps ko mila dena; output ACL issue dikhaye tab "galat community" chunna; helper ko server side par lagana; bhoolna ki DHCPv6 kabhi gateway nahi deta; IP SLA schedule bhoolna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> access-class (lines) vs access-group (interfaces); RO community se Set = "Illegal operation"; option 43 length 4 x controllers ki sankhya honi chahiye; floating static ka AD tracked route se zyada hona chahiye; v5 IPv6 export nahi kar sakta.</p></div>

<div class="scn"><h4>Woh pre-change checklist jisne weekend bachaya</h4><p>30 branches ko naye routers par migrate karne se pehle, ek team ne is checklist ko verification script bana diya: SSH aur SCP test, <code>show logging</code> host link up, ek SNMPv3 poll aur ek test trap, test PC se DHCP renew, <code>show track</code> Up, aur collector par ek flow. Do branches SNMP step par fail hui (ACL typo) aur ek DHCP par (helper galat SVI par). Somvaar ko users ke aane se pehle sab theek ho gaye.</p><p><b>Seekh:</b> exam checklist ek operational acceptance test bhi hai.</p></div>

<div class="iv"><p class="q">"Branch router badalne ke baad aap sabse pehle kaunsi services verify karte ho?"</p><p>Management (jump host se SSH), time (NTP), syslog server par logging, SNMP polling aur ek test trap, asli renew ke saath DHCP relay, IP SLA aur tracking state, aur NetFlow export. Strong answer har ek ka saboot dikhata hai: server par log line, mila hua trap, binding, track state aur collector par flow.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 4.0 = device management, SNMP, logging, DHCP (v4 aur v6), IP SLA, NetFlow aur Catalyst Center assurance.</li>
<li>Har service ka sender, path aur receiver hota hai; counters dikhate hain woh kahan rukti hai.</li>
<li>Numbers jaano: syslog levels, UDP 161/162/514/67/68/546/547/1967/2055, health score bands.</li>
<li>Placements jaano: access-class lines par, helper receiving interface par, monitor interface aur direction par.</li>
<li>Yeh checklist exam se pehle aur har change ke baad use karo.</li>
</ul></div>
`}};export{e as default};