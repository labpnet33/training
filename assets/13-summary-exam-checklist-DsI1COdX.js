var e={id:`mcast-summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a TV channel and a phone call, and you can now follow a multicast packet from a studio PC through IGMP, PIM, the RP, the RPF check and a snooping switch all the way to a classroom. This chapter packs the module into a checklist, a glossary, the facts examiners love, and a command cheat-sheet. Read it the evening before the exam and again before an interview.</p>

<h3>Can you do this? (checklist)</h3>
<ul>
<li>Explain unicast vs broadcast vs multicast with a real use case (IPTV, market data, live classes, OS imaging).</li>
<li>Name the purpose of 224.0.0.0/24, 224.0.1.39/40, 232/8 and 239/8, and calculate the MAC for any group.</li>
<li>Describe IGMPv1, v2 and v3 messages, the querier election and leave process, and INCLUDE/EXCLUDE modes.</li>
<li>Explain why switches flood multicast and how IGMP snooping and the snooping querier fix it.</li>
<li>Draw a source tree (S,G) and a shared tree (*,G) and compare their state and paths.</li>
<li>Perform an RPF check by hand from <code>show ip route</code> and fix RPF with <code>ip mroute</code>.</li>
<li>Configure PIM sparse mode with a static RP and verify neighbours, RP mapping, IGMP groups and mroute flags (lab 1).</li>
<li>Walk through register, register-stop, (*,G) join and SPT switchover in order.</li>
<li>Compare static RP, Auto-RP and BSR; build Anycast RP with MSDP.</li>
<li>Explain when to choose SSM or bidir PIM.</li>
<li>Troubleshoot a missing <code>ip pim</code> and an RPF failure from the receiver toward the source (lab 2).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Choosing a multicast design">
<rect x="220" y="15" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Do receivers know the source?</text>
<rect x="30" y="110" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="115" y="135" text-anchor="middle" class="svg-ink" font-size="13">Yes: PIM SSM</text>
<rect x="400" y="110" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="505" y="135" text-anchor="middle" class="svg-ink" font-size="13">No: many senders?</text>
<rect x="300" y="195" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="375" y="220" text-anchor="middle" class="svg-ink" font-size="13">Yes: Bidir PIM</text>
<rect x="470" y="195" width="160" height="40" rx="8" fill="#bae6fd"/><text x="550" y="220" text-anchor="middle" class="svg-ink" font-size="13">No: PIM-SM + RP</text>
<line x1="280" y1="55" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="55" x2="480" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="150" x2="390" y2="195" stroke="#64748b" stroke-width="2"/><line x1="530" y1="150" x2="550" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="115" y="175" text-anchor="middle" class="svg-muted" font-size="12">IGMPv3, 232/8, no RP</text>
<text x="160" y="225" text-anchor="middle" class="svg-muted" font-size="12">Add Anycast RP + MSDP for redundancy</text>
</svg><p class="cap">A quick decision tree for picking the PIM flavour.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Group (G)</dt><dd>A class D destination address, 224.0.0.0/4, that receivers join.</dd>
<dt>IGMP</dt><dd>Host-to-router membership protocol on the LAN (protocol 2, TTL 1).</dd>
<dt>Querier</dt><dd>The router that sends IGMP queries on a LAN; lowest IP in v2/v3.</dd>
<dt>IGMP snooping</dt><dd>Switch feature that forwards a group only to member ports and mrouter ports.</dd>
<dt>PIM</dt><dd>Protocol Independent Multicast: builds trees between routers using the unicast table for RPF.</dd>
<dt>DR</dt><dd>PIM Designated Router on a LAN: highest priority, then highest IP; sends joins and registers.</dd>
<dt>RPF check</dt><dd>Accept a packet only on the interface used to reach its source (or the RP).</dd>
<dt>(S,G) / SPT</dt><dd>Source tree: one source, one group, shortest path.</dd>
<dt>(*,G) / RPT</dt><dd>Shared tree rooted at the RP: any source, one group.</dd>
<dt>RP</dt><dd>Rendezvous Point where sources register and receivers join in sparse mode.</dd>
<dt>Register / Register-Stop</dt><dd>Unicast messages between the first-hop DR and the RP.</dd>
<dt>MSDP</dt><dd>TCP 639 protocol that shares Source-Active messages between RPs.</dd>
<dt>SSM</dt><dd>Receivers join (S,G) directly with IGMPv3; 232/8; no RP.</dd>
<dt>Bidir PIM</dt><dd>Only (*,G), traffic both ways on the shared tree, DF per link.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp">
<tr><th>Topic</th><th>Fact</th></tr>
<tr><td>MAC mapping</td><td>01:00:5e + 0 + low 23 bits; 32 groups per MAC</td></tr>
<tr><td>IGMPv2</td><td>Leave to 224.0.0.2; querier = lowest IP; query every 60 s on IOS</td></tr>
<tr><td>IGMPv3</td><td>Reports to 224.0.0.22; INCLUDE/EXCLUDE; required for SSM</td></tr>
<tr><td>PIM</td><td>Protocol 103; hellos to 224.0.0.13 every 30 s; hold 105 s</td></tr>
<tr><td>DR vs assert</td><td>DR = highest priority/IP; assert = lowest AD, metric, then highest IP</td></tr>
<tr><td>RPF</td><td>Compare arrival interface with route back to source/RP; static mroute distance 0</td></tr>
<tr><td>PIM-SM</td><td>(*,G) join to RP; unicast Register; Register-Stop; SPT switch after first packet</td></tr>
<tr><td>Auto-RP</td><td>224.0.1.39 announce, 224.0.1.40 discovery; highest C-RP IP; Cisco only</td></tr>
<tr><td>BSR</td><td>Standard; RP-set flooded hop by hop; each router hashes; lower C-RP priority wins</td></tr>
<tr><td>MSDP</td><td>TCP 639; Source-Active; Anycast RP</td></tr>
<tr><td>SSM / Bidir</td><td>SSM 232/8, (S,G) only, no RP; bidir (*,G) only, DF election</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Configure</span>
ip multicast-routing                         <span class="c">! (distributed on IOS XE routers)</span>
interface GigabitEthernet0/1
 ip pim sparse-mode
 ip igmp version 3
 ip pim dr-priority 100
ip pim rp-address 2.2.2.2 [acl] [override] [bidir]
ip pim send-rp-announce Loopback0 scope 16 group-list 10
ip pim send-rp-discovery Loopback0 scope 16
ip pim autorp listener
ip pim bsr-candidate Loopback0 0 10
ip pim rp-candidate Loopback0 group-list 10 priority 10
ip pim ssm default
ip pim spt-threshold infinity
ip mroute 2.2.2.2 255.255.255.255 10.0.23.2
ip msdp peer 5.5.5.5 connect-source Loopback0
ip msdp originator-id Loopback0
<span class="c">! Verify</span>
show ip igmp groups / show ip igmp interface
show ip igmp snooping groups / show ip igmp snooping mrouter
show ip pim neighbor / show ip pim interface
show ip pim rp mapping / show ip pim bsr-router
show ip rpf &lt;address&gt;
show ip mroute [group] / show ip mroute count
show ip msdp summary / show ip msdp sa-cache</pre>

<div class="eg"><p><b>Worked example: a 30-second exam drill.</b> "Group 239.130.5.9: which MAC?" 130 - 128 = 2, so 01:00:5e:02:05:09. "Which address does an IGMPv3 host send reports to?" 224.0.0.22. "R3 shows (*,G) Incoming interface Null, RP 2.2.2.2; R3 is not the RP." RPF to the RP is broken: check <code>show ip rpf 2.2.2.2</code> and PIM on that interface. "Which mode needs no RP?" SSM (and dense mode).</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the order of events. Most scenario questions test sequence: IGMP report, (*,G) join, register, (S,G) join from the RP, register-stop, SPT switchover, (S,G,RPT) prune. Practise telling it as a story.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for swapped facts: querier (lowest IP) vs DR (highest IP); Auto-RP groups 224.0.1.39 vs .40; SSM 232/8 vs admin-scoped 239/8; MSDP shares sources, not receivers; static mroute affects RPF only.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a network engineer role at a stock broker was asked to draw how market data reaches 40 trading servers. She drew the feed handler as the source, IGMPv3 joins on the server VLANs, IGMP snooping on the access switches, PIM SSM in 232/8 across the core so there was no RP to fail, and explained the RPF check when the interviewer "broke" a link. She then offered bidir PIM for the internal order-routing application, where every server both sends and receives. She got the offer.</p><p><b>Lesson:</b> connect every protocol to a design reason; that is what separates memorising from understanding.</p></div>

<div class="iv"><p class="q">"Give me a two-minute overview of how IP multicast works end to end."</p><p>Strong answer: a source sends UDP to a group address; receivers join with IGMP on their LAN and switches use snooping to limit flooding. Routers run PIM: in sparse mode last-hop routers join a shared tree toward the RP, the first-hop router registers the source, the RP joins the source tree and routers switch to the SPT. Every packet passes the RPF check against the unicast table to prevent loops. RPs are found statically, by Auto-RP or BSR, made redundant with Anycast RP and MSDP; SSM removes the RP for known sources and bidir serves many-to-many.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP (hosts), snooping (switches), PIM (routers): three layers, one tree.</li>
<li>RPF is the heart of multicast: most failures are RPF or missing PIM.</li>
<li>PIM-SM: shared tree via the RP, then SPT; SSM: straight to (S,G); bidir: (*,G) both ways.</li>
<li>RP discovery: static, Auto-RP (224.0.1.39/40), BSR; redundancy: Anycast RP + MSDP.</li>
<li>Troubleshoot receiver to source with the show commands in the cheat-sheet.</li>
</ul></div>
`,hi:`
<p>Aapne TV channel aur phone call se shuru kiya tha, aur ab aap studio PC se ek multicast packet ko IGMP, PIM, RP, RPF check aur snooping switch se hote hue classroom tak follow kar sakte ho. Yeh chapter module ko ek checklist, ek glossary, examiners ke pasandida facts, aur ek command cheat-sheet mein pack karta hai. Exam se pehli shaam padho aur interview se pehle dobara.</p>

<h3>Kya aap yeh kar sakte ho? (checklist)</h3>
<ul>
<li>Unicast vs broadcast vs multicast ko real use case (IPTV, market data, live classes, OS imaging) ke saath samjhana.</li>
<li>224.0.0.0/24, 224.0.1.39/40, 232/8 aur 239/8 ka purpose batana, aur kisi bhi group ka MAC calculate karna.</li>
<li>IGMPv1, v2 aur v3 ke messages, querier election aur leave process, aur INCLUDE/EXCLUDE modes describe karna.</li>
<li>Samjhana ki switches multicast flood kyun karte hain aur IGMP snooping aur snooping querier ise kaise theek karte hain.</li>
<li>Source tree (S,G) aur shared tree (*,G) draw karna aur unki state aur paths compare karna.</li>
<li><code>show ip route</code> se haath se RPF check karna aur <code>ip mroute</code> se RPF theek karna.</li>
<li>Static RP ke saath PIM sparse mode configure karna aur neighbours, RP mapping, IGMP groups aur mroute flags verify karna (lab 1).</li>
<li>Register, register-stop, (*,G) join aur SPT switchover ko kram se samjhana.</li>
<li>Static RP, Auto-RP aur BSR compare karna; MSDP ke saath Anycast RP banana.</li>
<li>Samjhana ki SSM ya bidir PIM kab chunna hai.</li>
<li>Missing <code>ip pim</code> aur RPF failure ko receiver se source ki taraf troubleshoot karna (lab 2).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Choosing a multicast design">
<rect x="220" y="15" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Receivers ko source pata hai?</text>
<rect x="30" y="110" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="115" y="135" text-anchor="middle" class="svg-ink" font-size="13">Haan: PIM SSM</text>
<rect x="400" y="110" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="505" y="135" text-anchor="middle" class="svg-ink" font-size="13">Nahi: kai senders?</text>
<rect x="300" y="195" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="375" y="220" text-anchor="middle" class="svg-ink" font-size="13">Haan: Bidir PIM</text>
<rect x="470" y="195" width="160" height="40" rx="8" fill="#bae6fd"/><text x="550" y="220" text-anchor="middle" class="svg-ink" font-size="13">Nahi: PIM-SM + RP</text>
<line x1="280" y1="55" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="55" x2="480" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="150" x2="390" y2="195" stroke="#64748b" stroke-width="2"/><line x1="530" y1="150" x2="550" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="115" y="175" text-anchor="middle" class="svg-muted" font-size="12">IGMPv3, 232/8, koi RP nahi</text>
<text x="160" y="225" text-anchor="middle" class="svg-muted" font-size="12">Redundancy ke liye Anycast RP + MSDP jodo</text>
</svg><p class="cap">PIM flavour chunne ke liye ek jhatpat decision tree.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Group (G)</dt><dd>Class D destination address, 224.0.0.0/4, jise receivers join karte hain.</dd>
<dt>IGMP</dt><dd>LAN par host-to-router membership protocol (protocol 2, TTL 1).</dd>
<dt>Querier</dt><dd>Woh router jo LAN par IGMP queries bhejta hai; v2/v3 mein sabse chhota IP.</dd>
<dt>IGMP snooping</dt><dd>Switch feature jo group ko sirf member ports aur mrouter ports par forward karta hai.</dd>
<dt>PIM</dt><dd>Protocol Independent Multicast: RPF ke liye unicast table use karke routers ke beech trees banata hai.</dd>
<dt>DR</dt><dd>LAN par PIM Designated Router: sabse zyada priority, phir sabse bada IP; joins aur registers bhejta hai.</dd>
<dt>RPF check</dt><dd>Packet sirf us interface par accept karo jisse uske source (ya RP) tak pahunchte ho.</dd>
<dt>(S,G) / SPT</dt><dd>Source tree: ek source, ek group, shortest path.</dd>
<dt>(*,G) / RPT</dt><dd>RP par rooted shared tree: koi bhi source, ek group.</dd>
<dt>RP</dt><dd>Rendezvous Point jahan sparse mode mein sources register aur receivers join karte hain.</dd>
<dt>Register / Register-Stop</dt><dd>First-hop DR aur RP ke beech unicast messages.</dd>
<dt>MSDP</dt><dd>TCP 639 protocol jo RPs ke beech Source-Active messages share karta hai.</dd>
<dt>SSM</dt><dd>Receivers IGMPv3 se seedha (S,G) join karte hain; 232/8; koi RP nahi.</dd>
<dt>Bidir PIM</dt><dd>Sirf (*,G), shared tree par dono taraf traffic, har link par DF.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp">
<tr><th>Topic</th><th>Fact</th></tr>
<tr><td>MAC mapping</td><td>01:00:5e + 0 + neeche ke 23 bits; har MAC par 32 groups</td></tr>
<tr><td>IGMPv2</td><td>Leave 224.0.0.2 par; querier = sabse chhota IP; IOS par har 60 s query</td></tr>
<tr><td>IGMPv3</td><td>Reports 224.0.0.22 par; INCLUDE/EXCLUDE; SSM ke liye zaroori</td></tr>
<tr><td>PIM</td><td>Protocol 103; har 30 s 224.0.0.13 par hellos; hold 105 s</td></tr>
<tr><td>DR vs assert</td><td>DR = sabse zyada priority/IP; assert = sabse kam AD, metric, phir sabse bada IP</td></tr>
<tr><td>RPF</td><td>Aane wale interface ko source/RP ki taraf wapas route se compare; static mroute distance 0</td></tr>
<tr><td>PIM-SM</td><td>RP ki taraf (*,G) join; unicast Register; Register-Stop; pehle packet ke baad SPT switch</td></tr>
<tr><td>Auto-RP</td><td>224.0.1.39 announce, 224.0.1.40 discovery; sabse bada C-RP IP; sirf Cisco</td></tr>
<tr><td>BSR</td><td>Standard; RP-set hop by hop flood; har router hash karta hai; kam C-RP priority jeetti hai</td></tr>
<tr><td>MSDP</td><td>TCP 639; Source-Active; Anycast RP</td></tr>
<tr><td>SSM / Bidir</td><td>SSM 232/8, sirf (S,G), koi RP nahi; bidir sirf (*,G), DF election</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Configure</span>
ip multicast-routing                         <span class="c">! (IOS XE routers par distributed)</span>
interface GigabitEthernet0/1
 ip pim sparse-mode
 ip igmp version 3
 ip pim dr-priority 100
ip pim rp-address 2.2.2.2 [acl] [override] [bidir]
ip pim send-rp-announce Loopback0 scope 16 group-list 10
ip pim send-rp-discovery Loopback0 scope 16
ip pim autorp listener
ip pim bsr-candidate Loopback0 0 10
ip pim rp-candidate Loopback0 group-list 10 priority 10
ip pim ssm default
ip pim spt-threshold infinity
ip mroute 2.2.2.2 255.255.255.255 10.0.23.2
ip msdp peer 5.5.5.5 connect-source Loopback0
ip msdp originator-id Loopback0
<span class="c">! Verify</span>
show ip igmp groups / show ip igmp interface
show ip igmp snooping groups / show ip igmp snooping mrouter
show ip pim neighbor / show ip pim interface
show ip pim rp mapping / show ip pim bsr-router
show ip rpf &lt;address&gt;
show ip mroute [group] / show ip mroute count
show ip msdp summary / show ip msdp sa-cache</pre>

<div class="eg"><p><b>Worked example: 30-second exam drill.</b> "Group 239.130.5.9: kaunsa MAC?" 130 - 128 = 2, isliye 01:00:5e:02:05:09. "IGMPv3 host reports kis address par bhejta hai?" 224.0.0.22. "R3 (*,G) Incoming interface Null, RP 2.2.2.2 dikhata hai; R3 RP nahi hai." RP ki taraf RPF toota hai: <code>show ip rpf 2.2.2.2</code> aur us interface par PIM check karo. "Kis mode ko RP nahi chahiye?" SSM (aur dense mode).</p></div>

<div class="warn"><p><b>Common galti.</b> Events ka kram samjhe bina commands ratna. Zyada tar scenario questions sequence test karte hain: IGMP report, (*,G) join, register, RP se (S,G) join, register-stop, SPT switchover, (S,G,RPT) prune. Ise kahani ki tarah sunane ki practice karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ulte kiye gaye facts se savdhaan: querier (sabse chhota IP) vs DR (sabse bada IP); Auto-RP groups 224.0.1.39 vs .40; SSM 232/8 vs admin-scoped 239/8; MSDP sources share karta hai, receivers nahi; static mroute sirf RPF par asar karta hai.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Ek stock broker mein network engineer role ki candidate se poocha gaya ki market data 40 trading servers tak kaise pahunchta hai, draw karo. Usne feed handler ko source banaya, server VLANs par IGMPv3 joins, access switches par IGMP snooping, core mein 232/8 mein PIM SSM taaki fail hone ke liye koi RP na ho, aur jab interviewer ne ek link "toda" to RPF check samjhaya. Phir usne internal order-routing application ke liye bidir PIM suggest kiya, jahan har server bhejta aur receive dono karta hai. Use offer mil gaya.</p><p><b>Seekh:</b> har protocol ko ek design reason se jodo; yahi ratne aur samajhne ka fark hai.</p></div>

<div class="iv"><p class="q">"Mujhe do minute mein batao IP multicast end to end kaise kaam karta hai."</p><p>Strong answer: source group address par UDP bhejta hai; receivers apne LAN par IGMP se join karte hain aur switches flooding seemit karne ke liye snooping use karte hain. Routers PIM chalate hain: sparse mode mein last-hop routers RP ki taraf shared tree join karte hain, first-hop router source register karta hai, RP source tree join karta hai aur routers SPT par switch karte hain. Loops rokne ke liye har packet unicast table ke khilaaf RPF check se guzarta hai. RPs static, Auto-RP ya BSR se milte hain, Anycast RP aur MSDP se redundant bante hain; SSM jaane-pehchane sources ke liye RP hata deta hai aur bidir many-to-many ko serve karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP (hosts), snooping (switches), PIM (routers): teen layers, ek tree.</li>
<li>RPF multicast ka dil hai: zyada tar failures RPF ya missing PIM hote hain.</li>
<li>PIM-SM: RP ke through shared tree, phir SPT; SSM: seedha (S,G); bidir: (*,G) dono taraf.</li>
<li>RP discovery: static, Auto-RP (224.0.1.39/40), BSR; redundancy: Anycast RP + MSDP.</li>
<li>Cheat-sheet ke show commands se receiver se source tak troubleshoot karo.</li>
</ul></div>
`}};export{e as default};