var e={id:`route-tracking`,h:{en:`Dual ISP with static route tracking: sla monitor and track`,hi:`Static route tracking ke saath dual ISP: sla monitor aur track`},body:{en:`
<p>Before a long drive you check that your driveway is clear. That tells you nothing about the flooded bridge ten kilometres down the road. A sensible driver listens to the traffic report for the <i>whole route</i> and switches to the ring road when the bridge is closed. A static default route is the driver who only checks the driveway: it stays in the routing table as long as its <b>interface</b> is up. <b>Route tracking</b> is the traffic report: it keeps testing a target far down the road and removes the route when that test fails.</p>

<h3>The problem</h3>
<p>NK-ASA (lab 2) has two providers: ISP1 on <code>outside</code> (next hop 203.0.113.1, flat-rate) and ISP2 on <code>backup</code> (198.51.100.1, metered). The only default route points to ISP1. If ISP1's router stays up but its upstream fails, the ASA's outside link is still up, the route stays in the table, and every packet goes into a black hole while ISP2 sits idle.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Dual ISP with a probe beyond ISP1">
<rect x="20" y="105" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="140" y="95" width="110" height="60" rx="10" fill="#fed7aa"/><text x="195" y="120" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="195" y="138" text-anchor="middle" class="svg-muted" font-size="12">inside 10.0.1.1</text>
<rect x="320" y="30" width="90" height="40" rx="8" fill="#bae6fd"/><text x="365" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="320" y="180" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="365" y="205" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="470" y="105" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="515" y="124" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">4.2.2.2</text>
<rect x="580" y="105" width="50" height="40" rx="8" fill="#bbf7d0"/><text x="605" y="130" text-anchor="middle" class="svg-ink" font-size="12">INET</text>
<line x1="100" y1="125" x2="140" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="110" x2="320" y2="55" stroke="#64748b" stroke-width="2"/><line x1="250" y1="140" x2="320" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="50" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><line x1="410" y1="200" x2="470" y2="135" stroke="#64748b" stroke-width="2"/><line x1="560" y1="125" x2="580" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="270" y="70" class="svg-muted" font-size="12">outside .2</text><text x="262" y="195" class="svg-muted" font-size="12">backup .2</text>
<text x="440" y="70" class="svg-accent" font-size="12">Gi0/1 upstream</text>
<path d="M 250 100 Q 420 0 505 105" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="420" y="22" class="svg-accent" font-size="12">probe every 5 s</text>
<text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="12">tracked default via 203.0.113.1 (AD 1), floating via 198.51.100.1 (AD 254)</text>
</svg><p class="cap">Lab 2: the probe tests a target beyond ISP1, so an upstream failure is detected.</p></div>

<h3>Three building blocks</h3>
<dl class="terms">
<dt>SLA monitor (the probe)</dt><dd>An operation that sends ICMP echo to a <b>target</b> out of a named <b>interface</b> at a set <b>frequency</b> (default 60 s) and waits up to a <b>timeout</b> (default 5000 ms, which must not exceed the frequency). It does nothing until it is <b>scheduled</b>.</dd>
<dt>Track object</dt><dd><code>track 1 rtr 1 reachability</code> follows the SLA result: Up when the latest operation returned OK, Down otherwise.</dd>
<dt>Tracked route plus floating static</dt><dd>The primary default route carries <code>track 1</code> and exists only while the track is Up. A second default route with a worse administrative distance (254) stays out of the table until the tracked one disappears.</dd>
</dl>

<h3>Configuration (lab 2)</h3>
<pre class="code">NK-ASA(config)# sla monitor 1
NK-ASA(config-sla-monitor)# type echo protocol ipIcmpEcho 4.2.2.2 interface outside
NK-ASA(config-sla-monitor-echo)# frequency 5
NK-ASA(config-sla-monitor-echo)# exit
NK-ASA(config)# sla monitor schedule 1 life forever start-time now
NK-ASA(config)# track 1 rtr 1 reachability
<span class="c">! replace the plain default route with a tracked one</span>
NK-ASA(config)# no route outside 0.0.0.0 0.0.0.0 203.0.113.1
NK-ASA(config)# route outside 0.0.0.0 0.0.0.0 203.0.113.1 1 track 1
<span class="c">! floating static via ISP2</span>
NK-ASA(config)# route backup 0.0.0.0 0.0.0.0 198.51.100.1 254</pre>
<p>NAT for both exits is already there in the lab (<code>nat (inside,outside) dynamic interface</code> and <code>nat (inside,backup) dynamic interface</code> in two network objects). Without the second rule, failover would route traffic to ISP2 with private source addresses.</p>

<h3>Verification in the healthy state</h3>
<pre class="out">NK-ASA# show sla monitor operational-state
Entry number: 1
Number of operations attempted: 24
Current seconds left in Life: Forever
Operational state of entry: Active
Connection loss occurred: FALSE
Timeout occurred: FALSE
Latest RTT (milliseconds): 2
<span class="hl">Latest operation return code: OK</span>

NK-ASA# show track 1
Track 1
  Response Time Reporter 1 reachability
<span class="hl">  Reachability is Up</span>
  1 change, last change 00:02:01
  Latest operation return code: OK
  Latest RTT (millisecs) 2
  Tracked by:
    STATIC-IP-ROUTING 0

NK-ASA# show route | include 0.0.0.0
<span class="hl">Gateway of last resort is 203.0.113.1 to network 0.0.0.0</span>
S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</pre>

<h3>Failover and fail-back (lab tasks 3 to 5)</h3>
<p>Shut ISP1's Gi0/1 (its upstream). The ASA's outside link stays up, but the probe to 4.2.2.2 times out. Within a probe or two the track goes Down, the tracked route is removed and the floating route is installed:</p>
<pre class="out">%ASA-6-622001: Removing tracked route 0.0.0.0 0.0.0.0 203.0.113.1, distance 1, table default, on interface outside

NK-ASA# show route | include 0.0.0.0
<span class="hl">Gateway of last resort is 198.51.100.1 to network 0.0.0.0</span>
S*       0.0.0.0 0.0.0.0 [254/0] via 198.51.100.1, backup</pre>
<p>PC1 can still ping 8.8.8.8, now translated to 198.51.100.2. On the ASA the probe keeps leaving through <code>outside</code>, as named in the SLA, so it keeps testing ISP1. When ISP1 is repaired the probe succeeds, the track goes Up, syslog shows <i>622001: Adding tracked route ...</i>, and the default route <b>fails back</b> to 203.0.113.1 by itself. <code>show track 1</code> now shows at least two changes.</p>
<p>Existing connections keep the route they were built on. To move long-lived sessions to the better path automatically, set <code>timeout floating-conn 0:00:30</code>; otherwise they stay until they close or you clear them.</p>

<h3>Choosing the target</h3>
<ul>
<li>Not the ISP's own gateway (203.0.113.1): it only proves the first cable works.</li>
<li>Something <b>beyond</b> the provider that is reliable and answers ICMP: a provider core address, or a well-known resolver.</li>
<li>Consider two SLAs to two targets if one target going down must not trigger a failover.</li>
</ul>

<h3>The same on Threat Defense</h3>
<p>In the Management Center create an <b>SLA Monitor</b> object (Objects, Object Management, SLA Monitor) with the monitored address, the zone or interface of the outside interface, frequency and timeout. Then, under the device's Routing, Static Route, add the default route via 203.0.113.1 with metric 1 and select that SLA monitor under <b>Route Tracking</b>; add the backup default route with metric 254. Deploy, then verify with <code>show route</code> and <code>show track</code> on the device CLI.</p>

<div class="eg"><p><b>Worked example.</b> Frequency 5 s and timeout 5000 ms. ISP1's upstream fails at 10:00:00. The next probe leaves at about 10:00:03 and times out at 10:00:08; the track goes Down and the route is swapped at roughly 10:00:08. With the default frequency of 60 s the same outage could go unnoticed for more than a minute.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>sla monitor schedule</code>. An unscheduled SLA never runs, the track stays Down, the tracked route is never installed, and all traffic quietly uses the metered backup.</p></div>

<div class="exam"><p><b>Exam trap.</b> A scheduled SLA cannot be edited: <i>Entry already running and cannot be modified (only can delete (no) and start over)</i>. You must <code>no sla monitor 1</code>, recreate it and schedule it again. Also, distance 255 means "never install"; the floating route uses 254 or any value above 1 but below 255.</p></div>

<div class="scn"><h4>Forty minutes offline with a paid backup</h4><p>A company paid for a second ISP, yet when ISP1 lost its upstream the office was offline for 40 minutes. The configuration showed an SLA probing 203.0.113.1, ISP1's own gateway, which kept answering. After the target was changed to an address beyond ISP1, the next upstream outage caused an automatic switch to ISP2 within ten seconds.</p><p><b>Lesson:</b> the target decides what you detect; probe beyond the provider.</p></div>

<div class="iv"><p class="q">"How do you make an ASA fail over to a second ISP when the first ISP's upstream fails?"</p><p>Create an SLA monitor that pings a reliable target beyond ISP1 out of the outside interface, schedule it, create <code>track 1 rtr 1 reachability</code>, attach <code>track 1</code> to the primary default route and add a floating default route via ISP2 with a higher distance. Mention NAT for both exits, verification with <code>show track</code>, <code>show sla monitor operational-state</code>, <code>show route</code> and syslog 622001, automatic fail-back, and <code>timeout floating-conn</code> for existing sessions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A static route stays while its interface is up; tracking removes it when a remote target stops answering.</li>
<li>Recipe: <code>sla monitor</code>, <code>sla monitor schedule</code>, <code>track N rtr N reachability</code>, <code>route ... track N</code>, floating route with distance 254.</li>
<li>Probe a reliable target beyond the ISP; frequency controls detection time.</li>
<li>NAT must exist for both exits; fail-back is automatic when the probe recovers.</li>
<li>Threat Defense uses an SLA Monitor object plus Route Tracking on the static route.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap check karte ho ki driveway khaali hai. Isse das kilometre aage doobe hue pul ke baare mein kuch pata nahi chalta. Samajhdar driver <i>poore route</i> ki traffic report sunta hai aur pul band hone par ring road le leta hai. Static default route woh driver hai jo sirf driveway check karta hai: woh tab tak routing table mein rehta hai jab tak uska <b>interface</b> up hai. <b>Route tracking</b> traffic report hai: yeh sadak par door ke ek target ko test karti rehti hai aur test fail hone par route hata deti hai.</p>

<h3>Problem</h3>
<p>NK-ASA (lab 2) ke do providers hain: <code>outside</code> par ISP1 (next hop 203.0.113.1, flat-rate) aur <code>backup</code> par ISP2 (198.51.100.1, metered). Akela default route ISP1 ki taraf hai. Agar ISP1 ka router up rahe lekin uska upstream fail ho jaaye, ASA ka outside link ab bhi up hai, route table mein rehta hai, aur har packet black hole mein jaata hai jabki ISP2 khaali baitha hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="ISP1 ke aage probe ke saath dual ISP">
<rect x="20" y="105" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="140" y="95" width="110" height="60" rx="10" fill="#fed7aa"/><text x="195" y="120" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="195" y="138" text-anchor="middle" class="svg-muted" font-size="12">inside 10.0.1.1</text>
<rect x="320" y="30" width="90" height="40" rx="8" fill="#bae6fd"/><text x="365" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="320" y="180" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="365" y="205" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="470" y="105" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="515" y="124" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">4.2.2.2</text>
<rect x="580" y="105" width="50" height="40" rx="8" fill="#bbf7d0"/><text x="605" y="130" text-anchor="middle" class="svg-ink" font-size="12">INET</text>
<line x1="100" y1="125" x2="140" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="110" x2="320" y2="55" stroke="#64748b" stroke-width="2"/><line x1="250" y1="140" x2="320" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="50" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><line x1="410" y1="200" x2="470" y2="135" stroke="#64748b" stroke-width="2"/><line x1="560" y1="125" x2="580" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="270" y="70" class="svg-muted" font-size="12">outside .2</text><text x="262" y="195" class="svg-muted" font-size="12">backup .2</text>
<text x="440" y="70" class="svg-accent" font-size="12">Gi0/1 upstream</text>
<path d="M 250 100 Q 420 0 505 105" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="420" y="22" class="svg-accent" font-size="12">har 5 s probe</text>
<text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="12">tracked default 203.0.113.1 se (AD 1), floating 198.51.100.1 se (AD 254)</text>
</svg><p class="cap">Lab 2: probe ISP1 ke aage ka target test karta hai, isliye upstream failure pakda jaata hai.</p></div>

<h3>Teen building blocks</h3>
<dl class="terms">
<dt>SLA monitor (probe)</dt><dd>Ek operation jo ek naamit <b>interface</b> se ek <b>target</b> ko set <b>frequency</b> (default 60 s) par ICMP echo bhejta hai aur ek <b>timeout</b> (default 5000 ms, jo frequency se zyada nahi ho sakta) tak intezaar karta hai. Jab tak <b>schedule</b> na ho, yeh kuch nahi karta.</dd>
<dt>Track object</dt><dd><code>track 1 rtr 1 reachability</code> SLA result follow karta hai: latest operation OK lautaye to Up, warna Down.</dd>
<dt>Tracked route plus floating static</dt><dd>Primary default route <code>track 1</code> le jaata hai aur sirf tab tak rehta hai jab tak track Up hai. Kharab administrative distance (254) wala doosra default route tracked route gayab hone tak table se bahar rehta hai.</dd>
</dl>

<h3>Configuration (lab 2)</h3>
<pre class="code">NK-ASA(config)# sla monitor 1
NK-ASA(config-sla-monitor)# type echo protocol ipIcmpEcho 4.2.2.2 interface outside
NK-ASA(config-sla-monitor-echo)# frequency 5
NK-ASA(config-sla-monitor-echo)# exit
NK-ASA(config)# sla monitor schedule 1 life forever start-time now
NK-ASA(config)# track 1 rtr 1 reachability
<span class="c">! saade default route ko tracked route se badlo</span>
NK-ASA(config)# no route outside 0.0.0.0 0.0.0.0 203.0.113.1
NK-ASA(config)# route outside 0.0.0.0 0.0.0.0 203.0.113.1 1 track 1
<span class="c">! ISP2 ke through floating static</span>
NK-ASA(config)# route backup 0.0.0.0 0.0.0.0 198.51.100.1 254</pre>
<p>Lab mein dono exits ka NAT pehle se hai (do network objects mein <code>nat (inside,outside) dynamic interface</code> aur <code>nat (inside,backup) dynamic interface</code>). Doosre rule ke bina failover traffic ko private source addresses ke saath ISP2 par route karta.</p>

<h3>Healthy state mein verification</h3>
<pre class="out">NK-ASA# show sla monitor operational-state
Entry number: 1
Number of operations attempted: 24
Current seconds left in Life: Forever
Operational state of entry: Active
Connection loss occurred: FALSE
Timeout occurred: FALSE
Latest RTT (milliseconds): 2
<span class="hl">Latest operation return code: OK</span>

NK-ASA# show track 1
Track 1
  Response Time Reporter 1 reachability
<span class="hl">  Reachability is Up</span>
  1 change, last change 00:02:01
  Latest operation return code: OK
  Latest RTT (millisecs) 2
  Tracked by:
    STATIC-IP-ROUTING 0

NK-ASA# show route | include 0.0.0.0
<span class="hl">Gateway of last resort is 203.0.113.1 to network 0.0.0.0</span>
S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</pre>

<h3>Failover aur fail-back (lab tasks 3 se 5)</h3>
<p>ISP1 ka Gi0/1 (uska upstream) shut karo. ASA ka outside link up rehta hai, lekin 4.2.2.2 ka probe timeout hota hai. Ek-do probes mein track Down hota hai, tracked route hatta hai aur floating route install hota hai:</p>
<pre class="out">%ASA-6-622001: Removing tracked route 0.0.0.0 0.0.0.0 203.0.113.1, distance 1, table default, on interface outside

NK-ASA# show route | include 0.0.0.0
<span class="hl">Gateway of last resort is 198.51.100.1 to network 0.0.0.0</span>
S*       0.0.0.0 0.0.0.0 [254/0] via 198.51.100.1, backup</pre>
<p>PC1 ab bhi 8.8.8.8 ping kar sakta hai, ab 198.51.100.2 mein translate hokar. ASA par probe SLA mein naamit <code>outside</code> se hi nikalta rehta hai, isliye woh ISP1 ko test karta rehta hai. ISP1 theek hone par probe safal hota hai, track Up hota hai, syslog <i>622001: Adding tracked route ...</i> dikhata hai, aur default route apne aap 203.0.113.1 par <b>fail back</b> hota hai. <code>show track 1</code> ab kam se kam do changes dikhata hai.</p>
<p>Existing connections usi route par rehte hain jis par bane the. Lambe sessions ko automatically behtar path par le jaane ke liye <code>timeout floating-conn 0:00:30</code> set karo; warna woh band hone ya aapke clear karne tak rehte hain.</p>

<h3>Target chunna</h3>
<ul>
<li>ISP ka apna gateway (203.0.113.1) nahi: woh sirf pehli cable saabit karta hai.</li>
<li>Provider ke <b>aage</b> kuch jo reliable ho aur ICMP ka jawab de: provider core address, ya jaana-maana resolver.</li>
<li>Agar ek target down hone par failover nahi hona chahiye, to do targets ke liye do SLAs socho.</li>
</ul>

<h3>Threat Defense par yahi</h3>
<p>Management Center mein monitored address, outside interface ka zone ya interface, frequency aur timeout ke saath ek <b>SLA Monitor</b> object banao (Objects, Object Management, SLA Monitor). Phir device ke Routing, Static Route mein 203.0.113.1 ke through metric 1 ka default route jodo aur <b>Route Tracking</b> mein woh SLA monitor chuno; metric 254 ka backup default route jodo. Deploy karo, phir device CLI par <code>show route</code> aur <code>show track</code> se verify karo.</p>

<div class="eg"><p><b>Worked example.</b> Frequency 5 s aur timeout 5000 ms. ISP1 ka upstream 10:00:00 par fail hota hai. Agla probe lagbhag 10:00:03 par nikalta hai aur 10:00:08 par timeout hota hai; track Down hota hai aur route lagbhag 10:00:08 par swap hota hai. Default 60 s frequency ke saath yahi outage ek minute se zyada bina pakde reh sakta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>sla monitor schedule</code> bhoolna. Unscheduled SLA kabhi nahi chalta, track Down rehta hai, tracked route kabhi install nahi hota, aur saara traffic chupchaap metered backup use karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Scheduled SLA edit nahi hota: <i>Entry already running and cannot be modified (only can delete (no) and start over)</i>. Aapko <code>no sla monitor 1</code> karna, dobara banana aur phir schedule karna padta hai. Aur distance 255 ka matlab "kabhi install nahi"; floating route 254 ya 1 se upar aur 255 se neeche koi bhi value use karta hai.</p></div>

<div class="scn"><h4>Paid backup ke saath chaalees minute offline</h4><p>Ek company ne doosre ISP ke paise diye, phir bhi jab ISP1 ka upstream gaya to office 40 minute offline raha. Configuration mein SLA 203.0.113.1, ISP1 ka apna gateway, probe kar raha tha, jo jawab deta raha. Target ko ISP1 ke aage ke address par badalne ke baad agle upstream outage mein das second ke andar ISP2 par automatic switch hua.</p><p><b>Seekh:</b> target decide karta hai ki aap kya pakadte ho; provider ke aage probe karo.</p></div>

<div class="iv"><p class="q">"Pehle ISP ka upstream fail hone par ASA ko doosre ISP par kaise failover karwaoge?"</p><p>Ek SLA monitor banao jo outside interface se ISP1 ke aage ke reliable target ko ping kare, use schedule karo, <code>track 1 rtr 1 reachability</code> banao, primary default route par <code>track 1</code> lagao aur ISP2 ke through zyada distance wala floating default route jodo. Dono exits ke liye NAT, <code>show track</code>, <code>show sla monitor operational-state</code>, <code>show route</code> aur syslog 622001 se verification, automatic fail-back, aur existing sessions ke liye <code>timeout floating-conn</code> batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static route tab tak rehta hai jab tak uska interface up hai; tracking remote target jawab dena band kare to use hata deti hai.</li>
<li>Recipe: <code>sla monitor</code>, <code>sla monitor schedule</code>, <code>track N rtr N reachability</code>, <code>route ... track N</code>, distance 254 wala floating route.</li>
<li>ISP ke aage reliable target probe karo; frequency detection time control karti hai.</li>
<li>Dono exits ke liye NAT hona chahiye; probe theek hone par fail-back automatic hai.</li>
<li>Threat Defense SLA Monitor object plus static route par Route Tracking use karta hai.</li>
</ul></div>
`}};export{e as default};