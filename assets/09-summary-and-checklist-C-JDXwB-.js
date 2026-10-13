var e={id:`summary-and-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now know how PIM builds multicast trees. This last chapter collects what you must be able to do, the words you must be able to explain, the numbers and facts exams like to ask, and a command sheet you can keep next to the lab.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why PIM is called protocol independent and what it takes from the unicast table.</li>
<li>I can enable <code>ip multicast-routing</code> and PIM sparse mode on every path interface, and point all routers at one RP.</li>
<li>I can read <code>show ip pim neighbor</code> and <code>show ip pim interface</code>, and say who the DR is and why.</li>
<li>I can steer the DR with <code>ip pim dr-priority</code>.</li>
<li>I can narrate PIM-SM: (*,G) join to the RP, register, (S,G) join, Register-Stop, switch to the shortest-path tree.</li>
<li>I can read every flag (S, C, F, T, J, P, R, s, I), the incoming interface, the RPF neighbour and the outgoing list.</li>
<li>I can keep a group on the shared tree with <code>ip pim spt-threshold infinity</code> on the last-hop router.</li>
<li>I can deliver a channel with SSM: <code>ip pim ssm default</code>, IGMPv3 on the receiver LAN, no RP.</li>
<li>I can troubleshoot in the order receiver, neighbours, RP, tree, source.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PIM</dt><dd>Protocol Independent Multicast: signalling that builds multicast trees from the unicast routing table.</dd>
<dt>RP</dt><dd>Rendezvous point: the router where shared trees are rooted and sources are registered.</dd>
<dt>DR</dt><dd>Designated router: the one router per LAN that joins for receivers and registers sources.</dd>
<dt>(*,G)</dt><dd>Shared-tree entry: any source, group G, rooted at the RP.</dd>
<dt>(S,G)</dt><dd>Source-tree entry: source S, group G, along the shortest path.</dd>
<dt>RPF</dt><dd>Reverse path forwarding: the interface toward a source or RP according to the unicast table.</dd>
<dt>OIL</dt><dd>Outgoing interface list: where the router copies the stream.</dd>
<dt>SSM</dt><dd>Source-specific multicast: receivers join (S,G), no RP, range 232.0.0.0/8 by default.</dd>
<dt>SPT threshold</dt><dd>The rule that decides when a last-hop router leaves the shared tree.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>PIM Hello address and protocol</td><td>224.0.0.13, IP protocol 103</td></tr>
<tr><td>Hello interval / holdtime</td><td>30 s / 105 s</td></tr>
<tr><td>Join/Prune refresh / holdtime</td><td>60 s / 210 s</td></tr>
<tr><td>DR election</td><td>Highest priority, then highest IP (default priority 1)</td></tr>
<tr><td>IGMP querier election</td><td>Lowest IP address</td></tr>
<tr><td>RP shows incoming interface</td><td>Null for (*,G)</td></tr>
<tr><td>(S,G) lifetime without data</td><td>About 3 minutes</td></tr>
<tr><td>Default SPT behaviour</td><td>Switch on the first packet</td></tr>
<tr><td>SSM default range</td><td>232.0.0.0/8, needs IGMPv3 at the receiver edge</td></tr>
<tr><td>Flag meanings</td><td>S sparse, C connected, F register, T SPT bit, J join SPT, P pruned, s SSM, I source-specific report</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">ip multicast-routing                       <span class="c">! global switch</span>
interface GigabitEthernet0/1
 ip pim sparse-mode                         <span class="c">! on every path interface</span>
 ip pim dr-priority 200                     <span class="c">! choose the DR</span>
 ip igmp version 3                          <span class="c">! receiver LAN for SSM</span>
ip pim rp-address 2.2.2.2                   <span class="c">! same on every router</span>
ip pim spt-threshold infinity               <span class="c">! stay on the shared tree</span>
ip pim ssm default                          <span class="c">! 232.0.0.0/8 is SSM</span>

show ip pim neighbor | interface | rp mapping
show ip igmp groups | interface
show ip mroute [group]
show ip rpf &lt;address&gt;</pre>

<div class="eg"><p><b>Worked example.</b> Self-test. A last-hop router shows (*,G) with incoming interface Null and flag SC. Which layer? The tree, caused by a layer before it: the router has no RPF path through a PIM neighbour toward the RP. You would run <code>show ip rpf</code> for the RP and <code>show ip pim neighbor</code> on that interface.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Mixing the Hello and Join/Prune timers; confusing the DR (highest) with the IGMP querier (lowest); forgetting that SSM needs IGMPv3 and that the threshold lives on the last-hop router.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often show only an mroute entry and ask what is wrong. Read the incoming interface first (Null?), then the OIL (Null?), then the flags.</p></div>

<div class="scn"><h4>The handover</h4><p>An engineer leaving a team wrote three lines in the handover note: "Neighbours first, RP second, mroute third." Her replacement fixed four multicast tickets in his first week with those lines alone. He added a fourth line later: "IGMP version on SSM LANs".</p><p><b>Lesson:</b> a short, ordered method is worth more than a thick manual.</p></div>

<div class="iv"><p class="q">"Summarise PIM sparse mode and SSM in one minute."</p><p>Strong answer: sparse mode builds trees only where receivers joined: last-hop routers send (*,G) joins toward the RP, sources are registered, then the last-hop router switches to the shortest-path tree. SSM skips the RP: receivers use IGMPv3 to ask for (S,G) and the join goes straight to the source. Add DR election and the SPT threshold as the two knobs you control, and the layered troubleshooting order.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Next in the track: rendezvous points (static, Auto-RP, BSR, anycast) and RPF with mroute troubleshooting.</li>
<li>Keep the timers straight: 30/105 for Hello, 60/210 for Join/Prune.</li>
<li>Flags, incoming interface and OIL tell the whole story of an entry.</li>
<li>SSM = (S,G) + IGMPv3 + no RP; ASM = (*,G) + RP.</li>
<li>Layered troubleshooting: receiver, neighbours, RP, tree, source.</li>
</ul></div>
`,hi:`
<p>Ab aap jaante ho ki PIM multicast trees kaise banata hai. Yeh aakhri chapter woh sab ikattha karta hai jo aapko karna aana chahiye, jin shabdon ko aapko samjhana aana chahiye, woh numbers aur facts jo exams puchna pasand karte hain, aur ek command sheet jo aap lab ke paas rakh sakte ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki PIM ko protocol independent kyun kehte hain aur woh unicast table se kya leta hai.</li>
<li>Main har path interface par <code>ip multicast-routing</code> aur PIM sparse mode enable kar sakta hoon, aur saare routers ko ek RP par point kar sakta hoon.</li>
<li>Main <code>show ip pim neighbor</code> aur <code>show ip pim interface</code> padh sakta hoon, aur bata sakta hoon ki DR kaun hai aur kyun.</li>
<li>Main <code>ip pim dr-priority</code> se DR steer kar sakta hoon.</li>
<li>Main PIM-SM narrate kar sakta hoon: RP ko (*,G) join, register, (S,G) join, Register-Stop, shortest-path tree par switch.</li>
<li>Main har flag (S, C, F, T, J, P, R, s, I), incoming interface, RPF neighbour aur outgoing list padh sakta hoon.</li>
<li>Main last-hop router par <code>ip pim spt-threshold infinity</code> se group ko shared tree par rakh sakta hoon.</li>
<li>Main SSM se channel deliver kar sakta hoon: <code>ip pim ssm default</code>, receiver LAN par IGMPv3, RP nahi.</li>
<li>Main receiver, neighbours, RP, tree, source ke order mein troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>PIM</dt><dd>Protocol Independent Multicast: signalling jo unicast routing table se multicast trees banati hai.</dd>
<dt>RP</dt><dd>Rendezvous point: woh router jahan shared trees rooted hote hain aur sources register hote hain.</dd>
<dt>DR</dt><dd>Designated router: har LAN par ek router jo receivers ke liye join karta hai aur sources register karta hai.</dd>
<dt>(*,G)</dt><dd>Shared-tree entry: koi bhi source, group G, RP par rooted.</dd>
<dt>(S,G)</dt><dd>Source-tree entry: source S, group G, shortest path par.</dd>
<dt>RPF</dt><dd>Reverse path forwarding: unicast table ke hisaab se source ya RP ki taraf ka interface.</dd>
<dt>OIL</dt><dd>Outgoing interface list: jahan router stream ki copy karta hai.</dd>
<dt>SSM</dt><dd>Source-specific multicast: receivers (S,G) join karte hain, RP nahi, default range 232.0.0.0/8.</dd>
<dt>SPT threshold</dt><dd>Woh rule jo tay karta hai ki last-hop router shared tree kab chhode.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>PIM Hello address aur protocol</td><td>224.0.0.13, IP protocol 103</td></tr>
<tr><td>Hello interval / holdtime</td><td>30 s / 105 s</td></tr>
<tr><td>Join/Prune refresh / holdtime</td><td>60 s / 210 s</td></tr>
<tr><td>DR election</td><td>Sabse badi priority, phir sabse bada IP (default priority 1)</td></tr>
<tr><td>IGMP querier election</td><td>Sabse chhota IP address</td></tr>
<tr><td>RP par incoming interface</td><td>(*,G) ke liye Null</td></tr>
<tr><td>Bina data ke (S,G) ki life</td><td>Lagbhag 3 minute</td></tr>
<tr><td>Default SPT behaviour</td><td>Pehle packet par switch</td></tr>
<tr><td>SSM default range</td><td>232.0.0.0/8, receiver edge par IGMPv3 chahiye</td></tr>
<tr><td>Flag ke matlab</td><td>S sparse, C connected, F register, T SPT bit, J join SPT, P pruned, s SSM, I source-specific report</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">ip multicast-routing                       <span class="c">! global switch</span>
interface GigabitEthernet0/1
 ip pim sparse-mode                         <span class="c">! har path interface par</span>
 ip pim dr-priority 200                     <span class="c">! DR chuno</span>
 ip igmp version 3                          <span class="c">! SSM ke liye receiver LAN</span>
ip pim rp-address 2.2.2.2                   <span class="c">! har router par same</span>
ip pim spt-threshold infinity               <span class="c">! shared tree par raho</span>
ip pim ssm default                          <span class="c">! 232.0.0.0/8 SSM hai</span>

show ip pim neighbor | interface | rp mapping
show ip igmp groups | interface
show ip mroute [group]
show ip rpf &lt;address&gt;</pre>

<div class="eg"><p><b>Worked example.</b> Self-test. Ek last-hop router (*,G) dikhata hai incoming interface Null aur flag SC ke saath. Kaunsi layer? Tree, jiska karan usse pehle ki layer hai: router ke paas RP ki taraf PIM neighbour ke through RPF path nahi hai. Aap RP ke liye <code>show ip rpf</code> aur us interface par <code>show ip pim neighbor</code> chalaoge.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali common galtiyan.</b> Hello aur Join/Prune timers ko milana; DR (sabse bada) ko IGMP querier (sabse chhota) se confuse karna; yeh bhoolna ki SSM ko IGMPv3 chahiye aur threshold last-hop router par rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal aksar sirf ek mroute entry dikhate hain aur poochte hain kya galat hai. Pehle incoming interface padho (Null?), phir OIL (Null?), phir flags.</p></div>

<div class="scn"><h4>Handover</h4><p>Team chhodne wali ek engineer ne handover note mein teen lines likhin: "Pehle neighbours, doosre RP, teesra mroute." Uske replacement ne apne pehle hafte mein sirf in lines se chaar multicast tickets fix kiye. Usne baad mein chauthi line jodi: "SSM LANs par IGMP version".</p><p><b>Seekh:</b> chhota, ordered method mote manual se zyada keemti hai.</p></div>

<div class="iv"><p class="q">"PIM sparse mode aur SSM ko ek minute mein summarise karo."</p><p>Strong answer: sparse mode tree sirf wahin banata hai jahan receivers ne join kiya: last-hop routers RP ki taraf (*,G) joins bhejte hain, sources register hote hain, phir last-hop router shortest-path tree par switch karta hai. SSM RP skip karta hai: receivers IGMPv3 se (S,G) maangte hain aur join seedha source tak jaata hai. DR election aur SPT threshold ko do knobs ke roop mein jodo jo aap control karte ho, aur layered troubleshooting order.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Track mein agla: rendezvous points (static, Auto-RP, BSR, anycast) aur RPF ke saath mroute troubleshooting.</li>
<li>Timers seedhe rakho: Hello ke liye 30/105, Join/Prune ke liye 60/210.</li>
<li>Flags, incoming interface aur OIL entry ki poori kahani batate hain.</li>
<li>SSM = (S,G) + IGMPv3 + RP nahi; ASM = (*,G) + RP.</li>
<li>Layered troubleshooting: receiver, neighbours, RP, tree, source.</li>
</ul></div>
`}};export{e as default};