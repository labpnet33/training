var e={id:`ip-sla-tracking`,h:{en:`IP SLA and object tracking: jitter, delay, connectivity and failover`,hi:`IP SLA aur object tracking: jitter, delay, connectivity aur failover`},body:{en:`
<p>A static route is like a delivery driver who only checks that the first road out of the warehouse is open. If a bridge further down has collapsed, he keeps driving into the river. <b>IP SLA</b> sends a scout down the whole route every few seconds and reports "arrived" or "did not arrive", plus how long it took. A <b>track object</b> turns the scout's report into a simple Up or Down, and the static route, HSRP, PBR or an EEM script follows that decision.</p>

<h3>Operation types you must know</h3>
<table class="cmp"><tr><th>Operation</th><th>Measures</th><th>Needs responder?</th></tr>
<tr><td><code>icmp-echo</code></td><td>Connectivity and round-trip time (RTT)</td><td>No, any host that answers ping</td></tr>
<tr><td><code>udp-echo</code></td><td>RTT over UDP</td><td>Recommended</td></tr>
<tr><td><code>udp-jitter</code></td><td>RTT, one-way delay, jitter, packet loss, out-of-sequence, MOS for voice codecs</td><td><b>Yes</b>, <code>ip sla responder</code> on the far router</td></tr>
<tr><td><code>tcp-connect</code></td><td>Time to open a TCP session to a port</td><td>No for well-known ports</td></tr>
<tr><td><code>dns</code>, <code>path-echo</code></td><td>Name resolution time, hop-by-hop RTT</td><td>No</td></tr></table>

<h3>Connectivity probe and track (lab 1)</h3>
<pre class="code">ip sla 10
 icmp-echo 10.10.10.1 source-interface GigabitEthernet0/1
 frequency 5                                        <span class="c">! seconds; default 60</span>
ip sla schedule 10 life forever start-time now
ip route 10.10.10.1 255.255.255.255 10.1.1.1        <span class="c">! pin the probe to PE1</span>
track 10 ip sla 10 reachability
 delay down 5 up 10                                 <span class="c">! dampening</span>
no ip route 10.10.10.0 255.255.255.0 10.1.1.1
ip route 10.10.10.0 255.255.255.0 10.1.1.1 track 10
ip route 10.10.10.0 255.255.255.0 10.2.2.1 250      <span class="c">! floating backup via PE2</span></pre>
<p>Why the /32 pin? When the track goes down, the primary route is withdrawn and the floating route via PE2 is installed. Without the pin, the probe to 10.10.10.1 would follow the backup, succeed, bring the track Up, reinstall the primary, fail again, and flap forever. The /32 static has no track, so the probe always leaves via 10.1.1.1.</p>

<h3>Reachability versus state, and the timers</h3>
<ul>
<li><code>track … reachability</code> is Up when the return code is OK <b>or</b> over threshold; <code>track … state</code> is Up only for OK. Use state when "slow" should count as "failed".</li>
<li><b>threshold</b> (default 5000 ms) marks an operation as over threshold; <b>timeout</b> (default 5000 ms) is how long to wait for a reply. Keep threshold at or below timeout, and the timeout below the frequency.</li>
<li><code>delay down 5 up 10</code> waits 5 s before declaring Down and 10 s before declaring Up, which prevents flapping on a single lost probe.</li>
</ul>

<h3>Jitter and delay with a responder</h3>
<pre class="code"><span class="c">! on HQ</span>
ip sla responder
<span class="c">! on BR</span>
ip sla 20
 udp-jitter 10.10.10.1 16384 source-ip 172.16.40.1 num-packets 20 interval 20
 tos 184                                            <span class="c">! DSCP EF, test the voice queue</span>
 frequency 60
ip sla schedule 20 life forever start-time now</pre>
<p>The sender first uses the IP SLA control protocol (UDP 1967) to ask the responder to open the test port, then sends the probe stream. The responder timestamps packets so that its processing time is removed. <b>One-way delay</b> values are only meaningful when both routers are synchronised with NTP.</p>
<pre class="out">BR# show ip sla statistics 20
IPSLAs Latest Operation Statistics

IPSLA operation id: 20
Type of operation: udp-jitter
        Latest RTT: 24 milliseconds
Latest operation start time: 09:14:03 IST Wed Sep 30 2026
<span class="hl">Latest operation return code: OK</span>
RTT Values:
        Number Of RTT: 20               RTT Min/Avg/Max: 21/24/31 milliseconds
Latency one-way time:
        Number of Latency one-way Samples: 20
        Source to Destination Latency one way Min/Avg/Max: 10/12/15 milliseconds
        Destination to Source Latency one way Min/Avg/Max: 11/12/16 milliseconds
Jitter Time:
<span class="hl">        Source to Destination Jitter Min/Avg/Max: 0/2/6 milliseconds</span>
        Destination to Source Jitter Min/Avg/Max: 0/1/4 milliseconds
Packet Loss Values:
<span class="hl">        Loss Source to Destination: 0</span>
        Loss Destination to Source: 0
Number of successes: 12
Number of failures: 0
Operation time to live: Forever</pre>

<h3>Verifying the failover</h3>
<pre class="out">BR# show track 10
Track 10
  IP SLA 10 reachability
<span class="hl">  Reachability is Down</span>
    4 changes, last change 00:00:21
  Delay up 10 secs, down 5 secs
  Latest operation return code: Timeout
  Tracked by:
    Static IP Routing 0

BR# show ip route static
S     10.10.10.0/24 [<span class="hl">250/0] via 10.2.2.1</span>
S     10.10.10.1/32 [1/0] via 10.1.1.1</pre>
<p>And the evidence at the collector: <code>%TRACK-6-STATE: 10 ip sla 10 reachability Up -&gt; Down</code> from 172.16.40.1, later followed by <code>Down -&gt; Up</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IP SLA failover lab">
<rect x="20" y="95" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="122" text-anchor="middle" class="svg-ink" font-size="13">BR</text>
<rect x="230" y="30" width="100" height="44" rx="8" fill="#bae6fd"/><text x="280" y="57" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="230" y="160" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="280" y="187" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<rect x="450" y="95" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="500" y="115" text-anchor="middle" class="svg-ink" font-size="13">HQ</text><text x="500" y="131" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.1</text>
<line x1="110" y1="108" x2="230" y2="52" stroke="#64748b" stroke-width="2"/><line x1="110" y1="126" x2="230" y2="182" stroke="#64748b" stroke-dasharray="5 4"/>
<line x1="330" y1="52" x2="450" y2="108" stroke="#64748b" stroke-width="2"/><line x1="330" y1="182" x2="450" y2="126" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="395" y="68" text-anchor="middle" class="svg-accent" font-size="12">X core fails</text>
<text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="12">track 10</text>
<text x="150" y="190" text-anchor="middle" class="svg-muted" font-size="12">AD 250</text>
</svg><p class="cap">The BR to PE1 cable stays up; only the end-to-end probe sees the core failure.</p></div>

<div class="eg"><p><b>Worked example.</b> Probe every 5 s, delay down 5, delay up 10. PE1's core link fails at 10:00:00. The next probe runs at up to 10:00:05 and times out after 5 s (about 10:00:10). The track waits 5 s more and goes Down at about 10:00:15; failover takes roughly 10 to 15 seconds. When the link returns, the first OK probe starts the 10-second up delay, so the primary returns only after the path has been stable for 10 s.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ip sla schedule</code> (the operation exists but never runs, <code>show ip sla statistics</code> says "Number of successes: 0" and no start time); no source interface, so the probe leaves via the backup; missing /32 pin; a udp-jitter probe with no responder; tracking with <code>state</code> when you meant <code>reachability</code>; modifying a running operation (you must delete and recreate it on many releases).</p></div>

<div class="exam"><p><b>Exam trap.</b> The floating route must have a <b>higher</b> AD than the tracked primary (250 versus 1). And <code>reachability</code> tolerates over-threshold results, <code>state</code> does not.</p></div>

<div class="scn"><h4>The route that flapped every minute</h4><p>An engineer configured SLA tracking for a dual-ISP branch. Every 60 seconds the syslog showed Up then Down, and users complained about dropped calls. The team ran <code>show ip cef 192.0.2.10</code> for the probe target and saw it resolved via the backup ISP when the primary was withdrawn. There was no host route for the target. Adding <code>ip route 192.0.2.10 255.255.255.255 203.0.113.1</code> pinned the probe to ISP1 and the flapping stopped.</p><p><b>Lesson:</b> the probe must never be able to succeed over the path it is protecting you from.</p></div>

<div class="iv"><p class="q">"How does IP SLA udp-jitter work, and when would you use it?"</p><p>A sender sends a stream of UDP packets with timestamps to a router running <code>ip sla responder</code>, after negotiating the port on the control protocol (UDP 1967). The responder adds its own timestamps, so the sender can compute RTT, one-way delay (with NTP), jitter, loss and a MOS score for a codec. Use it to verify voice and video paths or an SLA from a provider, and mark the probe with the same DSCP as the real traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP SLA probes the path end to end; tracking converts results to Up or Down for static routes, FHRPs, PBR and EEM.</li>
<li>Always schedule the operation, set the source, and pin the target with a /32 through the primary path.</li>
<li>udp-jitter needs <code>ip sla responder</code>; one-way delay needs NTP.</li>
<li>reachability = OK or over threshold; state = OK only; use <code>delay</code> to dampen flaps.</li>
<li>Verify with <code>show ip sla statistics</code>, <code>show track</code>, <code>show ip route static</code> and %TRACK-6-STATE messages.</li>
</ul></div>
`,hi:`
<p>Static route us delivery driver jaisa hai jo sirf check karta hai ki warehouse se nikalne wali pehli sadak khuli hai. Agar aage ek pul toot gaya ho, to woh nadi mein gaadi chalata rehta hai. <b>IP SLA</b> har kuch second mein poore raaste par ek scout bhejta hai aur batata hai "pahunch gaya" ya "nahi pahuncha", plus kitna samay laga. <b>Track object</b> scout ki report ko simple Up ya Down mein badalta hai, aur static route, HSRP, PBR ya EEM script us faisle ko follow karte hain.</p>

<h3>Operation types jo aapko pata hone chahiye</h3>
<table class="cmp"><tr><th>Operation</th><th>Kya naapta hai</th><th>Responder chahiye?</th></tr>
<tr><td><code>icmp-echo</code></td><td>Connectivity aur round-trip time (RTT)</td><td>Nahi, koi bhi host jo ping ka jawab de</td></tr>
<tr><td><code>udp-echo</code></td><td>UDP par RTT</td><td>Recommended</td></tr>
<tr><td><code>udp-jitter</code></td><td>RTT, one-way delay, jitter, packet loss, out-of-sequence, voice codecs ke liye MOS</td><td><b>Haan</b>, door wale router par <code>ip sla responder</code></td></tr>
<tr><td><code>tcp-connect</code></td><td>Kisi port par TCP session kholne ka samay</td><td>Well-known ports ke liye nahi</td></tr>
<tr><td><code>dns</code>, <code>path-echo</code></td><td>Name resolution time, hop-by-hop RTT</td><td>Nahi</td></tr></table>

<h3>Connectivity probe aur track (lab 1)</h3>
<pre class="code">ip sla 10
 icmp-echo 10.10.10.1 source-interface GigabitEthernet0/1
 frequency 5                                        <span class="c">! seconds; default 60</span>
ip sla schedule 10 life forever start-time now
ip route 10.10.10.1 255.255.255.255 10.1.1.1        <span class="c">! probe ko PE1 par pin karo</span>
track 10 ip sla 10 reachability
 delay down 5 up 10                                 <span class="c">! dampening</span>
no ip route 10.10.10.0 255.255.255.0 10.1.1.1
ip route 10.10.10.0 255.255.255.0 10.1.1.1 track 10
ip route 10.10.10.0 255.255.255.0 10.2.2.1 250      <span class="c">! PE2 ke through floating backup</span></pre>
<p>/32 pin kyun? Jab track down hota hai, primary route hat jaata hai aur PE2 wala floating route install hota hai. Pin ke bina, 10.10.10.1 ka probe backup follow karta, safal hota, track ko Up karta, primary wapas install karta, phir fail hota, aur hamesha flap karta. /32 static par koi track nahi, isliye probe hamesha 10.1.1.1 se nikalta hai.</p>

<h3>Reachability vs state, aur timers</h3>
<ul>
<li><code>track … reachability</code> tab Up hai jab return code OK <b>ya</b> over threshold ho; <code>track … state</code> sirf OK par Up hai. State tab use karo jab "slow" ko bhi "failed" ginna ho.</li>
<li><b>threshold</b> (default 5000 ms) operation ko over threshold mark karta hai; <b>timeout</b> (default 5000 ms) reply ka intezaar kitna karna hai. Threshold ko timeout ke barabar ya kam rakho, aur timeout ko frequency se kam.</li>
<li><code>delay down 5 up 10</code> Down declare karne se pehle 5 s aur Up declare karne se pehle 10 s rukta hai, jisse ek probe khone par flapping nahi hoti.</li>
</ul>

<h3>Responder ke saath jitter aur delay</h3>
<pre class="code"><span class="c">! HQ par</span>
ip sla responder
<span class="c">! BR par</span>
ip sla 20
 udp-jitter 10.10.10.1 16384 source-ip 172.16.40.1 num-packets 20 interval 20
 tos 184                                            <span class="c">! DSCP EF, voice queue test karo</span>
 frequency 60
ip sla schedule 20 life forever start-time now</pre>
<p>Sender pehle IP SLA control protocol (UDP 1967) se responder ko test port kholne ko kehta hai, phir probe stream bhejta hai. Responder packets par timestamp lagata hai taaki uska processing time hata diya jaaye. <b>One-way delay</b> values tabhi meaningful hain jab dono routers NTP se synchronised hon.</p>
<pre class="out">BR# show ip sla statistics 20
IPSLAs Latest Operation Statistics

IPSLA operation id: 20
Type of operation: udp-jitter
        Latest RTT: 24 milliseconds
Latest operation start time: 09:14:03 IST Wed Sep 30 2026
<span class="hl">Latest operation return code: OK</span>
RTT Values:
        Number Of RTT: 20               RTT Min/Avg/Max: 21/24/31 milliseconds
Latency one-way time:
        Number of Latency one-way Samples: 20
        Source to Destination Latency one way Min/Avg/Max: 10/12/15 milliseconds
        Destination to Source Latency one way Min/Avg/Max: 11/12/16 milliseconds
Jitter Time:
<span class="hl">        Source to Destination Jitter Min/Avg/Max: 0/2/6 milliseconds</span>
        Destination to Source Jitter Min/Avg/Max: 0/1/4 milliseconds
Packet Loss Values:
<span class="hl">        Loss Source to Destination: 0</span>
        Loss Destination to Source: 0
Number of successes: 12
Number of failures: 0
Operation time to live: Forever</pre>

<h3>Failover verify karna</h3>
<pre class="out">BR# show track 10
Track 10
  IP SLA 10 reachability
<span class="hl">  Reachability is Down</span>
    4 changes, last change 00:00:21
  Delay up 10 secs, down 5 secs
  Latest operation return code: Timeout
  Tracked by:
    Static IP Routing 0

BR# show ip route static
S     10.10.10.0/24 [<span class="hl">250/0] via 10.2.2.1</span>
S     10.10.10.1/32 [1/0] via 10.1.1.1</pre>
<p>Aur collector par saboot: 172.16.40.1 se <code>%TRACK-6-STATE: 10 ip sla 10 reachability Up -&gt; Down</code>, baad mein <code>Down -&gt; Up</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IP SLA failover lab">
<rect x="20" y="95" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="122" text-anchor="middle" class="svg-ink" font-size="13">BR</text>
<rect x="230" y="30" width="100" height="44" rx="8" fill="#bae6fd"/><text x="280" y="57" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="230" y="160" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="280" y="187" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<rect x="450" y="95" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="500" y="115" text-anchor="middle" class="svg-ink" font-size="13">HQ</text><text x="500" y="131" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.1</text>
<line x1="110" y1="108" x2="230" y2="52" stroke="#64748b" stroke-width="2"/><line x1="110" y1="126" x2="230" y2="182" stroke="#64748b" stroke-dasharray="5 4"/>
<line x1="330" y1="52" x2="450" y2="108" stroke="#64748b" stroke-width="2"/><line x1="330" y1="182" x2="450" y2="126" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="395" y="68" text-anchor="middle" class="svg-accent" font-size="12">X core fail</text>
<text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="12">track 10</text>
<text x="150" y="190" text-anchor="middle" class="svg-muted" font-size="12">AD 250</text>
</svg><p class="cap">BR se PE1 ki cable up rehti hai; sirf end-to-end probe core failure dekhta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Har 5 s probe, delay down 5, delay up 10. PE1 ka core link 10:00:00 par fail hota hai. Agla probe zyada se zyada 10:00:05 par chalta hai aur 5 s baad (lagbhag 10:00:10) timeout hota hai. Track 5 s aur rukta hai aur lagbhag 10:00:15 par Down hota hai; failover mein lagbhag 10 se 15 second lagte hain. Link wapas aane par, pehla OK probe 10-second up delay shuru karta hai, isliye primary tabhi lautta hai jab path 10 s tak stable rahe.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>ip sla schedule</code> bhoolna (operation hai par kabhi chalta nahi, <code>show ip sla statistics</code> "Number of successes: 0" kehta hai aur koi start time nahi); koi source interface nahi, isliye probe backup se nikalta hai; /32 pin missing; bina responder ke udp-jitter probe; <code>reachability</code> chahte hue <code>state</code> se track karna; chalte operation ko modify karna (kai releases par delete karke dobara banana padta hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> Floating route ka AD tracked primary se <b>zyada</b> hona chahiye (250 vs 1). Aur <code>reachability</code> over-threshold results bardaasht karta hai, <code>state</code> nahi.</p></div>

<div class="scn"><h4>Har minute flap karne wala route</h4><p>Ek engineer ne dual-ISP branch ke liye SLA tracking configure ki. Har 60 second mein syslog Up phir Down dikhata, aur users dropped calls ki shikayat karte. Team ne probe target ke liye <code>show ip cef 192.0.2.10</code> chalaya aur dekha ki primary hat-te hi woh backup ISP se resolve ho raha tha. Target ke liye koi host route nahi tha. <code>ip route 192.0.2.10 255.255.255.255 203.0.113.1</code> jodne se probe ISP1 par pin hua aur flapping ruk gayi.</p><p><b>Seekh:</b> probe kabhi us path se safal nahi hona chahiye jisse woh aapko bacha raha hai.</p></div>

<div class="iv"><p class="q">"IP SLA udp-jitter kaise kaam karta hai, aur aap ise kab use karoge?"</p><p>Sender control protocol (UDP 1967) par port negotiate karne ke baad <code>ip sla responder</code> chalane wale router ko timestamps ke saath UDP packets ki stream bhejta hai. Responder apne timestamps jodta hai, isliye sender RTT, one-way delay (NTP ke saath), jitter, loss aur codec ke liye MOS score nikal sakta hai. Ise voice aur video paths ya provider ka SLA verify karne ke liye use karo, aur probe ko asli traffic jaisi DSCP se mark karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP SLA path ko end to end probe karta hai; tracking results ko static routes, FHRPs, PBR aur EEM ke liye Up ya Down mein badalta hai.</li>
<li>Hamesha operation schedule karo, source set karo, aur target ko primary path se /32 se pin karo.</li>
<li>udp-jitter ko <code>ip sla responder</code> chahiye; one-way delay ko NTP chahiye.</li>
<li>reachability = OK ya over threshold; state = sirf OK; flaps dabane ke liye <code>delay</code> use karo.</li>
<li><code>show ip sla statistics</code>, <code>show track</code>, <code>show ip route static</code> aur %TRACK-6-STATE messages se verify karo.</li>
</ul></div>
`}};export{e as default};