var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: logs, time, SNMP and recovery`,hi:`Troubleshooting workflow: logs, time, SNMP aur recovery`},body:{en:`
<p>System-service problems are quiet. Nothing crashes: a log simply does not arrive, a clock drifts, a trap never shows, a poll times out. The method is to follow the <b>path</b> of each service from the router to the server and check every hop. This chapter turns that into a checklist and walks the lab tickets.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Service path checklist">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">1. Config</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">committed?</text>
<rect x="140" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="12">2. Source</text><text x="195" y="94" text-anchor="middle" class="svg-muted" font-size="11">address, route</text>
<rect x="270" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="12">3. Network</text><text x="325" y="94" text-anchor="middle" class="svg-muted" font-size="11">ping, filters</text>
<rect x="400" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="12">4. Server</text><text x="455" y="94" text-anchor="middle" class="svg-muted" font-size="11">listening, ACL</text>
<rect x="530" y="50" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="12">5. Proof</text><text x="580" y="94" text-anchor="middle" class="svg-muted" font-size="11">on the server</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="80" x2="140" y2="80"/><line x1="250" y1="80" x2="270" y2="80"/><line x1="380" y1="80" x2="400" y2="80"/><line x1="510" y1="80" x2="530" y2="80"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Follow the packet from router to server and back</text>
</svg><p class="cap">Five checks cover almost every services problem.</p></div>

<h3>Ticket 1: logs do not reach NK-OPS (Chennai)</h3>
<p><b>Symptom:</b> <code>show syslog</code> on NK-OPS is empty although R1 is configured to log to 10.70.1.50.</p>
<pre class="code">lab@NK-CHN-EDGE&gt; show configuration system syslog
host 10.70.1.50 {
    any notice;
    authorization info;
}
lab@NK-CHN-EDGE&gt; ping 10.70.1.50 count 2
2 packets transmitted, 2 packets received, 0% packet loss
lab@NK-CHN-EDGE&gt; show log messages | match UI_COMMIT | last 2</pre>
<ol>
<li><b>Config</b>: is it committed? Use <code>show configuration</code> (active), not <code>show</code> (candidate).</li>
<li><b>Severity</b>: commits are notice; a host configured at <code>error</code> never receives them. Generate an event by committing a change with a comment.</li>
<li><b>Network</b>: ping the server; UDP 514 may be filtered even though ping works.</li>
<li><b>Source address</b>: the server may accept only the interface address 10.70.1.1; check <code>source-address</code>.</li>
<li><b>Proof</b>: on NK-OPS, <code>show syslog</code> must contain <code>NK-CHN-EDGE ... UI_COMMIT</code>.</li>
</ol>

<h3>Ticket 2: NTP will not synchronise</h3>
<pre class="code">lab@NK-CHN-EDGE&gt; show ntp associations
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 10.70.1.50      .INIT.          16 u    -   64    0    0.000    0.000   0.000</pre>
<p>Reach 0 and refid <code>.INIT.</code> mean no answer was ever received. Check in order: (1) <code>ping 10.70.1.50</code>; (2) is UDP 123 allowed on the path and by any loopback filter; (3) does the server accept this client; (4) the source address; (5) an authentication key mismatch. After the fix, reach climbs 1, 3, 7 ... 377 and a <code>*</code> appears before the server. <code>show ntp status</code> must show <code>sync_ntp</code>. In the lab the answer is <b>stratum=2</b>, because NK-OPS is stratum 1.</p>
<p>If the synchronised clock is wrong by hours, check the <b>time zone</b> (display only) before blaming NTP. <code>show system uptime</code> prints the current time in the configured zone.</p>

<h3>Ticket 3: SNMP works for the NOC, not for the guest (Mumbai)</h3>
<p>This is a requirement test more than a fault. From NK-NMS the walk answers; from GUEST (10.80.2.99) the request times out.</p>
<pre class="code">lab@NK-MUM-EDGE&gt; show snmp statistics | match "Bad community|Get responses"
    Packets: 14, Bad versions: 0, <span class="hl">Bad community names: 2</span>, Bad community uses: 0,
    Packets: 12, Too bigs: 0, No such names: 0, Bad values: 0, General errors: 0, <span class="hl">Get responses: 12</span></pre>
<p>Reading it: Get responses prove the NMS was served; Bad community names rose because the guest's requests came from a prefix that is not in <code>clients</code>. If the NMS itself times out, check: the <code>clients</code> prefix matches the NMS address exactly (10.80.1.20/32), the community spelling, <code>show system connections | match 161</code> (agent listening), and any loopback filter blocking UDP 161. If the traps do not arrive, check the trap-group target, the category (<code>link</code>), that the NMS listens on UDP 162, and that the router has a route back to it. In the lab, disabling <code>ge-0/0/2</code> must produce a linkDown trap.</p>

<h3>Ticket 4: the wrong change ticket (Delhi)</h3>
<p><b>Symptom:</b> after commit "NK-4471" PC1 cannot reach PC2.</p>
<pre class="code">lab@NK-DEL-EDGE&gt; show system commit
0   2026-10-01 22:10:05 IST by lab via cli
    NK-4471
1   2026-10-01 18:00:00 IST by lab via cli
    baseline
lab@NK-DEL-EDGE&gt; show interfaces terse ge-0/0/1
ge-0/0/1.0              up    up   inet     10.90.21.1/30
lab@NK-DEL-EDGE&gt; ping 10.90.12.2 count 2
2 packets transmitted, 0 packets received, 100% packet loss</pre>
<p>The link is up, but R1 (10.90.21.1/30) and R2 (10.90.12.2/30) are in different subnets, so the static route's next hop is unreachable. Fix: <code>rollback rescue</code>, <code>show | compare</code>, <code>commit comment "restore rescue" and-quit</code>, then test PC1 to PC2 10.90.2.10. If you had not saved a rescue file, <code>rollback 1</code> would also work here. Afterwards ask the change owner to correct the ticket so both ends are renumbered together.</p>

<h3>Universal workflow</h3>
<ol>
<li>State the expected result and where to see it (server log, <code>show ntp</code>, NMS).</li>
<li>Check the router config is <b>active</b> and the severity or category fits.</li>
<li>Check addressing and routes in both directions and which source address is used.</li>
<li>Check filters and the server side (listening, allow-lists, firewall).</li>
<li>Generate a test event and prove it on the destination.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Judging success only on the router; forgetting that a loopback firewall filter can block services while ping works; testing SNMP from the wrong host; assuming NTP is broken when the time zone is wrong; applying a ticket without checking the other end.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>.INIT.</code> with stratum 16 means NTP never answered. Bad community names rise when the community or source prefix is wrong. Both rollback and rescue need a commit.</p></div>

<div class="scn"><h4>The monitoring that watched nothing</h4><p>An NMS showed all routers green for three weeks while two were down for a day. Investigation: the SNMP community on those routers had been changed during a maintenance window, so every poll failed with a bad community, and the NMS treated "no data" as "no problem". After the fix, the team added an alert for "no data" and a monthly review of <code>show snmp statistics</code> on every router.</p><p><b>Lesson:</b> prove monitoring end to end; absence of alarms is not proof of health.</p></div>

<div class="iv"><p class="q">"Remote syslog is configured but nothing arrives at the server. How do you troubleshoot?"</p><p>I confirm the configuration is committed and the severity covers the events, generate a test message with a commit, check reachability and the source address the router uses, look for filters on UDP 514 on the path, the router loopback and the server, and finally look at the server log for the message. I use <code>show log messages</code> to prove the router generated it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the service path: config, source, network, server, proof.</li>
<li>Syslog severity is a minimum; a commit is notice level.</li>
<li>NTP <code>.INIT.</code> stratum 16 means no answer; check reachability, UDP 123 and source.</li>
<li>SNMP: <code>clients</code> allow-list and <code>show snmp statistics</code> explain polls and bad communities.</li>
<li>After a wrong change, <code>rollback rescue</code> or <code>rollback 1</code> plus commit restores service.</li>
</ul></div>
`,hi:`
<p>System-service problems shaant hoti hain. Kuch crash nahi hota: bas log nahi aata, clock drift hoti hai, trap kabhi nahi dikhta, poll timeout hota hai. Tareeka hai har service ka <b>path</b> router se server tak follow karna aur har hop check karna. Yeh chapter use checklist banata hai aur lab tickets chalata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Service path checklist">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">1. Config</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">committed?</text>
<rect x="140" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="12">2. Source</text><text x="195" y="94" text-anchor="middle" class="svg-muted" font-size="11">address, route</text>
<rect x="270" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="12">3. Network</text><text x="325" y="94" text-anchor="middle" class="svg-muted" font-size="11">ping, filters</text>
<rect x="400" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="12">4. Server</text><text x="455" y="94" text-anchor="middle" class="svg-muted" font-size="11">listening, ACL</text>
<rect x="530" y="50" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="12">5. Proof</text><text x="580" y="94" text-anchor="middle" class="svg-muted" font-size="11">server par</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="80" x2="140" y2="80"/><line x1="250" y1="80" x2="270" y2="80"/><line x1="380" y1="80" x2="400" y2="80"/><line x1="510" y1="80" x2="530" y2="80"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Packet ko router se server tak aur wapas follow karo</text>
</svg><p class="cap">Paanch checks lagbhag har services problem cover karte hain.</p></div>

<h3>Ticket 1: logs NK-OPS tak nahi pahunchte (Chennai)</h3>
<p><b>Symptom:</b> NK-OPS par <code>show syslog</code> khaali hai jabki R1 10.70.1.50 ko log karne ke liye configured hai.</p>
<pre class="code">lab@NK-CHN-EDGE&gt; show configuration system syslog
host 10.70.1.50 {
    any notice;
    authorization info;
}
lab@NK-CHN-EDGE&gt; ping 10.70.1.50 count 2
2 packets transmitted, 2 packets received, 0% packet loss
lab@NK-CHN-EDGE&gt; show log messages | match UI_COMMIT | last 2</pre>
<ol>
<li><b>Config</b>: committed hai? <code>show configuration</code> (active) use karo, <code>show</code> (candidate) nahi.</li>
<li><b>Severity</b>: commits notice hain; <code>error</code> par configured host unhe kabhi nahi paata. Comment ke saath change commit karke event generate karo.</li>
<li><b>Network</b>: server ko ping karo; ping chalte hue bhi UDP 514 filter ho sakta hai.</li>
<li><b>Source address</b>: server sirf interface address 10.70.1.1 accept kar sakta hai; <code>source-address</code> check karo.</li>
<li><b>Proof</b>: NK-OPS par <code>show syslog</code> mein <code>NK-CHN-EDGE ... UI_COMMIT</code> hona chahiye.</li>
</ol>

<h3>Ticket 2: NTP synchronise nahi hota</h3>
<pre class="code">lab@NK-CHN-EDGE&gt; show ntp associations
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 10.70.1.50      .INIT.          16 u    -   64    0    0.000    0.000   0.000</pre>
<p>Reach 0 aur refid <code>.INIT.</code> ka matlab kabhi koi jawab nahi mila. Order mein check karo: (1) <code>ping 10.70.1.50</code>; (2) kya path par aur kisi loopback filter se UDP 123 allowed hai; (3) kya server is client ko accept karta hai; (4) source address; (5) authentication key mismatch. Fix ke baad reach 1, 3, 7 ... 377 badhta hai aur server se pehle <code>*</code> aata hai. <code>show ntp status</code> mein <code>sync_ntp</code> dikhna chahiye. Lab mein jawab <b>stratum=2</b> hai, kyunki NK-OPS stratum 1 hai.</p>
<p>Synchronised clock ghanton galat ho to NTP ko doshi thehraane se pehle <b>time zone</b> (sirf display) check karo. <code>show system uptime</code> configured zone mein current time print karta hai.</p>

<h3>Ticket 3: SNMP NOC ke liye chalta hai, guest ke liye nahi (Mumbai)</h3>
<p>Yeh fault se zyada requirement test hai. NK-NMS se walk jawab deta hai; GUEST (10.80.2.99) se request timeout hoti hai.</p>
<pre class="code">lab@NK-MUM-EDGE&gt; show snmp statistics | match "Bad community|Get responses"
    Packets: 14, Bad versions: 0, <span class="hl">Bad community names: 2</span>, Bad community uses: 0,
    Packets: 12, Too bigs: 0, No such names: 0, Bad values: 0, General errors: 0, <span class="hl">Get responses: 12</span></pre>
<p>Padhne ka tareeka: Get responses saabit karte hain ki NMS ko serve kiya gaya; Bad community names isliye badhe kyunki guest ki requests aise prefix se aayin jo <code>clients</code> mein nahi hai. NMS khud timeout ho to check karo: <code>clients</code> prefix NMS address se exactly match karta hai (10.80.1.20/32), community ki spelling, <code>show system connections | match 161</code> (agent sun raha hai), aur UDP 161 block karne wala koi loopback filter. Traps na aayein to trap-group target, category (<code>link</code>), NMS UDP 162 par sun raha hai, aur router ke paas route wapas hai ya nahi check karo. Lab mein <code>ge-0/0/2</code> disable karne se linkDown trap aana chahiye.</p>

<h3>Ticket 4: galat change ticket (Delhi)</h3>
<p><b>Symptom:</b> commit "NK-4471" ke baad PC1 PC2 tak nahi pahunchta.</p>
<pre class="code">lab@NK-DEL-EDGE&gt; show system commit
0   2026-10-01 22:10:05 IST by lab via cli
    NK-4471
1   2026-10-01 18:00:00 IST by lab via cli
    baseline
lab@NK-DEL-EDGE&gt; show interfaces terse ge-0/0/1
ge-0/0/1.0              up    up   inet     10.90.21.1/30
lab@NK-DEL-EDGE&gt; ping 10.90.12.2 count 2
2 packets transmitted, 0 packets received, 100% packet loss</pre>
<p>Link up hai, lekin R1 (10.90.21.1/30) aur R2 (10.90.12.2/30) alag subnets mein hain, isliye static route ka next hop unreachable hai. Fix: <code>rollback rescue</code>, <code>show | compare</code>, <code>commit comment "restore rescue" and-quit</code>, phir PC1 se PC2 10.90.2.10 test karo. Rescue file save na hoti to bhi yahan <code>rollback 1</code> chalta. Baad mein change owner se ticket sahi karwao taaki dono ends saath renumber hon.</p>

<h3>Universal workflow</h3>
<ol>
<li>Expected result batao aur kahan dikhega (server log, <code>show ntp</code>, NMS).</li>
<li>Check karo router config <b>active</b> hai aur severity ya category fit hoti hai.</li>
<li>Dono directions mein addressing aur routes aur kaunsa source address use hota hai check karo.</li>
<li>Filters aur server side (listening, allow-lists, firewall) check karo.</li>
<li>Test event generate karo aur destination par saabit karo.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Sirf router par success judge karna; yeh bhool jaana ki loopback firewall filter ping chalte hue bhi services block kar sakta hai; SNMP galat host se test karna; time zone galat hone par NTP ko toota samajhna; doosra end dekhe bina ticket apply karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>.INIT.</code> aur stratum 16 ka matlab NTP ne kabhi jawab nahi diya. Community ya source prefix galat ho to Bad community names badhte hain. Rollback aur rescue dono ko commit chahiye.</p></div>

<div class="scn"><h4>Monitoring jo kuch dekh hi nahi raha tha</h4><p>NMS teen hafte tak saare routers green dikhata raha jabki do routers ek din down rahe. Jaanch: maintenance window mein un routers ki SNMP community badal gayi thi, isliye har poll bad community se fail hota tha, aur NMS "no data" ko "no problem" maan raha tha. Fix ke baad team ne "no data" ke liye alert aur har router par <code>show snmp statistics</code> ka monthly review jodi.</p><p><b>Lesson:</b> monitoring ko end to end saabit karo; alarms ka na hona health ka saboot nahi.</p></div>

<div class="iv"><p class="q">"Remote syslog configured hai lekin server tak kuch nahi aata. Troubleshoot kaise karoge?"</p><p>Confirm karta hoon ki configuration committed hai aur severity events cover karti hai, commit se test message generate karta hoon, reachability aur router jo source address use karta hai check karta hoon, path, router loopback aur server par UDP 514 ke filters dekhta hoon, aur aakhir mein server log mein message dhoondhta hoon. <code>show log messages</code> se saabit karta hoon ki router ne woh generate kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service path follow karo: config, source, network, server, proof.</li>
<li>Syslog severity minimum hai; commit notice level hai.</li>
<li>NTP <code>.INIT.</code> stratum 16 ka matlab jawab nahi; reachability, UDP 123 aur source check karo.</li>
<li>SNMP: <code>clients</code> allow-list aur <code>show snmp statistics</code> polls aur bad communities samjhate hain.</li>
<li>Galat change ke baad <code>rollback rescue</code> ya <code>rollback 1</code> aur commit service restore karta hai.</li>
</ul></div>
`}};export{e as default};