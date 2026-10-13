var e={id:`lab-stream`,h:{en:`Warm-up lab walkthrough: your first multicast stream`,hi:`Warm-up lab walkthrough: aapki pehli multicast stream`},body:{en:`
<p>This chapter walks you through the lab <b>mq-start-first-stream</b>. Open the lab, read the brief, and follow along. Try each step yourself before reading the commands; the hints in the lab give the same ideas.</p>
<p><b>The work order.</b> Sahyadri University wants to broadcast a live lecture from the Pune studio to two classrooms without sending a separate copy per student. Three routers already run OSPF, so every router can reach every address. You must turn on multicast routing and PIM sparse mode, make R2 the rendezvous point, let two classroom PCs join group 239.20.1.1, start the stream and prove both classrooms receive it.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab topology with addresses">
<rect x="10" y="120" width="100" height="40" rx="8" fill="#fde68a"/><text x="60" y="144" text-anchor="middle" class="svg-ink" font-size="12">PC-STUDIO</text><text x="60" y="176" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.10</text>
<rect x="140" y="80" width="60" height="40" rx="8" fill="#bae6fd"/><text x="170" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="280" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">Lo0 2.2.2.2</text>
<rect x="440" y="80" width="60" height="40" rx="8" fill="#bae6fd"/><text x="470" y="105" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="275" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-B</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="11">10.2.2.10</text>
<rect x="530" y="120" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="580" y="144" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-A</text><text x="580" y="176" text-anchor="middle" class="svg-muted" font-size="11">10.3.3.10</text>
<line x1="110" y1="135" x2="150" y2="118" stroke="#64748b" stroke-width="2"/><line x1="200" y1="95" x2="280" y2="70" stroke="#64748b" stroke-width="2"/><line x1="360" y1="70" x2="440" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="90" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="500" y1="110" x2="540" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="238" y="68" class="svg-muted" font-size="11">g0/1 .1 - g0/1 .2</text><text x="368" y="68" class="svg-muted" font-size="11">g0/2 .2 - g0/2 .3</text>
</svg><p class="cap">R1 g0/0 10.1.1.1, R1-R2 10.0.12.0/24, R2-R3 10.0.23.0/24, R2 g0/0 10.2.2.1, R3 g0/0 10.3.3.1.</p></div>

<h3>Task 1: multicast routing and PIM on every interface</h3>
<p>Two things are needed. The global command <code>ip multicast-routing</code> turns the multicast forwarding engine on. Then every interface that should take part gets <code>ip pim sparse-mode</code>. Include the LAN interfaces facing the PCs, and R2 Loopback0, because R2 will be the RP and PIM must be enabled on the interface that owns the RP address.</p>
<pre class="code"><span class="c">! on R1 (repeat the pattern on R2 and R3)</span>
ip multicast-routing
interface GigabitEthernet0/0
 ip pim sparse-mode
interface GigabitEthernet0/1
 ip pim sparse-mode
<span class="c">! on R2 also</span>
interface Loopback0
 ip pim sparse-mode</pre>
<p>Check it. R2 should see two neighbours, R1 and R3, each with version v2:</p>
<pre class="out">R2# show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
10.0.12.1         GigabitEthernet0/1       00:01:20/00:01:25 v2    1 / S P G
<span class="hl">10.0.23.3         GigabitEthernet0/2       00:01:08/00:01:37 v2    1 / DR S P G</span></pre>
<p>PIM routers say hello to each other every 30 seconds and keep a neighbour table. "DR" marks the Designated Router elected on a link; on a link with only two routers one of them wins. We study this in mq-pim.</p>

<h3>Task 2: tell everyone where the RP is</h3>
<p>Sparse mode needs a meeting point, and every router must agree on it. The simplest way is a <b>static RP</b>: one global command on each router.</p>
<pre class="code">ip pim rp-address 2.2.2.2</pre>
<pre class="out">R2# show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    <span class="hl">RP: 2.2.2.2 (?)</span></pre>
<p>"224.0.0.0/4, Static" means: for any multicast group, use 2.2.2.2 as the RP, and this knowledge was typed in by hand. Later modules show how to map different groups to different RPs and how routers can learn the RP automatically.</p>

<div class="warn"><p><b>Common mistake.</b> Configuring the RP on only some routers. Every router must hold the same RP address, otherwise a join from one router goes to a different meeting point than the source's registration and the stream never connects.</p></div>

<h3>Task 3: the receivers join</h3>
<p>On each classroom PC type <code>join 239.20.1.1</code>. Then look at the routers next to them:</p>
<pre class="out">R3# show ip igmp groups
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
<span class="hl">239.20.1.1       GigabitEthernet0/0       00:00:51  00:02:09  10.3.3.10</span></pre>
<p>R3 shows PC-CLASS-A (10.3.3.10) and R2 shows PC-CLASS-B (10.2.2.10) on its Gi0/0. The task also needs a (*,G) entry on R2 (the RP). Each last-hop router has sent a PIM join towards the RP, so R2 now lists both Gi0/0 and Gi0/2 in the outgoing interface list.</p>

<h3>Task 4: start the stream</h3>
<p>On PC-STUDIO type <code>mcast 239.20.1.1 10</code> to send ten packets. Then on each classroom PC type <code>show mcast</code>:</p>
<pre class="out">PC-CLASS-A# show mcast
Group            Source filter        Joined     Packets received
239.20.1.1       any source           00:00:51   10</pre>
<p>Ten packets sent, ten received. Both classrooms get the stream, and the studio link carried the packets just once.</p>

<h3>Task 5: read the mroute table on R3</h3>
<p>The last task asks which interface R3 uses as the incoming interface for the (*,G) entry. Run the show command and read the line under the (*, 239.20.1.1) entry:</p>
<pre class="out">R3# show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:51/00:02:09, RP 2.2.2.2, flags: SJC
  <span class="hl">Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:51/00:02:09

(10.1.1.10, 239.20.1.1), 00:00:24/00:02:36, flags: T
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>The answer is GigabitEthernet0/2: that is the interface pointing back towards the RP (R2 at 10.0.23.2). The flags tell the story: <b>S</b> sparse mode, <b>J</b> the router joined the shortest-path tree, <b>C</b> a directly connected member exists. The second entry, (10.1.1.10, 239.20.1.1), has flag <b>T</b>: traffic from the studio is now flowing over the source tree.</p>

<div class="eg"><p><b>Worked example, if something is wrong.</b> Suppose task 4 stays red. Walk backwards: does PC-CLASS-A show the group in <code>show mcast</code>? Does R3 list it in <code>show ip igmp groups</code>? Does R3 have an RP in <code>show ip pim rp mapping</code>? Does R2 show two neighbours? Each "no" points to one missing command from tasks 1 to 3. This backward walk, receiver first, is the method you will use in every multicast troubleshooting job.</p></div>

<div class="exam"><p><b>Exam trap.</b> The RP's own (*,G) entry shows Incoming interface Null and RPF nbr 0.0.0.0, because the RP is the root of the shared tree and has nowhere further to look. This is normal, not a fault.</p></div>

<div class="scn"><h4>Half the classrooms worked</h4><p>During a rollout, three of five classrooms received the lecture and two did not. All five routers had the same configuration except one: the router in front of the two silent classrooms had <code>ip pim rp-address 2.2.2.3</code>, a typing error. <code>show ip pim rp mapping</code> on that router showed an RP that no one else used. Correcting the address fixed both classrooms at once.</p><p><b>Lesson:</b> compare <code>show ip pim rp mapping</code> on every router. All must show the same RP for the group.</p></div>

<div class="iv"><p class="q">"You enabled PIM everywhere and added a static RP, but the receiver gets nothing. What do you check?"</p><p>Strong answer: start at the receiver side: IGMP group on the last-hop router, then PIM neighbours, then the RP mapping on each router, then the (*,G) and (S,G) entries and the RPF neighbour, and finally whether the source is actually sending. Mention that an interface without PIM breaks the tree.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast needs ip multicast-routing globally and ip pim sparse-mode on every interface in the path.</li>
<li>A static RP is one command, ip pim rp-address, and it must match on every router.</li>
<li>IGMP groups show members; the mroute table shows the tree.</li>
<li>S, J, C and T flags describe sparse mode, joined SPT, connected member and source-tree traffic.</li>
<li>Troubleshoot from the receiver back to the source.</li>
</ul></div>
`,hi:`
<p>Yeh chapter aapko lab <b>mq-start-first-stream</b> walk through karata hai. Lab kholo, brief padho, aur saath saath chalo. Commands padhne se pehle har step khud try karo; lab ke hints wahi ideas dete hain.</p>
<p><b>Work order.</b> Sahyadri University Pune studio se do classrooms tak live lecture broadcast karna chahti hai, har student ke liye alag copy bheje bina. Teen routers par OSPF pehle se chal raha hai, isliye har router har address tak pahunch sakta hai. Aapko multicast routing aur PIM sparse mode on karna hai, R2 ko rendezvous point banana hai, do classroom PCs ko group 239.20.1.1 join karwana hai, stream shuru karni hai aur prove karna hai ki dono classrooms ko mil rahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Addresses ke saath lab topology">
<rect x="10" y="120" width="100" height="40" rx="8" fill="#fde68a"/><text x="60" y="144" text-anchor="middle" class="svg-ink" font-size="12">PC-STUDIO</text><text x="60" y="176" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.10</text>
<rect x="140" y="80" width="60" height="40" rx="8" fill="#bae6fd"/><text x="170" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="280" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">Lo0 2.2.2.2</text>
<rect x="440" y="80" width="60" height="40" rx="8" fill="#bae6fd"/><text x="470" y="105" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="275" y="150" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-B</text><text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="11">10.2.2.10</text>
<rect x="530" y="120" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="580" y="144" text-anchor="middle" class="svg-ink" font-size="12">PC-CLASS-A</text><text x="580" y="176" text-anchor="middle" class="svg-muted" font-size="11">10.3.3.10</text>
<line x1="110" y1="135" x2="150" y2="118" stroke="#64748b" stroke-width="2"/><line x1="200" y1="95" x2="280" y2="70" stroke="#64748b" stroke-width="2"/><line x1="360" y1="70" x2="440" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="90" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="500" y1="110" x2="540" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="238" y="68" class="svg-muted" font-size="11">g0/1 .1 - g0/1 .2</text><text x="368" y="68" class="svg-muted" font-size="11">g0/2 .2 - g0/2 .3</text>
</svg><p class="cap">R1 g0/0 10.1.1.1, R1-R2 10.0.12.0/24, R2-R3 10.0.23.0/24, R2 g0/0 10.2.2.1, R3 g0/0 10.3.3.1.</p></div>

<h3>Task 1: har interface par multicast routing aur PIM</h3>
<p>Do cheezein chahiye. Global command <code>ip multicast-routing</code> multicast forwarding engine on karta hai. Phir har interface jo hissa lega use <code>ip pim sparse-mode</code> milta hai. PCs ki taraf wale LAN interfaces shamil karo, aur R2 Loopback0 bhi, kyunki R2 RP banega aur PIM us interface par on hona chahiye jiske paas RP address hai.</p>
<pre class="code"><span class="c">! R1 par (yahi pattern R2 aur R3 par dohrao)</span>
ip multicast-routing
interface GigabitEthernet0/0
 ip pim sparse-mode
interface GigabitEthernet0/1
 ip pim sparse-mode
<span class="c">! R2 par ye bhi</span>
interface Loopback0
 ip pim sparse-mode</pre>
<p>Check karo. R2 ko do neighbours dikhne chahiye, R1 aur R3, dono version v2 ke saath:</p>
<pre class="out">R2# show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
10.0.12.1         GigabitEthernet0/1       00:01:20/00:01:25 v2    1 / S P G
<span class="hl">10.0.23.3         GigabitEthernet0/2       00:01:08/00:01:37 v2    1 / DR S P G</span></pre>
<p>PIM routers har 30 second mein ek dusre ko hello bolte hain aur neighbour table rakhte hain. "DR" link par elect hue Designated Router ko mark karta hai; sirf do routers wali link par ek jeet jaata hai. Hum ise mq-pim mein padhenge.</p>

<h3>Task 2: sabko batao RP kahan hai</h3>
<p>Sparse mode ko meeting point chahiye, aur har router ko us par agree karna padta hai. Sabse aasan tareeka <b>static RP</b> hai: har router par ek global command.</p>
<pre class="code">ip pim rp-address 2.2.2.2</pre>
<pre class="out">R2# show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    <span class="hl">RP: 2.2.2.2 (?)</span></pre>
<p>"224.0.0.0/4, Static" ka matlab: kisi bhi multicast group ke liye 2.2.2.2 ko RP use karo, aur yeh jaankari haath se type ki gayi. Baad ke modules dikhate hain ki alag groups ko alag RPs se kaise map karein aur routers RP ko automatically kaise seekh sakte hain.</p>

<div class="warn"><p><b>Common galti.</b> RP sirf kuch routers par configure karna. Har router mein same RP address hona chahiye, warna ek router ka join source ki registration se alag meeting point par jaata hai aur stream kabhi connect nahi hoti.</p></div>

<h3>Task 3: receivers join karte hain</h3>
<p>Har classroom PC par <code>join 239.20.1.1</code> type karo. Phir unke paas wale routers dekho:</p>
<pre class="out">R3# show ip igmp groups
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
<span class="hl">239.20.1.1       GigabitEthernet0/0       00:00:51  00:02:09  10.3.3.10</span></pre>
<p>R3 PC-CLASS-A (10.3.3.10) dikhata hai aur R2 apne Gi0/0 par PC-CLASS-B (10.2.2.10). Task ko R2 (RP) par (*,G) entry bhi chahiye. Har last-hop router ne RP ki taraf PIM join bheja hai, isliye R2 ab outgoing interface list mein Gi0/0 aur Gi0/2 dono dikhata hai.</p>

<h3>Task 4: stream shuru karo</h3>
<p>PC-STUDIO par <code>mcast 239.20.1.1 10</code> type karo, das packets bhejne ke liye. Phir har classroom PC par <code>show mcast</code>:</p>
<pre class="out">PC-CLASS-A# show mcast
Group            Source filter        Joined     Packets received
239.20.1.1       any source           00:00:51   10</pre>
<p>Das packets bheje, das mile. Dono classrooms ko stream milti hai, aur studio link ne packets sirf ek baar carry kiye.</p>

<h3>Task 5: R3 par mroute table padho</h3>
<p>Aakhri task poochta hai ki R3 (*,G) entry ke liye kaunsa interface incoming interface use karta hai. Show command chalao aur (*, 239.20.1.1) entry ke neeche wali line padho:</p>
<pre class="out">R3# show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:51/00:02:09, RP 2.2.2.2, flags: SJC
  <span class="hl">Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:51/00:02:09

(10.1.1.10, 239.20.1.1), 00:00:24/00:02:36, flags: T
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:03:06</pre>
<p>Jawab GigabitEthernet0/2 hai: yeh woh interface hai jo RP (10.0.23.2 par R2) ki taraf wapas point karta hai. Flags kahani batate hain: <b>S</b> sparse mode, <b>J</b> router ne shortest-path tree join kiya, <b>C</b> directly connected member hai. Doosri entry, (10.1.1.10, 239.20.1.1), mein flag <b>T</b> hai: studio ka traffic ab source tree par chal raha hai.</p>

<div class="eg"><p><b>Worked example, agar kuch galat ho.</b> Maan lo task 4 red rahta hai. Peeche ki taraf chalo: kya PC-CLASS-A <code>show mcast</code> mein group dikhata hai? Kya R3 use <code>show ip igmp groups</code> mein list karta hai? Kya R3 ke paas <code>show ip pim rp mapping</code> mein RP hai? Kya R2 do neighbours dikhata hai? Har "nahi" tasks 1 se 3 ke ek missing command ki taraf ishara karta hai. Yeh peeche ki taraf chalna, pehle receiver, woh method hai jo aap har multicast troubleshooting job mein use karoge.</p></div>

<div class="exam"><p><b>Exam trap.</b> RP ki apni (*,G) entry mein Incoming interface Null aur RPF nbr 0.0.0.0 dikhta hai, kyunki RP shared tree ka root hai aur aage dekhne ko kuch nahi. Yeh normal hai, fault nahi.</p></div>

<div class="scn"><h4>Aadhi classrooms chalin</h4><p>Rollout ke dauraan paanch mein se teen classrooms ko lecture mila aur do ko nahi. Paanchon routers ki configuration same thi sivaay ek ke: do silent classrooms ke aage wale router par <code>ip pim rp-address 2.2.2.3</code> tha, typing error. Us router par <code>show ip pim rp mapping</code> ne ek RP dikhaya jo koi aur use nahi karta tha. Address sahi karte hi dono classrooms ek saath theek ho gayin.</p><p><b>Seekh:</b> har router par <code>show ip pim rp mapping</code> compare karo. Sab ko group ke liye same RP dikhana chahiye.</p></div>

<div class="iv"><p class="q">"Aapne har jagah PIM on kiya aur static RP add kiya, lekin receiver ko kuch nahi mil raha. Aap kya check karte ho?"</p><p>Strong answer: receiver side se shuru karo: last-hop router par IGMP group, phir PIM neighbours, phir har router par RP mapping, phir (*,G) aur (S,G) entries aur RPF neighbour, aur aakhir mein ki source sach mein bhej raha hai ya nahi. Batao ki PIM ke bina interface tree ko tod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast ko global mein ip multicast-routing aur path ke har interface par ip pim sparse-mode chahiye.</li>
<li>Static RP ek command hai, ip pim rp-address, aur har router par match karna chahiye.</li>
<li>IGMP groups members dikhate hain; mroute table tree dikhati hai.</li>
<li>S, J, C aur T flags sparse mode, joined SPT, connected member aur source-tree traffic batate hain.</li>
<li>Receiver se source ki taraf troubleshoot karo.</li>
</ul></div>
`}};export{e as default};