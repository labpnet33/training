var e={id:`big-picture`,h:{en:`The big picture: services that keep a network observable and usable`,hi:`Big picture: woh services jo network ko dekhne layak aur use layak rakhti hain`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>How to reach and manage a router safely and troubleshoot why console, Telnet, SSH, HTTP/HTTPS, SCP or TFTP access fails.</li>
<li>How local logging, syslog, debugs, conditional debugs and timestamps work, and how to use them without hurting a production router.</li>
<li>How to troubleshoot SNMPv2c and SNMPv3 polling and traps.</li>
<li>How DHCPv4 (server, client, relay, options 43, 82 and 150) and DHCPv6 (stateless, stateful, relay) break and how to prove where.</li>
<li>How IP SLA (ICMP echo, UDP jitter, delay, connectivity) and object tracking detect failures a routing table cannot see.</li>
<li>How NetFlow v5, v9 and Flexible NetFlow answer the question "who used the bandwidth", and how Cisco Catalyst Center (formerly DNA Center) assurance turns all this telemetry into health scores.</li>
</ul>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 and IPv6 addressing, static routes and administrative distance, basic ACLs and the IOS CLI. The ENCOR assurance and IP services modules introduced syslog, SNMP, NetFlow, IP SLA and tracking at a configuration level; this module goes one level deeper, into <b>troubleshooting</b>, which is exactly what the ENARSI 300-410 v1.1 exam domain 4.0 Infrastructure Services (25% of the exam) asks for.</p>

<h3>An analogy: running a hospital</h3>
<p>Imagine a large hospital. Doctors need a <b>secure door</b> to enter the building (device management). Every event is written in a <b>logbook</b> with the exact time (syslog and timestamps). When something strange happens, a specialist attaches a <b>monitor</b> to one patient only, not to every bed at once (conditional debugging). A central <b>nursing station</b> reads vital signs from every room and gets an alarm when something changes (SNMP polling and traps). New patients are given a bed, a wristband and a doctor at reception (DHCP hands out an address, a gateway and options). Someone checks the <b>pulse</b> every few seconds and calls for help when it stops (IP SLA and tracking). The billing department records <b>who used which service</b> (NetFlow). Finally the hospital director looks at one <b>dashboard</b> with a health score for every ward (Catalyst Center assurance).</p>
<p>If any of these services fails, patients may still be treated, but nobody can see what is happening. That is the typical ENARSI ticket: the network "works", but it is <b>dark to monitoring</b>, clients do not get addresses, or failover never happens.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Infrastructure services map">
<rect x="250" y="120" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="14">IOS router</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">BR / EDGE / HQ</text>
<rect x="20" y="20" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="100" y="47" text-anchor="middle" class="svg-ink" font-size="13">SSH, SCP, HTTPS</text>
<rect x="240" y="20" width="160" height="44" rx="8" fill="#fde68a"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Syslog, debug</text>
<rect x="460" y="20" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="540" y="47" text-anchor="middle" class="svg-ink" font-size="13">SNMP v2c / v3</text>
<rect x="20" y="236" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="100" y="263" text-anchor="middle" class="svg-ink" font-size="13">DHCPv4 / DHCPv6</text>
<rect x="240" y="236" width="160" height="44" rx="8" fill="#fed7aa"/><text x="320" y="263" text-anchor="middle" class="svg-ink" font-size="13">IP SLA + track</text>
<rect x="460" y="236" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="540" y="263" text-anchor="middle" class="svg-ink" font-size="13">NetFlow / FNF</text>
<line x1="100" y1="64" x2="270" y2="120" stroke="#64748b"/><line x1="320" y1="64" x2="320" y2="120" stroke="#64748b"/><line x1="540" y1="64" x2="370" y2="120" stroke="#64748b"/>
<line x1="100" y1="236" x2="270" y2="180" stroke="#64748b"/><line x1="320" y1="236" x2="320" y2="180" stroke="#64748b"/><line x1="540" y1="236" x2="370" y2="180" stroke="#64748b"/>
<text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">all feed</text><text x="560" y="166" text-anchor="middle" class="svg-accent" font-size="12">Catalyst Center</text>
</svg><p class="cap">Domain 4.0 in one picture: management access, logging, SNMP, DHCP, IP SLA and NetFlow all run on the same router and all feed assurance.</p></div>

<h3>Why these services matter</h3>
<p>A routing protocol tells you whether a prefix is reachable. It does not tell you when a link started dropping 3% of voice packets, which user filled the WAN at 11:02, or that the branch printer got the wrong gateway. Infrastructure services give you <b>evidence</b>. In a real network operations centre (NOC) you rarely log in and guess; you read the syslog timeline, check the SNMP graphs, look at the flow records and then decide. When these services are broken, every other outage takes longer to fix.</p>

<h3>The three labs in this module</h3>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>What you prove</th></tr>
<tr><td>IP SLA tracking with syslog evidence</td><td>BR, PE1, PE2, HQ, NOC 10.10.10.50</td><td>SLA 10 probes 10.10.10.1 via PE1, track 10 withdraws the primary static route, a floating route via PE2 (AD 250) takes over, and %TRACK-6-STATE reaches the collector from Loopback0 172.16.40.1.</td></tr>
<tr><td>Troubleshoot: Branch PCs get no (usable) DHCP lease</td><td>PC1, PC2, SW1, BR, HQ (DHCP server 10.30.30.1), APP 10.30.30.80</td><td>Helper on the wrong interface, no return route to giaddr 192.168.50.1, wrong default-router in pool BR-LAN.</td></tr>
<tr><td>NOC ticket: EDGE is dark to monitoring</td><td>EDGE, ISP, NMS 10.99.0.50, PC1, PC2, SRV</td><td>ACL 20 permits the wrong host, traps are missing, and a Flexible NetFlow monitor NOC-MON must export to UDP 2055.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A branch router BR has a default static route to PE1 at 10.1.1.1. PE1's core link to HQ fails, but the BR to PE1 cable (10.1.1.0/30) stays up. BR keeps the route because the next hop 10.1.1.1 is still reachable, and all traffic to 10.10.10.0/24 is black-holed. Only an end-to-end probe (IP SLA to 10.10.10.1 every 5 seconds) can detect the failure; a track object then removes the static route, and the floating route via 10.2.2.1 with AD 250 is installed. You will build exactly this in chapter 9.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating monitoring as optional and configuring it last. When the outage comes, the router has no syslog server, the clock is wrong and SNMP is refused, so you have no evidence of when or why it failed.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint says "troubleshoot", not "configure". Expect show outputs with one wrong detail: a helper on the wrong interface, an ACL that permits .5 instead of .50, a logging level one step too low. Read every line of the output before you pick an answer.</p></div>

<div class="scn"><h4>The outage nobody could time</h4><p>A retail chain lost its payment traffic for 40 minutes. The routers had logging only to the console, no NTP and uptime timestamps. The engineer could see that an interface flapped but not when, and could not correlate it with the provider's maintenance. After the incident the team added NTP, <code>service timestamps log datetime msec localtime show-timezone</code>, a syslog server and SNMP traps from a loopback. The next flap was matched to the provider's change ticket within minutes.</p><p><b>Lesson:</b> infrastructure services are the black box recorder of the network; configure and test them before you need them.</p></div>

<div class="iv"><p class="q">"Which tools would you use to troubleshoot a slow branch link?"</p><p>A strong answer is structured: SNMP interface counters for utilisation and errors, NetFlow to see which applications and hosts use the bandwidth, IP SLA UDP jitter to measure delay, jitter and loss end to end, syslog to find flaps and their exact time, and conditional debugs only when you have narrowed the problem down. Mention that the clocks must be synchronised with NTP so that all of this evidence lines up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI domain 4.0 is 25% of the exam and is about troubleshooting, not only configuration.</li>
<li>Management access, logging, SNMP, DHCP, IP SLA, NetFlow and assurance are the evidence tools of a NOC.</li>
<li>A static route cannot detect a failure beyond its next hop; IP SLA plus tracking can.</li>
<li>The three labs are an IP SLA failover, a DHCP relay ticket and a monitoring outage; every chapter prepares a piece of them.</li>
<li>Synchronised time (NTP) is what makes logs, traps, flows and SLA results comparable.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Router tak safely kaise pahunchna aur manage karna hai, aur console, Telnet, SSH, HTTP/HTTPS, SCP ya TFTP access kyun fail hota hai uska troubleshooting.</li>
<li>Local logging, syslog, debugs, conditional debugs aur timestamps kaise kaam karte hain, aur inhe production router ko nuksaan pahunchaye bina kaise use karna hai.</li>
<li>SNMPv2c aur SNMPv3 polling aur traps ka troubleshooting.</li>
<li>DHCPv4 (server, client, relay, options 43, 82 aur 150) aur DHCPv6 (stateless, stateful, relay) kaise tootte hain aur kaise sabit karna hai ki kahan.</li>
<li>IP SLA (ICMP echo, UDP jitter, delay, connectivity) aur object tracking woh failures kaise pakadte hain jo routing table nahi dekh sakti.</li>
<li>NetFlow v5, v9 aur Flexible NetFlow "bandwidth kisne use kiya" ka jawab kaise dete hain, aur Cisco Catalyst Center (pehle DNA Center) assurance is saari telemetry ko health scores mein kaise badalta hai.</li>
</ul>
<p><b>Prerequisites.</b> Aapko IPv4 aur IPv6 addressing, static routes aur administrative distance, basic ACLs aur IOS CLI mein comfortable hona chahiye. ENCOR assurance aur IP services modules ne syslog, SNMP, NetFlow, IP SLA aur tracking ko configuration level par introduce kiya tha; yeh module ek level gehraai mein, <b>troubleshooting</b> mein jaata hai, jo bilkul wahi hai jo ENARSI 300-410 v1.1 exam ka domain 4.0 Infrastructure Services (exam ka 25%) maangta hai.</p>

<h3>Ek analogy: hospital chalana</h3>
<p>Ek bade hospital ko socho. Doctors ko building mein aane ke liye ek <b>secure darwaza</b> chahiye (device management). Har event ek <b>logbook</b> mein exact time ke saath likha jaata hai (syslog aur timestamps). Jab kuch ajeeb hota hai, specialist sirf ek patient par <b>monitor</b> lagata hai, har bed par ek saath nahi (conditional debugging). Ek central <b>nursing station</b> har kamre se vital signs padhta hai aur kuch badalne par alarm paata hai (SNMP polling aur traps). Naye patients ko reception par bed, wristband aur doctor diya jaata hai (DHCP address, gateway aur options deta hai). Koi har kuch second mein <b>nabz</b> check karta hai aur rukne par madad bulata hai (IP SLA aur tracking). Billing department record karta hai ki <b>kisne kaunsi service use ki</b> (NetFlow). Aakhir mein hospital director ek <b>dashboard</b> dekhta hai jismein har ward ka health score hai (Catalyst Center assurance).</p>
<p>Agar inmein se koi service fail ho, patients ka ilaaj phir bhi ho sakta hai, par kisi ko dikhta nahi ki kya ho raha hai. Yahi typical ENARSI ticket hai: network "chal raha hai", par woh <b>monitoring ke liye andhera</b> hai, clients ko address nahi milta, ya failover kabhi hota hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Infrastructure services map">
<rect x="250" y="120" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="14">IOS router</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">BR / EDGE / HQ</text>
<rect x="20" y="20" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="100" y="47" text-anchor="middle" class="svg-ink" font-size="13">SSH, SCP, HTTPS</text>
<rect x="240" y="20" width="160" height="44" rx="8" fill="#fde68a"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Syslog, debug</text>
<rect x="460" y="20" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="540" y="47" text-anchor="middle" class="svg-ink" font-size="13">SNMP v2c / v3</text>
<rect x="20" y="236" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="100" y="263" text-anchor="middle" class="svg-ink" font-size="13">DHCPv4 / DHCPv6</text>
<rect x="240" y="236" width="160" height="44" rx="8" fill="#fed7aa"/><text x="320" y="263" text-anchor="middle" class="svg-ink" font-size="13">IP SLA + track</text>
<rect x="460" y="236" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="540" y="263" text-anchor="middle" class="svg-ink" font-size="13">NetFlow / FNF</text>
<line x1="100" y1="64" x2="270" y2="120" stroke="#64748b"/><line x1="320" y1="64" x2="320" y2="120" stroke="#64748b"/><line x1="540" y1="64" x2="370" y2="120" stroke="#64748b"/>
<line x1="100" y1="236" x2="270" y2="180" stroke="#64748b"/><line x1="320" y1="236" x2="320" y2="180" stroke="#64748b"/><line x1="540" y1="236" x2="370" y2="180" stroke="#64748b"/>
<text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">sab jaate hain</text><text x="560" y="166" text-anchor="middle" class="svg-accent" font-size="12">Catalyst Center</text>
</svg><p class="cap">Domain 4.0 ek picture mein: management access, logging, SNMP, DHCP, IP SLA aur NetFlow sab same router par chalte hain aur sab assurance ko data dete hain.</p></div>

<h3>Yeh services kyun zaroori hain</h3>
<p>Routing protocol batata hai ki prefix reachable hai ya nahi. Yeh nahi batata ki kab ek link ne 3% voice packets drop karna shuru kiya, 11:02 par kis user ne WAN bhar diya, ya branch printer ko galat gateway mila. Infrastructure services aapko <b>saboot</b> deti hain. Real network operations centre (NOC) mein aap shayad hi login karke andaaza lagate ho; aap syslog timeline padhte ho, SNMP graphs dekhte ho, flow records dekhte ho aur phir faisla karte ho. Jab yeh services tooti hoti hain, to har doosra outage theek karne mein zyada samay lagta hai.</p>

<h3>Is module ki teen labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>Aap kya sabit karte ho</th></tr>
<tr><td>Syslog saboot ke saath IP SLA tracking</td><td>BR, PE1, PE2, HQ, NOC 10.10.10.50</td><td>SLA 10 PE1 ke through 10.10.10.1 ko probe karta hai, track 10 primary static route hatata hai, PE2 wala floating route (AD 250) le leta hai, aur %TRACK-6-STATE Loopback0 172.16.40.1 se collector tak pahunchta hai.</td></tr>
<tr><td>Troubleshoot: Branch PCs ko (kaam ka) DHCP lease nahi mil raha</td><td>PC1, PC2, SW1, BR, HQ (DHCP server 10.30.30.1), APP 10.30.30.80</td><td>Helper galat interface par, giaddr 192.168.50.1 tak return route nahi, pool BR-LAN mein galat default-router.</td></tr>
<tr><td>NOC ticket: EDGE monitoring mein andhera</td><td>EDGE, ISP, NMS 10.99.0.50, PC1, PC2, SRV</td><td>ACL 20 galat host permit karta hai, traps missing hain, aur Flexible NetFlow monitor NOC-MON ko UDP 2055 par export karna hai.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Branch router BR ka PE1 10.1.1.1 ki taraf default static route hai. PE1 ka HQ wala core link fail hota hai, par BR se PE1 ki cable (10.1.1.0/30) up rehti hai. BR route rakhta hai kyunki next hop 10.1.1.1 abhi bhi reachable hai, aur 10.10.10.0/24 ka saara traffic black-hole ho jaata hai. Sirf end-to-end probe (har 5 second 10.10.10.1 ko IP SLA) failure pakad sakta hai; phir track object static route hatata hai, aur 10.2.2.1 wala AD 250 ka floating route install hota hai. Aap bilkul yahi chapter 9 mein banaoge.</p></div>

<div class="warn"><p><b>Common galti.</b> Monitoring ko optional maanna aur sabse aakhir mein configure karna. Jab outage aata hai, router ke paas koi syslog server nahi, clock galat hai aur SNMP refuse ho raha hai, to aapke paas koi saboot nahi ki kab ya kyun fail hua.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint "troubleshoot" kehta hai, "configure" nahi. Aisa show output expect karo jismein ek detail galat ho: galat interface par helper, ACL jo .50 ki jagah .5 permit karta hai, logging level ek step kam. Answer chunne se pehle output ki har line padho.</p></div>

<div class="scn"><h4>Woh outage jiska time koi nahi bata saka</h4><p>Ek retail chain ka payment traffic 40 minute gayab raha. Routers par logging sirf console par thi, NTP nahi tha aur uptime timestamps the. Engineer dekh sakta tha ki interface flap hua, par kab, yeh nahi, aur provider ke maintenance se milaan nahi kar saka. Incident ke baad team ne NTP, <code>service timestamps log datetime msec localtime show-timezone</code>, syslog server aur loopback se SNMP traps jode. Agla flap minuton mein provider ke change ticket se match ho gaya.</p><p><b>Seekh:</b> infrastructure services network ka black box recorder hain; zaroorat padne se pehle inhe configure aur test karo.</p></div>

<div class="iv"><p class="q">"Slow branch link ke troubleshooting ke liye aap kaunse tools use karoge?"</p><p>Strong answer structured hota hai: utilisation aur errors ke liye SNMP interface counters, kaunse applications aur hosts bandwidth use kar rahe hain dekhne ke liye NetFlow, end to end delay, jitter aur loss naapne ke liye IP SLA UDP jitter, flaps aur unka exact time dhoondhne ke liye syslog, aur conditional debugs sirf tab jab problem narrow ho chuki ho. Batao ki clocks NTP se synchronised hone chahiye taaki yeh saara saboot line up ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENARSI domain 4.0 exam ka 25% hai aur troubleshooting ke baare mein hai, sirf configuration nahi.</li>
<li>Management access, logging, SNMP, DHCP, IP SLA, NetFlow aur assurance NOC ke saboot wale tools hain.</li>
<li>Static route apne next hop ke aage ka failure nahi pakad sakta; IP SLA plus tracking pakad sakte hain.</li>
<li>Teen labs hain: IP SLA failover, DHCP relay ticket aur monitoring outage; har chapter unka ek hissa taiyaar karta hai.</li>
<li>Synchronised time (NTP) hi logs, traps, flows aur SLA results ko comparable banata hai.</li>
</ul></div>
`}};export{e as default};