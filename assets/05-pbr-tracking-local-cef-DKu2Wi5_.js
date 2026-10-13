var e={id:`pbr-tracking`,h:{en:`PBR in production: tracking, local policy, CEF and debug`,hi:`Production mein PBR: tracking, local policy, CEF aur debug`},body:{en:`
<p>A GPS app that sends you down a road without checking whether the bridge ahead is open is dangerous. Plain PBR is that GPS: it only checks that the first metre of road (the local link) exists. In production you add a scout who drives ahead every few seconds and radios back "bridge open" or "bridge closed". That scout is <b>IP SLA</b>, and the radio is <b>object tracking</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="IP SLA probe through ISP2">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">IP SLA 20</text>
<rect x="260" y="80" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.1</text>
<rect x="500" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">100.64.20.2</text>
<line x1="140" y1="105" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><text x="200" y="97" text-anchor="middle" class="svg-muted" font-size="12">link up</text>
<line x1="380" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="440" y="97" text-anchor="middle" class="svg-accent" font-size="12">may fail</text>
<path d="M80 80 C 200 20, 440 20, 560 80" stroke="#64748b" stroke-width="1.5" fill="none"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="12">ICMP probe every 5 s</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">track 20 Up: guests use 10.0.2.1</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">track 20 Down: skip 10.0.2.1, route normally via ISP1</text>
</svg><p class="cap">The probe tests the path beyond ISP2, not just the local link.</p></div>

<h3>verify-availability with IP SLA and tracking</h3>
<p>IP SLA sends a probe (for example an ICMP echo) to a target beyond ISP2. A <b>track object</b> watches the probe result and becomes Up or Down. PBR then uses the next hop only while the track is Up. The detailed IP SLA options are taught in the Infrastructure Services module; here is the PBR-relevant part.</p>
<pre class="code"><span class="c">! 1. Probe a target BEHIND ISP2, not ISP2's own interface</span>
ip sla 20
 icmp-echo 100.64.20.2 source-interface GigabitEthernet0/1
 frequency 5
ip sla schedule 20 life forever start-time now
<span class="c">! 2. Pin the probe to ISP2; otherwise the default route sends it via ISP1</span>
ip route 100.64.20.2 255.255.255.255 10.0.2.1
<span class="c">! 3. Track the probe, with dampening delays against flapping</span>
track 20 ip sla 20 reachability
 delay down 10 up 30
<span class="c">! 4. PBR uses 10.0.2.1 only while track 20 is up</span>
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop verify-availability 10.0.2.1 10 track 20</pre>
<p>The number 10 before <code>track</code> is a sequence number. You can list several next hops, each with its own track; the lowest sequence whose track is Up is used. If every tracked next hop is down, the packet is routed normally, so guests fall back to ISP1 instead of being black-holed.</p>

<pre class="out">EDGE# show track 20
Track 20
  IP SLA 20 reachability
  <span class="hl">Reachability is Down</span>
    2 changes, last change 00:00:41
  Delay up 30 secs, down 10 secs
  Latest operation return code: Timeout

EDGE# show route-map GUEST-VIA-ISP2
route-map GUEST-VIA-ISP2, permit, sequence 10
  Match clauses:
    ip address (access-lists): GUEST-NET
  Set clauses:
    <span class="hl">ip next-hop verify-availability 10.0.2.1 10 track 20  [down]</span>
  Policy routing matches: 18230 packets, 14766300 bytes</pre>

<div class="eg"><p><b>Worked example.</b> The probe runs every 5 seconds and times out after the default 5 seconds. ISP2's upstream dies at 10:00:00. The first failed probe is detected around 10:00:05, the track waits its 10-second down delay, and at about 10:00:15 the track goes Down and guests move to ISP1. When ISP2 recovers at 10:20:00, the track waits 30 seconds of stable success, so guests return at about 10:20:30. Asymmetric delays (quick to leave, slow to return) stop a flapping link from bouncing users back and forth.</p></div>

<div class="note"><p>Without arguments, <code>set ip next-hop verify-availability</code> is an older form that checks the next hop with CDP neighbour information. The tracked form shown above is what you should use and expect on the exam.</p></div>

<h3>Local policy: steering the router's own traffic</h3>
<p>Interface PBR only sees packets arriving on that interface. Packets the router <b>originates</b> (its own pings, syslog, NTP, SNMP traps, IP SLA probes) never arrive on an interface, so they ignore <code>ip policy</code>. To steer them, use a local policy:</p>
<pre class="code"><span class="c">! Send EDGE's own syslog to the log server via ISP2</span>
ip access-list extended LOCAL-SYSLOG
 permit udp any host 203.0.113.50 eq syslog
route-map LOCAL-PBR permit 10
 match ip address LOCAL-SYSLOG
 set ip next-hop 10.0.2.1
ip local policy route-map LOCAL-PBR</pre>
<pre class="out">EDGE# show ip policy
Interface      Route map
<span class="hl">local          LOCAL-PBR</span>
Gi0/3          GUEST-VIA-ISP2</pre>
<p>Keep local policy ACLs narrow. A lazy <code>permit ip any any</code> also catches OSPF hellos, BGP packets and BFD, and can tear down your own adjacencies.</p>

<h3>PBR and CEF</h3>
<p>On current IOS and IOS-XE, PBR is <b>CEF-switched</b>: the route map is evaluated in the fast forwarding path, and debug output literally says "FIB policy". Very old releases process-switched PBR, and later offered fast-switched PBR with <code>ip route-cache policy</code>, which you will still see in old configs. If someone disables CEF with <code>no ip cef</code>, PBR falls back to slower switching and CPU climbs. On Catalyst switches PBR is programmed into hardware (TCAM); some platforms need an SDM template that reserves PBR entries, and unsupported actions are punted to the CPU. One more point: <code>show ip cef</code> and <code>show ip route</code> show the destination-based result only; they never tell you what PBR will do.</p>

<h3>Where PBR sits among other features</h3>
<p>For a packet going from inside to outside, IOS applies the inbound ACL first, then policy routing, then the routing decision, then NAT inside-to-outside, then the outbound ACL. Two practical results: an inbound ACL that denies a packet stops it before PBR sees it, and NAT happens <b>after</b> PBR, so NAT must translate guest traffic to ISP2's address based on the exit interface (a NAT route map with <code>match interface</code>).</p>

<h3>debug ip policy</h3>
<pre class="code">access-list 101 permit ip host 192.168.20.10 any
debug ip policy 101</pre>
<pre class="out">IP: s=192.168.20.10 (GigabitEthernet0/3), d=198.51.100.10, len 60, FIB policy match
<span class="hl">IP: s=192.168.20.10 (GigabitEthernet0/3), d=198.51.100.10, g=10.0.2.1, len 60, FIB policy routed</span>
IP: s=192.168.20.10 (GigabitEthernet0/3), d=192.168.10.53, len 60, FIB policy rejected(no match) - normal forwarding</pre>
<p>Limit debug with an ACL, especially on a busy router; one line per packet can overwhelm the console.</p>

<div class="warn"><p><b>Common mistake.</b> Probing ISP2's own interface 10.0.2.1. That address answers as long as the local link and ISP2's router are alive, so the track stays Up while ISP2's upstream is dead. Probe something behind the provider, and pin the probe with a host route or source interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> "PBR works for hosts but a ping from the router ignores it" means no local policy. "Guests stay on a dead ISP whose link is up" means no tracking. Match symptom to missing feature.</p></div>

<div class="scn"><h4>Up, up and black-holed</h4><p>A retail branch sent card-terminal traffic via a 4G router with PBR. One night the 4G provider lost its core, but the Ethernet link to the 4G router stayed up. Terminals timed out for two hours. The fix: an IP SLA probe to a head-office address pinned through the 4G router, a track object with <code>delay down 5 up 60</code>, and <code>verify-availability</code> in the route map. In the next outage the terminals fell back to the fibre link after about 15 seconds.</p><p><b>Lesson:</b> a live link is not a live path. Track the path.</p></div>

<div class="iv"><p class="q">"How do you make PBR fail over when the provider fails but the link stays up?"</p><p>Strong answer: configure an IP SLA ICMP probe to a target beyond the provider, pinned to that provider; tie it to a track object with up and down delays; and use <code>set ip next-hop verify-availability NH SEQ track N</code>. When the track is down, PBR skips that next hop and uses the next one or normal routing. Mention verifying with <code>show track</code> and the [up]/[down] flag in <code>show route-map</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>verify-availability ... track N</code> makes PBR follow real path health; probe beyond the provider.</li>
<li>Track delays (<code>delay down/up</code>) prevent flapping between providers.</li>
<li><code>ip local policy route-map</code> steers router-originated traffic; keep its ACL narrow.</li>
<li>Modern PBR is CEF-switched ("FIB policy"); disabling CEF hurts performance.</li>
<li>Inbound ACL runs before PBR; NAT inside-to-outside runs after it.</li>
</ul></div>
`,hi:`
<p>Ek GPS app jo aapko aage ka pul khula hai ya nahi check kiye bina road par bhej de, khatarnak hai. Plain PBR wahi GPS hai: yeh sirf check karta hai ki road ka pehla metre (local link) hai. Production mein aap ek scout jodte ho jo har kuch second aage drive karke radio par batata hai "pul khula" ya "pul band". Woh scout <b>IP SLA</b> hai, aur radio <b>object tracking</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="IP SLA probe through ISP2">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">IP SLA 20</text>
<rect x="260" y="80" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.1</text>
<rect x="500" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="13">CORE</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">100.64.20.2</text>
<line x1="140" y1="105" x2="260" y2="105" stroke="#64748b" stroke-width="2"/><text x="200" y="97" text-anchor="middle" class="svg-muted" font-size="12">link up</text>
<line x1="380" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="440" y="97" text-anchor="middle" class="svg-accent" font-size="12">fail ho sakta hai</text>
<path d="M80 80 C 200 20, 440 20, 560 80" stroke="#64748b" stroke-width="1.5" fill="none"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="12">Har 5 s ICMP probe</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">track 20 Up: guests 10.0.2.1 use karte hain</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">track 20 Down: 10.0.2.1 skip, ISP1 se normal routing</text>
</svg><p class="cap">Probe ISP2 ke aage ka path test karta hai, sirf local link nahi.</p></div>

<h3>IP SLA aur tracking ke saath verify-availability</h3>
<p>IP SLA ISP2 ke peeche ke kisi target ko probe bhejta hai (jaise ICMP echo). Ek <b>track object</b> probe result dekhta hai aur Up ya Down hota hai. PBR phir next hop sirf tab use karta hai jab track Up ho. IP SLA ke detailed options Infrastructure Services module mein padhaye gaye hain; yahan PBR wala hissa hai.</p>
<pre class="code"><span class="c">! 1. ISP2 ke PEECHE target probe karo, ISP2 ka apna interface nahi</span>
ip sla 20
 icmp-echo 100.64.20.2 source-interface GigabitEthernet0/1
 frequency 5
ip sla schedule 20 life forever start-time now
<span class="c">! 2. Probe ko ISP2 par pin karo; warna default route use ISP1 se bhejega</span>
ip route 100.64.20.2 255.255.255.255 10.0.2.1
<span class="c">! 3. Probe ko track karo, flapping ke khilaf dampening delays ke saath</span>
track 20 ip sla 20 reachability
 delay down 10 up 30
<span class="c">! 4. PBR 10.0.2.1 sirf tab use kare jab track 20 up ho</span>
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop verify-availability 10.0.2.1 10 track 20</pre>
<p><code>track</code> se pehle wala number 10 ek sequence number hai. Aap kai next hops list kar sakte ho, har ek ka apna track; sabse chhota sequence jiska track Up hai woh use hota hai. Agar har tracked next hop down hai, packet normal route hota hai, isliye guests black-hole hone ke bajaye ISP1 par laut jaate hain.</p>

<pre class="out">EDGE# show track 20
Track 20
  IP SLA 20 reachability
  <span class="hl">Reachability is Down</span>
    2 changes, last change 00:00:41
  Delay up 30 secs, down 10 secs
  Latest operation return code: Timeout

EDGE# show route-map GUEST-VIA-ISP2
route-map GUEST-VIA-ISP2, permit, sequence 10
  Match clauses:
    ip address (access-lists): GUEST-NET
  Set clauses:
    <span class="hl">ip next-hop verify-availability 10.0.2.1 10 track 20  [down]</span>
  Policy routing matches: 18230 packets, 14766300 bytes</pre>

<div class="eg"><p><b>Worked example.</b> Probe har 5 second chalta hai aur default 5 second baad timeout hota hai. ISP2 ka upstream 10:00:00 par mar jaata hai. Pehla failed probe lagbhag 10:00:05 par detect hota hai, track apna 10-second down delay wait karta hai, aur lagbhag 10:00:15 par track Down hota hai aur guests ISP1 par shift hote hain. Jab ISP2 10:20:00 par recover hota hai, track 30 second stable success ka wait karta hai, isliye guests lagbhag 10:20:30 par wapas aate hain. Asymmetric delays (jaldi chhodo, dheere lauto) flapping link ko users ko idhar-udhar uchhalne se rokte hain.</p></div>

<div class="note"><p>Bina arguments ke <code>set ip next-hop verify-availability</code> ek purana form hai jo next hop ko CDP neighbour information se check karta hai. Upar dikhaya tracked form hi aapko use karna chahiye aur exam mein expect karna chahiye.</p></div>

<h3>Local policy: router ka apna traffic steer karna</h3>
<p>Interface PBR sirf us interface par aane wale packets dekhta hai. Router jo packets <b>khud banata hai</b> (apne pings, syslog, NTP, SNMP traps, IP SLA probes) woh kabhi kisi interface par aate hi nahi, isliye <code>ip policy</code> ko ignore karte hain. Unhe steer karne ke liye local policy use karo:</p>
<pre class="code"><span class="c">! EDGE ka apna syslog log server ko ISP2 se bhejo</span>
ip access-list extended LOCAL-SYSLOG
 permit udp any host 203.0.113.50 eq syslog
route-map LOCAL-PBR permit 10
 match ip address LOCAL-SYSLOG
 set ip next-hop 10.0.2.1
ip local policy route-map LOCAL-PBR</pre>
<pre class="out">EDGE# show ip policy
Interface      Route map
<span class="hl">local          LOCAL-PBR</span>
Gi0/3          GUEST-VIA-ISP2</pre>
<p>Local policy ke ACLs narrow rakho. Aalsi <code>permit ip any any</code> OSPF hellos, BGP packets aur BFD ko bhi pakad leta hai, aur aapki apni adjacencies gira sakta hai.</p>

<h3>PBR aur CEF</h3>
<p>Current IOS aur IOS-XE par PBR <b>CEF-switched</b> hai: route map fast forwarding path mein evaluate hota hai, aur debug output sach mein "FIB policy" kehta hai. Bahut purane releases PBR ko process-switch karte the, aur baad mein <code>ip route-cache policy</code> se fast-switched PBR dete the, jo aap purane configs mein abhi bhi dekhoge. Agar koi <code>no ip cef</code> se CEF band kar de, PBR dheeme switching par gir jaata hai aur CPU badhta hai. Catalyst switches par PBR hardware (TCAM) mein program hota hai; kuch platforms ko ek SDM template chahiye jo PBR entries reserve kare, aur unsupported actions CPU par punt hote hain. Ek aur baat: <code>show ip cef</code> aur <code>show ip route</code> sirf destination-based result dikhate hain; yeh kabhi nahi batate ki PBR kya karega.</p>

<h3>Baaki features ke beech PBR kahan hai</h3>
<p>Inside se outside jaate packet ke liye IOS pehle inbound ACL lagata hai, phir policy routing, phir routing decision, phir NAT inside-to-outside, phir outbound ACL. Do practical nateeje: inbound ACL jo packet deny kare woh PBR ke dekhne se pehle ruk jaata hai, aur NAT PBR ke <b>baad</b> hota hai, isliye NAT ko guest traffic ko exit interface ke basis par ISP2 ke address mein translate karna chahiye (<code>match interface</code> wala NAT route map).</p>

<h3>debug ip policy</h3>
<pre class="code">access-list 101 permit ip host 192.168.20.10 any
debug ip policy 101</pre>
<pre class="out">IP: s=192.168.20.10 (GigabitEthernet0/3), d=198.51.100.10, len 60, FIB policy match
<span class="hl">IP: s=192.168.20.10 (GigabitEthernet0/3), d=198.51.100.10, g=10.0.2.1, len 60, FIB policy routed</span>
IP: s=192.168.20.10 (GigabitEthernet0/3), d=192.168.10.53, len 60, FIB policy rejected(no match) - normal forwarding</pre>
<p>Debug ko ACL se limit karo, khaaskar busy router par; har packet ki ek line console ko doobo sakti hai.</p>

<div class="warn"><p><b>Common galti.</b> ISP2 ka apna interface 10.0.2.1 probe karna. Woh address tab tak jawab deta hai jab tak local link aur ISP2 ka router zinda hai, isliye ISP2 ka upstream mara hone par bhi track Up rehta hai. Provider ke peeche kuch probe karo, aur probe ko host route ya source interface se pin karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "PBR hosts ke liye chalta hai lekin router se ping use ignore karta hai" matlab local policy nahi hai. "Guests us dead ISP par atke hain jiska link up hai" matlab tracking nahi hai. Symptom ko missing feature se match karo.</p></div>

<div class="scn"><h4>Up, up aur black-holed</h4><p>Ek retail branch card-terminal traffic ko PBR se 4G router ke through bhejti thi. Ek raat 4G provider ka core gir gaya, lekin 4G router tak ka Ethernet link up raha. Terminals do ghante tak timeout hote rahe. Fix: head-office address tak IP SLA probe jo 4G router ke through pinned tha, <code>delay down 5 up 60</code> wala track object, aur route map mein <code>verify-availability</code>. Agle outage mein terminals lagbhag 15 second mein fibre link par laut gaye.</p><p><b>Seekh:</b> live link ka matlab live path nahi. Path ko track karo.</p></div>

<div class="iv"><p class="q">"Provider fail ho lekin link up rahe, tab PBR ko failover kaise karwaoge?"</p><p>Strong answer: provider ke peeche ke target tak IP SLA ICMP probe configure karo, us provider par pinned; use up aur down delays wale track object se jodo; aur <code>set ip next-hop verify-availability NH SEQ track N</code> use karo. Track down hone par PBR woh next hop skip karke agla ya normal routing use karta hai. <code>show track</code> aur <code>show route-map</code> mein [up]/[down] flag se verify karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>verify-availability ... track N</code> PBR ko asli path health follow karwata hai; provider ke peeche probe karo.</li>
<li>Track delays (<code>delay down/up</code>) providers ke beech flapping rokte hain.</li>
<li><code>ip local policy route-map</code> router ke apne traffic ko steer karta hai; iska ACL narrow rakho.</li>
<li>Modern PBR CEF-switched hai ("FIB policy"); CEF band karna performance girata hai.</li>
<li>Inbound ACL PBR se pehle chalta hai; NAT inside-to-outside uske baad.</li>
</ul></div>
`}};export{e as default};