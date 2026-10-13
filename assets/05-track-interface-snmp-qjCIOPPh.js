var e={id:`track-interface-snmp`,h:{en:`Track, interface counter and SNMP event detectors`,hi:`Track, interface counter aur SNMP event detectors`},body:{en:`
<p>A smoke alarm only knows about smoke. A thermometer tells you the exact temperature, and you decide that 40 degrees is "too hot". A doorbell camera checks whether someone is really at the door, not just whether the bell wire is connected. Syslog patterns are like the smoke alarm: they only see messages. The three detectors in this chapter measure things: whether a path really works (track), how fast a counter grows (interface), and the value of any MIB object (snmp).</p>

<h3>The track detector</h3>
<p><b>Object tracking</b> turns a condition into a simple Up or Down state. A track object can follow an interface's line protocol, a route in the routing table, or an <b>IP SLA</b> probe that pings a remote target. You met IP SLA and tracking in the assurance module; EEM simply reacts when the track state changes.</p>
<pre class="code">BRANCH(config)# ip sla 1
BRANCH(config-ip-sla)# icmp-echo 203.0.113.10 source-interface GigabitEthernet0/0
BRANCH(config-ip-sla-echo)# frequency 10
BRANCH(config)# ip sla schedule 1 life forever start-time now
BRANCH(config)# track 1 ip sla 1 reachability
BRANCH(config-track)# delay up 60 down 20
<span class="c">! delay damps short blips before the state changes</span>
BRANCH(config)# event manager applet WAN-PROBE-DOWN
BRANCH(config-applet)# event track 1 state down
BRANCH(config-applet)# action 1.0 syslog priority critical msg "Probe to 203.0.113.10 failed"</pre>
<pre class="out">BRANCH# show track 1
Track 1
  IP SLA 1 reachability
  <span class="hl">Reachability is Down</span>
    2 changes, last change 00:00:41
  Delay up 60 secs, down 20 secs
  Latest operation return code: Timeout</pre>
<p>The state can be <code>up</code>, <code>down</code> or <code>any</code>. Why is this better than a syslog pattern for WAN failover? Because a WAN circuit often fails <b>without</b> the local interface going down: the ISP's core breaks, the fibre is fine, and line protocol stays up. Only an end-to-end probe sees that failure.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Silent failure">
<rect x="20" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">BRANCH</text>
<rect x="240" y="60" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="300" y="90" text-anchor="middle" class="svg-ink" font-size="13">ISP edge</text>
<rect x="490" y="60" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.10</text>
<line x1="140" y1="85" x2="240" y2="85" stroke="#64748b" stroke-width="3"/><text x="190" y="76" text-anchor="middle" class="svg-muted" font-size="12">link up</text>
<line x1="360" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="4 5"/><text x="425" y="76" text-anchor="middle" class="svg-accent" font-size="12">core broken</text>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">syslog sees nothing; the IP SLA probe times out and track 1 goes Down</text>
</svg><p class="cap">A silent failure: the interface stays up, so only a tracked probe detects it.</p></div>

<h3>The interface counter detector</h3>
<p>The <code>interface</code> detector polls a counter of one interface and fires when it crosses a threshold. Counter names include <code>input_errors</code>, <code>input_errors_crc</code>, <code>output_errors</code>, <code>interface_resets</code>, <code>rxload</code> and <code>txload</code>.</p>
<pre class="code">event manager applet CRC-WATCH
 event interface name GigabitEthernet0/0 parameter input_errors_crc entry-op ge entry-val 100 entry-type increment poll-interval 60
 action 1.0 syslog priority warnings msg "Gi0/0 CRC errors rose by 100+ in one minute"</pre>
<p><b>entry-type</b> tells EEM how to read the number: <code>value</code> (the raw counter), <code>increment</code> (growth since the last poll) or <code>rate</code> (growth per second). Operators are <code>gt ge eq ne lt le</code>.</p>

<h3>The SNMP detector</h3>
<p>The <code>snmp</code> detector reads any local MIB object by its OID and compares it with a threshold. The famous use is CPU: <code>1.3.6.1.4.1.9.9.109.1.1.1.1.6</code> is cpmCPUTotal5secRev, the 5-second CPU busy percentage; the last <code>.1</code> is the CPU index (it can differ on some platforms). On many platforms the local SNMP agent must be enabled for this detector to work.</p>
<pre class="code">event manager applet CPU-HIGH
 event snmp oid 1.3.6.1.4.1.9.9.109.1.1.1.1.6.1 get-type exact entry-op ge entry-val 80 exit-op lt exit-val 50 poll-interval 5
 action 1.0 syslog priority warnings msg "CPU at or above 80 percent"</pre>
<p>The <b>exit</b> condition gives <b>hysteresis</b>: after firing at 80 %, the applet cannot fire again until the CPU has dropped below 50 %. Without exit criteria the detector re-arms immediately and can fire on every poll while the CPU stays high.</p>

<div class="eg"><p><b>Worked example.</b> CPU samples every 5 seconds: 45, 82, 91, 88, 60, 48, 85. With <code>entry-op ge entry-val 80 exit-op lt exit-val 50</code>: fires at 82 (first crossing). 91, 88 and 60 do not fire, because the exit condition (below 50) has not happened yet. 48 re-arms it. 85 fires again. Total: <b>2</b> runs instead of 4.</p></div>

<table class="cmp"><tr><th>You want to react to…</th><th>Use</th></tr>
<tr><td>A specific log message</td><td><code>event syslog pattern</code></td></tr>
<tr><td>A path that stops working end to end</td><td><code>event track N state down</code> with IP SLA</td></tr>
<tr><td>Errors or load growing on one interface</td><td><code>event interface name … parameter …</code></td></tr>
<tr><td>Any MIB value (CPU, memory, a table entry)</td><td><code>event snmp oid …</code></td></tr>
<tr><td>A schedule</td><td><code>event timer …</code></td></tr>
<tr><td>Someone typing a command</td><td><code>event cli pattern …</code></td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Using <code>entry-type value</code> with an error counter. Counters only grow, so once the total passes 100 the condition is true forever. For "errors are increasing now" use <code>increment</code> or <code>rate</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> A track event reacts to a <b>state change</b> of a track object; it does not configure the probe. The IP SLA and the <code>track</code> object must already exist. Also, a very short poll-interval on SNMP or interface detectors costs CPU on the box you are trying to protect.</p></div>

<div class="scn"><h4>Link up, internet down</h4><p>A logistics company in Nagpur used a syslog-based applet to enable its backup circuit. One morning the ISP had a routing problem in its core: the branch fibre was fine, Gi0/0 stayed up/up, no LINEPROTO message appeared, and the applet never ran. Users could not reach the data center for 90 minutes. The team replaced the trigger with an IP SLA probe to the data center address, a track object with <code>delay down 20</code>, and <code>event track 1 state down</code>.</p><p><b>Lesson:</b> log messages describe the local interface; an end-to-end probe describes the service users care about.</p></div>

<div class="iv"><p class="q">"Why would you trigger WAN failover with event track instead of event syslog?"</p><p>Strong answer: syslog only sees local interface state, so it misses failures beyond the first hop where the link stays up. A track object on an IP SLA reachability probe tests the actual path, supports up and down delays to damp flapping, and gives a clean Up/Down state for <code>event track 1 state down</code>. I would pair it with a second applet on <code>state up</code> to restore the normal path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>event track N state up|down|any</code> reacts to track objects built on interfaces, routes or IP SLA.</li>
<li>End-to-end probes catch silent failures that syslog patterns miss.</li>
<li><code>event interface</code> watches one interface counter; use increment or rate for error counters.</li>
<li><code>event snmp oid</code> watches any MIB value; exit-op and exit-val add hysteresis.</li>
<li>Keep poll intervals reasonable; detectors run on the device they protect.</li>
</ul></div>
`,hi:`
<p>Smoke alarm ko sirf dhuen ka pata hota hai. Thermometer exact temperature batata hai, aur aap decide karte ho ki 40 degree "bahut garam" hai. Doorbell camera check karta hai ki darwaze par sach mein koi hai, sirf yeh nahi ki bell ka taar juda hai. Syslog patterns smoke alarm jaise hain: woh sirf messages dekhte hain. Is chapter ke teen detectors cheezein naapte hain: kya path sach mein kaam karta hai (track), counter kitni tezi se badhta hai (interface), aur kisi bhi MIB object ki value (snmp).</p>

<h3>Track detector</h3>
<p><b>Object tracking</b> ek condition ko simple Up ya Down state mein badalta hai. Track object interface ka line protocol, routing table ka route, ya remote target ko ping karne wala <b>IP SLA</b> probe follow kar sakta hai. IP SLA aur tracking aapne assurance module mein dekhe; EEM bas track state badalne par react karta hai.</p>
<pre class="code">BRANCH(config)# ip sla 1
BRANCH(config-ip-sla)# icmp-echo 203.0.113.10 source-interface GigabitEthernet0/0
BRANCH(config-ip-sla-echo)# frequency 10
BRANCH(config)# ip sla schedule 1 life forever start-time now
BRANCH(config)# track 1 ip sla 1 reachability
BRANCH(config-track)# delay up 60 down 20
<span class="c">! delay state badalne se pehle chhote blips ko damp karta hai</span>
BRANCH(config)# event manager applet WAN-PROBE-DOWN
BRANCH(config-applet)# event track 1 state down
BRANCH(config-applet)# action 1.0 syslog priority critical msg "Probe to 203.0.113.10 failed"</pre>
<pre class="out">BRANCH# show track 1
Track 1
  IP SLA 1 reachability
  <span class="hl">Reachability is Down</span>
    2 changes, last change 00:00:41
  Delay up 60 secs, down 20 secs
  Latest operation return code: Timeout</pre>
<p>State <code>up</code>, <code>down</code> ya <code>any</code> ho sakta hai. WAN failover ke liye yeh syslog pattern se behtar kyun hai? Kyunki WAN circuit aksar local interface down hue <b>bina</b> fail hota hai: ISP ka core toot jaata hai, fibre theek hai, aur line protocol up rehta hai. Sirf end-to-end probe woh failure dekhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Silent failure">
<rect x="20" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">BRANCH</text>
<rect x="240" y="60" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="300" y="90" text-anchor="middle" class="svg-ink" font-size="13">ISP edge</text>
<rect x="490" y="60" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.10</text>
<line x1="140" y1="85" x2="240" y2="85" stroke="#64748b" stroke-width="3"/><text x="190" y="76" text-anchor="middle" class="svg-muted" font-size="12">link up</text>
<line x1="360" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="4 5"/><text x="425" y="76" text-anchor="middle" class="svg-accent" font-size="12">core toota</text>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">syslog kuch nahi dekhta; IP SLA probe timeout, track 1 Down</text>
</svg><p class="cap">Silent failure: interface up rehta hai, isliye sirf tracked probe ise pakadta hai.</p></div>

<h3>Interface counter detector</h3>
<p><code>interface</code> detector ek interface ka counter poll karta hai aur threshold cross hone par fire hota hai. Counter names mein <code>input_errors</code>, <code>input_errors_crc</code>, <code>output_errors</code>, <code>interface_resets</code>, <code>rxload</code> aur <code>txload</code> shamil hain.</p>
<pre class="code">event manager applet CRC-WATCH
 event interface name GigabitEthernet0/0 parameter input_errors_crc entry-op ge entry-val 100 entry-type increment poll-interval 60
 action 1.0 syslog priority warnings msg "Gi0/0 CRC errors rose by 100+ in one minute"</pre>
<p><b>entry-type</b> EEM ko batata hai number kaise padhna hai: <code>value</code> (raw counter), <code>increment</code> (pichhle poll se badhotri) ya <code>rate</code> (har second ki badhotri). Operators <code>gt ge eq ne lt le</code> hain.</p>

<h3>SNMP detector</h3>
<p><code>snmp</code> detector kisi bhi local MIB object ko uske OID se padhta hai aur threshold se compare karta hai. Mashhoor use CPU hai: <code>1.3.6.1.4.1.9.9.109.1.1.1.1.6</code> cpmCPUTotal5secRev hai, 5-second CPU busy percentage; aakhri <code>.1</code> CPU index hai (kuch platforms par alag ho sakta hai). Kai platforms par is detector ke kaam karne ke liye local SNMP agent enable hona chahiye.</p>
<pre class="code">event manager applet CPU-HIGH
 event snmp oid 1.3.6.1.4.1.9.9.109.1.1.1.1.6.1 get-type exact entry-op ge entry-val 80 exit-op lt exit-val 50 poll-interval 5
 action 1.0 syslog priority warnings msg "CPU at or above 80 percent"</pre>
<p><b>Exit</b> condition <b>hysteresis</b> deti hai: 80 % par fire hone ke baad, applet tab tak dobara fire nahi ho sakta jab tak CPU 50 % se neeche na aa jaaye. Exit criteria ke bina detector turant re-arm hota hai aur jab tak CPU high rahe, har poll par fire ho sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Har 5 second CPU samples: 45, 82, 91, 88, 60, 48, 85. <code>entry-op ge entry-val 80 exit-op lt exit-val 50</code> ke saath: 82 par fire (pehla crossing). 91, 88 aur 60 fire nahi karte, kyunki exit condition (50 se neeche) abhi hui nahi. 48 ise re-arm karta hai. 85 phir fire karta hai. Total: 4 ki jagah <b>2</b> runs.</p></div>

<table class="cmp"><tr><th>Aap react karna chahte ho…</th><th>Use karo</th></tr>
<tr><td>Ek specific log message par</td><td><code>event syslog pattern</code></td></tr>
<tr><td>End to end kaam karna band karne wale path par</td><td>IP SLA ke saath <code>event track N state down</code></td></tr>
<tr><td>Ek interface par badhte errors ya load par</td><td><code>event interface name … parameter …</code></td></tr>
<tr><td>Kisi bhi MIB value par (CPU, memory, table entry)</td><td><code>event snmp oid …</code></td></tr>
<tr><td>Schedule par</td><td><code>event timer …</code></td></tr>
<tr><td>Kisi ke command type karne par</td><td><code>event cli pattern …</code></td></tr></table>

<div class="warn"><p><b>Common galti.</b> Error counter ke saath <code>entry-type value</code> use karna. Counters sirf badhte hain, isliye total 100 paar hone ke baad condition hamesha true rehti hai. "Errors abhi badh rahe hain" ke liye <code>increment</code> ya <code>rate</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Track event track object ke <b>state change</b> par react karta hai; yeh probe configure nahi karta. IP SLA aur <code>track</code> object pehle se exist karne chahiye. Aur SNMP ya interface detectors par bahut chhota poll-interval usi box ka CPU khata hai jise aap bachana chahte ho.</p></div>

<div class="scn"><h4>Link up, internet down</h4><p>Nagpur ki ek logistics company backup circuit enable karne ke liye syslog-based applet use karti thi. Ek subah ISP ke core mein routing problem hui: branch ka fibre theek tha, Gi0/0 up/up raha, koi LINEPROTO message nahi aaya, aur applet kabhi nahi chala. Users 90 minute tak data center tak nahi pahunch paaye. Team ne trigger ko data center address ke IP SLA probe, <code>delay down 20</code> wale track object, aur <code>event track 1 state down</code> se badal diya.</p><p><b>Seekh:</b> log messages local interface ka haal batate hain; end-to-end probe us service ka haal batata hai jiski users ko parwaah hai.</p></div>

<div class="iv"><p class="q">"WAN failover ko event syslog ki jagah event track se kyun trigger karoge?"</p><p>Strong answer: syslog sirf local interface state dekhta hai, isliye pehle hop ke aage ke failures miss karta hai jahan link up rehta hai. IP SLA reachability probe par track object asli path test karta hai, flapping damp karne ke liye up aur down delays support karta hai, aur <code>event track 1 state down</code> ke liye saaf Up/Down state deta hai. Main ise <code>state up</code> par ek doosre applet ke saath jodunga jo normal path restore kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>event track N state up|down|any</code> interfaces, routes ya IP SLA par bane track objects par react karta hai.</li>
<li>End-to-end probes silent failures pakadte hain jo syslog patterns miss karte hain.</li>
<li><code>event interface</code> ek interface counter dekhta hai; error counters ke liye increment ya rate use karo.</li>
<li><code>event snmp oid</code> koi bhi MIB value dekhta hai; exit-op aur exit-val hysteresis jodte hain.</li>
<li>Poll intervals reasonable rakho; detectors usi device par chalte hain jise woh bachate hain.</li>
</ul></div>
`}};export{e as default};