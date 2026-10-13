var e={id:`ecmp`,h:{en:`ECMP deep dive: hashing, polarisation, flowlets and spine failure`,hi:`ECMP deep dive: hashing, polarisation, flowlets aur spine failure`},body:{en:`
<p>Think of a toll plaza with four open lanes. The attendant could send each car to whichever lane is shortest, but a family travelling in three cars would get split up and arrive in a different order. So instead the plaza uses a rule: the last digit of the number plate decides the lane. Every car of the same convoy (same plate pattern) takes the same lane and arrives in order, and across thousands of cars the lanes fill roughly evenly. That is <b>ECMP with per-flow hashing</b>, and it is how every spine-leaf fabric uses all its spines at once.</p>

<h3>How many paths?</h3>
<p>The routing protocol decides which paths are equal; the hardware decides how many it can use. On a leaf the number of equal paths to a remote loopback equals the number of spines (times the number of parallel links to each spine, if you have more than one).</p>
<ul>
<li><b>OSPF and IS-IS on NX-OS</b> install up to <b>8</b> equal paths by default; <code>maximum-paths</code> under the routing process raises it (the maximum depends on platform and release).</li>
<li><b>BGP</b> installs <b>1</b> by default; you must configure <code>maximum-paths</code>.</li>
<li>All paths must have exactly the same metric. One uplink at a different speed, or a different OSPF cost, and it drops out of ECMP.</li>
</ul>

<h3>Why per flow, not per packet</h3>
<p>Spreading individual packets round-robin across spines sounds fairer, but the paths never have identical delay. Packets of one TCP connection would arrive out of order, TCP would treat that as loss, send duplicate ACKs, retransmit and slow down. So switches keep every packet of a <b>flow</b> on one path. A flow is identified by fields in the headers, and a <b>hash</b> function turns those fields into a path number.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flows hashed onto two spines">
<rect x="20" y="90" width="120" height="50" rx="6" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="80" y="129" text-anchor="middle" class="svg-muted" font-size="12">hash(5-tuple)</text>
<rect x="260" y="20" width="120" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="260" y="170" width="120" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="500" y="90" width="120" height="50" rx="6" fill="#bae6fd"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<line x1="140" y1="100" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="380" y1="40" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="140" y1="130" x2="260" y2="190" stroke="#64748b" stroke-width="2"/><line x1="380" y1="190" x2="500" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" class="svg-accent" font-size="12">flows A, C</text><text x="150" y="185" class="svg-accent" font-size="12">flows B, D</text>
</svg><p class="cap">Every packet of flow A follows SPINE1; flow B follows SPINE2. Across many flows both spines carry about half.</p></div>

<h3>Hash inputs: the 5-tuple</h3>
<p>The classic inputs are the <b>5-tuple</b>: source IP, destination IP, IP protocol, source port and destination port. On NX-OS you choose the fields globally:</p>
<pre class="code">ip load-sharing address source-destination port source-destination</pre>
<pre class="out">LEAF1# show ip load-sharing
IPv4/IPv6 ECMP load sharing:
Universal-id (Random Seed): 3149671889
<span class="hl">Load-share mode : address source-destination port source-destination</span></pre>
<p>Ports matter enormously in a VXLAN fabric. Between two leaves, every VXLAN packet has the same outer source IP (VTEP 10.254.0.1), the same outer destination IP (10.254.0.2), the same protocol (UDP) and the same destination port (4789). If the underlay hashed only on IP addresses, <b>all</b> traffic between two leaves would use one spine. VXLAN solves this with <b>entropy</b>: the sending VTEP sets the outer UDP <b>source port</b> from a hash of the inner packet's headers (RFC 7348). Different inner flows get different source ports, and the underlay's 5-tuple hash spreads them.</p>

<div class="eg"><p><b>Worked example: why ports matter.</b> 1,000 VM-to-VM flows run between LEAF1 and LEAF2. Hashing on addresses only: the outer IPs are identical for all 1,000, so all go through one spine: 100% / 0%. Hashing on addresses and ports: each flow has a different outer UDP source port (for example 49,152 to 65,535), so the split is roughly 500 / 500. Same fabric, same links, double the usable bandwidth, just from the hash fields.</p></div>

<h3>Polarisation</h3>
<p><b>Hash polarisation</b> happens when several switches in a row use the same hash function, the same fields and the same seed. The first switch sends all flows with an "even" result to path 0. At the next tier, those same flows produce the same "even" result again, so they all take path 0 there too, and half the links at the second tier sit idle. It matters most in multi-tier designs (leaf, spine, super-spine) and in older platforms. The cure is to make each switch hash differently: NX-OS mixes a per-switch <b>universal-id</b> (the random seed shown above) into the hash, and you can also vary the fields per tier.</p>

<h3>Elephants, mice and flowlets</h3>
<p>Per-flow hashing balances the <b>number</b> of flows, not their size. A few huge long-lived flows (<b>elephants</b>, like a backup or a storage replication) can land on the same spine while thousands of tiny <b>mice</b> flows share the other. The link utilisation then looks uneven even though ECMP is "working".</p>
<p>A <b>flowlet</b> is a burst of packets within one flow, separated from the next burst by an idle gap. If the gap is longer than the delay difference between two paths, the next burst can be moved to a less loaded path without any reordering. Cisco uses this idea in ACI dynamic load balancing and in newer Nexus 9000 features for AI and storage fabrics. For the exam, know the concept: flowlet switching rebalances large flows safely by moving bursts, not packets.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show ip route 10.254.0.2
10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 02:11:05, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 02:11:05, ospf-UNDERLAY, intra</span>

LEAF1# show interface Ethernet1/1 | include rate
  30 seconds input rate 38112004 bits/sec, 4102 packets/sec
  30 seconds output rate 41980232 bits/sec, 4410 packets/sec
LEAF1# show interface Ethernet1/2 | include rate
  30 seconds input rate 36877112 bits/sec, 3988 packets/sec
  30 seconds output rate 40115376 bits/sec, 4290 packets/sec</pre>
<p>Two next hops in the table, and similar rates on both uplinks: ECMP is healthy. <code>show routing hash</code> followed by a source and destination address tells you which path the switch would choose for that flow.</p>

<h3>What happens when a spine fails</h3>
<p>When SPINE1 dies, LEAF1's link Ethernet1/1 goes down. OSPF removes 10.1.1.0 as a next hop and the route drops to ubest 1. Flows that were on SPINE2 are not disturbed. Flows that were on SPINE1 are re-hashed onto the remaining paths. Because the backup path was already installed, this is very fast; with BFD or direct link-down detection, well under a second.</p>
<div class="eg"><p><b>Worked example: capacity after a failure.</b> A leaf has 48 × 10G server ports (480G) and 4 × 100G uplinks, one per spine (400G). Oversubscription = 480 ÷ 400 = 1.2:1. One spine fails: uplinks = 300G, oversubscription = 480 ÷ 300 = 1.6:1. With only 2 spines the same failure halves the uplink capacity. More spines means a smaller impact per failure, which is a key argument for four or more spines in production.</p></div>
<p>Classic modulo hashing may also move some flows between the <b>surviving</b> paths when the path count changes. Some platforms offer <b>resilient hashing</b>, which keeps surviving flows where they are and only moves the ones from the failed path.</p>

<div class="warn"><p><b>Common mistakes.</b> Hashing on IP addresses only in a VXLAN fabric. Assuming unequal utilisation means ECMP is broken when it is really a few elephant flows. Mixing link speeds so one path has a different cost. Forgetting BGP maximum-paths.</p></div>
<div class="exam"><p><b>Exam tip.</b> ECMP is per flow to avoid reordering. 5-tuple = src IP, dst IP, protocol, src port, dst port. VXLAN entropy comes from the outer UDP source port. Polarisation = identical hashing at consecutive tiers; fix with per-switch seeds. OSPF default maximum-paths on NX-OS = 8, BGP = 1.</p></div>

<div class="scn"><h4>The storage replication that used one spine</h4><p>Nightly replication between two storage arrays on LEAF3 and LEAF7 ran at half the expected speed. Both leaves showed ubest 4 to each other's VTEP, so routing was fine. Interface counters showed one spine uplink near 100% and the other three almost idle during the job. The replication used a single TCP session: one elephant flow, one hash result, one spine. The storage team enabled four parallel sessions, which produced four different flows and spread across the spines.</p><p><b>Lesson:</b> ECMP spreads flows, not bytes. One flow can never use more than one path's bandwidth.</p></div>

<div class="iv"><p class="q">"How does ECMP load balancing work in a VXLAN fabric, and what can make it uneven?"</p><p>Strong answer: the IGP or BGP installs one equal-cost next hop per spine; the hardware hashes each packet's 5-tuple so a flow always takes the same path and never reorders. Between two VTEPs the outer IPs and destination port are constant, so the sending VTEP puts entropy into the outer UDP source port from the inner headers. Uneven load comes from elephant flows, hashing without L4 ports, unequal costs removing a path, or polarisation across tiers. Mention flowlets and resilient hashing as advanced fixes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ECMP uses all spines by hashing each flow onto one of the equal-cost paths.</li>
<li>Per-flow hashing avoids TCP reordering; one flow never exceeds one path.</li>
<li>Include L4 ports in the hash: VXLAN entropy lives in the outer UDP source port.</li>
<li>Polarisation is avoided with per-switch seeds; flowlets rebalance elephants safely.</li>
<li>A spine failure removes one next hop; more spines means less capacity lost.</li>
</ul></div>
`,hi:`
<p>Chaar khuli lanes wala ek toll plaza socho. Attendant har car ko jo lane sabse chhoti ho usmein bhej sakta hai, lekin teen cars mein travel kar rahi ek family bikhar jaayegi aur alag order mein pahunchegi. Isliye plaza ek rule use karta hai: number plate ka last digit lane decide karta hai. Same convoy ki har car (same plate pattern) same lane leti hai aur order mein pahunchti hai, aur hazaron cars mein lanes lagbhag barabar bharti hain. Yahi <b>per-flow hashing ke saath ECMP</b> hai, aur isi tarah har spine-leaf fabric apne saare spines ek saath use karta hai.</p>

<h3>Kitne paths?</h3>
<p>Routing protocol decide karta hai ki kaunse paths equal hain; hardware decide karta hai ki woh kitne use kar sakta hai. Leaf par remote loopback tak equal paths ki ginti spines ki ginti ke barabar hoti hai (agar har spine tak ek se zyada parallel links hain to unse multiply).</p>
<ul>
<li><b>NX-OS par OSPF aur IS-IS</b> default mein <b>8</b> tak equal paths install karte hain; routing process ke neeche <code>maximum-paths</code> ise badhata hai (maximum platform aur release par depend karta hai).</li>
<li><b>BGP</b> default mein <b>1</b> install karta hai; aapko <code>maximum-paths</code> configure karna padta hai.</li>
<li>Saare paths ka metric exactly same hona chahiye. Ek uplink alag speed par, ya alag OSPF cost, aur woh ECMP se bahar ho jaata hai.</li>
</ul>

<h3>Per flow kyun, per packet kyun nahi</h3>
<p>Individual packets ko spines par round-robin baantna zyada fair lagta hai, lekin paths ka delay kabhi bilkul same nahi hota. Ek TCP connection ke packets out of order pahunchenge, TCP ise loss samjhega, duplicate ACKs bhejega, retransmit karega aur slow ho jaayega. Isliye switches ek <b>flow</b> ke har packet ko ek hi path par rakhte hain. Flow headers ke fields se pehchana jaata hai, aur ek <b>hash</b> function un fields ko path number mein badal deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flows do spines par hash hote hain">
<rect x="20" y="90" width="120" height="50" rx="6" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="80" y="129" text-anchor="middle" class="svg-muted" font-size="12">hash(5-tuple)</text>
<rect x="260" y="20" width="120" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="260" y="170" width="120" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="500" y="90" width="120" height="50" rx="6" fill="#bae6fd"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<line x1="140" y1="100" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="380" y1="40" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="140" y1="130" x2="260" y2="190" stroke="#64748b" stroke-width="2"/><line x1="380" y1="190" x2="500" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" class="svg-accent" font-size="12">flows A, C</text><text x="150" y="185" class="svg-accent" font-size="12">flows B, D</text>
</svg><p class="cap">Flow A ka har packet SPINE1 se jaata hai; flow B SPINE2 se. Kai flows mein dono spines lagbhag aadha-aadha le jaate hain.</p></div>

<h3>Hash inputs: 5-tuple</h3>
<p>Classic inputs <b>5-tuple</b> hain: source IP, destination IP, IP protocol, source port aur destination port. NX-OS par aap fields globally choose karte ho:</p>
<pre class="code">ip load-sharing address source-destination port source-destination</pre>
<pre class="out">LEAF1# show ip load-sharing
IPv4/IPv6 ECMP load sharing:
Universal-id (Random Seed): 3149671889
<span class="hl">Load-share mode : address source-destination port source-destination</span></pre>
<p>VXLAN fabric mein ports bahut zyada matter karte hain. Do leaves ke beech har VXLAN packet ka same outer source IP (VTEP 10.254.0.1), same outer destination IP (10.254.0.2), same protocol (UDP) aur same destination port (4789) hota hai. Agar underlay sirf IP addresses par hash kare, to do leaves ke beech ka <b>saara</b> traffic ek spine use karega. VXLAN ise <b>entropy</b> se solve karta hai: bhejne wala VTEP outer UDP <b>source port</b> ko inner packet ke headers ke hash se set karta hai (RFC 7348). Alag inner flows ko alag source ports milte hain, aur underlay ka 5-tuple hash unhe baant deta hai.</p>

<div class="eg"><p><b>Worked example: ports kyun matter karte hain.</b> LEAF1 aur LEAF2 ke beech 1,000 VM-to-VM flows chal rahe hain. Sirf addresses par hashing: saare 1,000 ke outer IPs identical hain, isliye sab ek spine se jaate hain: 100% / 0%. Addresses aur ports par hashing: har flow ka outer UDP source port alag hai (jaise 49,152 se 65,535), isliye split lagbhag 500 / 500 hai. Same fabric, same links, double usable bandwidth, sirf hash fields se.</p></div>

<h3>Polarisation</h3>
<p><b>Hash polarisation</b> tab hota hai jab line mein kai switches same hash function, same fields aur same seed use karte hain. Pehla switch "even" result wale saare flows path 0 par bhejta hai. Agle tier par wahi flows phir se wahi "even" result dete hain, isliye woh wahan bhi saare path 0 lete hain, aur second tier ke aadhe links khaali baithe rehte hain. Yeh multi-tier designs (leaf, spine, super-spine) aur purane platforms mein sabse zyada matter karta hai. Ilaaj hai har switch ko alag tarah se hash karwana: NX-OS hash mein ek per-switch <b>universal-id</b> (upar dikha random seed) milata hai, aur aap har tier par fields bhi badal sakte ho.</p>

<h3>Elephants, mice aur flowlets</h3>
<p>Per-flow hashing flows ki <b>ginti</b> balance karta hai, unka size nahi. Kuch bade long-lived flows (<b>elephants</b>, jaise backup ya storage replication) same spine par aa sakte hain jabki hazaron chhote <b>mice</b> flows dusre ko share karte hain. Tab link utilisation uneven dikhta hai jabki ECMP "kaam kar raha" hai.</p>
<p><b>Flowlet</b> ek flow ke andar packets ka ek burst hai, jo agle burst se ek idle gap se alag hota hai. Agar gap do paths ke delay difference se lamba hai, to agla burst bina reordering ke kam loaded path par move kiya ja sakta hai. Cisco yeh idea ACI dynamic load balancing mein aur AI aur storage fabrics ke liye naye Nexus 9000 features mein use karta hai. Exam ke liye concept jaano: flowlet switching bade flows ko safely rebalance karta hai, packets nahi balki bursts move karke.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show ip route 10.254.0.2
10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 02:11:05, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 02:11:05, ospf-UNDERLAY, intra</span>

LEAF1# show interface Ethernet1/1 | include rate
  30 seconds input rate 38112004 bits/sec, 4102 packets/sec
  30 seconds output rate 41980232 bits/sec, 4410 packets/sec
LEAF1# show interface Ethernet1/2 | include rate
  30 seconds input rate 36877112 bits/sec, 3988 packets/sec
  30 seconds output rate 40115376 bits/sec, 4290 packets/sec</pre>
<p>Table mein do next hops, aur dono uplinks par milte-julte rates: ECMP healthy hai. <code>show routing hash</code> ke baad source aur destination address dene par pata chalta hai ki switch us flow ke liye kaunsa path chunega.</p>

<h3>Spine fail hone par kya hota hai</h3>
<p>Jab SPINE1 mar jaata hai, LEAF1 ka link Ethernet1/1 down ho jaata hai. OSPF 10.1.1.0 ko next hop se hata deta hai aur route ubest 1 par aa jaata hai. Jo flows SPINE2 par the unhe koi disturbance nahi hota. Jo flows SPINE1 par the woh bache hue paths par re-hash hote hain. Kyunki backup path pehle se installed tha, yeh bahut tez hai; BFD ya direct link-down detection ke saath, ek second se kaafi kam.</p>
<div class="eg"><p><b>Worked example: failure ke baad capacity.</b> Ek leaf mein 48 × 10G server ports (480G) aur 4 × 100G uplinks hain, har spine ka ek (400G). Oversubscription = 480 ÷ 400 = 1.2:1. Ek spine fail: uplinks = 300G, oversubscription = 480 ÷ 300 = 1.6:1. Sirf 2 spines ke saath yahi failure uplink capacity aadhi kar deta hai. Zyada spines matlab har failure ka chhota impact, jo production mein chaar ya zyada spines ka ek key argument hai.</p></div>
<p>Classic modulo hashing path count badalne par kuch flows ko <b>bache hue</b> paths ke beech bhi move kar sakta hai. Kuch platforms <b>resilient hashing</b> dete hain, jo surviving flows ko wahin rakhta hai aur sirf failed path wale flows ko move karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> VXLAN fabric mein sirf IP addresses par hashing. Uneven utilisation ko ECMP broken samajhna jabki asal mein kuch elephant flows hain. Link speeds mix karna jisse ek path ki cost alag ho jaaye. BGP maximum-paths bhool jaana.</p></div>
<div class="exam"><p><b>Exam tip.</b> Reordering se bachne ke liye ECMP per flow hai. 5-tuple = src IP, dst IP, protocol, src port, dst port. VXLAN entropy outer UDP source port se aati hai. Polarisation = consecutive tiers par identical hashing; per-switch seeds se fix karo. NX-OS par OSPF default maximum-paths = 8, BGP = 1.</p></div>

<div class="scn"><h4>Storage replication jo ek spine use karta tha</h4><p>LEAF3 aur LEAF7 par do storage arrays ke beech nightly replication expected speed ke aadhe par chal raha tha. Dono leaves ek dusre ke VTEP tak ubest 4 dikha rahe the, isliye routing theek thi. Job ke dauraan interface counters ne dikhaya ki ek spine uplink 100% ke paas tha aur baaki teen lagbhag khaali. Replication ek single TCP session use karta tha: ek elephant flow, ek hash result, ek spine. Storage team ne chaar parallel sessions enable kiye, jisse chaar alag flows bane aur spines par bat gaye.</p><p><b>Seekh:</b> ECMP flows baant-ta hai, bytes nahi. Ek flow kabhi ek path ki bandwidth se zyada use nahi kar sakta.</p></div>

<div class="iv"><p class="q">"VXLAN fabric mein ECMP load balancing kaise kaam karta hai, aur ise uneven kya bana sakta hai?"</p><p>Strong answer: IGP ya BGP har spine ka ek equal-cost next hop install karta hai; hardware har packet ka 5-tuple hash karta hai taaki flow hamesha same path le aur kabhi reorder na ho. Do VTEPs ke beech outer IPs aur destination port constant hote hain, isliye bhejne wala VTEP inner headers se outer UDP source port mein entropy daalta hai. Uneven load elephant flows, L4 ports ke bina hashing, unequal costs jo path hata dein, ya tiers ke across polarisation se aata hai. Advanced fixes ki tarah flowlets aur resilient hashing ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ECMP har flow ko equal-cost paths mein se ek par hash karke saare spines use karta hai.</li>
<li>Per-flow hashing TCP reordering se bachata hai; ek flow kabhi ek path se zyada nahi le sakta.</li>
<li>Hash mein L4 ports shaamil karo: VXLAN entropy outer UDP source port mein rehti hai.</li>
<li>Polarisation per-switch seeds se bachta hai; flowlets elephants ko safely rebalance karte hain.</li>
<li>Spine failure ek next hop hata deta hai; zyada spines matlab kam capacity loss.</li>
</ul></div>
`}};export{e as default};