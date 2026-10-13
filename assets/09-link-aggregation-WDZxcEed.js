var e={id:`link-aggregation`,h:{en:`Link aggregation with LACP`,hi:`LACP ke saath link aggregation`},body:{en:`
<h3>The analogy: turning two narrow roads into one highway</h3>
<p>Two towns are joined by two parallel single-lane roads. The traffic police, worried about cars circling between them, close one road with a barrier (that is spanning tree from the last chapter). Now half the capacity sits unused. A better idea is to declare both roads one highway with two lanes, run by one authority. Cars choose a lane, both lanes carry traffic, and if one lane is closed for repairs the highway stays open. <b>Link aggregation</b> does exactly this: it bundles several physical links into one logical link.</p>

<h3>What link aggregation gives you</h3>
<p>A <b>link aggregation group (LAG)</b> treats two to eight (sometimes more) physical ports as one logical interface. Vendors call it a <b>port-channel</b> or <b>EtherChannel</b> on Cisco-style gear, a <b>LAG</b> or <b>trunk</b> on others, and <b>bonding</b> or <b>NIC teaming</b> on servers. The benefits:</p>
<ul>
<li><b>More bandwidth</b>: two 10 Gb/s links give up to 20 Gb/s of total capacity.</li>
<li><b>Redundancy</b>: if one member fails, traffic moves to the rest in well under a second, with no STP recalculation.</li>
<li><b>No blocked links</b>: STP sees one logical port, so nothing inside the bundle is blocked.</li>
</ul>

<h3>LACP: the negotiation protocol</h3>
<p>The IEEE standard is <b>802.3ad</b>, now maintained as <b>802.1AX</b>. It defines <b>LACP</b> (Link Aggregation Control Protocol). Both ends exchange LACP messages to confirm they are connected to the same partner and agree on the bundle, which prevents mis-cabling from creating a loop. LACP has two modes:</p>
<table class="cmp"><tr><th>Side A</th><th>Side B</th><th>Result</th></tr>
<tr><td>active</td><td>active</td><td>Bundle forms (recommended)</td></tr>
<tr><td>active</td><td>passive</td><td>Bundle forms</td></tr>
<tr><td>passive</td><td>passive</td><td><b>No bundle</b>: both wait, nobody starts</td></tr>
<tr><td>on (static)</td><td>on (static)</td><td>Bundle with no negotiation (risky)</td></tr>
<tr><td>on</td><td>active</td><td><b>No bundle</b>: static does not speak LACP</td></tr>
</table>
<p>Cisco also has an older proprietary protocol, <b>PAgP</b>, with modes desirable and auto. Prefer LACP: it is vendor-neutral and works with servers, firewalls and other vendors' switches.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Port-channel between two switches">
<rect x="30" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="14">DIST1</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0/47-48</text>
<rect x="460" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0/47-48</text>
<ellipse cx="320" cy="95" rx="150" ry="34" fill="#fde68a"/>
<line x1="180" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="3"/><line x1="180" y1="105" x2="460" y2="105" stroke="#64748b" stroke-width="3"/>
<text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Port-channel 1 (LACP active)</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">One logical trunk; STP sees one port; each flow hashed to one member</text>
</svg><p class="cap">Two physical links, one logical interface: more bandwidth and instant failover.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! On DIST1 (repeat the same on ACC1)</span>
interface range GigabitEthernet1/0/47 - 48
 channel-group 1 mode active
<span class="c">! Configure trunk settings on the logical interface</span>
interface Port-channel1
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,150,999</pre>
<pre class="out">DIST1#show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)         LACP      Gi1/0/47(P) Gi1/0/48(P)</span></pre>
<p>Read the flags: <code>SU</code> means a layer 2 port-channel that is in use, and <code>(P)</code> on each member means it is bundled. Bad signs are <code>(I)</code> stand-alone (the other side is not running LACP), <code>(s)</code> suspended (a settings mismatch), and <code>(D)</code> down.</p>

<h3>Load balancing: per flow, not per packet</h3>
<p>A LAG does not split one conversation across links. The switch runs a <b>hash</b> on header fields (source/destination MAC, IP, and sometimes layer 4 ports) and sends every frame of a flow over the same member, which keeps frames in order. So many flows spread across the members, but <b>one single flow never exceeds the speed of one member</b>. A single backup job over a 2 x 10 Gb/s bundle still tops out near 10 Gb/s.</p>

<div class="eg"><p><b>Worked example.</b> An access switch has 40 users and two 1 Gb/s uplinks bundled into Po1. Total capacity is 2 Gb/s. If most traffic goes to one server and the hash uses only destination MAC, every flow lands on the same member and the other sits idle. Changing the hash to source and destination IP (<code>port-channel load-balance src-dst-ip</code> on many platforms) spreads flows over both links.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Member ports with different speed, duplex, access/trunk mode, allowed VLANs or native VLAN: they are suspended. (2) Both ends in passive mode. (3) Using static <code>on</code> on one side and LACP on the other. (4) Cabling members of one bundle to two different switches that are not configured as a multi-chassis pair (MLAG, vPC or a stack).</p></div>

<div class="exam"><p><b>Exam traps.</b> LACP is IEEE <b>802.3ad / 802.1AX</b>; PAgP is Cisco-only. Active + passive works; passive + passive does not. Link aggregation increases total bandwidth and adds redundancy but a single flow uses one link. STP treats the bundle as one link. Members must have matching settings.</p></div>

<div class="scn"><h4>The uplink that only used half its capacity</h4><p>A school's new wing had two fibres to the core, but monitoring showed one fibre at 95% during exams while the other was nearly idle. <code>show etherchannel summary</code> showed only one member as <code>(P)</code> and the other as <code>(s)</code>. Comparing configs showed the second port was missing VLAN 150 in its allowed list, because an engineer had edited the physical interface instead of Port-channel1. After removing the per-member trunk commands and keeping all trunk settings on the port-channel, both members bundled and load was shared.</p><p><b>Lesson:</b> configure trunk and VLAN settings on the logical port-channel, and check that every member shows (P).</p></div>

<div class="iv"><p class="q">"Why use LACP instead of just connecting two links between switches?"</p><p>Strong answer: without aggregation, STP blocks the second link, so you get redundancy but no extra bandwidth and slower failover. LACP bundles both into one logical link, so both carry traffic, failover is sub-second and STP sees a single port. LACP also validates that both ends agree, which protects against miscabling. Mention per-flow hashing, matching member settings, and that bundles to two switches need MLAG or a stack.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Link aggregation bundles several physical links into one logical interface (port-channel, LAG, bond).</li>
<li>LACP (802.3ad/802.1AX) negotiates the bundle; use active on at least one side, ideally both.</li>
<li>Members must match in speed, duplex, mode and VLAN settings; configure trunks on the port-channel.</li>
<li>Traffic is shared per flow by a hash; one flow never exceeds one member's speed.</li>
<li>Verify with <code>show etherchannel summary</code>: look for SU and (P).</li>
</ul></div>
`,hi:`
<h3>Analogy: do patli sadkon ko ek highway banana</h3>
<p>Do shehar do parallel single-lane sadkon se jude hain. Traffic police, is dar se ki gaadiyan unke beech gol ghoomengi, ek sadak par barrier laga kar use band kar deti hai (yahi pichhle chapter ka spanning tree hai). Ab aadhi capacity bekaar padi hai. Behtar idea hai dono sadkon ko ek do-lane highway declare karna, jise ek authority chalaye. Gaadiyan lane chunti hain, dono lanes traffic le jaati hain, aur agar ek lane repair ke liye band ho, highway khula rehta hai. <b>Link aggregation</b> bilkul yahi karta hai: kai physical links ko ek logical link mein bundle karta hai.</p>

<h3>Link aggregation aapko kya deta hai</h3>
<p><b>Link aggregation group (LAG)</b> do se aath (kabhi zyada) physical ports ko ek logical interface ki tarah treat karta hai. Cisco-style gear par vendors ise <b>port-channel</b> ya <b>EtherChannel</b> kehte hain, doosron par <b>LAG</b> ya <b>trunk</b>, aur servers par <b>bonding</b> ya <b>NIC teaming</b>. Fayde:</p>
<ul>
<li><b>Zyada bandwidth</b>: do 10 Gb/s links 20 Gb/s tak total capacity dete hain.</li>
<li><b>Redundancy</b>: ek member fail ho to traffic ek second se bhi kam mein baaki par chala jaata hai, bina STP recalculation ke.</li>
<li><b>Koi blocked link nahi</b>: STP ek logical port dekhta hai, isliye bundle ke andar kuch block nahi hota.</li>
</ul>

<h3>LACP: negotiation protocol</h3>
<p>IEEE standard <b>802.3ad</b> hai, jo ab <b>802.1AX</b> ke roop mein maintain hota hai. Yeh <b>LACP</b> (Link Aggregation Control Protocol) define karta hai. Dono ends LACP messages exchange karke confirm karte hain ki woh same partner se jude hain aur bundle par agree karte hain, jisse galat cabling se loop nahi banta. LACP ke do modes hain:</p>
<table class="cmp"><tr><th>Side A</th><th>Side B</th><th>Result</th></tr>
<tr><td>active</td><td>active</td><td>Bundle banta hai (recommended)</td></tr>
<tr><td>active</td><td>passive</td><td>Bundle banta hai</td></tr>
<tr><td>passive</td><td>passive</td><td><b>Koi bundle nahi</b>: dono wait karte hain, koi shuru nahi karta</td></tr>
<tr><td>on (static)</td><td>on (static)</td><td>Bina negotiation bundle (risky)</td></tr>
<tr><td>on</td><td>active</td><td><b>Koi bundle nahi</b>: static LACP nahi bolta</td></tr>
</table>
<p>Cisco ka ek purana proprietary protocol <b>PAgP</b> bhi hai, modes desirable aur auto ke saath. LACP ko prefer karo: yeh vendor-neutral hai aur servers, firewalls aur doosre vendors ke switches ke saath kaam karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Do switches ke beech port-channel">
<rect x="30" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="14">DIST1</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0/47-48</text>
<rect x="460" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="14">ACC1</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">Gi1/0/47-48</text>
<ellipse cx="320" cy="95" rx="150" ry="34" fill="#fde68a"/>
<line x1="180" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="3"/><line x1="180" y1="105" x2="460" y2="105" stroke="#64748b" stroke-width="3"/>
<text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Port-channel 1 (LACP active)</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Ek logical trunk; STP ek port dekhta hai; har flow ek member par hash</text>
</svg><p class="cap">Do physical links, ek logical interface: zyada bandwidth aur turant failover.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! DIST1 par (ACC1 par bhi yahi repeat karo)</span>
interface range GigabitEthernet1/0/47 - 48
 channel-group 1 mode active
<span class="c">! Trunk settings logical interface par configure karo</span>
interface Port-channel1
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,150,999</pre>
<pre class="out">DIST1#show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)         LACP      Gi1/0/47(P) Gi1/0/48(P)</span></pre>
<p>Flags padho: <code>SU</code> ka matlab layer 2 port-channel jo in use hai, aur har member par <code>(P)</code> ka matlab woh bundled hai. Bure signs hain <code>(I)</code> stand-alone (doosri side LACP nahi chala rahi), <code>(s)</code> suspended (settings mismatch), aur <code>(D)</code> down.</p>

<h3>Load balancing: per flow, per packet nahi</h3>
<p>LAG ek conversation ko links mein nahi baantta. Switch header fields (source/destination MAC, IP, aur kabhi layer 4 ports) par <b>hash</b> chalata hai aur ek flow ke har frame ko same member par bhejta hai, jisse frames order mein rehte hain. Isliye kai flows members par fail jaate hain, lekin <b>ek single flow kabhi ek member ki speed se zyada nahi jaata</b>. 2 x 10 Gb/s bundle par ek single backup job phir bhi lagbhag 10 Gb/s par ruk jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek access switch par 40 users hain aur do 1 Gb/s uplinks Po1 mein bundled hain. Total capacity 2 Gb/s hai. Agar zyada tar traffic ek server ko jaata hai aur hash sirf destination MAC use karta hai, to har flow same member par aata hai aur doosra khaali baitha rehta hai. Hash ko source aur destination IP par badalne se (kai platforms par <code>port-channel load-balance src-dst-ip</code>) flows dono links par fail jaate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Member ports mein alag speed, duplex, access/trunk mode, allowed VLANs ya native VLAN: woh suspend ho jaate hain. (2) Dono ends passive mode mein. (3) Ek side static <code>on</code> aur doosri side LACP. (4) Ek bundle ke members ko do alag switches par cable karna jo multi-chassis pair (MLAG, vPC ya stack) ki tarah configure nahi hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> LACP IEEE <b>802.3ad / 802.1AX</b> hai; PAgP sirf Cisco ka hai. Active + passive chalta hai; passive + passive nahi. Link aggregation total bandwidth badhata hai aur redundancy jodta hai lekin single flow ek link use karta hai. STP bundle ko ek link ki tarah treat karta hai. Members ki settings match honi chahiye.</p></div>

<div class="scn"><h4>Uplink jo apni aadhi capacity hi use karta tha</h4><p>Ek school ke naye wing mein core tak do fibres the, lekin monitoring mein exams ke dauraan ek fibre 95% par tha jabki doosra lagbhag khaali. <code>show etherchannel summary</code> mein sirf ek member <code>(P)</code> tha aur doosra <code>(s)</code>. Configs compare karne par pata chala ki doosre port ki allowed list mein VLAN 150 missing tha, kyunki ek engineer ne Port-channel1 ki jagah physical interface edit kar diya tha. Per-member trunk commands hata kar saari trunk settings port-channel par rakhne ke baad dono members bundle hue aur load share hone laga.</p><p><b>Seekh:</b> trunk aur VLAN settings logical port-channel par configure karo, aur check karo ki har member (P) dikhaye.</p></div>

<div class="iv"><p class="q">"Switches ke beech sirf do links jodne ki jagah LACP kyun use karein?"</p><p>Strong answer: aggregation ke bina STP doosra link block karta hai, isliye redundancy milti hai lekin extra bandwidth nahi aur failover slow hota hai. LACP dono ko ek logical link mein bundle karta hai, isliye dono traffic le jaate hain, failover sub-second hota hai aur STP ek single port dekhta hai. LACP yeh bhi validate karta hai ki dono ends agree karte hain, jo miscabling se bachata hai. Per-flow hashing, matching member settings, aur yeh mention karo ki do switches tak ke bundles ko MLAG ya stack chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Link aggregation kai physical links ko ek logical interface (port-channel, LAG, bond) mein bundle karta hai.</li>
<li>LACP (802.3ad/802.1AX) bundle negotiate karta hai; kam se kam ek side active rakho, ideally dono.</li>
<li>Members ki speed, duplex, mode aur VLAN settings match honi chahiye; trunks port-channel par configure karo.</li>
<li>Traffic hash se per flow share hota hai; ek flow kabhi ek member ki speed se zyada nahi jaata.</li>
<li><code>show etherchannel summary</code> se verify karo: SU aur (P) dekho.</li>
</ul></div>
`}};export{e as default};