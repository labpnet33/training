var e={id:`syslog-config`,h:{en:`Configuring syslog: destinations, levels and timestamps`,hi:`Syslog configure karna: destinations, levels aur timestamps`},body:{en:`
<p>Think of a factory alarm system. The loud siren on the floor (the console) is only useful to whoever is standing next to it. The supervisor's phone (a remote session) rings only if he has turned notifications on. The black-box recorder (the buffer) keeps the last few hours in case someone asks later. And the head office (the syslog server) gets a copy of everything important for years. A Cisco device can send each log message to all four places, each with its own severity filter.</p>

<h3>The four destinations</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Syslog destinations">
<rect x="240" y="100" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="14">R1 log message</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">severity 0-7</text>
<rect x="20" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">Console</text><text x="110" y="59" text-anchor="middle" class="svg-muted" font-size="12">logging console</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">SSH / Telnet (VTY)</text><text x="530" y="59" text-anchor="middle" class="svg-muted" font-size="12">logging monitor</text>
<rect x="20" y="190" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="212" text-anchor="middle" class="svg-ink" font-size="13">Buffer (RAM)</text><text x="110" y="229" text-anchor="middle" class="svg-muted" font-size="12">logging buffered</text>
<rect x="440" y="190" width="180" height="50" rx="8" fill="#fed7aa"/><text x="530" y="212" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text><text x="530" y="229" text-anchor="middle" class="svg-muted" font-size="12">logging host + trap</text>
<line x1="200" y1="60" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="60" x2="390" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="200" x2="250" y2="156" stroke="#64748b" stroke-width="2"/><line x1="440" y1="200" x2="390" y2="156" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">each has its own level</text>
</svg><p class="cap">One message, four possible destinations, four independent severity filters.</p></div>

<table class="cmp"><tr><th>Destination</th><th>Command</th><th>IOS default</th><th>Notes</th></tr>
<tr><td>Console</td><td><code>logging console warnings</code></td><td>debugging (7)</td><td>Only for someone on the console cable. Heavy logging here can slow the CPU.</td></tr>
<tr><td>VTY lines (SSH/Telnet)</td><td><code>logging monitor informational</code> + <code>terminal monitor</code></td><td>debugging (7)</td><td>Messages are shown on a remote session only after you type <code>terminal monitor</code> in that session.</td></tr>
<tr><td>Buffer</td><td><code>logging buffered 16384 informational</code></td><td>varies by platform</td><td>A circular log in RAM, read with <code>show logging</code>. Lost on reload.</td></tr>
<tr><td>Syslog server</td><td><code>logging host 10.1.1.100</code> + <code>logging trap informational</code></td><td>informational (6)</td><td>UDP 514. The level is set by <code>logging trap</code>, which applies to all hosts.</td></tr></table>
<p><code>logging on</code> (default) is the master switch. <code>logging trap</code> is named "trap" for historical reasons; it has nothing to do with SNMP traps.</p>

<h3>Lab 1 configuration</h3>
<pre class="code"><span class="c">! on both R1 and R2</span>
R1(config)# logging host 10.1.1.100
R1(config)# logging trap informational
R1(config)# logging buffered 16384 informational
R1(config)# end
R1#
*Sep 29 08:35:31.432: %SYS-5-CONFIG_I: Configured from console by console</pre>
<p>Leaving configuration mode generates a <code>%SYS-5-CONFIG_I</code> message, which is a handy test: it is severity 5, so it passes an informational filter and should appear on the server.</p>

<h3>Timestamps: the setting that confuses everyone</h3>
<p>Log timestamps have their own configuration, separate from the clock:</p>
<pre class="code"><span class="c">! local time, milliseconds, and the zone name printed</span>
R1(config)# service timestamps log datetime msec localtime show-timezone
<span class="c">! add sequence numbers so gaps are visible</span>
R1(config)# service sequence-numbers
<span class="c">! send every message from one stable address</span>
R1(config)# logging source-interface Loopback0</pre>
<table class="cmp"><tr><th>Setting</th><th>How a message looks</th></tr>
<tr><td><code>service timestamps log uptime</code></td><td><code>2d03h: %LINK-3-UPDOWN: ...</code> (time since boot)</td></tr>
<tr><td><code>service timestamps log datetime msec</code></td><td><code>Sep 29 08:35:31.432: %LINK-3-UPDOWN: ...</code> (UTC)</td></tr>
<tr><td><code>... datetime msec localtime show-timezone</code></td><td><code>Sep 29 14:05:31.432 IST: %LINK-3-UPDOWN: ...</code></td></tr>
<tr><td>Same, clock not synchronised</td><td><code>*Sep 29 14:05:31.432 IST: %LINK-3-UPDOWN: ...</code></td></tr></table>
<p>Without <code>localtime</code> the stamp is UTC even if <code>clock timezone</code> is set. Without <code>show-timezone</code> nobody reading the log knows which zone it is. Always use both.</p>

<h3>Seeing messages on an SSH session</h3>
<pre class="code">R1# terminal monitor
<span class="c">! stop again</span>
R1# terminal no monitor
<span class="c">! stop log messages interrupting your typing on the console</span>
R1(config)# line console 0
R1(config-line)# logging synchronous</pre>
<p><code>terminal monitor</code> is an EXEC command and lasts only for that session. It is the number one reason for "I set logging monitor but I see nothing over SSH".</p>

<h3>Verification</h3>
<pre class="out">R1# show logging
Syslog logging: enabled (0 messages dropped, 0 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)

    Console logging: level debugging, 14 messages logged, xml disabled,
                     filtering disabled
    Monitor logging: level debugging, 0 messages logged, xml disabled,
                     filtering disabled
<span class="hl">    Buffer logging:  level informational, 6 messages logged, xml disabled,</span>
                    filtering disabled
<span class="hl">    Trap logging: level informational, 9 message lines logged</span>
<span class="hl">        Logging to 10.1.1.100  (udp port 514, audit disabled,</span>
              link up),
              3 message lines logged,
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled

Log Buffer (16384 bytes):

Sep 29 14:05:31.432 IST: %SYS-5-CONFIG_I: Configured from console by console</pre>
<p>On the lab NMS, <code>show syslog</code> lists what the collector received:</p>
<pre class="out">NMS&gt; show syslog
Syslog collector on 10.1.1.100 (UDP 514): 2 messages received
Received (UTC)   From            Sev  Message
Sep 29 08:35:31  10.1.1.1        5    &lt;189&gt;Sep 29 14:05:31.432 IST: %SYS-5-CONFIG_I: Configured from console by console
<span class="hl">Sep 29 08:36:02  10.1.12.2       5    &lt;189&gt;Sep 29 14:06:02.118 IST: %SYS-5-CONFIG_I: Configured from console by console</span></pre>

<div class="eg"><p><b>Worked example.</b> A router has <code>logging console warnings</code>, <code>logging buffered informational</code> and <code>logging trap errors</code>. An OSPF neighbour goes down: <code>%OSPF-5-ADJCHG</code>, severity 5. Console: 5 is not ≤ 4, not shown. Buffer: 5 ≤ 6, stored. Server: 5 is not ≤ 3, not sent. The NOC never sees it; only someone running <code>show logging</code> on the router would.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding <code>logging host</code> and forgetting that the server also needs a route back and that ACLs on the path must permit UDP 514. <code>show logging</code> shows "link up" and counters rising even if every packet is dropped later, because UDP has no acknowledgement.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> sets the level for syslog servers. <code>terminal monitor</code> is required per session for VTY lines. The buffer is read with <code>show logging</code>. Default console level is debugging.</p></div>

<div class="scn"><h4>Where did the logs go?</h4><p>After a firewall change, the syslog server stopped receiving messages from twelve branch routers. <code>show logging</code> on the routers showed the host, "link up" and counters increasing. The engineer checked the new firewall policy: it allowed UDP 514 only from the loopback range, but the routers were sending from their WAN interface addresses. Adding <code>logging source-interface Loopback0</code> on every router made the source predictable and matched the rule.</p><p><b>Lesson:</b> set a source interface for syslog (and NTP, SNMP) so security rules and server filters can rely on one address per device.</p></div>

<div class="iv"><p class="q">"I configured logging monitor but see nothing on my SSH session. Why?"</p><p>Strong answer: <code>terminal monitor</code> has not been entered in that session; it is per-session EXEC and must be typed after each login. Then check the level of <code>logging monitor</code> against the message severity, and that <code>logging on</code> is active. Mention <code>logging synchronous</code> as a comfort setting and that remote collection belongs on a syslog server with <code>logging host</code> and <code>logging trap</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four destinations: console, monitor (VTY with <code>terminal monitor</code>), buffer, remote host; each has its own level.</li>
<li><code>logging host X</code> + <code>logging trap level</code> send to a server over UDP 514; default trap level is informational.</li>
<li><code>service timestamps log datetime msec localtime show-timezone</code> gives local time with the zone.</li>
<li><code>service sequence-numbers</code> and <code>logging source-interface</code> make logs reliable and predictable.</li>
<li>Verify with <code>show logging</code> on the device and on the collector.</li>
</ul></div>
`,hi:`
<p>Ek factory ka alarm system socho. Floor par zor ka siren (console) sirf uske kaam ka hai jo uske paas khada hai. Supervisor ka phone (remote session) tabhi bajta hai jab usne notifications on kiye hon. Black-box recorder (buffer) pichhle kuch ghante rakhta hai agar baad mein koi pooche. Aur head office (syslog server) ko har important cheez ki copy saalon tak milti hai. Cisco device har log message ko chaaron jagah bhej sakta hai, har ek ka apna severity filter.</p>

<h3>Chaar destinations</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Syslog destinations">
<rect x="240" y="100" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="14">R1 log message</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">severity 0-7</text>
<rect x="20" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">Console</text><text x="110" y="59" text-anchor="middle" class="svg-muted" font-size="12">logging console</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">SSH / Telnet (VTY)</text><text x="530" y="59" text-anchor="middle" class="svg-muted" font-size="12">logging monitor</text>
<rect x="20" y="190" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="212" text-anchor="middle" class="svg-ink" font-size="13">Buffer (RAM)</text><text x="110" y="229" text-anchor="middle" class="svg-muted" font-size="12">logging buffered</text>
<rect x="440" y="190" width="180" height="50" rx="8" fill="#fed7aa"/><text x="530" y="212" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text><text x="530" y="229" text-anchor="middle" class="svg-muted" font-size="12">logging host + trap</text>
<line x1="200" y1="60" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="60" x2="390" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="200" x2="250" y2="156" stroke="#64748b" stroke-width="2"/><line x1="440" y1="200" x2="390" y2="156" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">har ek ka apna level</text>
</svg><p class="cap">Ek message, chaar possible destinations, chaar independent severity filters.</p></div>

<table class="cmp"><tr><th>Destination</th><th>Command</th><th>IOS default</th><th>Notes</th></tr>
<tr><td>Console</td><td><code>logging console warnings</code></td><td>debugging (7)</td><td>Sirf console cable par baithe insaan ke liye. Yahan bhaari logging CPU ko slow kar sakti hai.</td></tr>
<tr><td>VTY lines (SSH/Telnet)</td><td><code>logging monitor informational</code> + <code>terminal monitor</code></td><td>debugging (7)</td><td>Remote session par messages tabhi dikhte hain jab aap us session mein <code>terminal monitor</code> type karo.</td></tr>
<tr><td>Buffer</td><td><code>logging buffered 16384 informational</code></td><td>platform ke hisaab se</td><td>RAM mein circular log, <code>show logging</code> se padho. Reload par chala jaata hai.</td></tr>
<tr><td>Syslog server</td><td><code>logging host 10.1.1.100</code> + <code>logging trap informational</code></td><td>informational (6)</td><td>UDP 514. Level <code>logging trap</code> se set hota hai, jo saare hosts par lagta hai.</td></tr></table>
<p><code>logging on</code> (default) master switch hai. <code>logging trap</code> ka naam historical wajah se "trap" hai; iska SNMP traps se koi lena dena nahi.</p>

<h3>Lab 1 configuration</h3>
<pre class="code"><span class="c">! R1 aur R2 dono par</span>
R1(config)# logging host 10.1.1.100
R1(config)# logging trap informational
R1(config)# logging buffered 16384 informational
R1(config)# end
R1#
*Sep 29 08:35:31.432: %SYS-5-CONFIG_I: Configured from console by console</pre>
<p>Configuration mode se bahar aane par <code>%SYS-5-CONFIG_I</code> message banta hai, jo ek kaam ka test hai: yeh severity 5 hai, isliye informational filter paar karta hai aur server par dikhna chahiye.</p>

<h3>Timestamps: woh setting jo sabko confuse karti hai</h3>
<p>Log timestamps ki apni configuration hai, clock se alag:</p>
<pre class="code"><span class="c">! local time, milliseconds, aur zone ka naam print</span>
R1(config)# service timestamps log datetime msec localtime show-timezone
<span class="c">! sequence numbers jodo taaki gaps dikhein</span>
R1(config)# service sequence-numbers
<span class="c">! har message ek stable address se bhejo</span>
R1(config)# logging source-interface Loopback0</pre>
<table class="cmp"><tr><th>Setting</th><th>Message kaisa dikhta hai</th></tr>
<tr><td><code>service timestamps log uptime</code></td><td><code>2d03h: %LINK-3-UPDOWN: ...</code> (boot se time)</td></tr>
<tr><td><code>service timestamps log datetime msec</code></td><td><code>Sep 29 08:35:31.432: %LINK-3-UPDOWN: ...</code> (UTC)</td></tr>
<tr><td><code>... datetime msec localtime show-timezone</code></td><td><code>Sep 29 14:05:31.432 IST: %LINK-3-UPDOWN: ...</code></td></tr>
<tr><td>Wahi, clock sync nahi</td><td><code>*Sep 29 14:05:31.432 IST: %LINK-3-UPDOWN: ...</code></td></tr></table>
<p><code>localtime</code> ke bina stamp UTC hota hai chahe <code>clock timezone</code> set ho. <code>show-timezone</code> ke bina log padhne wale ko pata nahi chalta ki kaunsa zone hai. Hamesha dono use karo.</p>

<h3>SSH session par messages dekhna</h3>
<pre class="code">R1# terminal monitor
<span class="c">! phir se band karo</span>
R1# terminal no monitor
<span class="c">! console par typing ke beech log messages ki rukawat roko</span>
R1(config)# line console 0
R1(config-line)# logging synchronous</pre>
<p><code>terminal monitor</code> ek EXEC command hai aur sirf us session tak rehta hai. "Maine logging monitor set kiya par SSH par kuch nahi dikhta" ki number one wajah yahi hai.</p>

<h3>Verification</h3>
<pre class="out">R1# show logging
Syslog logging: enabled (0 messages dropped, 0 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)

    Console logging: level debugging, 14 messages logged, xml disabled,
                     filtering disabled
    Monitor logging: level debugging, 0 messages logged, xml disabled,
                     filtering disabled
<span class="hl">    Buffer logging:  level informational, 6 messages logged, xml disabled,</span>
                    filtering disabled
<span class="hl">    Trap logging: level informational, 9 message lines logged</span>
<span class="hl">        Logging to 10.1.1.100  (udp port 514, audit disabled,</span>
              link up),
              3 message lines logged,
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled

Log Buffer (16384 bytes):

Sep 29 14:05:31.432 IST: %SYS-5-CONFIG_I: Configured from console by console</pre>
<p>Lab NMS par <code>show syslog</code> dikhata hai ki collector ko kya mila:</p>
<pre class="out">NMS&gt; show syslog
Syslog collector on 10.1.1.100 (UDP 514): 2 messages received
Received (UTC)   From            Sev  Message
Sep 29 08:35:31  10.1.1.1        5    &lt;189&gt;Sep 29 14:05:31.432 IST: %SYS-5-CONFIG_I: Configured from console by console
<span class="hl">Sep 29 08:36:02  10.1.12.2       5    &lt;189&gt;Sep 29 14:06:02.118 IST: %SYS-5-CONFIG_I: Configured from console by console</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek router par <code>logging console warnings</code>, <code>logging buffered informational</code> aur <code>logging trap errors</code> hai. Ek OSPF neighbour down hota hai: <code>%OSPF-5-ADJCHG</code>, severity 5. Console: 5 ≤ 4 nahi, nahi dikhega. Buffer: 5 ≤ 6, store hoga. Server: 5 ≤ 3 nahi, nahi bheja jaayega. NOC ise kabhi nahi dekhta; sirf router par <code>show logging</code> chalane wala dekhega.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>logging host</code> jodna aur bhool jaana ki server ko wapas route chahiye aur path ki ACLs ko UDP 514 permit karna chahiye. <code>show logging</code> "link up" aur badhte counters dikhata hai chahe har packet baad mein drop ho jaaye, kyunki UDP mein acknowledgement nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> syslog servers ka level set karta hai. VTY lines ke liye har session mein <code>terminal monitor</code> chahiye. Buffer <code>show logging</code> se padha jaata hai. Default console level debugging hai.</p></div>

<div class="scn"><h4>Logs kahan gaye?</h4><p>Ek firewall change ke baad syslog server ko baarah branch routers se messages milna band ho gaye. Routers par <code>show logging</code> host, "link up" aur badhte counters dikha raha tha. Engineer ne nayi firewall policy check ki: woh UDP 514 sirf loopback range se allow karti thi, lekin routers apne WAN interface addresses se bhej rahe the. Har router par <code>logging source-interface Loopback0</code> jodne se source predictable ho gaya aur rule se match ho gaya.</p><p><b>Seekh:</b> syslog (aur NTP, SNMP) ke liye source interface set karo taaki security rules aur server filters har device ke ek address par bharosa kar sakein.</p></div>

<div class="iv"><p class="q">"Maine logging monitor configure kiya par SSH session par kuch nahi dikhta. Kyun?"</p><p>Strong answer: us session mein <code>terminal monitor</code> nahi daala gaya; yeh per-session EXEC hai aur har login ke baad type karna padta hai. Phir <code>logging monitor</code> ka level message severity se compare karo, aur check karo ki <code>logging on</code> active hai. <code>logging synchronous</code> ko comfort setting ke roop mein mention karo aur bolo ki remote collection <code>logging host</code> aur <code>logging trap</code> ke saath syslog server par honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar destinations: console, monitor (<code>terminal monitor</code> ke saath VTY), buffer, remote host; har ek ka apna level.</li>
<li><code>logging host X</code> + <code>logging trap level</code> UDP 514 par server ko bhejte hain; default trap level informational hai.</li>
<li><code>service timestamps log datetime msec localtime show-timezone</code> zone ke saath local time deta hai.</li>
<li><code>service sequence-numbers</code> aur <code>logging source-interface</code> logs ko reliable aur predictable banate hain.</li>
<li>Device par aur collector par <code>show logging</code> / <code>show syslog</code> se verify karo.</li>
</ul></div>
`}};export{e as default};