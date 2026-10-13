var e={id:`join-prune-flags-spt`,h:{en:`Join and prune, state timers, flags and the SPT threshold`,hi:`Join aur prune, state timers, flags aur SPT threshold`},body:{en:`
<p>A multicast tree is not built once and forgotten. Every branch is kept alive by messages that repeat, and removed when they stop. This chapter explains the timers, teaches you to read every flag on a <code>show ip mroute</code> line, and shows how to control the one big decision a last-hop router makes: stay on the shared tree or move to the shortest path.</p>

<h3>Join/Prune messages and state timers</h3>
<p>PIM is a <b>soft-state</b> protocol, like a shop that keeps a table reserved only while someone keeps phoning to confirm it. A downstream router refreshes its joins to the upstream neighbour <b>every 60 seconds</b>, and each Join/Prune message carries a <b>holdtime of 210 seconds</b> (3.5 times the interval). If the upstream router hears no refresh within the holdtime, it removes that interface from its outgoing list. Prunes are sent when a branch has no more interest: the last receiver left (IGMP leave or timeout), or a router has just switched to a better path and no longer wants the stream from the old one.</p>
<p>Timers you will see in the mroute table:</p>
<ul>
<li><b>(*,G) entry:</b> stays while joins keep arriving. At the RP it shows <b>stopped</b> because the RP keeps the entry as long as any interface remains in the list.</li>
<li><b>(S,G) entry:</b> kept alive by data. It expires about <b>3 minutes</b> after the last packet, which is why stopping a stream makes (S,G) disappear a while later.</li>
<li><b>Outgoing interface entry:</b> each OIL line has its own uptime and expiry; the expiry is refreshed by joins from downstream.</li>
</ul>

<h3>Reading the flags</h3>
<p>The legend printed at the top of every <code>show ip mroute</code> lists the flags. These are the ones you will use daily:</p>
<table class="cmp"><tr><th>Flag</th><th>Meaning</th><th>Where you see it</th></tr>
<tr><td><b>S</b></td><td>Sparse mode group</td><td>Every (*,G) and most (S,G) in sparse mode</td></tr>
<tr><td><b>C</b></td><td>Connected: a member is on a directly attached LAN</td><td>Last-hop router</td></tr>
<tr><td><b>F</b></td><td>Register flag: this router is registering the source to the RP</td><td>Source's DR</td></tr>
<tr><td><b>T</b></td><td>SPT bit set: the stream arrives on the shortest-path interface</td><td>(S,G) after switchover</td></tr>
<tr><td><b>J</b></td><td>Join SPT: the router switched (or is switching) to the source tree</td><td>(*,G) on a last-hop router</td></tr>
<tr><td><b>P</b></td><td>Pruned: the outgoing list is empty, nothing forwards</td><td>An entry nobody listens to</td></tr>
<tr><td><b>R</b></td><td>RP-bit: the entry is on the shared tree for that source</td><td>(S,G) pruned from or using the RPT</td></tr>
<tr><td><b>s</b></td><td>SSM group (chapter 6)</td><td>232/8 entries</td></tr>
<tr><td><b>I</b></td><td>Received a source-specific host report (IGMPv3)</td><td>SSM last-hop router</td></tr></table>
<p>Each entry block has the same shape: a header with the key, the age, the expiry, the RP and the flags; then the <b>incoming interface</b> and <b>RPF neighbour</b>; then the <b>outgoing interface list</b>, each line showing the interface, <b>Forward/Sparse</b> and its timers. An outgoing list of <b>Null</b> means that no interface wants the traffic, so nothing is forwarded.</p>
<pre class="out">R2#show ip mroute 239.40.0.1
(*, 239.40.0.1), 00:01:03/stopped, RP 2.2.2.2, flags: S
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:01:03/00:03:27

(10.40.1.10, 239.40.0.1), 00:00:48/00:02:12, flags: <span class="hl">PT</span>
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list: <span class="hl">Null</span></pre>
<p>On R2 the (S,G) entry is flagged <b>P</b> and its OIL is Null. The shared tree still lists Gi0/2 (the receiver router R3 has the (*,G) there), but R3 switched to the shortest path through the direct link to R1, so it pruned the source off the shared tree and R2 has nothing to forward for that source.</p>

<h3>The SPT threshold: stay or switch</h3>
<p>By default a last-hop router switches to the source tree the moment the first packet arrives. The setting is the <b>SPT threshold</b>. Sometimes you do not want that: a small group with low bandwidth does not justify extra (S,G) state in many routers, or you want every stream to pass through the RP where it can be monitored or filtered. The command is:</p>
<pre class="code"><span class="c">! stay on the shared tree for every group, on this router</span>
ip pim spt-threshold infinity

<span class="c">! back to the default: switch on the first packet</span>
no ip pim spt-threshold</pre>
<p>Two points make the difference between a pass and a fail on exam day. First, the setting lives on the <b>last-hop router</b> (the one with the receivers), not on the RP or on the source's router. Second, in real IOS XE you can limit it to some groups with <code>ip pim spt-threshold infinity group-list ACL</code> or switch only above a kilobit rate; the lab for this module uses the global form.</p>
<p>In the second lab, R3 is the DR on the depot LAN and has a direct link to R1. Before the change, R3 shows the usual switched picture. After <code>ip pim spt-threshold infinity</code> and a restart of the stream, the (S,G) entry disappears and everything arrives on the shared-tree interface:</p>
<pre class="out">R3#show ip mroute 239.40.0.1
(*, 239.40.0.1), 00:00:51/00:02:09, RP 2.2.2.2, flags: <span class="hl">SJC</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:51/00:02:09
(10.40.1.10, 239.40.0.1), 00:00:36/00:02:24, flags: <span class="hl">T</span>
  Incoming interface: <span class="hl">GigabitEthernet0/1</span>, RPF nbr 10.0.13.1

<span class="c">! after ip pim spt-threshold infinity, clear ip mroute * and a new stream:</span>
(*, 239.40.0.1), 00:00:36/00:02:24, RP 2.2.2.2, flags: <span class="hl">SC</span>
  Incoming interface: <span class="hl">GigabitEthernet0/2</span>, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:36/00:02:24</pre>
<p>The J flag has gone and so has the (S,G) entry: R3 takes the longer route through the RP and the receivers are still served.</p>

<div class="eg"><p><b>Worked example.</b> Zenith Logistics has 120 depots, each with one receiver, and a 200 kbps bulletin. With the default, 120 last-hop routers each create an (S,G) entry and send a source-tree join: roughly 120 extra entries in the core and 120 extra joins refreshed every minute. With <code>spt-threshold infinity</code> on the depots, the core holds one (*,G) and a few (S,G) entries at the RP only. The price is a longer path for some depots, which is acceptable for 200 kbps.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting <code>spt-threshold infinity</code> on the RP and expecting receivers to stay on the shared tree: the threshold is read on the last-hop router. (2) Reading the T flag as "traffic is flowing". T means the stream arrives on the shortest-path interface. (3) Expecting changes to appear at once: old (S,G) state lingers until it times out, so clear the state or restart the stream when testing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Join/Prune refresh is 60 seconds with a 210 second holdtime. The PIM Hello interval is 30 seconds with a 105 second holdtime. Do not mix the two pairs of numbers.</p></div>

<div class="scn"><h4>Why the core had 3,000 (S,G) entries</h4><p>A bank's multicast market-data design had 25 feeds and 120 branch routers. The core routers carried more than 3,000 (S,G) entries and the CPU on two old routers was above 80 percent. Most feeds were tiny and branches did not care about the extra latency. The team enabled <code>ip pim spt-threshold infinity</code> on the branch routers. The (S,G) count fell to under 100, and the CPU dropped to 20 percent. Latency-critical feeds stayed on a different branch set that kept the default.</p><p><b>Lesson:</b> SPT threshold is a state-scaling tool, not just a path tool.</p></div>

<div class="iv"><p class="q">"What does the T flag mean, and when would you set spt-threshold to infinity?"</p><p>Strong answer: T (SPT bit) is set on an (S,G) entry once the stream arrives on the interface of the shortest path toward the source. Infinity keeps a last-hop router on the shared tree: fewer (S,G) entries and one control point at the RP, at the cost of a possibly longer path. Say that the setting belongs on the last-hop router and that you would verify with <code>show ip mroute</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Joins are refreshed every 60 s (holdtime 210 s); (S,G) lives about 3 minutes after the last packet.</li>
<li>Read flags S, C, F, T, J, P, R, s, I and the incoming and outgoing interface lines.</li>
<li>OIL Null with flag P means nothing is forwarded for that entry.</li>
<li><code>ip pim spt-threshold infinity</code> on the last-hop router keeps a group on the shared tree.</li>
<li>Clear state or restart the stream after changing the threshold when testing.</li>
</ul></div>
`,hi:`
<p>Multicast tree ek baar banakar bhula nahi diya jaata. Har branch un messages se zinda rehti hai jo dohrate rehte hain, aur jab woh ruk jaate hain to hata di jaati hai. Yeh chapter timers samjhata hai, <code>show ip mroute</code> line ka har flag padhna sikhata hai, aur woh ek bada faisla control karna dikhata hai jo last-hop router leta hai: shared tree par rehna ya shortest path par jaana.</p>

<h3>Join/Prune messages aur state timers</h3>
<p>PIM ek <b>soft-state</b> protocol hai, us dukaan ki tarah jo table tabhi reserve rakhti hai jab tak koi baar baar phone karke confirm karta rahe. Downstream router apne joins upstream neighbour ko <b>har 60 seconds</b> mein refresh karta hai, aur har Join/Prune message mein <b>210 seconds ka holdtime</b> hota hai (interval ka 3.5 guna). Agar upstream router ko holdtime ke andar refresh na mile to woh us interface ko apni outgoing list se hata deta hai. Prunes tab bheje jaate hain jab branch ki koi dilchaspi na bache: aakhri receiver chala gaya (IGMP leave ya timeout), ya router abhi behtar path par switch hua aur purane se stream nahi chahta.</p>
<p>Mroute table mein dikhne wale timers:</p>
<ul>
<li><b>(*,G) entry:</b> jab tak joins aate rehte hain tab tak rehti hai. RP par woh <b>stopped</b> dikhati hai kyunki RP entry tab tak rakhta hai jab tak list mein koi interface bacha ho.</li>
<li><b>(S,G) entry:</b> data se zinda rehti hai. Aakhri packet ke lagbhag <b>3 minute</b> baad expire hoti hai, isliye stream band karne ke thodi der baad (S,G) gayab hoti hai.</li>
<li><b>Outgoing interface entry:</b> har OIL line ka apna uptime aur expiry hota hai; expiry downstream ke joins se refresh hoti hai.</li>
</ul>

<h3>Flags padhna</h3>
<p>Har <code>show ip mroute</code> ke top par jo legend chhapti hai usme flags hote hain. Roz ke kaam ke flags yeh hain:</p>
<table class="cmp"><tr><th>Flag</th><th>Matlab</th><th>Kahan dikhta hai</th></tr>
<tr><td><b>S</b></td><td>Sparse mode group</td><td>Sparse mode mein har (*,G) aur zyada tar (S,G)</td></tr>
<tr><td><b>C</b></td><td>Connected: directly attached LAN par member hai</td><td>Last-hop router</td></tr>
<tr><td><b>F</b></td><td>Register flag: yeh router source ko RP ke paas register kar raha hai</td><td>Source ka DR</td></tr>
<tr><td><b>T</b></td><td>SPT bit set: stream shortest-path interface par aati hai</td><td>Switchover ke baad (S,G)</td></tr>
<tr><td><b>J</b></td><td>Join SPT: router source tree par switch hua (ya ho raha hai)</td><td>Last-hop router par (*,G)</td></tr>
<tr><td><b>P</b></td><td>Pruned: outgoing list khaali hai, kuch forward nahi hota</td><td>Aisi entry jise koi nahi sunta</td></tr>
<tr><td><b>R</b></td><td>RP-bit: us source ke liye entry shared tree par hai</td><td>RPT se prune ya RPT use karti (S,G)</td></tr>
<tr><td><b>s</b></td><td>SSM group (chapter 6)</td><td>232/8 entries</td></tr>
<tr><td><b>I</b></td><td>Source-specific host report mila (IGMPv3)</td><td>SSM last-hop router</td></tr></table>
<p>Har entry block ka shape ek jaisa hai: header jisme key, age, expiry, RP aur flags hote hain; phir <b>incoming interface</b> aur <b>RPF neighbour</b>; phir <b>outgoing interface list</b>, jiski har line interface, <b>Forward/Sparse</b> aur uske timers dikhati hai. Outgoing list <b>Null</b> ka matlab hai ki koi interface traffic nahi chahta, isliye kuch forward nahi hota.</p>
<pre class="out">R2#show ip mroute 239.40.0.1
(*, 239.40.0.1), 00:01:03/stopped, RP 2.2.2.2, flags: S
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/2, Forward/Sparse, 00:01:03/00:03:27

(10.40.1.10, 239.40.0.1), 00:00:48/00:02:12, flags: <span class="hl">PT</span>
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.12.1
  Outgoing interface list: <span class="hl">Null</span></pre>
<p>R2 par (S,G) entry <b>P</b> flag ke saath hai aur uski OIL Null hai. Shared tree abhi bhi Gi0/2 list karta hai (receiver router R3 ki (*,G) wahan hai), par R3 R1 ke direct link se shortest path par switch ho gaya, isliye usne source ko shared tree se prune kar diya aur R2 ke paas us source ke liye forward karne ko kuch nahi.</p>

<h3>SPT threshold: raho ya switch karo</h3>
<p>Default mein last-hop router pehla packet aate hi source tree par switch ho jaata hai. Is setting ko <b>SPT threshold</b> kehte hain. Kabhi aap yeh nahi chahte: kam bandwidth ka chhota group bahut saare routers mein extra (S,G) state ko justify nahi karta, ya aap chahte ho har stream RP se guzre jahan use monitor ya filter kiya ja sake. Command:</p>
<pre class="code"><span class="c">! is router par har group ke liye shared tree par raho</span>
ip pim spt-threshold infinity

<span class="c">! default par wapas: pehle packet par switch</span>
no ip pim spt-threshold</pre>
<p>Do points exam ke din pass aur fail ka farak banate hain. Pehla, setting <b>last-hop router</b> (jiske paas receivers hain) par rehti hai, RP ya source ke router par nahi. Doosra, real IOS XE mein aap ise kuch groups tak <code>ip pim spt-threshold infinity group-list ACL</code> se limit kar sakte ho ya sirf ek kilobit rate ke upar switch karwa sakte ho; is module ka lab global form use karta hai.</p>
<p>Doosre lab mein R3 depot LAN par DR hai aur uska R1 se direct link hai. Change se pehle R3 aam switched picture dikhata hai. <code>ip pim spt-threshold infinity</code> aur stream restart ke baad (S,G) entry gayab ho jaati hai aur sab kuch shared-tree interface par aata hai:</p>
<pre class="out">R3#show ip mroute 239.40.0.1
(*, 239.40.0.1), 00:00:51/00:02:09, RP 2.2.2.2, flags: <span class="hl">SJC</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:51/00:02:09
(10.40.1.10, 239.40.0.1), 00:00:36/00:02:24, flags: <span class="hl">T</span>
  Incoming interface: <span class="hl">GigabitEthernet0/1</span>, RPF nbr 10.0.13.1

<span class="c">! ip pim spt-threshold infinity, clear ip mroute * aur nayi stream ke baad:</span>
(*, 239.40.0.1), 00:00:36/00:02:24, RP 2.2.2.2, flags: <span class="hl">SC</span>
  Incoming interface: <span class="hl">GigabitEthernet0/2</span>, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:36/00:02:24</pre>
<p>J flag chala gaya aur (S,G) entry bhi: R3 RP ke through lamba route leta hai aur receivers ko phir bhi service milti hai.</p>

<div class="eg"><p><b>Worked example.</b> Zenith Logistics ke 120 depots hain, har ek mein ek receiver, aur 200 kbps ka bulletin. Default mein 120 last-hop routers har ek (S,G) entry banate hain aur source-tree join bhejte hain: core mein lagbhag 120 extra entries aur har minute refresh hone wale 120 extra joins. Depots par <code>spt-threshold infinity</code> ke saath core mein ek (*,G) aur sirf RP par kuch (S,G) entries hoti hain. Keemat: kuch depots ke liye lamba path, jo 200 kbps ke liye chalta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>spt-threshold infinity</code> RP par lagana aur umeed karna ki receivers shared tree par rahenge: threshold last-hop router par padha jaata hai. (2) T flag ko "traffic chal raha hai" padhna. T ka matlab hai stream shortest-path interface par aa rahi hai. (3) Changes ek dum dikhne ki umeed: purani (S,G) state timeout hone tak rehti hai, isliye testing mein state clear karo ya stream restart karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Join/Prune refresh 60 seconds hai aur holdtime 210 seconds. PIM Hello interval 30 seconds hai aur holdtime 105 seconds. Numbers ke dono jodon ko mat milao.</p></div>

<div class="scn"><h4>Core mein 3,000 (S,G) entries kyun thi</h4><p>Ek bank ke multicast market-data design mein 25 feeds aur 120 branch routers the. Core routers 3,000 se zyada (S,G) entries carry karte the aur do purane routers ka CPU 80 percent se upar tha. Zyada tar feeds chhoti thi aur branches ko extra latency se farak nahi padta tha. Team ne branch routers par <code>ip pim spt-threshold infinity</code> on kiya. (S,G) count 100 se neeche aa gaya, aur CPU 20 percent par gir gaya. Latency-critical feeds branches ke ek alag set par rahi jinhone default rakha.</p><p><b>Seekh:</b> SPT threshold sirf path ka nahi, state scale karne ka bhi tool hai.</p></div>

<div class="iv"><p class="q">"T flag ka matlab kya hai, aur spt-threshold infinity kab set karoge?"</p><p>Strong answer: T (SPT bit) (S,G) entry par tab set hota hai jab stream source ki taraf shortest-path wale interface par aane lagti hai. Infinity last-hop router ko shared tree par rakhta hai: kam (S,G) entries aur RP par ek control point, shayad lambe path ki keemat par. Kaho ki setting last-hop router par hoti hai aur aap <code>show ip mroute</code> se verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Joins har 60 s refresh hote hain (holdtime 210 s); (S,G) aakhri packet ke lagbhag 3 minute rehti hai.</li>
<li>Flags S, C, F, T, J, P, R, s, I aur incoming aur outgoing interface lines padho.</li>
<li>OIL Null aur flag P ka matlab hai us entry ke liye kuch forward nahi hota.</li>
<li>Last-hop router par <code>ip pim spt-threshold infinity</code> group ko shared tree par rakhta hai.</li>
<li>Testing mein threshold badalne ke baad state clear karo ya stream restart karo.</li>
</ul></div>
`}};export{e as default};