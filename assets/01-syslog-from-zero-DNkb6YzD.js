var e=`<svg viewBox="0 0 640 200" role="img" aria-label="Syslog path from devices to the collector">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">R-HYD</text>
<rect x="20" y="78" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="105" text-anchor="middle" class="svg-ink" font-size="13">R-KCH</text>
<rect x="20" y="136" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="163" text-anchor="middle" class="svg-ink" font-size="13">R-LKO</text>
<rect x="260" y="60" width="150" height="80" rx="10" fill="#fde68a"/><text x="335" y="95" text-anchor="middle" class="svg-ink" font-size="13">NMS 10.1.50.100</text><text x="335" y="115" text-anchor="middle" class="svg-muted" font-size="12">UDP 514 listener</text>
<rect x="500" y="60" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="13">Log store</text><text x="565" y="115" text-anchor="middle" class="svg-muted" font-size="12">search, keep, alert</text>
<line x1="150" y1="42" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="150" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="150" y1="158" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="205" y="30" text-anchor="middle" class="svg-accent" font-size="12">one-way messages</text>
</svg>`,t={id:`syslog-from-zero`,h:{en:`Syslog from zero: why every device talks and who listens`,hi:`Syslog zero se: har device kyun bolta hai aur kaun sunta hai`},body:{en:`
<h3>What you will learn</h3>
<p>This module teaches you to build, read and repair centralised logging the way a Network Observability Engineer does. In this chapter you learn what syslog is, why a router keeps a diary, why that diary is not enough, and the first four settings that send the diary to one central server. Later chapters add severity levels, formats, NTP and trap levels, and a full troubleshooting method for the day logs stop arriving.</p>
<p><b>Prerequisites:</b> you can log in to a router, enter configuration mode, and you know what an IP address and a UDP port are. You have met the monitoring idea in module obs-start. If not, the analogy below is enough.</p>

<h3>An analogy: the ship's log and the head office</h3>
<p>Every ship keeps a logbook: engine started, storm at midnight, crew changed. If the ship sinks, the logbook sinks with it. So the captain also radios short notes to head office. Head office files notes from all ships in one place and can answer "which ships saw that storm?". A router is the ship, the logbook is the router's memory buffer, the radio is syslog, and head office is the log collector.</p>

<h3>What syslog is</h3>
<p><b>Syslog</b> is a standard way for a device to send a short text message about an event to another machine. The sending device is the <b>source</b> or client. The receiving machine is the <b>collector</b> or syslog server. Syslog is one-way: the device sends and does not wait for an answer. There is no login and no reply. That simplicity is why every vendor supports it, and also why you must prove it works instead of assuming.</p>
<dl class="terms">
<dt>Event</dt><dd>Something that happened: an interface went down, a user logged in, a configuration was saved.</dd>
<dt>Message</dt><dd>One line of text that describes the event, with a time, a severity and a name for the event type.</dd>
<dt>Buffer</dt><dd>A small area of the router's RAM that keeps the latest messages. It is wiped on reload.</dd>
<dt>Collector</dt><dd>A server that listens on UDP port 514 and stores what it receives. In our company it is NMS at 10.1.50.100.</dd>
</dl>

<div class="dia">`+e+`<p class="cap">Godavari Foods: three routers send events to one collector in Hyderabad.</p></div>

<h3>Why the local buffer is not enough</h3>
<p>Imagine ILL-HYD-01 flaps at 02:10 and the router reloads at 02:15 because of a power cut. When the engineer arrives, the buffer is empty. The evidence is gone. Central logging fixes four problems at once: logs survive a reload, you search all devices in one place, the story of an incident across three cities lines up on one timeline, and an attacker who breaks into a router cannot easily erase what was already copied away.</p>

<h3>The first configuration: four lines</h3>
<p>Godavari Foods wants R-HYD (hostname HYD-CORE-R1) to report to NMS. This is the lab obs-syslog-1 in miniature.</p>
<pre class="code">HYD-CORE-R1# configure terminal
HYD-CORE-R1(config)# <span class="c">! where to send</span>
HYD-CORE-R1(config)# logging host 10.1.50.100
HYD-CORE-R1(config)# <span class="c">! how serious a message must be to leave the box</span>
HYD-CORE-R1(config)# logging trap informational
HYD-CORE-R1(config)# <span class="c">! which address the messages come from</span>
HYD-CORE-R1(config)# logging source-interface Loopback0
HYD-CORE-R1(config)# <span class="c">! put a real date and time with milliseconds in every message</span>
HYD-CORE-R1(config)# service timestamps log datetime msec
HYD-CORE-R1(config)# end</pre>
<ul>
<li><code>logging host</code> names the collector. Messages go by UDP to port 514 unless you say otherwise.</li>
<li><code>logging trap informational</code> sets the threshold. Chapter 3 explains it fully; for now remember that it filters what is sent to the server only.</li>
<li><code>logging source-interface Loopback0</code> makes every message carry the loopback address 10.255.0.1 as its source. A loopback never goes down while the router has any working link, so the collector sees one stable name for the device.</li>
<li><code>service timestamps log datetime msec</code> stamps each message with date and time to the millisecond. Without it the router uses time since boot, which cannot be compared with other devices.</li>
</ul>

<h3>Checking it: show logging</h3>
<pre class="code">HYD-CORE-R1# show logging | include Trap|Logging to|Source</pre>
<pre class="out">    Trap logging: level <span class="hl">informational</span>, 41 message lines logged
        Logging to <span class="hl">10.1.50.100</span>  (udp port 514, audit disabled,
        Logging Source-Interface:       VRF Name:
        <span class="hl">Loopback0</span></pre>
<p>Read it left to right: the trap level is informational, the destination is 10.1.50.100 on UDP 514, and the source is Loopback0. A counter named "message lines logged" under the host should rise when events happen. If it stays at zero while the router is busy, the router is not sending.</p>

<div class="eg"><p><b>Worked example.</b> At 09:00:00 you shut and un-shut interface Gi0/2 on R-HYD. That produces two messages: the link went down, and later the line protocol went up. With the four lines above, both appear on NMS within a second, stamped with the same clock as every other device. Without the host line they appear only in the buffer. Without the timestamp line they carry an uptime like 3d02h, which cannot be matched to R-KCH.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring <code>logging host</code> and never testing it, because syslog gives no error when nothing arrives. (2) Forgetting that the collector must be listening on UDP 514 and not blocked by its own firewall. (3) Using a physical interface as source, so the address changes when that port is down. (4) Assuming the buffer and the remote server hold the same messages; they have separate thresholds.</p></div>
<div class="exam"><p><b>Exam trap.</b> Syslog uses UDP port 514 by default and is unreliable: there is no acknowledgement and no retransmission. If a question says "guaranteed delivery", the answer is TCP or TLS transport, not default syslog.</p></div>

<div class="scn"><h4>The power cut with no evidence</h4><p>A power cut at the Kochi branch restarted R-KCH. The next morning Ravi Menon wanted to know whether the uplink had flapped before the cut. The router buffer was empty after the reload. Because nobody had configured a logging host, there was no copy anywhere. After the incident the team added the four lines to every router and tested with a deliberate message. Three weeks later a similar cut left a complete trail on NMS.</p><p><b>Lesson:</b> the best time to configure central logging is before the first incident.</p></div>

<div class="iv"><p class="q">"Why do we send router logs to a central server instead of reading the router's own logs?"</p><p>Strong answer: the local buffer is small and lost on reload, so evidence disappears exactly when you need it. A central collector keeps history, lets you search and correlate many devices on one timeline, and protects evidence if a device is compromised. Mention that syslog is unreliable UDP, so you also verify delivery with a test message.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog is a one-way text message from a device (source) to a collector on UDP 514.</li>
<li>The router buffer is small and disappears on reload; a collector keeps history.</li>
<li>Core settings: logging host, logging trap level, logging source-interface, service timestamps.</li>
<li>show logging proves the host, the trap level and the source interface on the device.</li>
<li>Syslog gives no error when messages are lost, so always test end to end.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Yeh module aapko centralised logging banana, padhna aur repair karna sikhata hai, jaise ek Network Observability Engineer karta hai. Is chapter mein aap seekhoge ki syslog kya hai, router diary kyun rakhta hai, woh diary kaafi kyun nahi hai, aur woh pehli chaar settings jo diary ko ek central server tak bhejti hain. Aage ke chapters mein severity levels, formats, NTP aur trap levels aayenge, aur us din ka poora troubleshooting method jab logs aana band ho jaayein.</p>
<p><b>Prerequisites:</b> aap router mein login karke configuration mode mein ja sakte ho, aur aapko pata hai IP address aur UDP port kya hote hain. Monitoring ka idea aap module obs-start mein mil chuke ho. Agar nahi, to neeche ki analogy kaafi hai.</p>

<h3>Ek analogy: jahaaz ka logbook aur head office</h3>
<p>Har jahaaz ek logbook rakhta hai: engine start hua, raat ko toofan aaya, crew badli. Agar jahaaz doob gaya to logbook bhi doob gaya. Isliye captain head office ko chhote notes radio se bhi bhejta hai. Head office saare jahaazon ke notes ek jagah rakhta hai aur pooch sakta hai "kis kis jahaaz ne woh toofan dekha?". Router jahaaz hai, logbook router ka memory buffer hai, radio syslog hai, aur head office log collector hai.</p>

<h3>Syslog kya hai</h3>
<p><b>Syslog</b> ek standard tareeka hai jisse ek device kisi event ke baare mein chhota text message doosri machine ko bhejta hai. Bhejne wala device <b>source</b> ya client hai. Receive karne wali machine <b>collector</b> ya syslog server hai. Syslog one-way hai: device bhejta hai aur jawab ka intezaar nahi karta. Na login hai na reply. Yahi simplicity ki wajah se har vendor ise support karta hai, aur isiliye aapko maan kar nahi balki sabit karke dekhna hota hai ki yeh chal raha hai.</p>
<dl class="terms">
<dt>Event</dt><dd>Jo kuch hua: interface down hua, user login hua, configuration save hui.</dd>
<dt>Message</dt><dd>Event ko describe karne wali ek line, jisme time, severity aur event type ka naam hota hai.</dd>
<dt>Buffer</dt><dd>Router ki RAM ka chhota hissa jo latest messages rakhta hai. Reload par saaf ho jaata hai.</dd>
<dt>Collector</dt><dd>Ek server jo UDP port 514 par sunta hai aur jo milta hai use store karta hai. Hamari company mein yeh NMS hai, 10.1.50.100.</dd>
</dl>

<div class="dia">`+e+`<p class="cap">Godavari Foods: teen routers ek collector ko events bhejte hain, Hyderabad mein.</p></div>

<h3>Local buffer kaafi kyun nahi hai</h3>
<p>Maan lo ILL-HYD-01 raat 02:10 par flap hua aur power cut ki wajah se router 02:15 par reload ho gaya. Engineer jab aata hai to buffer khaali hai. Saboot gayab. Central logging chaar problems ek saath solve karti hai: reload ke baad bhi logs bachte hain, saare devices ek jagah search hote hain, teen shehron ki incident story ek timeline par line up hoti hai, aur agar koi attacker router mein ghus jaye to jo logs pehle hi copy ho chuke hain woh aasani se mita nahi sakta.</p>

<h3>Pehli configuration: chaar lines</h3>
<p>Godavari Foods chahta hai ki R-HYD (hostname HYD-CORE-R1) NMS ko report kare. Yeh lab obs-syslog-1 ka chhota roop hai.</p>
<pre class="code">HYD-CORE-R1# configure terminal
HYD-CORE-R1(config)# <span class="c">! kahan bhejna hai</span>
HYD-CORE-R1(config)# logging host 10.1.50.100
HYD-CORE-R1(config)# <span class="c">! message kitna serious ho to box se bahar jaaye</span>
HYD-CORE-R1(config)# logging trap informational
HYD-CORE-R1(config)# <span class="c">! messages kis address se aayein</span>
HYD-CORE-R1(config)# logging source-interface Loopback0
HYD-CORE-R1(config)# <span class="c">! har message mein asli date aur time, milliseconds ke saath</span>
HYD-CORE-R1(config)# service timestamps log datetime msec
HYD-CORE-R1(config)# end</pre>
<ul>
<li><code>logging host</code> collector ka naam batata hai. Jab tak aap kuch aur na kaho, messages UDP port 514 par jaate hain.</li>
<li><code>logging trap informational</code> threshold set karta hai. Chapter 3 isse poora samjhata hai; abhi yaad rakho ki yeh sirf server ko jaane wale messages ko filter karta hai.</li>
<li><code>logging source-interface Loopback0</code> har message par loopback address 10.255.0.1 source ke roop mein lagata hai. Jab tak router ka koi bhi link chal raha hai, loopback down nahi hota, to collector ko device ka ek stable naam dikhta hai.</li>
<li><code>service timestamps log datetime msec</code> har message par date aur time milliseconds tak lagata hai. Iske bina router boot ke baad ka time use karta hai, jo doosre devices se match nahi ho sakta.</li>
</ul>

<h3>Check karna: show logging</h3>
<pre class="code">HYD-CORE-R1# show logging | include Trap|Logging to|Source</pre>
<pre class="out">    Trap logging: level <span class="hl">informational</span>, 41 message lines logged
        Logging to <span class="hl">10.1.50.100</span>  (udp port 514, audit disabled,
        Logging Source-Interface:       VRF Name:
        <span class="hl">Loopback0</span></pre>
<p>Left se right padho: trap level informational hai, destination 10.1.50.100 UDP 514 par hai, aur source Loopback0 hai. Host ke neeche "message lines logged" naam ka counter events hone par badhna chahiye. Agar router busy hai aur counter zero par atka hai, to router bhej hi nahi raha.</p>

<div class="eg"><p><b>Worked example.</b> Subah 09:00:00 par aap R-HYD ka interface Gi0/2 shut aur no shut karte ho. Isse do messages bante hain: link down hua, aur baad mein line protocol up hua. Upar ki chaar lines ke saath dono NMS par ek second ke andar aa jaate hain, usi clock ke saath jo har doosre device par hai. Host line ke bina woh sirf buffer mein rehte hain. Timestamp line ke bina un par 3d02h jaisa uptime hota hai, jo R-KCH se match nahi ho sakta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>logging host</code> configure karke kabhi test na karna, kyunki jab kuch nahi pahunchta to syslog koi error nahi deta. (2) Yeh bhoolna ki collector ko UDP 514 par sunna bhi chahiye aur uska apna firewall block na kare. (3) Physical interface ko source banana, to us port ke down hone par address badal jaata hai. (4) Yeh maanna ki buffer aur remote server mein same messages hote hain; unke thresholds alag hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Syslog default mein UDP port 514 use karta hai aur unreliable hai: na acknowledgement na retransmission. Agar question "guaranteed delivery" kehta hai to jawab TCP ya TLS transport hai, default syslog nahi.</p></div>

<div class="scn"><h4>Power cut aur koi saboot nahi</h4><p>Kochi branch mein power cut se R-KCH restart ho gaya. Agli subah Ravi Menon ko jaanna tha ki cut se pehle uplink flap hua tha ya nahi. Reload ke baad router ka buffer khaali tha. Kisi ne logging host configure nahi kiya tha, to kahin bhi copy nahi thi. Incident ke baad team ne har router par chaar lines jodi aur jaan-boojh kar message bhejkar test kiya. Teen hafte baad aisa hi cut aaya aur NMS par poora trail mila.</p><p><b>Seekh:</b> central logging configure karne ka sabse accha waqt pehle incident se pehle hai.</p></div>

<div class="iv"><p class="q">"Hum router logs ko central server par kyun bhejte hain, router ke apne logs kyun nahi padhte?"</p><p>Strong answer: local buffer chhota hai aur reload par chala jaata hai, to jab sabse zyada zaroorat hoti hai tab saboot gayab ho jaata hai. Central collector history rakhta hai, kai devices ko ek timeline par search aur correlate karne deta hai, aur device compromise ho to evidence bachata hai. Yeh bhi bolo ki syslog unreliable UDP hai, isliye test message se delivery verify karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog ek device (source) se collector ko UDP 514 par jaane wala one-way text message hai.</li>
<li>Router buffer chhota hai aur reload par chala jaata hai; collector history rakhta hai.</li>
<li>Core settings: logging host, logging trap level, logging source-interface, service timestamps.</li>
<li>show logging device par host, trap level aur source interface sabit karta hai.</li>
<li>Messages kho jaayein to syslog koi error nahi deta, isliye hamesha end to end test karo.</li>
</ul></div>
`}};export{t as default};