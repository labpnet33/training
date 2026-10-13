var e={id:`pim-sparse-mode`,h:{en:`PIM sparse mode: RP, register, join/prune and SPT switchover`,hi:`PIM sparse mode: RP, register, join/prune aur SPT switchover`},body:{en:`
<p>A marriage bureau is a good picture of sparse mode. Families looking for a match register with the bureau; families offering a match register there too. Nobody broadcasts to the whole city. The bureau introduces them, and once they have met, the families talk to each other <b>directly</b>. In PIM sparse mode the bureau is the <b>Rendezvous Point (RP)</b>, the first introduction is the shared tree, and the direct conversation is the shortest-path tree.</p>

<h3>The pull model</h3>
<p>Sparse mode (PIM-SM) assumes receivers are <b>few and scattered</b>. Nothing is forwarded until a router explicitly <b>joins</b>. Every router must agree which RP serves each group; in our configuration lab that is R2's Loopback0, 2.2.2.2, set statically:</p>
<pre class="code"><span class="c">! R1, R2, R3 and R4</span>
ip multicast-routing
ip pim rp-address 2.2.2.2
interface GigabitEthernet0/1             <span class="c">! and every other interface, incl. R2 Loopback0</span>
 ip pim sparse-mode</pre>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="PIM sparse mode lab topology">
<rect x="20" y="215" width="100" height="36" rx="6" fill="#bbf7d0"/><text x="70" y="238" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.1.1.10</text>
<rect x="120" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="160" y="143" text-anchor="middle" class="svg-ink" font-size="13">R1 FHR</text>
<rect x="270" y="30" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">R2 = RP</text><text x="325" y="63" text-anchor="middle" class="svg-muted" font-size="11">Lo0 2.2.2.2</text>
<rect x="450" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="490" y="143" text-anchor="middle" class="svg-ink" font-size="13">R3 LHR</text>
<rect x="285" y="170" width="80" height="36" rx="6" fill="#bae6fd"/><text x="325" y="193" text-anchor="middle" class="svg-ink" font-size="13">R4 LHR</text>
<rect x="520" y="215" width="100" height="36" rx="6" fill="#fde68a"/><text x="570" y="238" text-anchor="middle" class="svg-ink" font-size="12">PC3 10.3.3.10</text>
<rect x="275" y="235" width="100" height="36" rx="6" fill="#fde68a"/><text x="325" y="258" text-anchor="middle" class="svg-ink" font-size="12">PC4 10.4.4.10</text>
<line x1="90" y1="215" x2="140" y2="156" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="130" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><text x="175" y="90" class="svg-muted" font-size="11">10.0.12.0/24</text>
<line x1="380" y1="60" x2="460" y2="120" stroke="#64748b" stroke-width="2"/><text x="425" y="80" class="svg-muted" font-size="11">10.0.23.0/24</text>
<line x1="325" y1="70" x2="325" y2="170" stroke="#64748b" stroke-width="2"/><text x="332" y="120" class="svg-muted" font-size="11">10.0.24.0/24</text>
<line x1="510" y1="156" x2="560" y2="215" stroke="#64748b" stroke-width="2"/><line x1="325" y1="206" x2="325" y2="235" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The configuration lab: the studio behind R1, the RP on R2, two classrooms behind R3 and R4, group 239.10.10.10.</p></div>

<h3>Step 1: receivers build the shared tree</h3>
<p>PC3 sends an IGMP report for 239.10.10.10. R3, the DR and last-hop router, creates <b>(*, 239.10.10.10)</b> with Gi0/0 in the outgoing list, does an RPF lookup toward the RP (2.2.2.2 via Gi0/2, neighbour 10.0.23.2) and sends a <b>PIM (*,G) Join</b> to R2. R2 is the RP, so the branch ends there. R4 does the same for PC4. The RP now holds a (*,G) with <b>both</b> branches in its outgoing list. Joins are refreshed every <b>60 s</b>; state expires after 210 s without a refresh.</p>

<h3>Step 2: the source registers</h3>
<p>PC1 starts sending to 239.10.10.10. R1, the first-hop DR, has never heard of this group. It creates <b>(10.1.1.10, 239.10.10.10)</b> and wraps each data packet inside a unicast <b>PIM Register</b> message sent to 2.2.2.2. The RP de-encapsulates the packets and forwards them down the shared tree, so receivers get traffic immediately.</p>

<h3>Step 3: the RP joins the source and sends Register-Stop</h3>
<p>Tunnelling every packet in unicast is inefficient, so the RP sends an <b>(S,G) Join</b> hop by hop toward 10.1.1.10. When the packets arrive natively on that tree, the RP sends a unicast <b>Register-Stop</b> to R1. R1 stops encapsulating and sends natively; it only sends occasional empty "null registers" to tell the RP the source is still alive.</p>

<h3>Step 4: SPT switchover</h3>
<p>As soon as the first packet reaches a last-hop router, IOS by default switches to the <b>shortest-path tree</b>: R3 sends an (S,G) Join straight toward the source and sets <b>J</b> on its (*,G). When traffic arrives on the SPT, the (S,G) gets the <b>T</b> flag. If the SPT and the shared tree leave through different interfaces, R3 sends an <b>(S,G,RPT) prune</b> toward the RP (the <b>R</b> flag, RP-bit) so it does not receive the same packets twice. The default threshold is 0 kbps (switch at once); <code>ip pim spt-threshold infinity</code> keeps receivers on the shared tree.</p>

<div class="eg"><p><b>Worked example: the finished tables.</b></p>
<pre class="out">R1# show ip mroute 239.10.10.10
(*, 239.10.10.10), 00:00:45/stopped, RP 2.2.2.2, flags: SPF
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.2
  Outgoing interface list: Null

<span class="hl">(10.1.1.10, 239.10.10.10), 00:00:45/00:02:14, flags: FT
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:45/00:02:44

R2# show ip mroute 239.10.10.10
<span class="hl">(*, 239.10.10.10), 00:05:12/00:03:17, RP 2.2.2.2, flags: S
  Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/3, Forward/Sparse, 00:05:02/00:03:17
    GigabitEthernet0/2, Forward/Sparse, 00:05:12/00:03:02

(10.1.1.10, 239.10.10.10), 00:00:41/00:02:48, flags: T
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:00:41/00:02:48
    GigabitEthernet0/3, Forward/Sparse, 00:00:41/00:03:17

R3# show ip mroute 239.10.10.10
(*, 239.10.10.10), 00:04:10/00:02:53, RP 2.2.2.2, flags: SJC
<span class="hl">  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:04:10/00:02:53

<span class="hl">(10.1.1.10, 239.10.10.10), 00:01:02/00:02:57, flags: T</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:02/00:02:57</pre>
<p>On R1 the (S,G) has <b>F</b> (register, this is the first hop) and RPF nbr 0.0.0.0 because the source is directly connected; its (*,G) is <b>P</b>runed with a Null list. On the RP the (*,G) has Incoming interface <b>Null</b>, correct because the RP is the root of the shared tree. On R3 the answer to lab task 5 is the RPF neighbour of the (*,G): <b>10.0.23.2</b>.</p></div>

<h3>Reading the flags</h3>
<table class="cmp">
<tr><th>Flag</th><th>Meaning</th><th>Flag</th><th>Meaning</th></tr>
<tr><td>S</td><td>Sparse mode</td><td>D</td><td>Dense mode</td></tr>
<tr><td>C</td><td>Connected: a local IGMP member</td><td>L</td><td>Local: the router itself joined (join-group)</td></tr>
<tr><td>P</td><td>Pruned: outgoing list is empty</td><td>R</td><td>RP-bit: (S,G) pruned off the shared tree</td></tr>
<tr><td>F</td><td>Register flag: first-hop router for this source</td><td>T</td><td>SPT-bit: traffic is arriving on the source tree</td></tr>
<tr><td>J</td><td>Join SPT: switch to the source tree</td><td>s / B</td><td>SSM group / Bidir group</td></tr>
</table>
<p>The two timers after each entry are <b>uptime / expires</b>. In the outgoing list, "Forward/Sparse" means the interface is forwarding in sparse mode.</p>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>ip pim sparse-mode</code> on the RP's loopback, or on the source and receiver LAN interfaces. The LAN interface is where IGMP runs and where the DR is elected; without PIM there, R1 never registers the source and R3 never learns about PC3.</p></div>

<div class="exam"><p><b>Exam trap.</b> Register and Register-Stop are <b>unicast</b> between the first-hop DR and the RP. Joins go hop by hop toward the RP ((*,G)) or source ((S,G)) using RPF. IOS switches to the SPT after the first packet (threshold 0). On the RP, the (*,G) incoming interface is Null.</p></div>

<div class="scn"><h4>Stream stops exactly at the RP</h4><p>After a firewall policy change, receivers saw no traffic, although <code>show ip mroute</code> on the RP showed the (*,G) with branches toward all classrooms. On the RP, the (S,G) entry never appeared, and the first-hop router's (S,G) kept the F flag with an empty outgoing list: it was still registering. <code>show ip pim rp mapping</code> was fine everywhere. The new firewall between the studio and the core dropped PIM Register packets (IP protocol 103 unicast). Permitting PIM to the RP address restored the flow.</p><p><b>Lesson:</b> if the RP has (*,G) but no (S,G), check the register path between the first-hop router and the RP.</p></div>

<div class="iv"><p class="q">"Walk me through PIM sparse mode from the first receiver to the SPT switchover."</p><p>Strong answer: the host reports with IGMP; the last-hop DR creates (*,G) and joins toward the RP along RPF. The source's DR registers the packets in unicast to the RP; the RP forwards them down the shared tree, joins (S,G) toward the source and sends Register-Stop. The last-hop router, after the first packet, joins the SPT toward the source (J then T flags) and sends an (S,G,RPT) prune if the paths differ. Mention <code>ip pim spt-threshold infinity</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM-SM is a pull model: nothing flows until a join; all routers must agree on the RP.</li>
<li>Last-hop DR sends (*,G) joins toward the RP; first-hop DR registers sources in unicast.</li>
<li>The RP joins (S,G) toward the source, then sends Register-Stop.</li>
<li>Last-hop routers switch to the SPT after the first packet (J and T flags); spt-threshold infinity prevents it.</li>
<li>Know the flags: S, C, L, P, R, F, T, J; the RP's (*,G) has incoming interface Null.</li>
</ul></div>
`,hi:`
<p>Sparse mode ki achhi tasveer ek marriage bureau hai. Rishta dhoondhne wale parivaar bureau mein register karte hain; rishta dene wale parivaar bhi wahin register karte hain. Koi poore shehar mein ailaan nahi karta. Bureau unki pehchaan karwata hai, aur mil lene ke baad parivaar <b>seedhe</b> baat karte hain. PIM sparse mode mein bureau <b>Rendezvous Point (RP)</b> hai, pehli pehchaan shared tree hai, aur seedhi baatcheet shortest-path tree hai.</p>

<h3>Pull model</h3>
<p>Sparse mode (PIM-SM) maanta hai ki receivers <b>kam aur bikhre hue</b> hain. Jab tak koi router explicitly <b>join</b> na kare, kuch forward nahi hota. Har router ko agree karna padta hai ki har group ka RP kaun hai; hamari configuration lab mein woh R2 ka Loopback0, 2.2.2.2 hai, statically set:</p>
<pre class="code"><span class="c">! R1, R2, R3 aur R4</span>
ip multicast-routing
ip pim rp-address 2.2.2.2
interface GigabitEthernet0/1             <span class="c">! aur har doosra interface, R2 Loopback0 bhi</span>
 ip pim sparse-mode</pre>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="PIM sparse mode lab topology">
<rect x="20" y="215" width="100" height="36" rx="6" fill="#bbf7d0"/><text x="70" y="238" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.1.1.10</text>
<rect x="120" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="160" y="143" text-anchor="middle" class="svg-ink" font-size="13">R1 FHR</text>
<rect x="270" y="30" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">R2 = RP</text><text x="325" y="63" text-anchor="middle" class="svg-muted" font-size="11">Lo0 2.2.2.2</text>
<rect x="450" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="490" y="143" text-anchor="middle" class="svg-ink" font-size="13">R3 LHR</text>
<rect x="285" y="170" width="80" height="36" rx="6" fill="#bae6fd"/><text x="325" y="193" text-anchor="middle" class="svg-ink" font-size="13">R4 LHR</text>
<rect x="520" y="215" width="100" height="36" rx="6" fill="#fde68a"/><text x="570" y="238" text-anchor="middle" class="svg-ink" font-size="12">PC3 10.3.3.10</text>
<rect x="275" y="235" width="100" height="36" rx="6" fill="#fde68a"/><text x="325" y="258" text-anchor="middle" class="svg-ink" font-size="12">PC4 10.4.4.10</text>
<line x1="90" y1="215" x2="140" y2="156" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="130" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><text x="175" y="90" class="svg-muted" font-size="11">10.0.12.0/24</text>
<line x1="380" y1="60" x2="460" y2="120" stroke="#64748b" stroke-width="2"/><text x="425" y="80" class="svg-muted" font-size="11">10.0.23.0/24</text>
<line x1="325" y1="70" x2="325" y2="170" stroke="#64748b" stroke-width="2"/><text x="332" y="120" class="svg-muted" font-size="11">10.0.24.0/24</text>
<line x1="510" y1="156" x2="560" y2="215" stroke="#64748b" stroke-width="2"/><line x1="325" y1="206" x2="325" y2="235" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Configuration lab: R1 ke peeche studio, R2 par RP, R3 aur R4 ke peeche do classrooms, group 239.10.10.10.</p></div>

<h3>Step 1: receivers shared tree banate hain</h3>
<p>PC3 239.10.10.10 ke liye IGMP report bhejta hai. R3, jo DR aur last-hop router hai, Gi0/0 ko outgoing list mein rakh kar <b>(*, 239.10.10.10)</b> banata hai, RP ki taraf RPF lookup karta hai (2.2.2.2 Gi0/2 se, neighbour 10.0.23.2) aur R2 ko <b>PIM (*,G) Join</b> bhejta hai. R2 RP hai, isliye shaakh wahin khatam hoti hai. R4 PC4 ke liye yahi karta hai. Ab RP ke paas (*,G) hai jiski outgoing list mein <b>dono</b> shaakhein hain. Joins har <b>60 s</b> refresh hote hain; refresh ke bina state 210 s mein expire hoti hai.</p>

<h3>Step 2: source register karta hai</h3>
<p>PC1 239.10.10.10 par bhejna shuru karta hai. R1, first-hop DR, ne yeh group kabhi nahi suna. Woh <b>(10.1.1.10, 239.10.10.10)</b> banata hai aur har data packet ko unicast <b>PIM Register</b> message mein lapet kar 2.2.2.2 ko bhejta hai. RP packets de-encapsulate karke shared tree par neeche forward karta hai, isliye receivers ko turant traffic milta hai.</p>

<h3>Step 3: RP source join karta hai aur Register-Stop bhejta hai</h3>
<p>Har packet ko unicast mein tunnel karna inefficient hai, isliye RP 10.1.1.10 ki taraf hop by hop <b>(S,G) Join</b> bhejta hai. Jab packets us tree par natively aane lagte hain, RP R1 ko unicast <b>Register-Stop</b> bhejta hai. R1 encapsulate karna band karke natively bhejta hai; bas kabhi kabhi khaali "null registers" bhejta hai yeh batane ke liye ki source ab bhi zinda hai.</p>

<h3>Step 4: SPT switchover</h3>
<p>Jaise hi pehla packet last-hop router tak pahunchta hai, IOS default mein <b>shortest-path tree</b> par switch karta hai: R3 seedha source ki taraf (S,G) Join bhejta hai aur apne (*,G) par <b>J</b> set karta hai. Jab traffic SPT par aane lagta hai, (S,G) ko <b>T</b> flag milta hai. Agar SPT aur shared tree alag interfaces se nikalte hain, R3 RP ki taraf <b>(S,G,RPT) prune</b> bhejta hai (<b>R</b> flag, RP-bit) taaki same packets do baar na milein. Default threshold 0 kbps hai (turant switch); <code>ip pim spt-threshold infinity</code> receivers ko shared tree par hi rakhta hai.</p>

<div class="eg"><p><b>Worked example: tayyar tables.</b></p>
<pre class="out">R1# show ip mroute 239.10.10.10
(*, 239.10.10.10), 00:00:45/stopped, RP 2.2.2.2, flags: SPF
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.2
  Outgoing interface list: Null

<span class="hl">(10.1.1.10, 239.10.10.10), 00:00:45/00:02:14, flags: FT
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:45/00:02:44

R2# show ip mroute 239.10.10.10
<span class="hl">(*, 239.10.10.10), 00:05:12/00:03:17, RP 2.2.2.2, flags: S
  Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/3, Forward/Sparse, 00:05:02/00:03:17
    GigabitEthernet0/2, Forward/Sparse, 00:05:12/00:03:02

(10.1.1.10, 239.10.10.10), 00:00:41/00:02:48, flags: T
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:00:41/00:02:48
    GigabitEthernet0/3, Forward/Sparse, 00:00:41/00:03:17

R3# show ip mroute 239.10.10.10
(*, 239.10.10.10), 00:04:10/00:02:53, RP 2.2.2.2, flags: SJC
<span class="hl">  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:04:10/00:02:53

<span class="hl">(10.1.1.10, 239.10.10.10), 00:01:02/00:02:57, flags: T</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:02/00:02:57</pre>
<p>R1 par (S,G) mein <b>F</b> hai (register, yeh first hop hai) aur RPF nbr 0.0.0.0 kyunki source directly connected hai; uska (*,G) Null list ke saath <b>P</b>runed hai. RP par (*,G) ka Incoming interface <b>Null</b> hai, jo sahi hai kyunki RP shared tree ka root hai. R3 par lab task 5 ka jawab (*,G) ka RPF neighbour hai: <b>10.0.23.2</b>.</p></div>

<h3>Flags padhna</h3>
<table class="cmp">
<tr><th>Flag</th><th>Matlab</th><th>Flag</th><th>Matlab</th></tr>
<tr><td>S</td><td>Sparse mode</td><td>D</td><td>Dense mode</td></tr>
<tr><td>C</td><td>Connected: local IGMP member</td><td>L</td><td>Local: router ne khud join kiya (join-group)</td></tr>
<tr><td>P</td><td>Pruned: outgoing list khaali</td><td>R</td><td>RP-bit: (S,G) shared tree se prune</td></tr>
<tr><td>F</td><td>Register flag: is source ka first-hop router</td><td>T</td><td>SPT-bit: traffic source tree par aa raha hai</td></tr>
<tr><td>J</td><td>Join SPT: source tree par switch</td><td>s / B</td><td>SSM group / Bidir group</td></tr>
</table>
<p>Har entry ke baad do timers <b>uptime / expires</b> hain. Outgoing list mein "Forward/Sparse" matlab interface sparse mode mein forward kar raha hai.</p>

<div class="warn"><p><b>Common galti.</b> RP ke loopback par, ya source aur receiver LAN interfaces par <code>ip pim sparse-mode</code> bhool jaana. LAN interface par hi IGMP chalta hai aur DR elect hota hai; wahan PIM ke bina R1 kabhi source register nahi karta aur R3 ko kabhi PC3 ka pata nahi chalta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Register aur Register-Stop first-hop DR aur RP ke beech <b>unicast</b> hote hain. Joins RPF use karke RP ((*,G)) ya source ((S,G)) ki taraf hop by hop jaate hain. IOS pehle packet ke baad SPT par switch karta hai (threshold 0). RP par (*,G) ka incoming interface Null hota hai.</p></div>

<div class="scn"><h4>Stream theek RP par ruk jaata hai</h4><p>Firewall policy change ke baad receivers ko koi traffic nahi dikha, jabki RP par <code>show ip mroute</code> saare classrooms ki taraf shaakhon wala (*,G) dikha raha tha. RP par (S,G) entry kabhi nahi aayi, aur first-hop router ka (S,G) khaali outgoing list ke saath F flag rakhe raha: woh ab bhi register kar raha tha. <code>show ip pim rp mapping</code> har jagah theek tha. Studio aur core ke beech naya firewall PIM Register packets (IP protocol 103 unicast) drop kar raha tha. RP address tak PIM permit karte hi flow wapas aa gaya.</p><p><b>Seekh:</b> agar RP ke paas (*,G) hai par (S,G) nahi, to first-hop router aur RP ke beech register path check karo.</p></div>

<div class="iv"><p class="q">"PIM sparse mode ko pehle receiver se SPT switchover tak samjhao."</p><p>Strong answer: host IGMP se report karta hai; last-hop DR (*,G) banata hai aur RPF ke saath RP ki taraf join karta hai. Source ka DR packets ko unicast mein RP ko register karta hai; RP unhe shared tree par neeche forward karta hai, source ki taraf (S,G) join karta hai aur Register-Stop bhejta hai. Last-hop router pehle packet ke baad source ki taraf SPT join karta hai (J phir T flags) aur paths alag hon to (S,G,RPT) prune bhejta hai. <code>ip pim spt-threshold infinity</code> ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM-SM pull model hai: join ke bina kuch nahi behta; saare routers RP par agree karein.</li>
<li>Last-hop DR RP ki taraf (*,G) joins bhejta hai; first-hop DR sources ko unicast mein register karta hai.</li>
<li>RP source ki taraf (S,G) join karta hai, phir Register-Stop bhejta hai.</li>
<li>Last-hop routers pehle packet ke baad SPT par switch karte hain (J aur T flags); spt-threshold infinity ise rokta hai.</li>
<li>Flags jaano: S, C, L, P, R, F, T, J; RP ke (*,G) ka incoming interface Null hota hai.</li>
</ul></div>
`}};export{e as default};