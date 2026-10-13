var e={id:`rpf-check`,h:{en:`The RPF check in depth`,hi:`RPF check gehraai se`},body:{en:`
<p>Imagine a courier hub with one rule: a parcel from Mumbai is accepted only if it arrives on the Mumbai road. If a Mumbai parcel turns up on the Chennai road, something has gone round in circles, so the hub refuses it. That simple rule stops parcels looping between hubs forever. Multicast routers use the same rule, called the <b>Reverse Path Forwarding (RPF) check</b>, and it is the single most important idea for troubleshooting multicast.</p>

<h3>Why multicast needs RPF</h3>
<p>Unicast forwarding looks at the <b>destination</b>: "where is this packet going?" For multicast the destination is a group, which may be behind many interfaces at once, so the destination cannot tell a router whether a copy is a loop. Instead, multicast looks <b>backwards</b> at the <b>source</b>: "did this packet come in on the interface I would use to send traffic back to its source?" If yes, it arrived on the shortest path from the source and is accepted. If not, it is a duplicate or a loop and is dropped. That is why it is called <b>reverse</b> path forwarding.</p>

<h3>The check, step by step</h3>
<ol>
<li>A multicast packet from source S to group G arrives on interface X.</li>
<li>The router looks up <b>S</b> (not G) in its routing information. The outgoing interface of the best route to S is the <b>RPF interface</b>; the next hop is the <b>RPF neighbour</b>.</li>
<li>If X equals the RPF interface, the check <b>passes</b> and the packet is copied to the outgoing interface list.</li>
<li>If X is any other interface, the check <b>fails</b> and the packet is silently dropped. This is an <b>RPF failure</b>.</li>
</ol>
<p>Which address is looked up depends on the tree: for an <b>(S,G)</b> entry the router checks toward the <b>source</b>; for a <b>(*,G)</b> entry on the shared tree it checks toward the <b>RP</b>. RPF also decides where joins go: a router sends its PIM Join out of the RPF interface, to the RPF neighbour. So one wrong RPF lookup breaks both the control plane (joins go the wrong way) and the data plane (packets are dropped).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RPF check">
<rect x="20" y="100" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="70" y="125" text-anchor="middle" class="svg-ink" font-size="13">S 10.1.1.10</text>
<rect x="190" y="40" width="80" height="36" rx="6" fill="#bae6fd"/><text x="230" y="63" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="190" y="165" width="80" height="36" rx="6" fill="#bae6fd"/><text x="230" y="188" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="380" y="100" width="100" height="40" rx="6" fill="#ddd6fe"/><text x="430" y="125" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<line x1="120" y1="115" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="190" y2="183" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="60" x2="380" y2="112" stroke="#64748b" stroke-width="3"/><text x="330" y="70" class="svg-accent" font-size="12">Gi0/2: RPF OK</text>
<line x1="270" y1="183" x2="380" y2="130" stroke="#64748b" stroke-dasharray="5 4" stroke-width="2"/><text x="300" y="200" class="svg-muted" font-size="12">Gi0/1: RPF fail, drop</text>
<text x="500" y="110" class="svg-ink" font-size="12">Route to 10.1.1.0/24</text>
<text x="500" y="128" class="svg-ink" font-size="12">via Gi0/2</text>
</svg><p class="cap">R3 accepts the copy on its RPF interface toward the source and drops the one that arrives anywhere else.</p></div>

<h3>Where the RPF information comes from</h3>
<p>PIM is "protocol independent" because it has no routing protocol of its own. It borrows whatever builds the unicast table: OSPF, EIGRP, IS-IS, BGP, static routes. On IOS the RPF lookup considers three sources and, by default, prefers the one with the <b>lowest administrative distance</b> (not the longest match):</p>
<ul>
<li><b>Static mroutes</b> (<code>ip mroute</code>), default distance <b>0</b>.</li>
<li><b>Multiprotocol BGP</b> routes in the IPv4 multicast address family.</li>
<li>The normal <b>unicast routing table</b>.</li>
</ul>
<p>The <b>static mroute</b> is the key tool: it changes the RPF lookup only, never unicast forwarding. Syntax: <code>ip mroute &lt;source&gt; &lt;mask&gt; &lt;rpf-neighbour or interface&gt; [distance]</code>.</p>
<p>With <b>equal-cost paths</b>, IOS picks the RPF neighbour with the <b>highest IP address</b>, so all traffic uses one path, unless you enable <code>ip multicast multipath</code> to spread different (S,G) flows across the paths.</p>

<h3>Verification</h3>
<pre class="out">R3# show ip rpf 10.1.1.10
RPF information for ? (10.1.1.10)
<span class="hl">  RPF interface: GigabitEthernet0/2
  RPF neighbor: ? (10.0.23.2)</span>
  RPF route/mask: 10.1.1.0/24
<span class="hl">  RPF type: unicast (ospf 1)</span>
  Doing distance-preferred lookups across tables
  RPF topology: ipv4 multicast base, originated from ipv4 unicast base</pre>
<p>Three questions to ask of this output: which interface, is that interface PIM-enabled, and is the RPF neighbour a PIM neighbour (<code>show ip pim neighbor</code>)? If the RPF interface has no PIM, the mroute entry shows <b>Incoming interface: Null</b> and nothing is forwarded.</p>
<p>RPF drops are counted, which is a quick way to prove a failure:</p>
<pre class="out">R3# show ip mroute count
IP Multicast Statistics
Forwarding Counts: Pkt Count/Pkts(neg(-) = Drops) per second/Avg Pkt Size/Kilobits per second
Other counts: Total/RPF failed/Other drops(OIF-null, rate-limit etc)

Group: 239.20.20.20, Source count: 1, Packets forwarded: 0, Packets received: 42
  RP-tree: Forwarding: 0/0/0/0, Other: 0/0/0
<span class="hl">  Source: 10.1.1.10/32, Forwarding: 0/0/0/0, Other: 42/42/0</span></pre>
<p>"Other: 42/42/0" means 42 packets received, <b>42 RPF failed</b>, 0 other drops.</p>

<div class="eg"><p><b>Worked example: the troubleshooting lab.</b> R1, R2 and R3 form a triangle. PIM runs on R1-R2 and R2-R3, but the R1-R3 link is a unicast-only backup with no PIM. The R2-R3 link has OSPF cost 100. From R3, the RP 2.2.2.2 costs 100 + 1 = 101 via R2 directly, but 1 + 1 + 1 = 3 via R1. OSPF picks R1, so <code>show ip rpf 2.2.2.2</code> says <b>RPF interface: GigabitEthernet0/1</b>, the backup link without PIM. R3 cannot send its (*,G) join and shows Incoming interface: Null. You are not allowed to change OSPF or enable PIM on the backup, so the fix is:</p>
<pre class="code">R3(config)# ip mroute 2.2.2.2 255.255.255.255 10.0.23.2
R3(config)# ip mroute 10.1.1.0 255.255.255.0 10.0.23.2   <span class="c">! same for the source LAN</span></pre>
<p>Now <code>show ip rpf 2.2.2.2</code> says RPF interface GigabitEthernet0/2 and <b>RPF type: multicast (static)</b>, while <code>show ip route 2.2.2.2</code> still points at 10.0.13.1. Unicast is untouched.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing an RPF problem with a static <code>ip route</code>. That moves unicast traffic too and can break other applications. Use <code>ip mroute</code>, which affects only RPF. And remember the source LAN as well as the RP: the (*,G) checks toward the RP, the (S,G) toward the source.</p></div>

<div class="exam"><p><b>Exam trap.</b> The RPF check compares the <b>incoming interface</b> of a multicast packet with the unicast route <b>back to the source</b> (or RP). It does not look at the group, the TTL or the destination. Static mroutes have distance 0 and are used only for RPF.</p></div>

<div class="scn"><h4>Multicast broke after a "harmless" OSPF change</h4><p>An engineer lowered the OSPF cost on a new 10G link between two core switches to attract more unicast traffic. Within seconds, IPTV channels froze in half the campus. The new link had never been configured with <code>ip pim sparse-mode</code>. The unicast best path to the headend now went over it, the RPF interface moved to a non-PIM link, and the mroute entries showed Incoming interface: Null. Adding PIM to the new link fixed everything.</p><p><b>Lesson:</b> any unicast routing change can move the RPF interface; every link that can carry a best path must run PIM, or you must pin RPF with static mroutes.</p></div>

<div class="iv"><p class="q">"What is the RPF check and why does multicast need it?"</p><p>Strong answer: for each multicast packet the router looks up the source (or the RP for shared-tree traffic) in the unicast table, or in static mroutes or MBGP, and accepts the packet only if it arrived on the interface the router would use to reach that source. Otherwise it drops it. Because a group can be reached on many interfaces, the destination cannot prevent loops; RPF does. RPF also decides where joins are sent. Mention <code>show ip rpf</code>, static <code>ip mroute</code> and the highest-neighbour-IP tie-break.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPF: accept a multicast packet only on the interface used to reach its source (or the RP for (*,G)).</li>
<li>RPF failures are dropped silently; see them in <code>show ip mroute count</code>.</li>
<li>RPF uses static mroutes (distance 0), MBGP and the unicast RIB, preferring the lowest distance.</li>
<li>Joins are sent out of the RPF interface; if it is not PIM-enabled, the IIF becomes Null.</li>
<li><code>ip mroute</code> changes RPF only; equal-cost ties go to the highest PIM neighbour IP.</li>
</ul></div>
`,hi:`
<p>Ek courier hub socho jiska ek rule hai: Mumbai ka parcel sirf tab accept hota hai jab woh Mumbai wali sadak se aaye. Agar Mumbai ka parcel Chennai wali sadak se aa jaaye, to kuch gol gol ghooma hai, isliye hub use mana kar deta hai. Yeh simple rule parcels ko hubs ke beech hamesha ke liye loop hone se rokta hai. Multicast routers yahi rule use karte hain, jise <b>Reverse Path Forwarding (RPF) check</b> kehte hain, aur multicast troubleshoot karne ke liye yeh sabse zaroori idea hai.</p>

<h3>Multicast ko RPF kyun chahiye</h3>
<p>Unicast forwarding <b>destination</b> dekhta hai: "yeh packet kahan ja raha hai?" Multicast mein destination ek group hai, jo ek saath kai interfaces ke peeche ho sakta hai, isliye destination router ko nahi bata sakta ki copy loop hai ya nahi. Iski jagah multicast <b>peeche</b> <b>source</b> ki taraf dekhta hai: "kya yeh packet us interface par aaya jisse main traffic uske source tak wapas bhejta?" Agar haan, to yeh source se shortest path par aaya aur accept hota hai. Agar nahi, to yeh duplicate ya loop hai aur drop hota hai. Isiliye ise <b>reverse</b> path forwarding kehte hain.</p>

<h3>Check, step by step</h3>
<ol>
<li>Source S se group G ka multicast packet interface X par aata hai.</li>
<li>Router apni routing information mein <b>S</b> (G nahi) lookup karta hai. S tak ke best route ka outgoing interface <b>RPF interface</b> hai; next hop <b>RPF neighbour</b> hai.</li>
<li>Agar X RPF interface ke barabar hai, check <b>pass</b> hota hai aur packet outgoing interface list par copy hota hai.</li>
<li>Agar X koi aur interface hai, check <b>fail</b> hota hai aur packet chupchaap drop hota hai. Yeh <b>RPF failure</b> hai.</li>
</ol>
<p>Kaunsa address lookup hota hai yeh tree par depend karta hai: <b>(S,G)</b> entry ke liye router <b>source</b> ki taraf check karta hai; shared tree par <b>(*,G)</b> entry ke liye <b>RP</b> ki taraf. RPF yeh bhi decide karta hai ki joins kahan jaate hain: router apna PIM Join RPF interface se, RPF neighbour ko bhejta hai. Isliye ek galat RPF lookup control plane (joins galat taraf jaate hain) aur data plane (packets drop hote hain) dono tod deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RPF check">
<rect x="20" y="100" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="70" y="125" text-anchor="middle" class="svg-ink" font-size="13">S 10.1.1.10</text>
<rect x="190" y="40" width="80" height="36" rx="6" fill="#bae6fd"/><text x="230" y="63" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="190" y="165" width="80" height="36" rx="6" fill="#bae6fd"/><text x="230" y="188" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="380" y="100" width="100" height="40" rx="6" fill="#ddd6fe"/><text x="430" y="125" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<line x1="120" y1="115" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="190" y2="183" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="60" x2="380" y2="112" stroke="#64748b" stroke-width="3"/><text x="330" y="70" class="svg-accent" font-size="12">Gi0/2: RPF OK</text>
<line x1="270" y1="183" x2="380" y2="130" stroke="#64748b" stroke-dasharray="5 4" stroke-width="2"/><text x="300" y="200" class="svg-muted" font-size="12">Gi0/1: RPF fail, drop</text>
<text x="500" y="110" class="svg-ink" font-size="12">10.1.1.0/24 ka route</text>
<text x="500" y="128" class="svg-ink" font-size="12">Gi0/2 se</text>
</svg><p class="cap">R3 source ki taraf wale RPF interface par aayi copy accept karta hai aur kahin aur aayi copy drop karta hai.</p></div>

<h3>RPF information kahan se aati hai</h3>
<p>PIM "protocol independent" hai kyunki iska apna routing protocol nahi hai. Yeh wahi udhaar leta hai jo unicast table banata hai: OSPF, EIGRP, IS-IS, BGP, static routes. IOS par RPF lookup teen sources dekhta hai aur default mein <b>sabse kam administrative distance</b> wala pasand karta hai (longest match nahi):</p>
<ul>
<li><b>Static mroutes</b> (<code>ip mroute</code>), default distance <b>0</b>.</li>
<li>IPv4 multicast address family mein <b>Multiprotocol BGP</b> routes.</li>
<li>Normal <b>unicast routing table</b>.</li>
</ul>
<p><b>Static mroute</b> key tool hai: yeh sirf RPF lookup badalta hai, unicast forwarding kabhi nahi. Syntax: <code>ip mroute &lt;source&gt; &lt;mask&gt; &lt;rpf-neighbour ya interface&gt; [distance]</code>.</p>
<p><b>Equal-cost paths</b> hon to IOS <b>sabse bade IP address</b> wala RPF neighbour chunta hai, isliye saara traffic ek path use karta hai, jab tak aap alag (S,G) flows ko paths par phailane ke liye <code>ip multicast multipath</code> enable na karo.</p>

<h3>Verification</h3>
<pre class="out">R3# show ip rpf 10.1.1.10
RPF information for ? (10.1.1.10)
<span class="hl">  RPF interface: GigabitEthernet0/2
  RPF neighbor: ? (10.0.23.2)</span>
  RPF route/mask: 10.1.1.0/24
<span class="hl">  RPF type: unicast (ospf 1)</span>
  Doing distance-preferred lookups across tables
  RPF topology: ipv4 multicast base, originated from ipv4 unicast base</pre>
<p>Is output se teen sawaal poocho: kaunsa interface, kya us interface par PIM enabled hai, aur kya RPF neighbour PIM neighbour hai (<code>show ip pim neighbor</code>)? Agar RPF interface par PIM nahi hai, to mroute entry <b>Incoming interface: Null</b> dikhati hai aur kuch forward nahi hota.</p>
<p>RPF drops gine jaate hain, jo failure prove karne ka tez tarika hai:</p>
<pre class="out">R3# show ip mroute count
IP Multicast Statistics
Forwarding Counts: Pkt Count/Pkts(neg(-) = Drops) per second/Avg Pkt Size/Kilobits per second
Other counts: Total/RPF failed/Other drops(OIF-null, rate-limit etc)

Group: 239.20.20.20, Source count: 1, Packets forwarded: 0, Packets received: 42
  RP-tree: Forwarding: 0/0/0/0, Other: 0/0/0
<span class="hl">  Source: 10.1.1.10/32, Forwarding: 0/0/0/0, Other: 42/42/0</span></pre>
<p>"Other: 42/42/0" matlab 42 packets receive hue, <b>42 RPF failed</b>, 0 doosre drops.</p>

<div class="eg"><p><b>Worked example: troubleshooting lab.</b> R1, R2 aur R3 ek triangle banate hain. PIM R1-R2 aur R2-R3 par chalta hai, par R1-R3 link bina PIM ka unicast-only backup hai. R2-R3 link ki OSPF cost 100 hai. R3 se RP 2.2.2.2 seedhe R2 ke through 100 + 1 = 101 ka padta hai, par R1 ke through 1 + 1 + 1 = 3. OSPF R1 chunta hai, isliye <code>show ip rpf 2.2.2.2</code> kehta hai <b>RPF interface: GigabitEthernet0/1</b>, woh backup link jahan PIM nahi. R3 apna (*,G) join nahi bhej paata aur Incoming interface: Null dikhata hai. Aapko OSPF badalne ya backup par PIM on karne ki ijaazat nahi, isliye fix hai:</p>
<pre class="code">R3(config)# ip mroute 2.2.2.2 255.255.255.255 10.0.23.2
R3(config)# ip mroute 10.1.1.0 255.255.255.0 10.0.23.2   <span class="c">! source LAN ke liye bhi yahi</span></pre>
<p>Ab <code>show ip rpf 2.2.2.2</code> kehta hai RPF interface GigabitEthernet0/2 aur <b>RPF type: multicast (static)</b>, jabki <code>show ip route 2.2.2.2</code> ab bhi 10.0.13.1 ki taraf point karta hai. Unicast ko haath nahi laga.</p></div>

<div class="warn"><p><b>Common galti.</b> RPF problem ko static <code>ip route</code> se theek karna. Isse unicast traffic bhi hil jaata hai aur doosri applications toot sakti hain. <code>ip mroute</code> use karo, jo sirf RPF par asar karta hai. Aur RP ke saath source LAN bhi yaad rakho: (*,G) RP ki taraf check karta hai, (S,G) source ki taraf.</p></div>

<div class="exam"><p><b>Exam trap.</b> RPF check multicast packet ke <b>incoming interface</b> ko <b>source (ya RP) ki taraf wapas</b> wale unicast route se compare karta hai. Yeh group, TTL ya destination nahi dekhta. Static mroutes ka distance 0 hai aur yeh sirf RPF ke liye use hote hain.</p></div>

<div class="scn"><h4>"Harmless" OSPF change ke baad multicast toota</h4><p>Ek engineer ne do core switches ke beech naye 10G link ki OSPF cost kam ki taaki zyada unicast traffic us par aaye. Kuch seconds mein aadhe campus mein IPTV channels freeze ho gaye. Naye link par kabhi <code>ip pim sparse-mode</code> configure hi nahi hua tha. Headend tak unicast best path ab us par jaata tha, RPF interface non-PIM link par shift ho gaya, aur mroute entries Incoming interface: Null dikhane lagi. Naye link par PIM jodte hi sab theek.</p><p><b>Seekh:</b> koi bhi unicast routing change RPF interface hila sakta hai; har link jo best path carry kar sakta hai us par PIM chalna chahiye, ya static mroutes se RPF pin karna hoga.</p></div>

<div class="iv"><p class="q">"RPF check kya hai aur multicast ko iski zaroorat kyun hai?"</p><p>Strong answer: har multicast packet ke liye router source (ya shared-tree traffic ke liye RP) ko unicast table mein, ya static mroutes ya MBGP mein, lookup karta hai aur packet tabhi accept karta hai jab woh us interface par aaya ho jisse router us source tak pahunchta. Warna drop karta hai. Kyunki group kai interfaces par pahunch mein ho sakta hai, destination loops nahi rok sakta; RPF rokta hai. RPF yeh bhi decide karta hai ki joins kahan jaate hain. <code>show ip rpf</code>, static <code>ip mroute</code> aur highest-neighbour-IP tie-break ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPF: multicast packet sirf us interface par accept karo jisse uske source (ya (*,G) ke liye RP) tak pahunchte ho.</li>
<li>RPF failures chupchaap drop hote hain; <code>show ip mroute count</code> mein dikhte hain.</li>
<li>RPF static mroutes (distance 0), MBGP aur unicast RIB use karta hai, sabse kam distance pasand karta hai.</li>
<li>Joins RPF interface se bheje jaate hain; agar us par PIM nahi, to IIF Null ho jaata hai.</li>
<li><code>ip mroute</code> sirf RPF badalta hai; equal-cost tie sabse bade PIM neighbour IP ko jaata hai.</li>
</ul></div>
`}};export{e as default};