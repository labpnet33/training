var e={id:`use-cases`,h:{en:`Common use cases: failover, evidence, change logging, flaps`,hi:`Common use cases: failover, saboot, change logging, flaps`},body:{en:`
<p>A good toolbox is not the one with the most tools; it is the one where you know which tool to grab for which job. Four EEM patterns cover most real-world needs and most exam questions: <b>fix it</b> (bring up a backup), <b>capture it</b> (collect data the moment a problem starts), <b>record it</b> (log configuration changes), and <b>count it</b> (prove an interface is flapping). Each one pairs a detector with a small set of actions.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four use cases">
<rect x="20" y="20" width="290" height="80" rx="8" fill="#bbf7d0"/><text x="165" y="48" text-anchor="middle" class="svg-ink" font-size="14">1. Auto-backup link</text><text x="165" y="72" text-anchor="middle" class="svg-muted" font-size="12">syslog or track → cli no shutdown</text>
<rect x="330" y="20" width="290" height="80" rx="8" fill="#bae6fd"/><text x="475" y="48" text-anchor="middle" class="svg-ink" font-size="14">2. High CPU evidence</text><text x="475" y="72" text-anchor="middle" class="svg-muted" font-size="12">snmp oid → show … | append flash</text>
<rect x="20" y="115" width="290" height="80" rx="8" fill="#ddd6fe"/><text x="165" y="143" text-anchor="middle" class="svg-ink" font-size="14">3. Config change logging</text><text x="165" y="167" text-anchor="middle" class="svg-muted" font-size="12">syslog CONFIG_I → copy, syslog, mail</text>
<rect x="330" y="115" width="290" height="80" rx="8" fill="#fde68a"/><text x="475" y="143" text-anchor="middle" class="svg-ink" font-size="14">4. Interface flap evidence</text><text x="475" y="167" text-anchor="middle" class="svg-muted" font-size="12">syslog occurs 3 period 60 → collect</text>
</svg><p class="cap">Four patterns: fix it, capture it, record it, count it.</p></div>

<h3>1. Auto-backup link (the lab, completed)</h3>
<p>The lab applet enables Gi0/1 when Gi0/0 loses line protocol. A production version adds its partner: shut the metered backup again once the primary has been stable for a minute.</p>
<pre class="code">event manager applet UPLINK-UP
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to up" maxrun 90
 action 1.0 wait 60
 action 2.0 cli command "enable"
 action 3.0 cli command "show interfaces GigabitEthernet0/0 | include line protocol"
 action 4.0 regexp "line protocol is up" "$_cli_result"
 action 5.0 if $_regexp_result eq "1"
 action 5.1  cli command "configure terminal"
 action 5.2  cli command "interface GigabitEthernet0/1"
 action 5.3  cli command "shutdown"
 action 5.4  cli command "end"
 action 5.5  syslog priority notifications msg "Primary stable - backup Gi0/1 shut"
 action 6.0 end</pre>
<p>Why <code>maxrun 90</code>? The 60-second wait alone is three times the 20-second default. Why check again after the wait? Because a flapping primary would otherwise shut the backup and leave the branch dead.</p>

<h3>2. Data collection on high CPU</h3>
<p>High CPU usually lasts seconds; by the time an engineer logs in, it is gone. Let the router collect its own evidence:</p>
<pre class="code">event manager applet CPU-EVIDENCE
 event snmp oid 1.3.6.1.4.1.9.9.109.1.1.1.1.6.1 get-type exact entry-op ge entry-val 85 exit-op lt exit-val 60 poll-interval 10 maxrun 60
 action 010 syslog priority warnings msg "CPU high - collecting evidence"
 action 020 cli command "enable"
 action 030 cli command "show clock | append flash:cpu-high.txt"
 action 040 cli command "show processes cpu sorted | append flash:cpu-high.txt"
 action 050 cli command "show interfaces summary | append flash:cpu-high.txt"
 action 060 cli command "show ip traffic | append flash:cpu-high.txt"</pre>
<p><code>| append</code> adds to the file on each run; <code>| redirect</code> would overwrite it. <code>show clock</code> first makes every block in the file time-stamped.</p>

<div class="eg"><p><b>Worked example.</b> Each run writes about 15 KB. With the exit condition (below 60 %) the applet fires once per CPU episode, not once per poll. Ten episodes a day for 30 days is 300 x 15 KB ≈ 4.5 MB of flash. That is fine on most IOS XE routers, but schedule a cleanup, or the file will one day fill a small flash and break software upgrades.</p></div>

<h3>3. Configuration change logging</h3>
<p>Every <code>configure terminal</code> session ends with <code>%SYS-5-CONFIG_I</code>. An applet can react by keeping a copy of the new configuration and alerting the NOC:</p>
<pre class="code">file prompt quiet
event manager applet CONFIG-WATCH
 event syslog pattern "SYS-5-CONFIG_I" ratelimit 60
 action 1.0 regexp "Configured from (.*)" "$_syslog_msg" match who
 action 2.0 syslog priority notifications msg "Change detected from $who"
 action 3.0 cli command "enable"
 action 4.0 cli command "copy running-config flash:last-change.cfg"</pre>
<pre class="out">*Sep 30 11:02:40.118: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (198.51.100.20)
<span class="hl">*Sep 30 11:02:40.201: %HA_EM-5-LOG: CONFIG-WATCH: Change detected from console by admin on vty0 (198.51.100.20)</span></pre>
<p>Notice that the applet logs only the part after "Configured from", captured with regexp. Logging the whole _syslog_msg would put the text SYS-5-CONFIG_I into the applet's own output, which matches its own pattern: the self-trigger loop from chapter 3.</p>
<p>For a record of the exact commands, combine it with the configuration change logger: <code>archive</code>, <code>log config</code>, <code>logging enable</code>, <code>notify syslog contenttype plaintext</code>, which logs each command as <code>%PARSER-5-CFGLOG_LOGGEDCMD</code>. Note that changes made by other applets also log CONFIG_I (tagged with EEM:NAME), so CONFIG-WATCH records them too. Never let CONFIG-WATCH itself run <code>configure terminal</code>, or it would trigger itself.</p>

<h3>4. Interface flap evidence</h3>
<pre class="code">event manager applet GI00-FLAP
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down" occurs 3 period 60 ratelimit 600
 action 010 syslog priority warnings msg "Gi0/0 flapping - saving evidence"
 action 020 cli command "enable"
 action 030 cli command "show clock | append flash:gi00-flap.txt"
 action 040 cli command "show interfaces GigabitEthernet0/0 | append flash:gi00-flap.txt"
 action 050 cli command "show logging | include GigabitEthernet0/0 | append flash:gi00-flap.txt"</pre>
<p>Three downs within 60 seconds prove a flap; <code>ratelimit 600</code> stops a link that flaps all night from writing hundreds of copies. CRC and input error counters in the saved <code>show interfaces</code> output are what the carrier will ask for.</p>

<div class="warn"><p><b>Common mistake.</b> Using <code>| append</code> with <code>show logging</code> and no filter. The whole log buffer is written on every run and flash fills quickly. Always filter, rate-limit and clean up.</p></div>

<div class="exam"><p><b>Exam trap.</b> Map the verb to the detector: "when a message appears" → syslog; "every N minutes" → timer watchdog; "at 2 a.m." → timer cron; "when CPU exceeds" → snmp; "when the probe fails" → track; "when someone types" → cli; "run on demand" → none.</p></div>

<div class="scn"><h4>The 4-second CPU spike</h4><p>A campus core switch in Bengaluru showed CPU spikes to 99 % for a few seconds, several times a day, and OSPF neighbours occasionally dropped. Nobody could catch it live. The team deployed CPU-EVIDENCE with a threshold of 85 %. The next morning <code>flash:cpu-high.txt</code> showed the ARP input process at the top every time, and <code>show ip traffic</code> showed a jump in ARP requests. A misconfigured server was scanning the subnet. The server was fixed and the spikes disappeared.</p><p><b>Lesson:</b> EEM turns "it happened again and we missed it" into evidence waiting in flash.</p></div>

<div class="iv"><p class="q">"Give me three practical EEM applets you would deploy in an enterprise."</p><p>Strong answer: (1) failover automation, such as enabling a metered backup interface on a track or syslog event, with a partner applet that shuts it after the primary is stable; (2) data collection on high CPU using the SNMP detector with entry and exit thresholds, appending timestamped show outputs to flash; (3) change awareness, reacting to SYS-5-CONFIG_I with a notification and a saved copy. For each, mention the safety settings: maxrun, ratelimit and a specific pattern.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fix it (failover), capture it (CPU evidence), record it (config changes), count it (flaps).</li>
<li>Pair a failover applet with a restore applet that verifies stability before undoing.</li>
<li>Use <code>show clock | append</code> first so collected data is time-stamped; watch flash space.</li>
<li>CONFIG_I also appears for EEM-made changes; never configure from a CONFIG_I-triggered applet.</li>
<li>Waits and long collections need a larger maxrun; noisy triggers need ratelimit.</li>
</ul></div>
`,hi:`
<p>Achha toolbox woh nahi jismein sabse zyada tools hon; achha woh hai jismein aapko pata ho kaunse kaam ke liye kaunsa tool uthana hai. Chaar EEM patterns zyada tar real-world zarooratein aur zyada tar exam questions cover karte hain: <b>theek karo</b> (backup up karo), <b>pakdo</b> (problem shuru hote hi data collect karo), <b>record karo</b> (configuration changes log karo), aur <b>gino</b> (saabit karo ki interface flap ho raha hai). Har ek ek detector ko actions ke chhote set se jodta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four use cases">
<rect x="20" y="20" width="290" height="80" rx="8" fill="#bbf7d0"/><text x="165" y="48" text-anchor="middle" class="svg-ink" font-size="14">1. Auto-backup link</text><text x="165" y="72" text-anchor="middle" class="svg-muted" font-size="12">syslog ya track → cli no shutdown</text>
<rect x="330" y="20" width="290" height="80" rx="8" fill="#bae6fd"/><text x="475" y="48" text-anchor="middle" class="svg-ink" font-size="14">2. High CPU saboot</text><text x="475" y="72" text-anchor="middle" class="svg-muted" font-size="12">snmp oid → show … | append flash</text>
<rect x="20" y="115" width="290" height="80" rx="8" fill="#ddd6fe"/><text x="165" y="143" text-anchor="middle" class="svg-ink" font-size="14">3. Config change logging</text><text x="165" y="167" text-anchor="middle" class="svg-muted" font-size="12">syslog CONFIG_I → copy, syslog, mail</text>
<rect x="330" y="115" width="290" height="80" rx="8" fill="#fde68a"/><text x="475" y="143" text-anchor="middle" class="svg-ink" font-size="14">4. Interface flap saboot</text><text x="475" y="167" text-anchor="middle" class="svg-muted" font-size="12">syslog occurs 3 period 60 → collect</text>
</svg><p class="cap">Chaar patterns: theek karo, pakdo, record karo, gino.</p></div>

<h3>1. Auto-backup link (lab, poora)</h3>
<p>Lab applet Gi0/0 ka line protocol jaane par Gi0/1 enable karta hai. Production version uska saathi jodta hai: primary ek minute stable rehne ke baad metered backup ko phir shut karo.</p>
<pre class="code">event manager applet UPLINK-UP
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to up" maxrun 90
 action 1.0 wait 60
 action 2.0 cli command "enable"
 action 3.0 cli command "show interfaces GigabitEthernet0/0 | include line protocol"
 action 4.0 regexp "line protocol is up" "$_cli_result"
 action 5.0 if $_regexp_result eq "1"
 action 5.1  cli command "configure terminal"
 action 5.2  cli command "interface GigabitEthernet0/1"
 action 5.3  cli command "shutdown"
 action 5.4  cli command "end"
 action 5.5  syslog priority notifications msg "Primary stable - backup Gi0/1 shut"
 action 6.0 end</pre>
<p><code>maxrun 90</code> kyun? Akela 60-second wait 20-second default ka teen guna hai. Wait ke baad dobara check kyun? Kyunki warna flap karta primary backup shut karke branch ko band chhod dega.</p>

<h3>2. High CPU par data collection</h3>
<p>High CPU aam taur par kuch second rehta hai; jab tak engineer login karta hai, woh chala jaata hai. Router ko apna saboot khud collect karne do:</p>
<pre class="code">event manager applet CPU-EVIDENCE
 event snmp oid 1.3.6.1.4.1.9.9.109.1.1.1.1.6.1 get-type exact entry-op ge entry-val 85 exit-op lt exit-val 60 poll-interval 10 maxrun 60
 action 010 syslog priority warnings msg "CPU high - collecting evidence"
 action 020 cli command "enable"
 action 030 cli command "show clock | append flash:cpu-high.txt"
 action 040 cli command "show processes cpu sorted | append flash:cpu-high.txt"
 action 050 cli command "show interfaces summary | append flash:cpu-high.txt"
 action 060 cli command "show ip traffic | append flash:cpu-high.txt"</pre>
<p><code>| append</code> har run mein file mein jodta hai; <code>| redirect</code> use overwrite karta. Pehle <code>show clock</code> se file ka har block time-stamped hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Har run lagbhag 15 KB likhta hai. Exit condition (60 % se neeche) ke saath applet har CPU episode par ek baar fire hota hai, har poll par nahi. Din mein das episodes, 30 din ke liye, 300 x 15 KB ≈ 4.5 MB flash hai. Zyada tar IOS XE routers par yeh theek hai, par cleanup schedule karo, warna file ek din chhoti flash bhar degi aur software upgrades tod degi.</p></div>

<h3>3. Configuration change logging</h3>
<p>Har <code>configure terminal</code> session <code>%SYS-5-CONFIG_I</code> ke saath khatam hota hai. Applet nayi configuration ki copy rakh kar aur NOC ko alert karke react kar sakta hai:</p>
<pre class="code">file prompt quiet
event manager applet CONFIG-WATCH
 event syslog pattern "SYS-5-CONFIG_I" ratelimit 60
 action 1.0 regexp "Configured from (.*)" "$_syslog_msg" match who
 action 2.0 syslog priority notifications msg "Change detected from $who"
 action 3.0 cli command "enable"
 action 4.0 cli command "copy running-config flash:last-change.cfg"</pre>
<pre class="out">*Sep 30 11:02:40.118: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (198.51.100.20)
<span class="hl">*Sep 30 11:02:40.201: %HA_EM-5-LOG: CONFIG-WATCH: Change detected from console by admin on vty0 (198.51.100.20)</span></pre>
<p>Dhyan do ki applet sirf "Configured from" ke baad wala hissa log karta hai, jo regexp se capture hua. Poora _syslog_msg log karne se text SYS-5-CONFIG_I applet ke apne output mein aa jaata, jo uske apne pattern se match karta hai: chapter 3 wala self-trigger loop.</p>
<p>Exact commands ke record ke liye ise configuration change logger ke saath jodo: <code>archive</code>, <code>log config</code>, <code>logging enable</code>, <code>notify syslog contenttype plaintext</code>, jo har command ko <code>%PARSER-5-CFGLOG_LOGGEDCMD</code> ki tarah log karta hai. Dhyan do ki doosre applets ke kiye changes bhi CONFIG_I log karte hain (EEM:NAME tag ke saath), isliye CONFIG-WATCH unhe bhi record karta hai. CONFIG-WATCH ko khud kabhi <code>configure terminal</code> mat chalane do, warna woh khud ko trigger karega.</p>

<h3>4. Interface flap ka saboot</h3>
<pre class="code">event manager applet GI00-FLAP
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down" occurs 3 period 60 ratelimit 600
 action 010 syslog priority warnings msg "Gi0/0 flapping - saving evidence"
 action 020 cli command "enable"
 action 030 cli command "show clock | append flash:gi00-flap.txt"
 action 040 cli command "show interfaces GigabitEthernet0/0 | append flash:gi00-flap.txt"
 action 050 cli command "show logging | include GigabitEthernet0/0 | append flash:gi00-flap.txt"</pre>
<p>60 second mein teen downs flap saabit karte hain; <code>ratelimit 600</code> raat bhar flap karte link ko saikdon copies likhne se rokta hai. Saved <code>show interfaces</code> output mein CRC aur input error counters wahi hain jo carrier maangega.</p>

<div class="warn"><p><b>Common galti.</b> <code>show logging</code> ke saath bina filter <code>| append</code> use karna. Har run mein poora log buffer likha jaata hai aur flash jaldi bhar jaati hai. Hamesha filter, rate-limit aur cleanup karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Verb ko detector se map karo: "jab message aaye" → syslog; "har N minute" → timer watchdog; "raat 2 baje" → timer cron; "jab CPU exceed kare" → snmp; "jab probe fail ho" → track; "jab koi type kare" → cli; "maang par chalao" → none.</p></div>

<div class="scn"><h4>4-second ka CPU spike</h4><p>Bengaluru ke ek campus core switch par din mein kai baar kuch second ke liye CPU 99 % tak jaata tha, aur OSPF neighbours kabhi kabhi gir jaate the. Koi use live nahi pakad paaya. Team ne 85 % threshold ke saath CPU-EVIDENCE deploy kiya. Agli subah <code>flash:cpu-high.txt</code> ne har baar ARP input process ko top par dikhaya, aur <code>show ip traffic</code> ne ARP requests mein uchhaal dikhaya. Ek galat configured server subnet scan kar raha tha. Server theek hua aur spikes gayab ho gaye.</p><p><b>Seekh:</b> EEM "phir hua aur hum chook gaye" ko flash mein intezaar karte saboot mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Mujhe teen practical EEM applets batao jo aap enterprise mein deploy karoge."</p><p>Strong answer: (1) failover automation, jaise track ya syslog event par metered backup interface enable karna, saathi applet ke saath jo primary stable hone ke baad use shut kare; (2) high CPU par data collection, SNMP detector ke entry aur exit thresholds ke saath, timestamped show outputs flash mein append karke; (3) change awareness, SYS-5-CONFIG_I par notification aur saved copy ke saath react karna. Har ek ke liye safety settings bolo: maxrun, ratelimit aur specific pattern.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Theek karo (failover), pakdo (CPU saboot), record karo (config changes), gino (flaps).</li>
<li>Failover applet ko restore applet ke saath jodo jo undo karne se pehle stability verify kare.</li>
<li>Pehle <code>show clock | append</code> use karo taaki collected data time-stamped ho; flash space dekho.</li>
<li>CONFIG_I EEM ke kiye changes par bhi aata hai; CONFIG_I-triggered applet se kabhi configure mat karo.</li>
<li>Waits aur lambe collections ko bada maxrun chahiye; shor machane wale triggers ko ratelimit.</li>
</ul></div>
`}};export{e as default};