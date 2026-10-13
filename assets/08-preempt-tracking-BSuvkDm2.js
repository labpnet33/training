var e={id:`preempt-tracking`,h:{en:`Priority, preempt delay and object tracking with interfaces and IP SLA`,hi:`Priority, preempt delay aur interfaces aur IP SLA ke saath object tracking`},body:{en:`
<p>A shop has two cashiers. The senior cashier sits at the main counter. If she goes to the stockroom, the junior cashier takes over. But what if the main counter's card machine loses its bank connection while the senior cashier is still sitting there, smiling at customers? Customers keep queuing at a counter that cannot take payments. Someone has to notice the <b>card machine</b>, not just the cashier. In HSRP the cashier is the router's LAN interface, and the card machine is the uplink or ISP. <b>Object tracking</b> is how HSRP notices the card machine.</p>

<h3>Preempt: who takes the role back, and when</h3>
<p>Without <code>preempt</code>, HSRP never takes the Active role away from a working router, even if a higher-priority router appears. That is stable, but it breaks tracking: if R1's priority drops to 90 and R2 (100) has no preempt, R2 stays Standby forever. Rule: in a tracking design, <b>both</b> routers need preempt. R2 needs it to take over when R1's priority drops; R1 needs it to take the role back when its priority recovers.</p>
<pre class="code">interface GigabitEthernet0/0
 standby 1 preempt delay minimum 60 reload 180</pre>
<ul>
<li><code>minimum 60</code>: wait 60 seconds before preempting, so routing protocols and ARP tables converge first.</li>
<li><code>reload 180</code>: after a reload, wait 180 seconds instead. A freshly booted router may have its interfaces up long before BGP or OSPF is ready.</li>
</ul>
<p>Without a delay, a rebooted R1 can grab the VIP with an empty routing table and blackhole traffic for the time it takes BGP to converge.</p>

<h3>Tracking objects</h3>
<p>A <b>track object</b> is a numbered object with state Up or Down that other features can follow. Common types:</p>
<table class="cmp"><tr><th>Command</th><th>Goes Down when</th></tr>
<tr><td><code>track 1 interface Gi0/1 line-protocol</code></td><td>The interface's line protocol is down.</td></tr>
<tr><td><code>track 2 interface Gi0/1 ip routing</code></td><td>IP routing is disabled or the interface loses its address, even if the line protocol is up.</td></tr>
<tr><td><code>track 3 ip route 0.0.0.0 0.0.0.0 reachability</code></td><td>The route disappears from the routing table.</td></tr>
<tr><td><code>track 10 ip sla 1 reachability</code></td><td>The IP SLA probe fails (timeout); ignores threshold violations.</td></tr>
<tr><td><code>track 11 ip sla 1 state</code></td><td>The probe fails or exceeds its threshold (for example RTT too high).</td></tr>
<tr><td><code>track 20 list boolean or</code></td><td>Combines objects with AND/OR logic.</td></tr></table>
<p>Add <code>delay down 5 up 30</code> inside a track to damp flapping: the object must stay down 5 s before it reports Down, and up 30 s before it reports Up.</p>
<p>Interface tracking only sees the local cable. In lab 1 the failure is <i>beyond</i> ISP-A: R1's Gi0/1 stays up. Only an <b>IP SLA</b> probe to a target past the ISP (203.0.113.53 on INET) detects it. IP SLA is covered in depth in the Assurance module; here you need just the probe.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="IP SLA tracking beyond ISP-A">
<rect x="20" y="150" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="13">R1 prio 110</text><text x="80" y="186" text-anchor="middle" class="svg-muted" font-size="12">track 10</text>
<rect x="190" y="150" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="245" y="177" text-anchor="middle" class="svg-ink" font-size="13">ISPA</text>
<rect x="360" y="150" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="415" y="177" text-anchor="middle" class="svg-ink" font-size="13">INET</text>
<rect x="510" y="150" width="120" height="44" rx="8" fill="#fde68a"/><text x="570" y="170" text-anchor="middle" class="svg-ink" font-size="13">Lo0</text><text x="570" y="186" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.53</text>
<line x1="140" y1="172" x2="190" y2="172" stroke="#64748b" stroke-width="2"/><line x1="300" y1="172" x2="360" y2="172" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="470" y1="172" x2="510" y2="172" stroke="#64748b" stroke-width="2"/>
<text x="330" y="145" text-anchor="middle" class="svg-accent" font-size="12">upstream cut here</text>
<path d="M80 150 C 200 60, 450 60, 570 150" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 4"/>
<text x="325" y="72" text-anchor="middle" class="svg-muted" font-size="12">IP SLA 1 icmp-echo every 5 s</text>
<text x="160" y="222" class="svg-ink" font-size="12">Gi0/1 stays up, interface tracking sees nothing; the probe fails</text>
</svg><p class="cap">Lab 1: the probe tests the whole path through ISP-A, so it catches the upstream failure that interface tracking would miss.</p></div>

<h3>Lab 1, steps 2 to 6</h3>
<pre class="code"><span class="c">! R1: probe beyond ISP-A and track it</span>
ip sla 1
 icmp-echo 203.0.113.53 source-interface GigabitEthernet0/1
 frequency 5
ip sla schedule 1 life forever start-time now
track 10 ip sla 1 reachability
!
interface GigabitEthernet0/0
 standby 1 track 10 decrement 20</pre>
<p>Arithmetic first: 110 - 20 = 90, which is below R2's 100, and R2 has preempt, so R2 takes over. A decrement of 5 would leave R1 at 105, still Active, and nothing would happen (the most common tracking bug). If you omit the value, the default decrement is 10, which would give 100 and tie with R2; the outcome then rests on tie-breaking details instead of a clear design, which is fragile. Always calculate.</p>
<pre class="out">R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    110 P Active  local           192.168.20.3    192.168.20.1

<span class="c">! ISPA Gi0/1 is shut down</span>
R1#
<span class="hl">%TRACK-6-STATE: 10 ip sla 1 reachability Up -> Down</span>
R2#
<span class="hl">%HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 1 state Standby -> Active</span>

R1# show standby | include Priority|Track
<span class="hl">  Priority 90 (configured 110)</span>
    Track object 10 state Down decrement 20</pre>
<p>R2 takes over through a <b>coup</b>: when it hears R1's hello with priority 90 while it has 100 and preempt, it sends a coup message and becomes Active; R1 becomes Standby. PC1 keeps using 192.168.20.1 and the same MAC, so it does not even notice. When ISP-A is restored, the probe succeeds, track 10 returns Up, R1 goes back to 110 and preempts: <code>Priority 110 (configured 110)</code>, <code>Track object 10 state Up</code>.</p>

<div class="eg"><p><b>Worked example.</b> A design tracks two uplinks on R1: <code>standby 1 track 1 decrement 15</code> and <code>standby 1 track 2 decrement 15</code>, R1 at 120, R2 at 100. One uplink fails: 105, R1 stays Active (it still has one uplink). Both fail: 90, R2 takes over. Decrements add up, which lets you express "fail over only when both are lost".</p></div>

<div class="warn"><p><b>Common mistake.</b> Probing a target that is reachable through either ISP. If R1's probe to 203.0.113.53 can fall back to a default route through the LAN and R2, it keeps succeeding after ISP-A fails. Source the probe from the ISP-facing interface and, if needed, add a host route for the target via ISP-A only.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam questions give priorities, decrements and preempt settings and ask who is Active. Check three things: the new priority, whether it is strictly lower than the peer's, and whether the peer has preempt. No preempt on the peer means no failover, whatever the numbers.</p></div>

<div class="scn"><h4>The hour-long blackhole</h4><p>This is the Hyderabad story behind lab 1. ISP-A lost its upstream at 09:10. R1's cable to ISP-A stayed up, so R1 remained Active with priority 110 and sent every user's traffic into a dead ISP. R2 and ISP-B were idle. Users rebooted PCs; the help desk escalated at 10:05. The fix was IP SLA 1 to a target beyond ISP-A, track 10 on it, and <code>standby 1 track 10 decrement 20</code>, plus verifying preempt on R2. A test failover now completes in about 15 seconds (three missed 5-second probes plus the HSRP coup).</p><p><b>Lesson:</b> track what the users actually need, the path to the internet, not just the local interface.</p></div>

<div class="iv"><p class="q">"Why would you use IP SLA tracking instead of interface tracking with HSRP?"</p><p>Interface tracking sees only local link failures. Most real outages happen beyond the first link: the ISP's upstream, a provider router, a routing failure. IP SLA sends real probes through the path and detects all of them. Then show the mechanics: <code>ip sla</code>, <code>track N ip sla N reachability</code>, <code>standby X track N decrement D</code> with D large enough to drop below the peer, and preempt on both routers. Mention preempt delay and probe sourcing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tracking designs need preempt on both routers; preempt delay minimum and reload avoid premature takeovers.</li>
<li>Track objects follow line protocol, IP routing, routes, IP SLA reachability or state, or boolean lists.</li>
<li>The decrement must push the priority strictly below the peer's; the default decrement is 10.</li>
<li>IP SLA probes detect failures beyond the local interface; source them via the tracked path.</li>
<li>Verify with show standby: Priority X (configured Y) and Track object state.</li>
</ul></div>
`,hi:`
<p>Ek dukaan mein do cashiers hain. Senior cashier main counter par baithti hai. Agar woh stockroom jaaye, to junior cashier kaam sambhaalta hai. Lekin kya ho agar main counter ki card machine ka bank connection chala jaaye jabki senior cashier abhi bhi wahan baithi customers ko muskura rahi ho? Customers aise counter par line lagaate rehte hain jo payment le hi nahi sakta. Kisi ko <b>card machine</b> par dhyaan dena hoga, sirf cashier par nahi. HSRP mein cashier router ka LAN interface hai, aur card machine uplink ya ISP. <b>Object tracking</b> woh tareeka hai jisse HSRP card machine ko notice karta hai.</p>

<h3>Preempt: role wapas kaun leta hai, aur kab</h3>
<p><code>preempt</code> ke bina HSRP kabhi bhi chalte router se Active role nahi chheenta, chahe zyada priority wala router aa jaaye. Yeh stable hai, lekin tracking tod deta hai: agar R1 ki priority 90 par gire aur R2 (100) par preempt nahi hai, to R2 hamesha Standby rehta hai. Rule: tracking design mein <b>dono</b> routers ko preempt chahiye. R2 ko R1 ki priority girne par kaam lene ke liye; R1 ko priority wapas aane par role wapas lene ke liye.</p>
<pre class="code">interface GigabitEthernet0/0
 standby 1 preempt delay minimum 60 reload 180</pre>
<ul>
<li><code>minimum 60</code>: preempt karne se pehle 60 second ruko, taaki routing protocols aur ARP tables pehle converge ho jaayein.</li>
<li><code>reload 180</code>: reload ke baad iski jagah 180 second ruko. Naya boot hua router ke interfaces BGP ya OSPF tayyar hone se bahut pehle up ho sakte hain.</li>
</ul>
<p>Delay ke bina reboot hua R1 khaali routing table ke saath VIP pakad sakta hai aur utni der traffic blackhole kar sakta hai jitna BGP ko converge hone mein lage.</p>

<h3>Tracking objects</h3>
<p><b>Track object</b> ek numbered object hai jiski state Up ya Down hoti hai jise doosre features follow kar sakte hain. Common types:</p>
<table class="cmp"><tr><th>Command</th><th>Down kab hota hai</th></tr>
<tr><td><code>track 1 interface Gi0/1 line-protocol</code></td><td>Interface ka line protocol down ho.</td></tr>
<tr><td><code>track 2 interface Gi0/1 ip routing</code></td><td>IP routing disable ho ya interface apna address kho de, chahe line protocol up ho.</td></tr>
<tr><td><code>track 3 ip route 0.0.0.0 0.0.0.0 reachability</code></td><td>Route routing table se gayab ho jaaye.</td></tr>
<tr><td><code>track 10 ip sla 1 reachability</code></td><td>IP SLA probe fail ho (timeout); threshold violations ignore karta hai.</td></tr>
<tr><td><code>track 11 ip sla 1 state</code></td><td>Probe fail ho ya threshold paar kare (jaise RTT bahut zyada).</td></tr>
<tr><td><code>track 20 list boolean or</code></td><td>Objects ko AND/OR logic se jodta hai.</td></tr></table>
<p>Flapping damp karne ke liye track ke andar <code>delay down 5 up 30</code> jodo: object ko Down report karne se pehle 5 s down rehna hoga, aur Up report karne se pehle 30 s up.</p>
<p>Interface tracking sirf local cable dekhta hai. Lab 1 mein failure ISP-A ke <i>aage</i> hai: R1 ka Gi0/1 up rehta hai. Sirf ISP ke paar ke target (INET par 203.0.113.53) tak <b>IP SLA</b> probe ise detect karta hai. IP SLA Assurance module mein gehraai se cover hai; yahan aapko sirf probe chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="ISP-A ke aage IP SLA tracking">
<rect x="20" y="150" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="13">R1 prio 110</text><text x="80" y="186" text-anchor="middle" class="svg-muted" font-size="12">track 10</text>
<rect x="190" y="150" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="245" y="177" text-anchor="middle" class="svg-ink" font-size="13">ISPA</text>
<rect x="360" y="150" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="415" y="177" text-anchor="middle" class="svg-ink" font-size="13">INET</text>
<rect x="510" y="150" width="120" height="44" rx="8" fill="#fde68a"/><text x="570" y="170" text-anchor="middle" class="svg-ink" font-size="13">Lo0</text><text x="570" y="186" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.53</text>
<line x1="140" y1="172" x2="190" y2="172" stroke="#64748b" stroke-width="2"/><line x1="300" y1="172" x2="360" y2="172" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="470" y1="172" x2="510" y2="172" stroke="#64748b" stroke-width="2"/>
<text x="330" y="145" text-anchor="middle" class="svg-accent" font-size="12">upstream yahan kata</text>
<path d="M80 150 C 200 60, 450 60, 570 150" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 4"/>
<text x="325" y="72" text-anchor="middle" class="svg-muted" font-size="12">IP SLA 1 icmp-echo har 5 s</text>
<text x="160" y="222" class="svg-ink" font-size="12">Gi0/1 up rehta hai, interface tracking kuch nahi dekhta; probe fail</text>
</svg><p class="cap">Lab 1: probe ISP-A ke through poora path test karta hai, to woh upstream failure pakadta hai jo interface tracking miss kar deta.</p></div>

<h3>Lab 1, steps 2 se 6</h3>
<pre class="code"><span class="c">! R1: ISP-A ke aage probe karo aur use track karo</span>
ip sla 1
 icmp-echo 203.0.113.53 source-interface GigabitEthernet0/1
 frequency 5
ip sla schedule 1 life forever start-time now
track 10 ip sla 1 reachability
!
interface GigabitEthernet0/0
 standby 1 track 10 decrement 20</pre>
<p>Pehle hisaab: 110 - 20 = 90, jo R2 ke 100 se neeche hai, aur R2 par preempt hai, to R2 kaam le leta hai. Decrement 5 R1 ko 105 par chhodta, abhi bhi Active, aur kuch nahi hota (sabse common tracking bug). Value chhod do to default decrement 10 hai, jo 100 deta aur R2 se tie karta; tab nateeja saaf design ki jagah tie-breaking details par tika hota hai, jo nazuk hai. Hamesha hisaab lagao.</p>
<pre class="out">R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    110 P Active  local           192.168.20.3    192.168.20.1

<span class="c">! ISPA Gi0/1 shut kiya gaya</span>
R1#
<span class="hl">%TRACK-6-STATE: 10 ip sla 1 reachability Up -> Down</span>
R2#
<span class="hl">%HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 1 state Standby -> Active</span>

R1# show standby | include Priority|Track
<span class="hl">  Priority 90 (configured 110)</span>
    Track object 10 state Down decrement 20</pre>
<p>R2 <b>coup</b> se kaam leta hai: jab woh R1 ka priority 90 wala hello sunta hai jabki uske paas 100 aur preempt hai, to woh coup message bhejkar Active ban jaata hai; R1 Standby banta hai. PC1 192.168.20.1 aur same MAC use karta rehta hai, to use pata bhi nahi chalta. ISP-A wapas aane par probe succeed hota hai, track 10 Up hota hai, R1 wapas 110 par jaata hai aur preempt karta hai: <code>Priority 110 (configured 110)</code>, <code>Track object 10 state Up</code>.</p>

<div class="eg"><p><b>Worked example.</b> Ek design R1 par do uplinks track karta hai: <code>standby 1 track 1 decrement 15</code> aur <code>standby 1 track 2 decrement 15</code>, R1 120 par, R2 100 par. Ek uplink fail: 105, R1 Active rehta hai (uske paas abhi ek uplink hai). Dono fail: 90, R2 kaam le leta hai. Decrements jud-te hain, jisse aap "failover sirf tab jab dono chale jaayein" express kar sakte ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Aisa target probe karna jo kisi bhi ISP se reachable ho. Agar R1 ka 203.0.113.53 wala probe LAN aur R2 ke through default route par fall back kar sake, to ISP-A fail hone ke baad bhi woh succeed karta rehta hai. Probe ko ISP-facing interface se source karo aur zaroorat ho to target ke liye sirf ISP-A ke through host route jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam questions priorities, decrements aur preempt settings dekar poochte hain ki Active kaun hai. Teen cheezein check karo: nayi priority, kya woh peer ki priority se strictly kam hai, aur kya peer par preempt hai. Peer par preempt nahi matlab koi failover nahi, numbers chahe jo hon.</p></div>

<div class="scn"><h4>Ghante bhar ka blackhole</h4><p>Yeh lab 1 ke peeche ki Hyderabad story hai. ISP-A ka upstream 09:10 par gaya. R1 ki ISP-A wali cable up rahi, to R1 priority 110 ke saath Active raha aur har user ka traffic mare hue ISP mein bhejta raha. R2 aur ISP-B khaali baithe the. Users ne PCs reboot kiye; help desk ne 10:05 par escalate kiya. Fix tha ISP-A ke aage ke target tak IP SLA 1, us par track 10, aur <code>standby 1 track 10 decrement 20</code>, plus R2 par preempt verify karna. Test failover ab lagbhag 15 second mein poora hota hai (teen miss hue 5-second probes plus HSRP coup).</p><p><b>Seekh:</b> woh track karo jo users ko asal mein chahiye, internet tak ka path, sirf local interface nahi.</p></div>

<div class="iv"><p class="q">"HSRP ke saath interface tracking ki jagah IP SLA tracking kyun use karoge?"</p><p>Interface tracking sirf local link failures dekhta hai. Zyada tar real outages pehle link ke aage hote hain: ISP ka upstream, provider router, routing failure. IP SLA path ke through asli probes bhejta hai aur sab detect karta hai. Phir mechanics dikhao: <code>ip sla</code>, <code>track N ip sla N reachability</code>, <code>standby X track N decrement D</code> jahan D itna bada ho ki peer se neeche gire, aur dono routers par preempt. Preempt delay aur probe sourcing ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tracking designs ko dono routers par preempt chahiye; preempt delay minimum aur reload jaldbaazi ke takeovers se bachaate hain.</li>
<li>Track objects line protocol, IP routing, routes, IP SLA reachability ya state, ya boolean lists follow karte hain.</li>
<li>Decrement priority ko peer se strictly neeche le jaaye; default decrement 10 hai.</li>
<li>IP SLA probes local interface ke aage ke failures detect karte hain; unhe tracked path se source karo.</li>
<li>show standby se verify karo: Priority X (configured Y) aur Track object state.</li>
</ul></div>
`}};export{e as default};