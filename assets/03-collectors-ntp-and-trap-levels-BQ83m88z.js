var e=`<svg viewBox="0 0 640 210" role="img" aria-label="One event, four destinations with separate levels">
<rect x="20" y="75" width="120" height="60" rx="10" fill="#bae6fd"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="13">Event</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">severity 5</text>
<rect x="260" y="10" width="170" height="38" rx="8" fill="#e2e8f0"/><text x="345" y="34" text-anchor="middle" class="svg-ink" font-size="12">console  level 7</text>
<rect x="260" y="60" width="170" height="38" rx="8" fill="#e2e8f0"/><text x="345" y="84" text-anchor="middle" class="svg-ink" font-size="12">buffered  level 7</text>
<rect x="260" y="110" width="170" height="38" rx="8" fill="#bbf7d0"/><text x="345" y="134" text-anchor="middle" class="svg-ink" font-size="12">trap (server)  level 6</text>
<rect x="260" y="160" width="170" height="38" rx="8" fill="#fed7aa"/><text x="345" y="184" text-anchor="middle" class="svg-ink" font-size="12">trap level 4: NOT sent</text>
<line x1="140" y1="105" x2="260" y2="29" stroke="#64748b" stroke-width="2"/><line x1="140" y1="105" x2="260" y2="79" stroke="#64748b" stroke-width="2"/><line x1="140" y1="105" x2="260" y2="129" stroke="#64748b" stroke-width="2"/><line x1="140" y1="105" x2="260" y2="179" stroke="#64748b" stroke-width="2"/>
<text x="540" y="132" text-anchor="middle" class="svg-accent" font-size="12">5 is at or below 6: sent</text><text x="540" y="182" text-anchor="middle" class="svg-accent" font-size="12">5 is above 4: dropped</text>
</svg>`,t={id:`collectors-ntp-trap-levels`,h:{en:`Collectors, NTP and trap levels`,hi:`Collectors, NTP aur trap levels`},body:{en:`
<h3>Three decisions that decide whether your logs are useful</h3>
<p>Chapter 1 sent logs to NMS. Now we make them trustworthy. There are three decisions: <b>how much</b> to send (trap level), <b>how reliably</b> to send (UDP, TCP or TLS), and <b>when</b> each event happened (timestamps and NTP). Get these right and you can reconstruct an incident to the millisecond. Get one wrong and the logs mislead you.</p>

<h3>Trap level: the filter on the way out</h3>
<p>A router can send each message to several destinations at once: the <b>console</b> (the cable in your laptop), <b>monitor</b> (telnet or SSH sessions), the <b>buffer</b> (RAM) and the <b>syslog servers</b>. Each destination has its own level. For servers the command is <code>logging trap LEVEL</code>. The word "trap" here is historical and has nothing to do with SNMP traps.</p>
<p>The rule: <b>a destination receives every message whose severity number is less than or equal to its level.</b> Level informational (6) lets through 0, 1, 2, 3, 4, 5 and 6, and blocks only debugging (7). Level warnings (4) lets through 0 to 4 and blocks notifications, such as interface up messages, which are number 5.</p>
<div class="dia">`+e+`<p class="cap">The same event is checked separately against every destination.</p></div>
<div class="eg"><p><b>Worked example.</b> Gi0/2 on R-HYD comes back up. The message is %LINEPROTO-5-UPDOWN, severity 5. With <code>logging trap warnings</code> (4), 5 is above 4, so the router does <b>not</b> send it. NMS shows the link going down (severity 3) but never coming back up. An engineer reading only NMS thinks the link is still down. Changing the level to informational (6) fixes it.</p></div>
<table class="cmp"><tr><th>Choice</th><th>Result</th><th>Use when</th></tr>
<tr><td>errors (3)</td><td>only failures reach NMS</td><td>very small server, low interest</td></tr>
<tr><td>notifications (5)</td><td>failures plus up/down and config changes</td><td>common minimum</td></tr>
<tr><td>informational (6)</td><td>adds routine facts such as ACL hits</td><td>our standard at Godavari Foods</td></tr>
<tr><td>debugging (7)</td><td>adds debug output</td><td>only briefly, for one problem</td></tr></table>

<h3>Buffer versus remote</h3>
<pre class="code">HYD-CORE-R1(config)# logging buffered 16384 informational
HYD-CORE-R1(config)# logging console warnings
HYD-CORE-R1(config)# logging trap informational</pre>
<p>The buffer is for the engineer on the box, so it can be generous. The console is slow and can even slow a router that prints too much, so keep it low. The trap level controls what the central store holds. They are independent: raising the trap level does not change what <code>show logging</code> prints from the buffer.</p>

<h3>Transport: UDP, TCP and TLS</h3>
<p>Classic syslog is <b>UDP port 514</b>: fast, simple, no handshake, and no guarantee. A burst of messages can be dropped by a busy network or a full server queue and nobody is told. Better options exist.</p>
<ul>
<li><b>TCP (often port 514 or 601)</b>: connection-oriented, so lost segments are re-sent and the sender knows when the server is gone. It costs memory for buffering.</li>
<li><b>TLS (often port 6514)</b>: TCP plus encryption and server authentication, so logs cannot be read or altered in transit. This matters when logs cross the internet.</li>
</ul>
<p>Our simulator and our labs use UDP 514, which is what many network devices still use. In your own network, choose TCP or TLS for firewalls and security logs. A busy collector may also support RELP in rsyslog, another reliable protocol. Always check the exact transport options in your platform documentation.</p>

<h3>Timestamps and NTP: the same clock everywhere</h3>
<p>Imagine three routers whose clocks differ by a few minutes. Logs from them cannot be interleaved. A cause that really happened first appears to come after its effect. The remedy is <b>NTP</b> (Network Time Protocol, UDP 123): every device asks a trusted time source and corrects its clock.</p>
<pre class="code">HYD-CORE-R1(config)# ntp server 10.1.50.100
HYD-CORE-R1(config)# service timestamps log datetime msec
HYD-CORE-R1(config)# end
HYD-CORE-R1# show ntp status
HYD-CORE-R1# show clock</pre>
<pre class="out">Clock is <span class="hl">synchronized</span>, stratum 3, reference is 10.1.50.100
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
ntp uptime is 8640 (1/100 of seconds), resolution is 4000
<span class="hl">09:12:44.205 UTC Wed Oct 7 2026</span></pre>
<p>Notice two things. First, the status says synchronised and shows the reference. Second, <code>show clock</code> has no asterisk in front of the time. An asterisk (<code>*09:12:44.205</code>) means "time not authoritative", and every log line will carry that star. Synchronisation can take a few minutes after the first configuration, so wait before you decide it is broken.</p>
<p><b>Stratum</b> means distance from a true clock. A device syncing from stratum 2 becomes stratum 3. A lower stratum is closer to the source. Use one internal source for all devices so they agree with each other even if the internet is down.</p>
<div class="note"><p>Time zone is part of the story. Keep every device in UTC, or set the same zone on all of them. Mixed zones are the most common reason that logs of one incident seem hours apart.</p></div>

<h3>Rate limits and floods</h3>
<p>A flapping port can produce hundreds of messages a second. This hurts two ways: the collector burns disk and may start dropping, and real events are buried. Remedies: fix the cause, use <code>logging rate-limit</code> where the platform supports it, set a sensible trap level, and let the collector rate-limit per sender. In the Godavari lab console the collector drops what exceeds its rate limit for each source, so a flood from one switch can hide events from that same switch. Chapter 4 returns to this.</p>

<h3>Choosing a collector</h3>
<p>Collector software ranges from rsyslog on a Linux server, which writes one file per device, to large search platforms. What matters for the engineer: it listens on the right port, stores long enough (retention), keeps the sender's address, and can alert on a pattern. The collector is a service too: monitor its disk and its listener.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting trap level to warnings and then wondering why "interface up" never arrives. (2) Believing <code>logging console debugging</code> is harmless. (3) Skipping NTP, so timestamps start with an asterisk or show uptime. (4) Mixing time zones. (5) Raising the buffer level and expecting the server to receive more.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Logging trap" filters messages sent to a syslog server and has no relation to SNMP traps. Also remember the direction: a higher number includes more messages, so debugging includes everything.</p></div>

<div class="scn"><h4>The effect that came before the cause</h4><p>After an outage, the log showed R-LKO reporting a BGP-like neighbour loss at 10:03 while R-HYD reported the link failure at 10:07. People argued that Lucknow caused the fault. The R-LKO clock was four minutes fast and had no NTP. After synchronising all routers to 10.1.50.100 and replaying the evidence, the link failure at Hyderabad came first, and the real cause was the circuit.</p><p><b>Lesson:</b> without common time, logs from different devices cannot prove order.</p></div>

<div class="iv"><p class="q">"What does logging trap informational do, and what would change if you set it to warnings?"</p><p>Strong answer: it sends to the syslog server every message from severity 0 to 6 and blocks only debugging. At warnings, only 0 to 4 are sent, so notifications such as interface up and configuration changes stop reaching the server. Add that buffer, console and trap levels are separate, and that you verify with show logging.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A destination gets every message whose severity number is at or below its level.</li>
<li>Buffer, console and trap (server) levels are independent settings.</li>
<li>UDP 514 is unreliable; TCP adds delivery and TLS adds encryption and authentication.</li>
<li>NTP plus service timestamps datetime msec gives a trustworthy timeline; an asterisk means unsynchronised.</li>
<li>Floods hide real events: fix the cause, limit rate, keep levels sensible.</li>
</ul></div>
`,hi:`
<h3>Teen decisions jo tay karte hain ki logs kaam ke hain ya nahi</h3>
<p>Chapter 1 mein humne logs NMS ko bheje. Ab hum unhe bharosemand banate hain. Teen decisions hain: <b>kitna</b> bhejna hai (trap level), <b>kitni reliably</b> bhejna hai (UDP, TCP ya TLS), aur <b>kab</b> har event hua (timestamps aur NTP). Yeh teen sahi to aap incident ko millisecond tak reconstruct kar sakte ho. Ek bhi galat to logs aapko bhatkate hain.</p>

<h3>Trap level: bahar jaate waqt ka filter</h3>
<p>Ek router har message kai destinations ko ek saath bhej sakta hai: <b>console</b> (aapke laptop ka cable), <b>monitor</b> (telnet ya SSH sessions), <b>buffer</b> (RAM) aur <b>syslog servers</b>. Har destination ka apna level hota hai. Servers ke liye command hai <code>logging trap LEVEL</code>. Yahan "trap" word purana hai aur SNMP traps se koi lena-dena nahi.</p>
<p>Rule: <b>har destination ko woh saare messages milte hain jinka severity number uske level se chhota ya barabar hai.</b> Level informational (6) 0, 1, 2, 3, 4, 5 aur 6 ko jaane deta hai, aur sirf debugging (7) ko rokta hai. Level warnings (4) 0 se 4 ko jaane deta hai aur notifications ko rokta hai, jaise interface up messages, jo number 5 hain.</p>
<div class="dia">`+e+`<p class="cap">Wahi event har destination ke saamne alag se check hota hai.</p></div>
<div class="eg"><p><b>Worked example.</b> R-HYD ka Gi0/2 wapas up ho jaata hai. Message %LINEPROTO-5-UPDOWN hai, severity 5. <code>logging trap warnings</code> (4) ke saath 5, 4 se upar hai, to router yeh message <b>nahi</b> bhejta. NMS link ko down hote dikhata hai (severity 3) lekin wapas up hote kabhi nahi. Sirf NMS padhne wala engineer sochta hai ki link abhi bhi down hai. Level ko informational (6) karne se theek ho jaata hai.</p></div>
<table class="cmp"><tr><th>Choice</th><th>Result</th><th>Kab use karein</th></tr>
<tr><td>errors (3)</td><td>sirf failures NMS tak pahunchte hain</td><td>bahut chhota server, kam interest</td></tr>
<tr><td>notifications (5)</td><td>failures plus up/down aur config changes</td><td>aam minimum</td></tr>
<tr><td>informational (6)</td><td>routine facts jaise ACL hits jodta hai</td><td>Godavari Foods ka standard</td></tr>
<tr><td>debugging (7)</td><td>debug output jodta hai</td><td>sirf thodi der, ek problem ke liye</td></tr></table>

<h3>Buffer versus remote</h3>
<pre class="code">HYD-CORE-R1(config)# logging buffered 16384 informational
HYD-CORE-R1(config)# logging console warnings
HYD-CORE-R1(config)# logging trap informational</pre>
<p>Buffer box par baithe engineer ke liye hai, to woh udaar ho sakta hai. Console slow hai aur zyada print karne par router ko bhi slow kar sakta hai, to use kam rakho. Trap level tay karta hai ki central store mein kya rahega. Yeh teeno independent hain: trap level badhane se buffer se <code>show logging</code> ka print nahi badalta.</p>

<h3>Transport: UDP, TCP aur TLS</h3>
<p>Classic syslog <b>UDP port 514</b> hai: tez, simple, koi handshake nahi, aur koi guarantee nahi. Messages ka burst busy network ya bhare server queue se drop ho sakta hai aur kisi ko pata nahi chalta. Behtar options hain.</p>
<ul>
<li><b>TCP (aksar port 514 ya 601)</b>: connection-oriented, to lost segments dobara bheje jaate hain aur sender ko pata chalta hai jab server chala jaata hai. Buffering ke liye memory lagti hai.</li>
<li><b>TLS (aksar port 6514)</b>: TCP plus encryption aur server authentication, to logs transit mein na padhe ja sakte hain na badle ja sakte hain. Yeh tab zaroori hai jab logs internet cross karein.</li>
</ul>
<p>Hamara simulator aur labs UDP 514 use karte hain, jo kai network devices abhi bhi karte hain. Apne network mein firewalls aur security logs ke liye TCP ya TLS chuno. Busy collector RELP bhi support kar sakta hai, rsyslog mein ek aur reliable protocol. Exact transport options ke liye hamesha apne platform ka documentation dekho.</p>

<h3>Timestamps aur NTP: har jagah same clock</h3>
<p>Socho teen routers hain jinki clocks kuch minutes alag hain. Unke logs interleave nahi ho sakte. Jo cause pehle hua woh effect ke baad hua dikhta hai. Ilaaj hai <b>NTP</b> (Network Time Protocol, UDP 123): har device ek trusted time source se poochhta hai aur apni clock theek karta hai.</p>
<pre class="code">HYD-CORE-R1(config)# ntp server 10.1.50.100
HYD-CORE-R1(config)# service timestamps log datetime msec
HYD-CORE-R1(config)# end
HYD-CORE-R1# show ntp status
HYD-CORE-R1# show clock</pre>
<pre class="out">Clock is <span class="hl">synchronized</span>, stratum 3, reference is 10.1.50.100
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
ntp uptime is 8640 (1/100 of seconds), resolution is 4000
<span class="hl">09:12:44.205 UTC Wed Oct 7 2026</span></pre>
<p>Do cheezein dekho. Pehli, status synchronised kehta hai aur reference dikhata hai. Doosri, <code>show clock</code> mein time se pehle asterisk nahi hai. Asterisk (<code>*09:12:44.205</code>) ka matlab "time authoritative nahi", aur har log line par yeh star aayega. Pehli configuration ke baad synchronisation mein kuch minute lag sakte hain, to broken maanne se pehle intezaar karo.</p>
<p><b>Stratum</b> matlab asli clock se doori. Stratum 2 se sync karne wala device stratum 3 ban jaata hai. Chhota stratum source ke kareeb hai. Saare devices ke liye ek internal source use karo taaki internet down ho tab bhi woh ek doosre se agree karein.</p>
<div class="note"><p>Time zone bhi kahani ka hissa hai. Har device ko UTC mein rakho, ya sab par same zone set karo. Mixed zones is baat ki sabse aam wajah hain ki ek incident ke logs ghanton alag dikhte hain.</p></div>

<h3>Rate limits aur floods</h3>
<p>Ek flapping port ek second mein sainkdon messages bana sakta hai. Isse do tarah nuksan hota hai: collector disk jalata hai aur drop karna shuru kar sakta hai, aur asli events dab jaate hain. Upay: cause theek karo, jahan platform support kare wahan <code>logging rate-limit</code> use karo, sensible trap level rakho, aur collector ko per sender rate-limit karne do. Godavari lab console mein collector har source ke liye rate limit se zyada ko drop karta hai, to ek switch ka flood usi switch ke asli events chhupa sakta hai. Chapter 4 isko dobara uthata hai.</p>

<h3>Collector chunna</h3>
<p>Collector software Linux server par rsyslog se lekar, jo har device ki ek file likhta hai, bade search platforms tak hota hai. Engineer ke liye matter yeh karta hai: woh sahi port par sunta hai, kaafi der tak store karta hai (retention), sender ka address rakhta hai, aur pattern par alert de sakta hai. Collector bhi ek service hai: uski disk aur listener ko monitor karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Trap level warnings karke sochna ki "interface up" kabhi kyun nahi aata. (2) <code>logging console debugging</code> ko harmless maanna. (3) NTP skip karna, to timestamps asterisk se shuru hote hain ya uptime dikhate hain. (4) Time zones mix karna. (5) Buffer level badhakar umeed karna ki server ko zyada milega.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Logging trap" syslog server ko jaane wale messages ko filter karta hai aur SNMP traps se iska koi relation nahi. Direction bhi yaad rakho: bada number zyada messages shamil karta hai, to debugging sab kuch include karta hai.</p></div>

<div class="scn"><h4>Effect jo cause se pehle aaya</h4><p>Outage ke baad log mein R-LKO 10:03 par neighbour loss report karta dikha jabki R-HYD ne 10:07 par link failure report kiya. Logon ne bahas ki ki Lucknow ne fault kiya. R-LKO ki clock chaar minute aage thi aur usme NTP nahi tha. Saare routers ko 10.1.50.100 se synchronise karke evidence dobara chalaya to Hyderabad ka link failure pehle aaya, aur asli cause circuit nikla.</p><p><b>Seekh:</b> common time ke bina alag devices ke logs order sabit nahi kar sakte.</p></div>

<div class="iv"><p class="q">"logging trap informational kya karta hai, aur warnings set karne par kya badlega?"</p><p>Strong answer: yeh syslog server ko severity 0 se 6 ke saare messages bhejta hai aur sirf debugging ko rokta hai. Warnings par sirf 0 se 4 jaate hain, to interface up aur configuration changes jaise notifications server tak pahunchna band ho jaate hain. Yeh bhi jodo ki buffer, console aur trap levels alag hain, aur show logging se verify karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har destination ko woh messages milte hain jinka severity number uske level ke barabar ya neeche hai.</li>
<li>Buffer, console aur trap (server) levels independent settings hain.</li>
<li>UDP 514 unreliable hai; TCP delivery jodta hai aur TLS encryption aur authentication.</li>
<li>NTP plus service timestamps datetime msec bharosemand timeline deta hai; asterisk ka matlab unsynchronised.</li>
<li>Floods asli events chhupate hain: cause theek karo, rate limit karo, levels sensible rakho.</li>
</ul></div>
`}};export{t as default};