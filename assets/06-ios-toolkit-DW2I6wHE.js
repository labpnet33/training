var e={id:`ios-toolkit`,h:{en:`The IOS troubleshooting toolkit`,hi:`IOS troubleshooting toolkit`},body:{en:`
<p>A doctor has a stethoscope for right now, the patient file for history, a blood-pressure log for trends, and a scan when she needs to see inside. A network engineer has the same four kinds of tool: live commands (show, ping, debug), history (logging buffers and syslog), trends (SNMP, NetFlow, IP SLA) and a view inside the packets (Embedded Packet Capture). Knowing which one answers your current question is half of troubleshooting. The services module later teaches configuring SNMP, NetFlow and IP SLA in depth; here you learn to use them as evidence.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Kinds of troubleshooting evidence">
<rect x="250" y="85" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Router</text>
<rect x="20" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="41" text-anchor="middle" class="svg-ink" font-size="13">Live</text><text x="115" y="59" text-anchor="middle" class="svg-muted" font-size="12">show, ping, debug</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="525" y="41" text-anchor="middle" class="svg-ink" font-size="13">History</text><text x="525" y="59" text-anchor="middle" class="svg-muted" font-size="12">log buffer, syslog</text>
<rect x="20" y="150" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="115" y="171" text-anchor="middle" class="svg-ink" font-size="13">Trends</text><text x="115" y="189" text-anchor="middle" class="svg-muted" font-size="12">SNMP, NetFlow, IP SLA</text>
<rect x="430" y="150" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="171" text-anchor="middle" class="svg-ink" font-size="13">Packets</text><text x="525" y="189" text-anchor="middle" class="svg-muted" font-size="12">EPC capture</text>
<line x1="210" y1="45" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="45" x2="390" y2="95" stroke="#64748b" stroke-width="2"/><line x1="210" y1="175" x2="250" y2="125" stroke="#64748b" stroke-width="2"/><line x1="430" y1="175" x2="390" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four kinds of evidence: what is happening now, what happened, how things trend, and what is inside the packets.</p></div>

<h3>Show commands and output filters</h3>
<p>Big outputs hide the one line you need. IOS filters let you cut them down: <code>| include</code> (lines matching a regular expression), <code>| exclude</code>, <code>| begin</code> (start at the first match), <code>| section</code> (a configuration block and its children) and <code>| count</code> (how many lines match). Examples: <code>show ip route | include ^O|^D</code> lists only OSPF and EIGRP routes; <code>show ip interface brief | exclude unassigned</code> hides unused interfaces; <code>show logging | include OSPF|EIGRP|BGP</code> finds adjacency changes.</p>

<h3>Extended ping and traceroute</h3>
<p>A plain ping from the router tests the wrong thing surprisingly often. The extended options let you imitate the user's traffic:</p>
<pre class="code"><span class="c">! Source from the user LAN, 100 packets, 1400 bytes, do not fragment</span>
R1# ping 10.3.30.10 source GigabitEthernet0/1 repeat 100 size 1400 df-bit
<span class="c">! Trace from the user LAN without DNS lookups</span>
R1# traceroute 10.3.30.10 source 10.1.10.1 numeric</pre>
<p>Know the result codes. Ping: <b>!</b> reply, <b>.</b> timeout, <b>U</b> destination unreachable (a router sent an ICMP unreachable, often because of a missing route or an ACL), <b>M</b> could not fragment (MTU problem with DF set), <b>&amp;</b> TTL expired (a routing loop). Traceroute: <b>*</b> timeout, <b>A</b> administratively prohibited (an ACL), <b>H</b> host unreachable, <b>N</b> network unreachable. Loss that appears only with large packets and the DF bit points to an MTU problem, typical on GRE and DMVPN tunnels.</p>

<h3>Debugging safely</h3>
<p>Debugs are powerful but they run on the CPU. On a busy router an unfiltered <code>debug ip packet</code> can starve the CPU and cut you off. Rules for safe debugging:</p>
<ul>
<li>Send debug output to the buffer, not the console: <code>no logging console</code> (or <code>logging console warnings</code>) and <code>logging buffered 65536 debugging</code>.</li>
<li>Limit it: with an ACL (<code>debug ip packet 101 detail</code>), a neighbour (<code>debug ip bgp 198.51.100.1 updates</code>) or a condition (<code>debug condition interface GigabitEthernet0/0</code>).</li>
<li>Prefer event debugs such as <code>debug ip ospf adj</code> or <code>debug eigrp packets hello</code> over packet debugs.</li>
<li>Stop quickly: <code>undebug all</code>. Some engineers schedule a safety net with <code>reload in 10</code> on lab-like devices.</li>
</ul>
<pre class="code"><span class="c">! Only packets between PC1 and SRV1</span>
R2(config)# access-list 101 permit ip host 10.1.10.10 host 10.3.30.10
R2(config)# access-list 101 permit ip host 10.3.30.10 host 10.1.10.10
R2# debug ip packet 101 detail
R2# show logging | include IP:
R2# undebug all</pre>

<h3>Logging buffers and timestamps</h3>
<p>Logs are only useful if you can line them up across devices. Use <code>service timestamps log datetime msec localtime show-timezone</code> and the same for <code>debug</code>, and synchronise every device with NTP. Syslog severities are 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. Choosing a level includes everything more severe. Adjacency changes such as <code>%OSPF-5-ADJCHG</code> and <code>%DUAL-5-NBRCHANGE</code> are level 5. On a VTY session you must type <code>terminal monitor</code> to see log messages live.</p>

<h3>SNMP, syslog and NetFlow as evidence</h3>
<p><b>Syslog</b> sent to a central server (<code>logging host</code>) survives reloads and lets you correlate events across routers. <b>SNMP</b> polling produces graphs of interface utilisation, errors, CPU and memory, and traps announce events such as link down. <b>NetFlow</b> records flows (source, destination, ports, protocol, bytes), so it answers "who is filling this link?" and "did this flow ever reach the router?" Each is evidence you can gather without touching the live network.</p>

<h3>IP SLA</h3>
<p>IP SLA makes the router generate synthetic traffic continuously (ICMP echo, UDP jitter, TCP connect, HTTP and more) and record the results. It catches intermittent problems that you would never see with a single ping, and it can drive object tracking for static routes and HSRP.</p>
<pre class="code">R1(config)# ip sla 10
R1(config-ip-sla)# icmp-echo 10.3.30.10 source-interface GigabitEthernet0/1
R1(config-ip-sla-echo)# frequency 10
R1(config)# ip sla schedule 10 life forever start-time now</pre>
<pre class="out">R1# show ip sla statistics 10
IPSLAs Latest Operation Statistics

IPSLA operation id: 10
        Latest RTT: 2 milliseconds
Latest operation start time: 10:15:02 IST Wed Sep 30 2026
<span class="hl">Latest operation return code: OK
Number of successes: 356
Number of failures: 4</span>
Operation time to live: Forever</pre>

<h3>Embedded Packet Capture</h3>
<p>When you need proof of what is on the wire, <b>EPC</b> captures packets on the router itself and exports a pcap file for Wireshark. The IOS XE syntax:</p>
<pre class="code">R3# monitor capture CAP interface GigabitEthernet0/2 both
R3# monitor capture CAP match ipv4 host 10.1.10.10 host 10.3.30.10
R3# monitor capture CAP buffer size 10
R3# monitor capture CAP start
R3# monitor capture CAP stop
R3# show monitor capture CAP buffer brief
R3# monitor capture CAP export flash:cap1.pcap</pre>

<div class="eg"><p><b>Worked example.</b> Users report the payroll application "freezes a few times a day". Pings during the call are 100% fine. The IP SLA on R1 shows 356 successes and 4 failures, and the failure timestamps match the complaints. The syslog server shows <code>%OSPF-5-ADJCHG</code> on R2 Gi0/0 going down and up at the same times, and SNMP graphs show input errors climbing on that interface. Three kinds of evidence agree: an unstable link, not the application.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running an unfiltered <code>debug ip packet</code> on a production router. Beyond the CPU risk, it shows only <b>process-switched</b> packets; CEF-switched transit traffic does not appear, so an empty debug does not prove that traffic is absent.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> sets the severity sent to syslog servers, <code>logging buffered</code> the local buffer, <code>logging console</code> the console and <code>logging monitor</code> the VTY sessions. Level 7 debugging includes all levels; level 4 warnings includes 0 to 4 only.</p></div>

<div class="scn"><h4>The debug that took down the router</h4><p>An engineer investigating a NAT issue on a busy internet edge router typed <code>debug ip nat</code> from a console session with console logging at debugging level. The router tried to print thousands of lines per second on a 9600-baud console, the CPU spiked, BGP keepalives were missed and both ISP sessions dropped. The fix was a reload from the power switch. The next time the same problem was investigated with an ACL-limited debug, console logging disabled and output in the buffer.</p><p><b>Lesson:</b> filter debugs, send them to the buffer, and never debug at full volume to the console on production.</p></div>

<div class="iv"><p class="q">"How do you debug safely on a production router?"</p><p>Disable console logging, log to the buffer with timestamps, limit the debug by ACL, neighbour or condition, prefer event debugs over packet debugs, check CPU first with <code>show processes cpu sorted</code>, and stop with <code>undebug all</code>. Mention that packet debugs only show process-switched traffic and that EPC or NetFlow is often a better choice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters (<code>include</code>, <code>exclude</code>, <code>begin</code>, <code>section</code>, <code>count</code>) make show output usable.</li>
<li>Extended ping and traceroute imitate the user: source, size, DF bit, repeat count; know the result codes.</li>
<li>Safe debugging: buffer not console, ACL or condition limited, <code>undebug all</code> ready.</li>
<li>Timestamps plus NTP plus central syslog make logs from different routers comparable.</li>
<li>SNMP, NetFlow and IP SLA show trends and intermittent faults; EPC proves what is on the wire.</li>
</ul></div>
`,hi:`
<p>Doctor ke paas abhi ke liye stethoscope hai, history ke liye patient file hai, trends ke liye blood-pressure log hai, aur andar dekhne ke liye scan hai. Network engineer ke paas bhi yahi chaar tarah ke tools hain: live commands (show, ping, debug), history (logging buffers aur syslog), trends (SNMP, NetFlow, IP SLA) aur packets ke andar ka view (Embedded Packet Capture). Kaunsa tool aapke abhi ke sawaal ka jawab deta hai, yeh jaanna aadhi troubleshooting hai. Services module baad mein SNMP, NetFlow aur IP SLA ko gehrai se configure karna sikhata hai; yahan aap unhe saboot ki tarah use karna seekhte ho.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Kinds of troubleshooting evidence">
<rect x="250" y="85" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Router</text>
<rect x="20" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="41" text-anchor="middle" class="svg-ink" font-size="13">Live</text><text x="115" y="59" text-anchor="middle" class="svg-muted" font-size="12">show, ping, debug</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="525" y="41" text-anchor="middle" class="svg-ink" font-size="13">History</text><text x="525" y="59" text-anchor="middle" class="svg-muted" font-size="12">log buffer, syslog</text>
<rect x="20" y="150" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="115" y="171" text-anchor="middle" class="svg-ink" font-size="13">Trends</text><text x="115" y="189" text-anchor="middle" class="svg-muted" font-size="12">SNMP, NetFlow, IP SLA</text>
<rect x="430" y="150" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="171" text-anchor="middle" class="svg-ink" font-size="13">Packets</text><text x="525" y="189" text-anchor="middle" class="svg-muted" font-size="12">EPC capture</text>
<line x1="210" y1="45" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="45" x2="390" y2="95" stroke="#64748b" stroke-width="2"/><line x1="210" y1="175" x2="250" y2="125" stroke="#64748b" stroke-width="2"/><line x1="430" y1="175" x2="390" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaar tarah ka saboot: abhi kya ho raha hai, kya hua tha, cheezein kaise trend kar rahi hain, aur packets ke andar kya hai.</p></div>

<h3>Show commands aur output filters</h3>
<p>Bade outputs woh ek line chhupa dete hain jo aapko chahiye. IOS filters unhe chhota karne dete hain: <code>| include</code> (regular expression se match hone wali lines), <code>| exclude</code>, <code>| begin</code> (pehle match se shuru), <code>| section</code> (configuration block aur uske children) aur <code>| count</code> (kitni lines match hoti hain). Examples: <code>show ip route | include ^O|^D</code> sirf OSPF aur EIGRP routes list karta hai; <code>show ip interface brief | exclude unassigned</code> unused interfaces chhupata hai; <code>show logging | include OSPF|EIGRP|BGP</code> adjacency changes dhoondhta hai.</p>

<h3>Extended ping aur traceroute</h3>
<p>Router se plain ping hairaan karne wali baar galat cheez test karta hai. Extended options aapko user ke traffic ki nakal karne dete hain:</p>
<pre class="code"><span class="c">! User LAN se source, 100 packets, 1400 bytes, fragment mat karo</span>
R1# ping 10.3.30.10 source GigabitEthernet0/1 repeat 100 size 1400 df-bit
<span class="c">! User LAN se trace, bina DNS lookups ke</span>
R1# traceroute 10.3.30.10 source 10.1.10.1 numeric</pre>
<p>Result codes jaano. Ping: <b>!</b> reply, <b>.</b> timeout, <b>U</b> destination unreachable (kisi router ne ICMP unreachable bheja, aksar missing route ya ACL ki wajah se), <b>M</b> could not fragment (DF set ke saath MTU problem), <b>&amp;</b> TTL expired (routing loop). Traceroute: <b>*</b> timeout, <b>A</b> administratively prohibited (ACL), <b>H</b> host unreachable, <b>N</b> network unreachable. Jo loss sirf bade packets aur DF bit ke saath dikhe, woh MTU problem ki taraf ishaara karta hai, GRE aur DMVPN tunnels par typical.</p>

<h3>Safely debug karna</h3>
<p>Debugs powerful hain par CPU par chalte hain. Busy router par unfiltered <code>debug ip packet</code> CPU ko bhookha kar sakta hai aur aapka access kaat sakta hai. Safe debugging ke rules:</p>
<ul>
<li>Debug output console par nahi, buffer mein bhejo: <code>no logging console</code> (ya <code>logging console warnings</code>) aur <code>logging buffered 65536 debugging</code>.</li>
<li>Ise limit karo: ACL se (<code>debug ip packet 101 detail</code>), neighbour se (<code>debug ip bgp 198.51.100.1 updates</code>) ya condition se (<code>debug condition interface GigabitEthernet0/0</code>).</li>
<li>Packet debugs ki jagah event debugs prefer karo, jaise <code>debug ip ospf adj</code> ya <code>debug eigrp packets hello</code>.</li>
<li>Jaldi band karo: <code>undebug all</code>. Kuch engineers lab jaise devices par <code>reload in 10</code> se safety net schedule karte hain.</li>
</ul>
<pre class="code"><span class="c">! Sirf PC1 aur SRV1 ke beech ke packets</span>
R2(config)# access-list 101 permit ip host 10.1.10.10 host 10.3.30.10
R2(config)# access-list 101 permit ip host 10.3.30.10 host 10.1.10.10
R2# debug ip packet 101 detail
R2# show logging | include IP:
R2# undebug all</pre>

<h3>Logging buffers aur timestamps</h3>
<p>Logs tabhi useful hain jab aap unhe devices ke beech line up kar sako. <code>service timestamps log datetime msec localtime show-timezone</code> aur <code>debug</code> ke liye bhi yahi use karo, aur har device ko NTP se sync karo. Syslog severities hain 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. Ek level chunne mein usse zyada severe sab kuch aata hai. <code>%OSPF-5-ADJCHG</code> aur <code>%DUAL-5-NBRCHANGE</code> jaise adjacency changes level 5 hain. VTY session par log messages live dekhne ke liye <code>terminal monitor</code> type karna padta hai.</p>

<h3>Saboot ki tarah SNMP, syslog aur NetFlow</h3>
<p>Central server par bheja gaya <b>syslog</b> (<code>logging host</code>) reloads ke baad bhi bachta hai aur routers ke beech events correlate karne deta hai. <b>SNMP</b> polling interface utilisation, errors, CPU aur memory ke graphs banata hai, aur traps link down jaise events announce karte hain. <b>NetFlow</b> flows record karta hai (source, destination, ports, protocol, bytes), isliye yeh jawab deta hai "yeh link kaun bhar raha hai?" aur "kya yeh flow kabhi router tak pahuncha?" Har ek aisa saboot hai jo aap live network ko chhue bina gather kar sakte ho.</p>

<h3>IP SLA</h3>
<p>IP SLA router se lagatar synthetic traffic (ICMP echo, UDP jitter, TCP connect, HTTP aur aur bhi) generate karwata hai aur results record karta hai. Yeh intermittent problems pakadta hai jo aap ek ping se kabhi na dekhte, aur static routes aur HSRP ke liye object tracking chala sakta hai.</p>
<pre class="code">R1(config)# ip sla 10
R1(config-ip-sla)# icmp-echo 10.3.30.10 source-interface GigabitEthernet0/1
R1(config-ip-sla-echo)# frequency 10
R1(config)# ip sla schedule 10 life forever start-time now</pre>
<pre class="out">R1# show ip sla statistics 10
IPSLAs Latest Operation Statistics

IPSLA operation id: 10
        Latest RTT: 2 milliseconds
Latest operation start time: 10:15:02 IST Wed Sep 30 2026
<span class="hl">Latest operation return code: OK
Number of successes: 356
Number of failures: 4</span>
Operation time to live: Forever</pre>

<h3>Embedded Packet Capture</h3>
<p>Jab aapko wire par kya hai iska saboot chahiye, <b>EPC</b> router par hi packets capture karta hai aur Wireshark ke liye pcap file export karta hai. IOS XE syntax:</p>
<pre class="code">R3# monitor capture CAP interface GigabitEthernet0/2 both
R3# monitor capture CAP match ipv4 host 10.1.10.10 host 10.3.30.10
R3# monitor capture CAP buffer size 10
R3# monitor capture CAP start
R3# monitor capture CAP stop
R3# show monitor capture CAP buffer brief
R3# monitor capture CAP export flash:cap1.pcap</pre>

<div class="eg"><p><b>Worked example.</b> Users report karte hain ki payroll application "din mein kuch baar freeze hoti hai". Call ke dauraan pings 100% theek hain. R1 par IP SLA 356 successes aur 4 failures dikhata hai, aur failure timestamps complaints se match karte hain. Syslog server R2 Gi0/0 par unhi samay <code>%OSPF-5-ADJCHG</code> down aur up hote dikhata hai, aur SNMP graphs us interface par input errors badhte dikhate hain. Teen tarah ke saboot sehmat hain: ek unstable link, application nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Production router par unfiltered <code>debug ip packet</code> chalana. CPU risk ke alawa, yeh sirf <b>process-switched</b> packets dikhata hai; CEF-switched transit traffic nahi dikhta, isliye khaali debug yeh sabit nahi karta ki traffic nahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> syslog servers ko bheji jaane wali severity set karta hai, <code>logging buffered</code> local buffer, <code>logging console</code> console aur <code>logging monitor</code> VTY sessions. Level 7 debugging mein saare levels aate hain; level 4 warnings mein sirf 0 se 4.</p></div>

<div class="scn"><h4>Woh debug jisne router gira diya</h4><p>Busy internet edge router par NAT issue investigate kar rahe ek engineer ne debugging level par console logging wale console session se <code>debug ip nat</code> type kiya. Router ne 9600-baud console par har second hazaaron lines print karne ki koshish ki, CPU spike hua, BGP keepalives miss hue aur dono ISP sessions drop ho gaye. Fix power switch se reload tha. Agli baar wahi problem ACL-limited debug, disabled console logging aur buffer mein output ke saath investigate ki gayi.</p><p><b>Seekh:</b> debugs filter karo, unhe buffer mein bhejo, aur production par console par kabhi full volume debug mat karo.</p></div>

<div class="iv"><p class="q">"Production router par aap safely debug kaise karte ho?"</p><p>Console logging disable karo, timestamps ke saath buffer mein log karo, debug ko ACL, neighbour ya condition se limit karo, packet debugs ki jagah event debugs prefer karo, pehle <code>show processes cpu sorted</code> se CPU check karo, aur <code>undebug all</code> se band karo. Mention karo ki packet debugs sirf process-switched traffic dikhate hain aur EPC ya NetFlow aksar behtar choice hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters (<code>include</code>, <code>exclude</code>, <code>begin</code>, <code>section</code>, <code>count</code>) show output ko usable banate hain.</li>
<li>Extended ping aur traceroute user ki nakal karte hain: source, size, DF bit, repeat count; result codes jaano.</li>
<li>Safe debugging: console nahi buffer, ACL ya condition se limited, <code>undebug all</code> tayyar.</li>
<li>Timestamps plus NTP plus central syslog alag routers ke logs ko comparable banate hain.</li>
<li>SNMP, NetFlow aur IP SLA trends aur intermittent faults dikhate hain; EPC sabit karta hai ki wire par kya hai.</li>
</ul></div>
`}};export{e as default};