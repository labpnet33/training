var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Back to the hospital. You now know when to read the history (syslog), take the pulse (ping), follow the vessel (traceroute), run the ward round (SNMP), order a blood test (NetFlow), watch the CCTV (SPAN, RSPAN, ERSPAN), attach a heart monitor with an alarm (IP SLA and tracking) and, only when needed, operate carefully (conditional debug). This chapter is your revision sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can run an extended ping with source, size, df-bit, repeat and timeout, and read every result code.</li>
<li>I can run traceroute with source, numeric, probe and ttl options, and explain stars and !A, !H, !N.</li>
<li>I can prepare a router for debugging, run a debug with an ACL or a condition, and stop it safely.</li>
<li>I can configure SNMPv3 authPriv and explain v2c versus v3, traps versus informs.</li>
<li>I can list the eight syslog levels and explain facility versus the %FACILITY in a message.</li>
<li>I can build a Flexible NetFlow record, exporter and monitor, apply it, and read the cache.</li>
<li>I can configure and verify local SPAN, RSPAN and ERSPAN and name their restrictions.</li>
<li>I can configure IP SLA icmp-echo and udp-jitter, schedule them, enable a responder and verify statistics.</li>
<li>I can build dual-ISP failover with a track object, a tracked static route, a floating backup and a pinned probe.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Domain 4 summary map">
<rect x="20" y="30" width="140" height="120" rx="10" fill="#bae6fd"/><text x="90" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.1 Diagnose</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="12">ping, traceroute</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">debug, conditional</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">SNMP, syslog</text>
<rect x="175" y="30" width="140" height="120" rx="10" fill="#bbf7d0"/><text x="245" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.2 FNF</text><text x="245" y="84" text-anchor="middle" class="svg-muted" font-size="12">record</text><text x="245" y="104" text-anchor="middle" class="svg-muted" font-size="12">exporter, monitor</text><text x="245" y="124" text-anchor="middle" class="svg-muted" font-size="12">v5, v9, IPFIX</text>
<rect x="330" y="30" width="140" height="120" rx="10" fill="#ddd6fe"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.3 SPAN</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="12">local</text><text x="400" y="104" text-anchor="middle" class="svg-muted" font-size="12">RSPAN VLAN</text><text x="400" y="124" text-anchor="middle" class="svg-muted" font-size="12">ERSPAN GRE</text>
<rect x="485" y="30" width="140" height="120" rx="10" fill="#fde68a"/><text x="555" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.4 IP SLA</text><text x="555" y="84" text-anchor="middle" class="svg-muted" font-size="12">icmp-echo, jitter</text><text x="555" y="104" text-anchor="middle" class="svg-muted" font-size="12">schedule, responder</text><text x="555" y="124" text-anchor="middle" class="svg-muted" font-size="12">track + static</text>
</svg><p class="cap">The four blueprint items of ENCOR domain 4.0 and what each one covers.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Conditional debug</dt><dd>A debug filtered by <code>debug condition</code> to one interface, IP address or other attribute.</dd>
<dt>Inform</dt><dd>An SNMP notification that must be acknowledged; a trap is not.</dd>
<dt>authPriv</dt><dd>SNMPv3 security level with authentication and encryption.</dd>
<dt>Flow record</dt><dd>FNF definition of key (<code>match</code>) and non-key (<code>collect</code>) fields.</dd>
<dt>Flow exporter / monitor</dt><dd>Where records are sent / the cache that ties record and exporter together.</dd>
<dt>IPFIX</dt><dd>IETF standard flow export format based on NetFlow v9.</dd>
<dt>RSPAN VLAN</dt><dd>A VLAN marked <code>remote-span</code> that carries mirrored frames across trunks.</dd>
<dt>ERSPAN ID</dt><dd>Session identifier in the ERSPAN header; must match at source and destination.</dd>
<dt>IP SLA responder</dt><dd>Cisco component that answers probes and timestamps them; control on UDP 1967.</dd>
<dt>Track object</dt><dd>An Up/Down state derived from an interface, route, IP SLA or list, used by routes, FHRPs and EEM.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Ping codes: ! reply, . timeout, U unreachable, M could not fragment, Q source quench, &amp; TTL exceeded.</li>
<li>IOS traceroute uses UDP from port 33434; routers reply time exceeded, the destination port unreachable.</li>
<li>Debug output is level 7; <code>undebug all</code> stops everything; remove debugs before the last condition.</li>
<li>SNMP 161 (agent), 162 (notifications); syslog 514; v3 users are not in the running-config.</li>
<li>Syslog: 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging; default facility local7.</li>
<li>Traditional NetFlow keys: src/dst IP, src/dst port, protocol, ToS, input interface. Inactive 15 s, active 30 min.</li>
<li>v5 fixed IPv4; v9 templates; IPFIX IETF standard ("v10"), port 4739.</li>
<li>SPAN default direction both; destination: no MAC learning, no STP, no ingress by default.</li>
<li>RSPAN: remote-span VLAN on every switch, allowed on every trunk; sessions only at the ends.</li>
<li>ERSPAN: GRE protocol 47, type II 0x88BE; sessions start shut down; IDs must match.</li>
<li>IP SLA: nothing runs until scheduled; frequency in seconds, threshold and timeout in ms; udp-jitter needs a responder.</li>
<li>Track reachability = OK or Over threshold is Up; state = only OK is Up.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code">ping 198.51.100.10 source g0/2 size 1500 df-bit repeat 100
traceroute 198.51.100.10 source g0/2 numeric
no logging console / logging buffered 64000 debugging / terminal monitor
debug condition interface g0/1 / show debug condition / undebug all
snmp-server group G v3 priv / snmp-server user U G v3 auth sha P1 priv aes 128 P2
logging host 192.0.2.30 / logging trap informational
flow record R / flow exporter E / flow monitor M / ip flow monitor M input
show flow monitor M cache / show flow exporter statistics
monitor session 1 source interface g0/3 [rx|tx|both]
monitor session 1 destination interface g0/7
vlan 999 / remote-span / monitor session 1 destination remote vlan 999
monitor session 10 type erspan-source / erspan-id 77 / origin ip address
ip sla 1 / icmp-echo 203.0.113.53 source-interface g0/0 / frequency 5
ip sla schedule 1 life forever start-time now / ip sla responder
track 1 ip sla 1 reachability / delay down 5 up 10
ip route 0.0.0.0 0.0.0.0 10.0.1.1 track 1
show ip sla statistics / show track / show monitor session 1</pre>

<div class="eg"><p><b>Worked example.</b> Exam style: "A track object stays Up although the ISP link is congested and IP SLA reports Over threshold. The engineer wants failover in that case." Answer: change the track to <code>track 1 ip sla 1 state</code>, because reachability treats Over threshold as Up, and make sure a <code>threshold</code> is configured in the operation.</p></div>

<div class="warn"><p><b>Common mistake.</b> Revising commands without the verification outputs. Many exam items show <code>show monitor session</code>, <code>show flow monitor cache</code>, <code>show ip sla statistics</code> or <code>show track</code> output and ask what is wrong. Practise reading them in the labs.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the units and defaults: SPAN direction both, IP SLA frequency 60 s by default, life 3600 s by default, syslog trap level informational by default, FNF export protocol NetFlow v9 by default.</p></div>

<div class="scn"><h4>An assurance baseline for a new branch</h4><p>A network lead wrote a standard for every new branch: syslog at informational to two servers from Loopback0, SNMPv3 authPriv only, Flexible NetFlow input on LAN and WAN exporting v9 to the collector, an IP SLA icmp-echo per ISP with tracking and a pinned probe, a udp-jitter to the data centre responder, and one spare labelled SPAN port. Mean time to resolve branch tickets dropped by half within three months because every ticket arrived with data already collected.</p><p><b>Lesson:</b> assurance is designed in advance, not added during an outage.</p></div>

<div class="iv"><p class="q">"If you could enable only three assurance features on every branch router, which would you choose and why?"</p><p>A strong answer: syslog to a central server with correct timestamps (events and history), Flexible NetFlow export (who and what is using the links), and IP SLA with object tracking to each ISP (continuous path measurement plus automatic failover). Justify SNMPv3 as a close fourth for counters, and explain that debugs and SPAN are on-demand tools, not permanent features.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>4.1 diagnose: ping, traceroute, debug, conditional debug, SNMP, syslog.</li>
<li>4.2 Flexible NetFlow: record, exporter, monitor, interface; v5, v9, IPFIX.</li>
<li>4.3 SPAN, RSPAN (remote-span VLAN), ERSPAN (GRE, ID, origin).</li>
<li>4.4 IP SLA: operations, schedule, responder, statistics, and tracking for failover.</li>
<li>Know the defaults and the verification outputs as well as the configuration commands.</li>
</ul></div>
`,hi:`
<p>Wapas hospital par. Ab aap jaante ho ki kab history padhni hai (syslog), pulse leni hai (ping), vessel follow karni hai (traceroute), ward round chalana hai (SNMP), blood test karwana hai (NetFlow), CCTV dekhna hai (SPAN, RSPAN, ERSPAN), alarm wala heart monitor lagana hai (IP SLA aur tracking) aur, sirf zaroorat par, dhyan se operate karna hai (conditional debug). Yeh chapter aapki revision sheet hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main source, size, df-bit, repeat aur timeout ke saath extended ping chala sakta hoon, aur har result code padh sakta hoon.</li>
<li>Main source, numeric, probe aur ttl options ke saath traceroute chala sakta hoon, aur stars aur !A, !H, !N samjha sakta hoon.</li>
<li>Main router ko debugging ke liye tayyar kar sakta hoon, ACL ya condition ke saath debug chala sakta hoon, aur use safely rok sakta hoon.</li>
<li>Main SNMPv3 authPriv configure kar sakta hoon aur v2c versus v3, traps versus informs samjha sakta hoon.</li>
<li>Main aath syslog levels list kar sakta hoon aur facility versus message ke andar ka %FACILITY samjha sakta hoon.</li>
<li>Main Flexible NetFlow record, exporter aur monitor bana sakta hoon, use apply kar sakta hoon, aur cache padh sakta hoon.</li>
<li>Main local SPAN, RSPAN aur ERSPAN configure aur verify kar sakta hoon aur unki restrictions bata sakta hoon.</li>
<li>Main IP SLA icmp-echo aur udp-jitter configure kar sakta hoon, unhe schedule kar sakta hoon, responder enable kar sakta hoon aur statistics verify kar sakta hoon.</li>
<li>Main track object, tracked static route, floating backup aur pinned probe ke saath dual-ISP failover bana sakta hoon.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Domain 4 summary map">
<rect x="20" y="30" width="140" height="120" rx="10" fill="#bae6fd"/><text x="90" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.1 Diagnose</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="12">ping, traceroute</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="12">debug, conditional</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">SNMP, syslog</text>
<rect x="175" y="30" width="140" height="120" rx="10" fill="#bbf7d0"/><text x="245" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.2 FNF</text><text x="245" y="84" text-anchor="middle" class="svg-muted" font-size="12">record</text><text x="245" y="104" text-anchor="middle" class="svg-muted" font-size="12">exporter, monitor</text><text x="245" y="124" text-anchor="middle" class="svg-muted" font-size="12">v5, v9, IPFIX</text>
<rect x="330" y="30" width="140" height="120" rx="10" fill="#ddd6fe"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.3 SPAN</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="12">local</text><text x="400" y="104" text-anchor="middle" class="svg-muted" font-size="12">RSPAN VLAN</text><text x="400" y="124" text-anchor="middle" class="svg-muted" font-size="12">ERSPAN GRE</text>
<rect x="485" y="30" width="140" height="120" rx="10" fill="#fde68a"/><text x="555" y="58" text-anchor="middle" class="svg-ink" font-size="14">4.4 IP SLA</text><text x="555" y="84" text-anchor="middle" class="svg-muted" font-size="12">icmp-echo, jitter</text><text x="555" y="104" text-anchor="middle" class="svg-muted" font-size="12">schedule, responder</text><text x="555" y="124" text-anchor="middle" class="svg-muted" font-size="12">track + static</text>
</svg><p class="cap">ENCOR domain 4.0 ke chaar blueprint items aur har ek kya cover karta hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Conditional debug</dt><dd><code>debug condition</code> se ek interface, IP address ya kisi aur attribute tak filter kiya gaya debug.</dd>
<dt>Inform</dt><dd>SNMP notification jise acknowledge hona zaroori hai; trap ko nahi.</dd>
<dt>authPriv</dt><dd>Authentication aur encryption wala SNMPv3 security level.</dd>
<dt>Flow record</dt><dd>Key (<code>match</code>) aur non-key (<code>collect</code>) fields ki FNF definition.</dd>
<dt>Flow exporter / monitor</dt><dd>Records kahan bheje jaate hain / woh cache jo record aur exporter ko jodta hai.</dd>
<dt>IPFIX</dt><dd>NetFlow v9 par based IETF standard flow export format.</dd>
<dt>RSPAN VLAN</dt><dd><code>remote-span</code> marked VLAN jo mirrored frames ko trunks ke across le jaata hai.</dd>
<dt>ERSPAN ID</dt><dd>ERSPAN header mein session identifier; source aur destination par match hona chahiye.</dd>
<dt>IP SLA responder</dt><dd>Cisco component jo probes ka jawab deta hai aur unhe timestamp karta hai; control UDP 1967 par.</dd>
<dt>Track object</dt><dd>Interface, route, IP SLA ya list se bani Up/Down state, jise routes, FHRPs aur EEM use karte hain.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>Ping codes: ! reply, . timeout, U unreachable, M could not fragment, Q source quench, &amp; TTL exceeded.</li>
<li>IOS traceroute port 33434 se UDP use karta hai; routers time exceeded, destination port unreachable jawab dete hain.</li>
<li>Debug output level 7 hai; <code>undebug all</code> sab rokta hai; aakhri condition se pehle debugs hatao.</li>
<li>SNMP 161 (agent), 162 (notifications); syslog 514; v3 users running-config mein nahi hote.</li>
<li>Syslog: 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging; default facility local7.</li>
<li>Traditional NetFlow keys: src/dst IP, src/dst port, protocol, ToS, input interface. Inactive 15 s, active 30 min.</li>
<li>v5 fixed IPv4; v9 templates; IPFIX IETF standard ("v10"), port 4739.</li>
<li>SPAN default direction both; destination: MAC learning nahi, STP nahi, default mein ingress nahi.</li>
<li>RSPAN: har switch par remote-span VLAN, har trunk par allowed; sessions sirf ends par.</li>
<li>ERSPAN: GRE protocol 47, type II 0x88BE; sessions shutdown state mein shuru hote hain; IDs match hone chahiye.</li>
<li>IP SLA: schedule hone tak kuch nahi chalta; frequency seconds mein, threshold aur timeout ms mein; udp-jitter ko responder chahiye.</li>
<li>Track reachability = OK ya Over threshold Up hai; state = sirf OK Up hai.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code">ping 198.51.100.10 source g0/2 size 1500 df-bit repeat 100
traceroute 198.51.100.10 source g0/2 numeric
no logging console / logging buffered 64000 debugging / terminal monitor
debug condition interface g0/1 / show debug condition / undebug all
snmp-server group G v3 priv / snmp-server user U G v3 auth sha P1 priv aes 128 P2
logging host 192.0.2.30 / logging trap informational
flow record R / flow exporter E / flow monitor M / ip flow monitor M input
show flow monitor M cache / show flow exporter statistics
monitor session 1 source interface g0/3 [rx|tx|both]
monitor session 1 destination interface g0/7
vlan 999 / remote-span / monitor session 1 destination remote vlan 999
monitor session 10 type erspan-source / erspan-id 77 / origin ip address
ip sla 1 / icmp-echo 203.0.113.53 source-interface g0/0 / frequency 5
ip sla schedule 1 life forever start-time now / ip sla responder
track 1 ip sla 1 reachability / delay down 5 up 10
ip route 0.0.0.0 0.0.0.0 10.0.1.1 track 1
show ip sla statistics / show track / show monitor session 1</pre>

<div class="eg"><p><b>Worked example.</b> Exam style: "ISP link congested hai aur IP SLA Over threshold report karta hai, phir bhi track object Up rehta hai. Engineer us case mein failover chahta hai." Jawab: track ko <code>track 1 ip sla 1 state</code> mein badlo, kyunki reachability Over threshold ko Up maanta hai, aur pakka karo ki operation mein <code>threshold</code> configured hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Verification outputs ke bina commands revise karna. Kai exam items <code>show monitor session</code>, <code>show flow monitor cache</code>, <code>show ip sla statistics</code> ya <code>show track</code> output dikhakar poochte hain ki kya galat hai. Labs mein unhe padhne ki practice karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Units aur defaults par dhyan do: SPAN direction both, IP SLA frequency default 60 s, life default 3600 s, syslog trap level default informational, FNF export protocol default NetFlow v9.</p></div>

<div class="scn"><h4>Nayi branch ke liye assurance baseline</h4><p>Ek network lead ne har nayi branch ke liye ek standard likha: Loopback0 se do servers ko informational par syslog, sirf SNMPv3 authPriv, LAN aur WAN par Flexible NetFlow input jo collector ko v9 export kare, har ISP ke liye tracking aur pinned probe ke saath IP SLA icmp-echo, data centre responder tak ek udp-jitter, aur ek spare labelled SPAN port. Teen mahine mein branch tickets resolve karne ka average time aadha ho gaya kyunki har ticket ke saath data pehle se collected hota tha.</p><p><b>Seekh:</b> assurance pehle se design kiya jaata hai, outage ke dauran joda nahi jaata.</p></div>

<div class="iv"><p class="q">"Agar aap har branch router par sirf teen assurance features enable kar sako, to kaunse chunoge aur kyun?"</p><p>Strong answer: sahi timestamps ke saath central server ko syslog (events aur history), Flexible NetFlow export (links kaun aur kya use kar raha hai), aur har ISP ki taraf object tracking ke saath IP SLA (lagatar path measurement plus automatic failover). Counters ke liye SNMPv3 ko kareebi chautha batao, aur samjhao ki debugs aur SPAN on-demand tools hain, permanent features nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>4.1 diagnose: ping, traceroute, debug, conditional debug, SNMP, syslog.</li>
<li>4.2 Flexible NetFlow: record, exporter, monitor, interface; v5, v9, IPFIX.</li>
<li>4.3 SPAN, RSPAN (remote-span VLAN), ERSPAN (GRE, ID, origin).</li>
<li>4.4 IP SLA: operations, schedule, responder, statistics, aur failover ke liye tracking.</li>
<li>Configuration commands ke saath defaults aur verification outputs bhi aane chahiye.</li>
</ul></div>
`}};export{e as default};