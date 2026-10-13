var e={id:`pim-basics-dense`,h:{en:`PIM basics: neighbours, DR, assert and dense mode`,hi:`PIM basics: neighbours, DR, assert aur dense mode`},body:{en:`
<p>Before two shopkeepers can agree to share deliveries, they have to meet and exchange phone numbers. On a street with many shops, one of them is chosen to deal with the supplier for everybody, so the supplier does not get ten orders for the same thing. PIM routers do the same: they discover neighbours with hellos, elect a <b>Designated Router</b> on each LAN, and settle arguments about who forwards with an <b>assert</b>.</p>

<h3>Turning multicast routing on</h3>
<p>Two steps, on every router in the path:</p>
<pre class="code"><span class="c">! 1. Global: allow the router to forward multicast at all</span>
ip multicast-routing
<span class="c">!    (IOS XE routers such as ISR 4000 and Catalyst 8000 use: ip multicast-routing distributed)</span>
<span class="c">! 2. Per interface: run PIM (this also enables IGMP)</span>
interface GigabitEthernet0/1
 ip pim sparse-mode</pre>
<p>Without step 1, IOS accepts <code>ip pim</code> but warns that multicast routing is not enabled, and nothing is forwarded. Enable PIM on <b>every</b> interface that can be part of a tree: transit links, receiver LANs, source LANs, and the loopback used as an RP.</p>

<h3>PIM messages and neighbours</h3>
<p>PIM version 2 runs directly over IP as <b>protocol 103</b>. Most messages go to <b>224.0.0.13</b> (all PIM routers) with TTL 1. The exceptions are <b>Register</b> and <b>Register-Stop</b> (unicast between the first-hop router and the RP) and BSR candidate-RP advertisements (unicast to the BSR).</p>
<table class="cmp">
<tr><th>Message</th><th>Purpose</th></tr>
<tr><td>Hello</td><td>Discover neighbours, carry DR priority; every <b>30 s</b>, hold time <b>105 s</b> (3.5 x)</td></tr>
<tr><td>Join/Prune</td><td>Add or remove a branch of a tree; refreshed every 60 s</td></tr>
<tr><td>Register / Register-Stop</td><td>Sparse mode: tunnel a new source's packets to the RP, and stop that</td></tr>
<tr><td>Assert</td><td>Elect a single forwarder when two routers would send the same stream onto a LAN</td></tr>
<tr><td>Bootstrap / Candidate-RP-Advertisement</td><td>BSR RP discovery (chapter 9)</td></tr>
<tr><td>Graft / Graft-Ack, State Refresh</td><td>Dense mode only</td></tr>
</table>
<pre class="out">R2# show ip pim neighbor
PIM Neighbor Table
Mode: B - Bidir Capable, DR - Designated Router, N - Default DR Priority,
      P - Proxy Capable, S - State Refresh Capable, G - GenID Capable,
      L - DR Load-balancing Capable
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
<span class="hl">10.0.12.1         GigabitEthernet0/1       00:06:10/00:01:33 v2    1 / S P G
10.0.23.3         GigabitEthernet0/2       00:06:02/00:01:41 v2    1 / DR S P G
10.0.24.4         GigabitEthernet0/3       00:05:58/00:01:15 v2    1 / DR S P G</span>

R2# show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
2.2.2.2          Loopback0                v2/S   0      30     1          2.2.2.2
10.0.12.2        GigabitEthernet0/1       v2/S   1      30     1          10.0.12.2
10.0.23.2        GigabitEthernet0/2       v2/S   1      30     1          10.0.23.3
10.0.24.2        GigabitEthernet0/3       v2/S   1      30     1          10.0.24.4</pre>
<p>This is the configuration lab after task 1: R2 sees three neighbours. "v2/S" means PIMv2 in sparse mode. A loopback always has 0 neighbours, which is normal.</p>

<h3>The Designated Router (DR)</h3>
<p>On every multi-access segment PIM elects one <b>DR</b>: the <b>highest DR priority</b> wins (default 1, set with <code>ip pim dr-priority</code>), then the <b>highest IP address</b>. The DR matters on LANs with hosts:</p>
<ul>
<li>On a <b>receiver LAN</b>, only the DR sends PIM joins toward the RP or source, so the stream is not pulled twice.</li>
<li>On a <b>source LAN</b>, only the DR registers the source with the RP.</li>
</ul>
<p>Remember from chapter 3: the IGMPv2 <b>querier</b> is the <b>lowest</b> IP, the PIM <b>DR</b> the <b>highest</b>. They are often different routers.</p>

<h3>Assert: one forwarder per LAN</h3>
<p>If two routers both have a LAN in their outgoing list, each would send a copy onto it. When a router receives a multicast packet on an interface that is in its <b>own</b> outgoing list, it knows another router is forwarding there too, and both send <b>Assert</b> messages. The winner forwards; the loser prunes that interface. Assert winner: <b>lowest administrative distance</b> to the source, then <b>lowest metric</b>, then <b>highest IP</b>. The assert winner is flagged <b>A</b> in the outgoing list. Asserts exist in dense and sparse mode.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PIM dense mode flood and prune">
<rect x="20" y="95" width="80" height="36" rx="6" fill="#bbf7d0"/><text x="60" y="118" text-anchor="middle" class="svg-ink" font-size="13">Source</text>
<rect x="150" y="95" width="60" height="36" rx="6" fill="#bae6fd"/><text x="180" y="118" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="300" y="30" width="60" height="36" rx="6" fill="#bae6fd"/><text x="330" y="53" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="300" y="160" width="60" height="36" rx="6" fill="#bae6fd"/><text x="330" y="183" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="450" y="30" width="80" height="36" rx="6" fill="#fde68a"/><text x="490" y="53" text-anchor="middle" class="svg-ink" font-size="12">receivers</text>
<rect x="450" y="160" width="80" height="36" rx="6" fill="#e2e8f0"/><text x="490" y="183" text-anchor="middle" class="svg-muted" font-size="12">nobody</text>
<line x1="100" y1="113" x2="150" y2="113" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="105" x2="300" y2="50" stroke="#64748b" stroke-width="3"/><line x1="360" y1="48" x2="450" y2="48" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="122" x2="300" y2="178" stroke="#64748b" stroke-dasharray="5 4" stroke-width="2"/>
<text x="220" y="175" class="svg-accent" font-size="12">1. flood</text><text x="365" y="150" class="svg-accent" font-size="12">2. Prune (no members)</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">3. Prune expires after about 3 minutes, flood again (unless State Refresh)</text>
</svg><p class="cap">Dense mode pushes traffic everywhere first and cuts branches that nobody wants.</p></div>

<h3>PIM dense mode (PIM-DM), briefly</h3>
<p>Dense mode assumes receivers are <b>everywhere</b>, a push model:</p>
<ol>
<li>When a source starts, every router floods the traffic out of all PIM interfaces (after the RPF check), building an (S,G) source tree to every corner of the network.</li>
<li>A router with no receivers and no downstream neighbours sends a <b>Prune</b> upstream. The branch is cut.</li>
<li>Prunes time out after about <b>3 minutes</b> and the flood repeats, unless <b>State Refresh</b> messages keep the pruned state alive.</li>
<li>If a receiver appears on a pruned branch, the router sends a <b>Graft</b> to reattach at once.</li>
</ol>
<p>Dense mode needs no RP and is simple, but the periodic flooding wastes bandwidth and every router holds (S,G) state even where nobody listens. It suits only small networks with receivers on nearly every LAN. Modern enterprises run sparse mode. <code>ip pim sparse-dense-mode</code> runs a group in sparse mode if an RP is known for it and in dense mode otherwise, which was mainly used to bootstrap Auto-RP.</p>

<div class="eg"><p><b>Worked example: DR election.</b> A receiver LAN 10.3.3.0/24 has R3 (10.3.3.1) and R5 (10.3.3.2), both with default DR priority 1. Highest IP wins: R5 is DR and sends the joins. To make R3 the DR, configure <code>ip pim dr-priority 100</code> on R3's LAN interface. Election is preemptive, so R3 takes over as soon as its next hello arrives.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling PIM on one side of a link only. PIM needs a hello from both ends to form an adjacency; one side without PIM means no neighbour, no joins across that link, and a broken tree. This is fault 1 in the troubleshooting lab.</p></div>

<div class="exam"><p><b>Exam trap.</b> PIM hello = 30 s, hold = 105 s, sent to 224.0.0.13, IP protocol 103. DR = highest priority then highest IP. Assert winner = lowest AD, then lowest metric, then highest IP. Dense mode = flood and prune, no RP.</p></div>

<div class="scn"><h4>Double video on the classroom LAN</h4><p>A branch had two routers on the classroom LAN for redundancy. Students saw the stream stutter, and the LAN carried twice the expected bandwidth for a few seconds each time the stream restarted. <code>show ip mroute</code> on both routers showed the LAN in the outgoing list, and one entry carried the A (assert winner) flag. The brief doubling was the assert process doing its job. The stutter itself turned out to be a duplex mismatch on one router, which was fixed separately.</p><p><b>Lesson:</b> two routers forwarding onto one LAN is resolved by assert within seconds; the A flag shows the winner.</p></div>

<div class="iv"><p class="q">"How does a PIM router decide who is the DR, and what does the DR do?"</p><p>Strong answer: the highest DR priority wins (default 1), then the highest interface IP; the election is preemptive. On a receiver LAN the DR sends PIM joins for the hosts that reported with IGMP; on a source LAN it registers new sources with the RP. Contrast it with the IGMPv2 querier, which is the lowest IP, and with the assert winner, which decides who forwards data onto the LAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enable <code>ip multicast-routing</code> globally and <code>ip pim sparse-mode</code> on every interface in the path.</li>
<li>PIMv2: protocol 103, hellos every 30 s to 224.0.0.13, hold time 105 s.</li>
<li>DR = highest priority, then highest IP; it sends joins for receivers and registers sources.</li>
<li>Assert elects one forwarder per LAN: lowest AD, lowest metric, highest IP.</li>
<li>Dense mode floods then prunes every 3 minutes; sparse mode waits for explicit joins.</li>
</ul></div>
`,hi:`
<p>Do dukaandaar deliveries share karne par agree karein, usse pehle unhe milna aur phone numbers exchange karne padte hain. Kai dukaanon wali gali mein ek ko sabke liye supplier se deal karne ke liye chuna jaata hai, taaki supplier ko ek hi cheez ke das orders na milein. PIM routers yahi karte hain: hellos se neighbours dhoondhte hain, har LAN par ek <b>Designated Router</b> elect karte hain, aur kaun forward karega is jhagde ko <b>assert</b> se suljhate hain.</p>

<h3>Multicast routing on karna</h3>
<p>Path ke har router par do steps:</p>
<pre class="code"><span class="c">! 1. Global: router ko multicast forward karne ki ijaazat do</span>
ip multicast-routing
<span class="c">!    (ISR 4000 aur Catalyst 8000 jaise IOS XE routers use karte hain: ip multicast-routing distributed)</span>
<span class="c">! 2. Har interface par: PIM chalao (isse IGMP bhi on hota hai)</span>
interface GigabitEthernet0/1
 ip pim sparse-mode</pre>
<p>Step 1 ke bina IOS <code>ip pim</code> accept kar leta hai par warning deta hai ki multicast routing enabled nahi hai, aur kuch forward nahi hota. PIM <b>har</b> us interface par enable karo jo tree ka hissa ban sakta hai: transit links, receiver LANs, source LANs, aur RP ki tarah use hone wala loopback.</p>

<h3>PIM messages aur neighbours</h3>
<p>PIM version 2 seedha IP ke upar <b>protocol 103</b> ki tarah chalta hai. Zyada tar messages TTL 1 ke saath <b>224.0.0.13</b> (all PIM routers) par jaate hain. Exceptions hain <b>Register</b> aur <b>Register-Stop</b> (first-hop router aur RP ke beech unicast) aur BSR candidate-RP advertisements (BSR ko unicast).</p>
<table class="cmp">
<tr><th>Message</th><th>Kaam</th></tr>
<tr><td>Hello</td><td>Neighbours dhoondhna, DR priority le jaana; har <b>30 s</b>, hold time <b>105 s</b> (3.5 x)</td></tr>
<tr><td>Join/Prune</td><td>Tree ki shaakh jodna ya hatana; har 60 s refresh</td></tr>
<tr><td>Register / Register-Stop</td><td>Sparse mode: naye source ke packets RP tak tunnel karna, aur use rokna</td></tr>
<tr><td>Assert</td><td>Jab do routers ek LAN par same stream bhejein, ek forwarder elect karna</td></tr>
<tr><td>Bootstrap / Candidate-RP-Advertisement</td><td>BSR RP discovery (chapter 9)</td></tr>
<tr><td>Graft / Graft-Ack, State Refresh</td><td>Sirf dense mode</td></tr>
</table>
<pre class="out">R2# show ip pim neighbor
PIM Neighbor Table
Mode: B - Bidir Capable, DR - Designated Router, N - Default DR Priority,
      P - Proxy Capable, S - State Refresh Capable, G - GenID Capable,
      L - DR Load-balancing Capable
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
<span class="hl">10.0.12.1         GigabitEthernet0/1       00:06:10/00:01:33 v2    1 / S P G
10.0.23.3         GigabitEthernet0/2       00:06:02/00:01:41 v2    1 / DR S P G
10.0.24.4         GigabitEthernet0/3       00:05:58/00:01:15 v2    1 / DR S P G</span>

R2# show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
2.2.2.2          Loopback0                v2/S   0      30     1          2.2.2.2
10.0.12.2        GigabitEthernet0/1       v2/S   1      30     1          10.0.12.2
10.0.23.2        GigabitEthernet0/2       v2/S   1      30     1          10.0.23.3
10.0.24.2        GigabitEthernet0/3       v2/S   1      30     1          10.0.24.4</pre>
<p>Yeh configuration lab ka task 1 ke baad ka haal hai: R2 ko teen neighbours dikhte hain. "v2/S" matlab sparse mode mein PIMv2. Loopback ke hamesha 0 neighbours hote hain, jo normal hai.</p>

<h3>Designated Router (DR)</h3>
<p>Har multi-access segment par PIM ek <b>DR</b> elect karta hai: <b>sabse zyada DR priority</b> jeetti hai (default 1, <code>ip pim dr-priority</code> se set), phir <b>sabse bada IP address</b>. DR hosts wale LANs par matter karta hai:</p>
<ul>
<li><b>Receiver LAN</b> par sirf DR RP ya source ki taraf PIM joins bhejta hai, taaki stream do baar na khinche.</li>
<li><b>Source LAN</b> par sirf DR source ko RP ke saath register karta hai.</li>
</ul>
<p>Chapter 3 se yaad rakho: IGMPv2 <b>querier</b> <b>sabse chhota</b> IP hai, PIM <b>DR</b> <b>sabse bada</b>. Aksar yeh alag routers hote hain.</p>

<h3>Assert: har LAN par ek forwarder</h3>
<p>Agar do routers dono ki outgoing list mein ek LAN hai, to dono us par copy bhejenge. Jab router ko multicast packet us interface par milta hai jo uski <b>apni</b> outgoing list mein hai, use pata chal jaata hai ki koi aur router bhi wahan forward kar raha hai, aur dono <b>Assert</b> messages bhejte hain. Winner forward karta hai; loser us interface ko prune karta hai. Assert winner: source tak <b>sabse kam administrative distance</b>, phir <b>sabse kam metric</b>, phir <b>sabse bada IP</b>. Assert winner outgoing list mein <b>A</b> flag se dikhta hai. Asserts dense aur sparse dono mode mein hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PIM dense mode flood and prune">
<rect x="20" y="95" width="80" height="36" rx="6" fill="#bbf7d0"/><text x="60" y="118" text-anchor="middle" class="svg-ink" font-size="13">Source</text>
<rect x="150" y="95" width="60" height="36" rx="6" fill="#bae6fd"/><text x="180" y="118" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="300" y="30" width="60" height="36" rx="6" fill="#bae6fd"/><text x="330" y="53" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="300" y="160" width="60" height="36" rx="6" fill="#bae6fd"/><text x="330" y="183" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="450" y="30" width="80" height="36" rx="6" fill="#fde68a"/><text x="490" y="53" text-anchor="middle" class="svg-ink" font-size="12">receivers</text>
<rect x="450" y="160" width="80" height="36" rx="6" fill="#e2e8f0"/><text x="490" y="183" text-anchor="middle" class="svg-muted" font-size="12">koi nahi</text>
<line x1="100" y1="113" x2="150" y2="113" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="105" x2="300" y2="50" stroke="#64748b" stroke-width="3"/><line x1="360" y1="48" x2="450" y2="48" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="122" x2="300" y2="178" stroke="#64748b" stroke-dasharray="5 4" stroke-width="2"/>
<text x="220" y="175" class="svg-accent" font-size="12">1. flood</text><text x="365" y="150" class="svg-accent" font-size="12">2. Prune (members nahi)</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">3. Lagbhag 3 minute baad prune expire, phir flood (State Refresh na ho to)</text>
</svg><p class="cap">Dense mode pehle traffic har jagah dhakelta hai aur jo shaakhein kisi ko nahi chahiye unhe kaat deta hai.</p></div>

<h3>PIM dense mode (PIM-DM), sankshep mein</h3>
<p>Dense mode maanta hai ki receivers <b>har jagah</b> hain, ek push model:</p>
<ol>
<li>Source shuru hote hi har router traffic ko saare PIM interfaces se flood karta hai (RPF check ke baad), network ke har kone tak (S,G) source tree banata hai.</li>
<li>Jis router ke paas na receivers hain na downstream neighbours, woh upstream <b>Prune</b> bhejta hai. Shaakh kat jaati hai.</li>
<li>Prunes lagbhag <b>3 minute</b> baad time out hote hain aur flood dobara hota hai, jab tak <b>State Refresh</b> messages pruned state ko zinda na rakhein.</li>
<li>Agar pruned branch par receiver aa jaaye, router turant wapas judne ke liye <b>Graft</b> bhejta hai.</li>
</ol>
<p>Dense mode ko RP nahi chahiye aur simple hai, par baar baar flooding bandwidth barbaad karti hai aur har router (S,G) state rakhta hai jahan koi sun bhi nahi raha. Yeh sirf chhote networks ke liye theek hai jahan lagbhag har LAN par receivers hon. Modern enterprises sparse mode chalate hain. <code>ip pim sparse-dense-mode</code> group ko sparse mode mein chalata hai agar uska RP pata ho, warna dense mode mein, jo mainly Auto-RP bootstrap karne ke liye use hota tha.</p>

<div class="eg"><p><b>Worked example: DR election.</b> Receiver LAN 10.3.3.0/24 par R3 (10.3.3.1) aur R5 (10.3.3.2) hain, dono default DR priority 1 ke saath. Sabse bada IP jeetta hai: R5 DR hai aur joins bhejta hai. R3 ko DR banane ke liye R3 ke LAN interface par <code>ip pim dr-priority 100</code> configure karo. Election preemptive hai, isliye R3 ka agla hello aate hi woh DR ban jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Link ke sirf ek side par PIM enable karna. Adjacency ke liye PIM ko dono ends se hello chahiye; ek side bina PIM matlab koi neighbour nahi, us link ke paar koi joins nahi, aur toota hua tree. Troubleshooting lab ka fault 1 yahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> PIM hello = 30 s, hold = 105 s, 224.0.0.13 par, IP protocol 103. DR = sabse zyada priority phir sabse bada IP. Assert winner = sabse kam AD, phir sabse kam metric, phir sabse bada IP. Dense mode = flood and prune, koi RP nahi.</p></div>

<div class="scn"><h4>Classroom LAN par double video</h4><p>Ek branch mein redundancy ke liye classroom LAN par do routers the. Students ko stream atakta dikha, aur har baar stream restart hone par kuch seconds tak LAN par expected se double bandwidth chalti. Dono routers par <code>show ip mroute</code> mein LAN outgoing list mein tha, aur ek entry par A (assert winner) flag tha. Thodi der ka doubling assert process ka apna kaam tha. Atakna asal mein ek router par duplex mismatch nikla, jo alag se theek kiya gaya.</p><p><b>Seekh:</b> ek LAN par do routers ka forward karna assert seconds mein suljha deta hai; A flag winner dikhata hai.</p></div>

<div class="iv"><p class="q">"PIM router kaise decide karta hai ki DR kaun hai, aur DR kya karta hai?"</p><p>Strong answer: sabse zyada DR priority jeetti hai (default 1), phir sabse bada interface IP; election preemptive hai. Receiver LAN par DR un hosts ke liye PIM joins bhejta hai jinhone IGMP se report kiya; source LAN par naye sources ko RP ke saath register karta hai. Ise IGMPv2 querier se compare karo, jo sabse chhota IP hai, aur assert winner se, jo decide karta hai LAN par data kaun forward karega.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Global mein <code>ip multicast-routing</code> aur path ke har interface par <code>ip pim sparse-mode</code> enable karo.</li>
<li>PIMv2: protocol 103, har 30 s 224.0.0.13 par hellos, hold time 105 s.</li>
<li>DR = sabse zyada priority, phir sabse bada IP; receivers ke liye joins bhejta hai aur sources register karta hai.</li>
<li>Assert har LAN par ek forwarder elect karta hai: sabse kam AD, sabse kam metric, sabse bada IP.</li>
<li>Dense mode flood karta hai phir har 3 minute prune; sparse mode explicit joins ka wait karta hai.</li>
</ul></div>
`}};export{e as default};