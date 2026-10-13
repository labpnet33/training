var e={id:`logging-config`,h:{en:`Configuring logging: levels, buffers, timestamps and destinations`,hi:`Logging configure karna: levels, buffers, timestamps aur destinations`},body:{en:`
<p>A CCTV system is only useful if it is set up well. If the recorder keeps just two minutes of footage, if the clock is wrong, or if the camera only records fires and not intruders, the footage will fail you exactly when you need it. ASA logging is the same. The messages from the previous chapter only help if logging is enabled, the <b>level</b> is right, the <b>buffer</b> is big enough, <b>timestamps</b> are on with a correct clock, and important messages also go to a <b>syslog server</b> that keeps history.</p>

<h3>Severity levels</h3>
<table class="cmp"><tr><th>Level</th><th>Keyword</th><th>Examples</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>104001 failover switch, 106021 uRPF deny</td></tr>
<tr><td>2</td><td>critical</td><td>106001, 106006, 106016</td></tr>
<tr><td>3</td><td>errors</td><td>106014, 305006, 710003, 313001</td></tr>
<tr><td>4</td><td>warnings</td><td>106023, 411001/411002, 313004</td></tr>
<tr><td>5</td><td>notifications</td><td>111008, 305013</td></tr>
<tr><td>6</td><td>informational</td><td>302013/302014, 305011, 106015, 106100</td></tr>
<tr><td>7</td><td>debugging</td><td>710001/710002, debug output</td></tr></table>
<p>A configured level is <b>inclusive</b>: <code>informational</code> sends levels 0 to 6. Choose it per destination.</p>

<h3>Destinations</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Logging destinations">
<rect x="20" y="95" width="150" height="60" rx="10" fill="#fed7aa"/><text x="95" y="120" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text><text x="95" y="138" text-anchor="middle" class="svg-muted" font-size="12">logging enable</text>
<rect x="300" y="10" width="170" height="36" rx="6" fill="#bae6fd"/><text x="385" y="33" text-anchor="middle" class="svg-ink" font-size="12">buffer (RAM) informational</text>
<rect x="300" y="58" width="170" height="36" rx="6" fill="#e2e8f0"/><text x="385" y="81" text-anchor="middle" class="svg-ink" font-size="12">console: critical or off</text>
<rect x="300" y="106" width="170" height="36" rx="6" fill="#e2e8f0"/><text x="385" y="129" text-anchor="middle" class="svg-ink" font-size="12">monitor (SSH sessions)</text>
<rect x="300" y="154" width="170" height="36" rx="6" fill="#bbf7d0"/><text x="385" y="177" text-anchor="middle" class="svg-ink" font-size="12">trap: syslog server</text>
<rect x="300" y="202" width="170" height="36" rx="6" fill="#ddd6fe"/><text x="385" y="225" text-anchor="middle" class="svg-ink" font-size="12">asdm</text>
<line x1="170" y1="125" x2="300" y2="28" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="76" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="124" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="172" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="220" stroke="#64748b" stroke-width="2"/>
<text x="555" y="33" text-anchor="middle" class="svg-muted" font-size="12">show logging</text>
<text x="555" y="129" text-anchor="middle" class="svg-muted" font-size="12">needs terminal monitor</text>
<text x="555" y="172" text-anchor="middle" class="svg-muted" font-size="12">history, SIEM</text>
<text x="555" y="81" text-anchor="middle" class="svg-muted" font-size="12">slow, keep quiet</text>
<text x="555" y="225" text-anchor="middle" class="svg-muted" font-size="12">GUI log viewer</text>
</svg><p class="cap">One logging engine, several destinations, each with its own level.</p></div>

<pre class="code"><span class="c">! master switch and timestamps</span>
logging enable
logging timestamp
<span class="c">! local buffer: default size is only 4096 bytes, make it bigger</span>
logging buffer-size 1048576
logging buffered informational
<span class="c">! keep the serial console quiet (it is slow and can hurt CPU)</span>
logging console critical
<span class="c">! SSH sessions see messages only after "terminal monitor"</span>
logging monitor debugging
<span class="c">! remote syslog server on the inside, UDP 514 by default</span>
logging trap informational
logging host inside 10.0.1.60
<span class="c">! identify this firewall in a shared SIEM</span>
logging device-id hostname</pre>
<pre class="out">NK-ASA# show logging
Syslog logging: enabled
    Facility: 20
    <span class="hl">Timestamp logging: enabled</span>
    ...
    Console logging: level critical, 0 messages logged
    Monitor logging: level debugging, 0 messages logged
    <span class="hl">Buffer logging: level informational, 212 messages logged</span>
    Trap logging: level informational, facility 20, 212 messages logged
        Logging to inside 10.0.1.60
    ...
Sep 30 2026 10:14:02: %ASA-4-106023: Deny tcp src outside:198.51.100.10/51544 dst dmz:10.0.2.10/443 by access-group "OUTSIDE_IN" [0x0, 0x0]</pre>
<p><code>clear logging buffer</code> empties the buffer, which is handy right before you reproduce a problem.</p>

<h3>Timestamps need a correct clock</h3>
<p>Timestamps are <b>off by default</b>. Turn them on with <code>logging timestamp</code> (newer releases also offer an RFC 5424 format). A timestamp is only as good as the clock behind it, so synchronise the ASA with NTP, as covered in the AAA and secure management module. Without correct time, you cannot line up firewall logs with server logs, captures or a SIEM timeline.</p>

<h3>Tuning what is logged</h3>
<pre class="code"><span class="c">! change the level of one message (make 106023 an error)</span>
logging message 106023 level 3
<span class="c">! silence a noisy message you do not need</span>
no logging message 106015
<span class="c">! a custom list: only the messages that matter for troubleshooting</span>
logging list TSHOOT message 106023
logging list TSHOOT message 302013-302014
logging list TSHOOT message 305011
logging buffered TSHOOT</pre>
<p>Logging lists let you send exactly the IDs you need to a destination instead of a whole severity level. On busy firewalls this keeps the buffer useful for longer.</p>

<h3>TCP syslog and permit-hostdown</h3>
<p>You can send syslog over TCP for reliable delivery: <code>logging host inside 10.0.1.60 tcp/1470</code>. Be careful: by default, if a TCP syslog server becomes unreachable, the ASA <b>stops passing new connections</b>, because it cannot guarantee that they are logged. <code>logging permit-hostdown</code> tells it to keep forwarding. Many compliance designs deliberately leave it off; most operational teams turn it on.</p>

<div class="eg"><p><b>Worked example.</b> A 1 MB buffer holds roughly 1,048,576 / 150 = about 7,000 messages of average length. At informational level a busy internet edge may log 50 messages per second, so the buffer covers only 7,000 / 50 = 140 seconds, less than two and a half minutes. That is fine for "retry now and I will look", but useless for "what happened at 03:00?". History belongs on the syslog server.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>logging console debugging</code> on a busy firewall. Console output is slow, messages queue up, and CPU can spike enough to affect traffic. Use the buffer, the monitor with <code>terminal monitor</code>, or a syslog server, and keep the console at critical or disabled.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default buffer is only 4096 bytes and timestamps are disabled by default. Levels are inclusive (warnings = 0 to 4). And with TCP syslog, an unreachable server can block new traffic unless <code>logging permit-hostdown</code> is configured.</p></div>

<div class="scn"><h4>The firewall that stopped for the log server</h4><p>During a SIEM migration, the old syslog server was switched off on a Friday evening. Within minutes, new connections through the branch ASA stopped, while existing sessions continued. The ASA was configured with <code>logging host inside 10.0.1.60 tcp/1470</code> for audit reasons and without <code>logging permit-hostdown</code>. As soon as the TCP session to the server failed, the ASA refused new connections. The emergency fix was to add <code>logging permit-hostdown</code>; the long-term fix was to point the logging host at the new SIEM before the old one was retired.</p><p><b>Lesson:</b> know what your firewall does when its log destination disappears, and decide it deliberately.</p></div>

<div class="iv"><p class="q">"How would you configure ASA logging for troubleshooting and for audit?"</p><p>Enable logging and timestamps with NTP-synchronised time, raise the buffer size, buffer at informational (so 302013/302014 and 305011 appear), keep the console at critical, send informational or a tailored logging list to a syslog server or SIEM with a device ID, and decide on UDP versus TCP syslog knowing the permit-hostdown behaviour. Mention message-level tuning with <code>logging message</code> and logging lists to control noise.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Levels 0 to 7, inclusive; built and teardown messages need informational (6).</li>
<li><code>logging enable</code>, <code>logging timestamp</code>, <code>logging buffer-size</code>, <code>logging buffered</code>, <code>logging trap</code> with <code>logging host</code>.</li>
<li>Default buffer 4096 bytes and timestamps off; fix both, and use NTP.</li>
<li>Tune with <code>logging message ID level N</code>, <code>no logging message ID</code> and logging lists.</li>
<li>TCP syslog blocks new connections when the server is down unless <code>logging permit-hostdown</code>.</li>
</ul></div>
`,hi:`
<p>CCTV system tabhi kaam ka hai jab woh achhe se set up ho. Agar recorder sirf do minute ki footage rakhta hai, ghadi galat hai, ya camera sirf aag record karta hai aur ghuspaithiye nahi, to footage aapko theek usi waqt dhokha degi jab uski zaroorat hogi. ASA logging bhi aisi hi hai. Pichhle chapter ke messages tabhi madad karte hain jab logging enable ho, <b>level</b> sahi ho, <b>buffer</b> kaafi bada ho, sahi ghadi ke saath <b>timestamps</b> on hon, aur important messages ek <b>syslog server</b> par bhi jaayein jo history rakhe.</p>

<h3>Severity levels</h3>
<table class="cmp"><tr><th>Level</th><th>Keyword</th><th>Examples</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>104001 failover switch, 106021 uRPF deny</td></tr>
<tr><td>2</td><td>critical</td><td>106001, 106006, 106016</td></tr>
<tr><td>3</td><td>errors</td><td>106014, 305006, 710003, 313001</td></tr>
<tr><td>4</td><td>warnings</td><td>106023, 411001/411002, 313004</td></tr>
<tr><td>5</td><td>notifications</td><td>111008, 305013</td></tr>
<tr><td>6</td><td>informational</td><td>302013/302014, 305011, 106015, 106100</td></tr>
<tr><td>7</td><td>debugging</td><td>710001/710002, debug output</td></tr></table>
<p>Configured level <b>inclusive</b> hota hai: <code>informational</code> levels 0 se 6 bhejta hai. Ise har destination ke liye alag chuno.</p>

<h3>Destinations</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Logging destinations">
<rect x="20" y="95" width="150" height="60" rx="10" fill="#fed7aa"/><text x="95" y="120" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text><text x="95" y="138" text-anchor="middle" class="svg-muted" font-size="12">logging enable</text>
<rect x="300" y="10" width="170" height="36" rx="6" fill="#bae6fd"/><text x="385" y="33" text-anchor="middle" class="svg-ink" font-size="12">buffer (RAM) informational</text>
<rect x="300" y="58" width="170" height="36" rx="6" fill="#e2e8f0"/><text x="385" y="81" text-anchor="middle" class="svg-ink" font-size="12">console: critical ya off</text>
<rect x="300" y="106" width="170" height="36" rx="6" fill="#e2e8f0"/><text x="385" y="129" text-anchor="middle" class="svg-ink" font-size="12">monitor (SSH sessions)</text>
<rect x="300" y="154" width="170" height="36" rx="6" fill="#bbf7d0"/><text x="385" y="177" text-anchor="middle" class="svg-ink" font-size="12">trap: syslog server</text>
<rect x="300" y="202" width="170" height="36" rx="6" fill="#ddd6fe"/><text x="385" y="225" text-anchor="middle" class="svg-ink" font-size="12">asdm</text>
<line x1="170" y1="125" x2="300" y2="28" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="76" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="124" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="172" stroke="#64748b" stroke-width="2"/><line x1="170" y1="125" x2="300" y2="220" stroke="#64748b" stroke-width="2"/>
<text x="555" y="33" text-anchor="middle" class="svg-muted" font-size="12">show logging</text>
<text x="555" y="129" text-anchor="middle" class="svg-muted" font-size="12">terminal monitor chahiye</text>
<text x="555" y="172" text-anchor="middle" class="svg-muted" font-size="12">history, SIEM</text>
<text x="555" y="81" text-anchor="middle" class="svg-muted" font-size="12">dheema, shaant rakho</text>
<text x="555" y="225" text-anchor="middle" class="svg-muted" font-size="12">GUI log viewer</text>
</svg><p class="cap">Ek logging engine, kai destinations, har ek ka apna level.</p></div>

<pre class="code"><span class="c">! master switch aur timestamps</span>
logging enable
logging timestamp
<span class="c">! local buffer: default size sirf 4096 bytes hai, bada karo</span>
logging buffer-size 1048576
logging buffered informational
<span class="c">! serial console shaant rakho (yeh dheema hai aur CPU ko nuksaan kar sakta hai)</span>
logging console critical
<span class="c">! SSH sessions ko messages sirf "terminal monitor" ke baad dikhte hain</span>
logging monitor debugging
<span class="c">! inside par remote syslog server, default mein UDP 514</span>
logging trap informational
logging host inside 10.0.1.60
<span class="c">! shared SIEM mein is firewall ki pehchaan</span>
logging device-id hostname</pre>
<pre class="out">NK-ASA# show logging
Syslog logging: enabled
    Facility: 20
    <span class="hl">Timestamp logging: enabled</span>
    ...
    Console logging: level critical, 0 messages logged
    Monitor logging: level debugging, 0 messages logged
    <span class="hl">Buffer logging: level informational, 212 messages logged</span>
    Trap logging: level informational, facility 20, 212 messages logged
        Logging to inside 10.0.1.60
    ...
Sep 30 2026 10:14:02: %ASA-4-106023: Deny tcp src outside:198.51.100.10/51544 dst dmz:10.0.2.10/443 by access-group "OUTSIDE_IN" [0x0, 0x0]</pre>
<p><code>clear logging buffer</code> buffer khaali karta hai, jo problem reproduce karne se theek pehle kaam aata hai.</p>

<h3>Timestamps ko sahi ghadi chahiye</h3>
<p>Timestamps <b>default mein off</b> hote hain. Unhe <code>logging timestamp</code> se on karo (naye releases RFC 5424 format bhi dete hain). Timestamp utna hi achha hai jitni uske peeche ki ghadi, isliye ASA ko NTP se sync karo, jaisa AAA aur secure management module mein cover hua. Sahi time ke bina aap firewall logs ko server logs, captures ya SIEM timeline se nahi mila sakte.</p>

<h3>Kya log ho, use tune karna</h3>
<pre class="code"><span class="c">! ek message ka level badlo (106023 ko error banao)</span>
logging message 106023 level 3
<span class="c">! ek shor wala message chup karao jiski zaroorat nahi</span>
no logging message 106015
<span class="c">! custom list: sirf woh messages jo troubleshooting ke liye matter karte hain</span>
logging list TSHOOT message 106023
logging list TSHOOT message 302013-302014
logging list TSHOOT message 305011
logging buffered TSHOOT</pre>
<p>Logging lists aapko poore severity level ki jagah bilkul wahi IDs kisi destination par bhejne deti hain jo aapko chahiye. Busy firewalls par isse buffer zyada der tak kaam ka rehta hai.</p>

<h3>TCP syslog aur permit-hostdown</h3>
<p>Reliable delivery ke liye aap syslog TCP par bhej sakte ho: <code>logging host inside 10.0.1.60 tcp/1470</code>. Dhyaan rakho: default mein, agar TCP syslog server unreachable ho jaaye, to ASA <b>naye connections pass karna band kar deta hai</b>, kyunki woh guarantee nahi kar sakta ki woh log honge. <code>logging permit-hostdown</code> use forward karte rehne ko kehta hai. Kai compliance designs jaan boojh kar ise off rakhte hain; zyada tar operational teams ise on karti hain.</p>

<div class="eg"><p><b>Worked example.</b> 1 MB buffer average length ke lagbhag 1,048,576 / 150 = kareeb 7,000 messages rakhta hai. Informational level par ek busy internet edge 50 messages per second log kar sakta hai, isliye buffer sirf 7,000 / 50 = 140 second cover karta hai, dhaai minute se kam. "Abhi retry karo aur main dekhta hoon" ke liye yeh theek hai, par "raat 03:00 baje kya hua?" ke liye bekaar. History syslog server par rehni chahiye.</p></div>

<div class="warn"><p><b>Common galti.</b> Busy firewall par <code>logging console debugging</code> enable karna. Console output dheema hai, messages queue mein lag jaate hain, aur CPU itna badh sakta hai ki traffic par asar pade. Buffer, <code>terminal monitor</code> ke saath monitor, ya syslog server use karo, aur console ko critical ya disabled rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default buffer sirf 4096 bytes hai aur timestamps default mein disabled hain. Levels inclusive hain (warnings = 0 se 4). Aur TCP syslog ke saath, unreachable server naya traffic block kar sakta hai jab tak <code>logging permit-hostdown</code> configured na ho.</p></div>

<div class="scn"><h4>Woh firewall jo log server ke liye ruk gaya</h4><p>SIEM migration ke dauran purana syslog server ek Friday shaam band kar diya gaya. Minutes ke andar branch ASA ke through naye connections ruk gaye, jabki existing sessions chalte rahe. ASA audit reasons se <code>logging host inside 10.0.1.60 tcp/1470</code> ke saath aur <code>logging permit-hostdown</code> ke bina configured tha. Jaise hi server tak TCP session fail hua, ASA ne naye connections mana kar diye. Emergency fix <code>logging permit-hostdown</code> jodna tha; long-term fix purana server retire karne se pehle logging host ko naye SIEM ki taraf point karna tha.</p><p><b>Seekh:</b> jaano ki log destination gayab hone par aapka firewall kya karta hai, aur ise soch samajh kar decide karo.</p></div>

<div class="iv"><p class="q">"Troubleshooting aur audit ke liye aap ASA logging kaise configure karoge?"</p><p>Logging aur NTP-synchronised time ke saath timestamps enable karo, buffer size badhao, informational par buffer karo (taaki 302013/302014 aur 305011 dikhein), console ko critical par rakho, device ID ke saath syslog server ya SIEM ko informational ya tailored logging list bhejo, aur permit-hostdown behaviour jaante hue UDP ya TCP syslog decide karo. Shor control karne ke liye <code>logging message</code> se message-level tuning aur logging lists mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Levels 0 se 7, inclusive; built aur teardown messages ko informational (6) chahiye.</li>
<li><code>logging enable</code>, <code>logging timestamp</code>, <code>logging buffer-size</code>, <code>logging buffered</code>, <code>logging host</code> ke saath <code>logging trap</code>.</li>
<li>Default buffer 4096 bytes aur timestamps off; dono theek karo, aur NTP use karo.</li>
<li><code>logging message ID level N</code>, <code>no logging message ID</code> aur logging lists se tune karo.</li>
<li>TCP syslog server down hone par naye connections block karta hai jab tak <code>logging permit-hostdown</code> na ho.</li>
</ul></div>
`}};export{e as default};