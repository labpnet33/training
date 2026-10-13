var e={id:`logging-debug`,h:{en:`Logging, timestamps, debugs and conditional debugs`,hi:`Logging, timestamps, debugs aur conditional debugs`},body:{en:`
<p>A router's log is like the CCTV recording of a shop. If the camera has the wrong time, points at the wall, or records onto a tape that is overwritten every ten minutes, it is useless after a theft. ENARSI item 4.3 tests exactly this: where messages go, which severity reaches each destination, whether the timestamps are trustworthy, and how to run debugs safely.</p>

<h3>Anatomy of a message</h3>
<pre class="out">000123: <span class="hl">Sep 30 09:14:07.412 IST</span>: %LINEPROTO-<span class="hl">5</span>-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down</pre>
<p>The parts are: a sequence number (<code>service sequence-numbers</code>), the timestamp, then <b>%FACILITY-SEVERITY-MNEMONIC</b> and the text. Here the facility is LINEPROTO, severity 5, mnemonic UPDOWN.</p>
<table class="cmp"><tr><th>Level</th><th>Keyword</th><th>Example</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>Immediate action needed, for example a temperature alarm</td></tr>
<tr><td>2</td><td>critical</td><td>Critical hardware or software condition</td></tr>
<tr><td>3</td><td>errors</td><td>%LINK-3-UPDOWN</td></tr>
<tr><td>4</td><td>warnings</td><td>%DUAL-4-..., configuration warnings</td></tr>
<tr><td>5</td><td>notifications</td><td>%LINEPROTO-5-UPDOWN, %OSPF-5-ADJCHG, %SYS-5-CONFIG_I</td></tr>
<tr><td>6</td><td>informational</td><td>%TRACK-6-STATE, ACL log hits (%SEC-6-IPACCESSLOGP)</td></tr>
<tr><td>7</td><td>debugging</td><td>All debug output</td></tr></table>
<p>Setting a level sends that level <b>and everything more severe</b> (lower number). <code>logging trap warnings</code> sends 0 to 4, so a %TRACK-6-STATE message is never seen by the server. Memory aid: "Every Awesome Cisco Engineer Will Need Ice cream Daily".</p>

<h3>The four destinations</h3>
<pre class="code">logging buffered 64000 informational      <span class="c">! RAM, read with show logging</span>
logging console warnings                  <span class="c">! keep the console quiet</span>
logging monitor debugging                 <span class="c">! VTY sessions, after terminal monitor</span>
logging host 10.10.10.50                  <span class="c">! syslog server, UDP 514 by default</span>
logging trap informational                <span class="c">! level for all syslog servers</span>
logging source-interface Loopback0        <span class="c">! stable source address</span>
service timestamps log datetime msec localtime show-timezone
service timestamps debug datetime msec localtime show-timezone
service sequence-numbers</pre>
<pre class="out">BR# show logging
Syslog logging: enabled (0 messages dropped, 2 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)
    Console logging: level warnings, 14 messages logged, xml disabled,
                     filtering disabled
    Monitor logging: level debugging, 0 messages logged, xml disabled,
                     filtering disabled
    Buffer logging:  level informational, 57 messages logged, xml disabled,
                    filtering disabled
<span class="hl">    Trap logging: level informational, 61 message lines logged</span>
<span class="hl">        Logging to 10.10.10.50  (udp port 514, audit disabled,</span>
<span class="hl">              link up),</span>
              61 message lines logged,
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled
        Logging Source-Interface:       VRF Name:
        Loopback0</pre>
<p>Read three things: the trap level, <b>link up</b> for the host, and a growing "message lines logged" counter. If the counter grows but the server sees nothing, the problem is in the network (route back, ACL, firewall on UDP 514) or on the server, not in the router.</p>

<h3>Timestamps you can trust</h3>
<p>Without <code>datetime</code>, IOS stamps messages with uptime, such as <code>3d04h:</code>, which you cannot correlate. With <code>datetime</code> but no NTP, the time is prefixed with <b>*</b>, meaning the clock is not authoritative. A <b>.</b> prefix means the clock was synchronised but has lost sync. Configure NTP (covered in ENCOR) and check <code>show ntp status</code> before trusting any log line.</p>

<h3>Debugging safely</h3>
<p>Debugs are severity 7 and are processed by the CPU. On a busy router, <code>debug ip packet</code> or <code>debug all</code> can freeze the console and drop routing adjacencies. Safe practice:</p>
<ul>
<li>Send debug output to the buffer, not the console: <code>logging buffered 64000 debugging</code>, <code>no logging console</code> or <code>logging console warnings</code>.</li>
<li>On SSH, type <code>terminal monitor</code> to see output; <code>terminal no monitor</code> stops it for your session.</li>
<li>Limit scope with an ACL: <code>debug ip packet 100 detail</code>. Only <b>process-switched</b> packets appear; CEF-switched transit traffic is not shown.</li>
<li>Use <b>conditional debugging</b> so only matching events are printed.</li>
<li>Check with <code>show debugging</code> and always finish with <code>undebug all</code>.</li>
</ul>
<pre class="code">debug condition interface GigabitEthernet0/1
debug condition ip 10.1.1.1
debug ip ospf adj
show debug condition
undebug all
no debug condition all</pre>
<p>A condition filters the debugs that support conditions: only events tied to that interface, IP address, MAC address, username and similar are printed.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Logging destinations">
<rect x="250" y="80" width="140" height="50" rx="10" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Log message</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">severity 0-7</text>
<rect x="20" y="20" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">console (warnings)</text>
<rect x="20" y="140" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="165" text-anchor="middle" class="svg-ink" font-size="12">buffer (show logging)</text>
<rect x="470" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="12">monitor (VTY)</text>
<rect x="470" y="140" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="12">trap: UDP 514</text>
<line x1="250" y1="95" x2="170" y2="40" stroke="#64748b"/><line x1="250" y1="115" x2="170" y2="160" stroke="#64748b"/><line x1="390" y1="95" x2="470" y2="40" stroke="#64748b"/><line x1="390" y1="115" x2="470" y2="160" stroke="#64748b"/>
</svg><p class="cap">One message, four destinations, four independent severity filters.</p></div>

<div class="eg"><p><b>Worked example.</b> In the IP SLA lab, BR must send the track change to 10.10.10.50. The message is <code>%TRACK-6-STATE: 10 ip sla 10 reachability Up -&gt; Down</code>, severity 6. With <code>logging trap notifications</code> (5) it is filtered out; with <code>logging trap informational</code> (6) it is sent. The source must be Loopback0, 172.16.40.1, because the collector identifies the device by that address and HQ has a route back to 172.16.40.0/24 via both providers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving <code>logging console debugging</code> on a production router; forgetting <code>terminal monitor</code> and concluding "the debug shows nothing"; a syslog source address the server does not accept; a buffer so small that the interesting messages are overwritten.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> sets the level for syslog <b>servers</b>, not for SNMP traps. And a lower number is <b>more</b> severe: "level 3" includes 0, 1, 2 and 3 only.</p></div>

<div class="scn"><h4>The debug that took down OSPF</h4><p>A junior engineer typed <code>debug ip packet</code> without an ACL on a WAN router carrying 800 Mbps, from the console, at 10:05. The console froze, CPU hit 99%, OSPF dead timers expired and two branches lost routing. A colleague used an SSH session that was already open to run <code>undebug all</code>. The post-incident rule: debugs only to the buffer, always with an ACL or a debug condition, and a pre-typed <code>undebug all</code> in a second session.</p><p><b>Lesson:</b> scope first, then debug; the console is the most expensive destination.</p></div>

<div class="iv"><p class="q">"How do you debug safely on a production router?"</p><p>Explain the destinations and levels: disable or raise the console level, send debugs to the buffer, use <code>terminal monitor</code> on SSH. Narrow the scope with an ACL or <code>debug condition</code>, check the CPU with <code>show processes cpu sorted</code>, keep a second session ready and end with <code>undebug all</code>. Mention that <code>debug ip packet</code> only shows process-switched traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Message format: sequence, timestamp, %FACILITY-SEVERITY-MNEMONIC, text; levels 0 (emergencies) to 7 (debugging).</li>
<li>Console, monitor, buffer and trap each have their own level; a level includes everything more severe.</li>
<li><code>show logging</code>: check the trap level, "link up" and the logged counter for each host.</li>
<li>Timestamps need <code>datetime msec</code> and NTP; <b>*</b> means the clock is not synchronised.</li>
<li>Debug with scope (ACL or condition), to the buffer, and end with <code>undebug all</code>.</li>
</ul></div>
`,hi:`
<p>Router ka log dukaan ki CCTV recording jaisa hai. Agar camera ka time galat ho, woh deewar ki taraf ho, ya aisi tape par record kare jo har das minute mein overwrite ho jaati hai, to chori ke baad woh bekaar hai. ENARSI item 4.3 bilkul yahi test karta hai: messages kahan jaate hain, har destination tak kaunsi severity pahunchti hai, timestamps par bharosa kiya ja sakta hai ya nahi, aur debugs safely kaise chalayein.</p>

<h3>Message ki banawat</h3>
<pre class="out">000123: <span class="hl">Sep 30 09:14:07.412 IST</span>: %LINEPROTO-<span class="hl">5</span>-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down</pre>
<p>Hisse hain: sequence number (<code>service sequence-numbers</code>), timestamp, phir <b>%FACILITY-SEVERITY-MNEMONIC</b> aur text. Yahan facility LINEPROTO hai, severity 5, mnemonic UPDOWN.</p>
<table class="cmp"><tr><th>Level</th><th>Keyword</th><th>Udaharan</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>Turant action chahiye, jaise temperature alarm</td></tr>
<tr><td>2</td><td>critical</td><td>Critical hardware ya software condition</td></tr>
<tr><td>3</td><td>errors</td><td>%LINK-3-UPDOWN</td></tr>
<tr><td>4</td><td>warnings</td><td>%DUAL-4-..., configuration warnings</td></tr>
<tr><td>5</td><td>notifications</td><td>%LINEPROTO-5-UPDOWN, %OSPF-5-ADJCHG, %SYS-5-CONFIG_I</td></tr>
<tr><td>6</td><td>informational</td><td>%TRACK-6-STATE, ACL log hits (%SEC-6-IPACCESSLOGP)</td></tr>
<tr><td>7</td><td>debugging</td><td>Saara debug output</td></tr></table>
<p>Level set karne se woh level <b>aur usse zyada severe sab kuch</b> (kam number) bheja jaata hai. <code>logging trap warnings</code> 0 se 4 bhejta hai, isliye %TRACK-6-STATE message server ko kabhi nahi dikhta. Yaad rakhne ka tareeka: "Every Awesome Cisco Engineer Will Need Ice cream Daily".</p>

<h3>Chaar destinations</h3>
<pre class="code">logging buffered 64000 informational      <span class="c">! RAM, show logging se padho</span>
logging console warnings                  <span class="c">! console shaant rakho</span>
logging monitor debugging                 <span class="c">! VTY sessions, terminal monitor ke baad</span>
logging host 10.10.10.50                  <span class="c">! syslog server, default UDP 514</span>
logging trap informational                <span class="c">! saare syslog servers ka level</span>
logging source-interface Loopback0        <span class="c">! stable source address</span>
service timestamps log datetime msec localtime show-timezone
service timestamps debug datetime msec localtime show-timezone
service sequence-numbers</pre>
<pre class="out">BR# show logging
Syslog logging: enabled (0 messages dropped, 2 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)
    Console logging: level warnings, 14 messages logged, xml disabled,
                     filtering disabled
    Monitor logging: level debugging, 0 messages logged, xml disabled,
                     filtering disabled
    Buffer logging:  level informational, 57 messages logged, xml disabled,
                    filtering disabled
<span class="hl">    Trap logging: level informational, 61 message lines logged</span>
<span class="hl">        Logging to 10.10.10.50  (udp port 514, audit disabled,</span>
<span class="hl">              link up),</span>
              61 message lines logged,
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled
        Logging Source-Interface:       VRF Name:
        Loopback0</pre>
<p>Teen cheezein padho: trap level, host ke liye <b>link up</b>, aur badhta hua "message lines logged" counter. Agar counter badhta hai par server ko kuch nahi dikhta, to problem network mein hai (wapas route, ACL, UDP 514 par firewall) ya server par, router mein nahi.</p>

<h3>Bharose layak timestamps</h3>
<p><code>datetime</code> ke bina IOS messages par uptime lagata hai, jaise <code>3d04h:</code>, jise aap correlate nahi kar sakte. <code>datetime</code> ho par NTP na ho, to time ke aage <b>*</b> lagta hai, matlab clock authoritative nahi hai. <b>.</b> prefix ka matlab clock synchronised tha par sync kho diya. NTP configure karo (ENCOR mein cover hua) aur kisi bhi log line par bharosa karne se pehle <code>show ntp status</code> check karo.</p>

<h3>Safely debugging</h3>
<p>Debugs severity 7 hain aur CPU dwara process hote hain. Busy router par <code>debug ip packet</code> ya <code>debug all</code> console ko freeze kar sakta hai aur routing adjacencies gira sakta hai. Safe practice:</p>
<ul>
<li>Debug output console ki jagah buffer mein bhejo: <code>logging buffered 64000 debugging</code>, <code>no logging console</code> ya <code>logging console warnings</code>.</li>
<li>SSH par output dekhne ke liye <code>terminal monitor</code> type karo; <code>terminal no monitor</code> aapke session ke liye ise rokta hai.</li>
<li>ACL se scope seemit karo: <code>debug ip packet 100 detail</code>. Sirf <b>process-switched</b> packets dikhte hain; CEF-switched transit traffic nahi dikhta.</li>
<li><b>Conditional debugging</b> use karo taaki sirf matching events print hon.</li>
<li><code>show debugging</code> se check karo aur hamesha <code>undebug all</code> se khatam karo.</li>
</ul>
<pre class="code">debug condition interface GigabitEthernet0/1
debug condition ip 10.1.1.1
debug ip ospf adj
show debug condition
undebug all
no debug condition all</pre>
<p>Condition un debugs ko filter karti hai jo conditions support karte hain: sirf us interface, IP address, MAC address, username jaisi cheezon se jude events print hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Logging destinations">
<rect x="250" y="80" width="140" height="50" rx="10" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Log message</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">severity 0-7</text>
<rect x="20" y="20" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">console (warnings)</text>
<rect x="20" y="140" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="165" text-anchor="middle" class="svg-ink" font-size="12">buffer (show logging)</text>
<rect x="470" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="12">monitor (VTY)</text>
<rect x="470" y="140" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="12">trap: UDP 514</text>
<line x1="250" y1="95" x2="170" y2="40" stroke="#64748b"/><line x1="250" y1="115" x2="170" y2="160" stroke="#64748b"/><line x1="390" y1="95" x2="470" y2="40" stroke="#64748b"/><line x1="390" y1="115" x2="470" y2="160" stroke="#64748b"/>
</svg><p class="cap">Ek message, chaar destinations, chaar alag severity filters.</p></div>

<div class="eg"><p><b>Worked example.</b> IP SLA lab mein BR ko track change 10.10.10.50 par bhejna hai. Message hai <code>%TRACK-6-STATE: 10 ip sla 10 reachability Up -&gt; Down</code>, severity 6. <code>logging trap notifications</code> (5) ke saath yeh filter ho jaata hai; <code>logging trap informational</code> (6) ke saath bheja jaata hai. Source Loopback0, 172.16.40.1 hona chahiye, kyunki collector device ko usi address se pehchanta hai aur HQ ke paas dono providers ke through 172.16.40.0/24 tak wapas route hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Production router par <code>logging console debugging</code> chhod dena; <code>terminal monitor</code> bhool jaana aur maan lena ki "debug kuch nahi dikhata"; aisa syslog source address jo server accept nahi karta; itna chhota buffer ki kaam ke messages overwrite ho jaayein.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> syslog <b>servers</b> ka level set karta hai, SNMP traps ka nahi. Aur kam number <b>zyada</b> severe hai: "level 3" mein sirf 0, 1, 2 aur 3 aate hain.</p></div>

<div class="scn"><h4>Woh debug jisne OSPF gira diya</h4><p>Ek junior engineer ne 800 Mbps le jaane wale WAN router par console se 10:05 par bina ACL ke <code>debug ip packet</code> type kiya. Console freeze hua, CPU 99% par pahuncha, OSPF dead timers expire hue aur do branches ki routing chali gayi. Ek colleague ne pehle se khule SSH session se <code>undebug all</code> chalaya. Incident ke baad rule bana: debugs sirf buffer mein, hamesha ACL ya debug condition ke saath, aur doosre session mein pehle se type kiya hua <code>undebug all</code>.</p><p><b>Seekh:</b> pehle scope, phir debug; console sabse mehenga destination hai.</p></div>

<div class="iv"><p class="q">"Production router par aap safely debug kaise karte ho?"</p><p>Destinations aur levels samjhao: console level band karo ya badhao, debugs buffer mein bhejo, SSH par <code>terminal monitor</code> use karo. ACL ya <code>debug condition</code> se scope narrow karo, <code>show processes cpu sorted</code> se CPU check karo, doosra session taiyaar rakho aur <code>undebug all</code> se khatam karo. Batao ki <code>debug ip packet</code> sirf process-switched traffic dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Message format: sequence, timestamp, %FACILITY-SEVERITY-MNEMONIC, text; levels 0 (emergencies) se 7 (debugging).</li>
<li>Console, monitor, buffer aur trap ka apna apna level hai; ek level mein usse zyada severe sab kuch aata hai.</li>
<li><code>show logging</code>: har host ke liye trap level, "link up" aur logged counter check karo.</li>
<li>Timestamps ko <code>datetime msec</code> aur NTP chahiye; <b>*</b> ka matlab clock synchronised nahi hai.</li>
<li>Scope (ACL ya condition) ke saath, buffer mein debug karo, aur <code>undebug all</code> se khatam karo.</li>
</ul></div>
`}};export{e as default};