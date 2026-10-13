var e={id:`mcast-troubleshooting`,h:{en:`Troubleshooting workflow: RPF failure and a missing ip pim`,hi:`Troubleshooting workflow: RPF failure aur missing ip pim`},body:{en:`
<p>When the kitchen tap runs dry, a plumber does not start at the reservoir. He starts at the tap and walks the pipe back: is the tap open, is the valve under the sink open, is the pipe in the wall connected, is the main valve on? Multicast troubleshooting works the same way: <b>start at the receiver and walk upstream toward the source</b>, checking one layer at a time. This chapter gives you the workflow and then walks through the troubleshooting lab exactly as you will do it.</p>

<h3>The six-step workflow</h3>
<ol>
<li><b>Receiver and IGMP.</b> On the last-hop router: <code>show ip igmp groups</code>. No entry means the host did not join, IGMP/PIM is not enabled on the LAN interface, the IGMP version is wrong (SSM needs v3), or an ACL (<code>ip igmp access-group</code>) filters it. On switches, check <code>show ip igmp snooping groups</code>.</li>
<li><b>Multicast routing and PIM on every hop.</b> <code>show ip pim interface</code> and <code>show ip pim neighbor</code> hop by hop. Every link in the path needs PIM on <b>both</b> ends, and every router needs <code>ip multicast-routing</code>.</li>
<li><b>RP.</b> <code>show ip pim rp mapping</code> on several routers. Every router must show the same RP for the group. A (*,G) showing <code>RP 0.0.0.0</code> means no RP is known.</li>
<li><b>RPF.</b> <code>show ip rpf &lt;RP&gt;</code> and <code>show ip rpf &lt;source&gt;</code>. The RPF interface must be PIM-enabled and the RPF neighbour must be a PIM neighbour. <code>Incoming interface: Null</code> in <code>show ip mroute</code> is the classic symptom.</li>
<li><b>Tree state.</b> <code>show ip mroute &lt;group&gt;</code> from the receiver up to the source: does each router have the right incoming interface and outgoing list? Does the RP have the (S,G)? Does the first-hop router still show F with an empty list (registers failing)?</li>
<li><b>Data.</b> <code>show ip mroute count</code> for forwarded packets and RPF failures; check the source's TTL (many applications send with TTL 1, which never leaves the LAN). Test without the application: <code>ip igmp join-group</code> on a far router, then <code>ping</code> the group from the source side.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting lab topology">
<rect x="20" y="200" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="75" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.1.1.10</text>
<rect x="110" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="150" y="143" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="265" y="25" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">R2 = RP</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">2.2.2.2</text>
<rect x="450" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="490" y="143" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="510" y="200" width="110" height="36" rx="6" fill="#fde68a"/><text x="565" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC3 10.3.3.10</text>
<line x1="75" y1="200" x2="130" y2="156" stroke="#64748b" stroke-width="2"/><line x1="510" y1="156" x2="555" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="180" y1="120" x2="280" y2="65" stroke="#64748b" stroke-width="3"/><text x="160" y="85" class="svg-muted" font-size="11">PIM, cost 1</text>
<line x1="360" y1="65" x2="470" y2="120" stroke="#64748b" stroke-width="3"/><text x="420" y="80" class="svg-accent" font-size="11">cost 100, PIM on R3 only</text>
<line x1="190" y1="145" x2="450" y2="145" stroke="#64748b" stroke-dasharray="6 4" stroke-width="2"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">10.0.13.0/24 unicast-only backup, cost 1, no PIM</text>
</svg><p class="cap">The troubleshooting lab: the PIM path is R1-R2-R3, but OSPF prefers the backup link R1-R3.</p></div>

<h3>Walking the lab: fault 1, the missing ip pim</h3>
<p>The ticket: PC3 is joined to 239.20.20.20 but receives nothing from PC1 after a change window. Step 1 is fine: R3 shows the group on Gi0/0. Step 2 on R3:</p>
<pre class="out">R3# show ip pim neighbor
PIM Neighbor Table
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
<span class="hl">(no entries)</span>

R2# show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
2.2.2.2          Loopback0                v2/S   0      30     1          2.2.2.2
10.0.12.2        GigabitEthernet0/1       v2/S   1      30     1          10.0.12.2</pre>
<p>R2 lists no Gi0/2: PIM is missing on R2's side of the R2-R3 link. R3 has <code>ip pim sparse-mode</code> there, but a hello is needed from both ends.</p>
<pre class="code">R2(config)# interface GigabitEthernet0/2
R2(config-if)# ip pim sparse-mode</pre>
<p>Now R3 sees 10.0.23.2 as a neighbour and R2 sees 10.0.23.3. Task 1 is done, but the stream still does not arrive.</p>

<h3>Walking the lab: fault 2, the RPF failure</h3>
<pre class="out">R3# show ip mroute 239.20.20.20
(*, 239.20.20.20), 00:12:40/00:02:21, RP 2.2.2.2, flags: SC
<span class="hl">  Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:12:40/00:02:21

R3# show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
<span class="hl">  RPF interface: GigabitEthernet0/1
  RPF neighbor: ? (10.0.13.1)</span>
  RPF route/mask: 2.2.2.2/32
  RPF type: unicast (ospf 1)</pre>
<p>The RP is known, but the RPF interface toward it is <b>GigabitEthernet0/1</b>, the backup link, which has no PIM. That is the answer to lab task 2. OSPF chose it because R2-R3 costs 100 while R3-R1-R2 costs 3. The rules forbid enabling PIM on the backup and changing OSPF, so use static mroutes, for the RP and for the source LAN:</p>
<pre class="code">R3(config)# ip mroute 2.2.2.2 255.255.255.255 10.0.23.2
R3(config)# ip mroute 10.1.1.0 255.255.255.0 10.0.23.2</pre>
<pre class="out">R3# show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
<span class="hl">  RPF interface: GigabitEthernet0/2
  RPF neighbor: ? (10.0.23.2)</span>
  RPF route/mask: 2.2.2.2/32
<span class="hl">  RPF type: multicast (static)</span>

R3# show ip route 2.2.2.2 | include via
  Known via "ospf 1", distance 110, metric 3, type intra area
  * 10.0.13.1, from 2.2.2.2, 00:25:10 ago, via GigabitEthernet0/1</pre>
<p>RPF moved; unicast did not. Then PC1 restarts the stream (<code>mcast 239.20.20.20 10</code>):</p>
<pre class="out">R3# show ip mroute 239.20.20.20
(*, 239.20.20.20), 00:14:02/00:02:58, RP 2.2.2.2, flags: SJC
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2, Mroute
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:14:02/00:02:58

<span class="hl">(10.1.1.10, 239.20.20.20), 00:00:20/00:02:39, flags: T
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2, Mroute</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:20/00:02:39</pre>
<p>"Mroute" after the RPF neighbour shows the RPF came from a static mroute. The (S,G) has T with incoming Gi0/2, and <code>show mcast</code> on PC3 counts packets. Ticket closed.</p>

<div class="eg"><p><b>Worked example: why the source mroute matters.</b> With only the RP mroute, the shared tree works and PC3 gets the first packets through R2. Then R3 switches to the SPT and does an RPF lookup toward 10.1.1.10: OSPF says Gi0/1 via R1 (cost 2) instead of Gi0/2 via R2 (cost 102). The (S,G) gets Incoming interface Null and the stream stops after a few packets. The second mroute keeps the source tree on the PIM path.</p></div>

<div class="warn"><p><b>Common mistake.</b> Stopping after fixing one fault. Multicast failures are often layered: fix PIM adjacency, then re-check RP, then RPF toward the RP, then RPF toward the source, and finally the data counters.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Incoming interface: Null" on a non-RP router means an RPF problem (no route, or RPF interface without PIM). On the RP itself, a (*,G) with Null incoming is normal. RPF failures appear in <code>show ip mroute count</code> as "RPF failed".</p></div>

<div class="scn"><h4>The stream that reached the router but not the PCs</h4><p>A branch router showed perfect state: (S,G) with T, packets counted as forwarded out of the LAN interface, and <code>show ip igmp groups</code> listed the group. Yet no PC received the video. On the access switch <code>show ip igmp snooping groups</code> listed the right ports, so snooping was fine. The engineer then checked the VLAN's security policy: a VLAN access map added the week before permitted only a list of TCP and UDP ports toward the PCs and dropped everything else, including UDP to 239.20.20.20. Adding a permit for the 239.20.0.0/16 video groups restored the stream.</p><p><b>Lesson:</b> when the router forwards but hosts receive nothing, move down to Layer 2: snooping state first, then any VLAN or port ACLs.</p></div>

<div class="iv"><p class="q">"Users joined a group but receive no traffic. How do you troubleshoot?"</p><p>Strong answer: work from the receiver upstream. Check IGMP membership on the last-hop router and snooping on the switch; check <code>ip multicast-routing</code> and PIM neighbours on every hop; confirm every router maps the group to the same RP; check RPF toward the RP and the source with <code>show ip rpf</code>; read <code>show ip mroute</code> for Null incoming interfaces or pruned lists; finally check counters and TTL. Mention static mroutes for RPF fixes that must not touch unicast.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk from receiver to source: IGMP, PIM neighbours, RP, RPF, mroute state, data counters.</li>
<li>A PIM adjacency needs PIM on both ends of the link.</li>
<li>"Incoming interface: Null" off the RP means RPF trouble; check <code>show ip rpf</code>.</li>
<li>Fix RPF without touching unicast using <code>ip mroute</code> for both the RP and the source.</li>
<li>If routers forward but hosts do not receive, check IGMP snooping and mrouter ports.</li>
</ul></div>
`,hi:`
<p>Jab kitchen ka nal sookh jaata hai, plumber reservoir se shuru nahi karta. Woh nal se shuru karta hai aur pipe ke saath peeche chalta hai: kya nal khula hai, kya sink ke neeche wala valve khula hai, kya deewar ki pipe judi hai, kya main valve on hai? Multicast troubleshooting bhi aise hi hota hai: <b>receiver se shuru karo aur source ki taraf upstream chalo</b>, ek ek layer check karte hue. Yeh chapter aapko workflow deta hai aur phir troubleshooting lab ko bilkul waise walk karta hai jaise aap karoge.</p>

<h3>Chhe step ka workflow</h3>
<ol>
<li><b>Receiver aur IGMP.</b> Last-hop router par: <code>show ip igmp groups</code>. Entry nahi matlab host ne join nahi kiya, LAN interface par IGMP/PIM enabled nahi, IGMP version galat hai (SSM ko v3 chahiye), ya koi ACL (<code>ip igmp access-group</code>) ise filter kar raha hai. Switches par <code>show ip igmp snooping groups</code> check karo.</li>
<li><b>Har hop par multicast routing aur PIM.</b> Hop by hop <code>show ip pim interface</code> aur <code>show ip pim neighbor</code>. Path ke har link ke <b>dono</b> ends par PIM chahiye, aur har router par <code>ip multicast-routing</code>.</li>
<li><b>RP.</b> Kai routers par <code>show ip pim rp mapping</code>. Har router ko group ke liye same RP dikhana chahiye. <code>RP 0.0.0.0</code> dikhane wala (*,G) matlab koi RP pata nahi.</li>
<li><b>RPF.</b> <code>show ip rpf &lt;RP&gt;</code> aur <code>show ip rpf &lt;source&gt;</code>. RPF interface PIM-enabled hona chahiye aur RPF neighbour PIM neighbour. <code>show ip mroute</code> mein <code>Incoming interface: Null</code> classic lakshan hai.</li>
<li><b>Tree state.</b> Receiver se source tak <code>show ip mroute &lt;group&gt;</code>: kya har router ka incoming interface aur outgoing list sahi hai? Kya RP ke paas (S,G) hai? Kya first-hop router ab bhi khaali list ke saath F dikha raha hai (registers fail)?</li>
<li><b>Data.</b> Forwarded packets aur RPF failures ke liye <code>show ip mroute count</code>; source ka TTL check karo (kai applications TTL 1 ke saath bhejti hain, jo LAN se bahar nahi jaata). Application ke bina test: door ke router par <code>ip igmp join-group</code>, phir source side se group ko <code>ping</code> karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting lab topology">
<rect x="20" y="200" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="75" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.1.1.10</text>
<rect x="110" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="150" y="143" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="265" y="25" width="110" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">R2 = RP</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">2.2.2.2</text>
<rect x="450" y="120" width="80" height="36" rx="6" fill="#bae6fd"/><text x="490" y="143" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="510" y="200" width="110" height="36" rx="6" fill="#fde68a"/><text x="565" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC3 10.3.3.10</text>
<line x1="75" y1="200" x2="130" y2="156" stroke="#64748b" stroke-width="2"/><line x1="510" y1="156" x2="555" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="180" y1="120" x2="280" y2="65" stroke="#64748b" stroke-width="3"/><text x="160" y="85" class="svg-muted" font-size="11">PIM, cost 1</text>
<line x1="360" y1="65" x2="470" y2="120" stroke="#64748b" stroke-width="3"/><text x="420" y="80" class="svg-accent" font-size="11">cost 100, PIM sirf R3 par</text>
<line x1="190" y1="145" x2="450" y2="145" stroke="#64748b" stroke-dasharray="6 4" stroke-width="2"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">10.0.13.0/24 unicast-only backup, cost 1, PIM nahi</text>
</svg><p class="cap">Troubleshooting lab: PIM path R1-R2-R3 hai, par OSPF backup link R1-R3 pasand karta hai.</p></div>

<h3>Lab walk: fault 1, missing ip pim</h3>
<p>Ticket: PC3 239.20.20.20 join kiye hue hai par change window ke baad PC1 se kuch nahi mil raha. Step 1 theek hai: R3 Gi0/0 par group dikhata hai. R3 par step 2:</p>
<pre class="out">R3# show ip pim neighbor
PIM Neighbor Table
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
<span class="hl">(no entries)</span>

R2# show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
2.2.2.2          Loopback0                v2/S   0      30     1          2.2.2.2
10.0.12.2        GigabitEthernet0/1       v2/S   1      30     1          10.0.12.2</pre>
<p>R2 mein Gi0/2 list hi nahi hai: R2-R3 link ke R2 wale side par PIM missing hai. R3 par wahan <code>ip pim sparse-mode</code> hai, par dono ends se hello chahiye.</p>
<pre class="code">R2(config)# interface GigabitEthernet0/2
R2(config-if)# ip pim sparse-mode</pre>
<p>Ab R3 ko 10.0.23.2 neighbour dikhta hai aur R2 ko 10.0.23.3. Task 1 ho gaya, par stream ab bhi nahi aata.</p>

<h3>Lab walk: fault 2, RPF failure</h3>
<pre class="out">R3# show ip mroute 239.20.20.20
(*, 239.20.20.20), 00:12:40/00:02:21, RP 2.2.2.2, flags: SC
<span class="hl">  Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:12:40/00:02:21

R3# show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
<span class="hl">  RPF interface: GigabitEthernet0/1
  RPF neighbor: ? (10.0.13.1)</span>
  RPF route/mask: 2.2.2.2/32
  RPF type: unicast (ospf 1)</pre>
<p>RP pata hai, par uski taraf RPF interface <b>GigabitEthernet0/1</b> hai, backup link, jahan PIM nahi. Lab task 2 ka jawab yahi hai. OSPF ne ise chuna kyunki R2-R3 ki cost 100 hai jabki R3-R1-R2 ki 3. Rules backup par PIM on karna aur OSPF badalna mana karte hain, isliye static mroutes use karo, RP ke liye aur source LAN ke liye:</p>
<pre class="code">R3(config)# ip mroute 2.2.2.2 255.255.255.255 10.0.23.2
R3(config)# ip mroute 10.1.1.0 255.255.255.0 10.0.23.2</pre>
<pre class="out">R3# show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
<span class="hl">  RPF interface: GigabitEthernet0/2
  RPF neighbor: ? (10.0.23.2)</span>
  RPF route/mask: 2.2.2.2/32
<span class="hl">  RPF type: multicast (static)</span>

R3# show ip route 2.2.2.2 | include via
  Known via "ospf 1", distance 110, metric 3, type intra area
  * 10.0.13.1, from 2.2.2.2, 00:25:10 ago, via GigabitEthernet0/1</pre>
<p>RPF hil gaya; unicast nahi hila. Phir PC1 stream dobara shuru karta hai (<code>mcast 239.20.20.20 10</code>):</p>
<pre class="out">R3# show ip mroute 239.20.20.20
(*, 239.20.20.20), 00:14:02/00:02:58, RP 2.2.2.2, flags: SJC
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2, Mroute
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:14:02/00:02:58

<span class="hl">(10.1.1.10, 239.20.20.20), 00:00:20/00:02:39, flags: T
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2, Mroute</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:20/00:02:39</pre>
<p>RPF neighbour ke baad "Mroute" dikhata hai ki RPF static mroute se aaya. (S,G) par incoming Gi0/2 ke saath T hai, aur PC3 par <code>show mcast</code> packets ginta hai. Ticket closed.</p>

<div class="eg"><p><b>Worked example: source mroute kyun zaroori hai.</b> Sirf RP mroute ke saath shared tree kaam karta hai aur PC3 ko R2 ke through pehle packets milte hain. Phir R3 SPT par switch karta hai aur 10.1.1.10 ki taraf RPF lookup karta hai: OSPF kehta hai Gi0/2 via R2 (cost 102) ki jagah Gi0/1 via R1 (cost 2). (S,G) ko Incoming interface Null milta hai aur kuch packets ke baad stream ruk jaata hai. Doosra mroute source tree ko PIM path par rakhta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek fault theek karke ruk jaana. Multicast failures aksar layered hote hain: PIM adjacency theek karo, phir RP dobara check karo, phir RP ki taraf RPF, phir source ki taraf RPF, aur aakhir mein data counters.</p></div>

<div class="exam"><p><b>Exam trap.</b> Non-RP router par "Incoming interface: Null" matlab RPF problem (route nahi, ya RPF interface par PIM nahi). RP par khud Null incoming wala (*,G) normal hai. RPF failures <code>show ip mroute count</code> mein "RPF failed" ki tarah dikhte hain.</p></div>

<div class="scn"><h4>Stream router tak pahuncha par PCs tak nahi</h4><p>Ek branch router perfect state dikha raha tha: T ke saath (S,G), LAN interface se forwarded packets gine ja rahe the, aur <code>show ip igmp groups</code> mein group list tha. Phir bhi kisi PC ko video nahi mila. Access switch par <code>show ip igmp snooping groups</code> sahi ports dikha raha tha, isliye snooping theek thi. Phir engineer ne VLAN ki security policy check ki: pichhle hafte joda gaya ek VLAN access map PCs ki taraf sirf kuch TCP aur UDP ports permit karta tha aur baaki sab drop karta tha, 239.20.20.20 wala UDP bhi. 239.20.0.0/16 video groups ke liye permit jodte hi stream wapas aa gaya.</p><p><b>Seekh:</b> jab router forward kare par hosts ko kuch na mile, Layer 2 par utro: pehle snooping state, phir koi bhi VLAN ya port ACLs.</p></div>

<div class="iv"><p class="q">"Users ne group join kiya par traffic nahi mil raha. Kaise troubleshoot karoge?"</p><p>Strong answer: receiver se upstream kaam karo. Last-hop router par IGMP membership aur switch par snooping check karo; har hop par <code>ip multicast-routing</code> aur PIM neighbours check karo; confirm karo ki har router group ko same RP par map karta hai; <code>show ip rpf</code> se RP aur source ki taraf RPF check karo; Null incoming interfaces ya pruned lists ke liye <code>show ip mroute</code> padho; aakhir mein counters aur TTL check karo. RPF fixes ke liye static mroutes ka zikr karo jo unicast ko nahi chhoone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Receiver se source tak chalo: IGMP, PIM neighbours, RP, RPF, mroute state, data counters.</li>
<li>PIM adjacency ke liye link ke dono ends par PIM chahiye.</li>
<li>RP ke alawa kahin "Incoming interface: Null" matlab RPF ki dikkat; <code>show ip rpf</code> check karo.</li>
<li>Unicast chhue bina RPF theek karne ke liye RP aur source dono ke liye <code>ip mroute</code> use karo.</li>
<li>Agar routers forward karein par hosts ko na mile, IGMP snooping aur mrouter ports check karo.</li>
</ul></div>
`}};export{e as default};