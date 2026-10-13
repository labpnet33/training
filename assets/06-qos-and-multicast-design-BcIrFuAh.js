var e={id:`qos-multicast`,h:{en:`Campus QoS and multicast design: trust, queuing, PIM-SM, RP placement and anycast RP`,hi:`Campus QoS aur multicast design: trust, queuing, PIM-SM, RP placement aur anycast RP`},body:{en:`
<p>A motorway has a fast lane for ambulances. Ambulances do not make the road wider; they get priority when it is crowded. <b>Quality of Service (QoS)</b> does the same for voice and video when links are busy. And multicast is a radio broadcast: the station sends one signal and every listener tunes in, instead of the station phoning each listener separately (unicast).</p>

<h3>The case: Quayside Securities</h3>
<div class="eg"><p><b>Customer.</b> Quayside Securities is a brokerage with 600 traders on two floors of one campus, a second building with a backup trading room and a small data centre in each building. It receives 400 multicast market-data feeds, runs IP voice turrets and HD video conferencing, and backs up files overnight. Requirements: voice one-way delay under 150 ms, jitter under 30 ms, loss under 1% (voice) and under 0.1% to 1% (video, by codec); market data must survive the loss of either building's router; no feed may flood to traders who did not ask for it. Budget USD 1.6 million. Constraints: legacy feed applications use any-source multicast (ASM) groups; new feeds can use source-specific multicast; the team is comfortable with Cisco MQC.</p></div>

<h3>QoS design principles for the campus</h3>
<ol>
<li><b>Classify and mark as close to the source as possible</b> (the access switch), and define a <b>trust boundary</b>. Trust the phone (conditional trust using CDP or LLDP), do not trust the PC.</li>
<li><b>Queue everywhere there can be congestion</b>: uplinks, port-channel members, WAN edge. Campus links are rarely congested on average, but micro-bursts and failures change that.</li>
<li><b>Police and shape</b> at the edge; use a <b>priority queue (LLQ)</b> for voice, but cap it (a common guideline is no more than about one third of link bandwidth) so it cannot starve other classes.</li>
<li>Keep the model simple: 4, 8 or 12 classes. More classes mean more operations cost.</li>
</ol>
<table class="cmp"><tr><th>Traffic</th><th>Marking</th><th>Treatment</th></tr>
<tr><td>Voice bearer</td><td>DSCP EF (46)</td><td>Priority queue, policed</td></tr>
<tr><td>Interactive video</td><td>DSCP AF41 (34)</td><td>Guaranteed bandwidth, drop-eligible AF</td></tr>
<tr><td>Call signalling</td><td>DSCP CS3 (24)</td><td>Guaranteed small share</td></tr>
<tr><td>Network control, routing</td><td>DSCP CS6 (48)</td><td>Guaranteed, protects the control plane</td></tr>
<tr><td>Transactional data</td><td>DSCP AF21 or AF31</td><td>Guaranteed with WRED</td></tr>
<tr><td>Bulk backup, scavenger</td><td>DSCP AF11 or CS1 (8)</td><td>Minimum share, dropped first</td></tr></table>

<pre class="code"><span class="c">! Access port with a Cisco phone and PC behind it</span>
interface GigabitEthernet1/0/5
 auto qos voip cisco-phone
!
<span class="c">! Uplink egress policy (illustrative class set)</span>
class-map match-any VOICE
 match dscp ef
class-map match-any VIDEO
 match dscp af41
policy-map CAMPUS-OUT
 class VOICE
  priority percent 10
 class VIDEO
  bandwidth remaining percent 30
 class class-default
  bandwidth remaining percent 25
interface TenGigabitEthernet1/1/1
 service-policy output CAMPUS-OUT
</pre>

<h3>Multicast design basics</h3>
<p><b>IGMP</b> lets hosts join groups. <b>IGMP snooping</b> on access switches keeps multicast only on ports with listeners. <b>PIM sparse mode (PIM-SM)</b> builds a distribution tree only toward routers with interested receivers. In ASM, receivers first join a shared tree rooted at the <b>Rendezvous Point (RP)</b>; sources register with the RP; routers may switch to a source tree. <b>PIM SSM</b> (default range 232.0.0.0/8) needs no RP at all: the receiver names the source with IGMPv3, so it is simpler and safer for new applications.</p>
<p><b>RP placement and redundancy:</b> put the RP on core or distribution devices that sit on the path (not on an access switch), prefer a loopback address, and never leave a single RP. Options to learn RP information: static RP (simple, deterministic), Auto-RP (Cisco), BSR (standard). For redundancy and load sharing, use <b>Anycast RP</b>: two RPs share the same loopback address; routing sends each router to the nearest RP. The RPs must tell each other about sources, using <b>MSDP</b> between them (or PIM Anycast RP, RFC 4610, which needs no MSDP).</p>

<div class="dia"><svg viewBox="0 0 640 335" role="img" aria-label="Anycast RP multicast design">
<text x="320" y="22" text-anchor="middle" class="svg-accent" font-size="12">Anycast RP address 10.255.0.100 on both RPs</text>
<g stroke="#64748b" stroke-width="1.5">
<line x1="100" y1="150" x2="170" y2="150"/><line x1="225" y1="80" x2="225" y2="130"/><line x1="415" y1="80" x2="415" y2="130"/>
<line x1="280" y1="149" x2="360" y2="149"/>
<line x1="225" y1="168" x2="200" y2="215"/><line x1="225" y1="168" x2="430" y2="215"/><line x1="415" y1="168" x2="200" y2="215"/><line x1="415" y1="168" x2="430" y2="215"/>
<line x1="200" y1="247" x2="200" y2="268"/><line x1="430" y1="247" x2="430" y2="268"/>
</g>
<line x1="280" y1="60" x2="360" y2="60" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="6 4"/>
<text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">MSDP</text>
<g class="svg-ink" font-size="13" text-anchor="middle">
<rect x="20" y="125" width="80" height="50" rx="6" fill="#fde68a" stroke="#475569"/><text x="60" y="148">Feed</text><text x="60" y="164">source</text>
<rect x="170" y="40" width="110" height="40" rx="8" fill="#fed7aa" stroke="#475569"/><text x="225" y="65">RP 1 Bldg A</text>
<rect x="360" y="40" width="110" height="40" rx="8" fill="#fed7aa" stroke="#475569"/><text x="415" y="65">RP 2 Bldg B</text>
<rect x="170" y="130" width="110" height="38" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="225" y="154">Dist A</text>
<rect x="360" y="130" width="110" height="38" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="415" y="154">Dist B</text>
<rect x="150" y="215" width="100" height="32" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="200" y="236">Access 1</text>
<rect x="380" y="215" width="100" height="32" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="430" y="236">Access 2</text>
<rect x="150" y="268" width="330" height="30" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="315" y="288">Traders (IGMP joins, snooping on)</text>
</g>
<rect x="15" y="314" width="14" height="14" fill="#fed7aa"/><text x="35" y="326" class="svg-ink" font-size="12">RP</text>
<rect x="75" y="314" width="14" height="14" fill="#ddd6fe"/><text x="95" y="326" class="svg-ink" font-size="12">Distribution</text>
<rect x="190" y="314" width="14" height="14" fill="#bbf7d0"/><text x="210" y="326" class="svg-ink" font-size="12">Access</text>
<rect x="270" y="314" width="14" height="14" fill="#fde68a"/><text x="290" y="326" class="svg-ink" font-size="12">Source</text>
<rect x="350" y="314" width="14" height="14" fill="#e2e8f0"/><text x="370" y="326" class="svg-ink" font-size="12">Receivers</text>
</svg><p class="cap">Two RPs share one address; MSDP keeps their source lists in sync, so either can serve the whole campus.</p></div>

<pre class="code"><span class="c">! RP 1 (RP 2 uses its own unique loopback, same anycast loopback)</span>
ip multicast-routing
interface Loopback0
 ip address 10.255.0.1 255.255.255.255
interface Loopback1
 description anycast-rp
 ip address 10.255.0.100 255.255.255.255
 ip pim sparse-mode
ip pim rp-address 10.255.0.100
ip msdp peer 10.255.0.2 connect-source Loopback0
ip msdp originator-id Loopback0
</pre>
<pre class="out">DIST-A# show ip pim rp mapping
Group(s): 224.0.0.0/4, Static
    RP: <span class="hl">10.255.0.100</span> (?)
</pre>

<h3>Options and chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Verdict</th></tr>
<tr><td>Single static RP</td><td>Rejected: single point of failure</td></tr>
<tr><td>Auto-RP</td><td>Rejected: Cisco-only, extra dependency</td></tr>
<tr><td>Anycast RP with MSDP, one RP per building</td><td><b>Chosen</b> for legacy ASM feeds: failover at routing speed</td></tr>
<tr><td>PIM SSM for new feeds</td><td><b>Chosen</b> as the migration target: no RP</td></tr></table>
<p>Quayside also enables PIM sparse mode on every Layer 3 interface in the path, IGMP snooping on access VLANs, and a multicast boundary so market data cannot leave the campus. QoS marks voice EF, video AF41, and market data into its own guaranteed class so it never competes with backups.</p>

<div class="warn"><p><b>Common mistakes.</b> PIM missing on one hop (the tree breaks silently); mismatched RP address on some routers; RP on a lone access switch; trusting DSCP from untrusted PCs; and a priority queue with no cap.</p></div>
<div class="exam"><p><b>Exam trap.</b> Anycast RP needs MSDP (or PIM Anycast RP) between RPs. SSM uses IGMPv3, not an RP. Do not confuse trust boundary (marking) with queuing (egress).</p></div>

<div class="scn"><h4>Post-mortem: the feed that stopped at the new floor</h4><p>After a fit-out, traders on floor 4 had no market data. The engineer found IGMP joins at the access switch but no PIM neighbour on the new distribution uplink: PIM sparse mode had not been enabled there. After adding it, the tree built in seconds.</p><p><b>Lesson:</b> check the multicast path hop by hop: IGMP, PIM neighbour, RP mapping, then the mroute.</p></div>
<div class="iv"><p class="q">"How do you make a PIM RP highly available?"</p><p>Anycast RP: two RPs share a loopback address, routing picks the closest, and MSDP exchanges active sources. Mention placement at core or distribution and SSM as the RP-free option for new apps.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mark at the edge, trust only known devices, queue wherever congestion is possible.</li>
<li>Voice uses a capped priority queue; use few, well-defined classes.</li>
<li>PIM-SM needs an RP for ASM; SSM does not.</li>
<li>Anycast RP plus MSDP gives redundancy and load sharing.</li>
<li>Enable IGMP snooping on access and PIM on every Layer 3 hop in the path.</li>
</ul></div>
`,hi:`
<p>Motorway par ambulance ke liye fast lane hoti hai. Ambulance road ko chauda nahi karti; bheed hone par use priority milti hai. <b>Quality of Service (QoS)</b> links busy hone par voice aur video ke liye yahi karta hai. Aur multicast radio broadcast hai: station ek signal bhejta hai aur har listener tune in karta hai, har listener ko alag phone karne (unicast) ki jagah.</p>

<h3>Case: Quayside Securities</h3>
<div class="eg"><p><b>Customer.</b> Quayside Securities ek brokerage hai jiske ek campus ki do floors par 600 traders hain, doosri building mein backup trading room hai aur har building mein chhota data centre. Yeh 400 multicast market-data feeds receive karta hai, IP voice turrets aur HD video conferencing chalata hai, aur raat ko files ka backup leta hai. Requirements: voice one-way delay 150 ms se kam, jitter 30 ms se kam, loss voice ke liye 1% se kam aur video ke liye 0.1% se 1% (codec ke hisaab se); market data kisi bhi building ke router ke loss ko survive kare; koi feed un traders tak flood na ho jinhone maanga nahi. Budget USD 1.6 million. Constraints: legacy feed applications any-source multicast (ASM) groups use karti hain; nayi feeds source-specific multicast use kar sakti hain; team Cisco MQC se comfortable hai.</p></div>

<h3>Campus ke liye QoS design principles</h3>
<ol>
<li><b>Source ke jitna paas ho sake classify aur mark karo</b> (access switch), aur ek <b>trust boundary</b> define karo. Phone ko trust karo (CDP ya LLDP se conditional trust), PC ko nahi.</li>
<li><b>Jahan congestion ho sakta hai wahan queue lagao</b>: uplinks, port-channel members, WAN edge. Campus links average mein kam congested hote hain, lekin micro-bursts aur failures isse badal dete hain.</li>
<li>Edge par <b>police aur shape</b> karo; voice ke liye <b>priority queue (LLQ)</b> use karo, lekin cap lagao (common guideline link bandwidth ka lagbhag ek tihai se zyada nahi) taaki woh doosre classes ko starve na kare.</li>
<li>Model simple rakho: 4, 8 ya 12 classes. Zyada classes matlab zyada operations cost.</li>
</ol>
<table class="cmp"><tr><th>Traffic</th><th>Marking</th><th>Treatment</th></tr>
<tr><td>Voice bearer</td><td>DSCP EF (46)</td><td>Priority queue, policed</td></tr>
<tr><td>Interactive video</td><td>DSCP AF41 (34)</td><td>Guaranteed bandwidth, drop-eligible AF</td></tr>
<tr><td>Call signalling</td><td>DSCP CS3 (24)</td><td>Chhota guaranteed share</td></tr>
<tr><td>Network control, routing</td><td>DSCP CS6 (48)</td><td>Guaranteed, control plane protect karta hai</td></tr>
<tr><td>Transactional data</td><td>DSCP AF21 ya AF31</td><td>WRED ke saath guaranteed</td></tr>
<tr><td>Bulk backup, scavenger</td><td>DSCP AF11 ya CS1 (8)</td><td>Minimum share, pehle drop</td></tr></table>

<pre class="code"><span class="c">! Access port with a Cisco phone and PC behind it</span>
interface GigabitEthernet1/0/5
 auto qos voip cisco-phone
!
<span class="c">! Uplink egress policy (illustrative class set)</span>
class-map match-any VOICE
 match dscp ef
class-map match-any VIDEO
 match dscp af41
policy-map CAMPUS-OUT
 class VOICE
  priority percent 10
 class VIDEO
  bandwidth remaining percent 30
 class class-default
  bandwidth remaining percent 25
interface TenGigabitEthernet1/1/1
 service-policy output CAMPUS-OUT
</pre>

<h3>Multicast design basics</h3>
<p><b>IGMP</b> hosts ko groups join karne deta hai. Access switches par <b>IGMP snooping</b> multicast ko sirf listeners wale ports par rakhta hai. <b>PIM sparse mode (PIM-SM)</b> distribution tree sirf interested receivers wale routers ki taraf banata hai. ASM mein receivers pehle <b>Rendezvous Point (RP)</b> par rooted shared tree join karte hain; sources RP ke paas register karte hain; routers source tree par switch kar sakte hain. <b>PIM SSM</b> (default range 232.0.0.0/8) ko RP ki zaroorat hi nahi: receiver IGMPv3 se source ka naam batata hai, isliye nayi applications ke liye simple aur safer hai.</p>
<p><b>RP placement aur redundancy:</b> RP ko core ya distribution devices par rakho jo path mein ho (access switch par nahi), loopback address prefer karo, aur kabhi ek hi RP mat chhodo. RP information seekhne ke options: static RP (simple, deterministic), Auto-RP (Cisco), BSR (standard). Redundancy aur load sharing ke liye <b>Anycast RP</b> use karo: do RPs same loopback address share karte hain; routing har router ko nearest RP tak bhejti hai. RPs ko ek dusre ko sources ke baare mein batana padta hai, <b>MSDP</b> se (ya PIM Anycast RP, RFC 4610, jise MSDP ki zaroorat nahi).</p>

<div class="dia"><svg viewBox="0 0 640 335" role="img" aria-label="Anycast RP multicast design">
<text x="320" y="22" text-anchor="middle" class="svg-accent" font-size="12">Anycast RP address 10.255.0.100 dono RPs par</text>
<g stroke="#64748b" stroke-width="1.5">
<line x1="100" y1="150" x2="170" y2="150"/><line x1="225" y1="80" x2="225" y2="130"/><line x1="415" y1="80" x2="415" y2="130"/>
<line x1="280" y1="149" x2="360" y2="149"/>
<line x1="225" y1="168" x2="200" y2="215"/><line x1="225" y1="168" x2="430" y2="215"/><line x1="415" y1="168" x2="200" y2="215"/><line x1="415" y1="168" x2="430" y2="215"/>
<line x1="200" y1="247" x2="200" y2="268"/><line x1="430" y1="247" x2="430" y2="268"/>
</g>
<line x1="280" y1="60" x2="360" y2="60" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="6 4"/>
<text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">MSDP</text>
<g class="svg-ink" font-size="13" text-anchor="middle">
<rect x="20" y="125" width="80" height="50" rx="6" fill="#fde68a" stroke="#475569"/><text x="60" y="148">Feed</text><text x="60" y="164">source</text>
<rect x="170" y="40" width="110" height="40" rx="8" fill="#fed7aa" stroke="#475569"/><text x="225" y="65">RP 1 Bldg A</text>
<rect x="360" y="40" width="110" height="40" rx="8" fill="#fed7aa" stroke="#475569"/><text x="415" y="65">RP 2 Bldg B</text>
<rect x="170" y="130" width="110" height="38" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="225" y="154">Dist A</text>
<rect x="360" y="130" width="110" height="38" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="415" y="154">Dist B</text>
<rect x="150" y="215" width="100" height="32" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="200" y="236">Access 1</text>
<rect x="380" y="215" width="100" height="32" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="430" y="236">Access 2</text>
<rect x="150" y="268" width="330" height="30" rx="6" fill="#e2e8f0" stroke="#475569"/><text x="315" y="288">Traders (IGMP joins, snooping on)</text>
</g>
<rect x="15" y="314" width="14" height="14" fill="#fed7aa"/><text x="35" y="326" class="svg-ink" font-size="12">RP</text>
<rect x="75" y="314" width="14" height="14" fill="#ddd6fe"/><text x="95" y="326" class="svg-ink" font-size="12">Distribution</text>
<rect x="190" y="314" width="14" height="14" fill="#bbf7d0"/><text x="210" y="326" class="svg-ink" font-size="12">Access</text>
<rect x="270" y="314" width="14" height="14" fill="#fde68a"/><text x="290" y="326" class="svg-ink" font-size="12">Source</text>
<rect x="350" y="314" width="14" height="14" fill="#e2e8f0"/><text x="370" y="326" class="svg-ink" font-size="12">Receivers</text>
</svg><p class="cap">Do RPs ek address share karte hain; MSDP unki source lists sync rakhta hai, isliye koi bhi RP poore campus ko serve kar sakta hai.</p></div>

<pre class="code"><span class="c">! RP 1 (RP 2 uses its own unique loopback, same anycast loopback)</span>
ip multicast-routing
interface Loopback0
 ip address 10.255.0.1 255.255.255.255
interface Loopback1
 description anycast-rp
 ip address 10.255.0.100 255.255.255.255
 ip pim sparse-mode
ip pim rp-address 10.255.0.100
ip msdp peer 10.255.0.2 connect-source Loopback0
ip msdp originator-id Loopback0
</pre>
<pre class="out">DIST-A# show ip pim rp mapping
Group(s): 224.0.0.0/4, Static
    RP: <span class="hl">10.255.0.100</span> (?)
</pre>

<h3>Options aur chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Verdict</th></tr>
<tr><td>Single static RP</td><td>Reject: single point of failure</td></tr>
<tr><td>Auto-RP</td><td>Reject: Cisco-only, extra dependency</td></tr>
<tr><td>Anycast RP with MSDP, har building mein ek RP</td><td><b>Chosen</b> legacy ASM feeds ke liye: routing speed par failover</td></tr>
<tr><td>Nayi feeds ke liye PIM SSM</td><td><b>Chosen</b> migration target ke roop mein: RP nahi</td></tr></table>
<p>Quayside path ke har Layer 3 interface par PIM sparse mode, access VLANs par IGMP snooping, aur multicast boundary bhi enable karta hai taaki market data campus ke bahar na jaye. QoS voice ko EF, video ko AF41 mark karta hai, aur market data ko apni guaranteed class deta hai taaki woh backups se compete na kare.</p>

<div class="warn"><p><b>Common mistakes.</b> Ek hop par PIM missing (tree chupchaap toot jaata hai); kuch routers par RP address mismatch; akele access switch par RP; untrusted PCs ke DSCP ko trust karna; aur cap ke bina priority queue.</p></div>
<div class="exam"><p><b>Exam trap.</b> Anycast RP ko RPs ke beech MSDP (ya PIM Anycast RP) chahiye. SSM IGMPv3 use karta hai, RP nahi. Trust boundary (marking) ko queuing (egress) se confuse mat karo.</p></div>

<div class="scn"><h4>Post-mortem: feed jo nayi floor par ruk gayi</h4><p>Fit-out ke baad floor 4 ke traders ko market data nahi mila. Engineer ko access switch par IGMP joins mile lekin naye distribution uplink par PIM neighbour nahi tha: wahan PIM sparse mode enable nahi kiya gaya tha. Add karne ke baad tree seconds mein ban gaya.</p><p><b>Seekh:</b> multicast path hop by hop check karo: IGMP, PIM neighbour, RP mapping, phir mroute.</p></div>
<div class="iv"><p class="q">"PIM RP ko highly available kaise banaoge?"</p><p>Anycast RP: do RPs ek loopback address share karte hain, routing sabse paas wala chunti hai, aur MSDP active sources exchange karta hai. Core ya distribution par placement aur nayi apps ke liye RP-free option ke roop mein SSM ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edge par mark karo, sirf known devices ko trust karo, jahan congestion ho sakta hai wahan queue lagao.</li>
<li>Voice capped priority queue use karta hai; kam, well-defined classes rakho.</li>
<li>ASM ke liye PIM-SM ko RP chahiye; SSM ko nahi.</li>
<li>Anycast RP plus MSDP redundancy aur load sharing deta hai.</li>
<li>Access par IGMP snooping aur path ke har Layer 3 hop par PIM enable karo.</li>
</ul></div>
`}};export{e as default};