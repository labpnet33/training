var e={id:`anycast-rp-msdp`,h:{en:`Anycast RP and MSDP`,hi:`Anycast RP aur MSDP`},body:{en:`
<p>A national helpline has one phone number, 1800-XXX, but calls are answered in Mumbai or in Bengaluru, whichever centre is closer to the caller. If Mumbai goes down, all calls land in Bengaluru and nobody has to learn a new number. The two centres share a notice board, so an agent in Bengaluru knows what was logged in Mumbai. <b>Anycast RP</b> is that helpline, and <b>MSDP</b> is the shared notice board.</p>

<h3>The problem: one RP is a single point of failure</h3>
<p>With a static RP, if 2.2.2.2 dies, new receivers cannot build shared trees and new sources cannot register. Auto-RP and BSR fail over, but only after their timers expire, and they still place every source and receiver on one active RP at a time. Anycast RP gives <b>instant failover and load sharing</b> using the unicast routing table.</p>

<h3>How Anycast RP works</h3>
<ol>
<li>Two (or more) routers are configured with the <b>same RP address</b> on a loopback, for example 10.255.255.1/32, advertised into the IGP.</li>
<li>Every router uses <code>ip pim rp-address 10.255.255.1</code>. Unicast routing sends each router's joins and registers to the <b>closest</b> copy of that address.</li>
<li>Now the RPs are split: a source in Mumbai registers with RP-A, while a receiver in Bengaluru joined RP-B. RP-B has no idea the source exists. That gap is filled by <b>MSDP</b>.</li>
<li>If one RP fails, its route to 10.255.255.1 disappears, the IGP converges, RPF toward the RP now points to the survivor, and joins and registers flow there. Failover takes as long as the IGP.</li>
</ol>

<h3>MSDP: Multicast Source Discovery Protocol</h3>
<p><b>MSDP</b> connects RPs so they can tell each other about active sources.</p>
<dl class="terms">
<dt>Peering</dt><dd>A <b>TCP session on port 639</b> between RPs, configured on unique addresses (never the shared anycast address). The peer with the lower address opens the connection.</dd>
<dt>Source-Active (SA) message</dt><dd>When a source registers with an RP, that RP sends an SA to its MSDP peers containing <b>(source, group, originating RP)</b>. SAs are re-sent every 60 s while the source is active.</dd>
<dt>Acting on an SA</dt><dd>An RP that receives an SA and has a (*,G) with receivers for that group sends an <b>(S,G) join toward the source</b>, exactly as if the source had registered locally. Its receivers can then switch to the SPT as usual.</dd>
<dt>SA cache</dt><dd>IOS keeps received SAs in a cache so a receiver that joins later is served at once.</dd>
<dt>Peer-RPF check</dt><dd>To prevent SA loops, an SA is accepted only from the peer on the best path toward the originating RP. Peers in an <b>MSDP mesh group</b> (full mesh of RPs) skip this check and do not re-forward SAs to each other.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Anycast RP with MSDP">
<rect x="130" y="30" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="200" y="51" text-anchor="middle" class="svg-ink" font-size="13">RP-A (R2)</text><text x="200" y="68" text-anchor="middle" class="svg-muted" font-size="11">Lo0 2.2.2.2 / Lo1 10.255.255.1</text>
<rect x="370" y="30" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="440" y="51" text-anchor="middle" class="svg-ink" font-size="13">RP-B (R5)</text><text x="440" y="68" text-anchor="middle" class="svg-muted" font-size="11">Lo0 5.5.5.5 / Lo1 10.255.255.1</text>
<line x1="270" y1="54" x2="370" y2="54" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="46" text-anchor="middle" class="svg-accent" font-size="11">MSDP TCP 639</text>
<rect x="40" y="180" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="100" y="203" text-anchor="middle" class="svg-ink" font-size="12">Source (Mumbai)</text>
<rect x="480" y="180" width="130" height="36" rx="6" fill="#fde68a"/><text x="545" y="203" text-anchor="middle" class="svg-ink" font-size="12">Receiver (Blr)</text>
<line x1="100" y1="180" x2="180" y2="78" stroke="#64748b" stroke-width="2"/><text x="60" y="140" class="svg-muted" font-size="11">1. Register</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">2. SA (S,G, RP 2.2.2.2)</text>
<line x1="545" y1="180" x2="460" y2="78" stroke="#64748b" stroke-width="2"/><text x="520" y="140" class="svg-muted" font-size="11">(*,G) join</text>
<line x1="420" y1="78" x2="160" y2="190" stroke="#64748b" stroke-width="2"/><text x="300" y="160" class="svg-accent" font-size="11">3. RP-B joins (S,G) toward the source</text>
</svg><p class="cap">Each RP only knows its own registrations; MSDP SAs let RP-B learn about the Mumbai source and pull it.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! RP-A (R2). RP-B mirrors it with Lo0 5.5.5.5 and peer 2.2.2.2</span>
interface Loopback0
 ip address 2.2.2.2 255.255.255.255        <span class="c">! unique: MSDP, router ID</span>
 ip pim sparse-mode
interface Loopback1
 ip address 10.255.255.1 255.255.255.255   <span class="c">! shared anycast RP address</span>
 ip pim sparse-mode
router ospf 1
 router-id 2.2.2.2                         <span class="c">! never the anycast address</span>
 network 2.2.2.2 0.0.0.0 area 0
 network 10.255.255.1 0.0.0.0 area 0
ip pim rp-address 10.255.255.1
ip msdp peer 5.5.5.5 connect-source Loopback0
ip msdp originator-id Loopback0            <span class="c">! SAs carry 2.2.2.2, not the shared address</span>
<span class="c">! Every other router</span>
ip pim rp-address 10.255.255.1</pre>
<pre class="out">R2# show ip msdp summary
MSDP Peer Status Summary
Peer Address     AS    State    Uptime/  Reset SA    Peer Name
                                Downtime Count Count
<span class="hl">5.5.5.5          ?     Up       00:12:40 0     1     ?</span>

R5# show ip msdp sa-cache
MSDP Source-Active Cache - 1 entries
<span class="hl">(10.1.1.10, 239.10.10.10), RP 2.2.2.2, AS ?,00:02:10/00:05:49, Peer 2.2.2.2</span></pre>

<div class="eg"><p><b>Worked example.</b> RP-A and RP-B both own 10.255.255.1. Router R3 is 2 hops from RP-A and 4 from RP-B, so its joins go to RP-A. The studio source registers with RP-B (it is closer to RP-B). RP-B sends an SA "(10.1.1.10, 239.10.10.10), RP 5.5.5.5" to RP-A. RP-A has a (*,G) with R3's branch, so it joins toward 10.1.1.10 and forwards to R3. Now RP-B fails: OSPF withdraws its 10.255.255.1 route, the first-hop router's next register goes to RP-A, and RP-A already serves R3. No RP address changed anywhere.</p></div>

<h3>Beyond one network</h3>
<p>MSDP was designed for <b>inter-domain</b> multicast: each ISP runs its own RP, and MSDP peering between them (usually alongside MP-BGP for the multicast RPF) shares sources across the boundary without sharing an RP. NX-OS also supports PIM Anycast RP (RFC 4610), which syncs RPs with PIM registers instead of MSDP, but on IOS the classic design is MSDP.</p>

<div class="warn"><p><b>Common mistake.</b> Letting OSPF or BGP pick the anycast loopback as its router ID (it is the highest loopback address on both RPs). Two routers with the same OSPF router ID break adjacencies. Always hard-code the router ID, and peer MSDP on the unique loopback.</p></div>

<div class="exam"><p><b>Exam trap.</b> MSDP runs over <b>TCP 639</b> between RPs and carries <b>Source-Active</b> messages. It shares information about <b>sources</b>, never receivers. Anycast RP = same RP address on several routers + MSDP between them; failover relies on the unicast IGP.</p></div>

<div class="scn"><h4>Half the receivers see the stream</h4><p>After adding a second RP with the same anycast address, receivers near the new RP stopped getting the studio stream while receivers near the old RP were fine. <code>show ip msdp summary</code> on both RPs showed the peer "Down": the MSDP peer had been configured toward the anycast address 10.255.255.1, which is the router's own address, so TCP never connected. Re-pointing the peers to the unique Loopback0 addresses with <code>connect-source Loopback0</code> brought MSDP up and SAs flowed.</p><p><b>Lesson:</b> MSDP peers must use unique addresses; the anycast address is for PIM only.</p></div>

<div class="iv"><p class="q">"How do you make the RP redundant, and why is MSDP needed?"</p><p>Strong answer: Anycast RP. Configure the same /32 RP address on two routers, advertise it in the IGP, and point all routers to it; the IGP sends each join and register to the nearest RP and gives failover at IGP speed. Because sources and receivers may register with different RPs, the RPs peer with MSDP (TCP 639) on unique loopbacks and exchange Source-Active messages so an RP with receivers can join sources registered elsewhere. Mention originator-id and unique router IDs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast RP: two or more RPs share one /32 RP address; the IGP picks the nearest; failover at IGP speed.</li>
<li>MSDP (TCP 639) links RPs; SA messages announce (S,G) and originating RP.</li>
<li>An RP with receivers that learns an SA joins (S,G) toward the source.</li>
<li>Peer MSDP and set router IDs on unique loopbacks; use <code>ip msdp originator-id</code>.</li>
<li>Verify with <code>show ip msdp summary</code> and <code>show ip msdp sa-cache</code>.</li>
</ul></div>
`,hi:`
<p>Ek national helpline ka ek phone number hota hai, 1800-XXX, par calls Mumbai ya Bengaluru mein uthti hain, jo bhi centre caller ke zyada paas ho. Agar Mumbai down ho jaaye, saari calls Bengaluru pahunchti hain aur kisi ko naya number seekhna nahi padta. Dono centres ek notice board share karte hain, isliye Bengaluru ke agent ko pata hota hai Mumbai mein kya log hua. <b>Anycast RP</b> woh helpline hai, aur <b>MSDP</b> shared notice board.</p>

<h3>Problem: ek RP single point of failure hai</h3>
<p>Static RP ke saath agar 2.2.2.2 mar jaaye, naye receivers shared trees nahi bana sakte aur naye sources register nahi kar sakte. Auto-RP aur BSR failover karte hain, par sirf timers expire hone ke baad, aur tab bhi har source aur receiver ko ek samay mein ek active RP par rakhte hain. Anycast RP unicast routing table use karke <b>turant failover aur load sharing</b> deta hai.</p>

<h3>Anycast RP kaise kaam karta hai</h3>
<ol>
<li>Do (ya zyada) routers ek loopback par <b>same RP address</b> ke saath configure hote hain, jaise 10.255.255.1/32, jo IGP mein advertise hota hai.</li>
<li>Har router <code>ip pim rp-address 10.255.255.1</code> use karta hai. Unicast routing har router ke joins aur registers us address ki <b>sabse paas</b> wali copy par bhejti hai.</li>
<li>Ab RPs batt gaye: Mumbai ka source RP-A ke saath register karta hai, jabki Bengaluru ke receiver ne RP-B join kiya. RP-B ko pata hi nahi ki source exist karta hai. Yeh gap <b>MSDP</b> bharta hai.</li>
<li>Agar ek RP fail ho, uska 10.255.255.1 route gayab ho jaata hai, IGP converge hota hai, RP ki taraf RPF ab bache hue RP ko point karta hai, aur joins aur registers wahan jaate hain. Failover utna hi time leta hai jitna IGP.</li>
</ol>

<h3>MSDP: Multicast Source Discovery Protocol</h3>
<p><b>MSDP</b> RPs ko jodta hai taaki woh ek doosre ko active sources ke baare mein bata sakein.</p>
<dl class="terms">
<dt>Peering</dt><dd>RPs ke beech <b>port 639 par TCP session</b>, unique addresses par configure (shared anycast address par kabhi nahi). Chhote address wala peer connection kholta hai.</dd>
<dt>Source-Active (SA) message</dt><dd>Jab source kisi RP ke saath register karta hai, woh RP apne MSDP peers ko SA bhejta hai jismein <b>(source, group, originating RP)</b> hota hai. Source active rehne tak SAs har 60 s dobara bheje jaate hain.</dd>
<dt>SA par action</dt><dd>Jis RP ko SA milta hai aur jiske paas us group ke receivers wala (*,G) hai, woh <b>source ki taraf (S,G) join</b> bhejta hai, bilkul waise jaise source ne local register kiya ho. Phir uske receivers hamesha ki tarah SPT par switch kar sakte hain.</dd>
<dt>SA cache</dt><dd>IOS mile hue SAs ko cache mein rakhta hai taaki baad mein join karne wale receiver ko turant serve kiya ja sake.</dd>
<dt>Peer-RPF check</dt><dd>SA loops rokne ke liye SA sirf us peer se accept hota hai jo originating RP ki taraf best path par hai. <b>MSDP mesh group</b> (RPs ka full mesh) ke peers yeh check skip karte hain aur ek doosre ko SAs dobara forward nahi karte.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Anycast RP with MSDP">
<rect x="130" y="30" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="200" y="51" text-anchor="middle" class="svg-ink" font-size="13">RP-A (R2)</text><text x="200" y="68" text-anchor="middle" class="svg-muted" font-size="11">Lo0 2.2.2.2 / Lo1 10.255.255.1</text>
<rect x="370" y="30" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="440" y="51" text-anchor="middle" class="svg-ink" font-size="13">RP-B (R5)</text><text x="440" y="68" text-anchor="middle" class="svg-muted" font-size="11">Lo0 5.5.5.5 / Lo1 10.255.255.1</text>
<line x1="270" y1="54" x2="370" y2="54" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="46" text-anchor="middle" class="svg-accent" font-size="11">MSDP TCP 639</text>
<rect x="40" y="180" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="100" y="203" text-anchor="middle" class="svg-ink" font-size="12">Source (Mumbai)</text>
<rect x="480" y="180" width="130" height="36" rx="6" fill="#fde68a"/><text x="545" y="203" text-anchor="middle" class="svg-ink" font-size="12">Receiver (Blr)</text>
<line x1="100" y1="180" x2="180" y2="78" stroke="#64748b" stroke-width="2"/><text x="60" y="140" class="svg-muted" font-size="11">1. Register</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">2. SA (S,G, RP 2.2.2.2)</text>
<line x1="545" y1="180" x2="460" y2="78" stroke="#64748b" stroke-width="2"/><text x="520" y="140" class="svg-muted" font-size="11">(*,G) join</text>
<line x1="420" y1="78" x2="160" y2="190" stroke="#64748b" stroke-width="2"/><text x="300" y="160" class="svg-accent" font-size="11">3. RP-B source ki taraf (S,G) join</text>
</svg><p class="cap">Har RP sirf apne registrations jaanta hai; MSDP SAs se RP-B Mumbai source ke baare mein seekhta hai aur use kheenchta hai.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! RP-A (R2). RP-B iska mirror hai, Lo0 5.5.5.5 aur peer 2.2.2.2 ke saath</span>
interface Loopback0
 ip address 2.2.2.2 255.255.255.255        <span class="c">! unique: MSDP, router ID</span>
 ip pim sparse-mode
interface Loopback1
 ip address 10.255.255.1 255.255.255.255   <span class="c">! shared anycast RP address</span>
 ip pim sparse-mode
router ospf 1
 router-id 2.2.2.2                         <span class="c">! kabhi anycast address nahi</span>
 network 2.2.2.2 0.0.0.0 area 0
 network 10.255.255.1 0.0.0.0 area 0
ip pim rp-address 10.255.255.1
ip msdp peer 5.5.5.5 connect-source Loopback0
ip msdp originator-id Loopback0            <span class="c">! SAs mein 2.2.2.2 jaata hai, shared address nahi</span>
<span class="c">! Baaki har router</span>
ip pim rp-address 10.255.255.1</pre>
<pre class="out">R2# show ip msdp summary
MSDP Peer Status Summary
Peer Address     AS    State    Uptime/  Reset SA    Peer Name
                                Downtime Count Count
<span class="hl">5.5.5.5          ?     Up       00:12:40 0     1     ?</span>

R5# show ip msdp sa-cache
MSDP Source-Active Cache - 1 entries
<span class="hl">(10.1.1.10, 239.10.10.10), RP 2.2.2.2, AS ?,00:02:10/00:05:49, Peer 2.2.2.2</span></pre>

<div class="eg"><p><b>Worked example.</b> RP-A aur RP-B dono 10.255.255.1 ke maalik hain. Router R3 RP-A se 2 hops aur RP-B se 4 hops door hai, isliye uske joins RP-A jaate hain. Studio source RP-B ke saath register karta hai (woh RP-B ke zyada paas hai). RP-B RP-A ko SA "(10.1.1.10, 239.10.10.10), RP 5.5.5.5" bhejta hai. RP-A ke paas R3 ki shaakh wala (*,G) hai, isliye woh 10.1.1.10 ki taraf join karta hai aur R3 ko forward karta hai. Ab RP-B fail hota hai: OSPF uska 10.255.255.1 route withdraw karta hai, first-hop router ka agla register RP-A jaata hai, aur RP-A pehle se R3 ko serve kar raha hai. Kahin bhi RP address nahi badla.</p></div>

<h3>Ek network se aage</h3>
<p>MSDP <b>inter-domain</b> multicast ke liye design hua tha: har ISP apna RP chalata hai, aur unke beech MSDP peering (aam taur par multicast RPF ke liye MP-BGP ke saath) RP share kiye bina boundary ke paar sources share karti hai. NX-OS PIM Anycast RP (RFC 4610) bhi support karta hai, jo MSDP ki jagah PIM registers se RPs sync karta hai, par IOS par classic design MSDP hai.</p>

<div class="warn"><p><b>Common galti.</b> OSPF ya BGP ko anycast loopback ko apna router ID chunne dena (dono RPs par woh sabse bada loopback address hota hai). Same OSPF router ID wale do routers adjacencies tod dete hain. Router ID hamesha hard-code karo, aur MSDP unique loopback par peer karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> MSDP RPs ke beech <b>TCP 639</b> par chalta hai aur <b>Source-Active</b> messages le jaata hai. Yeh <b>sources</b> ki jaankari share karta hai, receivers ki kabhi nahi. Anycast RP = kai routers par same RP address + unke beech MSDP; failover unicast IGP par nirbhar hai.</p></div>

<div class="scn"><h4>Aadhe receivers ko stream dikhta hai</h4><p>Same anycast address wala doosra RP jodne ke baad naye RP ke paas wale receivers ko studio stream milna band ho gaya jabki purane RP ke paas wale theek the. Dono RPs par <code>show ip msdp summary</code> peer ko "Down" dikha raha tha: MSDP peer anycast address 10.255.255.1 ki taraf configure hua tha, jo router ka apna address hai, isliye TCP kabhi connect nahi hua. <code>connect-source Loopback0</code> ke saath peers ko unique Loopback0 addresses par point karne se MSDP up hua aur SAs behne lage.</p><p><b>Seekh:</b> MSDP peers unique addresses use karein; anycast address sirf PIM ke liye hai.</p></div>

<div class="iv"><p class="q">"RP ko redundant kaise banaoge, aur MSDP kyun chahiye?"</p><p>Strong answer: Anycast RP. Do routers par same /32 RP address configure karo, IGP mein advertise karo, aur saare routers ko us par point karo; IGP har join aur register ko sabse paas wale RP par bhejta hai aur IGP speed par failover deta hai. Kyunki sources aur receivers alag RPs ke saath register ho sakte hain, RPs unique loopbacks par MSDP (TCP 639) se peer karte hain aur Source-Active messages exchange karte hain taaki receivers wala RP kahin aur registered sources ko join kar sake. originator-id aur unique router IDs ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast RP: do ya zyada RPs ek /32 RP address share karte hain; IGP sabse paas wala chunta hai; IGP speed par failover.</li>
<li>MSDP (TCP 639) RPs ko jodta hai; SA messages (S,G) aur originating RP announce karte hain.</li>
<li>Receivers wala RP SA seekhne par source ki taraf (S,G) join karta hai.</li>
<li>MSDP peering aur router IDs unique loopbacks par rakho; <code>ip msdp originator-id</code> use karo.</li>
<li><code>show ip msdp summary</code> aur <code>show ip msdp sa-cache</code> se verify karo.</li>
</ul></div>
`}};export{e as default};