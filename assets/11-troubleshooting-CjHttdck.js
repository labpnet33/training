var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: "Logs have the wrong time"`,hi:`Troubleshooting workflow: "Logs ka time galat hai"`},body:{en:`
<p>A good doctor does not prescribe medicine for "I feel bad". She checks temperature, then pulse, then blood tests, in a fixed order, and each result tells her where to look next. Operations services break in a small number of predictable ways, so a fixed order of checks finds almost every fault in minutes. This chapter gives you that order and then walks through the lab ticket <b>"Logs have the wrong time"</b> step by step.</p>

<h3>The NTP workflow</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="NTP troubleshooting flow">
<rect x="20" y="10" width="280" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="13">1 show ntp status: synchronized?</text>
<rect x="20" y="70" width="280" height="40" rx="8" fill="#bae6fd"/><text x="160" y="95" text-anchor="middle" class="svg-ink" font-size="13">2 show ntp associations: reach, st</text>
<rect x="20" y="130" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="13">3 Right server address?</text>
<rect x="20" y="190" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="215" text-anchor="middle" class="svg-ink" font-size="13">4 ping / route / source to server</text>
<rect x="20" y="250" width="280" height="40" rx="8" fill="#fde68a"/><text x="160" y="275" text-anchor="middle" class="svg-ink" font-size="13">5 ACLs: is UDP 123 blocked?</text>
<rect x="340" y="10" width="280" height="40" rx="8" fill="#fde68a"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="13">6 Is the server itself synced?</text>
<rect x="340" y="70" width="280" height="40" rx="8" fill="#fed7aa"/><text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="13">7 Authentication keys match?</text>
<rect x="340" y="130" width="280" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">8 clock timezone set?</text>
<rect x="340" y="190" width="280" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="215" text-anchor="middle" class="svg-ink" font-size="13">9 service timestamps localtime?</text>
<rect x="340" y="250" width="280" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="275" text-anchor="middle" class="svg-ink" font-size="13">10 Prove it on the collector</text>
<line x1="160" y1="50" x2="160" y2="70" stroke="#64748b" stroke-width="2"/><line x1="160" y1="110" x2="160" y2="130" stroke="#64748b" stroke-width="2"/><line x1="160" y1="170" x2="160" y2="190" stroke="#64748b" stroke-width="2"/><line x1="160" y1="230" x2="160" y2="250" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="270" x2="330" y2="270" stroke="#64748b" stroke-width="2"/><line x1="330" y1="270" x2="330" y2="30" stroke="#64748b" stroke-width="2"/><line x1="330" y1="30" x2="340" y2="30" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="50" x2="480" y2="70" stroke="#64748b" stroke-width="2"/><line x1="480" y1="110" x2="480" y2="130" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="480" y2="190" stroke="#64748b" stroke-width="2"/><line x1="480" y1="230" x2="480" y2="250" stroke="#64748b" stroke-width="2"/>
<text x="320" y="318" text-anchor="middle" class="svg-muted" font-size="12">Steps 1-7 fix synchronisation; 8-10 fix how the time is shown and prove it</text>
</svg><p class="cap">Work top to bottom on the left, then the right. Most tickets end at step 3, 5 or 9.</p></div>

<table class="cmp"><tr><th>Symptom in associations</th><th>Likely cause</th></tr>
<tr><td>reach 0, ref clock .INIT., st 16</td><td>Nothing heard: wrong address, no route, ACL blocking UDP 123, server down</td></tr>
<tr><td>reach rising, st 16 in the line</td><td>The server answers but is itself unsynchronised</td></tr>
<tr><td>reach rising, no <code>*</code> after minutes</td><td>Authentication failing (key, trusted-key), or server rejected as falseticker</td></tr>
<tr><td><code>*</code> present, status synchronized, logs still wrong</td><td>Display problem: clock timezone or service timestamps</td></tr></table>

<h3>The lab ticket</h3>
<p>The security team is investigating a link flap at 14:05 IST. The syslog server (10.1.1.100) shows R1's messages five hours in the past and R2's two hours in the future, all in UTC with a star. The standard: every router synchronised to <b>NTP-SRV 10.1.1.123</b>, R2 via R1, logs in IST with the zone printed.</p>

<h4>Step 1 and 2 on R1</h4>
<pre class="out">R1# show ntp status
<span class="hl">Clock is unsynchronized, stratum 16, no reference clock</span>

R1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl"> ~10.1.1.132      .INIT.          16      -     64     0  0.000   0.000 15937.</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured</pre>
<p>Reach 0, .INIT., st 16: R1 has never heard from 10.1.1.132. <b>Step 3</b>: compare the address with the ticket: the server is <code>10.1.1.123</code>. The digits were transposed. There is no host at .132.</p>
<pre class="code">R1(config)# no ntp server 10.1.1.132
R1(config)# ntp server 10.1.1.123</pre>
<p>A minute later <code>show ntp status</code> on R1 says <code>Clock is synchronized, stratum 2, reference is 10.1.1.123</code>.</p>

<h4>R2 still does not synchronise</h4>
<pre class="out">R2# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl"> ~10.1.12.1       .INIT.          16      -     64     0  0.000   0.000 15937.</span>

R2# ping 10.1.12.1
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>
<p>R1 is now a valid stratum-2 server and ping works, so routing is fine (<b>step 4</b>). Ping is ICMP; NTP is UDP 123. <b>Step 5</b>: look for filters on R2.</p>
<pre class="out">R2# show ip access-lists WAN-IN
Extended IP access list WAN-IN
<span class="hl">    10 deny udp any any eq ntp (27 matches)</span>
    20 permit ip any any (412 matches)
R2# show ip interface GigabitEthernet0/0 | include access list
  Outgoing access list is not set
<span class="hl">  Inbound  access list is WAN-IN</span></pre>
<p>Line 10 drops every packet to UDP 123 arriving on Gi0/0, including R1's NTP replies, and its match counter is rising. The ticket forbids removing the ACL from the interface, so remove the line (or insert a specific permit before it, such as <code>5 permit udp host 10.1.12.1 any eq ntp</code>):</p>
<pre class="code">R2(config)# ip access-list extended WAN-IN
R2(config-ext-nacl)# no 10</pre>

<h4>Steps 8 and 9 on both routers</h4>
<pre class="code">R1(config)# clock timezone IST 5 30
R1(config)# service timestamps log datetime msec localtime show-timezone
<span class="c">! the same two lines on R2</span></pre>

<h4>Step 10: prove it</h4>
<pre class="out">R2# show ntp status
<span class="hl">Clock is synchronized, stratum 3, reference is 10.1.12.1</span>

R2# configure terminal
R2(config)# end

SYSLOG&gt; show syslog
Syslog collector on 10.1.1.100 (UDP 514): 9 messages received
Received (UTC)   From            Sev  Message
Sep 29 08:21:40  10.1.12.2       5    &lt;189&gt;*Sep 29 10:32:51.207: %SYS-5-CONFIG_I: Configured from console by console
<span class="hl">Sep 29 08:36:02  10.1.12.2       5    &lt;189&gt;Sep 29 14:06:02.118 IST: %SYS-5-CONFIG_I: Configured from console by console</span></pre>
<p>The old message has a star and UTC two hours ahead; the new one is in IST, with no star. R2 is stratum 3: NTP-SRV 1, R1 2, R2 3.</p>

<div class="eg"><p><b>Worked example.</b> Before the fix, R2's log said 10:32 UTC while the real UTC was 08:21 (the collector's receive time), an error of 2 h 11 min, exactly the offset in the lab. R1's messages were stamped about 03:21 UTC, 4 h 57 min behind. After the fix, the device stamp and the collector's receive time agree to within a second once converted: 14:06:02 IST − 5:30 = 08:36:02 UTC.</p></div>

<h3>Quick checks for syslog and SNMP</h3>
<table class="cmp"><tr><th>Problem</th><th>Check</th></tr>
<tr><td>Server receives nothing</td><td><code>show logging</code>: host listed? trap level? Route and ACLs for UDP 514; <code>logging source-interface</code> matches server filters?</td></tr>
<tr><td>Some messages missing</td><td>Trap level too low (e.g. warnings drops level 5 and 6); sequence-number gaps show UDP loss.</td></tr>
<tr><td>Nothing on SSH session</td><td><code>terminal monitor</code> in that session; <code>logging monitor</code> level.</td></tr>
<tr><td>NMS poll times out</td><td><code>show snmp</code>: "Unknown community name" rising = wrong string or ACL; community ACL content; UDP 161 filters.</td></tr>
<tr><td>No traps</td><td><code>snmp-server enable traps</code> present? <code>snmp-server host</code> address and version/community correct? UDP 162 path.</td></tr>
<tr><td>SNMPv3 fails</td><td><code>show snmp user</code> / <code>show snmp group</code>: security level of group vs user (priv requires both passwords), matching SHA/AES on the NMS.</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Concluding "the path is fine" because ping works. ACLs, firewalls and control-plane policies often allow ICMP but block UDP 123, 161 or 514. Always check filters for the actual protocol and port.</p></div>

<div class="exam"><p><b>Exam trap.</b> A router whose server is unreachable shows <code>.INIT.</code>, st 16 and reach 0 in associations, and <code>unsynchronized, stratum 16</code> in status. Correct time with UTC stamps is a timestamp setting problem, not an NTP problem.</p></div>

<div class="scn"><h4>Two bugs hiding behind one symptom</h4><p>A real outage review looked exactly like the lab. The first engineer fixed the typo on the core router and saw it synchronise, so he closed the ticket. The branch router behind it was still wrong the next day, because an old "block NTP from the internet" ACL on the WAN interface also blocked NTP from its own upstream router. Only following the full workflow on every device in the chain found the second fault.</p><p><b>Lesson:</b> NTP is a chain. Verify every hop from the source to the last client, and verify on the collector, not just on one router.</p></div>

<div class="iv"><p class="q">"A router's show ntp associations shows reach 0 and .INIT. How do you troubleshoot?"</p><p>Strong answer: reach 0 and .INIT. mean no reply has ever been received. Check the configured address against the design, then reachability and routing from the NTP source interface, then ACLs and firewalls for UDP 123 in both directions (show ip access-lists match counters), then whether the server is itself synchronised and whether authentication keys match. After sync, check time zone and <code>service timestamps</code> and confirm on the syslog server.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: status → associations → address → path → ACLs → server health → authentication → time zone → timestamps → prove.</li>
<li>reach 0 + .INIT. + st 16 = nothing heard from the server.</li>
<li>Ping success does not prove UDP 123, 161 or 514 is allowed; read ACL match counters.</li>
<li>Lab 2 fixes: server 10.1.1.132 → 10.1.1.123 on R1, remove <code>deny udp any any eq ntp</code> on R2, add time zone and <code>localtime show-timezone</code>; R2 ends at stratum 3.</li>
<li>Always prove the result on the collector.</li>
</ul></div>
`,hi:`
<p>Achhi doctor "mujhe achha nahi lag raha" sun kar dawai nahi likhti. Woh pehle temperature, phir pulse, phir blood tests check karti hai, ek fixed order mein, aur har result batata hai ki aage kahan dekhna hai. Operations services kuch gine chune predictable tareekon se tootti hain, isliye checks ka ek fixed order lagbhag har fault minutes mein dhoondh leta hai. Yeh chapter aapko woh order deta hai aur phir lab ticket <b>"Logs have the wrong time"</b> ko step by step walk karta hai.</p>

<h3>NTP workflow</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="NTP troubleshooting flow">
<rect x="20" y="10" width="280" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="13">1 show ntp status: synchronized?</text>
<rect x="20" y="70" width="280" height="40" rx="8" fill="#bae6fd"/><text x="160" y="95" text-anchor="middle" class="svg-ink" font-size="13">2 show ntp associations: reach, st</text>
<rect x="20" y="130" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="13">3 Server address sahi hai?</text>
<rect x="20" y="190" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="215" text-anchor="middle" class="svg-ink" font-size="13">4 Server tak ping / route / source</text>
<rect x="20" y="250" width="280" height="40" rx="8" fill="#fde68a"/><text x="160" y="275" text-anchor="middle" class="svg-ink" font-size="13">5 ACLs: UDP 123 blocked hai?</text>
<rect x="340" y="10" width="280" height="40" rx="8" fill="#fde68a"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="13">6 Server khud synced hai?</text>
<rect x="340" y="70" width="280" height="40" rx="8" fill="#fed7aa"/><text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="13">7 Authentication keys match?</text>
<rect x="340" y="130" width="280" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="13">8 clock timezone set hai?</text>
<rect x="340" y="190" width="280" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="215" text-anchor="middle" class="svg-ink" font-size="13">9 service timestamps localtime?</text>
<rect x="340" y="250" width="280" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="275" text-anchor="middle" class="svg-ink" font-size="13">10 Collector par sabit karo</text>
<line x1="160" y1="50" x2="160" y2="70" stroke="#64748b" stroke-width="2"/><line x1="160" y1="110" x2="160" y2="130" stroke="#64748b" stroke-width="2"/><line x1="160" y1="170" x2="160" y2="190" stroke="#64748b" stroke-width="2"/><line x1="160" y1="230" x2="160" y2="250" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="270" x2="330" y2="270" stroke="#64748b" stroke-width="2"/><line x1="330" y1="270" x2="330" y2="30" stroke="#64748b" stroke-width="2"/><line x1="330" y1="30" x2="340" y2="30" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="50" x2="480" y2="70" stroke="#64748b" stroke-width="2"/><line x1="480" y1="110" x2="480" y2="130" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="480" y2="190" stroke="#64748b" stroke-width="2"/><line x1="480" y1="230" x2="480" y2="250" stroke="#64748b" stroke-width="2"/>
<text x="320" y="318" text-anchor="middle" class="svg-muted" font-size="12">Steps 1-7 synchronisation theek karte hain; 8-10 time dikhane ka tareeka theek karke sabit karte hain</text>
</svg><p class="cap">Pehle left side upar se neeche, phir right. Zyada tar tickets step 3, 5 ya 9 par khatam hote hain.</p></div>

<table class="cmp"><tr><th>Associations mein symptom</th><th>Sambhavit wajah</th></tr>
<tr><td>reach 0, ref clock .INIT., st 16</td><td>Kuch suna nahi: galat address, route nahi, ACL UDP 123 block kar rahi, server down</td></tr>
<tr><td>reach badh raha, line mein st 16</td><td>Server jawab deta hai lekin khud unsynchronised hai</td></tr>
<tr><td>reach badh raha, minutes baad bhi <code>*</code> nahi</td><td>Authentication fail (key, trusted-key), ya server falseticker ki tarah reject</td></tr>
<tr><td><code>*</code> hai, status synchronized, logs phir bhi galat</td><td>Display problem: clock timezone ya service timestamps</td></tr></table>

<h3>Lab ticket</h3>
<p>Security team 14:05 IST ke ek link flap ki jaanch kar rahi hai. Syslog server (10.1.1.100) R1 ke messages paanch ghante peeche aur R2 ke do ghante aage dikhata hai, sab UTC mein star ke saath. Standard: har router <b>NTP-SRV 10.1.1.123</b> se synced, R2 R1 ke through, logs IST mein zone print karke.</p>

<h4>R1 par Step 1 aur 2</h4>
<pre class="out">R1# show ntp status
<span class="hl">Clock is unsynchronized, stratum 16, no reference clock</span>

R1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl"> ~10.1.1.132      .INIT.          16      -     64     0  0.000   0.000 15937.</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured</pre>
<p>Reach 0, .INIT., st 16: R1 ne 10.1.1.132 se kabhi kuch nahi suna. <b>Step 3</b>: address ko ticket se milao: server <code>10.1.1.123</code> hai. Digits ulat gaye the. .132 par koi host nahi hai.</p>
<pre class="code">R1(config)# no ntp server 10.1.1.132
R1(config)# ntp server 10.1.1.123</pre>
<p>Ek minute baad R1 par <code>show ntp status</code> kehta hai <code>Clock is synchronized, stratum 2, reference is 10.1.1.123</code>.</p>

<h4>R2 abhi bhi sync nahi hota</h4>
<pre class="out">R2# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl"> ~10.1.12.1       .INIT.          16      -     64     0  0.000   0.000 15937.</span>

R2# ping 10.1.12.1
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>
<p>R1 ab valid stratum-2 server hai aur ping chalta hai, isliye routing theek hai (<b>step 4</b>). Ping ICMP hai; NTP UDP 123 hai. <b>Step 5</b>: R2 par filters dhoondho.</p>
<pre class="out">R2# show ip access-lists WAN-IN
Extended IP access list WAN-IN
<span class="hl">    10 deny udp any any eq ntp (27 matches)</span>
    20 permit ip any any (412 matches)
R2# show ip interface GigabitEthernet0/0 | include access list
  Outgoing access list is not set
<span class="hl">  Inbound  access list is WAN-IN</span></pre>
<p>Line 10 Gi0/0 par aane wala UDP 123 ka har packet drop karti hai, R1 ke NTP replies samet, aur uska match counter badh raha hai. Ticket interface se ACL hatane se mana karta hai, isliye line hatao (ya usse pehle ek specific permit daalo, jaise <code>5 permit udp host 10.1.12.1 any eq ntp</code>):</p>
<pre class="code">R2(config)# ip access-list extended WAN-IN
R2(config-ext-nacl)# no 10</pre>

<h4>Dono routers par Steps 8 aur 9</h4>
<pre class="code">R1(config)# clock timezone IST 5 30
R1(config)# service timestamps log datetime msec localtime show-timezone
<span class="c">! wahi do lines R2 par</span></pre>

<h4>Step 10: sabit karo</h4>
<pre class="out">R2# show ntp status
<span class="hl">Clock is synchronized, stratum 3, reference is 10.1.12.1</span>

R2# configure terminal
R2(config)# end

SYSLOG&gt; show syslog
Syslog collector on 10.1.1.100 (UDP 514): 9 messages received
Received (UTC)   From            Sev  Message
Sep 29 08:21:40  10.1.12.2       5    &lt;189&gt;*Sep 29 10:32:51.207: %SYS-5-CONFIG_I: Configured from console by console
<span class="hl">Sep 29 08:36:02  10.1.12.2       5    &lt;189&gt;Sep 29 14:06:02.118 IST: %SYS-5-CONFIG_I: Configured from console by console</span></pre>
<p>Purane message par star hai aur UTC do ghante aage; naya IST mein hai, bina star ke. R2 stratum 3 hai: NTP-SRV 1, R1 2, R2 3.</p>

<div class="eg"><p><b>Worked example.</b> Fix se pehle R2 ka log 10:32 UTC keh raha tha jabki asli UTC 08:21 tha (collector ka receive time), 2 h 11 min ki error, bilkul lab ka offset. R1 ke messages lagbhag 03:21 UTC stamp hote the, 4 h 57 min peeche. Fix ke baad convert karne par device stamp aur collector ka receive time ek second ke andar match karte hain: 14:06:02 IST − 5:30 = 08:36:02 UTC.</p></div>

<h3>Syslog aur SNMP ke quick checks</h3>
<table class="cmp"><tr><th>Problem</th><th>Check</th></tr>
<tr><td>Server ko kuch nahi milta</td><td><code>show logging</code>: host listed hai? trap level? UDP 514 ke liye route aur ACLs; <code>logging source-interface</code> server filters se match karta hai?</td></tr>
<tr><td>Kuch messages missing</td><td>Trap level bahut kam (jaise warnings level 5 aur 6 gira deta hai); sequence-number gaps UDP loss dikhate hain.</td></tr>
<tr><td>SSH session par kuch nahi</td><td>Us session mein <code>terminal monitor</code>; <code>logging monitor</code> level.</td></tr>
<tr><td>NMS poll timeout</td><td><code>show snmp</code>: "Unknown community name" badh raha = galat string ya ACL; community ACL ka content; UDP 161 filters.</td></tr>
<tr><td>Traps nahi</td><td><code>snmp-server enable traps</code> hai? <code>snmp-server host</code> address aur version/community sahi? UDP 162 path.</td></tr>
<tr><td>SNMPv3 fail</td><td><code>show snmp user</code> / <code>show snmp group</code>: group vs user ka security level (priv ko dono passwords chahiye), NMS par matching SHA/AES.</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Ping chalne se "path theek hai" maan lena. ACLs, firewalls aur control-plane policies aksar ICMP allow karti hain lekin UDP 123, 161 ya 514 block karti hain. Hamesha asli protocol aur port ke liye filters check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jis router ka server unreachable hai woh associations mein <code>.INIT.</code>, st 16 aur reach 0 dikhata hai, aur status mein <code>unsynchronized, stratum 16</code>. Sahi time lekin UTC stamps timestamp setting ki problem hai, NTP ki nahi.</p></div>

<div class="scn"><h4>Ek symptom ke peeche chhupe do bugs</h4><p>Ek asli outage review bilkul lab jaisa tha. Pehle engineer ne core router par typo theek kiya, use sync hote dekha, aur ticket band kar diya. Uske peeche wala branch router agle din bhi galat tha, kyunki WAN interface par ek purani "internet se NTP block karo" ACL uske apne upstream router ka NTP bhi block kar rahi thi. Chain ke har device par poora workflow follow karne se hi doosra fault mila.</p><p><b>Seekh:</b> NTP ek chain hai. Source se last client tak har hop verify karo, aur collector par verify karo, sirf ek router par nahi.</p></div>

<div class="iv"><p class="q">"Router ke show ntp associations mein reach 0 aur .INIT. hai. Kaise troubleshoot karoge?"</p><p>Strong answer: reach 0 aur .INIT. matlab abhi tak koi reply nahi mila. Configured address ko design se milao, phir NTP source interface se reachability aur routing, phir dono directions mein UDP 123 ke liye ACLs aur firewalls (show ip access-lists ke match counters), phir kya server khud synchronised hai aur authentication keys match karti hain. Sync ke baad time zone aur <code>service timestamps</code> check karo aur syslog server par confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: status → associations → address → path → ACLs → server health → authentication → time zone → timestamps → sabit karo.</li>
<li>reach 0 + .INIT. + st 16 = server se kuch nahi suna.</li>
<li>Ping success UDP 123, 161 ya 514 allowed hone ka saboot nahi; ACL match counters padho.</li>
<li>Lab 2 fixes: R1 par server 10.1.1.132 → 10.1.1.123, R2 par <code>deny udp any any eq ntp</code> hatao, time zone aur <code>localtime show-timezone</code> jodo; R2 stratum 3 par khatam hota hai.</li>
<li>Result hamesha collector par sabit karo.</li>
</ul></div>
`}};export{e as default};