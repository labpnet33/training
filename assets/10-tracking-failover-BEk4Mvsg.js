var e={id:`tracking-failover`,h:{en:`Object tracking and dual-ISP failover (IP SLA lab)`,hi:`Object tracking aur dual-ISP failover (IP SLA lab)`},body:{en:`
<p>Imagine a shop with two delivery partners. The main partner's van is parked outside every morning, so the manager assumes deliveries are working. But one day the van is there and the driver's route is blocked on the highway. A smart manager phones a customer across town every few minutes: "did your parcel arrive?" When the answer is no, he switches to the backup partner. <b>IP SLA</b> is that phone call; <b>object tracking</b> is the manager's decision.</p>

<h3>The problem: an up interface is not a working path</h3>
<p>A static route stays in the routing table as long as its next hop is resolvable and the exit interface is up. In the lab, EDGE has a primary default route to ISP1 (10.0.1.1) and a floating backup to ISP2 (10.0.2.1) with administrative distance 10. When ISP1 loses its <b>upstream</b> link, the cable between EDGE and ISP1 stays up, the primary route never leaves the table, and the backup never takes over. The office is offline although a working ISP2 is sitting idle.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Dual-ISP IP SLA lab">
<rect x="20" y="105" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="127" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="145" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.10</text>
<rect x="175" y="100" width="120" height="60" rx="10" fill="#bae6fd"/><text x="235" y="127" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="235" y="146" text-anchor="middle" class="svg-muted" font-size="12">IP SLA 1, track 1</text>
<rect x="345" y="25" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="345" y="185" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="400" y="215" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="505" y="100" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="565" y="125" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="565" y="144" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.53</text>
<line x1="130" y1="130" x2="175" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="115" x2="345" y2="55" stroke="#64748b" stroke-width="2"/><text x="300" y="75" class="svg-accent" font-size="12">10.0.1.0/30</text>
<line x1="295" y1="145" x2="345" y2="205" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="290" y="200" class="svg-muted" font-size="12">10.0.2.0/30, AD 10</text>
<line x1="455" y1="50" x2="505" y2="115" stroke="#64748b" stroke-width="2"/><text x="490" y="70" class="svg-accent" font-size="12">upstream</text>
<line x1="455" y1="210" x2="505" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The probe to 203.0.113.53 must travel through ISP1 and its upstream, so it detects failures beyond the local link.</p></div>

<h3>Step 1: the IP SLA probe</h3>
<pre class="code">EDGE(config)# ip sla 1
EDGE(config-ip-sla)# icmp-echo 203.0.113.53 source-interface GigabitEthernet0/0
EDGE(config-ip-sla-echo)# frequency 5
EDGE(config-ip-sla-echo)# exit
EDGE(config)# ip sla schedule 1 life forever start-time now</pre>
<p>The target 203.0.113.53 is beyond ISP1, so the probe tests the whole path, not just the local cable.</p>

<h3>Step 2: the track object</h3>
<pre class="code">EDGE(config)# track 1 ip sla 1 reachability
EDGE(config-track)# delay down 5 up 10</pre>
<p>A <b>track object</b> turns something measurable into a simple Up or Down state that other features can follow. It can track an interface (<code>track 2 interface g0/0 line-protocol</code>), a route, an IP SLA operation, or a Boolean list of other track objects. For IP SLA there are two modes:</p>
<ul>
<li><b>reachability</b>: Up when the return code is OK <b>or</b> Over threshold. You only care that replies come back.</li>
<li><b>state</b>: Up only when the return code is OK. Over threshold counts as Down, so a slow path also triggers failover.</li>
</ul>
<p><code>delay down 5 up 10</code> dampens flapping: the track goes Down only after the probe has failed for 5 seconds, and comes back Up only after 10 seconds of success.</p>

<h3>Step 3: tie the route to the track and pin the probe</h3>
<pre class="code">EDGE(config)# no ip route 0.0.0.0 0.0.0.0 10.0.1.1
EDGE(config)# ip route 0.0.0.0 0.0.0.0 10.0.1.1 track 1
EDGE(config)# ip route 203.0.113.53 255.255.255.255 10.0.1.1</pre>
<p>The tracked default route is installed only while track 1 is Up. The /32 host route is essential. <code>source-interface</code> only sets the <b>source address</b> of the probe; the routing table still decides where the probe goes. Without the /32, when the default route fails over to ISP2, the probe would follow it, succeed through ISP2, bring the track Up, reinstall the primary route, fail again... an endless flap. The /32 forces the probe through ISP1 at all times.</p>

<h3>Step 4 and 5: break it and restore it</h3>
<p>Shut ISP1 Gi0/1 (its upstream). Within about 10 seconds (5 s probe interval plus 5 s delay) EDGE logs:</p>
<pre class="out">%TRACK-6-STATE: 1 ip sla 1 reachability <span class="hl">Up -&gt; Down</span>

EDGE# show track 1
Track 1
  IP SLA 1 reachability
  <span class="hl">Reachability is Down</span>
    1 change, last change 00:00:07
  Delay up 10 secs, down 5 secs
  Latest operation return code: Timeout
  Tracked by:
    Static IP Routing 0

EDGE# show ip route static
S*    0.0.0.0/0 <span class="hl">[10/0] via 10.0.2.1</span>
      203.0.0.0/32 is subnetted, 1 subnets
S        203.0.113.53 [1/0] via 10.0.1.1</pre>
<p>PC1 can ping 198.51.100.10 again, now through ISP2. Then <code>no shutdown</code> on ISP1 Gi0/1. <code>show ip sla statistics 1</code> shows the return code back to OK first; 10 seconds later the track returns to Up and the default route moves back to 10.0.1.1 with distance 1.</p>

<div class="eg"><p><b>Worked example.</b> Timing budget: frequency 5 s, timeout 5000 ms, delay down 5 s. Worst case, the failure happens just after a successful probe: the next probe starts up to 5 s later, needs 5 s to time out, and the down delay adds 5 s, so failover takes up to about 15 seconds. Lower frequency and timeout for faster failover, at the price of more false alarms on a lossy link.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding <code>ip route 0.0.0.0 0.0.0.0 10.0.1.1 track 1</code> without removing the old untracked route. Both entries exist; the untracked one stays installed when the track goes down, so failover never happens. Check <code>show running-config | include ip route</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reachability treats "Over threshold" as Up; state treats it as Down. The floating backup must have a <b>higher</b> administrative distance than the primary. And <code>source-interface</code> in the IP SLA does not force the egress path.</p></div>

<div class="scn"><h4>The failover that flapped every 20 seconds</h4><p>A branch configured IP SLA tracking to a public DNS server through ISP1 without a host route. During an ISP1 outage, users complained that internet access came and went every 20 seconds. Syslog showed <code>%TRACK-6-STATE</code> Up and Down alternating. The probe was following the default route to ISP2 once failover happened. Adding a /32 static route for the probe target via the ISP1 next hop stopped the flapping.</p><p><b>Lesson:</b> the probe must always take the path it is supposed to test.</p></div>

<div class="iv"><p class="q">"How do you make a static default route fail over when the ISP's upstream fails but your link stays up?"</p><p>Configure an IP SLA icmp-echo to a target beyond the ISP, schedule it, create a track object on its reachability with up/down delays, attach <code>track N</code> to the primary static route, keep a floating static with higher AD to the backup ISP, and pin the probe target with a /32 route via the primary next hop so the probe never uses the backup. Verify with <code>show ip sla statistics</code>, <code>show track</code> and <code>show ip route static</code>, and test by failing the upstream.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A static route alone cannot detect failures beyond the directly connected link.</li>
<li>IP SLA probe + <code>track N ip sla N reachability|state</code> + <code>ip route ... track N</code> = conditional route.</li>
<li>Keep a floating static (higher AD) to the backup ISP.</li>
<li>Pin the probe target with a /32 via the primary next hop to avoid flapping.</li>
<li>Use <code>delay down/up</code> to dampen; verify with <code>show track</code> and <code>%TRACK-6-STATE</code> messages.</li>
</ul></div>
`,hi:`
<p>Ek dukaan socho jiske do delivery partners hain. Main partner ki van har subah bahar khadi hoti hai, isliye manager maan leta hai ki deliveries chal rahi hain. Par ek din van wahan hai aur driver ka route highway par block hai. Samajhdaar manager har kuch minute mein shehar ke doosre kone ke ek customer ko phone karta hai: "kya aapka parcel pahuncha?" Jab jawab na ho, woh backup partner par switch kar deta hai. <b>IP SLA</b> woh phone call hai; <b>object tracking</b> manager ka faisla hai.</p>

<h3>Problem: up interface ka matlab working path nahi</h3>
<p>Static route routing table mein tab tak rehta hai jab tak uska next hop resolve hota hai aur exit interface up hai. Lab mein EDGE ke paas ISP1 (10.0.1.1) ki taraf primary default route aur ISP2 (10.0.2.1) ki taraf administrative distance 10 wala floating backup hai. Jab ISP1 apna <b>upstream</b> link kho deta hai, EDGE aur ISP1 ke beech ki cable up rehti hai, primary route table se kabhi nahi hatta, aur backup kabhi takeover nahi karta. Office offline hai jabki working ISP2 khaali baitha hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Dual-ISP IP SLA lab">
<rect x="20" y="105" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="127" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="145" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.10</text>
<rect x="175" y="100" width="120" height="60" rx="10" fill="#bae6fd"/><text x="235" y="127" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="235" y="146" text-anchor="middle" class="svg-muted" font-size="12">IP SLA 1, track 1</text>
<rect x="345" y="25" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="345" y="185" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="400" y="215" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="505" y="100" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="565" y="125" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="565" y="144" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.53</text>
<line x1="130" y1="130" x2="175" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="115" x2="345" y2="55" stroke="#64748b" stroke-width="2"/><text x="300" y="75" class="svg-accent" font-size="12">10.0.1.0/30</text>
<line x1="295" y1="145" x2="345" y2="205" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="290" y="200" class="svg-muted" font-size="12">10.0.2.0/30, AD 10</text>
<line x1="455" y1="50" x2="505" y2="115" stroke="#64748b" stroke-width="2"/><text x="490" y="70" class="svg-accent" font-size="12">upstream</text>
<line x1="455" y1="210" x2="505" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">203.0.113.53 ka probe ISP1 aur uske upstream se hokar jaana chahiye, taaki local link ke aage ke failures pakde.</p></div>

<h3>Step 1: IP SLA probe</h3>
<pre class="code">EDGE(config)# ip sla 1
EDGE(config-ip-sla)# icmp-echo 203.0.113.53 source-interface GigabitEthernet0/0
EDGE(config-ip-sla-echo)# frequency 5
EDGE(config-ip-sla-echo)# exit
EDGE(config)# ip sla schedule 1 life forever start-time now</pre>
<p>Target 203.0.113.53 ISP1 ke aage hai, isliye probe sirf local cable nahi, poora path test karta hai.</p>

<h3>Step 2: track object</h3>
<pre class="code">EDGE(config)# track 1 ip sla 1 reachability
EDGE(config-track)# delay down 5 up 10</pre>
<p><b>Track object</b> kisi naapne layak cheez ko simple Up ya Down state mein badal deta hai jise doosre features follow kar sakein. Yeh interface (<code>track 2 interface g0/0 line-protocol</code>), route, IP SLA operation, ya doosre track objects ki Boolean list track kar sakta hai. IP SLA ke liye do modes hain:</p>
<ul>
<li><b>reachability</b>: Up jab return code OK <b>ya</b> Over threshold ho. Aapko sirf itni parwah hai ki replies wapas aa rahe hain.</li>
<li><b>state</b>: Up sirf jab return code OK ho. Over threshold Down gina jaata hai, isliye slow path bhi failover trigger karta hai.</li>
</ul>
<p><code>delay down 5 up 10</code> flapping ko dampen karta hai: track tabhi Down hota hai jab probe 5 second se fail ho raha ho, aur 10 second ki success ke baad hi wapas Up hota hai.</p>

<h3>Step 3: route ko track se jodo aur probe pin karo</h3>
<pre class="code">EDGE(config)# no ip route 0.0.0.0 0.0.0.0 10.0.1.1
EDGE(config)# ip route 0.0.0.0 0.0.0.0 10.0.1.1 track 1
EDGE(config)# ip route 203.0.113.53 255.255.255.255 10.0.1.1</pre>
<p>Tracked default route sirf tab tak install rehta hai jab tak track 1 Up hai. /32 host route bahut zaroori hai. <code>source-interface</code> sirf probe ka <b>source address</b> set karta hai; probe kahan jaayega yeh ab bhi routing table decide karti hai. /32 ke bina, jab default route ISP2 par failover hota, probe bhi uske peeche jaata, ISP2 ke through succeed karta, track ko Up karta, primary route dobara install hota, phir fail hota... ek anant flap. /32 probe ko hamesha ISP1 se jaane par majboor karta hai.</p>

<h3>Step 4 aur 5: todo aur wapas lao</h3>
<p>ISP1 Gi0/1 (uska upstream) shut karo. Lagbhag 10 second mein (5 s probe interval plus 5 s delay) EDGE log karta hai:</p>
<pre class="out">%TRACK-6-STATE: 1 ip sla 1 reachability <span class="hl">Up -&gt; Down</span>

EDGE# show track 1
Track 1
  IP SLA 1 reachability
  <span class="hl">Reachability is Down</span>
    1 change, last change 00:00:07
  Delay up 10 secs, down 5 secs
  Latest operation return code: Timeout
  Tracked by:
    Static IP Routing 0

EDGE# show ip route static
S*    0.0.0.0/0 <span class="hl">[10/0] via 10.0.2.1</span>
      203.0.0.0/32 is subnetted, 1 subnets
S        203.0.113.53 [1/0] via 10.0.1.1</pre>
<p>PC1 phir se 198.51.100.10 ping kar sakta hai, ab ISP2 ke through. Phir ISP1 Gi0/1 par <code>no shutdown</code> karo. <code>show ip sla statistics 1</code> pehle return code ko wapas OK dikhata hai; 10 second baad track wapas Up hota hai aur default route distance 1 ke saath 10.0.1.1 par laut aata hai.</p>

<div class="eg"><p><b>Worked example.</b> Timing budget: frequency 5 s, timeout 5000 ms, delay down 5 s. Worst case mein failure ek successful probe ke theek baad hota hai: agla probe 5 s tak baad shuru hota hai, time out hone mein 5 s leta hai, aur down delay 5 s jodta hai, isliye failover mein lagbhag 15 second tak lagte hain. Tez failover ke liye frequency aur timeout kam karo, lossy link par zyada false alarms ki keemat par.</p></div>

<div class="warn"><p><b>Common galti.</b> Purana untracked route hataye bina <code>ip route 0.0.0.0 0.0.0.0 10.0.1.1 track 1</code> jodna. Dono entries rehti hain; track down hone par untracked wali install rehti hai, isliye failover kabhi nahi hota. <code>show running-config | include ip route</code> check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reachability "Over threshold" ko Up maanta hai; state use Down maanta hai. Floating backup ki administrative distance primary se <b>zyada</b> honi chahiye. Aur IP SLA mein <code>source-interface</code> egress path force nahi karta.</p></div>

<div class="scn"><h4>Failover jo har 20 second mein flap karta tha</h4><p>Ek branch ne bina host route ke ISP1 ke through ek public DNS jaise target par IP SLA tracking configure ki. ISP1 outage ke dauran users ne shikayat ki ki internet har 20 second mein aata jaata hai. Syslog mein <code>%TRACK-6-STATE</code> Up aur Down baari baari dikh rahe the. Failover hote hi probe default route ke peeche ISP2 par ja raha tha. ISP1 next hop ke through probe target ke liye /32 static route jodne se flapping ruk gayi.</p><p><b>Seekh:</b> probe ko hamesha wahi path lena chahiye jise woh test karne ke liye bana hai.</p></div>

<div class="iv"><p class="q">"Jab ISP ka upstream fail ho par aapka link up rahe, tab static default route ko failover kaise karwaoge?"</p><p>ISP ke aage ke target par IP SLA icmp-echo configure karo, schedule karo, up/down delays ke saath uski reachability par track object banao, primary static route par <code>track N</code> lagao, backup ISP ki taraf zyada AD wala floating static rakho, aur probe target ko primary next hop ke through /32 route se pin karo taaki probe kabhi backup use na kare. <code>show ip sla statistics</code>, <code>show track</code> aur <code>show ip route static</code> se verify karo, aur upstream fail karke test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Akela static route directly connected link ke aage ke failures detect nahi kar sakta.</li>
<li>IP SLA probe + <code>track N ip sla N reachability|state</code> + <code>ip route ... track N</code> = conditional route.</li>
<li>Backup ISP ki taraf floating static (zyada AD) rakho.</li>
<li>Flapping se bachne ke liye probe target ko primary next hop ke through /32 se pin karo.</li>
<li>Dampen karne ke liye <code>delay down/up</code> use karo; <code>show track</code> aur <code>%TRACK-6-STATE</code> messages se verify karo.</li>
</ul></div>
`}};export{e as default};